/* ═══════════════════════════════════════════════════════════════════════════
   TEACHER DUTY ROTA GENERATOR — Upper Primary (Gr 4-6) & Junior School (Gr 7-9)
   - 3 teachers on duty per week, fair share (counts never differ by more than 1)
   - Mid-term break weeks are excluded from allocation
   - Exempt specific teachers via a multi-select dropdown
   - Every generation reshuffles so the same teachers are not always grouped
   - Exports: A4 PDF / Word / Excel · portrait or landscape
   Data is persisted to window.db.dutyRota (syncs to the server via saveDB).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const DR = {
  rota: null,          // last generated / loaded rota object
  renderedStamp: null, // generatedAt of what is currently on screen
  scopeTeachers: []    // upper-primary + junior-school teachers (pre-exemption)
};

/* ── teacher scoping ─────────────────────────────────────────────────────── */
function drClassesOf(t){
  const set = new Set();
  (t.assignments || []).forEach(a => (a.classes || []).forEach(c => set.add(String(c).trim())));
  String(t.classTeacher || '').split(',').forEach(c => { c = c.trim(); if (c) set.add(c); });
  return [...set].filter(Boolean);
}
function drInScope(t){
  // Upper primary = grades 4-6, junior school = grades 7-9
  return drClassesOf(t).some(c => /^[4-9]/.test(c));
}
function drScopeTeachers(){
  const list = ((window.db && window.db.teachers) || []).filter(drInScope);
  const seen = new Set(), out = [];
  list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  for (const t of list) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  DR.scopeTeachers = out;
  return out;
}

