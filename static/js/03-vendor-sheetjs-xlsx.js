
/* SheetJS dynamic fallback loader */
function ensureXLSX(cb){
  // 1. Check global XLSX (inlined SheetJS)
  if(typeof XLSX!=='undefined' && XLSX && XLSX.utils){cb();return;}
  // 2. Check window.XLSX
  if(typeof window!=='undefined' && window.XLSX && window.XLSX.utils){cb();return;}
  // 3. Try re-running make_xlsx_lib
  if(typeof make_xlsx_lib==='function'){
    try{
      var _x = (typeof XLSX!=='undefined') ? XLSX : (window.XLSX || {});
      make_xlsx_lib(_x);
      if(_x && _x.utils){ window.XLSX = _x; cb(); return; }
    }catch(e){ console.warn('make_xlsx_lib retry failed:', e); }
  }
  // 4. Load from CDN as last resort
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload = function(){
    if(typeof XLSX!=='undefined' && XLSX.utils){ cb(); }
    else{ toast('Excel library unavailable. Please use an internet connection.',true); }
  };
  s.onerror = function(){ toast('Excel library unavailable. Check internet connection.',true); };
  document.head.appendChild(s);
}
