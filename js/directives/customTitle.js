angular
    .module('LeaderMESfe')
    .directive("customTitle", function ($timeout) {
        return {
            link: function(scope, element, attrs) {
                $timeout(function(){
                    $(element).attr('title',$(element)[0].innerText);
                },1000);
                scope.$watch(
                    function() { return $(element)[0].innerText },
                    function(newVal, oldVal) { 
                        $(element).attr('title',$(element)[0].innerText);
                     }
                );
            }
        }
    });