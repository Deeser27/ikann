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
// skillDash di HTML sekarang kita pakai untuk skill HELP
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
    auraColor: "rgba(100, 181, 246, 0.95)",
  },
  {
    name: "Oren",
    src: "fish_oren.png",
    auraColor: "rgba(255, 183, 77, 0.95)",
  },
];

let currentSkinIndex = 0;
const skinImages = fishSkins.map((s) => {
  const img = new Image();
  img.src = s.src;
  return img;
});

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

function bindSkinButtons() {
  if (skinPrevBtn) {
    skinPrevBtn.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        changeSkin(-1);
      },
      { passive: false }
    );
  }
  if (skinNextBtn) {
    skinNextBtn.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        changeSkin(1);
      },
      { passive: false }
    );
  }
}

// ================== MAP SYSTEM ==================
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
  initBackground();
}

function changeMap(delta) {
  const len = maps.length;
  currentMapIndex = (currentMapIndex + delta + len) % len;
  applyCurrentMap();
}

function bindMapButtons() {
  if (mapPrevBtn) {
    mapPrevBtn.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        changeMap(-1);
      },
      { passive: false }
    );
  }
  if (mapNextBtn) {
    mapNextBtn.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        changeMap(1);
      },
      { passive: false }
    );
  }
}

// ================== ENVIRONMENT VARIANTS (CUACA) ==================
const envVariants = [
  {
    id: "clear",
    label: "Air Jernih",
    rayAlpha: 0.18,
    causticMul: 1.0,
    tint: null,
  },
  {
    id: "deep",
    label: "Laut Dalam",
    rayAlpha: 0.07,
    causticMul: 0.6,
    tint: "rgba(0, 10, 40, 0.45)",
  },
  {
    id: "sunset",
    label: "Senja Laut",
    rayAlpha: 0.23,
    causticMul: 0.9,
    tint: "rgba(255,120,80,0.25)",
  },
  {
    id: "plankton",
    label: "Laut Plankton",
    rayAlpha: 0.14,
    causticMul: 0.8,
    tint: "rgba(150,255,220,0.18)",
  },
];

let currentEnvIndex = 0;
let currentEnv = envVariants[0];
let nextEnvChangeScore = 1500; // cuaca ganti tiap 1500 poin

function setRandomEnvironment() {
  if (!envVariants.length) return;
  let newIndex = Math.floor(Math.random() * envVariants.length);
  if (envVariants.length > 1) {
    let tries = 0;
    while (newIndex === currentEnvIndex && tries < 5) {
      newIndex = Math.floor(Math.random() * envVariants.length);
      tries++;
    }
  }
  currentEnvIndex = newIndex;
  currentEnv = envVariants[currentEnvIndex];
  // Tidak ada pesan "Cuaca berubah" lagi, biar teks tidak numpuk.
}

function updateEnvByScore() {
  const s = Math.floor(score);
  while (s >= nextEnvChangeScore) {
    setRandomEnvironment();
    nextEnvChangeScore += 1500;
  }
}

// ================== AUDIO ==================
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
  dash: makeAudio("sfx_dash.wav", 0.8, 1.1), // dipakai untuk HELP juga
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

// ================== ORIENTASI ==================
function updateOrientationHint() {
  if (!rotateHint) return;
  const isPortrait = window.innerHeight >= window.innerWidth;
  rotateHint.style.display = isPortrait ? "flex" : "none";
}

// ================== STATE & TRANSISI ==================
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

// pesan mengambang / milestone
let floatingMessages = [];
let nextMilestoneScore = 500;
const milestoneTemplates = [
  "Wuihh, {score} poin! hoki anjirrr",
  "baru  {score} poin gausah seneng duluu",
  "wihh {score} poin, bentar lagi juga kalahh",
  "Kok bisa {score} point, kamu cit ya",
  "Bolehlahhh tembus {score}, walau kayanya hoki",
];

// TRANSISI MASUK MAP
const mapTransition = {
  active: false,
  time: 0,
  duration: 2.2,
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
  strength: 0,
};

// Skill system (Help, Shield, Slow)
const skills = {
  help: { cooldown: 30, timer: 0 }, // cooldown 30 detik
  shield: { cooldown: 10, timer: 0, active: false, duration: 3, remaining: 0 },
  slow: { cooldown: 12, timer: 0, active: false, duration: 3, remaining: 0 },
};

