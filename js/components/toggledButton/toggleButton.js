function toggleButton() {

    var controller = function ($scope, LeaderMESservice, customServices, $state) {
        $scope.toggled = $scope.default;
        $scope.uniq = Date.now();
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/toggledButton/toggleButton.html',
        scope: {
            toggled: "=",
            default: "="
        },
        controller: controller,
    
    };
}

angular
    .module('LeaderMESfe')
    .directive('toggleButton', toggleButton);