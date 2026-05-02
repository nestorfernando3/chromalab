/**
 * UI — Thin orchestrator that wires together all UI sub-modules.
 *
 * Modules:
 *  - LessonNavigator   → lesson progression, dots, progress, keyboard
 *  - LightControls     → light selection, sliders, color pickers
 *  - SandboxManager    → free-mode add/remove lights
 *  - ScreenshotExporter → PNG download
 */
import { getPresetNames, getPreset, localizePreset } from './presets.js';
import { switchModelForLighting, switchModel, getModelRegistry, getBackgroundPresets, setBackdropColor } from './model.js';
import { setupOnboarding } from './onboarding.js';
import { renderDiagram } from './diagram.js';
import { clearChildren } from './utils/dom.js';
import { LessonNavigator } from './ui/LessonNavigator.js';
import { LightControls } from './ui/LightControls.js';
import { appEvents } from './utils/events.js';
import { SandboxManager } from './ui/SandboxManager.js';
import { ScreenshotExporter } from './ui/ScreenshotExporter.js';
import { applyStaticTranslations } from './localization.js';
import { DEFAULT_LANGUAGE, normalizeLanguage, storeLanguage } from './runtime.js';

export class UI {
    constructor(lightingSystem, scene, renderer, environment, options = {}) {
        this.lightingSystem = lightingSystem;
        this.scene = scene;
        this.renderer = renderer;
        this.environment = environment;
        this.embedMode = Boolean(options.embedMode);
        this.initialLessonId = options.lessonId || null;
        this.lang = normalizeLanguage(options.language || DEFAULT_LANGUAGE);
        this.currentPreset = null;
        this.currentPresetIndex = 0;
        this.activeModelId = getModelRegistry().at(0)?.id || 'head';
        this.activeBackgroundColor = getBackgroundPresets().at(0)?.color || '#080810';
        this._bgCustomColorInput = null;
        this._bgCustomColorHandler = null;

        const presetNames = getPresetNames();

        // ── Sub-modules ──────────────────────────────────────────────────────

        this.navigator = new LessonNavigator(presetNames, (index) => this.loadLesson(index));

        this.lightControls = new LightControls(
            lightingSystem,
            () => this.currentPreset,
            () => this.lang,
            () => this._updateDiagram()
        );

        // Wire duplicate-light callback — push already done in LightControls._bindControlEvents
        this.lightControls._onDupLight = (newConfig) => {
            this._onSandboxChange(newConfig);
        };

        this.sandboxManager = new SandboxManager(
            lightingSystem,
            () => this.currentPreset,
            () => this.lang,
            (newConfig) => this._onSandboxChange(newConfig)
        );

        this.screenshotExporter = new ScreenshotExporter(
            () => this.currentPreset?.id
        );

        // ── Init ─────────────────────────────────────────────────────────────

        applyStaticTranslations(this.lang);
        this._setupGeneralControls();
        this._setupLanguageSwitch();
        this._renderBackgroundControls();
        this._renderModelSelector();

        setupOnboarding(() => this.loadInitialLesson(), { skipAutoStart: this.embedMode });
        if (this.embedMode) {
            document.getElementById('onboarding')?.classList.add('hidden');
            this.loadInitialLesson();
            this._collapseEmbedControls();
        }
    }

    // ── Lesson Loading ────────────────────────────────────────────────────────

    loadInitialLesson() {
        const presetNames = getPresetNames();
        const fallback = presetNames[0];
        const targetId = this.initialLessonId && presetNames.includes(this.initialLessonId)
            ? this.initialLessonId
            : fallback;
        const index = presetNames.indexOf(targetId);
        return this.loadLesson(index >= 0 ? index : 0);
    }

    async loadLesson(index) {
        const presetNames = getPresetNames();
        if (index < 0 || index >= presetNames.length) return;

        this.currentPresetIndex = index;
        this.navigator.index = index;
        const presetName = presetNames[index];
        const rawPreset = getPreset(presetName);
        this.currentPreset = JSON.parse(JSON.stringify(rawPreset));

        await switchModelForLighting(this.currentPreset.id);

        this.lightingSystem.loadPreset(this.currentPreset);
        this._renderCurrentLesson({ collapseControls: true, preserveSelection: false });
        appEvents.emit('presetLoaded', this.currentPreset);
    }