// Frenzy
const frenzy = {
  active: false,
  remaining: 0,
  duration: 6,
};

function startFrenzy(seconds) {
  frenzy.active = true;
  frenzy.remaining = seconds || frenzy.duration;
  addFloatingMessage("MODE FRENZY!");
}

function updateFrenzy(dt) {
  if (!frenzy.active) return;
  frenzy.remaining -= dt;
  if (frenzy.remaining <= 0) {
    frenzy.active = false;
    frenzy.remaining = 0;
  }
}

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
const chests = [];
const bubbles = [];
const bgRocks = [];
const kelpPlants = [];
const distantFish = [];
const corals = [];
const sandDecor = [];
const shipWrecks = [];
const ruins = [];

// Sidekick (teman ikan kecil)
const sidekick = {
  active: false,
  x: 0,
  y: 0,
  offsetX: -60,
  offsetY: 25,
  life: 0,
  maxLife: 10,
  canBlockHit: false,
  hitFlashTimer: 0,
};
let sidekickSpawnTimer = 0;

// Ikan bantuan (HELP skill)
const helpFish = {
  active: false,
  x: 0,
  y: 0,
  width: 90,
  height: 60,
  remaining: 0,
  state: "enter", // "enter" -> "follow" -> "exit"
};

let waveTimer = 0;
let nextWaveDelay = 14;
let chestTimer = 0;
let nextChestTime = 16;

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
      attemptHelp();
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

// ================== JOYSTICK ANALOG ==================
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

