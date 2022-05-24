angular
  .module("LeaderMESfe")
  .factory(
    "customServices",
    function (
      $state,
      productsService,
      productionFloorService,
      jobsService,
      machineTypeService,
      fileUploadService,
      $modal,
      tasksManagementService,
      filesInterfaceService,
      LeaderMESservice,
      $filter,
      toastr,
      $timeout,
      googleAnalyticsService,
      GoalsService,
      commonFunctions
    ) {
      var customCode = [
        {
          id: "custom:popupCreateEvent",
          code: ($scope) => {
            const start = $scope.newEventData.start;
            const end = $scope.newEventData.end;
            var tabs = LeaderMESservice.getTabsByAppName("Calendar");
            if (tabs) {
              var action = _.find(tabs.Actions, { SubMenuAppPartID: 11090 });
              $scope.calendarPairs = [];
              $scope.calendarPairs.push({
                DataType: "Date",
                Eq: start.format("DD/MM/YYYY HH:mm:ss"),
                FieldName: "DateFrom",
              });
              $scope.calendarPairs.push({
                DataType: "Date",
                Eq: end.format("DD/MM/YYYY HH:mm:ss"),
                FieldName: "DateTo",
              });
              if (action) {
                $scope.calendarCallBackFucntion = $scope.updateNewEvent;
                var calendarId =
                  $scope.calendarId || $scope.newEventData.calendarId;
                if (
                  $scope.calendarDirectiveCtrl &&
                  $scope.calendarDirectiveCtrl.displayedCalendars &&
                  $scope.calendarDirectiveCtrl.displayedCalendars.length == 1
                ) {
                  calendarId =
                    $scope.calendarDirectiveCtrl.displayedCalendars[0];
                }
                $scope.calendarPairs.push({
                  DataType: "num",
                  Eq: calendarId || $scope.departmentCalendarId,
                  FieldName: "CalendarID",
                });
                $scope.machineName = "";
                if ($scope.newEventData.machineName) {
                  $scope.machineName = ` - (${$scope.newEventData.machineName})`;
                }
                $modal.open({
                  resolve: {
                    parentScope: function () {
                      return $scope;
                    },
                  },
                  backdrop: "static",
                  keyboard: false,
                  template: `
                                <div class="modal-header" style="position: relative">
                                    <h3 class="modal-title" id="modal-title">{{"CREATE_NEW_EVENT" | translate}} {{machineName}}</h3>
                                    <img src="images/close.png" style="position: absolute; top: 15px; right: 15px" ng-click="close()" />
                                </div>
                                <div class="modal-content">
                                    <calendar-event event-id="eventId" pairs="pairs" form-id="formId" callback="callback"></calendar-event>
                                </div>
                                `,
                  controller: function (
                    $scope,
                    $compile,
                    $modalInstance,
                    parentScope
                  ) {
                    $scope.close = function () {
                      $modalInstance.close();
                    };
                    $scope.pairs = parentScope.calendarPairs;
                    $scope.machineName = parentScope.machineName;
                    $scope.callback = function () {
                      if (parentScope.calendarCallBackFucntion) {
                        parentScope.calendarCallBackFucntion();
                      } else if (parentScope.callbackFunction) {
                        parentScope.callbackFunction();
                      }
                      $modalInstance.close();
                    };
                    $scope.eventId = 0;
                    $scope.formId = 101282;
                  },
                });
              }
            }
          },
        },
        {
          id: "custom:ProductRecipe",
          code: function ($scope) {
            // productsService.productRecipeCode($scope);
            $scope.templateUrl = "views/custom/production/products/recipe.html";
          },
        },
        {
          id: "custom:dashboard",
          code: function ($scope) {
            $state.go("index.main");
          },
        },
        {
          id: "custom:pendingJobs",
          code: function ($scope, actionItem) {
            machineTypeService.machinePendingJobs($scope, actionItem);
          },
        },
        {
          id: "custom:JobRecipe",
          code: function ($scope) {
            if (
              $scope.content.actionsData &&
              $scope.content.actionsData.targetParameters &&
              $scope.content.actionsData.targetParameters.JobID
            ) {
              $scope.content.JobID =
                $scope.content.actionsData.targetParameters.JobID;
            } else if (!$scope.content.JobID) {
              $scope.content.JobID = $scope.content.ID;
            }
            jobsService.RecipeCode($scope);
            $scope.templateUrl = "views/custom/production/jobs/Recipe.html";
          },
        },
        {
          id: "custom:GetMachineCubeData",
          code: function ($scope) {
            productionFloorService.productionFloorCode($scope);
            $scope.templateUrl =
              "views/custom/productionFloor/common/productionFloorTemplate.html";
          },
        },
        {
          id: "custom:JobGeneral",
          code: function ($scope) {
            jobsService.generalCode($scope);
            $scope.templateUrl = "views/common/form.html";
          },
          getTemplate: function () {
            return "views/common/form.html";
          },
        },
        {
          id: "custom:CubeEditor",
          code: function ($scope) {
            $scope.content.requestAPI = "GetCubeStructure";
            $scope.content.saveAPI = "SaveCubeStructure";
            $scope.content.paramStuctureAttr = "CubeStructure";
            $scope.templateUrl =
              "views/custom/setup/MachineEditor/cubeMachineEditor.html";
            $scope.content.showChannel = false;
          },
        },
        {
          id: "custom:GeneralDetails",
          code: function ($scope) {
            $scope.content.requestAPI = "GetMachineParametersStructure";
            $scope.content.saveAPI = "SaveMachineParameters";
            $scope.content.paramStuctureAttr = "MachineParametersStructure";
            $scope.content.showChannel = true;
            $scope.templateUrl =
              "views/custom/setup/MachineEditor/generalMachineEditor.html";
          },
        },
        {
          id: "custom:MachineGeneral",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/machine/machineDashboard.html";
            machineTypeService.machineDashboardCode($scope);
          },
        },
        {
          id: "custom:ProcessControl",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/machine/processControl.html";
            machineTypeService.machineProcessControl($scope);
          },
        },
        {
          id: "custom:SplitJob",
          code: function ($scope) {
            jobsService.splitJobAction($scope);
          },
        },
        {
          id: "custom:FileUpload",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/files/fileUpload.html";
            fileUploadService.fileUpload($scope);
          },
        },
        {
          id: "custom:FileUploadInterface",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/files/fileUploadInterface.html";
            fileUploadService.fileUpload($scope);
          },
        },
        {
          id: "custom:QuickFileUpload",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/files/quickFileUpload.html";
            fileUploadService.quickFileUpload($scope);
          },
        },
        {
          id: "custom:MachineMaterials",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/machineMaterials/machineMaterialsTemplate.html";
          },
        },
        {
          id: "custom:ObjectPrintDefiniftion",
          code: function ($scope) {
            $scope.templateUrl =
              "views/custom/print/printDefinitionTemplate.html";

            $scope.printDefinitionData = {
              type: "object",
              printStructureLevel:
                $scope.content.subMenu.SubMenuObjectPrintLevel,
              printLevelRelatedID: $scope.content.ID,
            };
          },
        },
        {
          id: "custom:ObjectPrint",
          code: function ($scope, actionItem) {
            var actionModalInstance = $modal.open({
              templateUrl: "views/custom/print/printObjectTemplate.html",
              resolve: {
                ID: function () {
                  return $scope.content.ID;
                },
              },
              controller: function ($scope, $modalInstance, ID) {
                $scope.printObjectData = {
                  type: "object",
                  objectTypeID: parseInt(actionItem.SubMenuTargetParameters),
                  objectID: ID,
                };
              },
              controllerAs: "splitJobActionCtrl",
            });
          },
        },
        {
          id: "custom:LabelPrint",
          code: function ($scope, actionItem) {
            var actionModalInstance = $modal.open({
              templateUrl: "views/custom/print/printObjectTemplate.html",
              resolve: {
                ID: function () {
                  return $scope.content.ID;
                },
              },
              controller: function ($scope, $modalInstance, ID) {
                $scope.printObjectData = {
                  type: "label",
                  objectTypeID: parseInt(actionItem.SubMenuTargetParameters),
                  objectID: ID,
                };
              },
              controllerAs: "splitJobActionCtrl",
            });
          },
        },
        {
          id: "custom:LabelPrintDefinition",
          code: function ($scope) {
            $scope.templateUrl =
              "views/custom/print/printDefinitionTemplate.html";

            $scope.printDefinitionData = {
              type: "label",
              objectTypeID: $scope.content.objectTypeID,
              ID: $scope.content.ID,
            };
          },
        },
        {
          id: "custom:ProductTree",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/graphs/graphContainer.html";
            $scope.requestAPI = "CreateRecursiveProductTree";
            $scope.requestBody = {
              ProductID: $scope.content.ID,
            };
          },
        },
        {
          id: "custom:JobTree",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/graphs/graphContainer.html";
            $scope.requestAPI = "CreateRecursiveJobTree";
            $scope.requestBody = {
              JobID: $scope.content.ID,
            };
          },
        },
        {
          id: "custom:JobLifeCycleTree",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/graphs/graphContainer.html";
            $scope.requestAPI = "CreateRecursiveJobLifeCycleTree";
            $scope.requestBody = {
              JobID: $scope.content.ID,
            };
          },
        },
        {
          id: "custom:OpAppCustom",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/appView/opAppTemplate.html";
          },
        },
        {
          id: "custom:ManagerAppCustom",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/appView/managerAppTemplate.html";
          },
        },
        {
          id: "custom:CalendarCustom",
          code: function ($scope) {
            $scope.templateUrl = "views/custom/calendar/calendarTemplate.html";
          },
        },
        {
          id: "custom:SiteConfigurationWizard",
          code: function ($scope) {
            $scope.templateUrl =
              "views/custom/components/siteConfigurationTemplate.html";
          },
        },
        {
          id: "custom:MobileNotifications",
          code: function ($scope) {
            $scope.templateUrl =
              "views/custom/components/mobileNotificationsTemplate.html";
          },
        },
        {
          id: "custom:DomainList",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/siteConfiguration/siteConfigurationSteps/users/siteConfigurationUsersTemplate.html";
          },
        },
        {
          id: "custom:GanttScheduler",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/ganttScheduler/ganttSchedulerTemplate.html";
          },
        },
        {
          id: "custom:CopyMachineSettings",
          code: function ($scope, actionItem) {
            let typeID = 0;
            if ($scope.$parent && $scope.$parent.formResults) {
              typeID = _.find($scope.$parent.formResults, {
                Name: "TypeID",
              })?.value;
              ID = +_.find($scope.$parent.formResults, { Name: "ID" })?.value;
            }
            $modal.open({
              resolve: {
                ID: function () {
                  return ID;
                },
                typeID: function () {
                  return typeID;
                },
              },
              windowClass: "CopyMachineSettings",
              template:
                '<div copy-machine-settings machine-type-id="typeID" machine-id="ID" close="close" action="actionItem"></div>',
              controller: function ($scope, $modalInstance, ID, typeID) {
                $scope.ID = ID;
                $scope.typeID = typeID;
                $scope.actionItem = actionItem;
                $scope.close = function (data) {
                  $modalInstance.close(data);
                };
              },
            });
          },
        },
        {
          id: "custom:CopyMachineParameter",
          code: function ($scope, actionItem) {
            $modal.open({
              resolve: {
                ID: function () {
                  return $scope.content.ID;
                },
                typeID: function () {
                  return _.find($scope.content.parentScope.formResults, {
                    Name: "MachineType",
                  })?.value;
                },
              },
              windowClass: "CopyMachineParameter",
              template:
                '<div copy-machine-parameters machine-type-id="typeID"  id="ID" close="close"  action="actionItem"></div>',
              controller: function ($scope, $modalInstance, ID, typeID) {
                $scope.ID = ID;
                $scope.typeID = typeID;
                $scope.actionItem = actionItem;
                $scope.close = function (data) {
                  $modalInstance.close(data);
                };
              },
            });
          },
        },
        {
          id: "custom:SplitStopEvent",
          code: function ($scope, actionItem) {
            const parentScope = $scope;
            const startTime = _.find($scope.content.parentScope.formResults, {
              Name: "EventTime",
            })?.value;
            const endTime = _.find($scope.content.parentScope.formResults, {
              Name: "EndTime",
            })?.value;
            if (!startTime || !endTime) {
              notify({
                message: $filter("translate")("STOP_EVENT_NOT_FINISHED"),
                classes: "alert-danger",
                templateUrl: "views/common/notify.html",
              });
              return;
            }
            $modal.open({
              resolve: {
                ID: function () {
                  return $scope.content.ID;
                },
                startTime: function () {
                  return moment(startTime, "YYYY/MM/DD HH:mm:ss");
                },
                endTime: function () {
                  return moment(endTime, "YYYY/MM/DD HH:mm:ss");
                },
              },
              template:
                '<div split-event-retro event-data="eventData" close="close"></div>',
              windowClass: "CopyMachineParameter",
              controller: function (
                $scope,
                $modalInstance,
                ID,
                startTime,
                endTime
              ) {
                $scope.eventData = {
                  id: ID,
                  startTime: startTime,
                  endTime: endTime,
                };
                $scope.close = function (data) {
                  $modalInstance.close(data);
                  if (data) {
                    LeaderMESservice.refreshPage(parentScope, 0, true);
                  }
                };
              },
            });
          },
        },
        {
          id: "custom:StopEvents",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/stopEvents/stopEventsTemplate.html";
          },
        },
        {
          id: "custom:QCDefinition",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/QCDefinition/QCDefinitionTemplate.html";
          },
        },
        {
          id: "custom:JobListCustom",
          code: function ($scope) {
            $scope.templateUrl = "js/components/jobList/jobListTemplate.html";
          },
        },
        {
          id: "custom:JobCustomParameters",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/jobCustomParameters/jobCustomParametersTemplate.html";
          },
        },
        {
          id: "custom:OpAppPermissions",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/tabletScreen/opAppPermissions/opAppPermissionsTemplate.html";
          },
        },
        {
          id: "custom:TabletMainScreen",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/tabletScreen/mainScreenVisibility/mainScreenVisilityTemplate.html";
          },
        },
        {
          id: "custom:TestOrder",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/orderTest/firstStep/firstStepTemplate.html";
          },
        },
        {
          id: "custom:TestDetails",
          code: function ($scope) {
            $scope.objectID = $scope.content.ID;
            $scope.templateUrl =
              "js/components/orderTest/secondStep/secondStepTemplate.html";
          },
        },
        {
          id: "custom:MachineParametersNotifications",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/mobileParametersNotifiactions/mobileParametersNotifiactionsTemplate.html";
          },
        },
        {
          id: "custom:UnScheduledJobs",
          code: function ($scope) {
            const mainMenu = LeaderMESservice.getMainMenu();
            const ganttMenu = _.find(mainMenu, { TopMenuAppPartID: 7608 });
            if (ganttMenu) {
              $scope.content = ganttMenu.subMenu && ganttMenu.subMenu[0];
              commonFunctions.fieldChanges($scope);
              commonFunctions.editableTable(
                $scope,
                $scope.content.SubMenuExtID,
                "ID",
                $scope.changes,
                0,
                $scope.content.SkipSaveOperation
              );
            }
          },
        },
        {
          id: "custom:TestsResults",
          code: function ($scope) {
            googleAnalyticsService.gaPV("QC_SPC");
            $scope.searchMode = 2;
            $scope.templateUrl =
              "views/common/searchResultsCommonTemplate.html";
            // $scope.templateUrl = 'views/custom/search/testResultsTemplate.html';
            $scope.searchTemplateUrl =
              "views/custom/search/testSearchTemplateUrl.html";
            $scope.searchResultsTemplateUrl =
              "views/custom/searchResults/searchTestResultsTemplate.html";
            $scope.subPage = {
              data: {
                request: {},
                subMenu: $scope.content.subMenu,
              },
            };
          },
        },
        {
          id: "custom:KpiCustomization",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/kpiCustomization/kpiCustomizationTemplate.html";
          },
        },
        {
          id: "custom:RulesManage",
          code: function ($scope) {
            $scope.templateUrl = "js/components/rules/rulesTemplate.html";
          },
        },
        {
          id: "custom:TargetsManagement",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/targetsManagement/targetsManagementTemplate.html";
          },
        },
        {
          id: "custom:TasksManagementReact",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/tasksManagementReact/tasksManagementReactTemplate.html";
          },
        },
        {
          id: "custom:ProcessControlDashboard",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/processControlDashboard/processControlDashboardTemplate.html";
          },
        },
        {
          id: "custom:UnitsTargetsManagement",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/quantityTargetsManagement/quantityTargetsManagementTemplate.html";
          },
        },
        {
          id: "custom:SPCConfigurations",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/spcConfigurationReact/spcConfigurationReactTemplate.html";
          },
        },
        {
          id: "custom:ShiftsCalendars",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/siteConfiguration/siteConfigurationSteps/shiftCalendar/siteConfigurationShiftCalendarTemplate.html";
          },
        },
        {
          id: "custom:ProductionLinesDef",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/productionLinesConfig/productionLinesDefTemplate.html";
          },
        },
        {
          id: "custom:tasksManagement",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/tasksManagement/tasksManagementTemplate.html";
            tasksManagementService.tasksManagementCode($scope);
          },
        },
        {
          id: "custom:FilesInterface",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/filesInterface/filesInterfaceTemplate.html";
            filesInterfaceService.filesInterfaceCode($scope);
          },
        },
        {
          id: "custom:ADGroupMapping",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/azureGroupMapping/azureGroupMappingTemplate.html";
          },
        },
        {
          id: "custom:GetCalendarEvent",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/calendarEvent/calendarEventTemplate.html";
          },
        },
        {
          id: "custom:MobileTestOrder",
          code: function ($scope, actionItem) {
            $scope.type = "material";
            $scope.templateUrl =
              "js/components/orderTest/firstStep/firstStepTemplate.html";
            $modal.open({
              resolve: {
                ID: function () {
                  return $scope.content.ID;
                },
              },
              windowClass: "MobileTestOrder",
              template: `
                            <div    ng-if="ID"
                                    class="pull-right"
                                    style="height: 30px;
                                        display: flex;
                                        align-items: center;
                                        padding: 10px;
                                        cursor: pointer;">
                                <img src="images/close.png" ng-click="close()"/>
                            </div>
                            <first-step id="ID" type="'material'" close-modal="close"></first-step>
                        `,
              controller: function ($scope, $modalInstance, ID) {
                $scope.ID = ID;
                $scope.actionItem = actionItem;
                $scope.close = function (data) {
                  $modalInstance.close(data);
                };
              },
            });
          },
        },
        {
          id: "custom:NewCaledarEvent",
          code: function ($scope) {
            calendarPairs = [];
            calendarPairs.push({
              DataType: "num",
              Eq: $scope.content.ID,
              FieldName: "CalendarID",
            });
            $modal.open({
              resolve: {
                parentScope: function () {
                  return $scope;
                },
              },
              template: `
                        <div class="modal-header">
                            <h3 class="modal-title" id="modal-title">{{"CREATE_NEW_EVENT" | translate}}</h3>
                        </div>
                        <div class="modal-content">
                            <calendar-event event-id="eventId" pairs="pairs" form-id="formId" callback="callback"></calendar-event>
                        </div>
                        `,
              controller: function (
                $scope,
                $compile,
                $modalInstance,
                parentScope
              ) {
                $scope.pairs = calendarPairs;
                $scope.callback = function () {
                  LeaderMESservice.refreshPage(parentScope, 0, true);
                  $modalInstance.close();
                };
                $scope.eventId = 0;
                $scope.formId = 101282;
              },
            });
          },
        },
        {
          id: "custom:CopyCalendarEvent",
          code: function ($scope) {
            var eventId = $scope.content.ID;
            $modal.open({
              templateUrl: "js/components/calendar/copyEventModel.html",
              controller: function (
                $scope,
                $compile,
                $modalInstance,
                LeaderMESservice
              ) {
                var copyEventCtrl = this;
                var selectAll = true;
                copyEventCtrl.TargetCalendarID = [];
                LeaderMESservice.customGetAPI("GetCalendars").then(function (
                  response
                ) {
                  copyEventCtrl.calendars = response.Data;
                  copyEventCtrl.calendars.unshift({
                    DisplayEName: $filter("translate")("UN_SELECT_ALL"),
                    DisplayLName: $filter("translate")("UN_SELECT_ALL"),
                    DisplayOrder: -1,
                    ID: -1,
                    UrlTarget: null,
                    Value: null,
                  });
                });

                copyEventCtrl.calendarChange = function () {
                  var selectAllIndex =
                    copyEventCtrl.TargetCalendarID.indexOf(-1);
                  if (selectAllIndex >= 0) {
                    copyEventCtrl.TargetCalendarID = null;
                    $timeout(function () {
                      if (selectAll) {
                        copyEventCtrl.TargetCalendarID = copyEventCtrl.calendars
                          .filter((calendar) => calendar.ID !== -1)
                          .map((calendar) => calendar.ID);
                      } else {
                        copyEventCtrl.TargetCalendarID = [];
                      }
                      selectAll = !selectAll;
                    }, 0);
                  }
                };

                copyEventCtrl.loading = true;
                copyEventCtrl.rtl = LeaderMESservice.isLanguageRTL();
                copyEventCtrl.localLanguage =
                  LeaderMESservice.showLocalLanguage();
                copyEventCtrl.close = function () {
                  $modalInstance.close();
                };
                // eventId,_id
                copyEventCtrl.copyEvent = function () {
                  if (
                    !(
                      copyEventCtrl.TargetCalendarID &&
                      copyEventCtrl.TargetCalendarID.length > 0
                    )
                  ) {
                    return;
                  }
                  LeaderMESservice.customAPI("CalendarEventCopy", {
                    CalendarEventID: eventId,
                    TargetCalendarID: copyEventCtrl.TargetCalendarID,
                  }).then(function (response) {
                    if (response.error !== null) {
                      notify({
                        message:
                          response.error.ErrorCode +
                          " - " +
                          response.error.ErrorDescription,
                        classes: "alert-danger",
                        templateUrl: "views/common/notify.html",
                      });
                    } else {
                      toastr.clear();
                      toastr.success(
                        "",
                        $filter("translate")("SAVED_SUCCESSFULLY")
                      );
                      $modalInstance.close();
                    }
                  });
                };
              },
              controllerAs: "copyEventCtrl",
            });
          },
        },
        {
          id: "custom:reportStopScreenEvent",
          code: function ($scope) {
            var ID = $scope.content.ID;
            var upperScope = $scope;
            var reportStopEventInstance = $modal
              .open({
                templateUrl:
                  "js/components/stopEventSearch/stopEventSearchMachine.html",
                controller: function (
                  $scope,
                  $compile,
                  $modalInstance,
                  LeaderMESservice,
                  $sessionStorage
                ) {
                  var machineStopEventCtrl = this;
                  machineStopEventCtrl.rtl = LeaderMESservice.isLanguageRTL();
                  machineStopEventCtrl.localLanguage =
                    LeaderMESservice.showLocalLanguage();
                  var params =
                    (upperScope &&
                      upperScope.content &&
                      upperScope.content.params) ||
                    {};
                  $scope.machineName = machineStopEventCtrl.localLanguage
                    ? params.MachineLname
                    : params.MachineEName;

                  $scope.rowClicked = function (IDs) {
                    if (actionItem.updateData) {
                      actionItem.updateData();
                    }
                    $modalInstance.close(1);
                  };

                  $scope.searchResultsRequest = {
                    data: {
                      functionCallBack: null,
                      onlyNewTab: true,
                      returnValue: false,
                      openSearchInNewTab: false,
                      removeSelectOption: false,
                      multiSelect: true,
                    },
                    request: {
                      IsUserReport: false,
                      reportID: 850,
                      sfCriteria: [
                        {
                          FieldName: "MachineIdentifier",
                          Eq: ID,
                          DataType: "num",
                        },
                      ],
                    },
                    api: "GetResultSearchFields",
                  };
                  machineStopEventCtrl.close = function () {
                    $modalInstance.close();
                  };
                },
                controllerAs: "machineStopEventCtrl",
              })
              .result.then(function (data) {
                if (data) {
                  //refresh data
                  console.log("refresh data");
                }
              });
          },
        },
        {
          id: "custom:CustomKPIs",
          code: function ($scope) {
            $scope.templateUrl =
              "js/components/customKPIs/customKpiTemplate.html";
          },
        },
      ];

      var customGetCode = function ($scope, SubMenuTargetTYpe, actionItem) {
        var objectCode = _.find(customCode, { id: SubMenuTargetTYpe });
        if (!objectCode) {
          objectCode = _.find(customCode, {
            subMenuAppPartID: SubMenuTargetTYpe,
          });
        }
        if (objectCode) {
          objectCode.code($scope, actionItem);
        } else {
          console.error(`Custom Screen not found ${SubMenuTargetTYpe}`);
        }
      };

      var customGetTemplate = function (SubMenuTargetTYpe) {
        var objectCode = _.find(customCode, { id: SubMenuTargetTYpe });
        if (objectCode.getTemplate) {
          return objectCode.getTemplate();
        }
        return "views/common/customTemplate.html";
      };

      var actionServiceNotification = function (title, toastr, success) {
        if (success == true) {
          toastr.success(title, "Succeeded");
        } else {
          toastr.error(title, "Failed");
        }
      };

      return {
        customGetCode: customGetCode,
        actionServiceNotification: actionServiceNotification,
        customGetTemplate: customGetTemplate,
      };
    }
  );
