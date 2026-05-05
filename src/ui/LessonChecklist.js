// LessonChecklist.js — UI component that renders the lesson checklist

import { clearChildren } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';

export class LessonChecklist {
    constructor(getLang, progressEngine) {
        this.getLang = getLang;
        this.progressEngine = progressEngine;
        this._container = null;
        this._currentLessonId = null;

        this._onCriteriaCompleted = (payload) => {
            if (payload.lessonId === this._currentLessonId) {
                this._markItem(payload.criteriaId, true);
            }
        };
        appEvents.on('lesson:criteriaCompleted', this._onCriteriaCompleted);
    }

    destroy() {
        appEvents.off('lesson:criteriaCompleted', this._onCriteriaCompleted);
    }

    render(lessonId, checklist = []) {
        this._currentLessonId = lessonId;
        const container = document.getElementById('lesson-checklist');
        if (!container) return;
        this._container = container;
        clearChildren(container);

        if (!checklist.length) {
            container.classList.add('hidden');
            return;
        }
        container.classList.remove('hidden');

        const lang = this.getLang();
        const copy = this._getCopy(lang);

        // Header
        const header = document.createElement('div');
        header.className = 'section-label';
        header.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg icon" aria-hidden="true"><path d="M9 11l3 3L22 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> <span>${copy.title}</span>`;
        container.appendChild(header);

        // List with compression for completed steps
        const ul = document.createElement('ul');
        ul.className = 'checklist';

        const completedIds = this.progressEngine
            ? this.progressEngine.getCompletedCriteria(lessonId)
            : [];

        const hasCompletedItems = checklist.some(item => completedIds.includes(item.id));

        checklist.forEach((item, index) => {
            const isCompleted = completedIds.includes(item.id);
            const isRequired = item.required;
            const isActive = !isCompleted && !checklist.slice(0, checklist.indexOf(item)).some(s => !completedIds.includes(s.id)) && checklist.slice(0, index).every(s => completedIds.includes(s.id) || !s.required);
            const isFirstPending = !isCompleted && !checklist.slice(0, index).some(s => !completedIds.includes(s.id));

            const li = document.createElement('li');
            li.className = 'checklist-item';
            if (isCompleted) {
                li.classList.add('completed');
                if (hasCompletedItems) {
                    li.style.setProperty('opacity', '0.55');
                }
            }
            li.dataset.criteriaId = item.id;

            const checkbox = document.createElement('span');
            checkbox.className = 'checklist-box';
            checkbox.setAttribute('aria-hidden', 'true');

            const text = document.createElement('span');
            text.className = 'checklist-text';
            text.textContent = this._getItemLabel(item.id, lang);

            if (isRequired) {
                const requiredBadge = document.createElement('span');
                requiredBadge.className = 'checklist-required';
                requiredBadge.textContent = copy.required;
                text.appendChild(requiredBadge);
            }

            li.appendChild(checkbox);
            li.appendChild(text);
            ul.appendChild(li);
        });

        container.appendChild(ul);

        // Progress bar
        const completedCount = completedIds.length;
        const totalCount = checklist.filter(c => c.required).length || checklist.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const progressWrap = document.createElement('div');
        progressWrap.className = 'checklist-progress-wrap';

        const progressBar = document.createElement('div');
        progressBar.className = 'checklist-progress-bar';
        progressBar.style.width = percent + '%';

        const progressText = document.createElement('span');
        progressText.className = 'checklist-progress-text';
        progressText.setAttribute('aria-live', 'polite');
        progressText.setAttribute('aria-atomic', 'true');
        progressText.textContent = `${percent}% ${copy.complete}`;

        progressWrap.appendChild(progressBar);
        progressWrap.appendChild(progressText);
        container.appendChild(progressWrap);

        // Status
        const allRequiredDone = checklist
            .filter(c => c.required)
            .every(c => completedIds.includes(c.id));

        if (allRequiredDone && checklist.length > 0) {
            const doneMsg = document.createElement('p');
            doneMsg.className = 'checklist-done';
            doneMsg.setAttribute('role', 'status');
            doneMsg.setAttribute('aria-live', 'polite');
            doneMsg.textContent = copy.lessonDone;
            container.appendChild(doneMsg);
        }
    }

    _markItem(criteriaId, completed) {
        if (!this._container) return;
        const item = this._container.querySelector(`[data-criteria-id="${criteriaId}"]`);
        if (item) {
            item.classList.toggle('completed', completed);
        }
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
            es: {
                title: 'Pasos de la lección',
                required: 'Obligatorio',
                complete: 'completado',
                lessonDone: '¡Lección completada! Puedes pasar a la siguiente.'
            },
            en: {
                title: 'Lesson steps',
                required: 'Required',
                complete: 'complete',
                lessonDone: 'Lesson completed! You can move on to the next one.'
            }
        };
        return copies[lang] || copies.es;
    }
}
