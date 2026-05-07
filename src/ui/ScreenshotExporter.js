import { appEvents } from '../utils/events.js';
export class ScreenshotExporter {
  constructor(getCurrentPresetId) {
    this.getCurrentPresetId = getCurrentPresetId;
  }

  takeScreenshot() {
    const canvas = document.getElementById('scene-canvas');
    if (!canvas) return;

    try {
      appEvents.emit('forceRenderSync');

      const filename = `lighting-${this.getCurrentPresetId() || 'studio'}-${Date.now()}.png`;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      appEvents.emit('screenshotTaken', { filename, dataUrl, lessonId: this.getCurrentPresetId?.() });
    } catch (error) {
      appEvents.emit('screenshotFailed', { error });
    }
  }
}
