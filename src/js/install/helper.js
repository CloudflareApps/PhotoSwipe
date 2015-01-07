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

var PhotoSwipeInstallHelper = function() {
  var helper, pswpTemplate;

  helper = this;

  pswpTemplate = '<div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div>';

  helper.init = function(location, options) {
    var images, i, image, leftToLoad;

    // Ensure images have images
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

    leftToLoad = images.length;

    for (i = 0; i < images.length; i++) {
      image = new Image();

      (function(i){
        image.onload = function() {
          leftToLoad -= 1;

          images[i].h = this.height;
          images[i].w = this.width;

          if (leftToLoad <= 0) {
            helper.setupGallery(location, images);
          }
        };

        image.src = images[i].src;
      })(i);
    }
  };

  helper.setupGallery = function(location, images) {
    var pswpElement, images, gallery, options;

    pswpElement = document.createElement('div');
    pswpElement.className = 'pswp';
    pswpElement.setAttribute('tabindex', '-1');
    pswpElement.setAttribute('role', 'dialog');
    pswpElement.setAttribute('aria-hidden', 'true');
    pswpElement.innerHTML = pswpTemplate;

    location.appendChild(pswpElement);

    // TODO - allow some of these to be configurable by installee
    options = {
      index: 0
    };

    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, images, options);
    gallery.init();
  };
};

return PhotoSwipeInstallHelper;

});
