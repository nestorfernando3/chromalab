// StudentResponse.js — UI for observation, justification, and evidence per lesson

import { appEvents } from '../utils/events.js';
import { getAppCopy } from '../localization.js';
import { hsvToHex } from '../utils/color.js';

export class StudentResponse {
    constructor(getLang, evidenceStore, progressEngine) {
        this.getLang = getLang;
        this.evidenceStore = evidenceStore;
        this.progressEngine = progressEngine;
        this._container = null;
        this._currentLessonId = null;
        this._textarea = null;
        this._saveStatusEl = null;
        this._saveTimeout = null;
        this._state = 'empty';

        this._onCompletionChanged = (payload) => {
            if (payload?.lessonId === this._currentLessonId) {
                this._setState('completed');
            }
        };
    }

    render(lessonId, preset) {
        this._currentLessonId = lessonId;
        const container = document.getElementById('student-response');
        if (!container) return;
        this._container = container;
        container.innerHTML = '';

        const lang = this.getLang();
        const copy = this._getCopy(lang);
        const prompt = preset?.reflectionPrompt?.[lang] || preset?.reflectionPrompt?.es || '';
        const completionMsg = preset?.completionMessage?.[lang] || preset?.completionMessage?.es || '';

        // Header
        const header = document.createElement('div');
        header.className = 'section-label';
        header.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg icon" aria-hidden="true"><path d="M4 6.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V6.3A1.5 1.5 0 0 1 6.5 4.8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 4.8V9h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg> <span>${copy.title}</span>`;
        container.appendChild(header);

        // Check if lesson is complete - show completion summary
        const checklist = preset?.checklist || [];
        const completedIds = this.progressEngine ? this.progressEngine.getCompletedCriteria(lessonId) : [];
        const allRequiredDone = checklist.filter(c => c.required).every(c => completedIds.includes(c.id));

        if (allRequiredDone && checklist.length > 0) {
            this._renderCompletionSummary(container, completionMsg, copy);
        }

        // Prompt
        if (prompt) {
            const promptEl = document.createElement('p');
            promptEl.className = 'response-prompt';
            promptEl.textContent = prompt;
            container.appendChild(promptEl);
        }

        // Textarea
        const existingObservation = this.progressEngine
            ? this.progressEngine.getObservation(lessonId)
            : '';

        this._textarea = document.createElement('textarea');
        this._textarea.className = 'response-textarea';
        this._textarea.placeholder = copy.placeholder;
        this._textarea.value = existingObservation;
        this._textarea.rows = 3;
        this._textarea.setAttribute('aria-label', copy.title);
        this._textarea.addEventListener('input', () => this._onInput());
        container.appendChild(this._textarea);

        // Save status
        this._saveStatusEl = document.createElement('span');
        this._saveStatusEl.className = 'response-status';
        this._saveStatusEl.setAttribute('aria-live', 'polite');
        this._saveStatusEl.textContent = existingObservation ? copy.saved : '';
        container.appendChild(this._saveStatusEl);

        // Current values display
        const valuesWrap = document.createElement('div');
        valuesWrap.className = 'response-values';
        valuesWrap.innerHTML = `<span class="response-values-label">${copy.currentValues}</span>`;
        container.appendChild(valuesWrap);
        this._valuesWrap = valuesWrap;

        // Check evidence readiness - show empty state or show actions
        const hasEvidence = existingObservation || completedIds.length > 0;
        if (!hasEvidence) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `<span class="empty-state-icon">📝</span><span class="empty-state-text">${copy.noEvidence}</span>`;
            container.appendChild(emptyState);
        }

        // Export / copy actions (only shown when evidence exists)
        if (hasEvidence) {
            const actions = document.createElement('div');
            actions.className = 'response-actions';

            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-ghost response-action-btn';
            exportBtn.textContent = copy.exportBtn;
            exportBtn.addEventListener('click', () => this._exportEvidence());
            actions.appendChild(exportBtn);

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-ghost response-action-btn';
            copyBtn.textContent = copy.copyBtn;
            copyBtn.addEventListener('click', () => this._copySummary());
            actions.appendChild(copyBtn);

            container.appendChild(actions);
        }

        // Listen for color changes to update values display
        this._onColorChange = (payload) => {
            if (payload?.lessonId === lessonId) {
                this._updateValuesDisplay(payload);
            }
        };
        appEvents.on('color:hueChanged', this._onColorChange);
        appEvents.on('color:saturationChanged', this._onColorChange);
        appEvents.on('color:valueChanged', this._onColorChange);
        appEvents.on('palette:previewChanged', this._onColorChange);

        // Listen for lesson completion
        appEvents.on('lesson:completed', this._onCompletionChanged);

        // Set initial state
        if (existingObservation) {
            this._setState('saved');
        } else if (allRequiredDone) {
            this._setState('completed');
        } else {
            this._setState('empty');
        }
    }

    _renderCompletionSummary(container, message, copy) {
        const summary = document.createElement('div');
        summary.className = 'completion-summary';
        summary.setAttribute('role', 'status');
        summary.setAttribute('aria-live', 'polite');

        const badge = document.createElement('div');
        badge.className = 'completion-badge';
        badge.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true" width="14" height="14"><path d="M9 11l3 3L22 4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ${copy.lessonCompleteLabel || 'Completada'}`;
        summary.appendChild(badge);

        if (message) {
            const title = document.createElement('div');
            title.className = 'completion-title';
            title.textContent = message;
            summary.appendChild(title);
        }

        const evidenceItems = document.createElement('div');
        evidenceItems.className = 'completion-evidence';
        const evLabels = [copy.evidencePalette || 'Paleta', copy.evidenceObservation || 'Observación', copy.evidenceScene || 'Escena'];
        evLabels.forEach(label => {
            const item = document.createElement('span');
            item.className = 'completion-evidence-item';
            item.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg" aria-hidden="true" width="12" height="12"><path d="M9 11l3 3L22 4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ${label}`;
            evidenceItems.appendChild(item);
        });
        summary.appendChild(evidenceItems);

        // Next lesson action
        const actions = document.createElement('div');
        actions.className = 'completion-actions';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.innerHTML = `${copy.nextLessonBtn || 'Siguiente lección'} <span class="arrow" aria-hidden="true">→</span>`;
        nextBtn.addEventListener('click', () => {
            appEvents.emit('lesson:nextRequested');
        });
        actions.appendChild(nextBtn);

        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-ghost';
        exportBtn.textContent = copy.exportEvidenceBtn || 'Exportar evidencia';
        exportBtn.addEventListener('click', () => this._exportEvidence());
        actions.appendChild(exportBtn);

        summary.appendChild(actions);
        container.appendChild(summary);
    }

    destroy() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        if (this._onColorChange) {
            appEvents.off('color:hueChanged', this._onColorChange);
            appEvents.off('color:saturationChanged', this._onColorChange);
            appEvents.off('color:valueChanged', this._onColorChange);
            appEvents.off('palette:previewChanged', this._onColorChange);
        }
        appEvents.off('lesson:completed', this._onCompletionChanged);
    }

    _setState(state) {
        this._state = state;
        if (!this._saveStatusEl) return;
        const copy = this._getCopy(this.getLang());
        switch (state) {
            case 'empty':
                this._saveStatusEl.textContent = '';
                this._saveStatusEl.className = 'response-status';
                break;
            case 'dirty':
                this._saveStatusEl.textContent = copy.unsaved || '';
                this._saveStatusEl.className = 'response-status response-status-dirty';
                break;
            case 'saving':
                this._saveStatusEl.textContent = copy.saving;
                this._saveStatusEl.className = 'response-status response-status-saving';
                break;
            case 'saved':
                this._saveStatusEl.textContent = `${copy.saved} — ${new Date().toLocaleTimeString()}`;
                this._saveStatusEl.className = 'response-status response-status-saved';
                break;
            case 'completed':
                this._saveStatusEl.textContent = copy.lessonCompleteLabel || 'Completada';
                this._saveStatusEl.className = 'response-status response-status-completed';
                break;
        }
    }

    _onInput() {
        const text = this._textarea?.value || '';
        const lessonId = this._currentLessonId;

        if (this._saveTimeout) clearTimeout(this._saveTimeout);

        if (!text.trim()) {
            this._setState('empty');
            return;
        }

        this._setState('dirty');

        this._saveTimeout = setTimeout(() => {
            this._setState('saving');
            if (this.progressEngine) {
                this.progressEngine.setObservation(lessonId, text);
            }
            if (this.evidenceStore) {
                this.evidenceStore.saveResponse(lessonId, { observation: text });
            }
            this._setState('saved');
        }, 600);
    }

    _updateValuesDisplay(payload) {
        if (!this._valuesWrap) return;
        const copy = this._getCopy(this.getLang());
        const palette = payload?.palette || [];
        const colorsHtml = palette.map(c =>
            `<span class="response-value-swatch" style="background:${c}" title="${c}"></span>`
        ).join('');
        this._valuesWrap.innerHTML = `<span class="response-values-label">${copy.currentValues}</span> ${colorsHtml}`;
    }

    _exportEvidence() {
        const copy = this._getCopy(this.getLang());
        const allEvidence = this.evidenceStore?.getAllEvidence?.() || {};
        const lessonIds = Object.keys(allEvidence);
        if (lessonIds.length === 0) {
            this._showToast(copy.exportEmpty || 'No evidence to export');
            return;
        }
        const payload = {
            exportedAt: new Date().toISOString(),
            lessons: lessonIds.map(id => ({
                lessonId: id,
                ...allEvidence[id]
            }))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chromalab-evidence-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async _copySummary() {
        const copy = this._getCopy(this.getLang());
        const lessonId = this._currentLessonId;
        if (!lessonId) return;
        const ev = this.evidenceStore?.getLessonEvidence?.(lessonId) || {};
        const observation = ev.response?.observation || this._textarea?.value || '';
        const palette = ev.colorState ? this._paletteFromState(ev.colorState) : [];
        const summary = `Lesson: ${lessonId}\nObservation: ${observation}\nPalette: ${palette.join(', ')}`;
        try {
            await navigator.clipboard.writeText(summary);
            this._showToast(copy.copied || 'Summary copied');
        } catch {
            this._showToast(copy.copied || 'Summary copied');
        }
    }

    _paletteFromState(state) {
        if (!state || typeof state.hue !== 'number') return [];
        return [hsvToHex(state.hue, state.saturation ?? 0.7, state.value ?? 0.5)];
    }

    _showToast(message) {
        const el = document.getElementById('status-toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('visible');
        setTimeout(() => el.classList.remove('visible'), 2000);
    }

    _getCopy(lang) {
        const copy = getAppCopy(lang);
        return copy.response || {};
    }
}
