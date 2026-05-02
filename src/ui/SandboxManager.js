/**
 * SandboxManager — handles free-mode sandbox toolbar:
 * adding, removing and listing lights in the sandbox preset.
 */
import { createElement, clearChildren } from '../utils/dom.js';
import { getAppCopy } from '../localization.js';

function localizeValue(value, lang) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[lang] || value.es || value.en || '';
    }
    return value || '';
}

export class SandboxManager {
    /**
     * @param {import('../lighting.js').LightingSystem} lightingSystem
     * @param {Function} getCurrentPreset - returns current preset object
     * @param {Function} getLanguage - returns current UI language
     * @param {Function} onLightsChanged - callback after add/remove
     */
    constructor(lightingSystem, getCurrentPreset, getLanguage, onLightsChanged) {
        this.lightingSystem = lightingSystem;
        this.getCurrentPreset = getCurrentPreset;
        this.getLanguage = getLanguage;
        this.onLightsChanged = onLightsChanged;
    }

    /** Wire up the "Agregar Luz" buttons for sandbox mode */
    setupSandboxButtons() {
        const preset = this.getCurrentPreset();
        if (!preset?.isSandbox) return;

        document.querySelectorAll('.sandbox-add-btn').forEach(btn => {
            // Clone to remove stale listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                this.addSandboxLight(newBtn.dataset.type);
            });
        });
    }

    addSandboxLight(lightType) {
        const newConfig = this.lightingSystem.addFreeLight(lightType);
        const preset = this.getCurrentPreset();
        preset.lights.push(newConfig);
        this.onLightsChanged(newConfig);
    }

    removeSandboxLight(lightId) {
        const removed = this.lightingSystem.removeLight(lightId);
        if (!removed) return;

        const preset = this.getCurrentPreset();
        preset.lights = preset.lights.filter(l => l.id !== lightId);
        this.onLightsChanged(null);
    }

    /**
     * Render the lights list inside the panel.
     * @param {Function} onSelectLight - called with a light config when clicked
     * @param {boolean} isSandbox
     */
    renderLightsOverview(onSelectLight, isSandbox) {
        const container = document.getElementById('lights-overview-list');
        if (!container) return;

        clearChildren(container);
        const preset = this.getCurrentPreset();
        const copy = getAppCopy(this.getLanguage());

        preset.lights.forEach(light => {
            const name = localizeValue(light.name, this.getLanguage());
            const role = localizeValue(light.role, this.getLanguage());

            const dotEl = createElement('div', {
                className: 'light-dot',
                style: { backgroundColor: light.color, color: light.color }
            });

            const nameEl = createElement('div', { className: 'light-item-name' }, [name]);
            const roleEl = createElement('div', { className: 'light-item-role' }, [role]);
            const infoEl = createElement('div', { className: 'light-item-info' }, [nameEl, roleEl]);

            const children = [dotEl, infoEl];

            if (isSandbox) {
                const deleteBtn = createElement('button', {
                    className: 'light-delete-btn',
                    title: copy.sandbox.removeTitle,
                    'aria-label': copy.sandbox.removeAria
                }, ['🗑️']);
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeSandboxLight(light.id);
                });
                children.push(deleteBtn);
            }

            const item = createElement('div', {
                className: 'light-item',
                'data-light-id': light.id
            }, children);

            item.addEventListener('click', (e) => {
                if (e.target.closest('.light-delete-btn')) return;
                onSelectLight(light);
            });

            container.appendChild(item);
        });
    }
}
