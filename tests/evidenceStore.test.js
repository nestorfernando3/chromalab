import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EvidenceStore } from '../src/evidenceStore.js';

describe('EvidenceStore', () => {
    let store;
    let mockStorage = {};

    beforeEach(() => {
        global.localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = String(value); },
            removeItem: (key) => { delete mockStorage[key]; },
            clear: () => { mockStorage = {}; }
        };
        store = new EvidenceStore();
        store.reset();
    });

    afterEach(() => {
        store.reset();
        mockStorage = {};
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

    it('exports to plain text', () => {
        store.saveResponse('lesson-1', {
            observation: 'El color se ve mas calido.',
            justification: 'La luz naranja domina la escena.',
            emotion: 'Calma'
        });
        store.saveColorState('lesson-1', {
            hue: 32,
            saturation: 0.7,
            value: 0.8,
            palette: ['#ff8800', '#2244ff']
        });
        store.registerScreenshot('lesson-1', 'lesson-1.png', 'evidence');
        store.saveCriteria('lesson-1', ['adjust-hue', 'write-observation']);

        const text = store.exportToText((lessonId) => `Nombre ${lessonId}`);

        expect(text).toContain('ChromaLab - Evidencia de observaciones');
        expect(text).toContain('Leccion: Nombre lesson-1');
        expect(text).toContain('ID: lesson-1');
        expect(text).toContain('Observacion: El color se ve mas calido.');
        expect(text).toContain('Justificacion: La luz naranja domina la escena.');
        expect(text).toContain('Emocion: Calma');
        expect(text).toContain('Matiz: 32');
        expect(text).toContain('Saturacion: 0.7');
        expect(text).toContain('Valor: 0.8');
        expect(text).toContain('Paleta: #ff8800, #2244ff');
        expect(text).toContain('Criterios completados: adjust-hue, write-observation');
        expect(text).toContain('Capturas: lesson-1.png (evidence)');
    });

    it('handles corrupted localStorage gracefully', () => {
        const corrupted = new EvidenceStore();
        expect(() => corrupted.reset()).not.toThrow();
    });
});
