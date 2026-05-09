# ChromaLab

Laboratorio virtual interactivo para aprender teoría del color.

🌐 **[Abrir ChromaLab en línea](https://nestorfernando3.github.io/chromalab/)**

![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)

## 🎯 Características

- **8 lecciones interactivas** de teoría del color con objetivos pedagógicos claros
- **Controles pedagógicos HSV** — matiz, saturación y valor con preview en tiempo real
- **Checklist de progreso** por lección: criterios observables y completado basado en acciones
- **Evidencia guardable** — observaciones, paletas y capturas persistentes por lección
- **Sala 3D interactiva** para experimentar con paletas en tiempo real
- **Diagrama de rueda cromática** para visualizar armonías
- **Exportación de evidencia** — archivo de texto con respuestas y paletas, copiar resumen al portapapeles
- **Bilingüe** (español / inglés)

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/nestorfernando3/chromalab.git
cd chromalab

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 📦 Build

```bash
npm run build
```

Los archivos estáticos se generan en la carpeta `dist/`.

## 🧪 Tests

```bash
npm test
```

## 🏗️ Arquitectura

```
presets.js
   |
   v
ColorSystem  ---> PaletteControls ---> LightingSystem / model backdrop
   |                 |
   |                 v
   |              appEvents
   |                 |
   v                 v
LessonProgressEngine ---> LessonChecklist
   |
   v
EvidenceStore ---> StudentResponse ---> ScreenshotExporter
```

- **`ColorSystem`** — Estado pedagógico HSV, generación de paletas y aplicación a escena
- **`PaletteControls`** — Sliders HSV, preview de paleta, botones de aplicación
- **`LessonProgressEngine`** — Evaluación de criterios por eventos, progreso real por acciones
- **`LessonChecklist`** — UI de pasos completados con barra de progreso
- **`EvidenceStore`** — Persistencia `localStorage` de respuestas, estados de color y capturas
- **`StudentResponse`** — Textarea de observación con guardado automático y exportación

## 🛠️ Stack Tecnológico

- **Three.js** - Gráficos 3D y WebGL
- **Vite** - Bundler y servidor de desarrollo
- **Vitest** - Testing unitario (jsdom para DOM/localStorage)
- **Vanilla JS/CSS** - Sin frameworks adicionales

## 📄 Licencia

MIT © Néstor De León — UPCA
