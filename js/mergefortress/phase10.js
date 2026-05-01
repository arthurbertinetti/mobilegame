// === Merge Fortress TD — Phase 10: friendships, replay, boss themes, animated bg, relics, worlds, roguelike, crucible, daily targets ===
window.MF = window.MF || {};

// =====================================================================
// === HERO FRIENDSHIPS (paires R3+) ===
// =====================================================================
MF.FRIENDSHIP_THRESHOLD = 100;          // kills cumulés ensemble pour débloquer

MF.friendship_pairKey = function(idA, idB){
  if (!idA || !idB || idA === idB) return null;
  return idA < idB ? idA + '|' + idB : idB + '|' + idA;
};

// Called when an enemy is killed; track all pairs of R3+ heroes alive at that moment
MF.friendship_recordKill = function(){
  if (!MF.state.meta || !MF.units || MF.units.length < 2) return;
  var meta = MF.state.meta;
  meta.friendships = meta.friendships || {};
  var heroes = MF.units.filter(function(u){
    return u && u.rank >= 3 && MF.UNITS[u.id] && MF.UNITS[u.id].kind === 'hero';
  });
  if (heroes.length < 2) return;
  // Track unique IDs (not duplicate same hero)
  var seen = {};
  heroes.forEach(function(h){ seen[h.id] = true; });
  var ids = Object.keys(seen);
  for (var i = 0; i < ids.length; i++){
    for (var j = i + 1; j < ids.length; j++){
      var key = MF.friendship_pairKey(ids[i], ids[j]);
      if (!key) continue;
      var rec = meta.friendships[key] || { kills: 0, unlocked: false };
      if (!rec.unlocked){
        rec.kills++;
        if (rec.kills >= MF.FRIENDSHIP_THRESHOLD){
          rec.unlocked = true;
          if (MF.notify_push) MF.notify_push('💝 Amitié débloquée : ' + (MF.UNITS[ids[i]].name) + ' & ' + (MF.UNITS[ids[j]].name) + ' (+5% dmg perm. ensemble)', 'success');
          if (MF.audio && MF.audio.achievement) MF.audio.achievement();
        }
        meta.friendships[key] = rec;
      }
    }
  }
};

// Bonus dmg multiplier when 2 friends are on field
MF.friendship_getMult = function(unit){
  if (!MF.state.meta || !MF.state.meta.friendships || !MF.units) return 1;
  var meta = MF.state.meta;
  for (var k in meta.friendships){
    if (!meta.friendships[k].unlocked) continue;
    var pair = k.split('|');
    if (pair.indexOf(unit.id) < 0) continue;
    var partnerId = pair[0] === unit.id ? pair[1] : pair[0];
    // Is partner on field?
    for (var i = 0; i < MF.units.length; i++){
      if (MF.units[i].id === partnerId) return 1.05;
    }
  }
  return 1;
};

// =====================================================================
// === REPLAY SYSTEM — track key events, animate playback ===
// =====================================================================
MF.replay_init = function(){
  MF.replay = { events: [], startedAt: Date.now() };
};

MF.replay_record = function(type, data){
  if (!MF.replay) return;
  if (MF.replay.events.length > 500) MF.replay.events.shift();
  MF.replay.events.push({ t: (MF._t || 0), type: type, d: data });
};

// Save the current run's replay snapshot
MF.replay_save = function(){
  if (!MF.replay || !MF.state.meta) return;
  MF.state.meta.lastReplay = {
    mode: MF.state.mode, world: MF.state.worldIdx, level: MF.state.levelIdx,
    duration: (MF._t || 0),
    events: MF.replay.events.slice(),
    savedAt: Date.now()
  };
  MF.saveProgress();
};

