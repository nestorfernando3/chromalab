import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';

const COPY = {
    es: {
        page: {
            title: 'ChromaLab',
            description: 'Aprende teoría del color de forma interactiva. Explora armonías cromáticas y experimenta con matiz, saturación y luminosidad.'
        },
        header: {
            subtitle: 'Teoría del Color',
            languageLabel: 'Idioma',
            helpTitle: 'Ayuda',
            helpAria: 'Mostrar ayuda',
            screenshotTitle: 'Captura de pantalla',
            screenshotAria: 'Tomar captura de pantalla'
        },
        sections: {
            goal: 'Tu Objetivo',
            observe: 'Qué Observar',
            practice: 'Práctica',
            diagram: 'Diagrama',
            lights: 'Colores en Escena',
            selectedLight: 'Armonía',
            harmony: 'Armonía',
            ambient: 'Ambiente',
            background: 'Fondo',
            custom: 'Personalizado',
            model: 'Modelo',
            controls: 'Controles'
        },
        practice: {
            task: 'Tarea',
            output: 'Qué entregar'
        },
        overview: {
            title: 'Sobre este laboratorio',
            description: 'ChromaLab es un laboratorio virtual para aprender teoría del color mediante exploración interactiva.',
            points: [
                'Explora armonías cromáticas antes de aplicarlas al diseño real.',
                'Usa objetivos breves y tareas concretas para enfocar la práctica.',
                'Experimenta con matiz, saturación y luminosidad para entender el color.'
            ]
        },
        buttons: {
            prev: 'Anterior',
            next: 'Siguiente',
            start: 'Comenzar',
            reset: 'Resetear Posición',
            duplicate: 'Duplicar',
            remove: 'Eliminar'
        },
        tips: {
            drag: 'Arrastra para rotar la vista • Usa los controles para explorar armonías'
        },
        onboarding: {
            title: 'ChromaLab',
            subtitle: 'Laboratorio Interactivo de Teoría del Color',
            intro: 'Aprende teoría del color de forma interactiva. Explora armonías cromáticas en una habitación 3D.',
            hint: 'Usa ← → para navegar entre lecciones'
        },
        features: [
            { label: '8 Lecciones' },
            { label: 'Interactivo' },
            { label: 'Educativo' }
        ],
        loader: 'Preparando el laboratorio...',
        sandbox: {
            addSpot: 'Spot',
            addPoint: 'Point',
            addDirectional: 'Directional',
            addRect: 'Softbox',
            addSpotTitle: 'Agregar una luz spot enfocada',
            addPointTitle: 'Agregar una luz puntual',
            addDirectionalTitle: 'Agregar una luz direccional',
            addRectTitle: 'Agregar un panel softbox',
            removeTitle: 'Eliminar luz',
            removeAria: 'Eliminar luz',
            dragHint: 'Arrastra en 3D'
        },
        controls: {
            dragIndicator: 'Ajusta matiz, saturación y luminosidad para cambiar los colores',
            exposure: 'Exposición',
            closeTip: 'Cerrar tip'
        },
        lightControls: {
            intensity: 'Intensidad',
            color: 'Color',
            posX: 'Pos X',
            posY: 'Altura Y',
            posZ: 'Pos Z',
            cone: 'Cono °',
            width: 'Ancho',
            height: 'Alto',
            reset: 'Resetear Posición',
            duplicate: 'Duplicar'
        },
        footer: {
            by: 'Desarrollado por',
            for: 'Para uso libre dentro de la'
        },
        goLabDescription: 'Laboratorio interactivo para aprender teoría del color mediante lecciones guiadas, exploración de armonías cromáticas y práctica visual.'
    },
    en: {
        page: {
            title: 'ChromaLab',
            description: 'Learn color theory interactively. Explore color harmonies and experiment with hue, saturation, and lightness.'
        },
        header: {
            subtitle: 'Color Theory',
            languageLabel: 'Language',
            helpTitle: 'Help',
            helpAria: 'Show help',
            screenshotTitle: 'Screenshot',
            screenshotAria: 'Take a screenshot'
        },
        sections: {
            goal: 'Your Goal',
            observe: 'What to Observe',
            practice: 'Practice',
            diagram: 'Diagram',
            lights: 'Colors in Scene',
            selectedLight: 'Harmony',
            harmony: 'Harmony',
            ambient: 'Ambient',
            background: 'Background',
            custom: 'Custom',
            model: 'Model',
            controls: 'Controls'
        },
        practice: {
            task: 'Task',
            output: 'What to Produce'
        },
        overview: {
            title: 'About this lab',
            description: 'ChromaLab is a virtual lab for learning color theory through interactive exploration.',
            points: [
                'Explore chromatic harmonies before applying them to real design.',
                'Use short goals and concrete tasks to focus your practice.',
                'Experiment with hue, saturation, and lightness to understand color.'
            ]
        },
        buttons: {
            prev: 'Previous',
            next: 'Next',
            start: 'Start',
            reset: 'Reset Position',
            duplicate: 'Duplicate',
            remove: 'Remove'
        },
        tips: {
            drag: 'Drag to rotate view • Use controls to explore harmonies'
        },
        onboarding: {
            title: 'ChromaLab',
            subtitle: 'Interactive Color Theory Lab',
            intro: 'Learn color theory interactively. Explore chromatic harmonies in a 3D room.',
            hint: 'Use ← → to move between lessons'
        },
        features: [
            { label: '8 Lessons' },
            { label: 'Interactive' },
            { label: 'Educational' }
        ],
        loader: 'Preparing the lab...',
        sandbox: {
            addSpot: 'Spot',
            addPoint: 'Point',
            addDirectional: 'Directional',
            addRect: 'Softbox',
            addSpotTitle: 'Add a focused spot light',
            addPointTitle: 'Add a point light',
            addDirectionalTitle: 'Add a directional light',
            addRectTitle: 'Add a softbox panel',
            removeTitle: 'Remove light',
            removeAria: 'Remove light',
            dragHint: 'Drag in 3D'
        },
        controls: {
            dragIndicator: 'Adjust hue, saturation and lightness to change colors',
            exposure: 'Exposure',
            closeTip: 'Close tip'
        },
        lightControls: {
            intensity: 'Intensity',
            color: 'Color',
            posX: 'Position X',
            posY: 'Height Y',
            posZ: 'Position Z',
            cone: 'Cone °',
            width: 'Width',
            height: 'Height',
            reset: 'Reset Position',
            duplicate: 'Duplicate'
        },
        footer: {
            by: 'Developed by',
            for: 'Free use within'
        },
        goLabDescription: 'Interactive lab for learning color theory through guided lessons, color harmony exploration, and visual practice.'
    }
};

