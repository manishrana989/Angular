function machinesFiltersDirective($filter) {
  var template = "views/global/machinesFilters.html";

  var controller = function ($scope, LeaderMESservice, $timeout, $sessionStorage, $filter, OnlineService, $localStorage) {
    var machinesFiltersCtrl = this;
    machinesFiltersCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    machinesFiltersCtrl.otherText = $filter('translate')('OTHER');
    $scope.DepName = $scope.allData.length > 1 ? "allMachines" : $scope.type + "_" + $scope.allData[0].DepartmentEname;
    $localStorage[$scope.DepName] = $localStorage[$scope.DepName] || {};
    var defaultData = {
      productionLinesFilter: [{
        ui_text: "DISPLAY_END_LINES",
        name: "displayEndLines",
      }, ],
      machineTypes: [],
      machinesGroups: [],
      machines: [],
      departments: [],
      machineStatues: [],
      machineAlarms: [{
          ui_text: "PRODUCTION_TARGET_REACHED",
          name: "productionTargetReached",
        },
        {
          ui_text: "CYCLES_DETECTED_IN_NON_PRODUCTION_MODE",
          name: "cyclesDetecedInNonProduction",
        },
        {
          ui_text: "DEVIATION_FROM_THE_THEORETICAL_TARGET",
          name: "deviationFromTheTheoreticalTarget",
        },
      ],
      kpiInput: [{
          value: undefined,
          param: "CavitiesEfficiency",
          TEXT: $filter("translate")("CAVITIES_EFFICIENCY"),
        },
        {
          value: undefined,
          param: "CycleTimeEfficiency",
          TEXT: $filter("translate")("CYCLE_TIME_EFFICIENCY"),
        },
        {
          value: undefined,
          param: "DownTimeEfficiency",
          TEXT: $filter("translate")("DOWNTIME_EFFICIENCY"),
        },
        {
          value: undefined,
          param: "DownTimeEfficiencyOEE",
          TEXT: $filter("translate")("DOWNTIME_EFFICIENCY_OEE"),
        },
        {
          value: undefined,
          param: "RejectsEfficiency",
          TEXT: $filter("translate")("REJECTS_EFFICIENCY"),
        },
        {
          value: undefined,
          param: "PEE",
          TEXT: $filter("translate")("PEE"),
        },
        {
          value: undefined,
          param: "OEE",
          TEXT: $filter("translate")("OEE"),
        },
      ],
      machineServices: [{
        ui_text: "OPEN_SERVICE_CALL",
        name: "openServiceCall",
      }, ],
      jobDefinition: [],
      machineClassifications: [
        {
          ID: 1,
          text: 'MACHINE',
        },
        {
          ID: 2,
          text: 'PRODUCTION_LINE',
        },
        {
          ID: 3,
          text: 'PERIPHERAL_SYSTEMS',
        },
        {
          ID: 4,
          text: 'SENSOR',
        },
        {
          ID: 5,
          text: 'MANUAL_WORK_STATIONS',
        },
      ],
    };
    machinesFiltersCtrl.productionLinesFilter = $localStorage[$scope.DepName].productionLinesFilter || defaultData.productionLinesFilter;
    machinesFiltersCtrl.machineTypes = $filter('orderBy')($localStorage[$scope.DepName].machineTypes, machinesFiltersCtrl.localLanguage ? 'MachineTypeLName':'MachineTypeEName') || defaultData.machineTypes;
    machinesFiltersCtrl.machinesGroups = $localStorage[$scope.DepName].machinesGroups || defaultData.machinesGroups;
    machinesFiltersCtrl.machines = $localStorage[$scope.DepName].machines || defaultData.machines;
    machinesFiltersCtrl.departments = $filter('orderBy')($localStorage[$scope.DepName].departments, machinesFiltersCtrl.localLanguage ? 'DepartmentLname' : 'DepartmentEname') || $filter('orderBy')(defaultData.departments, machinesFiltersCtrl.localLanguage ? 'DepartmentLname' : 'DepartmentEname');
    machinesFiltersCtrl.machineStatues = $localStorage[$scope.DepName].machineStatues || defaultData.machineStatues;
    machinesFiltersCtrl.machineAlarms = $localStorage[$scope.DepName].machineAlarms || defaultData.machineAlarms;
    machinesFiltersCtrl.machineServices = $localStorage[$scope.DepName].machineServices || defaultData.machineServices;
    machinesFiltersCtrl.kpiInput = $localStorage[$scope.DepName].kpiInput || angular.copy(defaultData.kpiInput);
    machinesFiltersCtrl.jobDefinition = $localStorage[$scope.DepName].jobDefinition || angular.copy(defaultData.jobDefinition);
    machinesFiltersCtrl.machineClassifications = $localStorage[$scope.DepName].machineClassifications || angular.copy(defaultData.machineClassifications);

    if (!machinesFiltersCtrl.machineClassifications || machinesFiltersCtrl.machineClassifications.length === 0) {
      machinesFiltersCtrl.machineClassifications = angular.copy(defaultData.machineClassifications);
    }
    if (!machinesFiltersCtrl.jobDefinition || machinesFiltersCtrl.jobDefinition.length === 0) {
      LeaderMESservice.customAPI("GetJobDefinitions", {}).then(function (response) {
        machinesFiltersCtrl.jobDefinition = response.JobDefinitions;
      });
    }

    $scope.lastMachinePerLine = $scope.allData
      .map((dep) => dep.DepartmentsMachine)
      .flat()
      .filter((it) => it.NextLineMachineID)
      .map((it) => {
        return {
          ID: it.MachineID,
          next: it.NextLineMachineID,
          LineSequnece: it.LineSequnece,
          lineID: it.LineID
        };
      })
      .reduce((result, currentValue) => {
        result[currentValue.lineID] = result[currentValue.lineID] || [];
        if (result[currentValue.lineID].length > 0) {
          if (result[currentValue.lineID][0].LineSequnece < currentValue.LineSequnece) {
            result[currentValue.lineID][0] = currentValue;
          }
        } else {
          result[currentValue.lineID].push(currentValue);
        }
        return result;
      }, {});

    $scope.initMachineDisplay = function () {
      $scope.allData.forEach(function (department) {
        if (department.DepartmentsMachine) {
          department.DepartmentsMachine.forEach(function (machine) {
            machine.display = true;
          });
        }
      });
    };

    $scope.getFilterData = function () {
      $scope.allData.forEach(function (department) {
        if (department.DepartmentsMachine) {
          $scope.getDepartments(department);
          department.DepartmentsMachine.forEach(function (machine) {
            machine.DepartmentID = department.DepartmentID;
            $scope.getMachineTypes(machine);
            $scope.getmachinesGroups(machine);
            $scope.getMachines(machine);
            $scope.getMachineStatuses(machine);
          });
          if (_.findIndex(machinesFiltersCtrl.machinesGroups, {
              machineGroupName: ""
            }) < 0) {
            machinesFiltersCtrl.machinesGroups.push({
              machineGroupName: ''
            });
          }
        }
      });
    };

    $scope.getMachineTypes = function (machine) {
      var machineTypeIndex = _.findIndex(machinesFiltersCtrl.machineTypes, {
        MachineTypeID: machine.MachineTypeID
      });
      if (machineTypeIndex < 0) {
        machinesFiltersCtrl.machineTypes.push({
          MachineTypeEName: machine.MachineTypeEName,
          MachineTypeID: machine.MachineTypeID,
          MachineTypeLName: machine.MachineTypeLName,
        });
      } else {
        machinesFiltersCtrl.machineTypes[machineTypeIndex].MachineTypeEName = machine.MachineTypeEName;
        machinesFiltersCtrl.machineTypes[machineTypeIndex].MachineTypeLName = machine.MachineTypeLName;
      }
    };

    $scope.getmachinesGroups = function (machine) {
      machinesFiltersCtrl.machineGroupFieldName = machinesFiltersCtrl.localLanguage ? 'MachineGroupLName' : 'MachineGroupEName';
      var machineGroupIndex = _.findIndex(machinesFiltersCtrl.machinesGroups, {
        machineGroupName: machine[machinesFiltersCtrl.machineGroupFieldName]
      });
      if (machineGroupIndex < 0 && machine[machinesFiltersCtrl.machineGroupFieldName]) {
        machinesFiltersCtrl.machinesGroups.push({
          machineGroupName: machine[machinesFiltersCtrl.machineGroupFieldName]
        });
      }
      machinesFiltersCtrl.machinesGroups = $filter('orderBy')(machinesFiltersCtrl.machinesGroups, 'machineGroupName');
    };

    $scope.getMachines = function (machine) {
      var machineIndex = _.findIndex(machinesFiltersCtrl.machines, {
        MachineID: machine.MachineID
      });
      if (machineIndex < 0) {
        machinesFiltersCtrl.machines.push({
          MachineEName: machine.MachineEName,
          MachineID: machine.MachineID,
          MachineLname: machine.MachineLname,
          MachineTypeID: machine.MachineTypeID,
          DepartmentID: machine.DepartmentID,
          MachineGroupLName: machine.MachineGroupLName,
          MachineGroupEName: machine.MachineGroupEName,
          display: true,
        });
      } else {
        machinesFiltersCtrl.machines[machineIndex].MachineEName = machine.MachineEName;
        machinesFiltersCtrl.machines[machineIndex].MachineLname = machine.MachineLname;
        machinesFiltersCtrl.machines[machineIndex].MachineGroupLName = machine.MachineGroupLName;
        machinesFiltersCtrl.machines[machineIndex].MachineGroupEName = machine.MachineGroupEName;
      }
    };

    $scope.getDepartments = function (department) {
      var machineIndex = _.findIndex(machinesFiltersCtrl.departments, {
        DepartmentID: department.DepartmentID
      });
      if (machineIndex < 0) {
        machinesFiltersCtrl.departments.push({
          DepartmentID: department.DepartmentID,
          DepartmentEname: department.DepartmentEname,
          DepartmentLname: department.DepartmentLname,
          display: true,
        });
      } else {
        machinesFiltersCtrl.departments[machineIndex].DepartmentEname = department.DepartmentEname;
        machinesFiltersCtrl.departments[machineIndex].DepartmentLname = department.DepartmentLname;
      }
    };

    $scope.getMachineStatuses = function (machine) {
      var machineStatusIndex = _.findIndex(machinesFiltersCtrl.machineStatues, {
        MachineStatusID: machine.MachineStatusID
      });
      if (machineStatusIndex < 0) {
        machinesFiltersCtrl.machineStatues.push({
          MachineStatusEname: machine.MachineStatusEname,
          MachineStatusID: machine.MachineStatusID,
          MachineStatusName: machine.MachineStatusName,
        });
      } else {
        machinesFiltersCtrl.machineStatues[machineStatusIndex].MachineStatusEname = machine.MachineStatusEname;
        machinesFiltersCtrl.machineStatues[machineStatusIndex].MachineStatusName = machine.MachineStatusName;
      }
    };

    $scope.getFilterData();

    $scope.resetDataByType = function (data) {
      date = _.map(data, function (el) {
        el.selected = false;
        return el;
      });
    };

    machinesFiltersCtrl.resetData = function () {
      $scope.hasFilter = false;
      machinesFiltersCtrl.kpiInput = angular.copy(defaultData.kpiInput);

      $scope.resetDataByType(machinesFiltersCtrl.productionLinesFilter);
      $scope.resetDataByType(machinesFiltersCtrl.machinesGroups);
      $scope.resetDataByType(machinesFiltersCtrl.machineTypes);
      $scope.resetDataByType(machinesFiltersCtrl.machines);
      $scope.resetDataByType(machinesFiltersCtrl.departments);
      $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
      $scope.resetDataByType(machinesFiltersCtrl.machineAlarms);
      $scope.resetDataByType(machinesFiltersCtrl.jobDefinition);
      $scope.resetDataByType(machinesFiltersCtrl.machineClassifications);
      $scope.resetDataByType(machinesFiltersCtrl.machineServices);
      machinesFiltersCtrl.filterData();
    };

    $scope.checkMachineType = function (machineTypeIds, machine) {
      if (machineTypeIds.length == 0) {
        return true;
      }
      return machineTypeIds.indexOf(machine.MachineTypeID) >= 0;
    };

    $scope.checkMachine = function (machineIds, machine) {
      if (machineIds.length == 0) {
        return true;
      }
      return machineIds.indexOf(machine.MachineID) >= 0;
    };

    $scope.checkDepartment = function (departmentIds, department) {
      if (departmentIds.length == 0) {
        return true;
      }
      return departmentIds.indexOf(department.DepartmentID) >= 0;
    };

    $scope.checkMachineStatus = function (machineStatusIds, machine) {
      if (machineStatusIds.length == 0) {
        return true;
      }
      return machineStatusIds.indexOf(machine.MachineStatusID) >= 0;
    };

    $scope.checkMachineKPIs = function (machineKPIs, machine) {
      for (var i = 0; i < machineKPIs.length; i++) {
        var kpi = machineKPIs[i];
        if (machine[kpi.param] >= kpi.value) {
          return false;
        }
      }
      return true;
    };

    $scope.checkAlarms = function (machineAlarms, machine) {
      var ans = true;
      for (var i = 0; i < machineAlarms.length; i++) {
        if (machineAlarms[i] == "productionTargetReached") {
          if (machine.UnitsProducedOK >= machine.UnitsTarget) {
            return true;
          } {
            ans = false;
          }
        } else if (machineAlarms[i] == "cyclesDetecedInNonProduction") {
          if (machine.ProductionModeWarning == "True") {
            return true;
          } else {
            ans = false;
          }
        } else if (machineAlarms[i] == "deviationFromTheTheoreticalTarget") {
          if (
            machine.UnitsProducedTheoreticallyJosh * 0.8 > machine.UnitsProducedOKJosh &&
            machine.UnitsProducedOKJosh < machine.UnitsTargetJosh &&
            machine.MachineStatusID !== 0
          ) {
            return true;
          } else {
            ans = false;
          }
        } else if (machineAlarms[i] == "openServiceCall") {
          if ($scope.depTechnicianStatus[machine.MachineID].totalOpenCalls > 0) {
            return true;
          } else {
            ans = false;
          }
        }
      }
      return ans;
    };

    $scope.checkServices = function (machineServices, machine) {
      var ans = true;
      for (var i = 0; i < machineServices.length; i++) {
        if (machineServices[i] == "openServiceCall") {
          if ($scope.depTechnicianStatus[machine.MachineID].totalOpenCalls > 0) {
            return true;
          } else {
            ans = false;
          }
        }
      }
      return ans;
    };

    $scope.checkProductionLine = function (machineEndIds, machine) {
      if (machineEndIds.length == 0 || machine.LineID === 0) {
        machine.showEndLine = false;
        return true;
      }
      let lineID = machine.LineID;
      machine.showEndLine = machine.LineID > 0 && machine.NextLineMachineID === 0;
      machine.productionName = machinesFiltersCtrl.localLanguage ?
        $scope.machinesLinesMap[lineID].LName :
        $scope.machinesLinesMap[lineID].EName;
      return machineEndIds.indexOf(machine.MachineID) >= 0;

      if (machineIds.length == 0) {
        return true;
      }
      return machineIds.indexOf(machine.MachineID) >= 0;
    };

    $scope.checkJobDefinitions = function (jobDefinitionIds, machine) {
      if (jobDefinitionIds.length == 0) {
        return true;
      }
      return jobDefinitionIds.indexOf(machine.JobDefID) >= 0;
    };

    $scope.checkMachineClassifications = function (machineClassificationId, machine) {
      if (machineClassificationId.length == 0) {
        return true;
      }
      return machineClassificationId.indexOf(machine.MachineClassification) >= 0;
    };

    $scope.saveFilterDataToSession = function () {
      $localStorage[$scope.DepName].productionLinesFilter = machinesFiltersCtrl.productionLinesFilter;
      $localStorage[$scope.DepName].machineTypes = machinesFiltersCtrl.machineTypes;
      $localStorage[$scope.DepName].machines = machinesFiltersCtrl.machines;
      $localStorage[$scope.DepName].departments = machinesFiltersCtrl.departments;
      $localStorage[$scope.DepName].machineStatues = machinesFiltersCtrl.machineStatues;
      $localStorage[$scope.DepName].machineAlarms = machinesFiltersCtrl.machineAlarms;
      $localStorage[$scope.DepName].machineServices = machinesFiltersCtrl.machineServices;
      $localStorage[$scope.DepName].kpiInput = machinesFiltersCtrl.kpiInput;
      $localStorage[$scope.DepName].jobDefinition = machinesFiltersCtrl.jobDefinition;
      $localStorage[$scope.DepName].machineClassifications = machinesFiltersCtrl.machineClassifications;
    };

    machinesFiltersCtrl.filterData = function (eventType, id, selected) {
      let productionLinesMap = Object.assign({}, ...machinesFiltersCtrl.productionLinesFilter.map((item) => ({
        [item.name]: item
      })));
      let displayEndLines = productionLinesMap["displayEndLines"];
      var departmentIds = _.map(_.filter(machinesFiltersCtrl.departments, {
        selected: true
      }), "DepartmentID");
      var machineTypeIds = _.map(_.filter(machinesFiltersCtrl.machineTypes, {
        selected: true
      }), "MachineTypeID");
      var machineIds = _.map(_.filter(machinesFiltersCtrl.machines, {
        selected: true
      }), "MachineID");
      var machineStatusIds = _.map(_.filter(machinesFiltersCtrl.machineStatues, {
        selected: true
      }), "MachineStatusID");
      var machineAlarms = _.map(_.filter(machinesFiltersCtrl.machineAlarms, {
        selected: true
      }), "name");
      var machineServices = _.map(_.filter(machinesFiltersCtrl.machineServices, {
        selected: true
      }), "name");
      var jobDefinitionIds = _.map(_.filter(machinesFiltersCtrl.jobDefinition, {
        selected: true
      }), "ID");
      var machineClassificationsIds = _.map(_.filter(machinesFiltersCtrl.machineClassifications, {
        selected: true
      }), "ID");
      var machinesEndIds = displayEndLines.selected ?
        $scope.allData
        .map((dep) => dep.DepartmentsMachine)
        .flat()
        .filter((it) => it.EndOfLine)
        .map((it) => it.MachineID) :
        [];

      var machineKPIs = _.filter(machinesFiltersCtrl.kpiInput, function (kpi) {
        return kpi.value;
      });
      $scope.saveFilterDataToSession();
      if (eventType === 0) {
        machineIds = $scope.machineParentFilterEventHandler(selected, machineIds, "MachineTypeID", id);
      } else if (eventType === 1) {
        $scope.machineFilterEventHandler(machinesFiltersCtrl.machineTypes, machineTypeIds, "MachineTypeID", id);
      } else if (eventType === 2) {
        machineIds = $scope.machineParentFilterEventHandler(selected, machineIds, "DepartmentID", id);
      } else if (eventType === 3) {
        $scope.machineFilterEventHandler(machinesFiltersCtrl.departments, departmentIds, "DepartmentID", id);
      } else if (eventType === 4) {
        machineIds = $scope.machineParentFilterEventHandler(selected, machineIds, machinesFiltersCtrl.machineGroupFieldName, id);
      }
      
      if (
        machineAlarms.length ||
        machineIds.length ||
        machineStatusIds.length ||
        machineTypeIds.length ||
        machineKPIs.length ||
        machineServices.length || 
        machineClassificationsIds.length
      ) {
        // $scope.hasFilter = true;
        $scope.$emit("hasFilter", true);
      } else {
        // $scope.hasFilter = false;
        $scope.$emit("hasFilter", false);
      }
      let numOfmachinesToDisplay = 0;
      $scope.allData.forEach(function (department) {

        department.DepartmentsMachine.forEach(function (machine) {
          machine.selectedDisplayEndLines = displayEndLines.selected;
          if (!$scope.checkProductionLine(machinesEndIds, machine)) {
            machine.display = false;
            return;
          }

          if (!$scope.checkMachineKPIs(machineKPIs, machine)) {
            machine.display = false;
            return;
          }

          if (!$scope.checkDepartment(departmentIds, department)) {
            machine.display = false;
            return;
          }

          if (!$scope.checkMachineType(machineTypeIds, machine)) {
            machine.display = false;

            return;
          }
          if (!$scope.checkMachine(machineIds, machine)) {
            machine.display = false;
            return;
          }
          if (!$scope.checkMachineStatus(machineStatusIds, machine)) {
            machine.display = false;
            return;
          }
          if (!$scope.checkAlarms(machineAlarms, machine)) {
            machine.display = false;
            return;
          }
          if (!$scope.checkServices(machineServices, machine)) {
            machine.display = false;
            return;
          }
          if (!$scope.checkJobDefinitions(jobDefinitionIds, machine)) {
            machine.display = false;
            return;
          }
          if (!$scope.checkMachineClassifications(machineClassificationsIds, machine)) {
            machine.display = false;
            return;
          }
          machine.display = true;
          numOfmachinesToDisplay = numOfmachinesToDisplay + 1;
        });
      });
              
      $scope.getMachineDataWrapper(numOfmachinesToDisplay,machineIds)
    };


    $scope.getMachineDataWrapper = function (machinesNumber,machineIds) {
      if ($scope.getMachineDataTimeout) {
        $timeout.cancel($scope.getMachineDataTimeout);
      }
      $scope.getMachineDataTimeout = $timeout(function () {
        $scope.getMachineData(machinesNumber,machineIds);
      },650);
    };

    $scope.getMachineData = function (machinesNumber,machineIds) {
      if($scope.allData)
      {
        LeaderMESservice.customAPI("GetMachineCubeData", { DepartmentID: $scope.allData.length > 1 ? 0 :$scope.allData[0].DepartmentID ,MachineID:machineIds}).then(
          function (response) {
            var obj =  {
              PE:response && response.AllDepartments && response.AllDepartments[0]&& response.AllDepartments[0].DepartmentPEE,
              machines:machinesNumber
            }
             $scope.$emit('changeMachinesNumberAndPE',obj)
          }
        );
      }
    };
    $scope.machineParentFilterEventHandler = function (selected, listIds, propID, id) {
      machinesFiltersCtrl.machines
        .filter((item) => item[propID] === id)
        .forEach((item) => {
          item.selected = selected;
          if (selected) {
            listIds.push(item.MachineID);
          } else {
            listIds = listIds.filter((it) => it !== item.MachineID);
          }
        });
      return listIds;
    };
    $scope.machineFilterEventHandler = function (filteredList, listIds, propID, id) {
      let departmentSelected = _.map(
        machinesFiltersCtrl.machines.filter((it) => it.MachineID === id),
        propID
      );
      let machineDepartment = machinesFiltersCtrl.machines.filter((it) => it[propID] === departmentSelected[0] && it.selected);
      if (machineDepartment.length === 0) {
        filteredList.filter((it) => it[propID] === departmentSelected[0])[0].selected = false;
      }
      departmentSelected.forEach(function (item) {
        if (listIds.indexOf(item) === -1) {
          listIds.push(item);
          filteredList.filter((it) => it[propID] === item)[0].selected = true;
        }
      });
    };

    $scope.$watch(
      "allData",
      function (newValue) {
        if ($scope.filterTimeout) {
          $timeout.cancel($scope.filterTimeout);
        }
        $scope.filterTimeout = $timeout(function () {
          machinesFiltersCtrl.filterData();
        });
      },
      true
    );

    $scope.$watch(
      "machinesFiltersCtrl.productionLinesFilter",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );
    $scope.$watch(
      "machinesFiltersCtrl.jobDefinition",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );
    $scope.$watch(
      "machinesFiltersCtrl.machineClassifications",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );
    $scope.$watch(
      "machinesFiltersCtrl.machineStatues",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );

    $scope.$watch(
      "machinesFiltersCtrl.machineAlarms",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );

    $scope.$watch(
      "machinesFiltersCtrl.machineServices",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );

    $scope.$watch(
      "machinesFiltersCtrl.kpiInput",
      function (value) {
        machinesFiltersCtrl.filterData();
      },
      true
    );

    $scope.$watch(
      "resetData",
      function (newValue, oldValue) {
        if (newValue != oldValue) {
          machinesFiltersCtrl.resetData();
        }
      },
      true
    );

    $scope.updateStatus.func = function (statusId, clearAll) {
      if (clearAll) {
        $scope.resetDataByType(machinesFiltersCtrl.machineTypes);
        $scope.resetDataByType(machinesFiltersCtrl.machines);
        $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
        $scope.resetDataByType(machinesFiltersCtrl.machineAlarms);
        $scope.resetDataByType(machinesFiltersCtrl.machineServices);
        $scope.resetDataByType(machinesFiltersCtrl.kpiInput);
      } else {
        $scope.resetDataByType(machinesFiltersCtrl.machineStatues);
        var status = _.find(machinesFiltersCtrl.machineStatues, {
          MachineStatusID: parseInt(statusId)
        });
        if (status) {
          status.selected = true;
        }
      }
    };
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      allData: "=",
      department: "=",
      resetData: "=",
      updateStatus: "=",
      hasFilter: "=",
      type: "=",
      machinesLinesMap: "=",
      depTechnicianStatus: "=",
    },
    controller: controller,
    controllerAs: "machinesFiltersCtrl",
  };
}

angular.module("LeaderMESfe").directive("machinesFiltersDirective", machinesFiltersDirective);