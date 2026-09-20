import * as THREE from "three";


export function setupControls(camera, domElement, target, sun) {

    const keys = {};

    const moveSpeed = 8;
    const lookSpeed = 0.0025;


    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.clone();


    let dragging = false;
    let lastX = 0;
    let lastY = 0;


    let yaw = camera.rotation.y;
    let pitch = camera.rotation.x;


    const euler = new THREE.Euler(
        0,
        0,
        0,
        "YXZ"
    );


    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();



    // ---------- Keyboard ----------

    window.addEventListener("keydown", (e) => {

        keys[e.code] = true;


        if (e.repeat) return;


        if (e.code === "KeyR") {

            camera.position.copy(startPosition);
            camera.rotation.copy(startRotation);

            yaw = camera.rotation.y;
            pitch = camera.rotation.x;

        }


        if (e.code === "ArrowUp") {

            sun.speedMultiplier = Math.min(
                sun.speedMultiplier * 2,
                16
            );

        }


        if (e.code === "ArrowDown") {

            sun.speedMultiplier = Math.max(
                sun.speedMultiplier / 2,
                0.125
            );

        }


        if (e.code === "KeyH") {

            document.getElementById("help")
                ?.classList.toggle("hidden");

        }

    });



    window.addEventListener("keyup", (e) => {

        keys[e.code] = false;

    });



    // ---------- Mouse look ----------

    domElement.addEventListener("pointerdown", (e) => {

        dragging = true;

        lastX = e.clientX;
        lastY = e.clientY;

        domElement.setPointerCapture(e.pointerId);

    });



    domElement.addEventListener("pointermove", (e) => {

        if (!dragging) return;


        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;


        yaw -= dx * lookSpeed;
        pitch -= dy * lookSpeed;


        // prevent flipping and strange tilting
        pitch = THREE.MathUtils.clamp(
            pitch,
            -1.3,
            1.3
        );


        lastX = e.clientX;
        lastY = e.clientY;

    });



    domElement.addEventListener("pointerup", () => {

        dragging = false;

    });



    // ---------- Movement ----------

    function update(delta) {


        // Apply camera rotation using quaternion
        euler.set(
            pitch,
            yaw,
            0
        );

        camera.quaternion.setFromEuler(euler);



        // Forward direction
        camera.getWorldDirection(direction);

        direction.y = 0;
        direction.normalize();



        // Right direction
        right.crossVectors(
            direction,
            camera.up
        ).normalize();



        if (keys["KeyW"]) {

            camera.position.addScaledVector(
                direction,
                moveSpeed * delta
            );

        }


        if (keys["KeyS"]) {

            camera.position.addScaledVector(
                direction,
                -moveSpeed * delta
            );

        }


        if (keys["KeyA"]) {

            camera.position.addScaledVector(
                right,
                -moveSpeed * delta
            );

        }


        if (keys["KeyD"]) {

            camera.position.addScaledVector(
                right,
                moveSpeed * delta
            );

        }


        if (keys["KeyQ"]) {

            camera.position.y -= moveSpeed * delta;

        }


        if (keys["KeyE"]) {

            camera.position.y += moveSpeed * delta;

        }



        // keep camera above ground

        camera.position.y = Math.max(
            camera.position.y,
            1
        );

    }


    update(0);


    return { update };

}