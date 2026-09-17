import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

import { createPark } from "./park.js";
import { setupControls } from "./controls.js";


// Scene

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// Camera

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);


camera.position.set(
    0,
    5,
    10
);


// Renderer

const renderer = new THREE.WebGLRenderer({
    antialias:true
});


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled = true;


document.body.appendChild(renderer.domElement);



// Lighting

const ambient = new THREE.AmbientLight(
    0xffffff,
    0.5
);

scene.add(ambient);



const sunlight = new THREE.DirectionalLight(
    0xffffff,
    1
);


sunlight.position.set(
    10,
    20,
    10
);


sunlight.castShadow=true;

scene.add(sunlight);




// Create park

const parkObjects = createPark(scene);



// Controls

setupControls(camera);




// Animation

function animate(){

    requestAnimationFrame(animate);


    // sunlight movement placeholder

    sunlight.position.x =
        Math.sin(Date.now()*0.001)*20;


    renderer.render(
        scene,
        camera
    );

}


animate();




// Resize

window.addEventListener(
"resize",
()=>{

camera.aspect =
window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);

});