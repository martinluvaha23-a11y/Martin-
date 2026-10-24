/* ═══════════════════════════════════════════════════════════════════
   TEACHER BOOKLIST STUDIO — hub with Teachers, Grades, Publishers,
   Allocation, View, Returned registry, Checklist and Exports.
   Own KV blobs (tblGrades, tblAllocations); publishers + letterhead are
   SHARED with the Learners Booklist. Allocations are permanent records:
   deleting a teacher from the registry never removes them.
   NEVER touches exams/students/scores.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var TB_GRADES_SEED = ['PLAYGROUP', 'PP1', 'PP2', 'GRADE 1', 'GRADE 2', 'GRADE 3',
  'GRADE 4', 'GRADE 5', 'GRADE 6', 'GRADE 7', 'GRADE 8', 'GRADE 9'];
var TB_LEVELS = [
  { v: 'lp', label: 'Lower Primary' },
  { v: 'upjs', label: 'Upper Primary & Junior School' }
];
var TB = { view: 'hub', form: null, ret: { level: 'upjs', teacherId: '' },
           check: { teacherId: '' }, expA: { level: 'upjs', teacherId: '', orient: 'portrait' },
           expR: { level: 'upjs', teacherId: '', orient: 'portrait' } };

function tbEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}
function tbDb(){
  if(!window.db) window.db = {};
  return window.db;
}
function tbPersist(){
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function'){ try{ updateCounts(); }catch(e){} }
}
function tbFmt(name){
  try{ if(typeof fmtTeacher === 'function') return fmtTeacher(name); }catch(e){}
  return name;
}
function tbLevelOf(t){
  try{ if(typeof teacherLevel === 'function') return teacherLevel(t); }catch(e){}
  return 'none';
}
function tbLevelLabel(v){
  return v === 'lp' ? 'Lower Primary' : 'Upper Primary & Junior School';
}
/* Stream-stripped grade base: 4E → GRADE 4, GRADE 4E → GRADE 4
   (PLAYGROUP / PP1 / PP2 and other non-stream codes pass through). */
function tbGradeBase(cls){
  var c = String(cls || '').trim().toUpperCase();
  if(!c) return c;
  if(/PLAYGROUP|^PP\s*1|^PP1|^PP\s*2|^PP2/.test(c)) return c;
  var m = c.match(/GRADE\s*([1-9])/);
  if(m) return 'GRADE ' + m[1];
  m = c.match(/^([1-9])\b/);
  if(m) return 'GRADE ' + m[1];
  m = c.match(/^([1-9])\s*[A-Z]*$/);
  if(m) return 'GRADE ' + m[1];
  if(c.length <= 4){
    m = c.match(/([1-9])/);
    if(m) return 'GRADE ' + m[1];
  }
  return c;
}
/* All raw class codes a teacher teaches (assignments + class-teacher post).
   Used to derive their level AND shown in the Teachers tab as proof. */
