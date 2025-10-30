// Lava-lamp blobs background (uses radial gradients + lighter composite)
(function () {
    const canvas = document.getElementById('lava');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let w = 0, h = 0, dpr = 1;
    const blobs = [];
    const BLOB_COUNT = 14; // increase for denser background

    function rand(min, max) { return Math.random() * (max - min) + min; }

    class Blob {
        constructor() { this.reset(true); }

        reset(initial = false) {
            this.size = rand(80, 220);                    // radius
            this.x = rand(-this.size, w + this.size);
            this.y = initial ? rand(0, h) : h + rand(20, 200);
            this.vy = rand(0.15, 0.6);                    // vertical speed
            this.vx = rand(-0.2, 0.2);                    // horizontal drift
            this.phase = rand(0, Math.PI * 2);
            // warm red/orange base color variations
            const r = Math.round(rand(160, 255));
            const g = Math.round(rand(10, 60));
            const b = Math.round(rand(10, 40));
            this.color = `rgba(${r},${g},${b},`;
            this.offset = rand(0, 1000);
        }

        update(delta) {
            // delta in seconds
            this.phase += delta * 0.4;
            this.x += Math.sin(this.phase * 0.7) * this.vx * 60;
            this.y -= this.vy * 60 * delta;
            // slight pulsation
            this.displaySize = this.size * (1 + Math.sin(this.phase * 0.9 + this.offset) * 0.055);
            if (this.y < -this.displaySize * 1.4) this.reset();
        }

        draw(ctx) {
            const s = this.displaySize;
            const gx = ctx.createRadialGradient(this.x, this.y, Math.max(1, s * 0.08), this.x, this.y, s);
            gx.addColorStop(0, this.color + '0.95)');
            gx.addColorStop(0.25, this.color + '0.55)');
            gx.addColorStop(0.6, this.color + '0.12)');
            gx.addColorStop(1, 'rgba(0,10,30,0)');
            ctx.fillStyle = gx;
            ctx.beginPath();
            ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = Math.floor(window.innerWidth);
        h = Math.floor(window.innerHeight);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // ensure we have the right number of blobs
        while (blobs.length < BLOB_COUNT) blobs.push(new Blob());
        // reposition blobs when very small screens change
        blobs.forEach(b => {
            b.x = Math.max(-b.size, Math.min(w + b.size, b.x));
            b.y = Math.max(-b.size, Math.min(h + b.size, b.y));
        });
    }

    let last = performance.now();
    function render(now) {
        const dt = Math.min(0.05, (now - last) / 1000); // seconds, clamp to avoid jumps
        last = now;

        // dark blue background base
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#06162a'; // deep blue
        ctx.fillRect(0, 0, w, h);

        // draw blobs with additive blending for luminous look
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < blobs.length; i++) {
            blobs[i].update(dt);
            blobs[i].draw(ctx);
        }

        // subtle overlay glow to unify colors
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    last = performance.now();
    requestAnimationFrame(render);
})();