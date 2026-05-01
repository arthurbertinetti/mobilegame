// === Merge Fortress TD — Phase 8 extras: intro, codex, wheel, crafting, synergies, boss mechanics, etc. ===
window.MF = window.MF || {};

// =====================================================================
// === INTRO narrative (first launch) ===
// =====================================================================
MF.INTRO_LINES = [
  '🏰 Au cœur d\'un monde fissuré, une dernière forteresse se dresse...',
  '⚔ Tu es son roi. Invoque des héros pour la défendre.',
  '🌟 Fusionne tes unités identiques pour atteindre des rangs légendaires.',
  '🧬 Découvre des unités hybrides aux pouvoirs uniques.',
  '💎 Collecte des fragments pour débloquer des skins et bonus cosmétiques.',
  '👑 Affronte les rois ennemis, brave les vagues infinies, embrasse le chaos.',
  '✨ Chaque run te rend plus fort. Place tes pions. La bataille commence.',
  '🔥 Es-tu prêt à fusionner ta destinée ?',
  '🎮 Bonne chance, roi de la forteresse !'
];

MF.intro_show = function(){
  if (MF.state.meta && MF.state.meta.introSeen) return false;
  var screen = document.getElementById('mf-intro');
  var line = document.getElementById('mf-intro-line');
  var skip = document.getElementById('mf-intro-skip');
  var cont = document.getElementById('mf-intro-continue');
  if (!screen || !line) return false;
  screen.classList.remove('mf-hidden');
  var idx = 0;
  var showNext = function(){
    if (idx >= MF.INTRO_LINES.length){ MF.intro_finish(); return; }
    line.style.opacity = '0';
    setTimeout(function(){
      line.textContent = MF.INTRO_LINES[idx];
      line.style.opacity = '1';
      idx++;
      if (idx >= MF.INTRO_LINES.length){
        cont.classList.remove('mf-hidden');
      } else {
        setTimeout(showNext, 2400);
      }
    }, 380);
  };
  showNext();
  skip.onclick = MF.intro_finish;
  cont.onclick = MF.intro_finish;
  return true;
};

MF.intro_finish = function(){
  var screen = document.getElementById('mf-intro');
  if (screen) screen.classList.add('mf-hidden');
  var cont = document.getElementById('mf-intro-continue');
  if (cont) cont.classList.add('mf-hidden');
  if (MF.state.meta){
    MF.state.meta.introSeen = true;
    MF.saveProgress();
  }
};

// =====================================================================
// === CODEX (lore par héros + boss, déblocage progressif) ===
// =====================================================================
MF.CODEX = {
  // Heroes
  knight: {
    type:'hero', icon:'🛡️', title:'Le Chevalier',
    lore:'Forgé dans les batailles de l\'ancien royaume, le Chevalier porte sur lui les marques de mille victoires. Sa résistance n\'a d\'égale que sa loyauté à la forteresse.',
    unlock:{ kind:'kills_with', target:'knight', count:50 }
  },
  archer: {
    type:'hero', icon:'🏹', title:'L\'Archer',
    lore:'Veilleur des cimes, l\'Archer voit l\'horizon où les autres voient les ombres. Ses flèches transpercent même les hordes les plus denses.',
    unlock:{ kind:'kills_with', target:'archer', count:50 }
  },
  mage: {
    type:'hero', icon:'🔮', title:'Le Mage',
    lore:'Étudiant des forces interdites, il manie l\'éther brut. Chaque sort qu\'il lance fissure un peu plus le voile entre les mondes.',
    unlock:{ kind:'kills_with', target:'mage', count:50 }
  },
  ice: {
    type:'hero', icon:'❄', title:'La Sorcière de Glace',
    lore:'Née d\'un hiver qui n\'a jamais fini, elle gèle les âmes avant que leurs corps ne tombent.',
    unlock:{ kind:'kills_with', target:'ice', count:30 }
  },
  bomb: {
    type:'hero', icon:'💣', title:'Le Bombardier',
    lore:'Ancien mineur des terres calcinées, il a remplacé son pic par des charges. Là où il passe, rien ne reste.',
    unlock:{ kind:'kills_with', target:'bomb', count:30 }
  },
  dragon: {
    type:'hero', icon:'🐉', title:'Le Drakanide',
    lore:'Hybride entre l\'homme et le dragon, il porte en lui le souffle des cieux. Les ennemis fuient son ombre projetée.',
    unlock:{ kind:'kills_with', target:'dragon', count:80 }
  },
  // Bosses
  goblin_king: {
    type:'boss', icon:'👑', title:'Roi Gobelin',
    lore:'Tyran des cavernes inférieures, il commande les hordes vertes par la peur et la promesse de butin.',
    unlock:{ kind:'boss_kills', target:'goblin_king', count:1 }
  },
  bone_lord: {
    type:'boss', icon:'💀', title:'Seigneur des Os',
    lore:'Ancien général déchu, il marche encore. Son armure rouille mais son commandement perdure.',
    unlock:{ kind:'boss_kills', target:'bone_lord', count:1 }
  },
  warlord: {
    type:'boss', icon:'⚔', title:'Seigneur de Guerre',
    lore:'Né dans la sueur et le fer. Il n\'a jamais perdu une bataille — sauf peut-être la dernière.',
    unlock:{ kind:'boss_kills', target:'warlord', count:1 }
  },
  hydra: {
    type:'boss', icon:'🐍', title:'Hydre',
    lore:'Bête à têtes multiples des marais oubliés. Couper l\'une fait surgir deux autres.',
    unlock:{ kind:'boss_kills', target:'hydra', count:1 }
  },
  lich: {
    type:'boss', icon:'🪦', title:'Liche',
    lore:'Mage qui a sacrifié sa chair pour l\'éternité. Il ne peut plus mourir — seulement être brisé.',
    unlock:{ kind:'boss_kills', target:'lich', count:1 }
  },
  dragon_king: {
    type:'boss', icon:'🐲', title:'Roi Dragon',
    lore:'Il dort depuis des âges au sommet du monde. Quand il s\'éveille, le ciel brûle.',
    unlock:{ kind:'boss_kills', target:'dragon_king', count:1 }
  }
};

MF.codex_isUnlocked = function(id){
  if (!MF.state.meta || !MF.CODEX[id]) return false;
  var u = MF.CODEX[id].unlock;
  var meta = MF.state.meta;
  meta.killStats = meta.killStats || { byUnit: {}, bossKills: {} };
  if (u.kind === 'kills_with'){
    return (meta.killStats.byUnit[u.target] || 0) >= u.count;
  }
  if (u.kind === 'boss_kills'){
    return (meta.killStats.bossKills[u.target] || 0) >= u.count;
  }
  return false;
};

