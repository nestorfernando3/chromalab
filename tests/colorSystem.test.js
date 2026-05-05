import { describe, it, expect, beforeEach } from 'vitest';
import { ColorSystem } from '../src/colorSystem.js';
import { getPreset } from '../src/presets.js';
import { appEvents } from '../src/utils/events.js';

const HSV_PRESET = getPreset('hsv');

describe('ColorSystem', () => {
    let system;

    beforeEach(() => {
        system = new ColorSystem({ preset: HSV_PRESET });
    });

    it('initializes from preset', () => {
        expect(system.hue).toBe(HSV_PRESET.baseHue);
        expect(system.saturation).toBe(HSV_PRESET.saturation);
        expect(system.harmonyType).toBe(HSV_PRESET.harmonyType);
        expect(typeof system.value).toBe('number');
    });

    it('getHueName returns a string', () => {
        const name = system.getHueName('es');
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
    });

    it('setHue updates baseColor', () => {
        system.setHue(0);
        expect(system.hue).toBe(0);
    });

    it('setSaturation updates baseColor', () => {
        system.setSaturation(1);
        expect(system.saturation).toBe(1);
    });

    it('setValue updates baseColor', () => {
        system.setValue(1);
        expect(system.value).toBe(1);
    });

    it('palette contains at least one color', () => {
        expect(system.palette.length).toBeGreaterThanOrEqual(1);
    });

    it('palette includes current baseColor', () => {
        expect(system.palette).toContain(system.baseColor);
    });

    it('setHarmonyType changes palette', () => {
        system.setHarmonyType('complementary');
        expect(system.palette.length).toBeGreaterThanOrEqual(2);
    });

    it('state is serializable', () => {
        const state = system.state;
        expect(state).toHaveProperty('hue');
        expect(state).toHaveProperty('saturation');
        expect(state).toHaveProperty('value');
        expect(state).toHaveProperty('harmonyType');
        expect(state).toHaveProperty('palette');
    });

    it('restoreState restores previous state', () => {
        system.setHue(120);
        system.setSaturation(0.5);
        system.setValue(0.8);
        const saved = system.state;
        system.setHue(0);
        system.setSaturation(0);
        system.setValue(0);
        system.restoreState(saved);
        expect(system.hue).toBe(120);
        expect(system.saturation).toBe(0.5);
        expect(system.value).toBe(0.8);
    });

    it('restoreState with partial data keeps current values', () => {
        const originalHue = system.hue;
        system.restoreState({ saturation: 0.5 });
        expect(system.hue).toBe(originalHue);
        expect(system.saturation).toBe(0.5);
    });

    it('getHueName returns different names for different hues', () => {
        system.setHue(0);
        const nameRed = system.getHueName('en');
        system.setHue(220);
        const nameBlue = system.getHueName('en');
        expect(nameRed).not.toBe(nameBlue);
    });

    it('harmony types generate different palette lengths', () => {
        const lengths = {};
        ['single', 'complementary', 'analogous', 'triadic'].forEach(type => {
            system.setHarmonyType(type);
            lengths[type] = system.palette.length;
        });
        expect(lengths['single']).toBe(1);
        expect(lengths['complementary']).toBeGreaterThanOrEqual(2);
        expect(lengths['analogous']).toBeGreaterThanOrEqual(2);
        expect(lengths['triadic']).toBe(3);
    });

    it('lessonId is set from preset', () => {
        expect(system.lessonId).toBe(HSV_PRESET.id);
    });

    it('setHue triggers preview event', () => {
        let emitted = false;
        const handler = () => { emitted = true; };
        appEvents.on('palette:previewChanged', handler);
        system.setHue(180);
        expect(emitted).toBe(true);
        appEvents.off('palette:previewChanged', handler);
    });
});
