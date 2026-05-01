// === Merge Fortress TD — Premium 3D rendering setup ===
// Cinematic lighting, soft shadows, ACES tone mapping, perspective camera (low FOV),
// pan/zoom, dynamic impact lights, sky gradient.

window.MF = window.MF || {};

MF.three = {
  renderer: null,
  scene: null,
  camera: null,
  ambient: null,
  hemi: null,
  keyLight: null,
  fillLight: null,
  rimLight: null,
  worldGroup: null,
  fxGroup: null,
  skyDome: null,
  // Camera control state
  camTilt: Math.PI / 3.5,        // angle from horizontal (~51°)
  camDistance: 30,                // perspective distance
  camFov: 24,                     // low FOV → near-ortho with subtle perspective depth
  camOffset: { x: 0, z: 0 },
  camZoom: 1,
  shakeT: 0, shakeAmp: 0,
  // Dynamic lights pool for impacts
  impactLights: [],
  maxImpactLights: 4
};

MF.initThree = function(){
  var T = MF.three;
  var canvas = document.getElementById('mf-canvas');
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Cinematic tone mapping
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }
  // Soft shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  T.renderer = renderer;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x12081e);
  scene.fog = null;     // Pas de voile gris au zoom
  T.scene = scene;

  // Perspective camera with LOW fov (gives near-ortho feel + subtle parallax)
  var aspect = window.innerWidth / window.innerHeight;
  var cam = new THREE.PerspectiveCamera(T.camFov, aspect, 0.5, 200);
  T.camera = cam;
  MF._fitCamera();

  // === Lighting rig ===
  // Ambient (fills shadows with cool tint)
  var ambient = new THREE.AmbientLight(0x6a78a8, 0.42);
  scene.add(ambient);
  T.ambient = ambient;

  // Hemisphere (sky/ground gradient diffuse)
  var hemi = new THREE.HemisphereLight(0xc8e0ff, 0x382848, 0.55);
  hemi.position.set(0, 30, 0);
  scene.add(hemi);
  T.hemi = hemi;

  // Key light (warm sun, casts shadows)
  var keyLight = new THREE.DirectionalLight(0xfff2d8, 1.35);
  keyLight.position.set(8, 22, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 60;
  // Tighten shadow camera around grid to maximize quality
  var SH_BOUND = 12;
  keyLight.shadow.camera.left   = -SH_BOUND;
  keyLight.shadow.camera.right  =  SH_BOUND;
  keyLight.shadow.camera.top    =  SH_BOUND;
  keyLight.shadow.camera.bottom = -SH_BOUND;
  keyLight.shadow.bias = -0.0008;
  keyLight.shadow.normalBias = 0.04;
  keyLight.shadow.radius = 4;     // extra blur for soft edges
  scene.add(keyLight);
  T.keyLight = keyLight;
  // Helper target so we can move
  keyLight.target.position.set(0, 0, 0);
  scene.add(keyLight.target);

  // Fill light (cool, opposite side, no shadow)
  var fillLight = new THREE.DirectionalLight(0x88a8ff, 0.55);
  fillLight.position.set(-10, 14, -6);
  scene.add(fillLight);
  T.fillLight = fillLight;

  // Rim light (saturated, behind characters, kisses silhouettes)
  var rimLight = new THREE.DirectionalLight(0xff80c8, 0.55);
  rimLight.position.set(-3, 8, -16);
  scene.add(rimLight);
  T.rimLight = rimLight;

  // Persistent groups
  T.worldGroup = new THREE.Group();
  scene.add(T.worldGroup);
  T.fxGroup = new THREE.Group();
  scene.add(T.fxGroup);

  // Sky dome (gradient via vertex colors)
  MF._buildSkyDome();

  // Pre-allocate impact PointLights pool
  for (var i = 0; i < T.maxImpactLights; i++){
    var p = new THREE.PointLight(0xffffff, 0, 8, 2);
    p.castShadow = false;
    scene.add(p);
    T.impactLights.push({ light: p, life: 0, maxLife: 0 });
  }

  // Resize
  window.addEventListener('resize', MF._onResize, { passive: true });
  MF._onResize();
};

