// === Merge Fortress TD — Enemies (premium 3D look) ===
// Standard materials + shadows + blob shadow + breathing + glowing eyes.

window.MF = window.MF || {};

MF.enemies = [];
MF._enemyIdCounter = 0;

// Reuse helpers from units.js if loaded; otherwise define minimal versions
MF._matE = function(c, opts){
  opts = opts || {};
  return new THREE.MeshStandardMaterial({
    color: c, roughness: opts.r != null ? opts.r : 0.78, metalness: opts.m != null ? opts.m : 0.0,
    emissive: opts.em != null ? opts.em : 0x000000,
    emissiveIntensity: opts.emI != null ? opts.emI : 0,
    transparent: !!opts.t, opacity: opts.t != null ? opts.t : 1
  });
};

MF.buildEnemyMesh = function(data, scale){
  scale = (scale || data.scale || 0.55) * (MF.ENEMY_SIZE_MULT || 1);
  var g = new THREE.Group();
  var color = data.color;

  // Blob shadow under enemy
  var blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.55 * scale, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: data.flying ? 0.20 : 0.36, depthWrite: false, fog: false })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = data.flying ? 0.05 : 0.20;
  g.add(blob);
  g.userData.blob = blob;

  if (data.id === 'goblin'){
    var skinMat = MF._matE(color, { r: 0.7 });
    var darkSkin = MF._matE(MF._mc(color, 0.7), { r: 0.85 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.55*scale, 0.6*scale, 0.42*scale), skinMat);
    body.position.y = 0.32*scale; body.castShadow = true; g.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.22*scale, 14, 10), skinMat);
    head.position.y = 0.78*scale; head.castShadow = true; g.add(head);
    [-1, 1].forEach(function(s){
      var ear = new THREE.Mesh(new THREE.ConeGeometry(0.08*scale, 0.2*scale, 5), skinMat);
      ear.position.set(s * 0.18*scale, 0.85*scale, 0); ear.rotation.z = s * 0.55;
      ear.castShadow = true;
      g.add(ear);
    });
    [-1, 1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.045*scale, 8, 6),
                                MF._matE(0xff5050, { em: 0xff3030, emI: 1.6 }));
      eye.position.set(s * 0.08*scale, 0.78*scale, 0.18*scale); g.add(eye);
    });
    // Loincloth
    var loin = new THREE.Mesh(new THREE.BoxGeometry(0.5*scale, 0.16*scale, 0.4*scale), darkSkin);
    loin.position.y = 0.15*scale; g.add(loin);
  } else if (data.id === 'skeleton'){
    var boneMat = MF._matE(0xfff8e0, { r: 0.55 });
    var fabric = MF._matE(color, { r: 0.85 });
    var spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06*scale, 0.07*scale, 0.55*scale, 6), boneMat);
    spine.position.y = 0.34*scale; spine.castShadow = true; g.add(spine);
    var pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.32*scale, 0.18*scale, 0.18*scale), boneMat);
    pelvis.position.y = 0.18*scale; pelvis.castShadow = true; g.add(pelvis);
    // Ribs
    for (var i = 0; i < 3; i++){
      var rib = new THREE.Mesh(new THREE.TorusGeometry(0.20*scale, 0.025*scale, 5, 14), boneMat);
      rib.position.y = 0.30*scale + i * 0.10*scale; rib.rotation.x = Math.PI/2; g.add(rib);
    }
    // Skull
    var skull = new THREE.Mesh(new THREE.SphereGeometry(0.21*scale, 14, 12), boneMat);
    skull.position.y = 0.82*scale; skull.castShadow = true; g.add(skull);
    var jaw = new THREE.Mesh(new THREE.BoxGeometry(0.30*scale, 0.08*scale, 0.20*scale), boneMat);
    jaw.position.set(0, 0.72*scale, 0.05*scale); g.add(jaw);
    [-1, 1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.05*scale, 8, 6),
                                MF._matE(0xff3030, { em: 0xff2020, emI: 1.8 }));
      eye.position.set(s * 0.08*scale, 0.85*scale, 0.16*scale); g.add(eye);
    });
    // Tattered cloth around hips
    var cloth = new THREE.Mesh(new THREE.ConeGeometry(0.22*scale, 0.32*scale, 8), fabric);
    cloth.position.y = 0.05*scale; g.add(cloth);
  } else if (data.id === 'orc'){
    var orcMat = MF._matE(color, { r: 0.78 });
    var darkMat = MF._matE(MF._mc(color, 0.65), { r: 0.85 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.7*scale, 0.7*scale, 0.55*scale), orcMat);
    body.position.y = 0.36*scale; body.castShadow = true; g.add(body);
    var armorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.6*scale, 0.4*scale, 0.1*scale),
                                     MF._matE(0x6a4818, { r: 0.6, m: 0.4 }));
    armorPlate.position.set(0, 0.36*scale, 0.30*scale); armorPlate.castShadow = true; g.add(armorPlate);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.28*scale, 14, 12), orcMat);
    head.position.y = 0.85*scale; head.castShadow = true; g.add(head);
    [-1, 1].forEach(function(s){
      var t = new THREE.Mesh(new THREE.ConeGeometry(0.045*scale, 0.18*scale, 5),
                              MF._matE(0xfff8d0, { r: 0.5 }));
      t.position.set(s * 0.10*scale, 0.78*scale, 0.22*scale); t.rotation.x = Math.PI; g.add(t);
    });
    [-1, 1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.05*scale, 8, 6),
                                MF._matE(0xffd040, { em: 0xff8020, emI: 1.5 }));
      eye.position.set(s * 0.10*scale, 0.88*scale, 0.22*scale); g.add(eye);
    });
    var club = new THREE.Mesh(new THREE.BoxGeometry(0.12*scale, 0.55*scale, 0.12*scale), MF._matE(0x6a3818, { r: 0.85 }));
    club.position.set(0.42*scale, 0.42*scale, 0); club.castShadow = true; g.add(club);
    // Spikes on shoulders
    [-1, 1].forEach(function(s){
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.07*scale, 0.18*scale, 5),
                                MF._matE(0xddc8a0, { r: 0.5 }));
      sp.position.set(s * 0.36*scale, 0.7*scale, 0); sp.rotation.z = -s * 0.8; g.add(sp);
    });
  } else if (data.id === 'bat' || (data.flying && data.id !== 'wraith')){
    var bMat = MF._matE(color, { r: 0.6 });
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.22*scale, 14, 12), bMat);
    body.position.y = 0; body.castShadow = true; g.add(body);
    // Wings (animated via userData.wings)
    var wingMat = MF._matE(MF._mc(color, 0.85), { r: 0.65, t: 0.92 });
    wingMat.side = THREE.DoubleSide;
    var w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.55*scale, 0.34*scale), wingMat);
    w1.position.set(-0.32*scale, 0.05*scale, 0); g.add(w1);
    var w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.55*scale, 0.34*scale), wingMat);
    w2.position.set(0.32*scale, 0.05*scale, 0); g.add(w2);
    g.userData.wings = [w1, w2];
    [-1, 1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.045*scale, 8, 6),
                                MF._matE(0xffd96a, { em: 0xff8020, emI: 1.6 }));
      eye.position.set(s * 0.07*scale, 0.04*scale, 0.18*scale); g.add(eye);
    });
    // Fangs
    [-1, 1].forEach(function(s){
      var fang = new THREE.Mesh(new THREE.ConeGeometry(0.025*scale, 0.08*scale, 4),
                                  MF._matE(0xffffff, { r: 0.4 }));
      fang.position.set(s * 0.04*scale, -0.05*scale, 0.20*scale);
      fang.rotation.x = Math.PI;
      g.add(fang);
    });
  } else if (data.id === 'elite'){
    var eMat = MF._matE(color, { r: 0.85 });
    var armor = MF._matE(0xa0a8c0, { r: 0.35, m: 0.85 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.65*scale, 0.7*scale, 0.5*scale), eMat);
    body.position.y = 0.36*scale; body.castShadow = true; g.add(body);
    var plate = new THREE.Mesh(new THREE.BoxGeometry(0.7*scale, 0.4*scale, 0.55*scale), armor);
    plate.position.y = 0.36*scale; plate.castShadow = true; g.add(plate);
    var helmet = new THREE.Mesh(new THREE.ConeGeometry(0.22*scale, 0.32*scale, 12), armor);
    helmet.position.y = 0.92*scale; helmet.castShadow = true; g.add(helmet);
    // Helmet face mask (dark)
    var mask = new THREE.Mesh(new THREE.CylinderGeometry(0.18*scale, 0.18*scale, 0.16*scale, 12),
                                MF._matE(0x1a1a26, { r: 0.5 }));
    mask.position.y = 0.78*scale; g.add(mask);
    // Eye slit
    var slit = new THREE.Mesh(new THREE.BoxGeometry(0.22*scale, 0.04*scale, 0.04*scale),
                                MF._matE(0xff5050, { em: 0xff3030, emI: 1.6 }));
    slit.position.set(0, 0.80*scale, 0.18*scale); g.add(slit);
    // Spikes
    for (var s2 = 0; s2 < 4; s2++){
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.05*scale, 0.18*scale, 5),
                                MF._matE(0x707080, { r: 0.55 }));
      var a = s2 / 4 * Math.PI * 2;
      sp.position.set(Math.cos(a)*0.25*scale, 0.7*scale, Math.sin(a)*0.18*scale);
      g.add(sp);
    }
  } else if (data.id === 'wraith'){
    var wMat = MF._matE(color, { r: 0.65, t: 0.78, em: MF._mc(color, 0.6), emI: 0.6 });
    var body = new THREE.Mesh(new THREE.ConeGeometry(0.32*scale, 0.85*scale, 10), wMat);
    body.position.y = 0.42*scale; body.castShadow = true; g.add(body);
    // Wisps around (small spheres)
    for (var w = 0; w < 4; w++){
      var wisp = new THREE.Mesh(new THREE.SphereGeometry(0.08*scale, 8, 6),
                                  MF._matE(MF._mc(color, 1.4), { em: MF._mc(color, 1.0), emI: 1.0, t: 0.7 }));
      var a = w / 4 * Math.PI * 2;
      wisp.position.set(Math.cos(a)*0.32*scale, 0.5*scale + Math.sin(a)*0.05*scale, Math.sin(a)*0.32*scale);
      g.add(wisp);
    }
    var face = new THREE.Mesh(new THREE.SphereGeometry(0.16*scale, 12, 10),
                                MF._matE(0xe0c0ff, { t: 0.9 }));
    face.position.y = 0.7*scale; g.add(face);
    [-1,1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.045*scale, 8, 6),
                                  MF._matE(0x80f0ff, { em: 0x40c0ff, emI: 1.8 }));
      eye.position.set(s * 0.06*scale, 0.72*scale, 0.13*scale); g.add(eye);
    });
  } else if (data.kind === 'boss'){
    var bMat = MF._matE(color, { r: 0.6 });
    var darkBmat = MF._matE(MF._mc(color, 0.6), { r: 0.85 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.9*scale, 1.0*scale, 0.7*scale), bMat);
    body.position.y = 0.5*scale; body.castShadow = true; g.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.4*scale, 16, 14), bMat);
    head.position.y = 1.15*scale; head.castShadow = true; g.add(head);
    var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.32*scale, 0.32*scale, 0.18*scale, 8),
                                MF._matE(0xffd96a, { r: 0.3, m: 0.85, em: 0xff8030, emI: 0.6 }));
    crown.position.y = 1.45*scale; crown.castShadow = true; g.add(crown);
    for (var k = 0; k < 6; k++){
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.06*scale, 0.18*scale, 4),
                                MF._matE(0xffd96a, { r: 0.3, m: 0.85, em: 0x402608, emI: 0.45 }));
      var a = k / 6 * Math.PI * 2;
      sp.position.set(Math.cos(a)*0.32*scale, 1.6*scale, Math.sin(a)*0.32*scale);
      g.add(sp);
    }
    [-1,1].forEach(function(s){
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.08*scale, 10, 8),
                                MF._matE(0xff3030, { em: 0xff1010, emI: 2.0 }));
      eye.position.set(s * 0.13*scale, 1.18*scale, 0.32*scale); g.add(eye);
    });
    // Boss aura (pulsing halo)
    var aura = new THREE.Mesh(new THREE.SphereGeometry(0.8*scale, 14, 10),
                                new THREE.MeshBasicMaterial({ color: 0xff5050, transparent: true, opacity: 0.18, depthWrite: false }));
    aura.position.y = 0.9*scale; g.add(aura);
    g.userData.aura = aura;
    // Shoulder spikes
    [-1, 1].forEach(function(s){
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.10*scale, 0.28*scale, 5),
                                MF._matE(MF._mc(color, 0.65), { r: 0.6 }));
      sp.position.set(s * 0.50*scale, 0.85*scale, 0); sp.rotation.z = -s * 0.6; g.add(sp);
    });
  } else {
    // Fallback
    var body2 = new THREE.Mesh(new THREE.BoxGeometry(0.6*scale, 0.6*scale, 0.5*scale), MF._matE(color));
    body2.position.y = 0.32*scale; body2.castShadow = true; g.add(body2);
  }

  // Cartoon outline (BackSide black) on significant meshes
  if (MF._addOutlinesToGroup) {
    MF._addOutlinesToGroup(g, { minRadius: 0.10, maxOutlines: 12, scale: 1.06 });
  }

  // === HP bar (always last) — P14: wider for bosses ===
  var hpWidth = (data.kind === 'boss' ? 1.4 : 0.7) * scale;
  var hpHeight = (data.kind === 'boss' ? 0.18 : 0.10) * scale;
  var hpFgWidth = (data.kind === 'boss' ? 1.32 : 0.66) * scale;
  var hpFgHeight = (data.kind === 'boss' ? 0.13 : 0.07) * scale;
  var hpBg = new THREE.Mesh(new THREE.PlaneGeometry(hpWidth, hpHeight),
                              new THREE.MeshBasicMaterial({ color: 0x100408, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false }));
  hpBg.position.y = (data.kind === 'boss' ? 2.1 : 1.18) * scale;
  g.add(hpBg);
  var hpFg = new THREE.Mesh(new THREE.PlaneGeometry(hpFgWidth, hpFgHeight),
                              new THREE.MeshBasicMaterial({ color: 0x60ff60, side: THREE.DoubleSide, transparent: true, opacity: 1.0, depthWrite: false }));
  hpFg.position.y = hpBg.position.y;
  hpFg.position.z = 0.001;
  g.add(hpFg);
  g.userData.hpBg = hpBg;
  g.userData.hpFg = hpFg;
  g.userData.hpFgWidth = hpFgWidth;

  return g;
};

