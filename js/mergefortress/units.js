// === Merge Fortress TD — Units (heroes + towers, premium 3D look) ===
// PBR-like materials, blob shadows, cast shadows, breathing animation, halo fake-bloom on emissive.

window.MF = window.MF || {};

MF.units = [];
MF._unitIdCounter = 0;

// Rank palette (vibrant)
MF._rankColors = [0x9aa0b0, 0x6cd06c, 0x4ea0ff, 0xc070ff, 0xffd96a];
MF._rankEmissive = [0x222630, 0x1c401c, 0x102a4a, 0x401a4a, 0x4a3408];

// === Material factory helpers ===
MF._matCloth = function(color, opts){
  opts = opts || {};
  return new THREE.MeshStandardMaterial({
    color: color, roughness: opts.r != null ? opts.r : 0.78, metalness: 0.0,
    emissive: opts.em != null ? opts.em : 0x000000,
    emissiveIntensity: opts.emI != null ? opts.emI : 0
  });
};
MF._matMetal = function(color, opts){
  opts = opts || {};
  return new THREE.MeshStandardMaterial({
    color: color, roughness: opts.r != null ? opts.r : 0.35, metalness: opts.m != null ? opts.m : 0.85,
    emissive: opts.em != null ? opts.em : 0x000000,
    emissiveIntensity: opts.emI != null ? opts.emI : 0
  });
};
MF._matWood = function(color){
  return new THREE.MeshStandardMaterial({ color: color || 0x6a3818, roughness: 0.85, metalness: 0.0 });
};
MF._matStone = function(color){
  return new THREE.MeshStandardMaterial({ color: color || 0x9a8878, roughness: 0.92, metalness: 0.05 });
};
MF._matSkin = function(){
  return new THREE.MeshStandardMaterial({ color: 0xefcd9a, roughness: 0.65, metalness: 0.0 });
};
MF._matEmissive = function(color, intensity){
  return new THREE.MeshStandardMaterial({
    color: color, emissive: color, emissiveIntensity: intensity != null ? intensity : 0.7,
    roughness: 0.4, metalness: 0.1
  });
};
MF._matGlow = function(color, opacity){
  return new THREE.MeshBasicMaterial({
    color: color, transparent: true, opacity: opacity != null ? opacity : 0.35,
    depthWrite: false, fog: false
  });
};
// P13: generic standard material helper used by new hero builders
MF._matStandard = function(color, opts){
  opts = opts || {};
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: opts.r != null ? opts.r : 0.7,
    metalness: opts.m != null ? opts.m : 0,
    emissive: opts.em != null ? opts.em : 0x000000,
    emissiveIntensity: opts.emI != null ? opts.emI : 0,
    transparent: opts.t != null,
    opacity: opts.t != null ? opts.t : 1
  });
};

// Blob shadow disc (always under unit)
MF._blobShadow = function(radius){
  var geo = new THREE.CircleGeometry(radius || 0.55, 18);
  var mat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0.36,
    depthWrite: false, fog: false
  });
  var m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.36;          // Just above tile top (which is ~0.32)
  return m;
};

// Recursively enable cast shadow on unit meshes
MF._enableCastShadow = function(group){
  group.traverse(function(o){
    if (o.isMesh){
      // Only opaque, non-decorative bodies cast (skip halos / glow)
      if (o.material && !o.material.transparent && !o.userData.isOutline) {
        o.castShadow = true;
        o.receiveShadow = false;
      }
    }
  });
};

// === Cartoon outline (BackSide black mesh slightly scaled) ===
MF._sharedOutlineMat = null;
MF._getOutlineMat = function(){
  if (!MF._sharedOutlineMat){
    MF._sharedOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x000000, side: THREE.BackSide, depthWrite: true, fog: false
    });
  }
  return MF._sharedOutlineMat;
};

MF._addOutlineMesh = function(mesh, scale){
  scale = scale || 1.05;
  var outline = new THREE.Mesh(mesh.geometry, MF._getOutlineMat());
  outline.scale.copy(mesh.scale).multiplyScalar(scale);
  outline.position.copy(mesh.position);
  outline.rotation.copy(mesh.rotation);
  outline.userData.isOutline = true;
  outline.castShadow = false;
  outline.receiveShadow = false;
  if (mesh.parent) mesh.parent.add(outline);
  return outline;
};

// Walk a group and add outlines to significant meshes only (perf-friendly)
MF._addOutlinesToGroup = function(group, opts){
  opts = opts || {};
  var minRadius = opts.minRadius != null ? opts.minRadius : 0.10;
  var maxOutlines = opts.maxOutlines != null ? opts.maxOutlines : 18;
  var scale = opts.scale || 1.06;
  var added = 0;
  var meshes = [];
  group.traverse(function(m){
    if (added >= maxOutlines) return;
    if (!m.isMesh) return;
    if (m.userData.isOutline || m.userData.isHalo || m.userData.skipOutline) return;
    if (!m.material || m.material.transparent) return;
    if (!m.geometry) return;
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    if (!m.geometry.boundingSphere) return;
    var r = m.geometry.boundingSphere.radius * Math.max(m.scale.x, m.scale.y, m.scale.z);
    if (r < minRadius) return;
    meshes.push(m);
    added++;
  });
  meshes.forEach(function(m){ MF._addOutlineMesh(m, scale); });
};

// === Rank flair (additional decorations to differentiate ranks visually) ===
MF._addRankFlair = function(g, bodyG, sc, rank, kind){
  if (rank < 2) return;

  // Floor accent ring (shows rank tier on ground)
  var ringCol = MF._rankColors[rank - 1] || 0xffd96a;
  var ringMat = new THREE.MeshStandardMaterial({
    color: ringCol, roughness: 0.3, metalness: 0.6,
    emissive: ringCol, emissiveIntensity: 0.5
  });
  var floorRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.45 * sc, 0.022 * sc, 8, 22),
    ringMat
  );
  floorRing.rotation.x = Math.PI / 2;
  floorRing.position.y = 0.02;  // just above tile top
  floorRing.userData.skipOutline = true;
  g.add(floorRing);

  // Rank 4-5: golden cape/crown overlay
  if (rank >= 4 && kind === 'hero'){
    // Floating golden crown above the head (top-heavy signature)
    var crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * sc, 0.18 * sc, 0.10 * sc, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffd96a, roughness: 0.25, metalness: 0.85,
        emissive: 0xff8030, emissiveIntensity: 0.6
      })
    );
    crown.position.y = 1.6 * sc;
    g.add(crown);
    // Crown spikes
    var spikeMat = new THREE.MeshStandardMaterial({
      color: 0xffd96a, roughness: 0.25, metalness: 0.85,
      emissive: 0x402608, emissiveIntensity: 0.45
    });
    for (var i = 0; i < 5; i++){
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.04 * sc, 0.10 * sc, 4), spikeMat);
      var ang = i / 5 * Math.PI * 2;
      sp.position.set(Math.cos(ang) * 0.16 * sc, 1.70 * sc, Math.sin(ang) * 0.16 * sc);
      g.add(sp);
    }
    if (rank === 5){
      // Center jewel on crown
      var jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.05 * sc, 0),
                                   new THREE.MeshStandardMaterial({
                                     color: 0xff5050, emissive: 0xff3030, emissiveIntensity: 1.5,
                                     roughness: 0.2, metalness: 0.8
                                   }));
      jewel.position.y = 1.78 * sc;
      g.add(jewel);
    }
  }

  // Rank 5: orbiting golden particles (signature legendary look)
  if (rank >= 5){
    var orbiterMat = new THREE.MeshStandardMaterial({
      color: 0xffd96a, roughness: 0.2, metalness: 0.7,
      emissive: 0xffae3a, emissiveIntensity: 1.6
    });
    var orbiters = [];
    for (var k = 0; k < 3; k++){
      var orb = new THREE.Mesh(new THREE.SphereGeometry(0.07 * sc, 10, 8), orbiterMat);
      orb.userData.skipOutline = true;
      g.add(orb);
      orbiters.push(orb);
    }
    g.userData.orbiters = orbiters;
    g.userData.unitSc = sc;
  }
};

// Global size multipliers — units smaller, enemies bigger
MF.UNIT_SIZE_MULT = 0.78;
MF.ENEMY_SIZE_MULT = 1.25;

MF.buildUnitMesh = function(id, rank){
  var data = MF.UNITS[id];
  var rdata = data.ranks[rank - 1];
  var color = rdata.color;
  // Apply skin tint if equipped
  var skinId = null;
  if (MF.state && MF.state.meta && MF.state.meta.equippedSkins && MF.applySkinTint){
    skinId = MF.state.meta.equippedSkins[id];
    if (skinId && skinId !== 'default'){
      color = MF.applySkinTint(color, skinId);
    }
  }
  // P14b: legendary skins keep their tint even at R5 (otherwise R5 gold overwrites them)
  if (skinId && MF.SKINS && MF.SKINS[skinId] && MF.SKINS[skinId].legendary && rank === 5){
    // Override default R5 gold with legendary tint
    color = MF.applySkinTint(rdata.color, skinId);
  }
  var sc = rdata.scale * (MF.UNIT_SIZE_MULT || 1);
  var g = new THREE.Group();

  // Unit body group placed directly on the tile (no pedestal disc, no blob)
  var bodyG = new THREE.Group();
  bodyG.position.y = 0.32;
  g.add(bodyG);

  // Discreet rank indicator: small emissive dots floating above the unit (rank 2+)
  if (rank > 1){
    var rankCol = MF._rankColors[rank - 1] || 0xffd96a;
    var dotMat = new THREE.MeshStandardMaterial({
      color: rankCol, roughness: 0.3, metalness: 0.55,
      emissive: rankCol, emissiveIntensity: 0.95
    });
    var spread = (rank - 1) * 0.07 * sc;
    for (var i = 0; i < rank; i++){
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.045 * sc, 10, 8), dotMat);
      dot.position.set(-spread + i * 0.14 * sc, 1.55 * sc, 0);
      g.add(dot);
    }
  }

  if (data.isHybrid){
    MF._buildHybrid(bodyG, id, color, sc, rank);
  } else if (data.kind === 'hero'){
    if (id === 'knight') MF._buildKnight(bodyG, color, sc, rank);
    else if (id === 'archer') MF._buildArcher(bodyG, color, sc, rank);
    else if (id === 'mage') MF._buildMage(bodyG, color, sc, rank);
    else if (id === 'ice') MF._buildIce(bodyG, color, sc, rank);
    else if (id === 'bomb') MF._buildBomb(bodyG, color, sc, rank);
    else if (id === 'dragon') MF._buildDragon(bodyG, color, sc, rank);
    else if (id === 'paladin') MF._buildPaladin(bodyG, color, sc, rank);
    else if (id === 'necromancer') MF._buildNecromancer(bodyG, color, sc, rank);
    // P13 ex-towers (now heroes) — keep their original mesh builders
    else if (id === 'cannon') MF._buildCannon(bodyG, color, sc, rank);
    else if (id === 'ballista') MF._buildBallista(bodyG, color, sc, rank);
    else if (id === 'tesla') MF._buildTesla(bodyG, color, sc, rank);
    else if (id === 'fire') MF._buildFire(bodyG, color, sc, rank);
    else if (id === 'frost') MF._buildFrost(bodyG, color, sc, rank);
    // P13 new heroes
    else if (id === 'berserker') MF._buildBerserker(bodyG, color, sc, rank);
    else if (id === 'sniper') MF._buildSniper(bodyG, color, sc, rank);
    else if (id === 'timemage') MF._buildTimemage(bodyG, color, sc, rank);
    else if (id === 'bard') MF._buildBard(bodyG, color, sc, rank);
    else if (id === 'summoner') MF._buildSummoner(bodyG, color, sc, rank);
  } else {
    // Legacy fallback (should not happen post-P13)
    if (id === 'cannon') MF._buildCannon(bodyG, color, sc, rank);
    else if (id === 'ballista') MF._buildBallista(bodyG, color, sc, rank);
    else if (id === 'tesla') MF._buildTesla(bodyG, color, sc, rank);
    else if (id === 'fire') MF._buildFire(bodyG, color, sc, rank);
    else if (id === 'frost') MF._buildFrost(bodyG, color, sc, rank);
  }

  // Halo glow (fake bloom)
  if (rank >= 3){
    var haloCol = rank === 5 ? 0xffd96a : (rank === 4 ? 0xc070ff : 0x4ea0ff);
    var halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.85 * sc, 14, 10),
      MF._matGlow(haloCol, rank === 5 ? 0.20 : (rank === 4 ? 0.16 : 0.10))
    );
    halo.position.y = 0.7 * sc;
    halo.userData.isHalo = true;
    g.add(halo);
    g.userData.halo = halo;
  }

  MF._enableCastShadow(g);
  MF._addRankFlair(g, bodyG, sc, rank, data.kind);
  MF._addOutlinesToGroup(g, { minRadius: 0.10, maxOutlines: 16, scale: 1.06 });

  g.userData.bodyGroup = bodyG;
  g.userData.unitScale = sc;
  g.userData.rank = rank;
  g.userData.skinId = skinId;
  // Legendary skin: orbital particles
  if (skinId && MF.SKINS && MF.SKINS[skinId] && MF.SKINS[skinId].legendary){
    var pCol = MF.SKINS[skinId].particles || 0xc070ff;
    var pMat = new THREE.MeshBasicMaterial({ color: pCol, transparent: true, opacity: 0.85, depthWrite: false });
    var legParticles = [];
    for (var lp = 0; lp < 5; lp++){
      var pp = new THREE.Mesh(new THREE.SphereGeometry(0.07 * sc, 8, 6), pMat);
      pp.userData.skipOutline = true;
      g.add(pp);
      legParticles.push(pp);
    }
    g.userData.legendaryParticles = legParticles;
  }
  // Animated rainbow skin marker
  if (skinId === 'rainbow') g.userData.rainbowSkin = true;
  return g;
};

