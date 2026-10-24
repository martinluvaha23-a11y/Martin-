/* ═══════════════════════════════════════════════════════════════
   EXAM NAME REGISTRY — pre-defined exam names
   ───────────────────────────────────────────────────────────────
   Lets staff "create" an exam name ahead of any scores, scoped to:
     • Upper Primary & Junior School grades only   (4N … 9B)
     • Lower Primary grades only                   (1E … 3S)
     • Both LP + Upper Primary & Junior (all grades)
     • Individual classes (any mix / any single class)
   Created names appear in the score-entry dropdowns so teachers pick
   them instead of typing every time.

   Renaming a definition that already has submitted scores renames every
   record carrying the old name in one atomic step — the old server rows
   are deleted first (via the dedicated per-record DELETE endpoint) and
   the renamed records are pushed as new keys on the next save. The
   registry deliberately never deletes score records: removing a name
   only stops offering it in the dropdowns.

   Data lives in db.examRegistry (rides in the full-DB payload / backup).
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── Internal helpers ───────────────────────────────────────── */
function _er_defs(){
  if(!Array.isArray(db.examRegistry)) db.examRegistry=[];
  return db.examRegistry;
}

function _er_norm(def){
  if(!def) return null;
  def.scope = (def.scope==='lp'||def.scope==='upj'||def.scope==='both'||def.scope==='grades')
    ? def.scope : 'upj';
  if(def.scope==='grades'){
    def.grades = Array.isArray(def.grades)
      ? def.grades.filter(g=>ALL_GRADES.indexOf(g)!==-1)
      : [];
  } else {
    def.grades = [];
  }
  def.name = String(def.name||'').trim();
  if(!def.term) def.term='Term 1';
  if(!def.year) def.year=new Date().getFullYear();
  return def;
}

function _erFindMatches(oldName, oldTerm, oldYear){
  oldTerm = oldTerm || '';
  oldYear = oldYear ? String(oldYear) : '';
  let matches = (db.exams||[]).filter(r =>
    (r.examName||'Untitled Exam')===oldName &&
    (r.term||'')===oldTerm &&
    String(r.year||'')===oldYear
  );
  /* Fall back to name-only if nothing exactly matches — a definition may
     have been created under a different term/year than the records. */
  if(!matches.length){
    matches = (db.exams||[]).filter(r=>(r.examName||'Untitled Exam')===oldName);
  }
  return matches;
}

/* ── Public registry helpers (used from 05-app-core.js too) ─── */
function examRegistryGradesFor(def){
  def = _er_norm(def);
  if(def.scope==='lp')   return LP_GRADES.slice();
  if(def.scope==='upj')  return GRADES.slice();
  if(def.scope==='both') return ALL_GRADES.slice();
  return (def.grades||[]).slice();
}

function examRegistryAppliesTo(def, grade){
  return examRegistryGradesFor(def).indexOf(grade)!==-1;
}

function examRegistryNamesForGrade(grade){
  const names = [];
  _er_defs().forEach(d => {
    if(examRegistryAppliesTo(d, grade)) names.push(d.name);
  });
  return names.sort();
}

function examRegistryNamesForGradeUnsaved(grade){
  return examRegistryNamesForGrade(grade).filter(n =>
    !(db.exams||[]).some(e => e.grade===grade && (e.examName||'Untitled Exam')===n)
  );
}

function examRegistryDefinitionByName(name){
  const key = String(name||'').trim().toLowerCase();
  return _er_defs().find(d=>String(d.name||'').trim().toLowerCase()===key)||null;
}

function examRegistryScopeLabel(def){
  switch(def.scope){
    case 'lp':   return 'Lower Primary only (Grades 1\u20133)';
    case 'upj':  return 'Upper Primary & Junior only (Grades 4\u20139)';
    case 'both': return 'All grades (LP + Upper Primary & Junior)';
    case 'grades': return 'Selected classes';
  }
  return '';
}

function examRegistryNameTaken(name, ignoreId){
  const key = String(name||'').trim().toLowerCase();
  if(!key) return false;
  return _er_defs().some(d =>
    d.id!==ignoreId && String(d.name||'').trim().toLowerCase()===key
  );
}

/* ── Atomic rename of submitted records (no duplicates, no loss) ──
   Old-keyed rows are tombstoned/deleted server-side first, then every
   record is re-keyed to the new name/term/year in memory and pushed on
   the next save. Returns {conflict:bool, count:int}. */
