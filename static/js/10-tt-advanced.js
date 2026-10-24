/* ═══════════════════════════════════════════════════════════════════════════
   TIMETABLE ADVANCED — period structure (periods/day, days/week, period times,
   break positions & times), teacher time-off, double lessons, max consecutive
   lessons, manual card editing, and printable Word exports.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const KEY = 'santapris_tt_advanced_v1';
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const FULL_SHORT = ['MON', 'TUE', 'WED', 'THUR', 'FRI'];

const ADV = {
  DOUBLES: {},       // subject -> doubles per week
  TEACHER_OFF: {},   // "TR. NAME" -> Set('day_period')
  MAX_CONSEC: 4,
  BREAKS: [2, 4, 7, 9]   // full stored break positions (survive NP changes)
};

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function pLabel(i){ return 'P' + (i + 1); }
function fmtT(name){ return (typeof fmtTeacher === 'function') ? fmtTeacher(name) : name; }

function persist(){
  try { localStorage.setItem(KEY, JSON.stringify({
    structure: {
      np: TT.NP,
      nd: TT.ND,
      breaks: ADV.BREAKS.slice().sort((a, b) => a - b),
      times: TT.PERIOD_TIMES.slice(),
      breakTimes: TT.BREAK_TIMES.slice()
    },
    doubles: ADV.DOUBLES,
    teacherOff: Object.fromEntries(Object.entries(ADV.TEACHER_OFF).map(([k, v]) => [k, [...v]])),
    maxConsec: ADV.MAX_CONSEC
  })); } catch (e) {}
}
function load(){
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s) return;
    if (s.doubles) ADV.DOUBLES = s.doubles;
    if (s.teacherOff) ADV.TEACHER_OFF = Object.fromEntries(
      Object.entries(s.teacherOff).map(([k, v]) => [k, new Set(v)]));
    if (typeof s.maxConsec === 'number') ADV.MAX_CONSEC = s.maxConsec;
    if (s.structure && Array.isArray(s.structure.breaks)) ADV.BREAKS = s.structure.breaks;
    if (s.structure && s.structure.np) {
      applyStructure(s.structure.np, (ADV.BREAKS || []).filter(b => b < s.structure.np),
        s.structure.times || [], s.structure.breakTimes || [], s.structure.nd || 5);
    }
  } catch (e) {}
}

/* ── structure engine ────────────────────────────────────────────────────── */
function defaultPeriodTimes(np){
  const times = ['7:00–7:50', '7:50–8:40', '8:50–9:40', '9:40–10:30', '11:00–11:35',
                 '11:35–12:10', '12:10–12:45', '2:00–2:40', '2:40–3:30', '4:00–5:00'];
  while (times.length < np) times.push('P' + (times.length + 1));
  return times.slice(0, np);
}
function defaultBreakTimes(n){
  const t = ['8:40–8:50', '10:30–11:00', '12:45–1:30', '3:30–4:00'];
  while (t.length < n) t.push('BREAK');
  return t.slice(0, n);
}
function applyStructure(np, breaks, times, breakTimes, nd){
  TT.NP = np;
  TT.ND = Math.max(1, Math.min(5, nd || 5));
  TT.DAYS = FULL_DAYS.slice(0, TT.ND);
  TT.DAY_SHORT = FULL_SHORT.slice(0, TT.ND);
  TT.BREAK_AFTER = new Set((breaks || []).filter(b => b >= 1 && b < np));
  TT.BREAK_IDX = new Map([...TT.BREAK_AFTER].sort((a, b) => a - b).map((b, i) => [b, i]));
  // Consecutive teaching blocks: maximal runs of periods unbroken by a break
  // column (breaks sit BEFORE the indexed period). Doubles may only sit
  // inside one block and core-subject adjacency only counts inside one block.
  // Default 10-period layout reproduces [[0,1],[2,3],[4,5,6],[7,8],[9]].
  var _groups = [], _cur = [];
  for(var _p = 0; _p < np; _p++){
    if(_p > 0 && TT.BREAK_AFTER.has(_p)){ if(_cur.length) _groups.push(_cur); _cur = []; }
    _cur.push(_p);
  }
  if(_cur.length) _groups.push(_cur);
  TT.GROUPS = _groups;
  const def = defaultPeriodTimes(np);
  TT.PERIOD_TIMES = Array.from({length: np}, (_, i) =>
    (times && times[i] && !/^P\d+$/.test(times[i])) ? times[i] : def[i]);
  TT.BREAK_TIMES = (breakTimes && breakTimes.length === TT.BREAK_AFTER.size) ? breakTimes.slice()
    : defaultBreakTimes(TT.BREAK_AFTER.size);
  while (TT.BREAK_TIMES.length < TT.BREAK_AFTER.size) TT.BREAK_TIMES.push('BREAK');
}

