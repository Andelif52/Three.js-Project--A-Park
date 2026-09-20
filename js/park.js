import * as THREE from "three";
import { createBench, createLampPost } from "./bench.js";
import { createGrassTexture, createPathTexture } from "./textures.js";
import { createWalls } from "./walls.js";
import { createGate } from "./gate.js";


// Builds a flat ribbon that follows a curve (used for the path)
function createPathGeometry(curve, width, segments) {
    const positions = [];
    const uvs = [];
    const indices = [];
    const length = curve.getLength();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);

        // Direction pointing sideways from the path, flat on the ground
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const left = point.clone().addScaledVector(side, width / 2);
        const right = point.clone().addScaledVector(side, -width / 2);

        positions.push(left.x, 0, left.z);
        positions.push(right.x, 0, right.z);

        // U goes across the path, V goes along it.
        // Dividing by width keeps texture tiles square.
        const v = (t * length) / width;
        uvs.push(0, v);
        uvs.push(1, v);

        if (i < segments) {
            const a = i * 2;
            indices.push(a, a + 2, a + 1);
            indices.push(a + 1, a + 2, a + 3);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}


export function createPark(scene) {

    // ---------- Ground ----------

    const groundSize = 70;

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(groundSize, groundSize),
        new THREE.MeshStandardMaterial({
            map: createGrassTexture(30), // repeats 30 times across the ground
            roughness: 1
        })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);


    // ---------- Curved path leading to the bench area ----------

    const pathWidth = 2.4;

    const pathCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 30),
        new THREE.Vector3(-4, 0, 20),
        new THREE.Vector3(3, 0, 11),
        new THREE.Vector3(0, 0, 3)
    ]);

    const path = new THREE.Mesh(
        createPathGeometry(pathCurve, pathWidth, 120),
        new THREE.MeshStandardMaterial({
            map: createPathTexture(),
            roughness: 0.95
        })
    );

    path.position.y = 0.02; // slightly above the grass to avoid flickering
    path.receiveShadow = true;
    scene.add(path);


    // ---------- Round paved area where the bench will stand ----------

    const plazaRadius = 3.5;
    const plazaRepeat = (plazaRadius * 2) / pathWidth; // same gravel size as the path

    const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(plazaRadius, 48),
        new THREE.MeshStandardMaterial({
            map: createPathTexture(plazaRepeat, plazaRepeat),
            roughness: 0.95
        })
    );

    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.025; // just above the path where they overlap
    plaza.receiveShadow = true;
    scene.add(plaza);


    // ---------- Bench and lamp post ----------

    const bench = createBench();
    bench.position.set(0, 0.025, 0); // sitting on the paved circle
    scene.add(bench);

    const lamp = createLampPost();
    lamp.position.set(1.9, 0.025, -0.5); // beside the bench, slightly behind
    scene.add(lamp);
    // ---------- Per-frame updates ----------

    function update(delta, elapsed) {
     
    }

    createWalls(scene);
    createGate(scene);

    return { update, bench};
}