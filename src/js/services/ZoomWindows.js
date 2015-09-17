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
