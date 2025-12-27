"use strict";

// ================== DOM & CANVAS ==================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("scoreValue");
const levelEl = document.getElementById("levelValue");
const healthBarInner = document.getElementById("healthBarInner");
const healthText = document.getElementById("healthText");
const finalScoreEl = document.getElementById("finalScore");

const menuPanel = document.getElementById("menuPanel");
const gameOverPanel = document.getElementById("gameOverPanel");
const pausePanel = document.getElementById("pausePanel");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const resumeBtn = document.getElementById("resumeBtn");
const pauseBtn = document.getElementById("pauseBtn");
const muteBtn = document.getElementById("muteBtn");

// Kontrol & skill mobile
const mobilePauseBtn = document.getElementById("mobilePauseBtn");
const joystickBase = document.getElementById("joystickBase");
const joystickKnob = document.getElementById("joystickKnob");
const skillDashBtn = document.getElementById("skillDash");
const skillShieldBtn = document.getElementById("skillShield");
const skillSlowBtn = document.getElementById("skillSlow");

// UI pemilihan skin
const skinPrevBtn = document.getElementById("skinPrevBtn");
const skinNextBtn = document.getElementById("skinNextBtn");
const skinNameEl = document.getElementById("skinName");

// UI pemilihan map
const mapPrevBtn = document.getElementById("mapPrevBtn");
const mapNextBtn = document.getElementById("mapNextBtn");
const mapNameEl = document.getElementById("mapName");

// Overlay rotate ke landscape
const rotateHint = document.getElementById("rotateHint");

// ================== SKIN SYSTEM (Biru & Oren) ==================
const fishSkins = [
  {
    name: "Biru",
    src: "fish_biru.png",
    auraColor: "rgba(100, 181, 246, 0.95)", // biru muda
  },
  {
    name: "Oren",
    src: "fish_oren.png",
    auraColor: "rgba(255, 183, 77, 0.95)", // oranye
  },
];

let currentSkinIndex = 0;
const fishImg = new Image();
let currentAuraColor = fishSkins[0].auraColor;

function applyCurrentSkin() {
  const skin = fishSkins[currentSkinIndex];
  fishImg.src = skin.src;
  currentAuraColor = skin.auraColor;
  if (skinNameEl) skinNameEl.textContent = skin.name;
}

function changeSkin(delta) {
  const len = fishSkins.length;
  currentSkinIndex = (currentSkinIndex + delta + len) % len;
  applyCurrentSkin();
}

// hanya pakai pointerdown supaya di HP 1 tap = 1 ganti skin
function bindSkinButtons() {
  if (skinPrevBtn) {
    const prevHandler = (e) => {
      e.preventDefault();
      changeSkin(-1);
    };
    skinPrevBtn.addEventListener("pointerdown", prevHandler, { passive: false });
  }

  if (skinNextBtn) {
    const nextHandler = (e) => {
      e.preventDefault();
      changeSkin(1);
    };
    skinNextBtn.addEventListener("pointerdown", nextHandler, { passive: false });
  }
}

// ================== MAP SYSTEM (Kuburan Kapal, Atlantis, Terumbu Karang) ==================
const maps = [
  {
    id: "ship",
    name: "Kuburan Kapal",
    gradientStops: [
      { pos: 0.0, color: "#001219" },
      { pos: 0.3, color: "#003049" },
      { pos: 0.7, color: "#001b2a" },
      { pos: 1.0, color: "#000814" },
    ],
    floorColor: "#000814",
    rockColor: "#00111a",
    kelpColor: "rgba(46, 125, 50, 0.9)",
    kelpHeadColor: "rgba(165, 214, 167, 0.95)",
    causticAlpha: 0.03,
    causticColor: "rgba(200,220,255,0.5)",
    coralPalettes: [
      { main: "#6d4c41", edge: "#a1887f" },
      { main: "#5d4037", edge: "#8d6e63" },
    ],
    coralCount: 6,
    sandDecorCount: 6,
    distantFishColor: "#90caf9",
    distantFishAlpha: 0.25,
    shipWoodColor: "#5d4037",
    shipWoodHighlightColor: "#8d6e63",
    shipMetalColor: "#90a4ae",
    shipWreckCount: 6,
    ruinCount: 0,
  },
  {
    id: "atlantis",
    name: "Atlantis",
    gradientStops: [
      { pos: 0.0, color: "#001b2e" },
      { pos: 0.25, color: "#004e7c" },
      { pos: 0.6, color: "#007c91" },
      { pos: 1.0, color: "#003049" },
    ],
    floorColor: "#002635",
    rockColor: "#002739",
    kelpColor: "rgba(76, 175, 80, 0.9)",
    kelpHeadColor: "rgba(200, 230, 201, 0.95)",
    causticAlpha: 0.08,
    causticColor: "rgba(255,255,255,0.8)",
    coralPalettes: [
      { main: "#4db6ac", edge: "#b2dfdb" },
      { main: "#81d4fa", edge: "#b3e5fc" },
    ],
    coralCount: 8,
    sandDecorCount: 10,
    distantFishColor: "#e0f7fa",
    distantFishAlpha: 0.45,
    ruinMainColor: "#cfd8dc",
    ruinHighlightColor: "#eceff1",
    crystalColor: "#80deea",
    shipWreckCount: 0,
    ruinCount: 8,
  },
  {
    id: "reef",
    name: "Terumbu Karang",
    gradientStops: [
      { pos: 0.0, color: "#290c46" },
      { pos: 0.25, color: "#3b1c65" },
      { pos: 0.6, color: "#1b3b5a" },
      { pos: 1.0, color: "#03131f" },
    ],
    floorColor: "#12041d",
    rockColor: "#1b1030",
    kelpColor: "rgba(139, 195, 74, 0.9)",
    kelpHeadColor: "rgba(220, 237, 200, 0.95)",
    causticAlpha: 0.09,
    causticColor: "rgba(255,255,255,0.7)",
    coralPalettes: [
      { main: "#ba68c8", edge: "#e1bee7" },
      { main: "#f06292", edge: "#f8bbd0" },
      { main: "#ffb74d", edge: "#ffe0b2" },
      { main: "#4dd0e1", edge: "#b2ebf2" },
    ],
    coralCount: 16,
    sandDecorCount: 16,
    distantFishColor: "#e1f5fe",
    distantFishAlpha: 0.5,
    shipWreckCount: 0,
    ruinCount: 0,
  },
];

let currentMapIndex = 0;
let currentMap = maps[0];

function applyCurrentMap() {
  currentMap = maps[currentMapIndex] || maps[0];
  if (mapNameEl) mapNameEl.textContent = currentMap.name;
  initBackground(); // regenerate dekorasi sesuai map
}