/* ── quick strip: days + break positions ─────────────────────────────────── */
window.ttaSetDays = function(v){
  const n = Math.max(1, Math.min(5, parseInt(v, 10) || 5));
  applyStructure(TT.NP, [...TT.BREAK_AFTER], TT.PERIOD_TIMES.slice(), TT.BREAK_TIMES.slice(), n);
  persist();
  try { ttaRenderQuickBreaks(); } catch (e) {}
  try { ttaRenderAdvanced(); } catch (e) {}
  toast('\uD83D\uDCC5 Timetable set to ' + n + ' day' + (n === 1 ? '' : 's') + ' per week.');
};
window.ttaSetDaysQuick = window.ttaSetDays;
window.ttaSetBreaks = function(breaks){
  ADV.BREAKS = [...new Set((breaks || []).map(b => parseInt(b, 10)).filter(b => b >= 1 && b < TT.NP))].sort((a, b) => a - b);
  applyStructure(TT.NP, ADV.BREAKS, TT.PERIOD_TIMES.slice(), TT.BREAK_TIMES.slice(), TT.ND);
  persist();
  try { ttaRenderQuickBreaks(); } catch (e) {}
};
window.ttaRenderQuickBreaks = function(){
  const box = document.getElementById('tt_quickBreaks');
  if (!box) return;
  const dayNames = ['Monday only', 'Mon\u2013Tue', 'Mon\u2013Wed', 'Mon\u2013Thu', 'Mon\u2013Fri (whole week)'];
  const daysSel = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px">'
    + '<span style="font-size:10.5px;font-weight:800;color:var(--sky)">DAYS / WEEK:</span>'
    + '<select onchange="ttaSetDaysQuick(this.value)" style="padding:5px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-weight:700">'
    + Array.from({length: 5}, (_, i) => '<option value="' + (i + 1) + '"' + (TT.ND === i + 1 ? ' selected' : '') + '>'
      + (i + 1) + ' \u2014 ' + dayNames[i] + '</option>').join('')
    + '</select></div>';
  const chips = [];
  for (let p = 1; p < TT.NP; p++) {
    const isB = TT.BREAK_AFTER.has(p);
    chips.push('<label style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;'
      + 'background:' + (isB ? 'rgba(242,199,68,.15);border:1px solid rgba(242,199,68,.45);color:var(--gold)' : 'var(--surface-3);border:1px solid var(--border);color:var(--text-muted)')
      + ';padding:3px 8px;border-radius:6px;cursor:pointer">'
      + '<input type="checkbox" ' + (isB ? 'checked' : '') + ' onchange="ttaQuickBreakChanged()"'
      + ' data-qb="' + p + '" style="accent-color:var(--gold);width:13px;height:13px;cursor:pointer">'
      + 'break before P' + (p + 1) + '</label>');
  }
  const positions = [...TT.BREAK_AFTER].sort((a, b) => a - b).map(p => 'before P' + (p + 1) + ' (' + (TT.BREAK_TIMES[TT.BREAK_IDX.get(p)] || '') + ')');
  box.innerHTML = daysSel
    + '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:6px">' + chips.join('') + '</div>'
    + '<div style="font-size:10.5px;font-weight:700;color:' + (TT.BREAK_AFTER.size ? 'var(--gold)' : 'var(--text-muted)') + '">'
    + TT.BREAK_AFTER.size + ' break' + (TT.BREAK_AFTER.size === 1 ? '' : 's') + (TT.BREAK_AFTER.size ? ': ' + esc(positions.join(', ')) : '') + '</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-top:4px">Tick where a break column should appear (it sits just before that period). Break times & period times are editable in the \u2699\uFE0F Advanced panel. Apply before generating.</div>';
};
window.ttaQuickBreakChanged = function(){
  const breaks = [...document.querySelectorAll('#tt_quickBreaks input[data-qb]')]
    .filter(cb => cb.checked).map(cb => parseInt(cb.getAttribute('data-qb'), 10));
  window.ttaSetBreaks(breaks);
};

/* ── advanced panel: structure editor ────────────────────────────────────── */
window.ttaSyncBreaksFromGrid = function(){
  const breaks = [...document.querySelectorAll('.tta-break-cb')]
    .filter(cb => cb.checked).map(cb => parseInt(cb.value, 10));
  ADV.BREAKS = [...new Set([...breaks, ...ADV.BREAKS.filter(b => b >= TT.NP)])];
  applyStructure(TT.NP, ADV.BREAKS.filter(b => b < TT.NP), TT.PERIOD_TIMES.slice(), TT.BREAK_TIMES.slice(), TT.ND);
  persist();
  ttaRenderAdvanced();
};
window.ttApplyStructureEdits = function(){
  const np = Math.max(1, Math.min(12, parseInt((document.getElementById('tta_np') || {}).value, 10) || 10));
  const breaks = [...document.querySelectorAll('.tta-break-cb')]
    .filter(cb => cb.checked).map(cb => parseInt(cb.value, 10));
  const times = [];
  for (let p = 0; p < np; p++) times.push((document.getElementById('tta_time_' + p) || {}).value || ('P' + (p + 1)));
  const bts = [];
  for (let i = 0; i < breaks.length; i++) bts.push((document.getElementById('tta_btime_' + i) || {}).value || 'BREAK');
  const nd = parseInt((document.getElementById('tta_nd') || {}).value, 10) || TT.ND;
  ADV.BREAKS = [...new Set([...breaks, ...ADV.BREAKS.filter(b => b >= np)])];
  applyStructure(np, ADV.BREAKS.filter(b => b < np), times, bts, nd);
  persist();
  toast('\u2705 Period structure applied \u2014 ' + np + ' periods, ' + breaks.length + ' break(s), ' + TT.ND + ' day(s)/week.');
  ttaRenderAdvanced();
  try { ttaRenderQuickBreaks(); } catch (e) {}
};
window.ttaBuildStructure = function(){
  const np = Math.max(1, Math.min(12, parseInt((document.getElementById('tta_np') || {}).value, 10) || 10));
  const def = defaultPeriodTimes(np);
  const times = Array.from({length: np}, (_, i) =>
    (document.getElementById('tta_time_' + i) || {}).value || def[i] || ('P' + (i + 1)));
  ADV.BREAKS = (ADV.BREAKS || [...TT.BREAK_AFTER]).filter(b => b < np);
  applyStructure(np, ADV.BREAKS, times, TT.BREAK_TIMES.slice(), TT.ND);
  persist();
  ttaRenderAdvanced();
};

