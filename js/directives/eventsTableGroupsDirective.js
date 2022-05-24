function eventsTableGroupsDirective() {
  var template = "views/custom/productionFloor/common/groupEventsTable.html";
  var controller = function ($scope, LeaderMESservice, toastr, $filter, $modal, $timeout) {
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();

    $scope.groupData.allDepartmentsForGroup = angular.copy(
      _.map($scope.allDepartments, (department, index) => {
        department.index = index;
        return department;
      })
    );
    $scope.groupData.selectedGlobalMachineCount = 0;
    $scope.isEng = LeaderMESservice.getLanguage() == "eng";
    $scope.icons = [
      "",
      "electricity-copy-3.svg",
      "break-copy-3.svg",
      "drag-handle.svg",
      "general-copy-4.svg",
      "lunch-copy-2.svg",
      "maintenence-copy-9.svg",
      "maintenence-copy-10.svg",
      "malfunction-copy-3.svg",
      "materal-copy-2.svg",
      "operator-copy-5.svg",
      "planning-copy-5.svg",
      "qa-copy-4.svg",
      "rejects-copy-5.svg",
      "smoke-copy-2.svg",
      "stop-copy-5.svg",
      "temp-copy-5.svg",
      "tools-copy-3.svg",
      "water-copy-5.svg",
      "workers-copy-5.svg",
    ];

    $scope.addReasonToGroup = function (group) {
      if (!group.Reasons) {
        group.Reasons = [];
      }
      group.Reasons.unshift($scope.getEmptyNewReason(group.ID));
    };

    $scope.changeGroupCheckBox = function (field) {
      $scope.groupData.Reasons = _.map($scope.groupData.Reasons, function (reason) {
        reason[field] = $scope.groupData[field];
        return reason;
      });
    };

    $scope.changeReasonLocalMachines = function (reason, machine, selected) {
      _.every(reason.allDepartmentsForReason, (department) => {
        localMachine = _.find(department.Value, { Id: machine.Id });
        if (localMachine) {
          localMachine.selected = selected;
          return false;
        }
        return true;
      });
      return reason;
    };

    $scope.checkGlobalSelection = function (department) {
      var machineSelectedCount = 0;
      _.forEach(department.Value, (machine) => {
        if (machine.selected) {
          machineSelectedCount++;
        }
      });
      if (machineSelectedCount == department.Value.length) {
        department.selected = true;
      } else {
        department.selected = false;
      }
    };

    $scope.addRemoveMachines = function (reason, machine, selected) {
      var findIndexReasons;
      if (!reason.Machines) {
        reason.Machines = [];
      }

      if (selected) {
        findIndexReasons = reason.Machines.indexOf("" + machine.Id);
        if (findIndexReasons == -1) {
          reason.selectedLocalMachineCount++;
          reason.Machines.push("" + machine.Id);
        }
      } else {
        findIndexReasons = reason.Machines.indexOf("" + machine.Id);
        if (findIndexReasons > -1 && !reason.Machines[findIndexReasons].selected) {
          reason.Machines.splice(findIndexReasons, 1);
          reason.selectedLocalMachineCount--;
        }
      }
    };

    $scope.selectedMachine = function () {
      var objFound;
      $scope.reasonEventMachines = [];
      ($scope.selectedLocalMachineCount = 0), (countReasonDepartmentSelect = 0);
      var countDepartmentSelect = 0;
      var countMachinesInDepartment;
      _.forEach($scope.groupData.allDepartmentsForGroup, (department, index) => {
        countMachinesInDepartment = 0;
        department.Value = _.map(department.Value, (machine) => {
          if (!$scope.groupData.Machines) {
            $scope.groupData.Machines = [];
            machine.selected = false;
            return machine;
          }
          objFound = $scope.groupData.Machines.indexOf("" + machine.Id);
          if (objFound > -1) {
            machine.selected = true;
            countMachinesInDepartment++;
            $scope.reasonEventMachines.push(machine);
            $scope.groupData.selectedGlobalMachineCount++;
          } else {
            machine.selected = false;
          }
          return machine;
        });
        if (department.Value.length == countMachinesInDepartment) {
          department.selected = true;
          countDepartmentSelect++;
        }
      });
      //check if all departments selected
      if (countDepartmentSelect == $scope.groupData.allDepartmentsForGroup.length) {
        $scope.groupData.allDepartmentsSelected = true;
      } else {
        $scope.groupData.allDepartmentsSelected = false;
      }

      if ($scope.groupData.Reasons) {
        var findIndexReason;
        _.forEach($scope.groupData.Reasons, (reason) => {
          if (!reason.Machines) {
            reason.Machines = [];
          }
          reason.allDepartmentsForReason = angular.copy($scope.allDepartments);
          reason.selectedLocalMachineCount = 0;
          $scope.reasonEventMachinesTemp = _.map(angular.copy($scope.reasonEventMachines), function (machine) {
            findIndexReason = reason.Machines.indexOf("" + machine.Id);
            if (findIndexReason > -1) {
              machine.selected = true;
              reason.selectedLocalMachineCount++;
            } else {
              machine.selected = false;
            }
            $scope.changeReasonLocalMachines(reason, machine, machine.selected);
            return machine;
          });

          _.forEach(reason.allDepartmentsForReason, function (department) {
            $scope.checkGlobalSelection(department);

            if (department.selected) {
              countReasonDepartmentSelect++;
            }
          });

          //check if all departments selected
          if (countReasonDepartmentSelect == reason.allDepartmentsForReason.length) {
            reason.allDepartmentsSelected = true;
          } else {
            reason.allDepartmentsSelected = false;
          }
        });
      }
    };
    $scope.selectedMachine();

    //default properties to compare between origin reason and changed reason and then send only the changed reasons
    var defaultReasonProperties = ["EventDefinitionID","ColorID", "IconID","ERPID", "Machines", "IsActive", "DisplayInOpApp", "TargetPC"];
    if ($scope.localLanguage) {
      defaultReasonProperties.unshift("LName");
    } else {
      defaultReasonProperties.unshift("EName");
    }
    $scope.defaultReasons = angular.copy($scope.groupData.Reasons);

    $scope.selectGlobalMachine = function (machine) {
      var findIndexGlobal = $scope.groupData.Machines.indexOf("" + machine.Id);
      if (findIndexGlobal > -1) {
        $scope.groupData.selectedGlobalMachineCount--;
        $scope.groupData.Machines.splice(findIndexGlobal, 1);
      } else {
        $scope.groupData.selectedGlobalMachineCount++;
        $scope.groupData.Machines.push("" + machine.Id);
      }
      $scope.groupData.Reasons = _.map($scope.groupData.Reasons, function (reason) {
        $scope.changeReasonLocalMachines(reason, machine, machine.selected);
        $scope.addRemoveMachines(reason, machine, machine.selected);
        return angular.copy(reason);
      });
    };

    $scope.selectLocalMachine = function (machine, reason) {
      var findIndexMachineGroup = $scope.groupData.Machines.indexOf("" + machine.Id);
      if (findIndexMachineGroup < 0) {
        $scope.groupData.Machines.push("" + machine.Id);
        $scope.groupData.selectedGlobalMachineCount++;
        var globalMachine;

        _.every($scope.groupData.allDepartmentsForGroup, (department) => {
          globalMachine = _.find(department.Value, { Id: machine.Id });
          if (globalMachine) {
            globalMachine.selected = true;
            return false;
          }
          return true;
        });
      }

      var findIndexReasons = reason.Machines.indexOf("" + machine.Id);
      if (findIndexReasons > -1 && !reason.Machines[findIndexReasons].selected) {
        reason.Machines.splice(findIndexReasons, 1);
        reason.selectedLocalMachineCount--;
      } else {
        reason.selectedLocalMachineCount++;
        reason.Machines.push("" + machine.Id);
      }
    };
    //chose all departments locally
    $scope.selectAllDepartmentsLocal = function (reason) {
      if (reason.allDepartmentsSelected) {
        $scope.groupData.allDepartmentsSelected = reason.allDepartmentsSelected;
      }

      _.forEach(reason.allDepartmentsForReason, (department) => {
        department.selected = reason.allDepartmentsSelected;
        $scope.selectAllDepartmentMachinesLocal(department, reason);
      });
    };

    $scope.selectAllDepartmentMachinesLocal = function (department, reason) {
      reason.allDepartmentsForReason[department.index].Value.forEach(function (machine) {
        if (department.selected) {
          if (machine.selected != department.selected) {
            machine.selected = department.selected;
            reason.Machines.push("" + machine.Id);
          }
        } else {
          machine.selected = department.selected;
          findIndex = reason.Machines.indexOf("" + machine.Id);
          reason.Machines.splice(findIndex, 1);
        }
      });
      reason.allDepartmentsForReason[department.index].selected = department.selected;
      reason.selectedLocalMachineCount = reason.Machines.length;

      $scope.groupData.allDepartmentsForGroup[department.index].Value.forEach(function (machine) {
        if (department.selected) {
          if (machine.selected != department.selected) {
            machine.selected = department.selected;
            $scope.groupData.selectedGlobalMachineCount++;
            $scope.groupData.Machines.push("" + machine.Id);
          }
        }
      });
      $scope.groupData.selectedGlobalMachineCount = $scope.groupData.Machines.length;

      if (department.selected) {
        $scope.groupData.allDepartmentsForGroup[department.index].selected = department.selected;
      }
    };

    //choose all deparmentsGlobally
    $scope.selectAllDepartmentsGlobal = function (group) {
      _.forEach($scope.groupData.Reasons, function (reason) {
        reason.Machines = [];
        reason.selectedLocalMachineCount = 0;
        reason.allDepartmentsSelected = group.allDepartmentsSelected;
      });
      _.forEach(group.allDepartmentsForGroup, (department) => {
        department.selected = group.allDepartmentsSelected;
        $scope.selectAllDepartmentMachinesGlobal(department, department.selected);
      });
    };

    $scope.selectAllDepartmentMachinesGlobal = function (department, forcedValue = undefined) {
      var machineReasons = [];
      var findIndex;
      $scope.groupData.allDepartmentsForGroup[department.index].Value = angular.copy(department.Value);
      $scope.groupData.allDepartmentsForGroup[department.index].Value.forEach(function (machine) {
        if (department.selected) {
          if (machine.selected != department.selected) {
            machine.selected = department.selected;
            $scope.groupData.selectedGlobalMachineCount++;
            $scope.groupData.Machines.push("" + machine.Id);
          }
          machineReasons.push(machine);
        } else {
          machine.selected = department.selected;
          machineReasons.push(machine);
          findIndex = $scope.groupData.Machines.indexOf("" + machine.Id);
          $scope.groupData.Machines.splice(findIndex, 1);
        }
      });

      $scope.groupData.selectedGlobalMachineCount = $scope.groupData.Machines.length;

      _.forEach($scope.groupData.Reasons, function (reason) {
        machineReasons.forEach(function (machine) {
          if (forcedValue !== undefined) {
            machine.selected = forcedValue;
          }
          $scope.changeReasonLocalMachines(reason, machine, machine.selected);
          $scope.addRemoveMachines(reason, machine, machine.selected);
        });
        reason.allDepartmentsForReason[department.index].selected = department.selected;
      });
    };

    $scope.getEmptyNewReason = function (groupId) {
      // TODO need to change event group id for new group

      return {
        ColorID: "#FFFFFF",
        DepartmentID: 0,
        DisplayOrder: $scope.getNextDisplayOrder(),
        EName: "",
        EventDefinitionID: 1,
        EventGroupID: groupId,
        ID: Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000),
        IconID: "",
        Machines: angular.copy($scope.groupData.Machines),
        IsActive: true,
        IsSystem: false,
        DisplayInOpApp: true,
        LName: "",
        Reasons: null,
        UpsertType: 2,
        selectedLocalMachineCount: angular.copy($scope.groupData.selectedGlobalMachineCount),
        allDepartmentsForReason: angular.copy($scope.groupData.allDepartmentsForGroup),
      };
    };
    $scope.getNextDisplayOrder = function () {
      let max = 0;

      angular.forEach($scope.groups, function (g) {
        if (g.DisplayOrder > max) {
          max = g.DisplayOrder;
        }
      });

      return max + 1;
    };

    $scope.handleMenuCB = function (reason, selectedTime) {
      reason.EventDefinitionID = selectedTime;
      reason.menuOpened = false;
    };

    $scope.saveAndCloseEditMode = function (g) {
      var modified,
        modifiedReasons = [],
        reasonOrder = [];
      $scope.doneSaving = false;
      $scope.emptyReason = false;
      $scope.emptyGroup = false;
      if (!g.EName && !g.LName) {
        $scope.emptyGroup = true;
      } else {
        if (!g.EName) {
          g.EName = angular.copy(g.LName);
        } else {
          g.LName = angular.copy(g.EName);
        }
      }
      if(g.TargetPC == 0){
        g.TargetPC = null;
      }
      _.forEach(g.Reasons, function (reason) {
        if (!reason.EName && !reason.LName) {
          $scope.emptyReason = true;
        } else {
          if (!reason.EName) {
            reason.EName = angular.copy(reason.LName);
          } else {
            reason.LName = angular.copy(reason.EName);
          }
        }
        if(reason.TargetPC == 0){
          reason.TargetPC = null;
        }
      });
      if ($scope.emptyGroup) {
        $scope.doneSaving = true;
        toastr.error("", $filter("translate")("FILL_GROUP_NAME"));
        return;
      }
      if ($scope.emptyReason) {
        $scope.doneSaving = true;
        toastr.error("", $filter("translate")("FILL_REASON_NAME"));
        return;
      }

      var allMachinesID = [];
      _.forEach($scope.groupData.allDepartmentsForGroup, (department) => {
        _.forEach(department.Value, (machine) => {
          allMachinesID.push(machine.Id);
        });
      });
      if (g.IsSystem) {
        g.Machines = angular.copy(allMachinesID);
      } else {
        g.Machines = _.map(g.Machines, (id) => {
          return id;
        });
      }

      let group = angular.copy(g);

      _.forEach(group.Reasons, (reason) => {
        if (reason.IsSystem) {
          reason.Machines = angular.copy(allMachinesID);
        }
        reason.Machines = [...new Set(reason.Machines)];
      });

      //take all new reasons
      
      modifiedReasons = _.filter(group.Reasons, function (reason) {
        return reason.ID < 0;
      });

      //take all old reasons
      oldReasons = _.filter(group.Reasons, function (reason) {
        return reason.ID > -1;
      });

      //it returns all the reasons that been modified
      modifiedReasons = [
        ...modifiedReasons,
        ..._.filter(oldReasons, function (reason, i) {
          modified = false;
          //compare each proprety that can be modified between the old and new reasons, if one property is not equal then its been modified
          _.forEach(defaultReasonProperties, function (key) {
            if (JSON.stringify($scope.defaultReasons[i][key]) !== JSON.stringify(reason[key])) {
              modified = true;
            }
          });
          return modified;
        }),
      ];
      $scope.defaultReasons = angular.copy($scope.groupData.Reasons);
      let rBodyReq = { eventsReason: modifiedReasons };

      if (group.UpsertType == 0) {
        group.UpsertType = 3;
      }

      //delete Reasons. According to server side logic. They seperated Saving Group and Saving Reasons.
      delete group.Reasons;

      let gBodyReq = { eventsGroup: [group] };
      LeaderMESservice.customAPI("UpsertEventGroupV2", gBodyReq).then(function (res) {
        let newGroupId = res.LeaderRecordID;
        if (res.NewMappedRecordsIDs[group.ID]) {
          g.DictionaryID = res.NewMappedRecordsIDs[group.ID];
        }
        if (g.ID < -1) {
          g.ID = res.NewRecordID[g.ID];
        }

        angular.forEach(rBodyReq.eventsReason, function (reason) {
          if (reason.UpsertType == 0) reason.UpsertType = 3;

          if (reason.EventGroupID < 0) {
            reason.EventGroupID = newGroupId;
          }
        });
        $scope.groupData.UpsertType = 3;

        LeaderMESservice.customAPI("UpsertEventReasonV2", rBodyReq).then(
          function (reasonsRes) {
            //assign dictionary ids for new reasons

            angular.forEach(g.Reasons, function (r) {
              if (!reasonsRes.NewMappedRecordsIDs[r.ID]) {
                return;
              }
              r.DictionaryID = reasonsRes.NewMappedRecordsIDs[r.ID];
            });

            //assign ids for new reasons
            angular.forEach(g.Reasons, function (r) {
              if (!reasonsRes.NewRecordID[r.ID]) {
                return;
              }
              r.ID = reasonsRes.NewRecordID[r.ID];
              r.UpsertType = 3;
            });

            //create object for reason event
            reasonOrder = [
              ..._.map($scope.groupData.Reasons, function (reason, indexR) {
                return { ID: reason.ID, DisplayOrder: +indexR };
              }),
            ];

            //save order of the events
            LeaderMESservice.customAPI("UpdateEventOrder", { events: reasonOrder }).then(function (res2) {
              //save group names and reason names to translations now
              var objBody = {
                mainLang: LeaderMESservice.getLanguage(),
                values: [{ key: $scope.groupData.DictionaryID, value: $scope.isEng ? $scope.groupData.EName : $scope.groupData.LName }],
              };
              angular.forEach(g.Reasons, function (reason) {
                objBody.values.push({
                  key: reason.DictionaryID,
                  value: $scope.isEng ? reason.EName : reason.LName,
                });
              });
              LeaderMESservice.customAPI("UpdateTranslationForEventAndGroupV2", objBody).then(
                function () {
                  if (!$scope.isEng) {
                    var objBodyEng = {
                      mainLang: LeaderMESservice.getLanguage(),
                      values: [{ key: $scope.groupData.DictionaryID, value: $scope.groupData.EName }],
                    };
                    angular.forEach(g.Reasons, function (reason) {
                      objBodyEng.values.push({
                        key: reason.DictionaryID,
                        value: reason.EName,
                      });
                    });
                    LeaderMESservice.customAPI("UpdateTranslationForEventAndGroupV2", objBodyEng).then(
                      function (err) {
                        g.editMode = false;
                        $scope.doneSaving = true;
                        toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                      },
                      function (err) {
                        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
                        $scope.doneSaving = true;
                      }
                    );
                  } else {
                    g.editMode = false;
                    $scope.doneSaving = true;
                    toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                  }
                },
                function (err) {
                  toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
                  $scope.doneSaving = true;
                }
              );
            });
          },
          function (err) {
            toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
            $scope.doneSaving = true;
          }
        );
      });
    };

    if($scope.groupData.ID < 0 )
    {
        $scope.groupData.allDepartmentsSelected= true;
        $scope.selectAllDepartmentsGlobal($scope.groupData)
    }
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      groupData: "=",
      allDepartments: "=",
    },
    controller: controller,
  };
}

angular.module("LeaderMESfe").directive("eventsTableGroupsDirective", eventsTableGroupsDirective);
