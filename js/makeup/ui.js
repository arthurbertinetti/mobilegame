// === Glamour Studio — UI controllers ===
window.MK = window.MK || {};

MK.ui = {
  currentTab: 'body',
  currentWardrobeCat: 'top',
  currentMakeupLayer: 'lips'
};

// Makeup palettes
MK.MAKEUP_PALETTES = {
  lips: ['#d6385e', '#a52a3f', '#ff5286', '#cc1f6a', '#7a2333', '#e08566', '#ff9aa2', '#5a1f2e'],
  eyeshadow: ['#a460ff', '#5b3a8a', '#ff7eb6', '#3b6cff', '#2a8a6b', '#c9a14a', '#7a4d33', '#1a1a1a'],
  eyeliner: ['#1a0f1a', '#0d0d22', '#3d1a4a', '#5a2a1a', '#1a3a5a'],
  lashes: ['#0d0a14', '#1a1a1a', '#3a1f10'],
  brows: ['#1c0f08', '#3a1f10', '#5b3520', '#74452a', '#c89556'],
  blush: ['#ff95b1', '#ff7e92', '#e08566', '#ffb8d0', '#cc6677']
};

MK.initUI = function () {
  // ====== Main tab dock ======
  document.querySelectorAll('#mk-dock .mk-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      MK._switchTab(tab);
    });
  });

  // ====== BODY MORPH SLIDERS ======
  document.querySelectorAll('#mk-panel .mk-panel-page[data-page="body"] input[type=range][data-morph]').forEach(s => {
    s.addEventListener('input', (e) => {
      const v = parseInt(s.value, 10);
      s.parentNode.querySelector('.mk-val').textContent = v;
      MK.setMorph(s.dataset.morph, v);
    });
  });

  // ====== SKIN SWATCHES ======
  document.querySelectorAll('.mk-swatches[data-swatchgroup="skin"] .mk-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.parentNode.querySelectorAll('.mk-swatch').forEach(s => s.classList.remove('mk-active'));
      sw.classList.add('mk-active');
      MK.setSkinColor(sw.dataset.color);
    });
  });
  // Default skin selected
  const skinSw = document.querySelector('.mk-swatches[data-swatchgroup="skin"] .mk-swatch');
  if (skinSw) skinSw.classList.add('mk-active');

  // ====== WARDROBE ======
  document.querySelectorAll('#mk-wardrobe-subtabs .mk-subtab').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#mk-wardrobe-subtabs .mk-subtab').forEach(x => x.classList.remove('mk-active'));
      b.classList.add('mk-active');
      MK.ui.currentWardrobeCat = b.dataset.cat;
      MK.renderWardrobeGrid();
    });
  });
  MK.renderWardrobeGrid();

  // Cloth color swatches
  document.querySelectorAll('.mk-swatches[data-swatchgroup="cloth"] .mk-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.parentNode.querySelectorAll('.mk-swatch').forEach(s => s.classList.remove('mk-active'));
      sw.classList.add('mk-active');
      MK.setItemColor(MK.ui.currentWardrobeCat, sw.dataset.color);
    });
  });

  // ====== MAKEUP ======
  document.querySelectorAll('#mk-makeup-subtabs .mk-subtab').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#mk-makeup-subtabs .mk-subtab').forEach(x => x.classList.remove('mk-active'));
      b.classList.add('mk-active');
      MK.ui.currentMakeupLayer = b.dataset.mk;
      MK.renderMakeupSwatches();
      MK.syncMakeupSlider();
    });
  });
  const intensity = document.getElementById('mk-intensity');
  intensity.addEventListener('input', () => {
    const v = parseInt(intensity.value, 10);
    document.getElementById('mk-intensity-val').textContent = v;
    MK.setMakeupLayer(MK.ui.currentMakeupLayer, undefined, v / 100);
  });
  document.getElementById('mk-clear-makeup').addEventListener('click', () => {
    MK.clearMakeupLayer(MK.ui.currentMakeupLayer);
    intensity.value = 0;
    document.getElementById('mk-intensity-val').textContent = 0;
  });
  MK.renderMakeupSwatches();
  MK.syncMakeupSlider();

  // ====== HAIR ======
  MK.renderHairGrid();
  document.querySelectorAll('.mk-swatches[data-swatchgroup="hair"] .mk-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.parentNode.querySelectorAll('.mk-swatch').forEach(s => s.classList.remove('mk-active'));
      sw.classList.add('mk-active');
      MK.setItemColor('hair', sw.dataset.color);
    });
  });

  // ====== Theme select ======
  MK.renderThemeGrid();
  // Back button on theme screen
  const themeBack = document.getElementById('mk-theme-back');
  if (themeBack) themeBack.addEventListener('click', () => {
    if (MK.themes.current) {
      // A theme is already selected — just close the screen
      document.getElementById('mk-theme-screen').classList.add('mk-hidden');
    } else {
      window.location.href = 'index.html';
    }
  });

  // ====== Action bar ======
  document.getElementById('mk-score-btn').addEventListener('click', () => {
    const r = MK.computeScore();
    document.getElementById('mk-score-value').textContent = r.value;
    document.getElementById('mk-score-rank').textContent = r.rank;
    document.getElementById('mk-score-comment').textContent = r.comment;
    document.getElementById('mk-score-screen').classList.remove('mk-hidden');
  });
  document.getElementById('mk-score-replay').addEventListener('click', () => {
    document.getElementById('mk-score-screen').classList.add('mk-hidden');
  });
  document.getElementById('mk-score-newtheme').addEventListener('click', () => {
    document.getElementById('mk-score-screen').classList.add('mk-hidden');
    document.getElementById('mk-theme-screen').classList.remove('mk-hidden');
  });

  // Back: try history first, otherwise fallback to index
  document.getElementById('mk-back-btn').addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
  });
};

