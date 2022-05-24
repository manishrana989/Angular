angular
    .module('LeaderMESfe')
    .directive("customScroll", function () {
        return {
            scope: {
                callback: '='
            },
            link: function(scope, element, attrs) {
                $(element).on('scroll', function(evt){
                    scope.callback(element.scrollTop(),element.scrollLeft())
                });
            }
        }
    });