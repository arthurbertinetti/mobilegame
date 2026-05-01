// === Merge Fortress TD — Touch + mouse: drag-merge + pan/zoom ===
window.MF = window.MF || {};

MF.input = {
  pointers: {},   // pointerId → {x, y}
  pointerDown: false,
  startX: 0, startY: 0,
  curX: 0, curY: 0,
  dragging: null,
  candidate: null,
  selected: null,
  dragMoved: false,
  panning: false,
  pinchStartDist: 0,
  pinchStartZoom: 1,
  preview: null,
  raycaster: null,
  lastPanX: 0, lastPanY: 0
};

MF.input.init = function(){
  var canvas = document.getElementById('mf-canvas');
  canvas.addEventListener('pointerdown', MF.input.onDown, { passive: false });
  canvas.addEventListener('pointermove', MF.input.onMove, { passive: false });
  canvas.addEventListener('pointerup', MF.input.onUp, { passive: false });
  canvas.addEventListener('pointercancel', MF.input.onUp, { passive: false });
  canvas.addEventListener('wheel', MF.input.onWheel, { passive: false });

  // Drag preview element
  var preview = document.createElement('div');
  preview.id = 'mf-drag-preview';
  document.body.appendChild(preview);
  MF.input.preview = preview;
};

MF.input.onWheel = function(e){
  if (MF.state.screen !== 'play' || MF.state.paused) return;
  e.preventDefault();
  var delta = e.deltaY < 0 ? 1.12 : 0.89;
  MF.zoomCamera(delta);
};

MF.input.onDown = function(e){
  if (MF.state.screen !== 'play' || MF.state.paused || MF.state.outcome) return;
  e.preventDefault();
  MF.input.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
  var nPtr = Object.keys(MF.input.pointers).length;

  if (nPtr === 1){
    // First finger: pick unit OR start panning
    MF.input.pointerDown = true;
    MF.input.startX = MF.input.curX = MF.input.lastPanX = e.clientX;
    MF.input.startY = MF.input.curY = MF.input.lastPanY = e.clientY;
    MF.input.dragging = null;
    MF.input.dragMoved = false;
    MF.input.panning = false;
    var unit = MF.input.pickUnit(e.clientX, e.clientY);
    MF.input.candidate = unit;
    // P14: subtle highlight, no more scale-up (was hiding the map)
    if (unit && unit.mesh.userData.bodyGroup){
      // Tiny lift effect (no scale change)
      unit.mesh.userData._origY = unit.mesh.position.y;
      unit.mesh.position.y = (unit.mesh.position.y || 0) + 0.06;
    }
  } else if (nPtr === 2){
    // Two fingers: pinch zoom + pan
    var ids = Object.keys(MF.input.pointers);
    var p1 = MF.input.pointers[ids[0]], p2 = MF.input.pointers[ids[1]];
    MF.input.pinchStartDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    MF.input.pinchStartZoom = MF.three.camZoom;
    // Cancel any pending drag — restore Y position
    if (MF.input.candidate && MF.input.candidate.mesh.userData._origY != null){
      MF.input.candidate.mesh.position.y = MF.input.candidate.mesh.userData._origY;
      MF.input.candidate.mesh.userData._origY = null;
    }
    MF.input.candidate = null;
    MF.input.dragging = null;
    MF.input.preview.style.display = 'none';
  }
};

