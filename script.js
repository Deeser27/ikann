"use strict";

// --- DOM & CANVAS ---
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

// Kontrol mobile
const mobilePauseBtn = document.getElementById("mobilePauseBtn");
const joystickBase = document.getElementById("joystickBase");
const joystickKnob = document.getElementById("joystickKnob");
const skillDashBtn = document.getElementById("skillDash");
const skillShieldBtn = document.getElementById("skillShield");
const skillSlowBtn = document.getElementById("skillSlow");

// Gambar ikan
const fishImg = new Image();
fishImg.src = "fish.png"; // pastikan file ini ada di folder yang sama

// --- STATE GAME ---
const STATE = {
  MENU: "menu",
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

// Joystick analog
const joystick = {
  active: false,
  pointerId: null,
  dirX: 0,
  dirY: 0,
};

// Skill system
const skills = {
  dash: { cooldown: 5, timer: 0 },
  shield: { cooldown: 10, timer: 0, active: false, duration: 3, remaining: 0 },
  slow: { cooldown: 12, timer: 0, active: false, duration: 3, remaining: 0 },
};

// --- OBJEK GAME ---

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

// --- INPUT KEYBOARD ---
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(e) {
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
    togglePause();
  }

  if (key === " " && currentState === STATE.MENU) {
    resetGame();
    setState(STATE.PLAYING);
  }

  // skill dengan keyboard
  if (key === "j") attemptDash();
  if (key === "k") attemptShield();
  if (key === "l") attemptSlow();
}

function handleKeyUp(e) {
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
}

// --- JOYSTICK ANALOG (MOBILE) ---
if (joystickBase && joystickKnob) {
  joystickBase.addEventListener("pointerdown", onJoystickDown);
  joystickBase.addEventListener("pointermove", onJoystickMove);
  joystickBase.addEventListener("pointerup", onJoystickUp);
  joystickBase.addEventListener("pointercancel", onJoystickUp);
  joystickBase.addEventListener("pointerleave", (e) => {
    if (joystick.active) onJoystickUp(e);
  });
}

function onJoystickDown(e) {
  joystick.active = true;
  joystick.pointerId = e.pointerId;
  joystickBase.setPointerCapture(e.pointerId);
  updateJoystick(e);
}

function onJoystickMove(e) {
  if (!joystick.active || e.pointerId !== joystick.pointerId) return;
  updateJoystick(e);
}

function onJoystickUp(e) {
  if (e.pointerId !== joystick.pointerId) return;
  joystick.active = false;
  joystick.pointerId = null;
  joystick.dirX = 0;
  joystick.dirY = 0;
  resetJoystickKnob();
  try {
    joystickBase.releasePointerCapture(e.pointerId);
  } catch (err) {
    // ignore
  }
}

function updateJoystick(e) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let dx = x - cx;
  let dy = y - cy;

  const maxDist = rect.width * 0.4; // radius joystick
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (dist > maxDist) {
    dx = (dx / dist) * maxDist;
    dy = (dy / dist) * maxDist;
  }

  // normalisasi untuk arah
  if (dist < 6) {
    joystick.dirX = 0;
    joystick.dirY = 0;
  } else {
    joystick.dirX = dx / dist;
    joystick.dirY = dy / dist;
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

// --- TOMBOL UI ---
startBtn.addEventListener("click", () => {
  resetGame();
  setState(STATE.PLAYING);
});

retryBtn.addEventListener("click", () => {
  resetGame();
  setState(STATE.PLAYING);
});

resumeBtn.addEventListener("click", () => {
  togglePause(true);
});

pauseBtn.addEventListener("click", () => {
  togglePause();
});

if (mobilePauseBtn) {
  mobilePauseBtn.addEventListener("click", () => {
    togglePause();
  });
}

// Skill buttons (HP)
if (skillDashBtn) skillDashBtn.addEventListener("click", attemptDash);
if (skillShieldBtn) skillShieldBtn.addEventListener("click", attemptShield);
if (skillSlowBtn) skillSlowBtn.addEventListener("click", attemptSlow);

// --- FUNGSI STATE ---

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
    // PLAYING
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

  // reset skills
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

// --- HEALTH BAR ---

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

  // shield mengurangi damage
  if (skills.shield.active) {
    finalDamage *= 0.3; // 70% ditahan shield
  }

  player.health -= finalDamage;
  if (player.health < 0) player.health = 0;
  player.invincibleTimer = 0.4; // sejenak kedap-kedip
  updateHealthBar();

  if (player.health <= 0) {
    gameOver();
  }
}

// --- SKILL LOGIC ---

function attemptDash() {
  if (skills.dash.timer > 0 || currentState !== STATE.PLAYING) return;

  let dirX = joystick.dirX;
  let dirY = joystick.dirY;

  // kalau joystick netral, pakai input keyboard
  if (dirX === 0 && dirY === 0) {
    if (keys["arrowleft"] || keys["a"]) dirX = -1;
    else if (keys["arrowright"] || keys["d"]) dirX = 1;
    if (keys["arrowup"] || keys["w"]) dirY = -1;
    else if (keys["arrowdown"] || keys["s"]) dirY = 1;
  }

  // kalau masih netral, pakai arah gerak terakhir, fallback ke kanan
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

  // invincible sebentar saat dash
  player.invincibleTimer = Math.max(player.invincibleTimer, 0.6);
  skills.dash.timer = skills.dash.cooldown;

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

  flashSkillButton(skillSlowBtn);
  updateSkillUI();
}