/* ── time-off / doubles / rest ───────────────────────────────────────────── */
window.ttaAddOff = function(){
  const t = (document.getElementById('tta_offTeacher') || {}).value;
  const d = parseInt((document.getElementById('tta_offDay') || {}).value, 10);
  const p = parseInt((document.getElementById('tta_offPeriod') || {}).value, 10);
  if (t == null || isNaN(d) || isNaN(p)) return;
  const set = ADV.TEACHER_OFF[t] || (ADV.TEACHER_OFF[t] = new Set());
  set.add(d + '_' + p);
  TT.TEACHER_OFF = ADV.TEACHER_OFF;
  persist();
  ttaRenderAdvanced();
  toast('\uD83D\uDEAB ' + t + ' is now off ' + TT.DAYS[d] + ' ' + pLabel(p) + '.');
};
window.ttaRemoveOff = function(t, k){
  const set = ADV.TEACHER_OFF[t];
  if (set) { set.delete(k); if (!set.size) delete ADV.TEACHER_OFF[t]; }
  TT.TEACHER_OFF = ADV.TEACHER_OFF;
  persist();
  ttaRenderAdvanced();
};
window.ttaSetDouble = function(s, v){
  ADV.DOUBLES[s] = Math.max(0, Math.min(3, parseInt(v, 10) || 0));
  TT.DOUBLES = ADV.DOUBLES;
  persist();
};
window.ttaSetMaxConsec = function(v){
  ADV.MAX_CONSEC = Math.max(1, Math.min(10, parseInt(v, 10) || 4));
  TT.MAX_CONSEC = ADV.MAX_CONSEC;
  persist();
  toast('\u2705 Teachers can have at most ' + ADV.MAX_CONSEC + ' consecutive lessons.');
};

window.__ttaOff = {
  slots(name){ const s = ADV.TEACHER_OFF[name]; return s ? [...s] : []; },
  count(name){ const s = ADV.TEACHER_OFF[name]; return s ? s.size : 0; },
  set(name, d, p, off){
    const set = ADV.TEACHER_OFF[name] || (ADV.TEACHER_OFF[name] = new Set());
    const k = d + '_' + p;
    if (off) set.add(k); else { set.delete(k); if (!set.size) delete ADV.TEACHER_OFF[name]; }
    TT.TEACHER_OFF = ADV.TEACHER_OFF;
    persist();
  },
  clear(name){
    delete ADV.TEACHER_OFF[name];
    TT.TEACHER_OFF = ADV.TEACHER_OFF;
    persist();
  }
};

/* ── manual editing: click-to-swap + drag & drop ─────────────────────────── */
function swapCausesClash(src, dst){
  const A = _tt2.tt[src.grade][src.d][src.p];
  const B = _tt2.tt[dst.grade][dst.d][dst.p];
  _tt2.tt[src.grade][src.d][src.p] = B || null;
  _tt2.tt[dst.grade][dst.d][dst.p] = A || null;
  let clash = null;
  outer:
  for (const [d, p] of [[src.d, src.p], [dst.d, dst.p]]) {
    const seen = {};
    for (const g of Object.keys(_tt2.tt)) {
      const c = _tt2.tt[g][d][p];
      if (c && !c.special && c.teacher && c.teacher !== '\u2014') {
        if (seen[c.teacher]) { clash = c.teacher; break outer; }
        seen[c.teacher] = true;
      }
    }
  }
  _tt2.tt[src.grade][src.d][src.p] = A || null;
  _tt2.tt[dst.grade][dst.d][dst.p] = B || null;
  return clash;
}
/* Re-validate a tentative swap against every generator rule (assumes the
   swap is currently APPLIED to _tt2.tt). Only the two touched day-rows,
   their grades' doubles counts and the moved teachers' loads are checked,
   so pre-existing quirks elsewhere never block an edit.
   Returns a reason string or null. */
