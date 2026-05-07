export class ScreenshotToast {
  constructor(getCopy) {
    this.getCopy = getCopy;
    this.el = document.getElementById('screenshot-toast');
    this.timer = null;
  }

  show({ filename, dataUrl } = {}) {
    if (!this.el) return;
    const copy = this.getCopy();
    this.el.innerHTML = `
      <img class="screenshot-toast-thumb" alt="" src="${dataUrl || ''}">
      <span class="screenshot-toast-text"><strong>${copy.saved || 'Screenshot saved'}</strong><small>${filename || ''}</small></span>
    `;
    this.el.classList.add('visible');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove('visible'), 2600);
  }
}
