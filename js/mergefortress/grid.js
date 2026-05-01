// === Merge Fortress TD — Grid + Path + Fortress (premium 3D look) ===
// Standard PBR-like materials, real terrain thickness, height variation, soft shadows.

window.MF = window.MF || {};

MF.GRID_COLS = 7;
MF.GRID_ROWS = 6;
MF.TILE = 1.4;

MF.PATH_WAYPOINTS = [
  { c: 0, r: 1 },
  { c: 6, r: 1 },
  { c: 6, r: 3 },
  { c: 0, r: 3 },
  { c: 0, r: 5 },
  { c: 6, r: 5 }
];

MF.grid = {
  cells: [],
  pathSet: {},
  worldPath: [],
  pathLength: 0,
  fortressPos: null,
  group: null,
  fortressGroup: null,
  portalGlow: null,
  flag: null,
  // Animated decoration meshes
  ambientLights: []
};

MF.gridToWorld = function(c, r){
  var ox = -((MF.GRID_COLS - 1) * MF.TILE) / 2;
  var oz = -((MF.GRID_ROWS - 1) * MF.TILE) / 2;
  return { x: ox + c * MF.TILE, y: 0, z: oz + r * MF.TILE };
};

MF.worldToGrid = function(x, z){
  var ox = -((MF.GRID_COLS - 1) * MF.TILE) / 2;
  var oz = -((MF.GRID_ROWS - 1) * MF.TILE) / 2;
  var c = Math.round((x - ox) / MF.TILE);
  var r = Math.round((z - oz) / MF.TILE);
  if (c < 0 || c >= MF.GRID_COLS || r < 0 || r >= MF.GRID_ROWS) return null;
  return { c: c, r: r };
};

MF.isOnPath = function(c, r){ return !!MF.grid.pathSet[c + ',' + r]; };
MF.isPlaceable = function(c, r){
  if (c < 0 || c >= MF.GRID_COLS || r < 0 || r >= MF.GRID_ROWS) return false;
  if (MF.isOnPath(c, r)) return false;
  return !MF.grid.cells[r][c];
};
MF.getCell = function(c, r){
  if (c < 0 || c >= MF.GRID_COLS || r < 0 || r >= MF.GRID_ROWS) return undefined;
  return MF.grid.cells[r][c];
};
MF.setCell = function(c, r, val){
  if (c < 0 || c >= MF.GRID_COLS || r < 0 || r >= MF.GRID_ROWS) return;
  MF.grid.cells[r][c] = val;
};
MF.findFreeCell = function(){
  var positions = [];
  for (var r = 0; r < MF.GRID_ROWS; r++)
    for (var c = 0; c < MF.GRID_COLS; c++)
      if (MF.isPlaceable(c, r)) positions.push({ c: c, r: r });
  if (!positions.length) return null;
  return positions[Math.floor(Math.random() * positions.length)];
};

