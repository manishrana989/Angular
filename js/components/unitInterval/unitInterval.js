angular.module("LeaderMESfe").directive("unitInterval", function () {
  return {
    restrict: "A",
    require: "?ngModel",
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (inputValue) {
        if (inputValue == undefined || inputValue == "") return "";
        var transformedInput = "";
        if (+inputValue <= 1 || +inputValue <= 0) {
          transformedInput = +inputValue;
        }
        if (inputValue == "0.") {
          return inputValue;
        }

        if (transformedInput !== inputValue) {
          modelCtrl.$setViewValue(transformedInput);
          modelCtrl.$render();
        }
        return transformedInput;
      });
    },
  };
});
