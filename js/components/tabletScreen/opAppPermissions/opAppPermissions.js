function opAppPermissions() {

    var template = 'js/components/tabletScreen/opAppPermissions/opAppPermissions.html';

    var controller = function ($scope, LeaderMESservice, $filter, toastr) {
        var opAppPermissionsCtrl = this;
        opAppPermissionsCtrl.permissionsData = {};
        $scope.loading = false;       

        opAppPermissionsCtrl.menuChange = function(item){
             
            var found = _.find(opAppPermissionsCtrl.changedData,{key : item.key});
            var listView = _.find(_.find(opAppPermissionsCtrl.data,{name : "SHIFT_LOG"}).menus,{key:5});
            var timeLineView = _.find(_.find(opAppPermissionsCtrl.data,{name : "SHIFT_LOG"}).menus,{key:6});
            listView.notAllowed = (item.key == 5 && item.value == false && timeLineView.value == false);
            timeLineView.notAllowed = (item.key == 6 && item.value == false && listView.value == false);
            $scope.allowed = !(listView.notAllowed || timeLineView.notAllowed)
            if(listView.notAllowed)
            {
                var listViewTemp = _.find(_.find(opAppPermissionsCtrl.data,{name : "SHIFT_LOG"}).menus,{key:listView.key})
                listViewTemp.value=true;
            }
            if(timeLineView.notAllowed)
            {
                var timeLineViewTemp = _.find(_.find(opAppPermissionsCtrl.data,{name : "SHIFT_LOG"}).menus,{key:timeLineView.key})
                timeLineViewTemp.value = true;
            }
            if (found){
                found.value = item.value;
                return;
            }                                      
            
            if($scope.allowed)
            {
                opAppPermissionsCtrl.changedData.push({
                    key : item.key,
                    value : item.value
                });
            }            
                     
        }

        //TO-DO send selected machines ids
        opAppPermissionsCtrl.save = function() {                        
            var machines = [];
            if(opAppPermissionsCtrl.permissionsData.applyTo == 'allMachines'){
                machines = _.map(opAppPermissionsCtrl.permissionsData.selectedDepartment.Value,'Id');              
            }
            else if(opAppPermissionsCtrl.permissionsData.applyTo == 'selectMachines'){
                
                opAppPermissionsCtrl.permissionsData.departments.forEach(function(department){
                    machines = machines.concat(_.map(_.filter(department.Value,{selected: true}),'Id'));
                });            
            }
            else
            {
              machines.push(opAppPermissionsCtrl.permissionsData.selectedMachine.Id);
            }
         
            var menus = [];
            opAppPermissionsCtrl.data.forEach(function(topMenu){
                topMenu.menus.forEach(function(menu){
                    menus.push({
                        key : menu.key,
                        value : menu.value
                    })
                });
            });            
            $scope.loading = true;
            LeaderMESservice.customAPI('SaveOperatorMachineMenus',
            {
                Machines: machines,
                Menus: menus
            }).then(function() {
                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                $scope.loading = true;
                opAppPermissionsCtrl.updateMachineData();
            }, function() {
                toastr.error("", $filter('translate')('SAVE_FAILED'));

            });
        };

        opAppPermissionsCtrl.updateMachineData = function () {

            $scope.loading = true;            
            
            LeaderMESservice.customAPI('GetOperatorPermissionsForMachine', 
                { 
                    MachineID: opAppPermissionsCtrl.permissionsData.selectedMachine.Id 
                }).then(function(response){
                    $scope.loading = false;
        
                    opAppPermissionsCtrl.data = angular.copy(opAppPermissionsCtrl.DefaultStructure);
                    opAppPermissionsCtrl.changedData = [];
                    response.ResponseList.forEach(function(menu){
                        if (menu.haspermission){
                            for(var i = 0;i < opAppPermissionsCtrl.data.length ;i++){
                                var itemFound = _.find(opAppPermissionsCtrl.data[i].menus,{fieldName : menu.menu});
                                if(itemFound){                                    
                                    itemFound.value = true;
                                    break;
                                }
                            }
                        }
                    });
                });
        };     
        
        opAppPermissionsCtrl.DefaultStructure = [
            {
                name : "GENERAL_SETTINGS",
                menus : [
                    {
                        menuName: "SERVICE_CALL",
                        value :false,
                        fieldName: 'ServiceCalls',
                        key: 1
                    },
                    {
                        menuName: "PRODUCTION_STATUS",
                        value :false,
                        fieldName: 'ProductionStatus',
                        key: 2
                    },
                    {
                        menuName: "OPERATOR_SIGN_IN",
                        value :false,
                        fieldName: 'OperatorSignIn',
                        key: 3
                    },
                    {
                        menuName: "SHIFT_REPORT",
                        value :false,
                        fieldName: 'ShiftReport',
                        key: 4
                    },
                    {
                        menuName: "MESSAGES",
                        value :false,
                        fieldName: 'Massages',
                        key: 11
                    },
                    {
                        menuName: "TASK",
                        value :false,
                        fieldName: 'Task',
                        key: 15
                    }
                ]
            },
            {
                name : "SHIFT_LOG",
                mandatory : true,
                menus : [
                    {
                        menuName: "TIMELINE_VIEW",
                        value :false,
                        fieldName: 'ShiftLog',
                        key: 6
                    },
                    {
                        menuName: "LIST_VIEW",
                        value :false,
                        fieldName: 'EventList',
                        key: 5
                    }
                ] 
            },
            {
                name : "JOB_ACTION",
                menus : [
                    {
                        menuName: "ACTIVATE_JOB_WIDGET",
                        value :false,
                        fieldName: 'ActivateJob',
                        key: 7
                    },
                    {
                        menuName: "ADD_REJECTS_WIDGET",
                        value :false,
                        fieldName: 'AddRejects',
                        key: 8 
                    },
                    {
                        menuName: "CHANGE_UNITS_IN_CYCLE_WIDGET",
                        value :false,
                        fieldName: 'ChangeUnitsInCycle',
                        key: 9
                    },
                    {
                        menuName: "REPORT_PRODUCTION",
                        value :false,
                        fieldName: 'ReportProduction',
                        key: 12
                    },
                    {
                        menuName: "END_SETUP",
                        value :false,
                        fieldName: 'EndSetup',
                        key: 10
                    },
                    {
                        menuName: "TEST_ORDER",
                        value :false,
                        fieldName: 'QC',
                        key: 14
                    },
                    {
                        menuName: "FIX_UNITS_PRODUCED",
                        value :false,
                        fieldName: 'FixUnitsProduced',
                        key: 16
                    }
                ] 
            }
        ]
    }

    return {
        restrict: "E",
        templateUrl: template,
        scope: {},
        controller: controller,
        controllerAs: "opAppPermissionsCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('opAppPermissions', opAppPermissions);