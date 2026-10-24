/* ═══════════════════════════════════════════════════════════════════════════
   TEACHERS HUB — drill-down teacher browser wired into the timetable solver.

   👩‍🏫 Teachers (nav) → list of all teachers with weekly lesson totals
      → click a teacher → their subject/class allocations + time-off grid
        → click a subject-class pair → editable lessons / singles / doubles

   Lesson allocations are stored PER CLASS & SUBJECT
   (localStorage: santapris_class_lessons_v1) and read by the solver through
   window.ttClassTarget / window.ttClassDoubles. Time-off is stored through
   the timetable advanced module (window.__ttaOff) so the generator honours it.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const CL_KEY = 'santapris_class_lessons_v1';
let CL = {};
try { CL = JSON.parse(localStorage.getItem(CL_KEY) || '{}') || {}; } catch (e) { CL = {}; }
if (typeof CL !== 'object' || Array.isArray(CL)) CL = {};

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function pLabel(i){ return 'P' + (i + 1); }
function persistCL(){
  try { localStorage.setItem(CL_KEY, JSON.stringify(CL)); } catch (e) {}
}

/* ── per-class lesson model (used by the solver) ─────────────────────────── */
function tcTarget(subj, grade){
  const o = CL[grade] && CL[grade][subj];
  if (o && o.lessons != null) return o.lessons;
  return (typeof TT !== 'undefined' && TT.LESSON_TARGETS && TT.LESSON_TARGETS[subj] != null)
    ? TT.LESSON_TARGETS[subj] : 3;
}
function tcDoubles(subj, grade){
  const o = CL[grade] && CL[grade][subj];
  if (o && o.doubles != null) return o.doubles;
  return (typeof TT !== 'undefined' && TT.DOUBLES) ? (TT.DOUBLES[subj] || 0) : 0;
}
window.ttClassTarget = tcTarget;
window.ttClassDoubles = tcDoubles;

function tcSet(subj, grade, lessons, doubles){
  if (!CL[grade]) CL[grade] = {};
  CL[grade][subj] = { lessons, doubles };
  persistCL();
}
function tcReset(subj, grade){
  if (CL[grade]) { delete CL[grade][subj]; if (!Object.keys(CL[grade]).length) delete CL[grade]; }
  persistCL();
}
function tcIsCustom(subj, grade){
  return !!(CL[grade] && CL[grade][subj]);
}

/* ── store API shared with the Timetable Generator ───────────────────────── */
/* The subject list for a class = the default band subjects ∪ anything added
   in the store, MINUS subjects explicitly set to 0 lessons. The store is
   always merged with the defaults so a partial edit can never drop the rest
   of a class's subjects. */
