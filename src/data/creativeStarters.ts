import type { GeneratedAppBundle } from '../types/project';

const SHARED_STUDIO_CSS = `:root {
  --ink: #f8fafc;
  --muted: #cbd5e1;
  --glass: rgba(10, 15, 28, 0.72);
  --border: rgba(255, 255, 255, 0.16);
  --accent: #f97316;
}
#stage {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
}
.hud-top {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  pointer-events: none;
  z-index: 20;
}
.hud-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  pointer-events: auto;
}
.hud-pill {
  background: var(--glass);
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 7px 12px;
  min-width: 78px;
  color: var(--ink);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}
.hud-pill small {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.hud-pill strong {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}
.hud-btn {
  min-height: 44px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--glass);
  color: var(--ink);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(12px);
}
.hud-btn.primary {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
}
.overlay-center {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(5, 8, 16, 0.56);
  backdrop-filter: blur(8px);
  z-index: 30;
}
.overlay-center.hidden { display: none; }
.overlay-card {
  width: 100%;
  max-width: 400px;
  background: rgba(13, 18, 32, 0.94);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 22px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}
.overlay-card h1 { margin: 0 0 8px; font-size: 1.4rem; }
.overlay-card p { margin: 0 0 16px; font-size: 0.9rem; color: var(--muted); line-height: 1.45; }
.touch-deck {
  position: fixed;
  bottom: max(14px, env(safe-area-inset-bottom));
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  pointer-events: none;
  z-index: 25;
}
.touch-group {
  display: flex;
  gap: 10px;
  pointer-events: auto;
}
.touch-pad-btn {
  min-width: 60px;
  min-height: 54px;
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(12, 17, 30, 0.72);
  color: #fff;
  font-weight: 800;
  font-size: 0.92rem;
  backdrop-filter: blur(10px);
  touch-action: none;
  cursor: pointer;
}
.touch-pad-btn:active, .touch-pad-btn.active {
  background: var(--accent);
  border-color: transparent;
  transform: scale(0.96);
}
@media (max-width: 600px) {
  .hud-pill { padding: 5px 9px; min-width: 64px; }
  .hud-pill strong { font-size: 0.9rem; }
}`;

