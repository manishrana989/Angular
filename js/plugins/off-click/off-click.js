angular.module('offClick', ['ngTouch']).directive('offClick', function($document, $parse, $timeout) {
    return {
      restrict: 'A',
      compile: function(tElement, tAttrs) {
        var fn = $parse(tAttrs.offClick);
        
        return function(scope, iElement, iAttrs) {
          function eventHandler(ev) {
            if (iElement[0].contains(ev.target)) {
              $document.one('click touchend', eventHandler);
            } else {
              scope.$apply(function() {
                fn(scope);
              });
            }
          }
          scope.$watch(iAttrs.offClickActivator, function(activate) {
            if (activate) {
              $timeout(function() {
                // Need to defer adding the click handler, otherwise it would
                // catch the click event from ng-click and trigger handler expression immediately
                      $document.one('click touchend', eventHandler);
              });
            } else {
              $document.off('click touchend', eventHandler);
            }
          });
        };
      }
    };
  });