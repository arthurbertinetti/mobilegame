// === Glamour Studio — wardrobe + hair (procedural meshes) ===
// Each item is a builder function that returns a THREE.Object3D.
// Items are attached to the corresponding slot on the player (player.js).
window.MK = window.MK || {};

MK.wardrobe = {
  catalog: null,            // categories → array of items {id,name,icon,style,build}
  current: { top: null, bottom: null, dress: null, shoes: null, under: null, head: null, hair: null },
  itemColors: { top: '#ff6fa8', bottom: '#2c3e50', dress: '#e94560', shoes: '#111111', under: '#ffffff', head: '#ffd93d', hair: '#3a1f10' },
  styleByCat: {}            // current chosen item style tag (used for scoring)
};

// === MATERIAL HELPERS ===
// Cloth — physical material with sheen for fabric softness; sheenColor lighter than base color.
function _lighten(hex, amt) {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r + amt);
  c.g = Math.min(1, c.g + amt);
  c.b = Math.min(1, c.b + amt);
  return c;
}
function clothMat(hex, opts) {
  opts = opts || {};
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: opts.rough != null ? opts.rough : 0.6,
    metalness: opts.metal != null ? opts.metal : 0.0,
    sheen: opts.sheen != null ? opts.sheen : 0.7,
    sheenColor: _lighten(hex, 0.25),
    sheenRoughness: opts.sheenRough != null ? opts.sheenRough : 0.5,
    clearcoat: opts.clearcoat != null ? opts.clearcoat : 0.0,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
    envMapIntensity: 0.65
  });
}
// Satin / shiny gala fabric
function satinMat(hex) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness: 0.18,
    metalness: 0.05,
    sheen: 1.0,
    sheenColor: _lighten(hex, 0.45),
    sheenRoughness: 0.15,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.95,
    side: THREE.DoubleSide
  });
}
// Polished metal (heels, jewelry)
function shinyMat(hex) {
  return new THREE.MeshPhysicalMaterial({
    color: hex, roughness: 0.18, metalness: 0.85,
    clearcoat: 0.4, clearcoatRoughness: 0.18,
    envMapIntensity: 1.1
  });
}
// Hair material — overridden by player.hairMaterial when called via equip
function hairMat() {
  return MK.player && MK.player.hairMaterial
    ? MK.player.hairMaterial.clone()
    : new THREE.MeshPhysicalMaterial({
        color: 0x3a1f10, roughness: 0.35, sheen: 1.0,
        sheenColor: new THREE.Color(0xffeec0), sheenRoughness: 0.25,
        clearcoat: 0.4, envMapIntensity: 0.7
      });
}

// === BUILDERS — TOPS ===
// Tops use a smooth lathe profile so they hug the body's chest curve naturally.
function _topLatheGeom(profile, segments) {
  const pts = profile.map(p => new THREE.Vector2(p[0], p[1]));
  return new THREE.LatheGeometry(pts, segments || 32);
}
function buildTopTshirt(color) {
  const g = new THREE.Group();
  const m = clothMat(color);
  // Profile: tighter at waist, wider at chest+shoulders to clear the bust
  const torso = new THREE.Mesh(_topLatheGeom([
    [0.20, -0.13], [0.22, -0.05], [0.25, 0.05], [0.27, 0.15],
    [0.27, 0.25], [0.22, 0.32], [0.16, 0.34]
  ]), m);
  torso.position.y = 0.05; torso.castShadow = true;
  g.add(torso);
  // Sleeves
  const sleeveG = new THREE.CylinderGeometry(0.075, 0.072, 0.20, 14);
  const sl = new THREE.Mesh(sleeveG, m); sl.position.set(-0.225, 0.16, 0); sl.rotation.z = 0.10;
  const sr = sl.clone(); sr.position.x = 0.225; sr.rotation.z = -0.10;
  sl.castShadow = sr.castShadow = true;
  g.add(sl, sr);
  return g;
}
function buildTopCrop(color) {
  const g = new THREE.Group();
  const m = clothMat(color);
  const torso = new THREE.Mesh(_topLatheGeom([
    [0.215, 0.15], [0.27, 0.22], [0.27, 0.30], [0.20, 0.34]
  ]), m);
  torso.castShadow = true;
  g.add(torso);
  return g;
}
function buildTopBlouse(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.45 });
  const torso = new THREE.Mesh(_topLatheGeom([
    [0.21, -0.13], [0.23, -0.05], [0.27, 0.05], [0.29, 0.15],
    [0.29, 0.25], [0.23, 0.32], [0.16, 0.36]
  ]), m);
  torso.position.y = 0.05; torso.castShadow = true;
  g.add(torso);
  // Puff sleeves
  const puffG = new THREE.SphereGeometry(0.10, 16, 12);
  const pl = new THREE.Mesh(puffG, m); pl.position.set(-0.245, 0.20, 0);
  const pr = pl.clone(); pr.position.x = 0.245;
  pl.castShadow = pr.castShadow = true;
  g.add(pl, pr);
  return g;
}
function buildTopJacket(color) {
  const g = buildTopTshirt(color);
  const m = clothMat(color, { rough: 0.55 });
  const jacket = new THREE.Mesh(_topLatheGeom([
    [0.21, -0.13], [0.24, -0.05], [0.28, 0.05], [0.30, 0.15],
    [0.30, 0.25], [0.24, 0.32], [0.17, 0.34]
  ]), m);
  jacket.position.y = 0.05; jacket.castShadow = true;
  g.add(jacket);
  return g;
}

