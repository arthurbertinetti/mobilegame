// === P13 — Custom hero abilities ===
window.MF = window.MF || {};

// Berserker rage stack — increment on kill
MF.ability_onKill = function(unit){
  if (!unit || !MF.UNITS[unit.id]) return;
  if (unit.id === 'berserker'){
    unit.rageStacks = Math.min(10, (unit.rageStacks || 0) + 1);
    if (MF.fx && MF.fx.spawnRing && unit.rageStacks <= 10){
      MF.fx.spawnRing(unit.pos, 0xff5040, { scale: 0.5 + unit.rageStacks * 0.06, life: 0.25 });
    }
  }
};

// Sniper charge shot — apply ×3 dmg + pierce on every Nth shot
MF.ability_onFire = function(unit){
  if (!unit || !MF.UNITS[unit.id]) return null;
  if (unit.id === 'sniper'){
    unit.shotCounter = (unit.shotCounter || 0) + 1;
    if (unit.shotCounter % 4 === 0){
      // Charge shot
      if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(unit.pos, 0x80f0a0, { scale: 2, life: 0.4 });
      return { dmgMult: 3, forcePierce: true };
    }
  }
  return null;
};

// Time Mage slow aura — periodic tick (called from ui update or separate)
MF.ability_tickAuras = function(dt){
  if (!MF.units || !MF.units.length) return;
  for (var i = 0; i < MF.units.length; i++){
    var u = MF.units[i];
    if (!u || !MF.UNITS[u.id]) continue;
    var data = MF.UNITS[u.id];
    if (!data.ability) continue;
    // Time Mage slow aura — clamped to 30% min speed
    if (data.ability.type === 'slow_aura'){
      var range = data.ability.range || 3.5;
      for (var j = 0; j < MF.enemies.length; j++){
        var e = MF.enemies[j];
        if (!e || !e.alive) continue;
        var dx = e.pos.x - u.pos.x, dz = e.pos.z - u.pos.z;
        if (dx * dx + dz * dz <= range * range){
          if (MF.applyStatus) MF.applyStatus(e, { type:'slow', dur: 0.5, mult: data.ability.slowMult || 0.80 });
          // Clamp final slowMult to 30% min (prevents stack-locking enemies)
          if (e.statuses && e.statuses.slowMult < 0.30) e.statuses.slowMult = 0.30;
        }
      }
    }
    // Bard war song aura — buff allied heroes (no stack: tag them with the buff)
    if (data.ability.type === 'war_song'){
      var rangeWS = data.ability.range || 3.0;
      for (var k = 0; k < MF.units.length; k++){
        var ally = MF.units[k];
        if (!ally || ally === u) continue;
        if (!MF.UNITS[ally.id] || MF.UNITS[ally.id].kind !== 'hero') continue;
        var ax = ally.pos.x - u.pos.x, az = ally.pos.z - u.pos.z;
        if (ax * ax + az * az <= rangeWS * rangeWS){
          ally._warSongBuff = data.ability.dmgBuff || 1.15;
          ally._warSongT = 0.5;
        }
      }
    }
    // Summoner spectral wolves
    if (data.ability.type === 'summon_wolves'){
      u._summonT = (u._summonT || 0) + dt;
      if (u._summonT >= (data.ability.interval || 8)){
        u._summonT = 0;
        MF.ability_summonWolves(u, data.ability);
      }
    }
  }
  // Decay war song buffs
  for (var w = 0; w < MF.units.length; w++){
    var wu = MF.units[w];
    if (wu && wu._warSongT){
      wu._warSongT -= dt;
      if (wu._warSongT <= 0){ wu._warSongBuff = null; wu._warSongT = 0; }
    }
  }
};

