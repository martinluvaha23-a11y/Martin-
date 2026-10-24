/* ═══════════════════════════════════════════════════════════════════
   SCORE CONVERSION CONSTANTS — raw marks → % out of 100 at Save time
   - Constants are per GRADE LEVEL (4-9, each covers all its streams) +
     EXAM NAME, because different exams/grades are marked out of different
     totals (e.g. MATHS out of 45; COMP out of 20 with GRA scaled to 80).
   - No constants  ⇒  scores are treated as already-converted (today's
     behaviour, byte-for-byte). Already-stored records are never touched:
     conversion only transforms freshly-entered values during a save.
   - Converted totals are rounded to whole numbers and capped at 100.
   - Applies at Save in Enter Scores (class grid + individual entry) and in
     Excel / image imports (fresh file values only).
   ═══════════════════════════════════════════════════════════════════ */

/* cfg shape in db.conversion["<level>|<examName>"] or ["<stream>|<examName>"]:
   { simple: {MATHS:{max:45}, ...},
     eng: {a:<pp1Max>, b:<pp2Max>}, kis: {a:<pp1Max>, b:<pp2Max>},
     scie: {a:<pp1Max>, b:<pp2Max>} (grade 9 only) }
   ENG/KIS (all grades): PP2 added raw out of bMax, PP1 scaled to (100-bMax)
   — PP1/PP2 behave exactly like GRA/COMP and LUG/INS.
   Grade-9 SCIE papers: each paper scaled to 50, then summed. */

function convLevel(grade){ return (grade || '').charAt(0); }
function convKey(level, examName){ return (level || '') + '|' + (examName || ''); }

function getConvCfg(grade, examName){
  if(!grade || !examName) return null;
  const all = (typeof db !== 'undefined' && db && db.conversion) || null;
  if(!all || typeof all !== 'object') return null;
  // Specific stream first (e.g. "4N|KNAT EXAM"), then whole grade ("4|KNAT EXAM").
  const skey = grade + '|' + examName;
  if(all[skey] && typeof all[skey] === 'object') return all[skey];
  const gkey = convKey(convLevel(grade), examName);
  const cfg = all[gkey];
  return (cfg && typeof cfg === 'object') ? cfg : null;
}

function _convNum(v){
  const n = parseFloat(v);
  return (isFinite(n) && n > 0) ? n : 0;
}

/* Scale raw (out of max) to target. Returns raw EXACTLY (unrounded) when
   max is blank or equals target — i.e. zero behaviour change. */
function convScale(raw, max, target){
  const m = _convNum(max);
  if(!(m > 0) || m === target) return raw;
  return Math.min(target, Math.round(raw / m * target));
}

function convConvertSimple(raw, max){
  if(raw === null || raw === undefined) return raw;
  return convScale(raw, max, 100);
}

/* Parent plan for ENG/KIS/SCIE: null = no conversion (passthrough).
   ENG/KIS (all grades): component B (COMP/INS/PP2) is added raw out of bMax;
   component A (GRA/LUG/PP1) is scaled to (100 - bMax) — PP1/PP2 behave exactly
   like GRA/COMP and LUG/INS.
   Grade-9 SCIE papers: each paper scaled to 50. */
function convParentPlan(grade, cfg, parent){
  if(!cfg) return null;
  const key = parent === 'ENG' ? 'eng' : (parent === 'KIS' ? 'kis' : 'scie');
  const c = cfg[key];
  if(!c) return null;
  const subs = parent === 'ENG' ? getEngSubs(grade)
    : (parent === 'KIS' ? getKisSubs(grade) : getScieSubs(grade));
  if(!subs || !subs.length) return null;
  let max0, max1, t0, t1;
  if(parent === 'SCIE'){
    max0 = _convNum(c.a) || 50; max1 = _convNum(c.b) || 50; t0 = 50; t1 = 50;
    if(max0 === 50 && max1 === 50) return null;
  } else {
    const cb = _convNum(c.b);
    if(!(cb > 0) || cb >= 100) return null;      // B defines the split
    max1 = cb; t1 = cb;                            // B added raw
    max0 = _convNum(c.a) || (100 - cb); t0 = 100 - cb; // A scaled to rest
  }
  return { subs: subs, max0: max0, max1: max1, t0: t0, t1: t1 };
}

function convConvertSub(grade, cfg, parent, sub, raw){
  if(raw === null || raw === undefined) return raw;
  const plan = convParentPlan(grade, cfg, parent);
  if(!plan) return raw;
  const i = (plan.subs[0] === sub) ? 0 : 1;
  return convScale(raw, i ? plan.max1 : plan.max0, i ? plan.t1 : plan.t0);
}

