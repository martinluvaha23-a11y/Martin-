
/* ═══ CONFIG ═══ */

// -- XLSX safety init: ensure make_xlsx_lib has run --
(function(){
  try {
    var _xl = (typeof XLSX !== 'undefined') ? XLSX : null;
    if(!_xl || !_xl.utils){
      if(typeof make_xlsx_lib === 'function'){
        if(!_xl){ _xl = {}; }
        make_xlsx_lib(_xl);
        try { window.XLSX = _xl; } catch(e2){}
      }
    }
  } catch(e){ console.warn('XLSX safety init:', e); }
})();


/* ── 2026 Subject Allocation ── */
const PRELOADED_TEACHERS = [
{"id":"PT001","name":"MARTIN","phone":"","classTeacher":"","assignments":[{"subject":"SCIE","classes":["7B","8R","9R"]},{"subject":"MATHS","classes":["8B","9B"]}],"_preloaded":true},
{"id":"PT002","name":"GRACE","phone":"","classTeacher":"","assignments":[{"subject":"AGRIC","classes":["5W","7B","8R"]},{"subject":"PTE","classes":["8B"]},{"subject":"ENG","classes":["9R"]},{"subject":"SCIE","classes":["9B"]}],"_preloaded":true},
{"id":"PT003","name":"DICKENS","phone":"","classTeacher":"","assignments":[{"subject":"MATHS","classes":["5E","6S"]},{"subject":"C/A","classes":["6N","7B","9R"]},{"subject":"SST","classes":["8R","9B"]}],"_preloaded":true},
{"id":"PT004","name":"RUTH.B","phone":"","classTeacher":"","assignments":[{"subject":"KIS","classes":["4N","6N"]},{"subject":"MATHS","classes":["5N"]},{"subject":"AGRIC","classes":["5E"]},{"subject":"SCIE","classes":["6S","8B"]}],"_preloaded":true},
{"id":"PT005","name":"JANE","phone":"","classTeacher":"","assignments":[{"subject":"MATHS","classes":["4S","5S"]},{"subject":"SST","classes":["4W","6N"]},{"subject":"SCIE","classes":["5W"]},{"subject":"PTE","classes":["7R","9R"]}],"_preloaded":true},
{"id":"PT006","name":"VICTOR","phone":"","classTeacher":"","assignments":[{"subject":"SST","classes":["4N","4S","5S","5W"]},{"subject":"ENG","classes":["4E","5E"]}],"_preloaded":true},
{"id":"PT007","name":"EDINA","phone":"","classTeacher":"","assignments":[{"subject":"SCIE","classes":["4N"]},{"subject":"CRE","classes":["4S","5E","6N"]},{"subject":"KIS","classes":["4E","7R"]},{"subject":"AGRIC","classes":["5N"]}],"_preloaded":true},
{"id":"PT008","name":"ASHLEY","phone":"","classTeacher":"","assignments":[{"subject":"CRE","classes":["4N"]},{"subject":"ENG","classes":["5N","6S","7B"]},{"subject":"SCIE","classes":["5E","7R"]}],"_preloaded":true},
{"id":"PT009","name":"PAULINE","phone":"","classTeacher":"","assignments":[{"subject":"AGRIC","classes":["4N"]},{"subject":"SCIE","classes":["4S"]},{"subject":"ENG","classes":["4W"]},{"subject":"SST","classes":["5E","6S"]},{"subject":"CRE","classes":["5W","9R"]}],"_preloaded":true},
{"id":"PT010","name":"GLADYS","phone":"","classTeacher":"","assignments":[{"subject":"MATHS","classes":["4N","5W"]},{"subject":"AGRIC","classes":["4S"]},{"subject":"SCIE","classes":["4E"]},{"subject":"CRE","classes":["5N"]},{"subject":"ENG","classes":["5S"]}],"_preloaded":true},
{"id":"PT011","name":"CELESTINE","phone":"","classTeacher":"","assignments":[{"subject":"MATHS","classes":["4E"]},{"subject":"AGRIC","classes":["4E"]},{"subject":"C/A","classes":["4W","5N","5W","8B","9B"]}],"_preloaded":true},
{"id":"PT012","name":"LUCY","phone":"","classTeacher":"","assignments":[{"subject":"SCIE","classes":["4W"]},{"subject":"C/A","classes":["5S"]},{"subject":"SST","classes":["7R"]},{"subject":"CRE","classes":["7B"]},{"subject":"ENG","classes":["8R"]}],"_preloaded":true},
{"id":"PT013","name":"JECINTAH","phone":"","classTeacher":"","assignments":[{"subject":"C/A","classes":["4S","7R","8R"]},{"subject":"KIS","classes":["4W"]},{"subject":"AGRIC","classes":["9B"]}],"_preloaded":true},
{"id":"PT014","name":"ANN","phone":"","classTeacher":"","assignments":[{"subject":"MATHS","classes":["4W","8R"]},{"subject":"SCIE","classes":["5S","6N"]},{"subject":"PTE","classes":["7B"]},{"subject":"AGRIC","classes":["8B"]}],"_preloaded":true},
{"id":"PT015","name":"MOSES","phone":"","classTeacher":"","assignments":[{"subject":"C/A","classes":["4N"]},{"subject":"SCIE","classes":["5N"]},{"subject":"AGRIC","classes":["5S"]},{"subject":"MATHS","classes":["6N","7B","9R"]}],"_preloaded":true},
{"id":"PT016","name":"FAITH","phone":"","classTeacher":"","assignments":[{"subject":"CRE","classes":["4E","8B"]},{"subject":"KIS","classes":["5N","7B","9B"]},{"subject":"AGRIC","classes":["6S"]}],"_preloaded":true},
{"id":"PT017","name":"PRSISCILLAH","phone":"","classTeacher":"","assignments":[{"subject":"SST","classes":["4E"]},{"subject":"KIS","classes":["5S","5E","8R"]},{"subject":"AGRIC","classes":["7R","9R"]}],"_preloaded":true},
{"id":"PT018","name":"NJOROGE","phone":"","classTeacher":"","assignments":[{"subject":"ENG","classes":["6N"]},{"subject":"MATHS","classes":["7R"]},{"subject":"SST","classes":["7B","8B"]},{"subject":"PTE","classes":["8R","9B"]}],"_preloaded":true},
{"id":"PT019","name":"FAITH.B","phone":"","classTeacher":"","assignments":[{"subject":"KIS","classes":["4S","5W","8B"]},{"subject":"C/A","classes":["4E","6S"]},{"subject":"CRE","classes":["5E"]}],"_preloaded":true},
{"id":"PT020","name":"MALOBA","phone":"","classTeacher":"","assignments":[{"subject":"SST","classes":["5N","9R"]},{"subject":"AGRIC","classes":["6N"]},{"subject":"ENG","classes":["7R","8B","9B"]}],"_preloaded":true},
{"id":"PT021","name":"ESTHER","phone":"","classTeacher":"","assignments":[{"subject":"AGRIC","classes":["4W"]},{"subject":"KIS","classes":["6S","9R"]},{"subject":"CRE","classes":["7R","8R","9B"]}],"_preloaded":true},
{"id":"PT022","name":"STEPHEN","phone":"","classTeacher":"","assignments":[{"subject":"COMPT","classes":["4N","4S","4E","4W","5N","5S","5E","5W","6N","6S","7B","8R","9B"]}],"_preloaded":true},
{"id":"PT023","name":"DEBORAH","phone":"","classTeacher":"","assignments":[{"subject":"ENG","classes":["4N","5W"]},{"subject":"CRE","classes":["4W","5S","6S"]},{"subject":"COMPT","classes":["7R","8B","9R"]}],"_preloaded":true},
{"id":"LP001","name":"PENINAH","phone":"","classTeacher":"1E","assignments":[{"subject":"MATHS","classes":["1E"]},{"subject":"ENG","classes":["1E"]},{"subject":"KIS","classes":["1E"]},{"subject":"ENVIRON","classes":["1E"]},{"subject":"CRE","classes":["1E"]},{"subject":"C/ARTS","classes":["1E"]}],"_preloaded":true,"isLP":true},
{"id":"LP002","name":"JOYCE","phone":"","classTeacher":"1N","assignments":[{"subject":"MATHS","classes":["1N"]},{"subject":"ENG","classes":["1N"]},{"subject":"KIS","classes":["1N"]},{"subject":"ENVIRON","classes":["1N"]},{"subject":"CRE","classes":["1N"]},{"subject":"C/ARTS","classes":["1N"]}],"_preloaded":true,"isLP":true},
{"id":"LP003","name":"MILLICENT","phone":"","classTeacher":"1S","assignments":[{"subject":"MATHS","classes":["1S"]},{"subject":"ENG","classes":["1S"]},{"subject":"KIS","classes":["1S"]},{"subject":"ENVIRON","classes":["1S"]},{"subject":"CRE","classes":["1S"]},{"subject":"C/ARTS","classes":["1S"]}],"_preloaded":true,"isLP":true},
{"id":"LP004","name":"BEATRICE","phone":"","classTeacher":"1W","assignments":[{"subject":"MATHS","classes":["1W"]},{"subject":"ENG","classes":["1W"]},{"subject":"KIS","classes":["1W"]},{"subject":"ENVIRON","classes":["1W"]},{"subject":"CRE","classes":["1W"]},{"subject":"C/ARTS","classes":["1W"]}],"_preloaded":true,"isLP":true},
{"id":"LP005","name":"PATIENCE","phone":"","classTeacher":"2E","assignments":[{"subject":"MATHS","classes":["2E"]},{"subject":"ENG","classes":["2E"]},{"subject":"KIS","classes":["2E"]},{"subject":"ENVIRON","classes":["2E"]},{"subject":"CRE","classes":["2E"]},{"subject":"C/ARTS","classes":["2E"]}],"_preloaded":true,"isLP":true},
{"id":"LP006","name":"CAROLINE","phone":"","classTeacher":"2N","assignments":[{"subject":"MATHS","classes":["2N"]},{"subject":"ENG","classes":["2N"]},{"subject":"KIS","classes":["2N"]},{"subject":"ENVIRON","classes":["2N"]},{"subject":"CRE","classes":["2N"]},{"subject":"C/ARTS","classes":["2N"]}],"_preloaded":true,"isLP":true},
{"id":"LP007","name":"LUCY","phone":"","classTeacher":"2S","assignments":[{"subject":"MATHS","classes":["2S"]},{"subject":"ENG","classes":["2S"]},{"subject":"KIS","classes":["2S"]},{"subject":"ENVIRON","classes":["2S"]},{"subject":"CRE","classes":["2S"]},{"subject":"C/ARTS","classes":["2S"]}],"_preloaded":true,"isLP":true},
{"id":"LP008","name":"CARREN","phone":"","classTeacher":"3E","assignments":[{"subject":"MATHS","classes":["3E"]},{"subject":"ENG","classes":["3E"]},{"subject":"KIS","classes":["3E"]},{"subject":"ENVIRON","classes":["3E"]},{"subject":"CRE","classes":["3E"]},{"subject":"C/ARTS","classes":["3E"]}],"_preloaded":true,"isLP":true},
{"id":"LP009","name":"MAUREEN","phone":"","classTeacher":"3S","assignments":[{"subject":"MATHS","classes":["3S"]},{"subject":"ENG","classes":["3S"]},{"subject":"KIS","classes":["3S"]},{"subject":"ENVIRON","classes":["3S"]},{"subject":"CRE","classes":["3S"]},{"subject":"C/ARTS","classes":["3S"]}],"_preloaded":true,"isLP":true},
{"id":"LP010","name":"TABITHA","phone":"","classTeacher":"3N","assignments":[{"subject":"MATHS","classes":["3N"]},{"subject":"ENG","classes":["3N"]},{"subject":"KIS","classes":["3N"]},{"subject":"ENVIRON","classes":["3N"]},{"subject":"CRE","classes":["3N"]},{"subject":"C/ARTS","classes":["3N"]}],"_preloaded":true,"isLP":true}
];
// ── Lower Primary grades (Grades 1–3, taught by single class teacher) ──
const LP_GRADES = ['1E','1N','1S','1W','2E','2N','2S','3E','3N','3S'];
// ── Upper Primary & Junior School grades ──
const GRADES = ['4N','4S','4E','4W','5N','5S','5E','5W','6N','6S','7R','7B','8R','8B','9R','9B'];
// ── Combined (for validation & cross-system use) ──
const ALL_GRADES = [...LP_GRADES, ...GRADES];

const SUBJ_LP   = ['MATHS','ENG','KIS','ENVIRON','CRE','C/ARTS']; // Lower Primary subjects
const SUBJ_456  = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A'];
const SUBJ_789  = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','PTE'];
const ALL_SUBJ  = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A','PTE','ENVIRON','C/ARTS'];

// Sub-score components — GRADE DEPENDENT
// Grades 4-6: ENG = GRA + COMP, KIS = LUG + INS
// Grades 7-9: ENG = ENG PP1 + ENG PP2, KIS = KIS PP1 + KIS PP2
// Grade 9 only: SCIE = SCIE PP1 + SCIE PP2
// These are entry-only — never stored in scores{} or used in totals/rubrics
function getEngSubs(grade) {
  const g1 = grade.charAt(0);
  return ['7','8','9'].includes(g1) ? ['ENG PP1','ENG PP2'] : ['GRA','COMP'];
}
function getKisSubs(grade) {
  const g1 = grade.charAt(0);
  return ['7','8','9'].includes(g1) ? ['KIS PP1','KIS PP2'] : ['LUG','INS'];
}
function getScieSubs(grade) {
  return String(grade || '').charAt(0) === '9' ? ['SCIE PP1','SCIE PP2'] : [];
}
function isScieSplit(grade){ return getScieSubs(grade).length === 2; }
function getSubScoreParents(grade) {
  const engSubs = getEngSubs(grade);
  const kisSubs = getKisSubs(grade);
  const parents = {};
  parents[engSubs[0]] = 'ENG'; parents[engSubs[1]] = 'ENG';
  parents[kisSubs[0]] = 'KIS'; parents[kisSubs[1]] = 'KIS';
  // Legacy support for reading old data
  parents['GRA'] = 'ENG'; parents['COMP'] = 'ENG';
  parents['LUG'] = 'KIS'; parents['INS'] = 'KIS';
  // Grade 9 SCIE papers (no legacy keys)
  parents['SCIE PP1'] = 'SCIE'; parents['SCIE PP2'] = 'SCIE';
  return parents;
}
function getParentSubs(grade) {
  const out = { ENG: getEngSubs(grade), KIS: getKisSubs(grade) };
  if(isScieSplit(grade)) out.SCIE = getScieSubs(grade);
  return out;
}
function hasSubScores(subj) { return subj==='ENG' || subj==='KIS' || subj==='SCIE'; }

/* PP column visibility for results tables: component columns appear only
    when BOTH components are present anywhere in the record set (new keys or
    legacy fallbacks) AND every record carrying the parent also carries both
    components. Otherwise only the parent total column shows. This keeps empty
    PP2 columns off the sheet (e.g. a class that entered the combined total
    single-score style next to a class with both papers) while preserving
    every value — the parent always carries the sum. */
function ppColPlan(records, subs, legacy, parentKey){
  if(!subs || subs.length !== 2) return { show0: false, show1: false };
  const comp = (e, i) => e.subScores &&
    (e.subScores[subs[i]] !== undefined || (legacy && e.subScores[legacy[i]] !== undefined));
  const any0 = (records || []).some(e => comp(e, 0));
  const any1 = (records || []).some(e => comp(e, 1));
  if(!(any0 && any1)) return { show0: false, show1: false };
  if(parentKey){
    const single = (records || []).some(e => e.scores && e.scores[parentKey] !== undefined &&
      !(comp(e, 0) && comp(e, 1)));
    if(single) return { show0: false, show1: false };
  }
  return { show0: true, show1: true };
}
function ppSubVal(e, key, legacyKey){
  if(e.subScores && e.subScores[key] !== undefined) return e.subScores[key];
  if(legacyKey && e.subScores && e.subScores[legacyKey] !== undefined) return e.subScores[legacyKey];
  return '—';
}

/* Competition ranks (1,2,2,4): equal keys share the same rank. The list must
   already be sorted desc by the key. Returns an array parallel to the list. */
function compRanks(list, keyFn){
  const out = new Array(list.length);
  let r = 0;
  for(let i = 0; i < list.length; i++){
    if(i === 0 || keyFn(list[i]) !== keyFn(list[i - 1])) r = i + 1;
    out[i] = r;
  }
  return out;
}

function isLPGrade(grade) { return LP_GRADES.includes(grade); }
function getSubjects(grade) {
  const g1 = grade.charAt(0);
  if (['1','2','3'].includes(g1)) return SUBJ_LP;
  return ['7','8','9'].includes(g1) ? SUBJ_789 : SUBJ_456;
}

/* ─── Subject full names for PDFs ─── */
const SUBJ_FULLNAME = {
  'MATHS':'Mathematics', 'ENG':'English', 'KIS':'Kiswahili',
  'SCIE':'Science', 'AGRIC':'Agriculture', 'SST':'Social Studies',
  'CRE':'Christian Religious Education', 'C/A':'Creative Arts',
  'PTE':'Pre-Technical Studies',
  'ENVIRON':'Environmental Activities', 'C/ARTS':'Creative Arts (LP)',
  // Upper Primary (Gr 4-6) sub-components
  'GRA':'English Grammar', 'COMP':'English Composition',
  'LUG':'Kiswahili Lugha', 'INS':'Kiswahili Insha',
  // Junior School (Gr 7-9) sub-components
  'ENG PP1':'English Paper 1', 'ENG PP2':'English Paper 2',
  'KIS PP1':'Kiswahili Paper 1', 'KIS PP2':'Kiswahili Paper 2'
};
function subjFull(s){ return SUBJ_FULLNAME[s] || s; }

/* ─── Teacher comment by rubric code ─── */
const RUBRIC_COMMENT = {
  'EE1':'Excellent',
  'EE2':'Very good',
  'ME1':'Good',
  'ME2':'Satisfactory',
  'AE1':'Can do better',
  'AE2':'Double your effort',
  'BE1':'Put more effort',
  'BE2':'Put more effort'
};
function rubricComment(code){ return RUBRIC_COMMENT[code] || ''; }

/* ─── Overall rank across all classes of same grade level ─── */
// Grade level = first char, e.g. '7' for 7R, 7B etc.
function getOverallRank(admNo, examName){
  const student = db.students.find(s=>s.admNo===admNo);
  if(!student) return '—';
  const gradeLevel = (student.grade||'').charAt(0);
  // All records of same exam, same grade level
  const pool = db.exams.filter(e=>
    (e.examName||'Untitled Exam')===examName &&
    (e.grade||'').charAt(0)===gradeLevel
  );
  if(!pool.length) return '—';
  const sorted = [...pool].sort((a,b)=>b.total-a.total);
  const pos = sorted.findIndex(e=>e.admNo===admNo);
  return pos>=0 ? (pos+1) : '—';
}
function getOverallTotal(examName, gradeLevel){
  return db.exams.filter(e=>
    (e.examName||'Untitled Exam')===examName &&
    (e.grade||'').charAt(0)===gradeLevel
  ).length;
}

/* ═══ SCHOOL LOGO ═══ */
const SCHOOL_LOGO_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACSAKMDASIAAhEBAxEB/8QAHQAAAgICAwEAAAAAAAAAAAAAAAcGCAQFAQIDCf/EAEMQAAEDAwIDBQUFBAgGAwAAAAECAwQABQYHERIhMQgTQVFhIlJxgZEUMkJioRUjscEWJDM0Q3KywhdTc5Ki0SUmgv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABsRAQEBAQEAAwAAAAAAAAAAAAABETEhAkFR/9oADAMBAAIRAxEAPwC5dFcKUlKSpSglI5kk7AUtc11gsdpm/sbHoz+TXxR4URII4kpV+dY5CgZDzrTLSnXnENtoG6lrVsAPMmldkesEZ64rsOAWp/KrxvwkscozJ81udPpWtjYDm+fPInalXkwLaTxIsVuWUp28nF9T8KamO2CzY7b0QLJbY0GOgbBDKAN/ifH51QubdhGpV3bVccj1Cl2yY9zEO2IAZZHu8+p9ayTp1maT+71Vve35mkmmfRUCwGAZ8n7uqVxP+aMk/wA64OEakpI7vU54/wCeGk00KKuhWqw/VdP9nqSyf80EVwMX1hTvw6hW8+W9vFNOvN+QwwkqffaaSPFawB+tNCtVjetIPsZ7aCPW3ij+j+toHLOLIfjb6nTGYYs/cP2e1kFtXK/5QkJ4v41u0qStIUlQUD0IO9NCqXY9bwBwZlYTy57wfGupsmuXLbMcePn/AFE02KKaulMbLroOmXY6fjCNcGx66nf/AO5Y8OXL+omm1RU1CMt+ruT4Rck2bV+xKiNKVws3uEgqjODfkVAfdpz2W6229W9q4WqaxNiujdDrKwpJHyrtdbdAu0F2DcobEuK6OFbTqApJHwNJW96O3/EJ7l90evq7W4SVu2aSoqiPeOyd/u1Q9KKTWGa5RBdE43qNansSvoIQPtAP2d4+aF9OdOJh1p9pLrLiHG1DdKkHcEehqDvRRRQV+7VUbUGPHbutvnvv4mgp+3Q4nsOoSPvEqHMpP6VPtBhgMrC49xwaCzHYcGz4PN9Dnilw9Sf41P5LLMmO5HkNodacSUrQobhQPUEVV2+x5fZ/1fYutu7xWG31ezzPPha5+0PinfcenKqLTUV5xJDMqK1KjuJcZeQFtrSdwpJG4IrT5vjqcosLlpXcp1uC1BXfxHOBwbevlUGfPu1rgJKp1xiRgOvevJT/ABNQXK9bNOsfhyXXMhjS32kEpjx1canFDokbcudJLUTs0ZgtbkmxZQ7eUHn3E55QX9d9qrtNs82DeJFpegqTcI7pZdYSniXxjqB51cFkLb2tZAmOquWIgRDv3fcvbrHlvvWtv/a0v7xKbLjMSKnwXIcKj9Krq73qApK2nG1J5KC0lO31rHUQdx4UUz7/ANoLVS7KV/8APIgoPLhitBFQW85Vk13WpVzyG5y9zzC5B2rTyWX2QlTjZRxHbn6da81Hw2+FNGQ0pSFB1Lqw5vyWFkK+tTjE9WtQMX4Ba8llqaR/gyD3iD6bGoCT7JFBJG23Xami0GIdrK4scDWVY83IT4vw1bH/ALTypy4br3ptkoQhq9pgSFcu5mDuyD8elfP1G5bKtxy8PGuBwqKd0AnfxoY+psKZEmsh6HJZkNnotpYUPqK96+ZWPZVk2PPBdkv1whEHklDx4foeVNbE+1DnloCWru3CvTSeRKhwuH5imGLv0UpNEtb7bqXdHrS1Y59umMx+/WXEktEbgbBW3rTbqI0WaYhjmY2tdtyK1R5zChyK0+0j1SrqDVZcuvF70HzeFYMKyZ7JYkxfOwSSXXI/kkKHMb+FNztI6rDT3Hm4FoAkZJc/YhsgblsHl3hHx5AeJrWdnTSJWOtqzXMQZ+W3L98pT3tGKFc+Eb/i8z4dK1FNXFrjdrlj0KfdLOq2TX2gt6KpYUWj5E0VuaKygqC674mzmOmV2tqmwqS00ZMVW3NLiBuNviNx86nVcLSFoUhQ3ChsRQJvsiZO9fNMBbJbhXJsz5i7k8+7I3R+m4+VOWq1dkEKi55nlvb37ht8cIHQbOLA/SrK1b0FUgxxrv8AtgJPUf0idUd/Tiq79Us0/SZXa5CuXs3mUobegXSC1OU6d4ZkrC2rvj8J7jPEVhsJVv57iqJa94xasP1Wu1gsaFogMFtTaFq4iniQFEb/ABNfRevn/wBqJ4nXXI9xw/vGwCRtvs2mkUs5LTy0GS84VqURtueZPjWMtI2PTlWVxBThc4jyHLbmN66ue394BO23QUxWOlB22A4vSvZTKk8BKd+NPs7V3CDwlYUEb7ivU8I7tId3Pu9NqYJFpXpxfdR78/Z7G/GYeYj9+44+dkpRuE+HjuaeNh7IkolC75lqR7yIzP8AM1gdhVtKtQr+6glQTbEgq25ElwVcOl8QibH2XNPISgu4OXG5K6+27wDf5VOrFo9pvZtjDxSAVD8TqOM/rU8oqamsS3Wu225HBAgRoo22/dNBP8K7XafGtdrlXKY4G40VpTzqz4JSNz/CsmlN2tbs9atDrwGFcK5im4m491ava/QGk9Cq0Ft0nV3Wm8amX9rvLfbHuGCysbpC/wDDT8Ep5/E1a6lT2TrMzaND7KttADk8LlunbmSpRA/QCmtVvQUUUVAVrsousex45cbxKWEMw4y3lE/lSTtWxpA9p7JJl+uFt0kxlRcuV2dQZxR/hNb7gHy94+gqwefYutj67BkGVyUkKus4pbJ8Up3J/VX6VYKtLg2OQsTxO3Y9b0gMQmQ3xbc1q/Eo+pO5rdUoKqtjGG3HFe15HROClx57kqdEf25OJUhRI+IJ2q1NeD8KI/LYlvRmlvx9+5cUndSNxsdj4biko96j+S4TieRlSr1YYMxxXVxxocf161IKT2RavzXdXoun2HWpm7PDlOkFzZDBHNXP8o6+vKkBd+zdpfPUVt2uREUf+S+QPpWje7KuALVumbdEDyDgNOFyFf5iimRcWojPlHR7Z+Z6VjXazm32uVPiXSay/HZW6FKc4grhBPtDy5U1Suh9lvTtk7PO3J9G+5SXtqk9n0E0utigpvHEPqHjIWV1JrBBuV0sUK5TrzLalSWEPKSwQlCCoA7AbdOdZSVZJbwUrbZujSRyUlXdufTxNBl2HHbFYUFFmtMOAFAJV3DQSSPUjrW0qC6b6o43nN0uFpt32iNcrf8A3iNIRwrGx4Tt57EVOqiCiiigKTXbIhrk6Jy3UJUr7NLZdUB5b8O/605aimXosWaY9fMPE5h16RGWwtAV91RHIjz2O3SrBpezXNZn6H4u4yoHu4ncr28FJUQR+lMWqz9jHI37TLv+l964mJ9vkrejtucjyOziR8wFfA1Zil6CiiioItqpmcDA8KnZDOKSWk8Mdrfm66fupHz/AEFLLsu4fPeE7VDKQp293xSlR+8HNpknqPLfw9AKi2UOP629oJOLJWr+i2MrUqUEnk8pJ2V9VeyPQGrOR2Wo7DbDDaW2m0hCEJGwSANgBVC31q1gsemiI8aTHdnXOUguMxm+WyQduJR8BvUf0h7QVkzW9iyXSEbLOd/u3eL3Q8fdB8DWf2jdI2tRbMi4W1SWMhgtkRln7ryOpbV8+h86pxYMQyu55C/Z49vkxpkB3hkKWCj7KoHqT+tJFfSOilPpXmM63QIFhyy4pmOcCWm7ltsCv3HPInwV40ysgubNmsU67vpUtqHHW+pKRuVBKSdh9KiFn2l9UG9PsS+y291Jv1ySpuKkcy0nop0/Dw9a1/ZV06cxbFl5Nem1Kv17AecLnNbTR5hJPmfvH5VUbL84v+T56vMbpEfdkfaEusMOsKLTaEndDe23Tz86mF27SOqcplSW5rEEHl+5iEFPw3rWeKvnWj1AeLGEXlwdfsbg+qdv5187puqGeTJBkScwu/eE7nZZSPpW7s2t2oMK2yLa5fTc4T6eFbUscRHMHkevhTDH0Is7Qj2mGwOjbCEfRIFZVfPi56/6lyXhLayxxhalc47LIDaPQcq3uM9qbP7SpKbmuDd2vEOo4Fn5iplMTjXxibpNrxa9RrO0RBuauKS2nklaxydQf8ydlfGrSWC6wr5ZYd4tzyXokxlLzSweqSN6pVq52hrVqTg7uPTcX+zSu8Q9Gkh8ENOJPX5jcfOp72I9RA6JGnk58uFKVSrcSd+FP+I38B1HxNW8RaaujzrbDK3nnEttoHEpSjsAPMmsa83SFaIKpk94NNp5AdVKPgAPE1HUQpuREXDIAqDaW/bagKVsVgdFPH/bWQOSrjlilMWxbkCyg8LkzbZySPEN+SfzfStHlc+xxlMYhjdp/aF4b5tJjq4fsp8XFuDp6+Jrtc8ju2VXJzHcGCY8KOe7mXYo/dNjbmhr3lfCpZh2LWvF4BjwEKW86eORJdPE6+vxUo1VVv7RmL5Bgl7x3Vy2upeucZaG7u6yjhStY5JUR5KT7B+VWRwXJbfl+JW7IrY4FRprIcA35oV+JJ9QdxWRlVjgZLjk+w3NoOxJrKmXEkdAR1HqDz+VVo7NOQTtN9U7xo7kjikMOyFKtzi/ulzbcbei07H4ir2ItVRRRWRVDsIzO/yTNUSiftyu6cXxdduJfF/5Va+qXzpLug3a1enTEqaxrIFqUV7ewGnVbn/sc/SrmsOtPsNvsuJcacSFIWk7hQI3BBrXyHel5qXh8l55eTY22kXNKf63GAAE1A/3gdPPoaYdFZFbC7HnQlzIqQWlApfYUObfPYgjw2PzB+VTTTrOExFM47kLpfgPnuoct478BPIMu7/QKPXoedZ2qOFPsyH8rxlgqkkcVwhNj+8p8VpHvgeH4h60tQYkqH9riBLsN0bONkbhO/Igjrtv8weXrW+tdWKVYrIse1aYJH/QT/6rwXiuNL+/YbarfzjJ/wDVLnTLOV2xxiwX+UXISyG4M51W5QfBl0/6VePQ03qzfGUfdwjD3f7TGbSr4xUf+qX+Y9nLTLJLqLiu1OW90/2iYa+BC/8A89BTgopohuO6W4DYrIzaIOMW5UdodXmQ4tR8SVHmTRL0r07lHd/D7Qo/9ACplRUC3l6F6VSSSvD4KSfcBT/A1gW/AtN9M8havOO2JX7ffaUxFjMuFS3Arbfkeg81GphkeSvNz/2FjzCZ95WN1Df91FT77h8PQdTWmuEmw6b2h/IcinquF4k7JW8obvPqPRttPgnfkAPnVGaY7Nracy7OJrAfYQVttlX7mInySD1V+aoyj+kGqroJMizYdxb8vZfnjy80o9a5sWKXrPboxk+fNqjW9s8dvsgOwCT0U95npyprtoQ2hLbaUoQkbJSkbADyFOKxbPbYFotzNutsVuNFZTwobQNgBWXRRUQVUbtxtos2oeF5LAIauOx3WnkT3TiSk/8AkRVuapfrjN/4udqOyYbZ1h+HanExnnEc0jhV3j6vgNuGtfHouTbnjJt8aQobF1pKyPiAaK9W0JbbS2gbJSAAPICishea/wCl1t1Twly0v8DFyj7u2+URzac26H8quhFIvs76wXPTy+HSPVbvIK4i+6gTHzybG/JCleKD+FXyq3NLbXLR3GNVbL3F0aEW5spP2W4NJHeNnyPvJ9Ksv1Qx2nEOtpdaWlaFgKSpJ3BB8Qa7VTDGs91O7ON4bxjUKG/e8SK+GLNRuooTv+BR/wBJq2WD5dj2aWFm9Y5cmZ0R0A7oV7SD5KHUGlmDe0o9T8Kdtct/KscjKWyvddygNp34t+ryE+J95P4hz603KKS4KzOsxpMLvm0IfgyEjiTvxAA/y8j5+oqeaZZy7bHY+OZFJU5GcIbt9wcVuQfBl0+fuq8enWvHUrEXcclP5JZGCu0ukquENCOLuCfvOoSOqT+JPzFQySxHciA+xIgyU8wTxJAPMDfxB6g/wIrXWurLUUotMc7Xbp0PE8ll8YkHu7VNdV7Th6hlw++B91X4h602JchiJGckyXkMstp4lrWdgkeZNZsxl6nkNzUNu17uWQTF2XEnAhtCuCbddt0MDxS37y/0FYzj10zxwtRFv2zGQdlyBuh6cPJHut+vU1q8hzMQbg3genNsam3VKOFxSOUeCnpxrV5+nWkiu+TZHZdN4TGP2CE5dchnEqaioPG8+vxccV16+dd8DwCau5oy7PZCbnkJ5ss9WIQP4UDoVfmra6b4DFxZLlwny13jIJXOXcnx7aj7qPdT6CppTQUUUVEFFYN9u9rsVseud4nMQYbKeJx55YSkCqual9om/wCcXJeE6I2uVNlPHu3bmG/ug8iUe6PzGrJol/ak1zZxCEvDcRd+2ZXOHdfufb+yBXLfl1WfAeFZXZK0edwOxO5LkbfHk11Ru4FndUZo8+Df3ieavpXj2d+z3EwqT/SvMX03vKn/AG+Nz20RlHrsT1V60/qtv1AUUUVkFFFFBrMox+zZNZn7PfbexPhPp2W06ncfEeR9aqbnejuoeit7czPR24yplqSeOTbCeNSUeIKfxp9etXFoPMbGrLgR+hfaLxbP+7s94KbDkifZciSFcKHFePAo/wADzp4DmNxSR1y7OmKagFd3tQFgyJPtIlx08KXFeHGkfxFKGxapat6C3RvHtTrVJvmOpVwM3BG6lJT5pX4j0NXJeC5igFApUAQeRB8aSWouGXHFpD11xqAZ1mfUVPQkjcwlE+0pI/E0eZKRzB5imFpxqJiOoFpRccYu7EsEbrZ4tnWz5KT1FSupLgUuP6e4hkeCS0wrqLpMlt+xcgfbjPJPEgoH4ClWx269a1eD5FNy28C06jcMJ62yfsKYiFbsS5KB7S3D5q5KSg8iDUyzXTiNdY1wfxu5SMausxhTS5MPklfENt1I6E+vWq86K6damYFq5NxfLrU/kWL39HBJuCXCtCVoG7b255pUPu+fOqp1ZDkt9zi7SMRwEmHAjq7m5Xrh2QztyLbXmvw9KnOEYlZsQtX2G0sEKWeJ99Z4nX1+KlK8TWyslqgWa3NW+2xm48dsckoG258SfMnxNZtS1BRRUD1S1cwbTmCp7IbwyJO27cNkhbyz5BI6fOoJ5SZ1t7Q+GadIct8d4Xq/EbNwoyuIJV4cah0+HWkzctRdatfJyrRp9aX8axpZ4XZyyUlSfMr/AJJpt6MdmzDcFcbu13ByK/78apUscSEK80pP8TVzOhQ2bAdXe0TdGr7qFOfx7FAviYgoBQVp/Kj/AHGrT6dYBiuAWZFrxm1MxGwkBbvDu46fNSupqTpASkJSAABsAPCuaW6CiiioCiiigKKKKAooooCsG+Wi2Xy2u227wY86I6NltPICkn61nUUFVtRey/Pst2XlWjV9kWW4oPH9hU6QhXolX8jyrDwvtMZRhlzTjWteNSob7ZCBcGmSCr8xT0UPUVbWtFmeH41mNsXbsks8W4x1AjZ1AKk+oPUVd/Rzh2XY3l9sRcccvES4x1gHdpwEp9COoNbyqoZZ2YMhxS6LyHRnLJVskoPGILzpAPjsFdD8xWBa+0bqrg5eseo2nkyfcGk8LL8dpSe8PhvsCCPUUz8FvjyG5pc6n616e6esL/bV8ZcmAHhhxiHHVHy2HT50gi/2l9aTwtNjC8eeP3ju2oo/1K/SmBpp2VMHx6Si6ZO9Iyi6AhSlyye64vPh8fnTIF5ctXdbdZ5a7Xpfjj1isyzwqnujZXD5lw8h8qmel3ZVslvnJv8AqLc3spvKjxqQ4sllKuvPfmr51YyBCiW+KiLBjMxmGxshtpASkD4CvemjHt8KHbobcOBFZix2hwoaaQEpSPQCsiiioCiiigKKKKAooooCiiigKKKKAooooCiiigK83o7DxBeYbcKenGkHb60UUHpRRRQFFFFAUUUUBRRRQFFFFAUUUUH/2Q==';
const SCHOOL_LOGO_DATAURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCACSAKMDASIAAhEBAxEB/8QAHQAAAgICAwEAAAAAAAAAAAAAAAcGCAQFAQIDCf/EAEMQAAEDAwIDBQUFBAgGAwAAAAECAwQABQYHERIhMQgTQVFhIlJxgZEUMkJioRUjscEWJDM0Q3KywhdTc5Ki0SUmgv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABsRAQEBAQEAAwAAAAAAAAAAAAABETEhAkFR/9oADAMBAAIRAxEAPwC5dFcKUlKSpSglI5kk7AUtc11gsdpm/sbHoz+TXxR4URII4kpV+dY5CgZDzrTLSnXnENtoG6lrVsAPMmldkesEZ64rsOAWp/KrxvwkscozJ81udPpWtjYDm+fPInalXkwLaTxIsVuWUp28nF9T8KamO2CzY7b0QLJbY0GOgbBDKAN/ifH51QubdhGpV3bVccj1Cl2yY9zEO2IAZZHu8+p9ayTp1maT+71Vve35mkmmfRUCwGAZ8n7uqVxP+aMk/wA64OEakpI7vU54/wCeGk00KKuhWqw/VdP9nqSyf80EVwMX1hTvw6hW8+W9vFNOvN+QwwkqffaaSPFawB+tNCtVjetIPsZ7aCPW3ij+j+toHLOLIfjb6nTGYYs/cP2e1kFtXK/5QkJ4v41u0qStIUlQUD0IO9NCqXY9bwBwZlYTy57wfGupsmuXLbMcePn/AFE02KKaulMbLroOmXY6fjCNcGx66nf/AO5Y8OXL+omm1RU1CMt+ruT4Rck2bV+xKiNKVws3uEgqjODfkVAfdpz2W6229W9q4WqaxNiujdDrKwpJHyrtdbdAu0F2DcobEuK6OFbTqApJHwNJW96O3/EJ7l90evq7W4SVu2aSoqiPeOyd/u1Q9KKTWGa5RBdE43qNansSvoIQPtAP2d4+aF9OdOJh1p9pLrLiHG1DdKkHcEehqDvRRRQV+7VUbUGPHbutvnvv4mgp+3Q4nsOoSPvEqHMpP6VPtBhgMrC49xwaCzHYcGz4PN9Dnilw9Sf41P5LLMmO5HkNodacSUrQobhQPUEVV2+x5fZ/1fYutu7xWG31ezzPPha5+0PinfcenKqLTUV5xJDMqK1KjuJcZeQFtrSdwpJG4IrT5vjqcosLlpXcp1uC1BXfxHOBwbevlUGfPu1rgJKp1xiRgOvevJT/ABNQXK9bNOsfhyXXMhjS32kEpjx1canFDokbcudJLUTs0ZgtbkmxZQ7eUHn3E55QX9d9qrtNs82DeJFpegqTcI7pZdYSniXxjqB51cFkLb2tZAmOquWIgRDv3fcvbrHlvvWtv/a0v7xKbLjMSKnwXIcKj9Krq73qApK2nG1J5KC0lO31rHUQdx4UUz7/ANoLVS7KV/8APIgoPLhitBFQW85Vk13WpVzyG5y9zzC5B2rTyWX2QlTjZRxHbn6da81Hw2+FNGQ0pSFB1Lqw5vyWFkK+tTjE9WtQMX4Ba8llqaR/gyD3iD6bGoCT7JFBJG23Xami0GIdrK4scDWVY83IT4vw1bH/ALTypy4br3ptkoQhq9pgSFcu5mDuyD8elfP1G5bKtxy8PGuBwqKd0AnfxoY+psKZEmsh6HJZkNnotpYUPqK96+ZWPZVk2PPBdkv1whEHklDx4foeVNbE+1DnloCWru3CvTSeRKhwuH5imGLv0UpNEtb7bqXdHrS1Y59umMx+/WXEktEbgbBW3rTbqI0WaYhjmY2tdtyK1R5zChyK0+0j1SrqDVZcuvF70HzeFYMKyZ7JYkxfOwSSXXI/kkKHMb+FNztI6rDT3Hm4FoAkZJc/YhsgblsHl3hHx5AeJrWdnTSJWOtqzXMQZ+W3L98pT3tGKFc+Eb/i8z4dK1FNXFrjdrlj0KfdLOq2TX2gt6KpYUWj5E0VuaKygqC674mzmOmV2tqmwqS00ZMVW3NLiBuNviNx86nVcLSFoUhQ3ChsRQJvsiZO9fNMBbJbhXJsz5i7k8+7I3R+m4+VOWq1dkEKi55nlvb37ht8cIHQbOLA/SrK1b0FUgxxrv8AtgJPUf0idUd/Tiq79Us0/SZXa5CuXs3mUobegXSC1OU6d4ZkrC2rvj8J7jPEVhsJVv57iqJa94xasP1Wu1gsaFogMFtTaFq4iniQFEb/ABNfRevn/wBqJ4nXXI9xw/vGwCRtvs2mkUs5LTy0GS84VqURtueZPjWMtI2PTlWVxBThc4jyHLbmN66ue394BO23QUxWOlB22A4vSvZTKk8BKd+NPs7V3CDwlYUEb7ivU8I7tId3Pu9NqYJFpXpxfdR78/Z7G/GYeYj9+44+dkpRuE+HjuaeNh7IkolC75lqR7yIzP8AM1gdhVtKtQr+6glQTbEgq25ElwVcOl8QibH2XNPISgu4OXG5K6+27wDf5VOrFo9pvZtjDxSAVD8TqOM/rU8oqamsS3Wu225HBAgRoo22/dNBP8K7XafGtdrlXKY4G40VpTzqz4JSNz/CsmlN2tbs9atDrwGFcK5im4m491ava/QGk9Cq0Ft0nV3Wm8amX9rvLfbHuGCysbpC/wDDT8Ep5/E1a6lT2TrMzaND7KttADk8LlunbmSpRA/QCmtVvQUUUVAVrsousex45cbxKWEMw4y3lE/lSTtWxpA9p7JJl+uFt0kxlRcuV2dQZxR/hNb7gHy94+gqwefYutj67BkGVyUkKus4pbJ8Up3J/VX6VYKtLg2OQsTxO3Y9b0gMQmQ3xbc1q/Eo+pO5rdUoKqtjGG3HFe15HROClx57kqdEf25OJUhRI+IJ2q1NeD8KI/LYlvRmlvx9+5cUndSNxsdj4biko96j+S4TieRlSr1YYMxxXVxxocf161IKT2RavzXdXoun2HWpm7PDlOkFzZDBHNXP8o6+vKkBd+zdpfPUVt2uREUf+S+QPpWje7KuALVumbdEDyDgNOFyFf5iimRcWojPlHR7Z+Z6VjXazm32uVPiXSay/HZW6FKc4grhBPtDy5U1Suh9lvTtk7PO3J9G+5SXtqk9n0E0utigpvHEPqHjIWV1JrBBuV0sUK5TrzLalSWEPKSwQlCCoA7AbdOdZSVZJbwUrbZujSRyUlXdufTxNBl2HHbFYUFFmtMOAFAJV3DQSSPUjrW0qC6b6o43nN0uFpt32iNcrf8A3iNIRwrGx4Tt57EVOqiCiiigKTXbIhrk6Jy3UJUr7NLZdUB5b8O/605aimXosWaY9fMPE5h16RGWwtAV91RHIjz2O3SrBpezXNZn6H4u4yoHu4ncr28FJUQR+lMWqz9jHI37TLv+l964mJ9vkrejtucjyOziR8wFfA1Zil6CiiioItqpmcDA8KnZDOKSWk8Mdrfm66fupHz/AEFLLsu4fPeE7VDKQp293xSlR+8HNpknqPLfw9AKi2UOP629oJOLJWr+i2MrUqUEnk8pJ2V9VeyPQGrOR2Wo7DbDDaW2m0hCEJGwSANgBVC31q1gsemiI8aTHdnXOUguMxm+WyQduJR8BvUf0h7QVkzW9iyXSEbLOd/u3eL3Q8fdB8DWf2jdI2tRbMi4W1SWMhgtkRln7ryOpbV8+h86pxYMQyu55C/Z49vkxpkB3hkKWCj7KoHqT+tJFfSOilPpXmM63QIFhyy4pmOcCWm7ltsCv3HPInwV40ysgubNmsU67vpUtqHHW+pKRuVBKSdh9KiFn2l9UG9PsS+y291Jv1ySpuKkcy0nop0/Dw9a1/ZV06cxbFl5Nem1Kv17AecLnNbTR5hJPmfvH5VUbL84v+T56vMbpEfdkfaEusMOsKLTaEndDe23Tz86mF27SOqcplSW5rEEHl+5iEFPw3rWeKvnWj1AeLGEXlwdfsbg+qdv5187puqGeTJBkScwu/eE7nZZSPpW7s2t2oMK2yLa5fTc4T6eFbUscRHMHkevhTDH0Is7Qj2mGwOjbCEfRIFZVfPi56/6lyXhLayxxhalc47LIDaPQcq3uM9qbP7SpKbmuDd2vEOo4Fn5iplMTjXxibpNrxa9RrO0RBuauKS2nklaxydQf8ydlfGrSWC6wr5ZYd4tzyXokxlLzSweqSN6pVq52hrVqTg7uPTcX+zSu8Q9Gkh8ENOJPX5jcfOp72I9RA6JGnk58uFKVSrcSd+FP+I38B1HxNW8RaaujzrbDK3nnEttoHEpSjsAPMmsa83SFaIKpk94NNp5AdVKPgAPE1HUQpuREXDIAqDaW/bagKVsVgdFPH/bWQOSrjlilMWxbkCyg8LkzbZySPEN+SfzfStHlc+xxlMYhjdp/aF4b5tJjq4fsp8XFuDp6+Jrtc8ju2VXJzHcGCY8KOe7mXYo/dNjbmhr3lfCpZh2LWvF4BjwEKW86eORJdPE6+vxUo1VVv7RmL5Bgl7x3Vy2upeucZaG7u6yjhStY5JUR5KT7B+VWRwXJbfl+JW7IrY4FRprIcA35oV+JJ9QdxWRlVjgZLjk+w3NoOxJrKmXEkdAR1HqDz+VVo7NOQTtN9U7xo7kjikMOyFKtzi/ulzbcbei07H4ir2ItVRRRWRVDsIzO/yTNUSiftyu6cXxdduJfF/5Va+qXzpLug3a1enTEqaxrIFqUV7ewGnVbn/sc/SrmsOtPsNvsuJcacSFIWk7hQI3BBrXyHel5qXh8l55eTY22kXNKf63GAAE1A/3gdPPoaYdFZFbC7HnQlzIqQWlApfYUObfPYgjw2PzB+VTTTrOExFM47kLpfgPnuoct478BPIMu7/QKPXoedZ2qOFPsyH8rxlgqkkcVwhNj+8p8VpHvgeH4h60tQYkqH9riBLsN0bONkbhO/Igjrtv8weXrW+tdWKVYrIse1aYJH/QT/6rwXiuNL+/YbarfzjJ/wDVLnTLOV2xxiwX+UXISyG4M51W5QfBl0/6VePQ03qzfGUfdwjD3f7TGbSr4xUf+qX+Y9nLTLJLqLiu1OW90/2iYa+BC/8A89BTgopohuO6W4DYrIzaIOMW5UdodXmQ4tR8SVHmTRL0r07lHd/D7Qo/9ACplRUC3l6F6VSSSvD4KSfcBT/A1gW/AtN9M8havOO2JX7ffaUxFjMuFS3Arbfkeg81GphkeSvNz/2FjzCZ95WN1Df91FT77h8PQdTWmuEmw6b2h/IcinquF4k7JW8obvPqPRttPgnfkAPnVGaY7Nracy7OJrAfYQVttlX7mInySD1V+aoyj+kGqroJMizYdxb8vZfnjy80o9a5sWKXrPboxk+fNqjW9s8dvsgOwCT0U95npyprtoQ2hLbaUoQkbJSkbADyFOKxbPbYFotzNutsVuNFZTwobQNgBWXRRUQVUbtxtos2oeF5LAIauOx3WnkT3TiSk/8AkRVuapfrjN/4udqOyYbZ1h+HanExnnEc0jhV3j6vgNuGtfHouTbnjJt8aQobF1pKyPiAaK9W0JbbS2gbJSAAPICishea/wCl1t1Twly0v8DFyj7u2+URzac26H8quhFIvs76wXPTy+HSPVbvIK4i+6gTHzybG/JCleKD+FXyq3NLbXLR3GNVbL3F0aEW5spP2W4NJHeNnyPvJ9Ksv1Qx2nEOtpdaWlaFgKSpJ3BB8Qa7VTDGs91O7ON4bxjUKG/e8SK+GLNRuooTv+BR/wBJq2WD5dj2aWFm9Y5cmZ0R0A7oV7SD5KHUGlmDe0o9T8Kdtct/KscjKWyvddygNp34t+ryE+J95P4hz603KKS4KzOsxpMLvm0IfgyEjiTvxAA/y8j5+oqeaZZy7bHY+OZFJU5GcIbt9wcVuQfBl0+fuq8enWvHUrEXcclP5JZGCu0ukquENCOLuCfvOoSOqT+JPzFQySxHciA+xIgyU8wTxJAPMDfxB6g/wIrXWurLUUotMc7Xbp0PE8ll8YkHu7VNdV7Th6hlw++B91X4h602JchiJGckyXkMstp4lrWdgkeZNZsxl6nkNzUNu17uWQTF2XEnAhtCuCbddt0MDxS37y/0FYzj10zxwtRFv2zGQdlyBuh6cPJHut+vU1q8hzMQbg3genNsam3VKOFxSOUeCnpxrV5+nWkiu+TZHZdN4TGP2CE5dchnEqaioPG8+vxccV16+dd8DwCau5oy7PZCbnkJ5ss9WIQP4UDoVfmra6b4DFxZLlwny13jIJXOXcnx7aj7qPdT6CppTQUUUVEFFYN9u9rsVseud4nMQYbKeJx55YSkCqual9om/wCcXJeE6I2uVNlPHu3bmG/ug8iUe6PzGrJol/ak1zZxCEvDcRd+2ZXOHdfufb+yBXLfl1WfAeFZXZK0edwOxO5LkbfHk11Ru4FndUZo8+Df3ieavpXj2d+z3EwqT/SvMX03vKn/AG+Nz20RlHrsT1V60/qtv1AUUUVkFFFFBrMox+zZNZn7PfbexPhPp2W06ncfEeR9aqbnejuoeit7czPR24yplqSeOTbCeNSUeIKfxp9etXFoPMbGrLgR+hfaLxbP+7s94KbDkifZciSFcKHFePAo/wADzp4DmNxSR1y7OmKagFd3tQFgyJPtIlx08KXFeHGkfxFKGxapat6C3RvHtTrVJvmOpVwM3BG6lJT5pX4j0NXJeC5igFApUAQeRB8aSWouGXHFpD11xqAZ1mfUVPQkjcwlE+0pI/E0eZKRzB5imFpxqJiOoFpRccYu7EsEbrZ4tnWz5KT1FSupLgUuP6e4hkeCS0wrqLpMlt+xcgfbjPJPEgoH4ClWx269a1eD5FNy28C06jcMJ62yfsKYiFbsS5KB7S3D5q5KSg8iDUyzXTiNdY1wfxu5SMausxhTS5MPklfENt1I6E+vWq86K6damYFq5NxfLrU/kWL39HBJuCXCtCVoG7b255pUPu+fOqp1ZDkt9zi7SMRwEmHAjq7m5Xrh2QztyLbXmvw9KnOEYlZsQtX2G0sEKWeJ99Z4nX1+KlK8TWyslqgWa3NW+2xm48dsckoG258SfMnxNZtS1BRRUD1S1cwbTmCp7IbwyJO27cNkhbyz5BI6fOoJ5SZ1t7Q+GadIct8d4Xq/EbNwoyuIJV4cah0+HWkzctRdatfJyrRp9aX8axpZ4XZyyUlSfMr/AJJpt6MdmzDcFcbu13ByK/78apUscSEK80pP8TVzOhQ2bAdXe0TdGr7qFOfx7FAviYgoBQVp/Kj/AHGrT6dYBiuAWZFrxm1MxGwkBbvDu46fNSupqTpASkJSAABsAPCuaW6CiiioCiiigKKKKAooooCsG+Wi2Xy2u227wY86I6NltPICkn61nUUFVtRey/Pst2XlWjV9kWW4oPH9hU6QhXolX8jyrDwvtMZRhlzTjWteNSob7ZCBcGmSCr8xT0UPUVbWtFmeH41mNsXbsks8W4x1AjZ1AKk+oPUVd/Rzh2XY3l9sRcccvES4x1gHdpwEp9COoNbyqoZZ2YMhxS6LyHRnLJVskoPGILzpAPjsFdD8xWBa+0bqrg5eseo2nkyfcGk8LL8dpSe8PhvsCCPUUz8FvjyG5pc6n616e6esL/bV8ZcmAHhhxiHHVHy2HT50gi/2l9aTwtNjC8eeP3ju2oo/1K/SmBpp2VMHx6Si6ZO9Iyi6AhSlyye64vPh8fnTIF5ctXdbdZ5a7Xpfjj1isyzwqnujZXD5lw8h8qmel3ZVslvnJv8AqLc3spvKjxqQ4sllKuvPfmr51YyBCiW+KiLBjMxmGxshtpASkD4CvemjHt8KHbobcOBFZix2hwoaaQEpSPQCsiiioCiiigKKKKAooooCiiigKKKKAooooCiiigK83o7DxBeYbcKenGkHb60UUHpRRRQFFFFAUUUUBRRRQFFFFAUUUUH/2Q==';
const SCHOOL_MOTTO = 'A Brightened Future';

let db = { students:[], teachers:[], exams:[], booklist:[], meanScores:[], supervisionLists:[], counters:{ adm:1, tch:1 }, examRegistry:[] };

// ── Class teacher helpers (supports multiple teachers per grade) ──
// Returns an array of teacher objects assigned to a grade.
function getClassTeachers(grade){
  return db.teachers.filter(t => {
    const grades = (t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
    return grades.includes(grade);
  });
}
// Returns primary (first) class teacher object, or null — drop-in for legacy .find()
function getClassTeacher(grade){
  return getClassTeachers(grade)[0] || null;
}
// ───────────────────────────────────────────────────────────────
function fmtTeacher(name){
  if(!name || name==='—' || name==='-') return name;
  const s = String(name).trim();
  if(!s) return s;
  if(/^Tr\.\s/i.test(s)) return s;   // already prefixed
  return 'Tr. ' + s;
}
// ───────────────────────────────────────────────────────────


/* ── Configurable rubric bands ────────────────────────────────────────
   Bands live in db.rubrics and sync like any other KV blob:
     { levels: {lp:{...}, up:{...}, js:{...}},
       exams:  { [examName]: {lp:{...}, up:{...}, js:{...}} } }
   Each band set is {e1,e2,m1,m2,a1,a2,b1} = minimum marks for that band
   (anything below b1 is B.E2). Resolution: exam override → level default →
   legacy hardcoded cutoffs. Points stay 8..1 by band order. */
const RUBRIC_LEGACY = { e1: 90, e2: 75, m1: 58, m2: 40, a1: 30, a2: 21, b1: 11 };
function rubLevelOf(grade){
  const c = String(grade || '').charAt(0);
  if('123'.includes(c)) return 'lp';
  if('456'.includes(c)) return 'up';
  if('789'.includes(c)) return 'js';
  return null;
}
/* Exam name for live class-grid previews (falls back to single-entry flow). */
function _gridExamName(){
  try{
    const el = document.getElementById('ex_examName');
    if(el && el.value) return el.value;
    if(typeof _ssExamName !== 'undefined' && _ssExamName) return _ssExamName;
  }catch(e){}
  return '';
}
function rubBandsFor(grade, examName){
  const lv = rubLevelOf(grade);
  try{
    const R = (typeof db !== 'undefined' && db && db.rubrics) || null;
    if(R && lv){
      const ov = R.exams && examName && R.exams[examName] && R.exams[examName][lv];
      if(ov && typeof ov === 'object') return Object.assign({}, RUBRIC_LEGACY, ov);
      const df = R.levels && R.levels[lv];
      if(df && typeof df === 'object') return Object.assign({}, RUBRIC_LEGACY, df);
    }
  }catch(e){}
  return Object.assign({}, RUBRIC_LEGACY);
}
function getRubric(score, grade, examName) {
  // 8-point scale: EE1=8, EE2=7, ME1=6, ME2=5, AE1=4, AE2=3, BE1=2, BE2=1
  const b = rubBandsFor(grade, examName);
  const num = function(v, fb){
    const n = parseFloat(v);
    return (isFinite(n) && n > 0) ? n : fb;
  };
  const e1 = num(b.e1, 90), e2 = num(b.e2, 75), m1 = num(b.m1, 58),
        m2 = num(b.m2, 40), a1 = num(b.a1, 30), a2 = num(b.a2, 21),
        b1 = num(b.b1, 11);
  if(score>=e1) return {code:'E.E1',class:'EE1',pts:8};
  if(score>=e2) return {code:'E.E2',class:'EE2',pts:7};
  if(score>=m1) return {code:'M.E1',class:'ME1',pts:6};
  if(score>=m2) return {code:'M.E2',class:'ME2',pts:5};
  if(score>=a1) return {code:'A.E1',class:'AE1',pts:4};
  if(score>=a2) return {code:'A.E2',class:'AE2',pts:3};
  if(score>=b1) return {code:'B.E1',class:'BE1',pts:2};
  return {code:'B.E2',class:'BE2',pts:1};
}

/* Rubric display with live fallback: stored rubrics win, otherwise compute
   from the score (same scale the PDF exports use). Guarantees a rubric
   shows for every scored subject even if the stored entry lacks one. */
function _rubricTag(e, s){
  const rb = (e.rubrics && e.rubrics[s]) ||
    ((e.scores && e.scores[s]!==undefined && typeof getRubric==='function') ? getRubric(e.scores[s], e.grade, e.examName) : null);
  return rb ? '<span class="rubric-tag ' + rb.class + '">' + rb.code + '</span>' : '—';
}

/* ═══ DB ═══ */
function loadDB() {
  // If the LAN sync engine has already populated window.db from the server,
  // use that directly (server is source of truth). Otherwise fall back to
  // localStorage / __db_embed__ so the app still works standalone.
  let source = null;
  if(window.db && window.db.students && window.db.students.length > 0){
    // Server data already in window.db — just normalise and use it
    db = window.db;
  } else {
    source = localStorage.getItem('santapris_db_v2');
    if(!source){
      const emb = document.getElementById('__db_embed__');
      if(emb && emb.textContent.trim()) source = emb.textContent.trim();
    }
    if(source){
      try{ db = JSON.parse(source); }catch(e){ console.error('DB load error',e); }
    }
  }
  db.students          = db.students||[];
  db.exams             = db.exams||[];
  db.rawScores         = db.rawScores||[];
  db.archivedExams     = db.archivedExams||[];
  db.archivedRaw       = db.archivedRaw||[];
  db.teachers          = (db.teachers||[]).map(t=>({...t, assignments:Array.isArray(t.assignments)?t.assignments:[]}));
  db.booklist          = db.booklist||[];
  db.meanScores        = db.meanScores||[];
  db.supervisionLists  = db.supervisionLists||[];
  db.calendarEvents    = db.calendarEvents||[];
  db.attendance        = db.attendance||{};
  db.fees              = db.fees||{};
  db.comms             = db.comms||[];
  if(!Array.isArray(db.examRegistry)) db.examRegistry=[];
  if(!db.counters)     db.counters={adm:1,tch:1};
  if(!db.counters.tch) db.counters.tch=1;
  if(!db.counters.adm) db.counters.adm=1;
  ensureExamCodes();
  window.db = db;  // keep window.db and db in sync
  updateCounts();
}
// Deterministic short code for an exam, e.g. "MID-TERM-EXAM-T1-2025".
// Same exam name+term+year always produces the same code, so this can be
// computed on the fly for old records (no migration needed) and reused
// for every new record of that same exam.
function examCode(examName, term, year){
  const slug = (examName||'Untitled Exam').trim().toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const termNum = (String(term||'').match(/\d+/)||[''])[0];
  return `${slug}-T${termNum||'?'}-${year||'????'}`;
}
// Backfills examCode onto every exam record that doesn't already have one —
// covers records saved before this feature existed, as well as anything
// pulled in fresh from the server.
function ensureExamCodes(){
  (db.exams||[]).forEach(e=>{
    if(!e.examCode) e.examCode = examCode(e.examName, e.term, e.year);
  });
}
function saveDB() {
  const json = JSON.stringify(db);
  localStorage.setItem('santapris_db_v2', json);
  // Write the embed copy asynchronously — doing it as a giant textContent on
  // every save churns the DOM + GC and janks phones. exportPortableHTML() also
  // re-serialises its own embed block, and boot() only reads this fallback when
  // localStorage is empty, so a trailing write is always sufficient.
  _scheduleEmbedWrite(json);
  // Persist to server when running via LAN server (injected script patches this).
  // Fallback: if the sync hook isn't installed yet, queue through the engine
  // handle directly so the save is still marked unsent (outbox) and pushed.
  if(typeof window.__serverSaveDB === 'function') window.__serverSaveDB();
  else if(window.__syncApi && typeof window.__syncApi.push === 'function'){
    try{ window.__syncApi.push(); }catch(e){}
  }
  updateCounts();
}

var _embedTimer = null;
var _lastEmbedJson = null;
function _scheduleEmbedWrite(json){
  _lastEmbedJson = json;
  if(_embedTimer) return;
  _embedTimer = setTimeout(function(){
    _embedTimer = null;
    const emb = document.getElementById('__db_embed__');
    if(emb && _lastEmbedJson !== null){
      const safe = _lastEmbedJson.replace(/&/g,'\\u0026').replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
      emb.textContent = safe;
    }
  }, 400);
}

/* ═══ NAVIGATION ═══ */
function showPage(pageId, navEl) {
  // NOTE: non-admin users may open and VIEW every page; the admin-only
  // enforcement lives in applyRoleMode(), which blocks the mutating /
  // exporting / importing / printing / generating / deleting actions themselves.
  const dashEl = document.getElementById('page-dashboard');

  if(pageId === 'dashboard'){
    // Close everything (modal pages + secondary overlays) then show dashboard
    _closeAllOverlays();
    try{ document.body.classList.remove('page-open'); }catch(e){}
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(navEl) navEl.classList.add('active');
    if(dashEl) dashEl.classList.add('active');
    renderDashboard();
    try{ window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }catch(e){}
    _syncMobTab('dashboard');
    _applyMobFullscreen('dashboard');
    return;
  }

  // Close everything before opening the new page
  _closeAllOverlays();

  // Hide dashboard when a page is open so it doesn't bleed through
  if(dashEl) dashEl.classList.remove('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if(navEl) navEl.classList.add('active');

  const el = document.getElementById('page-'+pageId);
  if(!el){ console.warn('Missing page:', pageId); return; }
  el.classList.add('open');
  el.scrollTop = 0;
  // Full-page takeover: lock background scroll + guarantee a way back home
  try{ document.body.classList.add('page-open'); }catch(e){}
  _ensureHomeBtn(el);
  // Every page opens at the top (window + document, for phone scrolling)
  try{ window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }catch(e){}
  _syncMobTab(pageId);
  _applyMobFullscreen(pageId);

  // Run any render functions needed for this page
  if(pageId==='students')       renderStudentsTable();
  if(pageId==='teachers')       renderTeachersTable();
  if(pageId==='exams')          renderExamsTable();
  if(pageId==='classLists')     renderClassList();
  if(pageId==='reports')        renderReports();
  if(pageId==='booklist')       { try{ if(typeof initTeacherBooks==='function') initTeacherBooks(); else blModMissing('tb_view', 'Teacher Booklist'); }catch(err){ blModMissing('tb_view', 'Teacher Booklist', err); } }
  if(pageId==='subjectAnalysis'){ populateAnalysisExamDropdowns(); renderSubjectAnalysis(); }
  if(pageId==='timetable'){ initTimetablePage(); }
  if(pageId==='classTeachers')  renderClassTeachersPage();
  if(pageId==='supervision')    renderSupervisionPage();
  if(pageId==='editScores')     renderEditScoresTable();
  if(pageId==='addStudent' && !editingStudentId) previewAdm();
  if(pageId==='addExam'){
    // Always reset the form so teacher starts fresh each time
    if(typeof ssReset === 'function') ssReset();
    const gradeEl  = document.getElementById('ex_gradeFilter');
    const examEl   = document.getElementById('ex_examName');
    const termEl   = document.getElementById('ex_term');
    const yearEl   = document.getElementById('ex_year');
    if(gradeEl)  gradeEl.value  = '';
    if(examEl)   examEl.value   = '';
    if(termEl)   termEl.value   = 'Term 1';
    if(yearEl)   yearEl.value   = new Date().getFullYear();
    // Hide entry card and empty state correctly
    const entryCard = document.getElementById('ex_classEntryCard');
    const emptyState = document.getElementById('ex_emptyState');
    const chips      = document.getElementById('ex_subjectChips');
    const loadGroup  = document.getElementById('ex_loadExistingGroup');
    if(entryCard)  entryCard.style.display  = 'none';
    if(emptyState) emptyState.style.display = '';
    if(chips)      chips.style.display      = 'none';
    if(loadGroup)  loadGroup.style.display  = 'none';
    // Reset excel import section too
    resetExamImport && resetExamImport();
    _exActiveSubjects = new Set();
    onExamSetupChange();
  }
  if(pageId==='exports')        populatePDFDropdowns();
  if(pageId==='topStudents')    renderTopStudentsPage();
  if(pageId==='addTeacher')     { if(!_editingTeacherId) renderTeacherForm(); }
  if(pageId==='scoreEntry'){ if(typeof initScoreEntry==='function') initScoreEntry(); }
  if(pageId==='letters'){ if(typeof initLettersPage==='function') initLettersPage(); }
  if(pageId==='booklists'){ try{ if(typeof initBooklistPage==='function') initBooklistPage(); else blModMissing('bl_view', 'Learners Booklist'); }catch(err){ blModMissing('bl_view', 'Learners Booklist', err); } }
  if(pageId==='hallOfFame')     { populateHofExams(); renderHallOfFame(); }
  if(pageId==='performanceHeatmap') { populateHmExams(); renderHeatmap(); }
  if(pageId==='gradeTrends')    { populateGtDropdowns(); renderGradeTrends(); }
  if(pageId==='mostImproved')   { populateMiDropdowns(); renderMostImproved(); }
  if(pageId==='genderAnalysis') { populateGaDropdowns(); renderGenderAnalysis(); }
  if(pageId==='rubricDistribution') { populateRdDropdowns(); renderRubricDist(); }
  if(pageId==='academicCalendar')   renderCalendar();
  if(pageId==='attendance')     { populateAttDropdowns(); renderAttendance(); }
  if(pageId==='feeTracker')     { populateFeeDropdowns(); renderFeeTracker(); }
  if(pageId==='parentComms')    renderParentComms();
  if(pageId==='messageGen')     { populateMsgDropdowns(); }
  if(pageId==='teacherWorkload') renderTeacherWorkload();
  if(pageId==='studentProgress') {} // opened programmatically
}

// Displayed inside a booklist page when its feature module failed to load
// (stale cache, offline portable copy, interrupted download) or its init
// threw. Without this the page opens with only its header and looks
// mysteriously "empty". `detail` (Error or string) is shown verbatim so the
// exact cause can be reported back.
function blModMissing(viewId, label, detail){
  var box = document.getElementById(viewId);
  if(!box) return;
  var d = '';
  try{ d = (detail && detail.stack) || (detail && detail.message) || detail || ''; }catch(e){}
  box.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div>' +
    '<p><strong>' + label + ' module did not load.</strong></p>' +
    (d ? '<p style="font-size:11px;color:var(--rose);word-break:break-word">Error: ' +
      String(d).replace(/[<>&]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c]; }).slice(0, 400) + '</p>' : '') +
    '<p style="font-size:12px">Your data is safe. Please hard-refresh the page (Ctrl+F5 on PC) ' +
    'while connected to the school server, then reopen ' + label + '.</p></div>';
}

// Every full-page view gets an explicit way back to the dashboard: a
// "← Dashboard" button prepended to its header actions (floating top-left
// when a page has no actions row). Injected once per page, PC and phone.
function _ensureHomeBtn(pageEl){
  if(!pageEl || pageEl.querySelector('[data-home-btn]')) return;
  const btn = document.createElement('button');
  btn.setAttribute('data-home-btn', '1');
  btn.className = 'home-back-btn';
  btn.type = 'button';
  btn.title = 'Back to dashboard';
  btn.textContent = '← Dashboard';
  btn.addEventListener('click', function(ev){ ev.stopPropagation(); closeModal(); });
  const actions = pageEl.querySelector('.page-header .page-actions');
  if(actions && actions.firstChild) actions.insertBefore(btn, actions.firstChild);
  else if(actions) actions.appendChild(btn);
  else { btn.classList.add('home-back-float'); pageEl.appendChild(btn); }
}
// Esc leaves a full-page view back to the dashboard (never while typing).
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape' && e.key !== 'Esc') return;
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
  if(document.querySelector('.modal-page.open')) closeModal();
});
function _closeAllOverlays(){
  document.querySelectorAll('.modal-page.open').forEach(p => p.classList.remove('open'));
  const overlayIds = [
    'meanScoresModal', 'deleteGradeModal', 'deleteExamModal',
    'teacherImportModal', 'importModal', 'imgImportModal', 'marksheetTemplateModal'
  ];
  overlayIds.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
}

function closeModal(){
  _closeAllOverlays();
  try{ document.body.classList.remove('page-open'); }catch(e){}

  // Reset nav highlight — dashboard becomes active again
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const dashNav = document.querySelector(".nav-item[onclick*=\"'dashboard'\"]");
  if(dashNav) dashNav.classList.add('active');

  // Restore dashboard visibility
  const dashEl = document.getElementById('page-dashboard');
  if(dashEl) dashEl.classList.add('active');
  renderDashboard();
}

function toast(msg, isError=false) {
  const t=document.getElementById('toast'), m=document.getElementById('toastMsg');
  if(!m || !t) return;
  m.textContent=msg;
  t.style.borderColor=isError?'var(--rose)':'var(--emerald)';
  t.style.color=isError?'var(--rose)':'var(--emerald)';
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000);
}

/* ── Dirty tracking for score inputs ──────────────────────────────────
   Distinguishes user-TYPED values (fresh raw marks) from pre-filled /
   converted displays. Raw collection and % conversion apply to typed (or
   brand-new) values only — re-saving an untouched record can never
   double-convert it, and converted displays are never mislabeled as raw.
   Programmatic sets (.value=, innerHTML renders) never fire `input`. */
document.addEventListener('input', function(e){
  const t = e.target;
  if(t && t.matches && t.matches('.score-input-cell, input[id^="ss_inp_"], input[id^="es_sc_"], input[id^="se_inp_"], input[id^="se_raw_"]')){
    t.dataset.dirty = '1';
  }
});
function _inputDirty(el){ return !!(el && el.dataset && el.dataset.dirty === '1'); }

/* ═══ STUDENTS ═══ */
let editingStudentId = null;

function previewAdm() {
  // Admission No field removed from student form — internal IDs still auto-generated on save
}

async function saveStudent() {
  const first=document.getElementById('s_first').value.trim();
  const last=document.getElementById('s_last').value.trim();
  const grade=document.getElementById('s_grade').value;
  const gender=document.getElementById('s_gender').value;
  const parent=document.getElementById('s_parent').value.trim();
  const phone=document.getElementById('s_phone').value.trim();
  const nemis=document.getElementById('s_nemis').value.trim();
  const assessment=document.getElementById('s_assessment').value.trim();
  if(!first||!last||!grade||!gender) return toast('\u26a0\ufe0f Name, Class, and Gender are required',true);

  // \u2500\u2500 Duplicate detection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const normNew = (first+' '+last).toLowerCase().replace(/\s+/g,' ').trim();
  const dupCheck = db.students.find(s =>
    s.grade === grade &&
    s.admNo !== editingStudentId &&
    (s.fullName||'').toLowerCase().replace(/\s+/g,' ').trim() === normNew
  );
  if(dupCheck) return toast(`\u26a0\ufe0f "${first} ${last}" already exists in ${grade} (${dupCheck.admNo})`, true);

  // \u2500\u2500 Build student record \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  let admNo = editingStudentId;
  const existingDateAdded = editingStudentId
    ? ((db.students.find(s=>s.admNo===editingStudentId)||{}).dateAdded || new Date().toLocaleDateString('en-GB'))
    : new Date().toLocaleDateString('en-GB');
  if(!admNo){
    admNo='SNT'+String(db.counters.adm).padStart(3,'0');
  }
  const student = {admNo,first,last,fullName:first+' '+last,grade,gender,parent,phone,nemis,assessment,dateAdded:existingDateAdded};

  // \u2500\u2500 Disable button while saving \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const btn = document.getElementById('btnSaveStudent');
  const origText = btn ? btn.textContent : '';
  if(btn){ btn.textContent='\u23f3 Saving\u2026'; btn.disabled=true; }

  try {
    const resp = await fetch('/api/students', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(student)
    });
    const result = await resp.json();
    if(result.ok){
      // Update local memory so UI is immediately responsive
      if(editingStudentId){
        const idx=db.students.findIndex(s=>s.admNo===editingStudentId);
        if(idx!==-1) Object.assign(db.students[idx], student);
      } else {
        db.students.push(student);
        db.counters.adm++;
      }
      saveDB(); // update localStorage cache (does NOT need to re-push — server already saved)
      const msg = editingStudentId ? '\u2705 Student Updated' : '\u2705 Registered: '+first+' '+last;
      toast(msg);
      clearStudentForm();
      if(editingStudentId) showPage('students',null);
      previewAdm();
      renderStudentsTable();
    } else {
      toast('\u274c Save failed: '+(result.error||'Server error'), true);
    }
  } catch(e) {
    toast('\u274c Network error \u2014 check server connection', true);
    console.error('[saveStudent]', e);
  } finally {
    if(btn){ btn.textContent=origText; btn.disabled=false; }
  }
}

function editStudent(admNo) {
  editingStudentId=admNo;
  const s=db.students.find(x=>x.admNo===admNo); if(!s) return;
  document.getElementById('s_first').value=s.first||'';
  document.getElementById('s_last').value=s.last||'';
  document.getElementById('s_gender').value=s.gender||'';
  document.getElementById('s_grade').value=s.grade||'';
  document.getElementById('s_nemis').value=s.nemis||'';
  document.getElementById('s_assessment').value=s.assessment||'';
  document.getElementById('s_parent').value=s.parent||'';
  document.getElementById('s_phone').value=s.phone||'';
  document.getElementById('formTitle').textContent='✏️ Edit Student';
  document.getElementById('formSub').textContent='Editing '+s.fullName;
  document.getElementById('btnSaveStudent').textContent='💾 Update Student';
  showPage('addStudent',null);
}

function clearStudentForm() {
  editingStudentId=null;
  ['s_first','s_last','s_parent','s_phone','s_nemis','s_assessment','s_gender','s_grade'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('formTitle').textContent='➕ Add Student';
  document.getElementById('formSub').textContent='Register new student';
  document.getElementById('btnSaveStudent').textContent='✅ Register Student';
}

function renderStudentsTable() {
  const search=document.getElementById('stuSearch').value.toLowerCase();
  const grade=document.getElementById('stuGradeF').value;
  const filtered=db.students.filter(s=>(!grade||s.grade===grade)&&(
    s.fullName.toLowerCase().includes(search)||
    (s.nemis&&s.nemis.toLowerCase().includes(search))||
    (s.admNo&&s.admNo.toLowerCase().includes(search))
  ));
  document.getElementById('stuSubtitle').innerText=filtered.length+' students found';
  const tbody=document.getElementById('stuTBody');
  if(!filtered.length){tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">👨‍🎓</div><p>No students found.</p></div></td></tr>`;return;}
  tbody.innerHTML=filtered.map((s,i)=>`<tr>
    <td style="color:var(--text-muted)">${i+1}</td>
    <td>${s.gender==='Male'?'👦':'👧'}</td>
    <td style="font-weight:600">${s.fullName}</td>
    <td><span class="badge badge-blue">${s.grade}</span></td>
    <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${s.nemis||'-'}</td>
    <td>${s.parent||'-'}</td>
    <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${s.phone||'-'}</td>
    <td style="display:flex;gap:4px">
      <button class="btn btn-sm btn-ghost" onclick="openStudentProfile('${s.admNo}')" title="View Profile">👤</button>
      <button class="btn btn-sm btn-ghost" onclick="openStudentProgress('${s.admNo}')" title="View Progress" style="color:var(--sky)">📈</button>
      <button class="btn btn-sm btn-ghost" onclick="editStudent('${s.admNo}')">✏️</button>
      <button class="btn btn-sm btn-danger" onclick="delStudent('${s.admNo}')">🗑</button>
    </td>
  </tr>`).join('');
}
async function delStudent(admNo){
  if(!confirm('Delete student '+admNo+'?')) return;
  try{
    const resp = await fetch('/api/students/'+encodeURIComponent(admNo), {method:'DELETE'});
    const result = await resp.json();
    if(result.ok){
      db.students=db.students.filter(s=>s.admNo!==admNo);
      db.exams=db.exams.filter(e=>e.admNo!==admNo);
      recalcRanks(); saveDB(); renderStudentsTable(); toast('Deleted');
    } else { toast('❌ Delete failed: '+(result.error||''), true); }
  } catch(e){ toast('❌ Network error', true); console.error('[delStudent]',e); }
}

/* ═══════════════════════════════════════════════════════════
   TEACHERS — ALL BUGS FIXED HERE
   ═══════════════════════════════════════════════════════════ */
let currentTeacherAssignments = [];

// Called every time the Add Teacher page is opened — rebuilds checkboxes cleanly
function renderTeacherForm() {
  const container = document.getElementById('t_classCheckboxes');
  if (container) {
    container.innerHTML = ALL_GRADES.map(g=>
      `<label class="checkbox-item" id="tcb_lbl_${g}" style="transition:background 0.15s"><input type="checkbox" value="${g}" id="tcb_${g}" onchange="onTeacherClassCheck('${g}')"> ${g}</label>`
    ).join('');
  }
  currentTeacherAssignments = [];
  updateAssignmentListUI();
}

// Called when subject dropdown changes — pre-check classes already assigned to this subject
function onTeacherSubjectChange() {
  const subj = document.getElementById('t_subj').value;
  const hint = document.getElementById('t_subjHint');
  const container = document.getElementById('t_classCheckboxes');

  // Rebuild checkboxes with stable IDs for green/red styling
  if(container){
    container.innerHTML = ALL_GRADES.map(g=>
      `<label class="checkbox-item" id="tcb_lbl_${g}" style="transition:background 0.15s,border 0.15s">` +
      `<input type="checkbox" value="${g}" id="tcb_${g}" onchange="onTeacherClassCheck('${g}')"> ${g}` +
      `</label>`
    ).join('');
  }

  // Reset all to unchecked/unstyled
  ALL_GRADES.forEach(g=>{
    const cb = document.getElementById('tcb_'+g);
    const lb = document.getElementById('tcb_lbl_'+g);
    if(cb) cb.checked=false;
    if(lb) lb.removeAttribute('style'); lb && (lb.style.transition='background 0.15s,border 0.15s');
  });

  if(!subj){ if(hint) hint.style.display='none'; return; }

  // Look up existing assignment for this subject
  const existing = currentTeacherAssignments.find(a => a.subject===subj);
  if(existing && existing.classes.length){
    existing.classes.forEach(g=>{
      const cb = document.getElementById('tcb_'+g);
      const lb = document.getElementById('tcb_lbl_'+g);
      if(cb){ cb.checked=true; }
      if(lb){ lb.style.cssText='transition:background 0.15s,border 0.15s;background:rgba(0,200,120,0.2);border:1.5px solid #00c878;border-radius:6px;padding:2px 7px;color:#00a060;font-weight:700'; }
    });
    if(hint){
      hint.style.display='';
      hint.innerHTML='<span style="color:#00c878">✅ <strong>'+subj+'</strong> assigned to: <span style="color:var(--gold)">'+existing.classes.join(', ')+'</span></span>' +
        '<br><span style="font-size:10px;color:var(--text-muted)">Green = currently assigned. Uncheck to remove, then click <strong>Add / Update Subject</strong>.</span>';
    }
  } else {
    if(hint){
      hint.style.display='';
      hint.innerHTML='<span style="color:var(--text-muted)">No classes assigned for <strong>'+subj+'</strong> yet. Tick the classes below and click <strong>Add / Update Subject</strong>.</span>';
    }
  }
}

function onTeacherClassCheck(grade){
  const cb = document.getElementById('tcb_'+grade);
  const lb = document.getElementById('tcb_lbl_'+grade);
  if(!cb||!lb) return;
  if(cb.checked){
    lb.style.cssText='transition:background 0.15s,border 0.15s;background:rgba(0,200,120,0.2);border:1.5px solid #00c878;border-radius:6px;padding:2px 7px;color:#00a060;font-weight:700';
  } else {
    lb.style.cssText='transition:background 0.15s,border 0.15s;background:rgba(255,78,106,0.1);border:1.5px solid rgba(255,78,106,0.5);border-radius:6px;padding:2px 7px;color:var(--rose)';
  }
}

function addAssignment() {
  const subj = document.getElementById('t_subj').value;
  const checked = Array.from(document.querySelectorAll('#t_classCheckboxes input:checked')).map(cb=>cb.value);
  if(!subj) return toast('⚠️ Select a subject',true);

  if(!checked.length){
    const existIdx = currentTeacherAssignments.findIndex(a=>a.subject===subj);
    if(existIdx>=0){
      currentTeacherAssignments.splice(existIdx,1);
      toast('Removed '+subj+' from assignments');
    } else {
      toast('⚠️ Select at least one class',true); return;
    }
  } else {
    const existIdx = currentTeacherAssignments.findIndex(a=>a.subject===subj);
    if(existIdx>=0){ currentTeacherAssignments[existIdx].classes=checked.sort(); }
    else { currentTeacherAssignments.push({subject:subj,classes:checked.sort()}); }
  }

  // Reset subject selector and rebuild clean checkboxes
  document.getElementById('t_subj').value='';
  const container=document.getElementById('t_classCheckboxes');
  if(container) container.innerHTML=ALL_GRADES.map(g=>
    `<label class="checkbox-item" id="tcb_lbl_${g}" style="transition:background 0.15s"><input type="checkbox" value="${g}" id="tcb_${g}" onchange="onTeacherClassCheck('${g}')"> ${g}</label>`
  ).join('');
  const hint=document.getElementById('t_subjHint');
  if(hint) hint.style.display='none';
  updateAssignmentListUI();
}

function removeAssignment(i) { currentTeacherAssignments.splice(i,1); updateAssignmentListUI(); }

function updateAssignmentListUI() {
  const list = document.getElementById('t_assignmentList');
  if(!list) return;
  if(!currentTeacherAssignments.length){
    list.innerHTML='<div style="color:var(--text-muted);font-size:12px;text-align:center;padding-top:10px">No subjects added yet.</div>';
    return;
  }
  list.innerHTML = currentTeacherAssignments.map((a,i)=>`
    <div class="assignment-list-item">
      <div class="assignment-text"><span class="assignment-subj">${a.subject}</span><span style="color:var(--text-secondary)"> in </span><span>${a.classes.join(', ')}</span></div>
      <button class="btn btn-danger btn-sm" style="padding:2px 6px;font-size:10px" onclick="removeAssignment(${i})">✕</button>
    </div>`).join('');
}

// FIX 1: addTeacher correctly saves to db.teachers, shows success, updates counts
let _editingTeacherId = null;

async function saveTeacherForm() {
  const name  = document.getElementById('t_name').value.trim();
  const phone = document.getElementById('t_phone').value.trim();
  const ctSel  = document.getElementById('t_classTeacher');
  const ct     = ctSel ? [...ctSel.selectedOptions].map(o=>o.value).filter(Boolean).join(',') : '';
  if(!name) return toast('\u26a0\ufe0f Teacher name is required',true);
  const assignments = currentTeacherAssignments.map(a=>({subject:a.subject,classes:[...a.classes]}));

  // \u2500\u2500 Build teacher record \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  let teacherId = _editingTeacherId;
  if(!teacherId){
    if(!db.counters.tch) db.counters.tch=1;
    teacherId='TCH'+String(db.counters.tch).padStart(3,'0');
  }
  // Duplicate name check (new teachers only)
  if(!_editingTeacherId && db.teachers.some(t=>t.name.toUpperCase()===name.toUpperCase()))
    return toast('\u26a0\ufe0f Teacher "'+name+'" already exists',true);

  const teacher = {id:teacherId, name, phone, assignments, classTeacher:ct};

  // \u2500\u2500 Disable button while saving \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const saveBtn = document.getElementById('btnSaveTeacher') || document.querySelector('[onclick*="saveTeacherForm"]');
  const origTxt = saveBtn ? saveBtn.textContent : '';
  if(saveBtn){ saveBtn.textContent='\u23f3 Saving\u2026'; saveBtn.disabled=true; }

  try {
    const resp = await fetch('/api/teachers', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(teacher)
    });
    const result = await resp.json();
    if(result.ok){
      if(_editingTeacherId){
        const idx = db.teachers.findIndex(t=>t.id===_editingTeacherId);
        if(idx>=0){
          db.teachers[idx] = {id:teacherId, name, phone, assignments, classTeacher:ct, _preloaded:false};
          db.teachers = db.teachers.filter((t,i)=> i===idx || t.name.toUpperCase()!==name.toUpperCase());
        }
        toast('\u2705 Teacher updated: '+name);
        saveDB(); updateCounts();
        clearTeacherForm();
        showPage('teachers',null);
      } else {
        db.counters.tch++;
        db.teachers.push({id:teacherId, name, phone, assignments, classTeacher:ct});
        toast('\u2705 Teacher Registered: '+name);
        saveDB();
        clearTeacherForm();
      }
    } else {
      toast('\u274c Save failed: '+(result.error||'Server error'), true);
    }
  } catch(e) {
    toast('\u274c Network error \u2014 check server connection', true);
    console.error('[saveTeacherForm]', e);
  } finally {
    if(saveBtn){ saveBtn.textContent=origTxt; saveBtn.disabled=false; }
  }
}
// Keep addTeacher as alias for backwards compat
function addTeacher(){ saveTeacherForm(); }

function clearTeacherForm() {
  _editingTeacherId=null;
  ['t_name','t_phone'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const ct=document.getElementById('t_classTeacher');
  if(ct){ [...ct.options].forEach(o=>o.selected=false); }
  const subjEl=document.getElementById('t_subj'); if(subjEl) subjEl.value='';
  const hint=document.getElementById('t_subjHint'); if(hint) hint.style.display='none';
  currentTeacherAssignments=[];
  updateAssignmentListUI();
  const container=document.getElementById('t_classCheckboxes');
  if(container) container.innerHTML=ALL_GRADES.map(g=>
    `<label class="checkbox-item" id="tcb_lbl_${g}" style="transition:background 0.15s"><input type="checkbox" value="${g}" id="tcb_${g}" onchange="onTeacherClassCheck('${g}')"> ${g}</label>`
  ).join('');
  const titleEl=document.getElementById('addTeacherPageTitle');
  if(titleEl) titleEl.textContent='👩‍🏫 Add Teacher';
  const btnEl=document.getElementById('btnSaveTeacher');
  if(btnEl) btnEl.textContent='✅ Register Teacher';
}

function editTeacher(id) {
  const t=db.teachers.find(x=>x.id===id);
  if(!t) return;
  // Set editing state BEFORE showPage so showPage doesn't reset the form
  _editingTeacherId=id;
  // Populate form fields
  document.getElementById('t_name').value=t.name||'';
  document.getElementById('t_phone').value=t.phone||'';
  const ctEl=document.getElementById('t_classTeacher');
  if(ctEl){
    const assignedGrades=new Set((t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean));
    [...ctEl.options].forEach(o=>{ o.selected=assignedGrades.has(o.value); });
  }
  // Load assignments
  currentTeacherAssignments=(t.assignments||[]).map(a=>({subject:a.subject,classes:[...a.classes]}));
  // Build checkboxes with new IDs
  const container=document.getElementById('t_classCheckboxes');
  if(container) container.innerHTML=ALL_GRADES.map(g=>
    `<label class="checkbox-item" id="tcb_lbl_${g}" style="transition:background 0.15s"><input type="checkbox" value="${g}" id="tcb_${g}" onchange="onTeacherClassCheck('${g}')"> ${g}</label>`
  ).join('');
  // Reset subject dropdown + hint
  const subjEl=document.getElementById('t_subj'); if(subjEl) subjEl.value='';
  const hint=document.getElementById('t_subjHint'); if(hint) hint.style.display='none';
  // Update assignment list display
  updateAssignmentListUI();
  // Update UI labels
  const titleEl=document.getElementById('addTeacherPageTitle');
  if(titleEl) titleEl.textContent='✏️ Edit: '+fmtTeacher(t.name);
  const btnEl=document.getElementById('btnSaveTeacher');
  if(btnEl) btnEl.textContent='💾 Update Teacher';
  // showPage AFTER everything is set (_editingTeacherId is set, so renderTeacherForm won't fire)
  showPage('addTeacher',null);
}

function renderTeachersTable() {
  const tbody=document.getElementById('tchTBody');
  if(!tbody) return;
  if(!db.teachers||!db.teachers.length){
    tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👩‍🏫</div><p>No teachers registered yet.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML=db.teachers.map((t,i)=>{
    const assignments=Array.isArray(t.assignments)?t.assignments:[];
    let assignHTML='';
    if(assignments.length){
      assignHTML=assignments.map(a=>{
        const cls=Array.isArray(a.classes)?a.classes.join(', '):(a.classes||'');
        return `<div style="margin-bottom:3px"><span class="badge badge-blue" style="margin-right:4px;font-size:10px">${a.subject||''}</span><span style="font-size:11px;color:var(--text-secondary)">${cls}</span></div>`;
      }).join('');
    } else {
      assignHTML='<span style="font-size:12px;color:var(--text-muted)">No subjects assigned</span>';
    }
    const _ctGrades=(t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
    const ctBadge=_ctGrades.length?_ctGrades.map(g=>`<span class="badge badge-gold" style="margin:1px">${g}</span>`).join(''):'<span style="color:var(--text-muted)">—</span>';
    const preTag=t._preloaded?`<span style="font-size:9px;color:var(--gold);background:rgba(242,199,68,0.1);border:1px solid rgba(242,199,68,0.3);border-radius:4px;padding:1px 5px;margin-left:5px">2026</span>`:'';
    return `<tr>
      <td style="color:var(--text-muted)">${i+1}</td>
      <td><span class="adm-badge">${t.id||'—'}</span></td>
      <td style="font-weight:600">${t.name}${preTag}</td>
      <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${t.phone||'—'}</td>
      <td>${assignHTML}</td>
      <td>${ctBadge}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" style="margin-right:4px" onclick="editTeacher('${t.id}')" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="delTeacher('${t.id}')" title="Delete">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

async function delTeacher(id){
  const t=db.teachers.find(x=>x.id===id);
  if(!t) return;
  const label=t._preloaded?`"${fmtTeacher(t.name)}" (2026 allocation)`:`"${fmtTeacher(t.name)}"`;
  if(!confirm(`Delete teacher ${label}?\nThis cannot be undone.`)) return;
  try{
    const resp = await fetch('/api/teachers/'+encodeURIComponent(id), {method:'DELETE'});
    const result = await resp.json();
    if(result.ok){
      db.teachers=db.teachers.filter(x=>x.id!==id);
      saveDB(); renderTeachersTable(); toast('Teacher removed');
    } else { toast('\u274c Delete failed: '+(result.error||''), true); }
  } catch(e){ toast('\u274c Network error', true); console.error('[delTeacher]',e); }
}

/* ═══ CLASS BATCH EXAM ENTRY ═══ */

let _exActiveSubjects = new Set(); // which subjects are "active" for entry


/* ════════════════════════════════════════════════════════════════════════
   INDIVIDUAL STUDENT SCORE SEARCH — ssXxx() namespace
   ═════════════════════════════════════════════════════════════════════ */

/* Internal state */
var _ssStudent   = null;   // currently selected student object
var _ssExamName  = '';     // chosen exam name
var _ssTerm      = 'Term 1';
var _ssYear      = new Date().getFullYear();

/* ── Dropdown search ──────────────────────────────────────────────── */
/* ── Ensure a single body-level dropdown exists ───────────────────── */
function _ssGetOrCreateDropdown(){
  var dd = document.getElementById('ss_dropdown');
  if(!dd){
    dd = document.createElement('div');
    dd.id = 'ss_dropdown';
    dd.style.cssText = [
      'display:none',
      'position:fixed',          /* fixed so it escapes any stacking context */
      'z-index:99999',           /* above everything */
      'background:var(--surface)',
      'border:1px solid var(--border)',
      'border-radius:10px',
      'box-shadow:0 8px 40px rgba(0,0,0,0.55)',
      'max-height:300px',
      'overflow-y:auto',
      'min-width:320px'
    ].join(';');
    document.body.appendChild(dd);
  }
  return dd;
}

function _ssPositionDropdown(){
  var inp = document.getElementById('ss_nameInput');
  var dd  = _ssGetOrCreateDropdown();
  if(!inp) return;
  var r = inp.getBoundingClientRect();
  dd.style.top   = (r.bottom + 4) + 'px';
  dd.style.left  = r.left + 'px';
  dd.style.width = r.width + 'px';
}

function ssOnInput(){
  const q = (document.getElementById('ss_nameInput').value || '').trim().toLowerCase();
  const dd = _ssGetOrCreateDropdown();
  if(!q){ dd.style.display='none'; return; }

  const hits = (db.students || []).filter(s =>
    (s.fullName || '').toLowerCase().includes(q)
  ).slice(0, 12);

  if(!hits.length){
    dd.innerHTML = '<div style="padding:14px 16px;color:var(--text-muted);font-size:13px">No students found</div>';
  } else {
    /* Store hits in a registry so onclick can use a safe integer index */
    window._ssHits = hits;
    dd.innerHTML = hits.map((s,i) => {
      const hl = (s.fullName || '').replace(
        new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi'),
        '<strong style="color:var(--sky)">$1</strong>'
      );
      return `<div
        data-idx="${i}"
        onclick="ssSelectStudentByIdx(${i})"
        onmouseover="this.style.background='var(--surface-2)'"
        onmouseout="this.style.background=''"
        style="padding:11px 16px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;transition:background .12s">
        <span style="font-size:20px">${(s.gender||'').toLowerCase()==='female'?'👧':'👦'}</span>
        <div>
          <div style="font-weight:700;font-size:13px">${hl}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">
            <span class="badge badge-blue" style="font-size:10px">${s.grade||''}</span>
            &nbsp;Adm: ${s.admNo||''}
          </div>
        </div>
      </div>`;
    }).join('');
  }
  _ssPositionDropdown();
  dd.style.display = 'block';
}

/* Reposition on scroll/resize so it tracks the input */
window.addEventListener('scroll',  function(){ _ssPositionDropdown(); }, true);
window.addEventListener('resize',  function(){ _ssPositionDropdown(); });

/* Close dropdown when clicking outside */
document.addEventListener('click', function(e){
  const dd  = document.getElementById('ss_dropdown');
  const inp = document.getElementById('ss_nameInput');
  if(dd && inp && !dd.contains(e.target) && e.target !== inp){
    dd.style.display = 'none';
  }
});

/* ── Student selected from dropdown ──────────────────────────────── */
/* Safe index-based selector — avoids injecting JSON/quotes into onclick attributes */
function ssSelectStudentByIdx(idx){
  var s = window._ssHits && window._ssHits[idx];
  if(!s){ return; }
  ssDoSelectStudent(s);
}

/* Legacy entry point kept for backwards compatibility */
function ssSelectStudent(studentJson){
  var s;
  try { s = JSON.parse(studentJson); } catch(e){ return; }
  ssDoSelectStudent(s);
}

function ssDoSelectStudent(s){
  _ssStudent = s;

  /* Close dropdown, update input */
  var dd = document.getElementById('ss_dropdown');
  if(dd) dd.style.display = 'none';
  var ni = document.getElementById('ss_nameInput');
  if(ni) ni.value = s.fullName || '';

  /* Show chip */
  const chip = document.getElementById('ss_selectedChip');
  const chipLbl = document.getElementById('ss_chipLabel');
  if(chip && chipLbl){
    chipLbl.textContent = (s.fullName||'') + '  ·  Grade ' + (s.grade||'');
    chip.style.display = 'flex';
  }

  /* Open exam picker */
  ssOpenExamPicker(s);
}

function ssClearSelection(){
  _ssStudent = null;
  var ni = document.getElementById('ss_nameInput');
  if(ni) ni.value = '';
  var chip = document.getElementById('ss_selectedChip');
  if(chip) chip.style.display = 'none';
  var dd = document.getElementById('ss_dropdown');
  if(dd){ dd.style.display = 'none'; dd.innerHTML = ''; }
}

/* ── Exam picker ─────────────────────────────────────────────────── */
function ssOpenExamPicker(student){
  /* Never stack both overlays: the score modal shares z-index 9100, so an
     open score sheet could sit above the picker and swallow its taps. */
  ssCloseScoreModal();
  const overlay = document.getElementById('ss_examPickerOverlay');
  const subtitle = document.getElementById('ss_examPickerSubtitle');
  const sel = document.getElementById('ss_examPickerSel');
  const custom = document.getElementById('ss_examPickerCustom');
  const termEl = document.getElementById('ss_examPickerTerm');
  const yearEl = document.getElementById('ss_examPickerYear');

  subtitle.textContent = 'Capturing scores for: ' + (student.fullName||'') + '  (Grade ' + (student.grade||'') + ')';

  /* Populate existing exams for this student's grade */
  const existing = [...new Set(
    (db.exams||[]).filter(e => e.grade === student.grade).map(e => e.examName||'Untitled Exam')
  )].sort();
  /* Plus every exam name defined in the registry for this grade */
  if(typeof examRegistryNamesForGrade === 'function'){
    examRegistryNamesForGrade(student.grade).forEach(n => {
      if(existing.indexOf(n) === -1) existing.push(n);
    });
    existing.sort();
  }

  sel.innerHTML = '<option value="">-- Choose existing exam --</option>';
  existing.forEach(n => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n;
    sel.appendChild(o);
  });

  custom.value = '';
  termEl.value = 'Term 1';
  yearEl.value = new Date().getFullYear();

  /* Re-append to body so it's always last in DOM (beats transform stacking contexts) */
  document.body.appendChild(overlay);
  overlay.style.display = 'flex';
}

function ssExamPickerSelChange(){
  const sel = document.getElementById('ss_examPickerSel');
  const custom = document.getElementById('ss_examPickerCustom');
  if(sel.value){
    custom.value = '';
    /* Auto-populate term+year from saved records */
    const sample = (db.exams||[]).find(e =>
      e.grade === (_ssStudent && _ssStudent.grade) && e.examName === sel.value
    );
    if(sample){
      const termEl = document.getElementById('ss_examPickerTerm');
      const yearEl = document.getElementById('ss_examPickerYear');
      if(sample.term) termEl.value = sample.term;
      if(sample.year) yearEl.value = sample.year;
    } else if(typeof examRegistryDefinitionByName === 'function'){
      /* Registry-only name (created ahead of any scores) → sync its term/year */
      const def = examRegistryDefinitionByName(sel.value);
      if(def){
        const termEl = document.getElementById('ss_examPickerTerm');
        const yearEl = document.getElementById('ss_examPickerYear');
        if(def.term) termEl.value = def.term;
        if(def.year) yearEl.value = def.year;
      }
    }
    /* Jump straight to the subject score entry — no Continue press needed.
       Guarded: if the user switched students (or closed the picker) within
       the 80ms window, the stale timer must not fire for the wrong state. */
    const _autoAdm = _ssStudent && _ssStudent.admNo;
    const _autoPick = sel.value;
    setTimeout(function(){
      if(!_ssStudent || _ssStudent.admNo !== _autoAdm) return;
      const pk = document.getElementById('ss_examPickerOverlay');
      if(!pk || pk.style.display === 'none') return;
      if(document.getElementById('ss_examPickerSel').value !== _autoPick) return;
      if(typeof ssConfirmExam === 'function') ssConfirmExam();
    }, 80);
  }
}

function ssExamPickerCustomChange(){
  const custom = document.getElementById('ss_examPickerCustom');
  if(custom.value.trim()){
    document.getElementById('ss_examPickerSel').value = '';
  }
}

function ssCloseExamPicker(){
  document.getElementById('ss_examPickerOverlay').style.display = 'none';
}

function ssConfirmExam(){
  const sel    = document.getElementById('ss_examPickerSel').value;
  const custom = (document.getElementById('ss_examPickerCustom').value||'').trim();
  const term   = document.getElementById('ss_examPickerTerm').value;
  const year   = parseInt(document.getElementById('ss_examPickerYear').value);

  const examName = custom || sel;
  if(!examName){ toast('Please choose or type an exam name', true); return; }
  if(!term)    { toast('Please select a term', true); return; }
  if(!year || isNaN(year)){ toast('Please enter a valid year', true); return; }

  _ssExamName = examName;
  _ssTerm     = term;
  _ssYear     = year;

  ssCloseExamPicker();
  ssOpenScoreModal();
}

/* ── Score entry modal ───────────────────────────────────────────── */
function ssOpenScoreModal(){
  if(!_ssStudent){ return; }
  /* Never stack both overlays: hide the picker first so it can't cover
     this modal's Save/Cancel buttons (same z-index 9100). */
  ssCloseExamPicker();
  const student  = _ssStudent;
  const grade    = student.grade || '';
  const subjects = getSubjects(grade);
  // Non-admin users may only fill in scores that have NOT been saved yet —
  // anything already saved is readonly until an admin edits it.
  const nonAdmin = (typeof getCurrentRole === 'function' && getCurrentRole() !== 'admin');

  /* Load any already-saved scores for this student + exam */
  const existing = (db.exams||[]).find(e =>
    e.admNo === student.admNo &&
    (e.examName||'') === _ssExamName &&
    e.term === _ssTerm &&
    e.year === _ssYear
  );

  const subtitle = document.getElementById('ss_scoreModalSubtitle');
  subtitle.textContent =
    (student.fullName||'') + '  ·  Grade ' + grade +
    '  ·  ' + _ssExamName +
    '  ·  ' + _ssTerm + ' ' + _ssYear;

  /* Build score grid — horizontal layout, one card per subject, no scrolling */
  const rows = document.getElementById('ss_scoreRows');

  /* Separate ENG/KIS (compound, plus grade-9 SCIE) from simple subjects */
  const compoundSubjs = ['ENG','KIS'].concat(isScieSplit(grade) ? ['SCIE'] : []);
  const simpleSubjs   = subjects.filter(s => !compoundSubjs.includes(s));

  /* ── Simple subjects: compact horizontal grid ─────────────────── */
  const simpleCards = simpleSubjs.map(subj => {
    const val      = existing && existing.scores    && existing.scores[subj]    !== undefined ? existing.scores[subj]    : '';
    const roCard   = (nonAdmin && val !== '') ? 'readonly ' : '';
    const fullName = (window.SUBJ_FULLNAME && SUBJ_FULLNAME[subj]) ? SUBJ_FULLNAME[subj] : subj;
    return `
      <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;border:1px solid var(--border);text-align:center;min-width:0">
        <div style="font-size:11px;font-weight:700;color:var(--sky);letter-spacing:.04em;margin-bottom:2px">${subj}</div>
        <div style="font-size:9px;color:var(--text-muted);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${fullName}</div>
        <input type="number" id="ss_inp_${subj}" min="0" max="100" value="${val}" placeholder="—"
          ${roCard}oninput="ssUpdateTotal()"
          style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
        <div id="ss_rb_${subj}" style="font-size:10px;margin-top:5px;min-height:16px">${val !== '' ? ssRubricHtml(parseFloat(val), grade, (typeof _ssExamName!=='undefined'?_ssExamName:'')) : ''}</div>
      </div>`;
  }).join('');

  /* ── ENG block (grade-aware sub-components) ───────────────────────── */
  let engBlock = '';
  if(subjects.includes('ENG')){
    const engSubs = getEngSubs(grade);           // ['GRA','COMP'] or ['ENG PP1','ENG PP2']
    const sub0 = engSubs[0], sub1 = engSubs[1];
    const v0 = existing && existing.subScores && existing.subScores[sub0] !== undefined ? existing.subScores[sub0] : '';
    const v1 = existing && existing.subScores && existing.subScores[sub1] !== undefined ? existing.subScores[sub1] : '';
    // Backward compat: also read legacy keys if new ones empty
    const v0legacy = (v0 === '' && (sub0==='ENG PP1' || sub0==='ENG PP2')) ? (existing?.subScores?.GRA ?? existing?.subScores?.COMP ?? '') : '';
    const v1legacy = (v1 === '' && (sub1==='ENG PP1' || sub1==='ENG PP2')) ? (existing?.subScores?.COMP ?? existing?.subScores?.GRA ?? '') : '';
    const finalV0 = v0 !== '' ? v0 : v0legacy;
    const finalV1 = v1 !== '' ? v1 : v1legacy;
    const engV = existing && existing.scores    && existing.scores.ENG     !== undefined ? existing.scores.ENG     : '';
    const ro0 = (nonAdmin && finalV0 !== '') ? 'readonly ' : '';
    const ro1 = (nonAdmin && finalV1 !== '') ? 'readonly ' : '';
    engBlock = `
      <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;border:1px solid var(--border)">
        <div style="font-size:10px;font-weight:700;color:var(--sky);letter-spacing:.04em;margin-bottom:6px;text-align:center">
          ENG <span style="font-weight:400;color:var(--text-muted)">English</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub0}</div>
            <input type="number" id="ss_inp_${sub0}" min="0" max="100" value="${finalV0}" placeholder="—"
              ${ro0}oninput="ssSubInput('ENG')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub1}</div>
            <input type="number" id="ss_inp_${sub1}" min="0" max="100" value="${finalV1}" placeholder="—"
              ${ro1}oninput="ssSubInput('ENG')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--sky);margin-bottom:4px;font-weight:600">Total</div>
            <input type="number" id="ss_inp_ENG" min="0" max="200" value="${engV}" readonly
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid rgba(30,86,200,0.4);background:rgba(30,86,200,0.12);color:var(--sky);font-size:14px;font-weight:700;text-align:center;cursor:not-allowed;box-sizing:border-box">
          </div>
        </div>
        <div id="ss_rb_ENG" style="font-size:10px;margin-top:5px;min-height:16px;text-align:center"></div>
      </div>`;
  }

  /* ── KIS block (grade-aware sub-components) ─────────────────────── */
  let kisBlock = '';
  if(subjects.includes('KIS')){
    const kisSubs = getKisSubs(grade);           // ['LUG','INS'] or ['KIS PP1','KIS PP2']
    const sub0 = kisSubs[0], sub1 = kisSubs[1];
    const v0 = existing && existing.subScores && existing.subScores[sub0] !== undefined ? existing.subScores[sub0] : '';
    const v1 = existing && existing.subScores && existing.subScores[sub1] !== undefined ? existing.subScores[sub1] : '';
    // Backward compat: also read legacy keys if new ones empty
    const v0legacy = (v0 === '' && (sub0==='KIS PP1' || sub0==='KIS PP2')) ? (existing?.subScores?.LUG ?? existing?.subScores?.INS ?? '') : '';
    const v1legacy = (v1 === '' && (sub1==='KIS PP1' || sub1==='KIS PP2')) ? (existing?.subScores?.INS ?? existing?.subScores?.LUG ?? '') : '';
    const finalV0 = v0 !== '' ? v0 : v0legacy;
    const finalV1 = v1 !== '' ? v1 : v1legacy;
    const kisV = existing && existing.scores    && existing.scores.KIS    !== undefined ? existing.scores.KIS    : '';
    const ro0 = (nonAdmin && finalV0 !== '') ? 'readonly ' : '';
    const ro1 = (nonAdmin && finalV1 !== '') ? 'readonly ' : '';
    kisBlock = `
      <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;border:1px solid var(--border)">
        <div style="font-size:10px;font-weight:700;color:var(--sky);letter-spacing:.04em;margin-bottom:6px;text-align:center">
          KIS <span style="font-weight:400;color:var(--text-muted)">Kiswahili</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub0}</div>
            <input type="number" id="ss_inp_${sub0}" min="0" max="100" value="${finalV0}" placeholder="—"
              ${ro0}oninput="ssSubInput('KIS')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub1}</div>
            <input type="number" id="ss_inp_${sub1}" min="0" max="100" value="${finalV1}" placeholder="—"
              ${ro1}oninput="ssSubInput('KIS')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--sky);margin-bottom:4px;font-weight:600">Total</div>
            <input type="number" id="ss_inp_KIS" min="0" max="200" value="${kisV}" readonly
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid rgba(30,86,200,0.4);background:rgba(30,86,200,0.12);color:var(--sky);font-size:14px;font-weight:700;text-align:center;cursor:not-allowed;box-sizing:border-box">
          </div>
        </div>
        <div id="ss_rb_KIS" style="font-size:10px;margin-top:5px;min-height:16px;text-align:center"></div>
      </div>`;
  }

  /* ── SCIE block (grade 9 sub-components, no legacy keys) ────────── */
  let scieBlock = '';
  if(subjects.includes('SCIE') && isScieSplit(grade)){
    const scSubs = getScieSubs(grade);               // ['SCIE PP1','SCIE PP2']
    const sub0 = scSubs[0], sub1 = scSubs[1];
    const v0 = existing && existing.subScores && existing.subScores[sub0] !== undefined ? existing.subScores[sub0] : '';
    const v1 = existing && existing.subScores && existing.subScores[sub1] !== undefined ? existing.subScores[sub1] : '';
    const scieV = existing && existing.scores && existing.scores.SCIE !== undefined ? existing.scores.SCIE : '';
    const ro0 = (nonAdmin && v0 !== '') ? 'readonly ' : '';
    const ro1 = (nonAdmin && v1 !== '') ? 'readonly ' : '';
    scieBlock = `
      <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;border:1px solid var(--border)">
        <div style="font-size:10px;font-weight:700;color:var(--sky);letter-spacing:.04em;margin-bottom:6px;text-align:center">
          SCIE <span style="font-weight:400;color:var(--text-muted)">Science</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub0}</div>
            <input type="number" id="ss_inp_${sub0}" min="0" max="100" value="${v0}" placeholder="—"
              ${ro0}oninput="ssSubInput('SCIE')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--text-muted);margin-bottom:4px">${sub1}</div>
            <input type="number" id="ss_inp_${sub1}" min="0" max="100" value="${v1}" placeholder="—"
              ${ro1}oninput="ssSubInput('SCIE')"
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text-primary);font-size:14px;font-weight:700;text-align:center;box-sizing:border-box">
          </div>
          <div style="text-align:center">
            <div style="font-size:9px;color:var(--sky);margin-bottom:4px;font-weight:600">Total</div>
            <input type="number" id="ss_inp_SCIE" min="0" max="200" value="${scieV}" readonly
              style="width:100%;padding:6px 4px;border-radius:6px;border:1px solid rgba(30,86,200,0.4);background:rgba(30,86,200,0.12);color:var(--sky);font-size:14px;font-weight:700;text-align:center;cursor:not-allowed;box-sizing:border-box">
          </div>
        </div>
        <div id="ss_rb_SCIE" style="font-size:10px;margin-top:5px;min-height:16px;text-align:center"></div>
      </div>`;
  }

  /* ── Assemble: compound blocks on top row, then simple subjects grid ── */
  const compoundBlocks = [engBlock, kisBlock, scieBlock].filter(Boolean);
  const compoundRow = compoundBlocks.length
    ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(compoundBlocks.length, 2)},1fr);gap:8px;margin-bottom:8px">${compoundBlocks.join('')}</div>`
    : '';

  const colCount = Math.min(simpleSubjs.length, simpleSubjs.length <= 4 ? simpleSubjs.length : simpleSubjs.length <= 6 ? 3 : 4);
  const simpleGrid = simpleCards
    ? `<div style="display:grid;grid-template-columns:repeat(${colCount},1fr);gap:8px">${simpleCards}</div>`
    : '';

  rows.innerHTML = compoundRow + simpleGrid;

  document.getElementById('ss_scoreTotalBar').style.display = 'none';
  const sm = document.getElementById('ss_scoreModalOverlay');
  /* Re-append to body so it's always last in DOM (beats transform stacking contexts) */
  document.body.appendChild(sm);
  sm.style.display = 'flex';
  ssUpdateTotal();
}

function ssRubricHtml(score, grade, examName){
  const rb = typeof getRubric === 'function' ? getRubric(score, grade, examName) : null;
  if(!rb) return '—';
  return `<span class="rb-pill ${rb.class}">${rb.code}</span>`;
}

function ssSubInput(parent){
  const grade = _ssStudent && _ssStudent.grade;
  const subs = (getParentSubs(grade) || {})[parent] || (parent === 'ENG' ? getEngSubs(grade) : getKisSubs(grade));
  const v0 = parseFloat(document.getElementById('ss_inp_' + subs[0]).value) || 0;
  const v1 = parseFloat(document.getElementById('ss_inp_' + subs[1]).value) || 0;
  const parentInp = document.getElementById('ss_inp_' + parent);
  if(parentInp){
    const both = document.getElementById('ss_inp_' + subs[0]).value !== '' ||
                 document.getElementById('ss_inp_' + subs[1]).value !== '';
    parentInp.value = both ? v0 + v1 : '';
  }
  ssUpdateTotal();
}

function ssUpdateTotal(){
  const grade = _ssStudent && _ssStudent.grade;
  if(!grade) return;
  const subjects = getSubjects(grade);
  let total = 0, count = 0;
  subjects.forEach(s => {
    const inp = document.getElementById('ss_inp_' + s);
    if(inp && inp.value !== '' && !isNaN(inp.value)){
      const v = parseFloat(inp.value);
      total += v; count++;
      /* Update rubric badge — works for both simple and compound subjects */
      const rb = document.getElementById('ss_rb_' + s);
      if(rb) rb.innerHTML = ssRubricHtml(v, grade, (typeof _ssExamName!=='undefined'?_ssExamName:''));
    } else {
      const rb = document.getElementById('ss_rb_' + s);
      if(rb) rb.innerHTML = '';
    }
  });
  const bar = document.getElementById('ss_scoreTotalBar');
  const tot = document.getElementById('ss_scoreTotal');
  if(count > 0){
    tot.textContent = total;
    bar.style.display = 'block';
  } else {
    bar.style.display = 'none';
  }
}

function ssCloseScoreModal(){
  var el = document.getElementById('ss_scoreModalOverlay');
  if(el) el.style.display = 'none';
}

/* ── Save individual student scores ─────────────────────────────── */
function ssSaveScores(){
  /* Double-tap guard (phones fire rapid taps): never run two saves at once.
     The flag is always cleared in `finally`, so buttons can never stick. */
  if(window._ssSaving) return;
  const student = _ssStudent;
  if(!student){ toast('No student selected', true); return; }

  const grade    = student.grade || '';
  const subjects = getSubjects(grade);

  const scores    = {};
  const rubrics   = {};
  const subScores = {};
  // Raw as-typed values (pre-conversion); persisted only for brand-new records.
  const rawScoresC = {}, rawSubsC = {};
  let total = 0, hasAny = false;

  // Defense in depth: a non-admin save can never change a score that was already
  // saved, even if a readonly input were somehow altered client-side. New scores
  // (empty fields) are still recorded, exactly like the class entry grid.
  const existingRec = (db.exams||[]).find(e =>
    e.admNo === student.admNo &&
    (e.examName||'') === _ssExamName &&
    e.term === _ssTerm &&
    e.year === _ssYear
  );
  const isNonAdmin = (typeof getCurrentRole === 'function' && getCurrentRole() !== 'admin');

  // Score conversion (raw marks -> %): active only when constants were set
  // for this grade level + exam; otherwise values pass through untouched.
  const conv = (typeof getConvCfg==='function') ? getConvCfg(grade, _ssExamName) : null;
  const engPlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'ENG') : null;
  const kisPlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'KIS') : null;
  const sciePlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'SCIE') : null;

  subjects.forEach(s => {
    const inp = document.getElementById('ss_inp_' + s);
    let v = (inp && inp.value !== '' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
    const storedHasS = !!(existingRec && existingRec.scores && existingRec.scores[s]!==undefined);
    const dirtyS = ((typeof _inputDirty==='function') ? _inputDirty(inp) : true) &&
      !(storedHasS && existingRec.scores[s]===v);
    if(v !== null && (dirtyS || !existingRec)) rawScoresC[s] = v; // typed/new only
    if(isNonAdmin && existingRec && existingRec.scores && existingRec.scores[s] !== undefined){
      v = existingRec.scores[s];
    } else if(v !== null && s !== 'ENG' && s !== 'KIS' && !(s==='SCIE' && sciePlan) && conv && typeof convConvertSimple==='function'){
      v = (dirtyS || !storedHasS) ? convConvertSimple(v, conv.simple && conv.simple[s] && conv.simple[s].max) : v;
    } else if(v !== null && ((s === 'ENG' && engPlan) || (s === 'KIS' && kisPlan) || (s === 'SCIE' && sciePlan))){
      v = null; // recomputed from converted components below
    }
    if(v !== null && v >= 0){
      scores[s]  = v;
      rubrics[s] = (isNonAdmin && existingRec && existingRec.rubrics && existingRec.rubrics[s])
        ? existingRec.rubrics[s]
        : (typeof getRubric === 'function' ? getRubric(v, grade, _ssExamName) : {});
      total     += v;
      hasAny     = true;
    }
  });

  /* Capture sub-scores (grade-aware) — converted when active */
  const engSubs = getEngSubs(grade);
  const kisSubs = getKisSubs(grade);
  const scieSubs = getScieSubs(grade);
  [...engSubs, ...kisSubs, ...scieSubs].forEach(sub => {
    const inp = document.getElementById('ss_inp_' + sub);
    let v = (inp && inp.value !== '' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
    const storedHasSub = !!(existingRec && existingRec.subScores && existingRec.subScores[sub]!==undefined);
    const dirtySub = ((typeof _inputDirty==='function') ? _inputDirty(inp) : true) &&
      !(storedHasSub && existingRec.subScores[sub]===v);
    if(v !== null && (dirtySub || !existingRec)) rawSubsC[sub] = v; // typed/new only
    if(isNonAdmin && existingRec && existingRec.subScores && existingRec.subScores[sub] !== undefined){
      v = existingRec.subScores[sub];
    } else if(v !== null && typeof convConvertSub==='function'){
      const parent = engSubs.includes(sub) ? 'ENG' : (kisSubs.includes(sub) ? 'KIS' : 'SCIE');
      v = (dirtySub || !storedHasSub) ? convConvertSub(grade, conv, parent, sub, v) : v;
    }
    if(v !== null) subScores[sub] = v;
  });
  // Also capture legacy keys for backward compat (in case user typed in old field names)
  ['GRA','COMP','LUG','INS'].forEach(sub => {
    const inp = document.getElementById('ss_inp_' + sub);
    let v = (inp && inp.value !== '' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
    if(v !== null) subScores[sub] = v;
  });

  /* Consolidate 7-9 components: ENG PP1/PP2 (KIS PP1/PP2) are the same
     components older builds stored as GRA/COMP (LUG/INS). Mirror the fresh
     values into the legacy keys so every reader — current or legacy —
     finds them and no stale split-brain pair can linger. Totals derive
     from parent scores only (nothing sums subScores), so no double-count. */
  if(['7','8','9'].includes((grade||'').charAt(0))){
    if(subScores['ENG PP1'] !== undefined) subScores['GRA'] = subScores['ENG PP1'];
    if(subScores['ENG PP2'] !== undefined) subScores['COMP'] = subScores['ENG PP2'];
    if(subScores['KIS PP1'] !== undefined) subScores['LUG'] = subScores['KIS PP1'];
    if(subScores['KIS PP2'] !== undefined) subScores['INS'] = subScores['KIS PP2'];
  }

  // With conversion active, rebuild ENG/KIS (and grade-9 SCIE) totals from
  // converted components. Teacher-saved parents stay locked to stored values.
  const _ssRemovedLater = [];
  [['ENG', engPlan, engSubs], ['KIS', kisPlan, kisSubs], ['SCIE', sciePlan, scieSubs]].forEach(function(trio){
    const parent = trio[0], plan = trio[1], subs = trio[2];
    if(!plan) return;
    const keepLocked = isNonAdmin && existingRec && existingRec.scores &&
      existingRec.scores[parent]!==undefined && scores[parent]!==undefined;
    if(keepLocked) return;
    const tot = (typeof convParentTotal==='function') ? convParentTotal(
      subScores[subs[0]]!==undefined ? subScores[subs[0]] : null,
      subScores[subs[1]]!==undefined ? subScores[subs[1]] : null) : null;
    if(tot===null){
      if(existingRec && existingRec.scores && existingRec.scores[parent]!==undefined)
        _ssRemovedLater.push(parent);
      delete scores[parent]; delete rubrics[parent]; return;
    }
    if(scores[parent]!==undefined){ total -= scores[parent]; }
    else { hasAny = true; }
    scores[parent]=tot;
    rubrics[parent]=(typeof getRubric==='function' ? getRubric(tot, grade, _ssExamName) : {});
    total+=tot;
  });

  if(!hasAny){
    toast('No scores entered — please fill at least one subject', true);
    return;
  }

  /* Diff vs previous record: cleared inputs tombstone the subject
     server-side (stale devices can't resurrect); newly-appearing subjects
     are staged as explicit re-add intent. Inactive/locked inputs keep old
     values via the guards above, so they never tombstone. */
  const _prevKeys = (existingRec && existingRec.scores) ? Object.keys(existingRec.scores) : [];
  const _rem = _prevKeys.filter(s => scores[s]===undefined &&
    (()=>{ const el=document.getElementById('ss_inp_'+s); return el && el.value===''; })())
    .concat(_ssRemovedLater);
  const _add = existingRec ? Object.keys(scores).filter(s => existingRec.scores[s]===undefined) : [];
  if(_rem.length) _removeExamSubjectsRemote(student.admNo, _ssExamName, _ssTerm, _ssYear, _rem);
  if(_add.length){
    const _fm = {};
    _fm[_ssExamKey(student.admNo,_ssExamName,_ssTerm,_ssYear)] = _add;
    _stageForceSubjects(_fm);
  }

  /* Upsert into db.exams */
  window._ssSaving = true;
  try {
  db.exams = (db.exams||[]).filter(e =>
    !(e.admNo === student.admNo &&
      (e.examName||'') === _ssExamName &&
      e.term === _ssTerm &&
      e.year === _ssYear)
  );
  db.exams.push({
    admNo:    student.admNo,
    name:     student.fullName,
    grade,
    term:     _ssTerm,
    year:     _ssYear,
    examName: _ssExamName,
    examCode: examCode(_ssExamName, _ssTerm, _ssYear),
    scores,
    rubrics,
    subScores,
    total
  });
  // Persist typed raw values into the raw row (merge; untouched cells keep
  // their earlier raw). Brand-new records capture everything typed.
  if((Object.keys(rawScoresC).length || Object.keys(rawSubsC).length) && typeof mergeRawRow==='function')
    mergeRawRow(student.admNo, _ssExamName, _ssTerm, _ssYear, student, grade,
      examCode(_ssExamName, _ssTerm, _ssYear), rawScoresC, rawSubsC);

  if(typeof recalcRanks === 'function') recalcRanks();
  if(typeof saveDB      === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  } finally {
    window._ssSaving = false;
  }

  /* Dismiss the keyboard before closing so the next student's bottom-sheet
     opens against a stable viewport on phones. */
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  ssCloseScoreModal();
  ssClearSelection();

  const subjectsSaved = Object.keys(scores).join(', ');
  toast('✅ Scores saved for ' + (student.fullName||'student') +
        ' — ' + Object.keys(scores).length + ' subject(s): ' + subjectsSaved);
}

/* ── Reset state when leaving page ──────────────────────────────── */
function ssReset(){
  _ssStudent  = null;
  _ssExamName = '';
  const ni = document.getElementById('ss_nameInput');
  if(ni) ni.value = '';
  const chip = document.getElementById('ss_selectedChip');
  if(chip) chip.style.display = 'none';
  const dd = document.getElementById('ss_dropdown');
  if(dd){ dd.style.display = 'none'; dd.innerHTML = ''; }
  ssCloseExamPicker();
  ssCloseScoreModal();
}
/* ═══════════════════════════════════════════════════════════════════ */

function onExamSetupChange(){
  const grade = document.getElementById('ex_gradeFilter').value;
  const examName = document.getElementById('ex_examName').value.trim();

  // Toggle empty state vs entry card
  document.getElementById('ex_emptyState').style.display = grade ? 'none' : '';
  document.getElementById('ex_classEntryCard').style.display = grade ? '' : 'none';
  document.getElementById('ex_subjectChips').style.display = grade ? '' : 'none';

  if(!grade) return;

  const subjects = getSubjects(grade);
  const term = document.getElementById('ex_term').value;
  const year = parseInt(document.getElementById('ex_year').value);

  // Populate subject chips — all active by default
  if(_exActiveSubjects.size === 0 || [..._exActiveSubjects].some(s=>!subjects.includes(s))){
    _exActiveSubjects = new Set(subjects);
  }
  renderSubjectChips(subjects);

  // Populate "load existing exam" dropdown for this grade
  const existingExamNames = [...new Set(
    db.exams.filter(e=>e.grade===grade).map(e=>e.examName||'Untitled Exam')
  )].sort();
  /* Also offer registry-defined names for this grade that have no scores yet,
     so teachers can load a pre-created exam straight from the dropdown. */
  const registryOnly = (typeof examRegistryNamesForGradeUnsaved === 'function')
    ? examRegistryNamesForGradeUnsaved(grade)
    : [];
  registryOnly.sort();
  const loadGroup = document.getElementById('ex_loadExistingGroup');
  const loadSel = document.getElementById('ex_loadExisting');
  loadSel.innerHTML = '<option value="">-- Select a submitted exam to load --</option>';
  existingExamNames.forEach(n=>{
    const o = document.createElement('option'); o.value=n; o.textContent=n;
    if(n===examName) o.selected=true;
    loadSel.appendChild(o);
  });
  if(registryOnly.length){
    const og = document.createElement('optgroup');
    og.label = '★ Pre-defined exam names (no scores saved yet)';
    registryOnly.forEach(n=>{
      const o = document.createElement('option'); o.value=n; o.textContent=n;
      if(n===examName) o.selected=true;
      og.appendChild(o);
    });
    loadSel.appendChild(og);
  }
  loadGroup.style.display = (existingExamNames.length || registryOnly.length) ? '' : 'none';

  renderClassEntryGrid();
}

function renderSubjectChips(subjects){
  const row = document.getElementById('ex_subjectChipRow');
  row.innerHTML = subjects.map(s=>`
    <div class="subj-chip ${_exActiveSubjects.has(s)?'active':'inactive'}" onclick="toggleSubjectChip('${s}')" title="${_exActiveSubjects.has(s)?'Click to hide':'Click to show'} ${s} column">
      ${_exActiveSubjects.has(s)?'✓ ':''}${s}
    </div>`).join('') + `
    <div class="subj-chip inactive" onclick="selectAllSubjects()" style="border-style:dashed;font-size:11px">✦ All</div>
    <div class="subj-chip inactive" onclick="clearAllSubjects()" style="border-style:dashed;font-size:11px;color:var(--rose)">✕ None</div>`;
}

function toggleSubjectChip(subj){
  if(_exActiveSubjects.has(subj)) _exActiveSubjects.delete(subj);
  else _exActiveSubjects.add(subj);
  const grade = document.getElementById('ex_gradeFilter').value;
  renderSubjectChips(getSubjects(grade));
  renderClassEntryGrid();
}

function selectAllSubjects(){
  const grade = document.getElementById('ex_gradeFilter').value;
  const subjects = getSubjects(grade);
  _exActiveSubjects = new Set(subjects);
  renderSubjectChips(subjects);
  renderClassEntryGrid();
}

function clearAllSubjects(){
  _exActiveSubjects.clear();
  const grade = document.getElementById('ex_gradeFilter').value;
  renderSubjectChips(getSubjects(grade));
  renderClassEntryGrid();
}

function renderClassEntryGrid(){
  const grade = document.getElementById('ex_gradeFilter').value;
  if(!grade) return;

  const examName = document.getElementById('ex_examName').value.trim() || '';
  const term = document.getElementById('ex_term').value;
  const year = parseInt(document.getElementById('ex_year').value);
  const subjects = getSubjects(grade);
  const activeSubjs = subjects.filter(s=>_exActiveSubjects.has(s));
  // Once a score is saved, teachers can no longer edit it from this grid —
  // only admins can change a previously-saved score. Unfilled cells stay
  // editable for everyone so teachers can still capture missing scores.
  const lockSavedCells = (getCurrentRole() !== 'admin');

  // Update header info
  document.getElementById('ex_classTitle').textContent = examName || 'Enter Exam Name Above';
  document.getElementById('ex_classSubtitle').textContent = `Grade ${grade} • ${term} ${year} • ${activeSubjs.length} subject${activeSubjs.length!==1?'s':''} selected`;
  document.getElementById('ex_classGradeBadge').textContent = 'Grade ' + grade;

  // Students sorted alphabetically
  const students = [...db.students.filter(s=>s.grade===grade)]
    .sort((a,b)=>a.fullName.localeCompare(b.fullName));

  // Update saved count badge
  const savedCount = db.exams.filter(e=>e.grade===grade&&(!examName||(e.examName||'')=== examName)).length;
  document.getElementById('ex_classSavedCount').textContent = savedCount ? `${savedCount} record${savedCount!==1?'s':''} saved` : '';

  if(!students.length){
    document.getElementById('ex_classTableHead').innerHTML = '';
    document.getElementById('ex_classTableBody').innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">👨‍🎓</div><p>No students registered in Grade ${grade}.</p></div></td></tr>`;
    document.getElementById('ex_classTableFoot').innerHTML = '';
    return;
  }

  // Build header — ENG, KIS (and grade-9 SCIE) get grade-aware sub-columns
  const head = document.getElementById('ex_classTableHead');
  const engSubs = getEngSubs(grade);
  const kisSubs = getKisSubs(grade);
  const scieSubs = getScieSubs(grade);
  const engLabel = engSubs.join('+');
  const kisLabel = kisSubs.join('+');
  const subColsOf = s => s==='ENG' ? engSubs : (s==='KIS' ? kisSubs : scieSubs);
  const isSplit = s => s==='ENG' || s==='KIS' || (s==='SCIE' && scieSubs.length===2);
  // Row 1: group headers
  const r1Cols = activeSubjs.map(s=>{
    if(s==='ENG') return `<th class="subj-header" colspan="4" style="text-align:center;border-bottom:2px solid rgba(242,199,68,0.4)">ENG<span style="font-size:9px;font-weight:400;color:var(--text-muted);margin-left:4px">(${engLabel})</span></th>`;
    if(s==='KIS') return `<th class="subj-header" colspan="4" style="text-align:center;border-bottom:2px solid rgba(242,199,68,0.4)">KIS<span style="font-size:9px;font-weight:400;color:var(--text-muted);margin-left:4px">(${kisLabel})</span></th>`;
    if(s==='SCIE' && scieSubs.length===2) return `<th class="subj-header" colspan="4" style="text-align:center;border-bottom:2px solid rgba(242,199,68,0.4)">SCIE<span style="font-size:9px;font-weight:400;color:var(--text-muted);margin-left:4px">(${scieSubs.join('+')})</span></th>`;
    return `<th class="subj-header" rowspan="2" style="vertical-align:middle">${s}</th><th class="subj-header" rowspan="2" style="font-size:9px;color:var(--text-muted);vertical-align:middle">Rb</th>`;
  }).join('');
  // Row 2: sub-headers
  const r2Cols = activeSubjs.map(s=>{
    if(s==='ENG') return `<th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${engSubs[0]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${engSubs[1]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.25);min-width:46px">ENG</th><th class="subj-header" style="font-size:9px;color:var(--text-muted);background:rgba(30,86,200,0.15)">Rb</th>`;
    if(s==='KIS') return `<th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${kisSubs[0]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${kisSubs[1]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.25);min-width:46px">KIS</th><th class="subj-header" style="font-size:9px;color:var(--text-muted);background:rgba(30,86,200,0.15)">Rb</th>`;
    if(s==='SCIE' && scieSubs.length===2) return `<th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${scieSubs[0]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.15);min-width:46px">${scieSubs[1]}</th><th class="subj-header" style="font-size:10px;background:rgba(30,86,200,0.25);min-width:46px">SCIE</th><th class="subj-header" style="font-size:9px;color:var(--text-muted);background:rgba(30,86,200,0.15)">Rb</th>`;
    return ''; // already handled with rowspan in row 1
  }).join('');
  head.innerHTML = `
    <tr>
      <th class="student-row-num" rowspan="2" style="vertical-align:middle">#</th>
      <th style="min-width:155px;vertical-align:middle" rowspan="2">Student Name</th>
      <th style="min-width:78px;vertical-align:middle" rowspan="2">Adm No</th>
      ${r1Cols}
      <th style="min-width:58px;text-align:center;vertical-align:middle" rowspan="2">Total</th>
      <th style="width:32px" rowspan="2"></th>
    </tr>
    <tr>${r2Cols}</tr>`;

  // Build body rows
  const tbody = document.getElementById('ex_classTableBody');
  tbody.innerHTML = students.map((stu, i)=>{
    // Find existing record for this student+exam+term+year
    const existing = examName
      ? db.exams.find(e=>e.admNo===stu.admNo&&e.examName===examName&&e.term===term&&e.year===year)
      : null;
    const hasAny = existing && Object.keys(existing.scores||{}).length > 0;

    const subjCells = activeSubjs.map(s=>{
      if(s==='ENG'||s==='KIS'||(s==='SCIE'&&scieSubs.length===2)){
        const subs = subColsOf(s);
        const engVal = existing?.scores?.[s]??'';
        const rb = existing?.rubrics?.[s];
        const rbHtml = rb ? `<span class="rb-pill ${rb.class}">${rb.code}</span>` : '<span style="color:var(--border)">—</span>';
        // Try to back-compute sub-scores from stored sub-scores if present (try new keys first, then legacy)
        const sub0_new = existing?.subScores?.[subs[0]]??'';
        const sub1_new = existing?.subScores?.[subs[1]]??'';
        const sub0_legacy = (s!=='SCIE' && sub0_new === '' && (subs[0]==='ENG PP1'||subs[0]==='ENG PP2'||subs[0]==='KIS PP1'||subs[0]==='KIS PP2')) ? (existing?.subScores?.[s==='ENG'?'GRA':'LUG'] ?? '') : '';
        const sub1_legacy = (s!=='SCIE' && sub1_new === '' && (subs[1]==='ENG PP1'||subs[1]==='ENG PP2'||subs[1]==='KIS PP1'||subs[1]==='KIS PP2')) ? (existing?.subScores?.[s==='ENG'?'COMP':'INS'] ?? '') : '';
        const sub0 = sub0_new !== '' ? sub0_new : sub0_legacy;
        const sub1 = sub1_new !== '' ? sub1_new : sub1_legacy;
        const sub0Locked = lockSavedCells && (sub0_new !== '' || sub0_legacy !== '');
        const sub1Locked = lockSavedCells && (sub1_new !== '' || sub1_legacy !== '');
        return `
          <td style="padding:3px 4px;background:rgba(30,86,200,0.06)">
            <input type="number" class="score-input-cell${sub0!==''?' has-val':''}${sub0Locked?' locked-saved':''}"
                   id="exsc_${stu.admNo}_${subs[0]}" data-adm="${stu.admNo}" data-subj="${subs[0]}" data-parent="${s}"
                   min="0" max="100" value="${sub0}" placeholder="—"
                   title="${sub0Locked?'Saved — only an admin can change this score':subs[0]+' component of '+s}"
                   ${sub0Locked?'readonly':''}
                   oninput="onSubScoreInput(this,'${grade}','${stu.admNo}','${s}')">
          </td>
          <td style="padding:3px 4px;background:rgba(30,86,200,0.06)">
            <input type="number" class="score-input-cell${sub1!==''?' has-val':''}${sub1Locked?' locked-saved':''}"
                   id="exsc_${stu.admNo}_${subs[1]}" data-adm="${stu.admNo}" data-subj="${subs[1]}" data-parent="${s}"
                   min="0" max="100" value="${sub1}" placeholder="—"
                   title="${sub1Locked?'Saved — only an admin can change this score':subs[1]+' component of '+s}"
                   ${sub1Locked?'readonly':''}
                   oninput="onSubScoreInput(this,'${grade}','${stu.admNo}','${s}')">
          </td>
          <td style="padding:3px 4px;background:rgba(30,86,200,0.12);text-align:center">
            <input type="number" class="score-input-cell${engVal!==''?' has-val':''}"
                   id="exsc_${stu.admNo}_${s}" data-adm="${stu.admNo}" data-subj="${s}"
                   min="0" max="200" value="${engVal}" placeholder="—"
                   title="${s} = ${subs[0]}+${subs[1]} (auto-calculated)"
                   readonly style="background:rgba(30,86,200,0.18);cursor:not-allowed;font-weight:700;color:var(--sky)">
          </td>
          <td style="padding:3px 2px;text-align:center" id="exrb_${stu.admNo}_${s}">${rbHtml}</td>`;
      }
      const val = existing?.scores?.[s]??'';
      const rb = existing?.rubrics?.[s];
      const rbHtml = rb ? `<span class="rb-pill ${rb.class}">${rb.code}</span>` : '<span style="color:var(--border)">—</span>';
      const valLocked = lockSavedCells && val!=='';
      return `<td style="padding:3px 4px"><input type="number" class="score-input-cell${val!==''?' has-val':''}${valLocked?' locked-saved':''}" id="exsc_${stu.admNo}_${s}" data-adm="${stu.admNo}" data-subj="${s}" min="0" max="100" value="${val}" placeholder="—" title="${valLocked?'Saved — only an admin can change this score':''}" ${valLocked?'readonly':''} oninput="onScoreInput(this,'${grade}','${stu.admNo}')"></td>
              <td style="padding:3px 2px;text-align:center" id="exrb_${stu.admNo}_${s}">${rbHtml}</td>`;
    }).join('');

    const total = existing ? existing.total : '';
    const saved = existing ? '✓' : '';
    const savedColor = existing ? 'color:var(--emerald)' : '';

    return `<tr id="exrow_${stu.admNo}" class="${hasAny?'has-scores':''}">
      <td class="student-row-num">${i+1}</td>
      <td class="student-name-cell" style="padding:5px 10px">${stu.fullName}</td>
      <td class="student-adm-cell" style="padding:5px 6px"><span class="adm-badge" style="font-size:10px">${stu.admNo}</span></td>
      ${subjCells}
      <td class="row-total-cell" id="extotal_${stu.admNo}">${total}</td>
      <td class="row-status-cell" id="exstatus_${stu.admNo}" style="${savedColor}">${saved}</td>
    </tr>`;
  }).join('');

  // Footer: subject means from existing saved data
  buildFooterMeans(activeSubjs, grade, examName, term, year);

  // Update save summary
  updateSaveSummary(grade, examName, term, year);

  // ── Keyboard navigation: arrow keys move between cells ────────
  attachScoreGridNavigation();
}

/* ── Score grid keyboard navigation ─────────────────────────────
   Arrow keys navigate between editable score cells in the table.
   Down/Up  → same column, next/previous row
   Left/Right → previous/next editable column in same row
   ────────────────────────────────────────────────────────────── */
function attachScoreGridNavigation(){
  const tbody = document.getElementById('ex_classTableBody');
  if(!tbody) return;

  // Collect all editable (non-readonly) score inputs, row by row
  // Each row's inputs form one array element; columns are consistent
  const rows   = Array.from(tbody.querySelectorAll('tr'));
  const grid   = []; // grid[rowIdx] = [input, input, ...]

  rows.forEach(tr => {
    const inputs = Array.from(
      tr.querySelectorAll('input.score-input-cell:not([readonly])')
    );
    if(inputs.length) grid.push(inputs);
  });

  if(!grid.length) return;

  // Attach one keydown listener per input — remove old ones first by
  // replacing the element (clone trick isn't ideal for inputs with values,
  // so we use a named handler stored on the element instead)
  grid.forEach((cols, rIdx) => {
    cols.forEach((inp, cIdx) => {
      // Remove any previously attached nav handler
      if(inp._navHandler) inp.removeEventListener('keydown', inp._navHandler);

      inp._navHandler = function(e){
        let targetR = rIdx, targetC = cIdx;

        switch(e.key){
          case 'ArrowDown':
            targetR = rIdx + 1;
            break;
          case 'ArrowUp':
            targetR = rIdx - 1;
            break;
          case 'ArrowRight':
            targetC = cIdx + 1;
            break;
          case 'ArrowLeft':
            targetC = cIdx - 1;
            break;
          default:
            return; // let other keys work normally
        }

        // Clamp to valid range
        targetR = Math.max(0, Math.min(grid.length - 1, targetR));
        targetC = Math.max(0, Math.min((grid[targetR]?.length ?? 1) - 1, targetC));

        const target = grid[targetR]?.[targetC];
        if(target){
          e.preventDefault(); // stop page scroll
          target.focus();
          // Select all text so typing replaces it immediately
          target.select();
          // Scroll into view smoothly if needed
          target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      };

      inp.addEventListener('keydown', inp._navHandler);
    });
  });
}

function onScoreInput(el, grade, admNo){
  const val = el.value.trim();
  const subj = el.dataset.subj;

  // Validate
  if(val!=='' && (isNaN(val)||parseFloat(val)<0||parseFloat(val)>100)){
    el.classList.add('invalid'); return;
  }
  el.classList.remove('invalid');
  el.classList.toggle('has-val', val!=='');

  // Live rubric update
  const rbCell = document.getElementById(`exrb_${admNo}_${subj}`);
  if(rbCell){
    if(val!==''){
      const rb = getRubric(parseFloat(val), grade, _gridExamName());
      rbCell.innerHTML = `<span class="rb-pill ${rb.class}">${rb.code}</span>`;
    } else {
      rbCell.innerHTML = '<span style="color:var(--border)">—</span>';
    }
  }

  // Live row total update (uses getSubjects — ENG/KIS, not sub-scores)
  _updateRowTotal(grade, admNo);
}

function onSubScoreInput(el, grade, admNo, parentSubj){
  const val = el.value.trim();
  const subs = getParentSubs(grade)[parentSubj]; // grade-aware: ['GRA','COMP'] or ['ENG PP1','ENG PP2']

  // Validate sub-score (each component can be 0-100)
  if(val!=='' && (isNaN(val)||parseFloat(val)<0||parseFloat(val)>100)){
    el.classList.add('invalid'); return;
  }
  el.classList.remove('invalid');
  el.classList.toggle('has-val', val!=='');

  // Auto-calculate parent (ENG or KIS) = sum of sub-scores
  const s0 = document.getElementById(`exsc_${admNo}_${subs[0]}`);
  const s1 = document.getElementById(`exsc_${admNo}_${subs[1]}`);
  const v0 = s0 && s0.value!=='' && !isNaN(s0.value) ? parseFloat(s0.value) : null;
  const v1 = s1 && s1.value!=='' && !isNaN(s1.value) ? parseFloat(s1.value) : null;

  const parentInput = document.getElementById(`exsc_${admNo}_${parentSubj}`);
  if(parentInput){
    if(v0!==null || v1!==null){
      const sum = (v0||0) + (v1||0);
      parentInput.value = sum;
      parentInput.classList.add('has-val');
      // Update rubric for parent
      const rb = getRubric(sum, grade, _gridExamName());
      const rbCell = document.getElementById(`exrb_${admNo}_${parentSubj}`);
      if(rbCell) rbCell.innerHTML = `<span class="rb-pill ${rb.class}">${rb.code}</span>`;
    } else {
      parentInput.value = '';
      parentInput.classList.remove('has-val');
      const rbCell = document.getElementById(`exrb_${admNo}_${parentSubj}`);
      if(rbCell) rbCell.innerHTML = '<span style="color:var(--border)">—</span>';
    }
  }

  // Update row total
  _updateRowTotal(grade, admNo);
}

function _updateRowTotal(grade, admNo){
  // Total uses ENG and KIS (the parent values), not GRA/COMP/LUG/INS
  const subjects = getSubjects(grade);
  let total = 0, count = 0;
  subjects.forEach(s=>{
    const inp = document.getElementById(`exsc_${admNo}_${s}`);
    if(inp && inp.value!=='' && !isNaN(inp.value)){total+=parseFloat(inp.value);count++;}
  });
  const totalCell = document.getElementById(`extotal_${admNo}`);
  if(totalCell) totalCell.textContent = count>0?total:'';
  const row = document.getElementById(`exrow_${admNo}`);
  if(row) row.classList.toggle('has-scores', count>0);
}

function buildFooterMeans(activeSubjs, grade, examName, term, year){
  const foot = document.getElementById('ex_classTableFoot');
  const saved = db.exams.filter(e=>e.grade===grade&&(!examName||(e.examName||'')=== examName)&&e.term===term&&e.year===year);
  if(!saved.length){ foot.innerHTML=''; return; }
  const meanCells = activeSubjs.map(s=>{
    const vals = saved.map(e=>e.scores?.[s]).filter(v=>v!==undefined);
    const mean = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—';
    // ENG/KIS (and grade-9 SCIE) have 4 columns (sub1, sub2, parent, rb), others have 2 (val, rb)
    const span = (s==='ENG'||s==='KIS'||(s==='SCIE'&&isScieSplit(grade))) ? 4 : 2;
    return `<td colspan="${span}" style="text-align:center;font-size:11px">${mean}</td>`;
  }).join('');
  foot.innerHTML = `<tr>
    <td colspan="3" style="padding:6px 10px;font-size:11px;color:var(--gold)">Class Mean (${saved.length} saved)</td>
    ${meanCells}
    <td colspan="2"></td>
  </tr>`;
}

function updateSaveSummary(grade, examName, term, year){
  const total = db.students.filter(s=>s.grade===grade).length;
  const saved = db.exams.filter(e=>e.grade===grade&&(!examName||(e.examName||'')=== examName)&&e.term===term&&e.year===year).length;
  const el = document.getElementById('ex_saveSummary');
  if(el) el.textContent = `${saved} of ${total} students have saved records`;
}

function loadExistingClassExam(){
  const examName = document.getElementById('ex_loadExisting').value;
  if(!examName) return;
  const grade = document.getElementById('ex_gradeFilter').value;

  // Set exam name field to match
  document.getElementById('ex_examName').value = examName;

  // KEY FIX: sync term + year to whatever was used when these scores were saved.
  // Without this, renderClassEntryGrid() searches with the current form values
  // (which default to the current year) and finds nothing if the exam was saved
  // under a different year or term.
  const sample = db.exams.find(e => e.grade === grade && e.examName === examName);
  if(sample){
    const termEl = document.getElementById('ex_term');
    const yearEl = document.getElementById('ex_year');
    if(termEl && sample.term) termEl.value = sample.term;
    if(yearEl && sample.year) yearEl.value = sample.year;
  } else if(typeof examRegistryDefinitionByName === 'function'){
    /* Registry-only name (created ahead of any scores) → sync its term/year */
    const def = examRegistryDefinitionByName(examName);
    if(def){
      const termEl = document.getElementById('ex_term');
      const yearEl = document.getElementById('ex_year');
      if(termEl && def.term) termEl.value = def.term;
      if(yearEl && def.year) yearEl.value = def.year;
    }
  }

  // Ensure all subjects active
  _exActiveSubjects = new Set(getSubjects(grade));
  renderSubjectChips(getSubjects(grade));
  renderClassEntryGrid();
  toast(`📂 Loaded: ${examName}`);
}

function saveClassExamScores(){
  const grade = document.getElementById('ex_gradeFilter').value;
  const examName = document.getElementById('ex_examName').value.trim();
  if(!grade) return toast('Select a grade first',true);
  if(!examName) return toast('Enter an exam name first',true);

  const term = document.getElementById('ex_term').value;
  const year = parseInt(document.getElementById('ex_year').value);
  const subjects = getSubjects(grade);
  const students = db.students.filter(s=>s.grade===grade);

  let savedCount = 0, skippedCount = 0;
  const isTeacherSave = (getCurrentRole() !== 'admin');
  const _removedCalls = [];   // {admNo, subjects} tombstoned server-side
  const _forceMap = {};       // examKey -> [subjects] explicit re-add intent

  students.forEach(stu=>{
    const scores={}, rubrics={}, subScores={};
    // Raw as-typed values (pre-conversion) for the raw-scores store. Only
    // persisted for brand-new records — edits to existing records stay
    // processed-level so converted history is never mislabeled as raw.
    const rawScoresC={}, rawSubsC={};
    let total=0, hasAny=false;
    const existingRec = db.exams.find(e=>e.admNo===stu.admNo&&e.examName===examName&&e.term===term&&e.year===year);
    // Score conversion (raw marks -> %): active only when constants were set
    // for this grade level + exam; otherwise values pass through untouched.
    const conv = (typeof getConvCfg==='function') ? getConvCfg(grade, examName) : null;
    const engPlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'ENG') : null;
    const kisPlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'KIS') : null;
    const sciePlan = (typeof convParentPlan==='function') ? convParentPlan(grade, conv, 'SCIE') : null;
    subjects.forEach(s=>{
      // ENG, KIS (and grade-9 SCIE) are auto-calculated from sub-scores; their
      // inputs are readonly but still have values set by onSubScoreInput.
      // With conversion active, the parent is recomputed from converted
      // components below instead.
      const inp = document.getElementById(`exsc_${stu.admNo}_${s}`);
      let v = (inp && inp.value!=='' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
      const storedHasS = !!(existingRec && existingRec.scores && existingRec.scores[s]!==undefined);
      // Dirty = user-typed AND different from the stored (converted) value —
      // retyping the identical number counts as untouched, never reconverted.
      const dirtyS = ((typeof _inputDirty==='function') ? _inputDirty(inp) : true) &&
        !(storedHasS && existingRec.scores[s]===v);
      // Raw = typed (dirty) or brand-new values only — never converted displays.
      if(v!==null && (dirtyS || !existingRec)) rawScoresC[s] = v;
      if(s!=='ENG' && s!=='KIS' && !(s==='SCIE' && sciePlan)){
        // Convert typed/new values only; untouched stored values are converted already.
        if(v!==null && conv && typeof convConvertSimple==='function' && (dirtyS || !storedHasS))
          v = convConvertSimple(v, conv.simple && conv.simple[s] && conv.simple[s].max);
      } else if((s==='ENG' && engPlan) || (s==='KIS' && kisPlan) || (s==='SCIE' && sciePlan)){
        v = null; // recomputed from converted components below
      }
      // Defense in depth: a teacher save can never change a score that was
      // already saved, even if a locked input were somehow altered client-side.
      if(isTeacherSave && existingRec && existingRec.scores && existingRec.scores[s]!==undefined){
        v = existingRec.scores[s];
      }
      if(v!==null && v>=0){
        scores[s]=v;
        rubrics[s]=(isTeacherSave && existingRec && existingRec.rubrics && existingRec.rubrics[s]) ? existingRec.rubrics[s] : getRubric(v, grade, examName);
        total+=v;
        hasAny=true;
      }
    });
    // Capture sub-scores (grade-aware) for round-trip — converted when active
    const engSubs = getEngSubs(grade);
    const kisSubs = getKisSubs(grade);
    const scieSubs = getScieSubs(grade);
    [...engSubs, ...kisSubs, ...scieSubs].forEach(sub=>{
      const inp = document.getElementById(`exsc_${stu.admNo}_${sub}`);
      let v = (inp && inp.value!=='' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
      const storedHasSub = !!(existingRec && existingRec.subScores && existingRec.subScores[sub]!==undefined);
      const dirtySub = ((typeof _inputDirty==='function') ? _inputDirty(inp) : true) &&
        !(storedHasSub && existingRec.subScores[sub]===v);
      if(v!==null && (dirtySub || !existingRec)) rawSubsC[sub] = v; // typed/new only
      if(isTeacherSave && existingRec && existingRec.subScores && existingRec.subScores[sub]!==undefined){
        v = existingRec.subScores[sub];
      } else if(v!==null && typeof convConvertSub==='function'){
        const parent = engSubs.includes(sub) ? 'ENG' : (kisSubs.includes(sub) ? 'KIS' : 'SCIE');
        v = (dirtySub || !storedHasSub) ? convConvertSub(grade, conv, parent, sub, v) : v;
      }
      if(v!==null) subScores[sub] = v;
    });
    // Also capture legacy keys for backward compat
    ['GRA','COMP','LUG','INS'].forEach(sub=>{
      const inp = document.getElementById(`exsc_${stu.admNo}_${sub}`);
      let v = (inp && inp.value!=='' && !isNaN(inp.value)) ? parseFloat(inp.value) : null;
      if(v!==null) subScores[sub] = v;
    });
    // Consolidate 7-9 components (same mirror as individual entry): fresh
    // PP1/PP2 values overwrite stale GRA/COMP/LUG/INS so all readers agree.
    if(['7','8','9'].includes((grade||'').charAt(0))){
      if(subScores['ENG PP1'] !== undefined) subScores['GRA'] = subScores['ENG PP1'];
      if(subScores['ENG PP2'] !== undefined) subScores['COMP'] = subScores['ENG PP2'];
      if(subScores['KIS PP1'] !== undefined) subScores['LUG'] = subScores['KIS PP1'];
      if(subScores['KIS PP2'] !== undefined) subScores['INS'] = subScores['KIS PP2'];
    }
    // With conversion active, rebuild ENG/KIS (and grade-9 SCIE) totals from
    // the converted components (subScores above hold converted-or-preserved
    // values, so the sum is exact). Teacher-saved parents stay locked.
    [['ENG', engPlan, engSubs], ['KIS', kisPlan, kisSubs], ['SCIE', sciePlan, scieSubs]].forEach(function(trio){
      const parent = trio[0], plan = trio[1], subs = trio[2];
      if(!plan){
        // No conversion constants: the parent is the direct sum of its two
        // papers — enforce it so a stale/typed parent can't disagree with
        // the components. Direct (component-less) parents are left as typed.
        const ca = subScores[subs[0]], cb = subScores[subs[1]];
        if(subs.length === 2 && (typeof ca === 'number' || typeof cb === 'number')){
          if(scores[parent] !== undefined) total -= scores[parent];
          const ps = (typeof ca === 'number' ? ca : 0) + (typeof cb === 'number' ? cb : 0);
          scores[parent] = ps; rubrics[parent] = getRubric(ps, grade, examName); total += ps;
        }
        return;
      }
      const keepLocked = isTeacherSave && existingRec && existingRec.scores &&
        existingRec.scores[parent]!==undefined && scores[parent]!==undefined;
      if(keepLocked) return;
      const tot = (typeof convParentTotal==='function') ? convParentTotal(
        subScores[subs[0]]!==undefined ? subScores[subs[0]] : null,
        subScores[subs[1]]!==undefined ? subScores[subs[1]] : null) : null;
      if(tot===null){
        if(existingRec && existingRec.scores && existingRec.scores[parent]!==undefined)
          _removedCalls.push({admNo:stu.admNo, subjects:[parent]});
        delete scores[parent]; delete rubrics[parent]; return;
      }
      if(scores[parent]!==undefined){ total -= scores[parent]; }
      else { hasAny = true; }
      scores[parent]=tot; rubrics[parent]=getRubric(tot, grade, examName); total+=tot;
    });
    if(hasAny){
      db.exams = db.exams.filter(e=>!(e.admNo===stu.admNo&&e.examName===examName&&e.term===term&&e.year===year));
      db.exams.push({admNo:stu.admNo,name:stu.fullName,grade,term,year,examName,examCode:examCode(examName,term,year),scores,rubrics,subScores,total});
      savedCount++;
      // Persist typed raw values into the raw row (merge; untouched cells
      // keep their earlier raw). Brand-new records capture everything typed.
      if((Object.keys(rawScoresC).length || Object.keys(rawSubsC).length) && typeof mergeRawRow==='function')
        mergeRawRow(stu.admNo, examName, term, year, stu, grade, examCode(examName,term,year), rawScoresC, rawSubsC);
      // Diff vs previous record: cleared inputs tombstone the subject
      // server-side (stale devices can't resurrect); newly-appearing
      // subjects are staged as explicit re-add intent.
      if(existingRec && existingRec.scores){
        const prevKeys = Object.keys(existingRec.scores);
        const rem = prevKeys.filter(s => scores[s]===undefined &&
          (()=>{ const el=document.getElementById(`exsc_${stu.admNo}_${s}`); return el && el.value===''; })());
        if(rem.length) _removedCalls.push({admNo:stu.admNo, subjects:rem});
        const add = Object.keys(scores).filter(s => existingRec.scores[s]===undefined);
        if(add.length) _forceMap[_ssExamKey(stu.admNo,examName,term,year)] = add;
      }
    } else {
      skippedCount++;
    }
  });

  if(!savedCount) return toast('No scores entered — nothing saved',true);
  _removedCalls.forEach(c => _removeExamSubjectsRemote(c.admNo, examName, term, year, c.subjects));
  _stageForceSubjects(_forceMap);
  recalcRanks(); saveDB(); updateCounts();
  toast('✅ Saved ' + savedCount + ' student record' + (savedCount!==1?'s':'') + (skippedCount?' ('+skippedCount+' skipped — no scores)':'') + '!');
  renderClassEntryGrid();
  // Refresh exam name dropdown
  onExamSetupChange();
}

function clearClassScores(){
  const grade = document.getElementById('ex_gradeFilter').value;
  if(!grade) return;
  const subjects = getSubjects(grade);
  const students = db.students.filter(s=>s.grade===grade);
  students.forEach(stu=>{
    // Clear main subject inputs
    subjects.forEach(s=>{
      const inp = document.getElementById(`exsc_${stu.admNo}_${s}`);
      if(inp){ inp.value=''; inp.classList.remove('has-val','invalid'); }
      const rb = document.getElementById(`exrb_${stu.admNo}_${s}`);
      if(rb) rb.innerHTML='<span style="color:var(--border)">—</span>';
    });
    // Also clear sub-score inputs (grade-aware, incl. grade-9 SCIE papers)
    const engSubs = getEngSubs(grade);
    const kisSubs = getKisSubs(grade);
    const scieSubs = getScieSubs(grade);
    [...engSubs, ...kisSubs, ...scieSubs].forEach(sub=>{
      const inp = document.getElementById(`exsc_${stu.admNo}_${sub}`);
      if(inp){ inp.value=''; inp.classList.remove('has-val','invalid'); }
    });
    // Also clear legacy keys
    ['GRA','COMP','LUG','INS'].forEach(sub=>{
      const inp = document.getElementById(`exsc_${stu.admNo}_${sub}`);
      if(inp){ inp.value=''; inp.classList.remove('has-val','invalid'); }
    });
    const tot = document.getElementById(`extotal_${stu.admNo}`);
    if(tot) tot.textContent='';
    const row = document.getElementById(`exrow_${stu.admNo}`);
    if(row) row.classList.remove('has-scores');
  });
}

// Keep old filterExamStudents, loadExamForm, saveExamScores, clearExamScores for backward compat
function filterExamStudents(){ onExamSetupChange(); }
function loadExamForm(){ renderClassEntryGrid(); }
function saveExamScores(){ saveClassExamScores(); }
function clearExamScores(){ clearClassScores(); }
function recalcRanks(){
  // Rank per unique (examName + grade) — highest total = rank 1
  const keys=[...new Set(db.exams.map(e=>(e.examName||'')+'|||'+e.grade))];
  keys.forEach(key=>{
    const [examName,grade]=key.split('|||');
    const group=db.exams.filter(e=>(e.examName||'')===examName&&e.grade===grade);
    [...group].sort((a,b)=>b.total-a.total).forEach((e,i)=>e.rank=i+1);
  });
}
function renderExamsTable(){
  // Refresh exam name filter dropdown
  const examNameSel = document.getElementById('examNameF');
  if(examNameSel){
    const names = [...new Set(db.exams.map(e => e.examName||'Untitled Exam'))].sort();
    const cur = examNameSel.value;
    examNameSel.innerHTML = '<option value="">All Exams</option>';
    names.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n;
      if(n === cur) o.selected = true;
      examNameSel.appendChild(o);
    });
  }
  const search    = document.getElementById('examSearch').value.toLowerCase();
  const gradeF    = document.getElementById('examGradeF2').value;
  const termF     = document.getElementById('examTermF').value;
  const examNameF = examNameSel ? examNameSel.value : '';
  const filtered  = db.exams.filter(e =>
    (!gradeF    || e.grade === gradeF) &&
    (!termF     || e.term  === termF)  &&
    (!examNameF || (e.examName||'Untitled Exam') === examNameF) &&
    (!search    || e.name.toLowerCase().includes(search) || e.admNo.toLowerCase().includes(search))
  );

  // GROUPED CARD VIEW
  const cardsEl = document.getElementById('examGroupCards');
  if(cardsEl){
    if(!filtered.length){
      cardsEl.innerHTML = '<div class="card" style="grid-column:1/-1"><div class="card-body">' +
        '<div class="empty-state"><div class="empty-icon">📝</div>' +
        '<p>No exam records found. Load sample data or enter scores to get started.</p>' +
        '</div></div></div>';
    } else {
      const groups = {};
      filtered.forEach(e => {
        const en = e.examName || 'Untitled Exam';
        if(!groups[en]) groups[en] = {};
        if(!groups[en][e.grade]) groups[en][e.grade] = [];
        groups[en][e.grade].push(e);
      });
      let html = '';
      Object.keys(groups).sort().forEach(en => {
        const gradeMap = groups[en];
        const grades   = Object.keys(gradeMap).sort();
        const allRecs  = grades.reduce((arr, g) => arr.concat(gradeMap[g]), []);
        const total    = allRecs.length;
        const topRec   = allRecs.reduce((b, e) => (!b || e.total > b.total) ? e : b, null);
        const allTerms = [...new Set(allRecs.map(e => e.term + ' ' + e.year))].join(', ');
        const enSafe   = en.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
        let badgeHtml  = '';
        grades.forEach(g => {
          const cnt = gradeMap[g].length;
          badgeHtml += '<span class="badge badge-blue" style="cursor:pointer;padding:4px 10px"' +
            ' data-exam="' + enSafe + '" data-grade="' + g + '"' +
            ' onclick="event.stopPropagation();_drillByAttr(this)">' +
            g + ' <span style="opacity:.7;font-size:10px">(' + cnt + ')</span></span>';
        });
        const topHtml = topRec
          ? '<div style="flex:1;text-align:right"><div style="font-size:11px;color:var(--text-muted)">\uD83E\uDD47 Top scorer</div>' +
            '<div style="font-weight:700;font-size:13px;color:var(--text-primary)">' + topRec.name + '</div>' +
            '<div style="font-size:11px;color:var(--gold);font-weight:700">' + topRec.total + ' pts &middot; ' + topRec.grade + '</div></div>'
          : '';
        html +=
          '<div style="cursor:pointer"' +
          ' data-exam="' + enSafe + '" data-grade="' + grades[0] + '" onclick="_drillByAttr(this)" class="card exam-result-card">' +
          '<div class="card-header" style="background:linear-gradient(135deg,rgba(30,86,200,0.15),transparent)">' +
          '<div class="card-title" style="color:var(--sky);font-size:15px">\uD83D\uDCCB ' + enSafe + '</div>' +
          '<span style="font-size:11px;color:var(--text-muted)">' + allTerms + '</span></div>' +
          '<div class="card-body" style="padding:12px 16px">' +
          '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">' +
          '<div style="text-align:center"><div style="font-size:22px;font-weight:800;font-family:JetBrains Mono,monospace;color:var(--gold)">' + total + '</div>' +
          '<div style="font-size:10px;color:var(--text-muted);text-transform:uppercase">Records</div></div>' +
          '<div style="text-align:center"><div style="font-size:22px;font-weight:800;font-family:JetBrains Mono,monospace;color:var(--sky)">' + grades.length + '</div>' +
          '<div style="font-size:10px;color:var(--text-muted);text-transform:uppercase">Grades</div></div>' +
          topHtml + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px">' + badgeHtml + '</div>' +
          '<div style="margin-top:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">' +
          '<div style="font-size:11px;color:var(--sky);font-weight:600">Click card to open &bull; or tap a grade badge</div>' +
          '<button class="btn btn-ghost btn-sm" style="font-size:10px" onclick="event.stopPropagation();archiveExamByName(this)" data-exam="' + enSafe + '" title="Move this exam to the edited-exams bin (data kept, hidden from records)">🗃 Archive</button>' +
          '</div>' +
          '</div></div>';
      });
      cardsEl.innerHTML = html;
    }
  }
  if(typeof renderArchiveBin === 'function'){ try{ renderArchiveBin(); }catch(e){} }

  // FLAT TABLE VIEW
  const flatHead = document.getElementById('examsTHead');
  const flatBody = document.getElementById('examsTBody');
  if(flatHead && flatBody){
    const hasLP     = filtered.some(e => ['1','2','3'].includes(e.grade.charAt(0)));
    const hasPTE   = filtered.some(e => ['7','8','9'].includes(e.grade.charAt(0)));
    const subjects = hasLP ? SUBJ_LP : (hasPTE ? SUBJ_789 : SUBJ_456);
    flatHead.innerHTML = '<tr><th>Rank</th><th>Student</th><th>Grade</th><th>Exam</th><th>Term</th>' +
      subjects.map(s => '<th>' + s + '</th><th style="font-size:10px">Rb</th>').join('') +
      '<th>TOTAL</th></tr>';
    if(!filtered.length){
      flatBody.innerHTML = '<tr><td colspan="' + (5 + subjects.length*2 + 1) + '">' +
        '<div class="empty-state"><div class="empty-icon">📝</div><p>No records.</p></div></td></tr>';
    } else {
      flatBody.innerHTML = [...filtered].sort((a,b) => b.total - a.total).map(e => {
        const rc = e.rank===1?'var(--gold)':e.rank===2?'#ccc':e.rank===3?'#cd7f32':'inherit';
        const cols = subjects.map(s => {
          const sc = e.scores[s] !== undefined ? e.scores[s] : '—';
          const rb = (typeof _rubricTag==='function') ? _rubricTag(e, s) :
            (e.rubrics[s] ? '<span class="rubric-tag ' + e.rubrics[s].class + '">' + e.rubrics[s].code + '</span>' : '—');
          return '<td style="font-family:JetBrains Mono,monospace;font-weight:600;font-size:12px">' + sc + '</td><td style="text-align:center">' + rb + '</td>';
        }).join('');
        return '<tr><td style="font-weight:800;color:' + rc + ';text-align:center">' + (e.rank||'\u2014') + '</td>' +
          '<td style="font-weight:600">' + e.name + '</td>' +
          '<td><span class="badge badge-blue">' + e.grade + '</span></td>' +
          '<td style="font-size:12px;color:var(--gold);font-weight:600">' + (e.examName||'\u2014') + '</td>' +
          '<td style="font-size:12px;color:var(--text-muted)">' + e.term + ' ' + e.year + '</td>' +
          cols +
          '<td style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--gold);font-size:14px">' + e.total + '</td></tr>';
      }).join('');
    }
  }
}

function _drillByAttr(el){
  var exam = el.getAttribute('data-exam');
  var grade = el.getAttribute('data-grade');
  if(exam && grade) openExamDrill(exam, grade);
}

let _examViewMode = 'grouped';
function toggleExamView(){
  _examViewMode = _examViewMode === 'grouped' ? 'flat' : 'grouped';
  document.getElementById('examGroupedView').style.display = _examViewMode === 'grouped' ? '' : 'none';
  document.getElementById('examFlatView').style.display    = _examViewMode === 'flat'    ? '' : 'none';
  document.getElementById('examViewToggle').textContent    = _examViewMode === 'grouped' ? '\u2630 Table View' : '\u229E Grouped View';
}

function openExamDrill(examName, grade){
  const records = db.exams
    .filter(e => (e.examName||'Untitled Exam') === examName && e.grade === grade)
    .sort((a,b) => b.total - a.total);
  if(!records.length){ toast('No records for ' + grade, true); return; }
  const subjects = getSubjects(grade);
  document.getElementById('drillTitle').textContent    = '\uD83D\uDCCB ' + examName;
  document.getElementById('drillSubtitle').textContent = 'Grade ' + grade + '  \u2022  ' + (records[0]?.term||'') + ' ' + (records[0]?.year||'');
  document.getElementById('drillGradeBadge').textContent = 'Grade ' + grade;
  document.getElementById('drillCountBadge').textContent = records.length + ' students';

  // Header: # | Name | subj | Rb | ... | Total | Rank
  let thHtml = '<tr><th style="width:32px;text-align:center">#</th><th style="min-width:160px">Student Name</th>';
  const _csAdmin = (typeof getCurrentRole === 'function' && getCurrentRole() === 'admin');
  const _dTerm = (records[0] && records[0].term) || '', _dYear = (records[0] && records[0].year) || '';
  const _csBtn = function(s){
    if(!_csAdmin) return '';
    return '<br><button class="btn btn-ghost btn-sm" style="font-size:9px;padding:1px 6px;color:var(--rose)" ' +
      'title="Clear submitted ' + s + ' scores for this exam + grade (admin)" ' +
      'onclick="event.stopPropagation();openClearSubjectCol(this)" ' +
      'data-exam="' + _csAttr(examName) + '" data-grade="' + _csAttr(grade) + '" ' +
      'data-term="' + _csAttr(_dTerm) + '" data-year="' + _csAttr(_dYear) + '" data-sub="' + _csAttr(s) + '">🧹 clear</button>';
  };
  subjects.forEach(s => { thHtml += '<th style="min-width:48px;text-align:center">' + s + _csBtn(s) + '</th><th style="min-width:38px;font-size:10px;text-align:center">Rb</th>'; });
  thHtml += '<th style="min-width:50px;text-align:center">Total</th><th style="min-width:42px;text-align:center">Rank</th></tr>';
  document.getElementById('drillTHead').innerHTML = thHtml;

  // Body rows sorted desc by total
  let tbHtml = '';
  records.forEach((e, i) => {
    const pos   = i + 1;
    const rc    = pos===1?'var(--gold)':pos===2?'#c0c0c0':pos===3?'#cd7f32':'var(--text-secondary)';
    const medal = pos===1?'\uD83E\uDD47':pos===2?'\uD83E\uDD48':pos===3?'\uD83E\uDD49':'';
    const rowBg = i%2===0 ? 'background:rgba(30,86,200,0.04)' : '';
    let cols = '';
    subjects.forEach(s => {
      const sc = e.scores[s] !== undefined ? e.scores[s] : '—';
      const rb = _rubricTag(e, s);
      cols += '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-weight:600">' + sc + '</td><td style="text-align:center">' + rb + '</td>';
    });
    tbHtml += '<tr style="' + rowBg + '">' +
      '<td style="text-align:center;color:var(--text-muted);font-size:11px">' + pos + '</td>' +
      '<td style="font-weight:600;padding:7px 12px">' + e.name + '</td>' +
      cols +
      '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-weight:800;color:var(--gold);font-size:14px">' + e.total + '</td>' +
      '<td style="text-align:center;font-weight:800;color:' + rc + '">' + medal + ' ' + pos + '</td></tr>';
  });

  // Class means row at bottom
  const means = subjects.map(s => {
    const vals = records.filter(e => e.scores[s] !== undefined).map(e => e.scores[s]);
    return vals.length ? (vals.reduce((a,b) => a+b, 0)/vals.length).toFixed(1) : '\u2014';
  });
  const totalMean = records.length ? (records.reduce((a,e) => a+e.total, 0)/records.length).toFixed(1) : '\u2014';
  tbHtml += '<tr style="background:var(--surface-2);border-top:2px solid var(--border-bright)">' +
    '<td></td><td style="font-weight:800;font-size:11px;color:var(--gold);padding:7px 12px;text-transform:uppercase;letter-spacing:.06em">Class Mean</td>';
  subjects.forEach((s, i) => {
    tbHtml += '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-weight:700;color:var(--sky)">' + means[i] + '</td><td></td>';
  });
  tbHtml += '<td style="text-align:center;font-family:JetBrains Mono,monospace;font-weight:800;color:var(--gold)">' + totalMean + '</td><td></td></tr>';
  document.getElementById('drillTBody').innerHTML = tbHtml;

  // Stats bar + grade switcher
  const highest = records[0], lowest = records[records.length-1];
  const otherGrades = [...new Set(db.exams.filter(e => (e.examName||'Untitled Exam') === examName && e.grade !== grade).map(e => e.grade))].sort();
  let switchHtml = '';
  if(otherGrades.length){
    switchHtml = '<div style="flex:1;text-align:right;display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap">' +
      '<span style="font-size:11px;color:var(--text-muted)">Other grades:</span>';
    otherGrades.forEach(g => {
      const gSafe = g.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const enSafe = examName.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      switchHtml += '<span class="badge badge-blue" style="cursor:pointer;padding:5px 12px;font-size:12px"' +
        ' data-exam="' + enSafe + '" data-grade="' + gSafe + '" onclick="_drillByAttr(this)">Grade ' + g + '</span>';
    });
    switchHtml += '</div>';
  }
  document.getElementById('drillStats').innerHTML =
    '<div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Highest</div>' +
    '<div style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--emerald);font-size:18px">' + (highest?.total||'\u2014') + '</div>' +
    '<div style="font-size:11px;color:var(--text-secondary)">' + (highest?.name||'') + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Lowest</div>' +
    '<div style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--rose);font-size:18px">' + (lowest?.total||'\u2014') + '</div>' +
    '<div style="font-size:11px;color:var(--text-secondary)">' + (lowest?.name||'') + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Class Mean</div>' +
    '<div style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--gold);font-size:18px">' + totalMean + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px">Students</div>' +
    '<div style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--sky);font-size:18px">' + records.length + '</div></div>' +
    switchHtml;

  const _dm = document.getElementById('examDrillModal');
  _dm.style.display = '';
  // Jump to the top: immediately, after layout, and once more after late
  // shifts (fonts/table settle on phones) — grade results always open
  // at the top so nothing must be scrolled up manually.
  function _dmTop(){ _dm.scrollTop = 0; try{ window.scrollTo(0, 0); }catch(e){} }
  _dmTop();
  if(typeof requestAnimationFrame === 'function') requestAnimationFrame(_dmTop);
  setTimeout(_dmTop, 300);
  document.body.style.overflow = 'hidden';
}

function closeExamDrill(){
  document.getElementById('examDrillModal').style.display = 'none';
  document.body.style.overflow = '';
}


/* ═══ CLASS LISTS & REPORTS ═══ */

function getCheckedCols(){
  return {
    num:        document.getElementById('col_num')?.checked        ?? true,
    admNo:      document.getElementById('col_admNo')?.checked      ?? true,
    nemis:      document.getElementById('col_nemis')?.checked      ?? true,
    assessment: document.getElementById('col_assessment')?.checked ?? true,
    name:       true, // always on
    gender:     document.getElementById('col_gender')?.checked     ?? true,
    parent:     document.getElementById('col_parent')?.checked     ?? true,
    phone:      document.getElementById('col_phone')?.checked      ?? true,
  };
}

function selectAllCols(val){
  ['col_num','col_admNo','col_nemis','col_assessment','col_gender','col_parent','col_phone'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.checked=val;
  });
  renderClassList();
}

function toggleColSelector(){
  const body=document.getElementById('colSelectorBody');
  const toggle=document.getElementById('colSelectorToggle');
  if(!body||!toggle)return;
  const isHidden=body.style.display==='none';
  body.style.display=isHidden?'':'none';
  toggle.textContent=isHidden?'▼':'▶';
}

function renderClassList(){
  const grade=document.getElementById('classListGrade').value;
  const students=[...db.students.filter(s=>s.grade===grade)].sort((a,b)=>a.fullName.localeCompare(b.fullName));
  const teacher=getClassTeacher(grade);
  const cols=getCheckedCols();

  document.getElementById('classListTitle').innerText=`Class ${grade} — ${students.length} Students`;
  document.getElementById('classTeacherInfo').innerText=teacher?`Class Teacher: ${fmtTeacher(teacher.name)} (${teacher.phone})`:'No class teacher assigned';

  // Build dynamic header
  const thead=document.getElementById('classListHead');
  if(thead){
    let ths='<tr>';
    if(cols.num) ths+='<th>#</th>';
    ths+='<th>Full Name</th>'; // Name always first after #
    if(cols.admNo)      ths+='<th>Adm No</th>';
    if(cols.nemis)      ths+='<th>NEMIS</th>';
    if(cols.assessment) ths+='<th>Assessment</th>';
    if(cols.gender)     ths+='<th>Gender</th>';
    if(cols.parent)     ths+='<th>Parent/Guardian</th>';
    if(cols.phone)      ths+='<th>Phone</th>';
    ths+='</tr>';
    thead.innerHTML=ths;
  }

  const tbody=document.getElementById('classListBody');
  if(!students.length){
    const colCount=Object.values(cols).filter(Boolean).length||2;
    tbody.innerHTML=`<tr><td colspan="${colCount}"><div class="empty-state"><div class="empty-icon">📋</div><p>No students in Grade ${grade}.</p></div></td></tr>`;
  } else {
    tbody.innerHTML=students.map((s,i)=>{
      let row='<tr>';
      if(cols.num)        row+=`<td style="color:var(--text-muted)">${i+1}</td>`;
      row+=`<td style="font-weight:600">${s.fullName}</td>`;
      if(cols.admNo)      row+=`<td><span class="adm-badge">${s.admNo}</span></td>`;
      if(cols.nemis)      row+=`<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${s.nemis||'-'}</td>`;
      if(cols.assessment) row+=`<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${s.assessment||'-'}</td>`;
      if(cols.gender)     row+=`<td>${s.gender==='Male'?'👦 Male':'👧 Female'}</td>`;
      if(cols.parent)     row+=`<td>${s.parent||'-'}</td>`;
      if(cols.phone)      row+=`<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px">${s.phone||'-'}</td>`;
      row+='</tr>';
      return row;
    }).join('');
  }

  // Summary bar
  const boys=students.filter(s=>s.gender==='Male').length;
  const girls=students.filter(s=>s.gender==='Female').length;
  const sumEl=document.getElementById('classListSummary');
  if(sumEl){
    sumEl.innerHTML=students.length?`
      <div style="font-weight:700;color:var(--gold);font-size:14px">Total: ${students.length}</div>
      <div style="color:var(--sky)">👦 Boys: <strong>${boys}</strong></div>
      <div style="color:var(--rose)">👧 Girls: <strong>${girls}</strong></div>
      <div style="margin-left:auto;font-size:11px;color:var(--text-muted)">Sorted alphabetically by name</div>
    `:'';
  }
}
function renderReports(){
  // Populate exam selector
  const rptExamSel=document.getElementById('rptExam');
  if(rptExamSel){
    const names=[...new Set(db.exams.map(e=>e.examName||'Untitled Exam'))].sort();
    const cur=rptExamSel.value;
    rptExamSel.innerHTML='<option value="">-- Select Exam --</option>';
    names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;if(n===cur)o.selected=true;rptExamSel.appendChild(o);});
  }
  const examFilter=rptExamSel?rptExamSel.value:'';
  const grade=document.getElementById('rptGrade').value;

  // Show prompt if no exam selected
  const noExamMsg=document.getElementById('rptNoExamMsg');
  const rptContent=document.getElementById('rptContent');
  if(!examFilter){
    if(noExamMsg)noExamMsg.style.display='';
    if(rptContent)rptContent.style.display='none';
    return;
  }
  if(noExamMsg)noExamMsg.style.display='none';
  if(rptContent)rptContent.style.display='';

  const exams=db.exams.filter(e=>(!examFilter||(e.examName||'Untitled Exam')===examFilter)&&(!grade||e.grade===grade));

  // Re-rank within this filtered exam for display
  const gradeRanks={};
  ALL_GRADES.forEach(g=>{
    const ge=[...exams.filter(e=>e.grade===g)].sort((a,b)=>b.total-a.total);
    ge.forEach((e,i)=>gradeRanks[e.admNo+'|'+e.examName]=i+1);
  });

  const top10=[...exams].sort((a,b)=>b.total-a.total).slice(0,10);
  const t10El=document.getElementById('top10Body');
  if(!top10.length)t10El.innerHTML='<div class="empty-state"><div class="empty-icon">🥇</div><p>No data.</p></div>';
  else{t10El.innerHTML=top10.map((e,i)=>{const m=i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-muted)">#${i+1}</span>`;return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="font-size:20px;width:30px;text-align:center">${m}</div><div style="flex:1"><div style="font-weight:600;font-size:13px">${e.name}</div><div style="font-size:11px;color:var(--text-muted)">${e.admNo} • ${e.grade} • <span style="color:var(--gold)">${e.examName||''}</span></div></div><div style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:800;font-size:18px;color:var(--gold)">${e.total}</div></div>`;}).join('');}
  const subjList=grade&&['7','8','9'].includes(grade[0])?SUBJ_789:ALL_SUBJ;
  const saEl=document.getElementById('subjAnalysisBody');
  if(!exams.length)saEl.innerHTML='<div class="empty-state"><div class="empty-icon">📈</div><p>No data.</p></div>';
  else{saEl.innerHTML=subjList.map(s=>{const scores=exams.map(e=>e.scores[s]).filter(v=>v!==undefined);if(!scores.length)return'';const avg=scores.reduce((a,b)=>a+b,0)/scores.length;return`<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${avg}%"></div></div><div class="bar-val">${avg.toFixed(1)}</div></div>`;}).join('');}
  const tpsEl=document.getElementById('topPerSubjBody');
  const rows=subjList.map(s=>{const valid=exams.filter(e=>e.scores[s]!==undefined);if(!valid.length)return null;const top=valid.reduce((a,b)=>a.scores[s]>b.scores[s]?a:b);return{subj:s,top};}).filter(Boolean);
  if(!rows.length)tpsEl.innerHTML=`<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">⭐</div><p>No data.</p></div></td></tr>`;
  else{tpsEl.innerHTML=rows.map(r=>`<tr><td style="font-weight:700;color:var(--sky)">${r.subj}</td><td style="font-weight:600">${r.top.name}</td><td><span class="adm-badge">${r.top.admNo}</span></td><td><span class="badge badge-blue">${r.top.grade}</span></td><td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:800;color:var(--gold)">${r.top.scores[r.subj]}</td><td><span class="rubric-tag ${r.top.rubrics[r.subj].class}">${r.top.rubrics[r.subj].code}</span></td></tr>`).join('');}
}
function renderDashboard(){
  const dashGSel=document.getElementById('dashGradeF'),dashTSel=document.getElementById('dashTop5G');
  if(dashGSel.options.length===1){ALL_GRADES.forEach(g=>{dashGSel.add(new Option(g,g));dashTSel.add(new Option(g,g));});}
  const gradeF=dashGSel.value,top5G=dashTSel.value;updateCounts();
  const dashExams=db.exams.filter(e=>!gradeF||e.grade===gradeF);
  const dashSubjs=gradeF&&['7','8','9'].includes(gradeF[0])?SUBJ_789:ALL_SUBJ;
  const sbEl=document.getElementById('dashSubjBars');
  if(!dashExams.length)sbEl.innerHTML='<div class="empty-state"><div class="empty-icon">📊</div><p>No exam scores.</p></div>';
  else{sbEl.innerHTML=dashSubjs.map(s=>{const sc=dashExams.map(e=>e.scores[s]).filter(v=>v!==undefined);if(!sc.length)return'';const avg=sc.reduce((a,b)=>a+b,0)/sc.length;return`<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${avg}%"></div></div><div class="bar-val">${avg.toFixed(1)}</div></div>`;}).join('');}
  const t5Ex=db.exams.filter(e=>!top5G||e.grade===top5G);
  const t5List=[...t5Ex].sort((a,b)=>b.total-a.total).slice(0,5);
  const t5El=document.getElementById('dashTop5');
  if(!t5List.length)t5El.innerHTML='<div class="empty-state"><div class="empty-icon">🏆</div><p>No records.</p></div>';
  else{t5El.innerHTML=t5List.map((e,i)=>{const m=['🥇','🥈','🥉','4️⃣','5️⃣'][i];return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:18px">${m}</span><div style="flex:1"><div style="font-weight:600;font-size:13px">${e.name}</div><div style="font-size:11px;color:var(--text-muted)">Grade ${e.grade}</div></div><div style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:800;color:var(--gold);font-size:16px">${e.total}</div></div>`;}).join('');}
  const gbEl=document.getElementById('dashGradeBars');
  const hasStudents=ALL_GRADES.some(g=>db.students.some(s=>s.grade===g));
  if(!hasStudents)gbEl.innerHTML='<div class="empty-state"><div class="empty-icon">📋</div><p>No students.</p></div>';
  else{
    const maxStu=Math.max(...ALL_GRADES.map(g=>db.students.filter(s=>s.grade===g).length));
    gbEl.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">${ALL_GRADES.map(g=>{
      const sts=db.students.filter(s=>s.grade===g),cnt=sts.length;if(!cnt)return'';
      const boys=sts.filter(s=>s.gender==='Male').length,girls=sts.filter(s=>s.gender==='Female').length;
      return`<div style="background:var(--surface-2);border-radius:8px;padding:12px;border:1px solid var(--border);text-align:center"><div style="font-weight:700;color:var(--sky)">${g}</div><div style="font-size:24px;font-weight:800;font-family:'JetBrains Mono','Courier New',Courier,monospace;margin:4px 0">${cnt}</div><div class="bar-track"><div class="bar-fill" style="width:${(cnt/maxStu)*100}%"></div></div><div style="margin-top:8px;font-size:11px;color:var(--text-secondary);display:flex;justify-content:center;gap:8px"><span style="color:var(--sky)">👦${boys}</span>|<span style="color:var(--rose)">👧${girls}</span></div></div>`;
    }).join('')}</div>`;
  }
  document.getElementById('dashLowerPrimary').textContent=db.students.filter(s=>['1','2','3'].includes(s.grade.charAt(0))).length;
  document.getElementById('dashUpperPrimary').textContent=db.students.filter(s=>['4','5','6'].includes(s.grade.charAt(0))).length;
  document.getElementById('dashJuniorSchool').textContent=db.students.filter(s=>['7','8','9'].includes(s.grade.charAt(0))).length;
  document.getElementById('dashTotalBoys').textContent=db.students.filter(s=>s.gender==='Male').length;
  document.getElementById('dashTotalGirls').textContent=db.students.filter(s=>s.gender==='Female').length;
  if(typeof refreshEventTicker === 'function'){ try{ refreshEventTicker(); }catch(e){} }
}

/* ── Dashboard latest-events ticker (both roles, PC + phone) ──────────────
   Pulls the five latest events and loops them right-to-left. Content is
   rendered twice for a seamless loop; duration scales with content width. */
function relEventTime(ts){
  try{
    const t = new Date(String(ts || '').replace(' ', 'T'));
    const s = Math.max(0, Math.round((Date.now() - t.getTime()) / 1000));
    if(!(s >= 0) || s > 400 * 86400) return '';
    if(s < 60) return 'just now';
    if(s < 3600){ const m = Math.round(s / 60); return m + 'm ago'; }
    if(s < 86400){ const h = Math.round(s / 3600); return h + 'h ago'; }
    const d = Math.round(s / 86400);
    return d === 1 ? 'yesterday' : d + 'd ago';
  }catch(e){ return ''; }
}
let _tickerLoading = false;
function refreshEventTicker(){
  const track = document.getElementById('eventTickerTrack');
  if(!track || _tickerLoading) return;
  _tickerLoading = true;
  fetch('/api/activity/recent', { cache: 'no-store' }).then(r => r.json()).then(d => {
    _tickerLoading = false;
    const evs = (d && d.ok && Array.isArray(d.events)) ? d.events : [];
    if(!evs.length){
      track.style.animationDuration = '';
      track.innerHTML = '<span class="ticker-item">Welcome to Santapris — no recent activity yet</span>';
      return;
    }
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const half = evs.map(e => {
      const when = relEventTime(e.ts);
      return '<span class="ticker-item">📢 ' + esc(e.text) +
        (when ? ' <span class="ticker-when">· ' + when + '</span>' : '') +
        '</span><span class="ticker-sep">✦</span>';
    }).join('');
    track.innerHTML = half + half;   // duplicate for a seamless loop
    const w = track.scrollWidth || 1200;
    track.style.animationDuration = Math.max(12, Math.min(60, w / 45)) + 's';
    track.style.animationName = 'tickerScroll';
  }).catch(() => {
    _tickerLoading = false;
    track.innerHTML = '<span class="ticker-item">Latest activity unavailable offline</span>';
  });
}
function updateCounts(){
  const s=db.students.length,t=db.teachers.length,e=db.exams.length,b=(db.booklist||[]).length,m=(db.meanScores||[]).length;
  ['navStudents','dashStu','sideStu'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=s;});
  ['navTeachers','dashTch','sideTch'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=t;});
  ['navExams','dashEx','sideEx'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=e;if(el.dataset.target!==undefined)el.dataset.target=e;}});
  const blBadge=document.getElementById('navBooklist');if(blBadge)blBadge.textContent=b;
  const msBadge=document.getElementById('navMeanScores');if(msBadge)msBadge.textContent=m||'';
  // Update active classes counter
  const acEl=document.getElementById('dashActiveClasses');
  if(acEl){const ac=new Set(db.exams.map(e=>e.grade)).size;acEl.textContent=ac;acEl.dataset.target=ac;}
}

/* ═══ PDF GENERATION — Compact Space-Maximized ═══ */

// Shared compact header — logo left, school name + title centred (no motto)
function pdfHeader(doc, title, subtitle) {
  const W = doc.internal.pageSize.getWidth();
  const H_BAND = 30;

  // Light grey background
  doc.setFillColor(240,242,245); doc.rect(0,0,W,H_BAND,'F');
  // Dark navy accent bar + gold stripe at bottom
  doc.setFillColor(255,220,220);    doc.rect(0,H_BAND,W,1.5,'F');
  doc.setFillColor(242,199,68);  doc.rect(0,H_BAND-1,W,1,'F');

  const logoSize = 24;
  const logoX = 5;
  const logoY = (H_BAND - logoSize) / 2;
  try {
    doc.setFillColor(255,255,255);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 0.5, 'F');
    doc.addImage(SCHOOL_LOGO_DATAURL, 'JPEG', logoX, logoY, logoSize, logoSize);
  } catch(e) {}

  const textX = logoX + logoSize + 4;
  const textCX = textX + (W - textX) / 2;

  // School name — large dark navy bold
  doc.setFont('helvetica','bold'); doc.setFontSize(18);
  doc.setTextColor(11,29,58);
  doc.text('SANTAPRIS ACADEMY', textCX, 11, {align:'center'});

  // Separator
  doc.setDrawColor(0,0,0); doc.setLineWidth(0.6);
  doc.line(textX + 6, 14, W - 6, 14);

  // Document title — dark blue bold
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.setTextColor(30,60,120);
  doc.text(title, textCX, 20, {align:'center'});

  // Subtitle — medium grey
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.setTextColor(80,100,130);
  doc.text(subtitle, textCX, 27, {align:'center'});

  return H_BAND + 4;
}

function pdfFooter(doc) {
  const H = doc.internal.pageSize.getHeight(), W = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(130);
  doc.text(`Santapris Academy  •  Generated: ${new Date().toLocaleDateString('en-KE')} ${new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}  •  Confidential`,W/2,H-3,{align:'center'});
}

// Add page numbers on multi-page docs
function addPageNumbers(doc) {
  const total = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  for(let i=1;i<=total;i++){
    doc.setPage(i);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(130);
    doc.text(`Page ${i} of ${total}`,W-8,H-4,{align:'right'});
  }
}

/* ─── Student Full Report Card ─── */
function exportStudentReportCard(){
  const admNo=document.getElementById('pdf_student').value;
  const examName=document.getElementById('pdf_examName').value;
  const term=document.getElementById('pdf_term').value;
  const year=document.getElementById('pdf_year').value;
  if(!admNo)return toast('Select a student',true);
  if(!examName)return toast('Select an exam',true);
  const student=db.students.find(s=>s.admNo===admNo);
  const exam=db.exams.find(e=>e.admNo===admNo&&(e.examName||'Untitled Exam')===examName&&e.term===term&&e.year==year)
            ||db.exams.find(e=>e.admNo===admNo&&(e.examName||'Untitled Exam')===examName);
  if(!exam)return toast('No exam record found',true);
  const jsPDF=window._getJsPDF(), doc=new jsPDF({unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
  const H=doc.internal.pageSize.getHeight();
  let y=pdfHeader(doc,'STUDENT REPORT CARD',`${examName}  |  ${exam.term||term} ${exam.year||year}`);

  // Student info box
  doc.setFillColor(232,240,255); doc.roundedRect(4,y,W-8,16,2,2,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(11,29,58);
  doc.text(student.fullName.toUpperCase(),W/2,y+6,{align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(60,90,140);
  doc.text(`Adm: ${student.admNo}  |  Grade: ${student.grade}  |  NEMIS: ${student.nemis||'-'}  |  Parent: ${student.parent||'-'}  (${student.phone||'-'})`,W/2,y+12,{align:'center'});
  y+=18;

  const subjects=getSubjects(student.grade);
  const fills={EE1:[0,150,110],EE2:[0,180,130],ME1:[20,90,180],ME2:[60,130,220],AE1:[160,120,0],AE2:[200,160,0],BE1:[190,40,60],BE2:[220,80,100]};

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    head:[['SUBJECT','SCORE','%','RUBRIC','PTS','TEACHER COMMENT']],
    body:subjects.map(s=>{
      const sc=exam.scores[s];
      const rb=sc!==undefined?getRubric(sc,exam.grade,exam.examName):(exam.rubrics[s]||null);
      const comment=rb?rubricComment(rb.class):'Not entered';
      const pct=sc!==undefined?Math.round(sc)+'%':'—';
      return[subjFull(s), sc!==undefined?sc:'—', pct, rb?rb.code:'—', rb?rb.pts:'—', comment];
    }),
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8,cellPadding:2},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:{0:{cellWidth:44,fontStyle:'bold'},1:{cellWidth:14,halign:'center'},2:{cellWidth:11,halign:'center'},3:{cellWidth:16,halign:'center'},4:{cellWidth:11,halign:'center'},5:{cellWidth:'auto',fontStyle:'italic'}},
    didParseCell(d){
      if(d.section==='body'&&d.column.index===3){
        const fk=d.cell.raw?String(d.cell.raw).replace('.',''):'';
        if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
      }
      if(d.section==='body'&&d.row.index%2===0&&d.column.index!==3) d.cell.styles.fillColor=[246,249,255];
    }
  });
  y=doc.lastAutoTable.finalY+4;

  // Summary bar with class position + overall rank
  const valSubs=subjects.filter(s=>exam.scores[s]!==undefined);
  const avg=valSubs.length?(exam.total/valSubs.length).toFixed(1):0;
  const gradeLevel=(student.grade||'').charAt(0);
  const overallRank=getOverallRank(admNo,examName);
  const overallTotal=getOverallTotal(examName,gradeLevel);
  // Count students in same class for class size
  const classSize=db.exams.filter(e=>e.grade===student.grade&&(e.examName||'Untitled Exam')===examName).length;

  doc.setFillColor(255,220,220); doc.rect(4,y,W-8,14,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8);
  doc.setTextColor(242,199,68);
  doc.text(`TOTAL: ${exam.total}  |  AVG: ${avg}  |  Subjects: ${valSubs.length}`,8,y+6);
  doc.setTextColor(0,0,0);
  doc.text(`CLASS: ${exam.rank||'—'} / ${classSize}`,W/2-20,y+6,{align:'center'});
  doc.setTextColor(0,210,150);
  doc.text(`OVERALL: ${overallRank} / ${overallTotal} (Gr.${gradeLevel})`,W-8,y+6,{align:'right'});
  y+=17;

  // ── Class Teacher Comment section ──
  const _cts=getClassTeachers(student.grade); const classTeacher=_cts[0]||null; const classTeacherNames=_cts.map(t=>fmtTeacher(t.name)).join(' & ')||'_______________________________';
  doc.setFillColor(240,245,255); doc.roundedRect(4,y,W-8,26,2,2,'F');
  doc.setDrawColor(100,140,220); doc.roundedRect(4,y,W-8,26,2,2,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
  doc.text("CLASS TEACHER'S COMMENT",8,y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,140);
  doc.text(`Name: ${classTeacherNames||'_______________________________'}`,8,y+11);
  // Comment line
  doc.setDrawColor(150,170,210); doc.line(8,y+18, W-8, y+18);
  doc.setFontSize(7); doc.text('Comment:',8,y+16.5);
  // Signature + Date
  doc.line(8,y+24, 65, y+24);
  doc.line(W-55,y+24, W-8, y+24);
  doc.setFontSize(6); doc.text('Signature',8,y+26); doc.text('Date',W-55,y+26);
  y+=30;

  // ── Head Teacher Comment section ──
  doc.setFillColor(240,255,245); doc.roundedRect(4,y,W-8,26,2,2,'F');
  doc.setDrawColor(80,180,120); doc.roundedRect(4,y,W-8,26,2,2,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
  doc.text("HEAD TEACHER'S COMMENT",8,y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(80,100,140);
  // Comment line
  doc.setDrawColor(120,180,150); doc.line(14,y+17, W-14, y+17);
  doc.line(14,y+24, W-14, y+24);
  doc.text('Comment:',14,y+15);
  // Signature + Date
  doc.line(14,y+30, 70, y+30);
  doc.line(W-60,y+30, W-14, y+30);
  doc.setFontSize(6.5);
  doc.text('Signature',14,y+33); doc.text('Date',W-60,y+33);

  pdfFooter(doc);
  doc.save(`${student.admNo}_${examName.replace(/\s+/g,'_')}_ReportCard.pdf`);
  toast('📄 PDF Downloaded');
}

/* ─── Student Rubric-Only Card ─── */
function exportStudentRubricCard(){
  const admNo=document.getElementById('pdf_student').value;
  const examName=document.getElementById('pdf_examName').value;
  const term=document.getElementById('pdf_term').value;
  const year=document.getElementById('pdf_year').value;
  if(!admNo)return toast('Select a student',true);
  if(!examName)return toast('Select an exam',true);
  const student=db.students.find(s=>s.admNo===admNo);
  const exam=db.exams.find(e=>e.admNo===admNo&&(e.examName||'Untitled Exam')===examName&&e.term===term&&e.year==year)
            ||db.exams.find(e=>e.admNo===admNo&&(e.examName||'Untitled Exam')===examName);
  if(!exam)return toast('No exam record found',true);
  const jsPDF=window._getJsPDF(), doc=new jsPDF({unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
  let y=pdfHeader(doc,'STUDENT RUBRIC REPORT',`${examName}  |  ${exam.term||term} ${exam.year||year}`);

  // Student info box
  doc.setFillColor(232,240,255); doc.roundedRect(4,y,W-8,16,2,2,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(11,29,58);
  doc.text(student.fullName.toUpperCase(),W/2,y+6,{align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(60,90,140);
  doc.text(`Adm: ${student.admNo}  |  Grade: ${student.grade}  |  NEMIS: ${student.nemis||'-'}  |  Parent: ${student.parent||'-'}  (${student.phone||'-'})`,W/2,y+12,{align:'center'});
  y+=22;

  // Mini rubric legend
  doc.setFillColor(255,220,220); doc.roundedRect(8,y,W-16,10,1,1,'F');
  const leg=[['EE1','90-100','8pts'],['EE2','75-89','7pts'],['ME1','58-74','6pts'],['ME2','40-57','5pts'],['AE1','30-39','4pts'],['AE2','21-29','3pts'],['BE1','11-20','2pts'],['BE2','0-10','1pt']];
  const lw=(W-16)/8;
  leg.forEach((l,i)=>{
    doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(242,199,68);
    doc.text(l[0],8+i*lw+lw/2,y+4,{align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setTextColor(160,190,230);
    doc.text(`${l[1]}|${l[2]}`,8+i*lw+lw/2,y+8.5,{align:'center'});
  });
  y+=14;

  const subjects=getSubjects(student.grade);
  const fills={EE1:[0,150,110],EE2:[0,180,130],ME1:[20,90,180],ME2:[60,130,220],AE1:[160,120,0],AE2:[200,160,0],BE1:[190,40,60],BE2:[220,80,100]};

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    head:[['SUBJECT','RUBRIC','PTS','TEACHER COMMENT']],
    body:subjects.map(s=>{
      const sc=exam.scores?.[s];
      const rb=sc!==undefined?getRubric(sc,exam.grade,exam.examName):(exam.rubrics?.[s]||null);
      const comment=rb?rubricComment(rb.class):'Not entered';
      return[subjFull(s),rb?rb.code:'—',rb?rb.pts:'—',comment];
    }),
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8.5,cellPadding:2},
    styles:{fontSize:9,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:{0:{cellWidth:46,fontStyle:'bold'},1:{cellWidth:18,halign:'center'},2:{cellWidth:13,halign:'center'},3:{cellWidth:'auto',fontStyle:'italic'}},
    didParseCell(d){
      if(d.section==='body'&&d.column.index===1){
        const fk=d.cell.raw?String(d.cell.raw).replace('.',''):'';
        if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
      }
      if(d.section==='body'&&d.row.index%2===0&&d.column.index!==1) d.cell.styles.fillColor=[246,249,255];
    }
  });
  y=doc.lastAutoTable.finalY+4;

  // Summary bar with points, class position and overall rank
  const validRubs=subjects.filter(s=>exam.scores?.[s]!==undefined);
  const totalPts=validRubs.reduce((a,s)=>a+getRubric(exam.scores[s],exam.grade,exam.examName).pts,0);
  const avgPts=validRubs.length?(totalPts/validRubs.length).toFixed(2):0;
  const isJunior=['7','8','9'].includes((student.grade||'').charAt(0));
  const maxPts=isJunior?72:64;
  const ptsLabel=`${Math.round(totalPts)} / ${maxPts} pts`;
  const pctScore=maxPts>0?((totalPts/maxPts)*100).toFixed(1):'0';
  const gradeLevel=(student.grade||'').charAt(0);
  const overallRank=getOverallRank(admNo,examName);
  const overallTotal=getOverallTotal(examName,gradeLevel);
  const classSize=db.exams.filter(e=>e.grade===student.grade&&(e.examName||'Untitled Exam')===examName).length;

  doc.setFillColor(255,220,220); doc.rect(4,y,W-8,14,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8);
  doc.setTextColor(242,199,68); doc.text(`TOTAL: ${ptsLabel}`,8,y+6);
  doc.setTextColor(0,0,0); doc.text(`${pctScore}%  Avg:${avgPts}pts`,W/2,y+6,{align:'center'});
  doc.setTextColor(0,210,150); doc.text(`CL:${exam.rank||'—'}/${classSize}  OVR:${overallRank}/${overallTotal}`,W-8,y+6,{align:'right'});
  y+=17;

  // ── Class Teacher Comment section ──
  const _cts=getClassTeachers(student.grade); const classTeacher=_cts[0]||null; const classTeacherNames=_cts.map(t=>fmtTeacher(t.name)).join(' & ')||'_______________________________';
  doc.setFillColor(240,245,255); doc.roundedRect(4,y,W-8,26,2,2,'F');
  doc.setDrawColor(100,140,220); doc.roundedRect(4,y,W-8,26,2,2,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
  doc.text("CLASS TEACHER'S COMMENT",8,y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,140);
  doc.text(`Name: ${classTeacherNames||'_______________________________'}`,8,y+11);
  doc.setDrawColor(150,170,210); doc.line(14,y+22,W-14,y+22);
  doc.setFontSize(7); doc.text('Comment:',8,y+16.5);
  doc.line(14,y+30,70,y+30); doc.line(W-60,y+30,W-14,y+30);
  doc.setFontSize(6.5); doc.text('Signature',14,y+33); doc.text('Date',W-60,y+33);
  y+=38;

  // ── Head Teacher Comment section ──
  doc.setFillColor(240,255,245); doc.roundedRect(4,y,W-8,26,2,2,'F');
  doc.setDrawColor(80,180,120); doc.roundedRect(4,y,W-8,26,2,2,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
  doc.text("HEAD TEACHER'S COMMENT",8,y+5);
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(80,100,140);
  doc.setDrawColor(120,180,150); doc.line(8,y+14,W-8,y+14);
  doc.line(8,y+20,W-8,y+20);
  doc.text('Comment:',8,y+12);
  doc.line(8,y+24, 65, y+24); doc.line(W-55,y+24, W-8, y+24);
  doc.setFontSize(6); doc.text('Signature',8,y+26); doc.text('Date',W-55,y+26);

  pdfFooter(doc);
  doc.save(`${student.admNo}_${examName.replace(/\s+/g,'_')}_Rubric.pdf`);
  toast('🏷️ Rubric Report Downloaded');
}

/* ─── Bulk: All Students Report Cards in one PDF ─── */
function exportAllStudentsReportCards(){
  const grade = document.getElementById('pdf_studentGrade').value;
  const examName = document.getElementById('pdf_examName').value
                || document.getElementById('pdf_examName').options[1]?.value || '';

  // Resolve exam name: use selected exam or ask user to pick
  if(!grade){ toast('Select a Grade first', true); return; }

  // Get all exam names for this grade
  const allExamNames = [...new Set(db.exams.filter(e=>e.grade===grade).map(e=>e.examName||'Untitled Exam'))].sort();
  if(!allExamNames.length){ toast('No exam records for Grade '+grade, true); return; }

  // Use the exam selected in the dropdown, or first available
  let targetExam = document.getElementById('pdf_examName').value;
  if(!targetExam){
    if(allExamNames.length === 1){ targetExam = allExamNames[0]; }
    else { toast('Please select an Exam from the dropdown first', true); return; }
  }

  const students = [...db.students.filter(s=>s.grade===grade)].sort((a,b)=>a.fullName.localeCompare(b.fullName));
  if(!students.length){ toast('No students in Grade '+grade, true); return; }

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({unit:'mm', format:'a4'});
  const W = doc.internal.pageSize.getWidth();
  let pagesAdded = 0;
  const fills = {EE1:[0,150,110],EE2:[0,180,130],ME1:[20,90,180],ME2:[60,130,220],AE1:[160,120,0],AE2:[200,160,0],BE1:[190,40,60],BE2:[220,80,100]};

  students.forEach((student, idx) => {
    const exam = db.exams.find(e=>e.admNo===student.admNo && (e.examName||'Untitled Exam')===targetExam);
    if(!exam) return; // skip students with no record for this exam

    if(pagesAdded > 0) doc.addPage();
    pagesAdded++;

    let y = pdfHeader(doc, 'STUDENT REPORT CARD', `${targetExam}  |  ${exam.term} ${exam.year}`);

    // Student info box
    doc.setFillColor(232,240,255); doc.roundedRect(4,y,W-8,16,2,2,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(11,29,58);
    doc.text(student.fullName.toUpperCase(), W/2, y+7, {align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(60,90,140);
    doc.text(`Adm: ${student.admNo}  |  Grade: ${student.grade}  |  NEMIS: ${student.nemis||'-'}  |  Parent: ${student.parent||'-'}  (${student.phone||'-'})`, W/2, y+13, {align:'center'});
    y += 18;

    const subjects = getSubjects(student.grade);
    doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
      startY:y, margin:{left:4,right:4},
      head:[['SUBJECT','SCORE','%','RUBRIC','PTS','TEACHER COMMENT']],
      body:subjects.map(s=>{
        const sc=exam.scores[s];
        const rb=sc!==undefined?getRubric(sc,exam.grade,exam.examName):(exam.rubrics?.[s]||null);
        const comment=rb?rubricComment(rb.class):'Not entered';
        const pct=sc!==undefined?Math.round(sc)+'%':'—';
        return[subjFull(s), sc!==undefined?sc:'—', pct, rb?rb.code:'—', rb?rb.pts:'—', comment];
      }),
      theme:'grid',
      headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8,cellPadding:2},
      styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
      columnStyles:{0:{cellWidth:44,fontStyle:'bold'},1:{cellWidth:14,halign:'center'},2:{cellWidth:11,halign:'center'},3:{cellWidth:16,halign:'center'},4:{cellWidth:11,halign:'center'},5:{cellWidth:'auto',fontStyle:'italic'}},
      didParseCell(d){
        if(d.section==='body'&&d.column.index===3){
          const fk=d.cell.raw?String(d.cell.raw).replace('.',''):'';
          if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
        }
        if(d.section==='body'&&d.row.index%2===0&&d.column.index!==3) d.cell.styles.fillColor=[246,249,255];
      }
    });
    let sy = doc.lastAutoTable.finalY+4;

    // Summary bar with class position + overall rank
    const valSubs=subjects.filter(s=>exam.scores[s]!==undefined);
    const avg=valSubs.length?(exam.total/valSubs.length).toFixed(1):0;
    const gradeLevel=(student.grade||'').charAt(0);
    const overallRank=getOverallRank(student.admNo,targetExam);
    const overallTotal=getOverallTotal(targetExam,gradeLevel);
    const classSize=db.exams.filter(e=>e.grade===student.grade&&(e.examName||'Untitled Exam')===targetExam).length;
    doc.setFillColor(255,220,220); doc.rect(8,sy,W-16,18,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.setTextColor(242,199,68); doc.text(`TOTAL: ${exam.total}  |  AVG: ${avg}`,14,sy+7);
    doc.setTextColor(0,0,0); doc.text(`CLASS POSITION: ${exam.rank||'—'} / ${classSize}`,14,sy+14);
    doc.setTextColor(0,210,150); doc.text(`OVERALL RANK (Grade ${gradeLevel}): ${overallRank} / ${overallTotal}`,W/2,sy+14,{align:'center'});
    doc.setTextColor(180,200,255); doc.text(`Subjects: ${valSubs.length}`,W-12,sy+7,{align:'right'});
    sy+=22;

    // Class Teacher section
    const _cts=getClassTeachers(student.grade); const classTeacher=_cts[0]||null; const classTeacherNames=_cts.map(t=>fmtTeacher(t.name)).join(' & ')||'_______________________________';
    doc.setFillColor(240,245,255); doc.roundedRect(8,sy,W-16,32,2,2,'F');
    doc.setDrawColor(100,140,220); doc.roundedRect(8,sy,W-16,32,2,2,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
    doc.text("CLASS TEACHER'S COMMENT",14,sy+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,140);
    doc.text(`Name: ${classTeacherNames||'_______________________________'}`,14,sy+13);
    doc.setDrawColor(150,170,210); doc.line(14,sy+22,W-14,sy+22);
    doc.setFontSize(7); doc.text('Comment:',14,sy+20);
    doc.line(14,sy+30,70,sy+30); doc.line(W-60,sy+30,W-14,sy+30);
    doc.setFontSize(6.5); doc.text('Signature',14,sy+33); doc.text('Date',W-60,sy+33);
    sy+=38;

    // Head Teacher section
    doc.setFillColor(240,255,245); doc.roundedRect(8,sy,W-16,32,2,2,'F');
    doc.setDrawColor(80,180,120); doc.roundedRect(8,sy,W-16,32,2,2,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
    doc.text("HEAD TEACHER'S COMMENT",14,sy+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(80,100,140);
    doc.setDrawColor(120,180,150); doc.line(14,sy+17,W-14,sy+17);
    doc.line(14,sy+24,W-14,sy+24);
    doc.text('Comment:',14,sy+15);
    doc.line(14,sy+30,70,sy+30); doc.line(W-60,sy+30,W-14,sy+30);
    doc.setFontSize(6.5); doc.text('Signature',14,sy+33); doc.text('Date',W-60,sy+33);
    pdfFooter(doc);
  });

  if(pagesAdded===0){ toast('No matching exam records found for any student in Grade '+grade, true); return; }
  addPageNumbers(doc);
  doc.save(`Grade_${grade}_${targetExam.replace(/\s+/g,'_')}_All_ReportCards.pdf`);
  toast(`📚 Exported ${pagesAdded} report cards`);
}

/* ─── Bulk: All Students Rubric Cards in one PDF ─── */
function exportAllStudentsRubrics(){
  const grade = document.getElementById('pdf_studentGrade').value;
  if(!grade){ toast('Select a Grade first', true); return; }

  const allExamNames = [...new Set(db.exams.filter(e=>e.grade===grade).map(e=>e.examName||'Untitled Exam'))].sort();
  if(!allExamNames.length){ toast('No exam records for Grade '+grade, true); return; }

  let targetExam = document.getElementById('pdf_examName').value;
  if(!targetExam){
    if(allExamNames.length===1){ targetExam=allExamNames[0]; }
    else { toast('Please select an Exam from the dropdown first', true); return; }
  }

  const students=[...db.students.filter(s=>s.grade===grade)].sort((a,b)=>a.fullName.localeCompare(b.fullName));
  if(!students.length){ toast('No students in Grade '+grade, true); return; }

  const jsPDF=window._getJsPDF();
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  let pagesAdded=0;
  const fills={EE1:[0,150,110],EE2:[0,180,130],ME1:[20,90,180],ME2:[60,130,220],AE1:[160,120,0],AE2:[200,160,0],BE1:[190,40,60],BE2:[220,80,100]};
  const isJunior=['7','8','9'].includes((grade||'').charAt(0));
  const maxPts=isJunior?72:64;

  students.forEach((student,idx)=>{
    const exam=db.exams.find(e=>e.admNo===student.admNo&&(e.examName||'Untitled Exam')===targetExam);
    if(!exam) return;

    if(pagesAdded>0) doc.addPage();
    pagesAdded++;

    let y=pdfHeader(doc,'STUDENT RUBRIC REPORT',`${targetExam}  |  ${exam.term} ${exam.year}`);

    // Student info
    doc.setFillColor(232,240,255); doc.roundedRect(4,y,W-8,16,2,2,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(11,29,58);
    doc.text(student.fullName.toUpperCase(),W/2,y+6,{align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(60,90,140);
    doc.text(`Adm: ${student.admNo}  |  Grade: ${student.grade}  |  NEMIS: ${student.nemis||'-'}  |  Parent: ${student.parent||'-'}  (${student.phone||'-'})`,W/2,y+12,{align:'center'});
    y+=22;

    // Legend strip
    doc.setFillColor(255,220,220); doc.roundedRect(8,y,W-16,10,1,1,'F');
    const leg=[['EE1','90-100','8pts'],['EE2','75-89','7pts'],['ME1','58-74','6pts'],['ME2','40-57','5pts'],['AE1','30-39','4pts'],['AE2','21-29','3pts'],['BE1','11-20','2pts'],['BE2','0-10','1pt']];
    const lw=(W-16)/8;
    leg.forEach((l,i)=>{
      doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(242,199,68);
      doc.text(l[0],8+i*lw+lw/2,y+4,{align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setTextColor(160,190,230);
      doc.text(`${l[1]}|${l[2]}`,8+i*lw+lw/2,y+8.5,{align:'center'});
    });
    y+=14;

    const subjects=getSubjects(student.grade);
    doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
      startY:y, margin:{left:4,right:4},
      head:[['SUBJECT','RUBRIC','PTS','TEACHER COMMENT']],
      body:subjects.map(s=>{
        const sc=exam.scores?.[s];
        const rb=sc!==undefined?getRubric(sc,exam.grade,exam.examName):(exam.rubrics?.[s]||null);
        const comment=rb?rubricComment(rb.class):'Not entered';
        return[subjFull(s),rb?rb.code:'—',rb?rb.pts:'—',comment];
      }),
      theme:'grid',
      headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8.5,cellPadding:2},
      styles:{fontSize:9,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
      columnStyles:{0:{cellWidth:46,fontStyle:'bold'},1:{cellWidth:18,halign:'center'},2:{cellWidth:13,halign:'center'},3:{cellWidth:'auto',fontStyle:'italic'}},
      didParseCell(d){
        if(d.section==='body'&&d.column.index===1){
          const fk=d.cell.raw?String(d.cell.raw).replace('.',''):'';
          if(fills[fk]){d.cell.styles.fillColor=fills[fk];d.cell.styles.textColor=[0,0,0];d.cell.styles.fontStyle='bold';}
        }
        if(d.section==='body'&&d.row.index%2===0&&d.column.index!==1) d.cell.styles.fillColor=[246,249,255];
      }
    });
    let sy=doc.lastAutoTable.finalY+4;

    // Summary with points, class position + overall rank
    const validRubs=subjects.filter(s=>exam.scores?.[s]!==undefined);
  const totalPts=validRubs.reduce((a,s)=>a+getRubric(exam.scores[s],exam.grade,exam.examName).pts,0);
    const avgPts=validRubs.length?(totalPts/validRubs.length).toFixed(2):0;
    const ptsLabel=`${Math.round(totalPts)} / ${maxPts} pts`;
    const pctScore=maxPts>0?((totalPts/maxPts)*100).toFixed(1):'0';
    const gradeLevel=(student.grade||'').charAt(0);
    const overallRank=getOverallRank(student.admNo,targetExam);
    const overallTotal=getOverallTotal(targetExam,gradeLevel);
    const classSize=db.exams.filter(e=>e.grade===student.grade&&(e.examName||'Untitled Exam')===targetExam).length;
    const pctColor=totalPts/maxPts>=0.75?[0,200,130]:totalPts/maxPts>=0.5?[100,200,255]:totalPts/maxPts>=0.375?[242,199,68]:[255,100,120];

    doc.setFillColor(255,220,220); doc.rect(8,sy,W-16,22,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.setTextColor(242,199,68); doc.text('TOTAL PTS:',14,sy+8);
    doc.setFontSize(12); doc.text(ptsLabel,14,sy+17);
    doc.setFontSize(9); doc.setTextColor(...pctColor);
    doc.text(`${pctScore}%  (Avg: ${avgPts} pts/subj)`,W/2,sy+8,{align:'center'});
    doc.setTextColor(0,0,0);
    doc.text(`CLASS POSITION: ${exam.rank||'—'} / ${classSize}`,W/2,sy+17,{align:'center'});
    doc.setTextColor(0,210,150);
    doc.text(`OVERALL RANK (Grade ${gradeLevel}): ${overallRank} / ${overallTotal}`,W-12,sy+8,{align:'right'});
    doc.setTextColor(180,220,255);
    doc.text(`Max: ${maxPts} pts`,W-12,sy+17,{align:'right'});
    sy+=26;

    // Class Teacher section
    const _cts=getClassTeachers(student.grade); const classTeacher=_cts[0]||null; const classTeacherNames=_cts.map(t=>fmtTeacher(t.name)).join(' & ')||'_______________________________';
    doc.setFillColor(240,245,255); doc.roundedRect(8,sy,W-16,32,2,2,'F');
    doc.setDrawColor(100,140,220); doc.roundedRect(8,sy,W-16,32,2,2,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
    doc.text("CLASS TEACHER'S COMMENT",14,sy+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,140);
    doc.text(`Name: ${classTeacherNames||'_______________________________'}`,14,sy+13);
    doc.setDrawColor(150,170,210); doc.line(14,sy+22,W-14,sy+22);
    doc.setFontSize(7); doc.text('Comment:',14,sy+20);
    doc.line(14,sy+30,70,sy+30); doc.line(W-60,sy+30,W-14,sy+30);
    doc.setFontSize(6.5); doc.text('Signature',14,sy+33); doc.text('Date',W-60,sy+33);
    sy+=38;

    // Head Teacher section
    doc.setFillColor(240,255,245); doc.roundedRect(8,sy,W-16,32,2,2,'F');
    doc.setDrawColor(80,180,120); doc.roundedRect(8,sy,W-16,32,2,2,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(11,29,58);
    doc.text("HEAD TEACHER'S COMMENT",14,sy+6);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(80,100,140);
    doc.setDrawColor(120,180,150); doc.line(14,sy+17,W-14,sy+17);
    doc.line(14,sy+24,W-14,sy+24);
    doc.text('Comment:',14,sy+15);
    doc.line(14,sy+30,70,sy+30); doc.line(W-60,sy+30,W-14,sy+30);
    doc.setFontSize(6.5); doc.text('Signature',14,sy+33); doc.text('Date',W-60,sy+33);
    pdfFooter(doc);
  });

  if(pagesAdded===0){ toast('No matching exam records found', true); return; }
  addPageNumbers(doc);
  doc.save(`Grade_${grade}_${targetExam.replace(/\s+/g,'_')}_All_Rubrics.pdf`);
  toast(`🏷️ Exported ${pagesAdded} rubric cards`);
}

/* ─── Class Results PDF (Landscape, ultra-compact) ─── */
function exportClassResultsPDF(){
  if(getCurrentRole()!=='admin') return toast('⛔ PDF export is restricted to admin only', true);
  const grade=document.getElementById('pdf_classGrade').value;
  const examName=document.getElementById('pdf_classExamName').value;
  const term=document.getElementById('pdf_classTerm').value;
  const year=document.getElementById('pdf_classYear').value;
  if(!grade)return toast('Select a grade',true);
  if(!examName)return toast('Select an exam',true);

  // Helper: record has at least one numeric subject score
  const hasScores=e=>e.scores&&Object.values(e.scores).some(v=>typeof v==='number');

  let allRecords=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled Exam')===examName&&e.term===term&&e.year==year);
  if(!allRecords.length)allRecords=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled Exam')===examName);

  // Split: scored (have marks, used for ranking + means) vs unscored.
  // Ranked by TOTAL MARKS; equal totals share the same rank (1,2,2,4).
  const records=[...allRecords].filter(hasScores).sort((a,b)=>b.total-a.total);
  const classRanks = compRanks(records, e=>e.total);
  const unscoredExam=allRecords.filter(e=>!hasScores(e));

  // Students registered in this grade but with NO exam record at all
  const recordedAdmNos=new Set(allRecords.map(e=>e.admNo));
  const missingStudents=db.students.filter(s=>s.grade===grade&&!recordedAdmNos.has(s.admNo));

  // Combine all unscored entries, sort alphabetically
  const unscoredData=[
    ...unscoredExam.map(e=>({name:e.name||e.admNo,admNo:e.admNo})),
    ...missingStudents.map(s=>({name:s.fullName,admNo:s.admNo}))
  ].sort((a,b)=>(a.name||'').localeCompare(b.name||''));

  if(!records.length&&!unscoredData.length)return toast('No records found',true);

  const noScoresStartIdx=records.length;              // first absent row index in body
  const meansRowIdx=records.length+unscoredData.length; // means row index in body

  const jsPDF=window._getJsPDF(), doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
  let y=pdfHeader(doc,`CLASS ${grade} — EXAM RESULTS`,`${examName}  |  ${term} ${year}  |  ${records.length} scored  |  ${unscoredData.length} not scored`);

  const subjects=getSubjects(grade); // e.g. [MATHS,ENG,KIS,SCIE,...]
  const engSubs = getEngSubs(grade);
  const kisSubs = getKisSubs(grade);
  const scieSubs = getScieSubs(grade);

  // Build expanded display columns (grade-aware + presence-gated):
  // PP1/PP2 columns appear only when BOTH components exist in this class;
  // otherwise just the parent total (e.g. SCIE alone). Others show as-is.
  const engPlan = ppColPlan(records, engSubs, ['GRA','COMP'], 'ENG');
  const kisPlan = ppColPlan(records, kisSubs, ['LUG','INS'], 'KIS');
  const sciePlan = ppColPlan(records, scieSubs, null, 'SCIE');
  const dispCols = []; // {label, key, isSub, parentKey, legacy}
  subjects.forEach(s=>{
    if(s==='ENG' && engPlan.show0){
      dispCols.push({label:engSubs[0], key:engSubs[0], isSub:true, parentKey:'ENG', legacy:'GRA'});
      dispCols.push({label:engSubs[1], key:engSubs[1], isSub:true, parentKey:'ENG', legacy:'COMP'});
    } else if(s==='KIS' && kisPlan.show0){
      dispCols.push({label:kisSubs[0], key:kisSubs[0], isSub:true, parentKey:'KIS', legacy:'LUG'});
      dispCols.push({label:kisSubs[1], key:kisSubs[1], isSub:true, parentKey:'KIS', legacy:'INS'});
    } else if(s==='SCIE' && scieSubs.length===2 && sciePlan.show0){
      dispCols.push({label:scieSubs[0], key:scieSubs[0], isSub:true, parentKey:'SCIE', legacy:null});
      dispCols.push({label:scieSubs[1], key:scieSubs[1], isSub:true, parentKey:'SCIE', legacy:null});
    }
    dispCols.push({label:s, key:s, isSub:false, parentKey:null});
  });

  // Helper: get display value for a column from a record
  const getDispVal = (e, col) => {
    if(col.isSub) return ppSubVal(e, col.key, col.legacy);
    return e.scores[col.key] !== undefined ? e.scores[col.key] : '—';
  };

  // Compute class means per display column — ONLY scored students, never absent ones.
  // Sub-score cols (GRA, COMP, LUG, INS) are excluded from means (show '—').
  const means = dispCols.map(col => {
    if(col.isSub) return '—'; // GRA/COMP/LUG/INS — no mean shown
    const vals = records.filter(e=>e.scores[col.key]!==undefined).map(e=>e.scores[col.key]);
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—';
  });
  const totalMean = records.length ? (records.reduce((a,e)=>a+e.total,0)/records.length).toFixed(1) : '—';

  // Head row
  const headRow = ['Student Name', ...dispCols.map(c=>c.label), 'Total','Rank'];

  // Build body rows:
  // 1. Scored students (ranked, sorted by total desc)
  // 2. Unscored / absent students (no scores, shown with ABS — not ranked, not in means)
  // 3. Class means row (scored students only)
  const bodyRows = [
    ...records.map((e,i)=>[
      e.name,
      ...dispCols.map(col=>getDispVal(e,col)),
      e.total,
      classRanks[i]
    ]),
    // Absent / unscored rows
    ...unscoredData.map(u=>[
      u.name,
      ...dispCols.map(()=>'ABS'),
      'ABS',
      '—'
    ]),
    // Class means row (scored students only)
    ['CLASS MEAN', ...means, totalMean, '']
  ];

  // Column widths — dynamically fill the full usable landscape width (297mm - 8mm margins = 285mm)
  const usableW = W - 8;
  const fixedW  = 12 + 8;
  const nameW   = 36;
  const remainW = usableW - fixedW - nameW;

  const nSubCols  = dispCols.filter(c=>c.isSub).length;
  const nMainCols = dispCols.filter(c=>!c.isSub).length;
  const mw = Math.floor(remainW / (nMainCols + nSubCols*0.75) * 10) / 10;
  const sw = Math.floor(mw * 0.75 * 10) / 10;
  const colStyles = {
    0:{cellWidth:nameW, halign:'left', fontStyle:'bold', fontSize:8},
  };
  const subColStyle   = {cellWidth: sw,  fontStyle:'normal', fontSize:8,  textColor:[100,100,140]};
  const mainColStyle  = {cellWidth: mw,  fontStyle:'bold',   fontSize:10};
  const otherColStyle = {cellWidth: mw,  fontStyle:'bold',   fontSize:10};
  dispCols.forEach((col,ci)=>{
    const styleIdx = ci+1;
    if(col.isSub)                                              colStyles[styleIdx] = subColStyle;
    else if(col.key==='ENG'||col.key==='KIS'||(col.key==='SCIE'&&dispCols.some(c=>c.isSub&&c.parentKey==='SCIE'))) colStyles[styleIdx] = mainColStyle;
    else                                                       colStyles[styleIdx] = otherColStyle;
  });
  colStyles[1+dispCols.length]   = {cellWidth:12, fontStyle:'bold'};  // Total
  colStyles[1+dispCols.length+1] = {cellWidth:8,  fontStyle:'bold'};  // Rank

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    tableWidth:'auto',
    head:[headRow],
    body:bodyRows,
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:6.5,cellPadding:1.2},
    styles:{fontSize:9,cellPadding:2,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:colStyles,
    didParseCell(d){
      if(d.section==='body'){
        // ── Scored student rows ──
        if(d.row.index < noScoresStartIdx){
          if(d.column.index===0){
            d.cell.styles.fontSize=8;
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[0,0,0];
            d.cell.styles.overflow='hidden';
          }
          if(d.column.index>=1){
            d.cell.styles.fontSize=10; d.cell.styles.fontStyle='bold';
          }
          if(d.row.index%2===0 && d.column.index>1){
            d.cell.styles.fillColor=[255,245,245];
          }
          // Sub-score columns — smaller, dimmed
          const ci=d.column.index-1;
          if(ci>=0&&ci<dispCols.length&&dispCols[ci]&&dispCols[ci].isSub){
            d.cell.styles.textColor=[80,80,80];
            d.cell.styles.fontSize=8;
            d.cell.styles.fontStyle='normal';
          }
          // ENG/KIS/SCIE summary columns — highlighted
          if(ci>=0&&ci<dispCols.length&&dispCols[ci]&&!dispCols[ci].isSub&&(dispCols[ci].key==='ENG'||dispCols[ci].key==='KIS'||(dispCols[ci].key==='SCIE'&&dispCols.some(c=>c.isSub&&c.parentKey==='SCIE')))){
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[0,0,0];
          }
          // Total column
          if(d.column.index===1+dispCols.length){
            d.cell.styles.fontStyle='bold'; d.cell.styles.textColor=[0,0,0];
          }
          // Rank column
          if(d.column.index===2+dispCols.length){
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[0,0,0];
          }
        }
        // ── Unscored / absent rows (above means row) ──
        if(d.row.index>=noScoresStartIdx && d.row.index<meansRowIdx){
          d.cell.styles.fillColor=[232,232,232];
          d.cell.styles.textColor=[120,120,120];
          d.cell.styles.fontStyle='italic';
          d.cell.styles.fontSize=8;
          if(d.column.index===0){
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[80,80,80];
            d.cell.styles.halign='left';
          }
        }
        // ── Means row ──
        if(d.row.index===meansRowIdx){
          d.cell.styles.fillColor=[255,200,200];
          d.cell.styles.textColor=[0,0,0];
          d.cell.styles.fontStyle='bold';
          d.cell.styles.fontSize=7;
        }
      }
    },
    didDrawPage(){pdfFooter(doc);}
  });

  // Sub-header note below table
  const finalY = doc.lastAutoTable.finalY + 3;
  if(finalY < doc.internal.pageSize.getHeight()-15){
    doc.setFontSize(6.5); doc.setTextColor(140,140,160);
    doc.text(`Note: ${engSubs[0]} = ${subjFull(engSubs[0])}, ${engSubs[1]} = ${subjFull(engSubs[1])} (ENG = ${engSubs[0]}+${engSubs[1]})  |  ${kisSubs[0]} = ${subjFull(kisSubs[0])}, ${kisSubs[1]} = ${subjFull(kisSubs[1])} (KIS = ${kisSubs[0]}+${kisSubs[1]})  |  Totals use ENG and KIS only.  |  ABS = No scores recorded (excluded from class means).`,5,finalY);
  }

  addPageNumbers(doc);
  doc.save(`Class_${grade}_${examName.replace(/\s+/g,'_')}.pdf`);
  toast('📄 PDF Downloaded');
}

/* ─── Combined Grade Results: helper – populate exam dropdown ─── */
function populateCombinedGradeExams(){
  const level = document.getElementById('pdf_combinedGradeLevel').value;
  const sel   = document.getElementById('pdf_combinedExamName');
  sel.innerHTML = '<option value="">-- Select Exam --</option>';
  if(!level) return;
  // Collect all streams that belong to this grade level
  const allGrades = [...new Set(db.exams.map(e=>e.grade))];
  const streams   = allGrades.filter(g => g && g.charAt(0) === level);
  if(!streams.length){ toast('No exam data found for Grade '+level, true); return; }
  const names = [...new Set(
    db.exams.filter(e => streams.includes(e.grade)).map(e => e.examName||'Untitled Exam')
  )].sort();
  names.forEach(n=>{ const o=document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o); });
}

/* ─── Combined Grade Results PDF (Landscape, all streams merged, ranked 1→N) ─── */
function exportCombinedGradeResultsPDF(mode){
  const level    = document.getElementById('pdf_combinedGradeLevel').value;
  const examName = document.getElementById('pdf_combinedExamName').value;
  const term     = document.getElementById('pdf_combinedTerm').value;
  const year     = document.getElementById('pdf_combinedYear').value;
  if(!level)    return toast('Select a grade level', true);
  if(!examName) return toast('Select an exam', true);
  if(mode === 'rubric'){
    exportCombinedRubricPDF(level, examName, term, year);
    return;
  }

  // Grade level → stream map
  const GRADE_STREAMS = {
    '1':['1E','1N','1S','1W'],
    '2':['2E','2N','2S'],
    '3':['3E','3N','3S'],
    '4':['4N','4S','4E','4W'],
    '5':['5N','5S','5E','5W'],
    '6':['6N','6S'],
    '7':['7R','7B'],
    '8':['8R','8B'],
    '9':['9R','9B']
  };
  const streams = GRADE_STREAMS[level] || [];
  if(!streams.length) return toast('Unknown grade level', true);

  // Collect records from all streams, prefer exact term+year match first
  let records = db.exams.filter(e =>
    streams.includes(e.grade) &&
    (e.examName||'Untitled Exam') === examName &&
    e.term === term && e.year == year
  );
  if(!records.length){
    records = db.exams.filter(e =>
      streams.includes(e.grade) &&
      (e.examName||'Untitled Exam') === examName
    );
  }
  if(!records.length) return toast('No records found for Grade '+level+' — '+examName, true);

  // Detect which streams actually have data (for the subtitle)
  const foundStreams = [...new Set(records.map(e=>e.grade))].sort();

  // Helper: record has at least one numeric subject score
  const hasScoresC=e=>e.scores&&Object.values(e.scores).some(v=>typeof v==='number');

  // Split into scored (included in means + ranking) and unscored.
  // Ranked by TOTAL MARKS; equal totals share the same rank (1,2,2,4).
  const scoredRecs=[...records].filter(hasScoresC).sort((a,b)=>b.total-a.total);
  scoredRecs.forEach((r,i)=>{ r._combinedRank=(i>0 && r.total===scoredRecs[i-1].total)?scoredRecs[i-1]._combinedRank:i+1; });
  const unscoredExamRecs=records.filter(e=>!hasScoresC(e));

  // Students registered in any of the streams but with NO exam record at all
  const recordedAdmNosC=new Set(records.map(e=>e.admNo));
  const missingStudentsC=db.students.filter(s=>streams.includes(s.grade)&&!recordedAdmNosC.has(s.admNo));

  // Combine all unscored, sort alphabetically within each stream then by name
  const unscoredDataC=[
    ...unscoredExamRecs.map(e=>({name:e.name||e.admNo,admNo:e.admNo,grade:e.grade})),
    ...missingStudentsC.map(s=>({name:s.fullName,admNo:s.admNo,grade:s.grade}))
  ].sort((a,b)=>(a.grade+a.name).localeCompare(b.grade+b.name));

  const noScoresStartIdxC=scoredRecs.length;
  const meansRowIdxC=scoredRecs.length+unscoredDataC.length;

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'landscape', unit:'mm', format:'a4'});
  const W   = doc.internal.pageSize.getWidth();

  let y = pdfHeader(
    doc,
    `GRADE ${level} — COMBINED EXAM RESULTS`,
    `${examName}  |  ${term} ${year}  |  Streams: ${foundStreams.join(', ')}  |  ${scoredRecs.length} scored  |  ${unscoredDataC.length} not scored`
  );

  // Use subjects for the grade level (same logic as getSubjects)
  const subjects  = ['7','8','9'].includes(level) ? SUBJ_789 : SUBJ_456;
  // Determine a representative grade for sub-component lookup (first grade of this level)
  const repGrade = subjects[0] || (level + 'N'); // e.g. '7N', '8N', '9N' — but we need actual grade format
  // Find first actual grade in this level
  const gradesInLevel = ALL_GRADES.filter(g => g.charAt(0) === level);
  const repGradeForSubs = gradesInLevel[0] || (level + 'R');
  const engSubs = getEngSubs(repGradeForSubs);
  const kisSubs = getKisSubs(repGradeForSubs);
  const scieSubs = getScieSubs(repGradeForSubs);

  // Build expanded display columns (grade-aware + presence-gated, as above)
  const engPlanC = ppColPlan(scoredRecs, engSubs, ['GRA','COMP'], 'ENG');
  const kisPlanC = ppColPlan(scoredRecs, kisSubs, ['LUG','INS'], 'KIS');
  const sciePlanC = ppColPlan(scoredRecs, scieSubs, null, 'SCIE');
  const dispCols = [];
  subjects.forEach(s => {
    if(s === 'ENG' && engPlanC.show0){
      dispCols.push({label:engSubs[0], key:engSubs[0], isSub:true,  parentKey:'ENG', legacy:'GRA'});
      dispCols.push({label:engSubs[1], key:engSubs[1], isSub:true,  parentKey:'ENG', legacy:'COMP'});
    } else if(s === 'KIS' && kisPlanC.show0){
      dispCols.push({label:kisSubs[0], key:kisSubs[0], isSub:true,  parentKey:'KIS', legacy:'LUG'});
      dispCols.push({label:kisSubs[1], key:kisSubs[1], isSub:true,  parentKey:'KIS', legacy:'INS'});
    } else if(s === 'SCIE' && scieSubs.length === 2 && sciePlanC.show0){
      dispCols.push({label:scieSubs[0], key:scieSubs[0], isSub:true,  parentKey:'SCIE', legacy:null});
      dispCols.push({label:scieSubs[1], key:scieSubs[1], isSub:true,  parentKey:'SCIE', legacy:null});
    }
    dispCols.push({label:s, key:s, isSub:false, parentKey:null});
  });

  const getDispValC = (e, col) => {
    if(col.isSub) return ppSubVal(e, col.key, col.legacy);
    return e.scores[col.key] !== undefined ? e.scores[col.key] : '—';
  };

  // Compute overall means per display column — ONLY scored students, never absent ones.
  // Sub-score cols (GRA, COMP, LUG, INS) are excluded from means (show '—').
  const meansC = dispCols.map(col => {
    if(col.isSub) return '—'; // GRA/COMP/LUG/INS — no mean shown
    const vals = scoredRecs.filter(e=>e.scores[col.key]!==undefined).map(e=>e.scores[col.key]);
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—';
  });
  const totalMeanC = scoredRecs.length
    ? (scoredRecs.reduce((a,e)=>a+e.total,0)/scoredRecs.length).toFixed(1)
    : '—';

  // Head row — "Class" column inserted at position 1 (after name)
  const headRow = ['Student Name', 'Class', ...dispCols.map(c=>c.label), 'Total', 'Rank'];

  // Body rows:
  // 1. Scored students (ranked)
  // 2. Unscored / absent students (ABS, no rank, not in means)
  // 3. Grade means row (scored only)
  const bodyRows = [
    ...scoredRecs.map(e => [
      e.name,
      e.grade,
      ...dispCols.map(col => getDispValC(e, col)),
      e.total,
      e._combinedRank
    ]),
    // Absent rows
    ...unscoredDataC.map(u=>[
      u.name,
      u.grade,
      ...dispCols.map(()=>'ABS'),
      'ABS',
      '—'
    ]),
    // Grade means row (scored only)
    ['GRADE MEAN', '', ...meansC, totalMeanC, '']
  ];

  // ── Column widths ────────────────────────────────────────────────
  const usableW  = W - 8;   // 4mm margin each side
  const nameW    = 36;
  const classW   = 11;      // stream badge (4N / 5S etc.)
  const fixedW   = 12 + 8;  // Total + Rank
  const remainW  = usableW - nameW - classW - fixedW;

  const nSubCols  = dispCols.filter(c=>c.isSub).length;
  const nMainCols = dispCols.filter(c=>!c.isSub).length;
  const mw = Math.floor(remainW / (nMainCols + nSubCols * 0.75) * 10) / 10;
  const sw = Math.floor(mw * 0.75 * 10) / 10;

  const colStyles = {
    0: {cellWidth:nameW,  halign:'left', fontStyle:'bold', fontSize:8},
    1: {cellWidth:classW, halign:'center', fontStyle:'bold', fontSize:9},  // Class column
  };

  // Stream badge colours — cycle through distinct pastel bg per stream
  const streamColours = {
    '1E':[200,255,230],'1N':[210,255,240],'1S':[220,255,235],'1W':[195,255,225],
    '2E':[200,255,230],'2N':[210,255,240],'2S':[220,255,235],
    '3E':[200,255,230],'3N':[210,255,240],'3S':[220,255,235],
    '4N':[200,230,255],'4S':[200,255,220],'4E':[255,240,200],'4W':[255,210,210],
    '5N':[200,230,255],'5S':[200,255,220],'5E':[255,240,200],'5W':[255,210,210],
    '6N':[210,235,255],'6S':[210,255,235],
    '7R':[255,230,200],'7B':[210,220,255],
    '8R':[255,230,200],'8B':[210,220,255],
    '9R':[255,230,200],'9B':[210,220,255],
  };

  dispCols.forEach((col, ci) => {
    const styleIdx = ci + 2; // offset by 2 now (name + class cols)
    if(col.isSub)                                          colStyles[styleIdx] = {cellWidth:sw,  fontStyle:'normal', fontSize:8,  textColor:[100,100,140]};
    else if(col.key==='ENG'||col.key==='KIS')             colStyles[styleIdx] = {cellWidth:mw,  fontStyle:'bold',   fontSize:10};
    else                                                   colStyles[styleIdx] = {cellWidth:mw,  fontStyle:'bold',   fontSize:10};
  });
  colStyles[2 + dispCols.length]     = {cellWidth:12, fontStyle:'bold'};  // Total
  colStyles[2 + dispCols.length + 1] = {cellWidth:8,  fontStyle:'bold'};  // Rank

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4, right:4},
    tableWidth:'auto',
    head:[headRow],
    body:bodyRows,
    theme:'grid',
    headStyles:{fillColor:[30,100,200], textColor:[255,255,255], fontStyle:'bold', fontSize:6.5, cellPadding:1.2},
    styles:{fontSize:9, cellPadding:2, halign:'center', lineColor:[0,0,0], lineWidth:0.4},
    columnStyles:colStyles,
    didParseCell(d){
      if(d.section === 'body'){
        // ── Scored student rows ──
        if(d.row.index < noScoresStartIdxC){
          if(d.column.index === 0){
            d.cell.styles.fontSize=8; d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[0,0,0]; d.cell.styles.overflow='hidden';
          }
          if(d.column.index === 1){
            const streamVal=String(d.cell.raw||'');
            const bg=streamColours[streamVal]||[220,220,220];
            d.cell.styles.fillColor=bg; d.cell.styles.textColor=[0,0,0];
            d.cell.styles.fontStyle='bold'; d.cell.styles.fontSize=9;
          }
          if(d.column.index >= 2){
            d.cell.styles.fontSize=10; d.cell.styles.fontStyle='bold';
          }
          if(d.row.index%2===0 && d.column.index>1){
            d.cell.styles.fillColor=[245,248,255];
          }
          const ci=d.column.index-2;
          if(ci>=0&&ci<dispCols.length&&dispCols[ci]&&dispCols[ci].isSub){
            d.cell.styles.textColor=[80,80,80]; d.cell.styles.fontSize=8; d.cell.styles.fontStyle='normal';
          }
          if(ci>=0&&ci<dispCols.length&&dispCols[ci]&&!dispCols[ci].isSub&&(dispCols[ci].key==='ENG'||dispCols[ci].key==='KIS'||(dispCols[ci].key==='SCIE'&&dispCols.some(c=>c.isSub&&c.parentKey==='SCIE')))){
            d.cell.styles.fontStyle='bold'; d.cell.styles.textColor=[0,0,0];
          }
          if(d.column.index===2+dispCols.length){
            d.cell.styles.fontStyle='bold'; d.cell.styles.textColor=[0,0,0];
          }
          if(d.column.index===3+dispCols.length){
            const rank=scoredRecs[d.row.index]?scoredRecs[d.row.index]._combinedRank:(d.row.index+1);
            d.cell.styles.fontStyle='bold';
            if(rank===1)      {d.cell.styles.fillColor=[255,215,0];  d.cell.styles.textColor=[0,0,0];}
            else if(rank===2) {d.cell.styles.fillColor=[192,192,192];d.cell.styles.textColor=[0,0,0];}
            else if(rank===3) {d.cell.styles.fillColor=[205,127,50]; d.cell.styles.textColor=[255,255,255];}
            else              {d.cell.styles.textColor=[0,0,0];}
          }
        }
        // ── Unscored / absent rows ──
        if(d.row.index>=noScoresStartIdxC && d.row.index<meansRowIdxC){
          d.cell.styles.fillColor=[232,232,232];
          d.cell.styles.textColor=[120,120,120];
          d.cell.styles.fontStyle='italic';
          d.cell.styles.fontSize=8;
          if(d.column.index===0){
            d.cell.styles.fontStyle='bold'; d.cell.styles.textColor=[80,80,80]; d.cell.styles.halign='left';
          }
          if(d.column.index===1){
            const streamVal=String(d.cell.raw||'');
            const bg=streamColours[streamVal]||[220,220,220];
            d.cell.styles.fillColor=bg; d.cell.styles.textColor=[80,80,80]; d.cell.styles.fontStyle='italic';
          }
        }
        // ── Means row ──
        if(d.row.index===meansRowIdxC){
          d.cell.styles.fillColor=[30,100,200]; d.cell.styles.textColor=[255,255,255];
          d.cell.styles.fontStyle='bold'; d.cell.styles.fontSize=7;
        }
      }
    },
    didDrawPage(){ pdfFooter(doc); }
  });

  // Footer note
  const finalYC = doc.lastAutoTable.finalY + 3;
  if(finalYC < doc.internal.pageSize.getHeight() - 15){
    doc.setFontSize(6.5);
    doc.setTextColor(140,140,160);
    doc.text(
      'Note: GRA = English Grammar, COMP = English Composition (ENG = GRA+COMP)  |  LUG = Kiswahili Lugha, INS = Kiswahili Insha (KIS = LUG+INS)  |  Totals use ENG and KIS only.  |  Rank is across all streams in Grade '+level+'.  |  ABS = No scores recorded (excluded from grade means).',
      5, finalYC
    );
  }

  addPageNumbers(doc);
  doc.save(`Grade${level}_Combined_${examName.replace(/\s+/g,'_')}_${term.replace(/\s+/g,'_')}_${year}.pdf`);
  toast(`📊 Combined Grade ${level} results exported — ${scoredRecs.length} scored, ${unscoredDataC.length} not scored`);
}

/* ─── Combined Grade Rubric Results PDF ────────────────────────────────
   Same record set as the combined marks export (all streams merged), but
   every subject cell shows its RUBRIC (CODE + points) instead of marks and
   students are ranked by TOTAL POINTS, not total marks. Subject columns are
   the parent subjects only (no PP breakdown), mirroring the class rubric
   export. Other exports are untouched. */
function exportCombinedRubricPDF(level, examName, term, year){
  const GRADE_STREAMS_R = {
    '1':['1E','1N','1S','1W'], '2':['2E','2N','2S'], '3':['3E','3N','3S'],
    '4':['4N','4S','4E','4W'], '5':['5N','5S','5E','5W'], '6':['6N','6S'],
    '7':['7R','7B'], '8':['8R','8B'], '9':['9R','9B']
  };
  const streams = GRADE_STREAMS_R[level] || [];
  if(!streams.length) return toast('Unknown grade level', true);

  let records = db.exams.filter(e =>
    streams.includes(e.grade) &&
    (e.examName||'Untitled Exam') === examName &&
    e.term === term && e.year == year
  );
  if(!records.length){
    records = db.exams.filter(e =>
      streams.includes(e.grade) &&
      (e.examName||'Untitled Exam') === examName
    );
  }
  if(!records.length) return toast('No records found for Grade '+level+' — '+examName, true);

  const foundStreams = [...new Set(records.map(e=>e.grade))].sort();
  const subjects = ['7','8','9'].includes(level) ? SUBJ_789 : SUBJ_456;
  const isJnr = ['7','8','9'].includes(level);
  const maxP = subjects.length * 8;

  const ptsOf = (e, s) => (e.scores && typeof e.scores[s] === 'number') ? getRubric(e.scores[s], e.grade, e.examName).pts : null;
  const totalPtsOf = e => subjects.reduce((a, s) => { const p = ptsOf(e, s); return a + (p === null ? 0 : p); }, 0);
  const hasScoresR = e => e.scores && Object.values(e.scores).some(v => typeof v === 'number');

  // Ranked by TOTAL POINTS (not marks); equal point totals share the
  // same rank (1,2,2,4).
  const scoredR = records.filter(hasScoresR).sort((a, b) => totalPtsOf(b) - totalPtsOf(a));
  scoredR.forEach((r, i) => { r._combinedRubRank = (i > 0 && totalPtsOf(r) === totalPtsOf(scoredR[i-1])) ? scoredR[i-1]._combinedRubRank : i + 1; });
  const unscoredExamR = records.filter(e => !hasScoresR(e));
  const recordedAdm = new Set(records.map(e => e.admNo));
  const missingR = db.students.filter(s => streams.includes(s.grade) && !recordedAdm.has(s.admNo));
  const unscoredR = [
    ...unscoredExamR.map(e => ({ name: e.name || e.admNo, grade: e.grade })),
    ...missingR.map(s => ({ name: s.fullName, grade: s.grade }))
  ].sort((a, b) => ((a.grade || '') + (a.name || '')).localeCompare((b.grade || '') + (b.name || '')));

  const rubCell = (e, s) => {
    const p = ptsOf(e, s);
    if(p === null) return '—';
    return getRubric(e.scores[s], e.grade, e.examName).code + ' (' + p + ')';
  };
  const ptToCode = p => {
    if(p >= 7.5) return 'E.E1'; if(p >= 6.5) return 'E.E2';
    if(p >= 5.5) return 'M.E1'; if(p >= 4.5) return 'M.E2';
    if(p >= 3.5) return 'A.E1'; if(p >= 2.5) return 'A.E2';
    if(p >= 1.5) return 'B.E1'; return 'B.E2';
  };
  const meansR = subjects.map(s => {
    const pts = scoredR.filter(e => ptsOf(e, s) !== null).map(e => ptsOf(e, s));
    if(!pts.length) return '—';
    const avg = (pts.reduce((a, b) => a + b, 0) / pts.length).toFixed(1);
    return ptToCode(parseFloat(avg)) + ' (' + avg + ')';
  });
  const totalAvgR = scoredR.length
    ? (scoredR.reduce((a, e) => a + totalPtsOf(e), 0) / scoredR.length).toFixed(1)
    : '—';

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = pdfHeader(
    doc,
    `GRADE ${level} — COMBINED RUBRIC RESULTS`,
    `${examName}  |  ${term} ${year}  |  Streams: ${foundStreams.join(', ')}  |  Ranked by total points  |  ${scoredR.length} scored  |  ${unscoredR.length} not scored`
  );

  const rFills = { EE1:[0,150,110], EE2:[0,180,130], ME1:[20,90,180], ME2:[60,130,220], AE1:[160,120,0], AE2:[200,160,0], BE1:[190,40,60], BE2:[220,80,100] };
  const legend = [['EE1/2','Exceeding',[0,150,110]],['ME1/2','Meeting',[20,90,180]],['AE1/2','Approaching',[160,120,0]],['BE1/2','Below',[190,40,60]]];
  let lx = 5;
  legend.forEach(l => {
    doc.setFillColor(...l[2]); doc.roundedRect(lx, y, 2.5, 3, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...l[2]);
    doc.text(`${l[0]} = ${l[1]}`, lx + 3.5, y + 2.5);
    lx += 34;
  });
  y += 6;

  const headRowR = ['Student Name', 'Class', ...subjects, 'Total Pts', 'Ovr. Rubric', 'Rank'];
  const bodyRowsR = [
    ...scoredR.map((e, i) => {
      const tp = totalPtsOf(e);
      return [e.name, e.grade, ...subjects.map(s => rubCell(e, s)),
        `${tp}/${maxP}`,
        getTotalRubric(tp, isJnr).code,
        e._combinedRubRank];
    }),
    ...unscoredR.map(u => [u.name, u.grade, ...subjects.map(() => 'ABS'), 'ABS', 'ABS', '—']),
    ['GRADE MEAN', '', ...meansR, totalAvgR,
      scoredR.length ? getTotalRubric(Math.round(parseFloat(totalAvgR) || 0), isJnr).code : '—', '']
  ];

  const usableW = W - 8, nameW = 36, classW = 11;
  const subjW = Math.floor((usableW - nameW - classW - 12 - 8 - 14 - 16) / subjects.length * 10) / 10;
  const colStylesR = {
    0: { cellWidth: nameW, halign: 'left', fontStyle: 'bold', fontSize: 8 },
    1: { cellWidth: classW, halign: 'center', fontStyle: 'bold', fontSize: 9 }
  };
  subjects.forEach((s, ci) => { colStylesR[ci + 2] = { cellWidth: subjW, fontSize: 7 }; });
  const tpCol = 2 + subjects.length;
  colStylesR[tpCol] = { cellWidth: 14, fontStyle: 'bold' };
  colStylesR[tpCol + 1] = { cellWidth: 16, fontStyle: 'bold' };
  colStylesR[tpCol + 2] = { cellWidth: 8, fontStyle: 'bold' };

  const streamColoursR = {
    '4N':[200,230,255],'4S':[200,255,220],'4E':[255,240,200],'4W':[255,210,210],
    '5N':[200,230,255],'5S':[200,255,220],'5E':[255,240,200],'5W':[255,210,210],
    '6N':[210,235,255],'6S':[210,255,235],
    '7R':[255,230,200],'7B':[210,220,255],
    '8R':[255,230,200],'8B':[210,220,255],
    '9R':[255,230,200],'9B':[210,220,255]
  };
  const noScoresIdxR = scoredR.length, meansIdxR = scoredR.length + unscoredR.length;

  doc.autoTable({
    tableLineColor: [0,0,0], tableLineWidth: 0.4,
    startY: y, margin: { left: 4, right: 4 },
    tableWidth: 'auto',
    head: [headRowR],
    body: bodyRowsR,
    theme: 'grid',
    headStyles: { fillColor: [255,220,220], textColor: [0,0,0], fontStyle: 'bold', fontSize: 6.5, cellPadding: 1.2 },
    styles: { fontSize: 7, cellPadding: 1.5, halign: 'center', lineColor: [0,0,0], lineWidth: 0.4 },
    columnStyles: colStylesR,
    didParseCell(d){
      if(d.section !== 'body') return;
      if(d.row.index < noScoresIdxR){
        if(d.column.index === 1){
          const bg = streamColoursR[String(d.cell.raw || '')] || [220,220,220];
          d.cell.styles.fillColor = bg; d.cell.styles.textColor = [0,0,0];
        }
        if(d.row.index % 2 === 0 && d.column.index > 1) d.cell.styles.fillColor = [245,248,255];
        if(d.column.index === tpCol + 2){
          const rank = scoredR[d.row.index] ? scoredR[d.row.index]._combinedRubRank : (d.row.index + 1);
          if(rank === 1){ d.cell.styles.fillColor = [255,215,0]; d.cell.styles.textColor = [0,0,0]; }
          else if(rank === 2){ d.cell.styles.fillColor = [192,192,192]; d.cell.styles.textColor = [0,0,0]; }
          else if(rank === 3){ d.cell.styles.fillColor = [205,127,50]; d.cell.styles.textColor = [255,255,255]; }
        }
      } else if(d.row.index < meansIdxR){
        d.cell.styles.fillColor = [232,232,232]; d.cell.styles.textColor = [120,120,120];
        d.cell.styles.fontStyle = 'italic'; d.cell.styles.fontSize = 7;
      } else {
        d.cell.styles.fillColor = [255,220,220]; d.cell.styles.textColor = [0,0,0];
        d.cell.styles.fontStyle = 'bold'; d.cell.styles.fontSize = 7;
      }
    },
    didDrawPage(){ pdfFooter(doc); }
  });

  addPageNumbers(doc);
  doc.save(`Grade${level}_CombinedRubric_${examName.replace(/\s+/g,'_')}_${term.replace(/\s+/g,'_')}_${year}.pdf`);
  toast(`🏷️ Combined Grade ${level} rubric results exported (ranked by points) — ${scoredR.length} scored, ${unscoredR.length} not scored`);
}

/* ─── Class Rubric-Only PDF ─── */

// Overall rubric for TOTAL POINTS across all subjects
// Grade 4/5/6: 8 subjects × 8pts = 64 max
// Grade 7/8/9: 9 subjects × 8pts = 72 max
function getTotalRubric(totalPts, isJnr){
  if(isJnr){
    if(totalPts>=64) return {code:'E.E1',cls:'EE1'};
    if(totalPts>=55) return {code:'E.E2',cls:'EE2'};
    if(totalPts>=46) return {code:'M.E1',cls:'ME1'};
    if(totalPts>=37) return {code:'M.E2',cls:'ME2'};
    if(totalPts>=28) return {code:'A.E1',cls:'AE1'};
    if(totalPts>=19) return {code:'A.E2',cls:'AE2'};
    if(totalPts>=10) return {code:'B.E1',cls:'BE1'};
    return {code:'B.E2',cls:'BE2'};
  } else {
    if(totalPts>=57) return {code:'E.E1',cls:'EE1'};
    if(totalPts>=49) return {code:'E.E2',cls:'EE2'};
    if(totalPts>=41) return {code:'M.E1',cls:'ME1'};
    if(totalPts>=33) return {code:'M.E2',cls:'ME2'};
    if(totalPts>=25) return {code:'A.E1',cls:'AE1'};
    if(totalPts>=17) return {code:'A.E2',cls:'AE2'};
    if(totalPts>=9)  return {code:'B.E1',cls:'BE1'};
    return {code:'B.E2',cls:'BE2'};
  }
}

function exportClassRubricPDF(){
  if(getCurrentRole()!=='admin') return toast('⛔ PDF export is restricted to admin only', true);
  const grade=document.getElementById('pdf_classGrade').value;
  const examName=document.getElementById('pdf_classExamName').value;
  const term=document.getElementById('pdf_classTerm').value;
  const year=document.getElementById('pdf_classYear').value;
  if(!grade)return toast('Select a grade',true);
  if(!examName)return toast('Select an exam',true);

  const hasScoresR=e=>e.scores&&Object.values(e.scores).some(v=>typeof v==='number');

  let allRecs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled Exam')===examName&&e.term===term&&e.year==year);
  if(!allRecs.length)allRecs=db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled Exam')===examName);

  // Split: scored vs unscored. Ranked by TOTAL POINTS (not marks);
  // equal point totals share the same rank (1,2,2,4).
  const ptsTotR = e => getSubjects(grade).reduce((a, s) =>
    a + ((e.scores && typeof e.scores[s] === 'number') ? getRubric(e.scores[s], e.grade, e.examName).pts : 0), 0);
  const records=allRecs.filter(hasScoresR).sort((a,b)=>ptsTotR(b)-ptsTotR(a));
  const classRubRanks = compRanks(records, e=>ptsTotR(e));
  const unscoredExamR=allRecs.filter(e=>!hasScoresR(e));

  // Students in this grade with no exam record at all
  const recordedAdmNosR=new Set(allRecs.map(e=>e.admNo));
  const missingStudentsR=db.students.filter(s=>s.grade===grade&&!recordedAdmNosR.has(s.admNo));

  const unscoredDataR=[
    ...unscoredExamR.map(e=>({name:e.name||e.admNo,admNo:e.admNo})),
    ...missingStudentsR.map(s=>({name:s.fullName,admNo:s.admNo}))
  ].sort((a,b)=>(a.name||'').localeCompare(b.name||''));

  if(!records.length&&!unscoredDataR.length)return toast('No records found',true);

  const noScoresStartIdxR=records.length;
  const meansRow=records.length+unscoredDataR.length;

  const jsPDF=window._getJsPDF(), doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
  let y=pdfHeader(doc,`CLASS ${grade} — RUBRIC RESULTS`,`${examName}  |  ${term} ${year}  |  ${records.length} scored  |  ${unscoredDataR.length} not scored`);

  const subjects=getSubjects(grade);
  const rFills={EE1:[0,150,110],EE2:[0,180,130],ME1:[20,90,180],ME2:[60,130,220],AE1:[160,120,0],AE2:[200,160,0],BE1:[190,40,60],BE2:[220,80,100]};

  // Compact legend strip
  const legendData=[['EE1/2','Exceeding',[0,150,110]],['ME1/2','Meeting',[20,90,180]],['AE1/2','Approaching',[160,120,0]],['BE1/2','Below',[190,40,60]]];
  let lx=5;
  legendData.forEach(l=>{
    doc.setFillColor(...l[2]); doc.roundedRect(lx,y,2.5,3,0.5,0.5,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(6.5); doc.setTextColor(...l[2]);
    doc.text(`${l[0]} = ${l[1]}`,lx+3.5,y+2.5);
    lx+=34;
  });
  y+=6;

  const rubLabel=(s,e)=>{
    if(e.scores?.[s]!==undefined){
      const rb=getRubric(e.scores[s],e.grade,e.examName);
      return `${rb.code} (${rb.pts})`;
    }
    const fb=e.rubrics?.[s];
    return fb ? `${fb.code} (${fb.pts||'—'})` : '—';
  };

  // Class means per subject — ONLY scored students
  const rubricMeans=subjects.map(s=>{
    const pts=records.filter(e=>e.scores?.[s]!==undefined).map(e=>getRubric(e.scores[s],e.grade,e.examName).pts);
    if(!pts.length) return '—';
    const avg=(pts.reduce((a,b)=>a+b,0)/pts.length).toFixed(1);
    const ptToCode=p=>{
      if(p>=7.5)return'E.E1';if(p>=6.5)return'E.E2';
      if(p>=5.5)return'M.E1';if(p>=4.5)return'M.E2';
      if(p>=3.5)return'A.E1';if(p>=2.5)return'A.E2';
      if(p>=1.5)return'B.E1';return'B.E2';
    };
    return `${ptToCode(parseFloat(avg))} (${avg})`;
  });

  const isJnr=['7','8','9'].includes((grade||'').charAt(0));
  const maxP=isJnr?72:64;
  // Total avg points — mean of each scored student's total pts (scored students only)
  const totalAvgPts=records.length?(records.reduce((a,e)=>{
    const valid=subjects.filter(s=>e.scores?.[s]!==undefined);
    return a+valid.reduce((s2,s)=>s2+getRubric(e.scores[s],e.grade,e.examName).pts,0);
  },0)/records.length).toFixed(1):'—';

  const totalPtsCol  = 2 + subjects.length;
  const overallRubCol= 3 + subjects.length;
  const rankCol      = 4 + subjects.length;

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    head:[['#','Student Name',...subjects,'Total Pts','Ovr. Rubric','Rank']],
    body:[
      // Scored students
      ...records.map((e,i)=>{
        const rubs=subjects.map(s=>rubLabel(s,e));
        const valid=subjects.filter(s=>e.scores?.[s]!==undefined);
        const totalP=valid.reduce((a,s)=>a+getRubric(e.scores[s],e.grade,e.examName).pts,0);
        const totalLabel=`${totalP}/${maxP}`;
        const ovrRub=valid.length?getTotalRubric(totalP,isJnr).code:'—';
        return[classRubRanks[i],e.name,...rubs,totalLabel,ovrRub,classRubRanks[i]];
      }),
      // Unscored / absent students
      ...unscoredDataR.map(u=>[
        '—', u.name,
        ...subjects.map(()=>'ABS'),
        'ABS','ABS','—'
      ]),
      // Class means row (scored only)
      ['','CLASS MEAN',...rubricMeans,totalAvgPts,
        records.length?getTotalRubric(Math.round(parseFloat(totalAvgPts)||0),isJnr).code:'—',
        '']
    ],
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7,cellPadding:1.2},
    styles:{fontSize:6.5,cellPadding:1.2,halign:'center',lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:{
      0:{cellWidth:7},
      1:{cellWidth:34,halign:'left'},
      [totalPtsCol]  :{cellWidth:14,fontStyle:'bold'},
      [overallRubCol]:{cellWidth:16,fontStyle:'bold'},
      [rankCol]      :{cellWidth:8, fontStyle:'bold'}
    },
    didParseCell(d){
      if(d.section==='body'){
        // ── Scored rows ──
        if(d.row.index < noScoresStartIdxR){
          if(d.column.index>=2&&d.column.index<2+subjects.length){
            const raw=String(d.cell.raw||'');
            const code=raw.split(' ')[0];
            const fk=code.replace('.','');
            if(rFills[fk]){
              d.cell.styles.fillColor=rFills[fk];
              d.cell.styles.textColor=[255,255,255];
              d.cell.styles.fontStyle='bold';
            }
          }
          if(d.column.index===overallRubCol){
            const fk=String(d.cell.raw||'').replace('.','');
            if(rFills[fk]){
              d.cell.styles.fillColor=rFills[fk];
              d.cell.styles.textColor=[255,255,255];
              d.cell.styles.fontStyle='bold';
              d.cell.styles.fontSize=8;
            }
          }
          if(d.column.index===rankCol){
            const pos=classRubRanks[d.row.index]||(d.row.index+1);
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=pos===1?[200,160,0]:pos===2?[130,130,130]:pos===3?[160,100,50]:[100,120,150];
          }
        }
        // ── Unscored / absent rows ──
        if(d.row.index>=noScoresStartIdxR && d.row.index<meansRow){
          d.cell.styles.fillColor=[232,232,232];
          d.cell.styles.textColor=[120,120,120];
          d.cell.styles.fontStyle='italic';
          d.cell.styles.fontSize=6.5;
          if(d.column.index===1){
            d.cell.styles.fontStyle='bold';
            d.cell.styles.textColor=[80,80,80];
            d.cell.styles.halign='left';
          }
        }
        // ── Means row ──
        if(d.row.index===meansRow){
          d.cell.styles.fillColor=[255,200,200];
          d.cell.styles.textColor=[0,0,0];
          d.cell.styles.fontStyle='bold';
          d.cell.styles.fontSize=7;
          if(d.column.index>=2&&d.column.index<2+subjects.length){
            const raw=String(d.cell.raw||'');
            const code=raw.split(' ')[0];
            const fk=code.replace('.','');
            if(rFills[fk]){d.cell.styles.fillColor=rFills[fk];d.cell.styles.textColor=[255,255,255];}
          }
          if(d.column.index===overallRubCol){
            const fk=String(d.cell.raw||'').replace('.','');
            if(rFills[fk]){d.cell.styles.fillColor=rFills[fk];d.cell.styles.textColor=[255,255,255];}
          }
        }
      }
    },
    didDrawPage(){pdfFooter(doc);}
  });

  addPageNumbers(doc);
  doc.save(`Class_${grade}_${examName.replace(/\s+/g,'_')}_Rubric.pdf`);
  toast('🏷️ Rubric PDF Downloaded');
}

/* ─── Blank Marksheet PDF (Landscape) ─── */
function exportBlankMarksheet(){
  if(getCurrentRole()!=='admin') return toast('⛔ PDF export is restricted to admin only', true);
  const grade  = document.getElementById('pdf_classGrade').value;
  const examName = document.getElementById('pdf_classExamName').value;
  const term   = document.getElementById('pdf_classTerm').value;
  const year   = document.getElementById('pdf_classYear').value;
  if(!grade) return toast('Select a grade first', true);

  // Get student list for this class, sorted alphabetically
  const students = [...db.students.filter(s => s.grade === grade)]
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
  if(!students.length) return toast(`No students found in Grade ${grade}`, true);

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'landscape', unit:'mm', format:'a4'});
  const W = doc.internal.pageSize.getWidth(); // 297mm

  // ── Header ──────────────────────────────────────────────────────────────
  const examLabel = examName || 'Blank Marksheet';
  let y = pdfHeader(
    doc,
    `CLASS ${grade} — BLANK MARKSHEET`,
    `${examLabel}  |  ${term} ${year}  |  ${students.length} students`
  );

  // ── Instruction banner ──────────────────────────────────────────────────
  const engSubs = getEngSubs(grade);
  const kisSubs = getKisSubs(grade);
  doc.setFillColor(232,240,232);
  doc.roundedRect(4, y, W-8, 8, 1, 1, 'F');
  doc.setDrawColor(46,139,87);
  doc.roundedRect(4, y, W-8, 8, 1, 1, 'S');
  doc.setFont('helvetica','italic');
  doc.setFontSize(6.8);
  doc.setTextColor(27,94,59);
  doc.text(
    `Use this sheet to capture raw subject marks.  ${engSubs[0]} + ${engSubs[1]} → ENG total  |  ${kisSubs[0]} + ${kisSubs[1]} → KIS total  |  Each component max: 50 marks  |  ENG & KIS max: 100 marks`,
    W/2, y+5, {align:'center'}
  );
  y += 11;

  // ── Build column definitions ────────────────────────────────────────────
  const subjects = getSubjects(grade);

  // Expanded display columns (grade-aware)
  // ENG → [ENG PP1, ENG PP2, ENG]   KIS → [KIS PP1, KIS PP2, KIS]
  // Grade-9 SCIE → [SCIE PP1, SCIE PP2, SCIE]   others → [subj]
  const dispCols = []; // {label, isSub, parentKey}
  const scieSubsMS = getScieSubs(grade);
  subjects.forEach(s => {
    if(s === 'ENG'){
      dispCols.push({label:engSubs[0],  isSub:true,  parentKey:'ENG'});
      dispCols.push({label:engSubs[1], isSub:true,  parentKey:'ENG'});
      dispCols.push({label:'ENG',  isSub:false, parentKey:null, isMain:true});
    } else if(s === 'KIS'){
      dispCols.push({label:kisSubs[0],  isSub:true,  parentKey:'KIS'});
      dispCols.push({label:kisSubs[1], isSub:true,  parentKey:'KIS'});
      dispCols.push({label:'KIS',  isSub:false, parentKey:null, isMain:true});
    } else if(s === 'SCIE' && scieSubsMS.length === 2){
      dispCols.push({label:scieSubsMS[0],  isSub:true,  parentKey:'SCIE'});
      dispCols.push({label:scieSubsMS[1], isSub:true,  parentKey:'SCIE'});
      dispCols.push({label:'SCIE',  isSub:false, parentKey:null, isMain:true});
    } else {
      dispCols.push({label:s, isSub:false, parentKey:null});
    }
  });

  // ── Column widths ────────────────────────────────────────────────────────
  const usableW = W - 8;               // 4mm margin each side
  const fixedCols = 2 + 1 + 1;         // #, Name, Total, Signature
  const fixedW = 7 + 42 + 14 + 22;     // widths of fixed cols
  const remainW = usableW - fixedW;
  const nSub  = dispCols.filter(c => c.isSub).length;
  const nMain = dispCols.filter(c => !c.isSub).length;
  // sub-cols 70% of main-col width
  const mainW = Math.floor(remainW / (nMain + nSub * 0.7) * 10) / 10;
  const subW  = Math.floor(mainW * 0.7 * 10) / 10;

  // ── Head row — two-tier spanning ─────────────────────────────────────────
  // Build a grouped header to show ENG (GRA+COMP) and KIS (LUG+INS) brackets
  // jsPDF-autotable supports a simple single head array; we add a second
  // header row manually to show component groupings.
  const headRow = ['#', 'Student Name',
    ...dispCols.map(c => c.label),
    'Total', 'Signature / Remarks'
  ];

  // ── Body rows — all blank score cells ───────────────────────────────────
  const bodyRows = students.map((s, i) => [
    i + 1,
    s.fullName,
    ...dispCols.map(() => ''),   // blank for each score column
    '',                          // Total — blank
    ''                           // Signature
  ]);

  // ── Column styles map ────────────────────────────────────────────────────
  const colStyles = {
    0: {cellWidth: 7,  halign: 'center', fontSize: 7},
    1: {cellWidth: 42, halign: 'left',   fontStyle: 'bold', fontSize: 8},
  };
  dispCols.forEach((col, ci) => {
    colStyles[ci + 2] = col.isSub
      ? {cellWidth: subW,  halign: 'center', fontSize: 7.5, textColor: [60,100,60]}
      : col.isMain
        ? {cellWidth: mainW, halign: 'center', fontSize: 8.5, fontStyle: 'bold'}
        : {cellWidth: mainW, halign: 'center', fontSize: 8.5, fontStyle: 'bold'};
  });
  colStyles[2 + dispCols.length]     = {cellWidth: 14, halign: 'center', fontStyle: 'bold', fontSize: 9};
  colStyles[2 + dispCols.length + 1] = {cellWidth: 22, halign: 'left',   fontSize: 6.5};

  // ── Sub-header band (manual) — draws "← ENG →" and "← KIS →" ────────────
  // We'll render this as a thin annotation row above the autoTable via
  // a willDrawCell hook on the head row instead (simpler approach: use
  // didDrawCell on head to draw group brackets)

  // ── Render autoTable ─────────────────────────────────────────────────────
  doc.autoTable({
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.35,
    startY: y,
    margin: {left: 4, right: 4},
    head: [headRow],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor:   [27, 94, 59],
      textColor:   [255, 255, 255],
      fontStyle:   'bold',
      fontSize:    6.5,
      cellPadding: 1.5,
      halign:      'center'
    },
    styles: {
      fontSize:    8,
      cellPadding: {top: 2, bottom: 2, left: 1.5, right: 1.5},
      halign:      'center',
      lineColor:   [0, 0, 0],
      lineWidth:   0.3,
      minCellHeight: 7
    },
    columnStyles: colStyles,
    didParseCell(d) {
      if(d.section === 'head') {
        const ci = d.column.index - 2;
        if(ci >= 0 && ci < dispCols.length){
          if(dispCols[ci].isSub) {
            // Sub-cols (GRA, COMP, LUG, INS) — lighter green header
            d.cell.styles.fillColor  = [46, 100, 65];
            d.cell.styles.textColor  = [200, 240, 215];
            d.cell.styles.fontStyle  = 'normal';
            d.cell.styles.fontSize   = 6;
          } else if(dispCols[ci].isMain) {
            // ENG / KIS summary cols — bright white-on-deep header
            d.cell.styles.fillColor  = [10, 60, 30];
            d.cell.styles.textColor  = [180, 255, 200];
            d.cell.styles.fontStyle  = 'bold';
            d.cell.styles.fontSize   = 7.5;
          }
        }
        // Total col
        if(d.column.index === 2 + dispCols.length) {
          d.cell.styles.fillColor = [10, 60, 30];
          d.cell.styles.textColor = [200, 255, 210];
          d.cell.styles.fontStyle = 'bold';
        }
      }
      if(d.section === 'body') {
        // Alternating row shading
        if(d.row.index % 2 === 0) {
          d.cell.styles.fillColor = [248, 253, 250];
        }
        // Student name — left-aligned, bold
        if(d.column.index === 1) {
          d.cell.styles.fontStyle  = 'bold';
          d.cell.styles.textColor  = [0, 0, 0];
          d.cell.styles.halign     = 'left';
          d.cell.styles.fontSize   = 7.5;
        }
        // Score cells — give them taller padding for writing
        const ci = d.column.index - 2;
        if(ci >= 0 && ci < dispCols.length) {
          d.cell.styles.minCellHeight = 9;
          if(dispCols[ci].isSub) {
            // sub-score cells — slightly tinted
            d.cell.styles.fillColor = d.row.index % 2 === 0
              ? [235, 248, 238] : [225, 242, 230];
            d.cell.styles.fontSize  = 7.5;
          } else if(dispCols[ci].isMain) {
            // ENG / KIS total cells — slightly yellow-tinted to indicate auto-calc
            d.cell.styles.fillColor = d.row.index % 2 === 0
              ? [252, 250, 228] : [247, 245, 218];
            d.cell.styles.fontStyle = 'bold';
          }
        }
        // Total col
        if(d.column.index === 2 + dispCols.length) {
          d.cell.styles.fillColor     = d.row.index % 2 === 0
            ? [228, 248, 232] : [215, 240, 222];
          d.cell.styles.fontStyle     = 'bold';
          d.cell.styles.minCellHeight = 9;
        }
        // Signature cell — wider, light grey
        if(d.column.index === 3 + dispCols.length) {
          d.cell.styles.fillColor     = [250, 250, 250];
          d.cell.styles.minCellHeight = 9;
        }
      }
    },
    didDrawCell(d) {
      // Draw a small group-bracket line above sub-cols in head to indicate
      // that GRA+COMP form ENG and LUG+INS form KIS
      if(d.section === 'head') {
        const ci = d.column.index - 2;
        if(ci >= 0 && ci < dispCols.length && dispCols[ci].isSub) {
          // top-edge tick marks to indicate grouping
          doc.setDrawColor(200, 255, 210);
          doc.setLineWidth(0.5);
          doc.line(d.cell.x, d.cell.y + 0.5, d.cell.x + d.cell.width, d.cell.y + 0.5);
        }
      }
    },
    didDrawPage() { pdfFooter(doc); }
  });

  // ── Component key legend ─────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 3;
  if(finalY < doc.internal.pageSize.getHeight() - 14) {
    // Shaded legend box
    doc.setFillColor(232, 242, 234);
    doc.roundedRect(4, finalY, W - 8, 10, 1, 1, 'F');
    doc.setDrawColor(46, 139, 87);
    doc.roundedRect(4, finalY, W - 8, 10, 1, 1, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 80, 30);
    doc.text('COMPONENT KEY:', 8, finalY + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 30, 30);
    doc.text(
      'GRA = English Grammar (max 50)   |   COMP = English Composition (max 50)   |   ENG = GRA + COMP (max 100)' +
      '     LUG = Kiswahili Lugha (max 50)   |   INS = Kiswahili Insha (max 50)   |   KIS = LUG + INS (max 100)' +
      '     All other subjects out of 100',
      8, finalY + 7.5
    );

    // Sign-off block on right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 80, 30);
    doc.text('Compiled by: _________________________', W - 80, finalY + 4);
    doc.text('Date: _______________', W - 80, finalY + 8.5);
  }

  addPageNumbers(doc);

  const safeName = examLabel.replace(/\s+/g, '_');
  doc.save(`Blank_Marksheet_${grade}_${safeName}.pdf`);
  toast(`📝 Blank marksheet exported for Grade ${grade} (${students.length} students)`);
}

/* ─── Class List PDF — column-aware, with logo, summary ─── */
function exportClassListPDF(){
  const grade=document.getElementById('classListGrade').value;
  const students=[...db.students.filter(s=>s.grade===grade)].sort((a,b)=>a.fullName.localeCompare(b.fullName));
  if(!students.length)return toast('No students in this class',true);
  const teacher=getClassTeacher(grade);
  const cols=getCheckedCols();
  const boys=students.filter(s=>s.gender==='Male').length;
  const girls=students.filter(s=>s.gender==='Female').length;

  const jsPDF=window._getJsPDF(), doc=new jsPDF({unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
  const _allCTs=getClassTeachers(grade); let y=pdfHeader(doc,`CLASS ${grade} — STUDENT LIST`,`Class Teacher${_allCTs.length>1?'s':''}: ${_allCTs.length?_allCTs.map(t=>fmtTeacher(t.name)).join(' & '):'Not Assigned'}  |  Total: ${students.length} students`);

  // Build column definitions
  const headRow = [];
  const colStyles = {};
  let colIdx = 0;
  if(cols.num)        { headRow.push('#');             colStyles[colIdx++]={cellWidth:8,halign:'center'}; }
  headRow.push('Full Name');                            colStyles[colIdx++]={cellWidth:'auto',fontStyle:'bold'};
  if(cols.admNo)      { headRow.push('Adm No');        colStyles[colIdx++]={cellWidth:18}; }
  if(cols.nemis)      { headRow.push('NEMIS No');      colStyles[colIdx++]={cellWidth:22}; }
  if(cols.assessment) { headRow.push('Assessment No'); colStyles[colIdx++]={cellWidth:22}; }
  if(cols.gender)     { headRow.push('Gender');        colStyles[colIdx++]={cellWidth:14}; }
  if(cols.parent)     { headRow.push('Parent/Guardian');colStyles[colIdx++]={cellWidth:32}; }
  if(cols.phone)      { headRow.push('Phone');         colStyles[colIdx++]={cellWidth:22}; }

  const bodyRows = students.map((s,i)=>{
    const row=[];
    if(cols.num)        row.push(i+1);
    row.push(s.fullName);
    if(cols.admNo)      row.push(s.admNo||'-');
    if(cols.nemis)      row.push(s.nemis||'-');
    if(cols.assessment) row.push(s.assessment||'-');
    if(cols.gender)     row.push(s.gender==='Male'?'Male':'Female');
    if(cols.parent)     row.push(s.parent||'-');
    if(cols.phone)      row.push(s.phone||'-');
    return row;
  });

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    head:[headRow],
    body:bodyRows,
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7.5,cellPadding:1.5},
    styles:{fontSize:7.5,cellPadding:1.5,lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:colStyles,
    didParseCell(d){
      if(d.section==='body'&&d.row.index%2===0) d.cell.styles.fillColor=[246,249,255];
    },
    didDrawPage(){pdfFooter(doc);}
  });

  // ── Summary block at bottom ────────────────────────────────
  let sy = doc.lastAutoTable.finalY + 5;
  const H = doc.internal.pageSize.getHeight();
  // Ensure enough room, else add page
  if(sy + 18 > H - 10){
    doc.addPage();
    pdfFooter(doc);
    sy = 15;
  }
  // Summary background box
  doc.setFillColor(255,220,220); doc.roundedRect(4,sy,W-8,14,2,2,'F');
  doc.setFillColor(242,199,68); doc.rect(4,sy+14,W-8,0.8,'F');

  // Icon labels
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
  doc.setTextColor(242,199,68);
  doc.text(`Total: ${students.length}`,8,sy+9);
  doc.setTextColor(0,0,0);
  const boyPct = students.length ? ((boys/students.length)*100).toFixed(1) : 0;
  const girlPct = students.length ? ((girls/students.length)*100).toFixed(1) : 0;
  doc.text(`Boys: ${boys} (${boyPct}%)`,W/2-30,sy+9);
  doc.setTextColor(255,150,180);
  doc.text(`Girls: ${girls} (${girlPct}%)`,W/2+20,sy+9);

  addPageNumbers(doc);
  doc.save(`ClassList_${grade}.pdf`);
  toast('📄 PDF Downloaded');
}

/* ─── Teachers Register PDF ─── */
function teacherLevel(t){
  const codes=[];
  (t.assignments||[]).forEach(a=>(Array.isArray(a.classes)?a.classes:[]).forEach(c=>codes.push(String(c).trim().charAt(0))));
  String(t.classTeacher||'').split(',').forEach(x=>{const c=x.trim().charAt(0); if(c) codes.push(c);});
  const lp=codes.some(c=>'123'.includes(c)), up=codes.some(c=>'456789'.includes(c));
  return lp && !up ? 'lp' : up ? 'upjs' : (lp ? 'lp' : 'none');
}
function exportTeachersListPDF(){
  if(!db.teachers||!db.teachers.length)return toast('⚠️ No teachers to export',true);
  const lvlEl=document.getElementById('texp_level');
  const lvl=(lvlEl&&lvlEl.value)||'all';
  const lvlLabel=lvl==='lp'?'Lower Primary':lvl==='upjs'?'Upper Primary & Junior School':'All Teachers';
  const list=db.teachers.filter(t=>lvl==='all'?true:teacherLevel(t)===lvl);
  if(!list.length)return toast('⚠️ No teachers in that level',true);
  try{
    const jsPDF=window._getJsPDF();
    if(!jsPDF)return toast('⚠️ PDF library not loaded',true);
    const doc=new jsPDF({unit:'mm',format:'a4'}), W=doc.internal.pageSize.getWidth();
    let y=pdfHeader(doc,'TEACHERS REGISTER',`${lvlLabel}  |  As of ${new Date().toLocaleDateString('en-KE')}  |  Total: ${list.length} teacher${list.length===1?'':'s'}`);

    doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
      startY:y, margin:{left:4,right:4},
      head:[['#','ID','Name','Phone','Subject Teaching','Class']],
      body:list.map((t,i)=>{
        let aStr='None';
        if(Array.isArray(t.assignments)&&t.assignments.length){
          aStr=t.assignments.map(a=>`${a.subject||'?'}: ${Array.isArray(a.classes)?a.classes.join(', '):(a.classes||'')}`).join('\n');
        }
        const _tctGrades=(t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
      return[i+1,t.id||'-',fmtTeacher(t.name)||'-',t.phone||'-',aStr,_tctGrades.join(', ')||'-'];
      }),
      theme:'grid',
      headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7.5,cellPadding:1.5},
      styles:{fontSize:7.5,cellPadding:1.5,overflow:'linebreak',lineColor:[0,0,0],lineWidth:0.4},
      columnStyles:{0:{cellWidth:7},1:{cellWidth:14},2:{cellWidth:36},3:{cellWidth:22},4:{cellWidth:'auto'},5:{cellWidth:12,halign:'center'}},
      didParseCell(d){if(d.section==='body'&&d.row.index%2===0)d.cell.styles.fillColor=[246,249,255];},
      didDrawPage(){pdfFooter(doc);}
    });

    addPageNumbers(doc);
    doc.save('Teachers_Register_' + (lvl==='all' ? 'All' : (lvl==='lp' ? 'Lower_Primary' : 'UP_Junior_School')) + '.pdf');
    toast('📄 Teachers PDF exported!');
  }catch(err){console.error(err);toast('⚠️ PDF error: '+err.message,true);}
}

function populatePDFDropdowns(){
  // Reset student grade + student dropdowns
  const gradeSel = document.getElementById('pdf_studentGrade');
  if(gradeSel) gradeSel.value = '';
  const stuSel = document.getElementById('pdf_student');
  stuSel.innerHTML='<option value="">-- Select Student --</option>';
  document.getElementById('pdf_examName').innerHTML='<option value="">-- Select Exam --</option>';
  populatePDFClassExams();
}

// When grade is selected in student export section — filter students by grade
function onPDFGradeChange(){
  const grade = document.getElementById('pdf_studentGrade').value;
  const sel = document.getElementById('pdf_student');
  sel.innerHTML = '<option value="">-- Select Student --</option>';
  document.getElementById('pdf_examName').innerHTML = '<option value="">-- Select Exam --</option>';
  if(!grade) return;
  const students = [...db.students.filter(s=>s.grade===grade)].sort((a,b)=>a.fullName.localeCompare(b.fullName));
  students.forEach(s=>{
    const o=document.createElement('option');
    o.value=s.admNo;
    o.textContent=`${s.fullName}  (${s.admNo})`;
    sel.appendChild(o);
  });
}

// Populate exam names available for a specific student
function populatePDFStudentExams(){
  const admNo=document.getElementById('pdf_student').value;
  const sel=document.getElementById('pdf_examName');
  sel.innerHTML='<option value="">-- Select Exam --</option>';
  if(!admNo) return;
  const names=[...new Set(db.exams.filter(e=>e.admNo===admNo).map(e=>e.examName||'Untitled Exam'))].sort();
  names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}

// Populate exam names available for a specific grade
function populatePDFClassExams(){
  const grade=document.getElementById('pdf_classGrade').value;
  const sel=document.getElementById('pdf_classExamName');
  sel.innerHTML='<option value="">-- Select Exam --</option>';
  if(!grade) return;
  const names=[...new Set(db.exams.filter(e=>e.grade===grade).map(e=>e.examName||'Untitled Exam'))].sort();
  names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
}

/* ═══════════════════════════════════════════════════════════
   EDIT SCORES ENGINE
   ═══════════════════════════════════════════════════════════ */
let _editingExamIndex = null; // index into db.exams array

// Track open accordion groups
let _esOpenGroups = new Set();

function renderEditScoresTable(){
  // Refresh exam name filter dropdown
  const examFilterSel=document.getElementById('es_examFilter');
  if(examFilterSel){
    const names=[...new Set(db.exams.map(e=>e.examName||'Untitled Exam'))].sort();
    const cur=examFilterSel.value;
    examFilterSel.innerHTML='<option value="">All Exams</option>';
    names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;if(n===cur)o.selected=true;examFilterSel.appendChild(o);});
  }

  const examF=examFilterSel?examFilterSel.value:'';
  const gradeF=document.getElementById('es_gradeFilter').value;
  const search=document.getElementById('es_search').value.toLowerCase();

  const filtered=db.exams.filter(e=>
    (!examF||(e.examName||'Untitled Exam')===examF)&&
    (!gradeF||e.grade===gradeF)&&
    (!search||e.name.toLowerCase().includes(search)||e.admNo.toLowerCase().includes(search))
  );

  const container=document.getElementById('es_groupedCards');
  if(!filtered.length){
    container.innerHTML=`<div class="card"><div class="card-body"><div class="empty-state"><div class="empty-icon">✏️</div><p>No submitted exam records found.</p></div></div></div>`;
    return;
  }

  // Group by examName → grade
  const examGroups={};
  filtered.forEach(e=>{
    const en=e.examName||'Untitled Exam';
    if(!examGroups[en]) examGroups[en]={};
    if(!examGroups[en][e.grade]) examGroups[en][e.grade]=[];
    examGroups[en][e.grade].push(e);
  });

  // If searching, auto-open all groups
  if(search){Object.keys(examGroups).forEach(n=>{ const sid=btoa(unescape(encodeURIComponent(n))).replace(/[^a-zA-Z0-9]/g,''); _esOpenGroups.add(sid); });}

  let html='';
  Object.keys(examGroups).sort().forEach(examName=>{
    const gradeMap=examGroups[examName];
    const totalStudents=Object.values(gradeMap).reduce((s,arr)=>s+arr.length,0);
    const gradeCount=Object.keys(gradeMap).length;
    // Use safeId as toggle key — avoids quote-escaping issues in onclick HTML attribute
    const safeId=btoa(unescape(encodeURIComponent(examName))).replace(/[^a-zA-Z0-9]/g,'');
    const isOpen=_esOpenGroups.has(safeId);

    html+=`<div class="card" style="margin-bottom:16px">
      <div class="card-header" style="cursor:pointer;user-select:none;transition:background .2s"
           onmouseenter="this.style.background='rgba(30,86,200,0.08)'"
           onmouseleave="this.style.background=''"
           onclick="toggleExamGroup('${safeId}')">
        <div style="display:flex;align-items:center;gap:14px;flex:1;flex-wrap:wrap">
          <span style="font-size:22px">📋</span>
          <div>
            <div style="font-weight:800;font-size:16px;color:var(--gold)">${examName} <span style="font-size:10px;font-weight:700;color:var(--text-muted);background:var(--surface-3);padding:2px 8px;border-radius:10px;font-family:'JetBrains Mono','Courier New',Courier,monospace;vertical-align:middle">${(Object.values(gradeMap)[0][0].examCode)||examCode(examName,Object.values(gradeMap)[0][0].term,Object.values(gradeMap)[0][0].year)}</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${gradeCount} grade${gradeCount!==1?'s':''} &bull; ${totalStudents} student record${totalStudents!==1?'s':''} &bull; <span style="color:var(--sky)">Click to ${isOpen?'collapse':'expand'}</span></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          ${Object.keys(gradeMap).sort().map(g=>`<span class="badge badge-blue">${g}</span>`).join('')}
          <button class="btn btn-danger btn-sm" style="font-size:11px;padding:4px 10px" onclick="event.stopPropagation();deleteWholeExam('${safeId}','${examName.replace(/'/g,"\\'")}')">🗑 Delete Exam</button>
          <span style="font-size:20px;color:var(--sky)">${isOpen?'▲':'▼'}</span>
        </div>
      </div>
      <div id="esBody_${safeId}" style="display:${isOpen?'block':'none'};border-top:1px solid var(--border)">`;

    Object.keys(gradeMap).sort().forEach(grade=>{
      const records=[...gradeMap[grade]].sort((a,b)=>(a.rank||99)-(b.rank||99));
      const subjects=getSubjects(grade);
      const _gTerm = (records[0] && records[0].term) || '', _gYear = (records[0] && records[0].year) || '';
      const _gAdmin = (typeof getCurrentRole === 'function' && getCurrentRole() === 'admin');
      const _gCsBtn = function(s){
        if(!_gAdmin) return '';
        return '<br><button class="btn btn-ghost btn-sm" style="font-size:9px;padding:1px 6px;color:var(--rose)" ' +
          'title="Clear submitted ' + s + ' scores for this exam + grade (admin)" ' +
          'onclick="event.stopPropagation();openClearSubjectCol(this)" ' +
          'data-exam="' + _csAttr(examName) + '" data-grade="' + _csAttr(grade) + '" ' +
          'data-term="' + _csAttr(_gTerm) + '" data-year="' + _csAttr(_gYear) + '" data-sub="' + _csAttr(s) + '">🧹 clear</button>';
      };

      html+=`<div>
        <div style="padding:10px 20px;background:rgba(30,86,200,0.1);display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);flex-wrap:wrap">
          <span class="badge badge-blue" style="font-size:13px;padding:4px 14px">Grade ${grade}</span>
          <span style="font-size:12px;color:var(--text-muted)">${records.length} student${records.length!==1?'s':''}</span>
          <button class="btn btn-danger btn-sm" style="font-size:11px;padding:3px 8px;margin-left:auto" onclick="deleteGradeExamRecords('${safeId}','${grade}','${examName.replace(/'/g,"\\'")}')">🗑 Delete Grade Records</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr>
            <th>Rank</th><th>Adm No</th><th>Student Name</th>
            ${subjects.map(s=>`<th style="min-width:50px">${s}${_gCsBtn(s)}</th><th style="min-width:42px;font-size:10px">Rb</th>`).join('')}
            <th>Total</th><th></th>
          </tr></thead>
          <tbody>`;

      records.forEach(rec=>{
        const realIdx=db.exams.indexOf(rec);
        const isSelected=_editingExamIndex===realIdx;
        const rowBg=isSelected?'background:rgba(45,106,255,0.2);':'';
        const rowOutline=isSelected?'outline:2px solid var(--royal-bright);':'';
        const rankColor=rec.rank===1?'var(--gold)':rec.rank===2?'#ccc':rec.rank===3?'#cd7f32':'inherit';
        const subjCols=subjects.map(s=>{
          const sc=rec.scores[s]!==undefined?rec.scores[s]:'—';
          const rb=(typeof _rubricTag==='function') ? _rubricTag(rec, s) :
            (rec.rubrics&&rec.rubrics[s]?`<span class="rubric-tag ${rec.rubrics[s].class}">${rec.rubrics[s].code}</span>`:'—');
          return `<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:600;font-size:12px">${sc}</td><td style="text-align:center">${rb}</td>`;
        }).join('');
        html+=`<tr style="${rowBg}${rowOutline}cursor:pointer" onclick="openEditPanel(${realIdx})" title="Click to edit scores">
          <td style="font-weight:800;color:${rankColor}">${rec.rank||'—'}</td>
          <td><span class="adm-badge">${rec.admNo}</span></td>
          <td style="font-weight:600;min-width:130px">${rec.name}</td>
          ${subjCols}
          <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:800;color:var(--gold)">${rec.total}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();openEditPanel(${realIdx})" title="Edit">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();confirmDeleteRecord(${realIdx})" title="Delete">🗑</button>
          </div></td>
        </tr>`;
      });
      html+=`</tbody></table></div></div>`;
    });
    html+=`</div></div>`;
  });

  container.innerHTML=html;
}

function toggleExamGroup(safeId){
  if(_esOpenGroups.has(safeId)) _esOpenGroups.delete(safeId);
  else _esOpenGroups.add(safeId);
  renderEditScoresTable();
  const panel=document.getElementById('es_editPanel');
  if(panel&&panel.style.display!=='none') setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
}

function esExamNameChanged(){
  const inp = document.getElementById('es_editExamName');
  const warn = document.getElementById('es_renameWarning');
  if(!inp || !warn) return;
  const e = (_editingExamIndex !== null) ? db.exams[_editingExamIndex] : null;
  const originalName = e ? (e.examName || 'Untitled Exam') : '';
  const changed = inp.value.trim() !== originalName && inp.value.trim() !== '';
  warn.style.display = changed ? '' : 'none';
}

function openEditPanel(realIdx){
  _editingExamIndex=realIdx;
  const e=db.exams[realIdx];
  if(!e)return;

  const panel=document.getElementById('es_editPanel');
  panel.style.display='';

  document.getElementById('es_editTitle').textContent=`✏️ Editing: ${e.name}`;
  document.getElementById('es_editGradeBadge').textContent=`Grade ${e.grade}`;
  document.getElementById('es_editExamBadge').textContent=e.examName||'Untitled Exam';
  const nameInp=document.getElementById('es_editExamName');
  nameInp.value=e.examName||'';
  // Lock the exam name field for non-admin users — only admins may rename
  const isTeacher=(getCurrentRole()!=='admin');
  nameInp.readOnly=isTeacher;
  nameInp.style.opacity=isTeacher?'0.45':'';
  nameInp.style.cursor=isTeacher?'not-allowed':'';
  nameInp.title=isTeacher?'Exam renaming is restricted to admin only':'';
  // Hide the rename warning on open
  const warn=document.getElementById('es_renameWarning');
  if(warn) warn.style.display='none';

  const subjects=getSubjects(e.grade);
  document.getElementById('es_scoreInputs').innerHTML=subjects.map(subj=>{
    const val=e.scores[subj]!==undefined?e.scores[subj]:'';
    return `<div class="form-group"><label style="color:var(--sky)">${subj}</label><input type="number" id="es_sc_${subj}" min="0" max="100" value="${val}" placeholder="0-100" oninput="esLiveCalc('${e.grade}')"></div>`;
  }).join('');

  esLiveCalc(e.grade);

  // Scroll edit panel into view
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});

  // Highlight selected row
  renderEditScoresTable();
}

function esLiveCalc(grade){
  const subjects=getSubjects(grade);let total=0,count=0;
  subjects.forEach(s=>{const el=document.getElementById('es_sc_'+s);if(el&&el.value!==''&&!isNaN(el.value)){total+=parseFloat(el.value);count++;}});
  document.getElementById('es_liveTotal').textContent=count>0?total:'—';
  document.getElementById('es_liveAvg').textContent=count>0?(total/count).toFixed(1):'—';
  document.getElementById('es_liveCount').textContent=count;
}

function saveEditedScores(){
  if(getCurrentRole()!=='admin') return toast('⛔ Teacher mode: editing saved records is restricted.',true);
  if(_editingExamIndex===null)return toast('No record selected',true);
  const e=db.exams[_editingExamIndex];
  if(!e)return;
  const newExamName=document.getElementById('es_editExamName').value.trim()||'Untitled Exam';
  const oldExamName=e.examName||'Untitled Exam';
  const subjects=getSubjects(e.grade);
  const scores={},rubrics={};let total=0,hasScores=false;
  subjects.forEach(s=>{
    const el=document.getElementById('es_sc_'+s);
    if(el&&el.value!==''){const v=parseFloat(el.value);scores[s]=v;rubrics[s]=getRubric(v,e.grade,newExamName);total+=v;hasScores=true;}
  });
  if(!hasScores)return toast('⚠️ Enter at least one score',true);

  // If the exam name changed, rename ALL records sharing the old name (across all grades)
  // so the rename is atomic — no partial renames or duplicates.
  if(newExamName!==oldExamName){
    // Find every record carrying the old exam name (any grade, any term/year)
    const siblings=db.exams.filter(r=>(r.examName||'Untitled Exam')===oldExamName);
    if(!confirm(`Rename "${oldExamName}" → "${newExamName}" across all ${siblings.length} record(s)?\n\nThe old name will be fully replaced — no duplicate will be created.`)) return;
    // Delete old server rows first (keyed on admNo+examName+term+year)
    _deleteExamRecordsRemote(siblings);
    // Rename every sibling in memory — saveDB() below will push the new keys
    siblings.forEach(r=>{
      r.examName=newExamName;
      r.examCode=examCode(newExamName,r.term,r.year);
    });
    // Raw rows follow the rename too (same match rule)
    (db.rawScores||[]).forEach(r=>{
      if((r.examName||'Untitled Exam')===oldExamName){
        r.examName=newExamName;
        r.examCode=examCode(newExamName,r.term,r.year);
      }
    });
    // Hide rename warning
    const warn=document.getElementById('es_renameWarning');
    if(warn) warn.style.display='none';
  }

  // Apply score edits to this specific record.
  // Subject removals (previously saved, input now cleared) are tombstoned
  // server-side so stale devices can't resurrect them; explicit re-adds
  // ride along as _forceSubjects so only real intent clears a tombstone.
  const prevScores = e.scores||{};
  const removed = Object.keys(prevScores).filter(s =>
    scores[s]===undefined &&
    document.getElementById('es_sc_'+s) && document.getElementById('es_sc_'+s).value==='');
  const forced = Object.keys(scores).filter(s => prevScores[s]===undefined);
  e.scores=scores;
  e.rubrics=rubrics;
  e.total=total;
  e.examName=newExamName;
  e.examCode=examCode(newExamName,e.term,e.year);

  // Keep the raw row in step: dirty inputs are freshly typed raw marks.
  // (Retyping the identical stored number counts as untouched.)
  const _esRaw = {};
  subjects.forEach(function(s){
    const el = document.getElementById('es_sc_'+s);
    if(el && typeof _inputDirty==='function' && _inputDirty(el) && el.value!=='' && !isNaN(el.value) &&
       (prevScores[s]===undefined || prevScores[s]!==parseFloat(el.value)))
      _esRaw[s] = parseFloat(el.value);
  });
  if(Object.keys(_esRaw).length && typeof mergeRawRow==='function')
    mergeRawRow(e.admNo, newExamName, e.term, e.year, {fullName:e.name}, e.grade,
      examCode(newExamName,e.term,e.year), _esRaw, {});

  if(removed.length) _removeExamSubjectsRemote(e.admNo, newExamName, e.term, e.year, removed);
  if(forced.length){
    const fm = {};
    fm[_ssExamKey(e.admNo, newExamName, e.term, e.year)] = forced;
    _stageForceSubjects(fm);
  }
  recalcRanks();
  saveDB();
  const renamed=newExamName!==oldExamName;
  toast(renamed
    ? `✅ Renamed to "${newExamName}" across all records & scores updated!`
    : `✅ Updated! Total: ${total}`);
  document.getElementById('es_editExamBadge').textContent=newExamName;
  renderEditScoresTable();
}

function clearEditForm(){
  _editingExamIndex=null;
  document.getElementById('es_editTitle').textContent='✏️ Editing: —';
  document.getElementById('es_editGradeBadge').textContent='';
  document.getElementById('es_editExamBadge').textContent='';
  document.getElementById('es_editExamName').value='';
  document.getElementById('es_scoreInputs').innerHTML='';
  document.getElementById('es_liveTotal').textContent='—';
  document.getElementById('es_liveAvg').textContent='—';
  document.getElementById('es_liveCount').textContent='0';
}

function deleteEditRecord(){
  if(_editingExamIndex===null)return;
  confirmDeleteRecord(_editingExamIndex);
}


// The bulk /api/db/save sync endpoint only ever upserts records (by design,
// so a stale or partial push can never wipe data) — it never deletes. So any
// exam record removed only from the in-memory db.exams array would survive
// on the server and get pulled right back on the next sync. This helper
// calls the dedicated per-record delete endpoint so deletions actually stick.
function _deleteExamRecordsRemote(records){
  (records||[]).forEach(r=>{
    fetch('/api/exams?admNo='+encodeURIComponent(r.admNo||'')+
          '&examName='+encodeURIComponent(r.examName||'')+
          '&term='+encodeURIComponent(r.term||'')+
          '&year='+encodeURIComponent(r.year||''),
      {method:'DELETE'}).catch(()=>{});
  });
}

function _deleteExamRecordsRemote(records){
  (records||[]).forEach(r=>{
    fetch('/api/exams?admNo='+encodeURIComponent(r.admNo||'')+
          '&examName='+encodeURIComponent(r.examName||'')+
          '&term='+encodeURIComponent(r.term||'')+
          '&year='+encodeURIComponent(r.year||''),
      {method:'DELETE'}).catch(()=>{});
  });
}

/* ── Edited-exams bin (archive / restore / permanent delete) ──────────
   Archive is server-side and atomic: rows move with tombstones in one call,
   so concurrent teacher pushes can never resurrect or duplicate them. */
function _adminErr(d, r){
  // 403 almost always means a stale login (server restarted after login):
  // the fix is log out → log back in, not retrying.
  if(r && r.status === 403) return 'Admin session expired (server restarted?) — please log out and log back in, then retry.';
  return null;
}
function openArchiveBin(){
  const m = document.getElementById('archiveBinOverlay');
  if(!m) return;
  m.style.display = 'flex';
  renderArchiveBin();
}
function closeArchiveBin(){
  const m = document.getElementById('archiveBinOverlay');
  if(m) m.style.display = 'none';
}
function renderArchiveBin(){
  const box = document.getElementById('archiveBinModalBody');
  if(!box) return;
  // Only fetch while the bin is open (background renders skip it).
  const overlay = document.getElementById('archiveBinOverlay');
  if(!overlay || overlay.style.display === 'none'){
    box.innerHTML = '';
    return;
  }
  // Fetch the bin straight from the server (source of truth) so it appears
  // immediately after an archive/rename — no waiting for background sync.
  // Falls back to the last synced snapshot (teachers see an empty bin).
  const paint = (list) => {
    const groups = {};
    (list || []).forEach(e => {
      const en = e.examName || 'Untitled Exam';
      if(!groups[en]) groups[en] = [];
      groups[en].push(e);
    });
    const names = Object.keys(groups).sort();
  if(!names.length){
    box.innerHTML = '<div class="empty-state" style="padding:18px"><div class="empty-icon">🗃</div><p>No archived exams. Renamed-away originals land here automatically.</p></div>';
    return;
  }
  box.innerHTML = names.map(en => {
    const recs = groups[en];
    const learners = new Set(recs.map(e => e.admNo)).size;
    const grades = [...new Set(recs.map(e => e.grade))].sort().join(', ');
    const terms = [...new Set(recs.map(e => e.term + ' ' + e.year))].join(', ');
    const safe = en.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const disp = en.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 4px;border-bottom:1px solid var(--border)">' +
      '<div style="flex:1;min-width:180px"><div style="font-weight:800;color:var(--gold)">' + disp + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted)">' + learners + ' learner(s) · ' + grades + ' · ' + terms + '</div></div>' +
      '<button class="btn btn-sm btn-primary" onclick="restoreArchivedExam(this)" data-exam="' + safe + '">↩ Restore</button>' +
      '<button class="btn btn-sm btn-ghost" style="color:var(--rose)" onclick="deleteArchivedExam(this)" data-exam="' + safe + '">🗑 Delete</button>' +
      '</div>';
  }).join('');
  };
  if(getCurrentRole && getCurrentRole() === 'admin'){
    fetch('/api/archive').then(r => r.json()).then(d => {
      if(d && d.ok){
        const list = (d.archivedExams || []).concat(d.archivedRaw || []);
        try{ db.archivedExams = d.archivedExams || []; db.archivedRaw = d.archivedRaw || []; }catch(e){}
        paint(list);
      }else{
        paint((db.archivedExams || []).concat(db.archivedRaw || []));
      }
    }).catch(() => paint((db.archivedExams || []).concat(db.archivedRaw || [])));
  }else{
    paint([]);
  }
}
async function archiveExamByName(el){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const en = el.getAttribute('data-exam');
  const n = db.exams.filter(e => (e.examName || 'Untitled Exam') === en).length;
  if(!n) return toast('No live records for that exam.', true);
  if(!confirm('Move "' + en + '" (' + n + ' record(s)) to the Edited Exams Bin?\n\nIt disappears from records & dropdowns. Nothing is deleted — restore anytime.')) return;
  try{
    const r = await fetch('/api/archive/exam', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({examName: en})});
    const d = await r.json();
    if(!d.ok) return toast(_adminErr(d, r) || ('Archive failed: ' + (d.error || '')), true);
  }catch(e){ return toast('Archive failed — server unreachable.', true); }
  db.exams = db.exams.filter(e => (e.examName || 'Untitled Exam') !== en);
  db.rawScores = (db.rawScores || []).filter(e => (e.examName || 'Untitled Exam') !== en);
  saveDB(); updateCounts();
  renderExamsTable();
  toast('🗃 Archived "' + en + '" — originals safe in the bin.');
}
async function restoreArchivedExam(el){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const en = el.getAttribute('data-exam');
  if(!confirm('Restore "' + en + '" back to live records under its original name?')) return;
  try{
    const r = await fetch('/api/archive/restore', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({examName: en})});
    const d = await r.json();
    if(!d.ok) return toast(_adminErr(d, r) || ('Restore failed: ' + (d.error || '')), true);
    toast('↩ Restored ' + (d.restored || 0) + ' record(s) — syncing…');
    if(typeof fullSync === 'function'){ try{ await fullSync(); }catch(e){} }
    renderExamsTable();
  }catch(e){ toast('Restore failed — server unreachable.', true); }
}
async function deleteArchivedExam(el){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const en = el.getAttribute('data-exam');
  if(!confirm('Permanently delete "' + en + '" from the bin?\n\nThis cannot be undone. (Live tombstones stay, so stale devices cannot resurrect it.)')) return;
  try{
    const r = await fetch('/api/archive?examName=' + encodeURIComponent(en), {method:'DELETE'});
    const d = await r.json();
    if(!d.ok) return toast(_adminErr(d, r) || ('Delete failed: ' + (d.error || '')), true);
  }catch(e){ return toast('Delete failed — server unreachable.', true); }
  renderArchiveBin();
  toast('🗑 Removed from bin.');
}

/* ── Clear one subject column (exam + grade) ──────────────────────────────
   Admin fix for a wrongly-captured column: strips the subject (and its
   sub-components, e.g. ENG PP1/PP2) from every matching record — exams and
   raw — server-side with per-row tombstones, so stale devices can't
   resurrect the old values and all other subjects are untouched. The
   emptied column accepts fresh capture immediately: saves stage
   _forceSubjects, which clears exactly those tombs. */
var _csCtx = null;
var _CS_SUB_COMPONENTS = {ENG:['ENG PP1','ENG PP2','GRA','COMP'], KIS:['KIS PP1','KIS PP2','LUG','INS'], SCIE:['SCIE PP1','SCIE PP2']};
function _csMatch(rec, ctx){
  return (rec.examName||'')===ctx.examName && String(rec.term||'')===String(ctx.term) &&
    String(rec.year||'')===String(ctx.year) && (!ctx.grade || (rec.grade||'')===ctx.grade);
}
function _csAttr(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
// Mirror of server strip_tombstoned_subjects + total recompute. Returns true
// when the record actually carried the subject.
function _stripSubjectLocal(rec, subj){
  if(!rec || !rec.scores || rec.scores[subj]===undefined) return false;
  delete rec.scores[subj];
  if(rec.rubrics) delete rec.rubrics[subj];
  const comps = _CS_SUB_COMPONENTS[subj] || [];
  if(rec.subScores) comps.forEach(c => { delete rec.subScores[c]; });
  let t = 0;
  Object.keys(rec.scores).forEach(s => { if(typeof rec.scores[s]==='number') t += rec.scores[s]; });
  rec.total = t;
  return true;
}
function openClearSubjectCol(el){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const d = (el && el.dataset) || {};
  _csCtx = {examName:d.exam||'', term:d.term||'', year:d.year||'', grade:d.grade||'', subject:d.sub||''};
  const ctx = _csCtx;
  if(!ctx.subject || !ctx.examName) return toast('Nothing to clear.', true);
  const n = (db.exams||[]).filter(e => _csMatch(e,ctx) && e.scores && e.scores[ctx.subject]!==undefined).length;
  ctx.count = n;
  if(!n) return toast('No submitted ' + ctx.subject + ' scores here to clear.', true);
  const scope = ctx.grade ? (ctx.examName + ' · Grade ' + ctx.grade) : ctx.examName;
  document.getElementById('cs_info').innerHTML =
    '<div style="font-size:14px;font-weight:800;color:var(--gold);margin-bottom:6px">' + scope + '</div>' +
    '<div style="font-size:12px;color:var(--text-primary);margin-bottom:6px">Clear <strong>' + ctx.subject + '</strong> for <strong>' + n + '</strong> learner record(s)?</div>' +
    '<div style="font-size:11px;color:var(--text-muted)">Removed entirely (scores + raw marks) — all other subjects untouched. The emptied column can be recaptured immediately. Stale devices cannot bring the old values back.</div>';
  document.getElementById('cs_subjName').textContent = ctx.subject;
  const inp = document.getElementById('cs_confirm');
  inp.value = '';
  document.getElementById('cs_clearBtn').style.display = 'none';
  document.getElementById('clearSubjOverlay').style.display = 'flex';
  setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 60);
}
function csConfirmChanged(){
  const btn = document.getElementById('cs_clearBtn');
  if(!btn || !_csCtx) return;
  const v = document.getElementById('cs_confirm').value.trim();
  btn.style.display = (v === _csCtx.subject) ? '' : 'none';
}
function closeClearSubjectCol(){
  const m = document.getElementById('clearSubjOverlay');
  if(m) m.style.display = 'none';
}
async function executeClearSubjectCol(){
  const ctx = _csCtx;
  if(!ctx) return;
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const q = '/api/exams/subject-column?examName=' + encodeURIComponent(ctx.examName) +
    '&term=' + encodeURIComponent(ctx.term) + '&year=' + encodeURIComponent(ctx.year) +
    '&grade=' + encodeURIComponent(ctx.grade) + '&subject=' + encodeURIComponent(ctx.subject);
  let d = null, r = null;
  try{
    r = await fetch(q, {method:'DELETE'});
    d = await r.json();
    if(!d.ok) return toast(_adminErr(d, r) || ('Clear failed: ' + (d.error || '')), true);
  }catch(e){ return toast('Clear failed — server unreachable.', true); }
  // Mirror locally (drop rows left completely empty, like the server).
  ['exams','rawScores'].forEach(k => {
    db[k] = (db[k]||[]).filter(rec => {
      if(!_csMatch(rec, ctx)) return true;
      _stripSubjectLocal(rec, ctx.subject);
      if(!(rec.scores && Object.keys(rec.scores).length) && !(rec.subScores && Object.keys(rec.subScores).length)) return false;
      return true;
    });
  });
  closeClearSubjectCol();
  _csCtx = null;
  if(typeof recalcRanks === 'function') recalcRanks();
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  if(typeof renderExamsTable === 'function'){ try{ renderExamsTable(); }catch(e){} }
  if(typeof renderEditScoresTable === 'function'){ try{ renderEditScoresTable(); }catch(e){} }
  const dm = document.getElementById('examDrillModal');
  if(dm && dm.style.display !== 'none' && typeof openExamDrill === 'function'){
    try{ openExamDrill(ctx.examName, ctx.grade); }catch(e){}
  }
  if(typeof renderScoreEntry === 'function'){
    const p = document.getElementById('page-scoreEntry');
    if(p && (p.classList.contains('active') || p.style.display !== 'none')){ try{ renderScoreEntry(); }catch(e){} }
  }
  toast('🧹 Cleared ' + ctx.subject + ' (' + (d.cleared || 0) + ' record(s)) — column ready for recapture.');
}

/* ── Rename exam without losing scores (shared by Exams & Score Entry) ──
   Tombstones the old keys FIRST (concurrent stale pushes can't resurrect
   them), renames locally, merges into same student+term+year records when
   the new name already exists (target keeps its values on conflict — no
   double entry), clears tombstones on the new keys, then pushes. */
function _rxExamKey(admNo, examName, term, year){
  if(typeof _ssExamKey === 'function') return _ssExamKey(admNo, examName, term, year);
  return (admNo||'') + '__' + (examName||'') + '__' + (term||'') + '__' + (year||'');
}
function openRenameExamModal(){
  const sel = document.getElementById('rx_old');
  const counts = {};
  (db.exams || []).forEach(e => {
    const n = e.examName || 'Untitled Exam';
    counts[n] = (counts[n] || 0) + 1;
  });
  sel.innerHTML = '<option value="">-- Select submitted exam --</option>' +
    Object.keys(counts).sort().map(n =>
      '<option value="' + n.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '">' +
      n.replace(/&/g,'&amp;').replace(/</g,'&lt;') + ' (' + counts[n] + ')</option>').join('');
  sel.value = '';
  document.getElementById('rx_new').value = '';
  document.getElementById('rx_info').textContent = '';
  document.getElementById('rx_saveBtn').style.display = 'none';
  document.getElementById('renameExamOverlay').style.display = 'flex';
}
function closeRenameExamModal(){
  document.getElementById('renameExamOverlay').style.display = 'none';
}

/* ── Score rubrics viewer/editor (per level + per exam) ───────────────────
   Bands are minimum marks: {e1,e2,m1,m2,a1,a2,b1} (below b1 = B.E2).
   Scope: an exam override for the level, else the level default, else the
   built-in scale. Saved into db.rubrics (synced); applies to new
   computations going forward — stored historical tags are untouched. */
const RUBRIC_ROWS = [
  { key: 'e1', label: 'E.E1 · Exceeding (8 pts)' },
  { key: 'e2', label: 'E.E2 · Exceeding (7 pts)' },
  { key: 'm1', label: 'M.E1 · Meeting (6 pts)' },
  { key: 'm2', label: 'M.E2 · Meeting (5 pts)' },
  { key: 'a1', label: 'A.E1 · Approaching (4 pts)' },
  { key: 'a2', label: 'A.E2 · Approaching (3 pts)' },
  { key: 'b1', label: 'B.E1 · Below (2 pts)' }
];
function rubLevelName(lv){
  return lv === 'lp' ? 'Lower Primary (Grades 1–3)'
    : lv === 'js' ? 'Junior School (Grades 7–9)' : 'Upper Primary (Grades 4–6)';
}
function rubScopeBands(){
  const lv = (document.getElementById('rx_level') || {}).value || 'up';
  const ex = (document.getElementById('rx_exam') || {}).value || '';
  const R = (db && db.rubrics) || {};
  const ov = ex && R.exams && R.exams[ex] && R.exams[ex][lv];
  if(ov) return { bands: Object.assign({}, RUBRIC_LEGACY, ov), source: 'exam override for "' + ex + '"' };
  const df = R.levels && R.levels[lv];
  if(df) return { bands: Object.assign({}, RUBRIC_LEGACY, df), source: 'level default' };
  return { bands: Object.assign({}, RUBRIC_LEGACY), source: 'built-in scale (not customized yet)' };
}
function openRubricsModal(){
  const names = [...new Set((db.exams || []).map(e => e.examName || 'Untitled Exam'))].sort();
  const sel = document.getElementById('rx_exam');
  sel.innerHTML = '<option value="">All exams (level default)</option>' +
    names.map(n => '<option value="' + n.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '">' +
      n.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</option>').join('');
  sel.value = '';
  document.getElementById('rubricOverlay').style.display = 'flex';
  rubFormChanged();
}
function closeRubricsModal(){
  document.getElementById('rubricOverlay').style.display = 'none';
}
function rubFormChanged(){
  const { bands, source } = rubScopeBands();
  const lv = (document.getElementById('rx_level') || {}).value || 'up';
  const ex = (document.getElementById('rx_exam') || {}).value || '';
  document.getElementById('rx_scopeNote').innerHTML =
    'Showing: <strong>' + rubLevelName(lv) + '</strong>' +
    (ex ? ' · <strong>' + ex.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</strong>' : ' · all exams') +
    ' — currently using <strong>' + source + '</strong>.';
  document.getElementById('rubricRows').innerHTML = RUBRIC_ROWS.map(r =>
    `<div style="display:flex;align-items:center;gap:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px">
      <div style="flex:1;font-size:12px;font-weight:700">${r.label}</div>
      <div style="font-size:11px;color:var(--text-muted)">min mark</div>
      <input type="number" min="0" max="100" id="rub_inp_${r.key}" value="${bands[r.key]}" style="width:90px">
    </div>`).join('') +
    `<div style="font-size:11px;color:var(--text-muted)">Below B.E1 minimum → <strong>B.E2 · Below (1 pt)</strong>. Each band must be ≤ the one above it.</div>`;
}
function rubReadForm(){
  const vals = {};
  for(const r of RUBRIC_ROWS){
    const v = parseFloat((document.getElementById('rub_inp_' + r.key) || {}).value);
    if(isNaN(v) || v < 0 || v > 100) return { error: r.label + ' needs a number 0–100.' };
    vals[r.key] = Math.round(v);
  }
  // Enforce descending (clamp each band to at most the previous one)
  const order = ['e1','e2','m1','m2','a1','a2','b1'];
  let fixed = false;
  for(let i = 1; i < order.length; i++){
    if(vals[order[i]] > vals[order[i-1]]){ vals[order[i]] = vals[order[i-1]]; fixed = true; }
  }
  return { vals, fixed };
}
function saveRubrics(){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const lv = (document.getElementById('rx_level') || {}).value || 'up';
  const ex = (document.getElementById('rx_exam') || {}).value || '';
  const read = rubReadForm();
  if(read.error) return toast(read.error, true);
  if(!db.rubrics || typeof db.rubrics !== 'object') db.rubrics = {};
  if(!db.rubrics.levels || typeof db.rubrics.levels !== 'object') db.rubrics.levels = {};
  if(!db.rubrics.exams || typeof db.rubrics.exams !== 'object') db.rubrics.exams = {};
  if(ex){
    if(!db.rubrics.exams[ex] || typeof db.rubrics.exams[ex] !== 'object') db.rubrics.exams[ex] = {};
    db.rubrics.exams[ex][lv] = read.vals;
  } else {
    db.rubrics.levels[lv] = read.vals;
  }
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  rubFormChanged();
  toast('✅ Rubrics saved for ' + rubLevelName(lv) + (ex ? ' · ' + ex : ' (all exams)') +
    (read.fixed ? ' (adjusted to stay descending)' : ''));
}
function resetRubrics(){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const lv = (document.getElementById('rx_level') || {}).value || 'up';
  const ex = (document.getElementById('rx_exam') || {}).value || '';
  if(!db.rubrics) db.rubrics = {};
  if(ex){
    if(db.rubrics.exams && db.rubrics.exams[ex]){
      delete db.rubrics.exams[ex][lv];
      if(!Object.keys(db.rubrics.exams[ex]).length) delete db.rubrics.exams[ex];
    }
    toast('🗑 Exam override removed — level default applies.');
  } else {
    if(db.rubrics.levels) delete db.rubrics.levels[lv];
    toast('🗑 Level reset to the built-in scale.');
  }
  if(typeof saveDB === 'function') saveDB();
  rubFormChanged();
}
function rxOldChanged(){
  const oldName = document.getElementById('rx_old').value;
  const recs = (db.exams || []).filter(e => (e.examName || 'Untitled Exam') === oldName);
  const grades = [...new Set(recs.map(e => e.grade))].sort().join(', ');
  document.getElementById('rx_info').innerHTML = oldName
    ? '<strong>' + recs.length + '</strong> record(s) · grades: ' + (grades || '—') : '';
  rxNewChanged();
}
function rxNewChanged(){
  const oldName = document.getElementById('rx_old').value;
  const newName = (document.getElementById('rx_new').value || '').trim();
  document.getElementById('rx_saveBtn').style.display = (oldName && newName) ? '' : 'none';
  if(oldName && newName && newName !== oldName){
    const targetN = (db.exams || []).filter(e => (e.examName || 'Untitled Exam') === newName).length;
    if(targetN) document.getElementById('rx_info').innerHTML +=
      '<br>⚠️ <strong>' + targetN + '</strong> record(s) already use "' +
      newName.replace(/&/g,'&amp;').replace(/</g,'&lt;') +
      '" — matching students will merge (no duplicates).';
  }
}
function executeExamRename(){
  if(getCurrentRole() !== 'admin') return toast('⛔ Admin only.', true);
  const oldName = document.getElementById('rx_old').value;
  const newName = (document.getElementById('rx_new').value || '').trim();
  if(!oldName || !newName) return;
  if(oldName === newName) return toast('Names are identical.', true);
  const matches = (db.exams || []).filter(e => (e.examName || 'Untitled Exam') === oldName);
  if(!matches.length) return toast('No records found for that exam.', true);
  const targetN = (db.exams || []).filter(e => (e.examName || 'Untitled Exam') === newName).length;
  if(!confirm('Rename "' + oldName + '" → "' + newName + '"?\n\n' + matches.length +
      ' record(s) will move (originals kept in the Edited Exams Bin).' + (targetN ? '\n"' + newName + '" already has ' + targetN +
      ' record(s) — matching students merge with no duplicates.' : ''))) return;

  // 1) Archive originals server-side FIRST (atomic move + tombstones). Abort
  // on failure — concurrent teacher pushes can never resurrect them after this.
  renameExamStep2(oldName, newName, matches, targetN);
}
async function renameExamStep2(oldName, newName, matches, targetN){
  try{
    const r = await fetch('/api/archive/exam', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({examName: oldName})});
    const d = await r.json();
    if(!d.ok) return toast(_adminErr(d, r) || ('Archive failed (' + (d.error || '') + ') — rename aborted, nothing changed.'), true);
  }catch(e){ return toast('Archive failed — server unreachable. Rename aborted, nothing changed.', true); }

  // 2) Rename + merge locally (target wins on subject conflicts).
  const newKeys = [];
  let merged = 0;
  const gone = new Set();
  matches.forEach(rec => {
    newKeys.push(_rxExamKey(rec.admNo, newName, rec.term, rec.year));
    const target = db.exams.find(e => e !== rec && !gone.has(e) && e.admNo === rec.admNo &&
      (e.examName || '') === newName && e.term === rec.term && e.year === rec.year);
    if(target){
      target.scores = target.scores || {}; target.subScores = target.subScores || {}; target.rubrics = target.rubrics || {};
      ['scores', 'subScores'].forEach(k => {
        Object.keys(rec[k] || {}).forEach(s => {
          if(target[k][s] === undefined) target[k][s] = rec[k][s];
        });
      });
      Object.keys(target.scores || {}).forEach(s => {
        const v = target.scores[s];
        target.rubrics[s] = (typeof getRubric === 'function' && typeof v === 'number') ? getRubric(v, target.grade, target.examName) : (target.rubrics[s] || {});
      });
      target.total = Object.keys(target.scores || {}).reduce((a, s) =>
        a + (typeof target.scores[s] === 'number' ? target.scores[s] : 0), 0);
      target.examCode = examCode(newName, target.term, target.year);
      gone.add(rec);
      merged++;
    } else {
      rec.examName = newName;
      rec.examCode = examCode(newName, rec.term, rec.year);
    }
  });
  if(gone.size) db.exams = db.exams.filter(e => !gone.has(e));

  // 3) Mirror into raw rows (rename + same merge rule).
  const rawMatches = (db.rawScores || []).filter(e => (e.examName || 'Untitled Exam') === oldName);
  const rawGone = new Set();
  rawMatches.forEach(rec => {
    const target = db.rawScores.find(e => e !== rec && !rawGone.has(e) && e.admNo === rec.admNo &&
      (e.examName || '') === newName && e.term === rec.term && e.year === rec.year);
    if(target){
      target.scores = target.scores || {}; target.subScores = target.subScores || {};
      ['scores', 'subScores'].forEach(k => {
        Object.keys(rec[k] || {}).forEach(s => {
          if(target[k][s] === undefined) target[k][s] = rec[k][s];
        });
      });
      target.total = Object.keys(target.scores || {}).reduce((a, s) =>
        a + (typeof target.scores[s] === 'number' ? target.scores[s] : 0), 0);
      target.examCode = examCode(newName, target.term, target.year);
      rawGone.add(rec);
    } else {
      rec.examName = newName;
      rec.examCode = examCode(newName, rec.term, rec.year);
    }
  });
  if(rawGone.size) db.rawScores = db.rawScores.filter(e => !rawGone.has(e));

  // 4) Rename matching registry definitions (same name + term/year).
  (db.examRegistry || []).forEach(d => {
    if(d && d.name === oldName && matches.some(r =>
        String(r.term) === String(d.term) && String(r.year) === String(d.year))) d.name = newName;
  });

  // 5) Clear tombstones on the new keys (re-adding a previously deleted exam
  // name must land) — staged like _forceSubjects, cleaned after the push.
  db._clearExamTombs = [...new Set((db._clearExamTombs || []).concat(newKeys))];
  const tok = db._clearExamTombs;
  setTimeout(() => {
    if(db._clearExamTombs === tok){
      delete db._clearExamTombs;
      try{ localStorage.setItem('santapris_db_v2', JSON.stringify(db)); }catch(e){}
    }
  }, 600000);

  if(typeof recalcRanks === 'function') recalcRanks();
  if(typeof saveDB === 'function') saveDB();
  if(typeof updateCounts === 'function') updateCounts();
  closeRenameExamModal();
  if(typeof renderExamsTable === 'function'){
    try{ renderExamsTable(); }catch(e){}
  }
  if(document.getElementById('page-scoreEntry') &&
     document.getElementById('page-scoreEntry').classList.contains('active') &&
     typeof initScoreEntry === 'function'){
    try{ initScoreEntry(); }catch(e){}
  }
  toast('✅ Renamed to "' + newName + '" — ' + matches.length + ' moved' +
    (merged ? ', ' + merged + ' merged' : '') + ', no scores lost.');
}

// Remove one subject's scores server-side (admin) with a tombstone, so stale
// devices holding older snapshots can't resurrect the old value on their
// next push. Re-adding later is explicit via _forceSubjects (see below).
function _removeExamSubjectsRemote(admNo, examName, term, year, subjects){
  (subjects||[]).forEach(s=>{
    fetch('/api/exams/subject?admNo='+encodeURIComponent(admNo||'')+
          '&examName='+encodeURIComponent(examName||'')+
          '&term='+encodeURIComponent(term||'')+
          '&year='+encodeURIComponent(year||'')+
          '&subject='+encodeURIComponent(s),
      {method:'DELETE'}).catch(()=>{});
  });
}

// Client-side exam key — must match server exam_key(): admNo__examName__term__year
function _ssExamKey(admNo, examName, term, year){
  return (admNo||'') + '__' + (examName||'') + '__' + (term||'') + '__' + (year||'');
}

// Stage explicit re-add intent for subjects that are newly present vs the
// previous record. The server clears removal tombstones listed here — and
// ONLY here — so a stale device's old values can never fake a re-add.
// Staged onto db so the next saveDB push carries it; the push deletes it on
// server-ack (sync_engine). The timer below is only a backstop for pushes
// that never go out (offline) — long on purpose so a delayed retry still
// carries the intent instead of silently stripping the re-added scores.
function _stageForceSubjects(map){
  if(!map) return;
  const keys = Object.keys(map);
  if(!keys.length) return;
  db._forceSubjects = Object.assign(db._forceSubjects||{}, map);
  const tok = db._forceSubjects;
  setTimeout(function(){
    if(db._forceSubjects === tok){
      delete db._forceSubjects;
      try{ localStorage.setItem('santapris_db_v2', JSON.stringify(db)); }catch(e){}
    }
  }, 600000);
}

function deleteWholeExam(safeId, examName){
  const matches = db.exams.filter(e=>(e.examName||'Untitled Exam')===examName);
  const count = matches.length;
  if(!confirm(`Delete ALL ${count} records for exam "${examName}"?\nThis cannot be undone.`)) return;
  _deleteExamRecordsRemote(matches);
  db.exams = db.exams.filter(e=>(e.examName||'Untitled Exam')!==examName);
  db.rawScores = (db.rawScores||[]).filter(e=>(e.examName||'Untitled Exam')!==examName);
  if(_editingExamIndex!==null){
    _editingExamIndex=null;
    document.getElementById('es_editPanel').style.display='none';
    clearEditForm();
  }
  _esOpenGroups.delete(safeId);
  recalcRanks(); saveDB();
  toast(`🗑 Deleted all records for "${examName}"`);
  renderEditScoresTable();
}

function deleteGradeExamRecords(safeId, grade, examName){
  const matches = db.exams.filter(e=>e.grade===grade&&(e.examName||'Untitled Exam')===examName);
  const count = matches.length;
  if(!confirm(`Delete all ${count} Grade ${grade} records for "${examName}"?`)) return;
  _deleteExamRecordsRemote(matches);
  db.exams = db.exams.filter(e=>!(e.grade===grade&&(e.examName||'Untitled Exam')===examName));
  db.rawScores = (db.rawScores||[]).filter(e=>!(e.grade===grade&&(e.examName||'Untitled Exam')===examName));
  if(_editingExamIndex!==null){
    _editingExamIndex=null;
    document.getElementById('es_editPanel').style.display='none';
    clearEditForm();
  }
  recalcRanks(); saveDB();
  toast(`🗑 Deleted Grade ${grade} records for "${examName}"`);
  renderEditScoresTable();
}

function confirmDeleteRecord(realIdx){
  const e=db.exams[realIdx];
  if(!e)return;
  if(!confirm(`Delete exam record for ${e.name} (${e.examName||'Untitled Exam'})?`))return;
  _deleteExamRecordsRemote([e]);
  db.exams.splice(realIdx,1);
  const _rawIdx = (db.rawScores||[]).findIndex(r=>r.admNo===e.admNo&&(r.examName||'Untitled Exam')===(e.examName||'Untitled Exam')&&r.term===e.term&&r.year===e.year);
  if(_rawIdx>=0) db.rawScores.splice(_rawIdx,1);
  recalcRanks();
  saveDB();
  if(_editingExamIndex===realIdx){
    _editingExamIndex=null;
    document.getElementById('es_editPanel').style.display='none';
    clearEditForm();
  } else if(_editingExamIndex>realIdx){
    _editingExamIndex--;
  }
  toast('🗑 Record deleted');
  renderEditScoresTable();
}

/* ═══════════════════════════════════════════════════════════
   AUTH SYSTEM — Login / Register / Session
   Users stored in localStorage key: santapris_users_v1
   Sessions stored in: santapris_session_v1
   ═══════════════════════════════════════════════════════════ */
const AUTH_USERS_KEY   = 'santapris_users_v1';
const AUTH_SESSION_KEY = 'santapris_session_v1';

// Seed the default admin account on first load

/* ─── Role-based privilege enforcement ─── */
function getCurrentRole(){
  // Prefer in-memory value set at login, then sessionStorage, then cookie fallback.
  // The fallback is '' (no privileges) so that an unauthenticated / unknown session
  // is NEVER treated as admin. Only an explicit 'admin' role grants full access.
  return window.__currentRole
      || sessionStorage.getItem('sp_role')
      || '';
}
function isAdmin(){
  return getCurrentRole() === 'admin';
}
function requireAdmin(actionLabel){
  if(isAdmin()) return true;
  toast('⛔ Restricted: this action is admin-only. Ask the admin to ' + (actionLabel || 'do this') + '.', true);
  return false;
}

var _roleBlockedOriginals = {};   // remembers the real implementation of each blocked function
function applyRoleMode(){
  const role = getCurrentRole();
  // Every mutating / exporting / importing / printing / generating / deleting action
  // is admin-only. Score ENTRY (saveClassExamScores, ssSaveScores) stays available to
  // non-admin users — those two functions additionally enforce their own
  // "never amend an already-saved score" rule.
  const BLOCKED = [
    /* student / teacher record editing */
    'saveStudent','delStudent','saveTeacherForm','delTeacher',
    /* score manipulation (beyond plain entry) */
    'saveMeanScores','editMeanScore','deleteMeanScore',
    'executeDeleteGrade','executeDeleteExam',
    'clearClassScores','saveEditedScores','deleteEditRecord',
    'confirmDeleteRecord','deleteWholeExam','deleteGradeExamRecords','_deleteExamRecordsRemote',
    /* attendance / fees / booklist / class-teacher assignment */
    'saveAttendance','toggleFeeStatus','saveBookEntry','deleteBookEntry',
    'assignClassTeacher','toggleClassTeacher',
    /* calendar / communications */
    'saveCalEvent','deleteCalEvent','saveComm','deleteComm',
    /* timetable + duty rota + supervision + subject/teacher hub editing */
    'saveTimetableToDB','generateTimetableNow','generateDutyRota','drPersist',
    /* special timetable generator (page viewing stays open) */
    'sttGenerate','sttExport','sttExportPdf','sttExportWord','sttExportExcel','sttDeleteHistory',
    'generateSupervisionList','deleteSupervisionList','svwGenerate',
    'persist','persistCL','doSwap',
    'setRegistry','renameSubject','deleteSubject','assignTo','unassignFromAll',
    /* exam-name registry + score conversion setup (entry itself stays open) */
    'erSave','erDelete','renameExamRecords',
    'saveConvConstants','clearConvConstants',
    /* exam rename (modal viewing stays open; executing is admin-only) */
    'executeExamRename','archiveExamByName','restoreArchivedExam','deleteArchivedExam',
    'openClearSubjectCol','executeClearSubjectCol','saveRubrics','resetRubrics',
    /* remote deletes (all delete UIs already call these; teachers must not) */
    '_removeExamSubjectsRemote',
    /* 09-tt-constraints editor (exposed mutators) */
    'ttcToggleBan','ttcAddRule','ttcRemoveRule','ttcAddClassSubject','ttcRemoveClassSubject',
    'ttcSetClassLessons','ttcSetClassDoubles','ttcClearBanned',
    /* 10-tt-advanced editor (structure / drag-drop / breaks) */
    'ttaBuildStructure','ttApplyStructureEdits','ttaSetBreaks','ttaSetDays','ttaSetDaysQuick',
    'ttaSetDouble','ttaSetMaxConsec','ttaQuickBreakChanged','ttaSyncBreaksFromGrid',
    'ttaAddOff','ttaRemoveOff','ttaCellClick','ttaCellDrop','ttaExportWord',
    /* 11-teachers-hub (class-lesson targets / off-time editing) */
    'ttClassSet','ttClassReset','tchSetLessons','tchSetSingles','tchSetDoubles',
    'tchToggleOff','tchClearDay','tchResetSubject','tchSaveSubject','ttSeedClass',
    /* 12-subjects-hub (subject registry editing) */
    'subjAdd','subjDelete','subjRename','subjAddGrade','subjRemoveGrade','subjSaveGrade',
    'subjSetDoubles','subjSetLessons','subjSetSingles',
    /* imports */
    'executeImport','executeExamImport','executeTeacherImport',
    'importDataJSON','saveImageImportedExam',
    /* exports / PDFs / prints / backups */
    'exportDataJSON','exportPortableHTML',
    'exportStudentReportCard','exportStudentRubricCard',
    'exportAllStudentsReportCards','exportAllStudentsRubrics',
    'exportClassResultsPDF','exportCombinedGradeResultsPDF','exportClassRubricPDF',
    'exportBlankMarksheet','exportClassListPDF','exportTeachersListPDF',
    'exportAnalysisPDF','exportTeacherPerformancePDF','exportAnalysisExcel',
    'exportTopStudentsPDF','exportTopStudentsExcel','exportTopStudentsWord',
    'exportGradeTrendsPDF','exportMostImprovedPDF','exportMostImprovedExcel',
    'exportGenderPDF','exportGenderExcel','exportRubricDistPDF','exportRubricDistExcel',
    'exportCalendarPDF','exportAttendancePDF','exportFeesPDF','exportFeesExcel',
    'exportWorkloadPDF','exportStudentProgressPDF',
    'exportTimetablePDF','exportTimetableByClass','exportTimetableByTeacher',
    'exportSupervisionPDF','exportSupervisionWord',
    'exportSingleTeacherBooklist','_doExportSingleTeacherBooklist','exportAllTeachersBooklist',
    'drExportPdf','drExportExcel','drDownload',
    'executeMarksheetTemplateDownload',
    'downloadExamImportTemplate','downloadTeacherTemplate','downloadImportTemplate',
    /* demo data */
    'loadSampleData','deleteSampleData'
  ];
  if(role !== 'admin'){
    document.body.classList.add('teacher-mode');
    // Block all admin-only functions; score entry (saveClassExamScores/ssSaveScores)
    // is intentionally NOT in the list so non-admin users can still record marks.
    BLOCKED.forEach(fn=>{
      if(typeof window[fn]==='function'){
        if(!_roleBlockedOriginals[fn]) _roleBlockedOriginals[fn] = window[fn]; // keep the real one, once
        window[fn] = function(){ toast('⛔ Teacher mode: this action is restricted to the admin only.',true); };
      }
    });
  } else {
    document.body.classList.remove('teacher-mode');
    // Restore any functions a previous non-admin session in this tab may have blocked
    BLOCKED.forEach(fn=>{
      if(_roleBlockedOriginals[fn]) window[fn] = _roleBlockedOriginals[fn];
    });
  }
}


function initAuth(){
  let users = getUsers();
  // Pre-set admin account: Martinsmarta / Luvahama1995!
  if(!users['Martinsmarta']){
    users['Martinsmarta'] = {
      username: 'Martinsmarta',
      passhash: hashPw('Luvahama1995!'),
      isAdmin: true,
      role: 'admin',
      createdAt: '2024-01-01'
    };
    saveUsers(users);
  }
  // Pre-set shared teacher account: Teacher / Teacher123
  if(!users['Teacher']){
    users['Teacher'] = {
      username: 'Teacher',
      passhash: hashPw('Teacher123'),
      isAdmin: false,
      role: 'teacher',
      createdAt: '2024-01-01'
    };
    saveUsers(users);
  }
}

function getUsers(){
  try{ return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)||'{}'); }
  catch(e){ return {}; }
}
function saveUsers(u){ localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(u)); }

// Simple deterministic hash using btoa chain (good enough for local-only auth)
function hashPw(pw){
  let s = pw + 'santapris_salt_2024';
  for(let i=0;i<3;i++) s = btoa(s);
  return s;
}

function validatePassword(pw){
  const rules = {
    len:     pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    num:     /[0-9]/.test(pw),
    special: /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?/\\`~]/.test(pw)
  };
  return rules;
}

function checkPwRules(pw){
  const r = validatePassword(pw);
  const set = (id, ok) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.className = 'pw-rule' + (ok?' ok':'');
    el.textContent = (ok?'✓':'✗') + el.textContent.slice(1);
  };
  set('rule-len',     r.len);
  set('rule-upper',   r.upper);
  set('rule-num',     r.num);
  set('rule-special', r.special);
}

function togglePwVisibility(inputId, btn){
  const el = document.getElementById(inputId);
  if(!el) return;
  if(el.type === 'password'){ el.type='text';  btn.textContent='🙈'; }
  else                      { el.type='password'; btn.textContent='👁'; }
}

function switchLoginTab(tab){
  const loginF    = document.getElementById('loginForm');
  const registerF = document.getElementById('registerForm');
  const tabL      = document.getElementById('tabLogin');
  const tabR      = document.getElementById('tabRegister');
  const title     = document.getElementById('loginCardTitle');
  const sub       = document.getElementById('loginCardSub');
  if(tab === 'login'){
    loginF.style.display=''; registerF.style.display='none';
    tabL.classList.add('active'); tabR.classList.remove('active');
    title.textContent = 'Welcome Back';
    sub.textContent   = 'Sign in to continue to your dashboard';
  } else {
    loginF.style.display='none'; registerF.style.display='';
    tabR.classList.add('active'); tabL.classList.remove('active');
    title.textContent = 'Create Account';
    sub.textContent   = 'Set up your Santapris Academy account';
  }
}

function showLoginError(id, msg){
  const el = document.getElementById(id);
  if(el){ el.textContent=msg; el.style.display=''; }
}
function hideLoginMsg(id){
  const el = document.getElementById(id);
  if(el){ el.style.display='none'; el.textContent=''; }
}

/* ── Debounce utility: delays fn by ms, batches rapid calls ── */
var _debTimers = {};
function debounce(key, fn, ms){
  clearTimeout(_debTimers[key]);
  _debTimers[key] = setTimeout(fn, ms || 120);
}

/* ── Shared boot helper — called after any successful login ── */
function _bootAfterLogin(username, role){
  const overlay = document.getElementById('loginOverlay');
  if(overlay) overlay.classList.add('hidden');
  try {
    loadDB();
    renderTeacherForm();
    const _dashEl = document.getElementById('page-dashboard');
    if(_dashEl) _dashEl.classList.add('active');
    renderDashboard();
    previewAdm();
    checkSampleDataState();
  } catch(e){ console.error('boot render (non-fatal):', e); }
  const navLogo = document.getElementById('navLogo');
  if(navLogo) navLogo.src = SCHOOL_LOGO_DATAURL;
  const loginLogo = document.getElementById('loginLogo');
  if(loginLogo) loginLogo.src = SCHOOL_LOGO_DATAURL;
  const navUser = document.getElementById('navUsername');
  if(navUser) navUser.textContent = username;
  closeModal();
  toast('\uD83D\uDC4B Welcome, ' + username + '!');
  window.__currentRole = role;
  applyRoleMode();
  if(typeof _syncMobTab==='function'){ _syncMobTab('dashboard'); _applyMobFullscreen('dashboard'); }
  sessionStorage.setItem('sp_logged_in', '1');
  sessionStorage.setItem('sp_username',  username);
  sessionStorage.setItem('sp_role',      role);
  if(typeof window._teacherTimeoutStart === 'function') window._teacherTimeoutStart();
}

async function doLogin(){
  hideLoginMsg('loginErr');
  const username = (document.getElementById('loginUsername').value||'').trim();
  const password = (document.getElementById('loginPassword').value||'');
  if(!username) return showLoginError('loginErr','Please enter your username.');
  if(!password) return showLoginError('loginErr','Please enter your password.');

  // Disable button while request is in flight
  const btn = document.getElementById('loginBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Signing in…'; }

  try {
    const r = await fetch('/api/login', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({username, password})
    });
    const data = await r.json();
    if(!r.ok || !data.ok){
      showLoginError('loginErr', data.error || 'Incorrect username or password. Please try again.');
      return;
    }
    _bootAfterLogin(data.username, data.role || '');
  } catch(e){
    showLoginError('loginErr', 'Cannot reach the server. Make sure school_system.py is running.');
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = 'Sign In'; }
  }
}

async function doRegister(){
  hideLoginMsg('registerErr');
  hideLoginMsg('registerOk');
  const username = (document.getElementById('regUsername').value||'').trim();
  const pw       = document.getElementById('regPassword').value||'';
  const confirm  = document.getElementById('regConfirm').value||'';

  if(!username || username.length < 3)
    return showLoginError('registerErr','Username must be at least 3 characters.');
  if(!/^[a-zA-Z0-9_.]+$/.test(username))
    return showLoginError('registerErr','Username can only contain letters, numbers, underscores, and dots.');

  const rules = validatePassword(pw);
  if(!rules.len)     return showLoginError('registerErr','Password must be at least 8 characters.');
  if(!rules.upper)   return showLoginError('registerErr','Password must contain at least one uppercase letter.');
  if(!rules.num)     return showLoginError('registerErr','Password must contain at least one number.');
  if(!rules.special) return showLoginError('registerErr','Password must contain at least one special character (!@#$…).');
  if(pw !== confirm)  return showLoginError('registerErr','Passwords do not match.');

  const btn = document.getElementById('registerBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Creating account…'; }

  try {
    const r = await fetch('/api/register', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({username, password: pw, role: 'teacher'})
    });
    const data = await r.json();
    if(!r.ok || !data.ok){
      return showLoginError('registerErr', data.error || 'Registration failed. Please try again.');
    }
    const okEl = document.getElementById('registerOk');
    if(okEl){ okEl.textContent='\u2705 Account created! You can now sign in.'; okEl.style.display=''; }
    document.getElementById('regUsername').value='';
    document.getElementById('regPassword').value='';
    document.getElementById('regConfirm').value='';
    checkPwRules('');
    setTimeout(()=>{ switchLoginTab('login'); }, 1800);
  } catch(e){
    showLoginError('registerErr', 'Cannot reach the server. Make sure school_system.py is running.');
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = 'Create Account'; }
  }
}

async function checkExistingSession(){
  // Fast path: tab sessionStorage says we're already logged in this tab
  if(sessionStorage.getItem('sp_logged_in') === '1'){
    const username = sessionStorage.getItem('sp_username') || '';
    const role     = sessionStorage.getItem('sp_role')     || '';
    window.__currentRole = role;
    const overlay = document.getElementById('loginOverlay');
    if(overlay) overlay.classList.add('hidden');
    const navUser = document.getElementById('navUsername');
    if(navUser) navUser.textContent = username;
    setTimeout(applyRoleMode, 0);
    return true;
  }
  // No active sessionStorage entry for this tab — always require a fresh login.
  // (We intentionally do NOT fall back to the long-lived server cookie here,
  // so opening the link in a new tab/browser/device always lands on the login page.)
  return false;
}

async function doLogout(){
  if(!confirm('Sign out of Santapris Academy?')) return;
  if(typeof window._teacherTimeoutStop === 'function') window._teacherTimeoutStop();
  // Clear all local session state
  sessionStorage.removeItem('sp_logged_in');
  sessionStorage.removeItem('sp_username');
  sessionStorage.removeItem('sp_role');
  localStorage.removeItem(AUTH_SESSION_KEY);   // legacy cleanup
  window.__currentRole = null;
  // Tell the server to clear its cookie
  try { await fetch('/api/logout', {method:'POST'}); } catch(e){}
  const overlay = document.getElementById('loginOverlay');
  if(overlay) overlay.classList.remove('hidden');
  document.body.classList.remove('teacher-mode');
  ['loginUsername','loginPassword','regUsername','regPassword','regConfirm']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  ['loginErr','registerErr','registerOk'].forEach(id=>hideLoginMsg(id));
  switchLoginTab('login');
  const navUser = document.getElementById('navUsername');
  if(navUser) navUser.textContent = '—';
}


/* ═══════════════════════════════════════════════════════════
   NON-ADMIN SESSION INACTIVITY TIMEOUT — 5 minutes
   Only applies to non-admin sessions. Admin sessions are unaffected.
   ═══════════════════════════════════════════════════════════ */
(function(){
  const TIMEOUT_MS   = 5 * 60 * 1000;   // 5 minutes
  const WARN_MS      = 60 * 1000;        // warn 1 minute before expiry
  let   _inactivityTimer  = null;
  let   _warnTimer        = null;
  let   _warnToastShown   = false;
  const ACTIVITY_EVENTS   = ['mousemove','mousedown','keydown','touchstart','scroll','click'];

  function _isTeacherSession(){
    return (window.__currentRole || sessionStorage.getItem('sp_role') || '') !== 'admin';
  }

  function _forceLogout(){
    _stopTimers();
    // Remove session silently (no confirm dialog)
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem('sp_logged_in');
    sessionStorage.removeItem('sp_username');
    sessionStorage.removeItem('sp_role');
    window.__currentRole = null;
    fetch('/api/logout', {method:'POST'}).catch(()=>{});
    document.body.classList.remove('teacher-mode');
    const overlay = document.getElementById('loginOverlay');
    if(overlay) overlay.classList.remove('hidden');
    ['loginUsername','loginPassword','regUsername','regPassword','regConfirm']
      .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    ['loginErr','registerErr','registerOk'].forEach(id=>hideLoginMsg(id));
    switchLoginTab('login');
    const navUser = document.getElementById('navUsername');
    if(navUser) navUser.textContent = '—';
    toast('⏱ Session expired due to inactivity. Please log in again.');
  }

  function _stopTimers(){
    if(_inactivityTimer) clearTimeout(_inactivityTimer);
    if(_warnTimer)        clearTimeout(_warnTimer);
    _inactivityTimer = null;
    _warnTimer       = null;
    _warnToastShown  = false;
  }

  function _resetTimers(){
    if(!_isTeacherSession()) return;   // only active for teacher role
    _stopTimers();
    _warnTimer = setTimeout(()=>{
      if(!_isTeacherSession()) return;
      toast('⚠️ Your session will expire in 1 minute due to inactivity.');
      _warnToastShown = true;
    }, TIMEOUT_MS - WARN_MS);
    _inactivityTimer = setTimeout(()=>{
      if(!_isTeacherSession()) return;
      _forceLogout();
    }, TIMEOUT_MS);
  }

  // Start tracking after login; expose start/stop for doLogin and doLogout
  window._teacherTimeoutStart = function(){
    if(!_isTeacherSession()) return;
    _resetTimers();
    ACTIVITY_EVENTS.forEach(ev =>
      document.addEventListener(ev, _onActivity, { passive: true })
    );
  };

  window._teacherTimeoutStop = function(){
    _stopTimers();
    ACTIVITY_EVENTS.forEach(ev =>
      document.removeEventListener(ev, _onActivity, { passive: true })
    );
  };

  function _onActivity(){
    if(!_isTeacherSession()){ _teacherTimeoutStop(); return; }
    _resetTimers();
  }
})();
// ── SAVE DB: per-user storage ─────────────────────────────────────────────
// Override saveDB to also write to user-specific key for non-admin users
const _origSaveDB = typeof saveDB === 'function' ? saveDB : null;

// ── INIT ─────────────────────────────────────────────────────────────────
// INIT
window.addEventListener('DOMContentLoaded',()=>{
  // Set logo on login page
  setTimeout(()=>{
    const loginLogo = document.getElementById('loginLogo');
    if(loginLogo) loginLogo.src = SCHOOL_LOGO_DATAURL;
  }, 50);

  initAuth();

  // Show login on every fresh tab/window open, but NOT on reloads that happen
  // within an already-authenticated session (e.g. LAN sync reload, JS reload).
  // sessionStorage is cleared when the tab is closed, so a new tab = new login.
  const overlay = document.getElementById('loginOverlay');

  // checkExistingSession is now async — it asks the server to verify the cookie.
  // Show a brief "Checking session…" state while the fetch is in flight.
  if(overlay) overlay.classList.remove('hidden');   // show login overlay by default

  checkExistingSession().then(function(valid){
    if(valid){
      // Server confirmed the session cookie — boot straight into the app
      loadDB();
      renderTeacherForm();
      const dashEl = document.getElementById('page-dashboard');
      if(dashEl) dashEl.classList.add('active');
      renderDashboard();
      previewAdm();
      checkSampleDataState();
      const navLogo = document.getElementById('navLogo');
      if(navLogo) navLogo.src = SCHOOL_LOGO_DATAURL;
    } else {
      // No valid session — show the login form
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem('sp_logged_in');
      sessionStorage.removeItem('sp_username');
      sessionStorage.removeItem('sp_role');
      if(overlay) overlay.classList.remove('hidden');
      switchLoginTab('login');
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   SUBJECT ANALYSIS ENGINE
   ═══════════════════════════════════════════════════════════ */

// Get all unique exam names from db
function getExamNames() {
  const names = [...new Set(db.exams.map(e=>e.examName||'Untitled Exam'))].sort();
  return names;
}

// Find teacher name for subject+grade combination
function getSubjectTeacher(subject, grade) {
  const teacher = db.teachers.find(t =>
    Array.isArray(t.assignments) &&
    t.assignments.some(a => a.subject === subject && Array.isArray(a.classes) && a.classes.includes(grade))
  );
  return teacher ? fmtTeacher(teacher.name) : '—';
}

// Compute mean score for a subject in a given grade for a given exam name
// Checks: (1) calculated from individual exam records, (2) manually entered mean scores
function getMeanScore(examName, grade, subject) {
  // First: try to calculate from individual exam records
  const records = db.exams.filter(e =>
    (examName ? e.examName === examName : true) &&
    e.grade === grade &&
    e.scores[subject] !== undefined
  );
  if (records.length) {
    const total = records.reduce((sum, e) => sum + e.scores[subject], 0);
    return (total / records.length);
  }
  // Fallback: check manually entered mean scores
  const manual = (db.meanScores||[]).find(m =>
    m.examName === examName && m.grade === grade && m.scores && m.scores[subject] !== undefined
  );
  if (manual) return manual.scores[subject];
  return null;
}

// Build analysis data structure for all subjects × given grades
function buildAnalysisData(examName1, examName2, gradeFilter, gradeSet) {
  const grades = gradeFilter ? [gradeFilter] : (gradeSet || GRADES);
  const result = {}; // keyed by subject
  const subjectsForSet = (gradeSet && gradeSet === LP_GRADES) ? SUBJ_LP : ALL_SUBJ;
  subjectsForSet.forEach(subj => {
    const rows = [];
    grades.forEach(grade => {
      // Only include grade if it belongs to the current section's grade set
      if (gradeSet && !gradeSet.includes(grade)) return;
      const mean1 = getMeanScore(examName1, grade, subj);
      const mean2 = examName2 ? getMeanScore(examName2, grade, subj) : null;
      const teacher = getSubjectTeacher(subj, grade);
      if (mean1 !== null || mean2 !== null) {
        let comment = '—';
        if (mean1 !== null && mean2 !== null) {
          if (mean2 > mean1) comment = '✅ Improved';
          else if (mean2 < mean1) comment = '⚠️ Dropped';
          else comment = '➡️ Same';
        }
        rows.push({ grade, mean1, mean2, teacher, comment });
      }
    });
    if (rows.length) result[subj] = rows;
  });
  return result;
}

function populateAnalysisExamDropdowns() {
  // Combine exam names from records AND manual mean scores
  const fromRecords = getExamNames();
  const fromManual  = [...new Set((db.meanScores||[]).map(m=>m.examName).filter(Boolean))];
  const names = [...new Set([...fromRecords, ...fromManual])].sort();
  ['sa_exam1','sa_exam2'].forEach(id => {
    const sel = document.getElementById(id);
    const cur = sel.value;
    sel.innerHTML = '<option value="">-- Select Exam --</option>';
    names.forEach(n => { const o = document.createElement('option'); o.value=n; o.textContent=n; if(n===cur) o.selected=true; sel.appendChild(o); });
  });
}

function toggleAnalysisMode() {
  const mode = document.getElementById('sa_mode').value;
  document.getElementById('sa_exam2_group').style.display = mode==='compare' ? '' : 'none';
  renderSubjectAnalysis();
}

// Stores last computed analysis for exports
let _lastAnalysisData = null;
let _lastAnalysisMeta = null;

function renderSubjectAnalysis() {
  const mode = document.getElementById('sa_mode').value;
  const exam1 = document.getElementById('sa_exam1').value;
  const exam2 = mode==='compare' ? document.getElementById('sa_exam2').value : null;
  const gradeF = document.getElementById('sa_gradeFilter').value;
  const sectionF = (document.getElementById('sa_sectionFilter')||{value:'all'}).value || 'all';
  const container = document.getElementById('sa_results');
  const exportBtns = document.getElementById('sa_exportButtons');

  if (!exam1) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔬</div><p>Select an exam above to begin analysis.</p></div>';
    exportBtns.style.display = 'none';
    return;
  }
  if (mode==='compare' && !exam2) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔬</div><p>Select Exam 2 to compare.</p></div>';
    exportBtns.style.display = 'none';
    return;
  }
  if (mode==='compare' && exam1===exam2) {
    container.innerHTML = '<div class="card"><div class="card-body" style="color:var(--rose);font-weight:600">⚠️ Exam 1 and Exam 2 cannot be the same.</div></div>';
    exportBtns.style.display = 'none';
    return;
  }

  // Update the grade filter dropdown to only show grades relevant to selected section
  const gradeSelect = document.getElementById('sa_gradeFilter');
  if (gradeSelect) {
    const curVal = gradeSelect.value;
    const lpOptGroup = `<optgroup label="── Lower Primary ──">
      <option>1E</option><option>1N</option><option>1S</option><option>1W</option>
      <option>2E</option><option>2N</option><option>2S</option>
      <option>3E</option><option>3N</option><option>3S</option>
    </optgroup>`;
    const upOptGroup = `<optgroup label="── Upper Primary &amp; Junior ──">
      <option>4N</option><option>4S</option><option>4E</option><option>4W</option>
      <option>5N</option><option>5S</option><option>5E</option><option>5W</option>
      <option>6N</option><option>6S</option><option>7R</option><option>7B</option>
      <option>8R</option><option>8B</option><option>9R</option><option>9B</option>
    </optgroup>`;
    let gradeOptions = '<option value="">All Classes (All Sections)</option>';
    if (sectionF === 'lp') gradeOptions = '<option value="">All Lower Primary Classes</option>' + lpOptGroup;
    else if (sectionF === 'up') gradeOptions = '<option value="">All Upper Primary & Junior Classes</option>' + upOptGroup;
    else gradeOptions += lpOptGroup + upOptGroup;
    gradeSelect.innerHTML = gradeOptions;
    // Try to restore previous value if still valid
    if (curVal && [...gradeSelect.options].some(o=>o.value===curVal)) gradeSelect.value = curVal;
  }

  // Determine which grade sets to show based on section filter and grade filter
  let lpDataF = {}, upDataF = {};
  if (sectionF !== 'up') {
    // Include lower primary
    if (gradeF && LP_GRADES.includes(gradeF)) lpDataF = buildAnalysisData(exam1, exam2, gradeF, LP_GRADES);
    else if (!gradeF || !GRADES.includes(gradeF)) lpDataF = buildAnalysisData(exam1, exam2, null, LP_GRADES);
  }
  if (sectionF !== 'lp') {
    // Include upper primary & junior
    if (gradeF && GRADES.includes(gradeF)) upDataF = buildAnalysisData(exam1, exam2, gradeF, GRADES);
    else if (!gradeF || !LP_GRADES.includes(gradeF)) upDataF = buildAnalysisData(exam1, exam2, null, GRADES);
  }

  _lastAnalysisData = { lp: lpDataF, up: upDataF };
  _lastAnalysisMeta = { mode, exam1, exam2, gradeF, sectionF };

  if (!Object.keys(lpDataF).length && !Object.keys(upDataF).length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>No exam records found for the selected criteria.</p></div>';
    exportBtns.style.display = 'none';
    return;
  }

  // Update export button labels based on selected section
  const sectionLabel = sectionF === 'lp' ? ' (Lower Primary)' : sectionF === 'up' ? ' (Upper Primary & Junior)' : '';
  const btnPDF = document.getElementById('sa_btnPDF');
  const btnWord = document.getElementById('sa_btnWord');
  const btnExcel = document.getElementById('sa_btnExcel');
  if (btnPDF) btnPDF.textContent = '📄 Export PDF' + sectionLabel;
  if (btnWord) btnWord.textContent = '📝 Export Word' + sectionLabel;
  if (btnExcel) btnExcel.textContent = '📊 Export Excel' + sectionLabel;

  exportBtns.style.display = 'flex';

  function buildSectionHTML(data, sectionLabel, sectionColor, sectionIcon) {
    if (!Object.keys(data).length) return '';
    let html = `
    <div style="margin:28px 0 10px;display:flex;align-items:center;gap:12px">
      <div style="flex:1;height:2px;background:linear-gradient(90deg,${sectionColor},transparent)"></div>
      <span style="font-size:16px;font-weight:800;color:${sectionColor};white-space:nowrap;letter-spacing:.03em">${sectionIcon} ${sectionLabel}</span>
      <div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,${sectionColor})"></div>
    </div>`;
    Object.entries(data).forEach(([subj, rows]) => {
      html += `
      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <div class="card-title" style="font-size:16px;color:var(--sky)">📚 ${subjFull(subj)}</div>
          <span style="font-size:11px;color:var(--text-muted)">${rows.length} class(es)</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Class</th>
              ${mode==='single' ? `<th>${exam1} — Mean Score</th>` : `<th>${exam1}<br><span style="font-weight:400;text-transform:none">Mean Score</span></th><th>${exam2}<br><span style="font-weight:400;text-transform:none">Mean Score</span></th><th>Comment</th>`}
              <th>Class Teacher</th>
            </tr></thead>
            <tbody>`;
      rows.forEach(r => {
        const m1 = r.mean1 !== null ? r.mean1.toFixed(2) : '—';
        const m2 = r.mean2 !== null ? r.mean2.toFixed(2) : '—';
        const commentColor = r.comment.includes('Improved') ? 'var(--emerald)' : r.comment.includes('Dropped') ? 'var(--rose)' : 'var(--text-muted)';
        html += `<tr>
          <td><span class="badge badge-blue">${r.grade}</span></td>
          ${mode==='single'
            ? `<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--gold);font-size:15px">${m1}</td>`
            : `<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--sky)">${m1}</td>
               <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--gold)">${m2}</td>
               <td style="font-weight:600;color:${commentColor}">${r.comment}</td>`
          }
          <td style="font-weight:600">${r.teacher}</td>
        </tr>`;
      });
      if (rows.length > 1) {
        const validM1 = rows.filter(r=>r.mean1!==null);
        const validM2 = rows.filter(r=>r.mean2!==null);
        const overallM1 = validM1.length ? (validM1.reduce((s,r)=>s+r.mean1,0)/validM1.length).toFixed(2) : '—';
        const overallM2 = validM2.length ? (validM2.reduce((s,r)=>s+r.mean2,0)/validM2.length).toFixed(2) : '—';
        html += `<tr style="background:rgba(30,86,200,0.1);font-weight:800">
          <td style="color:var(--text-muted)">Overall</td>
          ${mode==='single'
            ? `<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;color:var(--gold)">${overallM1}</td>`
            : `<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;color:var(--sky)">${overallM1}</td>
               <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;color:var(--gold)">${overallM2}</td>
               <td></td>`
          }
          <td></td>
        </tr>`;
      }
      html += `</tbody></table></div></div>`;
    });
    return html;
  }

  let html = '';
  html += buildSectionHTML(lpDataF, 'LOWER PRIMARY SCHOOL', 'var(--emerald)', '🌱');
  html += buildSectionHTML(upDataF, 'UPPER PRIMARY & JUNIOR SCHOOL', 'var(--sky)', '📘');

  // ── Class Mean Scores on-screen table ──
  let cmGradesUI = [];
  if(sectionF==='lp') cmGradesUI=LP_GRADES;
  else if(sectionF==='up') cmGradesUI=GRADES;
  else cmGradesUI=[...LP_GRADES,...GRADES];
  if(gradeF) cmGradesUI=cmGradesUI.filter(g=>g===gradeF);
  const cmRowsUI = getClassMeanRows(cmGradesUI, exam1, mode==='compare'?exam2:null);
  if(cmRowsUI.length){
    html += `
    <div style="margin:28px 0 10px;display:flex;align-items:center;gap:12px">
      <div style="flex:1;height:2px;background:linear-gradient(90deg,var(--gold),transparent)"></div>
      <span style="font-size:15px;font-weight:800;color:var(--gold);white-space:nowrap;letter-spacing:.03em">📊 CLASS MEAN SCORES SUMMARY</span>
      <div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,var(--gold))"></div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <div class="card-title" style="font-size:15px;color:var(--gold)">📊 Class Mean Scores</div>
        <span style="font-size:11px;color:var(--text-muted)">${cmRowsUI.length} class(es)</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Class</th>
          ${mode==='single'
            ? `<th>${exam1} — Class Mean</th>`
            : `<th>${exam1}<br><span style="font-weight:400;text-transform:none">Class Mean</span></th><th>${exam2}<br><span style="font-weight:400;text-transform:none">Class Mean</span></th>`}
          <th>Class Teacher</th>
        </tr></thead>
        <tbody>
        ${cmRowsUI.map(r=>{
          const m1=r.mean1!==null?r.mean1.toFixed(2):'—';
          const m2=r.mean2!==null?r.mean2.toFixed(2):'—';
          return `<tr>
            <td><span class="badge badge-blue">${r.grade}</span></td>
            ${mode==='single'
              ?`<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:800;color:var(--gold);font-size:15px">${m1}</td>`
              :`<td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--sky)">${m1}</td>
                <td style="font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--gold)">${m2}</td>`}
            <td style="font-weight:600">${r.classTeacher}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>
    </div>`;
  }

  container.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════════
   ANALYSIS EXPORTS
   ═══════════════════════════════════════════════════════════ */

/**
 * Build class mean score rows for a set of grades and an exam (or two).
 * Returns [{grade, classTeacher, mean1, mean2}]
 * mean1/mean2 come from: (1) manual avgClassMean in db.meanScores,
 * (2) average total / numSubjects from db.exams records.
 */
/* Class aggregates for the meanscore summary: average total score (mean of
   learner totals), average meanscore (mean of every subject mark), average
   rubric points (mean of rubric pts over the same marks) and the band label
   for those points. Nulls where the class has no records. */
function ptsBand(avgPts, grade, examName){
  if(avgPts === null || avgPts === undefined || isNaN(avgPts)) return '—';
  const p = parseFloat(avgPts);
  // Average points live on the fixed 8-point scale (8=E.E1 … 1=B.E2),
  // so the band for a mean is definitionally fixed; grade/exam only
  // select which configured set defined the underlying marks.
  const ptCuts = [7.5, 6.5, 5.5, 4.5, 3.5, 2.5, 1.5];
  const codes = ['E.E1','E.E2','M.E1','M.E2','A.E1','A.E2','B.E1'];
  // Map average points through the configured band widths proportionally:
  // each band's share of the 8-pt scale follows its share of the mark range.
  let code = 'B.E2';
  for(let i = 0; i < 7; i++){ if(p >= ptCuts[i]){ code = codes[i]; break; } }
  const word = code.charAt(0)==='E' ? 'Exceeding Expectation'
    : code.charAt(0)==='M' ? 'Meeting Expectation'
    : code.charAt(0)==='A' ? 'Approaching Expectation' : 'Below Expectation';
  return `${code} (${word})`;
}
function classAggStats(grade, examName){
  if(!examName) return { avgTotal: null, avgMean: null, avgPts: null, avgRubric: '—' };
  const recs = db.exams.filter(e => e.examName === examName && e.grade === grade);
  const withTotal = recs.filter(e => typeof e.total === 'number');
  const avgTotal = withTotal.length
    ? parseFloat((withTotal.reduce((s,e) => s + e.total, 0) / withTotal.length).toFixed(2)) : null;
  let sum = 0, n = 0, pts = 0;
  recs.forEach(e => {
    Object.keys(e.scores || {}).forEach(s => {
      const v = e.scores[s];
      if(typeof v !== 'number') return;
      sum += v; n++;
      pts += getRubric(v, grade, examName).pts;
    });
  });
  const avgMean = n ? parseFloat((sum / n).toFixed(2)) : null;
  const avgPts = n ? parseFloat((pts / n).toFixed(2)) : null;
  return { avgTotal, avgMean, avgPts, avgRubric: ptsBand(avgPts) };
}

function getClassMeanRows(grades, examName1, examName2) {
  return grades.map(grade => {
    function getMean(examName) {
      if(!examName) return null;
      // 1. Manual avgClassMean
      const ms = (db.meanScores||[]).find(m=>m.examName===examName&&m.grade===grade);
      if(ms && ms.avgClassMean!==undefined && ms.avgClassMean!==null) return parseFloat(ms.avgClassMean);
      // 2. Compute from exam records
      const records = db.exams.filter(e=>e.examName===examName&&e.grade===grade&&e.total!==undefined);
      if(records.length){
        const subjCount = getSubjects(grade).length || 1;
        return parseFloat((records.reduce((s,e)=>s+(e.total||0),0)/(records.length*subjCount)).toFixed(2));
      }
      return null;
    }
    const mean1 = getMean(examName1);
    const mean2 = examName2 ? getMean(examName2) : null;
    const cts = getClassTeachers(grade);
    const classTeacher = cts.length ? cts.map(t=>fmtTeacher(t.name)).join(' & ') : '—';
    if(mean1===null && mean2===null) return null;
    return {grade, classTeacher, mean1, mean2};
  }).filter(Boolean);
}

function exportAnalysisPDF() {
  if (!_lastAnalysisData || (!Object.keys(_lastAnalysisData.lp||{}).length && !Object.keys(_lastAnalysisData.up||{}).length)) return toast('No data to export', true);
  const jsPDF = window._getJsPDF();
  const { mode, exam1, exam2, gradeF, sectionF } = _lastAnalysisMeta;
  const isCompare = mode === 'compare';
  const saOrientEl = document.getElementById('saOrientation');
  const saOrientVal = saOrientEl ? saOrientEl.value : (isCompare ? 'landscape' : 'portrait');
  const doc = new jsPDF({ orientation: saOrientVal });
  const W = doc.internal.pageSize.getWidth();
  const subtitle = isCompare ? `Comparing: ${exam1}  vs  ${exam2}` : `Exam: ${exam1}`;
  const sectionLabel = sectionF === 'lp' ? ' — LOWER PRIMARY' : sectionF === 'up' ? ' — UPPER PRIMARY & JUNIOR' : '';
  let y = pdfHeader(doc, 'SUBJECT PERFORMANCE ANALYSIS' + sectionLabel, 'SANTAPRIS ACADEMY');
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,130);
  doc.text(subtitle + (gradeF ? ` | Class: ${gradeF}` : ' | All Classes'), W/2, y, {align:'center'});
  y += 6;

  // One subject per page: every subject's meanscores get a full page with a
  // table sized to the printable area in a precise, readable type size.
  // (The first subject flows onto the title page; the rest start new pages.)
  let _firstSubjectPage = true;
  function renderSection(sectionData, sectionTitle, fillColor) {
    if (!Object.keys(sectionData).length) return;
    Object.entries(sectionData).forEach(([subj, rows]) => {
      let y;
      if(_firstSubjectPage){ y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : 30; }
      else { doc.addPage(); y = 14; }
      _firstSubjectPage = false;
      doc.setFillColor(...fillColor); doc.rect(4, y, W-8, 8, 'F');
      doc.setTextColor(0,0,0); doc.setFont('helvetica','bold'); doc.setFontSize(10);
      doc.text(sectionTitle, W/2, y+5.5, {align:'center'});
      y += 11;
      doc.setFillColor(255,220,220); doc.rect(4, y, W-8, 7, 'F');
      doc.setTextColor(0,0,0); doc.setFont('helvetica','bold'); doc.setFontSize(10);
      doc.text(`Subject: ${subjFull(subj)}`, 8, y+5);
      y += 9;

      const head = isCompare
        ? ['Class', `${exam1}\nMean Score`, `${exam2}\nMean Score`, 'Comment', 'Class Teacher']
        : ['Class', `${exam1} — Mean Score`, 'Class Teacher'];
      const nCols = head.length;
      const usableW = W - 8;
      const cw = Math.floor(usableW / nCols * 10) / 10;

      const body = rows.map(r => {
        const m1 = r.mean1 !== null ? r.mean1.toFixed(2) : '—';
        const m2 = r.mean2 !== null ? r.mean2.toFixed(2) : '—';
        const comment = r.comment.replace(/[✅⚠️➡️]/g,'').trim();
        return isCompare ? [r.grade, m1, m2, comment, r.teacher] : [r.grade, m1, r.teacher];
      });

      if (rows.length > 1) {
        const validM1 = rows.filter(r=>r.mean1!==null);
        const validM2 = rows.filter(r=>r.mean2!==null);
        const o1 = validM1.length ? (validM1.reduce((s,r)=>s+r.mean1,0)/validM1.length).toFixed(2) : '—';
        const o2 = validM2.length ? (validM2.reduce((s,r)=>s+r.mean2,0)/validM2.length).toFixed(2) : '—';
        body.push(isCompare ? ['OVERALL', o1, o2, '', ''] : ['OVERALL', o1, '']);
      }

      const colStyles = {};
      for(let ci = 0; ci < nCols; ci++)
        colStyles[ci] = { cellWidth: cw, fontStyle: (ci === 0 ? 'bold' : 'normal'), fontSize: 10 };
      doc.autoTable({
        tableLineColor:[0,0,0], tableLineWidth:0.5,
        pageBreak: 'avoid', startY: y, head: [head], body,
        theme: 'grid',
        headStyles: { fillColor: [255,220,220], textColor: [0,0,0], fontStyle: 'bold', fontSize: 10 },
        styles: { fontSize: 10, cellPadding: 2.5, lineColor:[0,0,0], lineWidth:0.5 },
        columnStyles: colStyles,
        didParseCell(data) {
          if (data.section==='body') {
            const commentIdx = isCompare ? 3 : -1;
            if (data.column.index===commentIdx) {
              const v = data.cell.raw||'';
              if (v.includes('Improved')) data.cell.styles.textColor=[0,180,120];
              else if (v.includes('Dropped')) data.cell.styles.textColor=[220,50,70];
            }
            if (data.row.index===rows.length) {
              data.cell.styles.fontStyle='bold';
              data.cell.styles.fillColor=[230,240,255];
            }
          }
        },
        margin: { left: 4, right: 4 }
      });
      y = doc.lastAutoTable.finalY + 5;
      const foot = `Subject: ${subjFull(subj)}  ·  ${rows.length} classes  ·  ${exam1}`;
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,130);
      doc.text(foot, W/2, y, {align:'center'});
    });
  }

  renderSection(_lastAnalysisData.lp||{}, 'LOWER PRIMARY SCHOOL', [200,255,220]);
  renderSection(_lastAnalysisData.up||{}, 'UPPER PRIMARY & JUNIOR SCHOOL', [200,220,255]);

  // ── Class Mean Scores summary table ──
  // Columns: class, average total score, average meanscore, average points
  // (rubric pts), average rubric band — per exam in compare mode.
  let cmGrades = [];
  if(sectionF==='lp') cmGrades = LP_GRADES;
  else if(sectionF==='up') cmGrades = GRADES;
  else cmGrades = [...LP_GRADES, ...GRADES];
  if(gradeF) cmGrades = cmGrades.filter(g=>g===gradeF);
  const cmRows = getClassMeanRows(cmGrades, exam1, isCompare ? exam2 : null);
  const cmFmt = v => (v === null || v === undefined) ? '—' : v.toFixed(2);
  if(cmRows.length){
    doc.addPage();
    let y = 14;
    doc.setFillColor(11,29,58); doc.rect(4, y, W-8, 8, 'F');
    doc.setTextColor(242,199,68); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('CLASS MEAN SCORES SUMMARY', W/2, y+5.5, {align:'center'});
    y += 11;
    const cmHead = isCompare
      ? ['Class', `${exam1}\nAvg Total`, `${exam1}\nAvg Mean`, `${exam1}\nAvg Pts`, `${exam1}\nAvg Rubric`,
         `${exam2}\nAvg Total`, `${exam2}\nAvg Mean`, `${exam2}\nAvg Pts`, `${exam2}\nAvg Rubric`, 'Class Teacher']
      : ['Class', 'Avg Total Score', 'Avg Mean Score', 'Avg Points', 'Avg Rubric', 'Class Teacher'];
    const cmBody = cmRows.map(r => {
      const a1 = classAggStats(r.grade, exam1);
      if(!isCompare) return [r.grade, cmFmt(a1.avgTotal), cmFmt(a1.avgMean),
        a1.avgPts === null ? '—' : a1.avgPts.toFixed(2), a1.avgRubric, r.classTeacher];
      const a2 = classAggStats(r.grade, exam2);
      return [r.grade, cmFmt(a1.avgTotal), cmFmt(a1.avgMean),
        a1.avgPts === null ? '—' : a1.avgPts.toFixed(2), a1.avgRubric,
        cmFmt(a2.avgTotal), cmFmt(a2.avgMean),
        a2.avgPts === null ? '—' : a2.avgPts.toFixed(2), a2.avgRubric, r.classTeacher];
    });
    const cmCols = cmHead.length;
    const cmW = Math.floor((W - 8) / cmCols * 10) / 10;
    const cmStyles = {};
    for(let ci = 0; ci < cmCols; ci++)
      cmStyles[ci] = { cellWidth: cmW, fontSize: isCompare ? 7.5 : 9 };
    doc.autoTable({
      tableLineColor:[0,0,0], tableLineWidth:0.5,
      pageBreak:'avoid', startY:y, head:[cmHead], body:cmBody,
      theme:'grid',
      headStyles:{fillColor:[11,29,58],textColor:[242,199,68],fontStyle:'bold',fontSize:isCompare?7.5:9},
      styles:{fontSize:isCompare?7.5:9,cellPadding:1.8,lineColor:[0,0,0],lineWidth:0.5},
      columnStyles: cmStyles,
      didParseCell(data){
        if(data.section==='body'&&data.row.index%2===0) data.cell.styles.fillColor=[245,248,255];
      },
      margin:{left:4,right:4}
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  pdfFooter(doc);
  const sectionSuffix = (sectionF === 'lp' ? '_LowerPrimary' : sectionF === 'up' ? '_UpperJunior' : '');
  const fname = isCompare ? `Analysis_${exam1}_vs_${exam2}${sectionSuffix}.pdf` : `Analysis_${exam1}${sectionSuffix}.pdf`;
  doc.save(fname.replace(/\s+/g,'_'));
  toast('📄 PDF Exported!');
}

/* ═══════════════════════════════════════════════════════════
   TEACHER AVERAGE TERMLY PERFORMANCE
   ═══════════════════════════════════════════════════════════ */

/**
 * Build teacher performance data for one or two exams.
 *
 * Logic:
 *  - For each teacher, gather all (subject × class) assignments.
 *  - For each assignment, get the mean score from that exam.
 *  - Sum all mean scores found and divide by the number of subjects
 *    to get the teacher's average mean score (their "subject mean sum").
 *  - For a SINGLE exam: percentage = (sum of mean scores / (n × 100)) × 100
 *    i.e., average mean score expressed as a percentage.
 *  - For TWO exams: combine mean scores from both exams across all assignments,
 *    total possible = n subjects × 100, so percentage = (totalSum / (n × 100)) × 100.
 *  - Rank teachers by percentage descending.
 */
function buildTeacherPerformanceData(exam1, exam2) {
  const isCompare = !!exam2;
  const results = [];

  db.teachers.forEach(teacher => {
    if (!Array.isArray(teacher.assignments) || teacher.assignments.length === 0) return;

    let totalSum = 0;
    let totalCount = 0;
    const subjectBreakdown = []; // { subject, grades, mean1, mean2 }

    teacher.assignments.forEach(assign => {
      const subj = assign.subject;
      if (!Array.isArray(assign.classes)) return;

      assign.classes.forEach(grade => {
        const mean1 = getMeanScore(exam1, grade, subj);
        const mean2 = isCompare ? getMeanScore(exam2, grade, subj) : null;

        // Only include if we have at least one score
        if (mean1 === null && mean2 === null) return;

        let contribution = 0;
        if (!isCompare) {
          if (mean1 !== null) { contribution = mean1; totalSum += mean1; totalCount++; }
        } else {
          // For two exams: add both scores; each counts as one "slot" out of 100
          if (mean1 !== null) { totalSum += mean1; totalCount++; }
          if (mean2 !== null) { totalSum += mean2; totalCount++; }
          contribution = (mean1 !== null ? mean1 : 0) + (mean2 !== null ? mean2 : 0);
        }

        subjectBreakdown.push({
          subject: subj,
          grade,
          mean1,
          mean2,
          contribution
        });
      });
    });

    if (totalCount === 0) return;

    // Percentage = totalSum / (totalCount × 100) × 100 = totalSum / totalCount
    const percentage = totalSum / totalCount;

    results.push({
      name: fmtTeacher(teacher.name),
      id: teacher.id,
      classTeacher: teacher.classTeacher || '—',
      subjectCount: subjectBreakdown.length,
      totalSum: totalSum,
      totalCount: totalCount,
      percentage: percentage,
      breakdown: subjectBreakdown
    });
  });

  // Sort by percentage descending and assign ranks
  results.sort((a, b) => b.percentage - a.percentage);
  let rank = 1;
  results.forEach((r, i) => {
    if (i > 0 && r.percentage === results[i-1].percentage) {
      r.rank = results[i-1].rank; // tied rank
    } else {
      r.rank = rank;
    }
    rank++;
  });

  return results;
}

function exportTeacherPerformancePDF() {
  if (!_lastAnalysisMeta) return toast('⚠️ Please run an analysis first.', true);
  const { mode, exam1, exam2, gradeF } = _lastAnalysisMeta;
  const isCompare = mode === 'compare';

  const data = buildTeacherPerformanceData(exam1, isCompare ? exam2 : null);

  if (!data.length) return toast('⚠️ No teacher performance data found for the selected exam(s).', true);

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({ orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();

  const subtitle = isCompare
    ? `Comparing: ${exam1}  vs  ${exam2}${gradeF ? ' | Grade: '+gradeF : ''}`
    : `Exam: ${exam1}${gradeF ? ' | Grade: '+gradeF : ''}`;

  let y = pdfHeader(doc, 'TEACHER AVERAGE TERMLY PERFORMANCE', subtitle);

  // Summary note
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(100,100,100);
  const noteText = isCompare
    ? `Average % = (Sum of all subject mean scores across both exams) ÷ (No. of subject-class entries × 100) × 100`
    : `Average % = (Sum of all subject mean scores) ÷ (No. of subject-class entries × 100) × 100`;
  doc.text(noteText, 8, y); y += 6;

  // Table
  const head = isCompare
    ? ['Rank', 'Teacher', 'Class', 'Subjects\nTaught', 'Total Mean\nScore Sum', 'Entries', 'Average %']
    : ['Rank', 'Teacher', 'Class', 'Subjects\nTaught', 'Total Mean\nScore Sum', 'Entries', 'Average %'];

  const body = data.map(r => [
    r.rank,
    r.name,
    r.classTeacher || '—',
    r.subjectCount,
    r.totalSum.toFixed(2),
    r.totalCount,
    r.percentage.toFixed(2) + '%'
  ]);

  const fills = {
    1: [255, 215, 0],   // Gold
    2: [192, 192, 192], // Silver
    3: [205, 127, 50],  // Bronze
  };

  doc.autoTable({
    tableLineColor: [0,0,0], tableLineWidth: 0.4,
    startY: y,
    head: [head],
    body,
    theme: 'grid',
    headStyles: { fillColor: [11,29,58], textColor: [242,199,68], fontStyle: 'bold', fontSize: 8, cellPadding: 2 },
    styles: { fontSize: 8.5, cellPadding: 2, lineColor: [0,0,0], lineWidth: 0.4, halign: 'center' },
    columnStyles: {
      1: { halign: 'left', fontStyle: 'bold', fontSize: 8.5 },
      2: { halign: 'center' },
      6: { fontStyle: 'bold', fontSize: 9 }
    },
    didParseCell(d) {
      if (d.section === 'body') {
        const rank = data[d.row.index]?.rank;
        if (fills[rank]) {
          d.cell.styles.fillColor = fills[rank];
          d.cell.styles.fontStyle = 'bold';
        } else if (d.row.index % 2 === 0) {
          d.cell.styles.fillColor = [245, 248, 255];
        }
        // Color the percentage column
        if (d.column.index === 6) {
          const pct = data[d.row.index]?.percentage || 0;
          if (pct >= 70) d.cell.styles.textColor = [0, 140, 70];
          else if (pct >= 50) d.cell.styles.textColor = [180, 100, 0];
          else d.cell.styles.textColor = [200, 30, 30];
        }
      }
    },
    didDrawPage() { pdfFooter(doc); },
    margin: { left: 8, right: 8 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- Detailed breakdown per teacher ---
  if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 14; }

  doc.setFillColor(11,29,58); doc.rect(4, y, W-8, 7, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(242,199,68);
  doc.text('SUBJECT BREAKDOWN PER TEACHER', 8, y+4.8);
  y += 10;

  data.forEach((teacher, tIdx) => {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 14; }

    // Teacher header bar
    doc.setFillColor(255,220,220); doc.rect(4, y, W-8, 7, 'F');
    doc.setFillColor(242,199,68); doc.rect(4, y+6, W-8, 1, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(11,29,58);
    doc.text(`#${teacher.rank}  ${teacher.name}  —  Avg: ${teacher.percentage.toFixed(2)}%`, 8, y+4.8);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,100,130);
    doc.text(`Class Teacher: ${teacher.classTeacher}  |  ${teacher.subjectCount} subject-class entries`, W-8, y+4.8, {align:'right'});
    y += 10;

    const bHead = isCompare
      ? ['Subject', 'Grade', `${exam1} Mean`, `${exam2} Mean`, 'Combined']
      : ['Subject', 'Grade', `${exam1} Mean`];

    const bBody = teacher.breakdown.map(b => {
      const m1 = b.mean1 !== null ? b.mean1.toFixed(2) : '—';
      const m2 = b.mean2 !== null ? b.mean2.toFixed(2) : '—';
      return isCompare ? [subjFull(b.subject), b.grade, m1, m2, b.contribution.toFixed(2)] : [subjFull(b.subject), b.grade, m1];
    });

    doc.autoTable({
      tableLineColor: [0,0,0], tableLineWidth: 0.3,
      startY: y,
      head: [bHead],
      body: bBody,
      theme: 'grid',
      headStyles: { fillColor: [255,220,220], textColor: [0,0,0], fontStyle: 'bold', fontSize: 7.5, cellPadding: 1.5 },
      styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [0,0,0], lineWidth: 0.3, halign: 'center' },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' } },
      didParseCell(d) {
        if (d.section === 'body' && d.row.index % 2 === 0) {
          d.cell.styles.fillColor = [255,248,240];
        }
      },
      didDrawPage() { pdfFooter(doc); },
      margin: { left: 8, right: 8 }
    });

    y = doc.lastAutoTable.finalY + 6;
  });

  pdfFooter(doc);
  addPageNumbers(doc);

  const fname = isCompare
    ? `TeacherPerformance_${exam1}_vs_${exam2}.pdf`
    : `TeacherPerformance_${exam1}.pdf`;
  doc.save(fname.replace(/\s+/g,'_'));
  toast('📄 Teacher Performance PDF Exported!');
}

async function exportAnalysisWord() {
  if (!_lastAnalysisData || (!Object.keys(_lastAnalysisData.lp||{}).length && !Object.keys(_lastAnalysisData.up||{}).length)) return toast('No data to export', true);
  if (typeof docx === 'undefined') return toast('⚠️ Word library loading... try again in a moment', true);

  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          AlignmentType, WidthType, ShadingType, BorderStyle, HeadingLevel, PageBreak } = docx;

  const { mode, exam1, exam2, gradeF, sectionF } = _lastAnalysisMeta;
  const isCompare = mode === 'compare';
  const saOrientEl2 = document.getElementById('saOrientation');
  const saWordOrient = saOrientEl2 ? saOrientEl2.value : (isCompare ? 'landscape' : 'portrait');
  const isWordLandscape = saWordOrient === 'landscape';
  const border = { style: BorderStyle.SINGLE, size: 4, color: '2E75B6' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cellM = { top: 80, bottom: 80, left: 120, right: 120 };
  const headerFill = { fill: '0B1D3A', type: ShadingType.CLEAR };
  const altFill = { fill: 'EBF3FB', type: ShadingType.CLEAR };
  const summaryFill = { fill: 'D5E8F0', type: ShadingType.CLEAR };

  // True printable width per orientation (A4 minus 0.5in margins each side)
  const pageW = isWordLandscape ? 16838 : 11906;
  const contentW = pageW - 1440;
  const colW_grade = 1400;
  const colW_teacher = 3000;
  const colW_score = isCompare ? 2200 : Math.floor((contentW - colW_grade - colW_teacher));
  const colW_comment = isCompare ? 2200 : 0;
  const numScoreCols = isCompare ? 3 : 1;
  const remainW = pageW - colW_grade - colW_teacher - (numScoreCols * colW_score) - (isCompare ? colW_comment : 0);

  const makeHeaderCell = (text, w) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: headerFill, margins: cellM, borders,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: 'F2C744', size: 20 })] })]
  });
  const makeCell = (text, w, opts={}) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: opts.shading || undefined, margins: cellM, borders,
    children: [new Paragraph({ alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(text||'—'), bold: opts.bold||false, color: opts.color||'333333', size: 20 })] })]
  });

  const sections_content = [];

  const sectionLabelWord = sectionF === 'lp' ? ' — LOWER PRIMARY' : sectionF === 'up' ? ' — UPPER PRIMARY & JUNIOR' : '';
  // Title
  sections_content.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SANTAPRIS ACADEMY', bold: true, size: 32, color: '1E56C8' })] }));
  sections_content.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SUBJECT PERFORMANCE ANALYSIS' + sectionLabelWord, bold: true, size: 26, color: '333333' })] }));
  sections_content.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isCompare ? `Comparing: ${exam1}  vs  ${exam2}` : `Exam: ${exam1}`, size: 20, color: '555555' })] }));
  sections_content.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));

  // One subject per page in Word: a page break starts every subject table
  // (after the first), sized to the printable area in readable type.
  let _wordFirstSubject = true;
  function buildWordSection(sectionData, sectionTitle) {
    if (!Object.keys(sectionData).length) return;
    // Section heading
    sections_content.push(new Paragraph({
      children: [new TextRun({ text: sectionTitle, bold: true, size: 28, color: '0B6E4F' })],
      spacing: { before: 360, after: 200 }
    }));

    Object.entries(sectionData).forEach(([subj, rows]) => {
      if(!_wordFirstSubject && typeof PageBreak !== 'undefined')
        sections_content.push(new Paragraph({ children: [new PageBreak()] }));
      _wordFirstSubject = false;
      sections_content.push(new Paragraph({
        children: [new TextRun({ text: `Subject: ${subjFull(subj)}`, bold: true, size: 26, color: '1E56C8' })],
        spacing: { before: 280, after: 120 }
      }));

      const colWidths = isCompare
        ? [colW_grade, colW_score, colW_score, colW_comment, colW_teacher]
        : [colW_grade, colW_score, colW_teacher];

      const headerCells = isCompare
        ? [makeHeaderCell('Class', colW_grade), makeHeaderCell(exam1+'\nMean', colW_score), makeHeaderCell(exam2+'\nMean', colW_score), makeHeaderCell('Comment', colW_comment), makeHeaderCell('Class Teacher', colW_teacher)]
        : [makeHeaderCell('Class', colW_grade), makeHeaderCell(exam1+' — Mean Score', colW_score), makeHeaderCell('Class Teacher', colW_teacher)];

      const tableRows = [new TableRow({ children: headerCells, tableHeader: true })];

      rows.forEach((r, idx) => {
        const m1 = r.mean1 !== null ? r.mean1.toFixed(2) : '—';
        const m2 = r.mean2 !== null ? r.mean2.toFixed(2) : '—';
        const commentClean = r.comment.replace(/[✅⚠️➡️]/g,'').trim();
        const commentColor = commentClean.includes('Improved') ? '007A4D' : commentClean.includes('Dropped') ? 'C0392B' : '666666';
        const rowShading = idx%2===1 ? altFill : undefined;
        const cells = isCompare
          ? [makeCell(r.grade, colW_grade, {shading:rowShading,center:true,bold:true}), makeCell(m1, colW_score, {shading:rowShading,center:true,color:'1E56C8'}), makeCell(m2, colW_score, {shading:rowShading,center:true,color:'C9A82E',bold:true}), makeCell(commentClean, colW_comment, {shading:rowShading,center:true,color:commentColor,bold:true}), makeCell(r.teacher, colW_teacher, {shading:rowShading})]
          : [makeCell(r.grade, colW_grade, {shading:rowShading,center:true,bold:true}), makeCell(m1, colW_score, {shading:rowShading,center:true,color:'C9A82E',bold:true}), makeCell(r.teacher, colW_teacher, {shading:rowShading})];
        tableRows.push(new TableRow({ children: cells }));
      });

      if (rows.length > 1) {
        const validM1 = rows.filter(r=>r.mean1!==null);
        const validM2 = rows.filter(r=>r.mean2!==null);
        const o1 = validM1.length ? (validM1.reduce((s,r)=>s+r.mean1,0)/validM1.length).toFixed(2) : '—';
        const o2 = validM2.length ? (validM2.reduce((s,r)=>s+r.mean2,0)/validM2.length).toFixed(2) : '—';
        const sumCells = isCompare
          ? [makeCell('OVERALL', colW_grade, {shading:summaryFill,center:true,bold:true}), makeCell(o1, colW_score, {shading:summaryFill,center:true,color:'1E56C8',bold:true}), makeCell(o2, colW_score, {shading:summaryFill,center:true,color:'C9A82E',bold:true}), makeCell('', colW_comment, {shading:summaryFill}), makeCell('', colW_teacher, {shading:summaryFill})]
          : [makeCell('OVERALL', colW_grade, {shading:summaryFill,center:true,bold:true}), makeCell(o1, colW_score, {shading:summaryFill,center:true,color:'C9A82E',bold:true}), makeCell('', colW_teacher, {shading:summaryFill})];
        tableRows.push(new TableRow({ children: sumCells }));
      }

      const totalW = colWidths.reduce((a,b)=>a+b,0);
      sections_content.push(new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: colWidths, rows: tableRows }));
      sections_content.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
    });
  }

  buildWordSection(_lastAnalysisData.lp||{}, 'LOWER PRIMARY SCHOOL');
  buildWordSection(_lastAnalysisData.up||{}, 'UPPER PRIMARY & JUNIOR SCHOOL');

  // ── Class Mean Scores table ──
  let cmGradesW = [];
  if(sectionF==='lp') cmGradesW=LP_GRADES;
  else if(sectionF==='up') cmGradesW=GRADES;
  else cmGradesW=[...LP_GRADES,...GRADES];
  if(gradeF) cmGradesW=cmGradesW.filter(g=>g===gradeF);
  const cmRowsW = getClassMeanRows(cmGradesW, exam1, isCompare?exam2:null);
  if(cmRowsW.length){
    sections_content.push(new Paragraph({
      children:[new TextRun({text:'CLASS MEAN SCORES SUMMARY',bold:true,size:26,color:'0B1D3A'})],
      spacing:{before:400,after:200}
    }));
    const _fmt1 = v => (v === null || v === undefined) ? '—' : v.toFixed(2);
    const _cmk = (r, ex) => classAggStats(r.grade, ex);
    const cmHeadW = isCompare
      ? ['Class', `${exam1} Avg Total`, `${exam1} Avg Mean`, `${exam1} Avg Pts`, `${exam1} Avg Rubric`,
         `${exam2} Avg Total`, `${exam2} Avg Mean`, `${exam2} Avg Pts`, `${exam2} Avg Rubric`, 'Class Teacher']
      : ['Class', 'Avg Total Score', 'Avg Mean Score', 'Avg Points', 'Avg Rubric', 'Class Teacher'];
    const cmColW_grade = 1100, cmColW_teacher = 2600;
    const cmColW_num = Math.floor((contentW - cmColW_grade - cmColW_teacher) / (cmHeadW.length - 2));
    const cmColWidthsW = [cmColW_grade,
      ...Array.from({ length: cmHeadW.length - 2 }, () => cmColW_num), cmColW_teacher];
    const cmHeaderCellsW = cmHeadW.map((h, i) => makeHeaderCell(h,
      i === 0 ? cmColW_grade : (i === cmHeadW.length - 1 ? cmColW_teacher : cmColW_num)));
    const cmTableRowsW = [new TableRow({ children: cmHeaderCellsW, tableHeader: true })];
    cmRowsW.forEach((r, idx) => {
      const a1 = _cmk(r, exam1);
      const rowShading = idx % 2 === 1 ? altFill : undefined;
      const cells1 = [_fmt1(a1.avgTotal), _fmt1(a1.avgMean),
        a1.avgPts === null ? '—' : a1.avgPts.toFixed(2), a1.avgRubric]
        .map(x => makeCell(x, cmColW_num, { shading: rowShading, center: true }));
      let cells;
      if(!isCompare){
        cells = [makeCell(r.grade, cmColW_grade, { shading: rowShading, center: true, bold: true }),
          ...cells1, makeCell(r.classTeacher, cmColW_teacher, { shading: rowShading })];
      } else {
        const a2 = _cmk(r, exam2);
        const cells2 = [_fmt1(a2.avgTotal), _fmt1(a2.avgMean),
          a2.avgPts === null ? '—' : a2.avgPts.toFixed(2), a2.avgRubric]
          .map(x => makeCell(x, cmColW_num, { shading: rowShading, center: true }));
        cells = [makeCell(r.grade, cmColW_grade, { shading: rowShading, center: true, bold: true }),
          ...cells1, ...cells2, makeCell(r.classTeacher, cmColW_teacher, { shading: rowShading })];
      }
      cmTableRowsW.push(new TableRow({ children: cells }));
    });
    sections_content.push(new Table({ width: { size: cmColWidthsW.reduce((a,b) => a+b, 0), type: WidthType.DXA }, columnWidths: cmColWidthsW, rows: cmTableRowsW }));
    sections_content.push(new Paragraph({ children: [new TextRun({ text: ' ' })] }));
  }

  // Footer
  sections_content.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, size: 16, color: '888888', italics: true })] }));

  const docFile = new Document({
    sections: [{
      properties: { page: { size: { width: isWordLandscape ? 16838 : 11906, height: isWordLandscape ? 11906 : 16838 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: sections_content
    }]
  });

  const blob = await Packer.toBlob(docFile);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url;
  const sectionSuffixW = (sectionF === 'lp' ? '_LowerPrimary' : sectionF === 'up' ? '_UpperJunior' : '');
  const fname = isCompare ? `Analysis_${exam1}_vs_${exam2}${sectionSuffixW}.docx` : `Analysis_${exam1}${sectionSuffixW}.docx`;
  a.download = fname.replace(/\s+/g,'_');
  a.click(); URL.revokeObjectURL(url);
  toast('📝 Word document exported!');
}

function exportAnalysisExcel() {
  if (!_lastAnalysisData || (!Object.keys(_lastAnalysisData.lp||{}).length && !Object.keys(_lastAnalysisData.up||{}).length)) return toast('No data to export', true);
  ensureXLSX(function(){
  const { mode, exam1, exam2, gradeF, sectionF } = _lastAnalysisMeta;
  const isCompare = mode === 'compare';
  const _xlOrientEl = document.getElementById('saOrientation');
  const _xlOrient = (_xlOrientEl && _xlOrientEl.value) || (isCompare ? 'landscape' : 'portrait');
  const wb = XLSX.utils.book_new();

  function addSectionSheets(sectionData, sectionPrefix) {
    Object.entries(sectionData).forEach(([subj, rows]) => {
      const headers = isCompare
        ? ['Class', `${exam1} Mean Score`, `${exam2} Mean Score`, 'Comment', 'Class Teacher']
        : ['Class', `${exam1} Mean Score`, 'Class Teacher'];

      const wsData = [
        [`SANTAPRIS ACADEMY — ${sectionPrefix}`],
        [isCompare ? `SUBJECT ANALYSIS: ${exam1} vs ${exam2}` : `SUBJECT ANALYSIS: ${exam1}`],
        [`Subject: ${subjFull(subj)}`],
        [],
        headers
      ];

      rows.forEach(r => {
        const m1 = r.mean1 !== null ? parseFloat(r.mean1.toFixed(2)) : '';
        const m2 = r.mean2 !== null ? parseFloat(r.mean2.toFixed(2)) : '';
        const commentClean = r.comment.replace(/[✅⚠️➡️]/g,'').trim();
        wsData.push(isCompare ? [r.grade, m1, m2, commentClean, r.teacher] : [r.grade, m1, r.teacher]);
      });

      if (rows.length > 1) {
        const validM1 = rows.filter(r=>r.mean1!==null);
        const validM2 = rows.filter(r=>r.mean2!==null);
        const o1 = validM1.length ? parseFloat((validM1.reduce((s,r)=>s+r.mean1,0)/validM1.length).toFixed(2)) : '';
        const o2 = validM2.length ? parseFloat((validM2.reduce((s,r)=>s+r.mean2,0)/validM2.length).toFixed(2)) : '';
        wsData.push(isCompare ? ['OVERALL', o1, o2, '', ''] : ['OVERALL', o1, '']);
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = isCompare
        ? [{wch:12},{wch:24},{wch:24},{wch:22},{wch:34}]
        : [{wch:12},{wch:30},{wch:34}];
      ws['!pageSetup'] = { orientation: _xlOrient, paperSize: 9, fitToWidth: 1, fitToHeight: 1 };

      const sheetName = (sectionPrefix.charAt(0)+subj).replace('/','-').substring(0,31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
  }

  addSectionSheets(_lastAnalysisData.lp||{}, 'LOWER PRIMARY');
  addSectionSheets(_lastAnalysisData.up||{}, 'UPPER PRIMARY & JUNIOR');

  // ── Class Mean Scores sheet ──
  let cmGradesXL = [];
  if(sectionF==='lp') cmGradesXL=LP_GRADES;
  else if(sectionF==='up') cmGradesXL=GRADES;
  else cmGradesXL=[...LP_GRADES,...GRADES];
  if(gradeF) cmGradesXL=cmGradesXL.filter(g=>g===gradeF);
  const cmRowsXL = getClassMeanRows(cmGradesXL, exam1, isCompare?exam2:null);
  if(cmRowsXL.length){
    const _xfmt = v => (v === null || v === undefined) ? '' : parseFloat(v.toFixed(2));
    const cmHeaders = isCompare
      ?['Class', `${exam1} Avg Total`, `${exam1} Avg Mean`, `${exam1} Avg Pts`, `${exam1} Avg Rubric`,
        `${exam2} Avg Total`, `${exam2} Avg Mean`, `${exam2} Avg Pts`, `${exam2} Avg Rubric`, 'Class Teacher']
      :['Class', 'Avg Total Score', 'Avg Mean Score', 'Avg Points', 'Avg Rubric', 'Class Teacher'];
    const cmAOA = [
      ['SANTAPRIS ACADEMY — CLASS MEAN SCORES SUMMARY'],
      [isCompare?`Comparing: ${exam1}  vs  ${exam2}`:`Exam: ${exam1}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      cmHeaders,
      ...cmRowsXL.map(r => {
        const a1 = classAggStats(r.grade, exam1);
        const row1 = [_xfmt(a1.avgTotal), _xfmt(a1.avgMean), _xfmt(a1.avgPts), a1.avgRubric];
        if(!isCompare) return [r.grade, ...row1, r.classTeacher];
        const a2 = classAggStats(r.grade, exam2);
        const row2 = [_xfmt(a2.avgTotal), _xfmt(a2.avgMean), _xfmt(a2.avgPts), a2.avgRubric];
        return [r.grade, ...row1, ...row2, r.classTeacher];
      })
    ];
    const cmWs = XLSX.utils.aoa_to_sheet(cmAOA);
    cmWs['!cols'] = isCompare
      ? [{wch:10},{wch:16},{wch:16},{wch:14},{wch:26},{wch:16},{wch:16},{wch:14},{wch:26},{wch:20}]
      : [{wch:10},{wch:18},{wch:18},{wch:14},{wch:28},{wch:20}];
    cmWs['!pageSetup'] = { orientation: _xlOrient, paperSize: 9, fitToWidth: 1, fitToHeight: 1 };
    XLSX.utils.book_append_sheet(cmWs, cmWs, 'Class Means');
  }

  // Summary sheet
  const allData = {...(_lastAnalysisData.lp||{}), ...(_lastAnalysisData.up||{})};
  const sectionLabelXL = sectionF === 'lp' ? 'LOWER PRIMARY' : sectionF === 'up' ? 'UPPER PRIMARY & JUNIOR' : 'ALL SECTIONS';
  const summaryData = [['SANTAPRIS ACADEMY — SUBJECT PERFORMANCE ANALYSIS SUMMARY'], [''], ['School: Santapris Academy'], [`Section: ${sectionLabelXL}`], [isCompare ? `Comparing: ${exam1}  vs  ${exam2}` : `Exam: ${exam1}`], [`Generated: ${new Date().toLocaleDateString()}`], [''], ['Section', 'Subject', 'Classes Analysed', isCompare ? `${exam1} Overall Mean` : 'Overall Mean', isCompare ? `${exam2} Overall Mean` : '']];
  [['Lower Primary', _lastAnalysisData.lp||{}], ['Upper Primary & Junior', _lastAnalysisData.up||{}]].forEach(([sec, dat]) => {
    Object.entries(dat).forEach(([subj, rows]) => {
      const validM1 = rows.filter(r=>r.mean1!==null);
      const validM2 = rows.filter(r=>r.mean2!==null);
      const o1 = validM1.length ? parseFloat((validM1.reduce((s,r)=>s+r.mean1,0)/validM1.length).toFixed(2)) : '';
      const o2 = validM2.length ? parseFloat((validM2.reduce((s,r)=>s+r.mean2,0)/validM2.length).toFixed(2)) : '';
      summaryData.push([sec, subjFull(subj), rows.length, o1, isCompare ? o2 : '']);
    });
  });
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{wch:24},{wch:32},{wch:18},{wch:25},{wch:25}];
  summaryWs['!pageSetup'] = { orientation: _xlOrient, paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  const sectionSuffixXL = (sectionF === 'lp' ? '_LowerPrimary' : sectionF === 'up' ? '_UpperJunior' : '');
  const fname = isCompare ? `Analysis_${exam1}_vs_${exam2}${sectionSuffixXL}.xlsx` : `Analysis_${exam1}${sectionSuffixXL}.xlsx`;
  XLSX.writeFile(wb, fname.replace(/\s+/g,'_'));
  toast('📊 Excel exported!');
  }); // end ensureXLSX
}

/* ═══════════════════════════════════════════════════════════
   SAMPLE DATA — For testing. All records tagged with _sample:true.
   loadSampleData() injects; deleteSampleData() removes only tagged records.
   ═══════════════════════════════════════════════════════════ */

const SAMPLE_TAG = '__sample__';

/* ═══════════════════════════════════════════════════════════
   EXCEL EXAM IMPORT — Import scores from spreadsheet
   ═══════════════════════════════════════════════════════════ */

let _exImportData = [], _exImportHeaders = [];

function toggleExamExcelImport(){
  const card = document.getElementById('ex_excelImportCard');
  if(!card) return;
  const isHidden = card.style.display === 'none' || card.style.display === '';
  card.style.display = isHidden ? 'block' : 'none';
  if(isHidden) resetExamImport();
}

function downloadExamImportTemplate(){
  ensureXLSX(function(){
  const grade = document.getElementById('ex_gradeFilter').value;
  const baseSubjects = grade ? getSubjects(grade) : ALL_SUBJ;
  const examName = document.getElementById('ex_examName').value.trim() || 'Exam Name';

  // Build expanded column list: replace ENG→GRA,COMP and KIS→LUG,INS
  const templateCols = [];
  baseSubjects.forEach(s => {
    if(s === 'ENG'){ templateCols.push('GRA','COMP'); }
    else if(s === 'KIS'){ templateCols.push('LUG','INS'); }
    else { templateCols.push(s); }
  });

  const headers  = ['Adm No','Full Name', ...templateCols];
  const notes    = ['','', ...templateCols.map(c=>{
    if(c==='GRA')  return 'English Grammar (0-100)';
    if(c==='COMP') return 'English Composition (0-100)';
    if(c==='LUG')  return 'Kiswahili Lugha (0-100)';
    if(c==='INS')  return 'Kiswahili Insha (0-100)';
    return `${c} mark (0-100)`;
  })];
  const example1 = ['SA0001','John Doe Mwangi',   ...templateCols.map(()=>'')];
  const example2 = ['SA0002','Jane Achieng Were',  ...templateCols.map(()=>'')];

  const ws = XLSX.utils.aoa_to_sheet([headers, notes, example1, example2]);
  ws['!cols'] = [{ wch:12 }, { wch:28 }, ...templateCols.map(()=>({ wch:14 }))];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scores');
  const fname = `Exam_Scores_Template_${(grade||'Grade')}.xlsx`;
  _xlsxDownload(wb, fname.replace(/\s+/g,'_'));
  toast('📥 Exam score template downloaded!');
  }); // end ensureXLSX
}

function handleExamImportFile(file){
  if(!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  document.getElementById('exImportFileName').textContent = file.name;
  const reader = new FileReader();
  if(ext === 'csv'){
    reader.onload = e => {
      const lines = e.target.result.split('\n').filter(l=>l.trim());
      _exImportHeaders = lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''));
      _exImportData = lines.slice(1).map(l => l.split(',').map(c=>c.trim().replace(/^"|"$/g,'')));
      showExamImportPreview();
    };
    reader.readAsText(file);
  } else if(['xlsx','xls'].includes(ext)){
    ensureXLSX(function(){
    const reader2 = new FileReader();
    reader2.onload = e => {
      const wb = XLSX.read(e.target.result,{type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      if(!raw.length){ toast('Empty file',true); return; }
      _exImportHeaders = raw[0].map(h=>String(h).trim());
      _exImportData = raw.slice(1).filter(r=>r.some(c=>String(c).trim()));
      showExamImportPreview();
    };
    reader2.readAsArrayBuffer(file);
    }); // end ensureXLSX
  } else {
    toast('Unsupported format — use .xlsx, .xls, or .csv',true);
  }
}

function showExamImportPreview(){
  const preview = _exImportData.slice(0,5);
  const tbl = document.getElementById('exImportPreviewTable');
  const headRow = '<tr>' + _exImportHeaders.map(h=>`<th style="padding:4px 8px;background:var(--navy-mid);color:var(--gold);font-size:10px">${h}</th>`).join('') + '</tr>';
  const bodyRows = preview.map(row =>
    '<tr>' + _exImportHeaders.map((_,i)=>`<td style="padding:3px 7px;font-size:11px;border-bottom:1px solid var(--border)">${row[i]||''}</td>`).join('') + '</tr>'
  ).join('');
  tbl.innerHTML = headRow + bodyRows;
  document.getElementById('exImportPreview').style.display = '';
  document.getElementById('exImportMsg').textContent = `${_exImportData.length} data rows detected`;
}

function resetExamImport(){
  _exImportData = []; _exImportHeaders = [];
  document.getElementById('exImportFileInput').value = '';
  document.getElementById('exImportFileName').textContent = '';
  document.getElementById('exImportPreview').style.display = 'none';
  document.getElementById('exImportMsg').textContent = '';
}

function executeExamImport(){
  const grade    = document.getElementById('ex_gradeFilter').value;
  const examName = document.getElementById('ex_examName').value.trim();
  const term     = document.getElementById('ex_term').value;
  const year     = parseInt(document.getElementById('ex_year').value);

  if(!grade)    return toast('Select a grade in Exam Setup first',true);
  if(!examName) return toast('Enter an exam name in Exam Setup first',true);
  if(!_exImportData.length) return toast('No data to import',true);

  const subjects = getSubjects(grade); // e.g. [MATHS,ENG,KIS,SCIE,...]
  const hdrs = _exImportHeaders.map(h=>h.toLowerCase().trim());

  // Auto-detect Adm No and Name columns
  const admCol  = hdrs.findIndex(h=>['adm no','admno','adm','admission','admission no'].some(k=>h.includes(k)));
  const nameCol = hdrs.findIndex(h=>['full name','fullname','name','student name','pupil'].some(k=>h.includes(k)));

  // Map each column header → index, including GRA, COMP, LUG, INS + grade-9 SCIE papers
  const colMap = {};
  const allCols = [...subjects, 'GRA','COMP','LUG','INS','SCIE PP1','SCIE PP2'];
  allCols.forEach(s => {
    const key = s.toLowerCase().replace('/','');
    const idx = hdrs.findIndex(h => h === key || h.replace(/[^a-z0-9]/g,'') === key);
    if(idx >= 0) colMap[s] = idx;
  });

  // Must have at least some subject or sub-score columns
  const hasSomeCol = subjects.some(s=>colMap[s]!==undefined) ||
                     ['GRA','COMP','LUG','INS','SCIE PP1','SCIE PP2'].some(s=>colMap[s]!==undefined);
  if(!hasSomeCol) return toast('No subject columns found — check template headers (MATHS, GRA, COMP, LUG, INS…)',true);

  let imported=0, skipped=0, errors=[];

  _exImportData.forEach((row, idx) => {
    const rowNum = idx+2;
    const getVal = col => {
      if(col===undefined) return null;
      const raw = String(row[col]||'').trim();
      if(raw===''||isNaN(raw)) return null;
      const v = parseFloat(raw);
      return v >= 0 ? v : null;
    };

    // ── Match student ───────────────────────────────────────────────
    // Priority: Full Name first (Steps 1-5), then Adm No as fallback (Step 6).
    // This ensures "JOHN KAMAU" in the sheet always maps to the right student
    // even if Adm Nos differ between systems.
    let student = null;
    const gradeStudents = db.students.filter(s => s.grade === grade);

    // ── NAME-BASED MATCHING (Steps 1-5) ──────────────────────────
    if(nameCol >= 0 && row[nameCol]){
      const nm    = String(row[nameCol]).trim();
      const nmLow = nm.toLowerCase().replace(/\s+/g, ' ');

      // Step 1: exact full name match (case-insensitive, whitespace-normalised)
      student = gradeStudents.find(s =>
        (s.fullName || '').toLowerCase().replace(/\s+/g, ' ') === nmLow
      );

      if(!student){
        // Step 2: stored full name contains the Excel name
        // e.g. stored "LEON AUMA GEMA" ← Excel "LEON GEMA"
        student = gradeStudents.find(s =>
          (s.fullName || '').toLowerCase().replace(/\s+/g, ' ').includes(nmLow)
        );
      }

      if(!student){
        // Step 3: Excel name contains the stored full name
        // e.g. Excel "MARY JANE ACHIENG WERE" ← stored "MARY ACHIENG"
        student = gradeStudents.find(s =>
          nmLow.includes((s.fullName || '').toLowerCase().replace(/\s+/g, ' '))
        );
      }

      if(!student){
        // Step 4: match by first token (first name) + last token (surname)
        // Handles "LEON GEMA" matching stored "LEON AUMA GEMA"
        const tokens = nmLow.split(/\s+/).filter(Boolean);
        if(tokens.length >= 2){
          const first = tokens[0];
          const last  = tokens[tokens.length - 1];
          const candidates = gradeStudents.filter(s => {
            const sParts = (s.fullName || '').toLowerCase().replace(/\s+/g, ' ').split(/\s+/);
            return sParts[0] === first && sParts[sParts.length - 1] === last;
          });
          if(candidates.length === 1) student = candidates[0]; // unique first+last match
          // if multiple share same first+last → fall through to Step 5
        }
      }

      if(!student){
        // Step 5: first-name-only match — safe ONLY when exactly 1 student has that first name
        const firstToken = nmLow.split(/\s+/)[0];
        const firstMatches = gradeStudents.filter(s =>
          (s.fullName || '').toLowerCase().split(/\s+/)[0] === firstToken
        );
        if(firstMatches.length === 1){
          student = firstMatches[0];
        } else if(firstMatches.length > 1){
          // Ambiguous — report and skip rather than guess
          errors.push(`Row ${rowNum}: Ambiguous name "${nm}" — matches ${firstMatches.map(s => s.fullName).join(', ')}. Use full name or Adm No.`);
          skipped++; return;
        }
      }
    }

    // ── ADMISSION NUMBER FALLBACK (Step 6) ───────────────────────
    // Only used when name matching above found nothing.
    if(!student && admCol >= 0 && row[admCol]){
      const adm = String(row[admCol]).trim();
      if(adm) student = gradeStudents.find(s => s.admNo === adm);
    }

    if(!student){
      const label = nameCol >= 0 ? String(row[nameCol] || '').trim() : '(no name column)';
      errors.push(`Row ${rowNum}: No matching student for "${label}"`);
      skipped++; return;
    }

    const scores={}, rubrics={}, subScores={};
    let total=0;
    const engSubs = getEngSubs(grade);
    const kisSubs = getKisSubs(grade);
    const scieSubs = getScieSubs(grade);

    subjects.forEach(s => {
      if(s === 'ENG') {
        // Read grade-appropriate sub-components; compute ENG = sum
        const v0 = getVal(colMap[engSubs[0]]);
        const v1 = getVal(colMap[engSubs[1]]);
        // Backward compat: also read legacy GRA/COMP if new columns not found
        const legacy0 = (v0 === null) ? getVal(colMap['GRA']) : null;
        const legacy1 = (v1 === null) ? getVal(colMap['COMP']) : null;
        const final0 = v0 !== null ? v0 : legacy0;
        const final1 = v1 !== null ? v1 : legacy1;
        if(final0 !== null) subScores[engSubs[0]] = final0;
        if(final1 !== null) subScores[engSubs[1]] = final1;
        // Also preserve legacy keys for data consistency
        if(final0 !== null) subScores['GRA'] = final0;
        if(final1 !== null) subScores['COMP'] = final1;
        if(final0 !== null || final1 !== null){
          const engVal = (final0||0) + (final1||0);
          scores['ENG'] = engVal;
          rubrics['ENG'] = getRubric(engVal, grade, examName);
          total += engVal;
        } else if(colMap['ENG'] !== undefined) {
          const v = getVal(colMap['ENG']);
          if(v !== null){ scores['ENG']=v; rubrics['ENG']=getRubric(v, grade, examName); total+=v; }
        }
      } else if(s === 'SCIE' && scieSubs.length === 2) {
        // Grade 9: SCIE PP1 + SCIE PP2 (no legacy keys)
        const v0 = getVal(colMap[scieSubs[0]]);
        const v1 = getVal(colMap[scieSubs[1]]);
        if(v0 !== null) subScores[scieSubs[0]] = v0;
        if(v1 !== null) subScores[scieSubs[1]] = v1;
        if(v0 !== null || v1 !== null){
          const scieVal = (v0||0) + (v1||0);
          scores['SCIE'] = scieVal;
          rubrics['SCIE'] = getRubric(scieVal, grade, examName);
          total += scieVal;
        } else if(colMap['SCIE'] !== undefined) {
          const v = getVal(colMap['SCIE']);
          if(v !== null){ scores['SCIE']=v; rubrics['SCIE']=getRubric(v, grade, examName); total+=v; }
        }
      } else if(s === 'KIS') {
        // Read grade-appropriate sub-components; compute KIS = sum
        const v0 = getVal(colMap[kisSubs[0]]);
        const v1 = getVal(colMap[kisSubs[1]]);
        // Backward compat: also read legacy LUG/INS if new columns not found
        const legacy0 = (v0 === null) ? getVal(colMap['LUG']) : null;
        const legacy1 = (v1 === null) ? getVal(colMap['INS']) : null;
        const final0 = v0 !== null ? v0 : legacy0;
        const final1 = v1 !== null ? v1 : legacy1;
        if(final0 !== null) subScores[kisSubs[0]] = final0;
        if(final1 !== null) subScores[kisSubs[1]] = final1;
        // Also preserve legacy keys for data consistency
        if(final0 !== null) subScores['LUG'] = final0;
        if(final1 !== null) subScores['INS'] = final1;
        if(final0 !== null || final1 !== null){
          const kisVal = (final0||0) + (final1||0);
          scores['KIS'] = kisVal;
          rubrics['KIS'] = getRubric(kisVal, grade, examName);
          total += kisVal;
        } else if(colMap['KIS'] !== undefined) {
          const v = getVal(colMap['KIS']);
          if(v !== null){ scores['KIS']=v; rubrics['KIS']=getRubric(v, grade, examName); total+=v; }
        }
      } else {
        // Normal subject
        const v = getVal(colMap[s]);
        if(v !== null){ scores[s]=v; rubrics[s]=getRubric(v, grade, examName); total+=v; }
      }
    });

    if(!Object.keys(scores).length){ errors.push(`Row ${rowNum}: No valid scores`); skipped++; return; }

    // Raw snapshot (as-typed file values, pre-conversion) for the raw store.
    var _rawS = Object.assign({}, scores), _rawSub = Object.assign({}, subScores);
    // Score conversion: raw file marks -> % when constants set for grade+exam.
    // Every value here is fresh from the file, so wholesale conversion is safe.
    var _convRec = (typeof convApplyToRecord==='function')
      ? convApplyToRecord(grade, examName, {scores:scores, rubrics:rubrics, subScores:subScores, total:total})
      : null;
    if(_convRec) total = _convRec.total;

    // Upsert exam record — MERGE, never replace: the file may carry only some
    // subjects, and wiping the rest would erase already-submitted scores.
    // File values win per subject; previously stored (converted) values stay.
    const existIdx = db.exams.findIndex(e=>e.admNo===student.admNo&&(e.examName||'')===examName&&e.grade===grade);
    const prevImp = existIdx>=0 ? db.exams[existIdx] : null;
    const mScores = Object.assign({}, (prevImp&&prevImp.scores)||{}, scores);
    const mRubrics = Object.assign({}, (prevImp&&prevImp.rubrics)||{}, rubrics);
    const mSubs = Object.assign({}, (prevImp&&prevImp.subScores)||{}, subScores);
    let mTotal = 0;
    Object.keys(mScores).forEach(s => { if(typeof mScores[s]==='number') mTotal+=mScores[s]; });
    const rec = {admNo:student.admNo, name:student.fullName, grade, term, year, examName, examCode:examCode(examName,term,year), scores:mScores, rubrics:mRubrics, subScores:mSubs, total:mTotal};
    if(existIdx>=0) db.exams[existIdx]=rec;
    else db.exams.push(rec);
    // Newly-appearing subjects are explicit re-add intent (clears tombs).
    if(prevImp && prevImp.scores){
      const addImp = Object.keys(scores).filter(s => prevImp.scores[s]===undefined);
      if(addImp.length && typeof _stageForceSubjects==='function'){
        const fm = {};
        fm[_ssExamKey(student.admNo,examName,term,year)] = addImp;
        _stageForceSubjects(fm);
      }
    }
    // Mirror the as-typed raw row (imports replace wholesale, so raw replaces too).
    if(typeof upsertRawRow==='function')
      upsertRawRow({admNo:student.admNo, name:student.fullName, grade, examName,
        examCode:examCode(examName,term,year), term, year, scores:_rawS, subScores:_rawSub});
    imported++;
  });

  recalcRanks(); saveDB();
  const msgEl = document.getElementById('exImportMsg');
  msgEl.style.color = skipped ? 'var(--gold)' : 'var(--emerald)';
  msgEl.textContent = `✅ ${imported} imported${skipped?', '+skipped+' skipped':''}`;
  if(errors.length) toast(errors[0],true);
  else toast('📥 Exam scores imported!');
  renderClassEntryGrid();
  if(imported>0) resetExamImport();
}

/* ═══════════════════════════════════════════════════════════
   CLASS MEAN SCORES MODAL
   ═══════════════════════════════════════════════════════════ */

function openMeanScoresModal(){
  closeModal();
  document.getElementById('meanScoresModal').style.display='';
  renderMeanScoreInputs();
  renderSavedMeanScores();
}

function closeMeanScoresModal(){
  document.getElementById('meanScoresModal').style.display='none';
}

function renderMeanScoreInputs(){
  const grade = document.getElementById('ms_grade').value;
  const wrap  = document.getElementById('ms_subjectInputs');
  const grid  = document.getElementById('ms_subjectGrid');
  if(!grade){ wrap.style.display='none'; return; }
  wrap.style.display='';
  const subjects = getSubjects(grade);
  grid.innerHTML = subjects.map(s=>{
    const teacher = getSubjectTeacher(s,grade);
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-weight:700;color:var(--sky);font-size:13px">${subjFull(s)}</span>
        <span style="font-size:10px;color:var(--text-muted)">${teacher}</span>
      </div>
      <input type="number" id="ms_score_${s}" min="0" max="200" placeholder="Mean score"
             style="width:100%;padding:6px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:13px;font-weight:700">
    </div>`;
  }).join('');
  // Pre-fill if existing entry found
  const examName = document.getElementById('ms_examName').value.trim();
  const avgInp = document.getElementById('ms_avgClassMean');
  const infoEl = document.getElementById('ms_autoCalcInfo');
  if(avgInp) avgInp.value='';
  if(infoEl) infoEl.textContent='';
  if(examName){
    const existing = (db.meanScores||[]).find(m=>m.examName===examName&&m.grade===grade);
    if(existing && existing.scores){
      subjects.forEach(s=>{
        const inp = document.getElementById('ms_score_'+s);
        if(inp && existing.scores[s]!==undefined) inp.value=existing.scores[s];
      });
      if(avgInp && existing.avgClassMean!==undefined && existing.avgClassMean!==null)
        avgInp.value=existing.avgClassMean;
    }
    // If no manual avgClassMean, check db.exams for auto-calc hint
    if(avgInp && !avgInp.value){
      const records = db.exams.filter(e=>e.examName===examName&&e.grade===grade&&e.total!==undefined);
      if(records.length){
        if(infoEl) infoEl.textContent=`${records.length} learner record(s) found — click Auto-Calculate to fill (avg of total marks)`;
      }
    }
  }
}

/* Auto-calculate class mean from student exam records (average of all learners' totals) */
function autoCalcClassMean(){
  const grade = document.getElementById('ms_grade').value;
  if(!grade) return;
  const avgInp = document.getElementById('ms_avgClassMean');
  const infoEl = document.getElementById('ms_autoCalcInfo');
  const examName = document.getElementById('ms_examName').value.trim();
  // Primary: compute from db.exams — average of each student's total marks
  if(examName){
    const records = db.exams.filter(e=>e.examName===examName&&e.grade===grade&&e.total!==undefined);
    if(records.length){
      const totalSum = records.reduce((s,e)=>s+(e.total||0),0);
      const classMean = totalSum / records.length;
      if(avgInp) avgInp.value = classMean.toFixed(2);
      if(infoEl) infoEl.textContent = `Calculated from ${records.length} learner(s) — average of total marks`;
      return;
    }
  }
  if(infoEl) infoEl.textContent = 'No student records found for this exam/grade. Enter the class mean manually.';
}

function saveMeanScores(){
  const examName = document.getElementById('ms_examName').value.trim();
  const grade    = document.getElementById('ms_grade').value;
  const term     = document.getElementById('ms_term').value;
  const year     = parseInt(document.getElementById('ms_year').value);
  if(!examName) return toast('Enter exam name',true);
  if(!grade)    return toast('Select a grade',true);

  const subjects = getSubjects(grade);
  const scores   = {};
  subjects.forEach(s=>{
    const inp = document.getElementById('ms_score_'+s);
    if(!inp) return;
    const v = parseFloat(inp.value);
    if(!isNaN(v) && v>=0) scores[s]=v;
  });
  if(!Object.keys(scores).length) return toast('Enter at least one mean score',true);

  // Collect avgClassMean
  const avgInp = document.getElementById('ms_avgClassMean');
  let avgClassMean = null;
  if(avgInp && avgInp.value!==''){
    const av = parseFloat(avgInp.value);
    if(!isNaN(av) && av>=0) avgClassMean = av;
  }
  // If not manually entered, auto-compute from exam records — average of students' total marks
  if(avgClassMean===null){
    const records = db.exams.filter(e=>e.examName===examName&&e.grade===grade&&e.total!==undefined);
    if(records.length){
      avgClassMean = parseFloat((records.reduce((s,e)=>s+(e.total||0),0)/records.length).toFixed(2));
    }
  }

  if(!db.meanScores) db.meanScores=[];
  const idx = db.meanScores.findIndex(m=>m.examName===examName&&m.grade===grade);
  const entry = {examName,grade,term,year,scores,avgClassMean,updatedAt:new Date().toLocaleDateString('en-GB')};
  if(idx>=0) db.meanScores[idx]=entry;
  else db.meanScores.push(entry);

  saveDB(); updateCounts();
  renderSavedMeanScores();
  // Clear inputs
  subjects.forEach(s=>{ const inp=document.getElementById('ms_score_'+s); if(inp) inp.value=''; });
  if(avgInp) avgInp.value='';
  const infoEl=document.getElementById('ms_autoCalcInfo'); if(infoEl) infoEl.textContent='';
  toast('✅ Mean scores saved!');
}

function renderSavedMeanScores(){
  if(!db.meanScores||!db.meanScores.length){
    document.getElementById('ms_tableHead').innerHTML='<th style="padding:8px 12px;color:var(--text-muted);font-size:12px" colspan="20">No mean scores saved yet</th>';
    document.getElementById('ms_tableBody').innerHTML='';
    return;
  }
  const fExam  = (document.getElementById('ms_filterExam')||{}).value||'';
  const fGrade = (document.getElementById('ms_filterGrade')||{}).value||'';
  let filtered = db.meanScores.filter(m=>
    (!fExam  || m.examName.toLowerCase().includes(fExam.toLowerCase())) &&
    (!fGrade || m.grade===fGrade)
  );
  if(!filtered.length){
    document.getElementById('ms_tableHead').innerHTML='<th style="padding:8px;color:var(--text-muted);font-size:12px" colspan="20">No matching records</th>';
    document.getElementById('ms_tableBody').innerHTML='';
    return;
  }
  // Build dynamic columns from all subjects seen
  const allSubjs = [...new Set(filtered.flatMap(m=>Object.keys(m.scores||{})))];
  document.getElementById('ms_tableHead').innerHTML =
    ['<th style="padding:6px 10px;background:var(--navy-mid);color:var(--gold);font-size:10px;white-space:nowrap">Exam Name</th>',
     '<th style="padding:6px 10px;background:var(--navy-mid);color:var(--gold);font-size:10px">Grade</th>',
     '<th style="padding:6px 10px;background:var(--navy-mid);color:var(--gold);font-size:10px">Term</th>',
     ...allSubjs.map(s=>`<th style="padding:6px 8px;background:var(--navy-mid);color:var(--sky);font-size:10px">${s}</th>`),
     '<th style="padding:6px 10px;background:var(--navy-mid);color:var(--emerald);font-size:10px;white-space:nowrap">Avg Class Mean</th>',
     '<th style="padding:6px 10px;background:var(--navy-mid);color:var(--gold);font-size:10px">Updated</th>',
     '<th style="padding:6px 10px;background:var(--navy-mid);font-size:10px">Action</th>',
    ].join('');
  document.getElementById('ms_tableBody').innerHTML = filtered.map((m,i)=>{
    const bg = i%2===0?'':'background:var(--surface-2)';
    const subCells = allSubjs.map(s=>`<td style="padding:5px 8px;text-align:center;font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:12px;font-weight:600;color:var(--sky)">${m.scores[s]!==undefined?m.scores[s].toFixed(1):'—'}</td>`).join('');
    // Compute avgClassMean from db.exams if not stored
    let avg = m.avgClassMean;
    if(avg===undefined||avg===null){
      const records=db.exams.filter(e=>e.examName===m.examName&&e.grade===m.grade&&e.total!==undefined);
      if(records.length){
        const sc=getSubjects(m.grade).length||1;
        avg=records.reduce((s,e)=>s+(e.total||0),0)/(records.length*sc);
      }
    }
    const avgDisplay = (avg!==undefined&&avg!==null) ? parseFloat(avg).toFixed(2) : '—';
    const msIdx = db.meanScores.indexOf(m);
    return `<tr style="${bg}">
      <td style="padding:5px 10px;font-weight:700;font-size:12px">${m.examName}</td>
      <td style="padding:5px 8px;text-align:center"><span class="badge badge-blue">${m.grade}</span></td>
      <td style="padding:5px 8px;text-align:center;font-size:12px;color:var(--text-muted)">${m.term||''} ${m.year||''}</td>
      ${subCells}
      <td style="padding:5px 8px;text-align:center;font-family:'JetBrains Mono','Courier New',Courier,monospace;font-size:13px;font-weight:800;color:var(--emerald)">${avgDisplay}</td>
      <td style="padding:5px 8px;font-size:11px;color:var(--text-muted)">${m.updatedAt||''}</td>
      <td style="padding:5px 8px">
        <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 8px;color:var(--sky)" onclick="editMeanScore(${msIdx})">✏️</button>
        <button class="btn btn-danger btn-sm" style="font-size:10px;padding:2px 6px;margin-left:4px" onclick="deleteMeanScore(${msIdx})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function editMeanScore(idx){
  const m = db.meanScores[idx];
  if(!m) return;
  document.getElementById('ms_examName').value = m.examName;
  document.getElementById('ms_grade').value    = m.grade;
  document.getElementById('ms_term').value     = m.term||'Term 1';
  document.getElementById('ms_year').value     = m.year||2025;
  renderMeanScoreInputs();
  // Fill in scores after inputs are rendered
  setTimeout(()=>{
    getSubjects(m.grade).forEach(s=>{
      const inp=document.getElementById('ms_score_'+s);
      if(inp && m.scores[s]!==undefined) inp.value=m.scores[s];
    });
    const avgInp=document.getElementById('ms_avgClassMean');
    if(avgInp){
      if(m.avgClassMean!==undefined&&m.avgClassMean!==null) avgInp.value=m.avgClassMean;
      else avgInp.value='';
    }
  },50);
  // Scroll to form
  document.getElementById('ms_examName').scrollIntoView({behavior:'smooth',block:'center'});
}

function deleteMeanScore(idx){
  if(!confirm('Delete this mean score entry?')) return;
  db.meanScores.splice(idx,1);
  saveDB(); updateCounts(); renderSavedMeanScores();
  toast('Mean score entry deleted');
}

/* ═══════════════════════════════════════════════════════════
   DELETE GRADE LEARNERS
   ═══════════════════════════════════════════════════════════ */
function openDeleteGradeModal(){
  closeModal();
  document.getElementById('deleteGradeModal').style.display='';
  document.getElementById('dg_grade').value='';
  document.getElementById('dg_preview').style.display='none';
  document.getElementById('btnDeleteGrade').disabled=true;
  document.getElementById('btnDeleteGrade').style.opacity='0.5';
}
function closeDeleteGradeModal(){
  document.getElementById('deleteGradeModal').style.display='none';
}
function previewDeleteGrade(){
  const grade=document.getElementById('dg_grade').value;
  const btn=document.getElementById('btnDeleteGrade');
  const prev=document.getElementById('dg_preview');
  if(!grade){prev.style.display='none';btn.disabled=true;btn.style.opacity='0.5';return;}
  const stuCount=db.students.filter(s=>s.grade===grade).length;
  const exCount=db.exams.filter(e=>e.grade===grade).length;
  prev.style.display='';
  document.getElementById('dg_previewText').innerHTML=
    `<strong style="color:var(--rose)">⚠️ This will permanently delete:</strong><br>
     • <strong>${stuCount}</strong> student${stuCount!==1?'s':''} in Grade <strong>${grade}</strong><br>
     • <strong>${exCount}</strong> exam record${exCount!==1?'s':''} for Grade <strong>${grade}</strong><br>
     <span style="color:var(--text-muted);font-size:11px;margin-top:6px;display:block">This action cannot be undone.</span>`;
  if(stuCount>0){btn.disabled=false;btn.style.opacity='1';}
  else{btn.disabled=true;btn.style.opacity='0.5';
    document.getElementById('dg_previewText').innerHTML+='<br><em style="color:var(--text-muted)">No students found in this grade.</em>';}
}
function executeDeleteGrade(){
  const grade=document.getElementById('dg_grade').value;
  if(!grade)return;
  const stuList=db.students.filter(s=>s.grade===grade);
  const stuCount=stuList.length;
  if(!confirm(`DELETE all ${stuCount} students and their exam records from Grade ${grade}?\n\nThis CANNOT be undone.`))return;
  // Same upsert-only sync limitation applies to students — use the existing
  // dedicated delete endpoint per student so the bulk removal actually persists.
  stuList.forEach(s=>{ fetch('/api/students/'+encodeURIComponent(s.admNo), {method:'DELETE'}).catch(()=>{}); });
  _deleteExamRecordsRemote(db.exams.filter(e=>e.grade===grade));
  db.students=db.students.filter(s=>s.grade!==grade);
  db.exams=db.exams.filter(e=>e.grade!==grade);
  db.rawScores=(db.rawScores||[]).filter(e=>e.grade!==grade);
  recalcRanks();saveDB();updateCounts();
  toast(`🗑 Deleted all learners from Grade ${grade}`);
  closeDeleteGradeModal();
  renderStudentsTable();
}

/* ═══════════════════════════════════════════════════════════
   DELETE EXAM RECORDS
   ═══════════════════════════════════════════════════════════ */
function openDeleteExamModal(){
  closeModal();
  const sel=document.getElementById('de_examName');
  sel.innerHTML='<option value="">-- Select Exam --</option>';
  getExamNames().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
  document.getElementById('de_grade').value='';
  document.getElementById('de_preview').style.display='none';
  document.getElementById('btnDeleteExam').disabled=true;
  document.getElementById('btnDeleteExam').style.opacity='0.5';
  document.getElementById('deleteExamModal').style.display='';
}
function closeDeleteExamModal(){
  document.getElementById('deleteExamModal').style.display='none';
}
function previewDeleteExam(){
  const examName=document.getElementById('de_examName').value;
  const grade=document.getElementById('de_grade').value;
  const btn=document.getElementById('btnDeleteExam');
  const prev=document.getElementById('de_preview');
  if(!examName){prev.style.display='none';btn.disabled=true;btn.style.opacity='0.5';return;}
  const count=db.exams.filter(e=>(e.examName||'Untitled Exam')===examName&&(!grade||e.grade===grade)).length;
  const grades=[...new Set(db.exams.filter(e=>(e.examName||'Untitled Exam')===examName&&(!grade||e.grade===grade)).map(e=>e.grade))].sort();
  prev.style.display='';
  document.getElementById('de_previewText').innerHTML=
    `<strong style="color:var(--rose)">⚠️ Will delete <strong>${count}</strong> exam record${count!==1?'s':''}</strong><br>
     Exam: <strong>${examName}</strong>${grade?' — Grade '+grade:' — All grades ('+grades.join(', ')+')'}<br>
     <span style="color:var(--text-muted);font-size:11px;margin-top:4px;display:block">This cannot be undone.</span>`;
  if(count>0){btn.disabled=false;btn.style.opacity='1';}
  else{btn.disabled=true;btn.style.opacity='0.5';}
}
function executeDeleteExam(){
  const examName=document.getElementById('de_examName').value;
  const grade=document.getElementById('de_grade').value;
  if(!examName)return;
  const matches=db.exams.filter(e=>(e.examName||'Untitled Exam')===examName&&(!grade||e.grade===grade));
  const count=matches.length;
  const label=grade?`Grade ${grade} records for "${examName}"`:` all records for "${examName}"`;
  if(!confirm(`DELETE ${count} exam record${count!==1?'s':''} for${label}?\n\nThis CANNOT be undone.`))return;
  _deleteExamRecordsRemote(matches);
  db.exams=db.exams.filter(e=>!((e.examName||'Untitled Exam')===examName&&(!grade||e.grade===grade)));
  db.rawScores=(db.rawScores||[]).filter(e=>!((e.examName||'Untitled Exam')===examName&&(!grade||e.grade===grade)));
  recalcRanks();saveDB();updateCounts();
  toast(`🗑 Deleted ${count} records for "${examName}"${grade?' ('+grade+')':''}`);
  closeDeleteExamModal();
  if(document.querySelector('#page-editScores.active'))renderEditScoresTable();
}

/* ═══════════════════════════════════════════════════════════
   IMPORT TEACHERS FROM EXCEL
   ═══════════════════════════════════════════════════════════ */
let _tiData=[], _tiHeaders=[];

function openTeacherImportModal(){
  closeModal();
  resetTeacherImport();
  document.getElementById('teacherImportModal').style.display='';
}
function closeTeacherImportModal(){
  document.getElementById('teacherImportModal').style.display='none';
}
function resetTeacherImport(){
  _tiData=[];_tiHeaders=[];
  const fi=document.getElementById('ti_fileInput');if(fi)fi.value='';
  document.getElementById('ti_step1').style.display='';
  document.getElementById('ti_step2').style.display='none';
  document.getElementById('ti_msg').textContent='';
}

function downloadTeacherTemplate(){
  ensureXLSX(function(){
    const subjs=ALL_SUBJ;
    const headers=['Name','Phone','Class Teacher',  ...subjs];
    const note=['(Teacher Full Name)','(Optional)','(Grade code e.g. 1E, 4N or leave blank)',...subjs.map(s=>'(comma-separated grades e.g. 1E,4N,5N)')];
    const ex1=['Mr. John Kamau','0712345001','4N','4N,4S,5N,5S','4N,4S,5N','','4N,4S','','','',''];
    const ex2=['Mrs. Grace Wanjiku','0712345002','7R','','','7R,7B,8R','7R,7B','7R,7B,8R','','7R,7B',''];
    const ws=XLSX.utils.aoa_to_sheet([headers,note,ex1,ex2]);
    ws['!cols']=[{wch:24},{wch:14},{wch:16},...subjs.map(()=>({wch:22}))];
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Teachers');
    _xlsxDownload(wb,'Santapris_Teacher_Import_Template.xlsx');
    toast('📥 Teacher import template downloaded!');
  });
}

function handleTeacherImportFile(file){
  if(!file)return;
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='csv'){
    const r=new FileReader();
    r.onload=e=>{
      const rows=e.target.result.split(/\r?\n/).filter(l=>l.trim());
      _tiHeaders=rows[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''));
      _tiData=rows.slice(1).map(l=>l.split(',').map(c=>c.trim().replace(/^"|"$/g,'')));
      showTeacherImportPreview();
    };
    r.readAsText(file);
  } else if(['xlsx','xls'].includes(ext)){
    ensureXLSX(function(){
      const r=new FileReader();
      r.onload=e=>{
        const wb=XLSX.read(e.target.result,{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const raw=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
        if(!raw.length){toast('Empty file',true);return;}
        _tiHeaders=raw[0].map(h=>String(h).trim());
        _tiData=raw.slice(1).filter(r=>r.some(c=>String(c).trim()));
        showTeacherImportPreview();
      };
      r.readAsArrayBuffer(file);
    });
  } else { toast('Unsupported format — use .xlsx, .xls, or .csv',true); }
}

function showTeacherImportPreview(){
  // Parse data into teacher objects for preview
  const parsed=parseTeacherImportData();
  document.getElementById('ti_rowCount').textContent=parsed.length;
  // Build preview table
  const tbl=document.getElementById('ti_previewTable');
  const cols=['Name','Phone','Class Teacher','Subjects & Classes'];
  const head='<thead><tr>'+cols.map(c=>`<th style="padding:5px 10px;background:var(--navy-mid);color:var(--gold);font-size:10px;white-space:nowrap">${c}</th>`).join('')+'</tr></thead>';
  const body='<tbody>'+parsed.slice(0,8).map((t,i)=>{
    const bg=i%2?'background:var(--surface-2)':'';
    const subjText=t.assignments.map(a=>`<span style="color:var(--sky)">${a.subject}</span>: ${a.classes.join(', ')}`).join(' | ');
    return `<tr style="${bg}">
      <td style="padding:4px 10px;font-weight:600;font-size:12px">${fmtTeacher(t.name)}</td>
      <td style="padding:4px 8px;font-size:11px;color:var(--text-muted)">${t.phone||'—'}</td>
      <td style="padding:4px 8px;text-align:center">${((t.classTeacher||'')).split(',').map(s=>s.trim()).filter(Boolean).map(g=>`<span class="badge badge-blue" style="font-size:10px;margin:1px">${g}</span>`).join('')||'<span style="color:var(--text-muted)">—</span>'}</td>
      <td style="padding:4px 8px;font-size:11px">${subjText||'<em style="color:var(--text-muted)">No subjects</em>'}</td>
    </tr>`;
  }).join('')+'</tbody>';
  tbl.innerHTML=head+body;
  // Duplicate warning
  const dups=parsed.filter(t=>db.teachers.some(ex=>ex.name.toLowerCase()===t.name.toLowerCase()));
  const dupWarn=document.getElementById('ti_dupWarning');
  if(dups.length){
    dupWarn.style.display='';
    dupWarn.textContent=`⚠️ ${dups.length} teacher${dups.length!==1?'s':''} already exist in the system: ${dups.map(d=>fmtTeacher(d.name)).join(', ')} — these will be skipped.`;
  } else { dupWarn.style.display='none'; }
  document.getElementById('ti_step1').style.display='none';
  document.getElementById('ti_step2').style.display='';
}

function parseTeacherImportData(){
  const VALID_GRADES_SET=new Set([...LP_GRADES,...GRADES]);
  const VALID_SUBJ_SET=new Set(ALL_SUBJ);
  const hdrs=_tiHeaders.map(h=>h.trim().toUpperCase().replace(/\s+/g,''));
  // Find column indices
  const nameCol =_tiHeaders.findIndex(h=>/^name$/i.test(h.trim())||/teacher.*name/i.test(h)||/full.*name/i.test(h));
  const phoneCol=_tiHeaders.findIndex(h=>/^phone$/i.test(h.trim())||/telephone/i.test(h)||/mobile/i.test(h));
  const ctCol   =_tiHeaders.findIndex(h=>/class.*teacher/i.test(h)||/^ct$/i.test(h.trim())||/home.*room/i.test(h));
  // Subject columns — any header matching a known subject code
  const subjCols={};
  ALL_SUBJ.forEach(s=>{
    const idx=_tiHeaders.findIndex(h=>h.trim().toUpperCase().replace(/\//g,'').replace(/\s+/g,'')=== s.replace('/',''));
    if(idx>=0)subjCols[s]=idx;
  });
  const teachers=[];
  _tiData.forEach(row=>{
    if(nameCol<0)return;
    const name=String(row[nameCol]||'').trim();
    if(!name||name.toLowerCase().startsWith('('))return; // skip note rows
    const phone=phoneCol>=0?String(row[phoneCol]||'').trim():'';
    let ct=ctCol>=0?String(row[ctCol]||'').trim().toUpperCase().replace(/\s+/g,''):'';
    if(!VALID_GRADES_SET.has(ct))ct='';
    const assignments=[];
    Object.entries(subjCols).forEach(([subj,col])=>{
      const raw=String(row[col]||'').trim();
      if(!raw)return;
      const classes=raw.split(/[,;]+/).map(g=>g.trim().toUpperCase().replace(/\s+/g,'')).filter(g=>VALID_GRADES_SET.has(g));
      if(classes.length)assignments.push({subject:subj,classes});
    });
    teachers.push({name,phone,classTeacher:ct,assignments});
  });
  return teachers;
}

function executeTeacherImport(){
  const parsed=parseTeacherImportData();
  let imported=0,skipped=0;
  parsed.forEach(t=>{
    // Skip duplicates
    if(db.teachers.some(ex=>ex.name.toLowerCase()===t.name.toLowerCase())){skipped++;return;}
    if(!db.counters.tch)db.counters.tch=1;
    const id='TCH'+String(db.counters.tch).padStart(3,'0');
    db.counters.tch++;
    db.teachers.push({id,name:t.name,phone:t.phone,assignments:t.assignments,classTeacher:t.classTeacher});
    imported++;
  });
  saveDB();updateCounts();
  const msg=document.getElementById('ti_msg');
  msg.textContent=`✅ ${imported} imported${skipped?' · '+skipped+' skipped (duplicates)':''}`;
  msg.style.color=skipped?'var(--gold)':'var(--emerald)';
  if(imported>0){
    toast(`👩‍🏫 Imported ${imported} teacher${imported!==1?'s':''}!`);
    if(document.querySelector('#page-teachers.active'))renderTeachersTable();
  }
}

/* ═══════════════════════════════════════════════════════════
   PORTABLE EXPORT — always captures the CURRENT state of the
   page and ALL data at the moment the button is clicked.
   Works by serialising the live DOM and injecting the live db.
   ═══════════════════════════════════════════════════════════ */
function exportPortableHTML(){
  try {
    // 1. Flush all current data to __db_embed__ and localStorage RIGHT NOW
    saveDB();

    // 2. Grab the full live HTML of this page exactly as it is
    var html = document.documentElement.outerHTML;

    // 3. Build the db JSON string (safe for embedding inside a script tag)
    var dbStr = JSON.stringify(db)
      .replace(/&/g,  '\u0026')
      .replace(/</g,  '\u003c')
      .replace(/>/g,  '\u003e');

    // 4. Replace whatever is currently inside __db_embed__ with the live db.
    //    IMPORTANT: we must NOT write closing-script-tag literally inside a script block —
    //    the HTML parser would close the tag early. Split the string instead.
    var CLOSE = '<' + '/' + 'script>';
    var embedOpen  = '<' + 'script id="__db_embed__" type="application/json">';
    var embedTag   = embedOpen + dbStr + CLOSE;

    // Locate the __db_embed__ block by searching for its opening tag
    var markerOpen = 'id="__db_embed__"';
    var startPos   = html.lastIndexOf(markerOpen);
    if(startPos !== -1){
      // Walk back to the opening < of that tag
      var tagStart = html.lastIndexOf('<', startPos);
      // Find the end of that opening tag (the >)
      var tagOpenEnd = html.indexOf('>', tagStart);
      // Find the matching closing tag after the opening tag
      var closeStr = '<' + '/' + 'script>';
      var tagEnd   = html.indexOf(closeStr, tagOpenEnd);
      if(tagStart !== -1 && tagEnd !== -1){
        html = html.slice(0, tagStart) + embedTag + html.slice(tagEnd + closeStr.length);
      }
    } else {
      // Fallback: append just before </body>
      html = html.replace('<' + '/body>', embedTag + '<' + '/body>');
    }

    // 5. Download
    var blob = new Blob([html], {type: 'text/html;charset=utf-8'});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'Santapris_' + new Date().toISOString().slice(0,10) + '.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 3000);

    toast('\ud83d\udcbe Portable copy saved with all current data! Opens on any browser or computer.');
  } catch(e){
    console.error('exportPortableHTML:', e);
    toast('Export error: ' + e.message, true);
  }
}

/* ═══════════════════════════════════════════════════════════
   DATA BACKUP / RESTORE — JSON export + import
   Works across ALL browsers and computers. No server needed.
   ═══════════════════════════════════════════════════════════ */
function exportDataJSON(){
  try {
    // Flush all current data first
    saveDB();
    const json   = JSON.stringify(db, null, 2);
    const blob   = new Blob([json], {type:'application/json;charset=utf-8'});
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = 'Santapris_Backup_' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 3000);
    toast('📤 Data backup saved with all current data! Use Restore Data on any computer.');
  } catch(e){
    toast('⚠️ Export failed: ' + e.message, true);
  }
}

function importDataJSON(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const loaded = JSON.parse(e.target.result);
      // Validate it looks like our db structure
      if(typeof loaded !== 'object' || !Array.isArray(loaded.students)){
        throw new Error('File does not appear to be a valid Santapris backup.');
      }

      // ── SMART MERGE: backup + live data coexist, no duplicates ──
      // Students: keyed by admNo — live record wins over backup if both exist
      const studentMap = new Map();
      (loaded.students || []).forEach(s => studentMap.set(s.admNo, s));
      db.students.forEach(s => studentMap.set(s.admNo, s)); // live wins
      db.students = Array.from(studentMap.values());

      // Teachers: keyed by id — live record wins; then re-seed preloaded if missing
      const teacherMap = new Map();
      (loaded.teachers || []).forEach(t => teacherMap.set(t.id, {...t, assignments: Array.isArray(t.assignments)?t.assignments:[]}));
      db.teachers.forEach(t => teacherMap.set(t.id, {...t, assignments: Array.isArray(t.assignments)?t.assignments:[]})); // live wins
      // Re-seed any missing preloaded teachers
      PRELOADED_TEACHERS.forEach(pt => {
        if(!teacherMap.has(pt.id)) teacherMap.set(pt.id, {...pt});
      });
      db.teachers = Array.from(teacherMap.values());

      // Exams: keyed by composite admNo+examId — live record wins
      const examKey = ex => (ex.admNo||'') + '|' + (ex.examId||ex.id||'');
      const examMap = new Map();
      (loaded.exams || []).forEach(ex => examMap.set(examKey(ex), ex));
      db.exams.forEach(ex => examMap.set(examKey(ex), ex)); // live wins
      db.exams = Array.from(examMap.values());

      // Booklist: keyed by id — live wins
      const blMap = new Map();
      (loaded.booklist || []).forEach(b => blMap.set(b.id||JSON.stringify(b), b));
      db.booklist.forEach(b => blMap.set(b.id||JSON.stringify(b), b));
      db.booklist = Array.from(blMap.values());

      // MeanScores: keyed by examId+grade — live wins
      const msKey = m => (m.examId||'') + '|' + (m.grade||'');
      const msMap = new Map();
      (loaded.meanScores || []).forEach(m => msMap.set(msKey(m), m));
      db.meanScores.forEach(m => msMap.set(msKey(m), m));
      db.meanScores = Array.from(msMap.values());

      // Counters: take the higher value so IDs never collide
      const lc = loaded.counters || {};
      db.counters.adm = Math.max(db.counters.adm||1, lc.adm||1);
      db.counters.tch = Math.max(db.counters.tch||1, lc.tch||1);

      // Exam name registry: merged by name (case-insensitive) — live wins;
      // backup-only names are pulled in so definitions keep syncing across devices.
  if(!Array.isArray(db.examRegistry)) db.examRegistry=[];
  if(!db.conversion || typeof db.conversion!=='object' || Array.isArray(db.conversion)) db.conversion={};
  if(!db.specialTT || typeof db.specialTT!=='object' || Array.isArray(db.specialTT)) db.specialTT={};
      const regMap = new Map();
      (Array.isArray(loaded.examRegistry) ? loaded.examRegistry : []).forEach(d => {
        if(d && d.name) regMap.set(String(d.name).trim().toLowerCase(), d);
      });
      db.examRegistry.forEach(d => {
        if(d && d.name) regMap.set(String(d.name).trim().toLowerCase(), d); // live wins
      });
      db.examRegistry = Array.from(regMap.values());

      recalcRanks();
      saveDB();
      renderDashboard();
      toast('✅ Merged: ' + db.students.length + ' students, ' + db.teachers.length + ' teachers, ' + db.exams.length + ' exam records. New data preserved.');
    } catch(err){
      toast('⚠️ Restore failed: ' + err.message, true);
    }
    input.value = ''; // reset so same file can be re-selected
  };
  reader.readAsText(file, 'utf-8');
}

/* ═══════════════════════════════════════════════════════════
   CLASS TEACHERS — assign a class teacher per grade
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   EXAM SUPERVISION — generate, store, export
   ═══════════════════════════════════════════════════════════ */

  let SV_EXCLUDED     = ['MARTIN','GRACE','DICKENS','JECINTAH']; // editable on the Exam Supervision page
  const __svNorm = s => String(s || '').replace(/^tr\.\s*/i, '').trim().toUpperCase();
  try { const __svx = JSON.parse(localStorage.getItem('santapris_sv_excluded_v1') || 'null');
    if (Array.isArray(__svx)) SV_EXCLUDED = [...new Set(__svx.map(__svNorm).filter(Boolean))]; } catch(e) {}
  function svSaveExcluded(){ try { localStorage.setItem('santapris_sv_excluded_v1', JSON.stringify(SV_EXCLUDED)); } catch(e) {} }
  window.svSaveExcluded = svSaveExcluded;
  window.svSetExcluded = function(list){
    SV_EXCLUDED = [...new Set((list || []).map(function(s){ return String(s).replace(/^tr\.\s*/i, '').trim().toUpperCase(); }).filter(Boolean))];
    svSaveExcluded();
  };
  window.svGetExcluded = function(){ return SV_EXCLUDED.slice(); };
// Grades that always get exactly 2 invigilators (all others get 1)
const SV_DOUBLE_GRADES = ['4N','6N','6S'];
// Helper: how many invigilators does this grade get?
function svCount(grade){ return SV_DOUBLE_GRADES.includes(grade) ? 2 : 1; }

// ── renderSupervisionPage ────────────────────────────────────────
function renderSupervisionPage(){
  if(typeof svwEnsureInit === 'function'){ try{ svwEnsureInit(); }catch(e){} }
  const lists = db.supervisionLists || [];
  const countEl = document.getElementById('sv_listCount');
  if(countEl) countEl.textContent = `${lists.length} list${lists.length!==1?'s':''} saved`;

  const wrap = document.getElementById('sv_listTable');
  if(!wrap) return;

  if(!lists.length){
    wrap.innerHTML = `<div class="empty-state" style="padding:40px">
      <div class="empty-icon">📋</div><p>No supervision lists yet. Generate one above.</p></div>`;
    return;
  }

  // Newest first
  const sorted = [...lists].sort((a,b)=>b.createdAt - a.createdAt);
  wrap.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:var(--surface-2);border-bottom:2px solid var(--border)">
      <th style="padding:10px 14px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase">Exam</th>
      <th style="padding:10px 14px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase">Term / Year</th>
      <th style="padding:10px 14px;text-align:center;font-size:11px;color:var(--text-muted);text-transform:uppercase">Classes</th>
      <th style="padding:10px 14px;text-align:center;font-size:11px;color:var(--text-muted);text-transform:uppercase">Per Class</th>
      <th style="padding:10px 14px;text-align:left;font-size:11px;color:var(--text-muted);text-transform:uppercase">Created</th>
      <th style="padding:10px 14px;text-align:center;font-size:11px;color:var(--text-muted);text-transform:uppercase">Actions</th>
    </tr></thead>
    <tbody>${sorted.map((l,i) => {
      const d = new Date(l.createdAt).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'});
      const rowBg = i%2===0?'':'background:var(--surface-2)';
      return `<tr style="${rowBg};border-bottom:1px solid var(--border)">
        <td style="padding:10px 14px;font-weight:700;color:var(--gold)">${l.examName}</td>
        <td style="padding:10px 14px;color:var(--text-secondary)">${l.term} ${l.year}</td>
        <td style="padding:10px 14px;text-align:center">
          <span class="badge badge-blue">${l.rows.length}</span></td>
        <td style="padding:10px 14px;text-align:center;color:var(--text-secondary)">${svwCountsSummary(l)}</td>
        <td style="padding:10px 14px;font-size:11px;color:var(--text-muted)">${d}</td>
        <td style="padding:10px 14px;text-align:center">
          <button class="btn btn-ghost btn-sm" onclick="openSupervisionDetail(${l.createdAt})">👁 View</button>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

// ── generateSupervisionList ──────────────────────────────────────
function generateSupervisionList(){
  const examName = document.getElementById('sv_examName').value.trim();
  const term     = document.getElementById('sv_term').value;
  const year     = parseInt(document.getElementById('sv_year').value);

  if(!examName) return toast('Enter an exam name first', true);

  // Build eligible pool — exclude SV_EXCLUDED teachers
  const pool = db.teachers.filter(t => {
    const uName = (t.name||'').toUpperCase().trim();
    if (SV_EXCLUDED.some(ex => uName === ex || uName.startsWith(ex))) return false;
    /* Lower Primary (Gr 1-3) teachers never appear in the supervision list */
    if (typeof teacherLevel === 'function' && teacherLevel(t) === 'lp') return false;
    return true;
  });
  if(pool.length === 0) return toast('No eligible teachers available', true);

  // Load previous supervision history for rotation tracking
  const allPrevious = db.supervisionLists || [];

  // Count how many times each teacher has supervised each grade (rotation history)
  const supervisionCount = {}; // teacherId → { gradeCode: count }
  allPrevious.forEach(list => {
    list.rows.forEach(row => {
      (row.teacherIds || []).forEach(tid => {
        if(!supervisionCount[tid]) supervisionCount[tid] = {};
        supervisionCount[tid][row.grade] = (supervisionCount[tid][row.grade] || 0) + 1;
      });
    });
  });

  // Fisher-Yates shuffle — used to randomise ties so every generation is fresh
  function shuffle(arr){
    const a = [...arr];
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Get all classes a teacher teaches (from assignments)
  function getTeachingGrades(teacher){
    const grades = new Set();
    (teacher.assignments || []).forEach(a => {
      (a.classes || []).forEach(g => grades.add(g));
    });
    return grades;
  }

  // Collect IDs of class teachers for a given grade
  function getClassTeacherIds(grade){
    return new Set(getClassTeachers(grade).map(t => t.id));
  }

  // Core picker — attempts to fill `count` slots for `grade`.
  //   relaxPicked  : when true, ignore alreadyPicked (allow reuse across classes)
  //   relaxClassTch: when true, also ignore the class-teacher exclusion (last resort)
  function pickTeachers(grade, count, alreadyPicked, extraExclude, relaxPicked, relaxClassTch){
    const xSet = (relaxClassTch ? new Set() : (extraExclude || new Set()));
    const eligible = pool.filter(t => {
      if(!relaxPicked && alreadyPicked.has(t.id)) return false;
      if(xSet.has(t.id)) return false;
      const teaching = getTeachingGrades(t);
      return !teaching.has(grade);   // never supervise a class you teach
    });

    if(!eligible.length) return [];

    // Shuffle first (randomises tie-breaks → different list every run)
    // then stable-sort by rotation counts so fairness is still preserved
    const shuffled = shuffle(eligible);
    const sorted = shuffled.sort((a, b) => {
      const aGrade = (supervisionCount[a.id]||{})[grade] || 0;
      const bGrade = (supervisionCount[b.id]||{})[grade] || 0;
      if(aGrade !== bGrade) return aGrade - bGrade;
      const aTotal = Object.values(supervisionCount[a.id]||{}).reduce((s,v)=>s+v,0);
      const bTotal = Object.values(supervisionCount[b.id]||{}).reduce((s,v)=>s+v,0);
      return aTotal - bTotal;
    });

    return sorted.slice(0, count);
  }

  // ── Pass 1: strict (no reuse, class-teacher exclusion active) ───
  const rows = [];
  const sessionPicked = new Set();

  GRADES.forEach(grade => {
    const needed = svCount(grade);
    const ctIds  = getClassTeacherIds(grade);
    const assigned = pickTeachers(grade, needed, sessionPicked, ctIds, false, false);
    assigned.forEach(t => sessionPicked.add(t.id));
    rows.push({
      grade,
      teacherIds:   assigned.map(t => t.id),
      teacherNames: assigned.map(t => fmtTeacher(t.name)),
      _needed: needed
    });
  });

  // ── Pass 2: for any grade still short, relax alreadyPicked ──────
  //   (allow a teacher to appear in more than one slot — better than leaving a class empty)
  rows.forEach(row => {
    const stillNeed = row._needed - row.teacherIds.length;
    if(stillNeed <= 0) return;
    const ctIds = getClassTeacherIds(row.grade);
    // exclude those already assigned to this specific row
    const thisRowPicked = new Set(row.teacherIds);
    const extra = pickTeachers(row.grade, stillNeed, thisRowPicked, ctIds, true, false);
    extra.forEach(t => {
      row.teacherIds.push(t.id);
      row.teacherNames.push(fmtTeacher(t.name) + ' *');
    });
  });

  // ── Pass 3: absolute last resort — also relax class-teacher rule ─
  rows.forEach(row => {
    const stillNeed = row._needed - row.teacherIds.length;
    if(stillNeed <= 0) return;
    const thisRowPicked = new Set(row.teacherIds);
    const extra = pickTeachers(row.grade, stillNeed, thisRowPicked, null, true, true);
    extra.forEach(t => {
      row.teacherIds.push(t.id);
      row.teacherNames.push(fmtTeacher(t.name) + ' **');
    });
  });

  // Clean up internal helper key and set notes
  rows.forEach(row => {
    delete row._needed;
    row.note = svCount(row.grade) === 2 ? '2 invigilators (fixed)' : '';
  });

  // Save
  const list = {
    createdAt: Date.now(),
    examName, term, year,
    rows
  };
  db.supervisionLists = db.supervisionLists || [];
  db.supervisionLists.push(list);
  saveDB();

  toast(`✅ Supervision list generated for "${examName}"`);
  renderSupervisionPage();
  openSupervisionDetail(list.createdAt);
}

/* ═══════════════════════════════════════════════════════════
   SUPERVISION WIZARD — 5 steps: exam → classes sitting →
   teachers → invigilators per class → review → generate
   ═══════════════════════════════════════════════════════════ */
var SVW = null;
function svwFresh(){
  return {step:1, examName:'', level:'upjs', term:'Term 1',
    year:new Date().getFullYear(), classes:[], exempt:{}, extra:{}};
}
function svwLevelGrades(){ return SVW.level === 'lp' ? LP_GRADES.slice() : GRADES.slice(); }
function svwLevelLabel(){
  return SVW.level === 'lp' ? 'Lower Primary (Grades 1–3)' : 'Upper Primary & Junior (Grades 4–9)';
}
// Pool honoring the chosen level + the global exemption list.
// (Per-list unchecked teachers are removed at generate time, not here.)
function svwPoolFor(level){
  return (db.teachers||[]).filter(t => {
    const u = String(t.name||'').toUpperCase().trim();
    if(SV_EXCLUDED.some(ex => u === ex || u.startsWith(ex))) return false;
    const lv = (typeof teacherLevel === 'function') ? teacherLevel(t) : 'none';
    if(level === 'lp') return lv !== 'upjs';
    return lv !== 'lp';
  }).sort((a,b) => String(a.name||'').localeCompare(String(b.name||'')));
}
function svwPool(){
  return svwPoolFor((SVW && SVW.level) || 'upjs');
}
// Eligible teachers with no class in this list (for export footers).
function svwUnallocated(list){
  const assigned = {};
  (list.rows||[]).forEach(r => ((r.teacherIds||[]).forEach(id => { assigned[id] = 1; })));
  return svwPoolFor((list && list.level) || 'upjs')
    .filter(t => !assigned[t.id])
    .map(t => fmtTeacher(t.name));
}
function svwEnsureInit(){
  if(SVW) return;
  SVW = svwFresh();
  const y = document.getElementById('svw_year'); if(y && !y.value) y.value = SVW.year;
}
function svwGoto(n){
  svwEnsureInit();
  SVW.step = n;
  const labels = ['1. Exam','2. Classes','3. Teachers','4. Numbers','5. Review'];
  const ind = document.getElementById('svw_stepsInd');
  if(ind) ind.innerHTML = labels.map((l,i) =>
    `<span class="stt-step ${i+1<n?'done':(i+1===n?'now':'')}">${l}</span>`).join('<span class="stt-step-sep">→</span>');
  for(let i=1;i<=5;i++){ const d = document.getElementById('svw_step'+i); if(d) d.style.display = (i===n)?'':'none'; }
  if(n===2) svwRenderClasses();
  if(n===3) svwRenderTeachers();
  if(n===4) svwRenderCounts();
  if(n===5) svwRenderReview();
}
function svwReset(){
  SVW = svwFresh();
  const y = document.getElementById('svw_year'); if(y) y.value = SVW.year;
  const e = document.getElementById('svw_exam'); if(e) e.value = '';
  const l = document.getElementById('svw_level'); if(l) l.value = 'upjs';
  const t = document.getElementById('svw_term'); if(t) t.value = 'Term 1';
  svwGoto(1);
}
function svwStep1Submit(){
  svwEnsureInit();
  const exam = (document.getElementById('svw_exam').value||'').trim();
  if(!exam) return toast('Type the exam name first', true);
  SVW.examName = exam;
  SVW.level = document.getElementById('svw_level').value || 'upjs';
  SVW.term  = document.getElementById('svw_term').value || 'Term 1';
  SVW.year  = parseInt(document.getElementById('svw_year').value) || new Date().getFullYear();
  SVW.classes = svwLevelGrades();   // all checked by default
  SVW.exempt = {};
  SVW.extra = {};
  svwGoto(2);
}
function svwRenderClasses(){
  const box = document.getElementById('svw_classes'); if(!box) return;
  box.innerHTML = svwLevelGrades().map(g =>
    `<label style="display:flex;align-items:center;gap:8px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:13px;font-weight:700;cursor:pointer">
      <input type="checkbox" data-svwc="${g}" ${SVW.classes.includes(g)?'checked':''} style="width:16px;height:16px;accent-color:var(--emerald)"> ${g}
    </label>`).join('');
}
function svwStep2Submit(){
  const checked = [...document.querySelectorAll('#svw_classes input[data-svwc]:checked')]
    .map(cb => cb.getAttribute('data-svwc'));
  if(!checked.length) return toast('Tick at least one class sitting for the exam', true);
  SVW.classes = checked;
  svwGoto(3);
}
function svwRenderTeachers(){
  const box = document.getElementById('svw_teachers'); if(!box) return;
  const pool = svwPool();
  box.innerHTML = pool.length ? pool.map(t => {
    const subs = [...new Set((t.assignments||[]).map(a => a.subject).filter(Boolean))].join(', ');
    const lv = (typeof teacherLevel === 'function') ? teacherLevel(t) : 'none';
    const lvLabel = lv === 'lp' ? 'Lower Primary' : (lv === 'upjs' ? 'Upper & Junior' : '—');
    const off = !!SVW.exempt[t.id];
    return `<label style="display:flex;align-items:center;gap:9px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer">
      <input type="checkbox" data-svwt="${t.id}" ${off?'':'checked'} style="width:16px;height:16px;accent-color:var(--emerald)">
      <span style="font-weight:700">${fmtTeacher(t.name)}</span>
      <span style="font-size:10px;color:var(--text-muted)">${subs} · ${lvLabel}</span>
    </label>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">👩‍🏫</div><p>No eligible teachers for this level.</p></div>';
  const c = document.getElementById('svw_teachCount');
  if(c) c.textContent = pool.length ? `· ${pool.length} eligible` : '';
}
function svwStep3Submit(){
  const off = {};
  document.querySelectorAll('#svw_teachers input[data-svwt]').forEach(cb => {
    if(!cb.checked) off[cb.getAttribute('data-svwt')] = 1;
  });
  if(!svwPool().filter(t => !off[t.id]).length)
    return toast('Keep at least one teacher in the rotation', true);
  SVW.exempt = off;
  svwGoto(4);
}
function svwRenderCounts(){
  const box = document.getElementById('svw_counts'); if(!box) return;
  box.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:var(--surface-2)">
      <th style="padding:8px 12px;text-align:center;font-size:11px;color:var(--text-muted)">MORE THAN ONE?</th>
      <th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">CLASS</th>
      <th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">HOW MANY INVIGILATORS</th>
    </tr></thead><tbody>` + SVW.classes.map(g => {
      const cur = SVW.extra[g] || 1;
      return `<tr style="border-bottom:1px solid var(--border)">
        <td style="padding:8px 12px;text-align:center"><input type="checkbox" data-svwcm="${g}" ${cur>1?'checked':''} style="width:16px;height:16px;accent-color:var(--emerald)"></td>
        <td style="padding:8px 12px;font-weight:800;color:var(--gold)">${g}</td>
        <td style="padding:8px 12px"><input type="number" data-svwcn="${g}" value="${cur}" min="1" max="6" style="width:90px"></td>
      </tr>`;
    }).join('') + '</tbody></table>';
}
function svwStep4Submit(){
  const extra = {};
  SVW.classes.forEach(g => {
    const cb = document.querySelector(`#svw_counts input[data-svwcm="${g}"]`);
    const ni = document.querySelector(`#svw_counts input[data-svwcn="${g}"]`);
    const n = Math.max(1, Math.min(6, parseInt((ni && ni.value) || '1', 10) || 1));
    extra[g] = (cb && cb.checked) ? Math.max(2, n) : 1;
  });
  SVW.extra = extra;
  svwRenderReview();
  svwGoto(5);
}
// Short per-class summary, e.g. "7B×2, 8R×2; others ×1" / "1 invigilator per class"
function svwCountsSummary(list){
  if(!list || !list.counts) return '4N/6N/6S:2, others:1';   // legacy lists
  const multi = Object.keys(list.counts).filter(g => (list.counts[g]||1) > 1)
    .sort((a,b) => (list.counts[b]||1) - (list.counts[a]||1));
  if(!multi.length) return '1 invigilator per class';
  return multi.map(g => `${g}×${list.counts[g]}`).join(', ') + '; others ×1';
}
function svwRowCount(list, row){
  if(row && row.count) return row.count;
  if(list && list.counts && list.counts[row.grade]) return list.counts[row.grade];
  return svCount(row.grade);
}
function svwRenderReview(){
  const box = document.getElementById('svw_review'); if(!box) return;
  const pool = svwPool().filter(t => !SVW.exempt[t.id]);
  const exNames = svwPool().filter(t => SVW.exempt[t.id]).map(t => fmtTeacher(t.name));
  box.innerHTML = `
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:12px;font-size:13px;line-height:1.9">
      <div>📝 <strong>Exam:</strong> ${SVW.examName}</div>
      <div>🏫 <strong>Level:</strong> ${svwLevelLabel()}</div>
      <div>📅 <strong>Term / Year:</strong> ${SVW.term} ${SVW.year}</div>
      <div>🏫 <strong>Classes sitting (${SVW.classes.length}):</strong> ${SVW.classes.join(', ')}</div>
      <div>👩‍🏫 <strong>Teachers in rotation (${pool.length}):</strong> all eligible except ${exNames.length ? exNames.join(', ') : 'none'}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
      <thead><tr style="background:var(--surface-2)"><th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-muted)">CLASS</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:var(--text-muted)">INVIGILATORS</th></tr></thead>
      <tbody>${SVW.classes.map(g => `<tr style="border-bottom:1px solid var(--border)">
        <td style="padding:6px 10px;font-weight:800;color:var(--gold)">${g}</td>
        <td style="padding:6px 10px;text-align:center">${SVW.extra[g] || 1}</td></tr>`).join('')}</tbody>
    </table>
    <div class="muted" style="font-size:12px;line-height:1.8">Rules applied: no teacher twice in this exam · nobody supervises a class they teach (class teachers included) · rotation — fewest prior supervisions first, never the same class as last time · globally exempted teachers stay out.</div>`;
}

function svwGenerate(){
  if(getCurrentRole() !== 'admin') return toast('⛔ Supervision generation is restricted to admin.', true);
  if(!SVW || !SVW.examName || !SVW.classes.length)
    return toast('Complete the wizard steps first', true);
  const pool = svwPool().filter(t => !SVW.exempt[t.id]);
  if(!pool.length) return toast('No eligible teachers available', true);

  // Rotation history across all saved lists
  const allPrevious = db.supervisionLists || [];
  const supervisionCount = {};
  allPrevious.forEach(list => { (list.rows||[]).forEach(row => { (row.teacherIds||[]).forEach(tid => {
    if(!supervisionCount[tid]) supervisionCount[tid] = {};
    supervisionCount[tid][row.grade] = (supervisionCount[tid][row.grade] || 0) + 1;
  });});});
  // Last-cycle map: classes each teacher supervised in the latest list —
  // next cycle they go anywhere except that same class again.
  let lastDone = {};
  if(allPrevious.length){
    const latest = [...allPrevious].sort((a,b) => b.createdAt - a.createdAt)[0];
    (latest.rows||[]).forEach(row => { (row.teacherIds||[]).forEach(tid => {
      (lastDone[tid] = lastDone[tid] || {})[row.grade] = 1;
    });});
  }

  const teachingGrades = t => {
    const s = new Set();
    ((t.assignments||[]).forEach(a => ((a.classes||[]).forEach(g => s.add(g)))));
    return s;
  };
  const shuffle = arr => {
    const a = [...arr];
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  function pick(grade, count, alreadyPicked, extraExclude, o){
    o = o || {};
    const xSet = o.relaxClassTch ? new Set() : (extraExclude || new Set());
    const eligible = pool.filter(t => {
      if(!o.relaxPicked && alreadyPicked.has(t.id)) return false;
      if(xSet.has(t.id)) return false;
      if(!o.relaxLast && lastDone[t.id] && lastDone[t.id][grade]) return false;
      return !teachingGrades(t).has(grade);   // never supervise a class you teach
    });
    if(!eligible.length) return [];
    const sorted = shuffle(eligible).sort((a, b) => {
      const ag = (supervisionCount[a.id]||{})[grade] || 0;
      const bg = (supervisionCount[b.id]||{})[grade] || 0;
      if(ag !== bg) return ag - bg;
      const at = Object.values(supervisionCount[a.id]||{}).reduce((s,v) => s+v, 0);
      const bt = Object.values(supervisionCount[b.id]||{}).reduce((s,v) => s+v, 0);
      return at - bt;
    });
    return sorted.slice(0, count);
  }

  // Pass 1: strict — once per exam, class-teacher exclusion, last-class avoidance
  const rows = [];
  const sessionPicked = new Set();
  SVW.classes.forEach(grade => {
    const need = SVW.extra[grade] || 1;
    const ct = new Set(getClassTeachers(grade).map(t => t.id));
    const assigned = pick(grade, need, sessionPicked, ct, {});
    assigned.forEach(t => sessionPicked.add(t.id));
    rows.push({ grade, teacherIds: assigned.map(t => t.id),
      teacherNames: assigned.map(t => fmtTeacher(t.name)), count: need, _need: need });
  });
  // Pass 2: allow reuse across classes (marked *)
  rows.forEach(row => {
    let need = row._need - row.teacherIds.length;
    if(need <= 0) return;
    const ct = new Set(getClassTeachers(row.grade).map(t => t.id));
    const mine = new Set(row.teacherIds);
    pick(row.grade, need, mine, ct, { relaxPicked: true }).forEach(t => {
      row.teacherIds.push(t.id);
      row.teacherNames.push(fmtTeacher(t.name) + ' *');
    });
  });
  // Pass 3: also relax last-cycle avoidance (marked *)
  rows.forEach(row => {
    let need = row._need - row.teacherIds.length;
    if(need <= 0) return;
    const ct = new Set(getClassTeachers(row.grade).map(t => t.id));
    const mine = new Set(row.teacherIds);
    pick(row.grade, need, mine, ct, { relaxPicked: true, relaxLast: true }).forEach(t => {
      row.teacherIds.push(t.id);
      row.teacherNames.push(fmtTeacher(t.name) + ' *');
    });
  });
  // Pass 4: absolute last resort — class teachers too (marked **)
  rows.forEach(row => {
    let need = row._need - row.teacherIds.length;
    if(need <= 0) return;
    const mine = new Set(row.teacherIds);
    pick(row.grade, need, mine, null, { relaxPicked: true, relaxLast: true, relaxClassTch: true }).forEach(t => {
      row.teacherIds.push(t.id);
      row.teacherNames.push(fmtTeacher(t.name) + ' **');
    });
  });

  rows.forEach(row => {
    delete row._need;
    row.note = row.count > 1 ? `${row.count} invigilators` : '';
  });

  const list = {
    createdAt: Date.now(),
    examName: SVW.examName, term: SVW.term, year: SVW.year,
    level: SVW.level, classes: SVW.classes.slice(),
    counts: Object.assign({}, ...SVW.classes.map(g => ({ [g]: SVW.extra[g] || 1 }))),
    exemptNames: svwPool().filter(t => SVW.exempt[t.id]).map(t => fmtTeacher(t.name)),
    rows
  };
  db.supervisionLists = db.supervisionLists || [];
  db.supervisionLists.push(list);
  saveDB();

  toast(`✅ Supervision list generated for "${SVW.examName}"`);
  renderSupervisionPage();
  openSupervisionDetail(list.createdAt);
  svwReset();
}

// ── openSupervisionDetail ────────────────────────────────────────
let _svActiveId = null;

function openSupervisionDetail(createdAt){
  const list = (db.supervisionLists||[]).find(l => l.createdAt === createdAt);
  if(!list) return toast('List not found', true);
  _svActiveId = createdAt;

  document.getElementById('sdm_title').textContent     = `📋 ${list.examName}`;
  const _lvl = list.level === 'lp' ? 'Lower Primary' : (list.level === 'upjs' ? 'Upper & Junior' : '');
  document.getElementById('sdm_subtitle').textContent  =
    `${list.term} ${list.year}  |  ${list.rows.length} classes  |  ${svwCountsSummary(list)}${_lvl ? '  |  ' + _lvl : ''}`;

  // Build table — invigilator columns follow the widest row (legacy lists: 2)
  const _maxN = Math.max(2, ...list.rows.map(r => svwRowCount(list, r)));
  const thead = document.getElementById('sdm_thead');
  const tbody = document.getElementById('sdm_tbody');

  thead.innerHTML = `<tr style="background:var(--jungle);color:#fff">
    <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em">#</th>
    <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em">Class / Grade</th>
    ${Array.from({length:_maxN}, (_,ci) =>
      `<th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em">Invigilator ${ci+1}</th>`).join('')}
    <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.07em">Note</th>
  </tr>`;

  tbody.innerHTML = list.rows.map((r, i) => {
    const bg = i%2===0 ? 'var(--surface)' : 'var(--surface-2)';
    const n = svwRowCount(list, r);
    const cells = Array.from({length:_maxN}, (_,ci) =>
      `<td style="padding:9px 14px;color:${r.teacherNames[ci]?'var(--text-primary)':'var(--text-muted)'}">${
        r.teacherNames[ci] || '<span style="color:var(--text-muted);font-style:italic">—</span>'}</td>`
    ).join('');
    const note = n > 1
      ? `<td style="padding:9px 14px"><span class="badge badge-gold" style="font-size:10px">${n} invigilators</span></td>`
      : `<td style="padding:9px 14px;color:var(--text-muted);font-size:11px">${r.note||''}</td>`;
    return `<tr style="background:${bg};border-bottom:1px solid var(--border)">
      <td style="padding:9px 14px;color:var(--text-muted);font-size:11px">${i+1}</td>
      <td style="padding:9px 14px;font-weight:800;color:var(--gold);font-size:14px">${r.grade}${
        n>1?` <span style="font-size:9px;color:var(--sky);font-weight:400">(assigned)</span>`:''}</td>
      ${cells}${note}
    </tr>`;
  }).join('');

  document.getElementById('supervisionDetailModal').style.display = '';
}

function closeSupervisionDetail(){
  document.getElementById('supervisionDetailModal').style.display = 'none';
  _svActiveId = null;
}

function deleteSupervisionList(){
  if(!_svActiveId) return;
  const list = (db.supervisionLists||[]).find(l => l.createdAt === _svActiveId);
  if(!list) return;
  if(!confirm(`Delete supervision list for "${list.examName} – ${list.term} ${list.year}"?`)) return;
  db.supervisionLists = db.supervisionLists.filter(l => l.createdAt !== _svActiveId);
  saveDB();
  closeSupervisionDetail();
  renderSupervisionPage();
  toast('🗑 Supervision list deleted');
}

// ── Export PDF ───────────────────────────────────────────────────
function exportSupervisionPDF(){
  const list = (db.supervisionLists||[]).find(l => l.createdAt === _svActiveId);
  if(!list) return toast('No list selected', true);

  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
  const W = doc.internal.pageSize.getWidth();

  let y = pdfHeader(doc, 'EXAM SUPERVISION LIST',
    `${list.examName}  |  ${list.term} ${list.year}  |  ${svwCountsSummary(list)}`);

  // Info strip
  const genDate = new Date(list.createdAt).toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'});
  const _exNames = (list.exemptNames && list.exemptNames.length) ? list.exemptNames.join(', ') : SV_EXCLUDED.join(', ');
  doc.setFillColor(232,242,234);
  doc.roundedRect(4, y, W-8, 8, 1, 1, 'F');
  doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(27,94,59);
  doc.text(`Generated: ${genDate}   |   Exempt: ${_exNames || 'none'}   |   ${svwCountsSummary(list)}`,
    W/2, y+5, {align:'center'});
  y += 12;

  // Build table columns — invigilator columns follow the widest row
  const _n = Math.max(2, ...list.rows.map(r => svwRowCount(list, r)));
  const head = ['#', 'Class', ...Array.from({length:_n}, (_,i) => `Invigilator ${i+1}`), 'Note'];
  const body = list.rows.map((r, i) => [
    i+1,
    r.grade,
    ...Array.from({length:_n}, (_,ci) => r.teacherNames[ci] || (ci ? '' : '—')),
    svwRowCount(list, r) > 1 ? `${svwRowCount(list, r)} invigilators` : ''
  ]);

  // Column widths
  const usable = W - 8;
  const numW = 8, classW = 16, noteW = 30;
  const invW  = Math.floor((usable - numW - classW - noteW) / _n * 10) / 10;
  const colStyles = {
    0: {cellWidth: numW,   halign:'center'},
    1: {cellWidth: classW, fontStyle:'bold'}
  };
  for(let _ci = 0; _ci < _n; _ci++)
    colStyles[2 + _ci] = {cellWidth: invW, fontStyle: _ci === 0 ? 'bold' : 'normal', textColor: _ci === 0 ? undefined : [60,60,60]};
  colStyles[2 + _n] = {cellWidth: noteW,  fontSize:7, textColor:[100,130,100]};

  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.35,
    startY: y, margin:{left:4,right:4},
    head: [head],
    body,
    theme: 'grid',
    headStyles: {fillColor:[27,94,59], textColor:[255,255,255], fontStyle:'bold', fontSize:8, cellPadding:2},
    styles: {fontSize:9, cellPadding:2.5, halign:'left', lineColor:[0,0,0], lineWidth:0.3},
    columnStyles: colStyles,
    didParseCell(d){
      if(d.section==='body'){
        if(d.row.index%2===0) d.cell.styles.fillColor=[246,252,248];
        if(d.column.index===1) { d.cell.styles.fontStyle='bold'; d.cell.styles.fontSize=10; }
        // Highlight multi-invigilator rows
        if(svwRowCount(list, list.rows[d.row.index]) > 1){
          d.cell.styles.fillColor=[228,245,232];
        }
      }
    },
    didDrawPage(){ pdfFooter(doc); }
  });

  const _unalloc = svwUnallocated(list);
  let finalY = doc.lastAutoTable.finalY + 5;
  if(_unalloc.length){
    if(finalY > doc.internal.pageSize.getHeight() - 30){ doc.addPage(); finalY = 14; }
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(27,94,59);
    doc.text(`TEACHERS NOT ALLOCATED A CLASS (${_unalloc.length}):`, 4, finalY);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(60,60,60);
    const lines = doc.splitTextToSize(_unalloc.join('  ·  '), W - 8);
    doc.text(lines, 4, finalY + 5);
    finalY += 5 + lines.length * 4 + 3;
  }
  if(finalY < doc.internal.pageSize.getHeight() - 20){
    doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(100,130,100);
    doc.text(
      `Note: ${svwCountsSummary(list)}.  |  `+
      `Rotation applied — teachers with fewest prior supervisions assigned first.`,
      4, finalY
    );
  }

  addPageNumbers(doc);
  const fname = `Supervision_${list.examName.replace(/\s+/g,'_')}_${list.term.replace(/\s+/g,'_')}_${list.year}.pdf`;
  doc.save(fname);
  toast('📄 Supervision list exported as PDF');
}

// ── Export Word ──────────────────────────────────────────────────
function exportSupervisionWord(){
  const list = (db.supervisionLists||[]).find(l => l.createdAt === _svActiveId);
  if(!list) return toast('No list selected', true);

  if(typeof docx === 'undefined') return toast('Word export library not available', true);

  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = docx;

  const border = { style: BorderStyle.SINGLE, size: 4, color: '2E8B57' };
  const borders = { top:border, bottom:border, left:border, right:border };
  const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: 'C0D8C0' };
  const thinBorders = { top:thinBorder, bottom:thinBorder, left:thinBorder, right:thinBorder };

  const pageW = 11906; // A4 portrait in DXA
  const margins = 720;  // 0.5 inch
  const contentW = pageW - 2*margins;

  // Column count: # + class + N*invigil + note
  const _wn = Math.max(2, ...list.rows.map(r => svwRowCount(list, r)));
  const numW_dxa   = 500;
  const classW_dxa = 900;
  const noteW_dxa  = 1600;
  const invW_dxa   = Math.floor((contentW - numW_dxa - classW_dxa - noteW_dxa) / _wn);
  const colWidths  = [numW_dxa, classW_dxa, ...Array.from({length:_wn}, () => invW_dxa), noteW_dxa];

  const cell = (text, opts={}) => new TableCell({
    borders: opts.borders || thinBorders,
    width: { size: opts.width || invW_dxa, type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    margins: { top:60, bottom:60, left:100, right:100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text: String(text||''),
        bold: !!opts.bold,
        size:  opts.size || 20,
        color: opts.color || '000000',
        font: 'Arial'
      })]
    })]
  });

  // Header row
  const headerCols = ['#', 'Class', ...Array.from({length:_wn}, (_,i) => `Invigilator ${i+1}`), 'Note'];
  const headerRow = new TableRow({
    tableHeader: true,
    children: headerCols.map((h,i) => cell(h, {
      width: colWidths[i], bold:true, size:18, color:'FFFFFF',
      shade:'1B5E3B', borders: border
    }))
  });

  // Data rows
  const dataRows = list.rows.map((r,ri) => {
    const n = svwRowCount(list, r);
    const rowShade = n > 1 ? 'E4F5E8' : (ri%2===0 ? 'FFFFFF' : 'F3FAF5');
    const noteTxt = n > 1 ? `${n} invigilators` : '';
    const invCells = Array.from({length:_wn}, (_,ci) =>
      cell(r.teacherNames[ci]||(ci ? '' : '—'),
        {width:invW_dxa, bold:ci===0, size:ci===0?20:19, shade:rowShade, color:ci===0?'000000':'444444'}));
    return new TableRow({
      children: [
        cell(ri+1,   {width:numW_dxa,   align:AlignmentType.CENTER, shade:rowShade, size:18}),
        cell(r.grade,{width:classW_dxa, bold:true, size:22, color:'1B5E3B', shade:rowShade}),
        ...invCells,
        cell(noteTxt, {width:noteW_dxa, size:16, color:'3C763D', shade:rowShade})
      ]
    });
  });

  const genDate = new Date(list.createdAt).toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'});

  const doc2 = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: pageW, height: 16838 },
          margin: { top: margins, right: margins, bottom: margins, left: margins }
        }
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text:'SANTAPRIS ACADEMY', bold:true, size:32, font:'Arial', color:'1B5E3B' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text:'EXAM SUPERVISION LIST', bold:true, size:26, font:'Arial', color:'000000' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text:`${list.examName}  —  ${list.term} ${list.year}`, bold:true, size:24, font:'Arial', color:'2E8B57' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text:`Generated: ${genDate}   |   ${svwCountsSummary(list)}`, size:18, font:'Arial', color:'5A7A6A' })]
        }),
        // Table
        new Table({
          width: { size: contentW, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [headerRow, ...dataRows]
        }),
        new Paragraph({ spacing:{ before:200 },
          children:[new TextRun({text:`Notes: ${svwCountsSummary(list)}.  Exempt: ${((list.exemptNames && list.exemptNames.join(', ')) || SV_EXCLUDED.join(', ')) || 'none'}.`, size:16, font:'Arial', color:'5A7A6A', italics:true})] }),
        // Teachers with no class in this list
        ...(() => {
          const un = svwUnallocated(list);
          if(!un.length) return [];
          return [
            new Paragraph({ spacing:{ before:240 },
              children:[new TextRun({ text:`TEACHERS NOT ALLOCATED A CLASS (${un.length}):`, bold:true, size:20, font:'Arial', color:'1B5E3B' })] }),
            new Paragraph({
              children:[new TextRun({ text: un.join('  ·  '), size:18, font:'Arial', color:'000000' })] })
          ];
        })(),
      ]
    }]
  });

  Packer.toBlob(doc2).then(blob => {
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Supervision_${list.examName.replace(/\s+/g,'_')}_${list.term.replace(/\s+/g,'_')}_${list.year}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📝 Supervision list exported as Word document');
  }).catch(e => { console.error(e); toast('Word export failed: '+e.message, true); });
}

/* ─── end supervision ─── */

function renderClassTeachersPage(){
  const grid = document.getElementById('classTeachersGrid');
  if(!grid) return;

  // Sort teachers alphabetically for display
  const sorted = [...db.teachers].sort((a,b) => a.name.localeCompare(b.name));

  grid.innerHTML = ALL_GRADES.map(grade => {
    // Find ALL teachers currently assigned to this grade
    const assignedIds = new Set(
      db.teachers.filter(t => {
        const cts = (t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
        return cts.includes(grade);
      }).map(t => t.id)
    );

    const assignedList = [...assignedIds].map(id => {
      const t = db.teachers.find(x => x.id === id);
      return t ? fmtTeacher(t.name) : '';
    }).filter(Boolean).join(', ');

    // Build checkboxes for every teacher
    const checkboxes = sorted.map(t => {
      const checked = assignedIds.has(t.id) ? 'checked' : '';
      return `<label style="display:flex;align-items:center;gap:6px;padding:4px 0;
                             font-size:12px;cursor:pointer;color:var(--text-secondary)">
        <input type="checkbox" ${checked}
               onchange="toggleClassTeacher('${grade}','${t.id}',this.checked)"
               style="accent-color:var(--jungle-bright);width:14px;height:14px;cursor:pointer">
        <span>${fmtTeacher(t.name)}</span>
      </label>`;
    }).join('');

    const statusHtml = assignedIds.size > 0
      ? `<span style="color:var(--emerald)">✅ ${assignedList}</span>`
      : `<span style="color:var(--text-muted)">Not assigned</span>`;

    return `<div style="background:var(--navy);border:1px solid var(--border);
                        border-radius:10px;padding:14px 16px">
      <div style="font-size:13px;font-weight:800;color:var(--gold);
                  margin-bottom:8px;letter-spacing:.04em">Grade ${grade}</div>
      <div style="max-height:160px;overflow-y:auto;margin-bottom:8px;
                  padding:6px 8px;background:var(--surface-2);border-radius:7px;
                  border:1px solid var(--border)">
        ${sorted.length ? checkboxes : '<span style="font-size:11px;color:var(--text-muted)">No teachers registered</span>'}
      </div>
      <div style="font-size:11px;color:var(--text-muted)" id="ct_status_${grade}">
        ${statusHtml}
      </div>
    </div>`;
  }).join('');
}

function toggleClassTeacher(grade, teacherId, isChecked){
  const t = db.teachers.find(t => t.id === teacherId);
  if(!t) return;

  // Parse existing classTeacher string as comma-separated grades
  let grades = (t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);

  if(isChecked){
    if(!grades.includes(grade)) grades.push(grade);
  } else {
    grades = grades.filter(g => g !== grade);
  }
  t.classTeacher = grades.join(',');

  // Refresh the status label for this grade
  const statusEl = document.getElementById(`ct_status_${grade}`);
  if(statusEl){
    const assignedTeachers = db.teachers.filter(t => {
      return (t.classTeacher||'').split(',').map(s=>s.trim()).includes(grade);
    });
    statusEl.innerHTML = assignedTeachers.length
      ? `<span style="color:var(--emerald)">✅ ${assignedTeachers.map(t=>fmtTeacher(t.name)).join(', ')}</span>`
      : `<span style="color:var(--text-muted)">Not assigned</span>`;
  }

  saveDB();
  toast(`✅ Class teacher updated for Grade ${grade}`);
}

// Keep assignClassTeacher as alias for backward compat (used by old data / imports)
function assignClassTeacher(grade, teacherId){
  // Clear all teachers from this grade first (single-assign legacy mode)
  db.teachers.forEach(t => {
    let grades = (t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
    grades = grades.filter(g => g !== grade);
    t.classTeacher = grades.join(',');
  });
  if(teacherId){
    const t = db.teachers.find(t => t.id === teacherId);
    if(t){
      let grades = (t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
      if(!grades.includes(grade)) grades.push(grade);
      t.classTeacher = grades.join(',');
      const statusEl = document.getElementById(`ct_status_${grade}`);
      if(statusEl) statusEl.innerHTML = `<span style="color:var(--emerald)">✅ ${fmtTeacher(t.name)}</span>`;
    }
  } else {
    const statusEl = document.getElementById(`ct_status_${grade}`);
    if(statusEl) statusEl.innerHTML = `<span style="color:var(--text-muted)">Not assigned</span>`;
  }
  saveDB();
  toast('✅ Class teacher updated for Grade ' + grade);
}

/* ═══════════════════════════════════════════════════════════
   STUDENT SEARCH — dashboard live search with suggestions
   ═══════════════════════════════════════════════════════════ */
/* Launch score entry for student chosen from the top-bar search */
function _ssLaunchFromSearch(admNo){
  /* Phone fix: dismiss the on-screen keyboard first. A focused search input
     keeps the keyboard up and shifts fixed bottom-sheet geometry on Android,
     so taps land off-target and buttons feel "frozen". */
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  /* Launch token: if the user picks another student before the 80ms timer
     fires, the stale timer must not open the picker for the old student. */
  window._ssLaunchSeq = (window._ssLaunchSeq || 0) + 1;
  const mySeq = window._ssLaunchSeq;
  closeStudentSearch();
  const s = (db.students||[]).find(st => st.admNo === admNo);
  if(!s){ toast('Student not found', true); return; }

  /* Navigate to "Enter Scores" page */
  const navItem = [...document.querySelectorAll('.nav-item')]
    .find(el => el.textContent.trim().startsWith('Enter Scores'));
  showPage('addExam', navItem || null);

  /* Give the page a tick to render, then pre-fill and open the picker */
  setTimeout(function(){
    if(mySeq !== window._ssLaunchSeq) return; /* superseded by a newer launch */
    /* Reset any previous state */
    if(typeof ssReset === 'function') ssReset();

    /* Fill the name input on the Enter Scores page */
    const ni = document.getElementById('ss_nameInput');
    if(ni){ ni.value = s.fullName || ''; }

    /* Hide dropdown on that page */
    const dd = document.getElementById('ss_dropdown');
    if(dd) dd.style.display = 'none';

    /* Show the chip */
    const chip    = document.getElementById('ss_selectedChip');
    const chipLbl = document.getElementById('ss_chipLabel');
    if(chip && chipLbl){
      chipLbl.textContent = (s.fullName||'') + '  ·  Grade ' + (s.grade||'');
      chip.style.display  = 'flex';
    }

    /* Store selected student and open exam picker */
    _ssStudent = s;
    ssOpenExamPicker(s);
  }, 80);
}

function onStudentSearch(val){
  const q = val.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClearBtn');
  const sugBox   = document.getElementById('searchSuggestions');
  const wrap     = document.getElementById('searchWrap');

  if(clearBtn) clearBtn.style.display = q ? '' : 'none';
  if(wrap) wrap.style.borderColor = q ? 'var(--sky)' : '';

  if(!q || q.length < 1){ sugBox.style.display='none'; return; }

  // Match against fullName, admNo, first name, last name
  const results = db.students.filter(s=>{
    const name = (s.fullName||'').toLowerCase();
    const adm  = (s.admNo||'').toLowerCase();
    return name.includes(q) || adm.includes(q);
  }).slice(0,8);

  if(!results.length){
    sugBox.innerHTML = `<div style="padding:14px 16px;color:var(--text-muted);font-size:13px">No students found for "${val}"</div>`;
    sugBox.style.display='';
    return;
  }

  sugBox.innerHTML = results.map((s,i)=>`
    <div onclick="_ssLaunchFromSearch('${s.admNo}')"
      style="padding:10px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;
             border-bottom:1px solid var(--border);transition:background .15s"
      onmouseover="this.style.background='rgba(30,86,200,0.12)'"
      onmouseout="this.style.background=''"
    >
      <div style="width:32px;height:32px;border-radius:50%;background:rgba(30,86,200,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">
        ${s.gender==='Female'?'👧':'👦'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.fullName}</div>
        <div style="font-size:11px;color:var(--text-muted)">Grade ${s.grade} &nbsp;·&nbsp; ${s.admNo}</div>
      </div>
      <div style="font-size:11px;color:var(--gold);font-weight:700;flex-shrink:0;display:flex;align-items:center;gap:4px">
        <span style="background:rgba(30,86,200,0.15);border:1px solid rgba(30,86,200,0.35);border-radius:4px;padding:2px 7px;font-size:10px">${s.grade}</span>
        📝 Enter Scores →
      </div>
    </div>
  `).join('');
  /* Position the fixed dropdown under the search input */
  (function(){
    var inp = document.getElementById('studentSearchInput');
    if(!inp) return;
    var r = inp.getBoundingClientRect();
    sugBox.style.top   = (r.bottom + 6) + 'px';
    sugBox.style.left  = r.left + 'px';
    sugBox.style.width = Math.max(r.width, 320) + 'px';
  })();
  sugBox.style.display='';
}

/* ═══════════════════════════════════════════
   MOBILE MENU FUNCTIONS
   ═══════════════════════════════════════════ */
function openMobileMenu(){
  document.getElementById('mobileSidebar').classList.add('open');
  document.getElementById('mobileDrawerOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if(typeof setMobTab==='function') setMobTab('menu');
}
function closeMobileMenu(){
  document.getElementById('mobileSidebar').classList.remove('open');
  document.getElementById('mobileDrawerOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function setMobTab(page){
  document.querySelectorAll('.mob-tab').forEach(b => b.classList.remove('active'));
  const t = document.getElementById('mobTab_' + page);
  if(t) t.classList.add('active');
}

/* Which bottom tab is highlighted for a given page (falls back to "More") */
var _MOB_TAB_MAP = { dashboard:'dashboard', addExam:'addExam', exams:'exams', students:'students' };
function _mobTabKey(pageId){
  return (pageId in _MOB_TAB_MAP) ? _MOB_TAB_MAP[pageId] : 'menu';
}
function _syncMobTab(pageId){
  if(typeof setMobTab==='function') setMobTab(_mobTabKey(pageId));
}

/* Immersive pages that take the full screen: hide the bottom tab bar there
   so it never blocks content, sticky footers or on-screen keyboards. */
var _MOB_FULLSCREEN = { addExam:1, editScores:1, scoreEntry:1 };
function _applyMobFullscreen(pageId){
  const fs = (pageId in _MOB_FULLSCREEN);
  document.body.classList.toggle('mob-fullscreen', fs);
}

/* Swipe-to-close the mobile drawer */
(function(){
  var startX = 0;
  document.addEventListener('touchstart', function(e){
    startX = e.touches[0].clientX;
  }, {passive:true});
  document.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - startX;
    var sb = document.getElementById('mobileSidebar');
    if(sb && sb.classList.contains('open') && dx < -60) closeMobileMenu();
  }, {passive:true});
})();

function closeStudentSearch(){
  const inp  = document.getElementById('studentSearchInput');
  const sugg = document.getElementById('searchSuggestions');
  const clear= document.getElementById('searchClearBtn');
  const wrap = document.getElementById('searchWrap');
  if(inp){ inp.value=''; if(document.activeElement === inp && inp.blur) inp.blur(); }
  if(sugg) sugg.style.display='none';
  if(clear)clear.style.display='none';
  if(wrap) wrap.style.borderColor='';
}

/* Reposition top search dropdown on scroll/resize */
(function(){
  function _reposSugg(){
    var sugg = document.getElementById('searchSuggestions');
    var inp  = document.getElementById('studentSearchInput');
    if(!sugg || sugg.style.display==='none' || !inp) return;
    var r = inp.getBoundingClientRect();
    sugg.style.top  = (r.bottom + 6) + 'px';
    sugg.style.left = r.left + 'px';
    sugg.style.width = Math.max(r.width, 320) + 'px';
  }
  window.addEventListener('scroll', _reposSugg, true);
  window.addEventListener('resize', _reposSugg);
})();

function openStudentProfile(admNo){
  closeStudentSearch();
  const s = db.students.find(s=>s.admNo===admNo);
  if(!s) return toast('Student not found',true);

  // Find class teacher
  const ct = getClassTeacher(s.grade);
  const ctName = ct ? fmtTeacher(ct.name) : '—';

  const body = document.getElementById('studentProfileBody');
  body.innerHTML = `
    <div style="text-align:center;margin-bottom:18px">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(30,86,200,0.18);border:2px solid rgba(30,86,200,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 10px">
        ${s.gender==='Female'?'👧':'👦'}
      </div>
      <div style="font-size:18px;font-weight:800;color:var(--text)">${s.fullName}</div>
      <div style="font-size:12px;color:var(--sky);font-weight:600;margin-top:2px">Grade ${s.grade}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${profileRow('🆔','Admission No', s.admNo)}
      ${profileRow('🏫','Grade / Class', 'Grade ' + s.grade)}
      ${profileRow('⚧','Gender', s.gender||'—')}
      ${profileRow('📋','NEMIS No', s.nemis||'—')}
      ${profileRow('📝','Assessment No', s.assessment||'—')}
      ${profileRow('👨‍👩‍👦','Parent / Guardian', s.parent||'—')}
      ${profileRow('📞','Phone Number', s.phone||'—')}
      ${profileRow('👩‍🏫','Class Teacher', ctName)}
    </div>
  `;

  const modal = document.getElementById('studentProfileModal');
  modal.style.display='flex';
}

function profileRow(icon, label, value){
  return `<div style="background:var(--navy);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
    <div style="font-size:10px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">${icon} ${label}</div>
    <div style="font-size:13px;font-weight:700;color:var(--text)">${value}</div>
  </div>`;
}

function closeStudentProfile(){
  const modal = document.getElementById('studentProfileModal');
  if(modal) modal.style.display='none';
}

// Close modal on backdrop click
document.addEventListener('click', e=>{
  const modal = document.getElementById('studentProfileModal');
  if(modal && e.target===modal) closeStudentProfile();
  // Close suggestions when clicking outside
  const sugg = document.getElementById('searchSuggestions');
  const wrap = document.getElementById('searchWrap');
  if(sugg && sugg.style.display!=='none' && !wrap.contains(e.target) && !sugg.contains(e.target)){
    sugg.style.display='none';
  }
});

function loadSampleData(){
  if(db.students.some(s=>s._sample)){
    return toast('Sample data already loaded!', true);
  }

  // ── TEACHERS ──────────────────────────────────────────────
  const sampleTeachers = [
    { id:'TCH_S01', name:'Mr. James Otieno',   phone:'0712 345 001',
      assignments:[
        {subject:'MATHS', classes:['4N','4S','5N','5S']},
        {subject:'SCIE',  classes:['4N','4S']}
      ], classTeacher:'4N', _sample:true },
    { id:'TCH_S02', name:'Mrs. Grace Wanjiku',  phone:'0712 345 002',
      assignments:[
        {subject:'ENG',  classes:['4N','4S','4E','5N','5S','6N']},
        {subject:'KIS',  classes:['4N','4S','4E']}
      ], classTeacher:'4S', _sample:true },
    { id:'TCH_S03', name:'Mr. Peter Kamau',     phone:'0712 345 003',
      assignments:[
        {subject:'MATHS', classes:['7R','7B','8R']},
        {subject:'SCIE',  classes:['7R','7B']},
        {subject:'PTE',   classes:['7R','7B','8R','8B']}
      ], classTeacher:'7R', _sample:true },
    { id:'TCH_S04', name:'Ms. Faith Chebet',    phone:'0712 345 004',
      assignments:[
        {subject:'SST',  classes:['4N','4S','5N','7R','7B']},
        {subject:'CRE',  classes:['4N','4S','5N','5S']}
      ], classTeacher:'7B', _sample:true },
    { id:'TCH_S05', name:'Mr. David Mwangi',    phone:'0712 345 005',
      assignments:[
        {subject:'AGRIC', classes:['4N','4S','5N','5S','6N','7R','7B']},
        {subject:'C/A',   classes:['4N','4S','5N','5S','6N','7R','7B']}
      ], classTeacher:'5N', _sample:true },
  ];

  // ── STUDENTS ──────────────────────────────────────────────
  // Grade 4N — 8 students
  const grade4N = [
    ['Brian Omondi Otieno',   'M','Otieno Sr.','0700 111 001'],
    ['Cynthia Achieng Were',  'F','Were J.',   '0700 111 002'],
    ['Dennis Kipchoge Rotich','M','Rotich A.', '0700 111 003'],
    ['Esther Wambui Karanja', 'F','Karanja B.','0700 111 004'],
    ['Francis Mutua Mwenda',  'M','Mwenda P.', '0700 111 005'],
    ['Gloria Nekesa Simiyu',  'F','Simiyu J.', '0700 111 006'],
    ['Hassan Abdi Omar',      'M','Omar H.',   '0700 111 007'],
    ['Irene Cherotich Bett',  'F','Bett W.',   '0700 111 008'],
  ];
  // Grade 5N — 7 students
  const grade5N = [
    ['Alice Njeri Gitau',     'F','Gitau M.',  '0700 222 001'],
    ['Bernard Kiprotich Sang','M','Sang K.',   '0700 222 002'],
    ['Caroline Atieno Odero', 'F','Odero A.',  '0700 222 003'],
    ['David Wafula Barasa',   'M','Barasa F.', '0700 222 004'],
    ['Evelyn Moraa Onchoke',  'F','Onchoke B.','0700 222 005'],
    ['Felix Ochieng Ouma',    'M','Ouma D.',   '0700 222 006'],
    ['Hilda Auma Adongo',     'F','Adongo O.', '0700 222 007'],
  ];
  // Grade 7R — 8 students
  const grade7R = [
    ['Adrian Njoroge Kamau',  'M','Kamau N.',  '0700 333 001'],
    ['Beatrice Wanjiru Maina','F','Maina G.',  '0700 333 002'],
    ['Charles Ochieng Owino', 'M','Owino J.',  '0700 333 003'],
    ['Diana Wairimu Njeru',   'F','Njeru A.',  '0700 333 004'],
    ['Edwin Kipkirui Ruto',   'M','Ruto W.',   '0700 333 005'],
    ['Florence Adhiambo Were','F','Were P.',   '0700 333 006'],
    ['George Muthomi Kirimi', 'M','Kirimi T.', '0700 333 007'],
    ['Hellen Nyambura Njoki', 'F','Njoki S.',  '0700 333 008'],
  ];

  const allStudentDefs = [
    ...grade4N.map(r=>({grade:'4N',data:r})),
    ...grade5N.map(r=>({grade:'5N',data:r})),
    ...grade7R.map(r=>({grade:'7R',data:r})),
  ];

  // Assign admission numbers (continuing from current counter)
  const sampleStudents = allStudentDefs.map((s,i)=>{
    const admNo = 'SA' + String(db.counters.adm + i).padStart(4,'0');
    const nemis  = '2' + String(30000000 + db.counters.adm + i);
    const assNo  = 'P' + String(2000 + db.counters.adm + i);
    return {
      admNo, fullName:s.data[0], gender:s.data[1]==='M'?'Male':'Female',
      grade:s.grade, nemis, assessment:assNo,
      parent:s.data[3], phone:s.data[3],
      _sample:true
    };
  });
  db.counters.adm += sampleStudents.length;

  // ── EXAM SCORES helper ────────────────────────────────────
  function makeExamRecord(stu, examName, term, year, scoreMap){
    const subjects = getSubjects(stu.grade);
    const scores={}, rubrics={};
    let total=0;
    subjects.forEach(s=>{
      const v = scoreMap[s];
      if(v!==undefined){ scores[s]=v; rubrics[s]=getRubric(v, stu.grade, examName); total+=v; }
    });
    return { admNo:stu.admNo, name:stu.fullName, grade:stu.grade,
             term, year, examName, scores, rubrics, total, _sample:true };
  }

  // Random-ish but deterministic scores for realism
  const rand = (seed,min,max)=>{ let x=Math.sin(seed)*10000; x=x-Math.floor(x); return Math.round(min+x*(max-min)); };

  // Exam 1 : Mid-Term Exam — Term 1 2025
  const exam1Name='Mid-Term Exam', exam1Term='Term 1', exam1Year=2025;
  // Exam 2 : End Term Exam — Term 1 2025
  const exam2Name='End Term Exam', exam2Term='Term 1', exam2Year=2025;

  const sampleExams = [];

  sampleStudents.forEach((stu,idx)=>{
    const subjs456 = ['MATHS','ENG','KIS','SCIE','AGRIC','SST','CRE','C/A'];
    const subjs789 = [...subjs456,'PTE'];
    const subjs = stu.grade.startsWith('7')||stu.grade.startsWith('8')||stu.grade.startsWith('9') ? subjs789 : subjs456;

    // Exam 1 — mid term, moderate scores
    const map1={};
    subjs.forEach((s,si)=>{ map1[s]=rand(idx*100+si*7+1, 42, 88); });
    sampleExams.push(makeExamRecord(stu, exam1Name, exam1Term, exam1Year, map1));

    // Exam 2 — end term, slightly improved
    const map2={};
    subjs.forEach((s,si)=>{ map2[s]=Math.min(100, rand(idx*100+si*7+3, 50, 95)); });
    sampleExams.push(makeExamRecord(stu, exam2Name, exam2Term, exam2Year, map2));
  });

  // ── INJECT ────────────────────────────────────────────────
  sampleTeachers.forEach(t=>db.teachers.push(t));
  sampleStudents.forEach(s=>db.students.push(s));
  sampleExams.forEach(e=>db.exams.push(e));
  recalcRanks();
  saveDB();

  // Update UI
  document.getElementById('sampleDataBanner').style.display = '';
  document.getElementById('btnLoadSample').style.display = 'none';
  document.getElementById('btnDeleteSample').style.display = '';

  toast(`✅ Sample data loaded: ${sampleStudents.length} students, ${sampleTeachers.length} teachers, ${sampleExams.length} exam records`);
  closeModal();
  renderDashboard();
}

function deleteSampleData(){
  if(!confirm('Remove all sample data? This cannot be undone.')) return;
  const sBefore=db.students.length, tBefore=db.teachers.length, eBefore=db.exams.length;
  db.students = db.students.filter(s=>!s._sample);
  db.teachers = db.teachers.filter(t=>!t._sample);
  db.exams    = db.exams.filter(e=>!e._sample);
  recalcRanks();
  saveDB();
  const sR=sBefore-db.students.length, tR=tBefore-db.teachers.length, eR=eBefore-db.exams.length;
  document.getElementById('sampleDataBanner').style.display = 'none';
  document.getElementById('btnLoadSample').style.display = '';
  document.getElementById('btnDeleteSample').style.display = 'none';
  toast(`🗑 Removed: ${sR} students, ${tR} teachers, ${eR} exam records`);
  renderDashboard();
}

// On load — check if sample data is already present and restore button state
function checkSampleDataState(){
  const hasSample = db.students.some(s=>s._sample) || db.exams.some(e=>e._sample);
  document.getElementById('sampleDataBanner').style.display = hasSample ? '' : 'none';
  document.getElementById('btnLoadSample').style.display = hasSample ? 'none' : '';
  document.getElementById('btnDeleteSample').style.display = hasSample ? '' : 'none';
}


/* ═══════════════════════════════════════════════════════════
   EXCEL IMPORT ENGINE
   ═══════════════════════════════════════════════════════════ */

let _importData = [];     // raw rows from parsed file
let _importHeaders = [];  // header row from file
let _importFileName = '';

// ── Open / Close ─────────────────────────────────────────────
function openImportModal(){
  try { closeModal(); } catch(e) { console.warn('closeModal error:', e); }
  document.getElementById('importModal').style.display = 'block';
  resetImport();
}
function closeImportModal(){
  document.getElementById('importModal').style.display = 'none';
}

// ── File Handling ─────────────────────────────────────────────
function handleImportDrop(e){
  e.preventDefault();
  document.getElementById('importDropZone').style.borderColor = 'rgba(0,200,150,0.35)';
  const file = e.dataTransfer.files[0];
  if(file) handleImportFile(file);
}

function handleImportFile(file){
  if(!file) return;
  _importFileName = file.name;
  const ext = file.name.split('.').pop().toLowerCase();

  if(ext === 'csv'){
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  } else if(['xlsx','xls'].includes(ext)){
    ensureXLSX(function(){
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, {type:'array'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
        if(!raw.length){ toast('File appears empty', true); return; }
        _importHeaders = raw[0].map(h => String(h).trim());
        _importData    = raw.slice(1).filter(row => row.some(c => String(c).trim() !== ''));
        showImportStep2();
      } catch(err){
        toast('⚠️ Could not read file: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
    }); // end ensureXLSX
  } else {
    toast('Unsupported file type. Use .xlsx, .xls, or .csv', true);
  }
}

function parseCSV(text){
  const lines = text.split(/\r?\n/);
  const parse = line => {
    const result=[], re=/("([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
    let m;
    while((m=re.exec(line))!==null){
      result.push((m[2]!==undefined?m[2]:m[3]||'').replace(/""/g,'"').trim());
      if(re.lastIndex===line.length){re.lastIndex=0;break;}
    }
    return result;
  };
  const rows = lines.map(parse).filter(r=>r.some(c=>c!==''));
  if(!rows.length){ toast('CSV appears empty',true); return; }
  _importHeaders = rows[0].map(h=>String(h).trim());
  _importData    = rows.slice(1);
  showImportStep2();
}

// ── Step 2: Column Mapping UI ─────────────────────────────────
const IMPORT_FIELDS = [
  { key:'firstName',   label:'First Name *',      required:false, hint:'First / given name column' },
  { key:'surname',     label:'Surname *',          required:false, hint:'Last name / family name column' },
  { key:'fullName',    label:'Full Name',          required:false, hint:'Use if name is in one column' },
  { key:'gender',      label:'Gender *',           required:true,  hint:'M/F, Male/Female, Boy/Girl' },
  { key:'grade',       label:'Grade / Class *',    required:true,  hint:'e.g. 1E, 4N, 7R' },
  { key:'nemis',       label:'NEMIS No',           required:false, hint:'NEMIS registration number' },
  { key:'assessment',  label:'Assessment No',      required:false, hint:'KNEC assessment number' },
  { key:'parent',      label:'Parent/Guardian',    required:false, hint:'Parent or guardian name' },
  { key:'phone',       label:'Phone',              required:false, hint:'Contact number' },
];

function showImportStep2(){
  document.getElementById('importStep1').style.display = 'none';
  document.getElementById('importStep2').style.display = '';
  document.getElementById('importStep3').style.display = 'none';
  document.getElementById('importFileName').textContent  = _importFileName;
  document.getElementById('importRowCount').textContent  = _importData.length;
  document.getElementById('importColCount').textContent  = _importHeaders.length;
  document.getElementById('btnExecuteImport').style.display = 'none';
  document.getElementById('importPreviewWrap').style.display = 'none';
  document.getElementById('importValidationMsg').textContent = '';

  // Build mapping dropdowns — auto-guess matches
  const grid = document.getElementById('importMappingGrid');
  grid.innerHTML = IMPORT_FIELDS.map(f => {
    const guessed = autoGuessColumn(f.key, _importHeaders);
    const opts = ['<option value="">-- Skip --</option>',
      ..._importHeaders.map((h,i) => `<option value="${i}"${i===guessed?' selected':''}>${h}</option>`)
    ].join('');
    return `<div class="form-group">
      <label style="color:${f.required?'var(--rose)':'var(--text-secondary)'}">${f.label}</label>
      <select id="map_${f.key}" style="font-size:12px">${opts}</select>
      <div style="font-size:10px;color:var(--text-muted);margin-top:-4px">${f.hint}</div>
    </div>`;
  }).join('');
}

function autoGuessColumn(fieldKey, headers){
  const aliases = {
    firstName:   ['first name','firstname','first','given name','forename','fname','given'],
    surname:     ['surname','last name','lastname','family name','lname','last','second name'],
    // fullName only matches clearly combined-name headers — NOT 'first name' or 'name' alone
    fullName:    ['full name','fullname','student name','pupil name','learner name','student fullname','name of student','full names'],
    gender:      ['gender','sex','m/f'],
    grade:       ['grade','class','stream','form','year group'],
    nemis:       ['nemis','nemis no','nemis number','upi'],
    assessment:  ['assessment','assessment no','knec','assessment number','exam no'],
    parent:      ['parent','guardian','parent name','parent/guardian','father','mother'],
    phone:       ['phone','telephone','contact','mobile','cell','phone number','tel'],
  };
  const keys = aliases[fieldKey] || [];
  for(let i=0;i<headers.length;i++){
    const h = headers[i].toLowerCase().trim();
    if(keys.some(k => h === k || h.includes(k) || k.includes(h))) return i;
  }
  return -1;
}

// ── Preview Mapping ───────────────────────────────────────────
function previewImport(){
  const mapping = getMapping();
  const err = validateMapping(mapping);
  if(err){ document.getElementById('importValidationMsg').textContent = err; return; }
  document.getElementById('importValidationMsg').textContent = '';

  const preview = _importData.slice(0,5);
  const fields  = IMPORT_FIELDS.map(f => ({...f, colIdx: mapping[f.key]}));
  const usedFields = fields.filter(f => f.colIdx >= 0);

  // Preview table
  const head = document.getElementById('importPreviewHead');
  const body = document.getElementById('importPreviewBody');
  head.innerHTML = '<tr>' + usedFields.map(f=>`<th style="padding:5px 8px;font-size:10px;background:var(--navy-mid);color:var(--gold)">${f.label.replace(' *','')}</th>`).join('') + '</tr>';
  body.innerHTML = preview.map(row => {
    const cells = usedFields.map(f => {
      const val = f.colIdx >= 0 ? String(row[f.colIdx]||'').trim() : '';
      return `<td style="padding:4px 8px;font-size:11px;border-bottom:1px solid var(--border)">${val||'<span style="color:var(--text-muted)">—</span>'}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  document.getElementById('importPreviewWrap').style.display = '';
  document.getElementById('btnExecuteImport').style.display = '';
  document.getElementById('btnExecuteImport').textContent = `✅ Import ${_importData.length} Students`;
}

function getMapping(){
  const m = {};
  IMPORT_FIELDS.forEach(f => {
    const sel = document.getElementById(`map_${f.key}`);
    m[f.key] = sel ? parseInt(sel.value) : -1;
    if(isNaN(m[f.key])) m[f.key] = -1;
  });
  return m;
}

function validateMapping(m){
  const hasName = (m.firstName >= 0 && m.surname >= 0) || m.fullName >= 0;
  if(!hasName) return '⚠️ Map either (First Name + Surname) or Full Name';
  if(m.gender < 0) return '⚠️ Gender column is required';
  if(m.grade  < 0) return '⚠️ Grade/Class column is required';
  return null;
}

// ── Execute Import ────────────────────────────────────────────
function executeImport(){
  const mapping = getMapping();
  const err = validateMapping(mapping);
  if(err){ document.getElementById('importValidationMsg').textContent = err; return; }

  const VALID_GRADES = [...LP_GRADES,...GRADES];
  let imported = 0, skipped = 0, duplicates = 0;
  const errors = [];

  _importData.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed, +1 for header
    const get = colIdx => colIdx >= 0 ? String(row[colIdx]||'').trim() : '';

    // Name — prefer firstName+surname path; only use fullName col if no split columns mapped
    let fullName = '', first = '', last = '';
    const hasFirstSurname = mapping.firstName >= 0 && mapping.surname >= 0;
    if(hasFirstSurname){
      // Best path: separate first + surname columns
      first = get(mapping.firstName);
      last  = get(mapping.surname);
      fullName = [first, last].filter(Boolean).join(' ');
    } else if(mapping.firstName >= 0){
      // Only first name col mapped — try to split it
      const raw = get(mapping.firstName);
      const parts = raw.split(/\s+/);
      first = parts[0] || '';
      last  = parts.slice(1).join(' ') || '';
      fullName = raw;
    } else if(mapping.surname >= 0){
      // Only surname mapped
      last  = get(mapping.surname);
      fullName = last;
    } else if(mapping.fullName >= 0){
      // Single full-name column — split into first + last
      fullName = get(mapping.fullName);
      const parts = fullName.trim().split(/\s+/);
      first = parts[0] || '';
      last  = parts.slice(1).join(' ') || '';
    }
    // Ensure fullName is always first + last joined (never just first)
    fullName = [first, last].filter(Boolean).join(' ').trim();
    if(!fullName){ errors.push(`Row ${rowNum}: No name — skipped`); skipped++; return; }

    // Gender
    let gender = get(mapping.gender).toLowerCase();
    if(['m','male','boy','b'].includes(gender))       gender = 'Male';
    else if(['f','female','girl','g'].includes(gender)) gender = 'Female';
    else { errors.push(`Row ${rowNum}: Unrecognised gender "${get(mapping.gender)}" — skipped`); skipped++; return; }

    // Grade
    let grade = get(mapping.grade).toUpperCase().replace(/\s/g,'');
    if(!VALID_GRADES.includes(grade)){
      errors.push(`Row ${rowNum}: Invalid grade "${get(mapping.grade)}" — skipped`); skipped++; return;
    }

    // ── Duplicate detection ─────────────────────────────────
    const normName = fullName.toLowerCase().replace(/\s+/g,' ').trim();
    const isDuplicate = db.students.some(s =>
      s.grade === grade &&
      (s.fullName||'').toLowerCase().replace(/\s+/g,' ').trim() === normName
    );
    if(isDuplicate){
      errors.push(`Row ${rowNum}: "${fullName}" already exists in ${grade} — skipped`);
      duplicates++; skipped++; return;
    }

    // Optional fields
    const nemis      = get(mapping.nemis);
    const assessment = get(mapping.assessment);
    const parent     = get(mapping.parent);
    const phone      = get(mapping.phone);

    // Auto admission number
    if(!db.counters) db.counters = {adm:1,tch:1};
    const admNo = 'SA' + String(db.counters.adm).padStart(4,'0');
    db.counters.adm++;

    db.students.push({ admNo, first, last, fullName, gender, grade, nemis, assessment, parent, phone });
    imported++;
  });

  saveDB();
  updateCounts();

  // Show result
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importStep3').style.display = '';
  document.getElementById('importResultIcon').textContent  = errors.length === _importData.length ? '❌' : '✅';
  document.getElementById('importResultTitle').textContent = imported > 0 ? 'Import Complete!' : 'Nothing Imported';
  document.getElementById('importResultMsg').innerHTML =
    `<span style="color:var(--emerald);font-weight:700">${imported} student${imported!==1?'s':''} imported</span>` +
    (duplicates ? ` &nbsp;•&nbsp; <span style="color:var(--gold)">${duplicates} duplicate${duplicates!==1?'s':''} skipped</span>` : '') +
    (skipped-duplicates > 0 ? ` &nbsp;•&nbsp; <span style="color:var(--rose)">${skipped-duplicates} row${skipped-duplicates!==1?'s':''} skipped</span>` : '');

  if(errors.length){
    const errDiv = document.getElementById('importResultErrors');
    errDiv.style.display = '';
    errDiv.innerHTML = '<strong>Issues found:</strong><br>' + errors.map(e=>`• ${e}`).join('<br>');
  }
  if(imported > 0) toast(`📥 Imported ${imported} students!`);
}

// ── Reset ─────────────────────────────────────────────────────
function resetImport(){
  _importData = []; _importHeaders = []; _importFileName = '';
  document.getElementById('importStep1').style.display = '';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importStep3').style.display = 'none';
  document.getElementById('importFileInput').value = '';
  document.getElementById('importPreviewWrap').style.display = 'none';
  document.getElementById('btnExecuteImport').style.display = 'none';
  document.getElementById('importValidationMsg').textContent = '';
}

// ── Template Download ─────────────────────────────────────────

// ── Robust XLSX file download (works in standalone HTML / local files) ──────
function _xlsxDownload(wb, filename) {
  try {
    // Always use Blob+anchor for reliable cross-browser/local-file downloads
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob  = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var url   = URL.createObjectURL(blob);
    var a     = document.createElement('a');
    a.href    = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch(e) {
    // Last-resort: try XLSX.writeFile
    try { XLSX.writeFile(wb, filename); }
    catch(e2){ toast('Download failed: ' + (e2.message || e2), true); }
  }
}

function downloadImportTemplate(){
  ensureXLSX(function(){
  const headers = ['First Name','Surname','Gender','Grade','NEMIS No','Assessment No','Parent/Guardian','Phone'];
  const examples = [
    ['Alice','Njeri','Female','4N','380011223344','P001/2025','James Njeri','0712345001'],
    ['Brian','Omondi','Male','4N','380011223345','P002/2025','Mary Omondi','0712345002'],
    ['Charles','Mwangi','Male','7R','380011223346','P003/2025','Peter Mwangi','0712345003'],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  ws['!cols'] = headers.map(()=>({wch:18}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  _xlsxDownload(wb, 'Santapris_Student_Import_Template.xlsx');
  toast('📥 Student import template downloaded!');
  }); // end ensureXLSX
}


/* ═══════════════════════════════════════════════════════════
   TEACHER BOOKLIST ENGINE
   ═══════════════════════════════════════════════════════════ */

function populateBooklistTeacherDropdowns(){
  // Entry form teacher dropdown
  const sel = document.getElementById('bl_teacher');
  if(!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Select Teacher --</option>';
  const sorted = [...(db.teachers||[])].sort((a,b)=>a.name.localeCompare(b.name));
  sorted.forEach(t=>{
    const o=document.createElement('option');
    o.value=t.id;
    o.textContent=t.name;
    if(t.id===cur) o.selected=true;
    sel.appendChild(o);
  });

  // Filter dropdown
  const fsel = document.getElementById('bl_filterTeacher');
  if(!fsel) return;
  const fcur = fsel.value;
  fsel.innerHTML = '<option value="">All Teachers</option>';
  sorted.forEach(t=>{
    const o=document.createElement('option');
    o.value=t.id;
    o.textContent=t.name;
    if(t.id===fcur) o.selected=true;
    fsel.appendChild(o);
  });
}

function blUpdateTeacherInfo(){
  // Auto-set grade if teacher is a class teacher
  const tid = document.getElementById('bl_teacher').value;
  if(!tid) return;
  const teacher = db.teachers.find(t=>t.id===tid);
  if(teacher && teacher.classTeacher){
    const gsel = document.getElementById('bl_grade');
    if(gsel) gsel.value = teacher.classTeacher;
  }
}

function saveBookEntry(){
  const teacherId = document.getElementById('bl_teacher').value;
  const bookTitle = document.getElementById('bl_bookTitle').value.trim();
  const grade     = document.getElementById('bl_grade').value;
  const subject   = document.getElementById('bl_subject').value;
  const dateIssued= document.getElementById('bl_dateIssued').value;
  const qty       = parseInt(document.getElementById('bl_qty').value)||1;
  const notes     = document.getElementById('bl_notes').value.trim();

  if(!teacherId){ toast('Select a teacher', true); return; }
  if(!bookTitle){ toast('Enter a book title', true); return; }
  if(!grade)    { toast('Select a grade', true); return; }

  const teacher = db.teachers.find(t=>t.id===teacherId);
  if(!teacher){ toast('Teacher not found', true); return; }

  const entry = {
    id:       Date.now() + Math.random().toString(36).slice(2,6),
    teacherId,
    teacherName: fmtTeacher(teacher.name),
    bookTitle,
    grade,
    subject:  subject||'—',
    dateIssued: dateIssued || new Date().toISOString().slice(0,10),
    qty,
    notes:    notes||'',
    dateAdded: new Date().toISOString()
  };

  if(!db.booklist) db.booklist = [];
  db.booklist.push(entry);
  saveDB();
  clearBookForm();
  renderBooklist();
  toast(`📚 Book entry saved for ${fmtTeacher(teacher.name)}`);
}

function clearBookForm(){
  document.getElementById('bl_teacher').value = '';
  document.getElementById('bl_bookTitle').value = '';
  document.getElementById('bl_grade').value = '';
  document.getElementById('bl_subject').value = '';
  document.getElementById('bl_dateIssued').value = '';
  document.getElementById('bl_qty').value = '1';
  document.getElementById('bl_notes').value = '';
}

function deleteBookEntry(id){
  if(!confirm('Delete this book entry?')) return;
  db.booklist = db.booklist.filter(e=>e.id!==id);
  saveDB();
  renderBooklist();
  toast('🗑 Entry deleted');
}

function renderBooklist(){
  const filterTeacher = document.getElementById('bl_filterTeacher')?.value||'';
  const filterGrade   = document.getElementById('bl_filterGrade')?.value||'';
  const search        = (document.getElementById('bl_search')?.value||'').toLowerCase();
  const tbody = document.getElementById('blBody');
  if(!tbody) return;

  let entries = [...(db.booklist||[])];

  // Apply filters
  if(filterTeacher) entries = entries.filter(e=>e.teacherId===filterTeacher);
  if(filterGrade)   entries = entries.filter(e=>e.grade===filterGrade||e.grade==='ALL');
  if(search)        entries = entries.filter(e=>
    e.bookTitle.toLowerCase().includes(search)||
    e.teacherName.toLowerCase().includes(search)||
    (e.notes||'').toLowerCase().includes(search)
  );

  // Sort: by teacher name, then date issued
  entries.sort((a,b)=>a.teacherName.localeCompare(b.teacherName)||a.dateIssued.localeCompare(b.dateIssued));

  document.getElementById('blCount').textContent = entries.length;

  if(!entries.length){
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📚</div><p>No entries match your filter.</p></div></td></tr>';
    updateBooklistSummary();
    return;
  }

  tbody.innerHTML = entries.map((e,i)=>{
    const dateStr = e.dateIssued ? new Date(e.dateIssued+'T00:00:00').toLocaleDateString('en-KE') : '—';
    return `<tr>
      <td style="text-align:center;color:var(--text-muted);font-size:12px">${i+1}</td>
      <td style="font-weight:600;color:var(--sky)">${e.teacherName}</td>
      <td style="font-weight:600">${e.bookTitle}</td>
      <td style="text-align:center"><span class="badge badge-blue">${e.grade}</span></td>
      <td style="text-align:center;font-size:12px;color:var(--text-muted)">${e.subject||'—'}</td>
      <td style="text-align:center;font-family:'JetBrains Mono','Courier New',Courier,monospace;font-weight:700;color:var(--gold)">${e.qty}</td>
      <td style="text-align:center;font-size:12px;color:var(--text-muted)">${dateStr}</td>
      <td style="font-size:11px;color:var(--text-muted)">${e.notes||'—'}</td>
      <td style="text-align:center">
        <button onclick="deleteBookEntry('${e.id}')" class="btn btn-danger" style="padding:4px 10px;font-size:11px">🗑</button>
      </td>
    </tr>`;
  }).join('');

  updateBooklistSummary();
}

function updateBooklistSummary(){
  const all = db.booklist||[];
  const totalEntries = all.length;
  const totalBooks   = all.reduce((a,e)=>a+(e.qty||1),0);
  const teacherSet   = new Set(all.map(e=>e.teacherId)).size;
  const summEl = document.getElementById('blSummary');
  if(summEl){
    summEl.style.display = totalEntries ? 'flex' : 'none';
  }
  const te = document.getElementById('blTotalEntries');
  const tb = document.getElementById('blTotalBooks');
  const tw = document.getElementById('blTeachersWithBooks');
  if(te) te.textContent = totalEntries;
  if(tb) tb.textContent = totalBooks;
  if(tw) tw.textContent = teacherSet;
}

/* ─── PDF helpers shared by both booklist exports ─── */
function _blPdfTableForTeacher(doc, teacher, entries, startY, isFirst){
  const W = doc.internal.pageSize.getWidth();
  // Teacher name header block
  doc.setFillColor(255,220,220);
  doc.roundedRect(4, startY, W-8, 10, 2, 2, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.setTextColor(242,199,68);
  doc.text('TEACHER:  ' + fmtTeacher(teacher.name), 8, startY+7);
  const classTag = teacher.classTeacher ? `Class Teacher: ${teacher.classTeacher}` : '';
  if(classTag){
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(160,190,230);
    doc.text(classTag, W-6, startY+7, {align:'right'});
  }
  startY += 13;

  const totalBooks = entries.reduce((a,e)=>a+(e.qty||1),0);
  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY,
    margin:{left:4, right:4},
    head:[['#','Book Title','Grade','Subject','Qty','Date Issued','Notes']],
    body: entries.map((e,i)=>{
      const dateStr = e.dateIssued ? new Date(e.dateIssued+'T00:00:00').toLocaleDateString('en-KE') : '—';
      return[i+1, e.bookTitle, e.grade, e.subject||'—', e.qty||1, dateStr, e.notes||'—'];
    }),
    foot:[[
      '','',`Total: ${entries.length} titles`,'','',
      `Total Books: ${totalBooks}`,''
    ]],
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7.5,cellPadding:1.5},
    styles:{fontSize:8,cellPadding:1.5,lineColor:[0,0,0],lineWidth:0.4},
    footStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:7.5},
    columnStyles:{
      0:{cellWidth:8,halign:'center'},
      1:{cellWidth:'auto',fontStyle:'bold'},
      2:{cellWidth:15,halign:'center'},
      3:{cellWidth:20,halign:'center'},
      4:{cellWidth:10,halign:'center'},
      5:{cellWidth:22,halign:'center'},
      6:{cellWidth:30}
    },
    didParseCell(d){
      if(d.section==='body'&&d.row.index%2===0) d.cell.styles.fillColor=[246,249,255];
    },
    didDrawPage(){ pdfFooter(doc); }
  });
  return doc.lastAutoTable.finalY;
}

/* ─── Export: single teacher booklist ─── */
function exportSingleTeacherBooklist(){
  if(!db.teachers||!db.teachers.length){ toast('No teachers registered', true); return; }
  if(!(db.booklist||[]).length){ toast('No book entries recorded', true); return; }

  // Show teacher picker dialog using a modal-free inline approach
  const tnames = [...new Set((db.booklist||[]).map(e=>e.teacherId))];
  if(!tnames.length){ toast('No book entries recorded', true); return; }

  // Build a quick picker overlay
  const overlay = document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:4000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center';
  const box = document.createElement('div');
  box.style.cssText='background:var(--surface);border:1px solid var(--border-bright);border-radius:12px;padding:28px;min-width:340px;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.5)';
  const teacherOptions = db.teachers
    .filter(t=>tnames.includes(t.id))
    .sort((a,b)=>a.name.localeCompare(b.name))
    .map(t=>`<option value="${t.id}">${fmtTeacher(t.name)}</option>`).join('');
  box.innerHTML=`
    <div style="font-size:16px;font-weight:700;color:var(--sky);margin-bottom:16px">📄 Export Single Teacher Booklist</div>
    <div class="form-group" style="margin-bottom:16px">
      <label>Select Teacher</label>
      <select id="_blPickTeacher" style="width:100%">
        <option value="">-- Select Teacher --</option>
        ${teacherOptions}
      </select>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-ghost">Cancel</button>
      <button class="btn btn-pdf" onclick="
        const tid=document.getElementById('_blPickTeacher').value;
        if(!tid){toast('Select a teacher',true);return;}
        this.closest('div[style*=fixed]').remove();
        _doExportSingleTeacherBooklist(tid);
      ">📄 Export PDF</button>
    </div>
  `;
  overlay.appendChild(box);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function _doExportSingleTeacherBooklist(teacherId){
  const teacher = db.teachers.find(t=>t.id===teacherId);
  if(!teacher){ toast('Teacher not found', true); return; }
  const entries = [...(db.booklist||[]).filter(e=>e.teacherId===teacherId)]
    .sort((a,b)=>a.dateIssued.localeCompare(b.dateIssued));
  if(!entries.length){ toast('No book entries for '+fmtTeacher(teacher.name), true); return; }

  const jsPDF=window._getJsPDF();
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth();

  const totalBooks=entries.reduce((a,e)=>a+(e.qty||1),0);
  let y=pdfHeader(doc,'TEACHER BOOKLIST',`${fmtTeacher(teacher.name)}  |  ${entries.length} title(s)  |  ${totalBooks} book(s)`);

  _blPdfTableForTeacher(doc, teacher, entries, y, true);
  addPageNumbers(doc);
  doc.save(`Booklist_${teacher.name.replace(/\s+/g,'_')}.pdf`);
  toast(`📄 Booklist exported for ${teacher.name}`);
}

/* ─── Export: ALL teachers booklist (bulk, one PDF) ─── */
function exportAllTeachersBooklist(){
  if(!(db.booklist||[]).length){ toast('No book entries recorded', true); return; }

  // Get all teachers who have at least one entry, sorted by name
  const teacherIds = [...new Set((db.booklist||[]).map(e=>e.teacherId))];
  const teachers = db.teachers.filter(t=>teacherIds.includes(t.id))
                              .sort((a,b)=>a.name.localeCompare(b.name));
  if(!teachers.length){ toast('No teacher entries found', true); return; }

  const jsPDF=window._getJsPDF();
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  const totalAllBooks=(db.booklist||[]).reduce((a,e)=>a+(e.qty||1),0);

  let y=pdfHeader(doc,'ALL TEACHERS — BOOKLIST',
    `${teachers.length} teacher(s)  |  ${(db.booklist||[]).length} entries  |  ${totalAllBooks} total books`);

  // ── Summary table first ──
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(242,199,68);
  doc.text('SUMMARY', 10, y+1); y+=5;
  doc.autoTable({
    tableLineColor:[0,0,0], tableLineWidth:0.4,
    startY:y, margin:{left:4,right:4},
    head:[['Teacher Name','Class','Titles Issued','Total Books']],
    body:teachers.map(t=>{
      const te=(db.booklist||[]).filter(e=>e.teacherId===t.id);
      const tot=te.reduce((a,e)=>a+(e.qty||1),0);
      const _bctGrades=(t.classTeacher||'').split(',').map(s=>s.trim()).filter(Boolean);
      return[fmtTeacher(t.name), _bctGrades.join(', ')||'—', te.length, tot];
    }),
    theme:'grid',
    headStyles:{fillColor:[255,220,220],textColor:[0,0,0],fontStyle:'bold',fontSize:8,cellPadding:2},
    styles:{fontSize:8.5,cellPadding:2,lineColor:[0,0,0],lineWidth:0.4},
    columnStyles:{0:{cellWidth:'auto',fontStyle:'bold'},1:{cellWidth:20,halign:'center'},2:{cellWidth:28,halign:'center'},3:{cellWidth:28,halign:'center'}},
    didParseCell(d){if(d.section==='body'&&d.row.index%2===0)d.cell.styles.fillColor=[246,249,255];},
    didDrawPage(){pdfFooter(doc);}
  });
  y=doc.lastAutoTable.finalY+8;

  // ── Per-teacher detail pages ──
  teachers.forEach((teacher,idx)=>{
    const entries=[...(db.booklist||[]).filter(e=>e.teacherId===teacher.id)]
      .sort((a,b)=>a.dateIssued.localeCompare(b.dateIssued));
    if(!entries.length) return;

    // Check if enough space remains on current page (need at least 60mm)
    const pageH=doc.internal.pageSize.getHeight();
    if(y > pageH - 70){
      doc.addPage();
      y=pdfHeader(doc,'ALL TEACHERS — BOOKLIST (cont.)',`${fmtTeacher(teacher.name)}`);
    }

    y=_blPdfTableForTeacher(doc, teacher, entries, y, idx===0);
    y+=12; // spacing between teachers
  });

  addPageNumbers(doc);
  doc.save(`All_Teachers_Booklist_${new Date().toISOString().slice(0,10)}.pdf`);
  toast(`📚 Bulk booklist exported — ${teachers.length} teacher(s)`);
}


/* ═══════════════════════════════════════════════════════════
   IMAGE IMPORT ENGINE — Extract exam scores from a photo
   Uses Anthropic Claude Vision API
   ═══════════════════════════════════════════════════════════ */

let _imgBase64 = null;
let _imgMimeType = 'image/jpeg';
let _imgExtractedRows = []; // [{name, scores:{...}}]

function openImageImportModal(){
  closeModal();
  resetImgImport();
  document.getElementById('imgImportModal').style.display = '';
}
function closeImageImportModal(){
  document.getElementById('imgImportModal').style.display = 'none';
}

function handleImgDrop(e){
  e.preventDefault();
  document.getElementById('imgDropZone').style.borderColor = 'rgba(242,199,68,0.35)';
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) handleImgFile(file);
  else toast('Please drop an image file', true);
}

function handleImgFile(file){
  if(!file) return;
  _imgMimeType = file.type || 'image/jpeg';
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    _imgBase64 = dataUrl.split(',')[1];
    document.getElementById('imgPreview').src = dataUrl;
    document.getElementById('imgPreviewWrap').style.display = '';
  };
  reader.readAsDataURL(file);
}

function resetImgImport(){
  _imgBase64 = null;
  _imgExtractedRows = [];
  document.getElementById('imgFileInput').value = '';
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgDropZone').style.borderColor = 'rgba(242,199,68,0.35)';
  ['imgStep1','imgStep2','imgStep3','imgStep4'].forEach((id,i)=>{
    document.getElementById(id).style.display = i===0?'':'none';
  });
  const pb = document.getElementById('imgProgressBar');
  if(pb) pb.style.width = '0%';
}

async function extractScoresFromImage(){
  if(!_imgBase64){ toast('No image loaded', true); return; }

  // Move to step 2 (loading)
  document.getElementById('imgStep1').style.display = 'none';
  document.getElementById('imgStep2').style.display = '';

  // Animate progress bar
  const pb = document.getElementById('imgProgressBar');
  let prog = 0;
  const progInterval = setInterval(()=>{ prog = Math.min(prog+3, 85); pb.style.width = prog+'%'; }, 150);

  try {
    const prompt = `You are an expert at reading school marksheets and exam score tables.
Carefully examine this image of a marksheet or exam results table.
Extract ALL student names and their scores for each subject.

Return ONLY valid JSON in this exact format — no markdown, no explanation, no code fences:
{
  "subjects": ["MATHS","ENG","KIS","SCIE","SST","CRE"],
  "rows": [
    {"name": "JOHN KAMAU", "scores": {"MATHS": 85, "ENG": 72, "KIS": 68}},
    {"name": "MARY WANJIKU", "scores": {"MATHS": 91, "ENG": 88}}
  ]
}

Rules:
- Use the exact subject abbreviations visible in the image
- Only include scores that are clearly visible numbers (0-100)
- If a score is blank/absent/dash, omit it from that student's scores object
- Write student names in UPPERCASE
- Include every student row you can see
- The "subjects" array should list all subjects found in the table header`;

    const apiKey = (document.getElementById('img_apiKey')?.value || '').trim();
    if(!apiKey){ throw new Error('Enter your Anthropic API key above the image upload area.'); }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: _imgMimeType, data: _imgBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    clearInterval(progInterval);
    pb.style.width = '100%';

    if(!response.ok){
      const err = await response.json().catch(()=>({}));
      throw new Error(err.error?.message || `API error ${response.status} — check API key or network`);
    }

    const data = await response.json();
    const raw = data.content.map(c=>c.text||'').join('').trim();

    // Parse JSON (strip any accidental markdown fences)
    const cleaned = raw.replace(/^```[a-z]*\n?/,'').replace(/```$/,'').trim();
    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch(e){ throw new Error('AI returned unexpected format. Try a clearer image.'); }

    if(!parsed.rows || !parsed.rows.length) throw new Error('No student rows found in the image.');

    _imgExtractedRows = parsed.rows;
    const subjects = parsed.subjects || Object.keys(parsed.rows[0]?.scores || {});

    // Show step 3
    document.getElementById('imgStep2').style.display = 'none';
    document.getElementById('imgStep3').style.display = '';

    const info = document.getElementById('imgExtractInfo');
    info.textContent = `AI extracted ${parsed.rows.length} student record(s) with ${subjects.length} subject column(s): ${subjects.join(', ')}`;

    _imgRenderMatchTable(parsed.rows, subjects, '');

  } catch(err){
    clearInterval(progInterval);
    pb.style.width = '0%';
    document.getElementById('imgStep2').style.display = 'none';
    document.getElementById('imgStep1').style.display = '';
    document.getElementById('imgPreviewWrap').style.display = '';
    const msg = err.message||'Extraction failed';
    toast('❌ ' + msg, true);
  }
}

function imgOnGradeChange(){
  const grade = document.getElementById('img_grade').value;
  if(!_imgExtractedRows.length) return;
  const subjects = _imgGetSubjectsFromRows(_imgExtractedRows);
  _imgRenderMatchTable(_imgExtractedRows, subjects, grade);
}

function _imgGetSubjectsFromRows(rows){
  const subjSet = new Set();
  rows.forEach(r=>Object.keys(r.scores||{}).forEach(s=>subjSet.add(s)));
  return [...subjSet];
}

function _imgFuzzyMatch(name, studentList){
  // Try exact match first
  const nameUC = name.toUpperCase().trim();
  let best = null, bestScore = 0;
  studentList.forEach(s=>{
    const sName = s.fullName.toUpperCase();
    // Exact
    if(sName === nameUC) { best = s; bestScore = 100; return; }
    // Check if all words of extracted name appear in student name
    const words = nameUC.split(/\s+/).filter(w=>w.length>1);
    const matches = words.filter(w=>sName.includes(w)).length;
    const score = words.length ? (matches/words.length)*80 : 0;
    // Levenshtein-lite: check first+last name substring
    if(score > bestScore){ bestScore = score; best = s; }
  });
  return bestScore >= 50 ? { student: best, confidence: bestScore } : null;
}

function _imgRenderMatchTable(rows, subjects, grade){
  const tbody = document.getElementById('imgMatchBody');
  const gradeStudents = grade ? db.students.filter(s=>s.grade===grade) : [];

  tbody.innerHTML = rows.map((row, idx)=>{
    const match = grade ? _imgFuzzyMatch(row.name, gradeStudents) : null;
    const matchedAdm = match ? match.student.admNo : '';
    const matchLabel = match ? `✅ ${match.student.fullName} (${match.student.admNo})` : '— No match';
    const matchColor = match ? 'var(--emerald)' : 'var(--rose)';
    const actionSel = match ? 'matched' : 'create';

    // Student picker
    const studentOpts = gradeStudents.map(s=>
      `<option value="${s.admNo}" ${s.admNo===matchedAdm?'selected':''}>${s.fullName} (${s.admNo})</option>`
    ).join('');

    // Score inputs
    const scoreInputs = subjects.map(subj=>{
      const val = row.scores[subj] !== undefined ? row.scores[subj] : '';
      return `<span style="display:inline-flex;flex-direction:column;align-items:center;margin-right:6px">
        <span style="font-size:9px;color:var(--text-muted)">${subj}</span>
        <input type="number" min="0" max="100" value="${val}" placeholder="—"
               style="width:48px;padding:3px 4px;font-size:11px;text-align:center;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;color:var(--text-primary)"
               data-row="${idx}" data-subj="${subj}" class="img-score-input">
      </span>`;
    }).join('');

    return `<tr id="imgRow_${idx}">
      <td style="text-align:center;color:var(--text-muted)">${idx+1}</td>
      <td style="font-weight:700;color:var(--sky)">${row.name}</td>
      <td>
        ${grade
          ? `<select id="imgMatchSel_${idx}" onchange="imgOnMatchChange(${idx})"
                    style="font-size:11px;max-width:200px;color:var(--text-primary);background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:3px 6px">
              <option value="">-- Create New Student --</option>
              ${studentOpts}
            </select>`
          : `<span style="color:var(--text-muted);font-size:11px">Select grade first</span>`
        }
      </td>
      <td>
        <select id="imgAction_${idx}" onchange="imgOnActionChange(${idx})"
                style="font-size:11px;color:var(--text-primary);background:var(--surface-2);border:1px solid var(--border);border-radius:4px;padding:3px 6px">
          <option value="import" ${actionSel!=='skip'?'selected':''}>✅ Import</option>
          <option value="skip">⏭ Skip</option>
        </select>
      </td>
      <td style="white-space:nowrap">${scoreInputs}</td>
    </tr>`;
  }).join('');
}

function imgOnMatchChange(idx){
  // When a student is manually selected, update action to import
  const sel = document.getElementById('imgMatchSel_'+idx);
  const actSel = document.getElementById('imgAction_'+idx);
  if(sel && actSel && sel.value) actSel.value = 'import';
}

function imgOnActionChange(idx){ /* UI only — handled on save */ }

function saveImageImportedExam(){
  const examName = document.getElementById('img_examName').value.trim();
  const grade    = document.getElementById('img_grade').value;
  const term     = document.getElementById('img_term').value;
  const year     = document.getElementById('img_year').value;
  const msgEl    = document.getElementById('imgSaveMsg');

  if(!examName){ msgEl.textContent='Enter an exam name'; return; }
  if(!grade)   { msgEl.textContent='Select a grade'; return; }
  msgEl.textContent = '';

  const subjects = _imgGetSubjectsFromRows(_imgExtractedRows);
  let imported = 0, skipped = 0, created = 0;

  _imgExtractedRows.forEach((row, idx)=>{
    const actionEl = document.getElementById('imgAction_'+idx);
    if(actionEl && actionEl.value === 'skip'){ skipped++; return; }

    // Collect scores from editable inputs
    const scores = {}, rubrics = {};
    let total = 0;
    subjects.forEach(subj=>{
      const inputs = document.querySelectorAll(`.img-score-input[data-row="${idx}"][data-subj="${subj}"]`);
      const el = inputs[0];
      if(el && el.value !== '' && !isNaN(el.value)){
        const v = parseFloat(el.value);
        scores[subj] = v;
        rubrics[subj] = getRubric(v, grade, examName);
        total += v;
      }
    });

    if(!Object.keys(scores).length){ skipped++; return; }

    // Raw snapshot (as-typed values, pre-conversion) for the raw store.
    var _rawS2 = Object.assign({}, scores);
    // Score conversion: raw values -> % when constants set for grade+exam.
    var _convRec2 = (typeof convApplyToRecord==='function')
      ? convApplyToRecord(grade, examName, {scores:scores, rubrics:rubrics, subScores:{}, total:total})
      : null;
    if(_convRec2) total = _convRec2.total;

    // Resolve student
    let admNo, studentName;
    const matchSel = document.getElementById('imgMatchSel_'+idx);
    if(matchSel && matchSel.value){
      // Use existing student
      const st = db.students.find(s=>s.admNo===matchSel.value);
      admNo = st ? st.admNo : null;
      studentName = st ? st.fullName : row.name;
    } else {
      // Create new student
      if(!db.counters.adm) db.counters.adm = 1;
      admNo = 'SA' + String(db.counters.adm).padStart(4,'0');
      db.counters.adm++;
      const nameParts = row.name.split(/\s+/);
      const first = nameParts[0] || 'Unknown';
      const last  = nameParts.slice(1).join(' ') || '';
      studentName = row.name;
      db.students.push({
        admNo, first, last,
        fullName: row.name,
        grade, gender:'Unknown', parent:'', phone:'', nemis:'', assessment:'',
        dateAdded: new Date().toISOString()
      });
      created++;
    }

    if(!admNo){ skipped++; return; }

    // Merge over any existing record (never replace): the photo may cover
    // only some subjects, and must keep previously submitted scores and
    // sub-components. Photo values win per subject.
    const prevImg = db.exams.find(e=>e.admNo===admNo&&(e.examName||'')===examName&&e.grade===grade);
    const mS = Object.assign({}, (prevImg&&prevImg.scores)||{}, scores);
    const mR = Object.assign({}, (prevImg&&prevImg.rubrics)||{}, rubrics);
    const mSub = Object.assign({}, (prevImg&&prevImg.subScores)||{});
    let mT = 0;
    Object.keys(mS).forEach(s => { if(typeof mS[s]==='number') mT+=mS[s]; });
    // Remove any existing exam record for this student+exam+grade
    db.exams = db.exams.filter(e=>!(e.admNo===admNo&&(e.examName||'Untitled Exam')===examName&&e.grade===grade));

    db.exams.push({
      admNo, name: studentName, grade, examName, examCode: examCode(examName, term, year), term, year,
      scores:mS, rubrics:mR, subScores:mSub, total:mT, rank: null
    });
    // Merge the as-typed raw values into the stored raw row (keeps the rest).
    if(typeof mergeRawRow==='function')
      mergeRawRow(admNo, examName, term, year, {fullName:studentName}, grade,
        examCode(examName, term, year), _rawS2, {});
    else if(typeof upsertRawRow==='function')
      upsertRawRow({admNo, name: studentName, grade, examName,
        examCode: examCode(examName, term, year), term, year, scores:_rawS2, subScores:{}});
    // Newly-appearing subjects are explicit re-add intent (clears tombs).
    if(prevImg && prevImg.scores && typeof _stageForceSubjects==='function'){
      const addImg = Object.keys(scores).filter(s => prevImg.scores[s]===undefined);
      if(addImg.length){
        const fm = {};
        fm[_ssExamKey(admNo,examName,term,year)] = addImg;
        _stageForceSubjects(fm);
      }
    }
    imported++;
  });

  recalcRanks();
  saveDB();

  // Show done step
  document.getElementById('imgStep3').style.display = 'none';
  document.getElementById('imgStep4').style.display = '';
  document.getElementById('imgDoneTitle').textContent = 'Import Complete!';
  document.getElementById('imgDoneMsg').innerHTML =
    `<strong style="color:var(--emerald)">${imported}</strong> records imported&nbsp;&nbsp;•&nbsp;&nbsp;` +
    `<strong style="color:var(--gold)">${created}</strong> new student${created!==1?'s':''} created&nbsp;&nbsp;•&nbsp;&nbsp;` +
    `<strong style="color:var(--text-muted)">${skipped}</strong> skipped`;
  toast(`✅ ${imported} exam records saved`);
}

/* ═══ EXPOSE KEY FUNCTIONS GLOBALLY for new Function() calls from 13-nav-groups.js ═══ */
window.showPage = showPage;
window.openImportModal = openImportModal;
window.openTeacherImportModal = openTeacherImportModal;
window.openDeleteGradeModal = openDeleteGradeModal;
window.openDeleteExamModal = openDeleteExamModal;
window.openMeanScoresModal = openMeanScoresModal;
window.openImageImportModal = openImageImportModal;
window.exportPortableHTML = exportPortableHTML;
window.exportDataJSON = exportDataJSON;
window.onStudentSearch = onStudentSearch;
window.closeModal = closeModal;
window.closeMobileMenu = closeMobileMenu;
window.toast = toast;
window.getCurrentRole = getCurrentRole;

