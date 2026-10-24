
/* ══════════════════════════════════════════════════════════════
   MARKSHEET TEMPLATE MODAL  –  grade-picker + student pre-fill
   ══════════════════════════════════════════════════════════════ */

let _mtm_selectedGrade = '';

function showMarksheetTemplateModal() {
  _mtm_selectedGrade = '';

  // Pre-select grade from exam setup if one is already chosen
  const _gradeEl   = document.getElementById('ex_gradeFilter');
  const setupGrade = (_gradeEl && _gradeEl.value) ? _gradeEl.value : '';

  // Build grade grid
  const grid = document.getElementById('mtm_gradeGrid');
  grid.innerHTML = '';
  ALL_GRADES.forEach(g => {
    const count = db.students.filter(s => s.grade === g).length;
    const btn = document.createElement('button');
    btn.textContent = g;
    btn.title = `${count} student${count !== 1 ? 's' : ''}`;
    btn.setAttribute('data-grade', g);
    btn.style.cssText = `
      padding:9px 6px;border-radius:8px;cursor:pointer;font-size:12px;
      font-weight:700;font-family:var(--font-body);transition:all .15s;
      border:1.5px solid var(--border);background:var(--surface-2);
      color:var(--text-secondary);position:relative;
    `;
    if (count > 0) {
      // tiny count badge
      btn.innerHTML = `${g}<span style="display:block;font-size:9px;font-weight:400;
        color:var(--text-muted);margin-top:1px">${count} stu</span>`;
    } else {
      btn.innerHTML = `${g}<span style="display:block;font-size:9px;font-weight:400;
        color:rgba(232,34,81,0.55);margin-top:1px">empty</span>`;
    }
    btn.onclick = () => _mtmSelectGrade(g);
    grid.appendChild(btn);
  });

  // Pre-fill exam name from setup
  const setupExam = (document.getElementById('ex_examName') || {}).value || '';
  document.getElementById('mtm_examName').value = setupExam;

  // Show modal
  document.getElementById('marksheetTemplateModal').style.display = 'block';

  // Auto-select if exam setup already has a grade
  if (setupGrade) _mtmSelectGrade(setupGrade);
}

function _mtmSelectGrade(grade) {
  _mtm_selectedGrade = grade;

  // Highlight selected button
  document.querySelectorAll('#mtm_gradeGrid button').forEach(btn => {
    const isSelected = btn.getAttribute('data-grade') === grade;
    btn.style.background    = isSelected ? 'rgba(46,139,87,0.22)' : 'var(--surface-2)';
    btn.style.borderColor   = isSelected ? 'var(--jungle-bright)'  : 'var(--border)';
    btn.style.color         = isSelected ? 'var(--jungle-glow)'    : 'var(--text-secondary)';
    btn.style.transform     = isSelected ? 'translateY(-1px)'      : '';
    btn.style.boxShadow     = isSelected ? '0 4px 12px rgba(46,139,87,0.25)' : '';
  });

  // Student info
  const students = [...db.students.filter(s => s.grade === grade)]
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const stuInfo  = document.getElementById('mtm_stuInfo');
  const noStu    = document.getElementById('mtm_noStu');
  const countEl  = document.getElementById('mtm_stuCount');
  const namesEl  = document.getElementById('mtm_stuNames');
  const dlBtn    = document.getElementById('mtm_downloadBtn');

  if (students.length > 0) {
    stuInfo.style.display = 'flex';
    noStu.style.display   = 'none';
    countEl.textContent   = `${students.length} student${students.length !== 1 ? 's' : ''} in Grade ${grade}`;

    // Show first 4 names as preview
    const preview = students.slice(0, 4).map(s => s.fullName).join(', ');
    namesEl.textContent = students.length > 4
      ? `${preview}, + ${students.length - 4} more…`
      : preview;
  } else {
    stuInfo.style.display = 'none';
    noStu.style.display   = '';
  }

  // Enable download button
  dlBtn.disabled       = false;
  dlBtn.style.opacity  = '1';
  dlBtn.style.cursor   = 'pointer';
}

function closeMarksheetTemplateModal() {
  document.getElementById('marksheetTemplateModal').style.display = 'none';
  _mtm_selectedGrade = '';
}

