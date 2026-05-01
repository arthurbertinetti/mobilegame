// === Merge Fortress TD — Chaos Survival Mode data ===
// Auras / Orbiters / Ultimates / Hybrid recipes / Chaos modifiers
window.MF = window.MF || {};

// === AURAS — passive DPS rings around heroes (auto-unlocked at certain ranks) ===
// Type: { id, name, range, dps, color, hue }
MF.AURAS = {
  fire_aura: {
    id:'fire_aura', name:'Aura de feu', icon:'🔥',
    range: 2.2, dps: 30, color: 0xff7028, dpsPerRank: 12,
    statusOnHit: { type:'burn', dur: 1.5, dps: 0.05 }
  },
  frost_aura: {
    id:'frost_aura', name:'Aura glaciale', icon:'❄️',
    range: 2.5, dps: 18, color: 0x80c8ff, dpsPerRank: 7,
    statusOnHit: { type:'slow', dur: 1.0, mult: 0.65 }
  },
  shock_aura: {
    id:'shock_aura', name:'Aura électrique', icon:'⚡',
    range: 2.0, dps: 40, color: 0xfff080, dpsPerRank: 16,
    statusOnHit: null
  },
  void_aura: {
    id:'void_aura', name:'Aura du vide', icon:'🌑',
    range: 2.4, dps: 25, color: 0x9050d0, dpsPerRank: 10,
    statusOnHit: null
  },
  blood_aura: {
    id:'blood_aura', name:'Aura de sang', icon:'🩸',
    range: 1.8, dps: 35, color: 0xff3838, dpsPerRank: 14,
    lifestealRatio: 0.04
  }
};

// Heroes get auras automatically at rank 3+ (which aura depends on hero type)
MF.HERO_AURAS = {
  knight:  { rank3: 'blood_aura',  rank5: 'blood_aura'  },
  archer:  { rank3: null,          rank5: 'shock_aura' },
  mage:    { rank3: 'void_aura',   rank5: 'void_aura'   },
  ice:     { rank3: 'frost_aura',  rank5: 'frost_aura'  },
  bomb:    { rank3: 'fire_aura',   rank5: 'fire_aura'   },
  dragon:  { rank3: 'fire_aura',   rank5: 'fire_aura'   },
  cannon:  { rank3: null,          rank5: 'fire_aura'   },
  ballista:{ rank3: null,          rank5: 'shock_aura'  },
  tesla:   { rank3: 'shock_aura',  rank5: 'shock_aura'  },
  fire:    { rank3: 'fire_aura',   rank5: 'fire_aura'   },
  frost:   { rank3: 'frost_aura',  rank5: 'frost_aura'  }
};

// === ORBITERS — small projectiles rotating around heroes (manual equip in P2, auto-spawned for now) ===
MF.ORBITERS = {
  blade: {
    id:'blade', name:'Lame Tournoyante', icon:'🗡️',
    count: 3, radius: 1.2, dmg: 25, rotSpeed: 2.0, color: 0xeeeeff
  },
  fireball: {
    id:'fireball', name:'Boule de Feu', icon:'🔥',
    count: 2, radius: 1.5, dmg: 35, rotSpeed: 1.5, color: 0xff7028,
    splashRadius: 0.7
  },
  crystal: {
    id:'crystal', name:'Cristal de Glace', icon:'💎',
    count: 4, radius: 1.0, dmg: 18, rotSpeed: 2.5, color: 0xa8e8ff,
    statusOnHit: { type:'slow', dur: 1.5, mult: 0.65 }
  },
  star: {
    id:'star', name:'Étoile Dorée', icon:'⭐',
    count: 2, radius: 1.4, dmg: 60, rotSpeed: 1.2, color: 0xffd96a,
    isLegendary: true
  }
};

