import * as THREE from "three";
import { GLTFLoader } from
    "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";


export function createFish(scene) {

    const loader = new GLTFLoader();

    const fishes = [];


    // Pond information
    const ponds = [

        {
            x: -19,
            z: 19,
            radius: 4.2
        },


        {
            x: 20,
            z: -16,
            radius: 5.5
        }

    ];



    loader.load(

        new URL(
            "../models/fish1.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const model = gltf.scene;



            for (let i = 0; i < ponds.length; i++) {


                const pond = ponds[i];


                for (let j = 0; j < 10; j++) {


                    const fish = model.clone(true);



                    // fish size

                    fish.scale.setScalar(0.1);



                    fish.traverse((child) => {

                        if (child.isMesh) {

                            child.castShadow = true;
                            child.receiveShadow = true;

                        }

                    });



                    // ---------- Animation ----------


                    const mixer =
                        new THREE.AnimationMixer(fish);



                    const swimClip =
                        gltf.animations.find(

                            clip =>
                                clip.name
                                    .toLowerCase()
                                    .includes("swim slow")

                        );



                    if (swimClip) {


                        const action =
                            mixer.clipAction(swimClip);


                        action.play();


                        action.time =
                            Math.random()
                            *
                            swimClip.duration;


                    }




                    // ---------- Random starting position ----------


                    const angle =
                        Math.random()
                        *
                        Math.PI
                        *
                        2;



                    const distance =
                        Math.random()
                        *
                        pond.radius
                        *
                        0.6;



                    fish.position.set(

                        pond.x +
                        Math.cos(angle)
                        *
                        distance,


                        // underwater

                        0.15,


                        pond.z +
                        Math.sin(angle)
                        *
                        distance

                    );





                    // random swimming direction


                    const direction =
                        new THREE.Vector3(

                            Math.random() - 0.5,

                            0,

                            Math.random() - 0.5

                        ).normalize();




                    fish.rotation.y =
                        Math.atan2(

                            direction.x,

                            direction.z

                        );



                    scene.add(fish);




                    fishes.push({

                        mesh: fish,

                        mixer: mixer,

                        pond: pond,

                        velocity: direction,

                        // different speed for each fish

                        speed:
                            0.4 +
                            Math.random() * 0.5,



                        // different wandering amount

                        wanderStrength:
                            0.002 +
                            Math.random() * 0.004
                    });
                }
            }
        }
    );



    function update(delta) {



        for (const fish of fishes) {



            // animation update

            fish.mixer.update(delta);

            // move forward

            fish.mesh.position.addScaledVector(

                fish.velocity,

                fish.speed * delta

            );

            // ---------- Pond boundary ----------


            const dx =
                fish.mesh.position.x -
                fish.pond.x;


            const dz =
                fish.mesh.position.z -
                fish.pond.z;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dz * dz
                );



            if (distance > fish.pond.radius) {


                const returnDirection =
                    new THREE.Vector3(

                        fish.pond.x - fish.mesh.position.x,

                        0,

                        fish.pond.z - fish.mesh.position.z

                    ).normalize();



                fish.velocity.lerp(

                    returnDirection,

                    delta * 4

                ).normalize();



                // keep fish inside water

                fish.mesh.position.x =
                    fish.pond.x +
                    (fish.mesh.position.x - fish.pond.x)
                    *
                    (fish.pond.radius / distance);



                fish.mesh.position.z =
                    fish.pond.z +
                    (fish.mesh.position.z - fish.pond.z)
                    *
                    (fish.pond.radius / distance);


            }
            else {



                // random swimming changes

                fish.velocity.x +=

                    (Math.random() - 0.5)
                    *
                    fish.wanderStrength;



                fish.velocity.z +=

                    (Math.random() - 0.5)
                    *
                    fish.wanderStrength;



                fish.velocity.normalize();
            }

            // underwater movement
            fish.mesh.position.y =

                0.01;


            // rotate fish toward movement direction

            const targetRotation =

                Math.atan2(

                    fish.velocity.x,

                    fish.velocity.z
                );


            fish.mesh.rotation.y =

                THREE.MathUtils.lerp(

                    fish.mesh.rotation.y,

                    targetRotation,

                    delta * 2

                );

        }

    }




    return {

        update

    };


}