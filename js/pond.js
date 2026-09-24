import * as THREE from "three";


// ---------- Load Water Shaders ----------

export async function loadWaterShaders() {

    const [vertexShader, fragmentShader] = await Promise.all([
        fetch(new URL("./shaders/waterVertex.glsl", import.meta.url))
            .then((r) => r.text()),

        fetch(new URL("./shaders/waterFragment.glsl", import.meta.url))
            .then((r) => r.text())
    ]);

    return {
        vertexShader,
        fragmentShader
    };
}



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

export function createPond(
    scene,
    shaders,
    position = { x: -15, z: 8 }
) {

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

    const waterMaterial = new THREE.ShaderMaterial({

        vertexShader: shaders.vertexShader,
        fragmentShader: shaders.fragmentShader,

        uniforms: {

            ...THREE.UniformsUtils.clone(
                THREE.UniformsLib.fog
            ),

            uTime: {
                value: 0
            }

        },

        transparent: true,
        depthWrite:false,
        fog: true

    });



    const water = new THREE.Mesh(

        new THREE.PlaneGeometry(
            9.4,
            9.4,
            120,
            120
        ),

        waterMaterial

    );


    water.rotation.x = -Math.PI / 2;

    water.position.y = 0.12;

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



    // ---------- Animation update ----------

    function update(elapsed) {

        waterMaterial.uniforms.uTime.value = elapsed;

    }



    return {

        pond,
        update

    };

}