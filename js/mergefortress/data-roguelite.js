// === Merge Fortress TD — Roguelite data ===
// Upgrades (run-based, drawn between waves)
// Relics (persistent, equipped before run)
// Talents (permanent meta tree)
// Modifiers (random run-modifier rules)
//
// All effects are described as objects { type, value, target } applied via roguelite.js.
// Adding a new entry here = it can be drawn/equipped/unlocked.

window.MF = window.MF || {};

// ===================================================================
// === RARITY POOLS ===
// ===================================================================
MF.RARITIES = {
  common:    { weight: 60, color: '#9aa0b0', label: 'Commun',    glow: 'rgba(160,170,200,.5)' },
  rare:      { weight: 30, color: '#4ea0ff', label: 'Rare',      glow: 'rgba(80,160,255,.7)' },
  epic:      { weight: 9,  color: '#c070ff', label: 'Épique',    glow: 'rgba(192,112,255,.85)' },
  legendary: { weight: 1,  color: '#ffd96a', label: 'Légendaire',glow: 'rgba(255,217,106,.95)' }
};

// ===================================================================
// === RUN UPGRADES (drawn 3 at a time every N waves) ===
// ===================================================================
// Each upgrade has an id, name, desc, rarity, icon, effects[].
// Effect format: { type: '...', target: '...', value: x }
//   type = 'unitDmgMult' | 'unitRangeMult' | 'unitAtkSpeedMult' | 'critChance' | 'critMult'
//        | 'fortressRegen' | 'goldMult' | 'enemySlowDur' | 'burnDmgMult'
//        | 'flag' (sets MF.run.flags[target] = value)
// Special multi-stack: same id can be drawn multiple times if stackable=true.

