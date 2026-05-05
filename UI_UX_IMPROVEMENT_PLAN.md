# ChromaLab World-Class UI/UX Implementation Plan

## Executive Summary

ChromaLab already has the hardest part of the product: an interactive 3D color-learning environment with lesson metadata, palette controls, progress tracking, evidence capture, bilingual copy, and a visual identity that fits the subject. The next leap is experience design. The app should stop feeling like a dense control console with lesson content attached and start feeling like a guided color laboratory where every action teaches something.

This plan proposes a modern redesign direction that preserves the current architecture and Three.js core while improving:

1. First-time comprehension.
2. Learning flow clarity.
3. Visual hierarchy.
4. Scene feedback.
5. Mobile and tablet usability.
6. Accessibility.
7. Evidence and completion experience.
8. Long-term maintainability of the UI system.

The recommended direction is not a marketing-style redesign. ChromaLab should remain an actual working tool. The target experience is a hybrid of guided classroom lab, creative lighting studio, and reflective notebook.

## Design Context

This section follows the `teach-impeccable` and `frontend-design` guidance. Because no `.impeccable.md` file currently exists in the project and no formal brand/audience answers were provided in this thread, this plan uses explicit assumptions derived from the project documentation and codebase. These assumptions should be confirmed later and saved into `.impeccable.md`.

### Assumed Users

Primary users:

- University students learning color theory, visual perception, lighting, design, media, or audiovisual production.
- Instructors who want to use ChromaLab as an in-class demonstration tool or guided assignment environment.

Secondary users:

- Self-directed learners exploring color theory.
- Designers or media students using the tool as a quick color-lighting sandbox.

### Primary Jobs To Be Done

Students need to:

1. Understand a color theory concept.
2. Manipulate color in a concrete 3D environment.
3. Observe the perceptual result.
4. Explain what changed.
5. Save or export evidence of learning.

Instructors need to:

1. Present concepts clearly.
2. Give students focused tasks.
3. Trust that completion means the student performed meaningful actions.
4. Review evidence when needed.

### Brand Personality

Recommended brand personality:

- Curious.
- Precise.
- Cinematic.

ChromaLab should feel like entering a serious but inviting visual laboratory: calm enough for learning, rich enough to inspire experimentation, and precise enough to support academic work.

### Aesthetic Direction

Recommended visual direction:

> Cinematic educational lab.

This means:

- Dark, focused environment.
- 3D scene as the center of gravity.
- Warm academic tone through typography and microcopy.
- Color used as an instructional material, not decoration.
- Controls that feel like a creative instrument, not a generic dashboard.
- Motion used to show cause and effect.

Avoid:

- Generic AI dashboard aesthetics.
- Neon cyberpunk color overload.
- Overuse of glassmorphism.
- Dense admin-panel visual language.
- Marketing hero layouts.
- Decorative effects that compete with the actual color experiment.

### Product Principle

The student should never wonder: "What am I supposed to do now?"

If they do wonder, the interface has failed, even if the underlying functionality works.

## Current Experience Diagnosis

### What Is Strong

The product is unusually promising because the interaction is not fake. Students can manipulate real color, light, background, and model variables in a 3D scene. The lesson metadata already contains goals, observation prompts, practice tasks, expected outputs, checklist criteria, and completion rules. This gives the redesign a strong semantic foundation.

The current visual direction also has useful raw material:

- Dark studio mood fits lighting and color.
- The 3D model gives the page a memorable center.
- Serif display typography adds academic personality.
- Bilingual support is already present.
- Lessons are content-rich and pedagogically intentional.

### What Is Holding It Back

The current UI has three competing centers:

1. The left lesson panel.
2. The central 3D scene.
3. The right control panel.

Each surface is valuable, but the product does not clearly orchestrate them. A first-time student must infer how the lesson text, checklist, HSV sliders, apply buttons, 3D scene, observation field, and progress state relate to one another.

The current product is functionally educational, but experientially it still feels closer to a technical control panel than a guided lab.

### Strategic UX Problem

ChromaLab needs a stronger lesson choreography.

The ideal flow is:

1. Set intention.
2. Manipulate one or two variables.
3. See immediate perceptual feedback.
4. Capture a reflection.
5. Confirm completion.
6. Move forward with momentum.

The UI should make that sequence visible.

## North-Star Experience

### The First 60 Seconds