    refreshCurrentLesson({ preserveSelection = true } = {}) {
        this._renderCurrentLesson({ collapseControls: false, preserveSelection });
    }

    setLanguage(lang, { persist = true } = {}) {
        const nextLang = normalizeLanguage(lang);
        if (this.lang === nextLang) return;

        this.lang = nextLang;
        if (persist) storeLanguage(nextLang);

        applyStaticTranslations(this.lang);
        this._updateLanguageSwitch();
        this._renderBackgroundControls();
        this._renderModelSelector();
        this.refreshCurrentLesson({ preserveSelection: true });
    }

    // ── Light drag feedback (called from main.js) ─────────────────────────────

    onLightDragged(lightId, position) {
        this.lightControls.onLightDragged(lightId, position);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    _getLocalizedCurrentPreset() {
        if (!this.currentPreset) return null;
        return localizePreset(this.currentPreset, this.lang);
    }

    _renderCurrentLesson({ collapseControls = false, preserveSelection = false } = {}) {
        if (!this.currentPreset) return;

        const localizedPreset = this._getLocalizedCurrentPreset();
        const selectedLightId = preserveSelection ? this.lightControls.selectedLightId : null;
        const selectedLight = selectedLightId
            ? localizedPreset.lights.find(light => light.id === selectedLightId)
            : null;

        this.navigator.index = this.currentPresetIndex;
        this.navigator.updateProgress(this.currentPresetIndex);
        this.navigator.updateLessonHeader(localizedPreset, this.currentPresetIndex);
        this.navigator.updateGoalSection(localizedPreset);
        this.navigator.updatePracticeSection(localizedPreset);
        this.navigator.updateObserveSection(localizedPreset);
        this.navigator.updateNavigation(this.currentPresetIndex);

        this.lightingSystem.loadPreset(this.currentPreset);

        this._updateDiagram();
        this._updateLightsOverview();

        if (selectedLight) {
            this.lightControls.selectLight(selectedLight);
        } else {
            this.lightControls.renderLightSelector(localizedPreset, null);
            this.lightControls.selectedLightId = null;
            document.getElementById('drag-indicator')?.classList.add('hidden');
            const container = document.getElementById('light-controls');
            if (container) clearChildren(container);
        }

        if (collapseControls) {
            document.getElementById('controls-panel')?.classList.add('collapsed');
        }

        // Toggle sandbox toolbar visibility
        const toolbar = document.getElementById('sandbox-toolbar');
        if (toolbar) toolbar.classList.toggle('hidden', !this.currentPreset.isSandbox);
        this.sandboxManager.setupSandboxButtons();
    }

    _collapseEmbedControls() {
        const panel = document.getElementById('controls-panel');
        const toggle = document.getElementById('controls-toggle');
        if (!panel) return;

        panel.classList.add('collapsed');
        toggle?.setAttribute('aria-expanded', 'false');
    }

    _updateDiagram() {
        const svg = document.getElementById('lighting-diagram');
        if (!svg || !this.currentPreset) return;
        renderDiagram(this._getLocalizedCurrentPreset(), svg, this.lang);
    }

    _updateLightsOverview() {
        if (!this.currentPreset) return;
        this.sandboxManager.renderLightsOverview(
            (light) => this.lightControls.selectLight(light),
            this.currentPreset?.isSandbox
        );
    }

    _onSandboxChange(newConfig) {
        if (!this.currentPreset) return;

        this._updateLightsOverview();
        this._updateDiagram();

        const localizedPreset = this._getLocalizedCurrentPreset();
        const selectedId = newConfig?.id || this.lightControls.selectedLightId;
        this.lightControls.renderLightSelector(localizedPreset, selectedId);

        if (newConfig) {
            const localizedLight = localizedPreset.lights.find(light => light.id === newConfig.id);
            if (localizedLight) {
                this.lightControls.selectLight(localizedLight);
            }
        } else {
            const stillExists = localizedPreset.lights.some(light => light.id === this.lightControls.selectedLightId);
            if (!stillExists) {
                this.lightControls.selectedLightId = null;
                document.getElementById('drag-indicator')?.classList.add('hidden');
                const container = document.getElementById('light-controls');
                if (container) clearChildren(container);
            }
        }
    }

    _setupGeneralControls() {
        document.getElementById('controls-toggle')?.addEventListener('click', (e) => {
            const panel = document.getElementById('controls-panel');
            if (panel) {
                panel.classList.toggle('collapsed');
                e.currentTarget.setAttribute('aria-expanded', panel.classList.contains('collapsed') ? 'false' : 'true');
            }
        });

        document.getElementById('exposure')?.addEventListener('input', (e) => {
            if (this.renderer) {
                this.renderer.toneMappingExposure = parseFloat(e.target.value);
                appEvents.emit('requestRender');
            }
        });

        document.getElementById('btn-screenshot')?.addEventListener('click', () => {
            this.screenshotExporter.takeScreenshot();
        });

        document.getElementById('btn-help')?.addEventListener('click', () => {
            document.getElementById('onboarding')?.classList.remove('hidden');
        });
    }

    _setupLanguageSwitch() {
        document.querySelectorAll('.language-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang || DEFAULT_LANGUAGE);
            });
        });
        this._updateLanguageSwitch();
    }

    _updateLanguageSwitch() {
        document.querySelectorAll('.language-btn').forEach((btn) => {
            const isActive = (btn.dataset.lang || DEFAULT_LANGUAGE) === this.lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    _renderBackgroundControls() {
        const container = document.getElementById('bg-swatches');
        if (!container) return;

        clearChildren(container);
        const presets = getBackgroundPresets(this.lang);

        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'bg-swatch';
            btn.style.backgroundColor = preset.color;
            btn.title = preset.name;
            btn.setAttribute('aria-label', `${preset.name}`);
            if (preset.color === this.activeBackgroundColor) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                this.activeBackgroundColor = preset.color;
                setBackdropColor(this.scene, this.environment, preset.color);
                const customInput = document.getElementById('bg-custom-color');
                if (customInput) customInput.value = preset.color;
                container.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
            });
            container.appendChild(btn);
        });

        const customInput = document.getElementById('bg-custom-color');
        if (customInput) {
            if (this._bgCustomColorInput && this._bgCustomColorHandler) {
                this._bgCustomColorInput.removeEventListener('input', this._bgCustomColorHandler);
            }

            customInput.value = this.activeBackgroundColor;
            this._bgCustomColorHandler = (e) => {
                this.activeBackgroundColor = e.target.value;
                setBackdropColor(this.scene, this.environment, e.target.value);
                container.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'));
            };
            customInput.addEventListener('input', this._bgCustomColorHandler);
            this._bgCustomColorInput = customInput;
        }
    }

    _renderModelSelector() {
        const container = document.getElementById('model-selector');
        if (!container) return;

        clearChildren(container);
        const models = getModelRegistry(this.lang);

        models.forEach((model) => {
            const btn = document.createElement('button');
            btn.className = 'model-card' + (model.id === this.activeModelId ? ' active' : '');
            btn.dataset.modelId = model.id;
            btn.title = model.description;
            btn.setAttribute('aria-label', model.name);

            const iconEl = document.createElement('span');
            iconEl.className = 'model-icon';
            iconEl.textContent = model.icon;

            const nameEl = document.createElement('span');
            nameEl.className = 'model-name';
            nameEl.textContent = model.name;

            btn.appendChild(iconEl);
            btn.appendChild(nameEl);

            btn.addEventListener('click', () => {
                this.activeModelId = model.id;
                switchModel(model.id);
                container.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
            });
            container.appendChild(btn);
        });
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading')?.classList.add('hidden');
        }, 800);
    }
}
