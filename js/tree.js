import * as THREE from "three";
import { createBarkTexture, createLeafTexture } from "./textures.js";

// ---------- Load the shader files as text ----------

export async function loadLeafShaders() {
    const [vertexShader, fragmentShader] = await Promise.all([
        fetch(new URL("./shaders/leafVertex.glsl", import.meta.url)).then((r) => r.text()),
        fetch(new URL("./shaders/leafFragment.glsl", import.meta.url)).then((r) => r.text())
    ]);

    return { vertexShader, fragmentShader };
}


// ---------- Trees ----------

export function createTrees(scene, shaders) {

    const leafTexture = createLeafTexture();

    function createLeafMaterial() {
        return new THREE.ShaderMaterial({
            vertexShader: shaders.vertexShader,
            fragmentShader: shaders.fragmentShader,
            uniforms: {
                ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), // fog support
                uTime: { value: 0 },
                uSeason: { value: 0 },
                uLeafTexture: { value: leafTexture },
                uSunDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                uSunColor: { value: new THREE.Color() },
                uSkyColor: { value: new THREE.Color() },
                uGroundColor: { value: new THREE.Color() },

                // mouse-click color change
                uClickColor: { value: new THREE.Color(0x66cc66) }, // green
                uClickMix: { value: 0.0 } // 0 = normal seasonal color, 1 = clicked color
            },
            fog: true
        });
    }

    const barkMaterial = new THREE.MeshStandardMaterial({
        map: createBarkTexture(),
        roughness: 0.95
    });

    // Shared shapes (reused by every tree)
    const trunkGeometry = new THREE.CylinderGeometry(0.22, 0.35, 3, 12);
    const leafGeometry = new THREE.SphereGeometry(1, 24, 16);

    // Canopy blobs: [x, y, z, radius]
    const blobs = [
        [0, 3.6, 0, 1.6],
        [0.9, 3.2, 0.3, 1.1],
        [-0.8, 3.3, -0.2, 1.2],
        [0.2, 4.4, -0.3, 1.1],
        [-0.3, 3.1, 0.9, 1.0],
        [0.4, 3.2, -0.9, 1.0]
    ];

    // Tree positions: [x, z, size]
    const placements = [
        [-7, -4, 1.1],
        [6.5, -5, 1.0],
        [-9, 5, 1.2],
        [-4, -9, 0.9],
        [4, -10, 1.3],
        [-12, -2, 1.0],
        [12, -6, 1.1],
        [-8, 13, 1.0],
        [-13, 9, 1.2],
        [0, -13, 1.1]
    ];

    const leafMaterials = [];
    const trees = [];

    for (const [x, z, size] of placements) {
        const tree = new THREE.Group();

        const leafMaterial = createLeafMaterial();
        leafMaterials.push(leafMaterial);

        tree.userData.isTree = true;
        tree.userData.leafMaterial = leafMaterial;
        tree.userData.colorChanged = false;

        const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);

        for (const [bx, by, bz, radius] of blobs) {
            const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
            leaves.position.set(bx, by, bz);
            leaves.scale.setScalar(radius);
            leaves.castShadow = true;

            // mark these meshes so raycasting can detect them
            leaves.userData.isLeaf = true;
            leaves.userData.treeRef = tree;

            tree.add(leaves);
        }

        tree.position.set(x, 0, z);
        tree.scale.setScalar(size);
        tree.rotation.y = Math.random() * Math.PI * 2;
        scene.add(tree);
        trees.push(tree);
    }


    // ---------- Mouse interaction helper ----------

    function toggleTreeLeafColor(tree) {
        const material = tree.userData.leafMaterial;
        tree.userData.colorChanged = !tree.userData.colorChanged;
        material.uniforms.uClickMix.value = tree.userData.colorChanged ? 1.0 : 0.0;
    }


    // ---------- Per-frame updates ----------

    const seasonSpeed = 0.05; // 0.05 = one full year every 20 seconds

    function update(elapsed, sunlight, hemiLight) {
        const seasonValue = (elapsed * seasonSpeed) % 1;

        for (const material of leafMaterials) {
            const u = material.uniforms;

            u.uTime.value = elapsed;
            u.uSeason.value = seasonValue;

            // Direction from the scene toward the sun
            u.uSunDirection.value
                .copy(sunlight.position)
                .sub(sunlight.target.position)
                .normalize();

            // Light colors multiplied by their brightness
            u.uSunColor.value.copy(sunlight.color).multiplyScalar(sunlight.intensity);
            u.uSkyColor.value.copy(hemiLight.color).multiplyScalar(hemiLight.intensity);
            u.uGroundColor.value.copy(hemiLight.groundColor).multiplyScalar(hemiLight.intensity);
        }
    }

    return { update, placements, trees, toggleTreeLeafColor, leafMaterial: leafMaterials[0] };
}