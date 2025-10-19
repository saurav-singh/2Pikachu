//LOADING CANVAS
var C = document.getElementById("canvas");
var cx = C.getContext("2d");

// Make canvas responsive
function resizeCanvas() {
  var container = document.querySelector('.GAME');
  var containerWidth = window.innerWidth;
  var containerHeight = window.innerHeight;

  // Scale canvas to fit screen on mobile while maintaining aspect ratio
  if (window.innerWidth <= 768) {
    var scale = Math.min(containerWidth / 400, (containerHeight * 0.8) / 500);
    C.style.width = (400 * scale) + 'px';
    C.style.height = (500 * scale) + 'px';
  } else {
    C.style.width = '400px';
    C.style.height = '500px';
  }
}

// Call on load and resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
resizeCanvas();

//AUDIO BUFFER
var eat = new Audio("eat.wav");


//ELEMENTS
var p1 = document.getElementById("p1");
var p2 = document.getElementById("p2");
var bomb = document.getElementById("bomb");
var fruit = document.getElementById("fruit");

//INITIAL VARIABLES
var width = C.width;
var height = C.height;

var score = 0;
var speed = 25;
var speedElement = 8;
var timeOut = 0;
var timeOut2 = 0;
var timer1 = 1;
var timer2 = 1.5;
var level = 1;
var speedTimer = 0;
var gameStart = false;

// GAME STATE VARIABLES
var gameState = "start"; // start, playing, paused, gameOver
var lives = 3;
var highScore = localStorage.getItem('pikachu_highScore') || 0;
var combo = 0;
var maxCombo = 0;
var scoreMultiplier = 1;
var lastCatchTime = 0;
var comboTimeout = 2000; // 2 seconds to maintain combo

// POWER-UP VARIABLES
var powerUps = {
  shield: false,
  slowMo: false,
  doublePoints: false,
  shieldTime: 0,
  slowMoTime: 0,
  doublePointsTime: 0
};

var powerUpPos = {
  x: 0, y: 0,
  active: false,
  type: "" // shield, slowMo, doublePoints
};

// PARTICLE SYSTEM
var particles = [];

//ANIMATION AND POSITION VARIABLES
var animation = {
  animate: false,
  p1A: false,
  p1B: false,
  p2C: false,
  p2D: false
}

var position = {
  a: 50 - 15,
  b: 150 - 15,
  c: 250 - 15,
  d: 350 - 15
}

var player1 = {
  x: position.a,
  y: height - 50
}

var player2 = {
  x: position.c,
  y: height - 50
}

var fruitPos = {
  x1: 0, x2: 0, x3: 0,
  y1: 0, y2: 0, y3: 0,
  x4: 0, x5: 0, x6: 0,
  y4: 0, y5: 0, y6: 0,
  p1: false, p2: false, p3: false,
  p4: false, p5: false, p6: false
}

var bombPos = {
  x1: 0, x2: 0, x3: 0,
  y1: 0, y2: 0, y3: 0,
  x4: 0, x5: 0, x6: 0,
  y4: 0, y5: 0, y6: 0,
  p1: false, p2: false, p3: false,
  p4: false, p5: false, p6: false
}

//KEYBOARD, MOUSE INPUT VARIABLES
var key = [];
var leftClick = false;
var rightClick = false;

//KEYBOARD INPUT LISTENER

window.addEventListener("keydown", function (e) {
  key[e.keyCode] = true;

  // Start game with SPACE or ENTER
  if ((e.keyCode === 32 || e.keyCode === 13) && gameState === "start") {
    startGame();
  }

  // Restart game after game over
  if ((e.keyCode === 32 || e.keyCode === 13) && gameState === "gameOver") {
    resetGame();
  }

  // Pause/Resume with P or ESC
  if ((e.keyCode === 80 || e.keyCode === 27) && gameState === "playing") {
    gameState = "paused";
  } else if ((e.keyCode === 80 || e.keyCode === 27 || e.keyCode === 32) && gameState === "paused") {
    gameState = "playing";
  }
}, false);

