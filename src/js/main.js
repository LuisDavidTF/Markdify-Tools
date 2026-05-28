/* ==========================================================================
   APPLICATION AGGREGATOR & ORCHESTRATOR ENTRY POINT (main.js)
   ========================================================================== */
import './analytics.js';
import { initTheme, toggleTheme } from './theme.js';
import { templates } from './templates.js';
import { downloadLocalPdf, printPhysicalPdf } from './pdf.js';
import {
  updateStats,
  bindSyncScroll,
  initPanelResizer,
  setupKeyboardShortcuts,
} from './editor.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements binding
  const markdownEditor = document.getElementById('markdown-editor');
  const markdownPreview = document.getElementById('markdown-preview');
  const previewPanelContent = document.querySelector('#preview-panel .panel-content');
  const charCountElement = document.getElementById('char-count');
  
  // Header Actions
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const btnPrint = document.getElementById('btn-print');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  const autosaveStatusBadge = document.getElementById('autosave-status');
  const autosaveText = document.getElementById('status-text');

  // Sidebar controls
  const sidebarMenu = document.getElementById('sidebar-menu');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const pdfPageFormat = document.getElementById('pdf-page-format');
  const pdfContainerElement = document.getElementById('pdf-container-element');
  const templateItems = document.querySelectorAll('.template-item');

  // Workspace Split Panels
  const editorPanel = document.getElementById('editor-panel');
  const previewPanel = document.getElementById('preview-panel');
  const panelResizerDivider = document.getElementById('panel-resizer');

  // Interactive buttons inside panel
  const btnClearEditor = document.getElementById('btn-clear-editor');

  // Mobile Tabs
  const tabBtnEdit = document.getElementById('tab-btn-edit');
  const tabBtnPreview = document.getElementById('tab-btn-preview');

  // Local Storage Keys
  const STORAGE_KEY = 'markdify_markdown_editor_content';
  const FORMAT_KEY = 'markdify_page_format_preference';

  // Local State
  let autosaveTimeout = null;

  // Initialize UI design Theme system
  initTheme();

  // Setup UI custom notifications/toasts container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  /**
   * Helper function to show elegant Toast notifications
   * @param {string} title 
   * @param {string} desc 
   * @param {'success' | 'error' | 'info'} type 
   */
  function showToast(title, desc, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '🛡️';
    else if (type === 'error') icon = '🚨';
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate slide-in
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 350);
    }, 3500);
  }

  // Setup Custom UI Modals system
  /**
   * Helper to launch a custom confirm dialog modal instead of browser native alert
   * @param {string} title Modal Header Text
   * @param {string} desc Modal Body Message
   * @param {Function} onConfirm Action when clicked confirm
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

    // Fade-in animation
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

  // Safely initialize marked GFM configurations
  try {
    if (typeof window.marked !== 'undefined') {
      if (typeof window.marked.use === 'function') {
        window.marked.use({
          breaks: true,
          gfm: true
        });
      } else if (typeof window.marked.setOptions === 'function') {
        window.marked.setOptions({
          breaks: true,
          gfm: true
        });
      }
    }
  } catch (e) {
    console.warn('Advertencia al inicializar GFM en marked:', e);
  }

  /**
   * Compiles the raw markdown in editor and updates preview UI
   */
  function compileWorkspaceContent() {
    if (!markdownEditor) return;
    const rawMarkdown = markdownEditor.value;

    // Calculate word character count
    updateStats(markdownEditor, charCountElement);

    try {
      let dirtyHTML = '';
      if (typeof window.marked !== 'undefined') {
        const parser = (typeof window.marked.parse === 'function') ? window.marked.parse : window.marked;
        dirtyHTML = parser(rawMarkdown);
      } else {
        throw new Error('El compilador de Marked.js no se cargó correctamente.');
      }

      // DOMPurify client-side sanitizing to prevent XSS
      const cleanHTML = (typeof window.DOMPurify !== 'undefined' && typeof window.DOMPurify.sanitize === 'function')
        ? window.DOMPurify.sanitize(dirtyHTML)
        : dirtyHTML;

      if (markdownPreview) {
        markdownPreview.innerHTML = cleanHTML;
      }
    } catch (e) {
      console.error('Error renderizing:', e);
      if (markdownPreview) {
        markdownPreview.innerHTML = `<p style="color:var(--accent-error); padding:20px; font-weight:700;">Error: ${e.message}</p>`;
      }
    }
  }

  /**
   * Triggers autosave debounce logic and shows visual state changes in header
   */
  function triggerAutosaveDebounce() {
    if (!markdownEditor) return;
    
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    if (autosaveStatusBadge) {
      autosaveStatusBadge.classList.add('saving');
    }
    if (autosaveText) {
      autosaveText.textContent = 'Guardando...';
    }

    autosaveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, markdownEditor.value);
      if (autosaveStatusBadge) {
        autosaveStatusBadge.classList.remove('saving');
      }
      if (autosaveText) {
        autosaveText.textContent = 'Guardado Local';
      }
    }, 800); // 800ms Debounce
  }

  /**
   * Loads a template by key
   * @param {string} templateName 
   */
  function loadTemplateContent(templateName) {
    if (templates[templateName] && markdownEditor) {
      markdownEditor.value = templates[templateName];
      
      // Update template highlighting classes
      templateItems.forEach(item => {
        if (item.getAttribute('data-template') === templateName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      compileWorkspaceContent();
      triggerAutosaveDebounce();
      showToast('Plantilla cargada', `Se cargó la plantilla "${templateName}" con éxito.`, 'success');
      
      // Close mobile settings modal when template is loaded
      if (window.innerWidth <= 900) {
        closeSidebarMobile();
      }
    }
  }



  /**
   * Initializes workspace state on page load
   */
  function initWorkspaceState() {
    if (!markdownEditor) return;

    let savedContent = localStorage.getItem(STORAGE_KEY);
    // Backward compatibility for saved content
    if (savedContent === null) {
      savedContent = localStorage.getItem('devsuite_markdown_editor_content');
    }

    // Apply format preferences
    if (pdfPageFormat) {
      let savedFormat = localStorage.getItem(FORMAT_KEY);
      // Backward compatibility for page format
      if (savedFormat === null) {
        savedFormat = localStorage.getItem('devsuite_page_format_preference') || 'letter';
      }
      pdfPageFormat.value = savedFormat;
      if (pdfContainerElement) {
        pdfContainerElement.className = `preview-container ${savedFormat}`;
      }
    }

    if (savedContent !== null && savedContent.trim() !== templates.guide.trim()) {
      markdownEditor.value = savedContent;
      templateItems.forEach(item => item.classList.remove('active'));
    } else {
      // Start completely blank as requested by user
      markdownEditor.value = '';
      templateItems.forEach(item => item.classList.remove('active'));
    }

    compileWorkspaceContent();
  }

  // ==========================================================================
  // EVENT LISTENERS & MODULES BINDING
  // ==========================================================================

  // Editor keyboard actions
  if (markdownEditor) {
    markdownEditor.addEventListener('input', () => {
      compileWorkspaceContent();
      triggerAutosaveDebounce();
    });

    // Clear content trigger
    if (btnClearEditor) {
      btnClearEditor.addEventListener('click', () => {
        if (markdownEditor.value.trim() === '') {
          markdownEditor.focus();
          return;
        }

        showConfirmModal(
          'Vaciar Editor',
          '¿Estás seguro de que deseas borrar todo el borrador actual? Esta acción no se puede deshacer.',
          () => {
            markdownEditor.value = '';
            compileWorkspaceContent();
            triggerAutosaveDebounce();
            markdownEditor.focus();
            showToast('Limpio', 'Se ha vaciado el editor técnico.', 'info');
          }
        );
      });
    }
  }

  // Header options binding
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      const activeTheme = toggleTheme();
      showToast('Tema cambiado', `Se ha activado el tema ${activeTheme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
    });
  }

  // Close sidebar helper on mobile
  function closeSidebarMobile() {
    if (sidebarMenu) sidebarMenu.classList.remove('active');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      if (sidebarMenu) {
        if (window.innerWidth <= 900) {
          sidebarMenu.classList.toggle('active');
          sidebarMenu.classList.remove('collapsed');
          if (sidebarBackdrop) {
            sidebarBackdrop.classList.toggle('active');
          }
        } else {
          sidebarMenu.classList.toggle('collapsed');
          sidebarMenu.classList.remove('active');
        }
      }
    });
  }

  // Mobile sidebar close listeners
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebarMobile);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebarMobile);
  }

  if (pdfPageFormat) {
    pdfPageFormat.addEventListener('change', () => {
      const format = pdfPageFormat.value;
      localStorage.setItem(FORMAT_KEY, format);
      if (pdfContainerElement) {
        pdfContainerElement.className = `preview-container ${format}`;
      }
      showToast('Tamaño de página', `Formato configurado en tamaño ${format === 'a4' ? 'A4' : 'Carta (Letter)'}`, 'info');
    });
  }

  // Templates Selection listeners
  templateItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetName = item.getAttribute('data-template');
      if (!markdownEditor) return;

      const currentVal = markdownEditor.value.trim();
      const isClean = currentVal === '' || Object.values(templates).some(val => val.trim() === currentVal);

      if (isClean) {
        loadTemplateContent(targetName);
      } else {
        showConfirmModal(
          'Cargar Plantilla',
          'Cargar esta plantilla reemplazará todo el texto de tu borrador actual. ¿Deseas continuar?',
          () => {
            loadTemplateContent(targetName);
          }
        );
      }
    });
  });

  // Scroll Synching
  bindSyncScroll(markdownEditor, previewPanelContent);

  // Drag Resizer initialization
  initPanelResizer(panelResizerDivider, editorPanel, previewPanel);

  // PDF Download click binding
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      const format = pdfPageFormat ? pdfPageFormat.value : 'letter';
      downloadLocalPdf(pdfContainerElement, format, showToast);
    });
  }

  // Physical native print click binding
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      showToast(
        'Impresión Recomendada',
        'Para un acabado limpio y profesional en la ventana de impresión:<br>• <b>Desactiva</b> "Encabezados y pies de página" (oculta URLs/fechas).<br>• <b>Activa</b> "Gráficos de fondo" (para ver colores y bloques).<br>• Papel: <b>Carta</b> | Margen y Escala: <b>Predeterminado</b>.',
        'info'
      );
      setTimeout(() => {
        printPhysicalPdf();
      }, 800); // Give them slightly more time to read the premium instructions
    });
  }

  // Setup custom keyboard shortcuts
  setupKeyboardShortcuts(
    markdownEditor,
    () => {
      // Force manual save (Ctrl+S)
      if (markdownEditor) {
        localStorage.setItem(STORAGE_KEY, markdownEditor.value);
        showToast('Guardado Forzado', 'El documento se ha guardado localmente de forma manual.', 'success');
      }
    },
    () => {
      // Print (Ctrl+P)
      if (btnPrint) btnPrint.click();
    },
    () => {
      // Download PDF (Ctrl+Enter)
      if (btnDownloadPdf) btnDownloadPdf.click();
    }
  );

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
      compileWorkspaceContent(); // Re-compile before showing
    });
  }

  // ==========================================================================
  // GFM INTERACTIVE SYNTAX & ASISTENTE MODAL PANEL
  // ==========================================================================

  /**
   * Inserts markdown syntax templates into the editor at the current cursor position
   * or wraps any selected text if present.
   * @param {string} templateBefore 
   * @param {string} templateAfter 
   */
  function insertMarkdown(templateBefore, templateAfter = '') {
    if (!markdownEditor) return;
    markdownEditor.focus();
    
    const start = markdownEditor.selectionStart;
    const end = markdownEditor.selectionEnd;
    const currentText = markdownEditor.value;
    const selectedText = currentText.substring(start, end);
    
    const replacement = templateBefore + (selectedText || templateAfter ? selectedText : '') + templateAfter;
    
    markdownEditor.value = currentText.substring(0, start) + replacement + currentText.substring(end);
    
    // Position cursor right in the middle if wrapping without selection, or at the end
    const newCursorPos = start + templateBefore.length + (selectedText ? selectedText.length : 0);
    markdownEditor.selectionStart = newCursorPos;
    markdownEditor.selectionEnd = newCursorPos;
    
    // Trigger preview compile and update stats
    compileWorkspaceContent();
    triggerAutosaveDebounce();
  }

  // Hook up the sidebar cheatsheet items to make them interactive
  const sidebarCheatItems = document.querySelectorAll('#sidebar-cheatsheet-grid .cheat-item');
  sidebarCheatItems.forEach(item => {
    item.addEventListener('click', () => {
      const code = item.getAttribute('data-code') || '';
      const sample = item.getAttribute('data-sample') || '';
      const after = item.getAttribute('data-after') || '';
      insertMarkdown(code, sample + after);
      showToast('Sintaxis Insertada', `Se insertó en tu cursor.`, 'success');
    });
  });

  // GFM Helper items data representing 28 interactive syntax options
  const gfmHelpers = [
    {
      category: '✏️ Títulos y Texto',
      items: [
        { name: 'Título H1', code: '# ', desc: 'Encabezado principal', sample: 'Título Principal\n' },
        { name: 'Título H2', code: '## ', desc: 'Sección secundaria', sample: 'Sección Principal\n' },
        { name: 'Título H3', code: '### ', desc: 'Subsección o subtítulo', sample: 'Subsección\n' },
        { name: 'Título H4', code: '#### ', desc: 'Título menor de cuarto nivel', sample: 'Subtítulo menor\n' },
        { name: 'Negrita', code: '**', desc: 'Destacar texto importante', sample: 'texto', after: '**' },
        { name: 'Cursiva', code: '*', desc: 'Texto enfatizado inclinado', sample: 'texto', after: '*' },
        { name: 'Tachado', code: '~~', desc: 'Tachar texto corregido/obsoleto', sample: 'texto', after: '~~' },
        { name: 'Subrayado', code: '<u>', desc: 'Línea inferior al texto (HTML)', sample: 'texto', after: '</u>' },
        { name: 'Resaltado', code: '<mark>', desc: 'Marcador amarillo de texto', sample: 'texto', after: '</mark>' },
        { name: 'Centrado', code: '<div align="center">\n', desc: 'Centrar contenido horizontalmente', sample: 'texto', after: '\n</div>' },
        { name: 'Superíndice', code: '<sup>', desc: 'Letra elevada más pequeña', sample: '2', after: '</sup>' },
        { name: 'Subíndice', code: '<sub>', desc: 'Letra disminuida en base', sample: '2', after: '</sub>' },
        { name: 'Teclas Kbd', code: '<kbd>', desc: 'Representar teclas de teclado físicas', sample: 'Ctrl', after: '</kbd>' }
      ]
    },
    {
      category: '📋 Listas y Estructuras',
      items: [
        { name: 'Lista Viñetas', code: '- ', desc: 'Punto desordenado estándar', sample: 'Elemento\n' },
        { name: 'Lista Numerada', code: '1. ', desc: 'Lista secuencial ordenada', sample: 'Elemento\n' },
        { name: 'Lista Tareas (Checklist)', code: '- [ ] ', desc: 'Casilla interactiva de verificación', sample: 'Tarea pendiente\n' },
        { name: 'Cita en Bloque', code: '> ', desc: 'Destacar testimonios o citas', sample: 'Cita de texto\n' },
        { name: 'Cita Anidada', code: '> > ', desc: 'Cita dentro de otra cita', sample: 'Cita de segundo nivel\n' },
        { name: 'Separador HR', code: '\n---\n', desc: 'Línea divisoria horizontal', sample: '' },
        { name: 'Salto Página (PDF)', code: '\n<div style="page-break-after: always;"></div>\n', desc: 'Salto de página en PDF / Impresor', sample: '' }
      ]
    },
    {
      category: '⚙️ Códigos y Avanzado',
      items: [
        { name: 'Enlace Web', code: '[', desc: 'Link de internet clickeable', sample: 'Visita Google', after: '](https://google.com)' },
        { name: 'Imagen', code: '![', desc: 'Insertar imagen local o remota', sample: 'Texto alternativo', after: '](src/images/logo.png)' },
        { name: 'Código Inline', code: '`', desc: 'Palabras técnicas en fuente mono', sample: 'código', after: '`' },
        { name: 'Código Bloque', code: '```javascript\n', desc: 'Bloque con syntax highlighting', sample: '// Tu código aquí', after: '\n```' },
        { name: 'Tabla Completa', code: '| Columna 1 | Columna 2 |\n| --------- | --------- |\n| Celda 1   | Celda 2   |\n', desc: 'Tabla estructurada con cabecera', sample: '' },
        { name: 'Colapsable (Acordeón)', code: '<details>\n  <summary>', desc: 'Bloque desplegable con summary', sample: 'Haz clic aquí', after: '</summary>\n  Contenido oculto...\n</details>' },
        { name: 'Nota al Pie', code: '[^1]', desc: 'Referencia a aclaración al pie', sample: '', after: '\n\n[^1]: Detalle de la nota al pie' },
        { name: 'Lista Definiciones', code: '<dl>\n  <dt>', desc: 'Lista HTML de glosario y términos', sample: 'Concepto', after: '</dt>\n  <dd>Definición detallada</dd>\n</dl>' }
      ]
    }
  ];

  /**
   * Generates and triggers the complete, tabbed-layout GFM Cheatsheet Modal Assistant
   */
  function openGfmAssistantModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    let categoriesHtml = '';
    gfmHelpers.forEach((cat, index) => {
      let itemsHtml = '';
      cat.items.forEach(item => {
        const fullSyntax = item.code + (item.sample || '') + (item.after || '');
        const escapedSyntax = fullSyntax.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, ' ↵ ');
        
        // Escape double quotes to avoid breaking HTML parameter boundaries!
        const safeCode = item.code.replace(/"/g, '&quot;');
        const safeSample = (item.sample || '').replace(/"/g, '&quot;');
        const safeAfter = (item.after || '').replace(/"/g, '&quot;');
        
        itemsHtml += `
          <div class="gfm-helper-item" data-cat="${index}" data-name="${item.name}" data-code="${safeCode}" data-sample="${safeSample}" data-after="${safeAfter}">
            <div class="gfm-item-name">${item.name}</div>
            <div class="gfm-item-desc">${item.desc}</div>
            <code class="gfm-item-syntax" title="Hacer clic para insertar">${escapedSyntax}</code>
          </div>
        `;
      });
      
      categoriesHtml += `
        <div class="gfm-category-block">
          <h4>${cat.category}</h4>
          <div class="gfm-items-grid">
            ${itemsHtml}
          </div>
        </div>
      `;
    });

    modalOverlay.innerHTML = `
      <div class="modal-box" style="max-width: 800px; width: 95%; max-height: 85vh; overflow-y: auto; padding: 28px;">
        <div class="modal-header" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <h3 style="font-size: 1.25rem; font-family: var(--font-heading); background: linear-gradient(to right, var(--text-primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">💡 Asistente de Sintaxis GFM Completo</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">Haz clic en cualquier elemento para inyectar su código en la posición actual del cursor de tu editor Markdown. Si tienes texto seleccionado, se envolverá automáticamente.</p>
          <div class="gfm-categories-wrapper" style="display: flex; flex-direction: column; gap: 24px;">
            ${categoriesHtml}
          </div>
        </div>
        <div class="modal-footer" style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary btn-close-gfm" style="font-size: 0.76rem; padding: 6px 16px;">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Fade-in animation
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
    modalOverlay.querySelector('.btn-close-gfm').addEventListener('click', closeModal);
    
    // Bind click events on helper grid cards
    const items = modalOverlay.querySelectorAll('.gfm-helper-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-code') || '';
        const sample = item.getAttribute('data-sample') || '';
        const after = item.getAttribute('data-after') || '';
        const name = item.getAttribute('data-name') || '';
        
        insertMarkdown(code, sample + after);
        showToast('Sintaxis Insertada', `Se insertó "${name}" en el editor.`, 'success');
        closeModal();
      });
    });
  }

  // Open modal assistants on clicking headers or sidebar button
  const btnGfmHelper = document.getElementById('btn-gfm-helper');
  const btnSidebarAllGfm = document.getElementById('btn-sidebar-all-gfm');

  if (btnGfmHelper) {
    btnGfmHelper.addEventListener('click', openGfmAssistantModal);
  }
  if (btnSidebarAllGfm) {
    btnSidebarAllGfm.addEventListener('click', openGfmAssistantModal);
  }

  // Blog Categories Filtering Logic
  const blogTabsContainer = document.querySelector('.blog-categories-tabs');
  if (blogTabsContainer) {
    const tabButtons = blogTabsContainer.querySelectorAll('.category-tab-btn');
    const postCards = document.querySelectorAll('.blog-post-card');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const selectedCat = btn.getAttribute('data-category');
        
        postCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (selectedCat === 'all' || cardCat === selectedCat) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // Kickstart App
  initWorkspaceState();
});
