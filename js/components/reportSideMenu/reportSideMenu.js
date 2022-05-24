function reportSideMenu() {

    var controller = function ($scope, LeaderMESservice, shiftService, configuration, $http,$timeout) {
        $scope.showReport = false;
        $scope.reportClose = function(){
            $scope.showReport = false;
            $scope.translateCalculate = ($scope.rtl ? -1 : 1) * ((LeaderMESservice.convertPxToVW($('.more-options').width())));
        }
        $scope.reportOpen = function(){
            $scope.showReport = true;        
        }            

        $scope.rtl = LeaderMESservice.isLanguageRTL();
 
        $scope.loadStructures = function(){          
            $scope.loaded = true;
            $timeout(function(){
                $scope.translateCalculate = ($scope.rtl ? -1 : 1) * ((LeaderMESservice.convertPxToVW($('.more-options').width())));
            },150);
        }

        $scope.openStructure = function(structure){
            let structureCopy = angular.copy(structure)
            shiftService.loadNewTemplate({containers : structureCopy.containers});
            shiftService.getShiftInsightTitles(structure.containers.data, "shiftInsightGraph")     
        };

        $scope.structures  = [];
        configuration.getSpecific("shiftDashboard","stories")
            .then(function(stories){
                let promiseArray = [];
                stories.forEach(function(storyName){
                    promiseArray.push($http.get(`templates/${storyName}.json`))
                });
                Promise.all(promiseArray)
                    .then(function (dataList) {
                        dataList.forEach(function (data) {
                            $scope.structures.push(data.data);
                        })
                    });
        });
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/reportSideMenu/reportSideMenu.html',
        scope: {
             menuArray: "=",          
        },
        controller: controller,
    
    };
}

angular
    .module('LeaderMESfe')
    .directive('reportSideMenu', reportSideMenu);