A first-time student opens ChromaLab and sees:

- The 3D scene clearly.
- A short current lesson mission.
- A visible "Start experiment" or first required action.
- Only the controls needed for the first concept.
- A small preview of progress: not a wall of tasks.

They adjust hue, saturation, and value. The scene and palette respond immediately. The interface confirms what changed. The checklist updates in a way that feels rewarding, not bureaucratic. When they write their observation, the lesson completion state appears with a summary of the color they created.

### The Feeling

The product should feel like:

- "I am experimenting."
- "I can see what changed."
- "I know what the lesson wants from me."
- "My observation matters."
- "I made something worth saving."

It should not feel like:

- "I need to read every panel before touching anything."
- "I do not know which control matters."
- "The scene is just a background."
- "Completion is a formality."
- "Mobile is a squeezed version of desktop."

## Experience Architecture

### Proposed Surface Model

ChromaLab should be organized around three surfaces:

1. **Lab Surface**: the 3D scene, selected object context, palette strip, and scene feedback.
2. **Lesson Surface**: mission, active step, observation prompts, completion summary.
3. **Instrument Surface**: controls for palette, light, background, model, and advanced exploration.

Desktop can show all three surfaces at once, but they must not have equal visual weight.

Tablet should show the lab plus one supporting surface.

Mobile should show one primary surface at a time, with fast switching.

### Recommended Information Hierarchy

Top priority:

- Current lesson mission.
- Active required step.
- 3D scene feedback.
- Relevant controls for the active step.

Second priority:

- Observation/evidence.
- Progress.
- Palette preview.
- Selected light.

Third priority:

- Model selection.
- Background presets.
- Export actions.
- Full lesson details.
- Footer/credits.

### New Mental Model

Replace the implicit mental model:

> Read panel -> adjust controls -> maybe observe scene -> fill checklist.

With:

> Mission -> action -> scene response -> reflection -> completion.

This mental model should guide layout, copy, component states, and QA.

## Proposed UI Structure

### Desktop Layout

Recommended desktop layout:

- Header: compact product identity, lesson mode, language, utility actions.
- Left rail: lesson mission and guided steps.
- Center: 3D lab scene, palette strip, selected-light context, scene feedback.
- Right rail: instrument controls grouped by relevance.
- Bottom: lesson navigation and completion state, not persistent institutional footer content.

The current three-column shell can remain, but visual priority should shift:

- Center scene should feel dominant.
- Left lesson panel should become a guided mission panel.
- Right controls should become contextual instruments.

### Tablet Layout

Recommended tablet behavior:

- Scene remains primary.
- One drawer or side sheet open at a time.
- Lesson and controls use segmented toggles.
- Panel width should be content-driven, not simply `80vw`.
- Footer content should collapse into About/Help.

Tablet portrait should behave closer to mobile.

Tablet landscape may behave closer to desktop with one persistent side panel.

### Mobile Layout

Recommended mobile behavior:

- Scene-first default.
- Bottom navigation or segmented switch: `Lab`, `Lesson`, `Controls`, `Evidence`.
- Panels behave as bottom sheets or full-height drawers.
- No side-by-side panels.
- No horizontal overflow.
- Touch targets at least 44px.
- Primary actions stay in thumb-friendly zones.

Mobile should not hide core functionality. It should sequence it.

## Key UX Upgrades

## Upgrade 1: Guided Mission System

### Problem

The lesson content is pedagogically strong, but the interface does not convert it into a clear active workflow.

### Solution

Create a mission component that becomes the learning command center.

### Component: `LessonMission`

Purpose:

- Summarize the lesson objective.
- Show the active step.
- Explain why the step matters.
- Provide a direct link to the relevant control.

Suggested structure:

```text
Lesson 1
Matiz, Saturación y Valor

Mission
Create an ocean-like color by adjusting hue, saturation, and value.

Now
Move all three HSV sliders and watch how the model changes.

[Show controls]
```

### Data Requirements

Add optional fields to lesson presets:

```js
mission: {
  es: 'Crea un color que evoque el océano usando matiz, saturación y valor.',
  en: 'Create an ocean-like color using hue, saturation, and value.'
},
stepGuidance: {
  'adjust-hue': {
    target: 'hue-slider',
    help: {
      es: 'El matiz cambia la familia del color.',
      en: 'Hue changes the color family.'
    }
  }
}
```