/* ── date helpers (all local-time, noon-anchored to dodge DST edges) ─────── */
function drParse(v){
  if (!v) return null;
  const p = String(v).split('-').map(Number);
  if (p.length !== 3 || p.some(isNaN)) return null;
  return new Date(p[0], p[1] - 1, p[2], 12, 0, 0);
}
function drISO(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function drAddDays(d, n){ const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function drMin(a, b){ return a <= b ? a : b; }
const DR_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DR_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function drPretty(v){
  const d = drParse(v);
  if (!d) return v || '';
  return DR_DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + DR_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
function drShort(v){
  const d = drParse(v);
  if (!d) return v || '';
  return d.getDate() + ' ' + DR_MONTHS[d.getMonth()];
}

/* ── small helpers ───────────────────────────────────────────────────────── */
function drShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function drEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

/* ── exempt multi-select dropdown ────────────────────────────────────────── */
window.initDutyRotaPage = function(){
  drBuildExemptList();

  // Restore the newest rota (server copy preferred over the device cache)
  let rota = (window.db && window.db.dutyRota && window.db.dutyRota.generatedAt)
    ? window.db.dutyRota : null;
  try {
    const local = JSON.parse(localStorage.getItem('santapris_dutyrota_v1') || 'null');
    if (local && local.generatedAt && (!rota || String(local.generatedAt) > String(rota.generatedAt))) rota = local;
  } catch (e) {}
  if (rota) {
    DR.rota = rota;
    drRestoreParams(rota);
    drRenderAll();
  } else {
    // Sensible defaults for a fresh term: opening today, closing in 12 weeks
    const open = document.getElementById('dr_open');
    const close = document.getElementById('dr_close');
    if (open && !open.value) open.value = drISO(new Date());
    if (close && !close.value) close.value = drISO(drAddDays(new Date(), 84));
  }
  window.__drInitialized = true;
};

function drBuildExemptList(){
  const menu = document.getElementById('dr_exemptMenu');
  if (!menu) return;
  const teachers = drScopeTeachers();
  const prev = new Set(DR.rota && DR.rota.params ? DR.rota.params.exempt || [] : []);
  if (!menu.dataset.built) {
    // keep whatever the user ticked while navigating around
    menu.querySelectorAll('input[type=checkbox]').forEach(cb => { if (cb.checked) prev.add(cb.value); });
  }
  menu.innerHTML = teachers.map(t => {
    const classes = drClassesOf(t).sort().join(', ') || '—';
    return '<label class="dr-multi-item">'
      + '<input type="checkbox" value="' + drEsc(t.id) + '" ' + (prev.has(t.id) ? 'checked' : '') + ' onchange="drExemptChanged()">'
      + '<span class="dr-item-name">' + drEsc(t.name || t.id) + '</span>'
      + '<span class="dr-item-classes">' + drEsc(classes) + '</span></label>';
  }).join('');
  menu.dataset.built = '1';
  drExemptChanged();
}

window.drToggleExemptMenu = function(ev){
  if (ev) ev.stopPropagation();
  const menu = document.getElementById('dr_exemptMenu');
  if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};
document.addEventListener('click', function(ev){
  const box = document.getElementById('dr_exemptBox');
  if (box && !box.contains(ev.target)) {
    const menu = document.getElementById('dr_exemptMenu');
    if (menu) menu.style.display = 'none';
  }
});
window.drExemptChanged = function(){
  const menu = document.getElementById('dr_exemptMenu');
  if (!menu) return;
  const ids = drExemptIds();
  const pill = document.getElementById('dr_exemptCount');
  if (pill) pill.textContent = ids.length ? String(ids.length) + ' exempt' : 'none';
};
function drExemptIds(){
  const menu = document.getElementById('dr_exemptMenu');
  if (!menu) return [];
  return [...menu.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.value);
}

/* ── generation ──────────────────────────────────────────────────────────── */
window.generateDutyRota = function(){
  const open = (document.getElementById('dr_open') || {}).value;
  const close = (document.getElementById('dr_close') || {}).value;
  if (!open || !close) { toast('⚠️ Select the opening and closing dates first.', true); return; }
  const dOpen = drParse(open), dClose = drParse(close);
  if (!dOpen || !dClose) { toast('⚠️ Invalid dates.', true); return; }
  if (dClose < dOpen) { toast('⚠️ Closing date cannot be before the opening date.', true); return; }

  const midOn = !!(document.getElementById('dr_mid_on') || {}).checked;
  let mS = null, mE = null;
  if (midOn) {
    const ms = (document.getElementById('dr_mid_start') || {}).value;
    const me = (document.getElementById('dr_mid_end') || {}).value;
    if (!ms || !me) { toast('⚠️ Mid-term is on — set BOTH the mid-term start and end dates.', true); return; }
    mS = drParse(ms); mE = drParse(me);
    if (!mS || !mE || mE < mS) { toast('⚠️ Mid-term end date must be on or after its start date.', true); return; }
    if (mS < dOpen || mE > dClose) { toast('⚠️ Mid-term dates must fall inside the term (opening → closing).', true); return; }
  }

  const exempt = new Set(drExemptIds());
  const pool = drScopeTeachers().filter(t => !exempt.has(t.id));
  if (pool.length < 3) {
    toast('⚠️ Need at least 3 eligible teachers (after exemptions) in Upper Primary / Junior School.', true);
    return;
  }
  const term = (document.getElementById('dr_term') || {}).value || 'TERM 1';

  // Build the week list — a duty week runs MONDAY to SATURDAY. The first week
  // starts on the opening day (partial week if the term opens mid-week) and
  // the last week ends on the closing day. Weeks overlapping the mid-term
  // break get no duty.
  const weeks = [];
  let s = dOpen, n = 1, dutyIdx = 0;
  if (s.getDay() === 0) s = drAddDays(s, 1);   // opened on a Sunday → start Monday
  while (s <= dClose) {
    const dfm = (s.getDay() + 6) % 7;           // 0 = Monday ... 5 = Saturday
    const end = drMin(drAddDays(s, 5 - dfm), dClose);   // this week's Saturday (or closing day)
    const isBreak = !!(mS && s <= mE && end >= mS);
    weeks.push({ n: n++, start: drISO(s), end: drISO(end), break: isBreak, dutyIdx: isBreak ? -1 : dutyIdx++ });
    s = drAddDays(s, 7 - dfm);                  // next Monday
  }
  const dutyWeeks = weeks.filter(w => !w.break);
  const totalSlots = dutyWeeks.length * 3;

  // Fair sequence: full shuffled rounds → every teacher appears once per round,
  // so final counts differ by at most 1. A fresh shuffle each run means the
  // same teachers are not grouped together every time.
  let seq = [];
  while (seq.length < totalSlots) seq.push(...drShuffle(pool.slice()));
  seq = seq.slice(0, totalSlots);
  const perWeek = [];
  for (let i = 0; i < dutyWeeks.length; i++) perWeek.push(seq.slice(i * 3, i * 3 + 3));
  drReduceAdjacency(perWeek);

  const counts = {};
  pool.forEach(t => { counts[t.id] = 0; });
  perWeek.flat().forEach(t => { counts[t.id]++; });

  DR.rota = {
    generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    params: {
      term: term,
      opening: open, closing: close,
      midterm: midOn ? { start: drISO(mS), end: drISO(mE) } : null,
      exempt: [...exempt],
      pool: pool.map(t => ({ id: t.id, name: t.name || t.id }))
    },
    weeks: weeks.map(w => w.break
      ? { n: w.n, start: w.start, end: w.end, break: true }
      : { n: w.n, start: w.start, end: w.end, break: false,
          teachers: perWeek[w.dutyIdx].map(t => ({ id: t.id, name: t.name || t.id })) }),
    counts: counts
  };
  drRenderAll();
  drPersist();
  toast('✅ Duty rota generated — ' + dutyWeeks.length + ' duty week(s), 3 teachers each.');
};

/* Swap-based clean-up: avoid the same teacher being on duty in back-to-back
   weeks where a swap that keeps the counts identical can fix it. */
function drReduceAdjacency(perWeek){
  const has = (w, id) => perWeek[w].some(t => t.id === id);
  for (let pass = 0; pass < 4; pass++) {
    let improved = false;
    for (let w = 0; w + 1 < perWeek.length; w++) {
      const dups = perWeek[w].filter(t => has(w + 1, t.id));
      for (const t of dups) {
        outer:
        for (let L = w + 2; L < perWeek.length; L++) {
          for (let j = 0; j < perWeek[L].length; j++) {
            const c = perWeek[L][j];
            if (has(w, c.id)) continue;                       // c would clash with week w
            if (L - 1 !== w + 1 && L - 1 >= 0 && has(L - 1, t.id)) continue;
            if (L + 1 < perWeek.length && has(L + 1, t.id)) continue;
            if (w + 2 < perWeek.length && w + 2 !== L && has(w + 2, c.id)) continue;
            const i = perWeek[w + 1].findIndex(x => x.id === t.id);
            perWeek[w + 1][i] = c;
            perWeek[L][j] = t;
            improved = true;
            break outer;
          }
        }
      }
    }
    if (!improved) break;
  }
}

/* ── persistence ─────────────────────────────────────────────────────────── */
function drPersist(){
  try { localStorage.setItem('santapris_dutyrota_v1', JSON.stringify(DR.rota)); } catch (e) {}
  if (window.db) window.db.dutyRota = DR.rota;
  if (typeof window.saveDB === 'function') { try { window.saveDB(); } catch (e) {} }
}
function drRestoreParams(rota){
  const p = rota.params || {};
  const setv = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
  setv('dr_term', p.term || 'TERM 1');
  setv('dr_open', p.opening); setv('dr_close', p.closing);
  const midOn = document.getElementById('dr_mid_on');
  if (midOn) {
    midOn.checked = !!p.midterm;
    drMidToggle();
    if (p.midterm) { setv('dr_mid_start', p.midterm.start); setv('dr_mid_end', p.midterm.end); }
  }
}
window.drMidToggle = function(){
  const on = !!(document.getElementById('dr_mid_on') || {}).checked;
  ['dr_mid_start', 'dr_mid_end'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.disabled = !on; el.style.opacity = on ? '1' : '.45'; }
  });
  const wrap = document.getElementById('dr_mid_dates');
  if (wrap) wrap.style.display = on ? 'flex' : 'none';
};

/* ── rendering ───────────────────────────────────────────────────────────── */
function drRenderAll(){
  if (!DR.rota) return;
  DR.renderedStamp = DR.rota.generatedAt;
  drRenderSummary();
  drRenderRotaTable();
  drRenderCounts();
  const wrap = document.getElementById('dr_results');
  if (wrap) wrap.style.display = 'block';
}
function drRenderSummary(){
  const el = document.getElementById('dr_summary');
  if (!el) return;
  const r = DR.rota;
  const duty = r.weeks.filter(w => !w.break).length;
  const brk = r.weeks.length - duty;
  const mid = r.params.midterm;
  el.innerHTML =
    '<span class="dr-chip">📘 ' + drEsc(r.params.term || 'TERM 1') + ' · ' + drPretty(r.params.opening) + ' → ' + drPretty(r.params.closing) + '</span>'
    + '<span class="dr-chip">✅ ' + duty + ' duty week' + (duty === 1 ? '' : 's') + ' · 3 teachers each</span>'
    + (mid ? '<span class="dr-chip dr-chip-warn">🏖️ Mid-term: ' + drPretty(mid.start) + ' → ' + drPretty(mid.end) + ' (' + brk + ' week' + (brk === 1 ? '' : 's') + ' skipped)</span>' : '')
    + '<span class="dr-chip">👥 ' + r.params.pool.length + ' teachers in rotation' + (r.params.exempt.length ? ' · ' + r.params.exempt.length + ' exempted' : '') + '</span>'
    + '<span class="dr-chip dr-chip-muted">Generated ' + drEsc(r.generatedAt) + '</span>';
}
function drRenderRotaTable(){
  const el = document.getElementById('dr_rotaTable');
  if (!el) return;
  const r = DR.rota;
  let html = '<table class="dr-table"><thead><tr>'
    + '<th style="width:64px">Week</th><th style="width:190px">Dates</th>'
    + '<th>Teacher on Duty 1</th><th>Teacher on Duty 2</th><th>Teacher on Duty 3</th>'
    + '</tr></thead><tbody>';
  for (const w of r.weeks) {
    if (w.break) {
      html += '<tr class="dr-breakrow"><td>W' + w.n + '</td><td>' + drShort(w.start) + ' – ' + drShort(w.end) + '</td>'
        + '<td colspan="3">🏖️ MID-TERM BREAK — no duty allocation</td></tr>';
    } else {
      const cells = [0, 1, 2].map(i => {
        const t = w.teachers[i];
        return '<td><span class="dr-teacher">' + drEsc(t ? t.name : '—') + '</span></td>';
      }).join('');
      html += '<tr><td class="dr-weekcell">W' + w.n + '</td><td>' + drShort(w.start) + ' – ' + drShort(w.end) + '</td>' + cells + '</tr>';
    }
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}
function drRenderCounts(){
  const el = document.getElementById('dr_countsTable');
  if (!el) return;
  const r = DR.rota;
  const rows = Object.entries(r.counts).map(([id, n]) => {
    const name = (r.params.pool.find(t => t.id === id) || {}).name || id;
    return { id, name, n };
  }).sort((a, b) => b.n - a.n || String(a.name).localeCompare(String(b.name)));
  const max = Math.max(0, ...rows.map(x => x.n));
  const min = rows.length ? Math.min(...rows.map(x => x.n)) : 0;
  const fair = max - min <= 1;
  let html = '<table class="dr-table"><thead><tr>'
    + '<th style="width:56px">#</th><th>Teacher</th><th style="width:130px">Times on Duty</th><th style="width:180px">Share</th>'
    + '</tr></thead><tbody>';
  rows.forEach((x, i) => {
    const pct = max ? Math.round(x.n / max * 100) : 0;
    html += '<tr><td>' + (i + 1) + '</td><td>' + drEsc(x.name) + '</td>'
      + '<td style="text-align:center;font-weight:700">' + x.n + '</td>'
      + '<td><div class="dr-bar"><div class="dr-bar-fill" style="width:' + pct + '%"></div></div></td></tr>';
  });
  html += '</tbody></table>';
  html += '<div class="dr-fairnote">' + (fair
    ? '⚖️ Fair distribution: every teacher serves ' + (rows.length ? min : 0) + (max > min ? ' or ' + max : '') + ' time(s) this term.'
    : '⚠️ Uneven distribution detected.') + '</div>';
  el.innerHTML = html;
}

/* Live sync: if another device regenerates the rota, refresh silently. */
setInterval(function(){
  const s = window.db && window.db.dutyRota;
  if (s && s.generatedAt && s.generatedAt !== DR.renderedStamp &&
      document.getElementById('dr_results') && document.getElementById('dr_results').style.display === 'block') {
    DR.rota = s;
    drBuildExemptList();
    drRestoreParams(s);
    drRenderAll();
  }
}, 5000);

/* ── exports ─────────────────────────────────────────────────────────────── */
window.exportDutyRota = function(){
  if (!DR.rota) { toast('⚠️ Generate the duty rota first.', true); return; }
  const format = (document.getElementById('dr_format') || {}).value || 'pdf';
  const orient = (document.getElementById('dr_orientation') || {}).value || 'portrait';
  const base = 'Duty_Rota_' + ((DR.rota.params.term || 'TERM 1').replace(/\s+/g, '_'))
    + '_' + DR.rota.params.opening + '_to_' + DR.rota.params.closing;
  try {
    if (format === 'pdf') { drExportPdf(orient, base); toast('📄 Duty rota PDF exported!'); }
    else if (format === 'word') {
      Promise.resolve(drExportWord(orient, base)).catch(e => {
        console.error('Duty rota export error:', e);
        toast('❌ Export failed: ' + (e.message || e), true);
      });
    }
    else { drExportExcel(orient, base); }
  } catch (e) {
    console.error('Duty rota export error:', e);
    toast('❌ Export failed: ' + (e.message || e), true);
  }
};
function drDownload(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function drRangeText(){
  const p = DR.rota.params;
  return (p.term || 'TERM 1') + '  ·  ' + drPretty(p.opening) + '  to  ' + drPretty(p.closing);
}

/* PDF (A4, portrait or landscape) */
function drExportPdf(orient, base){
  const jsPDF = window._getJsPDF();
  const doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
  let y = pdfHeader(doc, 'TEACHER DUTY ROTA', drRangeText() + '  ·  3 teachers per week');

  const r = DR.rota;
  const head = [['WK', 'DATES', 'TEACHER ON DUTY 1', 'TEACHER ON DUTY 2', 'TEACHER ON DUTY 3']];
  const body = [];
  for (const w of r.weeks) {
    if (w.break) {
      body.push([{ content: 'W' + w.n + '   ·   ' + drShort(w.start) + ' – ' + drShort(w.end) +
        '   ·   MID-TERM BREAK — no duty allocation', colSpan: 5, styles: { fillColor: [255, 243, 205], textColor: [146, 96, 6], fontStyle: 'bold', halign: 'center' } }]);
    } else {
      body.push([
        { content: 'W' + w.n, styles: { fontStyle: 'bold' } },
        drShort(w.start) + ' – ' + drShort(w.end),
        ...w.teachers.map(t => t.name)
      ]);
    }
  }
  doc.autoTable({
    startY: y + 2,
    head, body,
    theme: 'grid',
    headStyles: { fillColor: [11, 29, 58], textColor: [242, 199, 68], fontStyle: 'bold', fontSize: 8.5, halign: 'center', cellPadding: 1.6 },
    styles: { fontSize: 8.5, cellPadding: 1.8, halign: 'center', lineColor: [70, 70, 70], lineWidth: 0.2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 14, fillColor: [22, 46, 82], textColor: [220, 232, 255], fontStyle: 'bold' },
      1: { cellWidth: 52, fillColor: [248, 249, 252] },
      2: { fontStyle: 'bold' }, 3: { fontStyle: 'bold' }, 4: { fontStyle: 'bold' }
    },
    margin: { left: 6, right: 6 }
  });

  // Allocation summary
  if (doc.lastAutoTable) y = doc.lastAutoTable.finalY + 5; else y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(11, 29, 58);
  doc.text('ALLOCATION SUMMARY', 6, y);
  y += 4;
  doc.autoTable({
    startY: y,
    head: [['TEACHER', 'TIMES ON DUTY']],
    body: Object.entries(r.counts).map(([id, n]) => {
      const name = (r.params.pool.find(t => t.id === id) || {}).name || id;
      return [name, String(n)];
    }).sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0])),
    theme: 'striped',
    headStyles: { fillColor: [242, 199, 68], textColor: [11, 29, 58], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    styles: { fontSize: 8, cellPadding: 1.3, halign: 'center' },
    columnStyles: { 0: { halign: 'left' } },
    margin: { left: 6, right: 6 }
  });
  doc.setFontSize(7); doc.setTextColor(110);
  doc.text('Generated ' + DR.rota.generatedAt + '  ·  Santapris Academy Duty Rota Generator', 6,
    doc.internal.pageSize.getHeight() - 5);
  doc.save(base + '.pdf');
}