// === HEROES ===

// Cape (large triangular plane behind body — silhouette break)
MF._addCape = function(g, color, sc, height){
  height = height || 0.7*sc;
  var capeMat = MF._matCloth(color, { r: 0.7 });
  capeMat.side = THREE.DoubleSide;
  var cape = new THREE.Mesh(new THREE.PlaneGeometry(0.62*sc, height), capeMat);
  cape.position.set(0, height/2 + 0.04*sc, -0.22*sc);
  cape.rotation.x = -0.22;
  g.add(cape);
  return cape;
};

// === KNIGHT — V-shaped shoulders, OVERSIZED sword, big shield, plumed helmet ===
MF._buildKnight = function(g, color, sc, rank){
  // Cape (red/gold) — wide triangular
  MF._addCape(g, rank >= 4 ? 0xffd96a : 0xc83838, sc, 0.65*sc);

  // === LOWER BODY (narrow, contrasts with wide shoulders) ===
  var armor = MF._matMetal(color, { r: 0.42, m: 0.7, em: MF._mulColor(color, 0.18), emI: 0.10 });
  var legs = new THREE.Mesh(new THREE.BoxGeometry(0.30*sc, 0.30*sc, 0.24*sc), armor);
  legs.position.y = 0.15*sc; g.add(legs);
  var belt = new THREE.Mesh(new THREE.BoxGeometry(0.42*sc, 0.10*sc, 0.30*sc), MF._matWood(0x4a2a08));
  belt.position.y = 0.32*sc; g.add(belt);
  var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10*sc, 0.10*sc, 0.05*sc),
                               MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.45 }));
  buckle.position.set(0, 0.32*sc, 0.16*sc); g.add(buckle);

  // === V-SHAPED TORSO (trapezoidal: wider at shoulders) ===
  // Inner core
  var core = new THREE.Mesh(new THREE.BoxGeometry(0.36*sc, 0.42*sc, 0.28*sc), armor);
  core.position.y = 0.58*sc; g.add(core);
  // SHOULDER PADS (massive, V-shape) — signature silhouette
  var shoulderMat = MF._matMetal(MF._mulColor(color, 1.18), { r: 0.4, m: 0.75, em: MF._mulColor(color, 0.22), emI: 0.12 });
  var shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.18*sc, 12, 10), shoulderMat);
  shoulderL.position.set(-0.27*sc, 0.74*sc, 0); shoulderL.scale.set(1, 0.85, 0.95); g.add(shoulderL);
  var shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.18*sc, 12, 10), shoulderMat);
  shoulderR.position.set(0.27*sc, 0.74*sc, 0); shoulderR.scale.set(1, 0.85, 0.95); g.add(shoulderR);
  // Shoulder spikes (silhouette break)
  var spikeMat = MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.4 });
  var spL = new THREE.Mesh(new THREE.ConeGeometry(0.07*sc, 0.18*sc, 6), spikeMat);
  spL.position.set(-0.27*sc, 0.92*sc, 0); g.add(spL);
  var spR = new THREE.Mesh(new THREE.ConeGeometry(0.07*sc, 0.18*sc, 6), spikeMat);
  spR.position.set(0.27*sc, 0.92*sc, 0); g.add(spR);

  // Head + helmet
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16*sc, 14, 12), MF._matSkin());
  head.position.y = 0.95*sc; g.add(head);
  var helm = new THREE.Mesh(new THREE.CylinderGeometry(0.20*sc, 0.21*sc, 0.30*sc, 14), armor);
  helm.position.y = 1.02*sc; g.add(helm);
  // Visor slit
  var visor = new THREE.Mesh(new THREE.BoxGeometry(0.34*sc, 0.05*sc, 0.06*sc),
                              new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.4, metalness: 0.6 }));
  visor.position.set(0, 1.03*sc, 0.20*sc); g.add(visor);
  // OVERSIZED PLUME (top-heavy — signature silhouette)
  var plume = new THREE.Mesh(new THREE.ConeGeometry(0.10*sc, 0.45*sc, 8),
                              MF._matCloth(rank >= 4 ? 0xffd96a : 0xc83838,
                                            { em: rank >= 4 ? 0x402608 : 0x401010, emI: 0.35 }));
  plume.position.y = 1.40*sc; g.add(plume);
  // Plume base ring
  var plumeRing = new THREE.Mesh(new THREE.TorusGeometry(0.10*sc, 0.025*sc, 6, 12), spikeMat);
  plumeRing.rotation.x = Math.PI / 2; plumeRing.position.y = 1.18*sc; g.add(plumeRing);

  // === GIANT SWORD (longer than the knight himself — signature) ===
  var swordMat = MF._matMetal(0xeef0f8, { r: 0.18, m: 0.95, em: 0x4a4a58, emI: 0.25 });
  // Blade — longer + wider
  var blade = new THREE.Mesh(new THREE.BoxGeometry(0.10*sc, 1.0*sc, 0.08*sc), swordMat);
  blade.position.set(0.42*sc, 0.85*sc, 0.03*sc);
  blade.rotation.z = -0.16;
  g.add(blade);
  // Blade tip (cone)
  var bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.05*sc, 0.18*sc, 4), swordMat);
  bladeTip.position.set(0.50*sc, 1.42*sc, 0.03*sc);
  bladeTip.rotation.z = -0.16;
  g.add(bladeTip);
  // Cross-guard (large, gold, asymmetric)
  var guard = new THREE.Mesh(new THREE.BoxGeometry(0.32*sc, 0.06*sc, 0.10*sc),
                              MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.5 }));
  guard.position.set(0.40*sc, 0.32*sc, 0.05*sc); guard.rotation.z = -0.16; g.add(guard);
  // Pommel sphere
  var pommel = new THREE.Mesh(new THREE.SphereGeometry(0.07*sc, 10, 8),
                               MF._matMetal(0xffd96a, { em: 0xff8030, emI: 0.6 }));
  pommel.position.set(0.39*sc, 0.20*sc, 0.05*sc); g.add(pommel);

  // === BIG HEXAGONAL SHIELD on left arm ===
  var shieldCol = rank >= 4 ? 0xffd96a : 0x4a8030;
  // Use cylinder w/ 6 sides for hex shape
  var shield = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.30*sc, 0.08*sc, 6),
                               MF._matMetal(shieldCol, { r: 0.5, m: 0.55 }));
  shield.position.set(-0.40*sc, 0.62*sc, 0.04*sc);
  shield.rotation.set(0, 0, Math.PI/2);
  g.add(shield);
  // Shield boss (gold center)
  var boss = new THREE.Mesh(new THREE.SphereGeometry(0.08*sc, 10, 8),
                              MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.5 }));
  boss.position.set(-0.42*sc, 0.62*sc, 0.04*sc); g.add(boss);
  // Cross emblem
  var crossMat = MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.45 });
  var cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.05*sc, 0.22*sc, 0.04*sc), crossMat);
  cross1.position.set(-0.46*sc, 0.62*sc, 0.04*sc); g.add(cross1);
  var cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.05*sc, 0.04*sc, 0.18*sc), crossMat);
  cross2.position.set(-0.46*sc, 0.62*sc, 0.04*sc); g.add(cross2);
};

// === ARCHER — thin tall body, ENORMOUS bow (taller than archer), big quiver ===
MF._buildArcher = function(g, color, sc, rank){
  MF._addCape(g, rank >= 4 ? 0xffd96a : 0x2e4a18, sc, 0.55*sc);

  // Slim torso
  var tunic = MF._matCloth(color);
  var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16*sc, 0.20*sc, 0.55*sc, 12), tunic);
  torso.position.y = 0.30*sc; g.add(torso);
  // Belt with pouch
  var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.21*sc, 0.21*sc, 0.06*sc, 12), MF._matWood(0x4a2a08));
  belt.position.y = 0.18*sc; g.add(belt);
  var pouch = new THREE.Mesh(new THREE.BoxGeometry(0.12*sc, 0.12*sc, 0.06*sc), MF._matWood(0x6a3818));
  pouch.position.set(-0.18*sc, 0.18*sc, 0.10*sc); g.add(pouch);
  // Head
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16*sc, 14, 12), MF._matSkin());
  head.position.y = 0.66*sc; g.add(head);
  // Pointed hood — top-heavy
  var hood = new THREE.Mesh(new THREE.ConeGeometry(0.20*sc, 0.42*sc, 10), tunic);
  hood.position.y = 0.92*sc; hood.rotation.z = 0.12; g.add(hood);
  // Hood tip (drooping)
  var hoodTip = new THREE.Mesh(new THREE.SphereGeometry(0.04*sc, 8, 6), tunic);
  hoodTip.position.set(0.06*sc, 1.12*sc, 0); g.add(hoodTip);

  // === ENORMOUS BOW (taller than archer — signature) ===
  var bowMat = MF._matWood(0x6a3818);
  // Main arc — large half torus
  var bow = new THREE.Mesh(new THREE.TorusGeometry(0.50*sc, 0.05*sc, 8, 22, Math.PI), bowMat);
  bow.position.set(0.42*sc, 0.62*sc, 0);
  bow.rotation.set(0, Math.PI/2, Math.PI/2);
  g.add(bow);
  // Bow tips (small cones)
  var tipMat = MF._matMetal(0x808080, { r: 0.4, m: 0.7 });
  var tipT = new THREE.Mesh(new THREE.ConeGeometry(0.04*sc, 0.10*sc, 5), tipMat);
  tipT.position.set(0.42*sc, 1.14*sc, 0); g.add(tipT);
  var tipB = new THREE.Mesh(new THREE.ConeGeometry(0.04*sc, 0.10*sc, 5), tipMat);
  tipB.position.set(0.42*sc, 0.10*sc, 0); tipB.rotation.x = Math.PI; g.add(tipB);
  // Bowstring
  var string = new THREE.Mesh(new THREE.BoxGeometry(0.005*sc, 1.0*sc, 0.005*sc),
                                new THREE.MeshBasicMaterial({ color: 0xddd0a0 }));
  string.position.set(0.42*sc, 0.62*sc, 0); g.add(string);
  // Loaded arrow (bigger, with feather fletching)
  var shaftMat = MF._matWood(0xeed7a0);
  var arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.025*sc, 0.025*sc, 0.7*sc, 6), shaftMat);
  arrow.position.set(0.42*sc, 0.62*sc, 0.28*sc); arrow.rotation.x = -Math.PI/2; g.add(arrow);
  var arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.06*sc, 0.14*sc, 6),
                                  MF._matMetal(0x808090, { r: 0.3, m: 0.8 }));
  arrowHead.position.set(0.42*sc, 0.62*sc, 0.62*sc); arrowHead.rotation.x = -Math.PI/2; g.add(arrowHead);
  // Feather fletching (3 planes)
  var fMat = MF._matCloth(0xc83838, { r: 0.7 });
  fMat.side = THREE.DoubleSide;
  for (var f = 0; f < 3; f++){
    var feather = new THREE.Mesh(new THREE.PlaneGeometry(0.08*sc, 0.10*sc), fMat);
    feather.position.set(0.42*sc, 0.62*sc, -0.06*sc);
    feather.rotation.set(Math.PI/2, f / 3 * Math.PI * 2, 0);
    g.add(feather);
  }

  // === BIG QUIVER on back with 3 arrows sticking out (silhouette break) ===
  var quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.10*sc, 0.11*sc, 0.50*sc, 10), MF._matWood(0x6a3818));
  quiver.position.set(-0.20*sc, 0.55*sc, -0.16*sc);
  quiver.rotation.x = 0.35;
  g.add(quiver);
  // Arrows in quiver (visible feathers + tips)
  for (var q = 0; q < 3; q++){
    var qa = new THREE.Mesh(new THREE.CylinderGeometry(0.018*sc, 0.018*sc, 0.32*sc, 4), shaftMat);
    qa.position.set(-0.20*sc + (q - 1) * 0.04*sc, 0.84*sc, -0.20*sc);
    qa.rotation.x = 0.35;
    g.add(qa);
    var qf = new THREE.Mesh(new THREE.ConeGeometry(0.04*sc, 0.08*sc, 4),
                              MF._matCloth(0xc83838, { em: 0x401010, emI: 0.2 }));
    qf.position.set(-0.20*sc + (q - 1) * 0.04*sc, 0.99*sc, -0.21*sc);
    qf.rotation.x = Math.PI + 0.35;
    g.add(qf);
  }
};

