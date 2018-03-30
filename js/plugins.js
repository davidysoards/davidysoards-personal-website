// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


/*!
 * Lightbox v2.10.0
 * by Lokesh Dhakar
 *
 * More info:
 * http://lokeshdhakar.com/projects/lightbox2/
 *
 * Copyright 2007, 2018 Lokesh Dhakar
 * Released under the MIT license
 * https://github.com/lokesh/lightbox2/blob/master/LICENSE
 *
 * @preserve
 */

// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['jquery'], factory);
  } else if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory(require('jquery'));
  } else {
      // Browser globals (root is window)
      root.lightbox = factory(root.jQuery);
  }
}(this, function ($) {

function Lightbox(options) {
  this.album = [];
  this.currentImageIndex = void 0;
  this.init();

  // options
  this.options = $.extend({}, this.constructor.defaults);
  this.option(options);
}

// Descriptions of all options available on the demo site:
// http://lokeshdhakar.com/projects/lightbox2/index.html#options
Lightbox.defaults = {
  albumLabel: 'Image %1 of %2',
  alwaysShowNavOnTouchDevices: false,
  fadeDuration: 600,
  fitImagesInViewport: true,
  imageFadeDuration: 600,
  // maxWidth: 800,
  // maxHeight: 600,
  positionFromTop: 50,
  resizeDuration: 700,
  showImageNumberLabel: true,
  wrapAround: false,
  disableScrolling: false,
  /*
  Sanitize Title
  If the caption data is trusted, for example you are hardcoding it in, then leave this to false.
  This will free you to add html tags, such as links, in the caption.

  If the caption data is user submitted or from some other untrusted source, then set this to true
  to prevent xss and other injection attacks.
   */
  sanitizeTitle: false
};

Lightbox.prototype.option = function(options) {
  $.extend(this.options, options);
};

Lightbox.prototype.imageCountLabel = function(currentImageNum, totalImages) {
  return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
};

Lightbox.prototype.init = function() {
  var self = this;
  // Both enable and build methods require the body tag to be in the DOM.
  $(document).ready(function() {
    self.enable();
    self.build();
  });
};

// Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
// that contain 'lightbox'. When these are clicked, start lightbox.
Lightbox.prototype.enable = function() {
  var self = this;
  $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
    self.start($(event.currentTarget));
    return false;
  });
};

// Build html for the lightbox and the overlay.
// Attach event handlers to the new DOM elements. click click click
Lightbox.prototype.build = function() {
  if ($('#lightbox').length > 0) {
      return;
  }

  var self = this;
  $('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>').appendTo($('body'));

  // Cache jQuery objects
  this.$lightbox       = $('#lightbox');
  this.$overlay        = $('#lightboxOverlay');
  this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
  this.$container      = this.$lightbox.find('.lb-container');
  this.$image          = this.$lightbox.find('.lb-image');
  this.$nav            = this.$lightbox.find('.lb-nav');

  // Store css values for future lookup
  this.containerPadding = {
    top: parseInt(this.$container.css('padding-top'), 10),
    right: parseInt(this.$container.css('padding-right'), 10),
    bottom: parseInt(this.$container.css('padding-bottom'), 10),
    left: parseInt(this.$container.css('padding-left'), 10)
  };

  this.imageBorderWidth = {
    top: parseInt(this.$image.css('border-top-width'), 10),
    right: parseInt(this.$image.css('border-right-width'), 10),
    bottom: parseInt(this.$image.css('border-bottom-width'), 10),
    left: parseInt(this.$image.css('border-left-width'), 10)
  };

  // Attach event handlers to the newly minted DOM elements
  this.$overlay.hide().on('click', function() {
    self.end();
    return false;
  });

  this.$lightbox.hide().on('click', function(event) {
    if ($(event.target).attr('id') === 'lightbox') {
      self.end();
    }
    return false;
  });

  this.$outerContainer.on('click', function(event) {
    if ($(event.target).attr('id') === 'lightbox') {
      self.end();
    }
    return false;
  });

  this.$lightbox.find('.lb-prev').on('click', function() {
    if (self.currentImageIndex === 0) {
      self.changeImage(self.album.length - 1);
    } else {
      self.changeImage(self.currentImageIndex - 1);
    }
    return false;
  });

  this.$lightbox.find('.lb-next').on('click', function() {
    if (self.currentImageIndex === self.album.length - 1) {
      self.changeImage(0);
    } else {
      self.changeImage(self.currentImageIndex + 1);
    }
    return false;
  });

  /*
    Show context menu for image on right-click

    There is a div containing the navigation that spans the entire image and lives above of it. If
    you right-click, you are right clicking this div and not the image. This prevents users from
    saving the image or using other context menu actions with the image.

    To fix this, when we detect the right mouse button is pressed down, but not yet clicked, we
    set pointer-events to none on the nav div. This is so that the upcoming right-click event on
    the next mouseup will bubble down to the image. Once the right-click/contextmenu event occurs
    we set the pointer events back to auto for the nav div so it can capture hover and left-click
    events as usual.
   */
  this.$nav.on('mousedown', function(event) {
    if (event.which === 3) {
      self.$nav.css('pointer-events', 'none');

      self.$lightbox.one('contextmenu', function() {
        setTimeout(function() {
            this.$nav.css('pointer-events', 'auto');
        }.bind(self), 0);
      });
    }
  });


  this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
    self.end();
    return false;
  });
};