MF._mc = function(hex, f){
  var r = ((hex >> 16) & 0xff) * f;
  var gr = ((hex >> 8) & 0xff) * f;
  var b = (hex & 0xff) * f;
  r = Math.max(0, Math.min(255, Math.round(r)));
  gr = Math.max(0, Math.min(255, Math.round(gr)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return (r << 16) | (gr << 8) | b;
};

MF.spawnEnemy = function(typeId, hpMult, spdMult, opts){
  opts = opts || {};
  var data = MF.getEnemy(typeId);
  if (!data) return null;
  var scale = (data.scale || 0.55) * (opts.scaleMult || 1) * (MF.ENEMY_SIZE_MULT || 1);
  // buildEnemyMesh re-multiplies, so pass the un-multiplied value
  var meshScale = (data.scale || 0.55) * (opts.scaleMult || 1);
  var mesh = MF.buildEnemyMesh(data, meshScale);
  var startPos = MF.grid.worldPath[0].clone();
  if (data.flying) startPos.y = 1.2;
  mesh.position.copy(startPos);
  MF.three.worldGroup.add(mesh);

  var hp = data.baseHP * (hpMult || 1) * (opts.scaleMult ? Math.pow(opts.scaleMult, 1.6) : 1);
  var spd = data.baseSpd * (spdMult || 1);
  // Roguelite enemy modifiers
  if (MF.run){
    hp  *= (MF.run.enemyHpMult || 1);
    spd *= (MF.run.enemySpdMult || 1);
  }

  var enemy = {
    eid: ++MF._enemyIdCounter,
    typeId: typeId,
    data: data,
    mesh: mesh,
    pos: mesh.position,
    pathT: 0,
    hp: hp,
    maxHp: hp,
    speed: spd,
    baseSpeed: spd,
    armor: data.armor || 0,
    flying: !!data.flying,
    isBoss: data.kind === 'boss',
    isMini: !!opts.isMini,
    gold: Math.round(data.gold * (opts.goldMult || 1)),
    fortressDmg: data.fortressDmg || 1,
    statuses: { slow: 0, slowMult: 1, burn: 0, burnDps: 0, stun: 0 },
    alive: true,
    scale: scale,
    breatheT: Math.random() * Math.PI * 2
  };
  MF.enemies.push(enemy);
  // P11: chance to make this a "named rare"
  if (MF.rare_maybeSpawnNamed) MF.rare_maybeSpawnNamed(enemy);
  return enemy;
};

MF.removeEnemy = function(enemy){
  if (!enemy) return;
  enemy.alive = false;
  MF.three.worldGroup.remove(enemy.mesh);
  MF._disposeMesh(enemy.mesh);
  var i = MF.enemies.indexOf(enemy);
  if (i >= 0) MF.enemies.splice(i, 1);
};

MF.clearEnemies = function(){
  for (var i = MF.enemies.length - 1; i >= 0; i--) MF.removeEnemy(MF.enemies[i]);
  MF.enemies = [];
};

MF.findClosestEnemy = function(pos, range, includeFlying){
  var best = null, bestD = range;
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e.alive) continue;
    if (e.flying && !includeFlying) continue;
    var d = e.pos.distanceTo(pos);
    if (d < bestD){ bestD = d; best = e; }
  }
  return best;
};

