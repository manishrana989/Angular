var shiftDonutGraphDirective = function ($filter, shiftService,$rootScope) {
    var Template = 'views/custom/productionFloor/shiftTab/timeGraph/shiftDonutGraph.html';

    var prepareData = function (events, duration, numOfShifts) {

        var eventPaddingNum = 0;
        var splitW = 0.01;
        var numGroup = _.uniq(_.map(events, function (event) {
            return Math.floor(event.Order);
        }));
        if (!events) {
            return null;
        }

        var eventsTotal = _.reduce(events, function (total, o) {
            total += o.Duration / numOfShifts;
            return total;
        }, 0);
        
        if (numGroup && numGroup.length > 0) {
            _.forEach(numGroup, function (n) {
                eventPaddingNum += 1;
                events.push({
                    "Order": n,
                    "Color": "White",
                    "Duration": duration * splitW,
                    "Name": "Padding Event"
                });
            });
        }
        if (eventsTotal < duration) {
            eventPaddingNum += 1;
            events.push({
                "Order": (numGroup.length > 0 ? _.max(numGroup) : 0) + 2,
                "Color": "white",
                "Duration": duration * splitW,
                "Name": "Padding Event"
            });
            events.push({
                "Order": (numGroup.length > 0 ? _.max(numGroup) : 0) + 3,
                "Color": "#f3f3f3",
                "Duration": duration * (1 - splitW * eventPaddingNum) - eventsTotal,
                "Name": "Padding Event"
            });
        }

        return _.sortBy(events, function (o) { return o.Order; });
    }

    var attachTooltip = function (tooltip, selection, options) {
        selection.filter(function (d) {
            return d.data.Name != "Padding Event";
        }).on('mouseover', function (d) {
            tooltip.select('.tooltip-event-name').html($filter('translate')(d.data.Name.replace(/ | /g, "_").toUpperCase()));
            tooltip.select('.tooltip-event-duration').html($filter('getDurationInHoursMinutes')(d.data.Duration));
            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);
        });

        selection.filter(function (d) {
            return (d.data.Name != "Padding Event");
        }).on('mousemove', function (d) {
            if (options.tableSelected) {
                tooltip.style('top', (d3.event.layerY + 80) + 'px')
                    .style('left', (d3.event.layerX + 150) + 'px');
            } else {
                tooltip.style('top', (d3.event.layerY*$rootScope.scaleAfterZoom+20 ) + 'px')
                    .style('left', (d3.event.layerX*$rootScope.scaleAfterZoom+20 ) + 'px');
            }
        });


        selection.filter(function (d) {
            return d.data.Name != "Padding Event";
        }).on('mouseout', function () {
            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });
    }

    return {
        restrict: "E",
        templateUrl: Template,
        scope: {
            machine: "=",
            shiftduration: "=",
            machinestatus: "=",
            scale: "=",
            options: "="
        },
        link: function (scope, element) {
            var donutWidthO = 12;
            var donutWidthI = 10;
            var seperatorWP = 10;
            // Basic settings
            var width = 120,
                height = 90,
                radiusO = Math.min(width, height) / 2,
                radiusI = Math.min(width - donutWidthO - donutWidthI - seperatorWP, height - donutWidthO - donutWidthI - seperatorWP) / 2;
            // Append the svg
            var svgDonut = d3.select(element[0]).select('svg .ref-cur-pie')
                .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
            var svgDonutI = svgDonut.select(".ref-pie");
            var svgDonutO = svgDonut.select(".cur-pie");

            //append status
            if (scope.machinestatus) {
                svgDonut.append("svg:image")
                    .attr("xlink:href", "images/icons_20x20/" + scope.machinestatus.icon)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", 40)
                    .attr("y", -45)
                    .style("fill", scope.machinestatus.Color);
            }


            // Define the arc and pie
            var arcDonutO = d3.svg.arc()
                .innerRadius(radiusO - donutWidthO)
                .outerRadius(radiusO);
            var arcDonutI = d3.svg.arc()
                .innerRadius(radiusI - donutWidthI)
                .outerRadius(radiusI);

            var pie = d3.layout.pie()
                .value(function (d) { return d.Duration; })
                .sort(null);

            // Define the path for svg > g
            var pathDonutO = svgDonutO.selectAll("path")
                .data(pie(scope.eventsC))
                .enter()
                .append("path")
                .attr("d", arcDonutO)
                .attr("fill", function (d, i) { return d.data.Color; })
                .each(function (d) { this._current = d; });
                
            if (scope.eventsR) {
                var pathDonutI = svgDonutI.selectAll("path")
                    .data(pie(scope.eventsR))
                    .enter()
                    .append("path")
                    .attr("d", arcDonutI)
                    .attr("fill", function (d, i) { return d.data.Color; })
                    .each(function (d) { this._current = d; });
            }

            var tooltip = d3.select(element[0]).select(".tooltip");
            //tooltip
            attachTooltip(tooltip, pathDonutO, scope.options);
            if (scope.eventsR) {
                attachTooltip(tooltip, pathDonutI, scope.options);
            }
        },
        controller: function ($scope, shiftService) {
            $scope.eventsC = [];
            $scope.eventsR = [];
            $scope.shiftData = shiftService.shiftData;

            if ($scope.shiftData.customRangeEnabled) {
                var duration = 0;
                for (var  i = 0;i < $scope.machine.Events.length ;i++){
                    duration += $scope.machine.Events[i].Duration;
                }
                $scope.eventsC = angular.copy($scope.machine.Events);
                $scope.options = $scope.options;
                $scope.eventsC = prepareData($scope.eventsC, duration, 1);
            }
            else {
                $scope.eventsC = angular.copy($scope.machine.CurrShift.selectedEvents);
                $scope.eventsR = angular.copy(($scope.machine.RefShift ? $scope.machine.RefShift.selectedEvents : null));
                $scope.machineStatus = angular.copy($scope.machine.CurrShift.MachineStatus);
                $scope.options = $scope.options;
                $scope.eventsC = prepareData($scope.eventsC, $scope.shiftduration, 1);
                $scope.eventsR = prepareData($scope.eventsR, $scope.shiftduration, 1);
                var machineSortedEvents = _.sortBy($scope.machine.CurrShift.Events, 'EndTime');
                $scope.latestEventDuration = machineSortedEvents[machineSortedEvents.length - 1] ? machineSortedEvents[machineSortedEvents.length - 1].Duration : -1;
            }
        },
        controllerAs: 'shiftDonutGraphCtrl'
    };
};


angular
    .module('LeaderMESfe')
    .directive('shiftDonutGraphDirective', shiftDonutGraphDirective);