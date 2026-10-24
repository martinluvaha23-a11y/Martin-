/* ═══════════════════════════════════════════════════════════════════════════
   SUBJECTS HUB — the school's subject registry, wired into everything.

   📚 Subjects (nav) → list of all saved subjects (add / rename / delete)
      → click a subject → every grade it's taught in, its teacher per grade
        and its weekly lessons per grade
        → click a grade → teacher dropdown (reassign), editable singles &
           doubles — the same allocation the Timetable Generator uses.

   The registry syncs with the server (kv key "subjects" → db.subjects).
   Teacher-per-grade changes write into db.teachers assignments (synced).
   Lesson counts write into the class-lessons store the generator reads.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const DEFAULT_SUBJECTS = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT','PTE','ENVIRON','C/ARTS'];

const SUB = { view: { type: 'list' } };

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function pLabel(i){ return 'P' + (i + 1); }
function fmtT(name){ return (typeof fmtTeacher === 'function') ? fmtTeacher(name) : name; }

/* ── registry (synced via db.subjects) ───────────────────────────────────── */
function registry(){
  let r = (db.subjects || []).map(s => String(s).trim()).filter(Boolean);
  if (!r.length) {
    const set = new Set(DEFAULT_SUBJECTS);
    (db.teachers || []).forEach(t => (t.assignments || []).forEach(a => {
      if (a.subject) set.add(String(a.subject).trim());
    }));
    r = [...set].sort();
    db.subjects = r;
    if (typeof saveDB === 'function') { try { saveDB(); } catch (e) {} }
  }
  return r;
}
function setRegistry(list){
  db.subjects = [...new Set(list.map(s => String(s).trim()).filter(Boolean))];
  if (typeof saveDB === 'function') { try { saveDB(); } catch (e) {} }
}

/* ── grades ──────────────────────────────────────────────────────────────── */
function allGrades(){
  const set = new Set();
  (db.students || []).forEach(s => { if (s.grade) set.add(String(s.grade).trim()); });
  (db.teachers || []).forEach(t => (t.assignments || []).forEach(a =>
    (Array.isArray(a.classes) ? a.classes : String(a.classes || '').split(','))
      .map(c => String(c).trim()).filter(Boolean).forEach(c => set.add(c))));
  return [...set].filter(Boolean).sort((a, b) =>
    (parseInt(a, 10) - parseInt(b, 10)) || a.localeCompare(b));
}

/* ── teacher assignment operations (synced via db.teachers) ──────────────── */
function teacherRecordByFormatted(fmt){
  return (db.teachers || []).find(t => fmtT(t.name) === fmt);
}
function teacherOf(subj, grade){
  return (db.teachers || []).find(t =>
    (t.assignments || []).some(a => a.subject === subj && (Array.isArray(a.classes) ? a.classes : []).includes(grade)));
}
function unassignFromAll(subj, grade){
  (db.teachers || []).forEach(t => {
    const a = (t.assignments || []).find(a => a.subject === subj &&
      (Array.isArray(a.classes) ? a.classes : []).includes(grade));
    if (a) {
      a.classes = a.classes.filter(c => c !== grade);
      if (!a.classes.length) t.assignments = t.assignments.filter(x => x !== a);
    }
  });
}
function assignTo(subj, grade, teacherId){
  unassignFromAll(subj, grade);
  const t = (db.teachers || []).find(x => x.id === teacherId);
  if (!t) return;
  t.assignments = t.assignments || [];
  let a = t.assignments.find(a => a.subject === subj);
  if (!a) { a = { subject: subj, classes: [] }; t.assignments.push(a); }
  if (!a.classes.includes(grade)) a.classes.push(grade);
}
function gradesOf(subj){
  const set = new Set();
  (db.teachers || []).forEach(t => (t.assignments || []).forEach(a => {
    if (a.subject === subj) (Array.isArray(a.classes) ? a.classes : []).forEach(c => set.add(String(c).trim()));
  }));
  (allGrades()).forEach(g => {
    try { if (typeof ttClassHas === 'function' && ttClassHas(g, subj)) set.add(g); } catch (e) {}
  });
  return [...set].filter(Boolean).sort((a, b) => (parseInt(a, 10) - parseInt(b, 10)) || a.localeCompare(b));
}

