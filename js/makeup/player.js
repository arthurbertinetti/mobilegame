// === Glamour Studio — premium stylized female avatar ===
// One single seamless mesh for the torso (chest/waist/hips/upper-thigh).
// Bust, butt, belly, hip-width morphs are realized as VERTEX DISPLACEMENT on
// that single mesh (no separate spheres → no visible joints).
// Limbs each in one smooth lathe. Hair: scalp cap + back-only strands.
window.MK = window.MK || {};

MK.player = {
  root: null,
  bones: {},
  parts: {},
  slots: {},
  skinMaterial: null,
  hairMaterial: null,
  morphs: { bust: 0, belly: 0, hips: 0, arms: 0, face: 0, height: 0 },
  idleT: 0
};

// ===== HELPERS =====
function _lathe(profile, segments) {
  const pts = profile.map(p => new THREE.Vector2(p[0], p[1]));
  const g = new THREE.LatheGeometry(pts, segments || 48);
  g.computeVertexNormals();
  return g;
}

// Sculpt a sphere into a face-friendly head: narrower forehead, fuller cheeks, defined chin.
function _sculptedHead() {
  const g = new THREE.SphereGeometry(0.165, 56, 40);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const y = v.y / 0.165;
    const front = (v.z + 0.165) / 0.33;
    if (y < -0.4) {
      const t = (-y - 0.4) / 0.6;
      v.x *= 1.0 - 0.18 * t;
      v.z *= 1.0 - 0.10 * t;
    }
    if (y > 0.55) {
      const t = (y - 0.55) / 0.45;
      v.x *= 1.0 - 0.06 * t;
      v.z *= 1.0 - 0.04 * t;
    }
    if (y < 0.05 && y > -0.4 && front > 0.55) {
      v.z += 0.012 * (1.0 - Math.abs(y * 2));
      v.x *= 1.04;
    }
    if (y > 0.10 && y < 0.30 && front > 0.6) {
      v.z += 0.008;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.scale(1.0, 1.10, 1.02);
  g.computeVertexNormals();
  return g;
}

// === SINGLE BODY MESH ===
// Profile from upper-thigh closure to base of neck (lathe in spine local coords).
function _baseTorsoProfile() {
  return [
    [0.0, -0.42],     // bottom closure
    [0.10, -0.42],    // upper thigh
    [0.18, -0.36],    // hip top
    [0.215, -0.28],   // hips widest
    [0.22, -0.18],
    [0.20, -0.10],
    [0.16, -0.02],
    [0.135, 0.06],    // narrow waist
    [0.155, 0.14],
    [0.18, 0.22],     // ribcage
    [0.205, 0.30],    // chest base
    [0.215, 0.36],    // chest widest
    [0.19, 0.42],
    [0.155, 0.46],
    [0.115, 0.50],    // collarbone
    [0.08, 0.52],
    [0.07, 0.56]      // base of neck
  ];
}
function _torsoGeom() {
  const g = _lathe(_baseTorsoProfile(), 80);
  // Save base positions so morph displacement is reproducible
  g.userData.basePos = new Float32Array(g.attributes.position.array);
  return g;
}
// Morph displacement: applied directly to vertex positions of the single torso mesh.
// Default morph values (m=0) keep a baseline feminine shape — sliders modulate amplitude.
function _applyTorsoMorphs(geom, m) {
  const pos = geom.attributes.position;
  const base = geom.userData.basePos;
  for (let i = 0; i < pos.array.length; i++) pos.array[i] = base[i];

  // Default amplitudes (always applied) + morph delta on top
  const bustAmp = 0.055 + m.bust * 0.045;       // 0.010 .. 0.100  (peak protrusion)
  const bellyAmp = Math.max(0, m.belly) * 0.05  // only positive belly bumps out
                 + Math.min(0, m.belly) * 0.020; // negative tucks slightly
  const buttAmp = 0.045 + m.hips * 0.035;        // 0.010 .. 0.080
  const hipWidthAmp = 0.020 + m.hips * 0.025;    // -0.005 .. 0.045

  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i), y0 = pos.getY(i), z0 = pos.getZ(i);
    const angle = Math.atan2(x0, z0);   // 0 = front (+z), ±π = back (-z)
    let dx = 0, dz = 0;

    // BUST — two front bumps centered at angle ±0.45 rad
    if (y0 > 0.16 && y0 < 0.45 && Math.abs(angle) < Math.PI * 0.6) {
      const yt = (y0 - 0.16) / 0.29;
      const yfade = Math.sin(yt * Math.PI);
      const dL = angle - 0.45, dR = angle + 0.45;
      const bumpAmt = bustAmp * yfade * (Math.exp(-dL * dL * 11) + Math.exp(-dR * dR * 11));
      dx += Math.sin(angle) * bumpAmt;
      dz += Math.cos(angle) * bumpAmt;
    }

    // BELLY — front bulge in the lower torso (only when slider > 0)
    if (y0 > -0.14 && y0 < 0.06 && Math.abs(angle) < Math.PI * 0.55) {
      const yt = (y0 + 0.14) / 0.20;
      const yfade = Math.sin(yt * Math.PI);
      const af = Math.exp(-angle * angle * 3.2);
      dz += bellyAmp * yfade * af;
    }

    // BUTT — back bulge, always present at baseline
    if (y0 > -0.32 && y0 < -0.05) {
      const distFromBack = Math.PI - Math.abs(angle);
      if (distFromBack < Math.PI * 0.55) {
        const yt = (y0 + 0.32) / 0.27;
        const yfade = Math.sin(yt * Math.PI);
        const af = Math.exp(-distFromBack * distFromBack * 5);
        const bump = buttAmp * yfade * af;
        dx += Math.sin(angle) * bump * 0.4;
        dz += Math.cos(angle) * bump;
      }
    }

    // HIP WIDTH — sides bulge, always slightly wider at baseline
    if (y0 > -0.30 && y0 < -0.10) {
      const yt = (y0 + 0.30) / 0.20;
      const yfade = Math.sin(yt * Math.PI);
      const sideAmt = Math.pow(Math.abs(Math.sin(angle)), 1.5);
      const widen = hipWidthAmp * yfade * sideAmt;
      dx += Math.sin(angle) * widen;
    }

    pos.setX(i, x0 + dx);
    pos.setZ(i, z0 + dz);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
}