MF.dealDamage = function(enemy, damage, kind, sourceUnit){
  if (!enemy || !enemy.alive) return;
  // Track mastery XP for the source unit (if killing blow)
  if (sourceUnit && enemy.hp - damage <= 0 && MF.mastery_addKill){
    MF.mastery_addKill(sourceUnit.id);
  }
  // P13: track last killer for berserker rage
  if (sourceUnit) enemy._lastKiller = sourceUnit;
  // Boss invulnerability (lich phase 2)
  if (enemy.invuln){
    MF.fx.spawnRing(enemy.pos, 0xc070ff, { scale: 0.8, life: 0.2 });
    return;
  }
  // P14 boss custom resists
  if (MF.bosscustom_modifyDamage) damage = MF.bosscustom_modifyDamage(enemy, damage, kind);
  // Roguelite hooks: frostShatter, lifesteal accumulator
  if (MF.rl_onEnemyDamaged) damage = MF.rl_onEnemyDamaged(enemy, damage);
  var actual = damage * (1 - enemy.armor);
  if (actual < 1) actual = 1;
  enemy.hp -= actual;
  MF.state.damageDealt += actual;
  // HP bar update
  var hpFg = enemy.mesh.userData.hpFg;
  if (hpFg){
    var pct = Math.max(0, enemy.hp / enemy.maxHp);
    hpFg.scale.x = pct;
    hpFg.position.x = -(1 - pct) * enemy.mesh.userData.hpFgWidth / 2;
    if (pct < 0.4) hpFg.material.color.setHex(0xff8030);
    if (pct < 0.2) hpFg.material.color.setHex(0xff3030);
  }
  // Hit flash + small dynamic light
  MF.fx.spawnHitFlash(enemy.mesh, 0xffffff, 90);
  MF.flashLight(enemy.pos, 0xffffff, 1.4, 4, 0.12);
  MF.fx.floatingDmg(enemy.pos, actual, kind);
  // Tiny ring shockwave
  MF.fx.spawnRing(enemy.pos, kind === 'fire' ? 0xff8030 : (kind === 'frost' ? 0x90d0ff : (kind === 'lightning' ? 0xfff080 : 0xffeaa3)), { scale: 1.5, life: 0.32 });
  if (enemy.hp <= 0) MF.killEnemy(enemy);
  else {
    if (MF.audio && MF.audio.hit) MF.audio.hit();
    // Boss phase mechanics
    if (enemy.isBoss && MF.boss_onDamage) MF.boss_onDamage(enemy, actual);
  }
};

