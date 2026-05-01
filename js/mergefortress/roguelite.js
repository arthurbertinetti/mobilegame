// === Merge Fortress TD — Roguelite runtime engine ===
// Builds MF.run from talents + relics + modifiers + drawn upgrades.
// Combat code reads multipliers/flags from MF.run.

window.MF = window.MF || {};

// Effective run state during a match (rebuilt at run start)
MF.run = null;

MF.makeFreshRunState = function(){
  return {
    // Damage, range, atk-speed multipliers (per unit id, plus '*' global)
    dmgMult: { '*': 1 },
    rangeMult: { '*': 1 },
    atkSpeedMult: { '*': 1 },
    // By kind ('hero'|'tower') multipliers
    dmgMultByKind: { hero: 1, tower: 1 },
    // Crit
    critChance: 0,
    critMult: 2,           // base ×2
    // Slow / burn modifiers
    slowDurMult: 1,
    burnDmgMult: 1,
    // Economy
    goldMult: 1,
    // Fortress
    fortressRegen: 0,
    fortressMaxBonus: 0,
    startGoldBonus: 0,
    // Enemy modifiers (negative)
    enemyHpMult: 1,
    enemySpdMult: 1,
    // Flags (any boolean / numeric special effect)
    flags: {},
    // Tracking for one-shot effects (e.g., revive used)
    triggers: {
      reviveUsed: false,
      lastThunderT: 0,
      lifestealAccum: 0
    },
    // List of currently active upgrades (for UI display)
    activeUpgrades: [],   // array of upgrade objects
    activeRelics: [],     // array of relic objects
    activeModifiers: [],  // array of modifier objects
    activeTalents: []     // array of {talent, rank}
  };
};

// Apply an effect onto an existing MF.run state
MF._applyEffect = function(run, eff){
  if (!eff) return;
  var t = eff.target;
  switch (eff.type){
    case 'unitDmgMult':
      if (t === '*') run.dmgMult['*'] *= eff.value;
      else run.dmgMult[t] = (run.dmgMult[t] || 1) * eff.value;
      break;
    case 'unitDmgMultByKind':
      run.dmgMultByKind[t] = (run.dmgMultByKind[t] || 1) * eff.value;
      break;
    case 'unitRangeMult':
      if (t === '*') run.rangeMult['*'] *= eff.value;
      else run.rangeMult[t] = (run.rangeMult[t] || 1) * eff.value;
      break;
    case 'unitAtkSpeedMult':
      if (t === '*') run.atkSpeedMult['*'] *= eff.value;
      else run.atkSpeedMult[t] = (run.atkSpeedMult[t] || 1) * eff.value;
      break;
    case 'critChance':
      run.critChance += eff.value;
      break;
    case 'critMult':
      run.critMult += eff.value;
      break;
    case 'enemySlowDur':
      // value 1.5 means +50% (multiplicative). For talent style which adds (e.g., 1+0.10*rank), same.
      run.slowDurMult *= eff.value;
      break;
    case 'burnDmgMult':
      run.burnDmgMult *= eff.value;
      break;
    case 'goldMult':
      run.goldMult *= eff.value;
      break;
    case 'fortressRegen':
      run.fortressRegen += eff.value;
      break;
    case 'enemyHpMult':
      run.enemyHpMult *= eff.value;
      break;
    case 'enemySpdMult':
      run.enemySpdMult *= eff.value;
      break;
    case 'flag':
      // Numeric flags add up; boolean flags overwrite to true.
      if (typeof eff.value === 'boolean'){
        run.flags[t] = eff.value;
      } else {
        run.flags[t] = (run.flags[t] || 0) + eff.value;
      }
      break;
  }
};

// Apply a list of effects from upgrade/relic/talent/modifier
MF._applyEffects = function(run, effects){
  if (!effects) return;
  for (var i = 0; i < effects.length; i++) MF._applyEffect(run, effects[i]);
};

