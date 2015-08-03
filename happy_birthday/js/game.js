// TODO:
// - add scrolling backgroud (space?)
// - add music
// - give chooper birthday hat
//
$(document).ready(function() {
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    var chooper_head = $('#chooper_head')[0];
    var cake = $('#cake')[0];
    var greatArm = $('#greatArm')[0];
    // variables concerning chooper's head
    var hscale = 180/chooper_head.height;
    var hw = chooper_head.width*hscale;
    var hh = chooper_head.height*hscale; // 180
    var hx, hy;
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
    var cakes_eaten;
    var cake_spawn_rate = 0.05; // 25% chance to spawn a cake each update loop

    var score;

    var leftPressed, rightPressed, upPressed, downPressed, spacePressed;

    function addCake() {
	var y = Math.random() * (h-50-mouthy) + mouthy;
	//console.log('Adding cake at (' + (w+70) + ', ' + y + ')');
	cakes.push({x: w+70, y: y});
    }

    function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
	return  b = !(x2+w2 < x1 ||
	    	      x1+w1 < x2 ||
		      y2+h2 < y1 ||
		      y1+h1 < y2);
    }

    function init() {
	console.log("Mouth hitbox is " + mouthw + "x" + mouthh);
	hx = 10;
	hy = 10;

	cakes = [];
	cakes_eaten = 0;

	score = 0;

	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	spacePressed = false;

	if(typeof gameloop != undefined) clearInterval(gameloop);
	var gameloop = setInterval(update, 60);
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

	var i = 0;
	while(i < cakes.length) {
	    cakes[i].x -= 10;
	    if(intersect(cakes[i].x,cakes[i].y, 50, 50, mouthx+hx, mouthy+hy, mouthw,mouthh) || (intersect(cakes[i].x,cakes[i].y, 50, 50, mouthx+hx, mouthy+hy, mouthw*5,mouthh) && (spacePressed == true))) {
		cakes_eaten++;
		score += 10;
		cakes.splice(i, 1);
		//console.log("cake was eat! " + cakes_eaten);
	    } else if(cakes[i].x < -70) {
		cakes.splice(i, 1);
	    }
	    i++;
	}
	if(Math.random() < cake_spawn_rate) addCake();
	paint();
    }

    function paint() {
	ctx.clearRect(0, 0, w, h);

	// draw chooper
	ctx.drawImage(chooper_head, hx, hy, hw, hh);
	// draw cakes
	cakes.forEach(function(v, i, a) {
	    ctx.drawImage(cake, v.x, v.y, 50, 50);
	});

	if(spacePressed) ctx.drawImage(greatArm, 77/254*hw + hx + 20, 297/397*hh + hy, armw, armh);

	// draw score
	ctx.font = "20px Comic Sans";
	ctx.fillText("Score: " + score, 10, 20);

    }

    $(document).keydown(function(e) {
	var key = e.which;
	// left, up , right , down
	if(key == '37') leftPressed = true;
	if(key == '38') upPressed = true;
	if(key == '39') rightPressed = true;
	if(key == '40') downPressed = true;
	if(key == '32') spacePressed = true;
    });

    $(document).keyup(function(e) {
	var key = e.which;
	// left, up , right , down
	if(key == '37') leftPressed = false;
	if(key == '38') upPressed = false;
	if(key == '39') rightPressed = false;
	if(key == '40') downPressed = false;
	if(key == '32') spacePressed = false;
    });

    $(document).keypress(function(e) {
	var key = e.which;
	//console.log(key);
	//if(key == '99') addCake(); // 'c' key
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
