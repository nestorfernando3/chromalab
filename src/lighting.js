import { SphereGeometry, RingGeometry, ConeGeometry, Plane, Vector3, Raycaster, Vector2, MathUtils, SpotLight, PointLight, RectAreaLight, Object3D, MeshBasicMaterial, Mesh, Group, DoubleSide, BufferGeometry, LineDashedMaterial, Line } from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

// Init RectAreaLight support
RectAreaLightUniformsLib.init();

const sharedGeometries = {
    sphere: new SphereGeometry(0.15, 16, 16),
    ring: new RingGeometry(0.22, 0.26, 32),
    arrow: new ConeGeometry(0.05, 0.12, 4),
    hitbox: new SphereGeometry(0.5, 12, 12) // Larger hitbox for easier touch selection
};

// Max drag constraints
const DRAG_CLAMP_XZ = 4;
const DRAG_CLAMP_Y_MIN = 0.5;
const DRAG_CLAMP_Y_MAX = 5.0;
const DRAG_MAX_DISTANCE = 5; // Max distance from center before ignoring drag
const DRAG_TIMEOUT_MS = 10000; // Auto-cancel drag after 10 seconds

function valueForLang(value, lang) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[lang] || value.es || value.en || '';
    }
    return value || '';
}

function makeBilingualLabel(esText, enText) {
    return { es: esText, en: enText };
}

