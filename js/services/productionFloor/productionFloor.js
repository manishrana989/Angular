
angular
  .module("LeaderMESfe")
  .factory(
    "productionFloorService",
    function (
      BreadCrumbsService,
      $timeout,
      LeaderMESservice,
      $sessionStorage,
      $localStorage,
      $rootScope,
      $filter,
      googleAnalyticsService,
      GLOBAL,
      $modal,
      insightService,
      shiftService,
      AuthService,
      SweetAlert
    ) {
      var initBreadCrumbCustom = function ($scope) {
        var initBreadCrumb = function () {
          BreadCrumbsService.init();
          if ($scope.localLanguage == true) {
            BreadCrumbsService.push($scope.content.topMenu.TopMenuLName, 0);
            BreadCrumbsService.push($scope.content.subMenu.SubMenuLName, 0);
          } else {
            BreadCrumbsService.push($scope.content.topMenu.TopMenuEName, 0);
            BreadCrumbsService.push($scope.content.subMenu.SubMenuEName, 0);
          }
          if (
            $scope.content.subMenu.SubMenuAppPartID == -2 ||
            $scope.content.subMenu.SubMenuAppPartID == 540 ||
            $scope.content.subMenu.SubMenuAppPartID == -1
          ) {
            $scope.topPageTitle = $filter("translate")("DEPARTMENT_VIEW");
            $scope.topPageTitleFlag = false;
          } else {
            $scope.topPageTitleFlag = true;
          }
          $scope.topPageTitleId = $scope.content.subMenu.SubMenuAppPartID;
        };
        if ($scope.modal === undefined || $scope.modal === null) {
          initBreadCrumb();
        }
      };
      

      function productionFloorCode($scope) {
        $scope.userDateFormat = AuthService.getUserDateFormat();
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.showFilterInsights = false;
        $scope.navModelOpen = insightService.navModelOpen;
        $scope.allDepartments = $scope.content.subMenu.SubMenuExtID == 0 ? true : false;
        $scope.machineGroupsOBJ = {};
        $scope.machineLinesOBJ = {};
        shiftService.shiftData.timeBarIsVisible = false;
        shiftService.shiftData.pinTitles = true;
        $scope.shiftManagerName = "SHIFT_MANAGER_LOGIN"
        $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure
        if(!$localStorage.onlineDepartmentStructureTemplate)
        {
          $localStorage.onlineDepartmentStructureTemplate = {
            value : "false"
          }
          $scope.onlineDepartmentStructure = $localStorage.onlineDepartmentStructureTemplate
        }
        else
        {
          $scope.onlineDepartmentStructure = $localStorage.onlineDepartmentStructureTemplate
        }
        if(!$localStorage.newOnlineStructureTemplate)
        {
          $localStorage.newOnlineStructureTemplate = {
            value : "false"
          }
          
          $scope.newOnlineStructure= $localStorage.newOnlineStructureTemplate
        }
        else
        {
          $scope.newOnlineStructure = $localStorage.newOnlineStructureTemplate
        }
        if( $scope.allowSetDefaultMachineStructure)
        {
          LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
            $scope.usersData = response.Users;
            $scope.groupsData = response.Groups;
          });
        }
        if (!shiftService.shiftData.MachinesByLines || !shiftService.shiftData.MachinesByGroups) {
          LeaderMESservice.customAPI("GetDepartmentMachine", {
            DepartmentID: $scope.content.subMenu.SubMenuExtID,
          }).then(function (response) {
            $scope.machinesByGroups = _.find(response.DepartemntMachineGroups, {
              Key: { Id: $scope.content.subMenu.SubMenuExtID },
            });
            $scope.machinesByLines = _.find(response.DepartemntMachineLines, {
              Key: { Id: $scope.content.subMenu.SubMenuExtID },
            });

            $scope.updateShiftMachinesFilter();
            shiftService.initContainersFilterState();
            if ($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinegroupsobj) {
              shiftService.shiftData.MachinesByGroup = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinegroupsobj);
            } else {
              shiftService.shiftData.MachinesByGroup = angular.copy($scope.machinesByGroups);
            }
            if ($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinelinesobj) {
              shiftService.shiftData.MachinesByGroup = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinelinesobj);
            } else {
              shiftService.shiftData.MachinesByLine = angular.copy($scope.machinesByLines);
            }
            if($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
            {
              shiftService.shiftData.tempMachinesDisplay = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay);
            }
            else if (shiftService.shiftData.machinesDisplay) {
              shiftService.shiftData.tempMachinesDisplay = angular.copy(shiftService.shiftData.machinesDisplay);
            }
          });
        }
        if (!$scope.allDepartments) {
          $scope.departmentId = $scope.content.subMenu.SubMenuExtID;
          LeaderMESservice.customAPI("GetCurrentShiftStartTime", { DepartmentID: $scope.departmentId }).then(function (response) {
            $sessionStorage.depShiftStartTime = moment(response.StartTime, "DD/MM/YYYY HH:mm:ss");
            shiftService.shiftData.currentShiftInfo = response;
          });
        }

        $scope.showLoginShift = false;

        $rootScope.$on('managerLogin',(e, newValue) => {
          $scope.showLoginShift = newValue.AllowShiftManagerLogin;
          if(newValue?.ShiftManager)
          {
            $scope.shiftManagerName = newValue.ShiftManager;
          }
        });

        $scope.machineData = {
          subMenu: $scope.content.subMenu,
        };
        productionFloorScope = $scope;

        var loadInsightsTimeRange = function () {
          $timeout(function () {
            $scope.insightSelectedInterval = insightService.insightSelectedInterval;

            var ranges = {};
            var timeValue = [1, 0, 0, 7, 14, 28];
            var timeString = [
              "YESTERDAY",
              "LAST_WEEK_SUNDAY_TO_SATURDAY",
              "LAST_WEEK_MONDAY_TO_SUNDAY",
              "LAST_7_DAYS",
              "LAST_14_DAYS",
              "LAST_28_DAYS",
            ];

            var getTimeDates = function () {
              timeString.forEach(function (temp, index) {
                if (temp == "YESTERDAY") {
                  ranges[$filter("translate")(temp)] = [moment().subtract(1, "days").startOf("day"), moment().startOf('day')];
                } else if (temp == "LAST_WEEK_SUNDAY_TO_SATURDAY") {
                  if($scope.localLanguage){
                    ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").weekday(0).startOf("day"), moment().subtract(1, "weeks").endOf("week").weekday(6).startOf("day")];
                  }
                  else
                  {
                    //some bugs happened in these days thats why i change the range when its value 6 or 5
                    if(moment().weekday() == 6 || moment().weekday() == 5){
                      ranges[$filter("translate")(temp)] = [moment().isoWeekday(0).startOf("day"), moment().isoWeekday(6).startOf("day")];
                    }
                    else
                    {
                      ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").isoWeekday(0).startOf("day"), moment().subtract(1, "weeks").endOf("week").isoWeekday(6).startOf("day")];
                    }
                  }
                } else if (temp == "LAST_WEEK_MONDAY_TO_SUNDAY") {
                  if($scope.localLanguage){
                    ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").weekday(1).startOf("day"), moment().subtract(1, "weeks").endOf("week").weekday(7).startOf("day")];
                  }
                  else
                  {
                    if(moment().weekday() == 6){
                      ranges[$filter("translate")(temp)] = [moment().isoWeekday(1).startOf("day"), moment().isoWeekday(7).startOf("day")];
                    }
                    else
                    {
                      ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("isoWeek").isoWeekday(1).startOf("day"), moment().subtract(1, "weeks").endOf("isoWeek").isoWeekday(7).startOf("day")];
                    }
                  }
                } else {
                  ranges[$filter("translate")(temp)] = [moment().subtract(timeValue[index], "days").startOf("day"), moment().subtract(1, 'd').startOf('day') ];
                }
              });
              return ranges;
            };

            $scope.insightsUpdateDate = function (api) {

              if (api) {
                _.forEach(timeString, function (timeName,index) {
                  if ($filter("translate")(timeName) == api.chosenLabel) {
                    $scope.insightSelectedInterval.id = timeName;
                  } else if (api.chosenLabel == $filter("translate")("CUSTOM") && index == timeString.length - 1) {
                    $scope.insightSelectedInterval.id = "CUSTOM"; 
                  }
                });
                $scope.pickerDate.endDate._d.setHours(0);
                $scope.pickerDate.endDate._d.setMinutes(0);
                $scope.pickerDate.endDate._d.setSeconds(0);
                $scope.pickerDate.endDate._d.setMilliseconds(0);
              }                            
              $scope.checkSameDateRanger()      
              $scope.insightSelectedInterval.selectedInterval = $scope.pickerDate.endDate.diff($scope.pickerDate.startDate, "days");              
              insightService.changeInsightSelectedInterval($scope.pickerDate);
            };

            $scope.checkSameDateRanger = function(){              
              $timeout(function(){
                if($localStorage.insightDate?.id == "YESTERDAY")
                {
                  $('#reportrange1').val(`${$scope.pickerDate?.startDate.format($scope.userDateFormat.split(" ")[0])}`);
                } 
                else if($scope.pickerDate?.endDate?.isSame($scope.pickerDate?.startDate))
                {
                  $('#reportrange1').val(`${$scope.pickerDate?.endDate.format($scope.userDateFormat.split(" ")[0])}`);
                }  
              },0)
            }
            var getPickerDate = function () {
              //update ranges before getting pickerDate
              if (!$("#reportrange1").length) {
                return;
              }
              $("#reportrange1").data().daterangepicker.ranges = getTimeDates();
              if ($scope.insightSelectedInterval.id == "YESTERDAY") {
                return ($scope.pickerDate = {
                  startDate: moment().subtract(1, "days").startOf("day"),
                  endDate: moment().startOf('day'),
                });
              } else if ($scope.insightSelectedInterval.id == "LAST_WEEK_SUNDAY_TO_SATURDAY") {
                $scope.pickerDate = {
                  startDate:moment().subtract(1, "weeks").startOf("week").isoWeekday(0).startOf('day'),
                  endDate: moment().subtract(1, "weeks").endOf("week").isoWeekday(6).startOf('day'),
                };
              } else if ($scope.insightSelectedInterval.id == "LAST_WEEK_MONDAY_TO_SUNDAY") {
                $scope.pickerDate = {
                  startDate:moment().subtract(1, "weeks").startOf("week").isoWeekday(1).startOf('day'),
                  endDate: moment().subtract(1, "weeks").endOf("week").isoWeekday(7).startOf('day'),
                };
              } else if ($scope.insightSelectedInterval.id == "LAST_7_DAYS") {
                $scope.pickerDate = {
                  startDate: moment().subtract(7, "days").startOf("day"),
                  endDate: moment().subtract(1, 'd').startOf('day'),
                };
              } else if ($scope.insightSelectedInterval.id == "LAST_14_DAYS") {
                $scope.pickerDate = {
                  startDate: moment().subtract(14, "days").startOf("day"),
                  endDate: moment().subtract(1, 'd').startOf('day'),
                };
              } else if ($scope.insightSelectedInterval.id == "LAST_28_DAYS") {
                $scope.pickerDate = {
                  startDate: moment().subtract(28, "days").startOf("day"),
                  endDate: moment().subtract(1, 'd').startOf('day'),
                };
              } else {
                $scope.pickerDate = {
                  startDate: moment($scope.insightSelectedInterval.pickerDate.startDate),
                  endDate: moment($scope.insightSelectedInterval.pickerDate.endDate),
                };
              }
 
            };
            $scope.rangeOptions = {
              timePicker: true,
              ranges: getTimeDates(),
              locale: {
                format: $scope.userDateFormat.split(" ")[0],
                separator: " - ",
                applyLabel: $filter("translate")("APPLY"),
                cancelLabel: $filter("translate")("CANCEL"),
                fromLabel: $filter("translate")("FROM"),
                toLabel: $filter("translate")("TO"),
                customRangeLabel: $filter("translate")("CUSTOM"),
                translateYesterday:$filter("translate")("YESTERDAY"),
                daysOfWeek: [
                  $filter("translate")("SUNDAY_SHORT"),
                  $filter("translate")("MONDAY_SHORT"),
                  $filter("translate")("TUESDAY_SHORT"),
                  $filter("translate")("WEDNESDAY_SHORT"),
                  $filter("translate")("THURSDAY_SHORT"),
                  $filter("translate")("FRIDAY_SHORT"),
                  $filter("translate")("SATURDAY_SHORT"),
                ],
                monthNames: [
                  $filter("translate")("January"),
                  $filter("translate")("February"),
                  $filter("translate")("March"),
                  $filter("translate")("April"),
                  $filter("translate")("May"),
                  $filter("translate")("June"),
                  $filter("translate")("July"),
                  $filter("translate")("August"),
                  $filter("translate")("September"),
                  $filter("translate")("October"),
                  $filter("translate")("November"),
                  $filter("translate")("December"),
                ],
                firstDay: 0,
              },
            };
            $timeout(function () {
              getPickerDate();  
              $scope.checkSameDateRanger()
            }, 100);
          }, 1000);
        };

        $scope.updateShiftMachinesFilter = () => {
          var visited = true;
          shiftService.shiftData.machineGroupsDisplay = {};
          shiftService.shiftData.tempMachinesGroupsDisplay = {};
          shiftService.shiftData.machineLinesDisplay = {};
          shiftService.shiftData.tempMachinesLinesDisplay = {};
          if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] &&  $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter &&  $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
          {
            $scope.shiftData.machinesDisplay = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
          }
          else{
            visited = false;
          }
          if ($scope.machinesByGroups) {
            $scope.machineGroupsOBJ = {};
            Object.values($scope.machinesByGroups.Value).forEach((group) => {
              $scope.machineGroupsOBJ[group.Key.MachineGroupID] = group;
              let isChecked = true;
              _.forEach(group.Value, function (machine) {
                if (!$scope.shiftData.machinesDisplay[machine.Id] && visited) {
                  isChecked = false;
                }
              });
              shiftService.shiftData.machineGroupsDisplay[group.Key.MachineGroupID] = isChecked;
              shiftService.shiftData.tempMachinesGroupsDisplay[group.Key.MachineGroupID] = isChecked;
            });
          }
     
          if ($scope.machinesByLines) {
            $scope.machineLinesOBJ = {};
            Object.values($scope.machinesByLines.Value).forEach((line) => {

              $scope.machineLinesOBJ[line.Key.LineID] = line;
              let isChecked = true;
              _.forEach(line.Value, function (machine) {
                if (!$scope.shiftData.machinesDisplay[machine.Id] && visited) {
                  isChecked = false;
                }
              });
              shiftService.shiftData.machineLinesDisplay[line.Key.LineID] = isChecked;
              shiftService.shiftData.tempMachinesLinesDisplay[line.Key.LineID] = isChecked;
            });
          }
        };

        $scope.getStructureThumbnails = function () {          
          if($sessionStorage.produtionFloorTab.selectedTab != 'shift'){
            LeaderMESservice.customAPI("GetStructureThumbnails", {
              DashboardType: $scope.content.subMenu.SubMenuExtID == 0 ? 1 : 3,
              DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID
            }).then(function (res) {
              $scope.templates = res.TemplateData;
              $scope.doneLoading = true;
              $scope.allowEdit = res.AllowEdit;              
              $scope.structures = res.DefaultTemplateData
          
            });
          }
        };

        $scope.changeNavModelOpen = function () {
          $scope.navModelOpen.value = !$scope.navModelOpen.value;
        };
        
        $scope.lastSelectedTab = 4;
        $scope.machineData.isPie = true;
        $scope.hideClicked = { value: false };
        if ($scope.hideClicked.value) {
          $scope.buttonTitle = "SHOW_THE_TIME_BAR";
        } else {
          $scope.buttonTitle = "HIDE_THE_TIME_BAR";
        }
        $scope.hideClick = function () {
          $scope.hideClicked.value = !$scope.hideClicked.value;
          if ($scope.hideClicked.value) {
            $scope.buttonTitle = "SHOW_THE_TIME_BAR";
          } else {
            $scope.buttonTitle = "HIDE_THE_TIME_BAR";
          }
        };

        $scope.openInfo = function () {
          if ($scope.content.subMenu.allMachines) {
            window.open(GLOBAL.allMachines, "_blank");
          } else if (
            ($scope.ProductionFloorTab && $scope.ProductionFloorTab.selectedTab == "newOnline") ||
            ($scope.ProductionFloorTab && $scope.ProductionFloorTab.selectedTab == "newShift")
          ) {
            window.open(GLOBAL.factoryView, "_blank");
          } else if ($scope.ProductionFloorTab && $scope.ProductionFloorTab.selectedTab == "online") {
            window.open(GLOBAL.online, "_blank");
          } else if ($scope.ProductionFloorTab && $scope.ProductionFloorTab.selectedTab == "shift") {
            window.open(GLOBAL.shift, "_blank");
          }
        };

        $scope.changeShowFilterInsights = function (show) {
          $scope.showFilterInsights = !show;
          insightService.updateShowFilterInsight($scope.showFilterInsights);
        };
        $scope.changeShowFilterShift = function (show) {
          $scope.showFilterShift = !$scope.showFilterShift;
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift = !$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift;
          $scope.showServiceCalls = $scope.showServiceCalls && !$scope.showFilterShift;
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible && !$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift;
          $scope.shiftData.allMachinesDisplayTemp = angular.copy($scope.shiftData.allMachinesDisplay);
          $scope.shiftData.endOfLineToggleTemp = angular.copy($scope.shiftData.endOfLineToggle);
          $scope.shiftData.tempMachinesGroupsDisplay = angular.copy($scope.shiftData.machineGroupsDisplay);
          $scope.shiftData.tempMachinesLinesDisplay = angular.copy($scope.shiftData.machineLinesDisplay);
          shiftService.updateShowFilterShift($scope.showFilterShift);
        };

        $scope.changeShowServiceCalls = function () {
          $scope.showServiceCalls = !$scope.showServiceCalls;
          $scope.showFilterShift = $scope.showFilterShift && !$scope.showServiceCalls;
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible = !$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible;
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift && !$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible;
        };
        $scope.openTargetInfo = function () {
          window.open(GLOBAL.target, "_blank");
        };

        if ($scope.content.subMenu.allMachines) {
          $scope.machineData.isPie = false;
          if (
            !$sessionStorage.produtionFloorTab ||
            !$sessionStorage.produtionFloorTab.selectedTab ||
            ["newOnline", "ShiftProgress"].indexOf($sessionStorage.produtionFloorTab.selectedTab) < 0
          ) {
            $sessionStorage.produtionFloorTab = {
              selectedTab: "newOnline",
            };
          }
        }
        $scope.gaE = function (page_view, event_name) {
          googleAnalyticsService.gaEvent(page_view, event_name);
        };

        $scope.openSelectedTab = function (selectedTab) {
          $scope.ProductionFloorTab.selectedTab = selectedTab;
          if (selectedTab == "newOnline") {
            if ($scope.content.subMenu.allMachines) {
              $scope.machineData.isPie = false;
            } else {
              $scope.machineData.isPie = true;
            }
          } else if (selectedTab == "newShift") {
            $scope.machineData.showGoals.value = false;
          } else if (selectedTab == "insights") {
            $scope.pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
            insightService.createInsightDataObject($scope.pageID);
            $scope.insightsColorText = angular.copy(insightService.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID]);

            insightService.updateContainerInsightPage();
            $scope.dashboardType = 3;
            $scope.loadTemplate = insightService.updateContainerInsightPage;
            $scope.getStructureThumbnails();
            $scope.insightData = insightService.insightData;
            $scope.insightFiltersData = $sessionStorage.insightData[$scope.pageID].filters;
            loadInsightsTimeRange();
          } else if (selectedTab == "factoryInsights") {
            $scope.pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
            insightService.updateContainerInsightPage();
            $scope.insightData = insightService.insightData;
            $scope.insightFiltersData = $sessionStorage.insightData[$scope.pageID].filters;
            loadInsightsTimeRange();
          } else if (selectedTab == "ShiftProgress") {
            if ($scope.content.subMenu.allMachines) {
              $scope.machineData.isPie = false;
            } else {
              $scope.machineData.isPie = true;
            }
          }
        };

        $scope.machineData.showGoals = { value: false };
        if ($scope.content.subMenu.targets) {
          $scope.machineData.showGoals.value = true;
          $sessionStorage.produtionFloorTab = {
            selectedTab: "newOnline",
          };
        }

        $scope.allMachines = true;
        $scope.shiftData = shiftService.shiftData;
        $scope.shiftData.allMachinesDisplay = true;
        $scope.shiftData.endOfLineToggle = { checked: false };
        if(!$localStorage.shiftInfo)
        {
          $localStorage.shiftInfo = {}
        }
        if(!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID]){
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID]={timeBarIsVisible:true,machineFilterIsVisible:false,showFilterShift:false};
        }else{
          if(!('timeBarIsVisible' in $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID])){
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible=true;
          }

          if(!('machineFilterIsVisible' in $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID])){
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilterIsVisible=false;
          }

          if(!('showFilterShift' in $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID])){
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift=false;
          }
        }
        
        // $scope.showServiceCalls = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBarIsVisible;
        $scope.showServiceCalls = false;
        $scope.showFilters = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilterIsVisible;
        $scope.showFilterShift=$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].showFilterShift;
        $scope.selectedCustomShiftsArr = { index: 0 };

        $scope.containers = shiftService.containers;

        $scope.disableBtns = false;
        $scope.resetDefaultShift = function (resetPage) {
          shiftService.resetContainerDefault(resetPage);
          $scope.containers = shiftService.containers;
          shiftService.resetDisplayDefault();
          googleAnalyticsService.gaEvent("Department_Shift", "reset");
        };

        $scope.resetDefaultInsight = function () {
          insightService.resetContainerDefault();
          $scope.insightsContainer = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container;
          if ($sessionStorage.stateParams.subMenu.SubMenuExtID) {
            $scope.structures = _.map($scope.structures, function (temp) {
              temp.show = false;
              if ($localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value == temp.name) {
                temp.show = true;
              }
              return temp;
            });
            googleAnalyticsService.gaEvent("Department_Insights", "reset");
          } else {
            $scope.structuresFactory = _.map($scope.structuresFactory, function (temp) {
              temp.show = false;
              if ($localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value == temp.name) {
                temp.show = true;
              }
              return temp;
            });
            googleAnalyticsService.gaEvent("Factory_Insights", "reset");
          }
        };

        $scope.updateSortable = function () {
          $timeout(function () {
            shiftService.updateGraphLines();
          }, 500);
        };
        if (!$sessionStorage.produtionFloorTab) {
          $sessionStorage.produtionFloorTab = {
            selectedTab: $sessionStorage.userAuthenticated.HomePageSubObject || "newOnline",
          };
        }
        if (
          $scope.allDepartments &&
          ($sessionStorage.produtionFloorTab.selectedTab == "online" || $sessionStorage.produtionFloorTab.selectedTab == "ShiftProgress")
        ) {
          $sessionStorage.produtionFloorTab.selectedTab = "newOnline";
        } else if (
          !$scope.allDepartments &&
          ($sessionStorage.produtionFloorTab.selectedTab == "newOnline" || $sessionStorage.produtionFloorTab.selectedTab == "ShiftProgress")
        ) {
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
          (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "insights") ||
          (!$scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "factoryInsights")
        ) {
          $scope.pageID = $scope.content.subMenu.SubMenuExtID;
          $sessionStorage.produtionFloorTab.selectedTab = "insights";
          insightService.updateContainerInsightPage();
          $scope.dashboardType = 3;
          $scope.loadTemplate = insightService.updateContainerInsightPage;
          $scope.getStructureThumbnails();
          $scope.insightData = insightService.insightData;
          $scope.insightFiltersData = $sessionStorage.insightData[$scope.pageID].filters;
          loadInsightsTimeRange();
        } else if (
          ($scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "factoryInsights") ||
          ($scope.allDepartments && $sessionStorage.produtionFloorTab.selectedTab == "insights")
        ) {
          $scope.pageID = $scope.content.subMenu.SubMenuExtID;
          $sessionStorage.produtionFloorTab.selectedTab = "factoryInsights";
          insightService.updateContainerInsightPage();
          $scope.insightFiltersData = $sessionStorage.insightData[$scope.pageID].filters;
          $scope.insightData = insightService.insightData;
          loadInsightsTimeRange();
        }
        $scope.insightsColorText = angular.copy(insightService.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID]);

        $scope.ProductionFloorTab = $sessionStorage.produtionFloorTab;
        $scope.shiftData.selectedTab = 4;
        shiftService.shiftData.tab = 4;

        var menuAndSubMenu = LeaderMESservice.getMainMenu();
        $scope.productionFloorMenu = angular.copy(_.find(menuAndSubMenu, { TopMenuAppPartID: 500 }));

        $scope.subMenuNavButtons = [
          _.find($scope.productionFloorMenu.subMenu, { SubMenuAppPartID: -1 }),
          _.find($scope.productionFloorMenu.subMenu, { SubMenuAppPartID: 540 }),
        ];

        $scope.subMenuNavmenu = _.filter($scope.productionFloorMenu.subMenu, function (temp) {
          if (temp.SubMenuAppPartID !== 5400 && temp.SubMenuAppPartID !== 540 && temp.SubMenuAppPartID !== -1 && temp.SubMenuAppPartID !== -2) {
            return temp;
          }
        });

        if ($scope.productionFloorMenu) {
          $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, {
            SubMenuExtID: $scope.departmentId,
          });
        }

        $scope.isCustomPeriod = false;

        $scope.periodsOptions = {
          1: "CUSTOM",
          3: "LAST_24_HOURS",
          4: "CURRENT_SHIFT",
          5: "LAST_HOUR",
          6: "LAST_SHIFT",
          9: "ALL_TODAY_SHIFTS",
        };

        $scope.updateInsightColorText = function () {
          insightService.changeInsightsTextColor($scope.insightsColorText);
        };

        $scope.selectedCustomShiftsValue = { selected: "allShifts" };

        $scope.selectCustomShifts = () => {
          let minDate;
          let maxDate;
          let maxDateStart;
          let minShiftName;
          let maxShiftName;
          shiftService.shiftData.selectedCustomShiftID = [];     
          let selectedDayShifts = shiftService.shiftData.customShiftsInsights[$scope.selectedCustomShiftsArr.index].shifts.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );
          minDate = selectedDayShifts[0].startTime;          
          maxDate = selectedDayShifts[selectedDayShifts.length - 1].endTime; 
          shiftService.shiftData.KPIsByShiftsCustom= {
            startDate:new Date((new Date(minDate)).setSeconds(0)),
            endDate:new Date((new Date(maxDate)).setSeconds(0))
          }
          if ($scope.selectedCustomShiftsValue.selected == "allShifts") {
            minDate = moment(minDate).format("YYYY-MM-DD HH:00:00")
            maxDate = moment(maxDate).format("YYYY-MM-DD HH:00:00")
            
            maxDateStart = selectedDayShifts[selectedDayShifts.length - 1].startTime;
            minShiftName = selectedDayShifts[0].name;
            maxShiftName = selectedDayShifts[selectedDayShifts.length - 1].name;
            _.forEach(selectedDayShifts, function (shift) {
              shiftService.shiftData.selectedCustomShiftID.push(shift.ID);
            });
            
            //specific shift in day
          } else {
            for (let shift of shiftService.shiftData.customShiftsInsights[$scope.selectedCustomShiftsArr.index].shifts) {
              if (shift.name === $scope.selectedCustomShiftsValue.selected) {
                minDate = moment(shift.startTime).format("YYYY-MM-DD HH:00:00")
                maxDate = moment(shift.endTime).format("YYYY-MM-DD HH:00:00")
                maxDateStart = shift.startTime;
                shiftService.shiftData.selectedCustomShiftID.push(shift.ID);
                break;
              }
            }
          }
          shiftService.shiftData.isCustomAllShifts = $scope.selectedCustomShiftsValue.selected === "allShifts" ? true : false

          $scope.updateData(2, minDate, maxDate);
          if(shiftService.shiftData.machineID)
          {
            shiftService.shiftData.customRangeEnabled = true;
          }
          
            $scope.selectedCustomShiftsValue.selected === "allShifts"
          shiftService.shiftData.CustomShiftName =
            $scope.selectedCustomShiftsValue.selected === "allShifts"
              ? minShiftName + " " + moment(minDate).format($scope.userDateFormat.split(" ")[0]) + " - " + maxShiftName + " " + moment(maxDate).format($scope.userDateFormat.split(" ")[0])
              : $scope.selectedCustomShiftsValue.selected + "  " + moment(minDate).format("DD/MM/YYYY");
        };

        $scope.updateData = function (value, date, dateEnd) {
          // code for ga
          var eventName = null;

          switch (value) {
            case 3:
              eventName = "shift_in_last_24_hours";
              break;
            case 4:
              eventName = "shift";
              break;
            case 5:
              eventName = "last_hour";
              break;
            case 6:
              eventName = "last_shift";
              break;
            case 9:
              eventName = "all_today_shifts";
              break;
            case 10:
            eventName = "yesterday";
            break;
          }

          if (eventName) {
            googleAnalyticsService.gaEvent("Department_Shift", eventName);
          }
          // code for ga end
          if ($scope.shiftData.dataLoading) {
            return;
          }
          if (value == 2) {
            if (date && dateEnd) {
              $scope.shiftData.customRange = {
                startDate: date,
                endDate: dateEnd,
              };

              if ($scope.ProductionFloorTab.selectedTab == "insights" || $scope.ProductionFloorTab.selectedTab == "FactoryInsights") {
                $scope.insightPageCustom =
                  moment($scope.shiftData.customRange.startDate).format("DD/MM/YYYY") +
                  "  -  " +
                  moment($scope.shiftData.customRange.endDate).format("DD/MM/YYYY");
              } else {
                $scope.insightPageCustom = undefined;
              }
            } else if (date) {
              $scope.shiftData.customDay = date;
            }
          }
          var durationObj = shiftService.durationParams(value);
          if ((durationObj && durationObj.updateData !== false) || !durationObj) {
            if (value != 5) {
              $scope.shiftData.lastHour = false;
            } else {
              $scope.shiftData.dataTimePeriod = 4;
              $scope.shiftData.lastHour = true;
            }
            shiftService.shiftData.tab = value;
            $scope.shiftData.selectedTab = value;
            if (durationObj) {
              delete durationObj.updateData;
            }
            shiftService.updateData($scope.content.subMenu.SubMenuExtID, durationObj, false);
          } else {
            $scope.shiftData.lastHour = true;
            $scope.selectedDuration = value;
            shiftService.shiftData.selectedTab = value;
          }

          $rootScope.$broadcast("shiftChange", {});
        };

        $scope.refresh = function () {
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
          $rootScope.$broadcast("shiftChange", {});
          googleAnalyticsService.gaEvent("Department_Shift", "refresh");
        };
        // $scope.resetClick = function () {
        //   $scope.insightPageCustom = undefined;
        //   $scope.updateData(4);
        //   if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
        //     insightService.updateContainerInsightPage($scope.structures[0].template);
        //   } else {
        //     insightService.updateContainerInsightPage();
        //   }
        //   $scope.structures = _.map($scope.structures, function (temp) {
        //     if (temp.name == "PE_ANALYSIS") {
        //       temp.show = true;
        //     } else {
        //       temp.show = false;
        //     }
        //     return temp;
        //   });
        //   googleAnalyticsService.gaEvent("Department_Insights", "reset");
        // };

        $scope.clearClick = function () {
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
                  $localStorage.insightTemplateID[$scope.content.subMenu.SubMenuExtID] = {};
                  $localStorage.insightStates[$scope.content.subMenu.SubMenuExtID] = {};
                  $sessionStorage.insightData[$scope.content.subMenu.SubMenuExtID].container = [];
                  
                  if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
                    insightService.updateContainerInsightPage();
                    $scope.structures = _.map($scope.structures, function (temp) {
                      temp.show = false;
                      return temp;
                    });
                  } else {
                    $scope.structuresFactory = _.map($scope.structuresFactory, function (temp) {
                      temp.show = false;
                      return temp;
                    });
                    insightService.updateContainerInsightPage();
                  }
                  $scope.machineData.selectedTemplteIndex = -1;
                  googleAnalyticsService.gaEvent("Department_Insights", "clear");
                }
              }
            );
        };

        $scope.resetFilterInsights = function () {
          $scope.$broadcast("resetFilter");
        };

        $scope.openObjectDescription = function () {
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
          update: function (e, ui) {
            googleAnalyticsService.gaEvent("Department_Shift", "Change_display_order");
          },
        };

        $scope.$on("globalFilter", function (event, isGlobalFilter) {
          $scope.isGlobalFilter = isGlobalFilter;
        });

        $rootScope.$on("updateMachineFilter", function (event, args) {
          $scope.updateShiftMachinesFilter();
        });

        $scope.insightContainers = insightService.returnContainersInsights.containerInsightInjection();
        $scope.insightContainers = insightService.returnContainersInsights.containerInsightFactory();

        $scope.openDatePicker = function () {
          var modelScope = $scope;

          $modal
            .open({
              windowClass: "dashboard-period-dropdown",
              scope: modelScope,
              templateUrl: "views/common/datepickerRange.html",
              controller: function ($scope, $modalInstance) {
                $scope.today = new Date();
                $scope.yesterday = new Date();
                $scope.yesterday.setDate($scope.yesterday.getDate() - 1);
                $scope.dtStart = $scope.yesterday;
                $scope.dtEnd = $scope.today;

                var d = new Date();
                $scope.minDate = d.setMonth(d.getMonth() - 2);
                $scope.errorCompare = false;

                $scope.checkErrors = function () {
                  $scope.errorCompare = false;
                  if (Date.parse($scope.dtStart) > Date.parse($scope.dtEnd)) {
                    //end is less than start
                    $scope.errorCompare = true;
                  }
                };

                $scope.updateValue = function (selectedDate, isStart) {
                  if (typeof selectedDate === "string" && selectedDate != "" && selectedDate != null) {
                    selectedDate = moment(selectedDate, "DD/MM/YYYY HH:mm:ss");
                  }
                  if (!selectedDate) return;
                  if (selectedDate.toDate) {
                    if (isStart) {
                      $scope.dtStart = selectedDate.toDate();
                    } else {
                      $scope.dtEnd = selectedDate.toDate();
                    }
                  }
                  $scope.checkErrors();
                };
                $scope.updateDate = function () {
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
                $scope.closeModal = function () {
                  $modalInstance.close();
                };
              },
              controllerAs: "datepickerCtrl",
            })
            .result.then(function () {});
        };
        $scope.toggleMachines = function () {
          $scope.shiftData.Machines.forEach(function (machine) {
            $scope.shiftData.tempMachinesDisplay[machine.machineID] = $scope.shiftData.allMachinesDisplayTemp;
          });

          for (let group in $scope.shiftData.tempMachinesGroupsDisplay) {
            $scope.shiftData.tempMachinesGroupsDisplay[group] = $scope.shiftData.allMachinesDisplayTemp;
          }

          for (let line in $scope.shiftData.tempMachinesLinesDisplay) {
            $scope.shiftData.tempMachinesLinesDisplay[line] = $scope.shiftData.allMachinesDisplayTemp;
          }
        };

        $scope.toggleMachineSection = (isGroup, sectionID, machines) => {
          let isChecked = isGroup? shiftService.shiftData.tempMachinesGroupsDisplay[sectionID] : shiftService.shiftData.tempMachinesLinesDisplay[sectionID];
          if (machines) {
            angular.forEach(machines, (machine) => {
              $scope.shiftData.tempMachinesDisplay[machine.Id] = isChecked;
            });
          }
        };

        $scope.currentTemplate = { hasTemplate: false, name: "" };
        var upperScope = $scope;

        $scope.$on("resetFilterTest", () => {
          upperScope.$broadcast("resetFilter");
        });

        $scope.resetShiftFilter = () => {
          $scope.shiftData.allMachinesDisplay = true;
          $scope.shiftData.allMachinesDisplayTemp = true;
          $scope.shiftData.hasShiftFilter = false;
          $scope.shiftData.hasShiftFilterTemp = false;

          $scope.toggleMachines();
          $scope.applyUpdateMachines();
        };

        $scope.editTemplate = function (mode) {
          $modal
            .open({
              windowClass: "editTemplatesModal",
              template:
                '<templates-directive has-template="template.hasTemplate" template-name="template.name" mode="mode" dashboard-type="dashboardType"' +
                ' load-template="loadTemplate" canvas-class="canvasClass"' +
                ' insights-container="insightsContainer" machines-display="machinesDisplay" close-modal="closeModal" allow-edit="allowEdit" ></templates-directive>',
              controller: function ($scope, $modalInstance, shiftService) {
                $scope.template = upperScope.currentTemplate;
                $scope.mode = mode;
                $scope.allowEdit =upperScope.allowEdit
                if (insightService.insightData && $sessionStorage.stateParams.subMenu.SubMenuExtID > -1 && insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $scope.insightsContainer = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container;
                }
                $scope.machinesDisplay = shiftService.shiftData.machinesDisplay;
                $scope.canvasClass = ".shift-container";
                if ($sessionStorage.produtionFloorTab.selectedTab != "insights") {
                  $scope.dashboardType = 1;
                  $scope.loadTemplate = shiftService.loadNewTemplate;
                } else {
                  $scope.dashboardType = 3;
                  $scope.loadTemplate = insightService.updateContainerInsightPage;
                }

                $scope.closeModal = function () {
                  $modalInstance.close();
                };
              },
            })
            .result.then(function () {
              init();
            });
        };

        $scope.applyUpdateMachines = function (event) {
          if (event) {
            event.stopPropagation();
          }
          shiftService.updateShowFilterShift(false);
          $timeout(function () {
            $scope.shiftData.machinesDisplay = angular.copy($scope.shiftData.tempMachinesDisplay);
            $scope.shiftData.machineGroupsDisplay = angular.copy($scope.shiftData.tempMachinesGroupsDisplay);
            $scope.shiftData.machineLinesDisplay = angular.copy($scope.shiftData.tempMachinesLinesDisplay);
            $scope.shiftData.allMachinesDisplay = angular.copy($scope.shiftData.allMachinesDisplayTemp);
            $scope.shiftData.endOfLineToggle = angular.copy($scope.shiftData.endOfLineToggleTemp);
            if ($scope.shiftData.hasShiftFilterTemp) {
              $scope.shiftData.stickerText = "";
              let machineFilteredCount = 0;
              for (let machineDisplay in $scope.shiftData.machinesDisplay) {
                if ($scope.shiftData.machinesDisplay[machineDisplay] == true) {
                  machineFilteredCount++;
                  if (machineFilteredCount >= 2) {
                    $scope.shiftData.stickerText = "Multiple values";
                    break;
                  } else {
                    let lonelyMachine = $scope.shiftData.Machines.find((machine) => Number(machine.machineID) === Number(machineDisplay));
                    $scope.shiftData.stickerText = lonelyMachine.machineName;
                  }
                }
              }
            }
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID] = $scope.shiftData.hasShiftFilterTemp;
            $scope.shiftData.hasShiftFilter = $scope.shiftData.hasShiftFilterTemp;

            shiftService.displayUpdateDefferd.notify();
          });
        };

        $scope.updateMachineDisplay = function (event, machineId) {
          $scope.shiftData.tempMachinesDisplay[machineId] = !$scope.shiftData.tempMachinesDisplay[machineId];
          if (event) {
            event.stopPropagation();
          }
        };

        shiftService.displayUpdateDefferd.promise.then(null, null, function () {
          shiftService.calcEvents();
          googleAnalyticsService.gaEvent("Department_Shift", "Choosing_machines");
        });

        $scope.updateClicked = function () {
          if ($scope.ProductionFloorTab.selectedTab == "online") {
            $scope.gaE("Department_Online", "Refresh");
          }
          if ($scope.ProductionFloorTab.selectedTab == "newShift") {
            $scope.gaE("Factory_Shift", "Refresh");
          }
          if ($scope.ProductionFloorTab.selectedTab == "factoryInsights") {
            $scope.gaE("Factory_Insight", "Refresh");
          }
          if ($scope.ProductionFloorTab.selectedTab == "newTarget") {
            $scope.gaE("Factory_Target", "Refresh");
          } else if ($scope.ProductionFloorTab.selectedTab == "onlineTargets") {
            $scope.gaE("All_targets", "Refresh");
          } else if ($scope.ProductionFloorTab.selectedTab == "newOnline" && $scope.ProductionFloorData.SubMenuAppPartID == -2) {
            $scope.gaE("Factory_Target", "Refresh");
          } else if ($scope.ProductionFloorTab.selectedTab == "newOnline" && $scope.ProductionFloorData.SubMenuAppPartID == -1) {
            $scope.gaE("All_machine", "Refresh");
          } else if ($scope.ProductionFloorTab.selectedTab == "newOnline" && $scope.ProductionFloorData.SubMenuAppPartID == 540) {
            $scope.gaE("Factory_Online", "Refresh");
          }
        };

        $scope.newTaskWindowUpdate = function () {
          $timeout(() => {
            $scope.ProductionFloorTab.openNewTaskModal = false;
          })
        };

        var init = function () {
          $scope.showMachines = true;
          $scope.ProductionFloorData = $scope.content.subMenu;       
          if(!$localStorage.allMachinesFullScreen)
          {         
            $localStorage.allMachinesFullScreen = {value : false}
          }
          $scope.ProductionFloorData.allMachinesFullScreen = $localStorage.allMachinesFullScreen;
          if ($scope.ProductionFloorTab && $scope.ProductionFloorTab.selectedTab == "factoryInsights") {
            $scope.dashboardType = 1;
            $scope.loadTemplate = shiftService.loadNewTemplate;
          } else {
            $scope.dashboardType = 3;
            $scope.loadTemplate = insightService.updateContainerInsightPage;
          }
          $scope.getStructureThumbnails();
          LeaderMESservice.customAPI("GetMachineStatusDetails", {}).then(function (response) {
            $scope.legends = response.MachineStatus;
          });

          initBreadCrumbCustom($scope);
        };

        $scope.refreshDataCallback = {};

        init();
        if ($scope.shiftData.machineID) {
          $scope.shiftData.machineID = null;
        }

        $scope.pinClicked = function () {
          if ($scope.containers.headerPinned && $scope.containers.headerPinned.enabled) {
            $timeout(function () {
              $scope.containers.headerPinned.enabled = !$scope.containers.headerPinned.enabled;
            });
          } else {
            $scope.containers.headerPinned = {
              enabled: true,
            };
          }
        };

        $scope.ProductionFloorTab.openShiftManagerLogin = function () {
          $modal.open({
            resolve: {
              departmentId: function () {
                    return $scope.departmentId;
                },
            },
            windowClass: 'CopyMachineParameter',
            template: '<div shift-manager-login close="close" department-id="departmentId"></div>',
            controller: function ($scope, $modalInstance, departmentId) {
                $scope.departmentId = departmentId;
                $scope.close = function (data) {
                    $modalInstance.close(data);
                };
            },
        });
        };

        $scope.ProductionFloorTab.openDepartmentCalendar = function () {
          var departmentId = $scope.departmentId;
          $modal.open({
            windowClass: "calendarDepartmentModal",
            template: `<calendar-directive
              ng-if="loading === false"
              view="'departmentMachine'"
              department-id="departmentId"
            ></calendar-directive>`,
            controller: function ($scope, $modalInstance, $timeout) {
              $scope.departmentId = departmentId;
              $scope.loading = true;
              $timeout(function () {
                $scope.loading = false;
              }, 1000);
              $scope.closeModal = function () {
                $modalInstance.close();
              };
            },
          });
        };
      }

      return {
        productionFloorCode: productionFloorCode,
      };
    }
  );