// =====================================================================
// === HYBRID MEMORY CARD (1ère découverte) ===
// =====================================================================
MF.HYBRID_FLAVOR = {
  flame_ranger:   '« Quand l\'arc rencontre la braise, chaque flèche devient un présage de cendres. »',
  storm_sage:     '« La glace foudroyée — un cri silencieux dans la tempête. »',
  dragon_paladin: '« L\'épée et l\'écaille ne font qu\'un. Le serment a un souffle. »',
  frost_archer:   '« Une flèche de cristal n\'a pas de bruit, mais sa cible le sait. »',
  arcane_knight:  '« Lame qui vibre d\'éther — chaque coup ouvre une faille. »',
  inferno_lord:   '« Le ciel s\'embrase. La terre tremble. Lui, il rit. »'
};

MF.hybrid_showCard = function(hybridId){
  var h = MF.HYBRIDS && MF.HYBRIDS[hybridId];
  if (!h) return;
  var modal = document.getElementById('mf-hybrid-modal');
  var nameEl = document.getElementById('mf-hcard-name');
  var flavorEl = document.getElementById('mf-hcard-flavor');
  if (!modal) return;
  modal.classList.remove('mf-hidden');
  nameEl.textContent = h.icon + '  ' + h.name;
  flavorEl.textContent = MF.HYBRID_FLAVOR[hybridId] || h.desc || '';
  if (MF.audio && MF.audio.achievement) MF.audio.achievement();
  // Build mini 3D preview
  MF.hybrid_buildPreview(hybridId);
  // P14: robust close handler — also resets paused as safety
  var closeBtn = document.getElementById('mf-hcard-close');
  if (closeBtn){
    closeBtn.onclick = function(e){
      if (e) e.stopPropagation();
      modal.classList.add('mf-hidden');
      MF.state.paused = false;
      if (MF.hybrid_disposePreview) MF.hybrid_disposePreview();
    };
  }
  // Click outside the card → close too
  modal.onclick = function(e){
    if (e.target === modal){
      modal.classList.add('mf-hidden');
      MF.state.paused = false;
      if (MF.hybrid_disposePreview) MF.hybrid_disposePreview();
    }
  };
  // Safety auto-close after 30s
  setTimeout(function(){
    if (modal && !modal.classList.contains('mf-hidden')){
      modal.classList.add('mf-hidden');
      MF.state.paused = false;
      if (MF.hybrid_disposePreview) MF.hybrid_disposePreview();
    }
  }, 30000);
};

MF.hybrid_buildPreview = function(hybridId){
  var canvas = document.getElementById('mf-hcard-preview');
  if (!canvas || typeof THREE === 'undefined') return;
  if (MF.hybrid_disposePreview) MF.hybrid_disposePreview();
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth || 240, canvas.clientHeight || 240, false);
  renderer.setPixelRatio(1.5);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 1.6, 4);
  camera.lookAt(0, 0.6, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404060, 0.7));
  var key = new THREE.DirectionalLight(0xffd96a, 1.4);
  key.position.set(2, 4, 3);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xa080ff, 0.6);
  fill.position.set(-3, 2, -2);
  scene.add(fill);
  var mesh = MF.buildUnitMesh(hybridId, 1);
  scene.add(mesh);
  MF._hybridPreview = { renderer: renderer, scene: scene, camera: camera, mesh: mesh, t0: performance.now()/1000, lastT: performance.now()/1000 };
  var loop = function(){
    if (!MF._hybridPreview) return;
    var now = performance.now()/1000;
    var dt = now - MF._hybridPreview.lastT;
    MF._hybridPreview.lastT = now;
    MF._hybridPreview.mesh.rotation.y += dt * 0.7;
    MF._hybridPreview.mesh.position.y = 0.5 + Math.sin(now * 1.5) * 0.05;
    MF._hybridPreview.renderer.render(MF._hybridPreview.scene, MF._hybridPreview.camera);
    MF._hybridPreview.raf = requestAnimationFrame(loop);
  };
  MF._hybridPreview.raf = requestAnimationFrame(loop);
};

MF.hybrid_disposePreview = function(){
  if (!MF._hybridPreview) return;
  if (MF._hybridPreview.raf) cancelAnimationFrame(MF._hybridPreview.raf);
  if (MF._disposeMesh) MF._disposeMesh(MF._hybridPreview.mesh);
  MF._hybridPreview.renderer.dispose();
  MF._hybridPreview = null;
};

// =====================================================================
// === HERO SYNERGIES (HUD bonus) ===
// =====================================================================
MF.synergies_compute = function(){
  if (!MF.units || !MF.units.length) return { dmg: 1, atkSpeed: 1, label: '' };
  var seen = {};
  var counts = {};
  MF.units.forEach(function(u){
    if (!u || !MF.UNITS[u.id]) return;
    if (MF.UNITS[u.id].kind !== 'hero') return;
    seen[u.id] = (seen[u.id] || 0) + 1;
    counts[u.id] = seen[u.id];
  });
  var unique = Object.keys(seen).length;
  var maxSame = 0;
  Object.keys(counts).forEach(function(k){ if (counts[k] > maxSame) maxSame = counts[k]; });
  var dmg = 1, atkSpeed = 1, label = [];
  if (unique >= 3){ dmg *= 1.10; label.push('🌈 Diversifié +10% dmg'); }
  if (maxSame >= 4){ atkSpeed *= 1.20; label.push('⚔ Escouade ×' + maxSame + ' +20% atk-spd'); }
  return { dmg: dmg, atkSpeed: atkSpeed, label: label.join(' · ') };
};

MF.synergies_update = function(){
  if (!MF.run) MF.run = {};
  if (MF.run.solo){ MF.run.synergyDmgMult = 1; MF.run.synergyAtkSpeed = 1; var hud0 = document.getElementById('mf-synergy-badge'); if (hud0) hud0.classList.add('mf-hidden'); return; }
  var s = MF.synergies_compute();
  MF.run.synergyDmgMult = s.dmg;
  MF.run.synergyAtkSpeed = s.atkSpeed;
  var hud = document.getElementById('mf-synergy-badge');
  if (hud){
    if (s.label){
      hud.classList.remove('mf-hidden');
      hud.textContent = s.label;
    } else {
      hud.classList.add('mf-hidden');
    }
  }
};

