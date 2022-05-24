function filterTableDirective() {

    var template = 'js/components/filterTable/filterTable.html';

    var controller = function ($scope, LeaderMESservice, $timeout) {
        var filterTableCtrl = this;

        filterTableCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        var kpiInput;

        var defaultData = {
            machineTypes: [],
            machines: [],
            machineStatues: [],
            machineAlarms: [
                {
                    ui_text: "PRODUCTION_TARGET_REACHED",
                    name: "productionTargetReached"
                },
                {
                    ui_text: "CYCLES_DETECTED_IN_NON_PRODUCTION_MODE",
                    name: "cyclesDetecedInNonProduction"
                }
            ],
            kpiInput: kpiInput
        }


        filterTableCtrl.machineStatues = defaultData.machineStatues;
    
        // $scope.initMachineDisplay = function () {
        //     $scope.allData.forEach(function (department) {
        //         if (department.DepartmentsMachine) {
        //             department.DepartmentsMachine.forEach(function (machine) {
        //                 machine.display = true;
        //             });
        //         }

        //     });
        // };

        // $scope.getFilterData = function () {
        //     $scope.allData.forEach(function (department) {
        //         if (department.DepartmentsMachine) {
        //             department.DepartmentsMachine.forEach(function (machine) {
        //                 $scope.getMachineTypes(machine);
        //                 $scope.getMachines(machine);
        //                 $scope.getMachineStatuses(machine);
        //             });
        //         }

        //     });
        // };

        // $scope.getMachineTypes = function (machine) {
        //     var machineTypeIndex = _.findIndex(machinesFiltersCtrl.machineTypes, { MachineTypeID: machine.MachineTypeID })
        //     if (machineTypeIndex < 0) {
        //         machinesFiltersCtrl.machineTypes.push({
        //             MachineTypeEName: machine.MachineTypeEName,
        //             MachineTypeID: machine.MachineTypeID,
        //             MachineTypeLName: machine.MachineTypeLName
        //         });
        //     }
        //     else {
        //         machinesFiltersCtrl.machineTypes[machineTypeIndex].MachineTypeEName = machine.MachineTypeEName;
        //         machinesFiltersCtrl.machineTypes[machineTypeIndex].MachineTypeLName = machine.MachineTypeLName;
        //     }
        // };

        // $scope.getMachines = function (machine) {
        //     var machineIndex = _.findIndex(machinesFiltersCtrl.machines, { MachineID: machine.MachineID })
        //     if (machineIndex < 0) {
        //         machinesFiltersCtrl.machines.push({
        //             MachineEName: machine.MachineEName,
        //             MachineID: machine.MachineID,
        //             MachineLname: machine.MachineLname
        //         });
        //     }
        //     else {
        //         machinesFiltersCtrl.machines[machineIndex].MachineEName = machine.MachineEName;
        //         machinesFiltersCtrl.machines[machineIndex].MachineLname = machine.MachineLname;
        //     }
        // }

        // $scope.getMachineStatuses = function (machine) {
        //     var machineStatusIndex = _.findIndex(machinesFiltersCtrl.machineStatues, { MachineStatusID: machine.MachineStatusID })
        //     if (machineStatusIndex < 0) {
        //         machinesFiltersCtrl.machineStatues.push({
        //             MachineStatusEname: machine.MachineStatusEname,
        //             MachineStatusID: machine.MachineStatusID,
        //             MachineStatusName: machine.MachineStatusName
        //         });
        //     }
        //     else {
        //         machinesFiltersCtrl.machineStatues[machineStatusIndex].MachineStatusEname = machine.MachineStatusEname;
        //         machinesFiltersCtrl.machineStatues[machineStatusIndex].MachineStatusName = machine.MachineStatusName;
        //     }
        // }

        // $scope.getFilterData();

        // $scope.resetDataByType = function (data) {
        //     date = _.map(data, function (el) {
        //         el.selected = false;
        //         return el;
        //     })
        // };

        // machinesFiltersCtrl.resetData = function () {
        //     $scope.hasFilter = false;
        //     machinesFiltersCtrl.kpiInput = kpiInput;

        //     $scope.resetDataByType(machinesFiltersCtrl.machineTypes);
        //     $scope.resetDataByType(machinesFiltersCtrl.machines);
        //     $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
        //     $scope.resetDataByType(machinesFiltersCtrl.machineAlarms);
        //     machinesFiltersCtrl.filterData();
        // };

        // $scope.checkMachineType = function (machineTypeIds, machine) {
        //     if (machineTypeIds.length == 0) {
        //         return true;
        //     }
        //     return (machineTypeIds.indexOf(machine.MachineTypeID) >= 0);
        // };

        // $scope.checkMachine = function (machineIds, machine) {
        //     if (machineIds.length == 0) {
        //         return true;
        //     }
        //     return (machineIds.indexOf(machine.MachineID) >= 0);
        // };

        // $scope.checkMachineStatus = function (machineStatusIds, machine) {
        //     if (machineStatusIds.length == 0) {
        //         return true;
        //     }
        //     return (machineStatusIds.indexOf(machine.MachineStatusID) >= 0);
        // };

        // $scope.checkAlarms = function (machineAlarms, machine) {
        //     var ans = true;
        //     for (var i = 0; i < machineAlarms.length; i++) {
        //         if (machineAlarms[i] == "productionTargetReached") {
        //             if (machine.UnitsProducedOK >= machine.UnitsTarget) {
        //                 return true;
        //             }
        //             {
        //                 ans = false;
        //             }
        //         }
        //         else if (machineAlarms[i] == "cyclesDetecedInNonProduction") {
        //             if (machine.ProductionModeWarning == "True") {
        //                 return true;
        //             }
        //             else {
        //                 ans = false;
        //             }
        //         }
        //     }
        //     return ans;
        // }

        // machinesFiltersCtrl.filterData = function () {
        //     var machineTypeIds = _.map(_.filter(machinesFiltersCtrl.machineTypes, { selected: true }), 'MachineTypeID');
        //     var machineIds = _.map(_.filter(machinesFiltersCtrl.machines, { selected: true }), 'MachineID');
        //     var machineStatusIds = _.map(_.filter(machinesFiltersCtrl.machineStatues, { selected: true }), 'MachineStatusID');
        //     var machineAlarms = _.map(_.filter(machinesFiltersCtrl.machineAlarms, { selected: true }), 'name');

        //     if (machineAlarms.length || machineIds.length || machineStatusIds.length || machineTypeIds.length || machinesFiltersCtrl.kpiInput) {
        //         $scope.hasFilter = true;
        //     } else {
        //         $scope.hasFilter = false;
        //     }

        //     $scope.allData.forEach(function (department) {
        //         department.DepartmentsMachine.forEach(function (machine) {

        //             if(angular.isDefined(machinesFiltersCtrl.kpiInput) && machine.DownTimeEfficiencyOEE >= machinesFiltersCtrl.kpiInput) {
        //                 machine.display = false;  
        //                 return;
        //             } 
                    
        //             if (!$scope.checkMachineType(machineTypeIds, machine)) {
        //                 machine.display = false;
        //                 return;
        //             }
        //             if (!$scope.checkMachine(machineIds, machine)) {
        //                 machine.display = false;
        //                 return;
        //             }
        //             if (!$scope.checkMachineStatus(machineStatusIds, machine)) {
        //                 machine.display = false;
        //                 return;
        //             }
        //             if (!$scope.checkAlarms(machineAlarms, machine)) {
        //                 machine.display = false;
        //                 return;
        //             }
        //             machine.display = true;

        //         });
        //     });
        // };

        // $scope.$watch('allData', function (newValue) {
        //     if ($scope.filterTimeout) {
        //         $timeout.cancel($scope.filterTimeout);
        //     }
        //     $scope.filterTimeout = $timeout(function () {
        //         machinesFiltersCtrl.filterData();
        //     });
        // }, true);

        // $scope.$watch('machinesFiltersCtrl.machineTypes', function (value) {
        //     machinesFiltersCtrl.filterData();
        // }, true);

        // $scope.$watch('machinesFiltersCtrl.machines', function (value) {
        //     machinesFiltersCtrl.filterData();
        // }, true);

        // $scope.$watch('machinesFiltersCtrl.machineStatues', function (value) {
        //     machinesFiltersCtrl.filterData();
        // }, true);

        // $scope.$watch('machinesFiltersCtrl.machineAlarms', function (value) {
        //     machinesFiltersCtrl.filterData();
        // }, true);

        // $scope.$watch('machinesFiltersCtrl.kpiInput', function (value) {
        //     machinesFiltersCtrl.filterData();
        // }, true);


        // $scope.$watch('resetData', function (newValue, oldValue) {
        //     if (newValue != oldValue) {
        //         machinesFiltersCtrl.resetData();
        //     }
        // }, true);

        // $scope.updateStatus.func = function (statusId, clearAll) {
        //     if (clearAll) {
        //         $scope.resetDataByType(machinesFiltersCtrl.machineTypes);
        //         $scope.resetDataByType(machinesFiltersCtrl.machines);
        //         $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
        //         $scope.resetDataByType(machinesFiltersCtrl.machineAlarms);
        //         $scope.resetDataByType(machinesFiltersCtrl.kpiInput);

        //     }
        //     else {
        //         $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
        //         var status = _.find(machinesFiltersCtrl.machineStatues, { MachineStatusID: parseInt(statusId) });
        //         if (status) {
        //             status.selected = true;
        //         }
        //     }
        // };

    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
        
        },
        controller: controller,
        controllerAs: "filterTableCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('filterTableDirective', filterTableDirective);