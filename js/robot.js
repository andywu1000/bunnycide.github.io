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
var GRAVITY = .5;
var RGRAVITY = 0.8;
var FRICTION = 0.7;
var AIRRESISTANCE = 0.1;
var MOVESPEED = 3;
var JUMPSPEED = 20;
var MAXSPEED = 15;
var SHOOTDELAY = 0.25;
var shootDelta;
var BOUNCE_CONSTANT = 0.5;
var goal1;
var goal2;
var bluescore = 0;
var redscore = 0;
var COLLISION_CONSTANT = 0.8;
var BALL_FRICTION = 0.01;
var RADIUS = 10;
var images = {};
var scoreDelta;

function rectangle(x,y,w,h,vx,vy,color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.vx = vx;
  this.vy = vy;
  this.color = color;
  this.airborne = false;
  this.over = false;
  this.heading = 1;
  this.ball = 3;
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  this.shoot = false;
  this.shootTimer = Date.now();
  this.previousr = false;
  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
}

function robot(x,y,w,h,vx,vy,color) {
  rectangle.apply(this, arguments);
  this.draw = function() {
    if(this.heading == 1){
      loadImage(this.color + "robot" + this.ball + "right", this.x - 50, this.y - 110, 150, 150);
      previousr = true;
    }
    else  {
      loadImage(this.color + "robot" + this.ball + "left", this.x - 50, this.y - 110, 150, 150);
    }
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
  this.scoreTimer = Date.now();
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

// function collisionl(circlea) {
//   if(circlea.x+circlea.radius>=goal.x&&circlea.x-circlea.radius<=goal.x+goal.w&&circlea.y+circlea.radius>=goal.y&&circlea.y-circlea.radius<=goal.y+goal.w/2) {
//     for(i = 0;i<goal.w/2;i++) {
//       if(circlea.y+circlea.radius>=goal.y+i && circlea.y-circlea.radius<=goal.y+i) {
//         if(circlea.x+circlea.radius>=goal.x+goal.w/2-i && circlea.x-circlea.radius<=goal.x +goal.w/2-i) {
//           return true;
//         }
//         else if(circlea.x+circlea.radius>=goal.x+goal.w/2+i && circlea.x-circlea.radius<=goal.x+goal.w/2+i) {
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// }

function collisionrr(recta, rectb) {
  return (recta.x>=rectb.x&&recta.x<=rectb.x+rectb.w||recta.x+recta.w>=rectb.x&&recta.x+recta.w<=rectb.x+rectb.w) && (recta.y>=rectb.y&&recta.y<=rectb.y+rectb.h||recta.y+recta.h>=rectb.y&&recta.y+recta.h<=rectb.y+rectb.h);
}

function angle(circlea, circleb) {
  //alert(circlea.x-circleb.x > 0 ? Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) : Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) + Math.PI);
  return circlea.x-circleb.x > 0 ? Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) : Math.atan2(circlea.y-circleb.y, circlea.x-circleb.x) + Math.PI;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function distance(circlea, circleb) {
  return Math.sqrt(Math.pow(circlea.x-circleb.x,2)+Math.pow(circlea.y-circleb.y,2));
}

function loadImage(name, x, y, sizex, sizey) {

  images[name] = new Image();
  images[name].onload = function() {
      ctx.drawImage(images[name], x, y, sizex, sizey);
  };
  images[name].src = "images/" + name + ".png";
}

function animate()
{
  loadImage("centervortex", CWIDTH/2 - 250, CHEIGHT - 500, 500,500);

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
  ctx.fillText("Blue: " + bluescore,CWIDTH/3,30);
  ctx.fillText("Red: " + redscore,CWIDTH - CWIDTH/3,30);

  // ctx.fillStyle = "gray";
  // ctx.beginPath();
  // ctx.moveTo(goal.x+goal.w/2,goal.y+1);
  // ctx.lineTo(goal.x,goal.y+goal.w/2);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(goal.x+goal.w/2,goal.y+1);
  // ctx.lineTo(goal.x+goal.w,goal.y+goal.w/2);
  // ctx.stroke();

  goal1.draw();
  goal2.draw();

  for (var i = 0; i < robots.length; i++)
  {
    if(robots[i].y+robots[i].h>CHEIGHT) {
      robots[i].y = CHEIGHT-robots[i].h;
      robots[i].vy = 0;
      robots[i].airborne = false;
    }
    else {
      robots[i].airborne = true;
      robots[i].vy += RGRAVITY;
    }
    //change
      if(Math.abs(robots[0].x - robots[1].x) < robots[0].w){
        robots[0].over = true;
      }
      else{
        robots[0].over = false;
      }
      if(Math.abs(robots[1].x - robots[0].x) < robots[1].w){
        robots[1].over = true;
      }
      else{
        robots[1].over = false;
      }

      if(robots[0].over && robots[0].y + robots[0].h === robots[1].y-1){
        robots[0].airborne = false;
      }
      if(robots[1].over && robots[1].y + robots[1].h === robots[0].y-1){
        robots[1].airborne = false;
      }
      //checks if robot on top of other robot
      //change
    if(robots[i].x < 0) {
      robots[i].x = 0;
      robots[i].vx = 0;
    }
    else if(robots[i].x + robots[i].w > CWIDTH) {
      robots[i].x = CWIDTH-robots[i].w;
      robots[i].vx = 0;
    }



    if(!robots[i].airborne) {
      if(robots[i].up) {
        robots[i].vy -= JUMPSPEED;
      }
      if(robots[i].right) {
        robots[i].vx += MOVESPEED;
        robots[i].heading = 1;
      }
      if(robots[i].left) {
        robots[i].vx -= MOVESPEED;
        robots[i].heading = -1;
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

    if(!robots[i].shootTimer) {
      robots[i].shootTimer = Date.now();
    }
    shootDelta = (new Date().getTime() - robots[i].shootTimer)/1000;
    if(robots[i].shoot && robots[i].ball > 0) {
      if(shootDelta > SHOOTDELAY) {
        if(robots[i].heading == 1) {
          c = new circle(robots[i].x+robots[i].w+10.1,robots[i].y-10.1,getRandom(4,6),-getRandom(20,26),0,GRAVITY,10,robots[i].color);
        }
        else {
          c = new circle(robots[i].x-10.1,robots[i].y-10.1,-getRandom(4,6),-getRandom(20,26),0,GRAVITY,10,robots[i].color);
        }
        balls.push(c);
        robots[i].ball--;
        robots[i].shootTimer = Date.now();
      }
    }
  }
  for (var i = 0; i < balls.length; i++) {

    if(collisionr(balls[i],robots[0]) && balls[i].color===robots[0].color) {
      robots[0].ball++;
      balls.splice(i,1);
      i--;
    }
    else if(collisionr(balls[i],robots[1]) && balls[i].color===robots[1].color) {
      robots[1].ball++;
      balls.splice(i,1);
      i--;
    }
    else {
      scoreDelta = (new Date().getTime() - balls[i].scoreTimer)/1000;
      if(collisionr(balls[i],goal1) && scoreDelta > 1) {
        redscore += 5;
        balls[i].scoreTimer = Date.now();
      }
      else if(collisionr(balls[i],goal2) && scoreDelta > 1) {
        bluescore += 5;
        balls[i].scoreTimer = Date.now();
      }
      // if(balls[i].x<goal.x+goal.w/2&&collisionl(balls[i])) {
      //   balls[i].vx = -balls[i].vy*BOUNCE_CONSTANT;
      //   balls[i].vy = balls[i].vx*BOUNCE_CONSTANT*0.8;
      // }
      // else if(collisionl(balls[i])){
      //   balls[i].vx = balls[i].vy*BOUNCE_CONSTANT;
      //   balls[i].vy = -balls[i].vx*BOUNCEeada_CONSTANT*0.8;
      // }

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
          balls[i].vy = balls[j].vy*COLLISION_CONSTANT;
          balls[j].vy = tevy*COLLISION_CONSTANT;
          balls[i].vx = balls[j].vx*COLLISION_CONSTANT;
          balls[j].vx = tevx*COLLISION_CONSTANT;
        }
      }
      balls[i].x += balls[i].vx;
      balls[i].y += balls[i].vy;
      for(var j = i+1; j < balls.length; j++) {
        if(collision(balls[i], balls[j])) {
          //balls[i].x = 2*RADIUS*Math.cos(angle(balls[i],balls[j]))+balls[j].x;
          //balls[i].y = 2*RADIUS*Math.sin(angle(balls[i],balls[j]))+balls[j].y;
          if(balls[i].x > balls[j].x) {
            balls[i].vx += 5;
            balls[j].vx -= 5;
          }
          else {
            balls[i].vx -= 5;
            balls[j].vx += 5;
          }
        }
      }
      balls[i].draw();
    }
  }
  raf = window.requestAnimationFrame(animate);
}
$(document.body).keydown(function (evt) {
  var code = evt.keyCode;
  if (code === 87) { //w key
    robots[0].up = true;
  }
  if (code === 83) { //s key
    robots[0].down = true;
  }
  if (code === 68) { //d key
    robots[0].right = true;
  }
  if (code === 65) { //a key
    robots[0].left = true;
  }
  if (code === 69) { //e key
    robots[0].shoot = true;
  }

  if (code === 73) { //i key
    robots[1].up = true;
  }
  if (code === 75) { //k key
    robots[1].down = true;
  }
  if (code === 76) { //l key
    robots[1].right = true;
  }
  if (code === 74) { //j key
    robots[1].left = true;
  }
  if (code === 79) { //o key
    robots[1].shoot = true;
  }
});
$(document.body).keyup(function (evt) {
  var code = evt.keyCode
  if (code === 87) { //up key
    robots[0].up = false;
  }
  if (code === 83) { //down key
    robots[0].down = false;
  }
  if (code === 68) { //right key
    robots[0].right = false;
  }
  if (code === 65) { //left key
    robots[0].left = false;
  }
  if (code === 69) {
    robots[0].shoot = false;
  }

  if (code === 73) { //i key
    robots[1].up = false;
  }
  if (code === 75) { //k key
    robots[1].down = false;
  }
  if (code === 76) { //l key
    robots[1].right = false;
  }
  if (code === 74) { //j key
    robots[1].left = false;
  }
  if (code === 79) { //o key
    robots[1].shoot = false;
  }
});

$(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  CWIDTH = window.innerWidth - 10;
  CHEIGHT = window.innerHeight - 20;
  canvas.width = CWIDTH;
  canvas.height = CHEIGHT;
  goal1 = new rectangle(CWIDTH/2 + 60,CHEIGHT - 375,190,10,0,0,"red");
  goal2 = new rectangle(CWIDTH/2 - 250 ,CHEIGHT - 375,190,10,0,0, "blue");
  goal1.draw();
  goal2.draw();
  robo = new robot(60,60,40,40,0,0,"blue");
  robo2 = new robot(CWIDTH-100,60,40,40,0,0,"red");
  robots.push(robo);
  robots.push(robo2);
  a = new circle(CWIDTH-60,60,0,0,0,GRAVITY,10,"blue");
  b = new circle(CWIDTH-100,60,0,0,0,GRAVITY,10,"blue");
  c = new circle(60,60,0,0,0,GRAVITY,10,"red");
  d = new circle(100,60,0,0,0,GRAVITY,10,"red");
  balls.push(a);
  balls.push(b);
  balls.push(c);
  balls.push(d);
  raf = window.requestAnimationFrame(animate);
});
