var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Žogica
var ballRadius = 10;
var x, y, dx, dy;

// Ploščica
var paddleHeight = 10;
var paddleWidth = 100;
var paddleX;

// Opeke
var brickRowCount = 3;
var brickColumnCount = 11;
var brickWidth = 50;
var brickPadding = 20;
var brickOffsetTop = 40;

var totalBricksWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
var brickOffsetLeft = (canvas.width - totalBricksWidth) / 2;

var bricks = [];

// Rezultati
var score = 0;
var highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

// Slike jabolk
const appleImages = [
  "Images/red_apple.png",
  "Images/green_apple.png",
  "Images/orange_apple.png"
];

// Inicializacija opek
for (var c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (var r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      icon: new Image()
    };
    bricks[c][r].icon.src = appleImages[r % appleImages.length];
  }
}

function initGame() {
  x = canvas.width / 2;
  y = canvas.height - 40;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
}

initGame();

// Slika žogice
var ballIcon = new Image();
ballIcon.src = "Images/2998113_animal_garden_gardening_insect_invertebrate_icon.png";

// Risanje opek z animacijo
function drawBricks() {
  var adjustedHeight = brickWidth / 1.05;
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = r * (adjustedHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.save();
        ctx.translate(brickX + brickWidth / 2, brickY + adjustedHeight / 2);
        ctx.scale(
          1 + 0.03 * Math.sin(Date.now() / 250),
          1 + 0.03 * Math.sin(Date.now() / 250)
        );
        ctx.drawImage(
          bricks[c][r].icon,
          -brickWidth / 2,
          -adjustedHeight / 2,
          brickWidth,
          adjustedHeight
        );
        ctx.restore();
      }
    }
  }
}

// Risanje žogice z rotacijo
function drawBall() {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Date.now() / 100) % (2 * Math.PI));
  ctx.drawImage(ballIcon, -ballRadius, -ballRadius, ballRadius * 2, ballRadius * 2);
  ctx.restore();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#8B4513";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  document.getElementById("score").innerText = score;
}

function collisionDetection() {
  var adjustedHeight = brickWidth / 1.05;
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + adjustedHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          drawScore();
          checkWin();
        }
      }
    }
  }
}

function checkWin() {
  let allCleared = true;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        allCleared = false;
        break;
      }
    }
  }

  if (allCleared) {
    clearInterval(gameInterval);
    gameRunning = false;

    Swal.fire({
      icon: 'success',
      title: 'Zmaga!',
      text: 'Vse opeke so uničene! 👏🍏',
      confirmButtonText: 'Igraj znova',
      heightAuto: false
    }).then(() => {
      resetGame();
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
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

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;
}

function gameOver() {
  clearInterval(gameInterval);
  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }

  Swal.fire({
    icon: 'error',
    title: 'Konec igre!',
    text: 'Izgubil si! Poskusi znova 🍎',
    confirmButtonText: 'OK',
    heightAuto: false
  });
}

var gameInterval;
var gameRunning = false;
var gamePaused = false;
var rightPressed = false;
var leftPressed = false;

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

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === "Escape") togglePause();
});

document.addEventListener("keyup", function (e) {
  if (e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "ArrowLeft") leftPressed = false;
});

function resetGame() {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;
  score = 0;
  drawScore();
  initGame();

  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
}

function updateDifficulty() {
  var select = document.getElementById("difficultySelect");
  var value = parseInt(select.value);
  dx = value + 1;
  dy = -(value + 1);
}

function startGame() {
  document.getElementById("canvas").focus();
  if (!gameRunning) {
    gameRunning = true;
    updateDifficulty();
    gameInterval = setInterval(draw, 10);
  }
}

window.onload = () => {
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("pauseBtn").addEventListener("click", togglePause);
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("difficultySelect").addEventListener("change", updateDifficulty);
};