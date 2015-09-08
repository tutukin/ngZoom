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
      templateUrl: 'ng-zoom.html'
    };

    function link (scope, iElement, iAttrs) {
      iElement.addClass('zoom');

      var src = DOMImage.create(iElement.find('img'));
      var dst = DOMImage.create(scope.zoomFull, function (img) {
        scope.background = 'url('+img.src+')';
      });

      var lens = ZOOMLens.create(src, dst);

      scope.updateStyle = function () {
        var state = lens.state();

        scope.style = {
          transform: _translate(state.lens.x, state.lens.y),
          width: _px(state.lens.size),
          height:_px(state.lens.size),
          background: scope.background,
          'background-position': _px(state.background.x) + ' ' + _px(state.background.y)
        };

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
