// === Merge Fortress TD — Data: heroes, defenses, enemies ===
// Pure data file. To add a new unit, just append an entry here and to MF.UNIT_POOL_HERO/TOWER.
// Each unit has 5 ranks. Stats scale roughly: rank1=×1, r2=×1.9, r3=×3.6, r4=×6.8, r5=×12.5.

window.MF = window.MF || {};

// Helper to build 5-rank stat array from base + scaling
MF._mkRanks = function(base, opts){
  // base = {dmg, color, scale}
  // opts = {colors:[5], scales:[5], dmgMult:[5]}
  var dmgMult = (opts && opts.dmgMult) || [1, 1.9, 3.6, 6.8, 12.5];
  var colors  = (opts && opts.colors)  || [base.color, base.color, base.color, base.color, 0xffd96a];
  // Larger scale gradation for stronger visual progression: rank 5 is ~55% bigger than rank 1
  var scales  = (opts && opts.scales)  || [1.0, 1.10, 1.22, 1.36, 1.55];
  var out = [];
  for (var i = 0; i < 5; i++){
    out.push({
      dmg:   Math.round(base.dmg * dmgMult[i]),
      color: colors[i],
      scale: (base.scale || 1) * scales[i]
    });
  }
  return out;
};

// === HEROES (ranged auto-attack, can target both ground and flying except where noted) ===
MF.UNITS = {

  knight: {
    id: 'knight', kind: 'hero', role:'striker', name: 'Chevalier', icon: '🛡️', summonable: true,
    desc: 'Lourd et fiable. Frappe forte à courte portée.',
    attack: { type: 'single', range: 2.2, atkSpeed: 0.75, projSpeed: 18, projColor: 0xeeeeff },
    ranks: MF._mkRanks(
      { dmg: 22, color: 0xb8b8d0, scale: 1.0 },
      { colors: [0xb8b8d0, 0xc8c8e0, 0xdde0f0, 0xfff2c8, 0xffd96a] }
    )
  },

  archer: {
    id: 'archer', kind: 'hero', role:'shooter', name: 'Archer', icon: '🏹', summonable: true,
    desc: 'Tir rapide et longue portée. Cible aussi les volants.',
    attack: { type: 'single', range: 4.2, atkSpeed: 1.5, projSpeed: 26, projColor: 0xc0e8a0, hitsFlying: true },
    ranks: MF._mkRanks(
      { dmg: 8, color: 0x66a055, scale: 1.0 },
      { colors: [0x66a055, 0x7cb466, 0x9ad885, 0xbcf0a0, 0xffe28a] }
    )
  },

  mage: {
    id: 'mage', kind: 'hero', role:'mage', name: 'Mage', icon: '🔮', summonable: true,
    desc: 'Frappe magique avec petite explosion magique.',
    attack: { type: 'splash', range: 3.4, atkSpeed: 0.85, projSpeed: 14, projColor: 0xc060ff, splashRadius: 1.2, hitsFlying: true },
    ranks: MF._mkRanks(
      { dmg: 12, color: 0x8030c0, scale: 1.05 },
      { colors: [0x8030c0, 0xa050e0, 0xc070ff, 0xe080ff, 0xffd0ff] }
    )
  },

  ice: {
    id: 'ice', kind: 'hero', role:'mage', name: 'Sorcier de Glace', icon: '❄️', summonable: true,
    desc: 'Inflige des dégâts et ralentit fortement les ennemis.',
    attack: { type: 'single', range: 3.0, atkSpeed: 0.95, projSpeed: 18, projColor: 0xa0e8ff, hitsFlying: true,
              status: { type:'slow', dur: 2.2, mult: 0.55 } },
    ranks: MF._mkRanks(
      { dmg: 9, color: 0x4090c8, scale: 1.0 },
      { colors: [0x4090c8, 0x60b0e0, 0x88d0f0, 0xb8e8ff, 0xfff5b8] }
    )
  },

  bomb: {
    id: 'bomb', kind: 'hero', role:'striker', name: 'Démolisseur', icon: '💣', summonable: true,
    desc: 'Lance des bombes — gros dégâts de zone, cadence faible.',
    attack: { type: 'splash', range: 2.8, atkSpeed: 0.55, projSpeed: 11, projColor: 0x444444, splashRadius: 1.6, hitsFlying: false },
    ranks: MF._mkRanks(
      { dmg: 18, color: 0x8b5a30, scale: 1.0 },
      { colors: [0x8b5a30, 0xa07040, 0xc09060, 0xd8a878, 0xffd96a] }
    )
  },

  dragon: {
    id: 'dragon', kind: 'hero', role:'shooter', name: 'Gardien Dragon', icon: '🐉', summonable: true,
    desc: 'Souffle de feu — touche tous les ennemis en ligne.',
    attack: { type: 'pierce', range: 4.5, atkSpeed: 1.0, projSpeed: 22, projColor: 0xff7030, hitsFlying: true,
              status: { type:'burn', dur: 2.5, dps: 0.18 } },
    ranks: MF._mkRanks(
      { dmg: 14, color: 0xb02828, scale: 1.05 },
      { colors: [0xb02828, 0xd03838, 0xe85040, 0xff7848, 0xffd06a] }
    )
  },

  // === EX-TOWERS NOW HEROES (P13 migration) ===
  cannon: {
    id: 'cannon', kind: 'hero', role: 'striker', name: 'Bombardier', icon: '💥', summonable: true,
    desc: 'Boulet lourd, mono-cible, dégâts énormes.',
    attack: { type: 'splash', range: 3.4, atkSpeed: 0.45, projSpeed: 15, projColor: 0x222222, splashRadius: 0.9, hitsFlying: false },
    ranks: MF._mkRanks(
      { dmg: 28, color: 0x6a4830, scale: 1.0 },
      { colors: [0x6a4830, 0x806038, 0x9a7848, 0xb89058, 0xffd96a] }
    )
  },

  ballista: {
    id: 'ballista', kind: 'hero', role: 'shooter', name: 'Arbalétrière', icon: '🎯', summonable: true,
    desc: 'Flèche perçante qui traverse tous les ennemis en ligne.',
    attack: { type: 'pierce', range: 4.8, atkSpeed: 0.7, projSpeed: 28, projColor: 0xc8a060, hitsFlying: true },
    ranks: MF._mkRanks(
      { dmg: 14, color: 0x8a6a3a, scale: 1.0 },
      { colors: [0x8a6a3a, 0xa68548, 0xc0a060, 0xd8c080, 0xffe5a0] }
    )
  },

  tesla: {
    id: 'tesla', kind: 'hero', role: 'mage', name: 'Magicien Foudre', icon: '⚡', summonable: true,
    desc: 'Foudre en chaîne entre 3 ennemis proches.',
    attack: { type: 'chain', range: 3.5, atkSpeed: 1.2, projSpeed: 60, projColor: 0xfff5a3, chainCount: 3, chainRadius: 2.4, hitsFlying: true,
              status: { type:'stun', dur: 0.25, chance: 0.25 } },
    ranks: MF._mkRanks(
      { dmg: 7, color: 0xddd070, scale: 1.0 },
      { colors: [0xddd070, 0xf0e090, 0xfff5a3, 0xfff8c0, 0xffd96a] }
    )
  },

  fire: {
    id: 'fire', kind: 'hero', role: 'mage', name: 'Pyromancien', icon: '🔥', summonable: true,
    desc: 'Brûle les ennemis au contact (dégâts continus).',
    attack: { type: 'splash', range: 2.4, atkSpeed: 1.0, projSpeed: 13, projColor: 0xff8030, splashRadius: 0.9, hitsFlying: false,
              status: { type:'burn', dur: 3.0, dps: 0.30 } },
    ranks: MF._mkRanks(
      { dmg: 5, color: 0xc83030, scale: 1.0 },
      { colors: [0xc83030, 0xe04848, 0xff7048, 0xff9c5c, 0xffd96a] }
    )
  },

  frost: {
    id: 'frost', kind: 'hero', role: 'mage', name: 'Cryomancien', icon: '🧊', summonable: true,
    desc: 'Ralentit fortement les ennemis dans sa zone.',
    attack: { type: 'splash', range: 3.0, atkSpeed: 0.85, projSpeed: 14, projColor: 0x80d8ff, splashRadius: 1.2, hitsFlying: true,
              status: { type:'slow', dur: 2.5, mult: 0.45 } },
    ranks: MF._mkRanks(
      { dmg: 6, color: 0x4080c0, scale: 1.0 },
      { colors: [0x4080c0, 0x60a0d8, 0x80c0e8, 0xb0d8f0, 0xfff5b8] }
    )
  }
};