// =====================================================================
// === DAILY WHEEL OF FORTUNE ===
// =====================================================================
MF.WHEEL_SEGMENTS = [
  { label:'+10 💎',   reward:{ type:'fragments', amount:10 },   color:'#9adc6c', weight:25 },
  { label:'+30 💎',   reward:{ type:'fragments', amount:30 },   color:'#80c8ff', weight:18 },
  { label:'+100 💎',  reward:{ type:'fragments', amount:100 },  color:'#c070ff', weight:8  },
  { label:'🧪 Conso', reward:{ type:'consumable' },              color:'#ff9050', weight:15 },
  { label:'🎨 Skin',  reward:{ type:'random_skin' },             color:'#ff80c0', weight:6  },
  { label:'2× run',   reward:{ type:'flag', flag:'doubleNextRun' }, color:'#ffd96a', weight:8 },
  { label:'Rien',     reward:{ type:'nothing' },                 color:'#555',     weight:15 },
  { label:'🎰 Jackpot 300 💎', reward:{ type:'fragments', amount:300 }, color:'#ff5050', weight:5 }
];

MF.wheel_canSpin = function(){
  if (!MF.state.meta) return true;
  var meta = MF.state.meta;
  var today = MF.daily_today ? MF.daily_today() : new Date().toDateString();
  return meta.lastWheelDay !== today;
};

MF.wheel_spin = function(onResult){
  if (!MF.wheel_canSpin()){
    if (MF.fx) MF.fx.showBanner('🎰 Reviens demain !', 'wave');
    return false;
  }
  // Weighted random
  var total = 0;
  MF.WHEEL_SEGMENTS.forEach(function(s){ total += s.weight; });
  var roll = Math.random() * total;
  var pickIdx = 0;
  for (var i = 0; i < MF.WHEEL_SEGMENTS.length; i++){
    roll -= MF.WHEEL_SEGMENTS[i].weight;
    if (roll <= 0){ pickIdx = i; break; }
  }
  var meta = MF.state.meta || {};
  meta.lastWheelDay = MF.daily_today ? MF.daily_today() : new Date().toDateString();
  // Animate canvas spin
  MF.wheel_animate(pickIdx, function(){
    var seg = MF.WHEEL_SEGMENTS[pickIdx];
    MF.wheel_applyReward(seg.reward);
    MF.saveProgress();
    if (onResult) onResult(seg);
  });
  return true;
};

MF.wheel_applyReward = function(rew){
  var meta = MF.state.meta || {};
  if (rew.type === 'fragments'){
    meta.fragments = (meta.fragments || 0) + rew.amount;
  } else if (rew.type === 'consumable'){
    var ids = MF.SHOP_ITEMS ? Object.keys(MF.SHOP_ITEMS) : [];
    if (ids.length){
      var pick = ids[Math.floor(Math.random() * ids.length)];
      meta.consumables = meta.consumables || {};
      meta.consumables[pick] = (meta.consumables[pick] || 0) + 1;
    }
  } else if (rew.type === 'random_skin'){
    if (MF.SKINS && MF.UNITS){
      var heroes = Object.keys(MF.UNITS).filter(function(uid){
        var u = MF.UNITS[uid];
        return u && u.kind === 'hero' && !u.isHybrid && u.summonable !== false;
      });
      var skinPool = Object.keys(MF.SKINS).filter(function(sid){ return sid !== 'default' && !MF.SKINS[sid].legendary; });
      meta.unlockedSkins = meta.unlockedSkins || {};
      var attempts = 0, found = false;
      while (attempts < 20 && !found){
        var hid = heroes[Math.floor(Math.random() * heroes.length)];
        var sid = skinPool[Math.floor(Math.random() * skinPool.length)];
        meta.unlockedSkins[hid] = meta.unlockedSkins[hid] || ['default'];
        if (meta.unlockedSkins[hid].indexOf(sid) < 0){
          meta.unlockedSkins[hid].push(sid);
          found = true;
        }
        attempts++;
      }
    }
  } else if (rew.type === 'flag' && rew.flag === 'doubleNextRun'){
    meta.doubleNextRun = true;
  }
  // 'nothing' is no-op
};

MF.wheel_animate = function(targetIdx, done){
  var canvas = document.getElementById('mf-wheel-canvas');
  if (!canvas){ if (done) done(); return; }
  var ctx = canvas.getContext('2d');
  var segs = MF.WHEEL_SEGMENTS;
  var n = segs.length;
  var arc = (Math.PI * 2) / n;
  var pointerAngle = -Math.PI / 2;     // top
  // Target angle so segment center aligns with pointer at end
  var spins = 5 + Math.random() * 2;
  var targetCenter = (targetIdx + 0.5) * arc;
  var endAngle = (Math.PI * 2 * spins) + (pointerAngle - targetCenter);
  var startAngle = 0;
  var dur = 4500;
  var t0 = performance.now();
  var draw = function(angle){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    for (var i = 0; i < n; i++){
      var a0 = i * arc, a1 = (i + 1) * arc;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = segs[i].color;
      ctx.fill();
      ctx.strokeStyle = '#180a30';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.save();
      ctx.rotate(a0 + arc / 2);
      ctx.fillStyle = '#180a30';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(segs[i].label, r - 12, 5);
      ctx.restore();
    }
    // Center
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd96a';
    ctx.fill();
    ctx.strokeStyle = '#180a30';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  };
  var step = function(now){
    var pct = Math.min(1, (now - t0) / dur);
    var ease = 1 - Math.pow(1 - pct, 3);
    var ang = startAngle + (endAngle - startAngle) * ease;
    draw(ang);
    if (pct < 1) requestAnimationFrame(step);
    else { if (MF.audio && MF.audio.coin) MF.audio.coin(); if (done) done(); }
  };
  requestAnimationFrame(step);
};

// =====================================================================
// === CRAFTING (alchimie) ===
// =====================================================================
MF.CRAFT_RECIPES = [
  { id:'craft_heal3', input:{ heal_potion:3 }, output:{ heal_potion:1, fragments:50 }, name:'Distill 3× Soin → Soin amélioré', desc:'Convertit 3 potions de soin en 1 + 50 💎' },
  { id:'craft_summon3', input:{ free_summon:3 }, output:{ free_summon:1, fragments:60 }, name:'Distill 3× Invocation', desc:'Convertit 3 invocations gratuites en 1 + 60 💎' },
  { id:'craft_skin', input:{ reroll_skin:5 }, output:{ random_legendary:1 }, name:'5× Reroll → Skin Légendaire', desc:'Convertit 5 reroll skin en 1 skin légendaire random' }
];

