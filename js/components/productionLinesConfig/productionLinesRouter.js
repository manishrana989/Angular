function productionLinesRouter() {
  var template = "js/components/productionLinesConfig/productionLinesRouter.html";

  var controller = function ($scope, LeaderMESservice, $state, BreadCrumbsService, $translate) {
    var productionLinesRouterCtrl = this;
    $scope.currentStep = { value: "production-lines-def" };

    $scope.currentProductionLine = { value: {} };
    $scope.departments = { value: [] };
    $scope.isNewProductionLine = { value: false };
    $scope.refreshTable = { value: false };

    productionLinesRouterCtrl.assignCurrentStep = function (stepNumber, pLine) {
      $scope.currentStep.value = stepNumber;
      $scope.currentProductionLine.value = pLine;
    };

    $scope.assignCurrentStep = function (step, pLine) {
      $scope.currentProductionLine.value = pLine;
      productionLinesRouterCtrl.assignCurrentStep(step, pLine);
    };

    /**
     * Inits BreadCrumbs menu on top
     */
    $scope.initBreadCrumbs = function () {
      productionLinesRouterCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
      productionLinesRouterCtrl.showBreadCrumb = true;
      if ($state.current.name == "customFullView") {
        productionLinesRouterCtrl.showBreadCrumb = false;
      }

      if (productionLinesRouterCtrl.showBreadCrumb) {
        BreadCrumbsService.init();
        if (productionLinesRouterCtrl.localLanguage == true) {
          BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
          BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
          $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
        } else {
          BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
          BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
          $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
        }
      }
    };

    /**
     * State params for the BreadsCrumbs
     */
    $scope.initStateParams = function () {
      if (!$state.params.menuContent) {
        $scope.stateParams = LeaderMESservice.getStateParams();
      } else {
        $scope.stateParams = $state.params.menuContent;
      }
    };

    $scope.init = function () {
      $scope.initStateParams();
      $scope.initBreadCrumbs();
    };

    $scope.getMachineData = function () {
      LeaderMESservice.customAPI("GetMachineCubeData", { DepartmentID: 0, WithoutMachineParams: true }).then(function (response) {
        $scope.allDepartments = response.AllDepartments;
        $scope.allMachines = $scope.allDepartments.map((it) => it.DepartmentsMachine).flat(1);
      });
    };

    $scope.init();
    $scope.getMachineData();
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "productionLinesRouterCtrl",
  };
}

angular.module("LeaderMESfe").directive("productionLinesRouter", productionLinesRouter);