function convParentTotal(c0, c1){
  if(c0 === null && c1 === null) return null;
  return Math.min(100, Math.round((c0 || 0) + (c1 || 0)));
}

/* Wholesale converter for IMPORT flows (Excel / image), where every value
   is fresh from the file. Converts simple subjects + sub-components in
   place, rebuilds parents and total. Records WITHOUT sub-components keep a
   direct ENG/KIS total untouched. Never call on already-stored records. */
function convApplyToRecord(grade, examName, rec){
  if(!rec || typeof getConvCfg !== 'function') return rec;
  const cfg = getConvCfg(grade, examName);
  const scores = rec.scores || {}, rubrics = rec.rubrics || {};
  // The standing rule, with or without constants: a split parent stored
  // alongside its components equals their sum — never a stale or
  // independently typed value. Direct (component-less) parents pass through.
  const _subsOf = function(p){
    return p === 'ENG' ? getEngSubs(grade)
      : (p === 'KIS' ? getKisSubs(grade)
        : ((typeof getScieSubs === 'function' ? getScieSubs(grade) : []) || []));
  };
  const _enforceSum = function(){
    ['ENG', 'KIS', 'SCIE'].forEach(function(p){
      const ps = _subsOf(p);
      if(!ps || ps.length !== 2) return;
      const q0 = (rec.subScores || {})[ps[0]], q1 = (rec.subScores || {})[ps[1]];
      if(typeof q0 === 'number' || typeof q1 === 'number'){
        const s = Math.min(100, Math.round((typeof q0 === 'number' ? q0 : 0) + (typeof q1 === 'number' ? q1 : 0)));
        scores[p] = s;
        if(typeof getRubric === 'function') rubrics[p] = getRubric(s, grade, examName);
      }
    });
  };
  _enforceSum();
  if(!cfg){
    let t = 0;
    Object.keys(scores).forEach(function(s){ if(typeof scores[s] === 'number') t += scores[s]; });
    rec.total = t;
    return rec;
  }
  if(typeof convConvertSimple === 'function'){
    Object.keys(scores).forEach(function(s){
      if(s === 'ENG' || s === 'KIS') return;
      const v = scores[s];
      if(typeof v !== 'number') return;
      const nv = convConvertSimple(v, cfg.simple && cfg.simple[s] && cfg.simple[s].max);
      if(nv !== v) scores[s] = nv;
      // Rubric always (re)computed from the stored value — unconverted
      // subjects must still display their rubric in results views.
      if(typeof getRubric === 'function') rubrics[s] = getRubric(scores[s], grade, examName);
    });
  }
  if(typeof convParentPlan === 'function' && typeof convParentTotal === 'function' && typeof convScale === 'function'){
    ['ENG', 'KIS', 'SCIE'].forEach(function(p){
      const plan = convParentPlan(grade, cfg, p);
      if(!plan) return;
      const subs = rec.subScores || {};
      const has0 = subs[plan.subs[0]] !== undefined, has1 = subs[plan.subs[1]] !== undefined;
      if(!has0 && !has1) return; // direct parent total — leave as-is
      const r0 = subs[plan.subs[0]], r1 = subs[plan.subs[1]];
      const n0 = (has0 && typeof r0 === 'number') ? convScale(r0, plan.max0, plan.t0) : r0;
      const n1 = (has1 && typeof r1 === 'number') ? convScale(r1, plan.max1, plan.t1) : r1;
      if(rec.subScores){
        if(has0) rec.subScores[plan.subs[0]] = n0;
        if(has1) rec.subScores[plan.subs[1]] = n1;
        if((p === 'ENG' || p === 'KIS') && ['7', '8', '9'].includes((grade || '').charAt(0))){
          const leg = p === 'ENG' ? ['GRA', 'COMP'] : ['LUG', 'INS'];
          if(has0) rec.subScores[leg[0]] = n0;
          if(has1) rec.subScores[leg[1]] = n1;
        }
      }
      const tot = convParentTotal(typeof n0 === 'number' ? n0 : null, typeof n1 === 'number' ? n1 : null);
      if(tot === null){ delete scores[p]; delete rubrics[p]; }
      else { scores[p] = tot; if(typeof getRubric === 'function') rubrics[p] = getRubric(tot, grade, examName); }
    });
  }
  let t = 0;
  Object.keys(scores).forEach(function(s){ if(typeof scores[s] === 'number') t += scores[s]; });
  rec.total = t;
  return rec;
}

