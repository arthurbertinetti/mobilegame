// === Merge Fortress TD — Main game loop & orchestration ===
window.MF = window.MF || {};

MF._t = 0;
MF._lastT = 0;
MF._rafId = 0;

MF.init = function(){
  if (typeof THREE === 'undefined'){
    var loadingDiv = document.getElementById('mf-loading');
    if (loadingDiv) loadingDiv.innerHTML =
      '<div class="mf-loading-inner" style="color:#ff8a8a"><div style="font-size:2rem;margin-bottom:8px">⚠</div>'
      + '<div style="font-weight:bold">Three.js manquant</div>'
      + '<div style="font-size:.78rem;margin-top:8px;opacity:.85;line-height:1.5">Télécharge la lib (une fois) avec :<br>'
      + '<code style="display:block;background:#000;padding:6px 10px;margin-top:6px;border-radius:5px;font-size:.7rem">curl -L -o lib/three.min.js https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js</code></div></div>';
    return;
  }
  MF.loadProgress();
  MF.initThree();
  MF.ui.init();
  MF.input.init();
  // Hide loading, show menu
  document.getElementById('mf-loading').classList.add('mf-hidden');
  MF.ui.showScreen('menu');
  // Phase 8: intro narrative on first launch
  if (MF.intro_show) MF.intro_show();

  // Start RAF loop
  MF._lastT = performance.now() / 1000;
  MF._rafId = requestAnimationFrame(MF._tick);
};

MF._tick = function(now){
  MF._rafId = requestAnimationFrame(MF._tick);
  var t = (now || performance.now()) / 1000;
  var dt = Math.min(0.05, t - MF._lastT);  // cap dt to avoid spiral after tab-switch
  MF._lastT = t;

  // Speed multiplier (only during play and not paused)
  var simDt = dt;
  if (MF.state.screen === 'play' && !MF.state.paused){
    simDt = dt * (MF.state.speed || 1);
    MF._t += simDt;
    MF.update(simDt);
  } else {
    // Just animate FX so menu/pause doesn't freeze totally
    MF._t += dt;
  }

  // Always render FX & decorative animations (so paused screen still shows scene)
  MF.fx.update(dt);
  if (MF.fx.updateAmbient) MF.fx.updateAmbient(dt);
  if (MF.updateGridFx) MF.updateGridFx(MF._t);
  MF.updateCamera(dt);
  if (MF.three.renderer && MF.three.scene && MF.three.camera){
    MF.three.renderer.render(MF.three.scene, MF.three.camera);
  }

  // Handle outcome at end of frame
  if (MF.state.screen === 'play' && MF.state.outcome && !MF._outcomeHandled){
    MF._outcomeHandled = true;
    setTimeout(function(){ MF.endRun(MF.state.outcome === 'win'); }, 600);
  }
};

MF.update = function(dt){
  if (MF.state.outcome) return;
  if (MF.rl_tickGlobal) MF.rl_tickGlobal(dt);
  if (MF.state.mode === 'chaos'){
    if (MF.chaos_update) MF.chaos_update(dt);
  } else if (MF.state.mode === 'raid'){
    if (MF.raid_update) MF.raid_update(dt);
  } else {
    MF.updateWaves(dt);
  }
  MF.updateUnits(dt);
  MF.updateEnemies(dt);
  MF.updateProjectiles(dt);
  // P13 abilities
  if (MF.ability_tickAuras) MF.ability_tickAuras(dt);
  if (MF.ability_updateWolves) MF.ability_updateWolves(dt);
  // P14 boss custom regen
  if (MF.bosscustom_tick) MF.bosscustom_tick(dt);
  // Synergies: re-compute every 0.5s (cheap)
  MF._synergyT = (MF._synergyT || 0) + dt;
  if (MF._synergyT > 0.5){ MF._synergyT = 0; if (MF.synergies_update) MF.synergies_update(); }
  // P14: auto-merge tick (every 1.2s)
  if (MF.state.autoMerge){
    MF._autoT = (MF._autoT || 0) + dt;
    if (MF._autoT > 1.2){
      MF._autoT = 0;
      // Try summon if affordable
      if (MF.state.gold >= MF.state.summonCost && MF.findFreeCell && MF.findFreeCell()){
        if (MF.ui && MF.ui.doSummon) MF.ui.doSummon('hero');
      }
      // Try merge any 2 same-id+rank units
      if (MF.units && MF.units.length >= 2){
        for (var i = 0; i < MF.units.length; i++){
          for (var j = i + 1; j < MF.units.length; j++){
            var ua = MF.units[i], ub = MF.units[j];
            if (ua && ub && MF.canMerge && MF.canMerge(ua, ub) && ua.id === ub.id && ua.rank === ub.rank){
              MF.tryMerge(ua, ub);
              return;
            }
          }
        }
      }
    }
  }
  MF.ui.update();
};

