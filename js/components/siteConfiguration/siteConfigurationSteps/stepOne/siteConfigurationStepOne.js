function siteConfigurationStepOne() {

    var controller = function ($scope, LeaderMESservice, customServices, $state) {

        $scope.inputs = {
            factoryName: '',
            industry: '',
            jobTitle: '',
            userName: '',
            password: '',
            firstName: '',
            lastName: '',
            workEmail: '',
            workPhone: '',
            checkbox: false
        }

        $scope.assignCurrentStep = function(step) {
            $scope.step = step;
        }
    };

    return {
        restrict: "EA",
        require: "^siteConfigurationDirective",
        templateUrl: 'js/components/siteConfiguration/siteConfigurationSteps/stepOne/siteConfigurationStepOne.html',
        scope: {
        },
        controller: controller,
        link: function(scope, element, attrs, siteConfigurationCtrl) {
            /**
             * trigger function 'assignCurrentStep' in parent directive
             */
            scope.assignCurrentStep = function(step) {
                siteConfigurationCtrl.assignCurrentStep(2);
            }
        }
    };
}

angular
    .module('LeaderMESfe')
    .directive('siteConfigurationStepOne', siteConfigurationStepOne);