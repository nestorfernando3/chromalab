# ChromaLab — UX Gap Closure Plan

**Style principle:** Preserve Lighting Studio cinematic dark lab aesthetic. No visual redesign — fill gaps only.

---

## What's Already Done ✅

| Feature | Status |
|---|---|
| Mobile sheet system (fixed + translateY) | ✅ |
| Scrim element + CSS (.visible/.hidden) | ✅ chromalab-compat.css |
| Touch targets 44-48px | ✅ responsive.css |
| Scene feedback + aria-live | ✅ wired in ui.js:549, styled in chromalab-compat.css:357 |
| Active step logic + highlighting | ✅ LessonMission.js |
| Completion modal | ✅ LessonCompletionModal.js |
| Escape key for drawers/modals | ✅ ui.js:784 |
| Multiple aria-live regions | ✅ index.html |
| Reduced-motion support | ✅ responsive.css:149 |

---

## Phase 1: Responsive Hardening (P0)

**Goal:** No horizontal overflow at any viewport. Panels keyboard-closable.

### 1.1 Add overflow-x containment
```
File: src/css/responsive.css
- Add `html, body { overflow-x: hidden; }` at 900px breakpoint
- Add `overflow-x: hidden` to .controls-panel, .teach-panel mobile rules
- Ensure scene-feedback stays within viewport with max-width: calc(100vw - 32px)
```

### 1.2 Sub-500px media query
```
File: src/css/responsive.css
- Add @media (max-width: 500px) block
- Reduce header title font-size
- Collapse icon buttons to 40px if needed
- Ensure teach-panel height ≤ 55vh
```

### 1.3 Mobile panel Escape close
```
File: src/ui.js
- In global Escape handler: also close .controls-panel (set collapsed),
  close .teach-panel (if open as sheet on mobile)
- Add `_closeAllMobilePanels()` method
```

### Acceptance
- `document.documentElement.scrollWidth <= window.innerWidth` at 320, 375, 390, 414, 768, 834px
- Escape closes any open mobile sheet
- Panels don't cause horizontal scroll

---

## Phase 2: Keyboard & Accessibility (P1)

**Goal:** Keyboard-only lesson 1 completion. Focus traps. Screen-reader labels.

### 2.1 Visually-hidden utility
```
File: src/css/utilities.css
- Add .visually-hidden (or .sr-only) class:
  clip: rect(0,0,0,0); position: absolute; width: 1px; height: 1px;
  margin: -1px; overflow: hidden; white-space: nowrap;
```

### 2.2 Skip link
```
File: index.html
- Add skip-link as first focusable element:
  <a href="#lesson-panel" class="skip-link visually-hidden:focusable">Saltar al contenido</a>
File: src/css/chromalab-compat.css
- Style .skip-link:focus to become visible
```

### 2.3 Focus trap for modals
```
File: src/ui/CurriculumDrawer.js — add _trapFocus(), _restoreFocus()
File: src/ui/LessonCompletionModal.js — add _trapFocus(), _restoreFocus()
  - Store document.activeElement on open
  - Trap Tab/Shift+Tab within modal container
  - Restore focus on close
```

### 2.4 Keyboard handlers on control-group-header
```
File: src/ui.js (where control headers are rendered)
  - Add Enter/Space keydown → toggle group expansion
  - Already have role="button" tabindex="0" in HTML (index.html:240+)
```

### 2.5 Label associations for harmony select
```
File: src/ui/PaletteControls.js
  - Wrap harmony select in <label> or add aria-labelledby pointing to label span
File: src/ui/LightControls.js
  - Same for color inputs if missing
```

### 2.6 Keyboard handlers for sandbox add-buttons
```
File: src/ui/SandboxManager.js
  - Ensure add-light buttons are <button> elements (not divs with onclick)
  - If divs: add role="button" tabindex="0" + Enter/Space keydown
```

### 2.7 Aria labels on icon-only buttons
```
File: src/ui.js
  - Add aria-label to: language toggle, help button, screenshot button,
    panel toggle buttons, close buttons
  - Use localization keys: copy.accessibility or similar
```