// Build run state from talents + equipped relics + drawn modifiers
MF.startRunRoguelite = function(opts){
  opts = opts || {};
  var run = MF.makeFreshRunState();

  // === 1. Apply permanent TALENTS ===
  var talentLevels = (MF.state.meta && MF.state.meta.talents) || {};
  Object.keys(talentLevels).forEach(function(tid){
    var rank = talentLevels[tid];
    if (!rank) return;
    var talent = MF.TALENTS[tid];
    if (!talent) return;
    var effects = talent.effectAt(rank);
    MF._applyEffects(run, effects);
    run.activeTalents.push({ talent: talent, rank: rank });
  });

  // === 2. Apply equipped RELICS ===
  var equipped = (MF.state.meta && MF.state.meta.equippedRelics) || [];
  equipped.forEach(function(rid){
    var relic = MF.RELICS[rid];
    if (!relic) return;
    MF._applyEffects(run, relic.effects);
    run.activeRelics.push(relic);
  });

  // === 3. Draw and apply MODIFIERS (only if mode allows) ===
  if (opts.useModifiers){
    var mods = MF.drawRunModifiers();
    mods.forEach(function(m){
      MF._applyEffects(run, m.effects);
      run.activeModifiers.push(m);
    });
  }

  MF.run = run;

  // Apply fortress max bonus immediately
  if (MF.state.fortressMaxHP != null && run.flags.fortressMaxBonus){
    MF.state.fortressMaxHP += run.flags.fortressMaxBonus;
    MF.state.fortressHP    += run.flags.fortressMaxBonus;
  }
  // Start gold bonus
  if (MF.state.gold != null && run.flags.startGoldBonus){
    MF.state.gold += run.flags.startGoldBonus;
  }
  return run;
};

MF.endRunRoguelite = function(){
  // Convert run kills/damage to fragments (meta currency)
  var fragments = 0;
  if (MF.state.killsThisLevel)  fragments += Math.floor(MF.state.killsThisLevel * 0.6);
  if (MF.state.waveIdx)         fragments += MF.state.waveIdx * 5;
  if (MF.state.outcome === 'win') fragments = Math.floor(fragments * 1.5);
  // Bonus per rare/epic/legendary upgrade
  if (MF.run){
    MF.run.activeUpgrades.forEach(function(u){
      if (u.rarity === 'rare')      fragments += 5;
      else if (u.rarity === 'epic') fragments += 12;
      else if (u.rarity === 'legendary') fragments += 30;
    });
  }
  if (!MF.state.meta) MF.state.meta = MF._defaultMeta();
  MF.state.meta.fragments += fragments;
  MF.state.meta.totalRuns = (MF.state.meta.totalRuns || 0) + 1;
  if (MF.state.outcome === 'win') MF.state.meta.totalWins = (MF.state.meta.totalWins || 0) + 1;
  MF.state.meta.deepestWave = Math.max(MF.state.meta.deepestWave || 0, MF.state.waveIdx || 0);
  MF.saveProgress();
  return fragments;
};

// Apply a chosen upgrade during the run
MF.applyChosenUpgrade = function(upgrade){
  if (!MF.run || !upgrade) return;
  MF._applyEffects(MF.run, upgrade.effects);
  MF.run.activeUpgrades.push(upgrade);
  // Apply fortress bonus instantly if relevant
  if (upgrade.effects){
    upgrade.effects.forEach(function(e){
      if (e.type === 'flag' && e.target === 'fortressMaxBonus' && MF.state.fortressMaxHP != null){
        MF.state.fortressMaxHP += e.value;
        MF.state.fortressHP    += e.value;
      }
    });
  }
};

