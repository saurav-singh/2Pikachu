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
var speed = 5; // Reduced for smoother animation
var speedElement = 2; // Very slow starting falling speed
var timeOut = 0;
var timeOut2 = 0;
var timer1 = 2.0; // Much slower spawn rate for level 1
var timer2 = 2.5; // Much slower spawn rate for level 1
var level = 1;
var speedTimer = 0;
var gameStart = false;

// Dynamic level system
var baseFallingSpeed = 2; // Starting speed at level 1 (very slow)
var baseTimer1 = 2.0; // Starting spawn timer for lane 1
var baseTimer2 = 2.5; // Starting spawn timer for lane 2
var levelUpTime = 30; // Time in seconds to level up (longer for level 1)

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
  y: height - 50,
  targetX: position.a,
  moving: false
}

var player2 = {
  x: position.c,
  y: height - 50,
  targetX: position.c,
  moving: false
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
  // Use deltaTime for frame-rate independent timing
  var dt = Math.min(deltaTime, 0.1); // Cap delta time to prevent huge jumps

  timeOut = timeOut + dt;
  if (timeOut >= timer1) {
    timeOut = 0;
    elementGenerator_lane1();
  }

  timeOut2 = timeOut2 + dt;
  if (timeOut2 >= timer2) {
    timeOut2 = 0.5
    elementGenerator_lane2();
  }

  speedTimer = speedTimer + dt;

}

////////////////////////////// GAME LOOP FUNCTIONS ///////////////////////

