/* ═══════════════════════════════════════════════════════════════════
   LETTERS & REPORTS STUDIO — draft school letters/reports in 5 steps:
   letterhead (+logo) → title → subsections → A4 fit → PDF/Word export.
   - Drafts persist in their OWN localStorage key. This module never reads
     or writes db, never calls saveDB: score submission flows are untouched.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var LT_KEY = 'santapris_letters_v1';
var LT = null;
var MM_PX = 96 / 25.4;

function ltFresh(){
  return { step: 1, head: '', useLogo: true, title: '', sections: [],
           pages: 2, orient: 'portrait', fontPt: 11.5, fittedPages: 0 };
}
function ltEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}
function ltSaveDraft(){
  try{ localStorage.setItem(LT_KEY, JSON.stringify(LT)); }catch(e){}
}
function ltLoadDraft(){
  try{
    var d = JSON.parse(localStorage.getItem(LT_KEY) || 'null');
    if(d && typeof d === 'object') return Object.assign(ltFresh(), d);
  }catch(e){}
  return ltFresh();
}
function ltLogoURL(){
  try{
    if(typeof SCHOOL_LOGO_DATAURL === 'string' && SCHOOL_LOGO_DATAURL.indexOf('data:image') === 0)
      return SCHOOL_LOGO_DATAURL;
  }catch(e){}
  return '';
}
function ltToday(){
  var d = new Date();
  var day = d.getDate();
  var suf = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' :
            (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
  var months = ['January','February','March','April','May','June','July',
    'August','September','October','November','December'];
  return 'Nairobi, ' + day + suf + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/* ── wizard ─────────────────────────────────────────────────────── */
window.initLettersPage = function(){
  LT = ltLoadDraft();
  var h = document.getElementById('lt_head');
  if(h && !h.value) h.value = LT.head || 'SANTAPRIS ACADEMY\nA Brightened Future';
  var t = document.getElementById('lt_title');
  if(t && !t.value) t.value = LT.title || '';
  var lg = document.getElementById('lt_logo');
  if(lg) lg.checked = LT.useLogo !== false;
  ltLogoPreview();
  var p = document.getElementById('lt_pages');
  if(p && !p.value) p.value = LT.pages || 2;
  ltRenderSubmitted();
  ltGoto(1);
};
function ltSteps(){
  return ['1. Head', '2. Title', '3. Sections', '4. Format', '5. Export'];
}
window.ltGoto = function(n){
  LT.step = n;
  var ind = document.getElementById('lt_stepsInd');
  if(ind) ind.innerHTML = ltSteps().map(function(l, i){
    var k = i + 1;
    return '<span class="stt-step ' + (k < n ? 'done' : (k === n ? 'now' : '')) + '">' + l + '</span>';
  }).join('<span class="stt-step-sep">→</span>');
  for(var i = 1; i <= 5; i++){
    var d = document.getElementById('lt_step' + i);
    if(d) d.style.display = (i === n) ? '' : 'none';
  }
  var pg = document.getElementById('page-letters');
  if(pg) pg.scrollTop = 0;
};
window.ltStep1Submit = function(){
  var h = (document.getElementById('lt_head').value || '').trim();
  if(!h){ toast('Type the letterhead contents first', true); return; }
  LT.head = h;
  LT.useLogo = !!document.getElementById('lt_logo').checked;
  ltSaveDraft();
  ltGoto(2);
};
window.ltStep2Submit = function(){
  var t = (document.getElementById('lt_title').value || '').trim();
  if(!t){ toast('Type the document title first', true); return; }
  LT.title = t;
  ltSaveDraft();
  ltGoto(3);
};
window.ltStep3Submit = function(){
  if(!LT.sections.length){ toast('Add and submit at least one subsection first', true); return; }
  ltSaveDraft();
  ltGoto(4);
};
function ltLogoPreview(){
  var img = document.getElementById('lt_logoPrev');
  var url = ltLogoURL();
  if(img){
    if(url && document.getElementById('lt_logo').checked){ img.src = url; img.style.display = ''; }
    else img.style.display = 'none';
  }
}
if(document.getElementById('lt_logo'))
  document.getElementById('lt_logo').addEventListener('change', ltLogoPreview);

