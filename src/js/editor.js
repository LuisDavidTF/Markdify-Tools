/* ==========================================================================
   WORKSPACE INTERACTIONS MODULE (editor.js)
   ========================================================================== */

/**
 * Attaches character and word count limits
 * @param {HTMLTextAreaElement} editor 
 * @param {HTMLElement} countElement 
 */
export function updateStats(editor, countElement) {
  if (!editor || !countElement) return;
  const content = editor.value;
  const chars = content.length;
  const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  countElement.textContent = `${chars} caracteres | ${words} palabras`;
}

/**
 * Binds synchronized scrolling between the editor textarea and preview panel
 * @param {HTMLTextAreaElement} editor 
 * @param {HTMLElement} previewContainerPanel 
 */
export function bindSyncScroll(editor, previewContainerPanel) {
  if (!editor || !previewContainerPanel) return;

  let isScrollingEditor = false;
  let isScrollingPreview = false;

  const editorScrollContainer = editor;
  const previewScrollContainer = previewContainerPanel;

  editorScrollContainer.addEventListener('scroll', () => {
    if (isScrollingPreview) {
      isScrollingPreview = false;
      return;
    }
    isScrollingEditor = true;
    const percentage = editorScrollContainer.scrollTop / (editorScrollContainer.scrollHeight - editorScrollContainer.clientHeight);
    previewScrollContainer.scrollTop = percentage * (previewScrollContainer.scrollHeight - previewScrollContainer.clientHeight);
  });

  previewScrollContainer.addEventListener('scroll', () => {
    if (isScrollingEditor) {
      isScrollingEditor = false;
      return;
    }
    isScrollingPreview = true;
    const percentage = previewScrollContainer.scrollTop / (previewScrollContainer.scrollHeight - previewScrollContainer.clientHeight);
    editorScrollContainer.scrollTop = percentage * (editorScrollContainer.scrollHeight - editorScrollContainer.clientHeight);
  });
}

/**
 * Initializes workspace resizer splitter dragging handler
 * @param {HTMLElement} divider The vertical dividing line element
 * @param {HTMLElement} leftPanel Editor pane
 * @param {HTMLElement} rightPanel Preview pane
 */
export function initPanelResizer(divider, leftPanel, rightPanel) {
  if (!divider || !leftPanel || !rightPanel) return;

  let isDragging = false;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent highlighting text during drag
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const workspacePanels = divider.parentElement;
    if (!workspacePanels) return;

    const rect = workspacePanels.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    
    // Calculate percentage width (clamped between 20% and 80%)
    let percent = (relativeX / rect.width) * 100;
    percent = Math.max(20, Math.min(percent, 80));

    leftPanel.style.flex = `0 0 ${percent}%`;
    rightPanel.style.flex = `0 0 ${100 - percent}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // Touch support for tablets/mobile responsive screens (in case split view is used)
  divider.addEventListener('touchstart', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length === 0) return;

    const workspacePanels = divider.parentElement;
    if (!workspacePanels) return;

    const rect = workspacePanels.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    let percent = (touchX / rect.width) * 100;
    percent = Math.max(20, Math.min(percent, 80));

    leftPanel.style.flex = `0 0 ${percent}%`;
    rightPanel.style.flex = `0 0 ${100 - percent}%`;
  });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
    }
  });
}

/**
 * Sets up custom keyboard shortcuts for developers
 * @param {HTMLTextAreaElement} editor 
 * @param {Function} onSave Manual save trigger
 * @param {Function} onPrint Manual print trigger
 * @param {Function} onDownload Manual download trigger
 */
export function setupKeyboardShortcuts(editor, onSave, onPrint, onDownload) {
  window.addEventListener('keydown', (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl) {
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onPrint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onDownload();
      }
    }
  });
}
