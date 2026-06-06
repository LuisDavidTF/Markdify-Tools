# 🗺️ Markdify Roadmap & Issues de Colaboración

¡Bienvenido al espacio de contribución de Markdify! Markdify es un proyecto enfocado en la **privacidad absoluta y la velocidad**, por lo que todo el procesamiento se realiza **100% en el cliente (RAM del navegador)**, sin servidores backend ni APIs externas que almacenen los archivos de los usuarios.

Si quieres colaborar con nosotros, aquí tienes una lista de características y herramientas de alto valor detalladas como issues técnicos. Elige una, sigue la ruta sugerida ¡y abre un Pull Request!

---

## 🛠️ Lista de Issues Abiertos para Contribuidores

### 1. Markdown a ePub / MOBI (Libro Electrónico)
*   **Dificultad:** Media-Alta
*   **Descripción:** Permitir a escritores e ingenieros empaquetar uno o varios archivos Markdown en un libro digital `.epub` estándar con metadatos (autor, título, portada) y un índice de navegación (TOC) correcto.
*   **Requisitos Client-Side:**
    *   Utilizar librerías como `epub-gen-memory` o implementar un empaquetador dinámico usando `JSZip` que ensamble el contenedor estándar EPUB (archivos XHTML, CSS y metadatos XML `container.xml` / `content.opf`).
    *   Permitir subir una imagen de portada local y convertirla a Base64/Blob para incrustarla.
*   **Alineación Estética:** Crear una interfaz de configuración de libro con campos de metadatos y ordenamiento de capítulos.

---

### 2. Conversor de Markdown a Presentaciones Web (Slides)
*   **Dificultad:** Media
*   **Descripción:** Añadir un motor que convierta un archivo `.md` estructurado (usando separadores como `---` para cada diapositiva) en una presentación interactiva para proyectar en el navegador y exportar.
*   **Requisitos Client-Side:**
    *   Se puede integrar una librería liviana como **Reveal.js** o construir un renderizador de diapositivas CSS nativo que tome las secciones y aplique transiciones de pantalla completa.
    *   Agregar botones para pasar de diapositiva y una vista previa del presentador.
*   **Archivos a Crear/Modificar:** `slides-editor.html`, `src/js/slides.js`, `src/css/slides.css`.

---

### 3. Markdown a HTML "Email-Safe" con CSS Inline
*   **Dificultad:** Baja-Media
*   **Descripción:** El HTML para correos electrónicos es complejo porque los clientes de correo (Outlook, Gmail) requieren estilos en línea (`style="..."`) y estructuras de tabla específicas. Esta herramienta convertirá Markdown puro en HTML compatible con e-mail marketing.
*   **Requisitos Client-Side:**
    *   Parser básico de Markdown a HTML.
    *   Un inliner de CSS que tome los estilos tipográficos predefinidos (fuentes legibles, espaciados, tablas limpias) y los inyecte directamente en las etiquetas del HTML generado.
    *   Área con botón "Copiar HTML para Correo" listo para pegar en Mailchimp o SendGrid.

---

### 4. Notion / Confluence / Word (.docx) a Markdown
*   **Dificultad:** Media
*   **Descripción:** Permitir a las empresas migrar sus bases de datos documentales a repositorios de código. El conversor leerá archivos de Word o exportaciones de Notion y generará un Markdown limpio, preservando imágenes y tablas.
*   **Requisitos Client-Side:**
    *   Utilizar **Mammoth.js** en el frontend para leer el binario del archivo `.docx` y extraer el contenido semántico.
    *   Convertir las imágenes incrustadas en el documento Word a cadenas de datos `data:image/...` o blobs locales y mapearlas en el Markdown.
    *   Descargar un `.zip` si hay imágenes asociadas.

---