// === Run lifecycle ===
MF._resetMatch = function(){
  MF.clearWaves();
  MF.clearProjectiles();
  MF.clearEnemies();
  MF.clearUnits();
  MF.clearWorld();
  if (MF.ability_clearWolves) MF.ability_clearWolves();
  if (MF.chaos_clearBullets) MF.chaos_clearBullets();
  if (MF.chaos_clearDrops) MF.chaos_clearDrops();
  // P14: clear cached preview/range meshes that linger between matches
  if (MF.input){
    if (MF.input._dropMesh){ MF.input._dropMesh = null; }
    if (MF.input._dropGlow){ MF.input._dropGlow = null; }
  }
  if (MF.ui){
    if (MF.ui._rangeMesh){ MF.ui._rangeMesh = null; }
  }
  MF._t = 0;
  if (MF.replay_init) MF.replay_init();
  MF._outcomeHandled = false;
  MF.state.outcome = null;
  MF.state.waveIdx = 0;
  MF.state.summonsThisLevel = 0;
  MF.state.killsThisLevel = 0;
  MF.state.damageDealt = 0;
  MF.state.startTime = Date.now();
  MF.state.summonCost = 18;
  MF.state.towerCost = 40;
  MF.state.speed = 1;
  MF.state.paused = false;
  // Reset speed button label
  var sb = document.getElementById('mf-speed-btn');
  if (sb) sb.textContent = '⏩';
};

MF._startMatch = function(world, level, mode){
  MF._resetMatch();
  if (MF.state.meta){
    MF.state.meta.totalRuns = (MF.state.meta.totalRuns || 0) + 1;
    if (MF.ach_check) MF.ach_check();
  }
  MF.state.mode = mode;
  MF.state.level = level;
  MF.state.fortressMaxHP = level.fortressHP || 20;
  MF.state.fortressHP = MF.state.fortressMaxHP;
  MF.state.gold = level.startGold || 100;

  // === Roguelite: build run state from talents + relics + modifiers ===
  if (MF.startRunRoguelite){
    MF.startRunRoguelite({
      useModifiers: (mode === 'endless' || mode === 'bossrush')
    });
  }

  MF.applyWorldTheme(world);
  if (MF.audio && MF.audio.setWorld) MF.audio.setWorld(world.id);
  MF.buildGrid(world);
  // P12: apply pending mercenary after grid is ready
  if (MF.merc_applyAtRunStart) setTimeout(function(){ MF.merc_applyAtRunStart(); }, 1000);
  // P12: track play date for reminder
  if (MF.reminder_track) MF.reminder_track();
  MF.fx.spawnAmbientParticles(world);   // themed floating particles
  MF.resetCamera();           // re-fit & re-center on new match
  MF.ui.showScreen('play');
  MF.ui.update();

  // Intro banner + sound
  if (MF.audio && MF.audio.runStart) MF.audio.runStart();
  setTimeout(function(){
    MF.fx.showBanner((mode === 'endless' ? 'Mode Infini' : (mode === 'bossrush' ? 'Boss Rush' : (world.icon + ' ' + world.name))), 'wave');
  }, 200);
  // Safety: ensure paused is reset at match start
  MF.state.paused = false;
  // P14: Modifier choice (3 buffs) → Pacte choice chained
  if (MF.ui && !MF.state.outcome && mode !== 'chaos'){
    setTimeout(function(){
      var openModif = MF.ui.openModifierChoice;
      var openPacte = MF.ui.openPacteChoice;
      var canPacte = openPacte && (mode === 'campaign' || mode === 'endless' || mode === 'beyond' || mode === 'bossrush');
      var finalize = function(){ MF.state.paused = false; };
      if (openModif){
        openModif(function(){
          // Modifier modal closed — chain pacte if applicable, else finalize
          if (canPacte){
            // paused stays true (modifier did NOT reset it) — pacte will close it
            openPacte(finalize);
          } else {
            finalize();
          }
        });
      } else if (canPacte){
        openPacte(finalize);
      }
    }, 700);
  }
  // Show active modifiers (if any) as a follow-up banner
  if (MF.run && MF.run.activeModifiers && MF.run.activeModifiers.length){
    setTimeout(function(){
      var txt = MF.run.activeModifiers.map(function(m){ return m.icon + ' ' + m.name; }).join('  •  ');
      MF.fx.showBanner('🌀 ' + txt, 'wave');
    }, 1600);
  }
};

MF.startCampaign = function(worldIdx, levelIdx){
  if (!MF.isLevelUnlocked(worldIdx, levelIdx)) return;
  MF.state.worldIdx = worldIdx;
  MF.state.levelIdx = levelIdx;
  // P11: show chapter lore on level 1 of a new world
  if (levelIdx === 1 && MF.chapter_show){ MF.chapter_show(worldIdx); }
  var world = MF.WORLDS[worldIdx];
  var level = MF.generateLevel(worldIdx, levelIdx);
  MF._startMatch(world, level, 'campaign');
  // Tutorial on first campaign run (1-1)
  if (worldIdx === 0 && levelIdx === 1 && MF.state.meta && !MF.state.meta.tutorialCampaignDone && MF.ui.startCampaignTutorial){
    setTimeout(function(){ MF.ui.startCampaignTutorial(); }, 500);
  }
};