window.addEventListener("keyup", function (e) { delete key[e.keyCode]; }, false);

//CANVAS TOUCH LISTENER FOR MOBILE (START/PAUSE/RESTART)

canvas.addEventListener("touchstart", function(e) {
  e.preventDefault();

  // Start game from start screen
  if (gameState === "start") {
    startGame();
  }
  // Restart game from game over screen
  else if (gameState === "gameOver") {
    resetGame();
  }
  // Toggle pause/resume during gameplay
  else if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
  }
}, false);

//MOUSE CLICK LISTENER

canvas.addEventListener("click", function(e) {
  // Start game from start screen
  if (gameState === "start") {
    startGame();
  }
  // Restart game from game over screen
  else if (gameState === "gameOver") {
    resetGame();
  }
  // Toggle pause/resume during gameplay
  else if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
  }
}, false);

function leftButton() {
  leftClick = true;
}

function rightButton() {
  rightClick = true;

}

// GAME LOOP

function game() {
  if (gameState === "playing") {
    time();
    update();
  }
  render(); // Always render to show start/pause/game over screens
}

function time() {
  timeOut = timeOut + 30 / 1000;
  if (timeOut >= timer1) {
    timeOut = 0;
    elementGenerator_lane1();
  }

  timeOut2 = timeOut2 + 30 / 1000;
  if (timeOut2 >= timer2) {
    timeOut2 = 0.5
    elementGenerator_lane2();
  }

  speedTimer = speedTimer + 30 / 1000;

}

////////////////////////////// GAME LOOP FUNCTIONS ///////////////////////

function elementGenerator_lane1() {

  var element_type = Math.floor(Math.random() * 2); //random number between 0 -1
  var element_pos = Math.floor(Math.random() * 2); //random number between 0 - 1

  switch (element_type) {

    case 0:

      switch (element_pos) {
        case 0:

          if (fruitPos.p1 == false) {
            fruitPos.x1 = position.a;
            fruitPos.y1 = -10;
            fruitPos.p1 = true;
          }
          else {
            fruitPos.x3 = position.a;
            fruitPos.y3 = -10;
            fruitPos.p3 = true;
          }

          break;

        case 1:

          if (fruitPos.p2 == false) {
            fruitPos.x2 = position.b;
            fruitPos.y2 = -10;
            fruitPos.p2 = true;
          }
          else {
            fruitPos.x3 = position.b;
            fruitPos.y3 = -10;
            fruitPos.p3 = true;
          }

          break;
      }

      break;

    case 1:

      switch (element_pos) {
        case 0:

          if (bombPos.p1 == false) {
            bombPos.x1 = position.a;
            bombPos.y1 = -10;
            bombPos.p1 = true;
          }
          else {
            bombPos.x3 = position.a;
            bombPos.y3 = -10;
            bombPos.p3 = true;
          }

          break;

        case 1:

          if (bombPos.p2 == false) {
            bombPos.x2 = position.b;
            bombPos.y2 = -10;
            bombPos.p2 = true;
          }
          else {
            bombPos.x3 = position.b;
            bombPos.y3 = -10;
            bombPos.p3 = true;
          }

          break;
      }

      break;
  }

}

