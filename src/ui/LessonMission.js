import { clearChildren } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';

const STEP_TARGET_MAP = {
  'adjust-hue': { controlId: 'palette-hue', group: 'palette-controls' },
  'adjust-saturation': { controlId: 'palette-saturation', group: 'palette-controls' },
  'adjust-value': { controlId: 'palette-value', group: 'palette-controls' },
  'apply-color': { controlId: null, group: 'palette-controls' },
  'assign-palette': { controlId: null, group: 'palette-controls' },
  'write-observation': { controlId: null, group: 'student-response' },
  'identify-complement': { controlId: null, group: 'palette-controls' },
  'adjust-intensity': { controlId: null, group: 'light-controls' },
  'add-light': { controlId: null, group: 'sandbox-toolbar' },
  'take-screenshot': { controlId: 'btn-screenshot', group: null },
  'compare-versions': { controlId: null, group: 'palette-controls' },
  'justify-choice': { controlId: null, group: 'student-response' }
};

const STEP_HINT = {
  es: {
    'adjust-hue': 'Ajusta el matiz',
    'adjust-saturation': 'Ajusta la saturación',
    'adjust-value': 'Ajusta el valor',
    'apply-color': 'Aplica el color',
    'assign-palette': 'Asigna la paleta',
    'write-observation': 'Escribe tu observación',
    'identify-complement': 'Selecciona complementarios',
    'adjust-intensity': 'Ajusta la intensidad',
    'add-light': 'Agrega una luz',
    'take-screenshot': 'Toma una captura',
    'compare-versions': 'Compara versiones',
    'justify-choice': 'Justifica tu elección'
  },
  en: {
    'adjust-hue': 'Adjust the hue',
    'adjust-saturation': 'Adjust the saturation',
    'adjust-value': 'Adjust the value',
    'apply-color': 'Apply the color',
    'assign-palette': 'Assign the palette',
    'write-observation': 'Write your observation',
    'identify-complement': 'Select complementary',
    'adjust-intensity': 'Adjust intensity',
    'add-light': 'Add a light',
    'take-screenshot': 'Take a screenshot',
    'compare-versions': 'Compare versions',
    'justify-choice': 'Justify your choice'
  }
};

export class LessonMission {
  constructor(getLang, getCompletedIds) {
    this.getLang = getLang;
    this.getCompletedIds = getCompletedIds;
    this._container = null;
    this._currentLessonId = null;
    this._checklist = [];
    this._activeStepId = null;

    this._onCriteriaCompleted = (payload) => {
      if (payload.lessonId === this._currentLessonId) {
        this._updateActiveStep();
      }
    };
    appEvents.on('lesson:criteriaCompleted', this._onCriteriaCompleted);
  }

  destroy() {
    appEvents.off('lesson:criteriaCompleted', this._onCriteriaCompleted);
  }

  render(lessonId, checklist = []) {
    this._currentLessonId = lessonId;
    this._checklist = checklist;

    const container = document.getElementById('lesson-mission');
    if (!container) return;
    this._container = container;
    clearChildren(container);

    if (!checklist.length) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');

    this._updateActiveStep();
  }

  _updateActiveStep() {
    if (!this._container || !this._currentLessonId) return;
    const container = this._container;
    const lang = this.getLang();

    const completedIds = new Set(this.getCompletedIds ? this.getCompletedIds(this._currentLessonId) : []);
    const steps = this._checklist;
    const activeIdx = steps.findIndex(s => !completedIds.has(s.id));
    const allDone = activeIdx === -1;

    clearChildren(container);

    if (allDone) {
      this._activeStepId = null;
      appEvents.emit('lesson:activeStepChanged', { lessonId: this._currentLessonId, activeStepId: null });
      return;
    }

    const activeStep = steps[activeIdx];
    this._activeStepId = activeStep?.id || null;
    appEvents.emit('lesson:activeStepChanged', { lessonId: this._currentLessonId, activeStepId: this._activeStepId });

    const hints = STEP_HINT[lang] || STEP_HINT.es;
    const hint = hints[this._activeStepId] || '';

    const card = document.createElement('div');
    card.className = 'mission-card';

    const header = document.createElement('div');
    header.className = 'mission-header';

    const badge = document.createElement('span');
    badge.className = 'mission-badge';
    badge.textContent = this._getCopy(lang).nowLabel;
    header.appendChild(badge);

    const stepsProgress = document.createElement('span');
    stepsProgress.style.cssText = 'font-size:10px;color:var(--text-tertiary);margin-left:auto;';
    const completedCount = steps.filter(s => completedIds.has(s.id)).length;
    stepsProgress.textContent = `${completedCount}/${steps.length}`;
    header.appendChild(stepsProgress);

    card.appendChild(header);

    const stepEl = document.createElement('div');
    stepEl.className = 'mission-step active';

    const icon = document.createElement('span');
    icon.className = 'mission-step-icon';
    icon.textContent = activeIdx + 1;
    stepEl.appendChild(icon);

    const text = document.createElement('span');
    text.className = 'mission-step-text';
    text.textContent = this._getItemLabel(activeStep.id, lang);
    stepEl.appendChild(text);

    if (hint) {
      const hintEl = document.createElement('span');
      hintEl.className = 'mission-step-hint';
      hintEl.textContent = hint;
      stepEl.appendChild(hintEl);
    }

    card.appendChild(stepEl);
    container.appendChild(card);
  }

  getActiveStepId() {
    return this._activeStepId;
  }

  getStepTarget() {
    if (!this._activeStepId) return null;
    return STEP_TARGET_MAP[this._activeStepId] || null;
  }

  _getItemLabel(id, lang) {
    const labels = {
      es: {
        'adjust-hue': 'Cambiar el matiz',
        'adjust-saturation': 'Cambiar la saturación',
        'adjust-value': 'Cambiar el valor',
        'apply-color': 'Aplicar color a la escena',
        'assign-palette': 'Asignar paleta a luces',
        'write-observation': 'Escribir observación',
        'identify-complement': 'Identificar color complementario',
        'adjust-intensity': 'Ajustar intensidad de la luz',
        'add-light': 'Agregar una luz',
        'take-screenshot': 'Tomar captura',
        'compare-versions': 'Comparar versiones',
        'justify-choice': 'Justificar elección'
      },
      en: {
        'adjust-hue': 'Change the hue',
        'adjust-saturation': 'Change the saturation',
        'adjust-value': 'Change the value',
        'apply-color': 'Apply color to the scene',
        'assign-palette': 'Assign palette to lights',
        'write-observation': 'Write an observation',
        'identify-complement': 'Identify the complementary color',
        'adjust-intensity': 'Adjust light intensity',
        'add-light': 'Add a light',
        'take-screenshot': 'Take a screenshot',
        'compare-versions': 'Compare versions',
        'justify-choice': 'Justify your choice'
      }
    };
    const dict = labels[lang] || labels.es;
    return dict[id] || id;
  }

  _getCopy(lang) {
    const copies = {
      es: { nowLabel: 'Ahora' },
      en: { nowLabel: 'Now' }
    };
    return copies[lang] || copies.es;
  }
}
