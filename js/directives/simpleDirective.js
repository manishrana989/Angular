var simpleDirective = function () {
    return {
        template: "<h1>Made by a directive!</h1>"
    };
};
angular.module('LeaderMESfe').directive('simpleDirective', simpleDirective);
