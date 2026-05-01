// === Merge Fortress TD — Synthetic WebAudio SFX (no external files) ===
window.MF = window.MF || {};

MF.audio = {
  ctx: null,
  enabled: true,
  master: null,
  initialized: false
};

MF.audio.init = function(){
  if (MF.audio.initialized) return;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    MF.audio.ctx = new Ctx();
    MF.audio.master = MF.audio.ctx.createGain();
    MF.audio.master.gain.value = 0.4;
    MF.audio.master.connect(MF.audio.ctx.destination);
    MF.audio.initialized = true;
  } catch(e){}
  // Restore enabled flag
  if (MF.state && MF.state.meta && MF.state.meta.soundOff){
    MF.audio.enabled = false;
    if (MF.audio.master) MF.audio.master.gain.value = 0;
  }
};

MF.audio.toggle = function(){
  MF.audio.enabled = !MF.audio.enabled;
  if (MF.audio.master) MF.audio.master.gain.value = MF.audio.enabled ? 0.4 : 0;
  if (MF.state && MF.state.meta){
    MF.state.meta.soundOff = !MF.audio.enabled;
    if (MF.saveProgress) MF.saveProgress();
  }
  return MF.audio.enabled;
};

// Helper: schedule a tone with envelope
MF.audio._tone = function(opts){
  if (!MF.audio.enabled || !MF.audio.ctx) return;
  var ctx = MF.audio.ctx;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = opts.type || 'sine';
  osc.frequency.setValueAtTime(opts.freq || 440, ctx.currentTime);
  if (opts.freqTo){
    osc.frequency.exponentialRampToValueAtTime(opts.freqTo, ctx.currentTime + (opts.dur || 0.2));
  }
  // Envelope
  var att = opts.att != null ? opts.att : 0.005;
  var dur = opts.dur || 0.2;
  var peak = opts.gain || 0.2;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + att);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(MF.audio.master);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur + 0.05);
};

MF.audio._noise = function(opts){
  if (!MF.audio.enabled || !MF.audio.ctx) return;
  var ctx = MF.audio.ctx;
  var bufSize = ctx.sampleRate * (opts.dur || 0.15);
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1);
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(opts.gain || 0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (opts.dur || 0.15));
  // Optional bandpass filter
  if (opts.filter){
    var bp = ctx.createBiquadFilter();
    bp.type = opts.filter.type || 'bandpass';
    bp.frequency.value = opts.filter.freq || 800;
    bp.Q.value = opts.filter.Q || 4;
    src.connect(bp); bp.connect(gain);
  } else {
    src.connect(gain);
  }
  gain.connect(MF.audio.master);
  src.start(ctx.currentTime);
};

// === Public SFX functions ===
MF.audio.hit = function(){
  MF.audio._noise({ dur: 0.08, gain: 0.15, filter: { type:'bandpass', freq: 1800, Q: 5 } });
};
MF.audio.kill = function(){
  MF.audio._tone({ type:'sawtooth', freq: 220, freqTo: 80, dur: 0.22, gain: 0.18 });
};
MF.audio.merge = function(){
  MF.audio._tone({ type:'sine', freq: 220, freqTo: 880, dur: 0.35, gain: 0.22 });
  setTimeout(function(){ MF.audio._tone({ type:'triangle', freq: 660, freqTo: 1320, dur: 0.25, gain: 0.18 }); }, 80);
};
MF.audio.ultReady = function(){
  // Warm major chord (root + 3rd + 5th)
  MF.audio._tone({ type:'triangle', freq: 392, dur: 0.35, gain: 0.18 });
  MF.audio._tone({ type:'triangle', freq: 494, dur: 0.35, gain: 0.14 });
  MF.audio._tone({ type:'triangle', freq: 587, dur: 0.4, gain: 0.16 });
};
MF.audio.ultCast = function(){
  MF.audio._noise({ dur: 0.5, gain: 0.3, filter: { type:'lowpass', freq: 250, Q: 1 } });
  MF.audio._tone({ type:'sawtooth', freq: 60, freqTo: 30, dur: 0.6, gain: 0.3 });
};
MF.audio.levelUp = function(){
  // Ascending arpeggio
  [392, 523, 659, 784].forEach(function(f, i){
    setTimeout(function(){ MF.audio._tone({ type:'square', freq: f, dur: 0.16, gain: 0.14 }); }, i * 70);
  });
};
MF.audio.click = function(){
  MF.audio._tone({ type:'sine', freq: 880, freqTo: 1320, dur: 0.06, gain: 0.1 });
};
MF.audio.fortressDmg = function(){
  MF.audio._noise({ dur: 0.25, gain: 0.28, filter: { type:'lowpass', freq: 180, Q: 1.2 } });
};
MF.audio.coin = function(){
  MF.audio._tone({ type:'square', freq: 988, dur: 0.06, gain: 0.1 });
  setTimeout(function(){ MF.audio._tone({ type:'square', freq: 1318, dur: 0.1, gain: 0.1 }); }, 60);
};
MF.audio.achievement = function(){
  [523, 659, 784, 1047].forEach(function(f, i){
    setTimeout(function(){ MF.audio._tone({ type:'triangle', freq: f, dur: 0.22, gain: 0.18 }); }, i * 90);
  });
};
// P14: discreet wolf howl when spectral wolf dies
MF.audio.wolfHowl = function(){
  MF.audio._tone({ type:'sawtooth', freq: 180, freqTo: 240, dur: 0.30, gain: 0.10 });
  setTimeout(function(){ MF.audio._tone({ type:'sawtooth', freq: 240, freqTo: 130, dur: 0.45, gain: 0.08 }); }, 280);
};
// P14: ambient sounds
MF.audio.runStart = function(){
  // Drumroll-like attack
  MF.audio._noise({ dur: 0.4, gain: 0.18, filter: { type:'lowpass', freq: 200, Q: 1 } });
  MF.audio._tone({ type:'sawtooth', freq: 80, freqTo: 220, dur: 0.5, gain: 0.18 });
};
MF.audio.waveEnd = function(){
  // Two ascending bell tones
  MF.audio._tone({ type:'triangle', freq: 660, dur: 0.35, gain: 0.16 });
  setTimeout(function(){ MF.audio._tone({ type:'triangle', freq: 880, dur: 0.45, gain: 0.18 }); }, 200);
};
MF.audio.uiClick = function(){
  // Soft tick
  MF.audio._tone({ type:'sine', freq: 540, freqTo: 720, dur: 0.045, gain: 0.07 });
};

