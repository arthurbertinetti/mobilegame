// === Glamour Studio — face canvas → CanvasTexture ===
// Layered 2D drawing on a canvas → bound as a Three.js texture on the head mesh.
// Layers: skin base, blush, eyeshadow, eyeliner, lashes, brows, lipstick.
window.MK = window.MK || {};

MK.face = {
  size: 512,
  canvas: null,
  ctx: null,
  texture: null,
  // Layer state — each makeup category has color + intensity (0..1)
  state: {
    skin: '#f6d6c1',
    lips: { color: '#d6385e', intensity: 0.65 },
    eyeshadow: { color: '#a460ff', intensity: 0.55 },
    eyeliner: { color: '#1a0f1a', intensity: 0.7 },
    lashes: { color: '#0d0a14', intensity: 0.5 },
    brows: { color: '#5b3520', intensity: 0.6 },
    blush: { color: '#ff95b1', intensity: 0.35 }
  },
  // Anchor points on the canvas (u,v ∈ [0,1])
  // Sphere UV: face will be centered around u=0.5, v=0.5 once we shift the texture offset.
  anchors: {
    leftEyeC: [0.40, 0.42],
    rightEyeC: [0.60, 0.42],
    eyeRX: 0.06, eyeRY: 0.024,
    leftBrowC: [0.40, 0.36],
    rightBrowC: [0.60, 0.36],
    browW: 0.10, browH: 0.012,
    nose: [0.50, 0.50],
    mouth: [0.50, 0.62],
    mouthW: 0.085, mouthH: 0.025,
    leftCheek: [0.34, 0.55],
    rightCheek: [0.66, 0.55]
  }
};

MK.initFace = function () {
  const F = MK.face;
  F.canvas = document.createElement('canvas');
  F.canvas.width = F.size;
  F.canvas.height = F.size;
  F.ctx = F.canvas.getContext('2d');
  F.texture = new THREE.CanvasTexture(F.canvas);
  if (THREE.SRGBColorSpace) F.texture.colorSpace = THREE.SRGBColorSpace;
  F.texture.anisotropy = 4;
  F.texture.minFilter = THREE.LinearMipmapLinearFilter;
  F.texture.magFilter = THREE.LinearFilter;
  // Sphere default UV: (theta, phi). The visible front (camera +Z, head facing +Z) sits around u=0.25.
  // Shift the texture so the face we draw at u=0.5 ends up at the front.
  F.texture.offset.x = 0.25;
  F.texture.wrapS = THREE.RepeatWrapping;

  MK.redrawFace();
};

MK.setSkinColor = function (hex) {
  MK.face.state.skin = hex;
  MK.redrawFace();
  if (MK.player && MK.player.setSkinColor) MK.player.setSkinColor(hex);
};

MK.setMakeupLayer = function (layer, color, intensity) {
  const s = MK.face.state[layer];
  if (!s) return;
  if (color !== undefined) s.color = color;
  if (intensity !== undefined) s.intensity = intensity;
  MK.redrawFace();
};

MK.clearMakeupLayer = function (layer) {
  const s = MK.face.state[layer];
  if (!s) return;
  s.intensity = 0;
  MK.redrawFace();
};