// === MAGE — wide cone robe, GIANT staff (taller than mage), oversized orb, pointy hat ===
MF._buildMage = function(g, color, sc, rank){
  // === Wide flowing triangular robe (large at base, narrow at top) ===
  var robe = new THREE.Mesh(new THREE.ConeGeometry(0.45*sc, 0.85*sc, 14), MF._matCloth(color));
  robe.position.y = 0.42*sc; g.add(robe);
  // Robe trim (gold band)
  var trim = new THREE.Mesh(new THREE.TorusGeometry(0.43*sc, 0.025*sc, 6, 18),
                              MF._matMetal(0xffd96a, { em: 0x402608, emI: 0.4 }));
  trim.rotation.x = Math.PI/2; trim.position.y = 0.04*sc; g.add(trim);
  // Belt + buckle
  var belt = new THREE.Mesh(new THREE.TorusGeometry(0.26*sc, 0.04*sc, 6, 18),
                              MF._matMetal(0xc9a44a, { em: 0x402608, emI: 0.3 }));
  belt.rotation.x = Math.PI/2; belt.position.y = 0.50*sc; g.add(belt);

  // Head
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.16*sc, 14, 12), MF._matSkin());
  head.position.y = 0.86*sc; g.add(head);

  // === LONG POINTY HAT (top-heavy) ===
  var hatMat = MF._matCloth(color);
  // Hat brim — wide
  var brim = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.30*sc, 0.04*sc, 18), hatMat);
  brim.position.y = 0.96*sc; g.add(brim);
  // Hat cone — TALL
  var hat = new THREE.Mesh(new THREE.ConeGeometry(0.22*sc, 0.65*sc, 14), hatMat);
  hat.position.y = 1.30*sc; hat.rotation.z = 0.10; g.add(hat);
  // Hat band
  var band = new THREE.Mesh(new THREE.TorusGeometry(0.21*sc, 0.025*sc, 6, 18),
                              MF._matMetal(0xc9a44a, { em: 0x402608, emI: 0.3 }));
  band.rotation.x = Math.PI/2; band.position.y = 1.0*sc; g.add(band);
  // Star on hat (rank 3+)
  if (rank >= 3){
    var starMat = MF._matEmissive(0xffd96a, 1.4);
    var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.07*sc, 0), starMat);
    star.position.set(0.06*sc, 1.55*sc, 0.06*sc);
    g.add(star);
  }

  // === GIANT STAFF (taller than mage — signature) ===
  var staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04*sc, 0.04*sc, 1.4*sc, 8),
                              MF._matWood(0x4a2a08));
  staff.position.set(0.42*sc, 0.85*sc, 0); staff.rotation.z = -0.10;
  g.add(staff);
  // Staff curl (decorative torus)
  var curl = new THREE.Mesh(new THREE.TorusGeometry(0.10*sc, 0.025*sc, 6, 16, Math.PI * 1.5),
                              MF._matWood(0x4a2a08));
  curl.position.set(0.50*sc, 1.42*sc, 0); curl.rotation.z = -0.10; g.add(curl);
  // === OVERSIZED FLOATING ORB ===
  var orbCol = 0xc070ff;
  var orb = new THREE.Mesh(new THREE.SphereGeometry(0.18*sc, 18, 14),
                            MF._matEmissive(orbCol, 1.4));
  orb.position.set(0.46*sc, 1.55*sc, 0); g.add(orb);
  // Orb glow (fake bloom)
  var orbGlow = new THREE.Mesh(new THREE.SphereGeometry(0.30*sc, 14, 10),
                                MF._matGlow(orbCol, 0.55));
  orbGlow.position.copy(orb.position); g.add(orbGlow);
  // Orbiting rune (silhouette break)
  var runeMat = MF._matEmissive(0xffd96a, 1.2);
  var rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.05*sc, 0), runeMat);
  rune.position.set(0.32*sc, 1.55*sc, 0.10*sc); g.add(rune);
  g.userData.orb = orb;
  g.userData.rune = rune;
};

// === ICE SORCERER — like mage but with crystal staff topper + ice skirt ===
MF._buildIce = function(g, color, sc, rank){
  MF._buildMage(g, color, sc, rank);

  // Replace the orb at the staff top with a CRYSTAL
  // Find orb in g.userData
  if (g.userData.orb){
    g.userData.orb.geometry.dispose();
    g.userData.orb.geometry = new THREE.OctahedronGeometry(0.20*sc, 0);
    g.userData.orb.material.color.setHex(0xa8e8ff);
    g.userData.orb.material.emissive.setHex(0xa8e8ff);
    g.userData.orb.material.emissiveIntensity = 1.2;
    g.userData.orb.scale.set(1, 1.4, 1);
  }

  // === Ice crown (cluster of crystals around the head) — silhouette break ===
  var iceMat = MF._matEmissive(0xa8e8ff, 0.7);
  for (var i = 0; i < 4; i++){
    var c = new THREE.Mesh(new THREE.OctahedronGeometry(0.08*sc, 0), iceMat);
    var a = i / 4 * Math.PI * 2 + 0.4;
    c.position.set(Math.cos(a)*0.22*sc, 0.95*sc, Math.sin(a)*0.22*sc);
    c.scale.y = 1.5;
    g.add(c);
  }

  // === Ice skirt (pointed crystals around feet — top-heavy on pedestal) ===
  var crystals = [];
  for (var i2 = 0; i2 < 6; i2++){
    var sp = new THREE.Mesh(new THREE.ConeGeometry(0.06*sc, 0.20*sc, 4),
                              MF._matEmissive(0xb8e8ff, 0.6));
    var a2 = i2 / 6 * Math.PI * 2;
    sp.position.set(Math.cos(a2)*0.42*sc, 0.04*sc, Math.sin(a2)*0.42*sc);
    g.add(sp);
    crystals.push(sp);
  }
  g.userData.iceCrystals = crystals;
};

// === BOMB ENGINEER — stocky body, OVERSIZED bomb on shoulder, big goggles, grenades ===
MF._buildBomb = function(g, color, sc, rank){
  // === Stocky torso (wide + short) ===
  var torsoMat = MF._matCloth(color, { r: 0.7 });
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.52*sc, 0.42*sc, 0.34*sc), torsoMat);
  torso.position.y = 0.26*sc; g.add(torso);
  // Apron
  var apron = new THREE.Mesh(new THREE.BoxGeometry(0.46*sc, 0.36*sc, 0.04*sc), MF._matWood(0x6a4818));
  apron.position.set(0, 0.27*sc, 0.18*sc); g.add(apron);
  // Apron strap
  var strap = new THREE.Mesh(new THREE.BoxGeometry(0.04*sc, 0.42*sc, 0.04*sc), MF._matWood(0x4a2a08));
  strap.position.set(0, 0.50*sc, 0.18*sc); g.add(strap);
  // Belt with grenades — silhouette break
  var beltMat = MF._matWood(0x3a1a04);
  var belt = new THREE.Mesh(new THREE.BoxGeometry(0.55*sc, 0.06*sc, 0.36*sc), beltMat);
  belt.position.y = 0.10*sc; g.add(belt);
  for (var b = -1; b <= 1; b += 2){
    var gren = new THREE.Mesh(new THREE.SphereGeometry(0.07*sc, 10, 8),
                                MF._matMetal(0x3a3a3a, { r: 0.55 }));
    gren.position.set(b * 0.20*sc, 0.07*sc, 0.18*sc); g.add(gren);
    var gfuse = new THREE.Mesh(new THREE.CylinderGeometry(0.012*sc, 0.012*sc, 0.06*sc, 4), MF._matWood(0x6a4818));
    gfuse.position.set(b * 0.20*sc, 0.16*sc, 0.18*sc); g.add(gfuse);
  }

  // Head
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.18*sc, 14, 12), MF._matSkin());
  head.position.y = 0.58*sc; g.add(head);

  // === OVERSIZED GOGGLES ===
  var goggleMat = MF._matMetal(0x202020, { r: 0.4, m: 0.6 });
  var ggL = new THREE.Mesh(new THREE.CylinderGeometry(0.075*sc, 0.075*sc, 0.05*sc, 14), goggleMat);
  ggL.rotation.x = Math.PI / 2; ggL.position.set(-0.08*sc, 0.60*sc, 0.16*sc); g.add(ggL);
  var ggR = ggL.clone(); ggR.position.x = 0.08*sc; g.add(ggR);
  // Strap connecting goggles
  var ggStrap = new THREE.Mesh(new THREE.BoxGeometry(0.09*sc, 0.02*sc, 0.04*sc), goggleMat);
  ggStrap.position.set(0, 0.60*sc, 0.18*sc); g.add(ggStrap);
  // Bright lenses
  var lensMat = MF._matEmissive(0x60d0ff, 0.85);
  var lensL = new THREE.Mesh(new THREE.CircleGeometry(0.06*sc, 14), lensMat);
  lensL.rotation.y = Math.PI; lensL.position.set(-0.08*sc, 0.60*sc, 0.19*sc); g.add(lensL);
  var lensR = lensL.clone(); lensR.position.x = 0.08*sc; g.add(lensR);

  // Hat — squat top hat with brass trim (signature)
  var hat = new THREE.Mesh(new THREE.CylinderGeometry(0.20*sc, 0.20*sc, 0.18*sc, 14), MF._matWood(0x3a1a04));
  hat.position.y = 0.80*sc; g.add(hat);
  var hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.24*sc, 0.24*sc, 0.04*sc, 14), MF._matWood(0x3a1a04));
  hatBrim.position.y = 0.71*sc; g.add(hatBrim);
  var hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.20*sc, 0.025*sc, 6, 14),
                                 MF._matMetal(0xc9a44a, { em: 0x402608, emI: 0.3 }));
  hatBand.rotation.x = Math.PI/2; hatBand.position.y = 0.74*sc; g.add(hatBand);

  // === GIANT BOMB on shoulder (signature) ===
  var bomb = new THREE.Mesh(new THREE.SphereGeometry(0.24*sc, 16, 14),
                              MF._matMetal(0x202020, { r: 0.5, m: 0.4 }));
  bomb.position.set(0.40*sc, 0.50*sc, 0); g.add(bomb);
  // Bomb highlight (small light spot)
  var bombHL = new THREE.Mesh(new THREE.SphereGeometry(0.05*sc, 8, 6),
                                MF._matEmissive(0xffffff, 0.6));
  bombHL.position.set(0.32*sc, 0.62*sc, 0.10*sc);
  bombHL.material.opacity = 0.7; bombHL.material.transparent = true;
  g.add(bombHL);
  var fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.022*sc, 0.022*sc, 0.18*sc, 6), MF._matWood(0x6a4818));
  fuse.position.set(0.40*sc, 0.74*sc, 0); g.add(fuse);
  // Burning spark
  var spark = new THREE.Mesh(new THREE.SphereGeometry(0.06*sc, 10, 8),
                               MF._matEmissive(0xffd96a, 1.6));
  spark.position.set(0.40*sc, 0.85*sc, 0); g.add(spark);
};

