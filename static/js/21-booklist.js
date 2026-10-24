/* ═══════════════════════════════════════════════════════════════════
   LEARNERS BOOKLIST STUDIO — subjects, publishers, create, view, export.
   Own KV blobs (publishers, bookSubjects, booklists) synced like settings.
   NEVER touches exams/students/scores: saves only persist booklist data
   alongside whatever is already in db (full-db save, additive-safe).
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var BL_GRADES_ALL = ['PLAYGROUP', 'PP1', 'PP2', 'GRADE 1', 'GRADE 2', 'GRADE 3',
  'GRADE 4', 'GRADE 5', 'GRADE 6', 'GRADE 7', 'GRADE 8', 'GRADE 9'];
var BL_YEARS = [];
(function(){ var y = new Date().getFullYear(); for(var i = y - 2; i <= y + 5; i++) BL_YEARS.push(i); })();
var BL_SEED_PUBS = ['Longhorn', 'Oxford', 'Mentor', 'Moran'];
var BL_HEAD = ['SANTAPRIS ACADEMY', 'P.O BOX 13498-00100 NAIROBI',
  'TEL: 0723 300 861 OR 0790 889 069', 'Motto: A Brightened Future'];
var BL_REQ_HEAD = 'STATIONERIES AND OTHER REQUIREMENTS';
var BL_HEAD_LEGACY = ['SANTAPRIS ACADEMY', 'P.O BOX 13498-00100 NAIROBI',
  'TEL: 0723 300 861 OR 0790 889 069', 'Motto: A Brightened Future'];
function blSameLines(a, b){
  if(!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every(function(line, i){ return String(line || '').trim().toLowerCase() === String(b[i] || '').trim().toLowerCase(); });
}
/* Editable letterhead ({lines[], show}) synced like other settings.
   Missing → sample defaults, shown. */
function blLetterhead(){
  var db = blDb();
  var lh = db.bookLetterhead;
  if(!lh || typeof lh !== 'object') return { lines: BL_HEAD.slice(), show: true };
  var stored = Array.isArray(lh.lines) && lh.lines.length ? lh.lines : BL_HEAD.slice();
  if(blSameLines(stored, BL_HEAD_LEGACY)) stored = BL_HEAD.slice();
  return { lines: stored, show: lh.show !== false };
}
window.blLetterheadSave = function(){
  var ta = document.getElementById('bl_lh_text');
  var cb = document.getElementById('bl_lh_show');
  var lines = String(ta ? ta.value : '').split('\n').map(function(s){ return s.trim(); })
    .filter(function(s){ return s; });
  if(!lines.length) return toast('Type at least one letterhead line', true);
  blDb().bookLetterhead = { lines: lines, show: !!(cb && cb.checked) };
  blPersist();
  toast('✅ Letterhead saved');
};

var BL = { view: 'hub', form: null };

function blEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}
function blDb(){
  if(!window.db) window.db = {};
  return window.db;
}
function blPersist(){
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function'){ try{ updateCounts(); }catch(e){} }
}
/* Own subject list (seeded once from the score-subjects registry; edits here
   never touch scoring). The seed MERGES (never overwrites): if the registry
   is still empty when first visited (boot/sync race) we do NOT persist an
   empty list — that empty list would otherwise be saved to the server and
   wipe the subjects for every device. Seeding is retried until the registry
   has entries; deliberate deletions after a successful seed are respected. */
function blSubjects(){
  var db = blDb();
  if(!Array.isArray(db.bookSubjects)) db.bookSubjects = [];
  if(!db.bookSubjectsSeeded){
    var reg = [];
    try{
      var src = db.subjects || [];
      if(!Array.isArray(src) && src) src = [];
      var seen = {};
      (src || []).forEach(function(code){
        code = String(code || '').trim().toUpperCase();
        if(!code || seen[code]) return;
        seen[code] = 1;
        reg.push({ code: code, name: blSubjName(code) });
      });
    }catch(e){}
    if(reg.length){
      var have = {};
      db.bookSubjects.forEach(function(s){ have[s.code] = 1; });
      reg.forEach(function(s){ if(!have[s.code]) db.bookSubjects.push(s); });
      db.bookSubjectsSeeded = true;   // local-only flag (never synced to server)
    }
  }
  return db.bookSubjects;
}
function blSubjName(code){
  try{
    if(window.SUBJ_FULLNAME && window.SUBJ_FULLNAME[code]) return window.SUBJ_FULLNAME[code];
  }catch(e){}
  return code;
}
function blPublishers(){
  var db = blDb();
  if(!Array.isArray(db.publishers)) db.publishers = BL_SEED_PUBS.slice();
  return db.publishers;
}
function blLists(){
  var db = blDb();
  if(!Array.isArray(db.booklists)) db.booklists = [];
  return db.booklists;
}

window.initBooklistPage = function(){
  blShow('hub');
};
/* Exposed for automated checks + console use. */
window.blSubjectsList = blSubjects;
window.blPublishersList = blPublishers;
window.blBookLists = blLists;
window.blDbPeek = blDb;
window.blNew = function(){
  window.__blForm = null;
  blShow('create');
};

