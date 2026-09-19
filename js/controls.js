import * as THREE from "three";


export function setupControls(camera, domElement, target, sun) {

    const keys = {};

    // Camera position described as distance + two angles around the target
    const offset = new THREE.Vector3().subVectors(camera.position, target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const startView = spherical.clone(); // used by the reset key

    let autoOrbit = true;
    const autoOrbitSpeed = 0.15; // radians per second (about 40 s per circle)

    const rotateSpeed = 1.2;
    const zoomSpeed = 8;
    const tiltSpeed = 0.8;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;


    // ---------- Keyboard ----------

    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        if (e.repeat) return; // one action per press for the toggle keys

        if (e.code === "Space") {
            autoOrbit = !autoOrbit;
            e.preventDefault(); // stop the page from scrolling
        }

        if (e.code === "KeyR") {
            spherical.copy(startView);
        }

        if (e.code === "ArrowUp") {
            sun.speedMultiplier = Math.min(sun.speedMultiplier * 2, 16);
        }

        if (e.code === "ArrowDown") {
            sun.speedMultiplier = Math.max(sun.speedMultiplier / 2, 0.125);
        }

        if (e.code === "KeyH") {
            document.getElementById("help")?.classList.toggle("hidden");
        }
    });

    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });


    // ---------- Mouse ----------

    domElement.addEventListener("pointerdown", (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        domElement.setPointerCapture(e.pointerId);
    });

    domElement.addEventListener("pointermove", (e) => {
        if (!dragging) return;

        spherical.theta -= (e.clientX - lastX) * 0.005;
        spherical.phi -= (e.clientY - lastY) * 0.005;

        lastX = e.clientX;
        lastY = e.clientY;
    });

    domElement.addEventListener("pointerup", () => {
        dragging = false;
    });

    domElement.addEventListener("wheel", (e) => {
        spherical.radius += e.deltaY * 0.01;
        e.preventDefault(); // stop the page from scrolling
    }, { passive: false });


    // ---------- Per-frame update ----------

    function update(delta) {

        // Automatic orbit around the bench (paused while dragging)
        if (autoOrbit && !dragging) {
            spherical.theta += autoOrbitSpeed * delta;
        }

        // Keyboard adjustments on top of the orbit
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

    update(0);

    return { update };
}