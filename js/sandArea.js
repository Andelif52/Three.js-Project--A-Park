import * as THREE from "three";


export function createSandArea(scene) {


    const sand = new THREE.Mesh(

        new THREE.CircleGeometry(
            12,
            64
        ),

        new THREE.MeshStandardMaterial({

            color: 0xd8c28f,
            roughness: 1

        })

    );


    sand.rotation.x = -Math.PI / 2;


    sand.position.set(

        18,
        0.015,
        5

    );


    sand.receiveShadow = true;


    scene.add(sand);


}