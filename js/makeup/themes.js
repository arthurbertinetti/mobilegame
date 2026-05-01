// === Glamour Studio — themes + fashion scoring ===
window.MK = window.MK || {};

MK.themes = {
  list: [
    {
      id: 'wedding', name: 'Mariage', icon: '👰', desc: 'Robe blanche, accessoires délicats',
      color: 0xfff4f6,
      preferStyle: 'wedding', altStyle: 'chic',
      preferColors: ['#ffffff', '#f5e6e6', '#c0a060', '#ffd93d'],
      requireDress: true,
      makeupHint: { lips: 0.5, lashes: 0.6, brows: 0.5, blush: 0.4, eyeshadow: 0.4, eyeliner: 0.5 }
    },
    {
      id: 'redcarpet', name: 'Tapis rouge', icon: '🌟', desc: 'Glamour intense, robe longue',
      color: 0xe94560,
      preferStyle: 'redcarpet', altStyle: 'chic',
      preferColors: ['#e94560', '#111111', '#9b59b6', '#c0a060', '#2c3e50'],
      requireDress: true,
      makeupHint: { lips: 0.85, lashes: 0.75, brows: 0.6, eyeshadow: 0.7, eyeliner: 0.8, blush: 0.4 }
    },
    {
      id: 'beach', name: 'Plage', icon: '🏖️', desc: 'Léger, coloré, ensoleillé',
      color: 0x74b9ff,
      preferStyle: 'beach', altStyle: 'casual',
      preferColors: ['#ffd93d', '#ff6fa8', '#6bff8e', '#74b9ff', '#ffffff'],
      requireDress: false,
      makeupHint: { lips: 0.5, lashes: 0.4, brows: 0.4, blush: 0.5, eyeshadow: 0.3, eyeliner: 0.3 }
    },
    {
      id: 'chic', name: 'Soirée chic', icon: '✨', desc: 'Cocktail, élégance maîtrisée',
      color: 0x9b59b6,
      preferStyle: 'chic', altStyle: 'redcarpet',
      preferColors: ['#9b59b6', '#111111', '#e94560', '#ff6fa8'],
      requireDress: false,
      makeupHint: { lips: 0.7, lashes: 0.6, brows: 0.55, eyeshadow: 0.6, eyeliner: 0.65, blush: 0.4 }
    },
    {
      id: 'casual', name: 'Casual', icon: '👗', desc: 'Look quotidien décontracté',
      color: 0x6bff8e,
      preferStyle: 'casual', altStyle: 'beach',
      preferColors: ['#74b9ff', '#ffd93d', '#6bff8e', '#ffffff', '#2c3e50'],
      requireDress: false,
      makeupHint: { lips: 0.35, lashes: 0.3, brows: 0.4, blush: 0.3, eyeshadow: 0.2, eyeliner: 0.2 }
    }
  ],
  current: null
};

MK.getTheme = function (id) {
  return MK.themes.list.find(t => t.id === id);
};

// === SCORING ===
// Returns { value: 0..100, rank, comment }
MK.computeScore = function () {
  const T = MK.themes.current;
  if (!T) return { value: 0, rank: '—', comment: 'Aucun thème.' };
  const W = MK.wardrobe;
  const F = MK.face.state;

  let score = 0;
  let max = 0;

  // 1) Outfit completeness (30 pts)
  max += 30;
  const hasDress = !!W.current.dress;
  const hasTop = !!W.current.top;
  const hasBottom = !!W.current.bottom;
  const hasShoes = !!W.current.shoes;
  const hasHair = !!W.current.hair;
  const hasUnder = !!W.current.under;

  if (T.requireDress) {
    if (hasDress) score += 14;
  } else {
    if (hasDress || (hasTop && hasBottom)) score += 14;
  }
  if (hasShoes) score += 6;
  if (hasHair) score += 6;
  if (hasUnder) score += 4;

  // 2) Style match (30 pts)
  max += 30;
  const cats = ['top', 'bottom', 'dress', 'shoes', 'head', 'hair'];
  let styleHits = 0, styleSlots = 0;
  for (const c of cats) {
    const s = W.styleByCat[c];
    if (!s) continue;
    styleSlots++;
    if (s === T.preferStyle) styleHits += 1;
    else if (s === T.altStyle) styleHits += 0.6;
    else if (s === 'any') styleHits += 0.3;
  }
  if (styleSlots > 0) score += (styleHits / styleSlots) * 30;

  // 3) Color cohesion (15 pts)
  max += 15;
  const colors = [W.itemColors.top, W.itemColors.bottom, W.itemColors.dress, W.itemColors.shoes, W.itemColors.head]
    .filter(Boolean);
  let colorHits = 0;
  for (const c of colors) {
    if (T.preferColors.some(pc => MK._colorClose(c, pc))) colorHits++;
  }
  if (colors.length > 0) score += Math.min(15, (colorHits / colors.length) * 15);

  // 4) Makeup expression (25 pts) — distance from target intensities
  max += 25;
  const hint = T.makeupHint;
  const layers = ['lips', 'lashes', 'brows', 'eyeshadow', 'eyeliner', 'blush'];
  let mkScore = 0;
  for (const l of layers) {
    const target = hint[l] || 0.4;
    const cur = (F[l] && F[l].intensity) || 0;
    const diff = Math.abs(target - cur);
    mkScore += Math.max(0, 1 - diff * 1.5);
  }
  score += (mkScore / layers.length) * 25;

  // Round
  const value = Math.round(score);
  let rank, comment;
  if (value >= 90) { rank = 'S+ Iconique'; comment = 'Look digne d\'une couverture mode !'; }
  else if (value >= 80) { rank = 'A Stylée'; comment = 'Très réussi, l\'ensemble est cohérent.'; }
  else if (value >= 65) { rank = 'B Élégante'; comment = 'Bon look, peaufine quelques détails.'; }
  else if (value >= 45) { rank = 'C Sympa'; comment = 'Pas mal, mais le thème pourrait être mieux respecté.'; }
  else if (value >= 25) { rank = 'D Brouillon'; comment = 'Le look manque de cohérence avec le thème.'; }
  else { rank = 'E Hors sujet'; comment = 'On dirait que tu n\'as pas joué le thème !'; }
  return { value, rank, comment };
};

// Color similarity in HSL space (simple)
MK._colorClose = function (a, b) {
  const ca = MK._hexToRgb(a), cb = MK._hexToRgb(b);
  const dr = (ca.r - cb.r) / 255, dg = (ca.g - cb.g) / 255, db = (ca.b - cb.b) / 255;
  return Math.sqrt(dr * dr + dg * dg + db * db) < 0.45;
};