function renameExamRecords(oldName, oldTerm, oldYear, newName, newTerm, newYear){
  newTerm = newTerm || 'Term 1';
  newYear = newYear ? String(newYear) : '';
  const matches = _erFindMatches(oldName, oldTerm, oldYear);
  if(!matches.length) return {conflict:false, count:0};

  /* Refuse if re-keying would collide with records that belong to a
     different exam — merging would silently duplicate/overwrite data. */
  const conflict = (db.exams||[]).some(r => {
    if(matches.indexOf(r)!==-1) return false;
    return (r.examName||'Untitled Exam')===newName &&
           (r.term||'')===newTerm &&
           String(r.year||'')===newYear;
  });
  if(conflict) return {conflict:true, count:matches.length};

  if(typeof _deleteExamRecordsRemote==='function') _deleteExamRecordsRemote(matches);
  matches.forEach(r=>{
    r.examName = newName;
    r.term     = newTerm;
    r.year     = newYear;
    if(typeof examCode==='function'){
      r.examCode = examCode(newName, newTerm, newYear);
    }
  });
  if(typeof recalcRanks==='function') recalcRanks();
  return {conflict:false, count:matches.length};
}

/* ── Manager UI ─────────────────────────────────────────────── */
let _erEditingId = null;

function openExamRegistryModal(){
  _erEditingId = null;
  erResetForm();
  renderExamRegistryList();
  const m = document.getElementById('examRegistryModal');
  if(!m) return;
  document.body.appendChild(m);
  m.style.display = 'block';
}

function closeExamRegistryModal(){
  const m = document.getElementById('examRegistryModal');
  if(m) m.style.display='none';
}

function erResetForm(){
  _erEditingId = null;
  const nameEl = document.getElementById('er_name');
  if(nameEl){ nameEl.value=''; nameEl.readOnly=false; nameEl.style.opacity=''; nameEl.title=''; }
  const title = document.getElementById('er_title');
  if(title) title.textContent = '＋ Add Exam Name';
  const saveBtn = document.getElementById('er_saveBtn');
  if(saveBtn) saveBtn.textContent = '＋ Add Exam Name';
  const cancelBtn = document.getElementById('er_cancelEdit');
  if(cancelBtn) cancelBtn.style.display = 'none';
  document.querySelectorAll('input[name="er_scope"]').forEach(r=>{ r.checked = (r.value==='upj'); });
  const termEl = document.getElementById('er_term');
  const yearEl = document.getElementById('er_year');
  if(termEl){
    const exTerm = document.getElementById('ex_term');
    if(exTerm && exTerm.value) termEl.value = exTerm.value;
  }
  if(yearEl){
    const exYear = document.getElementById('ex_year');
    if(exYear && exYear.value) yearEl.value = parseInt(exYear.value);
    else yearEl.value = new Date().getFullYear();
  }
  document.querySelectorAll('#er_gradesGrid input[type="checkbox"]').forEach(c=>{ c.checked=false; });
  erFormMsg('');
  erScopeChange();
}

function erScopeChange(){
  const scope = document.querySelector('input[name="er_scope"]:checked');
  const v = scope ? scope.value : 'upj';
  const wrap = document.getElementById('er_gradesWrap');
  if(wrap) wrap.style.display = v==='grades' ? '' : 'none';
}

function erCheckAllGrades(checked){
  document.querySelectorAll('#er_gradesGrid input[type="checkbox"]').forEach(c=>{ c.checked=checked; });
}

function erFormMsg(msg, ok){
  const el = document.getElementById('er_formMsg');
  if(!el || typeof msg!=='string') return;
  el.textContent = msg;
  el.style.color = ok ? 'var(--emerald)' : 'var(--rose)';
  el.style.display = msg ? '' : 'none';
}

function erReadForm(){
  const name   = (document.getElementById('er_name').value||'').trim();
  const term   = document.getElementById('er_term').value;
  const year   = parseInt(document.getElementById('er_year').value);
  const scope  = (document.querySelector('input[name="er_scope"]:checked')||{}).value || 'upj';
  const grades = scope==='grades'
    ? Array.from(document.querySelectorAll('#er_gradesGrid input[type="checkbox"]:checked')).map(c=>c.value)
    : [];
  return {name, term, year, scope, grades};
}

