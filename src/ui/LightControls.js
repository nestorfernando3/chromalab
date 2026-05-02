/**
 * LightControls — handles light selection, sliders, color pickers,
 * cone/softbox controls and drag feedback in the controls panel.
 */
import { createElement, clearChildren, bindSlider } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';
import { getAppCopy, getLightTypeLabel } from '../localization.js';

export class LightControls {
    /**
     * @param {import('../lighting.js').LightingSystem} lightingSystem
     * @param {Function} getCurrentPreset - returns current preset object
     * @param {Function} getLanguage - returns current UI language
     * @param {Function} onDiagramUpdate - callback to re-render diagram
     */
    constructor(lightingSystem, getCurrentPreset, getLanguage, onDiagramUpdate) {
        this.lightingSystem = lightingSystem;
        this.getCurrentPreset = getCurrentPreset;
        this.getLanguage = getLanguage;
        this.onDiagramUpdate = onDiagramUpdate;
        this.selectedLightId = null;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /** Select a light: updates 3D highlight, panel, and controls */
    selectLight(light) {
        this.selectedLightId = light.id;

        // Update visual selection in lights list
        document.querySelectorAll('.light-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.lightId === light.id);
        });

        // Highlight in 3D scene
        const preset = this.getCurrentPreset();
        preset.lights.forEach(l => {
            this.lightingSystem.highlightLight(l.id, l.id === light.id);
        });

        // Show controls panel
        document.getElementById('controls-panel')?.classList.remove('collapsed');
        document.getElementById('drag-indicator')?.classList.remove('hidden');

        this.renderLightControls(light);
        this.renderLightSelector(preset, light.id);
    }

    /** Sync slider values when the light is dragged in 3D or reset */
    onLightDragged(lightId, position) {
        if (this.selectedLightId === lightId) {
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                const valEl = document.getElementById(id.replace('ctrl', 'val'));
                if (el) el.value = val;
                if (valEl) valEl.textContent = Number(val).toFixed(1);
            };
            setVal('ctrl-x', position.x);
            // Also update Y when called from resetLightPosition
            if (position.y != null) setVal('ctrl-y', position.y);
            setVal('ctrl-z', position.z);
        }

