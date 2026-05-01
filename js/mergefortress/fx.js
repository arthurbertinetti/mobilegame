// === Merge Fortress TD — Premium FX ===
// Particles, hit flashes, soft ring shockwaves, dynamic impact lights, banner.

window.MF = window.MF || {};

MF.fx = {
  particles: [],   // { mesh, mat, vy, vx, vz, life, maxLife, isRing }
  _bannerT: null
};

// Quick hit flash using emissive on first colored material found
MF.fx.spawnHitFlash = function(mesh, color, dur){
  if (!mesh) return;
  var orig = null;
  mesh.traverse && mesh.traverse(function(o){
    if (orig) return;
    if (o.material && !o.material.transparent && o.material.emissive){
      orig = {
        mat: o.material,
        em: o.material.emissive.getHex(),
        emI: o.material.emissiveIntensity != null ? o.material.emissiveIntensity : 0
      };
      o.material.emissive.setHex(color || 0xffffff);
      o.material.emissiveIntensity = 1.4;
    }
  });
  if (!orig) return;
  setTimeout(function(){
    if (orig.mat) {
      orig.mat.emissive.setHex(orig.em);
      orig.mat.emissiveIntensity = orig.emI;
    }
  }, dur || 90);
};

// Particle burst (cube debris)
MF.fx.spawnBurst = function(pos, color, count, opts){
  opts = opts || {};
  count = count || 8;
  var T = MF.three;
  var geo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  for (var i = 0; i < count; i++){
    var mat = new THREE.MeshStandardMaterial({
      color: color || 0xffd96a, transparent: true, opacity: 1,
      emissive: color || 0xffd96a, emissiveIntensity: 0.6, roughness: 0.6
    });
    var m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.position.y += 0.5;
    var sp = (opts.speed || 3) * (0.7 + Math.random() * 0.6);
    var ang = Math.random() * Math.PI * 2;
    var vy = (opts.up || 2.6) * (0.5 + Math.random() * 0.7);
    T.fxGroup.add(m);
    MF.fx.particles.push({
      mesh: m, mat: mat,
      vx: Math.cos(ang) * sp,
      vy: vy,
      vz: Math.sin(ang) * sp,
      life: 0, maxLife: opts.life || 0.7,
      gravity: opts.gravity != null ? opts.gravity : -8
    });
  }
};

// Soft glowing ring shockwave (expanding circle)
MF.fx.spawnRing = function(pos, color, opts){
  opts = opts || {};
  var T = MF.three;
  var geo = new THREE.RingGeometry(0.16, 0.28, 28);
  geo.rotateX(-Math.PI / 2);
  var mat = new THREE.MeshBasicMaterial({
    color: color || 0xffd96a, transparent: true,
    side: THREE.DoubleSide, opacity: 0.92,
    depthWrite: false, fog: false
  });
  var m = new THREE.Mesh(geo, mat);
  m.position.copy(pos);
  m.position.y += 0.05;
  T.fxGroup.add(m);
  MF.fx.particles.push({
    mesh: m, mat: mat,
    vx: 0, vy: 0, vz: 0,
    life: 0, maxLife: opts.life || 0.55,
    isRing: true,
    targetScale: opts.scale || 4
  });
  // Inner brighter pulse
  var geo2 = new THREE.RingGeometry(0.10, 0.18, 24);
  geo2.rotateX(-Math.PI / 2);
  var mat2 = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true,
    side: THREE.DoubleSide, opacity: 0.55,
    depthWrite: false, fog: false
  });
  var m2 = new THREE.Mesh(geo2, mat2);
  m2.position.copy(pos);
  m2.position.y += 0.08;
  T.fxGroup.add(m2);
  MF.fx.particles.push({
    mesh: m2, mat: mat2,
    vx: 0, vy: 0, vz: 0,
    life: 0, maxLife: (opts.life || 0.55) * 0.6,
    isRing: true,
    targetScale: (opts.scale || 4) * 0.7
  });
};