MF.killEnemy = function(enemy){
  if (!enemy || !enemy.alive) return;
  // P13: berserker rage stack on kill (track via lastKillerUnit)
  if (enemy._lastKiller && MF.ability_onKill) MF.ability_onKill(enemy._lastKiller);
  if (MF.audio && MF.audio.kill) MF.audio.kill();
  MF.fx.spawnBurst(enemy.pos, enemy.data.color || 0xffd96a, enemy.isBoss ? 28 : 10, { speed: enemy.isBoss ? 5.5 : 3.2 });
  MF.fx.spawnRing(enemy.pos, 0xffd96a, { scale: enemy.isBoss ? 4 : 2.4, life: enemy.isBoss ? 0.7 : 0.45 });
  MF.flashLight(enemy.pos, enemy.isBoss ? 0xff8030 : 0xffd96a, enemy.isBoss ? 3.5 : 1.8, enemy.isBoss ? 7 : 4, enemy.isBoss ? 0.4 : 0.2);
  if (enemy.isBoss) MF.fx.shake(0.45, 0.55);
  // Apply gold multiplier
  var goldEarned = enemy.gold;
  if (MF.run && MF.run.goldMult) goldEarned = Math.round(goldEarned * MF.run.goldMult);
  MF.state.gold += goldEarned;
  MF.state.totalGold += goldEarned;
  MF.state.killsThisLevel++;
  MF.state.totalKills++;
  MF.fx.floatingDmg(enemy.pos, '+' + goldEarned + '💰', 'gold');
  // Roguelite hook: explode-on-death
  if (MF.rl_onEnemyKilled) MF.rl_onEnemyKilled(enemy);
  // Chaos hook: combo + ultimate charge
  if (MF.chaos_onKill) MF.chaos_onKill(enemy);
  // Daily challenges: kills + bosses
  if (MF.daily_addProgress){
    MF.daily_addProgress('kills', 1);
    if (enemy.isBoss) MF.daily_addProgress('bosses', 1);
  }
  // Weekend event: legendary skin drop on boss kill in chaos
  if (enemy.isBoss && MF.state.mode === 'chaos' && MF.event_onBossKilled){
    MF.event_onBossKilled();
  }
  // Track kill stats (codex unlock)
  if (MF.killstats_record) MF.killstats_record(null, enemy.isBoss, enemy.typeId);
  // Heatmap
  if (MF.heatmap_record) MF.heatmap_record(enemy.pos.x, enemy.pos.z);
  // Quests + daily kill tracking already done above via daily_addProgress
  if (MF.quests_addProgress) MF.quests_addProgress('kills', 1);
  // P10: friendship pair tracking
  if (MF.friendship_recordKill) MF.friendship_recordKill();
  // P11: haptic on kill
  if (MF.haptic_tap) MF.haptic_tap(enemy.isBoss ? 'heavy' : 'light');
  // P10: replay event
  if (MF.replay_record) MF.replay_record('kill', { x: enemy.pos.x, z: enemy.pos.z, boss: enemy.isBoss });
  // P10: daily target tracking
  if (MF.daily_target_progress) MF.daily_target_progress('kills', 1);
  MF.removeEnemy(enemy);
};

