let keys={};


window.addEventListener(
"keydown",
(e)=>{
    keys[e.code]=true;
});


window.addEventListener(
"keyup",
(e)=>{
    keys[e.code]=false;
});



export function setupControls(camera){


function move(){


let speed=0.15;


if(keys["KeyW"])
camera.position.z-=speed;


if(keys["KeyS"])
camera.position.z+=speed;


if(keys["KeyA"])
camera.position.x-=speed;


if(keys["KeyD"])
camera.position.x+=speed;



requestAnimationFrame(move);

}


move();

}