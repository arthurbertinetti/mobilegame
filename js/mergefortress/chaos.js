// === Merge Fortress TD — Chaos Survival Mode (logic) ===
// Open arena, radial spawning, auras tick, single equipped ultimate, combo.
window.MF = window.MF || {};

MF.chaos = {
  active: false,
  time: 0,                // total elapsed time (s)
  nextSpawnT: 0,          // next horde spawn time
  spawnInterval: 1.6,     // shrinks over time
  density: 1.0,           // multiplier for hp/spd/count, grows with time
  kills: 0,
  combo: 0,
  comboT: 0,              // time left before combo resets
  comboMax: 2.0,
  // Equipped ultimate
  ultId: null,
  ultData: null,
  ultCharge: 0,           // 0..1
  ultCooldown: 30,
  // Boss timer
  nextBossT: 90,          // first boss at 1m30
  bossesSpawned: 0
};

// === ENTRY POINT — call after ultimate selection ===
// === AI difficulty scaling — analyse player perf and tune density/hp ===
MF.chaos_aiAdjust = function(){
  var killsNow = MF.chaos.kills;
  var lastK = MF.chaos._aiLastKills || 0;
  var killsDelta = killsNow - lastK;
  MF.chaos._aiLastKills = killsNow;
  // Expected kills in 15s based on time minute
  var minute = MF.chaos.time / 60;
  var expectedKills = (8 + minute * 4);     // rough baseline
  var ratio = killsDelta / Math.max(1, expectedKills);
  // adaptiveMult tunes spawn count + hp multiplier
  if (!MF.chaos._adapt){ MF.chaos._adapt = 1.0; }
  if (ratio > 1.6){
    // Player crushing — push harder
    MF.chaos._adapt = Math.min(2.5, MF.chaos._adapt * 1.15);
  } else if (ratio < 0.5){
    // Player struggling — back off
    MF.chaos._adapt = Math.max(0.6, MF.chaos._adapt * 0.92);
  } else {
    // drift toward 1
    MF.chaos._adapt += (1 - MF.chaos._adapt) * 0.1;
  }
};

// === Roll 1-2 random modifiers for the chaos run ===
MF.chaos_rollModifiers = function(){
  if (!MF.CHAOS_MODIFIERS) return [];
  var ids = Object.keys(MF.CHAOS_MODIFIERS);
  // Use chaos rng (deterministic for daily mode)
  var rng = MF.chaos_rng || Math.random;
  // Shuffle
  ids.sort(function(){ return rng() - 0.5; });
  var n = 1 + (rng() < 0.45 ? 1 : 0);          // 1-2 modifiers
  var picked = ids.slice(0, n).map(function(id){ return MF.CHAOS_MODIFIERS[id]; });
  // Apply effects to MF.run
  MF.run = MF.run || {};
  picked.forEach(function(m){
    if (!m.effects) return;
    m.effects.forEach(function(eff){
      if (eff.type === 'flag') MF.run[eff.target] = eff.value;
      if (eff.type === 'enemySpdMult') MF.run.enemySpdMult = (MF.run.enemySpdMult || 1) * eff.value;
    });
  });
  return picked;
};

