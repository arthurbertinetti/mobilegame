// === Merge Fortress TD — Combat: projectiles, splash, chain ===
window.MF = window.MF || {};

MF.projectiles = [];

MF.fireProjectile = function(unit, enemy){
  if (!unit || !enemy || !enemy.alive) return;
  var data = MF.UNITS[unit.id];
  var atk = data.attack;
  var rdata = data.ranks[unit.rank - 1];
  // Roguelite damage roll (multipliers + crit)
  var rl = MF.rl_computeDamage ? MF.rl_computeDamage(unit, rdata.dmg) : { dmg: rdata.dmg, isCrit: false };
  var dmg = rl.dmg;
  var isCrit = rl.isCrit;
  // P13 ability hooks (sniper charge shot, etc.)
  var abilFire = MF.ability_onFire ? MF.ability_onFire(unit) : null;
  var forcePierce = false;
  if (abilFire){
    if (abilFire.dmgMult) dmg *= abilFire.dmgMult;
    if (abilFire.forcePierce) forcePierce = true;
  }
  // P13 war song buff
  if (unit._warSongBuff) dmg *= unit._warSongBuff;

  var startPos = unit.pos.clone();
  startPos.y = 0.5 + (unit.rank - 1) * 0.05;
  var endPos = enemy.pos.clone();

  // Build projectile mesh
  var projColor = atk.projColor || 0xffffff;
  var geo, mat, mesh;

  if (atk.type === 'pierce'){
    // Long arrow / beam
    geo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
    mat = new THREE.MeshBasicMaterial({ color: projColor });
    mesh = new THREE.Mesh(geo, mat);
  } else if (atk.type === 'chain'){
    // Sphere of energy
    geo = new THREE.SphereGeometry(0.14, 10, 8);
    mat = new THREE.MeshBasicMaterial({ color: projColor });
    mesh = new THREE.Mesh(geo, mat);
  } else if (unit.id === 'bomb' || unit.id === 'cannon'){
    // Bomb / cannonball
    geo = new THREE.SphereGeometry(0.16, 12, 10);
    mat = new THREE.MeshLambertMaterial({ color: projColor });
    mesh = new THREE.Mesh(geo, mat);
  } else if (unit.id === 'fire'){
    geo = new THREE.SphereGeometry(0.18, 10, 8);
    mat = new THREE.MeshBasicMaterial({ color: projColor });
    mesh = new THREE.Mesh(geo, mat);
  } else {
    // Generic ball
    geo = new THREE.SphereGeometry(0.11, 10, 8);
    mat = new THREE.MeshBasicMaterial({ color: projColor });
    mesh = new THREE.Mesh(geo, mat);
  }
  mesh.position.copy(startPos);
  MF.three.fxGroup.add(mesh);

  var p = {
    mesh: mesh, mat: mat, geo: geo,
    pos: startPos.clone(),
    target: enemy,
    targetId: enemy.eid,
    speed: atk.projSpeed || 18,
    dmg: dmg,
    atk: atk,
    unit: unit,
    arc: (unit.id === 'bomb' || unit.id === 'cannon') ? 1 : 0,
    flightTime: 0,
    isCrit: isCrit,
    pierceLeft: (MF.run && MF.run.flags.projectilePierce) ? MF.run.flags.projectilePierce : 0
  };
  // Compute initial flight time
  p.totalDist = startPos.distanceTo(endPos);
  p.duration = p.totalDist / p.speed;
  p.elapsed = 0;
  p.startPos = startPos.clone();

  // For chain projectiles, store remaining bounces (+roguelite teslaExtraChain)
  if (atk.type === 'chain'){
    var extra = (MF.run && MF.run.flags.teslaExtraChain) ? MF.run.flags.teslaExtraChain : 0;
    p.chainsLeft = (atk.chainCount || 3) - 1 + extra;
    p.hitSet = {};
  }

  MF.projectiles.push(p);

  // Double projectile flag → fire a second one with slight offset (only for archer/ballista)
  if (MF.run && MF.run.flags.doubleProjectile && (unit.id === 'archer' || unit.id === 'ballista')){
    if (!unit._suppressDouble){
      unit._suppressDouble = true;     // prevent infinite recursion
      // Find another close-by enemy
      var second = null;
      for (var i = 0; i < MF.enemies.length; i++){
        var e2 = MF.enemies[i];
        if (e2 === enemy || !e2.alive) continue;
        if (e2.flying && atk.hitsFlying === false) continue;
        if (e2.pos.distanceTo(unit.pos) <= (atk.range || 4) * 1.5){ second = e2; break; }
      }
      if (second) MF.fireProjectile(unit, second);
      unit._suppressDouble = false;
    }
  }
};

