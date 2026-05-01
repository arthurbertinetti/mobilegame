// === P14b — Daily login bonus + first-run banners + ach progress ===
window.MF = window.MF || {};

// =====================================================================
// === DAILY LOGIN BONUS — gain frags simply by opening the game daily ===
// =====================================================================
MF.dailyLogin_check = function(){
  if (!MF.state.meta) return null;
  var meta = MF.state.meta;
  var todayKey = MF.daily_today ? MF.daily_today() : new Date().toDateString();
  if (meta.lastLoginDay === todayKey) return null;
  // First login today
  meta.lastLoginDay = todayKey;
  // Streak
  var prev = meta.lastLoginStreak || { day: '', count: 0 };
  var yesterdayKey = (function(){
    var d = new Date(); d.setDate(d.getDate() - 1);
    return '' + d.getFullYear() + (d.getMonth()+1<10?'0':'')+(d.getMonth()+1) + (d.getDate()<10?'0':'')+d.getDate();
  })();
  var newStreak = (prev.day === yesterdayKey) ? prev.count + 1 : 1;
  meta.lastLoginStreak = { day: todayKey, count: newStreak };
  // Reward grows with streak (15/30/60/100/150 capped)
  var bonus = Math.min(150, 15 * newStreak);
  meta.fragments = (meta.fragments || 0) + bonus;
  if (MF.saveProgress) MF.saveProgress();
  return { bonus: bonus, streak: newStreak };
};

MF.dailyLogin_render = function(){
  var info = MF.dailyLogin_check();
  if (!info) return;
  var menu = document.getElementById('mf-menu');
  if (!menu) return;
  var existing = document.getElementById('mf-login-card');
  if (existing) existing.remove();
  var card = document.createElement('div');
  card.id = 'mf-login-card';
  card.className = 'mf-login-card';
  card.innerHTML = '<span style="font-size:1.6rem">🎁</span><div><b>+' + info.bonus + ' 💎</b> Connexion quotidienne (jour ' + info.streak + ')<br><small>Reviens demain pour plus !</small></div>';
  card.addEventListener('click', function(){ card.remove(); });
  var inner = menu.querySelector('.mf-menu-inner');
  if (inner) inner.appendChild(card);
  if (MF.audio && MF.audio.coin) MF.audio.coin();
  setTimeout(function(){ if (card.parentNode) card.remove(); }, 5000);
};

// =====================================================================
// === FIRST-RUN BANNER — when summoning a hero for the first time ===
// =====================================================================
MF.firstrun_track = function(unitId){
  if (!MF.state.meta || !unitId) return;
  var meta = MF.state.meta;
  meta.firstSummon = meta.firstSummon || {};
  if (meta.firstSummon[unitId]) return;
  meta.firstSummon[unitId] = Date.now();
  if (MF.fx && MF.fx.showBanner){
    var u = MF.UNITS[unitId];
    if (u) MF.fx.showBanner('🎉 Premier summon : ' + u.icon + ' ' + u.name + ' !', 'wave');
  }
  if (MF.saveProgress) MF.saveProgress();
};

// =====================================================================
// === SANDBOX MODE ===
// =====================================================================
MF.startSandbox = function(){
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = {
    name:'Sandbox', waves:[], waveCount:0,
    fortressHP:9999, startGold:9999,
    isFinalLevel:false, rewardGold:0, rewardStars:0, isSandbox: true
  };
  MF.run = MF.run || {};
  MF.run.sandbox = true;
  MF._startMatch(world, level, 'sandbox');
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🧪 Sandbox — invoque librement', 'wave');
};

// =====================================================================
// === BOSS RUSH VARIANTS ===
// =====================================================================
MF.BR_VARIANTS = {
  normal:    { name:'Normal',    desc:'Boss Rush standard',                      mult: 1.0 },
  hardcore:  { name:'Hardcore',  desc:'1 PV forteresse — ×3 récompenses',        mult: 3.0 },
  swarm:     { name:'Essaim',    desc:'+2 boss simultanés par vague — ×2.5',     mult: 2.5 }
};

MF.startBossRushVariant = function(variantId){
  variantId = variantId || 'normal';
  MF.run = MF.run || {};
  MF.run.bossRushVariant = variantId;
  var lvl = MF.generateBossRushLevel ? MF.generateBossRushLevel() : null;
  if (!lvl) return;
  if (variantId === 'hardcore') lvl.fortressHP = 1;
  if (variantId === 'swarm'){
    lvl.waves.forEach(function(w){
      if (w.enemies && w.enemies.length){
        var dup1 = Object.assign({}, w.enemies[0], { delay: (w.enemies[0].delay || 0) + 2 });
        var dup2 = Object.assign({}, w.enemies[0], { delay: (w.enemies[0].delay || 0) + 4 });
        w.enemies.push(dup1);
        w.enemies.push(dup2);
      }
    });
  }
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  MF._startMatch(world, lvl, 'bossrush');
};