This can be introduced progressively. The existing checklist can remain the source of truth while richer guidance is added lesson by lesson.

### Implementation Tasks

1. Create `src/ui/LessonMission.js`.
2. Add a mission container to `index.html` or render it inside the existing lesson panel.
3. Derive the active step from incomplete required checklist criteria.
4. Add step-to-control target mapping.
5. Emit `lesson:activeStepChanged`.
6. Highlight the corresponding control group.
7. Add copy fallback for lessons without explicit mission metadata.

### Acceptance Criteria

- The active step is visible without scrolling.
- Lesson 1 can be understood within five seconds.
- Every required step has a readable label and a next action.
- Completed steps visually compress instead of occupying equal attention.

## Upgrade 2: Contextual Instrument Panel

### Problem

The right controls panel exposes too many controls at equal weight. This works for exploration, but it weakens guided learning.

### Solution

Turn the controls panel into an instrument panel with progressive disclosure:

1. Palette controls.
2. Apply controls.
3. Selected light controls.
4. Environment controls.
5. Model controls.
6. Advanced sandbox controls.

### Recommended Control Modes

#### Guided Mode

Default for lessons.

Shows:

- Current relevant controls.
- Secondary controls collapsed.
- Active step highlight.
- Short explanatory microcopy.

#### Explore Mode

Optional mode for free experimentation.

Shows:

- Full palette controls.
- All light controls.
- Background and model controls.
- Sandbox tools.

### Component Changes

Existing components to update:

- `src/ui/PaletteControls.js`
- `src/ui/HarmonyControls.js`
- `src/ui/LightControls.js`
- `src/ui/SandboxManager.js`

Recommended additions:

- `InstrumentPanel` controller for grouping and disclosure state.
- `ControlGroup` CSS pattern with active, collapsed, disabled, and highlighted states.

### Microcopy Improvements

Current:

```text
Valor: claridad del color. Exposición: brillo global de la cámara.
```

Recommended:

```text
Valor changes the color itself. Exposure changes the whole scene.
```

Spanish:

```text
Valor cambia el color. Exposición cambia toda la escena.
```

This is shorter, more contrastive, and easier to apply.

### Acceptance Criteria

- A first-time user knows which controls matter for the current step.
- Advanced controls remain available but are visually secondary.
- Apply buttons clearly state what target will change.
- Control groups do not shift layout unexpectedly when highlighted.

## Upgrade 3: Scene Feedback Layer

### Problem

The scene is beautiful but quiet. Students manipulate values, but feedback is mostly in controls and checklist state.

### Solution

Add a scene feedback layer that makes cause and effect visible.

### Component: `SceneFeedback`

Elements:

- Selected light label.
- Temporary apply confirmation.
- Palette strip.
- Current target indicator.
- Optional before/after comparison in later versions.

Example messages:

- `Cian aplicado a Luz Principal.`
- `Fondo actualizado. Observa cómo cambia el contraste.`
- `Paso completado: Cambiar el valor.`

### Visual Behavior

- Feedback appears near the relevant region of the scene.
- It fades after a short delay but remains available in a status log or aria-live region.
- It should not block camera controls.
- Reduced motion should use opacity only or static state changes.

### Implementation Tasks

1. Add a `scene-feedback` container inside `.scene-area`.
2. Add event listeners for:
   - `palette:applied`
   - `background:changed`
   - `light:colorChanged`
   - `light:intensityChanged`
   - `lesson:criteriaCompleted`
3. Map event payloads to localized messages.
4. Add `aria-live="polite"`.
5. Add visual styles for scene feedback and palette strip.

### Acceptance Criteria

- Every major action produces visible feedback within 100ms.
- Feedback is understandable without reading the control panel.
- Screen reader users receive equivalent status updates.

## Upgrade 4: Modern Responsive System

### Problem

The current mobile/tablet layout uses off-canvas panels that still produce measurable layout problems. At mobile width, the page can become wider than the viewport, and header controls wrap into a cramped stack.

### Solution

Create a responsive shell with explicit layout modes.

### Layout Modes

#### `desktop-wide`

Breakpoint: 1200px and above.

Behavior:

- Lesson panel persistent.
- Scene persistent.
- Controls panel persistent.
- Footer minimized.

#### `desktop-compact`

Breakpoint: 961px to 1199px.

Behavior:

