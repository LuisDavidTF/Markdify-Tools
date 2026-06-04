/* ==========================================================================
   PDF TO MARKDOWN LOCAL CONVERTER MODULE (pdf-to-md.js)
   ========================================================================== */
import './analytics.js';
import { initTheme, toggleTheme } from './theme.js';
import { updateStats, bindSyncScroll, initPanelResizer } from './editor.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements Binding ---
  const appWorkspace = document.getElementById('app-workspace');
  const uploadStateView = document.getElementById('upload-state-view');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const processingView = document.getElementById('processing-view');
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  const processingTitle = document.getElementById('processing-title');
  const logTerminal = document.getElementById('log-terminal');

  const sidebarMenu = document.getElementById('sidebar-menu');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const workspacePanelsView = document.getElementById('workspace-panels-view');
  const editorPanel = document.getElementById('editor-panel');
  const previewPanel = document.getElementById('preview-panel');
  const panelResizer = document.getElementById('panel-resizer');
  
  const markdownEditor = document.getElementById('markdown-editor');
  const markdownPreview = document.getElementById('markdown-preview');
  const previewPanelContent = document.querySelector('#preview-panel .panel-content');
  const charCountElement = document.getElementById('char-count');
  
  // Header Actions
  const btnCopyMd = document.getElementById('btn-copy-md');
  const btnDownloadMd = document.getElementById('btn-download-md');
  const btnResetFile = document.getElementById('btn-reset-file');
  const btnClearEditor = document.getElementById('btn-clear-editor');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');

  // Mobile Tabs
  const tabBtnEdit = document.getElementById('tab-btn-edit');
  const tabBtnPreview = document.getElementById('tab-btn-preview');

  // Sidebar info
  const infoFileName = document.getElementById('info-file-name');
  const infoFileSize = document.getElementById('info-file-size');
  const infoFilePages = document.getElementById('info-file-pages');

  // Checkbox settings
  const optDetectHeadings = document.getElementById('opt-detect-headings');
  const optSmartParagraphs = document.getElementById('opt-smart-paragraphs');
  const optDetectLists = document.getElementById('opt-detect-lists');
  const optDetectTables = document.getElementById('opt-detect-tables');
  const optPageSeparators = document.getElementById('opt-page-separators');
  const optCleanLines = document.getElementById('opt-clean-lines');

  // --- Local State ---
  let parsedPagesData = null; // Stored in-memory document model
  let loadedFileName = '';
  let loadedFileSizeStr = '';
  let loadedFilePagesCount = 0;

  // Initialize UI theme system
  initTheme();

  // Setup UI notifications/toasts container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  /**
   * Helper to display elegant Toast notifications
   */
  function showToast(title, desc, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '🛡️';
    else if (type === 'error') icon = '🚨';
    else if (type === 'info') icon = '💡';
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('active'), 10);

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 350);
    }, 3500);
  }

  /**
   * Helper for elegant Confirm Dialog modals
   */
  function showConfirmModal(title, desc, onConfirm) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    modalOverlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>${desc}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel">Cancelar</button>
          <button class="btn btn-danger btn-confirm">Aceptar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);
    setTimeout(() => modalOverlay.classList.add('active'), 10);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(modalOverlay)) {
          document.body.removeChild(modalOverlay);
        }
      }, 300);
    };

    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
      onConfirm();
      closeModal();
    });
  }

  // --- Inline Terminal Logs ---
  function clearLogs() {
    if (logTerminal) {
      logTerminal.innerHTML = '';
    }
  }

  function addLog(message, type = 'info') {
    if (!logTerminal) return;
    const p = document.createElement('p');
    p.className = `log-line ${type}`;
    p.textContent = `> ${message}`;
    logTerminal.appendChild(p);
    logTerminal.scrollTop = logTerminal.scrollHeight;
  }

  // --- PDF Parsing and Layout Engine ---

  /**
   * Extracts text, fonts, coordinates, and spacing details page-by-page.
   * @param {ArrayBuffer} arrayBuffer The raw loaded PDF bytes
   */
  async function parsePdfStructure(arrayBuffer) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('Librería PDF.js no cargada en el cliente.');
    }
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    
    addLog('Cargando el archivo PDF...', 'info');
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    
    // Wire load progress
    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        updateProgressBar(percent * 0.3); // Map load to first 30% of progress bar
        addLog(`Cargando bytes del archivo: ${percent}%`, 'info');
      }
    };

    const pdf = await loadingTask.promise;
    loadedFilePagesCount = pdf.numPages;
    addLog(`PDF cargado con éxito. Total páginas: ${pdf.numPages}`, 'success');

    const documentPages = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      addLog(`Procesando página ${pageNum} de ${pdf.numPages}...`, 'info');
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines = groupItemsIntoLines(textContent.items);
      
      documentPages.push(pageLines);
      
      // Map processing pages to 30%-90% of progress bar
      const percent = 30 + Math.round((pageNum / pdf.numPages) * 60);
      updateProgressBar(percent);
    }

    addLog('Análisis de maquetación finalizado.', 'success');
    updateProgressBar(100);
    return documentPages;
  }

  /**
   * Groups items returned by PDF.js into lines based on vertical tolerance
   */
  function groupItemsIntoLines(items) {
    if (!items || items.length === 0) return [];

    // Filter out whitespace elements and sort by Y coordinate descending (top to bottom)
    const sortedItems = [...items]
      .filter(item => item.str && item.str.trim() !== '')
      .sort((a, b) => b.transform[5] - a.transform[5]);

    const lines = [];
    let currentLine = [];
    let currentY = null;

    for (const item of sortedItems) {
      const y = item.transform[5];
      const fontSize = item.transform[3]; // scaleY

      if (currentY === null) {
        currentY = y;
        currentLine.push(item);
      } else {
        // Line-height threshold: if vertical difference is small, they are on the same line.
        // We use a threshold of 45% of font size or 6 pixels (whichever is larger)
        const deltaY = Math.abs(currentY - y);
        const threshold = Math.max(fontSize * 0.45, 6);
        if (deltaY <= threshold) {
          currentLine.push(item);
        } else {
          lines.push(currentLine);
          currentLine = [item];
          currentY = y;
        }
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Process each line to merge strings horizontally and identify layout structures
    const processedLines = [];
    for (const lineItems of lines) {
      // Sort items horizontally from left to right (translateX: transform[4])
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

      let combinedText = '';
      let lastXEnd = null;
      let maxFontSize = 0;
      let hasBoldFont = false;

      // Extract font info and text
      for (const item of lineItems) {
        const text = item.str;
        const xStart = item.transform[4];
        const fontSize = item.transform[3];

        const fontLower = (item.fontName || '').toLowerCase();
        const isBold = fontLower.includes('bold') || fontLower.includes('bld') || fontLower.includes('black') || fontLower.includes('w700') || fontLower.includes('w800') || fontLower.includes('heavy');
        if (isBold) hasBoldFont = true;

        if (fontSize > maxFontSize) maxFontSize = fontSize;

        // Estimate character width if item.width is not set
        const width = item.width || (text.length * fontSize * 0.5);
        const xEnd = xStart + width;

        if (lastXEnd === null) {
          combinedText += text;
        } else {
          const gap = xStart - lastXEnd;
          // If the horizontal gap is larger than 25% of font size, insert space separator
          if (gap > fontSize * 0.25) {
            combinedText += ' ' + text;
          } else {
            combinedText += text;
          }
        }
        lastXEnd = xEnd;
      }

      // Check column spacing for tables: split items that have large gaps between them
      let columnChunks = [];
      let currentChunk = '';
      let lastChunkXEnd = null;
      
      for (const item of lineItems) {
        const xStart = item.transform[4];
        const fontSize = item.transform[3];
        const width = item.width || (item.str.length * fontSize * 0.5);
        
        if (lastChunkXEnd === null) {
          currentChunk += item.str;
        } else {
          const gap = xStart - lastChunkXEnd;
          // If there is a massive gap (larger than 2.2 times the font size), treat as column separator
          if (gap > fontSize * 2.2) {
            columnChunks.push(currentChunk.trim());
            currentChunk = item.str;
          } else if (gap > fontSize * 0.25) {
            currentChunk += ' ' + item.str;
          } else {
            currentChunk += item.str;
          }
        }
        lastChunkXEnd = xStart + width;
      }
      if (currentChunk.trim() !== '') {
        columnChunks.push(currentChunk.trim());
      }

      const cleanedText = combinedText.trim();
      if (cleanedText === '') continue;

      processedLines.push({
        text: cleanedText,
        fontSize: maxFontSize,
        hasBold: hasBoldFont,
        y: lineItems[0].transform[5],
        xStart: lineItems[0].transform[4],
        xEnd: lastXEnd,
        columnChunks: columnChunks,
        hasColumnSpacing: columnChunks.length >= 2
      });
    }

    return processedLines;
  }

  /**
   * Applies the UI setting options on the in-memory parsed pages model to construct Markdown.
   */
  function renderMarkdownFromParsedData() {
    if (!parsedPagesData || parsedPagesData.length === 0) return '';

    const detectHeadings = optDetectHeadings.checked;
    const smartParagraphs = optSmartParagraphs.checked;
    const detectLists = optDetectLists.checked;
    const detectTables = optDetectTables.checked;
    const pageSeparators = optPageSeparators.checked;
    const cleanLines = optCleanLines.checked;

    // 1. Calculate body text font size using median across all lines
    const allFontSizes = [];
    for (const page of parsedPagesData) {
      for (const line of page) {
        allFontSizes.push(line.fontSize);
      }
    }
    
    let bodyFontSize = 10;
    if (allFontSizes.length > 0) {
      allFontSizes.sort((a, b) => a - b);
      bodyFontSize = allFontSizes[Math.floor(allFontSizes.length / 2)];
    }

    let markdown = '';
    let isFirstPage = true;

    // Walk through each page
    parsedPagesData.forEach((pageLines, pageIndex) => {
      if (!isFirstPage && pageSeparators) {
        markdown += '\n\n---\n\n';
      }
      isFirstPage = false;

      let lineIndex = 0;
      let listBuffer = [];
      let tableBuffer = [];

      // Loop page lines
      while (lineIndex < pageLines.length) {
        const line = pageLines[lineIndex];
        const nextLine = pageLines[lineIndex + 1];

        // --- DIAGNOSTIC LOG FOR NON-ALPHANUMERIC LINES ---
        const firstChar = line.text.trim().charAt(0);
        if (firstChar && !/[a-zA-Z0-9íáéóúñÍÁÉÓÚÑ]/.test(firstChar)) {
          const charCodes = [...line.text.trim().substring(0, 5)].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase()}`).join(' ');
          addLog(`Línea candidato list: "${line.text.substring(0, 15)}..." | Códigos: ${charCodes}`, 'info');
        }

        // --- TABLE DETECTION ---
        if (detectTables && line.hasColumnSpacing) {
          // If we have column chunks, group consecutive columns lines together.
          // If smartParagraphs is active, check if this line is a continuation of the previous row.
          if (smartParagraphs && tableBuffer.length > 0) {
            const prevRow = tableBuffer[tableBuffer.length - 1];
            const prevLine = pageLines[lineIndex - 1];
            const gap = prevLine ? (prevLine.y - line.y) : 999;
            const prevFontSize = prevLine ? prevLine.fontSize : bodyFontSize;
            
            // Continuation criteria:
            // 1. Same number of columns
            // 2. Vertical gap is small (< 1.8 * fontSize)
            // 3. The first column of this line is not a new list item
            const sameColsCount = prevRow.length === line.columnChunks.length;
            const isContinuation = sameColsCount && (gap < prevFontSize * 1.8) && !checkIsListItem(line.columnChunks[0]);
            
            if (isContinuation) {
              // Merge cell contents into the last row in the buffer
              tableBuffer[tableBuffer.length - 1] = mergeTableRows(prevRow, line.columnChunks);
            } else {
              tableBuffer.push(line.columnChunks);
            }
          } else {
            tableBuffer.push(line.columnChunks);
          }
          lineIndex++;
          continue;
        } else if (tableBuffer.length > 0) {
          // Flush table buffer
          markdown += formatTableMarkdown(tableBuffer) + '\n\n';
          tableBuffer = [];
          // Do not advance lineIndex here: let the current line be evaluated by standard rules
        }

        // --- LIST DETECTION ---
        const listMatch = detectLists ? checkIsListItem(line.text) : null;
        if (detectLists && listMatch) {
          let listText = listMatch.cleanText;
          let currentLine = line;
          
          // Check if subsequent lines are continuations of this list item (similar to paragraph merging)
          if (smartParagraphs) {
            let next = nextLine;
            while (next) {
              const nextList = detectLists && checkIsListItem(next.text);
              const nextTable = detectTables && next.hasColumnSpacing;
              const gap = currentLine.y - next.y;
              const sizeRatio = next.fontSize / bodyFontSize;
              const isNextHeading = detectHeadings && (sizeRatio >= 1.15 || (next.hasBold && next.text.length < 80));

              // Stop merging if next line is a new list item, table, heading, or the gap is too large
              if (nextList || nextTable || isNextHeading || gap > currentLine.fontSize * 1.8) {
                break;
              }

              // Append next line text to the list item
              listText += ' ' + next.text;
              lineIndex++;
              currentLine = next;
              next = pageLines[lineIndex + 1];
            }
          }

          // Add to list buffer
          listBuffer.push({
            marker: listMatch.marker,
            isOrdered: listMatch.isOrdered,
            text: listText
          });

          // Check if the next line is also a list item
          const actualNextLine = pageLines[lineIndex + 1];
          const nextListMatch = actualNextLine && detectLists ? checkIsListItem(actualNextLine.text) : null;
          if (!nextListMatch) {
            // End of list block, format and flush
            markdown += formatListMarkdown(listBuffer) + '\n\n';
            listBuffer = [];
          }
          lineIndex++;
          continue;
        }

        // --- HEADING DETECTION ---
        let isHeading = false;
        if (detectHeadings) {
          const sizeRatio = line.fontSize / bodyFontSize;
          // Heuristic heading rules
          if (sizeRatio >= 1.7 || (line.hasBold && sizeRatio >= 1.45 && line.text.length < 60)) {
            markdown += `# ${line.text}\n\n`;
            isHeading = true;
          } else if (sizeRatio >= 1.35 && sizeRatio < 1.7) {
            markdown += `## ${line.text}\n\n`;
            isHeading = true;
          } else if ((sizeRatio >= 1.15 && sizeRatio < 1.35) || (line.hasBold && line.text.length < 80 && sizeRatio >= 1.05)) {
            markdown += `### ${line.text}\n\n`;
            isHeading = true;
          }
        }

        if (isHeading) {
          lineIndex++;
          continue;
        }

        // --- SMART PARAGRAPH REBUILDING & TEXT ---
        if (smartParagraphs) {
          // Rebuild paragraph by merging wrapped lines
          let paragraphText = line.text;
          let currentLine = line;
          let next = nextLine;
          
          // Check if subsequent lines should be merged
          while (next) {
            const nextList = detectLists && checkIsListItem(next.text);
            const nextTable = detectTables && next.hasColumnSpacing;
            
            // Gap check: PDF coordinates are Y-decreasing down.
            // Gap is (currentLine.y - next.y).
            // A paragraph continuation should have a line spacing gap < 1.75 * fontSize.
            const gap = currentLine.y - next.y;
            const sizeRatio = next.fontSize / bodyFontSize;
            const isNextHeading = detectHeadings && (sizeRatio >= 1.15 || (next.hasBold && next.text.length < 80));

            // Stop merging if next line is a list item, heading, table, or the vertical gap is too large
            if (nextList || nextTable || isNextHeading || gap > currentLine.fontSize * 1.8) {
              break;
            }

            // Append next line text
            paragraphText += ' ' + next.text;
            
            // Advance in loop
            lineIndex++;
            currentLine = next;
            next = pageLines[lineIndex + 1];
          }

          markdown += `${paragraphText}\n\n`;
        } else {
          // Plain newline separation
          markdown += `${line.text}\n`;
        }

        lineIndex++;
      }

      // Flush any residual table buffer at the end of the page
      if (tableBuffer.length > 0) {
        markdown += formatTableMarkdown(tableBuffer) + '\n\n';
      }
    });

    // Option: clean extra empty lines
    if (cleanLines) {
      markdown = markdown
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '');
    }

    return markdown;
  }

  /**
   * Helper to check if text starts with bullet or numerical list indicators
   */
  function checkIsListItem(text) {
    if (!text) return null;
    
    // Clean leading whitespace, zero-width spaces (ZWSP), ZWJ, BOM, and non-breaking spaces (NBSP)
    const cleaned = text.replace(/^[\s\u200B\u200C\u200D\uFEFF\u00A0]+/, '');
    if (cleaned === '') return null;

    // 1. Numbered lists: standard number followed by dot/parenthesis and optional space (e.g. "1. ")
    const orderedRegex = /^(\d+)[\.\)]\s*(.*)$/;
    const orderedMatch = cleaned.match(orderedRegex);
    if (orderedMatch) {
      return {
        isOrdered: true,
        marker: orderedMatch[1] + '.',
        cleanText: orderedMatch[2].trim()
      };
    }

    // 2. Standard markdown bullet markers (-, *, +): require at least one space to avoid negative numbers or math expressions
    const standardUnorderedRegex = /^([\-*+])\s+(.*)$/;
    const standardMatch = cleaned.match(standardUnorderedRegex);
    if (standardMatch) {
      return {
        isOrdered: false,
        marker: '-',
        cleanText: standardMatch[2].trim()
      };
    }

    // 3. Dedicated bullet symbols (standard bullet, middle dots, squares, Wingdings private use area bullet glyphs):
    // Since these symbols are explicitly bullets, we make the trailing space optional.
    // Includes private use area range \uF000-\uF0FF, black circle \u25CF, white circle \u25CB, etc.
    const specialBulletRegex = /^([•◦▪·⁃‣■◆▲▼●○■□∙\u2022\u2219\u25CF\u25CB\u25A0\u25A1\u25E6\u25FE\u00B7\uF000-\uF0FF])\s*(.*)$/;
    const specialMatch = cleaned.match(specialBulletRegex);
    if (specialMatch) {
      return {
        isOrdered: false,
        marker: '-',
        cleanText: specialMatch[2].trim()
      };
    }

    // 4. Standalone bullets
    const standaloneBulletRegex = /^[•◦▪·⁃‣■◆▲▼●○■□∙\u2022\u2219\u25CF\u25CB\u25A0\u25A1\u25E6\u25FE\u00B7\uF000-\uF0FF]$/;
    if (standaloneBulletRegex.test(cleaned)) {
      return {
        isOrdered: false,
        marker: '-',
        cleanText: ''
      };
    }

    return null;
  }

  /**
   * Renders a list buffer into Markdown list syntax block
   */
  function formatListMarkdown(listItems) {
    return listItems
      .map(item => {
        const marker = item.isOrdered ? `${item.marker}` : '-';
        return `${marker} ${item.text}`;
      })
      .join('\n');
  }

  /**
   * Merges cells of two table rows for multiline cell text.
   * Handles hyphenated wrapping (e.g. 'uti-' and 'lizando' -> 'utilizando').
   */
  function mergeTableRows(row1, row2) {
    const merged = [];
    const maxLen = Math.max(row1.length, row2.length);
    
    for (let i = 0; i < maxLen; i++) {
      let cell1 = row1[i] || '';
      let cell2 = row2[i] || '';
      
      // Clean up cell2
      cell2 = cell2.trim();
      
      if (cell1.endsWith('-') && /^[a-z]/.test(cell2)) {
        // Hyphenated word wrap: join without hyphen and without space
        merged.push(cell1.slice(0, -1) + cell2);
      } else {
        // Normal paragraph wrapping: join with space if both cells have content
        merged.push(cell1 + (cell1 && cell2 ? ' ' : '') + cell2);
      }
    }
    return merged;
  }

  /**
   * Converts columns grid records array into Markdown table format
   */
  function formatTableMarkdown(tableRows) {
    if (tableRows.length === 0) return '';
    
    // Determine maximum columns in table
    const maxCols = Math.max(...tableRows.map(row => row.length));
    if (maxCols < 2) {
      // Not enough columns to form table, join as text
      return tableRows.map(row => row.join(' ')).join('\n');
    }

    // Normalize rows to match maxCols length
    const normalizedRows = tableRows.map(row => {
      const newRow = [...row];
      while (newRow.length < maxCols) {
        newRow.push('');
      }
      return newRow;
    });

    let markdownTable = '';
    
    // Header Row
    markdownTable += '| ' + normalizedRows[0].join(' | ') + ' |\n';
    
    // Separator line
    const separators = Array(maxCols).fill('---');
    markdownTable += '| ' + separators.join(' | ') + ' |\n';
    
    // Data Rows
    for (let i = 1; i < normalizedRows.length; i++) {
      markdownTable += '| ' + normalizedRows[i].join(' | ') + ' |\n';
    }

    return markdownTable.trim();
  }

  // --- Workspace Compiler & Renderer ---

  /**
   * Compiles the text in editor and puts the HTML in preview panel
   */
  function compileMarkdownPreview() {
    if (!markdownEditor) return;
    const rawMarkdown = markdownEditor.value;

    updateStats(markdownEditor, charCountElement);

    try {
      let dirtyHTML = '';
      if (typeof window.marked !== 'undefined') {
        const parser = (typeof window.marked.parse === 'function') ? window.marked.parse : window.marked;
        dirtyHTML = parser(rawMarkdown);
      } else {
        throw new Error('El compilador de Marked.js no se cargó correctamente.');
      }

      // DOMPurify client-side sanitizing
      const cleanHTML = (typeof window.DOMPurify !== 'undefined' && typeof window.DOMPurify.sanitize === 'function')
        ? window.DOMPurify.sanitize(dirtyHTML)
        : dirtyHTML;

      if (markdownPreview) {
        markdownPreview.innerHTML = cleanHTML;
      }
    } catch (e) {
      console.error('Error rendering HTML:', e);
      if (markdownPreview) {
        markdownPreview.innerHTML = `<p style="color:var(--accent-error); padding:20px; font-weight:700;">Error: ${e.message}</p>`;
      }
    }
  }

  function updateProgressBar(percent) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
  }

  // --- Workspace State Controllers ---

  /**
   * Switches the UI view from upload to active split-screen editor
   */
  function showWorkspaceView() {
    uploadStateView.style.display = 'none';
    
    // Set class to body
    appWorkspace.classList.add('has-file');
    document.body.classList.add('document-active');

    // Show workspace elements
    sidebarMenu.style.display = 'flex';
    workspacePanelsView.style.display = 'flex';
    
    // Show top actions header buttons
    document.querySelectorAll('.hide-no-file').forEach(el => {
      el.style.display = '';
    });
    
    // Hide footer
    document.querySelectorAll('.hide-has-file').forEach(el => {
      el.style.display = 'none';
    });

    // Populate sidebar info card
    infoFileName.textContent = loadedFileName;
    infoFileSize.textContent = loadedFileSizeStr;
    infoFilePages.textContent = loadedFilePagesCount.toString();

    // Trigger UI panels interactions bindings
    setTimeout(() => {
      initPanelResizer(panelResizer, editorPanel, previewPanel);
      bindSyncScroll(markdownEditor, previewPanelContent);
    }, 100);
  }

  /**
   * Resets active workspace and displays upload dropzone
   */
  function resetToUploadView() {
    parsedPagesData = null;
    markdownEditor.value = '';
    markdownPreview.innerHTML = '';
    
    // Restore layout
    appWorkspace.classList.remove('has-file');
    document.body.classList.remove('document-active');
    
    sidebarMenu.style.display = 'none';
    workspacePanelsView.style.display = 'none';
    
    // Hide header buttons
    document.querySelectorAll('.hide-no-file').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show footer
    document.querySelectorAll('.hide-has-file').forEach(el => {
      el.style.display = '';
    });

    // Reset progress UI
    processingView.style.display = 'none';
    updateProgressBar(0);
    clearLogs();
    
    // Show dragover elements inside upload zone wrapper
    uploadStateView.style.display = 'flex';
    dropZone.style.display = 'flex';
    fileInput.value = '';
  }

  // --- Document File Selection Handlers ---

  /**
   * Processes the chosen PDF file local array buffer
   */
  async function handleFileSelect(file) {
    if (!file || file.type !== 'application/pdf') {
      showToast('Archivo Inválido', 'Por favor, selecciona únicamente archivos con formato PDF.', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('Archivo demasiado grande', 'El tamaño máximo permitido es de 50MB.', 'error');
      return;
    }

    loadedFileName = file.name;
    // Format file size
    if (file.size < 1024 * 1024) {
      loadedFileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
    } else {
      loadedFileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Hide dragover details, reveal processing spinner & logs terminal
    dropZone.style.display = 'none';
    processingView.style.display = 'flex';
    clearLogs();
    addLog(`Iniciando extracción local de: ${file.name}`, 'info');
    addLog(`Tamaño del archivo: ${loadedFileSizeStr}`, 'info');

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Call layout structure extraction
        parsedPagesData = await parsePdfStructure(arrayBuffer);
        
        addLog('Generando documento Markdown inicial...', 'info');
        
        // Render Markdown and update text inputs
        const resultMarkdown = renderMarkdownFromParsedData();
        markdownEditor.value = resultMarkdown;
        
        // Render preview preview
        compileMarkdownPreview();
        
        showToast('Extracción completada', 'El archivo PDF se ha procesado con éxito.', 'success');
        
        // Show workspace
        showWorkspaceView();
      } catch (err) {
        console.error('Error extracting PDF:', err);
        addLog(`Error al procesar PDF: ${err.message}`, 'error');
        showToast('Error de Extracción', 'No se pudo leer el archivo PDF local.', 'error');
        
        // Let them read the error, provide retry button inside logs or just reset
        setTimeout(() => {
          resetToUploadView();
        }, 5000);
      }
    };

    reader.onerror = () => {
      addLog('Error al leer el archivo del disco local.', 'error');
      showToast('Error de Archivo', 'No se pudo leer el archivo seleccionado.', 'error');
      resetToUploadView();
    };

    reader.readAsArrayBuffer(file);
  }

  // --- Event Listeners and Hooks ---

  // Drag & Drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('dragend', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  });

  // Clicking dropzone triggers hidden input click
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    handleFileSelect(file);
  });

  // Sidebar settings live update trigger
  const settingsInputs = [
    optDetectHeadings,
    optSmartParagraphs,
    optDetectLists,
    optDetectTables,
    optPageSeparators,
    optCleanLines
  ];

  settingsInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (parsedPagesData) {
        const updatedMarkdown = renderMarkdownFromParsedData();
        markdownEditor.value = updatedMarkdown;
        compileMarkdownPreview();
        showToast('Ajustes aplicados', 'El Markdown ha sido regenerado.', 'success');
      }
    });
  });

  // Editor direct editing inputs compile preview trigger
  markdownEditor.addEventListener('input', () => {
    compileMarkdownPreview();
  });

  // Header options buttons binding
  btnCopyMd.addEventListener('click', () => {
    if (!markdownEditor || markdownEditor.value.trim() === '') {
      showToast('Editor vacío', 'No hay contenido para copiar.', 'error');
      return;
    }

    navigator.clipboard.writeText(markdownEditor.value)
      .then(() => {
        showToast('Copiado', 'Markdown copiado al portapapeles con éxito.', 'success');
      })
      .catch(err => {
        console.error('Error copying:', err);
        showToast('Error', 'No se pudo copiar el texto.', 'error');
      });
  });

  btnDownloadMd.addEventListener('click', () => {
    if (!markdownEditor || markdownEditor.value.trim() === '') {
      showToast('Editor vacío', 'Escribe o extrae contenido antes de descargar.', 'error');
      return;
    }

    // Determine download filename based on original file name
    let originalNameBase = 'documento_extraido';
    if (loadedFileName) {
      originalNameBase = loadedFileName.replace(/\.[^/.]+$/, ""); // Strip file extension
    }
    const filename = `${originalNameBase}.md`;
    
    // Create Blob URL
    const blob = new Blob([markdownEditor.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    showToast('Archivo descargado', `El documento se ha descargado como ${filename}`, 'success');
  });

  // Reset tool state
  btnResetFile.addEventListener('click', () => {
    showConfirmModal(
      'Cerrar Documento',
      '¿Deseas cerrar el documento actual y cargar otro archivo? Los cambios manuales no guardados se perderán.',
      () => {
        resetToUploadView();
        showToast('Documento cerrado', 'Se ha limpiado el espacio de trabajo.', 'info');
      }
    );
  });

  // Clear editor content trigger
  btnClearEditor.addEventListener('click', () => {
    if (markdownEditor.value.trim() === '') {
      markdownEditor.focus();
      return;
    }

    showConfirmModal(
      'Vaciar Editor',
      '¿Estás seguro de que deseas borrar todo el texto actual? Esta acción no se puede deshacer.',
      () => {
        markdownEditor.value = '';
        compileMarkdownPreview();
        markdownEditor.focus();
        showToast('Limpio', 'Se ha vaciado el editor de texto.', 'info');
      }
    );
  });

  // Theme toggler
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      const activeTheme = toggleTheme();
      showToast('Tema cambiado', `Se ha activado el tema ${activeTheme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
    });
  }

  // Sidebar mobile menu behavior
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  function closeSidebarMobile() {
    if (sidebarMenu) sidebarMenu.classList.remove('active');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebarMobile);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebarMobile);

  // Mobile Tabs switching
  if (tabBtnEdit && tabBtnPreview && editorPanel && previewPanel) {
    tabBtnEdit.addEventListener('click', () => {
      tabBtnEdit.classList.add('active');
      tabBtnPreview.classList.remove('active');
      editorPanel.classList.add('active');
      previewPanel.classList.remove('active');
    });

    tabBtnPreview.addEventListener('click', () => {
      tabBtnPreview.classList.add('active');
      tabBtnEdit.classList.remove('active');
      previewPanel.classList.add('active');
      editorPanel.classList.remove('active');
      compileMarkdownPreview(); // Recompile
    });
  }

  // Reset initially
  resetToUploadView();
});
