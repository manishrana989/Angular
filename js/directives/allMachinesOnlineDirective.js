function allMachinesOnlineDirective($sessionStorage, $interval, LeaderMESservice, PRODUCTION_FLOOR, notify, shiftService, googleAnalyticsService, $filter, $localStorage, OnlineService,$timeout) {
  var template = "views/custom/productionFloor/common/allMachinesOnline.html";

  var controller = function ($scope, shiftService) {
    var allMachinesOnlineCtrl = this;
    allMachinesOnlineCtrl.HasPermission = false;
    if ($scope.type == "target" || $scope.type == "online" || ($scope.type == "ShiftProgress" && $scope.content.SubMenuAppPartID !== 540)) {
      LeaderMESservice.customAPI("CheckUserEditCubePermission", {}).then(function (response) {
        allMachinesOnlineCtrl.HasPermission = true;
        $scope.machineOnlineSettings.HasPermission = allMachinesOnlineCtrl.HasPermission;
      });
    }
    if ($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type] && (OnlineService.newVersion == $localStorage.onlineServiceVersion[$scope.type])) {
      $scope.machineOnlineSettings = $localStorage.machineOnlineSettings[$scope.type];
    } else {
      $scope.machineOnlineSettings = angular.copy(OnlineService.machineOnlineSettings);
      if (!$localStorage.machineOnlineSettings) {
        $localStorage.machineOnlineSettings = {};
      }
      $localStorage.machineOnlineSettings[$scope.type] = $scope.machineOnlineSettings;
      $localStorage.onlineServiceVersion[$scope.type] = OnlineService.newVersion
    }
    $scope.machineOnlineSettings.HasPermission = allMachinesOnlineCtrl.HasPermission;
    
    $scope.rtl = LeaderMESservice.isLanguageRTL() ? "rtl" : "ltr";
    // Refresh function
    $scope.machinesLinesMap = null;
    LeaderMESservice.customAPI("GetLinesMachines", {}).then(function (response) {
      let machinesLines = response.LinesMachines.map((it) => {
        it.Key.pipline = it.Value;
        return { [it.Key.ID]: it.Key };
      });
      $scope.machinesLinesMap = Object.assign({}, ...machinesLines);
    });

    if ($scope.machineData.isPie) {
      if ($scope.type == "online") {
        googleAnalyticsService.gaPV("facory_view_online");
      } else if ($scope.type == "shift") {
        googleAnalyticsService.gaPV("facory_view_shift");
      } else if ($scope.type == "target") {
        // $scope.type = "online";
        // $scope.machineData.showGoals.value = true;
        googleAnalyticsService.gaPV("facory_view_target");
      }
    } else {
      if ($scope.type == "online") {
        googleAnalyticsService.gaPV("All_machine_online");
      } else if ($scope.type == "ShiftProgress") {
        googleAnalyticsService.gaPV("production_progress");
      }
    }

    if ($sessionStorage.activePie) {
      switch ($sessionStorage.activePie) {
        case "x1":
          $scope.pieSizeClass = {
            value: "small-circle",
          };
          break;
        case "x2":
          $scope.pieSizeClass = {
            value: "medium-circle",
          };
          break;
        case "x3":
          $scope.pieSizeClass = {
            value: "big-circle",
          };
          break;
        case "x1-rec":
          $scope.pieSizeClass = {
            value: "small-circle rec",
          };
          break;
        case "x2-rec":
          $scope.pieSizeClass = {
            value: "medium-circle rec",
          };
          break;
        case "x3-rec":
          $scope.pieSizeClass = {
            value: "big-circle rec",
          };
          break;
      }
    } else {
      $scope.pieSizeClass = {
        value: "medium-circle",
      };
    }

    allMachinesOnlineCtrl.totalParams = {};
    var refreshFunction = $interval(function () {
      $scope.updateData(0, true);
    }, $sessionStorage.onlineRefreshTime || PRODUCTION_FLOOR.REFRESH_TIME);
    $scope.$on("$destroy", function () {
      $interval.cancel(refreshFunction);
    });
    // Update Data
    var updateData = function (DepartmentID, withoutLoading) {
      if (!withoutLoading) {
        allMachinesOnlineCtrl.dataLoading = true;
      }
      var objParams = {
        DepartmentID: DepartmentID,
        WithoutMachineParams: $scope.type == "target" || $scope.machineData.subMenu.SubMenuAppPartID == -2 ? true : undefined,
      };
      if (DepartmentID == 0 && $scope.machineData.subMenu.SubMenuAppPartID != -1) {
        objParams.WithoutMachineParams = true;
      }
      if ($scope.type == "online" || $scope.type == "ShiftProgress" || $scope.type == "target") {
        const promises = [];
        promises.push(LeaderMESservice.customAPI("GetMachineCubeData", objParams));
        promises.push(LeaderMESservice.customAPI("GetJobCustomParameters", {}));
        Promise.all(promises).then(handleOnlineResponse);
      } else if ($scope.type == "shift") {
        LeaderMESservice.customAPI("GetDepartmentShiftData", {
          ReqDepartment: [objParams],
        }).then(handleShiftResponse);
      }
      if (($scope.type == "online" || $scope.type == "ShiftProgress" || $scope.type == "shift") && $scope.content.SubMenuAppPartID == 540) {
        LeaderMESservice.customGetAPI("GetDepartmentsTotalParams").then(function (response) {
          var events = _.groupBy(response.DepartmentEvents, "Key");
          for (var key in events) {
            events[key] = events[key][0].Value[0];
          }

          var jobs = _.groupBy(response.DepartmentJobs, "Key");
          for (var key in jobs) {
            jobs[key] = jobs[key][0];
          }

          var rejects = _.groupBy(response.DepartmentRejects, "Key");
          for (var key in rejects) {
            rejects[key] = rejects[key][0];
          }

          allMachinesOnlineCtrl.totalParams.events = events;
          allMachinesOnlineCtrl.totalParams.jobs = jobs;
          allMachinesOnlineCtrl.totalParams.rejects = rejects;
        });
      }
    };
    // Handle Response
    var handleOnlineResponse = function (res) {
      const response = res[0];
      const customParams = res[1] && res[1].JobParams || [];
      const jobCustomParams = response.JobCustomParameters || [];
      $scope.lastUpdate = new Date();
      $scope.updateCallback.lastUpdate = $scope.lastUpdate;
      $timeout(function(){
        allMachinesOnlineCtrl.dataLoading = false;
      })
      if (response.error) {
        notify({
          message: response.error,
          classes: "alert-danger",
          templateUrl: "views/common/notify.html",
        });
        return;
      }
      if (!response.AllDepartments || response.AllDepartments.length < 1) {
        notify({
          message: $filter("translate")("THERE_ARE_NO_DATA_TO_DISPLAY"),
          classes: "alert-danger",
          templateUrl: "views/common/notify.html",
        });
        return;
      }
      $scope.peData = response.PEE;
      const machineCustomParams = [];
          customParams.forEach(customParam => {
            machineCustomParams.push({
              CollapseMachineParamsDisplayOrder: null,
              CurrentValue: null,
              DisplayType: "text",
              FieldEName: customParam.DisplayName,
              FieldLName: customParam.DisplayName,
              FieldName: customParam.Name,
              HasGraph: false,
              HighLimit: 0,
              LowLimit: 0,
              StandardValue: null,
              isDefaultMobile: false,
              isOutOfRange: false,
            })
          });
      if (!$scope.data) {
        $scope.data = response.AllDepartments;
        for (var i = 0; i < $scope.data.length; i++) {
          const dep = $scope.data[i];
          for (var j = 0; j < dep.DepartmentsMachine.length; j++) {
            const machine = dep.DepartmentsMachine[j];
            machine.MachineParams = machine.MachineParams.concat(angular.copy(machineCustomParams));
            const jobCustomParam = _.find(jobCustomParams,{JobID: machine.JobID});
            if (jobCustomParam){ 
              for(let key in jobCustomParam) {
                if (key === 'JobID'){
                  continue;
                }
                const customParam = _.find(machine.MachineParams, {FieldName : key});
                if (customParam){
                  customParam.CurrentValue = jobCustomParam[key];
                }
              }
            }
          }
        }
      } else {
        for (var i = 0; i < $scope.data.length; i++) {
          var dep = _.find(response.AllDepartments, { DepartmentID: $scope.data[i].DepartmentID });
          if (dep) {
            $scope.data[i].DepartmentOEE = dep.DepartmentOEE;
            $scope.data[i].DepartmentPEE = dep.DepartmentPEE;
            for (var j = 0; j < dep.DepartmentsMachine.length; j++) {
              var machinePrev = _.find($scope.data[i].DepartmentsMachine, { MachineID: dep.DepartmentsMachine[j].MachineID });
              if (machinePrev) {
                dep.DepartmentsMachine[j] = Object.assign(machinePrev, dep.DepartmentsMachine[j]);
                const machine = dep.DepartmentsMachine[j];
                machine.MachineParams = machine.MachineParams.concat(angular.copy(machineCustomParams));
                const jobCustomParam = _.find(jobCustomParams,{JobID: machine.JobID});
                if (jobCustomParam){ 
                  for(let key in jobCustomParam) {
                    if (key === 'JobID'){
                      continue;
                    }
                    const customParam = _.find(machine.MachineParams, {FieldName : key});
                    if (customParam){
                      customParam.CurrentValue = jobCustomParam[key];
                    }
                  }
                }
              }
            }
            $scope.data[i].DepartmentsMachine = dep.DepartmentsMachine;
            $scope.data[i].DepartmentsMachine = Object.assign($scope.data[i].DepartmentsMachine, dep.DepartmentsMachine);
            $scope.data[i].IsFixedTarget = dep.IsFixedTarget;
            $scope.data[i].MachineSummeryForDepartment = dep.MachineSummeryForDepartment;
            $scope.data[i].RTOnline = dep.RTOnline;
            $scope.data[i].ShiftStartTime = dep.ShiftStartTime;
            $scope.data[i].departmentParamaters = dep.departmentParamaters;
            $scope.data[i].ShiftName = dep.ShiftName;
          }
        }
      }
      $scope.$on("hasFilter", function (event, hasFiltering) {
        $scope.hasFiltering = hasFiltering;
      });
      var menuAndSubMenu = LeaderMESservice.getMainMenu();
      $scope.data = _.filter($scope.data,(dep) => {
        const productionFloorMenu = _.find(menuAndSubMenu, {
            TopMenuAppPartID: 500
        });
        if (productionFloorMenu) {
            if (_.findIndex(productionFloorMenu.subMenu, {SubMenuExtID: dep.DepartmentID}) >= 0){
              return true;
            }
        }
        return false;
      });


      $scope.data.forEach((it) => {
        it.DepartmentsMachine.forEach((machine) => {
          if (_.findIndex(machine.MachineParams, { FieldName: "productName" }) < 0) {
            machine.MachineParams.unshift({
              FieldName: "productName",
              FieldEName: $filter("translate")("PRODUCT_NAME"),
              FieldLName: $filter("translate")("PRODUCT_NAME"),
              CurrentValue: $scope.rtl === "rtl" ? machine.ProductLName : machine.ProductEName,
            });
          }
          if ($scope.localLanguage) {
            machine.MachineParams = _.sortByOrder(machine.MachineParams, ["FieldLName"]);
          } else {
            machine.MachineParams = _.sortByOrder(machine.MachineParams, ["FieldEName"]);
          }
          if (_.findIndex(machine.MachineParams, { FieldName: "removeParam" }) < 0) {
            machine.MachineParams.unshift({
              FieldName: "removeParam",
              FieldEName: $filter("translate")("REMOVE_PARAM"),
              FieldLName: $filter("translate")("REMOVE_PARAM"),
              CurrentValue: "",
            });
          }
        });
      });

      $scope.longest = 0;
      angular.forEach($scope.data, function (i) {
        for (var k = 0; k < i.MachineSummeryForDepartment.length; k++) {
          if (i.MachineSummeryForDepartment[k].MachineCount > $scope.longest) {
            $scope.longest = i.MachineSummeryForDepartment[k].MachineCount;
          }
        }
      });
    };

    var handleShiftResponse = function (response) {
      $scope.lastUpdate = new Date();
      $scope.updateCallback.lastUpdate = $scope.lastUpdate;
      $timeout(function(){
        allMachinesOnlineCtrl.dataLoading = false;
      })
      if (response.error) {
        notify({
          message: response.error,
          classes: "alert-danger",
          templateUrl: "views/common/notify.html",
        });
        return;
      }
      if (!response.Departments || response.Departments.length < 1) {
        notify({
          message: $filter("translate")("THERE_ARE_NO_DATA_TO_DISPLAY"),
          classes: "alert-danger",
          templateUrl: "views/common/notify.html",
        });
        return;
      }

      var menuAndSubMenu = LeaderMESservice.getMainMenu();
      $scope.data = _.filter(response.Departments,(dep) => {
        const productionFloorMenu = _.find(menuAndSubMenu, {
            TopMenuAppPartID: 500
        });
        if (productionFloorMenu) {
            if (_.findIndex(productionFloorMenu.subMenu, {SubMenuExtID: dep.ID}) >= 0){
              return true;
            }
        }
        return false;
      });
    };
    updateData(0, false);
    $scope.updateData = function () {
      updateData(0, true);
    };

    $scope.updateCallback.updateData = $scope.updateData;
    $scope.updateCallback.lastUpdate = new Date();

    //options
    $scope.containerOptions = {
      defaultGraph: "pie",
      width: 12,
      disableBar: false,
      disablePie: false,
      disableExport: false,
      height: 500,
      selectedGraph: "pie",
      tableSelected: false,
      printDiv: "printDiv",
      header: null,
      disableClose: true,
      disableTable: false,
      rotateBar: false,
      rotateH: false,
      legend: false,
    };

    $scope.$watch("data[0].DepartmentsMachine[5].MachineParams", (newVal, oldVal) => {
      if (_.findIndex(newVal, { FieldName: "Rejects Total" }) >= 0) {
      }
    });
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      content: "=",
      type: "=",
      machineData: "=",
      showGoals: "=",
      updateCallback: "=",
      isDefaultStructure:"="
    },
    controller: controller,
    controllerAs: "allMachinesOnlineCtrl",
  };
}

angular.module("LeaderMESfe").directive("allMachinesOnlineDirective", allMachinesOnlineDirective);
