import * as THREE from "three";


// ---------- Helpers ----------

const rand = (min, max) => min + Math.random() * (max - min);

function makeCanvas(width, height = width) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: canvas.getContext("2d") };
}

// Draws a shape at (x, y), and repeats it across the edges
// so the texture tiles without visible seams.
function drawWrapped(size, x, y, reach, draw) {
    for (const dx of [-size, 0, size]) {
        for (const dy of [-size, 0, size]) {
            const px = x + dx;
            const py = y + dy;
            if (px + reach < 0 || px - reach > size) continue;
            if (py + reach < 0 || py - reach > size) continue;
            draw(px, py);
        }
    }
}

function toTexture(canvas, repeatX, repeatY) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 8; // keeps the texture sharp at low viewing angles
    return texture;
}

// Soft light/dark blotches that break up the "tiled" look
function drawBlotches(ctx, size, count, minR, maxR, lightColor, darkColor) {
    for (let i = 0; i < count; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        const r = rand(minR, maxR);
        const color = Math.random() < 0.5 ? lightColor : darkColor;

        drawWrapped(size, x, y, r, (px, py) => {
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}


// ---------- Grass ----------

export function createGrassTexture(repeat = 1) {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);

    // Base color
    ctx.fillStyle = "#6b9a48";
    ctx.fillRect(0, 0, size, size);

    // Patches of lighter and darker grass
    drawBlotches(
        ctx, size, 35, 30, 90,
        "rgba(170, 200, 100, 0.25)",
        "rgba(40, 70, 30, 0.25)"
    );

    // Individual grass blades
    ctx.lineCap = "round";
    for (let i = 0; i < 9000; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        const length = rand(4, 11);
        const lean = rand(-2.5, 2.5);

        ctx.strokeStyle = `hsl(${rand(78, 112)}, ${rand(35, 55)}%, ${rand(28, 52)}%)`;
        ctx.lineWidth = rand(0.8, 1.6);

        drawWrapped(size, x, y, length, (px, py) => {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + lean, py - length);
            ctx.stroke();
        });
    }

    // A few tiny flowers
    const flowerColors = ["#fff6e0", "#ffd86b", "#f7b2c4"];
    for (let i = 0; i < 60; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];

        drawWrapped(size, x, y, 3, (px, py) => {
            ctx.beginPath();
            ctx.arc(px, py, 1.6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    return toTexture(canvas, repeat, repeat);
}


// ---------- Path (sandy gravel) ----------

export function createPathTexture(repeatX = 1, repeatY = 1) {
    const size = 512;
    const { canvas, ctx } = makeCanvas(size);

    // Base color
    ctx.fillStyle = "#e3d2b0";
    ctx.fillRect(0, 0, size, size);

    // Soft variation
    drawBlotches(
        ctx, size, 25, 20, 60,
        "rgba(250, 240, 215, 0.35)",
        "rgba(160, 130, 95, 0.20)"
    );

    // Fine sand speckles
    for (let i = 0; i < 2500; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        const r = rand(0.5, 1.5);
        ctx.fillStyle = `hsla(${rand(28, 42)}, ${rand(15, 30)}%, ${rand(45, 75)}%, 0.6)`;

        drawWrapped(size, x, y, r, (px, py) => {
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Small pebbles
    for (let i = 0; i < 120; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        const rx = rand(2, 5);
        const ry = rx * rand(0.6, 0.9);
        const rotation = rand(0, Math.PI);

        ctx.fillStyle = `hsl(${rand(30, 45)}, ${rand(10, 25)}%, ${rand(55, 80)}%)`;
        ctx.strokeStyle = "rgba(90, 70, 50, 0.35)";
        ctx.lineWidth = 1;

        drawWrapped(size, x, y, rx, (px, py) => {
            ctx.beginPath();
            ctx.ellipse(px, py, rx, ry, rotation, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    return toTexture(canvas, repeatX, repeatY);
}
// ---------- Wood (bench slats) ----------

export function createWoodTexture() {
    const width = 512;
    const height = 128;
    const { canvas, ctx } = makeCanvas(width, height);

    // Warm honey base
    ctx.fillStyle = "#b9824c";
    ctx.fillRect(0, 0, width, height);

    // Wavy grain lines running along the plank
    for (let i = 0; i < 70; i++) {
        const y = rand(0, height);
        const amplitude = rand(1, 4);
        const frequency = rand(0.01, 0.03);
        const phase = rand(0, Math.PI * 2);

        ctx.strokeStyle = `hsla(${rand(22, 32)}, ${rand(40, 60)}%, ${rand(28, 48)}%, ${rand(0.2, 0.5)})`;
        ctx.lineWidth = rand(0.5, 2);

        ctx.beginPath();
        for (let x = 0; x <= width; x += 8) {
            const waveY = y + Math.sin(x * frequency + phase) * amplitude;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }

    // Two small knots
    ctx.strokeStyle = "hsla(25, 50%, 25%, 0.5)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
        const cx = rand(60, width - 60);
        const cy = rand(30, height - 30);
        for (const r of [10, 7, 4]) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, r * 2, r, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    return toTexture(canvas, 1, 1);
}


// ---------- Painted iron (bench frame, lamp post) ----------

export function createIronTexture() {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);

    // Deep green paint
    ctx.fillStyle = "#2f4a3a";
    ctx.fillRect(0, 0, size, size);

    // Uneven paint tone
    drawBlotches(
        ctx, size, 20, 10, 40,
        "rgba(80, 110, 90, 0.25)",
        "rgba(15, 25, 20, 0.30)"
    );

    // Fine speckles
    for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = `hsla(${rand(140, 160)}, ${rand(15, 25)}%, ${rand(15, 35)}%, 0.5)`;
        ctx.beginPath();
        ctx.arc(rand(0, size), rand(0, size), rand(0.5, 1.2), 0, Math.PI * 2);
        ctx.fill();
    }

    // Small worn spots where paint has chipped
    ctx.fillStyle = "rgba(120, 110, 95, 0.35)";
    for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(rand(0, size), rand(0, size), rand(1, 3), 0, Math.PI * 2);
        ctx.fill();
    }

    return toTexture(canvas, 1, 1);
}
// ---------- Bark (tree trunks) ----------

export function createBarkTexture() {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);

    ctx.fillStyle = "#6b4a32";
    ctx.fillRect(0, 0, size, size);

    // Dark vertical cracks that wander slightly
    for (let i = 0; i < 60; i++) {
        let x = rand(0, size);
        ctx.strokeStyle = `hsla(${rand(20, 30)}, ${rand(25, 40)}%, ${rand(15, 35)}%, ${rand(0.4, 0.8)})`;
        ctx.lineWidth = rand(1, 4);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y <= size; y += 16) {
            x += rand(-2, 2);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Light ridges between the cracks
    for (let i = 0; i < 30; i++) {
        let x = rand(0, size);
        ctx.strokeStyle = `hsla(30, 25%, ${rand(55, 65)}%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y <= size; y += 16) {
            x += rand(-2, 2);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    return toTexture(canvas, 2, 1);
}


// ---------- Leaves (grayscale detail; the shader adds the color) ----------

export function createLeafTexture() {
    const size = 256;
    const { canvas, ctx } = makeCanvas(size);

    ctx.fillStyle = "#a8a8a8";
    ctx.fillRect(0, 0, size, size);

    // Lots of small leaf shapes in different shades of gray
    for (let i = 0; i < 900; i++) {
        const x = rand(0, size);
        const y = rand(0, size);
        const angle = rand(0, Math.PI);
        const length = rand(6, 12);
        const lightness = rand(55, 95);

        drawWrapped(size, x, y, length, (px, py) => {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(0, 0%, ${lightness}%)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, length, length * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        });
    }

    const texture = toTexture(canvas, 1, 1);
    texture.colorSpace = THREE.NoColorSpace; // plain brightness data, not a color
    return texture;
}
// ---------- Cherry blossom petal ----------

export function createPetalTexture() {
    const size = 64;
    const { canvas, ctx } = makeCanvas(size); // starts fully transparent

    // Pale center fading to pink edges
    const gradient = ctx.createRadialGradient(32, 40, 2, 32, 36, 30);
    gradient.addColorStop(0, "#fff0f4");
    gradient.addColorStop(0.6, "#f7a8c4");
    gradient.addColorStop(1, "#e67fa6");
    ctx.fillStyle = gradient;

    // Petal outline with a small notch at the top
    ctx.beginPath();
    ctx.moveTo(32, 60);
    ctx.bezierCurveTo(4, 44, 6, 12, 24, 6);
    ctx.lineTo(32, 14);
    ctx.lineTo(40, 6);
    ctx.bezierCurveTo(58, 12, 60, 44, 32, 60);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}




// ---------- Sun glow ----------

export function createSunGlowTexture() {
    const size = 128;
    const { canvas, ctx } = makeCanvas(size);

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.15, "rgba(255, 250, 230, 1)");
    gradient.addColorStop(0.3, "rgba(255, 230, 180, 0.5)");
    gradient.addColorStop(1, "rgba(255, 200, 150, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
// ---------- Pastel paint (playground equipment) ----------

export function createPaintTexture(color) {
    const size = 128;
    const { canvas, ctx } = makeCanvas(size);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Slightly uneven paint
    drawBlotches(
        ctx, size, 15, 8, 30,
        "rgba(255, 255, 255, 0.15)",
        "rgba(0, 0, 0, 0.08)"
    );

    // Tiny light speckles
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    for (let i = 0; i < 300; i++) {
        ctx.beginPath();
        ctx.arc(rand(0, size), rand(0, size), rand(0.4, 1), 0, Math.PI * 2);
        ctx.fill();
    }

    return toTexture(canvas, 1, 1);
}


// ---------- Rope (swing ropes) ----------

export function createRopeTexture() {
    const width = 32;
    const height = 128;
    const { canvas, ctx } = makeCanvas(width, height);

    ctx.fillStyle = "#d8c29a";
    ctx.fillRect(0, 0, width, height);

    // Diagonal strands for a twisted look
    ctx.strokeStyle = "rgba(120, 95, 60, 0.6)";
    ctx.lineWidth = 2;
    for (let y = -32; y < height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + 16);
        ctx.stroke();
    }

    return toTexture(canvas, 1, 4);
}