// Smooth tapered arm (lathe along Y, top = shoulder, bottom = wrist).
function _armLathe(thick) {
  const t = thick || 1.0;
  const pts = [
    [0.075 * t, 0.00],
    [0.072 * t, -0.02],
    [0.058 * t, -0.10],
    [0.053 * t, -0.20],
    [0.048 * t, -0.28],
    [0.044 * t, -0.34],
    [0.040 * t, -0.46],
    [0.036 * t, -0.55],
    [0.0, -0.56]
  ];
  return _lathe(pts, 32);
}
function _handGeom() {
  const pts = [
    [0.018, 0],
    [0.040, -0.02],
    [0.045, -0.05],
    [0.040, -0.09],
    [0.024, -0.12],
    [0.0, -0.125]
  ];
  const g = _lathe(pts, 18);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) * 0.6);
    pos.setX(i, pos.getX(i) * 1.15);
  }
  g.computeVertexNormals();
  return g;
}
function _legLathe() {
  const pts = [
    [0.0, 0.02],
    [0.090, 0.0],
    [0.094, -0.05],
    [0.085, -0.20],
    [0.075, -0.32],
    [0.068, -0.42],
    [0.060, -0.52],
    [0.055, -0.60],
    [0.050, -0.72],
    [0.046, -0.80],
    [0.0, -0.81]
  ];
  return _lathe(pts, 32);
}
function _footGeom() {
  const pts = [
    [0.0, 0.04],
    [0.045, 0.03],
    [0.055, 0.0],
    [0.058, -0.02],
    [0.050, -0.04],
    [0.0, -0.04]
  ];
  const g = _lathe(pts, 20);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) * 2.6);
    pos.setX(i, pos.getX(i) * 0.85);
    pos.setY(i, pos.getY(i) * 0.7);
  }
  g.computeVertexNormals();
  return g;
}