// Show overlay and lightbox. If the image is part of a set, add siblings to album array.
Lightbox.prototype.start = function($link) {
  var self    = this;
  var $window = $(window);

  $window.on('resize', $.proxy(this.sizeOverlay, this));

  $('select, object, embed').css({
    visibility: 'hidden'
  });

  this.sizeOverlay();

  this.album = [];
  var imageNumber = 0;

  function addToAlbum($link) {
    self.album.push({
      alt: $link.attr('data-alt'),
      link: $link.attr('href'),
      title: $link.attr('data-title') || $link.attr('title')
    });
  }

  // Support both data-lightbox attribute and rel attribute implementations
  var dataLightboxValue = $link.attr('data-lightbox');
  var $links;

  if (dataLightboxValue) {
    $links = $($link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]');
    for (var i = 0; i < $links.length; i = ++i) {
      addToAlbum($($links[i]));
      if ($links[i] === $link[0]) {
        imageNumber = i;
      }
    }
  } else {
    if ($link.attr('rel') === 'lightbox') {
      // If image is not part of a set
      addToAlbum($link);
    } else {
      // If image is part of a set
      $links = $($link.prop('tagName') + '[rel="' + $link.attr('rel') + '"]');
      for (var j = 0; j < $links.length; j = ++j) {
        addToAlbum($($links[j]));
        if ($links[j] === $link[0]) {
          imageNumber = j;
        }
      }
    }
  }

  // Position Lightbox
  var top  = $window.scrollTop() + this.options.positionFromTop;
  var left = $window.scrollLeft();
  this.$lightbox.css({
    top: top + 'px',
    left: left + 'px'
  }).fadeIn(this.options.fadeDuration);

  // Disable scrolling of the page while open
  if (this.options.disableScrolling) {
    $('html').addClass('lb-disable-scrolling');
  }

  this.changeImage(imageNumber);
};

// Hide most UI elements in preparation for the animated resizing of the lightbox.
Lightbox.prototype.changeImage = function(imageNumber) {
  var self = this;

  this.disableKeyboardNav();
  var $image = this.$lightbox.find('.lb-image');

  this.$overlay.fadeIn(this.options.fadeDuration);

  $('.lb-loader').fadeIn('slow');
  this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

  this.$outerContainer.addClass('animating');

  // When image to show is preloaded, we send the width and height to sizeContainer()
  var preloader = new Image();
  preloader.onload = function() {
    var $preloader;
    var imageHeight;
    var imageWidth;
    var maxImageHeight;
    var maxImageWidth;
    var windowHeight;
    var windowWidth;

    $image.attr({
      'alt': self.album[imageNumber].alt,
      'src': self.album[imageNumber].link
    });

    $preloader = $(preloader);

    $image.width(preloader.width);
    $image.height(preloader.height);

    if (self.options.fitImagesInViewport) {
      // Fit image inside the viewport.
      // Take into account the border around the image and an additional 10px gutter on each side.

      windowWidth    = $(window).width();
      windowHeight   = $(window).height();
      maxImageWidth  = windowWidth - self.containerPadding.left - self.containerPadding.right - self.imageBorderWidth.left - self.imageBorderWidth.right - 20;
      maxImageHeight = windowHeight - self.containerPadding.top - self.containerPadding.bottom - self.imageBorderWidth.top - self.imageBorderWidth.bottom - 120;

      // Check if image size is larger then maxWidth|maxHeight in settings
      if (self.options.maxWidth && self.options.maxWidth < maxImageWidth) {
        maxImageWidth = self.options.maxWidth;
      }
      if (self.options.maxHeight && self.options.maxHeight < maxImageWidth) {
        maxImageHeight = self.options.maxHeight;
      }

      // Is the current image's width or height is greater than the maxImageWidth or maxImageHeight
      // option than we need to size down while maintaining the aspect ratio.
      if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
        if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
          imageWidth  = maxImageWidth;
          imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
          $image.width(imageWidth);
          $image.height(imageHeight);
        } else {
          imageHeight = maxImageHeight;
          imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
          $image.width(imageWidth);
          $image.height(imageHeight);
        }
      }
    }
    self.sizeContainer($image.width(), $image.height());
  };

  preloader.src          = this.album[imageNumber].link;
  this.currentImageIndex = imageNumber;
};