MF.buildGrid = function(world){
  var T = MF.three;
  var g = new THREE.Group();
  MF.grid.group = g;
  T.worldGroup.add(g);

  var isChaos = MF.state.mode === 'chaos';
  // Chaos arena is bigger to accommodate radial spawns + more units
  if (isChaos){
    if (MF.chaos && MF.chaos._mapSmall){
      MF.GRID_COLS = 9;          // small_arena modifier
      MF.GRID_ROWS = 7;
    } else {
      MF.GRID_COLS = 11;
      MF.GRID_ROWS = 9;
    }
  } else {
    MF.GRID_COLS = 7;
    MF.GRID_ROWS = 6;
  }

  // Init cells
  MF.grid.cells = [];
  for (var rr = 0; rr < MF.GRID_ROWS; rr++){
    var row = [];
    for (var cc = 0; cc < MF.GRID_COLS; cc++) row.push(null);
    MF.grid.cells.push(row);
  }

  // P14: map layouts feature DISABLED — caused regression on level 2+
  // (kept original MF.PATH_WAYPOINTS untouched)
  // Path tiles (skipped in chaos: open arena)
  MF.grid.pathSet = {};
  var pathTiles = [];
  var last;
  if (isChaos){
    // Reserve only the center cell for the fortress
    var cFC = Math.floor(MF.GRID_COLS / 2);
    var cFR = Math.floor(MF.GRID_ROWS / 2);
    last = { c: cFC, r: cFR };
    MF.grid.pathSet[cFC + ',' + cFR] = true;     // mark unplaceable
    pathTiles.push(last);
  } else {
    for (var i = 0; i < MF.PATH_WAYPOINTS.length - 1; i++){
      var a = MF.PATH_WAYPOINTS[i], b = MF.PATH_WAYPOINTS[i+1];
      var dc = Math.sign(b.c - a.c), dr = Math.sign(b.r - a.r);
      var c = a.c, r = a.r;
      while (c !== b.c || r !== b.r){
        MF.grid.pathSet[c + ',' + r] = true;
        pathTiles.push({ c: c, r: r });
        c += dc; r += dr;
      }
    }
    last = MF.PATH_WAYPOINTS[MF.PATH_WAYPOINTS.length - 1];
    MF.grid.pathSet[last.c + ',' + last.r] = true;
    pathTiles.push({ c: last.c, r: last.r });
  }

  MF.grid.worldPath = pathTiles.map(function(t){
    var p = MF.gridToWorld(t.c, t.r);
    return new THREE.Vector3(p.x, 0, p.z);
  });
  MF.grid.pathLength = 0;
  for (var k = 1; k < MF.grid.worldPath.length; k++){
    MF.grid.pathLength += MF.grid.worldPath[k].distanceTo(MF.grid.worldPath[k-1]);
  }

  // === Big rounded platform with real thickness ===
  var totalW = MF.GRID_COLS * MF.TILE + 0.7;
  var totalD = MF.GRID_ROWS * MF.TILE + 0.7;
  var platformGeo = new THREE.BoxGeometry(totalW, 1.2, totalD);
  var platformMat = new THREE.MeshStandardMaterial({
    color: MF._darken(world.groundEdge || 0x2a4828, 0.62),
    roughness: 0.92, metalness: 0.0
  });
  var platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = -0.7;
  platform.receiveShadow = true;
  platform.castShadow = false;
  g.add(platform);

  // Underside soft "ambient occlusion" plate
  var auGeo = new THREE.PlaneGeometry(totalW * 1.15, totalD * 1.15);
  var auMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false });
  var au = new THREE.Mesh(auGeo, auMat);
  au.rotation.x = -Math.PI / 2;
  au.position.y = -1.32;
  g.add(au);

  // Decorative beveled rim
  var rimMat = new THREE.MeshStandardMaterial({
    color: 0xc9a44a, roughness: 0.45, metalness: 0.7,
    emissive: 0x2a1808, emissiveIntensity: 0.25
  });
  var rimH = 0.14, rimT = 0.16;
  var rimN = new THREE.Mesh(new THREE.BoxGeometry(totalW, rimH, rimT), rimMat);
  rimN.position.set(0, -0.05, -totalD/2 + rimT/2); g.add(rimN);
  var rimS = new THREE.Mesh(new THREE.BoxGeometry(totalW, rimH, rimT), rimMat);
  rimS.position.set(0, -0.05,  totalD/2 - rimT/2); g.add(rimS);
  var rimW = new THREE.Mesh(new THREE.BoxGeometry(rimT, rimH, totalD), rimMat);
  rimW.position.set(-totalW/2 + rimT/2, -0.05, 0); g.add(rimW);
  var rimE = new THREE.Mesh(new THREE.BoxGeometry(rimT, rimH, totalD), rimMat);
  rimE.position.set( totalW/2 - rimT/2, -0.05, 0); g.add(rimE);
  // Corner gems on rim
  var gemMat = new THREE.MeshStandardMaterial({
    color: 0xffd96a, roughness: 0.2, metalness: 0.85,
    emissive: 0xff8030, emissiveIntensity: 0.45
  });
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){
    var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), gemMat);
    gem.position.set(s[0] * totalW/2, 0.05, s[1] * totalD/2);
    gem.castShadow = true;
    g.add(gem);
  });

  // === Tiles with real height variation ===
  var groundColor = world.ground || 0x5fa848;
  var groundDark  = MF._darken(groundColor, 0.78);
  var tileMatA = new THREE.MeshStandardMaterial({ color: groundColor,  roughness: 0.86, metalness: 0.0 });
  var tileMatB = new THREE.MeshStandardMaterial({ color: groundDark,    roughness: 0.86, metalness: 0.0 });
  var tileEdgeMat = new THREE.MeshStandardMaterial({ color: MF._darken(groundColor, 0.55), roughness: 0.95 });
  var pathTopMat  = new THREE.MeshStandardMaterial({
    color: world.pathColor || 0xb8956a, roughness: 0.78, metalness: 0.0,
    emissive: MF._darken(world.pathColor || 0xb8956a, 0.45),
    emissiveIntensity: 0.18
  });
  var pathInsetMat = new THREE.MeshStandardMaterial({ color: MF._darken(world.pathColor || 0xb8956a, 0.6), roughness: 0.95 });

  var tilePadGeo  = new THREE.BoxGeometry(MF.TILE * 0.92, 0.30, MF.TILE * 0.92);
  var tileEdgeGeo = new THREE.BoxGeometry(MF.TILE * 0.96, 0.10, MF.TILE * 0.96);

  for (var rr2 = 0; rr2 < MF.GRID_ROWS; rr2++){
    for (var cc2 = 0; cc2 < MF.GRID_COLS; cc2++){
      var pos = MF.gridToWorld(cc2, rr2);
      var onPath = MF.isOnPath(cc2, rr2);
      // Subtle deterministic height variation for non-path tiles
      var h = onPath ? 0 : ((MF._tileHash(cc2, rr2) * 0.05) - 0.02);
      // Edge layer
      var edge = new THREE.Mesh(tileEdgeGeo, onPath ? pathInsetMat : tileEdgeMat);
      edge.position.set(pos.x, 0.05 + h * 0.6, pos.z);
      edge.receiveShadow = true;
      g.add(edge);
      // Top layer
      var topMat = onPath ? pathTopMat : ((cc2 + rr2) % 2 === 0 ? tileMatA : tileMatB);
      var top = new THREE.Mesh(tilePadGeo, topMat);
      top.position.set(pos.x, 0.16 + h, pos.z);
      top.userData.gridC = cc2;
      top.userData.gridR = rr2;
      top.userData.isTile = true;
      top.receiveShadow = true;
      g.add(top);

      if (onPath){
        MF._addPathBrick(g, pos, world);
        MF.grid.cells[rr2][cc2] = 'path';
      } else {
        MF._addTileDecor(g, pos, cc2, rr2, world);
      }
    }
  }

  // === Path entry portal (left side) — skipped in chaos open-arena ===
  if (!isChaos){
    var entryPos = MF.gridToWorld(0, 1);
    var portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.08, 10, 28),
      new THREE.MeshStandardMaterial({
        color: 0x6850a0, roughness: 0.4, metalness: 0.5,
        emissive: 0x6850a0, emissiveIntensity: 0.6
      })
    );
    portalRing.position.set(entryPos.x - MF.TILE * 0.7, 0.55, entryPos.z);
    portalRing.rotation.y = Math.PI / 2;
    portalRing.castShadow = true;
    g.add(portalRing);
    var portalGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 22),
      new THREE.MeshBasicMaterial({ color: 0xa080ff, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
    );
    portalGlow.position.copy(portalRing.position);
    portalGlow.rotation.y = Math.PI / 2;
    g.add(portalGlow);
    // Portal halo (fake bloom)
    var portalHalo = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 22),
      new THREE.MeshBasicMaterial({ color: 0xa080ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })
    );
    portalHalo.position.copy(portalRing.position);
    portalHalo.rotation.y = Math.PI / 2;
    g.add(portalHalo);
    MF.grid.portalGlow = portalGlow;
    MF.grid.portalHalo = portalHalo;
  } else {
    MF.grid.portalGlow = null;
    MF.grid.portalHalo = null;
  }

  // Fortress
  MF._buildFortress(g, world, last, isChaos);
};

