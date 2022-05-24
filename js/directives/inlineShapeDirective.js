var inlineShapeDirective = function () {

    var Template = `<span class='{{shapeCssClass}}' style="height: 1em; width: 1em; display: inline-block" ng-style="{'background-color' : '{{shapeColor}}' }"></span> <span> {{inlineText}} </span> `;

    function controller($scope, shiftService, $timeout, $filter, LeaderMESservice, $localStorage, $rootScope, $state) {}

    return {
        restrict: "E",
        template: Template,
        controller: controller,
        scope: {
            shapeCssClass: '=',
            inlineText: '=',
            shapeColor: '=',
        }
    };

};


angular.module('LeaderMESfe').directive('inlineShapeDirective', inlineShapeDirective);