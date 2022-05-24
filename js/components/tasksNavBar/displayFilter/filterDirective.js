
function filterDirective($compile) {

    var template = "js/components/tasksNavBar/displayFilter/filterDirective.html";

    var linker = function (scope, element, attrs) {

    };


    var controller = function ($scope, LeaderMESservice, $modal, $state, commonFunctions,$rootScope,toastr,$filter) {

        var filterDirective = this;
        filterDirective.data={selectedFilterVariant:null};
        $scope.filterVariants=[];



        $scope.checkIfFiltered = function () {
            $scope.filter['filtered'] =
                $scope.filter['OnlyLate'] ||
                $scope.filteredBySeverity ||
                $scope.filteredByStatus ||
                $scope.filteredByUsers ||
                $scope.filteredBySubjects ||
                $scope.filteredByMachines ||
                $scope.filteredByDepartments ||
                $scope.filteredByUserGroup ||
                $scope.filter['doneCancelLastXDays'] !=1;
        }

        $scope.checkIfFilteredByOnlyLate = () => {
            if ($scope.filter['OnlyLate'] === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredByLastXDays=()=>{

            $rootScope.$broadcast("tasksManagementFetchTasksData", {});

            if($scope.filter['doneCancelLastXDays']!=1){
                $scope.filter['filtered'] = true;

            }else{
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredBySeverity = function () {
            let severityIsFiltered = false;

            for (let crateria in $scope.filter['Priority']) {
                if ($scope.filter['Priority'][crateria] === false) {
                    severityIsFiltered = true;
                    break;
                }
            }

            $scope.filteredBySeverity = severityIsFiltered;
            if ($scope.filteredBySeverity === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredBySubjects = function () {
            let subjectsAreFiltered = false;

            for (let crateria in $scope.filter['Subjects']) {
                if ($scope.filter['Subjects'][crateria] === false) {
                    subjectsAreFiltered = true;
                    break;
                }
            }

            $scope.filteredBySubjects = subjectsAreFiltered;
            if ($scope.filteredBySubjects === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredByStatus=function(){
            let statusIsFiltered = false;

            for (let crateria in $scope.filter['Status']) {
                if ($scope.filter['Status'][crateria]['visible'] === false) {
                    statusIsFiltered = true;
                    break;
                }
            }

            $scope.filteredByStatus = statusIsFiltered;
            if ($scope.filteredByStatus === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }

        }

        $scope.checkIfFilteredByUsers = function () {
            let usersAreFiltered = false;

            for (let crateria in $scope.filter['AssigneeDisplayName']) {
                if (crateria != 'visible' && $scope.filter['AssigneeDisplayName'][crateria] === false) {
                    usersAreFiltered = true;
                    break;
                }
            }

            $scope.filteredByUsers = usersAreFiltered;
            if ($scope.filteredByUsers === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredByMachines = function () {
            let machinesAreFiltered = false;

            for (let crateria in $scope.filter['TaskObject'][3]) {
                if ($scope.filter['TaskObject'][3][crateria] === false) {
                    machinesAreFiltered = true;
                    break;
                }
            }

            $scope.filteredByMachines = machinesAreFiltered;
            if ($scope.filteredByMachines === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredByDepartments = function () {
            let departmentsAreFiltered = false;

            for (let crateria in $scope.filter['TaskObject'][2]) {
                if ($scope.filter['TaskObject'][2][crateria] === false) {
                    departmentsAreFiltered = true;
                    break;
                }
            }

            $scope.filteredByDepartments = departmentsAreFiltered;
            if ($scope.filteredByDepartments === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }

        $scope.checkIfFilteredByUserGroup = function () {
            let userGroupAreFiltered = false;

            for (let crateria in $scope.filter['TaskObject'][5]) {
                if ($scope.filter['TaskObject'][5][crateria] === false) {
                    userGroupAreFiltered = true;
                    break;
                }
            }

            $scope.filteredByUserGroup = userGroupAreFiltered;
            if ($scope.filteredByUserGroup === true) {
                $scope.filter['filtered'] = true;
            } else {
                $scope.checkIfFiltered();
            }
        }
        $scope.checkAllStatuses=function(checkAll){
            for (let status in $scope.filter['Status']) {
                $scope.filter['Status'][status]['visible']=checkAll;
            }
        }
        $scope.checkAllF = function (filter, checkAll) {
            // console.log("checkAll input:", filter, checkAll);
            for (let crateria in filter) {
                if (crateria != 'visible')
                    filter[crateria] = checkAll;
            }
        }

        $scope.resetFilter = () => {
            $scope.filter['OnlyLate'] = false;
            $scope.checkAllF($scope.filter['Priority'], true);
            $scope.checkAllF($scope.filter['Subjects'], true);
            $scope.checkAllF($scope.filter['AssigneeDisplayName'], true)
            $scope.checkAllF($scope.filter['TaskObject'][2], true)
            $scope.checkAllF($scope.filter['TaskObject'][3], true)
            $scope.checkAllF($scope.filter['TaskObject'][5], true)
            $scope.checkAllStatuses( true);
            $scope.filter['filtered'] = false;
            if($scope.filter['doneCancelLastXDays']!=1){
                $scope.filter['doneCancelLastXDays']=1;
                $rootScope.$broadcast("tasksManagementFetchTasksData", {});
            }
            filterDirective.data.selectedFilterVariant=null;
        }

        $scope.deleteFilterVariant = function (selectedFilterVariant) {
            console.log("selectedFilterVariant",selectedFilterVariant);
            if (selectedFilterVariant?.FilterID) {
                LeaderMESservice.customAPI("DeleteTasksSavedFilters", { FilterID: selectedFilterVariant.FilterID }).then(function () {
                    filterDirective.data.selectedFilterVariant=null;
                    $scope.resetFilter();
                    LeaderMESservice.customAPI("GetTasksSavedFilters", {}).then(function (res) {
                        $scope.filterVariants = res.Data || [];
                        toastr.clear();
                        toastr.success("", $filter("translate")("VARIANT_DELETE_SUCCESSFULLY"));
                        $scope.$emit("resetFilterTest");
                    });
                });
            }
        };


        $scope.saveFilterVariant = function () {
            $modal.open({
                templateUrl: "views/common/saveFilterInsights.html",
                windowClass: "insight-filter-model",
                controller: function ($scope, $modalInstance) {
                    if (filterDirective.data.selectedFilterVariant) {
                        console.log("there is filter name");
                        $scope.overRideOption = true;
                        $scope.filterName = filterDirective.data.selectedFilterVariant.FilterName;
                        $scope.filterOverWrite = {
                            currentChoice: "true",
                        };
                    } else {
                        console.error("there is NOT filter name");
                        $scope.filterName = "";
                        $scope.filterOverWrite = {
                            currentChoice: "false",
                        };
                    }

                    $scope.closeModal = function () {
                        $modalInstance.close();
                    };
                    $scope.saveFilter = function () {
                        var overWriteObj = {
                            filterName: $scope.filterName,
                            overWrite: $scope.filterOverWrite.currentChoice == "true" ? true : false,
                        };
                        filterDirective.apply(overWriteObj);
                        $scope.closeModal();
                    };
                },
            });
        };

        filterDirective.apply = function (variantObj) {
            if (variantObj) {
                const obj = {
                    FilterName: variantObj.filterName,
                    FilterTemplate: JSON.stringify($scope.filter),
                    FilterID: 0,
                };
                if (variantObj.overWrite) {
                    obj.FilterID = filterDirective.data.selectedFilterVariant.FilterID;
                    obj.FilterName = filterDirective.data.selectedFilterVariant.FilterName;
                }
                if (obj.FilterTemplate && obj.FilterName?.length > 0 && obj.FilterID > -1) {
                    LeaderMESservice.customAPI("UpdateTasksSavedFilters", obj).then(function () {
                        LeaderMESservice.customAPI("GetTasksSavedFilters", {}).then(function (res) {
                            if (!_.isEmpty(res.Data)) {
                                $scope.filterVariants = res.Data || [];
                                toastr.clear();
                                toastr.success("", $filter("translate")("VARIANT_SAVED_SUCCESSFULLY"));
                            }else{
                                console.error("GetTasksSavedFilters with no data");
                            }
                        });
                    });
                }else{
                    console.error("wrong input for UPDATE/GET tasksSavedFilter");
                }
            }
            // $timeout(function () {
            //     //note: i return it because the deviation/static limit/data Labels stop working on global filter
            //     insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters = angular.copy(insightFiltersData);
            // }, 100);
        };

        $scope.toggleFilter = function () {
            $(".filterWrapper").fadeToggle(50);
            $(".closeFilterWindow").fadeToggle(50, () => {
                $(".searchFilter").toggleClass('focusShadow');
            });
        };

        $scope.toggleWindow = () => {
            switch ($scope.mode) {
                case 'myTasks':
                    $scope.filterWindowIsOpen['myTasks'] = !$scope.filterWindowIsOpen['myTasks'];
                default:
                    $scope.filterWindowIsOpen['tasksManagement'] = !$scope.filterWindowIsOpen['tasksManagement'];
            }
        }

        $scope.initWrapper=(selectedFilterVariant)=>{
            //fetch filters
            if(!selectedFilterVariant){
                LeaderMESservice.customAPI("GetTasksSavedFilters", {}).then(function (res) {
                    if (!_.isEmpty(res.Data)) {
                        $scope.filterVariants = res.Data || [];
                        toastr.clear();
                        toastr.success("", $filter("translate")("VARIANT_SAVED_SUCCESSFULLY"));
                    }else{
                        console.error("GetTasksSavedFilters with no data");
                    }
                });
            }
            //set the selected filter
            else{
                let parsedTemplate=JSON.parse(selectedFilterVariant.FilterTemplate);
                for(let key in parsedTemplate){
                    $scope.filter[key]=parsedTemplate[key];
                }
                filterDirective.data.selectedFilterVariant=selectedFilterVariant;
            }

        };

        //fetch filters initially
        $scope.initWrapper();


    };

    return {
        restrict: "E",
        link: linker,
        templateUrl: template,
        scope: {
            filter: '=',
            users: '=',
            departments: '=',
            machines: '=',
            groups: '=',
            rtl: '=',
            statuses:'=',
            subjects:'='
        },
        controller: controller,
        controllerAs: 'filterController'
    };
}

angular
    .module('LeaderMESfe')
    .directive('filterDirective', filterDirective);
