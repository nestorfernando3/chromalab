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

function buildRingSegments() {
  const segs = [];
  const innerR = R - 10;
  const outerR = R + 10;
  for (let i = 0; i < 36; i++) {
    const a1 = (i * 10 - 90) * DEG;
    const a2 = ((i + 1) * 10 - 90) * DEG;
    const hue = i * 10;
    const fill = hslToHex(hue, 0.7, 0.5);
    const x1 = CX + Math.cos(a1) * innerR;
    const y1 = CY + Math.sin(a1) * innerR;
    const x2 = CX + Math.cos(a2) * innerR;
    const y2 = CY + Math.sin(a2) * innerR;
    const x3 = CX + Math.cos(a2) * outerR;
    const y3 = CY + Math.sin(a2) * outerR;
    const x4 = CX + Math.cos(a1) * outerR;
    const y4 = CY + Math.sin(a1) * outerR;
    segs.push({ path: `M${x1},${y1} A${innerR},${innerR} 0 0,1 ${x2},${y2} L${x3},${y3} A${outerR},${outerR} 0 0,0 ${x4},${y4}Z`, fill, hue });
  }
  return segs;
}

function hueFromSVGPoint(svg, clientX, clientY) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return -1;
  const svgPt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  const dx = svgPt.x - CX;
  const dy = svgPt.y - CY;
  let angle = Math.atan2(dy, dx) / DEG + 90;
  if (angle < 0) angle += 360;
  return Math.round(angle) % 360;
}

function getResponsiveSizes(width) {
  if (width >= 180) return { fontSize: 9, markerR: 10, labelOff: 16, shortLabels: false };
  if (width >= 120) return { fontSize: 8, markerR: 7, labelOff: 13, shortLabels: true };
  return { fontSize: 7, markerR: 5, labelOff: 11, shortLabels: true };
}

function labelForHue(hue, lang, short) {
  const name = hueName(hue, lang);
  if (!short) return name;
  const shortMap = {
    es: { Rojo: 'Rjo', Naranja: 'Nja', Amarillo: 'Aml', 'Verde lima': 'V.L', Verde: 'Vrd', 'Verde mar': 'V.M', Cian: 'Cian', 'Azul cielo': 'A.C', Azul: 'Azl', Violeta: 'Vta', Magenta: 'Mgt', Rosa: 'Rsa' },
    en: { Red: 'Red', Orange: 'Org', Yellow: 'Yel', Lime: 'Lime', Green: 'Grn', 'Sea Green': 'S.G', Cyan: 'Cyan', 'Sky Blue': 'S.B', Blue: 'Blu', Violet: 'Vlt', Magenta: 'Mgt', Pink: 'Pnk' },
  };
  return (shortMap[lang] || shortMap.es)[name] || name.slice(0, 3);
}