// ===== HAIR builders (back-only strands + soft fringe) =====
function _buildHairBase(material, opts) {
  const group = new THREE.Group();

  // Scalp cap — covers top of head + forehead area down to brow level (no skin shows on top)
  // Hemisphere from north pole down to phi ≈ 0.62π → ear/brow region
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.176, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.62),
    material
  );
  cap.scale.set(1.05, 1.0, 1.05);
  cap.position.y = 0.005;
  cap.castShadow = true;
  group.add(cap);

  // Strands — strictly on back semicircle (angles π/2..3π/2 → +x side, back, -x side).
  // Range [π/2, 3π/2] sweeps the BACK half: never crosses the face.
  const count = opts.count || 26;
  const length = opts.length != null ? opts.length : 0.55;
  const bounce = opts.bounce != null ? opts.bounce : 0.20;

  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const ang = Math.PI / 2 + u * Math.PI; // π/2 → 3π/2 (back hemisphere only)
    const r = 0.165;
    const sx = Math.sin(ang) * r;
    const sz = Math.cos(ang) * r - 0.01;
    const sy = -0.03 + (Math.random() - 0.5) * 0.03;

    const pts = [new THREE.Vector3(sx, sy, sz)];
    const steps = opts.curls ? 9 : 6;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const fall = -length * t;
      const drift = bounce * Math.sin(t * Math.PI);
      let dx = sx * (1 + drift * 0.3);
      let dz = sz * (1 + drift * 0.4) - 0.01;
      if (opts.curls) {
        const curl = 0.026 * Math.sin(t * Math.PI * 4 + i * 0.6);
        dx += curl;
        dz += curl * 0.7;
      }
      pts.push(new THREE.Vector3(dx, sy + fall, dz));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const tubeR = 0.011 + Math.random() * 0.003;
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 14, tubeR, 6, false), material
    );
    tube.castShadow = true;
    group.add(tube);
  }

  // Soft side-swept fringe — short, FORWARD of forehead, doesn't reach the eyes.
  // Eyes sit around head local y ≈ +0.04. Fringe stays above y = +0.07.
  if (opts.fringe !== false) {
    const swept = opts.fringeSwept !== false;  // sweep to one side
    for (let i = 0; i < 8; i++) {
      const u = (i + 0.5) / 8;
      const sx = (u - 0.5) * 0.18;
      const sy = 0.13;
      const sz = 0.16;     // in front of forehead
      const tipX = swept ? sx + 0.09 : sx * 1.2;
      const tipY = 0.075;  // above the eye line
      const tipZ = 0.155;
      const pts = [
        new THREE.Vector3(sx, sy, sz),
        new THREE.Vector3((sx + tipX) / 2, (sy + tipY) / 2 + 0.005, (sz + tipZ) / 2),
        new THREE.Vector3(tipX, tipY, tipZ)
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 10, 0.010, 6, false), material
      );
      tube.castShadow = true;
      group.add(tube);
    }
  }
  return group;
}

// ===== GLB CHARACTER LOADING =====
// Tries to load assets/models/character.glb; on success replaces the procedural avatar.
MK.loadGlbCharacter = function (url) {
  return new Promise((resolve, reject) => {
    if (!THREE.GLTFLoader) return reject(new Error('GLTFLoader not loaded'));
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf), undefined, (err) => reject(err));
  });
};

