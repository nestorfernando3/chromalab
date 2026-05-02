/**
 * ScreenshotExporter — handles PNG screenshot download.
 */
import { appEvents } from '../utils/events.js';
export class ScreenshotExporter {
    /**
     * @param {Function} getCurrentPresetId - Returns current preset id string
     */
    constructor(getCurrentPresetId) {
        this.getCurrentPresetId = getCurrentPresetId;
    }

    takeScreenshot() {
        const canvas = document.getElementById('scene-canvas');
        if (!canvas) return;

        // Force a synchronous render right before capturing
        appEvents.emit('forceRenderSync');

        const link = document.createElement('a');
        link.download = `lighting-${this.getCurrentPresetId() || 'studio'}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}
