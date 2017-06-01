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
var MOVESPEED = 3;
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
var COLLISION_CONSTANT = 0.8;
var BALL_FRICTION = 0.01;
var RADIUS = 10;

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
  this.ball = 3;
  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
}

function circle(x, y, vx, vy, ax, ay, radius, color) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ax = ax;
  this.ay = ay;
  this.radius = radius;
  this.color = color;
  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function collision(circlea, circleb) {
  return Math.abs(circlea.x-circleb.x) <= circlea.radius + circleb.radius && Math.abs(circlea.y - circleb.y) <= circlea.radius + circleb.radius;
}

function collisionr(circlea, rectb) {
  return circlea.x-circlea.radius<=rectb.x+rectb.w&&circlea.x+circlea.radius>=rectb.x && circlea.y-circlea.radius<=rectb.y+rectb.h&&circlea.y+circlea.radius>=rectb.y;
}

function angle(circlea, circleb) {
  //alert(circlea.x-circleb.x > 0 ? Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) : Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) + Math.PI);
  return circlea.x-circleb.x > 0 ? Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) : Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) + Math.PI;
}

function distance(circlea, circleb) {
  return Math.sqrt(Math.pow(circlea.x-circleb.x,2)+Math.pow(circlea.y-circleb.y,2));
}

function animate()
{
  ctx.fillStyle = "black";
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

  goal.draw();

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
    if(shoot && robots[i].ball > 0) {
      if(shootDelta > SHOOTDELAY) {
        if(robots[i].heading == 1) {
          c = new circle(robots[i].x+robots[i].w+10.1,robots[i].y-10.1,7,-20,0,GRAVITY,10,"green");
        }
        else {
          c = new circle(robots[i].x-10.1,robots[i].y-10.1,-7,-20,0,GRAVITY,10,"green");
        }
        balls.push(c);
        robots[i].ball--;
        shootTimer = Date.now();
      }
    }
  }
  for (var i = 0; i < balls.length; i++) {

    if(collisionr(balls[i],robots[0])) {
      robots[0].ball++;
      balls.splice(i,1);
      i--;
    }
    else {
      if(collisionr(balls[i],goal)) {
        score += 5;
        if(balls[i].x<goal.x+goal.w/2) {
          balls[i].vx = -balls[i].vy;
          balls[i].vy = -balls[i].vx;
        }
        else {
          balls[i].vx = balls[i].vy;
          balls[i].vy = balls[i].vx;
        }
        //balls.splice(i,1);
        //i--;
      }
      if(balls[i].vx > 0) {
        balls[i].vx -= BALL_FRICTION;
        if(balls[i].vx < 0) {
          balls[i].vx = 0;
        }
      }
      else if(balls[i].vx < 0) {
        balls[i].vx += BALL_FRICTION;
        if(balls[i].vx > 0) {
          balls[i].vx = 0;
        }
      }
      balls[i].vy += GRAVITY;

      if(balls[i].y + balls[i].vy > CHEIGHT-balls[i].radius) {
        balls[i].y = CHEIGHT-balls[i].radius;
        balls[i].vy *= -1*BOUNCE_CONSTANT;
      }
      if(balls[i].x + balls[i].vx > CWIDTH-balls[i].radius || balls[i].x + balls[i].vx < balls[i].radius) {
        balls[i].vx *= -1*BOUNCE_CONSTANT;
      }
      for(var j = i+1; j < balls.length; j++) {
        if(collision(balls[i], balls[j])) {
          var tevy = balls[i].vy
          var tevx = balls[i].vx;
          /*balls[i].vy = balls[j].vy - 0.2*balls[i].vy;
          balls[j].vy = tevy - 0.2*balls[j].vy;
          balls[i].vx = balls[j].vx - 0.2*balls[i].vx;
          balls[j].vx = tevx - 0.2*balls[j].vx;*/
          balls[i].vy = balls[j].vy*COLLISION_CONSTANT;
          balls[j].vy = tevy*COLLISION_CONSTANT;
          balls[i].vx = balls[j].vx*COLLISION_CONSTANT;
          balls[j].vx = tevx*COLLISION_CONSTANT;
        }
      }
      balls[i].x += balls[i].vx;
      balls[i].y += balls[i].vy;
      /*for(var j = i+1; j < balls.length; j++) {
        if(collision(balls[i], balls[j])) {
          balls[i].x = 2*RADIUS*Math.cos(angle(balls[i],balls[j]))+balls[j].x;
          balls[i].y = 2*RADIUS*Math.sin(angle(balls[i],balls[j]))+balls[j].y;

        }
      }*/

      balls[i].draw();
    }
  }
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
  goal = new rectangle(600,350,100,10,0,0,"red");
  goal.draw();
  robo = new rectangle(60,60,40,40,0,0,"blue");
  robots.push(robo);
  b = new circle(CWIDTH-60,60,0,0,0,GRAVITY,10,"green");
  c = new circle(CWIDTH-100,60,0,0,0,GRAVITY,10,"green");
  balls.push(b);
  balls.push(c);
  raf = window.requestAnimationFrame(animate);
});
