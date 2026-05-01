// === Merge Fortress TD — Achievements (10-12 challenges) ===
window.MF = window.MF || {};

MF.ACHIEVEMENTS = {
  first_run: {
    id:'first_run', name:'Première Bataille', icon:'⚔', desc:'Lance ta première run (tout mode confondu).',
    fragments: 10
  },
  campaign_world1: {
    id:'campaign_world1', name:'Conquérant', icon:'🏰', desc:'Termine le monde 1 de la campagne.',
    fragments: 30
  },
  hybrid_first: {
    id:'hybrid_first', name:'Alchimiste', icon:'🌟', desc:'Découvre ta première recette hybride.',
    fragments: 50
  },
  hybrid_all: {
    id:'hybrid_all', name:'Maître Fusion', icon:'🌟🌟', desc:'Découvre les 6 recettes hybrides.',
    fragments: 250
  },
  chaos_5min: {
    id:'chaos_5min', name:'Survivant', icon:'⏱', desc:'Survis 5 minutes en mode Chaos.',
    fragments: 40
  },
  chaos_15min: {
    id:'chaos_15min', name:'Vétéran du Chaos', icon:'⏰', desc:'Survis 15 minutes en mode Chaos.',
    fragments: 150
  },
  combo_50: {
    id:'combo_50', name:'Massacre', icon:'🔥', desc:'Atteins un combo de 50 en mode Chaos.',
    fragments: 60
  },
  combo_100: {
    id:'combo_100', name:'Légende', icon:'⭐', desc:'Atteins un combo de 100.',
    fragments: 120
  },
  kills_1k: {
    id:'kills_1k', name:'Boucher', icon:'💀', desc:'Élimine 1000 ennemis au total.',
    fragments: 80
  },
  kills_5k: {
    id:'kills_5k', name:'Génocide', icon:'💀💀', desc:'Élimine 5000 ennemis au total.',
    fragments: 200
  },
  perfect_level: {
    id:'perfect_level', name:'Sans Tache', icon:'✨', desc:'Termine un niveau campagne avec 100% PV.',
    fragments: 50
  },
  boss_5: {
    id:'boss_5', name:'Tueur de Géants', icon:'👹', desc:'Élimine 5 boss en une seule run chaos.',
    fragments: 100
  }
};

// === Track unlocks ===
MF.ach_unlock = function(achId){
  if (!MF.state.meta) return false;
  MF.state.meta.achievements = MF.state.meta.achievements || {};
  if (MF.state.meta.achievements[achId]) return false;     // already unlocked
  var a = MF.ACHIEVEMENTS[achId];
  if (!a) return false;
  MF.state.meta.achievements[achId] = Date.now();
  MF.state.meta.fragments = (MF.state.meta.fragments || 0) + (a.fragments || 0);
  MF.saveProgress();
  // Banner notification
  if (MF.fx && MF.fx.showBanner){
    MF.fx.showBanner('🏆 ' + a.icon + ' ' + a.name + (a.fragments ? ' — +' + a.fragments + ' 💎' : ''), 'wave');
  }
  if (MF.audio && MF.audio.achievement) MF.audio.achievement();
  return true;
};

// === Auto-detect on game events ===
MF.ach_check = function(){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  meta.achievements = meta.achievements || {};
  // first_run
  if ((meta.totalRuns || 0) >= 1) MF.ach_unlock('first_run');
  // campaign_world1
  if (MF.state.progress && MF.state.progress[0]){
    var w1 = MF.state.progress[0];
    var w1Done = true;
    var w1Count = MF.WORLDS && MF.WORLDS[0] ? MF.WORLDS[0].levelCount : 15;
    for (var li = 1; li <= w1Count; li++){
      if (!w1[li] || !w1[li].stars) { w1Done = false; break; }
    }
    if (w1Done) MF.ach_unlock('campaign_world1');
  }
  // hybrids
  meta.foundHybrids = meta.foundHybrids || {};
  var hCount = Object.keys(meta.foundHybrids).length;
  if (hCount >= 1) MF.ach_unlock('hybrid_first');
  if (MF.HYBRIDS && hCount >= Object.keys(MF.HYBRIDS).length) MF.ach_unlock('hybrid_all');
  // total kills
  if ((MF.state.totalKills || 0) >= 1000) MF.ach_unlock('kills_1k');
  if ((MF.state.totalKills || 0) >= 5000) MF.ach_unlock('kills_5k');
};

// Hook called when chaos run ends
MF.ach_onChaosEnd = function(){
  if (!MF.chaos) return;
  if (MF.chaos.time >= 300) MF.ach_unlock('chaos_5min');
  if (MF.chaos.time >= 900) MF.ach_unlock('chaos_15min');
  if (MF.chaos.bossesSpawned >= 5) MF.ach_unlock('boss_5');
  MF.ach_check();
};

// Hook called on combo update
MF.ach_onCombo = function(combo){
  if (combo >= 50)  MF.ach_unlock('combo_50');
  if (combo >= 100) MF.ach_unlock('combo_100');
};

// Hook called on hybrid creation
MF.ach_onHybridCreated = function(hybridId){
  if (!MF.state.meta) return;
  MF.state.meta.foundHybrids = MF.state.meta.foundHybrids || {};
  if (!MF.state.meta.foundHybrids[hybridId]){
    MF.state.meta.foundHybrids[hybridId] = Date.now();
    MF.saveProgress();
    MF.ach_check();
  }
};

// Hook called on campaign level win
MF.ach_onLevelWon = function(stars, fortressMaxHP, fortressHP){
  if (stars >= 3 && fortressHP === fortressMaxHP) MF.ach_unlock('perfect_level');
  MF.ach_check();
};

// P14: live progress for unlocked achievements (current/target)
MF.ach_getProgress = function(aid){
  if (!MF.state.meta) return null;
  var meta = MF.state.meta;
  var a = MF.ACHIEVEMENTS[aid];
  if (!a) return null;
  if (aid === 'first_run')      return { current: meta.totalRuns || 0, target: 1 };
  if (aid === 'kills_1k')       return { current: MF.state.totalKills || 0, target: 1000 };
  if (aid === 'kills_5k')       return { current: MF.state.totalKills || 0, target: 5000 };
  if (aid === 'hybrid_first')   return { current: (meta.foundHybrids ? Object.keys(meta.foundHybrids).length : 0), target: 1 };
  if (aid === 'hybrid_all'){
    var t = MF.HYBRIDS ? Object.keys(MF.HYBRIDS).length : 0;
    return { current: (meta.foundHybrids ? Object.keys(meta.foundHybrids).length : 0), target: t };
  }
  if (aid === 'chaos_5min')     return { current: Math.floor(meta.chaosBestTime || 0), target: 300 };
  if (aid === 'chaos_15min')    return { current: Math.floor(meta.chaosBestTime || 0), target: 900 };
  if (aid === 'campaign_world1'){
    var done = 0;
    if (MF.state.progress && MF.state.progress[0]){
      Object.keys(MF.state.progress[0]).forEach(function(k){ if (MF.state.progress[0][k] && MF.state.progress[0][k].stars) done++; });
    }
    var total = MF.WORLDS && MF.WORLDS[0] ? MF.WORLDS[0].levelCount : 15;
    return { current: done, target: total };
  }
  return null;
};

// Total unlocked / count
MF.ach_progress = function(){
  if (!MF.state.meta || !MF.state.meta.achievements) return { unlocked: 0, total: Object.keys(MF.ACHIEVEMENTS).length };
  return {
    unlocked: Object.keys(MF.state.meta.achievements).length,
    total: Object.keys(MF.ACHIEVEMENTS).length
  };
};
