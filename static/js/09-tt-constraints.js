/* ═══════════════════════════════════════════════════════════════════════════
   TIMETABLE CONSTRAINTS
   - The per-class SUBJECT & LESSON allocations edited here are the SAME data
     as the 👩‍🏫 Teachers hub (santapris_class_lessons_v1) — the generator
     uses them directly via window.ttClassTarget / ttClassDoubles /
     ttClassSubjects.
   - Subject ↔ period bans and sequencing rules are enforced inside runTT2's
     candidate loop through window.__ttConstraints (hooked in 07-app-main.js).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const KEY = 'santapris_tt_settings_v2';
const SUBJECTS = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','COMPT','PTE','ENVIRON','C/ARTS'];

const TTU = { BANNED: {}, ADJ: [] };

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function pLabel(i){ return 'P' + (i + 1); }
function np(){ return (typeof TT !== 'undefined' && TT.NP) || 10; }
function slotTotal(){
  try {
    const nd = (typeof TT !== 'undefined' && TT.ND) || 5;
    let specials = 0;
    for (let d = 0; d < nd; d++) for (let p = 0; p < np(); p++) if (ttIsSpecial(d, p)) specials++;
    return nd * np() - specials;
  } catch (e) { return 47; }
}

/* ── load / persist (bans + sequencing rules) ────────────────────────────── */
try {
  const s = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (s) {
    TTU.BANNED = s.BANNED || {};
    TTU.ADJ = Array.isArray(s.ADJ) ? s.ADJ : [];
  }
} catch (e) {}
function persist(){
  try { localStorage.setItem(KEY, JSON.stringify({ BANNED: TTU.BANNED, ADJ: TTU.ADJ })); } catch (e) {}
}

/* ── constraint checks used by the solver ────────────────────────────────── */
window.__ttConstraints = {
  blocked(subj, p){
    const arr = TTU.BANNED[subj];
    return !!(arr && arr.indexOf(p) >= 0);
  },
  adjacentClash(tt, grade, d, p, subj){
    if (!TTU.ADJ.length) return false;
    const groups = (typeof TT !== 'undefined' && TT.GROUPS) || [[0,1],[2,3],[4,5,6],[7,8],[9]];
    const grp = groups.find(x => x.includes(p));
    if (!grp) return false;
    const day = tt[grade] && tt[grade][d];
    if (!day) return false;
    for (const rule of TTU.ADJ) {
      for (const ap of grp) {
        if (Math.abs(ap - p) !== 1) continue;
        const cell = day[ap];
        if (cell && !cell.special &&
            ((cell.subj === rule.a && subj === rule.b) ||
             (cell.subj === rule.b && subj === rule.a))) return true;
      }
    }
    return false;
  }
};

/* ── allocation report (per selected class, from the Teachers-hub store) ─── */
function gradeSubjects(g){
  if (typeof ttClassSubjects === 'function') {
    const fromStore = ttClassSubjects(g);
    if (fromStore && fromStore.length) return fromStore;
  }
  return (typeof ttSubjects === 'function') ? ttSubjects(g) : SUBJECTS;
}
function allocationReport(){
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb => cb.value);
  const perGrade = {};
  (grades.length ? grades : ['4N']).forEach(g => {
    perGrade[g] = gradeSubjects(g).reduce((a, s) => a + (typeof ttClassTarget === 'function' ? ttClassTarget(s, g) : 3), 0);
  });
  return perGrade;
}