/* ── cascades ────────────────────────────────────────────────────────────── */
function renameSubject(oldN, newN){
  newN = newN.trim();
  if (!newN) { toast('⚠️ Type the new subject name.', true); return false; }
  if (newN === oldN) return true;
  const reg = registry().map(s => (s === oldN ? newN : s));
  setRegistry(reg);
  (db.teachers || []).forEach(t => (t.assignments || []).forEach(a => {
    if (a.subject === oldN) a.subject = newN;
  }));
  try { if (window.__classLessons) window.__classLessons.rename(oldN, newN); } catch (e) {}
  if (typeof saveDB === 'function') { try { saveDB(); } catch (e) {} }
  return true;
}
function deleteSubject(name){
  setRegistry(registry().filter(s => s !== name));
  (db.teachers || []).forEach(t => {
    const a = (t.assignments || []).find(a => a.subject === name);
    if (a) t.assignments = t.assignments.filter(x => x !== a);
  });
  try { if (window.__classLessons) window.__classLessons.zeroEverywhere(name); } catch (e) {}
  if (typeof saveDB === 'function') { try { saveDB(); } catch (e) {} }
}

/* ── rendering ───────────────────────────────────────────────────────────── */
function ensureContainer(){
  const page = document.getElementById('page-subjects');
  if (!page) return null;
  const hub = document.getElementById('subjHub');
  return hub || null;
}

window.renderSubjectsHub = function(){
  const hub = ensureContainer();
  if (!hub) return;
  if (SUB.view.type === 'subject') renderSubjectPage(hub);
  else if (SUB.view.type === 'grade') renderGradePage(hub);
  else renderList(hub);
};

/* Level 1 — all subjects */
function renderList(hub){
  const subjects = registry();
  const grades = allGrades();
  const rows = subjects.map(s => {
    const gs = gradesOf(s);
    let total = 0;
    gs.forEach(g => { try { total += (typeof ttClassTarget === 'function') ? ttClassTarget(s, g) : 3; } catch (e) {} });
    const teacherCount = new Set(gs.map(g => {
      const t = teacherOf(s, g);
      return t ? t.id : null;
    }).filter(Boolean)).size;
    return '<div class="tch-row" onclick="subjOpen(\'' + esc(s) + '\')">'
      + '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">'
      + '<span style="font-size:19px">📘</span>'
      + '<div style="min-width:0"><div style="font-weight:800;color:var(--text)">' + esc(s) + '</div>'
      + '<div style="font-size:10.5px;color:var(--text-muted)">taught in ' + gs.length + ' grade' + (gs.length === 1 ? '' : 's')
      + (teacherCount ? ' · ' + teacherCount + ' teacher' + (teacherCount === 1 ? '' : 's') : '') + '</div></div></div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div style="font-weight:900;color:var(--sky);font-size:15px">' + total + '</div>'
      + '<div style="font-size:9.5px;color:var(--text-muted);letter-spacing:.05em">LESSONS/WEEK</div></div>'
      + '<div style="flex-shrink:0;color:var(--text-muted);font-size:16px;padding:0 4px">›</div></div>';
  }).join('');

  hub.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">'
    + '<div style="font-size:12px;font-weight:800;color:var(--sky)">📚 SCHOOL SUBJECTS</div>'
    + '<span style="font-size:10.5px;color:var(--text-muted)">click a subject to see its grades, teachers & weekly lessons</span>'
    + '</div>'
    + '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px">'
    + '<div class="dr-field"><label for="subjNewName">New subject</label>'
    + '<input id="subjNewName" placeholder="e.g. FRENCH" style="width:190px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:700"></div>'
    + '<button class="dr-btn" onclick="subjAdd()" style="font-size:12px;padding:8px 16px">➕ Add subject</button>'
    + '</div>'
    + (rows || '<div class="empty-state"><p>No subjects yet.</p></div>');
}
window.subjAdd = function(){
  const inp = document.getElementById('subjNewName');
  const name = (inp && inp.value || '').trim();
  if (!name) { toast('⚠️ Type the subject name.', true); return; }
  const reg = registry();
  if (reg.some(s => s.toLowerCase() === name.toLowerCase())) { toast('⚠️ That subject already exists.', true); return; }
  setRegistry([...reg, name].sort((a, b) => a.localeCompare(b)));
  toast('✅ ' + name + ' added.');
  renderSubjectsHub();
};

/* Level 2 — one subject: grades, teachers, lessons */
window.subjOpen = function(name){ SUB.view = { type: 'subject', name }; renderSubjectsHub(); };
window.subjBack = function(){ SUB.view = { type: 'list' }; renderSubjectsHub(); };