MF._tileHash = function(c, r){
  // Tiny deterministic 0..1
  var n = (c * 73856093) ^ (r * 19349663);
  n = (n >>> 0) % 1000;
  return n / 1000;
};

MF._addPathBrick = function(g, pos, world){
  var brickMat = new THREE.MeshStandardMaterial({
    color: MF._darken(world.pathColor || 0xb8956a, 0.78),
    roughness: 0.85
  });
  var brick = new THREE.Mesh(new THREE.BoxGeometry(MF.TILE * 0.4, 0.05, MF.TILE * 0.18), brickMat);
  brick.position.set(pos.x, 0.32, pos.z - 0.18);
  brick.receiveShadow = true;
  g.add(brick);
  var brick2 = new THREE.Mesh(new THREE.BoxGeometry(MF.TILE * 0.4, 0.05, MF.TILE * 0.18), brickMat);
  brick2.position.set(pos.x, 0.32, pos.z + 0.18);
  brick2.receiveShadow = true;
  g.add(brick2);
};

MF._addTileDecor = function(g, pos, c, r, world){
  var seed = MF._tileHash(c, r);
  // Decorate ~30% of tiles depending on world theme
  if (seed > 0.7) return;

  var theme = world.id;
  if (theme === 'grass'){
    if (seed < 0.18) {
      // Grass tuft
      var tuftMat = new THREE.MeshStandardMaterial({
        color: MF._lighten(world.ground || 0x5fa848, 1.2), roughness: 0.9
      });
      for (var i = 0; i < 3; i++){
        var t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), tuftMat);
        t.position.set(pos.x + (seed - 0.5) * 0.5 + i * 0.08 - 0.08,
                       0.4,
                       pos.z + (i % 2 === 0 ? 0.1 : -0.1));
        t.castShadow = true;
        g.add(t);
      }
    } else if (seed < 0.34) {
      // Small flower
      var stemMat = new THREE.MeshStandardMaterial({ color: 0x4a8030, roughness: 0.85 });
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 5), stemMat);
      stem.position.set(pos.x + 0.3, 0.42, pos.z + 0.25);
      g.add(stem);
      var petalMat = new THREE.MeshStandardMaterial({
        color: seed < 0.27 ? 0xff8090 : 0xffe060, roughness: 0.6,
        emissive: seed < 0.27 ? 0x401020 : 0x402a04, emissiveIntensity: 0.2
      });
      var petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), petalMat);
      petal.position.set(pos.x + 0.3, 0.55, pos.z + 0.25);
      petal.castShadow = true;
      g.add(petal);
    }
  } else if (theme === 'desert'){
    if (seed < 0.18) {
      // Cactus
      var cMat = new THREE.MeshStandardMaterial({ color: 0x4a8030, roughness: 0.85 });
      var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.28, 6), cMat);
      c1.position.set(pos.x + 0.25, 0.45, pos.z + 0.25);
      c1.castShadow = true;
      g.add(c1);
    } else if (seed < 0.32) {
      // Stone
      var sMat = new THREE.MeshStandardMaterial({ color: 0x9a8060, roughness: 0.95 });
      var st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), sMat);
      st.position.set(pos.x - 0.2, 0.36, pos.z - 0.2);
      st.castShadow = true;
      g.add(st);
    }
  } else if (theme === 'frozen'){
    if (seed < 0.22) {
      // Ice spike
      var iMat = new THREE.MeshStandardMaterial({
        color: 0xb8e8ff, roughness: 0.25, metalness: 0.4,
        emissive: 0x4080a0, emissiveIntensity: 0.25, transparent: true, opacity: 0.92
      });
      var ice = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), iMat);
      ice.position.set(pos.x + (seed - 0.5) * 0.4, 0.4, pos.z + (seed - 0.5) * 0.4);
      ice.castShadow = true;
      g.add(ice);
    }
  } else if (theme === 'lava'){
    if (seed < 0.20) {
      // Lava crack glow
      var cMat = new THREE.MeshBasicMaterial({ color: 0xff7028, transparent: true, opacity: 0.85 });
      var crack = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), cMat);
      crack.rotation.x = -Math.PI / 2;
      crack.position.set(pos.x, 0.32, pos.z);
      g.add(crack);
    }
  } else if (theme === 'necro'){
    if (seed < 0.18) {
      // Bone
      var bMat = new THREE.MeshStandardMaterial({ color: 0xe8dac0, roughness: 0.7 });
      var bone = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 6), bMat);
      bone.position.set(pos.x - 0.18, 0.36, pos.z + 0.2);
      bone.rotation.z = 1;
      bone.castShadow = true;
      g.add(bone);
    }
  } else if (theme === 'sky'){
    if (seed < 0.20) {
      // Floating cloud puff
      var cMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      var puff = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), cMat);
      puff.position.set(pos.x + 0.2, 0.5, pos.z - 0.15);
      puff.scale.set(1, 0.7, 1);
      puff.castShadow = true;
      g.add(puff);
    }
  }
};

