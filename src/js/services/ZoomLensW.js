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
