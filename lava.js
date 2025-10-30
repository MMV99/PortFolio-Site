// Lava-lamp blobs background (uses radial gradients + lighter composite)
(function () {
    const canvas = document.getElementById('lava');
    const ctx = canvas.getContext('2d', { alpha: true });

    let w = 0, h = 0, dpr = 1;
    const blobs = [];
    const BLOB_COUNT = 16;

    // Physics constants
    const SOFTNESS = 0.3;      // Blob deformation factor
    const ELASTICITY = 0.8;    // Bounce energy retention
    const DAMPING = 0.98;      // Velocity decay
    const COLLISION_FORCE = 0.4;// Force of blob collisions

    // Color palettes (expanded for more variety)
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
            this.reset(true);
            this.deformation = { x: 0, y: 0 };
            this.lastCollision = 0;
        }

        randomizeColor() {
            const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
            const hue = rand(palette.hue[0], palette.hue[1]);
            const sat = rand(palette.sat[0], palette.sat[1]);
            const light = rand(palette.light[0], palette.light[1]);
            this.color = `hsla(${hue}, ${sat}%, ${light}%,`;
        }

        reset(initial = false) {
            this.size = rand(100, 250);
            this.baseSize = this.size;
            this.x = rand(this.size, w - this.size);
            this.y = initial ? rand(this.size, h - this.size) : h + this.size;
            this.vx = rand(-150, 150);
            this.vy = rand(-150, 150);
            this.phase = rand(0, Math.PI * 2);
            this.randomizeColor();
        }

        applyDeformation(force, axis) {
            const deform = axis === 'x' ? 'x' : 'y';
            this.deformation[deform] = force * SOFTNESS;
        }

        update(delta, now) {
            // Update position with velocity
            this.x += this.vx * delta;
            this.y += this.vy * delta;

            // Apply gravity
            this.vy += 150 * delta;

            // Boundary collisions with soft body deformation
            if (this.x < this.size) {
                this.x = this.size;
                this.vx = Math.abs(this.vx) * ELASTICITY;
                this.applyDeformation(-this.vx * 0.1, 'x');
                this.randomizeColor();
            }
            if (this.x > w - this.size) {
                this.x = w - this.size;
                this.vx = -Math.abs(this.vx) * ELASTICITY;
                this.applyDeformation(this.vx * 0.1, 'x');
                this.randomizeColor();
            }
            if (this.y < this.size) {
                this.y = this.size;
                this.vy = Math.abs(this.vy) * ELASTICITY;
                this.applyDeformation(-this.vy * 0.1, 'y');
                this.randomizeColor();
            }
            if (this.y > h - this.size) {
                this.y = h - this.size;
                this.vy = -Math.abs(this.vy) * ELASTICITY;
                this.applyDeformation(this.vy * 0.1, 'y');
                this.randomizeColor();
            }

            // Decay velocity
            this.vx *= DAMPING;
            this.vy *= DAMPING;

            // Recover from deformation
            this.deformation.x *= 0.9;
            this.deformation.y *= 0.9;

            // Update phase for internal animation
            this.phase += delta * 2;
            
            // Calculate display size with deformation
            const xScale = 1 + this.deformation.x;
            const yScale = 1 + this.deformation.y;
            this.displaySize = this.baseSize * (1 + Math.sin(this.phase) * 0.05);
        }

        checkCollision(other) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = (this.size + other.size) * 0.8;

            if (distance < minDist) {
                // Calculate collision response
                const angle = Math.atan2(dy, dx);
                const force = (minDist - distance) * COLLISION_FORCE;
                
                const pushX = Math.cos(angle) * force;
                const pushY = Math.sin(angle) * force;

                // Apply forces
                this.vx -= pushX;
                this.vy -= pushY;
                other.vx += pushX;
                other.vy += pushY;

                // Apply deformation
                this.applyDeformation(-pushX * 0.5, 'x');
                this.applyDeformation(-pushY * 0.5, 'y');
                other.applyDeformation(pushX * 0.5, 'x');
                other.applyDeformation(pushY * 0.5, 'y');

                // Change colors on collision
                if (now - this.lastCollision > 500) {
                    this.randomizeColor();
                    this.lastCollision = now;
                }
                if (now - other.lastCollision > 500) {
                    other.randomizeColor();
                    other.lastCollision = now;
                }
            }
        }

        draw(ctx) {
            const s = this.displaySize;
            // Apply deformation to the gradient
            const gx = ctx.createRadialGradient(
                this.x, this.y, s * 0.1,
                this.x + this.deformation.x * 20, 
                this.y + this.deformation.y * 20, 
                s * (1.25 + Math.abs(this.deformation.x + this.deformation.y) * 0.2)
            );
            
            gx.addColorStop(0, this.color + '0.95)');
            gx.addColorStop(0.4, this.color + '0.55)');
            gx.addColorStop(0.7, this.color + '0.25)');
            gx.addColorStop(1, 'hsla(220, 80%, 10%, 0)');
            
            ctx.fillStyle = gx;
            ctx.beginPath();
            // Draw deformed circle
            ctx.ellipse(
                this.x, this.y,
                s * (1 + this.deformation.x),
                s * (1 + this.deformation.y),
                Math.atan2(this.deformation.y, this.deformation.x),
                0, Math.PI * 2
            );
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
        
        while (blobs.length < BLOB_COUNT) blobs.push(new Blob());
    }

    let last = performance.now();
    function render(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';
        
        // Update and check collisions
        for (let i = 0; i < blobs.length; i++) {
            blobs[i].update(dt, now);
            // Check collisions with other blobs
            for (let j = i + 1; j < blobs.length; j++) {
                blobs[i].checkCollision(blobs[j]);
            }
        }

        // Draw all blobs
        blobs.forEach(blob => blob.draw(ctx));
        
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(render);
})();