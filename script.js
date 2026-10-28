(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav background on scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll reveal
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (e.target.dataset.d || 0) + 'ms';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el, i) => { el.dataset.d = (i % 4) * 90; io.observe(el); });
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Three.js particle hero
  const canvas = document.getElementById('hero-canvas');
  if (!window.THREE || !canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 7;

  const COUNT = window.innerWidth < 700 ? 1400 : 3200;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const palette = ['#7C5CFF', '#22D3EE', '#F472B6'].map((c) => new THREE.Color(c));
  for (let i = 0; i < COUNT; i++) {
    // Points on a thick spherical shell, so the cloud reads as a galaxy
    const r = 3 + Math.random() * 4;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t) * 1.4;
    pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.8;
    pos[i * 3 + 2] = r * Math.cos(p);
    const c = palette[Math.floor(Math.random() * 3)];
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;
    points.rotation.y = t * 0.05 + mouse.x * 0.35;
    points.rotation.x = mouse.y * 0.2 + Math.sin(t * 0.2) * 0.05;
    camera.position.z = 7 - Math.min(window.scrollY / 400, 2);
    renderer.render(scene, camera);
  }
  if (reduce) { renderer.render(scene, camera); } else { frame(); }
})();