/* ── subsections: editors left, submitted right ─────────────────── */
var _ltEdSeq = 0;
window.ltAddEditor = function(prefill, editIdx){
  var wrap = document.getElementById('lt_editors');
  if(!wrap) return;
  prefill = prefill || {};
  var id = 'lte' + (++_ltEdSeq) + '_' + Date.now();
  var card = document.createElement('div');
  card.id = id;
  if(editIdx !== undefined && editIdx !== null) card.setAttribute('data-lt-edit', String(editIdx));
  card.style.cssText = 'background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px';
  card.innerHTML =
    '<div class="form-group" style="margin-bottom:10px"><label>Subsection title</label>' +
    '<input type="text" data-lt-t placeholder="e.g. Academic Performance" style="width:100%;font-weight:700" value="' + ltEsc(prefill.t || '').replace(/"/g, '&quot;') + '"></div>' +
    '<div class="form-group" style="margin-bottom:10px"><label>Body — what should this part say?</label>' +
    '<textarea data-lt-b rows="4" placeholder="Type the contents…" style="width:100%">' + ltEsc(prefill.b || '') + '</textarea></div>' +
    '<div style="margin-bottom:10px"><button type="button" class="btn btn-ghost btn-sm" data-lt-boxbtn>▭ Add emphasis text box</button></div>' +
    '<div class="form-group" data-lt-boxwrap style="display:none;margin-bottom:10px"><label>Text box — short text for emphasis (prints inside a visible outline)</label>' +
    '<textarea data-lt-box rows="2" placeholder="e.g. Congratulations to all candidates!" style="width:100%;border:2px solid #B97F1F;border-radius:8px">' + ltEsc(prefill.box || '') + '</textarea></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end">' +
    '<button class="btn btn-ghost btn-sm" onclick="ltDropEditor(\'' + id + '\')">Discard</button>' +
    '<button class="btn btn-primary btn-sm" data-lt-go style="display:none" onclick="ltSubmitEditor(\'' + id + '\')">✔ Submit Subsection</button></div>';
  wrap.appendChild(card);
  var boxTa = card.querySelector('[data-lt-box]');
  if(prefill.box){ card.querySelector('[data-lt-boxwrap]').style.display = ''; }
  card.querySelector('[data-lt-boxbtn]').addEventListener('click', function(){
    var w = card.querySelector('[data-lt-boxwrap]');
    w.style.display = (w.style.display === 'none') ? '' : 'none';
    if(w.style.display === '') boxTa.focus();
  });
  function refresh(){
    var has = card.querySelector('[data-lt-t]').value.trim() ||
              card.querySelector('[data-lt-b]').value.trim() ||
              boxTa.value.trim();
    card.querySelector('[data-lt-go]').style.display = has ? '' : 'none';
  }
  card.querySelector('[data-lt-t]').addEventListener('input', refresh);
  card.querySelector('[data-lt-b]').addEventListener('input', refresh);
  boxTa.addEventListener('input', refresh);
  card._ltBox = function(){ return boxTa.value.trim() || null; };
  refresh(); // prefilled (edit mode) values must reveal Submit immediately
  card.querySelector('[data-lt-t]').focus();
};
window.ltDropEditor = function(id){
  var el = document.getElementById(id);
  if(el) el.remove();
};
window.ltSubmitEditor = function(id){
  var el = document.getElementById(id);
  if(!el) return;
  var title = el.querySelector('[data-lt-t]').value.trim();
  var body = el.querySelector('[data-lt-b]').value.trim();
  var box = null;
  try{ box = el._ltBox ? el._ltBox() : null; }catch(e){ box = null; }
  if(!title && !body && !box){ toast('Type, or fill the text box, first', true); return; }
  var rec = { t: title || 'Untitled Section', b: body };
  if(box) rec.box = box;
  var ei = el.getAttribute('data-lt-edit');
  if(ei !== null && ei !== '' && LT.sections[parseInt(ei, 10)]) LT.sections[parseInt(ei, 10)] = rec;
  else LT.sections.push(rec);
  el.remove();
  ltSaveDraft();
  ltRenderSubmitted();
  toast('✅ Subsection added');
};
window.ltEditSection = function(i){
  if(!LT.sections[i]) return;
  ltAddEditor({ t: LT.sections[i].t, b: LT.sections[i].b, box: LT.sections[i].box }, i);
  toast('✏️ Editing subsection ' + (i + 1) + ' — submit to replace it');
};
window.ltDeleteSection = function(i){
  if(!LT.sections[i]) return;
  if(!confirm('Remove subsection "' + LT.sections[i].t + '"?')) return;
  LT.sections.splice(i, 1);
  ltSaveDraft();
  ltRenderSubmitted();
};
function ltRenderSubmitted(){
  var box = document.getElementById('lt_submitted');
  if(!box) return;
  var n = document.getElementById('lt_secCount');
  if(n) n.textContent = LT.sections.length;
  if(!LT.sections.length){
    box.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>No subsections yet — add one on the left.</p></div>';
    return;
  }
  box.innerHTML = LT.sections.map(function(s, i){
    var prev = (s.b || '').trim().replace(/\s+/g, ' ').slice(0, 140);
    return '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px">' +
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:800;color:var(--sky);font-size:13px">' + (i + 1) + '. ' + ltEsc(s.t) + '</span>' +
      '<span style="margin-left:auto;display:flex;gap:6px">' +
      '<button class="btn btn-ghost btn-sm" style="padding:2px 8px" onclick="ltEditSection(' + i + ')">✏️ Edit</button>' +
      '<button class="btn btn-ghost btn-sm" style="color:var(--rose);padding:2px 8px" onclick="ltDeleteSection(' + i + ')">✕</button></span></div>' +
      (s.img ? '<div style="margin-top:6px"><img src="' + s.img + '" style="max-width:100%;border-radius:6px;border:1px solid var(--border)"></div>' : '') +
      (s.box ? '<div style="margin-top:6px;border:2px solid #B97F1F;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:600;color:var(--text-primary);background:rgba(185,127,31,0.07)">' + ltEsc(s.box) + '</div>' : '') +
      (prev ? '<div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">' + ltEsc(prev) + (s.b.length > 140 ? '…' : '') + '</div>' : '') +
      '</div>';
  }).join('');
}

/* ── A4 model ───────────────────────────────────────────────────── */
function ltDims(){
  var land = LT.orient === 'landscape';
  return { wMm: land ? 297 : 210, hMm: land ? 210 : 297,
           mMm: 15, land: land };
}
function ltPx(mm){ return mm * MM_PX; }
/* Split content nodes into page buckets at the content height. Headings
   never strand at a page bottom (pushed with their paragraph). */
function ltPaginate(nodes, contentPx){
  var pages = [[]], used = 0;
  nodes.forEach(function(nd, i){
    var h = nd.h;
    var nextIsPara = nodes[i + 1] && nodes[i + 1].kind === 'p';
    if(nd.kind === 'h' && nextIsPara && used + h + 40 > contentPx && used > 0){
      pages.push([]); used = 0;
    }
    if(used + h > contentPx && used > 0){ pages.push([]); used = 0; }
    pages[pages.length - 1].push(nd);
    used += h;
  });
  return pages;
}
/* Build measured content nodes for the current draft + font size. */
function ltMeasure(fontPt){
  var dims = ltDims();
  var meas = document.createElement('div');
  meas.style.cssText = 'position:fixed;left:-99999px;top:0;width:' + ltPx(dims.wMm - dims.mMm * 2) + 'px;visibility:hidden;';
  document.body.appendChild(meas);
  var nodes = [];
  function add(html, kind){
    var d = document.createElement('div');
    d.innerHTML = html;
    meas.appendChild(d);
    // Drawings load async — measure would under-read, so use their true
    // aspect ratio (canvas is 560×320, shown at 75% of content width).
    var h = (kind === 'img')
      ? (meas.clientWidth * 0.75 / (560 / 320) + 14)
      : d.offsetHeight;
    nodes.push({ html: html, kind: kind, h: h });
    meas.removeChild(d);
  }
  var basePx = fontPt * MM_PX / 2.83465 * 1.0; // pt → px at 96dpi
  function px(pt){ return Math.round(pt * 96 / 72); }
  var logo = (LT.useLogo && ltLogoURL()) ?
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">' +
    '<img src="' + ltLogoURL() + '" style="height:68px;border-radius:8px;flex-shrink:0">' +
    '<div style="flex:1">' +
    LT.head.split('\n').map(function(line, i){
      return '<div style="text-align:center;font-weight:' + (i === 0 ? '800' : '500') +
        ';font-size:' + px(i === 0 ? fontPt + 6 : fontPt + 0.5) + 'px;color:#1B5E3B">' + ltEsc(line.trim() || ' ') + '</div>';
    }).join('') + '</div></div>' :
    LT.head.split('\n').map(function(line, i){
      return '<div style="text-align:center;font-weight:' + (i === 0 ? '800' : '500') +
        ';font-size:' + px(i === 0 ? fontPt + 6 : fontPt + 0.5) + 'px;color:#1B5E3B">' + ltEsc(line.trim() || ' ') + '</div>';
    }).join('');
  add(logo + '<div style="border-bottom:3px double #B97F1F;margin:10px 0 4px"></div>', 'head');
  add('<div style="text-align:center;font-family:Georgia,serif;font-weight:800;font-size:' + px(fontPt + 9) +
    'px;color:#111;margin:10px 0 2px">' + ltEsc(LT.title) + '</div>' +
    '<div style="text-align:center;font-size:' + px(fontPt - 2) + 'px;color:#5A7A6A;margin-bottom:8px">' + ltEsc(ltToday()) + '</div>', 'title');
  LT.sections.forEach(function(s){
    add('<div style="font-weight:800;font-size:' + px(fontPt + 2.5) +
      'px;color:#1B5E3B;border-left:4px solid #B97F1F;padding-left:8px;margin:10px 0 4px;text-decoration:underline;text-underline-offset:3px">' + ltEsc(s.t) + '</div>', 'h');
    (s.b || '').split(/\n{2,}|\n/).filter(function(p){ return p.trim(); }).forEach(function(p){
      add('<div style="font-size:' + px(fontPt) + 'px;line-height:1.5;color:#222;margin:0 0 6px;text-align:justify">' +
        ltEsc(p.trim()) + '</div>', 'p');
    });
    if(s.img) add('<div style="text-align:center;margin:6px 0"><img src="' + s.img + '" style="width:75%;border:1px solid #D9CFAE;border-radius:4px"></div>', 'img');
    if(s.box) add('<div style="border:2px solid #B97F1F;border-radius:8px;padding:8px 12px;margin:6px 0;font-size:' + px(fontPt + 0.5) + 'px;font-weight:700;color:#1B5E3B;background:rgba(185,127,31,0.07);text-align:center">' + ltEsc(s.box) + '</div>', 'tbox');
  });
  document.body.removeChild(meas);
  return nodes;
}
function ltContentPx(){
  var dims = ltDims();
  return ltPx(dims.hMm - dims.mMm * 2 - 14); // reserve footer strip
}
function ltFit(){
  var target = Math.max(1, Math.min(10, parseInt(LT.pages, 10) || 2));
  var pt = 11.5, pages = null, guard = 0;
  while(guard++ < 12){
    var pagesNow = ltPaginate(ltMeasure(pt), ltContentPx()).length;
    pages = pagesNow;
    if(pagesNow <= target || pt <= 7.5) break;
    pt = Math.max(7.5, pt - 0.5);
  }
  LT.fontPt = pt;
  LT.fittedPages = pages;
  return { pt: pt, pages: pages, target: target };
}
window.ltFormatSubmit = function(){
  if(!LT.sections.length){ toast('Add at least one subsection first', true); return; }
  LT.pages = Math.max(1, Math.min(10, parseInt(document.getElementById('lt_pages').value, 10) || 2));
  LT.orient = document.getElementById('lt_orient').value === 'landscape' ? 'landscape' : 'portrait';
  var fit = ltFit();
  ltSaveDraft();
  ltRenderPreview();
  var note = document.getElementById('lt_fitNote');
  if(note) note.textContent = fit.pages <= fit.target
    ? ('Fitted to ' + fit.pages + ' of ' + fit.target + ' page(s) at ' + fit.pt.toFixed(1) + 'pt')
    : ('Content needs ' + fit.pages + ' pages at minimum size — add pages or shorten text');
  ltGoto(5);
};
/* On-screen A4 preview (scaled to fit the column, true mm proportions). */
function ltRenderPreview(){
  var box = document.getElementById('lt_preview');
  if(!box) return;
  var dims = ltDims();
  var nodes = ltMeasure(LT.fontPt);
  var pages = ltPaginate(nodes, ltContentPx());
  LT.fittedPages = pages.length;
  var scale = Math.min(1, 640 / ltPx(dims.wMm));
  box.innerHTML = '';
  pages.forEach(function(pg, i){
    var sheet = document.createElement('div');
    sheet.style.cssText = 'width:' + ltPx(dims.wMm) + 'px;height:' + ltPx(dims.hMm) +
      'px;background:#fff;color:#222;position:relative;overflow:hidden;' +
      'border-radius:4px;box-shadow:0 10px 34px rgba(0,0,0,.45);' +
      'transform:scale(' + scale + ');transform-origin:top center;margin-bottom:' + (-ltPx(dims.hMm) * (1 - scale) + 18) + 'px;';
    var inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;left:' + ltPx(dims.mMm) + 'px;top:' + ltPx(dims.mMm) +
      'px;width:' + ltPx(dims.wMm - dims.mMm * 2) + 'px;';
    inner.innerHTML = pg.map(function(nd){ return nd.html; }).join('');
    var foot = document.createElement('div');
    foot.style.cssText = 'position:absolute;bottom:' + ltPx(9) + 'px;left:0;right:0;text-align:center;' +
      'font-size:10px;color:#5A7A6A;border-top:1px solid #D9CFAE;padding-top:4px;';
    foot.textContent = 'Page ' + (i + 1) + ' of ' + pages.length + '  ·  SANTAPRIS ACADEMY  ·  A Brightened Future';
    sheet.appendChild(inner);
    sheet.appendChild(foot);
    var label = document.createElement('div');
    label.style.cssText = 'font-size:11px;color:var(--text-muted);margin-bottom:6px;text-align:center';
    label.textContent = '— A4 ' + (dims.land ? 'landscape' : 'portrait') + ' · page ' + (i + 1) + ' of ' + pages.length + ' —';
    var wrap = document.createElement('div');
    wrap.appendChild(label);
    wrap.appendChild(sheet);
    box.appendChild(wrap);
  });
}

/* ── PDF export (A4, both orientations) ─────────────────────────── */
function ltImgFormat(url){
  if(url.indexOf('data:image/png') === 0) return 'PNG';
  return 'JPEG';
}
window.ltExportPDF = function(){
  try{
    var jsPDF = window._getJsPDF();
    var dims = ltDims();
    var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: dims.land ? 'landscape' : 'portrait' });
    var W = dims.wMm, m = dims.mMm, cw = W - m * 2;
    var fPt = LT.fontPt || 11.5;
    function footer(pg, n){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 120, 105);
      doc.text('Page ' + pg + ' of ' + n + '  ·  SANTAPRIS ACADEMY  ·  A Brightened Future',
        W / 2, dims.hMm - 9, { align: 'center' });
    }
    // paginate first (measure in char space), then draw
    var blocks = [];
    var logo = LT.useLogo ? ltLogoURL() : '';
    LT.head.split('\n').forEach(function(line, i){
      blocks.push({ kind: 'head', text: line.trim() || ' ', first: i === 0 });
    });
    blocks.push({ kind: 'rule' });
    blocks.push({ kind: 'title', text: LT.title });
    blocks.push({ kind: 'date', text: ltToday() });
    LT.sections.forEach(function(s){
      blocks.push({ kind: 'h', text: s.t });
      (s.b || '').split(/\n{2,}|\n/).filter(function(p){ return p.trim(); }).forEach(function(p){
        blocks.push({ kind: 'p', text: p.trim() });
      });
      if(s.img) blocks.push({ kind: 'img', src: s.img });
      if(s.box) blocks.push({ kind: 'tbox', text: s.box });
    });
    var pages = [[]], curH = logo ? 30 : 0, maxH = dims.hMm - m * 2 - 12;
    function est(b){
      if(b.kind === 'img') return { lines: [], h: 66 };
      if(b.kind === 'tbox'){
        doc.setFont('helvetica', 'bold'); doc.setFontSize(fPt + 0.5);
        var bl = doc.splitTextToSize(b.text, cw - 16);
        return { lines: bl, h: bl.length * (fPt + 0.5) * 0.5 + 12 };
      }
      doc.setFont(b.kind === 'title' ? 'times' : 'helvetica', (b.kind === 'title' || b.kind === 'h' || b.first) ? 'bold' : 'normal');
      doc.setFontSize(b.kind === 'title' ? fPt + 9 : b.kind === 'h' ? fPt + 2.5 : b.kind === 'head' ? (b.first ? fPt + 6 : fPt + 0.5) : fPt);
      var lines = doc.splitTextToSize(b.text, b.kind === 'h' ? cw - 10 : cw);
      return { lines: lines, h: lines.length * (b.kind === 'title' ? (fPt + 9) * 0.45 : b.kind === 'h' ? (fPt + 5) * 0.45 : fPt * 0.5) + 2 };
    }
    blocks.forEach(function(b, i){
      var e = est(b);
      b._lines = e.lines; b._h = e.h + (b.kind === 'h' ? 5 : b.kind === 'title' ? 6 : 2);
      var nextP = blocks[i + 1] && blocks[i + 1].kind === 'p';
      if(b.kind === 'h' && nextP && curH + b._h + 12 > maxH && curH > 0){ pages.push([]); curH = 0; }
      if(curH + b._h > maxH && curH > 0){ pages.push([]); curH = 0; }
      pages[pages.length - 1].push(b);
      curH += b._h;
    });
    pages.forEach(function(pg, pi){
      if(pi > 0) doc.addPage();
      var y = m;
      if(pi === 0 && logo){
        try{
          doc.addImage(logo, ltImgFormat(logo), m, y, 22, 22);
        }catch(e){}
        y += 26;
      }
      pg.forEach(function(b){
        if(b.kind === 'img'){
          try{ doc.addImage(b.src, 'PNG', (W - 105) / 2, y, 105, 60); }catch(e){}
          y += 64;
          return;
        }
        if(b.kind === 'tbox'){
          doc.setFont('helvetica', 'bold'); doc.setFontSize(fPt + 0.5); doc.setTextColor(27, 94, 59);
          doc.setDrawColor(185, 127, 31); doc.setLineWidth(0.8);
          var bh = b._h;
          doc.roundedRect(m, y, cw, bh, 2, 2);
          doc.text(b._lines, m + 8, y + 8);
          y += bh + 4;
          return;
        }
        if(b.kind === 'rule'){
          doc.setDrawColor(185, 127, 31); doc.setLineWidth(0.8);
          doc.line(m, y + 1, m + cw, y + 1); y += 5; return;
        }
        doc.setFont(b.kind === 'title' ? 'times' : 'helvetica', (b.kind === 'title' || b.kind === 'h' || b.first) ? 'bold' : 'normal');
        if(b.kind === 'title'){ doc.setFontSize(fPt + 9); doc.setTextColor(20, 20, 20); }
        else if(b.kind === 'h'){ doc.setFontSize(fPt + 2.5); doc.setTextColor(27, 94, 59); }
        else if(b.kind === 'head'){ doc.setFontSize(b.first ? fPt + 6 : fPt + 0.5); doc.setTextColor(27, 94, 59); }
        else if(b.kind === 'date'){ doc.setFontSize(fPt - 2); doc.setTextColor(110, 120, 105); }
        else { doc.setFontSize(fPt); doc.setTextColor(35, 35, 35); }
        var x = (b.kind === 'title' || b.kind === 'head' || b.kind === 'date') ? W / 2 : m;
        var opt = (b.kind === 'title' || b.kind === 'head' || b.kind === 'date') ? { align: 'center' } : {};
        if(b.kind === 'h'){
          doc.text(b._lines, m + 3, y + 4, opt);
          try{
            var tw = doc.getTextWidth(b._lines[0] || '');
            doc.setDrawColor(185, 127, 31); doc.setLineWidth(0.6);
            doc.line(m + 3, y + 5.5, m + 3 + tw, y + 5.5);
          }catch(e){}
          y += b._h + 3;
        } else {
          doc.text(b._lines, x, y + 4, opt);
          y += b._h + (b.kind === 'title' ? 4 : 1);
        }
      });
      footer(pi + 1, pages.length);
    });
    var fname = (LT.title || 'letter').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'letter';
    doc.save(fname + '_A4' + (dims.land ? '_landscape' : '') + '.pdf');
    toast('📄 Letter PDF exported');
  }catch(err){ toast('PDF export failed: ' + (err && err.message || err), true); }
};