// === Switching tabs ===
MK._switchTab = function (tab) {
  MK.ui.currentTab = tab;
  document.querySelectorAll('#mk-dock .mk-tab').forEach(b => b.classList.toggle('mk-active', b.dataset.tab === tab));
  document.querySelectorAll('#mk-panel .mk-panel-page').forEach(p => {
    p.classList.toggle('mk-hidden', p.dataset.page !== tab);
  });
  if (tab === 'makeup') {
    if (MK.zoomToFace) MK.zoomToFace();
  } else if (tab === 'body' || tab === 'wardrobe' || tab === 'hair') {
    if (MK.autoFrameCharacter) MK.autoFrameCharacter();
  }
};

// === Wardrobe grid ===
MK.renderWardrobeGrid = function () {
  const cat = MK.ui.currentWardrobeCat;
  const list = MK.wardrobe.catalog[cat] || [];
  const grid = document.getElementById('mk-wardrobe-grid');
  grid.innerHTML = '';
  // "None" item to remove
  const none = document.createElement('button');
  none.className = 'mk-item';
  none.innerHTML = '✕<div class="mk-item-label">Aucun</div>';
  none.addEventListener('click', () => {
    if (cat === 'shoes') MK._unequipShoes();
    else MK._unequipCat(cat);
    MK.renderWardrobeGrid();
  });
  grid.appendChild(none);

  for (const it of list) {
    const btn = document.createElement('button');
    btn.className = 'mk-item';
    if (MK.wardrobe.current[cat] && MK.wardrobe.current[cat].item.id === it.id) btn.classList.add('mk-active');
    btn.innerHTML = `${it.icon}<div class="mk-item-label">${it.name}</div>`;
    btn.addEventListener('click', () => {
      MK.equip(cat, it.id);
      MK.renderWardrobeGrid();
    });
    grid.appendChild(btn);
  }
};

// === Hair grid ===
MK.renderHairGrid = function () {
  const list = MK.wardrobe.catalog.hair || [];
  const grid = document.getElementById('mk-hair-grid');
  grid.innerHTML = '';
  const none = document.createElement('button');
  none.className = 'mk-item';
  none.innerHTML = '✕<div class="mk-item-label">Aucun</div>';
  none.addEventListener('click', () => {
    MK._unequipCat('hair');
    MK.renderHairGrid();
  });
  grid.appendChild(none);
  for (const it of list) {
    const btn = document.createElement('button');
    btn.className = 'mk-item';
    if (MK.wardrobe.current.hair && MK.wardrobe.current.hair.item.id === it.id) btn.classList.add('mk-active');
    btn.innerHTML = `${it.icon}<div class="mk-item-label">${it.name}</div>`;
    btn.addEventListener('click', () => {
      MK.equip('hair', it.id);
      MK.renderHairGrid();
    });
    grid.appendChild(btn);
  }
};

// === Makeup swatches ===
MK.renderMakeupSwatches = function () {
  const layer = MK.ui.currentMakeupLayer;
  const palette = MK.MAKEUP_PALETTES[layer] || [];
  const wrap = document.getElementById('mk-makeup-swatches');
  wrap.innerHTML = '';
  for (const c of palette) {
    const sw = document.createElement('button');
    sw.className = 'mk-swatch';
    sw.style.background = c;
    sw.dataset.color = c;
    if (MK.face.state[layer] && MK.face.state[layer].color === c) sw.classList.add('mk-active');
    sw.addEventListener('click', () => {
      wrap.querySelectorAll('.mk-swatch').forEach(s => s.classList.remove('mk-active'));
      sw.classList.add('mk-active');
      MK.setMakeupLayer(layer, c, undefined);
    });
    wrap.appendChild(sw);
  }
};

MK.syncMakeupSlider = function () {
  const layer = MK.ui.currentMakeupLayer;
  const st = MK.face.state[layer];
  if (!st) return;
  const intensity = document.getElementById('mk-intensity');
  const v = Math.round(st.intensity * 100);
  intensity.value = v;
  document.getElementById('mk-intensity-val').textContent = v;
};

// === Theme grid ===
MK.renderThemeGrid = function () {
  const grid = document.getElementById('mk-theme-grid');
  grid.innerHTML = '';
  for (const t of MK.themes.list) {
    const btn = document.createElement('button');
    btn.className = 'mk-theme-card';
    btn.innerHTML = `<div class="mk-theme-card-ico">${t.icon}</div><div class="mk-theme-card-name">${t.name}</div><div class="mk-theme-card-desc">${t.desc}</div>`;
    btn.addEventListener('click', () => {
      MK.selectTheme(t.id);
    });
    grid.appendChild(btn);
  }
};

MK.selectTheme = function (id) {
  const t = MK.getTheme(id);
  if (!t) return;
  MK.themes.current = t;
  document.querySelector('#mk-current-theme .mk-theme-name').textContent = t.name;
  document.querySelector('#mk-current-theme .mk-theme-ico').textContent = t.icon;
  if (MK.setThemeColor) MK.setThemeColor(t.color);
  // Bloom intensity per theme (more glamour → more glow)
  if (MK.setBloomStrength) {
    const bloomByTheme = { redcarpet: 0.85, wedding: 0.65, chic: 0.55, beach: 0.40, casual: 0.35 };
    MK.setBloomStrength(bloomByTheme[id] != null ? bloomByTheme[id] : 0.45);
  }
  document.getElementById('mk-theme-screen').classList.add('mk-hidden');
};
