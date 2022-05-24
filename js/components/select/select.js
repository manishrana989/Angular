function selectCustom() {

    var controller = function ($scope, $compile, LeaderMESservice, actionService, $modal) {
        var selectCustomCtrl = this;
        
    };

    return {
        restrict: "A",
        templateUrl: 'js/components/select/select.html',
        scope: {
            field: "=",
            selectValue: '=',
            options:'=',
            text: '=',
            value: '=',
        },
        controller: controller,
        controllerAs: 'selectCustomCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('selectCustom', selectCustom);