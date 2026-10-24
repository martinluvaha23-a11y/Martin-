/* ═══════════════════════════════════════════════════════════════════
   SCORE ENTRY (Raw → Processed)
   - New capture flow: pick Grade → pick saved Exam → pick Subject.
     Clicking a subject lists every learner in the grade (A–Z) with a box
     per learner for the RAW mark; the converted (%) preview shows live.
   - Submitted marks are stored in db.rawScores, then converted (using the
     ⚖️ Conversion constants when set) into the processed db.exams record.
   - "Raw scores" view: all submitted raw marks, editable grid.
   - "Processed scores" view: converted marks, read-only display.
   - Admin AND teacher mode may capture; once a raw mark is saved its box
     locks for teachers (admins can still edit) — same rule as Enter Scores.
   ═══════════════════════════════════════════════════════════════════ */

var _seGrade = '', _seExamIdx = -1, _seMode = 'enter', _seSubject = null;
var _seExams = []; // [{examName, term, year}] for the selected grade

function _seIsAdmin(){ return (typeof getCurrentRole === 'function' && getCurrentRole() === 'admin'); }

/* Compound-subject helpers (ENG/KIS everywhere; SCIE only in grade 9). */
function _seSubsOf(s){
  if(s === 'ENG') return getEngSubs(_seGrade);
  if(s === 'KIS') return getKisSubs(_seGrade);
  if(s === 'SCIE' && typeof getScieSubs === 'function') return getScieSubs(_seGrade);
  return [];
}
function _seIsSplit(s){
  return s === 'ENG' || s === 'KIS' || ((s === 'SCIE') && _seSubsOf(s).length === 2);
}

function _seExam(){
  if(_seExamIdx < 0 || _seExamIdx >= _seExams.length) return null;
  return _seExams[_seExamIdx];
}

function initScoreEntry(){
  // Stateful: coming back to the page restores grade/exam/mode from the
  // dropdowns instead of resetting, so every button keeps responding.
  // (Re-selecting the same grade fires no change event, so a reset here
  // would strand the page with filled dropdowns and dead buttons.)
  const g = document.getElementById('se_grade');
  const prevGrade = (g && g.value) || _seGrade || '';
  if(g){
    g.innerHTML = '<option value="">-- Select Grade --</option>' +
      ALL_GRADES.map(function(x){ return '<option value="' + x + '">' + x + '</option>'; }).join('');
    g.value = prevGrade;
  }
  _seGrade = g ? g.value : '';
  _rebuildSeExams(true);
  renderScoreEntry();
}

/* Term rank for dropdown ordering: Term 3 first, then 2, then 1. */
function _seTermRank(term){
  const m = String(term || '').match(/(\d+)/);
  if(!m) return 99;
  return 100 - parseInt(m[1]); // Term 3 -> 97, Term 2 -> 98, Term 1 -> 99
}

function _seSortExams(){
  _seExams.sort(function(a, b){
    const r = _seTermRank(a.term) - _seTermRank(b.term);
    if(r) return r;
    const c = String(a.examName).localeCompare(String(b.examName));
    if(c) return c;
    return String(b.year).localeCompare(String(a.year));
  });
}

/* Rebuild the exam list for _seGrade. When restore is true, keep the
   previously chosen exam (matched by name+term+year). */
function _rebuildSeExams(restore){
  const ex = document.getElementById('se_exam');
  let prevKey = null;
  if(restore && ex && ex.value !== '' && !isNaN(parseInt(ex.value))){
    const prev = _seExams[parseInt(ex.value)];
    if(prev) prevKey = prev.examName + '|||' + prev.term + '|||' + prev.year;
  }
  _seExams = [];
  if(_seGrade){
    const seen = {};
    // 1) exams with submitted records in this grade
    (db.exams || []).forEach(function(e){
      if(e.grade !== _seGrade) return;
      const k = (e.examName || '') + '|||' + e.term + '|||' + e.year;
      if(!seen[k]){ seen[k] = true; _seExams.push({ examName: e.examName || 'Untitled Exam', term: e.term, year: e.year }); }
    });
    // 2) registry-defined names applying to this grade even with no scores
    // yet (e.g. created in Manage Exam Names) — same term/year as defined.
    if(typeof examRegistryAppliesTo === 'function'){
      (db.examRegistry || []).forEach(function(def){
        if(!def || !def.name) return;
        try{ if(!examRegistryAppliesTo(def, _seGrade)) return; }catch(err){ return; }
        const k = def.name + '|||' + def.term + '|||' + def.year;
        if(!seen[k]){ seen[k] = true; _seExams.push({ examName: def.name, term: def.term, year: def.year }); }
      });
    }
    _seSortExams();
  }
  _seExamIdx = -1;
  if(ex){
    ex.innerHTML = '<option value="">-- Select Exam --</option>' + _seExams.map(function(e2, i){
      return '<option value="' + i + '">' + e2.examName + ' — ' + e2.term + ' ' + e2.year + '</option>';
    }).join('');
    if(prevKey){
      for(let i = 0; i < _seExams.length; i++){
        if((_seExams[i].examName + '|||' + _seExams[i].term + '|||' + _seExams[i].year) === prevKey){
          _seExamIdx = i; ex.value = String(i); break;
        }
      }
    }
  }
}

/* ── Raw row helpers (shared with older entry flows) ───────────────── */
function upsertRawRow(o){
  if(!o || !o.admNo) return;
  if(!db.rawScores) db.rawScores = [];
  const rec = {
    admNo: o.admNo, name: o.name || '', grade: o.grade || '',
    examName: o.examName || 'Untitled Exam', examCode: o.examCode || '',
    term: o.term || '', year: (o.year === undefined ? '' : o.year),
    scores: o.scores || {}, rubrics: {}, subScores: o.subScores || {}, total: 0
  };
  let t = 0;
  Object.keys(rec.scores).forEach(function(s){ if(typeof rec.scores[s] === 'number') t += rec.scores[s]; });
  rec.total = t;
  db.rawScores = db.rawScores.filter(function(e){
    return !(e.admNo === rec.admNo && (e.examName || '') === rec.examName &&
             e.term === rec.term && e.year === rec.year);
  });
  db.rawScores.push(rec);
}

