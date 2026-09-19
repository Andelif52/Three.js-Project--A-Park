import * as THREE from "three";
import { createSunGlowTexture } from "./textures.js";


// Colors used across the day
const SKY_DAY     = new THREE.Color(0xcfe6ee);
const SKY_SUNSET  = new THREE.Color(0xf2b38a);
const SKY_DUSK    = new THREE.Color(0x4a4f7a);

const SUN_HIGH    = new THREE.Color(0xfff0d6); // soft white at midday
const SUN_LOW     = new THREE.Color(0xffa060); // warm orange near the horizon

const HEMI_DAY    = new THREE.Color(0xdcefff);
const HEMI_DUSK   = new THREE.Color(0x8a86b8);


export function createSun(scene, sunlight, hemiLight) {

    // Visible glowing sun in the sky
    const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: createSunGlowTexture(),
            transparent: true,
            depthWrite: false,
            fog: false // stays bright even though it's far away
        })
    );
    glow.scale.set(28, 28, 1);
    scene.add(glow);

    const sun = {
        progress: 0.15,      // 0 = before sunrise, 1 = after sunset
        dayLength: 60,       // seconds for one full day
        speedMultiplier: 1,  // changed by the keyboard in Step 2
        update
    };

    const direction = new THREE.Vector3();
    const skyColor = new THREE.Color();
    const smooth = THREE.MathUtils.smoothstep;


    function update(delta) {

        // Advance the time of day and loop back to 0 after 1
        sun.progress = (sun.progress + (delta * sun.speedMultiplier) / sun.dayLength) % 1;

        // Angle along the arc: slightly below the horizon at both ends
        const angle = THREE.MathUtils.lerp(-0.15 * Math.PI, 1.15 * Math.PI, sun.progress);
        const elevation = Math.sin(angle); // -0.45 (below horizon) to 1 (overhead)

        // Direction from the park toward the sun
        direction.set(Math.cos(angle), elevation, 0.45).normalize();

        sunlight.position.copy(direction).multiplyScalar(30);
        glow.position.copy(direction).multiplyScalar(120);
        glow.visible = elevation > -0.12;

        // Brightness: fades out as the sun reaches the horizon
        sunlight.intensity = 2.8 * smooth(elevation, -0.05, 0.25);

        // Color: orange when low, soft white when high
        sunlight.color.copy(SUN_LOW).lerp(SUN_HIGH, smooth(elevation, 0.0, 0.5));
        glow.material.color.copy(sunlight.color);

        // Sky and fog: dusk → sunset → day
        if (elevation < 0.1) {
            skyColor.copy(SKY_DUSK).lerp(SKY_SUNSET, smooth(elevation, -0.3, 0.1));
        } else {
            skyColor.copy(SKY_SUNSET).lerp(SKY_DAY, smooth(elevation, 0.1, 0.45));
        }
        scene.background.copy(skyColor);
        scene.fog.color.copy(skyColor);

        // Soft sky light: dimmer and more purple at dusk
        hemiLight.intensity = 0.5 + 0.9 * smooth(elevation, -0.2, 0.4);
        hemiLight.color.copy(HEMI_DUSK).lerp(HEMI_DAY, smooth(elevation, -0.1, 0.4));
    }

    update(0); // set the starting look immediately

    return sun;
}