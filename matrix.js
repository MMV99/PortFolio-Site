// Replaced with a responsive, high-DPI and mobile-friendly implementation

const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let w, h, dpr, fontSize, columns, drops = [];
const rawColor = document.body.getAttribute('data-matrix-color') || '#00abf0';

// Map simple names to hex if needed
function resolveColor(val) {
    if (!val) return '#00abf0';
    val = val.trim().toLowerCase();
    const map = {
        'violet': '#8a2be2',
        'green': '#00f014',
        '#00f014': '#00f014',
        '#00abf0': '#00abf0'
    };
    return map[val] || val;
}
const matrixColor = resolveColor(rawColor);

function resizeCanvas() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    // set canvas internal size for sharpness on high-DPI screens
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // set font size relative to viewport width (keeps characters legible on small screens)
    fontSize = Math.max(8, Math.round(window.innerWidth / 60));
    ctx.font = `${fontSize * dpr}px monospace`;
    ctx.textBaseline = 'top';

    columns = Math.floor(w / (fontSize * dpr));
    drops = new Array(columns).fill(0);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

let last = 0;
function draw(now) {
    // throttle on low-power devices using time delta if needed
    const delta = now - last;
    last = now;

    // semi-transparent black to create fading trails
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, w, h);

    // set text style and glow
    ctx.fillStyle = matrixColor;
    ctx.shadowBlur = 8 * dpr;
    ctx.shadowColor = matrixColor;

    for (let i = 0; i < drops.length; i++) {
        const x = Math.floor(i * fontSize * dpr);
        const y = Math.floor(drops[i] * fontSize * dpr);

        // pick random small-range Unicode characters to get matrix-like glyphs
        const charCode = 2720 + Math.floor(Math.random() * 33);
        const ch = String.fromCharCode(charCode);
        ctx.fillText(ch, x, y);

        // occasionally reset column stream with probability so it appears organic
        if ((y > h && Math.random() > 0.98) || drops[i] * fontSize * dpr > h + Math.random() * 1000) {
            drops[i] = 0;
        } else {
            drops[i]++;
        }
    }

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ensure the canvas doesn't intercept touch events
canvas.style.pointerEvents = 'none';