// Big merge effect: scale pop + ring + golden burst + dynamic light
MF.fx.spawnMergeEffect = function(pos, color){
  MF.fx.spawnRing(pos, color || 0xffd96a, { scale: 6, life: 0.7 });
  MF.fx.spawnBurst(pos, color || 0xffd96a, 22, { speed: 5.5, up: 4.5, life: 0.85 });
  // Vertical pillar of light
  var T = MF.three;
  var geo = new THREE.CylinderGeometry(0.18, 0.18, 3.0, 14, 1, true);
  var mat = new THREE.MeshBasicMaterial({
    color: color || 0xffd96a, transparent: true, opacity: 0.7,
    side: THREE.DoubleSide, depthWrite: false, fog: false
  });
  var pillar = new THREE.Mesh(geo, mat);
  pillar.position.copy(pos);
  pillar.position.y += 1.5;
  T.fxGroup.add(pillar);
  MF.fx.particles.push({
    mesh: pillar, mat: mat,
    vx: 0, vy: 0, vz: 0,
    life: 0, maxLife: 0.6,
    isPillar: true
  });
  // Dynamic light flash
  if (MF.flashLight) MF.flashLight(pos, color || 0xffd96a, 4.5, 8, 0.45);
};

MF.fx.update = function(dt){
  for (var i = MF.fx.particles.length - 1; i >= 0; i--){
    var p = MF.fx.particles[i];
    p.life += dt;
    if (p.isRing){
      var k = p.life / p.maxLife;
      var s = 1 + k * (p.targetScale - 1);
      p.mesh.scale.set(s, 1, s);
      p.mat.opacity = (1 - k) * 0.9;
      if (k >= 1){
        MF.three.fxGroup.remove(p.mesh);
        p.mesh.geometry.dispose(); p.mat.dispose();
        MF.fx.particles.splice(i, 1);
      }
      continue;
    }
    if (p.isPillar){
      var k2 = p.life / p.maxLife;
      var s2 = 1 - k2 * 0.4;
      p.mesh.scale.set(s2, 1 + k2 * 0.5, s2);
      p.mat.opacity = (1 - k2) * 0.7;
      if (k2 >= 1){
        MF.three.fxGroup.remove(p.mesh);
        p.mesh.geometry.dispose(); p.mat.dispose();
        MF.fx.particles.splice(i, 1);
      }
      continue;
    }
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.vy += p.gravity * dt;
    var k3 = p.life / p.maxLife;
    p.mat.opacity = 1 - k3;
    if (p.mat.emissiveIntensity != null) p.mat.emissiveIntensity = 0.6 * (1 - k3);
    p.mesh.rotation.x += dt * 5;
    p.mesh.rotation.y += dt * 7;
    if (p.life >= p.maxLife){
      MF.three.fxGroup.remove(p.mesh);
      p.mesh.geometry.dispose(); p.mat.dispose();
      MF.fx.particles.splice(i, 1);
    }
  }
};

MF.fx.floatingDmg = function(worldPos, value, kind){
  var s = MF.projectToScreen(worldPos);
  var layer = document.getElementById('mf-dmg-layer');
  if (!layer) return;
  var d = document.createElement('div');
  d.className = 'mf-dmg' + (kind ? ' mf-dmg-' + kind : '');
  d.style.left = (s.x) + 'px';
  d.style.top  = (s.y - 30) + 'px';
  d.textContent = (typeof value === 'number') ? Math.round(value).toString() : ('' + value);
  layer.appendChild(d);
  setTimeout(function(){ d.remove(); }, 850);
};

MF.fx.shake = function(amp, dur){ MF.shakeCamera(amp, dur); };

// === Ambient world particles (leaves / sand / snow / embers / souls / clouds) ===
MF.fx.ambient = null;
MF.fx.ambientList = null;

MF.fx._ambientConfigs = {
  grass:  { color: 0x9adc6c, count: 30, kind: 'leaf',  vy: -0.45, drift: 0.5, op: 0.85 },
  desert: { color: 0xddc09a, count: 25, kind: 'sand',  vy: -0.55, drift: 0.7, op: 0.55 },
  frozen: { color: 0xfafff5, count: 40, kind: 'snow',  vy: -0.30, drift: 0.4, op: 0.75 },
  lava:   { color: 0xff7028, count: 25, kind: 'ember', vy:  0.50, drift: 0.5, op: 0.95 },
  necro:  { color: 0xc070ff, count: 28, kind: 'soul',  vy:  0.20, drift: 0.6, op: 0.85 },
  sky:    { color: 0xffffff, count: 30, kind: 'cloud', vy: -0.20, drift: 0.4, op: 0.55 }
};