// === BUILDERS — BOTTOMS ===
function buildJeans(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.8 });
  const left = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.07, 0.85, 14), m);
  left.position.set(-0.10, -0.45, 0);
  const right = left.clone(); right.position.x = 0.10;
  // Belt
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.205, 0.07, 24), m);
  belt.position.y = 0;
  left.castShadow = right.castShadow = belt.castShadow = true;
  g.add(left, right, belt);
  return g;
}
function buildShorts(color) {
  const g = new THREE.Group();
  const m = clothMat(color);
  const left = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.20, 14), m);
  left.position.set(-0.10, -0.13, 0);
  const right = left.clone(); right.position.x = 0.10;
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.205, 0.06, 24), m);
  belt.position.y = 0.02;
  g.add(left, right, belt);
  return g;
}
function buildSkirtMini(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.5, sheen: 0.7 });
  const geom = new THREE.LatheGeometry([
    new THREE.Vector2(0.20, 0.05), new THREE.Vector2(0.24, -0.02),
    new THREE.Vector2(0.30, -0.10), new THREE.Vector2(0.32, -0.18)
  ], 48);
  _addVerticalPleats(geom, 10, 0.02, -0.20, 0.05);
  const skirt = new THREE.Mesh(geom, m);
  skirt.castShadow = true;
  g.add(skirt);
  return g;
}
function buildSkirtLong(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.55, sheen: 0.8 });
  const geom = new THREE.LatheGeometry([
    new THREE.Vector2(0.20, 0.05), new THREE.Vector2(0.24, -0.05),
    new THREE.Vector2(0.30, -0.30), new THREE.Vector2(0.36, -0.60),
    new THREE.Vector2(0.42, -0.85)
  ], 64);
  _addVerticalPleats(geom, 14, 0.03, -0.85, 0);
  const skirt = new THREE.Mesh(geom, m);
  skirt.castShadow = true;
  g.add(skirt);
  return g;
}