// === P13 NEW HEROES ===
// P13 stats balanced (P14): align with existing heroes
MF.UNITS.berserker = {
  id:'berserker', kind:'hero', role:'striker', name:'Berserker', icon:'😡', summonable: true,
  desc:'Furieux: chaque kill donne +5% atk-speed (max 10 stacks).',
  attack: { type:'single', range: 2.5, atkSpeed: 1.1, projSpeed: 22, projColor: 0xff5040 },
  ability:{ type:'rage_stack', stackBonus:0.05, maxStacks:10 },
  ranks: MF._mkRanks(
    { dmg: 14, color: 0xc04020, scale: 1.0 },
    { colors: [0xc04020, 0xd85030, 0xff7040, 0xff9050, 0xffd96a] }
  )
};
MF.UNITS.sniper = {
  id:'sniper', kind:'hero', role:'shooter', name:'Œil-Étoile', icon:'🎯', summonable: true,
  desc:'Tireur d\'élite: 1 tir sur 4 fait ×3 dégâts et perce.',
  attack: { type:'pierce', range: 5.5, atkSpeed: 0.55, projSpeed: 40, projColor: 0x80f0a0, hitsFlying: true },
  ability:{ type:'charge_shot', interval:4, mult:3 },
  ranks: MF._mkRanks(
    { dmg: 26, color: 0x4a8050, scale: 1.0 },
    { colors: [0x4a8050, 0x60a060, 0x80c080, 0xa8e0a0, 0xfff0a0] }
  )
};
MF.UNITS.timemage = {
  id:'timemage', kind:'hero', role:'mage', name:'Tisseur Temporel', icon:'⏳', summonable: true,
  desc:'Aura: ralentit ennemis dans 3.5 (clamp 30% min).',
  attack: { type:'single', range: 3.2, atkSpeed: 0.95, projSpeed: 24, projColor: 0xc8d8ff, hitsFlying: true },
  ability:{ type:'slow_aura', range:3.5, slowMult:0.80 },
  ranks: MF._mkRanks(
    { dmg: 10, color: 0x6080c0, scale: 1.0 },
    { colors: [0x6080c0, 0x80a0d8, 0xa0c0e8, 0xc8e0f0, 0xfff5e0] }
  )
};
MF.UNITS.bard = {
  id:'bard', kind:'hero', role:'support', name:'Barde de Guerre', icon:'🎵', summonable: true,
  desc:'Aura: +15% dmg aux héros alliés dans 3.0 (pas de cumul).',
  attack: { type:'single', range: 3.5, atkSpeed: 0.85, projSpeed: 22, projColor: 0xc080ff, hitsFlying: true },
  ability:{ type:'war_song', range:3.0, dmgBuff:1.15 },
  ranks: MF._mkRanks(
    { dmg: 7, color: 0x9040c0, scale: 1.0 },
    { colors: [0x9040c0, 0xa860d0, 0xc080e0, 0xd8a0f0, 0xffd96a] }
  )
};
MF.UNITS.summoner = {
  id:'summoner', kind:'hero', role:'specialist', name:'Invocateur Pâle', icon:'🐺', summonable: true,
  desc:'Toutes les 8s, invoque 2 loups spectraux (4s, invincibles).',
  attack: { type:'single', range: 3.5, atkSpeed: 0.75, projSpeed: 22, projColor: 0xa0c0ff, hitsFlying: true },
  ability:{ type:'summon_wolves', interval:8, count:2, dur:4 },
  ranks: MF._mkRanks(
    { dmg: 9, color: 0x6090c0, scale: 1.0 },
    { colors: [0x6090c0, 0x80a8d0, 0xa0c0e0, 0xc8e0f0, 0xfff5d0] }
  )
};