function buildKenyanRallyStarter(): GeneratedAppBundle {
  return {
    projectTitle: 'Kenyan Savanna Rally 3D',
    description: 'Three.js 3D highway rally racer set on Kenyan Rift Valley tarmac & red murram roads.',
    summary:
      'Built Kenyan Savanna Rally 3D using Three.js with Rift Valley escarpment peaks, red murram shoulders, dashed tarmac highway, acacia trees, rival traffic, dust particles, nitro boost, and responsive touch + keyboard controls.',
    changedFiles: ['index.html', 'styles.css', 'scene.js'],
    followUpSuggestions: [
      'Add heavy Nairobi rain & headlights',
      'Add Nairobi-Mombasa highway signboards',
      'Switch to cockpit / hood camera toggle',
    ],
    htmlCode: `<div id="stage" aria-label="Kenyan Savanna Rally 3D viewport"></div>
<header class="hud-top">
  <div class="hud-pill-row">
    <div class="hud-pill"><small>Speed</small><strong id="hudSpeed">0 km/h</strong></div>
    <div class="hud-pill"><small>Distance</small><strong id="hudDist">0.0 km</strong></div>
    <div class="hud-pill"><small>Nitro</small><strong id="hudNitro">100%</strong></div>
    <div class="hud-pill"><small>Score</small><strong id="hudScore">0</strong></div>
  </div>
  <div class="hud-pill-row">
    <button type="button" id="btnDay" class="hud-btn">Sunset</button>
    <button type="button" id="btnRestart" class="hud-btn">Restart</button>
  </div>
</header>
<div id="startOverlay" class="overlay-center">
  <div class="overlay-card">
    <h1>Kenyan Savanna Rally 3D</h1>
    <p>Race along the Rift Valley tarmac highway! Dodge oncoming traffic, clip boost chevrons, and use Arrow keys / A-D + Space (Nitro) or touch controls below.</p>
    <button type="button" id="btnStart" class="hud-btn primary" style="width:100%">Start Rally</button>
  </div>
</div>
<div id="crashOverlay" class="overlay-center hidden">
  <div class="overlay-card">
    <h1>Stage Complete!</h1>
    <p id="crashStats">You covered 0.0 km across the savanna highway.</p>
    <button type="button" id="btnPlayAgain" class="hud-btn primary" style="width:100%">Race Again</button>
  </div>
</div>
<div class="touch-deck">
  <div class="touch-group">
    <button type="button" id="touchLeft" class="touch-pad-btn" aria-label="Steer Left">&larr;</button>
    <button type="button" id="touchRight" class="touch-pad-btn" aria-label="Steer Right">&rarr;</button>
  </div>
  <div class="touch-group">
    <button type="button" id="touchNitro" class="touch-pad-btn" aria-label="Nitro Boost">NITRO</button>
  </div>
</div>`,
    cssCode: SHARED_STUDIO_CSS,
    jsCode: `(function() {
  const stage = document.getElementById('stage');
  const speedEl = document.getElementById('hudSpeed');
  const distEl = document.getElementById('hudDist');
  const nitroEl = document.getElementById('hudNitro');
  const scoreEl = document.getElementById('hudScore');
  const startOverlay = document.getElementById('startOverlay');
  const crashOverlay = document.getElementById('crashOverlay');
  const crashStats = document.getElementById('crashStats');

  const scene = new THREE.Scene();
  let isSunset = false;
  scene.background = new THREE.Color(0x6ec3f4);
  scene.fog = new THREE.FogExp2(0x9fd9f4, 0.0085);

  const camera = new THREE.PerspectiveCamera(62, stage.clientWidth / Math.max(1, stage.clientHeight), 0.1, 320);
  camera.position.set(0, 4.3, 9.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.shadowMap.enabled = true;
  stage.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0xfff5e4, 0x8b4528, 0.95);
  scene.add(hemiLight);
  const sunLight = new THREE.DirectionalLight(0xfff0d6, 1.35);
  sunLight.position.set(22, 36, 18);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Kenyan red murram terrain & tarmac road
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x9c4d2e, roughness: 0.95 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(360, 460), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -140;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222630, roughness: 0.85 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 460), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, -140);
  road.receiveShadow = true;
  scene.add(road);

  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0xb95f38, roughness: 0.92 });
  [-6.8, 6.8].forEach((sx) => {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 460), shoulderMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(sx, 0.015, -140);
    scene.add(sh);
  });

  // Dashed yellow lane markers
  const dashes = [];
  const dashGeo = new THREE.PlaneGeometry(0.24, 3.6);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (let i = 0; i < 36; i++) {
    const d = new THREE.Mesh(dashGeo, dashMat);
    d.rotation.x = -Math.PI / 2;
    d.position.set(0, 0.035, 16 - i * 9);
    scene.add(d);
    dashes.push(d);
  }

  // Distant Rift Valley escarpment hills
  const ridgeGroup = new THREE.Group();
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x4b5c43, roughness: 0.95, flatShading: true });
  for (let i = 0; i < 18; i++) {
    const h = 16 + (i % 4) * 9;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(22 + (i % 3) * 8, h, 5), hillMat);
    const side = i % 2 === 0 ? -1 : 1;
    hill.position.set(side * (46 + (i % 5) * 14), h * 0.42, -30 - i * 16);
    ridgeGroup.add(hill);
  }
  scene.add(ridgeGroup);

  // Scenery: Umbrella acacia trees & Kenyan mileposts
  const scenery = [];
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3b24, roughness: 0.9 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x4b7434, roughness: 0.85, flatShading: true });
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

  function createAcacia(x, z) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 3.4, 6), trunkMat);
    trunk.position.y = 1.7;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 1.4, 0.9, 7), canopyMat);
    crown.position.y = 3.55;
    g.add(trunk, crown);
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }

  for (let i = 0; i < 32; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    scenery.push(createAcacia(side * (10.5 + (i % 5) * 4.5), 10 - i * 9.5));
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), postMat);
    post.position.set(side * 6.0, 0.47, 10 - i * 9.5);
    scene.add(post);
    scenery.push(post);
  }

  // Player Safari Rally 4x4
  function buildCar(bodyHex) {
    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.72, 3.8),
      new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.35, metalness: 0.25 })
    );
    body.position.y = 0.65;
    body.castShadow = true;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.62, 1.95),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    cabin.position.set(0, 1.24, -0.15);
    cabin.castShadow = true;
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.38, 1.55),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.6 })
    );
    glass.position.set(0, 1.26, -0.15);
    car.add(body, cabin, glass);
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    [[-0.95, 0.38, 1.15], [0.95, 0.38, 1.15], [-0.95, 0.38, -1.15], [0.95, 0.38, -1.15]].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      car.add(w);
    });
    return car;
  }

  const player = buildCar(0xef4444);
  player.position.set(0, 0, 2);
  scene.add(player);

  // Traffic rivals & nitro pads
  const traffic = [];
  const trafficColors = [0x10b981, 0x3b82f6, 0xf59e0b, 0xe11d48];
  const lanes = [-3.6, 0, 3.6];
  for (let i = 0; i < 6; i++) {
    const rival = buildCar(trafficColors[i % trafficColors.length]);
    rival.position.set(lanes[i % 3], 0, -45 - i * 32);
    scene.add(rival);
    traffic.push({ mesh: rival, laneSpeed: 12 + (i % 3) * 4 });
  }

  const boosts = [];
  const boostMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 4; i++) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 2.8), boostMat);
    pad.position.set(lanes[(i + 1) % 3], 0.06, -38 - i * 48);
    scene.add(pad);
    boosts.push(pad);
  }

  // Dust particle trail
  const dustCount = 48;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xd97706, size: 0.36, transparent: true, opacity: 0.65 }));
  scene.add(dustPts);

  let mode = 'start';
  let playerX = 0;
  let speed = 24;
  let nitro = 100;
  let distance = 0;
  let score = 0;
  const keys = { left: false, right: false, nitro: false };

  function resetGame(autoRun) {
    playerX = 0;
    speed = 26;
    nitro = 100;
    distance = 0;
    score = 0;
    player.position.set(0, 0, 2);
    player.rotation.set(0, 0, 0);
    traffic.forEach((t, i) => {
      t.mesh.position.set(lanes[i % 3], 0, -48 - i * 32);
    });
    boosts.forEach((b, i) => {
      b.position.set(lanes[(i + 1) % 3], 0.06, -38 - i * 48);
    });
    mode = autoRun ? 'play' : 'start';
    startOverlay.classList.toggle('hidden', autoRun);
    crashOverlay.classList.add('hidden');
  }

  document.getElementById('btnStart').addEventListener('click', () => resetGame(true));
  document.getElementById('btnPlayAgain').addEventListener('click', () => resetGame(true));
  document.getElementById('btnRestart').addEventListener('click', () => resetGame(true));
  document.getElementById('btnDay').addEventListener('click', (e) => {
    isSunset = !isSunset;
    e.currentTarget.textContent = isSunset ? 'Daylight' : 'Sunset';
    scene.background.setHex(isSunset ? 0xfb923c : 0x6ec3f4);
    scene.fog.color.setHex(isSunset ? 0xf97316 : 0x9fd9f4);
    hemiLight.intensity = isSunset ? 0.65 : 0.95;
    sunLight.color.setHex(isSunset ? 0xffa94d : 0xfff0d6);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.nitro = true;
    if (e.key === 'r' || e.key === 'R') resetGame(true);
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.nitro = false;
  });

  function bindTouch(id, prop) {
    const el = document.getElementById(id);
    const down = (ev) => { ev.preventDefault(); keys[prop] = true; el.classList.add('active'); };
    const up = (ev) => { ev.preventDefault(); keys[prop] = false; el.classList.remove('active'); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
  }
  bindTouch('touchLeft', 'left');
  bindTouch('touchRight', 'right');
  bindTouch('touchNitro', 'nitro');

  window.addEventListener('resize', () => {
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (mode === 'play') {
      const usingNitro = keys.nitro && nitro > 2;
      if (usingNitro) nitro = Math.max(0, nitro - dt * 28);
      else nitro = Math.min(100, nitro + dt * 11);

      const targetSpeed = usingNitro ? 62 : Math.min(46, 26 + distance * 2.4);
      speed += (targetSpeed - speed) * dt * 2.5;

      const steerDir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      playerX = Math.max(-5.1, Math.min(5.1, playerX + steerDir * dt * 11.5));
      player.position.x = playerX;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -steerDir * 0.11, dt * 10);
      player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, -steerDir * 0.08, dt * 10);

      distance += (speed * dt) / 140;
      score += Math.round(speed * dt * (usingNitro ? 3.5 : 1.8));

      dashes.forEach((d) => {
        d.position.z += speed * dt;
        if (d.position.z > 24) d.position.z -= 324;
      });
      scenery.forEach((s) => {
        s.position.z += speed * dt;
        if (s.position.z > 24) s.position.z -= 304;
      });

      for (const b of boosts) {
        b.position.z += speed * dt;
        if (Math.abs(b.position.z - player.position.z) < 2.2 && Math.abs(b.position.x - playerX) < 1.8) {
          nitro = 100;
          score += 150;
          b.position.z -= 190;
          b.position.x = lanes[Math.floor(Math.random() * 3)];
        } else if (b.position.z > 22) {
          b.position.z -= 192;
          b.position.x = lanes[Math.floor(Math.random() * 3)];
        }
      }

      for (const t of traffic) {
        t.mesh.position.z += (speed - t.laneSpeed) * dt;
        if (Math.abs(t.mesh.position.z - player.position.z) < 3.1 && Math.abs(t.mesh.position.x - playerX) < 1.65) {
          mode = 'crash';
          crashStats.textContent = 'You covered ' + distance.toFixed(1) + ' km and scored ' + score + ' pts on the Rift Valley road.';
          crashOverlay.classList.remove('hidden');
        } else if (t.mesh.position.z > 24) {
          t.mesh.position.z -= 196;
          t.mesh.position.x = lanes[Math.floor(Math.random() * 3)];
        }
      }

      // Dust particles
      const arr = dustGeo.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        arr[i * 3 + 2] += speed * dt * 0.7;
        arr[i * 3 + 1] += dt * 0.8;
        if (arr[i * 3 + 2] > 10 || arr[i * 3 + 1] > 1.8 || arr[i * 3 + 2] === 0) {
          arr[i * 3] = playerX + (Math.random() - 0.5) * 1.4;
          arr[i * 3 + 1] = 0.15 + Math.random() * 0.25;
          arr[i * 3 + 2] = 3.8 + Math.random() * 1.6;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerX * 0.65, dt * 6);
      camera.fov = THREE.MathUtils.lerp(camera.fov, usingNitro ? 74 : 62, dt * 6);
      camera.updateProjectionMatrix();
    } else {
      camera.position.x = Math.sin(clock.elapsedTime * 0.4) * 2.2;
    }

    camera.lookAt(player.position.x * 0.5, 1.3, -12);
    speedEl.textContent = Math.round(speed * 3.1) + ' km/h';
    distEl.textContent = distance.toFixed(1) + ' km';
    nitroEl.textContent = Math.round(nitro) + '%';
    scoreEl.textContent = String(score);
    renderer.render(scene, camera);
  }
  animate();
})();`,
  };
}