// === BUILDERS — DRESSES (full-body) ===
// Pelvis-local Y. Vertical pleats added on dressy meshes for fabric realism.
function _dressLathe(profile, m, segments) {
  const pts = profile.map(p => new THREE.Vector2(p[0], p[1]));
  const geom = new THREE.LatheGeometry(pts, segments || 64);
  return geom;
}
function _addVerticalPleats(geom, freq, amp, fromY, toY) {
  // Adds in-out radial wobble around the Y axis for a fluted skirt look.
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (v.y < fromY || v.y > toY) continue;
    const ang = Math.atan2(v.x, v.z);
    const r = Math.hypot(v.x, v.z);
    if (r < 0.04) continue;
    // Soft falloff at the boundaries
    const t = (v.y - fromY) / (toY - fromY);
    const fall = Math.sin(t * Math.PI);
    const k = 1 + amp * fall * Math.sin(ang * freq);
    pos.setX(i, v.x * k);
    pos.setZ(i, v.z * k);
  }
  geom.computeVertexNormals();
  return geom;
}
function buildDressGala(color) {
  const g = new THREE.Group();
  const m = satinMat(color);
  const geom = _dressLathe([
    [0.55, -0.95], [0.45, -0.78], [0.36, -0.55], [0.30, -0.30], [0.24, -0.10],
    [0.205, 0.00], [0.18, 0.10], [0.21, 0.25], [0.27, 0.42],
    [0.285, 0.52], [0.20, 0.58], [0.13, 0.62]
  ], null, 80);
  _addVerticalPleats(geom, 14, 0.04, -0.95, -0.05);
  const mesh = new THREE.Mesh(geom, m);
  mesh.castShadow = true;
  // Decorative neckline band
  const neckBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.008, 8, 36),
    shinyMat('#c0a060')
  );
  neckBand.position.y = 0.55; neckBand.rotation.x = Math.PI / 2;
  g.add(mesh, neckBand);
  return g;
}
function buildDressWedding(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.4, sheen: 1.0, sheenRough: 0.3 });
  const geom = _dressLathe([
    [0.95, -0.95], [0.78, -0.78], [0.62, -0.60], [0.50, -0.40],
    [0.40, -0.20], [0.30, -0.05], [0.22, 0.05], [0.20, 0.15],
    [0.23, 0.30], [0.28, 0.45], [0.285, 0.55], [0.20, 0.60], [0.13, 0.64]
  ], null, 96);
  _addVerticalPleats(geom, 26, 0.022, -0.95, -0.10);   // tulle gathers
  _addVerticalPleats(geom, 16, 0.012, -0.40, 0.05);    // soft folds at hips
  const mesh = new THREE.Mesh(geom, m);
  mesh.castShadow = true;
  // Gold belt at waist
  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.205, 0.014, 10, 48),
    shinyMat('#d8b86a')
  );
  belt.position.y = 0.10; belt.rotation.x = Math.PI / 2;
  // Lace-style ring trim at the hem
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.014, 10, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.5, sheen: 1.0,
      sheenColor: new THREE.Color(0xffe8e8), sheenRoughness: 0.4,
      transparent: true, opacity: 0.85
    })
  );
  trim.position.y = -0.95; trim.rotation.x = Math.PI / 2;
  g.add(mesh, belt, trim);
  return g;
}
function buildDressBeach(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.6, sheen: 0.6 });
  const geom = _dressLathe([
    [0.42, -0.35], [0.38, -0.22], [0.32, -0.10], [0.27, 0.00],
    [0.24, 0.10], [0.24, 0.18], [0.27, 0.30], [0.27, 0.42], [0.20, 0.48]
  ], null, 48);
  _addVerticalPleats(geom, 12, 0.025, -0.35, 0.10);
  const mesh = new THREE.Mesh(geom, m);
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}
function buildDressCocktail(color) {
  const g = new THREE.Group();
  const m = satinMat(color);
  const geom = _dressLathe([
    [0.38, -0.28], [0.34, -0.18], [0.30, -0.08], [0.25, 0.00],
    [0.20, 0.10], [0.22, 0.22], [0.27, 0.38], [0.285, 0.48], [0.20, 0.54]
  ], null, 64);
  _addVerticalPleats(geom, 10, 0.018, -0.28, 0.08);
  const mesh = new THREE.Mesh(geom, m);
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}