// Place the loaded GLB into the scene, scale/center, find bones for slots, hide procedural body.
MK.applyGlbCharacter = function (gltf) {
  const P = MK.player;
  const model = gltf.scene || gltf.scenes && gltf.scenes[0];
  if (!model) return false;

  // Hide procedural body parts
  ['torso', 'neck', 'head', 'lArm', 'rArm', 'lHand', 'rHand', 'lLeg', 'rLeg', 'lFoot', 'rFoot', 'earL', 'earR', 'nose']
    .forEach(k => { if (P.parts[k]) P.parts[k].visible = false; });

  // Auto-fit: scale & plant feet at y=0
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3(); box.getSize(size);
  const targetHeight = 1.7;
  const s = (size.y > 0.01) ? targetHeight / size.y : 1.0;
  model.scale.setScalar(s);
  model.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(model);
  model.position.x -= (box2.min.x + box2.max.x) * 0.5;
  model.position.z -= (box2.min.z + box2.max.z) * 0.5;
  model.position.y -= box2.min.y;

  // Catalog meshes by RPM naming convention (Wolf3D_*) + collect skinned material refs
  const rpm = {
    hair: [], top: [], bottom: [], footwear: [], glasses: [], headwear: [],
    body: [], head: [], teeth: [], eyes: [], all: []
  };
  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      if (obj.material) obj.material.envMapIntensity = obj.material.envMapIntensity || 0.7;
      rpm.all.push(obj);

      const n = (obj.name || '').toLowerCase();
      if (n.includes('hair')) rpm.hair.push(obj);
      else if (n.includes('outfit_top') || n.includes('outfittop')) rpm.top.push(obj);
      else if (n.includes('outfit_bottom') || n.includes('outfitbottom')) rpm.bottom.push(obj);
      else if (n.includes('outfit_footwear') || n.includes('footwear')) rpm.footwear.push(obj);
      else if (n.includes('glasses')) rpm.glasses.push(obj);
      else if (n.includes('headwear')) rpm.headwear.push(obj);
      else if (n.includes('teeth')) rpm.teeth.push(obj);
      else if (n.includes('eye') && (n.includes('left') || n.includes('right'))) rpm.eyes.push(obj);
      else if (n.includes('head')) rpm.head.push(obj);
      else if (n.includes('body')) rpm.body.push(obj);
    }
  });
  P.rpmMeshes = rpm;

  // Find bones (Mixamo-style names) for slots + morph hooks
  const boneByName = {};
  model.traverse((obj) => {
    if (!obj.isBone && obj.type !== 'Bone') return;
    const n = (obj.name || '').toLowerCase();
    if (n.includes('hips') && !boneByName.hips) boneByName.hips = obj;
    if ((n.endsWith('spine2') || n.includes(':spine2')) && !boneByName.chest) boneByName.chest = obj;
    else if ((n.endsWith('spine1') || n.includes(':spine1')) && !boneByName.spine1) boneByName.spine1 = obj;
    else if ((n.endsWith('spine') || n === 'mixamorig:spine' || n.endsWith(':spine')) && !boneByName.spine) boneByName.spine = obj;
    if ((n.endsWith('head') || n.includes(':head')) && !boneByName.head) boneByName.head = obj;
    if ((n.endsWith('neck') || n.includes(':neck')) && !boneByName.neck) boneByName.neck = obj;
    if (n.includes('leftarm') && !boneByName.lArm) boneByName.lArm = obj;
    if (n.includes('rightarm') && !boneByName.rArm) boneByName.rArm = obj;
    if (n.includes('leftupleg') && !boneByName.lHip) boneByName.lHip = obj;
    if (n.includes('rightupleg') && !boneByName.rHip) boneByName.rHip = obj;
    if (n.includes('leftfoot') && !boneByName.lFoot) boneByName.lFoot = obj;
    if (n.includes('rightfoot') && !boneByName.rFoot) boneByName.rFoot = obj;
  });
  P.glbBones = boneByName;
  P.glbModel = model;

  // Reparent wardrobe slot anchors to actual bones so equipped items follow the rig
  function attachToBone(slot, bone, localOffsetY) {
    if (!slot || !bone) return;
    if (slot.parent) slot.parent.remove(slot);
    bone.add(slot);
    slot.position.set(0, localOffsetY || 0, 0);
    slot.rotation.set(0, 0, 0);
    slot.scale.set(1, 1, 1);
  }
  attachToBone(P.slots.top, boneByName.chest || boneByName.spine, 0);
  attachToBone(P.slots.underTop, boneByName.chest || boneByName.spine, 0);
  attachToBone(P.slots.bottom, boneByName.hips, 0);
  attachToBone(P.slots.dress, boneByName.hips, 0);
  attachToBone(P.slots.under, boneByName.hips, 0);
  attachToBone(P.slots.head, boneByName.head, 0);
  attachToBone(P.slots.hair, boneByName.head, 0);
  attachToBone(P.slots.shoesL, boneByName.lFoot || boneByName.lHip, 0);
  attachToBone(P.slots.shoesR, boneByName.rFoot || boneByName.rHip, 0);

  // Cache original skin colors so the skin-tone slider can re-tint without losing texture
  P.rpmSkinOriginalColor = new Map();
  rpm.body.concat(rpm.head).forEach(m => {
    if (m.material && m.material.color) P.rpmSkinOriginalColor.set(m.uuid, m.material.color.clone());
  });

  P.root.add(model);
  P.glbActive = true;

  return true;
};

