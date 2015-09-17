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
