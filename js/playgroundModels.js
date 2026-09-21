import * as THREE from "three";

import { GLTFLoader } from
    "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";



export function createPlaygroundModels(parent) {

    const loader = new GLTFLoader();

    const textureLoader = new THREE.TextureLoader();




    function prepareModel(model, scale, position, rotationY = 0) {


        model.scale.set(
            scale,
            scale,
            scale
        );


        model.position.set(
            position.x,
            position.y,
            position.z
        );


        model.rotation.y = rotationY;



        model.traverse((child) => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        });


        parent.add(model);

    }







    // ---------- Swing GLB ----------


    loader.load(

        new URL(
            "../models/Swing.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const swing = gltf.scene;


            prepareModel(

                swing,

                1.2,

                {
                    x: 6.5,
                    y: 0,
                    z: -1
                },

                Math.PI

            );


            console.log("Swing GLB loaded");


        }

    );









    // ---------- Piramidka GLB ----------


    loader.load(

        new URL(
            "../models/Piramidka.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const pyramid = gltf.scene;



            const pyramidTexture =
                textureLoader.load(

                    new URL(
                        "../textures/Toys_kraski_piramidka_BaseColor.png",
                        import.meta.url
                    ).href

                );



            pyramidTexture.flipY = false;



            pyramid.traverse((child) => {


                if (child.isMesh) {


                    child.material =
                        new THREE.MeshStandardMaterial({

                            map: pyramidTexture,
                            roughness: 0.8

                        });



                    child.castShadow = true;
                    child.receiveShadow = true;


                }


            });




            prepareModel(

                pyramid,

                6.0,

                {
                    x: -4.5,
                    y: 0.1,
                    z: 3
                },

                0

            );



            console.log("Piramidka GLB loaded");


        }

    );









    // ---------- Vedro (bucket) GLB ----------


    loader.load(

        new URL(
            "../models/Vedro.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const bucket = gltf.scene;



            const bucketTexture =
                textureLoader.load(

                    new URL(
                        "../textures/Vedro_vedro_BaseColor.png",
                        import.meta.url
                    ).href

                );



            bucketTexture.flipY = false;



            bucket.traverse((child) => {


                if (child.isMesh) {


                    child.material =
                        new THREE.MeshStandardMaterial({

                            map: bucketTexture,
                            roughness: 0.8

                        });



                    child.castShadow = true;
                    child.receiveShadow = true;


                }


            });



            prepareModel(

                bucket,

                2.5,

                {
                    x: -4,
                    y: 0.1,
                    z: 1
                },

                0

            );


            console.log("Vedro GLB loaded");


        }

    );


    // ---------- Gymnastic Wall Bar GLB ----------

    loader.load(

        new URL(
            "../models/gymnastic_wall_bar.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const wallBar = gltf.scene;



            wallBar.traverse((child) => {


                if (child.isMesh) {


                    child.material =
                        new THREE.MeshStandardMaterial({

                            color: 0xb8c8c8,
                            metalness: 0.4,
                            roughness: 0.6

                        });



                    child.castShadow = true;
                    child.receiveShadow = true;


                }


            });




            prepareModel(

                wallBar,

                1.7,

                {
                    x: 0,
                    y: 0,
                    z: 1
                },

                0

            );



            console.log("Gymnastic wall bar GLB loaded");


        },


        undefined,


        (error) => {

            console.error(
                "Gymnastic wall bar loading error:",
                error
            );

        }

    );







    // ---------- Climbing Frames GLB ----------


    loader.load(

        new URL(
            "../models/climbing_frames.glb",
            import.meta.url
        ).href,


        (gltf) => {


            const climbingFrames = gltf.scene;



            // debug size
            const box = new THREE.Box3()
                .setFromObject(climbingFrames);


            const size = new THREE.Vector3();

            box.getSize(size);


            console.log(
                "Climbing frame size:",
                size
            );



            climbingFrames.traverse((child) => {


                if (child.isMesh) {


                    child.material =
                        new THREE.MeshStandardMaterial({

                            color: 0xb8c8c8,
                            metalness: 0.3,
                            roughness: 0.7

                        });


                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            });



            prepareModel(

                climbingFrames,

                0.03,

                {
                    x: 10,
                    y: 0,
                    z: -2
                },

                0

            );



            console.log(
                "Climbing frames GLB loaded"
            );


        }

    );

}