- Scene persistent.
- Lesson panel persistent or collapsible.
- Controls panel collapsible.
- Wider scene priority.

#### `tablet`

Breakpoint: 768px to 960px.

Behavior:

- Scene primary.
- One side sheet open at a time.
- Segmented controls for Lesson and Controls.
- No persistent footer.

#### `mobile`

Breakpoint: 320px to 767px.

Behavior:

- Scene-first.
- Bottom navigation: Lab, Lesson, Controls, Evidence.
- Panels become bottom sheets or full-screen sheets.
- No horizontal overflow.

### CSS Strategy

Use:

- CSS custom properties for shell dimensions.
- Content-aware breakpoints where possible.
- Container queries for control groups when introduced.
- `overflow-x: clip` or `hidden` on root shell.
- `position: fixed` for mobile sheets to avoid layout width expansion.

Avoid:

- Mobile panels transformed outside the viewport while still affecting scroll width.
- Header wrapping as an accidental responsive strategy.
- Fixed footer competing with mobile actions.

### Implementation Tasks

1. Add root layout state classes, for example:
   - `.layout-desktop`
   - `.layout-tablet`
   - `.layout-mobile`
2. Replace mobile panel behavior with a sheet model.
3. Add a scrim element:
   - `.app-scrim`
4. Update `UI._setMobilePanel` to:
   - close inactive panels,
   - set body state,
   - manage focus,
   - close on scrim click,
   - close on Escape.
5. Rework mobile header and navigation.
6. Move footer credits into Help/About on mobile.

### Acceptance Criteria

- `document.documentElement.scrollWidth <= window.innerWidth` at 320, 390, 768, and 834px widths.
- Header controls never overlap.
- Only one mobile sheet is active at a time.
- Opening a sheet does not move the scene unexpectedly.
- All sheet controls remain reachable by keyboard and touch.

## Upgrade 5: Accessibility and Inclusive Design

### Problem

Several controls are too small for touch, some generated inputs are not explicitly labeled, and some muted text contrast is low.

### Target Standard

Aim for WCAG 2.2 AA for the primary flow.

### Touch Target Requirements

Minimum target size:

- 44px by 44px for touch surfaces.
- 40px acceptable only for dense desktop controls with a larger invisible hit area.

Controls needing attention:

- Language buttons.
- Help button.
- Screenshot button.
- Floating tip close.
- Lesson dots.
- Background swatches.
- Color input.
- Light selector pills.
- Model cards.
- Slider thumbs and track hit areas.

### Labeling Requirements

Every interactive control should have a meaningful accessible name.

Add or improve labels for:

- HSV sliders.
- Harmony select.
- Exposure slider.
- Student observation textarea.
- Background color input.
- Background swatches.
- Model buttons.
- Lesson dots.
- Panel toggles.

### Keyboard Requirements

The user should be able to:

1. Start the lab.
2. Navigate to lesson controls.
3. Adjust HSV values.
4. Apply color.
5. Write an observation.
6. Move to the next lesson.

Without using a mouse.

### Contrast Requirements

Recommended token adjustments:

- Increase contrast for `--text-muted`.
- Avoid brand red for tiny text unless contrast is sufficient.
- Use selected-state borders plus icons/text, not color alone.
- Ensure required/completed states have text labels.

### Implementation Tasks

1. Add explicit `label` elements or `aria-labelledby` to generated controls.
2. Add visually hidden utility class.
3. Add touch target CSS utilities.
4. Improve focus state consistency.
5. Add `aria-live` regions for save/apply/completion status.
6. Audit contrast tokens.

### Acceptance Criteria

- Lighthouse accessibility score target: 95+.
- Keyboard-only lesson 1 completion works.
- No focusable hidden off-canvas controls.
- Screen reader announces major status changes.
- No state is communicated by color alone.

## Upgrade 6: Evidence and Completion Experience

### Problem

Evidence capture works, but it feels like a form at the bottom of the panel. Completion is useful but not emotionally satisfying.

### Solution

Treat evidence as the student's lab note.

### Component: `EvidenceNotebook`

Purpose:

- Capture observations.
- Show current palette.
- Show saved state.
- Let students export only when meaningful evidence exists.

### Component: `LessonCompletionSummary`

Appears when required criteria are complete.

Suggested content:

