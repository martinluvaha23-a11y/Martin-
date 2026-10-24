
window._getJsPDF = function () {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  if (window.jsPDF) return window.jsPDF;
  console.error('window.jspdf:', window.jspdf);
  console.error('window.jsPDF:', window.jsPDF);
  throw new Error('jsPDF library failed to initialise');
};
