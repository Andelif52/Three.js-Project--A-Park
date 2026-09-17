import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";


export function createPark(scene){


    // Ground

    const groundGeometry =
    new THREE.PlaneGeometry(
        50,
        50
    );


    const groundMaterial =
    new THREE.MeshStandardMaterial({
        color:0x228B22
    });


    const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );


    ground.rotation.x =
    -Math.PI/2;


    ground.receiveShadow=true;


    scene.add(ground);




    // Bench placeholder

    const benchSeat =
    new THREE.Mesh(
        new THREE.BoxGeometry(4,0.3,1),
        new THREE.MeshStandardMaterial({
            color:0x8B4513
        })
    );


    benchSeat.position.y=1;

    scene.add(benchSeat);



    // Tree placeholders


    for(let i=0;i<5;i++){

        let trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.3,
                0.5,
                3
            ),
            new THREE.MeshStandardMaterial({
                color:0x8B4513
            })
        );


        trunk.position.set(
            i*3-6,
            1.5,
            -5
        );


        scene.add(trunk);



        let leaves =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.5,
                32,
                32
            ),
            new THREE.MeshStandardMaterial({
                color:0x006400
            })
        );


        leaves.position.set(
            i*3-6,
            4,
            -5
        );


        scene.add(leaves);

    }


}