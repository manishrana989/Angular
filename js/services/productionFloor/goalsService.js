angular
  .module("LeaderMESfe")
  .factory("GoalsService", function (
    $compile,
    $window,
    $timeout,
    $filter,
    $interval,
    LeaderMESservice,
    googleAnalyticsService,
    $q,
    SweetAlert,
    DASHBOARD_CONSTANTS,
    PRODUCTION_FLOOR,
    shiftService,
    $modal,
    GLOBAL,
    toastr
  ) {
    function openSetTargetsModal($scope, factoryView) {
      var allDepartments = $scope.allDepartments;
      $modal
        .open({
          windowClass: "allGoalsModal",
          controllerAs: "setTargetsModal",
          templateUrl: "views/common/newGoalsModal.html",
          controller: function ($scope, $modalInstance, LeaderMESservice, $filter) {
            var setTargetsModal = this;
            setTargetsModal.factoryView = factoryView;
            $scope.departments = allDepartments;
            $scope.rtl = LeaderMESservice.isLanguageRTL();
            $scope.selectedDepartment = null;
            $scope.disableInput = function (item) {
              return item.Name == "OEETarget" || item.Name == "PEETarget";
            };

            $scope.machineRankValues = [0, 1, 2, 3];

            $scope.getKPITarget = function (target, targetId) {
              LeaderMESservice.customAPI("GetKpiTargetValues", {
                KpiTarget: target,
                TargetID: targetId,
              }).then(function (response) {
                setTargetsModal.isFixed = response.IsFixedTarget;
                setTargetsModal.machineRank = response.MachineRank;
                if ($scope.pageSelected == "machine" && setTargetsModal.chosenMachine !== undefined) {
                  var fixedCount = _.countBy($scope.depMachines, { IsFixedTarget: true });
                  if (fixedCount.false == 1 && !response.IsFixedTarget) {
                    $scope.depMachines[setTargetsModal.chosenMachine].disableFixed = true;
                  } else {
                    $scope.depMachines[setTargetsModal.chosenMachine].disableFixed = false;
                  }
                  $scope.depMachines[setTargetsModal.chosenMachine].MachineRank = response.MachineRank;
                  $scope.depMachines[setTargetsModal.chosenMachine].IsFixedTarget = response.IsFixedTarget;
                  var depTemp = _.find($scope.departments, { DepartmentID: $scope.selectedDepForMachine.DepartmentID });
                  if (depTemp) {
                    var machTemp = _.find(depTemp.DepartmentsMachine, { MachineID: targetId });
                    if (machTemp) {
                      machTemp.IsFixedTarget = response.IsFixedTarget;
                    }
                  }
                } else if ($scope.pageSelected == "department") {
                  var fixedCount = _.countBy($scope.departments, { IsFixedTarget: true });
                  if (fixedCount.false == 1 && !response.IsFixedTarget) {
                    $scope.selectedDepartment.disableFixed = true;
                  } else {
                    $scope.selectedDepartment.disableFixed = false;
                  }
                  $scope.selectedDepartment.IsFixedTarget = response.IsFixedTarget;
                }
                $scope.kpiData = angular.copy(response.KpiTargetName);
                angular.forEach($scope.kpiData, function (i) {
                  i.value = parseFloat(response.KpiTargetData[i.Name].toFixed(2));
                });
              });

              if (target === 3) {
                $scope.pageSelected = "factory";
              }
            };

            $scope.updateDepMachines = function (dep) {
              $scope.depMachines = _.map(_.find($scope.departments, { DepartmentID: dep.DepartmentID }).DepartmentsMachine, function (i) {
                return {
                  MachineEName: i.MachineEName,
                  MachineLName: i.MachineLname,
                  MachineRank: i.MachineRank,
                  IsFixedTarget: i.IsFixedTarget,
                  MachineID: i.MachineID,
                };
              });
            };

            if (!setTargetsModal.factoryView) {
              $scope.selectedDepartment = $scope.departments[0];
              $scope.getKPITarget(2, $scope.selectedDepartment.DepartmentID);
              $scope.pageSelected = "department";
              $scope.selectedDepForMachine = $scope.departments[0];
              $scope.selectedDepForMachine = $scope.departments[0];
              $scope.updateDepMachines($scope.selectedDepForMachine);
            } else {
              $scope.getKPITarget(3);
              $scope.pageSelected = "factory";
            }

            $scope.close = function () {
              $modalInstance.close();
            };

            $scope.updateMachineFixed = function (disableFixed) {
              if (!disableFixed) {
                setTargetsModal.isFixed = !setTargetsModal.isFixed;
              }
            };

            $scope.save = function () {
              if ($scope.disabled) {
                return;
              }
              $scope.disabled = true;
              var data = {};

              angular.forEach($scope.kpiData, function (i) {
                data[i.Name] = i.value;
              });

              if ($scope.pageSelected == "factory") {
                LeaderMESservice.customAPI("UpdateFactoryTarget", {
                  IsFixedTarget: setTargetsModal.isFixed || false,
                  data: data,
                }).then(function () {
                  // $modalInstance.close();
                  $scope.getKPITarget(3, undefined);
                  $scope.disabled = false;
                  // toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                });
              } else if ($scope.pageSelected == "department") {
                LeaderMESservice.customAPI("UpdateDepartmentTarget", {
                  DepartmentID: $scope.selectedDepartment.DepartmentID,
                  IsFixedTarget: setTargetsModal.isFixed || false,
                  data: data,
                }).then(function () {
                  $scope.getKPITarget(2, $scope.selectedDepartment.DepartmentID);
                  $scope.disabled = false;
                  // $modalInstance.close();
                });
              } else if ($scope.pageSelected == "machine") {
                LeaderMESservice.customAPI("UpdateMachineTarget", {
                  MachineID: $scope.depMachines[setTargetsModal.chosenMachine].MachineID,
                  MachineRank: setTargetsModal.machineRank,
                  IsFixedTarget: setTargetsModal.isFixed || false,
                  data: data,
                }).then(function () {
                  $scope.disabled = false;
                  $scope.getKPITarget(1, $scope.depMachines[setTargetsModal.chosenMachine].MachineID);
                  if ($scope.pageSelected == "machine" && setTargetsModal.chosenMachine !== undefined) {
                    $scope.depMachines[setTargetsModal.chosenMachine].MachineRank = setTargetsModal.machineRank;
                    $scope.depMachines[setTargetsModal.chosenMachine].IsFixedTarget = setTargetsModal.isFixed;
                    var depTemp = _.find($scope.departments, { DepartmentID: $scope.selectedDepForMachine.DepartmentID });
                    if (depTemp) {
                      var machTemp = _.find(depTemp.DepartmentsMachine, {
                        MachineID: $scope.depMachines[setTargetsModal.chosenMachine].MachineID,
                      });
                      if (machTemp) {
                        machTemp.IsFixedTarget = setTargetsModal.isFixed;
                        machTemp.MachineRank = setTargetsModal.machineRank;
                      }
                    }
                  }
                  // $modalInstance.close();
                });
              }
            };
          },
        })
        .result.then(function () {
          $scope.getTargets();
          $rootScope.$broadcast("get-targets");
        });
    }

    function openOnlineSetTargetsModal($scope) {
      var allDepartments = $scope.allDepartments;
      $modal.open({
        windowClass: "allGoalsModal",
        controllerAs: "setOnlineTargetsModal",
        templateUrl: "views/common/onlineSetTargetGoalsModal.html",
        controller: function ($scope, $modalInstance, LeaderMESservice, $filter) {
          var setTargetsOnlineModal = this;
          $scope.departments = allDepartments;
          $scope.machinesList = [];
          $scope.shiftDefinition = [];
          $scope.rtl = LeaderMESservice.isLanguageRTL();
          $scope.selectedDepartment = null;

          $scope.getShiftDefinitionTargetSettings = function (DepartmentID) {
            let body = { DepartmentID: DepartmentID };
            LeaderMESservice.customAPI("GetShiftDefinitionTargetSettings", body).then(function (response) {
      
              $scope.machinesList = response.ResponseDictionaryDT.Machines;
              $scope.machinesList = Object.entries(_.groupBy($scope.machinesList, "ID")).map((it) => {
                return {
                  ID: it[1][0].ID,
                  MachineName: it[1][0].MachineName,
                  MachineLName: it[1][0].MachineLName,
                  shifts: it[1].map((item) => {
                    return { ShiftDefID: item.ShiftDefID, TargetValue: item.TargetValue };
                  }),
                };
              });
              $scope.shiftDefinition = response.ResponseDictionaryDT.ShiftDefinition;
              let currentShiftIdx = $scope.shiftDefinition.findIndex((it) => it.CurrentShift === 1);
              currentShiftIdx = Math.max(currentShiftIdx, 0);
              if (currentShiftIdx >= 0) {
                $scope.shiftDefinitionToDisplay = $scope.shiftDefinition.slice(currentShiftIdx, Math.min(currentShiftIdx + 5, $scope.shiftDefinition.length)); 
                if(currentShiftIdx + 6 < $scope.shiftDefinition.length)
                {
                  $scope.shiftDefinitionToDisplay.push("addColumn");
                }
                $scope.tableDate = $scope.machinesList.map((it) => {
                  return $scope.shiftDefinition
                    .slice(currentShiftIdx, Math.min(currentShiftIdx + 5, $scope.shiftDefinition.length))
                    .map((shift) => {
                      let itemShift = it.shifts.find((it) => it.ShiftDefID === shift.ID);
                      return {
                        MachineID: it.ID,
                        ShiftDefID: shift.ID,
                        TargetValue: itemShift ? itemShift.TargetValue : 0, //todo not zero
                      };
                    });
                });
              } else {
                console.log("error no current shift");
              }
            });
          };
          $scope.addNewColumn = function () {
            var shiftsTemp,findObj;
              let prevLength = $scope.shiftDefinitionToDisplay.length;
              let startIndex = $scope.shiftDefinition.indexOf($scope.shiftDefinition.find((it) => it.CurrentShift === 1));
              startIndex = Math.max(startIndex, 0);
              if (startIndex >= 0) {
                $scope.shiftDefinitionToDisplay = $scope.shiftDefinition.slice(startIndex, startIndex + prevLength);
                $scope.tableDate.forEach((it) => {
                  it.push(angular.copy(it[it.length - 1]));
                  it[it.length - 1].ShiftDefID = $scope.shiftDefinitionToDisplay[it.length - 1].ID;
                  shiftsTemp = _.find($scope.machinesList, { ID: it[it.length - 1].MachineID }).shifts;     
                  findObj =_.find(shiftsTemp, { ShiftDefID: it[it.length - 1].ShiftDefID })
                  if(findObj)
                  {                      
                    it[it.length - 1].TargetValue = findObj.TargetValue;
                  }
                });
              }
              if (startIndex + prevLength < $scope.shiftDefinition.length) {
                $scope.shiftDefinitionToDisplay.push("addColumn");
              }
            
          };
          $scope.updateShiftDefTarget = function () {
            let shiftDefToDisplayLen = $scope.shiftDefinitionToDisplay.length;
            let showedTableLength =
              $scope.shiftDefinitionToDisplay[shiftDefToDisplayLen - 1] === "addColumn" ? shiftDefToDisplayLen - 1 : shiftDefToDisplayLen;
            let body = {
              values: $scope.tableDate.map((it) => {
                let list = it.slice(0, showedTableLength);
                list.forEach((machine, idx) => {
                  if (idx === 0) {
                    machine.Current = true;
                  }
                });
                return list;
              }),
            };
            body.values = body.values.flat();
            LeaderMESservice.customAPI("UpdateShiftDefTarget", body).then(function (response) {
              if (!response.error) {
                toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
              } else {
                toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
              }
            });
          };

          $scope.close = function () {
            $modalInstance.close();
          };
        },
      });
    }

    return {
      openSetTargetsModal: openSetTargetsModal,
      openOnlineSetTargetsModal: openOnlineSetTargetsModal,
    };
  });
