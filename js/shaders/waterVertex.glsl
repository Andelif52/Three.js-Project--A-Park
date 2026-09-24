uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

#include <fog_pars_vertex>

void main() {
    vUv = uv;

    vec3 pos = position;

    float wave1 = sin(pos.x * 2.5 + uTime * 1.5) * 0.015;

    float wave2 = cos(pos.y * 3.0 + uTime * 1.2) * 0.01;

    pos.z += wave1 + wave2;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);

    vWorldPosition = worldPosition.xyz;

    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 mvPosition = viewMatrix * worldPosition;

    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
}
