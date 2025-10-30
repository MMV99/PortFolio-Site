// Replaced with responsive, high-DPI matrix + subtle animated "smoke" overlay

const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let w, h, dpr, fontSize, columns, drops = [];
let smokeOffset = 0;
const rawColor = document.body.getAttribute('data-matrix-color') || '#00abf0';

function resolveColor(val){
  if(!val) return '#00abf0';
  val = val.trim().toLowerCase();
  const map = { 'violet':'#8a2be2', 'green':'#00f014', '#00f014':'#00f014', '#00abf0':'#00abf0' };
  return map[val] || val;
}
const matrixHex = resolveColor(rawColor);

function hexToRgb(hex){
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
const matrixRgb = hexToRgb(matrixHex);

function resizeCanvas(){
  dpr = Math.max(1, window.devicePixelRatio || 1);
  w = canvas.width = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  fontSize = Math.max(8, Math.round(window.innerWidth / 60));
  ctx.font = `${fontSize * dpr}px monospace`;
  ctx.textBaseline = 'top';

  columns = Math.floor(w / (fontSize * dpr));
  drops = new Array(columns).fill(0);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

let last = 0;
function draw(now){
  const delta = now - last;
  last = now;

  // Fading trail (reduced alpha for dimmer effect)
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(0,0,w,h);

  // Draw matrix chars
  ctx.shadowBlur = 4 * dpr; // softer glow
  ctx.shadowColor = `rgba(${matrixRgb.join(',')},0.55)`;
  ctx.fillStyle = `rgba(${matrixRgb.join(',')},0.95)`; // slightly translucent

  for(let i=0;i<drops.length;i++){
    const x = Math.floor(i * fontSize * dpr);
    const y = Math.floor(drops[i] * fontSize * dpr);

    const charCode = 2720 + Math.floor(Math.random() * 33);
    const ch = String.fromCharCode(charCode);
    ctx.fillText(ch, x, y);

    if((y > h && Math.random() > 0.98) || drops[i] * fontSize * dpr > h + Math.random() * 1000){
      drops[i] = 0;
    } else {
      drops[i]++;
    }
  }

  // Smoke overlay: subtle animated dark gradient to reduce brightness / soften glow
  smokeOffset += 0.3 * Math.max(1, dpr);
  const g = ctx.createLinearGradient(0, smokeOffset % h, 0, (smokeOffset * 1.7) % h + h);
  g.addColorStop(0, 'rgba(0,0,0,0.12)');
  g.addColorStop(0.4, 'rgba(0,0,0,0.04)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // Slight moving haze (transparent white/gray) to emulate smoke diffusion — very subtle
  ctx.globalCompositeOperation = 'lighter';
  const hazeAlpha = 0.02;
  const hx = (Math.sin(smokeOffset / 120) + 1) * 0.5;
  const haze = ctx.createRadialGradient(w * hx, h * 0.25, 0, w * hx, h * 0.25, Math.max(w,h) * 0.7);
  haze.addColorStop(0, `rgba(255,255,255,${hazeAlpha})`);
  haze.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ensure the canvas doesn't intercept touch events
canvas.style.pointerEvents = 'none';