/* ── Word export (A4, both orientations) ────────────────────────── */
function ltDataURLBytes(url){
  var b64 = String(url).split(',')[1] || '';
  var bin = atob(b64);
  var arr = new Uint8Array(bin.length);
  for(var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
window.ltExportWord = function(){
  try{
    if(typeof docx === 'undefined') return toast('Word library not loaded', true);
    var D = window.docx;
    var dims = ltDims();
    var land = dims.land;
    var fPt = LT.fontPt || 11.5;
    function para(text, o){
      o = o || {};
      return new D.Paragraph({
        alignment: o.center ? D.AlignmentType.CENTER : (o.justify ? D.AlignmentType.BOTH : D.AlignmentType.LEFT),
        spacing: { after: o.after === undefined ? 120 : o.after },
        children: [new D.TextRun({ text: String(text == null ? '' : text),
          bold: !!o.bold, underline: o.underline ? {} : undefined,
          size: Math.round((o.pt || fPt) * 2),
          color: o.color || '232323',
          font: o.serif ? 'Georgia' : 'Calibri' })]
      });
    }
    var kids = [];
    var logo = LT.useLogo ? ltLogoURL() : '';
    if(logo){
      try{
        kids.push(new D.Paragraph({ children: [
          new D.ImageRun({ data: ltDataURLBytes(logo), transformation: { width: 110, height: 110 } })
        ] }));
      }catch(e){}
    }
    LT.head.split('\n').forEach(function(line, i){
      line = line.trim();
      if(!line) return;
      kids.push(para(line, { center: true, bold: i === 0, pt: i === 0 ? fPt + 6 : fPt + 0.5, color: '1B5E3B', after: 40 }));
    });
    kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
      new D.TextRun({ text: '________________________________________', color: 'B97F1F', size: 16 })] }));
    kids.push(para(LT.title, { center: true, bold: true, serif: true, pt: fPt + 9, color: '111111', after: 60 }));
    kids.push(para(ltToday(), { center: true, pt: fPt - 2, color: '5A7A6A', after: 160 }));
    LT.sections.forEach(function(s){
      kids.push(para(s.t, { bold: true, underline: true, pt: fPt + 2.5, color: '1B5E3B', after: 80 }));
      (s.b || '').split(/\n{2,}|\n/).filter(function(p){ return p.trim(); }).forEach(function(p){
        kids.push(para(p.trim(), { justify: true, after: 100 }));
      });
      if(s.img){
        try{
          kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
            new D.ImageRun({ data: s.img, transformation: { width: 420, height: 240 } })
          ] }));
        }catch(e){}
      }
      if(s.box){
        try{
          var bdr = { style: D.BorderStyle.SINGLE, size: 12, color: 'B97F1F' };
          var bb = { top: bdr, bottom: bdr, left: bdr, right: bdr };
          kids.push(new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, borders: bb, rows: [
            new D.TableRow({ children: [
              new D.TableCell({ borders: bb, shading: { fill: 'F7F0DC' },
                margins: { top: 120, bottom: 120, left: 180, right: 180 },
                children: [new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
                  new D.TextRun({ text: s.box, bold: true, size: Math.round((fPt + 0.5) * 2), color: '1B5E3B', font: 'Calibri' })
                ] })] })
            ] })
          ] }));
        }catch(e){}
      }
    });
    kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { before: 300 },
      children: [new D.TextRun({ text: 'SANTAPRIS ACADEMY  ·  A Brightened Future', size: 16, color: '5A7A6A', font: 'Calibri' })] }));
    var docFile = new D.Document({ sections: [{ properties: { page: {
      size: { width: land ? 16838 : 11906, height: land ? 11906 : 16838 },
      margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: kids }] });
    D.Packer.toBlob(docFile).then(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var fname = (LT.title || 'letter').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'letter';
      a.download = fname + '_A4' + (land ? '_landscape' : '') + '.docx';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      toast('📝 Letter Word exported');
    });
  }catch(err){ toast('Word export failed: ' + (err && err.message || err), true); }
};

})();
