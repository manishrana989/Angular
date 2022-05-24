function checkBoxDirective(LeaderMESservice) {
  var template = "js/components/shared/checkbox/checkbox.html";

  var controller = function ($scope) {
    checkBoxCtrl = this;
    // random number between 1 and 100,000 used for toggle id label, in order to toggle each toggle accordingly to it's input
    $scope.unique = Math.floor(Math.random() * 99999);
  };

  return {
    restrict: "A",
    templateUrl: template,
    scope: {
      fieldTitle: "=",
      field: "=",
      selectValue: "=",
      type: "=",
      ngCustomChange: "=",
      firstParamForCustomChange: "=",
      value: "=",
      disabled: "=",
      newClass: "=",
      checkMarkStyle:"=",
      checkMarkTop:"="
    },
    controller: controller,
    controllerAs: "checkBoxCtrl",
  };
}

angular.module("LeaderMESfe").directive("checkBoxDirective", checkBoxDirective);