// === Seeded RNG (Mulberry32) for daily mode ===
MF.chaos_rng = function(){
  if (!MF.chaos.daily || !MF.chaos.seed){
    return Math.random();
  }
  // Mutate state
  MF.chaos.seedState = (MF.chaos.seedState + 0x6D2B79F5) >>> 0;
  var t = MF.chaos.seedState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

MF.chaos_dailySeed = function(){
  // YYYYMMDD as int seed
  var d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

MF.chaos_dailyKey = function(){
  return String(MF.chaos_dailySeed());
};

MF.startChaosRun = function(ultimateId, variant){
  // Reset chaos state
  if (MF.chaos_clearBullets) MF.chaos_clearBullets();
  if (MF.chaos_clearDrops) MF.chaos_clearDrops();
  // Stats tracking
  MF.chaos.stats = {
    killsBuckets: [],         // kills per 30s window
    bossTimes: [],            // seconds at which bosses spawned
    ultCasts: 0,
    maxCombo: 0,
    dropsCollected: 0,
    bucketWindow: 30
  };
  MF.chaos.variant = variant || 'normal';
  MF.chaos.daily = (variant === 'daily');
  if (MF.chaos.daily){
    MF.chaos.variant = 'normal';
    MF.chaos.seed = MF.chaos_dailySeed();
    MF.chaos.seedState = MF.chaos.seed;
  } else if (MF._sharedSeed){
    // Custom shared seed via code
    MF.chaos.daily = true;       // reuse deterministic path
    MF.chaos.seed = MF._sharedSeed;
    MF.chaos.seedState = MF._sharedSeed;
    MF.chaos.shared = true;
    MF._sharedSeed = null;
  } else {
    MF.chaos.seed = 0;
    MF.chaos.seedState = 0;
    MF.chaos.shared = false;
  }
  MF.chaos.active = true;
  MF.chaos.time = 0;
  MF.chaos.nextSpawnT = 1.5;
  MF.chaos.spawnInterval = 1.6;
  MF.chaos.density = 1.0;
  MF.chaos.kills = 0;
  MF.chaos.combo = 0;
  MF.chaos.comboT = 0;
  MF.chaos.ultId = ultimateId;
  MF.chaos.ultData = MF.ULTIMATES[ultimateId];
  MF.chaos.ultCharge = 0;
  MF.chaos.ultCooldown = MF.chaos.ultData ? MF.chaos.ultData.cooldown : 30;
  MF.chaos.nextBossT = 90;
  MF.chaos.bossesSpawned = 0;

  // Use endless world for theme
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = {
    name: 'Chaos',
    waves: [],
    waveCount: 9999,
    fortressHP: 30, startGold: 200,
    isFinalLevel: false,
    rewardGold: 0, rewardStars: 0,
    isChaos: true
  };
  // Adjust level based on variant
  if (MF.chaos.variant === 'hardcore'){
    level.fortressHP = 1;
  } else if (MF.chaos.variant === 'solo'){
    // No synergies/auras
    level.startGold = 300;
    MF.chaos.solo = true;
  } else if (MF.chaos.variant === 'apocalypse'){
    level.fortressHP = 1;
    MF.chaos.density = 2.0;
    MF.chaos.nextBossT = 60;
    MF.chaos.apocalypse = true;
  }

  // Roll random map modifiers (1-2 active per run, daily uses seed)
  MF.chaos.activeModifiers = MF.chaos_rollModifiers();
  // Apply mapSmall before grid build
  var smallMod = MF.chaos.activeModifiers.find(function(m){ return m.effects && m.effects.some(function(e){ return e.target === 'mapSmall'; }); });
  if (smallMod){
    MF.chaos._mapSmall = true;
  } else {
    MF.chaos._mapSmall = false;
  }

  MF._startMatch(world, level, 'chaos');

  // Apply persistent chaos rewards
  MF.chaos_applyRewards();

  // Apply variant runtime flags
  MF.run = MF.run || {};
  if (MF.chaos.variant === 'solo'){
    MF.run.solo = true;
  }
  if (MF.chaos.variant === 'speedrun'){
    MF.chaos.speedrunCap = 300;   // 5 min cap
  } else {
    MF.chaos.speedrunCap = 0;
  }

  // Banner
  setTimeout(function(){
    MF.fx.showBanner('🌪️ CHAOS — ' + (MF.chaos.ultData ? MF.chaos.ultData.icon + ' ' + MF.chaos.ultData.name : 'Survis'), 'wave');
  }, 200);
  // Active modifiers banner
  if (MF.chaos.activeModifiers && MF.chaos.activeModifiers.length){
    setTimeout(function(){
      var txt = MF.chaos.activeModifiers.map(function(m){ return m.icon + ' ' + m.name; }).join('  •  ');
      MF.fx.showBanner('⚙ ' + txt, 'wave');
    }, 1700);
  }

  // Tutorial on first chaos run
  if (MF.state.meta && !MF.state.meta.chaosTutorialDone && MF.ui.startChaosTutorial){
    setTimeout(function(){ MF.ui.startChaosTutorial(); }, 600);
  }
};

MF.chaos_applyRewards = function(){
  var meta = MF.state.meta;
  if (!meta || !meta.chaosRewards) return;
  var owned = meta.chaosRewards;
  MF.run = MF.run || {};
  // starter_aura: heroes start with mini fire aura at R1+
  if (owned.starter_aura) MF.run.chaosStarterAura = true;
  // extra_orb_slot: P2 orbiter system uses this — flag for later expansion
  if (owned.extra_orb_slot) MF.run.extraOrbSlot = true;
  // combo_extender: combo persists 3.5s instead of 2s
  if (owned.combo_extender) MF.chaos.comboMax = 3.5;
  // ultimate_x2: ult charges 2× faster
  if (owned.ultimate_x2) MF.run.ultimateChargeMult = (MF.run.ultimateChargeMult || 1) * 2;
  // fortress_shield: +15 max HP
  if (owned.fortress_shield){
    MF.state.fortressMaxHP += 15;
    MF.state.fortressHP    += 15;
  }
  // bigger_aura: +30% aura range
  if (owned.bigger_aura) MF.run.auraRangeMult = (MF.run.auraRangeMult || 1) * 1.3;
  // apocalypse: extra hybrid recipes unlocked at 30 min (visual cue only — recipes always defined)
  if (owned.apocalypse) MF.run.apocalypseUnlocked = true;
};

// === MAIN UPDATE — called from MF.update each frame in chaos mode ===
MF.chaos_update = function(dt){
  if (!MF.chaos.active) return;
  if (MF.state.outcome) return;

  MF.chaos.time += dt;
  // Speedrun variant: end at cap (treated as victory)
  if (MF.chaos.speedrunCap && MF.chaos.time >= MF.chaos.speedrunCap){
    MF.state.outcome = 'win';
    return;
  }
  // === AI difficulty scaling — adapts every 15s ===
  MF.chaos._aiT = (MF.chaos._aiT || 0) + dt;
  if (MF.chaos._aiT >= 15){
    MF.chaos._aiT = 0;
    MF.chaos_aiAdjust();
  }

  // Combo tick
  if (MF.chaos.comboT > 0){
    MF.chaos.comboT -= dt;
    if (MF.chaos.comboT <= 0){ MF.chaos.combo = 0; }
  }

  // Density scaling: grows ~linearly per minute
  MF.chaos.density = 1.0 + MF.chaos.time / 60 * 0.55;
  // Spawn interval shrinks (clamped)
  MF.chaos.spawnInterval = Math.max(0.35, 1.6 - MF.chaos.time / 90);

  // Spawn hordes
  if (MF.chaos.time >= MF.chaos.nextSpawnT){
    MF.chaos_spawnHorde();
    MF.chaos.nextSpawnT = MF.chaos.time + MF.chaos.spawnInterval;
  }

  // Boss spawn
  if (MF.chaos.time >= MF.chaos.nextBossT){
    MF.chaos_spawnBoss();
    MF.chaos.bossesSpawned++;
    // Next boss interval — apocalypse = 60s flat, others shrink
    var gap = MF.chaos.apocalypse ? 60 : Math.max(60, 120 - MF.chaos.bossesSpawned * 8);
    MF.chaos.nextBossT = MF.chaos.time + gap;
  }

  // Auras tick (passive DPS around heroes)
  MF.chaos_tickAuras(dt);

  // Boss bullet-hell tick
  MF.chaos_tickBossBullets(dt);

  // Update flying boss bullets
  MF.chaos_updateBullets(dt);

  // Update legendary drops on the field
  MF.chaos_updateDrops(dt);

  // P11 Dimensions check
  if (MF.dimensions_check) MF.dimensions_check();
};

// Boss bullets: list of {pos, vel, ttl, dmg, mesh}
MF.chaos_bullets = MF.chaos_bullets || [];

MF.chaos_tickBossBullets = function(dt){
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e || !e.alive || !e.isBoss) continue;
    e.bossFireT = (e.bossFireT == null ? 1.5 : e.bossFireT) - dt;
    if (e.bossFireT <= 0){
      e.bossFireT = 3.5 + Math.random() * 1.5;
      MF.chaos_bossFire(e);
    }
  }
};

MF.chaos_bossFire = function(boss){
  // Pattern: alternate between radial burst (12 bullets) and aimed triple shot
  var pattern = (boss.bossPatternToggle = !boss.bossPatternToggle) ? 'radial' : 'aimed';
  var fortress = MF.grid.fortressPos;
  if (pattern === 'radial'){
    var n = 12;
    for (var i = 0; i < n; i++){
      var a = (i / n) * Math.PI * 2;
      MF.chaos_spawnBullet(boss.pos.x, boss.pos.z, Math.cos(a) * 5.5, Math.sin(a) * 5.5, 4, 0xff5050);
    }
    MF.flashLight(boss.pos, 0xff5050, 3, 5, 0.18);
  } else {
    if (!fortress) return;
    var dx = fortress.x - boss.pos.x, dz = fortress.z - boss.pos.z;
    var d = Math.sqrt(dx*dx + dz*dz) || 1;
    var nx = dx / d, nz = dz / d;
    // 3 bullets in a slight spread
    for (var j = -1; j <= 1; j++){
      var ang = Math.atan2(nz, nx) + j * 0.18;
      MF.chaos_spawnBullet(boss.pos.x, boss.pos.z, Math.cos(ang) * 8, Math.sin(ang) * 8, 5, 0xff8030);
    }
  }
};

MF.chaos_spawnBullet = function(x, z, vx, vz, dmg, color){
  var mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 1.6, roughness: 0.3 })
  );
  mesh.position.set(x, 0.55, z);
  // Trailing halo
  var halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 8),
    new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4, depthWrite: false })
  );
  mesh.add(halo);
  MF.three.worldGroup.add(mesh);
  MF.chaos_bullets.push({ pos: mesh.position, vel: { x: vx, z: vz }, ttl: 4.5, dmg: dmg, mesh: mesh });
};

