function legendsDirective(LeaderMESservice) {
    var template = "views/custom/productionFloor/common/legends.html";
  
    var controller = function ($scope) {
      $scope.rtl = LeaderMESservice.isLanguageRTL();
      LeaderMESservice.customAPI('GetMachineStatusDetails',{}).then(function(response){
            $scope.legends = response.MachineStatus
        });

        LeaderMESservice.getProductionProgressColorDefinitionData().then(function (data) {
          $scope.jobProgressLegend = [];
          $scope.jobProgressLegend.push(_.find(data,{Name: 'moreThan'}) || {
              ColorID: '\rgb(26, 169, 23)',
              Pc: 50,
          });
          $scope.jobProgressLegend.push(_.find(data,{Name: 'LessThen'}) || {
              ColorID: '#fba30c',
              Pc: 30,
          });
          $scope.jobProgressLegend.push(_.find(data,{Name: 'else'}) || {
              ColorID: '#ecd21e',
              Pc: 0,
          });
        });

        $scope.machineClassifications = [
          {
            name: 'PRODUCTION_LINES',
            icon: 'images/Line.svg'
          },
          {
            name: 'PERIPHERAL_SYSTEMS',
            icon: 'images/Peripheral systems.svg'
          },
          {
            name: 'SENSOR',
            icon: 'images/Sensor.svg'
          },
          {
            name: 'MANUAL_WORK_STATIONS',
            icon: 'images/Manual work stations.svg'
          }
        ]
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
      },
      controller: controller,    
      controllerAs: "legendsCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("legendsDirective", legendsDirective);
  