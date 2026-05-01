// === Merge Fortress TD — Worlds + Procedural Level Generator ===
// Each world has a theme (sky/ground/ambient color) and an enemy pool.
// Levels are generated on demand from world index + level index.
// To add a world: append to MF.WORLDS. To customize a level, override in MF.LEVEL_OVERRIDES.

window.MF = window.MF || {};

MF.WORLDS = [
  {
    id: 'grass',     name: 'Royaume Verdoyant', icon: '🌳',
    sky:    [0x86c5ff, 0xe6f3ff],   // top, bottom
    ground: 0x5fa848, groundEdge: 0x387028,
    pathColor: 0xb8956a, fortressColor: 0x9a7050,
    fogColor: 0xb0d8e8,
    levelCount: 15,
    enemies: ['goblin'],                       // unlock pool extends with progress
    boss: 'goblin_king'
  },
  {
    id: 'desert',    name: 'Ruines du Désert', icon: '🏜️',
    sky:    [0xffc080, 0xffe0a8],
    ground: 0xd8b070, groundEdge: 0xa8804a,
    pathColor: 0x8a6038, fortressColor: 0x886040,
    fogColor: 0xf0d8a0,
    levelCount: 15,
    enemies: ['goblin', 'skeleton'],
    boss: 'bone_lord'
  },
  {
    id: 'frozen',    name: 'Nord Gelé', icon: '❄️',
    sky:    [0xa8d0f0, 0xe0f0ff],
    ground: 0xd8e8f0, groundEdge: 0x90a8c0,
    pathColor: 0x607890, fortressColor: 0x8090a8,
    fogColor: 0xc8e0f0,
    levelCount: 15,
    enemies: ['goblin', 'skeleton', 'bat'],
    boss: 'warlord'
  },
  {
    id: 'lava',      name: 'Citadelle de Lave', icon: '🌋',
    sky:    [0x401820, 0x803040],
    ground: 0x7a3030, groundEdge: 0x481010,
    pathColor: 0xff7838, fortressColor: 0x402020,
    fogColor: 0x602028,
    levelCount: 15,
    enemies: ['skeleton', 'orc', 'bat'],
    boss: 'hydra'
  },
  {
    id: 'necro',     name: 'Nécropole Sombre', icon: '💀',
    sky:    [0x2a1840, 0x101028],
    ground: 0x3a2c50, groundEdge: 0x201838,
    pathColor: 0x6850a0, fortressColor: 0x382850,
    fogColor: 0x281840,
    levelCount: 15,
    enemies: ['skeleton', 'orc', 'wraith', 'bat'],
    boss: 'lich'
  },
  {
    id: 'sky',       name: 'Forteresse Céleste', icon: '☁️',
    sky:    [0xfff0e8, 0x80a0e0],
    ground: 0xc8d0e8, groundEdge: 0x9aa0c0,
    pathColor: 0xfff0a8, fortressColor: 0xc0c8e0,
    fogColor: 0xf0e8ff,
    levelCount: 15,
    enemies: ['orc', 'elite', 'wraith', 'bat'],
    boss: 'dragon_king'
  }
];

// Per-level overrides (e.g., handcrafted boss-only levels). Format:
//   MF.LEVEL_OVERRIDES['<worldId>:<levelIdx>'] = { waves: [...], reward: {...} }
MF.LEVEL_OVERRIDES = {};

