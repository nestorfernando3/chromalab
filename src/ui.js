/**
 * UI — Thin orchestrator that wires together all UI sub-modules.
 *
 * Modules:
 *  - LessonNavigator     → lesson progression, dots, progress, keyboard
 *  - HarmonyControls     → harmony selection, HSL sliders
 *  - ScreenshotExporter  → PNG download
 */
import { getPresetNames, getPreset, localizePreset } from './presets.js';
import { setBackdropColor, getBackgroundPresets, applyPalette } from './model.js';
import { setupOnboarding } from './onboarding.js';
import { renderDiagram } from './diagram.js';
import { clearChildren } from './utils/dom.js';
import { LessonNavigator } from './ui/LessonNavigator.js';
import { HarmonyControls } from './ui/HarmonyControls.js';
import { appEvents } from './utils/events.js';
import { ScreenshotExporter } from './ui/ScreenshotExporter.js';
import { applyStaticTranslations } from './localization.js';
import { DEFAULT_LANGUAGE, normalizeLanguage, storeLanguage } from './runtime.js';

export class UI {
    constructor(colorSystem, scene, renderer, environment, options = {}) {
        this.colorSystem = colorSystem;
        this.scene = scene;
        this.renderer = renderer;
        this.environment = environment;
        this.embedMode = Boolean(options.embedMode);
        this.initialLessonId = options.lessonId || null;
        this.lang = normalizeLanguage(options.language || DEFAULT_LANGUAGE);
        this.currentPreset = null;
        this.currentPresetIndex = 0;
        this.activeBackgroundColor = getBackgroundPresets().at(0)?.color || '#2a2a3a';
        this._bgCustomColorInput = null;
        this._bgCustomColorHandler = null;

        const presetNames = getPresetNames();

        // ── Sub-modules ──────────────────────────────────────────────────────

        this.navigator = new LessonNavigator(presetNames, (index) => this.loadLesson(index));

        this.harmonyControls = new HarmonyControls(
            colorSystem,
            () => this.currentPreset,
            () => this.lang,
            () => this._updateDiagram()
        );

        this.screenshotExporter = new ScreenshotExporter(
            () => this.currentPreset?.id
        );

        // ── Init ─────────────────────────────────────────────────────────────

        applyStaticTranslations(this.lang);
        this._setupGeneralControls();
        this._setupLanguageSwitch();
        this._renderBackgroundControls();

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

        this.colorSystem.loadPreset(this.currentPreset);
        this._renderCurrentLesson({ collapseControls: true });
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
        this.refreshCurrentLesson({ preserveSelection: true });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    _getLocalizedCurrentPreset() {
        if (!this.currentPreset) return null;
        return localizePreset(this.currentPreset, this.lang);
    }

    _renderCurrentLesson({ collapseControls = false, preserveSelection = true } = {}) {
        if (!this.currentPreset) return;

        const localizedPreset = this._getLocalizedCurrentPreset();

        this.navigator.index = this.currentPresetIndex;
        this.navigator.updateProgress(this.currentPresetIndex);
        this.navigator.updateLessonHeader(localizedPreset, this.currentPresetIndex);
        this.navigator.updateGoalSection(localizedPreset);
        this.navigator.updatePracticeSection(localizedPreset);
        this.navigator.updateObserveSection(localizedPreset);
        this.navigator.updateNavigation(this.currentPresetIndex);

        this.colorSystem.loadPreset(this.currentPreset);
        this._applyPaletteToScene();
        this._updateDiagram();

        if (this.harmonyControls && typeof this.harmonyControls.render === 'function') {
            this.harmonyControls.render(localizedPreset);
        }

        if (collapseControls) {
            document.getElementById('controls-panel')?.classList.add('collapsed');
        }
    }

    _applyPaletteToScene() {
        const colors = this.colorSystem.getColors();
        const objectIds = ['wallMain', 'sofa', 'table', 'lamp', 'picture', 'wallLeft'];
        applyPalette(objectIds, colors);
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
        const preset = this._getLocalizedCurrentPreset();
        renderDiagram(preset, svg, this.lang);
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

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading')?.classList.add('hidden');
        }, 800);
    }
}
