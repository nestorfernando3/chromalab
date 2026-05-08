import { appEvents } from './utils/events.js';

const KEY = 'chromaLabOnboarding';
const TIP_KEY = 'chromaLabTipDismissed';

export function setupOnboarding(onStartCallback, { skipAutoStart = false } = {}) {
    const overlay = document.getElementById('onboarding');
    const startBtn = document.getElementById('btn-start');
    const tipClose = document.getElementById('tip-close');
    const helpBtn = document.getElementById('btn-help');
    const floatingTip = document.getElementById('floating-tip');

    // Migrate from old key name
    const OLD_KEY = 'lightStudioOnboardingUPCA';
    if (typeof localStorage !== 'undefined' && localStorage.getItem(OLD_KEY)) {
        localStorage.setItem(KEY, localStorage.getItem(OLD_KEY));
        localStorage.removeItem(OLD_KEY);
    }

    const hasSeenOnboarding = typeof localStorage !== 'undefined'
        ? localStorage.getItem(KEY)
        : null;

    const showTip = () => {
        floatingTip?.classList.remove('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(TIP_KEY);
        }
    };

    const hideTip = () => {
        floatingTip?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TIP_KEY, 'true');
        }
    };

    const TOUR_STEPS = [
        { selector: '#lesson-mission', title: { es: 'Tu Misión', en: 'Your Mission' }, text: { es: 'Aquí verás el objetivo y la tarea específica de cada lección.', en: 'Here you will see the objective and specific task for each lesson.' } },
        { selector: '#controls-panel', title: { es: 'Modifica la Iluminación', en: 'Modify Lighting' }, text: { es: 'Usa estos controles para alterar la luz y experimentar con las armonías cromáticas.', en: 'Use these controls to alter the light and experiment with color harmonies.' } },
        { selector: '#progress-bar', title: { es: 'Progreso', en: 'Progress' }, text: { es: 'A medida que completes las misiones, la barra avanzará. ¡Completa las 8 lecciones!', en: 'As you complete missions, the bar will advance. Complete all 8 lessons!' } }
    ];

    let currentStep = 0;
    let tourOverlay = null;
    let tourPopover = null;
    let currentHighlight = null;

    function startTour() {
        if (tourOverlay) return;
        currentStep = 0;
        
        tourOverlay = document.createElement('div');
        tourOverlay.className = 'tour-overlay';
        document.body.appendChild(tourOverlay);

        tourPopover = document.createElement('div');
        tourPopover.className = 'tour-popover';
        document.body.appendChild(tourPopover);

        // Force reflow
        tourOverlay.offsetHeight;
        tourOverlay.classList.add('visible');

        showTourStep();
    }

    function showTourStep() {
        if (currentHighlight) {
            currentHighlight.classList.remove('tour-highlight');
        }

        if (currentStep >= TOUR_STEPS.length) {
            endTour();
            return;
        }

        const step = TOUR_STEPS[currentStep];
        const target = document.querySelector(step.selector);
        
        if (!target) {
            console.warn(`Tour target not found: ${step.selector}`);
            currentStep++;
            showTourStep();
            return;
        }

        currentHighlight = target;
        currentHighlight.classList.add('tour-highlight');

        // Check if we can get lang from localStorage or use 'es'
        const lang = localStorage.getItem('chromaLabLang') || 'es';

        tourPopover.innerHTML = `
            <h3>${step.title[lang] || step.title.es}</h3>
            <p>${step.text[lang] || step.text.es}</p>
            <div class="tour-actions">
                <span class="tour-step-counter">${currentStep + 1} / ${TOUR_STEPS.length}</span>
                <button class="tour-btn">${currentStep === TOUR_STEPS.length - 1 ? (lang === 'es' ? '¡Entendido!' : 'Got it!') : (lang === 'es' ? 'Siguiente' : 'Next')}</button>
            </div>
        `;

        const btn = tourPopover.querySelector('.tour-btn');
        btn.addEventListener('click', () => {
            currentStep++;
            showTourStep();
        });

        // Position popover
        const rect = target.getBoundingClientRect();
        
        // Default to placing it near the center of the screen if target is too large, or next to it
        let top = rect.bottom + 16;
        let left = rect.left;

        if (top + 150 > window.innerHeight) {
            top = rect.top - 150;
        }
        
        tourPopover.style.top = `${top}px`;
        tourPopover.style.left = `${Math.max(16, Math.min(left, window.innerWidth - 300))}px`;
        
        tourPopover.offsetHeight; // reflow
        tourPopover.classList.add('visible');
    }

    function endTour() {
        if (currentHighlight) {
            currentHighlight.classList.remove('tour-highlight');
            currentHighlight = null;
        }
        if (tourOverlay) {
            tourOverlay.classList.remove('visible');
            setTimeout(() => tourOverlay.remove(), 300);
            tourOverlay = null;
        }
        if (tourPopover) {
            tourPopover.classList.remove('visible');
            setTimeout(() => tourPopover.remove(), 300);
            tourPopover = null;
        }
    }

    function start() {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(KEY, 'true');
        }
        if (onStartCallback) onStartCallback();
        
        // Start interactive tour
        setTimeout(startTour, 300);
    }

    function skip() {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(KEY, 'skipped');
        }
        if (onStartCallback) onStartCallback();
    }

    function showOnboarding() {
        overlay?.classList.remove('hidden');
    }

    startBtn?.addEventListener('click', start);

    if (skipAutoStart) {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    } else if (hasSeenOnboarding) {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    } else {
        // First visit — wait for explicit user action, no auto-close
        // Allow skip via Escape key handled in UI.js
    }

    // Help button re-opens onboarding
    helpBtn?.addEventListener('click', () => {
        showOnboarding();
    });

    tipClose?.addEventListener('click', hideTip);

    if (typeof localStorage !== 'undefined' && localStorage.getItem(TIP_KEY)) {
        hideTip();
    }

    // Expose skip for UI escape handler
    return { skip, showOnboarding };
}