// Hide / show RPM mesh categories — used by wardrobe equip/unequip.
MK.setRpmCategoryVisible = function (cat, visible) {
  const P = MK.player;
  if (!P.rpmMeshes) return;
  const list = P.rpmMeshes[cat] || [];
  for (const m of list) m.visible = visible;
};

// ===== MAIN INIT =====
MK.initPlayer = function () {
  const P = MK.player;
  const root = new THREE.Group();
  root.position.y = 0;
  P.root = root;

  // ===== MATERIALS =====
  P.skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf6d6c1, roughness: 0.45, metalness: 0.0,
    sheen: 0.6, sheenColor: new THREE.Color(0xffd6c2), sheenRoughness: 0.55,
    envMapIntensity: 0.55
  });
  const bodyMat = P.skinMaterial;

  const headMat = new THREE.MeshPhysicalMaterial({
    map: MK.face.texture,
    color: 0xffffff, roughness: 0.42, metalness: 0.0,
    sheen: 0.5, sheenColor: new THREE.Color(0xffe0d0), sheenRoughness: 0.5,
    envMapIntensity: 0.55
  });
  P._headMat = headMat;

  P.hairMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3a1f10, roughness: 0.35, metalness: 0.0,
    sheen: 1.0, sheenColor: new THREE.Color(0xffeec0), sheenRoughness: 0.25,
    clearcoat: 0.4, clearcoatRoughness: 0.35,
    envMapIntensity: 0.7
  });

  // ===== SKELETON =====
  const pelvis = new THREE.Group(); pelvis.position.y = 0.95;
  root.add(pelvis); P.bones.pelvis = pelvis;

  const spine = new THREE.Group(); spine.position.y = 0.20;
  pelvis.add(spine); P.bones.spine = spine;

  const chest = new THREE.Group(); chest.position.y = 0.40;
  spine.add(chest); P.bones.chest = chest;

  const neck = new THREE.Group(); neck.position.y = 0.12;
  chest.add(neck); P.bones.neck = neck;

  const head = new THREE.Group(); head.position.y = 0.18;
  neck.add(head); P.bones.head = head;

  // ===== TORSO (single seamless mesh) =====
  const torsoGeom = _torsoGeom();
  const torso = new THREE.Mesh(torsoGeom, bodyMat);
  torso.castShadow = true; torso.receiveShadow = true;
  spine.add(torso);
  P.parts.torso = torso;

  // ===== NECK =====
  const neckMesh = new THREE.Mesh(_lathe([
    [0.04, 0.0],
    [0.052, 0.02],
    [0.054, 0.05],
    [0.058, 0.08],
    [0.062, 0.10],
    [0.0, 0.10]
  ], 24), bodyMat);
  neckMesh.castShadow = true;
  neck.add(neckMesh);
  P.parts.neck = neckMesh;

  // ===== HEAD =====
  const headMesh = new THREE.Mesh(_sculptedHead(), headMat);
  headMesh.castShadow = true; headMesh.receiveShadow = true;
  head.add(headMesh);
  P.parts.head = headMesh;

  // Ears
  const earGeom = _lathe([
    [0.0, 0.025], [0.012, 0.020], [0.018, 0.005],
    [0.014, -0.015], [0.005, -0.025], [0.0, -0.026]
  ], 14);
  const earL = new THREE.Mesh(earGeom, bodyMat);
  const earR = new THREE.Mesh(earGeom, bodyMat);
  earL.rotation.z = Math.PI / 2; earL.rotation.y = -0.3;
  earR.rotation.z = -Math.PI / 2; earR.rotation.y = 0.3;
  earL.scale.set(1.1, 0.8, 1.4);
  earR.scale.copy(earL.scale);
  earL.position.set(-0.158, 0.005, 0.005);
  earR.position.set(0.158, 0.005, 0.005);
  head.add(earL, earR);
  P.parts.earL = earL; P.parts.earR = earR;

  // Subtle 3D nose (catches light, gives the face dimension)
  const nose = new THREE.Mesh(_lathe([
    [0.0, 0.025], [0.013, 0.012], [0.018, -0.005],
    [0.013, -0.018], [0.0, -0.020]
  ], 14), bodyMat);
  nose.scale.set(1.0, 1.0, 1.4);
  nose.position.set(0, -0.005, 0.158);
  head.add(nose);
  P.parts.nose = nose;

  // ===== ARMS =====
  const lShoulder = new THREE.Group();
  lShoulder.position.set(-0.21, 0.06, 0);
  lShoulder.rotation.z = 0.08;
  chest.add(lShoulder);
  P.bones.lShoulder = lShoulder;

  const lArm = new THREE.Mesh(_armLathe(1.0), bodyMat);
  lArm.castShadow = true;
  lShoulder.add(lArm);
  P.parts.lArm = lArm;

  const lHand = new THREE.Mesh(_handGeom(), bodyMat);
  lHand.position.y = -0.55;
  lHand.castShadow = true;
  lShoulder.add(lHand);
  P.parts.lHand = lHand;

  const rShoulder = new THREE.Group();
  rShoulder.position.set(0.21, 0.06, 0);
  rShoulder.rotation.z = -0.08;
  chest.add(rShoulder);
  P.bones.rShoulder = rShoulder;

  const rArm = new THREE.Mesh(_armLathe(1.0), bodyMat);
  rArm.castShadow = true;
  rShoulder.add(rArm);
  P.parts.rArm = rArm;

  const rHand = new THREE.Mesh(_handGeom(), bodyMat);
  rHand.position.y = -0.55;
  rHand.castShadow = true;
  rShoulder.add(rHand);
  P.parts.rHand = rHand;

  // ===== LEGS =====
  const lHip = new THREE.Group();
  lHip.position.set(-0.10, -0.05, 0);
  pelvis.add(lHip);
  P.bones.lHip = lHip;

  const lLeg = new THREE.Mesh(_legLathe(), bodyMat);
  lLeg.castShadow = true;
  lHip.add(lLeg);
  P.parts.lLeg = lLeg;

  const lFoot = new THREE.Mesh(_footGeom(), bodyMat);
  lFoot.position.y = -0.81;
  lFoot.castShadow = true;
  lHip.add(lFoot);
  P.parts.lFoot = lFoot;

  const lKnee = new THREE.Group();
  lKnee.position.y = -0.42;
  lHip.add(lKnee);
  P.bones.lKnee = lKnee;

  const rHip = new THREE.Group();
  rHip.position.set(0.10, -0.05, 0);
  pelvis.add(rHip);
  P.bones.rHip = rHip;

  const rLeg = new THREE.Mesh(_legLathe(), bodyMat);
  rLeg.castShadow = true;
  rHip.add(rLeg);
  P.parts.rLeg = rLeg;

  const rFoot = new THREE.Mesh(_footGeom(), bodyMat);
  rFoot.position.y = -0.81;
  rFoot.castShadow = true;
  rHip.add(rFoot);
  P.parts.rFoot = rFoot;

  const rKnee = new THREE.Group();
  rKnee.position.y = -0.42;
  rHip.add(rKnee);
  P.bones.rKnee = rKnee;

  // ===== SLOT ANCHORS =====
  P.slots.top = new THREE.Group();
  P.slots.top.position.y = -0.20;
  chest.add(P.slots.top);

  P.slots.bottom = new THREE.Group();
  pelvis.add(P.slots.bottom);

  P.slots.dress = new THREE.Group();
  pelvis.add(P.slots.dress);

  P.slots.under = new THREE.Group();
  pelvis.add(P.slots.under);

  P.slots.underTop = new THREE.Group();
  P.slots.underTop.position.y = -0.10;
  chest.add(P.slots.underTop);

  P.slots.shoesL = new THREE.Group();
  lHip.add(P.slots.shoesL); P.slots.shoesL.position.y = -0.81;
  P.slots.shoesR = new THREE.Group();
  rHip.add(P.slots.shoesR); P.slots.shoesR.position.y = -0.81;

  P.slots.head = new THREE.Group();
  head.add(P.slots.head);
  P.slots.hair = new THREE.Group();
  head.add(P.slots.hair);

  // Wardrobe relies on these
  MK.player._buildHairBase = _buildHairBase;

  MK.render.rootGroup.add(root);
  MK.applyMorphs();
};