function changeMap(delta) {
  const len = maps.length;
  currentMapIndex = (currentMapIndex + delta + len) % len;
  applyCurrentMap();
}

function bindMapButtons() {
  if (mapPrevBtn) {
    const handler = (e) => {
      e.preventDefault();
      changeMap(-1);
    };
    mapPrevBtn.addEventListener("pointerdown", handler, { passive: false });
  }
  if (mapNextBtn) {
    const handler = (e) => {
      e.preventDefault();
      changeMap(1);
    };
    mapNextBtn.addEventListener("pointerdown", handler, { passive: false });
  }
}

// ================== AUDIO: SFX & MUSIK ==================
function makeAudio(src, volume = 0.7, playbackRate = 1) {
  const a = new Audio(src);
  a.volume = volume;
  a.playbackRate = playbackRate;
  a.preload = "auto";
  return a;
}

const sfx = {
  coin: makeAudio("sfx_coin.wav", 0.7, 1.1),
  hitMine: makeAudio("sfx_mine.wav", 0.75, 1),
  hitJelly: makeAudio("sfx_jelly.wav", 0.7, 1),
  dash: makeAudio("sfx_dash.wav", 0.8, 1.1),
  shieldOn: makeAudio("sfx_shield.wav", 0.8, 1),
  slowOn: makeAudio("sfx_slow.wav", 0.8, 0.95),
};

function playSfx(audio) {
  if (!audio) return;
  try {
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.playbackRate = audio.playbackRate;
    clone.play().catch(() => {});
  } catch {}
}

// Musik background
const bgMusic = makeAudio("bg_music.mp3", 0.35, 1);
bgMusic.loop = true;
let musicMuted = false;

function playBgMusic() {
  if (musicMuted) return;
  try {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  } catch {}
}

function stopBgMusic() {
  try {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  } catch {}
}

function updateMuteButtonUI() {
  if (!muteBtn) return;
  muteBtn.textContent = musicMuted ? "Unmute Musik" : "Mute Musik";
}

// ================== ORIENTASI / ROTATE HINT ==================
function updateOrientationHint() {
  if (!rotateHint) return;
  const isPortrait = window.innerHeight >= window.innerWidth;
  rotateHint.style.display = isPortrait ? "flex" : "none";
}

// ================== STATE GAME & TRANSITION ==================
const STATE = {
  MENU: "menu",
  TRANSITION: "transition",
  PLAYING: "playing",
  PAUSED: "paused",
  GAMEOVER: "gameover",
};

let currentState = STATE.MENU;

const keys = {};
let worldSpeed = 160;
let elapsed = 0;
let distance = 0;
let score = 0;
let coinsCollected = 0;
let level = 1;

let coinTimer = 0;
let hazardTimer = 0;
let bubbleTimer = 0;
let backgroundBubbleTimer = 0;

let lastTimestamp = 0;
let globalTime = 0;

// TRANSISI MASUK MAP
const mapTransition = {
  active: false,
  time: 0,
  duration: 2.2, // durasi transisi (detik)
};

function startMapTransition() {
  mapTransition.active = true;
  mapTransition.time = 0;
  setState(STATE.TRANSITION);
}

function updateMapTransition(dt) {
  if (!mapTransition.active) return;
  mapTransition.time += dt;
  if (mapTransition.time >= mapTransition.duration) {
    mapTransition.time = mapTransition.duration;
    mapTransition.active = false;
    setState(STATE.PLAYING);
  }
}

function getTransitionProgress() {
  if (!mapTransition.active && currentState !== STATE.TRANSITION) return 1;
  if (mapTransition.duration <= 0) return 1;
  return Math.min(1, mapTransition.time / mapTransition.duration);
}

// Joystick analog
const joystick = {
  active: false,
  pointerId: null,
  dirX: 0,
  dirY: 0,
  strength: 0, // 0..1
};

// Skill system (Dash, Shield, Slow)
const skills = {
  dash: { cooldown: 5, timer: 0 },
  shield: { cooldown: 10, timer: 0, active: false, duration: 3, remaining: 0 },
  slow: { cooldown: 12, timer: 0, active: false, duration: 3, remaining: 0 },
};

// ================== OBJEK GAME ==================
const player = {
  x: canvas.width * 0.2,
  y: canvas.height / 2,
  width: 80,
  height: 55,
  vx: 0,
  vy: 0,
  maxSpeed: 260,
  accel: 900,
  friction: 0.88,
  health: 100,
  maxHealth: 100,
  invincibleTimer: 0,
};

const coins = [];
const hazards = [];
const bubbles = [];
const bgRocks = [];
const kelpPlants = [];
const distantFish = [];
const corals = [];
const sandDecor = [];
const shipWrecks = [];
const ruins = [];

// ================== INPUT KEYBOARD ==================
window.addEventListener(
  "keydown",
  (e) => {
    const key = e.key.toLowerCase();

    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d",
      ].includes(key)
    ) {
      keys[key] = true;
      e.preventDefault();
    }

    if (key === "p") {
      e.preventDefault();
      togglePause();
    }

    if (key === " " && currentState === STATE.MENU) {
      e.preventDefault();
      startRun();
    }

    if (key === "j") {
      e.preventDefault();
      attemptDash();
    }
    if (key === "k") {
      e.preventDefault();
      attemptShield();
    }
    if (key === "l") {
      e.preventDefault();
      attemptSlow();
    }
  },
  { passive: false }
);

window.addEventListener(
  "keyup",
  (e) => {
    const key = e.key.toLowerCase();
    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d",
      ].includes(key)
    ) {
      keys[key] = false;
      e.preventDefault();
    }
  },
  { passive: false }
);

// ================== JOYSTICK ANALOG (MOBILE) ==================
if (joystickBase && joystickKnob) {
  const opts = { passive: false };
  joystickBase.addEventListener("pointerdown", onJoystickDown, opts);
  joystickBase.addEventListener("pointermove", onJoystickMove, opts);
  joystickBase.addEventListener("pointerup", onJoystickUp, opts);
  joystickBase.addEventListener("pointercancel", onJoystickUp, opts);
  joystickBase.addEventListener(
    "pointerleave",
    (e) => {
      if (joystick.active) onJoystickUp(e);
    },
    opts
  );
}

function onJoystickDown(e) {
  e.preventDefault();
  joystick.active = true;
  joystick.pointerId = e.pointerId;
  updateJoystick(e);
}

function onJoystickMove(e) {
  if (!joystick.active || e.pointerId !== joystick.pointerId) return;
  e.preventDefault();
  updateJoystick(e);
}

