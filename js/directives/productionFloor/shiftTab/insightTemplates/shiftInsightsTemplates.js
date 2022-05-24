var shiftInsightsTemplatesDirective = function () {
  var controller = function ($scope, shiftService, insightService, LeaderMESservice, $timeout, googleAnalyticsService, SweetAlert, $filter, $sessionStorage, $localStorage, toastr, $modal, $http, configuration, notify, $rootScope, AuthService) {
    $scope.shiftData = shiftService.shiftData;
    var shiftInsightsTemplatesCtrl = this;
    $scope.userDateFormat = AuthService.getUserDateFormat();
    $scope.showDashMenu = false;
    $scope.loadTemplate = insightService.updateContainerInsightPage;
    $scope.showInsightsAbsolute = false;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.showCopyModels = false;
    $scope.showTemplatesMenu = true;
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.navModelOpen = insightService.navModelOpen;
    LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
      $scope.usersData = response.Users;
      $scope.groupsData = response.Groups;
    });

    if (!$localStorage.shiftTemplateID) {
      $localStorage.shiftTemplateID = {};
    }

    $scope.shiftsNamesFilter = {};

    $scope.chosenUsers = [];

    $scope.customShifts = {};

    if (!$scope.shiftData.trendsSettings) {
      $scope.shiftData.trendsSettings = {
        trend: "8",
        trendDemo: "8",
        trendC: "8",
        compareWith: "7",
        compareWithDemo: "7",
        compareWithC: "7",
      };
    }

    $scope.containers = shiftService.containers;

    $scope.hideTemplateMenu = (withoutTemplate) => {
      try {
        $scope.templates.map((template) => {
          if (withoutTemplate && template.ID == withoutTemplate.ID) {
            return template;
          }
          template.showMenu = false;
          return template;
        });
      } catch (error) {
        
      }
    };

    $scope.hideTemplateMenuStructures = (withoutTemplate) => {
        $scope.structures.map((template) => {
          if (withoutTemplate && template.ID == withoutTemplate.ID) {
            return template;
          }
          template.defaultTemplateOptions = false;
          return template;
        });
    };

    $scope.shareTemplateModel = (template) => {
        $modal.open({
          resolve: {
            parentScope: function () {
                return $scope;
            }
        },
          templateUrl: 'js/components/shareTemplateModel/shareTemplateModel.html',
          windowClass: "edit-recurring-event-update",
          controller: function ($scope, $modalInstance, parentScope) {
            $scope.usersData = parentScope.usersData
            $scope.template = template
            $scope.copyToUser = parentScope.copyToUser
            $scope.groupsData = parentScope.groupsData
            $scope.copyToUser = parentScope.copyToUser
            $scope.close = function () {
                $modalInstance.close();
            };
          },
        })
    
    };

    $scope.changeIsActive = function(structure){
      structure.IsActive = !structure.IsActive
      $scope.updateContainer(structure,1)
    }

    $scope.updateSortable = function () {
      $timeout(function () {
        shiftService.saveShiftContainer();
        shiftService.updateGraphLines();
      }, 500);
    };

    $scope.createNewTemplate = function () {
      SweetAlert.swal(
        {
          title: $filter("translate")("YOU_ARE_ABOUT_TO_CLEAR_THE_DASHBOARD_ARE_YOU_SURE_YOU_WANT_TO_CONTINUE"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#D0D0D0",
          confirmButtonText: $filter("translate")("YES"),
          cancelButtonText: $filter("translate")("NO"),
          closeOnConfirm: true,
          closeOnCancel: true,
          animation: "false",
          customClass: "",
          // swalRTL
        },
        function (isConfirm) {
            if (isConfirm) {
            $scope.resetDefaultShift("Shift");
            if ($localStorage.shiftTemplateID && $localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
              $localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value = {};
            }
            $scope.shiftData.chosenTemplate = { templateName: "", isUserTemplate: false };
            $scope.containers.data.map((graph) => {
              graph.options.display = false;
              graph.isFiltered = false;

              if (graph.localMachines) {
                graph.localMachines.map((local) => {
                  local.value = true;
                  return local;
                });
              }
              return graph;
            });
            }
          }
        );
      };

    $scope.resetDefaultShift = function (resetPage) {
      shiftService.resetContainerDefault(resetPage);
      $scope.containers = shiftService.containers;
      // shiftService.resetDisplayDefault();
      googleAnalyticsService.gaEvent("Department_Shift", "reset");
      shiftService.loadNewTemplate({
        containers: angular.copy($scope.containers),
      });
    };

    $scope.resetTrendsSettings = () => {
      $scope.shiftData.trendsSettings.trendDemo = $scope.shiftData.trendsSettings.trend;
      $scope.shiftData.trendsSettings.compareWithDemo = $scope.shiftData.trendsSettings.compareWith;
    };

    $scope.resetTrendElementSettings = (trendIndex) => {
      $scope.trends[trendIndex].viewDemo = $scope.trends[trendIndex].view;
      $scope.trends[trendIndex].typeDemo = $scope.trends[trendIndex].type;
    };

    $scope.applyTrendsSettings = () => {
      $scope.shiftData.trendsSettings.trend = $scope.shiftData.trendsSettings.trendDemo;
      $scope.shiftData.trendsSettings.trendC = $scope.shiftData.trendsSettings.trendDemo;
      $scope.shiftData.trendsSettings.compareWith = $scope.shiftData.trendsSettings.compareWithDemo;
      $scope.shiftData.trendsSettings.compareWithC = $scope.shiftData.trendsSettings.compareWithDemo;
    };

    $scope.applyShiftTrendElement = (trendIndex) => {
      $scope.trends[trendIndex].view = $scope.trends[trendIndex].viewDemo;
      $scope.trends[trendIndex].viewC = $scope.trends[trendIndex].viewDemo;
      $scope.trends[trendIndex].type = $scope.trends[trendIndex].typeDemo;
      $scope.trends[trendIndex].typeC = $scope.trends[trendIndex].typeDemo;
    };

    $scope.trends = [
      {
        name: "unreportedStops",
        EName: "UNREPORTED_STOPS",
        visible: false,
        view: "Quantity",
        viewDemo: "Quantity",
        viewC: "Quantity",
        type: "781",
        typeDemo: "781",
        typeC: "781",
      },
    ];

    $scope.templatesMoveToLeft = function () {
      document.querySelector(".shiftInsightTemplates").scrollLeft -= 150;
    };

    $scope.templatesMoveToRight = function () {
      document.querySelector(".shiftInsightTemplates").scrollLeft += 150;
    };

    $scope.editTemplate = function (mode) {
      $modal
        .open({
          windowClass: "editTemplatesModal",
          template: '<templates-directive has-template="template.hasTemplate" template-name="template.name" mode="mode" dashboard-type="dashboardType"' + ' load-template="loadTemplate" canvas-class="canvasClass"' + ' insights-container="insightsContainer" machines-display="machinesDisplay" close-modal="closeModal" allow-edit="allowEdit"  ></templates-directive>',
          controller: function ($scope, $modalInstance, shiftService) {
            $scope.template = upperScope.currentTemplate;
            $scope.allowEdit = upperScope.allowEdit;
            $scope.mode = mode;
            $scope.insightsContainer = shiftService.containers.data;
            $scope.machinesDisplay = shiftService.shiftData.machinesDisplay;
            $scope.canvasClass = ".shift-container";
            $scope.dashboardType = 4;
            $scope.loadTemplate = shiftService.loadNewTemplate;

            $scope.closeModal = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function () {
          if (mode == "save") {
            $scope.getStructureThumbnails();
          }
        });
    };
    $scope.$on("closeAboslute", function () {
      $scope.showInsightsAbsolute = false;
    });
    $scope.deleteDashboard = function (template, type) {
      SweetAlert.swal(
        {
          title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_TEMPLATE"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#D0D0D0",
          confirmButtonText: $filter("translate")("YES"),
          cancelButtonText: $filter("translate")("NO"),
          closeOnConfirm: true,
          closeOnCancel: true,
          animation: "false",
          customClass: "",
          // swalRTL
        },
        function (isConfirm) {
          if (isConfirm) {
            if(type == 1){
              $scope.deleteDefaultTemplate(template)
            }
            else
            {
              $scope.deleteTemplate(template);
            }
          }
        }
      );
    };

    $scope.sendTemplate = function (template, eventName) {
      $scope.structures = _.map($scope.structures, function (temp) {
        if (temp.name == eventName) {
          temp.show = true;
        } else {
          temp.show = false;
        }
        return temp;
      });

      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type = 1;
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value = eventName;
      insightService.updateContainerInsightPage(template);
      googleAnalyticsService.gaEvent("Department_Insights", "STORIES_".concat(eventName));
    };

    $scope.copyModalPosition = function (event) {
      $scope.localLanguage ? ($scope.copyModalX = event.clientX - 20) : ($scope.copyModalX = event.clientX - 434);
      $scope.localLanguage ? ($scope.copyModalY = event.clientY + 19) : ($scope.copyModalY = event.clientY + 15);
    };

    $scope.getStructureThumbnails = function () {
      LeaderMESservice.customAPI("GetStructureThumbnails", {
        DashboardType: 4,
        DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
      }).then(function (res) {
        $scope.templates = res.TemplateData;
        $scope.structures = res.DefaultTemplateData
        $scope.allowEdit = res.AllowEdit;
        $scope.doneLoading = true;
      });
    };

    $scope.deleteDefaultTemplate = function (template) {
      LeaderMESservice.customAPI("DeleteDefaultTemplate", {
        ID: template.ID,
      }).then(function () {
        $scope.getStructureThumbnails();
      });
    };

    $scope.deleteTemplate = function (template) {
      LeaderMESservice.customAPI("DeleteTemplate", {
        ID: template.ID,
      }).then(function () {
        $scope.getStructureThumbnails();
      });
    };

    $scope.copyToUser = function (template, groups, users) {
      if (users.length > 0) {
      var sendObject = {
          SourceTemplateID: template.ID,
          Users: users,
          Template: {
            ID: template.ID,
            Type: template.Type,
            LName: template.LName,
            EName: template.EName,
            IsActive: true,
          },
        }
        if(template?.DepartmentID != 0 )
        {
          sendObject.Template.DepartmentID = template.DepartmentID
        }
        LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUser", sendObject).then(function (res) {
          if (res.error) {
            notify({
              message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
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
          SourceTemplateID: template.ID,
          UserGroups: groups,
          Template: {
            ID: template.ID,
            Type: template.Type,
            LName: template.LName,
            EName: template.EName,
            IsActive: true,
          },
        }).then(function (res) {
          if (res.error) {
            notify({
              message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
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

    $scope.checkChosenContainer = function () {
      _.forEach($scope.structures, function (temp) {
        temp.show = false;
      });
      $scope.machineData.selectedTemplteIndex = -1;
      var found = _.findIndex($scope.templates, {
        ID: $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value,
      });
      if (found > -1) {
        $scope.machineData.selectedTemplteIndex = found;
      } else {
        found = _.findIndex($scope.structures, {
          ID: $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value,
        });
        if (found > -1) {
          $scope.structures[found].show = true;
        }
      }
    };

    $scope.changeNavModelOpen = function (template) {
      template.popup = !template.popup;
      $scope.showCopyModels = template.popup;
    };

    var upperScope = $scope;

    $scope.settings = { isSavingTemplate: false };

    $scope.updateContainer = function (template,type) {
        if ($scope.settings.isSavingTemplate == true) {
          return;
        }
        
        $scope.settings.isSavingTemplate = true;
        var promise;
        if(type == 1)
        {
          promise = LeaderMESservice.customAPI("SaveDefaultDashboardTemplateStructure", {
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              Structure:
                $scope.dashboardType == 1 || $scope.dashboardType == 4
                  ? JSON.stringify({
                      shiftInsights: shiftService.containers,
                    })
                  : JSON.stringify({
                      insightsContainer: $scope.insightsContainer,
                      shiftInsights: shiftService.containers,
                      shiftInsightComponents: $sessionStorage.shiftInsightComponents,
                    }),
              IsDefaultStructure: template.IsDefaultStructure ? true :false,
              IsActive: template.IsActive,
            },
            UserGroups:[template.GroupID]
          })
        }
        else{
          promise = LeaderMESservice.customAPI("SaveDashboardTemplateStructure", {
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              Structure:
                $scope.dashboardType == 1 || $scope.dashboardType == 4
                  ? JSON.stringify({
                      shiftInsights: shiftService.containers,
                    })
                  : JSON.stringify({
                      insightsContainer: $scope.insightsContainer,
                      shiftInsights: shiftService.containers,
                      shiftInsightComponents: $sessionStorage.shiftInsightComponents,
                    }),
              IsDefaultStructure: true,
              IsActive: true,
              DepartmentID: template.DepartmentID,
            },
          })
        }
        promise.then(function () {
          notify({
            message: $filter("translate")("SAVED_SUCCESSFULLY"),
            classes: "alert-success",
            templateUrl: "views/common/notify.html",
          });
          $scope.hideTemplateMenu();
          $scope.settings.isSavingTemplate = false;
          if(type != 1){
            $scope.getTemplateByStructID(template,type);
          }
        });
    };

    $scope.getTemplateByStructID = function (template,type) {
      var sendPromise
      if (!$localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
        $localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
      }
      $localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type = type;
      $localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value = template.ID;
      if($localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type !== 1){
         sendPromise = LeaderMESservice.customAPI("GetDashboardTemplateStructureByID", {
          StructureID: template.ID,
          DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
        })
      } else {
      // check if department insights or factory insights and send the last saved template 
        sendPromise =  LeaderMESservice.customAPI("GetStructureThumbnails", {
          DashboardType: 4,
          DepartmentID:  $sessionStorage.stateParams.subMenu.SubMenuExtID
        })
      }
      sendPromise.then(function (res) {
        var fullTemplate = _.find($localStorage.shiftTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type !== 1 ? res.TemplateData :res.DefaultTemplateData, { ID: template.ID });
        if (fullTemplate) {
          var structure = JSON.parse(fullTemplate.Structure)["shiftInsights"];
          if (!$scope.shiftData.chosenTemplate) {
            $scope.shiftData.chosenTemplate = { ID: "", isUserTemplate: true };
          }
          $scope.shiftData.chosenTemplate.isUserTemplate = true;
          $scope.shiftData.chosenTemplate.ID = template.ID;
          $scope.shiftData.isLoadingTemplate = true;
          shiftService.loadNewTemplate({
            containers: angular.copy(structure),
          });
          $scope.shiftData.isLoadingTemplate = false;
          $scope.updateSortable();
        }
        })
    };

    // $scope.loadStructures = function () {
    //   $scope.loaded = true;
    //   $timeout(function () {
    //     $scope.translateCalculate = ($scope.rtl ? -1 : 1) * LeaderMESservice.convertPxToVW($(".more-options").width());
    //   }, 150);
    // };

    $scope.openStructure = function (structure) {
      
      if (structure.name == "DEFAULT") {
        structure.containers.data.map((graph) => {
          graph.isFiltered = false;
          return graph;
        });
      }
      let structureCopy = angular.copy(structure.Structure);
      shiftService.loadNewTemplate({ containers: structureCopy.containers });
      shiftService.getShiftInsightTitles(structure.containers?.data, "shiftInsightGraph");
      if (!$scope.shiftData.chosenTemplate) {
        $scope.shiftData.chosenTemplate = { ID: "", isUserTemplate: false };
      }
      $scope.shiftData.chosenTemplate.isUserTemplate = false;
      $scope.shiftData.chosenTemplate.ID = structure.ID;
    };

    $scope.structures = [];
    // configuration.getSpecific("shiftDashboard", "stories").then(function (stories) {
    //   let promiseArray = [];
    //   stories.forEach(function (storyName) {
    //     promiseArray.push($http.get(`templates/${storyName}.json`));
    //   });
    //   Promise.all(promiseArray).then(function (dataList) {
    //     dataList.forEach(function (data) {
    //       $scope.structures.push(data.data);
    //     });
    //   });
    // });

    $scope.$watch("navModelOpen.value", function () {
      if ($scope.showCopyModels && $scope.navModelOpen.value) {
        $scope.templates = _.map($scope.templates, function (template) {
          template.popup = false;
          return template;
        });
      }
    });

    $scope.$watchGroup(
      ["templates", "structures"],
      function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.initWrapper();
        }
      },
      true
    );

    $scope.initWrapper = function () {
      LeaderMESservice.customAPI("GetDepartmentLastShiftsGeneralInformation", {
        DepartmentID: shiftService.shiftData.DepartmentID,
        LastDays: 7,
      }).then(function (res) {
        shiftService.shiftData.ShiftsLast7Days = res.ResponseDictionaryDT.Shifts;
        angular.forEach(res.ResponseDictionaryDT.Shifts, (shift) => {
          if (!$scope.customShifts[shift.monthOfShift]) {
            $scope.customShifts[shift.monthOfShift] = {};
          }
          if (!$scope.customShifts[shift.monthOfShift][shift.dayOfShift]) {
            $scope.customShifts[shift.monthOfShift][shift.dayOfShift] = {};
          }
          $scope.customShifts[shift.monthOfShift][shift.dayOfShift][shift.ShiftName] = {
            name: shift.ShiftName,
            startTime: shift.StartTime,
            endTime: shift.EndTime,
            ID: shift.ID,
          };
        });
        $scope.customShiftArr = [];
        $scope.customFullShiftArr = [];
        $scope.thisDayShifts = [];
        Object.keys($scope.customShifts)
          .sort()
          .forEach((month) => {
            Object.keys($scope.customShifts[month])
              .sort((a, b) => Number(a.day) - Number(b.day))
              .forEach((day) => {
                if (day != new Date().getDate()) {
                  $scope.customShiftArr.push({
                    shifts: Object.values($scope.customShifts[month][day]).sort((a, b) => a.name.substring(a.name.indexOf("-") + 1) - b.name.substring(b.name.indexOf("-") + 1)),
                    day: day,
                    month: month,
                    monthName: monthNumToName[Number(month) - 1],
                  });
                }
                $scope.customFullShiftArr.push({
                  shifts: Object.values($scope.customShifts[month][day]),
                  day: day,
                  month: month,
                  monthName: monthNumToName[Number(month) - 1],
                });
              });
          });

        $scope.customShiftArr = $scope.customShiftArr.sort((a, b) => Number(a.day) - Number(b.day)).sort((a, b) => Number(a.month) - Number(b.month));
        $scope.customFullShiftArr = $scope.customFullShiftArr.sort((a, b) => Number(a.day) - Number(b.day)).sort((a, b) => Number(a.month) - Number(b.month));

        if ($scope.customShiftArr.length > 7) {
          $scope.customShiftArr.shift();
        }
        let lastShiftName;
        let lastShiftDate;
        let lastShiftDateO;
        let thisShiftName;
        let thisShiftDate;
        let thisShiftDateO;
        let copyShiftsArr = angular
          .copy($scope.customFullShiftArr)
          .sort((a, b) => Number(a.day) - Number(b.day))
          .sort((a, b) => Number(a.month) - Number(b.month));
        thisShiftName = shiftService.shiftData.currentShiftInfo.ShiftName;
        thisShiftDateO = shiftService.shiftData.currentShiftInfo.StartTime;
        thisShiftDate = moment(thisShiftDateO, "DD/MM/YYYY").format($scope.userDateFormat?.split(" ")[0]);
        let thisShiftSplit = thisShiftDateO.split("/");
        let thisShiftDay = thisShiftSplit[0];
        let thisShiftMonth = thisShiftSplit[1];
        let thisShiftYear = thisShiftSplit[2].split(" ")[0];
        let thisShiftRight = thisShiftDateO.split(" ")[1].split(":");
        let lastDayShifts = copyShiftsArr[copyShiftsArr.length - 1].shifts;
        if (lastDayShifts.length < 2 && lastDayShifts[0].name != thisShiftName) {
          lastShiftName = lastDayShifts[0].name;
          lastShiftDate = moment(lastDayShifts[0].startTime).format($scope.userDateFormat.split(" ")[0]);
          lastShiftDateO = lastDayShifts[0].startTime;
        } else if (lastDayShifts.length < 2 && lastDayShifts[0].name == thisShiftName) {
          let preLastLength = copyShiftsArr[copyShiftsArr.length - 2].shifts.length;
          lastShiftName = copyShiftsArr[copyShiftsArr.length - 2].shifts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[preLastLength - 1].name;
          lastShiftDate = moment(copyShiftsArr[copyShiftsArr.length - 2].shifts[preLastLength - 1].startTime).format($scope.userDateFormat.split(" ")[0]);
          lastShiftDateO = copyShiftsArr[copyShiftsArr.length - 2].shifts[preLastLength - 1].startTime;
        } else if (lastDayShifts.length > 1) {
          let preLastShiftBlock = copyShiftsArr[copyShiftsArr.length - 1].shifts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          if (preLastShiftBlock[preLastShiftBlock.length - 1].name == thisShiftName) {
            lastShiftName = preLastShiftBlock[preLastShiftBlock.length - 2].name;
            lastShiftDate = moment(preLastShiftBlock[preLastShiftBlock.length - 2].startTime).format($scope.userDateFormat.split(" ")[0]);
            lastShiftDateO = preLastShiftBlock[preLastShiftBlock.length - 2].startTime;
          } else {
            lastShiftName = preLastShiftBlock[preLastShiftBlock.length - 1].name;
            lastShiftDate = moment(preLastShiftBlock[preLastShiftBlock.length - 1].startTime).format($scope.userDateFormat.split(" ")[0]);
            lastShiftDateO = preLastShiftBlock[preLastShiftBlock.length - 1].startTime;
          }
        }
        LeaderMESservice.customAPI("GetDepartmentLastShiftsGeneralInformation", {
          DepartmentID: shiftService.shiftData.DepartmentID,
          LastDays: 1,
        }).then(function (res) {          
          $scope.last24Shifts = res.ResponseDictionaryDT.Shifts.filter((shift) => {
            return Math.round(new Date(shift.StartTime).getTime() / 1000) > Math.round(new Date(thisShiftYear, thisShiftMonth - 1, thisShiftDay, thisShiftRight[0], thisShiftRight[1], thisShiftRight[2]).getTime() / 1000) - 24 * 3600 - 600;
          }).sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));
          shiftService.shiftData.Last24HoursFullName = $scope.last24Shifts[0].ShiftName + " " + moment($scope.last24Shifts[0].StartTime).format($scope.userDateFormat.split(" ")[0]) + "- " + thisShiftName + " " + thisShiftDate;
          shiftService.shiftData.firstShiftIn24Hours = {
            StartTime: $scope.last24Shifts[0].StartTime,
            ShiftName: $scope.last24Shifts[0].ShiftName,
          };
          shiftService.shiftData.lastShiftIn24Hours = { StartTime: shiftService.shiftData.currentShiftInfo.StartTime, thisShiftName };
        });

        //i use this to get the first shift of this day
        var thisDay = shiftService.shiftData.ShiftsLast7Days.length > 0 ? shiftService.shiftData.ShiftsLast7Days[0].dayOfShift : null;
        if(thisDay){          
          shiftService.shiftData.firstShiftToday = shiftService.shiftData.ShiftsLast7Days.slice().find(x=> x.dayOfShift == thisDay);
          let startTimeFormat = '';
          if (shiftService.shiftData &&
              shiftService.shiftData.firstShiftToday && 
              shiftService.shiftData.firstShiftToday.StartTime) {
                startTimeFormat = moment(shiftService.shiftData.firstShiftToday.StartTime, 'YYYY-MM-DDTHH:mm:ss').format($scope.userDateFormat.split(" ")[0]);
          }

          shiftService.shiftData.firstShiftTodayLabel = 
            shiftService.shiftData.firstShiftToday.ShiftName + 
            " " +
            startTimeFormat +
             " - " +
            thisShiftName +
             " " + 
             thisShiftDate;
        }

        
        const today = (new Date()).setHours(0,0,0,0)
        const yesterday = new Date(today)          
        yesterday.setDate(yesterday.getDate() - 1)   
        
        shiftService.shiftData.firstShiftYesterday = shiftService.shiftData.ShiftsLast7Days.slice().find(x=> x.dayOfShift ==  yesterday.getDate());
        shiftService.shiftData.lastShiftYesterday = shiftService.shiftData.ShiftsLast7Days.slice().reverse().find(x=> x.dayOfShift ==  yesterday.getDate());

        let yesterdayStartShiftTimeFormat = '';
        if (shiftService.shiftData &&
            shiftService.shiftData.firstShiftYesterday && 
            shiftService.shiftData.firstShiftYesterday.StartTime) {
              yesterdayStartShiftTimeFormat = moment(shiftService.shiftData.firstShiftYesterday.StartTime, 'YYYY-MM-DDTHH:mm:ss').format($scope.userDateFormat.split(" ")[0]);
        }

        let yesterdayLastShiftTimeFormat = '';
        if (shiftService.shiftData &&
            shiftService.shiftData.lastShiftYesterday && 
            shiftService.shiftData.lastShiftYesterday.StartTime) {
              yesterdayLastShiftTimeFormat = moment(shiftService.shiftData.lastShiftYesterday.StartTime, 'YYYY-MM-DDTHH:mm:ss').format($scope.userDateFormat.split(" ")[0]);
        }

        shiftService.shiftData.yesterdayLabel = 
          shiftService.shiftData.firstShiftYesterday.ShiftName + 
          " " +
          yesterdayStartShiftTimeFormat +
           " - " 
           +
           shiftService.shiftData.lastShiftYesterday.ShiftName + 
          " " +
          yesterdayLastShiftTimeFormat 


        shiftService.shiftData.thisDayShiftFullName = thisShiftName + " " + thisShiftDate;
        shiftService.shiftData.LastShiftFullName = lastShiftName + " " + lastShiftDate;
        shiftService.shiftData.LastShiftSartDate = lastShiftDateO;
        shiftService.shiftData.customShiftsInsights = $scope.customShiftArr;
        shiftService.shiftData.customShiftsInsightsOBJ = $scope.customShifts;
      });
    };
    $scope.getStructureThumbnails();
    $scope.initWrapper();

    let monthNumToName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  };

  return {
    restrict: "E",
    templateUrl: "views/custom/productionFloor/shiftTab/insightsDashboard/shiftInsightsTemplates/shiftInsightsTemplates.html",
    scope: {
      dashboardType: "=",
      isFactory: "=",
      templates: "=",
      machineData: "=",
    },
    controller: controller,
    controllerAs: "shiftInsightsTemplatesCtrl",
  };
};

angular.module("LeaderMESfe").directive("shiftInsightsTemplatesDirective", shiftInsightsTemplatesDirective);