// ===== MORPHS =====
MK.setMorph = function (name, value) {
  const v = Math.max(-1, Math.min(1, value / 50));
  if (MK.player.morphs[name] === undefined) return;
  MK.player.morphs[name] = v;
  MK.applyMorphs();
};
MK.applyMorphs = function () {
  const P = MK.player; const m = P.morphs;
  // Height morph works for both modes
  if (P.root) {
    const h = 1 + m.height * 0.10;
    P.root.scale.set(1, h, 1);
  }

  if (P.glbActive) {
    // ===== GLB MODE — bone scaling =====
    // Blendshape support: if the body mesh exposes a useful body-shape morph, drive it instead.
    const b = P.glbBones || {};
    if (b.chest) {
      // Bust: widen chest bone X/Z
      const s = 1 + m.bust * 0.35;
      b.chest.scale.set(s, b.chest.scale.y || 1, s);
    }
    if (b.spine || b.spine1) {
      const target = b.spine1 || b.spine;
      // Belly: widen mid-torso forward (Z)
      const sx = 1 + Math.max(0, m.belly) * 0.20;
      const sz = 1 + Math.max(0, m.belly) * 0.35;
      target.scale.set(sx, target.scale.y || 1, sz);
    }
    if (b.hips) {
      // Hips morph widens hip bone (X) and pushes Z back slightly
      const sx = 1 + m.hips * 0.20;
      const sz = 1 + m.hips * 0.18;
      b.hips.scale.set(sx, b.hips.scale.y || 1, sz);
    }
    if (b.lArm && b.rArm) {
      const sa = 1 + m.arms * 0.25;
      b.lArm.scale.set(sa, b.lArm.scale.y || 1, sa);
      b.rArm.scale.set(sa, b.rArm.scale.y || 1, sa);
    }
    if (b.head) {
      // Face: scale head bone uniformly (subtle)
      const sf = 1 + m.face * 0.12;
      b.head.scale.set(sf, sf, sf);
    }
    return;
  }

  // ===== PROCEDURAL MODE =====
  if (P.parts.torso && P.parts.torso.geometry) {
    _applyTorsoMorphs(P.parts.torso.geometry, m);
  }
  if (P.parts.lArm) P.parts.lArm.scale.set(1 + m.arms * 0.40, 1, 1 + m.arms * 0.40);
  if (P.parts.rArm) P.parts.rArm.scale.set(1 + m.arms * 0.40, 1, 1 + m.arms * 0.40);
  if (P.parts.head) {
    const sw = 1 + m.face * 0.16;
    P.parts.head.scale.set(sw, 1 - m.face * 0.04, sw);
  }
};