        // Keep preset data in sync for diagram updates
        const lightConfig = this.getCurrentPreset().lights.find(l => l.id === lightId);
        if (lightConfig) {
            lightConfig.position.x = position.x;
            if (position.y != null) lightConfig.position.y = position.y;
            lightConfig.position.z = position.z;
        }
        this.onDiagramUpdate();
    }

    /** Render the light-type pill selector */
    renderLightSelector(preset, selectedId = null) {
        const container = document.getElementById('light-selector');
        if (!container) return;

        clearChildren(container);
        const lang = this.getLanguage();

        preset.lights.forEach(light => {
            const typeLabel = getLightTypeLabel(lang, light.freeLightType || light.type);
            const dot = createElement('span', {
                className: 'light-select-dot',
                style: { backgroundColor: light.color }
            });

            const btn = createElement('button', {
                className: 'light-select-btn' + (light.id === selectedId ? ' active' : ''),
                'data-light-id': light.id
            }, [dot, ` ${typeLabel}`]);

            btn.addEventListener('click', () => this.selectLight(light));
            container.appendChild(btn);
        });
    }

    /** Render the detailed sliders / controls for the selected light */
    renderLightControls(light) {
        const container = document.getElementById('light-controls');
        if (!container) return;

        clearChildren(container);
        const copy = getAppCopy(this.getLanguage());
        const labels = copy.lightControls;

        // -- Intensity row --
        container.appendChild(this._makeSliderRow(labels.intensity, 'intensity', 0, 5, 0.1, light.intensity));

        // -- Color row --
        container.appendChild(this._makeColorRow(labels.color, 'color', light.color));

        // -- Position rows --
        container.appendChild(this._makeSliderRow(labels.posX, 'x', -5, 5, 0.1, light.position.x));
        container.appendChild(this._makeSliderRow(labels.posY, 'y', 0, 6, 0.1, light.position.y));
        container.appendChild(this._makeSliderRow(labels.posZ, 'z', -5, 5, 0.1, light.position.z));

        // -- Spot cone (sandbox spot only) --
        if (light.type === 'key' && light.freeLight) {
            container.appendChild(this._makeSliderRow(labels.cone, 'cone', 5, 90, 1, light.coneAngle ?? 45, 0));
        }

        // -- RectAreaLight dimensions --
        if (light.type === 'rect') {
            container.appendChild(this._makeSliderRow(labels.width, 'width', 0.5, 5, 0.1, light.width ?? 2));
            container.appendChild(this._makeSliderRow(labels.height, 'height', 0.5, 4, 0.1, light.height ?? 1.5));
        }

        // -- Action buttons row --
        const resetBtn = createElement('button', {
            className: 'reset-light-btn',
            id: 'btn-reset-light',
            title: labels.reset
        }, ['⟳', ` ${labels.reset}`]);

        const resetRow = createElement('div', { className: 'control-row reset-row' }, [resetBtn]);

        const preset = this.getCurrentPreset();
        if (preset?.isSandbox) {
            const dupBtn = createElement('button', {
                className: 'dup-light-btn',
                id: 'btn-dup-light',
                title: labels.duplicate
            }, ['⧉', ` ${labels.duplicate}`]);
            resetRow.appendChild(dupBtn);
        }

        container.appendChild(resetRow);

        this._bindControlEvents(light.id);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Build a labelled slider row */
    _makeSliderRow(label, prop, min, max, step, value, decimals = 1) {
        const id = prop === 'intensity' || prop === 'cone' || prop === 'width' || prop === 'height'
            ? `ctrl-${prop}`
            : `ctrl-${prop}`;
        const valId = id.replace('ctrl', 'val');

        const labelEl = createElement('span', { className: 'control-label' }, [label]);
        const slider = createElement('input', {
            type: 'range',
            className: 'control-slider',
            id,
            min: String(min),
            max: String(max),
            step: String(step),
            value: String(value)
        });
        const valueSpan = createElement('span', { className: 'control-value', id: valId }, [
            Number(value).toFixed(decimals)
        ]);

        return createElement('div', { className: 'control-row' }, [labelEl, slider, valueSpan]);
    }

    /** Build a labelled color-picker row */
    _makeColorRow(label, prop, initialColor) {
        const labelEl = createElement('span', { className: 'control-label' }, [label]);
        const picker = createElement('input', {
            type: 'color',
            className: 'control-color',
            id: `ctrl-${prop}`,
            value: initialColor
        });
        return createElement('div', { className: 'control-row' }, [labelEl, picker]);
    }

    /** Attach reactive input events to all controls */
    _bindControlEvents(lightId) {
        const preset = this.getCurrentPreset();

        const updatePos = (axis) => (val) => {
            this.lightingSystem.updateLightPosition(lightId, axis, val);
            const cfg = preset.lights.find(l => l.id === lightId);
            if (cfg) cfg.position[axis] = val;
            this.onDiagramUpdate();
        };

        bindSlider('ctrl-intensity', (val) => this.lightingSystem.updateLightIntensity(lightId, val));
        bindSlider('ctrl-x', updatePos('x'));
        bindSlider('ctrl-y', updatePos('y'));
        bindSlider('ctrl-z', updatePos('z'));

        // Color picker
        document.getElementById('ctrl-color')?.addEventListener('input', (e) => {
            this.lightingSystem.updateLightColor(lightId, e.target.value);
            const cfg = preset.lights.find(l => l.id === lightId);
            if (cfg) cfg.color = e.target.value;
        });

        // Spot cone angle
        bindSlider('ctrl-cone', (angleDeg) => {
            const light = this.lightingSystem.lightObjects.get(lightId);
            if (light?.isSpotLight) {
                light.angle = (angleDeg * Math.PI) / 180;
                if (light.userData.config) light.userData.config.coneAngle = angleDeg;
            }
            appEvents.emit('requestRender');
        }, 0);

        // RectAreaLight dimensions
        bindSlider('ctrl-width', (v) => {
            const light = this.lightingSystem.lightObjects.get(lightId);
            if (light?.isRectAreaLight) {
                light.width = v;
                if (light.userData.config) light.userData.config.width = v;
            }
            appEvents.emit('requestRender');
        });
        bindSlider('ctrl-height', (v) => {
            const light = this.lightingSystem.lightObjects.get(lightId);
            if (light?.isRectAreaLight) {
                light.height = v;
                if (light.userData.config) light.userData.config.height = v;
            }
            appEvents.emit('requestRender');
        });

        // Reset position button
        document.getElementById('btn-reset-light')?.addEventListener('click', () => {
            this.lightingSystem.resetLightPosition(lightId);
            const cfg = preset.lights.find(l => l.id === lightId);
            if (cfg) {
                this.renderLightControls(cfg);
                this.onDiagramUpdate();
            }
        });

        // Duplicate light button (sandbox only)
        document.getElementById('btn-dup-light')?.addEventListener('click', () => {
            const newConfig = this.lightingSystem.duplicateLight(lightId);
            if (newConfig) {
                preset.lights.push(newConfig);
                // Signal that a new light was added
                this._onDupLight?.(newConfig);
            }
        });
    }
}
