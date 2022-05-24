function performedColorDirective(LeaderMESservice) {
  var template = "views/common/performedColor.html";

  var controller = function ($scope,LeaderMESservice,toastr,$filter) {
    var performedColorCtrl = this;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();


    if ($scope.type == 1) {
      performedColorCtrl.percentageColors = [
        {
          parameterID: 1,
          name: "moreThan",
          text: "PERFORMED_MORE_THAN",
          color: "#1cb919",
          value: 100,
          min: 80,
          showEditable: true,
        },
        {
          parameterID: 2,
          name: "LessThen",
          text: "PERFORMED_LESS_THAN",
          color: "#e01521",
          value: 80,
          min: 0,
          max: 100,
          showEditable: true,
        },
        {
          parameterID: 3,
          name: "else",
          text: "ELSE",
          color: "#ecd21e",
          value: 80,
          showEditable: false,
        },
      ];
    } else {
      performedColorCtrl.percentageColors = [
        {
          parameterID: 1,
          name: "moreThan",
          text: "PERFORMANCE_MORETHAN",
          color: "#1cb919",
          value: 100,
          min: 80,
          showEditable: true,
        },
        {
          parameterID: 3,
          name: "else",
          text: "PERFORMANCE_ELSE",
          color: "#ecd21e",
          value: 80,
          showEditable: false,
        },
        {
          parameterID: 2,
          name: "LessThen",
          text: "PERFORMANCE_LESSTHEN",
          color: "#e01521",
          value: 80,
          min: 0,
          max: 100,
          showEditable: true,
        }
      ];
    }

    LeaderMESservice.customAPI("GetProductionProgressColorDefinition", {}).then(function (response) {
      var index;
      
      if (response && response?.ResponseList) {
        _.forEach(response.ResponseList, function (temp) {
          index = _.findIndex($scope.performedColorCtrl.percentageColors, { parameterID: temp.ParameterID });
          if (index > -1) {
            $scope.performedColorCtrl.percentageColors[index].color = temp.ColorID;
            $scope.performedColorCtrl.percentageColors[index].value = parseFloat(temp.Pc.toFixed(2));                
          }
        });
      }
      performedColorCtrl.firstNum =  $scope.localLanguage ? performedColorCtrl.percentageColors[0].value : performedColorCtrl.percentageColors[2].value;
      performedColorCtrl.secondNum =   $scope.localLanguage ? performedColorCtrl.percentageColors[2].value : performedColorCtrl.percentageColors[0].value;
    });

    $scope.saveColorParamsToServer = function () {
      if (performedColorCtrl.percentageColors[0].value <= performedColorCtrl.percentageColors[2].value || performedColorCtrl.percentageColors[0].value > 1000 || performedColorCtrl.percentageColors[2].value < 0) {
        toastr.clear();
        toastr.error("", $filter('translate')('SOMETHING_WENT_WRONG'))
      } else {
        var ObjectColorArray = [];
        performedColorCtrl.percentageColors.forEach(function (temp) {
          ObjectColorArray.push({
            ColorID: temp.color,
            PC: temp.value,
            ParameterID: temp.parameterID,
          });
        });
        LeaderMESservice.customAPI("UpdateProductionProgressColorDefinition", { ProductionColorDefinition: ObjectColorArray }).then(function(){
          toastr.clear();
          toastr.success("", $filter("translate")("SUCCESSFULLY"));
        });
      }
    };
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      type: "=",
    },
    controller: controller,
    controllerAs: "performedColorCtrl",
  };
}

angular.module("LeaderMESfe").directive("performedColorDirective", performedColorDirective);