MK.redrawFace = function () {
  const F = MK.face;
  const ctx = F.ctx;
  const S = F.size;
  const A = F.anchors;
  const st = F.state;

  // 1) Base skin
  ctx.fillStyle = st.skin;
  ctx.fillRect(0, 0, S, S);

  // 1b) Foundation gradient — slightly lighter centered glow on face
  const foundation = ctx.createRadialGradient(S * 0.5, S * 0.5, S * 0.08, S * 0.5, S * 0.5, S * 0.45);
  foundation.addColorStop(0, 'rgba(255,240,220,0.10)');
  foundation.addColorStop(0.5, 'rgba(255,220,200,0.04)');
  foundation.addColorStop(1, 'rgba(0,0,0,0.20)');
  ctx.fillStyle = foundation;
  ctx.fillRect(0, 0, S, S);

  // 1c) Cheekbone contour — soft shadow under the cheekbones
  ctx.save();
  ctx.fillStyle = 'rgba(80,40,40,0.08)';
  for (const cheek of [A.leftCheek, A.rightCheek]) {
    const cx = cheek[0] * S, cy = cheek[1] * S + 8;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, S * 0.075);
    grad.addColorStop(0, 'rgba(120,70,80,0.18)');
    grad.addColorStop(1, 'rgba(120,70,80,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, S * 0.075, S * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 1d) Nose contour — slim shadow on either side, highlight on bridge
  ctx.save();
  // Side shadows
  ctx.fillStyle = 'rgba(80,40,50,0.10)';
  for (const sx of [-1, 1]) {
    const x = (0.5 + sx * 0.018) * S;
    const y = A.nose[1] * S - 10;
    const g = ctx.createLinearGradient(x, y - 30, x, y + 30);
    g.addColorStop(0, 'rgba(120,80,90,0)');
    g.addColorStop(0.5, 'rgba(120,80,90,0.18)');
    g.addColorStop(1, 'rgba(120,80,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 4, y - 30, 8, 60);
  }
  // Bridge highlight
  const noseHi = ctx.createLinearGradient(S * 0.5, A.leftBrowC[1] * S, S * 0.5, A.nose[1] * S);
  noseHi.addColorStop(0, 'rgba(255,245,235,0)');
  noseHi.addColorStop(0.5, 'rgba(255,245,235,0.10)');
  noseHi.addColorStop(1, 'rgba(255,245,235,0)');
  ctx.fillStyle = noseHi;
  ctx.fillRect(S * 0.485, A.leftBrowC[1] * S, S * 0.030, (A.nose[1] - A.leftBrowC[1]) * S);
  ctx.restore();

  // 1e) Forehead + chin highlights for dimension
  ctx.save();
  const foreheadHi = ctx.createRadialGradient(S * 0.5, S * 0.30, 4, S * 0.5, S * 0.30, S * 0.18);
  foreheadHi.addColorStop(0, 'rgba(255,245,230,0.12)');
  foreheadHi.addColorStop(1, 'rgba(255,245,230,0)');
  ctx.fillStyle = foreheadHi; ctx.fillRect(0, 0, S, S);
  const chinHi = ctx.createRadialGradient(S * 0.5, S * 0.74, 2, S * 0.5, S * 0.74, S * 0.07);
  chinHi.addColorStop(0, 'rgba(255,245,230,0.10)');
  chinHi.addColorStop(1, 'rgba(255,245,230,0)');
  ctx.fillStyle = chinHi; ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // 1f) Jawline shadow
  ctx.save();
  const jaw = ctx.createRadialGradient(S * 0.5, S * 0.85, S * 0.15, S * 0.5, S * 0.85, S * 0.40);
  jaw.addColorStop(0, 'rgba(60,30,40,0.10)');
  jaw.addColorStop(1, 'rgba(60,30,40,0)');
  ctx.fillStyle = jaw; ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // 2) Blush — soft circles on cheeks
  if (st.blush.intensity > 0) {
    ctx.save();
    const r = S * 0.075;
    const drawBlush = (cx, cy) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const c = MK._hexToRgb(st.blush.color);
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${st.blush.intensity * 0.7})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawBlush(A.leftCheek[0] * S, A.leftCheek[1] * S);
    drawBlush(A.rightCheek[0] * S, A.rightCheek[1] * S);
    ctx.restore();
  }

  // 3) Eye sockets (subtle dark) — anatomy reference
  ctx.save();
  ctx.fillStyle = 'rgba(60,30,40,0.18)';
  for (const eye of [A.leftEyeC, A.rightEyeC]) {
    ctx.beginPath();
    ctx.ellipse(eye[0] * S, eye[1] * S, A.eyeRX * S * 1.4, A.eyeRY * S * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3b) Eye whites + iris + pupil + glint (drawn into the canvas, not 3D meshes)
  ctx.save();
  for (const eye of [A.leftEyeC, A.rightEyeC]) {
    const ex = eye[0] * S, ey = eye[1] * S;
    const erx = A.eyeRX * S, ery = A.eyeRY * S * 2.0;
    // Eye white
    const wgrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, erx);
    wgrad.addColorStop(0, '#fafafd');
    wgrad.addColorStop(0.85, '#e8e1eb');
    wgrad.addColorStop(1, '#c8b8c8');
    ctx.fillStyle = wgrad;
    ctx.beginPath();
    ctx.ellipse(ex, ey, erx, ery, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris
    const irisR = ery * 0.95;
    const igrad = ctx.createRadialGradient(ex, ey, irisR * 0.2, ex, ey, irisR);
    igrad.addColorStop(0, '#6ba2e8');
    igrad.addColorStop(0.7, '#2a4a8a');
    igrad.addColorStop(1, '#0f1d3a');
    ctx.fillStyle = igrad;
    ctx.beginPath();
    ctx.arc(ex, ey, irisR, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#0a0510';
    ctx.beginPath();
    ctx.arc(ex, ey, irisR * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Glint (top-right)
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.arc(ex + irisR * 0.35, ey - irisR * 0.4, irisR * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Tiny secondary glint
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(ex - irisR * 0.2, ey + irisR * 0.3, irisR * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4) Eyeshadow — wider gradient above the eye
  if (st.eyeshadow.intensity > 0) {
    ctx.save();
    const c = MK._hexToRgb(st.eyeshadow.color);
    const drawShadow = (eye) => {
      const cx = eye[0] * S, cy = (eye[1] - 0.012) * S;
      const rx = A.eyeRX * S * 1.7, ry = A.eyeRY * S * 3.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${st.eyeshadow.intensity * 0.85})`);
      g.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},${st.eyeshadow.intensity * 0.35})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawShadow(A.leftEyeC);
    drawShadow(A.rightEyeC);
    ctx.restore();
  }

  // 5) Eyeliner — thin curved line on upper lid
  if (st.eyeliner.intensity > 0) {
    ctx.save();
    ctx.strokeStyle = MK._rgba(st.eyeliner.color, st.eyeliner.intensity);
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    const drawLine = (eye, flip) => {
      const cx = eye[0] * S, cy = eye[1] * S;
      const rx = A.eyeRX * S, ry = A.eyeRY * S;
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy);
      ctx.bezierCurveTo(cx - rx * 0.5, cy - ry * 1.4, cx + rx * 0.5, cy - ry * 1.4, cx + rx, cy - ry * 0.2);
      // Wing
      ctx.lineTo(cx + rx * (flip ? 1.0 : 1.4), cy - ry * (flip ? 1.6 : 1.6));
      ctx.stroke();
    };
    drawLine(A.leftEyeC, true);
    drawLine(A.rightEyeC, false);
    ctx.restore();
  }

  // 6) Lashes — short strokes radiating from upper lid
  if (st.lashes.intensity > 0) {
    ctx.save();
    ctx.strokeStyle = MK._rgba(st.lashes.color, st.lashes.intensity);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6;
    const drawLashes = (eye) => {
      const cx = eye[0] * S, cy = eye[1] * S;
      const rx = A.eyeRX * S, ry = A.eyeRY * S;
      const N = 9;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const ang = -Math.PI + t * Math.PI;
        const x1 = cx + Math.cos(ang) * rx * 0.95;
        const y1 = cy + Math.sin(ang) * ry * 1.0 - ry * 0.5;
        const len = ry * (1.5 + 0.5 * Math.sin(t * Math.PI));
        const x2 = x1 + Math.cos(ang - Math.PI / 2) * len * 0.7;
        const y2 = y1 + Math.sin(ang - Math.PI / 2) * len;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };
    drawLashes(A.leftEyeC);
    drawLashes(A.rightEyeC);
    ctx.restore();
  }

  // 7) Brows — angled bar above eye
  if (st.brows.intensity > 0) {
    ctx.save();
    ctx.fillStyle = MK._rgba(st.brows.color, st.brows.intensity);
    const drawBrow = (brow, flip) => {
      const cx = brow[0] * S, cy = brow[1] * S;
      const w = A.browW * S, h = A.browH * S * 2;
      ctx.translate(cx, cy);
      ctx.rotate((flip ? -1 : 1) * 0.12);
      // Tapered shape
      ctx.beginPath();
      ctx.moveTo(-w, -h);
      ctx.quadraticCurveTo(0, -h * 1.6, w, -h * 0.4);
      ctx.quadraticCurveTo(w * 0.5, h * 0.3, -w, h);
      ctx.closePath();
      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    drawBrow(A.leftBrowC, true);
    drawBrow(A.rightBrowC, false);
    ctx.restore();
  }

  // 8) Lips — pulpeuses, dégradé réaliste, séparation lèvre haute / basse
  ctx.save();
  const mx = A.mouth[0] * S, my = A.mouth[1] * S;
  const mw = A.mouthW * S, mh = A.mouthH * S;

  // Build upper-lip and lower-lip paths separately so they can be shaded independently
  const upperPath = new Path2D();
  upperPath.moveTo(mx - mw, my);
  upperPath.bezierCurveTo(mx - mw * 0.85, my - mh * 1.4, mx - mw * 0.25, my - mh * 1.1, mx - mw * 0.05, my - mh * 0.30);
  upperPath.bezierCurveTo(mx, my - mh * 0.55, mx + mw * 0.05, my - mh * 0.55, mx + mw * 0.05, my - mh * 0.30);
  upperPath.bezierCurveTo(mx + mw * 0.25, my - mh * 1.1, mx + mw * 0.85, my - mh * 1.4, mx + mw, my);
  upperPath.bezierCurveTo(mx + mw * 0.5, my - mh * 0.05, mx - mw * 0.5, my - mh * 0.05, mx - mw, my);
  upperPath.closePath();

  const lowerPath = new Path2D();
  lowerPath.moveTo(mx - mw, my);
  lowerPath.bezierCurveTo(mx - mw * 0.5, my + mh * 0.30, mx + mw * 0.5, my + mh * 0.30, mx + mw, my);
  lowerPath.bezierCurveTo(mx + mw * 0.85, my + mh * 1.7, mx - mw * 0.85, my + mh * 1.7, mx - mw, my);
  lowerPath.closePath();

  // Natural lip color base (visible even at intensity 0)
  const baseGrad = ctx.createRadialGradient(mx, my + mh * 0.4, mh * 0.2, mx, my, mw * 1.1);
  baseGrad.addColorStop(0, 'rgba(190,90,100,0.55)');
  baseGrad.addColorStop(1, 'rgba(140,60,75,0.3)');
  ctx.fillStyle = baseGrad;
  ctx.fill(upperPath);
  ctx.fill(lowerPath);

  if (st.lips.intensity > 0) {
    const lipsRGB = MK._hexToRgb(st.lips.color);
    // Upper lip — slightly darker
    const upperGrad = ctx.createLinearGradient(mx, my - mh * 1.4, mx, my);
    upperGrad.addColorStop(0, `rgba(${Math.floor(lipsRGB.r * 0.7)},${Math.floor(lipsRGB.g * 0.65)},${Math.floor(lipsRGB.b * 0.65)},${st.lips.intensity})`);
    upperGrad.addColorStop(1, `rgba(${lipsRGB.r},${lipsRGB.g},${lipsRGB.b},${st.lips.intensity})`);
    ctx.fillStyle = upperGrad;
    ctx.fill(upperPath);

    // Lower lip — fuller, lighter center, top highlight
    const lowerGrad = ctx.createLinearGradient(mx, my, mx, my + mh * 1.7);
    lowerGrad.addColorStop(0, `rgba(${lipsRGB.r},${lipsRGB.g},${lipsRGB.b},${st.lips.intensity})`);
    lowerGrad.addColorStop(0.6, `rgba(${Math.min(255, lipsRGB.r + 30)},${Math.min(255, lipsRGB.g + 20)},${Math.min(255, lipsRGB.b + 20)},${st.lips.intensity})`);
    lowerGrad.addColorStop(1, `rgba(${Math.floor(lipsRGB.r * 0.75)},${Math.floor(lipsRGB.g * 0.7)},${Math.floor(lipsRGB.b * 0.7)},${st.lips.intensity})`);
    ctx.fillStyle = lowerGrad;
    ctx.fill(lowerPath);

    // Top center highlight on lower lip (gloss)
    ctx.save();
    ctx.clip(lowerPath);
    const gloss = ctx.createRadialGradient(mx, my + mh * 0.45, 0, mx, my + mh * 0.45, mw * 0.45);
    gloss.addColorStop(0, `rgba(255,255,255,${0.32 * st.lips.intensity})`);
    gloss.addColorStop(0.4, `rgba(255,255,255,${0.10 * st.lips.intensity})`);
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.ellipse(mx, my + mh * 0.45, mw * 0.5, mh * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Subtle vertical lines (lip texture)
    ctx.save();
    ctx.clip(lowerPath);
    ctx.strokeStyle = `rgba(${Math.floor(lipsRGB.r * 0.6)},${Math.floor(lipsRGB.g * 0.55)},${Math.floor(lipsRGB.b * 0.55)},${0.18 * st.lips.intensity})`;
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) {
      const x = mx + i * mw / 7;
      ctx.beginPath();
      ctx.moveTo(x, my);
      ctx.lineTo(x + i * 0.5, my + mh * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Center cleft (subtle dark)
  ctx.fillStyle = 'rgba(60,30,40,0.20)';
  ctx.beginPath();
  ctx.moveTo(mx - mw, my);
  ctx.lineTo(mx + mw, my);
  ctx.lineTo(mx + mw * 0.95, my + 1);
  ctx.lineTo(mx - mw * 0.95, my + 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 9) Nose hint — soft shadow
  ctx.save();
  ctx.fillStyle = 'rgba(120,70,80,0.10)';
  ctx.beginPath();
  ctx.ellipse(A.nose[0] * S, A.nose[1] * S + 8, S * 0.018, S * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mark texture dirty
  MK.face.texture.needsUpdate = true;
};

// === Helpers ===
MK._hexToRgb = function (hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
MK._rgba = function (hex, a) {
  const c = MK._hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
};
