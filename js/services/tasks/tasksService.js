angular
  .module("LeaderMESfe")
  .factory("tasksServiceService", function(
    $timeout,
    LeaderMESservice,
    toastr,
    $sessionStorage,
    $filter,
    googleAnalyticsService,
    GLOBAL,
    $modal,
    SweetAlert,
    AuthService
  ) {
    function tasksServiceCode($scope, shiftService) {
      $scope.userDateFormat = AuthService.getUserDateFormat();
      $scope.rtl = LeaderMESservice.isLanguageRTL();
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      $scope.showFilterInsights = false;
      $scope.allDepartments = $scope.content.subMenu.SubMenuExtID == 0 ? true : false;
      $scope.insightFiltersData = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters;
      $scope.rangeOptions = {
        timePicker: true,
        locale: {
          format: $scope.userDateFormat.split(" ")[0],
        },
        ranges: {
          Today: [moment(), moment()],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 14 Days": [moment().subtract(13, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()]
        }
      };

      $scope.machineData.isPie = true;
      $scope.hideClicked = { value: false };
      if ($scope.hideClicked.value) {
        $scope.buttonTitle = "SHOW_THE_TIME_BAR";
      } else {
        $scope.buttonTitle = "HIDE_THE_TIME_BAR";
      }
      $scope.hideClick = function() {
        $scope.hideClicked.value = !$scope.hideClicked.value;
        if ($scope.hideClicked.value) {
          $scope.buttonTitle = "SHOW_THE_TIME_BAR";
        } else {
          $scope.buttonTitle = "HIDE_THE_TIME_BAR";
        }
      };

      $scope.changeShowFilterInsights = function(show) {
        $scope.showFilterInsights = !show;
        insightService.updateShowFilterInsight($scope.showFilterInsights);
      };
      $scope.openTargetInfo = function() {
        window.open(GLOBAL.target, "_blank");
      };

      if ($scope.content.subMenu.allMachines) {
        $scope.machineData.isPie = false;
        $sessionStorage.produtionFloorTab = {
          selectedTab: "newOnline"
        };
      }
      $scope.gaE = function(page_view, event_name) {
        googleAnalyticsService.gaEvent(page_view, event_name);
      };

      $scope.openSelectedTab = function(selectedTab) {
        $scope.tasksServiceTab.selectedTab = selectedTab;
        if (selectedTab == "newOnline") {
          if ($scope.content.subMenu.allMachines) {
            $scope.machineData.isPie = false;
          } else {
            $scope.machineData.isPie = true;
          }
        } else if (selectedTab == "newShift") {
          $scope.machineData.showGoals.value = false;
        } else if (selectedTab == "insights") {
          insightService.updateContainerInsightPage(
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container
          );
          
          insightService.getInsightsFilter($scope.content.subMenu.SubMenuExtID);
        } else if (selectedTab == "factoryInsights") {
          insightService.updateContainerInsightPage(
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container
          );
          
          insightService.getInsightsFilter($scope.content.subMenu.SubMenuExtID);
        }
      };

      $scope.machineData.showGoals = { value: false };
      if ($scope.content.subMenu.targets) {
        $scope.machineData.showGoals.value = true;
        $sessionStorage.produtionFloorTab = {
          selectedTab: "newOnline"
        };
      }

      $scope.allMachines = true;
      $scope.shiftData = shiftService.shiftData;
      $scope.shiftData.allMachinesDisplay = true;
      $scope.insightContainers = insightService.returnContainersInsights();

      $scope.containers = shiftService.containers;
      $scope.disableBtns = false;
      $scope.resetDefault = function(resetPage) {
        shiftService.resetContainerDefault(resetPage);
        $scope.containers = shiftService.containers;
        shiftService.resetDisplayDefault();
        googleAnalyticsService.gaEvent("Department_Shift", "reset");
      };

      $scope.updateSortable = function() {
        $timeout(function() {
          shiftService.updateGraphLines();
        }, 500);
      };

      if (!$sessionStorage.produtionFloorTab) {
        $sessionStorage.produtionFloorTab = {
          selectedTab: !$scope.allDepartments ? "shift" : "newOnline"
        };
      } else {
        if ($scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "online") {
          $sessionStorage.produtionFloorTab.selectedTab = "newOnline";
        } else if (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "newOnline") {
          $sessionStorage.produtionFloorTab.selectedTab = "online";
        } else if ($scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "shift") {
          $sessionStorage.produtionFloorTab.selectedTab = "newShift";
        } else if (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "newShift") {
          $sessionStorage.produtionFloorTab.selectedTab = "shift";
        } else if (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "newTarget") {
          $sessionStorage.produtionFloorTab.selectedTab = "onlineTargets";
        } else if ($scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "onlineTargets") {
          $sessionStorage.produtionFloorTab.selectedTab = "newTarget";
        } else if (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "KPI") {
          $sessionStorage.produtionFloorTab.selectedTab = "KPI";
        } else if (
          !$scope.allDepartments &&
          ($sessionStorage.produtionFloorTab.selectedTab == "insights" || $sessionStorage.produtionFloorTab.selectedTab === "factoryInsights")
        ) {
          $sessionStorage.produtionFloorTab.selectedTab = "insights";
          insightService.updateContainerInsightPage(
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container
          );
          
          insightService.getInsightsFilter($scope.content.subMenu.SubMenuExtID);
        } else if (
          $scope.allDepartments &&
          ($sessionStorage.produtionFloorTab.selectedTab == "factoryInsights" || $sessionStorage.produtionFloorTab.selectedTab == "insights")
        ) {
          $sessionStorage.produtionFloorTab.selectedTab = "factoryInsights";
          insightService.updateContainerInsightPage(
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container
          );
          
          insightService.getInsightsFilter($scope.content.subMenu.SubMenuExtID);
        }
      }

      $scope.refresh = function() {
        var durationObj = shiftService.durationParams();
        if (durationObj) {
          if (_.has(durationObj, "updateData") && !durationObj.updateData) {
            delete durationObj.updateData;
            if (!durationObj.StartTime) {
              durationObj = null;
            }
          }
        }
        shiftService.updateData($scope.content.subMenu.SubMenuExtID, durationObj, true);
        googleAnalyticsService.gaEvent("Department_Shift", "refresh");
      };
      // $scope.resetClick = function() {
      //   $scope.insightPageCustom = undefined;
      //   $scope.updateData(4);
      //   if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
      //     insightService.updateContainerInsightPage($scope.structures[0].template);
      //   } else {
      //     insightService.updateContainerInsightPage();
      //   }
      //   $scope.structures = _.map($scope.structures, function(temp) {
      //     if (temp.name == "PE_ANALYSIS") {
      //       temp.show = true;
      //     } else {
      //       temp.show = false;
      //     }
      //     return temp;
      //   });
      //   googleAnalyticsService.gaEvent("Department_Insights", "reset");
      // };

      $scope.clearClick = function() {
        if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
          insightService.updateContainerInsightPage();
        } else {
          insightService.updateContainerInsightPage();
        }

        $scope.structures = _.map($scope.structures, function(temp) {
          temp.show = false;
          return temp;
        });
        googleAnalyticsService.gaEvent("Department_Insights", "clear");
      };
      $scope.openObjectDescription = function() {
        if ($scope.content.subMenu.SubMenuObjectInformationLink) {
          var objectMenu = LeaderMESservice.getTabsByID($scope.content.subMenu.SubMenuObjectInformationLink);
          if (objectMenu) {
            return window.open(objectMenu.TopMenuObjectInformation, "_blank");
          }
        } else {
          return window.open($scope.content.subMenu.SubMenuObjectInformation, "_blank");
        }
      };
      $scope.sortableOptions = {
        update: function(e, ui) {
          googleAnalyticsService.gaEvent("Department_Shift", "Change_display_order");
        }
      };

      $scope.openDatePicker = function() {
        var modelScope = $scope;

        $modal
          .open({
            windowClass: "dashboard-period-dropdown",
            scope: modelScope,
            templateUrl: "views/common/datepickerRange.html",
            controller: function($scope, $modalInstance) {
              $scope.today = new Date();
              $scope.yesterday = new Date();
              $scope.yesterday.setDate($scope.yesterday.getDate() - 1);
              $scope.dtStart = $scope.yesterday;
              $scope.dtEnd = $scope.today;

              var d = new Date();
              $scope.minDate = d.setMonth(d.getMonth() - 2);
              $scope.errorCompare = false;

              $scope.checkErrors = function() {
                $scope.errorCompare = false;
                if (Date.parse($scope.dtStart) > Date.parse($scope.dtEnd)) {
                  //end is less than start
                  $scope.errorCompare = true;
                }
              };

              $scope.updateValue = function(selectedDate, isStart) {
                if (typeof selectedDate === "string" && selectedDate != "" && selectedDate != null) {
                  selectedDate = moment(selectedDate, "DD/MM/YYYY HH:mm:ss");
                }
                if (!selectedDate) return;
                if (selectedDate.toDate){
                    if (isStart) {
                        $scope.dtStart = selectedDate.toDate();
                    } else {
                        $scope.dtEnd = selectedDate.toDate();
                    }
                }
                $scope.checkErrors();
              };
              $scope.updateDate = function() {
                $scope.errorCompare = false;
                if (Date.parse($scope.dtStart) <= Date.parse($scope.dtEnd)) {
                  // user has chosen range date and clicked on Get Data
                  $scope.updateData(2, $scope.dtStart, $scope.dtEnd);
                  $scope.closeModal();
                } else {
                  //end is less than start
                  $scope.errorCompare = true;
                }
              };
              $scope.closeModal = function() {
                $modalInstance.close();
              };
            },
            controllerAs: "datepickerCtrl"
          })
          .result.then(function() {});
      };
      $scope.toggleMachines = function() {
        var changed = false;
        $scope.shiftData.Machines = _.map($scope.shiftData.Machines, function(machine) {
          if ($scope.shiftData.machinesDisplay[machine.machineID] != $scope.shiftData.allMachinesDisplay) {
            changed = true;
          }
          $scope.shiftData.machinesDisplay[machine.machineID] = $scope.shiftData.allMachinesDisplay;
          return machine;
        });
        if (changed) {
          $timeout(function() {
            shiftService.displayUpdateDefferd.notify();
          });
        }
      };

      $scope.currentTemplate = { hasTemplate: false, name: "" };
      var upperScope = $scope;

      $scope.editTemplate = function(mode) {
        $modal
          .open({
            windowClass: "editTemplatesModal",
            template:
              '<templates-directive has-template="template.hasTemplate" template-name="template.name" mode="mode" dashboard-type="dashboardType"' +
              ' load-template="loadTemplate" canvas-class="canvasClass"' +
              ' containers="containers" machines-display="machinesDisplay" close-modal="closeModal"></templates-directive>',
            controller: function($scope, $modalInstance, shiftService) {
              $scope.template = upperScope.currentTemplate;
              $scope.mode = mode;
              $scope.containers = shiftService.containers;
              $scope.machinesDisplay = shiftService.shiftData.machinesDisplay;
              $scope.canvasClass = ".shift-container";

              if ($sessionStorage.produtionFloorTab.selectedTab != "insights") {
                $scope.dashboardType = 1;
                $scope.loadTemplate = shiftService.loadNewTemplate;
              } else {
                $scope.dashboardType = 3;
                $scope.loadTemplate = insightService.updateContainerInsightPage;
              }

              $scope.closeModal = function() {
                $modalInstance.close();
              };
            }
          })
          .result.then(function() {
            init();
          });
      };

      $scope.updateMachineDisplay = function(event, machineId) {
        $scope.shiftData.machinesDisplay[machineId] = !$scope.shiftData.machinesDisplay[machineId];
        if (event) {
          event.stopPropagation();
        }
        $timeout(function() {
          shiftService.displayUpdateDefferd.notify();
        });
      };

      shiftService.displayUpdateDefferd.promise.then(null, null, function() {
        shiftService.calcEvents();
        googleAnalyticsService.gaEvent("Department_Shift", "Choosing_machines");
      });

      $scope.updateClicked = function() {
        if ($scope.tasksServiceTab.selectedTab == "online") {
          $scope.gaE("Department_Online", "Refresh");
        }
        if ($scope.tasksServiceTab.selectedTab == "newShift") {
          $scope.gaE("Factory_Shift", "Refresh");
        }
        if ($scope.tasksServiceTab.selectedTab == "factoryInsights") {
          $scope.gaE("Factory_Insight", "Refresh");
        }
        if ($scope.tasksServiceTab.selectedTab == "newTarget") {
          $scope.gaE("Factory_Target", "Refresh");
        } else if ($scope.tasksServiceTab.selectedTab == "onlineTargets") {
          $scope.gaE("All_targets", "Refresh");
        } else if ($scope.tasksServiceTab.selectedTab == "newOnline" && $scope.tasksServiceData.SubMenuAppPartID == -2) {
          $scope.gaE("Factory_Target", "Refresh");
        } else if ($scope.tasksServiceTab.selectedTab == "newOnline" && $scope.tasksServiceData.SubMenuAppPartID == -1) {
          $scope.gaE("All_machine", "Refresh");
        } else if ($scope.tasksServiceTab.selectedTab == "newOnline" && $scope.tasksServiceData.SubMenuAppPartID == 540) {
          $scope.gaE("Factory_Online", "Refresh");
        }
      };

      var init = function() {
        $scope.showMachines = true;
        $scope.tasksServiceData = $scope.content.subMenu;
        $scope.tasksServiceData.allMachinesFullScreen = { value: false };

        if ($sessionStorage.produtionFloorTab.selectedTab != "insights") {
          $scope.dashboardType = 1;
          $scope.loadTemplate = shiftService.loadNewTemplate;
        } else {
          $scope.dashboardType = 3;
          $scope.loadTemplate = insightService.updateContainerInsightPage;
        }
        LeaderMESservice.customAPI("GetStructureThumbnails", {
          DashboardType: $scope.dashboardType,
          DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID

        }).then(function(res) {
          $scope.templates = res.TemplateData;
          $scope.doneLoading = true;
        });
      };

      LeaderMESservice.GetAllGroupsAndUsers().then(function(response) {
        $scope.usersData = response.Users;
        $scope.groupsData = response.Groups;
      });

      $scope.chosenUsers = [];

      $scope.copyToUser = function(template, groups, users) {
        if (users.length > 0) {
          LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUser", {
            SourceTemplateID: template.ID,
            Users: users,
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              IsActive: true
            }
          }).then(function(res) {
            if (res.error) {
              notify({
                message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
                classes: "alert-danger",
                templateUrl: "views/common/notify.html"
              });
            } else if (users.length > 0 || groups.length > 0) {
              toastr.clear();
              toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            }
            $scope.popupIndex = -1;
            template.popup = false;
          });
        }

        if (groups.length > 0) {
          LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUserGroup", {
            SourceGroupID: template.ID,
            UserGroups: groups,
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              IsActive: true
            }
          }).then(function(res) {
            if (res.error) {
              notify({
                message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
                classes: "alert-danger",
                templateUrl: "views/common/notify.html"
              });
            } else if ((!users || users.length <= 0) && groups.length > 0) {
              toastr.clear();
              toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            }
            $scope.popupIndex = -1;
            template.popup = false;
          });
        }
      };

      $scope.deleteDashboard = function(template) {
        SweetAlert.swal(
          {
            title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO") + " delete the dashboard?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#D0D0D0",
            confirmButtonText: $filter("translate")("YES"),
            cancelButtonText: $filter("translate")("NO"),
            closeOnConfirm: true,
            closeOnCancel: true,
            animation: "false",
            customClass: ""
            // swalRTL
          },
          function(isConfirm) {
            if (isConfirm) {
              $scope.deleteTemplate(template);
            }
          }
        );
      };

      $scope.deleteTemplate = function(template) {
        LeaderMESservice.customAPI("DeleteTemplate", {
          ID: template.ID
        }).then(function(res) {
          LeaderMESservice.customAPI("GetStructureThumbnails", {
            DashboardType: $scope.dashboardType,
            DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID

          }).then(function(res) {
            upperScope.templates = res.TemplateData;
          });
        });
      };

      $scope.getTemplateByStructID = function(template, eventName) {
        LeaderMESservice.customAPI("GetDashboardTemplateStructureByID", {
          StructureID: template.ID
        }).then(function(res) {
          ///4
          var fullTemplate = _.find(res.TemplateData, { ID: template.ID });
          if (fullTemplate) {
            var structure = JSON.parse(fullTemplate.Structure);
            if (!structure.containers && structure.data) {
              // backward computability
              structure = {
                containers: {
                  data: structure.data,
                  dataInsightsPage: structure.dataInsightsPage,
                  dataInsightsFactoryPage: structure.dataInsightsFactoryPage
                }
              };
            }
            upperScope.loadTemplate(structure);

            upperScope.templateName = template.EName;
            upperScope.hasTemplate = true;

            $scope.structures = _.map($scope.structures, function(temp) {
              if (temp.name == eventName) {
                temp.show = true;
              } else {
                temp.show = false;
              }
              return temp;
            });

            $timeout(function() {
              shiftService.displayUpdateDefferd.notify();
            });
          }
        });
      };

      $scope.refreshDataCallback = {};

      $scope.templatesMoveToLeft = function() {
        document.querySelector(".savedTemplates .templatesScroll").scrollLeft -= 150;
        // if (document.querySelector('.savedTemplates .templatesScroll').scrollLeft < 0){
        //   document.querySelector('.savedTemplates .templatesScroll').scrollLeft = 0;
        // }
      };

      $scope.templatesMoveToRight = function() {
        document.querySelector(".savedTemplates .templatesScroll").scrollLeft += 150;
      };

      init();
      if ($scope.shiftData.machineID) {
        $scope.shiftData.machineID = null;
        // shiftService.updateCompare('none');
      }

      $scope.pinClicked = function() {
        if ($scope.containers.headerPinned && $scope.containers.headerPinned.enabled) {
          $timeout(function() {
            $scope.containers.headerPinned.enabled = !$scope.containers.headerPinned.enabled;
          });
        } else {
          $scope.containers.headerPinned = {
            enabled: true
          };
        }
      };

      $scope.$on("$destroy", function() {
        // console.log("$destroy floor");
        $scope.openSelectedTab("newOnline");
      });
    }

    return {
      tasksServiceCode: tasksServiceCode
    };
  });
