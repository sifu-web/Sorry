// background.js
// Ambient depth background: soft drifting "note" particles on a 2D canvas,
// evoking floating apology notes without leaning on WebGL. If canvas 2D
// isn't available, or the user prefers reduced motion, we fall back to a
// purely-CSS animated gradient (see .bg-css / .blob in styles.css) so the
// core app never depends on it.

const PALETTE = ["#ff7086", "#8f7bff", "#5eead4"];

export function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  const cssLayer = document.getElementById("bg-css");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (!ctx || reducedMotion) {
    // Fall back to the gentle CSS blob background.
    if (canvas) canvas.style.display = "none";
    if (cssLayer) cssLayer.classList.add("is-active");
    return;
  }

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;
  let running = true;

  function particleCountFor(w, h) {
    const area = w * h;
    // Keep it light: roughly one particle per ~55,000px^2, capped.
    return Math.max(14, Math.min(46, Math.round(area / 55000)));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    const count = particleCountFor(width, height);
    particles = new Array(count).fill(null).map(() => makeParticle());
  }

  function makeParticle() {
    const size = 10 + Math.random() * 22;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.0006,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: -0.05 - Math.random() * 0.16,
      opacity: 0.05 + Math.random() * 0.1,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.0006 + Math.random() * 0.0008,
    };
  }

  function drawNote(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    const r = p.size * 0.22;
    const w = p.size;
    const h = p.size * 1.15;
    roundRect(-w / 2, -h / 2, w, h, r);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function step(time) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.05;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y < -40) {
        p.y = height + 40;
        p.x = Math.random() * width;
      }
      if (p.x < -40) p.x = width + 40;
      if (p.x > width + 40) p.x = -40;

      drawNote(p);
    }

    rafId = requestAnimationFrame(step);
  }

  resize();
  rafId = requestAnimationFrame(step);

  window.addEventListener("resize", debounce(resize, 200));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!running) {
      running = true;
      rafId = requestAnimationFrame(step);
    }
  });
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
