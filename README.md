# ⚡ Markdify

> **Convertidor de Markdown a PDF 100% local, gratuito y open source.**  
> Edita, previsualiza y exporta documentos en formato GFM directamente en tu navegador — sin servidores, sin suscripciones, sin riesgos de privacidad.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built_with-Vite_5-646CFF?logo=vite)](https://vite.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)](https://github.com/LuisDavidTF/markdify)

---

## 🌐 Demo en Vivo

**[→ markdify.tech](https://markdify.tech)**

---

## ✨ Características

| Característica | Descripción |
|:---|:---|
| 🛡️ **Privacidad Absoluta** | Procesamiento 100% local en tu RAM — tu contenido nunca sale del navegador |
| ⚡ **Renderizado en Tiempo Real** | Preview instantáneo con soporte completo de GFM (GitHub Flavored Markdown) |
| 📄 **PDF Carta / A4** | Exportación vectorial de alta fidelidad con márgenes profesionales |
| 🖨️ **Impresión Nativa** | Compatibilidad total con el motor de impresión del navegador |
| 💼 **Plantillas Incluidas** | Informe Ejecutivo, Curriculum Vitae ATS, Sprint Planning, Guía PDF |
| 💡 **Asistente GFM** | 28 atajos de sintaxis interactivos con inserción al cursor |
| 🌗 **Tema Claro / Oscuro** | Detección automática del sistema operativo con switch manual |
| 📱 **Diseño Responsivo** | Optimizado para desktop, tablet y móvil con paneles adaptativos |
| 🔖 **Autoguardado Local** | El borrador persiste en `localStorage` sin ninguna cuenta de usuario |

---

## 🚀 Inicio Rápido

### Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/) (gestor de paquetes requerido)

```bash
# Clonar el repositorio
git clone https://github.com/luisdavid/markdify.git
cd markdify

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Abre `http://localhost:5173` en tu navegador.

---

## 🏗️ Estructura del Proyecto

```
markdify/
├── index.html              # Landing page con blog categorizado
├── markdown-to-pdf.html    # Editor principal de Markdown a PDF
├── privacy.html            # Política de privacidad
├── blog/                   # Artículos SEO individuales
│   ├── guia-sintaxis-gfm.html
│   ├── ia-a-pdf.html
│   ├── cv-markdown.html
│   ├── privacidad-local.html
│   └── salto-pagina-pdf.html
├── src/
│   ├── css/
│   │   ├── variables.css   # Tokens HSL (paleta de colores, espaciado)
│   │   ├── base.css        # Reset y tipografía
│   │   ├── layout.css      # Header sticky, footer premium
│   │   ├── dashboard.css   # Grid de herramientas y blog cards
│   │   ├── editor.css      # Workspace split-panel responsivo
│   │   ├── preview.css     # Estilos PDF y @media print
│   │   ├── components.css  # Sistema de botones, modals, toasts
│   │   └── style.css       # Agregador de imports
│   └── js/
│       ├── main.js         # Inicializador del ecosistema
│       ├── editor.js       # Resizer, scroll sync, atajos de teclado
│       ├── pdf.js          # Exportación html2pdf y print nativo
│       ├── theme.js        # Sistema de temas claro/oscuro
│       └── templates.js    # Plantillas de trabajo (CV, informe, etc.)
├── public/                 # Assets estáticos (logo, og-image)
├── vite.config.js          # Multi-page build con 8 entry points
└── package.json
```

---

## 🛠️ Scripts Disponibles

```bash
pnpm dev        # Servidor de desarrollo con HMR
pnpm build      # Bundle de producción en dist/
pnpm preview    # Previsualizar el build de producción
```

---

## 🔧 Stack Tecnológico

- **Build Tool:** [Vite 5](https://vite.dev/) — bundling ultra-rápido, multi-page app
- **Markdown Parser:** [marked.js 12](https://marked.js.org/) — GFM completo con breaks
- **HTML Sanitizer:** [DOMPurify 3](https://github.com/cure53/DOMPurify) — prevención XSS al 100%
- **PDF Generator:** [html2pdf.js 0.10](https://github.com/eKoopmans/html2pdf.js) — captura DOM local
- **Estilos:** Vanilla CSS con tokens HSL para tema claro/oscuro automático
- **Sin frameworks:** Zero React, Zero Vue — máxima performance y mínimo bundle

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este proyecto es open source bajo licencia MIT.

### Cómo contribuir

1. Haz un **Fork** del repositorio
2. Crea una rama con tu feature: `git checkout -b feat/nueva-herramienta`
3. Realiza tus cambios siguiendo las [guías de estilo](CONTRIBUTING.md)
4. Abre un **Pull Request** describiendo los cambios

### Ideas para contribuir

- [ ] Nuevas plantillas de trabajo (carta de presentación, informe financiero, etc.)
- [ ] Más herramientas web (formateador JSON, convertidor Base64, etc.)
- [ ] Traducciones del contenido a otros idiomas
- [ ] Mejoras de accesibilidad (ARIA, alto contraste)
- [ ] Tests automatizados de UI

> **Regla principal:** Usa siempre `pnpm` — nunca `npm` ni `yarn`. Consulta `gemini.md` para las directrices completas de contribución.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**. Ver [`LICENSE`](LICENSE) para más información.

La licencia MIT permite:
- ✅ Uso comercial
- ✅ Modificación y distribución
- ✅ Uso privado
- ✅ Monetización con publicidad (Google AdSense)

---

## 👤 Autor

**Luis David** — Creador y mantenedor principal

- GitHub: [@LuisDavidTF](https://github.com/LuisDavidTF)
- Proyecto: [markdify.tech](https://markdify.tech)

---

## ⭐ ¿Te fue útil este proyecto?

Si Markdify te ha sido de ayuda, considera darle una ⭐ en GitHub — ayuda mucho al posicionamiento del proyecto y a que más personas lo descubran.

---

*Markdify © 2026 Luis David — MIT License*
