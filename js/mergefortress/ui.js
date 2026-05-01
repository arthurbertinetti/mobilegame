// === Merge Fortress TD — UI: HUD + screens ===
window.MF = window.MF || {};

MF.ui = {
  initialized: false
};

MF.ui.init = function(){
  if (MF.ui.initialized) return;
  MF.ui.initialized = true;
  // Apply persistent theme + accessibility settings
  if (MF.state.meta && MF.state.meta.theme && MF.theme_apply) MF.theme_apply(MF.state.meta.theme);
  if (MF.state.meta && MF.state.meta.menuBg && MF.menubg_apply) MF.menubg_apply(MF.state.meta.menuBg);
  if (MF.access_apply) MF.access_apply();

  // Top buttons
  document.getElementById('mf-back-btn').addEventListener('click', MF.ui.openPause);
  document.getElementById('mf-speed-btn').addEventListener('click', MF.ui.toggleSpeed);
  // P14: Auto-summon/merge toggle
  var autoBtn = document.getElementById('mf-auto-btn');
  if (autoBtn) autoBtn.addEventListener('click', function(){
    MF.state.autoMerge = !MF.state.autoMerge;
    autoBtn.style.background = MF.state.autoMerge ? 'rgba(60,180,60,.7)' : '';
    if (MF.notify_push) MF.notify_push(MF.state.autoMerge ? '🤖 Auto-merge ON' : '🤖 Auto-merge OFF', 'info');
  });
  var sndBtn = document.getElementById('mf-sound-btn');
  if (sndBtn){
    // Sync state with meta
    if (MF.state.meta && MF.state.meta.soundOff){ sndBtn.textContent = '🔇'; if (MF.audio) MF.audio.enabled = false; }
    sndBtn.addEventListener('click', function(){
      var on = MF.audio.toggle();
      sndBtn.textContent = on ? '🔊' : '🔇';
    });
  }

  // Bottom buttons
  document.getElementById('mf-summon-btn').addEventListener('click', function(){ MF.ui.doSummon('hero'); });
  document.getElementById('mf-summon-tower-btn').addEventListener('click', function(){ MF.ui.doSummon('tower'); });
  document.getElementById('mf-start-wave-btn').addEventListener('click', function(){
    MF.startWave();
    document.getElementById('mf-start-wave-btn').classList.remove('mf-pulse');
  });

  // Sell
  var sellBtn = document.getElementById('mf-sell-btn');
  if (sellBtn) sellBtn.addEventListener('click', MF.ui.sellSelected);

  // Bottom nav navigation
  document.querySelectorAll('[data-nav]').forEach(function(b){
    b.addEventListener('click', function(){
      var n = b.dataset.nav;
      var map = { quetes:'subDefis', heroes:'subProgression', play:'subPlay', shop:'shop', stats:'subStats' };
      if (map[n]) MF.ui.showScreen(map[n]);
      if (MF.audio && MF.audio.click) MF.audio.click();
    });
  });

  // Game modes (now inside JOUER submenu)
  document.getElementById('mf-play-btn').addEventListener('click', function(){ MF.ui.showScreen('worlds'); });
  document.getElementById('mf-endless-btn').addEventListener('click', function(){ MF.startEndless(); });
  document.getElementById('mf-bossrush-btn').addEventListener('click', function(){ MF.startBossRush(); });
  var chaosBtn = document.getElementById('mf-chaos-btn');
  if (chaosBtn) chaosBtn.addEventListener('click', function(){ MF.ui.showScreen('chaosSelect'); });
  var rogBtn = document.getElementById('mf-roguelike-btn');
  if (rogBtn) rogBtn.addEventListener('click', function(){ MF.startRoguelike && MF.startRoguelike(); });
  var raidBtn = document.getElementById('mf-raid-btn');
  if (raidBtn) raidBtn.addEventListener('click', function(){ MF.startRaid && MF.startRaid(); });
  var sboxBtn = document.getElementById('mf-sandbox-btn');
  if (sboxBtn) sboxBtn.addEventListener('click', function(){ MF.startSandbox && MF.startSandbox(); });
  var crucBtn = document.getElementById('mf-crucible-btn');
  if (crucBtn) crucBtn.addEventListener('click', function(){
    if (MF.crucible_currentChallenge){
      var ch = MF.crucible_currentChallenge();
      var done = !MF.crucible_canRun();
      if (done){
        MF.fx.showBanner('🏟 Challenge déjà complété cette semaine', 'wave');
        return;
      }
      var heroNames = ch.heroes.map(function(h){ return MF.UNITS[h] ? MF.UNITS[h].icon + ' ' + MF.UNITS[h].name : h; }).join(', ');
      var ult = MF.ULTIMATES[ch.ult] ? MF.ULTIMATES[ch.ult].icon + ' ' + MF.ULTIMATES[ch.ult].name : ch.ult;
      var v = MF.ui._chaosVariants[ch.variant] ? MF.ui._chaosVariants[ch.variant].icon + ' ' + MF.ui._chaosVariants[ch.variant].name : ch.variant;
      if (confirm('🏟 Crucible ' + ch.week + '\n\nDeck imposé : ' + heroNames + '\nUltime : ' + ult + '\nVariant : ' + v + '\n\nLancer ?')){
        MF.crucible_start();
      }
    }
  });
  // Replay close + play
  var rpClose = document.getElementById('mf-replay-close');
  if (rpClose) rpClose.addEventListener('click', function(){ document.getElementById('mf-replay-modal').classList.add('mf-hidden'); });
  var rpPlay = document.getElementById('mf-replay-play');
  if (rpPlay) rpPlay.addEventListener('click', function(){
    var meta = MF.state.meta || {};
    if (!meta.lastReplay){ MF.fx.showBanner('🎬 Aucun replay disponible', 'wave'); return; }
    MF.replay_play(document.getElementById('mf-replay-canvas'), meta.lastReplay);
  });
  // Chaos ultimate button
  var ultBtn = document.getElementById('mf-chaos-ult-btn');
  if (ultBtn) ultBtn.addEventListener('click', function(){
    if (MF.chaos_triggerUltimate) MF.chaos_triggerUltimate();
  });
  // Options screen entry (replaces direct reset button)
  var optBtn = document.getElementById('mf-options-btn');
  if (optBtn) optBtn.addEventListener('click', function(){ MF.ui.showScreen('options'); });
  // Back to RetroGameHub (index.html)
  var backHubBtn = document.getElementById('mf-back-hub-btn');
  if (backHubBtn) backHubBtn.addEventListener('click', function(){
    if (confirm('Retour à l\'accueil RetroGameHub ?')){
      try { window.location.href = 'index.html'; } catch(e){}
    }
  });
  var resetBtn = document.getElementById('mf-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', function(){
    if (confirm('Effacer toute progression ?')){
      MF.resetProgress();
      MF.ui.buildWorldGrid();
      MF.fx.showBanner('🗑 Progression réinitialisée', 'wave');
    }
  });
  var expBtn = document.getElementById('mf-export-btn');
  if (expBtn) expBtn.addEventListener('click', function(){
    var code = MF.save_export();
    if (!code){ MF.fx.showBanner('🚫 Erreur export', 'wave'); return; }
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      else {
        var ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      MF.fx.showBanner('✓ Sauvegarde copiée dans le presse-papier (' + code.length + ' chars)', 'wave');
    } catch(e){ MF.fx.showBanner('🚫 Copie impossible', 'wave'); }
  });
  var impBtn = document.getElementById('mf-import-btn');
  var impArea = document.getElementById('mf-save-area');
  var impConf = document.getElementById('mf-import-confirm');
  if (impBtn) impBtn.addEventListener('click', function(){
    if (impArea) impArea.classList.toggle('mf-hidden');
    if (impConf) impConf.classList.toggle('mf-hidden');
  });
  if (impConf) impConf.addEventListener('click', function(){
    var txt = impArea ? impArea.value : '';
    if (MF.save_import(txt)){
      MF.fx.showBanner('✓ Sauvegarde importée', 'wave');
      MF.ui.buildWorldGrid();
    } else {
      MF.fx.showBanner('🚫 Code invalide', 'wave');
    }
  });
  // P11: Audio mixer sliders
  document.querySelectorAll('[data-mix]').forEach(function(s){
    var ch = s.dataset.mix;
    var meta = MF.state.meta || {};
    meta.audioMix = meta.audioMix || { sfx: 0.7, music: 0.55, voice: 0.6 };
    s.value = Math.round((meta.audioMix[ch] || 0.5) * 100);
    s.addEventListener('input', function(){ if (MF.audio_setMix) MF.audio_setMix(ch, parseFloat(s.value) / 100); });
  });
  // P11: Haptic toggle
  document.querySelectorAll('[data-haptic-toggle]').forEach(function(b){
    var meta = MF.state.meta || {};
    meta.access = meta.access || {};
    if (meta.access.haptic === false) b.classList.remove('mf-variant-active'); else b.classList.add('mf-variant-active');
    b.addEventListener('click', function(){
      meta.access.haptic = !(meta.access.haptic !== false);
      // Toggle: if false → true, if true → false. Default = enabled.
      if (meta.access.haptic === false){ b.classList.remove('mf-variant-active'); }
      else { b.classList.add('mf-variant-active'); }
      if (MF.haptic_tap) MF.haptic_tap('medium');
      if (MF.saveProgress) MF.saveProgress();
    });
  });
  // P11: Title selector
  var titleSel = document.getElementById('mf-title-select');
  if (titleSel && MF.TITLES){
    titleSel.innerHTML = '';
    Object.keys(MF.TITLES).forEach(function(tid){
      var owned = MF.title_owned(tid);
      var opt = document.createElement('option');
      opt.value = tid;
      opt.textContent = (owned ? '' : '🔒 ') + MF.TITLES[tid].name;
      opt.disabled = !owned;
      titleSel.appendChild(opt);
    });
    titleSel.value = MF.title_get ? MF.title_get() : 'none';
    titleSel.addEventListener('change', function(){ if (MF.title_set) MF.title_set(titleSel.value); });
  }
  // P11: Slot switcher
  document.querySelectorAll('[data-slot]').forEach(function(b){
    var s = parseInt(b.dataset.slot, 10);
    if (MF.slots_currentSlot && MF.slots_currentSlot() === s) b.classList.add('mf-variant-active');
    b.addEventListener('click', function(){
      if (confirm('Changer pour le Slot ' + (s + 1) + ' ? La progression actuelle est sauvegardée.')){
        if (MF.slots_switch) MF.slots_switch(s);
        document.querySelectorAll('[data-slot]').forEach(function(x){ x.classList.remove('mf-variant-active'); });
        b.classList.add('mf-variant-active');
        MF.fx.showBanner('💾 Slot ' + (s + 1) + ' actif', 'wave');
        MF.ui.buildWorldGrid && MF.ui.buildWorldGrid();
      }
    });
  });
  // Theme buttons
  document.querySelectorAll('[data-theme]').forEach(function(b){
    b.addEventListener('click', function(){ if (MF.theme_apply) MF.theme_apply(b.dataset.theme); });
  });
  // Menu background buttons (P10)
  document.querySelectorAll('[data-menubg]').forEach(function(b){
    b.addEventListener('click', function(){ if (MF.menubg_apply) MF.menubg_apply(b.dataset.menubg); });
  });
  // Accessibility toggles
  document.querySelectorAll('[data-access]').forEach(function(b){
    b.addEventListener('click', function(){
      if (MF.access_toggle) MF.access_toggle(b.dataset.access);
      b.classList.toggle('mf-variant-active');
    });
  });
  document.querySelectorAll('[data-access-text]').forEach(function(b){
    b.addEventListener('click', function(){
      if (MF.access_textScale) MF.access_textScale(parseFloat(b.dataset.accessText) * 0.05);
    });
  });

  // Library + Deck buttons
  var libBtn = document.getElementById('mf-library-btn');
  if (libBtn) libBtn.addEventListener('click', function(){ MF.ui.showScreen('library'); });
  var deckBtn = document.getElementById('mf-deck-btn');
  if (deckBtn) deckBtn.addEventListener('click', function(){ MF.ui.showScreen('deck'); });

  // Library tabs
  document.querySelectorAll('[data-libtab]').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('[data-libtab]').forEach(function(x){ x.classList.remove('mf-active'); });
      t.classList.add('mf-active');
      MF.ui.renderLibrary(t.dataset.libtab);
    });
  });

  // Codex + Wheel buttons (in sub-defis)
  var codexBtn = document.getElementById('mf-codex-btn');
  if (codexBtn) codexBtn.addEventListener('click', function(){ MF.ui.showScreen('codex'); });
  var wheelBtn = document.getElementById('mf-wheel-btn');
  if (wheelBtn) wheelBtn.addEventListener('click', function(){ MF.ui.openWheel(); });

  // Shop tabs
  document.querySelectorAll('[data-shoptab]').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('[data-shoptab]').forEach(function(x){ x.classList.remove('mf-active'); });
      t.classList.add('mf-active');
      var tab = t.dataset.shoptab;
      var buyL = document.getElementById('mf-shop-list');
      var craftL = document.getElementById('mf-craft-list');
      if (tab === 'buy'){ buyL.classList.remove('mf-hidden'); craftL.classList.add('mf-hidden'); }
      else { buyL.classList.add('mf-hidden'); craftL.classList.remove('mf-hidden'); MF.ui.renderCraft(); }
    });
  });

  // Wheel modal close + spin
  var wheelClose = document.getElementById('mf-wheel-close');
  if (wheelClose) wheelClose.addEventListener('click', function(){ document.getElementById('mf-wheel-modal').classList.add('mf-hidden'); });
  var wheelSpin = document.getElementById('mf-wheel-spin');
  if (wheelSpin) wheelSpin.addEventListener('click', function(){
    if (!MF.wheel_canSpin()){ document.getElementById('mf-wheel-result').textContent = '🎰 Reviens demain pour ton spin !'; return; }
    wheelSpin.disabled = true;
    document.getElementById('mf-wheel-result').textContent = '...';
    MF.wheel_spin(function(seg){
      document.getElementById('mf-wheel-result').textContent = '🎉 ' + seg.label;
      wheelSpin.disabled = false;
    });
  });

  // Pause buttons
  document.getElementById('mf-resume-btn').addEventListener('click', MF.ui.resume);
  document.getElementById('mf-restart-btn').addEventListener('click', MF.ui.restart);
  document.getElementById('mf-quit-btn').addEventListener('click', MF.ui.quitToMenu);

  // End buttons
  document.getElementById('mf-end-next-btn').addEventListener('click', MF.ui.nextLevel);
  document.getElementById('mf-end-retry-btn').addEventListener('click', MF.ui.restart);
  document.getElementById('mf-end-quit-btn').addEventListener('click', MF.ui.quitToMenu);
  document.querySelectorAll('.mf-end-quick-quit').forEach(function(b){
    b.addEventListener('click', MF.ui.quitToMenu);
  });

  // Back buttons (worlds/levels/catalog)
  document.querySelectorAll('.mf-back-screen').forEach(function(btn){
    btn.addEventListener('click', function(){
      var back = btn.dataset.back;
      if (back === 'back') {
        // Smart back: if was play, go back to play; else menu
        MF.ui.showScreen(MF.ui._catalogReturnTo || 'menu');
      } else {
        MF.ui.showScreen(back);
      }
    });
  });
  // Home buttons (🏠 → play if in active run, else main menu)
  document.querySelectorAll('.mf-home-screen').forEach(function(btn){
    btn.addEventListener('click', function(){
      // If a play session is active (level loaded, not ended), return to play
      if (MF.state.level && !MF.state.outcome && MF.ui._catalogReturnTo === 'play'){
        MF.ui.showScreen('play');
        MF.ui._catalogReturnTo = null;
      } else {
        MF.ui.showScreen('menu');
      }
    });
  });

  // Catalog
  var catBtn = document.getElementById('mf-catalog-btn');
  if (catBtn) catBtn.addEventListener('click', MF.ui.openCatalog);
  document.querySelectorAll('.mf-cat-tab').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('.mf-cat-tab').forEach(function(x){ x.classList.remove('mf-active'); });
      t.classList.add('mf-active');
      MF.ui.renderCatalog(t.dataset.cattab);
    });
  });

  // Card preview modal close
  var cardClose = document.getElementById('mf-card-modal-close');
  if (cardClose) cardClose.addEventListener('click', MF.ui.closeCardPreview);
  var cardModal = document.getElementById('mf-card-modal');
  if (cardModal) cardModal.addEventListener('click', function(e){
    if (e.target === cardModal) MF.ui.closeCardPreview();
  });

  // Talents / Relics / Help buttons
  var tBtn = document.getElementById('mf-talents-btn');
  if (tBtn) tBtn.addEventListener('click', function(){ MF.ui.showScreen('talents'); });
  var rBtn = document.getElementById('mf-relics-btn');
  if (rBtn) rBtn.addEventListener('click', function(){ MF.ui.showScreen('relics'); });
  var hBtn = document.getElementById('mf-help-btn');
  if (hBtn) hBtn.addEventListener('click', function(){ MF.ui.showScreen('help'); });
  var crBtn = document.getElementById('mf-chaos-rewards-btn');
  if (crBtn) crBtn.addEventListener('click', function(){ MF.ui.showScreen('chaosRewards'); });
  var achBtn = document.getElementById('mf-ach-btn');
  if (achBtn) achBtn.addEventListener('click', function(){ MF.ui.showScreen('achievements'); });
  var dailyBtn = document.getElementById('mf-daily-btn');
  if (dailyBtn) dailyBtn.addEventListener('click', function(){ MF.ui.showScreen('daily'); });
  var shopBtn = document.getElementById('mf-shop-btn');
  if (shopBtn) shopBtn.addEventListener('click', function(){ MF.ui.showScreen('shop'); });
  var statsBtn = document.getElementById('mf-stats-btn');
  if (statsBtn) statsBtn.addEventListener('click', function(){ MF.ui.showScreen('stats'); });
  var ladBtn = document.getElementById('mf-ladder-btn');
  if (ladBtn) ladBtn.addEventListener('click', function(){ MF.ui.showScreen('ladder'); });
};

MF.ui.showScreen = function(name){
  ['mf-menu','mf-worlds','mf-levels','mf-pause','mf-end','mf-loading','mf-catalog','mf-talents','mf-relics','mf-upgrade-modal','mf-help','mf-chaos-select','mf-chaos-rewards','mf-shop','mf-sub-play','mf-sub-progression','mf-sub-defis','mf-sub-stats','mf-options','mf-library','mf-deck','mf-codex'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.classList.add('mf-hidden');
  });
  // Toggle chaos HUD: visible only during chaos play
  var chaosHud = document.getElementById('mf-chaos-hud');
  if (chaosHud){
    if (name === 'play' && MF.state.mode === 'chaos') chaosHud.classList.remove('mf-hidden');
    else chaosHud.classList.add('mf-hidden');
  }
  if (name === 'play'){
    MF.state.screen = 'play';
    // Resume game when returning to play (unless explicitly paused via pause menu)
    // Pause menu uses its own resume() — for catalog/help/etc, auto-resume.
    if (MF.state.paused && MF._prevScreen !== 'pause') MF.state.paused = false;
    if (MF.audio && MF.audio.music) MF.audio.music.setMode('play');
    if (MF.ui.refreshConsumablePanel) MF.ui.refreshConsumablePanel();
    // Hide bottom nav during play (avoid quitting by accident)
    var bnPlay = document.getElementById('mf-bottom-nav');
    if (bnPlay) bnPlay.classList.add('mf-hidden');
    return;
  }
  // Track previous screen for resume logic
  MF._prevScreen = MF.state.screen;
  // Hide consumable panel outside play
  var consPanel = document.getElementById('mf-consumable-panel');
  if (consPanel) consPanel.classList.add('mf-hidden');
  if (name === 'menu'){
    if (MF.audio && MF.audio.music) MF.audio.music.setMode('menu');
    // Currency in top banner
    var fragsEl = document.getElementById('mf-menu-frags');
    if (fragsEl) fragsEl.textContent = (MF.state.meta && MF.state.meta.fragments) || 0;
    // Hero showcase decoration
    var showcase = document.getElementById('mf-hero-showcase');
    if (showcase && MF.UNITS){
      var meta = MF.state.meta || {};
      var owned = (meta.unlockedUnits ? Object.keys(meta.unlockedUnits) : ['knight']);
      showcase.innerHTML = owned.slice(0, 5).map(function(uid){
        return '<span title="' + (MF.UNITS[uid] ? MF.UNITS[uid].name : uid) + '">' + (MF.UNITS[uid] ? MF.UNITS[uid].icon : '?') + '</span>';
      }).join('');
    }
    // Update event banner on menu
    var eb = document.getElementById('mf-event-banner');
    if (eb && MF.event_data){
      var ev = MF.event_data();
      if (ev){
        eb.classList.remove('mf-hidden');
        eb.innerHTML = '<span class="mf-event-ico">' + ev.icon + '</span> <b>' + ev.name + '</b><br><small>' + ev.desc + '</small>';
      } else {
        eb.classList.add('mf-hidden');
      }
    }
    // Trigger ladder reset check
    if (MF.ladder_checkReset) MF.ladder_checkReset();
    // P12: claim monthly season
    if (MF.season_checkClaim) MF.season_checkClaim();
    // P12: onboarding adaptatif
    if (MF.onboarding_render) setTimeout(function(){ MF.onboarding_render(); }, 100);
    // P12: reminder if absent > 3 days
    if (MF.reminder_render) setTimeout(function(){ MF.reminder_render(); }, 100);
    // P14b: daily login bonus
    if (MF.dailyLogin_render) setTimeout(function(){ MF.dailyLogin_render(); }, 200);
  }
  if (name === 'end' && MF.audio && MF.audio.music) MF.audio.music.setMode('end');
  var map = { menu:'mf-menu', worlds:'mf-worlds', levels:'mf-levels', pause:'mf-pause', end:'mf-end',
              catalog:'mf-catalog', talents:'mf-talents', relics:'mf-relics', help:'mf-help',
              chaosSelect:'mf-chaos-select', chaosRewards:'mf-chaos-rewards',
              shop:'mf-shop',
              subPlay:'mf-sub-play', subProgression:'mf-sub-progression',
              subDefis:'mf-sub-defis', subStats:'mf-sub-stats',
              options:'mf-options',
              library:'mf-library', deck:'mf-deck', codex:'mf-codex',
              // Aliases (anciennes routes pointant vers les lobbies)
              achievements:'mf-sub-defis', daily:'mf-sub-defis',
              stats:'mf-sub-stats', ladder:'mf-sub-stats' };
  var id = map[name];
  if (id){
    var el = document.getElementById(id);
    if (el) el.classList.remove('mf-hidden');
    MF.state.screen = name;
    if (name === 'worlds') MF.ui.buildWorldGrid();
    if (name === 'levels') MF.ui.buildLevelGrid();
    if (name === 'catalog') MF.ui.renderCatalog('hero');
    if (name === 'talents') MF.ui.renderTalentTree();
    if (name === 'relics')  MF.ui.renderRelicList();
    if (name === 'help')    MF.ui.renderHelp();
    if (name === 'chaosSelect') MF.ui.renderChaosUltSelect();
    if (name === 'chaosRewards') MF.ui.renderChaosRewards();
    if (name === 'achievements') MF.ui.renderAchievements();
    if (name === 'daily') MF.ui.renderDaily();
    if (name === 'shop') MF.ui.renderShop();
    if (name === 'stats') MF.ui.renderStats();
    if (name === 'ladder') MF.ui.renderLadder();
    if (name === 'subProgression') MF.ui._renderSubProgression();
    if (name === 'subDefis') MF.ui._renderSubDefis();
    if (name === 'codex') MF.ui.renderCodex();
    if (name === 'library') MF.ui.renderLibrary('hero');
    if (name === 'deck') MF.ui.renderDeck();
    if (name === 'subProgression') MF.ui.renderHeroesLobby('owned');
    if (name === 'subDefis') MF.ui.renderQuetesLobby();
    if (name === 'subStats') MF.ui.renderStats();
  }
  // Show/hide global bottom nav: visible on lobby + main menu only (NOT on end/play/pause)
  var bottomNav = document.getElementById('mf-bottom-nav');
  if (bottomNav){
    var lobbyScreens = ['menu','subPlay','subProgression','subDefis','subStats','shop'];
    if (lobbyScreens.indexOf(name) >= 0) bottomNav.classList.remove('mf-hidden');
    else bottomNav.classList.add('mf-hidden');
  }
};

