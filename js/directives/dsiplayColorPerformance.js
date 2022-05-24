function displayColorPerformanceDirective() {
    var template = "views/common/displayColorPerformance.html";

    var controller = function ($scope,shiftService) {
      $scope.isReversed = $scope.reversed
      $scope.percentageColors = [
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

      var getColorPerformance = function(){
        shiftService.getProductionProgressColorDefinition().then((data) => {
          var index;
          _.forEach(data, function (temp) {
            index = _.findIndex($scope.percentageColors, { parameterID: temp.ParameterID });
            if (index > -1) {
              $scope.percentageColors[index].color = temp.ColorID;
              $scope.percentageColors[index].value = parseFloat(temp.Pc.toFixed(2));
              if($scope.graph)
              {
                $scope.graph.options.settings['heatMapColors'] = $scope.percentageColors; 
              }
            }
          });
  
          //change the colors of moreThan and lessThan for this specific insight
          if($scope.isReversed?.value){
            var tempColor,firstColor,secondColor;
            firstColor =  _.find($scope.percentageColors, { parameterID: 1 })
            secondColor = _.find($scope.percentageColors, { parameterID: 2 })
            tempColor = firstColor.color;
            firstColor.color = secondColor.color;
            secondColor.color = tempColor;
          }
        });
      }

      getColorPerformance()


      $scope.$watch("isReversed.value",function(){
        getColorPerformance()
      })
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
        graph:"=",
        reversed:"="
      },
      controller: controller,
      controllerAs: "displayColorPerformanceCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("displayColorPerformanceDirective", displayColorPerformanceDirective);
  