function displayTypeInsightDirective() {
    var template = "views/common/displayTypeInsight.html";

    var controller = function ($scope,shiftService,$sessionStorage,$localStorage) {
      var displayTypeInsightCtrl = this;
   
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
         graph:"=",
         showOptions:"=",
      },
      controller: controller,
      controllerAs: "displayTypeInsightCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("displayTypeInsightDirective", displayTypeInsightDirective);
  