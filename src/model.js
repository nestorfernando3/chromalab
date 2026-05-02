import {
    Group, MeshStandardMaterial, Mesh, BoxGeometry, PlaneGeometry, Color,
    AmbientLight, DirectionalLight, FogExp2, CylinderGeometry, SphereGeometry
} from 'three';
import { appEvents } from './utils/events.js';

// ====== Scene object registry ======
export const SCENE_REGISTRY = [
    {
        id: 'wallMain',
        name: { es: 'Pared Principal', en: 'Main Wall' },
        type: 'wall',
        position: { x: 0, y: 2.5, z: -3 },
        size: { w: 6, h: 5, d: 0.2 }
    },
    {
        id: 'wallLeft',
        name: { es: 'Pared Lateral', en: 'Side Wall' },
        type: 'wall',
        position: { x: -3, y: 2.5, z: 0 },
        size: { w: 0.2, h: 5, d: 6 }
    },
    {
        id: 'floor',
        name: { es: 'Piso', en: 'Floor' },
        type: 'floor',
        position: { x: 0, y: 0, z: 0 },
        size: { w: 6, h: 0.1, d: 6 }
    },
    {
        id: 'sofa',
        name: { es: 'Sofá', en: 'Sofa' },
        type: 'furniture',
        position: { x: 0, y: 0.5, z: -1.5 },
        size: { w: 2.5, h: 1.0, d: 1.0 }
    },
    {
        id: 'table',
        name: { es: 'Mesa', en: 'Table' },
        type: 'furniture',
        position: { x: 1.2, y: 0.4, z: 0.5 },
        size: { w: 1.0, h: 0.8, d: 0.6 }
    },
    {
        id: 'lamp',
        name: { es: 'Lámpara', en: 'Lamp' },
        type: 'accent',
        position: { x: -1.5, y: 0.6, z: 0.8 },
        size: { w: 0.4, h: 1.2, d: 0.4 }
    },
    {
        id: 'picture',
        name: { es: 'Cuadro', en: 'Picture' },
        type: 'accent',
        position: { x: 0.5, y: 2.2, z: -2.85 },
        size: { w: 1.2, h: 0.8, d: 0.05 }
    }
];

let sceneObjects = new Map();
let environment = null;

/**
 * Create a simple room scene with colored objects
 * @param {THREE.Scene} scene
 * @returns {Group} the room group
 */
export function createRoomScene(scene) {
    const roomGroup = new Group();
    sceneObjects.clear();

    // Default material factory
    function makeMat(color = 0x888888) {
        return new MeshStandardMaterial({
            color,
            roughness: 0.7,
            metalness: 0.05
        });
    }

    // Create each object from registry
    for (const obj of SCENE_REGISTRY) {
        const geo = new BoxGeometry(obj.size.w, obj.size.h, obj.size.d);
        const mat = makeMat(0x888888);
        const mesh = new Mesh(geo, mat);
        mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = obj.id;
        mesh.userData = { ...obj };

        roomGroup.add(mesh);
        sceneObjects.set(obj.id, { mesh, material: mat, config: obj });
    }

    scene.add(roomGroup);
    return roomGroup;
}

/**
 * Get all scene objects
 * @returns {Map<string, {mesh: THREE.Mesh, material: THREE.MeshStandardMaterial, config: Object}>}
 */
export function getSceneObjects() {
    return sceneObjects;
}

/**
 * Apply color to a scene object
 * @param {string} objectId
 * @param {string|number} color hex string or integer
 */
export function setObjectColor(objectId, color) {
    const entry = sceneObjects.get(objectId);
    if (entry && entry.material) {
        entry.material.color.set(color);
        appEvents.emit('requestRender');
    }
}

/**
 * Apply a palette (array of colors) to multiple objects
 * @param {string[]} objectIds
 * @param {string[]} colors
 */
export function applyPalette(objectIds, colors) {
    objectIds.forEach((id, i) => {
        if (colors[i]) setObjectColor(id, colors[i]);
    });
}

/**
 * Reset all objects to default gray
 */
export function resetColors() {
    for (const entry of sceneObjects.values()) {
        if (entry.material) entry.material.color.set(0x888888);
    }
    appEvents.emit('requestRender');
}

/**
 * Create the 3D environment (backdrop, ground, lights)
 * @param {THREE.Scene} scene
 * @returns {{ground: THREE.Mesh, backdrop: THREE.Mesh, ambientLight: THREE.AmbientLight, directionalLight: THREE.DirectionalLight}}
 */
export function createEnvironment(scene) {
    const defaultColor = 0x2a2a3a;

    // Back wall
    const backGeo = new PlaneGeometry(12, 8);
    const backMat = new MeshStandardMaterial({ color: defaultColor, roughness: 0.9 });
    const backdrop = new Mesh(backGeo, backMat);
    backdrop.position.set(0, 3, -4);
    backdrop.receiveShadow = true;
    scene.add(backdrop);

    // Ground
    const groundGeo = new PlaneGeometry(12, 12);
    const groundMat = new MeshStandardMaterial({ color: defaultColor, roughness: 0.9 });
    const ground = new Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ambient light
    const ambientLight = new AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional "sun" light
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 6, 4);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    environment = { ground, backdrop, ambientLight, directionalLight };
    return environment;
}

// Background presets
export const BACKGROUND_PRESETS = [
    { name: { es: 'Negro', en: 'Black' }, color: '#080810' },
    { name: { es: 'Gris Oscuro', en: 'Dark Gray' }, color: '#2a2a3a' },
    { name: { es: 'Blanco', en: 'White' }, color: '#e0e0e0' },
    { name: { es: 'Crema', en: 'Cream' }, color: '#f5f0e0' },
    { name: { es: 'Azul Noche', en: 'Night Blue' }, color: '#1a2a4a' },
    { name: { es: 'Verde Bosque', en: 'Forest Green' }, color: '#1a3a2a' }
];

export function getBackgroundPresets(lang = null) {
    if (!lang) return BACKGROUND_PRESETS;
    return BACKGROUND_PRESETS.map(p => ({
        ...p,
        name: p.name[lang] || p.name.es
    }));
}

export function setBackdropColor(scene, env, colorHex) {
    const color = new Color(colorHex);
    scene.background = color;
    scene.fog = new FogExp2(color, 0.03);
    if (env?.backdrop) env.backdrop.material.color.set(color);
    if (env?.ground) env.ground.material.color.set(color);
    appEvents.emit('requestRender');
}

export function getBackgroundPresetsRaw() {
    return BACKGROUND_PRESETS;
}
