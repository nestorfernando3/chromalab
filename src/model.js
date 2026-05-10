import { Group, MeshStandardMaterial, MeshPhysicalMaterial, Mesh, CylinderGeometry, SphereGeometry, LatheGeometry, Color, BackSide, DoubleSide, CircleGeometry, AmbientLight, FogExp2, Vector2, BoxGeometry, PlaneGeometry, TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { appEvents } from './utils/events.js';
import { DEFAULT_LANGUAGE, normalizeLanguage } from './runtime.js';
import { localizeValue } from './localization.js';

// ====== Model registry — add more GLB models here ======
export const DEFAULT_MODEL_ID = 'virtual_room';

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
    },
    {
        id: 'virtual_room',
        name: { es: 'Sala Ideal', en: 'Ideal Color Room' },
        icon: '🏠',
        kind: 'proceduralRoom',
        hideBase: true,
        preserveMaterial: true,
        description: {
            es: 'Una sala virtual neutra para iluminar, comparar reflejos y probar teoría del color',
            en: 'A neutral virtual room for lighting, comparing reflections, and testing color theory'
        }
    },
    {
        id: 'sala_v2',
        name: { es: 'Sala V2', en: 'Sala V2' },
        icon: '🏠',
        kind: 'proceduralRoom',
        hideBase: true,
        preserveMaterial: true,
        description: {
            es: 'Sala V2 — habitación amueblada con ventana, sofá, lámpara, decoración y arte enmarcado',
            en: 'Sala V2 — furnished room with window, sofa, lamp, decor, and framed artwork'
        }
    }
];

const matNormalScale = new Vector2(0.8, 0.8);

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

function disposeObject3D(object) {
    object.traverse(child => {
        child.geometry?.dispose();
        if (child.material) {
            (Array.isArray(child.material) ? child.material : [child.material])
                .forEach(material => material.dispose());
        }
    });
}

function createRoomMaterial(color, options = {}) {
    return new MeshStandardMaterial({
        color,
        roughness: options.roughness ?? 0.72,
        metalness: options.metalness ?? 0.02
    });
}