// Stretch overlay to fit the viewport
Lightbox.prototype.sizeOverlay = function() {
  this.$overlay
    .width($(document).width())
    .height($(document).height());
};

// Animate the size of the lightbox to fit the image we are showing
Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
  var self = this;

  var oldWidth  = this.$outerContainer.outerWidth();
  var oldHeight = this.$outerContainer.outerHeight();
  var newWidth  = imageWidth + this.containerPadding.left + this.containerPadding.right + this.imageBorderWidth.left + this.imageBorderWidth.right;
  var newHeight = imageHeight + this.containerPadding.top + this.containerPadding.bottom + this.imageBorderWidth.top + this.imageBorderWidth.bottom;

  function postResize() {
    self.$lightbox.find('.lb-dataContainer').width(newWidth);
    self.$lightbox.find('.lb-prevLink').height(newHeight);
    self.$lightbox.find('.lb-nextLink').height(newHeight);
    self.showImage();
  }

  if (oldWidth !== newWidth || oldHeight !== newHeight) {
    this.$outerContainer.animate({
      width: newWidth,
      height: newHeight
    }, this.options.resizeDuration, 'swing', function() {
      postResize();
    });
  } else {
    postResize();
  }
};

// Display the image and its details and begin preload neighboring images.
Lightbox.prototype.showImage = function() {
  this.$lightbox.find('.lb-loader').stop(true).hide();
  this.$lightbox.find('.lb-image').fadeIn(this.options.imageFadeDuration);

  this.updateNav();
  this.updateDetails();
  this.preloadNeighboringImages();
  this.enableKeyboardNav();
};

// Display previous and next navigation if appropriate.
Lightbox.prototype.updateNav = function() {
  // Check to see if the browser supports touch events. If so, we take the conservative approach
  // and assume that mouse hover events are not supported and always show prev/next navigation
  // arrows in image sets.
  var alwaysShowNav = false;
  try {
    document.createEvent('TouchEvent');
    alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
  } catch (e) {}

  this.$lightbox.find('.lb-nav').show();

  if (this.album.length > 1) {
    if (this.options.wrapAround) {
      if (alwaysShowNav) {
        this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
      }
      this.$lightbox.find('.lb-prev, .lb-next').show();
    } else {
      if (this.currentImageIndex > 0) {
        this.$lightbox.find('.lb-prev').show();
        if (alwaysShowNav) {
          this.$lightbox.find('.lb-prev').css('opacity', '1');
        }
      }
      if (this.currentImageIndex < this.album.length - 1) {
        this.$lightbox.find('.lb-next').show();
        if (alwaysShowNav) {
          this.$lightbox.find('.lb-next').css('opacity', '1');
        }
      }
    }
  }
};

