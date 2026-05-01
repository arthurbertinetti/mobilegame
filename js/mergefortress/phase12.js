// === Merge Fortress TD — Phase 12 ===
window.MF = window.MF || {};

// =====================================================================
// === CONSTELLATIONS — visual talent tree refactor + new talents ===
// =====================================================================
// Positions for existing + new talents on a 100x100 grid per category
// Each category is a constellation (cluster of stars connected by prereqs)
MF.CONSTELLATION_LAYOUT = {
  dps: {
    name:'⚔ Fureur',  color:'#ff7878',
    nodes: {
      warrior_oath: { x: 50, y: 12 },
      battle_focus: { x: 32, y: 28 },
      berserker:    { x: 68, y: 28 },
      lucky_strike: { x: 22, y: 50 },
      rare_finds:   { x: 50, y: 56 },
      executioner:  { x: 78, y: 50 },
      // P12 new
      bloodlust:    { x: 14, y: 76 },
      assassin:     { x: 42, y: 80 },
      headhunter:   { x: 70, y: 80 },
      blade_storm:  { x: 50, y: 94 }
    }
  },
  tank: {
    name:'🛡 Citadelle', color:'#80c8ff',
    nodes: {
      stone_skin:  { x: 50, y: 14 },
      reinforce:   { x: 35, y: 36 },
      iron_walls:  { x: 65, y: 36 },
      guardian:    { x: 50, y: 56 },
      // P12 new
      aegis:       { x: 24, y: 72 },
      stalwart:    { x: 50, y: 78 },
      paladin_oath:{ x: 76, y: 72 },
      bastion:     { x: 50, y: 94 }
    }
  },
  mage: {
    name:'🔮 Astral',  color:'#c070ff',
    nodes: {
      arcane_might:    { x: 50, y: 14 },
      cold_grip:       { x: 30, y: 36 },
      archmage:        { x: 70, y: 36 },
      elemental_focus: { x: 50, y: 56 },
      // P12 new
      pyromancer:      { x: 18, y: 72 },
      cryomancer:      { x: 38, y: 78 },
      stormcaller:     { x: 62, y: 78 },
      voidweaver:      { x: 82, y: 72 },
      mana_well:       { x: 50, y: 94 }
    }
  },
  eco: {
    name:'💰 Fortune', color:'#ffd96a',
    nodes: {
      thrift:       { x: 30, y: 18 },
      greed:        { x: 50, y: 38 },
      swift_summon: { x: 70, y: 18 },
      battle_aura:  { x: 70, y: 56 },
      merchant:     { x: 30, y: 56 },
      tycoon:       { x: 50, y: 74 },
      // P12 new
      dragon_hoard: { x: 22, y: 88 },
      midas_kiss:   { x: 50, y: 94 },
      jackpot:      { x: 78, y: 88 }
    }
  }
};

