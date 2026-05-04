# Plan robusto de implementacion pedagogica para ChromaLab

## Resumen ejecutivo

ChromaLab ya tiene una base valiosa: una escena 3D interactiva con Three.js, ocho presets educativos, seleccion y edicion de luces, rueda cromatica, capturas, soporte bilingue, PWA/Vite, pruebas unitarias de color y una arquitectura UI dividida en modulos. El problema no es falta de tecnologia; es falta de alineacion entre la experiencia pedagogica prometida y las acciones que el estudiante puede realizar dentro del software.

La prioridad debe ser convertir ChromaLab en un laboratorio donde cada leccion tenga:

1. Controles pedagogicos reales.
2. Pasos de experimentacion claros.
3. Evidencias guardables.
4. Criterios de completado basados en acciones.
5. Retroalimentacion suave y formativa.
6. Un modelo de datos que permita crecer sin duplicar logica.

El primer entregable recomendado sigue siendo una version vertical completa de la leccion 1, "Matiz, Saturacion y Valor". Pero el plan se fortalece para que ese vertical slice sea la semilla de todo el sistema: `ColorSystem`, `LessonProgressEngine`, `EvidenceStore`, `PaletteControls`, `LessonChecklist` y `StudentResponse`.

## Hallazgos del codebase

### Lo que ya existe y conviene aprovechar

- `src/ui.js` funciona como orquestador fino de componentes.
- `src/ui/LessonNavigator.js` maneja lecciones, progreso, dots y teclado.
- `src/ui/LightControls.js` maneja seleccion de luces, intensidad, color, posicion y duplicado.
- `src/ui/SandboxManager.js` ya permite luces libres en la leccion sandbox.
- `src/ui/ScreenshotExporter.js` emite eventos `screenshotTaken` y `screenshotFailed`.
- `src/utils/events.js` ya ofrece un bus simple `appEvents`.
- `src/utils/color.js` ya concentra conversiones HSL, armonias, contraste, temperatura y nombres de matiz.
- `src/presets.js` ya contiene metadata pedagogica por leccion: objetivo, observacion, practica, luces, `baseHue`, `harmonyType`, `saturation` y `lightness`.
- `src/localization.js` ya soporta textos ES/EN.
- `tests/color.test.js` y `tests/presets.test.js` ya prueban utilidades de color y presets.
- `main.js` ya escucha `presetLoaded` y aplica armonias a fondo y luces.

### Gaps reales confirmados

- `src/ui/HarmonyControls.js` existe, pero no esta montado desde `src/ui.js`.
- `HarmonyControls` usa HSL (`lightness`) mientras la primera leccion enseña HSV/HSB (`value`).
- `index.html` no contiene los contenedores `harmony-selector` ni `harmony-controls` que espera `HarmonyControls`.
- El progreso se marca al abandonar una leccion en `UI.loadLesson`, no al completar acciones pedagogicas.
- El screenshot se descarga, pero no queda asociado a una leccion ni a una respuesta del estudiante.
- La exposicion del renderer vive cerca de controles de color y puede confundirse con "valor".
- No hay almacenamiento estructurado de respuestas por leccion.
- No hay pruebas de interaccion UI ni de persistencia.

## Vision 10x

La version ideal de ChromaLab no es solo "una app para mover luces". Es un laboratorio de color donde un docente puede decir:

"Completen la leccion de armonias analogas, entreguen su captura, su paleta, los valores usados y una justificacion breve".

Y el estudiante puede hacerlo sin instrucciones externas.

### Diferencia entre demo y laboratorio

| Dimension | Demo actual | Laboratorio objetivo |
| --- | --- | --- |
| Progreso | Navegar entre lecciones | Completar acciones observables |
| Color | Selector nativo por luz | Modelo pedagogico HSV/paletas |
| Evidencia | Captura descargada | Ficha por leccion con valores, texto y captura |
| Guia | Objetivo + tarea | Secuencia de experimentacion |
| Feedback | Toasts generales | Retroalimentacion formativa contextual |
| Docente | Revisa imagen suelta | Revisa ficha con datos y reflexion |

