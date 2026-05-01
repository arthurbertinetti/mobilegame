// === Merge Fortress TD — Phase 11 ===
window.MF = window.MF || {};

// =====================================================================
// === FORGE R6 — fusion de 2 héros R5 identiques en R6 mythique ===
// =====================================================================
MF.FORGE_FRAGMENT_COST = 800;

MF.forge_canFuse = function(unitA, unitB){
  if (!unitA || !unitB) return false;
  if (unitA.uid === unitB.uid) return false;
  if (unitA.id !== unitB.id) return false;
  if (unitA.rank !== 5 || unitB.rank !== 5) return false;
  // Hybrids excluded
  if (MF.UNITS[unitA.id] && MF.UNITS[unitA.id].isHybrid) return false;
  if (!MF.state.meta || (MF.state.meta.fragments || 0) < MF.FORGE_FRAGMENT_COST) return false;
  return true;
};

MF.forge_doFuse = function(unitA, unitB){
  if (!MF.forge_canFuse(unitA, unitB)) return false;
  var c = unitB.c, r = unitB.r;
  var pos = unitB.pos.clone();
  if (MF.fx){
    MF.fx.spawnRing(pos, 0xffd96a, { scale: 8, life: 1.0 });
    MF.fx.spawnBurst(pos, 0xffd96a, 40, { speed: 7 });
    MF.fx.shake(0.7, 0.6);
    MF.fx.showBanner('🔥 FUSION MYTHIQUE — R6', 'wave');
  }
  if (MF.audio && MF.audio.ultCast) MF.audio.ultCast();
  if (MF.audio && MF.audio.achievement) setTimeout(function(){ MF.audio.achievement(); }, 200);
  // Spend fragments
  MF.state.meta.fragments -= MF.FORGE_FRAGMENT_COST;
  // Track mythic units owned
  MF.state.meta.mythicUnits = MF.state.meta.mythicUnits || {};
  MF.state.meta.mythicUnits[unitA.id] = (MF.state.meta.mythicUnits[unitA.id] || 0) + 1;
  MF.saveProgress();
  // Remove both
  MF.removeUnit(unitA);
  MF.removeUnit(unitB);
  // Spawn special R5 with mythic flag (keeps rank 5 but flagged mythic for visual)
  var u = MF.spawnUnit(unitA.id, 5, c, r);
  if (u){
    u.mythic = true;
    u.mesh.scale.setScalar(2);
    u.spawnT = -0.2;
    // Boost damage permanently for this unit instance
    u.mythicDmgMult = 2.0;
    if (MF.fx && MF.fx.floatingDmg) MF.fx.floatingDmg(pos, '⭐ MYTHIQUE × ' + (MF.UNITS[unitA.id].name), 'gold');
  }
  return true;
};

// Hook into merge — called from merge.js if both R5 same id and player has fragments
MF.forge_tryFromMerge = function(srcUnit, dstUnit){
  if (srcUnit.id !== dstUnit.id) return false;
  if (srcUnit.rank !== 5 || dstUnit.rank !== 5) return false;
  if (!MF.forge_canFuse(srcUnit, dstUnit)) return false;
  // P14: detailed preview
  var data = MF.UNITS[srcUnit.id];
  var rdata = data.ranks[4];
  var name = data.name;
  var msg = '🔥 FORGE MYTHIQUE R6\n\n';
  msg += 'Héros : ' + (data.icon || '') + ' ' + name + '\n';
  msg += 'Dégâts actuels : ' + rdata.dmg + '\n';
  msg += 'Dégâts mythique : ' + (rdata.dmg * 2) + ' (×2)\n';
  msg += 'Taille : +20% scale + glow doré\n\n';
  msg += 'Coût : ' + MF.FORGE_FRAGMENT_COST + ' 💎\n';
  msg += 'Tu en as : ' + (MF.state.meta.fragments || 0) + ' 💎\n\n';
  msg += '⚠ ATTENTION : action irréversible. Tu perdras 2 héros R5.';
  if (!confirm(msg)) return false;
  return MF.forge_doFuse(srcUnit, dstUnit);
};

// Apply mythic dmg multiplier in combat
// (Hooked via rl_computeDamage extension)

// =====================================================================
// === LOADOUT SLOTS (3 decks save/switch) ===
// =====================================================================
MF.loadout_init = function(){
  if (!MF.state.meta) return;
  MF.state.meta.loadouts = MF.state.meta.loadouts || [null, null, null];
};