function ttaValidateSwap(src, dst){
  const C = window.__ttConstraints || {};
  const load = {}, dayN = {};
  Object.keys(_tt2.tt).forEach(g => {
    _tt2.tt[g].forEach((dayArr, d) => {
      dayArr.forEach((c, p) => {
        if(c && !c.special && c.teacher && c.teacher !== '—'){
          load[c.teacher + '|' + d + '|' + p] = 1;
          dayN[c.teacher + '|' + d] = (dayN[c.teacher + '|' + d] || 0) + 1;
        }
      });
    });
  });
  const maxDay = Math.max(1, TT.NP - 1);
  // cells in the two touched day-rows
  const cells = [];
  [[src.grade, src.d], [dst.grade, dst.d]].forEach(pair => {
    const g = pair[0], d = pair[1];
    if(!_tt2.tt[g] || !_tt2.tt[g][d]) return;
    _tt2.tt[g][d].forEach((c, p) => { if(c && !c.special && c.subj) cells.push({ g, d, p, c }); });
  });
  // moved teachers' loads are checked on both touched days
  const moved = {};
  [src, dst].forEach(pt => {
    const c = _tt2.tt[pt.grade] && _tt2.tt[pt.grade][pt.d] && _tt2.tt[pt.grade][pt.d][pt.p];
    if(c && !c.special && c.teacher && c.teacher !== '—') moved[c.teacher] = 1;
  });
  for(const { g, d, p, c } of cells){
    // teacher time-off
    if(c.teacher && c.teacher !== '—' && TT.TEACHER_OFF && TT.TEACHER_OFF[c.teacher] &&
       TT.TEACHER_OFF[c.teacher].has(d + '_' + p))
      return c.teacher + ' is off ' + (TT.DAYS[d] || ('day ' + (d + 1))) + ' ' + pLabel(p) + '.';
    // subject ↔ period bans
    if(C.blocked && C.blocked(c.subj, p))
      return c.subj + ' may not be taught in ' + pLabel(p) + ' (restriction).';
    // sequencing rules
    if(C.adjacentClash && C.adjacentClash(_tt2.tt, g, d, p, c.subj))
      return c.subj + ' breaks a sequencing rule in ' + pLabel(p) + '.';
    // core subjects never consecutive inside one block
    if(TT.CORE.has(c.subj)){
      const grp = (typeof ttGroup === 'function') ? ttGroup(p) : null;
      if(grp){
        for(const ap of grp){
          if(ap !== p && Math.abs(ap - p) === 1){
            const nb = _tt2.tt[g][d][ap];
            if(nb && !nb.special && TT.CORE.has(nb.subj))
              return 'Core subjects may not be consecutive (' + c.subj + ' / ' + nb.subj + ').';
          }
        }
      }
    }
    // doubles cap per class+subject (only grades touched by this swap)
    if(typeof ttClassDoubles === 'function' || (window.TT && window.TT.DOUBLES)){
      const grp = (typeof ttGroup === 'function') ? ttGroup(p) : null;
      let isDouble = false;
      if(grp){
        for(const ap of grp){
          if(ap !== p && Math.abs(ap - p) === 1){
            const nb = _tt2.tt[g][d][ap];
            if(nb && !nb.special && nb.subj === c.subj){ isDouble = true; break; }
          }
        }
      }
      if(isDouble){
        const custom = (typeof tcIsCustom === 'function') ? tcIsCustom(c.subj, g) : false;
        const want = custom ? ttClassDoubles(c.subj, g)
          : ((window.TT && window.TT.DOUBLES && window.TT.DOUBLES[c.subj] != null) ? window.TT.DOUBLES[c.subj] : 2);
        let pairs = 0;
        for(let dd = 0; dd < TT.ND; dd++){
          let run = 0;
          for(let pp = 0; pp <= TT.NP; pp++){
            const cc = pp < TT.NP ? _tt2.tt[g][dd][pp] : null;
            if(cc && !cc.special && cc.subj === c.subj) run++;
            else { if(run >= 2) pairs += Math.floor(run / 2); run = 0; }
          }
        }
        if(pairs > want) return c.subj + ' would exceed its doubles limit in Grade ' + g + '.';
      }
    }
    // max consecutive rest + daily load cap (moved teachers only)
    if(!moved[c.teacher]) continue;
    if(c.teacher && c.teacher !== '—' && TT.MAX_CONSEC){
      let run = 0, best = 0;
      for(let pp = 0; pp < TT.NP; pp++){
        if(load[c.teacher + '|' + d + '|' + pp]){ run++; best = Math.max(best, run); }
        else run = 0;
      }
      if(best > TT.MAX_CONSEC)
        return c.teacher + ' would teach ' + best + ' in a row (max ' + TT.MAX_CONSEC + ').';
    }
    // daily load cap (same 2-free-periods rule as the solver)
    if(c.teacher && c.teacher !== '—' && (dayN[c.teacher + '|' + d] || 0) >= maxDay)
      return c.teacher + ' would exceed the daily load on ' + (TT.DAYS[d] || ('day ' + (d + 1))) + '.';
  }
  return null;
}
function doSwap(src, dst){
  const A = _tt2.tt[src.grade][src.d][src.p];
  const B = _tt2.tt[dst.grade][dst.d][dst.p];
  if(A && A.special){ toast('⚠️ Fixed slots (assembly/games) cannot be moved.', true); return; }
  if(B && B.special) { toast('⚠️ Cannot swap with a fixed slot (assembly/games).', true); return; }
  const clash = swapCausesClash(src, dst);
  if(clash) { toast('⛔ ' + clash + ' would have two lessons in the same period.', true); return; }
  // apply tentatively, then enforce every other generator rule
  _tt2.tt[src.grade][src.d][src.p] = B || null;
  _tt2.tt[dst.grade][dst.d][dst.p] = A || null;
  const problem = ttaValidateSwap(src, dst);
  if(problem){
    _tt2.tt[src.grade][src.d][src.p] = A || null;
    _tt2.tt[dst.grade][dst.d][dst.p] = B || null;
    toast('⛔ Swap blocked: ' + problem, true);
    return;
  }
  ttRender();
  toast('✅ Swapped.');
}
window.ttaCellClick = function(grade, d, p){
  if (!_tt2) return;
  const cell = _tt2.tt[grade] && _tt2.tt[grade][d] && _tt2.tt[grade][d][p];
  if (cell && cell.special) return;
  const sel = window.__ttaSel;
  if (!sel) {
    if (!cell) return;
    window.__ttaSel = { grade, d, p };
    ttRender();
    return;
  }
  if (sel.grade === grade && sel.d === d && sel.p === p) { window.__ttaSel = null; ttRender(); return; }
  doSwap(sel, { grade, d, p });
  window.__ttaSel = null;
};
window.ttaDragStart = function(grade, d, p){ window.__ttaDrag = { grade, d, p }; };
window.ttaCellDrop = function(grade, d, p, ev){
  ev.preventDefault();
  const src = window.__ttaDrag;
  window.__ttaDrag = null;
  if (!src) return;
  doSwap(src, { grade, d, p });
};

