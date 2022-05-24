function listCheckMarksDirective() {
    var template = "views/common/listCheckMarks.html";

    var controller = function ($scope,shiftService,$sessionStorage,$localStorage) {
      var listCheckMarksCtrl = this;
        listCheckMarksCtrl.customChangeChild = function(){
            $scope.customChange && $scope.customChange()
        }
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
          list:"=",
          name:"=",
          value:"=",
          customChange:"&?"
      },
      controller: controller,
      controllerAs: "listCheckMarksCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("listCheckMarksDirective", listCheckMarksDirective);
  