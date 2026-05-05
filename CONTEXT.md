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
- CSS custom properties for theming
- Vite for build
- Vitest for tests
- localStorage for persistence
