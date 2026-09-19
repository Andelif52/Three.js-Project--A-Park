import * as THREE from "three";
import { createPaintTexture, createRopeTexture, createPathTexture } from "./textures.js";


// ---------- Helpers ----------

function prepare(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function addBox(parent, material, width, height, depth, x, y, z) {
    const mesh = prepare(new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    ));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
}

function addCylinder(parent, material, radius, length, x, y, z, rotX = 0, rotZ = 0) {
    const mesh = prepare(new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, length, 12),
        material
    ));
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, 0, rotZ);
    parent.add(mesh);
    return mesh;
}


// ---------- Swing set ----------

function createSwingSet(frameMaterial, seatMaterial, ropeMaterial) {
    const swingSet = new THREE.Group();

    const top = 2.3;        // height of the top beam
    const halfWidth = 1.5;  // distance from center to each A-frame
    const legSpread = 0.8;  // how far the legs spread at the bottom

    const legLength = Math.hypot(top, legSpread);
    const legAngle = Math.atan2(legSpread, top);

    // Top beam (cylinder turned sideways)
    addCylinder(swingSet, frameMaterial, 0.07, halfWidth * 2 + 0.2, 0, top, 0, 0, Math.PI / 2);

    // A-frame legs at each end
    for (const x of [-halfWidth, halfWidth]) {
        addCylinder(swingSet, frameMaterial, 0.06, legLength, x, top / 2,  legSpread / 2, -legAngle);
        addCylinder(swingSet, frameMaterial, 0.06, legLength, x, top / 2, -legSpread / 2,  legAngle);
    }

    // Two swings, each hanging from its own pivot at the top beam
    const swings = [];

    for (const x of [-0.6, 0.6]) {
        const pivot = new THREE.Group();
        pivot.position.set(x, top, 0);
        swingSet.add(pivot);

        // Two ropes
        for (const side of [-0.22, 0.22]) {
            addCylinder(pivot, ropeMaterial, 0.015, 1.7, side, -0.85, 0);
        }

        // Seat
        addBox(pivot, seatMaterial, 0.55, 0.06, 0.25, 0, -1.72, 0);

        swings.push(pivot);
    }

    return { swingSet, swings };
}


// ---------- Seesaw ----------

function createSeesaw(plankMaterial, baseMaterial) {
    const seesaw = new THREE.Group();

    // Base and axle
    addBox(seesaw, baseMaterial, 0.35, 0.45, 0.35, 0, 0.225, 0);
    addCylinder(seesaw, baseMaterial, 0.05, 0.45, 0, 0.48, 0, Math.PI / 2);

    // Everything that tilts goes inside this group
    const plank = new THREE.Group();
    plank.position.y = 0.5;
    seesaw.add(plank);

    addBox(plank, plankMaterial, 3.2, 0.07, 0.35, 0, 0.04, 0);

    for (const side of [-1, 1]) {
        addBox(plank, baseMaterial, 0.05, 0.3, 0.05, side * 1.1, 0.2, 0);             // handle post
        addCylinder(plank, baseMaterial, 0.025, 0.3, side * 1.1, 0.35, 0, Math.PI / 2); // handle grip
        addBox(plank, baseMaterial, 0.4, 0.04, 0.36, side * 1.4, 0.095, 0);           // seat pad
    }

    return { seesaw, plank };
}


// ---------- Playground ----------

export function createPlayground(scene) {

    const playground = new THREE.Group();
    playground.position.set(8.5, 0, 6.5); // front-right open area
    playground.rotation.y = -0.7;         // angled toward the bench
    scene.add(playground);

    // Pastel materials
    const paint = (color) => new THREE.MeshStandardMaterial({
        map: createPaintTexture(color),
        roughness: 0.6
    });

    const mint     = paint("#a8dcc9");
    const butter   = paint("#f6d98b");
    const coral    = paint("#f4a99a");
    const lavender = paint("#c7b8e8");

    const rope = new THREE.MeshStandardMaterial({
        map: createRopeTexture(),
        roughness: 0.9
    });

    // Sandy patch underneath
    const sand = new THREE.Mesh(
        new THREE.CircleGeometry(4.2, 48),
        new THREE.MeshStandardMaterial({
            map: createPathTexture(3.5, 3.5),
            roughness: 0.95
        })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = 0.02;
    sand.receiveShadow = true;
    playground.add(sand);

    // Swing set (mint frame, butter-yellow seats)
    const { swingSet, swings } = createSwingSet(mint, butter, rope);
    swingSet.position.z = -1.6;
    playground.add(swingSet);

    // Seesaw (coral plank, lavender base and handles)
    const { seesaw, plank } = createSeesaw(coral, lavender);
    seesaw.position.z = 2;
    playground.add(seesaw);


    // ---------- Per-frame updates ----------

    function update(elapsed) {
        swings[0].rotation.x = Math.sin(elapsed * 2.4) * 0.5;        // swinging (a child will sit here)
        swings[1].rotation.x = Math.sin(elapsed * 1.3 + 1) * 0.08;   // empty, drifting in the breeze
        plank.rotation.z = Math.sin(elapsed * 1.6) * 0.28;           // seesaw rocking
    }

    return { update, swings, seesawPlank: plank };
}