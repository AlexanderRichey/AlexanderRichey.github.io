var currentProject = 0;
var projects = {
  0: {
    title: "NewsJunkie",
    blurb: "A clone of the news aggregator Feedly, built with Ruby on Rails and React.js. Check out the GitHub repo for more technical details or visit the live site to see it in action.",
    img: "./assets/newsjunkie.png",
    repo: "https://github.com/AlexanderRichey/NewsJunkie",
    live: "http://www.newsjunkie.in/"
  },
  1: {
    title: "Chess AI",
    blurb: "Coded in Ruby, playable in terminal, and powered by a negamax algorithm with alpha-beta pruning. Can you beat it?",
    img: "./assets/chess.png",
    repo: "https://github.com/AlexanderRichey/Chess",
    live: "https://github.com/AlexanderRichey/Chess"
  },
  2: {
    title: "SkiFree",
    blurb: "A remake of the classic game SkiFree powered by JavaScript Canvas.",
    img: "./assets/skifree.png",
    repo: "https://github.com/AlexanderRichey/SkiFree",
    live: "http://alexrichey.com/2016/04/17/ski-free/"
  }
};

function fixHeight () {
  $('header').css({"height":window.screen.availHeight});

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

  setInterval(automateTyping, 50);

  function automateTyping () {
    if (i === introText.length) { return arrowFadeIn(); }
    if (i > 27) { current = lineTwo; }
    $(current).append(introText[i]);
    i += 1;
  }
  function arrowFadeIn () {
    $('#arrow').animate({ opacity:1 }, 500);
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

$(function () {
  fixHeight();
  installListeners();
  intro();
});
