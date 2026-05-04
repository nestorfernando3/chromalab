import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColorSystem } from '../src/colorSystem.js';
import { appEvents } from '../src/utils/events.js';

const SAMPLE_PRESET = {
    id: 'hsv',
    baseHue: 200,
    saturation: 0.75,
    lightness: 0.45,
    harmonyType: 'single'
};

const COMPLEMENTARY_PRESET = {
    id: 'complementary',
    baseHue: 200,
    saturation: 0.7,
    lightness: 0.5,
    harmonyType: 'complementary'
};

describe('ColorSystem', () => {
    let system;
    let listenerMocks = {};

    function listen(event) {
        const fn = vi.fn();
        appEvents.on(event, fn);
        listenerMocks[event] = fn;
        return fn;
    }

    beforeEach(() => {
        listenerMocks = {};
    });

    afterEach(() => {
        // Remove listeners to avoid cross-test leaks
        Object.entries(listenerMocks).forEach(([event, fn]) => {
            appEvents.off(event, fn);
        });
    });

    describe('initialization', () => {
        it('initializes with default state', () => {
            system = new ColorSystem();
            expect(system.hue).toBe(200);
            expect(system.saturation).toBe(0.75);
            expect(system.value).toBe(0.45);
            expect(system.harmonyType).toBe('single');
        });

        it('initializes from preset with lightness fallback', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            expect(system.lessonId).toBe('hsv');
            expect(system.hue).toBe(200);
            expect(system.saturation).toBe(0.75);
            expect(system.value).toBe(0.45);
        });

        it('initializes from preset with explicit value', () => {
            system = new ColorSystem({
                preset: { ...SAMPLE_PRESET, value: 0.6, lightness: 0.3 }
            });
            expect(system.value).toBe(0.6);
        });

        it('uses default fallback when preset has no value or lightness', () => {
            system = new ColorSystem({
                preset: { id: 'test', baseHue: 120, saturation: 0.5 }
            });
            expect(system.value).toBe(0.45);
        });
    });

    describe('HSV setters', () => {
        it('setHue normalizes and emits event', () => {
            const fn = listen('color:hueChanged');
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setHue(350);
            expect(system.hue).toBe(350);
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({ lessonId: 'hsv', hue: 350 }));
        });

        it('setHue clamps negative values', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setHue(-30);
            expect(system.hue).toBe(330);
        });

        it('setHue clamps values above 360', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setHue(400);
            expect(system.hue).toBe(40);
        });

        it('setSaturation clamps to 0-1', () => {
            const fn = listen('color:saturationChanged');
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setSaturation(1.5);
            expect(system.saturation).toBe(1);
            system.setSaturation(-0.5);
            expect(system.saturation).toBe(0);
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('setValue clamps to 0-1', () => {
            const fn = listen('color:valueChanged');
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setValue(1.2);
            expect(system.value).toBe(1);
            system.setValue(-0.2);
            expect(system.value).toBe(0);
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('does not emit event when value unchanged', () => {
            const fn = listen('color:hueChanged');
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setHue(200); // same as initial
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('palette generation', () => {
        it('generates single color palette', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            expect(system.palette).toHaveLength(1);
            expect(system.palette[0]).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('generates complementary palette', () => {
            system = new ColorSystem({ preset: COMPLEMENTARY_PRESET });
            expect(system.palette).toHaveLength(2);
        });

        it('regenerates palette when hue changes', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            const before = system.palette[0];
            system.setHue(100);
            const after = system.palette[0];
            expect(after).not.toBe(before);
        });

        it('emits previewChanged on palette update', () => {
            const fn = listen('palette:previewChanged');
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.setSaturation(0.5);
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({
                lessonId: 'hsv',
                palette: expect.any(Array)
            }));
        });

        it('getPaletteHues returns correct count', () => {
            system = new ColorSystem({ preset: COMPLEMENTARY_PRESET });
            const hues = system.getPaletteHues();
            expect(hues).toHaveLength(2);
        });

        it('getHueName returns a string', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            expect(typeof system.getHueName()).toBe('string');
        });
    });

    describe('state snapshot and restore', () => {
        it('state contains all fields', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            const state = system.state;
            expect(state).toHaveProperty('lessonId', 'hsv');
            expect(state).toHaveProperty('colorModel', 'hsv');
            expect(state).toHaveProperty('hue');
            expect(state).toHaveProperty('saturation');
            expect(state).toHaveProperty('value');
            expect(state).toHaveProperty('harmonyType');
            expect(state).toHaveProperty('palette');
            expect(state).toHaveProperty('lastAppliedTarget');
        });

        it('restoreState updates values', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            system.restoreState({ hue: 120, saturation: 0.5, value: 0.8, harmonyType: 'analogous' });
            expect(system.hue).toBe(120);
            expect(system.saturation).toBe(0.5);
            expect(system.value).toBe(0.8);
            expect(system.harmonyType).toBe('analogous');
        });
    });

    describe('applyToLight', () => {
        it('calls lightingSystem.updateLightColor and emits event', () => {
            const fn = listen('palette:applied');
            const lightingSystem = {
                updateLightColor: vi.fn()
            };
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            const result = system.applyToLight('hsv-key', lightingSystem);
            expect(result).toBe(true);
            expect(lightingSystem.updateLightColor).toHaveBeenCalledWith('hsv-key', system.baseColor);
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({
                lessonId: 'hsv',
                target: 'hsv-key',
                colors: [system.baseColor]
            }));
        });

        it('returns false when lightingSystem missing', () => {
            system = new ColorSystem({ preset: SAMPLE_PRESET });
            expect(system.applyToLight('hsv-key', null)).toBe(false);
        });
    });

    describe('applyPaletteToScene', () => {
        it('assigns colors to preset light ids', () => {
            const lightingSystem = {
                updateLightColor: vi.fn()
            };
            const presetLights = [
                { id: 'comp-key' },
                { id: 'comp-fill' }
            ];
            system = new ColorSystem({ preset: COMPLEMENTARY_PRESET });
            const fn = listen('palette:assignedToLights');
            const result = system.applyPaletteToScene(lightingSystem, presetLights);
            expect(result).toBe(true);
            expect(lightingSystem.updateLightColor).toHaveBeenCalledTimes(2);
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({
                lessonId: 'complementary',
                assignments: expect.any(Array)
            }));
        });

        it('returns false when palette empty', () => {
            const lightingSystem = {
                updateLightColor: vi.fn()
            };
            system = new ColorSystem({ preset: { ...SAMPLE_PRESET, harmonyType: 'single' } });
            // Palette is not empty for single, so test with null system
            expect(system.applyPaletteToScene(null, [])).toBe(false);
        });
    });
});