MK.player.setSkinColor = function (hex) {
  // Procedural body
  if (MK.player.skinMaterial) MK.player.skinMaterial.color.set(hex);
  // GLB body — multiply each cached original color by the new tint
  const P = MK.player;
  if (P.glbActive && P.rpmMeshes) {
    const target = new THREE.Color(hex);
    P.rpmMeshes.body.concat(P.rpmMeshes.head).forEach(m => {
      if (!m.material || !m.material.color) return;
      // Modulate texture color: keep texture detail intact, tint multiplicatively
      m.material.color.copy(target);
      m.material.needsUpdate = true;
    });
  }
};

// ===== IDLE ANIMATION =====
MK.player.update = function (dt) {
  const P = MK.player;
  P.idleT += dt;
  // Slow turntable for both modes so the user sees the back/front
  if (P.root) P.root.rotation.y = 0.05 * Math.sin(P.idleT * 0.25);
  // GLB has its own pose; skip procedural idle anim
  if (P.glbActive) return;
  if (P.bones.spine) P.bones.spine.scale.y = 1 + 0.012 * Math.sin(P.idleT * 1.6);
  if (P.bones.spine) P.bones.spine.rotation.y = 0.025 * Math.sin(P.idleT * 0.7);
  if (P.bones.head) {
    P.bones.head.rotation.y = 0.06 * Math.sin(P.idleT * 0.5);
    P.bones.head.rotation.x = 0.025 * Math.sin(P.idleT * 0.4 + 1.2);
  }
  if (P.bones.lShoulder) P.bones.lShoulder.rotation.x = 0.04 * Math.sin(P.idleT * 0.6);
  if (P.bones.rShoulder) P.bones.rShoulder.rotation.x = 0.04 * Math.sin(P.idleT * 0.6 + Math.PI);
  if (P.bones.pelvis) P.bones.pelvis.rotation.z = 0.012 * Math.sin(P.idleT * 0.7);
};
