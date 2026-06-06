/* ==========================================================================
   MARKDOWN TABLE EDITOR CONTROLLER (table-editor.js)
   ========================================================================== */
import { initTheme, toggleTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements binding
  const tableContainer = document.getElementById('table-grid-element');
  const codeOutput = document.getElementById('markdown-code-output');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnDownloadCode = document.getElementById('btn-download-code');
  
  // Grid actions
  const btnAddRow = document.getElementById('btn-add-row');
  const btnAddCol = document.getElementById('btn-add-col');
  const btnClearTable = document.getElementById('btn-clear-table');
  
  // Import section
  const textareaImport = document.getElementById('import-textarea');
  const btnImportData = document.getElementById('btn-import-data');
  const btnTriggerFile = document.getElementById('btn-trigger-file');
  const fileInput = document.getElementById('import-file-input');

  // Unified Toasts container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  /**
   * Helper function to show elegant Toast notifications
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
    
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 350);
    }, 3500);
  }

  // State model
  let tableState = {
    headers: ['Producto', 'Precio (USD)', 'Disponibilidad'],
    alignments: ['left', 'right', 'center'], // left, right, center
    rows: [
      ['Laptop Gamer Ryzen 7', '1,299.00', 'En Stock'],
      ['Teclado Mecánico RGB', '89.50', 'Pocas Unidades'],
      ['Mouse Óptico Inalámbrico', '45.00', 'Sin Stock']
    ]
  };

  // Initialize Theme System
  initTheme();

  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      const activeTheme = toggleTheme();
      showToast('Tema cambiado', `Se ha activado el tema ${activeTheme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
    });
  }

  /**
   * Pretty prints the Markdown table syntax based on state model
   */
  function compileTableToMarkdown() {
    if (!codeOutput) return;

    const colCount = tableState.headers.length;
    if (colCount === 0) {
      codeOutput.textContent = 'Crea o importa una tabla para generar el código Markdown.';
      return;
    }

    // Calculate maximum widths for each column to generate pretty-printed spacing
    const colWidths = new Array(colCount).fill(0);

    // Check header lengths
    for (let c = 0; c < colCount; c++) {
      colWidths[c] = Math.max(colWidths[c], tableState.headers[c].length);
    }

    // Check row data lengths
    for (let r = 0; r < tableState.rows.length; r++) {
      for (let c = 0; c < colCount; c++) {
        const val = tableState.rows[r][c] || '';
        colWidths[c] = Math.max(colWidths[c], val.length);
      }
    }

    // Set minimum column width for pretty printing
    for (let c = 0; c < colCount; c++) {
      colWidths[c] = Math.max(colWidths[c], 3); // minimum length for separator '---'
    }

    let md = '';

    // 1. Headers Row
    md += '|';
    for (let c = 0; c < colCount; c++) {
      const headerText = tableState.headers[c];
      const paddingLength = colWidths[c] - headerText.length;
      
      // Pad based on alignment
      if (tableState.alignments[c] === 'right') {
        md += ' ' + ' '.repeat(paddingLength) + headerText + ' |';
      } else if (tableState.alignments[c] === 'center') {
        const leftPad = Math.floor(paddingLength / 2);
        const rightPad = paddingLength - leftPad;
        md += ' ' + ' '.repeat(leftPad) + headerText + ' '.repeat(rightPad) + ' |';
      } else { // left
        md += ' ' + headerText + ' '.repeat(paddingLength) + ' |';
      }
    }
    md += '\n';

    // 2. Alignment / Separators Row
    md += '|';
    for (let c = 0; c < colCount; c++) {
      const align = tableState.alignments[c];
      const width = colWidths[c];
      
      if (align === 'center') {
        md += ' :' + '-'.repeat(width - 2) + ': |';
      } else if (align === 'right') {
        md += ' ' + '-'.repeat(width - 1) + ': |';
      } else { // left
        md += ' :' + '-'.repeat(width - 1) + ' |';
      }
    }
    md += '\n';

    // 3. Data Rows
    for (let r = 0; r < tableState.rows.length; r++) {
      md += '|';
      for (let c = 0; c < colCount; c++) {
        const val = tableState.rows[r][c] || '';
        const paddingLength = colWidths[c] - val.length;

        // Pad based on alignment
        if (tableState.alignments[c] === 'right') {
          md += ' ' + ' '.repeat(paddingLength) + val + ' |';
        } else if (tableState.alignments[c] === 'center') {
          const leftPad = Math.floor(paddingLength / 2);
          const rightPad = paddingLength - leftPad;
          md += ' ' + ' '.repeat(leftPad) + val + ' '.repeat(rightPad) + ' |';
        } else { // left
          md += ' ' + val + ' '.repeat(paddingLength) + ' |';
        }
      }
      md += '\n';
    }

    codeOutput.textContent = md.trim();
  }

  /**
   * Renders the interactive grid table inside DOM (Desktop)
   * and triggers the card rendering for mobile view.
   */
  function renderTableGrid() {
    if (!tableContainer) return;
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'interactive-table';

    const colCount = tableState.headers.length;

    // A. Build header
    const thead = document.createElement('thead');
    
    // Row 1: Alignment toolbars & delete col buttons side-by-side
    const rowControls = document.createElement('tr');
    
    // Top-left row identifier column placeholder
    const thCorner = document.createElement('th');
    thCorner.className = 'row-action-cell';
    thCorner.innerHTML = '<span>#</span>';
    rowControls.appendChild(thCorner);

    for (let c = 0; c < colCount; c++) {
      const th = document.createElement('th');
      th.className = 'col-header-wrapper';
      
      // Alignment & delete group inside one single toolbar
      const alignToolbar = document.createElement('div');
      alignToolbar.className = 'col-align-toolbar';
      
      const alignVal = tableState.alignments[c] || 'left';
      
      ['left', 'center', 'right'].forEach(align => {
        const btn = document.createElement('button');
        btn.className = `btn-align ${alignVal === align ? 'active' : ''}`;
        btn.setAttribute('data-align', align);
        btn.setAttribute('data-col', c);
        
        let icon = '⬅️';
        if (align === 'center') icon = '↔️';
        else if (align === 'right') icon = '➡️';
        
        btn.textContent = icon;
        btn.title = `Alinear a la ${align === 'left' ? 'izquierda' : align === 'center' ? 'centro' : 'derecha'}`;
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          tableState.alignments[c] = align;
          
          // Fast DOM update for alignment class in that column
          document.querySelectorAll(`.col-index-${c}`).forEach(cell => {
            cell.className = `cell-input col-index-${c} align-${align}`;
          });
          
          // Re-highlight active alignment button in header
          alignToolbar.querySelectorAll('.btn-align').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          compileTableToMarkdown();
        });

        alignToolbar.appendChild(btn);
      });

      // Add delete column button directly inside the toolbar at the end
      const btnDeleteCol = document.createElement('button');
      btnDeleteCol.className = 'btn-align delete';
      btnDeleteCol.innerHTML = '✕';
      btnDeleteCol.title = 'Eliminar columna';
      btnDeleteCol.addEventListener('click', (e) => {
        e.preventDefault();
        deleteColumn(c);
      });
      alignToolbar.appendChild(btnDeleteCol);

      th.appendChild(alignToolbar);
      rowControls.appendChild(th);
    }
    thead.appendChild(rowControls);

    // Row 2: Header Inputs
    const rowInputs = document.createElement('tr');
    
    const thEmpty = document.createElement('th');
    thEmpty.className = 'row-action-cell';
    rowInputs.appendChild(thEmpty);

    for (let c = 0; c < colCount; c++) {
      const th = document.createElement('th');
      th.className = `align-${tableState.alignments[c]}`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = `cell-input header-input col-index-${c} align-${tableState.alignments[c]}`;
      input.value = tableState.headers[c];
      input.placeholder = `Cabecera ${c + 1}`;
      input.setAttribute('data-col', c);
      
      input.addEventListener('input', () => {
        tableState.headers[c] = input.value;
        compileTableToMarkdown();
      });

      th.appendChild(input);
      rowInputs.appendChild(th);
    }
    thead.appendChild(rowInputs);
    table.appendChild(thead);

    // B. Build body
    const tbody = document.createElement('tbody');
    for (let r = 0; r < tableState.rows.length; r++) {
      const tr = document.createElement('tr');
      
      // Row controls cell (leftmost) with horizontal compact layout
      const tdRowControl = document.createElement('td');
      tdRowControl.className = 'row-action-cell';
      
      const rowNumWrapper = document.createElement('div');
      rowNumWrapper.className = 'row-control-wrapper';
      
      const rowNum = document.createElement('span');
      rowNum.className = 'row-number';
      rowNum.textContent = r + 1;
      rowNumWrapper.appendChild(rowNum);

      const btnDeleteRow = document.createElement('button');
      btnDeleteRow.className = 'btn-row-delete';
      btnDeleteRow.innerHTML = '✕';
      btnDeleteRow.title = 'Eliminar fila';
      btnDeleteRow.addEventListener('click', (e) => {
        e.preventDefault();
        deleteRow(r);
      });
      rowNumWrapper.appendChild(btnDeleteRow);

      tdRowControl.appendChild(rowNumWrapper);
      tr.appendChild(tdRowControl);

      // Data cells
      for (let c = 0; c < colCount; c++) {
        const td = document.createElement('td');
        td.className = `align-${tableState.alignments[c]}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = `cell-input col-index-${c} align-${tableState.alignments[c]}`;
        input.value = tableState.rows[r][c] || '';
        input.placeholder = '-';
        input.setAttribute('data-row', r);
        input.setAttribute('data-col', c);

        input.addEventListener('input', () => {
          tableState.rows[r][c] = input.value;
          compileTableToMarkdown();
        });

        td.appendChild(input);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Sync mobile card views
    renderMobileCards();

    compileTableToMarkdown();
  }

  /**
   * Renders a simplified, card-based interface for mobile screens (<= 768px)
   * where editing is performed via a dedicated popup modal form.
   */
  function renderMobileCards() {
    const mobileContainer = document.getElementById('mobile-cards-element');
    if (!mobileContainer) return;
    mobileContainer.innerHTML = '';

    const colCount = tableState.headers.length;

    // 1. Column Config Card at the top
    const configCard = document.createElement('div');
    configCard.className = 'mobile-row-card';
    configCard.style.padding = '14px 16px';
    configCard.style.marginBottom = '16px';
    configCard.style.border = '1px dashed var(--accent)';
    configCard.style.borderRadius = 'var(--radius-sm)';
    configCard.style.backgroundColor = 'rgba(139, 92, 246, 0.04)';
    
    configCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <span style="font-weight: 700; font-size: 0.82rem; color: var(--accent-hover); display: flex; align-items: center; gap: 6px;">⚙️ Configurar Columnas (${colCount})</span>
        <button class="btn btn-secondary" id="btn-mobile-config-cols" style="padding: 6px 12px; font-size: 0.74rem; border-color: rgba(139, 92, 246, 0.3); font-weight: 600;">Editar Columnas</button>
      </div>
    `;
    mobileContainer.appendChild(configCard);

    // Bind edit columns modal
    const btnMobileConfigCols = configCard.querySelector('#btn-mobile-config-cols');
    if (btnMobileConfigCols) {
      btnMobileConfigCols.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileColumnsModal();
      });
    }

    // 2. Row Cards
    if (tableState.rows.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.fontSize = '0.8rem';
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '20px 0';
      emptyMsg.textContent = 'No hay filas en la tabla.';
      mobileContainer.appendChild(emptyMsg);
      return;
    }

    tableState.rows.forEach((row, rowIndex) => {
      const card = document.createElement('div');
      card.className = 'mobile-row-card';
      card.style.backgroundColor = 'var(--bg-card)';
      card.style.border = '1px solid var(--border-color)';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.padding = '16px';
      card.style.marginBottom = '12px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '12px';

      // Card Header
      const cardHeader = document.createElement('div');
      cardHeader.style.display = 'flex';
      cardHeader.style.justifyContent = 'space-between';
      cardHeader.style.alignItems = 'center';
      cardHeader.style.borderBottom = '1px solid var(--border-color)';
      cardHeader.style.paddingBottom = '8px';

      const cardTitle = document.createElement('span');
      cardTitle.style.fontWeight = '700';
      cardTitle.style.fontSize = '0.82rem';
      cardTitle.style.color = 'var(--text-primary)';
      cardTitle.textContent = `Fila #${rowIndex + 1}`;
      cardHeader.appendChild(cardTitle);

      const btnDeleteRow = document.createElement('button');
      btnDeleteRow.className = 'btn-delete-row-pill';
      btnDeleteRow.innerHTML = '✕ Fila';
      btnDeleteRow.addEventListener('click', (e) => {
        e.preventDefault();
        deleteRow(rowIndex);
      });
      cardHeader.appendChild(btnDeleteRow);
      card.appendChild(cardHeader);

      // Card Fields summary
      const fieldsList = document.createElement('div');
      fieldsList.style.display = 'flex';
      fieldsList.style.flexDirection = 'column';
      fieldsList.style.gap = '6px';

      // Show up to 3 columns as summary
      const maxSummaryCols = Math.min(colCount, 3);
      for (let c = 0; c < maxSummaryCols; c++) {
        const fieldRow = document.createElement('div');
        fieldRow.style.display = 'flex';
        fieldRow.style.justifyContent = 'space-between';
        fieldRow.style.fontSize = '0.78rem';

        const label = document.createElement('span');
        label.style.color = 'var(--text-muted)';
        label.textContent = tableState.headers[c] || `Columna ${c + 1}`;

        const value = document.createElement('span');
        value.style.color = 'var(--text-secondary)';
        value.style.fontWeight = '600';
        value.textContent = row[c] || '-';

        fieldRow.appendChild(label);
        fieldRow.appendChild(value);
        fieldsList.appendChild(fieldRow);
      }

      if (colCount > 3) {
        const moreFields = document.createElement('div');
        moreFields.style.fontSize = '0.7rem';
        moreFields.style.color = 'var(--text-muted)';
        moreFields.style.textAlign = 'right';
        moreFields.textContent = `+ ${colCount - 3} columnas más`;
        fieldsList.appendChild(moreFields);
      }

      card.appendChild(fieldsList);

      // Card Edit Button
      const btnEditRow = document.createElement('button');
      btnEditRow.className = 'btn btn-secondary';
      btnEditRow.style.width = '100%';
      btnEditRow.style.padding = '8px';
      btnEditRow.style.fontSize = '0.78rem';
      btnEditRow.style.marginTop = '4px';
      btnEditRow.textContent = '✏️ Editar Fila';
      btnEditRow.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileRowEditModal(rowIndex);
      });

      card.appendChild(btnEditRow);
      mobileContainer.appendChild(card);
    });
  }

  /**
   * Opens a popup modal with a form containing inputs for each column
   * of the selected row, allowing easy editing on mobile viewports.
   */
  function openMobileRowEditModal(rowIndex) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const row = tableState.rows[rowIndex];
    let inputsHtml = '';
    tableState.headers.forEach((header, colIndex) => {
      inputsHtml += `
        <div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${header || 'Columna ' + (colIndex + 1)}</label>
          <input type="text" class="modal-cell-input" data-col="${colIndex}" value="${(row[colIndex] || '').replace(/"/g, '&quot;')}" style="width: 100%; background-color: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.88rem; outline: none; transition: border-color var(--transition-fast);">
        </div>
      `;
    });

    modalOverlay.innerHTML = `
      <div class="modal-box" style="max-width: 440px; width: 90%; max-height: 80vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <h3>Editar Fila #${rowIndex + 1}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 0; overflow-y: auto; flex: 1; margin-bottom: 12px;">
          ${inputsHtml}
        </div>
        <div class="modal-footer" style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 14px; flex-shrink: 0;">
          <button class="btn btn-secondary btn-cancel">Cancelar</button>
          <button class="btn btn-primary btn-save">Guardar</button>
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
    
    // Focus highlight override
    const inputs = modalOverlay.querySelectorAll('.modal-cell-input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = 'var(--accent)';
      });
      input.addEventListener('blur', () => {
        input.style.borderColor = 'var(--border-color)';
      });
    });

    modalOverlay.querySelector('.btn-save').addEventListener('click', () => {
      inputs.forEach(input => {
        const c = parseInt(input.getAttribute('data-col'));
        tableState.rows[rowIndex][c] = input.value;
      });
      
      renderTableGrid(); // Syncs desktop table, mobile cards, and Markdown output
      closeModal();
      showToast('Fila guardada', `Se actualizaron los datos de la Fila #${rowIndex + 1}.`, 'success');
    });
  }

  /**
   * Opens a popup modal to configure column names and alignments
   * from a single clean screen on mobile viewports.
   */
  function openMobileColumnsModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    let colsHtml = '';
    tableState.headers.forEach((header, colIndex) => {
      const align = tableState.alignments[colIndex] || 'left';
      colsHtml += `
        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <div style="margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Nombre Columna #${colIndex + 1}</label>
            <input type="text" class="modal-col-header" data-col="${colIndex}" value="${header.replace(/"/g, '&quot;')}" style="width: 100%; background-color: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 10px; font-size: 0.84rem; outline: none; transition: border-color var(--transition-fast);">
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px;">
            <span style="font-size: 0.74rem; color: var(--text-secondary);">Alineación:</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-secondary btn-modal-align ${align === 'left' ? 'active' : ''}" data-col="${colIndex}" data-align="left" style="padding: 4px 8px; font-size: 0.7rem; height: 28px;">⬅️ Izq</button>
              <button class="btn btn-secondary btn-modal-align ${align === 'center' ? 'active' : ''}" data-col="${colIndex}" data-align="center" style="padding: 4px 8px; font-size: 0.7rem; height: 28px;">↔️ Cen</button>
              <button class="btn btn-secondary btn-modal-align ${align === 'right' ? 'active' : ''}" data-col="${colIndex}" data-align="right" style="padding: 4px 8px; font-size: 0.7rem; height: 28px;">➡️ Der</button>
            </div>
          </div>
          <div style="margin-top: 12px; text-align: right;">
            <button class="btn btn-danger btn-modal-del-col" data-col="${colIndex}" style="padding: 4px 8px; font-size: 0.7rem; height: 28px; line-height: 1;">✕ Eliminar Columna</button>
          </div>
        </div>
      `;
    });

    modalOverlay.innerHTML = `
      <div class="modal-box" style="max-width: 440px; width: 90%; max-height: 80vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <h3>Configurar Columnas</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 0; overflow-y: auto; flex: 1; margin-bottom: 12px;">
          ${colsHtml}
        </div>
        <div class="modal-footer" style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 14px; flex-shrink: 0;">
          <button class="btn btn-secondary btn-cancel">Cancelar</button>
          <button class="btn btn-primary btn-save">Guardar</button>
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

    // Bind align buttons inside modal
    const alignButtons = modalOverlay.querySelectorAll('.btn-modal-align');
    alignButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const col = parseInt(btn.getAttribute('data-col'));
        const align = btn.getAttribute('data-align');
        
        // Remove active class from buttons of this column
        modalOverlay.querySelectorAll(`.btn-modal-align[data-col="${col}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Bind delete column inside modal
    const delButtons = modalOverlay.querySelectorAll('.btn-modal-del-col');
    delButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const col = parseInt(btn.getAttribute('data-col'));
        if (tableState.headers.length <= 1) {
          showToast('Operación no válida', 'La tabla debe tener al menos una columna.', 'error');
          return;
        }
        closeModal();
        deleteColumn(col);
      });
    });

    modalOverlay.querySelector('.btn-save').addEventListener('click', () => {
      // Save headers
      const headerInputs = modalOverlay.querySelectorAll('.modal-col-header');
      headerInputs.forEach(input => {
        const col = parseInt(input.getAttribute('data-col'));
        tableState.headers[col] = input.value;
      });

      // Save alignments
      const colCount = tableState.headers.length;
      for (let c = 0; c < colCount; c++) {
        const activeAlignBtn = modalOverlay.querySelector(`.btn-modal-align[data-col="${c}"].active`);
        if (activeAlignBtn) {
          tableState.alignments[c] = activeAlignBtn.getAttribute('data-align');
        }
      }

      renderTableGrid();
      closeModal();
      showToast('Columnas guardadas', 'Se actualizaron las configuraciones de columnas.', 'success');
    });
  }

  /**
   * Action: Adds a row to tableState
   */
  function addRow() {
    const colCount = tableState.headers.length;
    const newRow = new Array(colCount).fill('');
    tableState.rows.push(newRow);
    renderTableGrid();
    showToast('Fila añadida', `Fila #${tableState.rows.length} creada.`, 'success');
  }

  /**
   * Action: Adds a column to tableState
   */
  function addColumn() {
    const newColIndex = tableState.headers.length + 1;
    tableState.headers.push(`Columna ${newColIndex}`);
    tableState.alignments.push('left');
    
    // Pad all rows with an empty cell for the new column
    tableState.rows.forEach(row => row.push(''));
    
    renderTableGrid();
    showToast('Columna añadida', `Columna #${tableState.headers.length} creada.`, 'success');
  }

  /**
   * Action: Deletes a column by index
   */
  function deleteColumn(colIndex) {
    if (tableState.headers.length <= 1) {
      showToast('Operación no válida', 'La tabla debe tener al menos una columna.', 'error');
      return;
    }
    
    tableState.headers.splice(colIndex, 1);
    tableState.alignments.splice(colIndex, 1);
    tableState.rows.forEach(row => {
      row.splice(colIndex, 1);
    });

    renderTableGrid();
    showToast('Columna eliminada', 'Se removió la columna seleccionada.', 'info');
  }

  /**
   * Action: Deletes a row by index
   */
  function deleteRow(rowIndex) {
    if (tableState.rows.length <= 1) {
      showToast('Operación no válida', 'La tabla debe tener al menos una fila de datos.', 'error');
      return;
    }

    tableState.rows.splice(rowIndex, 1);
    renderTableGrid();
    showToast('Fila eliminada', `Se removió la fila #${rowIndex + 1}.`, 'info');
  }

  /**
   * Action: Clears table contents
   */
  function clearTable() {
    tableState = {
      headers: ['A', 'B', 'C'],
      alignments: ['left', 'left', 'left'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]
    };
    renderTableGrid();
    showToast('Limpio', 'Se ha restablecido la cuadrícula.', 'info');
  }

  /**
   * Action: Copy generated Markdown code to clipboard
   */
  function copyToClipboard() {
    const code = codeOutput.textContent;
    if (!code || code.startsWith('Crea o importa')) return;

    navigator.clipboard.writeText(code).then(() => {
      showToast('Copiado', 'Código Markdown copiado al portapapeles.', 'success');
      
      // Temporary visual change in button
      const oldHtml = btnCopyCode.innerHTML;
      btnCopyCode.innerHTML = '<span>✅ Copiado!</span>';
      btnCopyCode.classList.add('btn-primary');
      btnCopyCode.classList.remove('btn-secondary');
      
      setTimeout(() => {
        btnCopyCode.innerHTML = oldHtml;
        btnCopyCode.classList.remove('btn-primary');
        btnCopyCode.classList.add('btn-secondary');
      }, 2000);
    }).catch(err => {
      console.error('Copy failure:', err);
      showToast('Error', 'No se pudo copiar el código.', 'error');
    });
  }

  /**
   * Action: Downloads markdown code as file
   */
  function downloadMarkdownFile() {
    const code = codeOutput.textContent;
    if (!code || code.startsWith('Crea o importa')) return;

    const blob = new Blob([code], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabla_markdown.md';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showToast('Descarga iniciada', 'Se ha guardado el archivo tabla_markdown.md', 'success');
  }

  /**
   * Parser: Parses CSV / TSV or Markdown text input and updates state
   */
  function parseAndImportText() {
    const rawText = textareaImport.value.trim();
    if (!rawText) {
      showToast('Entrada vacía', 'Por favor pega datos de Excel, CSV o una tabla Markdown.', 'error');
      return;
    }

    try {
      // Check if it looks like a Markdown table (contains pipes '|')
      if (rawText.includes('|')) {
        parseMarkdownTable(rawText);
      } else {
        parseDelimitedTable(rawText);
      }
      
      textareaImport.value = ''; // Clean importer on success
    } catch (e) {
      console.error(e);
      showToast('Error de importación', `No se pudo parsear el texto. Verifica el formato: ${e.message}`, 'error');
    }
  }

  /**
   * Helper Parser: Markdown table formats
   */
  function parseMarkdownTable(text) {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('|') && line.endsWith('|'));

    if (lines.length < 2) {
      throw new Error('La tabla Markdown debe tener cabecera y cuerpo separados por pipes |');
    }

    // Process headers row
    const rawHeaders = lines[0].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const colCount = rawHeaders.length;

    if (colCount === 0) {
      throw new Error('No se encontraron columnas de cabecera.');
    }

    let alignments = new Array(colCount).fill('left');
    let dataStartRow = 1;

    // Check if second line is alignment separator row (e.g. | :--- | :---: | ---: |)
    const possibleSeparator = lines[1];
    const isSeparator = possibleSeparator.replace(/[\s|:\-]/g, '') === '';
    
    if (isSeparator) {
      dataStartRow = 2;
      const rawSeparators = possibleSeparator.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      for (let c = 0; c < colCount; c++) {
        const sep = rawSeparators[c] || '';
        const startsWithColon = sep.startsWith(':');
        const endsWithColon = sep.endsWith(':');
        
        if (startsWithColon && endsWithColon) {
          alignments[c] = 'center';
        } else if (endsWithColon) {
          alignments[c] = 'right';
        } else {
          alignments[c] = 'left';
        }
      }
    }

    // Process rows
    const rows = [];
    for (let i = dataStartRow; i < lines.length; i++) {
      const rawCells = lines[i].split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Pad or truncate row cells to match header colCount
      const paddedRow = [];
      for (let c = 0; c < colCount; c++) {
        paddedRow.push(rawCells[c] || '');
      }
      rows.push(paddedRow);
    }

    // If no data rows, add one empty row
    if (rows.length === 0) {
      rows.push(new Array(colCount).fill(''));
    }

    // Apply to state and render
    tableState = {
      headers: rawHeaders,
      alignments: alignments,
      rows: rows
    };

    renderTableGrid();
    showToast('Importado con éxito', `Tabla Markdown de ${colCount} columnas cargada.`, 'success');
  }

  /**
   * Helper Parser: CSV / Tab-delimited (Excel/Sheets) formats
   */
  function parseDelimitedTable(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    if (lines.length === 0) throw new Error('Entrada sin líneas de datos.');

    // Auto-detect delimiter: comma or tab
    // We count tabs on first line, if any, we use tab. Else comma.
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    
    let delimiter = ',';
    if (tabCount > 0 && tabCount >= commaCount) {
      delimiter = '\t';
    }

    // Process headers row
    // We split by delimiter. We also handle quotes optionally if comma.
    let rawHeaders = splitDelimitedLine(firstLine, delimiter);
    const colCount = rawHeaders.length;

    if (colCount === 0) {
      throw new Error('No se encontraron columnas en la cabecera.');
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const rawCells = splitDelimitedLine(lines[i], delimiter);
      const paddedRow = [];
      for (let c = 0; c < colCount; c++) {
        paddedRow.push(rawCells[c] || '');
      }
      rows.push(paddedRow);
    }

    // Add empty row if only headers were provided
    if (rows.length === 0) {
      rows.push(new Array(colCount).fill(''));
    }

    tableState = {
      headers: rawHeaders,
      alignments: new Array(colCount).fill('left'),
      rows: rows
    };

    renderTableGrid();
    showToast(
      'Importado con éxito', 
      `Datos estructurados cargados (${delimiter === '\t' ? 'Pegado de Excel' : 'CSV'}).`, 
      'success'
    );
  }

  /**
   * Splits a line by delimiter while respecting double-quoted values (standard CSV behavior)
   */
  function splitDelimitedLine(line, delimiter) {
    if (delimiter === '\t') {
      return line.split('\t').map(cleanCellQuotes);
    }

    // Simple CSV parser state machine
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(cleanCellQuotes(current));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(cleanCellQuotes(current));
    return result;
  }

  function cleanCellQuotes(val) {
    let clean = val.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1).replace(/""/g, '"');
    }
    return clean;
  }

  // Bind Grid button click events
  if (btnAddRow) btnAddRow.addEventListener('click', (e) => { e.preventDefault(); addRow(); });
  if (btnAddCol) btnAddCol.addEventListener('click', (e) => { e.preventDefault(); addColumn(); });
  if (btnClearTable) btnClearTable.addEventListener('click', (e) => {
    e.preventDefault();
    if (tableState.rows.every(r => r.every(c => c === '')) && tableState.headers.every(h => h.startsWith('Columna') || h.length === 1)) {
      return;
    }
    
    // Custom premium modal triggers
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>Limpiar Cuadrícula</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas vaciar toda la tabla actual? Perderás todos los datos ingresados.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel">Cancelar</button>
          <button class="btn btn-danger btn-confirm">Vaciar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
    setTimeout(() => modalOverlay.classList.add('active'), 10);

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => document.body.removeChild(modalOverlay), 300);
    };

    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modalOverlay.querySelector('.btn-confirm').addEventListener('click', () => {
      clearTable();
      closeModal();
    });
  });

  // Bind Export actions
  if (btnCopyCode) btnCopyCode.addEventListener('click', (e) => { e.preventDefault(); copyToClipboard(); });
  if (btnDownloadCode) btnDownloadCode.addEventListener('click', (e) => { e.preventDefault(); downloadMarkdownFile(); });

  // Bind Import actions
  if (btnImportData) btnImportData.addEventListener('click', (e) => { e.preventDefault(); parseAndImportText(); });

  // Trigger hidden file picker
  if (btnTriggerFile && fileInput) {
    btnTriggerFile.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      readAndImportFile(file);
      fileInput.value = ''; // Reset
    });
  }

  // Drag and Drop listeners on textarea
  if (textareaImport) {
    textareaImport.addEventListener('dragover', (e) => {
      e.preventDefault();
      textareaImport.classList.add('drag-over');
    });

    textareaImport.addEventListener('dragleave', (e) => {
      e.preventDefault();
      textareaImport.classList.remove('drag-over');
    });

    textareaImport.addEventListener('drop', (e) => {
      e.preventDefault();
      textareaImport.classList.remove('drag-over');
      
      const file = e.dataTransfer.files[0];
      if (!file) return;
      
      readAndImportFile(file);
    });
  }

  /**
   * Helper to read a local text file and trigger import parser
   */
  function readAndImportFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      textareaImport.value = content;
      parseAndImportText();
    };
    reader.onerror = () => {
      showToast('Error', 'No se pudo leer el archivo cargado.', 'error');
    };
    reader.readAsText(file);
  }

  // Render Initial Grid State
  renderTableGrid();
});