MF.chaos_updateBullets = function(dt){
  if (!MF.chaos_bullets || !MF.chaos_bullets.length) return;
  var fortress = MF.grid.fortressPos;
  for (var i = MF.chaos_bullets.length - 1; i >= 0; i--){
    var b = MF.chaos_bullets[i];
    b.ttl -= dt;
    b.pos.x += b.vel.x * dt;
    b.pos.z += b.vel.z * dt;
    b.mesh.rotation.y += dt * 4;
    var hitFortress = false;
    if (fortress){
      var fx = b.pos.x - fortress.x, fz = b.pos.z - fortress.z;
      if (fx*fx + fz*fz < 1.0) hitFortress = true;
    }
    // Hit a unit (only chaos)? Skip for now: bullets target fortress only
    if (b.ttl <= 0 || hitFortress){
      if (hitFortress && fortress){
        if (!(MF.run && MF.run.fortressInvuln)){
          MF.state.fortressHP -= b.dmg;
          MF.fx.shake(0.35, 0.3);
          MF.fx.floatingDmg(fortress, '-' + b.dmg, 'crit');
          MF.fx.spawnRing(fortress, 0xff5050, { scale: 1.6, life: 0.35 });
          if (MF.state.fortressHP <= 0){
            MF.state.fortressHP = 0;
            MF.state.outcome = 'lose';
          }
        } else {
          MF.fx.spawnRing(fortress, 0x80ffd0, { scale: 1.4, life: 0.25 });
        }
      }
      MF.three.worldGroup.remove(b.mesh);
      if (MF._disposeMesh) MF._disposeMesh(b.mesh);
      MF.chaos_bullets.splice(i, 1);
    }
  }
};

MF.chaos_clearBullets = function(){
  if (!MF.chaos_bullets) return;
  for (var i = 0; i < MF.chaos_bullets.length; i++){
    MF.three.worldGroup.remove(MF.chaos_bullets[i].mesh);
    if (MF._disposeMesh) MF._disposeMesh(MF.chaos_bullets[i].mesh);
  }
  MF.chaos_bullets = [];
};

// === LEGENDARY DROPS ===
MF.chaos_drops = MF.chaos_drops || [];

MF.CHAOS_DROPS = {
  gold:    { id:'gold',    icon:'💰', color:0xffd96a, label:'+50 or' },
  heal:    { id:'heal',    icon:'❤',  color:0xff5060, label:'+3 PV' },
  freeze:  { id:'freeze',  icon:'❄',  color:0x90d0ff, label:'Gel global' },
  fury:    { id:'fury',    icon:'⚡', color:0xfff080, label:'Furie 8s' },
  fragment:{ id:'fragment',icon:'💎', color:0xc070ff, label:'+5 💎' }
};

MF.chaos_tryDrop = function(enemy){
  if (!MF.chaos.active) return;
  var baseChance = 0.015;
  // Stackable bonus from CHAOS_REWARDS (legendary_drops adds +0.01 per stack)
  if (MF.state.meta && MF.state.meta.chaosRewards){
    var lvl = MF.state.meta.chaosRewards.legendary_drops || 0;
    baseChance += lvl * 0.01;
  }
  // Boss drops are guaranteed
  if (enemy.isBoss) baseChance = 1.0;
  if (Math.random() > baseChance) return;
  var ids = Object.keys(MF.CHAOS_DROPS);
  var pick = ids[Math.floor(Math.random() * ids.length)];
  MF.chaos_spawnDrop(enemy.pos.x, enemy.pos.z, pick);
};

MF.chaos_spawnDrop = function(x, z, dropId){
  var def = MF.CHAOS_DROPS[dropId];
  if (!def) return;
  var group = new THREE.Group();
  // Glowing sphere base
  var base = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 10),
    new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 1.3, roughness: 0.2, metalness: 0.6 })
  );
  group.add(base);
  // Halo ring
  var halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.05, 8, 22),
    new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.7, depthWrite: false })
  );
  halo.rotation.x = Math.PI / 2;
  group.add(halo);
  // Outer glow sphere
  var glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 12, 10),
    new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.3, depthWrite: false })
  );
  group.add(glow);
  group.position.set(x, 0.7, z);
  MF.three.worldGroup.add(group);
  MF.fx.spawnRing({ x:x, y:0, z:z }, def.color, { scale: 2, life: 0.4 });
  MF.chaos_drops.push({ pos: group.position, mesh: group, ttl: 8, def: def });
};

MF.chaos_updateDrops = function(dt){
  if (!MF.chaos_drops || !MF.chaos_drops.length) return;
  for (var i = MF.chaos_drops.length - 1; i >= 0; i--){
    var d = MF.chaos_drops[i];
    d.ttl -= dt;
    // Float + spin
    d.pos.y = 0.7 + Math.sin((MF._t || 0) * 3 + i) * 0.08;
    d.mesh.rotation.y += dt * 1.6;
    // Auto-collect after 1s (units near or just timeout proximity)
    var auto = (8 - d.ttl) > 1.0;
    if (auto || d.ttl <= 0){
      MF.chaos_collectDrop(d);
      MF.three.worldGroup.remove(d.mesh);
      if (MF._disposeMesh) MF._disposeMesh(d.mesh);
      MF.chaos_drops.splice(i, 1);
    }
  }
};

MF.chaos_collectDrop = function(drop){
  var def = drop.def;
  var fortress = MF.grid.fortressPos || drop.pos;
  MF.fx.spawnRing(drop.pos, def.color, { scale: 3, life: 0.5 });
  MF.fx.floatingDmg(drop.pos, def.icon + ' ' + def.label, 'gold');
  if (MF.chaos.stats) MF.chaos.stats.dropsCollected++;
  if (MF.daily_addProgress) MF.daily_addProgress('drops', 1);
  if (def.id === 'gold'){
    MF.state.gold += 50;
    MF.state.totalGold += 50;
  } else if (def.id === 'heal'){
    MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + 3);
  } else if (def.id === 'freeze'){
    for (var i = 0; i < MF.enemies.length; i++){
      var e = MF.enemies[i];
      if (!e || !e.alive) continue;
      MF.applyStatus(e, { type:'stun', dur: 3.0, chance: 1 });
      MF.applyStatus(e, { type:'slow', dur: 4.0, mult: 0.4 });
    }
    MF.flashLight(fortress, 0x90d0ff, 4, 12, 0.4);
  } else if (def.id === 'fury'){
    MF.run = MF.run || {};
    MF.run.atkSpeedMult = (MF.run.atkSpeedMult || 1) * 1.5;
    MF.run.furyEndsAt = (MF._t || 0) + 8;
    setTimeout(function(){
      if (MF.run){ MF.run.atkSpeedMult = (MF.run.atkSpeedMult || 1) / 1.5; }
    }, 8000);
  } else if (def.id === 'fragment'){
    if (MF.state.meta) MF.state.meta.fragments += 5;
  }
};

MF.chaos_clearDrops = function(){
  if (!MF.chaos_drops) return;
  for (var i = 0; i < MF.chaos_drops.length; i++){
    MF.three.worldGroup.remove(MF.chaos_drops[i].mesh);
    if (MF._disposeMesh) MF._disposeMesh(MF.chaos_drops[i].mesh);
  }
  MF.chaos_drops = [];
};

