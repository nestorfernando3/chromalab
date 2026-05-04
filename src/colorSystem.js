// ColorSystem — Pedagogical color state manager for ChromaLab
// Manages HSV state, derives palettes, and emits events.
// Designed to be the single source of truth for color theory lessons.

import { appEvents } from './utils/events.js';
import {
    hsvToHex,
    hexToHsv,
    getHarmonyColorsHsv,
    hueName
} from './utils/color.js';

const DEFAULT_STATE = {
    hue: 200,
    saturation: 0.75,
    value: 0.45,
    harmonyType: 'single'
};

/**
 * ColorSystem manages the pedagogical color state for a lesson.
 * It initializes from presets, tracks HSV values, derives palettes,
 * and emits events so UI and 3D scene stay synchronized.
 */
export class ColorSystem {
    constructor(options = {}) {
        this.lessonId = options.lessonId || null;
        this._hue = DEFAULT_STATE.hue;
        this._saturation = DEFAULT_STATE.saturation;
        this._value = DEFAULT_STATE.value;
        this._harmonyType = DEFAULT_STATE.harmonyType;
        this._palette = [];
        this._lastAppliedTarget = null;

        if (options.preset) {
            this.loadFromPreset(options.preset);
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    get hue() { return this._hue; }
    get saturation() { return this._saturation; }
    get value() { return this._value; }
    get harmonyType() { return this._harmonyType; }
    get palette() { return [...this._palette]; }
    get lastAppliedTarget() { return this._lastAppliedTarget; }

    /**
     * Current base color as hex, derived from HSV state
     */
    get baseColor() {
        return hsvToHex(this._hue, this._saturation, this._value);
    }

    /**
     * Full state snapshot for persistence
     */
    get state() {
        return {
            lessonId: this.lessonId,
            colorModel: 'hsv',
            hue: this._hue,
            saturation: this._saturation,
            value: this._value,
            harmonyType: this._harmonyType,
            palette: [...this._palette],
            lastAppliedTarget: this._lastAppliedTarget
        };
    }

    // ── State setters with events ────────────────────────────────────────────

    setHue(hue) {
        const next = this._normalizeHue(hue);
        if (this._hue === next) return;
        this._hue = next;
        this._regeneratePalette();
        this._emit('color:hueChanged', { lessonId: this.lessonId, hue: this._hue });
    }

    setSaturation(saturation) {
        const next = Math.max(0, Math.min(1, saturation));
        if (this._saturation === next) return;
        this._saturation = next;
        this._regeneratePalette();
        this._emit('color:saturationChanged', { lessonId: this.lessonId, saturation: this._saturation });
    }

    setValue(value) {
        const next = Math.max(0, Math.min(1, value));
        if (this._value === next) return;
        this._value = next;
        this._regeneratePalette();
        this._emit('color:valueChanged', { lessonId: this.lessonId, value: this._value });
    }

    setHarmonyType(type) {
        if (this._harmonyType === type) return;
        this._harmonyType = type;
        this._regeneratePalette();
        this._emit('color:harmonyChanged', { lessonId: this.lessonId, harmonyType: this._harmonyType });
    }

    /**
     * Restore full state from a snapshot (e.g., from EvidenceStore)
     */
    restoreState(state) {
        if (!state) return;
        this._hue = this._normalizeHue(state.hue ?? this._hue);
        this._saturation = Math.max(0, Math.min(1, state.saturation ?? this._saturation));
        this._value = Math.max(0, Math.min(1, state.value ?? this._value));
        this._harmonyType = state.harmonyType || this._harmonyType;
        this._lastAppliedTarget = state.lastAppliedTarget || null;
        this._regeneratePalette();
    }

    // ── Preset loading ────────────────────────────────────────────────────────

    loadFromPreset(preset) {
        if (!preset) return;
        this.lessonId = preset.id || this.lessonId;
        // Migration path: presets may have 'value' or 'lightness' or neither
        const fallbackValue = preset.value ?? preset.lightness ?? DEFAULT_STATE.value;
        this._hue = this._normalizeHue(preset.baseHue ?? DEFAULT_STATE.hue);
        this._saturation = Math.max(0, Math.min(1, preset.saturation ?? DEFAULT_STATE.saturation));
        this._value = Math.max(0, Math.min(1, fallbackValue));
        this._harmonyType = preset.harmonyType || DEFAULT_STATE.harmonyType;
        this._lastAppliedTarget = null;
        this._regeneratePalette();
    }

    // ── Palette derivation ────────────────────────────────────────────────────

    _regeneratePalette() {
        if (this._harmonyType === 'single') {
            this._palette = [this.baseColor];
        } else {
            this._palette = getHarmonyColorsHsv(
                this._hue,
                this._harmonyType,
                this._saturation,
                this._value
            );
        }
        this._emit('palette:previewChanged', {
            lessonId: this.lessonId,
            palette: [...this._palette]
        });
    }

    /**
     * Get hues for each palette color (for labels)
     */
    getPaletteHues() {
        if (this._harmonyType === 'single') {
            return [this._hue];
        }
        // Derive hues manually to avoid hex->hsv round-trip noise
        const h = ((this._hue % 360) + 360) % 360;
        switch (this._harmonyType) {
            case 'complementary': return [h, (h + 180) % 360];
            case 'analogous': return [(h - 30 + 360) % 360, h, (h + 30) % 360];
            case 'triadic': return [h, (h + 120) % 360, (h + 240) % 360];
            case 'split': {
                const comp = (h + 180) % 360;
                return [h, (comp - 30 + 360) % 360, (comp + 30) % 360];
            }
            case 'tetradic': return [h, (h + 60) % 360, (h + 180) % 360, (h + 240) % 360];
            default: return [h];
        }
    }

    /**
     * Semantic name of the current base hue
     */
    getHueName(lang = 'es') {
        return hueName(this._hue, lang);
    }

    // ── Application helpers ───────────────────────────────────────────────────

    /**
     * Apply the current base color to a specific light
     */
    applyToLight(lightId, lightingSystem) {
        if (!lightingSystem) return false;
        const color = this.baseColor;
        lightingSystem.updateLightColor(lightId, color);
        this._lastAppliedTarget = lightId;
        this._emit('palette:applied', {
            lessonId: this.lessonId,
            target: lightId,
            colors: [color]
        });
        return true;
    }

    /**
     * Apply the current palette to scene lights automatically.
     * Typical assignment: first color -> key, second -> fill, third -> rim/back
     */
    applyPaletteToScene(lightingSystem, presetLights = []) {
        if (!lightingSystem || this._palette.length === 0) return false;

        const assignments = [];
        const targets = presetLights.length > 0
            ? presetLights.map(l => l.id)
            : ['key', 'fill', 'rim', 'back'];

        this._palette.forEach((color, index) => {
            const targetId = targets[index];
            if (targetId) {
                lightingSystem.updateLightColor(targetId, color);
                assignments.push({ lightId: targetId, color });
            }
        });

        this._lastAppliedTarget = 'scene';
        this._emit('palette:assignedToLights', {
            lessonId: this.lessonId,
            assignments
        });
        return true;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    _normalizeHue(hue) {
        return ((Math.round(hue) % 360) + 360) % 360;
    }

    _emit(event, payload) {
        appEvents.emit(event, payload);
    }
}
