# ChromaLab — Plan de Optimización Pedagógica v2

> **Fecha:** 2026-05-08 · **Base:** 12 componentes UI, 7 test files (102 tests ✅), 8 lecciones, inspección visual en vivo  
> **Supersede:** `IMPLEMENTACION_SOLUCION_PEDAGOGICA.md`

---

## Estado Actual: Lo que YA funciona

| Componente | Estado | Tests |
|---|---|---|
| `ColorSystem` | ✅ 237 líneas | 22 ✅ |
| `LessonProgressEngine` | ✅ 229 líneas | 8 ✅ |
| `EvidenceStore` | ✅ 113 líneas | warnings localStorage |
| `PaletteControls` | ✅ 278 líneas | — |
| `LessonChecklist` | ✅ 195 líneas | — |
| `StudentResponse` | ✅ 324 líneas | — |
| HSV conversions (`color.js`) | ✅ 10KB | 54 ✅ |
| 8 Presets con checklist/rules | ✅ Completos | 7 ✅ |
| `LessonSession` | ✅ State machine | 8 ✅ |

**Total: 102 tests pasando, 0 fallos.**

---

## Diagnóstico Visual: Problemas Detectados

### 🔴 Críticos

1. **Layout roto en scroll largo** — Paneles y escena 3D fluyen en columna vertical. El usuario pierde la escena 3D al interactuar con controles (~1200px de scroll para llegar a sliders HSV).

2. **Controles pedagógicos invisibles** — Sliders de Paleta HSV, checklist y campo de respuesta enterrados debajo del diagrama de rueda cromática.

3. **Escena 3D no refleja cambios entre lecciones** — Al navegar de lección 1 a 2, la escena permanece visualmente idéntica.

### 🟡 Importantes

4. **Onboarding duplicado** — Bloque redundante al final de la página.
5. **Diagrama demasiado grande** — ~600px empujando controles fuera de vista.
6. **Sin micro-animaciones** en checklist al completar pasos.
7. **Iluminación por defecto oscura** — Objetos de referencia apenas visibles.
8. **Confusión Valor vs Exposición** — Ambos sliders parecen hacer "lo mismo".

---

## Plan: 6 Fases

### Fase 1: Layout y Visibilidad (PRIORIDAD MÁXIMA)

**Objetivo:** Escena 3D + controles visibles sin scroll.

**Cambios CSS:**
```css
.app-layout {
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  height: 100vh;
  overflow: hidden;
}
.teach-panel, .controls-panel {
  overflow-y: auto;
  max-height: 100vh;
}
```

**Archivos:** `index.html`, `index.css`/`style.css`, `main.js` (resize handler → usar container size)

**Aceptación:**
- [ ] Escena 3D visible permanentemente mientras se usan controles
- [ ] Paneles con scroll interno independiente
- [ ] Diagrama reducido a max 300px en modo guiado

---

### Fase 2: Calibración de Iluminación

**Objetivo:** Escena profesional y pedagógicamente útil desde el primer momento.

| Parámetro | Actual | Propuesto | Razón |
|---|---|---|---|
| `toneMappingExposure` | 2.0 | 1.6 | Sobreexposición lava colores |
| `fog density` | 0.04 | 0.025 | Niebla oscurece demasiado |
| Camera FOV | 40 | 45 | Mostrar más de la sala |
| `hsv-key` intensity | 3.0 | 3.5 | Más iluminación visible |
| `hsv-fill` intensity | 0.6 | 1.0 | Fill demasiado débil |
| `hsv-back` intensity | 1.2 | 1.8 | Fondo necesita presencia |

**Archivos:** `main.js`, `src/presets.js`, `src/model.js`

**Aceptación:**
- [ ] Cubos de referencia claramente visibles
- [ ] Cambio de matiz produce cambio visible inmediato al aplicar
- [ ] Diferencia key/fill pedagógicamente clara

---

### Fase 3: Flujo Pedagógico Lección 1 (Vertical Slice)

**3.1 — Reordenar panel izquierdo:**
1. Header → 2. Mission → 3. Checklist → 4. Goal (colapsable) → 5. Observe (colapsable) → 6. Practice (colapsable) → 7. Diagram (colapsable, reducido)

**3.2 — Reordenar panel derecho:**
1. Paleta HSV (siempre visible) → 2. Luz seleccionada → 3. Respuesta estudiante → 4. Ambiente (colapsado) → 5. Modelo (colapsado)

