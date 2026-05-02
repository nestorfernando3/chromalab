export const SUPPORTED_LANGS = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';
export const LANG_STORAGE_KEY = 'chromaLab.language';

export function normalizeLanguage(value) {
    const lang = String(value || '').trim().toLowerCase();
    if (lang.startsWith('en')) return 'en';
    return 'es';
}

export function parseRuntimeConfig(search = typeof window !== 'undefined' ? window.location.search : '') {
    const params = new URLSearchParams(search);
    const storedLanguage = typeof localStorage !== 'undefined'
        ? localStorage.getItem(LANG_STORAGE_KEY)
        : null;

    const requestedLanguage = params.get('lang') || storedLanguage || DEFAULT_LANGUAGE;
    const embedValue = String(params.get('embed') || '').toLowerCase();

    return {
        language: normalizeLanguage(requestedLanguage),
        lessonId: params.get('lesson')?.trim() || null,
        embed: ['1', 'true', 'yes', 'on'].includes(embedValue)
    };
}

export function storeLanguage(lang) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LANG_STORAGE_KEY, normalizeLanguage(lang));
}
