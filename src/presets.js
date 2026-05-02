// Presets de teoría del color — 8 lecciones
// ChromaLab — Néstor De León

import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';

const presets = {
    hsv: {
        id: 'hsv',
        name: { es: 'Matiz, Saturación y Valor', en: 'Hue, Saturation and Value' },
        category: { es: 'Fundamentos', en: 'Fundamentals' },
        difficulty: 1,
        goal: {
            es: 'Comprender que cualquier color se puede describir con tres valores: matiz (tono), saturación (intensidad) y valor (claridad).',
            en: 'Understand that any color can be described with three values: hue (tone), saturation (intensity), and value (lightness).'
        },
        whatToObserve: {
            es: [
                'El matiz cambia el tono del color (rojo, azul, verde)',
                'La saturación controla si el color es vivo o grisáceo',
                'El valor determina si el color es claro u oscuro'
            ],
            en: [
                'Hue changes the color tone (red, blue, green)',
                'Saturation controls whether the color is vivid or grayish',
                'Value determines whether the color is light or dark'
            ]
        },
        practice: {
            task: {
                es: 'Ajusta los tres controles (matiz, saturación, valor) hasta crear un color que te recuerde al océano.',
                en: 'Adjust the three controls (hue, saturation, value) to create a color that reminds you of the ocean.'
            },
            expectedOutput: {
                es: 'Un tono azul o cian con saturación media-alta y valor medio.',
                en: 'A blue or cyan tone with medium-high saturation and medium value.'
            }
        },
        baseHue: 200,
        harmonyType: 'monochromatic',
        saturation: 0.75,
        lightness: 0.45
    },

    complementary: {
        id: 'complementary',
        name: { es: 'Complementarios', en: 'Complementary' },
        category: { es: 'Armonía básica', en: 'Basic harmony' },
        difficulty: 1,
        goal: {
            es: 'Descubrir que dos colores opuestos en la rueda generan el máximo contraste y vibración visual.',
            en: 'Discover that two opposite colors on the wheel create maximum contrast and visual vibration.'
        },
        whatToObserve: {
            es: [
                'Los colores opuestos se potencian mutuamente',
                'El rojo frente al verde, el azul frente al naranja son ejemplos clásicos',
                'Esta armonía genera energía y dinamismo'
            ],
            en: [
                'Opposite colors enhance each other',
                'Red vs green, blue vs orange are classic examples',
                'This harmony generates energy and dynamism'
            ]
        },
        practice: {
            task: {
                es: 'Gira el matiz base hasta encontrar una pareja complementaria que te parezca equilibrada. Aplica los colores a la pared principal y al sofá.',
                en: 'Rotate the base hue until you find a balanced complementary pair. Apply the colors to the main wall and the sofa.'
            },
            expectedOutput: {
                es: 'Una habitación con dos colores opuestos que se contrastan visualmente sin resultar agresivos.',
                en: 'A room with two opposite colors that contrast visually without being aggressive.'
            }
        },
        baseHue: 200,
        harmonyType: 'complementary',
        saturation: 0.7,
        lightness: 0.5
    },

    analogous: {
        id: 'analogous',
        name: { es: 'Análogos', en: 'Analogous' },
        category: { es: 'Armonía básica', en: 'Basic harmony' },
        difficulty: 1,
        goal: {
            es: 'Construir una paleta con colores vecinos en la rueda para lograr una sensación de calma y unidad.',
            en: 'Build a palette with neighboring colors on the wheel to achieve a sense of calm and unity.'
        },
        whatToObserve: {
            es: [
                'Los colores análogos comparten un matiz base común',
                'Esta armonía es natural y relajante',
                'Se usa mucho en paisajes y diseños orgánicos'
            ],
            en: [
                'Analogous colors share a common base hue',
                'This harmony is natural and relaxing',
                'It is widely used in landscapes and organic designs'
            ]
        },
        practice: {
            task: {
                es: 'Elige un matiz base y observa cómo los tres colores análogos crean una atmósfera coherente. Aplica cada color a un objeto diferente.',
                en: 'Choose a base hue and observe how the three analogous colors create a coherent atmosphere. Apply each color to a different object.'
            },
            expectedOutput: {
                es: 'Una escena con tres objetos cuyos colores fluyen suavemente uno al otro.',
                en: 'A scene with three objects whose colors flow smoothly into each other.'
            }
        },
        baseHue: 160,
        harmonyType: 'analogous',
        saturation: 0.6,
        lightness: 0.5
    },

    triadic: {
        id: 'triadic',
        name: { es: 'Triádicos en carteles', en: 'Triadic in Posters' },
        category: { es: 'Aplicación cultural', en: 'Cultural application' },
        difficulty: 2,
        goal: {
            es: 'Reconocer cómo los carteles publicitarios y políticos usan armonías triádicas para captar la atención y equilibrar información.',
            en: 'Recognize how advertising and political posters use triadic harmonies to capture attention and balance information.'
        },
        whatToObserve: {
            es: [
                'Los tres colores equidistantes generan equilibrio visual',
                'Se usa en carteles que necesitan destacar múltiples elementos',
                'La clave es elegir un color dominante y dos de acento'
            ],
            en: [
                'Three equidistant colors generate visual balance',
                'Used in posters that need to highlight multiple elements',
                'The key is to choose one dominant color and two accents'
            ]
        },
        practice: {
            task: {
                es: 'Imagina que diseñas un cartel para un evento cultural. Asigna un color dominante a la pared principal y los otros dos a elementos de acento (sofá y lámpara).',
                en: 'Imagine designing a poster for a cultural event. Assign a dominant color to the main wall and the other two to accent elements (sofa and lamp).'
            },
            expectedOutput: {
                es: 'Una composición donde un color domina (~60%) y los otros dos aparecen en menor proporción (~20% cada uno).',
                en: 'A composition where one color dominates (~60%) and the other two appear in smaller proportion (~20% each).'
            }
        },
        baseHue: 220,
        harmonyType: 'triadic',
        saturation: 0.75,
        lightness: 0.5
    },

    contrast: {
        id: 'contrast',
        name: { es: 'Contraste simultáneo', en: 'Simultaneous Contrast' },
        category: { es: 'Percepción visual', en: 'Visual perception' },
        difficulty: 2,
        goal: {
            es: 'Experimentar cómo un mismo color parece diferente según el fondo que lo rodea (efecto de Chevreul).',
            en: 'Experiment how the same color looks different depending on the surrounding background (Chevreul effect).'
        },
        whatToObserve: {
            es: [
                'Un gris medio parece más oscuro sobre fondo claro',
                'El mismo gris parece más claro sobre fondo oscuro',
                'Los colores vecinos "contaminan" la percepción del color central'
            ],
            en: [
                'A medium gray looks darker on a light background',
                'The same gray looks lighter on a dark background',
                'Neighboring colors "contaminate" the perception of the central color'
            ]
        },
        practice: {
            task: {
                es: 'Coloca el mismo color en dos objetos diferentes rodeados de fondos contrastantes. Compara si los objetos parecen del mismo color o no.',
                en: 'Place the same color on two different objects surrounded by contrasting backgrounds. Compare whether the objects look the same color or not.'
            },
            expectedOutput: {
                es: 'Una observación escrita sobre cómo cambia la percepción del color según su entorno.',
                en: 'A written observation about how color perception changes according to its environment.'
            }
        },
        baseHue: 0,
        harmonyType: 'complementary',
        saturation: 0.0,
        lightness: 0.5
    },

    semiotics: {
        id: 'semiotics',
        name: { es: 'Color en cine y publicidad', en: 'Color in Film and Advertising' },
        category: { es: 'Semiótica', en: 'Semiotics' },
        difficulty: 2,
        goal: {
            es: 'Analizar cómo el color funciona como signo cultural: qué emociones y valores transmite en diferentes contextos mediáticos.',
            en: 'Analyze how color functions as a cultural sign: what emotions and values it transmits in different media contexts.'
        },
        whatToObserve: {
            es: [
                'El rojo puede significar pasión, peligro o revolución según el contexto',
                'El azul transmite confianza, frialdad o melancolía',
                'La publicidad usa estos códigos para influir en el espectador'
            ],
            en: [
                'Red can mean passion, danger, or revolution depending on context',
                'Blue transmits trust, coldness, or melancholy',
                'Advertising uses these codes to influence the viewer'
            ]
        },
        practice: {
            task: {
                es: 'Elige una emoción (miedo, alegría, tristeza, poder) y construye una paleta que la comunique. Justifica tu elección con argumentos semioticos.',
                en: 'Choose an emotion (fear, joy, sadness, power) and build a palette that communicates it. Justify your choice with semiotic arguments.'
            },
            expectedOutput: {
                es: 'Una paleta de 2-3 colores con una breve justificación sobre qué significan en tu contexto elegido.',
                en: 'A palette of 2-3 colors with a brief justification of what they mean in your chosen context.'
            }
        },
        baseHue: 0,
        harmonyType: 'analogous',
        saturation: 0.8,
        lightness: 0.45
    },

    temperature: {
        id: 'temperature',
        name: { es: 'Temperatura y atmósfera', en: 'Temperature and Atmosphere' },
        category: { es: 'Emocional', en: 'Emotional' },
        difficulty: 2,
        goal: {
            es: 'Distinguir entre colores cálidos (que avanzan, activan) y fríos (que retroceden, calman), y aplicarlos para crear atmósferas.',
            en: 'Distinguish between warm colors (advancing, activating) and cool colors (receding, calming), and apply them to create atmospheres.'
        },
        whatToObserve: {
            es: [
                'Los cálidos (rojo, naranja, amarillo) parecen acercarse al espectador',
                'Los fríos (azul, verde, violeta) parecen alejarse',
                'La temperatura afecta la sensación de espacio en una habitación'
            ],
            en: [
                'Warm colors (red, orange, yellow) seem to approach the viewer',
                'Cool colors (blue, green, violet) seem to recede',
                'Temperature affects the sense of space in a room'
            ]
        },
        practice: {
            task: {
                es: 'Diseña dos versiones de la misma habitación: una acogedora (cálida) y otra amplia y serena (fría). Cambia solo el matiz base, manteniendo saturación y valor constantes.',
                en: 'Design two versions of the same room: one cozy (warm) and one spacious and serene (cool). Change only the base hue, keeping saturation and value constant.'
            },
            expectedOutput: {
                es: 'Dos capturas de pantalla con el mismo espacio pero atmósferas opuestas, acompañadas de una frase sobre qué emoción transmite cada una.',
                en: 'Two screenshots of the same space but with opposite atmospheres, accompanied by a sentence about what emotion each transmits.'
            }
        },
        baseHue: 30,
        harmonyType: 'analogous',
        saturation: 0.65,
        lightness: 0.5
    },

    sandbox: {
        id: 'sandbox',
        name: { es: 'Paleta Emocional', en: 'Emotional Palette' },
        category: { es: 'Sandbox', en: 'Sandbox' },
        difficulty: 3,
        goal: {
            es: 'Crear una paleta libre que comunique una emoción o idea personal, experimentando con todos los controles disponibles.',
            en: 'Create a free palette that communicates a personal emotion or idea, experimenting with all available controls.'
        },
        whatToObserve: {
            es: [
                'Elige una emoción, recuerdo o concepto abstracto como punto de partida',
                'Experimenta con matiz, saturación, valor y tipo de armonía',
                'Justifica por qué cada color pertenece a tu paleta'
            ],
            en: [
                'Choose an emotion, memory, or abstract concept as a starting point',
                'Experiment with hue, saturation, value, and harmony type',
                'Justify why each color belongs to your palette'
            ]
        },
        practice: {
            task: {
                es: 'Construye una paleta de 3-4 colores que represente tu estado de ánimo actual o un lugar que extrañes. Aplica los colores a los objetos de la habitación.',
                en: 'Build a palette of 3-4 colors that represents your current mood or a place you miss. Apply the colors to the room objects.'
            },
            expectedOutput: {
                es: 'Una imagen de la habitación coloreada más un texto breve (máximo 50 palabras) explicando tu elección.',
                en: 'An image of the colored room plus a short text (maximum 50 words) explaining your choice.'
            }
        },
        baseHue: 180,
        harmonyType: 'complementary',
        saturation: 0.6,
        lightness: 0.5
    }
};