```text
Lesson complete
You created an ocean-like cyan and applied it to the scene.

Saved evidence:
- Palette
- Observation
- Scene state

[Next lesson] [Export evidence]
```

### Behavior

Before evidence:

- Show prompt and empty state.
- Keep export/copy subdued or hidden.

During writing:

- Show `Saving...`.

After save:

- Show `Saved locally`.
- Update completion if criteria are met.

After completion:

- Promote next lesson and evidence export.

### Implementation Tasks

1. Extend `StudentResponse` into a richer evidence component.
2. Move export/copy actions into evidence-ready and completion states.
3. Add palette preview to completion summary.
4. Add screenshot reminder for lessons that require or benefit from it.
5. Persist any new metadata through `EvidenceStore`.

### Acceptance Criteria

- Export actions are not prominent when there is nothing to export.
- Completion state clearly tells the student what they accomplished.
- Saved status is visible and announced accessibly.

## Upgrade 7: Visual System Modernization

### Problem

The visual style is coherent but too many elements share the same weight. Cards, pills, labels, panels, and buttons compete. The result is polished but dense.

### Solution

Develop a clearer design system with stronger hierarchy and fewer repeated container patterns.

### Token Strategy

Introduce or refine tokens for:

- Surface levels.
- Text levels.
- Accent roles.
- Semantic states.
- Spacing scale.
- Motion durations.
- Touch target sizes.
- Panel widths.
- Z-index layers.

Recommended semantic tokens:

```css
--surface-base
--surface-panel
--surface-control
--surface-floating
--text-primary
--text-secondary
--text-tertiary
--accent-learning
--accent-danger
--accent-success
--state-active
--state-complete
--state-required
```

### Typography Direction

The current `Source Serif 4` gives personality. Keep the academic warmth, but reduce density.

Recommended approach:

- Use display serif for product name and lesson titles.
- Use sans body for controls and instructional UI.
- Increase body size for instructional text.
- Reduce overuse of uppercase labels.
- Use sentence-case labels where readability matters.

### Color Direction

Keep the cinematic dark lab, but make color educational.

Recommended color use:

- Red: brand identity, active state, critical required signals.
- Green: completion only.
- Palette colors: actual learning material.
- Neutrals: slightly tinted, not pure gray.

Avoid:

- Red on every active/selected object.
- Tiny low-contrast uppercase labels.
- Decorative gradients that compete with color theory content.

### Component Hierarchy

Primary visual elements:

- 3D scene.
- Current mission.
- Active control group.
- Completion summary.

Secondary visual elements:

- Lesson details.
- Checklist history.
- Palette preview.
- Evidence notebook.

Tertiary visual elements:

- Footer credits.
- Model selector.
- Advanced sandbox controls.

### Implementation Tasks

1. Refactor CSS tokens at the top of `style.css`.
2. Create reusable classes for:
   - `.control-group`
   - `.mission-card`
   - `.scene-feedback`
   - `.sheet`
   - `.state-chip`
   - `.touch-target`
3. Reduce unnecessary card borders in lesson content.
4. Make active and completed states more semantically distinct.
5. Rebalance typography and spacing.

### Acceptance Criteria

- The page has one clear visual focal point per mode.
- Instructional text is easier to read.
- The UI feels like a designed lab, not a generic dashboard.
- Color is used to teach and confirm, not decorate.

## Upgrade 8: Motion and Microinteractions

### Problem

The interface has transitions, but motion does not yet tell a strong cause-and-effect story.

### Solution

Use motion only where it improves understanding.

### Recommended Motion Moments

1. Panel/sheet open and close.
2. Active step changes.
3. Control group highlight.
4. Palette applied to scene.
5. Checklist criterion completed.
6. Lesson completion summary appears.

### Motion Rules

- Use transform and opacity.
- Avoid layout animation.
- Keep durations between 120ms and 280ms.
- Use ease-out curves.
- Respect `prefers-reduced-motion`.

### Examples

When a palette is applied:

- Apply button gives immediate pressed state.
- Scene feedback appears.
- Palette strip briefly highlights.
- Checklist step completes.

This sequence makes the causal chain understandable.

### Acceptance Criteria

- Motion reinforces state change.
- Reduced motion users receive equivalent static feedback.
- No animation delays the primary flow.

## Implementation Roadmap

## Milestone 0: Design Context and Baseline

### Goal

Capture the design assumptions and baseline UX defects before code changes.