// === PROCEDURAL MUSIC ENGINE ===
// Three layers: bass drone, pad chord, arpeggio. Modes adapt intensity.
MF.audio.music = {
  active: false,
  mode: 'menu',           // 'menu' | 'play' | 'boss' | 'end'
  bassOsc: null,
  padOscs: [],
  padGain: null,
  arpInterval: null,
  arpStep: 0,
  bassGain: null,
  busGain: null
};

MF.audio._modeProfiles = {
  menu:  { bpm: 70, root: 110, scale: [0, 3, 5, 7, 10],  pad: [0, 7, 12], padGain: 0.10, arpGain: 0.06, bassGain: 0.10 },
  play:  { bpm: 110, root: 130, scale: [0, 2, 3, 5, 7, 10], pad: [0, 7, 14], padGain: 0.12, arpGain: 0.08, bassGain: 0.12 },
  boss:  { bpm: 130, root: 87,  scale: [0, 1, 5, 6, 8, 11], pad: [0, 6, 11], padGain: 0.16, arpGain: 0.10, bassGain: 0.16 },
  end:   { bpm: 60, root: 174, scale: [0, 4, 7, 11], pad: [0, 4, 7],  padGain: 0.10, arpGain: 0.05, bassGain: 0.08 }
};

// Per-world variants (override 'play' profile at runtime)
MF.audio._worldProfiles = {
  grass:   { bpm: 100, root: 130, scale: [0, 2, 4, 5, 7, 9, 11], pad: [0, 4, 7], padGain: 0.11, arpGain: 0.07, bassGain: 0.10 },     // major bright
  desert:  { bpm: 90,  root: 138, scale: [0, 1, 4, 5, 7, 8, 11], pad: [0, 5, 8], padGain: 0.12, arpGain: 0.08, bassGain: 0.13 },     // mid-eastern
  frozen:  { bpm: 80,  root: 196, scale: [0, 2, 4, 6, 9, 11],   pad: [0, 4, 11], padGain: 0.14, arpGain: 0.09, bassGain: 0.08 },     // crystalline high
  lava:    { bpm: 130, root: 87,  scale: [0, 3, 5, 7, 10],      pad: [0, 7, 10], padGain: 0.15, arpGain: 0.09, bassGain: 0.18 },     // bass-heavy
  necro:   { bpm: 95,  root: 110, scale: [0, 1, 3, 5, 6, 8, 11], pad: [0, 3, 11], padGain: 0.14, arpGain: 0.08, bassGain: 0.14 },    // sinister minor
  sky:     { bpm: 105, root: 165, scale: [0, 2, 4, 7, 9, 11],   pad: [0, 7, 14], padGain: 0.10, arpGain: 0.07, bassGain: 0.08 }      // uplifting
};

// Apply world override to the play profile
MF.audio._currentWorldId = null;
MF.audio.setWorld = function(worldId){
  MF.audio._currentWorldId = worldId;
  if (MF.audio.music && MF.audio.music.mode === 'play'){
    MF.audio.music.setMode('play');     // re-trigger to use new world profile
  }
};

