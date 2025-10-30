(function () {
  const canvas = document.getElementById('smoke');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0, dpr = 1;
  const layers = [];
  const LAYER_COUNT = 2; // Reduced for performance
  const PARTICLES_PER_LAYER = [8, 6]; // Reduced for performance

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor(layerIndex) {
      this.layer = layerIndex;
      this.reset(true);
    }
    reset(initial = false) {
      this.x = rand(-w * 0.2, w * 1.2);
      this.y = rand(-h * 0.2, h * 1.2);
      this.size = rand(100 + this.layer * 30, 200 + this.layer * 60);
      this.alpha = rand(0.03, 0.1) * (1 - this.layer * 0.1);
      this.speed = rand(4 + this.layer * 1.5, 12 + this.layer * 4);
      this.angle = rand(0, Math.PI * 2);
      this.noiseOffset = rand(0, 1000);
    }
    update(dt, t) {
      this.angle += (Math.sin((t + this.noiseOffset) * 0.0006) * 0.5) * (0.2 + this.layer * 0.06);
      this.x += Math.cos(this.angle) * this.speed * dt * 0.3;
      this.y += Math.sin(this.angle * 0.6) * this.speed * dt * 0.25;
      
      if (this.x < -this.size) this.x = w + this.size;
      if (this.x > w + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = h + this.size;
      if (this.y > h + this.size) this.y = -this.size;
    }
    draw(ctx) {
      ctx.save();
      const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size);
      g.addColorStop(0, `rgba(220,220,235,${this.alpha})`);
      g.addColorStop(0.35, `rgba(180,190,210,${this.alpha * 0.7})`);
      g.addColorStop(1, 'rgba(20,25,40,0)');
      ctx.fillStyle = g;
      if ('filter' in ctx) ctx.filter = `blur(${20 + this.layer * 8}px)`;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      if ('filter' in ctx) ctx.filter = 'none';
    }
  }

  function init() {
    resize();
    layers.length = 0;
    for (let L = 0; L < LAYER_COUNT; L++) {
      const particles = [];
      for (let i = 0; i < PARTICLES_PER_LAYER[L]; i++) {
        particles.push(new Particle(L));
      }
      layers.push(particles);
    }
  }

  let last = performance.now();
  let frameId = null;

  function render(now) {
    frameId = requestAnimationFrame(render);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(6,10,18,0.15)';
    ctx.fillRect(0, 0, w, h);

    for (let L = 0; L < layers.length; L++) {
      const particles = layers[L];
      for (let p of particles) {
        p.update(dt, now);
      }
      ctx.globalCompositeOperation = L === 0 ? 'lighter' : 'screen';
      for (let p of particles) p.draw(ctx);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  init();
  frameId = requestAnimationFrame(render);

  // Stop animation when page is not visible (performance optimization)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      frameId = requestAnimationFrame(render);
    }
  });
})();