export function renderDiagram(preset, svg, lang = 'es', opts = {}) {
  if (!svg || !preset) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  if (svg._controls) {
    svg._controls.destroy();
    svg._controls = null;
  }

  const hasHue = typeof preset.baseHue === 'number';
  const rect = svg.getBoundingClientRect();
  const r = getResponsiveSizes(rect.width);

  if (!hasHue) {
    svg.appendChild(el('text', {
      x: CX, y: CY + 5, 'text-anchor': 'middle',
      fill: 'rgba(255,255,255,0.5)', 'font-size': '12', 'font-weight': '600',
    }, 'Armonía Cromática'));
    return;
  }

  // Crosshairs
  svg.appendChild(el('line', { x1: CX - R - 5, y1: CY, x2: CX + R + 5, y2: CY, stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));
  svg.appendChild(el('line', { x1: CX, y1: CY - R - 5, x2: CX, y2: CY + R + 5, stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));

  // Continuous hue ring (36 segments)
  const segments = buildRingSegments();
  const ringGroup = el('g', { class: 'hue-ring' });
  segments.forEach(seg => {
    ringGroup.appendChild(el('path', { d: seg.path, fill: seg.fill }));
  });
  // Hit area — transparent but captures pointer events
  const hitCircle = el('circle', {
    cx: CX, cy: CY, r: R + 14,
    fill: 'transparent', stroke: 'transparent',
    'stroke-width': '28', style: 'pointer-events: all; cursor: pointer;'
  });
  ringGroup.appendChild(hitCircle);
  svg.appendChild(ringGroup);

  // Dynamic elements — stored for fast updates
  const baseHue = preset.baseHue;
  const saturation = preset.saturation ?? 0.7;
  const value = preset.value ?? 0.5;
  const baseHex = hslToHex(baseHue, saturation, value);
  const bp = point(baseHue, R + 14);

  const indicatorInner = el('circle', { class: 'indicator-inner', cx: String(bp.x), cy: String(bp.y), r: String(Math.max(6, r.markerR - 2)), fill: baseHex, stroke: '#fff', 'stroke-width': '3' });
  const indicatorOuter = el('circle', { class: 'indicator-outer', cx: String(bp.x), cy: String(bp.y), r: String(Math.max(8, r.markerR)), fill: 'none', stroke: 'rgba(255,255,255,0.4)', 'stroke-width': '2' });
  svg.appendChild(indicatorInner);
  svg.appendChild(indicatorOuter);

  // Harmony markers
  const harmonyType = preset.harmonyType || 'complementary';
  const hues = [baseHue];
  if (harmonyType === 'complementary') hues.push((baseHue + 180) % 360);
  else if (harmonyType === 'analogous') hues.push((baseHue + 330) % 360, (baseHue + 30) % 360);
  else if (harmonyType === 'triadic') hues.push((baseHue + 120) % 360, (baseHue + 240) % 360);
  else if (harmonyType === 'split') hues.push((baseHue + 150) % 360, (baseHue + 210) % 360);
  else if (harmonyType === 'tetradic') hues.push((baseHue + 60) % 360, (baseHue + 180) % 360, (baseHue + 240) % 360);

  const harmonyLines = [];
  const harmonyCircles = [];
  const harmonyLabels = [];
  hues.forEach(h => {
    const hex = hslToHex(h, 0.75, 0.48);
    const p = point(h, R);
    const lp = point(h, R + r.labelOff);

    const line = el('line', { x1: String(CX), y1: String(CY), x2: String(p.x), y2: String(p.y), stroke: hex, 'stroke-width': '2', 'stroke-opacity': '0.5' });
    const circle = el('circle', { cx: String(p.x), cy: String(p.y), r: String(r.markerR), fill: hex, stroke: '#fff', 'stroke-width': '2' });
    const label = el('text', {
      x: String(lp.x), y: String(lp.y + 4), 'text-anchor': 'middle',
      fill: 'rgba(255,255,255,0.7)', 'font-size': String(r.fontSize), 'font-weight': '600',
    }, labelForHue(h, lang, r.shortLabels));

    svg.appendChild(line);
    svg.appendChild(circle);
    svg.appendChild(label);
    harmonyLines.push(line);
    harmonyCircles.push(circle);
    harmonyLabels.push(label);
  });

  // Center harmony label
  const centerLabel = el('text', {
    x: String(CX), y: String(CY + 4), 'text-anchor': 'middle',
    fill: 'rgba(255,255,255,0.4)', 'font-size': '9',
  }, harmonyType);
  svg.appendChild(centerLabel);

  // ── Pointer events (document-level for reliable drag) ──
  let dragging = false;
  let dragPointerId = null;

  const onDown = (e) => {
    dragging = true;
    dragPointerId = e.pointerId;
    document.addEventListener('pointermove', onDocMove);
    document.addEventListener('pointerup', onDocUp);
    document.addEventListener('pointercancel', onDocUp);

    const hue = hueFromSVGPoint(svg, e.clientX, e.clientY);
    if (hue >= 0 && opts.onHueChange) opts.onHueChange(hue);
  };

  const onDocMove = (e) => {
    if (!dragging) return;
    const hue = hueFromSVGPoint(svg, e.clientX, e.clientY);
    if (hue >= 0 && opts.onHueChange) opts.onHueChange(hue);
  };

  const onDocUp = () => {
    dragging = false;
    dragPointerId = null;
    document.removeEventListener('pointermove', onDocMove);
    document.removeEventListener('pointerup', onDocUp);
    document.removeEventListener('pointercancel', onDocUp);
    if (opts.onDragEnd) opts.onDragEnd();
  };

  hitCircle.addEventListener('pointerdown', onDown);

  const controls = {
    updateIndicator(hue, s, v) {
      const p = point(hue, R + 14);
      const hex = hslToHex(hue, s, v);
      indicatorInner.setAttribute('cx', String(p.x));
      indicatorInner.setAttribute('cy', String(p.y));
      indicatorInner.setAttribute('fill', hex);
      indicatorOuter.setAttribute('cx', String(p.x));
      indicatorOuter.setAttribute('cy', String(p.y));
    },
    destroy() {
      hitCircle.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onDocMove);
      document.removeEventListener('pointerup', onDocUp);
      document.removeEventListener('pointercancel', onDocUp);
    },
  };

  svg._controls = controls;
  return controls;
}
