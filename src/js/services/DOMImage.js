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
          return _get('actual', 'height');
        },
        width: function width () {
          return _get('actual', 'width');
        },
        top: function top () {
          return _get('actual', 'top');
        },
        left: function left () {
          return _get('actual', 'left');
        },
        naturalHeight: function naturalHeight () {
          return _get('natural', 'height');
        },
        naturalWidth: function naturalWidth () {
          return _get('natural', 'width');
        },

        isReady: isReady
      };

      function isReady () {
        return img !== null && img.complete;
      }

      function _update () {
        if ( ! isReady() ) {
          _sizes.actual = null;
          _sizes.natural = null;
        }
        else {
          _sizes.actual = img.getBoundingClientRect();

          _sizes.natural = {
            width: img.naturalWidth,
            height: img.naturalHeight
          };
        }
      }

      function _get (type, key) {
        if ( typeof _sizes[type] === 'undefined' ) throw Error('unknown sizes type: ' + type);
        if ( _sizes[type] === null ) _update();

        return _sizes[type] ?
          _sizes[type][key] :
          null;
      }
    }
  }
]);