MF.audio.music.start = function(mode){
  if (!MF.audio.ctx) MF.audio.init();
  if (!MF.audio.ctx) return;
  if (MF.audio.music.active) MF.audio.music.stop();
  if (!MF.audio.enabled) return;
  MF.audio.music.active = true;
  MF.audio.music.setMode(mode || 'menu');
};

MF.audio.music.stop = function(){
  var m = MF.audio.music;
  m.active = false;
  if (m.arpInterval){ clearInterval(m.arpInterval); m.arpInterval = null; }
  if (m.bassOsc){ try { m.bassOsc.stop(); } catch(e){} m.bassOsc = null; }
  m.padOscs.forEach(function(o){ try { o.stop(); } catch(e){} });
  m.padOscs = [];
};

MF.audio.music.setMode = function(mode){
  var m = MF.audio.music;
  if (!m.active && mode){ MF.audio.music.start(mode); return; }
  m.mode = mode;
  var prof = MF.audio._modeProfiles[mode] || MF.audio._modeProfiles.menu;
  // World override on 'play' mode
  if (mode === 'play' && MF.audio._currentWorldId && MF.audio._worldProfiles[MF.audio._currentWorldId]){
    prof = MF.audio._worldProfiles[MF.audio._currentWorldId];
  }
  var ctx = MF.audio.ctx;
  if (!ctx) return;
  // Cleanup old layer
  if (m.arpInterval){ clearInterval(m.arpInterval); m.arpInterval = null; }
  if (m.bassOsc){ try { m.bassOsc.stop(); } catch(e){} m.bassOsc = null; }
  m.padOscs.forEach(function(o){ try { o.stop(); } catch(e){} });
  m.padOscs = [];
  // Bus gain (allows global music attenuation)
  if (!m.busGain){
    m.busGain = ctx.createGain();
    m.busGain.gain.value = 0.55;        // music master sub-bus
    m.busGain.connect(MF.audio.master);
  }
  // Bass drone
  m.bassOsc = ctx.createOscillator();
  m.bassGain = ctx.createGain();
  m.bassOsc.type = 'sawtooth';
  m.bassOsc.frequency.value = prof.root;
  m.bassGain.gain.value = prof.bassGain;
  // Lowpass for warmth
  var bassLP = ctx.createBiquadFilter();
  bassLP.type = 'lowpass';
  bassLP.frequency.value = 280;
  bassLP.Q.value = 0.7;
  m.bassOsc.connect(bassLP);
  bassLP.connect(m.bassGain);
  m.bassGain.connect(m.busGain);
  m.bassOsc.start();
  // Pad chord (3 oscillators triangle)
  m.padGain = ctx.createGain();
  m.padGain.gain.value = prof.padGain;
  m.padGain.connect(m.busGain);
  prof.pad.forEach(function(semi){
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = prof.root * Math.pow(2, semi / 12) * 2;       // octave up
    osc.connect(m.padGain);
    osc.start();
    m.padOscs.push(osc);
  });
  // Arpeggio (steps the scale at BPM rate)
  var beatMs = (60000 / prof.bpm) / 2;     // eighth notes
  m.arpStep = 0;
  m.arpInterval = setInterval(function(){
    if (!m.active) return;
    var idx = m.arpStep % prof.scale.length;
    var oct = Math.floor(m.arpStep / prof.scale.length) % 2;       // 2 octaves up
    var semi = prof.scale[idx];
    var freq = prof.root * Math.pow(2, (semi + 12 + oct * 12) / 12) * 2;
    var note = ctx.createOscillator();
    var nGain = ctx.createGain();
    note.type = 'square';
    note.frequency.value = freq;
    nGain.gain.setValueAtTime(0, ctx.currentTime);
    nGain.gain.linearRampToValueAtTime(prof.arpGain, ctx.currentTime + 0.01);
    nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beatMs / 1000);
    note.connect(nGain);
    nGain.connect(m.busGain);
    note.start();
    note.stop(ctx.currentTime + beatMs / 1000 + 0.05);
    m.arpStep++;
  }, beatMs);
};

// Update toggle to also affect music
var _origToggle = MF.audio.toggle;
MF.audio.toggle = function(){
  var on = _origToggle();
  if (!on) MF.audio.music.stop();
  else if (MF.audio.music.mode) MF.audio.music.start(MF.audio.music.mode);
  return on;
};

// Auto-init on first user interaction (mobile autoplay policy)
window.addEventListener('pointerdown', function _firstAudio(){
  MF.audio.init();
  if (MF.audio.ctx && MF.audio.ctx.state === 'suspended') MF.audio.ctx.resume();
  // Start menu music on first interaction
  if (MF.audio.enabled && !MF.audio.music.active) MF.audio.music.start('menu');
  window.removeEventListener('pointerdown', _firstAudio);
}, { passive: true });
