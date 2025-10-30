(function () {
    const canvas = document.getElementById('lava');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, dpr;
    const blobs = [];
    const COUNT = 8; // Reduced for performance

    const palettes = [
        ["#ff71ce", "#f5adff", "#01cdfe"],
        ["#ff3f8e", "#c43cfa", "#0affd2"],
        ["#ff6ec7", "#8e5cff", "#04d9ff"]
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const R = (a, b) => Math.random() * (b - a) + a;

    class Blob {
        constructor() { this.reset(true); }
        reset(i) {
            this.x = R(0, w);
            this.y = i ? R(0, h) : h + 200;
            this.vx = R(-0.4, 0.4);
            this.vy = R(-0.3, -0.8);
            this.s = R(70, 130);
            this.c = palette[Math.floor(R(0, palette.length))];
            this.p = R(0, Math.PI * 2);
        }
        up(dt) {
            this.x += this.vx * dt * 150;
            this.y += this.vy * dt * 150;
            this.p += 0.015;
            this.r = this.s * (1 + Math.sin(this.p) * 0.1);
            if (this.y < -200) this.reset();
        }
        draw() {
            const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.r * 1.3);
            g.addColorStop(0, this.c + "ff");
            g.addColorStop(0.5, this.c + "88");
            g.addColorStop(1, this.c + "00");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        dpr = Math.min(1.5, window.devicePixelRatio || 1);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
        resize();
        blobs.length = 0;
        for (let i = 0; i < COUNT; i++) blobs.push(new Blob());
    }

    let last = performance.now();
    let frameId = null;

    function frame(n) {
        frameId = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (n - last) / 1000);
        last = n;

        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.filter = "blur(30px) brightness(1.3)";
        for (const b of blobs) {
            b.up(dt);
            b.draw();
        }
        ctx.restore();
    }

    window.addEventListener("resize", init, { passive: true });
    init();
    frameId = requestAnimationFrame(frame);

    // Stop animation when page is not visible (performance optimization)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(frameId);
        } else {
            frameId = requestAnimationFrame(frame);
        }
    });
})();