MF.fx.spawnAmbientParticles = function(world){
  MF.fx.clearAmbientParticles();
  var T = MF.three;
  if (!world || !T.fxGroup) return;
  var cfg = MF.fx._ambientConfigs[world.id] || MF.fx._ambientConfigs.grass;

  var grp = new THREE.Group();
  T.fxGroup.add(grp);
  MF.fx.ambient = grp;
  MF.fx.ambientList = [];

  // Pre-create geometry/material (shared across particles)
  var geo, mat;
  if (cfg.kind === 'snow') geo = new THREE.SphereGeometry(0.07, 6, 5);
  else if (cfg.kind === 'leaf') geo = new THREE.PlaneGeometry(0.16, 0.10);
  else if (cfg.kind === 'sand') geo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
  else if (cfg.kind === 'ember') geo = new THREE.SphereGeometry(0.06, 8, 6);
  else if (cfg.kind === 'soul') geo = new THREE.SphereGeometry(0.10, 10, 8);
  else if (cfg.kind === 'cloud') geo = new THREE.SphereGeometry(0.16, 10, 8);

  if (cfg.kind === 'ember' || cfg.kind === 'soul'){
    mat = new THREE.MeshBasicMaterial({
      color: cfg.color, transparent: true, opacity: cfg.op, fog: false, depthWrite: false
    });
  } else {
    mat = new THREE.MeshLambertMaterial({
      color: cfg.color, transparent: true, opacity: cfg.op, fog: false,
      side: cfg.kind === 'leaf' ? THREE.DoubleSide : THREE.FrontSide
    });
  }

  var areaW = MF.GRID_COLS * MF.TILE * 1.6;
  var areaD = MF.GRID_ROWS * MF.TILE * 1.6;

  for (var i = 0; i < cfg.count; i++){
    var m = new THREE.Mesh(geo, mat);
    m.position.set(
      (Math.random() - 0.5) * areaW,
      Math.random() * 8 + (cfg.vy < 0 ? 1 : -1),
      (Math.random() - 0.5) * areaD
    );
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    grp.add(m);
    MF.fx.ambientList.push({
      mesh: m,
      vy: cfg.vy * (0.7 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * cfg.drift,
      vz: (Math.random() - 0.5) * cfg.drift,
      rotS: (Math.random() - 0.5) * 1.5,
      areaW: areaW,
      areaD: areaD,
      cfg: cfg,
      seed: Math.random() * 100
    });
  }
};

MF.fx.updateAmbient = function(dt){
  if (!MF.fx.ambientList) return;
  var t = MF._t || 0;
  for (var i = 0; i < MF.fx.ambientList.length; i++){
    var p = MF.fx.ambientList[i];
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.x += (p.vx + Math.sin(t * 0.6 + p.seed) * 0.12) * dt;
    p.mesh.position.z += p.vz * dt;
    if (p.cfg.kind === 'leaf' || p.cfg.kind === 'snow' || p.cfg.kind === 'soul' || p.cfg.kind === 'cloud'){
      p.mesh.rotation.x += p.rotS * dt;
      p.mesh.rotation.z += p.rotS * 0.6 * dt;
    }
    if (p.cfg.kind === 'soul' || p.cfg.kind === 'ember'){
      // Twinkle: fade in/out
      p.mesh.material.opacity = p.cfg.op * (0.5 + 0.5 * Math.sin(t * 3 + p.seed));
    }
    // Recycle
    if (p.cfg.vy < 0 && p.mesh.position.y < -1){
      p.mesh.position.y = 10 + Math.random() * 4;
      p.mesh.position.x = (Math.random() - 0.5) * p.areaW;
      p.mesh.position.z = (Math.random() - 0.5) * p.areaD;
    } else if (p.cfg.vy >= 0 && p.mesh.position.y > 14){
      p.mesh.position.y = -1 - Math.random() * 2;
      p.mesh.position.x = (Math.random() - 0.5) * p.areaW;
      p.mesh.position.z = (Math.random() - 0.5) * p.areaD;
    }
    if (Math.abs(p.mesh.position.x) > p.areaW){
      p.mesh.position.x = -p.mesh.position.x * 0.99;
    }
    if (Math.abs(p.mesh.position.z) > p.areaD){
      p.mesh.position.z = -p.mesh.position.z * 0.99;
    }
  }
};

MF.fx.clearAmbientParticles = function(){
  if (MF.fx.ambient){
    MF.three.fxGroup.remove(MF.fx.ambient);
    MF._disposeMesh(MF.fx.ambient);
    MF.fx.ambient = null;
    MF.fx.ambientList = null;
  }
};

MF.fx.showBanner = function(text, type){
  var b = document.getElementById('mf-banner');
  if (!b) return;
  b.className = '';
  if (type === 'boss') b.classList.add('mf-banner-boss');
  b.textContent = text;
  void b.offsetWidth;
  b.classList.remove('mf-hidden');
  clearTimeout(MF.fx._bannerT);
  MF.fx._bannerT = setTimeout(function(){ b.classList.add('mf-hidden'); }, 2400);
};
