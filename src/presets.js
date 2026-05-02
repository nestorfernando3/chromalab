// Presets de teoría del color — 8 lecciones
// ChromaLab — Néstor De León
// Each preset contains both color theory metadata AND a lights array for the 3D scene

import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';
import { getHarmonyColors } from './utils/color.js';

const presets = {
    hsv: {
        id: 'hsv',
        name: { es: 'Matiz, Saturación y Valor', en: 'Hue, Saturation and Value' },
        category: { es: 'Fundamentos', en: 'Fundamentals' },
        difficulty: 1,
        baseHue: 200,
        harmonyType: 'complementary',
        saturation: 0.75,
        lightness: 0.45,
        goal: {
            es: 'Comprender que cualquier color se puede describir con tres valores: matiz (tono), saturación (intensidad) y valor (claridad).',
            en: 'Understand that any color can be described with three values: hue (tone), saturation (intensity), and value (lightness).'
        },
        whatToObserve: {
            es: ['El matiz cambia el tono del color (rojo, azul, verde)', 'La saturación controla si el color es vivo o grisáceo', 'El valor determina si el color es claro u oscuro'],
            en: ['Hue changes the color tone (red, blue, green)', 'Saturation controls whether the color is vivid or grayish', 'Value determines whether the color is light or dark']
        },
        practice: { task: { es: 'Ajusta los tres controles (matiz, saturación, valor) hasta crear un color que te recuerde al océano.', en: 'Adjust the three controls (hue, saturation, value) to create a color that reminds you of the ocean.' }, expectedOutput: { es: 'Un tono azul o cian con saturación media-alta y valor medio.', en: 'A blue or cyan tone with medium-high saturation and medium value.' } },
        lights: [
            { id: 'hsv-key', name: { es: 'Luz Principal', en: 'Key Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 3.0, color: '#e6f0ff', role: { es: 'Observa cómo cambia el color de la luz', en: 'Observe how the light color changes' } },
            { id: 'hsv-fill', name: { es: 'Luz de Relleno', en: 'Fill Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.6, color: '#f0e6ff', role: { es: 'Luz secundaria con otro matiz', en: 'Secondary light with another hue' } },
            { id: 'hsv-back', name: { es: 'Luz de Fondo', en: 'Background Light' }, type: 'back', position: { x: 0, y: 2.8, z: -2.5 }, intensity: 1.2, color: '#ffe6e6', role: { es: 'Tinte de fondo', en: 'Backdrop tint' } }
        ]
    },
    complementary: {
        id: 'complementary',
        name: { es: 'Complementarios', en: 'Complementary' },
        category: { es: 'Armonía básica', en: 'Basic harmony' },
        difficulty: 1,
        baseHue: 200,
        harmonyType: 'complementary',
        saturation: 0.7,
        lightness: 0.5,
        goal: {
            es: 'Descubrir que dos colores opuestos en la rueda generan el máximo contraste y vibración visual.',
            en: 'Discover that two opposite colors on the wheel create maximum contrast and visual vibration.'
        },
        whatToObserve: {
            es: ['Los colores opuestos se potencian mutuamente', 'El rojo frente al verde, el azul frente al naranja son ejemplos clásicos', 'Esta armonía genera energía y dinamismo'],
            en: ['Opposite colors enhance each other', 'Red vs green, blue vs orange are classic examples', 'This harmony generates energy and dynamism']
        },
        practice: { task: { es: 'Gira el matiz base hasta encontrar una pareja complementaria equilibrada. Cambia el fondo y las luces para ver el contraste.', en: 'Rotate the base hue until you find a balanced complementary pair. Change the backdrop and lights to see the contrast.' }, expectedOutput: { es: 'Una escena con dos colores opuestos que contrastan sin ser agresivos.', en: 'A scene with two opposite colors that contrast without being aggressive.' } },
        lights: [
            { id: 'comp-key', name: { es: 'Luz Principal', en: 'Key Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 3.2, color: '#e6f0ff', role: { es: 'Color primario de la armonía', en: 'Primary harmony color' } },
            { id: 'comp-fill', name: { es: 'Luz de Relleno', en: 'Fill Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.6, color: '#ffe6cc', role: { es: 'Color complementario', en: 'Complementary color' } },
            { id: 'comp-back', name: { es: 'Luz de Fondo', en: 'Background Light' }, type: 'back', position: { x: 0, y: 2.8, z: -2.5 }, intensity: 1.5, color: '#e6e6ff', role: { es: 'Fondo neutro para resaltar la armonía', en: 'Neutral backdrop to highlight harmony' } }
        ]
    },
    analogous: {
        id: 'analogous',
        name: { es: 'Análogos', en: 'Analogous' },
        category: { es: 'Armonía básica', en: 'Basic harmony' },
        difficulty: 1,
        baseHue: 160,
        harmonyType: 'analogous',
        saturation: 0.6,
        lightness: 0.5,
        goal: {
            es: 'Construir una paleta con colores vecinos en la rueda para lograr una sensación de calma y unidad.',
            en: 'Build a palette with neighboring colors on the wheel to achieve a sense of calm and unity.'
        },
        whatToObserve: {
            es: ['Los colores análogos comparten un matiz base común', 'Esta armonía es natural y relajante', 'Se usa mucho en paisajes y diseños orgánicos'],
            en: ['Analogous colors share a common base hue', 'This harmony is natural and relaxing', 'It is widely used in landscapes and organic designs']
        },
        practice: { task: { es: 'Elige un matiz base y observa cómo los tres colores análogos crean una atmósfera coherente en la escena.', en: 'Choose a base hue and observe how the three analogous colors create a coherent atmosphere in the scene.' }, expectedOutput: { es: 'Una escena con luces cuyos colores fluyen suavemente uno al otro.', en: 'A scene with lights whose colors flow smoothly into each other.' } },
        lights: [
            { id: 'ana-key', name: { es: 'Luz Principal', en: 'Key Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 2.8, color: '#e6fff0', role: { es: 'Color análogo 1', en: 'Analogous color 1' } },
            { id: 'ana-fill', name: { es: 'Luz de Relleno', en: 'Fill Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.7, color: '#e6ffe6', role: { es: 'Color análogo 2', en: 'Analogous color 2' } },
            { id: 'ana-rim', name: { es: 'Luz de Borde', en: 'Rim Light' }, type: 'rim', position: { x: -2.0, y: 3.2, z: -1.5 }, intensity: 1.5, color: '#f0ffe6', role: { es: 'Color análogo 3', en: 'Analogous color 3' } }
        ]
    },
    triadic: {
        id: 'triadic',
        name: { es: 'Triádicos en carteles', en: 'Triadic in Posters' },
        category: { es: 'Aplicación cultural', en: 'Cultural application' },
        difficulty: 2,
        baseHue: 220,
        harmonyType: 'triadic',
        saturation: 0.75,
        lightness: 0.5,
        goal: {
            es: 'Reconocer cómo los carteles publicitarios y políticos usan armonías triádicas para captar la atención y equilibrar información.',
            en: 'Recognize how advertising and political posters use triadic harmonies to capture attention and balance information.'
        },
        whatToObserve: {
            es: ['Los tres colores equidistantes generan equilibrio visual', 'Se usa en carteles que necesitan destacar múltiples elementos', 'La clave es elegir un color dominante y dos de acento'],
            en: ['Three equidistant colors generate visual balance', 'Used in posters that need to highlight multiple elements', 'The key is to choose one dominant color and two accents']
        },
        practice: { task: { es: 'Asigna los tres colores triádicos a las luces de la escena: uno dominante (key), otro de acento (fill) y otro de contraste (rim).', en: 'Assign the three triadic colors to the scene lights: one dominant (key), one accent (fill), and one contrast (rim).' }, expectedOutput: { es: 'Una composición donde un color domina (~60%) y los otros dos aparecen en menor proporción (~20% cada uno).', en: 'A composition where one color dominates (~60%) and the other two appear in smaller proportion (~20% each).' } },
        lights: [
            { id: 'tri-key', name: { es: 'Luz Principal', en: 'Key Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 3.0, color: '#e6e6ff', role: { es: 'Color triádico 1 (dominante)', en: 'Triadic color 1 (dominant)' } },
            { id: 'tri-fill', name: { es: 'Luz de Relleno', en: 'Fill Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.6, color: '#ffe6e6', role: { es: 'Color triádico 2 (acento)', en: 'Triadic color 2 (accent)' } },
            { id: 'tri-rim', name: { es: 'Luz de Contraste', en: 'Contrast Light' }, type: 'rim', position: { x: -2.0, y: 3.2, z: -1.5 }, intensity: 1.8, color: '#e6ffe6', role: { es: 'Color triádico 3 (contraste)', en: 'Triadic color 3 (contrast)' } }
        ]
    },
    contrast: {
        id: 'contrast',
        name: { es: 'Contraste simultáneo', en: 'Simultaneous Contrast' },
        category: { es: 'Percepción visual', en: 'Visual perception' },
        difficulty: 2,
        baseHue: 0,
        harmonyType: 'complementary',
        saturation: 0.0,
        lightness: 0.5,
        goal: {
            es: 'Experimentar cómo un mismo color parece diferente según el fondo que lo rodea (efecto de Chevreul).',
            en: 'Experiment how the same color looks different depending on the surrounding background (Chevreul effect).'
        },
        whatToObserve: {
            es: ['Un gris medio parece más oscuro sobre fondo claro', 'El mismo gris parece más claro sobre fondo oscuro', 'Los colores vecinos "contaminan" la percepción del color central'],
            en: ['A medium gray looks darker on a light background', 'The same gray looks lighter on a dark background', 'Neighboring colors "contaminate" the perception of the central color']
        },
        practice: { task: { es: 'Cambia el fondo entre claro y oscuro y observa cómo la percepción del rostro iluminado cambia drásticamente.', en: 'Toggle the backdrop between light and dark and observe how the perception of the lit face changes drastically.' }, expectedOutput: { es: 'Una observación escrita sobre cómo cambia la percepción del color según su entorno.', en: 'A written observation about how color perception changes according to its environment.' } },
        lights: [
            { id: 'con-key', name: { es: 'Luz Neutra', en: 'Neutral Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 3.0, color: '#ffffff', role: { es: 'Luz blanca neutra de referencia', en: 'Neutral white reference light' } },
            { id: 'con-fill', name: { es: 'Luz de Relleno', en: 'Fill Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.3, color: '#8888ff', role: { es: 'Luz fría para contraste', en: 'Cool light for contrast' } },
            { id: 'con-rim', name: { es: 'Luz de Borde', en: 'Rim Light' }, type: 'rim', position: { x: -2.0, y: 3.2, z: -1.5 }, intensity: 2.0, color: '#ffaa44', role: { es: 'Luz cálida para contraste', en: 'Warm light for contrast' } }
        ]
    },
    semiotics: {
        id: 'semiotics',
        name: { es: 'Color en cine y publicidad', en: 'Color in Film and Advertising' },
        category: { es: 'Semiótica', en: 'Semiotics' },
        difficulty: 2,
        baseHue: 0,
        harmonyType: 'analogous',
        saturation: 0.8,
        lightness: 0.45,
        goal: {
            es: 'Analizar cómo el color funciona como signo cultural: qué emociones y valores transmite en diferentes contextos mediáticos.',
            en: 'Analyze how color functions as a cultural sign: what emotions and values it transmits in different media contexts.'
        },
        whatToObserve: {
            es: ['El rojo puede significar pasión, peligro o revolución según el contexto', 'El azul transmite confianza, frialdad o melancolía', 'La publicidad usa estos códigos para influir en el espectador'],
            en: ['Red can mean passion, danger, or revolution depending on context', 'Blue transmits trust, coldness, or melancholy', 'Advertising uses these codes to influence the viewer']
        },
        practice: { task: { es: 'Elige una emoción y construye una iluminación coloreada que la comunique. Justifica tu elección.', en: 'Choose an emotion and build a colored lighting that communicates it. Justify your choice.' }, expectedOutput: { es: 'Una escena iluminada con colores intencionales y una breve justificación semiótica.', en: 'A scene lit with intentional colors and a brief semiotic justification.' } },
        lights: [
            { id: 'sem-key', name: { es: 'Luz Emocional', en: 'Emotional Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 3.0, color: '#ffcccc', role: { es: 'Color emocional dominante', en: 'Dominant emotional color' } },
            { id: 'sem-fill', name: { es: 'Luz de Soporte', en: 'Support Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.8, color: '#ccddff', role: { es: 'Color de soporte narrativo', en: 'Narrative support color' } },
            { id: 'sem-rim', name: { es: 'Luz de Ambiente', en: 'Ambient Light' }, type: 'rim', position: { x: -2.0, y: 3.2, z: -1.5 }, intensity: 1.5, color: '#ffeecc', role: { es: 'Color ambiental', en: 'Ambient color' } }
        ]
    },
    temperature: {
        id: 'temperature',
        name: { es: 'Temperatura y atmósfera', en: 'Temperature and Atmosphere' },
        category: { es: 'Emocional', en: 'Emotional' },
        difficulty: 2,
        baseHue: 30,
        harmonyType: 'analogous',
        saturation: 0.65,
        lightness: 0.5,
        goal: {
            es: 'Distinguir entre colores cálidos (que avanzan, activan) y fríos (que retroceden, calman), y aplicarlos para crear atmósferas.',
            en: 'Distinguish between warm colors (advancing, activating) and cool colors (receding, calming), and apply them to create atmospheres.'
        },
        whatToObserve: {
            es: ['Los cálidos (rojo, naranja, amarillo) parecen acercarse al espectador', 'Los fríos (azul, verde, violeta) parecen alejarse', 'La temperatura afecta la sensación de espacio en la escena'],
            en: ['Warm colors (red, orange, yellow) seem to approach the viewer', 'Cool colors (blue, green, violet) seem to recede', 'Temperature affects the sense of space in the scene']
        },
        practice: { task: { es: 'Cambia el color de las luces entre cálido y frío. Toma capturas de ambas versiones y compara qué emoción transmite cada una.', en: 'Toggle the light colors between warm and cool. Take screenshots of both versions and compare what emotion each transmits.' }, expectedOutput: { es: 'Dos capturas con iluminaciones opuestas explicando la emoción de cada una.', en: 'Two screenshots with opposite lighting explaining the emotion of each.' } },
        lights: [
            { id: 'temp-key', name: { es: 'Luz Cálida', en: 'Warm Light' }, type: 'key', position: { x: 2.5, y: 3.2, z: 2.0 }, intensity: 2.8, color: '#ffd4a0', role: { es: 'Luz cálida que avanza', en: 'Warm advancing light' } },
            { id: 'temp-fill', name: { es: 'Luz Fría', en: 'Cool Light' }, type: 'fill', position: { x: -2.0, y: 2.2, z: 2.5 }, intensity: 0.5, color: '#a0c8ff', role: { es: 'Luz fría que retrocede', en: 'Cool receding light' } },
            { id: 'temp-rim', name: { es: 'Luz de Contraste', en: 'Contrast Light' }, type: 'rim', position: { x: -2.0, y: 3.2, z: -1.5 }, intensity: 1.5, color: '#ffffff', role: { es: 'Luz neutra de separación', en: 'Neutral separation light' } }
        ]
    },
    sandbox: {
        id: 'sandbox',
        name: { es: 'Paleta Creativa', en: 'Creative Palette' },
        category: { es: 'Sandbox', en: 'Sandbox' },
        difficulty: 3,
        isSandbox: true,
        baseHue: 180,
        harmonyType: 'complementary',
        saturation: 0.6,
        lightness: 0.5,
        goal: {
            es: 'Crear una iluminación libre que comunique una emoción o idea personal, experimentando con todos los controles disponibles.',
            en: 'Create a free lighting setup that communicates a personal emotion or idea, experimenting with all available controls.'
        },
        whatToObserve: {
            es: ['Elige una emoción, recuerdo o concepto abstracto como punto de partida', 'Experimenta con posiciones, colores e intensidades de las luces', 'Puedes agregar, eliminar y modificar cualquier luz'],
            en: ['Choose an emotion, memory, or abstract concept as a starting point', 'Experiment with light positions, colors, and intensities', 'You can add, remove, and modify any light']
        },
        practice: { task: { es: 'Construye un setup libre de luces coloreadas que represente tu estado de ánimo actual. Agrega luces de diferentes tipos y colores.', en: 'Build a free colored lighting setup that represents your current mood. Add lights of different types and colors.' }, expectedOutput: { es: 'Una escena iluminada con al menos 3 luces de colores y una breve justificación.', en: 'A scene lit with at least 3 colored lights and a brief justification.' } },
        lights: [
            { id: 'sb-ambient', name: { es: 'Luz Ambiente', en: 'Ambient Light' }, type: 'fill', position: { x: 0, y: 3.0, z: 2.0 }, intensity: 1.0, color: '#ffffff', role: { es: 'Luz base para comenzar. ¡Agrega más luces!', en: 'Base light to start with. Add more lights!' } }
        ]
    }
};

function localizeValue(value, lang) {
    const normalized = normalizeLanguage(lang);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[normalized] || value[DEFAULT_LANGUAGE] || value.en || value.es || value;
    }
    return value;
}

function localizeLight(light, lang) {
    return { ...light, name: localizeValue(light.name, lang), role: localizeValue(light.role, lang) };
}

export function localizePreset(preset, lang = DEFAULT_LANGUAGE) {
    const normalized = normalizeLanguage(lang);
    const observations = Array.isArray(preset.whatToObserve)
        ? preset.whatToObserve
        : (preset.whatToObserve?.[normalized] || preset.whatToObserve?.[DEFAULT_LANGUAGE] || preset.whatToObserve?.en || preset.whatToObserve?.es || []);
    return {
        ...preset,
        name: localizeValue(preset.name, normalized),
        category: localizeValue(preset.category, normalized),
        goal: localizeValue(preset.goal, normalized),
        whatToObserve: observations.map(item => localizeValue(item, normalized)),
        practice: { task: localizeValue(preset.practice?.task, normalized), expectedOutput: localizeValue(preset.practice?.expectedOutput, normalized) },
        lights: (preset.lights || []).map(light => localizeLight(light, normalized))
    };
}

export function getPresetNames() { return Object.keys(presets); }

export function getPreset(name, lang = null) {
    const preset = presets[name] || presets.hsv;
    return lang ? localizePreset(preset, lang) : preset;
}

export function getAllPresets(lang = null) {
    const values = Object.values(presets);
    return lang ? values.map(preset => localizePreset(preset, lang)) : values;
}

export function getRawPresets() { return presets; }
