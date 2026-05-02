import { Scene, Color, FogExp2, PerspectiveCamera, WebGLRenderer, PCFSoftShadowMap, ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoomScene, createEnvironment } from './src/model.js';
import { ColorSystem } from './src/colorSystem.js';
import { UI } from './src/ui.js';
import { appEvents } from './src/utils/events.js';
import { parseRuntimeConfig } from './src/runtime.js';

const runtimeConfig = parseRuntimeConfig();
document.documentElement.lang = runtimeConfig.language;
document.body.classList.toggle('embed-mode', runtimeConfig.embed);

// Scene
const canvas = document.getElementById('scene-canvas');
const scene = new Scene();
scene.background = new Color(0x2a2a3a);
scene.fog = new FogExp2(0x2a2a3a, 0.03);

// Camera
const camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(4, 3, 6);
camera.lookAt(0, 1.5, 0);

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
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = SRGBColorSpace;

// Orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI / 2 + 0.1;
controls.minPolarAngle = Math.PI / 6;
controls.target.set(0, 1.5, 0);
controls.enablePan = false;
controls.update();

appEvents.on('resetControls', () => {
    controls.reset();
    requestRenderIfNotRequested();
});

// Create room scene and environment
const roomGroup = createRoomScene(scene);
const environment = createEnvironment(scene);

// Color system
const colorSystem = new ColorSystem(scene, renderer);

let renderRequested = false;

function render() {
    renderRequested = false;
    controls.update();
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

// Wire up color system changes to trigger render
colorSystem.onChange = requestRenderIfNotRequested;

// UI
const ui = new UI(colorSystem, scene, renderer, environment, runtimeConfig);

// Resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;

        // Adjust FOV for portrait mobile screens
        if (aspect < 1) {
            camera.fov = 40 + (1 - aspect) * 20; // Increase FOV as it gets narrower
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
    window.colorSystem = colorSystem;
    window.renderer = renderer;
}