function onJoystickUp(e) {
  if (e.pointerId !== joystick.pointerId) return;
  e.preventDefault();
  joystick.active = false;
  joystick.pointerId = null;
  joystick.dirX = 0;
  joystick.dirY = 0;
  joystick.strength = 0;
  resetJoystickKnob();
}

function updateJoystick(e) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let dx = x - cx;
  let dy = y - cy;

  const maxDist = rect.width * 0.4;
  let dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (dist > maxDist) {
    dx = (dx / dist) * maxDist;
    dy = (dy / dist) * maxDist;
    dist = maxDist;
  }

  const strength = Math.min(1, dist / maxDist);

  if (strength < 0.1) {
    joystick.dirX = 0;
    joystick.dirY = 0;
    joystick.strength = 0;
  } else {
    joystick.dirX = dx / dist;
    joystick.dirY = dy / dist;
    joystick.strength = strength;
  }

  const knobX = cx + dx;
  const knobY = cy + dy;
  joystickKnob.style.left = `${knobX}px`;
  joystickKnob.style.top = `${knobY}px`;
}

function resetJoystickKnob() {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  joystickKnob.style.left = `${cx}px`;
  joystickKnob.style.top = `${cy}px`;
}

// ================== BANTUAN BUTTON MOBILE ==================
function bindMobileButton(btn, handler) {
  if (!btn) return;
  const opts = { passive: false };

  btn.addEventListener(
    "pointerdown",
    (e) => {
      e.preventDefault();
      handler();
    },
    opts
  );

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    handler();
  });
}

// ================== START RUN HELPER ==================
function startRun() {
  resetGame();
  initBackground(); // randomisasi dekor baru
  startMapTransition();
  playBgMusic();
}

// ================== UI BUTTON EVENTS ==================
if (startBtn) {
  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    startRun();
  });
}

// 🔴 PERUBAHAN DI SINI: retry sekarang BALIK KE MENU, bukan langsung startRun()
if (retryBtn) {
  retryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetGame();        // reset status game
    setState(STATE.MENU); // kembali ke menu → bisa pilih map & skin lagi
    // musik sudah di-stop saat gameOver(), jadi di sini tidak perlu apa-apa
  });
}

if (resumeBtn) {
  resumeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    togglePause(true);
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    togglePause();
  });
}

// Mobile pause
if (mobilePauseBtn) {
  bindMobileButton(mobilePauseBtn, togglePause);
}

// Skill buttons mobile
bindMobileButton(skillDashBtn, attemptDash);
bindMobileButton(skillShieldBtn, attemptShield);
bindMobileButton(skillSlowBtn, attemptSlow);

// Mute musik
if (muteBtn) {
  muteBtn.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      musicMuted = !musicMuted;
      bgMusic.muted = musicMuted;

      if (!musicMuted && currentState === STATE.PLAYING && bgMusic.paused) {
        playBgMusic();
      }

      updateMuteButtonUI();
    },
    { passive: false }
  );
}

// ================== STATE FUNCTIONS ==================
function setState(newState) {
  currentState = newState;
  updatePanels();
}

function updatePanels() {
  if (currentState === STATE.MENU) {
    menuPanel.classList.remove("hidden");
    gameOverPanel.classList.add("hidden");
    pausePanel.classList.add("hidden");
  } else if (currentState === STATE.GAMEOVER) {
    menuPanel.classList.add("hidden");
    gameOverPanel.classList.remove("hidden");
    pausePanel.classList.add("hidden");
  } else if (currentState === STATE.PAUSED) {
    menuPanel.classList.add("hidden");
    gameOverPanel.classList.add("hidden");
    pausePanel.classList.remove("hidden");
  } else {
    // PLAYING & TRANSITION -> panel hilang
    menuPanel.classList.add("hidden");
    gameOverPanel.classList.add("hidden");
    pausePanel.classList.add("hidden");
  }
}

function togglePause(forceResume) {
  if (currentState !== STATE.PLAYING && currentState !== STATE.PAUSED) return;

  if (forceResume) {
    if (currentState === STATE.PAUSED) setState(STATE.PLAYING);
    return;
  }

  if (currentState === STATE.PLAYING) setState(STATE.PAUSED);
  else if (currentState === STATE.PAUSED) setState(STATE.PLAYING);
}

function gameOver() {
  setState(STATE.GAMEOVER);
  finalScoreEl.textContent = Math.floor(score);
  stopBgMusic();
}

function resetGame() {
  player.x = canvas.width * 0.2;
  player.y = canvas.height / 2;
  player.vx = 0;
  player.vy = 0;
  player.health = player.maxHealth;
  player.invincibleTimer = 0;

  coins.length = 0;
  hazards.length = 0;
  bubbles.length = 0;

  elapsed = 0;
  distance = 0;
  score = 0;
  coinsCollected = 0;
  level = 1;
  worldSpeed = 160;
  coinTimer = 0;
  hazardTimer = 0;
  bubbleTimer = 0;
  backgroundBubbleTimer = 0;

  skills.dash.timer = 0;
  skills.shield.timer = 0;
  skills.shield.active = false;
  skills.shield.remaining = 0;
  skills.slow.timer = 0;
  skills.slow.active = false;
  skills.slow.remaining = 0;

  scoreEl.textContent = "0";
  levelEl.textContent = "1";
  updateHealthBar();
  updateSkillUI();
}

// ================== HEALTH & DAMAGE ==================
function updateHealthBar() {
  const ratio = player.health / player.maxHealth;
  const clamped = Math.max(0, Math.min(1, ratio));
  healthBarInner.style.width = `${clamped * 100}%`;

  if (ratio > 0.5) {
    healthBarInner.style.background =
      "linear-gradient(90deg,#8bc34a,#cddc39)";
  } else if (ratio > 0.25) {
    healthBarInner.style.background =
      "linear-gradient(90deg,#ff9800,#ffc107)";
  } else {
    healthBarInner.style.background =
      "linear-gradient(90deg,#ff5252,#ff1744)";
  }

  healthText.textContent = `${Math.round(player.health)} / ${player.maxHealth}`;
}

function damagePlayer(amount) {
  if (player.invincibleTimer > 0 || currentState !== STATE.PLAYING) return;

  let finalDamage = amount;
  if (skills.shield.active) {
    finalDamage *= 0.3;
  }

  player.health -= finalDamage;
  if (player.health < 0) player.health = 0;
  player.invincibleTimer = 0.4;
  updateHealthBar();

  if (player.health <= 0) {
    gameOver();
  }
}

