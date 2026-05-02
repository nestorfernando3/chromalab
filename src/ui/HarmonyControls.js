import { clearChildren } from '../utils/dom.js';
import { hslToHex, getHarmonyColors, hueName } from '../utils/color.js';

const HARMONY_TYPES = [
    { id: 'complementary', label: { es: 'Complementarios', en: 'Complementary' } },
    { id: 'analogous', label: { es: 'Análogos', en: 'Analogous' } },
    { id: 'triadic', label: { es: 'Triádicos', en: 'Triadic' } },
    { id: 'split', label: { es: 'Complementario dividido', en: 'Split Complementary' } },
    { id: 'tetradic', label: { es: 'Tetrádicos', en: 'Tetradic' } }
];

export class HarmonyControls {
    constructor(colorSystem, getCurrentPreset, getLang, onUpdateCallback) {
        this.colorSystem = colorSystem;
        this.getCurrentPreset = getCurrentPreset;
        this.getLang = getLang;
        this.onUpdateCallback = onUpdateCallback;
    }

    render(preset) {
        if (!preset) return;
        this._renderHarmonyButtons();
        this._renderSliders();
        this._renderColorPreview();
    }

    _renderHarmonyButtons() {
        const container = document.getElementById('light-selector');
        if (!container) return;
        clearChildren(container);

        const lang = this.getLang();

        HARMONY_TYPES.forEach(ht => {
            const btn = document.createElement('button');
            btn.className = 'harmony-btn' + (this.colorSystem.harmonyType === ht.id ? ' active' : '');
            const label = ht.label[lang] || ht.label.es;
            btn.textContent = label;
            btn.addEventListener('click', () => {
                this.colorSystem.setHarmonyType(ht.id);
                if (this.onUpdateCallback) this.onUpdateCallback();
                this._renderHarmonyButtons();
                this._renderColorPreview();
            });
            container.appendChild(btn);
        });
    }

    _renderSliders() {
        const container = document.getElementById('light-controls');
        if (!container) return;
        clearChildren(container);

        const controls = [
            { id: 'hue', label: { es: 'Matiz', en: 'Hue' }, min: 0, max: 360, value: this.colorSystem.baseHue, unit: '°', setter: 'setBaseHue' },
            { id: 'sat', label: { es: 'Saturación', en: 'Saturation' }, min: 0, max: 100, value: Math.round(this.colorSystem.saturation * 100), unit: '%', setter: 'setSaturation' },
            { id: 'lt', label: { es: 'Luminosidad', en: 'Lightness' }, min: 0, max: 100, value: Math.round(this.colorSystem.lightness * 100), unit: '%', setter: 'setLightness' }
        ];

        const lang = this.getLang();

        controls.forEach(ctrl => {
            const row = document.createElement('div');
            row.className = 'control-row compact';

            const label = document.createElement('span');
            label.className = 'control-label';
            label.textContent = ctrl.label[lang] || ctrl.label.es;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'control-value';
            valueSpan.textContent = ctrl.value + ctrl.unit;

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'control-slider';
            slider.min = ctrl.min;
            slider.max = ctrl.max;
            slider.value = ctrl.value;
            slider.addEventListener('input', (e) => {
                let val = parseFloat(e.target.value);
                if (ctrl.setter === 'setSaturation' || ctrl.setter === 'setLightness') {
                    val = val / 100;
                }
                this.colorSystem[ctrl.setter](val);
                valueSpan.textContent = Math.round(ctrl.setter === 'setBaseHue' ? val : val * 100) + ctrl.unit;
                if (this.onUpdateCallback) this.onUpdateCallback();
                this._renderColorPreview();
            });

            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(valueSpan);
            container.appendChild(row);
        });
    }

    _renderColorPreview() {
        const section = document.getElementById('light-controls');
        if (!section) return;

        const colors = this.colorSystem.getColors();
        if (!colors.length) return;

        let preview = document.getElementById('color-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'color-preview';
            preview.className = 'color-preview';
            section.appendChild(preview);
        }

        clearChildren(preview);

        const lang = this.getLang();

        colors.forEach((hex, i) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hex;

            const label = document.createElement('span');
            label.className = 'color-swatch-label';

            const baseHue = this.colorSystem.getHues()[i] || this.colorSystem.baseHue;
            label.textContent = hueName(baseHue, lang);

            swatch.appendChild(label);
            preview.appendChild(swatch);
        });
    }
}