MF.UPGRADES = [
  // ===== COMMON (basic +%) =====
  { id:'dmg_archer_c', rarity:'common', icon:'🏹', name:'Archers aiguisés',
    desc:'+25% dégâts des Archers',
    effects:[{ type:'unitDmgMult', target:'archer', value:1.25 }], stackable:true },
  { id:'dmg_knight_c', rarity:'common', icon:'⚔️', name:'Lame affûtée',
    desc:'+25% dégâts des Chevaliers',
    effects:[{ type:'unitDmgMult', target:'knight', value:1.25 }], stackable:true },
  { id:'dmg_cannon_c', rarity:'common', icon:'💥', name:'Boulets renforcés',
    desc:'+25% dégâts des Canons',
    effects:[{ type:'unitDmgMult', target:'cannon', value:1.25 }], stackable:true },
  { id:'range_all_c', rarity:'common', icon:'🎯', name:'Vue perçante',
    desc:'+10% portée pour toutes les unités',
    effects:[{ type:'unitRangeMult', target:'*', value:1.10 }], stackable:true },
  { id:'speed_all_c', rarity:'common', icon:'⏱️', name:'Cadence vive',
    desc:'+10% cadence d\'attaque',
    effects:[{ type:'unitAtkSpeedMult', target:'*', value:1.10 }], stackable:true },
  { id:'gold_c', rarity:'common', icon:'💰', name:'Pillage',
    desc:'+25% or gagné par ennemi',
    effects:[{ type:'goldMult', target:'*', value:1.25 }], stackable:true },
  { id:'regen_c', rarity:'common', icon:'❤️', name:'Maçon errant',
    desc:'Forteresse récupère 1 PV par vague',
    effects:[{ type:'fortressRegen', target:'*', value:1 }], stackable:true },
  { id:'crit_c', rarity:'common', icon:'🎲', name:'Coup chanceux',
    desc:'+5% de chance critique (×2 dégâts)',
    effects:[{ type:'critChance', target:'*', value:0.05 }], stackable:true },

  // ===== RARE (specialized) =====
  { id:'dmg_mage_r', rarity:'rare', icon:'🔮', name:'Concentration arcanique',
    desc:'+45% dégâts des Mages et Glace',
    effects:[
      { type:'unitDmgMult', target:'mage', value:1.45 },
      { type:'unitDmgMult', target:'ice', value:1.45 }
    ], stackable:true },
  { id:'frost_long_r', rarity:'rare', icon:'🧊', name:'Givre persistant',
    desc:'+50% durée des effets de ralentissement',
    effects:[{ type:'enemySlowDur', target:'*', value:1.50 }], stackable:true },
  { id:'burn_strong_r', rarity:'rare', icon:'🔥', name:'Flamme dévorante',
    desc:'+60% dégâts de brûlure',
    effects:[{ type:'burnDmgMult', target:'*', value:1.60 }], stackable:true },
  { id:'tower_dmg_r', rarity:'rare', icon:'🏗️', name:'Renforts militaires',
    desc:'+35% dégâts pour toutes les Tours',
    effects:[{ type:'unitDmgMultByKind', target:'tower', value:1.35 }], stackable:true },
  { id:'hero_dmg_r', rarity:'rare', icon:'🛡️', name:'Cris de guerre',
    desc:'+35% dégâts pour tous les Héros',
    effects:[{ type:'unitDmgMultByKind', target:'hero', value:1.35 }], stackable:true },
  { id:'crit_strong_r', rarity:'rare', icon:'💢', name:'Coup mortel',
    desc:'+10% chance critique et +50% multiplicateur critique',
    effects:[
      { type:'critChance', target:'*', value:0.10 },
      { type:'critMult', target:'*', value:0.5 }
    ], stackable:true },
  { id:'dragon_breath_r', rarity:'rare', icon:'🐉', name:'Souffle ardent',
    desc:'+50% dégâts du Dragon, brûlure plus forte',
    effects:[
      { type:'unitDmgMult', target:'dragon', value:1.50 },
      { type:'burnDmgMult', target:'*', value:1.30 }
    ], stackable:true },
  { id:'tesla_chain_r', rarity:'rare', icon:'⚡', name:'Surcharge',
    desc:'+1 cible de chaîne pour les Tesla',
    effects:[{ type:'flag', target:'teslaExtraChain', value:1 }], stackable:true },

  // ===== EPIC (powerful effects) =====
  { id:'cannon_explode_e', rarity:'epic', icon:'💣', name:'Canons explosifs',
    desc:'Les Canons libèrent une explosion AOE supplémentaire à l\'impact',
    effects:[{ type:'flag', target:'cannonExplodes', value:true }] },
  { id:'archer_double_e', rarity:'epic', icon:'🏹', name:'Tir double',
    desc:'Archers et Balistes tirent 2 projectiles à chaque attaque',
    effects:[{ type:'flag', target:'doubleProjectile', value:true }] },
  { id:'mass_dmg_e', rarity:'epic', icon:'💀', name:'Annihilation',
    desc:'+60% dégâts pour TOUTES les unités',
    effects:[{ type:'unitDmgMult', target:'*', value:1.60 }], stackable:true },
  { id:'gold_rush_e', rarity:'epic', icon:'💰', name:'Ruée vers l\'or',
    desc:'+80% or et +5 or chaque vague',
    effects:[
      { type:'goldMult', target:'*', value:1.80 },
      { type:'flag', target:'bonusGoldPerWave', value:5 }
    ], stackable:true },
  { id:'fortress_e', rarity:'epic', icon:'🏰', name:'Donjon imprenable',
    desc:'+10 PV max forteresse, regen +2/vague',
    effects:[
      { type:'flag', target:'fortressMaxBonus', value:10 },
      { type:'fortressRegen', target:'*', value:2 }
    ], stackable:true },
  { id:'pierce_all_e', rarity:'epic', icon:'➡️', name:'Projectiles perçants',
    desc:'Tous les projectiles traversent un ennemi supplémentaire',
    effects:[{ type:'flag', target:'projectilePierce', value:1 }], stackable:true },
  { id:'frost_shatter_e', rarity:'epic', icon:'❄️', name:'Givre brisant',
    desc:'Les ennemis ralentis subissent +50% de dégâts',
    effects:[{ type:'flag', target:'frostShatter', value:0.5 }] },
  { id:'wave_blast_e', rarity:'epic', icon:'🌊', name:'Onde de choc',
    desc:'À chaque vague nettoyée: dégâts AOE à tous les ennemis vivants',
    effects:[{ type:'flag', target:'waveBlastDmg', value:50 }] },

  // ===== LEGENDARY (game-changing) =====
  { id:'overkill_l', rarity:'legendary', icon:'⚡', name:'Massacre',
    desc:'+150% dégâts mais ennemis 25% plus rapides',
    effects:[
      { type:'unitDmgMult', target:'*', value:2.5 },
      { type:'enemySpdMult', target:'*', value:1.25 }
    ] },
  { id:'merge_master_l', rarity:'legendary', icon:'🌟', name:'Maître fusion',
    desc:'Toutes les unités Rang 5 disponibles dans les invocations',
    effects:[{ type:'flag', target:'summonHighRank', value:5 }] },
  { id:'phoenix_l', rarity:'legendary', icon:'🔥', name:'Volonté du phénix',
    desc:'Première fois où la forteresse meurt: ressuscite avec 50% PV',
    effects:[{ type:'flag', target:'oneRevive', value:0.5 }] },
  { id:'storm_l', rarity:'legendary', icon:'⛈️', name:'Tempête divine',
    desc:'Toutes les 8s: éclair foudroie un ennemi aléatoire (très haut dmg)',
    effects:[{ type:'flag', target:'thunderInterval', value:8 }] }
];

