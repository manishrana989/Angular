function insightDirective() {
  var template = "views/custom/productionFloor/common/insight.html";

  var controller = function ($scope, insightService, $sessionStorage, googleAnalyticsService, $timeout) {
    $scope.pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
    $scope.insightContainerLoading = insightService.loadingContainers
    if ($scope.pageID === 0) {
      googleAnalyticsService.gaPV("factory_view_Insights");
    }
    else {
      googleAnalyticsService.gaPV("Department_Insights");
    }
    $timeout(() => {
      $scope.insightData = insightService.insightData;
    }, 1000)
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "insightCtrl",
  };
}

angular.module("LeaderMESfe").directive("insightDirective", insightDirective);
