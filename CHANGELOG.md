# Changelog

## [0.4.1] - 2026-05-07

### Fixed

- Fixed free-light creation by restoring the `makeBilingualLabel` helper used by sandbox light actions.
- Fixed scene interaction by letting pointer events pass through the app shell to the WebGL canvas, restoring drag-to-rotate behavior.
- Fixed reopened onboarding/help overlay so the `Comenzar` button always closes it and returns control to the app.
- Auto-select the first lesson light when a lesson loads so light controls are immediately available.
- Synced palette strip `aria-hidden` state with visibility to avoid focus being trapped in hidden controls.
- Added the modern `mobile-web-app-capable` meta tag and an inline favicon to remove browser console noise.

### Verified

- `vitest run`
- `vite build`
- Browser probe confirmed canvas drag rotates the camera and intensity controls update the active Three.js light.

## [0.4.0] - 2026-05-07

### Changed

- Ported ChromaLab to the Lighting Studio 3D visual system with split CSS modules under `src/css/`.
- Replaced the monolithic `style.css` with modular imports plus a ChromaLab compatibility layer.
- Restyled lesson, controls, palette, checklist, evidence, modal, toast and footer surfaces to match the reference app more closely while preserving ChromaLab functionality.
- Added mobile scrim state handling for drawer-style lesson and controls panels.

### Removed

- Removed duplicate numbered source/docs files and stale untracked planning/prototype artifacts from the repo.
- Removed tracked duplicate `CHANGELOG 2.md`; `CHANGELOG.md` is now the single changelog source.

### Verified

- `npm run build`
- `npm test -- --run`

## [0.3.0] - 2026-05-07

### Added

- **`CurriculumDrawer`** (`src/ui/CurriculumDrawer.js`): panel lateral deslizable con mapa de lecciones — estados completado/actual/bloqueado, conteo de progreso, navegación directa.
- **`LessonCompletionModal`** (`src/ui/LessonCompletionModal.js`): modal de celebración al completar lección — burst visual, evidencia completada, botones "Siguiente lección" y "Revisar evidencia".
- **`ComparisonMode`** (`src/ui/ComparisonMode.js`): tarjeta de comparación para presets de contraste y temperatura — toggle de pantalla dividida con línea divisoria visual.
- **`ScreenshotToast`** (`src/ui/ScreenshotToast.js`): toast con thumbnail de captura, nombre de archivo y auto-dismiss en 2.6 s.
- **Active step hints**: pista contextual en el paso activo de la misión — animación de pulso en el control objetivo + texto guía en la esquina inferior.
- **Collapsed lesson rail**: barra de acceso rápido que aparece cuando el panel de controles está colapsado — muestra número de lección, progreso y acceso a evidencia.
- **Global Escape handler**: cierra drawer, modal de completado y modo dividido con tecla Escape.
- **Modo acentuado por contexto**: tokens de color diferenciados según modo (guiado = cálido, exploración = cian, sandbox = púrpura/espectro).

### Changed

- **`style.css`**: sistema de tokens híbrido, refinamiento de paneles glassmorphism, scrollbar personalizado, animaciones de pulso y toast.
- **`src/ui.js`**: integra `CurriculumDrawer`, `LessonCompletionModal`, `ComparisonMode`, `ScreenshotToast`, active hints y lesson rail en el ciclo de renderizado.
- **`src/localization.js`**: agregadas claves `curriculum`, `missionHints`, `screenshotToast`, `completionModal` con textos ES/EN.
- **`src/presets.js`**: presets `contrast` y `temperature` ahora incluyen campo `comparison` con título y descripción.
- **`src/lessonSession.js`**: expone getter `presets` para acceso al catálogo de lecciones.
- **`src/ui/ScreenshotExporter.js`**: evento `screenshotTaken` ahora incluye `dataUrl` y `lessonId`.
- **Tipografía**: `--text-xs` mínimo subido de 10 px a 11 px; todos los `font-size: 10px` estáticos reemplazados por `var(--text-xs)`; pesos añadidos a títulos y textos de sección.
- **Ancho del panel**: `--panel-w-wide` aumentado de 320 px a 340 px para evitar truncamiento de "Anterior"/"Siguiente".
- **Separadores de sección**: `.section-label` ahora incluye `border-top` y `padding-top` para división visual más clara.

### Fixed

- **Checklist visual crudo**: items ahora renderizan con checkbox circular, fondo de fila, badge de "Obligatorio" como píldora separada, barra de progreso y estados active/completed.
- **Concatenación de texto**: espacio añadido entre nombre de tarea y badge `required` en `LessonChecklist.js`.
- **Nav buttons truncados**: padding reducido, gap reducido, añadido `white-space: nowrap` + `text-overflow: ellipsis`.
- **Título de completado excesivo**: reducido de `clamp(1.8rem, 4vw, 3rem)` a `var(--text-xl)` (20–24 px).
- **Responsive y accesibilidad**: fallbacks móviles para comparison-layer y screenshot-toast, override `prefers-reduced-motion` en todas las animaciones nuevas.

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
