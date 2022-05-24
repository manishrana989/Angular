function passedFailedDirective(LeaderMESservice) {

    var template = 'js/components/shared/passedFailedDirective/passedFailed.html';

    var controller = function ($scope,$sessionStorage) {
        const passedFailedCtrl = this;
        $scope.changeCurrentValue = function(curr)
        {            
            if($scope.disabled)
            {
                return
            }
            $scope.passed.CurrentValue = curr;
        }
    };

    return {
        restrict: "A",
        templateUrl: template,
        scope: {
            disabled: "=",
            passed: "=",           
        },
        controller: controller,
        controllerAs: "passedFailedCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('passedFailedDirective', passedFailedDirective);
