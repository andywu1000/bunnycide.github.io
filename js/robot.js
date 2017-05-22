var CWIDTH;
var CHEIGHT;
var ctx;
var canvas;
var robots = [];
var raf;
var lastCalledTime;
var fps;
var delta;
var GRAVITY = 0.5;
var FRICTION = 0.4;
var AIRRESISTANCE = 0.1;
var MOVESPEED = 5;
var JUMPSPEED = 20;
var MAXSPEED = 10;
var up = false;
var down = false;
var right = false;
var left = false;

function rectangle(x,y,w,h,vx,vy,color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vx = vx;
  this.vy = vy;
  this.color = color;
  this.airborne = false;
  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
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


    /*window.onkeydown = function (e) {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code === 38) { //up key
        if(!robots[0].airborne) {
          robots[0].vy-=JUMPSPEED;
        }
      } if (code === 40) { //down key
        //robots[0].vy+=3;
      } if (code === 39) { //right key
        if(!robots[0].airborne) {
          robots[0].vx+=MOVESPEED;
        }
      } if (code === 37) { //left key
        if(!robots[0].airborne) {
          robots[0].vx-=MOVESPEED;
        }
      }
    };*/

    if(!robots[0].airborne) {
      if(up) {
        robots[0].vy -= JUMPSPEED;
      }
      if(right) {
        robots[0].vx += MOVESPEED;
      }
      if(left) {
        robots[0].vx -= MOVESPEED;
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
  }

  raf = window.requestAnimationFrame(animate);
}
$(document.body).keydown(function (evt) {
  var code = evt.keyCode;
  if (code === 38) { //up key
    up = true;
  }
  if (code === 40) { //down key
    down = true;
  }
  if (code === 39) { //right key
    right = true;
  }
  if (code === 37) { //left key
    left = true;
  }
});
$(document.body).keyup(function (evt) {
  var code = evt.keyCode
  if (code === 38) { //up key
    up = false;
  }
  if (code === 40) { //down key
    down = false;
  }
  if (code === 39) { //right key
    right = false;
  }
  if (code === 37) { //left key
    left = false;
  }
});

$(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  CWIDTH = window.innerWidth - 10;
  CHEIGHT = window.innerHeight - 20;
  canvas.width = CWIDTH;
  canvas.height = CHEIGHT;
  robo = new rectangle(60,60,40,40,0,0,"blue");
  robots.push(robo);

  raf = window.requestAnimationFrame(animate);
});