MF._buildFortress = function(parent, world, last, isChaos){
  var lastPos;
  if (isChaos){
    // Center of arena
    var center = MF.gridToWorld(last.c, last.r);
    lastPos = { x: center.x, y: 0, z: center.z };
  } else {
    lastPos = MF.gridToWorld(MF.GRID_COLS, last.r);
    lastPos.x = ((MF.GRID_COLS - 1) * MF.TILE) / 2 + MF.TILE * 1.0;
    lastPos.z = MF.gridToWorld(0, last.r).z;
  }
  MF.grid.fortressPos = new THREE.Vector3(lastPos.x, 0, lastPos.z);

  var fg = new THREE.Group();
  fg.position.copy(MF.grid.fortressPos);

  var stoneCol = world.fortressColor || 0x9a8878;
  var stoneMat = new THREE.MeshStandardMaterial({ color: stoneCol, roughness: 0.85, metalness: 0.05 });
  var stoneDark = new THREE.MeshStandardMaterial({ color: MF._darken(stoneCol, 0.7), roughness: 0.92 });
  var stoneLight = new THREE.MeshStandardMaterial({ color: MF._lighten(stoneCol, 1.15), roughness: 0.85 });
  var roofMat = new THREE.MeshStandardMaterial({
    color: 0xc83838, roughness: 0.55, metalness: 0.05,
    emissive: 0x2a0808, emissiveIntensity: 0.1
  });
  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd96a, roughness: 0.3, metalness: 0.85,
    emissive: 0x402608, emissiveIntensity: 0.4
  });

  // Wide base
  var base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 2.0), stoneDark);
  base.position.y = 0.35; base.castShadow = true; base.receiveShadow = true; fg.add(base);
  // Steps
  var step = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.4), stoneLight);
  step.position.set(0, 0.15, -1.2); step.castShadow = true; step.receiveShadow = true; fg.add(step);

  // Center keep
  var keep = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), stoneMat);
  keep.position.set(0, 1.4, 0); keep.castShadow = true; keep.receiveShadow = true; fg.add(keep);

  // Crenellations on keep
  var crenGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
  for (var i = -2; i <= 2; i++){
    if (Math.abs(i) === 1) continue;
    var c1 = new THREE.Mesh(crenGeo, stoneLight);
    c1.position.set(i * 0.34, 2.2, -0.65); c1.castShadow = true; fg.add(c1);
    var c2 = new THREE.Mesh(crenGeo, stoneLight);
    c2.position.set(i * 0.34, 2.2,  0.65); c2.castShadow = true; fg.add(c2);
  }
  for (var j = -1; j <= 1; j++){
    if (j === 0) continue;
    var s1 = new THREE.Mesh(crenGeo, stoneLight);
    s1.position.set(-0.65, 2.2, j * 0.42); s1.castShadow = true; fg.add(s1);
    var s2 = new THREE.Mesh(crenGeo, stoneLight);
    s2.position.set( 0.65, 2.2, j * 0.42); s2.castShadow = true; fg.add(s2);
  }

  // Side towers (round)
  [[-0.85, -0.78], [0.85, -0.78], [-0.85, 0.78], [0.85, 0.78]].forEach(function(p){
    var t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.8, 12), stoneMat);
    t.position.set(p[0], 0.9, p[1]); t.castShadow = true; t.receiveShadow = true; fg.add(t);
    var roof = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.55, 12), roofMat);
    roof.position.set(p[0], 2.07, p[1]); roof.castShadow = true; fg.add(roof);
    // Roof gold cap
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), goldMat);
    cap.position.set(p[0], 2.4, p[1]); fg.add(cap);
  });

  // Door
  var doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.7, metalness: 0.1 });
  var door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.06), doorMat);
  door.position.set(0, 0.55, -1.05); fg.add(door);
  var arch = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.06, 14, 1, false, 0, Math.PI), doorMat);
  arch.position.set(0, 0.95, -1.05); arch.rotation.x = Math.PI / 2; fg.add(arch);
  // Door studs
  for (var sd = 0; sd < 6; sd++){
    var stud = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), goldMat);
    stud.position.set(-0.16 + (sd % 3) * 0.16, 0.45 + Math.floor(sd / 3) * 0.25, -1.02);
    fg.add(stud);
  }

  // Pole + flag
  var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6),
                              new THREE.MeshStandardMaterial({ color: 0xddd0a0, roughness: 0.6 }));
  pole.position.set(0, 2.85, 0); fg.add(pole);
  var flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32),
                              new THREE.MeshStandardMaterial({
                                color: 0xc83838, side: THREE.DoubleSide, roughness: 0.55,
                                emissive: 0x401010, emissiveIntensity: 0.15
                              }));
  flag.position.set(0.25, 3.15, 0); fg.add(flag);
  MF.grid.flag = flag;

  parent.add(fg);
  MF.grid.fortressGroup = fg;
};