/* ── Modal ─────────────────────────────────────────────────────────── */
function _convExamOptions(){
  const names = new Set();
  (db.exams || []).forEach(e => { if(e.examName) names.add(e.examName); });
  (db.examRegistry || []).forEach(r => {
    const n = (typeof r === 'string') ? r : (r && r.name);
    if(n) names.add(n);
  });
  return [...names].sort();
}

function openConvModal(){
  let ov = document.getElementById('convOverlay');
  if(!ov){
    ov = document.createElement('div');
    ov.id = 'convOverlay';
    ov.setAttribute('onclick', 'if(event.target===this)closeConvModal()');
    ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:9150;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);align-items:center;justify-content:center';
    ov.innerHTML =
      '<div style="background:var(--surface);border-radius:16px;padding:24px 22px;max-width:640px;width:94%;border:1px solid var(--border);box-shadow:0 24px 72px rgba(0,0,0,0.5);max-height:92vh;overflow-y:auto">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:4px">' +
      '<div style="font-size:17px;font-weight:800;color:var(--sky)">⚖️ Score Conversion Constants</div>' +
      '<button class="btn btn-sm btn-ghost" onclick="closeConvModal()" title="Close" style="min-width:32px;flex-shrink:0">✕</button></div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:18px">Raw marks are converted to % out of 100 when you press <strong>Save</strong> during score entry. Apply to a <strong>whole grade</strong> or one <strong>stream</strong> (stream wins where both exist). Leave a field blank = that subject is already out of 100. Stored records are never re-converted.</div>' +
      '<div class="form-grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-bottom:6px">' +
      '<div class="form-group" style="margin:0"><label>Grade</label>' +
      '<select id="conv_grade" onchange="convGradeChanged()" style="width:100%">' +
      '<option value="">-- Select grade --</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option>' +
      '</select></div>' +
      '<div class="form-group" style="margin:0"><label>Applies to</label>' +
      '<select id="conv_scope" onchange="renderConvForm()" style="width:100%">' +
      '<option value="grade">Whole grade (all streams)</option>' +
      '<option value="stream">Specific stream only</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="form-group" id="conv_streamWrap" style="display:none;margin-bottom:6px"><label>Stream</label>' +
      '<select id="conv_stream" onchange="renderConvForm()" style="width:100%"></select></div>' +
      '<div class="form-group" style="margin:6px 0"><label>Exam name</label>' +
      '<select id="conv_exam" onchange="renderConvForm()" style="width:100%"></select></div>' +
      '<div class="form-group" style="margin-bottom:16px"><label>…or type a new exam name <span style="color:var(--text-muted);font-weight:400;font-size:11px">(overrides the dropdown)</span></label>' +
      '<input type="text" id="conv_examCustom" placeholder="e.g. KNAT EXAM" oninput="renderConvForm()" style="width:100%;font-weight:700;color:var(--gold)"></div>' +
      '<div id="conv_subjectRows" style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px"></div>' +
      '<div id="conv_hint" style="font-size:12px;color:var(--text-muted);background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;margin-bottom:16px;line-height:1.6"></div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button class="btn btn-ghost btn-sm" onclick="closeConvModal()">Cancel</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="clearConvConstants()" style="color:var(--rose)">🗑 Clear constants</button>' +
      '<button class="btn btn-primary btn-sm" onclick="saveConvConstants()">💾 Save constants</button>' +
      '</div></div>';
    document.body.appendChild(ov);
  }
  const sel = document.getElementById('conv_exam');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Select exam --</option>' +
    _convExamOptions().map(n => '<option value="' + n.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">' + n + '</option>').join('');
  if(cur) sel.value = cur;
  document.body.appendChild(ov);
  ov.style.display = 'flex';
  renderConvForm();
}

function closeConvModal(){
  const ov = document.getElementById('convOverlay');
  if(ov) ov.style.display = 'none';
}

function _convSelExam(){
  const custom = (document.getElementById('conv_examCustom').value || '').trim();
  if(custom) return custom;
  return document.getElementById('conv_exam').value || '';
}

function _convStreamsForLevel(level){
  const found = {};
  (db.students || []).forEach(s => {
    if(String(s.grade || '').charAt(0) === String(level)) found[s.grade] = 1;
  });
  const fallback = { '4': ['4N', '4S', '4E', '4W'], '5': ['5N', '5S', '5E', '5W'],
    '6': ['6N', '6S'], '7': ['7R', '7B'], '8': ['8R', '8B'], '9': ['9R', '9B'] };
  const list = Object.keys(found).sort();
  return list.length ? list : (fallback[String(level)] || []);
}

