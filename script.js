// Ambil elemen
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

// Data game
const fishImg = new Image();
fishImg.src = "fish.png"; // pastikan nama file sesuai

const fish = {
  x: 100,
  y: canvas.height / 2 - 25,
  width: 60,
  height: 40,
  speed: 4
};

let keys = {};
let foods = [];   // makanan (hijau)
let bombs = [];   // bom (merah)
let score = 0;
let gameOver = false;

// Event keyboard
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Tombol restart
restartBtn.addEventListener("click", () => {
  resetGame();
});

// Reset game
function resetGame() {
  fish.x = 100;
  fish.y = canvas.height / 2 - fish.height / 2;
  foods = [];
  bombs = [];
  score = 0;
  gameOver = false;
  scoreEl.textContent = score;
}

// Fungsi bantu: cek tabrakan (bounding box)
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Update posisi ikan
function updateFish() {
  if (keys["ArrowUp"]) {
    fish.y -= fish.speed;
  }
  if (keys["ArrowDown"]) {
    fish.y += fish.speed;
  }
  if (keys["ArrowLeft"]) {
    fish.x -= fish.speed;
  }
  if (keys["ArrowRight"]) {
    fish.x += fish.speed;
  }

  // Batas area canvas
  if (fish.y < 0) fish.y = 0;
  if (fish.y + fish.height > canvas.height) fish.y = canvas.height - fish.height;
  if (fish.x < 0) fish.x = 0;
  if (fish.x + fish.width > canvas.width) fish.x = canvas.width - fish.width;
}

// Spawn makanan & bom
function spawnObjects() {
  // makanan
  if (Math.random() < 0.03) {
    foods.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 20),
      width: 20,
      height: 20,
      speed: 3
    });
  }

  // bom
  if (Math.random() < 0.015) {
    bombs.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 25),
      width: 25,
      height: 25,
      speed: 4
    });
  }
}

// Update dan gambar makanan
function updateFoods() {
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    f.x -= f.speed;

    // Cek tabrakan dengan ikan
    if (isColliding(fish, f)) {
      score += 10;
      scoreEl.textContent = score;
      foods.splice(i, 1);
      continue;
    }

    // Hapus jika keluar layar
    if (f.x + f.width < 0) {
      foods.splice(i, 1);
    }
  }
}

// Update dan gambar bom
function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.x -= b.speed;

    // Cek tabrakan dengan ikan
    if (isColliding(fish, b)) {
      gameOver = true;
    }

    // Hapus jika keluar layar
    if (b.x + b.width < 0) {
      bombs.splice(i, 1);
    }
  }
}

// Gambar semua objek
function draw() {
  // Background (air)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rumput laut sederhana
  ctx.fillStyle = "rgba(0, 100, 0, 0.8)";
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.fillRect(i, canvas.height - 40, 10, 40);
  }

  // Gambar ikan
  if (fishImg.complete) {
    ctx.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
  } else {
    // fallback kalau gambar belum load
    ctx.fillStyle = "yellow";
    ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
  }

  // Gambar makanan (lingkaran hijau)
  for (const f of foods) {
    ctx.beginPath();
    ctx.arc(f.x + f.width / 2, f.y + f.height / 2, f.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = "lime";
    ctx.fill();
  }

  // Gambar bom (lingkaran merah)
  for (const b of bombs) {
    ctx.beginPath();
    ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  // Jika game over, tampilkan teks
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px Arial";
    ctx.fillText("Klik 'Mulai Ulang' untuk bermain lagi", canvas.width / 2, canvas.height / 2 + 25);
  }
}

// Loop game
function gameLoop() {
  if (!gameOver) {
    updateFish();
    spawnObjects();
    updateFoods();
    updateBombs();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Mulai game setelah gambar ikan siap (opsional)
fishImg.onload = () => {
  resetGame();
  gameLoop();
};
