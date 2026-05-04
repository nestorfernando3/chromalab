// evidenceStore.js — Lightweight localStorage persistence for student evidence

const EVIDENCE_KEY = 'chromaLab.lessonEvidence.v1';

/**
 * EvidenceStore persists student responses, color state, and screenshot metadata
 * per lesson. It does NOT store base64 images (only metadata) to avoid bloating localStorage.
 */
export class EvidenceStore {
    constructor() {
        this._data = this._load();
    }

    // ── Lesson evidence ───────────────────────────────────────────────────────

    getLessonEvidence(lessonId) {
        return this._data.lessons[lessonId] || null;
    }

    saveResponse(lessonId, fields) {
        if (!this._data.lessons[lessonId]) {
            this._data.lessons[lessonId] = this._createEmptyLessonEvidence();
        }
        const lesson = this._data.lessons[lessonId];
        if (fields.observation !== undefined) lesson.response.observation = fields.observation;
        if (fields.justification !== undefined) lesson.response.justification = fields.justification;
        if (fields.emotion !== undefined) lesson.response.emotion = fields.emotion;
        lesson.response.updatedAt = new Date().toISOString();
        this._save();
        return lesson;
    }

    saveColorState(lessonId, colorState) {
        if (!this._data.lessons[lessonId]) {
            this._data.lessons[lessonId] = this._createEmptyLessonEvidence();
        }
        this._data.lessons[lessonId].colorState = { ...colorState };
        this._save();
    }

    registerScreenshot(lessonId, filename, role = 'evidence') {
        if (!this._data.lessons[lessonId]) {
            this._data.lessons[lessonId] = this._createEmptyLessonEvidence();
        }
        this._data.lessons[lessonId].screenshots.push({
            filename,
            createdAt: new Date().toISOString(),
            role
        });
        this._save();
    }

    saveCriteria(lessonId, completedCriteria) {
        if (!this._data.lessons[lessonId]) {
            this._data.lessons[lessonId] = this._createEmptyLessonEvidence();
        }
        this._data.lessons[lessonId].completedCriteria = [...completedCriteria];
        this._save();
    }

    getAllEvidence() {
        return JSON.parse(JSON.stringify(this._data));
    }

    exportToJSON() {
        return JSON.stringify(this._data, null, 2);
    }

    reset() {
        this._data = { version: 1, lessons: {} };
        this._save();
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _createEmptyLessonEvidence() {
        return {
            completedCriteria: [],
            response: {
                observation: '',
                justification: '',
                emotion: '',
                updatedAt: null
            },
            colorState: null,
            screenshots: []
        };
    }

    _save() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(EVIDENCE_KEY, JSON.stringify(this._data));
        } catch (e) {
            // If quota exceeded, log but don't crash
            console.warn('EvidenceStore: localStorage quota exceeded', e);
        }
    }

    _load() {
        if (typeof localStorage === 'undefined') return { version: 1, lessons: {} };
        try {
            const raw = localStorage.getItem(EVIDENCE_KEY);
            if (!raw) return { version: 1, lessons: {} };
            const data = JSON.parse(raw);
            if (data.version !== 1) return { version: 1, lessons: {} };
            return data;
        } catch {
            return { version: 1, lessons: {} };
        }
    }
}