function convGradeChanged(){
  const level = document.getElementById('conv_grade').value;
  const sel = document.getElementById('conv_stream');
  if(sel){
    sel.innerHTML = '<option value="">-- Select stream --</option>' +
      _convStreamsForLevel(level).map(g => '<option value="' + g + '">' + g + '</option>').join('');
  }
  renderConvForm();
}

/* Active scope: {key, level, stream, examName, scopeLabel} or null. */
function _convActiveScope(){
  const level = document.getElementById('conv_grade').value;
  const examName = _convSelExam();
  if(!level || !examName) return null;
  const mode = (document.getElementById('conv_scope') || {}).value || 'grade';
  const wrap = document.getElementById('conv_streamWrap');
  if(wrap) wrap.style.display = (mode === 'stream') ? '' : 'none';
  if(mode === 'stream'){
    const stream = (document.getElementById('conv_stream') || {}).value || '';
    if(!stream) return null;
    return { key: stream + '|' + examName, level: level, stream: stream,
             examName: examName, scopeLabel: 'Stream ' + stream };
  }
  return { key: convKey(level, examName), level: level, stream: '', examName: examName,
           scopeLabel: 'Grade ' + level + ' (all streams)' };
}

function renderConvForm(){
  const wrap = document.getElementById('conv_subjectRows');
  const hint = document.getElementById('conv_hint');
  if(!wrap) return;
  const scope = _convActiveScope();
  if(!scope){
    const level = (document.getElementById('conv_grade') || {}).value;
    const examName = _convSelExam();
    const need = !level || !examName ? 'Select a grade and an exam name above to set their constants.'
      : 'Select a stream above to set stream-specific constants.';
    wrap.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px 2px">' + need + '</div>';
    if(hint) hint.textContent = 'Constants apply per grade + exam, or per single stream + exam. Stream constants override grade constants.';
    return;
  }
  const level = scope.level;
  const examName = scope.examName;
  const grade = level + 'X'; // representative grade for subject/sub-component lookup
  const subjects = getSubjects(grade);
  const cfg = (db.conversion && db.conversion[scope.key]) || {};
  const simple = cfg.simple || {};
  const subBlock = (s, full, subs, ckey) => {
    const c = cfg[ckey] || {};
    const lbl = (s === 'SCIE') ? 'each paper scaled to <strong>50</strong>' : '2nd component added raw, 1st scaled to the <strong>remainder of 100</strong>';
    return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px">' +
      '<div style="font-size:12px;font-weight:800;color:var(--sky);margin-bottom:2px">' + s + ' <span style="font-weight:400;color:var(--text-muted);font-size:11px">(' + subs[0] + ' + ' + subs[1] + ' — ' + lbl + ')</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div class="form-group" style="margin:0"><label>' + subs[0] + ' marked out of</label>' +
      '<input type="number" min="1" id="conv_inp_' + s + '_a" value="' + (c.a || '') + '" placeholder="—" oninput="convHintUpdate()"></div>' +
      '<div class="form-group" style="margin:0"><label>' + subs[1] + ' marked out of</label>' +
      '<input type="number" min="1" id="conv_inp_' + s + '_b" value="' + (c.b || '') + '" placeholder="—" oninput="convHintUpdate()"></div>' +
      '</div></div>';
  };
  const rows = subjects.map(s => {
    if(s === 'ENG') return subBlock(s, null, getEngSubs(grade), 'eng');
    if(s === 'KIS') return subBlock(s, null, getKisSubs(grade), 'kis');
    if(s === 'SCIE' && level === '9') return subBlock(s, null, getScieSubs(grade), 'scie');
    const m = simple[s] && simple[s].max;
    return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:12px;font-weight:800;color:var(--sky);min-width:70px">' + s + '</div>' +
      '<div class="form-group" style="margin:0;flex:1"><label>Marked out of <span style="color:var(--text-muted);font-weight:400">(blank = 100)</span></label>' +
      '<input type="number" min="1" id="conv_inp_' + s + '" value="' + (m || '') + '" placeholder="100"></div></div>';
  }).join('');
  wrap.innerHTML = rows;
  convHintUpdate();
}

