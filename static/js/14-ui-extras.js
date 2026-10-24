/* ═══════════════════════════════════════════════════════════════════════════
   UI EXTRAS
   1. Exam Supervision — editable teacher-exemption dropdown (replaces the
      hardcoded SV_EXCLUDED list; the generator, PDF & Word exports pick it up)
   2. Quick search results panel — solid opaque background (was transparent)
   3. Phone/tablet responsiveness — the app works without desktop mode
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function fmtT(name){ return (typeof fmtTeacher === 'function') ? fmtTeacher(name) : name; }

/* ═══ 1. SUPERVISION EXEMPTIONS ════════════════════════════════════════════ */
window.subjToggleSvExempt = function(name, cb){
  if (!window.svGetExcluded || !window.svSetExcluded) return;
  let list = window.svGetExcluded();
  const key = String(name).toUpperCase();
  const has = list.some(x => x === key || key.startsWith(x));
  if (cb.checked && !has) list.push(key);
  if (!cb.checked && has) list = list.filter(x => !(x === key || key.startsWith(x)));
  window.svSetExcluded(list);
  window.subjRenderSvExemptions();
  toast(cb.checked
    ? '🚫 ' + name + ' exempted from exam supervision.'
    : '✓ ' + name + ' will now appear in the supervision rotation.');
};
window.subjSvAllAvailable = function(){
  if (window.svSetExcluded) window.svSetExcluded([]);
  window.subjRenderSvExemptions();
  toast('✓ All teachers available for supervision.');
};
window.subjRenderSvExemptions = function(){
  const box = document.getElementById('sv_exemptList');
  if (!box) return;
  const exempted = (window.svGetExcluded ? window.svGetExcluded() : []);
  const teachers = [...(db.teachers || [])].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  box.innerHTML = teachers.map(t => {
    const fmt = fmtT(t.name);
    const isOff = exempted.some(x => x === String(t.name).toUpperCase().trim() || fmt.toUpperCase().startsWith(x));
    const isLP = (typeof teacherLevel === 'function') && teacherLevel(t) === 'lp';
    return '<label style="display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:6px;font-size:12px;cursor:' + (isLP ? 'default;opacity:.55' : 'pointer') + '" '
      + 'onmouseover="this.style.background=\'rgba(30,86,200,.15)\'" onmouseout="this.style.background=\'\'">'
      + '<input type="checkbox" ' + (isLP ? 'checked disabled title="Lower Primary teachers are always excluded from supervision"' : (isOff ? 'checked' : '')) + ' onchange="subjToggleSvExempt(\'' + esc(fmt) + '\', this)"'
      + ' style="accent-color:var(--rose,#f87171);width:15px;height:15px;cursor:' + (isLP ? 'not-allowed' : 'pointer') + '">'
      + '<span style="font-weight:700;color:var(--text)">' + esc(fmt) + '</span>'
      + '<span style="font-size:10px;color:var(--text-muted)">' + esc((t.assignments || []).map(a => a.subject).join(', ') || '') + '</span>'
      + (isLP ? '<span style="font-size:9px;color:var(--text-muted);border:1px solid var(--border);border-radius:4px;padding:1px 5px;margin-left:6px">Lower Primary \u00b7 auto-excluded</span>' : '')
      + '</label>';
  }).join('');
  const count = document.getElementById('sv_exemptCount');
  if (count) count.textContent = exempted.length ? exempted.length + ' exempted' : 'none';
};

function ensureSvPanel(){
  const page = document.getElementById('page-supervision');
  if (!page || document.getElementById('sv_exemptPanel')) return;
  const panel = document.createElement('div');
  panel.id = 'sv_exemptPanel';
  panel.style.margin = '0 0 14px';
  const cards = page.querySelectorAll(':scope > .card');
  if (cards.length >= 2) cards[1].insertAdjacentElement('beforebegin', panel);
  else page.insertBefore(panel, page.querySelector('#sv_listTable') ? document.getElementById('sv_listTable').closest('.card') : null);
}

window.subjSvPanel = function(){
  ensureSvPanel();
  const panel = document.getElementById('sv_exemptPanel');
  if (!panel) return;
  panel.innerHTML =
    '<div style="border:1.5px solid rgba(248,113,113,.35);border-radius:12px;overflow:hidden">'
    + '<div style="padding:10px 14px;background:rgba(248,113,113,.08);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    + '<div style="font-size:12px;font-weight:800;color:var(--rose,#f87171)">🚫 EXEMPTED TEACHERS — excluded from every supervision list</div>'
    + '<button class="btn btn-sm" onclick="subjSvAllAvailable()" style="font-size:10px;margin-left:auto">✓ All available</button>'
    + '</div>'
    + '<div style="padding:8px 10px">'
    + '<div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">Tick a teacher to exempt them from exam supervision; untick to return them to the rotation.</div>'
    + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">'
    + '<span class="dr-pill" style="background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);color:var(--rose,#f87171);border-radius:20px;padding:2px 10px;font-size:10.5px;font-weight:800" id="sv_exemptCount"></span>'
    + '</div>'
    + '<div id="sv_exemptList" style="max-height:280px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:4px;background:var(--navy,#1a2233)"></div>'
    + '</div></div>';
  window.subjRenderSvExemptions();
};

