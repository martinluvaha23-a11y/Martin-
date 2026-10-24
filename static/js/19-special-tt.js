/* ═══════════════════════════════════════════════════════════════════
   SPECIAL TIMETABLE GENERATOR — weekly evening + Saturday lessons
   Wizard: 1) teachers (exempt) → 2) type (evening days / Saturday) →
   3) grade (all its streams) → 4) periods + break/time popup + time-off →
   5) generate → preview + summary + Word/PDF/Excel exports.
   - Teachers, classes & subjects are imported live from the database.
   - Fair allocation: least-loaded teacher first, no same-period clashes,
     one lesson per teacher per class per day (so two subjects in one class
     never means two lessons), per-timetable equity cap (nobody exceeds one
     more than the least-loaded teacher in the grid), time-off respected.
     Saturday runs standalone (never reads weekday allocation).
     Subjects from the previous timetable get first priority.
   - Memory (cumulative counts + last-cycle subjects per type) persists in
     db.specialTT and syncs via saveDB — cumulative counts compensate
     previously overloaded teachers; deleting a history entry subtracts
     exactly that timetable's lessons back out of memory.
   - The preview / summary / exports always show the CURRENT (viewed)
     timetable's distribution only (r.counts), never cumulative memory.
   - Admin only: generation + export functions are role-blocked.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var STT = {
  step: 1,
  exempt: {},          // tid -> true
  type: null,          // 'evening' | 'saturday'
  days: [],            // evening day names
  grades: [],          // e.g. ['4','5'] — every stream under each is timetabled
  classes: [],         // streams, e.g. ['4E','4N','5N']
  nPeriods: 3,
  times: [],           // [{start:'16:00', end:'16:40', breakAfter:false, breakMin:10}]
  off: {},             // tid -> {periodIdx:true} = teacher OFF (unavailable) that period
  pool: [],            // scoped teachers [{id,name,assign:[{subject,classes[]}]}]
  result: null
};

var STT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/* Teacher Gladys (matched by name): Saturday cap = 3 lessons when periods
   per day > 4, else 2 — and her lessons must sit BEFORE the first break. */
function sttGladysIds(){
  var out = {};
  STT.pool.forEach(function(t){
    if(/gladys/i.test(t.name || '')) out[t.id] = 1;
  });
  return out;
}
function sttFirstBreakIdx(){
  for(var i = 0; i < STT.times.length; i++){
    if(STT.times[i].breakAfter) return i;
  }
  return null;
}

