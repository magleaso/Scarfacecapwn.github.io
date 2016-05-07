/** TODO:
 *    - keep local high score
 *    - moar pics
 *    - timer object?
 *    - make buttons clickable (for mobile)
 */
$(document).ready(function() {
    /** the directory path containing images of ladiez */
    var LADIEZ_IMAGE_DIR = '../static/images/ladiez';
    /** the directory path containing image of chooper */
    var CHOOPER_IMAGE_DIR = '../static/images/chooper';
    /** number of ms before player loses.
     *  This is just the initial value, it decreases as the game goes on
     */
    var INITIAL_DURATION = 5000; 
    /** minimum number of ms before player can lose */
    var MINIMUM_DURATION = 300;
    /** current number of seconds before player loses */
    var currentDuration = INITIAL_DURATION;
    /** determines how quickly currentDuration decreases */
    var difficulty = 0.9;
    /** the value of Date.now() when the timer was reset, used for calculating deltas */
    var startTime;
    /** holds the id of the interval that calls updateTimer() */
    var timer; 
    /** is the timer paused */
    var timerPaused;
	
    /* chooper and ladiez images are numbered from 0 to nChooperImages-1 and nLadiezImages-1
     * respectively
     */

    /** the number of images of ladiez */
    var nLadiezImages = 20;
    /** the number of images of chooper */
    var nChooperImages = 23;
    /** store past values for images to avoid repeats */
    var nlast;
    /** the player's score */
    var score;
    /** The class of the currently visible game image */
    var gameImageClass;
    /** If the game is in the "game over" state */
    var gameOver;

    /** initializes the game (i.e. the game has not been played
     *  yet)
     */
    function init() {
	score = 0;
	$('.score').text(score);
	gameOver = false;
	insertRandomGameImage();
	insertDefaultButtons();

	resetTimer(INITIAL_DURATION);
	timer = setInterval(updateTimer, 10);
    }

    /** resets the game (i.e. the game has already been played
     *  and lost at least once)
     */
    function reset() {
	score = 0;
	$('.score').text(score);
	gameOver = false;
	$('.loserOverlay').css('visibility', 'hidden');
	clearImages();
	insertRandomGameImage();
	insertDefaultButtons();

	resetTimer(INITIAL_DURATION);
	timer = setInterval(updateTimer, 10);
    }

    /** updates the timer display */
    function updateTimer() {
	if(timerPaused) {
	    console.log('timer paused');
	    return;
	}

	// get the elapsed time
	var millisElapsed = Date.now() - startTime;

	if(currentDuration - millisElapsed <= 0) {
	    // avoid the timer displaying negative values
	    $('.timer').text('0.00');
	    lose();
	} else {
	    var roundedElapsedTime = Math.round((currentDuration-millisElapsed)/10)/100;
	    $('.timer').text(roundedElapsedTime);
	}
    }

    /** reset the timer to <duration> milliseconds */
    function resetTimer(duration) {
	if(duration >= MINIMUM_DURATION)
	    currentDuration = duration;
	else
	    currentDuration = MINIMUM_DURATION;
	console.log('set duration to ' + currentDuration);
	startTime = Date.now();
    }

    /** pause the timer */
    function pauseTimer() {
	timerPaused = true;
    }

    /** unpause the timer */
    function unpauseTimer() {
	timerPaused = false;
    }

    /** called whenever the player loses */
    function lose() {
	clearInterval(timer);
	gameOver = true;
	$('.loserOverlay').css('visibility', 'visible');
    }

    /** determine the state of the game based on the keycode
     *  keyCode is guaranteed to be one of 90 (z) or 88 (x)
     */
    function isCorrect(keyCode) {
	// z => chooper, x => ladiez
	return (keyCode == 88 && gameImageClass == 'chooper') ||
	       (keyCode == 90 && gameImageClass == 'ladiez');
    }

    /** chooses the next game image to display and inserts it into the DOM */
    function insertRandomGameImage() {
	var imgSrc;
	var chooperOrLadiez = Math.random();
	var n = nlast;

	if(chooperOrLadiez < 0.5) { // choose chooper
	    // check if image is the same and regenerate if so
	    while(n == nlast) {
	    	n = Math.floor(Math.random() * nChooperImages);
	    }
	    imgSrc = CHOOPER_IMAGE_DIR + '/' + n + '.jpg';
	    gameImageClass = 'chooper';
	} else { // choose ladiez
	    while(n == nlast) {
	    	n = Math.floor(Math.random() * nLadiezImages);
	    }
	    imgSrc = LADIEZ_IMAGE_DIR + '/' + n + '.jpg';
	    gameImageClass = 'ladiez';
	}
	// store last used image
	nlast = n;

	var imgSrc = $('#gameImage').after('<img class="' + gameImageClass + 
		'" src="' + imgSrc + '" width="300" height="400"/>');
    }

    /** inserts the default (white) buttons into the DOM
     *  assumes that any other buttons have been removed
     */
    function insertDefaultButtons() {
	$("#buttons").after('<img class="button ladiez" src="../static/images/buttons/button_ladiez_default.jpg" />');
	$("#buttons").after('<img class="button chooper" src="../static/images/buttons/button_chooper_default.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its green equivalent
     */
    function insertGreenButton() {
	var match = $('.button.' + gameImageClass)
	match.replaceWith('<img class="button ' + gameImageClass + 
		'" src="../static/images/buttons/button_' + gameImageClass + 
		'_correct.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its red equivalent
     */
    function insertRedButton() {
	// if user guessed and was wrong, insert red button in OTHER class
	var otherClass = gameImageClass === 'chooper' ? 'ladiez' : 'chooper';
	$('.button.' + otherClass).replaceWith('<img class="button ' + otherClass + 
		'" src="../static/images/buttons/button_' + otherClass +
		'_incorrect.jpg" />');
    }


    /** clears the game image and both button images from the DOM
     *  assumes there are images to clear in the first place
     */
    function clearImages() {
	// clear the button and game images
	$('#gameImage').next().remove();
	$('#buttons').next().remove();
	$('#buttons').next().remove();
    }


    init();

    /** unify handling of key and button presses, since the logic
     *  is 90% the same
     */
    $('body').on('click keydown', function(event) {
	var button = (event.type == 'click' ? event.toElement.className : null);
	if(gameOver) {
	    // we are in the losing state, any keypress means
	    // the user wants to play again
	    reset();
	} else {
	    // game only responds to 'z' or 'x' keypresses, or clicking on one
	    // of the buttons
	    if(button == null) {
		if(event.which != 90 && event.which != 88) return;
		gameOver = isCorrect(event.which);
	    }
	    else if(button == 'button chooper') gameOver = (gameImageClass == 'ladiez');
	    else if(button == 'button ladiez') gameOver = (gameImageClass == 'chooper');
	    else {
		console.log(button);
		return;
	    }

	    if(gameOver) {
		insertRedButton();
		lose();
	    } else {
		// if the player makes the correct choice with less than 500ms to spare
		// they will lose anyway, unless the timer is paused
		pauseTimer();
		insertGreenButton();
		// delay the execution of the rest of the branch by 500ms
		// gives the user time to see the green button
		setTimeout(function () {
		    clearImages();
		    insertRandomGameImage();
		    insertDefaultButtons();

		    $(".score").text(++score);
		    unpauseTimer();
		    resetTimer(currentDuration*difficulty);
		}, 500);
	    }
	}
    });
});