// === BUILDERS — SHOES ===
// Slots shoesL/shoesR sit at the foot world-position (lHip y=-0.81 → world y≈0.04).
// Build with origin at slot, shoe bottom around y=-0.02 to plant on the podium top (y=0).
function _shoeMat(color, opts) { return clothMat(color, opts); }
function buildSneakers(color) {
  const make = () => {
    const m = _shoeMat(color, { rough: 0.55, sheen: 0.3 });
    const g = new THREE.Group();
    // Sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.20), clothMat('#ffffff'));
    sole.position.set(0, -0.018, 0.04); sole.castShadow = true;
    // Upper
    const upper = new THREE.Mesh(_lathe([
      [0, 0.02], [0.045, 0.025], [0.055, 0.0], [0.05, -0.012], [0, -0.012]
    ], 16), m);
    upper.scale.set(1.0, 1.4, 2.6);
    upper.position.set(0, 0, 0.04);
    upper.castShadow = true;
    g.add(sole, upper);
    return g;
  };
  return { perFoot: make };
}
function buildHeels(color) {
  const make = () => {
    const m = satinMat(color);
    const g = new THREE.Group();
    // Stiletto sole — pointed toe paddle
    const sole = new THREE.Mesh(_lathe([
      [0, 0.012], [0.03, 0.010], [0.038, 0.0], [0.025, -0.005], [0, -0.005]
    ], 16), m);
    sole.scale.set(1.0, 1.0, 3.0);
    sole.position.set(0, -0.008, 0.04);
    sole.castShadow = true;
    // Heel post
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.075, 10), m);
    heel.position.set(0, -0.04, -0.06);
    heel.castShadow = true;
    // Strap
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.005, 6, 18), m);
    strap.rotation.x = Math.PI / 2; strap.scale.x = 1.2;
    strap.position.set(0, 0.012, 0.04);
    g.add(sole, heel, strap);
    return g;
  };
  return { perFoot: make };
}
function buildBoots(color) {
  const make = () => {
    const m = clothMat(color, { rough: 0.4, sheen: 0.5, clearcoat: 0.3 });
    const g = new THREE.Group();
    // Foot
    const foot = new THREE.Mesh(_lathe([
      [0, 0.025], [0.05, 0.022], [0.058, 0.0], [0.05, -0.012], [0, -0.012]
    ], 16), m);
    foot.scale.set(1.0, 1.4, 2.6);
    foot.position.set(0, 0, 0.04);
    foot.castShadow = true;
    // Shaft (above ankle)
    const shaft = new THREE.Mesh(_lathe([
      [0.058, 0.0], [0.060, 0.06], [0.058, 0.16], [0.054, 0.22], [0.05, 0.24]
    ], 18), m);
    shaft.castShadow = true;
    g.add(foot, shaft);
    return g;
  };
  return { perFoot: make };
}
function buildSandals(color) {
  const make = () => {
    const m = clothMat(color, { rough: 0.5 });
    const g = new THREE.Group();
    // Flat sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.18), m);
    sole.position.set(0, -0.005, 0.04);
    // Two tiny straps
    const strapG = new THREE.TorusGeometry(0.040, 0.005, 6, 18);
    const s1 = new THREE.Mesh(strapG, m); s1.rotation.x = Math.PI / 2; s1.scale.x = 1.2;
    s1.position.set(0, 0.012, 0.02);
    const s2 = new THREE.Mesh(strapG, m); s2.rotation.x = Math.PI / 2; s2.scale.x = 1.2;
    s2.position.set(0, 0.012, 0.07);
    g.add(sole, s1, s2);
    return g;
  };
  return { perFoot: make };
}

// === BUILDERS — UNDERWEAR ===
function buildUnderwear(color) {
  return {
    top: () => {
      const g = new THREE.Group();
      const m = clothMat(color, { rough: 0.5 });
      // Cups sit on the bust which protrudes ~z=0.27 at chest level (slot is at chest local y=-0.10)
      const cup = new THREE.SphereGeometry(0.095, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const cL = new THREE.Mesh(cup, m); cL.position.set(-0.085, 0.05, 0.21); cL.rotation.x = -Math.PI * 0.18;
      cL.castShadow = true;
      const cR = cL.clone(); cR.position.x = 0.085; cR.castShadow = true;
      // Under-bust band
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.014, 8, 36), m);
      band.position.y = -0.03; band.rotation.x = Math.PI / 2; band.scale.z = 0.85;
      g.add(cL, cR, band);
      return g;
    },
    bottom: () => {
      const g = new THREE.Group();
      const m = clothMat(color, { rough: 0.5 });
      const panty = new THREE.Mesh(
        new THREE.SphereGeometry(0.225, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), m
      );
      panty.scale.set(1.20, 0.55, 1.08);
      panty.position.y = -0.10;
      panty.castShadow = true;
      g.add(panty);
      return g;
    }
  };
}

