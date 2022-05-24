var shiftDistributionBarDirective = function($filter, $rootScope) {
    var Template = 'views/custom/productionFloor/shiftTab/Distribution/shiftDistributionBar.html';
    return {
        restrict: "E",
        templateUrl: Template,
        controller: function($scope, $state){
            $scope.openMachine = function(MachineID){
                var url = $state.href('appObjectMachineFullView', {appObjectName : 'MachineScreenEditor',ID : MachineID});
                window.open(url,'Job');
            }
            $scope.darkerColor = function(color){
                return d3.hsl(color).darker(0.8).toString();
            }
        },
        scope: {
            "data": "=",
            "titleText": "=",
            "rotate": "=",
            "compare": "=",
            "scale" : "=",
            "group": "=",
            "timeV": "=",
            "division": "=",
            "height": "="
        },
        link: function(scope, element) {
            var tooltip = d3.select(element[0].closest('shift-distribution-directive')).select(".tooltip");
            tooltip.style("position","fixed");
            scope.mouseoverHandler = function(data){
                tooltip.select('.tooltip-event-name').html(data.key);
                tooltip.select('.tooltip-event-duration').html($filter('getDurationInHoursMinutes')(data.value));
                tooltip.select('.tooltip-event-count').html(data.count +" "+$filter('translate')('STOPS'));
                tooltip.style('display', 'block');
                tooltip.style('opacity',2);
            };
            scope.mousemoveHandler = function(event){
                tooltip.style('top', (event.clientY * $rootScope.scaleAfterZoom + 20) + 'px')
                    .style('left', (event.clientX * $rootScope.scaleAfterZoom - 50) + 'px');
            };
            scope.mouseleaveHandler = function(){
                tooltip.style('display', 'none');
                tooltip.style('opacity',0);
            };
        }
    };
};


angular
    .module('LeaderMESfe')
    .directive('shiftDistributionBarDirective',  shiftDistributionBarDirective); 