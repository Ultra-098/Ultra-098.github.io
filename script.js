var gameCanon;
var balls = [];
var enemyObjects = [];
var frame = 0;
var spacePressed = false;
var running = false;
var hits = 0;

var gravity = 0.05
var maxFrame = 100;
var enemySpeed = 5;

function initGame() {
    gameArea.init();
    gameCanon = new component(60, 10, "black", 10, gameArea.canvas.height / 2);
    gameCanon.update();
    printHits();
}

function printHits() {
    ctx = gameArea.context;
    ctx.font = "20px Arial";
    ctx.fillText("Hits: " + hits, 10, 20);
}

function startPause() {
    running = !running;
    button = document.getElementById("startPause");
    if (running) {
        button.innerHTML = "PAUSE";
        button.className = "btn header-button btn btn-warning";
    } else {
        button.innerHTML = "START";
        button.className = "btn header-button btn btn-success";
    }
    button.blur();
}

function reset() {
    gameArea.clear();
    balls = [];
    enemyObjects = [];
    frame = 0;
    gameCanon.update();
    hits = 0;
    printHits();
    running = false;
    button = document.getElementById("startPause");
    button.innerHTML = "START";
    button.className = "btn header-button btn btn-success";
}

var gameArea = {
    canvas : document.getElementById("game-canvas"),
    init : function() {
        //this.canvas.width = 480;
        //this.canvas.height = 270;
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.key] = (e.type === "keydown");
        })
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.key] = false;
        })
        window.addEventListener("resize", resize, false);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function resize() {
    gameArea.canvas.width = gameArea.canvas.parentElement.offsetWidth;
    gameArea.canvas.height = gameArea.canvas.parentElement.offsetHeight;
    gameCanon = new component(60, 10, "black", 10, gameArea.canvas.height / 2);
    reset();
    document.getElementById("viewport").innerHTML = document.documentElement.clientWidth + "<br>" + document.documentElement.clientHeight; // TODO
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angleSpeed = 0;
    this.update = function() {
        this.angle = this.angle + this.angleSpeed;
        ctx = gameArea.context;
        
        // Matrix transformation
        ctx.translate(15, gameArea.canvas.height/2 + 5);
        ctx.rotate(Math.PI * this.angle / 180);
        ctx.translate(-15, gameArea.canvas.height/(-2) - 5);
        
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Matrix transformation back
        ctx.translate(15, gameArea.canvas.height/2 + 5);
        ctx.rotate(Math.PI * this.angle * (-1) / 180);
        ctx.translate(-15, gameArea.canvas.height/(-2) - 5);
    }   
}

function circle(r, color, x, y, update) {
    this.r = r;
    this.x = x;
    this.y = y;
    this.angle = gameCanon.angle;
    this.acceleration = 0;
    this.update = function () {
        this.y += 10*Math.sin(this.angle*Math.PI/180);
        this.x += 10*Math.cos(this.angle*Math.PI/180);

        this.acceleration += gravity;
        this.y += this.acceleration;
        
        ctx = gameArea.context;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function enemyCircle(color) {
    this.r = randomInt(4,8);
    this.x = gameArea.canvas.width + 16;
    this.y = randomInt(gameArea.canvas.height * 0.5, gameArea.canvas.height);
    this.angle = randomInt(0,45);
    this.acceleration = 0;
    this.update = function() {
        this.y -= enemySpeed *Math.sin(this.angle*Math.PI/180);
        this.x -= enemySpeed *Math.cos(this.angle*Math.PI/180);
        
        this.acceleration += 0.02;
        this.y += this.acceleration;
        
        ctx = gameArea.context;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function checkCollision(x1, y1, r1, x2, y2, r2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) < (r1 + r2);
}

function deleteCollisions() {
    for (i = 0; i < balls.length; i += 1) {
        for (j = 0; j < enemyObjects.length; j += 1) {
            if (typeof balls[i] !== 'undefined' && typeof enemyObjects[j] !== 'undefined' && checkCollision(balls[i].x, balls[i].y, balls[i].r, enemyObjects[j].x, enemyObjects[j].y, enemyObjects[j].r)) {
                balls.splice(i, 1);
                enemyObjects.splice(j, 1);
            }
        }
    }
}

function updateGameArea() {
    if (running) {
        gameArea.clear();
        for (i = 0; i < balls.length; i += 1) {
            balls[i].update();
            if (balls[i].x > gameArea.canvas.width || balls[i].y > gameArea.canvas.height) {
                balls.splice(i, 1);
            }
        
        }
        frame++;
        if(frame >= maxFrame) {
            enemyObjects.push(new enemyCircle("red"));
            frame = 0;
        }
        for (i = 0; i < enemyObjects.length; i += 1) {
            enemyObjects[i].update();
            if (enemyObjects[i].x <= 0 || enemyObjects[i].y <= 0 || enemyObjects[i].y >= gameArea.canvas.height) {
                if (enemyObjects[i].y > 0 && enemyObjects[i].y < gameArea.canvas.height) {
                    hits++;
                }
                enemyObjects.splice(i, 1);
            }
        }
        if (gameArea.keys && gameArea.keys['ArrowUp']) {
            gameCanon.angle -= 2;
        }
        if (gameArea.keys && gameArea.keys['ArrowDown']) {
            gameCanon.angle += 2;
        }
        if (gameArea.keys && gameArea.keys[' ']) {
            if (!spacePressed) {
                shoot();
            }
            spacePressed = true;
        } else {
            spacePressed = false;
        }
        gameCanon.update();
        deleteCollisions();
        printHits();
    }
}

function shoot() {
    balls.push(new circle(4, "blue", 15, gameArea.canvas.height / 2 + 5));
}

function moveup() {
    gameCanon.angleSpeed = -2;
}

function movedown() {
    gameCanon.angleSpeed = 2;
}

function clearmove() {
    gameCanon.angleSpeed = 0;
}

function openNav() {
    document.getElementById("sidenav").style.width = "50%";
}

function closeNav() {
    document.getElementById("sidenav").style.width = "0";
}

gravitySlider.oninput = function () {
    document.getElementById("gravityLabel").innerHTML = "Gravity: " + this.value;
    gravity = parseFloat(this.value);
    document.getElementById("gravitySlider").blur();
}

difficultySlider.oninput = function () {
    document.getElementById("difficultyLabel").innerHTML = "Difficulty: " + this.value;
    document.getElementById("difficultySlider").blur();
    maxFrame = (6 - this.value) * 50;
}