function executeMarksheetTemplateDownload() {
  const grade    = _mtm_selectedGrade;
  const examName = document.getElementById('mtm_examName').value.trim();

  if (!grade) { toast('Please select a grade first', true); return; }

  ensureXLSX(function() {
    const baseSubjects = getSubjects(grade);

    // Expanded subject columns: grade-aware sub-components
    const engSubs = getEngSubs(grade);
    const kisSubs = getKisSubs(grade);
    const scieSubs = (typeof getScieSubs === 'function') ? getScieSubs(grade) : [];
    const templateCols = [];
    baseSubjects.forEach(s => {
      if      (s === 'ENG') { templateCols.push(...engSubs); }
      else if (s === 'KIS') { templateCols.push(...kisSubs); }
      else if (s === 'SCIE' && scieSubs.length === 2) { templateCols.push(...scieSubs); }
      else                  { templateCols.push(s); }
    });

    // Get students in this grade sorted alphabetically
    const students = [...db.students.filter(s => s.grade === grade)]
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    // ── Sheet data ────────────────────────────────────────────────
    // Row 0: Main header
    const headerRow = ['#', 'Adm No', 'Full Name', 'Gender', ...templateCols];

    // Row 1: Descriptive notes row
    const notesRow = [
      '', '(Admission No)', '(Student Full Name)', '(M / F)',
      ...templateCols.map(c => {
        if (c === 'GRA')       return 'English Grammar (0-100)';
        if (c === 'COMP')      return 'English Composition (0-100)';
        if (c === 'LUG')       return 'Kiswahili Lugha (0-100)';
        if (c === 'INS')       return 'Kiswahili Insha (0-100)';
        if (c === 'ENG PP1')   return 'English Paper 1 (0-100)';
        if (c === 'ENG PP2')   return 'English Paper 2 (0-100)';
        if (c === 'KIS PP1')   return 'Kiswahili Paper 1 (0-100)';
        if (c === 'KIS PP2')   return 'Kiswahili Paper 2 (0-100)';
        if (c === 'SCIE PP1')  return 'Science Paper 1 (0-100)';
        if (c === 'SCIE PP2')  return 'Science Paper 2 (0-100)';
        return `${c} mark (0-100)`;
      })
    ];

    // Data rows — one per student, blank score columns
    const dataRows = students.length > 0
      ? students.map((s, i) => [
          i + 1,
          s.admNo   || '',
          s.fullName || '',
          s.gender   || '',
          ...templateCols.map(() => '')
        ])
      : [
          // Two blank placeholder rows if no students
          [1, '', '', '', ...templateCols.map(() => '')],
          [2, '', '', '', ...templateCols.map(() => '')]
        ];

    const wsData = [headerRow, notesRow, ...dataRows];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 5  },   // #
      { wch: 12 },   // Adm No
      { wch: 30 },   // Full Name
      { wch: 9  },   // Gender
      ...templateCols.map(() => ({ wch: 13 }))
    ];

    // Style header row — bold, dark bg, light text
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (!cell) continue;
      cell.s = {
        font:      { bold: true, color: { rgb: 'EDF5F0' } },
        fill:      { fgColor: { rgb: '1B5E3B' } },
        alignment: { horizontal: 'center' },
        border:    { bottom: { style: 'medium', color: { rgb: '2E8B57' } } }
      };
    }

    // Style notes row — italic, muted
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 1, c: C })];
      if (!cell) continue;
      cell.s = {
        font:      { italic: true, color: { rgb: '5A7A6A' }, sz: 9 },
        fill:      { fgColor: { rgb: '243028' } },
        alignment: { horizontal: 'center', wrapText: true }
      };
    }

    // Style data rows — alternating shading; name col left-aligned
    for (let R = 2; R <= range.e.r; R++) {
      const isAlt = (R - 2) % 2 === 1;
      for (let C = range.s.c; C <= range.e.c; C++) {
        const ref  = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        const cell = ws[ref];
        cell.s = {
          fill:      { fgColor: { rgb: isAlt ? '2C3A30' : '243028' } },
          alignment: { horizontal: C <= 3 ? 'left' : 'center' },
          border:    {
            bottom: { style: 'thin', color: { rgb: '344438' } },
            right:  { style: 'thin', color: { rgb: '344438' } }
          }
        };
        // Bold student name
        if (C === 2) cell.s.font = { bold: true, color: { rgb: 'EDF5F0' } };
      }
    }

    const wb = XLSX.utils.book_new();

    // ── Info sheet ──────────────────────────────────────────────────
    const infoData = [
      ['EXAM SCORE ENTRY TEMPLATE'],
      [''],
      ['School',     'Santapris Academy'],
      ['Grade',       grade],
      ['Students',    students.length],
      ['Exam',        examName || '(not specified)'],
      ['Generated',   new Date().toLocaleDateString('en-KE')],
      [''],
      ['INSTRUCTIONS'],
      ['1.', 'Enter raw marks in the subject columns — do NOT edit Adm No or Full Name'],
      ['2.', `For English: fill ${engSubs[0]} and ${engSubs[1]} — system auto-calculates ENG = ${engSubs[0]} + ${engSubs[1]}`],
      ['3.', `For Kiswahili: fill ${kisSubs[0]} and ${kisSubs[1]} — system auto-calculates KIS = ${kisSubs[0]} + ${kisSubs[1]}`],
      ['4.', 'All marks should be between 0 and 100'],
      ['5.', 'Save as .xlsx and upload using the "Upload Excel File" button'],
      [''],
      ['NOTE: Matching is done by Adm No first, then by student name. Do not change these values.']
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    wsInfo['!cols'] = [{ wch: 14 }, { wch: 58 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Instructions');

    // Scores sheet
    XLSX.utils.book_append_sheet(wb, ws, 'Scores');

    const examLabel = (examName || 'Template').replace(/\s+/g, '_');
    _xlsxDownload(wb, `Score_Template_${grade}_${examLabel}.xlsx`);

    closeMarksheetTemplateModal();
    toast(`✅ Exam score template downloaded for Grade ${grade} (${students.length} students)`);
  }); // end ensureXLSX
}
