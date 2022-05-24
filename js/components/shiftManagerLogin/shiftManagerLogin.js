function shiftManagerLogin() {

    var template = 'js/components/shiftManagerLogin/shiftManagerLogin.html';

    var controller = function ($scope, LeaderMESservice, notify, toastr, $filter,$rootScope,$sessionStorage) {
        var shiftManagerLoginCtrl = this;
        shiftManagerLoginCtrl.rtl = LeaderMESservice.isLanguageRTL();

        shiftManagerLoginCtrl.updateShiftManager = function () {
            if (shiftManagerLoginCtrl.loading) {
                return;
            }
            if (!shiftManagerLoginCtrl.workerId) {
                return;
            }
            LeaderMESservice.customAPI('UpdateShiftManager',
            {
                DepartmentID : $scope.departmentId,
                WorkerID : shiftManagerLoginCtrl.workerId
            }).then(function(response){
                shiftManagerLoginCtrl.loading = false;
                if (response.error !== null) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                var request = { DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID };
                LeaderMESservice.customAPI("GetMachineCubeData", request).then(function(response){
                    $rootScope.$broadcast('managerLogin',{AllowShiftManagerLogin:true,ShiftManager:response && response.ShiftManager});
                });
                $scope.close();
                toastr.clear();
                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
            });
        }
    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            departmentId: "=",
            close: "="
        },
        controller: controller,
        controllerAs: "shiftManagerLoginCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('shiftManagerLogin', shiftManagerLogin);