/* ── shell ─────────────────────────────────────────────────────── */
function blShell(inner, back){
  return (back === false ? '' :
    '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="blShow(\'hub\')">← Back</button></div>') + inner;
}
window.blShow = function(view, arg){
  BL.view = view;
  var box = document.getElementById('bl_view');
  if(!box) return;
  if(view === 'hub') box.innerHTML = blHubHTML();
  else if(view === 'subjects') box.innerHTML = blShell(blSubjectsHTML());
  else if(view === 'publishers') box.innerHTML = blShell(blPublishersHTML());
  else if(view === 'create'){
    box.innerHTML = blShell(blCreateHTML(arg));
    var _F = window.__blForm;
    if(_F && _F.fresh && !arg){
      blSubjects().forEach(function(s){ _F.checked[s.name] = 1; });
      _F.fresh = false;
    }
    blRenderFormTable();
  }
  else if(view === 'view') box.innerHTML = blShell(blViewHTML());
  else if(view === 'export') box.innerHTML = blShell(blExportHTML());
  var pg = document.getElementById('page-booklists');
  if(pg) pg.scrollTop = 0;
};
function blHubHTML(){
  function btn(id, icon, t, d){
    return '<button onclick="blShow(\'' + id + '\')" style="text-align:left;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;color:var(--text-primary)">' +
      '<div style="font-size:26px">' + icon + '</div>' +
      '<div style="font-weight:800;font-size:14px;margin:6px 0 2px">' + t + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted)">' + d + '</div></button>';
  }
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">' +
    btn('subjects', '📚', 'Subjects', 'Booklist subjects from the registry — edit, delete, add') +
    btn('publishers', '🏢', 'Publishers List', 'Manage book publishers') +
    '<button onclick="blNew()" style="text-align:left;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;color:var(--text-primary)">' +
    '<div style="font-size:26px">➕</div>' +
    '<div style="font-weight:800;font-size:14px;margin:6px 0 2px">Create Booklist</div>' +
    '<div style="font-size:11px;color:var(--text-muted)">Grade · year · subjects · titles · stationery</div></button>' +
    btn('view', '📁', 'View Created Booklists', 'Open, edit or delete saved booklists') +
    btn('export', '⬇️', 'Export Booklist', 'PDF · Word · Excel, single or all') +
    '</div>';
}

