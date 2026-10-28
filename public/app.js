// Smooth-scroll buttons
function scrollToId(id){ document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
document.querySelectorAll('[data-scroll]').forEach(b => b.addEventListener('click', () => scrollToId(b.dataset.scroll)));

// Reveal the existing homepage when the full-screen brand intro finishes.
(function(){
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');
  if (!splash || !app) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  function revealApp(){
    if (finished) return;
    finished = true;
    splash.classList.add('hide');
    window.setTimeout(() => {
      splash.remove();
      app.classList.add('is-visible');
      app.removeAttribute('aria-hidden');
      document.body.classList.remove('splash-loading');
    }, reduce ? 180 : 450);
  }

  splash.addEventListener('click', revealApp);
  const startIntro = () => window.setTimeout(revealApp, 1600);
  if (document.readyState === 'complete') startIntro();
  else window.addEventListener('load', startIntro, { once: true });
})();

// Package buttons pre-select the package in the booking form
const packageSelect = document.getElementById('packageSelect');
document.querySelectorAll('[data-package]').forEach(b => b.addEventListener('click', () => {
  if (packageSelect) packageSelect.value = b.dataset.package;
  scrollToId('contact');
}));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Subtle 3D tilt on gallery tiles
document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// 3D REDBERRY scene: a glowing particle berry with orbiting rings, drawn on a 2D canvas
(function(){
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('c');
  if (!stage || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Berry body: fibonacci sphere, slightly heart-shaped (wider top, pointed bottom)
  const pts = [];
  const N = 520;
  for (let i = 0; i < N; i++){
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * Math.PI * (3 - Math.sqrt(5));
    const taper = y < 0 ? 1 + y * 0.35 : 1;
    pts.push({ x: Math.cos(th) * r * taper, y: -y * 1.12, z: Math.sin(th) * r * taper, seed: Math.random() });
  }
  // Leaves on top
  const leaves = [];
  for (let k = 0; k < 5; k++){
    const a = k / 5 * Math.PI * 2;
    for (let t = 0; t <= 1; t += 0.08){
      leaves.push({ x: Math.cos(a) * t * 0.6, y: -1.12 - Math.sin(t * Math.PI) * 0.18, z: Math.sin(a) * t * 0.6 });
    }
  }
  // Orbiting rings (camera-lens / film reel feel)
  const rings = [];
  for (let k = 0; k < 2; k++){
    for (let i = 0; i < 90; i++){
      const a = i / 90 * Math.PI * 2;
      rings.push({ a, k, R: 1.7 + k * 0.35 });
    }
  }

  let rotX = -0.25, rotY = 0, targetX = -0.25, targetY = 0, pulse = 0, t = 0;

  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    targetY = ((e.clientX - r.left) / r.width - .5) * 2.2;
    targetX = -0.25 + ((e.clientY - r.top) / r.height - .5) * 1.2;
  });
  stage.addEventListener('click', () => { pulse = 1; });

  function project(x, y, z, scale){
    const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
    let X = x * cy - z * sy, Z = x * sy + z * cy;
    let Y = y * cx - Z * sx; Z = y * sx + Z * cx;
    const p = 3.6 / (3.6 + Z);
    return { sx: W / 2 + X * scale * p, sy: H / 2 + Y * scale * p, z: Z, p };
  }

  function frame(){
    t += reduce ? 0 : 0.008;
    rotX += (targetX - rotX) * 0.06;
    rotY += ((targetY + t) - rotY) * 0.06;
    pulse *= 0.95;
    const scale = Math.min(W, H) * 0.24 * (1 + pulse * 0.12);

    ctx.clearRect(0, 0, W, H);

    // Core glow
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, scale * (2.2 + pulse * 1.2));
    g.addColorStop(0, `rgba(255,47,109,${0.35 + pulse * 0.4})`);
    g.addColorStop(0.45, `rgba(181,23,255,${0.16 + pulse * 0.2})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const draw = [];
    for (const q of pts){
      const wob = 1 + Math.sin(t * 6 + q.seed * 10) * 0.015 + pulse * 0.08 * q.seed;
      const s = project(q.x * wob, q.y * wob, q.z * wob, scale);
      draw.push({ ...s, type: 0, seed: q.seed });
    }
    for (const q of leaves) draw.push({ ...project(q.x, q.y, q.z, scale), type: 1 });
    for (const r of rings){
      const a = r.a + t * (r.k ? -1.4 : 1);
      const tilt = r.k ? 0.9 : -0.5;
      const x = Math.cos(a) * r.R, z = Math.sin(a) * r.R;
      draw.push({ ...project(x, z * Math.sin(tilt) * 0.5, z * Math.cos(tilt), scale), type: 2, k: r.k });
    }
    draw.sort((a, b) => b.z - a.z);

    ctx.globalCompositeOperation = 'lighter';
    for (const d of draw){
      const depth = Math.max(0, Math.min(1, (1.6 - d.z) / 3.2));
      let color, size;
      if (d.type === 0){
        const mix = d.seed;
        color = mix > .66 ? '255,79,216' : mix > .33 ? '255,47,109' : '181,23,255';
        size = (1.2 + depth * 2.4) * d.p;
      } else if (d.type === 1){
        color = '120,255,190'; size = (1.4 + depth * 1.8) * d.p;
      } else {
        color = d.k ? '181,23,255' : '255,255,255'; size = (0.8 + depth * 1.6) * d.p;
      }
      ctx.fillStyle = `rgba(${color},${0.25 + depth * 0.75})`;
      ctx.beginPath(); ctx.arc(d.sx, d.sy, size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  frame();
})();