function updateSkills(dt) {
  // cooldown
  for (const key of ["dash", "shield", "slow"]) {
    if (skills[key].timer > 0) {
      skills[key].timer -= dt;
      if (skills[key].timer < 0) skills[key].timer = 0;
    }
  }

  // durasi aktif
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

  if (active) {
    btn.classList.add("active-skill");
  } else {
    btn.classList.remove("active-skill");
  }
}

function flashSkillButton(btn) {
  if (!btn) return;
  btn.classList.add("flash");
  setTimeout(() => btn.classList.remove("flash"), 150);
}

// --- BACKGROUND PARALLAX ---

function initBackground() {
  bgRocks.length = 0;
  for (let i = 0; i < 8; i++) {
    bgRocks.push(createRock(Math.random() * canvas.width));
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
}

// --- BUBBLES ---

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

// --- COINS & HAZARDS ---

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
      damagePlayer(h.damage);
      hazards.splice(i, 1);
    }
  }
}

// --- PLAYER ---

function updatePlayer(dt) {
  let ax = 0;
  let ay = 0;

  if (keys["arrowup"] || keys["w"]) ay -= player.accel;
  if (keys["arrowdown"] || keys["s"]) ay += player.accel;
  if (keys["arrowleft"] || keys["a"]) ax -= player.accel;
  if (keys["arrowright"] || keys["d"]) ax += player.accel;

  // input dari joystick analog
  if (joystick.dirX !== 0 || joystick.dirY !== 0) {
    ax += joystick.dirX * player.accel;
    ay += joystick.dirY * player.accel;
  }

  player.vx += ax * dt;
  player.vy += ay * dt;

  // batasi kecepatan
  const speed = Math.hypot(player.vx, player.vy);
  if (speed > player.maxSpeed) {
    const scale = player.maxSpeed / speed;
    player.vx *= scale;
    player.vy *= scale;
  }

  // friction
  player.vx *= player.friction;
  player.vy *= player.friction;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  const halfW = player.width / 2;
  const halfH = player.height / 2;

  // batas canvas
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

// --- COLLISION ---

function rectsIntersect(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx < (a.width + b.width) / 2 && dy < (a.height + b.height) / 2;
}

// --- UPDATE & LOOP ---

function updateGame(dt, worldDt) {
  // progression
  elapsed += dt;
  distance += worldSpeed * worldDt;
  const difficulty = 1 + elapsed / 20; // tiap 20 detik naik
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

  // gelembung dari ekor ikan
  if (bubbleTimer >= 0.06) {
    bubbleTimer = 0;
    spawnBubble(
      player.x - player.width / 2,
      player.y + (Math.random() * 12 - 6)
    );
  }

  // gelembung dari dasar laut
  if (backgroundBubbleTimer >= 0.3) {
    backgroundBubbleTimer = 0;
    spawnBubble(Math.random() * canvas.width, canvas.height + 10);
  }

  updatePlayer(dt);
  updateCoins(worldDt);
  updateHazards(worldDt);

  // skor naik seiring waktu + level
  score += dt * (5 + level * 2);
  scoreEl.textContent = Math.floor(score);
  levelEl.textContent = level.toString();

  updateSkills(dt);
}

function update(dt) {
  globalTime += dt;

  const slowMul = skills.slow.active ? 0.4 : 1;
  const worldDt = dt * slowMul;

  updateBackground(worldDt);

  if (currentState === STATE.PLAYING) {
    updateGame(dt, worldDt);
  } else if (currentState === STATE.MENU) {
    // animasi ikan pelan saat di menu
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25 + Math.sin(globalTime) * 10;
    player.y = centerY + Math.sin(globalTime * 1.5) * 15;
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

// --- RENDER ---

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#012a4a");
  gradient.addColorStop(0.4, "#014f86");
  gradient.addColorStop(1, "#01213a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // cahaya dari atas
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 4; i++) {
    const offset =
      ((globalTime * 10 + i * 80) % (canvas.width + 200)) - 200;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + 80, 0);
    ctx.lineTo(offset + 260, canvas.height);
    ctx.lineTo(offset + 180, canvas.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // dasar laut
  ctx.save();
  ctx.fillStyle = "#001219";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.restore();

  // batu / karang (parallax)
  ctx.save();
  ctx.fillStyle = "#001b2e";
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
      // badan ranjau
      ctx.fillStyle = "#444";
      ctx.beginPath();
      ctx.arc(0, 0, h.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // duri
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

      // titik merah
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

      // tentakel
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
    ctx.strokeStyle = "rgba(144,238,144,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, player.width * 0.8 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();

  // kedipan saat invincible
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
    // fallback kalau gambar belum sempat di-load
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

  // overlay saat slow time
  if (skills.slow.active) {
    ctx.save();
    ctx.fillStyle = "rgba(173,216,230,0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

// --- INIT ---
function init() {
  initBackground();
  updatePanels();
  updateHealthBar();
  if (joystickBase && joystickKnob) {
    resetJoystickKnob();
  }
  updateSkillUI();
}

init();
requestAnimationFrame(gameLoop);