function erSave(){
  const f = erReadForm();
  if(!f.name) return erFormMsg('Please enter an exam name.');
  if(!f.term) return erFormMsg('Please choose a term.');
  if(!f.year || isNaN(f.year)) return erFormMsg('Please enter a valid year.');
  if(f.scope==='grades' && !f.grades.length) return erFormMsg('Select at least one class (or pick a wider scope).');
  if(examRegistryNameTaken(f.name, _erEditingId)) return erFormMsg('That exam name already exists — choose another name or edit the existing one.');

  const isTeacher = (typeof getCurrentRole==='function' && getCurrentRole()!=='admin');
  const defs = _er_defs();

  if(_erEditingId){
    /* ── EDIT ── */
    const def = defs.find(d=>d.id===_erEditingId);
    if(!def) return erFormMsg('Exam name not found — it may have been removed on another device.');
    const keyChanged = def.name!==f.name || def.term!==f.term || String(def.year)!==String(f.year);
    const hasRecords = (db.exams||[]).some(e=>(e.examName||'Untitled Exam')===def.name);
    if(keyChanged && hasRecords){
      if(isTeacher) return erFormMsg('⛔ Renaming an exam that already has submitted scores is restricted to admin.');
      const res = renameExamRecords(def.name, def.term, def.year, f.name, f.term, f.year);
      if(res.conflict) return erFormMsg('Cannot rename: another exam already has submitted records for "'+f.name+'" in the same term/year. Rename or remove that one first.');
      if(res.count > 0){
        toast('✅ Renamed '+res.count+' submitted record'+(res.count!==1?'s':'')+' to "'+f.name+'"');
      }
    }
    def.name  = f.name;
    def.term  = f.term;
    def.year  = f.year;
    def.scope = f.scope;
    def.grades = f.grades;
    _er_norm(def);
    saveDB();
    erResetForm();
    renderExamRegistryList();
    erFormMsg('✅ Saved — "'+f.name+'" updated.', true);
    refreshExamRegDropdowns();
    setTimeout(function(){ erFormMsg(''); }, 4000);
  } else {
    /* ── CREATE ── */
    const def = _er_norm({
      id: 'ER_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      name: f.name, term: f.term, year: f.year,
      scope: f.scope, grades: f.grades,
      createdAt: new Date().toISOString().slice(0,10)
    });
    defs.push(def);
    saveDB();
    erResetForm();
    renderExamRegistryList();
    erFormMsg('✅ Exam name "'+f.name+'" created — it now appears in the score-entry dropdowns for '+examRegistryScopeLabel(def)+'.', true);
    refreshExamRegDropdowns();
    setTimeout(function(){ erFormMsg(''); }, 5000);
  }
}

function erEdit(id){
  const def = _er_defs().find(d=>d.id===id);
  if(!def) return;
  _erEditingId = id;
  const title = document.getElementById('er_title');
  if(title) title.textContent = '✏️ Edit Exam Name';
  const nameEl = document.getElementById('er_name');
  const isTeacher = (typeof getCurrentRole==='function' && getCurrentRole()!=='admin');
  const hasRecords = (db.exams||[]).some(e=>(e.examName||'Untitled Exam')===def.name);
  nameEl.value = def.name;
  /* Teachers may rename the definition only when it has no submitted
     scores yet (renaming real records is admin-only, as elsewhere). */
  nameEl.readOnly = isTeacher && hasRecords;
  nameEl.style.opacity = (isTeacher && hasRecords) ? '0.45' : '';
  nameEl.title = (isTeacher && hasRecords) ? 'Renaming an exam with submitted scores is restricted to admin' : '';
  document.getElementById('er_term').value = def.term || 'Term 1';
  document.getElementById('er_year').value = def.year || new Date().getFullYear();
  document.querySelectorAll('input[name="er_scope"]').forEach(r=>{ r.checked=(r.value===(def.scope||'upj')); });
  document.querySelectorAll('#er_gradesGrid input[type="checkbox"]').forEach(c=>{ c.checked=(Array.isArray(def.grades)&&def.grades.indexOf(c.value)!==-1); });
  erScopeChange();
  const saveBtn = document.getElementById('er_saveBtn');
  if(saveBtn) saveBtn.textContent = '💾 Save Changes';
  const cancelBtn = document.getElementById('er_cancelEdit');
  if(cancelBtn) cancelBtn.style.display = '';
  erFormMsg('');
  const editor = document.getElementById('er_editorCard');
  if(editor) editor.scrollIntoView({behavior:'smooth', block:'start'});
}