function bandSubjects(grade){
  const g1 = String(grade).charAt(0);
  if (['1','2','3'].includes(g1)) return ['MATHS','ENG','KIS','ENVIRON','CRE','C/ARTS'];
  if (['7','8','9'].includes(g1)) return ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT','PTE'];
  return ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT'];
}
window.ttClassSubjects = function(grade){
  const store = CL[grade] || {};
  const set = new Set();
  bandSubjects(grade).forEach(s => {
    const e = store[s];
    if (!e || (e.lessons != null && e.lessons > 0)) set.add(s);
  });
  Object.keys(store).forEach(s => {
    const e = store[s];
    if (e && e.lessons > 0) set.add(s);
  });
  const list = [...set].sort();
  return list.length ? list : null;
};
window.ttSeedClass = function(grade){
  const fallback = bandSubjects(grade);
  if (!fallback.length) return false;
  if (!CL[grade]) CL[grade] = {};
  let added = false;
  fallback.forEach(s => {
    if (!CL[grade][s]) {
      CL[grade][s] = { lessons: tcTarget(s, grade), doubles: tcDoubles(s, grade) };
      added = true;
    }
  });
  if (added) persistCL();
  return added;
};
window.ttClassSet = function(subj, grade, lessons, doubles){
  window.ttSeedClass(grade);
  if (!CL[grade]) CL[grade] = {};
  CL[grade][subj] = { lessons, doubles };
  persistCL();
};
window.ttClassReset = function(subj, grade){
  tcReset(subj, grade);
};
window.ttClassHas = function(grade, subj){
  const e = CL[grade] && CL[grade][subj];
  return !!(e && e.lessons > 0);
};
window.__classLessons = {
  rename(oldN, newN){
    Object.keys(CL).forEach(g => {
      if (CL[g][oldN]) { CL[g][newN] = CL[g][oldN]; delete CL[g][oldN]; }
    });
    persistCL();
  },
  zeroEverywhere(name){
    Object.keys(CL).forEach(g => {
      if (CL[g][name]) { CL[g][name].lessons = 0; CL[g][name].doubles = 0; }
    });
    persistCL();
  },
  remove(name){
    Object.keys(CL).forEach(g => { if (CL[g][name]) delete CL[g][name]; });
    persistCL();
  }
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmtT(name){ return (typeof fmtTeacher === 'function') ? fmtTeacher(name) : name; }
function teacherOffCount(name){
  return (window.__ttaOff && window.__ttaOff.count) ? window.__ttaOff.count(name) : 0;
}
function assignmentsOf(t){
  const out = [];
  (t.assignments || []).forEach(a => {
    (Array.isArray(a.classes) ? a.classes : String(a.classes || '').split(','))
      .map(c => String(c).trim()).filter(Boolean)
      .forEach(c => out.push({ subject: a.subject, grade: c }));
  });
  return out;
}

/* ── hub state ───────────────────────────────────────────────────────────── */
const HUB = { view: { type: 'list' }, filter: (() => { try { return localStorage.getItem('santapris_tch_filter') || 'all'; } catch (e) { return 'all'; } })() };

/* ── rendering ───────────────────────────────────────────────────────────── */
function ensureContainer(){
  const page = document.getElementById('page-teachers');
  if (!page) return null;
  let hub = document.getElementById('tchHub');
  if (!hub) {
    hub = document.createElement('div');
    hub.id = 'tchHub';
    const firstCard = page.querySelector('.card');
    page.insertBefore(hub, firstCard || null);
    if (firstCard) {
      firstCard.id = firstCard.id || 'tchLegacyCard';
      firstCard.style.display = 'none';   // reachable via the toggle button
    }
  }
  return hub;
}

function renderHub(){
  const hub = ensureContainer();
  if (!hub) return;
  if (HUB.view.type === 'teacher') renderTeacherPage(hub);
  else if (HUB.view.type === 'subject') renderSubjectPage(hub);
  else renderList(hub);
}

/* Level 1 — all teachers with weekly totals */
function tchLevel(t){
  const codes = [];
  (t.assignments || []).forEach(a => (Array.isArray(a.classes) ? a.classes : []).forEach(c => codes.push(String(c).trim().charAt(0))));
  String(t.classTeacher || '').split(',').forEach(x => { const c = x.trim().charAt(0); if (c) codes.push(c); });
  const lp = codes.some(c => '123'.includes(c));
  const up = codes.some(c => '456789'.includes(c));
  return lp && !up ? 'lp' : up ? 'upjs' : (lp ? 'lp' : 'none');
}
window.tchSetFilter = function(f){
  HUB.filter = f;
  try { localStorage.setItem('santapris_tch_filter', f); } catch (e) {}
  renderHub();
};
function renderList(hub){
  const filter = HUB.filter || 'all';
  const all = [...(db.teachers || [])].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const teachers = filter === 'all' ? all : all.filter(t => tchLevel(t) === filter);
  const chip = (f, label) => '<button class="btn btn-sm" onclick="tchSetFilter(\'' + f + '\')" style="font-size:10.5px;'
    + (filter === f ? 'background:rgba(30,86,200,.25);border:1px solid var(--sky);color:var(--sky);font-weight:800' : '') + '">' + label + '</button>';
  const filterRow = '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:12px">'
    + '<span style="font-size:10.5px;color:var(--text-muted);font-weight:700">LEVEL:</span>'
    + chip('all', 'All') + chip('lp', 'Lower Primary') + chip('upjs', 'Upper Primary & Junior School')
    + '<span style="font-size:10.5px;color:var(--text-muted);margin-left:auto">' + teachers.length + ' of ' + all.length + ' teachers</span>'
    + '</div>';
  let rows = '';
  teachers.forEach(t => {
    const asg = assignmentsOf(t);
    let total = 0, doubles = 0;
    asg.forEach(x => { total += tcTarget(x.subject, x.grade); doubles += Math.min(tcDoubles(x.subject, x.grade), Math.floor(tcTarget(x.subject, x.grade) / 2)); });
    const off = teacherOffCount(fmtT(t.name));
    const ctBadges = String(t.classTeacher || '').split(',').map(s => s.trim()).filter(Boolean)
      .map(g => '<span class="badge badge-gold" style="margin:1px;font-size:9px">' + esc(g) + '</span>').join('');
    rows += '<div class="tch-row" onclick="tchOpen(\'' + esc(t.id) + '\')">'
      + '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">'
      + '<span style="font-size:20px">🧑‍🏫</span>'
      + '<div style="min-width:0"><div style="font-weight:800;color:var(--text)">' + esc(t.name || t.id)
      + (ctBadges ? ' ' + ctBadges : '') + '</div>'
      + '<div style="font-size:10.5px;color:var(--text-muted)">' + esc(t.id || '') + ' · '
      + asg.length + ' subject-class allocation' + (asg.length === 1 ? '' : 's')
      + (off ? ' · 🚫 ' + off + ' time-off slot' + (off === 1 ? '' : 's') : '') + '</div></div></div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div style="font-weight:900;color:var(--sky);font-size:15px">' + total + '</div>'
      + '<div style="font-size:9.5px;color:var(--text-muted);letter-spacing:.05em">LESSONS/WEEK</div>'
      + (doubles ? '<div style="font-size:9.5px;color:var(--gold)">' + doubles + ' double' + (doubles === 1 ? '' : 's') + '</div>' : '')
      + '</div>'
      + '<div style="flex-shrink:0;color:var(--text-muted);font-size:16px;padding:0 4px">›</div>'
      + '</div>';
  });
  hub.innerHTML = filterRow
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">'
    + '<div style="font-size:12px;font-weight:800;color:var(--sky)">👩‍🏫 TEACHING LOAD & ALLOCATIONS</div>'
    + '<span style="font-size:10.5px;color:var(--text-muted)">click a teacher to see their subjects, classes, weekly lessons & time-off</span>'
    + '<button class="btn btn-sm" onclick="tchToggleLegacy()" style="font-size:10.5px;margin-left:auto">📋 Full register (table view)</button>'
    + '</div>'
    + (rows || '<div class="empty-state"><p>No teachers registered yet.</p></div>');
}
window.tchToggleLegacy = function(){
  const card = document.getElementById('tchLegacyCard');
  if (!card) return;
  card.style.display = card.style.display === 'none' ? '' : 'none';
  if (card.style.display !== 'none' && typeof renderTeachersTable === 'function') renderTeachersTable();
};

/* Level 2 — one teacher: allocations + time-off grid */
function findTeacher(id){ return (db.teachers || []).find(t => t.id === id); }
window.tchOpen = function(id){ HUB.view = { type: 'teacher', id }; renderHub(); };
window.tchBack = function(){ HUB.view = { type: 'list' }; renderHub(); };

function renderTeacherPage(hub){
  const t = findTeacher(HUB.view.id);
  if (!t) { HUB.view = { type: 'list' }; renderHub(); return; }
  const name = fmtT(t.name);
  const asg = assignmentsOf(t);
  let total = 0, doubles = 0;
  asg.forEach(x => { total += tcTarget(x.subject, x.grade); doubles += Math.min(tcDoubles(x.subject, x.grade), Math.floor(tcTarget(x.subject, x.grade) / 2)); });

  const chips = asg.length ? asg.map(x => {
    const n = tcTarget(x.subject, x.grade);
    const d = Math.min(tcDoubles(x.subject, x.grade), Math.floor(n / 2));
    return '<div class="tch-row" style="padding:9px 12px" onclick="tchOpenSubject(\'' + esc(t.id) + '\',\'' + esc(x.subject) + '\',\'' + esc(x.grade) + '\')">'
      + '<div style="display:flex;align-items:center;gap:9px;flex:1">'
      + '<span class="badge badge-blue" style="font-size:11px">' + esc(x.subject) + '</span>'
      + '<span style="font-weight:800;color:var(--text)">' + esc(x.grade) + '</span>'
      + (tcIsCustom(x.subject, x.grade) ? '<span style="font-size:9px;color:var(--gold);border:1px solid rgba(242,199,68,.4);border-radius:4px;padding:1px 5px">edited</span>' : '')
      + '</div>'
      + '<div style="text-align:right">'
      + '<span style="font-weight:900;color:var(--sky)">' + n + '</span>'
      + '<span style="font-size:9.5px;color:var(--text-muted)"> /week</span>'
      + (d ? ' <span style="font-size:9.5px;color:var(--gold)">' + d + '×double</span>' : '')
      + '</div><div style="color:var(--text-muted)">›</div></div>';
  }).join('') : '<div style="font-size:11px;color:var(--text-muted)">No subject allocations yet — use ✏️ Edit to add subjects & classes.</div>';

  hub.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">'
    + '<button class="btn btn-sm" onclick="tchBack()" style="font-size:11px">← All teachers</button>'
    + '<div style="font-size:14px;font-weight:900;color:var(--text)">' + esc(t.name || t.id) + '</div>'
    + '<span class="adm-badge">' + esc(t.id || '') + '</span>'
    + (t.phone ? '<span style="font-size:11px;color:var(--text-muted)">📞 ' + esc(t.phone) + '</span>' : '')
    + '<div style="margin-left:auto;display:flex;gap:6px">'
    + '<button class="btn btn-ghost btn-sm" onclick="editTeacher(\'' + esc(t.id) + '\')" title="Edit">✏️</button>'
    + '<button class="btn btn-danger btn-sm" onclick="delTeacher(\'' + esc(t.id) + '\')" title="Delete">🗑</button>'
    + '</div></div>'
    + '<div class="dr-chip">📘 ' + asg.length + ' subject-class allocation' + (asg.length === 1 ? '' : 's') + '</div>'
    + '<div class="dr-chip">🧮 ' + total + ' lessons/week total</div>'
    + (doubles ? '<div class="dr-chip">👥 ' + doubles + ' double lesson' + (doubles === 1 ? '' : 's') + '/week</div>' : '')
    + '<div class="dr-chip dr-chip-warn">🚫 ' + teacherOffCount(name) + ' time-off slot' + (teacherOffCount(name) === 1 ? '' : 's') + '</div>'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin:14px 0 6px">📘 SUBJECT & CLASS ALLOCATIONS — click one to set its weekly lessons, singles & doubles</div>'
    + '<div>' + chips + '</div>'
    + tchTimeOffGrid(name);
}
window.tchOpenSubject = function(id, subj, grade){
  HUB.view = { type: 'subject', id, subj, grade };
  renderHub();
};

/* Level 3 — subject-class lesson editor */
window.tchEditState = null;
function renderSubjectPage(hub){
  const t = findTeacher(HUB.view.id);
  const { subj, grade } = HUB.view;
  if (!t) { HUB.view = { type: 'list' }; renderHub(); return; }
  if (!window.tchEditState || window.tchEditState.key !== grade + '|' + subj) {
    const lessons = tcTarget(subj, grade);
    let doubles = Math.min(tcDoubles(subj, grade), Math.floor(lessons / 2));
    window.tchEditState = { key: grade + '|' + subj, lessons, doubles, singles: lessons - 2 * doubles };
  }
  const st = window.tchEditState;
  const ok = st.singles + 2 * st.doubles === st.lessons && st.doubles >= 0 && st.singles >= 0;
  hub.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">'
    + '<button class="btn btn-sm" onclick="tchOpen(\'' + esc(t.id) + '\')" style="font-size:11px">← ' + esc(t.name || t.id) + '</button>'
    + '<div style="font-size:14px;font-weight:900;color:var(--text)">'
    + '<span class="badge badge-blue" style="font-size:12px;margin-right:6px">' + esc(subj) + '</span>'
    + 'Grade ' + esc(grade) + '</div></div>'
    + '<div class="dr-chip">🧑‍🏫 Teacher: ' + esc(t.name) + '</div>'
    + '<div class="dr-chip">🧮 Solver places: ' + st.singles + ' single + ' + st.doubles + ' double</div>'
    + '<div class="dr-chip dr-chip-muted">A double = 2 consecutive periods in one block</div>'
    + '<div class="card" style="margin-top:12px"><div class="card-body" style="padding:14px 16px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:10px">✏️ WEEKLY LESSON ALLOCATION FOR ' + esc(subj) + ' — ' + esc(grade) + '</div>'
    + '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">'
    + tchNumField('Lessons / week', 'tchInLessons', st.lessons, 'tchSetLessons(this.value)')
    + tchNumField('…of which DOUBLES', 'tchInDoubles', st.doubles, 'tchSetDoubles(this.value)')
    + tchNumField('…of which SINGLES', 'tchInSingles', st.singles, 'tchSetSingles(this.value)')
    + '</div>'
    + '<div style="margin-top:10px;font-size:12px;font-weight:800;color:' + (ok ? 'var(--emerald)' : 'var(--rose)') + '">'
    + (ok
        ? '✓ ' + st.lessons + ' lessons/week = ' + st.singles + ' single' + (st.singles === 1 ? '' : 's') + ' + ' + st.doubles + ' double' + (st.doubles === 1 ? '' : 's') + ' (' + st.doubles + '×2 periods)</div>'
        : '⚠️ Singles + 2×Doubles must equal the weekly lessons.</div>')
    + '<div style="font-size:10px;color:var(--text-muted);margin-top:7px">Rules: a subject can appear at most twice a day (so ≤ 10/week); doubles sit as two consecutive periods inside one block. These values are used by the Timetable Generator for this exact class.</div>'
    + '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
    + '<button class="dr-btn" onclick="tchSaveSubject()" style="font-size:12px;padding:8px 18px">💾 Save allocation</button>'
    + '<button class="btn btn-sm" onclick="tchResetSubject()" style="font-size:11px">↺ Reset to default</button>'
    + '</div></div></div>'
    + tchTimeOffGrid(fmtT(t.name));
}
function tchNumField(label, id, value, onchange){
  return '<div class="dr-field"><label for="' + id + '">' + label + '</label>'
    + '<input type="number" id="' + id + '" min="0" max="20" value="' + value + '" onchange="' + onchange + '"'
    + ' style="width:110px;padding:8px;background:var(--navy);border:1px solid var(--border);border-radius:8px;color:var(--text);font-weight:800;text-align:center;font-size:14px"></div>';
}
window.tchSetLessons = function(v){
  const st = window.tchEditState; if (!st) return;
  st.lessons = Math.max(0, Math.min(20, parseInt(v, 10) || 0));
  st.doubles = Math.min(st.doubles, Math.floor(st.lessons / 2));
  st.singles = st.lessons - 2 * st.doubles;
  renderHub();
};
window.tchSetDoubles = function(v){
  const st = window.tchEditState; if (!st) return;
  st.doubles = Math.max(0, Math.min(Math.floor(st.lessons / 2), parseInt(v, 10) || 0));
  st.singles = st.lessons - 2 * st.doubles;
  renderHub();
};
window.tchSetSingles = function(v){
  const st = window.tchEditState; if (!st) return;
  let s = Math.max(0, Math.min(st.lessons, parseInt(v, 10) || 0));
  st.doubles = Math.floor((st.lessons - s) / 2);
  st.singles = st.lessons - 2 * st.doubles;
  renderHub();
};
window.tchSaveSubject = function(){
  const st = window.tchEditState; if (!st) return;
  const [grade, subj] = st.key.split('|');
  if (st.singles + 2 * st.doubles !== st.lessons) { toast('⚠️ Singles + 2×Doubles must equal the weekly lessons.', true); return; }
  window.ttClassSet(subj, grade, st.lessons, st.doubles);
  toast('✅ ' + subj + ' (' + grade + '): ' + st.lessons + ' lessons/week — ' + st.singles + ' single + ' + st.doubles + ' double.');
  HUB.view = { type: 'teacher', id: HUB.view.id };
  renderHub();
};
window.tchResetSubject = function(){
  const st = window.tchEditState; if (!st) return;
  const [grade, subj] = st.key.split('|');
  window.ttClassReset(subj, grade);
  toast('↺ Reset to default.');
  HUB.view = { type: 'teacher', id: HUB.view.id };
  renderHub();
};

/* ── time-off grid (ticked = lesson CAN be placed; cross = cannot) ───────── */
function tchTimeOffGrid(name){
  const np = (typeof TT !== 'undefined') ? TT.NP : 10;
  const times = (typeof TT !== 'undefined' && TT.PERIOD_TIMES) || [];
  const days = (typeof TT !== 'undefined' && TT.DAYS) || ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const dayShort = (typeof TT !== 'undefined' && TT.DAY_SHORT) || ['MON','TUE','WED','THUR','FRI'];
  let grid = '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin:16px 0 6px">🚫 TIME-OFF GRID — ' + esc(name) + '</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-bottom:7px">✓ ticked = a lesson <b>can</b> be placed at that period · ✗ crossed = the teacher is <b>not</b> available (the generator will never place them there). Changes apply the next time you Generate.</div>';
  grid += '<div style="overflow-x:auto"><table class="tch-offgrid" style="border-collapse:collapse;font-size:10px">';
  grid += '<thead><tr><th style="padding:4px 8px;text-align:left;color:var(--text-muted)">DAY</th>';
  for (let p = 0; p < np; p++) {
    grid += '<th style="padding:4px 6px;text-align:center;color:var(--sky)">' + pLabel(p) + '<div style="font-size:8px;font-weight:400;color:var(--text-muted)">' + (times[p] || '') + '</div></th>';
  }
  grid += '<th style="padding:4px 6px"></th></tr></thead><tbody>';
  for (let d = 0; d < days.length; d++) {
    grid += '<tr><td style="padding:4px 8px;font-weight:800;color:var(--sky);white-space:nowrap">' + dayShort[d] + '</td>';
    for (let p = 0; p < np; p++) {
      grid += '<td style="padding:3px 5px;text-align:center">'
        + '<input type="checkbox" id="tchoff_' + d + '_' + p + '" onchange="tchToggleOff(\'' + esc(name) + '\',' + d + ',' + p + ',this)"'
        + ' style="accent-color:var(--emerald);width:15px;height:15px;cursor:pointer"></td>';
    }
    grid += '<td><button class="btn btn-sm" onclick="tchClearDay(\'' + esc(name) + '\',' + d + ')" style="font-size:9px;padding:2px 6px">clear day</button></td></tr>';
  }
  grid += '</tbody></table></div>'
    + '<div style="display:flex;gap:8px;margin-top:7px;flex-wrap:wrap">'
    + '<button class="btn btn-sm" onclick="tchAllAvailable(\'' + esc(name) + '\')" style="font-size:10.5px">✓ All available</button>'
    + '<span style="font-size:10px;color:var(--text-muted);align-self:center">Unavailable periods show as crossed (unticked).</span></div>';
  /* paint current availability after insertion */
  setTimeout(() => {
    for (let d = 0; d < 5; d++) for (let p = 0; p < np; p++) {
      const cb = document.getElementById('tchoff_' + d + '_' + p);
      if (!cb) continue;
      const slots = (window.__ttaOff && window.__ttaOff.slots) ? window.__ttaOff.slots(name) : [];
      const isOff = slots.indexOf(d + '_' + p) >= 0;
      cb.checked = !isOff;
      cb.parentElement.style.background = isOff ? 'rgba(200,64,64,.18)' : '';
    }
  }, 0);
  return grid;
}
window.tchToggleOff = function(name, d, p, cb){
  if (!window.__ttaOff) { toast('⚠️ Time-off store unavailable.', true); return; }
  window.__ttaOff.set(name, d, p, !cb.checked);   // unchecked = off
  cb.parentElement.style.background = cb.checked ? '' : 'rgba(200,64,64,.18)';
  toast(cb.checked ? '✓ Available again.' : '✗ ' + name + ' is off (the generator will not place lessons there).');
};
window.tchClearDay = function(name, d){
  const np = (typeof TT !== 'undefined') ? TT.NP : 10;
  for (let p = 0; p < np; p++) {
    if (window.__ttaOff) window.__ttaOff.set(name, d, p, true);
    const cb = document.getElementById('tchoff_' + d + '_' + p);
    if (cb) { cb.checked = false; cb.parentElement.style.background = 'rgba(200,64,64,.18)'; }
  }
  toast('✗ Whole day cleared for ' + name + '.');
};
window.tchAllAvailable = function(name){
  if (window.__ttaOff) window.__ttaOff.clear(name);
  const np = (typeof TT !== 'undefined') ? TT.NP : 10;
  for (let d = 0; d < 5; d++) for (let p = 0; p < np; p++) {
    const cb = document.getElementById('tchoff_' + d + '_' + p);
    if (cb) { cb.checked = true; cb.parentElement.style.background = ''; }
  }
  toast('✓ ' + name + ' is available for the whole week.');
};

/* ── hook into the app ───────────────────────────────────────────────────── */
(function styles(){
  if (document.getElementById('tch-hub-styles')) return;
  const st = document.createElement('style');
  st.id = 'tch-hub-styles';
  st.textContent = `
    .tch-row {
      display: flex; align-items: center; gap: 10px;
      background: var(--surface-2, rgba(30,60,120,.12));
      border: 1px solid var(--border, rgba(120,150,210,.25));
      border-radius: 10px; padding: 10px 14px; margin-bottom: 8px;
      cursor: pointer; transition: border-color .12s, background .12s;
    }
    .tch-row:hover { border-color: var(--sky, #38bdf8); background: rgba(30,86,200,.16); }
    .tch-offgrid th, .tch-offgrid td { border: 1px solid rgba(120,150,210,.25); }
  `;
  document.head.appendChild(st);
})();

function wrap(){
  if (typeof window.renderTeachersTable !== 'function' || window.renderTeachersTable.__hub) return false;
  const orig = window.renderTeachersTable;
  window.renderTeachersTable = function(){
    orig.apply(this, arguments);   // keeps the legacy register table fresh
    try { renderHub(); } catch (e) { console.error('teachers hub', e); }
  };
  window.renderTeachersTable.__hub = true;
  return true;
}
if (!wrap()) {
  const t0 = setInterval(() => { if (wrap()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}

})();