function localizeValue(value, lang) {
    const normalized = normalizeLanguage(lang);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[normalized] || value[DEFAULT_LANGUAGE] || value.en || value.es || value;
    }
    return value;
}

export function localizePreset(preset, lang = DEFAULT_LANGUAGE) {
    const normalized = normalizeLanguage(lang);
    const observations = Array.isArray(preset.whatToObserve)
        ? preset.whatToObserve
        : (preset.whatToObserve?.[normalized]
            || preset.whatToObserve?.[DEFAULT_LANGUAGE]
            || preset.whatToObserve?.en
            || preset.whatToObserve?.es
            || []);

    return {
        ...preset,
        name: localizeValue(preset.name, normalized),
        category: localizeValue(preset.category, normalized),
        goal: localizeValue(preset.goal, normalized),
        whatToObserve: observations.map(item => localizeValue(item, normalized)),
        practice: {
            task: localizeValue(preset.practice?.task, normalized),
            expectedOutput: localizeValue(preset.practice?.expectedOutput, normalized)
        }
    };
}

export function getPresetNames() {
    return Object.keys(presets);
}

export function getPreset(name, lang = null) {
    const preset = presets[name] || presets.hsv;
    return lang ? localizePreset(preset, lang) : preset;
}

export function getAllPresets(lang = null) {
    const values = Object.values(presets);
    return lang ? values.map(preset => localizePreset(preset, lang)) : values;
}

export function getRawPresets() {
    return presets;
}
