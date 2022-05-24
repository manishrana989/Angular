function currentShiftPerformance() {
    var template = "views/custom/productionFloor/onlineTab/currentShiftPerformance.html";

    var controller = function ($timeout, $scope, LeaderMESservice, OnlineService,$filter,$localStorage) {
        var currentShiftPerformanceCtrl = this;
        $scope.allMachines = [];
        $scope.rtl = LeaderMESservice.isLanguageRTL()
        $scope.rtl = false; // ltr
        $scope.barData = [];
        $scope.settings =  OnlineService.machineOnlineSettings;

        
      if($localStorage.machineOnlineSettings && $scope.pageType && $localStorage.machineOnlineSettings[$scope.pageType])
      {  
         $scope.settings = $localStorage.machineOnlineSettings[$scope.pageType];
      }
      else
      {
         $scope.settings = angular.copy(OnlineService.machineOnlineSettings);
      }

        $scope.unitsProduced = {
            value: 0,
            id: 'produced',
            color: '#1cb919',
            paramId: {
                currentJob: 'UnitsProducedOKJosh',
                shiftUnitTarget: 'UnitsProducedOKShift',
            },
            name: 'UNITS_PRODUCED',
            percent:10,
            step:10,
        }
        $scope.unitsProducedTheoretically = {
            value: 0,
            color: '#979797',
            paramId: {
                currentJob: 'UnitsProducedTheoreticallyJosh',
                shiftUnitTarget: 'UnitsProducedTheoreticallyShift',
            },
            name: 'UNITS_PRODUCED_THEORETICALLY',
            percent : 10,
            step : 10,
        }
        $scope.unitsTarget = {
            value: 0,
            // color: '#1cb919',
            color: '#dcdcdc',
            paramId: {
                currentJob: 'UnitsTargetJosh',
                shiftUnitTarget: 'UnitsTargetShift',
            },
            name: 'UNITS_TARGET',
            percent:100,
            step:0,
        }
        
        $scope.barData.push($scope.unitsProduced)
        $scope.barData.push($scope.unitsProducedTheoretically)
        $scope.barData.push($scope.unitsTarget)


        $scope.averageBy = {
            currentJob: 'JoshProgressPC',
            shiftUnitTarget: 'ShiftProgressPC'
        };

        $scope.changeBarColor = function () {
            if ($scope.type == 'machine') {
                return
            } else {          
                    $scope.efficiency = Math.min(($scope.unitsProduced.value / $scope.unitsProducedTheoretically.value) * 100, 100);
                    let color = '#b813b0';
                    if ($scope.efficiency >= $scope.settings.percentageColors[0].value) {
                        color = $scope.settings.percentageColors[0].color
                    } else if ($scope.efficiency < $scope.settings.percentageColors[1].value) {
                        color = $scope.settings.percentageColors[1].color
                    } else {
                        color = $scope.settings.percentageColors[2].color
                    }
                    $scope.unitsProduced.color = color                           
            }
        }

        $scope.showTheoreticallyPercentage = function () {
            return $scope.unitsProducedTheoretically.percent - $scope.unitsProduced.percent > 10
        }
        $scope.init = function () {            
            $scope.allMachines = []
            if ($scope.type == "dep") {
                $scope.allMachines = $scope.content.DepartmentsMachine
            } else if ($scope.type == 'machine') {
                $scope.allMachines.push($scope.content)
            } else {
                $scope.allMachines = $scope.content.map(it => it.DepartmentsMachine).flat()
            }
                
            $scope.unitsProduced.value = 0;
            $scope.unitsProducedTheoretically.value = 0;
            $scope.unitsTarget.value = 0;
            let sum = 0
            
            $scope.allMachines.forEach((it) => {
                sum += it[$scope.averageBy[$scope.settings.calculateBy]] || 0;
                $scope.unitsProduced.value += it[$scope.unitsProduced.paramId[$scope.settings.calculateBy]] || 0;
                if (!$scope.theoreticalCustomField || !$scope.theoreticalCustomField[[$scope.unitsProducedTheoretically.paramId[$scope.settings.calculateBy]]]) {
                    $scope.unitsProducedTheoretically.value += it[$scope.unitsProducedTheoretically.paramId[$scope.settings.calculateBy]] || 0;
                }
                else {
                    $scope.unitsProducedTheoretically.value = it[$scope.theoreticalCustomField[[$scope.unitsProducedTheoretically.paramId[$scope.settings.calculateBy]]].FieldName] || 0;
                }
                $scope.unitsTarget.value += it[$scope.unitsTarget.paramId[$scope.settings.calculateBy]] || 0;
            });

            $scope.barDataTotal = 0;

            if ($scope.allMachines.length > 0) {
                ///
                $scope.efficiency = sum / $scope.allMachines.length;

                $scope.changeBarColor();
                $scope.unitsTarget.percent = 100;

                $scope.barDataTotal = $scope.unitsTarget.value;

                $scope.unitsProduced.step = Math.min(($scope.unitsProduced.value / $scope.barDataTotal) * 100, 100);
                $scope.unitsProduced.percent = $scope.unitsProduced.step;
                if( $scope.unitsProduced.percent > 90){
                    $scope.unitValue = 2
                }
                else if($scope.unitsProduced.percent < 10)
                {
                    $scope.unitValue= -1
                }
                else {
                    $scope.unitValue = 0
                }
                $scope.unitsProducedTheoretically.percent = Math.min(($scope.unitsProducedTheoretically.value / $scope.barDataTotal) * 100, 100);
                $scope.unitsProducedTheoretically.step = Math.min($scope.unitsProducedTheoretically.percent - $scope.unitsProduced.step, 100);

                $scope.unitsTarget.step = (100 - Math.max($scope.unitsProducedTheoretically.percent, $scope.unitsProduced.percent));
                $scope.unitsTarget.percent = 100;

            }
        };

        $scope.init();
        if ($scope.type != 'machine') {
            $scope.$watch('settings.percentageColors', (newVal, oldVal) => {
               $scope.changeBarColor();
            }, true);
        }
        $scope.$watch('settings.calculateBy', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                $scope.init();
            }
        });

        $scope.$watch('content', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                 $scope.init();
            }
        }, true);

        $scope.$watch('theoreticalCustomField', (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                $scope.init();
            }
        }, true);

    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            content: '=',
            type: '=',
            machineColor: '=',
            theoreticalCustomField: '=',
            pageType:'='
        },
        controller: controller,
        controllerAs: "currentShiftPerformanceCtrl"
    };

}

angular
    .module('LeaderMESfe')
    .directive('currentShiftPerformance', currentShiftPerformance)