/* ── helpers ───────────────────────────────────────────────────────── */
function sttEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}
function sttShuffle(arr){
  for(var i = arr.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function sttToMin(v){
  var m = /^(\d{1,2}):(\d{2})/.exec(String(v || '').trim());
  if(!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function sttDur(a, b){
  var x = sttToMin(a), y = sttToMin(b);
  if(x === null || y === null || y <= x) return null;
  return y - x;
}
function sttTeacherName(tid){
  var t = null;
  STT.pool.forEach(function(x){ if(x.id === tid) t = x; });
  if(t) return t.name || tid;
  ((window.db && window.db.teachers) || []).forEach(function(x){ if(x.id === tid) t = x; });
  return (t && t.name) || tid;
}

/* ── teacher import (live from database) ───────────────────────────── */
function sttAssignOf(t){
  var a = (t && t.assignments) || [];
  if(typeof a === 'string'){ try{ a = JSON.parse(a); }catch(e){ a = []; } }
  return Array.isArray(a) ? a : [];
}
function sttClassesOf(t){
  var set = {};
  sttAssignOf(t).forEach(function(a){ ((a && a.classes) || []).forEach(function(c){ set[String(c).trim()] = 1; }); });
  return Object.keys(set).filter(Boolean);
}
function sttInScope(t){
  return sttClassesOf(t).some(function(c){ return /^[4-9]/.test(c); });
}
function sttLoadPool(){
  var list = ((window.db && window.db.teachers) || []).filter(sttInScope);
  var seen = {}, out = [];
  list.sort(function(a, b){ return String(a.name || '').localeCompare(String(b.name || '')); });
  list.forEach(function(t){
    if(seen[t.id]) return;
    seen[t.id] = 1;
    out.push({ id: t.id, name: t.name || t.id, assign: sttAssignOf(t).map(function(a){
      return { subject: a.subject, classes: (a.classes || []).map(String) };
    })});
  });
  STT.pool = out;
  return out;
}
function sttStreamsForGrade(g){
  var set = {};
  ((window.db && window.db.students) || []).forEach(function(s){
    if(String(s.grade || '').charAt(0) === String(g)) set[s.grade] = 1;
  });
  var out = Object.keys(set).sort();
  if(!out.length){
    ((window.db && window.db.teachers) || []).forEach(function(t){
      sttClassesOf(t).forEach(function(c){ if(String(c).charAt(0) === String(g)) set[c] = 1; });
    });
    out = Object.keys(set).sort();
  }
  return out;
}
/* candidate {tid,name,subject} list teaching this exact class (not exempt) */
function sttCandsForClass(cls){
  var out = [];
  STT.pool.forEach(function(t){
    if(STT.exempt[t.id]) return;
    (t.assign || []).forEach(function(a){
      if((a.classes || []).indexOf(cls) !== -1 && a.subject){
        out.push({ tid: t.id, name: t.name, subject: a.subject });
      }
    });
  });
  return out;
}

/* ── wizard navigation ─────────────────────────────────────────────── */
function sttGoto(n){
  STT.step = n;
  for(var i = 1; i <= 5; i++){
    var d = document.getElementById('stt_step' + i);
    if(d) d.style.display = (i === n) ? '' : 'none';
  }
  var ind = document.getElementById('stt_stepsInd');
  if(ind){
    var labels = ['Teachers', 'Type', 'Grade', 'Periods', 'Generate'];
    ind.innerHTML = labels.map(function(l, i){
      var k = i + 1;
      var cls = k < n ? 'done' : (k === n ? 'now' : '');
      return '<span class="stt-step ' + cls + '">' + k + '. ' + l + '</span>';
    }).join('<span class="stt-step-sep">→</span>');
  }
  var pg = document.getElementById('page-specialtt');
  if(pg) pg.scrollTop = 0;
  try{ window.scrollTo(0, 0); }catch(e){}
}
window.initSpecialTTPage = function(){
  if(getCurrentRole() !== 'admin'){ toast('⛔ Special Timetable is restricted to admin.', true); }
  sttLoadPool();
  sttRenderTeachers();
  sttGoto(1);
  // restore last result if present (distribution = its own grid only)
  var mem = (window.db && window.db.specialTT) || {};
  if(mem.lastRota && mem.lastRota.grid){
    STT.result = mem.lastRota;
    try{ STT.result.counts = sttGridCounts(STT.result.grid); }catch(e){}
    sttRenderResult();
  }
  sttRenderHistory();
  window.__sttInitialized = true;
};

/* ── step 1: teachers + exempt ─────────────────────────────────────── */
function sttRenderTeachers(){
  var box = document.getElementById('stt_teacherList');
  if(!box) return;
  if(!STT.pool.length){
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">👩‍🏫</div><p>No grade 4–9 teachers found. Add teacher subject allocations first.</p></div>';
  } else {
    box.innerHTML = STT.pool.map(function(t){
      var chips = (t.assign || []).map(function(a){
        return '<span class="stt-chip">' + sttEsc(a.subject) + ' → ' + sttEsc((a.classes || []).join(', ')) + '</span>';
      }).join(' ') || '<span class="muted">no allocations</span>';
      return '<label class="stt-teacher-row"><input type="checkbox" data-tid="' + sttEsc(t.id) + '"' +
        (STT.exempt[t.id] ? ' checked' : '') + ' onchange="sttExemptChanged()">' +
        '<span class="stt-tname">' + sttEsc(t.name) + '</span><span class="stt-tassign">' + chips + '</span>' +
        '<span class="stt-exempt-tag">exempt</span></label>';
    }).join('');
  }
  sttExemptChanged();
}
window.sttExemptChanged = function(){
  STT.exempt = {};
  document.querySelectorAll('#stt_teacherList input[type=checkbox]').forEach(function(cb){
    if(cb.checked) STT.exempt[cb.getAttribute('data-tid')] = 1;
  });
  var n = Object.keys(STT.exempt).length;
  var pill = document.getElementById('stt_exemptCount');
  if(pill) pill.textContent = n ? (n + ' exempt') : 'none exempt';
};
window.sttContinue1 = function(){
  window.sttExemptChanged();
  var left = STT.pool.filter(function(t){ return !STT.exempt[t.id]; });
  if(!left.length){ toast('All teachers are exempt — keep at least one.', true); return; }
  sttGoto(2);
};

/* ── step 2: type + days ───────────────────────────────────────────── */
window.sttPickType = function(type){
  STT.type = type;
  document.querySelectorAll('.stt-type-card').forEach(function(el){
    el.classList.toggle('sel', el.getAttribute('data-type') === type);
  });
  var dw = document.getElementById('stt_daysWrap');
  if(dw) dw.style.display = (type === 'evening') ? '' : 'none';
  var btn = document.getElementById('stt_toGradeBtn');
  if(btn) btn.disabled = false;
};
window.sttToggleDay = function(day){
  var i = STT.days.indexOf(day);
  if(i === -1) STT.days.push(day); else STT.days.splice(i, 1);
};
window.sttContinue2 = function(){
  if(!STT.type){ toast('Choose Weekly Evening or Saturday first.', true); return; }
  if(STT.type === 'evening'){
    STT.days = STT_DAYS.filter(function(d){
      var el = document.querySelector('input[data-day="' + d + '"]');
      return el && el.checked;
    });
    if(!STT.days.length){ toast('Tick at least one weekday for the evening timetable.', true); return; }
  } else {
    STT.days = ['Saturday'];
  }
  sttGoto(3);
};

/* ── step 3: grades (multi-select checkboxes) ─────────────────────── */
window.sttToggleGrade = function(g){
  g = String(g);
  var i = STT.grades.indexOf(g);
  if(i === -1) STT.grades.push(g); else STT.grades.splice(i, 1);
  STT.grades.sort();
  var set = {};
  STT.grades.forEach(function(gg){
    sttStreamsForGrade(gg).forEach(function(c){ set[c] = 1; });
  });
  STT.classes = Object.keys(set).sort();
  document.querySelectorAll('.stt-grade-card').forEach(function(el){
    el.classList.toggle('sel', STT.grades.indexOf(el.getAttribute('data-grade')) !== -1);
  });
  var info = document.getElementById('stt_gradeInfo');
  if(info) info.textContent = STT.classes.length
    ? ('Grades: ' + STT.grades.join(', ') + '  ·  Streams: ' + STT.classes.join(', '))
    : 'Tick at least one grade above.';
  var btn = document.getElementById('stt_toPeriodsBtn');
  if(btn) btn.disabled = !STT.classes.length;
};
window.sttPickGrade = window.sttToggleGrade; // backwards compat
window.sttContinue3 = function(){
  if(!STT.grades.length || !STT.classes.length){ toast('Tick at least one grade with streams.', true); return; }
  if(typeof sttPeriodsChanged === 'function') sttPeriodsChanged();
  sttRenderTimeOff();
  sttGoto(4);
};

/* ── time-off matrix (step 4): tick = available, untick = never allocate ── */
function sttRenderTimeOff(){
  var box = document.getElementById('stt_timeoff');
  if(!box) return;
  var mem = (window.db && window.db.specialTT) || {};
  if(!STT.off || !Object.keys(STT.off).length){
    if(mem[STT.type] && mem[STT.type].off){
      try{ STT.off = JSON.parse(JSON.stringify(mem[STT.type].off)); }catch(e){ STT.off = {}; }
    }
  }
  var teachers = STT.pool.filter(function(t){ return !STT.exempt[t.id]; });
  if(!teachers.length){ box.innerHTML = '<div class="muted">No teachers available.</div>'; return; }
  var html = '<table class="stt-grid"><thead><tr><th style="text-align:left;min-width:130px">Teacher</th>' +
    STT.times.map(function(p, i){
      return '<th>P' + (i + 1) + '<br><span class="muted" style="font-size:9px">' +
        sttEsc(p.start || '') + (p.breakAfter ? ' ☕' : '') + '</span></th>';
    }).join('') + '<th></th></tr></thead><tbody>';
  teachers.forEach(function(t){
    html += '<tr><td style="text-align:left;font-weight:700">' + sttEsc(t.name) + '</td>' +
      STT.times.map(function(p, i){
        var off = STT.off[t.id] && STT.off[t.id][i];
        return '<td><input type="checkbox" data-off-tid="' + sttEsc(t.id) + '" data-off-p="' + i + '"' +
          (off ? '' : ' checked') + ' onchange="sttOffChanged(this)" style="width:17px;height:17px;accent-color:var(--emerald)"></td>';
      }).join('') +
      '<td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-offrow="' + sttEsc(t.id) + '" data-offv="1" onclick="sttOffRowBtn(this)">all</button> ' +
      '<button class="btn btn-ghost btn-sm" data-offrow="' + sttEsc(t.id) + '" data-offv="0" onclick="sttOffRowBtn(this)">none</button></td></tr>';
  });
  box.innerHTML = html + '</tbody></table>';
}
window.sttOffChanged = function(cb){
  var tid = cb.getAttribute('data-off-tid');
  var p = parseInt(cb.getAttribute('data-off-p'), 10);
  if(!STT.off[tid]) STT.off[tid] = {};
  if(cb.checked) delete STT.off[tid][p]; else STT.off[tid][p] = true;
};
window.sttOffRowBtn = function(btn){
  var tid = btn.getAttribute('data-offrow');
  var avail = btn.getAttribute('data-offv') === '1';
  if(!STT.off[tid]) STT.off[tid] = {};
  document.querySelectorAll('#stt_timeoff input[data-off-tid]').forEach(function(cb){
    if(cb.getAttribute('data-off-tid') !== tid) return;
    cb.checked = avail;
    var p = parseInt(cb.getAttribute('data-off-p'), 10);
    if(avail) delete STT.off[tid][p]; else STT.off[tid][p] = true;
  });
};

/* ── step 4: periods + break/time popup ────────────────────────────── */
window.sttPeriodsChanged = function(){
  var sel = document.getElementById('stt_nPeriods');
  STT.nPeriods = Math.max(1, Math.min(8, parseInt(sel.value, 10) || 3));
  // default times: 40-min lessons from 16:00
  var base = 16 * 60, len = 40;
  if(!STT.times.length || STT.times.length !== STT.nPeriods){
    STT.times = [];
    for(var i = 0; i < STT.nPeriods; i++){
      var s = base + i * len;
      STT.times.push({ start: sttFmt(s), end: sttFmt(s + len), breakAfter: false, breakMin: 10 });
    }
  } else {
    while(STT.times.length < STT.nPeriods){
      var last = STT.times[STT.times.length - 1];
      var ns = sttToMin(last.end); if(ns === null) ns = base;
      STT.times.push({ start: sttFmt(ns), end: sttFmt(ns + len), breakAfter: false, breakMin: 10 });
    }
    STT.times.length = STT.nPeriods;
  }
  sttRenderPeriods();
  if(typeof sttRenderTimeOff === 'function') sttRenderTimeOff();
};
function sttFmt(mins){
  return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
}
function sttRenderPeriods(){
  var box = document.getElementById('stt_periodList');
  if(!box) return;
  box.innerHTML = STT.times.map(function(p, i){
    var d = sttDur(p.start, p.end);
    return '<div class="stt-period-row"><span class="stt-pname">Lesson ' + (i + 1) + '</span>' +
      '<span class="muted">' + sttEsc(p.start) + ' – ' + sttEsc(p.end) +
      (d === null ? ' <b style="color:var(--rose)">(invalid)</b>' : ' (' + d + ' min)') +
      (p.breakAfter ? ' · ☕ break ' + p.breakMin + ' min after' : '') + '</span></div>';
  }).join('');
}
window.sttOpenBreaks = function(){
  var box = document.getElementById('stt_breakRows');
  if(!box) return;
  box.innerHTML = STT.times.map(function(p, i){
    return '<div class="stt-break-row"><span class="stt-pname">Lesson ' + (i + 1) + '</span>' +
      '<label>Start <input type="time" id="stt_t_s' + i + '" value="' + sttEsc(p.start) + '"></label>' +
      '<label>End <input type="time" id="stt_t_e' + i + '" value="' + sttEsc(p.end) + '"></label>' +
      '<label class="stt-check"><input type="checkbox" id="stt_t_b' + i + '"' + (p.breakAfter ? ' checked' : '') + '> break after</label>' +
      '<label>Break min <input type="number" id="stt_t_m' + i + '" value="' + p.breakMin + '" min="0" max="60" style="width:64px"></label></div>';
  }).join('');
  document.getElementById('stt_breakOverlay').style.display = 'flex';
};
window.sttCloseBreaks = function(){
  document.getElementById('stt_breakOverlay').style.display = 'none';
};
window.sttSaveBreaks = function(){
  for(var i = 0; i < STT.times.length; i++){
    var s = document.getElementById('stt_t_s' + i).value;
    var e = document.getElementById('stt_t_e' + i).value;
    if(sttDur(s, e) === null){ toast('Lesson ' + (i + 1) + ': end time must be after start time.', true); return; }
    STT.times[i].start = s;
    STT.times[i].end = e;
    STT.times[i].breakAfter = document.getElementById('stt_t_b' + i).checked;
    STT.times[i].breakMin = Math.max(0, parseInt(document.getElementById('stt_t_m' + i).value, 10) || 0);
  }
  sttCloseBreaks();
  sttRenderPeriods();
  toast('✅ Times & breaks set');
};
window.sttContinue4 = function(){
  for(var i = 0; i < STT.times.length; i++){
    if(sttDur(STT.times[i].start, STT.times[i].end) === null){
      toast('Lesson ' + (i + 1) + ' has an invalid time — open Times & Breaks to fix.', true);
      return;
    }
  }
  // summary line on the generate page
  var sum = document.getElementById('stt_genSummary');
  if(sum){
    var isEve = STT.type === 'evening';
    sum.innerHTML = '<span class="stt-chip">' + (isEve ? '🌙 Weekly Evening' : '📅 Saturday') + '</span> ' +
      '<span class="stt-chip">Grades ' + STT.grades.join(', ') + ' (' + STT.classes.join(', ') + ')</span> ' +
      '<span class="stt-chip">' + (isEve ? STT.days.join(', ') : 'Saturday') + '</span> ' +
      '<span class="stt-chip">' + STT.times.length + ' lessons/day</span>';
  }
  sttGoto(5);
};

/* ── step 5: allocation algorithm ──────────────────────────────────── */
function sttMem(){
  if(!window.db.specialTT || typeof window.db.specialTT !== 'object') window.db.specialTT = {};
  if(!window.db.specialTT[STT.type]) window.db.specialTT[STT.type] = { counts: {}, lastCycle: {}, cycles: 0 };
  return window.db.specialTT[STT.type];
}
window.sttGenerate = function(){
  if(getCurrentRole() !== 'admin'){ toast('⛔ Special Timetable is restricted to admin.', true); return; }
  var days = STT.type === 'saturday' ? ['Saturday'] : STT.days.slice();
  if(!days.length){ toast('No days selected.', true); return; }
  // Teachable period indexes — break slots are never taught in.
  var slots = [];
  STT.times.forEach(function(p, i){ if(!p.breakAfter) slots.push(i); });
  if(!slots.length){ toast('Every period is a break — untick a break to teach.', true); return; }
  // Gladys rule inputs
  var gladys = sttGladysIds();
  var gladysCap = STT.nPeriods > 4 ? 3 : 2;
  var firstBreak = sttFirstBreakIdx();
  // candidate pool per class
  var classCands = {}, ok = true;
  STT.classes.forEach(function(cls){
    classCands[cls] = sttShuffle(sttCandsForClass(cls));
    if(!classCands[cls].length) ok = false;
  });
  if(!ok){
    var empty = STT.classes.filter(function(c){ return !classCands[c].length; });
    toast('No teachers allocated for: ' + empty.join(', ') + ' — add subject allocations first.', true);
    return;
  }
  var mem = sttMem();
  var counts0 = Object.assign({}, mem.counts);
  // Saturday stands alone: it never reads weekday (evening) allocation.
  var lastCycle = mem.lastCycle || {};

  // Multi-start: greedy slot order is shuffled, so run several attempts and
  // keep the best (fewest unfilled, then smallest gap) — a packing dead-end
  // in one order usually vanishes in another.
  var best = null;
  try{ window.__sttDbg = []; }catch(e){}
  for(var att = 0; att < 12; att++){
    var cur = sttAttempt(days, slots, classCands, gladys, gladysCap, firstBreak, counts0, lastCycle);
    if(!best || cur.unfilled < best.unfilled ||
       (cur.unfilled === best.unfilled && cur.gap < best.gap)) best = cur;
    if(best.unfilled === 0 && best.gap <= 1) break;  // can't do better
  }
  var busy = best.busy, used = best.used,
      gridN = best.gridN, grid = best.grid, unfilled = best.unfilled,
      counts = best.counts;

  // rotation memory: subjects used per class this cycle
  var newCycle = {};
  STT.classes.forEach(function(cls){
    var set = {};
    Object.keys(grid[cls] || {}).forEach(function(d){
      Object.keys(grid[cls][d] || {}).forEach(function(p){ set[grid[cls][d][p].subject] = 1; });
    });
    newCycle[cls] = Object.keys(set).sort();
  });
  mem.counts = counts;   // cumulative equity memory (compensates the overloaded)
  mem.lastCycle = newCycle;
  mem.cycles = (mem.cycles || 0) + 1;
  mem.off = JSON.parse(JSON.stringify(STT.off || {}));  // persist time-off choices

  STT.result = {
    generatedAt: new Date().toLocaleString('en-GB'),
    type: STT.type, days: days, grades: STT.grades.slice(), grade: STT.grades.join(','),
    classes: STT.classes.slice(),
    times: JSON.parse(JSON.stringify(STT.times)),
    exempt: Object.keys(STT.exempt),
    grid: grid, counts: gridN, unfilled: unfilled, cycles: mem.cycles
  };
  var all = window.db.specialTT; all.lastRota = STT.result;
  // history: keep past generations viewable for reference (cap 10 per type)
  mem.history = mem.history || [];
  try{ mem.history.unshift(JSON.parse(JSON.stringify(STT.result))); }catch(e){}
  if(mem.history.length > 10) mem.history.length = 10;
  saveDB();
  sttRenderResult();
  sttRenderHistory();
  var msg = '✅ Timetable generated — ' + STT.classes.length + ' classes, ' +
    Object.keys(counts).length + ' teachers';
  toast(unfilled ? (msg + ' (' + unfilled + ' slots unfilled — pool too small or Sat cap reached)') : msg,
    unfilled ? true : false);
};
/* One-lesson rule key: Saturday = one lesson per teacher per class per day;
   evening = one lesson per teacher per class for the WHOLE timetable
   (a teacher never appears twice in the same class all week). */
function sttUsedKey(tid, cls, day){
  return STT.type === 'evening' ? (tid + '|' + cls) : (tid + '|' + cls + '|' + day);
}
/* Evening subject-once-per-class rule: a subject (parent-normalized, so
   ENG PP1/PP2/GRA/COMP all count as ENG) appears at most once per class
   for the whole week. Saturday is untouched. */
function sttSubjectKey(s){
  var u = String(s || '').toUpperCase().trim();
  if(u === 'ENG' || u === 'ENG PP1' || u === 'ENG PP2' || u === 'GRA' || u === 'COMP') return 'ENG';
  if(u === 'KIS' || u === 'KIS PP1' || u === 'KIS PP2' || u === 'LUG' || u === 'INS') return 'KIS';
  if(u === 'SCIE' || u === 'SCIE PP1' || u === 'SCIE PP2') return 'SCIE';
  return u;
}
function sttSubjFree(cls, subject){
  if(STT.type !== 'evening') return true;
  return !sttSubjUsedMap[cls + '|' + sttSubjectKey(subject)];
}
function sttSubjTake(cls, subject){
  if(STT.type !== 'evening') return;
  sttSubjUsedMap[cls + '|' + sttSubjectKey(subject)] = 1;
}
function sttSubjDrop(cls, subject){
  if(STT.type !== 'evening') return;
  delete sttSubjUsedMap[cls + '|' + sttSubjectKey(subject)];
}
var sttSubjUsedMap = {};
/* One greedy allocation attempt (fresh shuffle order): allocate least-
   loaded-first under all rules, then rebalance to a fixpoint. Returns the
   grid plus scoring (unfilled, gap) so the caller can keep the best. */
function sttAttempt(days, slots, classCands, gladys, gladysCap, firstBreak, counts0, lastCycle){
  var counts = Object.assign({}, counts0);
  var busy = {};   // tid -> {day|period:1}
  var satN = {};   // Saturday lessons per teacher this grid
  var used = {};   // one-lesson rule (see sttUsedKey): Saturday per class per
                   // day, evening per class for the whole timetable
  var gridN = {};  // lessons per teacher in THIS grid only
  var grid = {};   // cls -> day -> periodIdx -> {tid,name,subject}
  var unfilled = 0;
  sttSubjUsedMap = {};  // reset each attempt (single-threaded runs)

  // shuffled slot order each attempt so ties rotate
  var jobs = [];
  STT.classes.forEach(function(cls){ days.forEach(function(d){ slots.forEach(function(p){ jobs.push({ cls: cls, day: d, p: p }); }); }); });
  sttShuffle(jobs);

  // Equity cap on THIS grid (never cumulative memory): nobody may exceed
  // one more than the least-loaded teacher in this timetable, so the grid
  // itself stays fair (gap of at most one) no matter how big past totals are.
  // Cumulative memory still compensates through the least-loaded-first pick.
  // The floor is measured over teachers who can actually teach the selected
  // classes (fully time-off teachers are ignored, else they'd freeze the cap).
  function sttCap(){
    var active = {}, s;
    for(s in classCands) (classCands[s] || []).forEach(function(c){ active[c.tid] = 1; });
    var mn = Infinity;
    Object.keys(active).forEach(function(t){
      var offAll = slots.every(function(p){ return STT.off[t] && STT.off[t][p]; });
      if(offAll) return;
      var c = gridN[t] || 0;
      if(c < mn) mn = c;
    });
    if(mn === Infinity) mn = 0;
    return mn + 1;
  }

  jobs.forEach(function(job){
    var cands = classCands[job.cls].filter(function(c){
      if(busy[c.tid + '|' + job.day + '|' + job.p]) return false;      // clash
      if(used[sttUsedKey(c.tid, job.cls, job.day)]) return false;   // one class turn each
      if(!sttSubjFree(job.cls, c.subject)) return false;            // evening: subject once per class
      if(STT.off[c.tid] && STT.off[c.tid][job.p]) return false;       // time off
      if(STT.type === 'saturday' && gladys[c.tid]){
        if((satN[c.tid] || 0) >= gladysCap) return false;             // Gladys Sat cap
        if(firstBreak !== null && job.p >= firstBreak) return false;  // Gladys before the break
      }
      return true;
    });
    if(!cands.length){
      unfilled++;
      if(!window.__sttDbg) window.__sttDbg = [];
      window.__sttDbg.push({ cls: job.cls, day: job.day, p: job.p,
        cands: (classCands[job.cls] || []).map(function(c){
          return { tid: c.tid, subj: c.subject,
            busy: !!busy[c.tid + '|' + job.day + '|' + job.p],
            used: !!used[sttUsedKey(c.tid, job.cls, job.day)],
            off: !!(STT.off[c.tid] && STT.off[c.tid][job.p]) };
        }) });
      return;
    }
    var cap = sttCap();
    var capped = cands.filter(function(c){ return (gridN[c.tid] || 0) + 1 <= cap; });
    var ranked = (capped.length ? capped : cands);  // fall back rather than leave empty
    var lc = lastCycle[job.cls] || [];
    ranked.sort(function(a, b){
      return sttScore(a, counts, lc) - sttScore(b, counts, lc);
    });
    var pick = ranked[0];
    busy[pick.tid + '|' + job.day + '|' + job.p] = 1;
    used[sttUsedKey(pick.tid, job.cls, job.day)] = 1;
    sttSubjTake(job.cls, pick.subject);
    counts[pick.tid] = (counts[pick.tid] || 0) + 1;
    gridN[pick.tid] = (gridN[pick.tid] || 0) + 1;
    if(STT.type === 'saturday') satN[pick.tid] = (satN[pick.tid] || 0) + 1;
    if(!grid[job.cls]) grid[job.cls] = {};
    if(!grid[job.cls][job.day]) grid[job.cls][job.day] = {};
    grid[job.cls][job.day][job.p] = pick;
  });

  // rebalance to a fixpoint: shrink max-min gap where a clash-free swap exists
  sttRebalance(grid, days, slots, counts, gridN, classCands, busy, used, gladys, gladysCap, firstBreak);
  // repair still-empty slots by relocating blockers (see below), then
  // rebalance once more around the repaired grid
  sttRepairUnfilled(grid, days, slots, counts, gridN, satN, classCands, busy, used, gladys, gladysCap, firstBreak);
  sttRebalance(grid, days, slots, counts, gridN, classCands, busy, used, gladys, gladysCap, firstBreak);

  // recount empties after repair (jobs-slot truth, not the loop counter)
  var jobs2 = [];
  STT.classes.forEach(function(cls){ days.forEach(function(d){ slots.forEach(function(p){ jobs2.push({ cls: cls, day: d, p: p }); }); }); });
  unfilled = jobs2.filter(function(j){
    return !(grid[j.cls] && grid[j.cls][j.day] && grid[j.cls][j.day][j.p] !== undefined);
  }).length;

  var vals = Object.keys(gridN).map(function(k){ return gridN[k]; });
  var gap = vals.length ? (Math.max.apply(null, vals) - Math.min.apply(null, vals)) : 0;
  return { busy: busy, used: used, gridN: gridN, grid: grid, unfilled: unfilled, counts: counts, gap: gap };
}
/* Repair empty slots: for each unfilled (class, day, period), either place a
   free qualified teacher directly, or relocate the blocker — a qualified
   teacher X who is busy at that period in another class C2 is moved here
   while a teacher Y free at that period takes X's old slot. One-per-class,
   time-off and Gladys rules hold for both moves; the cap is ignored for
   repairs (filling beats capping, the rebalance afterwards re-tightens). */
function sttRepairUnfilled(grid, days, slots, counts, gridN, satN, classCands, busy, used, gladys, gladysCap, firstBreak){
  function gladysOk(tid, p){
    if(STT.type === 'saturday' && gladys[tid]){
      var n = 0;
      STT.classes.forEach(function(cc){
        Object.keys(grid[cc] || {}).forEach(function(dd){
          Object.keys(grid[cc][dd] || {}).forEach(function(pp){
            if(grid[cc][dd][pp].tid === tid) n++;
          });
        });
      });
      if(n >= gladysCap) return false;
      if(firstBreak !== null && p >= firstBreak) return false;
    }
    return true;
  }
  function presentIn(cls){
    var present = {};
    Object.keys(grid[cls] || {}).forEach(function(dd){
      Object.keys(grid[cls][dd] || {}).forEach(function(pp){
        var o = grid[cls][dd][pp];
        if(o) present[o.subject] = (present[o.subject] || 0) + 1;
      });
    });
    return present;
  }
  function place(cls, d, p, tid, subject){
    if(!grid[cls]) grid[cls] = {};
    if(!grid[cls][d]) grid[cls][d] = {};
    grid[cls][d][p] = { tid: tid, name: sttTeacherName(tid), subject: subject };
    busy[tid + '|' + d + '|' + p] = 1;
    used[sttUsedKey(tid, cls, d)] = 1;
    sttSubjTake(cls, subject);
    counts[tid] = (counts[tid] || 0) + 1;
    gridN[tid] = (gridN[tid] || 0) + 1;
    if(STT.type === 'saturday') satN[tid] = (satN[tid] || 0) + 1;
  }
  STT.classes.forEach(function(cls){
    days.forEach(function(d){
      slots.forEach(function(p){
        if(grid[cls] && grid[cls][d] && grid[cls][d][p] !== undefined) return;
        var subs = presentIn(cls);
        // 1) direct: qualified, unused in class, free, off/Gladys clear
        var direct = (classCands[cls] || []).filter(function(c){
          return !busy[c.tid + '|' + d + '|' + p] && !used[sttUsedKey(c.tid, cls, d)] &&
            sttSubjFree(cls, c.subject) &&
            !(STT.off[c.tid] && STT.off[c.tid][p]) && gladysOk(c.tid, p);
        });
        if(direct.length){
          direct.sort(function(a, b){ return (subs[a.subject] || 0) - (subs[b.subject] || 0); });
          place(cls, d, p, direct[0].tid, direct[0].subject);
          return;
        }
        // 2) relocate: X qualified + unused here but busy@p in C2; Y takes C2@p
        var candX = (classCands[cls] || []).filter(function(c){
          return !used[sttUsedKey(c.tid, cls, d)] &&
            !(STT.off[c.tid] && STT.off[c.tid][p]) && gladysOk(c.tid, p) &&
            busy[c.tid + '|' + d + '|' + p];
        });
        for(var xi = 0; xi < candX.length; xi++){
          var xid = candX[xi].tid;
          // find X's lesson at this period (the blocking slot in C2)
          var c2 = null;
          STT.classes.forEach(function(cc){
            if(cc !== cls && grid[cc] && grid[cc][d] && grid[cc][d][p] && grid[cc][d][p].tid === xid) c2 = cc;
          });
          if(!c2) continue;
          var subs2 = presentIn(c2);
          var candY = (classCands[c2] || []).filter(function(c){
            return c.tid !== xid && !busy[c.tid + '|' + d + '|' + p] && !used[sttUsedKey(c.tid, c2, d)] &&
              sttSubjFree(c2, c.subject) &&
              !(STT.off[c.tid] && STT.off[c.tid][p]) && gladysOk(c.tid, p);
          });
          if(!candY.length) continue;
          candY.sort(function(a, b){ return (subs2[a.subject] || 0) - (subs2[b.subject] || 0); });
          var xSubs = {};
          (classCands[cls] || []).forEach(function(c){ if(c.tid === xid) xSubs[c.subject] = 1; });
          var xList = Object.keys(xSubs).filter(function(s){ return sttSubjFree(cls, s); })
            .sort(function(a, b){ return (subs[a] || 0) - (subs[b] || 0); });
          if(!xList.length) continue;
          // move: Y takes C2@p, X takes the empty slot (X keeps one lesson)
          var oldSub2 = grid[c2][d][p] && grid[c2][d][p].subject;
          sttSubjDrop(c2, oldSub2);
          place(c2, d, p, candY[0].tid, candY[0].subject);
          delete used[sttUsedKey(xid, c2, d)];
          place(cls, d, p, xid, xList[0]);
          counts[xid]--; gridN[xid]--;
          if(STT.type === 'saturday') satN[xid] = Math.max(0, (satN[xid] || 1) - 1);
          return;
        }
      });
    });
  });
}
function sttScore(c, counts, lastCycle){
  var s = counts[c.tid] || 0;
  if((lastCycle || []).indexOf(c.subject) !== -1) s -= 0.75;   // previous timetable's subjects first
  if(STT.type === 'evening'){
    // core-subject priority (evening only): MATHS, then ENG, then KIS.
    // Fractional so teacher equity (whole counts) always dominates.
    if(c.subject === 'MATHS') s -= 0.6;
    else if(c.subject === 'ENG') s -= 0.5;
    else if(c.subject === 'KIS') s -= 0.4;
  }
  return s;
}
function sttRebalance(grid, days, slots, counts, gridN, classCands, busy, used, gladys, gladysCap, firstBreak){
  function satCount(tid){
    var n = 0;
    STT.classes.forEach(function(cc){
      Object.keys(grid[cc] || {}).forEach(function(dd){
        Object.keys(grid[cc][dd] || {}).forEach(function(pp){
          if(grid[cc][dd][pp].tid === tid) n++;
        });
      });
    });
    return n;
  }
  for(var pass = 0; pass < 10; pass++){
    // balance THIS grid (gridN), not cumulative memory — the timetable in
    // front of the user must be fair; cumulative compensation already ran
    // during the least-loaded-first pick.
    var keyset = {};
    Object.keys(counts).forEach(function(t){ keyset[t] = 1; });
    Object.keys(gridN).forEach(function(t){ keyset[t] = 1; });
    var tids = Object.keys(keyset);
    if(tids.length < 2) return;
    var hi = tids[0], lo = tids[0];
    tids.forEach(function(t){
      if((gridN[t] || 0) > (gridN[hi] || 0)) hi = t;
      if((gridN[t] || 0) < (gridN[lo] || 0)) lo = t;
    });
    if((gridN[hi] || 0) - (gridN[lo] || 0) <= 1) return;
    // find a hi lesson that lo could take (same class+subject qualified,
    // clash-free, no-repeat intact, Gladys rules intact)
    var moved = false;
    outer:
    for(var ci = 0; ci < STT.classes.length; ci++){
      var cls = STT.classes[ci];
      var loSubs = {};
      (classCands[cls] || []).forEach(function(c){ if(c.tid === lo) loSubs[c.subject] = 1; });
      for(var di = 0; di < days.length; di++){
        for(var pi = 0; pi < slots.length; pi++){
          var cell = grid[cls] && grid[cls][days[di]] && grid[cls][days[di]][slots[pi]];
          if(cell && cell.tid === hi && loSubs[cell.subject] && !busy[lo + '|' + days[di] + '|' + slots[pi]]){
            if(used[sttUsedKey(lo, cls, days[di])]) continue;
            if(STT.off[lo] && STT.off[lo][slots[pi]]) continue;
            if(STT.type === 'saturday' && gladys[lo]){
              if(satCount(lo) >= gladysCap) continue;
              if(firstBreak !== null && slots[pi] >= firstBreak) continue;
            }
            delete busy[hi + '|' + days[di] + '|' + slots[pi]];
            busy[lo + '|' + days[di] + '|' + slots[pi]] = 1;
            delete used[sttUsedKey(hi, cls, days[di])];
            used[sttUsedKey(lo, cls, days[di])] = 1;
            cell.tid = lo; cell.name = sttTeacherName(lo);
            counts[hi]--; counts[lo]++;
            gridN[hi]--; gridN[lo] = (gridN[lo] || 0) + 1;
            moved = true;
            break outer;
          }
        }
      }
    }
    if(!moved){
      // fallback: coverage-preserving subject swap — lo takes hi's slot with
      // one of lo's own subjects for that class, but ONLY if hi's subject
      // stays covered by another lesson in the same class that day, lo has
      // no lesson in that class that day, and time-off/Gladys rules hold.
      // lo's least-present subject in the class is used (subject balance).
      outer2:
      for(var ci2 = 0; ci2 < STT.classes.length; ci2++){
        var cls2 = STT.classes[ci2];
        var loSubs2 = {};
        (classCands[cls2] || []).forEach(function(c){ if(c.tid === lo) loSubs2[c.subject] = 1; });
        var loList = Object.keys(loSubs2);
        if(!loList.length) continue;
        for(var di2 = 0; di2 < days.length; di2++){
          var present = {};
          Object.keys(grid[cls2] || {}).forEach(function(dd){
            Object.keys(grid[cls2][dd] || {}).forEach(function(pp){
              var o = grid[cls2][dd][pp];
              if(o) present[o.subject] = (present[o.subject] || 0) + 1;
            });
          });
          for(var pi2 = 0; pi2 < slots.length; pi2++){
            var cell2 = grid[cls2] && grid[cls2][days[di2]] && grid[cls2][days[di2]][slots[pi2]];
            if(!cell2 || cell2.tid !== hi) continue;
            if(busy[lo + '|' + days[di2] + '|' + slots[pi2]]) continue;
            if(used[sttUsedKey(lo, cls2, days[di2])]) continue;
            if(STT.off[lo] && STT.off[lo][slots[pi2]]) continue;
            if(STT.type === 'saturday' && gladys[lo]){
              if(satCount(lo) >= gladysCap) continue;
              if(firstBreak !== null && slots[pi2] >= firstBreak) continue;
            }
            var covered = false;
            Object.keys(grid[cls2][days[di2]] || {}).forEach(function(pp){
              var o = grid[cls2][days[di2]][pp];
              if(o && o !== cell2 && o.subject === cell2.subject) covered = true;
            });
            if(!covered) continue;
            var loFree = loList.filter(function(s){ return sttSubjFree(cls2, s); });
            if(!loFree.length) continue;
            loFree.sort(function(a, b){ return (present[a] || 0) - (present[b] || 0); });
            delete busy[hi + '|' + days[di2] + '|' + slots[pi2]];
            busy[lo + '|' + days[di2] + '|' + slots[pi2]] = 1;
            delete used[sttUsedKey(hi, cls2, days[di2])];
            used[sttUsedKey(lo, cls2, days[di2])] = 1;
            sttSubjDrop(cls2, cell2.subject);
            cell2.tid = lo; cell2.name = sttTeacherName(lo); cell2.subject = loFree[0];
            sttSubjTake(cls2, loFree[0]);
            counts[hi]--; counts[lo]++;
            gridN[hi]--; gridN[lo] = (gridN[lo] || 0) + 1;
            moved = true;
            break outer2;
          }
        }
      }
    }
    if(!moved) return;
  }
}

/* ── past timetables (reference) ─────────────────────────────────────── */
/* Lessons per teacher counted from a grid (this timetable only) — used to
   normalise old records and to subtract exactly a deleted timetable's
   lessons back out of cumulative memory. */
function sttGridCounts(grid){
  var n = {};
  Object.keys(grid || {}).forEach(function(cls){
    Object.keys(grid[cls] || {}).forEach(function(d){
      Object.keys(grid[cls][d] || {}).forEach(function(p){
        var c = grid[cls][d][p];
        if(c && c.tid) n[c.tid] = (n[c.tid] || 0) + 1;
      });
    });
  });
  return n;
}
function sttRenderHistory(){
  var box = document.getElementById('stt_history');
  if(!box) return;
  var mem = (window.db && window.db.specialTT) || {};
  var html = '';
  ['evening', 'saturday'].forEach(function(type){
    var h = (mem[type] && mem[type].history) || [];
    if(!h.length) return;
    html += '<div class="muted" style="margin:8px 0 6px;font-weight:700">' +
      (type === 'evening' ? '🌙 Evening' : '📅 Saturday') + '</div>';
    html += h.map(function(r, i){
      return '<div class="stt-period-row"><span style="flex:1">' + sttEsc(r.generatedAt || '') +
        ' · Grades ' + sttEsc((r.grades || [r.grade]).join(', ')) +
        ' · ' + (r.classes || []).length + ' classes</span>' +
        '<button class="btn btn-sm btn-ghost" onclick="sttViewHistory(\'' + type + '\',' + i + ')">👁 Open</button>' +
        '<button class="btn btn-sm btn-ghost" style="color:var(--rose)" onclick="sttDeleteHistory(\'' + type + '\',' + i + ')">🗑</button></div>';
    }).join('');
  });
  box.innerHTML = html || '<div class="muted">No past timetables yet — generated ones are kept here automatically.</div>';
}
window.sttViewHistory = function(type, i){
  var h = (((window.db && window.db.specialTT) || {})[type] || {}).history || [];
  if(!h[i]){ toast('Timetable not found.', true); return; }
  try{ STT.result = JSON.parse(JSON.stringify(h[i])); }catch(e){ STT.result = h[i]; }
  // distribution shown is always this timetable's own (recount from its grid)
  try{ STT.result.counts = sttGridCounts(STT.result.grid); }catch(e){}
  sttRenderResult();
  sttGoto(5);
  toast('📂 Opened timetable from ' + (STT.result.generatedAt || ''));
};
window.sttDeleteHistory = function(type, i){
  if(getCurrentRole() !== 'admin'){ toast('⛔ Restricted to admin.', true); return; }
  var m = ((window.db && window.db.specialTT) || {})[type];
  if(!m || !m.history || !m.history[i]) return;
  // reset memory by exactly this timetable's lessons (recounted from its
  // grid, so even pre-update records subtract correctly)
  var freed = sttGridCounts(m.history[i].grid);
  Object.keys(freed).forEach(function(t){
    m.counts[t] = Math.max(0, (m.counts[t] || 0) - freed[t]);
  });
  m.history.splice(i, 1);
  saveDB();
  sttRenderHistory();
  toast('🗑 Removed from history — lesson memory adjusted');
};

/* ── preview + summary ─────────────────────────────────────────────── */
function sttPeriodLabel(i){
  var p = (STT.result && STT.result.times[i]) || STT.times[i] || {};
  return 'P' + (i + 1) + '<br><span class="muted" style="font-size:9px">' +
    sttEsc(p.start || '') + '–' + sttEsc(p.end || '') + '</span>';
}
function sttRenderResult(){
  var box = document.getElementById('stt_results');
  if(!box) return;
  var r = STT.result;
  if(!r){ box.style.display = 'none'; return; }
  box.style.display = '';
  var perClass = r.classes.map(function(cls){
    var rows = r.days.map(function(d){
      var cells = r.times.map(function(p, i){
        if(p.breakAfter) return '<td class="stt-break">☕<br><span class="muted">break</span></td>';
        var c = r.grid[cls] && r.grid[cls][d] && r.grid[cls][d][i];
        return '<td>' + (c ? '<strong>' + sttEsc(c.subject) + '</strong><br><span class="muted">' + sttEsc(c.name) + '</span>' : '<span class="muted">—</span>') + '</td>';
      }).join('');
      return '<tr><td class="stt-day">' + sttEsc(d.slice(0, 3)) + '</td>' + cells + '</tr>';
    }).join('');
    var head = '<tr><th>Day</th>' + r.times.map(function(p, i){
      return '<th>' + sttPeriodLabel(i) + (p.breakAfter ? '<br><span class="stt-break-tag">+break</span>' : '') + '</th>';
    }).join('') + '</tr>';
    return '<div class="card" style="margin-bottom:14px"><div class="card-body">' +
      '<div class="stt-class-title">🏫 Class ' + sttEsc(cls) + '</div>' +
      '<div class="table-wrap"><table class="stt-grid"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div></div></div>';
  }).join('');
  var tot = Object.keys(r.counts).reduce(function(a, t){ return a + r.counts[t]; }, 0) || 1;
  var summary = Object.keys(r.counts).map(function(tid){
    return { name: sttTeacherName(tid), n: r.counts[tid] };
  }).sort(function(a, b){ return b.n - a.n || a.name.localeCompare(b.name); }).map(function(x){
    var pct = Math.round(x.n / tot * 100);
    return '<tr><td>' + sttEsc(x.name) + '</td><td style="text-align:center;font-weight:800">' + x.n + '</td>' +
      '<td><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></td></tr>';
  }).join('');
  document.getElementById('stt_preview').innerHTML =
    '<div class="stt-meta">Generated ' + sttEsc(r.generatedAt) +
    ' · Cycle #' + (r.cycles || 1) +
    (r.unfilled ? ' · <b style="color:var(--rose)">' + r.unfilled + ' unfilled slots</b>' : '') + '</div>' + perClass;
  var sumHtml = '<table class="stt-sum"><thead><tr><th>TEACHER</th><th>LESSONS</th><th>SHARE</th></tr></thead><tbody>' + summary + '</tbody></table>';
  document.getElementById('stt_summary').innerHTML = sumHtml;
  var ct = document.getElementById('stt_countsTable');
  if(ct) ct.innerHTML = sumHtml;
}

/* ── exports (printable Word / PDF / Excel) ────────────────────────── */
function sttDownload(blob, name){
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
}
function sttGradesLabel(r){
  var g = (r.grades && r.grades.length) ? r.grades.join(', ') : (r.grade || '');
  return ((r.grades && r.grades.length > 1) ? 'GRADES ' : 'GRADE ') + g;
}
function sttBase(){
  var r = STT.result;
  var g = ((r.grades && r.grades.length) ? r.grades.join('-') : (r.grade || '')).replace(/,/g, '-');
  return 'Special_Timetable_' + (r.type === 'saturday' ? 'Saturday' : 'Evening') +
    '_Grades' + g + '_' + r.days.length + 'days';
}
function sttExport(){
  if(!STT.result){ toast('Generate a timetable first.', true); return; }
  var fmt = document.getElementById('stt_format').value;
  var orient = document.getElementById('stt_orientation').value;
  if(fmt === 'pdf') sttExportPdf(orient);
  else if(fmt === 'word') sttExportWord(orient);
  else sttExportExcel(orient);
}
window.sttExport = sttExport;
function sttTitle(){
  var r = STT.result;
  return (r.type === 'saturday' ? 'SATURDAY TIMETABLE' : 'WEEKLY EVENING TIMETABLE') + ' — ' + sttGradesLabel(r);
}
function sttExportPdf(orient){
  var jsPDF = window._getJsPDF();
  var doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
  var r = STT.result;
  var y = pdfHeader(doc, sttTitle(), r.days.join(' · ') + '  ·  ' + sttGradesLabel(r) + ' streams: ' + r.classes.join(', '));
  // Saturday: ONE table — classes are rows, periods (+breaks) are columns.
  if(r.type === 'saturday'){
    var satDay = (r.days && r.days[0]) || 'Saturday';
    var headS = ['CLASS'].concat(r.times.map(function(p, i){
      return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || '') + (p.breakAfter ? ' +BRK' : '');
    }));
    var bodyS = r.classes.map(function(cls){
      return [cls].concat(r.times.map(function(p, i){
        if(p.breakAfter) return 'BREAK';
        var c = r.grid[cls] && r.grid[cls][satDay] && r.grid[cls][satDay][i];
        return c ? (c.subject + '\n' + c.name) : '—';
      }));
    });
    doc.autoTable({
      startY: y + 3, head: [headS], body: bodyS, theme: 'grid',
      headStyles: { fillColor: [11, 29, 58], textColor: [242, 199, 68], fontStyle: 'bold', fontSize: 7, halign: 'center' },
      styles: { fontSize: 7.5, cellPadding: 1.4, halign: 'center', lineColor: [70, 70, 70], lineWidth: 0.2 },
      margin: { left: 6, right: 6 },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
      didDrawPage: function(){ y = 14; }
    });
    if(doc.lastAutoTable) y = doc.lastAutoTable.finalY + 6; else y += 10;
    if(y > 250){ doc.addPage(); y = 14; }
    doc.autoTable({
      startY: y,
      head: [['TEACHER', 'LESSONS']],
      body: Object.keys(r.counts).map(function(t){
        return [sttTeacherName(t), String(r.counts[t])];
      }).sort(function(a, b){ return Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]); }),
      theme: 'striped',
      headStyles: { fillColor: [242, 199, 68], textColor: [11, 29, 58], fontStyle: 'bold', fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 1.3, halign: 'center' },
      columnStyles: { 0: { halign: 'left' } },
      margin: { left: 6, right: 6 }
    });
    doc.save(sttBase() + '.pdf');
    toast('📄 Special timetable PDF exported!');
    return;
  }
  // Evening: ONE table per day — the day forms the title, classes are rows
  // with the subjects (and teachers) taught that evening below it.
  r.days.forEach(function(d){
    if(y > 240){ doc.addPage(); y = 14; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(11, 29, 58);
    doc.text(String(d).toUpperCase(), 6, y + 1);
    var head = ['CLASS'].concat(r.times.map(function(p, i){
      return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || '') + (p.breakAfter ? ' +BRK' : '');
    }));
    var body = r.classes.map(function(cls){
      return [cls].concat(r.times.map(function(p, i){
        if(p.breakAfter) return 'BREAK';
        var c = r.grid[cls] && r.grid[cls][d] && r.grid[cls][d][i];
        return c ? (c.subject + '\n' + c.name) : '—';
      }));
    });
    doc.autoTable({
      startY: y + 5, head: [head], body: body, theme: 'grid',
      headStyles: { fillColor: [11, 29, 58], textColor: [242, 199, 68], fontStyle: 'bold', fontSize: 7, halign: 'center' },
      styles: { fontSize: 7.5, cellPadding: 1.4, halign: 'center', lineColor: [70, 70, 70], lineWidth: 0.2 },
      margin: { left: 6, right: 6 },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
      didDrawPage: function(){ y = 14; }
    });
    if(doc.lastAutoTable) y = doc.lastAutoTable.finalY + 8; else y += 10;
  });
  doc.autoTable({
    startY: y,
    head: [['TEACHER', 'LESSONS']],
    body: Object.keys(r.counts).map(function(t){
      return [sttTeacherName(t), String(r.counts[t])];
    }).sort(function(a, b){ return Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]); }),
    theme: 'striped',
    headStyles: { fillColor: [242, 199, 68], textColor: [11, 29, 58], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    styles: { fontSize: 8, cellPadding: 1.3, halign: 'center' },
    columnStyles: { 0: { halign: 'left' } },
    margin: { left: 6, right: 6 }
  });
  doc.save(sttBase() + '.pdf');
  toast('📄 Special timetable PDF exported!');
}
window.sttExportPdf = sttExportPdf;
async function sttExportWord(orient){
  if(!window.docx){ toast('❌ Word library not loaded.', true); return; }
  var D = window.docx;
  var land = orient === 'landscape';
  var r = STT.result;
  var borders = { top: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                  bottom: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                  left: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                  right: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                  insideHorizontal: { style: D.BorderStyle.SINGLE, size: 2, color: '999999' },
                  insideVertical: { style: D.BorderStyle.SINGLE, size: 2, color: '999999' } };
  function cell(text, opts){
    return new D.TableCell({
      shading: opts && opts.fill ? { fill: opts.fill } : undefined,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new D.Paragraph({ alignment: D.AlignmentType.CENTER,
        children: [new D.TextRun({ text: String(text), bold: !!(opts && opts.bold), size: (opts && opts.size) || 18 })] })]
    });
  }
  function hcell(text){ return cell(text, { fill: '0B1D3A', bold: true, size: 17 }); }
  var kids = [
    new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.TextRun({ text: 'SANTAPRIS ACADEMY', bold: true, size: 34 })] }),
    new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.TextRun({ text: sttTitle(), bold: true, size: 24 })] }),
    new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 220 },
      children: [new D.TextRun({ text: r.days.join(' · ') + '  ·  Streams: ' + r.classes.join(', '), size: 19 })] })
  ];
  // Saturday: ONE table — classes are rows, periods (+breaks) are columns.
  if(r.type === 'saturday'){
    var satDayW = (r.days && r.days[0]) || 'Saturday';
    var srows = [new D.TableRow({ tableHeader: true, children:
      ['CLASS'].concat(r.times.map(function(p, i){ return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || ''); }))
      .map(hcell) })];
    r.classes.forEach(function(cls){
      srows.push(new D.TableRow({ children: [cell(cls, { bold: true })].concat(r.times.map(function(p, i){
        if(p.breakAfter) return cell('BREAK');
        var c = r.grid[cls] && r.grid[cls][satDayW] && r.grid[cls][satDayW][i];
        return cell(c ? (c.subject + ' / ' + c.name) : '—');
      })) }));
    });
    kids.push(new D.Table({ rows: srows, width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: borders }));
  } else {
  // Evening: ONE table per day — the day forms the title, classes are rows
  // with the subjects (and teachers) taught that evening below it.
  r.days.forEach(function(d){
    kids.push(new D.Paragraph({ spacing: { before: 200, after: 80 },
      children: [new D.TextRun({ text: String(d).toUpperCase(), bold: true, size: 24 })] }));
    var rows = [new D.TableRow({ tableHeader: true, children:
      ['CLASS'].concat(r.times.map(function(p, i){ return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || ''); }))
      .map(hcell) })];
    r.classes.forEach(function(cls){
      rows.push(new D.TableRow({ children: [cell(cls, { bold: true })].concat(r.times.map(function(p, i){
        if(p.breakAfter) return cell('BREAK');
        var c = r.grid[cls] && r.grid[cls][d] && r.grid[cls][d][i];
        return cell(c ? (c.subject + ' / ' + c.name) : '—');
      })) }));
    });
    kids.push(new D.Table({ rows: rows, width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: borders }));
  });
  }
  var sumRows = [new D.TableRow({ tableHeader: true, children: ['TEACHER', 'LESSONS'].map(hcell) })];
  Object.keys(r.counts).map(function(t){ return [sttTeacherName(t), r.counts[t]]; })
    .sort(function(a, b){ return b[1] - a[1] || String(a[0]).localeCompare(String(b[0])); })
    .forEach(function(x){ sumRows.push(new D.TableRow({ children: [cell(x[0]), cell(String(x[1]), { bold: true })] })); });
  kids.push(new D.Paragraph({ spacing: { before: 260, after: 80 },
    children: [new D.TextRun({ text: 'LESSONS PER TEACHER', bold: true, size: 22 })] }));
  kids.push(new D.Table({ rows: sumRows, width: { size: 60, type: D.WidthType.PERCENTAGE }, borders: borders }));
  var docFile = new D.Document({ sections: [{ properties: { page: {
    size: { width: land ? 16838 : 11906, height: land ? 11906 : 16838 },
    margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: kids }] });
  var blob = await D.Packer.toBlob(docFile);
  sttDownload(blob, sttBase() + '.docx');
  toast('📝 Special timetable Word exported!');
}
window.sttExportWord = sttExportWord;
function sttExportExcel(orient){
  if(typeof ensureXLSX === 'function'){ ensureXLSX(function(){ sttBuildExcel(orient); }); }
  else sttBuildExcel(orient);
}
window.sttExportExcel = sttExportExcel;
/* Minimal handle for automated checks (scoring + grid recount). */
window.__sttApi = {
  score: function(c, counts, lc){ return sttScore(c, counts, lc); },
  gridCounts: function(grid){ return sttGridCounts(grid); }
};function sttBuildExcel(orient){
  var r = STT.result;
  var wb = XLSX.utils.book_new();
  // Saturday: ONE sheet — classes are rows, periods (+breaks) are columns.
  if(r.type === 'saturday'){
    var satDayX = (r.days && r.days[0]) || 'Saturday';
    var aoa = [
      ['SANTAPRIS ACADEMY'],
      [sttTitle()],
      [r.days.join(' · ') + '  ·  Streams: ' + r.classes.join(', ')],
      [],
      ['CLASS'].concat(r.times.map(function(p, i){ return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || ''); }))
    ];
    r.classes.forEach(function(cls){
      aoa.push([cls].concat(r.times.map(function(p, i){
        if(p.breakAfter) return 'BREAK';
        var c = r.grid[cls] && r.grid[cls][satDayX] && r.grid[cls][satDayX][i];
        return c ? (c.subject + ' / ' + c.name) : '';
      })));
    });
    aoa.push([], ['LESSONS PER TEACHER'], [], ['TEACHER', 'LESSONS']);
    Object.keys(r.counts).map(function(t){ return [sttTeacherName(t), r.counts[t]]; })
      .sort(function(a, b){ return b[1] - a[1] || String(a[0]).localeCompare(String(b[0])); })
      .forEach(function(x){ aoa.push(x); });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!pageSetup'] = { orientation: orient, paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, sttBase() + '.xlsx');
    toast('📊 Special timetable Excel exported!');
    return;
  }
  // Evening: ONE sheet per day — the day forms the title, classes are rows
  // with the subjects (and teachers) taught that evening below it.
  r.days.forEach(function(d){
    var aoa = [
      ['SANTAPRIS ACADEMY'],
      [sttTitle()],
      [d + '  ·  Streams: ' + r.classes.join(', ')],
      [],
      [String(d).toUpperCase()],
      ['CLASS'].concat(r.times.map(function(p, i){ return 'P' + (i + 1) + ' ' + (p.start || '') + '-' + (p.end || ''); }))
    ];
    r.classes.forEach(function(cls){
      aoa.push([cls].concat(r.times.map(function(p, i){
        if(p.breakAfter) return 'BREAK';
        var c = r.grid[cls] && r.grid[cls][d] && r.grid[cls][d][i];
        return c ? (c.subject + ' / ' + c.name) : '';
      })));
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!pageSetup'] = { orientation: orient, paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
    XLSX.utils.book_append_sheet(wb, ws, String(d).slice(0, 31));
  });
  var sum = [['LESSONS PER TEACHER'], [], ['TEACHER', 'LESSONS']].concat(
    Object.keys(r.counts).map(function(t){ return [sttTeacherName(t), r.counts[t]]; })
    .sort(function(a, b){ return b[1] - a[1] || String(a[0]).localeCompare(String(b[0])); }));
  var ws2 = XLSX.utils.aoa_to_sheet(sum);
  ws2['!pageSetup'] = { orientation: orient, paperSize: 9 };
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
  XLSX.writeFile(wb, sttBase() + '.xlsx');
  toast('📊 Special timetable Excel exported!');
}

})();