MF.updateProjectiles = function(dt){
  for (var i = MF.projectiles.length - 1; i >= 0; i--){
    var p = MF.projectiles[i];
    p.elapsed += dt;

    // If target dies mid-flight, find a new one if possible (especially for chain)
    if (!p.target || !p.target.alive){
      // For homing-like behaviour, splash/chain just impact at last known
      if (p.atk.type === 'splash'){
        MF._impactSplash(p, p.pos.clone());
        MF._destroyProjectile(p, i);
        continue;
      }
      if (p.atk.type === 'chain'){
        var n = MF.findClosestEnemy(p.pos, (p.atk.chainRadius || 2.5), p.atk.hitsFlying !== false);
        if (n && !p.hitSet[n.eid]){ p.target = n; p.hitSet[n.eid] = true; }
        else { MF._destroyProjectile(p, i); continue; }
      }
      if (p.atk.type === 'pierce'){
        // Continue along same direction but cap range
        // Just destroy when out of life
        if (p.elapsed > 0.7){ MF._destroyProjectile(p, i); continue; }
      }
    }

    // Move
    if (p.target && p.target.alive){
      var k = Math.min(1, p.elapsed / Math.max(0.05, p.duration));
      var endP = p.target.pos.clone();
      var x = p.startPos.x + (endP.x - p.startPos.x) * k;
      var z = p.startPos.z + (endP.z - p.startPos.z) * k;
      var y = p.startPos.y + (endP.y - p.startPos.y) * k;
      // Arc for bombs/cannons
      if (p.arc) y += Math.sin(k * Math.PI) * 1.6;
      p.pos.set(x, y, z);
      p.mesh.position.copy(p.pos);
      // Pierce: orient along direction
      if (p.atk.type === 'pierce'){
        var dir = endP.clone().sub(p.startPos);
        p.mesh.lookAt(endP);
        p.mesh.rotation.x += Math.PI/2;
      }
      if (k >= 1){
        // Impact
        MF._impact(p);
        if (p._continuePierce){
          // Don't destroy: projectile flies to next target
          p._continuePierce = false;
          continue;
        }
        MF._destroyProjectile(p, i);
      }
    } else {
      // Continue flying for short time then expire
      var dirN = p.target ? p.target.pos.clone().sub(p.pos).normalize() : new THREE.Vector3(0,0,1);
      p.pos.addScaledVector(dirN, p.speed * dt);
      p.mesh.position.copy(p.pos);
      if (p.elapsed > p.duration + 0.4){
        MF._destroyProjectile(p, i);
      }
    }
  }
};

MF._destroyProjectile = function(p, idx){
  MF.three.fxGroup.remove(p.mesh);
  if (p.geo) p.geo.dispose();
  if (p.mat) p.mat.dispose();
  if (idx == null) idx = MF.projectiles.indexOf(p);
  if (idx >= 0) MF.projectiles.splice(idx, 1);
};

MF._impact = function(p){
  var atk = p.atk;
  var dmgKind = p.isCrit ? 'crit' : MF._damageKind(p.unit.id);
  // Cannon explodes flag: turn single/splash into bigger AOE
  var cannonExtra = (MF.run && MF.run.flags.cannonExplodes && p.unit.id === 'cannon');
  if (atk.type === 'splash' || cannonExtra){
    var center = (p.target ? p.target.pos.clone() : p.pos.clone());
    if (cannonExtra){
      // Save extra splash radius
      var origR = atk.splashRadius;
      atk.splashRadius = (origR || 1) * 1.6;
      MF._impactSplash(p, center);
      atk.splashRadius = origR;
    } else {
      MF._impactSplash(p, center);
    }
  } else if (atk.type === 'pierce'){
    // Hit target + everyone in line beyond
    MF._impactPierce(p);
  } else if (atk.type === 'chain'){
    if (p.target && p.target.alive){
      MF.dealDamage(p.target, p.dmg, dmgKind);
      if (atk.status) MF.applyStatus(p.target, atk.status);
      if (!p.hitSet) p.hitSet = {};
      p.hitSet[p.target.eid] = true;
      // Visual: thin line
      MF._spawnLightning(p.startPos, p.target.pos, p.atk.projColor);
      // Spawn next chain projectile
      if (p.chainsLeft > 0){
        var next = MF._findChainTarget(p.target.pos, atk.chainRadius || 2.5, p.hitSet, atk.hitsFlying !== false);
        if (next){
          var startPos = p.target.pos.clone();
          var newP = MF._cloneChainProj(p, startPos, next);
          newP.chainsLeft = p.chainsLeft - 1;
          MF.projectiles.push(newP);
        }
      }
    }
  } else {
    // single (with optional pierce)
    if (p.target && p.target.alive){
      MF.dealDamage(p.target, p.dmg, dmgKind);
      if (atk.status) MF.applyStatus(p.target, atk.status);
      MF.fx.spawnBurst(p.target.pos, atk.projColor || 0xffffff, 4, { speed: 2.4, life: 0.35, gravity: -3 });
      // Pierce: continue to another nearby enemy
      if (p.pierceLeft && p.pierceLeft > 0){
        var pierceTarget = MF._findChainTarget(p.target.pos, 2.5, p._pierceSet || (p._pierceSet = {}), atk.hitsFlying !== false);
        if (pierceTarget){
          p._pierceSet[p.target.eid] = true;
          p.pierceLeft -= 1;
          // Reset projectile to fly to next target
          p.startPos = p.pos.clone();
          p.target = pierceTarget;
          p.duration = p.startPos.distanceTo(pierceTarget.pos) / p.speed;
          p.elapsed = 0;
          p.dmg *= 0.85;
          p._continuePierce = true;
        }
      }
    }
  }
};

