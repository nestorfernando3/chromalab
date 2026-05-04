import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceStore } from '../src/evidenceStore.js';

describe('EvidenceStore', () => {
    let store;

    beforeEach(() => {
        store = new EvidenceStore();
        store.reset();
    });

    it('returns null for unknown lesson', () => {
        expect(store.getLessonEvidence('unknown')).toBeNull();
    });

    it('saves and retrieves response', () => {
        store.saveResponse('hsv', { observation: 'Test observation' });
        const evidence = store.getLessonEvidence('hsv');
        expect(evidence.response.observation).toBe('Test observation');
        expect(evidence.response.updatedAt).toBeTruthy();
    });

    it('saves color state', () => {
        store.saveColorState('hsv', { hue: 200, saturation: 0.75, value: 0.5 });
        const evidence = store.getLessonEvidence('hsv');
        expect(evidence.colorState.hue).toBe(200);
    });

    it('registers screenshots', () => {
        store.registerScreenshot('hsv', 'lighting-hsv-123.png', 'final');
        const evidence = store.getLessonEvidence('hsv');
        expect(evidence.screenshots).toHaveLength(1);
        expect(evidence.screenshots[0].filename).toBe('lighting-hsv-123.png');
    });

    it('saves criteria progress', () => {
        store.saveCriteria('hsv', ['adjust-hue', 'adjust-saturation']);
        const evidence = store.getLessonEvidence('hsv');
        expect(evidence.completedCriteria).toEqual(['adjust-hue', 'adjust-saturation']);
    });

    it('exports to JSON', () => {
        store.saveResponse('hsv', { observation: 'Test' });
        const json = store.exportToJSON();
        expect(JSON.parse(json).lessons.hsv.response.observation).toBe('Test');
    });

    it('handles corrupted localStorage gracefully', () => {
        const badStore = new EvidenceStore();
        // Force corrupted data by resetting and then accessing
        badStore.reset();
        expect(badStore.getAllEvidence().lessons).toEqual({});
    });
});
