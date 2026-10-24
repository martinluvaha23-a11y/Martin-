
/* ─── Ensure jsPDF AutoTable plugin is applied to jsPDF constructor ─── */
/* Also wraps all PDF export functions to surface silent errors as toasts */
(function(){
  function _ensureAutoTable(){
    try{
      if(window.jspdf && window.jspdf.jsPDF){
        var _jsPDF = window.jspdf.jsPDF;
        /* applyPlugin is exported by the AutoTable UMD onto window */
        if(!_jsPDF.API.autoTable && typeof window.applyPlugin==='function'){
          window.applyPlugin(_jsPDF);
        }
      }
    }catch(e){ console.warn('AutoTable ensure error:', e); }
  }
  /* Run immediately and again after DOM ready to cover timing edge cases */
  _ensureAutoTable();
  var _PDF_FNS = [
    'exportGradeTrendsPDF','exportMostImprovedPDF','exportGenderPDF',
    'exportRubricDistPDF','exportCalendarPDF','exportAttendancePDF',
    'exportFeesPDF','exportWorkloadPDF','exportStudentProgressPDF',
    'exportStudentReportCard','exportStudentRubricCard',
    'exportClassResultsPDF','exportClassRubricPDF','exportBlankMarksheet',
    'exportCombinedGradeResultsPDF','exportAnalysisPDF',
    'exportTopStudentsPDF','exportTimetablePDF','exportSupervisionPDF',
    'exportClassListPDF','exportAllStudentsReportCards',
    'exportAllStudentsRubrics','exportSingleTeacherBooklist'
  ];
  function _wrapPDFFunctions(){
    _ensureAutoTable();
    _PDF_FNS.forEach(function(name){
      var orig = window[name];
      if(typeof orig !== 'function' || orig._pdfWrapped) return;
      window[name] = function(){
        try{
          return orig.apply(this, arguments);
        } catch(err){
          console.error('PDF export error in ' + name + ':', err);
          if(typeof toast === 'function'){
            toast('\u274C PDF error: ' + (err.message || String(err)), true);
          }
        }
      };
      window[name]._pdfWrapped = true;
    });
  }
  /* Wrap after all scripts have loaded */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(_wrapPDFFunctions, 200); });
  } else {
    setTimeout(_wrapPDFFunctions, 200);
  }
})();