### Tasks

1. Create `.impeccable.md` with confirmed design context.
2. Save screenshots for desktop, tablet, and mobile.
3. Record current layout metrics:
   - scroll width,
   - visible controls,
   - panel behavior,
   - focus order.
4. Add a short baseline QA note to project docs.

### Deliverables

- `.impeccable.md`
- Baseline screenshots.
- Baseline responsive/accessibility notes.

### Acceptance Criteria

- Future design work has documented audience, tone, and principles.
- The team can compare before/after changes.

## Milestone 1: Responsive Shell Stabilization

### Goal

Fix the most visible usability breakage.

### Scope

- Mobile/tablet overflow.
- Header reflow.
- Drawer/sheet model.
- Scrim and Escape behavior.
- Touch target minimums for global controls.

### Detailed Tasks

1. Add `.app-scrim` to `index.html`.
2. Update mobile CSS to use fixed sheets.
3. Add root state class when a sheet is open.
4. Update `_setMobilePanel` in `src/ui.js`.
5. Close sheets on:
   - Escape,
   - scrim click,
   - mode switch,
   - lesson navigation where appropriate.
6. Move mobile utilities into a compact menu or stable toolbar.
7. Remove persistent mobile footer or collapse it into Help/About.

### QA

Test:

- 320px.
- 390px.
- 768px.
- 834px.
- 1024px.

Pass conditions:

- No horizontal scroll.
- No header overlap.
- One active sheet maximum.
- Panels are keyboard-reachable.

## Milestone 2: Lesson Mission and Active Step

### Goal

Make the current learning task obvious.

### Scope

- `LessonMission` component.
- Active required step logic.
- Checklist compression.
- Control target mapping.

### Detailed Tasks

1. Build `src/ui/LessonMission.js`.
2. Render it near the top of the lesson panel.
3. Compute active step from checklist/evidence state.
4. Add `stepTargets` mapping for lesson 1.
5. Add highlight behavior for:
   - hue slider,
   - saturation slider,
   - value slider,
   - apply buttons,
   - response textarea.
6. Rework checklist presentation:
   - active step,
   - completed steps,
   - optional steps.

### QA

Pass conditions:

- Lesson 1 gives a clear next action in under five seconds.
- Checklist updates feel connected to student actions.
- The user can find the relevant control without scanning the whole UI.

## Milestone 3: Scene Feedback and Palette Strip

### Goal

Make the 3D scene speak.

### Scope

- Scene feedback component.
- Palette strip.
- Selected-light context.
- Status messages tied to app events.

### Detailed Tasks

1. Add scene feedback container.
2. Add event-to-message mapper.
3. Add `aria-live` status region.
4. Add current palette strip.
5. Improve selected light display.
6. Add "what changed" messages for lesson-relevant actions.

### QA

Pass conditions:

- Applying palette produces visible and announced feedback.
- Changing background produces visible and announced feedback.
- Selected light is clear in both scene and controls.

## Milestone 4: Instrument Panel Modernization

### Goal

Make controls contextual, readable, and less overwhelming.

### Scope

- Guided mode.
- Explore mode.
- Control group hierarchy.
- Improved labels and microcopy.

### Detailed Tasks

1. Add control group wrappers.
2. Add active/collapsed group states.
3. Promote lesson-relevant controls.
4. Add optional advanced sections.
5. Update palette microcopy.
6. Make apply buttons target-specific.

### QA

Pass conditions:

- Guided mode does not show all controls at equal priority.
- Explore mode still gives full creative control.
- The active lesson step and active controls are visually connected.

## Milestone 5: Evidence Notebook and Completion

### Goal

Make evidence and completion meaningful.

### Scope

- Evidence empty state.
- Saved state.
- Completion summary.
- Export/copy timing.

### Detailed Tasks

1. Update `StudentResponse`.
2. Add completion summary component.
3. Move export/copy into evidence-ready states.
4. Add palette and observation summary.
5. Add next lesson primary action.

### QA

Pass conditions:

- Export is not prominent before evidence exists.
- Completion summary appears when required criteria are complete.
- Student understands what they accomplished.

## Milestone 6: Accessibility and Design System Polish

### Goal

Bring the experience to a professional quality bar.

### Scope

- Labels.
- Focus states.
- Contrast.
- Touch targets.
- Reduced motion.
- Token cleanup.