function elementGenerator_lane2() {

  var element_type = Math.floor(Math.random() * 2); //random number between 0 -1
  var element_pos = Math.floor(Math.random() * 2); //random number between 0 - 1

  switch (element_type) {

    case 0:

      switch (element_pos) {
        case 0:

          if (fruitPos.p4 == false) {
            fruitPos.x4 = position.c;
            fruitPos.y4 = -10;
            fruitPos.p4 = true;
          }
          else {
            fruitPos.x6 = position.c;
            fruitPos.y6 = -10;
            fruitPos.p6 = true;
          }

          break;

        case 1:

          if (fruitPos.p5 == false) {
            fruitPos.x5 = position.d;
            fruitPos.y5 = -10;
            fruitPos.p5 = true;
          }
          else {
            fruitPos.x6 = position.d;
            fruitPos.y6 = -10;
            fruitPos.p6 = true;
          }

          break;
      }

      break;

    case 1:

      switch (element_pos) {
        case 0:

          if (bombPos.p4 == false) {
            bombPos.x4 = position.c;
            bombPos.y4 = -10;
            bombPos.p4 = true;
          }
          else {
            bombPos.x6 = position.c;
            bombPos.y6 = -10;
            bombPos.p6 = true;
          }

          break;

        case 1:

          if (bombPos.p5 == false) {
            bombPos.x5 = position.d;
            bombPos.y5 = -10;
            bombPos.p5 = true;
          }
          else {
            bombPos.x6 = position.d;
            bombPos.y6 = -10;
            bombPos.p6 = true;
          }

          break;
      }

      break;
  }

}



