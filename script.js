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

// elemen kontrol HP
const mobilePauseBtn = document.getElementById("mobilePauseBtn");
const dirButtons = document.querySelectorAll(".btn-dir");

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

  // Spasi untuk mulai dari menu
  if (key === " " && currentState === STATE.MENU) {
    resetGame();
    setState(STATE.PLAYING);
  }
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

// --- INPUT TOUCH / POINTER UNTUK HP ---

// helper set state key
function setVirtualKey(key, pressed) {
  keys[key] = pressed;
}

dirButtons.forEach((btn) => {
  const key = btn.dataset.key; // "w", "a", "s", "d"

  const down = (e) => {
    e.preventDefault();
    setVirtualKey(key, true);
  };

  const up = (e) => {
    e.preventDefault();
    setVirtualKey(key, false);
  };

  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointercancel", up);
  btn.addEventListener("pointerleave", up);
  btn.addEventListener("pointerout", up);
});

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

// pause dari HP
if (mobilePauseBtn) {
  mobilePauseBtn.addEventListener("click", () => {
    togglePause();
  });
}

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

  scoreEl.textContent = "0";
  levelEl.textContent = "1";
  updateHealthBar();
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

  player.health -= amount;
  if (player.health < 0) player.health = 0;
  player.invincibleTimer = 1.1; // detik kebal setelah kena

  updateHealthBar();
  if (player.health <= 0) {
    gameOver();
  }
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

function updateGame(dt) {
  // Progression
  elapsed += dt;
  distance += worldSpeed * dt;
  const difficulty = 1 + elapsed / 20; // tiap 20 detik naik
  level = Math.min(10, Math.floor(difficulty));
  worldSpeed = 160 + difficulty * 40;

  coinTimer += dt;
  hazardTimer += dt;
  bubbleTimer += dt;
  backgroundBubbleTimer += dt;

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

  // Gelembung dari ekor ikan
  if (bubbleTimer >= 0.06) {
    bubbleTimer = 0;
    spawnBubble(
      player.x - player.width / 2,
      player.y + (Math.random() * 12 - 6)
    );
  }

  // Gelembung dari dasar laut
  if (backgroundBubbleTimer >= 0.3) {
    backgroundBubbleTimer = 0;
    spawnBubble(Math.random() * canvas.width, canvas.height + 10);
  }

  updatePlayer(dt);
  updateCoins(dt);
  updateHazards(dt);

  // skor naik seiring waktu + level
  score += dt * (5 + level * 2);
  scoreEl.textContent = Math.floor(score);
  levelEl.textContent = level.toString();
}

function update(dt) {
  globalTime += dt;

  updateBackground(dt);

  if (currentState === STATE.PLAYING) {
    updateGame(dt);
  } else if (currentState === STATE.MENU) {
    // animasi ikan pelan saat di menu
    const centerY = canvas.height / 2;
    player.x = canvas.width * 0.25 + Math.sin(globalTime) * 10;
    player.y = centerY + Math.sin(globalTime * 1.5) * 15;
  }

  updateBubbles(dt);
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
        (h.width * 0.6),
        (h.height * 0.45),
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
  ctx.save();

  // kedipan saat invincible
  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
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
}

// --- INIT ---
function init() {
  initBackground();
  updatePanels();
  updateHealthBar();
}

init();
requestAnimationFrame(gameLoop);
