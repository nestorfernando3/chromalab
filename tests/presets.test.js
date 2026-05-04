import { describe, it, expect } from 'vitest';
import { getPresetNames, getPreset, getAllPresets } from '../src/presets.js';

describe('presets', () => {
    it('getPresetNames returns 8 names', () => {
        expect(getPresetNames()).toHaveLength(8);
    });

    it('getPreset("hsv") returns an object with required fields', () => {
        const preset = getPreset('hsv');
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('goal');
        expect(preset).toHaveProperty('lights');
    });

    it('getPreset("complementary", "en") returns English text', () => {
        const preset = getPreset('complementary', 'en');
        expect(preset.name).toBe('Complementary');
    });

    it('getAllPresets returns an array of 8', () => {
        expect(getAllPresets()).toHaveLength(8);
    });

    it('all presets have checklist and reflectionPrompt', () => {
        const presets = getAllPresets();
        for (const preset of presets) {
            expect(preset.checklist).toBeInstanceOf(Array);
            expect(preset.checklist.length).toBeGreaterThan(0);
            expect(preset.reflectionPrompt).toHaveProperty('es');
            expect(preset.reflectionPrompt).toHaveProperty('en');
            expect(preset.completionRules).toHaveProperty('mode');
            expect(preset).toHaveProperty('colorModel', 'hsv');
            expect(preset).toHaveProperty('value');
        }
    });

    it('hsv preset has 5 checklist items', () => {
        const preset = getPreset('hsv');
        expect(preset.checklist).toHaveLength(5);
    });

    it('getPreset("complementary", "en") returns English text with all fields', () => {
        const preset = getPreset('complementary', 'en');
        expect(typeof preset.name).toBe('string');
        expect(preset.name).toBe('Complementary');
        expect(typeof preset.category).toBe('string');
        expect(preset.category).toBe('Basic harmony');
        expect(typeof preset.goal).toBe('string');
        expect(preset.goal).toContain('opposite');
        expect(Array.isArray(preset.whatToObserve)).toBe(true);
        expect(preset.whatToObserve.length).toBeGreaterThan(0);
        expect(typeof preset.whatToObserve[0]).toBe('string');
        expect(typeof preset.practice.task).toBe('string');
        expect(typeof preset.practice.expectedOutput).toBe('string');
    });
});