// === DRAGON GUARDIAN — coiled posture, ENORMOUS wings, big horned head, tail wraps ===
MF._buildDragon = function(g, color, sc, rank){
  var bodyMat = MF._matCloth(color, { r: 0.5 });
  var bellyMat = MF._matCloth(MF._mulColor(color, 1.4), { r: 0.55 });
  var darkMat = MF._matCloth(MF._mulColor(color, 0.6), { r: 0.6 });

  // === COILED BODY (lower, wider) ===
  var body = new THREE.Mesh(new THREE.SphereGeometry(0.40*sc, 16, 14), bodyMat);
  body.position.y = 0.30*sc; body.scale.set(1.3, 0.7, 1.3); g.add(body);
  var belly = new THREE.Mesh(new THREE.SphereGeometry(0.28*sc, 14, 10), bellyMat);
  belly.position.set(0, 0.18*sc, 0.20*sc); belly.scale.set(0.9, 0.55, 1.0); g.add(belly);

  // === BIG HORNED HEAD (proportionally large) ===
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.32*sc, 16, 14), bodyMat);
  head.position.set(0, 0.50*sc, 0.40*sc); head.scale.set(1, 0.9, 1.3); g.add(head);
  // Snout
  var snout = new THREE.Mesh(new THREE.ConeGeometry(0.16*sc, 0.28*sc, 10), bodyMat);
  snout.position.set(0, 0.46*sc, 0.72*sc); snout.rotation.x = Math.PI / 2; g.add(snout);
  // Glowing eyes (signature)
  [-1, 1].forEach(function(s){
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.06*sc, 10, 8),
                                MF._matEmissive(0xffd96a, 1.7));
    eye.position.set(s * 0.13*sc, 0.55*sc, 0.62*sc); g.add(eye);
  });
  // BIG HORNS swept back (silhouette break)
  var hornMat = MF._matCloth(0xeec888, { r: 0.45 });
  [-1, 1].forEach(function(s){
    var horn = new THREE.Mesh(new THREE.ConeGeometry(0.06*sc, 0.40*sc, 6), hornMat);
    horn.position.set(s * 0.14*sc, 0.78*sc, 0.32*sc);
    horn.rotation.set(0.5, 0, s * 0.3);
    g.add(horn);
    // Horn tip glow gem (rank 4+)
    if (rank >= 4){
      var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04*sc, 0),
                                 MF._matEmissive(0xffd96a, 1.2));
      gem.position.set(s * 0.20*sc, 0.97*sc, 0.20*sc);
      g.add(gem);
    }
  });
  // Crown jewel on forehead
  var crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.07*sc, 0),
                               MF._matEmissive(rank >= 4 ? 0xffd96a : 0xff5050, 1.5));
  crown.position.set(0, 0.65*sc, 0.40*sc); crown.scale.set(1, 1.4, 0.6); g.add(crown);

  // === Spinal spikes (silhouette break) ===
  var spikeMat = MF._matCloth(MF._mulColor(color, 0.6), { em: MF._mulColor(color, 0.3), emI: 0.25 });
  for (var i = 0; i < 6; i++){
    var sp = new THREE.Mesh(new THREE.ConeGeometry(0.07*sc, 0.22*sc, 5), spikeMat);
    sp.position.set(0, 0.58*sc, -0.30*sc + i * 0.13*sc);
    sp.scale.y = 1 - i * 0.08;
    g.add(sp);
  }

  // === ENORMOUS WINGS (extended) ===
  var wingMat = new THREE.MeshStandardMaterial({
    color: MF._mulColor(color, 0.7), roughness: 0.6, metalness: 0,
    transparent: true, opacity: 0.95, side: THREE.DoubleSide,
    emissive: MF._mulColor(color, 0.3), emissiveIntensity: 0.18
  });
  // Build wing as triangular plane (more wing-like than rectangle)
  var wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.85, 0.15);
  wingShape.lineTo(0.95, 0.55);
  wingShape.lineTo(0.55, 0.45);
  wingShape.lineTo(0.5, 0.75);
  wingShape.lineTo(0.20, 0.55);
  wingShape.lineTo(0, 0.35);
  wingShape.closePath();
  var wingGeo = new THREE.ShapeGeometry(wingShape);
  // Center pivot at origin
  var w1 = new THREE.Mesh(wingGeo, wingMat);
  w1.scale.set(sc * 0.85, sc * 0.85, sc * 0.85);
  w1.position.set(-0.20*sc, 0.45*sc, -0.10*sc);
  w1.rotation.set(0, -1.0, 0.2);
  g.add(w1);
  var w2 = new THREE.Mesh(wingGeo, wingMat);
  w2.scale.set(-sc * 0.85, sc * 0.85, sc * 0.85);
  w2.position.set(0.20*sc, 0.45*sc, -0.10*sc);
  w2.rotation.set(0, 1.0, -0.2);
  g.add(w2);
  g.userData.wings = [w1, w2];

  // === Tail wrapping forward (silhouette break) ===
  var tail = new THREE.Mesh(new THREE.CylinderGeometry(0.10*sc, 0.04*sc, 0.62*sc, 8), bodyMat);
  tail.position.set(-0.30*sc, 0.20*sc, -0.30*sc); tail.rotation.set(0.3, 0.5, 0.6); g.add(tail);
  // Tail tip spike
  var tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.08*sc, 0.18*sc, 5), spikeMat);
  tailTip.position.set(-0.50*sc, 0.10*sc, -0.55*sc); tailTip.rotation.x = -Math.PI/2; g.add(tailTip);
};

// === TOWERS ===

// === CANNON — wide stone platform, fat short barrel, big wheels, banner ===
MF._buildCannon = function(g, color, sc, rank){
  // === Wide square stone platform (base) — signature wide silhouette ===
  var stoneCol = 0x6a5848;
  var stoneM = MF._matStone(stoneCol);
  var base = new THREE.Mesh(new THREE.BoxGeometry(0.85*sc, 0.20*sc, 0.85*sc), stoneM);
  base.position.y = 0.10*sc; g.add(base);
  // Stone block details on base (4 small bricks at corners)
  var brickMat = MF._matStone(MF._mulColor(stoneCol, 0.85));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){
    var br = new THREE.Mesh(new THREE.BoxGeometry(0.18*sc, 0.10*sc, 0.18*sc), brickMat);
    br.position.set(p[0] * 0.35*sc, 0.25*sc, p[1] * 0.35*sc);
    g.add(br);
  });
  // === BIG wheels on sides ===
  var wheelMat = MF._matWood(0x4a3018);
  [-1, 1].forEach(function(s){
    var wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22*sc, 0.06*sc, 8, 16), wheelMat);
    wheel.position.set(s * 0.42*sc, 0.22*sc, 0); g.add(wheel);
    // Spokes (4 boxes)
    for (var sp = 0; sp < 4; sp++){
      var spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04*sc, 0.04*sc, 0.18*sc), wheelMat);
      spoke.position.set(s * 0.42*sc, 0.22*sc, 0);
      spoke.rotation.x = sp / 4 * Math.PI;
      g.add(spoke);
    }
  });
  // Recoil block / mount
  var mount = new THREE.Mesh(new THREE.BoxGeometry(0.32*sc, 0.20*sc, 0.50*sc), MF._matWood(0x4a3018));
  mount.position.y = 0.35*sc; g.add(mount);
  // === FAT SHORT BARREL (gros + bas + lourd) ===
  var barrelMat = MF._matMetal(color, { r: 0.35, m: 0.65, em: MF._mulColor(color, 0.18), emI: 0.10 });
  var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22*sc, 0.27*sc, 0.65*sc, 16), barrelMat);
  barrel.position.set(0, 0.50*sc, 0.30*sc);
  barrel.rotation.x = Math.PI / 2.6;
  g.add(barrel);
  // Reinforcement rings (gold)
  for (var i = 0; i < 3; i++){
    var ringB = new THREE.Mesh(new THREE.TorusGeometry(0.24*sc, 0.030*sc, 8, 16),
                                MF._matMetal(0xc9a44a, { em: 0x402608, emI: 0.35 }));
    ringB.position.copy(barrel.position);
    ringB.position.y = barrel.position.y + Math.cos(barrel.rotation.x) * (-0.2*sc + i * 0.18*sc);
    ringB.position.z = barrel.position.z + Math.sin(barrel.rotation.x) * (-0.2*sc + i * 0.18*sc);
    ringB.rotation.x = barrel.rotation.x + Math.PI/2;
    g.add(ringB);
  }
  // Muzzle (dark interior)
  var muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.20*sc, 0.20*sc, 0.06*sc, 14),
                                new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 }));
  muzzle.position.set(0, barrel.position.y + Math.sin(barrel.rotation.x) * 0.32*sc,
                       barrel.position.z + Math.cos(barrel.rotation.x) * 0.32*sc);
  muzzle.rotation.x = barrel.rotation.x + Math.PI/2;
  g.add(muzzle);
  // === Banner on side (asymmetric, silhouette break) ===
  var poleMat = MF._matWood(0x6a3818);
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025*sc, 0.025*sc, 0.55*sc, 6), poleMat);
  pole.position.set(-0.40*sc, 0.50*sc, -0.20*sc); g.add(pole);
  var bannerMat = MF._matCloth(0xc83838, { em: 0x401010, emI: 0.2 });
  bannerMat.side = THREE.DoubleSide;
  var banner = new THREE.Mesh(new THREE.PlaneGeometry(0.18*sc, 0.30*sc), bannerMat);
  banner.position.set(-0.31*sc, 0.62*sc, -0.20*sc); g.add(banner);
  g.userData.barrel = barrel;
  g.userData.banner = banner;
};

// === BALLISTA — wooden platform, 4 corner posts + roof, HUGE horizontal arm ===
MF._buildBallista = function(g, color, sc, rank){
  var woodMat = MF._matWood(color);
  var darkWoodMat = MF._matWood(MF._mulColor(color, 0.55));
  // === Wooden base platform ===
  var base = new THREE.Mesh(new THREE.BoxGeometry(0.65*sc, 0.10*sc, 0.65*sc), darkWoodMat);
  base.position.y = 0.06*sc; g.add(base);
  // === 4 corner posts (top-heavy support) ===
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.07*sc, 0.50*sc, 0.07*sc), woodMat);
    post.position.set(p[0] * 0.27*sc, 0.34*sc, p[1] * 0.27*sc);
    g.add(post);
  });
  // === Inclined roof (asymmetric — silhouette break) ===
  var roofMat = MF._matCloth(0xc83838, { em: 0x401010, emI: 0.18 });
  var roof = new THREE.Mesh(new THREE.BoxGeometry(0.75*sc, 0.05*sc, 0.55*sc), roofMat);
  roof.position.set(0, 0.65*sc, -0.05*sc);
  roof.rotation.x = 0.18;
  g.add(roof);
  var roofPole = new THREE.Mesh(new THREE.BoxGeometry(0.04*sc, 0.20*sc, 0.04*sc), woodMat);
  roofPole.position.set(0, 0.74*sc, -0.10*sc); g.add(roofPole);
  // Flag at top of roof pole
  var flag = new THREE.Mesh(new THREE.PlaneGeometry(0.18*sc, 0.10*sc),
                             MF._matCloth(0xffd96a, { em: 0x402608, emI: 0.3 }));
  flag.material.side = THREE.DoubleSide;
  flag.position.set(0.10*sc, 0.86*sc, -0.10*sc);
  g.add(flag);

  // Pillar (firing mechanism)
  var pillar = new THREE.Mesh(new THREE.BoxGeometry(0.14*sc, 0.32*sc, 0.10*sc), woodMat);
  pillar.position.y = 0.30*sc; g.add(pillar);

  // === HUGE HORIZONTAL ARM — extends way wider than the tower (signature) ===
  var armMat = MF._matWood(MF._mulColor(color, 0.85));
  var arm = new THREE.Mesh(new THREE.BoxGeometry(1.05*sc, 0.07*sc, 0.09*sc), armMat);
  arm.position.set(0, 0.40*sc, 0.16*sc);
  g.add(arm);
  // Arm tips (wider, rounded)
  [-1, 1].forEach(function(s){
    var tip = new THREE.Mesh(new THREE.BoxGeometry(0.08*sc, 0.10*sc, 0.12*sc), armMat);
    tip.position.set(s * 0.55*sc, 0.40*sc, 0.16*sc);
    g.add(tip);
  });
  // Bowstring (taut)
  var stringMat = new THREE.MeshBasicMaterial({ color: 0xddd0a0 });
  var sg = new THREE.Mesh(new THREE.BoxGeometry(1.04*sc, 0.015*sc, 0.015*sc), stringMat);
  sg.position.set(0, 0.40*sc, 0.30*sc);
  g.add(sg);
  // === GIANT loaded arrow ===
  var shaftMat = MF._matWood(0xeed7a0);
  var arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03*sc, 0.03*sc, 0.75*sc, 8), shaftMat);
  arrowShaft.position.set(0, 0.40*sc, 0.42*sc); arrowShaft.rotation.x = Math.PI/2; g.add(arrowShaft);
  var arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.08*sc, 0.20*sc, 8),
                                   MF._matMetal(0x808090, { r: 0.3, m: 0.85 }));
  arrowHead.position.set(0, 0.40*sc, 0.78*sc); arrowHead.rotation.x = -Math.PI/2; g.add(arrowHead);
  // Arrow fletching
  var fMat = MF._matCloth(0xc83838, { r: 0.7 }); fMat.side = THREE.DoubleSide;
  for (var f = 0; f < 3; f++){
    var feather = new THREE.Mesh(new THREE.PlaneGeometry(0.10*sc, 0.12*sc), fMat);
    feather.position.set(0, 0.40*sc, 0.10*sc);
    feather.rotation.set(Math.PI/2, f / 3 * Math.PI * 2, 0);
    g.add(feather);
  }
  // Decorative emblem on pillar (rank 3+)
  if (rank >= 3){
    var emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08*sc, 0),
                                 MF._matEmissive(0xffd96a, 1.2));
    emblem.position.set(0, 0.55*sc, 0.07*sc); g.add(emblem);
  }
  g.userData.flag = flag;
};