MF.loadout_save = function(slot){
  MF.loadout_init();
  if (!MF.state.meta.activeDeck) return false;
  MF.state.meta.loadouts[slot] = JSON.parse(JSON.stringify(MF.state.meta.activeDeck));
  if (MF.saveProgress) MF.saveProgress();
  if (MF.notify_push) MF.notify_push('💾 Loadout slot ' + (slot + 1) + ' sauvegardé', 'success');
  return true;
};

MF.loadout_load = function(slot){
  MF.loadout_init();
  var l = MF.state.meta.loadouts[slot];
  if (!l) return false;
  MF.state.meta.activeDeck = JSON.parse(JSON.stringify(l));
  if (MF.saveProgress) MF.saveProgress();
  if (MF.notify_push) MF.notify_push('📥 Loadout slot ' + (slot + 1) + ' chargé', 'success');
  return true;
};

// =====================================================================
// === CHAOS DIMENSIONS — random portals after 5min ===
// =====================================================================
MF.dimensions_check = function(){
  if (!MF.chaos || !MF.chaos.active) return;
  if (MF.chaos.time < 300) return;
  if (MF.chaos.dimensionT && MF.chaos.dimensionT > 0){
    MF.chaos.dimensionT -= 0.05;
    if (MF.chaos.dimensionT <= 0){ MF.dimensions_endActive(); }
    return;
  }
  if (!MF.chaos._nextDim) MF.chaos._nextDim = MF.chaos.time + 60 + Math.random() * 30;
  if (MF.chaos.time >= MF.chaos._nextDim){
    MF.dimensions_spawnPortal();
    MF.chaos._nextDim = MF.chaos.time + 90 + Math.random() * 30;
  }
};

MF.DIMENSIONS = {
  inverted: { id:'inverted', icon:'🔄', name:'Gravité Inversée', desc:'Ennemis flottent + 50%' },
  mirror:   { id:'mirror',   icon:'🪞', name:'Miroir',         desc:'Ennemis miroir spawnent près des héros' },
  rush:     { id:'rush',     icon:'💨', name:'Rush',           desc:'Vitesse ×2 ennemis pendant 30s' }
};

MF.dimensions_spawnPortal = function(){
  if (!MF.three || !MF.grid) return;
  var fortress = MF.grid.fortressPos || { x:0, y:0, z:0 };
  var ang = Math.random() * Math.PI * 2;
  var d = 4 + Math.random() * 2;
  var px = fortress.x + Math.cos(ang) * d;
  var pz = fortress.z + Math.sin(ang) * d;
  var portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.10, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0xc070ff, emissive: 0xc070ff, emissiveIntensity: 1.5, roughness: 0.3 })
  );
  portalRing.position.set(px, 0.7, pz);
  portalRing.rotation.x = Math.PI / 2;
  MF.three.worldGroup.add(portalRing);
  // Portal core
  var core = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 22),
    new THREE.MeshBasicMaterial({ color: 0xa080ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })
  );
  core.position.copy(portalRing.position);
  core.rotation.x = Math.PI / 2;
  MF.three.worldGroup.add(core);
  if (MF.fx) MF.fx.showBanner('🌀 Portail dimensionnel apparaît !', 'boss');
  // Auto-trigger after 10s if not "tapped" — we just trigger it after delay
  MF.chaos._portalMesh = { ring: portalRing, core: core, pos: { x: px, z: pz } };
  setTimeout(function(){
    if (MF.chaos._portalMesh){
      MF.dimensions_activate();
    }
  }, 10000);
};

MF.dimensions_activate = function(){
  var ids = Object.keys(MF.DIMENSIONS);
  var pick = ids[Math.floor(Math.random() * ids.length)];
  var dim = MF.DIMENSIONS[pick];
  MF.chaos.dimensionT = 30;
  MF.chaos.dimensionId = pick;
  if (MF.fx) MF.fx.showBanner(dim.icon + ' ' + dim.name + ' (' + dim.desc + ')', 'boss');
  if (MF.fx) MF.fx.shake(0.6, 0.5);
  // Apply effects
  if (pick === 'rush'){
    MF.run = MF.run || {};
    MF.run._origEnemySpdMult = MF.run.enemySpdMult || 1;
    MF.run.enemySpdMult = (MF.run.enemySpdMult || 1) * 2;
  } else if (pick === 'inverted'){
    MF.run = MF.run || {};
    MF.run.mapLowGrav = true;
  } else if (pick === 'mirror'){
    // Spawn mirror copies of enemies near heroes
    if (MF.units && MF.enemies){
      for (var i = 0; i < Math.min(3, MF.units.length); i++){
        var u = MF.units[i];
        if (!u) continue;
        var enemyTypes = ['goblin', 'skeleton', 'orc'];
        var typeId = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        var e = MF.spawnEnemy ? MF.spawnEnemy(typeId, 0.6, 1.2) : null;
        if (e){
          e.pos.x = u.pos.x + (Math.random() - 0.5) * 1;
          e.pos.z = u.pos.z + (Math.random() - 0.5) * 1;
          e.mesh.position.copy(e.pos);
          e.chaos = true;
        }
      }
    }
  }
  // Remove portal mesh
  if (MF.chaos._portalMesh){
    MF.three.worldGroup.remove(MF.chaos._portalMesh.ring);
    MF.three.worldGroup.remove(MF.chaos._portalMesh.core);
    if (MF._disposeMesh){ MF._disposeMesh(MF.chaos._portalMesh.ring); MF._disposeMesh(MF.chaos._portalMesh.core); }
    MF.chaos._portalMesh = null;
  }
};