// Generate level data from world + level index (1-indexed).
// Each level returns: { worldId, idx, waves: [...], reward, fortressHP, startGold, isBoss }
MF.generateLevel = function(worldIdx, levelIdx){
  var key = MF.WORLDS[worldIdx].id + ':' + levelIdx;
  if (MF.LEVEL_OVERRIDES[key]) {
    var o = MF.LEVEL_OVERRIDES[key];
    return Object.assign({ worldIdx:worldIdx, levelIdx:levelIdx }, o);
  }

  var world = MF.WORLDS[worldIdx];
  var rng = MF._mulberry32(worldIdx * 100003 + levelIdx * 7 + 17);

  // Enemy pool: starts simple, expands as levels progress within a world
  var fullPool = world.enemies;
  var unlockN = Math.min(fullPool.length, 1 + Math.floor(levelIdx / 4));
  var pool = fullPool.slice(0, unlockN);

  // Difficulty scaling
  var globalLevel = worldIdx * 15 + levelIdx;
  var hpMult  = Math.pow(1.13, globalLevel) * (1 + worldIdx * 0.1);
  var spdMult = 1 + Math.min(0.7, globalLevel * 0.012);
  var goldMult = 1 + globalLevel * 0.025;

  // Wave count: 8 base + ~levelIdx
  var waveCount = 8 + Math.floor(levelIdx * 0.6);
  var isFinalLevel = (levelIdx === world.levelCount);
  if (isFinalLevel) waveCount += 2;

  var waves = [];
  for (var w = 1; w <= waveCount; w++){
    var isBossWave = (w === waveCount && isFinalLevel) || (w !== 0 && w % 5 === 0 && w !== waveCount);
    var wave = { idx: w, enemies: [], delay: 0.4, isBoss: false };

    if (w === waveCount && isFinalLevel) {
      // World boss
      wave.isBoss = true;
      wave.enemies.push({
        type: world.boss, isBoss: true,
        hpMult: hpMult * 1.0, spdMult: spdMult, goldMult: goldMult,
        delay: 0
      });
      // Some adds
      var addCount = 6 + Math.floor(globalLevel * 0.3);
      var addType = pool[pool.length - 1];
      for (var k = 0; k < addCount; k++){
        wave.enemies.push({
          type: addType, hpMult: hpMult, spdMult: spdMult, goldMult: goldMult,
          delay: 1.2 + k * 0.6
        });
      }
    } else if (isBossWave) {
      // Mid-level mini-boss: a tougher version of last enemy in pool
      var miniType = pool[pool.length - 1];
      var miniHP = hpMult * (3.5 + w * 0.25);
      wave.enemies.push({
        type: miniType, isMini: true,
        hpMult: miniHP, spdMult: spdMult * 0.85, goldMult: goldMult * 1.5,
        scaleMult: 1.4,
        delay: 0
      });
      var addN = 4 + Math.floor(w / 3);
      for (var j = 0; j < addN; j++){
        wave.enemies.push({
          type: pool[Math.floor(rng() * pool.length)],
          hpMult: hpMult, spdMult: spdMult, goldMult: goldMult,
          delay: 1.0 + j * 0.7
        });
      }
    } else {
      // Normal wave
      var count = 5 + Math.floor(w * 1.2 + levelIdx * 0.4);
      var spacing = Math.max(0.35, 0.85 - w * 0.025);
      var t = 0;
      for (var i = 0; i < count; i++){
        var type = pool[Math.floor(rng() * pool.length)];
        wave.enemies.push({
          type: type,
          hpMult: hpMult * (1 + w * 0.04),
          spdMult: spdMult,
          goldMult: goldMult,
          delay: t
        });
        t += spacing + rng() * 0.18;
      }
    }
    waves.push(wave);
  }

  // Reward
  var stars = 1 + (isFinalLevel ? 1 : 0);
  return {
    worldIdx: worldIdx, levelIdx: levelIdx,
    name: 'Niveau ' + levelIdx + (isFinalLevel ? ' — Boss' : ''),
    waves: waves,
    fortressHP: 20 + Math.floor(globalLevel * 0.4),
    startGold: 100 + Math.floor(globalLevel * 6),
    waveCount: waveCount,
    isFinalLevel: isFinalLevel,
    rewardGold: Math.floor(50 * (1 + globalLevel * 0.15)),
    rewardStars: stars
  };
};

// Endless mode level: ramp forever
MF.generateEndlessWave = function(waveN, worldIdx){
  var world = MF.WORLDS[worldIdx || 0];
  var pool = ['goblin', 'skeleton', 'orc', 'bat', 'elite', 'wraith'];
  var unlockN = Math.min(pool.length, 1 + Math.floor(waveN / 4));
  pool = pool.slice(0, unlockN);
  var hpMult = Math.pow(1.18, waveN);
  var spdMult = 1 + Math.min(1.2, waveN * 0.01);
  var rng = MF._mulberry32(7919 * waveN + 13);

  var wave = { idx: waveN, enemies: [], isBoss: (waveN > 0 && waveN % 10 === 0) };
  if (wave.isBoss) {
    var bossKeys = Object.keys(MF.BOSSES);
    var bossId = bossKeys[Math.min(bossKeys.length - 1, Math.floor(waveN / 10) - 1)];
    wave.enemies.push({ type: bossId, isBoss: true, hpMult: hpMult, spdMult: spdMult, goldMult: 1, delay: 0 });
  }
  var n = 6 + Math.floor(waveN * 1.4);
  var t = wave.isBoss ? 1.5 : 0;
  for (var i = 0; i < n; i++){
    wave.enemies.push({
      type: pool[Math.floor(rng() * pool.length)],
      hpMult: hpMult, spdMult: spdMult, goldMult: 1, delay: t
    });
    t += Math.max(0.32, 0.8 - waveN * 0.014) + rng() * 0.18;
  }
  return wave;
};

// Boss rush: a level made of consecutive boss waves
MF.generateBossRushLevel = function(){
  var bossKeys = Object.keys(MF.BOSSES);
  var waves = [];
  for (var i = 0; i < bossKeys.length; i++){
    var b = bossKeys[i];
    var hpMult = Math.pow(1.45, i + 1);
    var w = { idx: i + 1, enemies: [], isBoss: true };
    w.enemies.push({ type: b, isBoss: true, hpMult: hpMult, spdMult: 1 + i * 0.05, goldMult: 1.5, delay: 0 });
    // Adds
    var addType = ['goblin','skeleton','orc','bat','elite','wraith'][i] || 'orc';
    for (var k = 0; k < 5; k++){
      w.enemies.push({ type: addType, hpMult: hpMult * 0.4, spdMult: 1, goldMult: 1, delay: 1 + k * 0.7 });
    }
    waves.push(w);
  }
  return {
    name: 'Boss Rush',
    waves: waves,
    fortressHP: 30, startGold: 200, waveCount: waves.length,
    isFinalLevel: true, rewardGold: 1000, rewardStars: 3,
    isBossRush: true
  };
};

// Small deterministic RNG
MF._mulberry32 = function(seed){
  return function(){
    seed = (seed + 0x6d2b79f5) >>> 0;
    var t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
