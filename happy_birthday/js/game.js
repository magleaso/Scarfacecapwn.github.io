// TODO:
// - better collision detection (both for cakes and gorillas)
//
$(document).ready(function() {
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    var gameStart; // timestamp of start of game
    var gameloop; // the gameloop

    var music = $('#music')[0];
    var chooper_head = $('#chooper_head')[0];
    var cake = $('#cake')[0];
    var gorilla = $('#gorilla')[0];
    var greatArm = $('#greatArm')[0];
    var background = $('#background')[0];
    // variables concerning chooper's head
    var hscale = h/3/chooper_head.height;
    var hw = chooper_head.width*hscale;
    var hh = chooper_head.height*hscale; // 180
    var hx, hy;
    var hr; // rotation of chooper's head in radians
    // define the hitbox for chooper's mouth
    var mouthx = 77/254*hw;
    var mouthy = 297/397*hh;
    var mouthw = (163-77)/254*hw;
    var mouthh = (343-297)/397*hh;
    
    var armx = 77/254*hw;
    var army = 297/397*hh;
    var armw = (163-77)/254*hw*5;
    var armh = (343-297)/397*hh;

    // mmm cakez
    var cakes;
    var cake_size = h/10;
    var cakes_eaten;
    var cake_spawn_rate = 0.05; // 5% chance to spawn a cake each update loop

    var gorillas;
    var gorilla_size = h/5;
    var gorilla_spawn_rate = 0.01;
    // delay in ms; gives player a chance to eat cakes (i.e. not die immediately)
    var gorilla_spawn_delay = 5000;

    var score;
    var max_score = 500;
    var cake_bonus = 15;
    var spin_cost = 1;
    var damage_cost = 25;

    var leftPressed, rightPressed, upPressed, downPressed, spin, arm;
    var logToggle;

    function addCake() {
	var y = Math.random() * (h-50-mouthy) + mouthy;
	//console.log('Adding cake at (' + (w+70) + ', ' + y + ')');
	cakes.push({x: w+70, y: y});
    }

    function addGorilla() {
	// even chance of spawning above or below the canvas. Ditto for left/right.
	var r = Math.random() * 2 * Math.PI;
	var x, y;
	if(-(h/w) <= Math.tan(r) && Math.tan(r) <= h/w) {
	    // adj side is const w/ len w/2
	    var hyp = w / 2 / Math.cos(r);
	} else {
	    // opp side is const w/ len h/2
	    var hyp = h / 2 / Math.sin(r);
	}
	if(hyp < 0) hyp *= -1;
	hyp += 30; // make sure gorilla spawns off-screen
	x = (w/2) + hyp * Math.cos(r);
	y = (h/2) + hyp * Math.sin(r);
	//if(logToggle) console.log("r: " + r + ", hyp: " + hyp + ", x: " + x + ", y: " + y);
	gorillas.push({x: x, y: y});
    }

    function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
	return  b = !(x2+w2 < x1 ||
	    	      x1+w1 < x2 ||
		      y2+h2 < y1 ||
		      y1+h1 < y2);
    }

    function getRay(p1, p2, len) {
	/* returns the endpoint of the ray that extends from p1 with length len and would
	 * intersect p2 if of unlimited length
	 */
	if(p1.x == p2.x && p1.y == p2.y) return p1;
	var deltax = p2.x - p1.x;
	var deltay = p2.y - p1.y;
	var hyp = Math.sqrt(deltax*deltax + deltay*deltay);
	var x = p1.x + len*deltax/hyp;
	var y = p1.y + len*deltay/hyp;
	return {x: x, y: y};
    }

    function init() {
	console.log("Mouth hitbox is " + mouthw + "x" + mouthh);
	hx = 10;
	hy = 10;
	hr = 0;

	cakes = [];
	cakes_eaten = 0;

	gorillas = [];

	score = 0;

	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	spin = false;
	arm = false;
	logToggle = false;

	gameStart = Date.now();
	if(typeof gameloop != undefined) clearInterval(gameloop);
	gameloop = setInterval(update, 60);
	paint();
    }

    function update() {
	if(leftPressed) hx -= 10;
	if(rightPressed) hx += 10;
	if(upPressed) hy -= 10;
	if(downPressed) hy += 10;
	if(!spacePressed) army = -50;
	if(spacePressed) army = 297/397*hh;

	if(hx < 0) hx = 0;
	if(hx+hw >= w) hx = w-hw;
	if(hy < 0) hy = 0;
	if(hy+hh >= h) hy = h-hh;

	if(spin) {
	    hr += 0.8;
	    score -= spin_cost;
	}
	else hr = 0;
	if(hr > 2*Math.PI) hr -= 2*Math.PI;

	var i = 0;
	while(i < cakes.length) {
	    if(intersect(cakes[i].x,cakes[i].y, cake_size, cake_size, mouthx+hx, mouthy+hy, mouthw,mouthh)) {
		cakes_eaten++;
		score += cake_bonus;
		cakes.splice(i, 1);
		//console.log("cake was eat! " + cakes_eaten);
	    } else if(cakes[i].x < -70) {
		cakes.splice(i, 1);
	    } else {
		cakes[i].x -= 10;
	    }
	    i++;
	}
	if(Math.random() < cake_spawn_rate) addCake();

	i = 0;
	while(i < gorillas.length) {
	    if(intersect(gorillas[i].x, gorillas[i].y, gorilla_size, gorilla_size, hx, hy, hw, hh)) {
		if(spin) gorillas.splice(i, 1);
		else score -= damage_cost;
	    } else {
		gorillas[i] = getRay(gorillas[i], {x: hx, y: hy}, 5);
	    }
	    i++;
	}
	var d = Date.now() - gameStart;
	if(logToggle) console.log(d);
	if(d > gorilla_spawn_delay &&
		Math.random() < gorilla_spawn_rate) addGorilla();

	paint();
	if(score < 0) lose();
    }

    function paint() {
	//ctx.clearRect(0, 0, w, h);
	ctx.drawImage(background, 0, 0, w, h);

	// draw chooper
	ctx.translate(hx+hw/2, hy+hh/2);
	ctx.rotate(hr);
	ctx.drawImage(chooper_head, -hw/2, -hh/2, hw, hh);
	ctx.rotate(-hr);
	ctx.translate(-(hx+hw/2), -(hy+hh/2));
	// draw cakes
	cakes.forEach(function(v, i, a) {
	    ctx.drawImage(cake, v.x, v.y, cake_size, cake_size);
	});
	// draw gorillas
	//ctx.drawImage(gorilla, 100, 100, gorilla_size, gorilla_size);
	gorillas.forEach(function(v, i, a) {
	    ctx.drawImage(gorilla, v.x, v.y, gorilla_size, gorilla_size);
	});

	if(spacePressed) ctx.drawImage(greatArm, 77/254*hw + hx + 20, 297/397*hh + hy, armw, armh);

	// draw score
	ctx.font = "40px Comic Sans MS";
	ctx.fillStyle = "white";
	ctx.fillText(score, 10, 30);
	// draw power bar
	if(score >= max_score) ctx.fillStyle = "red";
	else ctx.fillStyle = "yellow";
	ctx.fillRect(0, h-25, score*w/max_score, 25);
	// draw power bar label
	ctx.fillStyle = "blue";
	ctx.font = "20px Comic Sans MS";
	ctx.fillText("M E M E  P O W E R", w/2-80, h-4);

    }
    
    function lose() {
	music.muted = "1";
	clearInterval(gameloop);
	ctx.font = "75px Comics Sans MS";
	ctx.fillStyle = "red";
	ctx.fillText("You Lose", w/2-150, h/2);
	ctx.font = "45px Comic Sans MS";
	ctx.fillText("Refresh to play again", w/2-180, h/2+50);
    }

    $(document).keydown(function(e) {
	var key = e.which;
	if(key == '37' || key == '65') leftPressed = true;
	if(key == '38' || key == '87') upPressed = true;
	if(key == '39' || key == '68') rightPressed = true;
	if(key == '40' || key == '83') downPressed = true;
	if(key == '32') spin = true;
    });

    $(document).keyup(function(e) {
	var key = e.which;
	if(key == '37' || key == '65') leftPressed = false;
	if(key == '38' || key == '87') upPressed = false;
	if(key == '39' || key == '68') rightPressed = false;
	if(key == '40' || key == '83') downPressed = false;
	if(key == '32') spin = false;
    });

    $(document).keypress(function(e) {
	var key = e.which;
	//console.log(key);
	if(key == '99') logToggle = !logToggle; // 'c' key
    });

    init();
    /*
    intersect(0, 0, 100, 100, 10, 10, 200, 50); // yes
    intersect(0, 0, 50, 50, 51, 51, 3, 3); // no
    intersect(0, 0, 10, 10, 9, 9, 10, 10); // yes
    intersect(100, 100, 50, 50, 50, 100, 25, 25); // no
    intersect(0, 20, 50, 10, 20, 0, 10, 50); // yes
    intersect(0, 0, 100, 100, 25, 25, 75, 75); // yes
    intersect(0, 0, 10, 10, 10, 0, 10, 10); // ??
    */
});