function attachEditing(){
  if ((document.getElementById('tt_viewMode') || {}).value === 'by-teacher') return;
  const container = document.getElementById('tt_results');
  if (!container || !_tt2) return;
  container.querySelectorAll('table').forEach(tbl => {
    const card = tbl.closest('.card');
    const titleEl = card && card.querySelector('.card-title');
    const title = (titleEl ? titleEl.textContent : '') || '';
    const tblGrade = (title.match(/Grade\s+([0-9][A-Z])/i) || [])[1] || null;
    [...tbl.querySelectorAll('tbody tr')].forEach((tr, di) => {
      const cells = [...tr.children];
      if (cells.length < 2) return;
      const rowGrade = tblGrade || (cells[0].textContent || '').trim();
      let p = -1;
      cells.slice(1).forEach(td => {
        const txt = (td.textContent || '').trim();
        if (txt.length === 1 && 'BREAK'.includes(txt)) return;
        p++;
        if (p >= TT.NP) return;
        td.setAttribute('data-ttc-grade', rowGrade);
        td.setAttribute('data-ttc-d', di);
        td.setAttribute('data-ttc-p', p);
        td.classList.add('tta-cell');
        td.setAttribute('onclick', "ttaCellClick('" + rowGrade + "'," + di + ',' + p + ')');
        td.setAttribute('draggable', 'true');
        td.setAttribute('ondragstart', "ttaDragStart('" + rowGrade + "'," + di + ',' + p + ')');
        td.setAttribute('ondragover', 'event.preventDefault()');
        td.setAttribute('ondrop', "ttaCellDrop('" + rowGrade + "'," + di + ',' + p + ',event)');
      });
    });
  });
  const sel = window.__ttaSel;
  if (sel) {
    const td = container.querySelector('[data-ttc-grade="' + sel.grade + '"][data-ttc-d="' + sel.d + '"][data-ttc-p="' + sel.p + '"]');
    if (td) td.classList.add('tta-selected');
  }
}
function wrapRender(){
  if (typeof window.ttRender !== 'function' || window.ttRender.__adv) return false;
  const orig = window.ttRender;
  window.ttRender = function(){
    orig.apply(this, arguments);
    try { attachEditing(); } catch (e) {}
  };
  window.ttRender.__adv = true;
  return true;
}