// Display caption, image number, and closing button.
Lightbox.prototype.updateDetails = function() {
  var self = this;

  // Enable anchor clicks in the injected caption html.
  // Thanks Nate Wright for the fix. @https://github.com/NateWr
  if (typeof this.album[this.currentImageIndex].title !== 'undefined' &&
    this.album[this.currentImageIndex].title !== '') {
    var $caption = this.$lightbox.find('.lb-caption');
    if (this.options.sanitizeTitle) {
      $caption.text(this.album[this.currentImageIndex].title);
    } else {
      $caption.html(this.album[this.currentImageIndex].title);
    }
    $caption.fadeIn('fast')
      .find('a').on('click', function(event) {
        if ($(this).attr('target') !== undefined) {
          window.open($(this).attr('href'), $(this).attr('target'));
        } else {
          location.href = $(this).attr('href');
        }
      });
  }

  if (this.album.length > 1 && this.options.showImageNumberLabel) {
    var labelText = this.imageCountLabel(this.currentImageIndex + 1, this.album.length);
    this.$lightbox.find('.lb-number').text(labelText).fadeIn('fast');
  } else {
    this.$lightbox.find('.lb-number').hide();
  }

  this.$outerContainer.removeClass('animating');

  this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
    return self.sizeOverlay();
  });
};

// Preload previous and next images in set.
Lightbox.prototype.preloadNeighboringImages = function() {
  if (this.album.length > this.currentImageIndex + 1) {
    var preloadNext = new Image();
    preloadNext.src = this.album[this.currentImageIndex + 1].link;
  }
  if (this.currentImageIndex > 0) {
    var preloadPrev = new Image();
    preloadPrev.src = this.album[this.currentImageIndex - 1].link;
  }
};

Lightbox.prototype.enableKeyboardNav = function() {
  $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
};

Lightbox.prototype.disableKeyboardNav = function() {
  $(document).off('.keyboard');
};

Lightbox.prototype.keyboardAction = function(event) {
  var KEYCODE_ESC        = 27;
  var KEYCODE_LEFTARROW  = 37;
  var KEYCODE_RIGHTARROW = 39;

  var keycode = event.keyCode;
  var key     = String.fromCharCode(keycode).toLowerCase();
  if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
    this.end();
  } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
    if (this.currentImageIndex !== 0) {
      this.changeImage(this.currentImageIndex - 1);
    } else if (this.options.wrapAround && this.album.length > 1) {
      this.changeImage(this.album.length - 1);
    }
  } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
    if (this.currentImageIndex !== this.album.length - 1) {
      this.changeImage(this.currentImageIndex + 1);
    } else if (this.options.wrapAround && this.album.length > 1) {
      this.changeImage(0);
    }
  }
};

// Closing time. :-(
Lightbox.prototype.end = function() {
  this.disableKeyboardNav();
  $(window).off('resize', this.sizeOverlay);
  this.$lightbox.fadeOut(this.options.fadeDuration);
  this.$overlay.fadeOut(this.options.fadeDuration);
  $('select, object, embed').css({
    visibility: 'visible'
  });
  if (this.options.disableScrolling) {
    $('html').removeClass('lb-disable-scrolling');
  }
};

return new Lightbox();
}));

/******
=YOUTUBE LIGHTBOX
******/
// load Youtube API code asynchronously
var tag = document.createElement('script')

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

var isiOS = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)/i) != null //boolean check for iOS devices

var youtubelightbox = document.getElementById('youtubelightbox')
var player // variable to hold new YT.Player() instance

// Hide lightbox when clicked on
youtubelightbox.addEventListener('click', function(){
	this.style.display = 'none'
	player.stopVideo()
}, false)

// Exclude youtube iframe from above action
youtubelightbox.querySelector('.centeredchild').addEventListener('click', function(e){
	e.stopPropagation()
}, false)


// define onYouTubeIframeAPIReady() function and initialize lightbox when API is ready
function onYouTubeIframeAPIReady() {
	createlightbox()
}

// Extracts the Youtube video ID from a well formed Youtube URL
function getyoutubeid(link){
	// Assumed Youtube URL formats
	// https://www.youtube.com/watch?v=Pe0jFDPHkzo
	// https://youtu.be/Pe0jFDPHkzo
	// https://www.youtube.com/v/Pe0jFDPHkzo
	// and more
	
	//See http://stackoverflow.com/a/6904504/4360074
	var youtubeidreg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
	return youtubeidreg.exec(link)[1] // return Youtube video ID portion of link
}

// Creates a new YT.Player() instance
function createyoutubeplayer(videourl){
	player = new YT.Player('playerdiv', {
		videoId: videourl,
		playerVars: {autoplay: 1, loop: 1, playlist: videourl}
	})
}