// === SPAWN — radial around the arena ===
MF.chaos_spawnHorde = function(){
  // Pool of enemy ids — easier early, harder over time
  var minute = MF.chaos.time / 60;
  var pool;
  if (minute < 1) pool = ['goblin', 'goblin', 'goblin', 'skeleton'];
  else if (minute < 3) pool = ['goblin', 'skeleton', 'skeleton', 'orc', 'bat'];
  else if (minute < 6) pool = ['skeleton', 'orc', 'orc', 'bat', 'wraith'];
  else if (minute < 10) pool = ['orc', 'bat', 'wraith', 'wraith', 'elite'];
  else pool = ['orc', 'wraith', 'elite', 'elite', 'bat'];

  var density = MF.chaos.density;
  if (MF.run && MF.run.chaosDensityMult) density *= MF.run.chaosDensityMult;
  // AI scaling
  var adapt = MF.chaos._adapt || 1.0;

  var count = Math.round(2 + minute * 1.2);
  count = Math.min(count, 18);
  count = Math.round(count * density * adapt);

  for (var i = 0; i < count; i++){
    var id = pool[Math.floor(MF.chaos_rng() * pool.length)];
    var hpMult = (0.85 + minute * 0.18) * Math.pow(adapt, 0.6);
    var spdMult = 1.0 + Math.min(0.4, minute * 0.04);
    MF.chaos_spawnAtEdge(id, hpMult, spdMult);
  }
};

MF.chaos_spawnBoss = function(){
  var bosses = ['goblin_king', 'bone_lord', 'warlord', 'hydra', 'lich', 'dragon_king'];
  var idx = Math.min(bosses.length - 1, MF.chaos.bossesSpawned);
  var id = bosses[idx];
  if (!MF.getEnemy(id)) id = bosses[0];
  var hpMult = 1.0 + MF.chaos.time / 60 * 0.25;
  // Cinematic boss intro: bigger banner + slow-mo + camera flash
  var bossDef = MF.getEnemy(id);
  var bossName = bossDef ? bossDef.name : 'BOSS';
  MF.chaos_bossCinematic(bossName, bossDef && bossDef.color);
  MF.fx.shake(1.0, 0.8);
  if (MF.voice_event) MF.voice_event('bossSpawn');
  if (MF.haptic_tap) MF.haptic_tap('heavy');
  if (MF.audio && MF.audio.music) MF.audio.music.setMode('boss');
  if (MF.boss_playTheme) MF.boss_playTheme(id);
  if (MF.chaos.stats) MF.chaos.stats.bossTimes.push(MF.chaos.time);
  var bossEnemy = MF.chaos_spawnAtEdge(id, hpMult, 1.0, true);
  // P14: random boss customs
  if (bossEnemy && MF.bosscustom_apply) MF.bosscustom_apply(bossEnemy);
  // Restore play music after 30s if no other boss spawned
  setTimeout(function(){
    if (MF.audio && MF.audio.music && MF.audio.music.mode === 'boss' && MF.state.screen === 'play'){
      MF.audio.music.setMode('play');
    }
  }, 30000);
};

// Spawn an enemy at a random point on a circle around the fortress and target it
MF.chaos_spawnAtEdge = function(typeId, hpMult, spdMult, isBoss){
  var data = MF.getEnemy(typeId);
  if (!data) return null;
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Spawn on a circle (radius depends on grid size)
  var radius = Math.max(MF.GRID_COLS, MF.GRID_ROWS) * MF.TILE * 0.55;
  var ang = MF.chaos_rng() * Math.PI * 2;
  var sx = fortress.x + Math.cos(ang) * radius;
  var sz = fortress.z + Math.sin(ang) * radius;

  var baseScale = data.scale || 0.55;
  var scale = baseScale * (MF.ENEMY_SIZE_MULT || 1);
  var mesh = MF.buildEnemyMesh(data, baseScale);
  mesh.position.set(sx, data.flying ? 1.2 : 0, sz);
  // Face fortress
  mesh.rotation.y = Math.atan2(fortress.x - sx, fortress.z - sz);
  MF.three.worldGroup.add(mesh);

  var hp = data.baseHP * (hpMult || 1);
  var spd = data.baseSpd * (spdMult || 1);
  if (MF.run){
    hp  *= (MF.run.enemyHpMult || 1);
    spd *= (MF.run.enemySpdMult || 1);
  }

  // Low-gravity modifier makes all enemies float like flying units
  var lowGrav = MF.run && MF.run.mapLowGrav;
  if (lowGrav){
    mesh.position.y = 1.0;
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
    speed: spd * (lowGrav ? 1.15 : 1),
    baseSpeed: spd * (lowGrav ? 1.15 : 1),
    armor: data.armor || 0,
    flying: !!data.flying || !!lowGrav,
    isBoss: data.kind === 'boss' || !!isBoss,
    isMini: false,
    gold: Math.round(data.gold * (MF.run && MF.run.goldMult ? MF.run.goldMult : 1)),
    fortressDmg: data.fortressDmg || 1,
    statuses: { slow: 0, slowMult: 1, burn: 0, burnDps: 0, stun: 0 },
    alive: true,
    scale: scale,
    breatheT: Math.random() * Math.PI * 2,
    chaos: true                  // marker for linear movement
  };
  MF.enemies.push(enemy);
  return enemy;
};

// === AURAS — passive DPS rings around heroes ===
MF.chaos_tickAuras = function(dt){
  if (!MF.units || !MF.units.length) return;
  for (var i = 0; i < MF.units.length; i++){
    var u = MF.units[i];
    if (!u) continue;
    var auraIds = MF.chaos_getAuras(u);
    if (!auraIds.length) continue;
    var udata = MF.UNITS[u.id];
    var canFly = udata && udata.attack && udata.attack.hitsFlying !== false;
    for (var ai = 0; ai < auraIds.length; ai++){
      var a = MF.AURAS[auraIds[ai]];
      if (!a) continue;
      var range = a.range * (MF.run && MF.run.auraRangeMult ? MF.run.auraRangeMult : 1);
      var dps = a.dps + (a.dpsPerRank || 0) * Math.max(0, (u.rank || 1) - 1);
      // Find enemies in range
      for (var j = MF.enemies.length - 1; j >= 0; j--){
        var e = MF.enemies[j];
        if (!e || !e.alive) continue;
        if (e.flying && !canFly) continue;
        var dx = e.pos.x - u.pos.x, dz = e.pos.z - u.pos.z;
        var d2 = dx*dx + dz*dz;
        if (d2 > range * range) continue;
        e.hp -= dps * dt;
        // Status on hit (apply periodically — use mod of time)
        if (a.statusOnHit && Math.random() < dt * 0.5){
          MF.applyStatus(e, a.statusOnHit);
        }
        // Lifesteal
        if (a.lifestealRatio && MF.state.fortressHP < MF.state.fortressMaxHP){
          // Tiny chance per tick to heal 1
          if (Math.random() < dt * a.lifestealRatio){
            MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + 1);
            MF.fx.floatingDmg(MF.grid.fortressPos, '+1 ❤', 'heal');
          }
        }
        // HP bar update
        var hpFg = e.mesh.userData.hpFg;
        if (hpFg){
          var pct = Math.max(0, e.hp / e.maxHp);
          hpFg.scale.x = pct;
          hpFg.position.x = -(1 - pct) * e.mesh.userData.hpFgWidth / 2;
        }
        if (e.hp <= 0){
          MF.killEnemy(e);
        }
      }
    }
  }
};

