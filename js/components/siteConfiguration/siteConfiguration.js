function siteConfigurationDirective() {

    var template = 'js/components/siteConfiguration/siteConfiguration.html';

    var controller = function ($scope) {
        var siteConfigurationCtrl = this;
        $scope.currentStep = 1;

        siteConfigurationCtrl.assignCurrentStep = function (stepNumber) {
            $scope.currentStep = stepNumber;
        };

        $scope.assignCurrentStep = function (step) {
            siteConfigurationCtrl.assignCurrentStep(step);
        }

        $scope.steps = [
            {
                number: 1, name: 'PERSONAL_DETAILS'
            },
            {
                number: 2, name: 'SHIFT_CALENDAR'
            },
            {
                number: 3, name: 'FACTORY_DETAILS'
            }
        ];


    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
        },
        controller: controller,
        controllerAs: "siteConfigurationCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('siteConfigurationDirective', siteConfigurationDirective);