// === Roles for sorting in deck UI ===
MF.UNIT_ROLES = {
  striker:    { id:'striker',    name:'Frappeur',    icon:'⚔', color:'#ff7060' },
  shooter:    { id:'shooter',    name:'Tireur',      icon:'🏹', color:'#80c060' },
  mage:       { id:'mage',       name:'Mage',        icon:'🔮', color:'#c070ff' },
  support:    { id:'support',    name:'Soutien',     icon:'🛡', color:'#ffd96a' },
  specialist: { id:'specialist', name:'Spécialiste', icon:'🌑', color:'#80a0ff' }
};

// Unified hero pool (no more towers)
MF.UNIT_POOL_HERO = ['knight', 'archer', 'mage', 'ice', 'bomb', 'dragon',
                     'cannon', 'ballista', 'tesla', 'fire', 'frost',
                     'berserker', 'sniper', 'timemage', 'bard', 'summoner'];
MF.UNIT_POOL_TOWER = [];     // kept empty for backward compat (some old code refs it)

// === ENEMIES ===
// Stats are base at world1 level1; scaling applied dynamically by waves.js
MF.ENEMIES = {

  goblin: {
    id: 'goblin', name: 'Gobelin', kind: 'basic',
    baseHP: 28, baseSpd: 1.6, color: 0x6ba03c,
    scale: 0.55, gold: 4, fortressDmg: 1, flying: false,
    armor: 0
  },

  skeleton: {
    id: 'skeleton', name: 'Squelette', kind: 'basic',
    baseHP: 50, baseSpd: 1.3, color: 0xe8e0c0,
    scale: 0.6, gold: 6, fortressDmg: 1, flying: false,
    armor: 0
  },

  orc: {
    id: 'orc', name: 'Orc', kind: 'tank',
    baseHP: 130, baseSpd: 0.95, color: 0x4a6a3a,
    scale: 0.78, gold: 12, fortressDmg: 2, flying: false,
    armor: 0.15
  },

  bat: {
    id: 'bat', name: 'Chauve-souris', kind: 'flying',
    baseHP: 38, baseSpd: 1.85, color: 0x4a2050,
    scale: 0.5, gold: 8, fortressDmg: 1, flying: true,
    armor: 0
  },

  elite: {
    id: 'elite', name: 'Élite blindée', kind: 'elite',
    baseHP: 280, baseSpd: 1.05, color: 0x707898,
    scale: 0.85, gold: 24, fortressDmg: 3, flying: false,
    armor: 0.35
  },

  wraith: {
    id: 'wraith', name: 'Spectre', kind: 'flying',
    baseHP: 95, baseSpd: 1.55, color: 0x6850b0,
    scale: 0.65, gold: 14, fortressDmg: 2, flying: true,
    armor: 0.10
  }
};

