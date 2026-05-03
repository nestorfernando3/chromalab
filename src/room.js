import {
    Group, Mesh, MeshStandardMaterial,
    BoxGeometry, PlaneGeometry, CylinderGeometry,
    Color, AmbientLight, FogExp2
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { appEvents } from './utils/events.js';

const ROOM_W = 7;
const ROOM_D = 5;
const ROOM_H = 3.5;

const PALETTE = {
    backWall: 0xE8D5C4,
    leftWall: 0xD4A8A0,
    rightWall: 0x8B1A1A,
    floor: 0x4A3528,
    pedestal: 0x1A1A2E,
    accentTrim: 0xC4956A,
    ceiling: 0xF0E8DC,
    sceneBg: 0x2A1F1A,
    sceneFog: 0x2A1F1A,
};

const ASSET_BASE = './assets/chroma-lab/vendor/kenney';

const ROOM_PROPS = [
    // Mixing bench left
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/desk.glb`, pos: [-2.8, 0, 1.8], scale: 0.65, rot: 0.3 },
    // Chair at bench
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/chairDesk.glb`, pos: [-1.8, 0, 2.2], scale: 0.65, rot: -1.2 },
    // Low table right foreground
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/sideTable.glb`, pos: [2.2, 0, 1.8], scale: 0.7, rot: 0 },
    // Lounge chair right-mid
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/loungeChair.glb`, pos: [2.5, 0, -0.2], scale: 0.7, rot: -0.8 },
    // Bookcase left back
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/bookcaseClosedWide.glb`, pos: [-2.5, 0, -1.5], scale: 0.65, rot: 0 },
    // Rug under lounge area
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/rugRounded.glb`, pos: [2.2, 0.02, 0], scale: 0.8, rot: 0.2 },
    // Plant right back
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/plantSmall2.glb`, pos: [2.6, 0, -1.8], scale: 0.7, rot: 0.5 },
    // Plant left front
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/plantSmall1.glb`, pos: [-1.2, 0, 2.6], scale: 0.7, rot: 0 },
    // Vintage TV on bookcase
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/televisionVintage.glb`, pos: [-2.5, 1.0, -1.5], scale: 0.5, rot: 0.2 },
    // Floor lamp right
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/lampSquareFloor.glb`, pos: [3.0, 0, 1.2], scale: 0.7, rot: 0.4 },
    // Wall lamp over bench
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/lampWall.glb`, pos: [-3.3, 1.8, 2.2], scale: 0.5, rot: 0.5 },
    // Screen display on back wall
    { path: `${ASSET_BASE}/factory-kit/Models/GLB format/screen-flat.glb`, pos: [-1.2, 2.0, -2.45], scale: 0.35, rot: 0 },
    // Catwalk / gantry accent overhead
    { path: `${ASSET_BASE}/factory-kit/Models/GLB format/catwalk-straight.glb`, pos: [2.0, 3.0, -1.0], scale: 0.45, rot: 0 },
    // Glass pipe accent
    { path: `${ASSET_BASE}/factory-kit/Models/GLB format/pipe-glass-large-bend.glb`, pos: [2.5, 1.0, -2.3], scale: 0.5, rot: 0.8 },
    // Button / control accent on desk
    { path: `${ASSET_BASE}/factory-kit/Models/GLB format/button-floor-square.glb`, pos: [-2.3, 0.7, 2.2], scale: 0.3, rot: 0 },
    // Books on bookcase (decorative, layered)
    { path: `${ASSET_BASE}/furniture-kit/Models/GLTF format/books.glb`, pos: [-2.5, 0.7, -1.5], scale: 0.65, rot: 0 },
    // Lever accent
    { path: `${ASSET_BASE}/factory-kit/Models/GLB format/lever-single.glb`, pos: [2.2, 0.7, 1.8], scale: 0.4, rot: 0 },
];

export function createRoomEnvironment(scene) {
    const roomGroup = new Group();
    scene.add(roomGroup);

    const roomFloor = createFloor();
    roomGroup.add(roomFloor);

    const backWall = createBackWall();
    roomGroup.add(backWall);

    const leftWall = createLeftWall();
    roomGroup.add(leftWall);

    const rightWall = createRightWall();
    roomGroup.add(rightWall);

    const ceilingPanel = createCeiling();
    roomGroup.add(ceilingPanel);

    const pedestal = createPedestal();
    roomGroup.add(pedestal);

    const { baseboard, ring } = createTrim();
    roomGroup.add(baseboard);
    roomGroup.add(ring);

    scene.background = new Color(PALETTE.sceneBg);
    scene.fog = new FogExp2(new Color(PALETTE.sceneFog), 0.035);

    const ambientLight = new AmbientLight(0x605070, 0.3);
    scene.add(ambientLight);

    loadRoomProps(roomGroup);

    return { ground: roomFloor, backdrop: backWall, ambientLight };
}

function createFloor() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.floor,
        roughness: 0.65,
        metalness: 0.05,
    });
    const mesh = new Mesh(new PlaneGeometry(ROOM_W + 4, ROOM_D + 6), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0, 0.5);
    mesh.receiveShadow = true;
    return mesh;
}

function createBackWall() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.backWall,
        roughness: 0.85,
        metalness: 0.0,
    });
    const mesh = new Mesh(new BoxGeometry(ROOM_W, ROOM_H, 0.12), mat);
    mesh.position.set(0, ROOM_H / 2, -ROOM_D / 2 + 0.06);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

function createLeftWall() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.leftWall,
        roughness: 0.8,
        metalness: 0.0,
    });
    const mesh = new Mesh(new BoxGeometry(0.12, ROOM_H, ROOM_D), mat);
    mesh.position.set(-ROOM_W / 2 + 0.06, ROOM_H / 2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

function createRightWall() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.rightWall,
        roughness: 0.35,
        metalness: 0.25,
    });
    const mesh = new Mesh(new BoxGeometry(0.12, ROOM_H, ROOM_D), mat);
    mesh.position.set(ROOM_W / 2 - 0.06, ROOM_H / 2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

function createCeiling() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.ceiling,
        roughness: 0.9,
        metalness: 0.0,
    });
    const mesh = new Mesh(new BoxGeometry(ROOM_W - 0.2, 0.06, ROOM_D - 0.2), mat);
    mesh.position.set(0, ROOM_H, 0);
    return mesh;
}

function createPedestal() {
    const mat = new MeshStandardMaterial({
        color: PALETTE.pedestal,
        roughness: 0.8,
        metalness: 0.05,
    });
    const base = new Mesh(new CylinderGeometry(0.65, 0.75, 0.25, 32), mat);
    base.position.set(0, 0.125, 0);
    base.receiveShadow = true;
    return base;
}

function createTrim() {
    const trimMat = new MeshStandardMaterial({
        color: PALETTE.accentTrim,
        roughness: 0.3,
        metalness: 0.6,
    });

    const baseboard = new Mesh(new BoxGeometry(ROOM_W - 0.4, 0.06, 0.1), trimMat);
    baseboard.position.set(0, 0.03, -ROOM_D / 2 + 0.08);

    const ring = new Mesh(new CylinderGeometry(0.7, 0.7, 0.04, 32), trimMat);
    ring.position.set(0, 0.27, 0);

    return { baseboard, ring };
}

function loadRoomProps(roomGroup) {
    const loader = new GLTFLoader();
    let loaded = 0;
    const total = ROOM_PROPS.length;

    ROOM_PROPS.forEach(prop => {
        loader.load(
            prop.path,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(prop.pos[0], prop.pos[1], prop.pos[2]);
                const s = prop.scale;
                model.scale.set(s, s, s);
                if (prop.rot) model.rotation.y = prop.rot;
                model.traverse(child => {
                    if (child.isMesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
                });
                roomGroup.add(model);
                loaded++;
                if (loaded >= total) appEvents.emit('requestRender');
            },
            undefined,
            (err) => {
                console.warn(`Room prop load failed: ${prop.path}`, err);
                loaded++;
                if (loaded >= total) appEvents.emit('requestRender');
            }
        );
    });
}
