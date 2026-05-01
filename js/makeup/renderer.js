// === Glamour Studio — renderer / scene / lighting ===
// Studio setup: 3-point lighting + cyan rim, ACES tone mapping, soft shadows,
// procedural env map (PMREM) for nicer reflections, curved seamless backdrop.
window.MK = window.MK || {};

MK.render = {
  renderer: null,
  scene: null,
  rootGroup: null,
  podium: null,
  podiumRing: null,
  podiumGlow: null,
  ambient: null,
  hemi: null,
  keyLight: null,
  fillLight: null,
  rimLight: null,
  kicker: null,
  backdrop: null,
  themeColor: 0xff4f95,
  envMap: null
};

MK.initRenderer = function () {
  const R = MK.render;
  const canvas = document.getElementById('mk-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10;
  }
  // Physically correct lights (newer Three uses useLegacyLights = false)
  if ('useLegacyLights' in renderer) renderer.useLegacyLights = false;
  if ('physicallyCorrectLights' in renderer) renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  R.renderer = renderer;

  const scene = new THREE.Scene();
  // Painted background with vertical gradient (drawn into a small canvas → texture)
  scene.background = MK._buildSkyTexture();
  R.scene = scene;

  // Procedural environment map for MeshStandardMaterial reflections
  R.envMap = MK._buildEnvMap(renderer);
  scene.environment = R.envMap;

  // ====== STUDIO LIGHTING ======
  R.ambient = new THREE.AmbientLight(0xb0a0d8, 0.40);
  scene.add(R.ambient);

  R.hemi = new THREE.HemisphereLight(0xffe6f6, 0x1a0830, 0.65);
  R.hemi.position.set(0, 8, 0);
  scene.add(R.hemi);

  // Key light — warm, slightly above and to the right
  R.keyLight = new THREE.DirectionalLight(0xfff0d8, 2.4);
  R.keyLight.position.set(3.0, 5.5, 4.0);
  R.keyLight.castShadow = true;
  R.keyLight.shadow.mapSize.set(2048, 2048);
  R.keyLight.shadow.camera.near = 0.5;
  R.keyLight.shadow.camera.far = 18;
  R.keyLight.shadow.camera.left = -2.2;
  R.keyLight.shadow.camera.right = 2.2;
  R.keyLight.shadow.camera.top = 3.4;
  R.keyLight.shadow.camera.bottom = -1.0;
  R.keyLight.shadow.bias = -0.0004;
  R.keyLight.shadow.normalBias = 0.02;
  R.keyLight.shadow.radius = 6;
  scene.add(R.keyLight);

  // Fill — cooler, opposite side, no shadow
  R.fillLight = new THREE.DirectionalLight(0xc8d6ff, 0.85);
  R.fillLight.position.set(-3.5, 2.5, 1.5);
  scene.add(R.fillLight);

  // Rim — cyan from behind to detach silhouette
  R.rimLight = new THREE.DirectionalLight(0x80f0ff, 1.4);
  R.rimLight.position.set(-1.5, 3.0, -4.5);
  scene.add(R.rimLight);

  // Kicker — pink/theme tinted from below-back, hair shine + dramatic glow
  R.kicker = new THREE.DirectionalLight(0xff7ec0, 0.95);
  R.kicker.position.set(2.5, 2.0, -3.5);
  scene.add(R.kicker);


  // ====== BACKDROP ======
  // Curved studio cyclorama (floor + back fade into one)
  const backdrop = MK._buildBackdrop();
  scene.add(backdrop);
  R.backdrop = backdrop;

  // ====== PODIUM ======
  const podiumGroup = new THREE.Group();

  const podiumGeom = new THREE.CylinderGeometry(1.1, 1.25, 0.16, 64);
  const podiumMat = new THREE.MeshStandardMaterial({
    color: 0x231235, roughness: 0.22, metalness: 0.55,
    envMapIntensity: 0.9
  });
  const podium = new THREE.Mesh(podiumGeom, podiumMat);
  podium.receiveShadow = true;
  podium.position.y = -0.08;
  podiumGroup.add(podium);

  // Top decorative disc (slightly inset)
  const topDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 1.08, 0.012, 64),
    new THREE.MeshStandardMaterial({
      color: 0x140821, roughness: 0.15, metalness: 0.3,
      emissive: 0x2a1240, emissiveIntensity: 0.4
    })
  );
  topDisc.position.y = 0.005;
  topDisc.receiveShadow = true;
  podiumGroup.add(topDisc);

  // Glow ring
  const ringGeom = new THREE.RingGeometry(1.10, 1.18, 96);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff4f95, side: THREE.DoubleSide, transparent: true, opacity: 0.85
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  podiumGroup.add(ring);
  R.podiumRing = ring;

  // Soft glow underneath (additive disc)
  const glowGeom = new THREE.CircleGeometry(2.0, 64);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff4f95, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.001;
  podiumGroup.add(glow);
  R.podiumGlow = glow;

  scene.add(podiumGroup);
  R.podium = podiumGroup;

  // Floor shadow catcher (extends beyond podium for natural shadow falloff)
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.ShadowMaterial({ opacity: 0.5 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.001;
  floor.receiveShadow = true;
  scene.add(floor);

  // Painted contact shadow (radial gradient texture) — anchors the character even in low light
  const contactCanvas = document.createElement('canvas');
  contactCanvas.width = 256; contactCanvas.height = 256;
  const cc = contactCanvas.getContext('2d');
  const cg = cc.createRadialGradient(128, 128, 0, 128, 128, 128);
  cg.addColorStop(0, 'rgba(0,0,0,0.55)');
  cg.addColorStop(0.5, 'rgba(0,0,0,0.20)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  cc.fillStyle = cg; cc.fillRect(0, 0, 256, 256);
  const contactTex = new THREE.CanvasTexture(contactCanvas);
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.55),
    new THREE.MeshBasicMaterial({
      map: contactTex, transparent: true, depthWrite: false, opacity: 1
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.018;
  scene.add(contactShadow);
  R.contactShadow = contactShadow;

  // Root group for character
  R.rootGroup = new THREE.Group();
  scene.add(R.rootGroup);

  window.addEventListener('resize', MK.onResize);
  window.addEventListener('orientationchange', () => setTimeout(MK.onResize, 200));
};

// ====== BACKDROP BUILDER ======
MK._buildBackdrop = function () {
  // Curved cyclorama with vertical gradient + floor that bends seamlessly into the wall.
  const g = new THREE.Group();

  // 1) Curved back wall (half-cylinder, inside facing camera)
  const wallGeom = new THREE.CylinderGeometry(7, 7, 14, 48, 1, true, -Math.PI * 0.5, Math.PI);
  const wallMat = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    roughness: 0.85,
    metalness: 0.0,
    map: MK._buildBackdropTexture()
  });
  const wall = new THREE.Mesh(wallGeom, wallMat);
  wall.position.y = 5.5;
  wall.position.z = -1.5;
  wall.receiveShadow = false;
  g.add(wall);

  // 2) Smooth floor disc behind/under podium with same dark hue
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a0d2e, roughness: 0.7, metalness: 0.2
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.005;
  floor.receiveShadow = true;
  g.add(floor);

  return g;
};

// ====== TEXTURE BUILDERS ======
MK._buildSkyTexture = function () {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0.00, '#0a0314');
  grd.addColorStop(0.45, '#26113f');
  grd.addColorStop(0.75, '#5a1f6b');
  grd.addColorStop(1.00, '#8a2c7a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
};

MK._buildBackdropTexture = function () {
  // Vertical gradient with a soft circular spotlight glow behind the character
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  // Base gradient
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.0, '#1f0f3a');
  g.addColorStop(0.5, '#3b1959');
  g.addColorStop(1.0, '#5a2570');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  // Spotlight halo
  const halo = ctx.createRadialGradient(256, 220, 30, 256, 220, 220);
  halo.addColorStop(0, 'rgba(255,180,220,0.45)');
  halo.addColorStop(0.5, 'rgba(255,120,200,0.18)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
};

// ====== ENVIRONMENT MAP (PMREM) ======
MK._buildEnvMap = function (renderer) {
  // Build a tiny equirect HDR-ish texture from a canvas, then PMREM it.
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  // Ground (bottom)
  const gFloor = ctx.createLinearGradient(0, 80, 0, 128);
  gFloor.addColorStop(0, '#3a1f5e');
  gFloor.addColorStop(1, '#0a0214');
  ctx.fillStyle = gFloor; ctx.fillRect(0, 80, 256, 48);
  // Sky (top)
  const gSky = ctx.createLinearGradient(0, 0, 0, 80);
  gSky.addColorStop(0, '#ffd9ec');
  gSky.addColorStop(0.5, '#9a6dff');
  gSky.addColorStop(1, '#3b1959');
  ctx.fillStyle = gSky; ctx.fillRect(0, 0, 256, 80);
  // Bright "sun" spot (key)
  let glow = ctx.createRadialGradient(180, 30, 0, 180, 30, 60);
  glow.addColorStop(0, 'rgba(255,235,200,1)');
  glow.addColorStop(1, 'rgba(255,235,200,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 256, 80);
  // Cyan rim spot
  glow = ctx.createRadialGradient(40, 50, 0, 40, 50, 50);
  glow.addColorStop(0, 'rgba(140,230,255,0.9)');
  glow.addColorStop(1, 'rgba(140,230,255,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 256, 80);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;

  if (THREE.PMREMGenerator) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose();
    tex.dispose();
    return env;
  }
  return tex;
};

MK.onResize = function () {
  const w = window.innerWidth, h = window.innerHeight;
  MK.render.renderer.setSize(w, h, false);
  if (MK.cam && MK.cam.camera) {
    MK.cam.camera.aspect = w / h;
    MK.cam.camera.updateProjectionMatrix();
  }
  if (MK.render.composer) {
    MK.render.composer.setSize(w, h);
    if (MK.render.bloomPass) MK.render.bloomPass.setSize(w, h);
  }
};

// ====== POSTPROCESSING (bloom) ======
// Called from game.js boot AFTER initCamera so the camera is available for RenderPass.
MK.initPostprocessing = function () {
  const R = MK.render;
  if (!THREE.EffectComposer || !THREE.UnrealBloomPass || !MK.cam || !MK.cam.camera) return;

  const composer = new THREE.EffectComposer(R.renderer);
  composer.setPixelRatio(R.renderer.getPixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);

  // 1. Render the scene
  const renderPass = new THREE.RenderPass(R.scene, MK.cam.camera);
  composer.addPass(renderPass);

  // 2. Soft bloom for premium glow on highlights / makeup / podium ring
  const bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45,   // strength — restrained so skin/clothes don't blow out
    0.55,   // radius
    0.82    // threshold — only the brightest pixels bloom
  );
  composer.addPass(bloom);

  R.composer = composer;
  R.bloomPass = bloom;
};

// Tweak bloom from theme (e.g., redcarpet = stronger glow)
MK.setBloomStrength = function (v) {
  if (MK.render.bloomPass) MK.render.bloomPass.strength = v;
};

MK.setThemeColor = function (hex) {
  MK.render.themeColor = hex;
  if (MK.render.podiumRing) MK.render.podiumRing.material.color.setHex(hex);
  if (MK.render.podiumGlow) MK.render.podiumGlow.material.color.setHex(hex);
  if (MK.render.kicker) {
    const c = new THREE.Color(hex);
    MK.render.kicker.color.lerp(c, 0.6);
  }
};

MK.startLoop = function () {
  const clock = new THREE.Clock();
  const tick = () => {
    const dt = clock.getDelta();
    if (MK.cam && MK.cam.update) MK.cam.update(dt);
    if (MK.player && MK.player.update) MK.player.update(dt);
    const t = performance.now() * 0.001;
    if (MK.render.podiumRing) {
      MK.render.podiumRing.material.opacity = 0.65 + 0.2 * Math.sin(t * 1.6);
    }
    if (MK.render.podiumGlow) {
      MK.render.podiumGlow.material.opacity = 0.16 + 0.06 * Math.sin(t * 1.6);
    }
    if (MK.render.composer) {
      MK.render.composer.render();
    } else {
      MK.render.renderer.render(MK.render.scene, MK.cam.camera);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