// Get list of auras active for a unit (rank-based)
MF.chaos_getAuras = function(u){
  if (!u || !u.id) return [];
  var auras = [];
  // Hybrids have an autoAura
  if (MF.UNITS[u.id] && MF.UNITS[u.id].autoAura){
    auras.push(MF.UNITS[u.id].autoAura);
  }
  if (MF.HERO_AURAS){
    var heroDef = MF.HERO_AURAS[u.id];
    if (heroDef){
      if (u.rank >= 5 && heroDef.rank5) auras.push(heroDef.rank5);
      else if (u.rank >= 3 && heroDef.rank3) auras.push(heroDef.rank3);
    }
  }
  // starter_aura: even R1+ heroes get a mini fire aura
  if (auras.length === 0 && MF.run && MF.run.chaosStarterAura && MF.UNITS[u.id] && MF.UNITS[u.id].kind === 'hero'){
    auras.push('fire_aura');
  }
  return auras;
};

// === KILL / COMBO — called from MF.killEnemy hook ===
MF.chaos_onKill = function(enemy){
  if (!MF.chaos.active) return;
  MF.chaos.kills++;
  MF.chaos.combo++;
  MF.chaos.comboT = MF.chaos.comboMax;
  // Stats: kill bucket + max combo
  if (MF.chaos.stats){
    var bIdx = Math.floor(MF.chaos.time / MF.chaos.stats.bucketWindow);
    MF.chaos.stats.killsBuckets[bIdx] = (MF.chaos.stats.killsBuckets[bIdx] || 0) + 1;
    if (MF.chaos.combo > MF.chaos.stats.maxCombo) MF.chaos.stats.maxCombo = MF.chaos.combo;
  }
  // Combo banner at milestones
  if (MF.chaos_comboBanner) MF.chaos_comboBanner(MF.chaos.combo);
  // Achievement hook
  if (MF.ach_onCombo) MF.ach_onCombo(MF.chaos.combo);
  // Daily challenge: combo (max-style)
  if (MF.daily_progress) MF.daily_progress('combo', MF.chaos.combo);
  // P10 daily target combo
  if (MF.daily_target_progress) MF.daily_target_progress('combo', MF.chaos.combo);
  // Charge ultimate
  if (MF.chaos.ultData && MF.chaos.ultCharge < 1){
    var prevCharge = MF.chaos.ultCharge;
    var charge = MF.chaos.ultData.chargePerKill / 100;
    if (MF.run && MF.run.ultimateChargeMult) charge *= MF.run.ultimateChargeMult;
    MF.chaos.ultCharge = Math.min(1, MF.chaos.ultCharge + charge);
    if (prevCharge < 1 && MF.chaos.ultCharge >= 1 && MF.audio && MF.audio.ultReady){
      MF.audio.ultReady();
    }
  }
  // Legendary drop chance
  MF.chaos_tryDrop(enemy);
};

// === ULTIMATE TRIGGER ===
MF.chaos_triggerUltimate = function(){
  if (!MF.chaos.active) return false;
  if (MF.chaos.ultCharge < 1) return false;
  var u = MF.chaos.ultData;
  if (!u) return false;
  MF.chaos.ultCharge = 0;
  if (MF.chaos.stats) MF.chaos.stats.ultCasts++;
  if (MF.daily_addProgress) MF.daily_addProgress('ult_casts', 1);
  var eff = u.effect;
  if (MF.audio && MF.audio.ultCast) MF.audio.ultCast();
  MF.fx.showBanner(u.icon + ' ' + u.name + ' !', 'wave');
  MF.fx.shake(0.6, 0.5);

  if (eff.type === 'meteor'){
    MF.chaos_castMeteor(eff);
  } else if (eff.type === 'freeze'){
    MF.chaos_castFreeze(eff);
  } else if (eff.type === 'thunder'){
    MF.chaos_castThunder(eff);
  } else if (eff.type === 'shockwave'){
    MF.chaos_castShockwave(eff);
  } else if (eff.type === 'blackhole'){
    MF.chaos_castBlackhole(eff);
  } else if (eff.type === 'tornado'){
    MF.chaos_castTornado(eff);
  } else if (eff.type === 'summon'){
    MF.chaos_castSummon(eff);
  } else if (eff.type === 'shield'){
    MF.chaos_castShield(eff);
  }
  return true;
};

MF.chaos_castBlackhole = function(eff){
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Visual: dark sphere + ring
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x1a0030, transparent: true, opacity: 0.9, depthWrite: false })
  );
  sphere.position.set(fortress.x, 1.0, fortress.z);
  MF.three.worldGroup.add(sphere);
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.18, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x9050ff, transparent: true, opacity: 0.85, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(fortress.x, 0.8, fortress.z);
  MF.three.worldGroup.add(ring);
  MF.flashLight(fortress, 0x9050ff, 5, 16, 0.6);
  // Pull enemies toward center over duration
  var elapsed = 0;
  var pullInterval = setInterval(function(){
    elapsed += 0.05;
    sphere.scale.setScalar(1 + Math.sin(elapsed * 8) * 0.15);
    ring.rotation.z += 0.15;
    for (var i = MF.enemies.length - 1; i >= 0; i--){
      var e = MF.enemies[i];
      if (!e || !e.alive) continue;
      var dx = fortress.x - e.pos.x, dz = fortress.z - e.pos.z;
      var d = Math.sqrt(dx*dx + dz*dz);
      if (d < 0.3) continue;
      if (d > eff.radius) continue;
      var pull = eff.pullStrength * 0.05;
      e.pos.x += (dx / d) * pull;
      e.pos.z += (dz / d) * pull;
      e.mesh.position.copy(e.pos);
    }
    if (elapsed >= eff.dur){
      clearInterval(pullInterval);
      // Big explosion
      MF.fx.spawnRing(fortress, 0xff80ff, { scale: eff.radius * 2.5, life: 0.7 });
      MF.fx.spawnBurst(fortress, 0xff80ff, 30, { speed: 7 });
      MF.fx.shake(0.7, 0.7);
      MF.flashLight(fortress, 0xff80ff, 6, 18, 0.5);
      for (var j = MF.enemies.length - 1; j >= 0; j--){
        var ej = MF.enemies[j];
        if (!ej || !ej.alive) continue;
        var dxj = ej.pos.x - fortress.x, dzj = ej.pos.z - fortress.z;
        if (dxj*dxj + dzj*dzj <= eff.radius * eff.radius){
          MF.dealDamage(ej, eff.dmg, 'normal');
        }
      }
      MF.three.worldGroup.remove(sphere);
      MF.three.worldGroup.remove(ring);
      MF._disposeMesh && MF._disposeMesh(sphere);
      MF._disposeMesh && MF._disposeMesh(ring);
    }
  }, 50);
};

