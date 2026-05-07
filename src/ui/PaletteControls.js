// PaletteControls — Pedagogical HSV palette UI for ChromaLab
// Renders hue, saturation, value sliders, color preview, and apply buttons.

import { clearChildren } from '../utils/dom.js';
import { appEvents } from '../utils/events.js';
import { getAppCopy } from '../localization.js';

const HARMONY_TYPES = [
    { id: 'single', label: { es: 'Individual', en: 'Single' } },
    { id: 'complementary', label: { es: 'Complementarios', en: 'Complementary' } },
    { id: 'analogous', label: { es: 'Análogos', en: 'Analogous' } },
    { id: 'triadic', label: { es: 'Triádicos', en: 'Triadic' } },
    { id: 'split', label: { es: 'Complementario dividido', en: 'Split Complementary' } },
    { id: 'tetradic', label: { es: 'Tetrádicos', en: 'Tetradic' } }
];

export class PaletteControls {
    constructor(colorSystem, getCurrentPreset, getLang, lightingSystem) {
        this.colorSystem = colorSystem;
        this.getCurrentPreset = getCurrentPreset;
        this.getLang = getLang;
        this.lightingSystem = lightingSystem;
        this._container = null;
        this._previewEl = null;
        this._hueNameEl = null;
        this._valueNoteEl = null;

        this._onPalettePreviewChanged = (payload) => {
            if (payload.lessonId === this.colorSystem?.lessonId) {
                this._updatePreview();
            }
        };
        appEvents.on('palette:previewChanged', this._onPalettePreviewChanged);
    }

    destroy() {
        appEvents.off('palette:previewChanged', this._onPalettePreviewChanged);
    }

    render() {
        const preset = this.getCurrentPreset();
        if (!preset) return;

        const container = document.getElementById('palette-controls');
        if (!container) return;
        this._container = container;
        clearChildren(container);

        const lang = this.getLang();
        const copy = this._getCopy(lang);

        // Only show palette controls for lessons that declare learningControls
        const controls = preset.learningControls || [];
        if (controls.length === 0) {
            container.classList.add('hidden');
            return;
        }
        container.classList.remove('hidden');

        // Section label
        const label = document.createElement('div');
        label.className = 'section-label small';
        label.innerHTML = `<svg viewBox="0 0 24 24" class="icon-svg icon" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> <span>${copy.palette}</span>`;
        container.appendChild(label);

        // Sliders
        const sliderDefs = [
            {
                id: 'palette-hue',
                label: copy.hue,
                min: 0, max: 360, step: 1,
                value: this.colorSystem.hue,
                unit: '°',
                setter: (v) => this.colorSystem.setHue(v),
                className: 'control-slider hue-slider'
            },
            {
                id: 'palette-saturation',
                label: copy.saturation,
                min: 0, max: 100, step: 1,
                value: Math.round(this.colorSystem.saturation * 100),
                unit: '%',
                setter: (v) => this.colorSystem.setSaturation(v / 100)
            },
            {
                id: 'palette-value',
                label: copy.value,
                min: 0, max: 100, step: 1,
                value: Math.round(this.colorSystem.value * 100),
                unit: '%',
                setter: (v) => this.colorSystem.setValue(v / 100)
            }
        ];

        sliderDefs.forEach(def => {
            if (controls.includes(def.id.replace('palette-', ''))) {
                container.appendChild(this._renderSlider(def, lang));
            }
        });

        // Harmony selector (if lesson supports harmonies)
        if (preset.harmonyType && preset.harmonyType !== 'single' && controls.includes('harmony')) {
            container.appendChild(this._renderHarmonySelector(lang));
        }

        // Preview swatch + hue name
        container.appendChild(this._renderPreview(lang));

        // Value vs Exposure clarification note
        if (controls.includes('value')) {
            this._valueNoteEl = document.createElement('p');
            this._valueNoteEl.className = 'palette-note';
            this._valueNoteEl.textContent = copy.valueNote;
            container.appendChild(this._valueNoteEl);
        }

        // Apply buttons
        const actions = document.createElement('div');
        actions.className = 'palette-actions';

        const keyLight = preset.lights?.find(l => l.type === 'key');
        if (keyLight) {
            const btnApplyLight = document.createElement('button');
            btnApplyLight.className = 'btn btn-ghost palette-action-btn';
            const lightName = keyLight.name?.es || keyLight.name?.en || keyLight.name || copy.applyToLight;
            btnApplyLight.textContent = `${copy.applyToPrefix || 'Aplicar a'} ${lightName}`;
            btnApplyLight.addEventListener('click', () => {
                this.colorSystem.applyToLight(keyLight.id, this.lightingSystem);
            });
            actions.appendChild(btnApplyLight);
        }

        const btnApplyBg = document.createElement('button');
        btnApplyBg.className = 'btn btn-ghost palette-action-btn';
        btnApplyBg.textContent = copy.applyToBackground;
        btnApplyBg.addEventListener('click', () => {
            const color = this.colorSystem.baseColor;
            appEvents.emit('background:changed', {
                lessonId: preset.id,
                color,
                source: 'palette-controls'
            });
            appEvents.emit('palette:applied', {
                lessonId: preset.id,
                target: 'background',
                colors: [color],
                source: 'palette-controls'
            });
        });
        actions.appendChild(btnApplyBg);

        container.appendChild(actions);
    }