function buildSkyObbyStarter(): GeneratedAppBundle {
  return {
    projectTitle: 'Skyline Obby 3D',
    description: 'Three.js 3D floating-island platformer with jump physics, rotating hazards & crystal orbs.',
    summary:
      'Built Skyline Obby 3D using Three.js with floating sky platforms, spinning beam obstacles, glowing collectible crystals, shadow drop marker, and keyboard + mobile touch controls.',
    changedFiles: ['index.html', 'styles.css', 'scene.js'],
    followUpSuggestions: [
      'Add moving elevator platforms',
      'Switch world theme to volcanic lava',
      'Add double jump ability',
    ],
    htmlCode: `<div id="stage" aria-label="Skyline Obby 3D viewport"></div>
<header class="hud-top">
  <div class="hud-pill-row">
    <div class="hud-pill"><small>Orbs</small><strong id="hudScore">0 / 6</strong></div>
    <div class="hud-pill"><small>Platform</small><strong id="hudStage">1</strong></div>
  </div>
  <div class="hud-pill-row">
    <button type="button" id="btnRestart" class="hud-btn">Restart</button>
  </div>
</header>
<div id="winOverlay" class="overlay-center hidden">
  <div class="overlay-card">
    <h1>Summit Reached!</h1>
    <p id="winText">You collected every sky orb across the Three.js floating course.</p>
    <button type="button" id="btnReplay" class="hud-btn primary" style="width:100%">Play Again</button>
  </div>
</div>
<div class="touch-deck">
  <div class="touch-group">
    <button type="button" id="tLeft" class="touch-pad-btn">&larr;</button>
    <button type="button" id="tFwd" class="touch-pad-btn">&uarr;</button>
    <button type="button" id="tRight" class="touch-pad-btn">&rarr;</button>
  </div>
  <div class="touch-group">
    <button type="button" id="tJump" class="touch-pad-btn" style="background:rgba(56,189,248,0.85)">JUMP</button>
  </div>
</div>`,
    cssCode: SHARED_STUDIO_CSS,
    jsCode: `(function() {
  const stage = document.getElementById('stage');
  const scoreEl = document.getElementById('hudScore');
  const stageEl = document.getElementById('hudStage');
  const winOverlay = document.getElementById('winOverlay');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1633);
  scene.fog = new THREE.FogExp2(0x0b1633, 0.016);

  const camera = new THREE.PerspectiveCamera(60, stage.clientWidth / Math.max(1, stage.clientHeight), 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x93c5fd, 0x1e1b4b, 0.95));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
  dirLight.position.set(12, 24, 10);
  scene.add(dirLight);

  const platforms = [
    { x: 0, y: 0, z: 0, w: 6, d: 7, color: 0x38bdf8 },
    { x: 0, y: 0.7, z: -9, w: 4.5, d: 5, color: 0x818cf8 },
    { x: -3.2, y: 1.5, z: -16.5, w: 4.2, d: 4.5, color: 0x38bdf8 },
    { x: 1.8, y: 2.3, z: -24, w: 4.4, d: 5, color: 0xa855f7 },
    { x: 0, y: 3.1, z: -32.5, w: 5.5, d: 6.5, color: 0x10b981 },
  ];

  platforms.forEach((p) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(p.w, 0.7, p.d),
      new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.3, metalness: 0.2 })
    );
    mesh.position.set(p.x, p.y - 0.35, p.z);
    scene.add(mesh);
  });

  // Rotating hazard beam
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.35, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x881337 })
  );
  beam.position.set(1.8, 2.85, -24);
  scene.add(beam);

  // Player & shadow blob
  const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.65, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25 })
  );
  scene.add(player);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // Orbs
  const orbData = [
    [0, 1.2, -2], [0, 1.9, -9], [-3.2, 2.7, -16.5],
    [1.8, 3.6, -24], [0, 4.3, -31], [0, 4.6, -34],
  ];
  const orbs = orbData.map(([x, y, z]) => {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2 })
    );
    m.position.set(x, y, z);
    scene.add(m);
    return { mesh: m, taken: false };
  });

  let px = 0, py = 0.85, pz = 1.5, vy = 0, grounded = true, collected = 0;
  const keys = { l: false, r: false, f: false, b: false, j: false };

  function reset() {
    px = 0; py = 0.85; pz = 1.5; vy = 0; grounded = true; collected = 0;
    orbs.forEach((o) => { o.taken = false; o.mesh.visible = true; });
    winOverlay.classList.add('hidden');
  }
  reset();

  document.getElementById('btnRestart').addEventListener('click', reset);
  document.getElementById('btnReplay').addEventListener('click', reset);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.l = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.f = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.b = true;
    if (e.key === ' ') keys.j = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.l = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.f = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.b = false;
    if (e.key === ' ') keys.j = false;
  });

  function bindBtn(id, k) {
    const el = document.getElementById(id);
    const dn = (ev) => { ev.preventDefault(); keys[k] = true; el.classList.add('active'); };
    const up = (ev) => { ev.preventDefault(); keys[k] = false; el.classList.remove('active'); };
    el.addEventListener('pointerdown', dn);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }
  bindBtn('tLeft', 'l');
  bindBtn('tFwd', 'f');
  bindBtn('tRight', 'r');
  bindBtn('tJump', 'j');

  window.addEventListener('resize', () => {
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
  });

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    beam.rotation.y += dt * 2.1;

    const mx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
    const mz = (keys.b ? 1 : 0) - (keys.f ? 1 : 0);
    px += mx * dt * 6.5;
    pz += mz * dt * 7.2;

    if (keys.j && grounded) {
      vy = 9.4;
      grounded = false;
    }
    vy -= 22 * dt;
    py += vy * dt;

    grounded = false;
    let platNum = 1;
    let groundY = -40;
    platforms.forEach((p, idx) => {
      if (Math.abs(px - p.x) <= p.w * 0.5 + 0.25 && Math.abs(pz - p.z) <= p.d * 0.5 + 0.25) {
        groundY = Math.max(groundY, p.y);
        if (py - 0.72 <= p.y + 0.2 && py - 0.72 >= p.y - 0.8 && vy <= 0) {
          py = p.y + 0.72;
          vy = 0;
          grounded = true;
          platNum = idx + 1;
        }
      }
    });

    if (py < -8) {
      px = 0; py = 1.2; pz = 1.5; vy = 0;
    }

    player.position.set(px, py, pz);
    shadow.visible = groundY > -20;
    shadow.position.set(px, groundY + 0.03, pz);

    orbs.forEach((o) => {
      if (!o.taken) {
        o.mesh.rotation.y += dt * 2.5;
        if (o.mesh.position.distanceTo(player.position) < 1.15) {
          o.taken = true;
          o.mesh.visible = false;
          collected++;
          if (collected === orbs.length) winOverlay.classList.remove('hidden');
        }
      }
    });

    scoreEl.textContent = collected + ' / ' + orbs.length;
    stageEl.textContent = String(platNum);
    camera.position.lerp(new THREE.Vector3(px, py + 4.4, pz + 7.2), dt * 6);
    camera.lookAt(px, py + 0.4, pz - 3);
    renderer.render(scene, camera);
  }
  loop();
})();`,
  };
}

