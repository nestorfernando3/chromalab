import { hslToHex, hueName } from './utils/color.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CX = 100, CY = 100, R = 65;
const DEG = Math.PI / 180;

const el = (tag, attrs, text = null) => {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    return e;
};

const point = (hue, r) => ({
    x: CX + Math.cos((hue - 90) * DEG) * r,
    y: CY + Math.sin((hue - 90) * DEG) * r,
});

export function renderDiagram(preset, svg, lang = 'es') {
    if (!svg || !preset) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const hasHue = typeof preset.baseHue === 'number';

    if (!hasHue) {
        svg.appendChild(el('text', {
            x: CX, y: CY + 5, 'text-anchor': 'middle',
            fill: 'rgba(255,255,255,0.5)', 'font-size': '12', 'font-weight': '600',
        }, 'Armonía Cromática'));
        return;
    }

    // Outer dashed wheel
    svg.appendChild(el('circle', {
        cx: CX, cy: CY, r: R, fill: 'none',
        stroke: 'rgba(255,255,255,0.12)', 'stroke-width': '28',
        'stroke-dasharray': '0.524 0.524',
    }));

    // Crosshairs
    svg.appendChild(el('line', { x1: CX - R - 5, y1: CY, x2: CX + R + 5, y2: CY, stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));
    svg.appendChild(el('line', { x1: CX, y1: CY - R - 5, x2: CX, y2: CY + R + 5, stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));

    // 12 hue dots around the wheel
    for (let i = 0; i < 12; i++) {
        const hue = i * 30;
        const p = point(hue, R - 8);
        svg.appendChild(el('circle', { cx: p.x, cy: p.y, r: '5', fill: hslToHex(hue, 0.7, 0.5), opacity: '0.6' }));
    }

    // Harmony markers
    const baseHue = preset.baseHue;
    const harmonyType = preset.harmonyType || 'complementary';
    const hues = [baseHue];
    if (harmonyType === 'complementary') hues.push((baseHue + 180) % 360);
    else if (harmonyType === 'analogous') hues.push((baseHue + 330) % 360, (baseHue + 30) % 360);
    else if (harmonyType === 'triadic') hues.push((baseHue + 120) % 360, (baseHue + 240) % 360);
    else if (harmonyType === 'split') hues.push((baseHue + 150) % 360, (baseHue + 210) % 360);
    else if (harmonyType === 'tetradic') hues.push((baseHue + 60) % 360, (baseHue + 180) % 360, (baseHue + 240) % 360);

    hues.forEach(h => {
        const hex = hslToHex(h, 0.75, 0.48);
        const p = point(h, R);
        const lp = point(h, R + 16);

        svg.appendChild(el('line', { x1: CX, y1: CY, x2: p.x, y2: p.y, stroke: hex, 'stroke-width': '2', 'stroke-opacity': '0.5' }));
        svg.appendChild(el('circle', { cx: p.x, cy: p.y, r: '10', fill: hex, stroke: '#fff', 'stroke-width': '2' }));
        svg.appendChild(el('text', {
            x: lp.x, y: lp.y + 4, 'text-anchor': 'middle',
            fill: 'rgba(255,255,255,0.7)', 'font-size': '9', 'font-weight': '600',
        }, hueName(h, lang)));
    });

    // Center harmony label
    svg.appendChild(el('text', {
        x: CX, y: CY + 4, 'text-anchor': 'middle',
        fill: 'rgba(255,255,255,0.4)', 'font-size': '9',
    }, harmonyType));
}
