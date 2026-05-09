// colorWheel.js — Interactive chromatic wheel with Canvas 2D
// Replaces diagram.js (SVG static wheel) with a continuous-gradient,
// touch-friendly, keyboard-accessible color wheel.

import { hsvToHex, hslToHex, hueName } from './utils/color.js';

const DEG = Math.PI / 180;

/**
 * ColorWheel — Interactive chromatic wheel rendered on Canvas 2D.
 *
 * Features:
 * - Continuous conic gradient (no discrete segments)
 * - Drag-to-change-hue with inertia
 * - Animated harmony markers
 * - Draggable hue indicator
 * - Responsive via ResizeObserver
 * - Accessible (keyboard + ARIA)
 */
export class ColorWheel {
    /**
     * @param {HTMLElement} container - The .diagram-container DOM element
     * @param {Object} opts
     * @param {Function} opts.onHueChange - Callback(hue: number)
     * @param {Function} opts.onDragEnd - Callback when drag ends
     * @param {string} opts.lang - 'es' | 'en'
     */
    constructor(container, opts = {}) {
        // --- Config ---
        this.container = container;
        this.onHueChange = opts.onHueChange || null;
        this.onDragEnd = opts.onDragEnd || null;
        this.lang = opts.lang || 'es';

        // --- State ---
        this._hue = 0;
        this._saturation = 0.7;
        this._value = 0.5;
        this._harmonyType = 'complementary';
        this._harmonyHues = [];
        this._velocity = 0;           // Angular velocity (inertia)
        this._isDragging = false;
        this._dragStartAngle = 0;
        this._dragStartHue = 0;
        this._lastPointerAngle = 0;
        this._lastPointerTime = 0;
        this._activePointerId = null;
        this._animFrameId = null;
        this._isDestroyed = false;
        this._needsRender = true;      // Flag for lazy render

        // --- Dimensions (calculated in _resize) ---
        this._width = 0;
        this._height = 0;
        this._cx = 0;
        this._cy = 0;
        this._outerR = 0;
        this._innerR = 0;
        this._markerR = 0;

        // --- DOM ---
        this._canvas = null;
        this._ctx = null;
        this._overlay = null;
        this._resizeObserver = null;
        this._resizeTimeout = null;
        this._expandHandler = null;

        // --- Ring cache (performance) ---
        this._ringCache = null;
        this._ringCacheKey = '';

        this._setupDOM();
        this._setupEvents();
        this._setupResizeObserver();
        this._resize();
        this._startRenderLoop();
    }

    // ══════════════════════════════════════════════
    // PUBLIC API (compatible with ui.js)
    // ══════════════════════════════════════════════

    /** Update state from preset */
    updateFromPreset(preset) {
        if (!preset || typeof preset.baseHue !== 'number') return;

        this._hue = preset.baseHue;
        this._saturation = preset.saturation ?? 0.7;
        this._value = preset.value ?? preset.lightness ?? 0.5;
        this._harmonyType = preset.harmonyType || 'complementary';
        this._harmonyHues = this._calculateHarmonyHues(this._hue, this._harmonyType);

        this._updateARIA();
        this._needsRender = true;
    }

    /** Update indicator (compat with diagram.js) */
    updateIndicator(hue, saturation, value) {
        this._hue = hue;
        this._saturation = saturation;
        this._value = value;
        this._harmonyHues = this._calculateHarmonyHues(hue, this._harmonyType);
        this._updateARIA();
        this._needsRender = true;
    }

    /** Change language */
    setLang(lang) {
        this.lang = lang;
        this._updateARIA();
        this._needsRender = true;
    }