/* Word (A4, portrait or landscape) */
async function drExportWord(orient, base){
  const land = orient === 'landscape';
  if (!window.docx) { toast('❌ Word library not loaded.', true); return; }
  const D = window.docx;
  const borders = { top: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                    bottom: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                    left: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                    right: { style: D.BorderStyle.SINGLE, size: 4, color: '555555' },
                    insideHorizontal: { style: D.BorderStyle.SINGLE, size: 2, color: '999999' },
                    insideVertical: { style: D.BorderStyle.SINGLE, size: 2, color: '999999' } };
  const cell = (text, opts) => new D.TableCell({
    columnSpan: opts && opts.span,
    shading: opts && opts.fill ? { fill: opts.fill } : undefined,
    width: opts && opts.w ? { size: opts.w, type: D.WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      children: [new D.TextRun({ text: String(text), bold: !!(opts && opts.bold), size: opts && opts.size || 19, color: opts && opts.color || '222222' })]
    })]
  });
  const rows = [new D.TableRow({
    tableHeader: true,
    children: ['WEEK', 'DATES', 'TEACHER ON DUTY 1', 'TEACHER ON DUTY 2', 'TEACHER ON DUTY 3']
      .map(h => cell(h, { fill: '0B1D3A', color: 'F2C744', bold: true, size: 18 }))
  })];
  for (const w of DR.rota.weeks) {
    if (w.break) {
      rows.push(new D.TableRow({ children: [cell('W' + w.n + '  ·  ' + drShort(w.start) + ' – ' + drShort(w.end) +
        '  ·  MID-TERM BREAK — no duty allocation', { span: 5, fill: 'FFF3CD', bold: true })] }));
    } else {
      rows.push(new D.TableRow({ children: [
        cell('W' + w.n, { fill: '162E52', color: 'DCE8FF', bold: true }),
        cell(drShort(w.start) + ' – ' + drShort(w.end), { fill: 'F8F9FC' }),
        ...w.teachers.map(t => cell(t.name, { bold: true }))
      ] }));
    }
  }
  const sumRows = [new D.TableRow({
    tableHeader: true,
    children: ['TEACHER', 'TIMES ON DUTY'].map(h => cell(h, { fill: 'F2C744', color: '0B1D3A', bold: true }))
  })];
  Object.entries(DR.rota.counts).map(([id, n]) => {
    const name = (DR.rota.params.pool.find(t => t.id === id) || {}).name || id;
    return [name, n];
  }).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .forEach(x => sumRows.push(new D.TableRow({ children: [cell(x[0]), cell(String(x[1]), { bold: true })] })));

  const docFile = new D.Document({
    sections: [{
      properties: { page: { size: { width: land ? 16838 : 11906, height: land ? 11906 : 16838 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [
        new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 60 },
          children: [new D.TextRun({ text: 'SANTAPRIS ACADEMY', bold: true, size: 34, color: '0B1D3A' })] }),
        new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 60 },
          children: [new D.TextRun({ text: 'TEACHER DUTY ROTA', bold: true, size: 26, color: 'B8860B' })] }),
        new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 220 },
          children: [new D.TextRun({ text: drRangeText() + '  ·  3 teachers per week', size: 20, color: '555555' })] }),
        new D.Table({ rows, width: { size: 100, type: D.WidthType.PERCENTAGE }, borders }),
        new D.Paragraph({ spacing: { before: 260, after: 80 },
          children: [new D.TextRun({ text: 'ALLOCATION SUMMARY', bold: true, size: 22, color: '0B1D3A' })] }),
        new D.Table({ rows: sumRows, width: { size: 60, type: D.WidthType.PERCENTAGE }, borders }),
        new D.Paragraph({ spacing: { before: 200 },
          children: [new D.TextRun({ text: 'Generated ' + DR.rota.generatedAt + '  ·  Santapris Academy Duty Rota Generator', size: 14, color: '888888' })] })
      ]
    }]
  });
  const blob = await D.Packer.toBlob(docFile);
  drDownload(blob, base + '.docx');
  toast('📝 Duty rota Word document exported!');
}

