// === Merge Fortress TD — Daily challenges ===
window.MF = window.MF || {};

// Pool of challenges; 3 are picked per day deterministically from the daily seed
MF.DAILY_POOL = [
  { id:'kill_200',      name:'Boucher du jour',  icon:'💀', desc:'Élimine 200 ennemis (toutes runs aujourd\'hui)',     target:200, reward:50, type:'kills' },
  { id:'kill_500',      name:'Génocide express', icon:'☠️', desc:'Élimine 500 ennemis aujourd\'hui',                    target:500, reward:120, type:'kills' },
  { id:'combo_100',     name:'Maître du combo',  icon:'🔥', desc:'Atteins un combo de 100 en chaos',                    target:100, reward:80, type:'combo' },
  { id:'combo_50',      name:'Combo solide',     icon:'⚡', desc:'Atteins un combo de 50 en chaos',                     target:50, reward:40, type:'combo' },
  { id:'survive_5min',  name:'Survivant',        icon:'⏱', desc:'Survis 5 minutes en chaos',                          target:300, reward:60, type:'chaos_time' },
  { id:'survive_10min', name:'Endurance',        icon:'⏰', desc:'Survis 10 minutes en chaos',                         target:600, reward:150, type:'chaos_time' },
  { id:'hybrids_2',     name:'Alchimiste rapide',icon:'🌟', desc:'Crée 2 hybrides différents aujourd\'hui',             target:2,   reward:100, type:'hybrids_today' },
  { id:'kill_3boss',    name:'Tueur de boss',    icon:'👹', desc:'Élimine 3 boss aujourd\'hui',                         target:3,   reward:90, type:'bosses' },
  { id:'ult_5',         name:'Ultimes en série', icon:'☄', desc:'Lance 5 ultimes en chaos aujourd\'hui',               target:5,   reward:55, type:'ult_casts' },
  { id:'drops_10',      name:'Collectionneur',   icon:'💎', desc:'Collecte 10 drops aujourd\'hui',                     target:10,  reward:50, type:'drops' }
];

// Get today's key (YYYYMMDD)
MF.daily_today = function(){
  var d = new Date();
  return '' + d.getFullYear() +
         (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) +
         (d.getDate() < 10 ? '0' : '') + d.getDate();
};

// Mulberry32 deterministic from a seed string
MF._dailyRng = function(seed){
  var n = 0;
  for (var i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  return function(){
    n = (n + 0x6D2B79F5) >>> 0;
    var t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Pick today's 3 challenges (deterministic for the day)
MF.daily_today_challenges = function(){
  var key = MF.daily_today();
  var rng = MF._dailyRng(key);
  // Shuffle pool
  var pool = MF.DAILY_POOL.slice();
  pool.sort(function(){ return rng() - 0.5; });
  return pool.slice(0, 3);
};

// Initialize today's tracking record (idempotent)
MF.daily_init = function(){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  meta.dailyChallenges = meta.dailyChallenges || {};
  var key = MF.daily_today();
  if (!meta.dailyChallenges[key]){
    meta.dailyChallenges[key] = {};
    var picks = MF.daily_today_challenges();
    picks.forEach(function(c){
      meta.dailyChallenges[key][c.id] = { progress: 0, completed: false };
    });
    // Garbage collect: keep only last 7 days
    var keys = Object.keys(meta.dailyChallenges).sort().reverse();
    if (keys.length > 7){
      keys.slice(7).forEach(function(k){ delete meta.dailyChallenges[k]; });
    }
    if (MF.saveProgress) MF.saveProgress();
  }
};

// Increment progress for a challenge type (by amount)
MF.daily_progress = function(type, amount){
  if (!MF.state.meta) return;
  MF.daily_init();
  var key = MF.daily_today();
  var record = MF.state.meta.dailyChallenges[key];
  var picks = MF.daily_today_challenges();
  var changed = false;
  picks.forEach(function(c){
    if (c.type !== type) return;
    var rec = record[c.id];
    if (!rec || rec.completed) return;
    rec.progress = Math.max(rec.progress, amount);   // for "max" types like combo
    if (rec.progress >= c.target){
      rec.completed = true;
      MF.state.meta.fragments = (MF.state.meta.fragments || 0) + (c.reward || 0);
      changed = true;
      if (MF.fx && MF.fx.showBanner){
        MF.fx.showBanner('🎯 ' + c.icon + ' ' + c.name + ' — +' + c.reward + ' 💎', 'wave');
      }
      if (MF.audio && MF.audio.achievement) MF.audio.achievement();
    }
  });
  if (changed && MF.saveProgress) MF.saveProgress();
};

// Increment cumulative (for kills-type)
MF.daily_addProgress = function(type, amount){
  if (!MF.state.meta) return;
  MF.daily_init();
  var key = MF.daily_today();
  var record = MF.state.meta.dailyChallenges[key];
  var picks = MF.daily_today_challenges();
  var changed = false;
  picks.forEach(function(c){
    if (c.type !== type) return;
    var rec = record[c.id];
    if (!rec || rec.completed) return;
    rec.progress = (rec.progress || 0) + (amount || 1);
    if (rec.progress >= c.target){
      rec.completed = true;
      MF.state.meta.fragments = (MF.state.meta.fragments || 0) + (c.reward || 0);
      changed = true;
      if (MF.fx && MF.fx.showBanner){
        MF.fx.showBanner('🎯 ' + c.icon + ' ' + c.name + ' — +' + c.reward + ' 💎', 'wave');
      }
      if (MF.audio && MF.audio.achievement) MF.audio.achievement();
    }
  });
  if (changed && MF.saveProgress) MF.saveProgress();
};