// Render replay onto a canvas (mini-arena)
MF.replay_drawTo = function(canvas, replay, progress){
  if (!canvas || !replay) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  ctx.fillStyle = 'rgba(15,5,30,1)';
  ctx.fillRect(0, 0, w, h);
  // Grid lines
  ctx.strokeStyle = 'rgba(170,140,235,.3)';
  ctx.lineWidth = 1;
  for (var i = 1; i < 8; i++){
    ctx.beginPath(); ctx.moveTo(i * w/8, 0); ctx.lineTo(i * w/8, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * h/8); ctx.lineTo(w, i * h/8); ctx.stroke();
  }
  var bounds = (MF.GRID_COLS || 11) * (MF.TILE || 1.4);
  var maxT = replay.duration || 1;
  var threshold = (progress || 1) * maxT;
  // Draw events up to threshold
  replay.events.forEach(function(e){
    if (e.t > threshold) return;
    if (e.type === 'kill'){
      var px = ((e.d.x + bounds/2) / bounds) * w;
      var pz = ((e.d.z + bounds/2) / bounds) * h;
      ctx.fillStyle = e.d.boss ? '#ff5050' : '#ffd96a';
      ctx.beginPath(); ctx.arc(px, pz, e.d.boss ? 5 : 2.5, 0, Math.PI*2); ctx.fill();
    } else if (e.type === 'summon'){
      var px = ((e.d.x + bounds/2) / bounds) * w;
      var pz = ((e.d.z + bounds/2) / bounds) * h;
      ctx.strokeStyle = '#80c8ff';
      ctx.beginPath(); ctx.arc(px, pz, 4, 0, Math.PI*2); ctx.stroke();
    } else if (e.type === 'merge'){
      var px = ((e.d.x + bounds/2) / bounds) * w;
      var pz = ((e.d.z + bounds/2) / bounds) * h;
      ctx.strokeStyle = '#c070ff';
      ctx.beginPath(); ctx.arc(px, pz, 6, 0, Math.PI*2); ctx.stroke();
    }
  });
  // Fortress
  ctx.fillStyle = '#ffd96a';
  ctx.beginPath(); ctx.arc(w/2, h/2, 5, 0, Math.PI*2); ctx.fill();
};