function renderSubjectPage(hub){
  const name = SUB.view.name;
  const gs = gradesOf(name);
  const freeGrades = allGrades().filter(g => !gs.includes(g));
  let total = 0;
  gs.forEach(g => { try { total += (typeof ttClassTarget === 'function') ? ttClassTarget(name, g) : 3; } catch (e) {} });

  const rows = gs.length ? gs.map(g => {
    const t = teacherOf(name, g);
    const n = (typeof ttClassTarget === 'function') ? ttClassTarget(name, g) : 3;
    const d = (typeof ttClassDoubles === 'function') ? ttClassDoubles(name, g) : 0;
    return '<div class="tch-row" style="padding:9px 12px" onclick="subjOpenGrade(\'' + esc(name) + '\',\'' + esc(g) + '\')">'
      + '<div style="display:flex;align-items:center;gap:9px;flex:1">'
      + '<span style="font-weight:900;color:var(--text);min-width:44px">' + esc(g) + '</span>'
      + '<span style="font-size:11px;color:var(--text-muted)">' + (t ? '🧑‍🏫 ' + esc(fmtT(t.name)) : '<i>no teacher assigned</i>') + '</span>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<span style="font-weight:900;color:var(--sky)">' + n + '</span>'
      + '<span style="font-size:9.5px;color:var(--text-muted)"> /week</span>'
      + (d ? ' <span style="font-size:9.5px;color:var(--gold)">' + d + '×double</span>' : '')
      + '</div><div style="color:var(--text-muted)">›</div></div>';
  }).join('') : '<div style="font-size:11px;color:var(--text-muted)">Not allocated to any grade yet — add one below.</div>';

  const addGrade = freeGrades.length ? (
    '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-top:9px">'
    + '<div class="dr-field"><label>Add grade</label>'
    + '<select id="subjAddGrade" style="width:110px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:700">'
    + freeGrades.map(g => '<option>' + esc(g) + '</option>').join('') + '</select></div>'
    + '<div class="dr-field"><label>with teacher</label>'
    + teacherSelect('subjAddTeacher', null)
    + '</div>'
    + '<button class="dr-btn" onclick="subjAddGrade()" style="font-size:12px;padding:8px 16px">➕ Add</button>'
    + '</div>') : '';

  hub.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">'
    + '<button class="btn btn-sm" onclick="subjBack()" style="font-size:11px">← All subjects</button>'
    + '<div style="font-size:15px;font-weight:900;color:var(--text)">' + esc(name) + '</div>'
    + '</div>'
    + '<div class="dr-chip">🏫 taught in ' + gs.length + ' grade' + (gs.length === 1 ? '' : 's') + '</div>'
    + '<div class="dr-chip">🧮 ' + total + ' lessons/week total</div>'
    + '<div class="card" style="margin-top:12px"><div class="card-body" style="padding:14px 16px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:8px">🏫 GRADES — click one to edit its teacher & lessons</div>'
    + rows + addGrade
    + '</div></div>'
    + '<div class="card" style="margin-top:12px"><div class="card-body" style="padding:14px 16px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:8px">✏️ RENAME OR DELETE THIS SUBJECT</div>'
    + '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">'
    + '<div class="dr-field"><label>Rename to</label>'
    + '<input id="subjRename" placeholder="' + esc(name) + '" style="width:190px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:700"></div>'
    + '<button class="btn btn-sm" onclick="subjRename(\'' + esc(name) + '\')" style="font-size:11px">✏️ Rename</button>'
    + '<button class="btn btn-danger btn-sm" id="subjDelBtn" onclick="subjDelete(\'' + esc(name) + '\', this)" style="font-size:11px">🗑 Delete subject</button>'
    + '</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-top:6px">Deleting removes it from every teacher and every class allocation (across the timetable generator too).</div>'
    + '</div></div>';
}
function teacherSelect(id, selected){
  const teachers = [...(db.teachers || [])].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return '<select id="' + id + '" style="min-width:180px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:700">'
    + '<option value="">— select teacher —</option>'
    + teachers.map(t => '<option value="' + esc(t.id) + '"' + (selected && t.id === selected ? ' selected' : '') + '>'
      + esc(fmtT(t.name)) + '</option>').join('')
    + '</select>';
}
window.subjAddGrade = function(){
  const name = SUB.view.name;
  const g = (document.getElementById('subjAddGrade') || {}).value;
  const tid = (document.getElementById('subjAddTeacher') || {}).value;
  if (!g) { toast('⚠️ Pick a grade.', true); return; }
  if (!tid) { toast('⚠️ Pick the teacher for this grade.', true); return; }
  assignTo(name, g, tid);
  const target = (typeof ttClassTarget === 'function') ? ttClassTarget(name, g) : 3;
  const d = (typeof ttClassDoubles === 'function') ? ttClassDoubles(name, g) : 0;
  window.ttClassSet(name, g, target, d);
  toast('✅ ' + name + ' allocated to ' + g + '.');
  renderSubjectsHub();
};

