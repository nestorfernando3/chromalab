/**
 * LessonNavigator — handles lesson progression, dots, progress bar,
 * header updates, goal/observe sections and keyboard shortcuts.
 */
import { clearChildren, setText } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';

export class LessonNavigator {
    /**
     * @param {string[]} presetNames
     * @param {Function} onLessonLoad - async callback(index)
     */
    constructor(presetNames, onLessonLoad) {
        this.presetNames = presetNames;
        this.onLessonLoad = onLessonLoad;
        this.currentIndex = 0;

        this._createLessonDots();
        this._setupNavigation();
        this._setupKeyboardShortcuts();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    updateProgress(index) {
        const fill = document.getElementById('progress-fill');
        if (fill) {
            fill.style.width = `${((index + 1) / this.presetNames.length) * 100}%`;
        }
    }

    updateLessonHeader(preset, index) {
        setText('lesson-number', index + 1);
        setText('lesson-category', preset.category);
        setText('lesson-title', preset.name);

        const difficultyEl = document.getElementById('difficulty-badge');
        if (difficultyEl) {
            difficultyEl.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i < preset.difficulty);
            });
        }
    }

    updateGoalSection(preset) {
        setText('goal-text', preset.goal);
    }

    updateObserveSection(preset) {
        const list = document.getElementById('observe-list');
        if (!list) return;

        clearChildren(list);
        (preset.whatToObserve || []).forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
    }

    updatePracticeSection(preset) {
        const task = document.getElementById('task-text');
        const output = document.getElementById('output-text');

        if (task) task.textContent = preset.practice?.task || '';
        if (output) output.textContent = preset.practice?.expectedOutput || '';
    }

    updateNavigation(index) {
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === this.presetNames.length - 1;

        document.querySelectorAll('.lesson-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    get index() {
        return this.currentIndex;
    }

    set index(val) {
        this.currentIndex = val;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _createLessonDots() {
        const container = document.getElementById('lesson-dots');
        if (!container) return;

        this.presetNames.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'lesson-dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => this.onLessonLoad(index));
            container.appendChild(dot);
        });
    }

    _setupNavigation() {
        document.getElementById('btn-prev')?.addEventListener('click', () => {
            if (this.currentIndex > 0) this.onLessonLoad(this.currentIndex - 1);
        });

        document.getElementById('btn-next')?.addEventListener('click', () => {
            if (this.currentIndex < this.presetNames.length - 1) {
                this.onLessonLoad(this.currentIndex + 1);
            }
        });
    }

    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.currentIndex > 0) this.onLessonLoad(this.currentIndex - 1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.currentIndex < this.presetNames.length - 1) {
                        this.onLessonLoad(this.currentIndex + 1);
                    }
                    break;
                case 'r': case 'R':
                    appEvents.emit('resetControls');
                    break;
                default: {
                    const idx = parseInt(e.key) - 1;
                    if (!isNaN(idx) && idx >= 0 && idx < this.presetNames.length) {
                        this.onLessonLoad(idx);
                    }
                }
            }
        });
    }
}