// ===================================================================
// === RELICS (persistent, equipped before run, max 3) ===
// ===================================================================
MF.RELICS = {
  phoenix: {
    id:'phoenix', name:'Plume de Phénix', icon:'🔥',
    desc:'Ressuscite la forteresse avec 50% PV (1 fois par run).',
    cost:300, color:'#ff7028',
    effects:[{ type:'flag', target:'oneRevive', value:0.5 }]
  },
  chain_orb: {
    id:'chain_orb', name:'Orbe d\'Éclair en Chaîne', icon:'⚡',
    desc:'+1 cible de chaîne pour Tesla. Tesla : -25% cooldown.',
    cost:250, color:'#fff080',
    effects:[
      { type:'flag', target:'teslaExtraChain', value:1 },
      { type:'unitAtkSpeedMult', target:'tesla', value:1.25 }
    ]
  },
  blood_rune: {
    id:'blood_rune', name:'Rune de Sang', icon:'🩸',
    desc:'2% des dégâts infligés régénèrent la forteresse (cap 1 PV/sec).',
    cost:400, color:'#c83838',
    effects:[{ type:'flag', target:'lifesteal', value:0.02 }]
  },
  ancient_tome: {
    id:'ancient_tome', name:'Grimoire Ancien', icon:'📕',
    desc:'+30% dégâts magiques (Mage, Glace, Tesla).',
    cost:200, color:'#c070ff',
    effects:[
      { type:'unitDmgMult', target:'mage', value:1.30 },
      { type:'unitDmgMult', target:'ice', value:1.30 },
      { type:'unitDmgMult', target:'tesla', value:1.30 }
    ]
  },
  steel_aegis: {
    id:'steel_aegis', name:'Égide d\'Acier', icon:'🛡️',
    desc:'+8 PV max forteresse, +1 PV regen par vague.',
    cost:200, color:'#a0a8c0',
    effects:[
      { type:'flag', target:'fortressMaxBonus', value:8 },
      { type:'fortressRegen', target:'*', value:1 }
    ]
  },
  golden_chalice: {
    id:'golden_chalice', name:'Calice Doré', icon:'🏆',
    desc:'+30% or de tous les ennemis. Or de départ +50.',
    cost:250, color:'#ffd96a',
    effects:[
      { type:'goldMult', target:'*', value:1.30 },
      { type:'flag', target:'startGoldBonus', value:50 }
    ]
  },
  swift_boots: {
    id:'swift_boots', name:'Bottes du Vent', icon:'👢',
    desc:'+15% cadence d\'attaque pour toutes les unités.',
    cost:300, color:'#9adc6c',
    effects:[{ type:'unitAtkSpeedMult', target:'*', value:1.15 }]
  },
  void_lens: {
    id:'void_lens', name:'Lentille du Vide', icon:'🔭',
    desc:'+20% portée. +8% chance critique.',
    cost:350, color:'#6850a0',
    effects:[
      { type:'unitRangeMult', target:'*', value:1.20 },
      { type:'critChance', target:'*', value:0.08 }
    ]
  }
};

