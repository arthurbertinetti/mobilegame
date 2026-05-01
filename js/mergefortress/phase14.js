// === Merge Fortress TD — Phase 14: Pacte, Boss customs, Map layouts, Tutorial avancé ===
window.MF = window.MF || {};

// =====================================================================
// === PACTES — Choisis 1 malus pour ×2 fragments ===
// =====================================================================
MF.PACTES = [
  { id:'half_hp',     icon:'💔', name:'Pacte du Sang',    desc:'-50% PV forteresse max',          flag:{ fortressHpMult: 0.5 },     fragMult: 2.0 },
  { id:'no_summon',   icon:'🔒', name:'Pacte Solo',       desc:'Coût invocation ×3',              flag:{ summonCostX: 3 },          fragMult: 2.5 },
  { id:'enemy_speed', icon:'💨', name:'Pacte de Course',  desc:'Ennemis +50% vitesse',            flag:{ enemySpdX: 1.5 },          fragMult: 1.8 },
  { id:'enemy_hp',    icon:'🛡', name:'Pacte de Fer',     desc:'Ennemis +50% PV',                 flag:{ enemyHpX: 1.5 },           fragMult: 1.8 },
  { id:'no_relic',    icon:'📜', name:'Pacte Mendiant',   desc:'Reliques désactivées',            flag:{ noRelics: true },          fragMult: 2.0 },
  { id:'one_role',    icon:'🎭', name:'Pacte Spécialiste',desc:'1 seul rôle dans la pool',        flag:{ singleRole: true },        fragMult: 2.2 },
  { id:'no_skill',    icon:'⚔', name:'Pacte du Néophyte', desc:'Talents désactivés',              flag:{ noTalents: true },         fragMult: 2.5 }
];

MF.pacte_apply = function(pacteId){
  if (!pacteId) return;
  var p = MF.PACTES.find(function(x){ return x.id === pacteId; });
  if (!p) return;
  MF.run = MF.run || {};
  MF.run.activePacte = pacteId;
  MF.run.pacteFragMult = p.fragMult || 1;
  if (p.flag){
    Object.keys(p.flag).forEach(function(k){
      if (k === 'fortressHpMult'){
        MF.state.fortressMaxHP = Math.round(MF.state.fortressMaxHP * p.flag[k]);
        MF.state.fortressHP = MF.state.fortressMaxHP;
      } else if (k === 'summonCostX'){
        MF.state.summonCost = Math.round(MF.state.summonCost * p.flag[k]);
      } else if (k === 'enemySpdX'){
        MF.run.enemySpdMult = (MF.run.enemySpdMult || 1) * p.flag[k];
      } else if (k === 'enemyHpX'){
        MF.run.enemyHpMult = (MF.run.enemyHpMult || 1) * p.flag[k];
      } else if (k === 'noRelics'){
        MF.run.relicsDisabled = true;
      } else if (k === 'singleRole'){
        // Filter active deck to a single random role
        var meta = MF.state.meta;
        if (meta && meta.activeDeck){
          var roles = ['striker','shooter','mage','support','specialist'];
          var pickRole = roles[Math.floor(Math.random() * roles.length)];
          var filtered = meta.activeDeck.heroes.filter(function(uid){
            return MF.UNITS[uid] && MF.UNITS[uid].role === pickRole;
          });
          if (filtered.length){
            MF.run.tempDeckOverride = filtered;
          }
        }
      } else if (k === 'noTalents'){
        MF.run.talentsDisabled = true;
      }
    });
  }
  if (MF.notify_push) MF.notify_push('🤝 Pacte actif : ' + p.icon + ' ' + p.name + ' — ×' + p.fragMult + ' fragments', 'info');
};

// =====================================================================
// === BOSS CUSTOMS — random modifiers per chaos boss ===
// =====================================================================
MF.BOSS_MODIFIERS = [
  { id:'fire_resist',   icon:'🔥', name:'Résistance Feu',    apply:function(b){ b.fireResist = 0.7; } },
  { id:'frost_resist',  icon:'❄', name:'Résistance Glace',   apply:function(b){ b.frostResist = 0.7; } },
  { id:'regen',         icon:'💚', name:'Régénération',      apply:function(b){ b.regenPerSec = b.maxHp * 0.02; } },
  { id:'doubleshell',   icon:'🛡', name:'Double Coque',      apply:function(b){ b.armor = (b.armor || 0) + 0.30; } },
  { id:'antielite',     icon:'⚡', name:'Anti-Élite',        apply:function(b){ b.antiR3Bonus = 1.5; } },
  { id:'thorns',        icon:'🌵', name:'Épines',            apply:function(b){ b.thorns = 0.10; } },
  { id:'fast',          icon:'💨', name:'Rapide',            apply:function(b){ b.baseSpeed *= 1.4; b.speed *= 1.4; } },
  { id:'tank',          icon:'🪨', name:'Colossal',          apply:function(b){ b.maxHp *= 1.5; b.hp *= 1.5; } }
];

MF.bosscustom_apply = function(boss){
  if (!boss || !boss.isBoss) return;
  // Pick 1-2 random modifiers
  var pool = MF.BOSS_MODIFIERS.slice();
  pool.sort(function(){ return Math.random() - 0.5; });
  var n = 1 + (Math.random() < 0.4 ? 1 : 0);
  boss.customMods = [];
  for (var i = 0; i < n; i++){
    var mod = pool[i];
    if (!mod) break;
    mod.apply(boss);
    boss.customMods.push(mod);
  }
  // Banner
  if (MF.fx && MF.fx.showBanner && boss.customMods.length){
    var txt = boss.customMods.map(function(m){ return m.icon + ' ' + m.name; }).join(' · ');
    setTimeout(function(){ MF.fx.showBanner('💀 BOSS — ' + txt, 'boss'); }, 600);
  }
};

