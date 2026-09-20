import * as THREE from "three";
import { GLTFLoader } from
    "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";


export function createGate(scene) {

    const loader = new GLTFLoader();


    loader.load(

        new URL("../models/gate.glb", import.meta.url).href,


        (gltf) => {

            const gate = gltf.scene;


            const root = gate.getObjectByName("RootNode");


            if (root) {

                // Hide all 9 gate sets
                root.children.forEach((child) => {

                    child.visible = false;

                });


                // Select the gate we want
                const selectedGate = [
                    "Gate_1_1",
                    "Gate_1_2",
                    "Pillar_1_Gate_1",
                    "Pillar_2_Gate_1"
                ];


                root.children.forEach((child) => {

                    if (selectedGate.includes(child.name)) {

                        child.visible = true;

                    }

                });

            }


            gate.position.set(
                0,
                0,
                30
            );


            gate.scale.set(
                3.1,
                2,
                3
            );


            gate.rotation.y = Math.PI;



            gate.traverse((child) => {

                if (child.isMesh) {

                    child.castShadow = true;
                    child.receiveShadow = true;

                }

            });


            scene.add(gate);


            console.log("Gate loaded");

        },


        undefined,


        (error) => {

            console.error(
                "Gate loading error:",
                error
            );

        }

    );

}