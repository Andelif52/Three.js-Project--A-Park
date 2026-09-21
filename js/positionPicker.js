import * as THREE from "three";


export function createPositionPicker(
    scene,
    camera,
    renderer
) {


    const raycaster =
        new THREE.Raycaster();


    const mouse =
        new THREE.Vector2();



    // invisible ground plane for detecting clicks

    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                100,
                100
            ),

            new THREE.MeshBasicMaterial({
                visible:false
            })

        );


    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;


    scene.add(ground);




    function onClick(event){


        const rect =
            renderer.domElement.getBoundingClientRect();



        mouse.x =
            (
                (event.clientX - rect.left)
                /
                rect.width
            ) * 2 - 1;



        mouse.y =
            -(
                (event.clientY - rect.top)
                /
                rect.height
            ) * 2 + 1;



        raycaster.setFromCamera(
            mouse,
            camera
        );



        const hit =
            raycaster.intersectObject(
                ground
            );



        if(hit.length > 0){


            const point =
                hit[0].point;



            console.log(
                "Clicked position:",
                {
                    x: point.x.toFixed(2),
                    z: point.z.toFixed(2)
                }
            );


        }

    }



    window.addEventListener(
        "click",
        onClick
    );


}