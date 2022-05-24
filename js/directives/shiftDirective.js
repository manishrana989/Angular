function shiftDirective($interval, PRODUCTION_FLOOR) {
  var template = "views/custom/productionFloor/common/shift.html";

  var controller = function($scope, shiftService,googleAnalyticsService, $sessionStorage,$rootScope, $timeout) {
    var refreshFunction;
    $scope.sliderShifts = [];
    $scope.slider = shiftService.sliderData;
    $scope.shiftData = shiftService.shiftData;
    if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
      $scope.insightLoading = true;
    }
    $scope.containers = shiftService.containers;
    $rootScope.$on('loadedTemplate', () => {
      $scope.containers = null;
      $timeout(() => {
        $scope.containers = $sessionStorage.containers;
      },200);
    });
    $scope.insightContainers = $sessionStorage.insightContainers;
    $scope.shiftData.selectedTab = 4;
    $scope.shiftData.tab = 4;

    shiftService.updateGraphLines();

    $scope.hideTimeBarShift = $scope.hideTimeBar;
    $scope.sortableOptions = {
      "ui-floating": "auto",
      items: "> div > div > shift-container > div.sortable-item"
    };

    $scope.allowedGraphsForCustomRange = shiftService.allowedGraphsForCustomRange;
    if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
      googleAnalyticsService.gaPV("Department_Insights");
    } else {
      googleAnalyticsService.gaPV("Department_shift");
    }
    var durationObj = shiftService.durationParams('default');

    switch ($scope.shiftData.compareWith) {
      case "prevDay":
        $scope.shiftData.refShiftData = 1;
        break;
      case "prevWeek":
        $scope.shiftData.refShiftData = 7;
        break;
      case "prevMonth":
        $scope.shiftData.refShiftData = 28;
        break;
      case "none":
        $scope.shiftData.refShiftData = 0;
    }
    shiftService.updateData($scope.content.SubMenuExtID, durationObj, false);

    refreshFunction = $interval(function() {
      var durationObj = shiftService.durationParams();
      shiftService.updateData($scope.content.SubMenuExtID, durationObj, true);
      $rootScope.$broadcast("shiftChange", {});
    }, PRODUCTION_FLOOR.DASHBOARD_REFRESH_TIME);

    $scope.$on("$destroy", function() {
      $scope.shiftData.lastHour = false;
      $interval.cancel(refreshFunction);
    });

    // update data when change slider
    shiftService.sliderUpdateDefferd.promise.then(null, null, function() {
      if ($scope.shiftData.selectedTab == 5 && !$scope.shiftData.lastHour) {
        $scope.shiftData.selectedTab = $scope.shiftData.tab;
      }
      if ($scope.shiftData.lastHour && $scope.slider.maxValue - $scope.slider.minValue > 60) {
        $scope.shiftData.lastHour = false;
        $scope.shiftData.selectedTab = $scope.shiftData.dataTimePeriod;
      }
      $scope.shiftData.Machines = shiftService.calcEvents();
      if ($scope.shiftData.data && $scope.slider.minValue && $scope.slider.maxValue) {
        shiftService.updateStopEvents();
      }
      shiftService.getTopRejects();
    });

  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      content: "=",
      duration: "=",
      insightPage: "=",
      insightFactoryPage: "=",
      hideTimeBar: "="
    },
    controller: controller,
    controllerAs: "shiftCtrl"
  };
}

angular.module("LeaderMESfe").directive("shiftDirective", shiftDirective);
