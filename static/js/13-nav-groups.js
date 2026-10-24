/* ═══════════════════════════════════════════════════════════════════════════
   GROUPED NAVIGATION — collapses the long sidebar into a few group titles.
   Clicking a group shows its functions as cards in the DASHBOARD area; a card
   click runs the ORIGINAL menu action verbatim, so every existing function,
   page, modal, permission rule and init hook keeps working unchanged.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const GROUPS = [
  { id: 'exams',  title: '📝 Exams & Scores',  color: '#38bdf8',
    desc: 'Enter, edit and import exam scores; mean scores; exam records',
    match: ['addExam', 'editScores', 'openMeanScoresModal', 'openImportModal',
            'openImageImportModal', 'openDeleteExamModal', "showPage('exams'",
            "showPage('scoreEntry'", 'openRubricsModal'] },
  { id: 'people', title: '👥 Students & Staff', color: '#34d399',
    desc: 'Student register, teachers, subjects, enrolment & imports',
    match: ["showPage('students'", "showPage('addStudent'", "showPage('teachers'",
            "showPage('addTeacher'", 'openTeacherImportModal', "showPage('subjects'",
            'openDeleteGradeModal'] },
  { id: 'timetabling', title: '📅 Timetabling & Duty', color: '#f2c744',
    desc: 'Timetable generator, duty rota, supervision, class teachers',
    match: ["showPage('timetable'", "showPage('dutyrota'", "showPage('specialtt'",
            "showPage('supervision'", "showPage('classTeachers'"] },
  { id: 'analysis', title: '📈 Analysis & Reports', color: '#a78bfa',
    desc: 'Reports, subject analysis, exports, rankings and performance views',
    match: ["showPage('reports'", "showPage('subjectAnalysis'", "showPage('exports'",
            "showPage('topStudents'", "showPage('hallOfFame'", "showPage('performanceHeatmap'",
            "showPage('gradeTrends'", "showPage('mostImproved'", "showPage('genderAnalysis'",
            "showPage('rubricDistribution'"] },
  { id: 'school', title: '🏫 School Management', color: '#fb923c',
    desc: 'Calendar, attendance, fees, parent comms, workload, class lists, settings',
    match: ["showPage('academicCalendar'", "showPage('attendance'", "showPage('feeTracker'",
            "showPage('parentComms'", "showPage('messageGen'", "showPage('teacherWorkload'",
            "showPage('settings'", "showPage('booklist'", "showPage('classLists'", "showPage('letters'", "showPage('booklists'"] },
  { id: 'more', title: '🧰 More Tools', color: '#94a3b8',
    desc: 'Everything else', match: [] }   // catch-all — nothing is ever lost
];

const STATE = { items: [], activeGroup: null };

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ── harvest every original nav item (verbatim actions) ──────────────────── */
function cleanAction(onclick){
  return String(onclick || '')
    .replace(/;\s*closeMobileMenu\(\)/g, '')
    .replace(/,\s*this\s*\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}
function harvest(){
  const seen = new Set();
  STATE.items = [];
  document.querySelectorAll('.nav-item').forEach(el => {
    /* skip our own injected group buttons */
    if (el.classList.contains('ng-group') || el.closest('.ng-list')) return;
    const raw = el.getAttribute('onclick') || '';
    const action = cleanAction(raw);
    if (!action) return;
    if (seen.has(action)) return;
    seen.add(action);
    const iconEl = el.querySelector('.icon');
    const icon = iconEl ? iconEl.textContent.trim() : '▸';
    let label = el.textContent.replace(icon, '').trim();
    label = label.replace(/^\S+\s+/, m => m.trim().length <= 4 ? '' : m).trim() || el.textContent.trim();
    STATE.items.push({ action, icon, label, raw });
  });
}
function groupOf(item){
  if (item.action === "showPage('dashboard')") return 'dashboard';
  for (const g of GROUPS) {
    if (g.id === 'more') continue;
    for (const pat of g.match) {
      if (item.action.indexOf(pat) >= 0) return g.id;
    }
  }
  return 'more';
}

/* ── sidebar regrouping ──────────────────────────────────────────────────── */
function buildSidebar(){
  harvest();
  // hide every original nav-item; empty sections collapse via CSS below
  document.querySelectorAll('.nav-item').forEach(el => {
    if (!el.classList.contains('ng-group') && !el.closest('#navGroupHub')) el.style.display = 'none';
  });

  // desktop sidebar + mobile drawer (any container holding sidebar sections)
  const hosts = [];
  document.querySelectorAll('aside.sidebar, nav').forEach(el => {
    if (el.querySelector('.sidebar-section') && !el.querySelector('.ng-list')) {
      hosts.push(el);
    }
  });

  hosts.forEach(el => {
    /* the phone drawer is nav#mobileSidebar — mark it so group taps close it */
    const mobile = el.id === 'mobileSidebar' || !!el.closest('#mobileSidebar');
    const list = document.createElement('div');
    list.className = 'ng-list';
    /* only render buttons for groups that actually contain functions */
    const counts = {};
    STATE.items.forEach(it => { const gid = groupOf(it); counts[gid] = (counts[gid] || 0) + 1; });
    let html = groupBtn('dashboard', '📊 Overview & Dashboard', mobile);
    GROUPS.forEach(g => {
      if ((counts[g.id] || 0) > 0) html += groupBtn(g.id, g.title, mobile);
    });
    list.innerHTML = html;
    el.insertBefore(list, el.firstChild);
  });
}
function groupBtn(id, title, mobile){
  const click = mobile
    ? `ngOpenGroup('${id}');closeMobileMenu()`
    : `ngOpenGroup('${id}')`;
  return `<div class="nav-item ng-group" data-ng="${id}" onclick="${click}"
    style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:13px;padding:10px 14px">
    <span style="font-size:15px">${title.split(' ')[0]}</span>
    <span style="flex:1">${esc(title.split(' ').slice(1).join(' '))}</span>
    <span style="color:var(--text-muted);font-size:12px">▸</span></div>`;
}

/* ── the group hub rendered inside the dashboard area ────────────────────── */
window.ngOpenGroup = function(id){
  STATE.activeGroup = id;
  document.querySelectorAll('.ng-group').forEach(b =>
    b.classList.toggle('ng-active', b.getAttribute('data-ng') === id));
  /* close the phone drawer so the group contents are visible immediately */
  try { if (typeof closeMobileMenu === 'function') closeMobileMenu(); } catch (e) {}
  // go to the dashboard area first (same as clicking Dashboard)
  if (typeof showPage === 'function') showPage('dashboard', null);
  renderHub();
  const el = document.getElementById('page-dashboard');
  if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
};
window.ngDashboard = function(){
  STATE.activeGroup = null;
  renderHub();
};

function ensureHub(){
  const dash = document.getElementById('page-dashboard');
  if (!dash) return null;
  let hub = document.getElementById('navGroupHub');
  if (!hub) {
    hub = document.createElement('div');
    hub.id = 'navGroupHub';
    const first = dash.firstElementChild;
    dash.insertBefore(hub, first);
  }
  return hub;
}
function renderHub(){
  const hub = ensureHub();
  if (!hub) return;
  const id = STATE.activeGroup;
  const g = GROUPS.find(x => x.id === id);
  if (!g) { hub.innerHTML = ''; hub.style.display = 'none'; return; }
  const items = STATE.items.filter(it => groupOf(it) === g.id);
  hub.style.display = 'block';
  hub.innerHTML =
    `<div style="margin:0 0 18px;padding:18px 20px;background:linear-gradient(135deg,rgba(11,29,58,.65),rgba(22,46,82,.45));border:1px solid ${g.color}44;border-radius:14px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:22px">${g.title.split(' ')[0]}</span>
        <div>
          <div style="font-size:17px;font-weight:900;color:var(--text)">${esc(g.title.split(' ').slice(1).join(' '))}</div>
          <div style="font-size:11px;color:var(--text-muted)">${esc(g.desc)} — click a card to continue</div>
        </div>
        <button class="btn btn-sm" onclick="ngDashboard()" style="margin-left:auto;font-size:11px">✕ Close</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px;margin-top:14px">
        ${items.map(it => card(it, g)).join('')}
      </div>
    </div>`;
  // keep dashboard stats below the hub
}
function card(it, g){
  return `<div class="ng-card" data-action="${esc(it.action)}" title="${esc(it.label)}">
    <div style="font-size:22px">${esc(it.icon)}</div>
    <div style="font-weight:800;font-size:13px;color:var(--text)">${esc(it.label)}</div>
    <div style="font-size:10px;color:var(--text-muted)">${esc(g.title.split(' ').slice(1).join(' '))}</div>
  </div>`;
}
/* one delegated listener runs the ORIGINAL menu action verbatim */
document.addEventListener('click', e => {
  const c = e.target.closest('.ng-card[data-action]');
  if (!c) return;
  const action = c.getAttribute('data-action');
  /* close the phone drawer whenever a function is launched */
  try { if (typeof closeMobileMenu === 'function') closeMobileMenu(); } catch (err) {}
  try {
    new Function(action)();
    STATE.activeGroup = null;
    renderHub();   // hide the hub; the target page is now open
  } catch (err) { console.error('nav action failed', err); }
});

/* ── styles ──────────────────────────────────────────────────────────────── */
(function styles(){
  if (document.getElementById('ng-styles')) return;
  const st = document.createElement('style');
  st.id = 'ng-styles';
  st.textContent = `
    .ng-group:hover { border-color: var(--sky); }
    .ng-group[data-ng].ng-active { background: rgba(30,86,200,.22); border-color: var(--sky); }
    .sidebar-section { }
    /* hide sections that only contained (now hidden) nav items */
    .sidebar-section:not(:has(.nav-item:not([style*="display: none"]))):not(:has(button)):not(:has(input)) { display: none; }
    .ng-card { background: var(--surface-2, rgba(30,60,120,.14)); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px 16px; cursor: pointer; text-align: left;
      display: flex; flex-direction: column; gap: 4px; transition: border-color .12s, transform .12s; }
    .ng-card:hover { border-color: var(--sky); transform: translateY(-2px); }
    #navGroupHub { margin-bottom: 6px; }
  `;
  document.head.appendChild(st);
})();

/* ── boot: rebuild when the app menu exists ──────────────────────────────── */
function boot(){
  if (!document.querySelector('.nav-item')) return false;
  buildSidebar();
  return true;
}
if (!boot()) {
  const t0 = setInterval(() => { if (boot()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}
/* re-apply after full-sync UI refreshes (defensive) */
setTimeout(() => { try { buildSidebar(); } catch (e) {} }, 2500);

})();
