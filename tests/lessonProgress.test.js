import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage if not available (e.g. in node environment)
if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
    const store = {};
    global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
}

describe('Lesson Progress', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('localStorage is mocked and functional', () => {
        localStorage.setItem('test', 'value');
        expect(localStorage.getItem('test')).toBe('value');
    });

    it('can store and retrieve completed lesson IDs', () => {
        const ids = ['hsv', 'complementary'];
        localStorage.setItem('chromaLab.completedLessons', JSON.stringify(ids));
        const stored = JSON.parse(localStorage.getItem('chromaLab.completedLessons'));
        expect(stored).toEqual(['hsv', 'complementary']);
    });

    it('stores controls collapsed state', () => {
        localStorage.setItem('chromaLab.controlsCollapsed', 'true');
        expect(localStorage.getItem('chromaLab.controlsCollapsed')).toBe('true');
    });

    it('handles empty completed lessons list', () => {
        const stored = JSON.parse(localStorage.getItem('chromaLab.completedLessons') || '[]');
        expect(Array.isArray(stored)).toBe(true);
        expect(stored).toHaveLength(0);
    });

    it('can toggle controls collapsed state', () => {
        localStorage.setItem('chromaLab.controlsCollapsed', 'false');
        expect(localStorage.getItem('chromaLab.controlsCollapsed')).toBe('false');
        localStorage.setItem('chromaLab.controlsCollapsed', 'true');
        expect(localStorage.getItem('chromaLab.controlsCollapsed')).toBe('true');
    });
});