export class LightingSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.lights = [];
        this.helpers = [];
        this.lightObjects = new Map();
        this.helperMap = new Map();
        this.ambientLight = null;
        this.showHelpers = true;

        // Drag state
        this.isDragging = false;
        this.draggedLight = null;
        this.dragPlane = new Plane();
        this.intersectionPoint = new Vector3();
        this.raycaster = new Raycaster();
        this.mouse = new Vector2();

        // Callbacks
        this.onLightDragStart = null;
        this.onLightDrag = null;
        this.onLightDragEnd = null;
        this.onChange = null;

        this.setupDragControls();
    }

    setupDragControls() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', () => this.onMouseUp());

        // Touch support
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', () => this.onMouseUp());
    }

    updateMouse(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    getHelpersUnderMouse() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const helperMeshes = this.helpers
            .filter(h => h.userData.type === 'helper' && h.visible)
            .flatMap(h => h.children);

        return this.raycaster.intersectObjects(helperMeshes, true);
    }

    onMouseDown(e) {
        this.updateMouse(e);
        const intersects = this.getHelpersUnderMouse();

        if (intersects.length > 0) {
            e.preventDefault();
            e.stopPropagation();

            // Find the light associated with this helper
            let helper = intersects[0].object;
            while (helper && !helper.userData.light) {
                helper = helper.parent;
            }

            if (helper && helper.userData.light) {
                this.startDrag(helper.userData.light);
            }
        }
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.updateMouse(touch);
            const intersects = this.getHelpersUnderMouse();

            if (intersects.length > 0) {
                e.preventDefault();

                let helper = intersects[0].object;
                while (helper && !helper.userData.light) {
                    helper = helper.parent;
                }

                if (helper && helper.userData.light) {
                    this.startDrag(helper.userData.light);
                }
            }
        }
    }

    startDrag(light) {
        this.isDragging = true;
        this.draggedLight = light;

        // Save original position for rollback if drag goes wrong
        this._dragOriginalPosition = light.position.clone();

        // Create a plane at the light's height facing the camera
        const cameraDirection = new Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        this.dragPlane.setFromNormalAndCoplanarPoint(
            new Vector3(0, 1, 0), // Horizontal plane
            light.position
        );

        // Add visual feedback
        document.body.classList.add('dragging-light');

        // Safety timeout — auto-cancel drag after 10 seconds
        this._dragTimeout = setTimeout(() => {
            if (this.isDragging) {
                console.warn('Drag timeout — auto-cancelling');
                this.onMouseUp();
            }
        }, DRAG_TIMEOUT_MS);

        if (this.onLightDragStart) {
            this.onLightDragStart(light.name);
        }
    }

    onMouseMove(e) {
        this.updateMouse(e);

        if (this.isDragging && this.draggedLight) {
            this.performDrag();
        } else {
            // Hover state
            const intersects = this.getHelpersUnderMouse();
            const canvas = this.renderer.domElement;

            if (intersects.length > 0) {
                canvas.classList.add('light-draggable');
            } else {
                canvas.classList.remove('light-draggable');
            }
        }
    }

    onTouchMove(e) {
        if (this.isDragging && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateMouse(touch);
            this.performDrag();
        }
    }

    performDrag() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersectionPoint)) {
            const ix = this.intersectionPoint.x;
            const iz = this.intersectionPoint.z;

            // Guard against NaN / Infinity from bad intersections
            if (!isFinite(ix) || !isFinite(iz)) return;

            // Ignore if intersection is too far from center (prevents fly-away)
            if (Math.sqrt(ix * ix + iz * iz) > DRAG_MAX_DISTANCE) return;

            // Apply position with tighter constraints
            const newX = MathUtils.clamp(ix, -DRAG_CLAMP_XZ, DRAG_CLAMP_XZ);
            const newZ = MathUtils.clamp(iz, -DRAG_CLAMP_XZ, DRAG_CLAMP_XZ);

            this.draggedLight.position.x = newX;
            this.draggedLight.position.z = newZ;

            this.updateHelpers();

            if (this.onLightDrag) {
                this.onLightDrag(this.draggedLight.name, {
                    x: newX,
                    y: this.draggedLight.position.y,
                    z: newZ
                });
            }
        }
    }

    onMouseUp() {
        if (this.isDragging) {
            // Clear safety timeout
            if (this._dragTimeout) {
                clearTimeout(this._dragTimeout);
                this._dragTimeout = null;
            }

            document.body.classList.remove('dragging-light');

            if (this.onLightDragEnd && this.draggedLight) {
                this.onLightDragEnd(this.draggedLight.name);
            }

            this.isDragging = false;
            this.draggedLight = null;
            this._dragOriginalPosition = null;
        }
    }

    // Check if we're dragging (to disable orbit controls)
    isDraggingLight() {
        return this.isDragging;
    }

    // Reset a light to its original preset position
    resetLightPosition(name) {
        const light = this.getLight(name);
        if (light) {
            // Use the deep-cloned original position (not the mutated config reference)
            const pos = light.userData.originalPosition || light.userData.config?.position;
            if (!pos) return;
            light.position.set(pos.x, pos.y, pos.z);
            this.updateHelpers();
            if (this.onLightDrag) {
                this.onLightDrag(name, { x: pos.x, y: pos.y, z: pos.z });
            }
        }
    }

    // Duplicate an existing light
    duplicateLight(name) {
        const light = this.lightObjects.get(name);
        if (!light) return null;
        this._freeLightCounter++;
        const pos = light.position;
        const sourceConfig = light.userData.config || {};
        const sourceName = light.userData.displayName || light.userData.config?.name || name;
        const config = {
            id: `${name}-copy-${this._freeLightCounter}`,
            name: makeBilingualLabel(
                `${valueForLang(sourceName, 'es')} Copia`,
                `${valueForLang(sourceName, 'en')} Copy`
            ),
            type: light.userData.type || 'fill',
            position: { x: pos.x + 0.5, y: pos.y, z: pos.z + 0.5 },
            intensity: light.intensity,
            color: `#${light.color.getHexString()}`,
            coneAngle: sourceConfig.coneAngle ?? (light.isSpotLight ? (light.angle * 180) / Math.PI : undefined),
            width: sourceConfig.width ?? (light.isRectAreaLight ? light.width : undefined),
            height: sourceConfig.height ?? (light.isRectAreaLight ? light.height : undefined),
            enabled: light.visible,
            role: makeBilingualLabel(
                `Copia de ${valueForLang(sourceName, 'es')}`,
                `Copy of ${valueForLang(sourceName, 'en')}`
            ),
            freeLight: true,
            freeLightType: light.userData.freeLightType || light.userData.type || 'point'
        };
        this.createLight(config);
        return config;
    }

    // Free illumination mode: create a new light of any type
    _freeLightCounter = 0;
    addFreeLight(lightType = 'spot') {
        this._freeLightCounter++;
        const typeLabels = {
            spot: makeBilingualLabel('Spot', 'Spot'),
            point: makeBilingualLabel('Point', 'Point'),
            directional: makeBilingualLabel('Directional', 'Directional'),
            rect: makeBilingualLabel('Softbox', 'Softbox')
        };
        const typeConfigs = {
            spot: { type: 'key', intensity: 2.5, color: '#ffffff', position: { x: 1.5, y: 3.0, z: 1.5 } },
            point: { type: 'fill', intensity: 2.0, color: '#ffeedd', position: { x: -1.5, y: 2.5, z: 1.0 } },
            directional: { type: 'rim', intensity: 2.0, color: '#e0e8ff', position: { x: 0, y: 3.5, z: -2.0 } },
            rect: { type: 'rect', intensity: 3.0, color: '#fff5e8', position: { x: 1.0, y: 2.5, z: 2.0 } }
        };
        const cfg = typeConfigs[lightType] || typeConfigs.spot;
        const label = typeLabels[lightType] || makeBilingualLabel('Light', 'Light');
        const name = makeBilingualLabel(
            `${label.es} ${this._freeLightCounter}`,
            `${label.en} ${this._freeLightCounter}`
        );

        const config = {
            id: `free-${lightType}-${this._freeLightCounter}`,
            name,
            type: cfg.type,
            position: { ...cfg.position },
            intensity: cfg.intensity,
            color: cfg.color,
            coneAngle: lightType === 'spot' ? 45 : undefined,
            width: lightType === 'rect' ? 2 : undefined,
            height: lightType === 'rect' ? 1.5 : undefined,
            role: makeBilingualLabel(
                `${label.es} libre`,
                `${label.en} light`
            ),
            freeLight: true,
            freeLightType: lightType
        };

        this.createLight(config);
        return config;
    }

    // Recursively dispose geometries and materials to avoid memory leaks
    disposeNode(node) {
        if (!node) return;
        const isSharedGeometry = Object.values(sharedGeometries).includes(node.geometry);
        if (node.geometry && !isSharedGeometry) {
            node.geometry.dispose();
        }
        if (node.material) {
            if (Array.isArray(node.material)) {
                node.material.forEach(m => m.dispose());
            } else {
                node.material.dispose();
            }
        }
        // Specific helpers like RectAreaLightHelper might have their own dispose
        if (typeof node.dispose === 'function' && !node.isMesh && !node.isLine && !node.isGroup) {
            node.dispose();
        }
        if (node.children) {
            node.children.forEach(child => this.disposeNode(child));
        }
    }

    // Remove a specific light by name
    removeLight(name) {
        const light = this.lightObjects.get(name);
        if (!light) return false;

        // Remove light from scene
        if (light.target) this.scene.remove(light.target);
        this.scene.remove(light);

        // Remove helpers
        const helperData = this.helperMap.get(name);
        if (helperData) {
            this.scene.remove(helperData.group);
            this.scene.remove(helperData.line);
            this.disposeNode(helperData.group);
            this.disposeNode(helperData.line);
            this.helpers = this.helpers.filter(h =>
                h !== helperData.group && h !== helperData.line
            );
            this.helperMap.delete(name);
        }

        this.lights = this.lights.filter(l => l !== light);
        this.lightObjects.delete(name);
        if (this.onChange) this.onChange();
        return true;
    }

    clearLights() {
        this.lights.forEach(light => {
            if (light.target) this.scene.remove(light.target);
            this.scene.remove(light);
            if (typeof light.dispose === 'function') light.dispose();
        });
        this.helpers.forEach(helper => {
            this.scene.remove(helper);
            this.disposeNode(helper);
        });
        this.lights = [];
        this.helpers = [];
        this.lightObjects.clear();
        this.helperMap.clear();
        if (this.onChange) this.onChange();
    }

    createLight(config) {
        const { type, name, position, intensity, color, enabled } = config;
        const key = config.id || (typeof name === 'string' ? name : valueForLang(name, 'es'));

        let light;

        switch (type) {
            case 'key':
                {
                    const coneAngleDeg = typeof config.coneAngle === 'number' ? config.coneAngle : 45;
                    light = new SpotLight(color, intensity, 0, (coneAngleDeg * Math.PI) / 180, 0.5, 1.5);
                }
                light.castShadow = true;
                const shadowSize = (typeof window !== 'undefined' && window.innerWidth < 768) ? 1024 : 2048;
                light.shadow.mapSize.width = shadowSize;
                light.shadow.mapSize.height = shadowSize;
                light.shadow.camera.near = 0.5;
                light.shadow.camera.far = 20;
                light.shadow.bias = -0.0001;
                light.shadow.radius = 4;
                break;

            case 'fill':
                light = new PointLight(color, intensity, 0, 1.8);
                light.castShadow = false;
                break;

            case 'rim':
            case 'back':
                light = new SpotLight(color, intensity, 0, Math.PI / 3, 0.3, 1.5);
                light.castShadow = false;
                break;

            case 'rect': {
                const rectWidth = typeof config.width === 'number' ? config.width : 2;
                const rectHeight = typeof config.height === 'number' ? config.height : 1.5;
                const rectLight = new RectAreaLight(color, intensity, rectWidth, rectHeight);
                light = rectLight;
                break;
            }

            default:
                light = new PointLight(color, intensity, 0, 2);
        }

        light.position.set(position.x, position.y, position.z);
        light.name = key;
        light.userData.type = type;
        light.userData.config = config;
        light.userData.key = key;
        light.userData.displayName = name;
        // Deep-clone the original position so reset always works,
        // even after sliders or drag mutate config.position
        light.userData.originalPosition = { x: position.x, y: position.y, z: position.z };
        light.userData.enabled = enabled !== false;
        light.visible = enabled !== false;

        if (light.target) {
            const target = new Object3D();
            target.position.set(0, 1.6, 0);
            this.scene.add(target);
            light.target = target;
        }

        this.scene.add(light);
        this.lights.push(light);
        this.lightObjects.set(key, light);

        this.createLightHelper(light, type, color);
        if (this.onChange) this.onChange();

        return light;
    }

    createLightHelper(light, type, color) {
        const helperGroup = new Group();

        // Main sphere (draggable)
        const sphereMat = new MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.95
        });
        const sphere = new Mesh(sharedGeometries.sphere, sphereMat);
        helperGroup.add(sphere);

        // Invisible larger Hitbox for easier touch selection
        const hitboxMat = new MeshBasicMaterial({ visible: false });
        const hitbox = new Mesh(sharedGeometries.hitbox, hitboxMat);
        helperGroup.add(hitbox);

        // Outer ring
        const ringMat = new MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5,
            side: DoubleSide
        });
        const ring = new Mesh(sharedGeometries.ring, ringMat);
        helperGroup.add(ring);

        // Drag indicator arrows
        const arrowsGroup = new Group();
        const arrowMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

        const directions = [
            { pos: [0.35, 0, 0], rot: [0, 0, -Math.PI / 2] },
            { pos: [-0.35, 0, 0], rot: [0, 0, Math.PI / 2] },
            { pos: [0, 0, 0.35], rot: [Math.PI / 2, 0, 0] },
            { pos: [0, 0, -0.35], rot: [-Math.PI / 2, 0, 0] }
        ];

        directions.forEach(d => {
            const arrow = new Mesh(sharedGeometries.arrow, arrowMat);
            arrow.position.set(...d.pos);
            arrow.rotation.set(...d.rot);
            arrowsGroup.add(arrow);
        });

        arrowsGroup.visible = false;
        helperGroup.add(arrowsGroup);
        helperGroup.userData.arrows = arrowsGroup;

        helperGroup.position.copy(light.position);
        helperGroup.userData.light = light;
        helperGroup.userData.type = 'helper';
        helperGroup.visible = this.showHelpers;

        // For RectAreaLight — attach the native area light helper
        if (light.isRectAreaLight) {
            const rectHelper = new RectAreaLightHelper(light);
            helperGroup.add(rectHelper);
        }

        // Connection line
        const points = [light.position.clone(), new Vector3(0, 1.6, 0)];
        const lineGeo = new BufferGeometry().setFromPoints(points);
        const lineMat = new LineDashedMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            dashSize: 0.2,
            gapSize: 0.1
        });
        const line = new Line(lineGeo, lineMat);
        line.computeLineDistances();
        line.userData.light = light;
        line.userData.type = 'line';
        line.visible = this.showHelpers;

        this.scene.add(helperGroup);
        this.scene.add(line);
        this.helpers.push(helperGroup, line);
        this.helperMap.set(light.name, { group: helperGroup, line });
        if (this.onChange) this.onChange();
    }

    updateHelpers() {
        this.helpers.forEach(helper => {
            if (helper.userData.light) {
                const light = helper.userData.light;

                if (helper.userData.type === 'helper') {
                    helper.position.copy(light.position);
                    helper.visible = this.showHelpers && light.visible;
                } else if (helper.userData.type === 'line') {
                    const pos = helper.geometry.attributes?.position;
                    if (pos) {
                        pos.setXYZ(0, light.position.x, light.position.y, light.position.z);
                        pos.needsUpdate = true;
                    } else {
                        // Fallback for test environments without full BufferGeometry mock
                        const points = [light.position.clone(), new Vector3(0, 1.6, 0)];
                        helper.geometry.setFromPoints(points);
                    }
                    if (helper.computeLineDistances) helper.computeLineDistances();
                    helper.visible = this.showHelpers && light.visible;
                }
            }
        });
        if (this.onChange) this.onChange();
    }

    // Highlight a specific light helper
    highlightLight(name, highlight = true) {
        const helperData = this.helperMap.get(name);
        if (helperData) {
            const arrows = helperData.group.userData.arrows;
            if (arrows) {
                arrows.visible = highlight;
            }
        }
    }

    toggleHelpers(show) {
        this.showHelpers = show;
        this.helpers.forEach(helper => {
            if (helper.userData.light) {
                helper.visible = show && helper.userData.light.visible;
            }
        });
        if (this.onChange) this.onChange();
    }

    loadPreset(preset) {
        this.clearLights();
        preset.lights.forEach(lightConfig => {
            this.createLight(lightConfig);
        });
        if (this.onChange) this.onChange();
    }

    getLight(name) {
        return this.lightObjects.get(name);
    }

    updateLightIntensity(name, intensity) {
        const light = this.getLight(name);
        if (light) {
            light.intensity = intensity;
            if (light.userData.config) {
                light.userData.config.intensity = intensity;
            }
            if (this.onChange) this.onChange();
        }
    }

    updateLightColor(name, color) {
        const light = this.getLight(name);
        if (light) {
            light.color.set(color);
            if (light.userData.config) {
                light.userData.config.color = color;
            }

            this.helpers.forEach(helper => {
                if (helper.userData.light === light) {
                    if (helper.userData.type === 'helper') {
                        helper.children.forEach(child => {
                            if (child.material && !child.userData.arrows) {
                                child.material.color.set(color);
                            }
                        });
                    } else if (helper.material) {
                        helper.material.color.set(color);
                    }
                }
            });
            if (this.onChange) this.onChange();
        }
    }

    updateLightPosition(name, axis, value) {
        const light = this.getLight(name);
        if (light) {
            light.position[axis] = value;
            if (light.userData.config?.position) {
                light.userData.config.position[axis] = value;
            }
            this.updateHelpers(); // updateHelpers calls onChange
        }
    }

    toggleLight(name, enabled) {
        const light = this.getLight(name);
        if (light) {
            light.visible = enabled;
            light.userData.enabled = enabled;
            if (light.userData.config) {
                light.userData.config.enabled = enabled;
            }
            this.updateHelpers(); // updateHelpers calls onChange
        }
    }

    setAmbientLight(light) {
        this.ambientLight = light;
        if (this.onChange) this.onChange();
    }

    updateAmbientIntensity(intensity) {
        if (this.ambientLight) {
            this.ambientLight.intensity = intensity;
            if (this.onChange) this.onChange();
        }
    }

    getLights() {
        return this.lights;
    }

    /**
     * Release all Three.js resources held by this system.
     * Call this when the lighting system is being destroyed.
     */
    dispose() {
        this.clearLights();

        // Dispose shared geometries
        Object.values(sharedGeometries).forEach(geo => geo.dispose());
    }
}