// === ULTIMATES — single equipped at run start, charged by kills ===
MF.ULTIMATES = {
  meteor: {
    id:'meteor', name:'Pluie de Météores', icon:'☄️',
    desc:'10 météores tombent sur la zone — gros dégâts AOE',
    cooldown: 35,             // seconds
    chargePerKill: 0.40,       // % cooldown gained per kill
    effect: { type:'meteor', count: 10, dmg: 250, radius: 1.3 }
  },
  freeze: {
    id:'freeze', name:'Gel Arcanique', icon:'❄️',
    desc:'Gèle tous les ennemis 4s + dégâts',
    cooldown: 30,
    chargePerKill: 0.45,
    effect: { type:'freeze', dur: 4.0, dmg: 100 }
  },
  thunder: {
    id:'thunder', name:'Tonnerre Divin', icon:'⚡',
    desc:'Foudroie 8 ennemis prioritaires (boss inclus)',
    cooldown: 28,
    chargePerKill: 0.50,
    effect: { type:'thunder', count: 8, dmgMult: 4 }
  },
  shockwave: {
    id:'shockwave', name:'Onde Sismique', icon:'💥',
    desc:'Onde géante AOE — élimine les ennemis faibles instantanément',
    cooldown: 25,
    chargePerKill: 0.55,
    effect: { type:'shockwave', dmg: 180, radius: 6.0, killThreshold: 0.30 }
  },
  blackhole: {
    id:'blackhole', name:'Trou Noir', icon:'🌀',
    desc:'Aspire tous les ennemis vers le centre puis explose',
    cooldown: 40,
    chargePerKill: 0.35,
    effect: { type:'blackhole', dur: 2.5, dmg: 320, radius: 7.0, pullStrength: 6 }
  },
  tornado: {
    id:'tornado', name:'Tornade Errante', icon:'🌪️',
    desc:'Tornade qui parcourt l\'arène en touchant tout sur son passage',
    cooldown: 32,
    chargePerKill: 0.42,
    effect: { type:'tornado', dur: 5.0, dmgPerSec: 80, radius: 1.6, speed: 4.5 }
  },
  summon: {
    id:'summon', name:'Convocation Divine', icon:'👼',
    desc:'Invoque 3 héros R3 sur des cellules libres pour 20s',
    cooldown: 45,
    chargePerKill: 0.30,
    effect: { type:'summon', count: 3, rank: 3, dur: 20 }
  },
  shield: {
    id:'shield', name:'Égide Sacrée', icon:'🛡️',
    desc:'Forteresse invulnérable 6s + soin 30% PV max',
    cooldown: 50,
    chargePerKill: 0.28,
    effect: { type:'shield', dur: 6.0, healPct: 0.3 }
  }
};

