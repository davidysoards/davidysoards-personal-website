// Change Lightbox 2 defaults
lightbox.option({
  'fadeDuration': 400,
  'imageFadeDuration': 400,
  'resizeDuration': 400,
  'positionFromTop': 30,
  'wrapAround': true,
  // 'fitImagesInViewport': false,
});

// hero homepage big head bubble tween
const $headBalloon = $('.head-balloon'),
      $bighead = $('#bighead'),
      $balloon = $('#balloon'),
      $hello = $('#hello'),
      $myNameIs = ('.hero.home h1'),
      headTl = new TimelineLite();

headTl
  .fromTo($bighead, 1.3, {y: '150%'}, {y: '0%', autoAlpha: 1, ease: Back.easeOut.config(1)})
  .fromTo($balloon, 0.7, {x: '+=40', y: '+=20'}, {x: 0, y: 0, autoAlpha: 1, ease: Power1.easeOut}, '-=0.3')
  .to($hello, 0.4, {autoAlpha: 1}, '-=0.4')
  ;
  
// desk tween on portfolio page
const $desk = $('.desk-illustration');

TweenLite.fromTo($desk, 1.8, {x: '300%', autoAlpha: 0}, {x: '0%', autoAlpha: 1, ease: Back.easeOut.config(0.7)});

//=SCROLL TO IDs

// handle links with @href started with '#' only
$(document).on('click', 'a[href^="#"]', function(e) {
  // target element id
  var id = $(this).attr('href');

  // target element
  var $id = $(id);
  if ($id.length === 0) {
      return;
  }

  // prevent standard hash navigation (avoid blinking in IE)
  e.preventDefault();

  // top position relative to the document
  var pos = $id.offset().top - 60;

  // animated top scrolling
  $('body, html').animate({scrollTop: pos});
});