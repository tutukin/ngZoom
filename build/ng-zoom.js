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

angular.module('ngZoom').factory('ZoomLens', [
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

angular.module('ngZoom').factory('ZoomLensW', [
    'DOMImage',
    function (DOMImage) {
        return {
            create: create
        };

        function create () {
            var src, dst;

            var bgUrl = null;
            var bgUrlDefault = null;
            var getZoomWindowSize = null;

            return {
                src: function (_src, cb) {
                    src = DOMImage.create(_src, function (img) {
                        cb(img.src);
                    });
                },

                dst: function (_dst, cb) {
                    bgUrl = null;

                    dst = DOMImage.create(_dst, function (img) {
                        cb(img.src);
                    });
                },

                setZoomWindowSizeGetter: function (size) {
                    getZoomWindowSize = size;
                },

                move: function (x, y) {
                    var w = src.width();
                    var h = src.height();
                    if ( ! w || ! h ) return;

                    //zoomWindowSize = 0.75 * ( w > h ? h : w );
                    var zoomWindowSize = getZoomWindowSize();

                    var dx = x - src.left();
                    var dy = y - src.top();
                    lensX = dx - 0.5 * zoomWindowSize.width;
                    lensY = dy - 0.5 * zoomWindowSize.height;

                    var W = dst.naturalWidth();
                    var H = dst.naturalHeight();

                    if ( ! W || ! H ) {
                        return _fallbackCase(src, w, h, zoomWindowSize, dx, dy);
                    }
                    else {
                        return _normalCase(src, w, h, W, H, zoomWindowSize, dx, dy);
                    }
                }
            };

            function _normalCase (src, w, h, W, H, zoomWindowSize, dx, dy) {
                var scale = W / w;
                var bgX = 0.5*zoomWindowSize.width  - scale * dx;
                var bgY = 0.5*zoomWindowSize.height - scale * dy;

                if ( bgX < zoomWindowSize.width - W )  bgX = zoomWindowSize.width - W;
                if ( bgX > 0 ) bgX = 0;
                if ( bgY < zoomWindowSize.height - H ) bgY = zoomWindowSize.height - H;
                if ( bgY > 0 ) bgY = 0;

                return {
                    pos: {
                        x: bgX,
                        y: bgY
                    }
                };
            }

            function _fallbackCase (src, w, h, zoomWindowSize, dx, dy) {
                var W = src.naturalWidth();
                var H = src.naturalHeight();
                var scale = W / w;
                var bgXSize, bgX, bgY;

                if ( scale < 2 ) {
                    bgXSize = 2.0 * w;
                    scale = 2.0;
                }

                bgX = 0.5*zoomWindowSize.width  - scale * dx;
                bgY = 0.5*zoomWindowSize.height - scale * dy;

                if ( bgX < zoomWindowSize.width - scale*w )  bgX = zoomWindowSize.width - scale*w;
                if ( bgX > 0 ) bgX = 0;
                if ( bgY < zoomWindowSize.height - scale*h ) bgY = zoomWindowSize.height - scale*h;
                if ( bgY > 0 ) bgY = 0;

                return {
                    pos: {
                        x: bgX,
                        y: bgY
                    },
                    size: bgXSize
                };
            }
        }
    }
]);

angular.module('ngZoom').factory('ZoomWindows', [
    function () {
        var windows = {};

        return {
            set: function (name, scope) {
                windows[name] = scope;
            },

            get: function (name) {
                return windows[name];
            },

            drop: function (name) {
                delete windows[name];
            }
        };
    }
]);

angular.module('ngZoom').directive('zoom', [
  'ZoomLens', 'ZoomLensW', 'DOMImage', 'ZoomWindows',
  function (ZoomLens, ZoomLensW, DOMImage, ZoomWindows) {
    return {
      restrict: 'A',
      scope:  {
        zoom: '@',
        zoomFull: '@',
        zoomWindowName: '@'
      },
      link: link,
      templateUrl: 'partials/ng-zoom.html'
    };

    function link (scope, iElement, iAttrs) {
      iElement.addClass('zoom');

      if ( scope.zoomWindowName ) {
          _linkWindowed(scope, iElement, iAttrs);
      }
      else {
          _linkInstant(scope, iElement, iAttrs);
      }

    }





    function _linkWindowed (scope, iElement, iAttrs) {
        var zoomWindow = null;
        var lens = ZoomLensW.create();

        scope.background = 'transparent';

        scope.$watch('zoomWindowName', function (name) {
            if ( ! name ) return;
            zoomWindow = ZoomWindows.get(name);
            lens.setZoomWindowSizeGetter(zoomWindow.size);
        });

        scope.$watch('zoom', function (url) {
            if ( ! url ) return;
            lens.src(iElement.find('img'), zoomWindow.setDefaultBackgroundUrl);
        });

        scope.$watch('zoomFull', function (url) {
            if ( ! url ) return;
            lens.dst(url, zoomWindow.setBackgroundUrl);
        });

        iElement.on('mouseover', function () {
            zoomWindow.show();
        });

        iElement.on('mouseout', function () {
            zoomWindow.hide();
        });

        iElement.on('mousemove', function (ev) {
          var data = lens.move(ev.clientX, ev.clientY);
          if ( data.pos ) zoomWindow.setBackgroundPosition(data.pos);
          if ( data.size ) zoomWindow.setBackgroundSize(data.size);
        });
    }






    function _linkInstant (scope, iElement, iAttrs) {
        var lens = ZoomLens.create();

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

angular.module('ngZoom').directive('zoomWindow',[
    'ZoomWindows',
    function (ZoomWindows) {
        return {
            restrict    : 'A',
            scope       : {},
            link        : link
        };

        function link (scope, iElement, iAttrs) {
            var name = iAttrs.zoomWindow;

            iElement.addClass('zoom-window');
            iElement.addClass('hidden');
            ZoomWindows.set(name, scope);

            var style = {
                'background-repeat': 'no-repeat',
                'background-position': '0 0'
            };

            var defaultBackgroundUrl;
            var backgroundUrl;

            scope.show = function () {
                iElement.removeClass('hidden');
            };

            scope.hide = function () {
                iElement.addClass('hidden');
            };

            scope.size = function () {
                return iElement[0].getBoundingClientRect();
            };

            scope.setBackgroundUrl = function (url) {
                backgroundUrl = url;
                _updateStyle('background-image', _url(url));
            };

            scope.setDefaultBackgroundUrl = function (url) {
                defaultBackgroundUrl = url;
                url = backgroundUrl || defaultBackgroundUrl;
                _updateStyle('background-image', _url(url));
            };

            scope.setBackgroundSize = function (w) {
                _updateStyle('background-size', _pos(w, 'auto'));
            };

            scope.setBackgroundPosition = function (p) {
                _updateStyle('background-position', _pos(p.x, p.y));
            };

            function _updateStyle (key, value) {
                style[key] = value;
                iElement.css(style);
            }

        }

        function _px (value) {
            return typeof value === 'number' ?
                value + 'px' :
                value;
        }

        function _pos (x, y) {
            return _px(x) + ' ' + _px(y);
        }

        function _url( ref ) {
            return 'url('+ ref +')';
        }
    }
]);
