import { describe, it, expect } from 'vitest';
import {
    hslToRgb,
    rgbToHsl,
    hexToRgb,
    rgbToHex,
    hslToHex,
    hexToHsl,
    complementaryHue,
    analogousHues,
    triadicHues,
    getHarmonyColors,
    contrastRatio,
    hueTemperature,
    hueName
} from '../src/utils/color.js';

describe('color utilities', () => {
    describe('hslToRgb and rgbToHsl', () => {
        it('converts red', () => {
            expect(hslToRgb(0, 1, 0.5)).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('converts green', () => {
            expect(hslToRgb(120, 1, 0.5)).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('converts blue', () => {
            expect(hslToRgb(240, 1, 0.5)).toEqual({ r: 0, g: 0, b: 255 });
        });

        it('round-trips red', () => {
            const rgb = hslToRgb(0, 1, 0.5);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            expect(hsl.h).toBe(0);
            expect(hsl.s).toBe(1);
            expect(hsl.l).toBe(0.5);
        });

        it('round-trips a mid-tone color', () => {
            const original = { h: 200, s: 0.75, l: 0.45 };
            const rgb = hslToRgb(original.h, original.s, original.l);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            expect(hsl.h).toBeCloseTo(original.h, 0);
            expect(hsl.s).toBeCloseTo(original.s, 2);
            expect(hsl.l).toBeCloseTo(original.l, 2);
        });
    });

    describe('hexToRgb and rgbToHex', () => {
        it('converts red hex to rgb', () => {
            expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('converts rgb to hex', () => {
            expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
        });

        it('handles short hex', () => {
            expect(hexToRgb('#f00')).toBeNull();
        });

        it('round-trips a color', () => {
            const hex = rgbToHex(42, 128, 200);
            expect(hexToRgb(hex)).toEqual({ r: 42, g: 128, b: 200 });
        });
    });

    describe('hslToHex and hexToHsl', () => {
        it('converts red hsl to hex', () => {
            expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
        });

        it('converts red hex to hsl', () => {
            expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 1, l: 0.5 });
        });

        it('round-trips a color', () => {
            const original = { h: 150, s: 0.6, l: 0.4 };
            const hex = hslToHex(original.h, original.s, original.l);
            const hsl = hexToHsl(hex);
            expect(hsl.h).toBeCloseTo(original.h, 0);
            expect(hsl.s).toBeCloseTo(original.s, 2);
            expect(hsl.l).toBeCloseTo(original.l, 2);
        });
    });

    describe('harmony functions', () => {
        it('returns complementary hue', () => {
            expect(complementaryHue(0)).toBe(180);
            expect(complementaryHue(200)).toBe(20);
        });

        it('returns analogous hues', () => {
            expect(analogousHues(0)).toEqual([330, 0, 30]);
            expect(analogousHues(200, 15)).toEqual([185, 200, 215]);
        });

        it('returns triadic hues', () => {
            expect(triadicHues(0)).toEqual([0, 120, 240]);
            expect(triadicHues(60)).toEqual([60, 180, 300]);
        });
    });

    describe('getHarmonyColors', () => {
        it('returns 2 colors for complementary', () => {
            expect(getHarmonyColors(0, 'complementary')).toHaveLength(2);
        });

        it('returns 3 colors for analogous', () => {
            expect(getHarmonyColors(0, 'analogous')).toHaveLength(3);
        });

        it('returns 3 colors for triadic', () => {
            expect(getHarmonyColors(0, 'triadic')).toHaveLength(3);
        });

        it('returns 3 colors for split', () => {
            expect(getHarmonyColors(0, 'split')).toHaveLength(3);
        });

        it('returns 4 colors for tetradic', () => {
            expect(getHarmonyColors(0, 'tetradic')).toHaveLength(4);
        });

        it('returns hex strings', () => {
            const colors = getHarmonyColors(120, 'complementary');
            expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    describe('contrastRatio', () => {
        it('returns ~21 for black and white', () => {
            expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
        });

        it('returns 1 for identical colors', () => {
            expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 2);
        });

        it('returns a higher value for light vs dark gray', () => {
            expect(contrastRatio('#aaaaaa', '#444444')).toBeGreaterThan(4);
        });
    });

    describe('hueTemperature', () => {
        it('identifies warm hues', () => {
            expect(hueTemperature(0)).toBe('warm');
            expect(hueTemperature(20)).toBe('warm');
        });

        it('identifies cool hues', () => {
            expect(hueTemperature(120)).toBe('cool');
            expect(hueTemperature(240)).toBe('cool');
        });

        it('identifies neutral ranges', () => {
            expect(hueTemperature(60)).toBe('neutral-warm');
            expect(hueTemperature(180)).toBe('neutral-cool');
            expect(hueTemperature(300)).toBe('neutral');
        });
    });

    describe('hueName', () => {
        it('returns Spanish names by default', () => {
            expect(hueName(0)).toBe('Rojo');
            expect(hueName(60)).toBe('Amarillo');
        });

        it('returns English names when requested', () => {
            expect(hueName(0, 'en')).toBe('Red');
            expect(hueName(60, 'en')).toBe('Yellow');
        });

        it('falls back to Spanish for unknown languages', () => {
            expect(hueName(0, 'fr')).toBe('Rojo');
        });
    });
});
