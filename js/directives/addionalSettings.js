function addionalSettingsDirective() {
    var template = "views/common/addionalSettings.html";

    var controller = function ($scope,shiftService,$sessionStorage,$localStorage) {
      var addionalSettingsCtrl = this;
      $scope.checkMarkTop = 0.3
      $scope.saveMode = function (property) {
          if(!property) return
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()][property] =  $scope.graph.options.settings[property]
      };
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
          graph:"=",
          showOptions:"="
      },
      controller: controller,
      controllerAs: "addionalSettingsCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("addionalSettingsDirective", addionalSettingsDirective);
  