// === TESLA — thin pole + stack of horizontal coil rings (top-heavy) + spike antenna ===
MF._buildTesla = function(g, color, sc, rank){
  // === Thin base pole (sci-fi) ===
  var base = new THREE.Mesh(new THREE.CylinderGeometry(0.20*sc, 0.30*sc, 0.20*sc, 12),
                              MF._matStone(0x303040));
  base.position.y = 0.10*sc; g.add(base);
  // Connecting pole (thin)
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.10*sc, 0.10*sc, 0.45*sc, 10),
                              MF._matMetal(0x4a4a60, { r: 0.4, m: 0.8 }));
  pole.position.y = 0.42*sc; g.add(pole);
  // === Stack of coil rings (top-heavy, 4 rings expanding upward) ===
  var coilMat = MF._matMetal(0x808090, { r: 0.4, m: 0.85 });
  var ringSizes = [0.16, 0.20, 0.24, 0.30];
  for (var i = 0; i < ringSizes.length; i++){
    var ring = new THREE.Mesh(new THREE.TorusGeometry(ringSizes[i] * sc, 0.040 * sc, 10, 24), coilMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (0.55 + i * 0.16) * sc;
    g.add(ring);
  }
  // === Top sphere (electric core) ===
  var orb = new THREE.Mesh(new THREE.SphereGeometry(0.20*sc, 18, 14),
                            MF._matEmissive(color, 1.6));
  orb.position.y = 1.30*sc; g.add(orb);
  var orbGlow = new THREE.Mesh(new THREE.SphereGeometry(0.36*sc, 16, 12),
                                MF._matGlow(0xfff5a3, 0.55));
  orbGlow.position.y = 1.30*sc; g.add(orbGlow);
  // === Spike antenna (very tall on top) — silhouette signature ===
  var antenna = new THREE.Mesh(new THREE.ConeGeometry(0.04*sc, 0.40*sc, 5),
                                 MF._matMetal(0xfff5a3, { em: 0xfff080, emI: 0.7 }));
  antenna.position.y = 1.65*sc; g.add(antenna);
  // === Side antennas (silhouette break) ===
  for (var s = 0; s < 4; s++){
    var sp = new THREE.Mesh(new THREE.ConeGeometry(0.05*sc, 0.18*sc, 5),
                              MF._matEmissive(0xfff5a3, 1.0));
    var a = s / 4 * Math.PI * 2 + 0.4;
    sp.position.set(Math.cos(a) * 0.30*sc, 1.30*sc, Math.sin(a) * 0.30*sc);
    sp.rotation.set(Math.sin(a) * Math.PI/2, 0, -Math.cos(a) * Math.PI/2);
    g.add(sp);
  }
  // Floating arc orbs around (signature, breaks symmetry)
  var arcMat = MF._matEmissive(0xfff080, 1.4);
  var arc1 = new THREE.Mesh(new THREE.SphereGeometry(0.05*sc, 8, 6), arcMat);
  arc1.position.set(0.32*sc, 1.10*sc, 0.0); g.add(arc1);
  var arc2 = new THREE.Mesh(new THREE.SphereGeometry(0.04*sc, 8, 6), arcMat);
  arc2.position.set(-0.28*sc, 0.90*sc, 0.10*sc); g.add(arc2);
  g.userData.orb = orb; g.userData.orbGlow = orbGlow;
  g.userData.arcs = [arc1, arc2];
};

// === FIRE TOWER — wide brazier base, MASSIVE vertical flame, smoke pillar ===
MF._buildFire = function(g, color, sc, rank){
  // === Wide stone base (squat) ===
  var base = new THREE.Mesh(new THREE.CylinderGeometry(0.42*sc, 0.50*sc, 0.30*sc, 14),
                              MF._matStone(0x3a1818));
  base.position.y = 0.15*sc; g.add(base);
  // Base ring (gold trim)
  var rimMat = MF._matMetal(0xc9a44a, { em: 0x402608, emI: 0.35 });
  var rim = new THREE.Mesh(new THREE.TorusGeometry(0.42*sc, 0.04*sc, 8, 18), rimMat);
  rim.rotation.x = Math.PI/2; rim.position.y = 0.28*sc; g.add(rim);
  // === Brazier bowl (wide opening at top) ===
  var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.34*sc, 0.30*sc, 0.16*sc, 14),
                              MF._matStone(0x282020));
  bowl.position.y = 0.40*sc; g.add(bowl);
  // Inner crater (dark, glowing)
  var crater = new THREE.Mesh(new THREE.CylinderGeometry(0.28*sc, 0.24*sc, 0.04*sc, 14),
                                MF._matEmissive(0xff6020, 1.2));
  crater.position.y = 0.46*sc; g.add(crater);
  // === MASSIVE vertical flame (much taller than base — signature) ===
  var flame = new THREE.Mesh(new THREE.ConeGeometry(0.30*sc, 0.85*sc, 14),
                              MF._matEmissive(color, 1.8));
  flame.position.y = 0.92*sc; g.add(flame);
  // Inner flame
  var inner = new THREE.Mesh(new THREE.ConeGeometry(0.18*sc, 0.62*sc, 12),
                              MF._matEmissive(0xffd060, 2.0));
  inner.position.y = 0.92*sc; g.add(inner);
  // White-hot core
  var core = new THREE.Mesh(new THREE.ConeGeometry(0.08*sc, 0.36*sc, 10),
                              MF._matEmissive(0xffffff, 2.5));
  core.position.y = 0.85*sc; g.add(core);
  // Tip embers (silhouette break — small spheres above flame)
  var emberMat = MF._matEmissive(0xffd96a, 1.6);
  for (var e = 0; e < 3; e++){
    var ember = new THREE.Mesh(new THREE.SphereGeometry(0.04*sc, 8, 6), emberMat);
    var ang = e / 3 * Math.PI * 2;
    ember.position.set(Math.cos(ang) * 0.10*sc, 1.42*sc + e * 0.05*sc, Math.sin(ang) * 0.10*sc);
    g.add(ember);
  }
  // Halo around flame (fake bloom)
  var halo = new THREE.Mesh(new THREE.SphereGeometry(0.45*sc, 16, 10),
                              MF._matGlow(0xff8030, 0.38));
  halo.position.y = 0.95*sc; g.add(halo);
  // Coal pile around base (silhouette break)
  var coalMat = MF._matStone(0x202020);
  for (var c = 0; c < 4; c++){
    var coal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06*sc, 0), coalMat);
    var ca = c / 4 * Math.PI * 2 + 0.3;
    coal.position.set(Math.cos(ca) * 0.42*sc, 0.06*sc, Math.sin(ca) * 0.42*sc);
    g.add(coal);
  }
  g.userData.flame = flame;
  g.userData.flameInner = inner;
  g.userData.flameCore = core;
  g.userData.flameHalo = halo;
};

// === FROST TOWER — small base, MASSIVE central crystal (top-heavy), spikes outward ===
MF._buildFrost = function(g, color, sc, rank){
  // === Small ice base ===
  var base = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.38*sc, 0.20*sc, 12),
                              MF._matStone(0x183048));
  base.position.y = 0.10*sc; g.add(base);
  // Icy ground
  var iceFloor = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.30*sc, 0.04*sc, 14),
                                  MF._matEmissive(0xb8e8ff, 0.5));
  iceFloor.material.transparent = true; iceFloor.material.opacity = 0.85;
  iceFloor.position.y = 0.22*sc; g.add(iceFloor);
  // === MASSIVE CENTRAL CRYSTAL (much larger than base — top-heavy signature) ===
  var crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.50*sc, 0),
                                 MF._matEmissive(color, 0.9));
  crystal.position.y = 0.85*sc;
  crystal.scale.set(1, 1.4, 1);
  g.add(crystal);
  // Crystal halo (fake bloom)
  var crystalHalo = new THREE.Mesh(new THREE.SphereGeometry(0.65*sc, 16, 12),
                                     MF._matGlow(0xa8e8ff, 0.32));
  crystalHalo.position.y = 0.85*sc; g.add(crystalHalo);
  // === 4 outward-pointing spikes (silhouette break — like a star burst) ===
  var spikeMat = MF._matEmissive(0xb8e8ff, 0.7);
  for (var i = 0; i < 4; i++){
    var sp = new THREE.Mesh(new THREE.ConeGeometry(0.08*sc, 0.30*sc, 5), spikeMat);
    var a = i / 4 * Math.PI * 2;
    sp.position.set(Math.cos(a) * 0.40*sc, 0.85*sc, Math.sin(a) * 0.40*sc);
    sp.rotation.z = -Math.cos(a) * Math.PI / 2;
    sp.rotation.x = Math.sin(a) * Math.PI / 2;
    g.add(sp);
  }
  // Small floating crystals (orbiting around)
  var crystals = [];
  var smallMat = MF._matEmissive(0xd8f0ff, 0.6);
  for (var j = 0; j < 4; j++){
    var s2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.12*sc, 0), smallMat);
    var a2 = j / 4 * Math.PI * 2 + 0.5;
    s2.position.set(Math.cos(a2) * 0.32*sc, 0.55*sc, Math.sin(a2) * 0.32*sc);
    g.add(s2);
    crystals.push(s2);
  }
  // Top crystal cap
  var cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.10*sc, 0),
                             MF._matEmissive(0xfff8d0, 1.4));
  cap.position.y = 1.40*sc; g.add(cap);
  g.userData.crystal = crystal;
  g.userData.crystalHalo = crystalHalo;
  g.userData.crystals = crystals;
};

// === Paladin: knight base + golden glow + halo angel ring ===
MF._buildPaladin = function(g, color, sc, rank){
  // Knight base
  if (MF._buildKnight) MF._buildKnight(g, 0xfff0a0, sc, rank);
  // Halo ring above head
  var halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.30 * sc, 0.04 * sc, 6, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff080, transparent: true, opacity: 0.85, depthWrite: false })
  );
  halo.position.y = 1.55 * sc;
  halo.rotation.x = Math.PI / 2;
  g.add(halo);
  g.userData.paladinHalo = halo;
  // Holy aura sphere (subtle)
  var aura = new THREE.Mesh(
    new THREE.SphereGeometry(0.65 * sc, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.18, depthWrite: false })
  );
  aura.position.y = 0.55 * sc;
  g.add(aura);
};

// === Necromancer: mage base + dark hood + floating skulls ===
MF._buildNecromancer = function(g, color, sc, rank){
  if (MF._buildMage) MF._buildMage(g, 0x6a3a90, sc, rank);
  // Dark hood (cone above head)
  var hoodMat = new THREE.MeshStandardMaterial({ color: 0x1a0a30, roughness: 0.9 });
  var hood = new THREE.Mesh(new THREE.ConeGeometry(0.32 * sc, 0.5 * sc, 12), hoodMat);
  hood.position.y = 1.32 * sc;
  hood.castShadow = true;
  g.add(hood);
  // Floating skull aura (3 tiny skulls)
  var skulls = [];
  var skullMat = new THREE.MeshStandardMaterial({ color: 0xfff8e0, roughness: 0.5, emissive: 0x402080, emissiveIntensity: 0.4 });
  for (var k = 0; k < 3; k++){
    var sk = new THREE.Mesh(new THREE.SphereGeometry(0.10 * sc, 10, 8), skullMat);
    sk.userData.skipOutline = true;
    g.add(sk);
    skulls.push(sk);
  }
  g.userData.necroSkulls = skulls;
};

// === P13 BERSERKER — barbare torse nu, 2 haches, peinture rouge ===
MF._buildBerserker = function(g, color, sc, rank){
  var skinMat = MF._matStandard(0xc06040, { r: 0.85 });
  var darkMat = MF._matStandard(0x6a3018, { r: 0.85 });
  // Body bare-chest
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.50*sc, 0.55*sc, 0.36*sc), skinMat);
  torso.position.y = 0.40*sc;
  torso.castShadow = true;
  g.add(torso);
  // War paint stripes
  var paintMat = new THREE.MeshBasicMaterial({ color: 0xc02020 });
  for (var p = 0; p < 3; p++){
    var paint = new THREE.Mesh(new THREE.BoxGeometry(0.46*sc, 0.05*sc, 0.005), paintMat);
    paint.position.set(0, 0.55*sc - p * 0.12*sc, 0.181*sc);
    g.add(paint);
  }
  // Head with messy hair
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.20*sc, 14, 12), skinMat);
  head.position.y = 0.85*sc;
  head.castShadow = true;
  g.add(head);
  // Hair (cone messy)
  var hairMat = MF._matStandard(0x4a2010, { r: 0.95 });
  var hair = new THREE.Mesh(new THREE.ConeGeometry(0.22*sc, 0.18*sc, 8), hairMat);
  hair.position.y = 1.00*sc;
  hair.rotation.z = 0.15;
  g.add(hair);
  // Eyes (rage)
  var eyeMat = MF._matStandard(0xff3030, { em: 0xff2020, emI: 1.5 });
  for (var e = -1; e <= 1; e += 2){
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.04*sc, 8, 6), eyeMat);
    eye.position.set(e * 0.08*sc, 0.86*sc, 0.18*sc);
    g.add(eye);
  }
  // Loincloth
  var loin = new THREE.Mesh(new THREE.BoxGeometry(0.42*sc, 0.18*sc, 0.30*sc), darkMat);
  loin.position.y = 0.18*sc;
  g.add(loin);
  // 2 axes (left + right)
  var handleMat = MF._matStandard(0x6a3018, { r: 0.85 });
  var bladeMat = MF._matStandard(0xa0a0a0, { r: 0.4, m: 0.7 });
  for (var a = -1; a <= 1; a += 2){
    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03*sc, 0.03*sc, 0.55*sc, 6), handleMat);
    handle.position.set(a * 0.40*sc, 0.45*sc, 0);
    handle.rotation.z = a * 0.25;
    g.add(handle);
    var blade = new THREE.Mesh(new THREE.BoxGeometry(0.18*sc, 0.18*sc, 0.04*sc), bladeMat);
    blade.position.set(a * 0.50*sc, 0.70*sc, 0);
    blade.rotation.z = a * 0.25;
    g.add(blade);
  }
  // Arms
  for (var arm = -1; arm <= 1; arm += 2){
    var armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07*sc, 0.07*sc, 0.40*sc, 6), skinMat);
    armMesh.position.set(arm * 0.30*sc, 0.50*sc, 0);
    armMesh.rotation.z = arm * 0.30;
    g.add(armMesh);
  }
};

