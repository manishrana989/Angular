function licenseModule() {

    const template = 'js/components/licenseModule/licenseModule.html';

    const controller = function ($scope, LeaderMESservice, LicenseService) {

        const licenseModuleCtrl = this;
        licenseModuleCtrl.viewChild = true;
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        var getData = function(){
            licenseModuleCtrl.message = "";
            if (licenseModuleCtrl.loading){
                return;
            }
            else if (!$scope.moduleId || $scope.moduleId == ''){
                licenseModuleCtrl.viewChild = true;
                return;
            }
            licenseModuleCtrl.viewChild = true;
            licenseModuleCtrl.loading = true;
            LeaderMESservice.customAPI('CheckModulesLicenses',{ModulesID : [$scope.moduleId]}).then(function(response){
                LicenseService.checkLicenseModule(response,$scope.moduleId,licenseModuleCtrl);
                licenseModuleCtrl.loading = false;
            },function(){
                licenseModuleCtrl.loading = false;
            });
        };

        $scope.$watch('moduleId',function(newValue,oldValue){
            getData();
        });

        getData();
    };

    return {
        transclude: true,
        restrict: "EA",
        templateUrl: template,
        scope: {
            moduleId : "@",
            mode : "="
        },
        controller: controller,
        controllerAs: "licenseModuleCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('licenseModule', licenseModule);
