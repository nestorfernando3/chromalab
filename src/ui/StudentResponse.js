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

        // Header
        const header = document.createElement('div');
        header.className = 'section-label';
        header.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg icon" aria-hidden="true"><path d="M4 6.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V6.3A1.5 1.5 0 0 1 6.5 4.8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 4.8V9h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg> <span>${copy.title}</span>`;
        container.appendChild(header);

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
        this._textarea.addEventListener('input', () => this._onInput());
        container.appendChild(this._textarea);

        // Save status
        this._saveStatusEl = document.createElement('span');
        this._saveStatusEl.className = 'response-status';
        this._saveStatusEl.textContent = existingObservation ? copy.saved : '';
        container.appendChild(this._saveStatusEl);

        // Current values display
        const valuesWrap = document.createElement('div');
        valuesWrap.className = 'response-values';
        valuesWrap.innerHTML = `<span class="response-values-label">${copy.currentValues}</span>`;
        container.appendChild(valuesWrap);
        this._valuesWrap = valuesWrap;

        // Export / copy actions
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
    }

    destroy() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        if (this._onColorChange) {
            appEvents.off('color:hueChanged', this._onColorChange);
            appEvents.off('color:saturationChanged', this._onColorChange);
            appEvents.off('color:valueChanged', this._onColorChange);
            appEvents.off('palette:previewChanged', this._onColorChange);
        }
    }

    _onInput() {
        const text = this._textarea?.value || '';
        const lessonId = this._currentLessonId;

        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveStatusEl.textContent = this._getCopy(this.getLang()).saving;

        this._saveTimeout = setTimeout(() => {
            if (this.progressEngine) {
                this.progressEngine.setObservation(lessonId, text);
            }
            if (this.evidenceStore) {
                this.evidenceStore.saveResponse(lessonId, { observation: text });
            }
            this._saveStatusEl.textContent = this._getCopy(this.getLang()).saved;
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
