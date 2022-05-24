function managerAppDirective() {

    var template = 'views/custom/appView/managerApp.html';

    var controller = function ($scope, $state, LeaderMESservice, BreadCrumbsService, $filter, toastr, googleAnalyticsService) {
        managerAppCtrl = this;
        googleAnalyticsService.gaPV('Mobile_customization_screen');
        managerAppCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        managerAppCtrl.showBreadCrumb = true;
        if ($state.current.name == "customFullView"){
            managerAppCtrl.showBreadCrumb = false;
        }

        if (!$state.params.menuContent) {
            $scope.stateParams = LeaderMESservice.getStateParams();
        }
        else {
            $scope.stateParams = $state.params.menuContent;
        }
        if (managerAppCtrl.showBreadCrumb) {
            BreadCrumbsService.init();
            if (managerAppCtrl.localLanguage == true) {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName ;
            }
            else {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName ;
            }
        }

        managerAppCtrl.mobileData = {
            departmentShiftReport : {
                title : "MANAGER_APP_DEPARTMENT_SHIFT_REPORT",
                style : {
                    "background-image": "url('images/department.png')",
                    "width": "274px",
                    "height": "267px"
                    
                },
                graphUrl : 'images/op-app/graph-selected.png',
                template : {
                    HasGraph  : true,
                    GraphDisplayType : 2,
                    ManagerAppBatchGraph : true
                }
            },
            onlineReport : {
                title : "MANAGER_APP_ONLINE_REPORT",
                bordersFields :[
                    {
                        FieldName : null,
                        type : "dynamic"
                    },
                    {
                        fieldName : "JOB_PROGRESS",
                        type : "static"
                    }
                ],
                style : {
                    "background-image": "url('images/mobileMachineName.png')",
                    "width": "274px",
                    "height": "46px"
                },
                template : {
                    HasGraph  : false,
                    GraphDisplayType : 0,
                    ManagerAppBatchGraph : false
                }
            },
            shiftReport : {
                title : "MANAGER_APP_SHIFT_REPORT",
                style : {
                    "background-image": "url('images/mobileMachineNameShift.png')",
                    "width": "274px",
                    "height": "147px"
                },
                graphUrl : 'images/op-app/graph-selected.png',
                template : {
                    HasGraph  : true,
                    GraphDisplayType : 1,
                    ManagerAppBatchGraph : true
                }
            },
        }
        managerAppCtrl.updateMachineData = function(data){
            managerAppCtrl.mobileData.onlineReport.params = _.filter(angular.copy(data),{TypeID : 1});
            var dynamicParam = _.filter(angular.copy(data),{DefaultMobile : true, TypeID : 1});
            if (dynamicParam && dynamicParam.length > 0){
                managerAppCtrl.mobileData.onlineReport.bordersFields[0] = dynamicParam[0];
                managerAppCtrl.mobileData.onlineReport.bordersFields[0].type = 'dynamic';
            }
            else {
                managerAppCtrl.mobileData.onlineReport.bordersFields[0] = {
                    FieldName : null,
                    type : "dynamic"
                };
            }
            managerAppCtrl.mobileData.onlineReport.selectedParams = _.filter(angular.copy(data),function(item){
                return item.TypeID === 1 && item.DisplayOrder > 0;
            });

            managerAppCtrl.mobileData.shiftReport.selectedParams = _.sortBy(_.filter(angular.copy(data),function(item) {
                return item.HasGraph && item.ManagerAppBatchGraph && item.GraphDisplayType !== 2;
            }),'DisplayOrder');
            managerAppCtrl.mobileData.shiftReport.params = _.filter(angular.copy(data),{HasGraph : true});

        }

        var updateOnlineData = function(){
            var onlineData = [];
            var EmptyDyamicField = false;
            if (managerAppCtrl.mobileData.onlineReport.bordersFields[0].FieldName){
                onlineData = _.filter(angular.copy(managerAppCtrl.mobileData.onlineReport.bordersFields),{type : "dynamic"});
            }
            else{
                EmptyDyamicField = true;
            }
            var tmpOnlineData = angular.copy(managerAppCtrl.mobileData.onlineReport.selectedParams);
            _.remove(tmpOnlineData,function(item){
                if (item.FieldName){
                    return false;
                }
                return true;
            });
            onlineData = onlineData.concat(tmpOnlineData);
            onlineData = _.map(onlineData,function(item,index){
                delete item.type;
                delete item.showDropDown;
                item.DisplayOrder = index + 1 + (EmptyDyamicField ? 1 : 0);
                return item;
            });
            return onlineData;
        }


        var updateShiftData = function(){
            var shiftData = angular.copy(managerAppCtrl.mobileData.shiftReport.selectedParams);
            _.remove(shiftData,function(item){
                if (item.FieldName){
                    return false;
                }
                return true;
            });
            shiftData = _.map(shiftData,function(item,index){
                delete item.type;
                delete item.showDropDown;
                item.DisplayOrder = index + 1;
                item.GraphDisplayType = 1;
                return item;
            });
            return shiftData;
        }

        var updateDepShiftData = function(allData){
            var depShiftData = angular.copy(managerAppCtrl.mobileData.departmentShiftReport.selectedParams);
            _.remove(depShiftData,function(item){
                if (item.FieldName){
                    return false;
                }
                return true;
            });
            depShiftData = _.filter(depShiftData,function(item){
                var foundInShift = _.find(allData,{FieldName : item.FieldName,HasGraph : true});
                if (foundInShift){
                    foundInShift.GraphDisplayType = 3;
                    return false;
                }
                return true;
            });

            depShiftData = _.map(depShiftData,function(item,index){
                delete item.type;
                delete item.showDropDown;
                item.DisplayOrder = index + 1;
                item.GraphDisplayType = 2;
                return item;
            });
            return depShiftData;
        }

        managerAppCtrl.saveStructure = function(){

            var requestBody = {
                MachineType: managerAppCtrl.mobileData.selectedMachineType.ID
            }
            if (managerAppCtrl.mobileData.applyTo == 'allMachines'){
                requestBody.UpdateAllMachines = true;
            }
            else{
                var selectedMachines = _.filter(managerAppCtrl.mobileData.selectedMachineType.Machines,{selected : true});
                if (_.findIndex(selectedMachines,{Id : managerAppCtrl.mobileData.selectedMachine.Id}) < 0){
                    selectedMachines.push(managerAppCtrl.mobileData.selectedMachine);
                }
                var selectedMachineIds = _.map(selectedMachines,'Id');
                requestBody.MachineID = selectedMachineIds;
            }


            //online report

            var onlineRequestBody = angular.copy(requestBody);
            onlineRequestBody.Parameters = updateOnlineData();


            LeaderMESservice.customAPI('UpdateManagerControllerFieldParams',onlineRequestBody).then(function(response){
               
                //to clear previous toastr to prevent toastr duplicating on screen
                toastr.clear();
                toastr.success($filter('translate')("STRUCTURE_SAVED_SUCCESSFULLY"));
                //var removedFields = _.remove(managerAppCtrl.mobileData.departmentShiftReport.selectedParams,{FieldName: null});
                //managerAppCtrl.mobileData.departmentShiftReport.selectedParams = managerAppCtrl.mobileData.departmentShiftReport.selectedParams.concat(removedFields);
                var removedFields = _.remove(managerAppCtrl.mobileData.shiftReport.selectedParams,{FieldName: null});
                managerAppCtrl.mobileData.shiftReport.selectedParams = managerAppCtrl.mobileData.shiftReport.selectedParams.concat(removedFields);
                //shiftReport
                var shiftData = [];

                shiftData = shiftData.concat(updateShiftData());

                shiftData = shiftData.concat(updateDepShiftData(shiftData));

                var shiftRequestBody = angular.copy(requestBody);
                shiftRequestBody.Parameters = shiftData;

                LeaderMESservice.customAPI('UpdateManagerControllerFieldParamsGraph',shiftRequestBody).then(function(response){
                        //to clear previous toastr to prevent toastr duplicating on screen
                    toastr.clear();
                    toastr.success($filter('translate')("STRUCTURE_SAVED_SUCCESSFULLY"));
                    var removedFields = _.remove(managerAppCtrl.mobileData.onlineReport.selectedParams,{FieldName: null});
                    managerAppCtrl.mobileData.onlineReport.selectedParams = managerAppCtrl.mobileData.onlineReport.selectedParams.concat(removedFields);

                });
            });


        }
     };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
        },
        controller: controller,
        controllerAs: "managerAppCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('managerAppDirective', managerAppDirective);