MF.chaos_castTornado = function(eff){
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Random direction wandering
  var ang = Math.random() * Math.PI * 2;
  var pos = new THREE.Vector3(fortress.x + Math.cos(ang) * 3, 0, fortress.z + Math.sin(ang) * 3);
  var velAng = Math.random() * Math.PI * 2;
  // Build tornado mesh
  var twister = new THREE.Group();
  var coneMat = new THREE.MeshBasicMaterial({ color: 0xa0c8ff, transparent: true, opacity: 0.6, depthWrite: false });
  for (var k = 0; k < 4; k++){
    var c = new THREE.Mesh(
      new THREE.ConeGeometry(eff.radius * (1 - k * 0.15), 0.7, 12, 1, true),
      coneMat
    );
    c.position.y = 0.4 + k * 0.7;
    twister.add(c);
  }
  twister.position.copy(pos);
  MF.three.worldGroup.add(twister);
  var elapsed = 0;
  var dirChangeT = 0;
  var twisterInt = setInterval(function(){
    var dt = 0.05;
    elapsed += dt;
    dirChangeT -= dt;
    if (dirChangeT <= 0){
      velAng = Math.random() * Math.PI * 2;
      dirChangeT = 0.6 + Math.random() * 0.8;
    }
    pos.x += Math.cos(velAng) * eff.speed * dt;
    pos.z += Math.sin(velAng) * eff.speed * dt;
    twister.position.copy(pos);
    twister.rotation.y += 0.5;
    // Damage enemies in radius
    for (var i = MF.enemies.length - 1; i >= 0; i--){
      var e = MF.enemies[i];
      if (!e || !e.alive) continue;
      var dx = e.pos.x - pos.x, dz = e.pos.z - pos.z;
      if (dx*dx + dz*dz <= eff.radius * eff.radius){
        MF.dealDamage(e, eff.dmgPerSec * dt, 'normal');
      }
    }
    if (elapsed >= eff.dur){
      clearInterval(twisterInt);
      MF.three.worldGroup.remove(twister);
      twister.children.forEach(function(c){ MF._disposeMesh && MF._disposeMesh(c); });
      MF.fx.spawnRing(pos, 0xa0c8ff, { scale: 3, life: 0.5 });
    }
  }, 50);
};

MF.chaos_castSummon = function(eff){
  // Summon N R3 random heroes on free cells (chaos arena = nearly all cells free)
  var pool = MF.UNIT_POOL_HERO || ['knight', 'archer', 'mage'];
  var summoned = [];
  for (var i = 0; i < eff.count; i++){
    var cell = MF.findFreeCell ? MF.findFreeCell() : null;
    if (!cell) break;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    var u = MF.spawnUnit(pick, eff.rank, cell.c, cell.r);
    if (u){
      u.mesh.scale.setScalar(1.6);
      u.spawnT = -0.2;
      u.summonedT = eff.dur;          // marker for despawn
      u.isSummoned = true;
      MF.fx.spawnBurst(u.pos, 0xfff080, 16, { speed: 3.5 });
      MF.fx.spawnRing(u.pos, 0xfff080, { scale: 2.5, life: 0.5 });
      summoned.push(u);
    }
  }
  // Despawn after duration
  setTimeout(function(){
    summoned.forEach(function(u){
      if (u && MF.units.indexOf(u) >= 0){
        MF.fx.spawnBurst(u.pos, 0xfff080, 12, { speed: 3 });
        MF.removeUnit(u);
      }
    });
  }, eff.dur * 1000);
};

MF.chaos_castShield = function(eff){
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Heal
  var heal = Math.round(MF.state.fortressMaxHP * eff.healPct);
  MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + heal);
  MF.fx.floatingDmg(fortress, '+' + heal + ' ❤', 'heal');
  // Mark fortress invulnerable
  MF.run = MF.run || {};
  MF.run.fortressInvuln = true;
  // Visual shield bubble
  var bubble = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x80ffd0, transparent: true, opacity: 0.35, depthWrite: false })
  );
  bubble.position.copy(fortress);
  bubble.position.y = 1.5;
  MF.three.worldGroup.add(bubble);
  MF.fx.spawnRing(fortress, 0x80ffd0, { scale: 5, life: 0.7 });
  MF.flashLight(fortress, 0x80ffd0, 5, 14, 0.5);
  var t0 = 0;
  var bubbleInt = setInterval(function(){
    t0 += 0.05;
    bubble.material.opacity = 0.35 + Math.sin(t0 * 8) * 0.12;
    bubble.scale.setScalar(1 + Math.sin(t0 * 6) * 0.05);
    if (t0 >= eff.dur){
      clearInterval(bubbleInt);
      MF.run.fortressInvuln = false;
      MF.three.worldGroup.remove(bubble);
      MF._disposeMesh && MF._disposeMesh(bubble);
      MF.fx.spawnRing(fortress, 0x80ffd0, { scale: 2, life: 0.4 });
    }
  }, 50);
};

MF.chaos_castMeteor = function(eff){
  var n = eff.count || 10;
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  var radius = Math.max(MF.GRID_COLS, MF.GRID_ROWS) * MF.TILE * 0.5;
  for (var i = 0; i < n; i++){
    (function(idx){
      var ang = Math.random() * Math.PI * 2;
      var d = Math.random() * radius;
      var x = fortress.x + Math.cos(ang) * d;
      var z = fortress.z + Math.sin(ang) * d;
      // Falling meteor with trail
      var meteor = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xff5028, emissive: 0xff7028, emissiveIntensity: 1.8, roughness: 0.4 })
      );
      meteor.position.set(x, 12, z);
      MF.three.worldGroup.add(meteor);
      // Trail (cone behind)
      var trail = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 1.6, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffae3a, transparent: true, opacity: 0.7, depthWrite: false })
      );
      trail.position.set(x, 13, z);
      trail.rotation.x = Math.PI;
      MF.three.worldGroup.add(trail);
      // Shadow circle on ground
      var shadow = new THREE.Mesh(
        new THREE.RingGeometry(eff.radius * 0.8, eff.radius * 1.0, 24),
        new THREE.MeshBasicMaterial({ color: 0xff5028, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.05, z);
      MF.three.worldGroup.add(shadow);
      var fallStart = idx * 80;
      var fallDur = 600;
      setTimeout(function(){
        var t0 = 0;
        var fallInt = setInterval(function(){
          t0 += 30;
          var pct = Math.min(1, t0 / fallDur);
          var y = 12 * (1 - pct);
          meteor.position.y = y + 0.3;
          trail.position.y = y + 1.0;
          shadow.material.opacity = 0.4 + pct * 0.4;
          if (pct >= 1){
            clearInterval(fallInt);
            // Impact
            MF.three.worldGroup.remove(meteor); MF._disposeMesh && MF._disposeMesh(meteor);
            MF.three.worldGroup.remove(trail);  MF._disposeMesh && MF._disposeMesh(trail);
            MF.three.worldGroup.remove(shadow); MF._disposeMesh && MF._disposeMesh(shadow);
            var pos = new THREE.Vector3(x, 0, z);
            MF.fx.spawnRing(pos, 0xff7028, { scale: eff.radius * 3, life: 0.5 });
            MF.fx.spawnRing(pos, 0xff5028, { scale: eff.radius * 1.5, life: 0.35 });
            MF.fx.spawnBurst(pos, 0xff7028, 22, { speed: 6 });
            MF.flashLight(pos, 0xff7028, 4, 7, 0.32);
            MF.fx.shake(0.3, 0.25);
            for (var j = MF.enemies.length - 1; j >= 0; j--){
              var e = MF.enemies[j];
              if (!e || !e.alive) continue;
              var dx = e.pos.x - x, dz = e.pos.z - z;
              if (dx*dx + dz*dz <= eff.radius * eff.radius){
                MF.dealDamage(e, eff.dmg, 'fire');
              }
            }
          }
        }, 30);
      }, fallStart);
    })(i);
  }
};