### Acceptance
- Keyboard-only: tab through all controls, complete lesson 1
- Focus visible ring on all interactive elements
- Screen reader announces: "Color aplicado a la escena", "Paso completado", etc.
- Modals trap focus when open

---

## Phase 3: Mobile Bottom Navigation (P2)

**Goal:** Mobile users can switch between surfaces without hunting for controls.

### 3.1 Bottom nav bar
```
File: index.html
  - Add <nav class="mobile-bottom-nav" aria-label="Superficies">
    - <button data-surface="lab" aria-current="page">🎨 Lab</button>
    - <button data-surface="lesson" aria-current="false">📋 Lección</button>
    - <button data-surface="controls" aria-current="false">🎛️ Controles</button>
    - <button data-surface="evidence" aria-current="false">📸 Evidencia</button>

File: src/css/responsive.css
  - @media (max-width: 900px):
    .mobile-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0;
      z-index: 300; height: 56px; background: var(--glass-bg); border-top: 1px solid var(--glass-border-subtle); }
    Add safe-area-inset-bottom padding
    Existing panels get padding-bottom: 56px to avoid overlap

File: src/ui.js
  - _onBottomNavClick(surface) → open corresponding sheet, update aria-current
  - _setupBottomNav() in init
```

### 3.2 Header reflow for mobile bottom nav
```
File: src/css/responsive.css
  - At ≤900px: header becomes minimal (title only)
  - Move panel toggles INTO bottom nav bar (remove from header)
  - Keep language/help/screenshot in header as compact icon row
```

### Acceptance
- Bottom nav visible at ≤900px
- Only one surface active at a time
- Switching surfaces closes previous sheet
- Works with iPhone safe areas

---

## Phase 4: Evidence States & Completion Polish (P2)

**Goal:** Clear empty/saving/saved/completed states for student evidence.

### 4.1 StudentResponse state machine
```
File: src/ui/StudentResponse.js
  States: empty → dirty → saving → saved → completed
  - empty: "Escribe tu observación sobre lo que descubriste"
  - dirty: textarea active, no save indicator
  - saving: pulse animation on save indicator
  - saved: "Guardado localmente" + timestamp
  - completed: checkmark + "Lección completada" (via lesson:completionChanged event)

  Add aria-live="polite" to save status element
  Export/copy buttons visible only in saved/completed states
```

### 4.2 CompletionModal content richness
```
File: src/ui/LessonCompletionModal.js
  - Show: palette swatches used, observation preview, screenshot reminder
  - Show "¿Qué sigue?" with next lesson title
  - Existing modal already has burst + buttons — enhance, don't replace
```

### 4.3 LessonChecklist / LessonMission active-step sync
```
File: src/ui/LessonMission.js
  - Read active step from same source as LessonChecklist
  - Currently both compute separately — reconcile to use shared state from
    LessonProgressEngine or UI.activeStepId
```

### Acceptance
- Empty state is informative, not broken-looking
- Save feedback visible and announced
- Completion shows student's actual work summary

---

## Phase 5: Guided / Explore Mode Toggle (P2)

**Goal:** Lessons hide irrelevant controls. Explore mode shows everything.

### 5.1 Mode state
```
File: src/ui.js
  - Add _controlMode: 'guided' | 'explore'
  - Default: 'guided' for lessons, 'explore' for sandbox
  - Persist in session (not localStorage by default)

File: index.html
  - Add toggle button in controls panel header:
    <button id="mode-toggle" aria-pressed="false">Explorar</button>
```

### 5.2 Control visibility by mode
```
File: src/ui.js
  - In guided mode: show only controls matching active lesson's learningControls
  - In explore mode: show all PaletteControls + LightControls + SandboxManager
  - Add .control-group.guided-only / .control-group.explore-only CSS classes

File: src/css/controls-panel.css
  - .control-group.collapsed-in-guided → hide in guided mode
  - Smooth transition when toggling
```

### Acceptance
- Lesson 1 in guided mode shows only hue, saturation, value sliders + apply buttons
- Explore mode shows all controls
- Mode toggle is discoverable but not distracting

