/* ═══════════════════════════════════════════════════════════════════
   SANTAPRIS POLISH JS — Count-up, bar triggers, micro-delights
   Zero data/functional changes — purely visual enhancements
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── CONFIG ────────────────────────────────────────────────────── */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = REDUCED ? 0 : 900;      // count-up ms
  const BAR_DELAY = REDUCED ? 0 : 300;     // bar fill delay ms

  /* ── UTIL: EASING ─────────────────────────────────────────────── */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  /* ── COUNT-UP ANIMATION ───────────────────────────────────────── */
  function animateCounter(el, target) {
    if (REDUCED) { el.textContent = target; return; }
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const p = Math.min(1, (now - start) / DURATION);
      const val = Math.round(from + (target - from) * easeOutCubic(p));
      el.textContent = val;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    document.querySelectorAll('.animated-counter[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
    });
  }

  /* ── BAR FILL TRIGGER (IntersectionObserver) ───────────────────── */
  function initBarFills() {
    if (REDUCED) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.bar-fill').forEach(bar => {
            // width is already set inline by renderDashboard — just ensure transition runs
            bar.style.transition = `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${BAR_DELAY}ms`;
            // force reflow to kick transition
            void bar.offsetWidth;
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('#dashSubjBars, #dashGradeBars').forEach(el => observer.observe(el));
  }

  /* ── RE-TRIGGER ON GRADE FILTER CHANGE ─────────────────────────── */
  function hookFilterRetrigger() {
    const gradeSel = document.getElementById('dashGradeF');
    const top5Sel = document.getElementById('dashTop5G');
    [gradeSel, top5Sel].forEach(sel => {
      if (!sel) return;
      sel.addEventListener('change', () => {
        // Reset bar widths to 0, then let renderDashboard repaint
        document.querySelectorAll('#dashSubjBars .bar-fill, #dashGradeBars .bar-fill').forEach(bar => {
          bar.style.transition = 'none';
          bar.style.width = '0';
        });
        // After next paint, re-enable transitions
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.querySelectorAll('#dashSubjBars .bar-fill, #dashGradeBars .bar-fill').forEach(bar => {
              bar.style.transition = `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${BAR_DELAY}ms`;
            });
          });
        });
      });
    });
  }

  /* ── PAGE VISIBILITY: RE-ANIMATE ON TAB RETURN ─────────────────── */
  function hookVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        initCounters();
        initBarFills();
      }
    });
  }

  /* ── INIT ──────────────────────────────────────────────────────── */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    initCounters();
    initBarFills();
    hookFilterRetrigger();
    hookVisibility();

    // Re-run when dashboard page is shown (SPA navigation)
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.attributeName === 'class' && m.target.id === 'page-dashboard') {
          if (m.target.classList.contains('active')) {
            initCounters();
            initBarFills();
          }
        }
      });
    });
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage) observer.observe(dashPage, { attributes: true });
  }

  init();
})();