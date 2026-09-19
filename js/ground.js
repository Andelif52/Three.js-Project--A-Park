import * as THREE from "three";
import { grassTexture, pathTexture } from "./textures.js";

export function createGround(scene) {

    // Grass
    const grass = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshStandardMaterial({ map: grassTexture() })
    );
    grass.rotation.x = -Math.PI / 2;   // lay it flat
    grass.receiveShadow = true;
    scene.add(grass);

    // Straight path leading to the bench
    const path = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 26),
        new THREE.MeshStandardMaterial({ map: pathTexture(1, 10) })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, 16);    // slightly above grass to avoid flicker
    path.receiveShadow = true;
    scene.add(path);

    // Round paved area where the bench stands
    const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(4, 48),
        new THREE.MeshStandardMaterial({ map: pathTexture(3, 3) })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.03;           // slightly above the path
    plaza.receiveShadow = true;
    scene.add(plaza);
}