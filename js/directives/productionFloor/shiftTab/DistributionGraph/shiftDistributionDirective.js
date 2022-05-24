
var shiftDistributionDirective = function () {
    var Template = 'views/custom/productionFloor/shiftTab/Distribution/shiftDistribution.html';
    function controller($scope, $filter, shiftService, LeaderMESservice, googleAnalyticsService, $rootScope, $timeout, $element) {
        $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
        $scope.barsData = {};
        $scope.keys = [];
        $scope.ticks = [];
        $scope.numm = 0
        $scope.tickW = 0;
        $scope.total = 0;
        $scope.ySimpleTable=[]
        $scope.simpleTableName;
        $scope.dataSimpleTable = [];
        var stopEventsIds = shiftService.stopEventsIds;
        var oldCompareVal = $scope.options.settings.compareWith;
        $scope.getChangedHeight = function () {
            return ($scope.options.height - 223) + (1 - $rootScope.scaleAfterZoom) * (1 - $rootScope.scaleAfterZoom);
        }

        $scope.shiftData = shiftService.shiftData;

        var sliderData = shiftService.sliderData;
        var shiftData = shiftService.shiftData;
        var getDuration = shiftService.getDuration;
        $scope.GAupdate = function (event) {
            googleAnalyticsService.gaEvent("Department_Shift", event);
        };
        $scope.$watchGroup(["shiftData.stopEvents", "shiftData.stopEventsRef","graph.localMachines"], function () {
            saveEvents();
        });

        shiftService.displayUpdateDefferd.promise.then(null, null, function () {
            saveEvents();
        });
        $scope.$watch("options.settings", function (newValue, oldValue) {
            saveEvents();
        }, true);

        function prepareData(data, groupByM, refData) {
            if (!data) {
                return [];
            }
            var firstGroup = groupByM ? groupByMachine : groupByValue;
            var secondGroup = groupByM ? groupByValue : groupByMachine;
            var newData = _.filter(data, machinesEventFilter);
            // if(!$scope.options.settings.timeV){
            // }else{
            //     newData = _.groupBy(newData,"")
            // }


            newData = _.filter(newData, durationFilter);

            //initializing data for simple table directive
            if (!refData) {
                $scope.rawData = newData;
                $scope.rawData = appendTimeInterval($scope.rawData);
            }


            newData = _.groupBy(newData, firstGroup);
            newData = _.map(newData, function (value, key) {
                var totalGroup = 0;
                var totalN = 0;
                var noCommD = 0;
                var noCommC = 0;
                for (var i = 0; i < value.length; i++) {
                    if (value[i].EventReasonID === 18 && (_.indexOf(stopEventsIds, value[i].EventDistributionID) != -1) || (value[i].Name === "No Communication")) {
                        noCommD += parseInt(value[i].Duration);
                        noCommC += 1;
                    }
                    totalGroup += value[i].Duration;
                }
                var grouped = _.map(_.groupBy(value, secondGroup), function (value, key) {
                    var durationSum = 0;
                    var count = 0;
                    for (var i = 0; i < value.length; i++) {
                        durationSum += value[i].Duration;
                        count++;
                    }
                    totalN += count;
                    durationSum = $scope.options.settings.timeV ? durationSum : count;
                    return {
                        key: key,
                        value: durationSum,
                        MachineID: value[0].MachineID,
                        count: count,
                        color: value[0].Color
                    }
                });
                //sort
                grouped = _.sortBy(grouped, function (event) {
                    return -event.value;
                });
                //add
                totalGroup = $scope.options.settings.timeV ? totalGroup : totalN;
                return {
                    key: key,
                    value: grouped,
                    noCommC: noCommC,
                    noCommD: noCommD,
                    total: totalGroup
                }
            });
            newData = _.groupBy(newData, "key");


            return newData;
        }

        let appendTimeInterval = function (dataArray) {
            if (!dataArray) {
                return [];
            }

            let copy1 = angular.copy(dataArray);
            let copy2 = angular.copy(dataArray);
            let copy3 = angular.copy(dataArray);

            let lessThanCopy = filterAndAppendLessThan(copy1);
            let betweenCopy = filterAndAppendBetween(copy2);
            let greaterThanCopy = filterAndAppendGreaterThan(copy3);

            let combinedData = [];
            combinedData = combinedData.concat(lessThanCopy);
            combinedData = combinedData.concat(betweenCopy);
            combinedData = combinedData.concat(greaterThanCopy);

            return combinedData;
        }

        let filterAndAppendLessThan = function (dataArray) {
            if (!dataArray) {
                return [];
            }
            let updatedData = [];
            for (let i = 0; i < dataArray.length; i++) {
                let eventDuration = dataArray[i].Duration;

                if ((eventDuration < $scope.options.settings.minVal) && $scope.options.settings.minBar) {
                    updatedData.push(dataArray[i]);
                    updatedData[updatedData.length - 1].EventGroup = '< ' + $scope.options.settings.minVal;
                    updatedData[updatedData.length - 1].EventReason = '< ' + $scope.options.settings.minVal;
                }
            }
            return updatedData
        }

        let filterAndAppendBetween = function (dataArray) {
            if (!dataArray) {
                return [];
            }
            let updatedData = []
            for (let i = 0; i < dataArray.length; i++) {
                let eventDuration = dataArray[i].Duration;

                if ((eventDuration <= $scope.options.settings.midMaxVal) && (eventDuration >= $scope.options.settings.midMinVal) && $scope.options.settings.midBar) {
                    updatedData.push(dataArray[i]);
                    updatedData[updatedData.length - 1].EventGroup = $scope.options.settings.midMinVal + ' < * < ' + $scope.options.settings.midMaxVal;
                    updatedData[updatedData.length - 1].EventReason = $scope.options.settings.midMinVal + ' < * < ' + $scope.options.settings.midMaxVal;
                }
            }
            return updatedData
        }

        let filterAndAppendGreaterThan = function (dataArray) {
            if (!dataArray) {
                return [];
            }

            let updatedData = [];
            for (let i = 0; i < dataArray.length; i++) {
                let eventDuration = dataArray[i].Duration;

                if ((eventDuration > $scope.options.settings.maxVal) && $scope.options.settings.maxBar) {
                    updatedData.push(dataArray[i]);
                    updatedData[updatedData.length - 1].EventGroup = '> ' + $scope.options.settings.maxVal;
                    updatedData[updatedData.length - 1].EventReason = '> ' + $scope.options.settings.maxVal;
                }
            }
            return updatedData;
        }

        function saveEvents() {
            var events = prepareData($scope.shiftData.stopEvents, ($scope.options.settings.group == 1), false);
            var eventsRef = prepareData($scope.shiftData.stopEventsRef, ($scope.options.settings.group == 1), true);
            // calc height and y for bars elements
            $scope.barsData = {};
            $scope.keys = [];
            if ($scope.options.settings.group == 0) {
                var minutes = $filter('translate')('MIN');
                var min = '< ' + $scope.options.settings.minVal + minutes;
                var mid = $scope.options.settings.midMinVal + '-' + $scope.options.settings.midMaxVal + minutes;
                var max = '> ' + $scope.options.settings.maxVal + minutes;
                if ($scope.options.settings.minBar) {
                    $scope.barsData[min] = {
                        cur: (events[min] ? events[min][0] : null),
                        ref: (eventsRef[min] ? eventsRef[min][0] : null)
                    };
                    $scope.keys.push(min);
                }
                if ($scope.options.settings.midBar) {
                    $scope.barsData[mid] = {
                        cur: (events[mid] ? events[mid][0] : null),
                        ref: (eventsRef[mid] ? eventsRef[mid][0] : null)
                    };
                    $scope.keys.push(mid);
                }
                if ($scope.options.settings.maxBar) {
                    $scope.barsData[max] = {
                        cur: (events[max] ? events[max][0] : null),
                        ref: (eventsRef[max] ? eventsRef[max][0] : null)
                    };
                    $scope.keys.push(max);
                }
            } else if ($scope.options.settings.group == 1) {
                _.forEach($scope.shiftData.Machines, function (machine) {

                    let subMachine=$scope.graph.localMachines.find(sub=>sub.ID==machine.machineID);

                    // if ($scope.shiftData.machinesDisplay[machine.machineID] && events[machine.machineName]) {
                        if (subMachine && subMachine.value && events[machine.machineName]) {
                        $scope.barsData[machine.machineName] = {
                            cur: (events[machine.machineName] ? events[machine.machineName][0] : null),
                            ref: (eventsRef[machine.machineName] ? eventsRef[machine.machineName][0] : null)
                        }
                        $scope.keys.push(machine.machineName);
                    }
                });

                $scope.keys = _.sortBy($scope.keys, function (machinesName) {
                    return -events[machinesName][0].total;
                })
            }

            calcHeightY();
            updateGraph();
        }
        function updateTicks(total) {
            if ($scope.options.settings.timeV) {
                $scope.tickW = Math.ceil(total / 6 / 60) * 60;
            } else {
                $scope.tickW = Math.ceil(total / 5 / 5) * 5;
            }
            $scope.ticks = _.range(0, total, $scope.tickW);
            $scope.ticks = _.sortBy($scope.ticks, function (n) {
                return -n;
            });
            $scope.total = total;
        }
        function calcHeightY() {
            if ($scope.barsData == {}) {
                return;
            }

            const emptyRef ={
                key : '',
                noCommC: 0,
                noCommD:0,
                value: [],
                total:0
            };

            angular.forEach($scope.barsData,function(item){
                if (item.cur && item.ref==null){
                    const emptyValue = item.cur.value[0]||{};
                    item.ref = {...emptyRef, key:item.cur.key,value:[{...emptyValue,value: 0}] };
                }
            });

            var overAllTotal = 0;
            _.forIn($scope.barsData, function (value, key) {
                if (value.cur && value.cur.total) {
                    if (value.cur.total > overAllTotal) {
                        overAllTotal = value.cur.total;
                    }
                }
                if (value.ref && value.ref.total) {
                    if ($scope.options.settings.compare && value.ref.total > overAllTotal) {
                        overAllTotal = value.ref.total;
                    }
                }
            });
            updateTicks(overAllTotal);
            _.forIn($scope.barsData, function (value, key) {
                if (value.cur && value.cur.value) {
                    var curTemp = 0;
                    _.forEach(value.cur.value, function (event) {
                        var height = 0;
                        var maxTotal = value.cur.total;
                        if ($scope.options.settings.compare && value.ref) {
                            maxTotal = value.cur.total > value.ref.total ? value.cur.total : value.ref.total;
                        }
                        if ($scope.options.settings.scale) {
                            maxTotal = overAllTotal;
                        }
                        height = event.value / maxTotal * 93;
                        curTemp += height;
                        event['height'] = height;
                        event['y'] = curTemp;
                    })
                }
                if (value.ref && value.ref.value) {
                    var refTemp = 0;
                    _.forEach(value.ref.value, function (event) {
                        var height = 0;
                        var maxTotal = value.ref.total;
                        if (value.cur) {
                            maxTotal = value.cur.total > value.ref.total ? value.cur.total : value.ref.total;
                        }
                        if ($scope.options.settings.scale) {
                            maxTotal = overAllTotal;
                        }
                        height = event.value / maxTotal * 93;
                        refTemp += height;
                        event['height'] = height;
                        event['y'] = refTemp;
                    })
                }
            });
        }

        $scope.updateCompare = shiftService.updateCompare;

        function groupByValue(event) {
            if (event.Duration > $scope.options.settings.maxVal) {
                return '> ' + $scope.options.settings.maxVal + $filter('translate')('MIN');
            }
            else if ((event.Duration <= $scope.options.settings.midMaxVal) && (event.Duration >= $scope.options.settings.midMinVal)) {
                return $scope.options.settings.midMinVal + '-' + $scope.options.settings.midMaxVal + $filter('translate')('MIN');
            }
            else {
                return '< ' + $scope.options.settings.minVal + $filter('translate')('MIN');
            }
        }
        function groupByMachine(event) {
            return event.MachineName;
        }

        function machinesEventFilter(event) {
            if ($scope.shiftData.MachineID) {
                return event.MachineID == $scope.shiftData.MachineID &&
                    $scope.options.settings.filterR[event.EventReasonID] &&
                    $scope.options.settings.filterG[event.EventGroupID];
            }
            return $scope.shiftData.machinesDisplay[event.MachineID] &&
                $scope.options.settings.filterR[event.EventReasonID] &&
                $scope.options.settings.filterG[event.EventGroupID];
        }

        function durationFilter(event) {
            var value = $scope.options.settings.timeV ? event.Duration : event.Duration;
            if ((value > $scope.options.settings.maxVal) && $scope.options.settings.maxBar) {
                return true;
            }
            else if ((value <= $scope.options.settings.midMaxVal) && (value >= $scope.options.settings.midMinVal) && $scope.options.settings.midBar) {
                return true;
            }
            else if ((value < $scope.options.settings.minVal) && $scope.options.settings.minBar) {
                return true;
            }
            return false;
        }

        function updateGraph() {
            var days;
            var hours;
            var minutes;
            var yAxisType;
            var timeRange = $scope.ticks;
            timeRange.sort();
            var test222 = []
            var max = 0;      

            $scope.ticks.forEach(currentItem => {
                hours = Math.floor(currentItem / 60);
                minutes = currentItem % 60;
                if (hours < 10) hours = "0" + hours;
                if (minutes < 10) minutes = "0" + minutes;
                v = hours + ":" + minutes;
                test222.unshift(v)
            });

            //convert the minutes to (days and (hours and minutes)) or (hours and minutes )
            function convertMinutesToHours(fullMinutes) {
                if (fullMinutes >= 1440) {
                    days = parseInt(fullMinutes / 1440);
                    temp = parseInt(fullMinutes % 1440);
                    if (temp > 59) {
                        hours = parseInt(temp / 60);
                        temp = temp % 60;
                        if (temp > 60) {
                            minutes = temp / 60
                        }
                        else {
                            minutes = temp;
                        }
                    }
                    else {
                        hours = temp;
                    }
                    if (hours > 0) return days + "d" + hours + "h";
                    return days + "d" + minutes + "m"
                }
                else {
                    hours = parseInt((fullMinutes / 60));
                    minutes = parseInt(fullMinutes % 60);
                    if (hours < 10) hours = "0" + hours;
                    if (minutes < 10) minutes = "0" + minutes;
                    return hours + ":" + minutes;
                }
            }
            //array for data for today
            $scope.today = []
            //array for the data in (last day or last week or last month)
            $scope.past = []

            var total = 0;
            if (!$scope.options.settings.scale){
                for (var key in $scope.barsData){
                    var obj = $scope.barsData[key];
                    if (obj && obj.cur && obj.cur.total && obj.cur.total > total){
                        total = obj.cur.total;
                    }
                    if (obj && obj.ref && obj.ref.total && obj.ref.total > total){
                        total = obj.ref.total;
                    }
                }
            }

            var tickIntervalT = [];
            $scope.seriesData = []
            //prepare the data for series in highcharts
            var updateSeriesData = function(groupIndex, key,value,stack,color,k,pattern){
                var existSeries = _.find($scope.seriesData,{name : $scope.options.settings.division ? key : $scope.keys[groupIndex],stack: stack});
                if (existSeries){
                    existSeries.data[groupIndex][0] = (existSeries.data[groupIndex][0] === null ? 0 : existSeries.data[groupIndex][0]) + value;
                    // TODO replace in next version
                    // existSeries.data[groupIndex][1] = color;
                    existSeries.data[groupIndex][1] = 'rgb(191, 22, 32)';
                    existSeries.data[groupIndex][2] = (existSeries.data[groupIndex][2] === null ? 0 : existSeries.data[groupIndex][2]) + k;
                }
                else{
                    var dataArray = _.map($scope.keys,function(){
                        return [null,'none',null];
                    });
                    dataArray[groupIndex][0] = (dataArray[groupIndex][0] === null ? 0 : dataArray[groupIndex][0]) + value;
                    // TODO replace in next version
                    // existSeries.data[groupIndex][1] = color;
                    dataArray[groupIndex][1] = 'rgb(191, 22, 32)';
                    dataArray[groupIndex][2] = (dataArray[groupIndex][2] === null ? 0 : dataArray[groupIndex][2]) + k;
                    var newObj = {
                        name: $scope.options.settings.division ? key : $scope.keys[groupIndex],
                        data: dataArray,
                        stack: stack,
                        keys: ['y', 'color','k']
                    };
                    if (pattern){
                        newObj.keys[1] = 'color.pattern.color';
                        newObj.color = {
                            pattern : {
                                id: "custom-compare-pattern" + groupIndex,
                                path: 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2',
                                width: 4,
                                height: 4 
                            }
                        };
                    }
                    $scope.seriesData.push(newObj);
                }
            }

            $scope.keys.forEach(function (curr, i) {
                var currTotal = $scope.barsData && $scope.barsData[curr] && $scope.barsData[curr].cur 
                    && $scope.barsData[curr].cur.total || 0;

                var currColor = $scope.barsData && $scope.barsData[curr] && $scope.barsData[curr].cur 
                && $scope.barsData[curr].cur.value && $scope.barsData[curr].cur.value[0] && $scope.barsData[curr].cur.value[0].color || 'black';
                var refTotal = $scope.barsData && $scope.barsData[curr] && $scope.barsData[curr].ref
                && $scope.barsData[curr].ref.total || 0;

                var refColor = $scope.barsData && $scope.barsData[curr] && $scope.barsData[curr].ref 
                && $scope.barsData[curr].ref.value && $scope.barsData[curr].ref.value[0] && $scope.barsData[curr].ref.value[0].color || 'black';
                
                if ($scope.options.settings.compareWith != 'none') {
                    if ($scope.barsData[curr].ref != null) {
                        if (currTotal < refTotal) {
                            if ($scope.barsData[curr].cur && $scope.barsData[curr].cur.value) {
                                $scope.barsData[curr].cur.value.forEach(function(machineData){
                                    if ($scope.options.settings.scale){
                                        //TODO replace in next version
                                        // updateSeriesData(i,machineData.key,machineData.value,'current',machineData.color,machineData.value);
                                        updateSeriesData(i,machineData.key,machineData.value,'current','rgb(191, 22, 32)',machineData.value);
                                    }
                                    else{
                                        updateSeriesData(i,
                                            machineData.key,
                                            (machineData.value / $scope.barsData[curr].cur.total) * $scope.barsData[curr].ref.total,
                                            'current',
                                            //TODO replace in next version
                                            // machineData.color,
                                            'rgb(191, 22, 32)',
                                            machineData.value);
                                    }
                                });
                            }
                            if ($scope.barsData[curr].ref && $scope.barsData[curr].ref.value) {
                                $scope.barsData[curr].ref.value.forEach(function(machineData){
                                    if ($scope.options.settings.scale){
                                        //TODO replace in next version                                        
                                        // updateSeriesData(i,machineData.key,machineData.value,'compare',machineData.color,machineData.value, true);
                                        updateSeriesData(i,machineData.key,machineData.value,'compare',machineData.color,machineData.value, true);
                                    }
                                    else{
                                        updateSeriesData(i,
                                            machineData.key,
                                            (machineData.value / $scope.barsData[curr].ref.total) * total,
                                            'compare',
                                            //TODO replace in next version
                                            // machineData.color,
                                            'rgb(191, 22, 32)',
                                            machineData.value,
                                            true);
                                    }
                                });
                            }
                        }
                        else {
                            if ($scope.barsData[curr].cur && $scope.barsData[curr].cur.value) {
                                $scope.barsData[curr].cur.value.forEach(function(machineData){
                                    if ($scope.options.settings.scale){
                                        //TODO replace in next version
                                        // updateSeriesData(i,machineData.key,machineData.value,'current',machineData.color,machineData.value);
                                        updateSeriesData(i,machineData.key,machineData.value,'current','rgb(191, 22, 32)',machineData.value);
                                    }
                                    else{
                                        updateSeriesData(i,
                                            machineData.key,
                                            (machineData.value / $scope.barsData[curr].cur.total) * total,
                                            'current',
                                            //TODO replace in next version
                                            // machineData.color,
                                            'rgb(191, 22, 32)',
                                            machineData.value);
                                    }
                                });
                            }
                            if ($scope.barsData[curr].ref && $scope.barsData[curr].ref.value) {
                                $scope.barsData[curr].ref.value.forEach(function(machineData){
                                    if ($scope.options.settings.scale){
                                        //TODO replace in next version
                                        // updateSeriesData(i,machineData.key,machineData.value,'compare',machineData.color,machineData.value,true);
                                        updateSeriesData(i,machineData.key,machineData.value,'compare','rgb(191, 22, 32)',machineData.value,true);
                                    }
                                    else{
                                        updateSeriesData(i,
                                            machineData.key,
                                            (machineData.value / $scope.barsData[curr].ref.total) * $scope.barsData[curr].cur.total,
                                            'compare',
                                            //TODO replace in next version
                                            // machineData.color,
                                            'rgb(191, 22, 32)',
                                            machineData.value,
                                            true);
                                    }
                                });
                            }
                        }
                    }
                    else{
                        // if ($scope.barsData[curr].cur && $scope.barsData[curr].cur.value) {
                        //     $scope.barsData[curr].cur.value.forEach(function(machineData){
                        //         updateSeriesData(i,machineData.key,machineData.value,'current',machineData.color,machineData.value);
                        //     });
                        // }
                    }
                    // else {
                    //     $scope.today.push([
                    //         currTotal,
                    //         currTotal
                    //     ]);
                    // }
                }
                else {
                    if ($scope.barsData[curr].cur && $scope.barsData[curr].cur.value) {
                        $scope.barsData[curr].cur.value.forEach(function(machineData){
                            if ($scope.options.settings.scale){
                                //TODO replace in next version
                                // updateSeriesData(i,machineData.key,machineData.value,'current',machineData.color,machineData.value);                            }
                                updateSeriesData(i,machineData.key,machineData.value,'current','rgb(191, 22, 32)',machineData.value);                            }
                            else{
                                updateSeriesData(i,
                                    machineData.key,
                                    (machineData.value / $scope.barsData[curr].cur.total) * total,
                                    'current',
                                    //TODO replace in next version
                                    // machineData.color,
                                    'rgb(191, 22, 32)',
                                    machineData.value);
                            }
                        });
                    }
                }
                
                timeRange = $scope.options.settings.scale ? timeRange : null;
                yAxisType = $scope.options.settings.scale ? "catagory" : "linear";
                if ($scope.options.settings.scale) {
                    if (timeRange.length > 1) {
                        tickIntervalT = timeRange[1] - timeRange[0];
                    }
                    else {
                        tickIntervalT = [];
                    }
                }
                else {
                    tickIntervalT = null
                }
            })

            //add all the data togother
            // if ($scope.options.settings.compareWith !== 'none') {
            //     $scope.seriesData.push({
            //         name: 'Past',
            //         data: $scope.past,
            //         color: {
            //             pattern: {
            //                 id: "custom-compare-pattern",
            //                 path: 'm -1 1 l 2 -2 m 0 11 l 10 -10 m -1 12 l 2 -2',
            //                 width: 11,
            //                 height: 11
            //             }
            //         },
            //         keys: ['y', 'color.pattern.color', 'k']
            //     });
            // } 
            
            
            // if (timeRange) {
            //     if (timeRange.length < 2 && $scope.options.settings.scale && ($scope.options.settings.group == 1)) {
            //         tickIntervalT.push(30);
            //         // for(var temp in $scope.seriesData)
            //         // {
            //         //     for (var x in $scope.seriesData[temp].data)
            //         //     {            
            //         //         if(max < $scope.seriesData[temp].data[x][0]) max = $scope.seriesData[temp].data[x][0];
            //         //     }                                
            //         // }                
            //         // tickIntervalT.push(max);
            //     }
            // }       
            
            if ($scope.buildGraphTimeout) {
                $timeout.cancel($scope.buildGraphTimeout);
            }       
            $scope.buildGraphTimeout = $timeout(function () {
                if ($scope.Chart){
                    $scope.Chart.update({
                        series : $scope.seriesData,
                        xAxis: {
                            categories: $scope.keys
                        },
                        yAxis: {
                            type: yAxisType,
                            tickInterval: tickIntervalT,
                            categories: timeRange
                        }
                    },true,true);
                }
                else{
                    var chartOptions ={
    
                        series: $scope.seriesData,
                        title: {
                            text: ''
                        },
                        exporting: {
                            enabled: false
                        },
                        chart: {
                            type: 'column',
                            resize: {
                                enabled: true
                            }
                        },
                        xAxis: {
                            type: "category",
                            categories: $scope.keys,
                            resize: {
                                enabled: true
                            }
                        }, 
                        legend: {
                            enabled: false
                        },
                        yAxis: {
                            type: yAxisType,
                            title: {
                                text: null
                            },
                            stackLabels: {
                                enabled: false,
                                style: {
                                    fontWeight: 'bold',
                                    color: ( // theme
                                        Highcharts.defaultOptions.title.style &&
                                        Highcharts.defaultOptions.title.style.color
                                    ) || 'gray'
                                },
                                formatter: function(value){                                    
                                    if ($scope.options.settings.timeV) {
                                        return convertMinutesToHours(this.total);
                                    }
                                    else {
                                        return this.total;
                                    }
                                }
                            },
                            tickInterval: tickIntervalT,
                            categories: timeRange,
                            labels: {
                                formatter: function () {
                                    if ($scope.options.settings.timeV && $scope.options.settings.scale) {
                                        return convertMinutesToHours(this.value);
                                    }
                                    else {
                                        if (!$scope.options.settings.scale) {
                                            return;
                                        }
                                        else {
                                            return this.value
                                        }
                                    }
    
                                }
                            },
    
                        },
                        tooltip: {
                            formatter: function () {
                                if ($scope.options.settings.timeV ) {
                                    return '<b>' + this.series.name + '</b><br/>' +
                                        convertMinutesToHours(this.point.k);
                                }
                                return '<b>' + this.series.name + '</b><br/>' +
                                    this.point.k;
                            }
                        },
                        plotOptions: {
                            column: {
                                stacking: 'normal',
                                dataLabels: {
                                    enabled: true,
                                    formatter: function (){
                                        if ($scope.options.settings.timeV) {
                                            return convertMinutesToHours(this.point.k);
                                        }
                                        else {
                                            return this.point.k;
                                        }
                                    }
                                }
                            }
                        },
                        responsive: true
                    }
                    $scope.Chart = Highcharts.chart(('container' + $scope.$id),chartOptions );
                }

                $scope.updateGraphSize();
            }, 300);

        };

        $(window).resize(function () {
            $scope.updateGraphSize();
        });

        $scope.$watch("options", function (newV, oldV) {    
            if (newV.width !== oldV.width || newV.height !== oldV.height) {
                $scope.updateGraphSize();
            }
        }, true);

        $scope.$watch('options.settings.division',function(newVal,oldVal){
            if (newVal !== oldVal){

            }
        })
        
        $scope.updateGraphSize = function () {
            if ($scope.updateGraphInProgress) {
                $timeout.cancel($scope.updateGraphInProgress);
            }
            $scope.updateGraphInProgress = $timeout(function () {
                $scope.Chart.setSize($($element).width(), $($element).height() - 55);
            }, 250);
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

    $scope.totals=[];

    let appendReasonsSumRow = function(eventsGroupsArray, subGroupLength){
        if (!validArray(eventsGroupsArray)) {
            return;
        }
        for (let i = 0; i < eventsGroupsArray.length; i++) {
            let subGroupsSum = [];
            for(let k = 0; k < subGroupLength; k++){
                if(eventsGroupsArray[i].data.length == 1){  
                    subGroupsSum = eventsGroupsArray[i].data[0].slice(1, eventsGroupsArray[i].data[0].length + 1) //ditching first cell because its reserved for subgroup name
                    break;
                }
                let sum = {};
                let totalDuration = 0;
                let totalNumOfEvents = 0;
                for (let j = 0; j < eventsGroupsArray[i].data.length; j++) {
                    totalDuration+= eventsGroupsArray[i].data[j][k+1].duration;
                    totalNumOfEvents+= eventsGroupsArray[i].data[j][k+1].duration; //k+1 because the first cell is reserved for the subgroup name
                }
                sum['duration'] = totalDuration;
                sum['totalNumOfEvents'] = totalNumOfEvents;
                subGroupsSum.push(sum);
            }
            eventsGroupsArray[i]['subGroupsSum'] = subGroupsSum;
            // $scope.totals[i] =subGroupsSum;
        }
        // console.log($scope.totals);
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
                    sumOverMachine[k]['duration'] += eventsGroupsArray[i].data[j][k + 1].duration;//k+1 because first element is an array
                    sumOverMachine[k]['numOfEvents'] += eventsGroupsArray[i].data[j][k + 1].numOfEvents;
                }
            }
        }
        sumOverMachine.unshift(getTranslation('TOTAL'))
        let reasonsArr = [];
        reasonsArr.push(sumOverMachine);
        addGroupOfSumOverColumn(eventsGroupsArray, reasonsArr, getTranslation('TOTAL'), true);
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
    let extractEventReasons = function (data) {
        return _.groupBy(data, 'EventReason');
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
        $scope.simpleTableName = "Status"               
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
        if (!dataArray || !Array.isArray(dataArray) || dataArray.length < 1) {;
            $scope.table = false;
            return;
        }
        else {
            $scope.table = true;
            $scope.numOfEventsEnabled = true;
            $scope.machinesArray = extractMachineNames(dataArray);
            $scope.tableData = extractTableData(dataArray, $scope.machinesArray); 
            $scope.columns =[];
            angular.forEach($scope.machinesArray , (machine)=>{
                let col = {ColumnName:machine ,Value:machine}
                $scope.columns.push(col);
             } )           
            var tempDataTable =[];
            $scope.ySimpleTable= []        
            $scope.yResponsiveTable= [];        
            $scope.dataSimpleTable = []
            for(var name in $scope.tableData)
            {
                for (var reason in $scope.tableData[name].data)
                {                                                                                                                                         
                        $scope.ySimpleTable.push($scope.tableData[name].data[reason][0])
                        const col = {
                            name : $scope.tableData[name].data[reason][0],
                            title: $scope.tableData[name].data[reason][0],
                            joshTree: false,
                            class : 'ellipsisText',
                            style: {
                                    'padding-left': '0.8em',
                                    'backgroundColor': 'white',
                                    'borderbottom': '0px solid #c0c0c0',
                                },
                                machineId: 12,
                        };
                        $scope.yResponsiveTable.push(col);
                        if($scope.tableData[name].filter == true)
                       {     
                            tempDataTable= []                               
                            for(var i = 1 ; i < $scope.tableData[name].data[reason].length ;  i++)                                                                              
                            {       
                                let duration = $filter('getDurationInHoursMinutes')($scope.tableData[name].data[reason][i].duration) ;
                                let numOfEvents = $scope.tableData[name].data[reason][i].numOfEvents ;
                                if (i != $scope.tableData[name].data[reason].length-1) {
                                    duration = duration? `${duration} (${numOfEvents})` : "-";
                                }else {
                                    $scope.totals.push({
                                        value:($scope.tableData[name].data[reason][i].duration),
                                        duration : duration , 
                                        numOfEvents : numOfEvents ,
                                        durationWithNumOfEvents : duration? `${duration} (${numOfEvents})` : "-",
                                    });
                                }
                                tempDataTable.push({duration: duration,
                                numOfEvents: numOfEvents,
                                style:{"backgroundColor":"white","border":"0px solid #c0c0c0"},
                                hideTitle:true,
                                machineId:12,
                                });
                            }
                            $scope.dataSimpleTable.push(tempDataTable)
                        }    
                        else
                        {
                            for(var i = 1 ; i < $scope.tableData[name].data[reason].length ;  i++)                                                                              
                            {
                                let duration = $scope.tableData[name].data[reason][i].duration ;
                                let numOfEvents = $scope.tableData[name].data[reason][i].numOfEvents ;
                                // duration = duration? `${duration} (${numOfEvents})` : "-";
                                tempDataTable.push({duration: duration, numOfEvents: numOfEvents,style:{"backgroundColor":"white","border":"0px solid #c0c0c0"},hideTitle:true,machineId:12});
                            }
                            $scope.dataSimpleTable.push(tempDataTable)
                        }                            
                }     
            }                        
                       
        }
        calculateTotalsPercentage();
    }

    $scope.totalsInPercentage=[];
    let calculateTotalsPercentage = function () {
        $scope.totalsInPercentage= [];
        let max = $scope.totals[0].value;
        angular.forEach($scope.totals,(total)=>{
            if(total.value > max){
                max = total.value ;
            }
        });
        angular.forEach($scope.totals,(total)=>{
            $scope.totalsInPercentage.push({
                value : (( total.value / max  ) *100).toFixed(2),   
                duration : total.duration , 
                numOfEvents : total.numOfEvents ,
                durationWithNumOfEvents : total.durationWithNumOfEvents,
            });
        });
    }
    
    $scope.$watch('rawData', function () {
        if ($scope.rawData) {
            makeTableData($scope.rawData);
            // updateTableSize() //i wonder if i even need this
        }
    });
    }
  


    return {
        restrict: "E",
        templateUrl: Template,
        controller: controller,
        controllerAs: 'shiftDistributionCtrl',
        scope: {
            "options": "=",
            "graph": "="
        }
    };
};


angular
    .module('LeaderMESfe')
    .directive('shiftDistributionDirective', shiftDistributionDirective); 