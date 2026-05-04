# Changelog

## [0.2.0] - 2026-05-03

### Added

- **Modelo pedagógico HSV**: funciones de conversión `hsvToRgb`, `rgbToHsv`, `hsvToHex`, `hexToHsv` y armonías HSV (`getHarmonyColorsHsv`).
- **`ColorSystem`** (`src/colorSystem.js`): gestión de estado HSV, generación de paletas, aplicación a luces y fondo.
- **`PaletteControls`** (`src/ui/PaletteControls.js`): sliders de matiz, saturación y valor; selector de armonía; preview de paleta; botones "Aplicar a luz principal" y "Aplicar a fondo".
- **`LessonProgressEngine`** (`src/lessonProgress.js`): motor de progreso basado en acciones observables. Escucha eventos, evalúa checklist y persiste criterios completados.
- **`LessonChecklist`** (`src/ui/LessonChecklist.js`): UI de pasos de lección con barra de progreso y estados pendiente/completado.
- **`EvidenceStore`** (`src/evidenceStore.js`): persistencia en `localStorage` de respuestas, estados de color, criterios completados y metadata de capturas.
- **`StudentResponse`** (`src/ui/StudentResponse.js`): campo de observación con guardado automático, display de paleta actual, botones de exportación JSON y copiar resumen al portapapeles.
- **Checklists pedagógicas**: los 8 presets ahora incluyen `checklist`, `reflectionPrompt`, `completionRules` y `learningControls`.
- **Exportación de evidencia**: botón "Exportar evidencia" genera JSON con todas las respuestas y paletas; botón "Copiar resumen" pone texto plano en el portapapeles.
- **Sincronización de dots con progreso**: al iniciar, los dots de navegación reflejan lecciones ya completadas según el `EvidenceStore`.
- **Eventos pedagógicos**: `color:hueChanged`, `color:saturationChanged`, `color:valueChanged`, `palette:applied`, `palette:previewChanged`, `lesson:criteriaCompleted`, `light:added`, `light:intensityChanged`.
- **Tests**: 91 tests pasando (`color.test.js`, `colorSystem.test.js`, `evidenceStore.test.js`, `lessonProgress.test.js`, `presets.test.js`).

### Changed

- **`main.js`**: ahora usa `getHarmonyColorsHsv` cuando el preset declara `colorModel: 'hsv'`.
- **`src/ui.js`**: integra `ColorSystem`, `PaletteControls`, `LessonProgressEngine`, `LessonChecklist`, `StudentResponse` y `EvidenceStore` en el ciclo de carga de lecciones.
- **`src/presets.js`**: todos los presets incluyen `colorModel`, `value`, `learningControls`, `checklist`, `reflectionPrompt` y `completionRules`.
- **`src/onboarding.js`**: eliminado auto-cierre a los 2500 ms; ahora requiere clic explícito del usuario.
- **`src/localization.js`**: agregadas claves `palette`, `checklist` y `response` con textos ES/EN.
- **`vite.config.js`**: entorno de test cambiado a `jsdom` para soportar `localStorage` en pruebas.
- **Progreso**: eliminado completado automático al navegar entre lecciones; ahora solo se completa cuando `LessonProgressEngine` evalúa que se cumplieron los criterios.

### Fixed

- **Persistencia**: al cambiar de lección y volver, se restauran observación, estado de color y criterios completados.
- **HSV vs HSL**: `ColorSystem` usa `value ?? lightness ?? 0.5` como fallback para compatibilidad con presets antiguos.