function update() {

  //DIFFICULTY LEVEL UPDATER
  /* DATA:
  level: speedElement: timer1, timer2.
  level1: 8 : 1 , 1.5
  level2: 9 : 0.85, 1.35
  level3: 10: 0.80. 1.30
  level4: 11: 0.70, 1.20
  level5: 12: 0.70, 1.20
  level6: 12: 0.65, 1.15
  need to test rest of the data to add levels
  */
  if (level < 6) //Max level is 6 currently
  {
    if (speedTimer >= 15) {
      speedTimer = 0;
      level++;
      switch (level) {
        case 2:
          speedElement = 9;
          timer1 = 0.85;
          timer2 = 1.35;
          break;
        case 3:
          speedElement = 10;
          timer1 = 0.80;
          timer2 = 1.30;
          break;
        case 4:
          speedElement = 11;
          timer1 = 0.70;
          timer2 = 1.20;
          break;
        case 5:
          speedElement = 12;
          timer1 = 0.70;
          timer2 = 1.20;
          break;
        default: //level6
          speedElement = 12;
          timer1 = 0.65;
          timer2 = 1.15;
          break;
      }
    }
  }

  //ANIMATION FOR EITHER PLAYER DEPENDING ON KEYBOARD INPUT

  if (animation.animate) {

    if (animation.p1A) {
      if (player1.x == position.b) { animation.p1A = false; animation.animate = false; }
      else player1.x += speed;
    }

    if (animation.p1B) {
      if (player1.x == position.a) { animation.p1B = false; animation.animate = false; }
      else player1.x -= speed;
    }

    if (animation.p2C) {
      if (player2.x == position.d) { animation.p2C = false; animation.animate = false; }
      else player2.x += speed;
    }

    if (animation.p2D) {
      if (player2.x == position.c) { animation.p2D = false; animation.animate = false; }
      else player2.x -= speed;
    }


  }

  //CHECK KEYBOARD INPUT AND ANIMATE PLAYERS ACCORDINGLY

  if (animation.animate == false) {


    if (key[37] == true || leftClick == true) {
      delete key[37];
      leftClick = false;
      animation.animate = true;
      if (player1.x == position.a) animation.p1A = true;
      else animation.p1B = true;
    }
    if (key[39] == true || rightClick == true) {
      delete key[39];
      rightClick = false;
      animation.animate = true;
      if (player2.x == position.c) animation.p2C = true;
      else animation.p2D = true;
    }

  }

  //COLLISION CHECK FOR FRUIT AND IF TRUE INCREASE SCORE
  // Updated with combo system and particle effects

  checkFruitCollision(fruitPos, 'x1', 'y1', 'p1', player1);
  checkFruitCollision(fruitPos, 'x2', 'y2', 'p2', player1);
  checkFruitCollision(fruitPos, 'x3', 'y3', 'p3', player1);
  checkFruitCollision(fruitPos, 'x4', 'y4', 'p4', player2);
  checkFruitCollision(fruitPos, 'x5', 'y5', 'p5', player2);
  checkFruitCollision(fruitPos, 'x6', 'y6', 'p6', player2);

  // Check combo timeout
  if (Date.now() - lastCatchTime > comboTimeout && combo > 0) {
    combo = 0;
    scoreMultiplier = 1;
  }

  // Update power-up timers
  updatePowerUps();

  // Update particles
  updateParticles();

  //GAMEOVER CHECK:
  // ONLY IF EITHER PLAYER COLLIDES WITH A BOMB (with lives system)
  // Missing fruits no longer causes death - game is now more forgiving!

  // Check bomb collisions with refactored code
  checkBombCollision(bombPos, 'x1', 'y1', 'p1', player1);
  checkBombCollision(bombPos, 'x2', 'y2', 'p2', player1);
  checkBombCollision(bombPos, 'x3', 'y3', 'p3', player1);
  checkBombCollision(bombPos, 'x4', 'y4', 'p4', player2);
  checkBombCollision(bombPos, 'x5', 'y5', 'p5', player2);
  checkBombCollision(bombPos, 'x6', 'y6', 'p6', player2);


  //CHECK IF ANY FRUIT HAS ACTIVE ANIMATION AND MOVE ITS POSITION

  if (bombPos.p1) {
    if (bombPos.y1 <= height) bombPos.y1 += speedElement;
    else bombPos.p1 = false;
  }

  if (bombPos.p2) {
    if (bombPos.y2 <= height) bombPos.y2 += speedElement;
    else bombPos.p2 = false;
  }

  if (bombPos.p3) {
    if (bombPos.y3 <= height) bombPos.y3 += speedElement;
    else bombPos.p3 = false;
  }


  if (fruitPos.p1) {
    if (fruitPos.y1 <= height) fruitPos.y1 += speedElement;
    else fruitPos.p1 = false;
  }

  if (fruitPos.p2) {
    if (fruitPos.y2 <= height) fruitPos.y2 += speedElement;
    else fruitPos.p2 = false;
  }

  if (fruitPos.p3) {
    if (fruitPos.y3 <= height) fruitPos.y3 += speedElement;
    else fruitPos.p3 = false;
  }

  //CHECK IF ANY BOMB HAS ACTIVE ANIMATION AND MOVE ITS POSITION

  if (bombPos.p4) {
    if (bombPos.y4 <= height) bombPos.y4 += speedElement;
    else bombPos.p4 = false;
  }

  if (bombPos.p5) {
    if (bombPos.y5 <= height) bombPos.y5 += speedElement;
    else bombPos.p5 = false;
  }

  if (bombPos.p6) {
    if (bombPos.y6 <= height) bombPos.y6 += speedElement;
    else bombPos.p6 = false;
  }


  if (fruitPos.p4) {
    if (fruitPos.y4 <= height) fruitPos.y4 += speedElement;
    else fruitPos.p4 = false;
  }

  if (fruitPos.p5) {
    if (fruitPos.y5 <= height) fruitPos.y5 += speedElement;
    else fruitPos.p5 = false;
  }

  if (fruitPos.p6) {
    if (fruitPos.y6 <= height) fruitPos.y6 += speedElement;
    else fruitPos.p6 = false;
  }

  //RESET POSITION OF ELEMENTS AFTER NO LONGER REQUIRED

  if (fruitPos.p1 == false) { fruitPos.x1 = -10; fruitPos.y1 = 0; }
  if (fruitPos.p2 == false) { fruitPos.x2 = -10; fruitPos.y2 = 0; }
  if (fruitPos.p3 == false) { fruitPos.x3 = -10; fruitPos.y3 = 0; }
  if (fruitPos.p4 == false) { fruitPos.x4 = -10; fruitPos.y4 = 0; }
  if (fruitPos.p5 == false) { fruitPos.x5 = -10; fruitPos.y5 = 0; }
  if (fruitPos.p6 == false) { fruitPos.x6 = -10; fruitPos.y6 = 0; }

  if (bombPos.p1 == false) { bombPos.x1 = -10; bombPos.y1 = 0; }
  if (bombPos.p2 == false) { bombPos.x2 = -10; bombPos.y2 = 0; }
  if (bombPos.p3 == false) { bombPos.x3 = -10; bombPos.y3 = 0; }
  if (bombPos.p4 == false) { bombPos.x4 = -10; bombPos.y4 = 0; }
  if (bombPos.p5 == false) { bombPos.x5 = -10; bombPos.y5 = 0; }
  if (bombPos.p6 == false) { bombPos.x6 = -10; bombPos.y6 = 0; }

}

