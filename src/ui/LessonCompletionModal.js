import { clearChildren } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';

export class LessonCompletionModal {
  constructor(getLang, getCopy) {
    this.getLang = getLang;
    this.getCopy = getCopy;
    this.el = document.getElementById('completion-modal');
    this._lastFocused = null;
  }

  show({ preset, completedLabels = [], paletteColors = [], observation = '' } = {}) {
    if (!this.el || !preset) return;
    clearChildren(this.el);
    const lang = this.getLang();
    const copy = this.getCopy();
    const message = preset.completionMessage?.[lang] || preset.completionMessage?.es || copy.defaultMessage;

    const card = document.createElement('div');
    card.className = 'completion-card';
    card.innerHTML = `
      <div class="completion-burst" aria-hidden="true"></div>
      <h2 id="completion-title">${copy.title}</h2>
      <p>${message}</p>
      <div class="completion-modal-evidence"></div>
      <div class="completion-modal-actions"></div>
    `;

    const evidence = card.querySelector('.completion-modal-evidence');

    if (paletteColors.length > 0) {
      const paletteRow = document.createElement('div');
      paletteRow.className = 'completion-evidence-item completion-evidence-palette';
      paletteRow.innerHTML = `<span class="completion-evidence-label">${copy.paletteLabel || 'Paleta'}:</span> `;
      paletteColors.forEach(c => {
        const swatch = document.createElement('span');
        swatch.className = 'completion-palette-swatch';
        swatch.style.backgroundColor = c;
        swatch.setAttribute('aria-label', c);
        paletteRow.appendChild(swatch);
      });
      evidence.appendChild(paletteRow);
    }

    if (observation) {
      const obsEl = document.createElement('div');
      obsEl.className = 'completion-evidence-item';
      obsEl.innerHTML = `<span class="completion-evidence-label">${copy.observationLabel || 'Observación'}:</span> ${observation}`;
      evidence.appendChild(obsEl);
    }

    if (completedLabels.length > 0) {
      const stepsEl = document.createElement('div');
      stepsEl.className = 'completion-evidence-item';
      stepsEl.innerHTML = `<span class="completion-evidence-label">${copy.stepsLabel || 'Pasos'}:</span> ${completedLabels.join(', ')}`;
      evidence.appendChild(stepsEl);
    }

    const actions = card.querySelector('.completion-modal-actions');
    const next = document.createElement('button');
    next.className = 'btn btn-primary';
    next.type = 'button';
    next.textContent = copy.next;
    next.addEventListener('click', () => {
      this.close();
      appEvents.emit('lesson:nextRequested');
    });
    actions.appendChild(next);

    const close = document.createElement('button');
    close.className = 'btn btn-ghost';
    close.type = 'button';
    close.textContent = copy.review;
    close.addEventListener('click', () => this.close());
    actions.appendChild(close);

    this.el.appendChild(card);
    this.el.classList.remove('hidden');
    this._lastFocused = document.activeElement;
    this._trapFocus();
  }

  close() {
    this.el?.classList.add('hidden');
    this._restoreFocus();
  }

  _trapFocus() {
    if (!this.el) return;
    const focusable = this.el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    this._trapHandler = handler;
    this.el.addEventListener('keydown', handler);
    focusable[0].focus();
  }

  _restoreFocus() {
    if (this._trapHandler && this.el) {
      this.el.removeEventListener('keydown', this._trapHandler);
      this._trapHandler = null;
    }
    if (this._lastFocused && typeof this._lastFocused.focus === 'function') {
      this._lastFocused.focus();
    }
    this._lastFocused = null;
  }
}