/* Merge freshly-typed raw values into the stored raw row (keeps the rest). */
function mergeRawRow(admNo, examName, term, year, student, grade, examCode, newScores, newSubs){
  const prev = (db.rawScores || []).find(function(e){
    return e.admNo === admNo && (e.examName || '') === (examName || '') &&
           e.term === term && e.year === year;
  });
  const base = prev ? { scores: Object.assign({}, prev.scores),
                        subScores: Object.assign({}, prev.subScores) } : { scores: {}, subScores: {} };
  Object.keys(newScores || {}).forEach(function(s){ base.scores[s] = newScores[s]; });
  Object.keys(newSubs || {}).forEach(function(s){ base.subScores[s] = newSubs[s]; });
  upsertRawRow({ admNo: admNo, name: student ? student.fullName : (prev ? prev.name : ''),
    grade: grade, examName: examName, examCode: examCode, term: term, year: year,
    scores: base.scores, subScores: base.subScores });
}

function _seFindRaw(admNo, ex){
  if(!ex) return null;
  return (db.rawScores || []).find(function(e){
    return e.admNo === admNo && (e.examName || '') === (ex.examName || '') &&
           e.term === ex.term && e.year === ex.year;
  }) || null;
}

function _seFindProcessed(admNo, ex){
  if(!ex) return null;
  return (db.exams || []).find(function(e){
    return e.admNo === admNo && (e.examName || '') === (ex.examName || '') &&
           e.term === ex.term && e.year === ex.year;
  }) || null;
}

/* Derive the processed record from a raw row (conversion when set).
   Split parents (ENG/KIS, grade-9 SCIE) are ALWAYS rebuilt from their
   components when components are present — the components are the source of
   truth, so a stale/typed parent can never survive next to them. */
function seDeriveProcessed(grade, examName, rawRow){
  const eff = { scores: Object.assign({}, (rawRow && rawRow.scores) || {}),
                subScores: Object.assign({}, (rawRow && rawRow.subScores) || {}),
                rubrics: {}, total: 0 };
  // Ensure parents from components (raw sum; converter rebuilds when active)
  [['ENG', getEngSubs(grade)], ['KIS', getKisSubs(grade)],
   ['SCIE', (typeof getScieSubs === 'function' ? getScieSubs(grade) : [])]].forEach(function(pair){
    const p = pair[0], subs = pair[1];
    if((eff.subScores[subs[0]] !== undefined || eff.subScores[subs[1]] !== undefined)){
      const a = eff.subScores[subs[0]], b = eff.subScores[subs[1]];
      eff.scores[p] = (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0);
    }
  });
  if(typeof convApplyToRecord === 'function') convApplyToRecord(grade, examName, eff);
  else if(typeof getRubric === 'function'){
    Object.keys(eff.scores).forEach(function(s){ eff.rubrics[s] = getRubric(eff.scores[s], grade, examName); });
    let t = 0;
    Object.keys(eff.scores).forEach(function(s){ if(typeof eff.scores[s] === 'number') t += eff.scores[s]; });
    eff.total = t;
  }
  return eff;
}

/* ── Setup ─────────────────────────────────────────────────────────── */
function seOnGrade(){
  const g = document.getElementById('se_grade');
  _seGrade = g ? g.value : '';
  _seSubject = null;
  _seFilter = '';
  _rebuildSeExams(false);
  renderScoreEntry();
}

function seOnExam(){
  const ex = document.getElementById('se_exam');
  _seExamIdx = ex ? parseInt(ex.value) : -1;
  if(isNaN(_seExamIdx)) _seExamIdx = -1;
  _seSubject = null;
  _seFilter = '';
  renderScoreEntry();
}

function seSetMode(m){
  _seMode = m;
  renderScoreEntry();
}

function sePickSubject(s){
  _seSubject = s;
  renderScoreEntry();
}

/* Open conversion constants pre-scoped to this Score Entry context. */
function openConvFromSE(){
  if(typeof openConvModal !== 'function') return toast('Conversion unavailable', true);
  try{
    var ex = (typeof _seExam === 'function') ? _seExam() : null;
    openConvModal();
    var lvl = (_seGrade || '').charAt(0);
    var gsel = document.getElementById('conv_grade');
    if(gsel && lvl && '456789'.indexOf(lvl) !== -1){
      gsel.value = lvl;
      if(typeof convGradeChanged === 'function') convGradeChanged();
    }
    if(ex && ex.examName){
      var custom = document.getElementById('conv_examCustom');
      if(custom && !custom.value) custom.value = ex.examName;
    }
    if(typeof renderConvForm === 'function') renderConvForm();
  }catch(e){ try{ openConvModal(); }catch(e2){} }
}

/* ── Render ────────────────────────────────────────────────────────── */
/* Letter filter: pressing letters (PC, outside the boxes) narrows the
   learner list to first names starting with them. Letters typed quickly
   accumulate (e.g. "b" then "r" → "Br"); pausing ~1s restarts the buffer.
   Applies to enter, raw and processed modes (all render + save through
   _seStudents). */
var _seFilter = '';
var _seFilterAt = 0;
var _seFilterGap = 900;   // ms — longer pause starts a fresh prefix
function seClearFilter(){
  if(!_seFilter) return;
  _seFilter = '';
  _seFilterAt = 0;
  if(typeof renderScoreEntry === 'function') renderScoreEntry();
}
function _seMatchFilter(fullName){
  if(!_seFilter) return true;
  var first = String(fullName || '').trim().split(/\s+/)[0] || '';
  return first.toLowerCase().slice(0, _seFilter.length) === _seFilter;
}
/* Touch keyboards follow focus: a text field summons alphabetical keys,
   number boxes summon numeric ones. The filter bar below is the alpha
   entry point on phones; score boxes stay numeric. */
