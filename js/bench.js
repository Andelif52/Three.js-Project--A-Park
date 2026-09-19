import * as THREE from "three";
import { createWoodTexture, createIronTexture } from "./textures.js";


// Creates a box, positions it, enables shadows, and adds it to a parent group
function addBox(parent, material, width, height, depth, x, y, z) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}


// ---------- Bench ----------

export function createBench() {
    const bench = new THREE.Group();

    const wood = new THREE.MeshStandardMaterial({
        map: createWoodTexture(),
        roughness: 0.8
    });

    const iron = new THREE.MeshStandardMaterial({
        map: createIronTexture(),
        roughness: 0.55,
        metalness: 0.3
    });

    const length = 2.2;

    // Seat slats (4 planks with small gaps)
    for (const z of [-0.195, -0.065, 0.065, 0.195]) {
        addBox(bench, wood, length, 0.05, 0.1, 0, 0.49, z);
    }

    // Backrest: its own group so it can be tilted as one piece
    const back = new THREE.Group();
    back.position.set(0, 0.5, -0.23);
    back.rotation.x = -0.2; // lean backwards
    bench.add(back);

    for (const y of [0.15, 0.3, 0.45]) {
        addBox(back, wood, length, 0.1, 0.04, 0, y, 0);
    }

    // Iron frame on both sides (side = -1 is left, 1 is right)
    for (const side of [-1, 1]) {
        const x = side * 1.13;

        addBox(bench, iron, 0.06, 0.74, 0.06, x, 0.37, 0.2);            // front leg
        addBox(bench, iron, 0.06, 0.5, 0.06, x, 0.25, -0.25);           // back leg
        addBox(bench, iron, 0.1, 0.05, 0.5, side * 1.08, 0.44, -0.02);  // rail under seat
        addBox(bench, iron, 0.08, 0.04, 0.55, x, 0.76, -0.03);          // armrest
        addBox(back, iron, 0.06, 0.6, 0.04, x, 0.28, -0.04);            // backrest support
    }

    return bench;
}


// ---------- Lamp post ----------

export function createLampPost() {
    const lamp = new THREE.Group();

    const iron = new THREE.MeshStandardMaterial({
        map: createIronTexture(),
        roughness: 0.55,
        metalness: 0.3
    });

    // [geometry, height of its center]
    const parts = [
        [new THREE.CylinderGeometry(0.16, 0.2, 0.15, 16), 0.075], // base
        [new THREE.CylinderGeometry(0.05, 0.07, 2.6, 16), 1.45],  // pole
        [new THREE.CylinderGeometry(0.12, 0.08, 0.1, 16), 2.8],   // bulb holder
        [new THREE.ConeGeometry(0.22, 0.18, 16), 3.13]            // cap
    ];

    for (const [geometry, y] of parts) {
        const mesh = new THREE.Mesh(geometry, iron);
        mesh.position.y = y;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        lamp.add(mesh);
    }

    // Warm bulb (glows slightly; real light comes in Part 5)
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0xfff1d0,
            emissive: 0xffc97a,
            emissiveIntensity: 0.8
        })
    );
    bulb.position.y = 2.95;
    lamp.add(bulb);

    return lamp;
}