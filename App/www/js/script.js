function init() {
	document.addEventListener("deviceready",onDeviceReady, false);
}

$(document).ready(function(){
  $('.menu').click(function(){
    $('.menu-hide').toggleClass('show');
    $('.menu').toggleClass('active');
    $('html').toggleClass('menu-active');
  });
  $('a').click(function(){
    $('.menu-hide').removeClass('show');
    $('.menu').removeClass('active');
	$('html').removeClass('menu-active');
  });
});

var c = document.querySelector('.card'), 
    switchers = c.querySelectorAll('.switch');

for(var i = 0; i < switchers.length; i++) {
  switchers[i].addEventListener('click', function(){
    c.classList.toggle('flipped');
  }, false);
}