// Main Youtube lightbox function
function createlightbox(){
	var targetlinks = document.querySelectorAll('.yt-lightbox')
	for (var i=0; i<targetlinks.length; i++){
		var link = targetlinks[i]
		link._videoid = getyoutubeid(link) // store youtube video ID portion of link inside _videoid property
		targetlinks[i].addEventListener('click', function(e){
			youtubelightbox.style.display = 'block'
			if (typeof player == 'undefined'){ // if video player hasn't been created yet
				createyoutubeplayer(this._videoid)
			}
			else{
				if (isiOS){ // iOS devices can only use the "cue" related methods
					player.cueVideoById(this._videoid)
				}
				else{
					player.loadVideoById(this._videoid)
				}
			}
			e.preventDefault()
		}, false)
	}
}


/***********
=SPLIT-TEXT GSAP
***********/
/*!
 * VERSION: 0.5.8
 * DATE: 2018-02-15
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2018, GreenSock. All rights reserved.
 * SplitText is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;!function(a){"use strict";var b=a.GreenSockGlobals||a,c=function(a){var c,d=a.split("."),e=b;for(c=0;c<d.length;c++)e[d[c]]=e=e[d[c]]||{};return e},d=c("com.greensock.utils"),e=function(a){var b=a.nodeType,c="";if(1===b||9===b||11===b){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===b||4===b)return a.nodeValue;return c},f=document,g=f.defaultView?f.defaultView.getComputedStyle:function(){},h=/([A-Z])/g,i=function(a,b,c,d){var e;return(c=c||g(a,null))?(a=c.getPropertyValue(b.replace(h,"-$1").toLowerCase()),e=a||c.length?a:c[b]):a.currentStyle&&(c=a.currentStyle,e=c[b]),d?e:parseInt(e,10)||0},j=function(a){return a.length&&a[0]&&(a[0].nodeType&&a[0].style&&!a.nodeType||a[0].length&&a[0][0])?!0:!1},k=function(a){var b,c,d,e=[],f=a.length;for(b=0;f>b;b++)if(c=a[b],j(c))for(d=c.length,d=0;d<c.length;d++)e.push(c[d]);else e.push(c);return e},l=/(?:\r|\n|\t\t)/g,m=/(?:\s\s+)/g,n=55296,o=56319,p=56320,q=127462,r=127487,s=127995,t=127999,u=function(a){return(a.charCodeAt(0)-n<<10)+(a.charCodeAt(1)-p)+65536},v=f.all&&!f.addEventListener,w=" style='position:relative;display:inline-block;"+(v?"*display:inline;*zoom:1;'":"'"),x=function(a,b){a=a||"";var c=-1!==a.indexOf("++"),d=1;return c&&(a=a.split("++").join("")),function(){return"<"+b+w+(a?" class='"+a+(c?d++:"")+"'>":">")}},y=d.SplitText=b.SplitText=function(a,b){if("string"==typeof a&&(a=y.selector(a)),!a)throw"cannot split a null element.";this.elements=j(a)?k(a):[a],this.chars=[],this.words=[],this.lines=[],this._originals=[],this.vars=b||{},this.split(b)},z=function(a,b,c){var d=a.nodeType;if(1===d||9===d||11===d)for(a=a.firstChild;a;a=a.nextSibling)z(a,b,c);else(3===d||4===d)&&(a.nodeValue=a.nodeValue.split(b).join(c))},A=function(a,b){for(var c=b.length;--c>-1;)a.push(b[c])},B=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},C=function(a,b,c){for(var d;a&&a!==b;){if(d=a._next||a.nextSibling)return d.textContent.charAt(0)===c;a=a.parentNode||a._parent}return!1},D=function(a){var b,c,d=B(a.childNodes),e=d.length;for(b=0;e>b;b++)c=d[b],c._isSplit?D(c):(b&&3===c.previousSibling.nodeType?c.previousSibling.nodeValue+=3===c.nodeType?c.nodeValue:c.firstChild.nodeValue:3!==c.nodeType&&a.insertBefore(c.firstChild,c),a.removeChild(c))},E=function(a,b,c,d,e,h,j){var k,l,m,n,o,p,q,r,s,t,u,v,w=g(a),x=i(a,"paddingLeft",w),y=-999,B=i(a,"borderBottomWidth",w)+i(a,"borderTopWidth",w),E=i(a,"borderLeftWidth",w)+i(a,"borderRightWidth",w),F=i(a,"paddingTop",w)+i(a,"paddingBottom",w),G=i(a,"paddingLeft",w)+i(a,"paddingRight",w),H=.2*i(a,"fontSize"),I=i(a,"textAlign",w,!0),J=[],K=[],L=[],M=b.wordDelimiter||" ",N=b.span?"span":"div",O=b.type||b.split||"chars,words,lines",P=e&&-1!==O.indexOf("lines")?[]:null,Q=-1!==O.indexOf("words"),R=-1!==O.indexOf("chars"),S="absolute"===b.position||b.absolute===!0,T=b.linesClass,U=-1!==(T||"").indexOf("++"),V=[];for(P&&1===a.children.length&&a.children[0]._isSplit&&(a=a.children[0]),U&&(T=T.split("++").join("")),l=a.getElementsByTagName("*"),m=l.length,o=[],k=0;m>k;k++)o[k]=l[k];if(P||S)for(k=0;m>k;k++)n=o[k],p=n.parentNode===a,(p||S||R&&!Q)&&(v=n.offsetTop,P&&p&&Math.abs(v-y)>H&&("BR"!==n.nodeName||0===k)&&(q=[],P.push(q),y=v),S&&(n._x=n.offsetLeft,n._y=v,n._w=n.offsetWidth,n._h=n.offsetHeight),P&&((n._isSplit&&p||!R&&p||Q&&p||!Q&&n.parentNode.parentNode===a&&!n.parentNode._isSplit)&&(q.push(n),n._x-=x,C(n,a,M)&&(n._wordEnd=!0)),"BR"===n.nodeName&&(n.nextSibling&&"BR"===n.nextSibling.nodeName||0===k)&&P.push([])));for(k=0;m>k;k++)n=o[k],p=n.parentNode===a,"BR"!==n.nodeName?(S&&(s=n.style,Q||p||(n._x+=n.parentNode._x,n._y+=n.parentNode._y),s.left=n._x+"px",s.top=n._y+"px",s.position="absolute",s.display="block",s.width=n._w+1+"px",s.height=n._h+"px"),!Q&&R?n._isSplit?(n._next=n.nextSibling,n.parentNode.appendChild(n)):n.parentNode._isSplit?(n._parent=n.parentNode,!n.previousSibling&&n.firstChild&&(n.firstChild._isFirst=!0),n.nextSibling&&" "===n.nextSibling.textContent&&!n.nextSibling.nextSibling&&V.push(n.nextSibling),n._next=n.nextSibling&&n.nextSibling._isFirst?null:n.nextSibling,n.parentNode.removeChild(n),o.splice(k--,1),m--):p||(v=!n.nextSibling&&C(n.parentNode,a,M),n.parentNode._parent&&n.parentNode._parent.appendChild(n),v&&n.parentNode.appendChild(f.createTextNode(" ")),b.span&&(n.style.display="inline"),J.push(n)):n.parentNode._isSplit&&!n._isSplit&&""!==n.innerHTML?K.push(n):R&&!n._isSplit&&(b.span&&(n.style.display="inline"),J.push(n))):P||S?(n.parentNode&&n.parentNode.removeChild(n),o.splice(k--,1),m--):Q||a.appendChild(n);for(k=V.length;--k>-1;)V[k].parentNode.removeChild(V[k]);if(P){for(S&&(t=f.createElement(N),a.appendChild(t),u=t.offsetWidth+"px",v=t.offsetParent===a?0:a.offsetLeft,a.removeChild(t)),s=a.style.cssText,a.style.cssText="display:none;";a.firstChild;)a.removeChild(a.firstChild);for(r=" "===M&&(!S||!Q&&!R),k=0;k<P.length;k++){for(q=P[k],t=f.createElement(N),t.style.cssText="display:block;text-align:"+I+";position:"+(S?"absolute;":"relative;"),T&&(t.className=T+(U?k+1:"")),L.push(t),m=q.length,l=0;m>l;l++)"BR"!==q[l].nodeName&&(n=q[l],t.appendChild(n),r&&n._wordEnd&&t.appendChild(f.createTextNode(" ")),S&&(0===l&&(t.style.top=n._y+"px",t.style.left=x+v+"px"),n.style.top="0px",v&&(n.style.left=n._x-v+"px")));0===m?t.innerHTML="&nbsp;":Q||R||(D(t),z(t,String.fromCharCode(160)," ")),S&&(t.style.width=u,t.style.height=n._h+"px"),a.appendChild(t)}a.style.cssText=s}S&&(j>a.clientHeight&&(a.style.height=j-F+"px",a.clientHeight<j&&(a.style.height=j+B+"px")),h>a.clientWidth&&(a.style.width=h-G+"px",a.clientWidth<h&&(a.style.width=h+E+"px"))),A(c,J),A(d,K),A(e,L)},F=function(a,b,c,d){var g,h,i,j,k,p,v,w,x,y=b.span?"span":"div",A=b.type||b.split||"chars,words,lines",B=-1!==A.indexOf("chars"),C="absolute"===b.position||b.absolute===!0,D=b.wordDelimiter||" ",E=" "!==D?"":C?"&#173; ":" ",F=b.span?"</span>":"</div>",G=!0,H=f.createElement("div"),I=a.parentNode;for(I.insertBefore(H,a),H.textContent=a.nodeValue,I.removeChild(a),a=H,g=e(a),v=-1!==g.indexOf("<"),b.reduceWhiteSpace!==!1&&(g=g.replace(m," ").replace(l,"")),v&&(g=g.split("<").join("{{LT}}")),k=g.length,h=(" "===g.charAt(0)?E:"")+c(),i=0;k>i;i++)if(p=g.charAt(i),p===D&&g.charAt(i-1)!==D&&i){for(h+=G?F:"",G=!1;g.charAt(i+1)===D;)h+=E,i++;i===k-1?h+=E:")"!==g.charAt(i+1)&&(h+=E+c(),G=!0)}else"{"===p&&"{{LT}}"===g.substr(i,6)?(h+=B?d()+"{{LT}}</"+y+">":"{{LT}}",i+=5):p.charCodeAt(0)>=n&&p.charCodeAt(0)<=o||g.charCodeAt(i+1)>=65024&&g.charCodeAt(i+1)<=65039?(w=u(g.substr(i,2)),x=u(g.substr(i+2,2)),j=w>=q&&r>=w&&x>=q&&r>=x||x>=s&&t>=x?4:2,h+=B&&" "!==p?d()+g.substr(i,j)+"</"+y+">":g.substr(i,j),i+=j-1):h+=B&&" "!==p?d()+p+"</"+y+">":p;a.outerHTML=h+(G?F:""),v&&z(I,"{{LT}}","<")},G=function(a,b,c,d){var e,f,g=B(a.childNodes),h=g.length,j="absolute"===b.position||b.absolute===!0;if(3!==a.nodeType||h>1){for(b.absolute=!1,e=0;h>e;e++)f=g[e],(3!==f.nodeType||/\S+/.test(f.nodeValue))&&(j&&3!==f.nodeType&&"inline"===i(f,"display",null,!0)&&(f.style.display="inline-block",f.style.position="relative"),f._isSplit=!0,G(f,b,c,d));return b.absolute=j,void(a._isSplit=!0)}F(a,b,c,d)},H=y.prototype;H.split=function(a){this.isSplit&&this.revert(),this.vars=a=a||this.vars,this._originals.length=this.chars.length=this.words.length=this.lines.length=0;for(var b,c,d,e=this.elements.length,f=a.span?"span":"div",g=x(a.wordsClass,f),h=x(a.charsClass,f);--e>-1;)d=this.elements[e],this._originals[e]=d.innerHTML,b=d.clientHeight,c=d.clientWidth,G(d,a,g,h),E(d,a,this.chars,this.words,this.lines,c,b);return this.chars.reverse(),this.words.reverse(),this.lines.reverse(),this.isSplit=!0,this},H.revert=function(){if(!this._originals)throw"revert() call wasn't scoped properly.";for(var a=this._originals.length;--a>-1;)this.elements[a].innerHTML=this._originals[a];return this.chars=[],this.words=[],this.lines=[],this.isSplit=!1,this},y.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(y.selector=c,c(b)):"undefined"==typeof document?b:document.querySelectorAll?document.querySelectorAll(b):document.getElementById("#"===b.charAt(0)?b.substr(1):b)},y.version="0.5.8"}(_gsScope),function(a){"use strict";var b=function(){return(_gsScope.GreenSockGlobals||_gsScope)[a]};"undefined"!=typeof module&&module.exports?module.exports=b():"function"==typeof define&&define.amd&&define([],b)}("SplitText");