/* ── panel 1: per-class subject allocations (Teachers-hub data) ──────────── */
function renderTargets(){
  const box = document.getElementById('tt_targetInputs');
  if (!box) return;
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb => cb.value);
  if (!grades.length) {
    box.innerHTML = '<div style="font-size:11px;color:var(--text-muted)">Tick the grades to schedule above, then their subject allocations appear here for editing (same data as the 👩‍🏫 Teachers hub).</div>';
    return;
  }
  let html = '';
  grades.forEach(g => {
    const subjects = gradeSubjects(g);
    const total = subjects.reduce((a, s) => a + (typeof ttClassTarget === 'function' ? ttClassTarget(s, g) : 3), 0);
    const slots = slotTotal();
    const ok = total === slots;
    html += '<div style="margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">'
      + '<span style="font-weight:900;color:var(--sky);font-size:12px">🏫 Grade ' + esc(g) + '</span>'
      + '<span style="font-size:10.5px;font-weight:800;color:' + (ok ? 'var(--emerald)' : 'var(--gold)') + '">'
      + total + ' / ' + slots + ' slots' + (ok ? ' ✓' : (total < slots ? '  · ' + (slots - total) + ' would stay empty' : '  · ' + (total - slots) + ' won\u2019t fit')) + '</span>'
      + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px">'
      + subjects.map(s => {
          const n = ttClassTarget(s, g);
          const d = ttClassDoubles(s, g);
          return '<label style="display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;'
            + 'background:var(--surface-3);padding:3px 7px;border-radius:6px;border:1px solid var(--border)">'
            + '<span style="color:var(--text)">' + esc(s) + '</span>'
            + '<input type="number" min="0" max="10" value="' + n + '" onchange="ttcSetClassLessons(\'' + esc(g) + '\',\'' + esc(s) + '\',this.value)"'
            + ' style="width:44px;padding:2px;text-align:center;background:var(--navy);border:1px solid var(--border);border-radius:4px;color:var(--sky);font-weight:800">'
            + '<span style="color:var(--text-muted);font-size:9px">dbl</span>'
            + '<input type="number" min="0" max="3" value="' + d + '" onchange="ttcSetClassDoubles(\'' + esc(g) + '\',\'' + esc(s) + '\',this.value)"'
            + ' style="width:38px;padding:2px;text-align:center;background:var(--navy);border:1px solid var(--border);border-radius:4px;color:var(--gold);font-weight:800">'
            + '<button onclick="ttcRemoveClassSubject(\'' + esc(g) + '\',\'' + esc(s) + '\')" title="Remove subject from this class"'
            + ' style="background:none;border:none;color:var(--rose,#f87171);cursor:pointer;font-weight:800">✕</button>'
            + '</label>';
        }).join('')
      + '<select onchange="ttcAddClassSubject(\'' + esc(g) + '\',this.value); this.value=\'\'"'
      + ' style="padding:3px 6px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--emerald);font-size:10.5px;font-weight:700">'
      + '<option value="">➕ subject…</option>'
      + allSubjects().filter(s => !subjects.includes(s)).map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('')
      + '</select>'
      + '</div></div>';
  });
  html += '<div style="font-size:10px;color:var(--text-muted)">These are the exact allocations used to generate — the same data as the 👩‍🏫 Teachers hub (Records → Teachers → pick teacher → subject). “dbl” = double lessons (2 consecutive periods). Match each class to ' + slotTotal() + ' to avoid empty periods.</div>';
  box.innerHTML = html;
}
function allSubjects(){
  const set = new Set(SUBJECTS);
  ((window.db && window.db.teachers) || []).forEach(t =>
    (t.assignments || []).forEach(a => { if (a.subject) set.add(String(a.subject).trim()); }));
  return [...set].sort();
}
window.ttcSetClassLessons = function(grade, subj, v){
  const n = Math.max(0, Math.min(10, parseInt(v, 10) || 0));
  const d = Math.min(ttClassDoubles(subj, grade), Math.floor(n / 2));
  window.ttClassSet(subj, grade, n, d);
  renderTargets();
};
window.ttcSetClassDoubles = function(grade, subj, v){
  const lessons = ttClassTarget(subj, grade);
  const d = Math.max(0, Math.min(Math.floor(lessons / 2), parseInt(v, 10) || 0));
  window.ttClassSet(subj, grade, lessons, d);
  renderTargets();
};
window.ttcRemoveClassSubject = function(grade, subj){
  window.ttClassSet(subj, grade, 0, 0);
  renderTargets();
};
window.ttcAddClassSubject = function(grade, subj){
  if (!subj) return;
  if (typeof ttSeedClass === 'function') ttSeedClass(grade);   // keep the full subject list
  window.ttClassSet(subj, grade, 3, 0);
  renderTargets();
  toast('➕ ' + subj + ' added to ' + grade + ' (3 lessons/week — adjust above).');
};

