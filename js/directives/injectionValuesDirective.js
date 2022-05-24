
const injectionValuesDirective = function () {
    var template = "views/common/injection-values.html";

    var controller = ['$scope', 'LeaderMESservice', function ($scope, LeaderMESservice) {
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.width = 100;  

        $scope.calculate = function (scope, elem) {
            if (scope.value > scope.max) {
                scope.valuePer = "calc(" + 90 + "%)";
            } else if (scope.value < scope.min) {
                scope.valuePer = "calc(" + 10 + "%)";
            } else {
                scope.valuePer = "calc(" + ((scope.value - scope.min) / (scope.max - scope.min)) * 60 + "% + 20%)";
            }
            if (scope.avg > scope.max) {
                if (scope.value < scope.avg) {
                    scope.avgPer = "calc(" + 90 + "% - 3px)";
                } else {
                    if (scope.value > scope.avg) {
                        scope.avgPer = "calc(" + 90 + "% - 12px)";
                    } else {
                        scope.avgPer = "calc(" + 90 + "% - 8px)";
                    }
                }
            } else if (scope.avg < scope.min) {
                if (scope.value > scope.avg) {
                    scope.avgPer = "calc(" + 10 + "% - 15px)";
                } else {
                    scope.avgPer = "calc(" + 10 + "% - 5px)";
                }
            } else {
                scope.avgPer = "calc(" + ((scope.avg - scope.min) / (scope.max - scope.min)) * 60 + "% + 20% - 8px)"; //added 20 percent which is the edge percentage
            }

            if (scope.standard > scope.max) {
                scope.standardPer = "calc(" + 90 + "% - 5px)";
                ;
            } else if (scope.standard < scope.min) {
                scope.standardPer = "calc(" + 10 + "% - 5px)";
            } else {
                scope.standardPer = "calc(" + ((scope.standard - scope.min) / (scope.max - scope.min)) * 60 + "% + 20% - 5px)";
            }


            elem[0].querySelector('.rectangle').style.left = (scope.valuePer);
            elem[0].querySelector('.current-value').style.left = (scope.valuePer);
            elem[0].querySelector('.current').style.left = "0%";

            if (scope.value && scope.min > scope.value || scope.max < scope.value) {
                elem[0].querySelector('.rectangle').style.backgroundColor = "#c01b29";
                elem[0].querySelector('.current-rectangle').style.backgroundColor = "#c01b29";
                elem[0].querySelector('.current-value').style.color = "#c01b29";
                elem[0].querySelector('.current').style.width = "20%";
                if (scope.max < scope.value) {
                    elem[0].querySelector('.current').style.left = "80%";
                }
            } else if (scope.value) {
                elem[0].querySelector('.rectangle').style.backgroundColor = "#1aa917";

                elem[0].querySelector('.current-rectangle').style.backgroundColor = "#1aa917";

                elem[0].querySelector('.current-value').style.color = "#1aa917";
                elem[0].querySelector('.current-value').style.left = (scope.valuePer);

                elem[0].querySelector('.current').style.width = "60%";
                elem[0].querySelector('.current').style.left = "20%";

                elem[0].querySelector('.rectangle').style.left = (scope.valuePer);

            }

            //sometimes, we dont send standard to the directive, it is null.
            // So this code fails because the DOM with class name 'standard' is not found.
            if (scope.standard)
            {
                elem[0].querySelector('.standard').style.left = scope.avgPer;
                elem[0].querySelector('.standardVal').style.left = scope.standardPer;
            }

            // $scope.hideStandard = false;
            //
            // //check if standard is close to min or max value (range 10% from each)
            // if ((scope.standardPer >= 5 && scope.standardPer <=15) || (scope.standardPer>=85 && scope.standardPer <= 95)) {
            //     $scope.hideStandard = true;
            // }
        }

    }];

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            min: "=",
            max: "=",
            value: "=",
            standard: "=",
            avg: "=",
            showAverage: "="
        },
        link: function (scope, elem, attr, ngModel) {
           

            // const that = scope;
            scope.$watchGroup(["value", "min", "max"], function () {
                
                scope.calculate(scope, elem);
            });

        },
        controller: controller,
        controllerAs: 'injectionValue'
    };
}

angular.module('LeaderMESfe')
    .directive('injectionValuesDirective', injectionValuesDirective)