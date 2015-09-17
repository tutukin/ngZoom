angular.module('ngZoom').factory('ZoomLensW', [
    'DOMImage', 'ZoomWindows',
    function (DOMImage, ZoomWindows) {
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

            var zoomWindow = null;

            return {
                src: function (_src) {
                    src = DOMImage.create(_src, function (img) {
                        zoomWindow.setBackgroundSrc(img.src);
                        bgUrlDefault = img.src;
                        bgXSize = null;
                    });
                },

                dst: function (_dst) {
                    bgUrl = null;

                    dst = DOMImage.create(_dst, function (img) {
                        zoomWindow.setBackgroundSrc(img.src);
                      bgUrl = img.src;
                      bgXSize = null;
                    });
                },

                zoomWindowName: function (name) {
                    zoomWindow = ZoomWindows.get(name);
                },

                show: function () {
                    //zoomWindow.isVisible = true;
                    zoomWindow.show();
                },

                hide: function () {
                    zoomWindow.hide();
                },

                move: function (x, y) {
                    var w = src.width();
                    var h = src.height();
                    if ( ! w || ! h ) return;

                    //lensSize = 0.75 * ( w > h ? h : w );
                    lensSize = zoomWindow.size();

                    var dx = x - src.left();
                    var dy = y - src.top();
                    lensX = dx - 0.5 * lensSize.width;
                    lensY = dy - 0.5 * lensSize.height;

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
                        bgX = 0.5*lensSize.width  - scale * dx;
                        bgY = 0.5*lensSize.height - scale * dy;
                    }

                    if ( bgX < lensSize.width - W )  bgX = lensSize.width - W;
                    if ( bgX > 0 ) bgX = 0;
                    if ( bgY < lensSize.height - H ) bgY = lensSize.height - H;
                    if ( bgY > 0 ) bgY = 0;

                    zoomWindow.setBackgroundPosition(bgX, bgY);
                },

                state: _state
            };

            function _state () {

                var state = {
                    isHidden: true,
                    isShown: false,

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
