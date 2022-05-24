function qcTestView() {

    var template = 'js/components/QCDefinition/qcTestView/qcTestView.html';

    var controller = function ($scope, LeaderMESservice, $timeout) {
        var qcTestsCtrl = this;

        $scope.assignCurrentStep = function (step, test) {
            $scope.step = step;
            $scope.currentTest = test;
        };
        
        $scope.inputs = {
            productTime: '',
            stopTime: '',
            setupEnd: '',
            numberOfCycles: ''
        }
        
    };



    return {
        require: "^qcDefinition",
        restrict: "E",
        templateUrl: template,
        scope: {
            currentTest: "="
        },
        link: function (scope, element, attrs, qcDefinitionCtrl) {
            /**
             * trigger function 'assignCurrentStep' in parent directive
             */
            scope.assignCurrentStep = function (step, test) {
                qcDefinitionCtrl.assignCurrentStep(step, test);
            }
        },
        controller: controller,
        controllerAs: "qcTestViewCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('qcTestView', qcTestView);