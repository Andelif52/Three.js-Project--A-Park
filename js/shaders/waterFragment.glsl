uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

#include <fog_pars_fragment>

void main()
{

    // circular pond mask

    vec2 centered = vUv - 0.5;

    float distanceFromCenter = length(centered);


    if(distanceFromCenter > 0.5)
    {
        discard;
    }



    vec3 water = vec3(
        0.05,
        0.45,
        0.65
    );


    float ripple =
        2.0
        *
        sin(vWorldPosition.x * 5.0 + uTime)
        *
        2.0
        *
        cos(vWorldPosition.z * 5.0 + uTime);


    water += ripple * 0.03;



    float fresnel =
        1.0 - dot(
            normalize(vNormal),
            vec3(0,1,0)
        );


    water += fresnel * 0.15;



    gl_FragColor =
        vec4(
            water,
            0.5
        );


    #include <colorspace_fragment>
    #include <fog_fragment>
}