function _seCoarse(){
  try{ return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); }
  catch(e){ return false; }
}
function seFocusFilter(){
  var fi = document.getElementById('se_filterInput');
  if(fi && fi.offsetParent !== null){ try{ fi.focus({ preventScroll: true }); }catch(e){ try{ fi.focus(); }catch(e2){} } }
}
function seRenderFilterBar(){
  var bar = document.getElementById('se_filterBar');
  if(!bar) return;
  var show = !!(_seGrade && (typeof _seExam === 'function') && _seExam());
  if(!show){ bar.innerHTML = ''; bar.style.display = 'none'; return; }
  bar.style.display = '';
  var n = _seStudents().length;
  var inp = document.getElementById('se_filterInput');
  if(inp && document.activeElement === inp){
    // typing: refresh the count only — rebuilding would drop focus/keyboard
    var c = document.getElementById('se_filterCount');
    if(c) c.textContent = n + ' shown';
    return;
  }
  bar.innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 10px">' +
    '<span style="font-size:14px">🔍</span>' +
    '<input id="se_filterInput" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
    'placeholder="Filter learners by first name…" aria-label="Filter learners by first name" ' +
    'style="flex:1;min-width:0;background:transparent;border:none;outline:none;font-size:14px" value="' + _seFilter.toUpperCase().replace(/"/g, '&quot;') + '">' +
    '<span id="se_filterCount" style="font-size:11px;color:var(--text-muted);white-space:nowrap">' + n + ' shown</span>' +
    '<button class="btn btn-ghost btn-sm" style="padding:2px 10px;flex-shrink:0" onclick="seClearFilter(true)" title="Clear filter">✕</button></div>';
  var el = document.getElementById('se_filterInput');
  if(el) el.addEventListener('input', function(){
    var v = (el.value || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
    if(v !== _seFilter){
      _seFilter = v;
      _seFilterAt = Date.now();
      if(typeof renderScoreEntry === 'function') renderScoreEntry();
    }
  });
}
function seClearFilter(refocus){
  if(!_seFilter && !refocus) return;
  _seFilter = '';
  _seFilterAt = 0;
  if(typeof renderScoreEntry === 'function') renderScoreEntry();
  if(refocus && _seCoarse()) seFocusFilter();
}
function _seStudents(){
  return (db.students || []).filter(function(s){ return s.grade === _seGrade; })
    .filter(function(s){ return _seMatchFilter(s.fullName); })
    .sort(function(a, b){ return (a.fullName || '').localeCompare(b.fullName || ''); });
}

function renderScoreEntry(){
  const setup = document.getElementById('se_setupCard');
  const grid = document.getElementById('se_gridWrap');
  const chips = document.getElementById('se_subjChips');
  const tabs = document.getElementById('se_modeTabs');
  if(!grid) return;
  // Tabs
  if(tabs){
    tabs.innerHTML = [['enter', '⌨️ Enter Scores'], ['raw', '📝 Raw Scores'], ['processed', '✅ Processed Scores']].map(function(t){
      const on = _seMode === t[0];
      return '<button class="btn btn-sm" onclick="seSetMode(\'' + t[0] + '\')" style="font-weight:700;' +
        (on ? 'background:rgba(30,86,200,0.25);border:1px solid rgba(30,86,200,0.5);color:var(--sky)' : 'background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted)') + '">' + t[1] + '</button>';
    }).join('');
  }
  if(!_seGrade || !_seExam()){
    if(chips) chips.style.display = 'none';
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📥</div><p>Select a grade and an exam above to begin.</p></div>';
    _seUpdateSaveBar(0);
    seRenderFilterBar();
    return;
  }
  const subjects = getSubjects(_seGrade);
  // Subject chips (enter mode picks one; other modes show all)
  if(chips){
    chips.style.display = '';
    chips.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">' +
      (_seMode === 'enter' ? '👆 Click a subject to capture its scores:' : '📚 Subjects:') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + subjects.map(function(s){
        const on = _seSubject === s;
        const click = _seMode === 'enter' ? ' onclick="sePickSubject(\'' + s + '\')"' : '';
        return '<div class="subj-chip' + (on ? ' active' : '') + '"' + click +
          ' style="' + (_seMode === 'enter' ? 'cursor:pointer' : 'cursor:default') + '">' + (on ? '✓ ' : '') + s + '</div>';
      }).join('') + '</div>';
  }
  if(_seMode === 'enter') seRenderEnter(grid);
  else if(_seMode === 'raw') seRenderRaw(grid, subjects);
  else seRenderProcessed(grid, subjects);
  seRenderFilterBar();
  // Phones: with nothing focused, land on the filter field so the
  // alphabetical keyboard is up and ready (score boxes stay numeric).
  try{
    var _ae = document.activeElement;
    var _nothing = !_ae || _ae === document.body;
    var _pg = document.getElementById('page-scoreEntry');
    if(_nothing && _seCoarse() && _pg && _pg.classList.contains('active') && _seStudents().length)
      seFocusFilter();
  }catch(e){}
}

function _seConvNote(grade, examName){
  const has = (typeof getConvCfg === 'function') && getConvCfg(grade, examName);
  return has
    ? '<span class="badge badge-blue" title="Conversion constants are set — entries are raw marks">⚖️ raw → %</span>'
    : '<span class="badge" title="No conversion constants — entries stored as-is">as-is</span>';
}

/* Enter mode: one subject column for every learner */
function seRenderEnter(grid){
  const ex = _seExam();
  if(!_seSubject){
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👆</div><p>Pick a subject above — every learner in Grade ' + _seGrade + ' will be listed with a score box.</p></div>';
    _seUpdateSaveBar(0);
    return;
  }
  const students = _seStudents();
  if(!students.length){
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍🎓</div><p>No students registered in Grade ' + _seGrade + '.</p></div>';
    _seUpdateSaveBar(0);
    return;
  }
  const s = _seSubject;
  const isParent = _seIsSplit(s);
  const subs = isParent ? _seSubsOf(s) : [s];
  const cols = isParent
    ? '<th>' + subs[0] + '</th><th>' + subs[1] + '</th><th>' + s + ' (= conv)</th>'
    : '<th>' + s + ' score</th>';
  const body = students.map(function(st, i){
    const raw = _seFindRaw(st.admNo, ex);
    const cells = subs.map(function(sub){
      const val = (raw && raw.subScores && raw.subScores[sub] !== undefined) ? raw.subScores[sub]
        : (raw && !isParent && raw.scores && raw.scores[sub] !== undefined) ? raw.scores[sub] : '';
      const locked = val !== '' && !_seIsAdmin();
      return '<td><div style="display:flex;align-items:center;gap:6px">' +
        '<input type="number" class="score-input-cell' + (val !== '' ? ' has-val' : '') + '" id="se_inp_' + st.admNo + '_' + sub + '" ' +
        'data-adm="' + st.admNo + '" data-sub="' + sub + '" min="0" value="' + val + '" placeholder="—"' +
        (locked ? ' readonly title="Saved — only an admin can change this score"' : '') +
        ' oninput="sePreviewConv(\'' + st.admNo + '\')">' +
        '<span id="se_prev_' + st.admNo + '_' + sub + '" style="font-size:10px;color:var(--sky);min-width:34px"></span>' +
        '</div></td>';
    }).join('');
    return '<tr><td class="student-row-num">' + (i + 1) + '</td>' +
      '<td class="student-name-cell">' + st.fullName + '</td>' +
      '<td class="student-adm-cell"><span class="adm-badge">' + st.admNo + '</span></td>' +
      cells +
      '<td><button class="btn btn-sm btn-primary" onclick="seSaveRow(\'' + st.admNo + '\')">Save</button></td></tr>';
  }).join('');
  grid.innerHTML =
    '<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<span style="font-weight:800;color:var(--sky)">' + s + '</span>' + _seConvNote(_seGrade, ex.examName) +
    ((_seIsAdmin() && _seIsSplit(s) && ['7','8','9'].indexOf(String(_seGrade).charAt(0)) !== -1) ?
      '<button class="btn btn-ghost btn-sm" style="font-size:10px" ' +
      'title="Swap ' + s + ' PP1 ⇄ PP2 values for every learner below (admin). Nothing is saved yet — review, then Save." ' +
      'onclick="seSwapPP(\'' + s + '\')">⇄ Swap PP1/PP2</button>' : '') +
    ((_seIsAdmin() && typeof openClearSubjectCol === 'function') ?
      '<button class="btn btn-ghost btn-sm" style="font-size:10px;color:var(--rose)" ' +
      'title="Clear submitted ' + s + ' scores for this exam + grade (admin)" ' +
      'onclick="openClearSubjectCol(this)" ' +
      'data-exam="' + String(ex.examName).replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" ' +
      'data-grade="' + _seGrade + '" data-term="' + ex.term + '" data-year="' + ex.year + '" data-sub="' + s + '">🧹 Clear submitted ' + s + '</button>' : '') +
    '<span style="font-size:11px;color:var(--text-muted)">' + ex.examName + ' · ' + ex.term + ' ' + ex.year + ' · ' + students.length + ' learners</span></div>' +
    '<div class="table-wrap"><table><thead><tr><th>#</th><th>Student Name</th><th>Adm No</th>' + cols + '<th></th></tr></thead>' +
    '<tbody>' + body + '</tbody></table></div>';
  students.forEach(function(st){ sePreviewConv(st.admNo); });
  _seUpdateSaveBar(students.length);
}

/* Live converted preview next to each box */
function sePreviewConv(admNo){
  const ex = _seExam();
  if(!ex || !_seSubject) return;
  const s = _seSubject;
  const isParent = _seIsSplit(s);
  const subs = isParent ? _seSubsOf(s) : [s];
  const cfg = (typeof getConvCfg === 'function') ? getConvCfg(_seGrade, ex.examName) : null;
  if(!cfg) return;
  subs.forEach(function(sub){
    const el = document.getElementById('se_inp_' + admNo + '_' + sub);
    const pv = document.getElementById('se_prev_' + admNo + '_' + sub);
    if(!el || !pv) return;
    if(el.value === '' || isNaN(el.value)){ pv.textContent = ''; return; }
    const raw = parseFloat(el.value);
    let cv = raw;
    if(typeof convConvertSub === 'function' && typeof convConvertSimple === 'function'){
      cv = isParent ? convConvertSub(_seGrade, cfg, s, sub, raw) : convConvertSimple(raw, cfg.simple && cfg.simple[sub] && cfg.simple[sub].max);
    }
    pv.textContent = (cv !== raw) ? ('→ ' + cv) : '';
  });
}

/* Raw mode: editable grid of submitted raw marks */
function seRenderRaw(grid, subjects){
  const ex = _seExam();
  const students = _seStudents();
  if(!students.length){
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👨‍🎓</div><p>No students registered in Grade ' + _seGrade + '.</p></div>';
    _seUpdateSaveBar(0);
    return;
  }
  const _seAdmin = _seIsAdmin();
  const _seCsBtn = function(subj, label){
    if(!_seAdmin || typeof openClearSubjectCol !== 'function') return '';
    return '<br><button class="btn btn-ghost btn-sm" style="font-size:9px;padding:1px 6px;color:var(--rose)" ' +
      'title="Clear submitted ' + label + ' scores for this exam + grade (admin)" ' +
      'onclick="openClearSubjectCol(this)" ' +
      'data-exam="' + String(ex.examName).replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" ' +
      'data-grade="' + _seGrade + '" data-term="' + ex.term + '" data-year="' + ex.year + '" data-sub="' + subj + '">🧹</button>';
  };
  const _seSwapBtn = function(subj){
    if(!_seAdmin || ['7','8','9'].indexOf(String(_seGrade).charAt(0)) === -1) return '';
    if(!_seIsSplit(subj)) return '';
    return '<br><button class="btn btn-ghost btn-sm" style="font-size:9px;padding:1px 6px" ' +
      'title="Swap ' + subj + ' PP1 ⇄ PP2 for every learner (admin). Nothing is saved yet — review, then Save." ' +
      'onclick="seSwapPP(\'' + subj + '\')">⇄</button>';
  };
  const head = '<tr><th>#</th><th>Student Name</th><th>Adm No</th>' +
    subjects.map(function(s){
      if(_seIsSplit(s)){
        const subs = _seSubsOf(s);
        return '<th>' + subs[0] + '</th><th>' + subs[1] + _seSwapBtn(s) + _seCsBtn(s, s + ' (parent + components)') + '</th>';
      }
      return '<th>' + s + _seCsBtn(s, s) + '</th>';
    }).join('') + '<th></th></tr>';
  const body = students.map(function(st, i){
    const raw = _seFindRaw(st.admNo, ex);
    const cells = subjects.map(function(s){
      if(_seIsSplit(s)){
        const subs = _seSubsOf(s);
        return subs.map(function(sub){
          const val = (raw && raw.subScores && raw.subScores[sub] !== undefined) ? raw.subScores[sub] : '';
          const locked = val !== '' && !_seIsAdmin();
          return '<td><input type="number" class="score-input-cell' + (val !== '' ? ' has-val' : '') + '" id="se_raw_' + st.admNo + '_' + sub + '" ' +
            'data-adm="' + st.admNo + '" data-sub="' + sub + '" min="0" value="' + val + '" placeholder="—"' +
            (locked ? ' readonly title="Saved — only an admin can change this score"' : '') + '></td>';
        }).join('');
      }
      const val = (raw && raw.scores && raw.scores[s] !== undefined) ? raw.scores[s] : '';
      const locked = val !== '' && !_seIsAdmin();
      return '<td><input type="number" class="score-input-cell' + (val !== '' ? ' has-val' : '') + '" id="se_raw_' + st.admNo + '_' + s + '" ' +
        'data-adm="' + st.admNo + '" data-sub="' + s + '" min="0" value="' + val + '" placeholder="—"' +
        (locked ? ' readonly title="Saved — only an admin can change this score"' : '') + '></td>';
    }).join('');
    return '<tr><td class="student-row-num">' + (i + 1) + '</td>' +
      '<td class="student-name-cell">' + st.fullName + '</td>' +
      '<td class="student-adm-cell"><span class="adm-badge">' + st.admNo + '</span></td>' +
      cells +
      '<td><button class="btn btn-sm btn-primary" onclick="seSaveRow(\'' + st.admNo + '\', true)">Save</button></td></tr>';
  }).join('');
  grid.innerHTML =
    '<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<span style="font-weight:800;color:var(--gold)">📝 Raw submitted marks</span>' + _seConvNote(_seGrade, ex.examName) +
    '<span style="font-size:11px;color:var(--text-muted)">' + ex.examName + ' · ' + ex.term + ' ' + ex.year + '</span></div>' +
    '<div class="table-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  _seUpdateSaveBar(students.length);
}

/* Processed mode: read-only converted display */
function seRenderProcessed(grid, subjects){
  const ex = _seExam();
  const recs = (db.exams || []).filter(function(e){
    return e.grade === _seGrade && (e.examName || '') === (ex.examName || '') && e.term === ex.term && e.year === ex.year;
  }).sort(function(a, b){ return b.total - a.total; });
  if(!recs.length){
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>No processed records yet for ' + ex.examName + ' (' + ex.term + ' ' + ex.year + '). Capture raw scores first.</p></div>';
    _seUpdateSaveBar(0);
    return;
  }
  const head = '<tr><th>Rank</th><th>Student Name</th><th>Adm No</th>' +
    subjects.map(function(s){ return '<th>' + s + '</th>'; }).join('') + '<th>Total</th></tr>';
  const body = recs.map(function(e, i){
    const cols = subjects.map(function(s){
      const sc = e.scores[s] !== undefined ? e.scores[s] : '—';
      return '<td style="font-family:JetBrains Mono,monospace;font-weight:600;font-size:12px;text-align:center">' + sc + '</td>';
    }).join('');
    return '<tr><td style="text-align:center;font-weight:800">' + (i + 1) + '</td>' +
      '<td style="font-weight:600">' + e.name + '</td>' +
      '<td class="student-adm-cell"><span class="adm-badge">' + e.admNo + '</span></td>' + cols +
      '<td style="font-weight:800;color:var(--gold);text-align:center">' + e.total + '</td></tr>';
  }).join('');
  grid.innerHTML =
    '<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<span style="font-weight:800;color:var(--emerald)">✅ Processed (converted) scores</span>' +
    '<span style="font-size:11px;color:var(--text-muted)">' + ex.examName + ' · ' + ex.term + ' ' + ex.year + ' · read-only</span>' +
    (_seIsAdmin() ? '<button class="btn btn-ghost btn-sm" style="font-size:10px;color:var(--gold);margin-left:auto" title="Rebuild processed scores from raw marks, applying current conversion constants" onclick="seRefreshProcessed()">🔄 Refresh from raw</button>' : '') +
    '</div>' +
    '<div class="table-wrap"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  _seUpdateSaveBar(0);
}

/* Refresh processed from raw (admin repair): every record is re-derived
   from its raw row with the CURRENT conversion constants, so processed
   always matches raw with full accuracy. Records without a raw row are
   left untouched. Dropped stale values are tombstoned (recapturable);
   restored values are staged as explicit re-add intent. */
function seRefreshProcessed(){
  if(!_seIsAdmin()) return toast('⛔ Admin only.', true);
  const ex = _seExam();
  if(!ex || !_seGrade) return toast('Select a grade and an exam first', true);
  const recs = (db.exams || []).filter(function(e){
    return e.grade === _seGrade && (e.examName || '') === (ex.examName || '') && e.term === ex.term && e.year === ex.year;
  });
  if(!recs.length) return toast('No processed records to refresh.', true);
  const plan = [];
  recs.forEach(function(e){
    const raw = _seFindRaw(e.admNo, ex);
    if(!raw) return;
    const eff = seDeriveProcessed(_seGrade, ex.examName, { scores: raw.scores, subScores: raw.subScores });
    if(typeof getRubric === 'function'){
      Object.keys(eff.scores).forEach(function(s){
        if(eff.rubrics[s] === undefined && typeof eff.scores[s] === 'number') eff.rubrics[s] = getRubric(eff.scores[s], _seGrade, ex.examName);
      });
    }
    const cur = e.scores || {};
    const dropped = Object.keys(cur).filter(function(s){ return eff.scores[s] === undefined; });
    const added = Object.keys(eff.scores).filter(function(s){ return cur[s] === undefined; });
    const sameSubs = JSON.stringify(e.subScores || {}) === JSON.stringify(eff.subScores || {});
    if(!dropped.length && !added.length && sameSubs &&
       Object.keys(eff.scores).every(function(s){ return cur[s] === eff.scores[s]; })) return;
    plan.push({ e: e, raw: raw, eff: eff, dropped: dropped, added: added });
  });
  if(!plan.length) return toast('✅ Processed already matches raw — nothing to refresh.');
  if(!confirm('Rebuild processed from raw marks?\n\n' + ex.examName + ' · Grade ' + _seGrade + ' · ' + plan.length +
    ' record(s) will change (current conversion constants applied).\nDropped stale values are tombstoned and can be recaptured.\n\nContinue?')) return;
  plan.forEach(function(p){
    p.e.scores = p.eff.scores;
    p.e.rubrics = p.eff.rubrics || {};
    p.e.subScores = p.eff.subScores;
    let t = 0;
    Object.keys(p.e.scores).forEach(function(s){ if(typeof p.e.scores[s] === 'number') t += p.e.scores[s]; });
    p.e.total = t;
    // Align the raw row's parent display with the rule (components are truth).
    [['ENG', 'ENG'], ['KIS', 'KIS'], ['SCIE', 'SCIE']].forEach(function(pair){
      const par = pair[0];
      const subs = par === 'ENG' ? getEngSubs(_seGrade) : (par === 'KIS' ? getKisSubs(_seGrade) : getScieSubs(_seGrade));
      if(subs && subs.length === 2 && p.eff.scores[par] !== undefined &&
         (p.raw.subScores[subs[0]] !== undefined || p.raw.subScores[subs[1]] !== undefined)){
        p.raw.scores[par] = p.eff.scores[par];
      }
    });
    let rt = 0;
    Object.keys(p.raw.scores || {}).forEach(function(s){ if(typeof p.raw.scores[s] === 'number') rt += p.raw.scores[s]; });
    p.raw.total = rt;
    if(p.dropped.length) _removeExamSubjectsRemote(p.e.admNo, ex.examName, ex.term, ex.year, p.dropped);
    if(p.added.length && typeof _stageForceSubjects === 'function'){
      const fm = {};
      fm[_ssExamKey(p.e.admNo, ex.examName, ex.term, ex.year)] = p.added;
      _stageForceSubjects(fm);
    }
  });
  if(typeof recalcRanks === 'function') recalcRanks();
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  renderScoreEntry();
  toast('🔄 Refreshed ' + plan.length + ' record(s) from raw marks.');
}

function _seUpdateSaveBar(n){
  const bar = document.getElementById('se_saveBar');
  if(!bar) return;
  if(_seMode === 'processed' || n === 0){ bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  document.getElementById('se_saveBarLabel').textContent =
    _seMode === 'enter' ? 'Save every learner below at once' : 'Save all edited raw marks at once';
}

/* Swap a split subject's two paper columns (PP1 ⇄ PP2) for every learner
   on screen — fixes interchanged papers without deleting or re-typing.
   Grades 7–9 only, admin only. Values swap in the boxes (nothing is saved
   yet); review, then Save as usual. Locked/saved boxes swap too for admins;
   teachers never see this button. */
function seSwapPP(parent){
  if(!_seIsAdmin()) return toast('⛔ Admin only.', true);
  var ex = _seExam();
  if(!ex || !_seGrade) return toast('Select a grade and an exam first', true);
  if(['7', '8', '9'].indexOf(String(_seGrade).charAt(0)) === -1)
    return toast('Paper swap applies to grades 7–9.', true);
  var subs = (typeof _seSubsOf === 'function') ? _seSubsOf(parent) : [];
  if(!subs || subs.length !== 2) return toast('Swap needs a two-paper subject.', true);
  var pfx = (_seMode === 'raw') ? 'se_raw_' : 'se_inp_';
  var n = 0;
  _seStudents().forEach(function(st){
    var a = document.getElementById(pfx + st.admNo + '_' + subs[0]);
    var b = document.getElementById(pfx + st.admNo + '_' + subs[1]);
    if(!a || !b) return;
    var tmp = a.value; a.value = b.value; b.value = tmp;
    [a, b].forEach(function(el){
      try{ el.classList.toggle('has-val', el.value !== ''); }catch(e){}
    });
    if(_seMode !== 'raw' && typeof sePreviewConv === 'function') sePreviewConv(st.admNo);
    if(a.value !== '' || b.value !== '') n++;
  });
  toast('⇄ Swapped ' + parent + ' papers (' + n + ' learner(s)) — review, then Save.');
}

/* ── Save ──────────────────────────────────────────────────────────── */
function _seReadStudent(admNo, allSubjects){
  const ex = _seExam();
  const scope = allSubjects ? getSubjects(_seGrade) : [_seSubject];
  const rawScores = {}, rawSubs = {};
  let hasAny = false;
  scope.forEach(function(s){
    if(!s) return;
    if(_seIsSplit(s)){
      const subs = _seSubsOf(s);
      subs.forEach(function(sub){
        const el = document.getElementById((allSubjects ? 'se_raw_' : 'se_inp_') + admNo + '_' + sub);
        if(el && el.value !== '' && !isNaN(el.value)){
          rawSubs[sub] = parseFloat(el.value);
          hasAny = true;
        } else if(el && el.value === ''){
          rawSubs[sub] = null; // cleared marker
        }
      });
    } else {
      const el = document.getElementById((allSubjects ? 'se_raw_' : 'se_inp_') + admNo + '_' + s);
      if(el && el.value !== '' && !isNaN(el.value)){
        rawScores[s] = parseFloat(el.value);
        hasAny = true;
      } else if(el && el.value === ''){
        rawScores[s] = null; // cleared marker
      }
    }
  });
  return { rawScores: rawScores, rawSubs: rawSubs, hasAny: hasAny };
}

function seSaveRow(admNo, allSubjects, quiet){
  const ex = _seExam();
  if(!ex) return toast('Select an exam first', true);
  const st = (db.students || []).find(function(s){ return s.admNo === admNo; });
  if(!st) return toast('Student not found', true);
  const read = _seReadStudent(admNo, !!allSubjects);
  // Teacher lock: saved raw boxes are readonly in the DOM, but double-check —
  // a cleared saved box is only honoured for admins.
  const prevRaw = _seFindRaw(admNo, ex);
  const admin = _seIsAdmin();
  const scopeScores = {}, scopeSubs = {};
  Object.keys(read.rawScores).forEach(function(s){
    const v = read.rawScores[s];
    const was = prevRaw && prevRaw.scores && prevRaw.scores[s] !== undefined;
    if(v === null){ if(admin && was) scopeScores[s] = null; return; }
    scopeScores[s] = v;
  });
  Object.keys(read.rawSubs).forEach(function(s){
    const v = read.rawSubs[s];
    const was = prevRaw && prevRaw.subScores && prevRaw.subScores[s] !== undefined;
    if(v === null){ if(admin && was) scopeSubs[s] = null; return; }
    scopeSubs[s] = v;
  });
  if(!Object.keys(scopeScores).length && !Object.keys(scopeSubs).length)
    return toast('No scores entered for ' + st.fullName, true);

  // Merge into raw row (admin clear => delete key)
  const base = prevRaw
    ? { scores: Object.assign({}, prevRaw.scores), subScores: Object.assign({}, prevRaw.subScores) }
    : { scores: {}, subScores: {} };
  Object.keys(scopeScores).forEach(function(s){
    if(scopeScores[s] === null) delete base.scores[s]; else base.scores[s] = scopeScores[s];
  });
  Object.keys(scopeSubs).forEach(function(s){
    if(scopeSubs[s] === null) delete base.subScores[s]; else base.subScores[s] = scopeSubs[s];
  });
  upsertRawRow({ admNo: admNo, name: st.fullName, grade: _seGrade, examName: ex.examName,
    examCode: (typeof examCode === 'function' ? examCode(ex.examName, ex.term, ex.year) : ''),
    term: ex.term, year: ex.year, scores: base.scores, subScores: base.subScores });

  // Derive processed from the FULL raw row, merge into exams record
  const derived = seDeriveProcessed(_seGrade, ex.examName,
    { scores: base.scores, subScores: base.subScores });
  const prevProc = _seFindProcessed(admNo, ex);
  const key = _ssExamKey(admNo, ex.examName, ex.term, ex.year);
  const removed = [], forced = [];
  if(prevProc && prevProc.scores){
    Object.keys(prevProc.scores).forEach(function(s){
      if(derived.scores[s] === undefined) removed.push(s);
    });
    Object.keys(derived.scores).forEach(function(s){
      if(prevProc.scores[s] === undefined) forced.push(s);
    });
  }
  // Only tombstone subjects whose box exists and is empty on screen
  const realRemoved = removed.filter(function(s){
    if(_seIsSplit(s)){
      const subs = _seSubsOf(s);
      const pfx = allSubjects ? 'se_raw_' : 'se_inp_';
      return subs.every(function(sub){
        const el = document.getElementById(pfx + admNo + '_' + sub);
        return el && el.value === '';
      });
    }
    const el = document.getElementById((allSubjects ? 'se_raw_' : 'se_inp_') + admNo + '_' + s);
    return el && el.value === '';
  });
  if(!admin && realRemoved.length) return toast('⛔ Teacher mode: saved scores cannot be removed.', true);
  // Carry processed-only subjects the raw row never had (older captures):
  // replacing the record with the raw-derived one would erase them
  // server-side on push. Only boxes genuinely cleared on screen stay removed.
  if(prevProc && prevProc.scores){
    Object.keys(prevProc.scores).forEach(function(s){
      if(derived.scores[s] === undefined && realRemoved.indexOf(s) < 0){
        derived.scores[s] = prevProc.scores[s];
        if(prevProc.rubrics && prevProc.rubrics[s] !== undefined) derived.rubrics[s] = prevProc.rubrics[s];
        else if(typeof getRubric === 'function' && typeof prevProc.scores[s] === 'number')
          derived.rubrics[s] = getRubric(prevProc.scores[s], _seGrade, ex.examName);
      }
    });
    var _rmSubs = {};
    realRemoved.forEach(function(s){ (_seIsSplit(s) ? _seSubsOf(s) : []).forEach(function(c){ _rmSubs[c] = 1; }); });
    Object.keys(prevProc.subScores || {}).forEach(function(c){
      if(derived.subScores[c] === undefined && !_rmSubs[c]) derived.subScores[c] = prevProc.subScores[c];
    });
    var _t = 0;
    Object.keys(derived.scores).forEach(function(s){ if(typeof derived.scores[s] === 'number') _t += derived.scores[s]; });
    derived.total = _t;
  }
  if(realRemoved.length) _removeExamSubjectsRemote(admNo, ex.examName, ex.term, ex.year, realRemoved);
  if(forced.length){
    const fm = {};
    fm[key] = forced;
    _stageForceSubjects(fm);
  }
  db.exams = (db.exams || []).filter(function(e){
    return !(e.admNo === admNo && (e.examName || '') === (ex.examName || '') && e.term === ex.term && e.year === ex.year);
  });
  db.exams.push({ admNo: admNo, name: st.fullName, grade: _seGrade, term: ex.term, year: ex.year,
    examName: ex.examName, examCode: (typeof examCode === 'function' ? examCode(ex.examName, ex.term, ex.year) : ''),
    scores: derived.scores, rubrics: derived.rubrics || {}, subScores: derived.subScores, total: derived.total });
  if(typeof recalcRanks === 'function') recalcRanks();
  if(!quiet){
    if(typeof saveDB === 'function') saveDB();
    if(typeof updateCounts === 'function') updateCounts();
    renderScoreEntry();
    // Phones: saving from a numeric box should hand the alphabetical
    // keyboard straight back for the next learner.
    if(_seCoarse()) seFocusFilter();
    toast('✅ Saved ' + st.fullName + ' (raw → processed)');
  }
  return true;
}

function seSaveAll(){
  const ex = _seExam();
  if(!ex) return toast('Select an exam first', true);
  const allSubjects = (_seMode === 'raw');
  if(_seMode === 'enter' && !_seSubject) return toast('Pick a subject first', true);
  let n = 0;
  _seStudents().forEach(function(st){
    const read = _seReadStudent(st.admNo, allSubjects);
    if(read.hasAny && seSaveRow(st.admNo, allSubjects, true)) n++;
  });
  if(!n) return toast('No scores entered — nothing saved', true);
  if(typeof recalcRanks === 'function') recalcRanks();
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  renderScoreEntry();
  if(_seCoarse()) seFocusFilter();
  toast('✅ Saved ' + n + ' learner' + (n !== 1 ? 's' : '') + ' (raw → processed)');
}

/* ── Keyboard flow ───────────────────────────────────────────────────
   Up/Down arrows move between learners in the same column (PC);
   Enter / Space — the phone keyboard's Next/Go — moves down one learner.
   Locked (readonly) boxes are skipped. One delegated listener covers all
   re-renders. */
(function(){
  if(window._seNavBound) return;
  window._seNavBound = true;
  document.addEventListener('keydown', function(e){
    const t = e.target;
    if(!t || !t.matches || !t.matches('#se_gridWrap input[type="number"]')) return;
    const table = t.closest ? t.closest('table') : null;
    if(!table) return;
    let dir = 0;
    if(e.key === 'ArrowDown') dir = 1;
    else if(e.key === 'ArrowUp') dir = -1;
    else if(e.key === 'Enter' || e.key === ' ') dir = 1;
    else return;
    e.preventDefault();
    const sub = (t.getAttribute('data-sub') || '').replace(/"/g, '');
    const list = Array.prototype.filter.call(
      table.querySelectorAll('input[type="number"][data-sub="' + sub + '"]'),
      function(el){ return !el.readOnly && !el.disabled && el.offsetParent !== null; });
    const i = list.indexOf(t);
    const nxt = list[i + dir];
    if(nxt){
      nxt.focus();
      if(nxt.scrollIntoView) nxt.scrollIntoView({ block: 'nearest' });
    }
  });
})();

/* ── Letter filter (PC) ────────────────────────────────────────────
   With focus outside the score boxes, pressing a letter narrows the learner
   list (enter + raw + processed) to first names starting with it — same
   subjects and boxes, just fewer rows. Backspace (outside boxes) or the ✕
   chip clears. Never fires while typing in a box. */
(function(){
  if(window._seLetterBound) return;
  window._seLetterBound = true;
  document.addEventListener('keydown', function(e){
    if(!e || !e.key) return;
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if(e.target && e.target.isContentEditable) return;
    var grid = document.getElementById('se_gridWrap');
    if(!grid || grid.offsetParent === null) return;
    if(e.key === 'Backspace'){
      if(typeof _seFilter !== 'undefined' && _seFilter){
        e.preventDefault();
        _seFilter = _seFilter.slice(0, -1);   // delete one letter; empty clears
        if(typeof renderScoreEntry === 'function') renderScoreEntry();
      }
      return;
    }
    if(e.key.length !== 1) return;
    var ch = e.key.toLowerCase();
    if(ch < 'a' || ch > 'z') return;
    var now = Date.now();
    var buf = (typeof _seFilter === 'string' ? _seFilter : '');
    if(!buf || now - _seFilterAt > _seFilterGap) buf = ch;   // pause restarts
    else if(buf.length < 12) buf = buf + ch;                 // keep typing narrows
    if(buf === _seFilter) return;   // unchanged (e.g. repeat key)
    _seFilter = buf;
    _seFilterAt = now;
    if(typeof renderScoreEntry === 'function') renderScoreEntry();
  });
})();