/* ── advanced panel rendering ────────────────────────────────────────────── */
function teacherNames(){
  return [...new Set(((window.db && window.db.teachers) || []).map(t => fmtT(t.name)))].sort();
}
function subjectNames(){
  return [...new Set(((window.db && window.db.teachers) || [])
    .flatMap(t => (t.assignments || []).map(a => a.subject)))].filter(Boolean).sort();
}
function block(title, body){
  return '<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:700;color:var(--gold);letter-spacing:.05em;margin-bottom:6px">' + title + '</div>' + body + '</div>';
}
window.ttaRenderAdvanced = function(){
  const panel = document.getElementById('tta_panel');
  if (!panel) return;
  const teachers = teacherNames();
  const subjects = subjectNames();

  let structure = '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px">'
    + '<div><div style="font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px">DAYS / WEEK</div>'
    + '<select id="tta_nd" onchange="ttaSetDaysQuick(this.value)" style="padding:5px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-weight:700">'
    + Array.from({length: 5}, (_, i) => '<option value="' + (i + 1) + '"' + (TT.ND === i + 1 ? ' selected' : '') + '>'
      + (i + 1) + ' day' + (i ? 's' : '') + '</option>').join('')
    + '</select></div>'
    + '<div><div style="font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px">PERIODS PER DAY</div>'
    + '<input type="number" id="tta_np" min="1" max="12" value="' + TT.NP + '"'
    + ' style="width:70px;padding:5px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-weight:700;text-align:center"></div>'
    + '<button class="btn btn-sm" onclick="ttaBuildStructure()" style="font-size:11px">\u27F3 Set count</button>'
    + '<button class="btn btn-sm" onclick="ttApplyStructureEdits()" style="font-size:11px;background:rgba(13,122,82,.25);border:1px solid rgba(13,122,82,.5);color:var(--emerald)">\u2713 Apply structure</button>'
    + '</div>';
  structure += '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:10.5px">'
    + '<thead><tr><th style="padding:3px 6px;color:var(--text-muted);text-align:left">PERIOD</th>'
    + '<th style="padding:3px 8px;color:var(--sky);text-align:left">START \u2013 END</th>'
    + '<th style="padding:3px 8px;color:var(--gold);text-align:center" title="A break column is inserted BEFORE this period">BREAK BEFORE?</th>'
    + '<th style="padding:3px 8px;color:var(--text-muted);text-align:left">BREAK TIME</th></tr></thead><tbody>';
  for (let p = 0; p < TT.NP; p++) {
    const isB = TT.BREAK_AFTER.has(p);
    const bIdx = TT.BREAK_IDX.get(p);
    structure += '<tr>'
      + '<td style="padding:3px 6px;font-weight:800;color:var(--text)">' + pLabel(p) + '</td>'
      + '<td style="padding:3px 8px"><input id="tta_time_' + p + '" value="' + esc(TT.PERIOD_TIMES[p] || '') + '"'
      + ' style="width:110px;padding:4px;background:var(--navy);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px"></td>'
      + '<td style="padding:3px 8px;text-align:center"><input type="checkbox" class="tta-break-cb" value="' + p + '"'
      + (isB ? ' checked' : '') + ' onchange="ttaSyncBreaksFromGrid()" style="accent-color:var(--gold);width:15px;height:15px;cursor:pointer"></td>'
      + '<td style="padding:3px 8px">'
      + (isB ? '<input id="tta_btime_' + bIdx + '" value="' + esc(TT.BREAK_TIMES[bIdx] || '') + '"'
             + ' style="width:110px;padding:4px;background:var(--navy);border:1px solid var(--border);border-radius:5px;color:var(--text);font-size:11px">'
             : '<span style="color:var(--text-muted)">\u2014</span>')
      + '</td></tr>';
  }
  structure += '</tbody></table></div>';
  structure += '<div style="font-size:10px;color:var(--text-muted);margin-top:5px">Tick \u201Cbreak before\u201D to insert a break column ahead of that period (e.g. tick P3 for a break after P2). Edit each period\u2019s start\u2013end time, then Apply \u2014 and Generate again.</div>';

  let off = '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">'
    + '<div><div style="font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px">TEACHER</div>'
    + '<select id="tta_offTeacher" style="padding:5px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">'
    + teachers.map(t => '<option>' + esc(t) + '</option>').join('') + '</select></div>'
    + '<div><div style="font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px">DAY</div>'
    + '<select id="tta_offDay" style="padding:5px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">'
    + TT.DAYS.map((d, i) => '<option value="' + i + '">' + d + '</option>').join('') + '</select></div>'
    + '<div><div style="font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px">PERIOD</div>'
    + '<select id="tta_offPeriod" style="padding:5px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">'
    + Array.from({length: TT.NP}, (_, i) => '<option value="' + i + '">' + pLabel(i) + ' (' + (TT.PERIOD_TIMES[i] || '') + ')</option>').join('') + '</select></div>'
    + '<button class="btn btn-sm" onclick="ttaAddOff()" style="font-size:11px">\uD83D\uDEAB Set time off</button>'
    + '</div>';
  const offList = [];
  Object.entries(ADV.TEACHER_OFF).forEach(([t, set]) => {
    [...set].forEach(k => {
      const parts = k.split('_');
      offList.push('<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(200,64,64,.15);border:1px solid rgba(200,64,64,.45);color:var(--rose,#f87171);border-radius:20px;padding:2px 9px;font-size:10.5px;font-weight:700;margin:0 5px 5px 0">'
        + esc(t) + ' \u00B7 ' + TT.DAYS[+parts[0]] + ' ' + pLabel(+parts[1])
        + '<button onclick="ttaRemoveOff(\'' + esc(t) + '\',\'' + k + '\')" style="background:none;border:none;color:inherit;cursor:pointer;font-weight:800">\u2715</button></span>');
    });
  });
  off += '<div style="margin-top:7px">' + (offList.join('') || '<span style="font-size:10.5px;color:var(--text-muted)">No teacher time-off set.</span>') + '</div>';

  const doubles = '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + subjects.map(s => {
        const v = ADV.DOUBLES[s] || 0;
        return '<label style="display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;background:var(--surface-3);padding:3px 7px;border-radius:6px;border:1px solid var(--border)">'
          + '<span style="color:var(--text)">' + esc(s) + '</span>'
          + '<input type="number" min="0" max="3" value="' + v + '" onchange="ttaSetDouble(\'' + esc(s) + '\',this.value)"'
          + ' style="width:42px;padding:2px;text-align:center;background:var(--navy);border:1px solid var(--border);border-radius:4px;color:var(--sky);font-weight:800"></label>';
      }).join('')
    + '</div>'
    + '<div style="font-size:10px;color:var(--text-muted);margin-top:5px">A double = two consecutive periods inside one block \u2014 never split by a break. Each pair replaces 2 of the subject\u2019s weekly lessons. These are <b>defaults</b> \u2014 set per-class values in the \uD83D\uDC69\u200D\uD83C\uDFEB Teachers hub.</div>';

  const maxc = '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    + '<input type="number" id="tta_maxConsec" min="1" max="10" value="' + ADV.MAX_CONSEC + '"'
    + ' onchange="ttaSetMaxConsec(this.value)"'
    + ' style="width:70px;padding:5px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-weight:800;text-align:center">'
    + '<span style="font-size:10.5px;color:var(--text-muted)">consecutive lessons a teacher may have before a free period must follow, so they can rest (within each block of the day).</span></div>';

  const wexp = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    + '<select id="tta_wordScope" style="padding:6px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">'
    + '<option value="teachers">By Teachers</option><option value="class">By Class</option>'
    + '<option value="day">By Day</option><option value="whole">Whole Block</option></select>'
    + '<select id="tta_wordOrient" style="padding:6px 8px;background:var(--navy);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px">'
    + '<option value="landscape">Landscape</option><option value="portrait">Portrait</option></select>'
    + '<button class="btn btn-sm" onclick="ttaExportWord()" style="font-size:11.5px;background:rgba(30,86,200,.25);border:1px solid rgba(30,86,200,.5);color:var(--sky)">\uD83D\uDCDD Export Word</button>'
    + '<span style="font-size:10px;color:var(--text-muted)">A4 printable \u2014 each section on its own page</span></div>';

  panel.innerHTML =
    block('\u23F1\uFE0F DAYS, PERIODS & BREAKS', structure)
    + block('\uD83E\uDDD1\u200D\uD83C\uDFEB TEACHER TIME-OFF (no lesson scheduled at the selected period)', off)
    + block('\uD83D\uDC65 DOUBLE LESSONS PER SUBJECT (per week)', doubles)
    + block('\uD83D\uDE44 MAX CONSECUTIVE LESSONS PER TEACHER', maxc)
    + block('\uD83D\uDCDD PRINTABLE WORD EXPORT (A4)', wexp);
};