## Principios de producto

1. La escena 3D debe ser el laboratorio, no el fondo decorativo.
2. Cada control visible debe responder a una intencion pedagogica.
3. La app debe enseñar por manipulacion, comparacion y reflexion.
4. No bloquear al estudiante con respuestas "correctas/incorrectas" salvo casos objetivos.
5. El progreso debe reconocer acciones reales, no solo navegacion.
6. La evidencia debe ser ligera: util para clase, sin convertir la app en LMS.
7. El modo libre debe conservar libertad, pero con una entrega final clara.

## Personas principales

### Estudiante principiante

Necesita saber que tocar, que observar y que entregar. No distingue naturalmente entre matiz, valor, luminosidad, exposicion, intensidad de luz o brillo percibido.

### Docente

Necesita una forma rapida de verificar que el estudiante experimento, comparo y justifico. No necesita un sistema de calificaciones complejo en la primera version.

### Estudiante explorador

Quiere probar combinaciones libres, agregar luces y crear atmosferas propias. Necesita que el checklist no mate la exploracion.

## No esta en alcance inicial

- Cuentas de usuario.
- Backend.
- Sincronizacion con LMS.
- Calificaciones automaticas estrictas.
- Exportacion PDF en la primera entrega.
- Analiticas remotas.
- Reescritura con React/Vue/Svelte.
- Motor fisico o render avanzado.

## Arquitectura objetivo

La solucion debe introducir piezas pequeñas, desacopladas y coherentes con el codebase actual.

