// TODO:
// - better collision detection (both for cakes and gorillas)
// - favicon
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
    var greatfire = $('#greatfire')[0];
    var background = $('#background')[0];
    // variables concerning chooper's head
    var hscale = h/3/chooper_head.height;
    var hw = chooper_head.width*hscale;
    var hh = chooper_head.height*hscale; // 180
    var hx, hy;
    var hr; // rotation of chooper's head in radians
    // define the hitbox for chooper's mouth
    var mouthx = 157/354*hw;
    var mouthy = 417/497*hh;
    var mouthw = (181-157)/354*hw;
    var mouthh = (429-417)/497*hh;

    var ar; // rotation of the fire in radians
    var aw = 133;
    var ah = 50;
    
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

    var leftPressed, rightPressed, upPressed, downPressed, spin, fire;
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

    function seek_and_destroy_fire_target() {
	/* finds and deletes the closest gorilla w/in fire's reach
	 * returns the position of this gorilla in radians
	 * If no gorilla is found within fire's reach, no gorillas are
	 * deleted, and the function returns 0
	 */
	var i = 0, r = 0;
	while(i < gorillas.length) {
	    var deltax = Math.abs(gorillas[i].x - mouthx);
	    var deltay = Math.abs(gorillas[i].y - mouthy);
	    var hyp = Math.sqrt(deltax*deltax + deltay*deltay);
	    if(hyp <= aw) {
		r = Math.atan(deltay / deltax);
		gorillas.splice(i, 1);
		break;
	    }
	    i++;
	}
	return r;
    }

    function init() {
	console.log("Mouth hitbox is " + mouthw + "x" + mouthh);
	hx = 10;
	hy = 10;
	hr = 0;

	ar = 0;

	cakes = [];
	cakes_eaten = 0;

	gorillas = [];

	score = 0;

	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	spin = false;
	fire = false;
	logToggle = false;

	gameStart = Date.now();
	if(typeof gameloop != undefined) clearInterval(gameloop);
	gameloop = setInterval(update, 60);
	paint();
    }

    function update() {
	// update chooper's head
	if(leftPressed) hx -= 10;
	if(rightPressed) hx += 10;
	if(upPressed) hy -= 10;
	if(downPressed) hy += 10;

	if(hx < 0) hx = 0;
	if(hx+hw >= w) hx = w-hw;
	if(hy < 0) hy = 0;
	if(hy+hh >= h) hy = h-hh;

	// spin
	if(spin) {
	    hr += 0.8;
	    score -= spin_cost;
	}
	else hr = 0;
	if(hr > 2*Math.PI) hr -= 2*Math.PI;

	// update cakes
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

	// update gorillas
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
	if(Date.now()-gameStart > gorilla_spawn_delay &&
		Math.random() < gorilla_spawn_rate) addGorilla();

	// fire (must be after gorillas)
	/*
	if(score >= max_score) {
	    if(fire) {
		ax += 
	    ar = seek_and_destroy_fire_target();
	}
	*/
	
	//paint (or lose)
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
	gorillas.forEach(function(v, i, a) {
	    ctx.drawImage(gorilla, v.x, v.y, gorilla_size, gorilla_size);
	});
	// draw chooper's arm
	/*
	if(score >= max_score) {
	    ctx.translate(ax+aw/2, ay+ah/2);
	    ctx.rotate(ar);
	    ctx.drawImage(greatfire, -aw/2, -ah/2, aw, ah);
	    ctx.rotate(-ar);
	    ctx.translate(-(ax+aw/2), -(ay+ah/2));
	}
	*/
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
	if(key == '16') fire = true;
    });

    $(document).keyup(function(e) {
	var key = e.which;
	if(key == '37' || key == '65') leftPressed = false;
	if(key == '38' || key == '87') upPressed = false;
	if(key == '39' || key == '68') rightPressed = false;
	if(key == '40' || key == '83') downPressed = false;
	if(key == '32') spin = false;
	if(key == '16') fire = false;
    });

    $(document).keypress(function(e) {
	var key = e.which;
	//console.log(key);
	if(key == '99') logToggle = !logToggle; // 'c' key
    });

    init();
});
