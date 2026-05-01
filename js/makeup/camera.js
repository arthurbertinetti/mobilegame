// === Glamour Studio — orbit / pinch camera (mobile + mouse fallback) ===
window.MK = window.MK || {};

MK.cam = {
  camera: null,
  target: new THREE.Vector3(0, 1.05, 0),  // mid-body
  yaw: 0,
  pitch: 0.05,
  distance: 4.2,
  minDistance: 2.0,
  maxDistance: 7.5,
  minPitch: -0.6,
  maxPitch: 0.9,
  // Smoothing
  _yaw: 0, _pitch: 0.05, _dist: 4.2,
  _targetYaw: 0, _targetPitch: 0.05, _targetDist: 4.2,
  _targetCenter: new THREE.Vector3(0, 1.05, 0),
  // Touch state
  _pointers: new Map(),
  _lastPinch: 0,
  _autoSpin: false
};

MK.initCamera = function () {
  const C = MK.cam;
  const aspect = window.innerWidth / window.innerHeight;
  C.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
  MK._applyCamera();

  const canvas = document.getElementById('mk-canvas');

  // Pointer events (covers mouse + touch + pen on Cordova WebView)
  canvas.addEventListener('pointerdown', MK._onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', MK._onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', MK._onPointerUp);
  canvas.addEventListener('pointercancel', MK._onPointerUp);
  canvas.addEventListener('pointerleave', MK._onPointerUp);
  canvas.addEventListener('wheel', MK._onWheel, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Recenter button
  const btn = document.getElementById('mk-camera-btn');
  if (btn) btn.addEventListener('click', MK.autoFrameCharacter);
};

MK._applyCamera = function () {
  const C = MK.cam;
  const cx = C._targetCenter.x;
  const cy = C._targetCenter.y;
  const cz = C._targetCenter.z;
  const cosP = Math.cos(C._pitch);
  const x = cx + C._dist * cosP * Math.sin(C._yaw);
  const y = cy + C._dist * Math.sin(C._pitch);
  const z = cz + C._dist * cosP * Math.cos(C._yaw);
  C.camera.position.set(x, y, z);
  C.camera.lookAt(cx, cy, cz);
};

MK._onPointerDown = function (e) {
  e.preventDefault();
  const C = MK.cam;
  const canvas = e.currentTarget;
  if (canvas.setPointerCapture) {
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { }
  }
  C._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  C._autoSpin = false;
  if (C._pointers.size === 2) {
    C._lastPinch = MK._pinchDist();
  }
};

MK._onPointerMove = function (e) {
  const C = MK.cam;
  if (!C._pointers.has(e.pointerId)) return;
  e.preventDefault();
  const prev = C._pointers.get(e.pointerId);
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  C._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (C._pointers.size === 1) {
    // Orbit
    const sens = 0.005;
    C._targetYaw -= dx * sens;
    C._targetPitch -= dy * sens;
    C._targetPitch = Math.max(C.minPitch, Math.min(C.maxPitch, C._targetPitch));
  } else if (C._pointers.size === 2) {
    // Pinch zoom
    const d = MK._pinchDist();
    if (C._lastPinch > 0) {
      const ratio = C._lastPinch / d;
      C._targetDist = Math.max(C.minDistance, Math.min(C.maxDistance, C._targetDist * ratio));
    }
    C._lastPinch = d;
  }
};

MK._onPointerUp = function (e) {
  const C = MK.cam;
  C._pointers.delete(e.pointerId);
  if (C._pointers.size < 2) C._lastPinch = 0;
};

MK._onWheel = function (e) {
  e.preventDefault();
  const C = MK.cam;
  const k = (e.deltaY > 0) ? 1.08 : 0.93;
  C._targetDist = Math.max(C.minDistance, Math.min(C.maxDistance, C._targetDist * k));
};

MK._pinchDist = function () {
  const C = MK.cam;
  if (C._pointers.size < 2) return 0;
  const arr = Array.from(C._pointers.values());
  const dx = arr[0].x - arr[1].x, dy = arr[0].y - arr[1].y;
  return Math.hypot(dx, dy);
};

MK.cam.update = function (dt) {
  const C = MK.cam;
  // Optional auto-spin when idle
  if (C._autoSpin) C._targetYaw += dt * 0.25;
  // Smoothing (frame-rate independent lerp)
  const k = Math.min(1, dt * 12);
  C._yaw += (C._targetYaw - C._yaw) * k;
  C._pitch += (C._targetPitch - C._pitch) * k;
  C._dist += (C._targetDist - C._dist) * k;
  C._targetCenter.lerp(C.target, k);
  MK._applyCamera();
};

MK.autoFrameCharacter = function () {
  const C = MK.cam;
  C._targetYaw = 0;
  C._targetPitch = 0.05;
  C._targetDist = 4.2;
  C.target.set(0, 1.05, 0);
};

MK.zoomToFace = function () {
  const C = MK.cam;
  C._targetYaw = 0;
  C._targetPitch = 0.0;
  C._targetDist = 1.8;
  C.target.set(0, 1.85, 0);
};