MF.ui.renderHeroesLobby = function(tab){
  if (MF.deck_init) MF.deck_init();
  var meta = MF.state.meta || {};
  document.getElementById('mf-prog-frags').textContent = meta.fragments || 0;
  var deck = meta.activeDeck || { heroes:[], towers:[], playstyle:'mix' };
  // Hide playstyle UI (no longer relevant)
  // Update summary: show only hero count
  var hSum = document.getElementById('mf-deck-h-summary'); if (hSum) hSum.textContent = deck.heroes.length + '/' + MF.DECK_MAX_HEROES;
  var tSum = document.getElementById('mf-deck-t-summary'); if (tSum) tSum.parentElement.style.display = 'none';
  // P12: render mercenaries section before content
  setTimeout(function(){
    var ct = document.getElementById('mf-heroes-content');
    if (!ct) return;
    var mercSec = document.createElement('div');
    mercSec.className = 'mf-stats-section';
    mercSec.innerHTML = '<div class="mf-stats-section-title">⚔ Mercenaires (R3 ×2 dmg, 1 utilisation)</div>';
    var pending = meta.pendingMerc;
    if (pending){
      var pm = MF.MERCENARIES.find(function(m){ return m.id === pending; });
      if (pm){
        mercSec.innerHTML += '<div class="mf-shop-card mf-merc-pending">' +
          '<div class="mf-shop-ico">' + pm.icon + '</div>' +
          '<div class="mf-shop-info"><div class="mf-shop-name">✓ ' + pm.name + '</div><div class="mf-shop-desc">Prêt pour ta prochaine run</div></div>' +
          '</div>';
      }
    }
    var grid = document.createElement('div');
    grid.className = 'mf-heroes-grid';
    (MF.MERCENARIES || []).forEach(function(m){
      var canBuy = !pending && (meta.fragments || 0) >= m.cost;
      var locked = MF.UNITS[m.unitId] && !MF.deck_isUnlocked(m.unitId);
      var u = MF.UNITS[m.unitId];
      var rdata = u && u.ranks && u.ranks[0];
      var bgCol = rdata ? '#' + (rdata.color || 0xffd96a).toString(16).padStart(6,'0') : '#666';
      var card = document.createElement('div');
      card.className = 'mf-hero-tile' + (canBuy ? '' : ' mf-hero-locked');
      card.innerHTML =
        '<div class="mf-hero-img" style="background:radial-gradient(circle,' + bgCol + '40,transparent 70%)">' + m.icon + '</div>' +
        '<div class="mf-hero-name">' + m.name + '</div>' +
        '<div class="mf-hero-cost">💎 ' + m.cost + (locked ? ' 🔒' : '') + '</div>';
      card.title = m.desc;
      card.addEventListener('click', function(){
        if (locked){ if (MF.notify_push) MF.notify_push('🔒 Débloque ' + (u ? u.name : m.unitId) + ' d\'abord', 'info'); return; }
        if (canBuy){
          if (MF.merc_buy(m.id)) MF.ui.renderHeroesLobby(tab);
        }
      });
      grid.appendChild(card);
    });
    mercSec.appendChild(grid);
    ct.appendChild(mercSec);
  }, 0);
  document.getElementById('mf-deck-h-summary').textContent = deck.heroes.length + '/' + MF.DECK_MAX_HEROES;
  document.getElementById('mf-deck-t-summary').textContent = deck.towers.length + '/' + MF.DECK_MAX_TOWERS;
  // Tabs
  document.querySelectorAll('[data-htab]').forEach(function(t){
    t.classList.toggle('mf-active', t.dataset.htab === tab);
  });
  var ct = document.getElementById('mf-heroes-content');
  ct.innerHTML = '';
  // P13: playstyle removed (no more towers vs heroes)
  // P13: ONE unified grid (no role split) — sorted internally by role
  var roleOrder = ['striker','shooter','mage','support','specialist','_other'];
  var allowed;
  if (tab === 'deck'){
    // Show only heroes currently in active deck
    allowed = (deck.heroes || []).slice();
  } else if (tab === 'owned'){
    allowed = MF.deck_owned('hero');
  } else {
    allowed = MF.deck_all('hero').filter(function(uid){ return !MF.deck_isUnlocked(uid); });
  }
  allowed.sort(function(a, b){
    var ra = (MF.UNITS[a] && MF.UNITS[a].role) || '_other';
    var rb = (MF.UNITS[b] && MF.UNITS[b].role) || '_other';
    return roleOrder.indexOf(ra) - roleOrder.indexOf(rb);
  });
  var sec = document.createElement('div');
  sec.className = 'mf-stats-section';
  var secTitle = tab === 'deck' ? '🃏 Mon Deck' : (tab === 'owned' ? '🛡 Mes Héros' : '🔒 À Débloquer');
  sec.innerHTML = '<div class="mf-stats-section-title">' + secTitle + ' (' + allowed.length + '/' + (tab === 'deck' ? MF.DECK_MAX_HEROES : allowed.length) + ')</div>';
  var grid = document.createElement('div');
  grid.className = 'mf-heroes-grid';
  if (!allowed.length){
    grid.innerHTML = '<div class="mf-hybrid-hint" style="padding:14px">Aucun ' + (tab === 'owned' ? 'possédé' : 'à débloquer') + '.</div>';
  }
  allowed.forEach(function(uid){
    var u = MF.UNITS[uid]; if (!u) return;
    var rdata = u.ranks && u.ranks[0];
    var inDeck = deck.heroes.indexOf(uid) >= 0;
    var locked = !MF.deck_isUnlocked(uid);
    var role = u.role && MF.UNIT_ROLES[u.role] ? MF.UNIT_ROLES[u.role] : null;
    var card = document.createElement('div');
    card.className = 'mf-hero-tile' + (inDeck ? ' mf-hero-active' : '') + (locked ? ' mf-hero-locked' : '');
    card.dataset.uid = uid;
    var bgCol = rdata ? '#' + (rdata.color || 0xffd96a).toString(16).padStart(6,'0') : '#666';
    card.innerHTML =
      '<div class="mf-hero-img" style="background:radial-gradient(circle,' + bgCol + '40,transparent 70%)">' + u.icon + '</div>' +
      '<div class="mf-hero-name">' + u.name + '</div>' +
      (role ? '<div class="mf-hero-role" style="color:' + role.color + '">' + role.icon + '</div>' : '') +
      (inDeck ? '<div class="mf-hero-tag">✓ Deck</div>' : (locked ? '<div class="mf-hero-cost">💎 ' + (MF.deck_unlockCost(uid) || '?') + '</div>' : ''));
    card.addEventListener('click', function(){
      MF.ui.openHeroDetail(uid, tab);
    });
    grid.appendChild(card);
  });
  sec.appendChild(grid);
  ct.appendChild(sec);
  // Wire tab buttons
  document.querySelectorAll('[data-htab]').forEach(function(t){
    t.onclick = function(){ MF.ui.renderHeroesLobby(t.dataset.htab); };
  });
};

