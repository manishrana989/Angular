function onlineTargetsDirective() {
  var template = "views/custom/productionFloor/targetsTab/onlineTargets.html";

  var controller = function ($scope, $modal, LeaderMESservice, AuthService, $interval, PRODUCTION_FLOOR, GoalsService, googleAnalyticsService, $sessionStorage) {
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.locallanguage = LeaderMESservice.showLocalLanguage();
    $scope.lastUpdate = new Date();
    $scope.showPencils = { value: false };
    $scope.factoryName = AuthService.getSiteName();
    googleAnalyticsService.gaPV("Department_target");
    $scope.updateData = function () {
      $scope.lastUpdate = new Date();
      $scope.updateCallback.lastUpdate = $scope.lastUpdate;
      $scope.getTargets();
      $scope.getMachineData();
      $scope.getMachineTargets();
    };

    $scope.updateCallback.updateData = $scope.updateData;
    $scope.updateCallback.lastUpdate = new Date();
    var refreshFunction = $interval(function () {
      $scope.updateData();
    }, $sessionStorage.onlineRefreshTime || PRODUCTION_FLOOR.REFRESH_TIME);
    $scope.$on("$destroy", function () {
      $interval.cancel(refreshFunction);
    });

    $scope.getMachineData = function () {
      LeaderMESservice.customAPI("GetMachineCubeData", { DepartmentID: $scope.content.SubMenuExtID, WithoutMachineParams: true }).then(
        function (response) {
          $scope.allDepartments = response.AllDepartments;
        }
      );
    };

    $scope.getMachineTargets = function () {
      LeaderMESservice.customAPI("GetTargetsForDepartmentMachines", { DepartmentID: $scope.content.SubMenuExtID }).then(function (
        response
      ) {
        $scope.machines = {};
        response.MachineDepartmentActualAndTargetData.forEach(function (machine) {
          $scope.machines[machine.Key] = _.map(machine.Value, function (target) {
            target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
            target.TargetValue = (target.TargetValue * 100).toFixed(1);
            // target.ui_name = $scope.rtl ? target.LName : target.EName;
            target.ui_name = target.LName;
            return target;
          });
        });
      });
    };

    $scope.getTargets = function () {
      LeaderMESservice.customAPI("getTargets", {
        DepartmentID: $scope.content.SubMenuExtID,
      }).then(function (res) {
        $scope.targets = _.map(res.TargetInfo, function (target) {
          target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
          target.TargetValue = (target.TargetValue * 100).toFixed(1);
          // target.ui_name = $scope.rtl ? target.LName : target.EName;
          target.ui_name = target.LName;
          return target;
        });
      });
    };

    $scope.getTargets();
    $scope.getMachineData();
    $scope.getMachineTargets();

    $scope.machineData.openNewGoalsModal = function () {
      GoalsService.openSetTargetsModal($scope, false);
    };
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      content: "=",
      machineData: "=",
      updateCallback: "=",
    },
    controller: controller,
    controllerAs: "onlineTargetsCtrl",
  };
}

angular.module("LeaderMESfe").directive("onlineTargetsDirective", onlineTargetsDirective);
