angular.module('ngZoom').directive('zoom', [
  'ZoomLens', 'ZoomLensW', 'DOMImage',
  function (ZoomLens, ZoomLensW, DOMImage) {
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
        var lens = ZoomLensW.create();

        scope.background = 'transparent';

        scope.$watch('zoomWindowName', function (name) {
            if ( ! name ) return;
            lens.zoomWindowName(name);
        });

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

          scope.isLensVisible = state.isShown;
        };

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
