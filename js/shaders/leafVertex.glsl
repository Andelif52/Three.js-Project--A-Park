uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

#include <fog_pars_vertex>

void main() {
    vUv = uv;

    // Normal in world space (used for lighting)
    vNormal = normalize(mat3(modelMatrix) * normal);

    // Position in world space
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    // Wind sway: stronger higher up the tree
    float heightFactor = clamp(worldPosition.y / 5.0, 0.0, 1.0);
    worldPosition.x += sin(uTime * 1.5 + worldPosition.x * 0.5 + worldPosition.z * 0.3) * 0.06 * heightFactor;
    worldPosition.z += cos(uTime * 1.2 + worldPosition.x * 0.4) * 0.04 * heightFactor;

    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
}