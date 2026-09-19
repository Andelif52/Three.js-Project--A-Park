import * as THREE from "three";
import { createPark } from "./park.js";
import { setupControls } from "./controls.js";
import { loadLeafShaders, createTrees } from "./tree.js";
import { createPetals } from "./petals.js";
import { createSun } from "./sun.js";
// ---------- Scene ----------

const scene = new THREE.Scene();

const skyColor = new THREE.Color(0xcfe6ee);
scene.background = skyColor;
scene.fog = new THREE.Fog(skyColor, 30, 85); // starts fading at 30, fully hidden at 85


// ---------- Camera ----------

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

camera.position.set(0, 6, 14);


// ---------- Renderer ----------

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);


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
// ---------- Trees ----------

const leafShaders = await loadLeafShaders();
const trees = createTrees(scene, leafShaders);
const petals = createPetals(scene, trees.placements);
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
    sun.update(delta);
    trees.update(elapsed, sunlight, hemiLight);
    petals.update(delta, elapsed, trees.leafMaterial.uniforms.uSeason.value);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


// ---------- Resize ----------

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});