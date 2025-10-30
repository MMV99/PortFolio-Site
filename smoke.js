(function () {
  const canvas = document.getElementById('smoke');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0, dpr = 1;
  const layers = [];
  const LAYER_COUNT = 3;
  const PARTICLES_PER_LAYER = [12, 10, 8]; // finer -> coarser

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
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
      this.size = rand(120 + this.layer * 40, 260 + this.layer * 80);
      this.alpha = rand(0.035, 0.12) * (1 - this.layer * 0.12);
      this.speed = rand(5 + this.layer * 2, 18 + this.layer * 6);
      this.angle = rand(0, Math.PI * 2);
      this.noiseOffset = rand(0, 1000);
    }
    update(dt, t) {
      // organic drift using layered sine noise
      this.angle += (Math.sin((t + this.noiseOffset) * 0.0008) * 0.6) * (0.2 + this.layer * 0.08);
      this.x += Math.cos(this.angle) * this.speed * dt * 0.4;
      this.y += Math.sin(this.angle * 0.6) * this.speed * dt * 0.35;
      // wrap around edges softly
      if (this.x < -this.size) this.x = w + this.size;
      if (this.x > w + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = h + this.size;
      if (this.y > h + this.size) this.y = -this.size;
    }
    draw(ctx) {
      // use heavy blur filter for soft smoke (fallback if filter unsupported is acceptable)
      ctx.save();
      // draw a radial gradient circle
      const g = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size);
      g.addColorStop(0, `rgba(220,220,235,${this.alpha})`);
      g.addColorStop(0.35, `rgba(180,190,210,${this.alpha * 0.7})`);
      g.addColorStop(1, 'rgba(20,25,40,0)');
      ctx.fillStyle = g;
      // lightweight blur if supported
      if ('filter' in ctx) ctx.filter = `blur(${26 + this.layer * 10}px)`;
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
  function render(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // clear with slight transparency to get smooth motion trail
    ctx.clearRect(0, 0, w, h);

    // darken slightly then draw light smoke on top
    ctx.fillStyle = 'rgba(6,10,18,0.20)';
    ctx.fillRect(0, 0, w, h);

    // draw each layer back-to-front for depth
    for (let L = 0; L < layers.length; L++) {
      const particles = layers[L];
      for (let p of particles) {
        p.update(dt, now);
      }
      // draw layer with small additive glow
      ctx.globalCompositeOperation = L === 0 ? 'lighter' : 'screen';
      for (let p of particles) p.draw(ctx);
    }
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  init();
  requestAnimationFrame(render);
})();