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
