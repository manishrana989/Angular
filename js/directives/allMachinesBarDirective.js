var allMachinesBarDirective = function ($filter, OnlineService, LeaderMESservice, OnlineSettingsService, toastr) {
  var Template = "views/custom/productionFloor/onlineTab/allMachinesBar.html";

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      machine: "=",
      options: "=",
      type: "=",
      dep: "=",
      data: "=",
      expand: "=",
      pieSizeClass: "=",
      showPencils: "=",
      sortData: "=",
      isDefaultStructure: "=",
      hasFiltering: "=",
      allMachinesFullScreen: "=",
      machinesLinesMap: "=",
    },
    controller: function ($scope, shiftService, LeaderMESservice, CollapsedMachinesService, $timeout, $localStorage, $sessionStorage) {
      var allMachinesBarCtrl = this;
      $scope.rtl = LeaderMESservice.isLanguageRTL();
      $scope.barClass = "inner-container-pie";
      // check if local language
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      $scope.isDefault = $scope.isDefaultStructure;
      // isSettingsTaken=false
      $scope.selectTemplateGroupID = $localStorage.selectTemplateGroupID;

      if ($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type]) {
        $scope.machineOnlineSettings = $localStorage.machineOnlineSettings[$scope.type];
      } else {
        $scope.machineOnlineSettings = angular.copy(OnlineService.machineOnlineSettings);
      }


      $scope.$watch(
        "machineOnlineSettings.verticalView",
        (newVal, oldVal) => {
          if (newVal !== oldVal) {
            let depName = "";
            if ($scope.machineOnlineSettings.departmentView && $scope.sortedMachines && $scope.sortedMachines[0]) {
              depName = "dep_" + $scope.sortedMachines[0].DepartmentID;
            }
            $timeout(() => {
              OnlineService.drawProductionLines($scope.sortedMachines, OnlineService.cardPrefEnum[$scope.type], $scope.machineOnlineSettings.departmentView ? depName : "allMachines", $scope.type, $scope.machineOnlineSettings.verticalView);
            }, 300);
          }
        },
        true
      );

      $scope.$watch(
        "allMachinesFullScreen.value",
        (newVal, oldVal) => {
          if (newVal !== oldVal) {
            let depName = "";
            if ($scope.machineOnlineSettings.departmentView && $scope.sortedMachines && $scope.sortedMachines[0]) {
              depName = "dep_" + $scope.sortedMachines[0].DepartmentID;
            }
            $timeout(() => {
              OnlineService.drawProductionLines($scope.sortedMachines, OnlineService.cardPrefEnum[$scope.type], $scope.machineOnlineSettings.departmentView ? depName : "allMachines", $scope.type, $scope.machineOnlineSettings.verticalView);
            }, 150);
          }
        },
        true
      );

      $scope.$watch("hasFiltering", (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            let depName = "";
            if ($scope.machineOnlineSettings.departmentView && $scope.sortedMachines && $scope.sortedMachines[0]) {
              depName = "dep_" + $scope.sortedMachines[0].DepartmentID;
            }
            $timeout(() => {
              OnlineService.drawProductionLines($scope.sortedMachines, OnlineService.cardPrefEnum[$scope.type], $scope.machineOnlineSettings.departmentView ? depName : "allMachines", $scope.type, $scope.machineOnlineSettings.verticalView);
            }, 300);
          } else {
            OnlineService.deleteProductionLines();
          }
        }
      });

      $scope;
      var menuAndSubMenu = LeaderMESservice.getMainMenu();
      $scope.sortedMachines = [];
      $scope.machinesColors = [];
      $scope.total = [];
      allMachinesBarCtrl.dep = [];
      LeaderMESservice.customAPI("GetProductionProgressColorDefinition", {}).then(function (response) {
        var index;
        _.forEach(response.ResponseList, function (temp) {
          index = _.findIndex($scope.machineOnlineSettings.percentageColors, { parameterID: temp.ParameterID });
          if (index > -1) {
            $scope.machineOnlineSettings.percentageColors[index].color = temp.ColorID;
            $scope.machineOnlineSettings.percentageColors[index].value = parseFloat(temp.Pc.toFixed(2));
          }
        });
      });

      $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure;
      if ($scope.allowSetDefaultMachineStructure) {
        LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
          $scope.usersData = response.Users;
          $scope.groupsData = response.Groups;
        });
      }

      $scope.getCollapsedStructure = function (index) {
        let start = 0,
          reqBody;
        let end = allMachinesBarCtrl.dep ? allMachinesBarCtrl.dep.length : 0;
        if (index !== undefined) {
          start = index;
          end = index + 1;
        }
        for (let i = start; i < end; i++) {
          var machineBody = _.map(allMachinesBarCtrl.dep[i].DepartmentsMachine, function (machine) {
            return machine.MachineID;
          });
          $scope.loading = true;
          if ($scope.selectTemplateGroupID.collapsed > -1) {
            reqBody = {
              machines: machineBody,
              structureType: 2,
              IsDefault: $scope.selectTemplateGroupID.collapsed >= -1 ? true : false,
              GroupID: _.isNumber($scope.selectTemplateGroupID.collapsed) && $scope.selectTemplateGroupID.collapsed,
            };
          } else {
            reqBody = {
              machines: machineBody,
              structureType: 2,
            };
            if ($scope.selectTemplateGroupID.collapsed == -1) {
              reqBody.IsDefault = true;
              reqBody.GroupID = $sessionStorage.userAuthenticated?.TemplateID;
            } else {
              reqBody.IsDefault = false;
            }
          }
          LeaderMESservice.customAPI("GetMachineStructure", reqBody).then(function (response) {
            if ($scope.type == "online") {
              $scope.updateSettings(JSON.parse(response.PageStructure));
            }
            for (let j = 0; j < allMachinesBarCtrl.dep[i].DepartmentsMachine.length; j++) {
              var machineId = allMachinesBarCtrl.dep[i].DepartmentsMachine[j].MachineID;
              filteredStructure = _.filter(angular.copy(response.Structure), function (machine, i) {
                return (machine = machine.splice(0, 1));
              });
              var machineStruct = _.find(filteredStructure, [{ FieldName: "MachineID", Value: machineId.toString() }]);

              if (machineStruct) {
                var Structure = _.find(machineStruct, { FieldName: "Structure" });
                if (Structure) {
                  try {
                    if (JSON.parse(Structure?.Value).length == 7) {
                      allMachinesBarCtrl.collpasedMachinesStructure[machineId] = JSON.parse(Structure?.Value);
                    } else {
                      allMachinesBarCtrl.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                    }
                    continue;
                  } catch (e) {
                    console.log(e, "structure is not a json");
                    allMachinesBarCtrl.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                  }
                } else {
                  allMachinesBarCtrl.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                }
              } else {
                allMachinesBarCtrl.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
              }
            }
            $scope.loading = false;
          });
        }
      };
      let i;
      angular.forEach($scope.data, (dep, index) => {
        i = index;
        if (!$scope.data[i]) {
          console.log("error 1");
        }
        allMachinesBarCtrl.dep[i] = $scope.data[i];
        $scope.departmentId = allMachinesBarCtrl.dep[i].DepartmentID || allMachinesBarCtrl.dep[i].ID;
        $scope.productionFloorMenu = _.find(menuAndSubMenu, { TopMenuAppPartID: 500 });
        if ($scope.productionFloorMenu) {
          $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, { SubMenuExtID: $scope.departmentId });
        }

        // department name
        $scope.depName = ($scope.localLanguage ? allMachinesBarCtrl.dep[i].DepartmentLname : allMachinesBarCtrl.dep[i].DepartmentEname) || allMachinesBarCtrl.dep[i].Name;
        $scope.DepartmentPEE =  $scope.data[i].DepartmentPEE;
        // sum of machines
        $scope.total[i] = new Number();

        var allData = [];
        $scope.totalMachinesNumber = allMachinesBarCtrl.dep[i].DepartmentsMachine.length;
        if ($scope.type == "online" || $scope.type == "ShiftProgress") {
          allData = allMachinesBarCtrl.dep[i].MachineSummeryForDepartment;
          allMachinesBarCtrl.collpasedMachinesStructure = {};
          $scope.getCollapsedStructure(i);
        } else if ($scope.type == "shift") {
          var allMachinesEvents = [];
          for (let j = 0; j < allMachinesBarCtrl.dep[i].CurrentShift[0].Machines.length; j++) {
            var machine = allMachinesBarCtrl.dep[i].CurrentShift[0].Machines[j];
            allMachinesEvents = allMachinesEvents.concat(machine.Events);
          }
          var allMachinesEventsByStatus = _.map(_.groupBy(allMachinesEvents, "Name"), function (events, key) {
            return {
              type: key,
              color: events && events.length && events.length > 0 && events[0].Color,
              MachineStatusID: events && events.length && events.length > 0 && events[0].EventDistributionID,
              value: _.reduce(
                events,
                function (total, event) {
                  return total + event.Duration;
                },
                0
              ),
            };
          });
          allData = allMachinesEventsByStatus;
        }

        //append status
        allData.forEach(function (status, i) {
          if ($scope.type == "online" || $scope.type == "ShiftProgress") {
            status.value = status.MachineCount;
          }
          if (status.value > 0 && !status.fake) {
            $scope.total += status.value;
          }
        });

        $scope.updateSettings = function (newSettings) {
          for (const property in newSettings) {
            if (property === 'departmentView') {
              continue;
            }
            if(property != 'showPencils') {
              $localStorage.machineOnlineSettings[$scope.type][property] = newSettings[property];
              $scope.machineOnlineSettings[property] = newSettings[property];
            }
            else{
              $localStorage.machineOnlineSettings[$scope.type][property] = false;
              $scope.machineOnlineSettings[property] = false;
            }
          }
          OnlineSettingsService.saveSettingsFunction($scope.type);
        };

        $scope.machinesStatuses = [];
        allData.forEach(function (status, i) {
          if (status.value > 0 && !status.fake) {
            $scope.machinesStatuses.push({
              percentage: (status.value / $scope.total) * 100,
              color: status.MachineStatusID,
              color2: status.color,
              icon: shiftService.getStatusIcon(status.MachineStatusID),
              count: status.value,
            });
          }
        });

        $scope.sortedMachines = $scope.sortedMachines.concat(allMachinesBarCtrl.dep[i].DepartmentsMachine);
        const sortedLines = _.sortBy($scope.machinesLinesMap,(data) => {
          return data.DisplayOrder;
        });

        const machinesGroupedByLine = _.groupBy($scope.sortedMachines, "LineID");
        $scope.machinesGroupedByLine = [];
        $scope.machinesWithoutLines = [];
        if (machinesGroupedByLine[0]) {
          $scope.machinesWithoutLines = machinesGroupedByLine[0];
        }
        for (let i = 0;i < sortedLines.length ; i++) {
          const lineID  = sortedLines[i].ID;
          if (lineID === 0){
            continue;
          }
          if (machinesGroupedByLine[lineID]) {
            $scope.machinesGroupedByLine.push(machinesGroupedByLine[lineID]);
          }
        }

        $scope.defaultSortedMachines = [...$scope.sortedMachines];
      });

      $scope.$watch("isDefault.value", function (newVal, oldVal) {
        if (newVal != oldVal) {
          $scope.getCollapsedStructure();
        }
      });

      $scope.$watch(
        "sortData",
        function (value) {
          $scope.updateSort();
        },
        true
      );

      $scope.sortMachineBy = function (field, asc) {
        OnlineService.deleteProductionLines();
        if (field) {
          if (field == "MachineStatusID") {
            var sortOrder = [1, 5, 2, 3, 6, 8, 0, 4];
            $scope.sortedMachines = _.sortBy($scope.sortedMachines, function (machine) {
              return sortOrder.indexOf(machine.MachineStatusID);
            });
          } else {
            $scope.sortedMachines = _.sortBy($scope.sortedMachines, field);
          }
        } else {
          $scope.sortedMachines = [...$scope.defaultSortedMachines];
        }
        if (!asc) {
          $scope.sortedMachines.reverse();
        }
        if (!field && asc) {
          OnlineService.drawingLinesEnabled.value = true;
          let cardPrefID = OnlineService.cardPrefEnum[$scope.type];
          $timeout(function () {
            let depName = "";
            if ($scope.machineOnlineSettings.departmentView && $scope.sortedMachines && $scope.sortedMachines[0]) {
              depName = "dep_" + $scope.sortedMachines[0].DepartmentID;
            }
            OnlineService.drawProductionLines($scope.sortedMachines, cardPrefID, $scope.machineOnlineSettings.departmentView ? depName : "allMachines", $scope.type, $scope.machineOnlineSettings.verticalView);
          }, 500);
        } else {
          OnlineService.drawingLinesEnabled.value = false;
        }
      };

      $scope.$watch(
        "machineOnlineSettings.calculateBy",
        (newVal, oldVal) => {
          if (newVal !== oldVal) {
            $scope.changeUpperColor();
          }
        },
        true
      );
      $scope.$watch("selectTemplateGroupID.collapsed", (newVal, oldVal) => {
        if (newVal !== oldVal) {
          $scope.getCollapsedStructure();
        }
      });

      $scope.$watch(
        "machineOnlineSettings.percentageColors",
        (newVal, oldVal) => {
          $scope.changeUpperColor();
        },
        true
      );
      $scope.changeUpperColor = function () {
        $scope.sortedMachines.forEach((machine) => {
          let progressVal;
          if ($scope.machineOnlineSettings.calculateBy === "shiftUnitTarget") {
            progressVal = machine.ShiftProgressPC;
          } else {
            progressVal = machine.JoshProgressPC;
          }
          if ($scope.machineOnlineSettings?.percentageColors) {
            if (Math.min(progressVal, 100) >= $scope.machineOnlineSettings?.percentageColors[0].value) {
              $scope.machinesColors[machine.MachineID] = $scope.machineOnlineSettings?.percentageColors[0].color;
            } else if (Math.min(progressVal, 100) < $scope.machineOnlineSettings?.percentageColors[1].value) {
              $scope.machinesColors[machine.MachineID] = $scope.machineOnlineSettings.percentageColors[1].color;
            } else {
              $scope.machinesColors[machine.MachineID] = $scope.machineOnlineSettings?.percentageColors[2].color;
            }
          }
        });
      };

      $scope.updateSort = function () {
        if ($scope.sortTimeout) {
          $timeout.cancel($scope.sortTimeout);
        }
        if ($scope.sortData) {
          $scope.sortTimeout = $timeout(function () {
            $scope.sortMachineBy($scope.sortData.selectedSortField, $scope.sortData.sortAsc);
          }, 200);
        }
      };

      $scope.$watch(
        "dep.DepartmentsMachine",
        function () {
          $scope.updateSort();
        },
        true
      );
      $scope.$watchGroup(["machineOnlineSettings.showPencils", "machineOnlineSettings.selectedScale.scale", "machineOnlineSettings.aggregateProgressBar", "machineOnlineSettings.maximize"], function (newVal, oldVal) {
        if (newVal !== oldVal) {
          document.documentElement.style.setProperty("--selected-scale", $scope.machineOnlineSettings?.selectedScale?.scale || 1);
          $scope.initWrapper();
        }
      });

      $scope.initWrapper = function (time) {
        if ($scope.initTimeout) {
          $timeout.cancel($scope.initTimeout);
        }
        $scope.initTimeout = $timeout(function () {
          OnlineService.deleteProductionLines();
          let cardPrefID = OnlineService.cardPrefEnum[$scope.type];
          let depName = "";
          if ($scope.machineOnlineSettings.departmentView && $scope.sortedMachines && $scope.sortedMachines[0]) {
            depName = "dep_" + $scope.sortedMachines[0].DepartmentID;
          }
          OnlineService.drawProductionLines($scope.sortedMachines, cardPrefID, $scope.machineOnlineSettings.departmentView ? depName : "allMachines", $scope.type, $scope.machineOnlineSettings.verticalView);
        }, 0);
      };
    },
    controllerAs: "allMachinesBarCtrl",
  };
};

angular.module("LeaderMESfe").directive("allMachinesBarDirective", allMachinesBarDirective);