/* Level 3 — subject in one grade: teacher + lessons editor */
window.subjOpenGrade = function(name, grade){
  SUB.view = { type: 'grade', name, grade };
  renderSubjectsHub();
};
window.subjEditState = null;
function renderGradePage(hub){
  const name = SUB.view.name, grade = SUB.view.grade;
  const t = teacherOf(name, grade);
  if (!window.subjEditState || window.subjEditState.key !== grade + '|' + name) {
    const lessons = (typeof ttClassTarget === 'function') ? ttClassTarget(name, grade) : 3;
    let doubles = (typeof ttClassDoubles === 'function') ? ttClassDoubles(name, grade) : 0;
    doubles = Math.min(doubles, Math.floor(lessons / 2));
    window.subjEditState = { key: grade + '|' + name, lessons, doubles, singles: lessons - 2 * doubles };
  }
  const st = window.subjEditState;
  const ok = st.singles + 2 * st.doubles === st.lessons;
  /* preserve the teacher the user picked before an input re-render */
  const prevSel = document.getElementById('subjGradeTeacher');
  const selectedTeacher = prevSel ? (prevSel.value || (t ? t.id : '')) : (t ? t.id : '');
  hub.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">'
    + '<button class="btn btn-sm" onclick="subjOpen(\'' + esc(name) + '\')" style="font-size:11px">← ' + esc(name) + '</button>'
    + '<div style="font-size:14px;font-weight:900;color:var(--text)">'
    + '<span class="badge badge-blue" style="font-size:12px;margin-right:6px">' + esc(name) + '</span>'
    + 'Grade ' + esc(grade) + '</div></div>'
    + '<div class="card"><div class="card-body" style="padding:14px 16px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:10px">🧑‍🏫 SUBJECT TEACHER</div>'
    + teacherSelect('subjGradeTeacher', selectedTeacher)
    + '<div style="font-size:10px;color:var(--text-muted);margin:6px 0 0">Changing the teacher moves this class to them (and off the previous teacher) everywhere.</div>'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin:16px 0 10px">✏️ WEEKLY LESSONS</div>'
    + '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">'
    + numField('Lessons / week', 'subjInLessons', st.lessons, 'subjSetLessons(this.value)')
    + numField('…of which DOUBLES', 'subjInDoubles', st.doubles, 'subjSetDoubles(this.value)')
    + numField('…of which SINGLES', 'subjInSingles', st.singles, 'subjSetSingles(this.value)')
    + '</div>'
    + '<div style="margin-top:10px;font-size:12px;font-weight:800;color:' + (ok ? 'var(--emerald)' : 'var(--rose)') + '">'
    + (ok
        ? '✓ ' + st.lessons + ' lessons/week = ' + st.singles + ' single' + (st.singles === 1 ? '' : 's') + ' + ' + st.doubles + ' double' + (st.doubles === 1 ? '' : 's') + '</div>'
        : '⚠️ Singles + 2×Doubles must equal the weekly lessons.</div>')
    + '<div style="font-size:10px;color:var(--text-muted);margin-top:7px">These values drive the Timetable Generator for ' + esc(name) + ' in ' + esc(grade) + ' (same allocation as the 👩‍🏫 Teachers hub).</div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">'
    + '<button class="dr-btn" onclick="subjSaveGrade()" style="font-size:12px;padding:8px 18px">💾 Save</button>'
    + '<button class="btn btn-danger btn-sm" onclick="subjRemoveGrade()" style="font-size:11px">➖ Remove ' + esc(name) + ' from ' + esc(grade) + '</button>'
    + '</div></div></div>';
}
function numField(label, id, value, onchange){
  return '<div class="dr-field"><label for="' + id + '">' + label + '</label>'
    + '<input type="number" id="' + id + '" min="0" max="20" value="' + value + '" onchange="' + onchange + '"'
    + ' style="width:110px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:800;text-align:center;font-size:14px"></div>';
}
window.subjSetLessons = function(v){
  const st = window.subjEditState; if (!st) return;
  st.lessons = Math.max(0, Math.min(20, parseInt(v, 10) || 0));
  st.doubles = Math.min(st.doubles, Math.floor(st.lessons / 2));
  st.singles = st.lessons - 2 * st.doubles;
  renderSubjectsHub();
};
window.subjSetDoubles = function(v){
  const st = window.subjEditState; if (!st) return;
  st.doubles = Math.max(0, Math.min(Math.floor(st.lessons / 2), parseInt(v, 10) || 0));
  st.singles = st.lessons - 2 * st.doubles;
  renderSubjectsHub();
};
window.subjSetSingles = function(v){
  const st = window.subjEditState; if (!st) return;
  let s = Math.max(0, Math.min(st.lessons, parseInt(v, 10) || 0));
  st.doubles = Math.floor((st.lessons - s) / 2);
  st.singles = st.lessons - 2 * st.doubles;
  renderSubjectsHub();
};
window.subjSaveGrade = function(){
  const st = window.subjEditState; if (!st) return;
  const [grade, name] = st.key.split('|');
  if (st.singles + 2 * st.doubles !== st.lessons) { toast('⚠️ Singles + 2×Doubles must equal the weekly lessons.', true); return; }
  const tid = (document.getElementById('subjGradeTeacher') || {}).value;
  if (tid) assignTo(name, grade, tid);
  window.ttClassSet(name, grade, st.lessons, st.doubles);
  const t = teacherOf(name, grade);
  toast('✅ ' + name + ' (' + grade + '): ' + (t ? fmtT(t.name) : 'no teacher') + ' · ' + st.lessons + ' lessons/week.');
  renderSubjectsHub();
};
window.subjRemoveGrade = function(){
  const st = window.subjEditState; if (!st) return;
  const [grade, name] = st.key.split('|');
  unassignFromAll(name, grade);
  window.ttClassSet(name, grade, 0, 0);
  toast('➖ ' + name + ' removed from ' + grade + '.');
  SUB.view = { type: 'subject', name };
  renderSubjectsHub();
};
window.subjRename = function(name){
  const inp = document.getElementById('subjRename');
  const nn = (inp && inp.value || '').trim();
  if (!nn) { toast('⚠️ Type the new name.', true); return; }
  if (renameSubject(name, nn)) {
    toast('✅ Renamed to ' + nn + '.');
    SUB.view = { type: 'subject', name: nn };
    renderSubjectsHub();
  }
};
window.subjDelete = function(name, btn){
  if (!btn.dataset.armed) {
    btn.dataset.armed = '1';
    btn.textContent = '⚠️ Click again to confirm';
    setTimeout(() => { if (btn) { btn.dataset.armed = ''; btn.textContent = '🗑 Delete subject'; } }, 4000);
    return;
  }
  deleteSubject(name);
  toast('🗑 ' + name + ' deleted everywhere.');
  SUB.view = { type: 'list' };
  renderSubjectsHub();
};

