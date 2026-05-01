// === Merge Fortress TD — Game state + save/load ===
window.MF = window.MF || {};

MF.SAVE_KEY = 'mergefortress_save_v1';

MF._defaultMeta = function(){
  return {
    fragments: 0,             // meta currency from runs
    talents: {},              // talentId → rank (0..3)
    unlockedRelics: [],       // ids of relics owned
    equippedRelics: [],       // up to 3 ids
    totalRuns: 0,
    totalWins: 0,
    deepestWave: 0,
    chaosBestTime: 0,
    chaosRewards: {},         // rewardId → level (number of times bought, for stackable ones)
    chaosLeaderboard: [],     // top 5: { time, kills, ult, bosses, date }
    chaosTutorialDone: false
  };
};

MF.state = {
  // Persistent (saved to localStorage)
  progress: {
    // worldIdx: { 1: {stars:3, best:wave}, 2: {...} }
  },
  highestWorld: 0,    // Index 0..5 of unlocked worlds
  endlessBest: 0,
  bossRushDone: false,
  totalGold: 0,
  totalKills: 0,
  // Meta progression (roguelite layer)
  meta: null,         // initialized via _defaultMeta on load

  // Runtime (per match — NOT saved)
  mode: 'menu',       // 'menu'|'campaign'|'endless'|'bossrush'
  screen: 'menu',     // 'menu'|'worlds'|'levels'|'play'|'pause'|'end'
  worldIdx: 0,
  levelIdx: 1,
  level: null,        // generated level object
  waveIdx: 0,         // current wave (0 = none yet)
  waveActive: false,
  fortressHP: 20,
  fortressMaxHP: 20,
  gold: 100,
  paused: false,
  speed: 1,           // 1, 2 (fast forward)
  summonCost: 18,
  towerCost: 40,
  summonsThisLevel: 0,
  killsThisLevel: 0,
  damageDealt: 0,
  startTime: 0,
  outcome: null       // 'win'|'lose'|null
};

MF.saveProgress = function(){
  try {
    localStorage.setItem(MF.SAVE_KEY, JSON.stringify({
      progress: MF.state.progress,
      highestWorld: MF.state.highestWorld,
      endlessBest: MF.state.endlessBest,
      bossRushDone: MF.state.bossRushDone,
      totalGold: MF.state.totalGold,
      totalKills: MF.state.totalKills,
      meta: MF.state.meta
    }));
  } catch(e){}
};

MF.loadProgress = function(){
  try {
    var raw = localStorage.getItem(MF.SAVE_KEY);
    if (!raw) { MF.state.meta = MF._defaultMeta(); return; }
    var d = JSON.parse(raw);
    if (d.progress)     MF.state.progress = d.progress;
    if (typeof d.highestWorld === 'number') MF.state.highestWorld = d.highestWorld;
    if (typeof d.endlessBest === 'number') MF.state.endlessBest = d.endlessBest;
    if (d.bossRushDone)  MF.state.bossRushDone = d.bossRushDone;
    if (d.totalGold)     MF.state.totalGold = d.totalGold;
    if (d.totalKills)    MF.state.totalKills = d.totalKills;
    if (d.meta) {
      // Merge with defaults to handle older saves
      MF.state.meta = Object.assign(MF._defaultMeta(), d.meta);
    } else {
      MF.state.meta = MF._defaultMeta();
    }
  } catch(e){
    MF.state.meta = MF._defaultMeta();
  }
};

MF.resetProgress = function(){
  try { localStorage.removeItem(MF.SAVE_KEY); } catch(e){}
  MF.state.progress = {};
  MF.state.highestWorld = 0;
  MF.state.endlessBest = 0;
  MF.state.bossRushDone = false;
  MF.state.totalGold = 0;
  MF.state.totalKills = 0;
  MF.state.meta = MF._defaultMeta();
};

MF.recordLevelResult = function(worldIdx, levelIdx, won, stars, bestWave){
  var w = MF.state.progress[worldIdx] || {};
  var prev = w[levelIdx] || { stars: 0, best: 0 };
  if (won) {
    prev.stars = Math.max(prev.stars, stars);
    prev.best  = Math.max(prev.best, bestWave);
  } else {
    prev.best  = Math.max(prev.best, bestWave);
  }
  w[levelIdx] = prev;
  MF.state.progress[worldIdx] = w;

  if (won && levelIdx >= MF.WORLDS[worldIdx].levelCount) {
    MF.state.highestWorld = Math.max(MF.state.highestWorld, worldIdx + 1);
  }
  MF.saveProgress();
};

MF.isLevelUnlocked = function(worldIdx, levelIdx){
  if (worldIdx > MF.state.highestWorld) return false;
  if (levelIdx === 1) return true;
  var w = MF.state.progress[worldIdx] || {};
  var prev = w[levelIdx - 1];
  return prev && prev.stars > 0;
};

MF.isWorldUnlocked = function(worldIdx){
  return worldIdx <= MF.state.highestWorld;
};