function buildSolarExplorerStarter(): GeneratedAppBundle {
  return {
    projectTitle: 'Orbital Atlas 3D',
    description: 'Interactive Three.js 3D solar system explorer with OrbitControls, starfield & focus camera.',
    summary:
      'Built Orbital Atlas 3D using Three.js and OrbitControls with glowing solar lighting, orbiting ringed planets, starfield points, orbital paths, and speed/focus controls.',
    changedFiles: ['index.html', 'styles.css', 'scene.js'],
    followUpSuggestions: [
      'Add glowing asteroid belt',
      'Show planet distance & orbital period cards',
      'Add spaceship fly-by animation',
    ],
    htmlCode: `<div id="stage" aria-label="Orbital Atlas 3D viewport"></div>
<header class="hud-top">
  <div class="hud-pill-row">
    <div class="hud-pill"><small>Focus</small><strong id="hudFocus">Sun System</strong></div>
    <button type="button" id="btnPause" class="hud-btn primary">Pause</button>
    <button type="button" id="btnNext" class="hud-btn">Next Planet</button>
  </div>
</header>
<div class="touch-deck">
  <div class="hud-pill" style="pointer-events:auto;min-width:190px">
    <small>Orbit Speed</small>
    <input id="speedSlider" type="range" min="0" max="3" step="0.1" value="1" style="width:100%" />
  </div>
</div>`,
    cssCode: SHARED_STUDIO_CSS,
    jsCode: `(function() {
  const stage = document.getElementById('stage');
  const focusEl = document.getElementById('hudFocus');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030612);

  const camera = new THREE.PerspectiveCamera(55, stage.clientWidth / Math.max(1, stage.clientHeight), 0.1, 400);
  camera.position.set(0, 16, 30);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0x334155, 0.7));
  const sunLight = new THREE.PointLight(0xffdd99, 2.8, 120);
  scene.add(sunLight);

  // Starfield
  const starsGeo = new THREE.BufferGeometry();
  const starArr = new Float32Array(1200 * 3);
  for (let i = 0; i < starArr.length; i++) starArr[i] = (Math.random() - 0.5) * 240;
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.35 })));

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  scene.add(sun);

  const specs = [
    { name: 'Mercury', r: 0.45, dist: 5.5, speed: 1.7, color: 0x94a3b8 },
    { name: 'Earth', r: 0.85, dist: 9.2, speed: 1.1, color: 0x3b82f6 },
    { name: 'Mars', r: 0.65, dist: 13.0, speed: 0.8, color: 0xef4444 },
    { name: 'Saturn', r: 1.45, dist: 18.5, speed: 0.48, color: 0xfde68a, ring: true },
  ];

  const planets = specs.map((s, idx) => {
    const orbit = new THREE.Mesh(
      new THREE.RingGeometry(s.dist - 0.04, s.dist + 0.04, 72),
      new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide })
    );
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(s.r, 24, 24),
      new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.65 })
    );
    if (s.ring) {
      const rMesh = new THREE.Mesh(
        new THREE.RingGeometry(s.r * 1.4, s.r * 2.25, 48),
        new THREE.MeshBasicMaterial({ color: 0xfcd34d, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
      );
      rMesh.rotation.x = Math.PI / 2.4;
      mesh.add(rMesh);
    }
    scene.add(mesh);
    return { ...s, mesh, angle: idx * 1.4 };
  });

  let paused = false;
  let speedScale = 1;
  let focusIndex = -1;

  document.getElementById('btnPause').addEventListener('click', (e) => {
    paused = !paused;
    e.currentTarget.textContent = paused ? 'Resume' : 'Pause';
  });
  document.getElementById('btnNext').addEventListener('click', () => {
    focusIndex = focusIndex >= planets.length - 1 ? -1 : focusIndex + 1;
    focusEl.textContent = focusIndex === -1 ? 'Sun System' : planets[focusIndex].name;
  });
  document.getElementById('speedSlider').addEventListener('input', (e) => {
    speedScale = parseFloat(e.currentTarget.value);
  });

  window.addEventListener('resize', () => {
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!paused) {
      planets.forEach((p) => {
        p.angle += dt * p.speed * speedScale;
        p.mesh.position.set(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
        p.mesh.rotation.y += dt * 0.8;
      });
    }
    const targetPos = focusIndex === -1 ? new THREE.Vector3(0, 0, 0) : planets[focusIndex].mesh.position;
    controls.target.lerp(targetPos, 0.08);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();`,
  };
}