MF._buildSkyDome = function(){
  var T = MF.three;
  // Big inverted sphere with vertex-colored gradient
  var geo = new THREE.SphereGeometry(80, 24, 16);
  // Color top vs bottom via vertex colors
  var colors = [];
  var pos = geo.attributes.position;
  var topCol = new THREE.Color(0x6c92d8);
  var midCol = new THREE.Color(0x9ab4dc);
  var botCol = new THREE.Color(0xfde8c8);
  for (var i = 0; i < pos.count; i++){
    var y = pos.getY(i) / 80; // -1..1
    var t = (y + 1) * 0.5;
    var c = (t > 0.55) ? topCol.clone().lerp(midCol, (1 - t) / 0.45) :
             midCol.clone().lerp(botCol, (0.55 - t) / 0.55);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  var mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false });
  var dome = new THREE.Mesh(geo, mat);
  dome.userData.isSky = true;
  T.scene.add(dome);
  T.skyDome = dome;
};

MF._onResize = function(){
  var T = MF.three;
  if (!T.renderer) return;
  T.renderer.setSize(window.innerWidth, window.innerHeight, false);
  MF._fitCamera();
};

// Compute camera distance to fit grid given perspective FOV
MF._fitCamera = function(){
  var T = MF.three;
  if (!T.camera) return;
  var w = window.innerWidth, h = window.innerHeight;
  var aspect = w / h;
  T.camera.aspect = aspect;
  T.camera.fov = T.camFov;
  T.camera.updateProjectionMatrix();

  var cols = MF.GRID_COLS || 8;
  var rows = MF.GRID_ROWS || 7;
  var tile = MF.TILE || 1.5;
  var boardW = cols * tile;
  var boardD = rows * tile;
  var verticalExtent = 4.5;

  // Account for HUD taking ~95 top + 125 bottom px
  var hudTop = 95, hudBot = 125;
  var visibleH = Math.max(1, h - hudTop - hudBot);
  var hudFactor = h / visibleH;

  // We need a fit-height in world units
  var fitW = boardW * 1.18;
  var fitH = (boardD * Math.cos(T.camTilt) + verticalExtent) * 1.18 * hudFactor;

  // For perspective: visible height at distance d = 2 * d * tan(fov/2)
  // We need vis_h >= fitH AND vis_w (= vis_h * aspect) >= fitW
  var fovRad = T.camFov * Math.PI / 180;
  var visH = 2 * Math.tan(fovRad / 2);   // per unit distance
  var distH = fitH / visH;
  var distW = fitW / (visH * aspect);
  var dist = Math.max(distH, distW) / (T.camZoom || 1);
  T.camDistance = dist;

  // Position camera
  var ox = T.camOffset.x, oz = T.camOffset.z;
  var lookZ = oz - 0.5;
  T.camera.position.set(ox, Math.sin(T.camTilt) * dist, lookZ + Math.cos(T.camTilt) * dist);
  T.camera.lookAt(ox, 0, lookZ);

  // Move shadow camera with scene
  if (T.keyLight){
    T.keyLight.position.set(ox + 8, 22, oz + 8);
    T.keyLight.target.position.set(ox, 0, oz);
    T.keyLight.target.updateMatrixWorld();
  }
};

