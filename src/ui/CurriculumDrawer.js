import { getLightTypeLabel } from '../localization.js';

const DRAWER_OPEN_CLASS = 'open';

export default class CurriculumDrawer {
  constructor(getLang, getCopy, onSelectLesson) {
    this._getLang = getLang;
    this._getCopy = getCopy;
    this._onSelect = onSelectLesson;
    this._container = document.getElementById('curriculum-drawer');
  }

  render({ lessons, currentId, completedIds = [], lockedIds = [] }) {
    if (!this._container) return;
    const copy = this._getCopy();
    const lang = this._getLang();

    let html = `<div class="curriculum-header">
      <h2 class="curriculum-title">${copy.title || 'Curriculum'}</h2>
      <button class="curriculum-close" aria-label="${copy.close || 'Close'}" data-action="close">&times;</button>
    </div>
    <ol class="curriculum-list">`;

    lessons.forEach((lesson, index) => {
      const isActive = lesson.id === currentId;
      const isCompleted = completedIds.includes(index);
      const isLocked = lockedIds.includes(index);
      const statusClass = isActive ? 'current' : isCompleted ? 'completed' : isLocked ? 'locked' : '';
      const statusIcon = isCompleted ? '✓' : isLocked ? '🔒' : isActive ? '→' : '';
      const categoryName = typeof lesson.category === 'object' ? (lesson.category[lang] || lesson.category.es) : (lesson.category || '');

      html += `<li class="curriculum-item ${statusClass}" data-index="${index}">
        <button class="curriculum-item-btn" ${isLocked ? 'disabled' : ''} data-index="${index}">
          <span class="curriculum-item-status">${statusIcon}</span>
          <span class="curriculum-item-name">${lesson.name[lang] || lesson.name.es}</span>
          <span class="curriculum-item-category">${categoryName}</span>
        </button>
      </li>`;
    });

    html += '</ol>';
    this._container.innerHTML = html;

    this._container.querySelectorAll('.curriculum-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        if (!isNaN(index)) this._onSelect(index);
      });
    });

    this._container.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());
  }

  open() {
    this._container?.classList.add(DRAWER_OPEN_CLASS);
  }

  close() {
    this._container?.classList.remove(DRAWER_OPEN_CLASS);
  }

  isOpen() {
    return this._container?.classList.contains(DRAWER_OPEN_CLASS) || false;
  }

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }
}