/* Excel (A4 page setup, portrait or landscape) */
function drExportExcel(orient, base){
  if (typeof ensureXLSX === 'function') {
    ensureXLSX(() => drBuildExcel(orient, base));
  } else {
    drBuildExcel(orient, base);
  }
}
function drBuildExcel(orient, base){
  const r = DR.rota;
  const wb = XLSX.utils.book_new();

  const aoa = [
    ['SANTAPRIS ACADEMY'],
    ['TEACHER DUTY ROTA'],
    [drRangeText() + '  ·  3 teachers per week'],
    [],
    ['WEEK', 'DATES', 'TEACHER ON DUTY 1', 'TEACHER ON DUTY 2', 'TEACHER ON DUTY 3']
  ];
  for (const w of r.weeks) {
    if (w.break) aoa.push(['W' + w.n, drShort(w.start) + ' – ' + drShort(w.end), 'MID-TERM BREAK — no duty allocation', '', '']);
    else aoa.push(['W' + w.n, drShort(w.start) + ' – ' + drShort(w.end), ...w.teachers.map(t => t.name)]);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 26 }, { wch: 26 }, { wch: 26 }];
  ws['!pageSetup'] = { orientation: orient, paperSize: 9, fitToWidth: 1, fitToHeight: 0 };
  XLSX.utils.book_append_sheet(wb, ws, 'Duty Rota');

  const sum = [
    ['ALLOCATION SUMMARY'],
    [],
    ['TEACHER', 'TIMES ON DUTY'],
    ...Object.entries(r.counts).map(([id, n]) => {
      const name = (r.params.pool.find(t => t.id === id) || {}).name || id;
      return [name, n];
    }).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sum);
  ws2['!cols'] = [{ wch: 30 }, { wch: 16 }];
  ws2['!pageSetup'] = { orientation: orient, paperSize: 9 };
  XLSX.utils.book_append_sheet(wb, ws2, 'Allocation Summary');

  XLSX.writeFile(wb, base + '.xlsx');
  toast('📊 Duty rota Excel exported!');
}

})();
