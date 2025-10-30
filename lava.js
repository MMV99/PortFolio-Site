// Lava-lamp blobs background (uses radial gradients + lighter composite)
(function () {
    const canvas = document.getElementById('lava');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let w = 0, h = 0, dpr = 1;
    const blobs = [];
    const BLOB_COUNT = 16;

    // Physics constants
    const SOFTNESS = 0.25;      // Blob deformation factor
    const ELASTICITY = 0.8;     // Bounce energy retention
    const DAMPING = 0.98;       // Velocity decay
    const COLLISION_FORCE = 0.45;// Force of blob collisions

    // Color palettes (expanded for variety)
    const colorPalettes = [
        { hue: [0, 40], sat: [80, 100], light: [45, 65] },    // Red-Orange
        { hue: [260, 280], sat: [70, 90], light: [50, 70] },  // Purple
        { hue: [180, 200], sat: [70, 90], light: [45, 65] },  // Cyan
        { hue: [20, 40], sat: [80, 100], light: [50, 70] },   // Orange-Gold
        { hue: [290, 310], sat: [70, 90], light: [50, 70] }   // Pink
    ];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    class Blob {
        constructor() {
            this.deformation = { x: 0, y: 0 };
            this.lastCollision = 0;
            this.randomizeColor();    // initial color (colors change only on bounce/collision)
            this.reset(true);
        }

        randomizeColor() {
            const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
            const hue = rand(palette.hue[0], palette.hue[1]);
            const sat = rand(palette.sat[0], palette.sat[1]);
            const light = rand(palette.light[0], palette.light[1]);
            this.color = `hsla(${Math.round(hue)}, ${Math.round(sat)}%, ${Math.round(light)}%,`;
        }

        reset(initial = false) {
            this.size = rand(80, 220);
            this.baseSize = this.size;
            // place within bounds
            this.x = rand(this.size, Math.max(this.size + 1, w - this.size));
            this.y = initial ? rand(this.size, Math.max(this.size + 1, h - this.size)) : h + this.size + rand(10, 200);
            this.vx = rand(-80, 80);
            this.vy = rand(-80, 80);
            this.phase = rand(0, Math.PI * 2);
            this.offset = rand(0, 1000);
            this.pulseSpeed = rand(0.6, 1.2);
        }

        applyDeformation(force, axis) {
            const key = (axis === 'x') ? 'x' : 'y';
            this.deformation[key] = (this.deformation[key] || 0) + (force * SOFTNESS);
        }

        update(delta, now) {
            // Integrate velocity
            this.x += this.vx * delta;
            this.y += this.vy * delta;

            // subtle gravity downwards
            this.vy += 80 * delta;

            // Boundary collisions with soft deformation and color change ON BOUNCE
            if (this.x < this.size) {
                this.x = this.size;
                this.vx = Math.abs(this.vx) * ELASTICITY;
                this.applyDeformation(-this.vx * 0.015, 'x');
                if (now - this.lastCollision > 150) { this.randomizeColor(); this.lastCollision = now; }
            }
            if (this.x > w - this.size) {
                this.x = w - this.size;
                this.vx = -Math.abs(this.vx) * ELASTICITY;
                this.applyDeformation(this.vx * 0.015, 'x');
                if (now - this.lastCollision > 150) { this.randomizeColor(); this.lastCollision = now; }
            }
            if (this.y < this.size) {
                this.y = this.size;
                this.vy = Math.abs(this.vy) * ELASTICITY;
                this.applyDeformation(-this.vy * 0.015, 'y');
                if (now - this.lastCollision > 150) { this.randomizeColor(); this.lastCollision = now; }
            }
            if (this.y > h - this.size) {
                this.y = h - this.size;
                this.vy = -Math.abs(this.vy) * ELASTICITY;
                this.applyDeformation(this.vy * 0.015, 'y');
                if (now - this.lastCollision > 150) { this.randomizeColor(); this.lastCollision = now; }
            }

            // Velocity damping
            this.vx *= DAMPING;
            this.vy *= DAMPING;

            // Deformation recovery
            this.deformation.x *= 0.85;
            this.deformation.y *= 0.85;

            // Phase & pulsation
            this.phase += delta * this.pulseSpeed;
            this.displaySize = this.baseSize * (1 + Math.sin(this.phase) * 0.04);
        }

        // now must be passed in to throttle color changes
        checkCollision(other, now) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.hypot(dx, dy);
            const minDist = (this.size + other.size) * 0.9; // more overlap tolerance

            if (distance > 0 && distance < minDist) {
                // simple overlap push
                const overlap = (minDist - distance);
                const nx = dx / distance;
                const ny = dy / distance;
                const pushX = nx * overlap * COLLISION_FORCE;
                const pushY = ny * overlap * COLLISION_FORCE;

                // apply to velocities
                this.vx -= pushX * 0.5;
                this.vy -= pushY * 0.5;
                other.vx += pushX * 0.5;
                other.vy += pushY * 0.5;

                // soft deformation based on collision direction
                this.applyDeformation(-pushX * 0.01, 'x');
                this.applyDeformation(-pushY * 0.01, 'y');
                other.applyDeformation(pushX * 0.01, 'x');
                other.applyDeformation(pushY * 0.01, 'y');

                // color change on collision (throttled)
                if (now - this.lastCollision > 150) { this.randomizeColor(); this.lastCollision = now; }
                if (now - other.lastCollision > 150) { other.randomizeColor(); other.lastCollision = now; }
            }
        }

        draw(ctx) {
            const s = this.displaySize;
            // gradient origin slightly offset by deformation for "squash" effect
            const gx = ctx.createRadialGradient(
                this.x - this.deformation.x * 12,
                this.y - this.deformation.y * 12,
                Math.max(1, s * 0.06),
                this.x + this.deformation.x * 18,
                this.y + this.deformation.y * 18,
                s * (1.2 + Math.abs(this.deformation.x + this.deformation.y) * 0.15)
            );

            gx.addColorStop(0, this.color + '0.95)');
            gx.addColorStop(0.35, this.color + '0.55)');
            gx.addColorStop(0.7, this.color + '0.20)');
            gx.addColorStop(1, 'hsla(220, 80%, 8%, 0)');

            ctx.fillStyle = gx;
            ctx.beginPath();
            // smooth ellipse reflect deformation
            ctx.ellipse(
                this.x, this.y,
                s * (1 + this.deformation.x),
                s * (1 + this.deformation.y),
                0,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    function resize() {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = Math.max(1, Math.floor(window.innerWidth));
        h = Math.max(1, Math.floor(window.innerHeight));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // ensure blob count
        while (blobs.length < BLOB_COUNT) blobs.push(new Blob());
        // clamp positions in case of resize
        blobs.forEach(b => {
            b.x = Math.max(b.size, Math.min(w - b.size, b.x));
            b.y = Math.max(b.size, Math.min(h - b.size, b.y));
        });
    }

    let last = performance.now();
    function render(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';

        // update blobs
        for (let i = 0; i < blobs.length; i++) {
            blobs[i].update(dt, now);
        }

        // collisions (pairwise)
        for (let i = 0; i < blobs.length; i++) {
            for (let j = i + 1; j < blobs.length; j++) {
                blobs[i].checkCollision(blobs[j], now);
            }
        }

        // draw
        for (let i = 0; i < blobs.length; i++) blobs[i].draw(ctx);

        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(render);
})();