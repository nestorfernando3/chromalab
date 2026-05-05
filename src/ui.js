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
import { DEFAULT_MODEL_ID, switchModel, getModelRegistry, getBackgroundPresets, setBackdropColor } from './model.js';
import { setupOnboarding } from './onboarding.js';
import { renderDiagram } from './diagram.js';
import { clearChildren } from './utils/dom.js';
import { LessonNavigator } from './ui/LessonNavigator.js';
import { LightControls } from './ui/LightControls.js';
import { PaletteControls } from './ui/PaletteControls.js';
import { LessonChecklist } from './ui/LessonChecklist.js';
import { StudentResponse } from './ui/StudentResponse.js';
import { ColorSystem } from './colorSystem.js';
import { LessonProgressEngine } from './lessonProgress.js';
import { EvidenceStore } from './evidenceStore.js';
import { appEvents } from './utils/events.js';
import { SandboxManager } from './ui/SandboxManager.js';
import { ScreenshotExporter } from './ui/ScreenshotExporter.js';
import { applyStaticTranslations, getAppCopy } from './localization.js';
import { DEFAULT_LANGUAGE, normalizeLanguage, storeLanguage } from './runtime.js';

const UI_STORAGE_KEYS = {
    controlsCollapsed: 'chromaLab.controlsCollapsed',
    completedLessons: 'chromaLab.completedLessons'
};

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
        this.activeModelId = DEFAULT_MODEL_ID;
        this.activeBackgroundColor = getBackgroundPresets().at(0)?.color || '#080810';
        this.controlsCollapsed = this._readControlsCollapsed();
        this.completedLessonIds = new Set(this._readCompletedLessons());
        this._toastTimer = null;
        this._bgCustomColorInput = null;
        this._bgCustomColorHandler = null;
        this.colorSystem = null;
        this.paletteControls = null;
        this.progressEngine = new LessonProgressEngine();
        this.evidenceStore = new EvidenceStore();
        this.lessonChecklist = new LessonChecklist(() => this.lang, this.progressEngine);
        this.studentResponse = new StudentResponse(() => this.lang, this.evidenceStore, this.progressEngine);

        // Sync completed lesson dots with evidence store on startup
        this._syncCompletedLessonsFromEvidence();

        const presetNames = getPresetNames();

        // ── Sub-modules ──────────────────────────────────────────────────────

        this.navigator = new LessonNavigator(presetNames, (index) => this.loadLesson(index));

        this.lightControls = new LightControls(
            lightingSystem,
            () => this.currentPreset,
            () => this.lang,
            () => this._updateDiagram(),
            (newConfig) => this._onSandboxChange(newConfig)
        );

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
        if (this.embedMode) this.controlsCollapsed = true;
        this._applyControlsCollapsedState(this.controlsCollapsed, { persist: false });
        this._syncMobilePanelButtons();

        this._onboarding = setupOnboarding(() => this.loadInitialLesson(), { skipAutoStart: this.embedMode });
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

        const previousId = this.currentPreset?.id || null;
        const nextPresetId = presetNames[index];
        // REMOVED: auto-mark previous lesson as completed on navigation
        // Completion is now determined by LessonProgressEngine based on actions

        this.currentPresetIndex = index;
        this.navigator.index = index;
        const rawPreset = getPreset(nextPresetId);
        this.currentPreset = JSON.parse(JSON.stringify(rawPreset));

        // Initialize pedagogical color system for this lesson
        if (this.paletteControls) {
            this.paletteControls.destroy();
            this.paletteControls = null;
        }
        if (this.studentResponse) {
            this.studentResponse.destroy();
        }
        this.colorSystem = new ColorSystem({ preset: this.currentPreset });
        this.paletteControls = new PaletteControls(
            this.colorSystem,
            () => this.currentPreset,
            () => this.lang,
            this.lightingSystem
        );

        // Register lesson with progress engine
        this.progressEngine.registerLesson(
            this.currentPreset.id,
            this.currentPreset.checklist || [],
            this.currentPreset.completionRules || {}
        );

        // Restore previous color state if available
        const savedEvidence = this.evidenceStore.getLessonEvidence(this.currentPreset.id);
        if (savedEvidence?.colorState) {
            this.colorSystem.restoreState(savedEvidence.colorState);
        }

        // Persist color state changes
        appEvents.on('palette:previewChanged', (payload) => {
            if (payload.lessonId === this.currentPreset?.id) {
                this.evidenceStore.saveColorState(payload.lessonId, this.colorSystem.state);
            }
        });

        // Persist criteria progress
        appEvents.on('lesson:criteriaCompleted', (payload) => {
            const completed = this.progressEngine.getCompletedCriteria(payload.lessonId);
            this.evidenceStore.saveCriteria(payload.lessonId, completed);
            // Update completed lessons set for dots display
            const rules = this.currentPreset?.completionRules || {};
            const checklist = this.currentPreset?.checklist || [];
            const isComplete = this._evaluateCompletion(checklist, completed, rules);
            if (isComplete) {
                this._markLessonCompleted(payload.lessonId);
            }
        });

        // Register screenshots as evidence
        appEvents.on('screenshotTaken', (payload) => {
            if (payload.lessonId) {
                this.evidenceStore.registerScreenshot(payload.lessonId, payload.filename, 'evidence');
            }
        });

        this.lightingSystem.loadPreset(this.currentPreset);
        this._renderCurrentLesson({ collapseControls: this.controlsCollapsed, preserveSelection: false });
        if (this._isMobileLayout()) {
            this._setMobilePanel('teach', true);
            this._setMobilePanel('controls', false);
        }
        appEvents.emit('presetLoaded', this.currentPreset);
    }

    refreshCurrentLesson({ preserveSelection = true } = {}) {
        this._renderCurrentLesson({ collapseControls: this.controlsCollapsed, preserveSelection });
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

    _renderCurrentLesson({ collapseControls = this.controlsCollapsed, preserveSelection = false } = {}) {
        if (!this.currentPreset) return;

        const localizedPreset = this._getLocalizedCurrentPreset();
        const selectedLightId = preserveSelection ? this.lightControls.selectedLightId : null;
        const selectedLight = selectedLightId
            ? localizedPreset.lights.find(light => light.id === selectedLightId)
            : null;

        this.navigator.index = this.currentPresetIndex;
        this.navigator.updateProgress(this.currentPresetIndex, this.completedLessonIds.size + 1);
        this.navigator.updateLessonHeader(localizedPreset, this.currentPresetIndex);
        this.navigator.updateGoalSection(localizedPreset);
        this.navigator.updatePracticeSection(localizedPreset);
        this.navigator.updateObserveSection(localizedPreset);
        this.navigator.updateNavigation(this.currentPresetIndex, this._getCompletedLessonIndexes());

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

        // Render pedagogical palette controls
        if (this.paletteControls) {
            this.paletteControls.render();
        }

        // Render lesson checklist
        if (this.lessonChecklist) {
            this.lessonChecklist.render(this.currentPreset.id, this.currentPreset.checklist || []);
        }

        // Render student response form
        if (this.studentResponse) {
            this.studentResponse.render(this.currentPreset.id, this.currentPreset);
        }

        this._applyControlsCollapsedState(Boolean(collapseControls), { persist: false });

        // Toggle sandbox toolbar visibility
        const toolbar = document.getElementById('sandbox-toolbar');
        if (toolbar) toolbar.classList.toggle('hidden', !this.currentPreset.isSandbox);
        this.sandboxManager.setupSandboxButtons();
    }

    _collapseEmbedControls() {
        this._applyControlsCollapsedState(true, { persist: false });
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
            const next = !this.controlsCollapsed;
            this._applyControlsCollapsedState(next);
            e.currentTarget.setAttribute('aria-expanded', next ? 'false' : 'true');
        });

        document.getElementById('mobile-teach-toggle')?.addEventListener('click', () => {
            const isOpen = this._isPanelOpen('teach');
            this._setMobilePanel('teach', !isOpen);
            this._setMobilePanel('controls', false);
        });

        document.getElementById('mobile-controls-toggle')?.addEventListener('click', () => {
            const isOpen = this._isPanelOpen('controls');
            this._setMobilePanel('controls', !isOpen);
            this._setMobilePanel('teach', false);
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

        appEvents.on('screenshotTaken', () => this._showToast('status.screenshotSaved'));
        appEvents.on('screenshotFailed', () => this._showToast('status.screenshotFailed'));
        appEvents.on('tipRestored', () => this._showToast('status.tipRestored'));
        appEvents.on('escapeKey', () => {
            if (this._onboarding?.skip) {
                this._onboarding.skip();
            } else {
                document.getElementById('onboarding')?.classList.add('hidden');
            }
            this._setMobilePanel('teach', false);
            this._setMobilePanel('controls', false);
        });
        appEvents.on('background:changed', (payload) => {
            if (payload.color) {
                this.activeBackgroundColor = payload.color;
                setBackdropColor(this.scene, this.environment, payload.color);
                const customInput = document.getElementById('bg-custom-color');
                if (customInput) customInput.value = payload.color;
                document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'));
            }
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

    _readControlsCollapsed() {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem(UI_STORAGE_KEYS.controlsCollapsed) === 'true';
    }

    _saveControlsCollapsed(value) {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(UI_STORAGE_KEYS.controlsCollapsed, value ? 'true' : 'false');
    }

    _applyControlsCollapsedState(collapsed, { persist = true } = {}) {
        this.controlsCollapsed = Boolean(collapsed);
        const panel = document.getElementById('controls-panel');
        const toggle = document.getElementById('controls-toggle');
        panel?.classList.toggle('collapsed', this.controlsCollapsed);
        toggle?.setAttribute('aria-expanded', this.controlsCollapsed ? 'false' : 'true');
        if (persist) this._saveControlsCollapsed(this.controlsCollapsed);
    }

    _readCompletedLessons() {
        if (typeof localStorage === 'undefined') return [];
        try {
            const raw = localStorage.getItem(UI_STORAGE_KEYS.completedLessons);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    }

    _syncCompletedLessonsFromEvidence() {
        const allEvidence = this.evidenceStore.getAllEvidence();
        const presetNames = getPresetNames();
        presetNames.forEach((id) => {
            const ev = allEvidence[id];
            if (!ev?.criteria) return;
            const preset = getPreset(id);
            const checklist = preset?.checklist || [];
            const rules = preset?.completionRules || {};
            if (this._evaluateCompletion(checklist, ev.criteria, rules)) {
                this.completedLessonIds.add(id);
            }
        });
        this._saveCompletedLessons();
    }

    _saveCompletedLessons() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(UI_STORAGE_KEYS.completedLessons, JSON.stringify([...this.completedLessonIds]));
    }

    _markLessonCompleted(lessonId) {
        if (!lessonId || this.completedLessonIds.has(lessonId)) return;
        this.completedLessonIds.add(lessonId);
        this._saveCompletedLessons();
        this._showToast('status.lessonCompleted');
    }

    _evaluateCompletion(checklist, completedIds, rules) {
        if (!checklist?.length) return false;
        const completedSet = new Set(completedIds);
        if (rules?.mode === 'allRequired') {
            const required = checklist.filter(c => c.required);
            if (!required.length) return false;
            return required.every(c => completedSet.has(c.id));
        }
        const required = checklist.filter(c => c.required);
        return required.length > 0 && required.every(c => completedSet.has(c.id));
    }

    _getCompletedLessonIndexes() {
        const lessonIds = getPresetNames();
        return lessonIds.reduce((indexes, id, index) => {
            if (this.completedLessonIds.has(id)) indexes.push(index);
            return indexes;
        }, []);
    }

    _isMobileLayout() {
        return typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches;
    }

    _isPanelOpen(panelName) {
        const panel = document.getElementById(`${panelName}-panel`);
        return panel?.classList.contains('open') || false;
    }

    _setMobilePanel(panelName, open) {
        const panel = document.getElementById(`${panelName}-panel`);
        const toggle = document.getElementById(`mobile-${panelName}-toggle`);
        if (!panel) return;

        panel.classList.toggle('open', Boolean(open));
        toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    _syncMobilePanelButtons() {
        ['teach', 'controls'].forEach((panelName) => {
            const toggle = document.getElementById(`mobile-${panelName}-toggle`);
            toggle?.setAttribute('aria-expanded', this._isPanelOpen(panelName) ? 'true' : 'false');
        });
    }

    _showToast(messageKey) {
        const el = document.getElementById('status-toast');
        if (!el) return;

        const localized = getAppCopy(this.lang);
        const message = messageKey.split('.').reduce((acc, key) => acc?.[key], localized);
        el.textContent = typeof message === 'string' ? message : messageKey;
        el.classList.add('visible');

        if (this._toastTimer) clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            el.classList.remove('visible');
        }, 1800);
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading')?.classList.add('hidden');
        }, 800);
    }
}