// ================== SKILLS ==================
function attemptDash() {
  if (skills.dash.timer > 0 || currentState !== STATE.PLAYING) return;

  let dirX = joystick.dirX;
  let dirY = joystick.dirY;

  if (dirX === 0 && dirY === 0) {
    if (keys["arrowleft"] || keys["a"]) dirX = -1;
    else if (keys["arrowright"] || keys["d"]) dirX = 1;
    if (keys["arrowup"] || keys["w"]) dirY = -1;
    else if (keys["arrowdown"] || keys["s"]) dirY = 1;
  }

  if (dirX === 0 && dirY === 0) {
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > 10) {
      dirX = player.vx / speed;
      dirY = player.vy / speed;
    } else {
      dirX = 1;
      dirY = 0;
    }
  }

  const dashPower = 650;
  player.vx += dirX * dashPower;
  player.vy += dirY * dashPower;

  player.invincibleTimer = Math.max(player.invincibleTimer, 0.6);
  skills.dash.timer = skills.dash.cooldown;

  playSfx(sfx.dash);
  flashSkillButton(skillDashBtn);
  updateSkillUI();
}

function attemptShield() {
  if (
    skills.shield.timer > 0 ||
    skills.shield.active ||
    currentState !== STATE.PLAYING
  )
    return;

  skills.shield.active = true;
  skills.shield.remaining = skills.shield.duration;
  skills.shield.timer = skills.shield.cooldown;

  playSfx(sfx.shieldOn);
  flashSkillButton(skillShieldBtn);
  updateSkillUI();
}

function attemptSlow() {
  if (
    skills.slow.timer > 0 ||
    skills.slow.active ||
    currentState !== STATE.PLAYING
  )
    return;

  skills.slow.active = true;
  skills.slow.remaining = skills.slow.duration;
  skills.slow.timer = skills.slow.cooldown;

  playSfx(sfx.slowOn);
  flashSkillButton(skillSlowBtn);
  updateSkillUI();
}

function updateSkills(dt) {
  for (const key of ["dash", "shield", "slow"]) {
    if (skills[key].timer > 0) {
      skills[key].timer -= dt;
      if (skills[key].timer < 0) skills[key].timer = 0;
    }
  }

  if (skills.shield.active) {
    skills.shield.remaining -= dt;
    if (skills.shield.remaining <= 0) {
      skills.shield.active = false;
      skills.shield.remaining = 0;
    }
  }

  if (skills.slow.active) {
    skills.slow.remaining -= dt;
    if (skills.slow.remaining <= 0) {
      skills.slow.active = false;
      skills.slow.remaining = 0;
    }
  }

  updateSkillUI();
}

function updateSkillUI() {
  updateSkillButton(skillDashBtn, skills.dash.timer, false, "Dash (J)");
  updateSkillButton(
    skillShieldBtn,
    skills.shield.timer,
    skills.shield.active,
    "Shield (K)"
  );
  updateSkillButton(
    skillSlowBtn,
    skills.slow.timer,
    skills.slow.active,
    "Slow (L)"
  );
}

function updateSkillButton(btn, cooldown, active, label) {
  if (!btn) return;

  if (cooldown > 0) {
    btn.disabled = true;
    btn.classList.add("cooldown");
    btn.textContent = `CD ${cooldown.toFixed(1)}s`;
  } else {
    btn.disabled = false;
    btn.classList.remove("cooldown");
    btn.textContent = label;
  }

  if (active) btn.classList.add("active-skill");
  else btn.classList.remove("active-skill");
}

function flashSkillButton(btn) {
  if (!btn) return;
  btn.classList.add("flash");
  setTimeout(() => btn.classList.remove("flash"), 150);
}

// ================== BACKGROUND & BUBBLES ==================
function initBackground() {
  const m = currentMap || maps[0];

  bgRocks.length = 0;
  kelpPlants.length = 0;
  distantFish.length = 0;
  corals.length = 0;
  sandDecor.length = 0;
  shipWrecks.length = 0;
  ruins.length = 0;

  // batu
  for (let i = 0; i < 8; i++) {
    bgRocks.push(createRock(Math.random() * canvas.width));
  }

  // kelp
  for (let i = 0; i < 7; i++) {
    kelpPlants.push({
      x: Math.random() * canvas.width,
      baseY: canvas.height - 80,
      height: 60 + Math.random() * 90,
      swaySeed: Math.random() * Math.PI * 2,
      speedFactor: 0.2 + Math.random() * 0.2,
    });
  }

  // ikan kecil jauh
  for (let i = 0; i < 10; i++) {
    distantFish.push({
      x: Math.random() * canvas.width,
      y: 40 + Math.random() * (canvas.height * 0.4),
      size: 6 + Math.random() * 5,
      speedFactor: 0.15 + Math.random() * 0.2,
      flip: Math.random() < 0.5 ? 1 : -1,
    });
  }

  // karang
  const palettes =
    (m.coralPalettes && m.coralPalettes.length > 0
      ? m.coralPalettes
      : [
          { main: "#ff8a65", edge: "#ffccbc" },
          { main: "#ffb74d", edge: "#ffe0b2" },
        ]);
  const coralCount = m.coralCount || 0;
  for (let i = 0; i < coralCount; i++) {
    const c = palettes[Math.floor(Math.random() * palettes.length)];
    const size = 25 + Math.random() * 35;
    corals.push({
      x: Math.random() * canvas.width,
      baseY: canvas.height - 70,
      width: size * (0.9 + Math.random() * 0.6),
      height: size * (1.1 + Math.random() * 0.4),
      mainColor: c.main,
      edgeColor: c.edge,
      speedFactor: 0.22 + Math.random() * 0.18,
      tiltSeed: Math.random() * Math.PI * 2,
    });
  }

  // dekorasi pasir
  const decorCount = m.sandDecorCount || 0;
  for (let i = 0; i < decorCount; i++) {
    sandDecor.push({
      x: Math.random() * canvas.width,
      y: canvas.height - (50 + Math.random() * 20),
      type: Math.random() < 0.5 ? "star" : "shell",
      size: 6 + Math.random() * 7,
      rotation: Math.random() * Math.PI * 2,
      color: Math.random() < 0.5 ? "#ffcc80" : "#ffab91",
      speedFactor: 0.35 + Math.random() * 0.2,
    });
  }

  // kuburan kapal: bangkai kapal / jangkar
  const shipCount = m.shipWreckCount || 0;
  for (let i = 0; i < shipCount; i++) {
    const variantRand = Math.random();
    const variant =
      variantRand < 0.5 ? "hull" : variantRand < 0.8 ? "mast" : "anchor";
    const size = 80 + Math.random() * 100;
    shipWrecks.push({
      variant,
      x: Math.random() * canvas.width,
      baseY: canvas.height - (40 + Math.random() * 40),
      width: size,
      height: size * (0.5 + Math.random() * 0.4),
      tilt: (Math.random() * 0.5 - 0.25) * (variant === "mast" ? 0.7 : 1),
      speedFactor: 0.22 + Math.random() * 0.18,
    });
  }

  // Atlantis: pilar & gerbang
  const ruinCount = m.ruinCount || 0;
  for (let i = 0; i < ruinCount; i++) {
    const type = Math.random() < 0.5 ? "pillar" : "arch";
    const height = 80 + Math.random() * 90;
    ruins.push({
      type,
      x: Math.random() * canvas.width,
      baseY: canvas.height - 70,
      height,
      width: 32 + Math.random() * 20,
      broken: Math.random() < 0.6,
      speedFactor: 0.2 + Math.random() * 0.2,
    });
  }
}

