import * as THREE from "three";
import { createIronTexture } from "./textures.js";



// ---------- Single Lamp ----------

function createSingleLamp() {

    const lamp = new THREE.Group();


    const iron = new THREE.MeshStandardMaterial({

        map: createIronTexture(),
        roughness: 0.55,
        metalness: 0.3

    });



    const parts = [

        [
            new THREE.CylinderGeometry(
                0.16,
                0.2,
                0.15,
                16
            ),
            0.075
        ],

        [
            new THREE.CylinderGeometry(
                0.05,
                0.07,
                2.6,
                16
            ),
            1.45
        ],

        [
            new THREE.CylinderGeometry(
                0.12,
                0.08,
                0.1,
                16
            ),
            2.8
        ],

        [
            new THREE.ConeGeometry(
                0.22,
                0.18,
                16
            ),
            3.13
        ]

    ];



    for (const [geometry, y] of parts) {

        const mesh = new THREE.Mesh(
            geometry,
            iron
        );

        mesh.position.y = y;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        lamp.add(mesh);

    }



    const bulb = new THREE.Mesh(

        new THREE.SphereGeometry(
            0.13,
            16,
            16
        ),

        new THREE.MeshStandardMaterial({

            color: 0xfff1d0,

            emissive: 0xffc97a,

            emissiveIntensity: 0.8

        })

    );


    bulb.position.y = 2.95;

    lamp.add(bulb);


    // Real light source

    const light = new THREE.PointLight(
        0xffdca8,
        0,
        8,
        2
    );

    light.position.y = 2.95;

    light.castShadow = false;

    light.shadow.mapSize.set(512, 512);

    lamp.add(light);

    lamp.userData.lampLight = light;


    return lamp;

}




// ---------- Lamps ----------

export function createLamps(scene) {


    // Lamp positions: [x, z, size, rotation]

    const placements = [

        // Add lamps here

        [4.53, 20.95, 1.0, 0],

        [-2.35, 14.04, 1.0, 0],

        [14.74, 9.06, 1.0, 0],

        [-13.80, 2.86, 1.0, 0],

        [18, -8, 1.0, 0],

        [9.11, 13.71, 1.0, 0],

        [7.51, 24.61, 1.0, 0],

        [-4.86, 25.71, 1.0, 0],

        [-10.76, 20.54, 1.0, 0],

        [1.11, 17.05, 1.0, 0],

        [-10.05, 13.43, 1.0, 0],

        [-19.89, 3.91, 1.0, 0],

        [-14.80, -7.47, 1.0, 0],

        [-20.43, -5.08, 1.0, 0],

        [-20.15, -13.32, 1.0, 0],

        [-18.12, 11.86, 1.0, 0],

        [-15.25, -16.72, 1.0, 0],

        [-10.61, -11.58, 1.0, 0],

        [-8.32, -17.16, 1.0, 0],

        [-4.26, -11.68, 1.0, 0],

        [2.26, -16.39, 1.0, 0],

        [3.16, -11.28, 1.0, 0],

        [10.1, -9.65, 1.0, 0],

        [11.47, -15.24, 1.0, 0],

        [-14.30, -3.05, 1.0, 0],

        [22.43, -1.27, 1.0, 0],

        [-14.19, -3.52, 1.0, 0],

        [23.44, 5.82, 1.0, 0],

        [13.87, -3.75, 1.0, 0],

        [16.74, 4.37, 1.0, 0],

        [25.8, 13.73, 1.0, 0],

        [24.74, 23.97, 1.0, 0],

        [15.81, 26.65, 1.0, 0],

        [-0.02, 7.96, 1.0, 0],

        [5.77, 9.23, 1.0, 0],

        [1.91, -0.26, 1.0, 0],
    ];

    console.log(placements.length)

    const lamps = [];
    const lampLights = [];


    for (const [x, z, size, rotation] of placements) {


        const lamp = createSingleLamp();
        lampLights.push(
            lamp.userData.lampLight
        );


        lamp.position.set(
            x,
            0,
            z
        );


        lamp.scale.setScalar(size);


        lamp.rotation.y = rotation;


        scene.add(lamp);

        lamps.push(lamp);

    }


    function update(isNight) {

        const targetIntensity = isNight ? 4 : 0;

        for (const light of lampLights) {
            light.intensity = THREE.MathUtils.lerp(
                light.intensity,
                targetIntensity,
                0.05
            );
        }

    }


    return {
        lamps,
        lampLights,
        placements,
        update
    };

}