    _renderSlider(def, lang) {
        const row = document.createElement('div');
        row.className = 'control-row compact';
        const labelId = `label-${def.id}`;

        const label = document.createElement('span');
        label.className = 'control-label';
        label.id = labelId;
        label.textContent = def.label;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'control-value';
        valueSpan.id = `val-${def.id}`;
        valueSpan.textContent = def.value + def.unit;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = def.className || 'control-slider';
        slider.min = def.min;
        slider.max = def.max;
        slider.step = def.step;
        slider.value = def.value;
        slider.setAttribute('aria-labelledby', labelId);
        slider.setAttribute('aria-valuenow', def.value);
        slider.setAttribute('aria-valuemin', def.min);
        slider.setAttribute('aria-valuemax', def.max);
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            def.setter(val);
            valueSpan.textContent = Math.round(val) + def.unit;
            slider.setAttribute('aria-valuenow', val);
            this._updatePreview();
        });

        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(valueSpan);
        return row;
    }

    _renderHarmonySelector(lang) {
        const wrapper = document.createElement('div');
        wrapper.className = 'control-row compact';

        const harmonyLabelId = 'harmony-select-label';
        const label = document.createElement('span');
        label.className = 'control-label';
        label.id = harmonyLabelId;
        label.textContent = (this._getCopy(lang).harmony || 'Armonía');

        const select = document.createElement('select');
        select.className = 'palette-select';
        select.setAttribute('aria-labelledby', harmonyLabelId);
        HARMONY_TYPES.forEach(ht => {
            const option = document.createElement('option');
            option.value = ht.id;
            option.textContent = ht.label[lang] || ht.label.es;
            if (this.colorSystem.harmonyType === ht.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        select.addEventListener('change', (e) => {
            this.colorSystem.setHarmonyType(e.target.value);
            this._updatePreview();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        return wrapper;
    }

    _renderPreview(lang) {
        const previewWrap = document.createElement('div');
        previewWrap.className = 'palette-preview-wrap';

        this._previewEl = document.createElement('div');
        this._previewEl.className = 'palette-preview-swatch';
        this._previewEl.style.backgroundColor = this.colorSystem.baseColor;

        this._hueNameEl = document.createElement('span');
        this._hueNameEl.className = 'palette-hue-name';
        this._hueNameEl.textContent = this.colorSystem.getHueName(lang);

        const paletteSwatches = document.createElement('div');
        paletteSwatches.className = 'palette-swatches';
        this._paletteSwatchesEl = paletteSwatches;
        this._updatePaletteSwatches();

        previewWrap.appendChild(this._previewEl);
        previewWrap.appendChild(this._hueNameEl);
        previewWrap.appendChild(paletteSwatches);
        return previewWrap;
    }

    _updatePreview() {
        if (this._previewEl) {
            this._previewEl.style.backgroundColor = this.colorSystem.baseColor;
        }
        if (this._hueNameEl) {
            this._hueNameEl.textContent = this.colorSystem.getHueName(this.getLang());
        }
        this._updatePaletteSwatches();
    }

    _updatePaletteSwatches() {
        if (!this._paletteSwatchesEl) return;
        clearChildren(this._paletteSwatchesEl);
        const palette = this.colorSystem.palette;
        palette.forEach((color, i) => {
            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            this._paletteSwatchesEl.appendChild(swatch);
        });
    }

    _getCopy(lang) {
        const copy = getAppCopy(lang);
        return copy.palette || {};
    }
}