/* ── subjects ──────────────────────────────────────────────────── */
function blSubjectsHTML(){
  var list = blSubjects();
  var rows = list.length ? list.map(function(s, i){
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
      '<span style="font-weight:800" id="bl_sub_n' + i + '">' + blEsc(s.name) + '</span>' +
      '<span style="font-size:10px;color:var(--text-muted)">' + blEsc(s.code) + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:6px">' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px" onclick="blSubEdit(' + i + ')">✏️ Edit</button>' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px;color:var(--rose)" onclick="blSubDel(' + i + ')">🗑</button></span></div>';
  }).join('') : '<div class="empty-state"><div class="empty-icon">📚</div><p>No booklist subjects yet.</p></div>';
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📚 BOOKLIST SUBJECTS</div>' +
    '<div class="muted" style="margin-bottom:10px">Imported from the Subjects registry. Editing here affects booklists only — scoring is untouched.</div>' + rows +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
    '<input id="bl_sub_new" placeholder="New subject name…" style="flex:1;min-width:180px">' +
    '<button class="btn btn-primary btn-sm" onclick="blSubAdd()">＋ Add Subject</button></div>';
}
window.blSubAdd = function(){
  var v = (document.getElementById('bl_sub_new').value || '').trim();
  if(!v) return toast('Type a subject name first', true);
  var list = blSubjects();
  var code = v.toUpperCase().replace(/\s+/g, ' ');
  if(list.some(function(s){ return s.code === code || s.name.toUpperCase() === code; }))
    return toast('That subject is already listed', true);
  list.push({ code: code, name: v });
  blPersist();
  blShow('subjects');
  toast('✅ Subject added');
};
window.blSubEdit = function(i){
  var list = blSubjects();
  var s = list[i];
  if(!s) return;
  var el = document.getElementById('bl_sub_n' + i);
  el.innerHTML = '<input id="bl_sub_e' + i + '" value="' + blEsc(s.name).replace(/"/g, '&quot;') + '" style="width:100%">' +
    ' <button class="btn btn-primary btn-sm" style="padding:2px 10px" onclick="blSubSave(' + i + ')">Save</button>';
};
window.blSubSave = function(i){
  var list = blSubjects();
  var v = (document.getElementById('bl_sub_e' + i).value || '').trim();
  if(!v) return toast('Name cannot be empty', true);
  list[i].name = v;
  blPersist();
  blShow('subjects');
  toast('✅ Subject updated');
};
window.blSubDel = function(i){
  var list = blSubjects();
  if(!list[i]) return;
  if(!confirm('Delete "' + list[i].name + '" from the booklist subjects? (Scoring subjects are untouched.)')) return;
  list.splice(i, 1);
  blPersist();
  blShow('subjects');
  toast('🗑 Subject deleted');
};

/* ── publishers ────────────────────────────────────────────────── */
function blPublishersHTML(){
  var list = blPublishers();
  var rows = list.length ? list.map(function(p, i){
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
      '<span style="font-weight:800" id="bl_pub_n' + i + '">' + blEsc(p) + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:6px">' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px" onclick="blPubEdit(' + i + ')">✏️ Edit</button>' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 10px;color:var(--rose)" onclick="blPubDel(' + i + ')">🗑</button></span></div>';
  }).join('') : '<div class="empty-state"><div class="empty-icon">🏢</div><p>No publishers yet.</p></div>';
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">🏢 BOOK PUBLISHERS</div>' + rows +
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
    '<input id="bl_pub_new" placeholder="New publisher name…" style="flex:1;min-width:180px">' +
    '<button class="btn btn-primary btn-sm" onclick="blPubAdd()">＋ Add Publisher</button></div>';
}
window.blPubAdd = function(){
  var v = (document.getElementById('bl_pub_new').value || '').trim();
  if(!v) return toast('Type a publisher name first', true);
  var list = blPublishers();
  if(list.some(function(p){ return p.toUpperCase() === v.toUpperCase(); }))
    return toast('That publisher is already listed', true);
  list.push(v);
  blPersist();
  blShow('publishers');
  toast('✅ Publisher added');
};
window.blPubEdit = function(i){
  var list = blPublishers();
  var el = document.getElementById('bl_pub_n' + i);
  el.innerHTML = '<input id="bl_pub_e' + i + '" value="' + blEsc(list[i]).replace(/"/g, '&quot;') + '" style="width:100%">' +
    ' <button class="btn btn-primary btn-sm" style="padding:2px 10px" onclick="blPubSave(' + i + ')">Save</button>';
};
window.blPubSave = function(i){
  var list = blPublishers();
  var v = (document.getElementById('bl_pub_e' + i).value || '').trim();
  if(!v) return toast('Name cannot be empty', true);
  list[i] = v;
  blPersist();
  blShow('publishers');
  toast('✅ Publisher updated');
};
window.blPubDel = function(i){
  var list = blPublishers();
  if(!confirm('Delete publisher "' + list[i] + '"?')) return;
  list.splice(i, 1);
  blPersist();
  blShow('publishers');
  toast('🗑 Publisher deleted');
};

/* ── create ────────────────────────────────────────────────────── */
function blNewForm(){
  var y = new Date().getFullYear() + 1;
  return { id: null, grade: 'GRADE 9', year: y, checked: {}, rows: {}, stationery: '', supp: '', fresh: true };
}
function blCreateHTML(editId){
  var F = window.__blForm && window.__blForm || blNewForm();
  if(editId !== undefined && editId !== null){
    var ex = blLists().filter(function(l){ return String(l.id) === String(editId); })[0];
    if(ex){
      F = { id: ex.id, grade: ex.grade, year: ex.year, checked: {}, rows: {}, stationery: ex.stationery || '', supp: ('supp' in ex) ? (ex.supp || '') : null };
      (ex.items || []).forEach(function(it){
        F.checked[it.subject] = 1;
        F.rows[it.subject] = { title: it.title || '', publisher: it.publisher || '' };
      });
    }
  }
  window.__blForm = F;
  var subs = blSubjects();
  var pubs = blPublishers();
  var gradeOpts = BL_GRADES_ALL.map(function(g){
    return '<option value="' + g + '"' + (g === F.grade ? ' selected' : '') + '>' + g + '</option>';
  }).join('');
  var yearOpts = BL_YEARS.map(function(yy){
    return '<option value="' + yy + '"' + (yy === F.year ? ' selected' : '') + '>' + yy + '</option>';
  }).join('');
  var boxes = subs.map(function(s){
    var on = editId !== undefined && editId !== null ? !!F.checked[s.name] : true;
    return '<label style="display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12.5px;font-weight:700;cursor:pointer">' +
      '<input type="checkbox" data-bl-sub="' + blEsc(s.name).replace(/"/g, '&quot;') + '"' + (on ? ' checked' : '') +
      ' onchange="blFormChanged()" style="width:16px;height:16px;accent-color:var(--emerald)"> ' + blEsc(s.name) + '</label>';
  }).join('');
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">' +
    (F.id ? '✏️ EDIT BOOKLIST' : '➕ CREATE BOOKLIST') + '</div>' +
    '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px">' +
    '<div class="form-group" style="margin:0"><label>Grade *</label>' +
    '<select id="bl_f_grade" onchange="blFormChanged()" style="width:100%">' + gradeOpts + '</select></div>' +
    '<div class="form-group" style="margin:0"><label>Academic year *</label>' +
    '<select id="bl_f_year" onchange="blFormChanged()" style="width:100%">' + yearOpts + '</select></div></div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:8px">✔ TICK SUBJECTS TAUGHT IN THIS GRADE</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:14px">' + (boxes || '<div class="muted">Add subjects first (Subjects button).</div>') + '</div>' +
    '<div id="bl_f_table"></div>' +
    '<div class="form-group" style="margin:14px 0"><label>Stationeries and other requirements</label>' +
    '<textarea id="bl_f_stat" rows="5" placeholder="e.g.&#10;15 Exercise books (2 square ruled) A4 or A5 200pages.&#10;Geometrical set&#10;Graph book" style="width:100%">' + blEsc(F.stationery) + '</textarea></div>' +
    '<div class="form-group" style="margin:0 0 14px"><label>Supplementary revision books (optional)</label>' +
    '<textarea id="bl_f_supp" rows="3" placeholder="e.g.&#10;KJSEA Mirror series by Spotlight publishers." style="width:100%">' + blEsc(F.supp == null ? '' : F.supp) + '</textarea></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-primary" onclick="blFormSubmit()">💾 ' + (F.id ? 'Save Changes' : 'Submit Booklist') + '</button></div>';
}
/* Capture typed titles/publishers/grade/year/stationery into the draft so
   re-rendering the table (or navigating) never loses them. */
function blCaptureForm(){
  var F = window.__blForm;
  if(!F) return F;
  var g = document.getElementById('bl_f_grade');
  var y = document.getElementById('bl_f_year');
  var st = document.getElementById('bl_f_stat');
  if(g) F.grade = g.value;
  if(y) F.year = parseInt(y.value, 10) || F.year;
  if(st) F.stationery = st.value;
  var sp = document.getElementById('bl_f_supp');
  if(sp) F.supp = sp.value;
  F.checked = {};
  document.querySelectorAll('#page-booklists input[data-bl-sub]:checked').forEach(function(cb){
    F.checked[cb.getAttribute('data-bl-sub')] = 1;
  });
  document.querySelectorAll('#page-booklists input[data-bl-title]').forEach(function(inp){
    var sn = inp.getAttribute('data-bl-title');
    if(!F.rows[sn]) F.rows[sn] = { title: '', publisher: '' };
    F.rows[sn].title = inp.value;
  });
  document.querySelectorAll('#page-booklists select[data-bl-pub]').forEach(function(sel){
    var sn = sel.getAttribute('data-bl-pub');
    if(!F.rows[sn]) F.rows[sn] = { title: '', publisher: '' };
    F.rows[sn].publisher = sel.value;
  });
  return F;
}
window.blFormChanged = function(){
  blCaptureForm();
  blRenderFormTable();
};
function blTitleCase(s){
  return String(s || '').toLowerCase().replace(/\b\w/g, function(ch){ return ch.toUpperCase(); });
}
function blAutoTitle(publisher, subject){
  var base = (String(publisher || '').trim() + ' ' + String(subject || '').trim()).trim();
  if(!base) return '';
  return blTitleCase(base);
}
function blRenderFormTable(){
  var F = window.__blForm;
  var box = document.getElementById('bl_f_table');
  if(!box || !F) return;
  var pubs = blPublishers();
  var names = Object.keys(F.checked);
  if(!names.length){
    box.innerHTML = '<div class="muted">Tick at least one subject above — the table appears here.</div>';
    return;
  }
  box.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
    '<thead><tr style="background:var(--surface-2)">' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">SUBJECT</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">BOOK TITLE</th>' +
    '<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">PUBLISHER</th></tr></thead><tbody>' +
    names.map(function(sn){
      var r = F.rows[sn] || { title: '', publisher: '' };
      var opts = '<option value="">-- Select --</option>' + pubs.map(function(p){
        return '<option value="' + blEsc(p).replace(/"/g, '&quot;') + '"' + (p === r.publisher ? ' selected' : '') + '>' + blEsc(p) + '</option>';
      }).join('');
      return '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="padding:8px 12px;font-weight:800">' + blEsc(sn) + '</td>' +
        '<td style="padding:8px 12px"><input data-bl-title="' + blEsc(sn).replace(/"/g, '&quot;') + '" value="' + blEsc(r.title).replace(/"/g, '&quot;') + '" placeholder="Book title…" style="width:100%"></td>' +
        '<td style="padding:8px 12px"><select data-bl-pub="' + blEsc(sn).replace(/"/g, '&quot;') + '" onchange="blPubPicked(this)" style="width:100%;min-width:140px">' + opts + '</select></td></tr>';
    }).join('') + '</tbody></table>' +
    '<div class="muted" style="margin-top:6px">Choosing a publisher auto-fills an empty (or auto-made) title — your own titles are never overwritten.</div>';
}
window.blPubPicked = function(sel){
  var sn = sel.getAttribute('data-bl-pub');
  blCaptureForm();
  var F = window.__blForm;
  if(!F) return;
  if(!F.rows[sn]) F.rows[sn] = { title: '', publisher: '' };
  var prev = F.rows[sn];
  var auto = blAutoTitle(sel.value, sn);
  var inp = document.querySelector('#page-booklists input[data-bl-title="' + sn.replace(/"/g, '\\"') + '"]');
  var cur = inp ? inp.value : prev.title;
  prev.publisher = sel.value;
  if(auto && (!cur || cur === prev.auto)){
    prev.title = auto;
    prev.auto = auto;
    if(inp) inp.value = auto;
  } else {
    prev.title = cur;
    if(auto) prev.auto = auto;
  }
};
window.blFormSubmit = function(){
  var F = blCaptureForm();
  if(!F) return;
  var names = Object.keys(F.checked);
  if(!names.length) return toast('Tick at least one subject first', true);
  var items = [];
  for(var i = 0; i < names.length; i++){
    var sn = names[i];
    var tEl = document.querySelector('#page-booklists input[data-bl-title="' + sn.replace(/"/g, '\\"') + '"]');
    var pEl = document.querySelector('#page-booklists select[data-bl-pub="' + sn.replace(/"/g, '\\"') + '"]');
    var title = tEl ? tEl.value.trim() : ((F.rows[sn] || {}).title || '');
    var pub = pEl ? pEl.value : ((F.rows[sn] || {}).publisher || '');
    if(!title) return toast('Enter a book title for ' + sn, true);
    if(!pub) return toast('Select a publisher for ' + sn, true);
    items.push({ subject: sn, title: title, publisher: pub });
  }
  var lists = blLists();
  if(F.id){
    var ex = lists.filter(function(l){ return String(l.id) === String(F.id); })[0];
    if(ex){ ex.grade = F.grade; ex.year = F.year; ex.items = items; ex.stationery = F.stationery; ex.supp = F.supp || ''; ex.updated = Date.now(); }
  } else {
    lists.push({ id: 'BL' + Date.now().toString(36) + Math.floor(Math.random() * 999),
      grade: F.grade, year: F.year, items: items, stationery: F.stationery, supp: F.supp || '', createdAt: Date.now() });
  }
  window.__blForm = null;
  blPersist();
  toast(F.id ? '✅ Booklist updated' : '✅ Booklist submitted');
  blShow('view');
};

/* ── view ──────────────────────────────────────────────────────── */
function blViewHTML(){
  var lists = blLists().slice().sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
  if(!lists.length)
    return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📁 CREATED BOOKLISTS</div>' +
      '<div class="empty-state"><div class="empty-icon">📁</div><p>No booklists yet — create one first.</p></div>';
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">📁 CREATED BOOKLISTS (' + lists.length + ')</div>' +
    lists.map(function(l){
      return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<div><div style="font-weight:800;color:var(--gold)">' + blEsc(l.grade) + ' BOOKLIST ' + blEsc(l.year) + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted)">' + (l.items || []).length + ' subjects</div></div>' +
        '<span style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn btn-ghost btn-sm" onclick="blEditList(\'' + l.id + '\')">✏️ Edit</button>' +
        '<button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="blDelList(\'' + l.id + '\')">🗑 Delete</button></span></div></div>';
    }).join('');
}
window.blEditList = function(id){
  blShowCreateEdit(id);
};
function blShowCreateEdit(id){
  var wrap = document.getElementById('bl_view');
  wrap.innerHTML = '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="blShow(\'hub\')">← Back</button></div>' +
    blCreateHTML(id);
  blRenderFormTable();
  var F = window.__blForm;
  if(F){
    var g = document.getElementById('bl_f_grade'); if(g) g.value = F.grade;
    var y = document.getElementById('bl_f_year'); if(y) y.value = String(F.year);
  }
}
window.blDelList = function(id){
  var lists = blLists();
  var l = lists.filter(function(x){ return String(x.id) === String(id); })[0];
  if(!l) return;
  if(!confirm('Delete ' + l.grade + ' booklist ' + l.year + '?')) return;
  blDbListsSplice(id);
  blPersist();
  blShow('view');
  toast('🗑 Booklist deleted');
};
function blDbListsSplice(id){
  var db = blDb();
  db.booklists = (db.booklists || []).filter(function(x){ return String(x.id) !== String(id); });
};

/* ── export view ───────────────────────────────────────────────── */
function blExportHTML(){
  var lists = blLists().slice().sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
  var opts = lists.map(function(l){
    return '<option value="' + l.id + '">' + blEsc(l.grade) + ' BOOKLIST ' + blEsc(l.year) + ' (' + (l.items || []).length + ' subjects)</option>';
  }).join('');
  var lh = blLetterhead();
  return '<div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px;letter-spacing:.06em">⬇️ EXPORT BOOKLIST</div>' +
    '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:14px">' +
    '<div style="font-size:12px;font-weight:800;color:var(--sky);margin-bottom:8px">✉️ LETTERHEAD FOR EXPORTS</div>' +
    '<label style="display:flex;align-items:center;gap:9px;font-size:13px;cursor:pointer;margin-bottom:8px">' +
    '<input type="checkbox" id="bl_lh_show"' + (lh.show ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:var(--emerald)"> Include the letterhead in exports</label>' +
    '<div class="form-group" style="margin:0 0 8px"><label>Edit letterhead (one per line)</label>' +
    '<textarea id="bl_lh_text" rows="4" style="width:100%">' + blEsc(lh.lines.join('\n')) + '</textarea></div>' +
    '<button class="btn btn-ghost btn-sm" onclick="blLetterheadSave()">💾 Save Letterhead</button></div>' +
    '<div class="form-group" style="margin-bottom:14px"><label>Select booklist</label>' +
    '<select id="bl_x_sel" style="width:100%">' + (opts || '<option value="">— No booklists yet —</option>') + '</select></div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px">SINGLE BOOKLIST</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">' +
    '<button class="btn btn-pdf" onclick="blExportOne(\'pdf\')">📄 PDF (A4 landscape)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#1a5fa8,#3a9bff)" onclick="blExportOne(\'word\')">📝 Word (A4 landscape)</button>' +
    '<button class="btn btn-pdf" style="background:linear-gradient(135deg,#145a32,#27ae60)" onclick="blExportOne(\'excel\')">📊 Excel</button></div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px">ALL BOOKLISTS IN ONE FILE</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost" onclick="blExportAll(\'pdf\')">📄 Export ALL (PDF)</button>' +
    '<button class="btn btn-ghost" onclick="blExportAll(\'word\')">📝 Export ALL (Word)</button>' +
    '<button class="btn btn-ghost" onclick="blExportAll(\'excel\')">📊 Export ALL (Excel)</button></div>';
}
function blSelList(){
  var id = (document.getElementById('bl_x_sel') || {}).value || '';
  var l = blLists().filter(function(x){ return String(x.id) === String(id); })[0];
  if(!l) toast('Select a booklist first', true);
  return l || null;
}
window.blExportOne = function(fmt){
  var l = blSelList();
  if(!l) return;
  if(fmt === 'pdf') blExportPDF([l]);
  else if(fmt === 'word') blExportWord([l]);
  else blExportExcel([l]);
};
window.blExportAll = function(fmt){
  var lists = blLists().slice().sort(function(a, b){ return (b.createdAt || 0) - (a.createdAt || 0); });
  if(!lists.length) return toast('No booklists to export', true);
  if(fmt === 'pdf') blExportPDF(lists);
  else if(fmt === 'word') blExportWord(lists);
  else blExportExcel(lists);
};

/* ── shared doc model (mirrors the sample booklist) ────────────── */
function blDoc(list){
  var lh = blLetterhead();
  var stationery = String(list.stationery || '');
  var suppLines = null;
  if(list && ('supp' in list)){
    // Explicit supplementary box (may be empty = none).
    suppLines = String(list.supp || '').split('\n').map(function(s){ return s.trim(); })
      .filter(function(s){ return s; });
  }
  return {
    title: (list.grade + ' BOOKLIST ' + list.year).toUpperCase(),
    head: lh.show ? lh.lines.slice() : [],
    rows: (list.items || []).map(function(it){
      return [String(it.subject || '').trim(), String(it.title || '').trim(), String(it.publisher || '').trim()];
    }),
    stationery: stationery,
    supp: suppLines
  };
}
function blStripMarker(line){
  // Remove pasted list markers: common bullets, tabs/spaces, and the
  // Unicode private-use range (e.g. Word/FontAwesome bullets like U+F076,
  // which PDFs render as a stray "ðv"-like artifact). Content in
  // parentheses or starting with digits is preserved.
  return String(line || '').replace(/^[•❖▪▸►◦\-\*·\u2000-\u206F\uF000-\uF8FF\t ]+/, '').trim();
}
function blStationeryParts(text, suppOverride){
  // Split stationery into bullet lines + a trailing "supplementary" block.
  // An explicit supplementary box (even empty) wins over text parsing.
  var bullets = [], suppHead = null, supp = [];
  String(text || '').split('\n').forEach(function(raw){
    var line = raw.trim();
    if(!line) return;
    if(/supplement/i.test(line)){ suppHead = blStripMarker(line); return; }
    if(suppHead !== null){ supp.push(blStripMarker(line)); return; }
    bullets.push(blStripMarker(line));
  });
  if(suppOverride !== undefined && suppOverride !== null){
    return { bullets: bullets, suppHead: suppOverride.length ? 'Supplementary Revision Text Books (Optional)' : null, supp: suppOverride };
  }
  return { bullets: bullets, suppHead: suppHead, supp: supp };
}
function blLogoURL(){
  try{
    if(typeof SCHOOL_LOGO_DATAURL === 'string' && SCHOOL_LOGO_DATAURL.indexOf('data:image') === 0)
      return SCHOOL_LOGO_DATAURL;
  }catch(e){}
  return '';
}
function blFileBase(list){
  return ((list.grade || 'booklist') + '_Booklist_' + (list.year || '')).replace(/\s+/g, '_').slice(0, 60);
}
function blUnderlineCenter(doc, text, cx, y){
  try{
    if(typeof doc.getTextWidth !== 'function') return;
    var w = doc.getTextWidth(text);
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.45);
    doc.line(cx - w / 2, y + 1, cx + w / 2, y + 1);
  }catch(e){}
}
function blUnderlineLeft(doc, text, x, y){
  try{
    if(typeof doc.getTextWidth !== 'function') return;
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.45);
    doc.line(x, y + 1, x + doc.getTextWidth(text), y + 1);
  }catch(e){}
}
/* ── PDF export: landscape A4, two identical columns ───────────── */
window.blExportPDF = function(lists){ blExportPDFDoc(lists); };
function blExportPDFDoc(lists){
  try{
    var jsPDF = window._getJsPDF();
    var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    var W = 297, H = 210, m = 10, gap = 6;
    var colW = (W - m * 2 - gap) / 2, colX = [m, m + colW + gap];
    // vertical divider
    lists.forEach(function(list, li){
      if(li > 0) doc.addPage();
      var d = blDoc(list);
      // divider full height
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.35);
      doc.line(m + colW + gap / 2, m, m + colW + gap / 2, H - m);
      drawCol(0, d);
      drawCol(1, d);
    });
    function drawCol(ci, d){
      var X = colX[ci], y = m, endX = X + colW;
      var lines = d.head || [];
      var logo = lines.length ? blLogoURL() : '';
      if(logo){
        try{ doc.addImage(logo, 'JPEG', X + 2, y, 21, 21); }catch(e){}
      }
      if(lines.length){
        doc.setTextColor(0, 0, 0);
        lines.forEach(function(line, i){
          var motto = /^motto:/i.test(line) && i === lines.length - 1;
          doc.setFont('times', motto ? 'italic' : 'bold');
          doc.setFontSize(i === 0 ? 16 : 10.5);
          y += i === 0 ? 6.4 : 4.7;
          doc.text(line, X + colW / 2, y, { align: 'center' });
        });
        y += 4.2;
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.9);
        doc.line(X, y, endX, y); y += 1.3;
        doc.setLineWidth(0.45);
        doc.line(X, y, endX, y); y += 5;
      }
      doc.setFont('times', 'bold'); doc.setFontSize(13.5); doc.setTextColor(0, 0, 0);
      doc.text(d.title, X + colW / 2, y, { align: 'center' });
      blUnderlineCenter(doc, d.title, X + colW / 2, y);
      y += 8;
      doc.autoTable({
        startY: y, head: [['SUBJECT', 'BOOK TITLE', 'PUBLISHER']], body: d.rows,
        theme: 'grid', tableWidth: colW, margin: { left: X },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], font: 'times', fontStyle: 'bold', fontSize: 9.5 },
        styles: { font: 'times', fontSize: 9, cellPadding: 1.8, lineColor: [0, 0, 0], lineWidth: 0.3, textColor: [0, 0, 0] },
        columnStyles: { 0: { cellWidth: colW * 0.34 }, 1: { cellWidth: colW * 0.40 }, 2: { cellWidth: colW * 0.26 } }
      });
      y = doc.lastAutoTable.finalY + 5;
      // requirements box
      var parts = blStationeryParts(d.stationery, d.supp);
      var boxY = y;
      var reqHead = BL_REQ_HEAD;
      doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 0, 0);
      doc.text(reqHead, X + 2, y + 4.5);
      blUnderlineLeft(doc, reqHead, X + 2, y + 4.5);
      y += 9;
      doc.setFont('times', 'normal'); doc.setFontSize(9);
      parts.bullets.forEach(function(b){
        var wrapped = doc.splitTextToSize('•  ' + String(b), colW - 16);
        doc.text(wrapped, X + 10, y);
        y += wrapped.length * 4.1;
      });
      if(parts.suppHead){
        y += 2.5;
        doc.setFont('times', 'bold'); doc.setFontSize(10.5);
        var hl = doc.splitTextToSize(parts.suppHead, colW - 6);
        doc.text(hl, X + 2, y);
        hl.forEach(function(line, i){ blUnderlineLeft(doc, line, X + 2, y + i * 4.6); });
        y += hl.length * 4.6 + 1.5;
        doc.setFont('times', 'normal'); doc.setFontSize(9);
        parts.supp.forEach(function(b){
          var wrapped = doc.splitTextToSize('•  ' + b, colW - 16);
          doc.text(wrapped, X + 10, y);
          y += wrapped.length * 4.1;
        });
      }
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.45);
      doc.rect(X, boxY, colW, y - boxY + 2.5);
    }
    var fname = lists.length === 1 ? blFileBase(lists[0]) : 'All_Booklists';
    doc.save(fname + '_A4_landscape.pdf');
    toast('📄 Booklist PDF exported');
  }catch(err){ toast('PDF export failed: ' + (err && err.message || err), true); }
}

/* ── Word export: landscape, 1×2 outer table (divider in the middle) ── */
window.blExportWord = function(lists){ blExportWordDoc(lists); };
function blExportWordDoc(lists){
  try{
    if(typeof docx === 'undefined') return toast('Word library not loaded', true);
    var D = window.docx;
    var kids = [];
    lists.forEach(function(list, li){
      var d = blDoc(list);
      var parts = blStationeryParts(d.stationery, d.supp);
      function colKids(){
        var c = [];
        var lines = d.head || [];
        var logo = lines.length ? blLogoURL() : '';
        function headParas(){
          return lines.map(function(line, i){
            var motto = /^motto:/i.test(line) && i === lines.length - 1;
            return new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
              new D.TextRun({ text: line, bold: !motto, italics: motto, size: i === 0 ? 32 : 21, font: 'Times New Roman', color: '000000' })] });
          });
        }
        function noBorders(){
          var side = { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' };
          return { top: side, bottom: side, left: side, right: side };
        }
        if(lines.length){
          if(logo){
            try{
              var logoPara = new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
                new D.ImageRun({ data: logo, transformation: { width: 105, height: 105 } })] });
              c.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: noBorders(), rows: [
                new D.TableRow({ children: [
                  new D.TableCell({ width: { size: 20, type: D.WidthType.PERCENTAGE }, borders: noBorders(), verticalAlign: D.VerticalAlign ? D.VerticalAlign.CENTER : undefined, children: [logoPara] }),
                  new D.TableCell({ width: { size: 80, type: D.WidthType.PERCENTAGE }, borders: noBorders(), verticalAlign: D.VerticalAlign ? D.VerticalAlign.CENTER : undefined, children: headParas() })
                ] })
              ] }));
            }catch(e){ c = c.concat(headParas()); }
          }else{
            c = c.concat(headParas());
          }
          c.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, border: { bottom: { style: D.BorderStyle.DOUBLE, size: 12, color: '000000' } }, children: [
            new D.TextRun({ text: '', size: 4, font: 'Times New Roman', color: '000000' })] }));
        }
        c.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
          new D.TextRun({ text: d.title, bold: true, underline: D.UnderlineType ? { type: D.UnderlineType.SINGLE } : {}, size: 28, font: 'Times New Roman', color: '000000' })] }));
        var colWidths = [2448, 2880, 1872];
        var headRow = new D.TableRow({ tableHeader: true, children: ['SUBJECT', 'BOOK TITLE', 'PUBLISHER'].map(function(h, i){
          return new D.TableCell({ width: { size: colWidths[i], type: D.WidthType.DXA }, children: [new D.Paragraph({ children: [new D.TextRun({ text: h, bold: true, size: 19, font: 'Times New Roman' })] })] });
        }) });
        var bodyRows = d.rows.map(function(r){
          return new D.TableRow({ children: r.map(function(cell, i){
            return new D.TableCell({ width: { size: colWidths[i], type: D.WidthType.DXA }, children: [new D.Paragraph({ children: [new D.TextRun({ text: cell, size: 18, font: 'Times New Roman' })] })] });
          }) });
        });
        var bdr = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
        var bb = { top: bdr, bottom: bdr, left: bdr, right: bdr };
        c.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, layout: D.TableLayoutType ? D.TableLayoutType.FIXED : undefined, borders: bb, rows: [headRow].concat(bodyRows) }));
        var reqKids = [new D.Paragraph({ children: [new D.TextRun({ text: BL_REQ_HEAD, bold: true, underline: D.UnderlineType ? { type: D.UnderlineType.SINGLE } : {}, size: 21, font: 'Times New Roman' })] })];
        parts.bullets.forEach(function(b){
          reqKids.push(new D.Paragraph({ children: [new D.TextRun({ text: '•  ' + b, size: 19, font: 'Times New Roman' })] }));
        });
        if(parts.suppHead){
          reqKids.push(new D.Paragraph({ children: [new D.TextRun({ text: parts.suppHead, bold: true, underline: D.UnderlineType ? { type: D.UnderlineType.SINGLE } : {}, size: 20, font: 'Times New Roman' })] }));
          parts.supp.forEach(function(b){
            reqKids.push(new D.Paragraph({ children: [new D.TextRun({ text: '•  ' + b, size: 19, font: 'Times New Roman' })] }));
          });
        }
        c.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: bb, rows: [
          new D.TableRow({ children: [new D.TableCell({ children: reqKids })] })
        ] }));
        return c;
      }
      var mid = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
      kids.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [
        new D.TableRow({ children: [
          new D.TableCell({ width: { size: 49, type: D.WidthType.PERCENTAGE },
            borders: { top: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' }, bottom: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' }, left: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' }, right: mid },
            children: colKids() }),
          new D.TableCell({ width: { size: 49, type: D.WidthType.PERCENTAGE },
            borders: { top: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' }, bottom: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' }, left: mid, right: { style: D.BorderStyle.NIL, size: 0, color: 'FFFFFF' } },
            children: colKids() })
        ] })
      ] }));
      if(li < lists.length - 1)
        kids.push(new D.Paragraph({ children: [new D.PageBreak()] }));
    });
    var docFile = new D.Document({ sections: [{ properties: { page: {
      size: { width: 16838, height: 11906 },
      margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: kids }] });
    D.Packer.toBlob(docFile).then(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (lists.length === 1 ? blFileBase(lists[0]) : 'All_Booklists') + '_A4_landscape.docx';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      toast('📝 Booklist Word exported');
    });
  }catch(err){ toast('Word export failed: ' + (err && err.message || err), true); }
}

