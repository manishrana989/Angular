function goalDirective($timeout, $compile,$interval,PRODUCTION_FLOOR) {
    var template = "views/custom/productionFloor/goal/goal.html";
    var controller = function ($scope, LeaderMESservice) {
        

        
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            start: "=",
            maximum: "=",
            blue: "=",
            black: "=",
            goalname:"="
        },
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('goalDirective', goalDirective);