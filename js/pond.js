import * as THREE from "three";


// ---------- Helper ----------

function createRock(material, x, y, z, scale) {

    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35, 0),
        material
    );

    rock.position.set(x, y, z);

    rock.scale.set(
        scale,
        scale * 0.7,
        scale
    );

    rock.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );

    rock.castShadow = true;
    rock.receiveShadow = true;

    return rock;
}



// ---------- Pond ----------

export function createPond(scene, position = { x: -15, z: 8 }) {

    const pond = new THREE.Group();


    // Position of pond
    pond.position.set(
        position.x,
        0,
        position.z
    );

    
    pond.scale.setScalar(position.scale ?? 1);

    // ---------- Outer muddy edge ----------

    const mudMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b5a3a,
        roughness: 1
    });


    const mud = new THREE.Mesh(
        new THREE.CircleGeometry(5.2, 64),
        mudMaterial
    );

    mud.rotation.x = -Math.PI / 2;
    mud.position.y = 0.01;
    mud.receiveShadow = true;

    pond.add(mud);



    // ---------- Water ----------

    const waterMaterial = new THREE.MeshStandardMaterial({

        color: 0x4aa6c8,
        transparent: true,
        opacity: 0.75,
        roughness: 0.15,
        metalness: 0.1

    });


    const water = new THREE.Mesh(
        new THREE.CircleGeometry(4.7, 64),
        waterMaterial
    );


    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.04;

    water.receiveShadow = true;

    pond.add(water);



    // ---------- Rocks around pond ----------

    const rockMaterial = new THREE.MeshStandardMaterial({

        color: 0x77736b,
        roughness: 0.9

    });


    const rockCount = 28;


    for (let i = 0; i < rockCount; i++) {


        const angle =
            (i / rockCount) * Math.PI * 2;


        const radius =
            5.0 + Math.random() * 0.4;


        const x =
            Math.cos(angle) * radius;


        const z =
            Math.sin(angle) * radius;


        const rock = createRock(
            rockMaterial,
            x,
            0.15,
            z,
            0.5 + Math.random() * 0.5
        );


        pond.add(rock);

    }



    scene.add(pond);


    return {
        pond
    };

}