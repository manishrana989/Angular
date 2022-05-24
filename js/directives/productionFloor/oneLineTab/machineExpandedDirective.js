function machineExpanded($filter) {
  var template = "views/custom/productionFloor/onlineTab/expandedMachines.html";

  var controller = function (toastr, $modal, $scope, LeaderMESservice, 
      ExpandedMachinesService, $sessionStorage, $timeout, googleAnalyticsService, 
      notify, $state, commonFunctions, shiftService,$rootScope,$localStorage) {
    var machineExpandedCtrl = this;
    $scope.machineBox = $scope.content;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    var jobDef = _.find($sessionStorage.jobDefinitions, {
      ID: $scope.machineBox.JobDefID
    });
    if (jobDef) {
      $scope.machineBox.jobToolTip = jobDef.Name;
    }  
    if(!machineExpandedCtrl.showApplyModel)
    {
      machineExpandedCtrl.showApplyModel = false
    }
    $scope.structureType = 1;

     $scope.selectTemplateGroupID = $localStorage.selectTemplateGroupID;
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.doneLoading = false;
    this.showCalendar = false;
    $scope.technicianNotification = [];
    $scope.lastMessage = {
      data: null,
    };
    $scope.notifiactionLoading = true;

    $scope.updateCubeData = {};

    $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure;
     
    machineExpandedCtrl.view = "regular";
    machineExpandedCtrl.productMenuList = [{
        FieldName: "Product",
        translate: "PRODUCT",
        FieldEName: "ProductEName",
        FieldLName: "ProductLName",
        type: 1
      },
      {
        FieldName: "ProductCatalogID",
        translate: "PRODUCT_CATALOG_ID",
        type: 2
      },
      {
        FieldName: "Customer",
        translate: "CUSTOMER",
        FieldEName: "ClientEName",
        FieldLName: "ClientLName",
        type: 1
      },
    ];

    machineExpandedCtrl.eventId;
    $scope.shiftData = shiftService.shiftData;
    $scope.refreshDataCallback = {};

    $scope.$on("closeModel",function(model){      
      machineExpandedCtrl.showApplyModel = false;
    });

    $scope.openStopEventReport = id => {
      var eventId;
      LeaderMESservice.customAPI("GetResultSearchFields", {
        reportID: '850',
        sfCriteria: [{
          FieldName: "MachineIdentifier",
          Eq: id,
          DataType: "num"
        }],
        IsUserReport: false
      }).then(function (response) {
        $scope.searchFields = response[1];
        machineExpandedCtrl.event = $scope.searchFields.find(row => row.EndTime == null);
        machineExpandedCtrl.eventId = machineExpandedCtrl.event?.ID;
        $scope.searchTemplate(machineExpandedCtrl.eventId);
      });

      LeaderMESservice.customAPI('GetEventReasonAndGroups', {
        MachineID: id,
      }).then((response) => {
        machineExpandedCtrl.EventsAndGroups = response.EventsAndGroups;
      });


      $scope.searchTemplate = evId => {
        var modalInstance = $modal.open({
          templateUrl: "js/components/stopEventSearch/stopEventSearchTemplate.html",
          controller: function ($scope, $modalInstance) {
            $scope.eventIds = [evId];
            $scope.machineID = [id];
            $scope.close = function (result) {
              $modalInstance.close(result);
            };
          }
        }).result.then(function (result) {
          if (result) {
            $scope.updateData();
          }
        });
      }

    };


    $scope.saveStructure = function (applyToAllMachines, applyButtonClicked) {
      LeaderMESservice.customAPI("SaveMachineStructure", {
        machineStructure: [{
          MachineArr: [$scope.machineBox.MachineID],
          StructureType: 1,
          Structure: JSON.stringify($scope.machinesExpandedData),
        }, ],
      }).then(function (response) {
        if (applyToAllMachines) {
          $scope.updateStructures();
          //to clear previous toastr to prevent toastr duplicating on screen
          if (applyButtonClicked) {
            toastr.clear();
            toastr.success("", $filter("translate")("STRUCTURE_SAVED_SUCCESSFULLY"));
          }
        }
      });
    };

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();

    $scope.gaE = function (page_view, event_name) {
      googleAnalyticsService.gaEvent(page_view, event_name);
    };

    $scope.openImageInModal = function (url) {
      $modal
        .open({
          templateUrl: "views/common/imgInModal.html",
          windowClass: "imageInModal",
          controller: function ($scope, $modalInstance) {
            $scope.imgURL = url;

            $scope.close = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function () {});
    };

    $scope.openEvent = function (eventId,eventColor,EventDistributionID) {
      if([1,3,7,8].indexOf(EventDistributionID) < 0){
        $scope.successCallback = () => {
            LeaderMESservice.customAPI('GetDepartmentShiftData',{
              "ReqDepartment":[{"MachineIDs":[$scope.machineBox.MachineID],"RefShiftDays":1}],"UseCache":false
            }).then(response => {
              const department = _.find(response.Departments,{ID: $scope.shiftData.DepartmentID});
              if (department) {
                if (department.CurrentShift && department.CurrentShift.length > 0){
                  const currentShift = department.CurrentShift[department.CurrentShift.length - 1];
                  if (currentShift){
                    const currentMachine = _.find(currentShift.Machines,{Id: $scope.machineBox.MachineID});
                    if (currentMachine) {
                      $scope.machineBox.events = currentMachine.Events || [];
                      const startTime = new Date(currentShift.StartTime);
                      const endTime = new Date(currentShift.EndTime);
                      if (!$scope.machineBox.shiftStartTime || $scope.machineBox.shiftStartTime > startTime) {
                        $scope.machineBox.shiftStartTime = startTime;
                      }
                      if (!$scope.machineBox.shiftEndTime || $scope.machineBox.shiftEndTime < endTime) {
                        currentMachine.shiftEndTime = endTime;
                      }
                      $scope.machineBox.shiftTotalDuration = Math.floor(($scope.machineBox.shiftEndTime - $scope.machineBox.shiftStartTime) / 1000 / 60);
                    }
                  }
                }
              }
            });
          }
          commonFunctions.formInModal($scope,'EVENT',1015,eventId);
        };

    };

    $scope.$watch(
      "machineBox",
      function (newValue, oldValue) {
        if (newValue && oldValue && newValue.updatedDate == oldValue.updatedDate) {
          return;
        }
        $scope.updateParamWithLimits();
        machineExpandedCtrl.actionsData = null;

        if ($scope.updateCubeData.updateNotifications) {
          $scope.updateCubeData.updateNotifications();
        }
        $timeout(function () {
          $scope.prepareActions();
        }, 50);
      },
      true
    );

    $scope.prepareActions = function () {
      var appObject = angular.copy(LeaderMESservice.getTabsByAppName("MachineScreenEditor"));
      if (appObject) {
        $scope.actions = _.map(appObject.Actions, function (action) {
          if (action.ActionCriteria && action.ActionCriteria != "" && typeof action.ActionCriteria !== "object") {
            action.ActionCriteria = JSON.parse(action.ActionCriteria);
          }
          action.updateData = $scope.updateData;
          return action;
        });
        var activateJob = _.find($scope.actions, {
          SubMenuAppPartID: 20225
        });
        if (activateJob) {
          activateJob.updateData = $scope.updateData;
        }
        $scope.params = $scope.machineBox;
        if ($scope.params.SetupEnd == null) {
          $scope.params.SetupEnd = "";
        }
        const reportStopEventAction = angular.copy($scope.actions[0]);
        reportStopEventAction.SubMenuAppPartID = -3;
        reportStopEventAction.SubMenuAccessLevel = -3;
        reportStopEventAction.SubMenuDisplayOrder = 0;
        reportStopEventAction.SubMenuEName = $filter('translate')('REPORT_STOP_EVENT');
        reportStopEventAction.SubMenuLName = $filter('translate')('REPORT_STOP_EVENT');
        reportStopEventAction.SubMenuTargetParameters = '';
        reportStopEventAction.SubMenuTargetTYpe = 'custom:reportStopScreenEvent';
        $scope.actions.unshift(reportStopEventAction);
        machineExpandedCtrl.actionsData = {
          actions: $scope.actions,
          parentScope: $scope,
          params: $scope.params,
          ID: $scope.machineBox.MachineID,
          targetParameters: $scope.machineBox,
          linkItem: "MachineScreenEditor",
          customScreen: "Department_Online",
        };
      }
    };

    $scope.prepareActions();
    $scope.getStaticField1Style = function () {
      var visibileCount = 1;
      if (!machineExpandedCtrl.showPencils)
        if ($scope.machinesExpandedData.staticField2 && $scope.machinesExpandedData.staticField3) {
          if ($scope.machinesExpandedData.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machinesExpandedData.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 1) {
            return {
              margin: "76px 0 -76px 0"
            };
          } else if (visibileCount == 2) {
            return {
              "padding-top": "45px"
            };
          }
        }
    };

    $scope.getStaticField2Style = function () {
      var visibileCount = 1;
      if (!machineExpandedCtrl.showPencils)
        if ($scope.machinesExpandedData.staticField2 && $scope.machinesExpandedData.staticField3) {
          if ($scope.machinesExpandedData.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machinesExpandedData.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 2) {
            return {
              "padding-top": "60px"
            };
          }
        }
    };

    $scope.getStaticField3Style = function () {
      var visibileCount = 1;
      if (!machineExpandedCtrl.showPencils)
        if ($scope.machinesExpandedData.staticField2 && $scope.machinesExpandedData.staticField3) {
          if ($scope.machinesExpandedData.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machinesExpandedData.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 2) {
            return {
              bottom: "35px"
            };
          }
        }
    };

    $scope.addRemoveStaticField = function (show, staticField) {
      // this callback should remove staticfield2 or staticfield3 according to staticField
      if ($scope.machinesExpandedData[staticField]) {
        $scope.machinesExpandedData[staticField].visibility = show;
      }
      $scope.saveStructure(false);

      ExpandedMachinesService.updateVisibilityForStaticFields(show, $scope.machineBox.MachineTypeID, staticField);
    };

    machineExpandedCtrl.allParams = $scope.machineBox.MachineParams;
    if (_.findIndex(machineExpandedCtrl.allParams, {
        FieldName: "customUIImage"
      }) < 0) {
      machineExpandedCtrl.allParams.unshift({
        FieldName: "customUIImage",
        FieldEName: $filter("translate")("CUSTOM_UI_IMAGE"),
        FieldLName: $filter("translate")("CUSTOM_UI_IMAGE"),
      });
    }

    if ($scope.localLanguage) {
      machineExpandedCtrl.allParams = _.sortByOrder(machineExpandedCtrl.allParams, ["FieldLName"]);
    } else {
      machineExpandedCtrl.allParams = _.sortByOrder(machineExpandedCtrl.allParams, ["FieldEName"]);
    }
    var removeParamIndex = _.findIndex(machineExpandedCtrl.allParams, {
      FieldName: "removeParam"
    });
    if (removeParamIndex > -1) {
      if (removeParamIndex > 0) {
        machineExpandedCtrl.allParams.splice(removeParamIndex, 1);
        machineExpandedCtrl.allParams.unshift({
          FieldName: "removeParam",
          FieldEName: $filter("translate")("REMOVE_PARAM"),
          FieldLName: $filter("translate")("REMOVE_PARAM"),
          CurrentValue: "",
        });
      }
    } else {
      machineExpandedCtrl.allParams.unshift({
        FieldName: "removeParam",
        FieldEName: $filter("translate")("REMOVE_PARAM"),
        FieldLName: $filter("translate")("REMOVE_PARAM"),
        CurrentValue: "",
      });
    }

    $scope.updateParamWithLimits = function () {
      machineExpandedCtrl.paramsWithLimits = _.filter($scope.machineBox.MachineParams, function (param) {
        if (param && param.LowLimit && param.HighLimit) {
          return true;
        }
        return false;
      });

      machineExpandedCtrl.paramsWithLimits = _.map(machineExpandedCtrl.paramsWithLimits, function (param) {
        param.CurrentValue = parseFloat(param.CurrentValue);
        return param;
      });

      var joshProgressTranslate = $filter("translate")("JOSH_PROGRESS");
      var jobProgressTranslate = $filter("translate")("JOB_PROGRESS");

      machineExpandedCtrl.paramsWithLimits.unshift({
        FieldName: "Job Progress",
        FieldEName: jobProgressTranslate,
        FieldLName: jobProgressTranslate
      });
      machineExpandedCtrl.paramsWithLimits.unshift({
        FieldName: "Josh Progress",
        FieldEName: joshProgressTranslate,
        FieldLName: joshProgressTranslate
      });

      if ($scope.localLanguage) {
        machineExpandedCtrl.paramsWithLimits = _.sortByOrder(machineExpandedCtrl.paramsWithLimits, ["FieldLName"]);
      } else {
        machineExpandedCtrl.paramsWithLimits = _.sortByOrder(machineExpandedCtrl.paramsWithLimits, ["FieldEName"]);
      }
    };

    $scope.updateParamWithLimits();

    var menuAndSubMenu = LeaderMESservice.getMainMenu();
    $scope.productionFloorMenu = _.find(menuAndSubMenu, {
      TopMenuAppPartID: 500
    });
    if ($scope.productionFloorMenu) {
      $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, {
        SubMenuExtID: $scope.departmentId
      });
    }

    $scope.editModeCallback = function (param, applyAll, field) {
      machineExpandedCtrl.openEditMode = false;
      $scope.machinesExpandedData[field] = {
        FieldName: param.FieldName,
        graph: $scope.machinesExpandedData[field] && $scope.machinesExpandedData[field].graph,
        visibility: true,
        translate: param.translate,
        FieldEName: param.FieldEName,
        FieldLName: param.FieldLName,
        type: param.type
      };
      $scope.saveStructure(applyAll);
      //update session storage with chosenparam
      ExpandedMachinesService.updateStaticField($scope.machineBox.MachineID, param, applyAll, $scope.machineBox.MachineTypeID, field);
    };
    $scope.srcFromId = function (id, getText) {
      var img = null;
      var text = null;
      switch (id) {
        case "0":
          img = "images/onlineIcons/technician-called.png";
          text = "TECHNICIAN_CALLED";
          break;
        case "1":
          img = "images/onlineIcons/message-recieved.png";
          text = "TECHNICIAN_MESSAGE_RECIEVED";
          break;
        case "2":
          img = "images/onlineIcons/decline.png";
          text = "TECHNICIAN_DECLINE";
          break;
        case "4":
          img = "images/onlineIcons/at-work.png";
          text = "TECHNICIAN_AT_WORK";
          break;
        case "5":
          img = "images/onlineIcons/work-done.png";
          text = "TECHNICIAN_WORK_DONE";
          break;
        case "6":
          img = "images/onlineIcons/cancel.png";
          text = "TECHNICIAN_WORK_CANCEL";
          break;
      }
      if (getText) {
        return text;
      }
      return img;
    };

    $scope.canClick = function (machine) {
      if (machine.ProductionModeID == 1) {
        machineExpandedCtrl.showPencils = !machineExpandedCtrl.showPencils;
        $scope.gaE("Department_Online", "edit_cube_mode");
      }
    };

    $scope.paramEditModeCallback = function (param, applyAll, index) {
      machineExpandedCtrl.paramsEditMode[index] = false;

      $scope.machinesExpandedData.params[index] = {
        FieldName: param.FieldName,
      };
      $scope.saveStructure(applyAll);
    };

    $scope.addNewParamsRow = function () {
      var newParams = ExpandedMachinesService.getInitialStructureParams();
      $scope.machinesExpandedData.params = $scope.machinesExpandedData.params.concat(newParams);
      $scope.saveStructure(true);
    };

    $scope.removeParamsRow = function () {
      $scope.machinesExpandedData.params.splice(3, 5);
      $scope.saveStructure(true);
    };

    machineExpandedCtrl.sendMessage = function () {
      if (machineExpandedCtrl.sendingMessage) {
        return;
      }
      machineExpandedCtrl.sendingMessage = true;
      LeaderMESservice.customAPI("SendNotificationToOpApp", {
        title: "",
        Text: machineExpandedCtrl.newMessage,
        sourceMachineID: $scope.machineBox.MachineID,
      }).then(
        function (response) {
          machineExpandedCtrl.newMessage = "";
          machineExpandedCtrl.sendingMessage = false;
        },
        function (error) {
          machineExpandedCtrl.sendingMessage = false;
          if (error && error.ErrorDescription) {
            notify({
              message: error.ErrorDescription,
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          }
        }
      );
    };

    machineExpandedCtrl.displayCalendar = function () {
      var calendarObject = LeaderMESservice.getTabsByAppName("CalendarEvent");
      if (calendarObject) {
        if (machineExpandedCtrl.view == "calendar") {
          machineExpandedCtrl.view = "regular";
        } else {
          machineExpandedCtrl.view = "calendar";
        }
      } else {
        machineExpandedCtrl.showCalendar = false;
        notify({
          message: $filter("translate")("CALENDAR_ACCESS_DENIED"),
          classes: "alert-danger",
          templateUrl: "views/common/notify.html",
        });
      }
      $scope.gaE("Department_Online", "Machine_cube_calendar_view");
    };

    machineExpandedCtrl.expandCalendar = function () {
      var url = $state.href("appObjectFullView", {
        appObjectName: "Calendar",
        ID: $scope.machineBox.MachineCalendarID,
      });
      window.open(url, "Calendar");
    };

    machineExpandedCtrl.openMachine = function (machineId) {
      var url = $state.href("appObjectMachineFullView", {
        appObjectName: "MachineScreenEditor",
        ID: machineId,
      });
      window.open(url, "_blank");
    };

    machineExpandedCtrl.getMachineHeight = function () {
      return ($scope.machinesExpandedData.params.length <= 3 ? 435 : 520) + 35;
    };

    machineExpandedCtrl.closeCallOfService = function () {
      machineExpandedCtrl.view = "regular";
    };

    machineExpandedCtrl.showAverage = function (param) {
      switch (param) {
        case 1:
          return machineExpandedCtrl.chosenParam1.FieldName == "CycleTime";
        case 2:
          return machineExpandedCtrl.chosenParam2.FieldName == "CycleTime";
        case 3:
          return machineExpandedCtrl.chosenParam3.FieldName == "CycleTime";
      }
    };
};


var link = function(scope, element){
    var tooltip = null;
    scope.initTooltip = () => {
        tooltip = d3.select(element[0]).select(".machine-expanded-tooltip");
    }
    scope.tooltipIn = function(event,data){
        if (!tooltip){
            return;
        } 
        scope.tooltipDisplay = true;
        tooltip.select('.tooltip-start-date').html($filter("date")(data.StartTime,"dd/MM/yyyy HH:mm:ss"));
        tooltip.select('.tooltip-event-duration').html($filter('getDurationInHoursMinutes')(data.Duration));
        tooltip.select('.tooltip-event-type').html(data.EventReason && data.EventReason !== "" ?  data.EventReason : data.Name);
    }
    scope.tooltipMove = function(event){
      
        if (!tooltip) {
            return;
        }

        if(!scope.rtl){
            if(event.currentTarget.offsetLeft+100 > event.currentTarget.parentElement.offsetWidth ){
                tooltip.style('left', (event.currentTarget.parentElement.offsetWidth-100) + 'px');
            }
            else {
                tooltip.style('left', (event.currentTarget.offsetLeft) + 'px');
            }
        }else {  
           if(event.currentTarget.parentElement.offsetWidth-event.currentTarget.offsetLeft+100> event.currentTarget.parentElement.offsetWidth){
                tooltip.style('right',(event.currentTarget.parentElement.offsetWidth-event.currentTarget.offsetLeft-100) +'px');
           }else{
               tooltip.style('right',(event.currentTarget.parentElement.offsetWidth-event.currentTarget.offsetLeft) +'px');
           }
        }
    }
    scope.tooltipLeave = function(){
        scope.tooltipDisplay = false;
    }
    
}




  return {
    restrict: "A",
    templateUrl: template,
    scope: {
      content: "=",
      updateData: "=",
      showPencils: "=",
      machinesExpandedData: "=",
      updateStructures: "=",
      updateTechnicianStatus: "=",
      technicianStatus: "=",
      jobConfiguration: "=",
      getGraphData: "=",
      graphData: "=",
      usersData: "=",
      allMachines:"=",
      isDefaultStructure:"=",
    },
    controller: controller,
    link , link ,
    controllerAs: "machineExpandedCtrl",
  };
}

angular.module("LeaderMESfe").directive("machineExpanded", machineExpanded);