import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EvidenceStore } from '../src/evidenceStore.js';

describe('EvidenceStore', () => {
    let store;

    beforeEach(() => {
        store = new EvidenceStore();
        store.reset();
    });

    afterEach(() => {
        store.reset();
    });

    it('returns null for unknown lesson', () => {
        expect(store.getLessonEvidence('nonexistent')).toBeNull();
    });

    it('saves and retrieves response', () => {
        store.saveResponse('lesson-1', { observation: 'test observation' });
        const evidence = store.getLessonEvidence('lesson-1');
        expect(evidence).not.toBeNull();
        expect(evidence.response.observation).toBe('test observation');
        expect(evidence.response.updatedAt).toBeTruthy();
    });

    it('saves color state', () => {
        const state = { hue: 200, saturation: 0.7, value: 0.5 };
        store.saveColorState('lesson-1', state);
        const evidence = store.getLessonEvidence('lesson-1');
        expect(evidence.colorState).toEqual(state);
    });

    it('registers screenshots', () => {
        store.registerScreenshot('lesson-1', 'screenshot.png', 'evidence');
        const evidence = store.getLessonEvidence('lesson-1');
        expect(evidence.screenshots).toHaveLength(1);
        expect(evidence.screenshots[0].filename).toBe('screenshot.png');
        expect(evidence.screenshots[0].role).toBe('evidence');
    });

    it('saves criteria progress', () => {
        store.saveCriteria('lesson-1', ['adjust-hue', 'adjust-saturation']);
        const evidence = store.getLessonEvidence('lesson-1');
        expect(evidence.completedCriteria).toContain('adjust-hue');
        expect(evidence.completedCriteria).toContain('adjust-saturation');
    });

    it('exports to JSON', () => {
        store.saveResponse('lesson-1', { observation: 'test' });
        const json = store.exportToJSON();
        const data = JSON.parse(json);
        expect(data.version).toBe(1);
        expect(data.lessons['lesson-1'].response.observation).toBe('test');
    });

    it('handles corrupted localStorage gracefully', () => {
        const corrupted = new EvidenceStore();
        expect(() => corrupted.reset()).not.toThrow();
    });
});