// Dynamic difficulty calculator
function updateDifficulty() {
  /*
   * Dynamic scaling formulas for unlimited levels:
   * - Falling speed: Increases logarithmically, caps at level ~100
   * - Spawn timers: Decrease logarithmically, have minimum values
   *
   * Level 1: speed=3, timer1=1.5s, timer2=2.0s (very easy)
   * Level 10: speed~5, timer1~1.1s, timer2~1.5s (moderate)
   * Level 25: speed~7, timer1~0.85s, timer2~1.2s (challenging)
   * Level 50: speed~9, timer1~0.65s, timer2~0.95s (hard)
   * Level 100: speed~12, timer1~0.5s, timer2~0.75s (extreme)
   */

  // Logarithmic speed increase: starts slow, gradually increases
  // Formula: baseSpeed + log(level) * multiplier
  speedElement = baseFallingSpeed + Math.log(level + 1) * 1.8;
  speedElement = Math.min(speedElement, 15); // Cap at 15 for playability

  // Logarithmic spawn timer decrease: starts slow, minimum threshold
  // Formula: baseTimer - log(level) * multiplier, with minimum
  timer1 = baseTimer1 - Math.log(level + 1) * 0.25;
  timer1 = Math.max(timer1, 0.5); // Minimum 0.5 seconds between spawns

  timer2 = baseTimer2 - Math.log(level + 1) * 0.3;
  timer2 = Math.max(timer2, 0.7); // Minimum 0.7 seconds between spawns

  // Optional: Decrease level-up time as you progress (faster levels at high scores)
  if (level > 20) {
    levelUpTime = Math.max(20, 30 - Math.floor(level / 15)); // Faster levels after level 20
  }
}

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

  //DYNAMIC DIFFICULTY LEVEL UPDATER
  /* Dynamic level system that scales up to level 100+
   * Uses logarithmic scaling for smooth, gradual difficulty increase
   * Speed increases slowly, spawn rate decreases gradually
   */
  if (speedTimer >= levelUpTime) {
    speedTimer = 0;
    level++;
    updateDifficulty();
  }

  //SMOOTH ANIMATION FOR PLAYERS USING INTERPOLATION

  // Player 1 smooth movement
  if (player1.moving) {
    var diff1 = player1.targetX - player1.x;
    if (Math.abs(diff1) < 1) {
      player1.x = player1.targetX;
      player1.moving = false;
    } else {
      player1.x += diff1 * 0.15; // Slower interpolation for smoother, controlled movement
    }
  }

  // Player 2 smooth movement
  if (player2.moving) {
    var diff2 = player2.targetX - player2.x;
    if (Math.abs(diff2) < 1) {
      player2.x = player2.targetX;
      player2.moving = false;
    } else {
      player2.x += diff2 * 0.15; // Slower interpolation for smoother, controlled movement
    }
  }

  // Legacy animation system (keeping for compatibility)
  if (animation.animate) {

    if (animation.p1A) {
      if (player1.x >= position.b - 1) {
        player1.x = position.b;
        animation.p1A = false;
        animation.animate = false;
      }
      else player1.x += speed;
    }

    if (animation.p1B) {
      if (player1.x <= position.a + 1) {
        player1.x = position.a;
        animation.p1B = false;
        animation.animate = false;
      }
      else player1.x -= speed;
    }

    if (animation.p2C) {
      if (player2.x >= position.d - 1) {
        player2.x = position.d;
        animation.p2C = false;
        animation.animate = false;
      }
      else player2.x += speed;
    }

    if (animation.p2D) {
      if (player2.x <= position.c + 1) {
        player2.x = position.c;
        animation.p2D = false;
        animation.animate = false;
      }
      else player2.x -= speed;
    }


  }

  //CHECK KEYBOARD INPUT AND ANIMATE PLAYERS ACCORDINGLY

  if (animation.animate == false && !player1.moving && !player2.moving) {

    if (key[37] == true || leftClick == true) {
      delete key[37];
      leftClick = false;

      // Use smooth movement system
      if (Math.abs(player1.x - position.a) < 1 || player1.x < position.a + 10) {
        player1.targetX = position.b;
      } else {
        player1.targetX = position.a;
      }
      player1.moving = true;
    }

    if (key[39] == true || rightClick == true) {
      delete key[39];
      rightClick = false;

      // Use smooth movement system
      if (Math.abs(player2.x - position.c) < 1 || player2.x < position.c + 10) {
        player2.targetX = position.d;
      } else {
        player2.targetX = position.c;
      }
      player2.moving = true;
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
    updateMobileStartButton();
    return;
  }

  if (gameState === "gameOver") {
    drawGameOverScreen();
    updateMobileStartButton();
    return;
  }

  updateMobileStartButton();

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

  // Enhanced level display with dynamic difficulty indicator
  cx.fillStyle = "#FF6B6B";
  var difficultyText = "";
  if (level <= 5) difficultyText = "Easy";
  else if (level <= 15) difficultyText = "Medium";
  else if (level <= 30) difficultyText = "Hard";
  else if (level <= 50) difficultyText = "Expert";
  else difficultyText = "Insane";

  cx.fillText("Lv " + level + " (" + difficultyText + ")", 10, 37);

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
// Using requestAnimationFrame for smoother 60 FPS animation
var lastFrameTime = Date.now();
var deltaTime = 0;

function gameLoop() {
  var currentTime = Date.now();
  deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;

  game();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

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
  speedElement = baseFallingSpeed;
  timer1 = baseTimer1;
  timer2 = baseTimer2;
  speedTimer = 0;
  levelUpTime = 30; // Reset level up time

  // Reset positions
  player1.x = position.a;
  player1.targetX = position.a;
  player1.moving = false;
  player2.x = position.c;
  player2.targetX = position.c;
  player2.moving = false;

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

// Refactored fruit collision detection with smoother hit detection
function checkFruitCollision(fruitPos, xKey, yKey, pKey, player) {
  // Use tolerance for smoother collision detection with interpolated positions
  var tolerance = 8;
  if (Math.abs(fruitPos[xKey] - Math.round(player.x)) <= tolerance) {
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

// Refactored bomb collision detection with smoother hit detection
function checkBombCollision(bombPos, xKey, yKey, pKey, player) {
  // Use tolerance for smoother collision detection with interpolated positions
  var tolerance = 8;
  if (bombPos[pKey] && Math.abs(bombPos[xKey] - Math.round(player.x)) <= tolerance) {
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

  // Display level with difficulty
  var finalDifficulty = "";
  if (level <= 5) finalDifficulty = "Easy";
  else if (level <= 15) finalDifficulty = "Medium";
  else if (level <= 30) finalDifficulty = "Hard";
  else if (level <= 50) finalDifficulty = "Expert";
  else finalDifficulty = "Insane";

  cx.fillText("Level: " + level + " (" + finalDifficulty + ")", width / 2, height / 2 + 20);
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

function handleTouchStart(event) {
  event.preventDefault();
  if (gameState === "start") {
    startGame();
    updateMobileStartButton();
  } else if (gameState === "gameOver") {
    resetGame();
    updateMobileStartButton();
  }
}

function handleClickStart(event) {
  event.preventDefault();
  if (gameState === "start") {
    startGame();
    updateMobileStartButton();
  } else if (gameState === "gameOver") {
    resetGame();
    updateMobileStartButton();
  }
}

// Update mobile start button visibility
function updateMobileStartButton() {
  var startBtn = document.getElementById('mobileStartBtn');
  if (gameState === "start" || gameState === "gameOver") {
    startBtn.style.display = 'block';
    // Update button text based on state
    var btnLabel = startBtn.querySelector('.btn-label');
    if (gameState === "gameOver") {
      btnLabel.textContent = 'RESTART';
    } else {
      btnLabel.textContent = 'START';
    }
  } else {
    startBtn.style.display = 'none';
  }
}
