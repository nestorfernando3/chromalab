# Changelog

## [0.3.1] - 2026-05-04

### Fixed

- **Palette strip interaction**: floating palette swatches are now real accessible buttons instead of decorative spans.
- **Background application flow**: palette strip clicks and "Aplicar a fondo" now apply the selected color to the scene background, update background controls, request a render, and emit the lesson progress event.
- **Palette feedback**: the floating strip now follows the active `ColorSystem` palette as HSV and harmony controls change.

## [0.3.0] - 2026-05-03

### Added

- **.impeccable.md**: formal design context, brand personality, aesthetic direction, and accessibility targets documented.
- **Responsive shell stabilization**: fixed-position mobile sheets, scrim overlay with click-to-close, touch targets set to 44px minimum, `overflow-x: clip` on root elements, body state class when sheet open, focus management when panel opens, Escape and scrim close for mobile panels.
- **LessonMission** (`src/ui/LessonMission.js`): active step guidance card showing current task, step-to-control mapping, highlights relevant controls, emits `lesson:activeStepChanged` event.
- **CompletionSummary** (in `StudentResponse`): badge with checkmark, lesson-specific completion message, evidence checkmarks, "Next lesson" and "Export" action buttons.
- **Scene feedback layer**: feedback messages in scene area for color apply, background change; palette strip overlay showing current harmony colors; selected-light context label with color dot.
- **Guided/Explore mode toggle**: mode switch in controls panel header; guided mode collapses Environment and Model groups; explore mode shows all controls expanded.
- **Control group collapsible sections**: control groups for palette, lights, environment, and model with expand/collapse via header click or keyboard.
- **Layout mode system**: body classes `layout-desktop-wide`, `layout-desktop-compact`, `layout-tablet`, `layout-mobile` set on resize.
- **Mission metadata**: `mission` and `completionMessage` fields added to all 8 lesson presets (ES/EN).
- **Evidence empty state**: "Your lab note will appear here…" shown before first observation; export/copy actions hidden until evidence exists.
- **Accessibility improvements**: aria-labelledby and aria-valuemin/max/now on all HSV sliders; aria-live on checklist progress, toast, completion summary; focus-visible outline consistency; contrast improvements for muted text; `body.sheet-open` inert on scene canvas behind mobile panels.
- **Design tokens**: `--surface-base`, `--surface-panel`, `--surface-control`, `--surface-floating`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--accent-learning`, `--accent-success`, `--state-active`, `--state-complete`, `--state-required`, `--touch-target`, `--z-scrim`, `--z-panel`, etc.

### Changed

- **Mobile panels**: `position: absolute` → `position: fixed` to prevent overflow/scroll width issues.
- **Mobile header**: prevents button wrapping with `flex-wrap: nowrap`; smaller icon/title on narrow screens.
- **Desktop controls panel layout**: mode toggle buttons added to header; collapsible control groups for Lights, Environment, Model.
- **Footer**: hidden on screens < 560px; compact on tablet; unchanged on desktop.
- **Landing page (index.html)**: scrim element, scene feedback container, palette strip, selected-light context label, control group wrappers with headers and chevrons.
- **Controls CSS**: new `.controls-header`, `.mode-btn`, `.mode-btn.active`, `.control-group`, `.control-group-header`, `.control-group-body`, `.selected-light-context`, `.scene-feedback`, `.palette-strip`.
- **Microcopy**: shorter, more contrastive labels for value/exposure distinction.
- **Test fix**: lessonProgress tests now mock localStorage for jsdom compatibility.

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
