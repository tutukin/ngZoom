angular.module('ngZoom.Templates', ['partials/ng-zoom.html']);

angular.module("partials/ng-zoom.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/ng-zoom.html",
    "<div class=\"zoom-wrapper\">\n" +
    "  <img class=\"zoom-small\" ng-src=\"{{zoom}}\"/>\n" +
    "  <div class=\"lens\" ng-show=\"isLensVisible\" ng-style=\"style\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module('ngZoom', ['ngZoom.Templates']);

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

angular.module('ngZoom').factory('ZOOMLens', [
  function () {
    return {
      create: create
    };

    function create (src, dst) {
      var isHidden = false;
      var lensX = null;
      var lensY = null;
      var lensSize = null;
      var bgX = null;
      var bgY = null;

      return {
        show: function () {
          isHidden = false;
        },

        hide: function () {
          isHidden = true;
        },

        move: function (x, y) {
          var w = src.width();
          var h = src.height();
          if ( ! w || ! h ) return;

          lensSize = 0.75 * ( w > h ? h : w );

          var hls = 0.5 * lensSize;
          var dx = x - src.left();
          var dy = y - src.top();
          lensX = dx - hls;
          lensY = dy - hls;

          var W = dst.naturalWidth();
          var H = dst.naturalHeight();
          if ( ! W || ! H ) return;

          bgX = hls - W * dx / w;
          bgY = hls - W * dy / w;
        },

        state: _state
      };

      function _state () {
          var state = {
            isHidden: isHidden,
            isShown: !isHidden,

            lens: {
              x: lensX,
              y: lensY,
              size: lensSize
            },

            background: {
              x: bgX,
              y: bgY
            }
          };

          return state;
        }
    }
    return Lens;
  }
]);

angular.module('ngZoom').directive('zoom', [
  'ZOOMLens', 'DOMImage',
  function (ZOOMLens, DOMImage) {
    return {
      restrict: 'A',
      scope:  {
        zoom: '@',
        zoomFull: '@'
      },
      link: link,
      templateUrl: 'partials/ng-zoom.html'
    };

    function link (scope, iElement, iAttrs) {
      iElement.addClass('zoom');

      var src = DOMImage.create(iElement.find('img'));
      var dst = DOMImage.create(scope.zoomFull, function (img) {
        scope.background = 'url('+img.src+')';
      });

      var lens = ZOOMLens.create(src, dst);

      scope.updateStyle = function () {
        var state = lens.state();

        scope.style = {
          transform: _translate(state.lens.x, state.lens.y),
          width: _px(state.lens.size),
          height:_px(state.lens.size),
          background: scope.background,
          'background-position': _px(state.background.x) + ' ' + _px(state.background.y)
        };

        scope.isLensVisible = state.isShown;
      };

      scope.background = 'transparent';

      iElement.on('mouseover', function () {
        lens.show();
        scope.$apply('updateStyle()');
      });

      iElement.on('mouseout', function () {
        lens.hide();
        scope.$apply('updateStyle()');
      });

      iElement.on('mousemove', function (ev) {
        lens.move(ev.clientX, ev.clientY);
        scope.$apply('updateStyle()');
      });
    }

    function _px (value) {
      return value + 'px';
    }

    function _translate (x, y) {
      return 'translate(' + _px(x) + ', ' + _px(y) + ')';
    }
}]);