### Detailed Tasks

1. Add accessible names to generated controls.
2. Add visually hidden labels where necessary.
3. Increase touch target sizes.
4. Audit color contrast.
5. Add keyboard QA fixes.
6. Refactor design tokens.
7. Add reduced motion coverage for new interactions.

### QA

Pass conditions:

- Keyboard-only completion works.
- Screen reader labels are meaningful.
- Lighthouse accessibility target: 95+.
- No state is color-only.

## Milestone 7: Final Visual QA and Release Notes

### Goal

Validate the redesigned experience as a cohesive product.

### Scope

- Full responsive QA.
- Visual review.
- Regression test.
- Documentation update.

### Detailed Tasks

1. Capture before/after screenshots.
2. Run unit tests.
3. Run build.
4. Perform mobile/tablet/desktop manual QA.
5. Update README if user-facing behavior changed.
6. Update changelog.

### Pass Conditions

- Build succeeds.
- Tests pass.
- No obvious layout breakage.
- Lesson 1 is intuitive on desktop and mobile.
- The interface feels like one product.

## File-Level Implementation Map

### `index.html`

Expected changes:

- Add mission mount if needed.
- Add scene feedback container.
- Add mobile sheet/scrim structure.
- Add accessible labels for static controls.
- Consider replacing persistent footer behavior on mobile.

### `style.css`

Expected changes:

- Token modernization.
- Responsive shell rewrite.
- Sheet/drawer system.
- Touch target sizing.
- Mission component styles.
- Scene feedback styles.
- Palette strip styles.
- Completion summary styles.
- Contrast improvements.
- Reduced motion refinements.

### `src/ui.js`

Expected changes:

- Layout mode handling.
- Sheet open/close behavior.
- Focus management.
- Event routing for feedback.
- Active step coordination.
- Mobile state cleanup.

### `src/ui/LessonChecklist.js`

Expected changes:

- Active step rendering.
- Required/optional grouping.
- Completed step compression.
- Completion summary trigger.

### `src/ui/PaletteControls.js`

Expected changes:

- Step target attributes.
- Better labels.
- Target-specific apply copy.
- Apply feedback events.
- Guided/explore display modes.

### `src/ui/LightControls.js`

Expected changes:

- Selected-light feedback.
- Improved labels.
- Touch target improvements.
- Scene feedback events.

### `src/ui/StudentResponse.js`

Expected changes:

- Accessible textarea labeling.
- Evidence empty state.
- Evidence-ready actions.
- Save status announcements.
- Completion summary integration.

### `src/presets.js`

Expected changes:

- Optional mission metadata.
- Step guidance metadata.
- Control target mapping.
- Lesson-specific completion messages.

### `src/localization.js`

Expected changes:

- Mission labels.
- Active step labels.
- Scene feedback messages.
- Evidence states.
- Completion summary copy.
- Mobile navigation labels.

### Tests

Expected additions:

- Active step derivation.
- Lesson mission rendering.
- Evidence-ready behavior.
- Mobile drawer state.
- Accessibility label smoke tests.

## Modern UX Specifications

### State Model

The UI should track:

- Current lesson.
- Active required step.
- Completed criteria.
- Current surface: lab, lesson, controls, evidence.
- Active mobile sheet.
- Selected light.
- Current palette.
- Evidence readiness.
- Completion status.

### Events

Recommended UI events:

```text
lesson:activeStepChanged
lesson:missionViewed
lesson:stepHelpRequested
ui:surfaceChanged
ui:sheetOpened
ui:sheetClosed
scene:feedbackShown
evidence:ready
evidence:exported
```

These do not all need analytics immediately. They clarify the architecture and make future telemetry possible.

### Empty States

Controls should not silently look inactive.

Examples:

- No selected light:
  - `Select a light in the scene or from the list to edit it.`
- No evidence:
  - `Your lab note will appear here after you write an observation.`
- No screenshot:
  - `Take a screenshot after completing the scene if your instructor asks for visual evidence.`

### Error States

Potential user-facing errors:

- Screenshot failed.
- Clipboard copy failed.
- Evidence export unavailable.
- Model failed to load.
- Local storage unavailable.

Each should:

- Explain what happened.
- Tell the user what they can do.
- Preserve their work.

## QA Matrix

### Desktop

Test:

- 1440x900.
- 1920x1080.
- 1280x720.

