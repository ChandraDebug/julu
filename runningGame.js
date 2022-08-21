// animation that updates the display of the game
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var wombat = 0;
var kangaroo= 0;
var galah = 0;
var koala = 0;
var magpie = 0;
 var traj = 100;

// dimensions
var width = 1920;
var height = 967;
const PLAYER_HEIGHT = 450;
const PLAYER_WIDTH = 350;
var keys = []; //An array to keep track of keys pressed
const gravity = 1; //Simulates speed of gravity for jumping
var boxes = []; //An array of boxes on the screen
var player = { //Player object
  x: width / 6,
  y: height - 100,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  speed: 20,
  velY: 0,
  jumping: false,
  grounded: false
};

canvas.width = width;
canvas.height = height;
var maxHealth;
var curHealth;
var travelled = 0;

// player images
var playerimg = document.getElementById('character');
var jumpimg = document.getElementById('jump');
var crouchimg = document.getElementById('crouch');

canvas.style.display = "block"; //Displays the game

runGame(); //Starts the level

//A helper function to help generate random numbers within a certain range
function randomNumber(min, max) {
  let range = max - min + 1;
  return Math.floor(Math.random() * range) + min;
}

// function called when user reaches 0 health
function endGame() {
  // redirects user to "game over" screen
  //window.open("success.html", "_self");

  $('#result').html ("Awesome <span class='glyphicon glyphicon-tent'></span> you have met "+boxes.length+" animals and have missed meeting "+curHealth[0]+" animals . If you want to read more about our amazing local wildlife head over to https://www.ala.org.au/ website. <br><button class='btn btn-lg btn-success' onclick='window.location=game.html'><span class='glyphicon glyphicon-repeat'></span></button>");

}

// function that initializes some settings and graphics for the game
function setUp() {

  // sets random amount of water from 2-3L
  maxHealth = randomNumber(15000, 30000);
  curHealth = [0];
  // displays other info
  var t = "Animals met "+ magpie+ " Magpies "+ galah +" Galah "+ kangaroo +" Kangaroo "+ wombat +" Wombat " + koala + "Koala";
  var d = "Distance to home: " + travelled + " m";

  $('.temperature').text(t);
  $('.distance').text(d);




  // sets background to match time of day
  var d = new Date();
  // gets hours since midnight
  var n = d.getHours();
  var color1;
  var color2;
  // sky changes colour depending on time of day
  if (n < 6 || n > 21) {
    //night sky
    color1 = "#09203f";
    color2 = "#537895";
  } else if (n < 18) {
    // daytime sky
    color1 = "#93a5cf";
    color2 = "#e4efe9";
  } else {
    // sunset sky
    color1 = "#f0B7A4"
    color2 = "#fFE469";
  }
  $('body').css('background-image', 'linear-gradient(to bottom, ' + color1 + ', ' + color2 + ')');

}

// runs the game
function runGame() {

  setUp();

  //Resets the boxes on the screen so that only the floor is left
  boxes = [{
    x: 0,
    y: height,
    width: width,
    height: height - 5,
    name: "floor"
  }];

  //Resets properties of the player
  player = {
    x: width /3, //Position of the player
    y: height - 60,
    width: PLAYER_WIDTH, //Size of the player
    height: PLAYER_HEIGHT,
    speed: 12, //Speed for jumping
    velY: 0,
    jumping: false,
    grounded: true
  };

  var NUM_OBSTACLES = randomNumber(20, 30); //Number of obstacles before reaching home

  // sets game background
  canvas.style['background-image'] = 'url(Images/20123112.jpg)';

  //Creates the first obstacle
  boxes.push({
    x: width + 200, //First obstacle is off to the right of the screen
    y: height - 350,
    width: 250,
    height: 200,
    name: "obstacle1"
  });

  //Creates the rest of the obstacles in the level
  for (i = 2; i < NUM_OBSTACLES; i++) {
    obs = randomNumber(1, 6);

    if (obs == 1) {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(1800, 1000), //Obstacles are randomly positioned (within a certain range) after the last obstacles
        y: height - 250,
        width: 250,
        height: 200,
        name: "obstacle" + obs
      });
    } else if (obs == 2) {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(800, 2000),
        y: height - randomNumber(300, 1000),
        width: 300,
        height: 200,
        name: "obstacle" + obs
      });
    }else if (obs == 3) {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(1200, 2000),
        y: height - randomNumber(800, 1000),
        width: 300,
        height: 200,
        name: "obstacle" + obs
      });
    }
    else if (obs == 4) {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(1800, 2000),
        y: height - 320,
        width: 350,
        height: 350,
        name: "obstacle" + obs
      });
    }

    else if (obs == 5 ) {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(1200, 1500),
        y: height - 270,
        width: 250,
        height: 250,
        name: "obstacle" + obs
      });
    }

        else   {

      boxes.push({
        x: boxes[i - 1].x + randomNumber(1200, 2000),
        y: height - randomNumber(250, 1000),
        width: 200,
        height: 200,
        name: "obstacle" + obs
      });
    }
  }

  // house at the end of the level
  boxes.push({
    x: boxes[NUM_OBSTACLES - 1].x + randomNumber(800, 1000),
    y: height - 300,
    width: 300,
    height: 300,
    name: "house"
  })



  update();
}

