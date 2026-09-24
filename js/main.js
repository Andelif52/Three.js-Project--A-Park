import * as THREE from "three";
import { createPark } from "./park.js";
import { setupControls } from "./controls.js";
import { loadLeafShaders, createTrees } from "./tree.js";
import { createPetals } from "./petals.js";
import { createSun } from "./sun.js";
import { createPlayground } from "./playground.js";
import { setupMusic } from "./music.js";
import { createPond } from "./pond.js";
import { createRoad } from "./road.js";
import { createPositionPicker } from "./positionPicker.js";

// ---------- Music ----------

setupMusic();
// ---------- Scene ----------
const scene = new THREE.Scene();

const skyColor = new THREE.Color(0xcfe6ee);
scene.background = skyColor;
scene.fog = new THREE.Fog(skyColor, 30, 85); // starts fading at 30, fully hidden at 85

// const grid = new THREE.GridHelper(70, 70, 0x444444, 0x888888);
// grid.position.y = 0.05; // slightly above ground
// scene.add(grid);

// const axes = new THREE.AxesHelper(5);
// scene.add(axes);


// ---------- Camera ----------

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
); // fov, aspect, near, far

camera.position.set(0, 10, 50); // initial position, will be overridden by controls


// ---------- Renderer ----------

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight); // full window size
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // prevents excessive pixel ratio on very high DPI screens

renderer.shadowMap.enabled = true; //Enables shadows.
renderer.shadowMap.type = THREE.PCFSoftShadowMap; //Uses soft shadow filtering.

document.body.appendChild(renderer.domElement); //Uses soft shadow filtering.



createPositionPicker(
    scene,
    camera,
    renderer
);


// ---------- Lighting ----------

// Soft fill light: sky tone from above, grass tone from below
const hemiLight = new THREE.HemisphereLight(0xdcefff, 0x5b7a3a, 1.4); // sky color, ground color, intensity
scene.add(hemiLight); // ambient light from sky and ground

// Sun
const sunlight = new THREE.DirectionalLight(0xfff0d6, 2.8); // color, intensity
sunlight.position.set(15, 20, 10); 
sunlight.castShadow = true; // enables shadows from the sun

sunlight.shadow.mapSize.set(2048, 2048); // higher resolution shadow map for better quality shadows

const shadowCam = sunlight.shadow.camera; // the camera that defines the area where shadows are calculated
shadowCam.left = -30; // defines the left boundary of the shadow camera's view frustum
shadowCam.right = 30;
shadowCam.top = 30;
shadowCam.bottom = -30;
shadowCam.near = 1;
shadowCam.far = 80;
shadowCam.updateProjectionMatrix(); // updates the shadow camera's projection matrix after changing its properties

sunlight.shadow.bias = -0.0005;     // prevents stripy "shadow acne"
sunlight.shadow.normalBias = 0.02;// reduces self-shadowing artifacts on sloped surfaces

scene.add(sunlight);
scene.add(sunlight.target); // the point the sun shines toward (origin)

// Uncomment to see the shadow area as a wireframe box while debugging:
// scene.add(new THREE.CameraHelper(shadowCam));

// ---------- Sun ----------

const sun = createSun(scene, sunlight, hemiLight); // create sun after trees so it can reference the trees for wind movement





// ---------- Park ----------

const park = await createPark(scene, sun); 
const playground = createPlayground(scene);
createRoad(scene);

// ---------- Trees ----------

const leafShaders = await loadLeafShaders(); // load leaf shaders before creating trees
const trees = createTrees(scene, leafShaders); 




// ---------- Leaf click interaction ----------

const raycaster = new THREE.Raycaster(); // used for detecting mouse clicks on leaves
const mouse = new THREE.Vector2(); // normalized device coordinates of the mouse click

let pointerDownX = 0;
let pointerDownY = 0;
let dragged = false;


renderer.domElement.addEventListener("pointerdown", (event) => {

    pointerDownX = event.clientX; // store the initial pointer down position
    pointerDownY = event.clientY; // store the initial pointer down position
    dragged = false; // reset dragged flag on pointer down

});


renderer.domElement.addEventListener("pointermove", (event) => {

    const dx = event.clientX - pointerDownX;
    const dy = event.clientY - pointerDownY;

    if (Math.sqrt(dx * dx + dy * dy) > 5) {
        dragged = true;
    }

});

// ---------- Leaf click interaction For Clicking Tree Leaves ----------
renderer.domElement.addEventListener("pointerup", (event) => { 

    // Ignore camera dragging
    if (dragged) return;


    const rect = renderer.domElement.getBoundingClientRect(); // get the size and position of the canvas relative to the viewport


    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // convert mouse x position to normalized device coordinates (-1 to +1)
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // convert mouse y position to normalized device coordinates (-1 to +1)


    raycaster.setFromCamera(mouse, camera); // update the raycaster to point from the camera through the mouse position

    // Check for intersections with objects in the scene
    const intersects = raycaster.intersectObjects(
        scene.children,
        true
    );

    // Check if any leaves were clicked
    for (const hit of intersects) {

        if (hit.object.userData.isLeaf) {

            const tree = hit.object.userData.treeRef;

            trees.toggleTreeLeafColor(tree);

            break;
        }

    }

});



const petals = createPetals(scene, trees.trees); // create petals after trees so they can reference the trees for wind movement

// ---------- Controls ----------
const controls = setupControls(
    camera,
    renderer.domElement,
    new THREE.Vector3(0, 0.6, 0), // orbit around the bench
    sun
);
// ---------- Animation loop ----------

const clock = new THREE.Clock();

function animate() {
    const delta = Math.min(clock.getDelta(), 0.1); // limit delta to avoid large jumps when switching tabs
    const elapsed = clock.elapsedTime; // total time since the clock started

    controls.update(delta); // update camera controls (orbit, pan, zoom) based on user input 
    park.update(delta, elapsed); // update park elements (grass, flowers, etc.) based on elapsed time
    playground.update(elapsed); // update playground elements (swing, slide, etc.) based on elapsed time
    sun.update(delta); // update sun position and lighting based on elapsed time
    trees.update(elapsed, sunlight, hemiLight); // update trees (leaves, branches, etc.) based on elapsed time and lighting
    petals.update(delta, elapsed); // update petals (falling, wind movement, etc.) based on elapsed time
    renderer.render(scene, camera); // render the scene from the perspective of the camera
}

renderer.setAnimationLoop(animate); // use setAnimationLoop for consistent frame rate and VR support


// ---------- Resize ----------

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // update camera projection matrix after changing aspect ratio
    renderer.setSize(window.innerWidth, window.innerHeight);
});