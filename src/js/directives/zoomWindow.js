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

            scope.show = function () {
                iElement.removeClass('hidden');
            };

            scope.hide = function () {
                iElement.addClass('hidden');
            };

            scope.size = function () {
                return iElement[0].getBoundingClientRect();
            };

            scope.setBackgroundSrc = function (src) {
                style['background-image'] = 'url('+src+')';
                iElement.css(style);
            };

            scope.setBackgroundPosition = function (x, y) {
                style['background-position'] = x + 'px ' + y + 'px';
                iElement.css(style);
            };
        }
    }
]);
