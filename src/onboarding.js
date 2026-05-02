import { appEvents } from './utils/events.js';

const ONBOARDING_AUTO_START_MS = 2500;

export function setupOnboarding(onStartCallback, { skipAutoStart = false } = {}) {
    const overlay = document.getElementById('onboarding');
    const startBtn = document.getElementById('btn-start');
    const tipClose = document.getElementById('tip-close');
    const helpBtn = document.getElementById('btn-help');
    const floatingTip = document.getElementById('floating-tip');

    // Migrate from old key name
    const OLD_KEY = 'lightStudioOnboardingUPCA';
    const KEY = 'chromaLabOnboarding';
    if (typeof localStorage !== 'undefined' && localStorage.getItem(OLD_KEY)) {
        localStorage.setItem(KEY, localStorage.getItem(OLD_KEY));
        localStorage.removeItem(OLD_KEY);
    }

    const hasSeenOnboarding = typeof localStorage !== 'undefined'
        ? localStorage.getItem(KEY)
        : null;
    const TIP_KEY = 'chromaLabTipDismissed';

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

    if (skipAutoStart) {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    } else if (hasSeenOnboarding) {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    } else {
        // First visit — auto-start after a short delay so the user sees the intro
        const autoStartTimer = setTimeout(start, ONBOARDING_AUTO_START_MS);
        startBtn?.addEventListener('click', () => {
            clearTimeout(autoStartTimer);
            start();
        });
        return; // skip the click handler below (startBtn already handled)
    }

    startBtn?.addEventListener('click', start);

    tipClose?.addEventListener('click', hideTip);
    helpBtn?.addEventListener('click', () => {
        showTip();
        appEvents.emit('tipRestored');
    });

    if (typeof localStorage !== 'undefined' && localStorage.getItem(TIP_KEY)) {
        hideTip();
    }
}
