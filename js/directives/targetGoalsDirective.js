function targetGoalsDirective($window, $timeout) {
    var template = "views/custom/productionFloor/goal/targetGoals.html";

    var controller = function ($scope, LeaderMESservice, $rootScope,$window, $element) {
        $scope.greenArea = parseInt($scope.current) >= parseInt($scope.target);
        $scope.rtl = false

        $scope.parsedTarget = parseInt($scope.target,10);

        // you can write to stdout for debugging purposes, e.g.
        // console.log('this is a debug message');

        // you can write to stdout for debugging purposes, e.g.
        // console.log('this is a debug message');
     
        $scope.updateTargetView = function(){
            $scope.targetData.IsActive = !$scope.targetData.IsActive;
            LeaderMESservice.customAPI('ShowHideTargets',{"TargetName":$scope.targetData.Name,"TargetState":$scope.targetData.IsActive}).then(function(response){
                $rootScope.$broadcast('targetViewChanged',{"TargetName":$scope.targetData.Name,"TargetState":$scope.targetData.IsActive});
            });
        };

        $rootScope.$on('targetViewChanged',function(scope,data){
            if ($scope.targetData.Name == data.TargetName){
                $scope.targetData.IsActive = data.TargetState;
            }
        });

        $scope.calculate = function(resize) {

            $scope.isRtl = false;
            $scope.targetDirection = 'left';
            $scope.currentValAreaDirection = 'left';

            // if ($scope.isRtl) {
            //     $scope.targetDirection = 'right';
            // }                        
            $scope.targetLeftPx = parseFloat($scope.target*0.8) + $scope.edges + "%";

            if ($scope.current >= 0 && $scope.current<=100) {
                // NORMAL SITUATION
                $scope.currentValAreaWidth = $scope.current + '%';
                $scope.currentValLeftPx = 'calc(100% - 25px)';
            } else {
                // CURRENT IS LESS OR GREATER THAN MIN/MAX
                if ($scope.current < 0) {
                     $scope.currentValAreaWidth = '0';
                     $scope.currentValLeftPx = '5px';
                     $scope.currentLeftValue = "-" + $scope.currentValAreaWidth; 
                    //  if ($scope.isRtl) {
                    //      $scope.currentValAreaDirection = 'right';
                    //  }
                } else {
                    $scope.currentValAreaWidth = '100%';
                    $scope.currentValLeftPx = 'calc(100% - 30px)'
                }
            }

            var tmp = 100 - $scope.edges;
            if ($scope.target<=0) {            
                $scope.targetLeftPx= 'calc(' + $scope.edges +'% - 5px)';
            } else if ($scope.target>=100) {
                $scope.targetLeftPx= 'calc(' + tmp +'% - 5px)';
            }
        };

        $scope.updateData = function(resize){
            if ($scope.timeoutcalulcate){
                $timeout.cancel($scope.timeoutcalulcate);
            }
            $scope.timeoutcalulcate = $timeout(function(){
                $scope.calculate(resize);
            },200);
        }

        angular.element($window).bind('resize', function(){
            $scope.updateData(true);
        });

        $scope.$watch('targetData',function(){
            $scope.updateData();
        });

        $scope.calculate();
    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            current: "=",
            target: "=",
            edges: "=",
            name: "@",
            showPencils: "=",
            id: "=",
            showAll: "=",
            targetData : "=",
            boxMode: "=",
            showPercentage: "=",
            hideTarget: "="
        },
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('targetGoalsDirective', targetGoalsDirective);