function render() {

  //CLEAR SCREENS
  cx.clearRect(0, 0, width, height);

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "gameOver") {
    drawGameOverScreen();
    return;
  }

  //PLAYERS
  cx.drawImage(p1, player1.x, player1.y);
  cx.drawImage(p2, player2.x, player2.y);

  //LINES
  cx.beginPath();
  cx.lineWidth = 2;
  cx.moveTo(100, 0);
  cx.lineTo(100, height);
  cx.stroke();

  cx.beginPath();
  cx.moveTo(300, 0);
  cx.lineTo(300, height);
  cx.stroke();

  cx.beginPath();
  cx.lineWidth = 5;
  cx.moveTo(width / 2, 0);
  cx.lineTo(width / 2, height);
  cx.closePath();
  cx.stroke();

  //ENHANCED SCOREBOARD WITH LIVES, COMBO, AND HIGH SCORE

  // Background panel for stats
  cx.fillStyle = "rgba(0, 0, 0, 0.7)";
  cx.fillRect(0, 0, width, 45);

  cx.font = "bold 14px Arial";
  cx.fillStyle = "#FFD700";
  cx.fillText("Score: " + score, 10, 20);

  cx.fillStyle = "#FF6B6B";
  cx.fillText("Level: " + level, 10, 37);

  // Lives display with hearts
  cx.fillStyle = "#FF1493";
  cx.fillText("Lives: " + "♥".repeat(lives), width / 2 - 40, 20);

  // Combo display
  if (combo > 1) {
    cx.fillStyle = "#00FF00";
    cx.font = "bold 16px Arial";
    cx.fillText("COMBO x" + combo + "!", width / 2 - 45, 37);
  }

  // High score
  cx.fillStyle = "#87CEEB";
  cx.font = "12px Arial";
  cx.fillText("Best: " + highScore, width - 80, 20);

  // Power-up indicators
  drawPowerUpIndicators();

  //ELEMENTS

  if (bombPos.p1) cx.drawImage(bomb, bombPos.x1, bombPos.y1);
  if (bombPos.p2) cx.drawImage(bomb, bombPos.x2, bombPos.y2);
  if (bombPos.p3) cx.drawImage(bomb, bombPos.x3, bombPos.y3);

  if (fruitPos.p1) cx.drawImage(fruit, fruitPos.x1, fruitPos.y1);
  if (fruitPos.p2) cx.drawImage(fruit, fruitPos.x2, fruitPos.y2);
  if (fruitPos.p3) cx.drawImage(fruit, fruitPos.x3, fruitPos.y3);

  if (bombPos.p4) cx.drawImage(bomb, bombPos.x4, bombPos.y4);
  if (bombPos.p5) cx.drawImage(bomb, bombPos.x5, bombPos.y5);
  if (bombPos.p6) cx.drawImage(bomb, bombPos.x6, bombPos.y6);

  if (fruitPos.p4) cx.drawImage(fruit, fruitPos.x4, fruitPos.y4);
  if (fruitPos.p5) cx.drawImage(fruit, fruitPos.x5, fruitPos.y5);
  if (fruitPos.p6) cx.drawImage(fruit, fruitPos.x6, fruitPos.y6);

  // Draw particles
  drawParticles();

  // Paused overlay
  if (gameState === "paused") {
    cx.fillStyle = "rgba(0, 0, 0, 0.7)";
    cx.fillRect(0, 0, width, height);
    cx.fillStyle = "#FFFFFF";
    cx.font = "bold 40px Arial";
    cx.textAlign = "center";
    cx.fillText("PAUSED", width / 2, height / 2);
    cx.font = "18px Arial";
    cx.fillText("Press P or ESC to resume", width / 2, height / 2 + 40);
    cx.textAlign = "left";
  }

}


