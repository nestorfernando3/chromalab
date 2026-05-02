import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';

const COPY = {
    es: {
        page: {
            title: 'Light Studio 3D - UPCA',
            description: 'Aprende iluminación fotográfica de forma interactiva. Software educativo de la Corporación Universitaria Politécnico de la Costa.'
        },
        header: {
            subtitle: 'Iluminación Fotográfica',
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
            diagram: 'Vista Superior',
            lights: 'Luces en Escena',
            selectedLight: 'Luz Seleccionada',
            ambient: 'Ambiente',
            background: 'Fondo',
            custom: 'Personalizado',
            model: 'Modelo',
            controls: 'Controles',
            addLight: 'Agregar Luz'
        },
        practice: {
            task: 'Tarea',
            output: 'Qué entregar'
        },
        overview: {
            title: 'Sobre este laboratorio',
            description: 'Light Studio 3D es un laboratorio web 3D para aprender iluminación fotográfica mediante metas guiadas, observación comparativa y práctica virtual-a-real.',
            points: [
                'Explora setups clásicos antes de pasar al estudio físico.',
                'Usa objetivos breves y tareas concretas para enfocar la práctica.',
                'Compara la escena 3D con una réplica real para consolidar el aprendizaje.'
            ]
        },
        buttons: {
            prev: 'Anterior',
            next: 'Siguiente',
            start: 'Comenzar',
            reset: 'Resetear Posición',
            duplicate: 'Duplicar luz',
            remove: 'Eliminar luz'
        },
        tips: {
            drag: 'Arrastra para rotar la vista • Click en luz para moverla'
        },
        onboarding: {
            title: 'Light Studio 3D',
            subtitle: 'Corporación Universitaria Politécnico de la Costa',
            intro: 'Aprende iluminación fotográfica de forma interactiva. Visualiza en 3D cómo diferentes setups de luz afectan a un retrato.',
            hint: 'Usa ← → para navegar entre lecciones'
        },
        features: [
            { label: '8 Técnicas' },
            { label: 'Interactivo' },
            { label: 'Educativo' }
        ],
        loader: 'Preparando el estudio...',
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
            dragIndicator: 'Arrastra la luz en la escena 3D',
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
            duplicate: 'Duplicar luz'
        },
        footer: {
            by: 'Desarrollado por',
            for: 'Para uso libre dentro de la'
        },
        goLabDescription: 'Laboratorio web 3D para aprender iluminación fotográfica con metas guiadas, observación comparativa y práctica virtual-a-real.'
    },
    en: {
        page: {
            title: 'Light Studio 3D - UPCA',
            description: 'Interactive way to learn photographic lighting. Educational software from Corporacion Universitaria Politecnico de la Costa.'
        },
        header: {
            subtitle: 'Photographic Lighting',
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
            diagram: 'Top View',
            lights: 'Lights in Scene',
            selectedLight: 'Selected Light',
            ambient: 'Ambient',
            background: 'Background',
            custom: 'Custom',
            model: 'Model',
            controls: 'Controls',
            addLight: 'Add Light'
        },
        practice: {
            task: 'Task',
            output: 'What to Produce'
        },
        overview: {
            title: 'About this lab',
            description: 'Light Studio 3D is a browser-based 3D lab for learning photographic lighting through guided goals, comparative observation, and virtual-to-real practice.',
            points: [
                'Explore classic setups before moving into the physical studio.',
                'Use short goals and concrete tasks to focus student work.',
                'Compare the 3D scene with a real-world replica to reinforce learning.'
            ]
        },
        buttons: {
            prev: 'Previous',
            next: 'Next',
            start: 'Start',
            reset: 'Reset Position',
            duplicate: 'Duplicate light',
            remove: 'Remove light'
        },
        tips: {
            drag: 'Drag to rotate the view • Click a light to move it'
        },
        onboarding: {
            title: 'Light Studio 3D',
            subtitle: 'Corporacion Universitaria Politecnico de la Costa',
            intro: 'Learn photographic lighting interactively. Visualize in 3D how different light setups affect a portrait.',
            hint: 'Use ← → to move between lessons'
        },
        features: [
            { label: '8 Techniques' },
            { label: 'Interactive' },
            { label: 'Educational' }
        ],
        loader: 'Preparing the studio...',
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
            dragIndicator: 'Drag the light in the 3D scene',
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
            duplicate: 'Duplicate light'
        },
        footer: {
            by: 'Developed by',
            for: 'Free use within'
        },
        goLabDescription: 'Browser-based 3D lab for learning photographic lighting through guided goals, comparative observation, and virtual-to-real practice.'
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
