var allMachinesDonutDirective = function ($filter, shiftService, LeaderMESservice) {
    var Template = 'views/custom/productionFloor/onlineTab/allMachinesDonut.html';

    return {
        restrict: "EA",
        templateUrl: Template,
        scope: {
            machine: "=",
            options: "=",
            dep: "=",
            type: "=",
            longest: "=",
            showgoals: "=",
            totalParams: "=",
            showPencils: "="
        },
        controller: function ($scope, shiftService, LeaderMESservice, $element, $sessionStorage) {
            var allMachinesDonutCtrl = this;
            $scope.attachTooltip = function (tooltip, selection) {
                selection.filter(function (d) {
                    return !d.data.fake;
                }).on('mouseover', function (d) {
                    var status = ($scope.type == "online" || $scope.type == "target" ? d.data.MachineStatus : d.data.type) || "";
                    var value = ($scope.type == "online" || $scope.type == "target" ? d.data.MachineCount : $filter('displayHoursMinutes')(d.data.duration / 60))
                    tooltip.select('.tooltip-event-name').html($filter('translate')(status.toUpperCase() + '<br>' + value));
                    tooltip.style('display', 'block');
                    tooltip.style('background-color', 'white');
                    tooltip.style('color', 'black');
                    tooltip.style('padding', '5px');
                    tooltip.style('border', '1px solid #555555');
                    tooltip.style('border-radius', '5px');
                    tooltip.style('opacity', 1);
                });

                selection.filter(function (d) {
                    return true;
                }).on('mousemove', function (d) {
                    tooltip.style('top', (d3.event.layerY + 60) + 'px')
                        .style('left', (d3.event.layerX) + 'px');
                });


                selection.filter(function (d) {
                    return true;
                }).on('mouseout', function () {
                    tooltip.style('display', 'none');
                    tooltip.style('opacity', 0);
                });
            }

            $scope.rtl = LeaderMESservice.isLanguageRTL();
            if ($scope.showgoals.value) {
                $scope.donutClass = 'inner-container-pie-goals';
            } else {
                $scope.donutClass = 'inner-container-pie';
            }

            // check if local language
            var isLocal = LeaderMESservice.showLocalLanguage();

            var menuAndSubMenu = LeaderMESservice.getMainMenu();
            $scope.departmentId = $scope.dep.DepartmentID || $scope.dep.ID;
            $scope.productionFloorMenu = _.find(menuAndSubMenu, {
                TopMenuAppPartID: 500
            });
            if ($scope.productionFloorMenu) {
                $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, {
                    SubMenuExtID: $scope.departmentId
                });
            }

            allMachinesDonutCtrl.getTargets = function () {
                LeaderMESservice.customAPI('getTargets', {
                    DepartmentID: $scope.departmentId
                }).then(function (response) {
                    allMachinesDonutCtrl.targets = _.map(response.TargetInfo, function (target) {
                        target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
                        target.TargetValue = (target.TargetValue * 100).toFixed(1);
                        target.ui_name = isLocal ? target.LName : target.EName;
                        return target;
                    });
                    if (!$sessionStorage.targetBarsVisibility) {
                        $sessionStorage.targetBarsVisibility = {};
                    }
                    for (var i = 0; i < allMachinesDonutCtrl.targets.length; i++) {
                        if ($sessionStorage.targetBarsVisibility[allMachinesDonutCtrl.targets[i].Name] === undefined) {
                            $sessionStorage.targetBarsVisibility[allMachinesDonutCtrl.targets[i].Name] = true;
                        }
                    }
                })
            };

            $scope.$on('get-targets', function (event, args) {
                allMachinesDonutCtrl.getTargets();
            });

            // department name            
            $scope.depName = (isLocal ? $scope.dep.DepartmentLname : $scope.dep.DepartmentEname) || $scope.dep.Name;
            // sum of machines

            var donutWidthO = 18;
            var seperatorWP = 10;

            $scope.sumOfMachines = new Number();
            var boxWidth = 150,
                boxHeight = 150;
            // Basic settings
            var width = 150,
                height = 150,
                radiusO = Math.min(width, height) / 2;
            var svgIcons = d3.select($element[0]).select('.ibox .ibox-content .svg-put svg .icons-pies');
            var iconsHorWidth = 150;
            var svgIconsHor = d3.select($element[0]).select('.ibox .ibox-content svg .icons-pies-hor');

            var svgIconsHorSVG = d3.select($element[0]).select('.ibox .ibox-content svg');
            // Append the svg
            var svgDonut = d3.select($element[0]).select('.ibox .ibox-content .svg-put svg .ref-cur-pie')
                .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");

            var svgDonutO = svgDonut.select(".cur-pie");

            // Define the arc and pie
            var arcDonutO = d3.svg.arc()
                .innerRadius(radiusO - donutWidthO)
                .outerRadius(radiusO);

            var pie = d3.layout.pie()
                .value(function (d) {
                    if ($scope.type == "online" || $scope.type == "target") {
                        return d.MachineCount;
                    } else if ($scope.type == "shift") {
                        return d.duration;
                    }
                })
                .sort(null);

            var allData = [];
            $scope.allMachines = 0;
            $scope.machinesInProduction = 0;
            if ($scope.type == "online" || $scope.type == "target") {
                allData = $scope.dep.MachineSummeryForDepartment;
                for (var i = 0; i < allData.length; i++) {
                    $scope.allMachines += allData[i].MachineCount;
                }
                for (var i = 0; i < $scope.dep.DepartmentsMachine.length; i++) {
                    if ($scope.dep.DepartmentsMachine[i].ProductionModeID == 1) {
                        $scope.machinesInProduction++;
                    }
                }
            } else if ($scope.type == "shift") {
                var allMachinesEvents = [];
                $scope.allMachines += $scope.dep.CurrentShift[0].Machines.length;
                for (var i = 0; i < $scope.dep.CurrentShift[0].Machines.length; i++) {
                    var machine = $scope.dep.CurrentShift[0].Machines[i];
                    allMachinesEvents = allMachinesEvents.concat(machine.Events);
                }
                var allMachinesEventsByStatus = _.map(_.groupBy(allMachinesEvents, 'EventDistributionID'), function (events, key) {
                    var structureTemp = _.find($scope.dep.EventDistributionStructure, {
                        "ID": events[0].EventDistributionID
                    });
                    return {
                        type: $filter('translate')($filter('convertToTranslatePlaceholder')(events[0].Name)),
                        color: events && events.length && events.length > 0 && events[0].Color,
                        MachineStatusID: events && events.length && events.length > 0 && events[0].EventDistributionID,
                        duration: _.reduce(events, function (total, event) {
                            return total + event.Duration;
                        }, 0),
                        order: structureTemp.DisplayOrder
                    }
                });
                _.remove(allMachinesEventsByStatus, {
                    duration: 0
                });
                allMachinesEventsByStatus = _.sortBy(allMachinesEventsByStatus, function (o) {
                    return o.order;
                });
                allData = allMachinesEventsByStatus;
            }

            var dataSum = 0;
            //append status
            $scope.appendData = function () {
                var numOfIcons = allData.length;
                var iconWidth = iconsHorWidth / (numOfIcons - 1);
                allData.forEach(function (status, i) {
                    status.class = "allMachines progress-bar-" + status.MachineStatusID;
                    var origValue = $scope.type == "online" || $scope.type == "target" ? status.MachineCount : status.duration;
                    var tempValue = origValue;
                    if ($scope.type == "shift") {
                        tempValue = $filter('displayHoursMinutes')(origValue / 60);
                    }

                    var thresh = 0.5;
                    if (i == 0) {
                        thresh = 0;
                    }
                    if (i == numOfIcons - 1) {
                        thresh = 1;
                    }
                    var groupSvgHor;
                    var iconAndTextWidth = 60;
                    var startingPoint = (300 - (allData.length * iconAndTextWidth)) / 2;
                    switch (allData.length) {
                        default:
                            groupSvgHor = svgIconsHor.append("g").attr("class", "groupDonutHor").attr("transform", "translate(" + ((i * iconAndTextWidth) + startingPoint) + ", " + (190 + 40 * (parseInt(i / 4))) + ")");
                    }


                    groupSvgHor.append("svg:image")
                        .attr("xlink:href", "images/icons_20x20/" + shiftService.getMachineStatusIcon(status.MachineStatusID))
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr("y", 10)
                        .attr("x", 10)
                        .attr("class", status.class);
                    groupSvgHor.append("text")
                        .attr("x", 31)
                        .attr("y", 25).attr("class", status.class)
                        .text(function (d) {
                            return tempValue
                        });
                    dataSum += origValue;

                    svgIcons.append("text")
                        .attr("x", $scope.rtl ? 50 : -50)
                        .attr("direction", $scope.rtl ? "rtl" : "ltr")
                        .attr("y", (25 * (i) + 17)).attr("fill", status.color)
                        .text(function (d) {
                            return tempValue
                        });

                    svgIcons.append("circle")
                        .attr("direction", $scope.rtl ? "rtl" : "ltr")
                        .attr("cx", $scope.rtl ? -10 : 10)
                        .attr("cy", (25 * (i) + 12.5))
                        .attr("r", 10)
                        .attr("fill", status.color);

                    svgIcons.append("text")
                        .attr("direction", $scope.rtl ? "rtl" : "ltr")
                        .attr("x", $scope.rtl ? -25 : 25)
                        .attr("y", (25 * (i) + 15))
                        .attr("fill", status.color)
                        .attr("class", "custom-svg-text")
                        .text(function (d) {
                            return ($filter('svgTextWrap')(status.type, 30))
                        });

                });
            }
            $scope.appendData();

            $scope.dataSum = dataSum;

            // Define the path for svg > g
            var j = 0;
            var spaceSize = dataSum / 100;
            var dataLength = allData.length;
            for (var i = 0; i < dataLength; i++) {
                allData[i].order = j;
                allData.push({
                    duration: spaceSize,
                    MachineCount: spaceSize,
                    order: j + 1,
                    class: 'allMachines default',
                    fake: true
                });
                j += 2;
            }

            allData = _.sortBy(allData, function (d) {
                return d.order;
            });
            var pathDonutO = svgDonutO.selectAll("path")
                .data(pie(allData))
                .enter()
                .append("path")
                .attr("d", arcDonutO).attr("y", 60)
                .attr("class", function (d, i) {
                    if ($scope.type == "shift") {
                        return "";
                    }
                    return d.data.class;
                })
                .attr("fill", function (d, i) {
                    if ($scope.type == "online" || $scope.type == "target") {
                        return "";
                    }
                    if (d.data.fake) {
                        return "white";
                    }
                    return d.data.color;
                })
                .each(function (d) {
                    this._current = d;
                });
            var tooltip = d3.select($element[0]).select('.tooltip');
            $scope.attachTooltip(tooltip, pathDonutO);


        },
        controllerAs: 'allMachinesDonutCtrl'
    };
};


angular
    .module('LeaderMESfe')
    .directive('allMachinesDonutDirective', allMachinesDonutDirective);