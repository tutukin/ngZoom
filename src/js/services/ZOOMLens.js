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

            /*
            var
            var dst = DOMImage.create(scope.zoomFull, function (img) {
              scope.background = 'url('+img.src+')';
            });
            */

            return {
                src: function (_src) {
                    src = DOMImage.create(_src);
                },

                dst: function (_dst) {
                    bgUrl = null;

                    dst = DOMImage.create(_dst, function (img) {
                      bgUrl = img.src;
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
                        y: bgY,
                        url: bgUrl
                    }
                };

                return state;
            }
        }
        return Lens;
    }
]);
