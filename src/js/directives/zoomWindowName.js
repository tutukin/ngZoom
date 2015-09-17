angular.module('ngZoom').directive('zoomWindowName',[
    function () {
        return {
            restrict    : 'A',
            link        : link
        };

        function link (scope, iElement, iAttrs) {
            iElement.addClass('zoom-window');
        }
    }
]);