// === HYBRID FUSION RECIPES — secret merges (R5 + R5 of compatible types) ===
MF.HYBRIDS = {
  flame_ranger: {
    id:'flame_ranger', name:'Rôdeur de Flammes', icon:'🔥🏹', kind:'hybrid',
    recipe: ['archer', 'fire'],   // both at rank 5 (any order)
    desc:'Flèches enflammées qui explosent à l\'impact. Aura de feu.',
    attack: { type:'splash', range: 5.5, atkSpeed: 1.6, projSpeed: 30, projColor: 0xff7028,
              splashRadius: 1.6, hitsFlying: true,
              status: { type:'burn', dur: 3.5, dps: 0.30 } },
    dmg: 280, color: 0xff8a40, scale: 1.55,
    autoAura: 'fire_aura'
  },
  storm_sage: {
    id:'storm_sage', name:'Sage des Tempêtes', icon:'⚡❄️', kind:'hybrid',
    recipe: ['ice', 'tesla'],
    desc:'Foudre glaçante en chaîne (5 cibles). Aura de givre.',
    attack: { type:'chain', range: 4.5, atkSpeed: 1.4, projSpeed: 60, projColor: 0xa8f0ff,
              chainCount: 5, chainRadius: 3.5, hitsFlying: true,
              status: { type:'slow', dur: 2.5, mult: 0.45 } },
    dmg: 220, color: 0x80c8ff, scale: 1.55,
    autoAura: 'frost_aura'
  },
  dragon_paladin: {
    id:'dragon_paladin', name:'Paladin Dragon', icon:'🐉🛡️', kind:'hybrid',
    recipe: ['knight', 'dragon'],
    desc:'Souffle divin perçant. Aura de sang régénératrice.',
    attack: { type:'pierce', range: 5.5, atkSpeed: 1.2, projSpeed: 28, projColor: 0xffd96a,
              hitsFlying: true,
              status: { type:'burn', dur: 3.0, dps: 0.25 } },
    dmg: 360, color: 0xffd96a, scale: 1.65,
    autoAura: 'blood_aura'
  },
  frost_archer: {
    id:'frost_archer', name:'Archère Glaciale', icon:'❄️🏹', kind:'hybrid',
    recipe: ['archer', 'frost'],
    desc:'Flèches de cristal qui transpercent et ralentissent une lignée.',
    attack: { type:'pierce', range: 5.8, atkSpeed: 1.55, projSpeed: 32, projColor: 0xa8e8ff,
              hitsFlying: true,
              status: { type:'slow', dur: 2.8, mult: 0.40 } },
    dmg: 240, color: 0xa8e8ff, scale: 1.55,
    autoAura: 'frost_aura'
  },
  arcane_knight: {
    id:'arcane_knight', name:'Chevalier Arcanique', icon:'⚔️🔮', kind:'hybrid',
    recipe: ['knight', 'mage'],
    desc:'Lame d\'éther qui explose à l\'impact. Aura du vide.',
    attack: { type:'splash', range: 4.0, atkSpeed: 1.1, projSpeed: 24, projColor: 0xc060ff,
              splashRadius: 1.4, hitsFlying: true },
    dmg: 320, color: 0xc060ff, scale: 1.60,
    autoAura: 'void_aura'
  },
  inferno_lord: {
    id:'inferno_lord', name:'Seigneur Infernal', icon:'💣🐉', kind:'hybrid',
    recipe: ['bomb', 'dragon'],
    desc:'Bombe drakanique : énorme AOE feu qui brûle longtemps.',
    attack: { type:'splash', range: 4.5, atkSpeed: 0.7, projSpeed: 16, projColor: 0xff4828,
              splashRadius: 2.4, hitsFlying: true,
              status: { type:'burn', dur: 4.5, dps: 0.45 } },
    dmg: 420, color: 0xff5028, scale: 1.70,
    autoAura: 'fire_aura'
  }
};

// Helper: check if 2 unit ids form a hybrid recipe (both must be rank 5)
MF.checkHybridRecipe = function(idA, idB){
  for (var hid in MF.HYBRIDS){
    var h = MF.HYBRIDS[hid];
    if (!h.recipe) continue;
    if ((h.recipe[0] === idA && h.recipe[1] === idB) ||
        (h.recipe[0] === idB && h.recipe[1] === idA)){
      return h;
    }
  }
  return null;
};

// === UNLOCKABLE HEROES — Paladin + Necromancer (300 frags each) ===
MF.UNLOCKABLE_HEROES = {
  paladin: {
    id:'paladin', kind:'hero', name:'Paladin', icon:'🛡✨', summonable: true, unlockCost: 300,
    desc:'Tank lourd qui soigne ses alliés et la forteresse. Aura de soin R3+.',
    attack: { type:'splash', range: 2.6, atkSpeed: 0.8, projSpeed: 18, projColor: 0xfff0a0,
              splashRadius: 1.4, hitsFlying: false },
    healOnHit: 0.3,
    autoAura: 'fire_aura'
  },
  necromancer: {
    id:'necromancer', kind:'hero', name:'Nécromancien', icon:'☠️🔮', summonable: true, unlockCost: 300,
    desc:'Mage sombre. Chaque kill peut invoquer un squelette temporaire (10s).',
    attack: { type:'splash', range: 3.6, atkSpeed: 0.85, projSpeed: 16, projColor: 0x9050d0,
              splashRadius: 1.0, hitsFlying: true },
    summonOnKillChance: 0.20,
    autoAura: 'void_aura'
  }
};

