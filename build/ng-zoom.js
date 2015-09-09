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

angular.module('ngZoom').factory('ZOOMLens', [
    'DOMImage',
    function (DOMImage) {
        return {
            create: create
        };

        function create () {
            var src, dst;

            var isHidden = false;
            var lensX = null;
            var lensY = null;
            var lensSize = null;
            var bgX = null;
            var bgY = null;
            var bgUrl = null;
            var bgUrlDefault = null;
            var bgXSize = null;

            return {
                src: function (_src) {
                    src = DOMImage.create(_src, function (img) {
                        bgUrlDefault = img.src;
                        bgXSize = null;
                    });
                },

                dst: function (_dst) {
                    bgUrl = null;

                    dst = DOMImage.create(_dst, function (img) {
                      bgUrl = img.src;
                      bgXSize = null;
                    });
                },

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
                    var scale;

                    if ( ! W || ! H ) {
                        W = src.naturalWidth();
                        H = src.naturalHeight();
                        scale = W / w;

                        if ( scale < 2 ) {
                            bgXSize = 2.0 * w;
                            scale = 2.0;
                        }

                        bgX = hls - scale * dx;
                        bgY = hls - scale * dy;

                        bgUrl = null;
                    }
                    else {
                        scale = W / w;
                        bgX = hls - scale * dx;
                        bgY = hls - scale * dy;
                    }
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
                        y: bgY,
                        url: bgUrl || bgUrlDefault
                    }
                };

                if ( bgXSize ) {
                    state.background.sizeX = bgXSize;
                }

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

      var lens = ZOOMLens.create();

      scope.$watch('zoom', function (url) {
          if ( ! url ) return;
          lens.src(iElement.find('img'));
      });

      scope.$watch('zoomFull', function (url) {
          if ( ! url ) return;
          lens.dst(url);
      });

      scope.updateStyle = function () {
        var state = lens.state();

        scope.style = {
          transform: _translate(state.lens.x, state.lens.y),
          width: _px(state.lens.size),
          height:_px(state.lens.size),
          background: 'transparent',
          'background-position': _px(state.background.x) + ' ' + _px(state.background.y),
          'background-repeat': 'no-repeat'
        };

        if ( state.background.url ) {
            scope.style['background-image'] = 'url('+state.background.url+')';
        }

        if ( state.background.sizeX ) {
            scope.style['background-size'] = '' + _px(state.background.sizeX) + ' auto';
        }

        // FIXME: this is for debugging!
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
