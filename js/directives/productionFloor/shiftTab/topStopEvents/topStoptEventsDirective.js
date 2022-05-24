var topStopEventsDirective = function ($rootScope) {
    var Template = 'views/custom/productionFloor/shiftTab/topStopEvents/topStopEvents.html';

    var controller = function ($scope, shiftService, $element, $filter, $sessionStorage, LeaderMESservice,$timeout) {
        $scope._ = _;
        $scope.shiftData = shiftService.shiftData;
        $scope.tooltipShow = false;
        $scope.tooltipMachines = "";
        $scope.result = null;
        $scope.maxCount = 0;
        $scope.maxDuration = 0;
        $scope.totalDuration = 0;
        $scope.totalCount = 0;
        $scope.totalDurationC = 0;
        $scope.totalCountC = 0;
        $scope.ySimpleTable = []
        $scope.simpleTableName;
        $scope.simpleTableData = []
        $scope.simpleTableDataTest = [];
        $scope.firstLaunch = true;
        for(let i =0; i < $scope.shiftData.stopEventsReasonFilter.length; i++) {
            const event = $scope.shiftData.stopEventsReasonFilter[i];
            if ($scope.options.settings.filterR){
                if ($scope.options.settings.filterR[event.EventReasonID] === undefined){
                    $scope.options.settings.filterR[event.EventReasonID] = true;
                }
            }
        }

        for (prop in $scope.options.settings.filterR) {

            if (prop !== "selectAll" && !$scope.shiftData.stopEventsReasonFilter.find(item => item.EventReasonID == prop)) {
                delete $scope.options.settings.filterR[prop]
            }
        }
        for (prop in $scope.options.settings.filterG) {
            if (prop !== "selectAll" && !$scope.shiftData.stopEventsGroupFilter.find(item => item.EventGroupID == prop)) {
                delete $scope.options.settings.filterG[prop]
            }
        }

        if (!$sessionStorage.topStopFilters) {
            $sessionStorage.topStopFilters = {
                filterR: angular.copy($scope.options.settings.filterR),
                filterG: angular.copy($scope.options.settings.filterG)
            }
        } else {
            $scope.options.settings.filterG = $sessionStorage.topStopFilters.filterG;
            $scope.options.settings.filterR = $sessionStorage.topStopFilters.filterR;
        }



        function hexToRgbA(hex, opacity) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ")";
            }
        }
        var tempDuration;

        var criticalEventsIds = shiftService.criticalEventsIds;
        var data = null;
        var tooltip = d3.select($element[0]).select(".machine-top-event-tooltip");

        $scope.tooltip = function (event, data) {
            $scope.tooltipShow = true;
            tooltip.style("position", "fixed");
            tooltip.select('.tooltip-event-type').html(data.AffectMachineNames);
        };

        $scope.tooltipMove = function (event) {
            tooltip.style('top', (event.clientY * $rootScope.scaleAfterZoom + 20) + 'px')
                .style('left', (event.clientX * $rootScope.scaleAfterZoom - 25) + 'px');
        };

        $scope.tooltipLeave = function () {
            $scope.tooltipShow = false;
        }

        $scope.updateData = function (refreshed) {
    
          
                filterData(refreshed);
                groupData();
                updateTicks();
          
                // if($scope.graph.options.settings.parameter == 1)
                // {
                //     makeTableDataWithGroups()
                // }
                // else
                // {
                //     makeTableData()
                // }
       
        }

        var filterData = function (refreshed) {
            data = null;

            if ($scope.firstLaunch || refreshed) {
                $scope.options.settings.filterG = $sessionStorage.topStopFilters.filterG;
                $scope.options.settings.filterR = $sessionStorage.topStopFilters.filterR;
            } else {
                $sessionStorage.topStopFilters = {
                    filterR: angular.copy($scope.options.settings.filterR),
                    filterG: angular.copy($scope.options.settings.filterG)
                }
            }
            $scope.firstLaunch = false;

            let inFilterList = [];
            // filter by machine  

            if ($scope.shiftData.customRangeEnabled) {
                data = _.filter($scope.shiftData.topStopEventsCustomRange, function (event) {
                    let subMachine = $scope.graph.localMachines.find(machine => machine.ID == event.MachineID);
                    // console.log("subMachine:",subMachine);
                    // return $scope.shiftData.machinesDisplay[event.MachineID] &&
                    return subMachine && subMachine.value &&
                        $scope.options.settings.parameter === 0 && $scope.options.settings.filterR[event.EventReasonID] ||
                        $scope.options.settings.parameter === 1 && $scope.options.settings.filterG[event.EventGroupID];
                });
            } else {
                data = _.filter($scope.shiftData.stopEvents, function (event) {
                    let subMachine = $scope.graph.localMachines.find(machine => machine.ID == event.MachineID);
                    return subMachine && subMachine.value &&
                        $scope.options.settings.parameter === 0 && $scope.options.settings.filterR[event.EventReasonID] ||
                        $scope.options.settings.parameter === 1 && $scope.options.settings.filterG[event.EventGroupID];
                });
            }

            var total = _.reduce(_.map(_.filter(data, function (item) {
                if (item.EventDistributionID === 2 ||
                    item.EventDistributionID === 4 ||
                    item.EventDistributionID === 5 ||
                    item.EventDistributionID === 6) {
                    return true;
                }
                return false;
            }), 'Duration'), function (result, event) {
                return parseInt(event) + parseInt((result || 0));
            })

            // calc critical
            $scope.tables = _.map(criticalEventsIds, function (id) {
                return _.reduce(_.filter(data, function (item) {
                    if (id === 0) {
                        if (item.EventReasonID === 0 && (item.EventDistributionID === 2 || item.EventDistributionID === 5)) {
                            return true;
                        }
                    } else if (id === 18) {
                        if (item.EventDistributionID === 6) {
                            return true;
                        }
                    }
                    return false;
                }), function (result, event) {
                    result["Color"] = event["Color"];
                    result["Duration"] = parseInt(event["Duration"]) + parseInt((result["Duration"] || 0));
                    result["MachineID"] = event["MachineID"];
                    result["MachineName"] = event["MachineName"];
                    result["Name"] = event["EventReason"];
                    result["count"] = (result["count"] || 0) + 1;
                    result["total"] = total;
                    return result;
                }, {});
            });

            //initializing data var for simpleTable directive
            let criticalEventsCopy = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].EventReasonID == criticalEventsIds[0] || data[i].EventReasonID == criticalEventsIds[1]) {
                    let copy = data[i];
                    criticalEventsCopy.push(copy);
                }
            }

            //sum and count total stop events
            $scope.totalDuration = _.reduce(data, function (result, event) {
                return result + event.Duration;
            }, 0);
            $scope.totalCount = data.length;

            $scope.totalDuration = _.reduce(data, function (result, event) {
                return result + event.Duration;
            }, 0);
            var dataC = [];
            if ($scope.shiftData.customRangeEnabled) {
                dataC = data;
            } else {
                dataC = _.filter(data, function (event) {
                    return event.EventDistributionID == 2 || event.EventDistributionID == 5;
                })
            }

            $scope.totalDurationC = _.reduce(dataC, function (result, event) {
                return result + event.Duration;
            }, 0);

            $scope.totalCountC = dataC.length;


            // filter data without critical
            data = _.filter(data, function (event) {
                return _.indexOf(criticalEventsIds, event.EventReasonID) == -1;
            });


            // get Top
            var topStopEvents = _.map(_.groupBy(data, "EventReasonID"), function (value, key) {
                return _.reduce(value, function (result, event) {
                    return {
                        Duration: (parseInt(result["Duration"]) || 0) + parseInt(event["Duration"]),
                        Name: key
                    }
                }, {});
            });

            topStopEvents = _.map(topStopEvents, "Name");
            //filter stop events
            data = _.filter(data, function (event) {
                return _.indexOf(topStopEvents, (event.EventReasonID).toString()) >= 0;
            });


            //simpleTable data initialized
            $scope.dataRawCopy = data.concat(criticalEventsCopy);

            let calcSelectedFiltersCount = function (filterType) {
                let count = 0;
                for (let [key, value] of Object.entries($scope.options.settings[filterType])) {
                    if (key !== 'selectAll') {
                        if (value) {
                            count++;
                        }
                    }
                }
                if (count === Object.entries($scope.options.settings[filterType]).length - 1) {
                    $scope.options.settings[filterType]["selectAll"] = true;
                }
                $sessionStorage.topStopFilters[filterType] = {
                    ...$scope.options.settings[filterType]
                };
                return count;
            };

            calcSelectedFiltersCount("filterR");
            calcSelectedFiltersCount("filterG");
        };

        var groupData = function () {
            var maxDuration = 0;
            var maxCount = 0;
            var firstGroup = $scope.options.settings.groupByEvent ? groupByValue : groupByMachine;
            var secondGroup = $scope.options.settings.groupByEvent ? groupByMachine : groupByValue;
            
            data = _.groupBy(data, firstGroup);
            data = _.map(data, function (events, key) {
                var totalDuration = _.reduce(events, function (result, event) {
                    return result + event.Duration
                }, 0);
                var totalCount = events.length;
                if (totalDuration > maxDuration) {
                    maxDuration = totalDuration;
                }
                if (totalCount > maxCount) {
                    maxCount = totalCount;
                }
                return {
                    totalDuration: totalDuration,
                    totalCount: totalCount,
                    key: $scope.options.settings.groupByEvent ? ($scope.options.settings.parameter ? events[0].EventGroup : events[0].EventReason) : events[0].MachineName,
                    Color: events[0].Color,
                    values: _.map(_.groupBy(events, secondGroup), function (events) {
                        return _.reduce(events, function (result, event) {
                            if ($scope.shiftData.customRangeEnabled) {
                                result["Color"] = event["Color"];
                                result["Duration"] = parseInt(event["Duration"]) + parseInt((result["Duration"] || 0));
                                result["MachineID"] = event["MachineID"];
                                result["MachineName"] = event["MachineName"];
                                result["Name"] = event["EventReason"];
                                result["GroupName"] = event["EventGroup"];
                                result["count"] = (result["count"] || 0) + 1;
                                return result;
                            } else {
                                result["Color"] = event["Color"];
                                result["Duration"] = parseInt(event["Duration"]) + parseInt((result["Duration"] || 0));
                                result["MachineID"] = event["MachineID"];
                                result["MachineName"] = event["MachineName"];
                                result["Name"] = event["EventReason"];
                                result["GroupName"] = event["EventGroup"];
                                result["count"] = (result["count"] || 0) + 1;
                                return result;
                            }
                        }, {})
                    })
                };
            });

            let orderBy = $scope.options.settings.timeV ? 'totalDuration' : 'totalCount'

            data = _.take(_.sortBy(data, function (event) {
                return -event[orderBy];
            }), $scope.options.settings.top);

            $scope.maxCount = maxCount;
            $scope.maxDuration = maxDuration;
           
            $scope.result = data;
        }

        var groupByMachine = function (event) {
            return event.MachineName;
        }

        var groupByValue = function (event) {
            if ($scope.options.settings.parameter == 0) {
                return event.EventReasonID;
            }
            return event.EventGroupID;
        }

        function updateTicks() {
            $scope.tickWT = Math.ceil($scope.maxDuration / 6 / 60) * 60;
            $scope.tickWC = Math.ceil($scope.maxCount / 5 / 5) * 5;
            $scope.ticksT = _.range(0, $scope.maxDuration, $scope.tickWT);
            $scope.ticksC = _.range(0, $scope.maxCount, $scope.tickWC);
            $scope.ticksC = _.sortBy($scope.ticksC, function (n) {
                return n;
            });
            $scope.ticksT = _.sortBy($scope.ticksT, function (n) {
                return n;
            });
        }

        let getTranslation = function (str) {
            let upperCaseStatus = $filter('uppercase')(str)
            let noSpace = upperCaseStatus.replace(/\s/g, '_')
            return $filter('translate')(noSpace);
        }

        let instantiateArrayToEmptySum = function (length) {
            if (typeof length != 'number' || length < 1) {
                return -1;
            }
            let array = Array(length);
            for (let i = 0; i < length; i++) {
                array[i] = {};
                array[i]['duration'] = 0;
                array[i]['numOfEvents'] = 0;
            }
            return array;
        }


        let addGroupOfSumOverColumn = function (eventsGroupsArray, eventReasons, groupName, filter) {
            if (!validArray(eventsGroupsArray)) {
                return;
            }
            let tempEventsGroup = {};
            tempEventsGroup['name'] = groupName;
            tempEventsGroup['data'] = eventReasons
            tempEventsGroup['filter'] = filter;
            eventsGroupsArray.push(tempEventsGroup);
        }

        $scope.totals = [];
        $scope.totalSumOfColumn = [];
        let appendReasonsSumRow = function (eventsGroupsArray, subGroupLength) {
            $scope.totalSumOfColumn = [];
            if (!validArray(eventsGroupsArray)) {
                return;
            }
            for (let i = 0; i < eventsGroupsArray.length; i++) {
                let subGroupsSum = [];
                for (let k = 0; k < subGroupLength; k++) {
                    if (eventsGroupsArray[i].data.length == 1) {
                        subGroupsSum = eventsGroupsArray[i].data[0].slice(1, eventsGroupsArray[i].data[0].length + 1) //ditching first cell because its reserved for subgroup name
                        break;
                    }
                    let sum = {};
                    let totalDuration = 0;
                    let totalNumOfEvents = 0;
                    for (let j = 0; j < eventsGroupsArray[i].data.length; j++) {
                        totalDuration += eventsGroupsArray[i].data[j][k + 1].duration;
                        totalNumOfEvents += eventsGroupsArray[i].data[j][k + 1].duration; //k+1 because the first cell is reserved for the subgroup name
                    }
                    sum['duration'] = totalDuration;
                    sum['totalNumOfEvents'] = totalNumOfEvents;
                    subGroupsSum.push(sum);
                }
                eventsGroupsArray[i]['subGroupsSum'] = subGroupsSum;

            }
            // console.log("subGroupsSum", eventsGroupsArray);
            // console.log(eventsGroupsArray,644)
            _.forEach(eventsGroupsArray[eventsGroupsArray.length - 1].subGroupsSum, function (tot) {
                durationValue = tot.duration;
                duration = $filter('getDurationInHoursMinutes')(durationValue);
                numOfEvents = tot.numOfEvents;
                // avgEventDuration = $filter('getDurationInHoursMinutes') (durationValue/numOfEvents);
                $scope.totalSumOfColumn.push({
                    duration: duration,
                    value: durationValue,
                    numOfEvents: numOfEvents,
                    durationWithNumOfEvents: `${duration} (${numOfEvents})`,
                    // style : { 
                    //     "backgroundColor" : "rgb(191, 22, 32)",
                    // },
                    // avgEventDuration : `${avgEventDuration} (${avgEventDuration})` ,
                });
            })
            
             $scope.maxColArray = new Array($scope.totalSumOfColumn.length - 1).fill(0)
            _.forEach(eventsGroupsArray, function (item,i) {
                if(item.name != "Total"){
                    _.forEach(item.subGroupsSum, function (sub,j) {
                        if(item.subGroupsSum.length -1  != j )
                        {
                            if($scope.maxColArray[j] < sub.duration) $scope.maxColArray[j] = sub.duration
                        }
                    })
                }
                
        })
        // console.log($scope.maxColArray,23123213)
            // console.log("$scope.totalSumOfColumn",$scope.totalSumOfColumn);
        }


        let addSumDataOverColumn = function (eventsGroupsArray) {
            if (!validArray(eventsGroupsArray) || eventsGroupsArray[0].data.length < 1) {
                return;
            }
            let numOfMachines = eventsGroupsArray[0].data[0].length - 1; //-1 because we pushed a sum value in the previous function
            let sumOverMachine = instantiateArrayToEmptySum(numOfMachines);
            for (let i = 0; i < eventsGroupsArray.length; i++) {
                for (let j = 0; j < eventsGroupsArray[i].data.length; j++) {
                    for (let k = 0; k < sumOverMachine.length; k++) {
                        sumOverMachine[k]['duration'] += eventsGroupsArray[i].data[j][k + 1].duration; //k+1 because first element is an array
                        sumOverMachine[k]['numOfEvents'] += eventsGroupsArray[i].data[j][k + 1].numOfEvents;
                    }
                }
            }

            if (($scope.displayValueBy !== "avgEventDuration") && ($scope.displayValueBy !== "percentageOfEventDuration")) {

                sumOverMachine.unshift(getTranslation('TOTAL'))
                let reasonsArr = [];
                reasonsArr.push(sumOverMachine);
                addGroupOfSumOverColumn(eventsGroupsArray, reasonsArr, getTranslation('TOTAL'), true);

            }

        }

        let validArray = function (arrayToCheck) {
            if (!arrayToCheck || !Array.isArray(arrayToCheck)) {
                return false
            }
            return true;
        }


        let sumDataOverReason = function (reasonsArray) {
            if (!validArray(reasonsArray)) {
                return -1;
            }
            let durationSum = 0;
            let eventsSum = 0;
            for (let i = 1; i < reasonsArray.length; i++) {
                durationSum += reasonsArray[i].duration;
                eventsSum += reasonsArray[i].numOfEvents;
            }
            let sum = {};
            sum['duration'] = durationSum;
            sum['numOfEvents'] = eventsSum;
            return sum;
        }


        let addSumDataOverRow = function (eventsGroupsArray) {
            if (!validArray(eventsGroupsArray)) {
                return;
            }
            for (let i = 0; i < eventsGroupsArray.length; i++) {
                for (let j = 0; j < eventsGroupsArray[i].data.length; j++) {
                    let sum = sumDataOverReason(eventsGroupsArray[i].data[j])
                    //pushing sum to the end of the row
                    eventsGroupsArray[i].data[j].push(sum)
                }
            }
        }

        let appendTotalDurationsAndEvents = function (eventGroupsArray) {
            addSumDataOverRow(eventGroupsArray);
            addSumDataOverColumn(eventGroupsArray);
        }

        let sumDurationOverMachineAndFillGabs = function (eventsGroupedByReasonsByMachineObj, machinesArray) {
            let eventsGroupedByReasonsByMachineArray = [];
            for (var groupName in eventsGroupedByReasonsByMachineObj) {
                let eventReasons = [];
                for (eventReason in eventsGroupedByReasonsByMachineObj[groupName]) {
                    let tempReasonPlaceHolder = []
                    tempReasonPlaceHolder.push(eventReason);
                    for (let i = 0; i < machinesArray.length; i++) {
                        let machine = machinesArray[i];
                        let durationPerMachine = 0;
                        let numOfEventsPerMachine = 0;
                        if (eventsGroupedByReasonsByMachineObj[groupName][eventReason][machine]) {
                            numOfEventsPerMachine = eventsGroupedByReasonsByMachineObj[groupName][eventReason][machine].length;
                            for (let i = 0; i < eventsGroupedByReasonsByMachineObj[groupName][eventReason][machine].length; i++) {
                                durationPerMachine += eventsGroupedByReasonsByMachineObj[groupName][eventReason][machine][i].Duration;
                            }
                        }
                        let machineData = {};
                        machineData['duration'] = durationPerMachine;
                        machineData['numOfEvents'] = numOfEventsPerMachine;
                        tempReasonPlaceHolder.push(machineData);
                    }
                    tempReasonPlaceHolder.push();
                    eventReasons.push(tempReasonPlaceHolder);
                }
                addGroupOfSumOverColumn(eventsGroupedByReasonsByMachineArray, eventReasons, groupName, true)
            }
            return eventsGroupedByReasonsByMachineArray;

        }

        let extractMachineNames = function (data) {
            let machineNames = [];
            let machineGroups = _.groupBy(data, 'MachineName');
            for (var machine in machineGroups) {
                machineNames.push(machine)
            }
            return machineNames;
        }

        let extractEventGroups = function (data) {
            return _.groupBy(data, 'EventGroup');
        }
        let extractEventNames = function (data) {
            return _.groupBy(data, 'Name');
        }

        let groupByEventReason = function (eventGroupsObj) {
            let eventsGroups = {};
            for (var groupName in eventGroupsObj) {
                let eventReasons = _.groupBy(eventGroupsObj[groupName], 'EventReason');
                eventsGroups[groupName] = eventReasons;
            }
            return eventsGroups;
        }

        let groupByMachineName = function (eventsGroupedByReasonsObj) {
            let eventsGroupedByReasonsByMachine = {};
            for (var groupName in eventsGroupedByReasonsObj) {
                let eventReasons = {};
                for (eventReason in eventsGroupedByReasonsObj[groupName]) {
                    let machines = _.groupBy(eventsGroupedByReasonsObj[groupName][eventReason], 'MachineName');
                    eventReasons[eventReason] = machines;
                }
                eventsGroupedByReasonsByMachine[groupName] = eventReasons;
            }
            return eventsGroupedByReasonsByMachine;
        }

        let extractTableData = function (dataArray, machinesArray) {
            let eventGroupsObj = extractEventGroups(dataArray);
            let groupedByEventReasonObj = groupByEventReason(eventGroupsObj);
            let eventsGroupedByReasonsByMachineObj = groupByMachineName(groupedByEventReasonObj)
            let eventsGroupedByReasonsByMachineUpdated = sumDurationOverMachineAndFillGabs(eventsGroupedByReasonsByMachineObj, machinesArray)
            appendTotalDurationsAndEvents(eventsGroupedByReasonsByMachineUpdated);
            machinesArray.push(getTranslation("TOTAL"));
            appendReasonsSumRow(eventsGroupedByReasonsByMachineUpdated, machinesArray.length)

            return eventsGroupedByReasonsByMachineUpdated;
        }

        //data is a global var but its present for documentation purposes
        //data is sorted by MachineName, im relying on that in tableData
        let makeTableData = function (dataArray) {
            if (!dataArray || !Array.isArray(dataArray) || dataArray.length < 1) {
                $scope.table = false;
                $scope.ySimpleTable = [];
                $scope.simpleTableData = [];
                return;
            }
            let backgroundColor = "white";
            $scope.displayColorBy = $scope.graph.options.settings.displayColorBy;
            $scope.displayValueBy = $scope.graph.options.settings.displayValueBy;
            $scope.table = true;
            $scope.ySimpleTable = [];
            $scope.yResponsiveTable = [];
            $scope.simpleTableData = []
            $scope.simpleTableName = "Status"
            $scope.numOfEventsEnabled = true;
            $scope.machinesArray = extractMachineNames(dataArray);
            $scope.columns = [];
            $scope.totals = [];
            angular.forEach($scope.machinesArray, (machine) => {
                let col = {
                    ColumnName: machine,
                    Value: machine
                }
                $scope.columns.push(col);
            });

            $scope.tableData = extractTableData(dataArray, $scope.machinesArray);
            var tempDataTable = [];

            for (var name in $scope.tableData) {
                for (var reason in $scope.tableData[name].data) {
                    const totalDuration = _.sum($scope.tableData[name].data[reason],'duration') - $scope.tableData[name].data[reason][$scope.tableData[name].data[reason].length - 1].duration;
                    $scope.ySimpleTable.push($scope.tableData[name].data[reason][0])
                    const col = {
                        name: $scope.tableData[name].data[reason][0],
                        title: $scope.tableData[name].data[reason][0],
                        totalDuration: totalDuration,
                        stopReasonTree: false,
                        class: 'ellipsisText',
                        style: {
                            'padding-left': '0.8em',
                            'backgroundColor': "white",
                            'borderbottom': '0px solid #c0c0c0',
                        },
                    };
                    
                    let indexItem =  _.findIndex($scope.yResponsiveTable,item => {
                        if (item.totalDuration < totalDuration) {
                            return true;
                        }
                        return false;
                    });
                    if (col.name === 'Total'){
                        indexItem = -1;
                    }
                    if (indexItem > -1) {
                        $scope.yResponsiveTable.splice(indexItem, 0, col); 
                    }
                    else {
                        $scope.yResponsiveTable.push(col);
                    }
                    if ($scope.tableData[name].filter == true) {
                        tempDataTable = []
                        for (var i = 1; i < $scope.tableData[name].data[reason].length; i++) {
                            let durationValue = $scope.tableData[name].data[reason][i].duration;
                            let duration = $filter('getDurationInHoursMinutes')(durationValue);
                            let numOfEvents = $scope.tableData[name].data[reason][i].numOfEvents;
                            let avgEventDuration = $filter('getDurationInHoursMinutes')(durationValue / numOfEvents);
                            let shiftDuration = $scope.shiftData.data.CurrentShift[0].ShiftDuration;//.Machines[0].ShiftDuration;
                            $scope.shiftDuration = shiftDuration ;
                            let percentageOfEventDuration = (durationValue / shiftDuration) !== 0 ? ((durationValue / shiftDuration) * 100).toFixed(2) + "%" : "-";

                            if ($scope.displayValueBy === "avgEventDuration") {
                                duration = avgEventDuration;
                            } else if ($scope.displayValueBy === "numOfEvents") {
                                duration = numOfEvents;
                            } else if ($scope.displayValueBy === "percentageOfEventDuration") {
                                duration = percentageOfEventDuration;
                            } else if ($scope.displayValueBy === "duration") {
                                duration = $filter('getDurationInHoursMinutes')(durationValue);
                                duration = duration ? `${duration} (${numOfEvents})` : "-";
                            }

                            if ($scope.displayColorBy === "rows") {
                                var color = dataArray[name].Color; 
                                if($scope.tableData[name].name === "Machine Stop"){
                                    color = '#BF1620';
                                }
                                let opacity ;
                                if($scope.displayValueBy === "numOfEvents"){
                                     opacity = numOfEvents / $scope.tableData[name].data[reason][$scope.tableData[name].data[reason].length-1].numOfEvents ;
                                }
                                else{
                                    opacity = durationValue / $scope.tableData[name].data[reason][$scope.tableData[name].data[reason].length-1].duration ;
                                }
                                backgroundColor = hexToRgbA(color , opacity); // calculate background color according to total rows
                                color = LeaderMESservice.getBWByColor(backgroundColor, 160); // calculate background color according to total rows
                                // duration111 = $filter('getDurationInHoursMinutes')($scope.tableData[name].data[reason][$scope.tableData[name].data[reason].length-1].duration);
                                // console.log("rows " , duration ,"(",numOfEvents,") /", duration111 )
                            } else if ($scope.displayColorBy === "none") {
                                backgroundColor = "white"
                                color = "black";
                            }

                            if (i != $scope.tableData[name].data[reason].length - 1) {
                                duration = duration ? duration : "-"; //`${duration} (${numOfEvents})` : "-";
                            } else {
                                if($scope.tableData[name].name === "Machine Stop"){
                                    bgGolor = '#BF1620';
                                }
                                else {
                                    bgGolor = dataArray[name]?.Color
                                }
                                const totalItem = {
                                    value: ($scope.tableData[name].data[reason][i].duration),
                                    duration: duration,
                                    numOfEvents: numOfEvents,
                                    durationWithNumOfEvents: duration ? `${duration} (${numOfEvents})` : "-",
                                    avgEventDuration: avgEventDuration,
                                    percentageOfEventDuration: percentageOfEventDuration,
                                    backgroundColor: bgGolor,
                                    FontColor : color ,
                                }
                                if (indexItem > -1) {
                                    $scope.totals.splice(indexItem, 0, totalItem); 
                                }
                                else {
                                    $scope.totals.push(totalItem);
                                }
                                // $scope.totals.push();
                            }
                         // console.log("dataArray[name].shiftDuration " , dataArray[name].shiftDuration )
                            tempDataTable.push({
                                duration: duration,
                                value: durationValue,
                                numOfEvents: numOfEvents,

                                style: {
                                    "backgroundColor": backgroundColor,
                                    "border": "0px solid #c0c0c0" , 
                                    "color" : color ,
                                },
                                Color: dataArray[name]?.Color,
                                hideTitle: true,
                                machineId: 12,
                            });
                        }

                        if ($scope.displayColorBy === "rows" && ($scope.displayValueBy === "avgEventDuration" || $scope.displayValueBy === "percentageOfEventDuration")) {
                            let max = findMaxInRow(tempDataTable);
                            for (let i = 0; i < tempDataTable.length - 1; i++) {
                                let color = tempDataTable[i].Color ; 
                                if($scope.tableData[name].name === "Machine Stop"){
                                    color = '#BF1620';
                                }
                                let opacity =  tempDataTable[i].value / max ;
                                tempDataTable[i].style.backgroundColor = hexToRgbA(color,opacity);
                                tempDataTable[i].style.color = LeaderMESservice.getBWByColor(tempDataTable[i].style.backgroundColor, 160);
                                // console.log("rows " , tempDataTable[i].duration,"/",$scope.totalSumOfColumn[i].durationWithNumOfEvents)
                            }
                        } else if ($scope.displayColorBy === "cols") {
                            if ( $scope.tableData[name].name != "Total") {
                                if ($scope.displayValueBy === "duration" || $scope.displayValueBy === "numOfEvents") {
                                    for (let i = 0; i < tempDataTable.length; i++) {
                                        let opacity ;
                                        if ($scope.displayValueBy === "numOfEvents"){
                                            opacity = tempDataTable[i].numOfEvents/$scope.totalSumOfColumn[i].numOfEvents ;
                                        }
                                        else {
                                             opacity = tempDataTable[i].value/$scope.totalSumOfColumn[i].value ;
                                        }
                                        let color = tempDataTable[i].Color;
                                        if($scope.tableData[name].name === "Machine Stop"){
                                            color = '#BF1620';
                                        }
                                        tempDataTable[i].style.backgroundColor = hexToRgbA(color,opacity);
                                        tempDataTable[i].style.color = LeaderMESservice.getBWByColor(tempDataTable[i].style.backgroundColor, 160);
                                    }
                                } else if ($scope.displayValueBy === "percentageOfEventDuration") {
                                    for (let i = 0; i < tempDataTable.length - 1; i++) {
                                        let color = tempDataTable[i].Color;
                                        if($scope.tableData[name].name === "Machine Stop"){
                                            color = '#BF1620';
                                        }
                                        let opacity = tempDataTable[i].value / $scope.maxColArray[i] ;
                                        tempDataTable[i].style.backgroundColor = hexToRgbA(color, opacity);
                                        tempDataTable[i].style.color = LeaderMESservice.getBWByColor(tempDataTable[i].style.backgroundColor, 160);
                                    }
                                } 
                            }
                            // console.log("cols " , tempDataTable[i].duration,"/",$scope.totalSumOfColumn[i].durationWithNumOfEvents)
                        } else if ($scope.displayColorBy === "totals") {
                            _.forEach(tempDataTable, function (data11) { // totals
                                let color = data11.Color ;
                                if($scope.tableData[name].name === "Machine Stop"){
                                    color = '#BF1620';
                                }
                                let opacity ;
                                if($scope.displayValueBy === "numOfEvents"){
                                     opacity = data11.numOfEvents/$scope.totalSumOfColumn[$scope.totalSumOfColumn.length-1].numOfEvents ;
                                }
                                else {
                                    opacity = data11.value/$scope.totalSumOfColumn[$scope.totalSumOfColumn.length-1].value ;
                                }
                                data11.style.backgroundColor = hexToRgbA(color,opacity); 
                                data11.style.color = LeaderMESservice.getBWByColor(data11.style.backgroundColor, 160) ; 
                                
                                // console.log("totals " ,$scope.totals.length-1, data11.duration,"/",$scope.totalSumOfColumn[$scope.totalSumOfColumn.length-1].durationWithNumOfEvents)
                            });
                        }
                        if (indexItem > -1) {
                            $scope.simpleTableData.splice(indexItem, 0, tempDataTable); 
                        }
                        else {
                            $scope.simpleTableData.push(tempDataTable);
                        }
                     } 
                     else {
                        for (var i = 1; i < $scope.tableData[name].data[reason].length; i++) {
                            let durationValue = $scope.tableData[name].data[reason][i].duration;
                            let duration = duration = $filter('getDurationInHoursMinutes')(durationValue);
                            let numOfEvents = $scope.tableData[name].data[reason][i].numOfEvents;
                            let avgEventDuration = $filter('getDurationInHoursMinutes')(duration / numOfEvents);
                            let percentageOfEventDuration = ((durationValue / shiftDuration) * 100).toFixed(2);

                            if ($scope.displayValueBy === "avgEventDuration") {
                                duration = avgEventDuration;
                            } else if ($scope.displayValueBy === "numOfEvents") {
                                duration = numOfEvents;
                            } else if ($scope.displayValueBy === "percentageOfEventDuration") {
                                duration = percentageOfEventDuration;
                            } else if ($scope.displayValueBy === "duration") {
                                duration = $filter('getDurationInHoursMinutes')(durationValue);
                                duration = duration ? `${duration} (${numOfEvents})` : "-";
                            }

                            if (i != $scope.tableData[name].data[reason].length - 1) {
                                duration = duration ? duration : "-"; //`${duration} (${numOfEvents})` : "-";
                            } else {
                                const totalItem = {
                                    value: ($scope.tableData[name].data[reason][i].duration),
                                    duration: duration,
                                    numOfEvents: numOfEvents,
                                    durationWithNumOfEvents: duration ? `${duration} (${numOfEvents})` : "-",
                                    avgEventDuration: avgEventDuration,
                                    percentageOfEventDuration: percentageOfEventDuration,
                                    backgroundColor: dataArray[name].Color,
                                };
                                if (indexItem > -1) {
                                    $scope.totals.splice(indexItem, 0, totalItem); 
                                }
                                else {
                                    $scope.totals.push(totalItem);
                                }
                            }
                            tempDataTable.push({
                                duration: duration,
                                numOfEvents: numOfEvents,
                                style: {
                                    "backgroundColor": "white",
                                    "border": "0px solid #c0c0c0"
                                },
                                hideTitle: true,
                                machineId: 12,
                            });
                        }
                        if (indexItem > -1) {
                            $scope.simpleTableData.splice(indexItem, 0, tempDataTable); 
                        }
                        else {
                            $scope.simpleTableData.push(tempDataTable);
                        }
                        // $scope.simpleTableData.push(tempDataTable)
                    }
                }
            }
            calculateTotalsPercentage();
            
            makeTableDataWithGroups(dataArray);
            // calculateTotalSumOfColumns(tempDataTable);
            // console.log("totals ", $scope.totals);
            // console.log($scope.totalsInPercentage);
        }

        let makeTableDataWithGroups = function (dataArray){
            $scope.ySimpleTable2 =[];
            $scope.responsiveTableData2 = [] ;
            $scope.yResponsiveTable2 = [];
            $scope.groupsTotals=[];
            $scope.tableData2 = $scope.tableData;
            totalsInPercentage = [] ;
            var color11;
//scope.shiftData.stopEventsGroupFilter
                _.forEach( $scope.tableData2 , function(group , j){
                    color11 = _.find($scope.shiftData.stopEventsGroupFilter,{"EventGroup":group.name })?.Color;
                    const totalDuration = _.sum(group.subGroupsSum,'duration') - group.subGroupsSum[group.subGroupsSum.length - 1].duration;

                    $scope.responsiveTableDataTemp = []

                    const col = { // creating eventy column for each group
                        name : group.name ,
                        title : group.name ,
                        stopReasonTree : true,
                        treeLevel : 0 ,
                        totalDuration: totalDuration,
                        class: 'ellipsisText',
                        style: {
                            'padding-left': '0.8em',
                            'backgroundColor': "white",
                            // 'backgroundColor': color11 || "white",
                            'borderbottom': '0px solid #c0c0c0',
                        },
                    }; 

                    let indexItem =  _.findIndex($scope.yResponsiveTable2,item => {
                        if (item.treeLevel === 0 && item.totalDuration < totalDuration) {
                            return true;
                        }
                        return false;
                    });
                    if (col.name === 'Total'){
                        indexItem = -1;
                    }
                    let indexItem2 = indexItem;
                    if (indexItem > -1) {
                        $scope.yResponsiveTable2.splice(indexItem, 0, col); 
                        indexItem++;
                    }
                    else {
                        indexItem = $scope.yResponsiveTable2.push(col);
                    }
                    // $scope.yResponsiveTable2.push(col);
                    _.forEach(group.subGroupsSum , function(groupTotalItem){   // creating data for each group
                        let durationValue = groupTotalItem.duration;
                        var duration = duration = $filter('getDurationInHoursMinutes')(durationValue);
                        let numOfEvents = groupTotalItem.numOfEvents || groupTotalItem.totalNumOfEvents || "-"; 
                        let avgEventDuration = durationValue ? $filter('getDurationInHoursMinutes')(durationValue / numOfEvents) : "-";
                        let percentageOfEventDuration = durationValue ? ((durationValue / $scope.shiftDuration) * 100).toFixed(2) : 0;

                        if ($scope.displayValueBy === "avgEventDuration") {
                            duration = avgEventDuration;
                        } else if ($scope.displayValueBy === "numOfEvents") {
                            duration = numOfEvents;
                        } else if ($scope.displayValueBy === "percentageOfEventDuration") {
                            duration = percentageOfEventDuration ? percentageOfEventDuration+"%": "-";
                        } else if ($scope.displayValueBy === "duration") {
                            duration = $filter('getDurationInHoursMinutes')(durationValue);
                            duration = duration ? `${duration} (${numOfEvents})` : "-";
                        }
                            $scope.responsiveTableDataTemp.push({
                                duration: duration,
                                value: durationValue,
                                numOfEvents: numOfEvents,
                                avgEventDuration: avgEventDuration,
                                percentageOfEventDuration : percentageOfEventDuration , 
                                class: 'ellipsisText',
                                style: {
                                    'padding-left': '0.8em',
                                    'backgroundColor': "white",
                                    // 'backgroundColor': color11 || "white",
                                    'borderbottom': '0px solid #c0c0c0',
                                },
                                Color : color11 ,
                            });
                          
                    });
                    if (indexItem2 > -1) {
                        $scope.responsiveTableData2.splice(indexItem2, 0, $scope.responsiveTableDataTemp); 
                        indexItem2++;
                    }
                    else {
                        indexItem2 = $scope.responsiveTableData2.push($scope.responsiveTableDataTemp);
                    }
                    $scope.responsiveTableDataTemp = []
                   
                    _.forEach(group.data , function(reason ,i){
                        if(group.name != "Total" ){
                            _.forEach(reason,function(temp,j){
                                if( j != 0 ){
                                    let durationValue = temp.duration;
                                    var duration = $filter('getDurationInHoursMinutes')(durationValue) ;
                                    let numOfEvents = temp.numOfEvents ? temp.numOfEvents : "-";
                                    let avgEventDuration = durationValue ? $filter('getDurationInHoursMinutes')(durationValue / numOfEvents) : "-";
                                    let percentageOfEventDuration = durationValue ? ((durationValue / $scope.shiftDuration) * 100).toFixed(2) : 0;

                                    if ($scope.displayValueBy === "avgEventDuration") {
                                        duration = avgEventDuration;
                                    } else if ($scope.displayValueBy === "numOfEvents") {
                                        duration = numOfEvents;
                                    } else if ($scope.displayValueBy === "percentageOfEventDuration") {
                                        duration = percentageOfEventDuration ? percentageOfEventDuration+"%": "-";
                                    } else if ($scope.displayValueBy === "duration") {
                                        duration = $filter('getDurationInHoursMinutes')(durationValue);
                                        duration = duration ? `${duration} (${numOfEvents})` : "-";
                                    }

                                    $scope.responsiveTableDataTemp.push({ // creating data for each reason
                                        duration: duration ,
                                        value: durationValue,
                                        numOfEvents: numOfEvents,
                                        class: 'ellipsisText',
                                        // treeLevel : 1 ,
                                        dontColor : true ,
                                        style: {
                                            'padding-left': '0.8em',
                                            'backgroundColor': "white",
                                            'borderbottom': '0px solid #c0c0c0',
                                        },
                                       Color : color11 ,
                                    });
                                }
                            })
                            if (indexItem2 > -1) {
                                $scope.responsiveTableData2.splice(indexItem2, 0, $scope.responsiveTableDataTemp); 
                                indexItem2++;
                            }
                            else {
                                indexItem2 = $scope.responsiveTableData2.push($scope.responsiveTableDataTemp);
                            }
                            // $scope.responsiveTableData2.push($scope.responsiveTableDataTemp)
                        }
                        $scope.responsiveTableDataTemp = []

                       const name = reason[0] ; 
                        const col ={  // creating eventy column for each group reason
                            name : name ,
                            title : name ,
                            stopReasonTree : false ,
                            // treeLevel : 1 ,
                            class: 'ellipsisText',
                            style: {
                                'padding-left': '0.8em',
                                'backgroundColor': "white",
                                'borderbottom': '0px solid #c0c0c0',
                            },
                        } ; 

                        if (indexItem > -1) {
                            $scope.yResponsiveTable2.splice(indexItem, 0, col); 
                            indexItem++;
                        }
                        else {
                            indexItem = $scope.yResponsiveTable2.push(col);
                        }
                        // $scope.yResponsiveTable2.push(col);

                    });
                   
                });

                _.forEach($scope.responsiveTableData2 , function(arr){ //creating $scope.groupsTotals Array
                    $scope.groupsTotals.push(arr[arr.length-1]);
                })

                calculateGroupTotalsInPercentage();

                calculateSumOfColumns();
                calculateMaxOfColumns();
                _.forEach($scope.responsiveTableData2 , function(row,i){ //color cells in table
                    let maxInRow = findMaxInRow(row);
                        _.forEach(row , function(element){
                                if(element.duration != "-" && !element.dontColor){
                                    color = element.Color ;
                                    if($scope.displayColorBy === "none"){ 
                                        color = "white"; 
                                        element.style.backgroundColor = color ;
                                    }else {
                                        let opacity ; 
                                        if($scope.displayColorBy === "rows"){ 
                                            if($scope.displayValueBy === "avgEventDuration" || $scope.displayValueBy === "percentageOfEventDuration"){
                                                opacity = element.value / maxInRow;
                                            }
                                            else if ($scope.displayValueBy === "numOfEvents"){
                                                opacity = element.numOfEvents / $scope.groupsTotals[i].numOfEvents;
                                            }
                                            else {
                                                opacity = element.value / $scope.groupsTotals[i].value;// or /row[row.length-1].value;
                                            }
                                        
                                        }else if($scope.displayColorBy === "cols"){
                                            if ($scope.displayValueBy === "duration" || $scope.displayValueBy === "numOfEvents") {
                                                if($scope.displayValueBy === "numOfEvents"){
                                                    opacity = element.numOfEvents / $scope.groupSumOfColsInNumofEvents[i]; // TODO
                                                }
                                                else {
                                                    opacity = element.value / $scope.groupSumOfCols[i] ;
                                                }
                                            } else if ($scope.displayValueBy === "percentageOfEventDuration"){
                                                opacity = element.value / $scope.groupMaxOfCols[i];
                                            }
                                        }else if($scope.displayColorBy === "totals"){
                                            if($scope.displayValueBy === "numOfEvents"){
                                                opacity = element.numOfEvents / $scope.groupsTotals[$scope.groupsTotals.length-1].numOfEvents;//row[row.length-1].value;
                                            }
                                            else{
                                                opacity = element.value / $scope.groupsTotals[$scope.groupsTotals.length-1].value;//row[row.length-1].value;
                                            }
                                        }
                                        element.style.backgroundColor = hexToRgbA(color , opacity);
                                        element.style.color = LeaderMESservice.getBWByColor(element.style.backgroundColor, 160);
                                }

                                }
                                
                        })     
                })

        }

        let calculateSumOfColumns = function (){
            $scope.groupSumOfCols = [];
            $scope.groupSumOfColsInNumofEvents = [];
           _.forEach($scope.responsiveTableData2 , function(row, i ){
            _.forEach(row , function(value , j){
                     $scope.groupSumOfCols[j]= 0 ;
                     $scope.groupSumOfColsInNumofEvents[j]= 0 ;
            })
           })
           _.forEach($scope.responsiveTableData2 , function(row, i ){
                _.forEach(row , function(value , j){
                    $scope.groupSumOfCols[j] += row[j].value;
                    $scope.groupSumOfColsInNumofEvents[j] += row[j].numOfEvents;
                })
           })
        }

        let calculateMaxOfColumns = function (){
            $scope.groupMaxOfCols = [];
           _.forEach($scope.responsiveTableData2 , function(row, i ){
            _.forEach(row , function(value , j){
                     $scope.groupMaxOfCols[j]= 0 ;
            })
           })
           _.forEach($scope.responsiveTableData2 , function(row, i ){
                _.forEach(row , function(value , j){
                    if($scope.groupMaxOfCols[j] < row[j].value){     
                        $scope.groupMaxOfCols[j] = row[j].value;
                    }
                })
           })
        }

        let findMaxInRow = function (tempDataTable) {
            let max = tempDataTable[0].value;
            for (let i = 0; i < tempDataTable.length - 1; i++) {
                if (tempDataTable[i].value > max) {
                    max = tempDataTable[i].value;
                }
            };
            return max;
        }
    

        /////////////////////////////////////////////////*calculate $scope.groupTotalsInPercentage*////////////////////////////////////////////////
        $scope.groupTotalsInPercentage = [];
        let calculateGroupTotalsInPercentage = function () { // calculate $scope.groupTotalsInPercentage

            $scope.calculateByMax = false; // calculate by sum / max 
            $scope.groupTotalsInPercentage = [];

            if ($scope.calculateByMax) { // if we want to calculate by max choose this 
                let max = findMaxTotalGroups(); // find max value in $scope.groupsTotals
                calculateGroupsTotalsPercentageBy(max); // calculate the array of $scope.groupTotalsInPercentage by the max value of $scope.groupsTotals
            } else { // if we want to calculate by sum choose this 
                let sum = sumOfTotalsGroups(); // find the sum of $scope.groupsTotals values
                calculateGroupsTotalsPercentageBy(sum); // calculate the array of $scope.groupTotalsInPercentage by the sum of all values in $scope.groupsTotals
            }

        }

        let findMaxTotalGroups = function () { // find max value in $scope.groupsTotals
            let max = $scope.groupsTotals[0].value;
            angular.forEach($scope.groupsTotals, (total) => {
                if (total.value > max) {
                    max = total.value;
                }
            });
            return max;
        }
        let sumOfTotalsGroups = function () { // find the sum of $scope.groupsTotals values
            let sum = 0;
            angular.forEach($scope.groupsTotals, (total) => {
                sum += total.value;
            });
            return sum;
        }
        let calculateGroupsTotalsPercentageBy = function (something) { // calculate the array of $scope.groupTotalsInPercentage by the (max value of/sum of all values in) $scope.groupsTotals  
            angular.forEach($scope.groupsTotals, (total) => {

                let value = ((total.value / something) * 100).toFixed(2);
                let avgEventDuration = total.avgEventDuration ? total.avgEventDuration :  $filter('getDurationInHoursMinutes')(total.value/total.numOfEvents) ;
                let percentageOfEventDuration = total.percentageOfEventDuration ? total.percentageOfEventDuration : ((total.value/$scope.shiftDuration)* 100).toFixed(2) ;

                $scope.groupTotalsInPercentage.push({
                    value: value ,
                    duration: total.duration,
                    numOfEvents: total.numOfEvents,
                    // durationWithNumOfEvents: total.durationWithNumOfEvents,
                    avgEventDuration: avgEventDuration,
                    percentageOfEventDuration: percentageOfEventDuration,
                    class: `totalsBars`,
                    backgroundColor: total.Color,
                    Color: total.Color,
                    displayValueBy: $scope.displayValueBy,
                });
            });


            // console.log('$scope.groupsTotals',$scope.groupsTotals)
            // console.log('$scope.groupTotalsInPercentage',$scope.groupTotalsInPercentage)

        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////*calculate $scope.totalsInPercentage*////////////////////////////////////////////////
        $scope.totalsInPercentage = [];

        let calculateTotalsPercentage = function () { // calculate $scope.totalsInPercentage

            $scope.calculateByMax = false; // calculate by sum / max 
            $scope.totalsInPercentage = [];

            if ($scope.calculateByMax) { // if we want to calculate by max choose this 
                let max = findMaxTotal(); // find max value in $scope.totals
                calculateTotalsPercentageBy(max); // calculate the array of $scope.totalsInPercentage by the max value of $scope.totals
            } else { // if we want to calculate by sum choose this 
                let sum = sumOfTotals(); // find the sum of $scope.totals values
                calculateTotalsPercentageBy(sum); // calculate the array of $scope.totalsInPercentage by the sum of all values in $scope.totals
            }

        }

        let findMaxTotal = function () { // find max value in $scope.totals
            let max = $scope.totals[0].value;
            angular.forEach($scope.totals, (total) => {
                if (total.value > max) {
                    max = total.value;
                }
            });
            return max;
        }
        let sumOfTotals = function () { // find the sum of $scope.totals values
            let sum = 0;
            angular.forEach($scope.totals, (total) => {
                sum += total.value;
            });
            return sum;
        }
        let calculateTotalsPercentageBy = function (something) { // calculate the array of $scope.totalsInPercentage by the (max value of/sum of all values in) $scope.totals  
            angular.forEach($scope.totals, (total) => {
                $scope.totalsInPercentage.push({
                    value: ((total.value / something) * 100).toFixed(2),
                    duration: total.duration,
                    numOfEvents: total.numOfEvents,
                    durationWithNumOfEvents: total.durationWithNumOfEvents,
                    avgEventDuration: total.avgEventDuration,
                    percentageOfEventDuration: total.percentageOfEventDuration,
                    class: `totalsBars`,
                    backgroundColor: total.backgroundColor,
                    Color: total.Color,
                    displayValueBy: $scope.displayValueBy,
                });
            });

            // console.log("$scope.totals",$scope.totals)

        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $rootScope.$on("loadedTemplate", (e, data) => {
            let component = data.data.find(element => element.template == $scope.graph.template && element.ID == $scope.graph.ID);

            for (let prop in component) {
                $scope.graph[prop] = component[prop];
            }

            $scope.graph.isFiltered = $scope.graph.localMachines.some(machine => machine.value == false);
        });

        $scope.listeners = [] //an array of watcher destroyers
        $scope.addListener = (listener) => {
            $scope.listeners.push(listener);
        }

        $scope.$watch('dataRawCopy', function () {

            if ($scope.dataRawCopy) {
                makeTableData($scope.dataRawCopy);
            }
        });

        shiftService.displayUpdateDefferd.promise.then(null, null, function () {
            $scope.updateData();
        });

        $scope.$watch("shiftData.topStopEventsCustomRange", function () {
            $scope.updateData();
        });
        $scope.$watch("shiftData.stopEvents", () => {
            $scope.updateData(true);
        });
        $scope.$watch("shiftData.stopEventsReasonFilter", () => {
            for(let i =0; i < $scope.shiftData.stopEventsReasonFilter.length; i++) {
                const event = $scope.shiftData.stopEventsReasonFilter[i];
                if ($scope.options.settings.filterR){
                    if ($scope.options.settings.filterR[event.EventReasonID] === undefined){
                        $scope.options.settings.filterR[event.EventReasonID] = true;
                    }
                }
            }
        });
        $scope.$watch("options.settings.filterR", function () {
            $scope.updateData();
        }, true);
        $scope.$watch("graph.fullScreen", function () {
            $scope.loadingToggleScreen = true;
            $timeout(() => {
                $scope.loadingToggleScreen = false;
            },200);
        }, true);
        $scope.$watch("options.settings.filterG", function () {
            $scope.updateData();
        }, true);
        $scope.$watch("graph.localMachines", function () {
            $scope.updateData();
        }, true);
        $scope.$watchGroup(["options.settings.parameter", "options.settings.top", "options.settings.groupByEvent"], function () {
            $scope.updateData();
        }, true);

        let displayColorBy = $scope.$watch("graph.options.settings.displayColorBy", function (newValue) {
            if ($scope.dataRawCopy) {
                makeTableData($scope.dataRawCopy);
            }
            // console.log($scope.displayColorBy);
        });
        $scope.addListener(displayColorBy);

        let displayValueBy = $scope.$watch("graph.options.settings.displayValueBy", function (newValue) {
            if ($scope.dataRawCopy) {
                makeTableData($scope.dataRawCopy);
            }
            // console.log($scope.displayValueBy);
        });
        $scope.addListener(displayValueBy);

    };


    return {
        restrict: "E",
        templateUrl: Template,
        scope: {
            options: "=",
            graph: "="
        },
        controller: controller,
        controllerAs: 'topStopEventsCtrl'
    };
};


angular
    .module('LeaderMESfe')
    .directive('topStopEventsDirective', topStopEventsDirective);