MF.craft_canDo = function(recipe){
  var meta = MF.state.meta || {};
  var c = meta.consumables || {};
  for (var k in recipe.input){
    if ((c[k] || 0) < recipe.input[k]) return false;
  }
  return true;
};

MF.craft_do = function(recipe){
  if (!MF.craft_canDo(recipe)) return false;
  var meta = MF.state.meta;
  meta.consumables = meta.consumables || {};
  // Consume inputs
  for (var k in recipe.input){
    meta.consumables[k] -= recipe.input[k];
    if (meta.consumables[k] <= 0) delete meta.consumables[k];
  }
  // Apply outputs
  for (var o in recipe.output){
    if (o === 'fragments'){
      meta.fragments = (meta.fragments || 0) + recipe.output[o];
    } else if (o === 'random_legendary'){
      // grant random legendary skin
      MF.wheel_applyReward({ type:'random_skin' });   // simplification — could pick from legendary pool
      var legSkins = Object.keys(MF.SKINS).filter(function(sid){ return MF.SKINS[sid].legendary; });
      if (legSkins.length){
        var sid = legSkins[Math.floor(Math.random() * legSkins.length)];
        var heroes = Object.keys(MF.UNITS).filter(function(uid){
          var u = MF.UNITS[uid];
          return u && u.kind === 'hero' && !u.isHybrid && u.summonable !== false;
        });
        meta.unlockedSkins = meta.unlockedSkins || {};
        for (var h = 0; h < 20; h++){
          var pickHero = heroes[Math.floor(Math.random() * heroes.length)];
          meta.unlockedSkins[pickHero] = meta.unlockedSkins[pickHero] || ['default'];
          if (meta.unlockedSkins[pickHero].indexOf(sid) < 0){
            meta.unlockedSkins[pickHero].push(sid);
            if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🌟 ' + MF.SKINS[sid].name + ' pour ' + MF.UNITS[pickHero].name + ' !', 'wave');
            break;
          }
        }
      }
    } else {
      // Other consumable output
      meta.consumables[o] = (meta.consumables[o] || 0) + recipe.output[o];
    }
  }
  if (MF.saveProgress) MF.saveProgress();
  if (MF.audio && MF.audio.coin) MF.audio.coin();
  return true;
};

// =====================================================================
// === EXPORT/IMPORT save ===
// =====================================================================
MF.save_export = function(){
  try {
    var data = JSON.stringify({
      progress: MF.state.progress, highestWorld: MF.state.highestWorld,
      endlessBest: MF.state.endlessBest, bossRushDone: MF.state.bossRushDone,
      totalGold: MF.state.totalGold, totalKills: MF.state.totalKills,
      meta: MF.state.meta
    });
    var b64 = btoa(unescape(encodeURIComponent(data)));
    return 'MFSAVE:' + b64;
  } catch(e){ return null; }
};

MF.save_import = function(text){
  try {
    if (!text || text.indexOf('MFSAVE:') !== 0) throw 'invalid format';
    var b64 = text.slice(7).trim();
    var json = decodeURIComponent(escape(atob(b64)));
    var d = JSON.parse(json);
    if (d.progress)    MF.state.progress = d.progress;
    if (typeof d.highestWorld === 'number') MF.state.highestWorld = d.highestWorld;
    if (typeof d.endlessBest === 'number')  MF.state.endlessBest = d.endlessBest;
    if (d.bossRushDone) MF.state.bossRushDone = d.bossRushDone;
    if (d.totalGold)    MF.state.totalGold = d.totalGold;
    if (d.totalKills)   MF.state.totalKills = d.totalKills;
    if (d.meta) MF.state.meta = Object.assign(MF._defaultMeta(), d.meta);
    MF.saveProgress();
    return true;
  } catch(e){ return false; }
};

// =====================================================================
// === RUN HISTORY (for replay graph) ===
// =====================================================================
MF.history_push = function(entry){
  if (!MF.state.meta) return;
  MF.state.meta.runHistory = MF.state.meta.runHistory || [];
  MF.state.meta.runHistory.push(Object.assign({ ts: Date.now() }, entry));
  // Keep only last 30
  if (MF.state.meta.runHistory.length > 30){
    MF.state.meta.runHistory = MF.state.meta.runHistory.slice(-30);
  }
  MF.saveProgress();
};

