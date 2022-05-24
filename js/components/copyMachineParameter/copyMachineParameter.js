
const copyMachineParameters = function ($timeout, LeaderMESservice) {
    var template = "js/components/copyMachineParameter/copyMachineParameter.html";
    var controller = function($scope,LeaderMESservice, toastr, notify, $filter,toastr){
        var copyMachineParameterCtrl = this;
        console.log($scope.action);
        copyMachineParameterCtrl.rtl = LeaderMESservice.isLanguageRTL();
        copyMachineParameterCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        LeaderMESservice.customAPI('GetAllMachinesForMachineType',{ID : $scope.machineTypeId}).then(function(response){
            copyMachineParameterCtrl.machines = response.machines;
        });

        copyMachineParameterCtrl.copyMachineSettings = function(){
            if (copyMachineParameterCtrl.loading){
                return;
            }
            copyMachineParameterCtrl.loading = true;
            var machineIds = [];
            if (copyMachineParameterCtrl.applyTo == 'allMachines'){
                machineIds = _.map(copyMachineParameterCtrl.machines,'Id');
            }
            else{
                machineIds = _.map(_.filter(copyMachineParameterCtrl.machines,{selected : true}),'Id');
            }
            if (machineIds.length == 0){
                return;
            }
            
            LeaderMESservice.customAPI('DuplicateControllerField',
            {
                Controllers : [$scope.id],
                Machines : machineIds
            }).then(function(response){
                copyMachineParameterCtrl.loading = false;
                if (response.error !== null) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                $scope.close();
                toastr.clear();
                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
            });
        };
    }

    return {
        restrict: "EA",
        scope: {
            id: '=',
            machineTypeId: '=',
            action : "=",
            close : "="
        },
        controller:  controller,
        templateUrl: template,
        controllerAs : 'copyMachineParameterCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('copyMachineParameters', copyMachineParameters)