// === P13 SNIPER — silhouette furtive, longarc, cape verte ===
MF._buildSniper = function(g, color, sc, rank){
  var clothMat = MF._matStandard(0x205040, { r: 0.85 });
  var skinMat = MF._matStandard(0xddc0a0, { r: 0.7 });
  // Body slim
  var body = new THREE.Mesh(new THREE.CylinderGeometry(0.18*sc, 0.20*sc, 0.65*sc, 8), clothMat);
  body.position.y = 0.45*sc;
  body.castShadow = true;
  g.add(body);
  // Cape behind
  var capeMat = MF._matStandard(0x408060, { r: 0.85 });
  capeMat.side = THREE.DoubleSide;
  var cape = new THREE.Mesh(new THREE.PlaneGeometry(0.50*sc, 0.70*sc), capeMat);
  cape.position.set(0, 0.50*sc, -0.18*sc);
  g.add(cape);
  // Head with hood
  var hoodMat = MF._matStandard(0x205038, { r: 0.9 });
  var hood = new THREE.Mesh(new THREE.ConeGeometry(0.22*sc, 0.34*sc, 12), hoodMat);
  hood.position.y = 0.95*sc;
  hood.castShadow = true;
  g.add(hood);
  // Face (small, partial)
  var face = new THREE.Mesh(new THREE.SphereGeometry(0.16*sc, 12, 10), skinMat);
  face.position.y = 0.85*sc;
  g.add(face);
  // Single sharp eye glow
  var eyeMat = MF._matStandard(0x80f0a0, { em: 0x40c060, emI: 2.0 });
  var eye = new THREE.Mesh(new THREE.SphereGeometry(0.045*sc, 8, 6), eyeMat);
  eye.position.set(0, 0.86*sc, 0.16*sc);
  g.add(eye);
  // Long bow vertical
  var bowMat = MF._matStandard(0x6a4818, { r: 0.85 });
  var bow = new THREE.Mesh(new THREE.TorusGeometry(0.40*sc, 0.025*sc, 6, 14, Math.PI * 1.2), bowMat);
  bow.position.set(0.30*sc, 0.55*sc, 0);
  bow.rotation.z = Math.PI / 2;
  bow.castShadow = true;
  g.add(bow);
  // Bowstring
  var stringMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  var str = new THREE.Mesh(new THREE.CylinderGeometry(0.005*sc, 0.005*sc, 0.74*sc, 4), stringMat);
  str.position.set(0.30*sc, 0.55*sc, 0);
  g.add(str);
  // Arrow already drawn (notched)
  var arrowMat = MF._matStandard(0xc0c0c0, { r: 0.4, m: 0.6 });
  var arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.01*sc, 0.01*sc, 0.45*sc, 5), arrowMat);
  arrow.position.set(0.30*sc, 0.55*sc, 0);
  arrow.rotation.z = Math.PI / 2;
  g.add(arrow);
  // Quiver on back
  var quivMat = MF._matStandard(0x4a3018, { r: 0.85 });
  var quiv = new THREE.Mesh(new THREE.CylinderGeometry(0.07*sc, 0.07*sc, 0.40*sc, 8), quivMat);
  quiv.position.set(-0.20*sc, 0.55*sc, -0.10*sc);
  quiv.rotation.x = 0.3;
  g.add(quiv);
};

// === P13 TIME MAGE — robe bleue + sablier flottant + particules dorées ===
MF._buildTimemage = function(g, color, sc, rank){
  var robeMat = MF._matStandard(0x4060a0, { r: 0.8 });
  var trimMat = MF._matStandard(0xffd96a, { r: 0.4, m: 0.7, em: 0xffae3a, emI: 0.4 });
  // Robe (cone)
  var robe = new THREE.Mesh(new THREE.ConeGeometry(0.34*sc, 0.85*sc, 14), robeMat);
  robe.position.y = 0.42*sc;
  robe.castShadow = true;
  g.add(robe);
  // Gold trim ring at bottom
  var trim = new THREE.Mesh(new THREE.TorusGeometry(0.34*sc, 0.025*sc, 6, 18), trimMat);
  trim.position.y = 0.05*sc;
  trim.rotation.x = Math.PI / 2;
  g.add(trim);
  // Hood
  var hood = new THREE.Mesh(new THREE.ConeGeometry(0.22*sc, 0.30*sc, 12), robeMat);
  hood.position.y = 1.00*sc;
  hood.castShadow = true;
  g.add(hood);
  // Face (dark inside hood)
  var faceMat = MF._matStandard(0x202040, { r: 0.9 });
  var face = new THREE.Mesh(new THREE.SphereGeometry(0.13*sc, 10, 8), faceMat);
  face.position.y = 0.92*sc;
  g.add(face);
  // Glowing eyes (clock-like)
  var eyeMat = MF._matStandard(0xffd96a, { em: 0xffae3a, emI: 1.8 });
  for (var ee = -1; ee <= 1; ee += 2){
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.035*sc, 8, 6), eyeMat);
    eye.position.set(ee * 0.06*sc, 0.93*sc, 0.10*sc);
    g.add(eye);
  }
  // Floating hourglass at chest height
  var hgMat = MF._matStandard(0xffd96a, { em: 0xffae3a, emI: 0.7, r: 0.3, m: 0.5, t: 0.7 });
  var hgTop = new THREE.Mesh(new THREE.ConeGeometry(0.10*sc, 0.13*sc, 8), hgMat);
  hgTop.position.set(0, 0.55*sc, 0.30*sc);
  hgTop.rotation.x = Math.PI;
  g.add(hgTop);
  var hgBot = new THREE.Mesh(new THREE.ConeGeometry(0.10*sc, 0.13*sc, 8), hgMat);
  hgBot.position.set(0, 0.42*sc, 0.30*sc);
  g.add(hgBot);
  var hgLink = new THREE.Mesh(new THREE.CylinderGeometry(0.015*sc, 0.015*sc, 0.04*sc, 6), hgMat);
  hgLink.position.set(0, 0.485*sc, 0.30*sc);
  g.add(hgLink);
  g.userData.hourglass = { top: hgTop, bot: hgBot, link: hgLink };
  // Aura disc on ground
  var auraMat = new THREE.MeshBasicMaterial({ color: 0xc8d8ff, transparent: true, opacity: 0.20, depthWrite: false });
  var aura = new THREE.Mesh(new THREE.CircleGeometry(0.55*sc, 22), auraMat);
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.02;
  g.add(aura);
  g.userData.timeAura = aura;
};

// === P13 BARD — luth doré + cape pourpre + plume ===
MF._buildBard = function(g, color, sc, rank){
  var clothMat = MF._matStandard(0x9040c0, { r: 0.7 });
  var skinMat = MF._matStandard(0xeec8a0, { r: 0.7 });
  var goldMat = MF._matStandard(0xffd96a, { r: 0.3, m: 0.85, em: 0xff8030, emI: 0.4 });
  // Body
  var body = new THREE.Mesh(new THREE.CylinderGeometry(0.22*sc, 0.26*sc, 0.55*sc, 10), clothMat);
  body.position.y = 0.40*sc;
  body.castShadow = true;
  g.add(body);
  // Belt gold
  var belt = new THREE.Mesh(new THREE.TorusGeometry(0.26*sc, 0.025*sc, 6, 16), goldMat);
  belt.position.y = 0.18*sc;
  belt.rotation.x = Math.PI / 2;
  g.add(belt);
  // Head
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.20*sc, 14, 12), skinMat);
  head.position.y = 0.85*sc;
  head.castShadow = true;
  g.add(head);
  // Hat (wide brim) with feather
  var hatMat = MF._matStandard(0x6a2090, { r: 0.85 });
  var hat = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.30*sc, 0.04*sc, 14), hatMat);
  hat.position.y = 1.00*sc;
  hat.castShadow = true;
  g.add(hat);
  var hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.16*sc, 0.18*sc, 0.18*sc, 12), hatMat);
  hatTop.position.y = 1.10*sc;
  g.add(hatTop);
  // Feather
  var featherMat = MF._matStandard(0xff80c0, { r: 0.6 });
  var feather = new THREE.Mesh(new THREE.ConeGeometry(0.05*sc, 0.30*sc, 5), featherMat);
  feather.position.set(0.16*sc, 1.30*sc, 0);
  feather.rotation.z = -0.5;
  g.add(feather);
  // Lute on side
  var luteBodyMat = MF._matStandard(0xc09030, { r: 0.5, m: 0.4 });
  var luteBody = new THREE.Mesh(new THREE.SphereGeometry(0.18*sc, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), luteBodyMat);
  luteBody.position.set(0.32*sc, 0.50*sc, 0);
  luteBody.rotation.z = -0.3;
  luteBody.scale.set(1, 0.7, 1);
  g.add(luteBody);
  var luteNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.025*sc, 0.025*sc, 0.50*sc, 6), goldMat);
  luteNeck.position.set(0.40*sc, 0.85*sc, 0);
  luteNeck.rotation.z = -0.6;
  g.add(luteNeck);
  // Strings
  for (var st = 0; st < 4; st++){
    var stringg = new THREE.Mesh(new THREE.CylinderGeometry(0.005*sc, 0.005*sc, 0.46*sc, 4),
      new THREE.MeshBasicMaterial({ color: 0xeeeeee }));
    stringg.position.set(0.40*sc + (st - 1.5) * 0.005*sc, 0.85*sc, 0);
    stringg.rotation.z = -0.6;
    g.add(stringg);
  }
  // Aura music notes
  var auraMat = new THREE.MeshBasicMaterial({ color: 0xc080ff, transparent: true, opacity: 0.18, depthWrite: false });
  var aura = new THREE.Mesh(new THREE.CircleGeometry(0.60*sc, 22), auraMat);
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.02;
  g.add(aura);
  g.userData.bardAura = aura;
};

// === P13 SUMMONER — sphère cristalline + chapeau pointu + brume bleue ===
MF._buildSummoner = function(g, color, sc, rank){
  var robeMat = MF._matStandard(0x3060a0, { r: 0.85 });
  // Robe
  var robe = new THREE.Mesh(new THREE.ConeGeometry(0.32*sc, 0.80*sc, 14), robeMat);
  robe.position.y = 0.40*sc;
  robe.castShadow = true;
  g.add(robe);
  // Tall pointed hat
  var hatMat = MF._matStandard(0x4080c0, { r: 0.85 });
  var hat = new THREE.Mesh(new THREE.ConeGeometry(0.20*sc, 0.50*sc, 10), hatMat);
  hat.position.y = 1.10*sc;
  hat.castShadow = true;
  g.add(hat);
  // Hat brim
  var brim = new THREE.Mesh(new THREE.CylinderGeometry(0.30*sc, 0.30*sc, 0.04*sc, 14), hatMat);
  brim.position.y = 0.88*sc;
  g.add(brim);
  // Hat star
  var starMat = MF._matStandard(0xa0c0ff, { em: 0xa0c0ff, emI: 1.5 });
  var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06*sc, 0), starMat);
  star.position.y = 1.45*sc;
  g.add(star);
  // Face glow (no real face)
  var faceMat = MF._matStandard(0x2040a0, { em: 0x4080c0, emI: 0.5, t: 0.85 });
  var face = new THREE.Mesh(new THREE.SphereGeometry(0.13*sc, 12, 10), faceMat);
  face.position.y = 0.85*sc;
  g.add(face);
  // 2 glowing eyes
  for (var ed = -1; ed <= 1; ed += 2){
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.035*sc, 8, 6),
      MF._matStandard(0xa0c0ff, { em: 0xa0c0ff, emI: 1.8 }));
    eye.position.set(ed * 0.06*sc, 0.86*sc, 0.10*sc);
    g.add(eye);
  }
  // Floating crystal sphere in front of body (held by magic)
  var sphereMat = MF._matStandard(0x80c0ff, { em: 0x4080c0, emI: 1.0, r: 0.2, m: 0.5, t: 0.78 });
  var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.16*sc, 14, 10), sphereMat);
  sphere.position.set(0, 0.55*sc, 0.34*sc);
  g.add(sphere);
  g.userData.summonOrb = sphere;
  // Mist particles around base
  var mistMat = new THREE.MeshBasicMaterial({ color: 0xa0c0ff, transparent: true, opacity: 0.30, depthWrite: false });
  var mistMeshes = [];
  for (var m = 0; m < 5; m++){
    var mist = new THREE.Mesh(new THREE.SphereGeometry(0.10*sc, 10, 8), mistMat);
    var ang = (m / 5) * Math.PI * 2;
    mist.position.set(Math.cos(ang) * 0.30*sc, 0.10*sc, Math.sin(ang) * 0.30*sc);
    g.add(mist);
    mistMeshes.push(mist);
  }
  g.userData.summonMist = mistMeshes;
};

