function customDirective($timeout, $compile, $interval, PRODUCTION_FLOOR) {

    var controller = function ($scope, LeaderMESservice, customServices, $state, $rootScope, $sessionStorage, $timeout) {

        $scope.refreshTime = $sessionStorage.onlineRefreshTime || PRODUCTION_FLOOR.REFRESH_TIME;

        function init() {
            $rootScope.moduleId = null;

            if ($scope.content.subMenu && $scope.content.subMenu.SubMenuModuleID) {
                $rootScope.moduleId = $scope.content.subMenu.SubMenuModuleID;
            }
            else if ($scope.content.topMenu && $scope.content.topMenu.TopMenuModuleID) {
                $rootScope.moduleId = $scope.content.topMenu.TopMenuModuleID;
            }
            $scope.showBreadCrumb = true;
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            if ($state.current.name == "customFullView") {
                $scope.showBreadCrumb = false;
            }
            $timeout(() => {
                customServices.customGetCode($scope, $scope.content.subMenu.SubMenuTargetTYpe);
            }, 50);
        }

        init();
    };

    return {
        restrict: "E",
        template: '<ng-include src="templateUrl"></ng-include>',
        link: function (scope, element, attr) {
            if (scope.updateMachineData) {
                var updateData = $interval(function () {
                    scope.updateMachineData();
                }, scope.refreshTime);
                element.on('$destroy', function () {
                    $interval.cancel(updateData);
                });
            }
        },
        scope: {
            content: '='
        },
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('customDirective', customDirective);