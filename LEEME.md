# Canin Cocoa — prototipo en HTML y CSS

## Estructura
```
canin-cocoa/
├── index.html      → Inicio
├── modulos.html    → Módulos por etapa de vida (pestañas)
├── sintomas.html   → Análisis preliminar de síntomas
├── aprende.html    → Artículos con filtro por tema
├── perfil.html     → Registro de antecedentes en 3 pasos
├── css/styles.css  → Todos los estilos (colores en :root)
├── js/main.js      → Interactividad (menú, pestañas, síntomas, registro, filtro)
└── img/            → Logo e ícono
```

## Abrirlo en VS Code
1. Descomprime el .zip.
2. En VS Code: Archivo → Abrir carpeta… → elige `canin-cocoa`.
3. Instala la extensión **Live Server** (de Ritwick Dey).
4. Clic derecho en `index.html` → **Open with Live Server**.
   Se abre en el navegador y se recarga solo cada vez que guardas.

## Dónde cambiar cosas
- **Colores y tipografías:** al inicio de `css/styles.css`, en `:root`.
- **Textos de etapas, temas y señales de alerta:** en `modulos.html`.
- **Síntomas:** en `sintomas.html`. El atributo `data-category="cardiac"` hace que el resultado sea "Alto".
- **Reglas del análisis:** en `js/main.js`, sección 3. El nivel sube a:
  - **Alto:** dolor de pecho/palpitaciones, 5+ síntomas, o molestias fuertes que empeoran o impiden las actividades.
  - **Moderado:** 3–4 síntomas, más de 2 semanas de duración, molestias fuertes, que empeoran o que afectan las actividades diarias.
  - **Bajo:** en cualquier otro caso. El resultado muestra los motivos y un resumen para llevar a consulta.
- **Preguntas de duración, intensidad, evolución e impacto:** en `sintomas.html`, dentro de `<div class="details-box">`.
- **Banners del carrusel (inicio):** en `index.html`, dentro de `<div class="carousel">`.
  Para agregar uno, copia un `<article class="slide ...">` completo y cambia fecha, título, texto y enlace.
  Colores disponibles: `slide-rose`, `slide-lilac`, `slide-periwinkle`, `slide-ice`, `slide-purple`.
  Los puntos se crean solos. La velocidad se cambia en `js/main.js`, sección 6 (`INTERVALO`).
- **Artículos:** en `aprende.html`. Para uno nuevo, copia un `<article>` y usa un `data-tag` que coincida con un filtro.
- **Menú y pie de página:** se repiten en cada página; si los cambias, cámbialos en los 5 archivos.

## Nota
El perfil se guarda solo en el navegador (localStorage). Para guardar datos de verdad
se necesitaría un servidor o una base de datos, lo cual queda fuera de un prototipo HTML/CSS.