// === P13: Hero detail modal (stats + skill + skin + add to deck) ===
MF.ui.openHeroDetail = function(uid, tab){
  var u = MF.UNITS[uid]; if (!u) return;
  var meta = MF.state.meta || {};
  meta.activeDeck = meta.activeDeck || { heroes:[] };
  meta.equippedSkins = meta.equippedSkins || {};
  meta.unlockedSkins = meta.unlockedSkins || {};
  meta.unlockedSkins[uid] = meta.unlockedSkins[uid] || ['default'];
  var equippedSkin = meta.equippedSkins[uid] || 'default';
  var locked = !MF.deck_isUnlocked(uid);
  var inDeck = meta.activeDeck.heroes.indexOf(uid) >= 0;
  var rdata = u.ranks && u.ranks[0];
  var bgCol = rdata ? '#' + (rdata.color || 0xffd96a).toString(16).padStart(6,'0') : '#666';
  var role = u.role && MF.UNIT_ROLES[u.role] ? MF.UNIT_ROLES[u.role] : null;
  var skin = MF.SKINS && MF.SKINS[equippedSkin] ? MF.SKINS[equippedSkin] : null;
  // Build modal
  var existing = document.getElementById('mf-hero-detail');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'mf-hero-detail';
  modal.className = 'mf-hero-detail-overlay';
  var html = '<div class="mf-hero-detail-card">';
  html += '<button class="mf-hero-detail-close">×</button>';
  html += '<div class="mf-hero-detail-header">';
  html += '<div class="mf-hero-detail-img" style="background:radial-gradient(circle,' + bgCol + '60,transparent 70%)">' + u.icon + '</div>';
  html += '<div class="mf-hero-detail-title">';
  html += '<div class="mf-hero-detail-name">' + u.name + '</div>';
  if (role) html += '<div class="mf-hero-detail-role" style="color:' + role.color + '">' + role.icon + ' ' + role.name + '</div>';
  html += '</div></div>';
  html += '<div class="mf-hero-detail-desc">' + (u.desc || '') + '</div>';
  // Stats grid
  html += '<div class="mf-stats-grid mf-hero-detail-stats">';
  html += '<div class="mf-stats-cell"><span>⚔ Dégâts</span><b>' + (rdata ? rdata.dmg : '?') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🎯 Portée</span><b>' + (u.attack ? u.attack.range.toFixed(1) : '?') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>⏱ Cadence</span><b>' + (u.attack ? u.attack.atkSpeed.toFixed(2) + '/s' : '?') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>📐 Type</span><b>' + (u.attack ? (u.attack.type === 'splash' ? 'Zone' : u.attack.type === 'pierce' ? 'Perçant' : u.attack.type === 'chain' ? 'Chaîne' : 'Mono') : '?') + '</b></div>';
  html += '</div>';
  // Mastery info
  if (meta.mastery && meta.mastery[uid]){
    var m = meta.mastery[uid];
    html += '<div class="mf-hero-detail-mastery">🎓 Maîtrise Lv ' + m.lvl + ' (+' + m.lvl + '% dmg permanent)</div>';
  }
  // P14: Comparateur — afficher comparison avec un autre héros possédé
  if (!locked){
    var ownedH = MF.deck_owned ? MF.deck_owned('hero') : [];
    if (ownedH.length > 1){
      html += '<div class="mf-hero-detail-section">';
      html += '<div class="mf-hero-detail-label">📊 Comparer avec :</div>';
      html += '<select id="mf-compare-select" style="width:100%;padding:6px;border-radius:6px;background:rgba(15,5,30,.7);color:#fff;border:1px solid rgba(170,140,235,.3);font-family:inherit">';
      html += '<option value="">— Sélectionne un héros —</option>';
      ownedH.forEach(function(other){
        if (other === uid) return;
        var ou = MF.UNITS[other];
        if (ou) html += '<option value="' + other + '">' + ou.icon + ' ' + ou.name + '</option>';
      });
      html += '</select>';
      html += '<div id="mf-compare-result"></div>';
      html += '</div>';
    }
  }
  // P14: Hybrides possibles avec ce héros
  if (MF.HYBRIDS){
    var possibleHybrids = [];
    Object.keys(MF.HYBRIDS).forEach(function(hid){
      var h = MF.HYBRIDS[hid];
      if (h.recipe && h.recipe.indexOf(uid) >= 0){
        var partner = h.recipe[0] === uid ? h.recipe[1] : h.recipe[0];
        var found = (meta.foundHybrids && meta.foundHybrids[hid]);
        possibleHybrids.push({ name: h.name, icon: h.icon, partner: partner, found: !!found });
      }
    });
    if (possibleHybrids.length){
      html += '<div class="mf-hero-detail-section">';
      html += '<div class="mf-hero-detail-label">🌟 Recettes hybrides (R5 + R5)</div>';
      possibleHybrids.forEach(function(h){
        var pname = MF.UNITS[h.partner] ? MF.UNITS[h.partner].name : h.partner;
        var picon = MF.UNITS[h.partner] ? MF.UNITS[h.partner].icon : '?';
        var partnerOwned = MF.deck_isUnlocked && MF.deck_isUnlocked(h.partner);
        var resultName = h.found ? h.name : '???';
        html += '<div class="mf-hero-hybrid-row">';
        html += '<span class="mf-hyb-formula">' + u.icon + ' + ' + picon + (partnerOwned ? '' : ' 🔒') + '</span>';
        html += '<span class="mf-hyb-arrow">→</span>';
        html += '<span class="mf-hyb-result">' + h.icon + ' <b>' + resultName + '</b>' + (h.found ? ' ✓' : '') + '</span>';
        html += '<div class="mf-hyb-partner-name">avec ' + picon + ' ' + pname + (partnerOwned ? '' : ' (à débloquer)') + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
  }
  // Current skin
  html += '<div class="mf-hero-detail-section">';
  html += '<div class="mf-hero-detail-label">🎨 Skin équipé</div>';
  if (skin){
    html += '<div class="mf-hero-skin-current">' + skin.icon + ' <b>' + skin.name + '</b>';
    if (skin.statDesc) html += ' <span class="mf-skin-effect">— ' + skin.statDesc + '</span>';
    html += '</div>';
  }
  html += '</div>';
  // Action buttons
  html += '<div class="mf-hero-detail-actions">';
  if (locked){
    var cost = MF.deck_unlockCost(uid) || 0;
    var canBuy = (meta.fragments || 0) >= cost;
    html += '<button class="mf-btn mf-btn-primary mf-hero-detail-unlock"' + (canBuy ? '' : ' disabled') + '>🔓 Débloquer (💎 ' + cost + ')</button>';
  } else {
    html += '<button class="mf-btn mf-hero-detail-skin">🎨 Skins</button>';
    // Auto-equip best skin (if user has unlocked something better than current)
    var owned = (meta.unlockedSkins[uid] || []).filter(function(sid){ return sid !== 'default' && sid !== equippedSkin; });
    if (owned.length){
      html += '<button class="mf-btn mf-hero-detail-auto-skin">✨ Auto-skin</button>';
    }
    if (inDeck){
      html += '<button class="mf-btn mf-hero-detail-deck mf-deck-remove">🗑 Retirer du deck</button>';
    } else {
      html += '<button class="mf-btn mf-btn-primary mf-hero-detail-deck mf-deck-add">➕ Ajouter au deck</button>';
    }
  }
  html += '</div>';
  html += '</div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  // Wire buttons
  modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
  modal.querySelector('.mf-hero-detail-close').addEventListener('click', function(){ modal.remove(); });
  var unlockBtn = modal.querySelector('.mf-hero-detail-unlock');
  if (unlockBtn){
    unlockBtn.addEventListener('click', function(){
      if (MF.deck_unlock(uid)){
        modal.remove();
        MF.ui.renderHeroesLobby(tab || 'owned');
      }
    });
  }
  var skinBtn = modal.querySelector('.mf-hero-detail-skin');
  if (skinBtn){
    skinBtn.addEventListener('click', function(){ MF.ui.openSkinPicker(uid, tab); modal.remove(); });
  }
  var deckBtn = modal.querySelector('.mf-hero-detail-deck');
  if (deckBtn){
    deckBtn.addEventListener('click', function(){
      MF.deck_toggle(uid, 'hero');
      modal.remove();
      MF.ui.renderHeroesLobby(tab || 'owned');
    });
  }
  // P14: Compare hero
  var cmpSel = modal.querySelector('#mf-compare-select');
  var cmpRes = modal.querySelector('#mf-compare-result');
  if (cmpSel && cmpRes){
    cmpSel.addEventListener('change', function(){
      var ouid = cmpSel.value;
      if (!ouid){ cmpRes.innerHTML = ''; return; }
      var ou = MF.UNITS[ouid];
      var ord = ou.ranks && ou.ranks[0];
      // P14: numeric diff (was comparing strings)
      function diff(a, b, label, decimals){
        var na = parseFloat(a), nb = parseFloat(b);
        var fa = na.toFixed(decimals||0), fb = nb.toFixed(decimals||0);
        if (Math.abs(na - nb) < 0.001) return label + ': ' + fa + ' = ' + fb;
        var d = na - nb;
        var sign = d > 0 ? '+' : '';
        var color = d > 0 ? '#90ff90' : '#ff8a8a';
        return label + ': <b style="color:' + color + '">' + fa + ' (' + sign + d.toFixed(decimals||0) + ')</b> vs ' + fb;
      }
      cmpRes.innerHTML = '<div style="font-size:.78rem;color:rgba(220,200,255,.9);line-height:1.5;margin-top:6px;padding:8px;background:rgba(15,5,30,.5);border-radius:6px">' +
        '<div><b>' + u.icon + ' ' + u.name + '</b> vs <b>' + ou.icon + ' ' + ou.name + '</b></div>' +
        '<div>' + diff(rdata.dmg, ord.dmg, '⚔ Dmg', 0) + '</div>' +
        '<div>' + diff(u.attack.range, ou.attack.range, '🎯 Range', 1) + '</div>' +
        '<div>' + diff(u.attack.atkSpeed, ou.attack.atkSpeed, '⏱ Atk/s', 2) + '</div>' +
        '<div>📐 Type: ' + (u.attack.type === 'splash' ? 'Zone' : u.attack.type === 'pierce' ? 'Perce' : u.attack.type === 'chain' ? 'Chaîne' : 'Mono') +
                  ' vs ' + (ou.attack.type === 'splash' ? 'Zone' : ou.attack.type === 'pierce' ? 'Perce' : ou.attack.type === 'chain' ? 'Chaîne' : 'Mono') + '</div>' +
        '</div>';
    });
  }
  var autoBtn = modal.querySelector('.mf-hero-detail-auto-skin');
  if (autoBtn){
    autoBtn.addEventListener('click', function(){
      // Pick best legendary > rainbow > regular by cost
      var ownedList = meta.unlockedSkins[uid] || [];
      var rank = ['void','cosmic','rainbow','royal','arcane','infernal','ethereal','neon','shadow','blood','gold','default'];
      var best = 'default';
      for (var i = 0; i < rank.length; i++){
        if (ownedList.indexOf(rank[i]) >= 0){ best = rank[i]; break; }
      }
      meta.equippedSkins[uid] = best;
      MF.saveProgress();
      modal.remove();
      MF.ui.openHeroDetail(uid, tab);
      if (MF.notify_push) MF.notify_push('🎨 Skin équipé : ' + (MF.SKINS[best] ? MF.SKINS[best].name : best), 'success');
    });
  }
};

// === P13: Skin picker modal ===
MF.ui.openSkinPicker = function(uid, tab){
  var u = MF.UNITS[uid]; if (!u) return;
  var meta = MF.state.meta || {};
  meta.equippedSkins = meta.equippedSkins || {};
  meta.unlockedSkins = meta.unlockedSkins || {};
  meta.unlockedSkins[uid] = meta.unlockedSkins[uid] || ['default'];
  var existing = document.getElementById('mf-skin-picker');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'mf-skin-picker';
  modal.className = 'mf-hero-detail-overlay';
  var html = '<div class="mf-hero-detail-card mf-skin-picker-card">';
  html += '<button class="mf-skin-picker-close">×</button>';
  html += '<div class="mf-hero-detail-name">🎨 Skins — ' + u.icon + ' ' + u.name + '</div>';
  html += '<div class="mf-skin-picker-frags">💎 ' + (meta.fragments || 0) + ' fragments</div>';
  html += '<div class="mf-skin-picker-list">';
  var equipped = meta.equippedSkins[uid] || 'default';
  Object.keys(MF.SKINS).forEach(function(sid){
    var s = MF.SKINS[sid];
    var owned = meta.unlockedSkins[uid].indexOf(sid) >= 0 || sid === 'default';
    var isEquipped = equipped === sid;
    var canBuy = !owned && (meta.fragments || 0) >= s.cost;
    var rowClass = 'mf-skin-row' + (isEquipped ? ' mf-skin-row-equipped' : '') + (owned ? '' : ' mf-skin-row-locked');
    html += '<div class="' + rowClass + '" data-skin="' + sid + '">';
    html += '<div class="mf-skin-row-icon">' + s.icon + '</div>';
    html += '<div class="mf-skin-row-info">';
    html += '<div class="mf-skin-row-name">' + s.name + (s.legendary ? ' <small class="mf-skin-legendary">★ légendaire</small>' : '') + '</div>';
    html += '<div class="mf-skin-row-effect">' + (s.statDesc || '—') + '</div>';
    html += '</div>';
    html += '<div class="mf-skin-row-action">';
    if (isEquipped){
      html += '<span class="mf-skin-tag-active">✓ Équipé</span>';
    } else if (owned){
      html += '<button class="mf-btn mf-skin-equip" data-equip="' + sid + '">Équiper</button>';
    } else {
      html += '<button class="mf-btn mf-skin-buy" data-buy="' + sid + '"' + (canBuy ? '' : ' disabled') + '>💎 ' + s.cost + '</button>';
    }
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
  modal.querySelector('.mf-skin-picker-close').addEventListener('click', function(){ modal.remove(); MF.ui.openHeroDetail(uid, tab); });
  modal.querySelectorAll('[data-equip]').forEach(function(b){
    b.addEventListener('click', function(){
      meta.equippedSkins[uid] = b.dataset.equip;
      MF.saveProgress();
      MF.ui.openSkinPicker(uid, tab);
      if (MF.audio && MF.audio.click) MF.audio.click();
    });
  });
  modal.querySelectorAll('[data-buy]').forEach(function(b){
    b.addEventListener('click', function(){
      var sid = b.dataset.buy;
      var s = MF.SKINS[sid];
      if (!s || (meta.fragments || 0) < s.cost) return;
      meta.fragments -= s.cost;
      meta.unlockedSkins[uid].push(sid);
      meta.equippedSkins[uid] = sid;
      MF.saveProgress();
      MF.ui.openSkinPicker(uid, tab);
      if (MF.audio && MF.audio.coin) MF.audio.coin();
    });
  });
};

MF.ui.renderQuetesLobby = function(){
  var meta = MF.state.meta || {};
  // Event banner
  var eb = document.getElementById('mf-defis-event-banner');
  if (eb && MF.event_data){
    var ev = MF.event_data();
    if (ev){ eb.classList.remove('mf-hidden'); eb.innerHTML = '<span class="mf-event-ico">' + ev.icon + '</span> <b>' + ev.name + '</b><br><small>' + ev.desc + '</small>'; }
    else eb.classList.add('mf-hidden');
  }
  if (MF.daily_init) MF.daily_init();
  if (MF.quests_init) MF.quests_init();
  if (MF.ach_check) MF.ach_check();
  var ct = document.getElementById('mf-quetes-content');
  ct.innerHTML = '';
  // Roue + codex shortcuts
  var quickRow = document.createElement('div');
  quickRow.className = 'mf-quick-links';
  quickRow.innerHTML =
    '<button class="mf-quick-icon" data-open="wheel">🎰<small>Roue jour</small></button>' +
    '<button class="mf-quick-icon" data-open="codex">📖<small>Codex</small></button>';
  ct.appendChild(quickRow);
  quickRow.querySelector('[data-open="wheel"]').addEventListener('click', function(){ MF.ui.openWheel && MF.ui.openWheel(); });
  quickRow.querySelector('[data-open="codex"]').addEventListener('click', function(){ MF.ui.showScreen('codex'); });
  // Daily target
  if (MF.daily_target){
    var t = MF.daily_target();
    if (t){
      meta.dailyTargets = meta.dailyTargets || {};
      var key = MF.daily_today();
      meta.dailyTargets[key] = meta.dailyTargets[key] || {};
      var rec = meta.dailyTargets[key][t.id] || { progress: 0, completed: false };
      var pct = Math.min(100, Math.round((rec.progress / t.target) * 100));
      var tSec = document.createElement('div');
      tSec.className = 'mf-stats-section';
      tSec.innerHTML = '<div class="mf-stats-section-title">🎯 Objectif du jour</div>' +
        '<div class="mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '') + '">' +
          '<div class="mf-ach-ico">🎯</div>' +
          '<div class="mf-ach-info">' +
            '<div class="mf-ach-name">' + t.desc + '</div>' +
            '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + t.target + ' · +' + t.reward + ' 💎</div>' +
          '</div>' +
        '</div>';
      ct.appendChild(tSec);
    }
  }
  // Daily challenges (3)
  var dKey = MF.daily_today();
  var record = (meta.dailyChallenges && meta.dailyChallenges[dKey]) || {};
  var dSec = document.createElement('div');
  dSec.className = 'mf-stats-section';
  dSec.innerHTML = '<div class="mf-stats-section-title">📅 Défis du jour (' + dKey.slice(6,8) + '/' + dKey.slice(4,6) + ')</div>';
  (MF.daily_today_challenges()).forEach(function(c){
    var rec = record[c.id] || { progress: 0, completed: false };
    var pct = Math.min(100, Math.round((rec.progress / c.target) * 100));
    var card = document.createElement('div');
    card.className = 'mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '');
    card.innerHTML =
      '<div class="mf-ach-ico">' + c.icon + '</div>' +
      '<div class="mf-ach-info">' +
        '<div class="mf-ach-name">' + c.name + '</div>' +
        '<div class="mf-ach-desc">' + c.desc + '</div>' +
        '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + c.target + ' · +' + c.reward + ' 💎</div>' +
      '</div>';
    dSec.appendChild(card);
  });
  ct.appendChild(dSec);
  // 7-day quests
  if (MF.LONG_QUESTS){
    var lqSec = document.createElement('div');
    lqSec.className = 'mf-stats-section';
    var windowDays = meta.questWindowStart ? Math.max(0, 7 - Math.floor((Date.now() - meta.questWindowStart) / (24 * 3600 * 1000))) : 7;
    lqSec.innerHTML = '<div class="mf-stats-section-title">🏅 Quêtes 7 jours (reset ' + windowDays + 'j)</div>';
    MF.LONG_QUESTS.forEach(function(q){
      var rec = (meta.longQuests && meta.longQuests[q.id]) || { progress: 0, completed: false };
      var pct = Math.min(100, Math.round((rec.progress / q.target) * 100));
      var card = document.createElement('div');
      card.className = 'mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '');
      card.innerHTML = '<div class="mf-ach-ico">' + q.icon + '</div>' +
        '<div class="mf-ach-info"><div class="mf-ach-name">' + q.name + '</div><div class="mf-ach-desc">' + q.desc + '</div>' +
        '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + q.target + ' · +' + q.reward + ' 💎</div></div>';
      lqSec.appendChild(card);
    });
    ct.appendChild(lqSec);
  }
  // Trophées
  if (MF.ACHIEVEMENTS){
    var prog = MF.ach_progress();
    var aSec = document.createElement('div');
    aSec.className = 'mf-stats-section';
    aSec.innerHTML = '<div class="mf-stats-section-title">🏆 Trophées (' + prog.unlocked + '/' + prog.total + ')</div>';
    Object.keys(MF.ACHIEVEMENTS).forEach(function(aid){
      var a = MF.ACHIEVEMENTS[aid];
      var unlocked = !!(meta.achievements && meta.achievements[aid]);
      var card = document.createElement('div');
      card.className = 'mf-ach-card' + (unlocked ? ' mf-ach-unlocked' : ' mf-ach-locked');
      // P14: live progress
      var progressLine = '';
      if (!unlocked && MF.ach_getProgress){
        var p = MF.ach_getProgress(aid);
        if (p && p.target > 0){
          var pct = Math.min(100, Math.round((p.current / p.target) * 100));
          progressLine = '<div class="mf-daily-bar" style="margin-top:4px"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div><div class="mf-ach-reward">' + p.current + ' / ' + p.target + ' · +' + (a.fragments||0) + ' 💎</div>';
        }
      }
      if (!progressLine){
        progressLine = '<div class="mf-ach-reward">' + (unlocked ? '✓ +' + (a.fragments||0) + ' 💎' : '+' + (a.fragments||0) + ' 💎') + '</div>';
      }
      card.innerHTML = '<div class="mf-ach-ico">' + (unlocked ? a.icon : '🔒') + '</div>' +
        '<div class="mf-ach-info"><div class="mf-ach-name">' + a.name + '</div><div class="mf-ach-desc">' + a.desc + '</div>' + progressLine + '</div>';
      aSec.appendChild(card);
    });
    ct.appendChild(aSec);
  }
};

MF.ui.renderLibrary = function(kind){
  if (MF.deck_init) MF.deck_init();
  var meta = MF.state.meta || {};
  document.getElementById('mf-lib-frags').textContent = meta.fragments || 0;
  document.getElementById('mf-lib-owned').textContent = meta.unlockedUnits ? Object.keys(meta.unlockedUnits).length : 0;
  var list = document.getElementById('mf-lib-list');
  list.innerHTML = '';
  var ids = MF.deck_all(kind);
  ids.forEach(function(uid){
    var u = MF.UNITS[uid];
    var unlocked = MF.deck_isUnlocked(uid);
    var cost = MF.deck_unlockCost(uid);
    var card = document.createElement('div');
    card.className = 'mf-shop-card' + (unlocked ? '' : ' mf-shop-locked');
    var rdata = u.ranks && u.ranks[0];
    card.innerHTML =
      '<div class="mf-shop-ico" style="background:' + (rdata ? '#' + (rdata.color || 0xffd96a).toString(16).padStart(6,'0') + '40' : 'rgba(15,5,30,.65)') + '">' + (u.icon || '?') + '</div>' +
      '<div class="mf-shop-info">' +
        '<div class="mf-shop-name">' + u.name + (unlocked ? ' ✓' : '') + '</div>' +
        '<div class="mf-shop-desc">' + (u.desc || '') + '</div>' +
      '</div>' +
      '<div class="mf-shop-action">' +
        (unlocked
          ? '<button class="mf-shop-buy" style="background:#27ae60" disabled>Possédé</button>'
          : (cost != null
              ? '<button class="mf-shop-buy" data-buy="' + uid + '"' + ((meta.fragments || 0) >= cost ? '' : ' disabled') + '>💎 ' + cost + '</button>'
              : '<button class="mf-shop-buy" disabled>—</button>')) +
      '</div>';
    list.appendChild(card);
  });
  list.querySelectorAll('[data-buy]').forEach(function(b){
    b.addEventListener('click', function(){
      if (MF.deck_unlock(b.dataset.buy)) MF.ui.renderLibrary(kind);
    });
  });
};

MF.ui.renderDeck = function(){
  if (MF.deck_init) MF.deck_init();
  var meta = MF.state.meta || {};
  var deck = meta.activeDeck || { heroes:[], towers:[], playstyle:'mix' };
  document.getElementById('mf-deck-h-count').textContent = deck.heroes.length + '/' + MF.DECK_MAX_HEROES;
  document.getElementById('mf-deck-t-count').textContent = deck.towers.length + '/' + MF.DECK_MAX_TOWERS;
  var list = document.getElementById('mf-deck-list');
  list.innerHTML = '';
  // Playstyle selector at top
  var psSec = document.createElement('div');
  psSec.className = 'mf-stats-section';
  var ps = deck.playstyle || 'mix';
  psSec.innerHTML = '<div class="mf-stats-section-title">⚙ Style de jeu</div>' +
    '<div class="mf-variant-row">' +
      '<button class="mf-variant-pill' + (ps === 'mix' ? ' mf-variant-active' : '') + '" data-playstyle="mix">⚔🏹 Mixte</button>' +
      '<button class="mf-variant-pill' + (ps === 'heroes' ? ' mf-variant-active' : '') + '" data-playstyle="heroes">🛡 Héros uniquement</button>' +
      '<button class="mf-variant-pill' + (ps === 'towers' ? ' mf-variant-active' : '') + '" data-playstyle="towers">🏹 Tours uniquement</button>' +
    '</div>' +
    '<div class="mf-hybrid-hint">Choisis quel type d\'unité tu veux invoquer pendant le run.</div>';
  list.appendChild(psSec);
  psSec.querySelectorAll('[data-playstyle]').forEach(function(b){
    b.addEventListener('click', function(){
      MF.deck_setPlaystyle(b.dataset.playstyle);
      MF.ui.renderDeck();
    });
  });
  ['hero', 'tower'].forEach(function(kind){
    var owned = MF.deck_owned(kind);
    if (!owned.length) return;
    var sec = document.createElement('div');
    sec.className = 'mf-stats-section';
    sec.innerHTML = '<div class="mf-stats-section-title">' + (kind === 'hero' ? '🛡 Héros (' + deck.heroes.length + '/' + MF.DECK_MAX_HEROES + ')' : '🏹 Tours (' + deck.towers.length + '/' + MF.DECK_MAX_TOWERS + ')') + '</div>';
    var row = document.createElement('div');
    row.className = 'mf-deck-row';
    owned.forEach(function(uid){
      var u = MF.UNITS[uid];
      var inDeck = (kind === 'hero' ? deck.heroes : deck.towers).indexOf(uid) >= 0;
      var pill = document.createElement('button');
      pill.className = 'mf-deck-pill' + (inDeck ? ' mf-deck-active' : '');
      pill.innerHTML = '<span class="mf-deck-icon">' + (u.icon || '?') + '</span><span class="mf-deck-name">' + u.name + '</span>' + (inDeck ? '<span class="mf-deck-check">✓</span>' : '');
      pill.addEventListener('click', function(){
        MF.deck_toggle(uid, kind);
        MF.ui.renderDeck();
      });
      row.appendChild(pill);
    });
    sec.appendChild(row);
    list.appendChild(sec);
  });
};

MF.ui.renderCodex = function(){
  var ct = document.getElementById('mf-codex-content');
  if (!ct || !MF.CODEX) return;
  var html = '';
  // Heroes
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🛡 Héros</div>';
  Object.keys(MF.CODEX).forEach(function(id){
    if (MF.CODEX[id].type !== 'hero') return;
    var c = MF.CODEX[id];
    var unlocked = MF.codex_isUnlocked(id);
    html += '<div class="mf-codex-entry' + (unlocked ? '' : ' mf-codex-locked') + '">';
    html += '<div class="mf-codex-icon">' + c.icon + '</div>';
    html += '<div class="mf-codex-body">';
    html += '<div class="mf-codex-name">' + (unlocked ? c.title : '???') + '</div>';
    html += '<div class="mf-codex-lore">' + (unlocked ? c.lore : '🔒 Élimine ' + c.unlock.count + ' ennemis avec ce héros pour débloquer.') + '</div>';
    html += '</div></div>';
  });
  html += '</div>';
  // Bosses
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">👑 Boss</div>';
  Object.keys(MF.CODEX).forEach(function(id){
    if (MF.CODEX[id].type !== 'boss') return;
    var c = MF.CODEX[id];
    var unlocked = MF.codex_isUnlocked(id);
    html += '<div class="mf-codex-entry' + (unlocked ? '' : ' mf-codex-locked') + '">';
    html += '<div class="mf-codex-icon">' + c.icon + '</div>';
    html += '<div class="mf-codex-body">';
    html += '<div class="mf-codex-name">' + (unlocked ? c.title : '???') + '</div>';
    html += '<div class="mf-codex-lore">' + (unlocked ? c.lore : '🔒 Élimine ce boss au moins ' + c.unlock.count + ' fois.') + '</div>';
    html += '</div></div>';
  });
  html += '</div>';
  ct.innerHTML = html;
};

MF.ui.renderCraft = function(){
  var ct = document.getElementById('mf-craft-list');
  if (!ct) return;
  var meta = MF.state.meta || {};
  meta.consumables = meta.consumables || {};
  var html = '<p class="mf-chaos-intro">Combine des consommables pour obtenir des récompenses meilleures.</p>';
  (MF.CRAFT_RECIPES || []).forEach(function(r){
    var can = MF.craft_canDo(r);
    var inputStr = Object.keys(r.input).map(function(k){
      var have = meta.consumables[k] || 0;
      var need = r.input[k];
      var name = MF.SHOP_ITEMS && MF.SHOP_ITEMS[k] ? MF.SHOP_ITEMS[k].icon + ' ' + MF.SHOP_ITEMS[k].name : k;
      return need + '× ' + name + ' (<b style="color:' + (have >= need ? '#90ff90' : '#ff8a8a') + '">' + have + '</b>)';
    }).join(' + ');
    var outputStr = Object.keys(r.output).map(function(k){
      if (k === 'fragments') return r.output[k] + ' 💎';
      if (k === 'random_legendary') return '🌟 1 skin légendaire random';
      var name = MF.SHOP_ITEMS && MF.SHOP_ITEMS[k] ? MF.SHOP_ITEMS[k].icon + ' ' + MF.SHOP_ITEMS[k].name : k;
      return r.output[k] + '× ' + name;
    }).join(' + ');
    html += '<div class="mf-shop-card">';
    html += '<div class="mf-shop-ico">⚗</div>';
    html += '<div class="mf-shop-info"><div class="mf-shop-name">' + r.name + '</div><div class="mf-shop-desc">' + inputStr + ' → ' + outputStr + '</div></div>';
    html += '<div class="mf-shop-action"><button class="mf-shop-buy" data-craft="' + r.id + '"' + (can ? '' : ' disabled') + '>⚗ Crafter</button></div>';
    html += '</div>';
  });
  ct.innerHTML = html;
  ct.querySelectorAll('[data-craft]').forEach(function(b){
    b.addEventListener('click', function(){
      var rid = b.dataset.craft;
      var r = (MF.CRAFT_RECIPES || []).find(function(x){ return x.id === rid; });
      if (r && MF.craft_do(r)){
        MF.fx.showBanner('⚗ Crafting réussi !', 'wave');
        MF.ui.renderCraft();
      }
    });
  });
};

MF.ui.openRoguelikeChoice = function(picks){
  var modal = document.getElementById('mf-roguelike-choice');
  if (!modal || !picks || !picks.length) return;
  var holder = document.getElementById('mf-roguelike-options');
  holder.innerHTML = '';
  picks.forEach(function(card){
    var btn = document.createElement('button');
    btn.className = 'mf-mod-pick';
    btn.innerHTML = '<b>' + card.name + '</b><span>Ajoute ' + card.kind + ' à ton deck</span>';
    btn.addEventListener('click', function(){
      MF.roguelike_apply(card);
      modal.classList.add('mf-hidden');
      MF.state.paused = false;
    });
    holder.appendChild(btn);
  });
  modal.classList.remove('mf-hidden');
  MF.state.paused = true;
};

MF.openReplayModal = function(){
  var meta = MF.state.meta || {};
  if (!meta.lastReplay){ MF.fx.showBanner('🎬 Aucun replay', 'wave'); return; }
  document.getElementById('mf-replay-modal').classList.remove('mf-hidden');
  document.getElementById('mf-replay-info').textContent = 'Mode : ' + meta.lastReplay.mode + ' · Durée : ' + Math.round(meta.lastReplay.duration) + 's · ' + meta.lastReplay.events.length + ' events';
  setTimeout(function(){
    MF.replay_play(document.getElementById('mf-replay-canvas'), meta.lastReplay);
  }, 200);
};

// P14: Pacte modal — robust version
MF.ui.openPacteChoice = function(onPicked){
  var modal = document.getElementById('mf-pacte-modal');
  if (!modal || !MF.PACTES){ if (onPicked) onPicked(null); return; }
  var holder = document.getElementById('mf-pacte-options');
  if (!holder){ if (onPicked) onPicked(null); return; }
  holder.innerHTML = '';
  // Local cleanup function used by both pick and skip — guarantees paused=false
  var resolved = false;
  var resolve = function(picked){
    if (resolved) return;
    resolved = true;
    modal.classList.add('mf-hidden');
    MF.state.paused = false;
    if (onPicked) onPicked(picked || null);
  };
  // Show 3 random pactes
  var pool = MF.PACTES.slice();
  pool.sort(function(){ return Math.random() - 0.5; });
  pool.slice(0, 3).forEach(function(p){
    var btn = document.createElement('button');
    btn.className = 'mf-mod-pick';
    btn.innerHTML = '<b>' + p.icon + ' ' + p.name + ' (×' + p.fragMult + ' 💎)</b><span>' + p.desc + '</span>';
    btn.addEventListener('click', function(){
      MF.pacte_apply(p.id);
      resolve(p);
    });
    holder.appendChild(btn);
  });
  // Skip button — use onclick (override) to avoid stale handler accumulation
  var skip = document.getElementById('mf-pacte-skip');
  if (skip) skip.onclick = function(){ resolve(null); };
  // Click outside the card → skip
  modal.onclick = function(e){
    if (e.target === modal) resolve(null);
  };
  // Safety timeout: if user is stuck for 60s, auto-skip
  setTimeout(function(){ if (!resolved) resolve(null); }, 60000);
  // Show modal LAST so paused only flips if everything else worked
  modal.classList.remove('mf-hidden');
  MF.state.paused = true;
};

// P14: Modifier choice — robust version (same pattern as pacte)
// IMPORTANT: this modal does NOT reset paused on close — caller is responsible
// for the next step (chainer un pacte ou autre, ou reset paused dans le callback final)
MF.ui.openModifierChoice = function(onPicked){
  var modal = document.getElementById('mf-modifier-choice');
  if (!modal) { if (onPicked) onPicked(null); return; }
  var picks = MF.chosen_pick3 ? MF.chosen_pick3() : [];
  if (!picks.length){ if (onPicked) onPicked(null); return; }
  var holder = document.getElementById('mf-mod-options');
  if (!holder){ if (onPicked) onPicked(null); return; }
  holder.innerHTML = '';
  var resolved = false;
  var resolve = function(picked){
    if (resolved) return;
    resolved = true;
    modal.classList.add('mf-hidden');
    // NB: paused not reset here — caller chains next modal (pacte) which resets it
    if (onPicked) onPicked(picked || null);
  };
  picks.forEach(function(m){
    var btn = document.createElement('button');
    btn.className = 'mf-mod-pick';
    btn.innerHTML = '<b>' + m.icon + ' ' + m.name + '</b><span>' + m.desc + '</span>';
    btn.addEventListener('click', function(){
      MF.chosen_apply(m);
      resolve(m);
    });
    holder.appendChild(btn);
  });
  // Click outside card → skip
  modal.onclick = function(e){ if (e.target === modal) resolve(null); };
  // Safety timeout
  setTimeout(function(){ if (!resolved) resolve(null); }, 60000);
  modal.classList.remove('mf-hidden');
  MF.state.paused = true;
};

MF.ui.openWheel = function(){
  var modal = document.getElementById('mf-wheel-modal');
  if (modal) modal.classList.remove('mf-hidden');
  var btn = document.getElementById('mf-wheel-spin');
  if (btn){
    if (MF.wheel_canSpin()){
      btn.disabled = false;
      btn.textContent = '🎲 Tourner !';
    } else {
      btn.disabled = true;
      btn.textContent = '🎰 Reviens demain';
    }
  }
  document.getElementById('mf-wheel-result').textContent = '';
  // Draw initial wheel
  setTimeout(function(){ if (MF.wheel_animate) MF.wheel_animate(0, function(){}); }, 0);
};

MF.ui._renderSubProgression = function(){
  var meta = MF.state.meta || {};
  var f = document.getElementById('mf-prog-frags');
  if (f) f.textContent = meta.fragments || 0;
};

MF.ui._renderSubDefis = function(){
  var eb = document.getElementById('mf-defis-event-banner');
  if (!eb || !MF.event_data) return;
  var ev = MF.event_data();
  if (ev){
    eb.classList.remove('mf-hidden');
    eb.innerHTML = '<span class="mf-event-ico">' + ev.icon + '</span> <b>' + ev.name + '</b><br><small>' + ev.desc + '</small>';
  } else {
    eb.classList.add('mf-hidden');
  }
};

MF.ui.renderLadder = function(){
  if (MF.ladder_checkReset) MF.ladder_checkReset();
  var ct = document.getElementById('mf-ladder-content');
  if (!ct) return;
  var meta = MF.state.meta || {};
  meta.weeklyLadder = meta.weeklyLadder || {};
  var cur = MF.ladder_currentWeek();
  document.getElementById('mf-ladder-week').textContent = cur;
  document.getElementById('mf-ladder-reset').textContent = MF.ladder_resetIn ? MF.ladder_resetIn() : '—';
  var fmtTime = MF.chaos_fmtTime || function(t){ var m = Math.floor(t/60), s = Math.floor(t%60); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; };
  var html = '';
  // Current week entries
  var w = meta.weeklyLadder[cur] || { entries: [] };
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">📅 ' + cur + ' — en cours</div>';
  if (w.entries.length){
    html += '<div class="mf-mini-lb mf-lb-large">';
    w.entries.forEach(function(e, i){
      var ult = (MF.ULTIMATES && MF.ULTIMATES[e.ult]) ? MF.ULTIMATES[e.ult].icon : '';
      var vIcon = (MF.ui._chaosVariants && MF.ui._chaosVariants[e.variant]) ? MF.ui._chaosVariants[e.variant].icon : '';
      html += '<div class="mf-mini-lb-row"><span class="mf-lb-rank">#' + (i + 1) + '</span><span class="mf-lb-time">' + ult + ' ' + fmtTime(e.time) + '</span><span class="mf-lb-kills">💀 ' + e.kills + '</span><span class="mf-lb-bosses">' + vIcon + '</span></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="mf-hybrid-hint" style="text-align:center">Aucune run cette semaine — lance une partie chaos !</div>';
  }
  html += '<div class="mf-hybrid-hint" style="margin-top:6px">Récompenses au reset : 50/80/120/200 💎 selon ton meilleur temps.</div>';
  html += '</div>';
  // Past weeks
  var others = Object.keys(meta.weeklyLadder).filter(function(k){ return k < cur; }).sort().reverse();
  if (others.length){
    html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🗂 Semaines précédentes</div>';
    others.forEach(function(wk){
      var prev = meta.weeklyLadder[wk];
      var bestE = prev.entries && prev.entries[0];
      html += '<div class="mf-mini-lb-row"><span class="mf-lb-rank">' + wk + '</span><span class="mf-lb-time">' + (bestE ? fmtTime(bestE.time) : '—') + '</span><span class="mf-lb-kills">💀 ' + (bestE ? bestE.kills : 0) + '</span><span class="mf-lb-bosses">' + (prev.rewardFrags ? '✓ +' + prev.rewardFrags + '💎' : '—') + '</span></div>';
    });
    html += '</div>';
  }
  ct.innerHTML = html;
};

MF.ui.renderStats = function(){
  var ct = document.getElementById('mf-stats-content');
  if (!ct) return;
  var meta = MF.state.meta || {};
  var prog = MF.ach_progress ? MF.ach_progress() : { unlocked: 0, total: 0 };
  var hCount = (meta.foundHybrids ? Object.keys(meta.foundHybrids).length : 0);
  var hTotal = MF.HYBRIDS ? Object.keys(MF.HYBRIDS).length : 0;
  var lbBest = (meta.chaosLeaderboard && meta.chaosLeaderboard[0]) || null;
  var fmtTime = MF.chaos_fmtTime || function(t){ var m = Math.floor(t/60), s = Math.floor(t%60); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; };
  var totalSkins = 0, totalUnlockedSkins = 0;
  if (meta.unlockedSkins){
    Object.keys(meta.unlockedSkins).forEach(function(uid){ totalUnlockedSkins += (meta.unlockedSkins[uid] || []).length; });
  }
  totalSkins = (Object.keys(MF.SKINS).length) * Object.keys(MF.UNITS).length;
  var html = '';
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">⚔ Combat (all-time)</div>';
  html += '<div class="mf-stats-grid">';
  html += '<div class="mf-stats-cell"><span>💀 Kills</span><b>' + (MF.state.totalKills || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🎮 Runs</span><b>' + (meta.totalRuns || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>💰 Or total</span><b>' + (MF.state.totalGold || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>💎 Fragments</span><b>' + (meta.fragments || 0) + '</b></div>';
  html += '</div></div>';
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🌪 Chaos</div>';
  html += '<div class="mf-stats-grid">';
  html += '<div class="mf-stats-cell"><span>⏱ Record</span><b>' + fmtTime(meta.chaosBestTime || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🏆 Top run</span><b>' + (lbBest ? lbBest.kills + ' kills' : '—') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>📅 Daily best</span><b>' + (meta.dailyBest && meta.dailyBest[MF.chaos_dailyKey ? MF.chaos_dailyKey() : ''] ? fmtTime(meta.dailyBest[MF.chaos_dailyKey()].time) : '—') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🌌 Au-delà</span><b>' + (meta.beyondHighest || 0) + '</b></div>';
  html += '</div></div>';
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🌟 Collection</div>';
  html += '<div class="mf-stats-grid">';
  html += '<div class="mf-stats-cell"><span>🌟 Hybrides</span><b>' + hCount + '/' + hTotal + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🏆 Trophées</span><b>' + prog.unlocked + '/' + prog.total + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🎨 Skins</span><b>' + totalUnlockedSkins + '/' + totalSkins + '</b></div>';
  html += '<div class="mf-stats-cell"><span>📜 Reliques</span><b>' + ((meta.unlockedRelics || []).length) + '</b></div>';
  html += '</div></div>';
  html += '<div class="mf-stats-section"><div class="mf-stats-section-title">📈 Progression</div>';
  html += '<div class="mf-stats-grid">';
  var worlds = 0;
  if (MF.WORLDS && MF.state.progress){
    for (var i = 0; i < MF.WORLDS.length; i++){
      var p = MF.state.progress[i] || {};
      var done = 0;
      for (var k in p){ if (p[k] && p[k].stars > 0) done++; }
      if (done >= MF.WORLDS[i].levelCount) worlds++;
    }
  }
  html += '<div class="mf-stats-cell"><span>🏰 Mondes finis</span><b>' + worlds + '/' + (MF.WORLDS ? MF.WORLDS.length : 6) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🔥 Endless best</span><b>' + (MF.state.endlessBest || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>👑 Boss Rush</span><b>' + (MF.state.bossRushDone ? '✓' : '—') + '</b></div>';
  html += '<div class="mf-stats-cell"><span>🦸 Héros débloqués</span><b>' + ((meta.unlockedUnits ? Object.keys(meta.unlockedUnits).length : 0)) + '/2</b></div>';
  html += '</div></div>';
  // P12 Pantheon (top 10 lifetime per mode)
  if (meta.pantheon){
    var modeIcons = { campaign:'⚔', endless:'∞', bossrush:'👑', chaos:'🌪', roguelike:'🎲', beyond:'🌌', raid:'💀' };
    Object.keys(meta.pantheon).forEach(function(m){
      var arr = meta.pantheon[m];
      if (!arr || !arr.length) return;
      html += '<div class="mf-stats-section"><div class="mf-stats-section-title">' + (modeIcons[m] || '🏛') + ' Panthéon — ' + m + '</div>';
      html += '<div class="mf-mini-lb">';
      arr.slice(0, 10).forEach(function(e, i){
        var d = new Date(e.date);
        var dStr = d.getDate() + '/' + (d.getMonth()+1);
        html += '<div class="mf-mini-lb-row"><span class="mf-lb-rank">#' + (i+1) + '</span><span class="mf-lb-time">' + e.score + '</span><span style="font-size:.65rem;opacity:.6">' + dStr + '</span></div>';
      });
      html += '</div></div>';
    });
  }
  // P11 Advanced stats (statisticien mode)
  if (MF.advstats_compute){
    var ad = MF.advstats_compute();
    var modes = ad.modes;
    if (Object.keys(modes).length){
      html += '<div class="mf-stats-section"><div class="mf-stats-section-title">📊 Statistiques avancées</div>';
      Object.keys(modes).forEach(function(m){
        var s = modes[m];
        html += '<div class="mf-stats-cell" style="margin-bottom:3px"><span>' + m + '</span><b>' + s.runs + ' runs · ' + s.killsPerMin + ' k/m · ' + s.winRate + '% wins</b></div>';
      });
      html += '</div>';
    }
  }
  // Loadout slots
  if (MF.state.meta && MF.state.meta.loadouts){
    var meta2 = MF.state.meta;
    html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🎴 Loadouts</div><div class="mf-variant-row">';
    for (var ls = 0; ls < 3; ls++){
      var has = meta2.loadouts && meta2.loadouts[ls];
      html += '<div style="display:flex;flex-direction:column;flex:1;gap:3px">' +
        '<button class="mf-variant-pill" onclick="MF.loadout_save(' + ls + ');MF.ui.renderStats()">💾 Save ' + (ls + 1) + (has ? ' ✓' : '') + '</button>' +
        '<button class="mf-variant-pill"' + (has ? '' : ' disabled') + ' onclick="MF.loadout_load(' + ls + ');MF.ui.renderStats()">📥 Load ' + (ls + 1) + '</button>' +
      '</div>';
    }
    html += '</div></div>';
  }
  // P9 Ladder hebdo embedded
  if (meta.weeklyLadder){
    if (MF.ladder_checkReset) MF.ladder_checkReset();
    var cur = MF.ladder_currentWeek ? MF.ladder_currentWeek() : '';
    var w = meta.weeklyLadder[cur] || { entries: [] };
    html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🏅 Ladder ' + cur + ' (reset dans ' + (MF.ladder_resetIn ? MF.ladder_resetIn() : '—') + ')</div>';
    if (w.entries.length){
      html += '<div class="mf-mini-lb mf-lb-large">';
      w.entries.forEach(function(e, i){
        var ult = (MF.ULTIMATES && MF.ULTIMATES[e.ult]) ? MF.ULTIMATES[e.ult].icon : '';
        html += '<div class="mf-mini-lb-row"><span class="mf-lb-rank">#' + (i+1) + '</span><span class="mf-lb-time">' + ult + ' ' + (MF.chaos_fmtTime ? MF.chaos_fmtTime(e.time) : Math.round(e.time)+'s') + '</span><span class="mf-lb-kills">💀 ' + e.kills + '</span></div>';
      });
      html += '</div>';
    } else {
      html += '<div class="mf-hybrid-hint" style="text-align:center">Aucune run cette semaine. Lance un chaos !</div>';
    }
    html += '</div>';
  }
  // P10 Replay viewer button (if last run available)
  if (meta.lastReplay){
    html += '<div class="mf-stats-section"><div class="mf-stats-section-title">🎬 Dernier replay</div>';
    html += '<button class="mf-btn mf-btn-primary" onclick="MF.openReplayModal()" style="width:100%">▶ Voir le replay</button>';
    html += '<div class="mf-stats-sub" style="text-align:center;margin-top:5px">Mode : ' + meta.lastReplay.mode + ' · ' + Math.round(meta.lastReplay.duration) + 's</div>';
    html += '</div>';
  }
  // Replay graph (last 30 runs)
  var hist = meta.runHistory || [];
  if (hist.length){
    html += '<div class="mf-stats-section"><div class="mf-stats-section-title">📈 Progression (30 derniers runs)</div>';
    var maxK = 1;
    hist.forEach(function(h){ if (h.kills > maxK) maxK = h.kills; });
    html += '<div class="mf-replay-graph">';
    hist.forEach(function(h, idx){
      var hPct = Math.max(3, Math.round((h.kills / maxK) * 100));
      var col = h.won ? '#90ff90' : '#ff8a8a';
      var modeIcon = ({campaign:'⚔', endless:'∞', bossrush:'👑', chaos:'🌪️', beyond:'🌌'})[h.mode] || '?';
      html += '<div class="mf-replay-bar" style="height:' + hPct + '%;background:' + col + '" title="Run ' + (idx+1) + ' · ' + modeIcon + ' · ' + h.kills + ' kills"></div>';
    });
    html += '</div>';
    html += '<div class="mf-stats-sub" style="text-align:center">Vert = victoire · Rouge = défaite · Hauteur = kills</div>';
    html += '</div>';
  }
  ct.innerHTML = html;
};

MF.ui.renderShop = function(){
  var list = document.getElementById('mf-shop-list');
  if (!list) return;
  var meta = MF.state.meta || {};
  meta.consumables = meta.consumables || {};
  document.getElementById('mf-shop-frags').textContent = meta.fragments || 0;
  var totalOwned = 0;
  Object.keys(meta.consumables).forEach(function(k){ totalOwned += meta.consumables[k] || 0; });
  document.getElementById('mf-shop-owned').textContent = totalOwned;
  list.innerHTML = '';
  Object.keys(MF.SHOP_ITEMS).forEach(function(iid){
    var it = MF.SHOP_ITEMS[iid];
    var owned = meta.consumables[iid] || 0;
    var canBuy = (meta.fragments || 0) >= it.cost;
    var card = document.createElement('div');
    card.className = 'mf-shop-card';
    card.innerHTML =
      '<div class="mf-shop-ico">' + it.icon + '</div>' +
      '<div class="mf-shop-info">' +
        '<div class="mf-shop-name">' + it.name + '</div>' +
        '<div class="mf-shop-desc">' + it.desc + '</div>' +
        (owned > 0 ? '<div class="mf-shop-owned">📦 Possédés : ' + owned + '</div>' : '') +
      '</div>' +
      '<div class="mf-shop-action">' +
        '<button class="mf-shop-buy"' + (canBuy ? '' : ' disabled') + '>💎 ' + it.cost + '</button>' +
      '</div>';
    if (canBuy){
      card.querySelector('.mf-shop-buy').addEventListener('click', function(){
        meta.fragments -= it.cost;
        meta.consumables[iid] = (meta.consumables[iid] || 0) + 1;
        MF.saveProgress();
        MF.ui.renderShop();
        if (MF.audio && MF.audio.coin) MF.audio.coin();
      });
    }
    list.appendChild(card);
  });
};

// In-game consumable use — called from a HUD button
MF.ui.useConsumable = function(id){
  if (!MF.state.meta || !MF.state.meta.consumables) return false;
  var c = MF.state.meta.consumables;
  if (!c[id] || c[id] <= 0){
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('Aucun objet "' + id + '"', 'wave');
    return false;
  }
  var item = MF.SHOP_ITEMS[id];
  var fortress = MF.grid.fortressPos || { x:0, y:0, z:0 };
  if (id === 'heal_potion'){
    MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + 5);
    MF.fx.spawnRing(fortress, 0xff5060, { scale: 3, life: 0.5 });
    MF.fx.floatingDmg(fortress, '+5 ❤', 'heal');
  } else if (id === 'free_summon'){
    MF.run = MF.run || {};
    MF.run.freeSummon = true;
    if (MF.fx) MF.fx.showBanner('✨ Prochaine invocation gratuite', 'wave');
  } else if (id === 'double_gold'){
    MF.run = MF.run || {};
    var oldMult = MF.run.goldMult || 1;
    MF.run.goldMult = oldMult * 2;
    if (MF.fx) MF.fx.showBanner('💰 ×2 or 30s', 'wave');
    setTimeout(function(){ if (MF.run) MF.run.goldMult = oldMult; }, 30000);
  } else if (id === 'skip_wave'){
    if (MF.state.mode === 'chaos'){
      if (MF.fx) MF.fx.showBanner('🚫 Pas en mode chaos', 'wave');
      return false;
    }
    // Clear current wave's enemies
    while (MF.enemies.length) MF.killEnemy(MF.enemies[0]);
    MF.waves.spawnQueue = [];
    if (MF.fx) MF.fx.showBanner('⏭ Vague sautée', 'wave');
  } else if (id === 'reroll_skin'){
    var heroes = Object.keys(MF.UNITS).filter(function(uid){
      var u = MF.UNITS[uid];
      return u && u.kind === 'hero' && !u.isHybrid && u.summonable !== false;
    });
    if (!heroes.length) return false;
    var hid = heroes[Math.floor(Math.random() * heroes.length)];
    var meta = MF.state.meta;
    meta.unlockedSkins = meta.unlockedSkins || {};
    meta.unlockedSkins[hid] = meta.unlockedSkins[hid] || ['default'];
    var skinPool = ['gold', 'shadow', 'blood', 'arcane'];
    var avail = skinPool.filter(function(s){ return meta.unlockedSkins[hid].indexOf(s) < 0; });
    if (!avail.length){
      if (MF.fx) MF.fx.showBanner('🎲 Tous les skins de ' + MF.UNITS[hid].name + ' déjà débloqués', 'wave');
      return false;
    }
    var pick = avail[Math.floor(Math.random() * avail.length)];
    meta.unlockedSkins[hid].push(pick);
    if (MF.fx) MF.fx.showBanner('🎲 ' + MF.SKINS[pick].icon + ' ' + MF.SKINS[pick].name + ' pour ' + MF.UNITS[hid].name, 'wave');
  }
  c[id]--;
  if (c[id] <= 0) delete c[id];
  if (MF.saveProgress) MF.saveProgress();
  if (MF.audio && MF.audio.click) MF.audio.click();
  if (MF.ui.refreshConsumablePanel) MF.ui.refreshConsumablePanel();
  return true;
};

MF.ui.refreshConsumablePanel = function(){
  var panel = document.getElementById('mf-consumable-panel');
  if (!panel) return;
  var c = (MF.state.meta && MF.state.meta.consumables) || {};
  var ids = Object.keys(c).filter(function(k){ return c[k] > 0; });
  if (!ids.length){ panel.classList.add('mf-hidden'); return; }
  panel.classList.remove('mf-hidden');
  panel.innerHTML = '';
  ids.forEach(function(id){
    var item = MF.SHOP_ITEMS[id];
    if (!item) return;
    var btn = document.createElement('button');
    btn.className = 'mf-cons-btn';
    btn.innerHTML = item.icon + '<small>×' + c[id] + '</small>';
    btn.title = item.name + ' — ' + item.desc;
    btn.addEventListener('click', function(){ MF.ui.useConsumable(id); });
    panel.appendChild(btn);
  });
};

MF.ui.renderDaily = function(){
  var list = document.getElementById('mf-daily-list');
  if (!list) return;
  if (MF.daily_init) MF.daily_init();
  if (MF.quests_init) MF.quests_init();
  var meta = MF.state.meta || {};
  var key = MF.daily_today();
  var record = (meta.dailyChallenges && meta.dailyChallenges[key]) || {};
  document.getElementById('mf-daily-date').textContent = key.slice(6,8) + '/' + key.slice(4,6) + '/' + key.slice(0,4);
  document.getElementById('mf-daily-frags').textContent = meta.fragments || 0;
  list.innerHTML = '';
  // P10: Daily target (1 score à battre généré par seed)
  if (MF.daily_target){
    var t = MF.daily_target();
    if (t){
      meta.dailyTargets = meta.dailyTargets || {};
      meta.dailyTargets[key] = meta.dailyTargets[key] || {};
      var rec = meta.dailyTargets[key][t.id] || { progress: 0, completed: false };
      var pct = Math.min(100, Math.round((rec.progress / t.target) * 100));
      var tSec = document.createElement('div');
      tSec.className = 'mf-stats-section';
      tSec.innerHTML = '<div class="mf-stats-section-title">🎯 Objectif du jour</div>' +
        '<div class="mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '') + '">' +
          '<div class="mf-ach-ico">🎯</div>' +
          '<div class="mf-ach-info">' +
            '<div class="mf-ach-name">' + t.desc + '</div>' +
            '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + t.target + ' · +' + t.reward + ' 💎</div>' +
          '</div>' +
        '</div>';
      list.appendChild(tSec);
    }
  }
  // Daily section
  var dSec = document.createElement('div');
  dSec.className = 'mf-stats-section';
  dSec.innerHTML = '<div class="mf-stats-section-title">🎯 Défis du jour (3)</div>';
  var picks = MF.daily_today_challenges();
  picks.forEach(function(c){
    var rec = record[c.id] || { progress: 0, completed: false };
    var pct = Math.min(100, Math.round((rec.progress / c.target) * 100));
    var card = document.createElement('div');
    card.className = 'mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '');
    card.innerHTML =
      '<div class="mf-ach-ico">' + c.icon + '</div>' +
      '<div class="mf-ach-info">' +
        '<div class="mf-ach-name">' + c.name + '</div>' +
        '<div class="mf-ach-desc">' + c.desc + '</div>' +
        '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + c.target + ' · +' + c.reward + ' 💎</div>' +
      '</div>';
    dSec.appendChild(card);
  });
  list.appendChild(dSec);
  // 7-day quests section
  if (MF.LONG_QUESTS){
    var lqSec = document.createElement('div');
    lqSec.className = 'mf-stats-section';
    var windowDays = meta.questWindowStart ? Math.max(0, 7 - Math.floor((Date.now() - meta.questWindowStart) / (24 * 3600 * 1000))) : 7;
    lqSec.innerHTML = '<div class="mf-stats-section-title">🏅 Quêtes 7 jours (reset dans ' + windowDays + 'j)</div>';
    MF.LONG_QUESTS.forEach(function(q){
      var rec = (meta.longQuests && meta.longQuests[q.id]) || { progress: 0, completed: false };
      var pct = Math.min(100, Math.round((rec.progress / q.target) * 100));
      var card = document.createElement('div');
      card.className = 'mf-ach-card' + (rec.completed ? ' mf-ach-unlocked' : '');
      card.innerHTML =
        '<div class="mf-ach-ico">' + q.icon + '</div>' +
        '<div class="mf-ach-info">' +
          '<div class="mf-ach-name">' + q.name + '</div>' +
          '<div class="mf-ach-desc">' + q.desc + '</div>' +
          '<div class="mf-daily-bar"><div class="mf-daily-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="mf-ach-reward">' + (rec.completed ? '✓ ' : '') + (rec.progress || 0) + ' / ' + q.target + ' · +' + q.reward + ' 💎</div>' +
        '</div>';
      lqSec.appendChild(card);
    });
    list.appendChild(lqSec);
  }
};

MF.ui._spawnConfetti = function(){
  var layer = document.createElement('div');
  layer.className = 'mf-confetti';
  document.body.appendChild(layer);
  var colors = ['#ffd96a','#ff80c0','#90ff90','#80c8ff','#c070ff','#ff7028'];
  for (var i = 0; i < 36; i++){
    var c = document.createElement('div');
    c.className = 'mf-confetti-piece';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = (Math.random() * 0.6) + 's';
    c.style.animationDuration = (1.4 + Math.random() * 0.9) + 's';
    layer.appendChild(c);
  }
  setTimeout(function(){ if (layer.parentNode) layer.parentNode.removeChild(layer); }, 3500);
};

MF.ui._buildChaosStatsHTML = function(stats, totalTime){
  var html = '<div class="mf-stats-panel">';
  html += '<div class="mf-stats-title">📊 Détails du run</div>';
  html += '<div class="mf-stats-grid">';
  html += '<div class="mf-stats-cell"><span>🔥 Combo max</span><b>' + (stats.maxCombo || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>☄ Ultimes lancés</span><b>' + (stats.ultCasts || 0) + '</b></div>';
  html += '<div class="mf-stats-cell"><span>💎 Drops</span><b>' + (stats.dropsCollected || 0) + '</b></div>';
  var killsPerMin = totalTime > 0 ? Math.round((MF.chaos.kills * 60) / totalTime) : 0;
  html += '<div class="mf-stats-cell"><span>💀/min</span><b>' + killsPerMin + '</b></div>';
  html += '</div>';
  // Sparkline of kills/30s buckets
  var buckets = stats.killsBuckets || [];
  if (buckets.length){
    var maxK = 1;
    for (var i = 0; i < buckets.length; i++) maxK = Math.max(maxK, buckets[i] || 0);
    html += '<div class="mf-stats-sub">Kills par tranche de 30s :</div>';
    html += '<div class="mf-spark">';
    for (var j = 0; j < buckets.length; j++){
      var v = buckets[j] || 0;
      var pct = Math.round((v / maxK) * 100);
      html += '<div class="mf-spark-bar" style="height:' + Math.max(3, pct) + '%" title="' + v + ' kills"></div>';
    }
    html += '</div>';
  }
  // Boss timeline
  if (stats.bossTimes && stats.bossTimes.length){
    html += '<div class="mf-stats-sub">Boss arrivés à :</div>';
    html += '<div class="mf-stats-timeline">';
    var ttotal = Math.max(totalTime, 60);
    stats.bossTimes.forEach(function(t){
      var pct = (t / ttotal) * 100;
      html += '<div class="mf-timeline-marker" style="left:' + pct.toFixed(1) + '%" title="' + MF.chaos_fmtTime(t) + '">👹</div>';
    });
    html += '<div class="mf-timeline-bar"></div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
};

MF.ui.renderAchievements = function(){
  var list = document.getElementById('mf-ach-list');
  if (!list) return;
  if (MF.ach_check) MF.ach_check();
  var meta = MF.state.meta || {};
  meta.achievements = meta.achievements || {};
  var prog = MF.ach_progress ? MF.ach_progress() : { unlocked: 0, total: Object.keys(MF.ACHIEVEMENTS).length };
  document.getElementById('mf-ach-progress').textContent = prog.unlocked + '/' + prog.total;
  document.getElementById('mf-ach-frags').textContent = meta.fragments || 0;
  list.innerHTML = '';
  Object.keys(MF.ACHIEVEMENTS).forEach(function(aid){
    var a = MF.ACHIEVEMENTS[aid];
    var unlocked = !!meta.achievements[aid];
    var card = document.createElement('div');
    card.className = 'mf-ach-card' + (unlocked ? ' mf-ach-unlocked' : ' mf-ach-locked');
    card.innerHTML =
      '<div class="mf-ach-ico">' + (unlocked ? a.icon : '🔒') + '</div>' +
      '<div class="mf-ach-info">' +
        '<div class="mf-ach-name">' + a.name + '</div>' +
        '<div class="mf-ach-desc">' + a.desc + '</div>' +
        (unlocked ? '<div class="mf-ach-reward">✓ +' + (a.fragments||0) + ' 💎</div>' : '<div class="mf-ach-reward">+' + (a.fragments||0) + ' 💎</div>') +
      '</div>';
    list.appendChild(card);
  });
};

MF.ui.renderChaosRewards = function(){
  var list = document.getElementById('mf-chaos-rewards-list');
  if (!list) return;
  var meta = MF.state.meta || {};
  meta.chaosRewards = meta.chaosRewards || {};
  document.getElementById('mf-chaos-rewards-frags').textContent = meta.fragments || 0;
  document.getElementById('mf-chaos-rewards-best').textContent = MF.chaos_fmtTime ? MF.chaos_fmtTime(meta.chaosBestTime || 0) : '00:00';
  list.innerHTML = '';
  // Leaderboard (top 5) above the shop
  var lb = meta.chaosLeaderboard || [];
  if (lb.length){
    var lbHtml = '<div class="mf-mini-lb mf-lb-large"><div class="mf-mini-lb-title">🏆 Top 5 — tes runs</div>';
    for (var li = 0; li < lb.length; li++){
      var r = lb[li];
      var ult = (MF.ULTIMATES && MF.ULTIMATES[r.ult]) ? MF.ULTIMATES[r.ult].icon : '';
      lbHtml += '<div class="mf-mini-lb-row"><span class="mf-lb-rank">#' + (li + 1) + '</span><span class="mf-lb-time">' + ult + ' ' + MF.chaos_fmtTime(r.time) + '</span><span class="mf-lb-kills">💀 ' + r.kills + '</span><span class="mf-lb-bosses">👹 ' + r.bosses + '</span></div>';
    }
    lbHtml += '</div>';
    list.innerHTML += lbHtml;
  }
  // Define which rewards are stackable (max stacks)
  var stackable = { legendary_drops: 5 };
  Object.keys(MF.CHAOS_REWARDS).forEach(function(rid){
    var r = MF.CHAOS_REWARDS[rid];
    var owned = meta.chaosRewards[rid] || 0;
    var maxStack = stackable[rid] || 1;
    var atMax = owned >= maxStack;
    var card = document.createElement('div');
    card.className = 'mf-relic-card' + (atMax ? ' mf-relic-equipped' : (owned > 0 ? '' : ' mf-relic-locked'));
    var stackTxt = maxStack > 1 ? (' <small style="opacity:.7">(' + owned + '/' + maxStack + ')</small>') : (owned > 0 ? ' ✓' : '');
    var btnLabel, canBuy = !atMax && (meta.fragments || 0) >= r.cost;
    btnLabel = atMax ? 'MAX' : ('💎 ' + r.cost);
    card.innerHTML =
      '<div class="mf-relic-ico" style="background:rgba(80,15,80,.5)">' + r.icon + '</div>' +
      '<div class="mf-relic-info">' +
        '<div class="mf-relic-name">' + r.name + stackTxt + '</div>' +
        '<div class="mf-relic-desc">' + r.desc + '</div>' +
      '</div>' +
      '<div class="mf-relic-action">' +
        '<button class="mf-relic-btn mf-relic-buy"' + (canBuy ? '' : ' disabled') + '>' + btnLabel + '</button>' +
      '</div>';
    if (canBuy){
      card.querySelector('.mf-relic-buy').addEventListener('click', function(){
        meta.fragments -= r.cost;
        meta.chaosRewards[rid] = (meta.chaosRewards[rid] || 0) + 1;
        MF.saveProgress();
        MF.ui.renderChaosRewards();
      });
    }
    list.appendChild(card);
  });
  // "Revoir le tutoriel" link at bottom
  var tutLink = document.createElement('button');
  tutLink.className = 'mf-btn';
  tutLink.style.cssText = 'margin-top:10px;font-size:.8rem;width:100%';
  tutLink.textContent = '📘 Revoir le tutoriel au prochain run chaos';
  tutLink.addEventListener('click', function(){
    if (MF.state.meta) MF.state.meta.chaosTutorialDone = false;
    MF.saveProgress();
    tutLink.textContent = '✓ Tutoriel réinitialisé';
    tutLink.disabled = true;
  });
  list.appendChild(tutLink);
};

// === Chaos tutorial — multi-step overlay shown on first chaos run ===
MF.ui._tutCampSteps = [
  { ico:'🏰', title:'La Forteresse', text:'À droite, ta <b>forteresse</b>. Les ennemis suivent un chemin et essaient de l\'atteindre. Si elle tombe à 0 PV, c\'est la défaite.' },
  { ico:'✨', title:'Invoquer', text:'Tape <b>Invoquer</b> en bas pour faire apparaître un héros aléatoire sur une cellule libre. Tape <b>Tour</b> pour une tour fixe.' },
  { ico:'🌟', title:'Fusionner', text:'Glisse une unité sur une <b>identique du même rang</b> pour fusionner et atteindre le rang supérieur. Plus le rang est élevé, plus elle est forte.' },
  { ico:'⚔', title:'Lancer la vague', text:'Quand tu es prêt, tape <b>▶ Vague</b>. Les ennemis arrivent. Pendant la vague, tu peux continuer à invoquer et fusionner.' },
  { ico:'⏩', title:'Vitesse', text:'Tape ⏩ en haut pour <b>doubler la vitesse</b> du jeu si tu maîtrises bien.' }
];

MF.ui._tutSteps = [
  { ico:'🌪️', title:'Bienvenue en Chaos !', text:'Survis le plus longtemps possible dans une <b>arène ouverte</b>. Les ennemis surgissent de tous côtés vers ta forteresse au <b>centre</b>.' },
  { ico:'🛡️', title:'Place tes héros', text:'Invoque des héros et des tours, puis <b>fusionne 2 unités identiques</b> pour les faire monter en rang. Plus le rang est élevé, plus elles sont fortes.' },
  { ico:'⚡', title:'Auras automatiques', text:'Au <b>rang 3+</b>, tes héros gagnent une <b>aura passive</b> qui inflige des dégâts continus aux ennemis proches. Au rang 5, l\'aura devient encore plus puissante.' },
  { ico:'☄️', title:'Ton ultime', text:'Le bouton rond en bas à droite est ton <b>ultime équipé</b>. Il se charge à chaque kill (visible en %). Quand il pulse en or, <b>tape-le</b> pour libérer une attaque dévastatrice.' },
  { ico:'🔥', title:'Combo & drops', text:'Enchaîne les kills sans pause pour faire grimper le <b>combo</b>. À 10/25/50/100 kills d\'affilée, l\'écran flashe ! Les ennemis lâchent parfois des <b>orbes brillants</b> (or, soin, gel, furie) auto-récupérés.' },
  { ico:'🌟', title:'Fusion hybride (secret)', text:'À <b>rang 5</b>, deux héros compatibles peuvent fusionner en <b>hybride légendaire</b> (ex: Archer + Pyromancien = Rôdeur de Flammes). Glisse l\'un sur l\'autre pour découvrir les recettes.' }
];

MF.ui.startCampaignTutorial = function(){
  MF.ui._tutSteps_active = MF.ui._tutCampSteps;
  MF.ui._tutIdx = 0;
  MF.state.paused = true;
  MF.ui._renderTutStep();
  document.getElementById('mf-chaos-tutorial').classList.remove('mf-hidden');
  if (!MF.ui._tutWired){
    MF.ui._tutWired = true;
    document.getElementById('mf-tut-next').addEventListener('click', MF.ui._tutNext);
    document.getElementById('mf-tut-skip').addEventListener('click', MF.ui._tutFinish);
  }
};

MF.ui.startChaosTutorial = function(){
  MF.ui._tutSteps_active = MF.ui._tutSteps;
  MF.ui._tutIdx = 0;
  MF.state.paused = true;
  MF.ui._renderTutStep();
  document.getElementById('mf-chaos-tutorial').classList.remove('mf-hidden');
  // Wire buttons (idempotent — guard with flag)
  if (!MF.ui._tutWired){
    MF.ui._tutWired = true;
    document.getElementById('mf-tut-next').addEventListener('click', MF.ui._tutNext);
    document.getElementById('mf-tut-skip').addEventListener('click', MF.ui._tutFinish);
  }
};

MF.ui._renderTutStep = function(){
  var steps = MF.ui._tutSteps_active || MF.ui._tutSteps;
  var s = steps[MF.ui._tutIdx];
  document.getElementById('mf-tut-icon').textContent = s.ico;
  document.getElementById('mf-tut-title').textContent = s.title;
  document.getElementById('mf-tut-text').innerHTML = s.text;
  document.getElementById('mf-tut-step-i').textContent = MF.ui._tutIdx + 1;
  document.getElementById('mf-tut-step-n').textContent = steps.length;
  var nextBtn = document.getElementById('mf-tut-next');
  nextBtn.textContent = (MF.ui._tutIdx === steps.length - 1) ? 'C\'est parti ! ⚔' : 'Suivant ▶';
};

MF.ui._tutNext = function(){
  var steps = MF.ui._tutSteps_active || MF.ui._tutSteps;
  MF.ui._tutIdx++;
  if (MF.ui._tutIdx >= steps.length){
    MF.ui._tutFinish();
    return;
  }
  MF.ui._renderTutStep();
};

MF.ui._tutFinish = function(){
  document.getElementById('mf-chaos-tutorial').classList.add('mf-hidden');
  MF.state.paused = false;
  if (MF.state.meta){
    if (MF.ui._tutSteps_active === MF.ui._tutCampSteps){
      MF.state.meta.tutorialCampaignDone = true;
    } else {
      MF.state.meta.chaosTutorialDone = true;
    }
    MF.saveProgress();
  }
};

MF.ui._chaosVariants = {
  normal:     { id:'normal',     icon:'🌪️', name:'Normal',      desc:'Mode chaos standard.', mult: 1.0 },
  hardcore:   { id:'hardcore',   icon:'💀',  name:'Hardcore',    desc:'Forteresse à 1 PV. ×3 fragments.', mult: 3.0 },
  speedrun:   { id:'speedrun',   icon:'⏱',  name:'Speedrun',    desc:'5 min chrono. ×2 fragments.', mult: 2.0 },
  solo:       { id:'solo',       icon:'🕊',  name:'Solo',        desc:'Aucune synergie ni aura: chaque héros joue seul. ×2 fragments.', mult: 2.0 },
  daily:      { id:'daily',      icon:'🌅',  name:'Run du jour', desc:'Graine quotidienne fixe pour comparer scores. ×1.5 fragments.', mult: 1.5 },
  apocalypse: { id:'apocalypse', icon:'☄️',  name:'Apocalypse',  desc:'Densité ×2 d\'entrée, boss tous les 60s, 1 PV. ×5 fragments.', mult: 5.0 }
};

MF.ui.renderChaosUltSelect = function(){
  var grid = document.getElementById('mf-chaos-ult-grid');
  if (!grid) return;
  grid.innerHTML = '';
  MF.ui._chaosVariant = MF.ui._chaosVariant || 'normal';

  // Variant selector
  var varSection = document.createElement('div');
  varSection.className = 'mf-hybrid-section';
  var varHTML = '<div class="mf-hybrid-title">⚔ Variant <span class="mf-hybrid-count" id="mf-cur-variant">' + (MF.ui._chaosVariants[MF.ui._chaosVariant].icon + ' ' + MF.ui._chaosVariants[MF.ui._chaosVariant].name) + '</span></div>';
  varHTML += '<div class="mf-variant-row">';
  Object.keys(MF.ui._chaosVariants).forEach(function(vid){
    var v = MF.ui._chaosVariants[vid];
    var sel = (vid === MF.ui._chaosVariant) ? ' mf-variant-active' : '';
    varHTML += '<button class="mf-variant-pill' + sel + '" data-variant="' + vid + '">' + v.icon + ' ' + v.name + '</button>';
  });
  varHTML += '</div>';
  varHTML += '<div class="mf-hybrid-hint" id="mf-variant-desc">' + MF.ui._chaosVariants[MF.ui._chaosVariant].desc + '</div>';
  varSection.innerHTML = varHTML;
  grid.appendChild(varSection);
  // Wire variant buttons
  varSection.querySelectorAll('.mf-variant-pill').forEach(function(btn){
    btn.addEventListener('click', function(){
      MF.ui._chaosVariant = btn.dataset.variant;
      MF.ui.renderChaosUltSelect();
    });
  });

  // Hybrid discovery indicator
  var meta = MF.state.meta || {};
  meta.foundHybrids = meta.foundHybrids || {};
  var hTotal = Object.keys(MF.HYBRIDS || {}).length;
  var hFound = Object.keys(meta.foundHybrids).length;
  var hSection = document.createElement('div');
  hSection.className = 'mf-hybrid-section';
  var hHTML = '<div class="mf-hybrid-title">🌟 Hybrides découverts <span class="mf-hybrid-count">' + hFound + '/' + hTotal + '</span></div>';
  hHTML += '<div class="mf-hybrid-row">';
  Object.keys(MF.HYBRIDS).forEach(function(hid){
    var h = MF.HYBRIDS[hid];
    var isFound = !!meta.foundHybrids[hid];
    if (isFound){
      hHTML += '<div class="mf-hybrid-pill mf-hybrid-found" title="' + h.name + '">' + h.icon + ' <small>' + h.name + '</small></div>';
    } else {
      hHTML += '<div class="mf-hybrid-pill mf-hybrid-locked" title="Non découvert">❓ <small>???</small></div>';
    }
  });
  hHTML += '</div>';
  hHTML += '<div class="mf-hybrid-hint">Pour découvrir : fusionne 2 héros R5 de types compatibles en partie.</div>';
  hSection.innerHTML = hHTML;
  grid.appendChild(hSection);

  // Ultimates list
  var ultsHeader = document.createElement('div');
  ultsHeader.className = 'mf-hybrid-title';
  ultsHeader.style.marginTop = '10px';
  ultsHeader.textContent = '☄️ Choisis ton ultime';
  grid.appendChild(ultsHeader);

  Object.keys(MF.ULTIMATES).forEach(function(uid){
    var u = MF.ULTIMATES[uid];
    var card = document.createElement('div');
    card.className = 'mf-ult-card';
    card.innerHTML =
      '<div class="mf-ult-card-ico">' + u.icon + '</div>' +
      '<div class="mf-ult-card-info">' +
        '<div class="mf-ult-card-name">' + u.name + '</div>' +
        '<div class="mf-ult-card-desc">' + u.desc + '</div>' +
        '<div class="mf-ult-card-cd">⏱ CD: <b>' + u.cooldown + 's</b> · charge/kill: <b>' + u.chargePerKill.toFixed(2) + '%</b></div>' +
      '</div>';
    card.addEventListener('click', function(){ MF.startChaos(uid, MF.ui._chaosVariant); });
    grid.appendChild(card);
  });

  // Shared code section at bottom
  var codeSection = document.createElement('div');
  codeSection.className = 'mf-hybrid-section';
  codeSection.style.marginTop = '10px';
  codeSection.innerHTML =
    '<div class="mf-hybrid-title">🔗 Code partagé</div>' +
    '<div style="display:flex;gap:6px;margin-top:5px">' +
      '<input type="text" id="mf-share-code-input" placeholder="MF-12345-meteor-hardcore" style="flex:1;padding:6px 10px;border-radius:6px;border:1.5px solid rgba(170,140,235,.3);background:rgba(15,5,30,.7);color:#fff;font-family:inherit;font-size:.78rem">' +
      '<button class="mf-btn mf-btn-primary" id="mf-share-launch" style="font-size:.8rem">▶</button>' +
    '</div>' +
    '<div class="mf-hybrid-hint">Colle un code reçu d\'un ami pour relancer la même run.</div>';
  grid.appendChild(codeSection);
  codeSection.querySelector('#mf-share-launch').addEventListener('click', function(){
    var code = (codeSection.querySelector('#mf-share-code-input').value || '').trim();
    MF.ui.launchSharedCode(code);
  });
};

MF.ui.launchSharedCode = function(code){
  // Format: MF-{seed}-{ult}-{variant}
  if (!code || code.indexOf('MF-') !== 0){
    MF.fx.showBanner('🚫 Code invalide', 'wave');
    return;
  }
  var parts = code.split('-');
  if (parts.length < 4){
    MF.fx.showBanner('🚫 Format: MF-seed-ult-variant', 'wave');
    return;
  }
  var seed = parseInt(parts[1], 10);
  var ult = parts[2];
  var variant = parts[3];
  if (isNaN(seed) || !MF.ULTIMATES[ult]){
    MF.fx.showBanner('🚫 Code invalide', 'wave');
    return;
  }
  // Override chaos to use this seed via daily mechanism
  MF._sharedSeed = seed;
  MF.startChaos(ult, variant);
};

// === Help / rules screen content ===
MF.ui.renderHelp = function(){
  var ct = document.getElementById('mf-help-content');
  if (!ct) return;
  ct.innerHTML =
    '<button class="mf-btn mf-btn-primary" onclick="MF.advtut_show()" style="width:100%;margin-bottom:12px">🎓 Lancer le tutoriel avancé</button>' +
    '<section class="mf-help-section">' +
      '<h3>🎮 Le concept</h3>' +
      '<p>Tu es le maître d\'une <b>forteresse</b> assiégée. Place des héros et des tours sur la grille pour défendre ton chemin contre des hordes d\'ennemis qui marchent vers toi.</p>' +
      '<p>À chaque vague, plus d\'ennemis, plus de variétés. Si trop d\'ennemis atteignent ta forteresse, c\'est la défaite.</p>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>🔀 Système de fusion</h3>' +
      '<p>L\'âme du jeu : <b>fusionne deux unités identiques</b> du même rang pour créer une version supérieure.</p>' +
      '<ul>' +
        '<li>Glisse une unité sur une autre identique → <b>+1 rang</b></li>' +
        '<li>5 rangs : <b>Commun → Vert → Bleu → Violet → Doré</b> (légendaire)</li>' +
        '<li>Chaque rang = +taille, +dégâts, +portée, embellissements visuels</li>' +
        '<li>1 unité Rang 5 vaut 16 unités Rang 1</li>' +
      '</ul>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>💰 Or & invocation</h3>' +
      '<ul>' +
        '<li>Bouton <b>Invoquer</b> : génère un héros aléatoire de Rang 1</li>' +
        '<li>Bouton <b>Tour</b> : génère une tour aléatoire de Rang 1</li>' +
        '<li>Le coût augmente à chaque invocation</li>' +
        '<li>Or gagné : ennemis tués + bonus entre vagues</li>' +
        '<li>Tape une unité posée → <b>Vendre</b> contre une partie de l\'or</li>' +
      '</ul>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>🎯 Les modes de jeu</h3>' +
      '<div class="mf-help-mode">' +
        '<div class="mf-help-mode-ico">⚔️</div>' +
        '<div class="mf-help-mode-info"><b>Campagne — 90 niveaux</b>6 mondes thématiques × 15 niveaux. Difficulté progressive, débloque le monde suivant en finissant le précédent. Niveaux finaux = boss.</div>' +
      '</div>' +
      '<div class="mf-help-mode">' +
        '<div class="mf-help-mode-ico">∞</div>' +
        '<div class="mf-help-mode-info"><b>Infini</b>Vagues sans fin avec scaling exponentiel. Boss tous les 10 vagues. Modifiers aléatoires actifs à chaque run. But : aller le plus loin possible.</div>' +
      '</div>' +
      '<div class="mf-help-mode">' +
        '<div class="mf-help-mode-ico">👑</div>' +
        '<div class="mf-help-mode-info"><b>Boss Rush</b>6 boss légendaires successifs (un par monde). Ultime test de skill et de build. Récompense max en fragments.</div>' +
      '</div>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>🌳 Talents (permanent)</h3>' +
      '<p>Arbre de talents <b>persistant entre runs</b>. 6 catégories × 2 talents × 3 rangs.</p>' +
      '<ul>' +
        '<li><b>⚔️ Combat</b> : dégâts globaux, chance critique</li>' +
        '<li><b>🛡️ Défense</b> : PV forteresse max, regen entre vagues</li>' +
        '<li><b>💰 Économie</b> : or de départ, or par ennemi</li>' +
        '<li><b>🔮 Magie</b> : dégâts magiques, durée des ralentissements</li>' +
        '<li><b>🎲 Fortune</b> : multiplicateur de crit, chance d\'upgrades rares</li>' +
        '<li><b>⭐ Arcanique</b> : coût d\'invocation, portée + cadence globale</li>' +
      '</ul>' +
      '<p>Achète avec les <b>fragments</b> 💎 gagnés à chaque run.</p>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>📜 Reliques (équipées)</h3>' +
      '<p>Bonus permanents au début de chaque run. <b>Maximum 3 équipées</b> à la fois. Achetables avec fragments.</p>' +
      '<p>Exemples :</p>' +
      '<ul>' +
        '<li><b>🔥 Plume de Phénix</b> : ressuscite la forteresse une fois</li>' +
        '<li><b>🩸 Rune de Sang</b> : tes dégâts soignent la forteresse</li>' +
        '<li><b>📕 Grimoire Ancien</b> : +30% dégâts magiques</li>' +
        '<li><b>👢 Bottes du Vent</b> : +15% cadence d\'attaque</li>' +
      '</ul>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>⚡ Upgrades de run (temporaires)</h3>' +
      '<p>Toutes les <b>5 vagues</b>, tu choisis 1 carte parmi 3. Effets cumulatifs jusqu\'à la fin du run.</p>' +
      '<div class="mf-help-rarity-line">' +
        '<span class="mf-help-rarity-pill mf-help-rar-c">Common 60%</span>' +
        '<span class="mf-help-rarity-pill mf-help-rar-r">Rare 30%</span>' +
        '<span class="mf-help-rarity-pill mf-help-rar-e">Epic 9%</span>' +
        '<span class="mf-help-rarity-pill mf-help-rar-l">Legendary 1%</span>' +
      '</div>' +
      '<ul>' +
        '<li><b>Common</b> : +% dégâts, portée, cadence, or, regen, crit</li>' +
        '<li><b>Rare</b> : focus sur une classe, durée des effets ×1.5</li>' +
        '<li><b>Epic</b> : changeurs de gameplay (canons explosifs, tir double, projectiles perçants...)</li>' +
        '<li><b>Legendary</b> : effets ultra puissants (Tempête divine, Maître Fusion, +150% dmg)</li>' +
      '</ul>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>🌀 Modifiers (Infini & Boss Rush)</h3>' +
      '<p>2-3 règles aléatoires actives toute la run, mix de positives et négatives :</p>' +
      '<ul>' +
        '<li><b>Négatives</b> : Horde rapide, Peaux durcies, Brouillard, Carcasses explosives</li>' +
        '<li><b>Positives</b> : Filon trésor, Élans héroïques, Offre rapide (upgrade tous les 3 vagues)</li>' +
      '</ul>' +
      '<p>Annoncées en bannière au début du run — adapte ta stratégie !</p>' +
    '</section>' +
    '<section class="mf-help-section">' +
      '<h3>💡 Astuces</h3>' +
      '<ul>' +
        '<li>Fusionner > collectionner : 1 unité Rang 5 vaut 16 Rang 1</li>' +
        '<li>Garde 2-3 emplacements vides pour des invocations stratégiques</li>' +
        '<li><b>Tape une unité</b> pour voir ses stats détaillées et la vendre</li>' +
        '<li><b>Bouton 📖</b> en haut : catalogue avec preview 3D rotative au tap d\'une carte</li>' +
        '<li><b>Bouton ⏩</b> en haut : x2 vitesse, gain de temps en fin de partie</li>' +
        '<li><b>Pince/molette</b> pour zoomer, <b>glisse</b> pour voir le terrain</li>' +
        '<li>Fais plusieurs runs courts en Infini = farm de fragments rapide</li>' +
        '<li>Talents Combat/Défense en priorité avant Magie/Fortune</li>' +
      '</ul>' +
    '</section>';
};

// === Upgrade choice modal ===
MF.ui.openUpgradeChoice = function(){
  // Pause game flow during selection
  MF.state.paused = true;
  document.getElementById('mf-upg-wave').textContent = MF.state.waveIdx;
  var cards = MF.drawNUpgrades(3, MF.rl_rarityBoost ? MF.rl_rarityBoost() : 0);
  var container = document.getElementById('mf-upg-cards');
  container.innerHTML = '';
  cards.forEach(function(u){
    var c = document.createElement('div');
    c.className = 'mf-upg-card mf-rar-' + u.rarity;
    var rarityLabel = MF.RARITIES[u.rarity].label;
    c.innerHTML =
      '<div class="mf-upg-ico">' + (u.icon || '?') + '</div>' +
      '<div class="mf-upg-info">' +
        '<div class="mf-upg-name">' + u.name + '</div>' +
        '<div class="mf-upg-desc">' + u.desc + '</div>' +
      '</div>' +
      '<span class="mf-upg-rar mf-upg-rar-' + u.rarity + '">' + rarityLabel + '</span>';
    c.addEventListener('click', function(){
      MF.applyChosenUpgrade(u);
      MF.fx.showBanner('+ ' + u.name, u.rarity === 'legendary' ? 'boss' : 'wave');
      document.getElementById('mf-upgrade-modal').classList.add('mf-hidden');
      MF.state.paused = false;
      MF.state.screen = 'play';
      MF.ui.update();
    });
    container.appendChild(c);
  });
  document.getElementById('mf-upgrade-modal').classList.remove('mf-hidden');
  MF.state.screen = 'upgrade';
};

// === Talent tree ===
MF.ui.renderTalentTree = function(){
  if (!MF.state.meta) MF.state.meta = MF._defaultMeta();
  var meta = MF.state.meta;
  document.getElementById('mf-talent-fragments').textContent = meta.fragments;
  document.getElementById('mf-talent-runs').textContent = meta.totalRuns || 0;
  var tree = document.getElementById('mf-talent-tree');
  tree.innerHTML = '';
  // P12 — Constellations: render each category as a SVG starmap
  MF.TALENT_CATEGORIES.forEach(function(cat){
    var layout = (MF.CONSTELLATION_LAYOUT && MF.CONSTELLATION_LAYOUT[cat.id]) || null;
    if (!layout){
      // Fallback to old list rendering for unknown cats
      var catDiv = document.createElement('div');
      catDiv.className = 'mf-talent-cat';
      catDiv.innerHTML = '<div class="mf-talent-cat-name" style="color:' + cat.color + '">' + cat.name + '</div>';
      var row = document.createElement('div');
      row.className = 'mf-talent-row';
      Object.keys(MF.TALENTS).forEach(function(tid){
        var t = MF.TALENTS[tid];
        if (t.cat !== cat.id) return;
        row.appendChild(MF.ui._buildTalentCard(t, meta));
      });
      catDiv.appendChild(row);
      tree.appendChild(catDiv);
      return;
    }
    var section = document.createElement('div');
    section.className = 'mf-constellation';
    section.innerHTML = '<div class="mf-constellation-name" style="color:' + (layout.color || cat.color) + '">' + (layout.name || cat.name) + '</div>';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'mf-constellation-svg');
    // Draw connections (prereqs) first
    Object.keys(layout.nodes).forEach(function(tid){
      var t = MF.TALENTS[tid];
      if (!t || !t.requires) return;
      var fromPos = layout.nodes[t.requires];
      var toPos = layout.nodes[tid];
      if (!fromPos || !toPos) return;
      var rank = meta.talents[t.id] || 0;
      var parentRank = meta.talents[t.requires] || 0;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromPos.x); line.setAttribute('y1', fromPos.y);
      line.setAttribute('x2', toPos.x);   line.setAttribute('y2', toPos.y);
      line.setAttribute('stroke', parentRank > 0 ? layout.color : 'rgba(170,140,235,.25)');
      line.setAttribute('stroke-width', parentRank > 0 ? 0.6 : 0.4);
      line.setAttribute('opacity', parentRank > 0 ? 0.85 : 0.4);
      svg.appendChild(line);
    });
    // Draw nodes (stars)
    Object.keys(layout.nodes).forEach(function(tid){
      var t = MF.TALENTS[tid];
      if (!t) return;
      var pos = layout.nodes[tid];
      var rank = meta.talents[tid] || 0;
      var prereqOk = !t.requires || (meta.talents[t.requires] || 0) >= 1;
      var maxed = rank >= t.maxRank;
      var nextCost = (rank < t.maxRank) ? (t.costPerRank[rank] || 0) : 0;
      var canBuy = prereqOk && !maxed && (meta.fragments || 0) >= nextCost;
      // Visual states (most → least visible):
      //   maxed       → big bright gold + white border
      //   canBuy      → big colored star + animated pulse halo (most attention-grabbing for available)
      //   prereqOk    → medium colored (prereq met, but not affordable)
      //   has rank    → colored with halo
      //   locked      → small grey/dark (clearly de-prioritized)
      var radius;
      if (maxed) radius = 5.0;
      else if (canBuy) radius = 4.6;
      else if (rank > 0) radius = 3.8;
      else if (prereqOk) radius = 3.2;
      else radius = 2.4;
      var col;
      if (maxed) col = '#ffd96a';
      else if (canBuy) col = layout.color;
      else if (rank > 0) col = layout.color;
      else if (prereqOk) col = '#a0a0b0';
      else col = '#3a3a4a';
      // Pulse halo for canBuy (animated)
      if (canBuy && !maxed){
        var pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('cx', pos.x); pulse.setAttribute('cy', pos.y);
        pulse.setAttribute('r', radius * 1.5);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', layout.color);
        pulse.setAttribute('stroke-width', '0.8');
        pulse.setAttribute('opacity', '0.85');
        pulse.style.animation = 'mfTalentPulse 1.4s ease-in-out infinite';
        pulse.style.transformOrigin = pos.x + 'px ' + pos.y + 'px';
        svg.appendChild(pulse);
      }
      // Glow halo if has rank or canBuy
      if (rank > 0 || canBuy){
        var halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        halo.setAttribute('cx', pos.x); halo.setAttribute('cy', pos.y);
        halo.setAttribute('r', radius * (canBuy ? 2.0 : 1.8));
        halo.setAttribute('fill', col);
        halo.setAttribute('opacity', canBuy ? '0.35' : '0.25');
        svg.appendChild(halo);
      }
      var star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', pos.x); star.setAttribute('cy', pos.y);
      star.setAttribute('r', radius);
      star.setAttribute('fill', col);
      star.setAttribute('stroke', maxed ? '#fff' : (canBuy ? '#ffd96a' : 'rgba(0,0,0,.5)'));
      star.setAttribute('stroke-width', maxed || canBuy ? '0.7' : '0.4');
      star.style.cursor = (prereqOk && !maxed) ? 'pointer' : 'default';
      star.addEventListener('click', function(){
        MF.ui._showTalentInfo(t, meta, function(){ MF.ui.renderTalentTree(); });
      });
      svg.appendChild(star);
      // "Available" badge (small green dot + €)
      if (canBuy){
        var badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        badge.setAttribute('cx', pos.x + radius * 0.85);
        badge.setAttribute('cy', pos.y - radius * 0.85);
        badge.setAttribute('r', 1.6);
        badge.setAttribute('fill', '#90ff90');
        badge.setAttribute('stroke', '#0a3a10');
        badge.setAttribute('stroke-width', '0.3');
        svg.appendChild(badge);
      }
      // Icon overlay
      var fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      fo.setAttribute('x', pos.x - radius);
      fo.setAttribute('y', pos.y - radius);
      fo.setAttribute('width', radius * 2);
      fo.setAttribute('height', radius * 2);
      fo.style.pointerEvents = 'none';
      var div = document.createElement('div');
      var lockedDim = (!prereqOk && rank === 0) ? 'opacity:.5;filter:grayscale(.7);' : '';
      div.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:' + (radius * 0.85) + 'px;line-height:1;' + lockedDim;
      div.textContent = t.icon;
      fo.appendChild(div);
      svg.appendChild(fo);
    });
    section.appendChild(svg);
    tree.appendChild(section);
  });
};

MF.ui._showTalentInfo = function(t, meta, onRefresh){
  var rank = meta.talents[t.id] || 0;
  var cost = (rank < t.maxRank) ? t.costPerRank[rank] : 0;
  var prereqOk = !t.requires || (meta.talents[t.requires] || 0) >= 1;
  var prereqMsg = '';
  if (!prereqOk){
    var p = MF.TALENTS[t.requires];
    prereqMsg = '🔒 Requiert ' + (p ? p.icon + ' ' + p.name : t.requires) + ' R1+';
  }
  var canBuy = prereqOk && rank < t.maxRank && (meta.fragments || 0) >= cost;
  // Modal-like overlay
  var existing = document.getElementById('mf-talent-info-pop');
  if (existing) existing.remove();
  var pop = document.createElement('div');
  pop.id = 'mf-talent-info-pop';
  pop.className = 'mf-talent-info-pop';
  pop.innerHTML =
    '<div class="mf-talent-info-card">' +
      '<div class="mf-talent-info-title">' + t.icon + ' ' + t.name + ' <small>R' + rank + '/' + t.maxRank + '</small></div>' +
      '<div class="mf-talent-info-desc">' + (typeof t.desc === 'function' ? t.desc(rank + 1 > t.maxRank ? rank : rank + 1) : t.desc) + '</div>' +
      (prereqMsg ? '<div class="mf-talent-info-prereq">' + prereqMsg + '</div>' : '') +
      (rank < t.maxRank
        ? '<button class="mf-btn mf-btn-primary mf-talent-info-buy"' + (canBuy ? '' : ' disabled') + '>' + (prereqOk ? '⬆ Améliorer (💎' + cost + ')' : '🔒 Verrouillé') + '</button>'
        : '<div class="mf-talent-info-max">✨ MAX</div>') +
      '<button class="mf-btn mf-talent-info-close">Fermer</button>' +
    '</div>';
  document.body.appendChild(pop);
  pop.addEventListener('click', function(e){ if (e.target === pop) pop.remove(); });
  pop.querySelector('.mf-talent-info-close').addEventListener('click', function(){ pop.remove(); });
  var buyBtn = pop.querySelector('.mf-talent-info-buy');
  if (buyBtn){
    buyBtn.addEventListener('click', function(){
      if (!canBuy) return;
      meta.fragments -= cost;
      meta.talents[t.id] = rank + 1;
      MF.saveProgress();
      pop.remove();
      if (onRefresh) onRefresh();
      if (MF.audio && MF.audio.coin) MF.audio.coin();
    });
  }
};

MF.ui._buildTalentCard = function(t, meta){
  var card = document.createElement('div');
  card.className = 'mf-talent-card';
  var rank = meta.talents[t.id] || 0;
  if (rank >= t.maxRank) card.classList.add('mf-tal-maxed');
  var cost = (rank < t.maxRank) ? t.costPerRank[rank] : 0;
  // Prerequisite check
  var prereqOk = true;
  var prereqMsg = '';
  if (t.requires){
    var parentRank = meta.talents[t.requires] || 0;
    if (parentRank < 1){
      prereqOk = false;
      var parentT = MF.TALENTS[t.requires];
      prereqMsg = '🔒 Requiert ' + (parentT ? parentT.icon + ' ' + parentT.name : t.requires) + ' R1+';
    }
  }
  if (!prereqOk) card.classList.add('mf-tal-locked');
  var canBuy = prereqOk && rank < t.maxRank && meta.fragments >= cost;
  card.innerHTML =
    '<div class="mf-talent-name"><span>' + t.icon + '</span><span>' + t.name + '</span>' +
      '<span class="mf-talent-rank">' + rank + '/' + t.maxRank + '</span></div>' +
    '<div class="mf-talent-desc">' + t.desc(rank + 1 > t.maxRank ? rank : rank + 1) + '</div>' +
    (prereqMsg ? '<div class="mf-talent-prereq">' + prereqMsg + '</div>' : '');
  if (rank < t.maxRank){
    var btn = document.createElement('button');
    btn.className = 'mf-talent-buy';
    btn.textContent = prereqOk ? '⬆ Améliorer (💎' + cost + ')' : '🔒 Verrouillé';
    btn.disabled = !canBuy;
    btn.addEventListener('click', function(){
      if (!canBuy) return;
      meta.fragments -= cost;
      meta.talents[t.id] = rank + 1;
      MF.saveProgress();
      MF.ui.renderTalentTree();
    });
    card.appendChild(btn);
  } else {
    var done = document.createElement('div');
    done.style.cssText = 'text-align:center;color:#ffd96a;font-weight:bold;font-size:.78rem;margin-top:5px';
    done.textContent = '✨ MAX';
    card.appendChild(done);
  }
  return card;
};

// === Relic screen ===
MF.ui.renderRelicList = function(){
  if (!MF.state.meta) MF.state.meta = MF._defaultMeta();
  var meta = MF.state.meta;
  document.getElementById('mf-relic-fragments').textContent = meta.fragments;
  document.getElementById('mf-relic-equipped').textContent = (meta.equippedRelics || []).length;
  var list = document.getElementById('mf-relic-list');
  list.innerHTML = '';
  Object.keys(MF.RELICS).forEach(function(rid){
    var r = MF.RELICS[rid];
    var owned = (meta.unlockedRelics || []).indexOf(rid) >= 0;
    var equipped = (meta.equippedRelics || []).indexOf(rid) >= 0;
    var card = document.createElement('div');
    card.className = 'mf-relic-card' + (equipped ? ' mf-relic-equipped' : '') + (!owned ? ' mf-relic-locked' : '');
    card.innerHTML =
      '<div class="mf-relic-ico" style="background:radial-gradient(circle at 35% 30%,#fff,'+ r.color +' 60%,#3a1d6c 100%)">' + r.icon + '</div>' +
      '<div class="mf-relic-info">' +
        '<div class="mf-relic-name">' + r.name + (equipped ? ' <span style="color:#ffd96a">✓</span>' : '') + '</div>' +
        '<div class="mf-relic-desc">' + r.desc + '</div>' +
      '</div>';
    var act = document.createElement('div');
    act.className = 'mf-relic-action';
    if (!owned){
      var buyBtn = document.createElement('button');
      buyBtn.className = 'mf-relic-btn mf-relic-buy';
      buyBtn.textContent = '💎 ' + r.cost;
      buyBtn.disabled = meta.fragments < r.cost;
      buyBtn.addEventListener('click', function(){
        if (meta.fragments < r.cost) return;
        meta.fragments -= r.cost;
        meta.unlockedRelics.push(rid);
        MF.saveProgress();
        MF.ui.renderRelicList();
      });
      act.appendChild(buyBtn);
    } else if (equipped){
      var unBtn = document.createElement('button');
      unBtn.className = 'mf-relic-btn mf-relic-unequip';
      unBtn.textContent = '✕';
      unBtn.addEventListener('click', function(){
        meta.equippedRelics = meta.equippedRelics.filter(function(x){ return x !== rid; });
        MF.saveProgress();
        MF.ui.renderRelicList();
      });
      act.appendChild(unBtn);
    } else {
      var eqBtn = document.createElement('button');
      eqBtn.className = 'mf-relic-btn mf-relic-equip';
      eqBtn.textContent = '✓';
      eqBtn.disabled = (meta.equippedRelics || []).length >= 3;
      eqBtn.addEventListener('click', function(){
        if (meta.equippedRelics.length >= 3) return;
        meta.equippedRelics.push(rid);
        MF.saveProgress();
        MF.ui.renderRelicList();
      });
      act.appendChild(eqBtn);
    }
    card.appendChild(act);
    list.appendChild(card);
  });
};

MF.ui.openCatalog = function(){
  // Remember where to go back (play or menu)
  MF.ui._catalogReturnTo = (MF.state.screen === 'play') ? 'play' : 'menu';
  if (MF.state.screen === 'play') MF.state.paused = true;
  MF.ui.showScreen('catalog');
};

MF.ui.renderCatalog = function(tab){
  var ct = document.getElementById('mf-cat-content');
  ct.innerHTML = '';
  if (tab === 'hero' || tab === 'tower'){
    var ids = (tab === 'hero') ? MF.UNIT_POOL_HERO.slice() : MF.UNIT_POOL_TOWER.slice();
    // Include hybrid recipes + unlockable heroes in hero catalog
    if (tab === 'hero'){
      if (MF.HYBRIDS) Object.keys(MF.HYBRIDS).forEach(function(hid){ ids.push(hid); });
      if (MF.UNLOCKABLE_HEROES) Object.keys(MF.UNLOCKABLE_HEROES).forEach(function(uid){ ids.push(uid); });
    }
    ids.forEach(function(id){
      var d = MF.UNITS[id];
      var card = MF.ui._buildUnitCard(d, tab === 'tower');
      ct.appendChild(card);
    });
  } else if (tab === 'enemy'){
    Object.keys(MF.ENEMIES).forEach(function(id){
      ct.appendChild(MF.ui._buildEnemyCard(MF.ENEMIES[id], false));
    });
    Object.keys(MF.BOSSES).forEach(function(id){
      ct.appendChild(MF.ui._buildEnemyCard(MF.BOSSES[id], true));
    });
  }
};

MF.ui._buildUnitCard = function(d, isTower){
  var c = document.createElement('div');
  c.className = 'mf-card' + (isTower ? ' mf-card-tower' : '');
  var dmg1 = d.ranks[0].dmg, dmg5 = d.ranks[4].dmg;
  // Try to render a mini 3D image
  var img = MF.ui._renderUnitImage(d.id, 1);
  var icoHtml = img
    ? '<div class="mf-card-ico"><img src="' + img + '" alt="" style="width:100%;height:100%;object-fit:contain"></div>'
    : '<div class="mf-card-ico">' + (d.icon || '?') + '</div>';
  var html = icoHtml
           + '<div class="mf-card-info">'
           +   '<div class="mf-card-name">' + d.name + ' <small>' + (isTower ? 'Tour' : 'Héros') + '</small></div>'
           +   '<div class="mf-card-desc">' + (d.desc || '') + '</div>'
           +   '<div class="mf-card-stats">'
           +     '<span class="mf-card-stat">⚔ <b>' + dmg1 + '→' + dmg5 + '</b></span>'
           +     '<span class="mf-card-stat">🎯 <b>' + d.attack.range.toFixed(1) + '</b></span>'
           +     '<span class="mf-card-stat">⏱ <b>' + d.attack.atkSpeed.toFixed(2) + '/s</b></span>'
           +     '<span class="mf-card-stat">🎯 ' + (d.attack.type === 'splash' ? 'Zone' : d.attack.type === 'pierce' ? 'Perçant' : d.attack.type === 'chain' ? 'Chaîne' : 'Mono') + '</span>'
           +   '</div>'
           +   '<div class="mf-card-ranks">';
  for (var i = 1; i <= 5; i++){
    html += '<span class="mf-rank-pill mf-rank-' + i + '">R' + i + '</span>';
  }
  html += '</div></div>';
  c.innerHTML = html;
  c.style.cursor = 'pointer';
  c.addEventListener('click', function(){ MF.ui.openCardPreview(d.id); });
  return c;
};

// === Card preview modal with 3D rotative mesh ===
MF.ui._cardPreview = {
  initialized: false,
  renderer: null, scene: null, camera: null,
  unitMesh: null, unitId: null, rank: 1,
  rafId: 0, t: 0, lastT: 0, running: false
};

MF.ui._initCardPreview = function(){
  var p = MF.ui._cardPreview;
  if (p.initialized) return;
  p.initialized = true;
  var canvas = document.getElementById('mf-card-preview');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (THREE.ACESFilmicToneMapping !== undefined){
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }
  p.renderer = renderer;

  var scene = new THREE.Scene();
  scene.background = null;
  p.scene = scene;

  var camera = new THREE.PerspectiveCamera(28, 1.6, 0.1, 30);
  camera.position.set(0, 1.6, 4.4);
  camera.lookAt(0, 0.6, 0);
  p.camera = camera;

  // Lighting (matches main scene)
  var ambient = new THREE.AmbientLight(0x9098b8, 0.55);
  scene.add(ambient);
  var key = new THREE.DirectionalLight(0xfff2d8, 1.4);
  key.position.set(3, 5, 4);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0x88a8ff, 0.6);
  fill.position.set(-3, 3, -2);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0xff80c8, 0.6);
  rim.position.set(0, 2, -5);
  scene.add(rim);
  // Hemisphere
  var hemi = new THREE.HemisphereLight(0xc8e0ff, 0x402848, 0.4);
  scene.add(hemi);

  // Floor disc for nice ground
  var floorGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.06, 24);
  var floorMat = new THREE.MeshStandardMaterial({ color: 0x3a2068, roughness: 0.8, metalness: 0 });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.01;
  scene.add(floor);
  // Decorative gold rim
  var rimGeo = new THREE.TorusGeometry(1.2, 0.03, 8, 32);
  var rimMat = new THREE.MeshStandardMaterial({ color: 0xc9a44a, roughness: 0.3, metalness: 0.85, emissive: 0x402608, emissiveIntensity: 0.4 });
  var rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 0.025;
  scene.add(rimMesh);
};

MF.ui.openCardPreview = function(unitId){
  MF.ui._initCardPreview();
  var p = MF.ui._cardPreview;
  p.unitId = unitId;
  p.rank = 1;
  // Build rank tabs
  var tabs = document.getElementById('mf-card-modal-rank-tabs');
  tabs.innerHTML = '';
  for (var r = 1; r <= 5; r++){
    var t = document.createElement('button');
    t.className = 'mf-rk-tab' + (r === 1 ? ' mf-active' : '');
    t.textContent = 'R' + r;
    t.dataset.rank = r;
    (function(rk){
      t.addEventListener('click', function(){
        document.querySelectorAll('.mf-rk-tab').forEach(function(x){ x.classList.remove('mf-active'); });
        t.classList.add('mf-active');
        MF.ui._setPreviewRank(rk);
      });
    })(r);
    tabs.appendChild(t);
  }
  MF.ui._setPreviewRank(1);
  document.getElementById('mf-card-modal').classList.remove('mf-hidden');
  if (!p.running){
    p.running = true;
    p.lastT = performance.now() / 1000;
    p.rafId = requestAnimationFrame(MF.ui._previewLoop);
  }
  // Resize the canvas now that it's visible
  setTimeout(function(){ MF.ui._resizePreview(); }, 0);
};

MF.ui.closeCardPreview = function(){
  var p = MF.ui._cardPreview;
  document.getElementById('mf-card-modal').classList.add('mf-hidden');
  p.running = false;
  if (p.rafId) cancelAnimationFrame(p.rafId);
  if (p.unitMesh && p.scene){
    p.scene.remove(p.unitMesh);
    MF._disposeMesh(p.unitMesh);
    p.unitMesh = null;
  }
};

MF.ui._setPreviewRank = function(rank){
  var p = MF.ui._cardPreview;
  if (!p.unitId) return;
  p.rank = rank;
  // Remove old mesh
  if (p.unitMesh){
    p.scene.remove(p.unitMesh);
    MF._disposeMesh(p.unitMesh);
  }
  // Build new
  p.unitMesh = MF.buildUnitMesh(p.unitId, rank);
  p.unitMesh.position.set(0, 0, 0);
  p.scene.add(p.unitMesh);
  // Update info
  var d = MF.UNITS[p.unitId];
  var rdata = d.ranks[rank - 1];
  document.getElementById('mf-card-modal-name').innerHTML =
    (d.icon || '') + ' ' + d.name + ' <small>Rang ' + rank + ' / 5</small>';
  document.getElementById('mf-card-modal-stats').innerHTML =
      '<div class="mf-pv-stat"><span>⚔ Dégâts</span><b>' + rdata.dmg + '</b></div>'
    + '<div class="mf-pv-stat"><span>🎯 Portée</span><b>' + d.attack.range.toFixed(1) + '</b></div>'
    + '<div class="mf-pv-stat"><span>⏱ Cadence</span><b>' + d.attack.atkSpeed.toFixed(2) + '/s</b></div>'
    + '<div class="mf-pv-stat"><span>📐 Type</span><b>' + (d.attack.type === 'splash' ? 'Zone' : d.attack.type === 'pierce' ? 'Perçant' : d.attack.type === 'chain' ? 'Chaîne' : 'Mono') + '</b></div>';
  document.getElementById('mf-card-modal-desc').textContent = d.desc || '';
  // Unlock button for unlockable heroes
  MF.ui._renderUnlockButton(p.unitId);
  // Skin selector (only for heroes/towers, not hybrids/enemies)
  MF.ui._renderSkinSelector(p.unitId);
};

MF.ui._renderUnlockButton = function(unitId){
  var holder = document.getElementById('mf-card-modal-unlock');
  if (!holder){
    holder = document.createElement('div');
    holder.id = 'mf-card-modal-unlock';
    holder.style.marginTop = '6px';
    var desc = document.getElementById('mf-card-modal-desc');
    if (desc && desc.parentNode) desc.parentNode.insertBefore(holder, desc.nextSibling);
  }
  holder.innerHTML = '';
  if (!MF.UNLOCKABLE_HEROES || !MF.UNLOCKABLE_HEROES[unitId]) return;
  var meta = MF.state.meta || {};
  meta.unlockedUnits = meta.unlockedUnits || {};
  var def = MF.UNLOCKABLE_HEROES[unitId];
  if (meta.unlockedUnits[unitId]){
    holder.innerHTML = '<div style="text-align:center;color:#90ff90;font-size:.85rem">✓ Débloqué — apparaît dans la pool d\'invocation</div>';
    return;
  }
  var canBuy = (meta.fragments || 0) >= def.unlockCost;
  var btn = document.createElement('button');
  btn.className = 'mf-btn mf-btn-primary';
  btn.style.cssText = 'width:100%;font-size:.85rem';
  btn.textContent = '🔓 Débloquer — 💎 ' + def.unlockCost;
  btn.disabled = !canBuy;
  btn.addEventListener('click', function(){
    if (!canBuy) return;
    meta.fragments -= def.unlockCost;
    meta.unlockedUnits[unitId] = Date.now();
    MF.saveProgress();
    MF.fx.showBanner('🔓 ' + def.icon + ' ' + def.name + ' débloqué !', 'wave');
    if (MF.audio && MF.audio.achievement) MF.audio.achievement();
    MF.ui._renderUnlockButton(unitId);
  });
  holder.appendChild(btn);
};

MF.ui._renderSkinSelector = function(unitId){
  var holder = document.getElementById('mf-card-modal-skins');
  if (!holder){
    holder = document.createElement('div');
    holder.id = 'mf-card-modal-skins';
    holder.className = 'mf-skin-selector';
    var desc = document.getElementById('mf-card-modal-desc');
    if (desc && desc.parentNode) desc.parentNode.insertBefore(holder, desc.nextSibling);
  }
  var d = MF.UNITS[unitId];
  if (!d){ holder.innerHTML = ''; return; }
  // P11: hybrides ont aussi des skins maintenant
  var meta = MF.state.meta || {};
  meta.equippedSkins = meta.equippedSkins || {};
  meta.unlockedSkins = meta.unlockedSkins || {};
  meta.unlockedSkins[unitId] = meta.unlockedSkins[unitId] || ['default'];
  var equipped = meta.equippedSkins[unitId] || 'default';
  var html = '<div class="mf-skin-title">🎨 Skins</div><div class="mf-skin-row">';
  Object.keys(MF.SKINS).forEach(function(sid){
    var s = MF.SKINS[sid];
    var isUnlocked = meta.unlockedSkins[unitId].indexOf(sid) >= 0 || sid === 'default';
    var isEquipped = equipped === sid;
    var cls = 'mf-skin-pill' + (isEquipped ? ' mf-skin-equipped' : '') + (isUnlocked ? '' : ' mf-skin-locked');
    var label = isUnlocked ? s.icon + ' ' + s.name : s.icon + ' ' + s.cost + '💎';
    html += '<button class="' + cls + '" data-skin="' + sid + '">' + label + '</button>';
  });
  html += '</div>';
  holder.innerHTML = html;
  // Wire buttons
  holder.querySelectorAll('.mf-skin-pill').forEach(function(btn){
    btn.addEventListener('click', function(){
      var sid = btn.dataset.skin;
      var unl = meta.unlockedSkins[unitId];
      if (unl.indexOf(sid) < 0 && sid !== 'default'){
        // Try to buy
        var cost = MF.SKINS[sid].cost || 0;
        if ((meta.fragments || 0) < cost){
          MF.fx.showBanner('💎 Pas assez de fragments', 'wave');
          return;
        }
        meta.fragments -= cost;
        unl.push(sid);
      }
      meta.equippedSkins[unitId] = sid;
      MF.saveProgress();
      // Rebuild preview with new skin
      MF.ui._setPreviewRank(MF.ui._cardPreview.rank);
      if (MF.audio && MF.audio.click) MF.audio.click();
    });
  });
};

MF.ui._resizePreview = function(){
  var p = MF.ui._cardPreview;
  if (!p.renderer) return;
  var canvas = document.getElementById('mf-card-preview');
  var w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  p.renderer.setSize(w, h, false);
  p.camera.aspect = w / h;
  p.camera.updateProjectionMatrix();
};

MF.ui._previewLoop = function(now){
  var p = MF.ui._cardPreview;
  if (!p.running) return;
  p.rafId = requestAnimationFrame(MF.ui._previewLoop);
  var t = (now || performance.now()) / 1000;
  var dt = Math.min(0.05, t - p.lastT);
  p.lastT = t;
  p.t += dt;
  if (p.unitMesh){
    p.unitMesh.rotation.y = p.t * 0.7;
    // Subtle bob
    p.unitMesh.position.y = Math.sin(p.t * 1.3) * 0.04;
  }
  MF.ui._resizePreview();
  p.renderer.render(p.scene, p.camera);
};

MF.ui._buildEnemyCard = function(d, isBoss){
  var c = document.createElement('div');
  c.className = 'mf-card mf-card-enemy' + (isBoss ? ' mf-card-boss' : '');
  var img = MF.ui._renderEnemyImage(d.id);
  var icoFallback = d.flying ? '🦇' : (isBoss ? '👑' : (d.kind === 'tank' ? '🛡️' : (d.id === 'skeleton' ? '💀' : '👹')));
  var ico = img
    ? '<img src="' + img + '" alt="" style="width:100%;height:100%;object-fit:contain">'
    : icoFallback;
  var html = '<div class="mf-card-ico">' + ico + '</div>'
           + '<div class="mf-card-info">'
           +   '<div class="mf-card-name">' + d.name + ' <small>' + (isBoss ? 'BOSS' : (d.flying ? 'Volant' : (d.kind === 'tank' ? 'Tank' : (d.kind === 'elite' ? 'Élite' : 'Standard')))) + '</small></div>'
           +   '<div class="mf-card-stats">'
           +     '<span class="mf-card-stat">❤ <b>' + d.baseHP + '</b></span>'
           +     '<span class="mf-card-stat">🏃 <b>' + d.baseSpd.toFixed(2) + '</b></span>'
           +     '<span class="mf-card-stat">🛡 <b>' + Math.round((d.armor || 0) * 100) + '%</b></span>'
           +     '<span class="mf-card-stat">💰 <b>' + d.gold + '</b></span>'
           +     '<span class="mf-card-stat">💥 <b>' + (d.fortressDmg || 1) + '</b></span>'
           +   '</div>'
           +   '<div class="mf-card-desc" style="margin-top:4px">' + MF.ui._enemyHint(d) + '</div>'
           + '</div>';
  c.innerHTML = html;
  return c;
};

// === Offscreen renderer for unit/enemy thumbnails ===
MF.ui._thumbCache = {};
MF.ui._thumbInit = function(){
  if (MF.ui._thumbRenderer) return true;
  if (typeof THREE === 'undefined') return false;
  try {
    var canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true
    });
    renderer.setSize(200, 200, false);
    renderer.setPixelRatio(1.4);
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (THREE.ACESFilmicToneMapping !== undefined){
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    }
    var scene = new THREE.Scene();
    scene.background = null;
    // Cinematic lighting (matches main scene)
    scene.add(new THREE.AmbientLight(0x9098b8, 0.55));
    var key = new THREE.DirectionalLight(0xfff2d8, 1.4);
    key.position.set(3, 5, 4); scene.add(key);
    var fill = new THREE.DirectionalLight(0x88a8ff, 0.5);
    fill.position.set(-3, 3, -2); scene.add(fill);
    var rim = new THREE.DirectionalLight(0xff80c8, 0.6);
    rim.position.set(0, 2, -5); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xc8e0ff, 0x402848, 0.4));

    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
    camera.position.set(2.4, 1.6, 3.2);
    camera.lookAt(0, 0.55, 0);

    MF.ui._thumbRenderer = renderer;
    MF.ui._thumbCanvas = canvas;
    MF.ui._thumbScene = scene;
    MF.ui._thumbCamera = camera;
    return true;
  } catch(e){
    console.warn('Thumbnail renderer init failed', e);
    return false;
  }
};

MF.ui._renderUnitImage = function(unitId, rank){
  rank = rank || 1;
  var key = 'u_' + unitId + '_' + rank;
  if (MF.ui._thumbCache[key]) return MF.ui._thumbCache[key];
  if (!MF.ui._thumbInit()) return null;
  if (!MF.UNITS[unitId]) return null;
  var scene = MF.ui._thumbScene;
  // Remove previous mesh
  if (MF.ui._thumbCurrent){
    scene.remove(MF.ui._thumbCurrent);
    MF._disposeMesh(MF.ui._thumbCurrent);
  }
  var mesh = MF.buildUnitMesh(unitId, rank);
  mesh.position.set(0, 0, 0);
  mesh.rotation.y = -0.32;
  scene.add(mesh);
  MF.ui._thumbCurrent = mesh;
  try {
    MF.ui._thumbRenderer.render(scene, MF.ui._thumbCamera);
    var url = MF.ui._thumbCanvas.toDataURL('image/png');
    MF.ui._thumbCache[key] = url;
    return url;
  } catch(e){
    return null;
  }
};

MF.ui._renderEnemyImage = function(enemyId){
  var key = 'e_' + enemyId;
  if (MF.ui._thumbCache[key]) return MF.ui._thumbCache[key];
  if (!MF.ui._thumbInit()) return null;
  var data = MF.getEnemy(enemyId);
  if (!data) return null;
  var scene = MF.ui._thumbScene;
  if (MF.ui._thumbCurrent){
    scene.remove(MF.ui._thumbCurrent);
    MF._disposeMesh(MF.ui._thumbCurrent);
  }
  var scale = (data.scale || 0.55) * (data.kind === 'boss' ? 0.7 : 1.1);  // shrink boss to fit
  var mesh = MF.buildEnemyMesh(data, scale);
  mesh.position.set(0, 0, 0);
  mesh.rotation.y = 0.5;
  scene.add(mesh);
  MF.ui._thumbCurrent = mesh;
  try {
    MF.ui._thumbRenderer.render(scene, MF.ui._thumbCamera);
    var url = MF.ui._thumbCanvas.toDataURL('image/png');
    MF.ui._thumbCache[key] = url;
    return url;
  } catch(e){
    return null;
  }
};

MF.ui._enemyHint = function(d){
  if (d.flying) return 'Volant — seules les unités à projectile aérien peuvent l\'atteindre.';
  if (d.kind === 'tank') return 'Lent et résistant. Fusionne tes héros pour percer son armure.';
  if (d.kind === 'elite') return 'Armure épaisse. Les Tesla et Mage gèrent bien.';
  if (d.kind === 'boss') return 'Boss de monde — gros HP, dégâts massifs sur la forteresse !';
  return 'Ennemi standard. Fonce vers ta forteresse en suivant le chemin.';
};

MF.ui.buildWorldGrid = function(){
  var grid = document.getElementById('mf-world-grid');
  grid.innerHTML = '';
  var allDone = true;
  for (var i = 0; i < MF.WORLDS.length; i++){
    var w = MF.WORLDS[i];
    var unlocked = MF.isWorldUnlocked(i);
    var prog = MF.state.progress[i] || {};
    var doneCount = 0;
    for (var k in prog){ if (prog[k] && prog[k].stars > 0) doneCount++; }
    if (doneCount < w.levelCount) allDone = false;
    var card = document.createElement('div');
    card.className = 'mf-world-card' + (unlocked ? '' : ' mf-locked');
    card.innerHTML = '<div class="mf-world-emoji">' + w.icon + '</div>'
                   + '<div class="mf-world-name">' + w.name + '</div>'
                   + '<div class="mf-world-prog">' + doneCount + '/' + w.levelCount + '</div>';
    if (unlocked){
      (function(idx){
        card.addEventListener('click', function(){
          MF.state.worldIdx = idx;
          MF.ui.showScreen('levels');
        });
      })(i);
    }
    grid.appendChild(card);
  }
  // "Au-delà" tile if all worlds done
  if (allDone){
    var meta = MF.state.meta || {};
    var beyondLvl = meta.beyondHighest || 0;
    var beyond = document.createElement('div');
    beyond.className = 'mf-world-card mf-world-beyond';
    beyond.innerHTML = '<div class="mf-world-emoji">🌌</div>'
                     + '<div class="mf-world-name">Au-delà</div>'
                     + '<div class="mf-world-prog">N° ' + (beyondLvl + 1) + '</div>';
    beyond.addEventListener('click', function(){ MF.startBeyond(beyondLvl + 1); });
    grid.appendChild(beyond);
  }
};

MF.ui.buildLevelGrid = function(){
  var w = MF.WORLDS[MF.state.worldIdx];
  document.getElementById('mf-level-world-name').textContent = w.icon + ' ' + w.name;
  var grid = document.getElementById('mf-level-grid');
  grid.innerHTML = '';
  for (var i = 1; i <= w.levelCount; i++){
    var unlocked = MF.isLevelUnlocked(MF.state.worldIdx, i);
    var prog = (MF.state.progress[MF.state.worldIdx] || {})[i];
    var done = prog && prog.stars > 0;
    var card = document.createElement('div');
    card.className = 'mf-level-card' + (unlocked ? '' : ' mf-locked') + (done ? ' mf-done' : '');
    card.innerHTML = '<div class="mf-level-num">' + i + '</div>'
                   + '<div class="mf-level-stars">' + (done ? '⭐'.repeat(prog.stars) : (unlocked ? '—' : '🔒')) + '</div>';
    if (unlocked){
      (function(idx){
        card.addEventListener('click', function(){ MF.startCampaign(MF.state.worldIdx, idx); });
      })(i);
    }
    grid.appendChild(card);
  }
};

MF.ui.openPause = function(){
  if (MF.state.screen !== 'play') return;
  MF.state.paused = true;
  MF.ui.showScreen('pause');
};

MF.ui.resume = function(){
  MF.state.paused = false;
  MF.ui.showScreen('play');
};

MF.ui.restart = function(){
  if (MF.state.mode === 'endless') MF.startEndless();
  else if (MF.state.mode === 'bossrush') MF.startBossRush();
  else if (MF.state.mode === 'chaos') MF.startChaos(MF.chaos.ultId || 'meteor');
  else MF.startCampaign(MF.state.worldIdx, MF.state.levelIdx);
};

MF.ui.quitToMenu = function(){
  MF.endRun(false);
  MF.ui.showScreen('menu');
};

MF.ui.nextLevel = function(){
  if (MF.state.mode === 'campaign'){
    var w = MF.WORLDS[MF.state.worldIdx];
    if (MF.state.levelIdx < w.levelCount){
      MF.startCampaign(MF.state.worldIdx, MF.state.levelIdx + 1);
      return;
    }
    // Next world
    if (MF.state.worldIdx < MF.WORLDS.length - 1 && MF.isWorldUnlocked(MF.state.worldIdx + 1)){
      MF.state.worldIdx++;
      MF.startCampaign(MF.state.worldIdx, 1);
      return;
    }
  }
  MF.ui.quitToMenu();
};

MF.ui.toggleSpeed = function(){
  MF.state.speed = MF.state.speed === 1 ? 2 : 1;
  document.getElementById('mf-speed-btn').textContent = MF.state.speed === 1 ? '⏩' : '⏪';
};

MF.ui.doSummon = function(kind){
  // Pacifist variant blocks towers
  if (kind === 'tower' && MF.run && MF.run.pacifist){
    MF.fx.showBanner('🕊 Variant Pacifiste : pas de tours', 'wave');
    return;
  }
  var costMult = MF.rl_summonCostMult ? MF.rl_summonCostMult() : 1;
  var cost = Math.round((kind === 'hero' ? MF.state.summonCost : MF.state.towerCost) * costMult);
  // Consumable: free_summon (only applies to heroes)
  var freeApplied = false;
  if (kind === 'hero' && MF.run && MF.run.freeSummon){
    cost = 0;
    freeApplied = true;
  }
  if (MF.state.gold < cost) {
    MF.fx.showBanner('💰 Pas assez d\'or', 'wave');
    return;
  }
  if (freeApplied) MF.run.freeSummon = false;
  // Pool comes from the active deck (or roguelike runtime deck)
  var pool;
  if (MF.run && MF.run.roguelike){
    pool = (kind === 'hero') ? (MF.run.roguelikeDeckH || []) : (MF.run.roguelikeDeckT || []);
    if (!pool.length){
      MF.fx.showBanner('🎲 Aucune carte ' + (kind === 'hero' ? 'héros' : 'tour') + ' débloquée', 'wave');
      return;
    }
  } else if (MF.deck_pool){
    pool = MF.deck_pool(kind);
  }
  if (!pool || !pool.length){
    pool = (kind === 'hero') ? MF.DECK_DEFAULTS.heroes : MF.DECK_DEFAULTS.towers;
  }
  var pick = pool[Math.floor(Math.random() * pool.length)];
  var cell = MF.findFreeCell();
  if (!cell){
    MF.fx.showBanner('🚫 Plus de place !', 'wave');
    return;
  }
  MF.state.gold -= cost;
  // Increase cost slightly each time
  // P14: gentler scaling so R5 is achievable
  // Cap at 60 gold; scale 1.04 + 0.5
  if (kind === 'hero') MF.state.summonCost = Math.min(60, Math.round(MF.state.summonCost * 1.04 + 0.5));
  else MF.state.towerCost = Math.round(MF.state.towerCost * 1.08 + 1);
  MF.state.summonsThisLevel++;
  var u = MF.spawnUnit(pick, 1, cell.c, cell.r);
  if (u){
    MF.fx.spawnRing(u.pos, MF.UNITS[pick].ranks[0].color, { scale: 2.5, life: 0.5 });
    MF.fx.spawnBurst(u.pos, MF.UNITS[pick].ranks[0].color, 14, { speed: 3 });
    if (MF.flashLight) MF.flashLight(u.pos, MF.UNITS[pick].ranks[0].color, 2, 5, 0.2);
    if (MF.fx.floatingDmg) MF.fx.floatingDmg(u.pos, '✨ ' + MF.UNITS[pick].name, 'gold');
    if (MF.audio && MF.audio.coin) MF.audio.coin();
    // P14b first-summon banner
    if (MF.firstrun_track) MF.firstrun_track(pick);
  } else {
    MF.fx.showBanner('🚫 Invocation échouée', 'wave');
  }
  MF.ui.update();
};

MF.ui.sellSelected = function(){
  var u = MF.input.selected;
  if (!u) return;
  var refund = Math.round(15 * u.rank * u.rank * 0.6);
  MF.state.gold += refund;
  MF.fx.floatingDmg(u.pos, '+' + refund + '💰', 'gold');
  MF.removeUnit(u);
  MF.input.selected = null;
  MF.ui.hideUnitInfo();
  MF.ui.update();
};

MF.ui.showUnitInfo = function(unit, screenX, screenY){
  var box = document.getElementById('mf-unit-info');
  var content = document.getElementById('mf-unit-info-content');
  var data = MF.UNITS[unit.id];
  var rdata = data.ranks[unit.rank - 1];
  // P14: show range circle on ground for selected unit
  MF.ui._showRangeCircle(unit);
  // Mastery info
  var masteryStr = '';
  if (MF.state.meta && MF.state.meta.mastery && MF.state.meta.mastery[unit.id]){
    var m = MF.state.meta.mastery[unit.id];
    masteryStr = '<div class="mf-ui-row"><span>🎓 Maîtrise</span><b>Lv ' + m.lvl + ' (+' + m.lvl + '% dmg)</b></div>';
  }
  // R5 ult info
  var r5Str = '';
  if (unit.rank >= 5 && MF.R5_ULTIMATES && MF.R5_ULTIMATES[unit.id]){
    var def = MF.R5_ULTIMATES[unit.id];
    var ready = MF.r5_canUse(unit);
    r5Str = '<div class="mf-ui-row" style="border-top:1px dashed rgba(170,140,235,.4);padding-top:5px;margin-top:4px"><span>' + def.icon + ' ' + def.name + '</span><b style="color:' + (ready ? '#90ff90' : '#888') + '">' + (ready ? '✓ Prêt' : Math.ceil(unit.r5UltCd || 0) + 's') + '</b></div>' +
             '<div style="font-size:.65rem;color:rgba(220,200,255,.7);margin-top:2px">' + def.desc + '</div>' +
             (ready ? '<button class="mf-btn mf-btn-primary" id="mf-r5-fire" style="width:100%;margin-top:4px;padding:5px;font-size:.78rem">☄ Activer R5</button>' : '');
  }
  content.innerHTML =
    '<div style="font-weight:bold;color:#ffd96a">' + data.icon + ' ' + data.name + ' <small style="opacity:.7">R' + unit.rank + '/5</small></div>' +
    '<div class="mf-ui-row"><span>Dégâts</span><b>' + rdata.dmg + '</b></div>' +
    '<div class="mf-ui-row"><span>Cadence</span><b>' + (data.attack.atkSpeed.toFixed(2)) + '/s</b></div>' +
    '<div class="mf-ui-row"><span>Portée</span><b>' + (data.attack.range.toFixed(1)) + '</b></div>' +
    masteryStr + r5Str +
    '<div style="font-size:.68rem;color:rgba(220,200,255,.65);margin-top:3px">' + (data.desc || '') + '</div>';
  box.classList.remove('mf-hidden');
  // Wire R5 fire button
  var r5b = document.getElementById('mf-r5-fire');
  if (r5b) r5b.addEventListener('click', function(){ if (MF.r5_use && MF.r5_use(unit)) MF.ui.hideUnitInfo(); });
  // Position near tap
  var w = box.offsetWidth, h = box.offsetHeight;
  var px = Math.max(8, Math.min(window.innerWidth - w - 8, screenX - w / 2));
  var py = Math.max(60, Math.min(window.innerHeight - h - 110, screenY - h - 30));
  box.style.left = px + 'px';
  box.style.top  = py + 'px';
};

MF.ui.hideUnitInfo = function(){
  var box = document.getElementById('mf-unit-info');
  box.classList.add('mf-hidden');
  MF.ui._hideRangeCircle();
};

MF.ui._showRangeCircle = function(unit){
  if (typeof THREE === 'undefined' || !MF.three || !MF.three.worldGroup) return;
  if (!MF.ui._rangeMesh){
    var mat = new THREE.MeshBasicMaterial({ color: 0x80c8ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 32), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    MF.three.worldGroup.add(ring);
    MF.ui._rangeMesh = ring;
  }
  var data = MF.UNITS[unit.id];
  var rdata = data.ranks[unit.rank - 1];
  var range = (data.attack && data.attack.range) || 3;
  range *= 1 + (unit.rank - 1) * 0.10;
  // Update geometry to match range
  MF.ui._rangeMesh.geometry.dispose();
  MF.ui._rangeMesh.geometry = new THREE.RingGeometry(range - 0.04, range, 48);
  MF.ui._rangeMesh.position.set(unit.pos.x, 0.06, unit.pos.z);
  MF.ui._rangeMesh.visible = true;
};

MF.ui._hideRangeCircle = function(){
  if (MF.ui._rangeMesh) MF.ui._rangeMesh.visible = false;
};

MF.ui.update = function(){
  document.getElementById('mf-fortress-hp').textContent = MF.state.fortressHP;
  document.getElementById('mf-gold').textContent = MF.state.gold;
  document.getElementById('mf-wave').textContent = MF.state.waveIdx;
  document.getElementById('mf-wave-max').textContent = MF.state.level ? MF.state.level.waveCount : '∞';
  document.getElementById('mf-summon-cost').textContent = MF.state.summonCost;
  document.getElementById('mf-tower-cost').textContent = MF.state.towerCost;

  var summonBtn = document.getElementById('mf-summon-btn');
  var towerBtn  = document.getElementById('mf-summon-tower-btn');
  summonBtn.disabled = MF.state.gold < MF.state.summonCost;
  towerBtn.disabled  = MF.state.gold < MF.state.towerCost;
  // P13: tower button hidden (no more towers in pool)
  towerBtn.style.display = 'none';
  summonBtn.style.display = '';
  var startBtn = document.getElementById('mf-start-wave-btn');
  // In chaos mode, the wave button is irrelevant (continuous spawn)
  if (MF.state.mode === 'chaos'){
    startBtn.style.display = 'none';
  } else {
    startBtn.style.display = '';
    startBtn.disabled = MF.waves.active || MF.state.outcome != null;
    if (!MF.waves.active && !MF.state.outcome) startBtn.classList.add('mf-pulse');
    else startBtn.classList.remove('mf-pulse');
  }

  // Chaos HUD update
  if (MF.state.mode === 'chaos' && MF.chaos.active){
    var tEl = document.getElementById('mf-chaos-time');
    var kEl = document.getElementById('mf-chaos-kills');
    var cEl = document.getElementById('mf-chaos-combo');
    var uBtn = document.getElementById('mf-chaos-ult-btn');
    if (tEl) tEl.textContent = MF.chaos_fmtTime(MF.chaos.time);
    if (kEl) kEl.querySelector('b').textContent = MF.chaos.kills;
    if (cEl){
      if (MF.chaos.combo >= 5){
        cEl.classList.remove('mf-hidden');
        cEl.querySelector('b').textContent = 'x' + MF.chaos.combo;
      } else cEl.classList.add('mf-hidden');
    }
    if (uBtn && MF.chaos.ultData){
      var pct = Math.floor(MF.chaos.ultCharge * 100);
      uBtn.querySelector('.mf-ult-ico').textContent = MF.chaos.ultData.icon;
      uBtn.querySelector('.mf-ult-pct').textContent = pct + '%';
      if (pct >= 100) uBtn.classList.add('mf-ult-ready');
      else uBtn.classList.remove('mf-ult-ready');
      uBtn.disabled = pct < 100;
    }
  }
};

MF.ui.showEnd = function(won){
  MF.ui.showScreen('end');
  document.getElementById('mf-end-title').textContent = won ? '🏆 Victoire !' : '💀 Défaite';
  // Victory confetti
  if (won && MF.ui._spawnConfetti) MF.ui._spawnConfetti();
  if (MF.voice_event) MF.voice_event(won ? 'victory' : 'defeat');
  var msg = won
    ? ('Vague ' + MF.state.waveIdx + ' sur ' + (MF.state.level ? MF.state.level.waveCount : '∞') + ' nettoyée. Forteresse intacte !')
    : ('Ta forteresse est tombée à la vague ' + MF.state.waveIdx + '. Réessaye !');
  document.getElementById('mf-end-message').textContent = msg;

  var rewards = document.getElementById('mf-end-rewards');
  rewards.innerHTML = '';
  if (won && MF.state.level && MF.state.level.rewardGold){
    rewards.innerHTML += '<div>💰 +' + MF.state.level.rewardGold + ' or de récompense</div>';
    rewards.innerHTML += '<div>⭐ ' + (MF.state.level.rewardStars || 1) + ' étoile(s)</div>';
  }
  if (MF.state.mode === 'endless'){
    rewards.innerHTML += '<div>🔥 Meilleure vague: ' + MF.state.endlessBest + '</div>';
  }
  if (MF.state.mode === 'chaos' && MF.chaos){
    var bestT = (MF.state.meta && MF.state.meta.chaosBestTime) || 0;
    rewards.innerHTML += '<div style="color:#ff80c0;font-size:.95rem">🌪️ Survécu: <b>' + MF.chaos_fmtTime(MF.chaos.time) + '</b></div>';
    rewards.innerHTML += '<div>💀 Kills: <b>' + MF.chaos.kills + '</b></div>';
    if (MF.chaos.bossesSpawned > 0) rewards.innerHTML += '<div>👹 Boss: <b>' + MF.chaos.bossesSpawned + '</b></div>';
    if (MF.chaos.lastRank > 0){
      rewards.innerHTML += '<div style="color:#ffd96a;font-size:.95rem;margin-top:4px">🏆 Top ' + MF.chaos.lastRank + ' personnel !</div>';
    }
    rewards.innerHTML += '<div style="font-size:.75rem;color:rgba(220,200,255,.6);margin-top:4px">Record: ' + MF.chaos_fmtTime(bestT) + '</div>';
    // Detailed stats panel
    if (MF.chaos.stats){
      var s = MF.chaos.stats;
      rewards.innerHTML += MF.ui._buildChaosStatsHTML(s, MF.chaos.time);
    }
    // Heatmap canvas
    if (MF.chaos._heatmap && MF.chaos._heatmap.length){
      rewards.innerHTML += '<div class="mf-stats-section"><div class="mf-stats-section-title">🔥 Heatmap des kills</div><canvas id="mf-heatmap-canvas" class="mf-heatmap-canvas" width="280" height="220"></canvas></div>';
      setTimeout(function(){
        var c = document.getElementById('mf-heatmap-canvas');
        if (c && MF.heatmap_drawTo) MF.heatmap_drawTo(c);
      }, 0);
    }
    // Share code: regenerate seed from current run params
    var seedForCode = MF.chaos.seed || (Date.now() % 100000);
    var code = 'MF-' + seedForCode + '-' + MF.chaos.ultId + '-' + (MF.chaos.variant || 'normal');
    rewards.innerHTML += '<div class="mf-share-row"><span class="mf-share-label">🔗 Partager :</span><code class="mf-share-code">' + code + '</code><button class="mf-btn" id="mf-copy-code" style="font-size:.7rem;padding:4px 8px">📋 Copier</button></div>';
    setTimeout(function(){
      var cb = document.getElementById('mf-copy-code');
      if (cb) cb.addEventListener('click', function(){
        try {
          if (navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(code);
          } else {
            var ta = document.createElement('textarea');
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          cb.textContent = '✓ Copié';
        } catch(e){ cb.textContent = '✕ Erreur'; }
      });
    }, 0);
    // Mini leaderboard
    var lb = (MF.state.meta && MF.state.meta.chaosLeaderboard) || [];
    if (lb.length){
      var lbHtml = '<div class="mf-mini-lb"><div class="mf-mini-lb-title">🏆 Tes meilleurs runs</div>';
      for (var li = 0; li < lb.length; li++){
        var r = lb[li];
        var ult = (MF.ULTIMATES && MF.ULTIMATES[r.ult]) ? MF.ULTIMATES[r.ult].icon : '';
        var hl = (r === MF.chaos.lastEntry) ? ' style="color:#ffd96a;font-weight:bold"' : '';
        lbHtml += '<div class="mf-mini-lb-row"' + hl + '><span>#' + (li + 1) + '</span><span>' + ult + ' ' + MF.chaos_fmtTime(r.time) + '</span><span>💀' + r.kills + '</span></div>';
      }
      lbHtml += '</div>';
      rewards.innerHTML += lbHtml;
    }
  }
  if (MF.state.lastFragmentsEarned){
    rewards.innerHTML += '<div class="mf-frag-anim" style="color:#c070ff;font-size:1.4rem;font-weight:bold">💎 +' + MF.state.lastFragmentsEarned + ' fragments</div>';
  }
  rewards.innerHTML += '<div style="font-size:.78rem;color:rgba(220,200,255,.6);margin-top:6px">Ennemis vaincus: ' + MF.state.killsThisLevel + '</div>';

  // Hide "next" if last level / chaos / endless / bossrush
  var next = document.getElementById('mf-end-next-btn');
  if (won && MF.state.mode === 'campaign') next.style.display = '';
  else                                      next.style.display = 'none';
};