//GAME LOOP DEFINITION
gameLoop = setInterval(game, 30); //RUNS THE FUNCTION "game" in every 30 miliSec

//================= HELPER FUNCTIONS =================//

// Start the game
function startGame() {
  gameState = "playing";
  resetGame();
}

// Reset game to initial state
function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  combo = 0;
  maxCombo = 0;
  scoreMultiplier = 1;
  speedElement = 8;
  timer1 = 1;
  timer2 = 1.5;
  speedTimer = 0;

  // Reset positions
  player1.x = position.a;
  player2.x = position.c;

  // Clear all falling objects
  fruitPos = {
    x1: 0, x2: 0, x3: 0,
    y1: 0, y2: 0, y3: 0,
    x4: 0, x5: 0, x6: 0,
    y4: 0, y5: 0, y6: 0,
    p1: false, p2: false, p3: false,
    p4: false, p5: false, p6: false
  };

  bombPos = {
    x1: 0, x2: 0, x3: 0,
    y1: 0, y2: 0, y3: 0,
    x4: 0, x5: 0, x6: 0,
    y4: 0, y5: 0, y6: 0,
    p1: false, p2: false, p3: false,
    p4: false, p5: false, p6: false
  };

  particles = [];
  gameState = "playing";
}

// Lose a life
function loseLife() {
  if (powerUps.shield) {
    powerUps.shield = false;
    return; // Shield protects from losing life
  }

  lives--;
  combo = 0; // Reset combo on life lost
  scoreMultiplier = 1;

  if (lives <= 0) {
    gameOver();
  }
}

// Game Over function with high score tracking
function gameOver() {
  gameState = "gameOver";

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pikachu_highScore', highScore);
  }

  // Track max combo
  if (combo > maxCombo) {
    maxCombo = combo;
  }
}

// Refactored fruit collision detection
function checkFruitCollision(fruitPos, xKey, yKey, pKey, player) {
  if (fruitPos[xKey] == player.x) {
    if (fruitPos[yKey] + 28 >= player.y && fruitPos[yKey] <= player.y + 20) {
      try { eat.play(); } catch(e) { }

      // Update combo
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      lastCatchTime = Date.now();

      // Calculate score multiplier based on combo
      scoreMultiplier = Math.min(1 + Math.floor(combo / 3), 5); // Max 5x multiplier

      // Apply power-up bonus
      var points = 1 * scoreMultiplier;
      if (powerUps.doublePoints) points *= 2;

      score += points;

      // Create particles
      createParticles(fruitPos[xKey] + 15, fruitPos[yKey] + 15, '#FFD700');

      fruitPos[pKey] = false;
    }
  }
}

// Refactored bomb collision detection
function checkBombCollision(bombPos, xKey, yKey, pKey, player) {
  if (bombPos[pKey] && bombPos[xKey] == player.x) {
    if (bombPos[yKey] + 28 >= player.y && bombPos[yKey] <= player.y + 20) {
      bombPos[pKey] = false;
      loseLife();
      createParticles(bombPos[xKey] + 15, bombPos[yKey] + 15, '#FF0000');
    }
  }
}

// Particle system
function createParticles(x, y, color) {
  for (var i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      color: color
    });
  }
}

function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].vx;
    particles[i].y += particles[i].vy;
    particles[i].life--;

    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    cx.fillStyle = p.color;
    cx.globalAlpha = p.life / 30;
    cx.beginPath();
    cx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    cx.fill();
  }
  cx.globalAlpha = 1;
}

