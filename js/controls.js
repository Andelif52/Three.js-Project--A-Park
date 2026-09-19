import * as THREE from "three";

const keys = {};

window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });


export function setupControls(camera, target = new THREE.Vector3(0, 1, 0)) {

    // Describe the camera position as distance + two angles around the target
    const offset = new THREE.Vector3().subVectors(camera.position, target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    const rotateSpeed = 1.2; // radians per second
    const zoomSpeed = 8;     // units per second
    const tiltSpeed = 0.8;   // radians per second

    function update(delta) {

        if (keys["KeyA"]) spherical.theta -= rotateSpeed * delta;
        if (keys["KeyD"]) spherical.theta += rotateSpeed * delta;

        if (keys["KeyW"]) spherical.radius -= zoomSpeed * delta;
        if (keys["KeyS"]) spherical.radius += zoomSpeed * delta;

        if (keys["KeyQ"]) spherical.phi -= tiltSpeed * delta;
        if (keys["KeyE"]) spherical.phi += tiltSpeed * delta;

        // Limits: not too close, not too far, never below the ground
        spherical.radius = THREE.MathUtils.clamp(spherical.radius, 4, 40);
        spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.2, 1.45);

        offset.setFromSpherical(spherical);
        camera.position.copy(target).add(offset);
        camera.lookAt(target);
    }

    update(0); // apply once so the camera starts looking at the target

    return { update };
}