MF.replay_play = function(canvas, replay, dur){
  if (!canvas || !replay) return;
  dur = dur || 12000;
  var t0 = performance.now();
  var loop = function(){
    var pct = Math.min(1, (performance.now() - t0) / dur);
    MF.replay_drawTo(canvas, replay, pct);
    if (pct < 1) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

// =====================================================================
// === BOSS THEMES (musical signatures) ===
// =====================================================================
MF.BOSS_THEMES = {
  goblin_king: { osc: 'square',  freqs: [196, 233, 294], dur: 0.8 },        // horn (G/A♯/D)
  bone_lord:   { osc: 'square',  freqs: [220, 277, 329], dur: 0.4 },        // harpsichord (A/C♯/E)
  warlord:     { osc: 'sawtooth', freqs: [110, 110, 165], dur: 0.6 },        // drums (low pulse)
  hydra:       { osc: 'triangle', freqs: [165, 196, 233, 196], dur: 0.5 },   // polyrythmic
  lich:        { osc: 'sawtooth', freqs: [110, 131, 156], dur: 1.4 },        // organ (A/C/E♭ minor)
  dragon_king: { osc: 'square',   freqs: [82, 165, 247], dur: 1.0 }          // brass glissando
};

MF.boss_playTheme = function(bossId){
  if (!MF.audio || !MF.audio.ctx || !MF.audio.enabled) return;
  var theme = MF.BOSS_THEMES[bossId];
  if (!theme) return;
  theme.freqs.forEach(function(f, idx){
    setTimeout(function(){
      MF.audio._tone({ type: theme.osc, freq: f, dur: theme.dur, gain: 0.20 });
    }, idx * 180);
  });
};

// =====================================================================
// === ANIMATED MENU BACKGROUNDS ===
// =====================================================================
MF.MENU_BGS = {
  none:     { name:'Aucun', class:'' },
  galaxy:   { name:'Galaxie', class:'mf-bg-galaxy' },
  ocean:    { name:'Sous-marin', class:'mf-bg-ocean' },
  lava:     { name:'Lave', class:'mf-bg-lava' }
};

MF.menubg_apply = function(bgId){
  var menu = document.getElementById('mf-menu');
  if (!menu) return;
  Object.keys(MF.MENU_BGS).forEach(function(k){
    var c = MF.MENU_BGS[k].class;
    if (c) menu.classList.remove(c);
  });
  var b = MF.MENU_BGS[bgId];
  if (b && b.class) menu.classList.add(b.class);
  if (MF.state && MF.state.meta){
    MF.state.meta.menuBg = bgId;
    if (MF.saveProgress) MF.saveProgress();
  }
};

// =====================================================================
// === 8 NEW RELICS ===
// =====================================================================
MF.RELICS_P10 = {
  phoenix:        { id:'phoenix',     name:'Phénix',          icon:'🔥🪶', cost:600, desc:'Ressuscite la forteresse 1 fois (HP=50% max)' },
  echo_caster:    { id:'echo_caster', name:'Écho Magique',    icon:'🔁', cost:500, desc:'Les ultimes se déclenchent 2 fois (avec 1s de délai)' },
  charm:          { id:'charm',       name:'Charme',          icon:'💗', cost:550, desc:'5% de chance de convertir un ennemi en allié temporaire (4s)' },
  midas:          { id:'midas',       name:'Touche de Midas', icon:'👐', cost:400, desc:'Chaque kill rapporte 50% d\'or en plus' },
  time_warden:    { id:'time_warden', name:'Gardien du Temps',icon:'⏳', cost:700, desc:'Toutes les 60s, gel 3s automatique (chaos uniquement)' },
  vampire:        { id:'vampire',     name:'Soif de Sang',    icon:'🩸', cost:450, desc:'1 PV regagné toutes les 25 kills' },
  storm_call:     { id:'storm_call',  name:'Appel de Tempête',icon:'⛈', cost:550, desc:'Boss prend 25% dmg supplémentaires' },
  immortal:       { id:'immortal',    name:'Immortel',        icon:'🛡️✨', cost:800, desc:'Immunise tes héros aux statuts ennemis' }
};

// Register P10 relics into MF.RELICS (existing)
(function _registerP10Relics(){
  if (!MF.RELICS) return;
  Object.keys(MF.RELICS_P10).forEach(function(rid){
    MF.RELICS[rid] = MF.RELICS_P10[rid];
  });
})();

// =====================================================================
// === 2 NEW WORLDS (Underworld + Heaven) ===
// =====================================================================
(function _addWorlds(){
  if (!MF.WORLDS || !MF.ENEMIES) return;
  // Add new enemies
  MF.ENEMIES.zombie = {
    id:'zombie', name:'Zombie', kind:'standard', baseHP: 18, baseSpd: 0.7,
    color: 0x607038, scale: 0.6, gold: 4, fortressDmg: 1, armor: 0
  };
  MF.ENEMIES.angel = {
    id:'angel', name:'Ange Déchu', kind:'elite', baseHP: 32, baseSpd: 1.05,
    color: 0xfff8e0, scale: 0.65, gold: 8, fortressDmg: 1, armor: 0.10, flying: true
  };
  // Add worlds
  MF.WORLDS.push({
    id:'underworld', name:'Outre-Monde', icon:'🪦', levelCount: 15,
    sky:[0x250a0a, 0x4a1010], ground:0x2a1a1a, groundEdge:0x140808,
    pathColor:0x6a2020, fortressColor:0x3a1818, fogColor:0x1a0808
  });
  MF.WORLDS.push({
    id:'heaven', name:'Paradis', icon:'☁', levelCount: 15,
    sky:[0xeacf90, 0xfff5d0], ground:0xfff8e0, groundEdge:0xddc8a0,
    pathColor:0xc89868, fortressColor:0xfff8e0, fogColor:0xffeec8
  });
})();

// =====================================================================
// === ROGUELIKE PUR MODE — start empty, pick cards every 3 waves ===
// =====================================================================
MF.startRoguelike = function(){
  // Empty deck override
  MF.run = MF.run || {};
  MF.run.roguelike = true;
  MF.run.roguelikeDeckH = [];
  MF.run.roguelikeDeckT = [];
  // Use endless world
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = {
    name: 'Roguelike',
    waves: [],
    waveCount: 9999,
    fortressHP: 25, startGold: 80,
    isFinalLevel: false,
    rewardGold: 0, rewardStars: 0,
    isRoguelike: true
  };
  MF._startMatch(world, level, 'roguelike');
  // First card pick at start
  setTimeout(function(){ MF.roguelike_offerCards(); }, 800);
};

MF.roguelike_offerCards = function(){
  // 3 random cards: hero, tower, upgrade
  var heroes = (MF.UNIT_POOL_HERO || []).slice();
  var towers = (MF.UNIT_POOL_TOWER || []).slice();
  heroes.sort(function(){ return Math.random() - 0.5; });
  towers.sort(function(){ return Math.random() - 0.5; });
  var picks = [];
  if (heroes[0]) picks.push({ kind:'hero', id: heroes[0], name:'🛡 ' + (MF.UNITS[heroes[0]] ? MF.UNITS[heroes[0]].name : heroes[0]) });
  if (towers[0]) picks.push({ kind:'tower', id: towers[0], name:'🏹 ' + (MF.UNITS[towers[0]] ? MF.UNITS[towers[0]].name : towers[0]) });
  picks.push({ kind:'upgrade', id:'gold50', name:'💰 +50 Or' });
  MF.ui.openRoguelikeChoice && MF.ui.openRoguelikeChoice(picks);
};

MF.roguelike_apply = function(card){
  if (!MF.run) MF.run = {};
  if (card.kind === 'hero'){
    if (!MF.run.roguelikeDeckH.includes(card.id)) MF.run.roguelikeDeckH.push(card.id);
  } else if (card.kind === 'tower'){
    if (!MF.run.roguelikeDeckT.includes(card.id)) MF.run.roguelikeDeckT.push(card.id);
  } else if (card.kind === 'upgrade' && card.id === 'gold50'){
    MF.state.gold = (MF.state.gold || 0) + 50;
  }
  if (MF.notify_push) MF.notify_push('🃏 Carte ajoutée : ' + card.name, 'info');
};

MF.roguelike_onWaveCleared = function(waveIdx){
  if (!MF.run || !MF.run.roguelike) return;
  if (waveIdx > 0 && waveIdx % 3 === 0){
    setTimeout(function(){ MF.roguelike_offerCards(); }, 600);
  }
};

// =====================================================================
// === CRUCIBLE (weekly challenge) ===
// =====================================================================
MF.crucible_currentChallenge = function(){
  // Generate from week key
  var wk = MF.ladder_currentWeek ? MF.ladder_currentWeek() : 'default';
  var rng = MF._dailyRng ? MF._dailyRng(wk + '-crucible') : function(){ return Math.random(); };
  var ults = MF.ULTIMATES ? Object.keys(MF.ULTIMATES) : ['meteor'];
  var heroes = (MF.UNIT_POOL_HERO || []).slice();
  heroes.sort(function(){ return rng() - 0.5; });
  var imposedHeroes = heroes.slice(0, 3);
  var ultId = ults[Math.floor(rng() * ults.length)];
  var modIds = ['hardcore', 'speedrun', 'pacifist'];
  var variant = modIds[Math.floor(rng() * modIds.length)];
  return { week: wk, heroes: imposedHeroes, ult: ultId, variant: variant };
};

MF.crucible_canRun = function(){
  if (!MF.state.meta) return true;
  var ch = MF.crucible_currentChallenge();
  return !MF.state.meta.crucibleCompletedWeek || MF.state.meta.crucibleCompletedWeek !== ch.week;
};

MF.crucible_start = function(){
  var ch = MF.crucible_currentChallenge();
  // Force deck
  if (!MF.state.meta) return;
  var origDeck = JSON.stringify(MF.state.meta.activeDeck || {});
  MF.state.meta.activeDeck = { heroes: ch.heroes.slice(), towers: [] };
  MF.startChaos(ch.ult, ch.variant);
  // Restore deck after match (handled at endRun)
  MF.state.meta._crucibleOrigDeck = origDeck;
  MF.state.meta._crucibleActive = true;
};

MF.crucible_onEndRun = function(){
  if (!MF.state.meta || !MF.state.meta._crucibleActive) return;
  // Restore original deck
  if (MF.state.meta._crucibleOrigDeck){
    MF.state.meta.activeDeck = JSON.parse(MF.state.meta._crucibleOrigDeck);
    delete MF.state.meta._crucibleOrigDeck;
  }
  // Mark week as completed if positive time
  if (MF.chaos && MF.chaos.time >= 60){
    var ch = MF.crucible_currentChallenge();
    MF.state.meta.crucibleCompletedWeek = ch.week;
    MF.state.meta.crucibleBest = MF.state.meta.crucibleBest || {};
    MF.state.meta.crucibleBest[ch.week] = Math.max(MF.state.meta.crucibleBest[ch.week] || 0, MF.chaos.time);
    MF.state.meta.fragments = (MF.state.meta.fragments || 0) + 200;
    if (MF.notify_push) MF.notify_push('🏟 Crucible complété : +200 💎', 'success');
  }
  delete MF.state.meta._crucibleActive;
  MF.saveProgress();
};

// =====================================================================
// === DAILY TARGETS ===
// =====================================================================
MF.daily_target = function(){
  var key = MF.daily_today ? MF.daily_today() : '';
  if (!key) return null;
  var rng = MF._dailyRng ? MF._dailyRng(key + '-target') : function(){ return Math.random(); };
  var modes = ['kills', 'time', 'combo'];
  var pick = modes[Math.floor(rng() * modes.length)];
  if (pick === 'kills'){
    var n = 200 + Math.floor(rng() * 200);     // 200-400
    return { id:'kills_' + n, type:'kills', target: n, desc: 'Atteins ' + n + ' kills aujourd\'hui (toutes runs).', reward: 80 };
  }
  if (pick === 'time'){
    var t = 4 + Math.floor(rng() * 6);          // 4-9 min
    return { id:'time_' + t, type:'chaos_time', target: t * 60, desc: 'Survis ' + t + ' minutes en chaos.', reward: 100 };
  }
  if (pick === 'combo'){
    var c = 60 + Math.floor(rng() * 60);        // 60-119
    return { id:'combo_' + c, type:'combo', target: c, desc: 'Atteins un combo de ' + c + ' en chaos.', reward: 90 };
  }
  return null;
};

MF.daily_target_progress = function(type, amount){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  meta.dailyTargets = meta.dailyTargets || {};
  var key = MF.daily_today();
  meta.dailyTargets[key] = meta.dailyTargets[key] || {};
  var target = MF.daily_target();
  if (!target || target.type !== type) return;
  var rec = meta.dailyTargets[key][target.id] || { progress: 0, completed: false };
  if (rec.completed) return;
  if (type === 'kills') rec.progress = (rec.progress || 0) + amount;
  else rec.progress = Math.max(rec.progress || 0, amount);
  if (rec.progress >= target.target){
    rec.completed = true;
    meta.fragments = (meta.fragments || 0) + target.reward;
    if (MF.notify_push) MF.notify_push('🎯 Objectif du jour : +' + target.reward + ' 💎', 'success');
    if (MF.audio && MF.audio.achievement) MF.audio.achievement();
  }
  meta.dailyTargets[key][target.id] = rec;
  if (MF.saveProgress) MF.saveProgress();
};
