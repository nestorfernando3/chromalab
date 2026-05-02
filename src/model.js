import { Group, MeshStandardMaterial, Mesh, CylinderGeometry, SphereGeometry, Color, BackSide, CircleGeometry, AmbientLight, FogExp2, Vector2 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { appEvents } from './utils/events.js';
import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';

// ====== Model registry — add more GLB models here ======
export const MODEL_REGISTRY = [
    {
        id: 'head',
        name: { es: 'Rostro Humano', en: 'Human Face' },
        icon: '🧑',
        path: './models/head.glb',
        scale: 0.26,
        positionY: 1.6,
        skinColor: 0xd4a574,
        hideBase: false,
        preserveMaterial: false,
        description: { es: 'Modelo escaneo 3D de rostro humano', en: '3D scanned human face model' }
    },
    {
        id: 'marble_bust',
        name: { es: 'Busto Mármol', en: 'Marble Bust' },
        icon: '🏛️',
        path: './models/marble_bust_01/marble_bust_01_1k.gltf',
        scale: 4.0,
        positionY: 0.0,
        hideBase: true,
        preserveMaterial: true,
        description: { es: 'Busto clásico de mármol — Poly Haven CC0', en: 'Classic marble bust - Poly Haven CC0' }
    },
    {
        id: 'nefertiti',
        name: { es: 'Nefertiti', en: 'Nefertiti' },
        icon: '👑',
        path: './models/female_head.glb',
        scale: 0.07,
        positionY: 0.25,
        hideBase: true,
        preserveMaterial: true,
        materialBoost: true,
        description: { es: 'Busto de Nefertiti', en: 'Nefertiti bust' }
    },
    {
        id: 'croissant',
        name: { es: 'Croissant', en: 'Croissant' },
        icon: '🥐',
        path: './models/croissant/croissant_1k.gltf',
        scale: 12.0,
        positionY: 1.05,
        hideBase: false,
        preserveMaterial: true,
        description: { es: 'Croissant — iluminación de producto / Poly Haven CC0', en: 'Croissant - product lighting / Poly Haven CC0' }
    },
    {
        id: 'duck',
        name: { es: 'Pato de Goma', en: 'Rubber Duck' },
        icon: '🦆',
        path: './models/rubber_duck_toy/rubber_duck_toy_1k.gltf',
        scale: 4.5,
        positionY: 1.05,
        hideBase: false,
        preserveMaterial: true,
        description: { es: 'Pato de goma — iluminación de producto / Poly Haven CC0', en: 'Rubber duck - product lighting / Poly Haven CC0' }
    }
];

const matNormalScale = new Vector2(0.8, 0.8);

function localizeValue(value, lang) {
    const normalized = normalizeLanguage(lang);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[normalized] || value[DEFAULT_LANGUAGE] || value.en || value.es || value;
    }
    return value;
}

function localizeModelEntry(model, lang) {
    return {
        ...model,
        name: localizeValue(model.name, lang),
        description: localizeValue(model.description, lang)
    };
}

export function getModelRegistry(lang = null) {
    return lang ? MODEL_REGISTRY.map(model => localizeModelEntry(model, lang)) : MODEL_REGISTRY;
}


class ModelManager {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.modelGroup = new Group();
        this.currentHead = null;
        this.currentModelId = null;
        this.isLoading = false;
        this.baseDisk = null;
        this.bustCylinder = null;