// Register unlockable heroes — they exist in MF.UNITS but only summonable if owned
(function registerUnlockableHeroes(){
  if (!MF.UNITS) return;
  Object.keys(MF.UNLOCKABLE_HEROES).forEach(function(hid){
    var def = MF.UNLOCKABLE_HEROES[hid];
    var c = (hid === 'paladin') ? 0xfff0a0 : 0x9050d0;
    MF.UNITS[hid] = Object.assign({}, def, {
      ranks: [
        { dmg: 30,  color: c,        scale: 1.0  },
        { dmg: 58,  color: c,        scale: 1.10 },
        { dmg: 110, color: c,        scale: 1.22 },
        { dmg: 200, color: c,        scale: 1.36 },
        { dmg: 380, color: 0xffd96a, scale: 1.55 }
      ]
    });
  });
})();

// === SHOP — consumables (one-shot use during play) ===
MF.SHOP_ITEMS = {
  heal_potion:   { id:'heal_potion',   name:'Potion de Soin',   icon:'🧪', cost: 30, desc:'+5 PV instant à la forteresse' },
  free_summon:   { id:'free_summon',   name:'Invocation Gratuite', icon:'✨', cost: 25, desc:'Prochaine invocation héros offerte' },
  double_gold:   { id:'double_gold',   name:'Pluie d\'Or',     icon:'💰', cost: 80, desc:'×2 or sur tous les kills pendant 30s' },
  skip_wave:    { id:'skip_wave',    name:'Saut de Vague',   icon:'⏭', cost: 100, desc:'Termine la vague active instantanément (campagne/endless)' },
  reroll_skin:   { id:'reroll_skin',   name:'Reroll Skin',     icon:'🎲', cost: 50, desc:'Débloque un skin aléatoire d\'un héros possédé' }
};

// === SKINS — color palette variants per hero (with stat bonuses, P13) ===
// id, name, icon, cost, tint, statBonus (multiplicateur appliqué quand le skin est équipé)
MF.SKINS = {
  default:  { id:'default',  name:'Standard',  icon:'⚪', cost: 0,    tint: null, statBonus: null, statDesc: 'Skin de base, aucun bonus.' },
  gold:     { id:'gold',     name:'Or Royal',  icon:'🟡', cost: 200,  tint: { h: 50,  s: 0.85, l: 0.55 },
              statBonus: { goldMult: 1.10 }, statDesc: '+10% or des kills' },
  shadow:   { id:'shadow',   name:'Ombre',     icon:'⚫', cost: 400,  tint: { h: 270, s: 0.45, l: 0.3 },
              statBonus: { atkSpeedMult: 1.15 }, statDesc: '+15% cadence d\'attaque' },
  blood:    { id:'blood',    name:'Sang',      icon:'🔴', cost: 500,  tint: { h: 0,   s: 0.85, l: 0.45 },
              statBonus: { lifesteal: 0.05 }, statDesc: '+5% lifesteal sur dmg' },
  arcane:   { id:'arcane',   name:'Arcane',    icon:'🟣', cost: 600,  tint: { h: 280, s: 0.85, l: 0.55 },
              statBonus: { aoeDmgMult: 1.20 }, statDesc: '+20% dmg sorts/AOE' },
  neon:     { id:'neon',     name:'Néon',      icon:'💚', cost: 700,  tint: { h: 130, s: 1.0, l: 0.55 },
              statBonus: { rangeMult: 1.10 }, statDesc: '+10% portée' },
  royal:    { id:'royal',    name:'Royal',     icon:'👑', cost: 800,  tint: { h: 220, s: 0.7, l: 0.5 },
              statBonus: { dmgMult: 1.10 }, statDesc: '+10% dégâts directs' },
  infernal: { id:'infernal', name:'Infernal',  icon:'🔥', cost: 900,  tint: { h: 15,  s: 1.0, l: 0.45 },
              statBonus: { burnDmgMult: 1.15 }, statDesc: '+15% dégâts brûlure' },
  ethereal: { id:'ethereal', name:'Éthéré',    icon:'☁️', cost: 1000, tint: { h: 200, s: 0.4, l: 0.85 },
              statBonus: { dodgeChance: 0.10 }, statDesc: '10% chance d\'esquive' },
  rainbow:  { id:'rainbow',  name:'Arc-en-ciel',icon:'🌈',cost: 1200, tint: { h: 0,   s: 0.95, l: 0.55 }, animated: true,
              statBonus: { randomBuff: true }, statDesc: 'Buff aléatoire à chaque run' },
  cosmic:   { id:'cosmic',   name:'Cosmique',  icon:'🌌', cost: 3000, tint: { h: 250, s: 0.9, l: 0.4 }, legendary: true, particles: 0xc070ff,
              statBonus: { critChance: 0.25 }, statDesc: '+25% chance critique' },
  void:     { id:'void',     name:'Néant',     icon:'🕳', cost: 3000, tint: { h: 290, s: 0.7, l: 0.15 }, legendary: true, particles: 0x6020a0,
              statBonus: { dmgMult: 1.20, defense: 0.10 }, statDesc: '+20% dégâts, 10% défense' }
};