MF.dimensions_endActive = function(){
  if (MF.chaos.dimensionId === 'rush'){
    if (MF.run) MF.run.enemySpdMult = MF.run._origEnemySpdMult || 1;
  } else if (MF.chaos.dimensionId === 'inverted'){
    if (MF.run) MF.run.mapLowGrav = false;
  }
  MF.chaos.dimensionId = null;
  MF.chaos.dimensionT = 0;
  if (MF.fx) MF.fx.showBanner('🌀 Dimension terminée', 'wave');
};

// =====================================================================
// === HAPTIC VIBRATION ===
// =====================================================================
MF.haptic_tap = function(intensity){
  var meta = MF.state.meta || {};
  if (meta.access && meta.access.haptic === false) return;
  if (!navigator.vibrate) return;
  var pattern = intensity === 'heavy' ? [40] : intensity === 'medium' ? [25] : [12];
  try { navigator.vibrate(pattern); } catch(e){}
};

// =====================================================================
// === AUDIO MIXER (3 channels) ===
// =====================================================================
MF.audio_mixerInit = function(){
  if (!MF.audio || !MF.audio.ctx) return;
  var meta = MF.state.meta || {};
  meta.audioMix = meta.audioMix || { sfx: 0.7, music: 0.55, voice: 0.6 };
  if (!MF.audio.sfxBus){
    MF.audio.sfxBus = MF.audio.ctx.createGain();
    MF.audio.sfxBus.gain.value = meta.audioMix.sfx;
    MF.audio.sfxBus.connect(MF.audio.master);
  }
  if (!MF.audio.musicBus){
    MF.audio.musicBus = MF.audio.ctx.createGain();
    MF.audio.musicBus.gain.value = meta.audioMix.music;
    MF.audio.musicBus.connect(MF.audio.master);
    if (MF.audio.music && MF.audio.music.busGain){
      // Reroute music busGain through musicBus
      MF.audio.music.busGain.disconnect();
      MF.audio.music.busGain.connect(MF.audio.musicBus);
    }
  }
  if (!MF.audio.voiceBus){
    MF.audio.voiceBus = MF.audio.ctx.createGain();
    MF.audio.voiceBus.gain.value = meta.audioMix.voice;
    MF.audio.voiceBus.connect(MF.audio.master);
  }
};

MF.audio_setMix = function(channel, value){
  var meta = MF.state.meta || {};
  meta.audioMix = meta.audioMix || { sfx: 0.7, music: 0.55, voice: 0.6 };
  meta.audioMix[channel] = Math.max(0, Math.min(1, value));
  if (MF.audio_mixerInit) MF.audio_mixerInit();
  if (MF.audio.sfxBus && channel === 'sfx') MF.audio.sfxBus.gain.value = meta.audioMix.sfx;
  if (MF.audio.musicBus && channel === 'music') MF.audio.musicBus.gain.value = meta.audioMix.music;
  if (MF.audio.voiceBus && channel === 'voice') MF.audio.voiceBus.gain.value = meta.audioMix.voice;
  if (MF.saveProgress) MF.saveProgress();
};

// =====================================================================
// === VOICE-OVER (synthetic) ===
// =====================================================================
MF.voice_say = function(phrase){
  if (!MF.audio || !MF.audio.ctx || !MF.audio.enabled) return;
  if (MF.audio_mixerInit) MF.audio_mixerInit();
  var ctx = MF.audio.ctx;
  // Crude formant-like synthesis: low sawtooth + filter sweep + amplitude envelope
  var dur = 0.5 + phrase.length * 0.04;
  var osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  // Pitch wobble per syllable
  for (var i = 0; i < phrase.length; i++){
    var pitch = 100 + ((phrase.charCodeAt(i) % 10) * 8);
    osc.frequency.setValueAtTime(pitch, ctx.currentTime + i * 0.04);
  }
  var bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value = 6;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(bp); bp.connect(gain);
  if (MF.audio.voiceBus) gain.connect(MF.audio.voiceBus);
  else gain.connect(MF.audio.master);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.05);
};