// Power-up system
function updatePowerUps() {
  var currentTime = Date.now();

  if (powerUps.shield && currentTime - powerUps.shieldTime > 5000) {
    powerUps.shield = false;
  }

  if (powerUps.slowMo && currentTime - powerUps.slowMoTime > 5000) {
    powerUps.slowMo = false;
  }

  if (powerUps.doublePoints && currentTime - powerUps.doublePointsTime > 5000) {
    powerUps.doublePoints = false;
  }
}

function drawPowerUpIndicators() {
  var yPos = 37;
  cx.font = "12px Arial";

  if (powerUps.shield) {
    cx.fillStyle = "#00FFFF";
    cx.fillText("🛡️ SHIELD", width - 80, yPos);
  }

  if (powerUps.doublePoints) {
    cx.fillStyle = "#FFD700";
    cx.fillText("⭐ 2X PTS", width - 80, yPos);
  }
}

// Start screen
function drawStartScreen() {
  cx.fillStyle = "rgba(139, 100, 50, 0.9)";
  cx.fillRect(0, 0, width, height);

  cx.fillStyle = "#FFD700";
  cx.font = "bold 50px Arial";
  cx.textAlign = "center";
  cx.fillText("2 PIKACHU", width / 2, height / 3);

  cx.fillStyle = "#FFFFFF";
  cx.font = "20px Arial";
  cx.fillText("Catch the candy!", width / 2, height / 2 - 20);
  cx.fillText("Avoid the pokeballs!", width / 2, height / 2 + 10);

  cx.fillStyle = "#FFD700";
  cx.font = "16px Arial";
  cx.fillText("← Left Arrow: Move Left Pikachu", width / 2, height / 2 + 60);
  cx.fillText("→ Right Arrow: Move Right Pikachu", width / 2, height / 2 + 85);

  cx.fillStyle = "#00FF00";
  cx.font = "bold 24px Arial";
  cx.fillText("Press SPACE or ENTER to Start!", width / 2, height - 80);

  if (highScore > 0) {
    cx.fillStyle = "#87CEEB";
    cx.font = "18px Arial";
    cx.fillText("High Score: " + highScore, width / 2, height - 40);
  }

  cx.textAlign = "left";
}

// Game over screen
function drawGameOverScreen() {
  cx.fillStyle = "rgba(0, 0, 0, 0.8)";
  cx.fillRect(0, 0, width, height);

  cx.fillStyle = "#FF6B6B";
  cx.font = "bold 50px Arial";
  cx.textAlign = "center";
  cx.fillText("GAME OVER", width / 2, height / 3);

  cx.fillStyle = "#FFD700";
  cx.font = "30px Arial";
  cx.fillText("Score: " + score, width / 2, height / 2 - 20);

  cx.fillStyle = "#FFFFFF";
  cx.font = "20px Arial";
  cx.fillText("Level Reached: " + level, width / 2, height / 2 + 20);
  cx.fillText("Max Combo: " + maxCombo + "x", width / 2, height / 2 + 50);

  if (score >= highScore) {
    cx.fillStyle = "#00FF00";
    cx.font = "bold 24px Arial";
    cx.fillText("NEW HIGH SCORE!", width / 2, height / 2 + 90);
  } else {
    cx.fillStyle = "#87CEEB";
    cx.font = "18px Arial";
    cx.fillText("High Score: " + highScore, width / 2, height / 2 + 90);
  }

  cx.fillStyle = "#00FF00";
  cx.font = "bold 22px Arial";
  cx.fillText("Press SPACE to Play Again", width / 2, height - 60);

  cx.textAlign = "left";
}

// Mobile touch control handlers
function handleTouchLeft(event) {
  event.preventDefault();
  key[37] = true; // Simulate left arrow key
}

function handleTouchRight(event) {
  event.preventDefault();
  key[39] = true; // Simulate right arrow key
}

function handleTouchEnd(event) {
  event.preventDefault();
  delete key[37];
  delete key[39];
}

function handleTouchPause(event) {
  event.preventDefault();
  // Toggle pause/resume during gameplay
  if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
  }
}