// === BUILDERS — HEAD ACCESSORIES ===
function buildHat(color) {
  const g = new THREE.Group();
  const m = clothMat(color, { rough: 0.7 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.015, 32), m);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), m);
  brim.position.y = 0.21; crown.position.y = 0.28;
  g.add(brim, crown);
  return g;
}
function buildTiara(color) {
  const g = new THREE.Group();
  const m = shinyMat(color);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 8, 32, Math.PI), m);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.21;
  for (let i = 0; i < 5; i++) {
    const t = (i / 4) * Math.PI - Math.PI / 2;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.018), m);
    gem.position.set(Math.sin(t) * 0.16, 0.23 + Math.abs(Math.cos(t)) * 0.02, Math.cos(t) * 0.16);
    g.add(gem);
  }
  g.add(band);
  return g;
}
function buildSunglasses(color) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.7 });
  const lensG = new THREE.BoxGeometry(0.06, 0.04, 0.005);
  const l = new THREE.Mesh(lensG, m); l.position.set(-0.045, 0.115, 0.142);
  const r = l.clone(); r.position.x = 0.045;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.005, 0.005), m);
  bridge.position.set(0, 0.115, 0.142);
  g.add(l, r, bridge);
  return g;
}

// === BUILDERS — HAIR (real 3D strands via TubeGeometry) ===
function _hairMatForColor(color) {
  const m = hairMat();
  m.color = new THREE.Color(color);
  return m;
}
function buildHairLong(color) {
  return MK.player._buildHairBase(_hairMatForColor(color), {
    length: 0.65, bounce: 0.20, count: 32, parted: true, curls: false
  });
}
function buildHairShort(color) {
  return MK.player._buildHairBase(_hairMatForColor(color), {
    length: 0.20, bounce: 0.10, count: 24, parted: true, curls: false
  });
}
function buildHairBun(color) {
  const g = MK.player._buildHairBase(_hairMatForColor(color), {
    length: 0.10, bounce: 0.05, count: 16, parted: true, curls: false
  });
  // Add a bun on top
  const m = _hairMatForColor(color);
  const bunBase = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.022, 12, 24), m);
  bunBase.position.set(0, 0.16, -0.03); bunBase.rotation.x = -Math.PI * 0.45;
  bunBase.castShadow = true;
  // Add a few wrap strands
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tube = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI * 1.2),
      m
    );
    tube.position.set(0, 0.16, -0.03);
    tube.rotation.set(-Math.PI * 0.45, a, 0);
    g.add(tube);
  }
  g.add(bunBase);
  return g;
}
function buildHairCurls(color) {
  return MK.player._buildHairBase(_hairMatForColor(color), {
    length: 0.45, bounce: 0.35, count: 36, parted: true, curls: true
  });
}
function buildHairPigtails(color) {
  const g = MK.player._buildHairBase(_hairMatForColor(color), {
    length: 0.14, bounce: 0.05, count: 18, parted: true, curls: false
  });
  // Two pigtails — bunch of strands hanging from each side
  const m = _hairMatForColor(color);
  for (const sideX of [-0.16, 0.16]) {
    for (let i = 0; i < 10; i++) {
      const sx = sideX + (Math.random() - 0.5) * 0.025;
      const sy = -0.02 + (Math.random() - 0.5) * 0.02;
      const sz = -0.015 + (Math.random() - 0.5) * 0.02;
      const tipX = sideX * 1.4 + (Math.random() - 0.5) * 0.05;
      const pts = [
        new THREE.Vector3(sx, sy, sz),
        new THREE.Vector3(sx * 1.1, sy - 0.08, sz - 0.005),
        new THREE.Vector3(tipX, sy - 0.20, sz - 0.02),
        new THREE.Vector3(tipX, sy - 0.32, sz - 0.04)
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 14, 0.012, 6, false), m
      );
      tube.castShadow = true;
      g.add(tube);
    }
  }
  return g;
}

