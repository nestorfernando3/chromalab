import { Scene, Color, FogExp2, PerspectiveCamera, WebGLRenderer, PCFSoftShadowMap, ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPortraitModel, setBackdropColor } from './src/model.js';
import { createRoomEnvironment } from './src/room.js';
import { LightingSystem } from './src/lighting.js';
import { UI } from './src/ui.js';
import { appEvents } from './src/utils/events.js';
import { parseRuntimeConfig } from './src/runtime.js';
import { getHarmonyColors } from './src/utils/color.js';

const runtimeConfig = parseRuntimeConfig();
document.documentElement.lang = runtimeConfig.language;
document.body.classList.toggle('embed-mode', runtimeConfig.embed);

// Scene
const canvas = document.getElementById('scene-canvas');
const scene = new Scene();
scene.background = new Color(0x080810);
scene.fog = new FogExp2(0x080810, 0.04);

// Camera
const camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(2.5, 2.2, 5.5);
camera.lookAt(0, 1.65, 0);

// Renderer
const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = SRGBColorSpace;

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI / 2 + 0.15;
controls.minPolarAngle = Math.PI / 5;
controls.target.set(0, 1.65, 0);
controls.enablePan = false;
controls.update();

appEvents.on('resetControls', () => {
    controls.reset();
    requestRenderIfNotRequested();
});

// Create model and room environment
const model = createPortraitModel(scene);
const environment = createRoomEnvironment(scene);

// Lighting system with drag support
const lightingSystem = new LightingSystem(scene, camera, renderer);
lightingSystem.setAmbientLight(environment.ambientLight);

let renderRequested = false;

function render() {
    renderRequested = false;
    controls.update();
    lightingSystem.updateHelpers();
    renderer.render(scene, camera);
}

function requestRenderIfNotRequested() {
    if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
    }
}

// Export function to UI via EventBus instead of window
appEvents.on('requestRender', requestRenderIfNotRequested);

appEvents.on('forceRenderSync', () => {
    renderer.render(scene, camera);
});

controls.addEventListener('change', requestRenderIfNotRequested);

// Disable orbit controls when dragging lights
lightingSystem.onLightDragStart = (lightName) => {
    controls.enabled = false;
    requestRenderIfNotRequested();
};

lightingSystem.onLightDragEnd = (lightName) => {
    controls.enabled = true;
    requestRenderIfNotRequested();
};

// UI - pass lighting system for drag updates
const ui = new UI(lightingSystem, scene, renderer, environment, runtimeConfig);

appEvents.on('presetLoaded', (preset) => {
    if (preset.baseHue === undefined || !preset.harmonyType) return;

    const harmonies = getHarmonyColors(preset.baseHue, preset.harmonyType);
    if (harmonies.length === 0) return;

    setBackdropColor(scene, environment, harmonies[0]);

    const keyConfig = preset.lights?.find(l => l.type === 'key');
    const fillConfig = preset.lights?.find(l => l.type === 'fill');

    if (keyConfig) {
        lightingSystem.updateLightColor(keyConfig.id, harmonies[0]);
    }
    if (fillConfig && harmonies.length > 1) {
        lightingSystem.updateLightColor(fillConfig.id, harmonies[1]);
    }
});

// Connect drag events to UI updates
lightingSystem.onLightDrag = (lightName, position) => {
    ui.onLightDragged(lightName, position);
    requestRenderIfNotRequested();
};

// Wire up light system changes to trigger render
lightingSystem.onChange = requestRenderIfNotRequested;

// Resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;

        if (aspect < 1) {
            camera.fov = 40 + (1 - aspect) * 20;
        } else {
            camera.fov = 40;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        requestRenderIfNotRequested();
    }, 100);
});

// Note: exposure input is handled in UI class to avoid duplicate listeners

// PWA Service Worker Registration is handled centrally by vite-plugin-pwa auto injection.

requestRenderIfNotRequested();

// Debug exports (development only)
if (import.meta.env.DEV) {
    window.scene = scene;
    window.camera = camera;
    window.lightingSystem = lightingSystem;
    window.renderer = renderer;
}