// =====================================================================
// === BOSS MECHANICS — phase / split / charge per boss ===
// =====================================================================
// Hooked from MF.dealDamage and MF.killEnemy via MF.boss_onDamage / MF.boss_onPhase
MF.boss_onDamage = function(enemy, dmg){
  if (!enemy || !enemy.isBoss) return;
  var pct = enemy.hp / enemy.maxHp;
  // Hydra: at 50% PV, split into 2 mini hydras
  if (enemy.typeId === 'hydra' && !enemy.hydraSplit && pct < 0.5){
    enemy.hydraSplit = true;
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🐍 Hydre se divise !', 'boss');
    if (MF.fx) MF.fx.spawnBurst(enemy.pos, 0x60d060, 24, { speed: 5 });
    for (var i = 0; i < 2; i++){
      var mini = MF.spawnEnemy ? MF.spawnEnemy('hydra', 0.25, 1.2, { isMini: true, scaleMult: 0.6 }) : null;
      if (mini){
        mini.pos.x = enemy.pos.x + (i === 0 ? -0.5 : 0.5);
        mini.pos.z = enemy.pos.z;
        mini.mesh.position.copy(mini.pos);
      }
    }
  }
  // Lich: at 30% PV, become invuln 3s + heal 20%
  if (enemy.typeId === 'lich' && !enemy.lichPhase && pct < 0.3){
    enemy.lichPhase = true;
    enemy.invuln = true;
    enemy.hp = enemy.maxHp * 0.5;             // heal back to 50%
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🪦 Liche : phase 2 !', 'boss');
    if (MF.fx) MF.fx.spawnRing(enemy.pos, 0xc070ff, { scale: 5, life: 0.7 });
    setTimeout(function(){
      enemy.invuln = false;
      if (MF.fx) MF.fx.spawnRing(enemy.pos, 0xc070ff, { scale: 3, life: 0.4 });
    }, 3000);
  }
  // Goblin King: at 60% PV, charge speed boost
  if (enemy.typeId === 'goblin_king' && !enemy.charged && pct < 0.6){
    enemy.charged = true;
    enemy.baseSpeed *= 1.6;
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('👑 Roi Gobelin : Charge !', 'boss');
    if (MF.fx) MF.fx.spawnRing(enemy.pos, 0x60d060, { scale: 3, life: 0.5 });
  }
  // Dragon King: at 50% PV, breath cone (1-shot AOE)
  if (enemy.typeId === 'dragon_king' && !enemy.breathed && pct < 0.5){
    enemy.breathed = true;
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🐲 Roi Dragon : Souffle !', 'boss');
    var fortress = MF.grid.fortressPos;
    if (fortress && MF.units){
      // Damage all units in a cone toward fortress
      MF.units.forEach(function(u){
        var dx = u.pos.x - enemy.pos.x;
        var dz = u.pos.z - enemy.pos.z;
        if (dx * dx + dz * dz < 16){          // 4 unit cone radius
          if (MF.fx) MF.fx.spawnBurst(u.pos, 0xff5028, 12, { speed: 4 });
        }
      });
      MF.flashLight && MF.flashLight(enemy.pos, 0xff5028, 5, 12, 0.5);
      MF.fx && MF.fx.shake(0.6, 0.5);
    }
  }
  // Bone Lord: at 40% PV, summon 3 skeletons
  if (enemy.typeId === 'bone_lord' && !enemy.summoned && pct < 0.4){
    enemy.summoned = true;
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('💀 Seigneur des Os : Renforts !', 'boss');
    for (var s = 0; s < 3; s++){
      var sk = MF.spawnEnemy ? MF.spawnEnemy('skeleton', 0.6, 1.0, { goldMult: 0.5 }) : null;
      if (sk){
        sk.pos.x = enemy.pos.x + (Math.random() - 0.5) * 1.5;
        sk.pos.z = enemy.pos.z + (Math.random() - 0.5) * 1.5;
        sk.mesh.position.copy(sk.pos);
      }
    }
  }
  // Warlord: at 50% PV, rage (+30% dmg)
  if (enemy.typeId === 'warlord' && !enemy.raging && pct < 0.5){
    enemy.raging = true;
    enemy.fortressDmg = (enemy.fortressDmg || 1) + 1;
    if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('⚔ Seigneur de Guerre : Rage !', 'boss');
    if (MF.fx) MF.fx.spawnRing(enemy.pos, 0xff7028, { scale: 3, life: 0.5 });
  }
};

// =====================================================================
// === HERO MASTERY — XP par héros, +1% dmg permanent par niveau (max 50) ===
// =====================================================================
MF.mastery_xpToLevel = function(lvl){
  // Quadratic curve: lvl 1 = 100, lvl 50 = 50000
  return Math.round(100 * Math.pow(lvl, 1.6));
};

MF.mastery_addKill = function(unitId){
  if (!MF.state.meta || !unitId) return;
  var meta = MF.state.meta;
  meta.mastery = meta.mastery || {};
  meta.mastery[unitId] = meta.mastery[unitId] || { lvl: 0, xp: 0 };
  var m = meta.mastery[unitId];
  if (m.lvl >= 50) return;
  m.xp += 1;
  var need = MF.mastery_xpToLevel(m.lvl + 1);
  while (m.xp >= need && m.lvl < 50){
    m.xp -= need;
    m.lvl++;
    if (MF.notify_push) MF.notify_push('🎓 ' + (MF.UNITS[unitId] ? MF.UNITS[unitId].name : unitId) + ' atteint la maîtrise ' + m.lvl + ' !', 'success');
    if (MF.audio && MF.audio.levelUp) MF.audio.levelUp();
    need = MF.mastery_xpToLevel(m.lvl + 1);
  }
};

MF.mastery_getMult = function(unitId){
  if (!MF.state.meta || !MF.state.meta.mastery || !MF.state.meta.mastery[unitId]) return 1;
  return 1 + 0.01 * MF.state.meta.mastery[unitId].lvl;
};

// =====================================================================
// === R5 MANUAL ULTIMATES — per hero ===
// =====================================================================
MF.R5_ULTIMATES = {
  knight:  { name:'Bouclier Sacré',     icon:'🛡', cd: 25, desc:'Soigne forteresse +5 PV + invuln 3s' },
  archer:  { name:'Pluie de Flèches',   icon:'🏹', cd: 22, desc:'30 flèches AOE sur l\'arène' },
  mage:    { name:'Téléport',           icon:'🌀', cd: 18, desc:'Repousse tous ennemis' },
  ice:     { name:'Tempête de Glace',   icon:'❄', cd: 28, desc:'Gel global 4s' },
  bomb:    { name:'Bombe atomique',     icon:'💥', cd: 30, desc:'AOE: kill ennemis < 50% PV' },
  dragon:  { name:'Souffle Divin',      icon:'🐲', cd: 30, desc:'Cône de feu 500 dmg' },
  // P14 ex-tours (now heroes)
  cannon:  { name:'Boulet Géant',       icon:'💣', cd: 24, desc:'Projectile énorme 600 dmg AOE 3.5' },
  ballista: { name:'Salve Perçante',    icon:'🎯', cd: 20, desc:'5 flèches qui traversent la map' },
  tesla:   { name:'Foudre Globale',     icon:'⚡', cd: 26, desc:'Frappe les 12 ennemis les plus forts' },
  fire:    { name:'Inferno',            icon:'🔥', cd: 28, desc:'Brûle tous les ennemis 5s' },
  frost:   { name:'Blizzard',           icon:'🧊', cd: 24, desc:'Gel 3s + 100 dmg sur tous les ennemis' },
  // P14 nouveaux héros
  berserker: { name:'Furie',            icon:'😡', cd: 18, desc:'+50% atk-speed et dmg 6s' },
  sniper:    { name:'Flèche Spectrale', icon:'🌟', cd: 25, desc:'1 flèche perce + 1000 dmg unique' },
  timemage:  { name:'Stase Temporelle', icon:'⏳', cd: 30, desc:'Fige TOUS les ennemis 5s' },
  bard:      { name:'Chant Épique',     icon:'🎵', cd: 22, desc:'+30% dmg équipe 8s' },
  summoner:  { name:'Meute Spectrale',  icon:'🐺', cd: 28, desc:'Invoque 6 loups invincibles 8s' }
};

MF.r5_canUse = function(unit){
  if (!unit || unit.rank < 5) return false;
  if (!MF.R5_ULTIMATES[unit.id]) return false;
  if (unit.r5UltCd && unit.r5UltCd > 0) return false;
  return true;
};

