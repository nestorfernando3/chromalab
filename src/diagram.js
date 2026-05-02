import { hslToHex, hueName } from './utils/color.js';

/**
 * Render a color wheel diagram showing the current harmony
 * @param {Object} preset — the localized preset (with .colors, .baseHue, .harmonyType)
 * @param {SVGElement} svgElement
 * @param {string} lang 'es' | 'en'
 */
export function renderDiagram(preset, svgElement, lang = 'es') {
    if (!svgElement || !preset) return;

    while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const makeEl = (tag, attrs, textContent = null) => {
        const el = document.createElementNS(SVG_NS, tag);
        for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, val);
        if (textContent) el.textContent = textContent;
        return el;
    };

    const cx = 100, cy = 100, radius = 70;

    // Draw the outer wheel
    svgElement.appendChild(makeEl('circle', {
        cx, cy, r: radius,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.15)',
        'stroke-width': '30',
        'stroke-dasharray': '0.524 0.524'
    }));

    // Draw crosshairs
    svgElement.appendChild(makeEl('line', { x1: cx - radius - 5, y1: cy, x2: cx + radius + 5, y2: cy, stroke: 'rgba(255,255,255,0.1)', 'stroke-width': '1' }));
    svgElement.appendChild(makeEl('line', { x1: cx, y1: cy - radius - 5, x2: cx, y2: cy + radius + 5, stroke: 'rgba(255,255,255,0.1)', 'stroke-width': '1' }));

    // Draw 12 color segments around the wheel
    for (let i = 0; i < 12; i++) {
        const hue = i * 30;
        const hex = hslToHex(hue, 0.7, 0.5);
        const angle = (hue - 90) * (Math.PI / 180);
        const r2 = radius - 8;
        const x = cx + Math.cos(angle) * r2;
        const y = cy + Math.sin(angle) * r2;
        svgElement.appendChild(makeEl('circle', { cx: x, cy: y, r: '5', fill: hex, opacity: '0.6' }));
    }

    // Draw the harmony markers
    const baseHue = preset.baseHue || 0;
    const harmonyType = preset.harmonyType || 'complementary';
    const hues = [baseHue];

    if (harmonyType === 'complementary') hues.push((baseHue + 180) % 360);
    else if (harmonyType === 'analogous') hues.push((baseHue + 330) % 360, (baseHue + 30) % 360);
    else if (harmonyType === 'triadic') hues.push((baseHue + 120) % 360, (baseHue + 240) % 360);
    else if (harmonyType === 'split') hues.push((baseHue + 150) % 360, (baseHue + 210) % 360);
    else if (harmonyType === 'tetradic') hues.push((baseHue + 60) % 360, (baseHue + 180) % 360, (baseHue + 240) % 360);

    hues.forEach((h, i) => {
        const angle = (h - 90) * (Math.PI / 180);
        const hex = hslToHex(h, 0.75, 0.48);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        // Connecting line
        svgElement.appendChild(makeEl('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: hex, 'stroke-width': '2', 'stroke-opacity': '0.5' }));

        // Marker dot
        svgElement.appendChild(makeEl('circle', { cx: x, cy: y, r: '10', fill: hex, stroke: '#fff', 'stroke-width': '2' }));

        // Label
        const labelOffset = radius + 16;
        const lx = cx + Math.cos(angle) * labelOffset;
        const ly = cy + Math.sin(angle) * labelOffset;
        const name = hueName(h, lang);
        svgElement.appendChild(makeEl('text', {
            x: lx, y: ly + 4,
            'text-anchor': 'middle',
            fill: 'rgba(255,255,255,0.7)',
            'font-size': '9',
            'font-weight': '600'
        }, name));
    });

    // Center label
    svgElement.appendChild(makeEl('text', {
        x: cx, y: cy + 4,
        'text-anchor': 'middle',
        fill: 'rgba(255,255,255,0.4)',
        'font-size': '9'
    }, harmonyType));
}
