import { describe, it, expect } from 'vitest';
import {
    getPresetNames,
    getPreset,
    getAllPresets
} from '../src/presets.js';

describe('presets', () => {
    it('getPresetNames returns 8 names', () => {
        const names = getPresetNames();
        expect(names).toHaveLength(8);
    });

    it('getPreset("hsv") returns an object with required fields', () => {
        const preset = getPreset('hsv');
        expect(preset).toBeTypeOf('object');
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('category');
        expect(preset).toHaveProperty('difficulty');
        expect(preset).toHaveProperty('goal');
        expect(preset).toHaveProperty('whatToObserve');
        expect(preset).toHaveProperty('practice');
        expect(preset).toHaveProperty('baseHue');
        expect(preset).toHaveProperty('harmonyType');
        expect(preset).toHaveProperty('saturation');
        expect(preset).toHaveProperty('lightness');
    });

    it('getPreset("complementary", "en") returns English text', () => {
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

    it('getAllPresets returns an array of 8', () => {
        const all = getAllPresets();
        expect(Array.isArray(all)).toBe(true);
        expect(all).toHaveLength(8);
    });
});
