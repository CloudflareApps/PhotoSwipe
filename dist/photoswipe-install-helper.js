/*! PhotoSwipe Install Helper - 4.0.3 - 2015-08-05
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
/**
*
* Helper to allow PhotoSwipe to be installed on web pages by non-developers
*
*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.PhotoSwipeInstallHelper = factory();
  }
})(this, function () {

  'use strict';

var helperGalleryUID, pswpTemplate, _I, _addEventListener, _ready, _thumbnailURL, _getThumbBoundsFnForImages, _parseHash, PhotoSwipeInstallHelper;

helperGalleryUID = 100; // Prevent (unlikely) potential collision with other photoSwipes on the page

pswpTemplate = '<div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div>';

_I = function(str) {
  return str + '!important;';
};

_addEventListener = function(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent('on' + eventName, function(){
      handler.call(el);
    });
  }
};

_ready = function(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading') {
        fn();
      }
    })
  }
};

_thumbnailURL = function(url, width, height) {
  var match;

  match = url.match(/(^(https?:)?\/\/(www\.)?filepicker\.io\/api\/file\/[a-z0-9]*)\/?/i);
  if (match && match.length === 4) {
    return match[1] + '/convert?w=' + width + '&h=' + height;
  }

  match = url.match(/(^(https?:)?\/\/[a-z0-9\-]*\.imgix\.net\/[^\?]*)/i);
  if (match && match.length === 3) {
    return match[1] + '?w=' + width + '&h=' + height;
  }

  return url;
};

_getThumbBoundsFnForImages = function(images) {
  return function(index) {
    var img, pageYScroll, rect;

    img = images[index]._img;
    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
    rect = img.getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.top + pageYScroll,
      w: rect.width
    };
  }
};

_parseHash = function() {
  var hash = window.location.hash.substring(1),
  params = {};

  if (hash.length < 5) {
    return params;
  }

  var vars = hash.split('&');
  for (var i = 0; i < vars.length; i++) {
    if (!vars[i]) {
      continue;
    }
    var pair = vars[i].split('=');
    if (pair.length < 2) {
      continue;
    }
    params[pair[0]] = pair[1];
  }

  if (params.gid) {
    params.gid = parseInt(params.gid, 10);
  }

  if (!params.hasOwnProperty('pid')) {
    return params;
  }

  params.pid = parseInt(params.pid, 10);
  return params;
};

PhotoSwipeInstallHelper = function() {
  var helper = this;

  helper.init = function(location, options) {
    helper.pswpElement = helper.setupPhotoSwipeDOM();

    if (options.source === 'provided' && options.images && options.images.length) {
      helper.prepareImagesAndSetupDisplay(location, options);
    }

    if (options.source === 'existing') {
      _ready(function(){
        helper.createFromExistingImages(options);
      });
    }
  };

  helper.prepareOpenFromHash = function(images) {
    var hashData = _parseHash();

    if (hashData.pid > 0 && hashData.gid === helperGalleryUID) {
      helper.openPhotoSwipe(images, {
        index: hashData.pid - 1,
        showAnimationDuration: 0
      });
    }
  };

  helper.setupPhotoSwipeDOM = function() {
    var pswpElement;

    pswpElement = document.createElement('div');
    pswpElement.className = 'pswp';
    pswpElement.setAttribute('tabindex', '-1');
    pswpElement.setAttribute('role', 'dialog');
    pswpElement.setAttribute('aria-hidden', 'true');
    pswpElement.innerHTML = pswpTemplate;

    document.body.appendChild(pswpElement);

    return pswpElement;
  };

  helper.preloadImages = function(images, callback) {
    if (!images || !images.length) {
      return;
    }

    var i, image, leftToLoad;

    leftToLoad = 0;

    for (i = 0; i < images.length; i++) {
      if (!images[i].w || !images[i].h) {
        leftToLoad += 1;

        images[i]._preloadImage = new Image();

        (function(i){
          images[i]._preloadImage.onload = function() {
            leftToLoad -= 1;

            images[i].h = this.height;
            images[i].w = this.width;

            if (leftToLoad === 0) {
              callback(images);
            }
          };
        })(i);
      }
    }

    if (leftToLoad === 0) {
      return callback(images);
    }

    // Trigger all preloads after the onload functions are set up
    // so the callback can only ever be fired once
    for (i = 0; i < images.length; i++) {
      if (images[i]._preloadImage) {
        images[i]._preloadImage.src = images[i].src;
      }
    }
  };

  helper.prepareImagesAndSetupDisplay = function(location, options) {
    var images, i, image, leftToLoad;

    // Ensure images have src
    images = [];
    for (i = 0; i < options.images.length; i++) {
      image = options.images[i];

      if (image.src) {
        images.push(image);
      }
    }

    // Return unless we have a location and images
    if (!location || images.length < 1) {
      return;
    }

    helper.preloadImages(images, function(preloadedImages){
      options.preloadedImages = preloadedImages;

      if (options.display === 'gallery') {
        helper.setupGalleryDisplay(location, options);
      }

      if (options.display === 'teaser') {
        helper.setupTeaserDisplay(location, options);
      }

      if (options.display === 'button') {
        helper.setupButtonDisplay(location, options);
      }
    })
  };

  helper.setupGalleryDisplay = function(location, options) {
    helper._setupGalleryDisplay(location, options);
  };

  helper.setupTeaserDisplay = function(location, options) {
    helper._setupGalleryDisplay(location, options, 3);
  };

  helper._setupGalleryDisplay = function(location, options, maxImages) {
    var gallery, styles, a, img, i, c;

    gallery = document.createElement('div');
    gallery.className = 'eager-photoswipe-gallery';

    styles = document.createElement('div');
    gallery.appendChild(styles);

    styles.innerHTML += '' +
    '<style>' +
      '.eager-photoswipe-gallery {' +
        _I('display: block') +
        _I('width: 100%') +
        _I('padding: 0') +
        _I('overflow: hidden') +
        _I('text-align: left') +
      '}' +
      '.eager-photoswipe-gallery * {' +
        _I('box-sizing: border-box') +
      '}' +
      '.eager-photoswipe-gallery a, .eager-photoswipe-gallery img {' +
        _I('display: block') +
        _I('max-width: 100%') +
      '}' +
      '.eager-photoswipe-gallery a {' +
        _I('border: 0') +
        _I('box-shadow: 0') +
        _I('background: none') +
      '}' +
      '@media (max-width: 499px) {' +
        '.eager-photoswipe-gallery a {' +
          _I('width: 200px') +
          _I('margin-bottom: 10px') +
        '}' +
      '}' +
      '@media (min-width: 500px) {' +
        '.eager-photoswipe-gallery a {' +
          _I('position: relative') +
          _I('float: left') +
          _I('width: 200px') +
          _I('height: 150px') +
          _I('margin: 0 10px 10px 0') +
        '}' +
        '.eager-photoswipe-gallery img {' +
          _I('position: absolute') +
          _I('top: 0') +
          _I('right: 0') +
          _I('bottom: 0') +
          _I('left: 0') +
          _I('margin: auto') +
        '}' +
      '}' +
    '</style>';

    if (!maxImages || maxImages > options.preloadedImages.length) {
      maxImages = options.preloadedImages.length;
    }

    for (i = 0; i < maxImages; i++) {
      a = document.createElement('a');
      a.href = options.preloadedImages[i].src;
      a.target = '_blank';

      img = document.createElement('img');
      img.src = _thumbnailURL(options.preloadedImages[i].src, 200, 150);
      img.alt = img.title = options.preloadedImages[i].title || '';
      img.setAttribute('data-pswp-image-index', i);

      options.preloadedImages[i]._img = img;
      options.preloadedImages[i].msrc = img.src;

      _addEventListener(img, 'click', function(event) {
        event.stopPropagation();
        event.preventDefault();

        helper.openPhotoSwipe(options.preloadedImages, {
          index: parseInt(this.getAttribute('data-pswp-image-index'), 10),

          getThumbBoundsFn: _getThumbBoundsFnForImages(options.preloadedImages)
        });

        return false;
      });

      a.appendChild(img);
      gallery.appendChild(a);
    }

    location.appendChild(gallery);

    helper.prepareOpenFromHash(options.preloadedImages);
  }

  helper.setupButtonDisplay = function(location, options) {
    var button, buttonImage, span;

    span = document.createElement('span');
    span.innerText = options.buttonText || 'Open image gallery...';

    button = document.createElement('button');
    button.className = 'eager-photoswipe-button';

    buttonImage = new Image();
    buttonImage.src = _thumbnailURL(options.preloadedImages[0].src, 200, 150);

    button.appendChild(buttonImage);
    button.appendChild(span);

    location.innerHTML = '' +
    '<style>' +
      '.eager-photoswipe-button {' +
        _I('position: relative') +
        _I('-webkit-font-smoothing: antialiased') +
        _I('text-rendering: optimizeLegibility') +
        _I('-webkit-tap-highlight-color: transparent') +
        _I('user-select: none') +
        _I('-webkit-appearance: none') +
        _I('-moz-appearance: none') +
        _I('appearance: none') +
        _I('display: inline-block') +
        _I('cursor: pointer') +
        _I('border: 0') +
        _I('border-radius: .1875em') +
        _I('font-size: 1em') +
        _I('margin: 0') +
        _I('padding: 0') +
        _I('text-align: center') +
        _I('font-family: inherit') +
        _I('font-weight: 400') +
        _I('letter-spacing: .04em') +
        _I('text-indent: @letter-spacing') +
        _I('text-decoration: none') +
        _I('overflow: hidden') +
      '}' +
      '.eager-photoswipe-button img {' +
        _I('position: absolute') +
        _I('top: -99em') +
        _I('right: -99em') +
        _I('bottom: -99em') +
        _I('left: -99em') +
        _I('margin: auto') +
        _I('min-width: 100%') +
        _I('min-height: 100%') +
        _I('margin: auto') +
        _I('-webkit-filter: blur(.25em)') +
      '}' +
      '.eager-photoswipe-button span {' +
        _I('display: block') +
        _I('padding: 1em 2.5em') +
        _I('border-radius: .1875em') +
        _I('position: relative') +
        _I('background: rgba(0, 0, 0, .66)') +
        _I('color: #fff') +
      '}' +
    '</style>';

    location.appendChild(button);

    _addEventListener(button, 'click', function() {
      helper.openPhotoSwipe(options.preloadedImages);
    });

    helper.prepareOpenFromHash(options.preloadedImages);
  };

  helper.createFromExistingImages = function(options) {
    var location, imgs, imgsToLoad, i, image, images, photoSwipe;

    try {
      if (options.location) {
        location = document.querySelector(options.location);
      }
    } catch (e) {}

    if (!location) {
      return;
    }

    imgs = location.getElementsByTagName('img');

    if (!imgs.length) {
      return;
    }

    images = [];

    for (i = 0; i < imgs.length; i++) {
      if (imgs[i].src) {
        image = {
          _img: imgs[i],
          src: imgs[i].src,
          msrc: imgs[i].src,
          title: imgs[i].title || imgs[i].alt
        };

        if (imgs[i].naturalWidth && imgs[i].naturalHeight) {
          image.w = imgs[i].naturalWidth;
          image.h = imgs[i].naturalHeight;
        }

        images.push(image);
      }
    }

    helper.preloadImages(images, function(preloadedImages){
      var i;

      for (i = 0; i < preloadedImages.length; i++) {
        preloadedImages[i]._img.setAttribute('data-pswp-image-index', i);

        _addEventListener(preloadedImages[i]._img, 'click', function(event) {
          event.stopPropagation();
          event.preventDefault();

          helper.openPhotoSwipe(images, {
            index: parseInt(this.getAttribute('data-pswp-image-index'), 10),

            getThumbBoundsFn: _getThumbBoundsFnForImages(preloadedImages)
          });

          return false;
        });

        preloadedImages[i]._img.style.cursor = 'pointer';
      }

      helper.prepareOpenFromHash(preloadedImages);
    });
  };

  helper.openPhotoSwipe = function(images, options) {
    options = options || {};
    options.index = options.index || 0;
    options.galleryUID = helperGalleryUID;

    var photoSwipe = new PhotoSwipe(helper.pswpElement, PhotoSwipeUI_Default, images, options);
    photoSwipe.init();
  };
};

return PhotoSwipeInstallHelper;

});