// === Per-frame / per-event hooks ===
MF.rl_tickGlobal = function(dt){
  if (!MF.run) return;
  // Random thunder strike from "Tempête divine" (legendary)
  var ti = MF.run.flags.thunderInterval;
  if (ti && MF.enemies && MF.enemies.length > 0){
    var t = MF._t || 0;
    if (t - MF.run.triggers.lastThunderT >= ti){
      MF.run.triggers.lastThunderT = t;
      // Pick random enemy
      var alive = MF.enemies.filter(function(e){ return e.alive; });
      if (alive.length){
        var target = alive[Math.floor(Math.random() * alive.length)];
        // Massive lightning damage scaled with wave
        var dmg = 200 * (1 + (MF.state.waveIdx || 0) * 0.25);
        MF.dealDamage(target, dmg, 'lightning');
        if (MF.fx && MF.fx.spawnRing) MF.fx.spawnRing(target.pos, 0xfff080, { scale: 4, life: 0.7 });
        if (MF.flashLight) MF.flashLight(target.pos, 0xfff080, 4, 8, 0.4);
        if (MF.fx) MF.fx.shake(0.3, 0.4);
      }
    }
  }
};

// Called when a wave fully clears. Apply per-wave effects.
MF.rl_onWaveCleared = function(waveIdx){
  if (!MF.run) return;
  // Fortress regen
  if (MF.run.fortressRegen > 0 && MF.state.fortressHP != null){
    var heal = MF.run.fortressRegen;
    MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + heal);
    if (MF.grid && MF.grid.fortressPos && MF.fx && MF.fx.floatingDmg){
      MF.fx.floatingDmg(MF.grid.fortressPos, '+' + heal + ' PV', 'gold');
    }
  }
  // Bonus gold per wave
  if (MF.run.flags.bonusGoldPerWave && MF.state.gold != null){
    MF.state.gold += MF.run.flags.bonusGoldPerWave;
  }
  // Onde de choc (epic: waveBlastDmg)
  if (MF.run.flags.waveBlastDmg && MF.enemies && MF.enemies.length){
    var blastDmg = MF.run.flags.waveBlastDmg * Math.pow(1.15, waveIdx);
    MF.enemies.forEach(function(e){
      if (e.alive) MF.dealDamage(e, blastDmg, 'crit');
    });
    if (MF.fx) MF.fx.shake(0.25, 0.3);
  }
};

// Try to revive fortress (returns true if revive used)
MF.rl_tryRevive = function(){
  if (!MF.run) return false;
  if (MF.run.triggers.reviveUsed) return false;
  var ratio = MF.run.flags.oneRevive;
  if (!ratio) return false;
  MF.run.triggers.reviveUsed = true;
  MF.state.fortressHP = Math.max(1, Math.floor(MF.state.fortressMaxHP * ratio));
  if (MF.fx){
    MF.fx.showBanner('🔥 Phénix renaît !', 'boss');
    MF.fx.shake(0.5, 0.6);
    if (MF.grid && MF.grid.fortressPos){
      MF.fx.spawnRing(MF.grid.fortressPos, 0xff7028, { scale: 8, life: 1.2 });
    }
  }
  return true;
};