/* ── Excel export: landscape sheets, two side-by-side copies ──────── */
window.blExportExcel = function(lists){
  if(typeof ensureXLSX === 'function') return ensureXLSX(function(){ blExportExcelDoc(lists); });
  blExportExcelDoc(lists);
};
function blExportExcelDoc(lists){
  try{
    var XL = window.XLSX;
    if(!XL) return toast('Excel library not loaded', true);
    var wb = XL.utils.book_new();
    lists.forEach(function(list){
      var d = blDoc(list);
      var parts = blStationeryParts(d.stationery, d.supp);
      var aoa = [];
      (d.head || []).forEach(function(h){ aoa.push(['', h]); });
      aoa.push([]);
      aoa.push(['', d.title]);
      aoa.push([]);
      aoa.push(['', 'SUBJECT', 'BOOK TITLE', 'PUBLISHER', '', 'SUBJECT', 'BOOK TITLE', 'PUBLISHER']);
      d.rows.forEach(function(r){ aoa.push(['', r[0], r[1], r[2], '', r[0], r[1], r[2]]); });
      aoa.push([]);
      aoa.push(['', BL_REQ_HEAD, '', '', '', BL_REQ_HEAD]);
      var maxB = Math.max(parts.bullets.length, 1);
      for(var i = 0; i < maxB; i++){
        var marker = parts.bullets[i] ? '•  ' + parts.bullets[i] : '';
        aoa.push(['', marker, '', '', '', marker, '', '']);
      }
      if(parts.suppHead){
        aoa.push(['', parts.suppHead, '', '', '', parts.suppHead]);
        var maxS = Math.max(parts.supp.length, 1);
        for(var j = 0; j < maxS; j++){
          var suppMarker = parts.supp[j] ? '•  ' + parts.supp[j] : '';
          aoa.push(['', suppMarker, '', '', '', suppMarker, '', '']);
        }
      }
      var ws = XL.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [{ wch: 3 }, { wch: 26 }, { wch: 34 }, { wch: 20 }, { wch: 3 }, { wch: 26 }, { wch: 34 }, { wch: 20 }];
      ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9, fitToWidth: 1, fitToHeight: 1 };
      XL.utils.book_append_sheet(wb, ws, (list.grade + ' ' + list.year).slice(0, 31));
    });
    XL.writeFile(wb, (lists.length === 1 ? blFileBase(lists[0]) : 'All_Booklists') + '_A4_landscape.xlsx');
    toast('📊 Booklist Excel exported');
  }catch(err){ toast('Excel export failed: ' + (err && err.message || err), true); }
}

})();