function createRock(x) {
  return {
    x,
    y: canvas.height - (40 + Math.random() * 80),
    width: 100 + Math.random() * 120,
    height: 40 + Math.random() * 40,
    speedFactor: 0.25 + Math.random() * 0.35,
  };
}

function updateBackground(dt) {
  // batu
  for (const rock of bgRocks) {
    rock.x -= worldSpeed * rock.speedFactor * dt;
    if (rock.x + rock.width < -60) {
      rock.x = canvas.width + Math.random() * 200;
      rock.y = canvas.height - (40 + Math.random() * 80);
      rock.width = 100 + Math.random() * 120;
      rock.height = 40 + Math.random() * 40;
    }
  }

  // kelp
  for (const k of kelpPlants) {
    k.x -= worldSpeed * k.speedFactor * dt;
    if (k.x < -60) {
      k.x = canvas.width + Math.random() * 200;
      k.height = 60 + Math.random() * 90;
      k.swaySeed = Math.random() * Math.PI * 2;
    }
  }

  // ikan jauh
  for (const f of distantFish) {
    f.x -= worldSpeed * f.speedFactor * dt;
    if (f.x < -40) {
      f.x = canvas.width + Math.random() * 150;
      f.y = 40 + Math.random() * (canvas.height * 0.4);
      f.size = 6 + Math.random() * 5;
      f.flip = Math.random() < 0.5 ? 1 : -1;
    }
  }

  // karang
  for (const c of corals) {
    c.x -= worldSpeed * c.speedFactor * dt;
    if (c.x < -80) {
      c.x = canvas.width + Math.random() * 200;
      const size = 25 + Math.random() * 35;
      c.width = size * (0.9 + Math.random() * 0.6);
      c.height = size * (1.1 + Math.random() * 0.4);
      c.tiltSeed = Math.random() * Math.PI * 2;
    }
  }

  // dekorasi pasir
  for (const d of sandDecor) {
    d.x -= worldSpeed * d.speedFactor * dt;
    if (d.x < -40) {
      d.x = canvas.width + Math.random() * 200;
      d.y = canvas.height - (50 + Math.random() * 20);
      d.type = Math.random() < 0.5 ? "star" : "shell";
      d.size = 6 + Math.random() * 7;
      d.rotation = Math.random() * Math.PI * 2;
      d.color = Math.random() < 0.5 ? "#ffcc80" : "#ffab91";
    }
  }

  // bangkai kapal
  for (const s of shipWrecks) {
    s.x -= worldSpeed * s.speedFactor * dt;
    if (s.x < -150) {
      const size = 80 + Math.random() * 100;
      s.x = canvas.width + Math.random() * 200;
      s.baseY = canvas.height - (40 + Math.random() * 40);
      s.width = size;
      s.height = size * (0.5 + Math.random() * 0.4);
      s.tilt = (Math.random() * 0.5 - 0.25) * (s.variant === "mast" ? 0.7 : 1);
    }
  }

  // reruntuhan Atlantis
  for (const r of ruins) {
    r.x -= worldSpeed * r.speedFactor * dt;
    if (r.x < -120) {
      r.x = canvas.width + Math.random() * 200;
      r.baseY = canvas.height - 70;
      r.height = 80 + Math.random() * 90;
      r.width = 32 + Math.random() * 20;
      r.broken = Math.random() < 0.6;
      r.type = Math.random() < 0.5 ? "pillar" : "arch";
    }
  }
}

function spawnBubble(x, y) {
  bubbles.push({
    x,
    y,
    radius: 3 + Math.random() * 4,
    vx: -worldSpeed * 0.2,
    vy: -30 - Math.random() * 30,
    life: 0,
    maxLife: 5,
  });
}

function updateBubbles(dt) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life += dt;
    if (b.life > b.maxLife || b.y < -20 || b.x < -40) {
      bubbles.splice(i, 1);
    }
  }
}

// ================== COINS & HAZARDS ==================
function createCoin() {
  const marginY = 70;
  return {
    x: canvas.width + 40,
    y: marginY + Math.random() * (canvas.height - marginY * 2),
    width: 26,
    height: 26,
    vx: -(worldSpeed * (0.7 + Math.random() * 0.4)),
    seed: Math.random() * Math.PI * 2,
  };
}

function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];

    c.x += c.vx * dt;
    c.y += Math.sin(globalTime * 2 + c.seed) * 8 * dt;

    if (c.x < -50) {
      coins.splice(i, 1);
      continue;
    }

    if (rectsIntersect(player, c)) {
      coinsCollected++;
      score += 35;
      playSfx(sfx.coin);
      coins.splice(i, 1);
    }
  }
}

function createHazard() {
  const marginY = 60;
  const type = Math.random() < 0.55 ? "mine" : "jelly";

  if (type === "mine") {
    return {
      type,
      x: canvas.width + 50,
      y: marginY + Math.random() * (canvas.height - marginY * 2),
      width: 42,
      height: 42,
      vx: -(worldSpeed * (0.9 + Math.random() * 0.4)),
      vy: 0,
      damage: 25,
      seed: Math.random() * Math.PI * 2,
    };
  } else {
    const upOrDown = Math.random() < 0.5 ? -1 : 1;
    return {
      type,
      x: canvas.width + 70,
      y: marginY + Math.random() * (canvas.height - marginY * 2),
      width: 32,
      height: 70,
      vx: -worldSpeed * 0.75,
      vy: upOrDown * 15,
      damage: 18,
      seed: Math.random() * Math.PI * 2,
    };
  }
}

