function insightsToolbar() {
  var controller = function ($scope, $rootScope, $sessionStorage, $filter, insightService) {
    var insightsToolbarCtrl = this;
    insightsToolbarCtrl.insightFiltersData = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters;
    insightsToolbarCtrl.resetByKey = function (key) {
      $rootScope.$broadcast("resetByKey", key);
    };

    insightsToolbarCtrl.calcData = function () {
      insightsToolbarCtrl.machineValue = true;
      insightsToolbarCtrl.jobDefinitionValue = true;
      insightsToolbarCtrl.shiftsValue = true;
      insightsToolbarCtrl.hasFilter = true;
      insightsToolbarCtrl.endLineValue = false;
      
      insightsToolbarCtrl.isWorkingValue = true;
      insightsToolbarCtrl.machineTooltip = [];
      insightsToolbarCtrl.jobsTooltip = [];
      insightsToolbarCtrl.shiftsTooltip = [];
      insightsToolbarCtrl.insightFiltersData.productIds = insightsToolbarCtrl.insightFiltersData.productIds || [];
      insightsToolbarCtrl.insightFiltersData.productGroupIds = insightsToolbarCtrl.insightFiltersData.productGroupIds || [];
      insightsToolbarCtrl.insightFiltersData.moldGroupIds = insightsToolbarCtrl.insightFiltersData.moldGroupIds || [];
      insightsToolbarCtrl.insightFiltersData.userIds = insightsToolbarCtrl.insightFiltersData.userIds || [];
      insightsToolbarCtrl.insightFiltersData.clienIds = insightsToolbarCtrl.insightFiltersData.clienIds || [];
      insightsToolbarCtrl.insightFiltersData.jobIds = insightsToolbarCtrl.insightFiltersData.jobIds || [];
      insightsToolbarCtrl.insightFiltersData.activeTimeIds = insightsToolbarCtrl.insightFiltersData.activeTimeIds || [];
      insightsToolbarCtrl.insightFiltersData.unitsProducedIds = insightsToolbarCtrl.insightFiltersData.unitsProducedIds || [];
      insightsToolbarCtrl.insightFiltersData.moldIds = insightsToolbarCtrl.insightFiltersData.moldIds || [];

      if (insightsToolbarCtrl.insightFiltersData) {
        if (insightsToolbarCtrl.insightFiltersData.filterBy) {
          if (insightsToolbarCtrl.insightFiltersData.Machines) {
            var machinesSelected = _.find(insightsToolbarCtrl.insightFiltersData.filterBy, { FilterName: "MachineIdFilter" });
            if (
              machinesSelected &&
              machinesSelected.FilterValues &&
              machinesSelected.FilterValues.length == insightsToolbarCtrl.insightFiltersData.Machines.length
            ) {
              insightsToolbarCtrl.machineValue = false;
            } else {
              var counter = 0;
              var filterBy = angular.copy(insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy);
              indexTemp = _.findIndex(filterBy, {
                FilterName: "MachineIdFilter",
              });
              if (indexTemp > -1) {
                filterBy[indexTemp].FilterValues = [];
              } else {
                filterBy.push({ FilterName: "MachineIdFilter", FilterValues: [] });
              }
              _.forEach($scope.insightsToolbarCtrl.insightFiltersData.Machines, function (temp) {
                if (temp.value) {
                  counter++;
                  filterBy[_.findIndex(filterBy, { FilterName: "MachineIdFilter" })].FilterValues.push(temp.ID || temp.id);
                }
              });

              if (counter === insightsToolbarCtrl.insightFiltersData.Machines.length) {
                insightsToolbarCtrl.machineValue = false;
              } else if (counter === 1) {
                var found = _.find($scope.insightsToolbarCtrl.insightFiltersData.Machines, { value: true });
                if (found) {
                  insightsToolbarCtrl.machineValue = `${$filter("translate")("MACHINE")}: ${
                    $scope.localLanguage ? found.MachineLName : found.MachineName
                  }`;
                  insightsToolbarCtrl.machineTooltip.push(`${$scope.localLanguage ? found.MachineLName : found.MachineName}`)
                }
              } else if (counter !== 0) {
                insightsToolbarCtrl.machineValue = $filter("translate")("MACHINES_(MULTIPLE_VALUES)");
                insightsToolbarCtrl.machineTooltip = _.map(_.filter($scope.insightsToolbarCtrl.insightFiltersData.Machines, { value: true }), function(machine){
                  return $scope.localLanguage ? machine.MachineLName : machine.MachineName
                });
              } else {
                insightsToolbarCtrl.machineValue = false;
              }
            }
          }
          var endLineSelected = _.find(insightsToolbarCtrl.insightFiltersData.filterBy, { FilterName: "IsEndOfLineFilter" });
          if (endLineSelected && endLineSelected.FilterValues) {
            insightsToolbarCtrl.endLineValue = insightsToolbarCtrl.insightFiltersData.endLine;
          }

          var isWorkingSelected = _.find(insightsToolbarCtrl.insightFiltersData.filterBy, { FilterName: "IsWorkingFilter" });
          if (isWorkingSelected && isWorkingSelected.FilterValues) {
            insightsToolbarCtrl.isWorkingValue = insightsToolbarCtrl.insightFiltersData.isWorking;
          }
          else
          {
            insightsToolbarCtrl.isWorkingValue = false;
          }

          if (insightsToolbarCtrl.insightFiltersData.ERPJobDef) {
            var jobDefinitionSelected = _.find(insightsToolbarCtrl.insightFiltersData.filterBy, { FilterName: "ERPJobDefFilter" });
            if (
              jobDefinitionSelected &&
              jobDefinitionSelected.FilterValues &&
              jobDefinitionSelected.FilterValues.length == insightsToolbarCtrl.insightFiltersData.ERPJobDef.length
            ) {
              insightsToolbarCtrl.jobDefinitionValue = false;
            } else {
              var counter = 0;
              var filterBy = angular.copy(insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy);
              indexTemp = _.findIndex(filterBy, {
                FilterName: "ERPJobDefFilter",
              });

              if (indexTemp > -1) {
                filterBy[indexTemp].FilterValues = [];
              } else {
                filterBy.push({ FilterName: "ERPJobDefFilter", FilterValues: [] });
              }

              _.forEach($scope.insightsToolbarCtrl.insightFiltersData.ERPJobDef, function (temp) {
                if (temp.value) {
                  counter++;
                  filterBy[_.findIndex(filterBy, { FilterName: "ERPJobDefFilter" })].FilterValues.push(temp.ID);
                }
              });

              if (counter === insightsToolbarCtrl.insightFiltersData.ERPJobDef.length) {
                insightsToolbarCtrl.jobDefinitionValue = false;
              } else if (counter === 1) {
                var found = _.find($scope.insightsToolbarCtrl.insightFiltersData.ERPJobDef, { value: true });
                if (found) {
                  insightsToolbarCtrl.jobDefinitionValue = `${$filter("translate")("JOB_DEFINITION")}: ${
                    $scope.localLanguage ? found.lname : found.ename
                  }`;
                  insightsToolbarCtrl.jobsTooltip.push(`${$scope.localLanguage ? found.lname : found.ename}`)
                }
              } else if (counter !== 0) {
                insightsToolbarCtrl.jobDefinitionValue = $filter("translate")("JOB_DEFINITION_(MULTIPLE_VALUES)");
                insightsToolbarCtrl.jobsTooltip = _.map(_.filter($scope.insightsToolbarCtrl.insightFiltersData.ERPJobDef, { value: true }), function(jobs){
                  return $scope.localLanguage ? jobs.lname : jobs.ename
                });
              } else {
                insightsToolbarCtrl.jobDefinitionValue = false;
              }
            }
          }
          if (insightsToolbarCtrl.insightFiltersData.ShiftDef) {
            var shiftsSelected = _.find(insightsToolbarCtrl.insightFiltersData.filterBy, { FilterName: "ShiftNameFilter" });
            
            if (
              shiftsSelected &&
              shiftsSelected.FilterValues &&
              shiftsSelected.FilterValues.length == insightsToolbarCtrl.insightFiltersData.ShiftDef.length
            ) {
              insightsToolbarCtrl.shiftsValue = false;
            } else {
              var counter = 0;
              var filterBy = angular.copy(insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy);
              indexTemp = _.findIndex(filterBy, {
                FilterName: "ShiftNameFilter",
              });
              if (indexTemp > -1) {
                filterBy[indexTemp].FilterValues = [];
              } else {
                filterBy.push({ FilterName: "ShiftNameFilter", FilterValues: [] });
              }

              _.forEach($scope.insightsToolbarCtrl.insightFiltersData.ShiftDef, function (temp) {
                if (temp.value) {
                  counter++;
                  filterBy[_.findIndex(filterBy, { FilterName: "ShiftNameFilter" })].FilterValues.push(temp.ID);
                }
              });

              if (counter === insightsToolbarCtrl.insightFiltersData.ShiftDef.length) {
                insightsToolbarCtrl.shiftsValue = false;
              } else if (counter === 1) {
                var found = _.find($scope.insightsToolbarCtrl.insightFiltersData.ShiftDef, { value: true });
                if (found) {
                  insightsToolbarCtrl.shiftsValue = `${$filter("translate")("SHIFT")}: ${found.ShiftName}`;
                  insightsToolbarCtrl.shiftsTooltip.push(`${found.ShiftName}`)
                }
              } else if (counter !== 0) {
                insightsToolbarCtrl.shiftsValue = $filter("translate")("SHIFTS_(MULTIPLE_VALUES)");
                insightsToolbarCtrl.shiftsTooltip = _.map(_.filter($scope.insightsToolbarCtrl.insightFiltersData.ShiftDef, { value: true }), function(shifts){
                  return shifts.ShiftName
                });
              } else {
                insightsToolbarCtrl.shiftsValue = false;
              }
            }
          }
        }

        if (!insightsToolbarCtrl.machineValue && !insightsToolbarCtrl.shiftsValue && !insightsToolbarCtrl.jobDefinitionValue) {
          if (
            insightsToolbarCtrl.insightFiltersData.productIds &&
            insightsToolbarCtrl.insightFiltersData.moldIds &&
            insightsToolbarCtrl.insightFiltersData.jobIds &&
            insightsToolbarCtrl.insightFiltersData.activeTimeIds &&
            insightsToolbarCtrl.insightFiltersData.unitsProducedIds &&
            insightsToolbarCtrl.insightFiltersData.userIds &&
            insightsToolbarCtrl.insightFiltersData.clienIds && 
            insightsToolbarCtrl.insightFiltersData.productGroupIds &&
            insightsToolbarCtrl.insightFiltersData.moldGroupIds
          ) {
            if (
              insightsToolbarCtrl.insightFiltersData.productIds.length +
              insightsToolbarCtrl.insightFiltersData.moldIds.length +
              insightsToolbarCtrl.insightFiltersData.jobIds.length +
              insightsToolbarCtrl.insightFiltersData.activeTimeIds.length +
              insightsToolbarCtrl.insightFiltersData.unitsProducedIds.length +
              insightsToolbarCtrl.insightFiltersData.userIds.length + 
              insightsToolbarCtrl.insightFiltersData.clienIds.length + 
              insightsToolbarCtrl.insightFiltersData.productGroupIds.length +
              insightsToolbarCtrl.insightFiltersData.moldGroupIds.length == 0
            ) {
              insightsToolbarCtrl.hasFilter = false;
            }
          }
        }
      }
    };

    //if something change in global filter then call calcData
    $scope.$watch(
      "insightsToolbarCtrl.insightFiltersData",
      function () {
        if (!_.isEmpty(insightsToolbarCtrl.insightFiltersData)) {
          insightsToolbarCtrl.calcData();
        }
      },
      true
    );

    //this emit globalFilter true or false which show the check-blue.svg in global image filter
    $scope.$watchGroup(
      [
        "insightsToolbarCtrl.machineValue",
        "insightsToolbarCtrl.jobDefinitionValue",
        "insightsToolbarCtrl.shiftsValue",
        "insightsToolbarCtrl.hasFilter",
      ],
      function () {
        if (
          insightsToolbarCtrl.machineValue ||
          insightsToolbarCtrl.jobDefinitionValue ||
          insightsToolbarCtrl.shiftsValue ||
          insightsToolbarCtrl.hasFilter
        ) {
          $scope.$emit("globalFilter", true);
        } else {
          $scope.$emit("globalFilter", false);
        }
      },
      true
    );
  };

  return {
    restrict: "EA",
    templateUrl: "js/components/insightDashboardToolbar/insightDashboardToolbar.html",
    scope: {},
    controller: controller,
    controllerAs: "insightsToolbarCtrl",
  };
}

angular.module("LeaderMESfe").directive("insightsToolbar", insightsToolbar);
