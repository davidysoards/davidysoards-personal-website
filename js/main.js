/* CONTACT FORM */
$(function()
{
    function after_form_submitted(data) 
    {
        if(data.result == 'success')
        {
            $('form#reused_form').hide();
            $('#success_message').show();
            $('#error_message').hide();
        }
        else
        {
            $('#error_message').append('<ul></ul>');

            jQuery.each(data.errors,function(key,val)
            {
                $('#error_message ul').append('<li>'+key+':'+val+'</li>');
            });
            $('#success_message').hide();
            $('#error_message').show();

            //reverse the response on the button
            $('button[type="button"]', $form).each(function()
            {
                $btn = $(this);
                label = $btn.prop('orig_label');
                if(label)
                {
                    $btn.prop('type','submit' ); 
                    $btn.text(label);
                    $btn.prop('orig_label','');
                }
            });
            
        }//else
    }

	$('#reused_form').submit(function(e)
      {
        e.preventDefault();

        $form = $(this);
        //show some response on the button
        $('button[type="submit"]', $form).each(function()
        {
            $btn = $(this);
            $btn.prop('type','button' ); 
            $btn.prop('orig_label',$btn.text());
            $btn.text('Sending ...');
        });
        

                    $.ajax({
                type: "POST",
                url: 'handler.php',
                data: $form.serialize(),
                success: after_form_submitted,
                dataType: 'json' 
            });        
        
      });	
});


// Change Lightbox 2 defaults
lightbox.option({
  'fadeDuration': 400,
  'imageFadeDuration': 400,
  'resizeDuration': 400,
  'positionFromTop': 30,
  'wrapAround': true,
  // 'fitImagesInViewport': false,
});


/********** 
=ANIMATIONS
**********/
// hero homepage big head bubble tween
const $headBalloon = $('.head-balloon'),
      $bighead = $('#bighead'),
      $balloon = $('#balloon'),
      $hello = $('#hello'),
      headTl = new TimelineLite();
      
headTl
.fromTo($bighead, 1.3, {y: '150%'}, {y: '0%', autoAlpha: 1, ease: Back.easeOut.config(0.9)})
.fromTo($balloon, 0.7, {x: '+=40', y: '+=20'}, {x: 0, y: 0, autoAlpha: 1, ease: Power1.easeOut}, '-=0.3')
.to($hello, 0.4, {autoAlpha: 1}, '-=0.4')
;
   
// Scroll arrow all pages
const $arrow = $('.arrow')
TweenLite.fromTo($arrow, 1, {y: '-=18', autoAlpha: 0}, {y: 0, autoAlpha: 1, ease: Power1.easeOut, delay: 1.3});


// desk tween on portfolio page
const $desk = $('#desk-illustration');      
TweenLite.fromTo($desk, 1.7, {x: '300%', autoAlpha: 0}, {x: '0%', autoAlpha: 1, ease: Back.easeOut.config(1)});

// headshot on about page
const $headshot = $('#headshot');
TweenLite.fromTo($headshot, 1.7, {scale: 0, autoAlpha: 0}, {scale: 1, autoAlpha: 1, ease: Back.easeOut.config(1)});

// project page logos
const $projectImage = $('.project-image');
TweenMax.fromTo($projectImage, 1.7, {scale: 0, opacity: 0, rotation: 180},
  {scale: 1, opacity: 1, rotation: 0, ease:Elastic.easeInOut});


/********** 
=SCROLL TO IDs
**********/
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
  var pos = $id.offset().top - 77;

  // animated top scrolling
  $('body, html').animate({scrollTop: pos});
});

