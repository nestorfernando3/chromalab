# ChromaLab Domain Context

## Domain Terms

These terms name the core concepts of ChromaLab. Use them exactly in architecture discussions.

- **ChromaLab** — The interactive 3D color theory learning environment.
- **Student** — The primary user: a university student learning color theory, visual perception, lighting, design, media, or AV production.
- **Instructor** — Secondary user: uses ChromaLab as in-class demo or guided assignment tool.
- **Lesson** — A structured learning unit with a goal, observations, practice task, and expected output. Each Lesson maps to one Preset.
- **Preset** — The data object that defines a Lesson: metadata (name, category, difficulty), color theory parameters (baseHue, harmonyType, saturation, lightness), and the lights array for the 3D scene.
- **Mission** — A step-by-step checklist within a Lesson that guides the Student through specific actions. Currently not wired into the runtime.
- **Scene** — The Three.js 3D environment containing the Model, Background, Lights, and Room.
- **Light** — A Three.js light object (SpotLight, PointLight, RectAreaLight) with associated config, helper mesh, and drag interaction.
- **Model** — The 3D subject being lit (portrait head, marble bust, Nefertiti, croissant, rubber duck). Loaded from GLB/GLTF files.
- **Background** — The backdrop color, fog, and ground plane that set the scene's chromatic context.
- **Evidence** — Screenshots or exported artifacts that demonstrate Student learning. Currently limited to PNG screenshots.
- **Harmony** — A color relationship type: complementary, analogous, triadic, split-complementary, tetradic.
- **Sandbox** — The free-form Lesson ("Paleta Creativa") where Students can add, remove, and customize any Light.

## Surfaces

The UI is organized into three surfaces:

1. **Lab Surface** — 3D Scene, palette strip, scene feedback.
2. **Lesson Surface** — Mission, active step, observation, completion.
3. **Instrument Surface** — Controls for palette, light, background, model.

## Mental Model

> Mission → action → scene response → reflection → completion

## Product Principle

> The student should never wonder: "What am I supposed to do now?"

## Technology

- Three.js for 3D rendering
- Vanilla JS (ES modules)
- Canvas 2D for color wheel rendering
- CSS custom properties for theming
- Vite for build
- Vitest for tests
- localStorage for persistence

## Color Wheel Architecture

- **ColorWheel** — The Canvas 2D interactive chromatic wheel class (`src/colorWheel.js`, ~730 lines). Replaces the legacy SVG wheel (`src/diagram.js`). Renders a 360-segment conic gradient ring with harmony markers, draggable hue indicator, and center info panel.
- **renderDiagram** — Compatibility wrapper function exported from `colorWheel.js`. Maintains the exact same API as `diagram.js` for drop-in replacement. Called by `ui.js:_updateDiagram()`.
- **Canvas 2D** — The rendering surface. Uses OffscreenCanvas caching for the hue ring (no redraws on resize unless dimensions change). Render loop is lazy — only activates during drag, inertia, or explicit `updateIndicator()`.
- **Ring geometry** — Outer radius = 42% of `min(width, height)`, inner radius = 30%. Marker radius = 3.5%. Hue indicator sits at outerR + 8px.
- **Interaction model** — Pointer Events (unified mouse/touch/stylus) with `setPointerCapture` for reliable drag. Inertia calculated as exponential moving average of angular velocity × 0.92 friction per frame.
- **ResizeObserver** — Watches the `.diagram-container` for dimension changes. Expand handler on `.collapsible-trigger` fires `_resize()` with 50ms delay after section expansion.
- **Section state** — The diagram section starts collapsed (`aria-expanded="false"`). The ColorWheel is created on lesson load (even when collapsed) but deferred `_resize()` corrects dimensions on expand.