function updateHazards(dt) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];

    h.x += h.vx * dt;
    h.y += h.vy * dt;

    if (h.type === "jelly") {
      h.y += Math.sin(globalTime * 2 + h.seed) * 10 * dt;
    }

    if (h.x < -70 || h.y < -80 || h.y > canvas.height + 80) {
      hazards.splice(i, 1);
      continue;
    }

    if (rectsIntersect(player, h)) {
      if (h.type === "mine") playSfx(sfx.hitMine);
      else playSfx(sfx.hitJelly);

      damagePlayer(h.damage);
      hazards.splice(i, 1);
    }
  }
}

// ================== PLAYER & COLLISION ==================
function updatePlayer(dt) {
  let ax = 0;
  let ay = 0;

  if (keys["arrowup"] || keys["w"]) ay -= player.accel;
  if (keys["arrowdown"] || keys["s"]) ay += player.accel;
  if (keys["arrowleft"] || keys["a"]) ax -= player.accel;
  if (keys["arrowright"] || keys["d"]) ax += player.accel;

  if (joystick.strength > 0) {
    const analogAccelFactor = 0.35 + 0.9 * joystick.strength;
    ax += joystick.dirX * player.accel * analogAccelFactor;
    ay += joystick.dirY * player.accel * analogAccelFactor;
  }

  player.vx += ax * dt;
  player.vy += ay * dt;

  let maxSpeed = player.maxSpeed;
  if (joystick.strength > 0) {
    const speedFactor = 0.4 + 0.9 * joystick.strength;
    maxSpeed = player.maxSpeed * speedFactor;
  }

  const speed = Math.hypot(player.vx, player.vy);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    player.vx *= scale;
    player.vy *= scale;
  }

  player.vx *= player.friction;
  player.vy *= player.friction;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  const halfW = player.width / 2;
  const halfH = player.height / 2;

  if (player.x - halfW < 0) {
    player.x = halfW;
    player.vx = 0;
  }
  if (player.x + halfW > canvas.width) {
    player.x = canvas.width - halfW;
    player.vx = 0;
  }
  if (player.y - halfH < 0) {
    player.y = halfH;
    player.vy = 0;
  }
  if (player.y + halfH > canvas.height) {
    player.y = canvas.height - halfH;
    player.vy = 0;
  }

  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }
}

function rectsIntersect(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx < (a.width + b.width) / 2 && dy < (a.height + b.height) / 2;
}

// ================== UPDATE & GAME LOOP ==================
function updateGame(dt, worldDt) {
  elapsed += dt;
  distance += worldSpeed * worldDt;

  const difficulty = 1 + elapsed / 20;
  level = Math.min(10, Math.floor(difficulty));
  worldSpeed = 160 + difficulty * 40;

  coinTimer += worldDt;
  hazardTimer += worldDt;
  bubbleTimer += worldDt;
  backgroundBubbleTimer += worldDt;

  const coinInterval = Math.max(0.35, 1.1 / difficulty);
  const hazardInterval = Math.max(0.5, 2.0 / difficulty);

  if (coinTimer >= coinInterval) {
    coinTimer = 0;
    coins.push(createCoin());
  }

  if (hazardTimer >= hazardInterval) {
    hazardTimer = 0;
    hazards.push(createHazard());
  }

  if (bubbleTimer >= 0.06) {
    bubbleTimer = 0;
    spawnBubble(
      player.x - player.width / 2,
      player.y + (Math.random() * 12 - 6)
    );
  }

  if (backgroundBubbleTimer >= 0.3) {
    backgroundBubbleTimer = 0;
    spawnBubble(Math.random() * canvas.width, canvas.height + 10);
  }

  updatePlayer(dt);
  updateCoins(worldDt);
  updateHazards(worldDt);

  score += dt * (5 + level * 2);
  scoreEl.textContent = Math.floor(score);
  levelEl.textContent = level.toString();

  updateSkills(dt);
}