MF.chaos_castFreeze = function(eff){
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Big icy shockwave from fortress
  MF.fx.spawnRing(fortress, 0x90d0ff, { scale: 14, life: 0.7 });
  MF.flashLight(fortress, 0x90d0ff, 5, 18, 0.5);
  for (var i = MF.enemies.length - 1; i >= 0; i--){
    var e = MF.enemies[i];
    if (!e || !e.alive) continue;
    MF.applyStatus(e, { type:'stun', dur: eff.dur, chance: 1 });
    MF.applyStatus(e, { type:'slow', dur: eff.dur + 1, mult: 0.3 });
    MF.dealDamage(e, eff.dmg, 'frost');
    MF.fx.spawnRing(e.pos, 0x90d0ff, { scale: 1.8, life: 0.5 });
    // Ice crystal shards growing from each enemy
    var shardMat = new THREE.MeshStandardMaterial({
      color: 0xa8e8ff, roughness: 0.2, metalness: 0.5,
      emissive: 0x4080a0, emissiveIntensity: 0.5, transparent: true, opacity: 0.85
    });
    var shards = [];
    for (var k = 0; k < 4; k++){
      var sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), shardMat);
      var ang = (k / 4) * Math.PI * 2 + Math.random() * 0.4;
      sh.position.set(
        e.pos.x + Math.cos(ang) * 0.3,
        0.4 + Math.random() * 0.3,
        e.pos.z + Math.sin(ang) * 0.3
      );
      sh.scale.setScalar(0.1);
      MF.three.worldGroup.add(sh);
      shards.push(sh);
    }
    (function(arr){
      var t = 0;
      var inT = setInterval(function(){
        t += 0.05;
        arr.forEach(function(s){
          s.scale.setScalar(Math.min(1, t * 3));
          s.rotation.y += 0.1;
          if (t > eff.dur){ s.material.opacity *= 0.85; }
        });
        if (t > eff.dur + 0.6){
          clearInterval(inT);
          arr.forEach(function(s){ MF.three.worldGroup.remove(s); MF._disposeMesh && MF._disposeMesh(s); });
        }
      }, 50);
    })(shards);
  }
};

MF.chaos_castThunder = function(eff){
  var arr = MF.enemies.filter(function(e){ return e.alive; });
  arr.sort(function(a, b){ return b.maxHp - a.maxHp; });
  var n = Math.min(arr.length, eff.count);
  for (var i = 0; i < n; i++){
    (function(idx, e){
      setTimeout(function(){
        if (!e.alive) return;
        // Branching lightning bolt from sky
        var bolt = new THREE.Group();
        var pts = [];
        var prev = new THREE.Vector3(e.pos.x + (Math.random()-.5)*0.4, 8, e.pos.z + (Math.random()-.5)*0.4);
        pts.push(prev);
        for (var j = 1; j <= 6; j++){
          var nxt = new THREE.Vector3(
            e.pos.x + (Math.random()-.5)*0.6 * (1 - j/6),
            8 - j * 1.3,
            e.pos.z + (Math.random()-.5)*0.6 * (1 - j/6)
          );
          if (j === 6){ nxt.x = e.pos.x; nxt.y = 0.5; nxt.z = e.pos.z; }
          pts.push(nxt);
          // Branch segment
          var segLen = prev.distanceTo(nxt);
          var segPos = new THREE.Vector3().addVectors(prev, nxt).multiplyScalar(0.5);
          var seg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, segLen, 5),
            new THREE.MeshBasicMaterial({ color: 0xfff8a0, transparent: true, opacity: 0.95 })
          );
          seg.position.copy(segPos);
          var dir = new THREE.Vector3().subVectors(nxt, prev).normalize();
          var up = new THREE.Vector3(0, 1, 0);
          var q = new THREE.Quaternion().setFromUnitVectors(up, dir);
          seg.quaternion.copy(q);
          bolt.add(seg);
          prev = nxt;
        }
        MF.three.worldGroup.add(bolt);
        // Fade-out
        var t0 = 0;
        var boltInt = setInterval(function(){
          t0 += 0.05;
          bolt.children.forEach(function(s){ s.material.opacity = Math.max(0, 0.95 - t0 * 3); });
          if (t0 > 0.4){
            clearInterval(boltInt);
            MF.three.worldGroup.remove(bolt);
            bolt.children.forEach(function(s){ MF._disposeMesh && MF._disposeMesh(s); });
          }
        }, 50);
        var dmg = (e.maxHp || 100) * 0.4 * (eff.dmgMult || 4);
        MF.flashLight(e.pos, 0xfff080, 4, 6, 0.22);
        MF.fx.spawnRing(e.pos, 0xfff080, { scale: 3, life: 0.45 });
        MF.fx.spawnBurst(e.pos, 0xfff080, 14, { speed: 4 });
        MF.dealDamage(e, dmg, 'lightning');
      }, idx * 60);
    })(i, arr[i]);
  }
};

MF.chaos_castShockwave = function(eff){
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  // Triple expanding rings staggered
  MF.fx.spawnRing(fortress, 0xffd96a, { scale: eff.radius * 2.5, life: 0.7 });
  setTimeout(function(){ MF.fx.spawnRing(fortress, 0xffae3a, { scale: eff.radius * 2.0, life: 0.6 }); }, 80);
  setTimeout(function(){ MF.fx.spawnRing(fortress, 0xff7028, { scale: eff.radius * 1.5, life: 0.5 }); }, 160);
  MF.fx.spawnBurst(fortress, 0xffd96a, 36, { speed: 8 });
  MF.flashLight(fortress, 0xffd96a, 6, 16, 0.6);
  MF.fx.shake(0.85, 0.7);
  for (var i = MF.enemies.length - 1; i >= 0; i--){
    var e = MF.enemies[i];
    if (!e || !e.alive) continue;
    var dx = e.pos.x - fortress.x, dz = e.pos.z - fortress.z;
    if (dx*dx + dz*dz <= eff.radius * eff.radius){
      // Instant kill if below threshold of full hp
      if (e.hp / e.maxHp <= eff.killThreshold){
        MF.killEnemy(e);
      } else {
        MF.dealDamage(e, eff.dmg, 'normal');
      }
    }
  }
};