// ===================================================================
// === TALENTS (permanent meta progression) ===
// ===================================================================
// 6 categories × 2 talents (rank 0-3 each)
// === P7 refonte: 4 spécialisations en arbre avec prérequis ===
MF.TALENT_CATEGORIES = [
  { id:'dps',     name:'⚔️ DPS',        color:'#ff7878', desc:'Dégâts bruts et critiques' },
  { id:'tank',    name:'🛡️ Tank',       color:'#80c8ff', desc:'Défense de la forteresse' },
  { id:'mage',    name:'🔮 Mage',       color:'#c070ff', desc:'Sorts et statuts' },
  { id:'eco',     name:'💰 Économie',   color:'#ffd96a', desc:'Or et invocations' }
];

MF.TALENTS = {
  // Combat
  warrior_oath: {
    id:'warrior_oath', cat:'combat', name:'Serment du Guerrier', icon:'⚔️',
    desc:rank => '+' + (rank * 5) + '% dégâts mêlée et rangée',
    maxRank:3, costPerRank:[40, 80, 160],
    effectAt:rank => [{ type:'unitDmgMult', target:'*', value:1 + 0.05 * rank }]
  },
  battle_focus: {
    id:'battle_focus', cat:'combat', name:'Concentration', icon:'🎯',
    desc:rank => '+' + (rank * 3) + '% chance critique',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => [{ type:'critChance', target:'*', value:0.03 * rank }]
  },
  // Defense
  stone_skin: {
    id:'stone_skin', cat:'defense', name:'Peau de Pierre', icon:'🪨',
    desc:rank => '+' + (rank * 3) + ' PV forteresse max',
    maxRank:3, costPerRank:[40, 80, 160],
    effectAt:rank => [{ type:'flag', target:'fortressMaxBonus', value:3 * rank }]
  },
  reinforce: {
    id:'reinforce', cat:'defense', name:'Renforts', icon:'🧱',
    desc:rank => 'Forteresse régénère ' + rank + ' PV par vague',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => [{ type:'fortressRegen', target:'*', value:rank }]
  },
  // Economy
  thrift: {
    id:'thrift', cat:'economy', name:'Économe', icon:'💸',
    desc:rank => 'Or de départ +' + (rank * 25),
    maxRank:3, costPerRank:[40, 80, 160],
    effectAt:rank => [{ type:'flag', target:'startGoldBonus', value:25 * rank }]
  },
  greed: {
    id:'greed', cat:'economy', name:'Cupidité', icon:'💰',
    desc:rank => '+' + (rank * 10) + '% or des ennemis',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => [{ type:'goldMult', target:'*', value:1 + 0.10 * rank }]
  },
  // Magic
  arcane_might: {
    id:'arcane_might', cat:'magic', name:'Puissance Arcanique', icon:'🔮',
    desc:rank => '+' + (rank * 8) + '% dégâts magiques',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => {
      var v = 1 + 0.08 * rank;
      return [
        { type:'unitDmgMult', target:'mage', value:v },
        { type:'unitDmgMult', target:'ice', value:v },
        { type:'unitDmgMult', target:'tesla', value:v },
        { type:'unitDmgMult', target:'fire', value:v },
        { type:'unitDmgMult', target:'frost', value:v }
      ];
    }
  },
  cold_grip: {
    id:'cold_grip', cat:'magic', name:'Étreinte Glacée', icon:'❄️',
    desc:rank => '+' + (rank * 10) + '% durée des ralentissements',
    maxRank:3, costPerRank:[40, 80, 160],
    effectAt:rank => [{ type:'enemySlowDur', target:'*', value:1 + 0.10 * rank }]
  },
  // Fortune
  lucky_strike: {
    id:'lucky_strike', cat:'fortune', name:'Frappe Chanceuse', icon:'🍀',
    desc:rank => '+' + (rank * 15) + '% multiplicateur critique',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => [{ type:'critMult', target:'*', value:0.15 * rank }]
  },
  rare_finds: {
    id:'rare_finds', cat:'fortune', name:'Trésors Rares', icon:'💎',
    desc:rank => '+' + (rank * 6) + '% chance de tirer Rare/Épique/Légendaire',
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt:rank => [{ type:'flag', target:'rarityBoost', value:0.06 * rank }]
  },
  // Arcane
  swift_summon: {
    id:'swift_summon', cat:'arcane', name:'Invocation Rapide', icon:'✨',
    desc:rank => 'Coût d\'invocation -' + (rank * 8) + '%',
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt:rank => [{ type:'flag', target:'summonCostMult', value:1 - 0.08 * rank }]
  },
  battle_aura: {
    id:'battle_aura', cat:'eco', name:'Aura de Bataille', icon:'⭐',
    desc:rank => '+' + (rank * 4) + '% portée et cadence pour toutes les unités',
    maxRank:3, costPerRank:[80, 160, 320], requires:'swift_summon',
    effectAt:rank => {
      var v = 1 + 0.04 * rank;
      return [
        { type:'unitRangeMult', target:'*', value:v },
        { type:'unitAtkSpeedMult', target:'*', value:v }
      ];
    }
  }
};

