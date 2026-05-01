// === Glamour Studio — bootstrap ===
window.MK = window.MK || {};

MK.boot = function () {
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded');
    return;
  }
  // Init order: face canvas (texture) → renderer → camera → postprocessing → player → wardrobe → ui
  MK.initFace();
  MK.initRenderer();
  MK.initCamera();
  if (MK.initPostprocessing) MK.initPostprocessing();
  MK.initPlayer();
  MK.initWardrobe();
  MK.initUI();

  // Try to load a real GLB character (replaces the procedural avatar on success)
  const loadingEl = document.getElementById('mk-loading');
  const finishBoot = (skipDefaultOutfit) => {
    if (!skipDefaultOutfit) {
      MK.equip('hair', 'long');
      MK.equip('top', 'tshirt');
      MK.equip('bottom', 'jeans');
      MK.equip('shoes', 'sneakers');
      MK.equip('under', 'set1');
    }
    MK.renderWardrobeGrid();
    MK.renderHairGrid();
    if (loadingEl) loadingEl.classList.add('mk-hidden');
    document.getElementById('mk-theme-screen').classList.remove('mk-hidden');
    MK.startLoop();
  };

  if (MK.loadGlbCharacter) {
    MK.loadGlbCharacter('assets/models/character.glb')
      .then((gltf) => {
        const ok = MK.applyGlbCharacter(gltf);
        // GLB already has its own clothing/textures — don't equip default procedural items
        finishBoot(ok);
      })
      .catch((err) => {
        console.warn('GLB load failed, falling back to procedural avatar:', err && err.message);
        finishBoot(false);
      });
  } else {
    finishBoot(false);
  }

  // Cordova back button — return to index
  document.addEventListener('backbutton', () => {
    window.location.href = 'index.html';
  }, false);
};

// Wait for DOM + (cordova device if available)
function _bootWhenReady() {
  if (window.cordova) {
    document.addEventListener('deviceready', MK.boot, false);
  } else {
    MK.boot();
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _bootWhenReady);
} else {
  _bootWhenReady();
}