MF.ability_summonWolves = function(unit, abil){
  if (typeof THREE === 'undefined') return;
  var count = abil.count || 2;
  var dur = abil.dur || 4;
  for (var i = 0; i < count; i++){
    var wolf = MF.ability_buildWolf();
    var ang = (i / count) * Math.PI * 2;
    wolf.position.set(unit.pos.x + Math.cos(ang) * 0.6, 0.2, unit.pos.z + Math.sin(ang) * 0.6);
    MF.three.worldGroup.add(wolf);
    var w = {
      mesh: wolf, pos: wolf.position, ttl: dur,
      target: null, dmg: 30 * (unit.rank || 1),
      hitT: 0,
      ownerUnit: unit
    };
    MF._wolves = MF._wolves || [];
    MF._wolves.push(w);
  }
  if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(unit.pos, 0xa0c0ff, { scale: 2, life: 0.4 });
  if (MF.audio && MF.audio.ultCast) MF.audio.ultCast();
};

MF.ability_buildWolf = function(){
  var g = new THREE.Group();
  var bodyMat = new THREE.MeshStandardMaterial({ color: 0xa0c0ff, transparent: true, opacity: 0.85, emissive: 0x4080c0, emissiveIntensity: 0.4 });
  var body = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.20, 0.55), bodyMat);
  body.position.y = 0.18;
  g.add(body);
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), bodyMat);
  head.position.set(0, 0.30, 0.30);
  g.add(head);
  // Eyes
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (var s = -1; s <= 1; s += 2){
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), eyeMat);
    eye.position.set(s * 0.06, 0.32, 0.40);
    g.add(eye);
  }
  // Tail
  var tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 6), bodyMat);
  tail.position.set(0, 0.20, -0.32);
  tail.rotation.x = -Math.PI / 4;
  g.add(tail);
  // Glow halo
  var halo = new THREE.Mesh(new THREE.SphereGeometry(0.40, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xa0c0ff, transparent: true, opacity: 0.20, depthWrite: false }));
  halo.position.y = 0.20;
  g.add(halo);
  return g;
};

MF.ability_updateWolves = function(dt){
  if (!MF._wolves || !MF._wolves.length) return;
  for (var i = MF._wolves.length - 1; i >= 0; i--){
    var w = MF._wolves[i];
    w.ttl -= dt;
    if (w.ttl <= 0){
      // Discreet howl + fade
      if (!w._dying){
        w._dying = true;
        if (MF.audio && MF.audio.wolfHowl) MF.audio.wolfHowl();
        if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(w.pos, 0xa0c0ff, { scale: 1.5, life: 0.3 });
      }
      // Fade out over 0.4s
      w._fadeT = (w._fadeT || 0) + dt;
      if (w.mesh){
        w.mesh.traverse(function(m){
          if (m.material && m.material.opacity != null){
            m.material.transparent = true;
            m.material.opacity = Math.max(0, 1 - w._fadeT / 0.4);
          }
        });
        w.mesh.scale.multiplyScalar(1 + dt * 0.4);
      }
      if (w._fadeT >= 0.4){
        MF.three.worldGroup.remove(w.mesh);
        if (MF._disposeMesh) MF._disposeMesh(w.mesh);
        MF._wolves.splice(i, 1);
      }
      continue;
    }
    // Pick closest enemy if no target
    if (!w.target || !w.target.alive){
      w.target = MF.findClosestEnemy(w.pos, 6, true);
    }
    if (w.target){
      var dx = w.target.pos.x - w.pos.x, dz = w.target.pos.z - w.pos.z;
      var d = Math.sqrt(dx * dx + dz * dz) || 1;
      // Move toward target
      var spd = 4;
      w.pos.x += (dx / d) * spd * dt;
      w.pos.z += (dz / d) * spd * dt;
      w.mesh.rotation.y = Math.atan2(dx, dz);
      // Hit target if close
      if (d < 0.6){
        w.hitT -= dt;
        if (w.hitT <= 0){
          w.hitT = 0.4;
          if (MF.dealDamage) MF.dealDamage(w.target, w.dmg, 'normal', w.ownerUnit);
        }
      }
    }
    // Animate body bob
    w.mesh.position.y = 0.05 + Math.sin((MF._t || 0) * 8 + w.pos.x) * 0.04;
  }
};

MF.ability_clearWolves = function(){
  if (!MF._wolves) return;
  for (var i = 0; i < MF._wolves.length; i++){
    MF.three.worldGroup.remove(MF._wolves[i].mesh);
    if (MF._disposeMesh) MF._disposeMesh(MF._wolves[i].mesh);
  }
  MF._wolves = [];
};