        this.scene.add(this.modelGroup);
        this.createBase();
        this.loadModel('head');
    }

    createBase() {
        const baseMat = new MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.9,
            metalness: 0.1
        });
        this.baseDisk = new Mesh(
            new CylinderGeometry(0.6, 0.7, 0.25, 32),
            baseMat
        );
        this.baseDisk.position.y = 0.125;
        this.baseDisk.receiveShadow = true;
        this.modelGroup.add(this.baseDisk);

        const bustMat = new MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.7,
            metalness: 0.1
        });
        this.bustCylinder = new Mesh(
            new CylinderGeometry(0.35, 0.5, 0.8, 24),
            bustMat
        );
        this.bustCylinder.position.y = 0.65;
        this.bustCylinder.castShadow = true;
        this.bustCylinder.receiveShadow = true;
        this.modelGroup.add(this.bustCylinder);

        this.modelGroup.rotation.y = Math.PI / 16;
    }

    loadModel(modelId) {
        const config = MODEL_REGISTRY.find(m => m.id === modelId);
        if (!config || this.isLoading || modelId === this.currentModelId) return;

        this.isLoading = true;
        this.currentModelId = modelId;

        if (this.bustCylinder) this.bustCylinder.visible = !config.hideBase;
        if (this.baseDisk) this.baseDisk.visible = !config.hideBase;

        const loading = document.getElementById('loading');
        if (loading) loading.classList.remove('hidden');

        if (this.currentHead) {
            this.modelGroup.remove(this.currentHead);
            this.currentHead.traverse(child => {
                child.geometry?.dispose();
                if (child.material) {
                    (Array.isArray(child.material) ? child.material : [child.material])
                        .forEach(m => m.dispose());
                }
            });
            this.currentHead = null;
        }

        // Placeholder wireframe while loading
        const placeholder = new Mesh(
            new SphereGeometry(0.4, 16, 16),
            new MeshStandardMaterial({ color: 0x444455, wireframe: true })
        );
        placeholder.position.y = config.positionY;
        placeholder.name = 'placeholder';
        this.modelGroup.add(placeholder);

        this.loader.load(
            config.path,
            (gltf) => {
                const head = gltf.scene;

                const ph = this.modelGroup.getObjectByName('placeholder');
                if (ph) {
                    this.modelGroup.remove(ph);
                    if (ph.geometry) ph.geometry.dispose();
                    if (ph.material) ph.material.dispose();
                }

                head.scale.set(config.scale, config.scale, config.scale);
                head.position.set(0, config.positionY, 0);
                head.rotation.y = 0;

                head.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (!config.preserveMaterial) {
                            const orig = child.material;
                            child.material = new MeshStandardMaterial({
                                color: config.skinColor,
                                roughness: 0.5,
                                metalness: 0.0,
                                map: orig?.map || null,
                                normalMap: orig?.normalMap || null,
                                normalScale: matNormalScale
                            });
                        } else if (config.materialBoost) {
                            // Universal brightness boost — works on any material type
                            const mats = Array.isArray(child.material)
                                ? child.material : [child.material];
                            mats.forEach(mat => {
                                if (!mat) return;
                                // Force roughness down for more light reflection
                                if ('roughness' in mat) mat.roughness = 0.25;
                                // Add emissive if supported
                                if ('emissive' in mat) {
                                    mat.emissive = new Color(0x261808);
                                    mat.emissiveIntensity = 0.6;
                                }
                                // Boost all diffuse colors by lightening
                                if ('color' in mat && mat.color) {
                                    mat.color.multiplyScalar(1.4);
                                }
                                mat.needsUpdate = true;
                            });
                        }
                    }
                });

                this.modelGroup.add(head);
                this.currentHead = head;
                this.isLoading = false;

                if (loading) loading.classList.add('hidden');
                appEvents.emit('requestRender');
            },
            null,
            (error) => {
                console.error('Error loading model:', error);
                this.isLoading = false;
                const ph = this.modelGroup.getObjectByName('placeholder');
                if (ph) {
                    this.modelGroup.remove(ph);
                    if (ph.geometry) ph.geometry.dispose();
                    if (ph.material) ph.material.dispose();
                }
                if (loading) loading.classList.add('hidden');
            }
        );
    }

    getModelGroup() {
        return this.modelGroup;
    }
}


// Singleton
let modelManager = null;

export function createPortraitModel(scene) {
    modelManager = new ModelManager(scene);
    return modelManager.getModelGroup();
}

export function getModelManager() {
    return modelManager;
}

export function switchModel(modelId) {
    if (modelManager) modelManager.loadModel(modelId);
}

// kept for preset compatibility
export function switchModelForLighting() {
    return Promise.resolve();
}


export function createEnvironment(scene) {
    // Basic settings for gray backdrop
    const defaultColor = 0x737373; // Gris 18%
    const envRoughness = 0.98;

    // Smooth Photography Cyc Wall (curved backdrop)
    // We create a curved plane using CylinderGeometry (inside out)
    const cycGeo = new CylinderGeometry(15, 15, 20, 48, 1, true, Math.PI * 0.5, Math.PI);
    const cycMat = new MeshStandardMaterial({
        color: defaultColor,
        roughness: envRoughness,
        metalness: 0.05,
        side: BackSide // Render the inside of the cylinder
    });

    const backdrop = new Mesh(cycGeo, cycMat);
    // Position it so the back of the cylinder is behind the camera target
    // and the floor of the cylinder is almost at y=0, then we blend it with the ground
    backdrop.position.set(0, 5, 5);
    backdrop.receiveShadow = true;
    scene.add(backdrop);

    // Ground (seamless with cyc wall)
    const groundGeo = new CircleGeometry(15, 64);
    const groundMat = new MeshStandardMaterial({
        color: defaultColor,
        roughness: envRoughness,
        metalness: 0.05
    });
    const ground = new Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ambient light
    const ambientLight = new AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    return { ground, backdrop, ambientLight };
}

// Background color presets for color testing
export const BACKGROUND_PRESETS = [
    { name: { es: 'Negro', en: 'Black' }, color: '#080810' },
    { name: { es: 'Gris 18%', en: '18% Gray' }, color: '#737373' },
    { name: { es: 'Blanco', en: 'White' }, color: '#e0e0e0' },
    { name: { es: 'Azul', en: 'Blue' }, color: '#1a3a5c' },
    { name: { es: 'Verde', en: 'Green' }, color: '#1a4a2a' },
    { name: { es: 'Rojo', en: 'Red' }, color: '#5c1a1a' }
];

export function getBackgroundPresets(lang = null) {
    if (!lang) return BACKGROUND_PRESETS;
    return BACKGROUND_PRESETS.map(preset => ({
        ...preset,
        name: localizeValue(preset.name, lang)
    }));
}

// Change backdrop and scene background color
export function setBackdropColor(scene, environment, colorHex) {
    const color = new Color(colorHex);
    scene.background = color;
    scene.fog = new FogExp2(color, 0.04);
    if (environment.backdrop) {
        environment.backdrop.material.color.set(color);
    }
    if (environment.ground) {
        environment.ground.material.color.set(color);
    }
    appEvents.emit('requestRender');
}