### 5. Procesamiento por Lotes en ZIP (Bulk Converter)
*   **Dificultad:** Alta
*   **Descripción:** Permitir a los usuarios arrastrar múltiples archivos Markdown (e.g. 50 archivos) y convertirlos todos en bloque a PDFs, o viceversa, devolviendo un archivo comprimido `.zip` que mantenga la estructura original de carpetas.
*   **Requisitos Client-Side:**
    *   Utilizar **JSZip** para el manejo de archivos en memoria.
    *   Iterar sobre los archivos cargados mediante un input multi-archivo o la File System Access API.
    *   Procesar secuencialmente el renderizado y exportar los resultados al ZIP local.

---

### 6. Validador de Enlaces Internos/Externos (Linter) y Generador de TOC
*   **Dificultad:** Baja-Media
*   **Descripción:** Analizar un documento Markdown y:
    1. Generar automáticamente una Tabla de Contenidos (TOC) basada en los encabezados (`#`, `##`).
    2. Validar que los enlaces internos (anclas de títulos `#mi-seccion`) y enlaces externos existan y funcionen (mediante fetch client-side donde el CORS lo permita).
*   **Requisitos Client-Side:**
    *   Extraer los encabezados mediante expresiones regulares o analizando el AST de Marked.
    *   Crear una UI que liste las advertencias de enlaces rotos o huérfanos.

---

### 7. Exportación de HTML Auto-contenido (Single-File con Base64)
*   **Dificultad:** Baja
*   **Descripción:** Añadir una opción de exportación avanzada en el editor de Markdown a PDF que genere un único archivo `.html` que incluya: el HTML compilado, los estilos CSS inyectados de Markdify y todas las imágenes locales referenciadas convertidas a strings `Base64`. Esto permite compartir el documento de forma offline.
*   **Requisitos Client-Side:**
    *   Escanear el HTML generado en busca de tags `<img>`.
    *   Convertir los recursos locales cargados a Base64 e inyectarlos en el atributo `src`.
    *   Empaquetar todo en un Blob HTML y disparar la descarga.

---

### 8. Cifrado y Descifrado de Documentos Markdown (Cajero Fuerte)
*   **Dificultad:** Media
*   **Descripción:** Una utilidad que aproveche la **WebCrypto API** nativa de los navegadores modernos para cifrar localmente el texto de un Markdown con una contraseña del usuario. Generará un archivo `.md.enc` (o un HTML autodescifrable con contraseña).
*   **Requisitos Client-Side:**
    *   Utilizar criptografía AES-GCM local en el cliente.
    *   Asegurar que la contraseña nunca viaje a ningún servidor (comportamiento zero-knowledge).
    *   Permitir arrastrar un archivo cifrado para descifrarlo en vivo en el navegador ingresando la clave.

---

### 9. Integración y Exportación de Diagramas Mermaid a Vectorial
*   **Dificultad:** Media-Alta
*   **Descripción:** Detectar bloques de código tipo ` ```mermaid ` en el editor y renderizarlos en vivo en la vista previa del documento. Además, permitir exportar de forma independiente los diagramas en formatos vectoriales SVG o PNG de alta resolución.
*   **Requisitos Client-Side:**
    *   Integrar de manera diferida `mermaid.min.js` para renderizar los diagramas en el preview de forma asíncrona.
    *   Asegurar la compatibilidad con el motor de exportación `html2pdf.js` esperando a que los diagramas terminen de renderizarse antes de generar el Canvas del PDF.

---

## 🎯 Pautas Generales de Contribución

1.  **Seguridad XSS:** Si manipulas HTML, debes pasarlo siempre por `DOMPurify.sanitize(html)` antes de insertarlo en el DOM.
2.  **Alineación CSS:** Utiliza los tokens HSL en `src/css/variables.css` para que las herramientas se adapten automáticamente al modo claro y oscuro del sitio.
3.  **Vite Config:** Si agregas una nueva página HTML, recuerda darla de alta en el objeto `input` de `rollupOptions` dentro de [vite.config.js](file:///c:/Users/luis_/Documentos/Proyectos%20(Antigravity)/tools-web-earn/vite.config.js).
