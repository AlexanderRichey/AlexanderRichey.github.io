/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var projects = __webpack_require__(1);

	var currentProject = 0;

	$(function () {
	  AOS.init({
	    duration: 600,
	  });
	  window.onload = function () {
	    AOS.refreshHard();
	  };
	  fixHeight();
	  installListeners();
	  intro();
	});

	function fixHeight () {
	  var height = $('#middle').height();
	  $('#left').css({"height":height});
	  $('#right').css({"height":height});
	}

	function intro () {
	  var introText = "I'm a software developer... >> Scroll for cool stuff!";
	  var i = 0;
	  var lineOne = '#line-one';
	  var lineTwo = '#line-two';
	  var current = lineOne;

	  var intervalToken = setInterval(automateTyping, 50);

	  function automateTyping () {
	    if (i === introText.length) { return arrowFadeIn(); }
	    if (i > 27) { current = lineTwo; }
	    $(current).append(introText[i]);
	    i += 1;
	  }
	  function arrowFadeIn () {
	    $('#arrow').animate({ opacity:1 }, 500);
	    clearInterval(intervalToken);
	  }
	}

	function updateProject () {
	  $("#middle").animate({ opacity: 0 }, 300, function () {
	    $(".project").find("img").attr('src', projects[currentProject].img);
	    $(".project").find("h4").text(projects[currentProject].title);
	    $(".project").find("p").text(projects[currentProject].blurb);
	    $("#repo").attr('href', projects[currentProject].repo);
	    $("#live").attr('href', projects[currentProject].live);
	    $("#middle").animate({ opacity: 1 }, 500);
	  });
	}

	function installListeners () {
	  $('nav').find('li').click(function (e) {
	    var dest = $(e.currentTarget).data("dest");

	    $('html, body').animate({
	        scrollTop: $(dest).offset().top - 65
	    }, 1000);
	  });

	  $('#left').on('click', function (e) {
	    currentProject = Math.abs((currentProject + 2) % 3);
	    updateProject();
	  });

	  $('#right').on('click', function (e) {
	    currentProject = Math.abs((currentProject + 1) % 3);
	    updateProject();
	  });

	  $(window).scroll(function(){
	    if ($(window).scrollTop() > 10) {
	      $('.nav-container').fadeIn(500);
	    }
	  });
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {
	  0: {
	    title: "NewsJunkie",
	    blurb: "A clone of the news aggregator Feedly, built with Ruby on Rails and React.js. Check out the GitHub repo for more technical details or visit the live site to see it in action.",
	    img: "./assets/newsjunkie.jpg",
	    repo: "https://github.com/AlexanderRichey/NewsJunkie",
	    live: "http://www.newsjunkie.in/"
	  },
	  1: {
	    title: "Chess AI",
	    blurb: "Coded in Ruby, playable in terminal, and powered by a negamax algorithm with alpha-beta pruning. Can you beat it?",
	    img: "./assets/chess.jpg",
	    repo: "https://github.com/AlexanderRichey/Chess",
	    live: "https://github.com/AlexanderRichey/Chess"
	  },
	  2: {
	    title: "SkiFree",
	    blurb: "A remake of the classic game SkiFree powered by JavaScript Canvas.",
	    img: "./assets/skifree.jpg",
	    repo: "https://github.com/AlexanderRichey/SkiFree",
	    live: "http://alexrichey.com/2016/04/17/ski-free/"
	  }
	};


/***/ }
/******/ ]);