    /** Clean up everything */
    destroy() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
        }

        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        if (this._canvas) {
            this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
            this._canvas.removeEventListener('keydown', this._boundKeyDown);
        }
        document.removeEventListener('pointermove', this._boundPointerMove);
        document.removeEventListener('pointerup', this._boundPointerUp);
        document.removeEventListener('pointercancel', this._boundPointerUp);

        // Remove expand handler
        if (this._expandHandler) {
            const trigger = this.container.closest('.collapsible-section')
                ?.querySelector('.collapsible-trigger');
            if (trigger) trigger.removeEventListener('click', this._expandHandler);
        }

        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }
        if (this._overlay && this._overlay.parentNode) {
            this._overlay.parentNode.removeChild(this._overlay);
        }

        // Show original SVG as fallback
        const svg = this.container?.querySelector('svg');
        if (svg) svg.style.display = '';

        this._canvas = null;
        this._ctx = null;
        this._overlay = null;
    }

    // ══════════════════════════════════════════════
    // PRIVATE — DOM Setup
    // ══════════════════════════════════════════════

    _setupDOM() {
        // Create canvas
        this._canvas = document.createElement('canvas');
        this._canvas.className = 'color-wheel-canvas';
        this._canvas.setAttribute('role', 'slider');
        this._canvas.setAttribute('aria-label', 'Rueda cromática interactiva');
        this._canvas.setAttribute('aria-valuemin', '0');
        this._canvas.setAttribute('aria-valuemax', '360');
        this._canvas.setAttribute('aria-valuenow', String(this._hue));
        this._canvas.setAttribute('tabindex', '0');
        this._canvas.style.cssText = `
            width: 100%;
            height: 100%;
            cursor: grab;
            touch-action: none;
            -webkit-touch-action: none;
            outline: none;
        `;
        this.container.appendChild(this._canvas);
        this._ctx = this._canvas.getContext('2d');

        // Create overlay for HTML labels (sharper than canvas text)
        this._overlay = document.createElement('div');
        this._overlay.className = 'color-wheel-overlay';
        this._overlay.setAttribute('aria-hidden', 'true');
        this._overlay.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        // Ensure container has position: relative
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        this.container.appendChild(this._overlay);

        // Handle collapsed section — resize when expanded
        const trigger = this.container.closest('.collapsible-section')
            ?.querySelector('.collapsible-trigger');
        if (trigger) {
            this._expandHandler = () => {
                setTimeout(() => this._resize(), 50);
            };
            trigger.addEventListener('click', this._expandHandler);
        }
    }

    // ══════════════════════════════════════════════
    // PRIVATE — Responsive
    // ══════════════════════════════════════════════

    _setupResizeObserver() {
        this._resizeObserver = new ResizeObserver(() => {
            if (this._resizeTimeout) cancelAnimationFrame(this._resizeTimeout);
            this._resizeTimeout = requestAnimationFrame(() => this._resize());
        });
        this._resizeObserver.observe(this.container);
    }

    _resize() {
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // Collapsed

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this._width = rect.width;
        this._height = rect.height;

        // Canvas dimensions with devicePixelRatio for sharpness
        this._canvas.width = Math.round(rect.width * dpr);
        this._canvas.height = Math.round(rect.height * dpr);
        this._ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset first
        this._ctx.scale(dpr, dpr);

        // Calculate geometry
        const minDim = Math.min(this._width, this._height);
        this._cx = this._width / 2;
        this._cy = this._height / 2;
        this._outerR = minDim * 0.42;
        this._innerR = minDim * 0.30;
        this._markerR = minDim * 0.035;

        // Invalidate ring cache
        this._ringCache = null;
        this._ringCacheKey = '';

        this._needsRender = true;
    }

    // ══════════════════════════════════════════════
    // PRIVATE — Rendering
    // ══════════════════════════════════════════════

    _render() {
        if (this._isDestroyed) return;
        if (this._width === 0 || this._height === 0) return;

        const ctx = this._ctx;

        // Clear canvas
        ctx.clearRect(0, 0, this._width, this._height);

        // Draw layers in order
        this._drawHueRing();
        this._drawHarmonyMarkers();
        this._drawBaseIndicator();
        this._drawCenterInfo();
    }

    _startRenderLoop() {
        const loop = () => {
            if (this._isDestroyed) return;

            // Only re-render when needed
            if (this._isDragging || Math.abs(this._velocity) > 0.001) {
                this._applyInertia();
                this._needsRender = true;
            }

            if (this._needsRender) {
                this._render();
                this._needsRender = false;
            }

            this._animFrameId = requestAnimationFrame(loop);
        };
        this._animFrameId = requestAnimationFrame(loop);
    }

    _drawHueRing() {
        const ctx = this._ctx;
        const { _cx: cx, _cy: cy, _outerR: outerR, _innerR: innerR } = this;

        // Use cached ring if available (ring is static — no rotation)
        const cacheKey = `${outerR}|${innerR}|${cx}|${cy}`;
        if (this._ringCache && this._ringCacheKey === cacheKey) {
            ctx.drawImage(this._ringCache, 0, 0, this._width, this._height);
            return;
        }

        // Draw 360 fine segments to simulate conic gradient
        const segments = 360;
        const segmentAngle = (Math.PI * 2) / segments;

        // Create offscreen canvas for caching
        const offscreen = document.createElement('canvas');
        offscreen.width = this._canvas.width;
        offscreen.height = this._canvas.height;
        const offCtx = offscreen.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        offCtx.setTransform(1, 0, 0, 1, 0, 0);
        offCtx.scale(dpr, dpr);

        for (let i = 0; i < segments; i++) {
            const angle = (i * segmentAngle) - Math.PI / 2;
            const nextAngle = angle + segmentAngle + 0.002; // +0.002 avoids gaps

            const hue = (i / segments) * 360;

            offCtx.beginPath();
            offCtx.arc(cx, cy, outerR, angle, nextAngle);
            offCtx.arc(cx, cy, innerR, nextAngle, angle, true);
            offCtx.closePath();

            offCtx.fillStyle = hslToHex(hue, 0.85, 0.5);
            offCtx.fill();
        }

        // Inner border
        offCtx.beginPath();
        offCtx.arc(cx, cy, innerR, 0, Math.PI * 2);
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        offCtx.lineWidth = 1;
        offCtx.stroke();

        // Outer border
        offCtx.beginPath();
        offCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        offCtx.lineWidth = 1;
        offCtx.stroke();

        // Cache it
        this._ringCache = offscreen;
        this._ringCacheKey = cacheKey;

        // Draw to main canvas
        ctx.drawImage(offscreen, 0, 0, this._width, this._height);
    }

    _drawHarmonyMarkers() {
        const ctx = this._ctx;
        const { _cx: cx, _cy: cy, _outerR: outerR, _innerR: innerR, _markerR: mr } = this;
        const midR = (outerR + innerR) / 2;

        if (!this._harmonyHues || this._harmonyHues.length === 0) return;

        this._harmonyHues.forEach((hue) => {
            const angle = (hue - 90) * DEG;
            const mx = cx + Math.cos(angle) * midR;
            const my = cy + Math.sin(angle) * midR;
            const hex = hslToHex(hue, 0.75, 0.48);

            // Line to center
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = hex;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Marker circle
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fillStyle = hex;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glow
            ctx.beginPath();
            ctx.arc(mx, my, mr + 3, 0, Math.PI * 2);
            ctx.strokeStyle = hex;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
    }

    _drawBaseIndicator() {
        const ctx = this._ctx;
        const { _cx: cx, _cy: cy, _outerR: outerR } = this;

        // Indicator sits on the outer edge
        const indicatorR = outerR + 8;
        const angle = (this._hue - 90) * DEG;
        const ix = cx + Math.cos(angle) * indicatorR;
        const iy = cy + Math.sin(angle) * indicatorR;
        const baseHex = hsvToHex(this._hue, this._saturation, this._value);

        // Outer glow
        ctx.beginPath();
        ctx.arc(ix, iy, 14, 0, Math.PI * 2);
        ctx.fillStyle = baseHex;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Main circle
        ctx.beginPath();
        ctx.arc(ix, iy, 10, 0, Math.PI * 2);
        ctx.fillStyle = baseHex;
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Outer ring
        ctx.beginPath();
        ctx.arc(ix, iy, 13, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated pulse while dragging
        if (this._isDragging) {
            const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.85;
            ctx.beginPath();
            ctx.arc(ix, iy, 16 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = baseHex;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    _drawCenterInfo() {
        const ctx = this._ctx;
        const { _cx: cx, _cy: cy, _innerR: innerR } = this;

        // Dark circular background
        ctx.beginPath();
        ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 8, 16, 0.85)';
        ctx.fill();

        // Harmony type label
        const harmonyLabel = this._harmonyType || '';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `600 ${Math.max(9, innerR * 0.14)}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(harmonyLabel, cx, cy - innerR * 0.12);

        // Hue value
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `700 ${Math.max(14, innerR * 0.25)}px -apple-system, sans-serif`;
        ctx.fillText(`${Math.round(this._hue)}°`, cx, cy + innerR * 0.08);

        // Color name
        const colorName = hueName(this._hue, this.lang);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = `500 ${Math.max(8, innerR * 0.12)}px -apple-system, sans-serif`;
        ctx.fillText(colorName, cx, cy + innerR * 0.30);
    }

    _calculateHarmonyHues(baseHue, type) {
        const h = ((baseHue % 360) + 360) % 360;
        switch (type) {
            case 'complementary': return [h, (h + 180) % 360];
            case 'analogous': return [(h + 330) % 360, h, (h + 30) % 360];
            case 'triadic': return [h, (h + 120) % 360, (h + 240) % 360];
            case 'split': return [h, (h + 150) % 360, (h + 210) % 360];
            case 'tetradic': return [h, (h + 60) % 360, (h + 180) % 360, (h + 240) % 360];
            default: return [h];
        }
    }

    _updateARIA() {
        if (!this._canvas) return;
        this._canvas.setAttribute('aria-valuenow', String(Math.round(this._hue)));
        this._canvas.setAttribute('aria-valuetext',
            `${hueName(this._hue, this.lang)} ${Math.round(this._hue)}°`);
    }

    // ══════════════════════════════════════════════
    // PRIVATE — Interaction
    // ══════════════════════════════════════════════

    _setupEvents() {
        this._boundPointerDown = (e) => this._onPointerDown(e);
        this._boundPointerMove = (e) => this._onPointerMove(e);
        this._boundPointerUp = (e) => this._onPointerUp(e);
        this._boundKeyDown = (e) => this._onKeyDown(e);

        this._canvas.addEventListener('pointerdown', this._boundPointerDown);
        this._canvas.addEventListener('keydown', this._boundKeyDown);

        // Prevent scroll while dragging on mobile
        this._canvas.addEventListener('touchstart', (e) => {
            if (this._isOnRing(e.touches[0].clientX, e.touches[0].clientY)) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    _getAngleFromPointer(clientX, clientY) {
        const rect = this._canvas.getBoundingClientRect();
        const x = clientX - rect.left - this._cx;
        const y = clientY - rect.top - this._cy;
        let angle = Math.atan2(y, x) / DEG + 90;
        if (angle < 0) angle += 360;
        return angle;
    }

    _isOnRing(clientX, clientY) {
        const rect = this._canvas.getBoundingClientRect();
        const x = clientX - rect.left - this._cx;
        const y = clientY - rect.top - this._cy;
        const dist = Math.sqrt(x * x + y * y);
        const margin = 15;
        return dist >= (this._innerR - margin) && dist <= (this._outerR + margin);
    }

    _onPointerDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        if (!this._isOnRing(e.clientX, e.clientY)) return;

        this._isDragging = true;
        this._velocity = 0;

        this._canvas.setPointerCapture(e.pointerId);
        this._activePointerId = e.pointerId;

        this._dragStartAngle = this._getAngleFromPointer(e.clientX, e.clientY);
        this._dragStartHue = this._hue;
        this._lastPointerAngle = this._dragStartAngle;
        this._lastPointerTime = performance.now();

        this._canvas.style.cursor = 'grabbing';

        document.addEventListener('pointermove', this._boundPointerMove);
        document.addEventListener('pointerup', this._boundPointerUp);
        document.addEventListener('pointercancel', this._boundPointerUp);

        // Haptic feedback on mobile
        if (navigator.vibrate) navigator.vibrate(10);

        this._needsRender = true;
    }

    _onPointerMove(e) {
        if (!this._isDragging || this._isDestroyed || !this._canvas) return;
        if (e.pointerId !== this._activePointerId) return;

        const currentAngle = this._getAngleFromPointer(e.clientX, e.clientY);

        // Calculate angular delta (handle 0°/360° wrap-around)
        let delta = currentAngle - this._lastPointerAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        let newHue = (this._hue + delta + 360) % 360;
        newHue = Math.round(newHue);

        if (newHue !== this._hue) {
            this._hue = newHue;
            this._harmonyHues = this._calculateHarmonyHues(newHue, this._harmonyType);

            if (this.onHueChange) this.onHueChange(newHue);

            this._canvas.setAttribute('aria-valuenow', String(newHue));
        }

        // Track velocity for inertia
        const now = performance.now();
        const dt = now - this._lastPointerTime;
        if (dt > 0) {
            const instantVelocity = delta / dt;
            this._velocity = this._velocity * 0.7 + instantVelocity * 0.3;
        }

        this._lastPointerAngle = currentAngle;
        this._lastPointerTime = now;

        this._needsRender = true;
    }

    _onPointerUp(e) {
        if (!this._isDragging || this._isDestroyed) return;

        this._isDragging = false;
        this._activePointerId = null;

        if (this._canvas) this._canvas.style.cursor = 'grab';

        document.removeEventListener('pointermove', this._boundPointerMove);
        document.removeEventListener('pointerup', this._boundPointerUp);
        document.removeEventListener('pointercancel', this._boundPointerUp);

        if (this.onDragEnd) this.onDragEnd();
    }

    _applyInertia() {
        if (this._isDragging || this._isDestroyed || !this._canvas) return;

        if (Math.abs(this._velocity) < 0.001) {
            this._velocity = 0;
            return;
        }

        const FRICTION = 0.92;
        this._velocity *= FRICTION;

        const delta = this._velocity * 16; // ~16ms per frame
        let newHue = (this._hue + delta + 360) % 360;
        newHue = Math.round(newHue);

        if (newHue !== this._hue) {
            this._hue = newHue;
            this._harmonyHues = this._calculateHarmonyHues(newHue, this._harmonyType);

            if (this.onHueChange) this.onHueChange(newHue);

            this._canvas.setAttribute('aria-valuenow', String(newHue));
        }
    }

    _onKeyDown(e) {
        let delta = 0;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                delta = e.shiftKey ? 10 : 1;
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                delta = e.shiftKey ? -10 : -1;
                break;
            case 'Home':
                this._hue = 0;
                delta = 0;
                break;
            case 'End':
                this._hue = 359;
                delta = 0;
                break;
            case 'PageUp':
                delta = 30;
                break;
            case 'PageDown':
                delta = -30;
                break;
            default:
                return;
        }

        e.preventDefault();

        const newHue = ((this._hue + delta) % 360 + 360) % 360;
        this._hue = newHue;
        this._harmonyHues = this._calculateHarmonyHues(newHue, this._harmonyType);
        this._updateARIA();

        if (this.onHueChange) this.onHueChange(newHue);

        this._needsRender = true;
    }
}

// ══════════════════════════════════════════════════
// Compatibility wrapper (drop-in for ui.js)
// ══════════════════════════════════════════════════
let _activeWheel = null;

export function renderDiagram(preset, svgOrContainer, lang = 'es', opts = {}) {
    // Find the parent container (.diagram-container)
    const container = svgOrContainer.closest
        ? svgOrContainer.closest('.diagram-container') || svgOrContainer.parentElement
        : svgOrContainer.parentElement;

    if (!container) return null;

    // Destroy previous instance
    if (_activeWheel) {
        _activeWheel.destroy();
        _activeWheel = null;
    }

    // Hide original SVG if present
    if (svgOrContainer.tagName === 'svg') {
        svgOrContainer.style.display = 'none';
    }

    // Create new wheel
    _activeWheel = new ColorWheel(container, {
        onHueChange: opts.onHueChange,
        onDragEnd: opts.onDragEnd,
        lang
    });
    // Load preset
    if (preset && typeof preset.baseHue === 'number') {
        _activeWheel.updateFromPreset(preset);
    }

    // Return interface compatible with diagram.js
    return {
        updateIndicator(hue, s, v) {
            if (_activeWheel) _activeWheel.updateIndicator(hue, s, v);
        },
        destroy() {
            if (_activeWheel) {
                _activeWheel.destroy();
                _activeWheel = null;
            }
        }
    };
}
