/* ==========================================================================
   PDF EXPORT & PRINT HANDLER MODULE (pdf.js)
   ========================================================================== */

/**
 * Downloads the current compiled markdown preview using html2pdf.js by capturing
 * the visible container and temporarily switching to light theme for perfect export.
 * @param {HTMLElement} pdfContainer The visible digital sheet container (#pdf-container-element).
 * @param {string} pageFormat Preference value ('letter' or 'a4').
 * @param {Function} showToast Callback function to display notification.
 */
export async function downloadLocalPdf(pdfContainer, pageFormat, showToast) {
  if (!pdfContainer || pdfContainer.textContent.trim() === '') {
    showToast('El editor está vacío', 'Escribe algo de contenido antes de descargar el PDF.', 'error');
    return;
  }

  // Safety check to ensure html2pdf is loaded in window
  if (typeof window.html2pdf !== 'function') {
    showToast(
      'Cargando librerías',
      'La biblioteca PDF aún se está cargando. Sugerimos usar la opción "Imprimir (Físico)" por ahora.',
      'error'
    );
    return;
  }

  showToast('Generando PDF...', 'El archivo se está ensamblando de forma local en tu RAM.', 'success');

  // 1. Get current active theme to restore it later
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  // 2. Temporarily set active theme to light so HSL variables resolve in light theme (white paper / slate text)
  document.documentElement.setAttribute('data-theme', 'light');

  // 3. Save original layout styles and classes to restore them afterwards
  const originalWidth = pdfContainer.style.width;
  const originalMaxWidth = pdfContainer.style.maxWidth;
  const originalMinHeight = pdfContainer.style.minHeight;
  const originalPadding = pdfContainer.style.padding;
  const originalBoxShadow = pdfContainer.style.boxShadow;
  const originalBorder = pdfContainer.style.border;
  const originalBorderRadius = pdfContainer.style.borderRadius;
  const originalTransform = pdfContainer.style.transform;
  const originalTransformOrigin = pdfContainer.style.transformOrigin;
  const originalMargin = pdfContainer.style.margin;
  const originalBackgroundColor = pdfContainer.style.backgroundColor;
  const originalBackground = pdfContainer.style.background;

  // 4. Force standard paper page layout for rendering (816px for Letter, 794px for A4)
  const targetWidth = pageFormat === 'a4' ? '794px' : '816px';
  const targetMinHeight = pageFormat === 'a4' ? '297mm' : '279.4mm';

  pdfContainer.style.width = targetWidth;
  pdfContainer.style.maxWidth = targetWidth;
  pdfContainer.style.minHeight = targetMinHeight;
  pdfContainer.style.padding = '0';
  pdfContainer.style.boxShadow = 'none';
  pdfContainer.style.border = 'none';
  pdfContainer.style.borderRadius = '0';
  pdfContainer.style.transform = 'none';
  pdfContainer.style.transformOrigin = '';
  pdfContainer.style.margin = '0 auto';
  pdfContainer.style.backgroundColor = '#ffffff';
  pdfContainer.style.background = '#ffffff';

  // 5. Configure html2pdf options.
  const options = {
    margin: 12, // Elegant uniform 12mm margins on all sides (top, bottom, left, right) on every page
    filename: `documento_markdify_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm',
      format: pageFormat === 'a4' ? 'a4' : 'letter',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    // Compile and download PDF using the active visible DOM element
    await window.html2pdf().set(options).from(pdfContainer).save();
    showToast('Descarga lista', 'El PDF vectorial se ha descargado de forma segura.', 'success');
  } catch (error) {
    console.error('Error compiling client-side PDF:', error);
    showToast('Error de compilación', 'Ocurrió un error al compilar. Por favor, usa "Imprimir (Físico)".', 'error');
  } finally {
    // 6. Restore original screen styles and dimensions
    pdfContainer.style.width = originalWidth;
    pdfContainer.style.maxWidth = originalMaxWidth;
    pdfContainer.style.minHeight = originalMinHeight;
    pdfContainer.style.padding = originalPadding;
    pdfContainer.style.boxShadow = originalBoxShadow;
    pdfContainer.style.border = originalBorder;
    pdfContainer.style.borderRadius = originalBorderRadius;
    pdfContainer.style.transform = originalTransform;
    pdfContainer.style.transformOrigin = originalTransformOrigin;
    pdfContainer.style.margin = originalMargin;
    pdfContainer.style.backgroundColor = originalBackgroundColor;
    pdfContainer.style.background = originalBackground;

    // 7. Restore original active theme
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
}

/**
 * Triggers native browser print window
 */
export function printPhysicalPdf() {
  window.print();
}
