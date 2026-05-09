# Color Wheel — Agent Reference

## Files

| File | Lines | Role |
|------|-------|------|
| `src/colorWheel.js` | ~730 | `ColorWheel` class + `renderDiagram` wrapper |
| `src/css/color-wheel.css` | 74 | Canvas, container, responsive styles |
| `src/diagram.js` | 211 | **Legacy backup** — not imported, kept for fallback |

## Entry Point

`ui.js:_updateDiagram()` creates the wheel via:

```javascript
const controls = renderDiagram(localizedPreset, svg, this.lang, {
    onHueChange: (hue) => { ... },
    onDragEnd: () => { this._updateDiagram(); }
});
if (controls) svg._controls = controls;
```

## Class: ColorWheel

### Constructor
```javascript
new ColorWheel(container, {
    onHueChange: fn,   // callback(hue: number)
    onDragEnd: fn,     // callback when drag ends
    lang: 'es' | 'en'
})
```

### Public Methods
- `updateFromPreset(preset)` — load hue, saturation, value, harmonyType
- `updateIndicator(hue, saturation, value)` — compat with `diagram.js`
- `setLang(lang)` — change language labels
- `destroy()` — cleanup canvas, observers, listeners

### State
```
this._hue: number (0-360)
this._saturation: number (0-1)
this._value: number (0-1)
this._harmonyType: string
this._harmonyHues: number[]
this._velocity: number (inertia)
this._isDragging: boolean
this._isDestroyed: boolean
```

## Data Flow

```
User drags wheel
  → ColorWheel._onPointerMove()
  → calls opts.onHueChange(newHue)
    → ui.js callback: colorSystem.setHue(hue)
      → appEvents.emit('color:hueChanged')
        → PaletteControls._updatePreview()
        → LessonChecklist marks criteria
```

## Known Behaviors

### Section starts collapsed
The `.diagram-section` has `aria-expanded="false"` on load. The `ColorWheel` constructor runs immediately on lesson load but `_resize()` returns early because `.diagram-container` has 0×0 dimensions (parent `.collapsed-body` has `display: none`).

An expand handler on `.collapsible-trigger` calls `setTimeout(() => _resize(), 50)` after expansion animation. The `ResizeObserver` also triggers resize once the container becomes visible.

### SVG hidden by CSS
`.diagram-container .diagram-svg { display: none; }` hides the SVG unconditionally. The canvas is created dynamically. If the canvas is destroyed (navigate away), `destroy()` restores `svg.style.display = ''`.

### Double destroy guard
`renderDiagram` wrapper destroys the previous `_activeWheel` before creating a new one. `destroy()` has a guard against double invocation (`if (this._isDestroyed) return`).

## Debugging

### Canvas appears black/empty
1. Check section expanded: `document.querySelector('.diagram-section .collapsible-trigger')?.getAttribute('aria-expanded')`
2. Check canvas dimensions: `document.querySelector('.color-wheel-canvas')?.width`
3. If section collapsed: expand manually or call `trigger.click()`

### Crash on pointer move during destroy
Fixed with guards in `_onPointerMove`, `_onPointerUp`, `_applyInertia`:
```javascript
if (!this._isDragging || this._isDestroyed || !this._canvas) return;
```

### Ring not rendering
- Check `_resize()` dimensions via console
- Verify `_ringCache` is being populated
- The OffscreenCanvas cache key is `outerR|innerR|cx|cy` — changes invalidate cache

## Fallback Plan

If Canvas 2D fails, `src/diagram.js` can be re-imported:
```javascript
// ui.js:13 — change back:
import { renderDiagram } from './diagram.js'; // instead of './colorWheel.js'
```

The SVG is preserved in the DOM (`<svg id="lighting-diagram">`), hidden by CSS when canvas is active.
