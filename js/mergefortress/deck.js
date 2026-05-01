// === Merge Fortress TD — Hero/Tower unlock + Deck system ===
window.MF = window.MF || {};

// Default unlocks (free at start) — P13: only knight to encourage progression
MF.DECK_DEFAULTS = {
  heroes: ['knight'],
  towers: []     // legacy
};

// Cost to unlock other units (fragments) — P13 prices increased + new heroes
MF.UNIT_UNLOCK_COSTS = {
  archer: 100,         // first easy unlock
  cannon: 150,
  mage: 200,
  ice: 300,
  bomb: 300,
  dragon: 500,
  ballista: 200,
  tesla: 300,
  fire: 300,
  frost: 300,
  // P13 new heroes (more expensive to encourage play)
  berserker: 500,
  sniper: 600,
  timemage: 700,
  bard: 700,
  summoner: 800
};

// Max deck slots per run (unified pool of heroes — P13)
MF.DECK_MAX_HEROES = 6;
MF.DECK_MAX_TOWERS = 0;

// Initialize deck state in meta (idempotent)
MF.deck_init = function(){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  if (!meta.unlockedUnits) meta.unlockedUnits = {};
  // Defaults always unlocked
  MF.DECK_DEFAULTS.heroes.forEach(function(uid){ meta.unlockedUnits[uid] = meta.unlockedUnits[uid] || 1; });
  MF.DECK_DEFAULTS.towers.forEach(function(uid){ meta.unlockedUnits[uid] = meta.unlockedUnits[uid] || 1; });
  // Default deck (all unlocked, capped)
  if (!meta.activeDeck){
    meta.activeDeck = {
      heroes: MF.DECK_DEFAULTS.heroes.slice(),
      towers: [],
      playstyle: 'mix'
    };
  }
  // P13: migrate old decks (towers became heroes, merge into heroes array)
  if (meta.activeDeck.towers && meta.activeDeck.towers.length){
    meta.activeDeck.towers.forEach(function(uid){
      if (meta.activeDeck.heroes.indexOf(uid) < 0) meta.activeDeck.heroes.push(uid);
    });
    meta.activeDeck.towers = [];
  }
  if (!meta.activeDeck.playstyle) meta.activeDeck.playstyle = 'mix';
};

MF.deck_setPlaystyle = function(style){
  MF.deck_init();
  MF.state.meta.activeDeck.playstyle = style;
  if (MF.saveProgress) MF.saveProgress();
};

MF.deck_getPlaystyle = function(){
  MF.deck_init();
  return MF.state.meta.activeDeck.playstyle || 'mix';
};

// Check if a unit is unlocked
MF.deck_isUnlocked = function(uid){
  if (!MF.state.meta) return false;
  return !!(MF.state.meta.unlockedUnits && MF.state.meta.unlockedUnits[uid]);
};

// Unlock prerequisites (P14): some heroes require others
MF.UNIT_UNLOCK_REQUIRES = {
  summoner: ['berserker', 'sniper', 'timemage', 'bard']    // requires the 4 other P13 heroes
};

// Try to unlock a unit (returns true on success)
MF.deck_unlock = function(uid){
  if (!MF.state.meta) return false;
  var meta = MF.state.meta;
  meta.unlockedUnits = meta.unlockedUnits || {};
  if (meta.unlockedUnits[uid]) return false;
  // P14: prerequisites
  var reqs = MF.UNIT_UNLOCK_REQUIRES && MF.UNIT_UNLOCK_REQUIRES[uid];
  if (reqs){
    for (var i = 0; i < reqs.length; i++){
      if (!meta.unlockedUnits[reqs[i]]){
        if (MF.notify_push) MF.notify_push('🔒 Requiert : ' + reqs.map(function(r){ return MF.UNITS[r] ? MF.UNITS[r].name : r; }).join(', '), 'info');
        return false;
      }
    }
  }
  var cost = MF.UNIT_UNLOCK_COSTS[uid] || (MF.UNLOCKABLE_HEROES && MF.UNLOCKABLE_HEROES[uid] ? MF.UNLOCKABLE_HEROES[uid].unlockCost : 999999);
  if ((meta.fragments || 0) < cost) return false;
  meta.fragments -= cost;
  meta.unlockedUnits[uid] = Date.now();
  if (MF.saveProgress) MF.saveProgress();
  if (MF.notify_push) MF.notify_push('🔓 ' + (MF.UNITS[uid] ? MF.UNITS[uid].name : uid) + ' débloqué !', 'success');
  if (MF.audio && MF.audio.achievement) MF.audio.achievement();
  return true;
};

// Toggle a unit in the active deck (ignored if at max)
MF.deck_toggle = function(uid, kind){
  MF.deck_init();
  if (!MF.deck_isUnlocked(uid)) return false;
  var meta = MF.state.meta;
  var arr = (kind === 'hero') ? meta.activeDeck.heroes : meta.activeDeck.towers;
  var max = (kind === 'hero') ? MF.DECK_MAX_HEROES : MF.DECK_MAX_TOWERS;
  var idx = arr.indexOf(uid);
  if (idx >= 0){
    // Remove (but keep at least 1)
    if (arr.length <= 1) return false;
    arr.splice(idx, 1);
  } else {
    if (arr.length >= max) return false;
    arr.push(uid);
  }
  if (MF.saveProgress) MF.saveProgress();
  return true;
};

// Get the active pool for a kind
MF.deck_pool = function(kind){
  MF.deck_init();
  var meta = MF.state.meta;
  var deck = (kind === 'hero') ? meta.activeDeck.heroes : meta.activeDeck.towers;
  // Filter to actually unlocked + valid units
  return deck.filter(function(uid){
    return MF.deck_isUnlocked(uid) && MF.UNITS[uid] && MF.UNITS[uid].summonable !== false;
  });
};

// All available (unlocked) units of a kind
MF.deck_owned = function(kind){
  MF.deck_init();
  var meta = MF.state.meta;
  var owned = [];
  Object.keys(meta.unlockedUnits || {}).forEach(function(uid){
    var u = MF.UNITS[uid];
    if (!u || u.isHybrid) return;
    if (u.summonable === false) return;
    if (kind === 'hero' && u.kind === 'hero') owned.push(uid);
    if (kind === 'tower' && u.kind === 'tower') owned.push(uid);
  });
  return owned;
};

// All units of a kind (locked + unlocked) for the library
MF.deck_all = function(kind){
  var all = [];
  Object.keys(MF.UNITS || {}).forEach(function(uid){
    var u = MF.UNITS[uid];
    if (!u || u.isHybrid) return;
    if (u.summonable === false) return;
    if (kind === 'hero' && u.kind === 'hero') all.push(uid);
    if (kind === 'tower' && u.kind === 'tower') all.push(uid);
  });
  return all;
};

// Get unlock cost for a unit
MF.deck_unlockCost = function(uid){
  if (MF.UNIT_UNLOCK_COSTS[uid] != null) return MF.UNIT_UNLOCK_COSTS[uid];
  if (MF.UNLOCKABLE_HEROES && MF.UNLOCKABLE_HEROES[uid]) return MF.UNLOCKABLE_HEROES[uid].unlockCost;
  return null;
};
