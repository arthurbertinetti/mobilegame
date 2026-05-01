// === Merge Fortress TD — Weekly ladder (offline) ===
window.MF = window.MF || {};

// ISO week key: returns a string like "2026-W18" (Monday-based)
MF.ladder_weekKey = function(d){
  d = d ? new Date(d) : new Date();
  // Adjust to nearest Thursday for ISO week calculation
  var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var dayN = (t.getUTCDay() + 6) % 7;       // Mon=0
  t.setUTCDate(t.getUTCDate() - dayN + 3);  // Thursday of current week
  var jan4 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  var diff = (t - jan4) / 86400000;
  var weekN = 1 + Math.round((diff - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return t.getUTCFullYear() + '-W' + (weekN < 10 ? '0' : '') + weekN;
};

MF.ladder_currentWeek = function(){ return MF.ladder_weekKey(); };

// Time until next Monday 00:00 (local)
MF.ladder_resetIn = function(){
  var now = new Date();
  var dow = now.getDay();    // 0=Sun, 1=Mon...
  var daysToMon = (8 - dow) % 7 || 7;
  var monday = new Date(now);
  monday.setDate(now.getDate() + daysToMon);
  monday.setHours(0, 0, 0, 0);
  var diff = monday - now;
  var d = Math.floor(diff / (24 * 3600 * 1000));
  var h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  var m = Math.floor((diff % (3600 * 1000)) / 60000);
  return d + 'j ' + h + 'h ' + m + 'm';
};

// Auto-detect week change and reward previous week
MF.ladder_checkReset = function(){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  meta.weeklyLadder = meta.weeklyLadder || {};
  var cur = MF.ladder_currentWeek();
  // For all weeks before current that have unrewarded entries, give reward
  Object.keys(meta.weeklyLadder).forEach(function(wkey){
    if (wkey >= cur) return;
    var w = meta.weeklyLadder[wkey];
    if (!w || w.rewardClaimed) return;
    if (!w.entries || !w.entries.length) { w.rewardClaimed = true; return; }
    // Personal rank reward: based on best entry's chaos time
    var best = w.entries[0];
    var rewardFrag = 50;
    if (best.time >= 600) rewardFrag = 200;
    else if (best.time >= 300) rewardFrag = 120;
    else if (best.time >= 120) rewardFrag = 80;
    meta.fragments = (meta.fragments || 0) + rewardFrag;
    w.rewardClaimed = true;
    w.rewardFrags = rewardFrag;
    if (MF.fx && MF.fx.showBanner){
      MF.fx.showBanner('🏅 Récompense ladder ' + wkey + ' : +' + rewardFrag + ' 💎', 'wave');
    }
    if (MF.audio && MF.audio.achievement) MF.audio.achievement();
  });
  // Garbage collect: keep only last 4 weeks
  var keys = Object.keys(meta.weeklyLadder).sort().reverse();
  if (keys.length > 4){
    keys.slice(4).forEach(function(k){ delete meta.weeklyLadder[k]; });
  }
  if (MF.saveProgress) MF.saveProgress();
};

// === Weekend events ===
MF.event_active = function(){
  var d = new Date();
  var dow = d.getDay();           // 0 = Sun, 6 = Sat
  return dow === 0 || dow === 6;
};

MF.event_data = function(){
  if (!MF.event_active()) return null;
  return {
    id: 'weekend_legendary',
    icon: '🎉',
    name: 'Week-end Légendaire',
    desc: 'Boss en chaos ont 30% de chance de drop un skin légendaire aléatoire.',
    legendaryDropChance: 0.30
  };
};

// On boss kill, attempt event drop
MF.event_onBossKilled = function(){
  var ev = MF.event_data();
  if (!ev) return;
  if (Math.random() > ev.legendaryDropChance) return;
  // Pick a random hero + legendary skin
  var heroes = Object.keys(MF.UNITS).filter(function(uid){
    var u = MF.UNITS[uid];
    return u && u.kind === 'hero' && !u.isHybrid && u.summonable !== false;
  });
  if (!heroes.length) return;
  var legSkins = Object.keys(MF.SKINS).filter(function(sid){ return MF.SKINS[sid].legendary; });
  if (!legSkins.length) return;
  var meta = MF.state.meta || {};
  meta.unlockedSkins = meta.unlockedSkins || {};
  // Pick a hero+skin combo not yet owned
  var attempts = 0;
  while (attempts < 20){
    var hid = heroes[Math.floor(Math.random() * heroes.length)];
    var sid = legSkins[Math.floor(Math.random() * legSkins.length)];
    meta.unlockedSkins[hid] = meta.unlockedSkins[hid] || ['default'];
    if (meta.unlockedSkins[hid].indexOf(sid) < 0){
      meta.unlockedSkins[hid].push(sid);
      meta.eventsCompleted = meta.eventsCompleted || {};
      meta.eventsCompleted[MF.ladder_currentWeek()] = (meta.eventsCompleted[MF.ladder_currentWeek()] || 0) + 1;
      if (MF.fx && MF.fx.showBanner){
        MF.fx.showBanner('🎉 SKIN LÉGENDAIRE — ' + MF.SKINS[sid].icon + ' ' + MF.SKINS[sid].name + ' pour ' + MF.UNITS[hid].name + ' !', 'wave');
      }
      if (MF.audio && MF.audio.achievement) MF.audio.achievement();
      if (MF.saveProgress) MF.saveProgress();
      return;
    }
    attempts++;
  }
};

// Push a chaos entry to current week's ladder
MF.ladder_pushChaos = function(entry){
  if (!MF.state.meta || !entry) return;
  var meta = MF.state.meta;
  meta.weeklyLadder = meta.weeklyLadder || {};
  var cur = MF.ladder_currentWeek();
  meta.weeklyLadder[cur] = meta.weeklyLadder[cur] || { entries: [], rewardClaimed: false };
  meta.weeklyLadder[cur].entries.push({
    time: entry.time, kills: entry.kills, ult: entry.ult, bosses: entry.bosses, variant: entry.variant || 'normal',
    date: Date.now()
  });
  meta.weeklyLadder[cur].entries.sort(function(a, b){ return b.time - a.time; });
  meta.weeklyLadder[cur].entries = meta.weeklyLadder[cur].entries.slice(0, 10);
  if (MF.saveProgress) MF.saveProgress();
};