// === HYBRID — combines visual elements of 2 recipe parents + a fusion halo ===
MF._buildHybrid = function(g, id, color, sc, rank){
  var data = MF.UNITS[id];
  if (!data) return;
  var recipe = data.recipe || ['knight', 'dragon'];
  var idA = recipe[0], idB = recipe[1];
  // Base body: builder A with hybrid color
  var builderA = MF['_build' + (idA.charAt(0).toUpperCase() + idA.slice(1))];
  var builderB = MF['_build' + (idB.charAt(0).toUpperCase() + idB.slice(1))];
  if (builderA) builderA(g, color, sc, 5);
  // Add a smaller "echo" of builder B as a floating attachment behind/above
  if (builderB){
    var bGroup = new THREE.Group();
    builderB(bGroup, color, sc * 0.55, 5);
    bGroup.position.set(0, 0.6 * sc, -0.35 * sc);
    bGroup.scale.setScalar(0.7);
    g.add(bGroup);
    g.userData.hybridSat = bGroup;
  }
  // Fusion ring (animated)
  var ringMat = new THREE.MeshBasicMaterial({
    color: color, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide
  });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.85 * sc, 0.05 * sc, 6, 28), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.4 * sc;
  g.add(ring);
  g.userData.hybridRing = ring;
  // Fusion sparkles (small spheres orbiting at 0.7sc)
  var sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false });
  var sparkles = [];
  for (var i = 0; i < 6; i++){
    var sp = new THREE.Mesh(new THREE.SphereGeometry(0.06 * sc, 8, 6), sparkleMat);
    var a = i / 6 * Math.PI * 2;
    sp.position.set(Math.cos(a) * 0.85 * sc, 0.5 * sc + Math.sin(a) * 0.05, Math.sin(a) * 0.85 * sc);
    g.add(sp);
    sparkles.push(sp);
  }
  g.userData.hybridSparkles = sparkles;
};

MF._mulColor = function(hex, f){
  var r = ((hex >> 16) & 0xff) * f;
  var gr = ((hex >> 8) & 0xff) * f;
  var b = (hex & 0xff) * f;
  r = Math.max(0, Math.min(255, Math.round(r)));
  gr = Math.max(0, Math.min(255, Math.round(gr)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return (r << 16) | (gr << 8) | b;
};

// === Lifecycle ===
MF.spawnUnit = function(id, rank, c, r){
  if (!MF.UNITS[id]) return null;
  if (!MF.isPlaceable(c, r)) return null;
  var pos = MF.gridToWorld(c, r);
  var mesh = MF.buildUnitMesh(id, rank);
  mesh.position.set(pos.x, 0, pos.z);
  if (!MF.three || !MF.three.worldGroup) return null;
  MF.three.worldGroup.add(mesh);
  var unit = {
    uid: ++MF._unitIdCounter, id: id, rank: rank, kind: MF.UNITS[id].kind,
    c: c, r: r,
    pos: new THREE.Vector3(pos.x, 0, pos.z),
    mesh: mesh, cooldown: 0, target: null, facing: 0,
    breatheT: Math.random() * Math.PI * 2
  };
  MF.units.push(unit);
  MF.setCell(c, r, unit);
  // Initialize mesh at final scale so it's visible immediately even if paused
  // (the pop animation will start from current scale next time update runs)
  var finalScale = (MF.UNITS[id].ranks[rank - 1].scale || 1) * (MF.UNIT_SIZE_MULT || 1);
  mesh.scale.setScalar(finalScale);
  unit.spawnT = null;     // skip pop animation entirely (was causing invisible-when-paused bug)
  return unit;
};

MF.removeUnit = function(unit){
  if (!unit) return;
  MF.three.worldGroup.remove(unit.mesh);
  MF._disposeMesh(unit.mesh);
  MF.setCell(unit.c, unit.r, null);
  var i = MF.units.indexOf(unit);
  if (i >= 0) MF.units.splice(i, 1);
};

MF.moveUnitTo = function(unit, c, r){
  if (!unit) return false;
  if (!MF.isPlaceable(c, r)) return false;
  MF.setCell(unit.c, unit.r, null);
  unit.c = c; unit.r = r;
  var p = MF.gridToWorld(c, r);
  unit.pos.set(p.x, 0, p.z);
  unit.mesh.position.set(p.x, 0, p.z);
  MF.setCell(c, r, unit);
  return true;
};

MF.clearUnits = function(){
  for (var i = MF.units.length - 1; i >= 0; i--) MF.removeUnit(MF.units[i]);
  MF.units = [];
};

MF.updateUnits = function(dt){
  for (var i = 0; i < MF.units.length; i++){
    var u = MF.units[i];
    var data = MF.UNITS[u.id];
    var atk = data.attack;
    var rdata = data.ranks[u.rank - 1];

    // Spawn pop animation
    var rscale = (rdata.scale || 1) * (MF.UNIT_SIZE_MULT || 1);
    if (u.spawnT != null){
      u.spawnT += dt;
      var s = Math.min(1, u.spawnT / 0.35);
      var ease = 1 - Math.pow(1 - s, 3);
      var sc = ease * rscale;
      u.mesh.scale.setScalar(sc);
      if (s >= 1) u.spawnT = null;
    } else {
      // Breathing: subtle scale.y pulsation
      u.breatheT += dt * 1.3;
      var br = 1 + Math.sin(u.breatheT) * 0.025;
      u.mesh.scale.set(rscale * (1 - 0.012), rscale * br, rscale * (1 - 0.012));
    }

    // Idle bobbing
    var idle = Math.sin((MF._t || 0) * 1.5 + u.uid) * 0.05;
    u.mesh.position.y = idle;

    // Halo pulse
    if (u.mesh.userData.halo){
      u.mesh.userData.halo.material.opacity =
        (u.rank === 5 ? 0.2 : (u.rank === 4 ? 0.16 : 0.10)) +
        Math.sin((MF._t || 0) * 3 + u.uid) * 0.08;
    }
    // Rank-5 orbiters (visual + small DPS to nearby enemies)
    if (u.mesh.userData.orbiters){
      var orbs = u.mesh.userData.orbiters;
      var sc5 = u.mesh.userData.unitSc || 1;
      for (var oi = 0; oi < orbs.length; oi++){
        var ang = (MF._t || 0) * 1.6 + oi * (Math.PI * 2 / 3) + u.uid;
        orbs[oi].position.set(
          Math.cos(ang) * 0.7 * sc5,
          0.8 * sc5 + Math.sin(ang * 1.4) * 0.15 * sc5,
          Math.sin(ang) * 0.7 * sc5
        );
        orbs[oi].material.emissiveIntensity = 1.2 + Math.sin((MF._t||0)*5 + oi) * 0.4;
      }
      // Orbiter DPS — tick every 0.25s
      u.orbT = (u.orbT || 0) + dt;
      if (u.orbT >= 0.25){
        u.orbT = 0;
        var orbRange = 0.95 * sc5;
        var orbDmg = Math.round((rdata.dmg || 50) * 0.18);   // ~18% of unit dmg per tick
        if (MF.enemies && MF.enemies.length){
          for (var oj = MF.enemies.length - 1; oj >= 0; oj--){
            var oe = MF.enemies[oj];
            if (!oe || !oe.alive) continue;
            var odx = oe.pos.x - u.pos.x, odz = oe.pos.z - u.pos.z;
            if (odx*odx + odz*odz <= orbRange * orbRange){
              MF.dealDamage(oe, orbDmg, 'normal');
            }
          }
        }
      }
    }

    // Legendary skin orbital particles
    if (u.mesh.userData.legendaryParticles){
      var lscP = (MF.UNITS[u.id].ranks[u.rank-1].scale) || 1;
      u.mesh.userData.legendaryParticles.forEach(function(p, idx){
        var aLP = (MF._t||0) * 1.3 + idx * (Math.PI*2/5) + u.uid;
        p.position.set(
          Math.cos(aLP) * 0.95 * lscP,
          0.55 * lscP + Math.sin(aLP * 2.2) * 0.18 * lscP,
          Math.sin(aLP) * 0.95 * lscP
        );
        p.material.opacity = 0.6 + Math.sin((MF._t||0) * 4 + idx) * 0.3;
      });
    }
    // Rainbow skin: hue cycling on the body group materials (skip if R5 to preserve gold)
    if (u.mesh.userData.rainbowSkin && u.mesh.userData.bodyGroup && u.rank < 5){
      var hue = ((MF._t||0) * 0.6 + u.uid * 0.13) % 1;
      var rbCol = new THREE.Color().setHSL(hue, 0.85, 0.55);
      u.mesh.userData.bodyGroup.traverse(function(m){
        if (m.material && m.material.color && !m.userData.skipOutline){
          m.material.color.setRGB(rbCol.r, rbCol.g, rbCol.b);
        }
      });
    }
    // Paladin halo glow pulse
    if (u.mesh.userData.paladinHalo){
      u.mesh.userData.paladinHalo.material.opacity = 0.7 + Math.sin((MF._t||0)*3 + u.uid) * 0.15;
      u.mesh.userData.paladinHalo.rotation.z = (MF._t||0) * 0.5;
    }
    // Necromancer floating skulls
    if (u.mesh.userData.necroSkulls){
      var nsc = (MF.UNITS[u.id].ranks[u.rank-1].scale) || 1;
      u.mesh.userData.necroSkulls.forEach(function(s, idx){
        var aN = (MF._t||0) * 1.1 + idx * (Math.PI*2/3) + u.uid;
        s.position.set(
          Math.cos(aN) * 0.45 * nsc,
          0.85 * nsc + Math.sin(aN * 1.6) * 0.06,
          Math.sin(aN) * 0.45 * nsc
        );
      });
    }

    // Paladin: tick heal to fortress (R3+) every 2.5s
    if (u.id === 'paladin' && u.rank >= 3 && MF.state && MF.state.fortressHP < MF.state.fortressMaxHP){
      u.healT = (u.healT || 0) + dt;
      if (u.healT >= 2.5){
        u.healT = 0;
        var heal = Math.min(MF.state.fortressMaxHP - MF.state.fortressHP, 1);
        if (heal > 0){
          MF.state.fortressHP += heal;
          if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(MF.grid.fortressPos || u.pos, 0xfff080, { scale: 1.5, life: 0.4 });
          if (MF.fx && MF.fx.floatingDmg) MF.fx.floatingDmg(MF.grid.fortressPos || u.pos, '+' + heal + ' ❤', 'heal');
        }
      }
    }
    // Necromancer: random small summon (chaos only) every 6s, 30% chance, R3+
    if (u.id === 'necromancer' && u.rank >= 3 && MF.state.mode === 'chaos'){
      u.summT = (u.summT || 0) + dt;
      if (u.summT >= 6.0){
        u.summT = 0;
        if (Math.random() < 0.30 && MF.spawnEnemy && MF.enemies.length > 0){
          // Find nearest enemy and damage it as a "skeleton burst"
          var target = MF.findClosestEnemy(u.pos, 4.5, false);
          if (target){
            MF.dealDamage(target, (MF.UNITS[u.id].ranks[u.rank-1].dmg || 100) * 0.5, 'normal');
            if (MF.fx && MF.fx.spawnBurst) MF.fx.spawnBurst(target.pos, 0x9050d0, 12, { speed: 3 });
            if (MF.fx && MF.fx.floatingDmg) MF.fx.floatingDmg(target.pos, '☠ Squelette', 'crit');
          }
        }
      }
    }

    // R5 manual ultimate cooldown tick
    if (u.r5UltCd && u.r5UltCd > 0){
      u.r5UltCd -= dt;
      if (u.r5UltCd <= 0){ u.r5UltCd = 0; if (MF.notify_push) MF.notify_push('☄ ' + (MF.UNITS[u.id] ? MF.UNITS[u.id].name : '') + ' R5 prêt !', 'info'); }
    }
    // P14 Berserker furie tick
    if (u.berserkerFury > 0){
      u.berserkerFury -= dt;
      if (u.berserkerFury <= 0) u.berserkerFury = 0;
    }

    // P13 Time Mage: hourglass rotation + aura pulse
    if (u.id === 'timemage' && u.mesh.userData.bodyGroup){
      var bgT = u.mesh.userData.bodyGroup;
      if (bgT.userData.hourglass){
        var hg = bgT.userData.hourglass;
        var spin = (MF._t || 0) * 1.5;
        hg.top.rotation.y = spin;
        hg.bot.rotation.y = -spin;
      }
      if (bgT.userData.timeAura){
        bgT.userData.timeAura.material.opacity = 0.15 + Math.sin((MF._t||0) * 2 + u.uid) * 0.10;
        bgT.userData.timeAura.scale.setScalar(1 + Math.sin((MF._t||0) * 1.5) * 0.06);
      }
    }
    // P13 Bard: aura music pulse
    if (u.id === 'bard' && u.mesh.userData.bodyGroup){
      var bgB = u.mesh.userData.bodyGroup;
      if (bgB.userData.bardAura){
        bgB.userData.bardAura.material.opacity = 0.15 + Math.sin((MF._t||0) * 3 + u.uid) * 0.08;
      }
    }
    // P13 Summoner: floating crystal orb + mist orbit
    if (u.id === 'summoner' && u.mesh.userData.bodyGroup){
      var bgS = u.mesh.userData.bodyGroup;
      if (bgS.userData.summonOrb){
        var oy = 0.55 + Math.sin((MF._t||0) * 2 + u.uid) * 0.06;
        bgS.userData.summonOrb.position.y = oy;
        bgS.userData.summonOrb.rotation.y = (MF._t||0);
      }
      if (bgS.userData.summonMist){
        bgS.userData.summonMist.forEach(function(m, idx){
          var aM = (MF._t||0) * 0.8 + idx * (Math.PI*2/5) + u.uid;
          m.position.x = Math.cos(aM) * 0.30;
          m.position.z = Math.sin(aM) * 0.30;
          m.position.y = 0.10 + Math.sin(aM * 2) * 0.04;
        });
      }
    }
    // P13 Berserker: rage stack visual (small red glow scales with stacks)
    if (u.id === 'berserker' && u.rageStacks > 0 && u.mesh.userData.bodyGroup){
      var bgBe = u.mesh.userData.bodyGroup;
      if (!bgBe.userData.rageGlow){
        var rgMat = new THREE.MeshBasicMaterial({ color: 0xff5040, transparent: true, opacity: 0.3, depthWrite: false });
        var rgMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), rgMat);
        rgMesh.position.y = 0.4;
        bgBe.add(rgMesh);
        bgBe.userData.rageGlow = rgMesh;
      }
      var stackPct = u.rageStacks / 10;
      bgBe.userData.rageGlow.material.opacity = 0.15 + stackPct * 0.30;
      bgBe.userData.rageGlow.scale.setScalar(0.8 + stackPct * 0.5);
    }

    // Hybrid fusion ring + sparkle orbit
    if (u.mesh.userData.hybridRing){
      u.mesh.userData.hybridRing.rotation.z = (MF._t || 0) * 0.8;
      u.mesh.userData.hybridRing.material.opacity = 0.45 + Math.sin((MF._t||0) * 2 + u.uid) * 0.18;
    }
    if (u.mesh.userData.hybridSparkles){
      var hsc = (MF.UNITS[u.id].ranks[u.rank-1].scale) || 1;
      u.mesh.userData.hybridSparkles.forEach(function(sp, idx){
        var aa = (MF._t || 0) * 1.4 + idx * (Math.PI * 2 / 6) + u.uid;
        sp.position.set(
          Math.cos(aa) * 0.85 * hsc,
          0.5 * hsc + Math.sin(aa * 1.7) * 0.08,
          Math.sin(aa) * 0.85 * hsc
        );
        sp.material.opacity = 0.6 + Math.sin((MF._t||0) * 4 + idx) * 0.3;
      });
    }
    if (u.mesh.userData.hybridSat){
      u.mesh.userData.hybridSat.rotation.y = (MF._t || 0) * 0.6 + u.uid;
      u.mesh.userData.hybridSat.position.y = 0.6 * ((MF.UNITS[u.id].ranks[u.rank-1].scale)||1) + Math.sin((MF._t||0)*1.5)*0.05;
    }

    // Specifics
    if (u.id === 'dragon' && u.mesh.userData.bodyGroup){
      var bg = u.mesh.userData.bodyGroup;
      if (bg.userData.wings){
        bg.userData.wings[0].rotation.y = -0.6 + Math.sin((MF._t || 0) * 6 + u.uid) * 0.3;
        bg.userData.wings[1].rotation.y =  0.6 - Math.sin((MF._t || 0) * 6 + u.uid) * 0.3;
      }
    }
    if (u.id === 'fire' && u.mesh.userData.bodyGroup){
      var bgF = u.mesh.userData.bodyGroup;
      if (bgF.userData.flame){
        var flicker = 1 + Math.sin((MF._t||0)*8 + u.uid)*0.10;
        bgF.userData.flame.scale.set(flicker, 1 + Math.sin((MF._t||0)*8 + u.uid)*0.13, flicker);
        if (bgF.userData.flameHalo){
          bgF.userData.flameHalo.material.opacity = 0.32 + Math.sin((MF._t||0)*9 + u.uid) * 0.12;
        }
      }
    }
    if (u.id === 'tesla' && u.mesh.userData.bodyGroup){
      var bgT = u.mesh.userData.bodyGroup;
      if (bgT.userData.orb) bgT.userData.orb.scale.setScalar(1 + Math.sin((MF._t||0)*10 + u.uid)*0.1);
      if (bgT.userData.orbGlow) bgT.userData.orbGlow.material.opacity = 0.55 + Math.sin((MF._t||0)*11 + u.uid) * 0.18;
    }
    if (u.id === 'frost' && u.mesh.userData.bodyGroup){
      var bgFr = u.mesh.userData.bodyGroup;
      if (bgFr.userData.crystal) bgFr.userData.crystal.rotation.y = (MF._t || 0) * 0.7;
      if (bgFr.userData.crystalHalo) bgFr.userData.crystalHalo.material.opacity = 0.24 + Math.sin((MF._t||0)*4 + u.uid) * 0.1;
    }
    if (u.id === 'ice' && u.mesh.userData.bodyGroup){
      var bgIce = u.mesh.userData.bodyGroup;
      if (bgIce.userData.iceCrystals){
        bgIce.userData.iceCrystals.forEach(function(c, idx){
          var a = (MF._t || 0) * 1.0 + idx * (Math.PI * 2 / 5);
          c.position.x = Math.cos(a) * 0.4 * (rdata.scale || 1);
          c.position.z = Math.sin(a) * 0.4 * (rdata.scale || 1);
        });
      }
    }

    // P12: 3-phase attack animation (anticipation → strike → recovery)
    if (u.attackAnimT && u.attackAnimT > 0){
      u.attackAnimT -= dt;
      var totalDur = 0.42;
      var elapsed = totalDur - u.attackAnimT;
      var pose = 0;
      if (elapsed < 0.10){
        // Anticipation (recule): 0 → -0.5 (negative pose)
        var ap = elapsed / 0.10;
        pose = -0.5 * (1 - Math.cos(ap * Math.PI)) / 2;     // smooth ease
      } else if (elapsed < 0.20){
        // Strike (frappe): -0.5 → 1.0 (sharp forward)
        var sp = (elapsed - 0.10) / 0.10;
        pose = -0.5 + 1.5 * sp * (2 - sp);    // ease-out quad
      } else {
        // Recovery (retour): 1.0 → 0
        var rp = (elapsed - 0.20) / (totalDur - 0.20);
        pose = 1.0 * (1 - rp) * (1 - rp);
      }
      MF._applyAttackAnim(u, pose);
    } else if (u.attackAnimPoseSet){
      MF._resetAttackAnim(u);
      u.attackAnimPoseSet = false;
    }
    // P12: Victory pose (when triggered, brief raised arms)
    if (u.victoryT && u.victoryT > 0){
      u.victoryT -= dt;
      var bg2 = u.mesh.userData.bodyGroup;
      if (bg2){
        var vp = Math.sin((1 - u.victoryT / 1.5) * Math.PI);
        bg2.position.y = 0.32 + 0.08 * vp;
        bg2.rotation.x = -0.15 * vp;
      }
    }

    // Apply roguelite atk-speed and range multipliers
    var asMult = (MF.run && MF.run.atkSpeedMult) ? (typeof MF.run.atkSpeedMult === 'object' ? ((MF.run.atkSpeedMult['*'] || 1) * (MF.run.atkSpeedMult[u.id] || 1)) : MF.run.atkSpeedMult) : 1;
    var rangeMult = (MF.run && MF.run.rangeMult) ? ((MF.run.rangeMult['*'] || 1) * (MF.run.rangeMult[u.id] || 1)) : 1;
    if (MF.run && MF.run.unitRangeMult) rangeMult *= MF.run.unitRangeMult;
    // P13 skin stats
    var sb = MF.applySkinStats ? MF.applySkinStats(u) : null;
    if (sb){
      if (sb.atkSpeedMult) asMult *= sb.atkSpeedMult;
      if (sb.rangeMult) rangeMult *= sb.rangeMult;
    }
    // P13 berserker rage stack
    if (u.id === 'berserker' && u.rageStacks){
      asMult *= 1 + 0.05 * Math.min(10, u.rageStacks);
    }
    // Synergies
    if (MF.run && MF.run.synergyAtkSpeed) asMult *= MF.run.synergyAtkSpeed;
    u.cooldown -= dt * (atk.atkSpeed || 1) * asMult;
    var range = (atk.range || 3) * (1 + (u.rank - 1) * 0.10) * rangeMult;
    if (u.target && (!u.target.alive || u.target.pos.distanceTo(u.pos) > range)) u.target = null;
    if (!u.target) u.target = MF.findClosestEnemy(u.pos, range, atk.hitsFlying !== false);
    if (u.target){
      var dx = u.target.pos.x - u.pos.x, dz = u.target.pos.z - u.pos.z;
      u.facing = Math.atan2(dx, dz);
      if (u.mesh.userData.bodyGroup) u.mesh.userData.bodyGroup.rotation.y = u.facing;
      if (u.cooldown <= 0){
        u.cooldown = 1;
        // P12: delay projectile slightly so it fires at the strike moment (~0.10s)
        var fireUnit = u;
        var fireTarget = u.target;
        setTimeout(function(){
          if (fireUnit && fireTarget && fireTarget.alive) MF.fireProjectile(fireUnit, fireTarget);
        }, 100);
        u.attackAnimT = 0.42;
        u.attackAnimPoseSet = true;
      }
    }
  }
};

