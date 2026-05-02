export function setupOnboarding(onStartCallback, { skipAutoStart = false } = {}) {
    const overlay = document.getElementById('onboarding');
    const startBtn = document.getElementById('btn-start');
    const tipClose = document.getElementById('tip-close');

    const hasSeenOnboarding = typeof localStorage !== 'undefined'
        ? localStorage.getItem('chromalabOnboarding')
        : null;

    if (skipAutoStart || !hasSeenOnboarding) {
        // Auto-hide after 1.5s for first visit
        setTimeout(() => {
            overlay?.classList.add('hidden');
            if (onStartCallback && !hasSeenOnboarding) {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('chromalabOnboarding', 'true');
                }
                onStartCallback();
            }
        }, 1500);
    } else {
        overlay?.classList.add('hidden');
        if (onStartCallback) onStartCallback();
    }

    startBtn?.addEventListener('click', () => {
        overlay?.classList.add('hidden');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('chromalabOnboarding', 'true');
        }
        if (onStartCallback) onStartCallback();
    });

    tipClose?.addEventListener('click', () => {
        document.getElementById('floating-tip')?.classList.add('hidden');
    });
}
