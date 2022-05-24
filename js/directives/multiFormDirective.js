function multiFormDirective() {

    var controller = function ($scope, $state, LeaderMESservice) {
        $scope.templateUrl = "views/custom/multiForm/multiFormReact.html";

        
        function init() {
            console.log("CONTENT", $scope.content);
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.showBreadCrumb = true;
            if ($state.current.name == "multiformsFullView"){
                $scope.showBreadCrumb = false;
            }
            if ($scope.localLanguage)
                $scope.topPageTitle = $scope.content.SubMenuLName;
            else
                $scope.topPageTitle = $scope.content.SubMenuEName;

        }
        init();
    }

    return {
        restrict: "E",
        template: '<ng-include src="templateUrl"></ng-include>',
        scope: {
            content: '='
        },
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('multiFormDirective', multiFormDirective);