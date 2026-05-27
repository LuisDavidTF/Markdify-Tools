/* ==========================================================================
   PREDEFINED WORKSPACE MARKDOWN TEMPLATES (templates.js)
   ========================================================================== */

export const templates = {
  report: `# 📊 Informe Técnico: Optimización y Rendimiento Web 2026

> **Resumen Ejecutivo:** Este documento técnico presenta los resultados de la auditoría de rendimiento y optimización de velocidad de carga realizados en los portales corporativos durante el primer trimestre de 2026.

---

## 1. Análisis de Carga y Core Web Vitals
La velocidad de carga en dispositivos móviles y de escritorio es determinante para la retención del usuario y el posicionamiento en buscadores. Evaluamos tres métricas esenciales:

### ⚡ Métricas Clave Auditadas
1. **LCP (Largest Contentful Paint):** Tiempo de renderizado de la imagen o bloque de texto más grande en la pantalla.
2. **FID (First Input Delay):** Tiempo que tarda el navegador en responder a la primera interacción del usuario.
3. **CLS (Cumulative Layout Shift):** Medida de la estabilidad visual de los elementos en la página durante la carga.

---

## 2. Resultados Obtenidos
Tras aplicar técnicas avanzadas de carga diferida (lazy loading), compresión de vectores e inyección dinámica del lado del cliente, se obtuvieron las siguientes mejoras:

| Portal Corporativo | LCP Original | LCP Optimizado | Incremento de Velocidad |
| :--- | :--- | :--- | :--- |
| **Portal Principal** | 3.4 segundos | **1.2 segundos** | **+64% de mejora** |
| **Área Académica** | 4.8 segundos | **1.5 segundos** | **+68% de mejora** |
| **Centro de Soporte** | 2.9 segundos | **0.9 segundos** | **+69% de mejora** |

---

## 3. Plan de Acción Recomendado
Para asegurar que el rendimiento se mantenga óptimo a largo plazo, se aconseja seguir las siguientes directrices operativas:

- [x] Comprimir y redimensionar todas las imágenes en formatos modernos (.webp).
- [x] Minimizar el uso de scripts de terceros bloqueantes en la cabecera.
- [x] Alojar las fuentes tipográficas localmente para evitar peticiones HTTP extras.
- [ ] Habilitar almacenamiento en caché perimetral a través de una red CDN.
- [ ] Realizar una auditoría de accesibilidad WCAG complementaria.

<div style="page-break-after: always;"></div>

## 4. Anexo: Metodología de Conversión Local
Para la maquetación y entrega de informes formales, la suite procesa la documentación de forma local en el navegador, asegurando:
* **Confidencialidad Absoluta:** Los borradores y cotizaciones no viajan a ningún servidor de internet. Privacidad 100% garantizada.
* **Tipografía Vectorial Nítida:** Los textos se exportan en alta definición, manteniéndose legibles y seleccionables sin distorsión de píxeles.`,

  cv: `# 💼 Sofía Elena - Ingeniera de Software & Arquitecta Cloud

**Email:** contacto@tu-correo.com | **LinkedIn:** /in/tu-usuario | **GitHub:** github.com/tu-usuario

---

## 🚀 Perfil Profesional
Ingeniera de software apasionada por el desarrollo de arquitecturas web de alto rendimiento, optimización de aplicaciones front-end en el cliente y despliegues en infraestructura cloud serverless. Experiencia demostrada en la creación de herramientas de productividad seguras y metodologías de diseño ágiles.

---

## 🛠️ Habilidades Técnicas

* **Lenguajes:** JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL, Python.
* **Frameworks & Librerías:** React.js, Next.js, Node.js, Express, Tailwind CSS.
* **Infraestructura Cloud:** AWS (S3, Lambda), Cloudflare Pages, Vercel, Firebase.
* **Herramientas & Entornos:** Git, Docker, CI/CD Pipelines, Jest para pruebas unitarias.

---

## 💼 Experiencia Laboral

### Desarrolladora Frontend Senior | Studio Innovación Digital
*2024 - Presente*
* Lideré el desarrollo técnico de plataformas web interactivas de alta concurrencia, mejorando la velocidad global en un 45%.
* Diseñé sistemas de persistencia y procesamiento de datos local del lado del cliente, disminuyendo la carga en los servidores en un 60%.
* Automatice procesos de despliegue mediante pipelines CI/CD integrados, reduciendo los tiempos de entrega de características en un 30%.

### Desarrolladora Full-Stack Junior | Soluciones Tecnológicas S.A.
*2022 - 2024*
* Diseñé y mantuve APIs RESTful seguras integradas en bases de datos relacionales SQL.
* Implementé interfaces responsivas móviles que incrementaron la retención del usuario en un 25%.
* Colaboré con el equipo de producto para asegurar estándares de accesibilidad (WCAG) en todas las herramientas del portal.

---

## 🎓 Educación y Certificaciones

* **Licenciatura en Ingeniería de Software** | Universidad Tecnológica Nacional (2018 - 2022)
* **Certificación Profesional de Arquitectura Cloud** | AWS Learning Portal (2025)
* **Especialización en Seguridad Web y OWASP** | Security Academy (2024)`,

  notes: `# ✍️ Minuta de Reunión: Planificación de Sprint Q2

**Fecha:** 25 de mayo de 2026  
**Lugar:** Sala Virtual de Ingeniería  
**Moderador:** Sofía Elena (Scrum Master)  
**Participantes:** Equipo de Ingeniería Front-End, Equipo de Producto  

---

## 📋 Agenda de la Sesión
1. Revisión de las métricas clave de rendimiento obtenidas en el sprint anterior.
2. Planificación de características prioritarias para el segundo trimestre de 2026.
3. Definición de la estrategia de seguridad y protección de borradores del usuario.

---

## 📌 Puntos Clave Acordados

### Despliegue de Herramientas de Privacidad
El equipo acordó migrar todas las herramientas utilitarias a un formato de procesamiento del lado del cliente (**Client-Side**). La protección de datos y borradores se mantendrá al 100% gracias a que la compilación y exportación de archivos se ejecuta localmente en la RAM del navegador del usuario.

### Diseño de la Suite Multi-páginas
* Se separará el portal en páginas dedicadas e independientes por herramienta para estructurar un SEO limpio y ordenado de cada utilidad individual.
* Cada página contará con una barra lateral dedicada de atajos rápidos e instrucciones de sintaxis detalladas.

---

## ⚡ Tareas Asignadas (Sprint Action Items)

- [x] Desarrollar la interfaz responsiva premium en HTML5 e integrar librerías vía CDN.
- [x] Crear las hojas de estilo óptimas con soporte nativo de impresión física en tamaño Carta y A4.
- [ ] Programar los atajos de teclado rápidos para acelerar el guardado y la descarga del PDF.
- [ ] Integrar el botón interactivo de borrado y reinicio del editor técnico.
- [ ] Realizar pruebas unitarias en navegadores móviles, tablets y ordenadores portátiles.`,

  guide: `# 💡 Guía Maestra de Markdown y Atajos de PDF

Este documento técnico funciona como una guía interactiva. Puedes editar este texto para probar la sintaxis, alternar el formato Carta/A4 en los ajustes de la barra lateral, o hacer clic en **Descargar PDF** para guardarlo como tu hoja de referencia rápida.

---

## 1. Encabezados y Estructura Jerárquica
Usa el símbolo \`#\` seguido de un espacio al inicio de la línea para maquetar encabezados semánticos de distintas jerarquías.

# Encabezado 1 (Título Principal)
## Encabezado 2 (Sección Principal)
### Encabezado 3 (Subsección)
#### Encabezado 4 (Subtítulo Menor)

---

## 2. Formato y Énfasis del Texto
Agrega valor estético y destaca conceptos importantes en tus reportes:

* **Texto en Negrita:** Envuelve el texto con doble asterisco \`**negrita**\`.
* *Texto en Cursiva:* Envuelve el texto con un solo asterisco \`*cursiva*\`.
* ~~Texto Tachado:~~ Usa doble tilde \`~~tachado~~\` para tachar términos u opciones obsoletas.
* **_Negrita y Cursiva combinados:_** Utiliza tres asteriscos \`***combinado***\`.

---

## 3. Listas y Checklists (Organización)
Las listas ordenadas y desordenadas te permiten desglosar tareas complejas y secuencias operativas con total nitidez.

### Lista de Viñetas (Desordenada)
* Elemento principal de primer nivel.
  * Subelemento sangrado (usa doble espacio de sangría).
    * Tercer nivel de sangría.

### Lista Secuencial (Ordenada)
1. Primer paso fundamental de configuración.
2. Segundo paso secuencial operativo.

### Listas de Verificación (Checklists)
- [x] Tarea prioritaria del Sprint completada con éxito.
- [ ] Tarea en proceso de revisión de maquetación.
- [ ] Tarea técnica pendiente de desarrollo local.

<div style="page-break-after: always;"></div>

## 4. Inserción de Código (Markdown Técnico)
Ideal para instructivos técnicos, guías de desarrollo de software y apuntes académicos.

Para resaltar comandos breves dentro de un párrafo (código inline), envuélvelo en comillas invertidas simples: el comando \`pnpm dev\` levanta el servidor rápido con Vite.

Para insertar bloques extensos de código con tipografía monoespaciada estructurada, usa tres comillas invertidas indicando el lenguaje:

\`\`\`javascript
// Función para compilar y sanitizar Markdown localmente
function compilarMarkdown(textoCrudo) {
  const htmlCompilado = marked.parse(textoCrudo);
  return DOMPurify.sanitize(htmlCompilado);
}
console.log("Compilación local lista");
\`\`\`

---

## 5. Tablas y Estructuración de Datos
Estructura información compleja con filas y columnas de manera elegante:

| Componente | Comando en Editor | Efecto Visual en PDF |
| :--- | :---: | ---: |
| **Citas** | \`> Cita de texto\` | Caja estilizada con borde morado royal |
| **Código** | \`\`\` código \`\` | Bloque monoespaciado JetBrains Mono |
| **Salto Página** | \`<div style="...always;"></div>\` | Forzar inicio de hoja física en blanco |
| **Separador** | \`---\` | Línea horizontal fina de separación |

---

## 6. Cuadros de Alerta y Notas Destacadas
Usa el carácter \`>\` al inicio de una línea para destacar notas importantes o avisos:

> 🚨 **Importante:** Recuerda activar la casilla **Páginas** en la barra superior para visualizar los límites de página (Carta/A4) en tiempo real en la vista previa del editor.

También puedes inyectar bloques de HTML puro con bordes de color personalizados para resaltar consejos profesionales:

<div style="background-color: hsla(262, 83%, 58%, 0.05); padding: 16px; border-left: 4px solid var(--accent); border-radius: 0 8px 8px 0; margin: 1.5em 0; color: var(--text-primary);">
  <strong>💡 Consejo Pro para Impresión Física:</strong> Al usar la opción de <strong>Imprimir (Físico)</strong> o <strong>Descargar PDF</strong> en tu navegador, asegúrate de activar la casilla de "Gráficos de Fondo" y configurar los márgenes como "Ninguno" para que la hoja digital encaje al 100% de la hoja física.
</div>

---

## 7. Saltos de Página y Ajuste de Portadas
Cuando estés redactando informes largos o un Curriculum Vitae, y desees forzar que una sección de texto inicie estrictamente al principio de una hoja física en blanco para evitar "títulos huérfanos", inyecta la siguiente etiqueta HTML:

\`<div style="page-break-after: always;"></div>\`

Si solo requieres agregar un espaciado vertical personalizado para separar componentes, inyecta divs con altura explícita:

\`<div style="height: 30px;"></div>\``
};
