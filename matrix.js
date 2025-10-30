// Full replacement: higher-quality bloom, softer smoke, vignette and performance-friendly drawing

const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d', { alpha: true });

let w, h, dpr, fontSize, columns, drops = [];
let smokeOffset = 0;
const rawColor = document.body.getAttribute('data-matrix-color') || '#00abf0';

// Color mapping and utilities
function resolveColor(val){
    if(!val) return '#00abf0';
    val = val.trim().toLowerCase();
    const map = { 
        'violet':'#8a2be2', 
        'green':'#00f014', 
        '#00f014':'#00f014', 
        '#00abf0':'#00abf0' 
    };
    return map[val] || val;
}

function hexToRgb(hex){
    const h = hex.replace('#','');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

const matrixHex = resolveColor(rawColor);
const matrixRgb = hexToRgb(matrixHex);

// Canvas setup
function resizeCanvas(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // Fixed font size of 10 pixels
    fontSize = 10;
    ctx.font = `${fontSize * dpr}px "Courier New", monospace`;
    ctx.textBaseline = 'top';

    // Calculate columns based on fixed font size
    columns = Math.floor(w / (fontSize * dpr));
    drops = new Array(columns).fill(0);
}

// Animation loop
function draw(now){
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,w,h);

    ctx.save();
    ctx.shadowBlur = 8 * dpr;
    ctx.shadowColor = `rgba(${matrixRgb.join(',')},0.6)`;
    ctx.fillStyle = `rgba(${matrixRgb.join(',')},0.95)`;
    ctx.globalCompositeOperation = 'source-over';

    for(let i=0; i<drops.length; i++){
        const x = Math.floor(i * fontSize * dpr);
        const y = Math.floor(drops[i] * fontSize * dpr);
        
        const charCode = 2720 + Math.floor(Math.random() * 33);
        ctx.fillText(String.fromCharCode(charCode), x, y);

        // Calculate speed: 1920px / 3s = 640px per second
        // Since we're using requestAnimationFrame (60fps), we divide by 60
        // 640/60 ≈ 10.67 pixels per frame
        if((y > h && Math.random() > 0.998) || drops[i] * fontSize * dpr > h + Math.random() * 1000) {
            drops[i] = 0;
        } else {
            drops[i] += 10.67 / fontSize; // Consistent speed regardless of font size
        }
    }
    ctx.restore();

    // Depth haze
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${matrixRgb.join(',')},0.035)`;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    // Slower smoke animation
    smokeOffset += 0.15 * dpr; // Reduced from 0.22
    const gradient = ctx.createLinearGradient(0, smokeOffset % h, 0, (smokeOffset * 1.6) % h + h);
    gradient.addColorStop(0, 'rgba(6,6,8,0.18)');
    gradient.addColorStop(0.45, 'rgba(10,10,12,0.06)');
    gradient.addColorStop(1, 'rgba(6,6,8,0.18)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    // Depth haze
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hx = (Math.sin(smokeOffset / 140) + 1) * 0.5;
    const haze = ctx.createRadialGradient(w * hx, h * 0.18, 0, w * hx, h * 0.18, Math.max(w,h) * 0.8);
    haze.addColorStop(0, 'rgba(255,255,255,0.012)');
    haze.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    // Vignette effect
    ctx.save();
    const vignette = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.2, w/2, h/2, Math.max(w,h)*0.9);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    requestAnimationFrame(draw);
}

// Initialize
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();
requestAnimationFrame(draw);
canvas.style.pointerEvents = 'none';
