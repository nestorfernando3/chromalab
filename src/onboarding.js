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

    function start() {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(KEY, 'true');
        }
        if (onStartCallback) onStartCallback();
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
