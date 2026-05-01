// === Merge Fortress TD — Wave manager ===
window.MF = window.MF || {};

MF.waves = {
  spawnQueue: [],   // { type, hpMult, spdMult, goldMult, dueAt, ...opts }
  active: false,
  startT: 0,
  current: null
};

MF.startWave = function(){
  if (MF.waves.active) return;
  if (!MF.state.level) return;
  // Endless / roguelike / beyond modes: waves are generated on demand
  if (MF.state.mode === 'endless' || MF.state.mode === 'roguelike' || MF.state.mode === 'beyond'){
    MF.state.waveIdx++;
    var w = MF.generateEndlessWave(MF.state.waveIdx, MF.state.worldIdx || 0);
    MF._enqueueWave(w);
    return;
  }
  if (MF.state.waveIdx >= MF.state.level.waveCount) return;
  MF.state.waveIdx++;
  var wave = MF.state.level.waves[MF.state.waveIdx - 1];
  if (!wave){
    MF.fx.showBanner('🚫 Vague introuvable', 'wave');
    return;
  }
  MF._enqueueWave(wave);
};

MF._enqueueWave = function(wave){
  MF.waves.current = wave;
  MF.waves.active = true;
  MF.waves.startT = MF._t || 0;
  MF.waves.spawnQueue = wave.enemies.map(function(e){
    return Object.assign({}, e, { dueAt: (MF._t || 0) + (e.delay || 0) });
  });
  // Banner
  if (wave.isBoss){
    MF.fx.showBanner('⚠ BOSS — Vague ' + MF.state.waveIdx, 'boss');
    MF.fx.shake(0.2, 0.3);
  } else {
    MF.fx.showBanner('Vague ' + MF.state.waveIdx, 'wave');
  }
  MF.ui.update();
};

MF.updateWaves = function(dt){
  if (!MF.waves.active) return;
  var t = MF._t;
  // Spawn enemies whose dueAt has passed
  for (var i = MF.waves.spawnQueue.length - 1; i >= 0; i--){
    var s = MF.waves.spawnQueue[i];
    if (s.dueAt <= t){
      var opts = { goldMult: s.goldMult || 1 };
      if (s.scaleMult) opts.scaleMult = s.scaleMult;
      if (s.isMini) opts.isMini = true;
      MF.spawnEnemy(s.type, s.hpMult || 1, s.spdMult || 1, opts);
      MF.waves.spawnQueue.splice(i, 1);
    }
  }
  // Wave done: queue empty + no enemies left
  if (MF.waves.spawnQueue.length === 0 && MF.enemies.length === 0){
    MF._onWaveCleared();
  }
};

MF._onWaveCleared = function(){
  MF.waves.active = false;
  // Reward gold per wave
  var bonus = 20 + Math.floor(MF.state.waveIdx * 5);
  MF.state.gold += bonus;
  MF.fx.floatingDmg(MF.grid.fortressPos, '+' + bonus + '💰', 'gold');
  // P12+: trigger victory pose + ✨ floating on all units
  if (MF.units){
    MF.units.forEach(function(u){
      u.victoryT = 2.5;
      if (MF.fx && MF.fx.floatingDmg) MF.fx.floatingDmg(u.pos, '✨', 'gold');
    });
  }
  if (MF.audio && MF.audio.waveEnd) MF.audio.waveEnd();

  // Roguelite per-wave hook (regen, bonus gold, wave blast, etc.)
  if (MF.rl_onWaveCleared) MF.rl_onWaveCleared(MF.state.waveIdx);
  // P10 Roguelike: card choice every 3 waves
  if (MF.roguelike_onWaveCleared) MF.roguelike_onWaveCleared(MF.state.waveIdx);

  MF.ui.update();

  // Check level completion (skip for endless/roguelike — never end)
  if (MF.state.mode !== 'endless' && MF.state.mode !== 'roguelike' && MF.state.waveIdx >= MF.state.level.waveCount){
    MF.state.outcome = 'win';
    return;
  }

  // Roguelite: offer 3-upgrade choice every N waves
  var freq = MF.rl_upgradeFrequency ? MF.rl_upgradeFrequency() : 5;
  if (MF.state.waveIdx > 0 && MF.state.waveIdx % freq === 0 && MF.ui && MF.ui.openUpgradeChoice){
    MF.ui.openUpgradeChoice();
    return;
  }

  // Pulse start-wave button to encourage next
  var btn = document.getElementById('mf-start-wave-btn');
  if (btn) btn.classList.add('mf-pulse');
};

MF.clearWaves = function(){
  MF.waves.spawnQueue = [];
  MF.waves.active = false;
  MF.waves.current = null;
};
