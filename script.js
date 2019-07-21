//LOADING CANVAS
var C = document.getElementById("canvas");
var cx = C.getContext("2d");

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

window.addEventListener("keydown", function (e) { key[e.keyCode] = true; }, false);

window.addEventListener("keyup", function (e) { delete key[e.keyCode]; }, false);

//MOUSE CLICK LISTENER

function leftButton() {
  leftClick = true;
}

function rightButton() {
  rightClick = true;

}

// GAME LOOP

function game() {
  time();
  update();
  render();
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

  if (fruitPos.x1 == player1.x) {
    if (fruitPos.y1 + 28 >= player1.y && fruitPos.y1 <= player1.y + 20) {
      eat.play();
      score++;
      fruitPos.p1 = false;
    }
  }
  if (fruitPos.x2 == player1.x) {
    if (fruitPos.y2 + 28 >= player1.y && fruitPos.y2 <= player1.y + 20) {
      score++;
      eat.play();
      fruitPos.p2 = false;
    }
  }
  if (fruitPos.x3 == player1.x) {
    if (fruitPos.y3 + 28 >= player1.y && fruitPos.y3 <= player1.y + 20) {
      score++;
      eat.play();
      fruitPos.p3 = false;
    }
  }

  if (fruitPos.x4 == player2.x) {
    if (fruitPos.y4 + 28 >= player2.y && fruitPos.y4 <= player2.y + 20) {
      score++;
      eat.play();
      fruitPos.p4 = false;
    }
  }
  if (fruitPos.x5 == player2.x) {
    if (fruitPos.y5 + 28 >= player2.y && fruitPos.y5 <= player2.y + 20) {
      score++;
      eat.play();
      fruitPos.p5 = false;
    }
  }
  if (fruitPos.x6 == player2.x) {
    if (fruitPos.y6 + 28 >= player2.y && fruitPos.y6 <= player2.y + 20) {
      score++;
      eat.play();
      fruitPos.p6 = false;
    }
  }

  //GAMEOVER CHECK:
  // IF EITHER PLAYER COLLIDES WITH A BOMB
  // IF EITHHER PLAYER MISS A FRUIT

  if (fruitPos.y1 > player1.y + 30 || fruitPos.y2 > player1.y + 30 ||
    fruitPos.y3 > player1.y + 30 || fruitPos.y4 > player2.y + 30 ||
    fruitPos.y5 > player2.y + 30 || fruitPos.y6 > player2.y + 30)
    gameOver();

  if (bombPos.x1 == player1.x) {
    if (bombPos.y1 + 28 >= player1.y && bombPos.y1 <= player1.y + 20) {
      gameOver();
    }
  }
  if (bombPos.x2 == player1.x) {
    if (bombPos.y2 + 28 >= player1.y && bombPos.y2 <= player1.y + 20) {
      gameOver();
    }
  }
  if (bombPos.x3 == player1.x) {
    if (bombPos.y3 + 28 >= player1.y && bombPos.y3 <= player1.y + 20) {
      gameOver();
    }
  }

  if (bombPos.x4 == player2.x) {
    if (bombPos.y4 + 28 >= player2.y && bombPos.y4 <= player2.y + 20) {
      gameOver();
    }
  }
  if (bombPos.x5 == player2.x) {
    if (bombPos.y5 + 28 >= player2.y && bombPos.y5 <= player2.y + 20) {
      gameOver();
    }
  }
  if (bombPos.x6 == player2.x) {
    if (bombPos.y6 + 28 >= player2.y && bombPos.y6 <= player2.y + 20) {
      gameOver();
    }
  }


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

  //SCOREBOARD

  cx.font = "12px Arial";
  cx.fillText("Pika Level:" + score, width - 80, 20);
  cx.fillText("Difficulty:" + level, 10, 20);

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

}


//GAME LOOP DEFINITION
gameLoop = setInterval(game, 30); //RUNS THE FUNCTION "game" in every 30 miliSec

//GAME OVER FUNCTION BECAUSE i DON'T KNOW OHER METHODS YET...
function gameOver() {

  alert("Game Over! \n    Your Score: " + score);
  document.location.reload();

}