// Apply per-type attack pose. `t` = 1 → just fired, 0 → resting.
MF._applyAttackAnim = function(u, t){
  var bg = u.mesh.userData.bodyGroup;
  if (!bg) return;
  var id = u.id;
  // Default: small forward lean
  var lean = 0.18 * t;

  if (id === 'cannon'){
    // Recoil: barrel pulled backward
    var bar = bg.userData && bg.userData.barrel;
    if (bar){
      // Barrel pos was set at z=0.30*sc. Pull back by 0.20*sc * t along its axis.
      var sc = u.mesh.userData.unitScale || 1;
      bar.position.z = 0.30 * sc - 0.18 * sc * t;
      bar.position.y = 0.50 * sc - 0.10 * sc * t;
    }
  } else if (id === 'archer' || id === 'ballista'){
    // Draw bow / loose: tilt body slightly + scale arrow back
    bg.rotation.x = -0.08 * t;
  } else if (id === 'mage' || id === 'ice'){
    // Cast: orb pulse + tilt
    bg.rotation.x = -0.10 * t;
    var orb = bg.userData && bg.userData.orb;
    if (orb) orb.scale.setScalar(1 + t * 0.45);
  } else if (id === 'tesla'){
    var orbT = bg.userData && bg.userData.orb;
    if (orbT) orbT.scale.setScalar(1 + t * 0.5);
    var glw = bg.userData && bg.userData.orbGlow;
    if (glw) glw.scale.setScalar(1 + t * 0.6);
  } else if (id === 'fire'){
    var fl = bg.userData && bg.userData.flame;
    if (fl) fl.scale.set(1 + t * 0.25, 1 + t * 0.45, 1 + t * 0.25);
  } else if (id === 'frost'){
    var cr = bg.userData && bg.userData.crystal;
    if (cr) cr.scale.set(1 + t * 0.15, 1 + t * 0.35, 1 + t * 0.15);
  } else if (id === 'knight'){
    // Sword swing: lean forward + slight body tilt
    bg.rotation.x = -0.18 * t;
    bg.rotation.z = -0.12 * t;
  } else if (id === 'bomb'){
    bg.rotation.x = -0.22 * t;
  } else if (id === 'dragon'){
    // Wings flare
    var wings = bg.userData && bg.userData.wings;
    if (wings){
      wings[0].rotation.y = -0.6 - t * 0.4;
      wings[1].rotation.y =  0.6 + t * 0.4;
    }
    bg.rotation.x = -0.12 * t;
  } else {
    bg.position.z = -lean;
  }
};

MF._resetAttackAnim = function(u){
  var bg = u.mesh.userData.bodyGroup;
  if (!bg) return;
  bg.rotation.x = 0;
  bg.rotation.z = 0;
  bg.position.z = 0;
  if (u.id === 'cannon'){
    var bar = bg.userData && bg.userData.barrel;
    if (bar){
      var sc = u.mesh.userData.unitScale || 1;
      bar.position.z = 0.30 * sc;
      bar.position.y = 0.50 * sc;
    }
  } else if ((u.id === 'mage' || u.id === 'ice') && bg.userData && bg.userData.orb){
    bg.userData.orb.scale.setScalar(1);
  } else if (u.id === 'tesla'){
    if (bg.userData.orb)     bg.userData.orb.scale.setScalar(1);
    if (bg.userData.orbGlow) bg.userData.orbGlow.scale.setScalar(1);
  } else if (u.id === 'fire' && bg.userData && bg.userData.flame){
    bg.userData.flame.scale.setScalar(1);
  } else if (u.id === 'frost' && bg.userData && bg.userData.crystal){
    bg.userData.crystal.scale.setScalar(1);
  }
};