// Tick boss regen / handle resists
MF.bosscustom_tick = function(dt){
  if (!MF.enemies) return;
  for (var i = 0; i < MF.enemies.length; i++){
    var e = MF.enemies[i];
    if (!e || !e.alive || !e.isBoss) continue;
    if (e.regenPerSec && e.hp < e.maxHp){
      e.hp = Math.min(e.maxHp, e.hp + e.regenPerSec * dt);
      // Update HP bar
      var hpFg = e.mesh && e.mesh.userData && e.mesh.userData.hpFg;
      if (hpFg){
        var pct = e.hp / e.maxHp;
        hpFg.scale.x = pct;
        hpFg.position.x = -(1 - pct) * (e.mesh.userData.hpFgWidth || 0.66) / 2;
      }
    }
  }
};

// Apply resist when damage is dealt to bosses
MF.bosscustom_modifyDamage = function(enemy, damage, kind){
  if (!enemy || !enemy.isBoss) return damage;
  if (kind === 'fire' && enemy.fireResist) return damage * (1 - enemy.fireResist);
  if (kind === 'frost' && enemy.frostResist) return damage * (1 - enemy.frostResist);
  return damage;
};

// =====================================================================
// === MAP LAYOUTS — alternate path waypoints ===
// =====================================================================
// Each layout must:
//  - START at column 0 (entry portal)
//  - END at column GRID_COLS-1 (fortress side)
//  - Stay within rows 0..GRID_ROWS-1, cols 0..GRID_COLS-1 (default 7×6)
//  - Leave at least 1 row entirely free for hero placement
MF.PATH_LAYOUTS = {
  zigzag: {  // default existing
    name:'Zigzag',
    waypoints: [
      { c: 0, r: 1 }, { c: 6, r: 1 }, { c: 6, r: 3 },
      { c: 0, r: 3 }, { c: 0, r: 5 }, { c: 6, r: 5 }
    ]
  },
  s_shape: {
    name:'S',
    waypoints: [
      { c: 0, r: 1 }, { c: 6, r: 1 }, { c: 6, r: 3 },
      { c: 0, r: 3 }, { c: 0, r: 4 }, { c: 6, r: 4 }
    ]
  },
  straight: {
    name:'Direct',
    waypoints: [
      { c: 0, r: 2 }, { c: 6, r: 2 },
      { c: 6, r: 4 }, { c: 0, r: 4 }
    ]
  }
};

MF.path_pickLayout = function(worldIdx, levelIdx){
  // P14: temporarily force zigzag while we debug invisible-heroes regression
  return 'zigzag';
};

MF.path_applyLayout = function(layoutId){
  var layout = MF.PATH_LAYOUTS[layoutId];
  if (!layout) return;
  // Validate: clamp waypoints to grid bounds
  var cols = MF.GRID_COLS || 7;
  var rows = MF.GRID_ROWS || 6;
  var safe = layout.waypoints.map(function(w){
    return {
      c: Math.max(0, Math.min(cols - 1, w.c)),
      r: Math.max(0, Math.min(rows - 1, w.r))
    };
  });
  MF.PATH_WAYPOINTS = safe;
};

// =====================================================================
// === TUTORIAL AVANCÉ ===
// =====================================================================
MF.ADVANCED_TUTORIAL_STEPS = [
  { ico:'🌟', title:'Hybrides légendaires', text:'À <b>rang 5</b>, deux héros compatibles peuvent fusionner en <b>hybride unique</b> (ex: Knight + Dragon = Paladin Dragon).' },
  { ico:'🧩', title:'Synergies d\'équipe', text:'Avoir <b>3 héros différents</b> donne +10% dmg équipe. Avoir <b>4 héros identiques</b> donne +20% atk-speed.' },
  { ico:'☄', title:'Ultimes R5 manuels', text:'Chaque héros R5 a une <b>capacité ultime activable</b>. Tap le héros R5 → bouton "☄ Activer R5" dans la fiche.' },
  { ico:'🎨', title:'Skins avec stats', text:'Achète des skins dans la fiche héros — ils donnent un <b>bonus de stats</b> en plus du visuel.' },
  { ico:'🌳', title:'Constellations talents', text:'Investis tes fragments dans 4 constellations (DPS/Tank/Mage/Eco). Les talents activables <b>pulsent</b> avec un badge vert.' },
  { ico:'🤝', title:'Pactes (avancé)', text:'Avant un run, tu peux accepter un <b>Pacte</b> (malus) pour gagner ×1.8-2.5 fragments. Risque vs récompense.' },
  { ico:'🎯', title:'Défis quotidiens', text:'Quêtes journalières + objectif du jour + roue de la fortune — fais-les chaque jour pour engranger un max de fragments.' }
];

MF.advtut_show = function(){
  if (!MF.state.meta) return;
  var tutEl = document.getElementById('mf-chaos-tutorial');
  var tutNext = document.getElementById('mf-tut-next');
  var tutSkip = document.getElementById('mf-tut-skip');
  if (!tutEl || !tutNext || !tutSkip){
    if (MF.notify_push) MF.notify_push('Tutoriel indisponible (DOM)', 'info');
    return;
  }
  MF.state.meta.advTutDone = false;
  MF.ui._tutSteps_active = MF.ADVANCED_TUTORIAL_STEPS;
  MF.ui._tutIdx = 0;
  MF.state.paused = true;
  if (MF.ui._renderTutStep) MF.ui._renderTutStep();
  tutEl.classList.remove('mf-hidden');
  if (!MF.ui._tutWired){
    MF.ui._tutWired = true;
    tutNext.addEventListener('click', MF.ui._tutNext);
    tutSkip.addEventListener('click', MF.ui._tutFinish);
  }
};
