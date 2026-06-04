import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'markdown-to-pdf.html'),
        pdf_to_md: resolve(__dirname, 'pdf-to-markdown.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        blog_ia: resolve(__dirname, 'blog/ia-a-pdf.html'),
        blog_cv: resolve(__dirname, 'blog/cv-markdown.html'),
        blog_privacidad: resolve(__dirname, 'blog/privacidad-local.html'),
        blog_saltos: resolve(__dirname, 'blog/salto-pagina-pdf.html'),
        blog_gfm: resolve(__dirname, 'blog/guia-sintaxis-gfm.html'),
        blog_especificacion: resolve(__dirname, 'blog/especificacion-gfm.html'),
        blog_seguridad_xss: resolve(__dirname, 'blog/seguridad-xss-dompurify.html'),
        blog_motores_renderizado: resolve(__dirname, 'blog/motores-renderizado-pdf.html'),
        blog_optimizacion_tipografica: resolve(__dirname, 'blog/optimizacion-tipografica-codigo.html'),
        blog_impacto_ats: resolve(__dirname, 'blog/impacto-ats-hojas-vida.html'),
        blog_css_paged: resolve(__dirname, 'blog/css-paged-media-impresion.html'),
        blog_privacidad_serverless: resolve(__dirname, 'blog/privacidad-serverless-saas.html'),
        blog_html5_localstorage: resolve(__dirname, 'blog/html5-localstorage-persistencia.html'),
        blog_markdown_prompt: resolve(__dirname, 'blog/markdown-prompt-engineering.html'),
        blog_seo_tecnico: resolve(__dirname, 'blog/seo-tecnico-cloudflare-pages.html'),
        blog_svg_canvas: resolve(__dirname, 'blog/svg-vs-canvas-vectorizacion.html'),
        blog_html5_file: resolve(__dirname, 'blog/html5-file-api-offline.html'),
        blog_css_flexbox: resolve(__dirname, 'blog/css-flexbox-grid-editorial.html'),
        blog_ssg_docs: resolve(__dirname, 'blog/generadores-sitios-estaticos-documentacion.html'),
        blog_hibridacion: resolve(__dirname, 'blog/hibridacion-markdown-html5.html'),
        blog_dom_sanitizer: resolve(__dirname, 'blog/w3c-dom-sanitizer-api-seguridad.html'),
        blog_compilacion_swc: resolve(__dirname, 'blog/compilacion-swc-rust-ast-navegador.html'),
        blog_canvas_seguridad: resolve(__dirname, 'blog/html5-canvas-seguridad-fingerprinting.html'),
        blog_webassembly_memoria: resolve(__dirname, 'blog/webassembly-memoria-rendimiento-v8.html'),
        blog_mozilla_readability: resolve(__dirname, 'blog/mozilla-readability-heuristica-extraccion-contenido.html'),
        blog_pdf_referencia: resolve(__dirname, 'blog/pdf-referencia-iso-32000-maquetacion.html'),
      },
    },
  },
});
