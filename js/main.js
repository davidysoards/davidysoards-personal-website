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
var $headBalloon = $('.head-balloon'),
      $bighead = $('#bighead'),
      $balloon = $('#balloon'),
      $hello = $('#hello'),
      headTl = new TimelineLite();

headTl
  .fromTo($bighead, 1.8, {x: '300%', autoAlpha: 0}, {x: '0%', autoAlpha: 1, ease: Back.easeOut.config(1)})
  .fromTo($balloon, 0.7, {x: '+=30', y: '+=15'}, {x: 0, y: 0, autoAlpha: 1, ease: Power1.easeOut}, '-=0.3')
  .to($hello, 0.4, {autoAlpha: 1}, '-=0.4');

// desk tween on portfolio page
const $desk = $('.desk-illustration');

TweenLite.fromTo($desk, 1.8, {x: '300%', autoAlpha: 0}, {x: '0%', autoAlpha: 1, ease: Back.easeOut.config(0.7)});
