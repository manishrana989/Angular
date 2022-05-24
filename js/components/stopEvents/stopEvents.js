function stopEvents() {
  var controller = function ($modal, $scope, $state, LeaderMESservice, BreadCrumbsService, $timeout, toastr, $filter) {
    var stopEventsCtrl = this;
    $scope.showTable = false;
    stopEventsCtrl.getDepartmentsMachines = function () {
      $scope.fetching = true;
      LeaderMESservice.customAPI("GetDepartmentMachine", { DepartmentID: 0 }).then(function (response) {
        $scope.allDepartments = _.forEach(response.DepartmentMachine, function (department) {
          department.Value = _.uniq(department.Value, "Id");
        });
        $scope.allDepartmentsTemp = angular.copy($scope.allDepartments);
        $scope.allDepartmentsTemp.selected = true;
        _.forEach($scope.allDepartmentsTemp, function (department) {
          department.selected = true;
          _.forEach(department.Value, function (machine) {
            machine.selected = true;
          });
        });
      });
    };

    stopEventsCtrl.getSelectedMachines = function () {
      var machinesArray = [];
      _.forEach($scope.allDepartmentsTemp, function (department) {
        _.forEach(department.Value, (machine) => {
          if (machine.selected) machinesArray.push(machine.Id);
        });
      });
      return machinesArray;
    };
    stopEventsCtrl.getMachinesNumber = function () {
      var machinesCount = 0;
      _.forEach($scope.allDepartmentsTemp, function (department) {
        machinesCount += department.Value.length;
      });
      return machinesCount;
    };

    stopEventsCtrl.getEventReasonAndGroupsV2 = function () {
      $scope.fetching = true;
      var selectedMachines = stopEventsCtrl.getSelectedMachines();
      var allMachinesCount = stopEventsCtrl.getMachinesNumber();
      obj = {
        machines: selectedMachines.length == allMachinesCount ? [] : selectedMachines,
        isActive: stopEventsCtrl.selectIsActive == "true" ? true : stopEventsCtrl.selectIsActive == "false" ? false : null,
      };
      LeaderMESservice.customAPI("GetEventReasonAndGroupsV2", obj).then(function (res) {
        $scope.groupsV2 = res.EventsAndGroups;
        $scope.showTable = true;
        $scope.fetching = false;
      });
    };

    $scope.selectAllDepartmentsGlobal = function () {
      _.forEach($scope.allDepartmentsTemp, (department) => {
        department.selected = $scope.allDepartmentsTemp.selected;
        $scope.selectAllDepartmentMachinesGlobal(department);
      });
    };

    $scope.selectAllDepartmentMachinesGlobal = function (department) {
      department.Value.forEach(function (machine) {
        if (machine.selected != department.selected) {
          machine.selected = department.selected;
        }
      });
    };

    $scope.saveGroupOrder = function () {
      var reasonOrder = [];
      $scope.doneSaving = false;
      var groupOrder = _.map($scope.groupsV2, function (group, indexG) {
        reasonOrder = [
          ...reasonOrder,
          ..._.map(group.Reasons, function (reason, indexR) {
            return { ID: reason.ID, DisplayOrder: +indexR };
          }),
        ];
        return { ID: +group.ID, DisplayOrder: +indexG };
      });
      LeaderMESservice.customAPI("UpdateEventGroupOrder", { eventsGroup: groupOrder }).then(function (res) {
        LeaderMESservice.customAPI("UpdateEventOrder", { events: reasonOrder }).then(
          function (res2) {
            toastr.success("", $filter("translate")("ORDER_SAVED_SUCCESSFULLY"));
            $scope.doneSaving = true;
          },
          function (err) {
            toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
            $scope.doneSaving = true;
          }
        );
      });
    };

    stopEventsCtrl.getDepartmentsMachines();

    /**
     * Adds a new Empty/Default Group
     * New Groups will have ID:0 according to Avi
     */

    $scope.addNewEmptyGroupV2 = function () {
      const groupId = Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000);
      $scope.groupsV2.unshift({
        ColorID: "#808080",
        DepartmentID: 0,
        DictionaryID: 73,
        DisplayInOpApp: true,
        DisplayOrder: 0,
        EName: "",
        ID: groupId,
        IconID: null,
        IsActive: true,
        LName: "",
        MachineID: 0,
        Machines: [],
        NumOfMachines: 0,
        Reasons: [$scope.getEmptyNewReason(groupId)],
        TargetPC: 0,
        UpsertType: 2,
        edit: true,
        reasonShow: true,
      });
      $(".gridTableBody").scrollTop(0);
    };

    $scope.getEmptyNewReason = function (groupId) {
      // TODO need to change event group id for new group

      return {
        ColorID: "#808080",
        DepartmentID: 0,
        DisplayOrder: $scope.getNextDisplayOrder(),
        EName: "",
        EventDefinitionID: 1,
        EventGroupID: groupId,
        ID: Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000),
        IconID: "electricity-copy-3.svg",
        Machines: [],
        IsActive: true,
        IsSystem: false,
        DisplayInOpApp: true,
        LName: "",
        Reasons: null,
        ERPID:null,
        UpsertType: 2,
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

    $scope.openTablet = function () {
      const upperScope = $scope;

      $modal.open({
        templateUrl: "views/stopEventsModals/tabletModal.html",
        windowClass: "op-app stop-events",
        controllerAs: "stopEventsCtrl",
        controller: function ($scope, $modalInstance, LeaderMESservice) {
          var stopEventsCtrl = this;

          stopEventsCtrl.mainData = {};

          $scope.clearObjectBeforeEdit = {};

          $scope.localLanguage = LeaderMESservice.showLocalLanguage();

          $scope.isEng = LeaderMESservice.getLanguage() == "eng";

          $scope.groups = [];

          $scope.Close = function () {
            $modalInstance.close();
          };

          $scope.showOnlyActiveGroups = {
            value: false,
          };

          stopEventsCtrl.getMachinesByDicId = function (DicId, entity) {
            if (!angular.isDefined(entity.commonDictionariesPopup)) {
              entity.commonDictionariesPopup = false;
            }

            // close all other popups for groups and reasons
            angular.forEach($scope.groups, function (g) {
              //exclude group with same id
              if (!(entity.Reasons && g.ID == entity.ID)) {
                g.commonDictionariesPopup = false;
              }

              angular.forEach(g.Reasons, function (r) {
                //exclude reason with same id
                if (!entity.Reasons && r.ID == entity.ID) {
                  return;
                }
                r.commonDictionariesPopup = false;
              });
            });

            entity.commonDictionariesPopup = !entity.commonDictionariesPopup;

            $scope.fetched = false;

            if (entity.commonDictionariesPopup) {
              LeaderMESservice.customAPI("GetMachinesForDictionaryID", { DictionaryID: DicId }).then(function (response) {
                $scope.machinesWithThisDictionary = response.ResponseList || [];
                $scope.fetched = true;
              });
            }
          };

          /**
           * proto func to remove duplicates from array when looping over all machines and extracting selected machine
           * @returns {*[]}
           */
          Array.prototype.unique = function () {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
              for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) a.splice(j--, 1);
              }
            }

            return a;
          };

          stopEventsCtrl.copyData = function () {
            var reqObject = {};

            if (!stopEventsCtrl.mainData.applyTo) {
              stopEventsCtrl.mainData.applyTo = "selectMachines";
            }
            if (stopEventsCtrl.mainData.applyTo === "selectMachines") {
              reqObject.target = 1;

              if (!reqObject.recordID) {
                reqObject.recordID = [];
              }

              angular.forEach(stopEventsCtrl.mainData.departments, function (dep) {
                reqObject.recordID = reqObject.recordID.concat(_.map(_.filter(dep.Value, { selected: true }), "Id")).unique();
              });

              if (reqObject.recordID.indexOf(stopEventsCtrl.mainData.selectedMachine.Id) >= 0) {
                reqObject.recordID.splice(reqObject.recordID.indexOf(stopEventsCtrl.mainData.selectedMachine.Id), 1);
              }
            } else if (stopEventsCtrl.mainData.applyTo === "allMachines") {
              reqObject.target = 2;
              reqObject.recordID = [stopEventsCtrl.mainData.selectedMachine.TypeID];
            }

            var reqObjectGroup = Object.assign({}, reqObject);
            reqObjectGroup.type = "eventgroup";
            reqObjectGroup.sourceData = _.map(_.filter($scope.groups, { IsActive: true }), function (group) {
              return {
                ID: group.ID,
                ColorID: group.ColorID,
                IconID: group.IconID,
                DisplayOrder: group.DisplayOrder,
              };
            });

            var reqObjectEvent = Object.assign({}, reqObject);

            reqObjectEvent.type = "event";
            reqObjectEvent.sourceData = [];
            $scope.groups.forEach(function (group) {
              reqObjectEvent.sourceData = reqObjectEvent.sourceData.concat(
                _.map(_.filter(group.Reasons, { IsActive: true }), function (reason) {
                  return {
                    ID: reason.ID,
                    IconID: reason.IconID,
                    DisplayOrder: reason.DisplayOrder,
                  };
                })
              );
            });
            var promises = [];

            promises.push(LeaderMESservice.customAPI("CopyEventDefToMachine", reqObjectGroup));
            promises.push(LeaderMESservice.customAPI("CopyEventDefToMachine", reqObjectEvent));
            Promise.all(promises).then(function (response) {
              toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            });
          };

          /**
           * Icon library for user editing
           */
          stopEventsCtrl.icons = [
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

          /**
           * Colors library for user editing
           */
          stopEventsCtrl.colors = ["#954b7d", "#ff6b6b", "#5aca96", "#fda400", "#599abe"];

          stopEventsCtrl.assignDefaultAttrs = function (groups) {
            const shouldOverride = _.find(groups, { IsActive: true, DisplayOrder: 0 });

            let counter = 1;

            angular.forEach(groups, function (group) {
              if (!group.ColorID) {
                group.ColorID = stopEventsCtrl.colors[0];
              }

              if (shouldOverride) {
                group.DisplayOrder = counter++;
              }

              angular.forEach(group.Reasons, function (reason) {
                if (!reason.IconID) {
                  reason.IconID = group.IconID;
                }
              });
            });
          };

          /**
           * Sort groups by display order, ignore groups that is not active when sorting
           * @returns {T[]}
           */
          $scope.sortGroupsByOrder = function () {
            const groups = _.filter($scope.groups, { IsActive: true });

            groups.sort(function (obj1, obj2) {
              return obj1.DisplayOrder == obj2.DisplayOrder ? 0 : obj1.DisplayOrder > obj2.DisplayOrder ? 1 : -1;
            });

            $scope.groups = groups.concat(_.filter($scope.groups, { IsActive: false }));
          };
          stopEventsCtrl.getEventReasonAndGroups = function () {
            $scope.fetching = true;
            LeaderMESservice.customAPI("GetEventReasonAndGroupsForMachine", {
              MachineID: stopEventsCtrl.mainData.selectedMachine.Id,
              isActive: stopEventsCtrl.selectIsActive == "true" ? true : stopEventsCtrl.selectIsActive == "false" ? false : null,

            }).then(function (res) {
              $scope.fetching = false;

              $scope.dataLoaded = true;
              $scope.groups = res.EventsAndGroups;
              $scope.groups = _.filter($scope.groups, { IsActive: true }).concat(_.filter($scope.groups, { IsActive: false }));

              angular.forEach($scope.groups, function (group) {
                group.Reasons = _.filter(group.Reasons, { IsActive: true }).concat(_.filter(group.Reasons, { IsActive: false }));
              });

              stopEventsCtrl.assignDefaultAttrs($scope.groups);
              $scope.sortGroupsByOrder();
            });
          };

          /**
           * Helper function. Called when the user adds a new group.
           * Returns a default empty Group.
           */
          // stopEventsCtrl.getEmptyNewGroup = function () {
          //   const groupId = Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000);

          //   return {
          //     ID: groupId,
          //     ColorID: "#808080",
          //     DepartmentID: 0,
          //     DisplayOrder: 0,
          //     DictionaryID: 0,
          //     EName: "",
          //     IconID: "electricity-copy-3.svg",
          //     IsActive: true,
          //     LName: "",
          //     Reasons: [stopEventsCtrl.getEmptyNewReason(groupId)],
          //     MachineID: stopEventsCtrl.mainData.selectedMachine.Id,
          /**
           * @UpsertType:
           * 1 - DELETE
           * 2 - INSERT
           * 3 - UPDATE
           */
          //     UpsertType: 2,
          //   };
          // };

          $scope.openEditMode = function (group) {
            $scope.clearObjectBeforeEdit[group.ID] = _.merge({}, group);
            group.editMode = true;
          };

          /**
           * Close edit mode for single group and DISCARDING user changes
           */
          $scope.closeEditMode = function (group) {
            group.editMode = false;
            group = _.extend(group, $scope.clearObjectBeforeEdit[group.ID]);
          };

          $scope.doneSaving = true;

          /**
           * Close edit mode and save changes to server
           */
          $scope.saveAndCloseEditMode = function (g) {
            $scope.doneSaving = false;

            let group = angular.copy(g);

            let rBodyReq = { eventsReason: group.Reasons };

            if (group.UpsertType == 0) {
              group.UpsertType = 3;
            }

            // const tmpReasonsCollection = Object.assign({}, group.Reasons);
            //delete Reasons. According to server side logic. They seperated Saving Group and Saving Reasons.
            delete group.Reasons;

            group.MachineID = stopEventsCtrl.mainData.selectedMachine.Id;
            let gBodyReq = { eventsGroup: [group] };

            LeaderMESservice.customAPI("UpsertEventGroup", gBodyReq).then(function (res) {
              let newGroupId = res.LeaderRecordID;
              if (res.NewMappedRecordsIDs[group.ID]) {
                g.DictionaryID = res.NewMappedRecordsIDs[group.ID];
              }
              //g.ID = res.LeaderRecordID;

              angular.forEach(rBodyReq.eventsReason, function (reason) {
                if (reason.UpsertType == 0) reason.UpsertType = 3;

                if (reason.EventGroupID < 0) {
                  reason.EventGroupID = newGroupId;
                }

                reason.MachineID = stopEventsCtrl.mainData.selectedMachine.Id;
              });

              LeaderMESservice.customAPI("UpsertEventReason", rBodyReq).then(function (reasonsRes) {
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

                //lets save group names and reason names to translations now
                const promises = [];

                let currentPromise = LeaderMESservice.customAPI("UpdateTranslationForEventAndGroup", {
                  ID: group.DictionaryID,
                  values: [{ key: LeaderMESservice.getLanguage(), value: $scope.isEng ? group.EName : group.LName }],
                });

                promises.push(currentPromise);

                angular.forEach(g.Reasons, function (reason) {
                  currentPromise = LeaderMESservice.customAPI("UpdateTranslationForEventAndGroup", {
                    ID: reason.DictionaryID,
                    values: [
                      {
                        key: LeaderMESservice.getLanguage(),
                        value: $scope.isEng ? reason.EName : reason.LName,
                      },
                    ],
                  });

                  promises.push(currentPromise);
                });

                Promise.all(promises).then(
                  function () {
                    g.editMode = false;
                    $scope.doneSaving = true;

                    stopEventsCtrl.getEventReasonAndGroups();

                    toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                  },
                  function (err) {
                    toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
                    $scope.doneSaving = true;
                  }
                );
              });
            });
          };

          /**
           * Delete a reason from a group
           * @param reason - reason to delete (According to Avi/server-side delete a reason by assigning IsActive=false
           * @param group - a group to delete the reason from
           * @param i - index of a reason to splice it.
           */
          $scope.deleteReasonFromGroup = function (reason, group) {
            group.Reasons = _.filter(group.Reasons, { IsActive: true }).concat(_.filter(group.Reasons, { IsActive: false }));

            if (reason.IsActive && reason.NumOfMachines == 1) {
              LeaderMESservice.customAPI("GetMachinesForDictionaryID", { DictionaryID: reason.DictionaryID }).then(function (response) {
                const res = response.ResponseList || [];

                if (res.length == 1 && res[0].MachineID != stopEventsCtrl.mainData.selectedMachine.Id) {
                  reason.showAlert = true;
                }
              });
            }

            if (!reason.IsActive) {
              reason.showAlert = false;
            }
          };

          /**
           * Delete a group
           * @param group - group to delete (assign according to Avi/server-side IsActive=false)
           * @param i - index of the group in order to splice it
           */
          $scope.deleteGroup = function (group, i) {
            $scope.groups = _.filter($scope.groups, { IsActive: true }).concat(_.filter($scope.groups, { IsActive: false }));

            var groupToSend = angular.copy(group);

            /**
             * Sets UpsertType to 3 (3 for UPDATE, according to server-side logic)
             */
            groupToSend.UpsertType = 3;
            delete groupToSend.Reasons;

            groupToSend.MachineID = stopEventsCtrl.mainData.selectedMachine.Id;

            var bodyReq = { eventsGroup: [groupToSend] };

            LeaderMESservice.customAPI("UpsertEventGroup", bodyReq).then(function () {
              toastr.success("", $filter("translate")("GROUP_WAS_UPDATED"));
            });
          };

          /**
           * Open Re-order modal.
           * User can reorder groups, change color and icon.
           */
          $scope.openReorderModal = function () {
            let activeGroups = _.filter($scope.groups, { IsActive: true });
            const upperScope = $scope;

            $modal
              .open({
                templateUrl: "views/stopEventsModals/reOrderModal.html",
                windowClass: "messagesModal",
                controllerAs: "modalScope",
                controller: function ($scope, $modalInstance, $timeout, LeaderMESservice) {
                  $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                  $scope.isEng = LeaderMESservice.getLanguage() == "eng";
                  const modalScope = this;
                  modalScope.groups = activeGroups;
                  modalScope.startDragIndx = -1;
                  modalScope.endDragIndx = -1;

                  $scope.clearGroupsBeforeEdit = _.merge({}, modalScope.groups);

                  $scope.colors = angular.copy(stopEventsCtrl.colors);
                  $scope.icons = angular.copy(stopEventsCtrl.icons);

                  // // to enable drag and sort in modal
                  // $timeout(function () {
                  //     $("#sortable").sortable({
                  //             start: function (a, b) {
                  //                 modalScope.startDragIndx = b.item.index()
                  //             },
                  //             update: function (a, b) {
                  //                 modalScope.endDragIndx = b.item.index();
                  //                 modalScope.swapAfterDrag();
                  //             }
                  //         }
                  //     );
                  // }, 100);
                  //
                  // /**
                  //  * After drag finish, swap dragged item with target item
                  //  */
                  // modalScope.swapAfterDrag = function () {
                  //     modalScope.groups[modalScope.startDragIndx].DisplayOrder = modalScope.endDragIndx + 1;
                  //     modalScope.groups[modalScope.endDragIndx].DisplayOrder = modalScope.startDragIndx + 1;
                  //     modalScope.sortGroupsAfterSwap();
                  // };

                  /**
                   * After swap is finished, sort stop events groups according to user dragging order
                   */
                  modalScope.sortGroupsAfterSwap = function () {
                    modalScope.groups.sort(function (obj1, obj2) {
                      return obj1.DisplayOrder == obj2.DisplayOrder ? 0 : obj1.DisplayOrder > obj2.DisplayOrder ? 1 : -1;
                    });
                  };

                  /**
                   * Close and Save user changes
                   */
                  $scope.saveAndClose = function () {
                    var groupsToSend = angular.copy(modalScope.groups);

                    let count = 1;

                    angular.forEach(groupsToSend, function (group) {
                      group.UpsertType = 3;
                      group.DisplayOrder = count++;
                      delete group.Reasons;
                      group.MachineID = stopEventsCtrl.mainData.selectedMachine.Id;
                    });

                    /**
                     * Sets UpsertType to 3 (3 for UPDATE, according to server-side logic)
                     */

                    angular.forEach(activeGroups, function (g) {
                      g.DisplayOrder = _.find(groupsToSend, { ID: g.ID }).DisplayOrder;
                    });

                    upperScope.sortGroupsByOrder();

                    const bodyReq = { eventsGroup: groupsToSend };

                    LeaderMESservice.customAPI("UpsertEventGroup", bodyReq).then(
                      function (res) {
                        $modalInstance.close();
                        toastr.success("", $filter("translate")("ORDER_SAVED_SUCCESSFULLY"));
                      },
                      function (err) {
                        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
                      }
                    );
                  };

                  $scope.close = function () {
                    activeGroups = _.extend(activeGroups, $scope.clearGroupsBeforeEdit);
                    $modalInstance.close();
                  };
                },
              })
              .result.then(function () {});
          };

          // $scope.addNewEmptyGroup = function () {
          //   $scope.groups.unshift(stopEventsCtrl.getEmptyNewGroup());
          // };

          $scope.handleMenuCB = function (reason, selectedTime) {
            reason.EventDefinitionID = selectedTime;
            reason.menuOpened = false;
          };

          $scope.addReasonToGroup = function (group) {
            if (!group.Reasons) {
              group.Reasons = [];
            }
            group.Reasons.push(stopEventsCtrl.getEmptyNewReason(group.ID));
          };

          /**
           * Open translations modal and handle logic inside
           */
          $scope.openTranslationsModal = function (group) {
            $modal
              .open({
                templateUrl: "views/stopEventsModals/translationsModal.html",
                windowClass: "translationsModal",
                controllerAs: "translationCtrl",
                controller: function ($scope, $modalInstance, LeaderMESservice) {
                  const translationCtrl = this;
                  $scope.fetching = false;
                  $scope.selectedLang = undefined;

                  $scope.popupFlags = {};

                  $scope.close = function () {
                    $modalInstance.close();
                  };

                  translationCtrl.getMachinesByDicId = function (DicId, entity) {
                    if (!angular.isDefined(entity.commonDictionariesPopup)) {
                      entity.commonDictionariesPopup = false;
                    }

                    // close all other popups for groups and reasons
                    angular.forEach($scope.groups, function (g) {
                      //exclude group with same id
                      if (!(entity.Reasons && g.ID == entity.ID)) {
                        g.commonDictionariesPopup = false;
                      }

                      angular.forEach(g.Reasons, function (r) {
                        //exclude reason with same id
                        if (!entity.Reasons && r.ID == entity.ID) {
                          return;
                        }
                        r.commonDictionariesPopup = false;
                      });
                    });

                    entity.commonDictionariesPopup = !entity.commonDictionariesPopup;

                    $scope.fetched = false;

                    if (entity.commonDictionariesPopup) {
                      LeaderMESservice.customAPI("GetMachinesForDictionaryID", { DictionaryID: DicId }).then(function (response) {
                        $scope.machinesWithThisDictionary = response.ResponseList || [];
                        $scope.fetched = true;
                      });
                    }
                  };

                  /**
                   * Get translations from the server and splits them to two objects.
                   * One object contains translations with values and another object contains
                   * translations with null values to assign them in the dropdown for the user to add values.
                   */

                  /**
                   * Holds the array of language mapping key and value (eng -> English)
                   * @type {Array}
                   */
                  translationCtrl.dict = [];

                  /**
                   * Holds empty translations to display in the Add Language dropdown options
                   * @type {Array}
                   */
                  translationCtrl.emptyTranslations = [];

                  /**
                   * Will hold the displayed table of current available translations sent from the server
                   * @type {Array}
                   */
                  translationCtrl.currentTranslations = [];

                  //first attach the group name translation
                  const promise1 = LeaderMESservice.customAPI("GetTranslationForEventAndGroup", { ID: group.DictionaryID });
                  const promisesToResolve = [promise1];

                  //second, loop over the groups reasons and create promises for them
                  angular.forEach(group.Reasons, function (reason) {
                    const reasonPromise = LeaderMESservice.customAPI("GetTranslationForEventAndGroup", { ID: reason.DictionaryID });
                    promisesToResolve.push(reasonPromise);
                  });

                  promisesQCB = function (values) {
                    $scope.fetching = false;

                    // values will certainly hold one item at least which is the group dictionary itself
                    // even if the group did not have any reasons. So we are extracting the dictionary
                    translationCtrl.dict = values[0].ResponseDataTable;

                    // assign empty translations as all availble language for now, will delete keys from it once we notice
                    // that there exist at least one translated value in this langauge key
                    translationCtrl.emptyTranslations = _.map(translationCtrl.dict[0], function (i) {
                      return i.langshortname;
                    });

                    angular.forEach(values, function (row) {
                      //should be only one response entry row per dictionary ID, but we will do the loop any way:
                      angular.forEach(row.ResponseList, function (responseListItem) {
                        // server is sending an extra unneccessary ID attribute
                        // delete responseListItem.ID
                      });
                      if (row.ResponseList[0].ID == group.DictionaryID) {
                        row.ResponseList[0].NumOfMachines = group.NumOfMachines;
                      } else {
                        var reason = _.find(group.Reasons, { DictionaryID: row.ResponseList[0].ID });
                        if (reason) {
                          row.ResponseList[0].NumOfMachines = reason.NumOfMachines;
                        }
                      }
                      translationCtrl.currentTranslations = translationCtrl.currentTranslations.concat(row.ResponseList);
                    });
                    console.log(translationCtrl.currentTranslations);
                    // separate empty translations
                    angular.forEach(translationCtrl.currentTranslations, function (translatedRow) {
                      angular.forEach(translatedRow, function (val, key) {
                        if (val) {
                          const indexToRemove = translationCtrl.emptyTranslations.indexOf(key);
                          if (indexToRemove > -1) translationCtrl.emptyTranslations.splice(indexToRemove, 1);
                        }
                      });
                    });

                    // remove keys for non translated columns to not render these columns in ui
                    angular.forEach(translationCtrl.currentTranslations, function (translatedRow) {
                      angular.forEach(translatedRow, function (val, key) {
                        if (translationCtrl.emptyTranslations.indexOf(key) > -1) {
                          delete translatedRow[key];
                        }
                      });
                    });
                  };

                  $scope.fetching = true;

                  Promise.all(promisesToResolve).then(function (values) {
                    $timeout(promisesQCB(values), 600);
                    $scope.selectedLang = translationCtrl.emptyTranslations[0];
                  });

                  /**
                   * Adds lang to currentTranslations and delete the lang from empty langs
                   * in order to prevent adding duplicated translations
                   */
                  $scope.addLanguage = function (lang) {
                    var lang = $scope.selectedLang;
                    const langIndx = translationCtrl.emptyTranslations.indexOf(lang);

                    if (!lang) return;

                    angular.forEach(translationCtrl.currentTranslations, function (row) {
                      row[lang] = null;
                    });

                    if (langIndx > -1) {
                      translationCtrl.emptyTranslations.splice(langIndx, 1);
                    }
                    $scope.selectedLang = translationCtrl.emptyTranslations[0];
                  };

                  /**
                   * Close and Save user changes
                   */
                  $scope.saveAndClose = function () {
                    const promises = [];

                    $scope.fetching = true;
                    angular.forEach(translationCtrl.currentTranslations, function (currentTranslation) {
                      let bodyReq = {
                        ID: currentTranslation.ID,
                        values: currentTranslation,
                      };

                      delete bodyReq.values.ID;

                      bodyReq.values = _.map(bodyReq.values, function (val, key) {
                        return { key: key, value: val };
                      });

                      // remove num of machines from body req

                      bodyReq.values = bodyReq.values.filter(function (i) {
                        return i.key != "NumOfMachines" && i.key != "commonDictionariesPopup";
                      });

                      let currentPromise = LeaderMESservice.customAPI("UpdateTranslationForEventAndGroup", bodyReq);
                      promises.push(currentPromise);
                    });

                    Promise.all(promises).then(
                      function (r) {
                        $modalInstance.close();
                        toastr.success("", $filter("translate")("TRANSLATIONS_SAVED_SUCCESSFULLY"));
                        stopEventsCtrl.getEventReasonAndGroups();
                        $scope.fetching = false;
                      },
                      function (err) {
                        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
                      }
                    );
                  };
                },
              })
              .result.then(function () {});
          };
        },
      });
    };

    /**
     * State params for the BreadsCrumbs
     */
    stopEventsCtrl.initStateParams = function () {
      if (!$state.params.menuContent) {
        $scope.stateParams = LeaderMESservice.getStateParams();
      } else {
        $scope.stateParams = $state.params.menuContent;
      }
    };

    /**
     * Inits BreadCrumbs menu on top
     */
    stopEventsCtrl.initBreadCrumbs = function () {
      BreadCrumbsService.init();
      if ($scope.localLanguage == true) {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
      } else {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
      }
    };

    /**
     * Init function
     */
    stopEventsCtrl.init = function () {
      stopEventsCtrl.initStateParams();
      stopEventsCtrl.initBreadCrumbs();
    };

    $scope.save = function () {
      console.log("stop events save");
    };

    stopEventsCtrl.init();
  };

  return {
    restrict: "EA",
    templateUrl: "js/components/stopEvents/stopEvents.html",
    scope: {},
    controller: controller,
    controllerAs: "stopEventsCtrl",
  };
}

angular.module("LeaderMESfe").directive("stopEvents", stopEvents);