function erCancelEdit(){ erResetForm(); }

function erDelete(id){
  const isTeacher = (typeof getCurrentRole==='function' && getCurrentRole()!=='admin');
  if(isTeacher) return toast('⛔ Teacher mode: deleting exam names is restricted.', true);
  const def = _er_defs().find(d=>d.id===id);
  if(!def) return;
  const recCount = (db.exams||[]).filter(e=>(e.examName||'Untitled Exam')===def.name).length;
  if(!confirm('Remove the exam name "'+def.name+'" from the list?\n\nSubmitted scores ('+recCount+' record'+(recCount===1?'':'s')+') are NOT touched — the name just stops being offered in the dropdowns.')) return;
  const idx = _er_defs().indexOf(def);
  if(idx!==-1) _er_defs().splice(idx,1);
  if(_erEditingId===id) erResetForm();
  saveDB();
  renderExamRegistryList();
  toast('🗑 Removed exam name "'+def.name+'"');
  refreshExamRegDropdowns();
}

function renderExamRegistryList(){
  const el = document.getElementById('er_list');
  if(!el) return;
  const defs = _er_defs().slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  const isTeacher = (typeof getCurrentRole==='function' && getCurrentRole()!=='admin');
  if(!defs.length){
    el.innerHTML = '<div class="empty-state" style="padding:22px 12px"><div class="empty-icon">📋</div>' +
      '<p>No exam names created yet.</p>' +
      '<p style="font-size:12px;color:var(--text-muted);max-width:420px;margin:6px auto 0">Create one above — it will appear in the score-entry dropdowns even before any scores are saved, so teachers can select it while entering marks.</p></div>';
    return;
  }
  el.innerHTML = defs.map(def=>{
    const grades = examRegistryGradesFor(def);
    let gradePreview = '—';
    if(def.scope==='lp')   gradePreview = '1E–3S ('+grades.length+' classes)';
    else if(def.scope==='upj') gradePreview = '4N–9B ('+grades.length+' classes)';
    else if(def.scope==='both') gradePreview = 'All ('+grades.length+' classes)';
    else gradePreview = grades.length ? grades.join(', ') : '—';
    const recCount = (db.exams||[]).filter(e=>(e.examName||'Untitled Exam')===def.name).length;
    const esc = String(def.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);margin-bottom:8px">' +
      '<div style="flex:1;min-width:180px">' +
        '<div style="font-weight:800;color:var(--gold)">📋 '+esc+'</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:3px">'+examRegistryScopeLabel(def)+' · '+gradePreview+' · '+def.term+' '+def.year+'</div>' +
      '</div>' +
      '<span class="badge badge-blue" style="font-size:11px">'+recCount+' record'+(recCount===1?'':'s')+'</span>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn btn-sm btn-ghost" onclick="erEdit(\''+def.id+'\')">✏️ Edit</button>' +
        '<button class="btn btn-sm btn-danger" onclick="erDelete(\''+def.id+'\')"'+(isTeacher?' disabled title="Admin only"':'')+'>🗑</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* Refresh any open score-entry dropdown so newly created/renamed names
   appear immediately even while the modal is still open. */
function refreshExamRegDropdowns(){
  if(typeof onExamSetupChange==='function'){
    try{ onExamSetupChange(); }catch(e){}
  }
}

/* Expose globals for use from the rest of the app */
window.examRegistryGradesFor          = examRegistryGradesFor;
window.examRegistryAppliesTo          = examRegistryAppliesTo;
window.examRegistryNamesForGrade      = examRegistryNamesForGrade;
window.examRegistryNamesForGradeUnsaved = examRegistryNamesForGradeUnsaved;
window.examRegistryDefinitionByName   = examRegistryDefinitionByName;
window.examRegistryScopeLabel         = examRegistryScopeLabel;
window.examRegistryNameTaken          = examRegistryNameTaken;
window.openExamRegistryModal          = openExamRegistryModal;
window.closeExamRegistryModal         = closeExamRegistryModal;
window.erScopeChange                  = erScopeChange;
window.erCheckAllGrades               = erCheckAllGrades;
window.erFormMsg                      = erFormMsg;
window.erSave                         = erSave;
window.erEdit                         = erEdit;
window.erCancelEdit                   = erCancelEdit;
window.erDelete                       = erDelete;

})();