MF.input.onMove = function(e){
  if (!(e.pointerId in MF.input.pointers)) return;
  MF.input.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
  var nPtr = Object.keys(MF.input.pointers).length;

  if (nPtr === 2){
    // Pinch zoom + pan center
    var ids = Object.keys(MF.input.pointers);
    var p1 = MF.input.pointers[ids[0]], p2 = MF.input.pointers[ids[1]];
    var d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (MF.input.pinchStartDist > 0){
      var ratio = d / MF.input.pinchStartDist;
      MF.three.camZoom = Math.max(0.6, Math.min(2.6, MF.input.pinchStartZoom * ratio));
      MF._fitCamera();
    }
    return;
  }

  MF.input.curX = e.clientX;
  MF.input.curY = e.clientY;
  if (!MF.input.pointerDown) return;
  var dx = e.clientX - MF.input.startX;
  var dy = e.clientY - MF.input.startY;

  if (!MF.input.dragMoved && Math.hypot(dx, dy) > 8){
    MF.input.dragMoved = true;
    if (MF.input.candidate){
      // Start drag-merge
      MF.input.dragging = MF.input.candidate;
      MF.input.preview.style.display = 'block';
      var data = MF.UNITS[MF.input.dragging.id];
      var color = data.ranks[MF.input.dragging.rank - 1].color;
      var hex = ('00000' + color.toString(16)).slice(-6);
      MF.input.preview.style.background =
        'radial-gradient(circle at 35% 30%,rgba(255,255,255,.85),#' + hex + ' 60%,transparent 75%)';
    } else {
      // Start panning
      MF.input.panning = true;
    }
  }

  if (MF.input.dragging){
    MF.input.preview.style.left = e.clientX + 'px';
    MF.input.preview.style.top  = e.clientY + 'px';
    // 3D target cell highlight
    var ground = MF.screenToGround(e.clientX, e.clientY);
    if (ground){
      var cell = MF.worldToGrid(ground.x, ground.z);
      MF.input.updateDropPreview(cell);
    }
  } else if (MF.input.panning){
    var pdx = e.clientX - MF.input.lastPanX;
    var pdy = e.clientY - MF.input.lastPanY;
    MF.panCamera(pdx, pdy);
    MF.input.lastPanX = e.clientX;
    MF.input.lastPanY = e.clientY;
  }
};

MF.input.onUp = function(e){
  delete MF.input.pointers[e.pointerId];
  var nPtr = Object.keys(MF.input.pointers).length;
  if (nPtr === 0){
    if (!MF.input.pointerDown) return;
    MF.input.pointerDown = false;
    e.preventDefault();
    // Restore Y lift on candidate
    if (MF.input.candidate && MF.input.candidate.mesh.userData._origY != null){
      MF.input.candidate.mesh.position.y = MF.input.candidate.mesh.userData._origY;
      MF.input.candidate.mesh.userData._origY = null;
    }
    if (MF.input.dragging){
      MF.input.preview.style.display = 'none';
      MF.input.hideDropPreview();
      var ground = MF.screenToGround(e.clientX, e.clientY);
      if (ground){
        var cell = MF.worldToGrid(ground.x, ground.z);
        if (cell){
          MF.trySwapOrMove(MF.input.dragging, cell.c, cell.r);
          MF.ui.update();
        }
      }
      MF.input.dragging = null;
    } else if (!MF.input.dragMoved && !MF.input.panning){
      // Tap: select unit & show info — also handle double-tap auto-merge
      var unit = MF.input.pickUnit(e.clientX, e.clientY);
      if (unit){
        var now = performance.now();
        if (MF.input._lastTapUnit === unit && (now - (MF.input._lastTapAt || 0)) < 350){
          MF.input._lastTapUnit = null;
          MF.input._lastTapAt = 0;
          MF.input.tryAutoMerge(unit);
        } else {
          MF.input._lastTapUnit = unit;
          MF.input._lastTapAt = now;
          MF.input.selected = unit;
          MF.ui.showUnitInfo(unit, e.clientX, e.clientY);
        }
      } else {
        MF.input.selected = null;
        MF.ui.hideUnitInfo();
        // Detect swipe-up = trigger ultime in chaos mode
        var dy = MF.input.startY - e.clientY;
        var dx = Math.abs(e.clientX - MF.input.startX);
        if (MF.state.mode === 'chaos' && dy > 80 && dx < 60 && MF.chaos_triggerUltimate){
          MF.chaos_triggerUltimate();
        }
      }
    }
    MF.input.candidate = null;
    MF.input.panning = false;
    MF.input.pinchStartDist = 0;
  } else if (nPtr === 1){
    // Going from 2 to 1: re-init single-pointer state to remaining pointer
    var ids = Object.keys(MF.input.pointers);
    var p = MF.input.pointers[ids[0]];
    MF.input.startX = MF.input.curX = MF.input.lastPanX = p.x;
    MF.input.startY = MF.input.curY = MF.input.lastPanY = p.y;
    MF.input.pointerDown = true;
    MF.input.dragMoved = true;   // already moved past threshold
    MF.input.panning = true;
    MF.input.pinchStartDist = 0;
  }
};