function tbClassesOf(t){
  var out = [];
  ((t && t.assignments) || []).forEach(function(a){
    (Array.isArray(a.classes) ? a.classes : String(a.classes || '').split(',')).forEach(function(x){
      x = String(x || '').trim();
      if(x) out.push(x);
    });
  });
  String((t && t.classTeacher) || '').split(',').forEach(function(x){
    x = String(x || '').trim();
    if(x) out.push(x);
  });
  var seen = {}, uniq = [];
  out.forEach(function(x){ if(!seen[x]){ seen[x] = 1; uniq.push(x); } });
  return uniq;
}
function tbSubjName(code){
  try{
    if(window.SUBJ_FULLNAME && window.SUBJ_FULLNAME[code]) return window.SUBJ_FULLNAME[code];
  }catch(e){}
  return code;
}
/* ── storage ─────────────────────────────────────────────────────── */
function tbGrades(){
  var db = tbDb();
  if(!Array.isArray(db.tblGrades)) db.tblGrades = TB_GRADES_SEED.slice();
  return db.tblGrades;
}
function tbPublishers(){
  var db = tbDb();
  if(!Array.isArray(db.publishers)) db.publishers = ['Longhorn', 'Oxford', 'Mentor', 'Moran'];
  return db.publishers;
}
function tbAllocs(){
  var db = tbDb();
  if(!Array.isArray(db.tblAllocations)) db.tblAllocations = [];
  return db.tblAllocations;
}
function tbAllocFor(tid){
  return tbAllocs().filter(function(a){ return String(a.teacherId) === String(tid); })[0] || null;
}
function tbHasBook(title, publisher){
  return String(title || '').trim() !== '' && String(publisher || '').trim() !== '';
}
function tbAssignedItems(a){
  return ((a && a.items) || []).filter(function(it){ return tbHasBook(it.title, it.publisher); });
}
function tbTeacherById(tid){
  return ((tbDb().teachers || []).filter(function(t){ return String(t.id) === String(tid); })[0] || null);
}
/* Level of a teacher id: live registry first, else the allocation snapshot. */
function tbLevelFor(tid){
  var t = tbTeacherById(tid);
  if(t){
    var lv = tbLevelOf(t);
    if(lv === 'lp' || lv === 'upjs') return lv;
  }
  var a = tbAllocFor(tid);
  if(a && (a.level === 'lp' || a.level === 'upjs')) return a.level;
  return 'upjs';
}
/* Teachers of a level: live registry + allocated-but-deleted (marked *). */
function tbTeachersOf(level){
  var live = (tbDb().teachers || []).filter(function(t){
    var lv = tbLevelOf(t);
    if(lv !== 'lp' && lv !== 'upjs') return true;
    return lv === level;
  });
  var ids = {};
  live.forEach(function(t){ ids[String(t.id)] = 1; });
  var extra = [];
  tbAllocs().forEach(function(a){
    if(ids[String(a.teacherId)]) return;
    if(tbLevelFor(a.teacherId) !== level) return;
    ids[String(a.teacherId)] = 1;
    extra.push({ id: a.teacherId, name: (a.teacherName || a.teacherId) + ' *', _gone: true, assignments: [] });
  });
  return live.concat(extra).sort(function(a, b){
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}
function tbAllocTeachers(level){
  var seen = {}, out = [];
  tbAllocs().forEach(function(a){
    if(tbLevelFor(a.teacherId) !== level) return;
    if(seen[String(a.teacherId)]) return;
    seen[String(a.teacherId)] = 1;
    var t = tbTeacherById(a.teacherId);
    out.push({ id: a.teacherId, name: t ? t.name : (a.teacherName || a.teacherId), gone: !t });
  });
  return out.sort(function(a, b){ return String(a.name || '').localeCompare(String(b.name || '')); });
}

window.initTeacherBooks = function(){
  tbShow('hub');
};

/* ── shell ───────────────────────────────────────────────────────── */
window.tbShow = function(view, arg){
  TB.view = view;
  var box = document.getElementById('tb_view');
  if(!box) return;
  if(view === 'hub') box.innerHTML = tbHubHTML();
  else if(view === 'teachers') box.innerHTML = tbShell(tbTeachersHTML());
  else if(view === 'grades') box.innerHTML = tbShell(tbGradesHTML());
  else if(view === 'publishers') box.innerHTML = tbShell(tbPublishersHTML());
  else if(view === 'alloc') box.innerHTML = tbShell(tbAllocHTML(arg));
  else if(view === 'view') box.innerHTML = tbShell(tbViewHTML());
  else if(view === 'returns') box.innerHTML = tbShell(tbReturnsHTML());
  else if(view === 'checklist') box.innerHTML = tbShell(tbChecklistHTML(arg));
  else if(view === 'export') box.innerHTML = tbShell(tbExportHTML());
  else if(view === 'exportAlloc') box.innerHTML = tbExportSubShell(tbExportAllocHTML());
  else if(view === 'exportRet') box.innerHTML = tbExportSubShell(tbExportRetHTML());
  var pg = document.getElementById('page-booklist');
  if(pg) pg.scrollTop = 0;
};
function tbShell(inner){
  return '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="tbShow(\'hub\')">← Back</button></div>' + inner;
}
function tbHubHTML(){
  function btn(id, icon, t, d){
    return '<button onclick="tbShow(\'' + id + '\')" style="text-align:left;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;color:var(--text-primary)">' +
      '<div style="font-size:26px">' + icon + '</div>' +
      '<div style="font-weight:800;font-size:14px;margin:6px 0 2px">' + t + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted)">' + d + '</div></button>';
  }
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">' +
    btn('teachers', '👩‍🏫', 'Teachers', 'Teachers in the system, filter by level') +
    btn('grades', '🏫', 'Grades', 'Grade list — edit, add, delete') +
    btn('publishers', '🏢', 'Book Publishers', 'Same publishers as Learners Booklist') +
    btn('alloc', '📝', 'Teacher Book Allocation', 'Allocate books per teacher') +
    btn('view', '📁', 'View Teachers Booklist', 'All allocations — edit, delete') +
    btn('returns', '↩️', 'Returned Books Registry', 'Mark returned / not returned') +
    btn('checklist', '✅', 'Teacher Books Checklist', 'Per-teacher returns with totals + stamp') +
    btn('export', '⬇️', 'Export', 'Allocated + returned lists, PDF · Word · Excel') +
    '</div>';
}

/* ── teachers (display + level filter) ───────────────────────────── */
window.tbTeachLevel = 'all';
function tbTeachersHTML(){
  var f = window.tbTeachLevel || 'all';
  var all = (tbDb().teachers || []).slice().sort(function(a, b){
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
  var shown = all.filter(function(t){
    if(f === 'all') return true;
    return tbLevelOf(t) === f;
  });
  var rows = shown.map(function(t){
    var lv = tbLevelOf(t);
    var subs = [];
    ((t.assignments || []).forEach(function(a){ subs.push(a.subject); }));
    var uniqSubs = [...new Set(subs)];
    var classes = tbClassesOf(t);
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px;flex-wrap:wrap">' +
      '<span style="font-weight:800">' + tbEsc(tbFmt(t.name)) + '</span>' +
      '<span style="font-size:10px;color:var(--text-muted)">classes: ' + tbEsc(classes.join(', ') || '—') + '</span>' +
      '<span style="font-size:10px;color:var(--text-muted)">· ' + tbEsc(uniqSubs.join(', ') || 'no subjects') + '</span>' +
      '<span class="badge badge-blue" style="margin-left:auto">' + (lv === 'lp' ? 'Lower Primary' : lv === 'upjs' ? 'Upper Primary & Junior School' : '—') + '</span></div>';
  }).join('');
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">👩‍🏫 TEACHERS IN THE SYSTEM (' + shown.length + ' of ' + all.length + ')</div>' +
    '<div class="muted" style="margin-bottom:10px">Level is derived from the classes a teacher teaches (assignments + class-teacher post): grades 1–3 → Lower Primary, grades 4–9 → Upper Primary &amp; Junior School.</div>' +
    '<div class="form-group" style="max-width:320px;margin-bottom:12px"><label>Filter by level</label>' +
    '<select id="tb_teachLvl" onchange="tbTeachLevel=this.value;tbShow(\'teachers\')" style="width:100%">' +
    '<option value="all"' + (f === 'all' ? ' selected' : '') + '>All levels</option>' +
    '<option value="lp"' + (f === 'lp' ? ' selected' : '') + '>Lower Primary</option>' +
    '<option value="upjs"' + (f === 'upjs' ? ' selected' : '') + '>Upper Primary &amp; Junior School</option></select></div>' +
    (rows || '<div class="empty-state"><div class="empty-icon">👩‍🏫</div><p>No teachers found.</p></div>');
}

/* ── grades (editable) ───────────────────────────────────────────── */
function tbGradesHTML(){
  var list = tbGrades();
  var rows = list.map(function(g, i){
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
      '<span style="font-weight:800" id="tb_gr_n' + i + '">' + tbEsc(g) + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:6px">' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px" onclick="tbGradeEdit(' + i + ')">✏️ Edit</button>' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px;color:var(--rose)" onclick="tbGradeDel(' + i + ')">🗑</button></span></div>';
  }).join('');
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">🏫 GRADES</div>' +
    '<div class="muted" style="margin-bottom:10px">Same grade set as the Learners Booklist. Editing here does not touch scoring or class registers.</div>' + rows +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
    '<input id="tb_gr_new" placeholder="New grade, e.g. GRADE 10…" style="flex:1;min-width:180px">' +
    '<button class="btn btn-primary btn-sm" onclick="tbGradeAdd()">＋ Add Grade</button></div>';
}
window.tbGradeAdd = function(){
  var v = (document.getElementById('tb_gr_new').value || '').trim().toUpperCase();
  if(!v) return toast('Type a grade name first', true);
  var list = tbGrades();
  if(list.some(function(g){ return g.toUpperCase() === v; })) return toast('That grade is already listed', true);
  list.push(v);
  tbPersist();
  tbShow('grades');
  toast('✅ Grade added');
};
window.tbGradeEdit = function(i){
  var el = document.getElementById('tb_gr_n' + i);
  el.innerHTML = '<input id="tb_gr_e' + i + '" value="' + tbEsc(tbGrades()[i]).replace(/"/g, '&quot;') + '" style="width:100%">' +
    ' <button class="btn btn-primary btn-sm" style="padding:2px 10px" onclick="tbGradeSave(' + i + ')">Save</button>';
};
window.tbGradeSave = function(i){
  var v = (document.getElementById('tb_gr_e' + i).value || '').trim().toUpperCase();
  if(!v) return toast('Name cannot be empty', true);
  tbGrades()[i] = v;
  tbPersist();
  tbShow('grades');
  toast('✅ Grade updated');
};
window.tbGradeDel = function(i){
  var list = tbGrades();
  if(!confirm('Delete grade "' + list[i] + '" from this list? (Saved allocations keep their stored grade.)')) return;
  list.splice(i, 1);
  tbPersist();
  tbShow('grades');
  toast('🗑 Grade deleted');
};

/* ── publishers (shared with Learners Booklist) ──────────────────── */
function tbPublishersHTML(){
  var list = tbPublishers();
  var rows = list.map(function(p, i){
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
      '<span style="font-weight:800" id="tb_pub_n' + i + '">' + tbEsc(p) + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:6px">' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px" onclick="tbPubEdit(' + i + ')">✏️ Edit</button>' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px;color:var(--rose)" onclick="tbPubDel(' + i + ')">🗑</button></span></div>';
  }).join('');
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">🏢 BOOK PUBLISHERS</div>' +
    '<div class="muted" style="margin-bottom:10px">Shared with the Learners Booklist — changes appear in both places.</div>' + rows +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
    '<input id="tb_pub_new" placeholder="New publisher name…" style="flex:1;min-width:180px">' +
    '<button class="btn btn-primary btn-sm" onclick="tbPubAdd()">＋ Add Publisher</button></div>';
}
window.tbPubAdd = function(){
  var v = (document.getElementById('tb_pub_new').value || '').trim();
  if(!v) return toast('Type a publisher name first', true);
  var list = tbPublishers();
  if(list.some(function(p){ return p.toUpperCase() === v.toUpperCase(); })) return toast('That publisher is already listed', true);
  list.push(v);
  tbPersist();
  tbShow('publishers');
  toast('✅ Publisher added');
};
window.tbPubEdit = function(i){
  var el = document.getElementById('tb_pub_n' + i);
  el.innerHTML = '<input id="tb_pub_e' + i + '" value="' + tbEsc(tbPublishers()[i]).replace(/"/g, '&quot;') + '" style="width:100%">' +
    ' <button class="btn btn-primary btn-sm" style="padding:2px 10px" onclick="tbPubSave(' + i + ')">Save</button>';
};
window.tbPubSave = function(i){
  var v = (document.getElementById('tb_pub_e' + i).value || '').trim();
  if(!v) return toast('Name cannot be empty', true);
  tbPublishers()[i] = v;
  tbPersist();
  tbShow('publishers');
  toast('✅ Publisher updated');
};
window.tbPubDel = function(i){
  var list = tbPublishers();
  if(!confirm('Delete publisher "' + list[i] + '"? (Used in both booklists.)')) return;
  list.splice(i, 1);
  tbPersist();
  tbShow('publishers');
  toast('🗑 Publisher deleted');
};

/* ── allocation form ─────────────────────────────────────────────── */
function tbNewAllocForm(){
  return { teacherId: '', level: 'upjs', rows: {}, seq: 0 };
}
function tbTitleCase(s){
  return String(s || '').toLowerCase().replace(/\b\w/g, function(ch){ return ch.toUpperCase(); });
}
/* Capture typed titles/publishers so re-rendering never loses them. */
function tbAllocCapture(){
  var F = window.__tbAlloc;
  if(!F) return;
  document.querySelectorAll('#tb_a_table tr[data-tb-row]').forEach(function(tr){
    var k = tr.getAttribute('data-tb-row');
    var ti = tr.querySelector('input[data-tb-title]');
    var ps = tr.querySelector('select[data-tb-pub]');
    if(!F.rows[k]) F.rows[k] = { title: '', publisher: '' };
    if(ti) F.rows[k].title = ti.value;
    if(ps) F.rows[k].publisher = ps.value;
  });
}
window.tbAllocLevel = function(){
  tbAllocCapture();
  var F = window.__tbAlloc;
  if(!F) return;
  F.level = document.getElementById('tb_a_level').value || 'upjs';
  var opts = tbTeachersOf(F.level);
  if(!opts.some(function(t){ return String(t.id) === String(F.teacherId); })) F.teacherId = '';
  tbShowAlloc();
};
window.tbAllocTeacher = function(){
  tbAllocCapture();
  var F = window.__tbAlloc;
  if(!F) return;
  F.teacherId = document.getElementById('tb_a_teacher').value || '';
  tbShowAlloc();
};
function tbAllocRows(t){
  // subject × stream-stripped grade, deduped
  var seen = {}, out = [];
  (t.assignments || []).forEach(function(a){
    (a.classes || []).forEach(function(c){
      var key = a.subject + '|' + tbGradeBase(c);
      if(seen[key]) return;
      seen[key] = 1;
      out.push({ subject: a.subject, grade: tbGradeBase(c) });
    });
  });
  return out;
}
function tbAllocHTML(editId){
  var F = window.__tbAlloc;
  if(!F || (editId !== undefined && editId !== null)){
    var ex = editId !== undefined && editId !== null
      ? tbAllocs().filter(function(a){ return String(a.id) === String(editId); })[0] : null;
    if(ex){
      F = { teacherId: ex.teacherId, level: ex.level || tbLevelFor(ex.teacherId),
            rows: {}, seq: 0, editId: ex.id };
      var counts = {};
      (ex.items || []).forEach(function(it){
        var base = it.subject + '|' + it.grade;
        counts[base] = (counts[base] || 0) + 1;
        var id = base + '#' + counts[base];
        F.rows[id] = { subject: it.subject, grade: it.grade, title: it.title || '', publisher: it.publisher || '' };
        F.seq = Math.max(F.seq, counts[base]);
      });
    } else {
      F = tbNewAllocForm();
    }
    window.__tbAlloc = F;
  }
  var lvOpts = TB_LEVELS.map(function(l){
    return '<option value="' + l.v + '"' + (l.v === F.level ? ' selected' : '') + '>' + l.label + '</option>';
  }).join('');
  var teachers = tbTeachersOf(F.level);
  var tOpts = '<option value="">-- Select Teacher --</option>' + teachers.map(function(x){
    return '<option value="' + tbEsc(String(x.id)).replace(/"/g, '&quot;') + '"' +
      (String(x.id) === String(F.teacherId) ? ' selected' : '') + '>' +
      tbEsc(tbFmt(x.name)) + (x._gone ? ' (left)' : '') + '</option>';
  }).join('');
  var t = tbTeacherById(F.teacherId);
  var allocName = t ? t.name : (function(){
    var a = tbAllocFor(F.teacherId);
    return a ? a.teacherName : '';
  })();
  var rowsHTML = '';
  if(t || allocName){
    // when editing a deleted teacher, rebuild rows from the saved items
    var base = t ? tbAllocRows(t) : Object.keys(F.rows).map(function(k){
      var row = F.rows[k] || {};
      return { subject: row.subject, grade: row.grade };
    }).filter(function(r, i, arr){
      return r.subject !== undefined && arr.findIndex(function(x){ return x.subject === r.subject && x.grade === r.grade; }) === i;
    });
    var pubs = tbPublishers();
    rowsHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px">' +
      '<thead><tr style="background:var(--surface-2)">' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">SUBJECT</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">GRADE</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">BOOK TITLE</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">PUBLISHER</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">BOOKS</th></tr></thead><tbody>' +
      base.map(function(r){
        var k = r.subject + '|' + r.grade;
        var ids = Object.keys(F.rows || {}).filter(function(id){ return id.indexOf(k + '#') === 0; })
          .sort(function(a, b){ return tbRowSeq(a) - tbRowSeq(b); });
        if(!ids.length){
          F.seq = (F.seq || 0) + 1;
          var fresh = k + '#' + F.seq;
          F.rows[fresh] = { subject: r.subject, grade: r.grade, title: '', publisher: '' };
          ids = [fresh];
        }
        return ids.map(function(id, ri){
          var saved = F.rows[id] || { subject: r.subject, grade: r.grade, title: '', publisher: '' };
          var disp = tbSubjName(saved.subject);
          var opts = '<option value="">-- Select --</option>' + pubs.map(function(p){
            return '<option value="' + tbEsc(p).replace(/"/g, '&quot;') + '"' + (p === saved.publisher ? ' selected' : '') + '>' + tbEsc(p) + '</option>';
          }).join('');
          var actions = '';
          if(t) actions += '<button class="btn btn-ghost btn-sm" data-tb-add="' + tbEsc(k).replace(/"/g, '&quot;') + '" onclick="tbAddBookRow(this)">＋ Add book</button>';
          if(ids.length > 1) actions += ' <button class="btn btn-ghost btn-sm" style="color:var(--rose)" data-tb-del="' + tbEsc(id).replace(/"/g, '&quot;') + '" onclick="tbRemoveBookRow(this)">Remove</button>';
          return '<tr style="border-bottom:1px solid var(--border)" data-tb-row="' + tbEsc(id).replace(/"/g, '&quot;') + '">' +
            '<td style="padding:8px 12px;font-weight:800">' + tbEsc(disp) + '</td>' +
            '<td style="padding:8px 12px">' + tbEsc(saved.grade) + '</td>' +
            '<td style="padding:8px 12px"><input data-tb-title value="' + tbEsc(saved.title).replace(/"/g, '&quot;') + '" placeholder="Book title… (leave blank when none)" style="width:100%"></td>' +
            '<td style="padding:8px 12px"><select data-tb-pub onchange="tbAllocPub(this)" style="width:100%;min-width:140px">' + opts + '</select></td>' +
            '<td style="padding:8px 12px;white-space:nowrap">' + actions + '</td></tr>';
        }).join('');
      }).join('') + '</tbody></table>' +
      '<div class="muted" style="margin-top:6px">Choosing a publisher auto-fills an empty (or auto-made) title from the <em>full publisher name + subject</em> — your own titles are never overwritten. Leave a row blank when that subject has no assigned book; blank rows are not submitted or exported.</div>';
  }
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📝 TEACHER BOOK ALLOCATION' +
    (F.editId ? ' — EDITING' : '') + '</div>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:6px">' +
    '<div class="form-group" style="margin:0"><label>Level *</label>' +
    '<select id="tb_a_level" onchange="tbAllocLevel()" style="width:100%">' + lvOpts + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Teacher * (stays selected until submission)</label>' +
    '<select id="tb_a_teacher" onchange="tbAllocTeacher()" style="width:100%">' + tOpts + '</select></div></div>' +
    '<div id="tb_a_table">' + rowsHTML + '</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">' +
    '<button class="btn btn-primary" onclick="tbAllocSubmit()">💾 ' + (F.editId ? 'Save Changes' : 'Submit Allocation') + '</button></div>';
}
function tbRowSeq(id){
  var n = parseInt(String(id || '').split('#').pop(), 10);
  return isNaN(n) ? 0 : n;
}
function tbShowAlloc(){
  var box = document.getElementById('tb_view');
  if(!box) return;
  box.innerHTML = '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="tbShow(\'hub\')">← Back</button></div>' + tbAllocHTML();
}
window.tbAddBookRow = function(btn){
  tbAllocCapture();
  var F = window.__tbAlloc;
  if(!F || !btn) return;
  var k = btn.getAttribute('data-tb-add') || '';
  var p = k.split('|');
  if(p.length < 2) return;
  var next = 0;
  Object.keys(F.rows || {}).forEach(function(id){
    if(id.indexOf(k + '#') === 0) next = Math.max(next, tbRowSeq(id));
  });
  F.seq = Math.max(F.seq || 0, next) + 1;
  F.rows[k + '#' + F.seq] = { subject: p[0], grade: p.slice(1).join('|'), title: '', publisher: '' };
  tbShowAlloc();
};
window.tbRemoveBookRow = function(btn){
  tbAllocCapture();
  var F = window.__tbAlloc;
  if(!F || !btn) return;
  delete (F.rows || {})[btn.getAttribute('data-tb-del')];
  tbShowAlloc();
};
function tbAutoTitle(publisher, subjectDisplay){
  var base = (String(publisher || '').trim() + ' ' + String(subjectDisplay || '').trim()).trim();
  if(!base) return '';
  return tbTitleCase(base);
}
window.tbAllocPub = function(sel){
  var tr = sel.closest('tr');
  if(!tr) return;
  var k = tr.getAttribute('data-tb-row');
  var parts = k.split('|');
  var disp = tbSubjName(parts[0]);
  var inp = tr.querySelector('input[data-tb-title]');
  var auto = tbAutoTitle(sel.value, disp);
  var cur = inp ? inp.value : '';
  var prevAuto = tr.getAttribute('data-tb-auto') || '';
  if(auto && (!cur || cur === prevAuto)){
    if(inp) inp.value = auto;
    tr.setAttribute('data-tb-auto', auto);
  } else if(auto){
    tr.setAttribute('data-tb-auto', auto);
  }
};
window.tbAllocSubmit = function(){
  tbAllocCapture();
  var F = window.__tbAlloc;
  if(!F || !F.teacherId) return toast('Select a teacher first', true);
  var t = tbTeacherById(F.teacherId);
  var teacherName = t ? t.name : (function(){
    var a = tbAllocFor(F.teacherId);
    return a ? a.teacherName : F.teacherId;
  })();
  var rows = [];
  var trs = document.querySelectorAll('#tb_a_table tr[data-tb-row]');
  if(!trs.length) return toast('This teacher has no allocatable subjects/grades', true);
  for(var i = 0; i < trs.length; i++){
    var k = trs[i].getAttribute('data-tb-row');
    var p = k.split('|');
    var grade = p.slice(1).join('|').split('#')[0];
    var title = trs[i].querySelector('input[data-tb-title]').value.trim();
    var pub = trs[i].querySelector('select[data-tb-pub]').value.trim();
    // Blank rows mean that subject/grade has no assigned book: leave them out.
    if(!tbHasBook(title, pub)) continue;
    rows.push({ subject: p[0], grade: grade, title: title, publisher: pub });
  }
  if(!rows.length) return toast('Assign at least one book before submitting', true);
  // preserve return flags on exactly matching rows when editing
  var old = F.editId ? tbAllocs().filter(function(a){ return String(a.id) === String(F.editId); })[0] : null;
  if(old){
    var prev = {};
    (old.items || []).forEach(function(it){
      var key = [it.subject, it.grade, it.title, it.publisher].join('|');
      (prev[key] = prev[key] || []).push(it.returned);
    });
    rows.forEach(function(r){
      var key = [r.subject, r.grade, r.title, r.publisher].join('|');
      if(prev[key] && prev[key].length) r.returned = prev[key].shift();
    });
  }
  var rec = { id: F.editId || ('TA' + Date.now().toString(36) + Math.floor(Math.random() * 999)),
    teacherId: F.teacherId, teacherName: teacherName, level: F.level,
    items: rows, updated: Date.now() };
  if(!F.editId) rec.createdAt = Date.now();
  else {
    var oe = tbAllocs().filter(function(a){ return String(a.id) === String(F.editId); })[0];
    if(oe && oe.createdAt) rec.createdAt = oe.createdAt;
  }
  var lists = tbAllocs();
  var ix = lists.findIndex(function(a){ return String(a.teacherId) === String(F.teacherId) && String(a.id) !== String(rec.id); });
  if(ix !== -1) lists.splice(ix, 1);   // one live allocation per teacher
  var ex = lists.findIndex(function(a){ return String(a.id) === String(rec.id); });
  if(ex !== -1) lists[ex] = rec; else lists.push(rec);
  window.__tbAlloc = null;
  tbPersist();
  toast('✅ Allocation submitted');
  tbShow('view');
};

/* ── view allocations ──────────────────────────────────────────── */
function tbViewHTML(){
  var lists = tbAllocs().slice().sort(function(a, b){ return String(a.teacherName || '').localeCompare(String(b.teacherName || '')); });
  if(!lists.length)
    return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📁 TEACHERS BOOKLISTS</div>' +
      '<div class="empty-state"><div class="empty-icon">📁</div><p>No allocations yet — use Teacher Book Allocation.</p></div>';
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📁 TEACHERS BOOKLISTS (' + lists.length + ')</div>' +
    '<div class="muted" style="margin-bottom:10px">Permanent records — kept even if a teacher leaves the registry.</div>' +
    lists.map(function(a){
      return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<div><div style="font-weight:800;color:var(--gold)">' + tbEsc(tbFmt(a.teacherName)) + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted)">' + tbAssignedItems(a).length + ' books · ' +
        (a.level === 'lp' ? 'Lower Primary' : 'Upper & Junior') + '</div></div>' +
        '<span style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn btn-ghost btn-sm" onclick="tbAllocEdit(\'' + a.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="tbAllocDel(\'' + a.id + '\')">🗑 Delete</button></span></div></div>';
    }).join('');
}
window.tbAllocEdit = function(id){
  var a = tbAllocs().filter(function(x){ return String(x.id) === String(id); })[0];
  if(!a) return;
  window.__tbAlloc = null;
  var box = document.getElementById('tb_view');
  box.innerHTML = '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="tbShow(\'hub\')">← Back</button></div>' +
    tbAllocHTML(id);
};
window.tbAllocDel = function(id){
  var lists = tbAllocs();
  var a = lists.filter(function(x){ return String(x.id) === String(id); })[0];
  if(!a) return;
  if(!confirm('Delete the book allocation for ' + (a.teacherName || '') + '?')) return;
  tbDb().tblAllocations = lists.filter(function(x){ return String(x.id) !== String(id); });
  tbPersist();
  tbShow('view');
  toast('🗑 Allocation deleted');
};

/* ── returns registry + checklist ──────────────────────────────── */
function tbRetOptions(level, selected){
  return '<option value="">-- Select Teacher --</option>' + tbAllocTeachers(level).map(function(x){
    return '<option value="' + tbEsc(String(x.id)).replace(/"/g, '&quot;') + '"' +
      (String(x.id) === String(selected) ? ' selected' : '') + '>' +
      tbEsc(tbFmt(x.name)) + (x.gone ? ' (left)' : '') + '</option>';
  }).join('');
}
function tbReturnsHTML(){
  var lv = TB.ret.level || 'upjs';
  var lvOpts = TB_LEVELS.map(function(l){
    return '<option value="' + l.v + '"' + (l.v === lv ? ' selected' : '') + '>' + l.label + '</option>';
  }).join('');
  var tid = TB.ret.teacherId || '';
  var a = tid ? tbAllocFor(tid) : null;
  var table = '';
  if(a){
    var assigned = tbAssignedItems(a);
    table = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px">' +
      '<thead><tr style="background:var(--surface-2)">' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">SUBJECT</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">GRADE</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">BOOK TITLE</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">PUBLISHER</th>' +
      '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">RETURNED</th></tr></thead><tbody>' +
      assigned.map(function(it, i){
        var cur = it.returned === true ? 'returned' : (it.returned === false ? 'not' : '');
        return '<tr style="border-bottom:1px solid var(--border)">' +
          '<td style="padding:8px 12px;font-weight:800">' + tbEsc(tbSubjName(it.subject)) + '</td>' +
          '<td style="padding:8px 12px">' + tbEsc(it.grade) + '</td>' +
          '<td style="padding:8px 12px">' + tbEsc(it.title) + '</td>' +
          '<td style="padding:8px 12px">' + tbEsc(it.publisher) + '</td>' +
          '<td style="padding:8px 12px"><select data-tb-ret="' + i + '" style="min-width:130px">' +
          '<option value="">-- Select --</option>' +
          '<option value="returned"' + (cur === 'returned' ? ' selected' : '') + '>Returned</option>' +
          '<option value="not"' + (cur === 'not' ? ' selected' : '') + '>Not Returned</option></select></td></tr>';
      }).join('') + '</tbody></table>' +
      '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" onclick="tbReturnsSubmit()">💾 Confirm Returns</button></div>';
  }
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">↩️ RETURNED BOOKS REGISTRY</div>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:6px">' +
    '<div class="form-group" style="margin:0"><label>Level</label>' +
    '<select id="tb_r_level" onchange="TB.ret.level=this.value;TB.ret.teacherId=\'\';tbShow(\'returns\')" style="width:100%">' + lvOpts + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Teacher</label>' +
    '<select id="tb_r_teacher" onchange="TB.ret.teacherId=this.value;tbShow(\'returns\')" style="width:100%">' + tbRetOptions(lv, tid) + '</select></div></div>' + table;
}
window.tbReturnsSubmit = function(){
  var a = tbAllocFor(TB.ret.teacherId);
  if(!a) return toast('Select a teacher first', true);
  var assigned = tbAssignedItems(a);
  var set = 0;
  document.querySelectorAll('#tb_view select[data-tb-ret]').forEach(function(sel){
    var i = parseInt(sel.getAttribute('data-tb-ret'), 10);
    if(!assigned[i]) return;
    if(sel.value === 'returned'){ assigned[i].returned = true; set++; }
    else if(sel.value === 'not'){ assigned[i].returned = false; set++; }
  });
  if(!set) return toast('Choose Returned / Not Returned on at least one row', true);
  a.updated = Date.now();
  tbPersist();
  toast('✅ Returns recorded — see the Teacher Books Checklist');
  TB.check.teacherId = a.teacherId;
  tbShow('checklist');
};
function tbCommentOf(it){
  if(it.returned === true) return 'Returned';
  if(it.returned === false) return 'Not Returned';
  return '—';
}
function tbChecklistHTML(argTid){
  var tid = (argTid !== undefined && argTid !== null) ? argTid : (TB.check.teacherId || '');
  var teachers = tbAllocTeachers('upjs').concat(tbAllocTeachers('lp')).filter(function(x, i, arr){
    return arr.findIndex(function(y){ return String(y.id) === String(x.id); }) === i;
  });
  var opts = '<option value="">-- Select Teacher --</option>' + teachers.map(function(x){
    return '<option value="' + tbEsc(String(x.id)).replace(/"/g, '&quot;') + '"' +
      (String(x.id) === String(tid) ? ' selected' : '') + '>' + tbEsc(tbFmt(x.name)) + '</option>';
  }).join('');
  var body = '';
  if(tid){
    var a = tbAllocFor(tid);
    if(a){
      var items = tbAssignedItems(a);
      var tot = items.length;
      var ret = items.filter(function(it){ return it.returned === true; }).length;
      var not = items.filter(function(it){ return it.returned === false; }).length;
      body = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px">' +
        '<thead><tr style="background:var(--surface-2)">' +
        '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">SUBJECT</th>' +
        '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">GRADE</th>' +
        '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">BOOK TITLE</th>' +
        '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">PUBLISHER</th>' +
        '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">COMMENT</th></tr></thead><tbody>' +
        items.map(function(it){
          return '<tr style="border-bottom:1px solid var(--border)">' +
            '<td style="padding:8px 12px;font-weight:800">' + tbEsc(tbSubjName(it.subject)) + '</td>' +
            '<td style="padding:8px 12px">' + tbEsc(it.grade) + '</td>' +
            '<td style="padding:8px 12px">' + tbEsc(it.title) + '</td>' +
            '<td style="padding:8px 12px">' + tbEsc(it.publisher) + '</td>' +
            '<td style="padding:8px 12px;font-weight:700">' + tbCommentOf(it) + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:12px;font-size:13px">' +
        '<div>Total allocated: <strong>' + tot + '</strong></div>' +
        '<div style="color:var(--emerald)">Returned: <strong>' + ret + '</strong></div>' +
        '<div style="color:var(--rose)">Not returned: <strong>' + not + '</strong></div></div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:14px;margin-top:14px;display:flex;gap:28px;flex-wrap:wrap;font-size:12px;color:var(--text-muted)">' +
        '<div style="border:1px dashed var(--border);border-radius:8px;min-width:170px;height:90px;display:flex;align-items:flex-end;padding:6px">SCHOOL STAMP</div>' +
        '<div style="display:flex;flex-direction:column;justify-content:flex-end;gap:14px"><span>Date: ............................</span><span>Sign: ............................</span></div></div>';
    }
  }
  var list = teachers.map(function(x){
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px;cursor:pointer" onclick="tbShow(\'checklist\',\'' + tbEsc(String(x.id)).replace(/"/g, '&quot;') + '\')">' +
      '<span style="font-weight:800">' + tbEsc(tbFmt(x.name)) + '</span>' +
      '<span style="font-size:10px;color:var(--text-muted)">click to view books</span></div>';
  }).join('');
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">✅ TEACHER BOOKS CHECKLIST</div>' +
    '<div class="form-group" style="max-width:340px;margin-bottom:12px"><label>Teacher</label>' +
    '<select onchange="TB.check.teacherId=this.value;tbShow(\'checklist\')" style="width:100%">' + opts + '</select></div>' +
    body +
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin:16px 0 6px">ALL TEACHERS</div>' + list;
}

function tbExportSubShell(inner){
  return '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="tbShow(\'hub\')">← Back</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="tbShow(\'export\')">⬇️ Export menu</button></div>' + inner;
}
/* ── export hub + builders ───────────────────────────────────────── */
function tbExportHTML(){
  function btn(id, icon, t, d){
    return '<button onclick="tbShow(\'' + id + '\')" style="text-align:left;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;color:var(--text-primary)">' +
      '<div style="font-size:26px">' + icon + '</div>' +
      '<div style="font-weight:800;font-size:14px;margin:6px 0 2px">' + t + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted)">' + d + '</div></button>';
  }
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">⬇️ EXPORT</div>' +
    '<div class="muted" style="margin-bottom:12px">Letterhead + logo are shared with the Learners Booklist and can be edited below — changes apply to both booklists.</div>' +
    tbLetterheadEditorHTML() +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:12px">' +
    btn('exportAlloc', '📕', 'Export Teacher Allocated Booklist', 'Pick a teacher → A4 PDF · Word · Excel, portrait / landscape, totals + stamp box') +
    btn('exportRet', '↩️', 'Export Returned Teacher Book List', 'Level + teacher → comment column, totals + stamp box') +
    '</div>';
}
/* Shared letterhead editor (same db.bookLetterhead blob as Learners Booklist). */
function tbLetterheadHTML(){
  try{
    if(typeof blLetterhead === 'function') return blLetterhead();
  }catch(e){}
  var db = tbDb(), lh = db.bookLetterhead;
  if(!lh || typeof lh !== 'object')
    return { lines: ['SANTAPRIS ACADEMY', 'P.O BOX 13498-00100 NAIROBI',
      'TEL: 0723 300 861 OR 0790 889 069', 'Motto: A Brightened Future'], show: true };
  return { lines: (Array.isArray(lh.lines) && lh.lines.length ? lh.lines : []), show: lh.show !== false };
}
function tbLetterheadEditorHTML(){
  var lh = tbLetterheadHTML();
  return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:4px">' +
    '<div style="font-size:12px;font-weight:800;color:var(--sky);margin-bottom:8px">✉️ LETTERHEAD FOR EXPORTS (shared with Learners Booklist)</div>' +
    '<label style="display:flex;align-items:center;gap:9px;font-size:13px;cursor:pointer;margin-bottom:8px">' +
    '<input type="checkbox" id="tb_lh_show"' + (lh.show ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:var(--emerald)"> Include the letterhead in exports</label>' +
    '<div class="form-group" style="margin:0 0 8px"><label>Edit letterhead (one per line)</label>' +
    '<textarea id="tb_lh_text" rows="4" style="width:100%">' + tbEsc(lh.lines.join('\n')) + '</textarea></div>' +
    '<button class="btn btn-ghost btn-sm" onclick="tbLetterheadSave()">💾 Save Letterhead</button></div>';
}
window.tbLetterheadSave = function(){
  var ta = document.getElementById('tb_lh_text');
  var cb = document.getElementById('tb_lh_show');
  var lines = String(ta ? ta.value : '').split('\n').map(function(s){ return s.trim(); })
    .filter(function(s){ return s; });
  if(!lines.length) return toast('Type at least one letterhead line', true);
  tbDb().bookLetterhead = { lines: lines, show: !!(cb && cb.checked) };
  tbPersist();
  toast('✅ Letterhead saved (applies to Learners + Teachers exports)');
};
function tbTeacherOpts(level, selected){
  return '<option value="">-- Select Teacher --</option>' + tbAllocTeachers(level).map(function(x){
    return '<option value="' + tbEsc(String(x.id)).replace(/"/g, '&quot;') + '"' +
      (String(x.id) === String(selected) ? ' selected' : '') + '>' + tbEsc(tbFmt(x.name)) + (x.gone ? ' (left)' : '') + '</option>';
  }).join('');
}
function tbOrientSel(id, val){
  return '<select id="' + id + '" style="min-width:130px"><option value="portrait"' +
    (val !== 'landscape' ? ' selected' : '') + '>Portrait</option>' +
    '<option value="landscape"' + (val === 'landscape' ? ' selected' : '') + '>Landscape</option></select>';
}
function tbExportAllocHTML(){
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📕 EXPORT TEACHER ALLOCATED BOOKLIST</div>' +
    tbLetterheadEditorHTML() +
    '<div class="card" style="margin-top:12px"><div class="card-body">' +
    '<div class="muted" style="margin-bottom:10px">Select a teacher from the dropdown — exports a printable A4 list with the school letterhead + logo, total books issued at the bottom and a school stamp + sign box.</div>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px">' +
    '<div class="form-group" style="margin:0"><label>Level</label><select id="tb_xa_level" onchange="TB.expA.level=this.value;TB.expA.teacherId=\'\';tbShow(\'exportAlloc\')" style="width:100%">' +
    TB_LEVELS.map(function(l){ return '<option value="' + l.v + '"' + (l.v === TB.expA.level ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Teacher</label><select id="tb_xa_teacher" onchange="TB.expA.teacherId=this.value" style="width:100%">' + tbTeacherOpts(TB.expA.level, TB.expA.teacherId) + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Orientation</label><div>' + tbOrientSel('tb_xa_orient', TB.expA.orient) + '</div></div></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-pdf" onclick="TB.expA.orient=document.getElementById(\'tb_xa_orient\').value;tbExportAlloc(\'pdf\')">📄 PDF (A4)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#1a5fa8,#3a9bff)" onclick="TB.expA.orient=document.getElementById(\'tb_xa_orient\').value;tbExportAlloc(\'word\')">📝 Word (A4)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#145a32,#27ae60)" onclick="TB.expA.orient=document.getElementById(\'tb_xa_orient\').value;tbExportAlloc(\'excel\')">📊 Excel</button></div>' +
    '</div></div>';
}
function tbExportRetHTML(){
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">↩️ EXPORT RETURNED TEACHER BOOK LIST</div>' +
    tbLetterheadEditorHTML() +
    '<div class="card" style="margin-top:12px"><div class="card-body">' +
    '<div class="muted" style="margin-bottom:10px">Level + teacher selection — exports the teacher\u2019s list with the COMMENT column, totals (allocated / returned / not returned) and a school stamp + sign box.</div>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px">' +
    '<div class="form-group" style="margin:0"><label>Level</label><select id="tb_xr_level" onchange="TB.expR.level=this.value;TB.expR.teacherId=\'\';tbShow(\'exportRet\')" style="width:100%">' +
    TB_LEVELS.map(function(l){ return '<option value="' + l.v + '"' + (l.v === TB.expR.level ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Teacher</label><select id="tb_xr_teacher" onchange="TB.expR.teacherId=this.value" style="width:100%">' + tbTeacherOpts(TB.expR.level, TB.expR.teacherId) + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Orientation</label><div>' + tbOrientSel('tb_xr_orient', TB.expR.orient) + '</div></div></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-pdf" onclick="TB.expR.orient=document.getElementById(\'tb_xr_orient\').value;tbExportRet(\'pdf\')">📄 PDF (A4)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#1a5fa8,#3a9bff)" onclick="TB.expR.orient=document.getElementById(\'tb_xr_orient\').value;tbExportRet(\'word\')">📝 Word (A4)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#145a32,#27ae60)" onclick="TB.expR.orient=document.getElementById(\'tb_xr_orient\').value;tbExportRet(\'excel\')">📊 Excel</button></div>' +
    '</div></div>';
}
window.tbExportAlloc = function(fmt){
  var a = tbAllocFor(TB.expA.teacherId);
  if(!a) return toast('Select a teacher with an allocation first', true);
  var land = TB.expA.orient === 'landscape';
  if(fmt === 'pdf') tbExportAllocPDF(a, land);
  else if(fmt === 'word') tbExportWord([tbAllocDoc(a, false)], land, tbAllocFile(a));
  else tbExportExcel([tbAllocDoc(a, false)], land, tbAllocFile(a));
};
window.tbExportRet = function(fmt){
  var a = tbAllocFor(TB.expR.teacherId);
  if(!a) return toast('Select a teacher with an allocation first', true);
  var land = TB.expR.orient === 'landscape';
  if(fmt === 'pdf') tbExportRetPDF(a, land);
  else if(fmt === 'word') tbExportWord([tbRetDoc(a)], land, tbRetFile(a));
  else tbExportExcel([tbRetDoc(a)], land, tbRetFile(a));
};
function tbAllocFile(a){ return (a.teacherName + '_Book_Allocation').replace(/\s+/g, '_').slice(0, 60); }
function tbRetFile(a){ return (a.teacherName + '_Returned_Books').replace(/\s+/g, '_').slice(0, 60); }
/* Shared letterhead (learners setting) for teacher exports. */
function tbHead(){
  try{
    if(typeof blLetterhead === 'function'){
      var lh = blLetterhead();
      return { lines: lh.lines, show: lh.show };
    }
  }catch(e){}
  return { lines: ['SANTAPRIS ACADEMY', 'P.O BOX 13498-00100 NAIROBI',
    'TEL: 0723 300 861 OR 0790 889 069', 'Motto: A Brightened Future'], show: true };
}
function tbLogoURL(){
  try{
    if(typeof SCHOOL_LOGO_DATAURL === 'string' && SCHOOL_LOGO_DATAURL.indexOf('data:image') === 0)
      return SCHOOL_LOGO_DATAURL;
  }catch(e){}
  return '';
}
/* Allocated doc model (no comments). */
function tbAllocDoc(a){
  var items = tbAssignedItems(a);
  return {
    title: (a.teacherName + ' — BOOK ALLOCATION LIST').toUpperCase(),
    head: tbHead(),
    rows: items.map(function(it){
      return [tbSubjName(it.subject), it.grade || '', it.title || '', it.publisher || ''];
    }),
    foot: 'TOTAL NUMBER OF BOOKS ISSUED: ' + items.length,
    stamp: true
  };
}
/* Returned doc model (comment column + totals). */
function tbRetDoc(a){
  var items = tbAssignedItems(a);
  var tot = items.length;
  var ret = items.filter(function(it){ return it.returned === true; }).length;
  var not = items.filter(function(it){ return it.returned === false; }).length;
  return {
    title: (a.teacherName + ' — RETURNED BOOKS LIST').toUpperCase(),
    head: tbHead(),
    retCols: true,
    rows: items.map(function(it){
      return [tbSubjName(it.subject), it.grade || '', it.title || '', it.publisher || '',
        it.returned === true ? 'Returned' : (it.returned === false ? 'Not Returned' : '—')];
    }),
    foot: 'TOTAL ALLOCATED: ' + tot + '   ·   RETURNED: ' + ret + '   ·   NOT RETURNED: ' + not,
    stamp: true
  };
}

/* ── PDF: A4 portrait/landscape, letterhead + logo, totals, stamp box ── */
function tbExportAllocPDF(a, land){ tbExportPDFDocs([tbAllocDoc(a)], land, tbAllocFile(a)); }
function tbExportRetPDF(a, land){ tbExportPDFDocs([tbRetDoc(a)], land, tbRetFile(a)); }
function tbExportPDFDocs(docs, land, fname){
  try{
    var jsPDF = window._getJsPDF();
    var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: land ? 'landscape' : 'portrait' });
    var W = land ? 297 : 210, H = land ? 210 : 297, m = 14;
    var cw = W - m * 2;
    docs.forEach(function(d, di){
      if(di > 0) doc.addPage();
      var y = m;
      var lines = (d.head && d.head.show && d.head.lines) || [];
      var logo = lines.length ? tbLogoURL() : '';
      if(logo){ try{ doc.addImage(logo, 'JPEG', m + 2, y, 20, 20); }catch(e){} }
      if(lines.length){
        doc.setFont('times', 'bold'); doc.setFontSize(13); doc.setTextColor(0, 0, 0);
        lines.forEach(function(line, i){ doc.text(line, W / 2, y + 5 + i * 5, { align: 'center' }); });
        y += lines.length * 5 + 6;
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8);
        doc.line(m, y, W - m, y); y += 1.2;
        doc.line(m, y, W - m, y); y += 6;
      }
      doc.setFont('times', 'bold'); doc.setFontSize(12);
      doc.text(d.title, W / 2, y, { align: 'center' });
      y += 8;
      var head = d.retCols ? ['SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER', 'COMMENT']
                           : ['SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER'];
      var body = d.rows.map(function(r){ return r; });
      /* Proportional widths that mirror the Word export (Word uses a 100%
         table with auto-fit columns): # stays narrow, TITLE gets the most
         room so it rarely wraps, GRADE/COMMENT stay compact. */
      var props = d.retCols ? [0.06, 0.17, 0.12, 0.30, 0.20, 0.15]
                            : [0.07, 0.20, 0.14, 0.34, 0.25];
      var full = ['#'].concat(head);
      var colStyles = {};
      full.forEach(function(h, i){
        colStyles[i] = { cellWidth: Math.max(10, cw * props[i]),
          halign: (i === 0 || h === 'GRADE') ? 'center' : 'left',
          valign: 'middle', fontSize: 7.5, cellPadding: 1.4 };
      });
      var numbered = body.map(function(r, i){ return [String(i + 1)].concat(r); });
      doc.autoTable({
        startY: y, head: [full], body: numbered,
        theme: 'grid', tableWidth: cw, margin: { left: m },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],
          fontStyle: 'bold', fontSize: 8, cellPadding: 1.6, valign: 'middle',
          halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.3 },
        styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 1.4,
          lineColor: [0, 0, 0], lineWidth: 0.3, textColor: [0, 0, 0],
          valign: 'middle', overflow: 'linebreak', minCellHeight: 5 },
        columnStyles: colStyles
      });
      y = doc.lastAutoTable.finalY + 6;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text(d.foot, m, y);
      y += 8;
      // stamp + date + sign box
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.5);
      doc.rect(m, y, 70, 26);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text('SCHOOL STAMP', m + 4, y + 6);
      doc.text('Date: ............................', m + 78, y + 10);
      doc.text('Sign: ............................', m + 78, y + 20);
    });
    doc.save(fname + '_A4_' + (land ? 'landscape' : 'portrait') + '.pdf');
    toast('📄 Teacher booklist PDF exported');
  }catch(err){ toast('PDF export failed: ' + (err && err.message || err), true); }
}

/* ── Word: shared builder, A4 portrait/landscape ────────────────────── */
function tbExportWord(docs, land, fname){
  try{
    if(typeof docx === 'undefined') return toast('Word library not loaded', true);
    var D = window.docx;
    var kids = [];
    docs.forEach(function(d, di){
      if(di > 0) kids.push(new D.Paragraph({ children: [new D.PageBreak()] }));
      var lines = (d.head && d.head.show && d.head.lines) || [];
      var logo = lines.length ? tbLogoURL() : '';
      if(logo){
        try{
          kids.push(new D.Paragraph({ children: [
            new D.ImageRun({ data: logo, transformation: { width: 90, height: 90 } })] }));
        }catch(e){}
      }
      lines.forEach(function(line, i){
        kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
          new D.TextRun({ text: line, bold: true, size: i === 0 ? 30 : 20,
            font: i === 0 ? 'Georgia' : 'Arial', color: '000000' })] }));
      });
      kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
        new D.TextRun({ text: d.title, bold: true, underline: {}, size: 26, font: 'Georgia', color: '000000' })] }));
      var head = d.retCols ? ['#', 'SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER', 'COMMENT']
                           : ['#', 'SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER'];
      var nCols = head.length;
      var bdr = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
      var bb = { top: bdr, bottom: bdr, left: bdr, right: bdr };
      function cell(text, opts){
        opts = opts || {};
        return new D.TableCell({ borders: bb,
          children: [new D.Paragraph({ children: [new D.TextRun({
            text: String(text == null ? '' : text), bold: !!opts.bold, size: opts.size || 18,
            font: 'Arial', color: '000000' })] })] });
      }
      var rows = [new D.TableRow({ tableHeader: true, children: head.map(function(h){
        return new D.TableCell({ borders: bb, shading: { fill: 'DDDDDD' },
          children: [new D.Paragraph({ children: [new D.TextRun({ text: h, bold: true, size: 18, font: 'Arial' })] })] });
      }) })];
      d.rows.forEach(function(r, i){
        rows.push(new D.TableRow({ children: [cell(i + 1)].concat(r.map(function(c){ return cell(c); })) }));
      });
      kids.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: bb, rows: rows }));
      kids.push(new D.Paragraph({ children: [new D.TextRun({ text: d.foot, bold: true, size: 20, font: 'Arial' })] }));
      kids.push(new D.Table({ width: { size: 60, type: D.WidthType.PERCENTAGE }, borders: bb, rows: [
        new D.TableRow({ children: [
          new D.TableCell({ borders: bb, children: [new D.Paragraph({ children: [
            new D.TextRun({ text: 'SCHOOL STAMP', size: 16, font: 'Arial' })] })] }),
          new D.TableCell({ borders: bb, children: [
            new D.Paragraph({ children: [new D.TextRun({ text: 'Date: ............................', size: 16 })] }),
            new D.Paragraph({ children: [new D.TextRun({ text: 'Sign: ............................', size: 16 })] })] })
        ] })
      ] }));
    });
    var docFile = new D.Document({ sections: [{ properties: { page: {
      size: { width: land ? 16838 : 11906, height: land ? 11906 : 16838 },
      margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: kids }] });
    D.Packer.toBlob(docFile).then(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fname + '_A4_' + (land ? 'landscape' : 'portrait') + '.docx';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      toast('📝 Teacher booklist Word exported');
    });
  }catch(err){ toast('Word export failed: ' + (err && err.message || err), true); }
}

/* ── Excel ─────────────────────────────────────────────────────────── */
function tbExportExcel(docs, land, fname){
  try{
    var XL = window.XLSX;
    if(!XL) return toast('Excel library not loaded', true);
    var wb = XL.utils.book_new();
    docs.forEach(function(d){
      var lines = (d.head && d.head.show && d.head.lines) || [];
      var aoa = [];
      lines.forEach(function(h){ aoa.push([h]); });
      if(lines.length) aoa.push([]);
      aoa.push([d.title]);
      aoa.push([]);
      var head = d.retCols ? ['#', 'SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER', 'COMMENT']
                           : ['#', 'SUBJECT', 'GRADE', 'BOOK TITLE', 'PUBLISHER'];
      aoa.push(head);
      d.rows.forEach(function(r, i){ aoa.push([i + 1].concat(r)); });
      aoa.push([]);
      aoa.push([d.foot]);
      aoa.push([]);
      aoa.push(['SCHOOL STAMP']);
      aoa.push(['Date: ............................']);
      aoa.push(['Sign: ............................']);
      var ws = XL.utils.aoa_to_sheet(aoa);
      ws['!cols'] = d.retCols
        ? [{ wch: 5 }, { wch: 22 }, { wch: 12 }, { wch: 34 }, { wch: 20 }, { wch: 18 }]
        : [{ wch: 5 }, { wch: 22 }, { wch: 12 }, { wch: 34 }, { wch: 20 }];
      ws['!pageSetup'] = { orientation: land ? 'landscape' : 'portrait', paperSize: 9, fitToWidth: 1, fitToHeight: 1 };
      var nm = d.title.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 28) || 'Sheet';
      XL.utils.book_append_sheet(wb, ws, nm);
    });
    XL.writeFile(wb, fname + '_A4_' + (land ? 'landscape' : 'portrait') + '.xlsx');
    toast('📊 Teacher booklist Excel exported');
  }catch(err){ toast('Excel export failed: ' + (err && err.message || err), true); }
}

/* Exposed for automated checks + console use. */
window.tbTeachersOf = tbTeachersOf;
window.tbAllocFor = tbAllocFor;
window.tbAllocsList = tbAllocs;
window.tbGradeBase = tbGradeBase;
window.tbClassesOf = tbClassesOf;
window.tbCheckTeacher = function(id){ TB.check.teacherId = id || ''; };
window.TB = TB;

})();