Check:

- Scene remains dominant.
- Panels do not crowd the scene.
- Active step is visible.
- Controls are readable.

### Tablet

Test:

- 768x1024 portrait.
- 834x1112 portrait.
- 1024x768 landscape.

Check:

- One supporting sheet at a time.
- No horizontal overflow.
- Touch targets comfortable.
- Scene remains usable.

### Mobile

Test:

- 320x568.
- 360x800.
- 390x844.
- 430x932.

Check:

- Header does not overlap.
- Bottom navigation or segmented control remains reachable.
- Sheets do not trap focus.
- No horizontal overflow.
- Lesson 1 can be completed.

### Accessibility

Check:

- Keyboard-only flow.
- Screen reader labels.
- Focus order.
- Focus visibility.
- Contrast.
- Reduced motion.
- Touch target size.
- Color-independent states.

### Performance

Check:

- Initial load with 3D model.
- Panel animation smoothness.
- No layout thrashing during slider input.
- Scene feedback does not trigger expensive rerenders.

## Measurement Plan

### UX Success Metrics

Qualitative:

- New user can explain the first task after five seconds.
- Student can complete lesson 1 without instructor intervention.
- Student can describe what changed after applying color.
- Mobile users do not need horizontal scrolling.

Quantitative:

- Time to first meaningful interaction: under 15 seconds.
- Time to complete lesson 1: under 3 minutes for a first-time user.
- Mobile horizontal overflow: 0px.
- Keyboard-only completion: pass.
- Lighthouse accessibility: 95+.

### Product Quality Scorecard

Use this after implementation:

| Dimension | Target |
|---|---:|
| First-time clarity | 9/10 |
| Visual hierarchy | 9/10 |
| Scene feedback | 9/10 |
| Mobile usability | 9/10 |
| Accessibility | 9/10 |
| Educational completion | 9/10 |
| Visual distinctiveness | 8/10 |
| Technical maintainability | 8/10 |

## Recommended First Pull Request

The first PR should be narrow and high-impact:

### PR 1: Responsive Shell and Mobile Sheet System

Files:

- `index.html`
- `style.css`
- `src/ui.js`
- `src/localization.js` if labels change

Scope:

- Add scrim.
- Fix horizontal overflow.
- Stabilize mobile header.
- Ensure one active sheet.
- Add Escape and scrim close.
- Increase global touch targets.

Why first:

- It fixes the most visible usability issue.
- It reduces layout risk for all future work.
- It creates the shell needed for mission, evidence, and controls work.

Acceptance:

- No horizontal overflow at 320, 390, 768, 834px.
- Header does not wrap awkwardly.
- Lesson and controls panels behave predictably.
- Existing desktop behavior remains intact.

## Recommended Second Pull Request

### PR 2: Lesson Mission and Active Step System

Files:

- `src/ui/LessonMission.js`
- `src/ui/LessonChecklist.js`
- `src/ui.js`
- `src/presets.js`
- `src/localization.js`
- `style.css`

Scope:

- Add mission UI.
- Derive active step.
- Rework checklist display.
- Highlight relevant control.

Acceptance:

- Lesson 1 has a visible active task.
- Completed steps compress.
- Required and optional steps are clearly distinguished.
- Relevant controls can be highlighted.

## Recommended Third Pull Request

### PR 3: Scene Feedback and Evidence Completion

Files:

- `index.html`
- `style.css`
- `src/ui.js`
- `src/ui/PaletteControls.js`
- `src/ui/LightControls.js`
- `src/ui/StudentResponse.js`
- `src/localization.js`

Scope:

- Scene feedback layer.
- Palette strip.
- Improved selected light feedback.
- Evidence-ready states.
- Completion summary.

Acceptance:

- Applying color creates immediate feedback.
- Completion feels visible and meaningful.
- Evidence actions appear at the right time.

## Final Definition of World-Class

ChromaLab reaches a world-class UI/UX standard when the interface disappears into the learning loop:

1. The student knows the goal.
2. The student manipulates color.
3. The scene responds clearly.
4. The student reflects.
5. The product confirms progress.
6. The student feels they discovered something.

The technology should feel impressive, but the learning should feel effortless.

## Immediate Next Step

Start with the responsive shell stabilization PR. It is the structural foundation for everything else and will immediately improve the experience on the devices where the current UI has the most visible friction.