// ================== START RUN ==================
function startRun() {
  resetGame();
  setRandomEnvironment(); // tidak ada pesan
  initBackground();
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

if (retryBtn) {
  retryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetGame();
    setState(STATE.MENU);
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

if (mobilePauseBtn) {
  bindMobileButton(mobilePauseBtn, togglePause);
}

// Skill mobile
bindMobileButton(skillDashBtn, attemptHelp);
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

// ================== RESET GAME ==================
function resetSidekick() {
  sidekick.active = false;
  sidekick.life = 0;
  sidekick.canBlockHit = false;
  sidekick.hitFlashTimer = 0;
}

function resetHelpFish() {
  helpFish.active = false;
  helpFish.remaining = 0;
  helpFish.state = "enter";
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
  chests.length = 0;
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

  skills.help.timer = 0;
  skills.shield.timer = 0;
  skills.shield.active = false;
  skills.shield.remaining = 0;
  skills.slow.timer = 0;
  skills.slow.active = false;
  skills.slow.remaining = 0;

  frenzy.active = false;
  frenzy.remaining = 0;

  floatingMessages.length = 0;
  nextMilestoneScore = 500;

  sidekickSpawnTimer = 0;
  resetSidekick();

  resetHelpFish();

  waveTimer = 0;
  nextWaveDelay = 14;
  chestTimer = 0;
  nextChestTime = 16;

  nextEnvChangeScore = 1500; // cuaca mulai di 1500

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

  // Shield = full kebal
  if (skills.shield.active) {
    return;
  }

  // Sidekick bisa menahan 1 hit
  if (sidekick.active && sidekick.canBlockHit) {
    sidekick.canBlockHit = false;
    sidekick.hitFlashTimer = 0.4;
    addFloatingMessage("Teman ikan menahan serangan!");
    return;
  }

  player.health -= amount;
  if (player.health < 0) player.health = 0;
  player.invincibleTimer = 0.4;
  updateHealthBar();

  if (player.health <= 0) {
    gameOver();
  }
}

// ================== SKILLS ==================
function attemptHelp() {
  if (skills.help.timer > 0 || currentState !== STATE.PLAYING) return;
  if (helpFish.active) return;

  spawnHelpFish();
  skills.help.timer = skills.help.cooldown;

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
  for (const key of ["help", "shield", "slow"]) {
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
  updateSkillButton(
    skillDashBtn,
    skills.help.timer,
    helpFish.active,
    "Help (J)"
  );
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

  for (let i = 0; i < 8; i++) {
    bgRocks.push(createRock(Math.random() * canvas.width));
  }

  for (let i = 0; i < 7; i++) {
    kelpPlants.push({
      x: Math.random() * canvas.width,
      baseY: canvas.height - 80,
      height: 60 + Math.random() * 90,
      swaySeed: Math.random() * Math.PI * 2,
      speedFactor: 0.2 + Math.random() * 0.2,
    });
  }

  for (let i = 0; i < 10; i++) {
    distantFish.push({
      x: Math.random() * canvas.width,
      y: 40 + Math.random() * (canvas.height * 0.4),
      size: 6 + Math.random() * 5,
      speedFactor: 0.15 + Math.random() * 0.2,
      flip: Math.random() < 0.5 ? 1 : -1,
    });
  }

  const mPalettes =
    (m.coralPalettes && m.coralPalettes.length > 0
      ? m.coralPalettes
      : [
          { main: "#ff8a65", edge: "#ffccbc" },
          { main: "#ffb74d", edge: "#ffe0b2" },
        ]);
  const coralCount = m.coralCount || 0;
  for (let i = 0; i < coralCount; i++) {
    const c = mPalettes[Math.floor(Math.random() * mPalettes.length)];
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
  for (const rock of bgRocks) {
    rock.x -= worldSpeed * rock.speedFactor * dt;
    if (rock.x + rock.width < -60) {
      rock.x = canvas.width + Math.random() * 200;
      rock.y = canvas.height - (40 + Math.random() * 80);
      rock.width = 100 + Math.random() * 120;
      rock.height = 40 + Math.random() * 40;
    }
  }

  for (const k of kelpPlants) {
    k.x -= worldSpeed * k.speedFactor * dt;
    if (k.x < -60) {
      k.x = canvas.width + Math.random() * 200;
      k.height = 60 + Math.random() * 90;
      k.swaySeed = Math.random() * Math.PI * 2;
    }
  }

  for (const f of distantFish) {
    f.x -= worldSpeed * f.speedFactor * dt;
    if (f.x < -40) {
      f.x = canvas.width + Math.random() * 150;
      f.y = 40 + Math.random() * (canvas.height * 0.4);
      f.size = 6 + Math.random() * 5;
      f.flip = Math.random() < 0.5 ? 1 : -1;
    }
  }

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

// ================== COINS, HAZARDS, CHESTS ==================
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

    // magnet koin ke pemain saat sidekick aktif
    if (sidekick.active) {
      const dx = player.x - c.x;
      const dy = player.y - c.y;
      const dist = Math.hypot(dx, dy);
      const magnetRadius = 120;
      if (dist < magnetRadius && dist > 0) {
        const pull = (magnetRadius - dist) / magnetRadius;
        c.x += (dx / dist) * pull * dt * 120;
        c.y += (dy / dist) * pull * dt * 120;
      }
    }

    if (c.x < -50) {
      coins.splice(i, 1);
      continue;
    }

    if (rectsIntersect(player, c)) {
      coinsCollected++;
      let coinScore = 35;
      if (frenzy.active) coinScore *= 2;
      score += coinScore;
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
      damage: 15, // damage dikurangi
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
      damage: 10, // damage dikurangi
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
      // Saat frenzy: hazard hancur tanpa damage
      if (frenzy.active) {
        if (h.type === "mine") playSfx(sfx.hitMine);
        else playSfx(sfx.hitJelly);
        hazards.splice(i, 1);
        continue;
      }

      if (h.type === "mine") playSfx(sfx.hitMine);
      else playSfx(sfx.hitJelly);

      damagePlayer(h.damage);
      hazards.splice(i, 1);
    }
  }
}

// Peti harta
function createChest() {
  return {
    x: canvas.width + 70,
    y: canvas.height - 65,
    width: 40,
    height: 30,
    opened: false,
  };
}

function applyChestReward() {
  const r = Math.random();
  if (r < 0.4) {
    const bonusCoins = 10;
    coinsCollected += bonusCoins;
    score += bonusCoins * 40;
    addFloatingMessage("Jackpot koin!");
    playSfx(sfx.coin);
  } else if (r < 0.75) {
    const heal = 35;
    player.health = Math.min(player.maxHealth, player.health + heal);
    updateHealthBar();
    addFloatingMessage("HP pulih!");
  } else {
    startFrenzy(7);
  }
}

function updateChests(dt) {
  for (let i = chests.length - 1; i >= 0; i--) {
    const c = chests[i];
    c.x -= worldSpeed * 0.6 * dt;

    if (c.x < -80) {
      chests.splice(i, 1);
      continue;
    }

    if (!c.opened && rectsIntersect(player, c)) {
      c.opened = true;
      applyChestReward();
      chests.splice(i, 1);
    }
  }
}

// ================== SIDEKICK ==================
function spawnSidekick() {
  sidekick.active = true;
  sidekick.x = player.x + sidekick.offsetX;
  sidekick.y = player.y + sidekick.offsetY;
  sidekick.life = 0;
  sidekick.maxLife = 12;
  sidekick.canBlockHit = true;
  sidekick.hitFlashTimer = 0;
  addFloatingMessage("Teman ikan datang!");
}

function updateSidekick(dt) {
  if (!sidekick.active) return;

  sidekick.life += dt;

  const targetX = player.x + sidekick.offsetX;
  const targetY = player.y + sidekick.offsetY;
  sidekick.x += (targetX - sidekick.x) * dt * 4;
  sidekick.y += (targetY - sidekick.y) * dt * 4;

  if (sidekick.hitFlashTimer > 0) {
    sidekick.hitFlashTimer -= dt;
  }

  if (
    sidekick.life >= sidekick.maxLife ||
    (!sidekick.canBlockHit && sidekick.life >= sidekick.maxLife * 0.5)
  ) {
    sidekick.active = false;
  }
}

// ================== HELP FISH ==================
function spawnHelpFish() {
  helpFish.active = true;
  helpFish.remaining = 5; // aktif 5 detik
  helpFish.state = "enter";
  helpFish.x = player.x;
  helpFish.y = -helpFish.height; // mulai dari atas layar
}

function updateHelpFish(dt) {
  if (!helpFish.active) return;

  helpFish.remaining -= dt;
  if (helpFish.remaining <= 0 && helpFish.state !== "exit") {
    helpFish.state = "exit"; // mulai naik ke atas
  }

  const followOffsetX = 70;  // di samping pemain
  const followOffsetY = -20; // sedikit di atas

  if (helpFish.state === "enter") {
    // turun dari atas menuju posisi samping pemain
    const targetX = player.x + followOffsetX;
    const targetY = player.y + followOffsetY;

    helpFish.x += (targetX - helpFish.x) * dt * 4;
    helpFish.y += (targetY - helpFish.y) * dt * 4;

    const dist = Math.hypot(targetX - helpFish.x, targetY - helpFish.y);
    if (dist < 10) {
      helpFish.state = "follow";
    }
  } else if (helpFish.state === "follow") {
    // jalan di samping pemain
    const targetX = player.x + followOffsetX;
    const targetY = player.y + followOffsetY;

    helpFish.x += (targetX - helpFish.x) * dt * 6;
    helpFish.y += (targetY - helpFish.y) * dt * 6;
  } else if (helpFish.state === "exit") {
    // kembali naik ke atas
    helpFish.y -= 280 * dt;
    if (helpFish.y < -helpFish.height - 50) {
      resetHelpFish();
      return;
    }
  }

  // Hancurkan obstacle di sekitar kita (sekitar ikan bantuan)
  const radius = Math.max(helpFish.width, helpFish.height);
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    const dx = helpFish.x - h.x;
    const dy = helpFish.y - h.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      hazards.splice(i, 1);
      spawnBubble(h.x, h.y);
    }
  }
}

// ================== WAVE SYSTEM ==================
function spawnCoinWave() {
  const centerY = canvas.height * (0.35 + Math.random() * 0.3);
  const amplitude = canvas.height * 0.25;
  const count = 18;
  const baseX = canvas.width + 60;
  const spacing = 45;

  for (let i = 0; i < count; i++) {
    const angle = i * 0.4;
    const y = centerY + Math.sin(angle) * amplitude * 0.4;
    coins.push({
      x: baseX + i * spacing,
      y,
      width: 26,
      height: 26,
      vx: -worldSpeed * 0.85,
      seed: Math.random() * Math.PI * 2,
    });
  }

  addFloatingMessage("Wave koin datang!");
}

function spawnJellyWave() {
  const rows = 3;
  const cols = 7;
  const spacingX = 70;
  const spacingY = 70;
  const startX = canvas.width + 80;
  const topY = 80 + Math.random() * 60;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      hazards.push({
        type: "jelly",
        x: startX + c * spacingX,
        y: topY + r * spacingY,
        width: 32,
        height: 70,
        vx: -worldSpeed * 0.75,
        vy: (Math.random() < 0.5 ? -1 : 1) * 15,
        damage: 10,
        seed: Math.random() * Math.PI * 2,
      });
    }
  }

  addFloatingMessage("Zona ubur-ubur!");
}

