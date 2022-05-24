
const injectionTargetDirective = function (LeaderMESservice) {
    var template = "views/common/injection-target.html";

    var controller = ['$scope', function ($scope, $element) {
        $scope.width = 100;
        // if (LeaderMESservice.isLanguageRTL()) {
        //     $scope.alignment = 'right';
        // } else {
        $scope.alignment = 'left';
        //}

        LeaderMESservice.getProductionProgressColorDefinitionData().then(function (data) {
            $scope.moreThan = _.find(data,{Name: 'moreThan'}) || {
                ColorID: 'rgb(26, 169, 23)',
                Pc: 50,
            };
            $scope.lessThan = _.find(data,{Name: 'LessThen'}) || {
                ColorID: '#ecd21e',
                Pc: 30,
            };
            $scope.else = _.find(data,{Name: 'else'}) || {
                ColorID: '#fba30c',
                Pc: 0,
            };
            $scope.calculate();
        });
        $scope.calculate = function () {
            if (!$scope.moreThan){
                return;
            }
            $scope.barWidth = $scope.width;
            // calc values
            $scope.greenWidth = ($scope.current / ($scope.max - $scope.min)) * $scope.width;
            $scope.grayWidth = ($scope.target / ($scope.max - $scope.min)) * $scope.width;
            //if the currently made products dont reach 80% of the *theoritical target and are less than the target (max), indicate color the bar yellow. uninitilized elsewhere because undefined behavior sufficies
            // if($scope.target * 0.8 > $scope.current && $scope.current < $scope.max ){
            //     $scope.yellow = true;
            // }
            if ($scope.current >= ($scope.moreThan.Pc / 100) * $scope.target) { 
                $scope.color = $scope.moreThan.ColorID;
            }
            else if ($scope.current <= ($scope.lessThan.Pc / 100) * $scope.target) {
                $scope.color = $scope.lessThan.ColorID;
            } 
            else{ 
                $scope.color = $scope.else.ColorID; 
            }
            
            if ($scope.greenWidth > 100) {
                $scope.greenWidth = 105
            }
            if ($scope.grayWidth > 100) {
                $scope.grayWidth = 105
            }
            if ($scope.greenWidth < 0) {
                $scope.greenWidth = 0
            }
            if ($scope.grayWidth < 0) {
                $scope.grayWidth = 0
            }
            //check if should hide target value, in case it is very close to current value
            $scope.hiddenTargetVal = Math.abs(($scope.grayWidth - $scope.greenWidth)) < 12 ? true : false;
        }
    }];

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            max: "=",
            current: "=",
            target: "=",
            min: "="
        },
        link: function (scope, elem, attr, ngModel) {
            const that = scope;
            scope.$watch("current", function (newValue, oldValue) {
                scope.current = newValue;
                scope.calculate(scope, elem);
            });
            scope.calculate(scope, elem);
        },
        controller: controller,
        controllerAs: 'injectionTarget'
    };
}

angular.module('LeaderMESfe')
    .directive('injectionTargetDirective', injectionTargetDirective)