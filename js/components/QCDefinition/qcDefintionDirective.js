function qcDefinition() {
  var template = "js/components/QCDefinition/qcDefinition.html";

  var controller = function ($scope, LeaderMESservice, $state, BreadCrumbsService, googleAnalyticsService, $state) {
    var qcDefinitionCtrl = this;

    $scope.currentStep = "qc-tests";

    googleAnalyticsService.gaPV("QC_Module");

    $scope.currentTest = undefined;
    qcDefinitionCtrl.enableSelect = false;

    qcDefinitionCtrl.assignCurrentStep = function (stepNumber, test) {
      if (test == 0 && stepNumber == "add-qc-tests") {
        qcDefinitionCtrl.enableSelect = true;
      } else {
        qcDefinitionCtrl.enableSelect = false;
      }
      $scope.currentStep = stepNumber;
       $scope.currentTest = test;
    };

    $scope.assignCurrentStep = function (step, test) {
      $scope.currentTest = test;
      qcDefinitionCtrl.assignCurrentStep(step, test);
    };

    /**
     * Inits BreadCrumbs menu on top
     */
    $scope.initBreadCrumbs = function () {
      qcDefinitionCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
      qcDefinitionCtrl.showBreadCrumb = true;
      if ($state.current.name == "customFullView") {
        qcDefinitionCtrl.showBreadCrumb = false;
      }

      if (qcDefinitionCtrl.showBreadCrumb) {
        BreadCrumbsService.init();
        if (qcDefinitionCtrl.localLanguage == true) {
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
    if(!qcDefinitionCtrl.selectedGroup)
    {
      qcDefinitionCtrl.selectedGroup = null;
    }
    LeaderMESservice.customAPI("GetTestTypes").then(function (response) {
      qcDefinitionCtrl.groups = response.ResponseList;
    });

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

    $scope.init();


    $scope.$on("add-qc-tests", (test) => {
      qcDefinitionCtrl.enableSelect = true;
      $scope.currentTest = 0
   })
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "qcDefinitionCtrl",
  };
}

angular.module("LeaderMESfe").directive("qcDefinition", qcDefinition);