function createBox({ name, size, position, color, roughness, metalness }) {
    const mesh = new Mesh(
        new BoxGeometry(size[0], size[1], size[2]),
        createRoomMaterial(color, { roughness, metalness })
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createPlane({ name, size, position, rotation, color, roughness }) {
    const mesh = new Mesh(
        new PlaneGeometry(size[0], size[1]),
        createRoomMaterial(color, { roughness })
    );
    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.receiveShadow = true;
    return mesh;
}

function createVirtualColorRoom() {
    const room = new Group();
    room.name = 'virtual-color-room';

    room.add(createPlane({
        name: 'matte-floor',
        size: [5.4, 5.4],
        position: [0, 0.02, -0.45],
        rotation: [-Math.PI / 2, 0, 0],
        color: 0x8a8580,
        roughness: 0.92
    }));
    room.add(createPlane({
        name: 'warm-neutral-wall',
        size: [5.4, 2.9],
        position: [0, 1.45, -3.15],
        rotation: [0, 0, 0],
        color: 0xb8b0a4,
        roughness: 0.88
    }));
    room.add(createPlane({
        name: 'cool-neutral-wall',
        size: [5.4, 2.9],
        position: [-2.7, 1.45, -0.45],
        rotation: [0, Math.PI / 2, 0],
        color: 0x9faab0,
        roughness: 0.86
    }));
    room.add(createPlane({
        name: 'deep-accent-wall',
        size: [5.4, 2.9],
        position: [2.7, 1.45, -0.45],
        rotation: [0, -Math.PI / 2, 0],
        color: 0x3f4f46,
        roughness: 0.84
    }));

    room.add(createBox({
        name: 'neutral-sofa',
        size: [2.2, 0.48, 0.78],
        position: [-0.85, 0.48, -1.65],
        color: 0x6f7474,
        roughness: 0.78
    }));
    room.add(createBox({
        name: 'sofa-back',
        size: [2.28, 0.72, 0.18],
        position: [-0.85, 0.86, -2.02],
        color: 0x5f6666,
        roughness: 0.8
    }));
    room.add(createBox({
        name: 'low-table',
        size: [1.5, 0.16, 0.74],
        position: [0.55, 0.35, -0.56],
        color: 0x4b4038,
        roughness: 0.58
    }));
    room.add(createBox({
        name: 'table-base',
        size: [1.1, 0.32, 0.42],
        position: [0.55, 0.17, -0.56],
        color: 0x2d2a29,
        roughness: 0.7
    }));

    const sampleColors = [0xc41e3a, 0xf2b705, 0x2f9e44, 0x2f80ed, 0x8e44ad, 0xd8d2c4];
    sampleColors.forEach((color, index) => {
        const swatch = createBox({
            name: `color-swatch-${index + 1}`,
            size: [0.34, 0.34, 0.035],
            position: [-1.4 + index * 0.55, 1.72, -3.12],
            color,
            roughness: 0.62
        });
        room.add(swatch);
    });

    const sphere = new Mesh(
        new SphereGeometry(0.28, 32, 16),
        createRoomMaterial(0xded7ca, { roughness: 0.34, metalness: 0.08 })
    );
    sphere.name = 'neutral-reference-sphere';
    sphere.position.set(0.15, 0.73, -0.55);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    room.add(sphere);

    room.add(createBox({
        name: 'color-reference-cube',
        size: [0.42, 0.42, 0.42],
        position: [0.9, 0.68, -0.6],
        color: 0x737373,
        roughness: 0.46
    }));

    room.position.set(0, 0, 0.55);
    room.rotation.y = Math.PI / 18;
    return room;
}

function createSalaV2Room() {
    const ROOM_W = 5.8, ROOM_H = 2.8, ROOM_D = 4.4;
    const halfW = ROOM_W / 2, halfD = ROOM_D / 2;

    const room = new Group();
    room.name = 'sala-v2';

    // Floor
    const floorMat = createRoomMaterial(0xd4d0c8, { roughness: 0.85 });
    floorMat.side = DoubleSide;
    const floor = new Mesh(new PlaneGeometry(ROOM_W, ROOM_D), floorMat);
    floor.name = 'room-floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    room.add(floor);

    // Back wall
    const bwMat = createRoomMaterial(0xe8e4de, { roughness: 0.9 });
    bwMat.side = DoubleSide;
    const bw = new Mesh(new PlaneGeometry(ROOM_W, ROOM_H), bwMat);
    bw.name = 'wall-back';
    bw.position.set(0, ROOM_H / 2, -halfD);
    bw.receiveShadow = true;
    room.add(bw);

    // Left wall
    const lwMat = createRoomMaterial(0xe0dedc, { roughness: 0.88 });
    lwMat.side = DoubleSide;
    const lw = new Mesh(new PlaneGeometry(ROOM_D, ROOM_H), lwMat);
    lw.name = 'wall-left';
    lw.position.set(-halfW, ROOM_H / 2, 0);
    lw.rotation.y = Math.PI / 2;
    lw.receiveShadow = true;
    room.add(lw);

    // Right wall (light accent)
    const rwMat = createRoomMaterial(0xc8c0b6, { roughness: 0.8 });
    rwMat.side = DoubleSide;
    const rw = new Mesh(new PlaneGeometry(ROOM_D, ROOM_H), rwMat);
    rw.name = 'wall-right';
    rw.position.set(halfW, ROOM_H / 2, 0);
    rw.rotation.y = -Math.PI / 2;
    rw.receiveShadow = true;
    room.add(rw);

    // No ceiling — ChromaLab overhead lights

    // Baseboards
    function addBB(wx, wz, ry, w) {
        const bb = new Mesh(new BoxGeometry(w, 0.12, 0.06), createRoomMaterial(0xc8c4be, { roughness: 0.6 }));
        bb.position.set(wx, 0.06, wz);
        bb.rotation.y = ry;
        bb.receiveShadow = true;
        room.add(bb);
    }
    addBB(0, -halfD + 0.01, 0, ROOM_W - 0.1);
    addBB(-halfW + 0.01, 0, Math.PI / 2, ROOM_D - 0.1);
    addBB(halfW - 0.01, 0, -Math.PI / 2, ROOM_D - 0.1);

    // Crown molding
    function addCrown(wx, wz, ry, w) {
        const c = new Mesh(new BoxGeometry(w, 0.06, 0.06), createRoomMaterial(0xd0ccc6, { roughness: 0.5 }));
        c.position.set(wx, ROOM_H - 0.03, wz);
        c.rotation.y = ry;
        room.add(c);
    }
    addCrown(0, -halfD + 0.01, 0, ROOM_W - 0.1);
    addCrown(-halfW + 0.01, 0, Math.PI / 2, ROOM_D - 0.1);
    addCrown(halfW - 0.01, 0, -Math.PI / 2, ROOM_D - 0.1);

    // ── Window on left wall ──
    const winW = 1.4, winH = 1.5, winY_sill = 0.85, wallThick = 0.06, winX = -halfW;

    const recessBack = new Mesh(new PlaneGeometry(winW, winH), createRoomMaterial(0x87CEEB, { roughness: 0.4 }));
    recessBack.name = 'window-recess';
    recessBack.position.set(winX + wallThick + 0.02, winY_sill + winH / 2, 0);
    recessBack.rotation.y = Math.PI / 2;
    recessBack.material.side = DoubleSide;
    room.add(recessBack);

    const revMat = createRoomMaterial(0xc8c4be, { roughness: 0.65 });
    const revDims = [
        [wallThick, 0.08, winW, winX + wallThick / 2, winY_sill + winH + 0.04, 0],
        [wallThick, 0.08, winW, winX + wallThick / 2, winY_sill - 0.04, 0],
        [wallThick, winH - 0.08, 0.08, winX + wallThick / 2, winY_sill + winH / 2, -winW / 2 + 0.04],
        [wallThick, winH - 0.08, 0.08, winX + wallThick / 2, winY_sill + winH / 2, winW / 2 - 0.04],
    ];
    revDims.forEach(d => {
        const r = new Mesh(new BoxGeometry(d[0], d[1], d[2]), revMat);
        r.position.set(d[3], d[4], d[5]);
        room.add(r);
    });

    const wfMat = createRoomMaterial(0xd4c9b8, { roughness: 0.5 });
    const fw = 0.06;
    const frameBars = [
        [0.04, winH + 0.12, fw, winX - 0.02, winY_sill + winH / 2, -winW / 2 - 0.03],
        [0.04, winH + 0.12, fw, winX - 0.02, winY_sill + winH / 2, winW / 2 + 0.03],
        [0.04, fw, winW + 0.12, winX - 0.02, winY_sill + winH + 0.02, 0],
        [0.04, fw, winW + 0.12, winX - 0.02, winY_sill - 0.02, 0],
    ];
    frameBars.forEach(d => {
        const f = new Mesh(new BoxGeometry(d[0], d[1], d[2]), wfMat);
        f.position.set(d[3], d[4], d[5]);
        room.add(f);
    });

    const sill = new Mesh(new BoxGeometry(0.2, 0.04, winW + 0.16), createRoomMaterial(0xb8b0a6, { roughness: 0.5 }));
    sill.name = 'window-sill';
    sill.position.set(winX - 0.1, winY_sill, 0);
    room.add(sill);

    const glassMat = new MeshPhysicalMaterial({ color: 0xbbddff, transparent: true, opacity: 0.15, roughness: 0.02, side: DoubleSide });
    const glass = new Mesh(new PlaneGeometry(winW - 0.12, winH - 0.12), glassMat);
    glass.name = 'window-glass';
    glass.position.set(winX + 0.04, winY_sill + winH / 2, 0);
    glass.rotation.y = Math.PI / 2;
    room.add(glass);

    // ── Sofa ──
    const sofa = new Group();
    sofa.name = 'sofa';
    sofa.position.set(-0.95, 0, -1.45);
    sofa.add(new Mesh(new BoxGeometry(2.15, 0.22, 0.82), createRoomMaterial(0x4a4a4e, { roughness: 0.7 }))).position.set(0, 0.24, 0);
    [-1, 0, 1].forEach(i => {
        const c = new Mesh(new BoxGeometry(0.62, 0.16, 0.72), createRoomMaterial(0x5c5c62, { roughness: 0.85 }));
        c.position.set(i * 0.68, 0.42, 0.04);
        c.castShadow = true;
        sofa.add(c);
    });
    const back = new Mesh(new BoxGeometry(2.15, 0.72, 0.16), createRoomMaterial(0x555559, { roughness: 0.8 }));
    back.position.set(0, 0.67, -0.43);
    back.castShadow = true;
    sofa.add(back);
    [-1, 1].forEach(s => {
        const a = new Mesh(new BoxGeometry(0.16, 0.48, 0.82), createRoomMaterial(0x4e4e54, { roughness: 0.75 }));
        a.position.set(s * 1.15, 0.39, 0.02);
        a.castShadow = true;
        sofa.add(a);
    });
    const sofaLegMat = createRoomMaterial(0x1a1a1e, { roughness: 0.3, metalness: 0.4 });
    [-0.9, 0.9].forEach(x => [-0.3, 0.34].forEach(z => {
        const l = new Mesh(new CylinderGeometry(0.022, 0.026, 0.14, 6), sofaLegMat);
        l.position.set(x, 0.07, z);
        sofa.add(l);
    }));
    room.add(sofa);

    // ── Coffee table ──
    const table = new Group();
    table.name = 'coffee-table';
    table.position.set(0.55, 0, -0.28);
    const tt = new Mesh(new BoxGeometry(1.15, 0.055, 0.56), createRoomMaterial(0xd8d4ce, { roughness: 0.25, metalness: 0.05 }));
    tt.position.set(0, 0.42, 0);
    tt.castShadow = true; tt.receiveShadow = true;
    table.add(tt);
    const tf = new Mesh(new BoxGeometry(1.02, 0.08, 0.5), createRoomMaterial(0x3a3836, { roughness: 0.55 }));
    tf.position.set(0, 0.36, 0);
    table.add(tf);
    const tableLegMat = createRoomMaterial(0x1a1a1e, { roughness: 0.3, metalness: 0.4 });
    [-0.5, 0.5].forEach(x => [-0.22, 0.22].forEach(z => {
        const l = new Mesh(new CylinderGeometry(0.022, 0.026, 0.34, 6), tableLegMat);
        l.position.set(x, 0.18, z);
        table.add(l);
    }));
    room.add(table);

    // ── Floor lamp ──
    const lampG = new Group();
    lampG.name = 'floor-lamp';
    lampG.position.set(1.85, 0, -1.55);
    const lb = new Mesh(new CylinderGeometry(0.13, 0.16, 0.045, 16), createRoomMaterial(0x222226, { roughness: 0.4, metalness: 0.3 }));
    lb.position.y = 0.03;
    lampG.add(lb);
    const lp = new Mesh(new CylinderGeometry(0.016, 0.02, 1.38, 8), createRoomMaterial(0x2a2a2e, { roughness: 0.3, metalness: 0.2 }));
    lp.position.y = 0.72;
    lampG.add(lp);
    const lsMat = createRoomMaterial(0xe8e4de, { roughness: 0.7 });
    lsMat.side = DoubleSide;
    const ls = new Mesh(new CylinderGeometry(0.22, 0.14, 0.28, 16, 1, true), lsMat);
    ls.position.y = 1.43;
    ls.castShadow = true;
    lampG.add(ls);
    room.add(lampG);

    // ── Reference objects on table ──
    const refs = new Group();
    refs.name = 'table-ref-objects';
    refs.position.set(0.55, 0.46, -0.28);
    const sphere = new Mesh(new SphereGeometry(0.08, 24, 16), new MeshStandardMaterial({ color: 0x888888, roughness: 0.15, metalness: 0.6 }));
    sphere.position.set(-0.25, 0.08, 0.15);
    sphere.castShadow = true;
    refs.add(sphere);
    const cube = new Mesh(new BoxGeometry(0.12, 0.12, 0.12), createRoomMaterial(0x6a6a6e, { roughness: 0.5 }));
    cube.position.set(0.28, 0.06, 0.08);
    cube.castShadow = true;
    cube.rotation.set(0.3, 0.5, 0);
    refs.add(cube);
    const cyl = new Mesh(new CylinderGeometry(0.05, 0.055, 0.12, 12), new MeshStandardMaterial({ color: 0xcc8866, roughness: 0.3, metalness: 0.05 }));
    cyl.position.set(-0.06, 0.06, -0.13);
    cyl.castShadow = true;
    refs.add(cyl);
    room.add(refs);

    // ── Starry Night painting on RIGHT wall ──
    const texLoader = new TextureLoader();
    const starryTex = texLoader.load('./models/Vincent_van_Gogh_Starry_Night.jpg');
    const art = new Group();
    art.name = 'starry-night-art';
    const aW = 0.88, aH = aW / 1.25;
    const canvas = new Mesh(new PlaneGeometry(aW, aH), new MeshStandardMaterial({ map: starryTex, roughness: 0.3 }));
    canvas.name = 'art-canvas';
    art.add(canvas);
    const pfMat = createRoomMaterial(0x7a7062, { roughness: 0.5, metalness: 0.08 });
    const fd = 0.045, fW = 0.04;
    [
        [aW + fW * 2, fW, fd, 0, aH / 2 + fW / 2, 0, 'top'],
        [aW + fW * 2, fW, fd, 0, -aH / 2 - fW / 2, 0, 'bottom'],
        [fW, aH + fW * 2, fd, -aW / 2 - fW / 2, 0, 0, 'left'],
        [fW, aH + fW * 2, fd, aW / 2 + fW / 2, 0, 0, 'right'],
    ].forEach(([gw, gh, gd, px, py, pz, name]) => {
        const f = new Mesh(new BoxGeometry(gw, gh, gd), pfMat);
        f.position.set(px, py, pz);
        f.name = 'art-frame-' + name;
        art.add(f);
    });
    art.position.set(halfW - 0.025, 1.35, 0);
    art.rotation.y = -Math.PI / 2;
    room.add(art);

    // ── Color swatches on back wall ──
    const swatchColors = [0xc41e3a, 0xe8a020, 0x2f9e44, 0x2f80ed, 0x8e44ad, 0xd8d2c4];
    const swatchGrp = new Group();
    swatchGrp.name = 'color-swatches';
    swatchGrp.position.set(0, 1.55, -halfD + 0.02);
    swatchColors.forEach((col, i) => {
        const s = new Mesh(new PlaneGeometry(0.28, 0.28), new MeshStandardMaterial({ color: col, roughness: 0.5 }));
        s.position.set(-1.35 + i * 0.54, 0, 0);
        swatchGrp.add(s);
        const f = new Mesh(new PlaneGeometry(0.31, 0.31), createRoomMaterial(0xcccccc, { roughness: 0.4, metalness: 0.05 }));
        f.position.set(-1.35 + i * 0.54, 0, -0.005);
        swatchGrp.add(f);
    });
    room.add(swatchGrp);

    // ── Wall shelf on RIGHT wall ──
    const shelfGrp = new Group();
    shelfGrp.name = 'wall-shelf';
    const shMat = createRoomMaterial(0xc8c0b6, { roughness: 0.4, metalness: 0.05 });
    const shBoard = new Mesh(new BoxGeometry(0.7, 0.022, 0.14), shMat);
    shBoard.position.set(0, 0, 0);
    shBoard.castShadow = true;
    shelfGrp.add(shBoard);
    const brMat = createRoomMaterial(0x3a3a3e, { roughness: 0.3, metalness: 0.2 });
    [-0.28, 0.28].forEach(x => {
        const b = new Mesh(new BoxGeometry(0.02, 0.05, 0.10), brMat);
        b.position.set(x, -0.04, -0.07);
        shelfGrp.add(b);
    });
    const shObj = new Group();
    const potSh = new Mesh(new CylinderGeometry(0.025, 0.03, 0.04, 8), createRoomMaterial(0x8a7a6a, { roughness: 0.5 }));
    potSh.position.set(-0.18, 0.035, 0);
    shObj.add(potSh);
    shObj.add(new Mesh(new BoxGeometry(0.06, 0.01, 0.07), createRoomMaterial(0x4a6a8a, { roughness: 0.5 }))).position.set(0.12, 0.016, 0);
    shObj.add(new Mesh(new BoxGeometry(0.055, 0.008, 0.065), createRoomMaterial(0xc97a5e, { roughness: 0.5 }))).position.set(0.12, 0.03, 0.004);
    const ff = new Mesh(new PlaneGeometry(0.055, 0.07), createRoomMaterial(0xd4c8b8, { roughness: 0.3, metalness: 0.05 }));
    ff.name = 'shelf-photo-frame';
    shObj.add(ff);
    const fi = new Mesh(new PlaneGeometry(0.04, 0.055), createRoomMaterial(0x8a9a7a, { roughness: 0.5 }));
    fi.position.z = 0.001;
    shObj.add(fi);
    shObj.position.set(0, 0, 0.015);
    shelfGrp.add(shObj);
    shelfGrp.position.set(halfW - 0.025, 0.85, 1.0);
    shelfGrp.rotation.y = -Math.PI / 2;
    room.add(shelfGrp);

    // ── Decorations ──
    // Area rug
    const rugMat = new MeshStandardMaterial({ color: 0xb8a898, roughness: 0.92, side: DoubleSide });
    const rug = new Mesh(new CircleGeometry(1.4, 32), rugMat);
    rug.name = 'area-rug';
    rug.scale.set(1, 1, 0.75);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-0.2, 0.005, -0.85);
    rug.receiveShadow = true;
    room.add(rug);

    // Curtains
    const curMat = new MeshPhysicalMaterial({ color: 0xe8e0d8, roughness: 0.9, transparent: true, opacity: 0.55, side: DoubleSide });
    const cH = winH + 0.35, cW = 0.4;
    [-0.25, 0.25].forEach((zOff, idx) => {
        const cur = new Mesh(new PlaneGeometry(cW, cH, 8, 8), curMat);
        const pos = cur.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            pos.setZ(i, Math.sin(y * 4 + (idx ? 2.0 : 0.5)) * 0.025);
        }
        pos.needsUpdate = true;
        cur.geometry.computeVertexNormals();
        cur.name = 'curtain-' + (idx ? 'right' : 'left');
        cur.position.set(-halfW - 0.04, winY_sill + cH / 2 - 0.1, zOff * 2 * (winW / 2 + 0.25));
        cur.rotation.y = Math.PI / 2;
        cur.castShadow = true;
        room.add(cur);
    });
    const rod = new Mesh(new CylinderGeometry(0.014, 0.014, winW + 0.3, 8), createRoomMaterial(0x3a3a3e, { roughness: 0.3, metalness: 0.4 }));
    rod.name = 'curtain-rod';
    rod.rotation.x = Math.PI / 2;
    rod.position.set(-halfW - 0.02, winY_sill + winH + 0.15, 0);
    room.add(rod);

    // Throw pillows
    const pillowBaseX = -0.95, pillowBaseZ = -1.45 + 0.35;
    [
        [0xc97a5e, -0.6, 0.08],
        [0xdcc8b4, 0, -0.02],
        [0x7a8c6e, 0.6, -0.06],
    ].forEach(([c, xOff, rot]) => {
        const p = new Mesh(new SphereGeometry(0.13, 16, 12), new MeshStandardMaterial({ color: c, roughness: 0.85 }));
        p.scale.set(1, 0.5, 0.7);
        p.position.set(pillowBaseX + xOff, 0.48, pillowBaseZ);
        p.rotation.set(-0.1, 0, rot);
        p.castShadow = true;
        room.add(p);
    });

    // Potted plant
    const plant = new Group();
    plant.name = 'potted-plant';
    const pot = new Mesh(new CylinderGeometry(0.14, 0.10, 0.2, 12), createRoomMaterial(0xc97a5e, { roughness: 0.55 }));
    pot.position.y = 0.1;
    pot.castShadow = true;
    plant.add(pot);
    const trunk = new Mesh(new CylinderGeometry(0.018, 0.025, 0.95, 6), createRoomMaterial(0x5a4a3a, { roughness: 0.8 }));
    trunk.position.y = 0.68;
    trunk.castShadow = true;
    plant.add(trunk);
    const leafMat1 = new MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.8 });
    const leafMat2 = new MeshStandardMaterial({ color: 0x5a8a4a, roughness: 0.8 });
    [0.22, 0.16, 0.14, 0.12].forEach((s, i) => {
        const cl = new Mesh(new SphereGeometry(s, 8, 6), i % 2 ? leafMat2 : leafMat1);
        cl.scale.set(1, 0.75, 0.8);
        cl.position.set([0, 0.15, -0.12, -0.08][i], [1.12, 1.02, 0.92, 0.85][i], [0, 0.1, -0.12, 0.15][i]);
        cl.castShadow = true;
        plant.add(cl);
    });
    plant.position.set(-halfW + 0.3, 0, 1.7);
    room.add(plant);

    // Books on coffee table
    const books = new Group();
    books.name = 'table-books';
    books.position.set(0.55, 0.475, -0.28);
    let bookY = 0;
    [[0.18, 0.025, 0.24, 0xc41e3a, -0.25, 0.15, 0],
     [0.16, 0.02, 0.22, 0x2a5a8a, -0.23, 0.17, 0.04],
     [0.20, 0.028, 0.26, 0xd4a040, -0.27, 0.13, -0.03]].forEach(([w, h, d, c, px, pz, ry]) => {
        const b = new Mesh(new BoxGeometry(w, h, d), createRoomMaterial(c, { roughness: 0.45 }));
        b.position.set(px, bookY + h / 2, pz);
        b.rotation.y = ry;
        b.castShadow = true;
        books.add(b);
        bookY += h;
    });
    const mag = new Mesh(new BoxGeometry(0.17, 0.006, 0.22), createRoomMaterial(0xf0e8dc, { roughness: 0.55 }));
    mag.position.set(-0.22, bookY + 0.005, 0.18);
    mag.rotation.set(0, 0.15, 0.02);
    mag.castShadow = true;
    books.add(mag);
    room.add(books);

    // Decorative vase on coffee table
    const vPts = [[0,0],[0.025,0],[0.04,0.01],[0.055,0.04],[0.065,0.08],[0.055,0.12],[0.04,0.14],[0.035,0.16],[0.04,0.18],[0.03,0.195],[0,0.2]].map(p => new Vector2(p[0], p[1]));
    const vase = new Mesh(new LatheGeometry(vPts, 16), new MeshStandardMaterial({ color: 0x7a9a8a, roughness: 0.25 }));
    vase.name = 'table-vase';
    vase.position.set(0.9, 0.475, -0.4);
    vase.castShadow = true;
    room.add(vase);

    // Side table
    const st = new Group();
    st.name = 'side-table';
    st.position.set(0.55, 0, -1.25);
    const stTop = new Mesh(new BoxGeometry(0.35, 0.03, 0.35), createRoomMaterial(0xcdc8c0, { roughness: 0.25, metalness: 0.05 }));
    stTop.position.y = 0.5;
    stTop.castShadow = true;
    st.add(stTop);
    const stLeg = createRoomMaterial(0x222226, { roughness: 0.3, metalness: 0.4 });
    [-0.14, 0.14].forEach(x => [-0.14, 0.14].forEach(z => {
        const l = new Mesh(new CylinderGeometry(0.012, 0.015, 0.48, 6), stLeg);
        l.position.set(x, 0.24, z);
        st.add(l);
    }));
    room.add(st);

    return room;
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
        this.loadModel(DEFAULT_MODEL_ID);
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
            disposeObject3D(this.currentHead);
            this.currentHead = null;
        }

        if (config.kind === 'proceduralRoom') {
            const room = config.id === 'sala_v2'
                ? createSalaV2Room()
                : createVirtualColorRoom();
            this.modelGroup.add(room);
            this.currentHead = room;
            this.isLoading = false;
            if (loading) loading.classList.add('hidden');
            appEvents.emit('requestRender');
            return;
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

    // Ambient light — neutral, soft enough to reveal reference objects without washing out colored lights
    const ambientLight = new AmbientLight(0xd0d8e8, 0.25);
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
    if (scene.fog && scene.fog.isFogExp2) {
        scene.fog.color.set(color);
    } else {
        scene.fog = new FogExp2(color, 0.025);
    }
    if (environment.backdrop) {
        environment.backdrop.material.color.set(color);
    }
    if (environment.ground) {
        environment.ground.material.color.set(color);
    }
    appEvents.emit('requestRender');
}
