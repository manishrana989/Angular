function checkBoxGridTableDirective(LeaderMESservice) {
  var template = "views/custom/productionFloor/common/checkBoxGridTable.html";

  var controller = function ($scope) {

  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      data: "=",
    },
    controller: controller,
    controllerAs: "checkBoxGridTableDirective",
  };
}

angular.module("LeaderMESfe").directive("checkBoxGridTableDirective", checkBoxGridTableDirective);