MF.applyStatus = function(enemy, status){
  if (!enemy || !enemy.alive || !status) return;
  if (status.type === 'slow'){
    enemy.statuses.slow = Math.max(enemy.statuses.slow, status.dur || 1.5);
    enemy.statuses.slowMult = Math.min(enemy.statuses.slowMult, status.mult || 0.6);
  } else if (status.type === 'burn'){
    enemy.statuses.burn = Math.max(enemy.statuses.burn, status.dur || 2);
    enemy.statuses.burnDps = Math.max(enemy.statuses.burnDps, (status.dps || 0.2) * enemy.maxHp / 4);
  } else if (status.type === 'stun'){
    if (Math.random() < (status.chance || 1))
      enemy.statuses.stun = Math.max(enemy.statuses.stun, status.dur || 0.3);
  }
};

MF.updateEnemies = function(dt){
  var isChaos = MF.state.mode === 'chaos';
  if (!isChaos && !MF.grid.pathLength) return;
  for (var i = MF.enemies.length - 1; i >= 0; i--){
    var e = MF.enemies[i];
    if (!e.alive) continue;
    // Chaos enemies use linear movement toward fortress
    if (e.chaos && MF.chaos_updateEnemy){
      MF.chaos_updateEnemy(e, dt);
      // Burn DoT + HP bar billboard for chaos enemies
      if (e.statuses.burn > 0){
        e.statuses.burn -= dt;
        e.hp -= e.statuses.burnDps * dt;
        if (e.hp <= 0){ MF.killEnemy(e); continue; }
        var hpFgC = e.mesh.userData.hpFg;
        if (hpFgC){
          var pctC = Math.max(0, e.hp / e.maxHp);
          hpFgC.scale.x = pctC;
          hpFgC.position.x = -(1 - pctC) * e.mesh.userData.hpFgWidth / 2;
        }
      }
      if (e.mesh.userData.hpFg){
        e.mesh.userData.hpFg.lookAt(MF.three.camera.position);
        e.mesh.userData.hpBg.lookAt(MF.three.camera.position);
      }
      // Boss aura pulse
      if (e.isBoss && e.mesh.userData.aura){
        e.mesh.userData.aura.scale.setScalar(1 + Math.sin(MF._t * 3 + e.eid) * 0.08);
        e.mesh.userData.aura.material.opacity = 0.18 + Math.sin(MF._t * 4 + e.eid) * 0.07;
      }
      // Wing flap
      if (e.mesh.userData.wings){
        e.mesh.userData.wings.forEach(function(w, idx){
          w.rotation.z = Math.sin(MF._t * 22 + e.eid) * 0.5 * (idx ? 1 : -1);
        });
      }
      // Breathing
      e.breatheT += dt * 1.2;
      var brC = 1 + Math.sin(e.breatheT) * 0.025;
      e.mesh.scale.set(1, brC, 1);
      continue;
    }
    if (e.statuses.stun > 0){
      e.statuses.stun -= dt;
    } else {
      var spd = e.baseSpeed;
      if (e.statuses.slow > 0){
        e.statuses.slow -= dt;
        spd *= e.statuses.slowMult;
        if (e.statuses.slow <= 0){ e.statuses.slow = 0; e.statuses.slowMult = 1; }
      }
      e.pathT += (spd / MF.grid.pathLength) * dt;
      var p = MF.pathPositionAt(e.pathT);
      e.pos.set(p.x, e.flying ? 1.2 + Math.sin(MF._t * 2 + e.eid) * 0.14 : 0, p.z);
      e.mesh.position.copy(e.pos);
      if (e.pathT < 1){
        var p2 = MF.pathPositionAt(Math.min(1, e.pathT + 0.005));
        var dx = p2.x - p.x, dz = p2.z - p.z;
        e.mesh.rotation.y = Math.atan2(dx, dz);
      }
      // Wing flap for flying
      if (e.mesh.userData.wings){
        e.mesh.userData.wings.forEach(function(w, idx){
          w.rotation.z = Math.sin(MF._t * 22 + e.eid) * 0.5 * (idx ? 1 : -1);
        });
      }
      // Boss aura pulse
      if (e.isBoss && e.mesh.userData.aura){
        e.mesh.userData.aura.scale.setScalar(1 + Math.sin(MF._t * 3 + e.eid) * 0.08);
        e.mesh.userData.aura.material.opacity = 0.18 + Math.sin(MF._t * 4 + e.eid) * 0.07;
      }
      // Subtle breathing
      e.breatheT += dt * 1.2;
      var br = 1 + Math.sin(e.breatheT) * 0.025;
      e.mesh.scale.set(1, br, 1);
    }
    // Burn DoT
    if (e.statuses.burn > 0){
      e.statuses.burn -= dt;
      e.hp -= e.statuses.burnDps * dt;
      if (e.hp <= 0){ MF.killEnemy(e); continue; }
      var hpFg = e.mesh.userData.hpFg;
      if (hpFg){
        var pct = Math.max(0, e.hp / e.maxHp);
        hpFg.scale.x = pct;
        hpFg.position.x = -(1 - pct) * e.mesh.userData.hpFgWidth / 2;
      }
    }
    if (e.mesh.userData.hpFg){
      e.mesh.userData.hpFg.lookAt(MF.three.camera.position);
      e.mesh.userData.hpBg.lookAt(MF.three.camera.position);
    }
    if (e.pathT >= 1){
      MF.state.fortressHP -= e.fortressDmg;
      MF.fx.shake(0.5, 0.4);
      MF.fx.floatingDmg(MF.grid.fortressPos, '-' + e.fortressDmg, 'crit');
      MF.fx.spawnBurst(MF.grid.fortressPos, 0xff3030, 14, { speed: 4.5 });
      MF.flashLight(MF.grid.fortressPos, 0xff3030, 2.5, 6, 0.3);
      MF.removeEnemy(e);
      if (MF.state.fortressHP <= 0){
        MF.state.fortressHP = 0;
        MF.state.outcome = 'lose';
      }
    }
  }
};