MF.r5_use = function(unit){
  if (!MF.r5_canUse(unit)) return false;
  var def = MF.R5_ULTIMATES[unit.id];
  unit.r5UltCd = def.cd;
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner(def.icon + ' ' + (MF.UNITS[unit.id].name) + ' : ' + def.name + ' !', 'wave');
  if (MF.audio && MF.audio.ultCast) MF.audio.ultCast();
  // Effects per hero
  if (unit.id === 'knight'){
    MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + 5);
    MF.run = MF.run || {};
    MF.run.fortressInvuln = true;
    setTimeout(function(){ MF.run.fortressInvuln = false; }, 3000);
    if (MF.fx && MF.grid.fortressPos) MF.fx.spawnRing(MF.grid.fortressPos, 0xffd96a, { scale: 4, life: 0.7 });
  } else if (unit.id === 'archer'){
    if (MF.enemies){
      for (var i = 0; i < 30; i++){
        (function(idx){
          setTimeout(function(){
            if (!MF.enemies.length) return;
            var e = MF.enemies[Math.floor(Math.random() * MF.enemies.length)];
            if (!e || !e.alive) return;
            if (MF.dealDamage) MF.dealDamage(e, 60, 'normal');
            if (MF.fx) MF.fx.spawnRing(e.pos, 0xc0e8a0, { scale: 1.5, life: 0.3 });
          }, idx * 60);
        })(i);
      }
    }
  } else if (unit.id === 'mage'){
    if (MF.enemies){
      for (var j = 0; j < MF.enemies.length; j++){
        var e2 = MF.enemies[j];
        if (!e2 || !e2.alive) continue;
        var dx = e2.pos.x - unit.pos.x, dz = e2.pos.z - unit.pos.z;
        var d = Math.sqrt(dx*dx + dz*dz) || 1;
        var push = 3.5;
        e2.pos.x += (dx / d) * push;
        e2.pos.z += (dz / d) * push;
        e2.mesh.position.copy(e2.pos);
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xc070ff, { scale: 8, life: 0.7 });
    }
  } else if (unit.id === 'ice'){
    if (MF.enemies){
      for (var k = 0; k < MF.enemies.length; k++){
        if (MF.applyStatus) MF.applyStatus(MF.enemies[k], { type:'stun', dur:4, chance:1 });
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0x90d0ff, { scale: 12, life: 0.7 });
    }
  } else if (unit.id === 'bomb'){
    if (MF.enemies){
      for (var b = MF.enemies.length - 1; b >= 0; b--){
        var be = MF.enemies[b];
        if (!be || !be.alive) continue;
        if (be.hp / be.maxHp < 0.5){
          if (MF.killEnemy) MF.killEnemy(be);
        } else if (MF.dealDamage) MF.dealDamage(be, 200, 'fire');
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xff5028, { scale: 10, life: 0.8 });
    }
  } else if (unit.id === 'dragon'){
    var fortress = MF.grid.fortressPos;
    if (fortress && MF.enemies){
      var fdx = fortress.x - unit.pos.x, fdz = fortress.z - unit.pos.z;
      var fd = Math.sqrt(fdx*fdx + fdz*fdz) || 1;
      var nx = fdx / fd, nz = fdz / fd;
      for (var d2 = MF.enemies.length - 1; d2 >= 0; d2--){
        var de = MF.enemies[d2];
        if (!de || !de.alive) continue;
        var ex = de.pos.x - unit.pos.x, ez = de.pos.z - unit.pos.z;
        var dot = (ex * nx + ez * nz);
        if (dot < 0) continue;
        var perp = Math.abs(ex * nz - ez * nx);
        if (perp < 1.5){
          if (MF.dealDamage) MF.dealDamage(de, 500, 'fire');
        }
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xff7028, { scale: 6, life: 0.7 });
    }
  } else if (unit.id === 'cannon'){
    // Boulet géant : énorme AOE
    if (MF.enemies){
      for (var c1 = MF.enemies.length - 1; c1 >= 0; c1--){
        var ce = MF.enemies[c1];
        if (!ce || !ce.alive) continue;
        var cdx = ce.pos.x - unit.pos.x, cdz = ce.pos.z - unit.pos.z;
        if (cdx*cdx + cdz*cdz < 12.25 && MF.dealDamage){
          MF.dealDamage(ce, 600, 'normal', unit);
        }
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0x222222, { scale: 7, life: 0.8 });
      if (MF.fx) MF.fx.shake(0.7, 0.6);
    }
  } else if (unit.id === 'ballista'){
    // 5 flèches perçantes qui traversent la map dans 5 directions
    if (MF.enemies){
      for (var ba = 0; ba < 5; ba++){
        var ang = (ba / 5) * Math.PI * 2;
        var nax = Math.cos(ang), nay = Math.sin(ang);
        for (var b1 = MF.enemies.length - 1; b1 >= 0; b1--){
          var be = MF.enemies[b1];
          if (!be || !be.alive) continue;
          var bex = be.pos.x - unit.pos.x, bez = be.pos.z - unit.pos.z;
          var bdot = bex * nax + bez * nay;
          if (bdot < 0) continue;
          var bperp = Math.abs(bex * nay - bez * nax);
          if (bperp < 0.7 && MF.dealDamage){
            MF.dealDamage(be, 300, 'normal', unit);
          }
        }
      }
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xc8a060, { scale: 5, life: 0.6 });
    }
  } else if (unit.id === 'tesla'){
    // Foudre globale: hits 12 strongest
    if (MF.enemies){
      var arr = MF.enemies.filter(function(e){ return e.alive; });
      arr.sort(function(a, b){ return b.maxHp - a.maxHp; });
      var n = Math.min(arr.length, 12);
      for (var i = 0; i < n; i++){
        (function(idx, e){
          setTimeout(function(){
            if (!e.alive) return;
            if (MF.dealDamage) MF.dealDamage(e, e.maxHp * 0.6, 'lightning', unit);
            if (MF.fx) MF.fx.spawnRing(e.pos, 0xfff080, { scale: 2, life: 0.3 });
          }, idx * 50);
        })(i, arr[i]);
      }
      if (MF.fx) MF.fx.flashLight && MF.fx.flashLight(unit.pos, 0xfff080, 4, 14, 0.4);
    }
  } else if (unit.id === 'fire'){
    // Inferno: burn all enemies 5s
    if (MF.enemies && MF.applyStatus){
      MF.enemies.forEach(function(e){
        if (e.alive){
          MF.applyStatus(e, { type:'burn', dur: 5.0, dps: 0.5 });
          if (MF.fx) MF.fx.spawnRing(e.pos, 0xff7028, { scale: 1.5, life: 0.3 });
        }
      });
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xff5028, { scale: 8, life: 0.7 });
    }
  } else if (unit.id === 'frost'){
    // Blizzard: freeze 3s + 100 dmg
    if (MF.enemies){
      MF.enemies.forEach(function(e){
        if (!e.alive) return;
        if (MF.applyStatus){
          MF.applyStatus(e, { type:'stun', dur: 3.0, chance: 1 });
          MF.applyStatus(e, { type:'slow', dur: 5.0, mult: 0.30 });
        }
        if (MF.dealDamage) MF.dealDamage(e, 100, 'frost', unit);
      });
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0x80c8ff, { scale: 10, life: 0.8 });
    }
  } else if (unit.id === 'berserker'){
    // Furie: +50% atk-speed et dmg 6s
    unit.berserkerFury = 6.0;
    unit.rageStacks = 10;
    if (MF.fx) MF.fx.spawnRing(unit.pos, 0xff5040, { scale: 4, life: 0.7 });
  } else if (unit.id === 'sniper'){
    // Flèche spectrale: 1 flèche perce + 1000 dmg unique sur le plus fort
    if (MF.enemies){
      var arr2 = MF.enemies.filter(function(e){ return e.alive; });
      arr2.sort(function(a, b){ return b.maxHp - a.maxHp; });
      if (arr2.length){
        var target = arr2[0];
        if (MF.dealDamage) MF.dealDamage(target, 1000, 'normal', unit);
        if (MF.fx){
          MF.fx.spawnRing(target.pos, 0x80f0a0, { scale: 4, life: 0.6 });
          MF.fx.spawnBurst(target.pos, 0x80f0a0, 28, { speed: 8 });
        }
        if (MF.fx && MF.fx.shake) MF.fx.shake(0.5, 0.4);
      }
    }
  } else if (unit.id === 'timemage'){
    // Stase: gel TOUS les ennemis 5s
    if (MF.enemies && MF.applyStatus){
      MF.enemies.forEach(function(e){
        if (!e.alive) return;
        MF.applyStatus(e, { type:'stun', dur: 5.0, chance: 1 });
      });
      if (MF.fx) MF.fx.spawnRing(unit.pos, 0xc8d8ff, { scale: 14, life: 1.0 });
    }
  } else if (unit.id === 'bard'){
    // Chant Épique: +30% dmg équipe 8s
    MF.run = MF.run || {};
    MF.run.bardSongMult = 1.3;
    setTimeout(function(){ if (MF.run) MF.run.bardSongMult = 1; }, 8000);
    if (MF.fx) MF.fx.spawnRing(unit.pos, 0xc080ff, { scale: 6, life: 0.7 });
  } else if (unit.id === 'summoner'){
    // Meute Spectrale: 6 loups invincibles 8s
    if (MF.ability_summonWolves){
      MF.ability_summonWolves(unit, { count: 6, dur: 8 });
    }
    if (MF.fx) MF.fx.spawnRing(unit.pos, 0xa0c0ff, { scale: 5, life: 0.7 });
  }
  return true;
};

