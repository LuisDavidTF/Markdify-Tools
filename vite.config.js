import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'markdown-to-pdf.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        blog_ia: resolve(__dirname, 'blog/ia-a-pdf.html'),
        blog_cv: resolve(__dirname, 'blog/cv-markdown.html'),
        blog_privacidad: resolve(__dirname, 'blog/privacidad-local.html'),
        blog_saltos: resolve(__dirname, 'blog/salto-pagina-pdf.html'),
        blog_gfm: resolve(__dirname, 'blog/guia-sintaxis-gfm.html'),
      },
    },
  },
});
