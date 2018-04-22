function init() {
	document.addEventListener("deviceready",onDeviceReady, false);
}

$(document).ready(function(){
  $('.menu-mobile').on('click touchstart', function(e){
    $('html').toggleClass('menu-active');
      e.preventDefault();
  });
})

var c = document.querySelector('.card'), 
    switchers = c.querySelectorAll('.switch');

for(var i = 0; i < switchers.length; i++) {
  switchers[i].addEventListener('click', function(){
    c.classList.toggle('flipped');
  }, false);
}

