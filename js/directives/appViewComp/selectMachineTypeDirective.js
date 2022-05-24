function selectMachineType(LeaderMESservice) {

    var template = 'views/custom/appView/selectMachineType.html';

    var controller = function ($scope, LeaderMESservice, $rootScope) {
        selectMachineTypeCtrl = this;
        selectMachineTypeCtrl.data = $scope.data;
        selectMachineTypeCtrl.save = $scope.save;
        selectMachineTypeCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        if ($scope.screenView == "machineType"){
            LeaderMESservice.customGetAPI('GetMachineTypesAndMachines').then(function(response){
                selectMachineTypeCtrl.data.machineTypes = response.MachineTypes;
            });
            selectMachineTypeCtrl.getMachineParams = function(){
                selectMachineTypeCtrl.data.selectedMachineType.Machines.forEach(function(machine){
                    machine.selected = false;
                });
                selectMachineTypeCtrl.data.selectedMachine.selected = true;
                if (!selectMachineTypeCtrl.data.selectedMachine || selectMachineTypeCtrl.data.selectedMachine.Id == undefined){
                    return;
                }
                const promises = [];
                promises.push(LeaderMESservice.customAPI( $scope.getFieldParametersApi,
                    {"MachineID": selectMachineTypeCtrl.data.selectedMachine.Id}));
                if ($scope.getCustomParametersApi){
                    promises.push(LeaderMESservice.customAPI($scope.getCustomParametersApi,
                        {"machine":{"Id":selectMachineTypeCtrl.data.selectedMachine.Id}}))
                }
                Promise.all(promises).then(function(res){
                    const response = res[0];
                    selectMachineTypeCtrl.data.params = response[$scope.fieldParameters];
                    if ($scope.customParams) {
                        const customData = res[1] && res[1].ResponseDataTable &&
                            res[1].ResponseDataTable[0] || [];
                        $scope.customParams.forEach(customParam => {
                            const foundCustom = _.find(customData,{ParamID: customParam.ID});
                            selectMachineTypeCtrl.data.params.push({
                                CurrentValue: 0,
                                DisplayOrder: foundCustom && foundCustom.DisplayOrder || null,
                                EName: customParam.DisplayName,
                                FieldName: customParam.Name,
                                HValue: null,
                                HasGraph: false,
                                Id: customParam.ID,
                                InMobile: false,
                                IsActive: true,
                                LName: customParam.DisplayName,
                                LValue: 0,
                                MachineID: 0,
                                OpAppBatchGraph: false,
                                TargetValue: null,
                                TypeID: 1,
                                custom: true,
                            });
                        });
                    }
                    if (selectMachineTypeCtrl.localLanguage) {
                        selectMachineTypeCtrl.data.params.sort(dynamicSort('LName'));
                    } else {
                        selectMachineTypeCtrl.data.params.sort(dynamicSort('EName'));
                    }
                    selectMachineTypeCtrl.data.machineParams = $scope.updateMachineParams(response[$scope.fieldParameters] || []);
                });
            }
        }
        else{
            LeaderMESservice.customAPI('GetDepartmentMachine',{"DepartmentID":0}).then(function(response){
                selectMachineTypeCtrl.data.departments = response.DepartmentMachine;
                // selectMachineTypeCtrl.data.machineTypes = response.MachineTypes;
            });
            selectMachineTypeCtrl.getMachineParams = function(){
                selectMachineTypeCtrl.data.departments.forEach(function(department){
                    department.expanded = false
                    department.Value.forEach(function(machine){
                        machine.selected = false;
                    });
                });
                selectMachineTypeCtrl.data.selectedMachine.selected = true;
                selectMachineTypeCtrl.data.selectedDepartment.expanded = true;
                $scope.updateMachineParams();
            };
        }
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

        selectMachineTypeCtrl.toggleDepartment = function(department){
            department.Value.forEach(function(machine){
                machine.selected = department.selected;
            })
        }
        $rootScope.$on("orderDifferentTestSameMachine", () => {
            selectMachineTypeCtrl.getMachineParams();
        })
     };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            data : "=",
            save : "=",
            updateMachineParams : "=",
            getFieldParametersApi : "=",
            getCustomParametersApi : "=",
            fieldParameters : "=",
            type: "=",
            screenView : "=",
            hideApplyAll: "=",
            customParams: '=',
        },
        controller: controller,
        controllerAs: "selectMachineTypeCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('selectMachineType', selectMachineType);