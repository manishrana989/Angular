function machineProgressBar() {

    var controller = function ($scope, LeaderMESservice, $element, $filter) {
      const machineProgressBarCtrl = this;
      machineProgressBarCtrl.unitsProducedOK = null;
      machineProgressBarCtrl.theoreticalUnits = null;
      LeaderMESservice.getProductionProgressColorDefinitionData().then(function (data) {
          $scope.moreThan = _.find(data,{Name: 'moreThan'}) || {
              ColorID: 'rgb(26, 169, 23)',
              Pc: 50,
          };
          $scope.lessThan = _.find(data,{Name: 'LessThen'}) || {
              ColorID: '#fba30c',
              Pc: 30,
          };
          $scope.else = _.find(data,{Name: 'else'}) || {
              ColorID: '#ecd21e',
              Pc: 0,
          };
          $scope.calculate = () => {
            if ($scope.unitsTarget) {
              machineProgressBarCtrl.unitsProducedOK = {
                percentage : Math.min(($scope.unitsProduced / $scope.unitsTarget) * 100, 100) + '%',
              };
    
              machineProgressBarCtrl.theoreticalUnits = {
                percentage : Math.min(($scope.theoreticalUnits / $scope.unitsTarget) * 100, 100) + '%',
              };
              machineProgressBarCtrl.value = (($scope.unitsProduced / $scope.unitsTarget) * 100).toFixed(2);
              if ($scope.unitsProduced >= ($scope.moreThan.Pc / 100) * $scope.unitsTarget) {
                machineProgressBarCtrl.unitsProducedOK.backgroundColor = $scope.moreThan.ColorID;
              }
              else if ($scope.unitsProduced <= ($scope.lessThan.Pc / 100) * $scope.unitsTarget) {
                machineProgressBarCtrl.unitsProducedOK.backgroundColor = $scope.lessThan.ColorID;
              }
              else {
                machineProgressBarCtrl.unitsProducedOK.backgroundColor = $scope.else.ColorID;
              }
            }

            if ($scope.tooltip) {
              $scope.tooltip.dispose();
            }

            tooltipTemplate = 
            `<div>${$filter('translate')('UNITS_THEORETICAL_LOCAL')}: ${$scope.theoreticalUnits}</div>
              <div>${$filter('translate')('UNITS_PRODUCED_OK_LOCAL')}: ${$scope.unitsProduced}</div>
              <div>${$filter('translate')('UNITS_TARGET_LOCAL')}: ${$scope.unitsTarget}</div>`;
            $scope.tooltip = new Tooltip($element, {
              // title: info.event.title,
              title: `<div>
                              <span class="title">
                                ${tooltipTemplate}
                              </span>
                            </div>`,
              placement: 'top',
              trigger: 'hover',
              container: 'body',
              html: true,
            });

          };
          $scope.calculate();
      });

      $scope.$watch('unitsTarget',() => {
        if ($scope.calculate){
          $scope.calculate();
        }
      });
      $scope.$watch('theoreticalUnits',() => {
        if ($scope.calculate){
          $scope.calculate();
        }
      });
      $scope.$watch('unitsProduced',() => {
        if ($scope.calculate){
          $scope.calculate();
        }
      });
    };
  
    return {
      restrict: "A",
      templateUrl: 'js/components/machineProgressBar/machineProgressBar.html',
      scope: {
          unitsTarget: '=',
          theoreticalUnits: '=',
          unitsProduced: '=',
      },
      link: (scope, element, attrs) => {
        scope.$on('$destroy', function() {
          if (scope.tooltip) {
            scope.tooltip.dispose();
          }
        });
      },
      controller: controller,
      controllerAs: 'machineProgressBarCtrl'
    };
  }
  
  angular
    .module('LeaderMESfe')
    .directive('machineProgressBar', machineProgressBar);