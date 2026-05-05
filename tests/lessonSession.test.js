import { describe, it, expect, beforeEach } from 'vitest';
import { LessonSession } from '../src/lessonSession.js';

// Mock localStorage if not available
if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
    const store = {};
    global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
}

describe('LessonSession', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes with 8 preset names', () => {
        const session = new LessonSession();
        expect(session.presetNames).toHaveLength(8);
        expect(session.totalCount).toBe(8);
    });

    it('loadLesson returns a deep-cloned preset', () => {
        const session = new LessonSession();
        const preset = session.loadLesson(0);
        expect(preset).toBeTypeOf('object');
        expect(preset.id).toBe('hsv');
        // Mutations should not affect the raw preset
        preset.lights[0].intensity = 999;
        const raw = session.loadLesson(0);
        expect(raw.lights[0].intensity).not.toBe(999);
    });

    it('loadLesson marks previous lesson completed', () => {
        const session = new LessonSession();
        let completedEvent = null;
        session.onChange((type, data) => {
            if (type === 'lessonCompleted') completedEvent = data;
        });

        session.loadLesson(0);
        expect(session.isCompleted('hsv')).toBe(false);

        session.loadLesson(1);
        expect(session.isCompleted('hsv')).toBe(true);
        expect(completedEvent).toEqual({ lessonId: 'hsv' });
    });

    it('getCompletedIndexes returns correct indexes', () => {
        const session = new LessonSession();
        session.loadLesson(0);
        session.loadLesson(1);
        session.loadLesson(2);
        expect(session.getCompletedIndexes()).toContain(0);
        expect(session.getCompletedIndexes()).toContain(1);
        expect(session.getCompletedIndexes()).not.toContain(2);
    });

    it('markCompleted is idempotent', () => {
        const session = new LessonSession();
        expect(session.markCompleted('hsv')).toBe(true);
        expect(session.markCompleted('hsv')).toBe(false);
    });

    it('persists completed lessons to localStorage', () => {
        const session = new LessonSession();
        session.markCompleted('hsv');

        const raw = localStorage.getItem('chromaLab.completedLessons');
        const parsed = JSON.parse(raw);
        expect(parsed).toContain('hsv');
    });

    it('loadLesson returns null for invalid index', () => {
        const session = new LessonSession();
        expect(session.loadLesson(-1)).toBeNull();
        expect(session.loadLesson(100)).toBeNull();
    });

    it('currentPreset and currentIndex reflect loaded lesson', () => {
        const session = new LessonSession();
        session.loadLesson(2);
        expect(session.currentIndex).toBe(2);
        expect(session.currentPreset.id).toBe('analogous');
    });
});
