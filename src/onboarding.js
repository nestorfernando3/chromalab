export function setupOnboarding(onStartCallback, { skipAutoStart = false } = {}) {
    const overlay = document.getElementById('onboarding');
    const startBtn = document.getElementById('btn-start');
    const tipClose = document.getElementById('tip-close');

    const hasSeenOnboarding = typeof localStorage !== 'undefined'
        ? localStorage.getItem('lightStudioOnboardingUPCA')
        : null;

    function start() {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('lightStudioOnboardingUPCA', 'true');
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
        const autoStartTimer = setTimeout(start, 2500);
        startBtn?.addEventListener('click', () => {
            clearTimeout(autoStartTimer);
            start();
        });
        return; // skip the click handler below (startBtn already handled)
    }

    startBtn?.addEventListener('click', start);

    tipClose?.addEventListener('click', () => {
        document.getElementById('floating-tip')?.classList.add('hidden');
    });
}