/* ── Word export (each section on its own A4 page) ───────────────────────── */
window.ttaExportWord = async function(){
  if (!_tt2) { toast('\u26A0\uFE0F Generate the timetable first.', true); return; }
  if (!window.docx) { toast('\u274C Word library not loaded.', true); return; }
  const D = window.docx;
  const scope = (document.getElementById('tta_wordScope') || {}).value || 'teachers';
  const land = ((document.getElementById('tta_wordOrient') || {}).value || 'landscape') === 'landscape';
  const grades = [...document.querySelectorAll('.tt-grade-cb:checked')].map(cb => cb.value);
  const term = (document.getElementById('tt_term') || {}).value || 'TERM 1';
  const yr = (document.getElementById('tt_year') || {}).value || '2026';
  if (!grades.length) { toast('\u26A0\uFE0F Select at least one grade.', true); return; }

  const cellP = (text, opts) => new D.TableCell({
    columnSpan: opts && opts.span,
    shading: opts && opts.fill ? { fill: opts.fill } : undefined,
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    children: [new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      children: String(text == null ? '' : text).split('\n').map(line =>
        new D.TextRun({ text: line, bold: !!(opts && opts.bold), size: opts && opts.size || 14, color: opts && opts.color || '222222' }))
    })]
  });
  function headerRow(firstLabel){
    const cells = [cellP(firstLabel, { fill: '0B1D3A', color: 'F2C744', bold: true })];
    for (let p = 0; p < TT.NP; p++) {
      if (TT.BREAK_AFTER.has(p)) cells.push(cellP('B\n' + (TT.BREAK_TIMES[TT.BREAK_IDX.get(p)] || ''), { fill: 'ECECEC', color: '888888', bold: true, size: 11 }));
      cells.push(cellP(pLabel(p) + '\n' + (TT.PERIOD_TIMES[p] || ''), { fill: '0B1D3A', color: 'DCE8FF', bold: true, size: 12 }));
    }
    return new D.TableRow({ tableHeader: true, children: cells });
  }
  function gridRow(label, getCell){
    const cells = [cellP(label, { fill: '162E52', color: 'DCE8FF', bold: true })];
    for (let p = 0; p < TT.NP; p++) {
      if (TT.BREAK_AFTER.has(p)) cells.push(cellP('B', { fill: 'ECECEC', color: '888888', bold: true }));
      const c = getCell(p);
      cells.push(cellP(c ? (c.special ? c.subj : (c.subj + '\n' + (c.teacher || ''))) : '', { bold: !!(c && !c.special) }));
    }
    return new D.TableRow({ children: cells });
  }
  const borders = {
    top: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
    bottom: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
    left: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
    right: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
    insideHorizontal: { style: D.BorderStyle.SINGLE, size: 2, color: 'AAAAAA' },
    insideVertical: { style: D.BorderStyle.SINGLE, size: 2, color: 'AAAAAA' }
  };
  const tableOf = rows => new D.Table({
    rows,
    width: { size: 100, type: D.WidthType.PERCENTAGE },
    borders,
    layout: (D.TableLayoutType && D.TableLayoutType.FIXED != null) ? D.TableLayoutType.FIXED : undefined
  });
  const scopeLabel = () => ({ teachers: 'By Teachers', class: 'By Class', day: 'By Day', whole: 'Whole Block' }[scope] || '');

  const children = [
    new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 60 },
      children: [new D.TextRun({ text: 'SANTAPRIS ACADEMY', bold: true, size: 32, color: '0B1D3A' })] }),
    new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 200 },
      children: [new D.TextRun({ text: 'TIMETABLE \u2014 ' + term + ' ' + yr + '  \u00B7  ' + scopeLabel() + '  \u00B7  ' + TT.ND + ' days \u00D7 ' + TT.NP + ' periods', bold: true, size: 24, color: 'B8860B' })] })
  ];
  const perTable = [];

  if (scope === 'teachers') {
    const tSet = new Map();
    grades.forEach(g => {
      for (let d = 0; d < TT.ND; d++) for (let p = 0; p < TT.NP; p++) {
        const c = _tt2.tt[g][d][p];
        if (c && !c.special && c.teacher && c.teacher !== '\u2014') {
          if (!tSet.has(c.teacher)) tSet.set(c.teacher, new Set());
          tSet.get(c.teacher).add(g);
        }
      }
    });
    [...tSet.keys()].sort().forEach(t => {
      const tGrades = [...tSet.get(t)];
      const rows = [headerRow('TEACHER')];
      TT.DAYS.forEach((day, d) => {
        rows.push(gridRow(TT.DAY_SHORT[d], p => {
          for (const g of tGrades) {
            const c = _tt2.tt[g][d][p];
            if (c && !c.special && c.teacher === t) return { subj: c.subj + ' (' + g + ')', teacher: null };
          }
          return null;
        }));
      });
      perTable.push({ title: '\uD83D\uDC64 ' + t, rows });
    });
  } else if (scope === 'class') {
    grades.forEach(g => {
      const rows = [headerRow('DAY')];
      TT.DAYS.forEach((day, d) => rows.push(gridRow(TT.DAY_SHORT[d], p => _tt2.tt[g][d][p])));
      perTable.push({ title: '\uD83C\uDFEB Grade ' + g, rows });
    });
  } else if (scope === 'day') {
    TT.DAYS.forEach((day, d) => {
      const rows = [headerRow('CLASS')];
      grades.forEach(g => rows.push(gridRow(g, p => _tt2.tt[g][d][p])));
      perTable.push({ title: '\uD83D\uDCC5 ' + day.toUpperCase(), rows });
    });
  } else {
    const rows = [new D.TableRow({ tableHeader: true, children: [
      cellP('DAY', { fill: '0B1D3A', color: 'F2C744', bold: true }),
      ...grades.map(g => cellP('Grade ' + g, { fill: '0B1D3A', color: 'DCE8FF', bold: true }))
    ] })];
    TT.DAYS.forEach((day, d) => {
      for (let p = 0; p < TT.NP; p++) {
        const isB = TT.BREAK_AFTER.has(p);
        rows.push(new D.TableRow({ children: [
          cellP((p === 0 ? TT.DAY_SHORT[d] + ' ' : '') + pLabel(p),
                { fill: p === 0 ? '162E52' : 'F4F6FA', color: p === 0 ? 'DCE8FF' : '444444', bold: p === 0, size: 12 }),
          ...grades.map(g => {
            if (isB) return cellP('B', { fill: 'ECECEC', color: '999999', bold: true });
            const c = _tt2.tt[g][d][p];
            return cellP(c ? (c.special ? c.subj : c.subj + '\n' + (c.teacher || '')) : '',
                         { bold: !!(c && !c.special), size: 13 });
          })
        ] }));
        if (isB && p < TT.NP - 1) {
          rows.push(new D.TableRow({ children: [
            cellP('', { fill: 'F4F6FA' }),
            ...grades.map(() => cellP('\u2014 BREAK \u2014', { fill: 'ECECEC', color: '888888', bold: true, size: 12 }))
          ] }));
        }
      }
    });
    perTable.push({ title: '\uD83D\uDDD3\uFE0F WHOLE BLOCK TIMETABLE', rows });
  }

  perTable.forEach((t, idx) => {
    children.push(new D.Paragraph({ spacing: { before: 240, after: 80 }, pageBreakBefore: idx > 0,
      children: [new D.TextRun({ text: t.title, bold: true, size: 22, color: '0B1D3A' })] }));
    children.push(tableOf(t.rows));
  });
  children.push(new D.Paragraph({ spacing: { before: 200 },
    children: [new D.TextRun({ text: 'Generated ' + new Date().toLocaleString() + '  \u00B7  Santapris Academy Timetable Generator', size: 14, color: '888888' })] }));

  const docFile = new D.Document({
    sections: [{
      properties: { page: { size: { width: land ? 16838 : 11906, height: land ? 11906 : 16838 }, margin: { top: 500, right: 400, bottom: 500, left: 400 } } },
      children
    }]
  });
  const blob = await D.Packer.toBlob(docFile);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ('Timetable_' + scopeLabel().replace(/\s+/g, '') + '_' + term + '_' + yr + '.docx').replace(/\s+/g, '_');
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('\uD83D\uDCDD Word timetable exported (' + scopeLabel() + ')!');
};