function buildKineticWaveStarter(): GeneratedAppBundle {
  return {
    projectTitle: 'Kinetic Wave 3D',
    description: 'Interactive Three.js 3D kinetic sculpture animation with OrbitControls & wave themes.',
    summary:
      'Built Kinetic Wave 3D with Three.js instanced 3D pillars, OrbitControls, interactive palette switcher, and real-time amplitude control.',
    changedFiles: ['index.html', 'styles.css', 'scene.js'],
    followUpSuggestions: [
      'Add pulsing glowing particle rain',
      'Add auto-camera cinematic flythrough',
      'Create a 2D audio waveform HUD bar',
    ],
    htmlCode: `<div id="stage" aria-label="Kinetic Wave 3D viewport"></div>
<header class="hud-top">
  <div class="hud-pill-row">
    <div class="hud-pill"><small>Mode</small><strong>Kinetic 3D</strong></div>
    <button type="button" id="btnTheme" class="hud-btn primary">Theme: Nebula</button>
  </div>
</header>
<div class="touch-deck">
  <div class="hud-pill" style="pointer-events:auto;min-width:190px">
    <small>Wave Energy</small>
    <input id="ampSlider" type="range" min="0.4" max="3" step="0.1" value="1.5" style="width:100%" />
  </div>
</div>`,
    cssCode: SHARED_STUDIO_CSS,
    jsCode: `(function() {
  const stage = document.getElementById('stage');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070914);
  scene.fog = new THREE.FogExp2(0x070914, 0.022);

  const camera = new THREE.PerspectiveCamera(54, stage.clientWidth / Math.max(1, stage.clientHeight), 0.1, 150);
  camera.position.set(16, 13, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.75;

  scene.add(new THREE.HemisphereLight(0xc084fc, 0x0f172a, 1.0));
  const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
  keyLight.position.set(12, 22, 10);
  scene.add(keyLight);

  const GRID = 18;
  const count = GRID * GRID;
  const mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.25, metalness: 0.5 });
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.65, 1, 0.65), mat, count);
  scene.add(bars);

  const themes = [
    { name: 'Nebula', color: 0xa855f7, light: 0x38bdf8 },
    { name: 'Savanna', color: 0xf97316, light: 0xfacc15 },
    { name: 'Emerald', color: 0x10b981, light: 0x22d3ee },
  ];
  let themeIdx = 0;
  let amp = 1.5;

  document.getElementById('btnTheme').addEventListener('click', (e) => {
    themeIdx = (themeIdx + 1) % themes.length;
    const t = themes[themeIdx];
    e.currentTarget.textContent = 'Theme: ' + t.name;
    mat.color.setHex(t.color);
    keyLight.color.setHex(t.light);
  });
  document.getElementById('ampSlider').addEventListener('input', (e) => {
    amp = parseFloat(e.currentTarget.value);
  });

  window.addEventListener('resize', () => {
    camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
  });

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    let idx = 0;
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const wx = x - GRID / 2;
        const wz = z - GRID / 2;
        const dist = Math.hypot(wx, wz);
        const h = Math.max(0.3, 1.4 + Math.sin(dist * 0.55 - t * 2.6) * amp + Math.cos(wx * 0.4 + t) * 0.45);
        dummy.position.set(wx * 0.9, h * 0.5, wz * 0.9);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        bars.setMatrixAt(idx++, dummy.matrix);
      }
    }
    bars.instanceMatrix.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();`,
  };
}

export function buildCreativeStarterBundle(blueprintId: string): GeneratedAppBundle {
  switch (blueprintId) {
    case 'neon_sky_obby_3d':
      return buildSkyObbyStarter();
    case 'solar_system_3d':
      return buildSolarExplorerStarter();
    case 'kinetic_wave_studio':
      return buildKineticWaveStarter();
    case 'kenyan_3d_rally':
    default:
      return buildKenyanRallyStarter();
  }
}
