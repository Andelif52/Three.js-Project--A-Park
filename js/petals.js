import * as THREE from "three";
import { createPetalTexture } from "./textures.js";


export function createPetals(scene, trees, count = 400) {

    const geometry = new THREE.PlaneGeometry(0.12, 0.12);

    const material = new THREE.MeshStandardMaterial({
        map: createPetalTexture(),
        color: 0xffffff,
        vertexColors: false,
        side: THREE.DoubleSide,
        alphaTest: 0.4,
        roughness: 0.8
    });

    const mesh = new THREE.InstancedMesh(
        geometry,
        material,
        count
    );

    mesh.frustumCulled = false;
    scene.add(mesh);


    const dummy = new THREE.Object3D();
    const petals = [];

    const pinkPetalColor = new THREE.Color(0xff99bb);
    const greenPetalColor = new THREE.Color(0x66cc66);


    // Place a petal inside a random tree's canopy
    function resetPetal(petal, anyHeight) {

        const tree =
            trees[Math.floor(Math.random() * trees.length)];


        const treeX = tree.position.x;
        const treeZ = tree.position.z;
        const treeSize = tree.scale.x;


        // Remember which tree this petal belongs to
        petal.tree = tree;


        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 1.6 * treeSize;
        const canopyTop = 3.4 * treeSize;


        petal.x = treeX + Math.cos(angle) * distance;
        petal.z = treeZ + Math.sin(angle) * distance;
        petal.y = anyHeight
            ? Math.random() * canopyTop
            : canopyTop;


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

    function update(delta, elapsed) {


        for (let i = 0; i < count; i++) {

            const p = petals[i];


            // Fall
            p.y -= p.fallSpeed * delta;


            // Wind movement
            p.x +=
                (Math.sin(elapsed * p.swaySpeed + p.swayPhase) * 0.4 + 0.15)
                * delta;


            p.z +=
                Math.cos(elapsed * p.swaySpeed * 0.7 + p.swayPhase)
                * 0.3
                * delta;


            // Rotation
            p.rotX += p.spinX * delta;
            p.rotY += p.spinY * delta;



            // Reset after reaching ground
            if (p.y < 0.05) {

                resetPetal(p, false);

            }



            dummy.position.set(
                p.x,
                p.y,
                p.z
            );


            dummy.rotation.set(
                p.rotX,
                p.rotY,
                0
            );


            dummy.scale.setScalar(
                p.size
            );


            dummy.updateMatrix();


            mesh.setMatrixAt(
                i,
                dummy.matrix
            );



            // Match petal color with its tree
            mesh.setColorAt(
                i,
                p.tree.userData.colorChanged
                    ? greenPetalColor
                    : pinkPetalColor
            );

        }


        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;

    }


    return { update };
}