// === New P12 talents ===
(function _addP12Talents(){
  if (!MF.TALENTS) return;
  // DPS new
  MF.TALENTS.bloodlust = {
    id:'bloodlust', cat:'dps', name:'Soif de sang', icon:'🩸', requires:'lucky_strike',
    desc: function(r){ return 'Chaque kill donne +' + (r * 0.5) + '% dmg pendant 5s (cumulable, max 25)'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(r){ return [{ type:'flag', target:'bloodlustStack', value: r * 0.5 }]; }
  };
  MF.TALENTS.assassin = {
    id:'assassin', cat:'dps', name:'Assassin', icon:'🗡️', requires:'rare_finds',
    desc: function(r){ return '+' + (r * 20) + '% dmg sur ennemis < 30% PV'; },
    maxRank:3, costPerRank:[80, 160, 320],
    effectAt: function(r){ return [{ type:'flag', target:'executeMult', value: 1 + 0.20 * r }]; }
  };
  MF.TALENTS.headhunter = {
    id:'headhunter', cat:'dps', name:'Chasseur de Têtes', icon:'🎯', requires:'executioner',
    desc: function(r){ return '+' + (r * 5) + '% dégâts critiques globaux'; },
    maxRank:3, costPerRank:[120, 240, 480],
    effectAt: function(r){ return [{ type:'critMult', target:'*', value:0.05 * r }]; }
  };
  MF.TALENTS.blade_storm = {
    id:'blade_storm', cat:'dps', name:'Tempête de Lames', icon:'🌪️', requires:'headhunter',
    desc: function(r){ return 'R5 héros ont +' + (r * 8) + '% atk-speed'; },
    maxRank:3, costPerRank:[150, 300, 600],
    effectAt: function(r){ return [{ type:'flag', target:'r5AtkSpeedBonus', value:0.08 * r }]; }
  };
  // Tank new
  MF.TALENTS.aegis = {
    id:'aegis', cat:'tank', name:'Égide', icon:'⚜', requires:'guardian',
    desc: function(r){ return r * 5 + '% chance d\'ignorer dégât forteresse'; },
    maxRank:3, costPerRank:[120, 240, 480],
    effectAt: function(r){ return [{ type:'flag', target:'fortressDodge', value: 0.05 * r }]; }
  };
  MF.TALENTS.stalwart = {
    id:'stalwart', cat:'tank', name:'Inébranlable', icon:'🗿', requires:'guardian',
    desc: function(r){ return '+' + (r * 4) + ' PV régen toutes les 30s'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(r){ return [{ type:'flag', target:'periodicRegen', value: r * 4 }]; }
  };
  MF.TALENTS.paladin_oath = {
    id:'paladin_oath', cat:'tank', name:'Serment Paladin', icon:'⚔🛡', requires:'guardian',
    desc: function(r){ return 'Knight/Paladin +' + (r * 12) + '% dégâts'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(r){
      var v = 1 + 0.12 * r;
      return [{ type:'unitDmgMult', target:'knight', value: v }, { type:'unitDmgMult', target:'paladin', value: v }];
    }
  };
  MF.TALENTS.bastion = {
    id:'bastion', cat:'tank', name:'Bastion', icon:'🏰', requires:'aegis',
    desc: function(r){ return '+' + (r * 10) + '% PV max forteresse'; },
    maxRank:3, costPerRank:[200, 400, 800],
    effectAt: function(r){ return [{ type:'flag', target:'fortressMaxPctBonus', value: 0.10 * r }]; }
  };
  // Mage new
  MF.TALENTS.pyromancer = {
    id:'pyromancer', cat:'mage', name:'Pyromancien', icon:'🔥', requires:'elemental_focus',
    desc: function(r){ return '+' + (r * 15) + '% dégâts brûlure'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(r){ return [{ type:'flag', target:'burnDmgMult', value: 1 + 0.15 * r }]; }
  };
  MF.TALENTS.cryomancer = {
    id:'cryomancer', cat:'mage', name:'Cryomancien', icon:'🧊', requires:'elemental_focus',
    desc: function(r){ return '+' + (r * 10) + '% durée gel/ralenti'; },
    maxRank:3, costPerRank:[100, 200, 400],
    effectAt: function(r){ return [{ type:'enemySlowDur', target:'*', value: 1 + 0.10 * r }]; }
  };
  MF.TALENTS.stormcaller = {
    id:'stormcaller', cat:'mage', name:'Invocateur d\'Orage', icon:'⚡', requires:'archmage',
    desc: function(r){ return '+' + (r * 1) + ' rebond chaîne lightning'; },
    maxRank:3, costPerRank:[120, 240, 480],
    effectAt: function(r){ return [{ type:'flag', target:'chainBonus', value: r }]; }
  };
  MF.TALENTS.voidweaver = {
    id:'voidweaver', cat:'mage', name:'Tisseur du Vide', icon:'🌑', requires:'archmage',
    desc: function(r){ return '+' + (r * 8) + '% rayon AOE des sorts'; },
    maxRank:3, costPerRank:[120, 240, 480],
    effectAt: function(r){ return [{ type:'flag', target:'splashRadiusMult', value: 1 + 0.08 * r }]; }
  };
  MF.TALENTS.mana_well = {
    id:'mana_well', cat:'mage', name:'Source Magique', icon:'💧', requires:'pyromancer',
    desc: function(r){ return 'Charge ultime +' + (r * 15) + '% par kill'; },
    maxRank:3, costPerRank:[150, 300, 600],
    effectAt: function(r){ return [{ type:'flag', target:'ultimateChargeMult', value: 1 + 0.15 * r }]; }
  };
  // Eco new
  MF.TALENTS.dragon_hoard = {
    id:'dragon_hoard', cat:'eco', name:'Trésor du Dragon', icon:'💰', requires:'tycoon',
    desc: function(r){ return 'Or sauvegardé entre runs (50% conservé × ' + r + ')'; },
    maxRank:3, costPerRank:[150, 300, 600],
    effectAt: function(r){ return [{ type:'flag', target:'goldKeepPct', value: 0.5 * r / 3 }]; }
  };
  MF.TALENTS.midas_kiss = {
    id:'midas_kiss', cat:'eco', name:'Baiser de Midas', icon:'👑', requires:'tycoon',
    desc: function(r){ return r * 2 + '% de chance qu\'un kill rapporte ×5 or'; },
    maxRank:3, costPerRank:[120, 240, 480],
    effectAt: function(r){ return [{ type:'flag', target:'midasChance', value: 0.02 * r }]; }
  };
  MF.TALENTS.jackpot = {
    id:'jackpot', cat:'eco', name:'Jackpot', icon:'🎰', requires:'midas_kiss',
    desc: function(r){ return '+' + (r * 10) + '💎 fragments par run'; },
    maxRank:3, costPerRank:[200, 400, 800],
    effectAt: function(r){ return [{ type:'flag', target:'fragBonus', value: r * 10 }]; }
  };
})();

// =====================================================================
// === MERCENAIRES — pose 1 héros R3 ×2 dmg avant run, 1 utilisation ===
// =====================================================================
MF.MERCENARIES = [
  { id:'merc_knight',   unitId:'knight',   name:'Sir Garron',         desc:'Chevalier mercenaire R3 ×2 dmg', cost: 200, icon:'🛡' },
  { id:'merc_archer',   unitId:'archer',   name:'Yana l\'Œil-d\'Aigle', desc:'Archère mercenaire R3 ×2 dmg', cost: 200, icon:'🏹' },
  { id:'merc_mage',     unitId:'mage',     name:'Maître Eldoran',     desc:'Mage mercenaire R3 ×2 dmg',     cost: 250, icon:'🔮' },
  { id:'merc_dragon',   unitId:'dragon',   name:'Drakk',              desc:'Drakanide mercenaire R3 ×2 dmg', cost: 350, icon:'🐉' },
  { id:'merc_paladin',  unitId:'paladin',  name:'Saint Brell',        desc:'Paladin mercenaire R3 ×2 dmg',  cost: 400, icon:'🛡✨' },
  { id:'merc_necro',    unitId:'necromancer', name:'Mort-Rosse',      desc:'Nécromancien mercenaire R3 ×2 dmg', cost: 450, icon:'☠️🔮' }
];

MF.merc_buy = function(mercId){
  if (!MF.state.meta) return false;
  var meta = MF.state.meta;
  var merc = MF.MERCENARIES.find(function(m){ return m.id === mercId; });
  if (!merc) return false;
  if ((meta.fragments || 0) < merc.cost){
    if (MF.notify_push) MF.notify_push('💎 Pas assez de fragments', 'info');
    return false;
  }
  meta.fragments -= merc.cost;
  meta.pendingMerc = mercId;
  if (MF.saveProgress) MF.saveProgress();
  if (MF.notify_push) MF.notify_push('⚔ ' + merc.name + ' rejoindra ta prochaine run', 'success');
  return true;
};

// Apply mercenary at start of run (1 free R3 unit ×2 dmg)
MF.merc_applyAtRunStart = function(){
  if (!MF.state.meta || !MF.state.meta.pendingMerc) return;
  var mercId = MF.state.meta.pendingMerc;
  var merc = MF.MERCENARIES.find(function(m){ return m.id === mercId; });
  if (!merc){ MF.state.meta.pendingMerc = null; return; }
  // P14: refund if hero not unlocked anymore
  if (MF.deck_isUnlocked && !MF.deck_isUnlocked(merc.unitId)){
    MF.state.meta.fragments = (MF.state.meta.fragments || 0) + merc.cost;
    MF.state.meta.pendingMerc = null;
    if (MF.notify_push) MF.notify_push('💎 Remboursé : héros pas débloqué — ' + merc.cost + '💎', 'info');
    if (MF.saveProgress) MF.saveProgress();
    return;
  }
  var cell = MF.findFreeCell ? MF.findFreeCell() : null;
  if (!cell) return;
  var u = MF.spawnUnit(merc.unitId, 3, cell.c, cell.r);
  if (u){
    u.mercenary = true;
    u.mythicDmgMult = (u.mythicDmgMult || 1) * 2;        // ×2 dmg
    u.mesh.scale.setScalar(1.5);
    u.spawnT = -0.2;
    if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(u.pos, 0xffd96a, { scale: 4, life: 0.7 });
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('⚔ ' + merc.name + ' arrive sur le champ !', 'wave');
  }
  MF.state.meta.pendingMerc = null;
  if (MF.saveProgress) MF.saveProgress();
};

// =====================================================================
// === PANTHEON — top 10 lifetime per mode ===
// =====================================================================
MF.pantheon_record = function(mode, score){
  if (!MF.state.meta || !mode || !score) return;
  var meta = MF.state.meta;
  meta.pantheon = meta.pantheon || {};
  meta.pantheon[mode] = meta.pantheon[mode] || [];
  meta.pantheon[mode].push({ score: score, date: Date.now() });
  meta.pantheon[mode].sort(function(a, b){ return b.score - a.score; });
  meta.pantheon[mode] = meta.pantheon[mode].slice(0, 10);
  if (MF.saveProgress) MF.saveProgress();
};

// Score formula per mode
MF.pantheon_computeScore = function(mode){
  if (mode === 'campaign')   return MF.state.fortressHP * 100 + (MF.state.killsThisLevel || 0);
  if (mode === 'endless')    return MF.state.waveIdx;
  if (mode === 'bossrush')   return MF.state.fortressHP * 100 + (MF.state.killsThisLevel || 0);
  if (mode === 'chaos')      return Math.round((MF.chaos && MF.chaos.time) || 0);
  if (mode === 'roguelike')  return MF.state.waveIdx;
  if (mode === 'beyond')     return (MF.state.level && MF.state.level.beyondIdx) || 0;
  if (mode === 'raid')       return Math.round((MF.raid && MF.raid.elapsed) || 0);
  return 0;
};

// =====================================================================
// === SAISONS — 12 monthly seasons with cosmetic rewards ===
// =====================================================================
MF.SEASONS = {
  1:  { name:'Givre',         icon:'❄️', skin:'ethereal',  desc:'Janvier — saison du givre' },
  2:  { name:'Tempête',       icon:'🌪️', skin:'shadow',   desc:'Février — saison des vents' },
  3:  { name:'Renaissance',   icon:'🌸', skin:'neon',      desc:'Mars — saison du renouveau' },
  4:  { name:'Fleurs',        icon:'🌷', skin:'rainbow',   desc:'Avril — saison florale' },
  5:  { name:'Soleil',        icon:'☀️', skin:'gold',     desc:'Mai — saison solaire' },
  6:  { name:'Été',           icon:'🔥', skin:'infernal',  desc:'Juin — saison ardente' },
  7:  { name:'Canicule',      icon:'🌋', skin:'blood',     desc:'Juillet — saison brûlante' },
  8:  { name:'Récolte',       icon:'🌾', skin:'gold',      desc:'Août — saison des moissons' },
  9:  { name:'Automne',       icon:'🍂', skin:'royal',     desc:'Septembre — saison cuivrée' },
  10: { name:'Mystère',       icon:'🎃', skin:'void',      desc:'Octobre — saison fantomatique' },
  11: { name:'Crépuscule',    icon:'🌙', skin:'arcane',    desc:'Novembre — saison nocturne' },
  12: { name:'Festivités',    icon:'🎄', skin:'cosmic',    desc:'Décembre — saison festive' }
};

MF.season_currentMonth = function(){
  return new Date().getMonth() + 1;        // 1-12
};

MF.season_getCurrent = function(){
  return MF.SEASONS[MF.season_currentMonth()] || MF.SEASONS[1];
};

MF.season_seasonKey = function(){
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
};

MF.season_checkClaim = function(){
  if (!MF.state.meta) return null;
  var meta = MF.state.meta;
  meta.claimedSeasons = meta.claimedSeasons || {};
  var key = MF.season_seasonKey();
  if (meta.claimedSeasons[key]) return null;
  meta.claimedSeasons[key] = true;
  var s = MF.season_getCurrent();
  if (!s) return null;
  // Reward: unlock the seasonal skin on a random hero
  if (MF.UNITS && MF.SKINS && s.skin && MF.SKINS[s.skin]){
    var heroes = Object.keys(MF.UNITS).filter(function(uid){
      var u = MF.UNITS[uid];
      return u && u.kind === 'hero' && !u.isHybrid && u.summonable !== false;
    });
    if (heroes.length){
      meta.unlockedSkins = meta.unlockedSkins || {};
      var hid = heroes[Math.floor(Math.random() * heroes.length)];
      meta.unlockedSkins[hid] = meta.unlockedSkins[hid] || ['default'];
      if (meta.unlockedSkins[hid].indexOf(s.skin) < 0){
        meta.unlockedSkins[hid].push(s.skin);
      }
      // Bonus fragments
      meta.fragments = (meta.fragments || 0) + 50;
      if (MF.saveProgress) MF.saveProgress();
      if (MF.notify_push) MF.notify_push('🎁 ' + s.icon + ' Saison ' + s.name + ' — skin ' + MF.SKINS[s.skin].name + ' pour ' + MF.UNITS[hid].name + ' + 50💎', 'success');
      return { season: s, hero: hid, skin: s.skin };
    }
  }
  return null;
};

// =====================================================================
// === BOSS RAID — 1 mega-boss + AI heroes + 4 phases ===
// =====================================================================
MF.startRaid = function(){
  // Use endless world theme
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = {
    name: 'Raid',
    waves: [],
    waveCount: 9999,
    fortressHP: 50, startGold: 200,
    isFinalLevel: false,
    rewardGold: 0, rewardStars: 0,
    isRaid: true
  };
  MF.raid = {
    active: true,
    elapsed: 0,
    boss: null,
    bossPhase: 1,
    bossTotalHP: 0,
    aiHeroes: [],
    aiSpawnT: 1.0,
    nextPhaseHP: 0
  };
  MF._startMatch(world, level, 'raid');
};

// Tick raid: spawn AI heroes + boss + phases + timer
MF.raid_update = function(dt){
  if (!MF.raid || !MF.raid.active) return;
  if (MF.state.outcome) return;
  MF.raid.elapsed += dt;

  // Spawn AI ally heroes at start (after small delay)
  if (MF.raid.aiSpawnT > 0){
    MF.raid.aiSpawnT -= dt;
    if (MF.raid.aiSpawnT <= 0){
      MF.raid_spawnAIAllies();
      MF.raid_spawnBoss();
    }
  }

  // Boss phase tracking
  if (MF.raid.boss && MF.raid.boss.alive){
    var pct = MF.raid.boss.hp / MF.raid.boss.maxHp;
    var phase = pct > 0.75 ? 1 : (pct > 0.50 ? 2 : (pct > 0.25 ? 3 : 4));
    if (phase !== MF.raid.bossPhase){
      MF.raid.bossPhase = phase;
      MF.raid_onPhaseChange(phase);
    }
  } else if (MF.raid.boss && !MF.raid.boss.alive){
    // Boss defeated → win
    MF.state.outcome = 'win';
  }
};

MF.raid_spawnAIAllies = function(){
  // Spawn 3-4 AI hero units at random free cells
  var heroPool = ['knight', 'archer', 'mage', 'dragon'];
  var n = 3 + Math.floor(Math.random() * 2);
  for (var i = 0; i < n; i++){
    var cell = MF.findFreeCell ? MF.findFreeCell() : null;
    if (!cell) continue;
    var pickId = heroPool[Math.floor(Math.random() * heroPool.length)];
    var u = MF.spawnUnit(pickId, 3, cell.c, cell.r);
    if (u){
      u.isAIAlly = true;
      u.mesh.scale.setScalar(1.4);
      u.spawnT = -0.15;
      if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(u.pos, 0x80c8ff, { scale: 2.5, life: 0.5 });
      MF.raid.aiHeroes.push(u);
    }
  }
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🤝 ' + n + ' alliés IA arrivent en renfort !', 'wave');
};

MF.raid_spawnBoss = function(){
  // Pick a random world boss
  var bossKeys = ['goblin_king', 'bone_lord', 'warlord', 'hydra', 'lich', 'dragon_king'];
  var bossId = bossKeys[Math.floor(Math.random() * bossKeys.length)];
  var data = MF.getEnemy(bossId);
  if (!data) return;
  // Spawn far from fortress, slow boss
  var fortress = MF.grid.fortressPos || { x: 0, y: 0, z: 0 };
  var ang = Math.random() * Math.PI * 2;
  var radius = Math.max(MF.GRID_COLS, MF.GRID_ROWS) * MF.TILE * 0.35;
  var sx = fortress.x + Math.cos(ang) * radius;
  var sz = fortress.z + Math.sin(ang) * radius;
  var scale = (data.scale || 0.55) * 2.2;     // huge boss
  var mesh = MF.buildEnemyMesh(data, scale * 0.8);
  mesh.position.set(sx, data.flying ? 1.2 : 0, sz);
  mesh.scale.multiplyScalar(2.2);
  MF.three.worldGroup.add(mesh);

  var hp = data.baseHP * 50;       // 50× HP
  var spd = data.baseSpd * 0.4;    // slower (raid boss)
  var enemy = {
    eid: ++MF._enemyIdCounter,
    typeId: bossId,
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
    isBoss: true,
    isMini: false,
    isRaidBoss: true,
    gold: 0,
    fortressDmg: data.fortressDmg || 1,
    statuses: { slow: 0, slowMult: 1, burn: 0, burnDps: 0, stun: 0 },
    alive: true,
    scale: scale,
    breatheT: Math.random() * Math.PI * 2,
    chaos: true               // use linear movement toward fortress
  };
  MF.enemies.push(enemy);
  MF.raid.boss = enemy;
  MF.raid.bossTotalHP = hp;
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('💀 RAID BOSS : ' + (data.name || 'Inconnu') + ' (50× HP) !', 'boss');
  if (MF.fx && MF.fx.shake) MF.fx.shake(1.2, 1.0);
  if (MF.audio && MF.audio.music) MF.audio.music.setMode('boss');
  if (MF.boss_playTheme) MF.boss_playTheme(bossId);
};

MF.raid_onPhaseChange = function(phase){
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('💀 BOSS PHASE ' + phase + ' !', 'boss');
  if (MF.fx && MF.fx.shake) MF.fx.shake(0.7, 0.6);
  var b = MF.raid.boss;
  if (!b) return;
  if (phase === 2){
    b.baseSpeed *= 1.3;
    b.fortressDmg += 1;
  } else if (phase === 3){
    b.armor = Math.min(0.5, (b.armor || 0) + 0.15);
    // Spawn 4 minion adds
    for (var i = 0; i < 4; i++){
      var typeIds = ['goblin', 'skeleton', 'orc'];
      var tid = typeIds[Math.floor(Math.random() * typeIds.length)];
      var add = MF.spawnEnemy ? MF.spawnEnemy(tid, 1.2, 1.2) : null;
      if (add && add.pos){
        add.pos.x = b.pos.x + (Math.random() - 0.5) * 1.5;
        add.pos.z = b.pos.z + (Math.random() - 0.5) * 1.5;
        add.mesh.position.copy(add.pos);
      }
    }
  } else if (phase === 4){
    b.baseSpeed *= 1.5;
    b.armor = Math.max(0, (b.armor || 0) - 0.30);     // berserker mode: faster but less armor
    if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(b.pos, 0xff5050, { scale: 4, life: 0.7 });
  }
};

// AI ally targeting — simple: pick closest enemy each tick
MF.raid_aiTickHeroes = function(dt){
  // AI heroes already use the standard combat system (they're regular MF.units),
  // so they auto-attack via combat.js. No extra tick needed unless we want behavior tweaks.
};

// =====================================================================
// === ONBOARDING ADAPTATIF — suggestion card on menu ===
// =====================================================================
MF.onboarding_suggest = function(){
  var meta = MF.state.meta || {};
  // Priority order of suggestions
  // 1. Tutorial campaign not done
  if (!meta.tutorialCampaignDone) return { icon:'📘', text:'Lance la campagne 1-1 pour découvrir le jeu !', action: 'campaign' };
  // 2. No fragments spent on talents
  var spentT = 0;
  if (meta.talents) Object.keys(meta.talents).forEach(function(k){ spentT += meta.talents[k] || 0; });
  if (spentT === 0 && (meta.fragments || 0) >= 40){
    return { icon:'🌳', text:'Tu as ' + meta.fragments + ' 💎 — débloque ton premier talent !', action: 'talents' };
  }
  // 3. No deck customization
  if (!meta.activeDeck || (meta.activeDeck.heroes || []).length <= 1){
    return { icon:'🃏', text:'Configure ton deck dans HÉROS pour ajouter des unités à ta pool', action: 'subProgression' };
  }
  // 4. No relic equipped
  if (!meta.equippedRelics || !meta.equippedRelics.length){
    if ((meta.fragments || 0) >= 100) return { icon:'📜', text:'Équipe ta première relique pour booster tes runs', action: 'relics' };
  }
  // 5. Hybrid not discovered
  if (!meta.foundHybrids || !Object.keys(meta.foundHybrids).length){
    return { icon:'🌟', text:'Atteins R5 avec 2 héros compatibles pour fusionner en hybride !', action: null };
  }
  // 6. Daily challenge active
  if (meta.dailyChallenges){
    var key = MF.daily_today ? MF.daily_today() : '';
    var rec = meta.dailyChallenges[key];
    if (rec){
      var anyOpen = false;
      Object.keys(rec).forEach(function(c){ if (!rec[c].completed) anyOpen = true; });
      if (anyOpen) return { icon:'🎯', text:'Défis du jour t\'attendent — récompenses 💎 à gagner !', action: 'subDefis' };
    }
  }
  // 7. Try chaos
  if (!meta.chaosBestTime){
    return { icon:'🌪', text:'Essaie le mode Chaos pour des récompenses massives', action: 'chaosSelect' };
  }
  // 8. Encourage long quests
  if (meta.longQuests){
    var anyQ = false;
    Object.keys(meta.longQuests).forEach(function(k){ if (!meta.longQuests[k].completed) anyQ = true; });
    if (anyQ) return { icon:'🏅', text:'Quêtes 7 jours en cours — continue d\'enchaîner les runs !', action: 'subDefis' };
  }
  return null;
};

MF.onboarding_render = function(){
  var menu = document.getElementById('mf-menu');
  if (!menu) return;
  var existing = document.getElementById('mf-onboard-card');
  if (existing) existing.remove();
  var s = MF.onboarding_suggest();
  if (!s) return;
  var card = document.createElement('div');
  card.id = 'mf-onboard-card';
  card.className = 'mf-onboard-card';
  card.innerHTML = '<span class="mf-onboard-ico">' + s.icon + '</span><span class="mf-onboard-text">' + s.text + '</span>' + (s.action ? '<span class="mf-onboard-arrow">▶</span>' : '');
  if (s.action){
    card.addEventListener('click', function(){
      if (s.action === 'campaign') MF.startCampaign(0, 1);
      else if (s.action === 'talents') MF.ui.showScreen('talents');
      else if (s.action === 'relics') MF.ui.showScreen('relics');
      else if (s.action === 'subProgression') MF.ui.showScreen('subProgression');
      else if (s.action === 'subDefis') MF.ui.showScreen('subDefis');
      else if (s.action === 'chaosSelect') MF.ui.showScreen('chaosSelect');
    });
  }
  // Insert after hero showcase
  var inner = menu.querySelector('.mf-menu-inner');
  if (inner) inner.appendChild(card);
};

// =====================================================================
// === REMINDER 3 jours sans jouer ===
// =====================================================================
MF.reminder_track = function(){
  if (!MF.state.meta) return;
  MF.state.meta.lastPlayDate = Date.now();
  if (MF.saveProgress) MF.saveProgress();
};

MF.reminder_check = function(){
  if (!MF.state.meta) return null;
  var meta = MF.state.meta;
  var last = meta.lastPlayDate || Date.now();
  var diff = Date.now() - last;
  var days = Math.floor(diff / (24 * 3600 * 1000));
  if (days >= 3){
    return { days: days, text: 'Tu es absent depuis ' + days + ' jours — tes défis et récompenses t\'attendent !' };
  }
  return null;
};

MF.reminder_render = function(){
  var menu = document.getElementById('mf-menu');
  if (!menu) return;
  var existing = document.getElementById('mf-reminder-card');
  if (existing) existing.remove();
  var r = MF.reminder_check();
  if (!r) return;
  var card = document.createElement('div');
  card.id = 'mf-reminder-card';
  card.className = 'mf-reminder-card';
  card.innerHTML = '<span class="mf-reminder-ico">✨</span><span>' + r.text + '</span>';
  var inner = menu.querySelector('.mf-menu-inner');
  if (inner) inner.appendChild(card);
};