MF.applyWorldTheme = function(world){
  var T = MF.three;
  if (!world) return;
  var bgColor = (world.sky && world.sky[1]) || 0x1a0d2e;
  T.scene.background = new THREE.Color(bgColor);
  // Chaos map modifiers: fog and night
  if (MF.run && MF.run.mapFog){
    T.scene.fog = new THREE.Fog(0x6a708a, 4, 14);
  } else if (MF.run && MF.run.mapNight){
    T.scene.fog = new THREE.Fog(0x040408, 6, 18);
    T.scene.background = new THREE.Color(0x05050c);
  } else {
    T.scene.fog = null;
  }
  // Fog disabled — sky dome handles depth without grayish veil at zoom out

  // Update sky dome colors
  if (T.skyDome){
    var topC = new THREE.Color((world.sky && world.sky[0]) || 0x86c5ff);
    var midC = new THREE.Color((world.sky && world.sky[1]) || 0xbcd0ec);
    var botC = new THREE.Color(world.fogColor || bgColor);
    var pos = T.skyDome.geometry.attributes.position;
    var col = T.skyDome.geometry.attributes.color;
    for (var i = 0; i < pos.count; i++){
      var y = pos.getY(i) / 80;
      var t = (y + 1) * 0.5;
      var c = (t > 0.55) ? topC.clone().lerp(midC, (1 - t) / 0.45)
                          : midC.clone().lerp(botC, (0.55 - t) / 0.55);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }

  // Theme-specific lighting tweaks
  if (world.id === 'lava'){
    T.ambient.color.setHex(0xff8050); T.ambient.intensity = 0.55;
    T.keyLight.color.setHex(0xffb070); T.keyLight.intensity = 1.5;
    T.rimLight.color.setHex(0xff5028); T.rimLight.intensity = 0.7;
  } else if (world.id === 'frozen'){
    T.ambient.color.setHex(0xa8c0e8); T.ambient.intensity = 0.62;
    T.keyLight.color.setHex(0xeaf2ff); T.keyLight.intensity = 1.25;
    T.rimLight.color.setHex(0x80b8ff); T.rimLight.intensity = 0.5;
  } else if (world.id === 'necro'){
    T.ambient.color.setHex(0x6850a0); T.ambient.intensity = 0.45;
    T.keyLight.color.setHex(0xc0a8ff); T.keyLight.intensity = 1.0;
    T.rimLight.color.setHex(0xff60ff); T.rimLight.intensity = 0.6;
  } else if (world.id === 'desert'){
    T.ambient.color.setHex(0xffd098); T.ambient.intensity = 0.55;
    T.keyLight.color.setHex(0xffe0a8); T.keyLight.intensity = 1.4;
    T.rimLight.color.setHex(0xff8060); T.rimLight.intensity = 0.55;
  } else if (world.id === 'sky'){
    T.ambient.color.setHex(0xcadcff); T.ambient.intensity = 0.7;
    T.keyLight.color.setHex(0xfffff0); T.keyLight.intensity = 1.4;
    T.rimLight.color.setHex(0xffe0a8); T.rimLight.intensity = 0.55;
  } else {
    T.ambient.color.setHex(0x6a78a8); T.ambient.intensity = 0.45;
    T.keyLight.color.setHex(0xfff2d8); T.keyLight.intensity = 1.3;
    T.rimLight.color.setHex(0xff80c8); T.rimLight.intensity = 0.55;
  }
  // Eternal night override
  if (MF.run && MF.run.mapNight){
    T.ambient.intensity = 0.10;
    T.keyLight.intensity = 0.25;
    T.rimLight.intensity = 0.20;
  }
};

// === Camera pan/zoom ===
MF.panCamera = function(dxScreen, dyScreen){
  var T = MF.three;
  if (!T.camera) return;
  // Convert screen px to world units at lookat depth (approx)
  var fovRad = T.camFov * Math.PI / 180;
  var visH = 2 * T.camDistance * Math.tan(fovRad / 2);
  var visW = visH * T.camera.aspect;
  var worldPerPxX = visW / window.innerWidth;
  var worldPerPxY = visH / window.innerHeight;
  T.camOffset.x -= dxScreen * worldPerPxX;
  T.camOffset.z -= dyScreen * worldPerPxY / Math.max(0.3, Math.cos(T.camTilt));
  var maxX = (MF.GRID_COLS * MF.TILE) * 0.55;
  var maxZ = (MF.GRID_ROWS * MF.TILE) * 0.6;
  T.camOffset.x = Math.max(-maxX, Math.min(maxX, T.camOffset.x));
  T.camOffset.z = Math.max(-maxZ, Math.min(maxZ, T.camOffset.z));
  MF._fitCamera();
};

MF.zoomCamera = function(factor){
  var T = MF.three;
  T.camZoom = Math.max(0.6, Math.min(2.6, T.camZoom * factor));
  MF._fitCamera();
};

MF.resetCamera = function(){
  MF.three.camOffset.x = 0;
  MF.three.camOffset.z = 0;
  MF.three.camZoom = 1;
  MF._fitCamera();
};

MF.shakeCamera = function(amp, dur){
  MF.three.shakeAmp = Math.max(MF.three.shakeAmp, amp || 0.18);
  MF.three.shakeT   = Math.max(MF.three.shakeT,   dur || 0.32);
};

MF.updateCamera = function(dt){
  var T = MF.three;
  // Update impact lights
  for (var i = 0; i < T.impactLights.length; i++){
    var il = T.impactLights[i];
    if (il.life > 0){
      il.life -= dt;
      var k = Math.max(0, il.life / il.maxLife);
      il.light.intensity = il.startIntensity * k;
      if (il.life <= 0) il.light.intensity = 0;
    }
  }
  // Camera shake
  if (T.shakeT > 0){
    T.shakeT -= dt;
    var k2 = T.shakeAmp * Math.max(0, T.shakeT * 3);
    var ox = T.camOffset.x + (Math.random() - 0.5) * k2;
    var oz = T.camOffset.z + (Math.random() - 0.5) * k2;
    var dist = T.camDistance;
    T.camera.position.set(ox, Math.sin(T.camTilt) * dist + (Math.random() - 0.5) * k2, oz - 0.5 + Math.cos(T.camTilt) * dist);
    T.camera.lookAt(T.camOffset.x, 0, T.camOffset.z - 0.5);
    if (T.shakeT <= 0){
      T.shakeAmp = 0;
      MF._fitCamera();
    }
  }
};

// Spawn a brief dynamic light at world position (for impacts/explosions)
MF.flashLight = function(pos, color, intensity, range, duration){
  var T = MF.three;
  // Find an available pool slot (lowest life)
  var slot = T.impactLights[0];
  for (var i = 1; i < T.impactLights.length; i++){
    if (T.impactLights[i].life < slot.life) slot = T.impactLights[i];
  }
  slot.light.position.copy(pos);
  slot.light.position.y += 0.6;
  slot.light.color.setHex(color || 0xffffff);
  slot.light.distance = range || 6;
  slot.light.intensity = intensity || 2.2;
  slot.startIntensity = slot.light.intensity;
  slot.life = duration || 0.25;
  slot.maxLife = slot.life;
};

MF.clearWorld = function(){
  var T = MF.three;
  if (T.worldGroup){
    while (T.worldGroup.children.length){
      var c = T.worldGroup.children.pop();
      MF._disposeMesh(c);
    }
  }
  if (T.fxGroup){
    while (T.fxGroup.children.length){
      var c2 = T.fxGroup.children.pop();
      MF._disposeMesh(c2);
    }
  }
  // Reset impact lights
  for (var i = 0; i < T.impactLights.length; i++){
    T.impactLights[i].light.intensity = 0;
    T.impactLights[i].life = 0;
  }
};

MF._disposeMesh = function(obj){
  if (!obj) return;
  obj.traverse && obj.traverse(function(o){
    if (o.geometry) o.geometry.dispose();
    if (o.material){
      if (Array.isArray(o.material)) o.material.forEach(function(m){ m.dispose(); });
      else o.material.dispose();
    }
  });
};

MF.projectToScreen = function(vec3){
  var T = MF.three;
  var v = vec3.clone().project(T.camera);
  return {
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (-v.y * 0.5 + 0.5) * window.innerHeight
  };
};

MF._raycaster = null;
MF.screenToGround = function(px, py){
  var T = MF.three;
  if (!T.renderer) return null;
  if (!MF._raycaster) MF._raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2(
    (px / window.innerWidth)  * 2 - 1,
    -(py / window.innerHeight) * 2 + 1
  );
  MF._raycaster.setFromCamera(ndc, T.camera);
  var ray = MF._raycaster.ray;
  if (Math.abs(ray.direction.y) < 1e-6) return null;
  var t = -ray.origin.y / ray.direction.y;
  if (t < 0) return null;
  var p = ray.origin.clone().add(ray.direction.multiplyScalar(t));
  return { x: p.x, z: p.z };
};
