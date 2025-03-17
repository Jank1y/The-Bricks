// Globalne spremenljivke
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Žogica
var ballRadius = 10;
var x, y, dx, dy;

// Ploščica
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX;

// Opeke
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var bricks = [];

var score = 0;
var level = 1;
var highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

for (var c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (var r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Inicializacija igre
function initGame() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
}

initGame();

// Predpostavimo, da imaš že naloženo sliko ikone
var brickIcon = new Image();
brickIcon.src = "Images/2137818_apple_food_fruit_organic_vegan_icon.png"; // Pot do tvoje ikone/slike

// Funkcija za risanje opek z ikonami
function drawBricks() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        // Nariši sliko ikone namesto običajne opeke
        ctx.drawImage(brickIcon, brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

// Predpostavimo, da imaš že naloženo sliko žogice
var ballIcon = new Image();
ballIcon.src = "Images/2998113_animal_garden_gardening_insect_invertebrate_icon.png"; // Pot do slike žogice

// Funkcija za risanje žogice s sliko
function drawBall() {
  // Preveri, ali je slika že naložena
  if (ballIcon.complete) {
    // Nariši sliko žogice namesto kroga
    ctx.drawImage(
      ballIcon,
      x - ballRadius,
      y - ballRadius,
      ballRadius * 2,
      ballRadius * 2
    );
  } else {
    // Če slika še ni naložena, jo lahko rišeš kot krog
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.closePath();
  }
}

// Funkcija za risanje ploščice
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#8B4513";
  ctx.fill();
  ctx.closePath();
}

// Funkcija za prikaz točk
function drawScore() {
  document.getElementById("score").innerText = score;
}

// Funkcija za prikaz nivoja
function updateLevel() {
  document.getElementById("level").innerText = level;
}

// Funkcija za preverjanje trkov
function collisionDetection() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          drawScore();
          if (score == brickRowCount * brickColumnCount) {
            levelUp();
          }
        }
      }
    }
  }
}

// Funkcija za prehod na naslednji nivo
function levelUp() {
  level++;
  updateLevel();
  score = 0;
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
}

// **Glavna risalna funkcija**
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      gameOver();
    }
  }

  x += dx;
  y += dy;

  if (rightPressed && !leftPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && !rightPressed && paddleX > 0) {
    paddleX -= 7;
  }
}

// **Dodana funkcionalnost za pavzo**
var gameInterval;
var gameRunning = false;
var gamePaused = false;

function togglePause() {
  if (gameRunning) {
    if (gamePaused) {
      gameInterval = setInterval(draw, 10);
      gamePaused = false;
    } else {
      clearInterval(gameInterval);
      gamePaused = true;
    }
  }
}

// **POPOLNOMA POPRAVLJENA FUNKCIJA ZA TIPKE**
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    rightPressed = true;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    leftPressed = true;
  } else if (e.key === "Escape") {
    togglePause();
  }
});

document.addEventListener("keyup", function (e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    rightPressed = false;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    leftPressed = false;
  }
});

// Funkcija za ponastavitev igre
function resetGame() {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;
  score = 0;
  level = 1;
  updateLevel();
  initGame(); // Resetira položaj žogice in ploščice

  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }

  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;
}

// Funkcija za začetek igre
function startGame() {
  document.getElementById("canvas").focus();
  if (!gameRunning) {
    gameRunning = true;
    updateDifficulty();
    gameInterval = setInterval(draw, 10);
  }
}

// Gumbi
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("resetBtn").addEventListener("click", resetGame);

// **Dodana nastavitev težavnosti**
var difficulty = 2;

function updateDifficulty() {
  var slider = document.getElementById("difficultySlider");
  var label = document.getElementById("difficultyLabel");

  difficulty = parseInt(slider.value);
  dx = difficulty + 1;
  dy = -(difficulty + 1);
}

document
  .getElementById("difficultySlider")
  .addEventListener("input", updateDifficulty);