// === P7 refonte: remap existing talents to 4 specs + add prerequisites ===
(function _remapTalentsP7(){
  if (!MF.TALENTS) return;
  // DPS spec — chain: warrior_oath → battle_focus → lucky_strike → rare_finds
  if (MF.TALENTS.warrior_oath){ MF.TALENTS.warrior_oath.cat = 'dps'; }
  if (MF.TALENTS.battle_focus){ MF.TALENTS.battle_focus.cat = 'dps'; MF.TALENTS.battle_focus.requires = 'warrior_oath'; }
  if (MF.TALENTS.lucky_strike){ MF.TALENTS.lucky_strike.cat = 'dps'; MF.TALENTS.lucky_strike.requires = 'battle_focus'; }
  if (MF.TALENTS.rare_finds){   MF.TALENTS.rare_finds.cat = 'dps'; MF.TALENTS.rare_finds.requires = 'lucky_strike'; }
  // Tank spec — stone_skin → reinforce
  if (MF.TALENTS.stone_skin){ MF.TALENTS.stone_skin.cat = 'tank'; }
  if (MF.TALENTS.reinforce){  MF.TALENTS.reinforce.cat = 'tank'; MF.TALENTS.reinforce.requires = 'stone_skin'; }
  // Mage spec — arcane_might → cold_grip
  if (MF.TALENTS.arcane_might){ MF.TALENTS.arcane_might.cat = 'mage'; }
  if (MF.TALENTS.cold_grip){    MF.TALENTS.cold_grip.cat = 'mage'; MF.TALENTS.cold_grip.requires = 'arcane_might'; }
  // Eco spec — thrift → greed → swift_summon
  if (MF.TALENTS.thrift){       MF.TALENTS.thrift.cat = 'eco'; }
  if (MF.TALENTS.greed){        MF.TALENTS.greed.cat = 'eco'; MF.TALENTS.greed.requires = 'thrift'; }
  if (MF.TALENTS.swift_summon){ MF.TALENTS.swift_summon.cat = 'eco'; MF.TALENTS.swift_summon.requires = 'greed'; }

  // === New P7 talents (2 per spec to fill out trees) ===
  MF.TALENTS.berserker = {
    id:'berserker', cat:'dps', name:'Berserker', icon:'😡', requires:'warrior_oath',
    desc: function(rank){ return '+' + (rank * 6) + '% cadence d\'attaque'; },
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt: function(rank){ return [{ type:'unitAtkSpeedMult', target:'*', value:1 + 0.06 * rank }]; }
  };
  MF.TALENTS.executioner = {
    id:'executioner', cat:'dps', name:'Bourreau', icon:'🪓', requires:'rare_finds',
    desc: function(rank){ return '+' + (rank * 12) + '% dégâts contre boss'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(rank){ return [{ type:'flag', target:'bossDmgMult', value:1 + 0.12 * rank }]; }
  };
  MF.TALENTS.iron_walls = {
    id:'iron_walls', cat:'tank', name:'Murs de Fer', icon:'⛓', requires:'reinforce',
    desc: function(rank){ return 'Réduit dégâts forteresse de ' + (rank * 8) + '%'; },
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt: function(rank){ return [{ type:'flag', target:'fortressDmgReduce', value:0.08 * rank }]; }
  };
  MF.TALENTS.guardian = {
    id:'guardian', cat:'tank', name:'Gardien', icon:'⚔🛡', requires:'reinforce',
    desc: function(rank){ return '+' + (rank * 5) + ' PV max forteresse'; },
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt: function(rank){ return [{ type:'flag', target:'fortressMaxBonus', value:5 * rank }]; }
  };
  MF.TALENTS.elemental_focus = {
    id:'elemental_focus', cat:'mage', name:'Concentration Élémentaire', icon:'🌀', requires:'cold_grip',
    desc: function(rank){ return '+' + (rank * 12) + '% dégâts statuts (brûlure, gel)'; },
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt: function(rank){ return [{ type:'flag', target:'statusDmgMult', value:1 + 0.12 * rank }]; }
  };
  MF.TALENTS.archmage = {
    id:'archmage', cat:'mage', name:'Archimage', icon:'🧙', requires:'arcane_might',
    desc: function(rank){ return '+' + (rank * 5) + '% portée des sorts'; },
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt: function(rank){
      var v = 1 + 0.05 * rank;
      return [
        { type:'unitRangeMult', target:'mage', value:v },
        { type:'unitRangeMult', target:'tesla', value:v },
        { type:'unitRangeMult', target:'fire', value:v },
        { type:'unitRangeMult', target:'frost', value:v }
      ];
    }
  };
  MF.TALENTS.merchant = {
    id:'merchant', cat:'eco', name:'Marchand', icon:'🏪', requires:'thrift',
    desc: function(rank){ return 'Coût des invocations -' + (rank * 5) + '% additif'; },
    maxRank:3, costPerRank:[60, 120, 240],
    effectAt: function(rank){ return [{ type:'flag', target:'summonCostExtra', value:0.05 * rank }]; }
  };
  MF.TALENTS.tycoon = {
    id:'tycoon', cat:'eco', name:'Magnat', icon:'💎', requires:'greed',
    desc: function(rank){ return '+' + (rank * 8) + '% or par vague nettoyée'; },
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt: function(rank){ return [{ type:'flag', target:'waveGoldMult', value:1 + 0.08 * rank }]; }
  };
})();

// ===================================================================
// === MODIFIERS (procedural — apply at start of run, mix +/-) ===
// ===================================================================
MF.MODIFIERS = {
  // Negative
  swift_horde: {
    id:'swift_horde', kind:'neg', icon:'🏃', name:'Horde rapide',
    desc:'Ennemis +30% vitesse',
    effects:[{ type:'enemySpdMult', target:'*', value:1.30 }]
  },
  tough_skin: {
    id:'tough_skin', kind:'neg', icon:'🛡️', name:'Peaux durcies',
    desc:'Ennemis +25% PV',
    effects:[{ type:'enemyHpMult', target:'*', value:1.25 }]
  },
  exploding: {
    id:'exploding', kind:'neg', icon:'💥', name:'Carcasses explosives',
    desc:'Les ennemis explosent en mourant (-1 PV forteresse à chaque mort proche)',
    effects:[{ type:'flag', target:'enemyExplodeOnDeath', value:true }]
  },
  fog: {
    id:'fog', kind:'neg', icon:'🌫️', name:'Brouillard épais',
    desc:'Portée des unités -15%',
    effects:[{ type:'unitRangeMult', target:'*', value:0.85 }]
  },
  elite_only: {
    id:'elite_only', kind:'neg', icon:'👑', name:'Vagues d\'élites',
    desc:'1 vague sur 3 ne contient que des élites/blindés',
    effects:[{ type:'flag', target:'eliteWaves', value:true }]
  },
  // Positive
  treasure: {
    id:'treasure', kind:'pos', icon:'💰', name:'Filon trésor',
    desc:'+50% or par ennemi',
    effects:[{ type:'goldMult', target:'*', value:1.50 }]
  },
  heroic: {
    id:'heroic', kind:'pos', icon:'⚔️', name:'Élans héroïques',
    desc:'+25% dégâts pour toutes les unités',
    effects:[{ type:'unitDmgMult', target:'*', value:1.25 }]
  },
  rapid_offer: {
    id:'rapid_offer', kind:'pos', icon:'🎁', name:'Offre rapide',
    desc:'Choix d\'upgrade toutes les 3 vagues (au lieu de 5)',
    effects:[{ type:'flag', target:'upgradeFreq', value:3 }]
  }
};

// Helper: pick random upgrade with rarity weighting
MF.drawRandomUpgrade = function(rarityBoost){
  rarityBoost = rarityBoost || 0;
  // Build weighted pool
  var totalW = 0;
  var weights = {};
  Object.keys(MF.RARITIES).forEach(function(k){
    var w = MF.RARITIES[k].weight;
    if (k !== 'common') w *= (1 + rarityBoost);
    weights[k] = w;
    totalW += w;
  });
  var roll = Math.random() * totalW;
  var picked = 'common';
  for (var k in weights){
    if (roll < weights[k]){ picked = k; break; }
    roll -= weights[k];
  }
  // Pick random of that rarity
  var pool = MF.UPGRADES.filter(function(u){ return u.rarity === picked; });
  if (!pool.length) pool = MF.UPGRADES.filter(function(u){ return u.rarity === 'common'; });
  return pool[Math.floor(Math.random() * pool.length)];
};

MF.drawNUpgrades = function(n, rarityBoost){
  var picks = [];
  var seen = {};
  var attempts = 0;
  while (picks.length < n && attempts < 60){
    var u = MF.drawRandomUpgrade(rarityBoost);
    if (u.stackable || !seen[u.id]){
      picks.push(u);
      seen[u.id] = true;
    }
    attempts++;
  }
  return picks;
};

// Pick a random set of run modifiers (mix neg/pos)
MF.drawRunModifiers = function(){
  // 1-2 neg + 0-1 pos depending on random
  var neg = Object.keys(MF.MODIFIERS).filter(function(k){ return MF.MODIFIERS[k].kind === 'neg'; });
  var pos = Object.keys(MF.MODIFIERS).filter(function(k){ return MF.MODIFIERS[k].kind === 'pos'; });
  var picks = [];
  // 1-2 negative
  var nNeg = 1 + Math.floor(Math.random() * 2);
  for (var i = 0; i < nNeg && neg.length; i++){
    var idx = Math.floor(Math.random() * neg.length);
    picks.push(MF.MODIFIERS[neg[idx]]);
    neg.splice(idx, 1);
  }
  // Maybe 1 positive
  if (Math.random() < 0.7 && pos.length){
    picks.push(MF.MODIFIERS[pos[Math.floor(Math.random() * pos.length)]]);
  }
  return picks;
};
