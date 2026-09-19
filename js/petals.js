import * as THREE from "three";
import { createPetalTexture } from "./textures.js";


export function createPetals(scene, treePlacements, count = 400) {

    const geometry = new THREE.PlaneGeometry(0.12, 0.12);

    const material = new THREE.MeshStandardMaterial({
        map: createPetalTexture(),
        side: THREE.DoubleSide, // visible from both sides as it tumbles
        alphaTest: 0.4,         // cut away the transparent corners
        roughness: 0.8
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false; // petals are spread across the whole park
    scene.add(mesh);

    const dummy = new THREE.Object3D(); // helper for building each petal's matrix
    const petals = [];


    // Place a petal inside a random tree's canopy
    function resetPetal(petal, anyHeight) {
        const [treeX, treeZ, treeSize] =
            treePlacements[Math.floor(Math.random() * treePlacements.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 1.6 * treeSize;
        const canopyTop = 3.4 * treeSize;

        petal.x = treeX + Math.cos(angle) * distance;
        petal.z = treeZ + Math.sin(angle) * distance;
        petal.y = anyHeight ? Math.random() * canopyTop : canopyTop; // spread out at the start

        petal.fallSpeed = 0.3 + Math.random() * 0.4;
        petal.swayPhase = Math.random() * Math.PI * 2;
        petal.swaySpeed = 1 + Math.random() * 1.5;

        petal.rotX = Math.random() * Math.PI;
        petal.rotY = Math.random() * Math.PI;
        petal.spinX = (Math.random() - 0.5) * 4;
        petal.spinY = (Math.random() - 0.5) * 4;

        petal.size = 0.7 + Math.random() * 0.6;
    }

    for (let i = 0; i < count; i++) {
        const petal = {};
        resetPetal(petal, true);
        petals.push(petal);
    }


    // ---------- Per-frame updates ----------

    function update(delta, elapsed, season) {

        // 1 while the trees are pink, 0 while they are green
               // 1 while the trees are pink, 0 while they are green
        const bloom = 1; // trees are always pink, so petals always fall

        for (let i = 0; i < count; i++) {
            const p = petals[i];

            // Fall, sway side to side, and drift with a light breeze
            p.y -= p.fallSpeed * delta;
            p.x += (Math.sin(elapsed * p.swaySpeed + p.swayPhase) * 0.4 + 0.15) * delta;
            p.z += Math.cos(elapsed * p.swaySpeed * 0.7 + p.swayPhase) * 0.3 * delta;

            // Tumble
            p.rotX += p.spinX * delta;
            p.rotY += p.spinY * delta;

            // Back to the top of a tree after landing
            if (p.y < 0.05) resetPetal(p, false);

            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.set(p.rotX, p.rotY, 0);
            dummy.scale.setScalar(p.size * bloom);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    return { update };
}