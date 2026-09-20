import * as THREE from "three";


// ---------- Shared brick texture ----------

const textureLoader = new THREE.TextureLoader();

const brickTexture = textureLoader.load(
    new URL("../textures/brick_wall2.jpg", import.meta.url).href
);

brickTexture.colorSpace = THREE.SRGBColorSpace;
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;


// Create one wall material with its own repeat settings
function createBrickMaterial(repeatX, repeatY) {
    const map = brickTexture.clone();
    map.needsUpdate = true;
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeatX, repeatY);

    return new THREE.MeshStandardMaterial({
        map,
        roughness: 0.9
    });
}


function createWall(width, height, depth, x, y, z) {

    // Use width for long horizontal walls, depth for side walls
    const horizontalLength = Math.max(width, depth);

    const material = createBrickMaterial(
        horizontalLength / 1.5,
        height / 2
    );

    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
}



export function createWalls(scene) {

    const group = new THREE.Group();

    const size = 60;
    const height = 4;
    const thickness = 0.4;


    // Back wall
    group.add(
        createWall(
            size,
            height,
            thickness,
            0,
            height / 2,
            -size / 2
        )
    );


    // Left wall
    group.add(
        createWall(
            thickness,
            height,
            size,
            -size / 2,
            height / 2,
            0
        )
    );


    // Right wall
    group.add(
        createWall(
            thickness,
            height,
            size,
            size / 2,
            height / 2,
            0
        )
    );


    // Front wall left side
    group.add(
        createWall(
            22,
            height,
            thickness,
            -19,
            height / 2,
            size / 2
        )
    );


    // Front wall right side
    group.add(
        createWall(
            22,
            height,
            thickness,
            19,
            height / 2,
            size / 2
        )
    );


    scene.add(group);




    return group;
}