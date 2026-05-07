import { clearChildren } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';

export class LessonCompletionModal {
  constructor(getLang, getCopy) {
    this.getLang = getLang;
    this.getCopy = getCopy;
    this.el = document.getElementById('completion-modal');
  }

  show({ preset, completedLabels = [] } = {}) {
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
    completedLabels.forEach(label => {
      const item = document.createElement('span');
      item.className = 'completion-evidence-item';
      item.textContent = label;
      evidence.appendChild(item);
    });

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
  }

  close() {
    this.el?.classList.add('hidden');
  }
}
