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
        this._onLightSelected = (payload) => {
            if (payload.lessonId === this.colorSystem?.lessonId) {
                this._selectedLightId = payload.light?.id;
            }
        };
        appEvents.on('palette:previewChanged', this._onPalettePreviewChanged);
        appEvents.on('light:selected', this._onLightSelected);
    }

    destroy() {
        appEvents.off('palette:previewChanged', this._onPalettePreviewChanged);
        appEvents.off('light:selected', this._onLightSelected);
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
            this._valueNoteEl.style.fontSize = '12px';
            this._valueNoteEl.style.color = 'var(--text-tertiary)';
            this._valueNoteEl.style.marginTop = 'var(--space-3)';
            this._valueNoteEl.style.lineHeight = '1.4';
            this._valueNoteEl.innerHTML = `<strong>Nota pedagógica:</strong> En iluminación 3D, el <em>Valor (V)</em> de un color afecta la reflectancia del material, pero para las luces, equivale a ajustar la intensidad o Exposición.`;
            container.appendChild(this._valueNoteEl);
        }

        // Apply buttons
        const actions = document.createElement('div');
        actions.className = 'palette-actions';

        const isGuided = !preset.isSandbox;
        const keyLight = preset.lights?.find(l => l.type === 'key');
        
        if (keyLight && !isGuided) {
            const btnApplyLight = document.createElement('button');
            btnApplyLight.className = 'btn btn-ghost palette-action-btn';
            const lightName = keyLight.name?.es || keyLight.name?.en || keyLight.name || copy.applyToLight;
            btnApplyLight.textContent = `${copy.applyToPrefix || 'Aplicar a'} ${lightName}`;
            btnApplyLight.addEventListener('click', () => {
                this.colorSystem.applyToLight(keyLight.id, this.lightingSystem);
            });
            actions.appendChild(btnApplyLight);
        }

        if (!isGuided) {
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
        }

        if (actions.children.length > 0) {
            container.appendChild(actions);
        }

        // Special Controls
        if (preset.specialControls && preset.specialControls.includes('contrastToggle')) {
            const toggleWrap = document.createElement('div');
            toggleWrap.className = 'control-row compact';
            toggleWrap.style.marginTop = 'var(--space-4)';
            
            const btnToggle = document.createElement('button');
            btnToggle.className = 'btn btn-secondary';
            btnToggle.style.width = '100%';
            btnToggle.textContent = 'Alternar Fondo Claro / Oscuro';
            
            let isLight = false;
            btnToggle.addEventListener('click', () => {
                isLight = !isLight;
                const newValue = isLight ? 95 : 10;
                
                // Update slider and model
                const valSlider = document.getElementById('palette-value');
                if (valSlider) {
                    valSlider.value = newValue;
                    valSlider.dispatchEvent(new Event('input'));
                } else {
                    this.colorSystem.setValue(newValue / 100);
                    this._updatePreview();
                }
            });
            toggleWrap.appendChild(btnToggle);
            container.appendChild(toggleWrap);
        }

        if (preset.specialControls && preset.specialControls.includes('emotionSelector')) {
            const emotionWrap = document.createElement('div');
            emotionWrap.className = 'control-row compact';
            emotionWrap.style.marginTop = 'var(--space-4)';
            
            const label = document.createElement('span');
            label.className = 'control-label';
            label.textContent = 'Emoción (Semiótica)';
            
            const select = document.createElement('select');
            select.className = 'palette-select';
            
            const emotions = [
                { id: 'none', label: 'Selecciona una emoción...' },
                { id: 'passion', label: 'Pasión / Peligro', hue: 0, sat: 0.9, val: 0.8, harmony: 'analogous' },
                { id: 'melancholy', label: 'Melancolía / Distancia', hue: 210, sat: 0.7, val: 0.6, harmony: 'single' },
                { id: 'cyberpunk', label: 'Sci-Fi / Cyberpunk', hue: 290, sat: 0.85, val: 0.9, harmony: 'complementary' },
                { id: 'nature', label: 'Naturaleza / Salud', hue: 120, sat: 0.6, val: 0.7, harmony: 'analogous' },
                { id: 'mystery', label: 'Misterio / Magia', hue: 270, sat: 0.8, val: 0.5, harmony: 'triadic' }
            ];
            
            emotions.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.label;
                select.appendChild(opt);
            });
            
            select.addEventListener('change', (e) => {
                const emotion = emotions.find(em => em.id === e.target.value);
                if (emotion && emotion.id !== 'none') {
                    this.colorSystem.setHue(emotion.hue);
                    this.colorSystem.setSaturation(emotion.sat);
                    this.colorSystem.setValue(emotion.val);
                    if (emotion.harmony) {
                        this.colorSystem.setHarmonyType(emotion.harmony);
                    }
                    
                    // Update slider UI manually so they reflect the new state
                    const hueSlider = document.getElementById('palette-hue');
                    if (hueSlider) hueSlider.value = emotion.hue;
                    const satSlider = document.getElementById('palette-saturation');
                    if (satSlider) satSlider.value = emotion.sat * 100;
                    const valSlider = document.getElementById('palette-value');
                    if (valSlider) valSlider.value = emotion.val * 100;
                    
                    this._updatePreview();
                }
            });
            
            emotionWrap.appendChild(label);
            emotionWrap.appendChild(select);
            container.appendChild(emotionWrap);
        }

        if (preset.specialControls && preset.specialControls.includes('temperatureToggle')) {
            const toggleWrap = document.createElement('div');
            toggleWrap.className = 'control-row compact';
            toggleWrap.style.marginTop = 'var(--space-4)';
            
            const btnToggle = document.createElement('button');
            btnToggle.className = 'btn btn-secondary';
            btnToggle.style.width = '100%';
            btnToggle.style.transition = 'all 0.3s ease';
            
            let isWarm = true;
            btnToggle.textContent = 'Cambiar a Frío ❄️';
            btnToggle.style.background = 'linear-gradient(90deg, #1a3a5c, #2a4a7c)';
            
            btnToggle.addEventListener('click', () => {
                isWarm = !isWarm;
                const targetHue = isWarm ? 30 : 210;
                
                if (isWarm) {
                    btnToggle.textContent = 'Cambiar a Frío ❄️';
                    btnToggle.style.background = 'linear-gradient(90deg, #1a3a5c, #2a4a7c)';
                } else {
                    btnToggle.textContent = 'Cambiar a Cálido ☀️';
                    btnToggle.style.background = 'linear-gradient(90deg, #7c3a1a, #9c4a2a)';
                }
                
                // Animate hue
                const hueSlider = document.getElementById('palette-hue');
                let startHue = this.colorSystem.hue;
                const duration = 800; // ms
                const start = performance.now();
                
                const animate = (time) => {
                    const elapsed = time - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // EaseInOutQuad
                    const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    const currentHue = startHue + (targetHue - startHue) * ease;
                    this.colorSystem.setHue(currentHue);
                    if (hueSlider) hueSlider.value = currentHue;
                    this._updatePreview();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        if (hueSlider) hueSlider.dispatchEvent(new Event('input'));
                    }
                };
                requestAnimationFrame(animate);
            });
            toggleWrap.appendChild(btnToggle);
            container.appendChild(toggleWrap);
        }
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
        
        const preset = this.getCurrentPreset();
        const allowed = preset?.allowedHarmonies;
        
        HARMONY_TYPES.forEach(ht => {
            if (allowed && !allowed.includes(ht.id)) return;
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

        // Auto-apply in guided mode
        const preset = this.getCurrentPreset();
        if (preset && !preset.isSandbox) {
            if (preset.autoApplyPalette) {
                // If the target is the background, apply it there
                if (preset.paletteTargets?.includes('background')) {
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
                } else {
                    // Apply to all mapped lights automatically
                    this.colorSystem.applyPaletteToScene(this.lightingSystem, preset.lights);
                }
            } else {
                // Default: apply single color to the currently selected or key light
                const targetLightId = this._selectedLightId || preset.lights?.find(l => l.type === 'key')?.id;
                if (targetLightId) {
                    this.colorSystem.applyToLight(targetLightId, this.lightingSystem);
                }
            }
            
            // Keep the light controls slider synced visually
            const colorInput = document.getElementById('ctrl-color');
            if (colorInput) {
                colorInput.value = this.colorSystem.baseColor;
            }
        }
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