/* ── styles ──────────────────────────────────────────────────────────────── */
(function styles(){
  if (document.getElementById('tta-styles')) return;
  const st = document.createElement('style');
  st.id = 'tta-styles';
  st.textContent = `
    .tta-cell { cursor: pointer; }
    .tta-cell:hover { outline: 2px solid rgba(56,189,248,.7); outline-offset: -2px; }
    .tta-selected { outline: 2px dashed var(--gold) !important; outline-offset: -2px; background: rgba(242,199,68,.12) !important; }
  `;
  document.head.appendChild(st);
})();

/* ── boot ────────────────────────────────────────────────────────────────── */
load();
TT.TEACHER_OFF = ADV.TEACHER_OFF;
TT.MAX_CONSEC = ADV.MAX_CONSEC;
TT.DOUBLES = ADV.DOUBLES;

function wrapInit(){
  if (typeof window.initTimetablePage !== 'function' || window.initTimetablePage.__adv) return false;
  const orig = window.initTimetablePage;
  window.initTimetablePage = function(){
    const r = orig.apply(this, arguments);
    try { ttaRenderAdvanced(); } catch (e) {}
    try { if (typeof ttaRenderQuickBreaks === 'function') ttaRenderQuickBreaks(); } catch (e) {}
    return r;
  };
  window.initTimetablePage.__adv = true;
  const origGen = window.generateTimetableNow;
  if (origGen && !origGen.__adv) {
    window.generateTimetableNow = function(){
      TT.TEACHER_OFF = ADV.TEACHER_OFF;
      TT.MAX_CONSEC = ADV.MAX_CONSEC;
      TT.DOUBLES = ADV.DOUBLES;
      return origGen.apply(this, arguments);
    };
    window.generateTimetableNow.__adv = true;
  }
  if (!wrapRender()) {
    const t = setInterval(() => { if (wrapRender()) clearInterval(t); }, 200);
    setTimeout(() => clearInterval(t), 20000);
  }
  return true;
}
if (!wrapInit()) {
  const t0 = setInterval(() => { if (wrapInit()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}

})();
