const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let width, height;
let columns;
let drops = [];
const matrixColor = document.body.getAttribute('data-matrix-color') || '#00abf0';

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  columns = Math.floor(width / 10);
  drops = new Array(columns).fill(1);
  ctx.font = '12px monospace';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = matrixColor;

  for (let i = 0; i < drops.length; i++) {
    const char = String.fromCharCode(2720 + Math.random() * 33);
    ctx.fillText(char, i * 10, drops[i] * 10);
    drops[i] = (drops[i] * 10 > height && Math.random() > 0.975) ? 0 : drops[i] + 1;
  }
}
setInterval(drawMatrix, 33);
