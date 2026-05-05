// lessonSession.js — Lesson state and progression manager
// Owns current Lesson, Preset clone, and completion tracking.
// Does NOT know about DOM, Three.js, or rendering.

import { getPresetNames, getPreset } from './presets.js';

const STORAGE_KEY = 'chromaLab.completedLessons';

export class LessonSession {
    constructor() {
        this._presetNames = getPresetNames();
        this._currentIndex = 0;
        this._currentPreset = null;
        this._completedIds = new Set(this._loadCompleted());
        this._onChange = null;
    }

    /** Load a lesson by index. Marks the previous lesson as completed. */
    loadLesson(index) {
        if (index < 0 || index >= this._presetNames.length) return null;

        const previousId = this._currentPreset?.id || null;
        const nextId = this._presetNames[index];

        if (previousId && previousId !== nextId) {
            this.markCompleted(previousId);
        }

        this._currentIndex = index;
        const rawPreset = getPreset(nextId);
        // Deep clone so mutations (drag, sliders) don't corrupt the raw preset
        this._currentPreset = JSON.parse(JSON.stringify(rawPreset));

        this._notify('lessonLoaded', { preset: this._currentPreset, index });
        return this._currentPreset;
    }

    /** Mark a lesson as completed. Idempotent. */
    markCompleted(lessonId) {
        if (!lessonId || this._completedIds.has(lessonId)) return false;
        this._completedIds.add(lessonId);
        this._saveCompleted();
        this._notify('lessonCompleted', { lessonId });
        return true;
    }

    isCompleted(lessonId) {
        return this._completedIds.has(lessonId);
    }

    getCompletedIds() {
        return new Set(this._completedIds);
    }

    getCompletedIndexes() {
        return this._presetNames.reduce((indexes, id, idx) => {
            if (this._completedIds.has(id)) indexes.push(idx);
            return indexes;
        }, []);
    }

    get currentPreset() {
        return this._currentPreset;
    }

    get currentIndex() {
        return this._currentIndex;
    }

    get presetNames() {
        return [...this._presetNames];
    }

    get totalCount() {
        return this._presetNames.length;
    }

    /** Subscribe to state changes: ('lessonLoaded' | 'lessonCompleted', data) */
    onChange(callback) {
        this._onChange = callback;
    }

    _notify(type, data) {
        if (this._onChange) this._onChange(type, data);
    }

    _loadCompleted() {
        if (typeof localStorage === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    }

    _saveCompleted() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._completedIds]));
    }
}