function update(dt) {
  globalTime += dt;

  const slowMul = skills.slow.active ? 0.4 : 1;
  let worldDt = dt * slowMul;

  // kalau sedang transisi, update timer transisi & pelankan gerakan background
  if (currentState === STATE.TRANSITION) {
    updateMapTransition(dt);
    worldDt *= 0.4;
  }

  updateBackground(worldDt);

  if (currentState === STATE.PLAYING) {
    updateGame(dt, worldDt);
  } else if (currentState === STATE.MENU) {
    // ikan idle di menu
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25 + Math.sin(globalTime) * 10;
    player.y = centerY + Math.sin(globalTime * 1.5) * 15;
  } else if (currentState === STATE.TRANSITION) {
    // ikan pelan2 nongol di posisi main, cuma goyang dikit
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25;
    player.y = centerY + Math.sin(globalTime * 1.5) * 10;
    player.vx = 0;
    player.vy = 0;
  }

  updateBubbles(worldDt);
}

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = Math.min(0.04, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

// ================== RENDER ==================
function drawBackground() {
  const m = currentMap || maps[0];

  // gradient laut (atas)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (m.gradientStops && m.gradientStops.length) {
    for (const stop of m.gradientStops) {
      gradient.addColorStop(stop.pos, stop.color);
    }
  } else {
    gradient.addColorStop(0, "#021726");
    gradient.addColorStop(0.25, "#023e73");
    gradient.addColorStop(0.6, "#012b4a");
    gradient.addColorStop(1, "#000814");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // permukaan air glow
  ctx.save();
  ctx.globalAlpha = 0.22;
  const surfGrad = ctx.createLinearGradient(0, 0, 0, 90);
  surfGrad.addColorStop(0, "rgba(255,255,255,0.85)");
  surfGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = surfGrad;
  ctx.fillRect(0, 0, canvas.width, 90);
  ctx.restore();

  // sun rays
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 4; i++) {
    const offset =
      ((globalTime * 18 + i * 140) % (canvas.width + 260)) - 260;
    ctx.beginPath();
    ctx.moveTo(offset, -40);
    ctx.lineTo(offset + 80, -40);
    ctx.lineTo(offset + 260, canvas.height);
    ctx.lineTo(offset + 180, canvas.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // efek cahaya air (caustic)
  ctx.save();
  const caAlpha = m.causticAlpha ?? 0.07;
  const caColor = m.causticColor ?? "rgba(255,255,255,0.6)";
  ctx.globalAlpha = caAlpha;
  ctx.lineWidth = 2;
  ctx.strokeStyle = caColor;
  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    for (let x = -40; x < canvas.width + 40; x += 20) {
      const t = globalTime * 1.8;
      const offset =
        Math.sin((x + t * 80) / 60 + y * 0.03) * 8 +
        Math.cos((y + t * 40) / 50 + x * 0.02) * 6;
      const yy = y + offset;
      if (x === -40) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // OFFSET TRANSISI (bawah dunia naik dari bawah)
  let bottomOffsetY = 0;
  if (currentState === STATE.TRANSITION) {
    const p = getTransitionProgress(); // 0 -> 1
    bottomOffsetY = (1 - p) * canvas.height * 0.6; // awalnya di bawah, naik ke posisi normal
  }

  // semua objek bawah laut kita translate dengan offset ini
  ctx.save();
  ctx.translate(0, bottomOffsetY);

  // dasar laut
  ctx.save();
  ctx.fillStyle = m.floorColor || "#00111b";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.restore();

  // batu
  ctx.save();
  ctx.fillStyle = m.rockColor || "#001b2e";
  for (const rock of bgRocks) {
    ctx.beginPath();
    ctx.moveTo(rock.x, canvas.height);
    ctx.quadraticCurveTo(
      rock.x + rock.width / 2,
      rock.y - rock.height,
      rock.x + rock.width,
      canvas.height
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // bangkai kapal (Kuburan Kapal)
  if (currentMap.id === "ship") {
    drawShipWrecks(m);
  }

  // reruntuhan (Atlantis)
  if (currentMap.id === "atlantis") {
    drawRuins(m);
  }

  // karang
  ctx.save();
  for (const c of corals) {
    const x = c.x;
    const yBase = c.baseY;
    const w = c.width;
    const h = c.height;
    const sway = Math.sin(globalTime * 1.1 + c.tiltSeed) * 4;

    const grad = ctx.createLinearGradient(x, yBase - h, x, yBase);
    grad.addColorStop(0, c.edgeColor);
    grad.addColorStop(1, c.mainColor);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, yBase);
    ctx.quadraticCurveTo(
      x - w * 0.1 + sway,
      yBase - h * 0.4,
      x - w * 0.25,
      yBase - h
    );
    ctx.quadraticCurveTo(
      x - w * 0.05 + sway,
      yBase - h * 0.55,
      x + w * 0.05 + sway,
      yBase - h * 0.1
    );
    ctx.quadraticCurveTo(
      x + w * 0.2 + sway,
      yBase - h * 0.7,
      x + w * 0.35,
      yBase
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // dekorasi pasir
  ctx.save();
  for (const d of sandDecor) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rotation);

    if (d.type === "star") {
      const arms = 5;
      const outer = d.size;
      const inner = d.size * 0.4;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      for (let i = 0; i < arms * 2; i++) {
        const angle = (Math.PI * i) / arms;
        const r = i % 2 === 0 ? outer : inner;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      const r = d.size;
      const gradShell = ctx.createLinearGradient(-r, 0, r, 0);
      gradShell.addColorStop(0, "#ffe0b2");
      gradShell.addColorStop(1, "#ffcc80");
      ctx.fillStyle = gradShell;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.quadraticCurveTo(-r * 0.3, -r * 0.9, 0, -r * 1.1);
      ctx.quadraticCurveTo(r * 0.3, -r * 0.9, r, 0);
      ctx.quadraticCurveTo(0, r * 0.4, -r, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
  ctx.restore();

  // kelp
  ctx.save();
  ctx.lineWidth = 4;
  for (const plant of kelpPlants) {
    const sway = Math.sin(globalTime * 1.5 + plant.swaySeed) * 10;
    const x = plant.x;
    const yBottom = plant.baseY;
    const h = plant.height;

    ctx.beginPath();
    ctx.moveTo(x, yBottom);
    ctx.bezierCurveTo(
      x + sway * 0.3,
      yBottom - h * 0.3,
      x + sway,
      yBottom - h * 0.7,
      x + sway * 1.2,
      yBottom - h
    );
    ctx.strokeStyle = m.kelpColor || "rgba(76, 175, 80, 0.9)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + sway * 1.2, yBottom - h, 5, 0, Math.PI * 2);
    ctx.fillStyle = m.kelpHeadColor || "rgba(129, 199, 132, 0.9)";
    ctx.fill();
  }
  ctx.restore();

  // ikan kecil jauh
  ctx.save();
  ctx.globalAlpha = m.distantFishAlpha ?? 0.45;
  ctx.fillStyle = m.distantFishColor || "#bbdefb";
  for (const f of distantFish) {
    const size = f.size;
    ctx.beginPath();
    if (f.flip === 1) {
      ctx.moveTo(f.x - size, f.y);
      ctx.lineTo(f.x + size, f.y - size * 0.6);
      ctx.lineTo(f.x + size, f.y + size * 0.6);
    } else {
      ctx.moveTo(f.x + size, f.y);
      ctx.lineTo(f.x - size, f.y - size * 0.6);
      ctx.lineTo(f.x - size, f.y + size * 0.6);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.restore(); // end translate bottomOffsetY
}

// bangkai kapal: hull / mast / anchor
function drawShipWrecks(map) {
  if (!shipWrecks.length) return;
  ctx.save();
  const wood = map.shipWoodColor || "#5d4037";
  const woodLight = map.shipWoodHighlightColor || "#8d6e63";
  const metal = map.shipMetalColor || "#90a4ae";

  for (const s of shipWrecks) {
    ctx.save();
    ctx.translate(s.x, s.baseY);
    ctx.rotate(s.tilt);

    const w = s.width;
    const h = s.height;

    if (s.variant === "hull") {
      ctx.fillStyle = wood;
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, 0);
      ctx.lineTo(-w * 0.1, -h * 0.6);
      ctx.lineTo(w * 0.3, -h * 0.4);
      ctx.lineTo(w * 0.45, 0);
      ctx.lineTo(w * 0.15, h * 0.2);
      ctx.lineTo(-w * 0.4, h * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = woodLight;
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo((i / 3) * w * 0.4, -h * 0.5);
        ctx.lineTo((i / 3) * w * 0.45, h * 0.1);
        ctx.stroke();
      }
    } else if (s.variant === "mast") {
      ctx.fillStyle = wood;
      ctx.fillRect(-w * 0.04, -h, w * 0.08, h);

      ctx.beginPath();
      ctx.moveTo(0, -h * 0.8);
      ctx.lineTo(w * 0.4, -h * 0.5);
      ctx.lineTo(0, -h * 0.2);
      ctx.closePath();
      ctx.fillStyle = "rgba(207,216,220,0.8)";
      ctx.fill();

      ctx.strokeStyle = woodLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(0, h * 0.1);
      ctx.stroke();
    } else {
      ctx.strokeStyle = metal;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.3);
      ctx.lineTo(0, h * 0.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -h * 0.38, 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-w * 0.2, h * 0.1);
      ctx.quadraticCurveTo(0, h * 0.3, w * 0.2, h * 0.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-w * 0.2, h * 0.1);
      ctx.lineTo(-w * 0.1, h * 0.26);
      ctx.moveTo(w * 0.2, h * 0.1);
      ctx.lineTo(w * 0.1, h * 0.26);
      ctx.stroke();
    }

    ctx.restore();
  }
  ctx.restore();
}

// reruntuhan Atlantis: pilar & arch + kristal
function drawRuins(map) {
  if (!ruins.length) return;
  ctx.save();
  const colMain = map.ruinMainColor || "#cfd8dc";
  const colHigh = map.ruinHighlightColor || "#eceff1";
  const crystalColor = map.crystalColor || "#80deea";

  for (const r of ruins) {
    ctx.save();
    ctx.translate(r.x, r.baseY);

    const h = r.height;
    const w = r.width;

    if (r.type === "pillar") {
      ctx.fillStyle = colMain;
      ctx.fillRect(-w / 2, -h, w, h);

      ctx.fillStyle = colHigh;
      ctx.fillRect(-w / 2, -h - 8, w, 8);
      ctx.fillRect(-w / 2, -10, w, 6);

      if (r.broken) {
        ctx.save();
        ctx.translate(0, -h * 0.4);
        ctx.rotate(-0.25);
        ctx.fillStyle = colMain;
        ctx.fillRect(-w / 2, 0, w, h * 0.3);
        ctx.restore();
      }

      ctx.fillStyle = crystalColor;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, 0);
      ctx.lineTo(-w * 0.1, -12);
      ctx.lineTo(w * 0.1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = colMain;
      const archW = w * 2;
      const archH = h;
      ctx.beginPath();
      ctx.moveTo(-archW / 2, 0);
      ctx.lineTo(-archW / 2, -archH * 0.6);
      ctx.quadraticCurveTo(
        0,
        -archH,
        archW / 2,
        -archH * 0.6
      );
      ctx.lineTo(archW / 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = colHigh;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-archW / 2 + 5, -archH * 0.55);
      ctx.quadraticCurveTo(
        0,
        -archH * 0.9,
        archW / 2 - 5,
        -archH * 0.55
      );
      ctx.stroke();

      if (r.broken) {
        ctx.fillStyle = colMain;
        ctx.beginPath();
        ctx.moveTo(-archW / 2 - 10, 0);
        ctx.lineTo(-archW / 2 + 5, -20);
        ctx.lineTo(-archW / 2 + 15, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(archW / 2 + 10, 0);
        ctx.lineTo(archW / 2 - 5, -24);
        ctx.lineTo(archW / 2 - 15, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = crystalColor;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -archH * 0.2);
      ctx.lineTo(-10, -archH * 0.35);
      ctx.lineTo(0, -archH * 0.5);
      ctx.lineTo(10, -archH * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  ctx.restore();
}

function drawBubbles() {
  ctx.save();
  for (const b of bubbles) {
    const alpha = Math.max(0, 1 - b.life / b.maxLife);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(200,220,255,0.9)";
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoins() {
  for (const c of coins) {
    const r = c.width / 2;
    const gradient = ctx.createRadialGradient(
      c.x - r / 3,
      c.y - r / 3,
      2,
      c.x,
      c.y,
      r
    );
    gradient.addColorStop(0, "#fff9c4");
    gradient.addColorStop(1, "#ffd600");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(c.x - r / 4, c.y - r / 4, r / 2.2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHazards() {
  for (const h of hazards) {
    if (h.type === "mine") {
      ctx.save();
      ctx.translate(h.x, h.y);

      ctx.fillStyle = "#444";
      ctx.beginPath();
      ctx.arc(0, 0, h.width / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const inner = h.width / 2;
        const outer = h.width / 2 + 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }

      ctx.fillStyle = "#ff5252";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (h.type === "jelly") {
      ctx.save();
      ctx.translate(h.x, h.y);

      ctx.fillStyle = "rgba(181, 126, 255, 0.85)";
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        h.width * 0.6,
        h.height * 0.45,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "rgba(181, 126, 255, 0.85)";
      ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4, h.height * 0.1);
        ctx.bezierCurveTo(
          i * 6,
          h.height * 0.4,
          i * 8,
          h.height * 0.8,
          i * 5,
          h.height * 1.1
        );
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

function drawPlayer() {
  // aura shield
  if (skills.shield.active) {
    ctx.save();
    ctx.translate(player.x, player.y);
    const pulse = 1 + Math.sin(globalTime * 6) * 0.05;
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = currentAuraColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, player.width * 0.8 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();

  if (
    player.invincibleTimer > 0 &&
    Math.floor(player.invincibleTimer * 10) % 2 === 0
  ) {
    ctx.globalAlpha = 0.4;
  }

  ctx.translate(player.x, player.y);
  const angle = (player.vy / player.maxSpeed) * 0.4;
  ctx.rotate(angle);

  if (fishImg.complete && fishImg.naturalWidth) {
    ctx.drawImage(
      fishImg,
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );
  } else {
    ctx.fillStyle = "#4dd0ff";
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      player.width / 2,
      player.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

function render() {
  drawBackground();
  drawBubbles();
  drawCoins();
  drawHazards();
  drawPlayer();

  if (skills.slow.active) {
    ctx.save();
    ctx.fillStyle = "rgba(173,216,230,0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // overlay transisi: fade dari hitam + teks "Menyelam ke ..."
  if (currentState === STATE.TRANSITION) {
    const p = getTransitionProgress();

    // fade hitam di awal
    const fadeAlpha = Math.max(0, 1 - p * 1.5);
    if (fadeAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // teks info map
    let textAlpha;
    if (p < 0.4) textAlpha = p / 0.4; // fade in
    else if (p < 0.8) textAlpha = 1 - (p - 0.4) / 0.4; // fade out
    else textAlpha = 0;

    if (textAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.fillStyle = "#ffffff";
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Menyelam ke ${currentMap.name}...`,
        canvas.width / 2,
        canvas.height / 2
      );
      ctx.restore();
    }
  }
}

// ================== INIT ==================
function initGame() {
  applyCurrentSkin();
  bindSkinButtons();
  bindMapButtons();
  applyCurrentMap(); // set map + dekorasi awal

  updatePanels();
  updateHealthBar();
  updateSkillUI();
  updateMuteButtonUI();
  updateOrientationHint();

  if (joystickBase && joystickKnob) {
    resetJoystickKnob();
  }

  window.addEventListener("resize", updateOrientationHint);
  window.addEventListener("orientationchange", updateOrientationHint);

  requestAnimationFrame(gameLoop);
}

window.addEventListener("load", initGame);
