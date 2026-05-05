// color.js — Utilities for color conversion, harmonies, and contrast
// Synchronous, pure functions. No Three.js dependency.

/**
 * Convert HSL to RGB
 * @param {number} h Hue 0-360
 * @param {number} s Saturation 0-1
 * @param {number} l Lightness 0-1
 * @returns {{r:number,g:number,b:number}} 0-255
 */
export function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    const hh = ((h % 360) + 360) % 360;
    if (hh < 60) { r = c; g = x; b = 0; }
    else if (hh < 120) { r = x; g = c; b = 0; }
    else if (hh < 180) { r = 0; g = c; b = x; }
    else if (hh < 240) { r = 0; g = x; b = c; }
    else if (hh < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Convert RGB to HSL
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {{h:number,s:number,l:number}}
 */
export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100) / 100, l: Math.round(l * 100) / 100 };
}

/**
 * Convert RGB to hex string
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert hex to RGB
 * @param {string} hex
 * @returns {{r:number,g:number,b:number}} or null
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert hex to HSL
 * @param {string} hex
 * @returns {{h:number,s:number,l:number}}
 */
export function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return { h: 0, s: 0, l: 0 };
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSL to hex
 * @param {number} h 0-360
 * @param {number} s 0-1
 * @param {number} l 0-1
 * @returns {string}
 */
export function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSV to RGB
 * @param {number} h Hue 0-360
 * @param {number} s Saturation 0-1
 * @param {number} v Value 0-1
 * @returns {{r:number,g:number,b:number}} 0-255
 */
export function hsvToRgb(h, s, v) {
    const hh = ((h % 360) + 360) % 360;
    const c = v * s;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (hh < 60) { r = c; g = x; b = 0; }
    else if (hh < 120) { r = x; g = c; b = 0; }
    else if (hh < 180) { r = 0; g = c; b = x; }
    else if (hh < 240) { r = 0; g = x; b = c; }
    else if (hh < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Convert RGB to HSV
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {{h:number,s:number,v:number}}
 */
export function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    const d = max - min;
    if (d !== 0) {
        s = max === 0 ? 0 : d / max;
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100) / 100, v: Math.round(v * 100) / 100 };
}

/**
 * Convert HSV to hex
 * @param {number} h 0-360
 * @param {number} s 0-1
 * @param {number} v 0-1
 * @returns {string}
 */
export function hsvToHex(h, s, v) {
    const rgb = hsvToRgb(h, s, v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert hex to HSV
 * @param {string} hex
 * @returns {{h:number,s:number,v:number}}
 */
export function hexToHsv(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return { h: 0, s: 0, v: 0 };
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/**
 * Get complementary hue (opposite on the wheel)
 * @param {number} hue 0-360
 * @returns {number} 0-360
 */
export function complementaryHue(hue) {
    return (hue + 180) % 360;
}

/**
 * Get analogous hues
 * @param {number} hue 0-360
 * @param {number} step degrees between analogous colors, default 30
 * @returns {number[]}
 */
export function analogousHues(hue, step = 30) {
    return [(hue - step + 360) % 360, hue, (hue + step) % 360];
}

/**
 * Get triadic hues
 * @param {number} hue 0-360
 * @returns {number[]}
 */
export function triadicHues(hue) {
    return [hue, (hue + 120) % 360, (hue + 240) % 360];
}

/**
 * Get split-complementary hues
 * @param {number} hue 0-360
 * @param {number} split degrees from exact complement, default 30
 * @returns {number[]}
 */
export function splitComplementaryHues(hue, split = 30) {
    const comp = complementaryHue(hue);
    return [hue, (comp - split + 360) % 360, (comp + split) % 360];
}

/**
 * Get tetradic hues (rectangle)
 * @param {number} hue 0-360
 * @param {number} offset default 60
 * @returns {number[]}
 */
export function tetradicHues(hue, offset = 60) {
    return [hue, (hue + offset) % 360, (hue + 180) % 360, (hue + 180 + offset) % 360];
}

/**
 * Compute harmony colors from a base hue using HSL
 * @param {number} baseHue
 * @param {string} type 'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic'
 * @param {number} s saturation 0-1
 * @param {number} l lightness 0-1
 * @returns {string[]} array of hex colors
 */
export function getHarmonyColors(baseHue, type, s = 0.7, l = 0.5) {
    let hues = [];
    switch (type) {
        case 'complementary': hues = [baseHue, complementaryHue(baseHue)]; break;
        case 'analogous': hues = analogousHues(baseHue); break;
        case 'triadic': hues = triadicHues(baseHue); break;
        case 'split': hues = splitComplementaryHues(baseHue); break;
        case 'tetradic': hues = tetradicHues(baseHue); break;
        default: hues = [baseHue];
    }
    return hues.map(h => hslToHex(((h % 360) + 360) % 360, s, l));
}

/**
 * Compute harmony colors from a base hue using HSV
 * @param {number} baseHue
 * @param {string} type 'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic'
 * @param {number} s saturation 0-1
 * @param {number} v value 0-1
 * @returns {string[]} array of hex colors
 */
export function getHarmonyColorsHsv(baseHue, type, s = 0.7, v = 0.5) {
    let hues = [];
    switch (type) {
        case 'complementary': hues = [baseHue, complementaryHue(baseHue)]; break;
        case 'analogous': hues = analogousHues(baseHue); break;
        case 'triadic': hues = triadicHues(baseHue); break;
        case 'split': hues = splitComplementaryHues(baseHue); break;
        case 'tetradic': hues = tetradicHues(baseHue); break;
        default: hues = [baseHue];
    }
    return hues.map(h => hsvToHex(((h % 360) + 360) % 360, s, v));
}

/**
 * Calculate relative luminance for WCAG contrast
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {number}
 */
export function relativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG contrast ratio between two hex colors
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number} 1-21
 */
export function contrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 1;
    const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get temperature label from hue
 * @param {number} hue 0-360
 * @returns {string} 'warm' | 'cool' | 'neutral'
 */
export function hueTemperature(hue) {
    const h = ((hue % 360) + 360) % 360;
    if (h >= 330 || h <= 30) return 'warm';
    if (h >= 90 && h <= 150) return 'cool';
    if (h >= 210 && h <= 270) return 'cool';
    if (h >= 30 && h <= 90) return 'neutral-warm';
    if (h >= 150 && h <= 210) return 'neutral-cool';
    return 'neutral';
}

/**
 * Get a nice named color from hue (for labels)
 * @param {number} hue 0-360
 * @param {string} lang 'es' | 'en'
 * @returns {string}
 */
export function hueName(hue, lang = 'es') {
    const h = ((hue % 360) + 360) % 360;
    const names = {
        es: [
            [0, 'Rojo'], [30, 'Naranja'], [60, 'Amarillo'], [90, 'Verde lima'],
            [120, 'Verde'], [150, 'Verde mar'], [180, 'Cian'], [210, 'Azul cielo'],
            [240, 'Azul'], [270, 'Violeta'], [300, 'Magenta'], [330, 'Rosa']
        ],
        en: [
            [0, 'Red'], [30, 'Orange'], [60, 'Yellow'], [90, 'Lime'],
            [120, 'Green'], [150, 'Sea Green'], [180, 'Cyan'], [210, 'Sky Blue'],
            [240, 'Blue'], [270, 'Violet'], [300, 'Magenta'], [330, 'Pink']
        ]
    };
    const list = names[lang] || names.es;
    let closest = list[0];
    for (const item of list) {
        if (h >= item[0]) closest = item;
    }
    return closest[1];
}