MF.startEndless = function(){
  // Use a generated "endless" level container
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = {
    name: 'Infini',
    waves: [],            // generated on demand
    waveCount: 9999,
    fortressHP: 30, startGold: 200,
    isFinalLevel: false,
    rewardGold: 0, rewardStars: 0,
    isEndless: true
  };
  MF._startMatch(world, level, 'endless');
};

MF.startBossRush = function(){
  var world = MF.WORLDS[Math.min(MF.WORLDS.length - 1, MF.state.highestWorld)];
  var level = MF.generateBossRushLevel();
  MF._startMatch(world, level, 'bossrush');
};

// === BEYOND — procedural endless campaign worlds ===
MF.startBeyond = function(beyondIdx){
  // Pick a random theme from existing worlds
  var themes = MF.WORLDS.slice();
  var theme = themes[Math.floor(Math.random() * themes.length)];
  // Build virtual world (visual theme only)
  var beyondWorld = Object.assign({}, theme, {
    id: 'beyond_' + beyondIdx,
    name: 'Au-delà ' + beyondIdx + ' — ' + theme.name,
    icon: '🌌',
    levelCount: 5,
    isBeyond: true
  });
  // Generate beyond level — like endless wave but bundled into a fixed level (10 waves)
  var hpScale = Math.pow(1.4, beyondIdx);
  var spdScale = 1 + Math.min(0.6, beyondIdx * 0.05);
  var waves = [];
  for (var w = 1; w <= 10; w++){
    var wave = MF.generateEndlessWave(w + beyondIdx * 5, 0);
    // Apply additional beyond scaling
    wave.enemies.forEach(function(e){
      e.hpMult = (e.hpMult || 1) * hpScale;
      e.spdMult = (e.spdMult || 1) * spdScale;
    });
    waves.push(wave);
  }
  var level = {
    name: 'Au-delà ' + beyondIdx,
    waves: waves,
    waveCount: waves.length,
    fortressHP: 25,
    startGold: 150,
    isFinalLevel: false,
    rewardGold: 50 + beyondIdx * 10,
    rewardStars: 1,
    isBeyond: true,
    beyondIdx: beyondIdx
  };
  MF._startMatch(beyondWorld, level, 'beyond');
};

// === CHAOS launcher (after ultimate is chosen via UI) ===
MF.startChaos = function(ultimateId, variant){
  if (!MF.ULTIMATES[ultimateId]) ultimateId = 'meteor';
  MF.startChaosRun(ultimateId, variant || 'normal');
};

MF.endRun = function(won){
  // Roguelite: convert run progress to fragments (meta currency)
  var fragments = MF.endRunRoguelite ? MF.endRunRoguelite() : 0;
  // Push run history for replay graph
  if (MF.history_push){
    MF.history_push({
      mode: MF.state.mode, won: won, kills: MF.state.killsThisLevel || 0,
      time: Math.round((Date.now() - (MF.state.startTime || Date.now())) / 1000)
    });
  }
  // Save replay snapshot
  if (MF.replay_save) MF.replay_save();
  // P12: pantheon record
  if (MF.pantheon_record && MF.pantheon_computeScore){
    var score = MF.pantheon_computeScore(MF.state.mode);
    if (score > 0) MF.pantheon_record(MF.state.mode, score);
  }
  // Chaos mode also generates fragments (replaces roguelite for this mode)
  if (MF.state.mode === 'chaos' && MF.chaos_end){
    fragments = MF.chaos_end();
  }
  MF.state.lastFragmentsEarned = fragments;

  if (MF.state.mode === 'campaign'){
    var stars = won ? Math.max(1, (MF.state.fortressHP === MF.state.fortressMaxHP ? 3 : (MF.state.fortressHP > MF.state.fortressMaxHP * 0.5 ? 2 : 1))) : 0;
    MF.recordLevelResult(MF.state.worldIdx, MF.state.levelIdx, won, stars, MF.state.waveIdx);
    if (won && MF.ach_onLevelWon) MF.ach_onLevelWon(stars, MF.state.fortressMaxHP, MF.state.fortressHP);
  } else if (MF.state.mode === 'beyond'){
    if (won && MF.state.meta && MF.state.level){
      var bIdx = MF.state.level.beyondIdx || 1;
      MF.state.meta.beyondHighest = Math.max(MF.state.meta.beyondHighest || 0, bIdx);
      MF.state.meta.fragments += (50 + bIdx * 25);
      MF.saveProgress();
    }
  } else if (MF.state.mode === 'endless'){
    MF.state.endlessBest = Math.max(MF.state.endlessBest, MF.state.waveIdx);
    MF.saveProgress();
  } else if (MF.state.mode === 'bossrush'){
    if (won) { MF.state.bossRushDone = true; MF.saveProgress(); }
  }
  MF.ui.showEnd(won);
};

// Listen to load
window.addEventListener('load', MF.init);