MF._cloneChainProj = function(p, start, target){
  var geo = new THREE.SphereGeometry(0.14, 10, 8);
  var mat = new THREE.MeshBasicMaterial({ color: p.atk.projColor || 0xfff5a3 });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(start);
  MF.three.fxGroup.add(mesh);
  return {
    mesh: mesh, mat: mat, geo: geo,
    pos: start.clone(),
    target: target,
    targetId: target.eid,
    speed: p.speed,
    dmg: p.dmg * 0.85,
    atk: p.atk,
    unit: p.unit,
    arc: 0,
    elapsed: 0,
    duration: start.distanceTo(target.pos) / p.speed,
    startPos: start.clone(),
    hitSet: Object.assign({}, p.hitSet)
  };
};

MF._impactSplash = function(p, center){
  var atk = p.atk;
  var dmgKind = MF._damageKind(p.unit.id);
  var radius = (atk.splashRadius || 1) * (1 + (p.unit.rank - 1) * 0.05);
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e.alive) continue;
    if (e.flying && atk.hitsFlying === false) continue;
    var d = e.pos.distanceTo(center);
    if (d <= radius){
      // Falloff
      var falloff = 1 - (d / radius) * 0.4;
      MF.dealDamage(e, p.dmg * falloff, dmgKind);
      if (atk.status) MF.applyStatus(e, atk.status);
    }
  }
  MF.fx.spawnRing(center, atk.projColor || 0xffd96a, { scale: radius * 1.6, life: 0.45 });
  MF.fx.spawnBurst(center, atk.projColor || 0xffd96a, 14, { speed: radius * 3.5, life: 0.6 });
  if (radius > 1.4) MF.fx.shake(0.18, 0.18);
};

MF._impactPierce = function(p){
  var atk = p.atk;
  var dmgKind = MF._damageKind(p.unit.id);
  // Define line: from unit.pos through target.pos extended to range
  var origin = p.unit.pos.clone();
  var dir = (p.target ? p.target.pos.clone().sub(origin) : new THREE.Vector3(0,0,1)).normalize();
  var range = atk.range || 4;
  var maxLen = range + 1;
  var endP = origin.clone().add(dir.clone().multiplyScalar(maxLen));

  var dmg = p.dmg;
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e.alive) continue;
    if (e.flying && atk.hitsFlying === false) continue;
    var v = e.pos.clone().sub(origin);
    var t = v.dot(dir);
    if (t < 0 || t > maxLen) continue;
    var perp = v.sub(dir.clone().multiplyScalar(t)).length();
    if (perp <= 0.5){
      MF.dealDamage(e, dmg, dmgKind);
      if (atk.status) MF.applyStatus(e, atk.status);
      dmg *= 0.85; // each successive hit slightly weaker
    }
  }
  // Visual ray flash
  MF._spawnLightning(origin, endP, atk.projColor || 0xffd96a, 0.18);
};

MF._spawnLightning = function(a, b, color, life){
  var dir = b.clone().sub(a);
  var len = dir.length();
  if (len < 0.05) return;
  var geo = new THREE.CylinderGeometry(0.045, 0.045, len, 6);
  var mat = new THREE.MeshBasicMaterial({ color: color || 0xfff5a3, transparent: true, opacity: 0.85 });
  var m = new THREE.Mesh(geo, mat);
  // Position at midpoint
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.lookAt(b);
  m.rotation.x += Math.PI/2;
  MF.three.fxGroup.add(m);
  MF.fx.particles.push({
    mesh: m, mat: mat,
    vx:0, vy:0, vz:0,
    life: 0, maxLife: life || 0.13,
    isRing: false,
    gravity: 0
  });
};

MF._findChainTarget = function(pos, radius, hitSet, includeFlying){
  var best = null, bestD = radius;
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e.alive) continue;
    if (hitSet && hitSet[e.eid]) continue;
    if (e.flying && !includeFlying) continue;
    var d = e.pos.distanceTo(pos);
    if (d < bestD){ bestD = d; best = e; }
  }
  return best;
};

MF._damageKind = function(unitId){
  if (unitId === 'ice' || unitId === 'frost') return 'frost';
  if (unitId === 'fire' || unitId === 'dragon' || unitId === 'bomb' || unitId === 'cannon') return 'fire';
  if (unitId === 'tesla') return 'lightning';
  return null;
};

MF.clearProjectiles = function(){
  for (var i = MF.projectiles.length - 1; i >= 0; i--){
    MF._destroyProjectile(MF.projectiles[i], i);
  }
  MF.projectiles = [];
};