// Compute final damage for a unit shot (called by combat)
MF.rl_computeDamage = function(unit, baseDmg){
  if (!MF.run) MF.run = {};
  var dmg = baseDmg;
  var isCrit = false;
  // Multipliers (defensive: dmgMult might be undefined if startRunRoguelite hasn't initialized)
  if (MF.run.dmgMult){
    dmg *= MF.run.dmgMult['*'] || 1;
    if (MF.run.dmgMult[unit.id]) dmg *= MF.run.dmgMult[unit.id];
  }
  var kind = unit.kind || (MF.UNITS[unit.id] && MF.UNITS[unit.id].kind);
  if (kind && MF.run.dmgMultByKind && MF.run.dmgMultByKind[kind]) dmg *= MF.run.dmgMultByKind[kind];
  // P9 chosen modifier dmg
  if (MF.run.dmgMult && typeof MF.run.dmgMult !== 'object') dmg *= MF.run.dmgMult;
  // Synergy multiplier (P8)
  if (MF.run.synergyDmgMult) dmg *= MF.run.synergyDmgMult;
  // Mastery permanent bonus (P9)
  if (MF.mastery_getMult) dmg *= MF.mastery_getMult(unit.id);
  // Friendship bonus (P10)
  if (MF.friendship_getMult) dmg *= MF.friendship_getMult(unit);
  // Mythic R6 dmg (P11)
  if (unit.mythicDmgMult) dmg *= unit.mythicDmgMult;
  // P14 Bard R5 song
  if (MF.run.bardSongMult) dmg *= MF.run.bardSongMult;
  // P14 Berserker R5 furie
  if (unit.berserkerFury > 0) dmg *= 1.5;
  // P13 Skin stat bonus
  if (MF.applySkinStats){
    var sb = MF.applySkinStats(unit);
    if (sb){
      if (sb.dmgMult) dmg *= sb.dmgMult;
      if (sb.aoeDmgMult && (MF.UNITS[unit.id] && (MF.UNITS[unit.id].attack.type === 'splash' || MF.UNITS[unit.id].attack.type === 'chain'))) dmg *= sb.aoeDmgMult;
      if (sb.critChance && !isCrit){
        if (Math.random() < sb.critChance){
          dmg *= (MF.run.critMult || 2);
          isCrit = true;
        }
      }
    }
  }
  // Crit roll
  var critC = MF.run.critChance || 0;
  if (critC > 0 && !isCrit && Math.random() < critC){
    dmg *= (MF.run.critMult || 2);
    isCrit = true;
  }
  return { dmg: dmg, isCrit: isCrit };
};

// Called when an enemy is damaged — used for lifesteal, frostShatter, etc.
MF.rl_onEnemyDamaged = function(enemy, dmg){
  if (!MF.run || !enemy) return dmg;
  // Frost shatter: bonus dmg if slowed
  if (MF.run.flags.frostShatter && enemy.statuses && enemy.statuses.slow > 0){
    dmg *= 1 + MF.run.flags.frostShatter;
  }
  // Lifesteal
  if (MF.run.flags.lifesteal && MF.state.fortressHP != null && MF.state.fortressMaxHP != null){
    MF.run.triggers.lifestealAccum = (MF.run.triggers.lifestealAccum || 0) + dmg * MF.run.flags.lifesteal;
    if (MF.run.triggers.lifestealAccum >= 1){
      var heal = Math.floor(MF.run.triggers.lifestealAccum);
      MF.run.triggers.lifestealAccum -= heal;
      // Cap to fortress max hp
      MF.state.fortressHP = Math.min(MF.state.fortressMaxHP, MF.state.fortressHP + heal);
    }
  }
  return dmg;
};

// Called when an enemy dies — explode-on-death modifier
MF.rl_onEnemyKilled = function(enemy){
  if (!MF.run || !enemy) return;
  if (MF.run.flags.enemyExplodeOnDeath){
    // Check if fortress is close
    if (MF.grid && MF.grid.fortressPos){
      var d = enemy.pos.distanceTo(MF.grid.fortressPos);
      if (d < 3) {
        MF.state.fortressHP = Math.max(0, MF.state.fortressHP - 1);
        if (MF.fx){
          MF.fx.spawnRing(enemy.pos, 0xff5050, { scale: 3, life: 0.5 });
          MF.fx.shake(0.18, 0.2);
          if (MF.flashLight) MF.flashLight(enemy.pos, 0xff3030, 2, 5, 0.2);
        }
      }
    }
  }
};

// Helpers used by waves.js to determine upgrade frequency
MF.rl_upgradeFrequency = function(){
  if (MF.run && MF.run.flags.upgradeFreq) return MF.run.flags.upgradeFreq;
  return 5;  // default: every 5 waves
};

MF.rl_summonCostMult = function(){
  if (MF.run && MF.run.flags.summonCostMult) return MF.run.flags.summonCostMult;
  return 1;
};

MF.rl_rarityBoost = function(){
  if (MF.run && MF.run.flags.rarityBoost) return MF.run.flags.rarityBoost;
  return 0;
};

// Should this wave be elite-only?
MF.rl_isEliteWave = function(waveIdx){
  if (!MF.run || !MF.run.flags.eliteWaves) return false;
  return waveIdx % 3 === 0;
};
