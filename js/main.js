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
);

camera.position.set(0, 10, 50);


// ---------- Renderer ----------

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);



createPositionPicker(
    scene,
    camera,
    renderer
);


// ---------- Lighting ----------

// Soft fill light: sky tone from above, grass tone from below
const hemiLight = new THREE.HemisphereLight(0xdcefff, 0x5b7a3a, 1.4);
scene.add(hemiLight);

// Sun
const sunlight = new THREE.DirectionalLight(0xfff0d6, 2.8);
sunlight.position.set(15, 20, 10);
sunlight.castShadow = true;

sunlight.shadow.mapSize.set(2048, 2048);

const shadowCam = sunlight.shadow.camera;
shadowCam.left = -30;
shadowCam.right = 30;
shadowCam.top = 30;
shadowCam.bottom = -30;
shadowCam.near = 1;
shadowCam.far = 80;
shadowCam.updateProjectionMatrix();

sunlight.shadow.bias = -0.0005;     // prevents stripy "shadow acne"
sunlight.shadow.normalBias = 0.02;

scene.add(sunlight);
scene.add(sunlight.target); // the point the sun shines toward (origin)

// Uncomment to see the shadow area as a wireframe box while debugging:
// scene.add(new THREE.CameraHelper(shadowCam));


// ---------- Park ----------

const park = createPark(scene);
const playground = createPlayground(scene);
createRoad(scene);
//const pond = createPond(scene);
// ---------- Trees ----------

const leafShaders = await loadLeafShaders();
const trees = createTrees(scene, leafShaders);

// ---------- Leaf click interaction ----------

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let pointerDownX = 0;
let pointerDownY = 0;
let dragged = false;


renderer.domElement.addEventListener("pointerdown", (event) => {

    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
    dragged = false;

});


renderer.domElement.addEventListener("pointermove", (event) => {

    const dx = event.clientX - pointerDownX;
    const dy = event.clientY - pointerDownY;

    if (Math.sqrt(dx * dx + dy * dy) > 5) {
        dragged = true;
    }

});


renderer.domElement.addEventListener("pointerup", (event) => {

    // Ignore camera dragging
    if (dragged) return;


    const rect = renderer.domElement.getBoundingClientRect();


    mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);


    const intersects = raycaster.intersectObjects(
        scene.children,
        true
    );


    for (const hit of intersects) {

        if (hit.object.userData.isLeaf) {

            const tree = hit.object.userData.treeRef;

            trees.toggleTreeLeafColor(tree);

            break;
        }

    }

});



const petals = createPetals(scene, trees.trees);
// ---------- Sun ----------

const sun = createSun(scene, sunlight, hemiLight);
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
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.elapsedTime;

    controls.update(delta);
    park.update(delta, elapsed);
    playground.update(elapsed);
    sun.update(delta);
    trees.update(elapsed, sunlight, hemiLight);
    petals.update(delta, elapsed);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


// ---------- Resize ----------

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});