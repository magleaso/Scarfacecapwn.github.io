/** TODO:
 *    - keep local high score
 *    - make timer speed up
 *    - moar pics
 */
$(document).ready(function() {
    /** the directory path containing images of ladiez */
    var LADIEZ_IMAGE_DIR = 'static/images/ladiez';
    /** the directory path containing image of chooper */
    var CHOOPER_IMAGE_DIR = 'static/images/chooper';
    /** number of ms before player loses.
     *  This is just the initial value, it decreases as the game goes on
     */
    var TIMER_DURATION = 2000; 
    /** the timer */
    var timer; 

    /* chooper and ladiez images are numbered from 0 to nChooperImages-1 and nLadiezImages-1
     * respectively
     */

    /** the number of images of ladiez */
    var nLadiezImages = 20;
    /** the number of images of chooper */
    var nChooperImages = 23;
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
	timer = setTimeout(lose, TIMER_DURATION);
    }

    /** resets the game (i.e. the game has already been played
     *  and lost at least once)
     */
    function reset() {
	score = 0;
	gameOver = false;
	$('.loserOverlay').css('visibility', 'hidden');
	clearImages();
	insertRandomGameImage();
	insertDefaultButtons();
	timer = setTimeout(lose, TIMER_DURATION);
    }

    /** called whenever the player loses */
    function lose() {
	clearTimeout(timer);
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

	if(chooperOrLadiez < 0.5) { // choose chooper
	    var n = Math.floor(Math.random() * nChooperImages);
	    imgSrc = CHOOPER_IMAGE_DIR + '/' + n + '.jpg';
	    gameImageClass = 'chooper';
	} else { // choose ladiez
	    var n = Math.floor(Math.random() * nLadiezImages);
	    imgSrc = LADIEZ_IMAGE_DIR + '/' + n + '.jpg';
	    gameImageClass = 'ladiez';
	}

	var imgSrc = 
	$('#gameImage').after(
	    '<img class="' + gameImageClass + '" src="' + imgSrc + '" width="300" height="400"/>');
    }

    /** inserts the default (white) buttons into the DOM
     *  assumes that any other buttons have been removed
     */
    function insertDefaultButtons() {
	$("#buttons").after('<img class="button ladiez" src="static/images/buttons/button_ladiez_default.jpg" />');
	$("#buttons").after('<img class="button chooper" src="static/images/buttons/button_chooper_default.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its green equivalent
     */
    function insertGreenButton() {
	var match = $('.button.' + gameImageClass)
	match.replaceWith(
		'<img class="button ' + gameImageClass + '" src="static/images/buttons/button_' + gameImageClass + '_correct.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its red equivalent
     */
    function insertRedButton() {
	// if user guessed and was wrong, insert red button in OTHER class
	var otherClass = gameImageClass === 'chooper' ? 'ladiez' : 'chooper';
	$('.button.' + otherClass).replaceWith(
		'<img class="button ' + otherClass + '" src="static/images/buttons/button_' + otherClass+ '_incorrect.jpg" />');
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

    $('body').on('keydown', function(event) {
	if(gameOver) {
	    // we are in the losing state, any keypress means
	    // the user wants to play again
	    reset();
	} else {
	    // game only responds to 'z' or 'x' keypresses
	    if(event.which != 90 && event.which != 88) {
		return;
	    }	

	    gameOver = isCorrect(event.which);

	    if(gameOver) {
		insertRedButton();
		lose();
	    } else {
		clearTimeout(timer);
		insertGreenButton();
		// delay the execution of the rest of the branch by 500ms
		// gives the user time to see the green button
		setTimeout(function () {
		    clearImages();
		    insertRandomGameImage();
		    insertDefaultButtons();

		    $(".score").text(++score);
		    timer = setTimeout(lose, TIMER_DURATION);
		}, 500);
	    }
	}
    });

    init();
});