**3.3 — AutoApply:** En lecciones con `autoApply: true`, aplicar color a luz principal en cada cambio de slider (throttle 100ms).

**Archivos:** `index.html`, `src/ui.js`, `src/ui/PaletteControls.js`, `src/presets.js`

**3.4 — Nota contextual mejorada:**
- ES: "💡 Valor = claridad del color. Exposición (Ambiente) = brillo global de cámara."

**Aceptación:**
- [ ] Misión y checklist visibles sin scroll
- [ ] Slider de matiz cambia escena visualmente (autoApply)
- [ ] Checklist items se marcan con animación
- [ ] Modal de completado aparece al terminar todos los pasos

---

### Fase 4: Hardening del Sistema de Evidencia

**4.1 — Fix tests:** Mejorar mock de localStorage en `tests/evidenceStore.test.js`.

**4.2 — Persistencia cross-lección:** Guardar estado de `ColorSystem` en `EvidenceStore` antes de cambiar de lección. Restaurar al regresar.

**Archivo:** `src/ui.js` (líneas 211-257) — en `_onSessionLessonLoaded`:
```js
// Antes de crear nuevo ColorSystem, guardar estado actual
if (this.colorSystem && this.colorSystem.lessonId) {
    this.evidenceStore.saveColorState(this.colorSystem.lessonId, this.colorSystem.state);
}
// Después de crear, intentar restaurar
const saved = this.evidenceStore.getLessonEvidence(preset.id);
if (saved?.colorState) {
    this.colorSystem.restoreState(saved.colorState);
}
```

**4.3 — Exportación mejorada:** Incluir nombre de lección localizado y timestamps en JSON.

**Aceptación:**
- [ ] Tests sin warnings de localStorage
- [ ] Valores HSV y observación persisten al cambiar de lección y volver
- [ ] JSON exportado incluye nombre de lección y timestamps

---

### Fase 5: Tuning de las 8 Lecciones

| # | Lección | Ajuste Principal |
|---|---|---|
| 1 | HSV | autoApply, reorder, value note |
| 2 | Complementarios | Restringir selector a `single`/`complementary` |
| 3 | Análogos | Auto-asignar 3 colores a 3 luces |
| 4 | Triádicos | Guía visual proporción 60/20/20 |
| 5 | Contraste simultáneo | Botón toggle rápido fondo claro/oscuro |
| 6 | Semiótica | Selector de emoción + paleta sugerida |
| 7 | Temperatura | Toggle cálido/frío con animación |
| 8 | Sandbox | Contador de luces, meta visual 3 mínimo |

**Archivos:** `src/presets.js` (agregar `allowedHarmonies`, `specialControls`, `autoApply`), `src/ui/PaletteControls.js`

---

### Fase 6: Onboarding Rediseñado

**Fix duplicado:** Verificar que solo existe un `#onboarding` en `index.html`.

**Nuevo flujo de 4 pasos:**
1. "Lee el objetivo" → highlight goal
2. "Mueve el slider de matiz" → highlight + pulse slider
3. "Aplica el color a la escena" → highlight botón
4. "Escribe qué observaste" → highlight textarea

**Archivos:** `src/onboarding.js`, `index.html`, `style.css`

---

## Orden de Ejecución

| Semana | Fases | Dependencia |
|---|---|---|
| 1 | Fase 1 + Fase 2 | Independientes, paralelas |
| 2 | Fase 3 | Requiere Fase 1 |
| 2 | Fase 4 | Requiere Fase 2 |
| 3 | Fase 5 | Requiere Fase 3 |
| 3 | Fase 6 | Requiere Fase 1 |

## Métricas de Éxito

| Métrica | Antes | Después |
|---|---|---|
| Scroll para ver primer control HSV | ~1200px | 0px |
| Tiempo para completar lección 1 | Indefinido | < 5 min |
| Pasos del checklist visibles sin acción | 0 | 5 (todos) |
| Tests pasando | 102 | ≥ 115 |
| Lecciones con flujo pedagógico completo | 1 parcial | 8 |

## Verificación

```bash
npx vitest run    # 102+ tests deben pasar
npx vite build    # Build sin errores
npx vite preview  # Verificación visual
```

> **Próximo paso:** Ejecutar Fase 1 (Layout) + Fase 2 (Iluminación) en paralelo — transforman la experiencia de "página con scroll" a "laboratorio interactivo".