function wrapSupervision(){
  if (typeof window.renderSupervisionPage !== 'function' || window.renderSupervisionPage.__sx) return false;
  const orig = window.renderSupervisionPage;
  window.renderSupervisionPage = function(){
    orig.apply(this, arguments);
    try { window.subjSvPanel(); } catch (e) {}
  };
  window.renderSupervisionPage.__sx = true;
  return true;
}
if (!wrapSupervision()) {
  const t0 = setInterval(() => { if (wrapSupervision()) clearInterval(t0); }, 200);
  setTimeout(() => clearInterval(t0), 20000);
}

/* ═══ 2 + 3. SOLID SEARCH PANELS & PHONE RESPONSIVENESS ═══════════════════ */
(function styles(){
  if (document.getElementById('sx-styles')) return;
  const st = document.createElement('style');
  st.id = 'sx-styles';
  st.textContent = `
    /* --card-bg was never defined anywhere → panels using it were transparent.
       Define it solid, plus explicit overrides for the two search dropdowns. */
    :root { --card-bg: #1c2536; }
    #searchSuggestions { background: #1c2536 !important; }
    #quickSearchOverlay > div { background: #1c2536 !important; }
    #quickSearchResults { background: #1c2536 !important; }
    #quickSearchResults > div { background: transparent; }

    /* Activity Log panel: hidden while any function page or modal is open
       (see the watcher below).  The Sync & System actions now live inside
       the menu drawer / desktop sidebar, so no floating buttons to hide. */
    body.fn-open #__ss_logpanel__ { display: none !important; }

    /* ── Phones & tablets: no desktop-mode needed ── */
    @media (max-width: 900px) {
      .modal-page { left: 0 !important; top: 56px; padding: 14px 10px 96px; }
      .page-header { flex-wrap: wrap; gap: 8px; }
      .page-title { font-size: 17px; }
      .page-sub { font-size: 10.5px; }
      .form-grid { grid-template-columns: 1fr !important; }
      .dr-form-grid { flex-direction: column !important; align-items: stretch !important; }
      .dr-mid-dates { flex-direction: column !important; align-items: stretch !important; }
      .dr-field input[type="date"], .dr-field input[type="number"], .dr-field input[type="text"],
      .dr-field select, .dr-multi, .dr-export-row select { width: 100% !important; min-width: 0 !important; }
      .dr-multi-menu { width: 100% !important; left: 0 !important; }
      .dr-export-row { align-items: stretch !important; }
      .dr-export-row .dr-btn, .dr-export-row select { flex: 1 1 130px; }
      .tch-row { flex-wrap: wrap; }
      .ng-card { padding: 10px 12px; }
      #navGroupHub > div > div:last-child { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; }
      .page-actions { width: 100%; }
      .table-wrap, table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
      #quickSearchOverlay > div { margin: 0 10px !important; }
      .card-body { padding: 12px 10px; }
    }
    @media (max-width: 480px) {
      .modal-page { padding: 10px 8px 90px; }
      .stats-grid, .dashboard-grid { grid-template-columns: 1fr 1fr !important; }
      .dr-num-field, .dr-field input[type="number"] { width: 100% !important; }
    }
  `;
  document.head.appendChild(st);
})();

/* ═══ 4. FLOATING BUTTONS: dashboard-only visibility ═══════════════════════ */
(function floatingButtons(){
  /* true while a function page, modal or overlay is open */
  const fnOpen = () => {
    if (document.querySelector('.modal-page.open')) return true;
    const els = document.querySelectorAll('[id*="modal" i], [id*="overlay" i]');
    for (const el of els) {
      if (el.id === 'quickSearchOverlay') continue;   // handled by its own backdrop
      if (!el.offsetWidth && !el.offsetHeight) continue;   // zero-size child of a hidden modal
      const cs = getComputedStyle(el);
      if (cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0') return true;
    }
    return false;
  };
  const watch = () => document.body.classList.toggle('fn-open', fnOpen());
  const mo = new MutationObserver(watch);
  mo.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  document.addEventListener('DOMContentLoaded', watch);
  setInterval(watch, 350);
})();

})();
