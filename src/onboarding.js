export function setupOnboarding(onStartCallback, { skipAutoStart = false } = {}) {
    const overlay = document.getElementById('onboarding');
    const startBtn = document.getElementById('btn-start');
    const tipClose = document.getElementById('tip-close');

    const hasSeenOnboarding = typeof localStorage !== 'undefined'
        ? localStorage.getItem('lightStudioOnboardingUPCA')
        : null;

    if (skipAutoStart) {
        overlay?.classList.add('hidden');
    } else if (hasSeenOnboarding) {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    }

    startBtn?.addEventListener('click', () => {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('lightStudioOnboardingUPCA', 'true');
        }
        if (onStartCallback) onStartCallback();
    });

    tipClose?.addEventListener('click', () => {
        document.getElementById('floating-tip')?.classList.add('hidden');
    });
}