// ================== MESSAGES ==================
function addFloatingMessage(text) {
  // Supaya tidak ada tulisan double, selalu hanya 1 message aktif
  floatingMessages.length = 0;
  floatingMessages.push({
    text,
    x: canvas.width / 2,
    y: 90,
    life: 0,
    maxLife: 2.5,
  });
}

function updateFloatingMessages(dt) {
  for (let i = floatingMessages.length - 1; i >= 0; i--) {
    const m = floatingMessages[i];
    m.life += dt;
    m.y -= dt * 12;
    if (m.life >= m.maxLife) {
      floatingMessages.splice(i, 1);
    }
  }
}

function drawFloatingMessages() {
  if (!floatingMessages.length) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "20px sans-serif";
  for (const m of floatingMessages) {
    const t = m.life / m.maxLife;
    const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
    const a = Math.max(0, alpha) * 0.95;

    ctx.globalAlpha = a;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(m.text, m.x, m.y);

    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillText(m.text, m.x + 1.5, m.y + 1.5);
  }
  ctx.restore();
}

function checkScoreMilestones() {
  if (score < nextMilestoneScore) return;

  const templ =
    milestoneTemplates[
      Math.floor(Math.random() * milestoneTemplates.length)
    ];
  const msg = templ.replace("{score}", nextMilestoneScore);
  addFloatingMessage(msg);
  nextMilestoneScore += 500;
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

  // Sidekick spawn timer
  sidekickSpawnTimer += dt;
  if (!sidekick.active && sidekickSpawnTimer > 18) {
    spawnSidekick();
    sidekickSpawnTimer = 0;
  }

  // Wave timer
  waveTimer += dt;
  if (waveTimer >= nextWaveDelay) {
    waveTimer = 0;
    nextWaveDelay = 12 + Math.random() * 10;
    if (Math.random() < 0.5) spawnCoinWave();
    else spawnJellyWave();
  }

  // Chest timer
  chestTimer += dt;
  if (chestTimer >= nextChestTime) {
    chestTimer = 0;
    nextChestTime = 14 + Math.random() * 12;
    chests.push(createChest());
    addFloatingMessage("Peti harta muncul!");
  }

  updatePlayer(dt);
  updateCoins(worldDt);
  updateHazards(worldDt);
  updateChests(worldDt);
  updateSidekick(dt);
  updateHelpFish(worldDt);

  let baseScore = dt * (5 + level * 2);
  if (frenzy.active) baseScore *= 2;
  score += baseScore;

  scoreEl.textContent = Math.floor(score);
  levelEl.textContent = level.toString();

  updateEnvByScore();
  updateSkills(dt);
  checkScoreMilestones();
}