MF.voice_phrases = {
  bossSpawn: 'BOSS APPROCHE',
  victory:   'VICTOIRE',
  defeat:    'DEFAITE',
  waveStart: 'VAGUE INCOMING',
  hybrid:    'FUSION LEGENDAIRE'
};

MF.voice_event = function(type){
  var phrase = MF.voice_phrases[type];
  if (phrase) MF.voice_say(phrase);
};

// =====================================================================
// === CAMPAIGN CHAPTERS (lore between worlds) ===
// =====================================================================
MF.CHAPTERS = {
  0: { title:'Chapitre I — La Plaine', text:'Tu sors d\'une longue marche. La plaine s\'étend, le ciel est calme. Mais déjà au loin, des silhouettes se dessinent. Le siège commence.' },
  1: { title:'Chapitre II — Le Désert', text:'La plaine est tombée. Tu te replies vers les sables ardents. Les ruines anciennes recèlent des reliques étranges...' },
  2: { title:'Chapitre III — Les Glaciers', text:'Le froid mord. Au-dessus du blizzard, des géants endormis veillent. Tu sens le poids du gel jusque dans tes os.' },
  3: { title:'Chapitre IV — Les Volcans', text:'La terre crache. Ce sont les royaumes de feu, où chaque pierre est promesse de combustion. Le Roi Dragon dort en bas.' },
  4: { title:'Chapitre V — Les Catacombes', text:'L\'air est lourd. Les morts se relèvent. La Liche t\'attend dans les profondeurs nécromantiques.' },
  5: { title:'Chapitre VI — Le Ciel', text:'Au sommet du monde, là où les nuages embrassent la pierre. La dernière forteresse. Le dernier souffle.' },
  6: { title:'Chapitre VII — L\'Outre-Monde', text:'Les portes des morts s\'ouvrent. Les zombies dansent. Tu n\'es plus dans ton monde.' },
  7: { title:'Chapitre VIII — Le Paradis', text:'Mais même les anges sont tombés. Tu termines ton odyssée parmi la lumière qui ne sait plus pourquoi elle brille.' }
};

MF.chapter_show = function(worldIdx){
  if (!MF.state.meta) return;
  MF.state.meta.chaptersSeen = MF.state.meta.chaptersSeen || {};
  if (MF.state.meta.chaptersSeen[worldIdx]) return;
  var ch = MF.CHAPTERS[worldIdx];
  if (!ch) return;
  MF.state.meta.chaptersSeen[worldIdx] = true;
  MF.saveProgress();
  // Modale (réutilise intro layout)
  var screen = document.getElementById('mf-intro');
  var line = document.getElementById('mf-intro-line');
  var skip = document.getElementById('mf-intro-skip');
  var cont = document.getElementById('mf-intro-continue');
  if (!screen || !line) return;
  screen.classList.remove('mf-hidden');
  line.style.opacity = '1';
  line.innerHTML = '<div style="font-size:1.1rem;color:#ffd96a;font-weight:bold;margin-bottom:14px">' + ch.title + '</div>' + ch.text;
  cont.classList.remove('mf-hidden');
  skip.onclick = function(){ screen.classList.add('mf-hidden'); cont.classList.add('mf-hidden'); };
  cont.onclick = function(){ screen.classList.add('mf-hidden'); cont.classList.add('mf-hidden'); };
};

// =====================================================================
// === NAMED RARE ENEMIES ===
// =====================================================================
MF.RARE_NAMES = ['Crognak l\'Affamé', 'Velka Sang-Noir', 'Mor le Sans-Visage', 'Khazor le Persistant', 'Drelg l\'Insatiable', 'Yorgath le Défunt'];

MF.rare_maybeSpawnNamed = function(enemy){
  if (!enemy || enemy.isBoss) return;
  if (Math.random() > 0.025) return;            // 2.5% chance
  enemy.named = true;
  enemy.namedName = MF.RARE_NAMES[Math.floor(Math.random() * MF.RARE_NAMES.length)];
  enemy.hp *= 3;
  enemy.maxHp *= 3;
  enemy.gold *= 3;
  // Larger scale + tinted aura
  if (enemy.mesh){
    enemy.mesh.scale.multiplyScalar(1.3);
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 * enemy.scale, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xff80c0, transparent: true, opacity: 0.25, depthWrite: false })
    );
    glow.position.y = 0.6 * enemy.scale;
    enemy.mesh.add(glow);
  }
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('💎 ' + enemy.namedName + ' apparaît !', 'boss');
  if (MF.audio && MF.audio.achievement) MF.audio.achievement();
};

