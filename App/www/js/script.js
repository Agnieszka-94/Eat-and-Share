function init() {
	document.addEventListener("deviceready",onDeviceReady, false);
}

$(document).ready(function(){
	$('.menu-mobile').on('click touchstart', function(e){
		$('html').toggleClass('menu-active');
	  	e.preventDefault();
	});
})

$("menu li").click(function () {
  $(".menu-active").fadeout();
});

$(function() {
  $("#listView li").click(function () {
    if ( $("#listView li").hasClass("list-item-active") ) {
      $("#listView li").removeClass("list-item-active");
    }
    $(this).addClass("list-item-active");
  });
});




var c = document.querySelector('.card'), 
    switchers = c.querySelectorAll('.switch');

for(var i = 0; i < switchers.length; i++) {
  switchers[i].addEventListener('click', function(){
    c.classList.toggle('flipped');
  }, false);
}

