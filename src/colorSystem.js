import { Color } from 'three';
import { appEvents } from './utils/events.js';
import {
    hexToHsl, hslToHex, getHarmonyColors, complementaryHue,
    analogousHues, triadicHues, splitComplementaryHues, tetradicHues
} from './utils/color.js';

/**
 * ColorSystem — manages the color palette and applies it to scene objects.
 * Replaces LightingSystem from LightStudio3D.
 */
export class ColorSystem {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.baseHue = 0;
        this.saturation = 0.7;
        this.lightness = 0.5;
        this.harmonyType = 'complementary';
        this.colors = []; // array of hex strings
        this.onChange = null;
        this.emitters = [];
    }

    /**
     * Set the base hue and recalculate palette
     * @param {number} hue 0-360
     */
    setBaseHue(hue) {
        this.baseHue = ((hue % 360) + 360) % 360;
        this._updateColors();
    }

    /**
     * Set saturation
     * @param {number} s 0-1
     */
    setSaturation(s) {
        this.saturation = Math.max(0, Math.min(1, s));
        this._updateColors();
    }

    /**
     * Set lightness
     * @param {number} l 0-1
     */
    setLightness(l) {
        this.lightness = Math.max(0, Math.min(1, l));
        this._updateColors();
    }

    /**
     * Set harmony type
     * @param {string} type 'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic'
     */
    setHarmonyType(type) {
        this.harmonyType = type;
        this._updateColors();
    }

    /**
     * Get current palette
     * @returns {string[]} hex colors
     */
    getColors() {
        return [...this.colors];
    }

    /**
     * Get hues for current harmony
     * @returns {number[]}
     */
    getHues() {
        switch (this.harmonyType) {
            case 'complementary': return [this.baseHue, complementaryHue(this.baseHue)];
            case 'analogous': return analogousHues(this.baseHue);
            case 'triadic': return triadicHues(this.baseHue);
            case 'split': return splitComplementaryHues(this.baseHue);
            case 'tetradic': return tetradicHues(this.baseHue);
            default: return [this.baseHue];
        }
    }

    _updateColors() {
        this.colors = getHarmonyColors(this.baseHue, this.harmonyType, this.saturation, this.lightness);
        if (this.onChange) this.onChange();
        appEvents.emit('requestRender');
    }

    /**
     * Load a preset configuration
     * @param {Object} preset
     */
    loadPreset(preset) {
        if (preset.baseHue !== undefined) this.baseHue = preset.baseHue;
        if (preset.saturation !== undefined) this.saturation = preset.saturation;
        if (preset.lightness !== undefined) this.lightness = preset.lightness;
        if (preset.harmonyType) this.harmonyType = preset.harmonyType;
        this._updateColors();
    }

    /**
     * Get current state as a plain object
     */
    getState() {
        return {
            baseHue: this.baseHue,
            saturation: this.saturation,
            lightness: this.lightness,
            harmonyType: this.harmonyType,
            colors: this.getColors()
        };
    }

    dispose() {
        this.emitters = [];
        this.colors = [];
    }
}
