uniform float uSeason;
uniform sampler2D uLeafTexture;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;

uniform vec3 uClickColor;
uniform float uClickMix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

#include <fog_pars_fragment>

// Always light pink
vec3 seasonColor(float s) {
    return vec3(0.95, 0.66, 0.78);
    ;
}

void main() {
    // 1. Season color, slightly different across the canopy
    float variation = sin(vWorldPosition.x * 1.7 + vWorldPosition.z * 1.3 + vWorldPosition.y * 0.9) * 0.04;
    vec3 leafColor = seasonColor(uSeason + variation);

    leafColor = mix(leafColor, uClickColor, uClickMix);
    leafColor = pow(leafColor, vec3(2.2)); // convert to linear so lighting matches other objects

    // 2. Leaf detail from the texture
    vec3 detail = texture2D(uLeafTexture, vUv * 3.0).rgb;
    vec3 albedo = leafColor * detail * 1.4;

    // 3. Lighting
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDirection);

    float sunAmount = max((dot(N, L) + 0.3) / 1.3, 0.0); // "wrapped" for a softer look
    vec3 skyLight = mix(uGroundColor, uSkyColor, N.y * 0.5 + 0.5);

    vec3 color = albedo * (uSunColor * sunAmount + skyLight) / 3.14159265;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <fog_fragment>
}