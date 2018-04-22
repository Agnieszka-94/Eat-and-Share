function init() {
	document.addEventListener("deviceready",onDeviceReady, false);
}

$(document).ready(function(){
  $('.menu-mobile').click(function(){
    $('.menu-hide').toggleClass('show');
    $('.menu-mobile').toggleClass('active');
  });
  $('a').click(function(){
    $('.menu-hide').removeClass('show');
    $('.menu-mobile').removeClass('active');
  });
});

var c = document.querySelector('.card'), 
    switchers = c.querySelectorAll('.switch');

for(var i = 0; i < switchers.length; i++) {
  switchers[i].addEventListener('click', function(){
    c.classList.toggle('flipped');
  }, false);
}

