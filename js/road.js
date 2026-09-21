import * as THREE from "three";
import { createPathTexture } from "./textures.js";


// Builds a flat road that follows a curve
function createRoadGeometry(curve, width, segments) {
    const positions = [];
    const uvs = [];
    const indices = [];
    const length = curve.getLength();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;

        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);

        // sideways direction on ground
        const side = new THREE.Vector3(
            -tangent.z,
            0,
            tangent.x
        ).normalize();

        const left = point.clone().addScaledVector(side, width / 2);
        const right = point.clone().addScaledVector(side, -width / 2);

        positions.push(left.x, 0, left.z);
        positions.push(right.x, 0, right.z);

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
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(uvs, 2)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}


export function createRoad(scene) {

    const roadWidth = 2.8;

    // These points follow exactly the places you marked:
    // start -> playground enter -> playground leave ->
    // beside 2nd pond -> near left top ->
    // beside 1st pond -> end
    // Extra helper points are added only to keep the curve smooth.
    const roadCurve = new THREE.CatmullRomCurve3(
        [
            new THREE.Vector3(-1.99, 0, 24.33),   // Starting position of road

            new THREE.Vector3(3.50, 0, 23.40),
            new THREE.Vector3(7.50, 0, 22.10),
            new THREE.Vector3(10.88, 0, 20.54),   // Playground entering

            new THREE.Vector3(15.20, 0, 16.20),
            new THREE.Vector3(18.40, 0, 13.20),
            new THREE.Vector3(20.81, 0, 11.00),   // Playground leaving

            new THREE.Vector3(19.80, 0, 4.50),
            new THREE.Vector3(17.80, 0, -2.50),
            new THREE.Vector3(14.80, 0, -8.50),
            new THREE.Vector3(10.98, 0, -11.99),  // Beside 2nd pond (right side)

            new THREE.Vector3(4.00, 0, -13.60),
            new THREE.Vector3(-4.50, 0, -14.80),
            new THREE.Vector3(-12.00, 0, -14.70),
            new THREE.Vector3(-17.48, 0, -13.83), // Near the left top position

            new THREE.Vector3(-18.20, 0, -6.50),
            new THREE.Vector3(-17.90, 0, 1.20),
            new THREE.Vector3(-16.60, 0, 8.50),
            new THREE.Vector3(-13.93, 0, 13.82),  // Beside 1st pond (left side)

            new THREE.Vector3(-11.50, 0, 16.80),
            new THREE.Vector3(-8.80, 0, 18.90),
            new THREE.Vector3(-5.01, 0, 19.77)    // End of road position
        ],
        false,
        "catmullrom",
        0.25
    );


    const road = new THREE.Mesh(
        createRoadGeometry(roadCurve, roadWidth, 300),
        new THREE.MeshStandardMaterial({
            map: createPathTexture(),
            roughness: 0.95
        })
    );

    road.position.y = 0.02; // a bit above grass
    road.receiveShadow = true;

    scene.add(road);

    return { road };
}