// === LINEAR MOVEMENT — called from updateEnemies for chaos enemies ===
MF.chaos_updateEnemy = function(e, dt){
  var fortress = MF.grid.fortressPos;
  if (!fortress) return false;
  if (e.statuses.stun > 0){
    e.statuses.stun -= dt;
    return true;
  }
  var spd = e.baseSpeed;
  if (e.statuses.slow > 0){
    e.statuses.slow -= dt;
    spd *= e.statuses.slowMult;
    if (e.statuses.slow <= 0){ e.statuses.slow = 0; e.statuses.slowMult = 1; }
  }
  // Move toward fortress
  var dx = fortress.x - e.pos.x;
  var dz = fortress.z - e.pos.z;
  var d = Math.sqrt(dx*dx + dz*dz);
  if (d < 0.45){
    // Reached fortress: damage + remove (skip damage if shield active)
    if (!(MF.run && MF.run.fortressInvuln)){
      MF.state.fortressHP -= e.fortressDmg;
      MF.fx.shake(0.5, 0.4);
      MF.fx.floatingDmg(fortress, '-' + e.fortressDmg, 'crit');
      MF.fx.spawnBurst(fortress, 0xff3030, 14, { speed: 4.5 });
      MF.flashLight(fortress, 0xff3030, 2.5, 6, 0.3);
    } else {
      MF.fx.spawnRing(fortress, 0x80ffd0, { scale: 1.5, life: 0.25 });
      MF.fx.floatingDmg(fortress, '✦ Bloqué', 'gold');
    }
    MF.removeEnemy(e);
    if (MF.state.fortressHP <= 0){
      MF.state.fortressHP = 0;
      MF.state.outcome = 'lose';
    }
    return true;
  }
  var step = (spd / d) * dt;
  e.pos.x += dx * step;
  e.pos.z += dz * step;
  if (e.flying) e.pos.y = 1.2 + Math.sin(MF._t * 2 + e.eid) * 0.14;
  e.mesh.position.copy(e.pos);
  e.mesh.rotation.y = Math.atan2(dx, dz);
  return true;
};

// === END / SCORING ===
MF.chaos_end = function(){
  MF.chaos.active = false;
  // Fragment reward = time + kills
  var minutes = MF.chaos.time / 60;
  var fragments = Math.round(minutes * 20 + MF.chaos.kills * 0.4 + MF.chaos.bossesSpawned * 30);
  // Variant multiplier
  var variantMult = ({ normal:1.0, hardcore:3.0, speedrun:2.0, solo:2.0, apocalypse:5.0 })[MF.chaos.variant] || 1.0;
  // Daily seed bonus
  if (MF.chaos.daily) variantMult *= 1.5;
  fragments = Math.round(fragments * variantMult);
  if (MF.state.meta){
    MF.state.meta.fragments += fragments;
    // Track deepest
    if (MF.chaos.time > (MF.state.meta.chaosBestTime || 0)){
      MF.state.meta.chaosBestTime = MF.chaos.time;
    }
    // Push to leaderboard (top 5 by time)
    MF.state.meta.chaosLeaderboard = MF.state.meta.chaosLeaderboard || [];
    var entry = {
      time: MF.chaos.time,
      kills: MF.chaos.kills,
      ult: MF.chaos.ultId,
      bosses: MF.chaos.bossesSpawned,
      date: Date.now()
    };
    MF.state.meta.chaosLeaderboard.push(entry);
    MF.state.meta.chaosLeaderboard.sort(function(a, b){ return b.time - a.time; });
    MF.state.meta.chaosLeaderboard = MF.state.meta.chaosLeaderboard.slice(0, 5);
    // Track if this run made the leaderboard
    MF.chaos.lastEntry = entry;
    MF.chaos.lastRank = MF.state.meta.chaosLeaderboard.indexOf(entry) + 1;  // 0 if not on board
    // Push to weekly ladder
    if (MF.ladder_pushChaos) MF.ladder_pushChaos({ time: entry.time, kills: entry.kills, ult: entry.ult, bosses: entry.bosses, variant: MF.chaos.variant });
    // Daily best (per day key)
    if (MF.chaos.daily){
      MF.state.meta.dailyBest = MF.state.meta.dailyBest || {};
      var dk = MF.chaos_dailyKey();
      if (!MF.state.meta.dailyBest[dk] || MF.state.meta.dailyBest[dk].time < MF.chaos.time){
        MF.state.meta.dailyBest[dk] = { time: MF.chaos.time, kills: MF.chaos.kills };
      }
    }
  }
  MF.saveProgress();
  // Achievement hook
  if (MF.ach_onChaosEnd) MF.ach_onChaosEnd();
  // Daily challenges: time
  if (MF.daily_progress) MF.daily_progress('chaos_time', Math.floor(MF.chaos.time));
  // P10 daily target time
  if (MF.daily_target_progress) MF.daily_target_progress('chaos_time', Math.floor(MF.chaos.time));
  // P10 quests
  if (MF.quests_addProgress) MF.quests_addProgress('chaos_time_total', Math.floor(MF.chaos.time));
  // P10 crucible end-of-run
  if (MF.crucible_onEndRun) MF.crucible_onEndRun();
  return fragments;
};

// === Cinematic boss intro ===
MF.chaos_bossCinematic = function(name, color){
  // Slow-mo for 1.2s
  var prevSpeed = MF.state.speed;
  MF.state.speed = 0.3;
  setTimeout(function(){ MF.state.speed = prevSpeed; }, 1200);
  // Big intro overlay
  var overlay = document.createElement('div');
  overlay.className = 'mf-boss-intro';
  var col = color ? '#' + color.toString(16).padStart(6, '0') : '#ff5050';
  overlay.innerHTML =
    '<div class="mf-boss-bar mf-boss-bar-top"></div>' +
    '<div class="mf-boss-content" style="--boss-col:' + col + '">' +
      '<div class="mf-boss-label">⚠ BOSS ⚠</div>' +
      '<div class="mf-boss-name">' + name.toUpperCase() + '</div>' +
    '</div>' +
    '<div class="mf-boss-bar mf-boss-bar-bot"></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 1700);
  // Strong flash light at fortress
  if (MF.flashLight && MF.grid.fortressPos){
    MF.flashLight(MF.grid.fortressPos, color || 0xff5050, 6, 18, 0.6);
  }
};

// Combo banner at milestones (10, 25, 50, 100, 200, 500)
MF.chaos_comboBanner = function(combo){
  var labels = { 10:'COMBO ! 🔥', 25:'CARNAGE ! 🩸', 50:'MASSACRE ! 💀', 100:'LÉGENDE ! ⭐', 200:'APOCALYPSE ! ☄️', 500:'IMMORTEL ! 👑' };
  if (!labels[combo]) return;
  if (MF.fx.showBanner) MF.fx.showBanner(labels[combo] + ' x' + combo, 'wave');
  // Big screen-flash
  var flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle,rgba(255,128,40,.45),transparent 60%);z-index:60;animation:mfFlashFade .8s ease forwards';
  document.body.appendChild(flash);
  setTimeout(function(){ if (flash.parentNode) flash.parentNode.removeChild(flash); }, 800);
  // Camera shake
  if (MF.fx.shake) MF.fx.shake(0.5, 0.4);
};

// Helper: format time MM:SS
MF.chaos_fmtTime = function(t){
  var m = Math.floor(t / 60);
  var s = Math.floor(t % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
};