// =====================================================================
// === EQUIPPED TITLES ===
// =====================================================================
MF.TITLES = {
  none:       { id:'none', name:'(Aucun)', requiredAch: null },
  novice:     { id:'novice',     name:'Novice',                 requiredAch:'first_run' },
  conqueror:  { id:'conqueror',  name:'Conquérant',             requiredAch:'campaign_world1' },
  alchemist:  { id:'alchemist',  name:'Alchimiste',             requiredAch:'hybrid_first' },
  legend:     { id:'legend',     name:'Légende',                requiredAch:'combo_100' },
  butcher:    { id:'butcher',    name:'Boucher',                requiredAch:'kills_5k' },
  veteran:    { id:'veteran',    name:'Vétéran du Chaos',       requiredAch:'chaos_15min' },
  giantslayer:{ id:'giantslayer',name:'Tueur de Géants',        requiredAch:'boss_5' },
  master:     { id:'master',     name:'Maître Fusion',          requiredAch:'hybrid_all' }
};

MF.title_owned = function(id){
  if (id === 'none') return true;
  if (!MF.state.meta || !MF.state.meta.achievements) return false;
  var t = MF.TITLES[id];
  if (!t || !t.requiredAch) return false;
  return !!MF.state.meta.achievements[t.requiredAch];
};

MF.title_set = function(id){
  if (!MF.state.meta) return;
  if (!MF.title_owned(id)) return;
  MF.state.meta.equippedTitle = id;
  MF.saveProgress();
};

MF.title_get = function(){
  if (!MF.state.meta) return 'none';
  return MF.state.meta.equippedTitle || 'none';
};

// =====================================================================
// === MULTIPLE SAVE SLOTS ===
// =====================================================================
MF.SAVE_KEYS = ['mergefortress_save_v1', 'mergefortress_save_v1_slot2', 'mergefortress_save_v1_slot3'];

MF.slots_currentSlot = function(){
  return parseInt(localStorage.getItem('mergefortress_active_slot') || '0', 10);
};

MF.slots_switch = function(slot){
  // Save current state to current slot
  if (MF.saveProgress) MF.saveProgress();
  localStorage.setItem('mergefortress_active_slot', String(slot));
  MF.SAVE_KEY = MF.SAVE_KEYS[slot] || MF.SAVE_KEYS[0];
  // Reload
  MF.state.progress = {};
  MF.state.highestWorld = 0;
  MF.state.endlessBest = 0;
  MF.state.bossRushDone = false;
  MF.state.totalGold = 0;
  MF.state.totalKills = 0;
  MF.state.meta = MF._defaultMeta();
  if (MF.loadProgress) MF.loadProgress();
};

// Apply current slot at boot
(function _initSlot(){
  var slot = parseInt(localStorage.getItem('mergefortress_active_slot') || '0', 10);
  if (slot > 0 && slot < MF.SAVE_KEYS.length){
    MF.SAVE_KEY = MF.SAVE_KEYS[slot];
  }
})();

// =====================================================================
// === ADVANCED STATS (statisticien mode) ===
// =====================================================================
MF.advstats_compute = function(){
  var meta = MF.state.meta || {};
  var hist = meta.runHistory || [];
  var killStats = meta.killStats || { byUnit:{}, bossKills:{} };
  var totalKills = MF.state.totalKills || 0;
  var modes = {};
  hist.forEach(function(h){
    modes[h.mode] = modes[h.mode] || { runs:0, wins:0, totalKills:0, totalTime:0 };
    modes[h.mode].runs++;
    if (h.won) modes[h.mode].wins++;
    modes[h.mode].totalKills += h.kills || 0;
    modes[h.mode].totalTime += h.time || 0;
  });
  // Compute kills per minute per mode
  Object.keys(modes).forEach(function(m){
    modes[m].killsPerMin = modes[m].totalTime > 0 ? Math.round(modes[m].totalKills * 60 / modes[m].totalTime) : 0;
    modes[m].winRate = modes[m].runs > 0 ? Math.round(100 * modes[m].wins / modes[m].runs) : 0;
  });
  return { modes: modes, totalKills: totalKills, killStats: killStats };
};
