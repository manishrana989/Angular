function DashboardCtrl($scope, LeaderMESservice, $timeout, $filter, ngProgressFactory, DASHBOARD_CONSTANTS, BASE_URL, $modal, $sessionStorage) {
    var dashboardCtrl = this;
    dashboardCtrl.time = "ShiftStartTime";
    dashboardCtrl.graphs = ['GAUGE','TIME_TREND', 'COMPARISON_BAR'];
    dashboardCtrl.firstTime = true;
    dashboardCtrl.openModal = 0;
    dashboardCtrl.object = {};
    dashboardCtrl.dateData = {
        startTime: null,
        endTime: null,
        startTimec: null,
        endTimec: null
    };

    var subMenuId = $sessionStorage.stateParams.subMenu.SubMenuAppPartID;
    var subMenuExtID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
    // $scope.dateNow= new Date();
    dashboardCtrl.dateData.graphsDisplay = 12;
    dashboardCtrl.rtl = LeaderMESservice.isLanguageRTL();
    dashboardCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    dashboardCtrl.data = [];
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.start();
    $scope.progressbar.setColor(DASHBOARD_CONSTANTS.blue);
    dashboardCtrl.refreshData = true;
    dashboardCtrl.loadingGraphs = true;
    dashboardCtrl.chartGraphs = [];

    dashboardCtrl.startTimeChanged = function (event) {
        event.target.blur();
        if (!dashboardCtrl.dateData.startTime.isBefore(dashboardCtrl.dateData.endTime)) {
            dashboardCtrl.dateData.endTime = dashboardCtrl.dateData.startTime;
        }
        dashboardCtrl.enabled = false;
        $timeout(function () {
            dashboardCtrl.enabled = true;
        });
    };
    dashboardCtrl.startTimecChanged = function (event) {
        event.target.blur();
        if (!dashboardCtrl.dateData.startTimec.isBefore(dashboardCtrl.dateData.endTimec)) {
            dashboardCtrl.dateData.endTimec = dashboardCtrl.dateData.startTimec;
        }
        dashboardCtrl.enabledc = false;
        $timeout(function () {
            dashboardCtrl.enabledc = true;
        });
    };

    dashboardCtrl.endTimeChanged = function (event) {
        event.target.blur();

    };
    // dashboardCtrl.checkTime = function(number,date2)
    // {
    //     dashboardCtrl.errorMessage=0;
    //     if(number==1)
    //     {
    //         if(dashboardCtrl.dateData.endTime<dashboardCtrl.dateData.startTime)
    //         {  dashboardCtrl.errorMessage =1;}
    //
    //     }
    //     else if(number==2)
    //     {
    //         if(dashboardCtrl.dateData.endTimec<dashboardCtrl.dateData.startTimec)
    //         {  dashboardCtrl.errorMessage =2;}
    //
    //     }
    // }
    /*** modal dialog*/

    dashboardCtrl.openModalDialog = function (index) {
        var graphModalInstance = $modal.open({

            templateUrl: 'views/dashboard/graphModal.html',
            resolve: {
                allData: function () {
                    return dashboardCtrl;
                },
                dataObjects: function () {
                    return dashboardCtrl.dataObjects;
                },
                graphNumber: function () {
                    return index;
                }
            },
            controller: function ($scope, $modalInstance, LeaderMESservice, $timeout, allData, dataObjects, DASHBOARD_CONSTANTS, graphNumber) {
                $scope.init = function () {
                    var data = allData.data;
                    $scope.currentGraph = allData.currentGraph;
                    allData.ActiveKpisArray = [];
                    // dashboardCtrl.ActiveKpisArray= dashboardCtrl.kpiStruct;
                    for (var i = 0; i < allData.kpiStruct.length; i++) {
                        if (allData.kpiStruct[i].isActive)
                            allData.ActiveKpisArray.push(i);
                    }
                    $scope.ActiveKpisArray = allData.ActiveKpisArray;
                    if ($scope.currentGraph == "TIME_TREND") {
                        if (allData.dateData.dateType !== "Day") {
                            var times = calculateDays(allData.object.date.startDate, allData.object.date.endDate);
                            var timesc = calculateDays(allData.object.date.startDatec, allData.object.date.endDatec);
                            var flag = true;
                            var from = new Date(allData.dateData.startTime);
                            var to = new Date(allData.dateData.endTime);
                            if (allData.dateData.dateType == 'Custom' && from.getDate() == to.getDate() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear()) {
                                daysRange = data[0];
                                daysRangec = data[1];
                                flag = false;
                            }
                            if (flag) {
                                var daysRange = [];
                                var xAxis = {};
                                xAxis.length = 0;
                                xAxis.years = [];
                                for (var i = 0; i < times.length; i++) {
                                    xAxis.years.push({year: times[i].year});
                                    xAxis.years[i].months = [];
                                    for (var j = 0; j < times[i].months.length; j++) {
                                        xAxis.length += times[i].months[j].days.length;

                                        xAxis.years[i].months.push({month: times[i].months[j].month});
                                        xAxis.years[i].months[j].days = times[i].months[j].days;
                                        daysRange = daysRange.concat(xAxis.years[i].months[j].days);
                                    }

                                }

                                var daysRangec = [];
                                var xAxisc = {};

                                xAxisc.length = 0;
                                xAxisc.years = [];
                                for (var i = 0; i < timesc.length; i++) {
                                    xAxisc.years.push({year: timesc[i].year});
                                    xAxisc.years[i].months = [];
                                    for (var j = 0; j < timesc[i].months.length; j++) {
                                        xAxisc.length += timesc[i].months[j].days.length;

                                        xAxisc.years[i].months.push({month: timesc[i].months[j].month});
                                        xAxisc.years[i].months[j].days = timesc[i].months[j].days;
                                        daysRangec = daysRangec.concat(xAxisc.years[i].months[j].days);
                                    }

                                }
                                var daysRangeWithoutYear = [];
                                for (var i = 0; i < daysRange.length; i++) {
                                    var index = daysRange[i].indexOf('-');
                                    daysRangeWithoutYear.push(daysRange[i].substring(index + 1, daysRange[i].length));
                                }
                                if (dashboardCtrl.rtl) {
                                    daysRangeWithoutYear = dashboardCtrl.changeDateToRTL(daysRangeWithoutYear);
                                }
                            }

                        }
                        else {
                            daysRange = data[0];
                            daysRangec = data[1];

                        }

                    }

                    $timeout(function () {
                        // $scope.progressbar = ngProgressFactory.createInstance();
                        // $scope.progressbar.start();
                        // $scope.progressbar.setColor(DASHBOARD_CONSTANTS.blue);                    if (allData.kpiStruct[i].isActive) {
                        var kpiError = _.find(allData.KpiErrors, {"kpiStructNumber": i});
                        switch ($scope.currentGraph) {
                            case 'GAUGE':
                                $scope.createGauges($scope.currentGraph, data, graphNumber, kpiError);
                                break;
                            case 'TIME_TREND':
                                $scope.createBasicLine($scope.currentGraph, data, graphNumber, kpiError, xAxis, daysRange, xAxisc, daysRangec, daysRangeWithoutYear);
                                break;
                            case 'COMPARISON_BAR':
                                $scope.createStackedAndGroupedColumn($scope.currentGraph, data, graphNumber, kpiError);
                                break;

                        }

                    });
                }

                $scope.createBasicLine = function (graph, data, index, error, xAxis, daysRange, xAxisc, daysRangec, daysRangeWithoutYear) {
                    if (error) {
                        setting = {
                            exporting: {enabled: false}
                        };
                    }
                    else {
                        var series = [];
                        var object = [];
                        var comapreObject = [];

                        var DateType = "Days";
                        var from = new Date(allData.dateData.startTime);
                        var to = new Date(allData.dateData.endTime);
                        if (allData.object.dateType == "Day" || (allData.dateData.dateType == 'Custom' && from.getDate() == to.getDate() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear())) {
                            DateType = "Hours";
                            daysRangeWithoutYear = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
                            if (data[0]) {
                                var children = data[0].data[index].children;
                                for (var i = 0; i < 24; i++) {
                                    var child = _.find(children, {"child": i.toString()});
                                    if (!child) {
                                        object.push(0)
                                    }
                                    else {
                                        if (isNaN(child.result) || child.result=="-Infinity")
                                            object.push(0);
                                        else object.push(child.result)
                                    }
                                }
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: object,
                                    color: DASHBOARD_CONSTANTS.blue,
                                    zIndex: 4
                                });
                            }
                            if (data[1]) {
                                var comparedChildren = data[1].comparedData[index].children;

                                for (var i = 0; i < 24; i++) {

                                    var comparedChild = _.find(comparedChildren, {"child": i.toString()});
                                    if (!comparedChild) {
                                        comapreObject.push(0);
                                    }
                                    else {
                                        if (isNaN(comparedChild.result) || child.result=="-Infinity")
                                            comapreObject.push(0);
                                        else if( child.result>2 || child.result=="Infinity")
                                        {
                                            comapreObject.push(2);
                                        }
                                        else
                                            comapreObject.push(comparedChild.result);
                                    }
                                }

                                series.push({
                                    name: $filter('translate')('COMPARED_DATA'),
                                    data: comapreObject,
                                    color: DASHBOARD_CONSTANTS.orange,
                                    zIndex: 4
                                });
                            }


                        }
                        else {
                            if (data[0]) {
                                var children = data[0].data[index].children;
                                for (var i = 0; i < daysRange.length; i++) {
                                    var child = _.find(children, {"child": daysRange[i]});
                                    if (!child) {
                                        object.push(0)
                                    }
                                    else {
                                        if (isNaN(child.result) || child.result=='-Infinity')
                                            object.push(0);
                                        else if(child.result>2 || child.result=='Infinity')
                                            object.push(2);
                                        else object.push(child.result)
                                    }
                                }
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: object,
                                    color: DASHBOARD_CONSTANTS.blue,
                                    zIndex: 4
                                });
                            }
                            if (data[1]) {
                                var comparedChildren = data[1].comparedData[index].children;

                                for (var i = 0; i < daysRangec.length; i++) {

                                    var comparedChild = _.find(comparedChildren, {"child": daysRangec[i]});
                                    if (!comparedChild) {
                                        comapreObject.push(0);
                                    }
                                    else {
                                        if (isNaN(comparedChild.result) || comparedChild.result<0 || comparedChild.result=="-Infinity")
                                            comapreObject.push(0);
                                        else if(comparedChild.result>2 || comparedChild.result=="Infinity")
                                        {
                                            comapreObject.push(2);
                                        }
                                        else
                                            comapreObject.push(comparedChild.result);
                                    }
                                }

                                series.push({
                                    name: $filter('translate')('COMPARED_DATA'),
                                    data: comapreObject,
                                    color: DASHBOARD_CONSTANTS.orange,
                                    zIndex: 4
                                });
                            }

                        }
                        series.push({
                            name: ' ',
                            type: 'scatter',

                            marker: {
                                enabled: false,
                                color: DASHBOARD_CONSTANTS.blue
                            },
                            data: [dashboardCtrl.kpiStruct[index].HValue]
                        });
                        var iconPlaceHolder = $filter('translate')('MINIMIZE');
                        var lang = {
                            tooltip: iconPlaceHolder
                        }
                        setting = {
                            lang: lang,
                            title: {
                                text: (allData.localLanguage ? allData.kpiStruct[index].LName : allData.kpiStruct[index].EName)
                                , style: {fontSize: DASHBOARD_CONSTANTS.titleFontSizeModal}
                            },
                            tooltip: {
                                formatter: function () {
                                    return Math.round(this.y * 100) / 100;
                                }
                            },
                            subtitle: {
                                text: ''
                            },
                            xAxis: {
                                categories: daysRangeWithoutYear,
                                type: 'datetime',
                                title: {
                                    text: DateType
                                }
                            },
                            yAxis: {

                                plotLines: [
                                    {
                                        value: allData.kpiStruct[index].HValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'High Value',
                                            align: 'left'
                                        }
                                    }
                                    ,
                                    {
                                        value: allData.kpiStruct[index].LValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'Low Value',
                                            align: 'left'
                                        }
                                    }
                                ]

                            },

                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: DASHBOARD_CONSTANTS.contextButton
                                    },
                                    customButton: DASHBOARD_CONSTANTS.modal.modalCustomButton
                                }
                            },
                            series: series
                        };
                        setting.exporting.buttons.customButton.onclick = function () {
                            $modalInstance.close();
                        }


                    }
                    Highcharts.chart('container', setting);
                };
                $scope.createStackedAndGroupedColumn = function (graph, data, index, error) {
                    var series = [];
                    if (error) {
                        setting = {
                            exporting: {enabled: false}
                        };

                    }
                    else {
                        if (data[0]) {
                            var childrenResult = _.map(data[0].data[index].children, "result");
                            // var fixedChildrenResult=   showJustTwoDecimals(childrenResult);
                            var fixedChildrenResult = childrenResult;
                            series.push(
                                {
                                    name: $filter('translate')('DATA'),
                                    data: childrenResult,
                                    stack: 'Data',
                                    color: DASHBOARD_CONSTANTS.blue,
                                    zIndex: 4
                                }, {
                                    name: ' ',
                                    type: 'scatter',
                                    marker: {
                                        enabled: false
                                    },
                                    data: [allData.kpiStruct[index].HValue]
                                },
                                {
                                    name: ' ',
                                    type: 'scatter',
                                    marker: {
                                        enabled: false
                                    },
                                    data: [allData.kpiStruct[index].LValue]
                                }
                            )
                        }
                        var childrenIDs = _.map(data[0].data[index].children, "child");
                        // var comparedChildrenIDs= _.map(data[1].comparedData[i].children,"child");
                        if (data[1] !== undefined) {
                            var comparedChildrenResult = _.map(data[1].comparedData[index].children, "result");
                            // var fixedComparedChildrenResult=   showJustTwoDecimals(comparedChildrenResult);
                            var fixedComparedChildrenResult = comparedChildrenResult;
                            series.push({
                                name: $filter('translate')('COMPARED_DATA'),
                                data: fixedComparedChildrenResult,
                                stack: 'Compared Data',
                                color: DASHBOARD_CONSTANTS.orange,
                                zIndex: 4

                            })

                        }

                        var iconPlaceHolder = $filter('translate')('MINIMIZE');
                        var lang = {
                            tooltip: iconPlaceHolder
                        }
                        var setting = {
                            chart: {
                                type: 'column'
                            },
                            lang: lang,
                            title: {
                                text: (allData.localLanguage ? allData.kpiStruct[index].LName : allData.kpiStruct[index].EName),
                                style: {fontSize: DASHBOARD_CONSTANTS.titleFontSizeModal}
                            },

                            xAxis: {
                                categories: childrenIDs
                            },

                            yAxis: {
                                title: {
                                    enabled: true,
                                    text: 'Values'
                                },
                                allowDecimals: false,
                                min: 0,

                                plotLines: [
                                    {
                                        value: allData.kpiStruct[index].HValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'High Value',
                                            align: 'left'
                                        }
                                    }
                                    ,
                                    {
                                        value: allData.kpiStruct[index].LValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'Low Value',
                                            align: 'left'
                                        }
                                    }
                                ]
                            },

                            tooltip: {
                                formatter: function () {
                                    return Math.round(this.y * 100) / 100;
                                }
                            },

                            plotOptions: {
                                column: {
                                    stacking: 'normal'
                                }
                            },
                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: DASHBOARD_CONSTANTS.contextButton
                                    },
                                    customButton: DASHBOARD_CONSTANTS.modal.modalCustomButton
                                }
                            },
                            series: series

                        }
                        setting.exporting.buttons.customButton.onclick = function () {
                            $modalInstance.close();
                        }

                    }

                    Highcharts.chart('container', setting);


                };

                $scope.createGauges = function (graph, data, index, error) {
                    if (!Highcharts.theme) {
                        Highcharts.setOptions({
                            colors: [DASHBOARD_CONSTANTS.red, DASHBOARD_CONSTANTS.blue, DASHBOARD_CONSTANTS.orange, DASHBOARD_CONSTANTS.shadedBlue],
                        });
                    }
                    var iconPlaceHolder = $filter('translate')('MINIMIZE');
                    var lang = {
                        tooltip: iconPlaceHolder
                    }
                    if (data[0] && data[1]) {

                        var gaugeOptions = {

                            chart: {
                                type: 'solidgauge'
                            },
                            lang: lang,

                            title: null,

                            pane: {
                                center: ['50%', '80%'],
                                size: '130%',
                                startAngle: -90,
                                endAngle: 90,
                                background: [{
                                    backgroundColor: DASHBOARD_CONSTANTS.grey,
                                    innerRadius: '65%',
                                    outerRadius: '90%',
                                    borderWidth: 1,
                                    shape: 'arc',
                                    borderColor: '#ccc'
                                },
                                    {
                                        backgroundColor: DASHBOARD_CONSTANTS.grey,
                                        innerRadius: '90%',
                                        outerRadius: '115%',
                                        shape: 'arc',
                                        borderWidth: 1,
                                        borderColor: '#ccc'
                                    }]
                            },

                            tooltip: {
                                positioner: function () {
                                    return {x: 10, y: 50};
                                },
                                shadow: false,
                                borderWidth: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                pointFormat: '<span style="color:{point.color} ">{series.name}: {point.x}</span>',
                                style: {"fontSize": "40px"}
                            },

                            // the value axis
                            yAxis: {

                                lineWidth: 0,
                                minorTickInterval: null,
                                tickPixelInterval: 400,
                                tickWidth: 0,
                                tickPositions: [allData.kpiStruct[index].LValue, allData.kpiStruct[index].HValue],
                                title: {
                                    y: 50
                                },
                                labels: {
                                    align: 'center',
                                    distance: -25,
                                    x: 0,
                                    y: 40,
                                    style: {
                                        "fontSize": "40px", color: Highcharts.getOptions().colors[3]
                                    }
                                }
                            },

                            plotOptions: {
                                solidgauge: {
                                    dataLabels: {
                                        y: -110,
                                        borderWidth: 0,
                                        useHTML: true
                                    }
                                }
                            },
                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: DASHBOARD_CONSTANTS.contextButton
                                    },
                                    customButton: DASHBOARD_CONSTANTS.modal.modalCustomButton
                                }
                            },

                        };
                        gaugeOptions.exporting.buttons.customButton.onclick = function () {
                            $modalInstance.close();
                        }
                    }
                    else if (data[0] && !data[1]) {

                        var gaugeOptions = {

                            chart: {
                                type: 'solidgauge'
                            },
                            lang: lang,

                            title: null,

                            pane: {
                                center: ['50%', '80%'],
                                size: '130%',
                                startAngle: -90,
                                endAngle: 90,
                                background: [
                                    {
                                        backgroundColor: DASHBOARD_CONSTANTS.grey,
                                        innerRadius: '65%',
                                        outerRadius: '115%',
                                        shape: 'arc',
                                        borderColor: '#ccc'
                                    }
                                ]
                            },

                            tooltip: {
                                positioner: function () {
                                    return {x: 10, y: 50};
                                },
                                shadow: false,
                                borderWidth: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                pointFormat: '<span style="color:{point.color} ">{series.name}: {point.x}</span>',
                                style: {"fontSize": "40px"}
                            },

                            // the value axis
                            yAxis: {
                                lineWidth: 0,
                                minorTickInterval: null,
                                tickPixelInterval: 400,
                                tickWidth: 0,
                                tickPositions: [allData.kpiStruct[index].LValue, allData.kpiStruct[index].HValue],
                                title: {
                                    y: 50,
                                    style: {"fontSize": "40px"}
                                },
                                labels: {
                                    align: 'center',
                                    distance: -11,
                                    y: 60,
                                    style: {"fontSize": "40px", color: Highcharts.getOptions().colors[3]}
                                }
                            },

                            plotOptions: {
                                solidgauge: {
                                    dataLabels: {
                                        y: -80,
                                        borderWidth: 0,
                                        useHTML: true
                                    }
                                }
                            },

                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: DASHBOARD_CONSTANTS.contextButton
                                    },
                                    customButton: DASHBOARD_CONSTANTS.modal.modalCustomButton
                                }
                            },
                        };
                        gaugeOptions.exporting.buttons.customButton.onclick = function () {
                            $modalInstance.close();
                        }
                    }


                    if (error) {
                        Highcharts.chart('container', Highcharts.merge(gaugeOptions, {
                            title: {text: $filter('translate')('NODATA')}
                        }));
                    }
                    else {

                        var series = [];
                        if (data[0] && data[1]) {
                            gaugeOptions.title = {
                                text: (allData.localLanguage ? allData.kpiStruct[index].LName : allData.kpiStruct[index].EName),
                                style: {fontSize: DASHBOARD_CONSTANTS.titleFontSizeModal}
                            };

                            var num1 = Math.round(parseFloat(data[0].data[index].children[0].result) * 100) / 100;
                            // if (num1 == 'Infinity') {
                            //     num1 = NaN;
                            // }
                            // else
                            if (num1 == '-Infinity' || num1 < 0) {
                                num1 = 0;
                            }
                            else if (num1 == 'Infinity' || num1 > 2) {
                                num1 = 2;
                            }
                            var numTemp = num1;
                            var color;
                            if (num1 >= dashboardCtrl.kpiStruct[index].HValue) {
                                color = Highcharts.getOptions().colors[0];
                            }
                            else {
                                color = Highcharts.getOptions().colors[1];
                            }

                            if (!isNaN(num1)) {
                                if (num1 <= allData.kpiStruct[index].LValue) {
                                    numTemp = allData.kpiStruct[index].LValue + allData.kpiStruct[index].LValue * 0.05;
                                    color = Highcharts.getOptions().colors[0];
                                }
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: [{
                                        color: color,
                                        radius: '91%',
                                        innerRadius: '115%',
                                        dataLabels: {
                                            format: '<div style="padding-top:0px;margin-top:0px;padding-bottom:0px;padding-bottom:0px;text-align:center"><span style="font-size:70px;color:' + color + '">' + num1.toFixed(2) + '</span>' +
                                            '</div>'
                                            , x: 0,
                                            y: -110,
                                            zIndex: 3

                                        },
                                        y: numTemp,
                                        x: num1.toFixed(2)
                                    }]

                                })
                            }
                            else {
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: [{
                                        color: color,
                                        radius: '91%',
                                        innerRadius: '115%',
                                        dataLabels: {
                                            format: '<div style="padding-top:0px;margin-top:0px;padding-bottom:0px;padding-bottom:0px;text-align:center"><span  style="font-size:70px;color:' + color + '">(No Data)</span>' +
                                            '</div>'
                                            , x: 0,
                                            y: -110

                                        },
                                        y: num1,
                                        x: 0
                                    }]
                                    , tooltip: {
                                        positioner: function () {
                                            return {x: 30, y: 25};
                                        },
                                        shadow: false,
                                        borderWidth: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        pointFormat: '<span style="color:{point.color} ">' + $filter('translate')('NODATA') + '</span>'
                                    }
                                })
                            }

                        }
                        else if (data[0] && !data[1]) {
                            gaugeOptions.title = {
                                text: (allData.localLanguage ? allData.kpiStruct[index].LName : allData.kpiStruct[index].EName),
                                style: {fontSize: DASHBOARD_CONSTANTS.titleFontSizeModal}
                            };

                            var num1 = Math.round(parseFloat(data[0].data[index].children[0].result) * 100) / 100;
                            var numTemp = num1;
                            var color;
                            if (num1 > 2) {
                                num1 = 2;
                            }
                            if (num1 >= allData.kpiStruct[index].HValue) {
                                color = Highcharts.getOptions().colors[0];
                            }
                            else {
                                color = Highcharts.getOptions().colors[1];
                            }
                            if (num1 <= allData.kpiStruct[index].LValue) {
                                numTemp = allData.kpiStruct[index].LValue + allData.kpiStruct[index].LValue * 0.05;
                                color = Highcharts.getOptions().colors[0];
                            }
                            if (!isNaN(num1)) {
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: [{
                                        color: color,
                                        radius: '65%',
                                        innerRadius: '115%',
                                        dataLabels: {
                                            format: '<div style="text-align:center"><span style="font-size:80px;color:' + color + '">' + num1.toFixed(2) + '</span>' +
                                            '</div>'
                                            , x: 0,
                                            y: -120

                                        },
                                        y: numTemp,
                                        x: num1.toFixed(2)
                                    }]

                                })
                            }
                            else {
                                series.push({
                                    name: $filter('translate')('DATA'),
                                    data: [{
                                        color: color,
                                        radius: '65%',
                                        innerRadius: '115%',
                                        dataLabels: {
                                            format: '<div style="text-align:center"><span style="font-size:80px;color:' + color + '">(' + $filter('translate')('NODATA') + ')</span>' +
                                            '</div>'
                                            , x: 0,
                                            y: -120

                                        },
                                        y: num1,
                                        x: 0
                                    }],
                                    tooltip: {
                                        positioner: function () {
                                            return {x: 30, y: 25};
                                        },
                                        shadow: false,
                                        borderWidth: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        pointFormat: '<span style="color:{point.color} ">' + $filter('translate')('NODATA') + '</span>'
                                    }
                                })
                            }


                        }
                        if (data[1]) {
                            // gaugeOptions.title = {text: dashboardCtrl.kpiStruct[index].EName};
                            var num2 = Math.round(parseFloat(data[1].comparedData[index].children[0].result) * 100) / 100;
                            if (num2 == 'Infinity' || num2 > 2) {
                                num2 = 2;
                            }
                            else if (num2 == '-Infinity' || num2 < 0) {
                                num2 = 0;
                            }
                            var numTemp = num2;
                            if (num2 >= allData.kpiStruct[index].HValue) {
                                color = Highcharts.getOptions().colors[0];
                            }
                            else {
                                color = Highcharts.getOptions().colors[2];
                            }
                            if (!isNaN(num2)) {

                                if (num2 <= allData.kpiStruct[index].LValue) {
                                    numTemp = allData.kpiStruct[index].LValue + allData.kpiStruct[index].LValue * 0.05;
                                    color = Highcharts.getOptions().colors[0];
                                }

                                series.push({
                                    name: $filter('translate')('COMPARED_DATA'),
                                    data: [{
                                        color: color,
                                        radius: '65%',
                                        innerRadius: '89%',
                                        dataLabels: {

                                            format: '<span  style="text-align:center;font-size:50px;color:' + color + '">(' + num2.toFixed(2) + ')</span>',
                                            x: 0,
                                            y: 5,
                                        },
                                        y: numTemp,
                                        x: num2.toFixed(2)
                                    }]
                                });
                            }
                            else {
                                series.push({
                                    name: $filter('translate')('COMPARED_DATA'),
                                    data: [{
                                        color: color,
                                        radius: '65%',
                                        innerRadius: '89%',
                                        dataLabels: {
                                            format: '<span  style="text-align:center;font-size:50px;color:' + color + '">(' + $filter('translate')('NOCOMPAREDDATA') + ')</span>',
                                            x: 0,
                                            y: 5,
                                        },
                                        y: num2,
                                        x: 0
                                    }],
                                    tooltip: {
                                        positioner: function () {
                                            return {x: 30, y: 25};
                                        },
                                        shadow: false,
                                        borderWidth: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        pointFormat: '<span style="color:{point.color} ">' + $filter('translate')('NOCOMPAREDDATA') + '</span>'
                                    }

                                })
                            }
                        }

                        Highcharts.chart('container', Highcharts.merge(gaugeOptions,
                            {
                                yAxis: {
                                    min: allData.kpiStruct[index].LValue,
                                    max: allData.kpiStruct[index].HValue,
                                    title: {
                                        text: ''
                                    },
                                    labels: {
                                        style: {
                                            color: Highcharts.getOptions().colors[3]
                                        }
                                    }
                                },

                                credits: {
                                    enabled: false
                                },

                                series: series


                            }
                        ));
                    }
                    ;

                }
                $scope.init();


            }
        }).result.then(function (result) {


        });
    };
    dashboardCtrl.saveKPIStructure = function () {
        var ob = {
            comparedSlider: dashboardCtrl.object.comparedSlider,
            date: {
                type: dashboardCtrl.object.dateType,
                dateChosen: {
                    startTime: dashboardCtrl.object.startTime,
                    endTime: dashboardCtrl.object.endTime,
                    preDefinedTime: dashboardCtrl.object.chosenDate
                },
                dateChosenCompare: {
                    startTime: dashboardCtrl.object.startTimec,
                    endTime: dashboardCtrl.object.endTimec,
                    preDefinedTime: dashboardCtrl.object.chosenDatec
                }
            },
            dimension: {
                parentDimension: dashboardCtrl.object.dimension.ParentDimension.DimensionField,
                childDimension: dashboardCtrl.object.dimension.ChildDimension.DimensionField,
                values: [
                    {
                        parentComboValue: 1,
                        childComboValues: [1, 2]
                    }
                ]
            },
            graphType: dashboardCtrl.newCurrentGraph,
            graphsDisplay: dashboardCtrl.dateData.graphsDisplay

        };
        ob.dimension.values = [];
        for (var i = 0; i < dashboardCtrl.object.parentDimension.length; i++) {
            var currentParent = dashboardCtrl.object.parentDimension[i];
            var childsArray = [];
            for (var j = 0; j < dashboardCtrl.object.childDimension.length; j++) {
                var x = _.find(currentParent.ChildcomboValues, {"ComboQueryEField": dashboardCtrl.object.childDimension[j].ComboQueryEField});
                if (x)
                    childsArray.push(x.ComboValueField);
            }
            ob.dimension.values.push({
                "parentComboValue": currentParent.ComboValueField,
                "childComboValues": childsArray
            });
        }

        // //
        var newString = JSON.stringify(ob);
        //LeaderMESservice.SaveKPIStructure({"kpiStructure": {"KpiStructure": newString}}).then(function (response) {
            // dashboardCtrl.refreshData = false;
        //});

    };

    var KpiStructure = [];
    dashboardCtrl.initializeObject = function () {
        LeaderMESservice.GetKPIStructure().then(function (response) {
            if (response && response.KpiStructure) {
                var result = response.KpiStructure.replace(/'/g, "\"");

                 KpiStructure =JSON.parse(result);
                    dashboardCtrl.dateData.comparedSlider = KpiStructure.comparedSlider;
                    dashboardCtrl.dateData.graphsDisplay = KpiStructure.graphsDisplay;
                    dashboardCtrl.dateData.dateType = KpiStructure.date.type;
                    dashboardCtrl.dateData.startTime = KpiStructure.date.dateChosen.startTime;
                    dashboardCtrl.dateData.endTime = KpiStructure.date.dateChosen.endTime;
                    dashboardCtrl.dateData.chosenDate = KpiStructure.date.dateChosen.preDefinedTime;
                    dashboardCtrl.dateData.startTimec = KpiStructure.date.dateChosenCompare.startTime;
                    dashboardCtrl.dateData.endTimec = KpiStructure.date.dateChosenCompare.endTime;
                    dashboardCtrl.dateData.chosenDatec =KpiStructure.date.dateChosenCompare.preDefinedTime;
                    dashboardCtrl.dateData.chosenDatec = KpiStructure.date.dateChosenCompare.preDefinedTime;
                    dashboardCtrl.dateData.chosenDatec = KpiStructure.date.dateChosenCompare.preDefinedTime;
                    if(KpiStructure.graphType =='GAUGE') KpiStructure.graphType = 'COMPARISON_BAR';
                    dashboardCtrl.newCurrentGraph = KpiStructure.graphType;
                    dashboardCtrl.initGraph(dashboardCtrl.dateData.graphsDisplay);
                
                if (dashboardCtrl.dateData.dateType && dashboardCtrl.dateData.startTime) {
                    dashboardCtrl.enabled = true;
                }
                if (dashboardCtrl.dateData.dateType && dashboardCtrl.dateData.startTimec) {
                    dashboardCtrl.enabledc = true;
                }
                // dashboardCtrl.graphClicked(dashboardCtrl.dateData.graphsDisplay,true );

                LeaderMESservice.getDimensionsData().then(function (response) {
                    if (response) {
                        if (!response.error) {
                            dashboardCtrl.dimenstionData = response.AllDeimensions;
                            dashboardCtrl.parentDimension = [];
                            dashboardCtrl.childDimension = [];
                            dashboardCtrl.dimension = _.find(dashboardCtrl.dimenstionData, function (row) {
                                    if (row.ParentDimension.DimensionField == KpiStructure.dimension.parentDimension && row.ChildDimension.DimensionField == KpiStructure.dimension.childDimension) {
                                        return true;
                                }
                            })
                            if (dashboardCtrl.dimension) {
                              //  _.each(KpiStructure.dimension.values, function (row) {  
                                    if(subMenuId == 540){
                                        currentParent = [];
                                    }else{
                                        if(dashboardCtrl.dimension.ParentDimension.DimensionField == "Department"){
                                            dashboardCtrl.hideParentDim = true;
                                        }else{
                                            dashboardCtrl.hideParentDim = false;
                                        }
                                        var currentParent = _.find(dashboardCtrl.dimension.ParentValues, {"ComboValueField": subMenuExtID});
                                    }
                                    dashboardCtrl.parentDimension.push(currentParent);
                               // });

                                dashboardCtrl.updateChildComboValue();

                                dashboardCtrl.applyAndClose(2, true);
                            }

                            LeaderMESservice.GetKPIList().then(function (kpiListResponse) {
                                if (!kpiListResponse.error) {
                                    dashboardCtrl.kpiStruct = kpiListResponse.Data;
                                    dashboardCtrl.buildDataAndShowGraph();
                                }
                            });

                        }
                    }
                })
            }
        })


    };


    dashboardCtrl.resetComparedValues = function (dateType) {
        if (!dashboardCtrl.dateData.comparedSlider) {
            if (dateType == 'custom') {
                dashboardCtrl.dateData.startTimec = null;
                dashboardCtrl.dateData.endTimec = null;
            }
            else {
                dashboardCtrl.dateData.chosenDatec = null;
            }
        }
        else {
            /**
             * put default compared value
             */

            switch (dashboardCtrl.dateData.dateType) {
                case 'Day' :
                    dashboardCtrl.dateData.chosenDatec = "Previous Day";
                    break;
                case 'Week' :
                    dashboardCtrl.dateData.chosenDatec = "Previous Week";
                    break;
                case 'Month' :
                    dashboardCtrl.dateData.chosenDatec = "Previous Month";
                    break;
                case 'Custom' :
                    break;
            }

        }
    };

    dashboardCtrl.initializeObject();

    // dashboardCtrl.checkCustomDateValidity = function (startTime, endTime, startTimec, endTimec) {
    //     dashboardCtrl.dateErrorMessage = null;
    //     if (!startTime || !endTime) {
    //         if (!startTime) {
    //             dashboardCtrl.dateErrorMessage = "CHOOSE_START_TIME";
    //         }
    //         if (!endTime) {
    //             dashboardCtrl.dateErrorMessage = "CHOOSE_END_TIME";
    //         }
    //         return false;
    //     }
    //     if (startTime > endTime) {
    //         dashboardCtrl.dateErrorMessage = "START_TIME_BIGGER_THAN_END_TIME";
    //     }
    //     if (!startTimec || !endTimec) {
    //         if (!startTimec) {
    //             dashboardCtrl.dateErrorMessage = "CHOOSE_COMPARED_START_TIME";
    //         }
    //         if (!endTimec) {
    //             dashboardCtrl.dateErrorMessage = "CHOOSE_COMPARED_END_TIME";
    //         }
    //         return false;
    //     }
    //     if (startTimec > endTimec) {
    //         dashboardCtrl.dateErrorMessage = "START_TIME_BIGGER_THAN_END_TIME";
    //     }
    //
    // };


    dashboardCtrl.applyAndClose = function (index, both) {
        dashboardCtrl.openModal = 0;
        dashboardCtrl.refreshData = true;
        if (index == 1 || both) {
            dashboardCtrl.object.comparedSlider = dashboardCtrl.dateData.comparedSlider;
            dashboardCtrl.object.graphsDisplay = dashboardCtrl.dateData.graphsDisplay;
            dashboardCtrl.object.chosenRange = dashboardCtrl.dateData.chosenRange;
            dashboardCtrl.object.dateType = dashboardCtrl.dateData.dateType;
            // dashboardCtrl.object.dateOptions = dashboardCtrl.dateData.dateOptions;
            dashboardCtrl.object.chosenDate = dashboardCtrl.dateData.chosenDate;
            dashboardCtrl.object.chosenDatec = dashboardCtrl.dateData.chosenDatec;
            dashboardCtrl.object.startTime = dashboardCtrl.dateData.startTime;

            // dashboardCtrl.checkCustomDateValidity(dashboardCtrl.object.startTime, dashboardCtrl.dateData.endTime, dashboardCtrl.dateData.startTimec, dashboardCtrl.dateData.endTimec);
            
            dashboardCtrl.object.endTime = dashboardCtrl.dateData.endTime;
            dashboardCtrl.object.startTimec = dashboardCtrl.dateData.startTimec;
            dashboardCtrl.object.endTimec = dashboardCtrl.dateData.endTimec;
            dashboardCtrl.calculateDate();
        }
        if (index == 2 || both) {
            // dashboardCtrl.object.comparedDatedisabled = dashboardCtrl.comparedDatedisabled;
            dashboardCtrl.object.dimension = dashboardCtrl.dimension;
            dashboardCtrl.object.parentDimension = dashboardCtrl.parentDimension;
            dashboardCtrl.object.childDimension = dashboardCtrl.childDimension;
            /** display the parent and child values*/
            dashboardCtrl.parentDimentionString = "";
            dashboardCtrl.childDimensionString = "";
            if (dashboardCtrl.object.parentDimension && dashboardCtrl.object.parentDimension.length > 0) {
                dashboardCtrl.object.parentDimentionString = _.map(dashboardCtrl.object.parentDimension, "ComboQueryEField").join(', ');
                if (dashboardCtrl.object.childDimension) {
                    dashboardCtrl.object.childDimensionString = _.map(dashboardCtrl.object.childDimension, "ComboQueryEField").join(', ');
                }
                else {
                    dashboardCtrl.object.childDimensionString = ""
                }
            }
            else {
                dashboardCtrl.object.parentDimentionString = "";
                dashboardCtrl.object.childDimensionString = "";
                dashboardCtrl.object.childDimension = [];
            }

        }
        // if (!both) {
        // dashboardCtrl.resetData(index, both);
        // }
    };

    // dashboardCtrl.resetData = function (index, clear) {
    // if (index == 1 || clear) {
    //
    //     dashboardCtrl.dateData =
    //         {
    //             dateType: null,
    //             chosenRange: null,
    //             comparedSlider: false,
    //             chosenDate: null,
    //             chosenDatec: null,
    //             startTime: null,
    //             endTime: null,
    //             startTimec: null,
    //             endTimec: null
    //         };
    //
    //
    // }
    // if (index == 2 || clear) {
    //     dashboardCtrl.dimension = null;
    //     dashboardCtrl.parentDimension = null;
    //     dashboardCtrl.childDimension = null;
    // }
    // if (index == 3 || clear) {
    //     dashboardCtrl.currentGraph = null;
    // }

    // }

    dashboardCtrl.cleanData = function (index) {
        if (index == 1) {
            dashboardCtrl.dateData.chosenRange = null;
            dashboardCtrl.dateData.comparedSlider = null;
            dashboardCtrl.dateData.chosenDate = null;
            dashboardCtrl.dateData.chosenDatec = null;
            dashboardCtrl.dateData.startTime = null;
            dashboardCtrl.dateData.endTime = null;
            dashboardCtrl.dateData.startTimec = null;
            dashboardCtrl.dateData.endTimec = null;
        }
        if (index == 2) {
            dashboardCtrl.dimension = null;
            dashboardCtrl.parentDimension = null;
            dashboardCtrl.childDimension = null;
        }
        if (index == 3) {
            dashboardCtrl.currentGraph = null;
        }
    };

    dashboardCtrl.close = function () {
        // dashboardCtrl.resetData();
        dashboardCtrl.openModal = 0;
    };

    dashboardCtrl.date = null;
    dashboardCtrl.chosenLabel = null;
    dashboardCtrl.chosenComparedLabel = null;
    dashboardCtrl.PreviousDate = null;
    dashboardCtrl.PreviousDate2 = null;

    dashboardCtrl.ComparedDatedisabled = [];
    dashboardCtrl.ComparedDatedisabled.length = 4;


    dashboardCtrl.clearChild = function () {
        dashboardCtrl.childDimension = "";
    };

    dashboardCtrl.fillDateType = function (dateType) {
        // var graphsDisplay = dashboardCtrl.dateData.graphsDisplay;
        // dashboardCtrl.dateData = {};
        dashboardCtrl.dateData.dateType = dateType;
        // $timeout(function () {
        //     dashboardCtrl.dateData.graphsDisplay = graphsDisplay;
        // });

        switch (dateType) {
            case 'Day' :
                $timeout(function () {
                    dashboardCtrl.dateData.chosenDate = "Today"
                });
                break;
            case 'Week' :
                $timeout(function () {
                    dashboardCtrl.dateData.chosenDate = "This Week"
                });
                break;
            case 'Month' :
                $timeout(function () {
                    dashboardCtrl.dateData.chosenDate = "Last 30 Days"
                });
                break;
        }
    };

    dashboardCtrl.resetAction = function () {
        if (dashboardCtrl.disableButtons) {
            return;
        }
        dashboardCtrl.disableButtons = true;
        $timeout(function () {
            $('.spin-icon').click();
        }, 100);
        LeaderMESservice.ResetGraphData().then(function (response) {
            dashboardCtrl.initializeObject();
            dashboardCtrl.disableButtons = false;
        })
    };

    dashboardCtrl.closeModal = function (index) {
        if (dashboardCtrl.openModal == index) {
            dashboardCtrl.openModal = 0
        }
    };

    dashboardCtrl.closeThis = function () {
        if ($scope.spinClosed == false) {
            $('.spin-icon').trigger('click');
        }
    };

    dashboardCtrl.clicked = function (field, event) {
        dashboardCtrl.openModal = field;
        if (field == 1 && !dashboardCtrl.firstTime) {
            dashboardCtrl.comparedDatedisabled = dashboardCtrl.object.comparedDatedisabled;
            dashboardCtrl.dateData.dateType = dashboardCtrl.object.dateType;
            dashboardCtrl.dateData.chosenRange = dashboardCtrl.object.chosenRange;
            dashboardCtrl.dateData.comparedSlider = dashboardCtrl.object.comparedSlider;
            // dashboardCtrl.dateData.graphsDisplay = dashboardCtrl.object.graphsDisplay;
            dashboardCtrl.dateOptions = dashboardCtrl.object.dateOptions;
            dashboardCtrl.dateData.chosenDate = dashboardCtrl.object.chosenDate;
            dashboardCtrl.ComparedDatedisabled = dashboardCtrl.object.ComparedDatedisabled;
            dashboardCtrl.dateData.chosenDatec = dashboardCtrl.object.chosenDatec;
            dashboardCtrl.dateData.startTime = dashboardCtrl.object.startTime;
            dashboardCtrl.dateData.endTime = dashboardCtrl.object.endTime;
            dashboardCtrl.dateData.startTimec = dashboardCtrl.object.startTimec;
            dashboardCtrl.dateData.endTimec = dashboardCtrl.object.endTimec;
        }
        else if (field == 1 && dashboardCtrl.firstTime) {
            dashboardCtrl.firstTime = false;
        }
        if (field == 2) {
                dashboardCtrl.dimension = dashboardCtrl.object.dimension;
                dashboardCtrl.parentDimension = dashboardCtrl.object.parentDimension;
                dashboardCtrl.childDimension = dashboardCtrl.object.childDimension;
        }
    };


    /** remove modals when clicking outside the div */
    $(document).mouseup(function (e) {

        var container = $(".modal1");
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0 && dashboardCtrl.openModal == 1) // ... nor a descendant of the container
        {
            dashboardCtrl.openModal = 0;
            $scope.$apply();
        }

        var container = $(".modal2");
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0 && dashboardCtrl.openModal == 2 && e.target.nodeName !== "LI") // ... nor a descendant of the container
        {
            dashboardCtrl.openModal = 0;
            $scope.$apply();
        }
    });


    dashboardCtrl.childAverage = function (data, field) {
        var divided = 0.0;
        var divider = 0.0;
        for (var i = 0; i < data.length; i++) {
            if (data[i][field.name] != null) {
                divided = divided + data[i][field.name];
                divider++;
            }
        }
        if (divider == 0.0) {
            return 0;
        }
        return divided / divider;
    };


    dashboardCtrl.sum = function (data) {
        var sumResult = 0.0;
        for (var key in dashboardCtrl.groupedRawDataPerChild) {
            if (dashboardCtrl.groupedRawDataPerChild[key] && !isNaN(dashboardCtrl.groupedRawDataPerChild[key][data.name])) {
                sumResult = sumResult + dashboardCtrl.groupedRawDataPerChild[key][data.name];
            }
        }
        return sumResult;
    };

    dashboardCtrl.mul = function (data1, data2) {
        var sumResult = 0.0;
        for (var key in dashboardCtrl.groupedRawDataPerChild) {
            if (dashboardCtrl.groupedRawDataPerChild[key] && !isNaN(dashboardCtrl.groupedRawDataPerChild[key][data1.name])
                && !isNaN(dashboardCtrl.groupedRawDataPerChild[key][data2.name])) {
                sumResult = sumResult + (dashboardCtrl.groupedRawDataPerChild[key][data1.name] * dashboardCtrl.groupedRawDataPerChild[key][data2.name]);
            }
        }
        return sumResult;
    };

    dashboardCtrl.div = function (data1, data2) {
        var sumResult = 0.0;
        for (var key in dashboardCtrl.groupedRawDataPerChild) {
            if (dashboardCtrl.groupedRawDataPerChild[key] && !isNaN(dashboardCtrl.groupedRawDataPerChild[key][data1.name])
                && !isNaN(dashboardCtrl.groupedRawDataPerChild[key][data2.name])) {
                sumResult = sumResult + (dashboardCtrl.groupedRawDataPerChild[key][data1.name] / dashboardCtrl.groupedRawDataPerChild[key][data2.name]);
                sumResult = sumResult + (dashboardCtrl.groupedRawDataPerChild[key][data1.name] / 0);
            }
        }
        return sumResult;
    };

    dashboardCtrl.mulKpi = function (data1, data2, data3, data4, data5, data6, data7, data8) {

        var sumResult = [];
        for (var i = 0; i < data1.length; i++) {
            var found = false;
            var tempSum = 1.0;
            if (data1 && !isNaN(data1[i].result)) {
                found = true;
                tempSum = tempSum * data1[i].result;
            }
            if (data2 && !isNaN(data2[i].result)) {
                found = true;
                tempSum = tempSum * data2[i].result;
            }
            if (data3 && !isNaN(data3[i].result)) {
                found = true;
                tempSum = tempSum * data3[i].result;
            }
            if (data4 && !isNaN(data4[i].result)) {
                found = true;
                tempSum = tempSum * data4[i].result;
            }
            if (data5 && !isNaN(data5[i].result)) {
                found = true;
                tempSum = tempSum * data5[i].result;
            }
            if (data6 && !isNaN(data6[i].result)) {
                found = true;
                tempSum = tempSum * data6[i].result;
            }
            if (data7 && !isNaN(data7[i].result)) {
                found = true;
                tempSum = tempSum * data7[i].result;
            }
            if (data8 && !isNaN(data8[i].result)) {
                found = true;
                tempSum = tempSum * data8[i].result;
            }
            if (tempSum == 1.0)
                tempSum = NaN;
            if (dashboardCtrl.currentGraph == 'GAUGE') {
                return tempSum;
            }
            if (found == true) {
                sumResult.push({
                    child: data1[i].child,
                    result: tempSum
                })
            }
            else {
                sumResult.push({
                    child: data1[i].child,
                    result: NaN
                });
            }
        }
        return sumResult;
    };


    jsonLogic.add_operation("sum", dashboardCtrl.sum);
    jsonLogic.add_operation("mul", dashboardCtrl.mul);
    jsonLogic.add_operation("div", dashboardCtrl.div);
    jsonLogic.add_operation("mulKpi", dashboardCtrl.mulKpi);


    dashboardCtrl.calculateResult = function () {
        dashboardCtrl.dataObjects = [];
        dashboardCtrl.kpiDataStruct = angular.copy(dashboardCtrl.kpiStruct);
        var logicData = [];
        var containKpi = false;
        var oneKpiAtLeastNotExists = false;
        var structWithKpi = [];
        dashboardCtrl.KpiErrors = [];
        for (var i = 0; i < dashboardCtrl.kpiDataStruct.length; i++) {
            oneKpiAtLeastNotExists = false;
            if (dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic == null)
                dashboardCtrl.KpiErrors.push({"kpiStructNumber": i, "errorMessage": "kpi is not declared"});
            else {
                var structData = JSON.parse(dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic).data;
                // var structData = dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic.data;
                var structLogic = JSON.parse(dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic).kpiLogic;
                // var structLogic = dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic.kpiLogic;
                var dataObject = {
                    "groupedRawData": dashboardCtrl.groupedRawData,
                    "kpiLogic": structLogic,
                    "kpiDataStruct": {},
                    "children": [],
                    "kpiEName": dashboardCtrl.kpiDataStruct[i].CalcFunctionName
                };

                for (var key in structData) {
                    if (key.indexOf("KPI") >= 0) {
                        var kpi = key.split("_")[0];
                        var foundKPI = _.findWhere(dashboardCtrl.dataObjects, {kpiEName: kpi});
                        if (foundKPI) {
                            containKpi = true;
                            structData[key] = foundKPI.children;
                        }
                        else {
                            oneKpiAtLeastNotExists = true;
                            structWithKpi.push(i);
                            containKpi = false;
                            structData[key] = 0.0;
                            break;

                        }
                    }
                    else {
                        structData[key] = {
                            name: key,
                            logicData: logicData
                        }
                    }
                }
                if (!oneKpiAtLeastNotExists) {
                    dataObject.kpiDataStruct = structData;
                    if (dashboardCtrl.currentGraph == "COMPARISON_BAR" || dashboardCtrl.currentGraph == "TIME_TREND") {
                        if (!containKpi) {
                            for (var rawData in dashboardCtrl.groupedRawData) {
                                dashboardCtrl.groupedRawDataPerChild = dashboardCtrl.groupedRawData[rawData];
                                if (dashboardCtrl.currentGraph == "TIME_TREND") {
                                    var index = rawData.indexOf('#');
                                    var child = rawData.substring(index + 1, rawData.length);
                                }
                                else {
                                    var index = rawData.indexOf('&');
                                    var child = rawData.substring(0, index);

                                }

                                dataObject.children.push({
                                    "child": child,
                                    "result": jsonLogic.apply(structLogic, structData)
                                });
                            }
                        }
                        else {
                            dataObject.children = jsonLogic.apply(structLogic, structData);
                        }
                    }
                    else if (dashboardCtrl.currentGraph == "GAUGE") {
                        if (dashboardCtrl.groupedRawData) {
                            dashboardCtrl.groupedRawDataPerChild = dashboardCtrl.groupedRawData;
                        }
                        else {
                            dashboardCtrl.groupedRawDataPerChild = [];
                        }

                        dataObject.children.push({
                            "child": "",
                            "result": jsonLogic.apply(structLogic, structData)
                        });
                    }


                    dashboardCtrl.dataObjects.push(dataObject);
                }
                else {
                    dashboardCtrl.dataObjects.push(dataObject);
                }
            }

        }

        /** like oee and pee , they need more round to get the values*/
        for (var i = 0; i < dashboardCtrl.kpiDataStruct.length; i++) {
            var index2 = structWithKpi.indexOf(i);

            if (index2 !== -1) {
                if (dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic == null)
                    dashboardCtrl.KpiErrors.push({"kpiStructNumber": i, "errorMessage": "kpi is not declared"});
                else {
                    var structData = JSON.parse(dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic).data;
                    // var structData = dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic.data;
                    var structLogic = JSON.parse(dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic).kpiLogic;
                    // var structLogic = dashboardCtrl.kpiDataStruct[i].CalcFunctionLogic.kpiLogic;
                    var dataObject = {
                        "groupedRawData": dashboardCtrl.groupedRawData,
                        "kpiLogic": structLogic,
                        "kpiDataStruct": {},
                        "children": [],
                        "kpiEName": dashboardCtrl.kpiDataStruct[i].CalcFunctionName
                    };

                    for (var key in structData) {
                        if (key.indexOf("KPI") >= 0) {
                            var kpi = key.split("_")[0];
                            var foundKPI = _.find(dashboardCtrl.dataObjects, {kpiEName: kpi});
                            if (foundKPI) {
                                containKpi = true;
                                structData[key] = foundKPI.children;
                            }
                            else {
                                structWithKpi.push(index);
                                containKpi = false;
                                structData[key] = 0.0;
                            }
                        }
                    }
                    dataObject.kpiDataStruct = structData;
                    if (dashboardCtrl.currentGraph == "COMPARISON_BAR" || dashboardCtrl.currentGraph == "TIME_TREND") {
                        if (!containKpi) {
                            for (var rawData in dashboardCtrl.groupedRawData) {
                                dashboardCtrl.groupedRawDataPerChild = dashboardCtrl.groupedRawData[rawData];
                                if (dashboardCtrl.currentGraph == "TIME_TREND") {
                                    var index = rawData.indexOf('#');
                                    var child = rawData.substring(index + 1, rawData.length);
                                }
                                else {
                                    var index = rawData.indexOf('&');
                                    var child = rawData.substring(0, index);

                                }

                                dataObject.children.push({
                                    "child": child,
                                    "result": jsonLogic.apply(structLogic, structData)
                                });
                            }
                        }
                        else {
                            dataObject.children = jsonLogic.apply(structLogic, structData);
                        }
                    }
                    else if (dashboardCtrl.currentGraph == "GAUGE") {
                        if (dashboardCtrl.groupedRawData) {
                            dashboardCtrl.groupedRawDataPerChild = dashboardCtrl.groupedRawData;
                        }
                        else {
                            dashboardCtrl.groupedRawDataPerChild = [];
                        }

                        dataObject.children.push({
                            "child": "",
                            "result": jsonLogic.apply(structLogic, structData)
                        });
                    }

                    dashboardCtrl.dataObjects[i] = dataObject;

                }
            }
        }
        return dashboardCtrl.dataObjects;
    }


    var initMonths = function () {
        dashboardCtrl.months = new Array(12);
        dashboardCtrl.months[0] = "January";
        dashboardCtrl.months[1] = "February";
        dashboardCtrl.months[2] = "March";
        dashboardCtrl.months[3] = "April";
        dashboardCtrl.months[4] = "May";
        dashboardCtrl.months[5] = "June";
        dashboardCtrl.months[6] = "July";
        dashboardCtrl.months[7] = "August";
        dashboardCtrl.months[8] = "September";
        dashboardCtrl.months[9] = "October";
        dashboardCtrl.months[10] = "November";
        dashboardCtrl.months[11] = "December";
    }();

    var buildDateString = function () {
        var monthstartDate = new Date(moment(dashboardCtrl.object.date.startDate)).getMonth();
        var monthendDate = new Date(moment(dashboardCtrl.object.date.endDate)).getMonth();
        var monthstartDatec = new Date(moment(dashboardCtrl.object.date.startDatec)).getMonth();
        var monthendDatec = new Date(moment(dashboardCtrl.object.date.endDatec)).getMonth();

        var daystartDate = new Date(moment(dashboardCtrl.object.date.startDate)).getDate();
        var dayendDate = new Date(moment(dashboardCtrl.object.date.endDate)).getDate();
        var daystartDatec = new Date(moment(dashboardCtrl.object.date.startDatec)).getDate();
        var dayendDatec = new Date(moment(dashboardCtrl.object.date.endDatec)).getDate();

        var yearstartDate = new Date(moment(dashboardCtrl.object.date.startDate)).getFullYear();
        var yearendDate = new Date(moment(dashboardCtrl.object.date.endDate)).getFullYear();
        var yearstartDatec = new Date(moment(dashboardCtrl.object.date.startDatec)).getFullYear();
        var yearendDatec = new Date(moment(dashboardCtrl.object.date.endDatec)).getFullYear();
        dashboardCtrl.dateStringDate = dashboardCtrl.months[monthstartDate] + " " + daystartDate + "," + yearstartDate + " - " + dashboardCtrl.months[monthendDate] + " " + dayendDate + "," + yearendDate;
        dashboardCtrl.dateStringComparedDate = '' + dashboardCtrl.months[monthstartDatec] + " " + daystartDatec + "," + yearstartDatec + " - " + dashboardCtrl.months[monthendDatec] + " " + dayendDatec + "," + yearendDatec;
    };

    dashboardCtrl.calculateDate = function () {
        dashboardCtrl.object.date = {};
        /** default values*/
        // dashboardCtrl.object.chosenDate = "Today";
        // dashboardCtrl.object.chosenDatec = "Previous Day";
        if (dashboardCtrl.object.dateType == "Custom") {
            dashboardCtrl.object.date.startDate = dashboardCtrl.object.startTime;
            dashboardCtrl.object.date.startDatec = dashboardCtrl.object.startTimec;
            dashboardCtrl.object.date.endDate = dashboardCtrl.object.endTime;
            dashboardCtrl.object.date.endDatec = dashboardCtrl.object.endTimec;
        }
        else {

            switch (dashboardCtrl.object.chosenDate) {
                case "Today":
                    dashboardCtrl.object.date.startDate = moment().subtract(0, 'days').startOf('day');
                    dashboardCtrl.object.date.endDate = moment().subtract(0, 'days').endOf('day');
                    break;
                case "Yesterday":
                    dashboardCtrl.object.date.startDate = moment().subtract(1, 'days').startOf('day');
                    dashboardCtrl.object.date.endDate = moment().subtract(1, 'days').endOf('day');
                    break;
                case "This Week":
                    dashboardCtrl.object.date.startDate = moment().subtract(0, 'week').startOf('week');
                    dashboardCtrl.object.date.endDate = moment().subtract(0, 'week').endOf('week');
                    break;
                case "Last 7 Days":
                    dashboardCtrl.object.date.startDate = moment().subtract(6, 'days');
                    dashboardCtrl.object.date.endDate = moment();
                    break;
                case "Last Week":
                    dashboardCtrl.object.date.startDate = moment().subtract(1, 'week').startOf('week');
                    dashboardCtrl.object.date.endDate = moment().subtract(1, 'week').endOf('week');
                    break;
                case "Last 30 Days":
                    dashboardCtrl.object.date.startDate = moment().subtract(29, 'days');
                    dashboardCtrl.object.date.endDate = moment().format('MM/DD/YYYY');
                    break;
                case "This Month":
                    dashboardCtrl.object.date.startDate = moment().startOf('month');
                    dashboardCtrl.object.date.endDate = moment().endOf('month');
                    break;
                case "Last Month":
                    dashboardCtrl.object.date.startDate = moment().subtract(1, 'month').startOf('month');
                    dashboardCtrl.object.date.endDate = moment().subtract(1, 'month').endOf('month');
                    break;
            }

            switch (dashboardCtrl.object.chosenDatec) {
                case "Previous Day":
                    if (dashboardCtrl.object.chosenDate == "Today") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'days').startOf('day');
                        dashboardCtrl.object.date.endDatec = moment().subtract(1, 'days').endOf('day');
                    }
                    else if (dashboardCtrl.object.chosenDate == "Yesterday") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(2, 'days').startOf('day');
                        dashboardCtrl.object.date.endDatec = moment().subtract(2, 'days').endOf('day');
                    }
                    break;
                case "Same Day Last Week":
                    dashboardCtrl.object.date.startDatec = moment().subtract(1, 'week');
                    dashboardCtrl.object.date.endDatec = moment().subtract(1, 'week');
                    break;
                case "Previous Week":
                    if (dashboardCtrl.object.chosenDate == 'Last 7 Days') {
                        dashboardCtrl.object.date.startDatec = moment().subtract(13, 'days');
                        dashboardCtrl.object.date.endDatec = moment().subtract(7, 'days');
                    }
                    else {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'week').startOf('week');
                        dashboardCtrl.object.date.endDatec = moment().subtract(1, 'week').endOf('week');
                    }
                    break;
                case "4 Weeks Ago":
                    if (dashboardCtrl.object.chosenDate == 'Last 7 Days') {
                        dashboardCtrl.object.date.startDatec = moment().subtract(34, 'days');
                        dashboardCtrl.object.date.endDatec = moment().subtract(28, 'days');
                    }
                    else {
                        dashboardCtrl.object.date.startDatec = moment().subtract(4, 'week').startOf('week');
                        dashboardCtrl.object.date.endDatec = moment().subtract(4, 'week').endOf('week');
                    }
                    break;
                case "Previous Month":
                    if (dashboardCtrl.object.chosenDate == "This Month") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'month').startOf('month');
                        dashboardCtrl.object.date.endDatec = moment().subtract(1, 'month').endOf('month');
                    }
                    else if (dashboardCtrl.object.chosenDate == "Last 30 Days") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'month').subtract(30, 'days');
                        dashboardCtrl.object.date.endDatec = moment().subtract(30, 'days');
                    }
                    else if (dashboardCtrl.object.chosenDate == "Last Month") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(2, 'month').startOf('month');
                        dashboardCtrl.object.date.endDatec = moment().subtract(2, 'month').endOf('month');
                    }
                    break;
                case "Same Month Last Year":
                    if (dashboardCtrl.object.chosenDate == "Last Month") {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'years').subtract(1, 'month').startOf('month');
                        dashboardCtrl.object.date.endDatec = moment().subtract(1, 'years').subtract(1, 'month').endOf('month');
                    }
                    else {
                        dashboardCtrl.object.date.startDatec = moment().subtract(1, 'years').subtract(0, 'month').startOf('month');
                        dashboardCtrl.object.date.endDatec = moment().subtract(1, 'years').subtract(0, 'month').endOf('month');
                    }
                    break;
            }
        }
        buildDateString();

    }

    dashboardCtrl.addXAxisName = function (kpiRawData) {
        var updateData = angular.copy(kpiRawData);
        if (dashboardCtrl.object.parentDimension) {

            if ((dashboardCtrl.object.parentDimension.length == 0) || (dashboardCtrl.object.parentDimension[0].length==0)) {
                for (var i = 0; i < updateData.length; i++) {
                    for (var j = 0; j < dashboardCtrl.dimenstionData.length; j++) {
                        var currentDimention = dashboardCtrl.dimenstionData[j];
                        var item = _.find(currentDimention.ParentValues, {"ComboValueField": updateData[i][dashboardCtrl.object.dimension.ParentDimension.DimensionName]})
                        if (item) {
                            updateData[i].XAxis = item.ComboQueryEField;
                        }
                    }


                }

            }
            else {
                if (dashboardCtrl.object.childDimension) {
                    for (var i = 0; i < updateData.length; i++) {
                        if (dashboardCtrl.object.childDimension.length > 0) {
                            for (var j = 0; j < dashboardCtrl.object.childDimension.length; j++) {
                                if (updateData[i][dashboardCtrl.object.dimension.ChildDimension.DimensionName+'ID'] == dashboardCtrl.object.childDimension[j].ComboValueField) {
                                    updateData[i].XAxis = dashboardCtrl.object.childDimension[j].ComboQueryEField;
                                }
                            }
                        }
                        else {
                            for (var j = 0; j < dashboardCtrl.dimenstionData.length; j++) {
                                var currentDimention = dashboardCtrl.dimenstionData[j];
                                for (var r = 0; r < currentDimention.ParentValues.length; r++) {
                                    var currentParent = currentDimention.ParentValues[r];
                                    var item = _.find(currentParent.ChildcomboValues, {"ComboValueField": updateData[i][dashboardCtrl.object.dimension.ChildDimension.DimensionName+'ID']})
                                    if (item) {
                                        updateData[i].XAxis = item.ComboQueryEField;
                                    }
                                }
                            }
                        }

                    }
                }
                else {
                    for (var i = 0; i < updateData.length; i++) {
                        for (var j = 0; j < dashboardCtrl.object.parentDimension.length; j++) {
                            if (updateData[i][dashboardCtrl.object.dimension.ParentDimension.DimensionName] == dashboardCtrl.object.parentDimension[j].ComboValueField) {
                                updateData[i].XAxis = dashboardCtrl.object.parentDimension[j].ComboQueryEField;

                            }
                        }

                    }
                }
            }


        }
        return updateData

    };

    dashboardCtrl.buildDataAndShowGraph = function () {
        $scope.disableShowGraphButton = true;
        var activeKPIs = dashboardCtrl.ActiveKpisArray;
        dashboardCtrl.ActiveKpisArray = null;
        $timeout(function () {
            dashboardCtrl.ActiveKpisArray = activeKPIs;
            $scope.progressbar.start();
            dashboardCtrl.loadingGraphs = true;
            dashboardCtrl.currentGraph = dashboardCtrl.newCurrentGraph;
            if (dashboardCtrl.currentGraph === 'Bar') dashboardCtrl.currentGraph = dashboardCtrl.newCurrentGraph = 'COMPARISON_BAR';
            if (dashboardCtrl.currentGraph === 'Line') dashboardCtrl.currentGraph = dashboardCtrl.newCurrentGraph = 'TIME_TREND';
            dashboardCtrl.ActiveKpisArray = [];
            var data = [];
            if (!dashboardCtrl.object.date)
                dashboardCtrl.object.date = {};
            /*** calculate dates*/
            dashboardCtrl.calculateDate();
            // if (!dashboardCtrl.refreshData ) {
            //     dashboardCtrl.kpiRawData = dashboardCtrl.kpiRawDataOrig;
            //     /*** filtering raw data for by dimentions */
            //     dashboardCtrl.kpiRawData = dashboardCtrl.filtering(dashboardCtrl.kpiRawData);
            //     if (dashboardCtrl.currentGraph == "COMPARISON_BAR") {
            //         dashboardCtrl.kpiRawData = dashboardCtrl.addXAxisName(dashboardCtrl.kpiRawData);
            //     }
            //     /*** grouping kpi's */
            //     dashboardCtrl.groupedRawData=   dashboardCtrl.grouping();
            //     /*** calculate result of kpi's*/
            //     data.push({"data": dashboardCtrl.calculateResult()});
            //     dashboardCtrl.data = data;
            //     if (dashboardCtrl.object.date.startDatec && dashboardCtrl.object.date.endDatec) {
            //         // dashboardCtrl.kpiRawData = kpiRawData1c;
            //         dashboardCtrl.kpiRawData = dashboardCtrl.kpiRawDataCompared;
            //         /*** filtering compared raw data for by dimentions */
            //         dashboardCtrl.kpiRawData = dashboardCtrl.filtering(dashboardCtrl.kpiRawData);
            //         if (dashboardCtrl.currentGraph == "COMPARISON_BAR") {
            //             dashboardCtrl.kpiRawData = dashboardCtrl.addXAxisName(dashboardCtrl.kpiRawData);
            //         }
            //         /*** grouping kpi's */
            //         dashboardCtrl.groupedRawData=    dashboardCtrl.grouping();
            //         /*** calculate result of kpi's*/
            //         data.push({"comparedData": dashboardCtrl.calculateResult()});
            //         /*** create graphs for kpi's with the calculated data */
            //         // dashboardCtrl.createGraph(dashboardCtrl.currentGraph, data);
            //
            //     }
            //     dashboardCtrl.createGraph(dashboardCtrl.currentGraph, data);
            //     dashboardCtrl.saveKPIStructure();
            //     $scope.disableShowGraphButton=false;
            //     return;
            //
            // }

            if(dashboardCtrl.parentDimension && dashboardCtrl.parentDimension.length>0){
                if(dashboardCtrl.parentDimension[0]){
                    if(dashboardCtrl.parentDimension[0].ComboQueryEField){
                         dashboardCtrl.object.dimension.ParentDimension.DimensionField = dashboardCtrl.parentDimension;
                    }
                }
            }

            if(dashboardCtrl.childDimension && dashboardCtrl.childDimension.length>0){
                dashboardCtrl.object.dimension.ChildDimension.DimensionField = dashboardCtrl.childDimension;
            }

            dashboardCtrl.applyAndClose(2, true);


            if (dashboardCtrl.object.dimension) {
/*                     _.each(dashboardCtrl.object.dimension, function (row) {  
                        dashboardCtrl.parentDimension= dashboardCtrl.dimension.ParentDimension.DimensionName;
                        dashboardCtrl.childDimension =[] ;
                   }); */
                /*** get kpi's raw data for time*/
                LeaderMESservice.getKPIRawData(moment(dashboardCtrl.object.date.startDate).format('YYYY-MM-DD 00:00:00'), moment(dashboardCtrl.object.date.endDate).format('YYYY-MM-DD 23:59:59')).then(function (response) {
                        // dashboardCtrl.kpiRawData = kpiRawData1;
                        dashboardCtrl.kpiRawDataOrig = response.Data;
                        dashboardCtrl.kpiRawData = response.Data;
                        /*** filtering raw data for by dimentions */
                        dashboardCtrl.kpiRawData = dashboardCtrl.filtering(dashboardCtrl.kpiRawData);
                        if (dashboardCtrl.currentGraph == "COMPARISON_BAR") {
                            dashboardCtrl.kpiRawData = dashboardCtrl.addXAxisName(dashboardCtrl.kpiRawData);
                        }
                        /*** grouping kpi's */
                        dashboardCtrl.groupedRawData = dashboardCtrl.grouping();
                        if(dashboardCtrl.groupedRawData){
                            delete dashboardCtrl.groupedRawData['undefined']; 
                        }
                        /*** calculate result of kpi's*/
                        data.push({"data": dashboardCtrl.calculateResult()});
                        dashboardCtrl.data = data;

                        if (dashboardCtrl.object.date.startDatec && dashboardCtrl.object.date.endDatec) {
                            /*** get kpi's raw data for compared time*/
                            LeaderMESservice.getKPIRawData(moment(dashboardCtrl.object.date.startDatec).format('YYYY-MM-DD 00:00:00'), moment(dashboardCtrl.object.date.endDatec).format('YYYY-MM-DD 23:59:59'),).then(function (response) {

                                // dashboardCtrl.kpiRawData = kpiRawData1c;
                                dashboardCtrl.kpiRawDataCompared = response.Data;
                                dashboardCtrl.kpiRawData = response.Data;
                                /*** filtering compared raw data for by dimentions */
                                dashboardCtrl.kpiRawData = dashboardCtrl.filtering(dashboardCtrl.kpiRawData);
                                if (dashboardCtrl.currentGraph == "COMPARISON_BAR") {
                                    dashboardCtrl.kpiRawData = dashboardCtrl.addXAxisName(dashboardCtrl.kpiRawData);
                                }
                                /*** grouping kpi's */
                                dashboardCtrl.groupedRawData = dashboardCtrl.grouping();
                                delete dashboardCtrl.groupedRawData['undefined']; 
                                /*** calculate result of kpi's*/
                                data.push({"comparedData": dashboardCtrl.calculateResult()});
                                /*** create graphs for kpi's with the calculated data */
                                dashboardCtrl.createGraph(dashboardCtrl.currentGraph, data);
                                //dashboardCtrl.saveKPIStructure();
                                $scope.disableShowGraphButton = false;

                            }, function () {
                                $scope.disableShowGraphButton = false;
                            })
                        }
                        else {
                            dashboardCtrl.createGraph(dashboardCtrl.currentGraph, data);
                            //dashboardCtrl.saveKPIStructure();
                            $scope.disableShowGraphButton = false;
                        }
                    }, function () {
                        $scope.disableShowGraphButton = false;
                    }
                )
            }
        });
    };

    // var getTimesArray = function () {
    //     var times = [];
    //     if (dashboardCtrl.dateData.dateType == "Day") {
    //         if (dashboardCtrl.dateData.chosenDate == "chosenDate") {
    //
    //         }
    //     }
    //
    //     else if (dashboardCtrl.dateData.dateType == "Week") {
    //
    //     }
    //     else if (dashboardCtrl.dateData.dateType == "Month") {
    //
    //     }
    //     return times;
    // }
    dashboardCtrl.changeDateToRTL = function (daysRangeWithoutYear) {
        var days = [];
        for (var i = 0; i < daysRangeWithoutYear.length; i++) {
            var index = daysRangeWithoutYear[i].indexOf('-');
            days.push(daysRangeWithoutYear[i].substring(index + 1, daysRangeWithoutYear[i].length) + "-" + daysRangeWithoutYear[i].substring(0, index));
        }
        return days;
    }

    dashboardCtrl.createGraph = function (graph, data) {
        dashboardCtrl.ActiveKpisArray = [];
        // dashboardCtrl.ActiveKpisArray= dashboardCtrl.kpiStruct;
        for (var i = 0; i < dashboardCtrl.kpiStruct.length; i++) {
            if (dashboardCtrl.kpiStruct[i].isActive)
                dashboardCtrl.ActiveKpisArray.push(i);
        }
        if (graph == "TIME_TREND") {
            if (dashboardCtrl.dateData.dateType !== "Day") {
                var times = calculateDays(dashboardCtrl.object.date.startDate, dashboardCtrl.object.date.endDate);
                var timesc = calculateDays(dashboardCtrl.object.date.startDatec, dashboardCtrl.object.date.endDatec);
                var flag = true;
                var from = new Date(dashboardCtrl.dateData.startTime);
                var to = new Date(dashboardCtrl.dateData.endTime);
                if (dashboardCtrl.dateData.dateType == 'Custom' && from.getDate() == to.getDate() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear()) {
                    daysRange = data[0];
                    daysRangec = data[1];
                    flag = false;
                }

                if (flag) {
                    var daysRange = [];
                    var xAxis = {};
                    xAxis.length = 0;
                    xAxis.years = [];
                    for (var i = 0; i < times.length; i++) {
                        xAxis.years.push({year: times[i].year});
                        xAxis.years[i].months = [];
                        for (var j = 0; j < times[i].months.length; j++) {
                            xAxis.length += times[i].months[j].days.length;

                            xAxis.years[i].months.push({month: times[i].months[j].month});
                            xAxis.years[i].months[j].days = times[i].months[j].days;
                            daysRange = daysRange.concat(xAxis.years[i].months[j].days);
                        }

                    }

                    var daysRangec = [];
                    var xAxisc = {};

                    xAxisc.length = 0;
                    xAxisc.years = [];
                    for (var i = 0; i < timesc.length; i++) {
                        xAxisc.years.push({year: timesc[i].year});
                        xAxisc.years[i].months = [];
                        for (var j = 0; j < timesc[i].months.length; j++) {
                            xAxisc.length += timesc[i].months[j].days.length;

                            xAxisc.years[i].months.push({month: timesc[i].months[j].month});
                            xAxisc.years[i].months[j].days = timesc[i].months[j].days;
                            daysRangec = daysRangec.concat(xAxisc.years[i].months[j].days);
                        }

                    }
                    var daysRangeWithoutYear = [];
                    for (var i = 0; i < daysRange.length; i++) {
                        var index = daysRange[i].indexOf('-');
                        daysRangeWithoutYear.push(daysRange[i].substring(index + 1, daysRange[i].length));
                    }
                    if (dashboardCtrl.rtl) {
                        daysRangeWithoutYear = dashboardCtrl.changeDateToRTL(daysRangeWithoutYear);
                    }


                }
            }
            else {
                daysRange = data[0];
                daysRangec = data[1];

            }


        }
        $timeout(function () {
            dashboardCtrl.chartGraphs = [];
            for (var i = 0; i < dashboardCtrl.kpiStruct.length; i++) {
                $scope.progressbar.complete();
                if (dashboardCtrl.kpiStruct[i].isActive) {
                    var kpiError = _.find(dashboardCtrl.KpiErrors, {"kpiStructNumber": i});
                    switch (graph) {
                        case 'GAUGE':
                            dashboardCtrl.createGauges(graph, data, i, kpiError);
                            break;
                        case 'TIME_TREND':
                            dashboardCtrl.createBasicLine(graph, data, i, kpiError, xAxis, daysRange, xAxisc, daysRangec, daysRangeWithoutYear);
                            break;
                        case 'COMPARISON_BAR':
                            dashboardCtrl.createStackedAndGroupedColumn(graph, data, i, kpiError);
                            break;

                    }
                }
            }
        });
    };

    $scope.$on('ngRepeatFinished', function () {
        dashboardCtrl.loadingGraphs = false;
    });

    dashboardCtrl.changeDimension = function () {
       dashboardCtrl.parentDimension = [];
       dashboardCtrl.childDimension = [];
        if(dashboardCtrl.dimension.ParentDimension.DimensionField == "Department"){
            dashboardCtrl.hideParentDim = true;
        }else{
            dashboardCtrl.hideParentDim = false;
        }
    };

    Array.prototype.unique = function () {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    };
    var contains = function (needle) {
        // Per spec, the way to identify NaN is that it is not equal to itself
        var findNaN = needle !== needle;
        var indexOf;

        if (!findNaN && typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (needle) {
                var i = -1, index = -1;

                for (i = 0; i < this.length; i++) {
                    var item = this[i];

                    if ((findNaN && item !== item) || item === needle) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(this, needle) > -1;
    };

    // function getlength(number) {
    //     return number.toString().length;
    // }

    dashboardCtrl.createGauges = function (graph, data, index, error) {

        if (!Highcharts.theme) {
            Highcharts.setOptions({
                colors: [DASHBOARD_CONSTANTS.red, DASHBOARD_CONSTANTS.blue, DASHBOARD_CONSTANTS.orange, DASHBOARD_CONSTANTS.shadedBlue]
            });
        }
        var iconPlaceHolder = $filter('translate')('MAXIMIZE');
        var lang = {
            tooltip: iconPlaceHolder
        };

        if (data[0] && data[1]) {

            var gaugeOptions = {

                chart: {
                    type: 'solidgauge'
                },
                lang: lang,
                title: null,
                pane: {
                    center: ['50%', '80%'],
                    size: '130%',
                    startAngle: -90,
                    endAngle: 90,
                    background: [{
                        backgroundColor: DASHBOARD_CONSTANTS.grey,
                        innerRadius: '65%',
                        outerRadius: '90%',
                        borderWidth: 1,
                        shape: 'arc',
                        borderColor: '#ccc'
                    },
                        {
                            backgroundColor: DASHBOARD_CONSTANTS.grey,
                            innerRadius: '90%',
                            outerRadius: '115%',
                            shape: 'arc',
                            borderWidth: 1,
                            borderColor: '#ccc'
                        }]
                },

                tooltip: {
                    positioner: function () {
                        return {x: 0, y: 32};
                    },
                    shadow: false,
                    borderWidth: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    pointFormat: '<span style="color:{point.color} ">{series.name}: {point.x}</span>',

                },

                // the value axis
                yAxis: {

                    lineWidth: 0,
                    minorTickInterval: null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    tickPositions: [dashboardCtrl.kpiStruct[index].LValue, dashboardCtrl.kpiStruct[index].HValue],
                    title: {
                        y: 50
                    },
                    labels: {
                        align: 'center',
                        distance: -11,
                        x: 0,
                        y: 15,
                        style: {
                            color: Highcharts.getOptions().colors[3]
                        }
                    }
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: DASHBOARD_CONSTANTS.contextButton
                        },
                        customButton: DASHBOARD_CONSTANTS.customButton
                    }
                },
            };
            gaugeOptions.exporting.buttons.customButton.onclick = function () {
                dashboardCtrl.openModalDialog(index);
            }
        }
        else if (data[0] && !data[1]) {
            var gaugeOptions = {

                chart: {
                    type: 'solidgauge'
                },
                lang: lang,

                title: null,

                pane: {
                    center: ['50%', '80%'],
                    size: '130%',
                    startAngle: -90,
                    endAngle: 90,
                    background: [
                        {
                            backgroundColor: DASHBOARD_CONSTANTS.grey,
                            innerRadius: '65%',
                            outerRadius: '115%',
                            shape: 'arc',
                            borderColor: '#ccc'
                        }
                    ]
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: DASHBOARD_CONSTANTS.contextButton
                        },
                        customButton: DASHBOARD_CONSTANTS.customButton
                    }
                },
                tooltip: {
                    positioner: function () {
                        return {x: 30, y: 25};
                    },
                    shadow: false,
                    borderWidth: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    pointFormat: '<span style="color:{point.color} ">{series.name}: {point.x}</span>',
                },

                // the value axis
                yAxis: {
                    lineWidth: 0,
                    minorTickInterval: null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    tickPositions: [dashboardCtrl.kpiStruct[index].LValue, dashboardCtrl.kpiStruct[index].HValue],
                    title: {
                        y: 50
                    },
                    labels: {
                        align: 'center',
                        distance: -11,
                        x: 0,
                        y: 15,
                        style: {
                            color: Highcharts.getOptions().colors[3]
                        }
                    }
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                }
            };
            gaugeOptions.exporting.buttons.customButton.onclick = function () {
                dashboardCtrl.openModalDialog(index);
            }
        }


        if (error) {
            Highcharts.chart('container-speed' + index, Highcharts.merge(gaugeOptions, {
                title: {text: $filter('translate')('NODATA')}
            }));
        }
        else {

            var series = [];
            if (data[0] && data[1]) {
                gaugeOptions.title = {text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)};
                var num1 = Math.round(parseFloat(data[0].data[index].children[0].result) * 100) / 100;
                if (num1 > 2 || num1 == 'Infinity') {
                    num1 = 2;
                }
                if(num1<0 ||  num1 == '-Infinity')
                {
                    num1=0;
                }
                var color;
                var numTemp = num1;
                if (num1 >= dashboardCtrl.kpiStruct[index].HValue) {
                    color = Highcharts.getOptions().colors[0];
                }
                else {
                    color = Highcharts.getOptions().colors[1];
                }
                if (num1 <= dashboardCtrl.kpiStruct[index].LValue) {
                    numTemp = dashboardCtrl.kpiStruct[index].LValue + dashboardCtrl.kpiStruct[index].LValue * 0.05;
                    color = Highcharts.getOptions().colors[0];

                }


                if (!isNaN(num1)) {
                    series.push({
                        name: $filter('translate')('DATA'),
                        data: [{
                            color: color,
                            radius: '91%',
                            innerRadius: '115%',
                            dataLabels: {
                                format: '<div style="text-align:center"><span style="font-size:20px;color:' + color + '">' + num1.toFixed(2) + '</span>' +
                                '</div>'


                            },
                            y: numTemp,
                            x: num1.toFixed(2)
                        }]

                    })
                }
                else {
                    series.push({
                        name: $filter('translate')('DATA'),
                        data: [{
                            color: color,
                            radius: '91%',
                            innerRadius: '115%',
                            dataLabels: {
                                format: '<div style="text-align:center"><span  style="font-size:20px;color:' + color + '">(' + $filter('translate')('NODATA') + ')</span>' +
                                '</div>'


                            },

                            y: num1
                        }]
                        , tooltip: {
                            positioner: function () {
                                return {x: 30, y: 25};
                            },
                            shadow: false,
                            borderWidth: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            pointFormat: '<span style="color:{point.color} ">' + $filter('translate')('NODATA') + '</span>'
                        },
                    })
                }

            }
            else if (data[0] && !data[1]) {
                gaugeOptions.title = {text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)};

                var num1 = Math.round(parseFloat(data[0].data[index].children[0].result) * 100) / 100;
                if (num1 == 'Infinity' || num1 > 2) {
                    num1 = 2;
                }
                else if (num1 == '-Infinity' || num1 < 0) {
                    num1 = 0;
                }
                // if(num1>2)
                // {
                //     num1=2;
                // }
                var numTemp = num1;
                var color;
                if (num1 >= dashboardCtrl.kpiStruct[index].HValue) {
                    color = Highcharts.getOptions().colors[0];
                }
                else {
                    color = Highcharts.getOptions().colors[1];
                }

                if (num1 <= dashboardCtrl.kpiStruct[index].LValue) {
                    numTemp = dashboardCtrl.kpiStruct[index].LValue + dashboardCtrl.kpiStruct[index].LValue * 0.05;
                    color = Highcharts.getOptions().colors[0];
                }
                if (!isNaN(num1)) {
                    series.push({
                        name: $filter('translate')('DATA'),
                        data: [{
                            color: color,
                            radius: '65%',
                            innerRadius: '115%',
                            dataLabels: {
                                format: '<div style="text-align:center"><span style="font-size:25px;color:' + color + '">' + num1.toFixed(2) + '</span>' +
                                '</div>'


                            },
                            y: numTemp,
                            x: num1.toFixed(2)
                        }]
                    })
                }
                else {
                    series.push({
                        name: $filter('translate')('NODATA'),
                        data: [{
                            color: color,
                            radius: '65%',
                            innerRadius: '115%',
                            dataLabels: {
                                format: '<div style="text-align:center"><span style="font-size:20px;color:' + color + '">(' + $filter('translate')('NODATA') + ')</span>' +
                                '</div>'


                            },
                            y: num1
                        }],
                        tooltip: {
                            positioner: function () {
                                return {x: 30, y: 25};
                            },
                            shadow: false,
                            borderWidth: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            pointFormat: '<span style="color:{point.color}">' + $filter('translate')('NODATA') + '</span>'
                        }
                    })
                }


            }
            if (data[1]) {
                // gaugeOptions.title = {text: dashboardCtrl.kpiStruct[index].EName};
                var num2 = Math.round(parseFloat(data[1].comparedData[index].children[0].result) * 100) / 100;

                if (num2 == 'Infinity' || num2 > 2) {
                    num2 = 2;
                }
                else if (num2 == '-Infinity' || num2 < 0) {
                    num2 = 0;
                }
                var numTemp = num2;
                if (num2 >= dashboardCtrl.kpiStruct[index].HValue) {
                    color = Highcharts.getOptions().colors[0];
                }
                else {
                    color = Highcharts.getOptions().colors[2];
                }
                if (num2 <= dashboardCtrl.kpiStruct[index].LValue) {
                    numTemp = dashboardCtrl.kpiStruct[index].LValue + dashboardCtrl.kpiStruct[index].LValue * 0.05;
                    color = Highcharts.getOptions().colors[0];
                }
                //gauge compared data
                if (!isNaN(num2)) {
                    series.push({
                        name: $filter('translate')('COMPARED_DATA'),
                        padding: -10,
                        data: [{
                            color: color,
                            radius: '65%',
                            innerRadius: '89%',
                            dataLabels: {
                                padding: -15,
                                format: '<span  style="text-align:center;font-size:13px;color:' + color + '">(' + num2.toFixed(2) + ')</span>'
                            },
                            y: numTemp,
                            x: num2.toFixed(2)
                        }]
                    });
                }
                else {
                    series.push({
                        name: $filter('translate')('COMPARED_DATA'),
                        data: [{
                            color: color,
                            radius: '65%',
                            innerRadius: '89%',
                            dataLabels: {
                                padding: -5,
                                format: '<span  style="text-align:center;font-size:13px;color:' + color + '">(' + $filter('translate')('NOCOMPAREDDATA') + ')</span>'
                            },
                            y: num2
                        }],
                        tooltip: {
                            positioner: function () {
                                return {x: 30, y: 25};
                            },
                            shadow: false,
                            borderWidth: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            pointFormat: '<span style="color:{point.color} ">' + $filter('translate')('NOCOMPAREDDATA') + '</span>'
                        }
                    })


                }
            }
            dashboardCtrl.chartGraphs.push(Highcharts.chart('container-speed' + index, Highcharts.merge(gaugeOptions,
                {
                    yAxis: {
                        min: dashboardCtrl.kpiStruct[index].LValue,
                        max: dashboardCtrl.kpiStruct[index].HValue,
                        title: {
                            text: ''
                        },
                        labels: {
                            style: {
                                color: Highcharts.getOptions().colors[3]
                            }
                        }

                    },

                    credits: {
                        enabled: false
                    },

                    series: series

                }
            )));

        }
    };

    $(window).resize(function () {
        if (dashboardCtrl.chartGraphs.length > 0) {
            $timeout(function () {
                for (var i = 0; i < dashboardCtrl.chartGraphs.length; i++) {
                    dashboardCtrl.chartGraphs[i].reflow();
                }
            }, 100)
        }
    });


    dashboardCtrl.initGraph = function (number) {


        if (number !== 4 && number !== 6 && number !== 12) {
            dashboardCtrl.dateData.graphsDisplay = 6;
        }
        $('.graphsDisplay span').removeClass('graphsDisplayActive');

        switch (number) {
            case 4:
                $('.graphsDisplay3').addClass('graphsDisplayActive');
                break;
            case 6 :
                $('.graphsDisplay2').addClass('graphsDisplayActive');
                break;
            case 12:
                $('.graphsDisplay1').addClass('graphsDisplayActive');
                break;
        }
    };

    dashboardCtrl.graphClicked = function (number) {
        if (number !== 1 && number !== 2 && number !== 3) {
            number = 3;
        }
        $('.graphsDisplay span').removeClass('graphsDisplayActive');
        $('.graphsDisplay' + number).addClass('graphsDisplayActive');

        switch (number) {
            case 1:
                dashboardCtrl.dateData.graphsDisplay = 12;
                break;
            case 2 :
                dashboardCtrl.dateData.graphsDisplay = 6;
                break;
            case 3:
                dashboardCtrl.dateData.graphsDisplay = 4;
                break;
        }
        dashboardCtrl.loadingGraphs = true;
        var activeKPIs = dashboardCtrl.ActiveKpisArray;
        dashboardCtrl.ActiveKpisArray = null;
        $timeout(function () {
            dashboardCtrl.ActiveKpisArray = activeKPIs;

            dashboardCtrl.createGraph(dashboardCtrl.currentGraph, dashboardCtrl.data);
        });

    };

    dashboardCtrl.createBasicLine = function (graph, data, index, error, xAxis, daysRange, xAxisc, daysRangec, daysRangeWithoutYear) {
        if (error) {
            setting = {
                title: {
                    text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                },
                exporting: {enabled: false}
            };
        }
        else {

            // var Days=times[1].months[0].days;
            // Days.push(1); Days.push(1);
            var uniqeDates = [];
            var series = [];
            var setting = {};
            var object = [];
            var comapreObject = [];

            var DateType = "Days";
            var from = new Date(dashboardCtrl.dateData.startTime);
            var to = new Date(dashboardCtrl.dateData.endTime);
            if (dashboardCtrl.object.dateType == "Day" || (dashboardCtrl.dateData.dateType == 'Custom' && from.getDate() == to.getDate() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear())) {

                DateType = "Hours";
                daysRangeWithoutYear = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
                if (data[0]) {
                    var children = data[0].data[index].children;
                    for (var i = 0; i < 24; i++) {
                        var child = _.find(children, {"child": i.toString()});
                        if (!child) {
                            object.push(0)
                        }
                        else {
                            if (isNaN(child.result))
                                object.push(0);
                            else object.push(child.result)
                        }
                    }
                    series.push({
                        name: $filter('translate')('DATA'),
                        data: object,
                        color: DASHBOARD_CONSTANTS.blue,
                        zIndex: 4
                    });
                }
                if (data[1]) {
                    var comparedChildren = data[1].comparedData[index].children;

                    for (var i = 0; i < 24; i++) {

                        var comparedChild = _.find(comparedChildren, {"child": i.toString()});
                        if (!comparedChild) {
                            comapreObject.push(0);
                        }
                        else {
                            if (isNaN(comparedChild.result))
                                comapreObject.push(0);
                            else
                                comapreObject.push(comparedChild.result);
                        }
                    }

                    series.push({
                        name: $filter('translate')('COMPARED_DATA'),
                        data: comapreObject,
                        color: DASHBOARD_CONSTANTS.orange,
                        zIndex: 4
                    });
                }


            }
            else {


                if (data[0]) {
                    var children = data[0].data[index].children;
                    for (var i = 0; i < daysRange.length; i++) {
                        var child = _.find(children, {"child": daysRange[i]});
                        if (!child) {
                            object.push(0)
                        }
                        else {
                            if (isNaN(child.result) || child.result=="-Infinity")
                                object.push(0);
                            else if(child.result>2 || child.result=="Infinity" )
                            {
                                object.push(2);
                            }
                            else object.push(child.result)
                        }
                    }
                    series.push({
                        name: $filter('translate')('DATA'),
                        data: object,
                        color: DASHBOARD_CONSTANTS.blue,
                        zIndex: 4
                    });
                }
                if (data[1]) {
                    var comparedChildren = data[1].comparedData[index].children;

                    for (var i = 0; i < daysRangec.length; i++) {

                        var comparedChild = _.find(comparedChildren, {"child": daysRangec[i]});
                        if (!comparedChild) {
                            comapreObject.push(0);
                        }
                        else {
                            if (isNaN(comparedChild.result) || comparedChild.result=="-Infinity" )
                                comapreObject.push(0);
                            else if (comparedChild.result>2 || comparedChild.result=="Infinity")
                            {
                                comapreObject.push(2);
                            }
                            else
                                comapreObject.push(comparedChild.result);
                        }
                    }

                    series.push({
                        name: $filter('translate')('COMPARED_DATA'),
                        data: comapreObject,
                        color: DASHBOARD_CONSTANTS.orange,
                        zIndex: 4
                    });
                }

            }
            series.push({
                name: ' ',
                type: 'scatter',

                marker: {
                    enabled: false,
                    color: DASHBOARD_CONSTANTS.blue
                },
                data: [dashboardCtrl.kpiStruct[index].HValue]
            });

            if (!children || children.length == 0) {
                setting = {
                    title: {
                        text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                    },
                    exporting: {enabled: false}
                };
            }
            else {
                var iconPlaceHolder = $filter('translate')('MAXIMIZE');
                var lang = {
                    tooltip: iconPlaceHolder
                }
                setting = {
                    lang: lang,
                    title: {
                        text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                    },
                    tooltip: {
                        formatter: function () {
                            return Math.round(this.y * 100) / 100;
                        }
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        categories: daysRangeWithoutYear,
                        type: 'datetime',
                        title: {
                            text: DateType
                        }
                    },
                    yAxis: {

                        plotLines: [
                            {
                                value: dashboardCtrl.kpiStruct[index].HValue,
                                color: DASHBOARD_CONSTANTS.blue,
                                dashStyle: 'longdash',
                                width: 2,
                                label: {
                                    // text: 'High Value',
                                    align: 'left'
                                }
                            }
                            ,
                            {
                                value: dashboardCtrl.kpiStruct[index].LValue,
                                color: DASHBOARD_CONSTANTS.blue,
                                dashStyle: 'longdash',
                                width: 2,
                                label: {
                                    // text: 'Low Value',
                                    align: 'left'
                                }
                            }
                        ]

                    },

                    exporting: {
                        buttons: {
                            contextButton: {
                                enabled: DASHBOARD_CONSTANTS.contextButton
                            },
                            customButton: DASHBOARD_CONSTANTS.customButton
                        }
                    },
                    series: series
                };
                setting.exporting.buttons.customButton.onclick = function () {
                    dashboardCtrl.openModalDialog(index);
                }
            }

        }
        dashboardCtrl.chartGraphs.push(Highcharts.chart('container' + index, setting));
    };


    dashboardCtrl.createStackedAndGroupedColumn = function (graph, data, index, error) {
        var series = [];
        if (error) {
            setting = {
                title: {
                    text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                },
                exporting: {enabled: false}
            };

        }
        else {
            if (data[0]) {
                if (!data[0].data[index].children || data[0].data[index].children.length == 0) {
                    setting = {
                        title: {
                            text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                        },
                        exporting: {enabled: false}
                    };

                }
                else {

                    var childrenResult = _.map(data[0].data[index].children, "result");
                    // var fixedChildrenResult=   showJustTwoDecimals(childrenResult);
                    var fixedChildrenResult = childrenResult;
                    series.push(
                        {
                            name: $filter('translate')('DATA'),
                            data: fixedChildrenResult,
                            stack: 'Data',
                            color: DASHBOARD_CONSTANTS.blue,
                            zIndex: 4
                        }, {
                            name: ' ',
                            type: 'scatter',
                            marker: {
                                enabled: false
                            },
                            data: [dashboardCtrl.kpiStruct[index].HValue]
                        },
                        {
                            name: ' ',
                            type: 'scatter',
                            marker: {
                                enabled: false
                            },
                            data: [dashboardCtrl.kpiStruct[index].LValue]
                        }
                    );

                    var childrenIDs = _.map(data[0].data[index].children, "child");
                    //     console.log("childrenIDs");
                    //     console.log(childrenIDs);
                    // console.log("data[0].data[index].children");
                    // console.log(data[0].data[index].children);
                    // var comparedChildrenIDs= _.map(data[1].comparedData[i].children,"child");
                    if (data[1] !== undefined) {
                        var comparedChildrenResult = _.map(data[1].comparedData[index].children, "result");
                        // var fixedComparedChildrenResult=   showJustTwoDecimals(comparedChildrenResult);
                        var fixedComparedChildrenResult = comparedChildrenResult;
                        if (dashboardCtrl.kpiStruct[index].HValue)
                            series.push({
                                name: $filter('translate')('COMPARED_DATA'),
                                data: fixedComparedChildrenResult,
                                stack: 'Compared Data',
                                color: DASHBOARD_CONSTANTS.orange,
                                zIndex: 4

                            })

                    }
                    var iconPlaceHolder = $filter('translate')('MAXIMIZE');
                    var lang = {
                        tooltip: iconPlaceHolder
                    }
                    var setting = {
                            chart: {
                                type: 'column'
                            },
                            lang: lang,
                            title: {
                                text: (dashboardCtrl.localLanguage ? dashboardCtrl.kpiStruct[index].LName : dashboardCtrl.kpiStruct[index].EName)
                            },

                            xAxis: {
                                categories: childrenIDs
                            },

                            yAxis: {
                                title: {
                                    enabled: true,
                                    text: 'Values'
                                },
                                allowDecimals: false,
                                min: 0,

                                plotLines: [
                                    {
                                        value: dashboardCtrl.kpiStruct[index].HValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'High Value',
                                            align: 'left'
                                        }
                                    }
                                    ,
                                    {
                                        value: dashboardCtrl.kpiStruct[index].LValue,
                                        color: DASHBOARD_CONSTANTS.blue,
                                        dashStyle: 'longdash',
                                        width: 2,
                                        label: {
                                            // text: 'Low Value',
                                            align: 'left'
                                        }
                                    }
                                ]
                            },

                            tooltip: {
                                formatter: function () {
                                    // return '<b>' + this.x + '</b><br>  ' +Math.round(this.y * 100) / 100;
                                    return Math.round(this.y * 100) / 100;
                                    // this.series.name + ': ' + this.y.toFixed(2) ;

                                }
                            },

                            plotOptions: {
                                column: {
                                    stacking: 'normal'
                                }
                            },
                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: DASHBOARD_CONSTANTS.contextButton
                                    },
                                    customButton: DASHBOARD_CONSTANTS.customButton,
                                    // drillDownButton: DASHBOARD_CONSTANTS.drillDownButton

                                }
                            },
                            series: series

                        }
                        ;
                    setting.exporting.buttons.customButton.onclick = function () {
                        dashboardCtrl.openModalDialog(index);
                    };

                    // setting.exporting.buttons.drillDownButton.onclick = function () {
                    //     dashboardCtrl.openModalDialog(index);
                    // };

                }
            }
        }
        dashboardCtrl.chartGraphs.push(Highcharts.chart('container' + index, setting));
    };


    dashboardCtrl.graphChange = function () {
        dashboardCtrl.currentGraph = dashboardCtrl.newCurrentGraph;
    };


    dashboardCtrl.filtering = function (kpiRawData) {
        var updateData = angular.copy(kpiRawData);
        if (dashboardCtrl.object.parentDimension && dashboardCtrl.object.parentDimension.length > 0) {
            var ComboValueParentFields = _.map(dashboardCtrl.object.parentDimension, "ComboValueField");
            if(ComboValueParentFields[0]){
                updateData = _.filter(updateData, function (data) {
                    return contains.call(ComboValueParentFields, data[dashboardCtrl.object.dimension.ParentDimension.DimensionName]);
                    
                })
            }
        }

        if (dashboardCtrl.object.childDimension && dashboardCtrl.object.childDimension.length > 0) {
            updateData = _.filter(updateData, function (data) {

                var index = ComboValueParentFields.indexOf(data[dashboardCtrl.object.dimension.ParentDimension.DimensionName]);
                if (index !== -1) {
                    //check if the parent contains the child
                    var child = _.map(dashboardCtrl.object.parentDimension[index].ChildcomboValues, "ComboValueField");
                    var index = child.indexOf(data[dashboardCtrl.object.dimension.ChildDimension.DimensionName+'ID']);
                    if (index !== -1) {
                        //if (_.find(dashboardCtrl.object.childDimension, {"ComboValueField": data[dashboardCtrl.object.dimension.ChildDimension.DimensionField]})) {
                            if (_.find(dashboardCtrl.object.childDimension, {"ComboValueField": data[dashboardCtrl.object.dimension.ChildDimension.DimensionName+'ID']})){
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            })
        }
        return updateData;
    };
    dashboardCtrl.grouping = function () {
        if (dashboardCtrl.currentGraph == "GAUGE") {
            dashboardCtrl.groupedRawData = dashboardCtrl.kpiRawData;
            return dashboardCtrl.groupedRawData;
        }
        dashboardCtrl.groupedRawData = [];
        if (dashboardCtrl.currentGraph == "COMPARISON_BAR") {
            if (dashboardCtrl.object.parentDimension.length > 0 && dashboardCtrl.object.parentDimension[0].length > 0) {
                return _.groupBy(dashboardCtrl.kpiRawData, function (value) {
                    if (dashboardCtrl.currentGraph == "GAUGE") {
                        return value[dashboardCtrl.object.dimension.ParentDimension.DimensionField] + '#' + value[dashboardCtrl.object.dimension.ChildDimension.DimensionField];
                        /** to do */
                    }
                    else {
                        if(value["XAxis"] && value["XAxis"]!='undefined'){
                            return value["XAxis"] + "&" + value[dashboardCtrl.object.dimension.ParentDimension.DimensionName] + '#' + value[dashboardCtrl.object.dimension.ChildDimension.DimensionName+'ID'];
                        }

                    }
                    // return value[dashboardCtrl.object.dimension.ParentDimension.DimensionField] + '#' + value["MachineName"];


                });
            }
            else {
                return _.groupBy(dashboardCtrl.kpiRawData, function (value) {
                    return value["XAxis"] + "&" + value[dashboardCtrl.object.dimension.ParentDimension.DimensionField];
                });
            }
        }
        else if (dashboardCtrl.currentGraph == "TIME_TREND") {
            var temp = dashboardCtrl.object.dateType;
            if (temp == 'Custom') {
                var from = new Date(dashboardCtrl.dateData.startTime);
                var to = new Date(dashboardCtrl.dateData.endTime);
                if (from.getDate() == to.getDate() && from.getMonth() == to.getMonth() && from.getFullYear() == to.getFullYear()) {
                    temp = "Day";
                }
            }
            return _.groupBy(dashboardCtrl.kpiRawData, function (value) {
                if (!value[dashboardCtrl.time])
                    return null;
                else {
                    var d = new Date(value[dashboardCtrl.time]);

                    if (temp !== "Day")
                        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    else {
                        return d.getHours();
                    }
                }
            });
            // dashboardCtrl.groupedRawData=   _.orderBy(dashboardCtrl.groupedRawData,['ShiftStartTime'],['asc']);
        }
        // return dashboardCtrl.groupedRawData;
    };


    dashboardCtrl.updateChildComboValue = function () {
        dashboardCtrl.ChildcomboValues = [];
        for (var i = 0; i < dashboardCtrl.parentDimension.length; i++) {
            if(dashboardCtrl.parentDimension[i]){
                dashboardCtrl.ChildcomboValues = dashboardCtrl.ChildcomboValues.concat(dashboardCtrl.parentDimension[i].ChildcomboValues);
            }
        }
    }

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    var calculateDays = function (start, end) {

        var from, to, hour1, hour2, day1, day2, month1, month2, year1, year2;
        var arrayOfDates = [];
        var days1 = [];
        var days2 = [];
        from = new Date(start);
        to = new Date(end);
        day1 = from.getDate();
        day2 = to.getDate();
        month1 = from.getMonth() + 1;
        month2 = to.getMonth() + 1;
        year1 = from.getFullYear();
        year2 = to.getFullYear();
        var length = 0;
        var diffDays = 0;
        // if (dashboardCtrl.object.dateType == "Custom") {
        //     var timeDiff = Math.abs(to.getTime() - from.getTime());
        //     diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // }
        if (dashboardCtrl.object.dateType == "Day" || (diffDays > 0 && diffDays <= 1)) {
            length = 24;
            arrayOfDates.push({
                length: length,
                year: year1,
                months: [{
                    month: month1,
                    days: [{
                        day: days1,
                        "hours": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
                    }]
                }]
            });

        }
        else if (dashboardCtrl.object.dateType == "Week" || (diffDays > 1 && diffDays <= 7)) {
            if (dashboardCtrl.object.chosenDate == "Last 7 Days") {
                var counter = 0;
                length = 7;
                var daysNumberInMonth = daysInMonth(month1, year1);
                var daysNumberInMonth2 = daysInMonth(month2, year2);
                for (var i = day1; i <= daysNumberInMonth && counter < 7; i++) {
                    days1.push(year1 + '-' + month1 + '-' + i);
                    counter++;
                }
                arrayOfDates.push({length: length, year: year1, months: [{month: month1, days: days1}]});
                if (month1 !== month2) {
                    for (var i = 1; i <= daysNumberInMonth2 && counter < 7; i++) {
                        days2.push(year2 + '-' + month2 + '-' + i);
                        counter++;
                    }

                    arrayOfDates.push({
                        length: length,
                        year: year2,
                        months: [{month: year2 + '-' + month2, "days": days2}]
                    });
                }
            }
            else if (dashboardCtrl.object.chosenDate == "This Week" || dashboardCtrl.object.chosenDate == "Previous Week" || dashboardCtrl.object.chosenDate == "4 Weeks Ago" || (diffDays > 1 && diffDays <= 7)) {

                var counter = 0;
                length = 7;
                var daysNumberInMonth = daysInMonth(month1, year1);
                var daysNumberInMonth2 = daysInMonth(month2, year2);
                for (var i = day1; i <= daysNumberInMonth && counter < 7; i++) {
                    days1.push(year1 + '-' + month1 + '-' + i);
                    counter++;
                }
                arrayOfDates.push({
                    length: length,
                    year: year1,
                    months: [{month: year1 + '-' + month1, "days": days1}]
                });
                if (month1 !== month2) {
                    for (var i = 1; i <= daysNumberInMonth2 && counter < 7; i++) {
                        days2.push(year1 + '-' + month2 + '-' + i);
                        counter++;
                    }

                    arrayOfDates.push({
                        length: length,
                        year: year2,
                        months: [{month: year1 + '-' + month2, "days": days2}]
                    });
                }

            }
        }
        else if (dashboardCtrl.object.dateType == "Month" || (diffDays >= 8)) {

            if (dashboardCtrl.object.chosenDate == "Last 30 Days") {
                var counter = 0;
                var daysNumberInMonth = daysInMonth(month1, year1);
                var daysNumberInMonth2 = daysInMonth(month2, year2);
                length = 30;
                for (var i = day1; i <= daysNumberInMonth && counter < 30; i++) {
                    days1.push(year1 + '-' + month1 + '-' + i);
                    counter++;
                }
                arrayOfDates.push({year: year1, months: [{month: year1 + '-' + month1, "days": days1}]});
                if (month1 !== month2) {
                    for (var i = 1; i <= day2 && counter < 30; i++) {
                        days2.push(year1 + '-' + month2 + '-' + i);
                        counter++;
                    }
                    arrayOfDates.push({
                        length: length,
                        year: year2,
                        months: [{month: year2 + '-' + month2, "days": days2}]
                    });
                }
            }

            else if (dashboardCtrl.object.chosenDate == "This Month" || dashboardCtrl.object.chosenDate == 'Last Month' || dashboardCtrl.object.chosenDate == "Previous Month" || dashboardCtrl.object.chosenDate == "Same Month Last Year" || (diffDays >= 8)) {
                length = daysInMonth(month1, year1);
                for (var i = 1; i <= length; i++) {
                    days1.push(year1 + '-' + month1 + '-' + i);
                }
                arrayOfDates.push({
                    length: length,
                    year: year1,
                    months: [{month: year1 + '-' + month1, "days": days1}]
                });
            }
        }
        else if (dashboardCtrl.object.dateType == "Custom") {
            var flag = 1;
            for (var g = year1; g <= year2; g++) {
                var months = [];
                if (g < year2) {
                    for (var m = month1; m <= 12; m++) {
                        days1 = [];
                        month1 = 1;
                        var daysNumberInMonth = daysInMonth(m, g);
                        var tempDay = 1;
                        if (flag == 1) {
                            flag = -1;
                            tempDay = day1;
                        }
                        for (var i = tempDay; i <= daysNumberInMonth; i++) {
                            days1.push(g + '-' + m + '-' + i);
                        }
                        months.push({month: g + '-' + m, "days": days1});
                    }

                }

                else if (g == year2) {
                    for (var m = 1; m <= month2; m++) {
                        days1 = [];
                        var daysNumberInMonth = daysInMonth(m, g);
                        if (m == month2) {
                            for (var i = 1; i <= day2; i++) {
                                days1.push(g + '-' + m + '-' + i);
                            }
                        }
                        else {
                            for (var i = 1; i <= daysNumberInMonth; i++) {
                                days1.push(g + '-' + m + '-' + i);
                            }
                        }
                        months.push({month: g + '-' + m, "days": days1});
                    }
                }
                arrayOfDates.push({year: g, months: months});
            }
        }

        return arrayOfDates;

    };


    $scope.initActionConfig = function () {

        $scope.spinClosed = true;
        // SKIN Select
        $('.spin-icon').click(function () {
            $scope.spinClosed = !$scope.spinClosed;
            $(".theme-config-box").toggleClass("show");
            var themeConfig = $(".theme-config");
            if ($scope.spinClosed === true) {
                themeConfig.css("z-index", 10000);
                $timeout(function () {
                    $('.theme-config').height(40);
                    $('.theme-config-box').height(40);
                }, 1000);
            }
            else {
                themeConfig.css("z-index", 10000);
                $('.theme-config').height(themeConfigHeight);
                $('.theme-config-box').height(themeConfigHeight);
            }
        });
        var themeConfigHeight = $('.theme-config').height();
        $('.theme-config').height(40);
        $('.theme-config-box').height(40);
    };


    dashboardCtrl.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "Apply",
            fromLabel: "From",
            format: "YYYY-MM-DD HH:mm:ss",
            toLabel: "To",
            cancelLabel: 'Cancel',
            customRangeLabel: 'Custom range',

        },
        ranges: {
            'Today': [moment().subtract(0, 'days'), moment().subtract(0, 'days')],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'This Week': [moment().subtract(0, 'week').startOf('week'), moment().subtract(0, 'week').endOf('week')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        eventHandlers: {
            'apply.daterangepicker': function (event, dateRangePicker, c) {
                dashboardCtrl.arrayOfRanges = [];
                if (dashboardCtrl.chosenLabel != dateRangePicker.chosenLabel) {
                    dashboardCtrl.chosenLabel = dateRangePicker.chosenLabel;
                    dashboardCtrl.compOpts = {
                        locale: {
                            applyClass: 'btn-green',
                            applyLabel: "Apply",
                            fromLabel: "From",
                            format: "YYYY-MM-DD HH:mm:ss",
                            toLabel: "To",
                            cancelLabel: 'Cancel',
                            customRangeLabel: 'Custom range'
                        }, ranges: {}
                    };
                    switch (dashboardCtrl.chosenLabel) {
                        case 'Today':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Day': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                'Same Day Last Week': [moment().subtract(1, 'week'), moment().subtract(1, 'week')],
                                // 'Clear Label': [moment().subtract(0, 'days'), moment().subtract(0, 'days')]
                            };
                            break;
                        case 'Yesterday':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Day': [moment().subtract(2, 'days'), moment().subtract(2, 'days')],
                                'Same Day Last Week': [moment().subtract(1, 'week').subtract(1, 'days'), moment().subtract(1, 'week').subtract(1, 'days')],
                                // 'Clear Date': ['', '']
                            };
                            break;
                        case 'This Week':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
                                '4 Weeks Ago': [moment().subtract(4, 'week').startOf('week'), moment().subtract(4, 'week').endOf('week')]
                            };
                            break;
                        case 'Last 7 Days':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Week': [moment().subtract(2, 'week').startOf('week'), moment().subtract(2, 'week').endOf('week')],
                                '4 Weeks Ago': [moment().subtract(4, 'week').startOf('week'), moment().subtract(4, 'week').endOf('week')]
                            };
                            break;
                        case 'Last Week':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Week': [moment().subtract(2, 'week').startOf('week'), moment().subtract(2, 'week').endOf('week')],
                                '4 Weeks Ago': [moment().subtract(4, 'week').startOf('week'), moment().subtract(4, 'week').endOf('week')]
                            };
                            break;
                        case 'Last 30 Days':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                                'Same Month Last Year': [moment().subtract(1, 'years').subtract(0, 'month').startOf('month'), moment().subtract(1, 'year').subtract(0, 'month').endOf('month')]
                            };


                            break;
                        case 'This Month':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                                'Same Month Last Year': [moment().subtract(1, 'years').subtract(0, 'month').startOf('month'), moment().subtract(1, 'year').subtract(0, 'month').endOf('month')]
                            };
                            break;
                        case 'Last Month':
                            dashboardCtrl.compOpts.ranges = {
                                'Previous Month': [moment().subtract(2, 'month').startOf('month'), moment().subtract(2, 'month').endOf('month')],
                                'Same Month Last Year': [moment().subtract(1, 'years').subtract(1, 'month').startOf('month'), moment().subtract(1, 'year').subtract(1, 'month').endOf('month')]
                            };
                            break;
                    }
                    dashboardCtrl.compOpts.eventHandlers = {
                        'apply.daterangepicker': function (event, dateRangePicker, c) {
                            dashboardCtrl.chosenComparedLabel = dateRangePicker.chosenLabel;

                        }
                    }

                }
            }
        }
    };


}

angular
    .module('LeaderMESfe')
    .controller('DashboardCtrl', DashboardCtrl);
