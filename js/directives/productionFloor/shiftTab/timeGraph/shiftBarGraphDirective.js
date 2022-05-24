var shiftBarGraphDirective = function($filter, $rootScope) {
    var Template = 'views/custom/productionFloor/shiftTab/timeGraph/shiftBarGraph.html';
    
    var prepareData = function(events, duration, numOfShifts){
        var splitW = 0.01;

        if(!events){
            return null;
        }

        var numGroup = _.uniq(_.map(events,function(event){
            return Math.floor(event.Order);
        }));
        var sortedEvents = [];
        var eventsTotal = _.reduce(events,function(total, o){
            o.Duration = o.Duration/numOfShifts;
            total += o.Duration;
            return total;
        },0);

        _.forEach(numGroup, function(n) {
            events.push({
                "Order": n,
                "Color": "White",
                "Duration": duration*splitW,
                "Name": "Padding Event"
            });
        });

        if(eventsTotal < duration){
            events.push({
                "Order": _.max(numGroup) + 2,
                "Color": "white",
                "Duration": duration*splitW,
                "Name": "Padding Event"
            });
            events.push({
                "Order": _.max(numGroup) + 3,
                "Color": "#f3f3f3",
                "Duration": duration - eventsTotal + 1,
                "Name": "Padding Event"
            });
        }


        sortedEvents = _.sortBy(events, function(o) { return o.Order; });

        _.reduce(sortedEvents,function(total, o){
            total += o.Duration;
            o.y=total;
            return total;
        },0);

        return sortedEvents;

    }
    function controller($scope, shiftService){        
        $scope.shiftData = shiftService.shiftData;
        if ($scope.shiftData.customRangeEnabled) {
            var duration = 0;
            for (var  i = 0;i < $scope.machine.Events.length ;i++){
                duration += $scope.machine.Events[i].Duration;
            }
            $scope.barShiftDuration = duration;
            $scope.eventsC = angular.copy($scope.machine.Events);
            $scope.options = $scope.options;
            $scope.eventsC = prepareData($scope.eventsC, duration, 1);
            var machineSortedEvents = _.sortBy($scope.machine.Events, 'EndTime');
            $scope.latestEventDuration = machineSortedEvents[machineSortedEvents.length-1] ? machineSortedEvents[machineSortedEvents.length-1].Duration : -1 ;
        }
        else {
            $scope.eventsC = angular.copy($scope.machine.CurrShift.selectedEvents);
            $scope.eventsR = angular.copy(($scope.machine.RefShift ? $scope.machine.RefShift.selectedEvents : null));
            $scope.machineStatus = angular.copy($scope.machine.CurrShift.MachineStatus);
            var shiftnum = $scope.shiftnum || 1;
            $scope.options = $scope.options;
            $scope.eventsC = prepareData($scope.eventsC, $scope.shiftduration, 1);
            $scope.eventsR = prepareData($scope.eventsR, $scope.shiftduration, shiftnum);
            var machineSortedEvents = _.sortBy($scope.machine.CurrShift.Events, 'EndTime');
            $scope.latestEventDuration = machineSortedEvents[machineSortedEvents.length-1] ? machineSortedEvents[machineSortedEvents.length-1].Duration : -1 ;
        }
    }

    return {
        restrict: "E",
        templateUrl: Template,
        controller: controller,
        controllerAs: 'shiftBarGraphCtrl',
        link: function(scope, element) {
            var tooltip = d3.select(element[0]).select(".tooltip");
            tooltip.style("position","fixed");
            scope.mouseoverHandler = function(data){
                if(data.Name == "Padding Event"){
                    return;
                }
                tooltip.select('.tooltip-event-name').html($filter('translate')(data.Name));
                tooltip.select('.tooltip-event-duration').html($filter('getDurationInHours')(data.Duration));
                tooltip.style('display', 'block');
                tooltip.style('opacity',2);
            };
            scope.mousemoveHandler = function(event, data){
                if(data.Name == "Padding Event"){
                    return;
                }
                tooltip.style('top', (event.clientY *$rootScope.scaleAfterZoom + 20) + 'px')
                .style('left', (event.clientX *$rootScope.scaleAfterZoom -25) + 'px');
            };
            scope.mouseleaveHandler = function(data){
                if(data.Name == "Padding Event"){
                    return;
                }
                tooltip.style('display', 'none');
                tooltip.style('opacity',0);
            };
        },
        scope: {
            machine: "=",
            shiftduration: "=",
            machinestatus: "=",
            shiftnum: "=",
            options: "="
        }
    };
};


angular
    .module('LeaderMESfe')
    .directive('shiftBarGraphDirective',  shiftBarGraphDirective);