/* ── panel 2: subject ↔ period bans + sequencing rules ───────────────────── */
function renderConstraints(){
  const panel = document.getElementById('tt_constraintsPanel');
  if (!panel) return;
  const subjects = allSubjects();
  const banned = s => TTU.BANNED[s] || [];

  let grid = '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:10px">'
    + '<thead><tr><th style="text-align:left;padding:4px 8px;color:var(--text-muted)">SUBJECT</th>'
    + Array.from({length: np()}, (_, i) => pLabel(i)).map(p => '<th style="padding:4px 6px;text-align:center;color:var(--sky)">' + p + '</th>').join('')
    + '<th style="padding:4px 6px"></th></tr></thead><tbody>';
  subjects.forEach(s => {
    grid += '<tr><td style="padding:3px 8px;font-weight:800;color:var(--text);white-space:nowrap">' + esc(s) + '</td>'
      + Array.from({length: np()}, (_, i) => {
        return '<td style="padding:3px 6px;text-align:center">'
          + '<input type="checkbox" ' + (banned(s).indexOf(i) >= 0 ? 'checked' : '')
          + ' onchange="ttcToggleBan(\'' + esc(s) + '\',' + i + ',this)"'
          + ' style="accent-color:var(--rose);width:13px;height:13px;cursor:pointer"></td>';
      }).join('')
      + '<td><button class="btn btn-sm" onclick="ttcClearBanned(\'' + esc(s) + '\')" style="font-size:9px;padding:2px 6px">clear</button></td></tr>';
  });
  grid += '</tbody></table></div>';

  const opts = subjects.map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
  const rules = TTU.ADJ.length
    ? TTU.ADJ.map((r, i) =>
        '<span style="display:inline-flex;align-items:center;gap:6px;background:rgba(200,64,64,.15);'
        + 'border:1px solid rgba(200,64,64,.45);color:var(--rose,#f87171);border-radius:20px;'
        + 'padding:3px 10px;font-size:11px;font-weight:700;margin:0 6px 6px 0">'
        + esc(r.a) + ' ⇄ ' + esc(r.b)
        + '<button onclick="ttcRemoveRule(' + i + ')" style="background:none;border:none;color:inherit;cursor:pointer;font-weight:800">✕</button></span>').join('')
    : '<span style="font-size:10.5px;color:var(--text-muted)">No sequencing rules yet.</span>';

  panel.innerHTML =
    '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:6px">🚫 SUBJECT ↔ PERIOD RESTRICTIONS</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-bottom:7px">Tick a period to forbid that subject there. To keep a subject away from the lesson right <b>before or after</b> break, lunch or assembly, tick those neighbouring periods. (Assembly and Games slots are fixed.)</div>'
    + grid
    + '<div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin:14px 0 6px">🔁 SUBJECTS MUST NOT FOLLOW EACH OTHER</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-bottom:7px">The two subjects will never be scheduled in consecutive periods on the same day (in either order).</div>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">'
    + '<select id="ttcAdjA" style="background:var(--navy);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:12px">' + opts + '</select>'
    + '<span style="color:var(--text-muted);font-weight:800">⇄</span>'
    + '<select id="ttcAdjB" style="background:var(--navy);color:var(--text);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">' + opts + '</select>'
    + '<button class="btn btn-sm" onclick="ttcAddRule()" style="font-size:11px">➕ Add rule</button>'
    + '</div>'
    + '<div>' + rules + '</div>';
}
window.ttcToggleBan = function(subj, p, cb){
  const arr = TTU.BANNED[subj] || (TTU.BANNED[subj] = []);
  const i = arr.indexOf(p);
  if (cb.checked && i < 0) arr.push(p);
  if (!cb.checked && i >= 0) arr.splice(i, 1);
  persist();
};
window.ttcClearBanned = function(subj){
  delete TTU.BANNED[subj];
  persist();
  renderConstraints();
};
window.ttcAddRule = function(){
  const a = (document.getElementById('ttcAdjA') || {}).value;
  const b = (document.getElementById('ttcAdjB') || {}).value;
  if (!a || !b) { toast('⚠️ Pick both subjects.', true); return; }
  if (a === b) { toast('⚠️ Pick two different subjects.', true); return; }
  if (TTU.ADJ.some(r => (r.a === a && r.b === b) || (r.a === b && r.b === a))) {
    toast('⚠️ That rule already exists.', true); return;
  }
  TTU.ADJ.push({ a, b });
  persist();
  renderConstraints();
  toast('✅ Rule added: ' + a + ' will never follow ' + b + '.');
};
window.ttcRemoveRule = function(i){
  TTU.ADJ.splice(i, 1);
  persist();
  renderConstraints();
};

/* ── warn before generating when allocation doesn't match the slots ──────── */
function wrapGenerate(){
  if (typeof window.generateTimetableNow !== 'function' || window.generateTimetableNow.__ttc) return false;
  const orig = window.generateTimetableNow;
  window.generateTimetableNow = function(){
    try {
      const per = allocationReport();
      const slots = slotTotal();
      const bad = Object.entries(per).filter(([, v]) => v !== slots);
      if (bad.length) {
        const msg = bad.map(([g, v]) => g + ': ' + v + '/' + slots
          + (v < slots ? ' (' + (slots - v) + ' empty)' : ' (' + (v - slots) + ' over)')).join(', ');
        toast('⚠️ Lesson allocation mismatch — ' + msg + '. Adjust the per-class allocations.', true);
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  window.generateTimetableNow.__ttc = true;
  return true;
}

/* ── hook page init ──────────────────────────────────────────────────────── */
function wrapInit(){
  if (typeof window.initTimetablePage !== 'function' || window.initTimetablePage.__ttc) return false;
  const orig = window.initTimetablePage;
  window.initTimetablePage = function(){
    const r = orig.apply(this, arguments);
    try { renderTargets(); renderConstraints(); } catch (e) {}
    return r;
  };
  window.initTimetablePage.__ttc = true;
  wrapGenerate();
  return true;
}
if (!wrapInit()) {
  const t0 = setInterval(() => { if (wrapInit()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}

})();
