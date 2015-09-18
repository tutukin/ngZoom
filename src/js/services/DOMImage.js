angular.module('ngZoom').factory('DOMImage', [
  '$window',
  function ($window) {
    return {
      create: create
    };

    function create (src, cb) {
      var img = null;
      var _sizes = {
        actual:   null,
        natural: null
      };

      if (typeof src === 'string' ) {
        $window.requestAnimationFrame(function () {
          img = new Image();
          if (cb) {
            img.onload = function () {
              cb(img);
            };
          }
          img.src = src;
        });
      }
      else {
        img = src.length ?
          src[0] :
          src;
        cb(img);
      }

      return {
        height: function height () {
            if ( ! isReady() ) return null;
            return img.getBoundingClientRect().height;
        },
        width: function width () {
            if ( ! isReady() ) return null;
            return img.getBoundingClientRect().width;
        },
        top: function top () {
            if ( ! isReady() ) return null;
            return img.getBoundingClientRect().top;
        },
        left: function left () {
            if ( ! isReady() ) return null;
            return img.getBoundingClientRect().left;
        },
        naturalHeight: function naturalHeight () {
            if ( ! isReady() ) return null;
            return img.naturalHeight;
        },
        naturalWidth: function naturalWidth () {
            if ( ! isReady() ) return null;
            return img.naturalWidth;
        },

        isReady: isReady
      };

      function isReady () {
        return img !== null && img.complete;
      }
    }
  }
]);