/* ── hook into the app ───────────────────────────────────────────────────── */
(function styles(){
  if (document.getElementById('subj-hub-styles')) return;
  const st = document.createElement('style');
  st.id = 'subj-hub-styles';
  st.textContent = `
    .tch-row { display: flex; align-items: center; gap: 10px;
      background: var(--surface-2, rgba(30,60,120,.12));
      border: 1px solid var(--border, rgba(120,150,210,.25));
      border-radius: 10px; padding: 10px 14px; margin-bottom: 8px;
      cursor: pointer; transition: border-color .12s, background .12s; }
    .tch-row:hover { border-color: var(--sky, #38bdf8); background: rgba(30,86,200,.16); }
    .dr-field label { display:block; font-size:10px; font-weight:700; letter-spacing:.06em;
      color: var(--gold, #f2c744); text-transform: uppercase; margin-bottom:4px; }
  `;
  document.head.appendChild(st);
})();

function wrap(){
  if (typeof window.renderTeachersTable !== 'function' || window.renderTeachersTable.__subj) return false;
  const orig = window.renderTeachersTable;
  window.renderTeachersTable = function(){
    orig.apply(this, arguments);
    try { if (document.getElementById('page-subjects') && document.getElementById('page-subjects').classList.contains('open')) renderSubjectsHub(); } catch (e) {}
  };
  window.renderTeachersTable.__subj = true;
  return true;
}
if (!wrap()) {
  const t0 = setInterval(() => { if (wrap()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}

})();
