function editMobileDirective(LeaderMESservice) {

    var template = 'views/custom/appView/editMobile.html';

    var controller = function ($scope, LeaderMESservice) {
        editMobileCtrl = this;
        editMobileCtrl.data = $scope.data;
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        editMobileCtrl.dataSorted = false;
        $scope.isShiftReport = $scope.data.title ==="MANAGER_APP_SHIFT_REPORT";
        var dynamicSort = function (property) {
            var sortOrder = 1;

            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }

            return function (a, b) {
                if (sortOrder == -1) {
                    return b[property].localeCompare(a[property]);
                } else {
                    return a[property].localeCompare(b[property]);
                }
            }
        };

        $scope.$watch('editMobileCtrl.data.params', function (old, newV) {
            if (old && !editMobileCtrl.dataSorted) {
                editMobileCtrl.dataSorted = true;
                if (editMobileCtrl.localLanguage) {
                    editMobileCtrl.data.params.sort(dynamicSort('LName'));
                } else {
                    editMobileCtrl.data.params.sort(dynamicSort('EName'));
                }
            }
        });

        $scope.displayParam = function(param){
            if($scope.isShiftReport){
                return param.HasGraph
            }
            return true
        }

        editMobileCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            data: "="
        },
        controller: controller,
        controllerAs: "editMobileCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('editMobileDirective', editMobileDirective);