// fucntion that constantly updates the state of the game
function update() {

  var actionimg = playerimg;

  ctx.clearRect(0, 0, width, height); //Gets rid of existing frame

  //Resets the dimensions of the player
  player.height = PLAYER_HEIGHT;
  player.width = PLAYER_WIDTH

  if (keys[38] || keys[32] || keys[87]) { //Up arrow key, W key and space bar to jump
    if (!player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velY = -player.speed * 2.75; //Simulates player jumping
    }
  }

  player.velY += gravity; //Simulates gravity pulling player down

  if ((keys[40] || keys[83]) && player.grounded) { //Down arrow key and S key to duck when the player is on the ground
    // player.height = 200; //Player height is reduced
    // player.width = 120
    // player.y = height - 35; //Player position moves down
    // actionimg = crouchimg; // changes image if crouching
  }

  if (player.grounded) { //Player stops going down once they hit the ground
    player.velY = 0;
  }
  if (player.jumping) {
    actionimg = jumpimg;
    player.height = 350;
    player.width = 300;
  }

  player.y += player.velY; //Player vertical position changes depending on velocity

  for (var i = 0; i < boxes.length; i++) {


    var dir = colCheck(player, boxes[i]); //Checks collisions with player and every obstacle in the game

    // if the player reaches the end of the game
    if ((dir) && (boxes[i].name == "house")) {
       //Animates the game

      endGame();
      return //Exits the function
    }

    //If the player collides with any obstacles
    if (dir === "left" || dir === "right" || dir === "top") {
 applyChange(curHealth);
      caught(i);
      boxes[i] = 0;
    } else if (dir === "bottom") {

      if (boxes[i].name != "floor") {
         applyChange(curHealth);
        boxes[i] = 0;

      } else {


        player.grounded = true;
        player.jumping = false;
      }
    }



    travelled++;
    if (travelled % 300 == 0) {
      var d = "Distance travelled: " + travelled / 300 + " Kms";
      $('.distance').text(d);
    }



    //The following code draws out the game
    if (boxes[i].name == "floor") {
      ctx.fillStyle = "white";
      ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    } else if (boxes[i].name == "house") {
      boxes[i].x -= 15;
      var houseimg = document.getElementById('house');
      ctx.drawImage(houseimg, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    } else {
      boxes[i].x -= 15; //This moves all the obstacles to the left

      if (boxes[i].name == "obstacle1") {


        var tumbleweed = document.getElementById('tumbleweed');
        ctx.drawImage(tumbleweed, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      } else if (boxes[i].name == "obstacle2") {

        var bird = document.getElementById('bird');
        ctx.drawImage(bird, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      } else if (boxes[i].name == "obstacle3") {


        var bird2 = document.getElementById('bird2');
        ctx.drawImage(bird2, boxes[i].x, boxes[i].y , boxes[i].width, boxes[i].height);
        traj--;

      }
      else if (boxes[i].name == "obstacle4") {



        var bird3 = document.getElementById('bird3');
        ctx.drawImage(bird3, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      }
       else if (boxes[i].name == "obstacle5") {

        var bird4 = document.getElementById('bird4');
        ctx.drawImage(bird4, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      }
      else if (boxes[i].name == "obstacle6") {

        var fun = document.getElementById('fun');
        ctx.drawImage(fun, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      }


    }
  }

  ctx.drawImage(actionimg, player.x, player.y, player.width, player.height); //Draws the player
  ctx.beginPath(); //Current state of the game

  setTimeout(function(){ //throttle requestAnimationFrame to 20fps
          if (isRunning) {requestAnimationFrame(update);} //Animates the game
    }, 20)


}


var isRunning = true;


function togglePause() {
  // toggle the value of isRunning
  isRunning = !isRunning;

  // call animate() if working
  if (isRunning) {
    update();
  }
}


function caught(i)
{

        if (boxes[i].name == "obstacle1") {
wombat++;


      } else if (boxes[i].name == "obstacle2") {

        magpie++;


      } else if (boxes[i].name == "obstacle3") {
galah++;

      }
      else if (boxes[i].name == "obstacle4") {

        kangaroo++
      }
       else if (boxes[i].name == "obstacle5") {

       koala++
      }
      else if (boxes[i].name == "obstacle6") {

       togglePause()

        var rand = randomNumber(1,6);
        var $this = $("#fact"+rand);

        $this.show();

        $("#stats").hide();







      }


  var t = "Animals met <br><h2 class='badge badge-pill badge-primary' style='background-color:blue'>"+ magpie+" Magpies</h2> <h2 class='badge  bg-primary' style='background-color:orange'>"+ galah+" Galah</h2> <h2 class='badge rounded-pill bg-info' style='background-color:green'>"+ kangaroo+" Kangaroo </h2><h2 class='badge rounded-pill bg-danger' style='background-color:black'> "+ wombat+" Wombats </h2><h2 class='badge rounded-pill bg-secondary' style='background-color:red'>"+ koala+" Koalas </h2>"


  $('.temperature').html(t);

}






//This checks whether two shapes are colliding and from which direction
function colCheck(shapeA, shapeB) {

  var cX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)), //Finds the difference in x coordinates of the two objects' centers
    cY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)), //Finds the difference in y coordinates of the two objects' centers
    hWidths = (shapeA.width / 2) + (shapeB.width / 2), //The half-widths of the two shapes added together
    hHeights = (shapeA.height / 2) + (shapeB.height / 2), //The half-heights of the two shapes added together
    colDir = null;

  //If the distance between centers is less than the half-height and half-width sum, then the shapes are colliding
  if (Math.abs(cX) < hWidths && Math.abs(cY) < hHeights) {
    // Figures out on which side the boxes are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(cX), //The overlap
      oY = hHeights - Math.abs(cY);
    if (oX >= oY) { //If the y coordinates overlap
      if (cY > 0) {
        colDir = "top";
        shapeA.y += oY;
      } else {
        colDir = "bottom";
        shapeA.y -= oY;
      }
    } else { //If the x coordinates overlap
      if (cX > 0) {
        colDir = "left";
        shapeA.x += oX;
      } else {
        colDir = "right";
        shapeA.x -= oX;
      }
    }
  }
  return colDir; //Returns direction of collision or null if there isn't one
}
//Health Bar
$ = jQuery;

$("#fact1").hide();
$("#fact2").hide();
$("#fact3").hide();
$("#fact4").hide();
$("#fact5").hide();
$("#fact6").hide();

$(".health-bar-text").html("0%");
$(".health-bar").css({
  "width": "0%"
});

function applyChange(curHealth) {




  var audio = new Audio("Sound/ow.mp3");
  audio.play();
  var damage = randomNumber(4000, 8000);
  curHealth[0] = curHealth[0] + 1;
  if (curHealth[0] >= boxes.length) {
    //curHealth[0] = 0;
    gameOver();
  }


  var a = curHealth * (100 / boxes.length);
  if (a > 50) {
    $(".health-bar-text").css("color", "#fff");
  }
  else
  {
    $(".health-bar-text").css("color", "#043c5b");
  }

  $(".health-bar-text").html(Math.round(a) + "%");
  $(".health-bar-red").animate({
    'width': a + "%"
  }, 700);
  $(".health-bar").animate({
    'width': a + "%"
  }, 500);
  $(".health-bar-blue").animate({
    'width': a + "%"
  }, 300);

  var left = boxes.length - curHealth;
  var w = "Animals yet to meet : " + left ;
  $('.water').html(w);
}



//This checks whether a key is being held down
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});



$(document).ready(function(){
  $("#close1").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
    $("#close2").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
    $("#close3").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
    $("#close4").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
    $("#close5").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
    $("#close6").on("click",function(e){

    $(this).parent('div').fadeOut();
    togglePause();
    $("#stats").show();
  })
})