---

## Phase 6: Microcopy & Polish (P3)

**Goal:** No confusing labels. Contextual clarity.

### 6.1 Value vs Exposure distinction
```
File: src/localization.js
  - "Valor" slider label → "Valor (HSV): claridad del color"
  - "Exposición" slider → "Exposición: brillo global de la escena"
  - Already partially done — verify both ES/EN
```

### 6.2 Apply button copy
```
File: src/ui/PaletteControls.js
  - Apply to light: "Aplicar a luz principal" → "Aplicar a [light name]"
  - Apply to background: keep "Aplicar al fondo"
```

### 6.3 Empty state messages
```
File: src/localization.js
  - No light selected: "Selecciona una luz en la escena para editarla"
  - No evidence: "Tu observación aparecerá aquí cuando escribas"
  - No screenshot: "Toma una captura si necesitas evidencia visual"
```

### Acceptance
- No ambiguous labels
- Apply buttons say what target changes
- Empty states guide, don't confuse

---

## Phase 7: Final QA & Verification (P3)

### 7.1 Responsive test matrix
```
- 320 × 568 (iPhone SE)
- 390 × 844 (iPhone 14)
- 414 × 896 (iPhone 11)
- 768 × 1024 (iPad portrait)
- 834 × 1112 (iPad Pro 11")
- 1024 × 768 (iPad landscape)
- 1280 × 720 (laptop)
- 1440 × 900 (desktop)
- 1920 × 1080 (desktop wide)

Check: no horizontal scroll, all controls reachable, scene visible
```

### 7.2 Accessibility
```
- Lighthouse audit (target 95+)
- Keyboard-only: open → lesson 1 → adjust HSV → apply → write → complete → next
- Screen reader: VoiceOver (Mac) + NVDA (Windows reference)
- Color contrast audit
```

### 7.3 Regression
```
- npm test (102 tests)
- npm run build
- Manual: all 8 lessons completable
- Manual: sandbox add/remove lights works
- Manual: language switch preserves state
- Manual: refresh preserves evidence
```

---

## Implementation Order (Recommended)

```
Wave 1 (1 session):  Phase 1 (Responsive Hardening)
Wave 2 (1 session):  Phase 2 (Keyboard & Accessibility)
Wave 3 (1 session):  Phase 3 (Mobile Bottom Nav) + Phase 6 (Microcopy)
Wave 4 (1 session):  Phase 4 (Evidence States) + Phase 5 (Guided/Explore)
Wave 5 (1 session):  Phase 7 (Final QA)
```

Total estimated: 5 implementation sessions.

---

## File Index (all files touched)

| File | Phases |
|---|---|
| `src/css/responsive.css` | 1, 3 |
| `src/css/chromalab-compat.css` | 2, 3, 4, 5 |
| `src/css/utilities.css` | 2 |
| `src/css/controls-panel.css` | 5 |
| `index.html` | 2, 3, 5 |
| `src/ui.js` | 1, 3, 5 |
| `src/ui/CurriculumDrawer.js` | 2 |
| `src/ui/LessonCompletionModal.js` | 2, 4 |
| `src/ui/StudentResponse.js` | 4 |
| `src/ui/PaletteControls.js` | 2, 6 |
| `src/ui/LightControls.js` | 2 |
| `src/ui/SandboxManager.js` | 2 |
| `src/ui/LessonMission.js` | 4 |
| `src/ui/LessonChecklist.js` | 4 |
| `src/localization.js` | 6 |

---

## Style Constraints

- ❌ No new color palette — use existing CSS custom properties
- ❌ No font changes — keep Display + Sans pairing
- ❌ No layout rearchitecture — panels stay where they are
- ❌ No new dependencies
- ✅ Add new `.visually-hidden` utility
- ✅ Add new `.mobile-bottom-nav` component
- ✅ Add new `.skip-link` element
- ✅ Add new `aria-label` strings to localization
- ✅ Add new `.guided-only` / `.explore-only` classes
