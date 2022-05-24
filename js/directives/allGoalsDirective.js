function allGoalsDirective(
  shiftService,
  $modal,
  googleAnalyticsService,
  LeaderMESservice,
  AuthService,
  $localStorage,
  $sessionStorage,
  GoalsService,
  $filter,
  OnlineService
) {
  var template = "views/custom/productionFloor/common/allGoals.html";

  var controller = function ($scope) {
    $scope.factoryName = AuthService.getSiteName();
    var allGoalsCtrl = this;
    var allData = [];
    $scope.allMachines = 0;
    $scope.peData = $scope.peData || 0;
    $scope.peData = $scope.peData.toFixed(2);
    if (!$localStorage.activePie) {
      $localStorage.activePie = "x2-rec";
    }
    
    $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure

    $scope.templateGroups = [{ename:$filter('translate')("MY_STRUCTURE"),hname:$filter('translate')("MY_STRUCTURE"),id:-2}]
    var validSelectTemplateGroup = function(){
       if($scope.allowSetDefaultMachineStructure == true && $localStorage.selectTemplateGroupID.collapsed == -1) return false
       if($scope.allowSetDefaultMachineStructure == false && $localStorage.selectTemplateGroupID.collapsed > -1) return false
       return true
    }

    if($localStorage.selectTemplateGroupID && $localStorage.selectTemplateGroupID.collapsed != undefined && validSelectTemplateGroup()){
      allGoalsCtrl.selectTemplateGroupID = $localStorage.selectTemplateGroupID.collapsed
    }
    else
    {
        if(!$localStorage.selectTemplateGroupID)
        {
          if($scope.allowSetDefaultMachineStructure){
            $localStorage.selectTemplateGroupID={
              collapsed:-2,
          }
          }
          else{
            $localStorage.selectTemplateGroupID={
              collapsed:-1,
           }
          }
        }
        else{
          $localStorage.selectTemplateGroupID.collapsed = $scope.allowSetDefaultMachineStructure? -2 : -1
        }            
        allGoalsCtrl.selectTemplateGroupID =$localStorage.selectTemplateGroupID.collapsed;            
    }
    if($scope.allowSetDefaultMachineStructure)
    {
        LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
            $scope.usersData = response.Users;
            $scope.groupsData = response.Groups;
            $scope.templateGroups = [...$scope.templateGroups,..._.map($scope.groupsData,function(group){
                group.ename += ` ${$filter("translate")('STRUCTURE')}`
                group.hname += ` ${$filter("translate")('STRUCTURE')}`
                return group;
            })]
        });
    }else{
      $scope.templateGroups.unshift({ename:$filter('translate')("DEFAULT_STRUCTURE"),hname:$filter('translate')("DEFAULT_STRUCTURE"),id:-1})
    }

    if($localStorage.machineOnlineSettings[$scope.type])
    {
      $scope.machineOnlineSettings = $localStorage.machineOnlineSettings[$scope.type];
    }
    else
    {      
      $scope.machineOnlineSettings = angular.copy(OnlineService.machineOnlineSettings);
      
    }
    OnlineService.getJobDefinitions();

    //will be passed to machine filters directive to indicate if machines has filtering or not to determine which icon of filtering to display (blue or regular)
    $scope.hasFiltering = false;

    $scope.$on("hasFilter", function (event, hasFiltering) {
      $scope.hasFiltering = hasFiltering;
    });

    $scope.activePie = $localStorage.activePie;

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();

    $scope.cursorType = function () {
      if ($scope.machineData.subMenu.SubMenuAppPartID == 0) return "context-menu";
      if ($scope.machineData.subMenu.SubMenuEName == "Factory View" && $scope.type == "online") {
        return "context-menu";
      } else {
        return "pointer";
      }
    };

    allGoalsCtrl.goalsToggle = $scope.machineData.showGoals.value;

    if ($scope.type == "target" || (allGoalsCtrl.goalsToggle && $scope.machineData.showGoals.value)) {
      $scope.getTargets = function () {
        LeaderMESservice.customAPI("getTargets", {
          DepartmentID: 0,
        }).then(function (response) {
          allGoalsCtrl.targets = _.map(response.TargetInfo, function (target) {
            target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
            target.TargetValue = (target.TargetValue * 100).toFixed(1);
            target.ui_name = $scope.localLanguage ? target.LName : target.EName;
            return target;
          });
        });
      };
      $scope.getTargets();
    }
    // $scope.fetching = false;
    // LeaderMESservice.customAPI("GetLinesMachines", {}).then(function (response) {
    //   let machinesLines = response.LinesMachines.map((it) => {
    //     it.Key.pipline = it.Value;
    //     return { [it.Key.ID]: it.Key };
    //   });
    //   $scope.machinesLinesMap = Object.assign({}, ...machinesLines);
    //   $scope.fetching = true;
    // });


    $scope.changeTemplateStructures = function(){
      $localStorage.selectTemplateGroupID.collapsed = allGoalsCtrl.selectTemplateGroupID
    }

    $scope.machinesNumber = 0;
    $scope.showMachinePE = true;
    $scope.allDepartments.forEach(dep => {
      if (dep.DepartmentsMachine) {
        $scope.machinesNumber += dep.DepartmentsMachine.length;
      }
    });

    $scope.updateMachinesStatuses = function () {
      var allData = [];
      $scope.allMachines = 0;

      for (var i = 0; i < $scope.allDepartments?.length; i++) {
        var dep = $scope.allDepartments[i];
        if (!dep.CurrentShift) {
          if (dep.DepartmentPEE && dep.DepartmentPEE.length > 0) {
          }
          if (dep.MachineSummeryForDepartment) {
            if (dep.MachineSummeryForDepartment && dep.MachineSummeryForDepartment[0]) {
              $scope.allMachines = $scope.allMachines + dep.MachineSummeryForDepartment[0].TotalMachines;
            }
            for (var j = 0; j < dep.MachineSummeryForDepartment.length; j++) {
              var machineStatus = dep.MachineSummeryForDepartment[j];
              var found = _.find(allData, { MachineStatusID: machineStatus.MachineStatusID });
              if (found) {
                found.MachineCount = found.MachineCount + machineStatus.MachineCount;
              } else {
                allData.push({
                  MachineCount: machineStatus.MachineCount,
                  MachineStatusID: machineStatus.MachineStatusID,
                  MachineStatus: machineStatus.MachineStatus,
                });
              }
            }
          }
        } else {
          if (dep.CurrentShift && dep.CurrentShift.length > 0) {
            $scope.allMachines = $scope.allMachines + dep.CurrentShift[0].Machines.length;
            for (var j = 0; j < dep.CurrentShift[0].Machines.length; j++) {
              var machine = dep.CurrentShift[0].Machines[j];
              for (var k = 0; k < machine.Events.length; k++) {
                var event = machine.Events[k];
                var found = _.find(allData, { ID: event.EventDistributionID });
                if (found) {
                  found.Duration = found.Duration + event.Duration;
                } else {
                  var structureTemp = _.find(dep.EventDistributionStructure, { ID: event.EventDistributionID });
                  allData.push({
                    ID: event.EventDistributionID,
                    Duration: event.Duration,
                    Color: event.Color,
                    Name: event.Name,
                    color: event.EventDistributionID,
                    order: structureTemp.DisplayOrder,
                  });
                }
              }
            }
          }
        }
      }

      $scope.total = 0;
      allData.forEach(function (status, i) {
        status.value = status.MachineCount || status.Duration;
        if (status.value > 0 && !status.fake) {
          $scope.total += status.value;
        }
      });

      if ($scope.type == "shift") {
        allData = _.sortBy(allData, function (o) {
          return o.order;
        });
      }

      var tmpTotalPercentage = 0;
      $scope.machinesStatuses = [];
      allData.forEach(function (status, i) {
        if (status.value > 0 && !status.fake) {
          // for last status, we will add remaining percentage to avoice 'numeric analytics greater than 100%'
          if (i == allData.length - 1) {
            if ($scope.type != "shift") {
              $scope.machinesStatuses.push({
                percentage: Math.ceil((status.value / $scope.total) * 100),
                color: status.MachineStatusID,
                color2: status.color,
                icon: shiftService.getStatusIcon(status.MachineStatusID),
                count: status.value,
                MachineStatusID: status.MachineStatusID,
              });
            } else {
              $scope.machinesStatuses.push({
                percentage: Math.ceil((status.value / $scope.total) * 100),
                color: status.Color,
                count: status.value,
                EventDistributionID: status.EventDistributionID,
                Name: status.Name,
                sortColor: status.ID,
                order: status.order,
              });
            }
          } else {
            if ($scope.type != "shift") {
              $scope.machinesStatuses.push({
                percentage: Math.ceil((status.value / $scope.total) * 100),
                color: status.MachineStatusID,
                color2: status.color,
                icon: shiftService.getStatusIcon(status.MachineStatusID),
                count: status.value,
                MachineStatusID: status.MachineStatusID,
              });
            } else {
              $scope.machinesStatuses.push({
                percentage: Math.ceil((status.value / $scope.total) * 100),
                color: status.Color,
                count: status.value,
                EventDistributionID: status.EventDistributionID,
                Name: status.Name,
                sortColor: status.color,
                order: status.order,
              });
            }
          }
          tmpTotalPercentage += Math.ceil((status.value / $scope.total) * 100);
        }
      });

      var totalPercentage = function (depColors) {
        var percentage = 0;

        angular.forEach(depColors, function (item) {
          percentage += item.percentage;
        });

        return percentage;
      };
      var diff = totalPercentage($scope.machinesStatuses) - 100;
      if (diff > 0) {
        var index = -1;
        var max = 0;
        for (var i = 0; i < $scope.machinesStatuses.length; i++) {
          if ($scope.machinesStatuses[i].percentage > max) {
            max = $scope.machinesStatuses[i].percentage;
            index = i;
          }
        }
        $scope.machinesStatuses[index].percentage -= diff;
      }

      if ($scope.type != "shift") {
        var ordering = {};
        var sortOrder = [1, 5, 2, 3, 6, 8, 0, 4, 7];

        for (var i = 0; i < sortOrder.length; i++) ordering[sortOrder[i]] = i;

        $scope.machinesStatuses.sort(function (a, b) {
          if (a.sortColor) {
            return ordering[a.sortColor] - ordering[b.sortColor];
          } else {
            return ordering[a.color] - ordering[b.color];
          }
        });
      }
    };
    $scope.$watch("lastUpdate", function () {
      $scope.updateMachinesStatuses();
    });

    $scope.toggleScreen = function () {
      $scope.allMachinesFullScreen.value = !$scope.allMachinesFullScreen.value;
      $localStorage.allMachinesFullScreen.value = $scope.allMachinesFullScreen.value;
    };


    $scope.gaE = function (pageName, eventName) {
      googleAnalyticsService.gaEvent(pageName, eventName);
    };

    $scope.resetData = false;

    $scope.showOnlyMachineStatus = function (machineStatusId) {
      $scope.updateStatus.func(machineStatusId, machineStatusId == -1 ? true : false);
      if (machineStatusId > -1 && $scope.machineData && $scope.machineData.subMenu && $scope.machineData.subMenu.allMachines) {
        $scope.gaE("All_machine", "bar_filtering");
      }
      if (machineStatusId == -1) {
        $scope.gaE("All_machine", "show_all_machines");
      }
    };

    $scope.machineData.openNewGoalsModal = function (type) {
      switch (type) {
        case "ShiftProgress":
          GoalsService.openOnlineSetTargetsModal($scope);
          break;
        case "onlineTargets":
        case "newTarget":
          GoalsService.openSetTargetsModal($scope, true);
          break;
      }
    };

    $scope.updateStatus = {
      func: function () {
        console.log("dummy");
      },
    };

    $scope.sortByData = [
      {
        field: "TimeLeftHR",
        name: $filter("translate")("TIME_LEFT_HOURS"),
      },
      {
        field: "MachineStatusID",
        name: $filter("translate")("STATUS"),
      },
    ];

    $scope.machineData.sort = {
      sortAsc: true,
    };

    $scope.machineData.sort.selectedSortField = $localStorage.sortBy;

    $scope.sortCallBack = function (selected) {
      $localStorage.sortBy = selected;
    };

    $scope.cleanup = function () {
      OnlineService.deleteProductionLines();
    };

    $scope.$on("changeMachinesNumberAndPE", (res,data) => {
     $scope.showMachinePE = true;
     $scope.machinesNumber  = data.machines;
     $scope.departmentsPE = data.PE;
  })

  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      machineData: "=",
      allDepartments: "=",
      pieSizeClass: "=",
      showPencils: "=",
      allMachinesFullScreen: "=",
      type: "=",
      update: "=",
      lastUpdate: "=",
      peData: "=",
      machinesLinesMap: "=",
    },
    controller: controller,
    link: function (scope) {
      scope.$on("$destroy", function () {
        scope.cleanup();
      });
    },
    controllerAs: "allGoalsCtrl",
  };
}

angular.module("LeaderMESfe").directive("allGoalsDirective", allGoalsDirective);
