// Lava-lamp blobs background (uses radial gradients + lighter composite)
(function () {
    const canvas = document.getElementById('lava');
    const ctx = canvas.getContext('2d', { alpha: true });

    let w = 0, h = 0, dpr = 1;
    const blobs = [];
    const BLOB_COUNT = 18; // Increased for more visual impact

    function rand(min, max) { return Math.random() * (max - min) + min; }

    class Blob {
        constructor() { this.reset(true); }

        reset(initial = false) {
            this.size = rand(100, 280);                   // Larger blobs
            this.x = rand(-this.size, w + this.size);
            this.y = initial ? rand(0, h) : h + rand(20, 200);
            this.vy = rand(0.12, 0.45);                   // Slower, more graceful movement
            this.vx = rand(-0.15, 0.15);                  
            this.phase = rand(0, Math.PI * 2);
            // Enhanced color palette with rich reds and oranges
            const hue = rand(0, 40);                      // Red to orange range
            const sat = rand(80, 100);                    // High saturation
            const light = rand(45, 65);                   // Controlled brightness
            this.color = `hsla(${hue}, ${sat}%, ${light}%,`;
            this.offset = rand(0, 1000);
            this.pulseSpeed = rand(0.6, 1.2);            // Individual pulse rates
        }

        update(delta) {
            this.phase += delta * this.pulseSpeed;
            this.x += Math.sin(this.phase * 0.5) * this.vx * 60;
            this.y -= this.vy * 60 * delta;
            // More pronounced pulsation
            this.displaySize = this.size * (1 + Math.sin(this.phase) * 0.08);
            if (this.y < -this.displaySize * 1.4) this.reset();
        }

        draw(ctx) {
            const s = this.displaySize;
            const gx = ctx.createRadialGradient(
                this.x, this.y, s * 0.1,
                this.x, this.y, s * 1.25
            );
            // Rich multi-stop gradient for more depth
            gx.addColorStop(0, this.color + '0.95)');
            gx.addColorStop(0.4, this.color + '0.55)');
            gx.addColorStop(0.7, this.color + '0.25)');
            gx.addColorStop(1, 'hsla(220, 80%, 10%, 0)');
            
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