function update(dt) {
  globalTime += dt;
  updateFrenzy(dt);

  const slowMul = skills.slow.active ? 0.4 : 1;
  let worldDt = dt * slowMul;

  if (currentState === STATE.TRANSITION) {
    updateMapTransition(dt);
    worldDt *= 0.4;
  }

  updateBackground(worldDt);

  if (currentState === STATE.PLAYING) {
    updateGame(dt, worldDt);
  } else if (currentState === STATE.MENU) {
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25 + Math.sin(globalTime) * 10;
    player.y = centerY + Math.sin(globalTime * 1.5) * 15;
  } else if (currentState === STATE.TRANSITION) {
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25;
    player.y = centerY + Math.sin(globalTime * 1.5) * 10;
    player.vx = 0;
    player.vy = 0;
  }

  updateBubbles(worldDt);
  updateFloatingMessages(dt);
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

  // permukaan air
  ctx.save();
  ctx.globalAlpha = 0.22;
  const surfGrad = ctx.createLinearGradient(0, 0, 0, 90);
  surfGrad.addColorStop(0, "rgba(255,255,255,0.85)");
  surfGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = surfGrad;
  ctx.fillRect(0, 0, canvas.width, 90);
  ctx.restore();

  // sun rays (dipengaruhi env)
  ctx.save();
  ctx.globalAlpha = currentEnv.rayAlpha;
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

  // caustic light
  const mCa = m.causticAlpha ?? 0.07;
  const caAlpha = mCa * (currentEnv.causticMul || 1);
  const caColor = m.causticColor ?? "rgba(255,255,255,0.6)";
  ctx.save();
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

  let bottomOffsetY = 0;
  if (currentState === STATE.TRANSITION) {
    const p = getTransitionProgress();
    bottomOffsetY = (1 - p) * canvas.height * 0.6;
  }

  ctx.save();
  ctx.translate(0, bottomOffsetY);

  ctx.save();
  ctx.fillStyle = m.floorColor || "#00111b";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.restore();

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

  if (currentMap.id === "ship") {
    drawShipWrecks(m);
  }

  if (currentMap.id === "atlantis") {
    drawRuins(m);
  }

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

  // partikel plankton / titik cahaya untuk varian tertentu
  if (currentEnv.id === "plankton" || currentEnv.id === "deep") {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#e0f7fa";
    for (let i = 0; i < 80; i++) {
      const x =
        (((i * 73) + globalTime * 40) % (canvas.width + 40)) - 20;
      const y = (i * 97) % (canvas.height + 40);
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // overlay tint env
  if (currentEnv.tint) {
    ctx.save();
    ctx.fillStyle = currentEnv.tint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

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

function drawChests() {
  for (const c of chests) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const w = c.width;
    const h = c.height;

    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(-w / 2, -h, w, h);

    ctx.fillStyle = "#8d6e63";
    ctx.fillRect(-w / 2, -h, w, h * 0.3);

    ctx.fillStyle = "#3e2723";
    ctx.fillRect(-w / 2, -h + h * 0.3, w, 3);

    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(-4, -h * 0.4, 8, h * 0.5);

    ctx.beginPath();
    ctx.arc(0, -h * 0.05, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fbc02d";
    ctx.fill();

    ctx.restore();
  }
}

function drawSidekick() {
  if (!sidekick.active) return;

  ctx.save();
  ctx.translate(sidekick.x, sidekick.y);

  const scale = 0.6;
  ctx.scale(scale, scale);

  let alpha = 1;
  if (sidekick.hitFlashTimer > 0) {
    alpha = 0.4 + Math.sin(sidekick.hitFlashTimer * 30) * 0.3;
  }

  ctx.globalAlpha = alpha;

  ctx.fillStyle = "#b3e5fc";
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(-60, -15);
  ctx.lineTo(-60, 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(10, -6, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(12, -6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHelpFish() {
  if (!helpFish.active) return;

  ctx.save();
  ctx.translate(helpFish.x, helpFish.y);

  // helper pakai skin kebalikan pemain
  const helperIndex = (currentSkinIndex + 1) % fishSkins.length;
  const img = skinImages[helperIndex];
  const w = helpFish.width;
  const h = helpFish.height;

  const angle = Math.sin(globalTime * 2) * 0.15;
  ctx.rotate(angle);

  if (img && img.complete && img.naturalWidth) {
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.fillStyle = "#ffcc80";
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPlayer() {
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

  let scale = 1;
  if (frenzy.active) {
    scale = 1.15;
  }
  ctx.scale(scale, scale);

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
  drawChests();
  drawHelpFish();
  drawSidekick();
  drawPlayer();

  if (skills.slow.active) {
    ctx.save();
    ctx.fillStyle = "rgba(173,216,230,0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  if (frenzy.active) {
    ctx.save();
    const t = Math.max(0, frenzy.remaining / frenzy.duration);
    ctx.globalAlpha = 0.18 + t * 0.15;
    ctx.fillStyle = "rgba(255, 238, 88, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  if (currentState === STATE.TRANSITION) {
    const p = getTransitionProgress();

    const fadeAlpha = Math.max(0, 1 - p * 1.5);
    if (fadeAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    let textAlpha;
    if (p < 0.4) textAlpha = p / 0.4;
    else if (p < 0.8) textAlpha = 1 - (p - 0.4) / 0.4;
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

  drawFloatingMessages();
}

// ================== INIT ==================
function initGame() {
  applyCurrentSkin();
  bindSkinButtons();
  bindMapButtons();
  applyCurrentMap();

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
