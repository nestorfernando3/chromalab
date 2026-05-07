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
import { appEvents } from './utils/events.js';
import { SandboxManager } from './ui/SandboxManager.js';
import { ScreenshotExporter } from './ui/ScreenshotExporter.js';
import { ScreenshotToast } from './ui/ScreenshotToast.js';
import { LessonCompletionModal } from './ui/LessonCompletionModal.js';
import { ComparisonMode } from './ui/ComparisonMode.js';
import { applyStaticTranslations, getAppCopy } from './localization.js';
import { DEFAULT_LANGUAGE, normalizeLanguage, storeLanguage } from './runtime.js';
import { LessonMission } from './ui/LessonMission.js';
import CurriculumDrawer from './ui/CurriculumDrawer.js';
import { LessonChecklist } from './ui/LessonChecklist.js';
import { StudentResponse } from './ui/StudentResponse.js';
import { PaletteControls } from './ui/PaletteControls.js';
import { ColorSystem } from './colorSystem.js';
import { LessonProgressEngine } from './lessonProgress.js';
import { EvidenceStore } from './evidenceStore.js';
import { LessonSession } from './lessonSession.js';

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
        this._onPresetLoaded = options.onPresetLoaded || null;
        this.session = new LessonSession();
        this.session.onChange((type, data) => {
            if (type === 'lessonCompleted') {
                this._showToast('status.lessonCompleted');
                this.completionModal.show({
                    preset: this.session.currentPreset,
                    completedLabels: (this.session.currentPreset?.checklist || []).map(item => item.id)
                });
            } else if (type === 'lessonLoaded' && data?.preset) {
                this._onSessionLessonLoaded(data.preset);
            }
        });
        this.activeModelId = DEFAULT_MODEL_ID;
        this.activeBackgroundColor = getBackgroundPresets().at(0)?.color || '#080810';
        this.controlsCollapsed = this._readControlsCollapsed();
        this._toastTimer = null;
        this._bgCustomColorInput = null;
        this._bgCustomColorHandler = null;
        this.exploreMode = false;
        this._currentLayout = this._detectLayoutMode();
        this._highlightTimeout = null;

        const presetNames = this.session.presetNames;

        // ── Sub-modules ──────────────────────────────────────────────────────

        this.navigator = new LessonNavigator(
            presetNames,
            (index) => this.loadLesson(index),
            {
                onResetControls: options.onResetControls || null,
                onEscapeKey: () => {
                    document.getElementById('onboarding')?.classList.add('hidden');
                    this._setMobilePanel('teach', false);
                    this._setMobilePanel('controls', false);
                }
            }
        );

        this.lightControls = new LightControls(
            lightingSystem,
            () => this.session.currentPreset,
            () => this.lang,
            () => this._updateDiagram(),
            (newConfig) => this._onSandboxChange(newConfig)
        );

        this.sandboxManager = new SandboxManager(
            lightingSystem,
            () => this.session.currentPreset,
            () => this.lang,
            (newConfig) => this._onSandboxChange(newConfig)
        );

        this.screenshotExporter = new ScreenshotExporter(
            () => this.session.currentPreset?.id
        );
        this.screenshotToast = new ScreenshotToast(() => getAppCopy(this.lang).screenshotToast);
        this.completionModal = new LessonCompletionModal(() => this.lang, () => getAppCopy(this.lang).completionModal);
        this.comparisonMode = new ComparisonMode(() => this.lang);

        this.progressEngine = new LessonProgressEngine();
        this.evidenceStore = new EvidenceStore();
        this.colorSystem = null;
        this.paletteControls = null;
        this.lessonChecklist = new LessonChecklist(() => this.lang, this.progressEngine);
        this.studentResponse = new StudentResponse(() => this.lang, this.evidenceStore, this.progressEngine);
        this.lessonMission = new LessonMission(
            () => this.lang,
            (lessonId) => this.progressEngine.getCompletedCriteria(lessonId)
        );

        this.curriculumDrawer = new CurriculumDrawer(
            () => this.lang,
            () => getAppCopy(this.lang).curriculum,
            (index) => { this.loadLesson(index); this.curriculumDrawer.close(); }
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

        this._setupExploreModeToggle();
        this._setupControlGroupToggle();
        this._updateLayoutMode();
        this._setupLayoutResizeListener();

        setupOnboarding(() => this.loadInitialLesson(), { skipAutoStart: this.embedMode });
        if (this.embedMode) {
            document.getElementById('onboarding')?.classList.add('hidden');
            this.loadInitialLesson();
            this._collapseEmbedControls();
        }
    }

    // ── Lesson Loading ────────────────────────────────────────────────────────

    loadInitialLesson() {
        const presetNames = this.session.presetNames;
        const fallback = presetNames[0];
        const targetId = this.initialLessonId && presetNames.includes(this.initialLessonId)
            ? this.initialLessonId
            : fallback;
        const index = presetNames.indexOf(targetId);
        return this.loadLesson(index >= 0 ? index : 0);
    }

    async loadLesson(index) {
        const preset = this.session.loadLesson(index);
        if (!preset) return;

        this.navigator.index = this.session.currentIndex;
        this.lightingSystem.loadPreset(preset);
        this._renderCurrentLesson({ collapseControls: this.controlsCollapsed, preserveSelection: false });
        if (this._isMobileLayout()) {
            this._setMobilePanel('teach', true);
            this._setMobilePanel('controls', false);
        }
        if (this._onPresetLoaded) {
            this._onPresetLoaded(preset);
        }
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

    _onSessionLessonLoaded(preset) {
        if (!preset) return;
        if (this.paletteControls) {
            this.paletteControls.destroy();
            this.paletteControls = null;
        }
        if (this.studentResponse) {
            this.studentResponse.destroy();
        }
        this.colorSystem = new ColorSystem({ preset });
        this.paletteControls = new PaletteControls(
            this.colorSystem,
            () => this.session.currentPreset,
            () => this.lang,
            this.lightingSystem
        );
        this.progressEngine.registerLesson(
            preset.id,
            preset.checklist || [],
            preset.completionRules || {}
        );
        this.evidenceStore = new EvidenceStore();

        appEvents.on('palette:applied', (payload) => {
            if (payload.lessonId === preset.id) {
                this.evidenceStore.saveColorState(payload.lessonId, {
                    hue: this.colorSystem?.hue,
                    saturation: this.colorSystem?.saturation,
                    value: this.colorSystem?.value,
                    harmonyType: this.colorSystem?.harmonyType
                });
            }
        });

        appEvents.on('lesson:criteriaCompleted', (payload) => {
            if (payload.lessonId === preset.id) {
                const completed = this.progressEngine.getCompletedCriteria(payload.lessonId);
                this.evidenceStore.saveCriteria(payload.lessonId, completed);
            }
        });

        appEvents.on('screenshotTaken', (payload) => {
            if (payload?.lessonId) {
                this.evidenceStore.registerScreenshot(payload.lessonId, payload.filename, 'evidence');
            }
        });
    }

    _getLocalizedCurrentPreset() {
        const preset = this.session.currentPreset;
        if (!preset) return null;
        return localizePreset(preset, this.lang);
    }

    _renderCurrentLesson({ collapseControls = this.controlsCollapsed, preserveSelection = false } = {}) {
        const preset = this.session.currentPreset;
        if (!preset) return;

        const localizedPreset = this._getLocalizedCurrentPreset();
        const selectedLightId = preserveSelection ? this.lightControls.selectedLightId : null;
        const selectedLight = selectedLightId
            ? localizedPreset.lights.find(light => light.id === selectedLightId)
            : null;

        const currentIndex = this.session.currentIndex;
        this.navigator.index = currentIndex;
        this.navigator.updateProgress(currentIndex, this.session.getCompletedIds().size + 1);
        this.navigator.updateLessonHeader(localizedPreset, currentIndex);
        this.navigator.updateGoalSection(localizedPreset);
        this.navigator.updatePracticeSection(localizedPreset);
        this.navigator.updateObserveSection(localizedPreset);
        this.navigator.updateNavigation(currentIndex, this.session.getCompletedIndexes());

        // Render lesson mission
        this.lessonMission.render(preset?.id, preset?.checklist || []);

        // Render pedagogical palette controls
        if (this.paletteControls) {
            this.paletteControls.render();
        }

        // Render lesson checklist
        if (this.lessonChecklist) {
            this.lessonChecklist.render(preset?.id, preset?.checklist || []);
        }

        // Render student response form
        if (this.studentResponse) {
            this.studentResponse.render(preset?.id, preset);
        }

        this.lightingSystem.loadPreset(preset);

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

        this._applyControlsCollapsedState(Boolean(collapseControls), { persist: false });

        // Toggle sandbox toolbar visibility
        const toolbar = document.getElementById('sandbox-toolbar');
        if (toolbar) toolbar.classList.toggle('hidden', !preset.isSandbox);
        this.sandboxManager.setupSandboxButtons();

        // Apply mode visibility & update light context
        this._applyModeVisibility();
        this._updateSelectedLightContext(selectedLight || null);

        // Update palette strip
        this._updatePaletteStrip();

        // Render comparison mode card
        this.comparisonMode.render(localizedPreset);
        this._renderLessonRail();
    }

    _collapseEmbedControls() {
        this._applyControlsCollapsedState(true, { persist: false });
    }

    _updateDiagram() {
        const svg = document.getElementById('lighting-diagram');
        const preset = this.session.currentPreset;
        if (!svg || !preset) return;
        const localizedPreset = this._getLocalizedCurrentPreset();
        renderDiagram(localizedPreset, svg, this.lang, {
            onHueChange: (hue) => {
                if (this.colorSystem) {
                    this.colorSystem.setHue(hue);
                    this._updateDiagramIndicator(hue, this.colorSystem.saturation, this.colorSystem.value);
                }
            },
            onDragEnd: () => {
                this._updateDiagram();
            }
        });
    }

    _updateDiagramIndicator(hue, saturation, value) {
        const svg = document.getElementById('lighting-diagram');
        if (svg && svg._controls) {
            svg._controls.updateIndicator(hue, saturation, value);
        }
    }

    _updateLightsOverview() {
        const preset = this.session.currentPreset;
        if (!preset) return;
        this.sandboxManager.renderLightsOverview(
            (light) => this.lightControls.selectLight(light),
            preset?.isSandbox
        );
    }

    // ── Explore Mode Toggle ──────────────────────────────────────────────────

    _setupExploreModeToggle() {
        const guidedBtn = document.getElementById('mode-guided');
        const exploreBtn = document.getElementById('mode-explore');
        if (!guidedBtn || !exploreBtn) return;

        const setMode = (explore) => {
            this.exploreMode = explore;
            guidedBtn.classList.toggle('active', !explore);
            exploreBtn.classList.toggle('active', explore);
            guidedBtn.setAttribute('aria-pressed', explore ? 'false' : 'true');
            exploreBtn.setAttribute('aria-pressed', explore ? 'true' : 'false');
            document.body.classList.toggle('explore-mode', explore);
            this._applyModeVisibility();
        };

        guidedBtn.addEventListener('click', () => setMode(false));
        exploreBtn.addEventListener('click', () => setMode(true));
    }

    // ── Control Group Toggle ──────────────────────────────────────────────────

    _setupControlGroupToggle() {
        document.querySelectorAll('.control-group-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const group = header.closest('.control-group');
                if (!group) return;
                group.classList.toggle('collapsed');
                header.setAttribute('aria-expanded', !group.classList.contains('collapsed'));
            });
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    }

    // ── Layout Mode Detection ─────────────────────────────────────────────────

    _detectLayoutMode() {
        if (typeof window === 'undefined') return 'desktop-wide';
        const w = window.innerWidth;
        if (w <= 560) return 'mobile';
        if (w <= 960) return 'tablet';
        if (w <= 1280) return 'desktop-compact';
        return 'desktop-wide';
    }

    _updateLayoutMode() {
        const mode = this._detectLayoutMode();
        this._currentLayout = mode;
        document.body.classList.remove('layout-desktop-wide', 'layout-desktop-compact', 'layout-tablet', 'layout-mobile');
        document.body.classList.add(`layout-${mode}`);
    }

    _setupLayoutResizeListener() {
        let timer;
        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => this._updateLayoutMode(), 150);
        });
    }

    // ── Mode Visibility ──────────────────────────────────────────────────────

    _applyModeVisibility() {
        const cgPalette = document.getElementById('cg-palette');
        const cgLights = document.getElementById('cg-lights');
        const cgEnvironment = document.getElementById('cg-environment');
        const cgModel = document.getElementById('cg-model');

        if (this.exploreMode) {
            // Expand all groups in explore mode
            [cgPalette, cgLights, cgEnvironment, cgModel].forEach(g => {
                if (g) {
                    g.classList.remove('collapsed');
                    const header = g.querySelector('.control-group-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                }
            });
        } else {
            // In guided mode, collapse environment by default; keep model expanded
            [cgEnvironment].forEach(g => {
                if (g) {
                    g.classList.add('collapsed');
                    const header = g.querySelector('.control-group-header');
                    if (header) header.setAttribute('aria-expanded', 'false');
                }
            });
            [cgPalette, cgLights].forEach(g => {
                if (g) {
                    g.classList.remove('collapsed');
                    const header = g.querySelector('.control-group-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                }
            });
        }
    }

    // ── Selected Light Context ────────────────────────────────────────────────

    _updateSelectedLightContext(light) {
        const container = document.getElementById('selected-light-context');
        const dot = document.getElementById('slc-dot');
        const label = document.getElementById('slc-label');
        const role = document.getElementById('slc-role');
        if (!container) return;

        if (light) {
            container.classList.add('visible');
            if (dot) dot.style.backgroundColor = light.color || '#fff';
            if (label) label.textContent = light.name || '';
            if (role) role.textContent = light.role || '';
        } else {
            container.classList.remove('visible');
        }
    }

    // ── Control Highlighting ──────────────────────────────────────────────────

    _highlightControl(controlId) {
        if (this._highlightTimeout) {
            clearTimeout(this._highlightTimeout);
            this._highlightTimeout = null;
        }
        // Remove existing highlights
        document.querySelectorAll('.control-group.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });

        if (!controlId) return;

        const target = document.getElementById(controlId);
        if (target) {
            target.classList.add('highlighted');
            // Ensure the group is expanded
            target.classList.remove('collapsed');
            const header = target.querySelector('.control-group-header');
            if (header) header.setAttribute('aria-expanded', 'true');
        }

        // Auto-clear after 3s
        this._highlightTimeout = setTimeout(() => {
            document.querySelectorAll('.control-group.highlighted').forEach(el => {
                el.classList.remove('highlighted');
            });
        }, 3000);
    }

    _onActiveStepChanged(payload) {
        if (!payload || !payload.activeStepId) {
            this._highlightControl(null);
            return;
        }

        const target = this.lessonMission?.getStepTarget?.();
        const controlId = target?.group || target?.controlId || null;
        this._highlightControl(controlId);
        this._showActiveStepHint(payload.activeStepId, target);
    }

    _showActiveStepHint(stepId, target) {
        const copy = getAppCopy(this.lang).missionHints || {};
        const message = copy[stepId];
        if (!message) return;
        this._showSceneFeedback(message);
        if (target?.controlId) {
            const el = document.getElementById(target.controlId);
            el?.classList.add('control-target-pulse');
            setTimeout(() => el?.classList.remove('control-target-pulse'), 2200);
        }
    }

    // ── Scene Feedback ────────────────────────────────────────────────────────

    _showSceneFeedback(msg) {
        const container = document.getElementById('scene-feedback-message');
        const parent = document.getElementById('scene-feedback');
        if (!container || !parent) return;

        container.textContent = msg;
        container.removeAttribute('aria-hidden');
        parent.classList.add('visible');

        // Re-trigger animation
        container.style.animation = 'none';
        requestAnimationFrame(() => {
            container.style.animation = '';
        });

        clearTimeout(this._feedbackTimer);
        this._feedbackTimer = setTimeout(() => {
            container.setAttribute('aria-hidden', 'true');
            parent.classList.remove('visible');
        }, 2500);
    }

    _getSceneFeedbackMessage(payload) {
        const copy = getAppCopy(this.lang);
        if (!payload) return '';

        if (payload.type === 'color-applied') {
            return copy.sceneFeedback?.colorApplied || 'Color aplicado a la escena';
        }
        if (payload.type === 'background-changed') {
            return copy.sceneFeedback?.backgroundChanged || 'Fondo cambiado';
        }
        if (payload.type === 'step-completed') {
            return copy.sceneFeedback?.stepCompleted || 'Paso completado';
        }
        return copy.sceneFeedback?.applied || 'Aplicado';
    }

    // ── Palette Strip ─────────────────────────────────────────────────────────

    _updatePaletteStrip() {
        const strip = document.getElementById('palette-strip');
        if (!strip) return;

        const preset = this.session.currentPreset;
        if (!preset) {
            strip.classList.remove('visible');
            return;
        }

        const colors = this.colorSystem?.palette?.length
            ? this.colorSystem.palette
            : (preset.lights || []).map(l => l.color).filter(Boolean);

        if (colors.length === 0) {
            strip.classList.remove('visible');
            return;
        }

        strip.classList.add('visible');

        // Only re-render if colors changed
        const key = colors.join(',');
        if (strip.dataset.colorKey === key) return;
        strip.dataset.colorKey = key;

        while (strip.firstChild) strip.removeChild(strip.firstChild);

        const copy = getAppCopy(this.lang);
        colors.forEach((c, index) => {
            const swatch = document.createElement('button');
            swatch.type = 'button';
            swatch.className = 'palette-strip-swatch';
            swatch.style.backgroundColor = c;
            swatch.title = c;
            swatch.setAttribute(
                'aria-label',
                `${copy.palette?.palette || 'Paleta'} ${index + 1}: ${c}`
            );
            swatch.addEventListener('click', () => {
                appEvents.emit('background:changed', {
                    lessonId: preset.id,
                    color: c,
                    source: 'palette-strip'
                });
                appEvents.emit('palette:applied', {
                    lessonId: preset.id,
                    target: 'background',
                    colors: [c],
                    source: 'palette-strip'
                });
            });
            strip.appendChild(swatch);
        });
    }

    _onSandboxChange(newConfig) {
        const preset = this.session.currentPreset;
        if (!preset) return;

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

        document.getElementById('btn-curriculum')?.addEventListener('click', () => {
            this.curriculumDrawer.render({
                lessons: this.session.presets,
                currentId: this.session.currentPreset?.id,
                completedIds: this._getCompletedLessonIndexes()
            });
            this.curriculumDrawer.toggle();
        });

        document.getElementById('btn-help')?.addEventListener('click', () => {
            document.getElementById('onboarding')?.classList.remove('hidden');
        });

        appEvents.on('screenshotTaken', (payload) => {
            this.screenshotToast.show(payload);
            this._showToast('status.screenshotSaved');
        });
        appEvents.on('screenshotFailed', () => this._showToast('status.screenshotFailed'));
        appEvents.on('tipRestored', () => this._showToast('status.tipRestored'));

        // ── UI/UX Event Listeners ───────────────────────────────────────────
        appEvents.on('lesson:activeStepChanged', (payload) => this._onActiveStepChanged(payload));

        appEvents.on('light:selected', (payload) => {
            if (payload?.light) {
                this._updateSelectedLightContext(payload.light);
            }
        });

        appEvents.on('lesson:nextRequested', () => {
            const next = Math.min(this.session.currentIndex + 1, this.session.totalCount - 1);
            this.loadLesson(next);
        });

        // Scene feedback on palette applied
        appEvents.on('palette:applied', (payload) => {
            this._showSceneFeedback(this._getSceneFeedbackMessage(payload));
            this._updatePaletteStrip();
        });

        appEvents.on('palette:previewChanged', () => {
            this._updatePaletteStrip();
            this._updateDiagram();
        });

        appEvents.on('color:harmonyChanged', () => {
            this._updateDiagram();
        });

        // Scene feedback on background changed
        appEvents.on('background:changed', (payload) => {
            if (payload?.color) {
                this._applyBackgroundColor(payload.color);
                this._showSceneFeedback(this._getSceneFeedbackMessage({
                    ...payload,
                    type: payload.type || 'background-changed'
                }));
            }
        });

        // Close mobile panels on navigation
        appEvents.on('lesson:activeStepChanged', () => {
            if (this._isMobileLayout()) {
                this._setMobilePanel('controls', false);
                this._setMobilePanel('teach', false);
            }
        });

        // Scrim click → close mobile panels
        document.getElementById('app-scrim')?.addEventListener('click', () => {
            this._setMobilePanel('teach', false);
            this._setMobilePanel('controls', false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            this.curriculumDrawer?.close();
            this.completionModal?.close();
            const compLayer = document.getElementById('comparison-layer');
            compLayer?.classList.remove('split-active');
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
            btn.dataset.color = preset.color;
            btn.style.backgroundColor = preset.color;
            btn.title = preset.name;
            btn.setAttribute('aria-label', `${preset.name}`);
            if (preset.color === this.activeBackgroundColor) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                this._applyBackgroundColor(preset.color);
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
                this._applyBackgroundColor(e.target.value);
            };
            customInput.addEventListener('input', this._bgCustomColorHandler);
            this._bgCustomColorInput = customInput;
        }
    }

    _applyBackgroundColor(color) {
        if (!color) return;
        this.activeBackgroundColor = color;
        setBackdropColor(this.scene, this.environment, color);

        const customInput = document.getElementById('bg-custom-color');
        if (customInput) customInput.value = color;

        document.querySelectorAll('.bg-swatch').forEach((swatch) => {
            swatch.classList.toggle('active', swatch.dataset.color === color);
        });

        appEvents.emit('requestRender');
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
        document.getElementById('lesson-rail')?.classList.toggle('visible', this.controlsCollapsed);
    }

    _renderLessonRail() {
        const rail = document.getElementById('lesson-rail');
        if (!rail || !this.session.currentPreset) return;
        const progress = this.progressEngine.getCompletedCriteria(this.session.currentPreset.id).length;
        rail.innerHTML = `
      <button type="button" class="lesson-rail-btn" data-target="mission" aria-label="Open lesson">${this.session.currentIndex + 1}</button>
      <button type="button" class="lesson-rail-btn" data-target="steps" aria-label="View steps">${progress}</button>
      <button type="button" class="lesson-rail-btn" data-target="evidence" aria-label="View evidence">E</button>
    `;
        rail.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => this._setMobilePanel('teach', true));
        });
    }

    _getCompletedLessonIndexes() {
        return this.session.getCompletedIndexes();
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
