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

        try {
            // Force a synchronous render right before capturing
            appEvents.emit('forceRenderSync');

            const filename = `lighting-${this.getCurrentPresetId() || 'studio'}-${Date.now()}.png`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            appEvents.emit('screenshotTaken', { filename });
        } catch (error) {
            appEvents.emit('screenshotFailed', { error });
        }
    }
}
