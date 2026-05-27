# 🤝 Guía de Contribución y Guías de Estilo (CONTRIBUTING.md)

¡Gracias por tu interés en colaborar con **Markdify**! Como un proyecto 100% open source y local, queremos asegurar que el código sea de la más alta calidad, rápido, seguro y mantenga una visualización estética premium.

Esta guía establece los estándares de código, directrices operativas y la guía de estilo obligatoria que todos los desarrolladores deben seguir al abrir Pull Requests (PRs).

---

## 🚀 1. Normas de Desarrollo Obligatorias

Para garantizar la estabilidad del proyecto en producción, estas reglas deben cumplirse estrictamente antes de enviar cualquier contribución:

### 📦 Uso Exclusivo de `pnpm`
**Bajo ninguna circunstancia se debe utilizar `npm` ni `yarn` en este repositorio.** Todas las instalaciones y dependencias deben administrarse únicamente con **pnpm**.
*   **Servidor de desarrollo:** `pnpm dev`
*   **Compilar para producción:** `pnpm build`
*   **Instalar una nueva dependencia:** `pnpm add <package>` o `pnpm add -D <package>`

### 🛡️ Cero Dependencias Innecesarias
*   **Vanilla JS por Diseño:** Markdify es un proyecto *zero-framework* (sin React, Vue o Angular) para lograr la máxima performance. No agregues librerías pesadas para tareas sencillas que se resuelven con JavaScript moderno nativo (Vanilla JS).
*   **Seguridad Activa:** Si agregas una dependencia de desarrollo indispensable, especifica la versión exacta y corre `pnpm audit` para asegurar que no posea vulnerabilidades de seguridad.

### 📖 Documentación Oficial
Antes de proponer una implementación con librerías críticas del proyecto (como `marked.js` para parsing de GFM, `DOMPurify` para sanitización XSS, o `html2pdf.js` para canvas/PDF), **debes leer su documentación oficial**. No asumas comportamientos; asegúrate de optimizar su uso del lado del cliente.

---

## 🎨 2. Guía de Estilo y UI Premium

Cualquier cambio en la interfaz gráfica debe verse espectacular, sintiéndose moderno y fluido. Sigue estas directrices de diseño:

### 🌓 Paleta de Colores HSL y Modo Claro/Oscuro
*   **No uses colores planos (`red`, `blue`, `#333`):** Utiliza siempre los tokens de color HSL unificados en [src/css/variables.css](file:///c:/Users/luis_/Documentos/Proyectos%20(Antigravity)/tools-web-earn/src/css/variables.css).
*   Estos tokens soportan el cambio automático de tema claro/oscuro adaptándose a los colores del sistema operativo del usuario.
    ```css
    /* Ejemplo de uso correcto */
    .mi-tarjeta {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    ```

### 📱 Diseño Adaptable (Mobile-First)
*   Toda pantalla debe ser 100% responsiva y amigable con dispositivos táctiles.
*   En pantallas pequeñas, evita scrolls horizontales accidentales. Utiliza menús colapsables o layouts flexibles.

### ⚡ Micro-Interacciones
*   Agrega transiciones suaves (`transition: all 0.3s ease`) en todos los estados `:hover` y `:active` de botones, tarjetas y enlaces.
*   Utiliza gradientes modernos (violeta a fucsia en acentos) de forma sutil para dar la sensación de una herramienta premium de primer nivel.

---

## 💻 3. Flujo de Trabajo para Pull Requests (PR)

1.  **Haz un Fork** del repositorio de Markdify.
2.  **Crea una rama descriptiva** con el prefijo correcto:
    *   Para nuevas características: `git checkout -b feat/nombre-caracteristica`
    *   Para corregir bugs: `git checkout -b fix/bug-resuelto`
3.  **Realiza tus cambios** respetando las directrices de código y la guía de estilo.
4.  **Valida localmente:** Corre `pnpm build` para asegurar que el bundle de Vite compile las 23 páginas sin ningún error de Rollup.
5.  **Abre tu PR** detallando los cambios introducidos y adjuntando capturas de pantalla si modificaste elementos visuales.

---

¡Esperamos con ansias ver tus contribuciones para seguir expandiendo Markdify!