function convHintUpdate(){
  const hint = document.getElementById('conv_hint');
  if(!hint) return;
  const scope = _convActiveScope();
  if(!scope){ hint.textContent = 'Constants apply per grade + exam, or per single stream + exam.'; return; }
  const level = scope.level, examName = scope.examName;
  const grade = level + 'X';
  const parts = [];
  const isSplit = s => s === 'ENG' || s === 'KIS' || (s === 'SCIE' && level === '9');
  getSubjects(grade).forEach(s => {
    if(isSplit(s)){
      const ckey = s === 'ENG' ? 'eng' : (s === 'KIS' ? 'kis' : 'scie');
      const aEl = document.getElementById('conv_inp_' + s + '_a');
      const bEl = document.getElementById('conv_inp_' + s + '_b');
      const a = aEl ? parseFloat(aEl.value) : 0, b = bEl ? parseFloat(bEl.value) : 0;
      const subs = s === 'ENG' ? getEngSubs(grade) : (s === 'KIS' ? getKisSubs(grade) : getScieSubs(grade));
      if(s === 'SCIE'){
        if(a > 0 && a !== 50) parts.push(s + ': ' + subs[0] + ' ÷ ' + a + ' × 50');
        if(b > 0 && b !== 50) parts.push(s + ': ' + subs[1] + ' ÷ ' + b + ' × 50');
      } else if(b > 0 && b < 100){
        parts.push(s + ': ' + subs[0] + ' scaled to ' + (100 - b) + ' + ' + subs[1] + ' raw (÷ ' + b + ')');
      }
    } else {
      const el = document.getElementById('conv_inp_' + s);
      const m = el ? parseFloat(el.value) : 0;
      if(m > 0 && m !== 100) parts.push(s + ': ÷ ' + m + ' × 100');
    }
  });
  // Cross-scope note: the other scope level may also hold constants.
  let other = '';
  if(db.conversion && typeof db.conversion === 'object'){
    const otherKey = (scope.stream ? convKey(level, examName) : null);
    if(otherKey && db.conversion[otherKey]) other = ' Note: whole-grade constants also exist (stream wins where both set).';
    if(!scope.stream){
      const streamKeys = Object.keys(db.conversion).filter(k => /^[1-9][A-Z]\|/.test(k) && k.split('|')[0].charAt(0) === level && k.slice(k.indexOf('|') + 1) === examName);
      if(streamKeys.length) other = ' Note: ' + streamKeys.length + ' stream-specific set(s) also exist (they win for their streams).';
    }
  }
  hint.innerHTML = parts.length
    ? '⚖️ <strong>' + examName + ' (' + scope.scopeLabel + ')</strong> will convert: ' + parts.join(' · ') + '. Totals capped at 100.' + other
    : 'No conversion set — scores for <strong>' + examName + ' (' + scope.scopeLabel + ')</strong> are stored exactly as entered.' + other;
}

function _convReadForm(){
  const scope = _convActiveScope();
  if(!scope){ toast('Select a grade, scope and an exam name first', true); return null; }
  const level = scope.level;
  const examName = scope.examName;
  const grade = level + 'X';
  const cfg = { simple: {} };
  let any = false;
  getSubjects(grade).forEach(s => {
    if(s === 'ENG' || s === 'KIS' || (s === 'SCIE' && level === '9')){
      const ckey = s === 'ENG' ? 'eng' : (s === 'KIS' ? 'kis' : 'scie');
      const a = parseFloat((document.getElementById('conv_inp_' + s + '_a') || {}).value);
      const b = parseFloat((document.getElementById('conv_inp_' + s + '_b') || {}).value);
      if((a > 0) || (b > 0)){
        cfg[ckey] = {};
        if(a > 0) cfg[ckey].a = a;
        if(b > 0) cfg[ckey].b = b;
        any = true;
      }
    } else {
      const m = parseFloat((document.getElementById('conv_inp_' + s) || {}).value);
      if(m > 0 && m !== 100){ cfg.simple[s] = { max: m }; any = true; }
    }
  });
  return { key: scope.key, scopeLabel: scope.scopeLabel, cfg: cfg, any: any };
}

function saveConvConstants(){
  const r = _convReadForm();
  if(!r) return;
  if(!db.conversion || typeof db.conversion !== 'object') db.conversion = {};
  if(!r.any){
    delete db.conversion[r.key];
    toast('No constants entered — removed (scores stored as entered)');
  } else {
    db.conversion[r.key] = r.cfg;
    toast('⚖️ Conversion constants saved (' + r.scopeLabel + ')');
  }
  if(typeof saveDB === 'function') saveDB();
  renderConvForm();
}

function clearConvConstants(){
  const scope = _convActiveScope();
  if(!scope){ toast('Select a grade, scope and an exam name first', true); return; }
  if(db.conversion) delete db.conversion[scope.key];
  if(typeof saveDB === 'function') saveDB();
  toast('🗑 Conversion constants cleared (' + scope.scopeLabel + ')');
  renderConvForm();
}
