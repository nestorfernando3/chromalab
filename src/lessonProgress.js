// lessonProgress.js — Pedagogical progress engine for ChromaLab
// Listens to events, evaluates checklist criteria, and emits completion changes.

import { appEvents } from './utils/events.js';

const STORAGE_KEY = 'chromaLab.lessonProgress.v1';

/**
 * LessonProgressEngine tracks checklist completion per lesson.
 * It listens to appEvents, evaluates criteria from presets, and persists state.
 */
export class LessonProgressEngine {
    constructor() {
        this._criteria = new Map(); // lessonId -> Set(completedCriteriaIds)
        this._observations = new Map(); // lessonId -> string
        this._load();
        this._setupListeners();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Register a lesson's checklist and restore any persisted progress.
     */
    registerLesson(lessonId, checklist = [], completionRules = {}) {
        if (!this._criteria.has(lessonId)) {
            this._criteria.set(lessonId, new Set());
        }
        this._checklist = checklist;
        this._completionRules = completionRules;
        this._currentLessonId = lessonId;

        // Emit current state so UI can sync
        const completed = this._criteria.get(lessonId);
        const percent = this._computePercent(checklist, completed);
        appEvents.emit('lesson:completionChanged', {
            lessonId,
            completed: this._isLessonComplete(checklist, completed, completionRules),
            percent,
            criteriaCompleted: Array.from(completed)
        });
    }

    /**
     * Check if a specific criterion is completed for the current lesson.
     */
    isCompleted(criteriaId) {
        const set = this._criteria.get(this._currentLessonId);
        return set ? set.has(criteriaId) : false;
    }

    /**
     * Get all completed criteria for a lesson.
     */
    getCompletedCriteria(lessonId) {
        const set = this._criteria.get(lessonId);
        return set ? Array.from(set) : [];
    }

    /**
     * Get observation text for a lesson.
     */
    getObservation(lessonId) {
        return this._observations.get(lessonId) || '';
    }

    /**
     * Set observation text for a lesson (for minObservationLength rule).
     */
    setObservation(lessonId, text) {
        const prev = this._observations.get(lessonId) || '';
        this._observations.set(lessonId, text);
        if (text !== prev) {
            appEvents.emit('lesson:responseChanged', {
                lessonId,
                field: 'observation',
                value: text
            });
            this._evaluateObservationRule(lessonId, text);
        }
    }

    /**
     * Reset all progress (for testing or user request).
     */
    reset() {
        this._criteria.clear();
        this._observations.clear();
        this._save();
    }

    destroy() {
        this._unsubscribe.forEach(fn => fn());
        this._unsubscribe = [];
    }

    // ── Event listeners ───────────────────────────────────────────────────────

    _setupListeners() {
        this._unsubscribe = [];

        const listen = (event, defaultCriteriaId) => {
            const handler = (payload) => this._onEvent(payload, event, defaultCriteriaId);
            appEvents.on(event, handler);
            this._unsubscribe.push(() => appEvents.off(event, handler));
        };

        listen('color:hueChanged', 'adjust-hue');
        listen('color:saturationChanged', 'adjust-saturation');
        listen('color:valueChanged', 'adjust-value');
        listen('palette:applied', 'apply-color');
        listen('palette:assignedToLights', 'assign-palette');
        listen('light:added', 'add-light');
        listen('screenshotTaken', 'take-screenshot');
        // Note: lesson:responseChanged is handled internally by setObservation
    }

    _onEvent(payload, eventName, defaultCriteriaId) {
        const lessonId = payload?.lessonId;
        if (!lessonId) return;

        const checklist = this._checklist || [];
        const match = checklist.find(c =>
            c.event === eventName ||
            c.id === defaultCriteriaId
        );
        const criteriaId = match?.id || defaultCriteriaId;
        if (!criteriaId) return;
        // Only mark criteria that actually exist in the lesson checklist
        if (!checklist.some(c => c.id === criteriaId)) return;

        // Check for specific count requirement (like minimum 3 lights)
        if (match?.count && payload?.count !== undefined) {
            if (payload.count >= match.count) {
                this._markCriterionCompleted(lessonId, criteriaId);
            }
        } else {
            this._markCriterionCompleted(lessonId, criteriaId);
        }
    }

    // ── Criteria evaluation ───────────────────────────────────────────────────

    _markCriterionCompleted(lessonId, criteriaId) {
        if (!this._criteria.has(lessonId)) {
            this._criteria.set(lessonId, new Set());
        }
        const completed = this._criteria.get(lessonId);
        if (completed.has(criteriaId)) return;

        completed.add(criteriaId);
        this._save();

        appEvents.emit('lesson:criteriaCompleted', { lessonId, criteriaId });

        const checklist = this._checklist || [];
        const rules = this._completionRules || {};
        const percent = this._computePercent(checklist, completed);
        const isComplete = this._isLessonComplete(checklist, completed, rules);

        appEvents.emit('lesson:completionChanged', {
            lessonId,
            completed: isComplete,
            percent,
            criteriaCompleted: Array.from(completed)
        });
    }

    _evaluateObservationRule(lessonId, text) {
        const rules = this._completionRules || {};
        const minLen = rules.minObservationLength;
        if (minLen && text.length >= minLen) {
            this._markCriterionCompleted(lessonId, 'write-observation');
        }
    }

    _computePercent(checklist, completed) {
        if (!checklist.length) return 0;
        const required = checklist.filter(c => c.required);
        const total = required.length || checklist.length;
        const done = required.filter(c => completed.has(c.id)).length;
        return Math.round((done / total) * 100);
    }

    _isLessonComplete(checklist, completed, rules) {
        if (rules.mode === 'allRequired') {
            const required = checklist.filter(c => c.required);
            if (!required.length) return false;
            return required.every(c => completed.has(c.id));
        }
        // Default: any required criteria
        const required = checklist.filter(c => c.required);
        return required.length > 0 && required.every(c => completed.has(c.id));
    }

    // ── Persistence ───────────────────────────────────────────────────────────

    _save() {
        if (typeof localStorage === 'undefined') return;
        const data = {
            version: 1,
            criteria: {},
            observations: {}
        };
        this._criteria.forEach((set, lessonId) => {
            data.criteria[lessonId] = Array.from(set);
        });
        this._observations.forEach((text, lessonId) => {
            data.observations[lessonId] = text;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    _load() {
        if (typeof localStorage === 'undefined') return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.version !== 1) return;
            if (data.criteria) {
                Object.entries(data.criteria).forEach(([lessonId, arr]) => {
                    this._criteria.set(lessonId, new Set(arr));
                });
            }
            if (data.observations) {
                Object.entries(data.observations).forEach(([lessonId, text]) => {
                    this._observations.set(lessonId, text);
                });
            }
        } catch {
            // Ignore corrupted storage
        }
    }
}
