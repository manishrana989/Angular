var shiftSliderDirective = function () {
  var Template = "views/custom/productionFloor/shiftTab/shiftSlider.html";

  function controller($scope, shiftService, $filter) {
    $scope.slider = shiftService.sliderData;
    $scope.period = shiftService.period;
    $scope.shiftData = shiftService.shiftData;
    $scope.rtl = false;
    $scope.buttonTitle = $filter("translate")("HIDE_TITLE");
    $scope.showFilterShiftVar = shiftService.showFilterShiftVar;
    $scope.hideClicked = $scope.hideTimeBar;
    $scope.shiftsNames = [];
    $scope.shiftsNames = _.map(
      _.sortBy(shiftService.shiftData.data.CurrentShift, (shift) => {
        return new Date(shift.StartTime);
      }),
      "Name"
    );
  }

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      withoutTicks: "=",
      hideTimeBar: "=",
    },
    controller: controller,
    controllerAs: "shiftSliderCtr",
  };
};

angular.module("LeaderMESfe").directive("shiftSliderDirective", shiftSliderDirective);
