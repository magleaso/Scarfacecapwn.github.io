/** TODO:
 *    - keep local high score
 *    - moar pics
 */
$(document).ready(function() {
    /** the directory path containing images of ladiez */
    var LADIEZ_IMAGE_DIR = 'c_or_l/static/images/ladiez';
    /** the directory path containing image of chooper */
    var CHOOPER_IMAGE_DIR = 'c_or_l/static/images/chooper';
    /** number of ms before player loses.
     *  This is just the initial value, it decreases as the game goes on
     */
    var INITIAL_DURATION = 5000; 
	// sped up timer
	var currentDuration = INITIAL_DURATION;
	//difficulty scale determines how quickly timer decreases
	var difficulty = 1.1;
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
	nextSecond(INITIAL_DURATION);
    }
	//Phased out reset because it was causing issue with timer -Mg
    /** resets the game (i.e. the game has already been played
     *  and lost at least once)
     */
    /** function reset() {
	score = 0;
	gameOver = false;
	$('.loserOverlay').css('visibility', 'hidden');
	clearImages();
	insertRandomGameImage();
	insertDefaultButtons();
    } */

	function nextSecond(secondsleft) {
	/** display seconds left on timer as int */
	$('.timer').text(parseInt(secondsleft/1000, 10));
	/** prepare to send to lose state */
	if(secondsleft == 0) {
		/** send to lose state after remaining time expires */
		timer = setTimeout(lose(), 1);
	/** case where timer duration is not a whole number of seconds */
	} else if(secondsleft % 1000 != 0) {
		/** update the time again when the timer hits whole number seconds */
		timer = setTimeout(nextSecond, secondsleft % 1000, secondsleft - (secondsleft % 1000));
	} else {
		/** increment the time normally */
		timer = setTimeout(nextSecond, 1000, secondsleft - 1000);
		}
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
	$("#buttons").after('<img class="button ladiez" src="c_or_l/static/images/buttons/button_ladiez_default.jpg" />');
	$("#buttons").after('<img class="button chooper" src="c_or_l/static/images/buttons/button_chooper_default.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its green equivalent
     */
    function insertGreenButton() {
	var match = $('.button.' + gameImageClass)
	match.replaceWith(
		'<img class="button ' + gameImageClass + '" src="c_or_l/static/images/buttons/button_' + gameImageClass + '_correct.jpg" />');
    }

    /** replaces the button of the class specified in <gameImageClass>
     *  with its red equivalent
     */
    function insertRedButton() {
	// if user guessed and was wrong, insert red button in OTHER class
	var otherClass = gameImageClass === 'chooper' ? 'ladiez' : 'chooper';
	$('.button.' + otherClass).replaceWith(
		'<img class="button ' + otherClass + '" src="c_or_l/static/images/buttons/button_' + otherClass+ '_incorrect.jpg" />');
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
		// Next 2 lines replace the reset() functionality
		clearImages();
		$('.loserOverlay').css('visibility', 'hidden');
		currentDuration = INITIAL_DURATION;
		init();
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
			// start timer again with less time
			currentDuration = currentDuration/difficulty;
		    nextSecond(currentDuration);
		}, 500);
	    }
	}
    });

    init();
});
