import { clearChildren } from '../utils/dom.js';

export class ComparisonMode {
  constructor(getLang) {
    this.getLang = getLang;
    this.el = document.getElementById('comparison-layer');
  }

  render(preset) {
    if (!this.el) return;
    clearChildren(this.el);
    const cfg = preset?.comparison;
    if (!cfg?.enabled) {
      this.el.classList.add('hidden');
      return;
    }
    const lang = this.getLang();
    const title = cfg.title?.[lang] || cfg.title?.es || 'Referencia';
    const description = cfg.description?.[lang] || cfg.description?.es || '';
    this.el.innerHTML = `<div class="comparison-card"><strong>${title}</strong><span>${description}</span><button type="button" class="comparison-toggle">${lang === 'en' ? 'Split' : 'Dividir'}</button></div>`;
    this.el.classList.remove('hidden');
    this.el.querySelector('.comparison-toggle')?.addEventListener('click', () => {
      this.el.classList.toggle('split-active');
    });
  }
}