const LIGHT_TYPE_LABELS = {
    es: {
        key: 'Principal',
        fill: 'Relleno',
        rim: 'Borde',
        back: 'Fondo',
        rect: 'Panel',
        spot: 'Spot',
        point: 'Point',
        directional: 'Direccional'
    },
    en: {
        key: 'Key',
        fill: 'Fill',
        rim: 'Rim',
        back: 'Back',
        rect: 'Panel',
        spot: 'Spot',
        point: 'Point',
        directional: 'Directional'
    }
};

const SANDBOX_TYPE_LABELS = {
    es: {
        spot: 'Spot',
        point: 'Point',
        directional: 'Directional',
        rect: 'Softbox'
    },
    en: {
        spot: 'Spot',
        point: 'Point',
        directional: 'Directional',
        rect: 'Softbox'
    }
};

function lookup(source, path) {
    return String(path || '')
        .split('.')
        .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), source);
}

export function getAppCopy(lang = DEFAULT_LANGUAGE) {
    return COPY[normalizeLanguage(lang)] || COPY[DEFAULT_LANGUAGE];
}

export function getLightTypeLabel(lang, type) {
    const copy = LIGHT_TYPE_LABELS[normalizeLanguage(lang)] || LIGHT_TYPE_LABELS[DEFAULT_LANGUAGE];
    return copy[type] || type;
}

export function getSandboxTypeLabel(lang, type) {
    const copy = SANDBOX_TYPE_LABELS[normalizeLanguage(lang)] || SANDBOX_TYPE_LABELS[DEFAULT_LANGUAGE];
    return copy[type] || type;
}

export function applyStaticTranslations(lang = DEFAULT_LANGUAGE) {
    const normalized = normalizeLanguage(lang);
    const copy = getAppCopy(normalized);

    if (typeof document === 'undefined') return copy;

    document.documentElement.lang = normalized;

    const title = document.querySelector('title');
    if (title) title.textContent = copy.page.title;

    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', copy.page.description);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const text = lookup(copy, el.dataset.i18n);
        if (Array.isArray(text)) {
            el.textContent = text.join(' ');
        } else if (typeof text === 'string') {
            el.textContent = text;
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const text = lookup(copy, el.dataset.i18nTitle);
        if (typeof text === 'string') el.title = text;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const text = lookup(copy, el.dataset.i18nAria);
        if (typeof text === 'string') el.setAttribute('aria-label', text);
    });

    return copy;
}

export function getGoLabDescription(lang = DEFAULT_LANGUAGE) {
    return getAppCopy(lang).goLabDescription;
}