// === CATALOG ===
MK.initWardrobe = function () {
  MK.wardrobe.catalog = {
    top: [
      { id: 'tshirt', name: 'T-Shirt', icon: '👕', style: 'casual', build: buildTopTshirt },
      { id: 'crop', name: 'Crop top', icon: '🎽', style: 'beach', build: buildTopCrop },
      { id: 'blouse', name: 'Blouse', icon: '👚', style: 'chic', build: buildTopBlouse },
      { id: 'jacket', name: 'Veste', icon: '🧥', style: 'chic', build: buildTopJacket }
    ],
    bottom: [
      { id: 'jeans', name: 'Jean', icon: '👖', style: 'casual', build: buildJeans },
      { id: 'shorts', name: 'Short', icon: '🩳', style: 'beach', build: buildShorts },
      { id: 'skirtmini', name: 'Mini-jupe', icon: '👗', style: 'chic', build: buildSkirtMini },
      { id: 'skirtlong', name: 'Jupe longue', icon: '👘', style: 'redcarpet', build: buildSkirtLong }
    ],
    dress: [
      { id: 'gala', name: 'Gala', icon: '👑', style: 'redcarpet', build: buildDressGala },
      { id: 'wedding', name: 'Mariée', icon: '👰', style: 'wedding', build: buildDressWedding },
      { id: 'beach', name: 'Plage', icon: '🌺', style: 'beach', build: buildDressBeach },
      { id: 'cocktail', name: 'Cocktail', icon: '🍸', style: 'chic', build: buildDressCocktail }
    ],
    shoes: [
      { id: 'sneakers', name: 'Baskets', icon: '👟', style: 'casual', build: buildSneakers },
      { id: 'heels', name: 'Talons', icon: '👠', style: 'chic', build: buildHeels },
      { id: 'boots', name: 'Bottes', icon: '🥾', style: 'casual', build: buildBoots },
      { id: 'sandals', name: 'Sandales', icon: '🩴', style: 'beach', build: buildSandals }
    ],
    under: [
      { id: 'set1', name: 'Set blanc', icon: '🤍', style: 'any', build: buildUnderwear },
      { id: 'set2', name: 'Set noir', icon: '🖤', style: 'any', build: buildUnderwear }
    ],
    head: [
      { id: 'hat', name: 'Chapeau', icon: '👒', style: 'beach', build: buildHat },
      { id: 'tiara', name: 'Diadème', icon: '👑', style: 'wedding', build: buildTiara },
      { id: 'shades', name: 'Lunettes', icon: '🕶️', style: 'beach', build: buildSunglasses }
    ],
    hair: [
      { id: 'long', name: 'Longue', icon: '💁‍♀️', style: 'any', build: buildHairLong },
      { id: 'short', name: 'Carré', icon: '💇‍♀️', style: 'chic', build: buildHairShort },
      { id: 'bun', name: 'Chignon', icon: '👸', style: 'redcarpet', build: buildHairBun },
      { id: 'curls', name: 'Boucles', icon: '👩‍🦱', style: 'wedding', build: buildHairCurls },
      { id: 'pigtails', name: 'Couettes', icon: '👧', style: 'casual', build: buildHairPigtails }
    ]
  };
};

// === RPM MESH MASKING ===
// When user picks a wardrobe item, the matching default RPM mesh must be hidden.
const _rpmHideOnEquip = {
  top: ['top'],
  bottom: ['bottom'],
  dress: ['top', 'bottom'],
  shoes: ['footwear'],
  hair: ['hair'],
  head: ['headwear'],
  under: []   // RPM doesn't ship underwear by default
};
function _applyRpmMaskForCategory(cat) {
  if (!MK.player || !MK.player.glbActive || !MK.setRpmCategoryVisible) return;
  const targets = _rpmHideOnEquip[cat] || [];
  targets.forEach(t => MK.setRpmCategoryVisible(t, false));
}