```text
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

### Componentes nuevos

| Componente | Archivo sugerido | Responsabilidad |
| --- | --- | --- |
| `ColorSystem` | `src/colorSystem.js` | Estado pedagogico HSV, armonia, paleta derivada y metodos de aplicacion |
| `PaletteControls` | `src/ui/PaletteControls.js` | UI de matiz, saturacion, valor, armonia, swatches y acciones |
| `LessonProgressEngine` | `src/lessonProgress.js` | Escuchar eventos y decidir criterios completados |
| `LessonChecklist` | `src/ui/LessonChecklist.js` | Mostrar pasos y estado por leccion |
| `EvidenceStore` | `src/evidenceStore.js` | Persistir respuestas, paletas, capturas y metadata en `localStorage` |
| `StudentResponse` | `src/ui/StudentResponse.js` | Campo de observacion, justificacion, captura asociada y estado de guardado |

### Componentes a refactorizar

| Archivo | Cambio |
| --- | --- |
| `src/ui/HarmonyControls.js` | Reemplazar o migrar hacia `PaletteControls`; dejar de depender de HSL como modelo pedagogico principal |
| `src/utils/color.js` | Agregar HSV real y armonias basadas en `value`; mantener HSL por compatibilidad |
| `src/presets.js` | Agregar `value`, `learningControls`, `checklist`, `reflectionPrompt`, `completionRules` |
| `src/ui.js` | Instanciar nuevos componentes y dejar de marcar lecciones como completas al abandonarlas |
| `index.html` | Agregar secciones de paleta, checklist y respuesta |
| `src/localization.js` | Agregar textos para controles pedagogicos, checklist, evidencia y feedback |
| `main.js` | Mover aplicacion automatica de armonias hacia un servicio/evento controlado para evitar efectos sorpresa |

## Modelo pedagogico

Cada leccion debe seguir una misma estructura:

1. Objetivo conceptual.
2. Experimento guiado.
3. Manipulacion en escena.
4. Comparacion o decision.
5. Evidencia.
6. Reflexion.

### Taxonomia de acciones

| Tipo | Ejemplo | Evento |
| --- | --- | --- |
| Ajuste | Cambiar matiz | `color:hueChanged` |
| Aplicacion | Aplicar paleta a luz principal | `palette:applied` |
| Comparacion | Guardar version calida y fria | `comparison:captureSaved` |
| Reflexion | Escribir observacion | `lesson:responseChanged` |
| Composicion | Asignar colores a key/fill/rim | `palette:assignedToLights` |
| Exploracion | Agregar una luz | `light:added` |

### Validacion formativa

La validacion debe ser suave:

- "Aun falta cambiar la saturacion."
- "Tu paleta esta cerca de una atmosfera fria."
- "Buen contraste, prueba bajar la intensidad del complementario si vibra demasiado."
- "Para completar, escribe una observacion breve."

Evitar mensajes como "incorrecto" cuando se trate de interpretacion visual.

## Modelo de datos propuesto

### Preset pedagogico

```js
{
    id: 'hsv',
    name: { es: 'Matiz, Saturacion y Valor', en: 'Hue, Saturation and Value' },
    category: { es: 'Fundamentos', en: 'Fundamentals' },
    difficulty: 1,
    colorModel: 'hsv',
    baseHue: 200,
    saturation: 0.75,
    value: 0.45,
    lightness: 0.45, // fallback temporal
    harmonyType: 'single',
    learningControls: ['hue', 'saturation', 'value'],
    paletteTargets: ['keyLight', 'background'],
    checklist: [
        { id: 'adjust-hue', event: 'color:hueChanged', required: true },
        { id: 'adjust-saturation', event: 'color:saturationChanged', required: true },
        { id: 'adjust-value', event: 'color:valueChanged', required: true },
        { id: 'apply-color', event: 'palette:applied', required: true },
        { id: 'write-observation', event: 'lesson:responseChanged', required: true }
    ],
    reflectionPrompt: {
        es: 'Describe como cambio la sensacion del color al modificar saturacion y valor.',
        en: 'Describe how the color feeling changed when adjusting saturation and value.'
    },
    completionRules: {
        mode: 'allRequired',
        minObservationLength: 20
    }
}
```

### Estado de color

```js
{
    lessonId: 'hsv',
    colorModel: 'hsv',
    hue: 200,
    saturation: 0.75,
    value: 0.45,
    harmonyType: 'single',
    palette: ['#1d78b8'],
    lastAppliedTarget: 'keyLight'
}
```

### Evidencia del estudiante

```js
{
    version: 1,
    lessons: {
        hsv: {
            completedCriteria: ['adjust-hue', 'adjust-saturation'],
            response: {
                observation: '',
                justification: '',
                emotion: '',
                updatedAt: '2026-05-03T21:50:00.000Z'
            },
            colorState: {
                hue: 200,
                saturation: 0.75,
                value: 0.45,
                harmonyType: 'single',
                palette: ['#1d78b8']
            },
            screenshots: [
                {
                    filename: 'lighting-hsv-...',
                    createdAt: '2026-05-03T21:50:00.000Z',
                    role: 'final'
                }
            ]
        }
    }
}
```

Clave sugerida de `localStorage`: `chromaLab.lessonEvidence.v1`.

## Eventos recomendados

Usar `appEvents` para mantener la UI desacoplada.

```js
appEvents.emit('color:hueChanged', { lessonId, hue });
appEvents.emit('color:saturationChanged', { lessonId, saturation });
appEvents.emit('color:valueChanged', { lessonId, value });
appEvents.emit('color:harmonyChanged', { lessonId, harmonyType });
appEvents.emit('palette:previewChanged', { lessonId, palette });
appEvents.emit('palette:applied', { lessonId, target, colors });
appEvents.emit('palette:assignedToLights', { lessonId, assignments });
appEvents.emit('background:changed', { lessonId, color });
appEvents.emit('light:colorChanged', { lessonId, lightId, color });
appEvents.emit('light:intensityChanged', { lessonId, lightId, intensity });
appEvents.emit('light:added', { lessonId, lightId, type });
appEvents.emit('lesson:responseChanged', { lessonId, field, value });
appEvents.emit('lesson:criteriaCompleted', { lessonId, criteriaId });
appEvents.emit('lesson:completionChanged', { lessonId, completed, percent });
appEvents.emit('screenshotTaken', { lessonId, filename });
```

## Roadmap por fases

## Fase 0: estabilizar base y decisiones

### Objetivo

Preparar el terreno sin cambiar la experiencia visible todavia.

### Cambios

1. Documentar la decision: HSV sera el modelo pedagogico principal.
2. Mantener HSL como compatibilidad tecnica temporal.
3. Crear funciones HSV puras en `src/utils/color.js`.
4. Agregar tests de conversion HSV.
5. Agregar adaptadores entre `value` y `lightness` solo donde haga falta.
6. Definir claves de `localStorage` versionadas.
7. Crear mapa de eventos pedagogicos.

### Criterios de aceptacion

- `hsvToRgb`, `rgbToHsv`, `hsvToHex`, `hexToHsv` probados.
- `getHarmonyColors` conserva compatibilidad actual.
- Nueva funcion `getHarmonyColorsHsv` o parametro explicito para HSV.
- Tests existentes siguen pasando.
- No hay cambios visuales inesperados.

## Fase 1: vertical slice completo de la primera leccion

### Objetivo

Que la primera leccion pueda completarse de verdad desde la interfaz.

### Cambios funcionales

Agregar una seccion "Paleta" en el panel derecho:

- Slider de matiz 0-360.
- Slider de saturacion 0-100%.
- Slider de valor 0-100%.
- Swatch de preview.
- Nombre semantico del matiz.
- Boton aplicar a luz principal.
- Boton aplicar a fondo.
- Texto corto que diferencie "valor" de "exposicion".

Agregar en el panel izquierdo:

- Checklist de 5 pasos.
- Campo de observacion.
- Estado "guardado local".

### Criterios de completado

- Cambiar matiz.
- Cambiar saturacion.
- Cambiar valor.
- Aplicar color a luz principal o fondo.
- Escribir observacion minima.

### Criterios de aceptacion

- La leccion 1 muestra controles HSV visibles.
- Mover los sliders actualiza preview sin retraso perceptible.
- Aplicar a luz principal cambia la escena 3D.
- Aplicar a fondo cambia el backdrop.
- El checklist se actualiza por eventos, no por navegacion.
- Al cambiar de leccion y volver, respuesta y color se conservan.
- El progreso global no marca una leccion completa al abandonarla.

## Fase 2: paletas y armonias aplicables

### Objetivo

Hacer manipulables las lecciones de complementarios, analogos, triadicos, split y tetradicos.

### Cambios funcionales

En `PaletteControls`:

- Selector de armonia.
- Matiz base.
- Saturacion.
- Valor.
- Swatches generados.
- Acciones por target:
  - Aplicar a key/fill/rim automaticamente.
  - Aplicar primer color al fondo.
  - Aplicar swatch seleccionado a luz seleccionada.

En `diagram.js`:

- Consumir la misma fuente de armonias que `ColorSystem`.
- Evitar duplicar calculos de armonia.

### Criterios de aceptacion

- Complementarios: permite girar matiz base y aplicar par opuesto.
- Analogos: genera tres colores vecinos y los aplica a luces.
- Triadicos: asigna dominante a key y acentos a fill/rim.
- La rueda cromatica y la escena siempre muestran la misma paleta.
- El estudiante puede restaurar el preset original.

## Fase 3: motor de progreso pedagogico

### Objetivo

Separar progreso pedagogico de navegacion.

### Cambios

Crear `LessonProgressEngine`:

- Recibe checklist del preset.
- Escucha eventos.
- Marca criterios completados.
- Persiste estado.
- Emite cambios de progreso.

Crear `LessonChecklist`:

- Renderiza criterios localizados.
- Muestra pendiente/completo.
- Permite "revisar que falta".

### Regla importante

`UI.loadLesson` ya no debe llamar `_markLessonCompleted(previousId)`.

La leccion se completa solo cuando `LessonProgressEngine` determina que sus reglas se cumplieron.

### Criterios de aceptacion

- Cambiar de leccion no completa la anterior.
- Los dots reflejan lecciones completadas por criterios.
- El progress bar refleja porcentaje pedagogico, no posicion en el curso.
- Cada criterio se puede completar una sola vez.
- El estado sobrevive refresh.

## Fase 4: respuesta y evidencia

### Objetivo

Crear una ficha de entrega simple por leccion.

### Cambios funcionales

`StudentResponse` debe incluir:

- Observacion.
- Justificacion, cuando aplique.
- Campo de emocion/concepto para semiotica y sandbox.
- Valores actuales HSV.
- Paleta actual.
- Capturas asociadas.
- Boton "Usar captura reciente como evidencia".
- Estado de guardado local.

### Integracion con screenshot

`ScreenshotExporter` debe emitir `lessonId` y permitir que `EvidenceStore` registre la captura. No hace falta cambiar la descarga PNG en la primera iteracion.

### Criterios de aceptacion

- El estudiante escribe y recupera su observacion.
- La captura queda asociada semanticamente a la leccion.
- La ficha muestra los valores usados.
- El docente puede pedir al estudiante que comparta captura + observacion + paleta.

## Fase 5: onboarding accionable

### Objetivo

Reemplazar el onboarding pasivo por una introduccion breve y controlada por el estudiante.

### Cambios

- Eliminar autocierre a los 2500 ms.
- Crear 4 pasos:
  1. Lee el objetivo.
  2. Ajusta la paleta.
  3. Aplica el color a escena.
  4. Escribe observacion y guarda evidencia.
- Botones: Comenzar, Saltar, Mostrar de nuevo.
- Mantener ayuda accesible desde el header.

### Criterios de aceptacion

- El onboarding no desaparece sin accion.
- El usuario puede saltarlo.
- El usuario puede volver a abrirlo.
- El primer uso carga la leccion inicial solo despues de comenzar o saltar.

## Fase 6: completar las ocho lecciones

### Checklist por leccion

| Leccion | Criterios propuestos |
| --- | --- |
| HSV | Cambiar H, S y V; aplicar color; escribir observacion |
| Complementarios | Cambiar matiz base; identificar complementario; aplicar par; ajustar intensidad |
| Analogos | Elegir matiz base; aplicar tres analogos; observar unidad visual |
| Triadicos | Generar triada; asignar key/fill/rim; explicar proporcion dominante/acento |
| Contraste simultaneo | Alternar fondo claro/oscuro; mantener color constante; escribir comparacion |
| Semiotica | Elegir emocion; construir paleta intencional; justificar significado |
| Temperatura | Crear version calida; crear version fria; capturar ambas; comparar emocion |
| Sandbox | Agregar minimo tres luces; usar dos o mas colores; guardar captura; justificar |

### Criterios de aceptacion

- Todas las lecciones tienen checklist.
- Todas las lecciones tienen prompt de reflexion.
- Las lecciones con comparacion permiten registrar dos estados.
- Sandbox conserva libertad, pero produce una evidencia final.

## Fase 7: exportacion de ficha

### Objetivo

Permitir que el estudiante entregue su practica fuera de la app.

### MVP de exportacion

- Exportar JSON con respuestas y paletas.
- Exportar PNG normal como ya existe.
- Copiar resumen textual al portapapeles.

### Version posterior

- Generar una ficha visual compuesta: captura + paleta + HSV + respuesta.
- Exportar PDF solo si realmente se necesita para clase.

## Diseño UX recomendado

### Estructura de panel derecho

Orden sugerido:

1. Paleta.
2. Aplicacion.
3. Luz seleccionada.
4. Ambiente.
5. Fondo.
6. Modelo.

Esto reduce la confusion entre teoria del color, aplicacion a escena e iluminacion fisica.

### Microcopy clave

- "Valor (HSV): claridad del color elegido."
- "Exposicion: brillo global de la camara/render."
- "Aplicar no cambia tu idea; solo la lleva a la escena."
- "Tu observacion guarda lo que descubriste, no una respuesta correcta."

### Estados necesarios

- Empty state: "Selecciona una luz o aplica la paleta a la escena."
- Saving: "Guardando..."
- Saved: "Guardado localmente."
- Missing criterion: "Falta escribir una observacion."
- Completed: "Leccion completada."

## Testing y QA

### Unitarias

Agregar pruebas para:

- HSV a RGB.
- RGB a HSV.
- HSV a hex.
- Hex a HSV.
- Armonias HSV.
- Normalizacion de hue negativo o mayor a 360.
- `EvidenceStore` con JSON corrupto.
- `LessonProgressEngine` con eventos repetidos.
- Reglas `allRequired` y `minObservationLength`.

### Integracion ligera con jsdom/Vitest

Agregar pruebas para:

- Render de `PaletteControls`.
- Slider de matiz emite `color:hueChanged`.
- Boton aplicar emite `palette:applied`.
- `LessonChecklist` marca criterio completado.
- `StudentResponse` guarda en `localStorage`.

### QA manual minimo

1. Abrir ChromaLab.
2. Comenzar onboarding manualmente.
3. Entrar a leccion 1.
4. Cambiar matiz, saturacion y valor.
5. Aplicar color a luz principal.
6. Aplicar color a fondo.
7. Escribir observacion.
8. Confirmar checklist completo.
9. Tomar captura.
10. Cambiar a leccion 2.
11. Volver a leccion 1.
12. Confirmar que valores, checklist y observacion persisten.
13. Refrescar navegador.
14. Confirmar persistencia.
15. Ejecutar build.

### Verificacion actual

Con el runtime local empaquetado:

```bash
PATH="/Users/nestor/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/vitest run
```

Resultado observado el 2026-05-03: 2 archivos de test pasaron, 34 tests pasaron.

Nota: `npm` no esta disponible en el shell actual, aunque `node_modules` existe y Vitest puede ejecutarse via `./node_modules/.bin/vitest` cuando se agrega el `node` empaquetado al `PATH`.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Confundir HSV con HSL | Alto | Usar `value` pedagogico, mantener `lightness` solo como fallback |
| Checklist demasiado rigido | Medio | Validacion suave, no bloquear exploracion |
| LocalStorage corrupto | Medio | Versionar schema y fallback seguro |
| Duplicar logica de armonias | Medio | Centralizar en `ColorSystem`/`utils/color.js` |
| Capturas pesadas en localStorage | Alto | Guardar metadata, no base64 grande en MVP |
| Re-render excesivo en sliders | Medio | Actualizar preview en input, escena solo cuando aplique o con throttling |
| Mobile saturado | Alto | Secciones colapsables y controles compactos |
| Cambio rompe presets actuales | Medio | Migracion progresiva: `value ?? lightness ?? 0.5` |

## Decisiones recomendadas

### Decision 1: HSV como modelo pedagogico

Recomendacion: usar HSV/HSB para la primera capa pedagogica. La palabra "valor" ya esta en el curriculo de la leccion y es comun en software creativo. HSL puede seguir existiendo como utilidad interna.

### Decision 2: completar por acciones, no por navegacion

Recomendacion: eliminar completado automatico al salir de una leccion. Es el cambio pedagogico mas importante.

### Decision 3: evidencia local primero

Recomendacion: usar `localStorage` versionado antes de exportaciones complejas. Es suficiente para validar en aula sin backend.

### Decision 4: no reescribir UI

Recomendacion: mantener Vanilla JS y modulos actuales. La base ya esta separada lo suficiente.

### Decision 5: vertical slice antes de cubrir ocho lecciones

Recomendacion: completar HSV de punta a punta antes de extender. Si la primera leccion se siente bien, el resto hereda el sistema.

## Plan de implementacion detallado

### Entregable A: base tecnica HSV

Archivos:

- `src/utils/color.js`
- `tests/color.test.js`

Tareas:

1. Agregar conversiones HSV.
2. Agregar `hsvToHex` y `hexToHsv`.
3. Agregar armonias HSV o parametro `model`.
4. Mantener pruebas HSL.

### Entregable B: `ColorSystem`

Archivos:

- `src/colorSystem.js`
- `src/ui.js`
- `tests/colorSystem.test.js`

Tareas:

1. Crear clase o factory con estado HSV.
2. Inicializar desde preset.
3. Derivar paleta.
4. Emitir eventos.
5. Exponer `applyToLight`, `applyToBackground`, `applyPaletteToScene`.

### Entregable C: `PaletteControls`

Archivos:

- `src/ui/PaletteControls.js`
- `index.html`
- `style.css`
- `src/localization.js`

Tareas:

1. Agregar contenedores HTML.
2. Renderizar sliders y swatches.
3. Conectar eventos de input.
4. Crear botones de aplicacion.
5. Separar visualmente Paleta, Aplicacion e Iluminacion.

### Entregable D: progreso pedagogico

Archivos:

- `src/lessonProgress.js`
- `src/ui/LessonChecklist.js`
- `src/ui.js`
- `src/presets.js`
- `src/localization.js`

Tareas:

1. Agregar checklist a preset HSV.
2. Crear motor de progreso.
3. Persistir criterios completados.
4. Actualizar dots y progress bar.
5. Remover completado por navegacion.

### Entregable E: respuesta y evidencia

Archivos:

- `src/evidenceStore.js`
- `src/ui/StudentResponse.js`
- `src/ui/ScreenshotExporter.js`
- `src/ui.js`
- `index.html`
- `style.css`

Tareas:

1. Guardar observacion por leccion.
2. Asociar captura reciente a leccion.
3. Mostrar valores HSV actuales.
4. Mostrar paleta actual.
5. Persistir y recuperar al cambiar de leccion.

### Entregable F: onboarding accionable

Archivos:

- `src/onboarding.js`
- `index.html`
- `style.css`
- `src/localization.js`

Tareas:

1. Eliminar auto-start.
2. Crear pasos accionables.
3. Agregar saltar/comenzar/mostrar de nuevo.
4. Asegurar que embed mode siga funcionando.

## Indicadores de exito

### Para el estudiante

- Puede completar la primera leccion sin ayuda externa.
- Entiende diferencia entre matiz, saturacion, valor, intensidad y exposicion.
- Puede explicar que cambio y por que.
- Puede recuperar su trabajo al volver.

### Para el docente

- Puede pedir una entrega concreta.
- Puede revisar captura, paleta, valores y reflexion.
- Puede usar la app en clase sin crear cuentas ni configurar backend.

### Para el proyecto

- Tests pasan.
- Build pasa.
- El cambio no rompe la manipulacion libre de luces.
- Los nuevos componentes se pueden extender a las ocho lecciones.

## GSTACK REVIEW REPORT

| Review | Trigger | Estado | Hallazgos incorporados |
| --- | --- | --- | --- |
| CEO Review | `plan-ceo-review` | Aplicado manualmente | Se amplio la vision de demo a laboratorio evaluable y se definio el 10x |
| Eng Review | `plan-eng-review` | Aplicado manualmente | Se agregaron arquitectura, eventos, datos, pruebas, riesgos y fases implementables |
| Design Review | `plan-design-review` | Aplicado manualmente | Se reorganizo la UI por intencion pedagogica: Paleta, Aplicacion, Iluminacion |
| DX Review | `plan-devex-review` | Aplicado parcialmente | Se agregaron entregables pequeños, rutas de archivos y verificacion local |

## Proximo paso recomendado

Implementar el Entregable A y B juntos:

1. HSV en `src/utils/color.js`.
2. Tests HSV.
3. `ColorSystem` inicializado desde preset.
4. Sin cambios visuales grandes todavia.

Despues, implementar `PaletteControls` para la primera leccion y validar en navegador antes de extender al resto.
