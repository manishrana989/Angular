
const copyMachineSettings = function ($timeout, LeaderMESservice) {
    var template = "js/components/copyMachineSettings/copyMachineSettings.html";
    var controller = function($scope,LeaderMESservice, toastr, notify, $filter,toastr){
        var copyMachineSettingsCtrl = this;
        console.log($scope.action);
        copyMachineSettingsCtrl.rtl = LeaderMESservice.isLanguageRTL();
        copyMachineSettingsCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        LeaderMESservice.customAPI('GetAllMachinesForMachineType',{ID : $scope.machineTypeId}).then(function(response){
            copyMachineSettingsCtrl.machines = response.machines;
            var currentMachine = _.find(copyMachineSettingsCtrl.machines, {Id : $scope.machineId});

            if (currentMachine) {
                currentMachine.selected = true;
            }
            
        });

        copyMachineSettingsCtrl.copyMachineSettings = function(){
            if (copyMachineSettingsCtrl.loading){
                return;
            }
            copyMachineSettingsCtrl.loading = true;
            var machineIds = [];
            if (copyMachineSettingsCtrl.applyTo == 'allMachines'){
                machineIds = _.map(copyMachineSettingsCtrl.machines,'Id');
            }
            else{
                machineIds = _.map(_.filter(copyMachineSettingsCtrl.machines,{selected : true}),'Id');
            }
            if (machineIds.length == 0){
                return;
            }
            
            LeaderMESservice.customAPI('DuplicateMachine',
            {
                sourceMachineID : $scope.machineId,
                targetMachineID : machineIds
            }).then(function(response){
                copyMachineSettingsCtrl.loading = false;
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
            machineId: '=',
            machineTypeId: '=',
            action : "=",
            close : "="
        },
        controller:  controller,
        templateUrl: template,
        controllerAs : 'copyMachineSettingsCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('copyMachineSettings', copyMachineSettings)