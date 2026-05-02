/**
 * DOM utility helpers
 * Safe alternatives to innerHTML string interpolation.
 */

/**
 * Create a DOM element with optional attributes and children.
 * @param {string} tag - HTML tag name
 * @param {Object} [attrs] - key/value attributes (class, id, style, dataset.*, aria-*, etc.)
 * @param {Array<Node|string>} [children] - child nodes or text strings
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            el.className = value;
        } else if (key.startsWith('data-')) {
            const datasetKey = key
                .slice(5)
                .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            el.dataset[datasetKey] = value;
        } else if (key.startsWith('aria-')) {
            el.setAttribute(key, value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key in el) {
            el[key] = value;
        } else {
            el.setAttribute(key, value);
        }
    }

    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    }

    return el;
}

/**
 * Update a range slider value and its associated display element.
 * @param {string} sliderId - The slider element ID (e.g. 'ctrl-intensity')
 * @param {number} value - The new value
 * @param {number} [decimals=1] - Decimal places for the display text
 */
export function setSliderValue(sliderId, value, decimals = 1) {
    const slider = document.getElementById(sliderId);
    const displayId = sliderId.replace('ctrl', 'val');
    const display = document.getElementById(displayId);

    if (slider) slider.value = value;
    if (display) display.textContent = Number(value).toFixed(decimals);
}

/**
 * Bind an input event listener to a range slider.
 * @param {string} id - The slider element ID
 * @param {function(number): void} callback - Called with the parsed float value on input
 * @param {number} [decimals=1] - Decimal places for the auto-updated display element
 * @returns {HTMLElement|null} The slider element, or null if not found
 */
export function bindSlider(id, callback, decimals = 1) {
    const slider = document.getElementById(id);
    if (!slider) return null;

    const displayId = id.replace('ctrl', 'val');
    const display = document.getElementById(displayId);

    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (display) display.textContent = val.toFixed(decimals);
        callback(val);
    });

    return slider;
}

/**
 * Safely set textContent on an element by ID.
 * @param {string} id
 * @param {string} text
 */
export function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/**
 * Clear all children from a container element.
 * @param {HTMLElement} container
 */
export function clearChildren(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
