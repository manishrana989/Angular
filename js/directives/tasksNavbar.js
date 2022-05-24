var tasksNavbar = function($interval) {
    var Template = 'views/common/tasksTopBottomBar.html';

    function controller($scope,$compile,$timeout, LeaderMESservice, 
        notify, actionService, $interval, commonFunctions, $state, $filter,tasksService) {
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.selectedNode = null;
        $scope.changes = [];
        $scope.loadingForm =false;
        $scope.statusClicked = null;
        $scope.settingsData = {}

        // commonFunctions.fieldChanges($scope);
        // var ObjectID = $scope.content.ID;
        // var requestAPI = $scope.requestapi;
        // var requestBody = $scope.requestbody;
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.rtlL = LeaderMESservice.isLanguageRTL();
        $scope.loading = true;

        $scope.closeTasksNavBar=function(){
            $(".topbar-collapse").slideToggle(350);
            $(".cover").fadeToggle(350);
        }
        
    }

    return {
        restrict: "A",
        templateUrl: Template,
        scope: {
            content:'='
        },
        controller: controller
    };
};


angular
    .module('LeaderMESfe')
    .directive('tasksNavbar',  tasksNavbar);