// Apply skin stat bonuses to a unit (called from rl_computeDamage and elsewhere)
MF.applySkinStats = function(unit){
  if (!unit) return null;
  var meta = MF.state.meta;
  if (!meta || !meta.equippedSkins) return null;
  var skinId = meta.equippedSkins[unit.id];
  if (!skinId || skinId === 'default') return null;
  var skin = MF.SKINS[skinId];
  if (!skin || !skin.statBonus) return null;
  var bonus = skin.statBonus;
  // For 'rainbow', resolve to a random buff at run start (cached on the unit)
  if (bonus.randomBuff){
    if (!unit._rainbowBuff){
      var pool = [{dmgMult:1.15},{atkSpeedMult:1.20},{rangeMult:1.15},{critChance:0.20}];
      unit._rainbowBuff = pool[Math.floor(Math.random() * pool.length)];
    }
    return unit._rainbowBuff;
  }
  return bonus;
};

// Apply skin to a base hex color (returns new hex)
MF.applySkinTint = function(baseHex, skinId){
  if (!skinId || skinId === 'default') return baseHex;
  var skin = MF.SKINS[skinId];
  if (!skin || !skin.tint) return baseHex;
  // Convert HSL to RGB
  var h = skin.tint.h / 360, s = skin.tint.s, l = skin.tint.l;
  function hue2rgb(p, q, t){
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  var r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  var g = Math.round(hue2rgb(p, q, h) * 255);
  var b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  return (r << 16) | (g << 8) | b;
};

// Register hybrids as standard MF.UNITS entries so they integrate seamlessly.
// They appear as a single "rank 1" but visually stand out (special scale, color, halo).
(function registerHybrids(){
  if (!MF.UNITS) return;
  Object.keys(MF.HYBRIDS).forEach(function(hid){
    var h = MF.HYBRIDS[hid];
    var c = h.color || 0xffd96a;
    MF.UNITS[hid] = {
      id: hid, kind: 'hero', name: h.name, icon: h.icon, summonable: false,
      isHybrid: true, recipe: h.recipe, autoAura: h.autoAura,
      desc: h.desc,
      attack: h.attack,
      ranks: [
        { dmg: h.dmg, color: c, scale: h.scale || 1.55 },
        { dmg: Math.round(h.dmg * 1.2), color: c, scale: (h.scale || 1.55) * 1.05 },
        { dmg: Math.round(h.dmg * 1.45), color: c, scale: (h.scale || 1.55) * 1.10 },
        { dmg: Math.round(h.dmg * 1.75), color: c, scale: (h.scale || 1.55) * 1.15 },
        { dmg: Math.round(h.dmg * 2.10), color: c, scale: (h.scale || 1.55) * 1.20 }
      ]
    };
  });
})();

// === CHAOS MODIFIERS — only apply in chaos mode (besides standard ones) ===
MF.CHAOS_MODIFIERS = {
  density_x2: { id:'density_x2', kind:'neg', icon:'🌀', name:'Vortex',
    desc:'Densité d\'ennemis ×1.5',
    effects:[{ type:'flag', target:'chaosDensityMult', value:1.5 }] },
  speed_storm: { id:'speed_storm', kind:'neg', icon:'💨', name:'Tempête',
    desc:'Ennemis +40% vitesse',
    effects:[{ type:'enemySpdMult', target:'*', value:1.40 }] },
  fragile_walls: { id:'fragile_walls', kind:'neg', icon:'🧱', name:'Murs Fragiles',
    desc:'PV forteresse -25%',
    effects:[{ type:'flag', target:'fortressMaxBonus', value:-8 }] },
  // Positive
  combo_master: { id:'combo_master', kind:'pos', icon:'🔥', name:'Maître du Combo',
    desc:'Chaque palier de combo: +5% dmg jusqu\'à +100%',
    effects:[{ type:'flag', target:'comboBoost', value:0.05 }] },
  ultimate_freq: { id:'ultimate_freq', kind:'pos', icon:'⚡', name:'Surcharge',
    desc:'Charge d\'ultime ×1.5 par kill',
    effects:[{ type:'flag', target:'ultimateChargeMult', value:1.5 }] },
  // === Map modifiers (chaos only) ===
  small_arena: { id:'small_arena', kind:'neg', icon:'📦', name:'Arène Resserrée',
    desc:'Grille 9×7 — moins de place, action plus dense',
    effects:[{ type:'flag', target:'mapSmall', value:true }] },
  fog: { id:'fog', kind:'neg', icon:'🌫', name:'Brouillard',
    desc:'Visibilité réduite — les ennemis surgissent du brouillard',
    effects:[{ type:'flag', target:'mapFog', value:true }] },
  eternal_night: { id:'eternal_night', kind:'neg', icon:'🌙', name:'Nuit Éternelle',
    desc:'Lumière ambiante coupée — éclairs ponctuels seulement',
    effects:[{ type:'flag', target:'mapNight', value:true }] },
  low_gravity: { id:'low_gravity', kind:'pos', icon:'🪶', name:'Gravité Réduite',
    desc:'Ennemis flottent et se déplacent comme des volants',
    effects:[{ type:'flag', target:'mapLowGrav', value:true }] }
};

// === CHAOS REWARDS — unlocked via deep runs, persistent (P2 will wire UI) ===
MF.CHAOS_REWARDS = {
  starter_aura: {
    id:'starter_aura', name:'Cœur Volcanique', icon:'🌋', cost: 200,
    desc:'Tous tes héros démarrent avec une mini-aura de feu (R1+)'
  },
  extra_orb_slot: {
    id:'extra_orb_slot', name:'Anneau Cosmique', icon:'🪐', cost: 350,
    desc:'+1 emplacement d\'orbiteur équipable'
  },
  combo_extender: {
    id:'combo_extender', name:'Talisman Tempo', icon:'⏱', cost: 400,
    desc:'Le combo persiste 3.5s sans kill (au lieu de 2s)'
  },
  legendary_drops: {
    id:'legendary_drops', name:'Étoile Filante', icon:'🌟', cost: 500,
    desc:'+1% chance de drop legendary par kill (cumulable)'
  },
  ultimate_x2: {
    id:'ultimate_x2', name:'Sceau de Foudre', icon:'⚡', cost: 600,
    desc:'L\'ultime charge 2× plus vite'
  },
  fortress_shield: {
    id:'fortress_shield', name:'Égide Suprême', icon:'🛡️', cost: 800,
    desc:'Forteresse +15 PV max en chaos'
  },
  bigger_aura: {
    id:'bigger_aura', name:'Cercle Élémentaire', icon:'⭕', cost: 1000,
    desc:'+30% rayon des auras'
  },
  apocalypse: {
    id:'apocalypse', name:'Apocalypse', icon:'☄️', cost: 2000,
    desc:'Au palier 30min, tu débloques des recettes hybrides supplémentaires'
  }
};
