const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let width, height;
let columns;
let drops = [];

// Resize canvas and adjust drops
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    columns = Math.floor(width / 10);
    drops = new Array(columns).fill(1);

    ctx.font = '12px monospace';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Matrix animation
function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f'; // blue glow
    for (let i = 0; i < drops.length; i++) {
        const char = String.fromCharCode(2720 + Math.random() * 33);
        const x = i * 10;
        const y = drops[i] * 10;

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

// Popup logic
const popupContainer = document.querySelector('.popup-container');
const closeBtn = document.querySelector('.close-btn');

function showPopup() {
    if (popupContainer) popupContainer.style.visibility = 'visible';
}

function closePopup() {
    if (popupContainer) popupContainer.style.visibility = 'hidden';
}

if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
}

window.addEventListener('load', showPopup);