// 3D drop preview — highlight target cell
MF.input.updateDropPreview = function(cell){
  if (!MF.input._dropMesh && typeof THREE !== 'undefined'){
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xffd96a, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide });
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.50, 0.65, 28), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.20;
    MF.three.worldGroup.add(ring);
    MF.input._dropMesh = ring;
    // P14: pulsing inner glow disc (more visible)
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xffd96a, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide });
    var glow = new THREE.Mesh(new THREE.CircleGeometry(0.50, 24), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.18;
    MF.three.worldGroup.add(glow);
    MF.input._dropGlow = glow;
  }
  var mesh = MF.input._dropMesh;
  var glow = MF.input._dropGlow;
  if (!mesh) return;
  var canMerge = false;
  if (cell && MF.getCell){
    var target = MF.getCell(cell.c, cell.r);
    if (target && MF.canMerge && MF.canMerge(MF.input.dragging, target)) canMerge = true;
  }
  if (canMerge){
    // Mergeable: bright green + scale pulse
    mesh.material.color.setHex(0x60ff60);
    mesh.material.opacity = 0.9;
    if (glow){ glow.material.color.setHex(0x60ff60); glow.material.opacity = 0.45; glow.visible = true; }
    mesh.visible = true;
  } else if (cell && MF.isPlaceable(cell.c, cell.r)){
    // Free placement: gold
    mesh.material.color.setHex(0xffd96a);
    mesh.material.opacity = 0.7;
    if (glow){ glow.material.color.setHex(0xffd96a); glow.material.opacity = 0.25; glow.visible = true; }
    mesh.visible = true;
  } else {
    mesh.visible = false;
    if (glow) glow.visible = false;
  }
  if (cell && (mesh.visible || (glow && glow.visible))){
    var p = MF.gridToWorld(cell.c, cell.r);
    mesh.position.set(p.x, 0.20, p.z);
    if (glow) glow.position.set(p.x, 0.18, p.z);
  }
};

MF.input.hideDropPreview = function(){
  if (MF.input._dropMesh) MF.input._dropMesh.visible = false;
  if (MF.input._dropGlow) MF.input._dropGlow.visible = false;
};

// Search for a compatible merge partner for a unit and auto-merge if found
MF.input.tryAutoMerge = function(unit){
  if (!unit) return false;
  for (var i = 0; i < MF.units.length; i++){
    var other = MF.units[i];
    if (other === unit) continue;
    if (MF.canMerge(unit, other)){
      MF.tryMerge(unit, other);
      MF.ui.update();
      MF.fx.spawnRing(unit.pos, 0xffd96a, { scale: 2, life: 0.4 });
      return true;
    }
  }
  if (MF.fx && MF.fx.showBanner) MF.fx.showBanner('🔍 Aucune fusion possible', 'wave');
  return false;
};

// Pick a unit by raycast
MF.input.pickUnit = function(px, py){
  var T = MF.three;
  if (!T.camera) return null;
  if (!MF.input.raycaster) MF.input.raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2(
    (px / window.innerWidth)  * 2 - 1,
    -(py / window.innerHeight) * 2 + 1
  );
  MF.input.raycaster.setFromCamera(ndc, T.camera);
  var meshes = [];
  for (var i = 0; i < MF.units.length; i++) meshes.push(MF.units[i].mesh);
  if (meshes.length){
    var hits = MF.input.raycaster.intersectObjects(meshes, true);
    if (hits.length){
      var obj = hits[0].object;
      while (obj){
        for (var j = 0; j < MF.units.length; j++){
          if (MF.units[j].mesh === obj) return MF.units[j];
        }
        obj = obj.parent;
      }
    }
  }
  // Fallback: closest unit on ground
  var ground = MF.screenToGround(px, py);
  if (!ground) return null;
  var best = null, bestD = 0.85;
  for (var k = 0; k < MF.units.length; k++){
    var u = MF.units[k];
    var d = Math.hypot(u.pos.x - ground.x, u.pos.z - ground.z);
    if (d < bestD){ bestD = d; best = u; }
  }
  return best;
};
