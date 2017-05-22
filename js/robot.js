var CWIDTH;
var CHEIGHT;
var ctx;
var canvas;
var robots = [];
var balls = [];
var raf;
var lastCalledTime;
var fps;
var delta;
var GRAVITY = 0.5;
var FRICTION = 0.4;
var AIRRESISTANCE = 0.1;
var MOVESPEED = 5;
var JUMPSPEED = 17;
var MAXSPEED = 10;
var up = false;
var down = false;
var right = false;
var left = false;
var shoot = false;
var SHOOTDELAY = 0.25;
var shootTimer;
var shootDelta;
var BOUNCE_CONSTANT = 0.8;
var goal;
var score = 0;

function rectangle(x,y,w,h,vx,vy,color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vx = vx;
  this.vy = vy;
  this.color = color;
  this.airborne = false;
  this.heading = 1;
  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
}

function circle(x, y, vx, vy, ax, ay, radius, color){
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ax = ax;
  this.ay = ay;
  this.radius = radius;
  this.color = color;
  this.draw = function()
  {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
  this.velocityMag = function()
  {
    return Math.sqrt(pow(vx,2) + pow(vy,2));
  }
  this.velocityDir = function()
  {
    return this.vx > 0 ? atan(this.vy, this.vx) : atan(this.vy, this.vx) + Math.PI;
  }
}

function collision(circlea, circleb)
{
  //basic collision detection
  return Math.abs(circlea.x-circleb.x) <= Math.max(circlea.radius, circleb.radius) && Math.abs(circlea.y - circleb.y) <= Math.max(circlea.radius, circleb.radius);
}

function animate()
{
  if(!lastCalledTime) {
    lastCalledTime = Date.now();
    fps = 0;
  }
  delta = (new Date().getTime() - lastCalledTime)/1000;
  lastCalledTime = Date.now();
  fps = 1/delta;

  ctx.font = "10px Arial";
  ctx.clearRect(0,0, CWIDTH, CHEIGHT);
  ctx.fillText("FPS: " + Math.round(fps), CWIDTH - 60, 10);
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score,CWIDTH/2,30);

  for (var i = 0; i < robots.length; i++)
  {
    if(robots[i].y+robots[i].h>CHEIGHT) {
      robots[i].y = CHEIGHT-robots[i].h;
      robots[i].vy = 0;
      robots[i].airborne = false;
    }
    else {
      robots[i].airborne = true;
      robots[i].vy += GRAVITY;
    }

    if(robots[i].x < 0) {
      robots[i].x = 0;
      robots[i].vx = 0;
    }
    else if(robots[i].x + robots[i].w > CWIDTH) {
      robots[i].x = CWIDTH-robots[i].w;
      robots[i].vx = 0;
    }

    if(!robots[0].airborne) {
      if(up) {
        robots[0].vy -= JUMPSPEED;
      }
      if(right) {
        robots[0].vx += MOVESPEED;
        robots[0].heading = 1;
      }
      if(left) {
        robots[0].vx -= MOVESPEED;
        robots[0].heading = -1;
      }
    }

    if(robots[i].vx > 0) {
      if(robots[i].airborne) {
        robots[i].vx -= AIRRESISTANCE;
      }
      else {
        robots[i].vx -= FRICTION;
      }
      if(robots[i].vx < 0) {
        robots[i].vx = 0;
      }
      robots[i].vx = Math.min(robots[i].vx,MAXSPEED);
    }
    else if(robots[i].vx < 0) {
      if(robots[i].airborne) {
        robots[i].vx +=AIRRESISTANCE;
      }
      else {
        robots[i].vx += FRICTION;
      }
      if(robots[i].vx > 0) {
        robots[i].vx = 0;
      }
      robots[i].vx = Math.max(robots[i].vx,-MAXSPEED);
    }

    robots[i].x += robots[i].vx;
    robots[i].y += robots[i].vy;

    robots[i].draw();

    if(!shootTimer) {
      shootTimer = Date.now();
    }
    shootDelta = (new Date().getTime() - shootTimer)/1000;
    if(shoot) {
      if(shootDelta > SHOOTDELAY) {
        c = new circle(robots[i].x,robots[i].y,7*robots[i].heading,20,0,GRAVITY,10,"green");
        balls.push(c);
        shootTimer = Date.now();
      }
    }
  }
  for (var i = 0; i < balls.length; i++) {

    if(balls[i].x>goal.x && balls[i].x<goal.x+goal.w && balls[i].y>goal.y && balls[i].y<goal.y+goal.h) {
      score += 5;
      balls.splice(i,1);
      i--;
    }
    else {
      balls[i].vx += balls[i].ax;
      balls[i].vy += balls[i].ay;

      if(balls[i].y + balls[i].vy > CHEIGHT-balls[i].radius || balls[i].y + balls[i].vy < balls[i].radius) {
        if(balls[i].y + balls[i].vy > CHEIGHT-balls[i].radius)
        balls[i].y = CHEIGHT-balls[i].radius; //Adds 1 extra frame of being at the bottom, makes for smoother rolling.
        balls[i].vy *= -1*BOUNCE_CONSTANT;
      }
      if(balls[i].x + balls[i].vx > CWIDTH-balls[i].radius || balls[i].x + balls[i].vx < balls[i].radius) {
        balls[i].vx *= -1*BOUNCE_CONSTANT;
      }

      for(var j = i+1; j < balls.length; j++) {
        if(collision(balls[i], balls[j])) {
          var tevy = balls[i].vy
          var tevx = balls[i].vx;
          balls[i].vy = balls[j].vy - 0.2*balls[i].vy;
          balls[j].vy = tevy - 0.2*balls[j].vy;
          balls[i].vx = balls[j].vx - 0.2*balls[i].vx;
          balls[j].vx = tevx - 0.2*balls[j].vx;
        }
      }

      balls[i].x += balls[i].vx;
      balls[i].y += balls[i].vy;

      balls[i].draw();
    }
  }
  goal.draw();
  raf = window.requestAnimationFrame(animate);
}
$(document.body).keydown(function (evt) {
  var code = evt.keyCode;
  if (code === 87) { //w key
    up = true;
  }
  if (code === 83) { //s key
    down = true;
  }
  if (code === 68) { //d key
    right = true;
  }
  if (code === 65) { //a key
    left = true;
  }
  if (code === 69) { //e key
    shoot = true;
  }
});
$(document.body).keyup(function (evt) {
  var code = evt.keyCode
  if (code === 87) { //up key
    up = false;
  }
  if (code === 83) { //down key
    down = false;
  }
  if (code === 68) { //right key
    right = false;
  }
  if (code === 65) { //left key
    left = false;
  }
  if (code === 69) {
    shoot = false;
  }
});

$(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  CWIDTH = window.innerWidth - 10;
  CHEIGHT = window.innerHeight - 20;
  canvas.width = CWIDTH;
  canvas.height = CHEIGHT;
  robo = new rectangle(60,100,40,40,0,0,"blue");
  robots.push(robo);
  goal = new rectangle(600,400,100,20,0,0,"red");
  goal.draw();
  raf = window.requestAnimationFrame(animate);
});