// === EQUIP / UNEQUIP ===
MK.equip = function (cat, itemId) {
  const W = MK.wardrobe;
  const list = W.catalog[cat];
  if (!list) return;
  const item = list.find(i => i.id === itemId);
  if (!item) return;
  // Hide the matching RPM default outfit mesh (if any)
  _applyRpmMaskForCategory(cat);

  // Special category logic
  if (cat === 'shoes') {
    // Shoes attach to both feet
    MK._unequipShoes();
    const builder = item.build(W.itemColors.shoes);
    const left = builder.perFoot();
    const right = builder.perFoot();
    MK.player.slots.shoesL.add(left);
    MK.player.slots.shoesR.add(right);
    W.current.shoes = { item, left, right };
    W.styleByCat.shoes = item.style;
    return;
  }

  if (cat === 'under') {
    // Underwear has a top + bottom
    MK._unequipCat('under');
    const set = item.build(W.itemColors.under);
    const top = set.top(); const bot = set.bottom();
    MK.player.slots.underTop.add(top);
    MK.player.slots.under.add(bot);
    W.current.under = { item, top, bottom: bot };
    W.styleByCat.under = item.style;
    return;
  }

  if (cat === 'dress') {
    // Dress excludes top + bottom
    MK._unequipCat('top');
    MK._unequipCat('bottom');
  }
  if (cat === 'top' || cat === 'bottom') {
    MK._unequipCat('dress');
  }

  MK._unequipCat(cat);
  const obj = item.build(W.itemColors[cat]);
  const slotName = cat === 'head' ? 'head' : cat === 'hair' ? 'hair' : cat;
  MK.player.slots[slotName].add(obj);
  W.current[cat] = { item, obj };
  W.styleByCat[cat] = item.style;
};

MK._unequipCat = function (cat) {
  const W = MK.wardrobe;
  const cur = W.current[cat];
  if (cur) {
    if (cur.obj && cur.obj.parent) cur.obj.parent.remove(cur.obj);
    if (cat === 'under') {
      if (cur.top && cur.top.parent) cur.top.parent.remove(cur.top);
      if (cur.bottom && cur.bottom.parent) cur.bottom.parent.remove(cur.bottom);
    }
    W.current[cat] = null;
    W.styleByCat[cat] = null;
  }
  // Also hide RPM default mesh of this category — "Aucun" means truly nothing
  _applyRpmMaskForCategory(cat);
};

MK._unequipShoes = function () {
  const W = MK.wardrobe;
  const cur = W.current.shoes;
  if (cur) {
    if (cur.left && cur.left.parent) cur.left.parent.remove(cur.left);
    if (cur.right && cur.right.parent) cur.right.parent.remove(cur.right);
    W.current.shoes = null;
  }
  _applyRpmMaskForCategory('shoes');
};

// Bring back the original RPM outfit (everything visible, all procedural items removed)
MK.resetToRpmDefaults = function () {
  const W = MK.wardrobe;
  ['top', 'bottom', 'dress', 'under', 'head', 'hair'].forEach(cat => {
    const cur = W.current[cat];
    if (cur && cur.obj && cur.obj.parent) cur.obj.parent.remove(cur.obj);
    if (cat === 'under' && cur) {
      if (cur.top && cur.top.parent) cur.top.parent.remove(cur.top);
      if (cur.bottom && cur.bottom.parent) cur.bottom.parent.remove(cur.bottom);
    }
    W.current[cat] = null;
    W.styleByCat[cat] = null;
  });
  if (W.current.shoes) MK._unequipShoes();
  // Show all RPM categories
  if (MK.setRpmCategoryVisible) {
    ['top', 'bottom', 'footwear', 'hair', 'headwear'].forEach(t => MK.setRpmCategoryVisible(t, true));
  }
};

// === COLOR ===
MK.setItemColor = function (cat, hex) {
  const W = MK.wardrobe;
  W.itemColors[cat] = hex;
  // Rebuild current item with new color
  if (cat === 'hair') {
    if (W.current.hair) MK.equip('hair', W.current.hair.item.id);
    return;
  }
  const cur = W.current[cat];
  if (cur && cur.item) MK.equip(cat, cur.item.id);
};
