// === Merge Fortress TD — Merge logic ===
// Drag a unit onto another unit of same id + same rank → merge to next rank.
window.MF = window.MF || {};

MF.canMerge = function(srcUnit, dstUnit){
  if (!srcUnit || !dstUnit) return false;
  if (srcUnit.uid === dstUnit.uid) return false;
  // Standard merge: same id + same rank, both < 5
  if (srcUnit.id === dstUnit.id && srcUnit.rank === dstUnit.rank && srcUnit.rank < 5) return true;
  // P11 Forge mythique : 2× R5 même id (avec fragments)
  if (srcUnit.rank === 5 && dstUnit.rank === 5 && srcUnit.id === dstUnit.id){
    if (MF.UNITS[srcUnit.id] && !MF.UNITS[srcUnit.id].isHybrid) return true;
  }
  // Hybrid merge: both R5 of compatible types (no shared id)
  if (srcUnit.rank === 5 && dstUnit.rank === 5 && srcUnit.id !== dstUnit.id){
    if (MF.checkHybridRecipe && MF.checkHybridRecipe(srcUnit.id, dstUnit.id)) return true;
  }
  return false;
};

MF.tryMerge = function(srcUnit, dstUnit){
  if (!MF.canMerge(srcUnit, dstUnit)) return false;
  // P11 Forge mythique R6 (2× R5 même id)
  if (srcUnit.rank === 5 && dstUnit.rank === 5 && srcUnit.id === dstUnit.id){
    if (MF.forge_tryFromMerge) return MF.forge_tryFromMerge(srcUnit, dstUnit);
    return false;
  }
  if (MF.audio && MF.audio.merge) MF.audio.merge();
  var c = dstUnit.c, r = dstUnit.r;
  var pos = dstUnit.pos.clone();
  // Hybrid path
  if (srcUnit.id !== dstUnit.id){
    var h = MF.checkHybridRecipe(srcUnit.id, dstUnit.id);
    if (!h) return false;
    MF.fx.spawnMergeEffect(pos, h.color || 0xffd96a);
    MF.fx.spawnRing(pos, h.color || 0xffd96a, { scale: 5, life: 0.8 });
    MF.fx.shake(0.4, 0.4);
    if (MF.fx.showBanner) MF.fx.showBanner('🌟 FUSION ' + (h.icon || '') + ' ' + h.name + ' !', 'wave');
    MF.removeUnit(srcUnit);
    MF.removeUnit(dstUnit);
    var hu = MF.spawnUnit(h.id, 1, c, r);
    if (hu){
      hu.mesh.scale.setScalar(1.6);
      hu.spawnT = -0.2;
      MF.fx.floatingDmg(pos, '🌟 ' + h.name, 'gold');
    }
    if (MF.ach_onHybridCreated) MF.ach_onHybridCreated(h.id);
    // Daily challenge: hybrids today (cumulative across runs same day)
    if (MF.daily_addProgress) MF.daily_addProgress('hybrids_today', 1);
    // First-time hybrid → memory card modal
    if (MF.state.meta && (!MF.state.meta._shownHybridCards || !MF.state.meta._shownHybridCards[h.id])){
      MF.state.meta._shownHybridCards = MF.state.meta._shownHybridCards || {};
      MF.state.meta._shownHybridCards[h.id] = true;
      MF.saveProgress();
      // Pause briefly + show card
      var wasPaused = MF.state.paused;
      MF.state.paused = true;
      setTimeout(function(){
        if (MF.hybrid_showCard) MF.hybrid_showCard(h.id);
        var modalCloseInt = setInterval(function(){
          var modal = document.getElementById('mf-hybrid-modal');
          if (modal && modal.classList.contains('mf-hidden')){
            clearInterval(modalCloseInt);
            MF.state.paused = wasPaused;
          }
        }, 200);
      }, 500);
    }
    return true;
  }
  // Standard merge — P12: swirl animation before spawn
  var newRank = dstUnit.rank + 1;
  var newColor = MF.UNITS[dstUnit.id].ranks[newRank - 1].color;
  MF.fx.shake(0.12, 0.18);
  // Swirl: animate src + dst rotating around each other for 0.4s, then spawn
  var srcMesh = srcUnit.mesh;
  var dstMesh = dstUnit.mesh;
  var srcPos = srcUnit.pos.clone();
  var dstPos = dstUnit.pos.clone();
  var center = pos.clone();
  // Mark units as merging (prevent attacks)
  srcUnit.merging = true; dstUnit.merging = true;
  if (srcUnit.target) srcUnit.target = null;
  if (dstUnit.target) dstUnit.target = null;
  var dur = 0.4;
  var startT = MF._t || 0;
  var swirlInterval = setInterval(function(){
    var t = ((MF._t || 0) - startT) / dur;
    if (t >= 1){
      clearInterval(swirlInterval);
      MF.fx.spawnMergeEffect(center, newColor);
      MF.removeUnit(srcUnit);
      MF.removeUnit(dstUnit);
      var u = MF.spawnUnit(dstUnit.id, newRank, c, r);
      if (u){
        u.mesh.scale.setScalar(1.4);
        u.spawnT = -0.15;
        MF.fx.floatingDmg(center, '⭐ Rang ' + newRank, 'gold');
      }
      return;
    }
    // Rotate around center, decreasing radius
    var ang = t * Math.PI * 4;          // 2 full rotations
    var radius = 0.4 * (1 - t);
    if (srcMesh && srcMesh.position){
      srcMesh.position.x = center.x + Math.cos(ang) * radius;
      srcMesh.position.z = center.z + Math.sin(ang) * radius;
      srcMesh.position.y = 0.2 * Math.sin(t * Math.PI * 6);
    }
    if (dstMesh && dstMesh.position){
      dstMesh.position.x = center.x + Math.cos(ang + Math.PI) * radius;
      dstMesh.position.z = center.z + Math.sin(ang + Math.PI) * radius;
      dstMesh.position.y = 0.2 * Math.sin(t * Math.PI * 6 + Math.PI);
    }
  }, 30);
  return true;
};

// Quick swap: drag a unit onto an empty cell → moves it
MF.trySwapOrMove = function(srcUnit, c, r){
  // If target is empty: move
  var target = MF.getCell(c, r);
  if (target == null && MF.isPlaceable(c, r)){
    return MF.moveUnitTo(srcUnit, c, r);
  }
  // If target is unit and same: merge
  if (target && typeof target === 'object'){
    if (MF.canMerge(srcUnit, target)){
      return MF.tryMerge(srcUnit, target);
    }
    // Otherwise swap positions
    var srcC = srcUnit.c, srcR = srcUnit.r;
    var dstC = target.c, dstR = target.r;
    MF.setCell(srcC, srcR, null);
    MF.setCell(dstC, dstR, null);
    var sp = MF.gridToWorld(dstC, dstR);
    var dp = MF.gridToWorld(srcC, srcR);
    srcUnit.c = dstC; srcUnit.r = dstR;
    srcUnit.pos.set(sp.x, 0, sp.z);
    srcUnit.mesh.position.set(sp.x, 0, sp.z);
    target.c = srcC; target.r = srcR;
    target.pos.set(dp.x, 0, dp.z);
    target.mesh.position.set(dp.x, 0, dp.z);
    MF.setCell(dstC, dstR, srcUnit);
    MF.setCell(srcC, srcR, target);
    return true;
  }
  return false;
};
