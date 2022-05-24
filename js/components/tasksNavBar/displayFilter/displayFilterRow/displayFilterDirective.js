
function displayFilter($compile) {
    var template = "js/components/tasksNavBar/displayFilter/displayFilterRow/displayFilter.html";

    var linker = function (scope, element, attrs) {
            scope.contentUrl = "views/common/displayFilter.html";
    };


    var controller = function ($scope, LeaderMESservice, $modal, $state, commonFunctions) {

        var displayFilter = this;
       

        function init() {
            console.log("init func");
        }

        init();

    };

    return {
        restrict: "E",
        link: linker,
        templateUrl: template,
        scope: {
           
        },
        controller: controller,
        controllerAs: "displayFilter"
    };
}

angular
    .module('LeaderMESfe')
    .directive('displayFilter', displayFilter);