// === BOSSES ===
// Special boss enemies appear on wave-5/10 of campaigns and at world end
MF.BOSSES = {

  goblin_king: {
    id: 'goblin_king', name: 'Roi Gobelin', kind: 'boss',
    baseHP: 1800, baseSpd: 0.78, color: 0x4a8030,
    scale: 1.4, gold: 200, fortressDmg: 6, flying: false,
    armor: 0.25
  },

  bone_lord: {
    id: 'bone_lord', name: 'Seigneur des Os', kind: 'boss',
    baseHP: 2600, baseSpd: 0.7, color: 0xfff8d8,
    scale: 1.5, gold: 280, fortressDmg: 6, flying: false,
    armor: 0.30
  },

  warlord: {
    id: 'warlord', name: 'Seigneur de Guerre', kind: 'boss',
    baseHP: 3800, baseSpd: 0.65, color: 0x404868,
    scale: 1.6, gold: 380, fortressDmg: 7, flying: false,
    armor: 0.45
  },

  hydra: {
    id: 'hydra', name: 'Hydre', kind: 'boss',
    baseHP: 5400, baseSpd: 0.6, color: 0x209880,
    scale: 1.7, gold: 480, fortressDmg: 8, flying: false,
    armor: 0.30
  },

  lich: {
    id: 'lich', name: 'Liche', kind: 'boss',
    baseHP: 7200, baseSpd: 0.7, color: 0x9050d0,
    scale: 1.6, gold: 580, fortressDmg: 8, flying: false,
    armor: 0.40
  },

  dragon_king: {
    id: 'dragon_king', name: 'Roi Dragon', kind: 'boss',
    baseHP: 12000, baseSpd: 0.75, color: 0xff5a30,
    scale: 1.85, gold: 800, fortressDmg: 10, flying: true,
    armor: 0.40
  }
};

// Helper: get unit data
MF.getUnit = function(id){ return MF.UNITS[id]; };
MF.getEnemy = function(id){ return MF.ENEMIES[id] || MF.BOSSES[id]; };
