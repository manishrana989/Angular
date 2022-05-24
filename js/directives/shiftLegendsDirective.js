function shiftLegendsDirective(LeaderMESservice,GLOBAL) {
    var template = "views/custom/productionFloor/common/shiftLegends.html";

    var controller = function ($scope) {
        LeaderMESservice.customAPI('GetMachineStatusDetails',{}).then(function(response){
            $scope.legends = response.MachineStatus
        });
        $scope.openInfo = function () {
            window.open(GLOBAL.shift, "_blank");
        };
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
        },
        controller: controller,
        controllerAs: "legendsCtrl",
    };
}

angular.module("LeaderMESfe").directive("shiftLegendsDirective", shiftLegendsDirective);
