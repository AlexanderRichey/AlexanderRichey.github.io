var projects = require('./data');

var currentProject = 0;

$(function () {
  AOS.init({
    duration: 600,
    disable: 'mobile',
    once: true
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