// Color helpers
MF._darken = function(hex, factor){
  var r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff;
  r = Math.max(0, Math.min(255, Math.round(r * factor)));
  g = Math.max(0, Math.min(255, Math.round(g * factor)));
  b = Math.max(0, Math.min(255, Math.round(b * factor)));
  return (r << 16) | (g << 8) | b;
};
MF._lighten = function(hex, factor){ return MF._darken(hex, factor); };

MF.pathPositionAt = function(t){
  if (!MF.grid.worldPath.length) return new THREE.Vector3();
  if (t <= 0) return MF.grid.worldPath[0].clone();
  if (t >= 1) return MF.grid.worldPath[MF.grid.worldPath.length - 1].clone();
  var dist = t * MF.grid.pathLength;
  var acc = 0;
  for (var i = 1; i < MF.grid.worldPath.length; i++){
    var a = MF.grid.worldPath[i-1], b = MF.grid.worldPath[i];
    var seg = a.distanceTo(b);
    if (acc + seg >= dist){
      var k = (dist - acc) / seg;
      return a.clone().lerp(b, k);
    }
    acc += seg;
  }
  return MF.grid.worldPath[MF.grid.worldPath.length - 1].clone();
};

MF.updateGridFx = function(t){
  if (MF.grid.portalGlow){
    MF.grid.portalGlow.rotation.z = t * 0.7;
    MF.grid.portalGlow.material.opacity = 0.55 + Math.sin(t * 4) * 0.18;
  }
  if (MF.grid.portalHalo){
    MF.grid.portalHalo.material.opacity = 0.16 + Math.sin(t * 3 + 1) * 0.08;
    var s = 1 + Math.sin(t * 3) * 0.1;
    MF.grid.portalHalo.scale.set(s, s, 1);
  }
  if (MF.grid.flag){
    MF.grid.flag.rotation.y = Math.sin(t * 2.4) * 0.32;
    // Subtle wave
    MF.grid.flag.scale.x = 1 + Math.sin(t * 4) * 0.05;
  }
};