// =====================================================================
// === TOAST NOTIFICATIONS (stack) ===
// =====================================================================
MF.notify_push = function(text, kind){
  var stack = document.getElementById('mf-toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.id = 'mf-toast-stack';
    document.body.appendChild(stack);
  }
  var toast = document.createElement('div');
  toast.className = 'mf-toast' + (kind ? ' mf-toast-' + kind : '');
  toast.textContent = text;
  stack.appendChild(toast);
  setTimeout(function(){
    toast.classList.add('mf-toast-fade');
    setTimeout(function(){ if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
  }, 2800);
};

// =====================================================================
// === CHOSEN MODIFIERS — pick 1 buff out of 3 before run ===
// =====================================================================
MF.CHOSEN_MODIFIERS = [
  { id:'cm_dmg',    icon:'⚔', name:'Lame Affûtée',  desc:'+15% dégâts unités', flag:{ unitDmgMult: 1.15 } },
  { id:'cm_speed',  icon:'⚡', name:'Cadence',       desc:'+15% cadence d\'attaque', flag:{ unitAtkSpeed: 1.15 } },
  { id:'cm_range',  icon:'🎯', name:'Vue Aiguë',     desc:'+20% portée', flag:{ unitRange: 1.20 } },
  { id:'cm_gold',   icon:'💰', name:'Cupidité',      desc:'+30% or des kills', flag:{ goldMult: 1.30 } },
  { id:'cm_fort',   icon:'🛡', name:'Mur Solide',    desc:'+5 PV forteresse max', flag:{ fortressMaxBonus: 5 } },
  { id:'cm_crit',   icon:'💥', name:'Frappe Critique', desc:'+10% chance critique', flag:{ critChance: 0.10 } },
  { id:'cm_summon', icon:'✨', name:'Invocation Bon Marché', desc:'-15% coût invocation', flag:{ summonCostMult: 0.85 } },
  { id:'cm_regen',  icon:'❤', name:'Régénération',   desc:'+1 PV/vague', flag:{ fortressRegen: 1 } }
];

MF.chosen_pick3 = function(){
  var arr = MF.CHOSEN_MODIFIERS.slice();
  arr.sort(function(){ return Math.random() - 0.5; });
  return arr.slice(0, 3);
};

MF.chosen_apply = function(mod){
  if (!mod || !mod.flag) return;
  MF.run = MF.run || {};
  Object.keys(mod.flag).forEach(function(k){
    var v = mod.flag[k];
    if (typeof v === 'number'){
      if (k === 'unitDmgMult')   MF.run.dmgMult = (MF.run.dmgMult || 1) * v;
      else if (k === 'goldMult') MF.run.goldMult = (MF.run.goldMult || 1) * v;
      else if (k === 'unitAtkSpeed') MF.run.atkSpeedMult = (MF.run.atkSpeedMult || 1) * v;
      else if (k === 'unitRange') MF.run.unitRangeMult = (MF.run.unitRangeMult || 1) * v;
      else if (k === 'critChance') MF.run.critChance = (MF.run.critChance || 0) + v;
      else if (k === 'fortressMaxBonus'){ MF.state.fortressMaxHP += v; MF.state.fortressHP += v; }
      else if (k === 'summonCostMult') MF.run.summonCostMult = (MF.run.summonCostMult || 1) * v;
      else if (k === 'fortressRegen') MF.run.fortressRegen = (MF.run.fortressRegen || 0) + v;
    }
  });
  if (MF.notify_push) MF.notify_push(mod.icon + ' ' + mod.name + ' actif', 'info');
};

// =====================================================================
// === HEATMAP — track kill positions in chaos ===
// =====================================================================
MF.heatmap_record = function(x, z){
  if (MF.state.mode !== 'chaos') return;
  if (!MF.chaos) return;
  MF.chaos._heatmap = MF.chaos._heatmap || [];
  MF.chaos._heatmap.push({ x: x, z: z });
  if (MF.chaos._heatmap.length > 500) MF.chaos._heatmap.shift();
};

MF.heatmap_drawTo = function(canvas){
  if (!canvas || !MF.chaos || !MF.chaos._heatmap) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  ctx.fillStyle = 'rgba(15,5,30,1)';
  ctx.fillRect(0, 0, w, h);
  // Grid outline
  ctx.strokeStyle = 'rgba(170,140,235,.3)';
  ctx.lineWidth = 1;
  for (var i = 1; i < 8; i++){
    ctx.beginPath(); ctx.moveTo(i * w/8, 0); ctx.lineTo(i * w/8, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * h/8); ctx.lineTo(w, i * h/8); ctx.stroke();
  }
  // Plot points (gradient heat)
  var bounds = (MF.GRID_COLS || 11) * (MF.TILE || 1.4);
  MF.chaos._heatmap.forEach(function(p){
    var px = ((p.x + bounds/2) / bounds) * w;
    var pz = ((p.z + bounds/2) / bounds) * h;
    var grad = ctx.createRadialGradient(px, pz, 0, px, pz, 18);
    grad.addColorStop(0, 'rgba(255,128,0,.35)');
    grad.addColorStop(0.5, 'rgba(255,200,80,.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, pz, 18, 0, Math.PI * 2);
    ctx.fill();
  });
  // Fortress marker
  ctx.fillStyle = '#ffd96a';
  ctx.beginPath(); ctx.arc(w/2, h/2, 6, 0, Math.PI*2); ctx.fill();
};

// =====================================================================
// === LONG QUESTS (7-day rolling) ===
// =====================================================================
MF.LONG_QUESTS = [
  { id:'lq_kills_5k',    name:'Boucher de la Semaine', icon:'💀', desc:'10 000 kills en 7 jours', target:10000, reward:300, type:'kills' },
  { id:'lq_play_3h',     name:'Marathonien',           icon:'⏰', desc:'3 heures de jeu en 7 jours', target:10800, reward:250, type:'playtime' },
  { id:'lq_hybrids_4',   name:'Maître Alchimiste',     icon:'🌟', desc:'4 hybrides différents', target:4, reward:400, type:'hybrids_unique' },
  { id:'lq_chaos_30min', name:'Survivant Ultime',      icon:'🌪', desc:'30 min cumulés en chaos', target:1800, reward:350, type:'chaos_time_total' }
];

MF.quests_init = function(){
  if (!MF.state.meta) return;
  var meta = MF.state.meta;
  meta.longQuests = meta.longQuests || {};
  // Reset rolling 7-day window if last init > 7 days ago
  var now = Date.now();
  if (!meta.questWindowStart || (now - meta.questWindowStart) > 7 * 24 * 3600 * 1000){
    meta.questWindowStart = now;
    meta.longQuests = {};
    MF.LONG_QUESTS.forEach(function(q){ meta.longQuests[q.id] = { progress: 0, completed: false }; });
  }
};

MF.quests_addProgress = function(type, amount){
  MF.quests_init();
  var meta = MF.state.meta;
  if (!meta.longQuests) return;
  MF.LONG_QUESTS.forEach(function(q){
    if (q.type !== type) return;
    var rec = meta.longQuests[q.id] || { progress: 0, completed: false };
    if (rec.completed) return;
    rec.progress = (rec.progress || 0) + (amount || 1);
    if (rec.progress >= q.target){
      rec.completed = true;
      meta.fragments = (meta.fragments || 0) + (q.reward || 0);
      if (MF.notify_push) MF.notify_push('🏅 ' + q.icon + ' ' + q.name + ' — +' + q.reward + ' 💎', 'success');
      if (MF.audio && MF.audio.achievement) MF.audio.achievement();
    }
    meta.longQuests[q.id] = rec;
  });
  if (MF.saveProgress) MF.saveProgress();
};

// =====================================================================
// === THEMES UI ===
// =====================================================================
MF.THEMES = {
  dark:  { name:'Sombre',  primary:'#1a0d2e', accent:'#ffd96a', body:'#fff' },
  light: { name:'Clair',   primary:'#f0e8e0', accent:'#a020a0', body:'#222' },
  neon:  { name:'Néon',    primary:'#0a0214', accent:'#00ffd0', body:'#fff' }
};

MF.theme_apply = function(themeId){
  var t = MF.THEMES[themeId] || MF.THEMES.dark;
  document.body.dataset.theme = themeId;
  if (MF.state && MF.state.meta){
    MF.state.meta.theme = themeId;
    if (MF.saveProgress) MF.saveProgress();
  }
};

// =====================================================================
// === ACCESSIBILITY (toggles) ===
// =====================================================================
MF.access_apply = function(){
  var meta = MF.state.meta || {};
  var a = meta.access || {};
  document.body.classList.toggle('mf-a-reduced', !!a.reduceMotion);
  document.body.classList.toggle('mf-a-contrast', !!a.highContrast);
  document.body.style.fontSize = (a.textScale || 1) * 16 + 'px';
};

MF.access_toggle = function(key){
  var meta = MF.state.meta || {};
  meta.access = meta.access || {};
  meta.access[key] = !meta.access[key];
  MF.access_apply();
  if (MF.saveProgress) MF.saveProgress();
};

MF.access_textScale = function(delta){
  var meta = MF.state.meta || {};
  meta.access = meta.access || {};
  meta.access.textScale = Math.max(0.85, Math.min(1.4, (meta.access.textScale || 1) + delta));
  MF.access_apply();
  if (MF.saveProgress) MF.saveProgress();
};

// Track unit kill stats (per unit type) ===
MF.killstats_record = function(unitId, isBoss, bossId){
  if (!MF.state.meta) return;
  var ks = MF.state.meta.killStats = MF.state.meta.killStats || { byUnit:{}, bossKills:{} };
  if (unitId) ks.byUnit[unitId] = (ks.byUnit[unitId] || 0) + 1;
  if (isBoss && bossId) ks.bossKills[bossId] = (ks.bossKills[bossId] || 0) + 1;
};
