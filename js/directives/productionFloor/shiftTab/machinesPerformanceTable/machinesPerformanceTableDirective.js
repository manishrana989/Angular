var machinesPerformanceTableDirective = function () {
    const divId = "machinesPerformance";
    const MAX_DISPLAYED_KPIS_GAUGE_VIEW = 4;
    let MAX_DISPLAYED_KPIS_TABLE_VIEW = Number.MAX_SAFE_INTEGER;
    const MIN_DISPLAYED_KPIS = 1;
    const MINIMUM_GRAPH_WIDTH = 170; //the calculated value is based on but not equal to this - see getWidth() below
    const BOOTSTRAP_PADDING_CONST = 30 //15 PER SIDE
    const MAGIC_FACTOR = 1; //I dont know why it doesnt work without this
    const DESIGN_GRAPH_WIDTH = 215;
    const DESIGN_FONT_SIZE = 18;
    const TABLE_FILTER_KEY = 'tableFilter';
    const ACTIVITY_GAUGE_FILTER_KEY = 'activityGaugeFilter'
    const SKIP_INNER_CIRCLE_DATA = 1 //first cell of series contains inner circle data - we should skip in table
    const DESIGN_FONT_WIDTH_RATIO = Math.ceil(DESIGN_GRAPH_WIDTH / DESIGN_FONT_SIZE) + 2; //+2 because otherwise the font is too big...
    const GARBAGE_KEYS = ["MachineID", '$$hashKey', 'AvailabilityPETarget', 'CycleTimeEfficiencyTarget', 'CavitiesEfficiencyTarget', 'QualityIndexTarget', 'PETarget']
    const WORKER_GARBAGE_KEYS = ["MachineID", '$$hashKey', 'AvailabilityPETarget', 'CycleTimeEfficiencyTarget', 'CavitiesEfficiencyTarget', 'QualityIndexTarget', 'PETarget']
    const divideMeBy100 = "UnitsRatio";
    const percentageKpis = ["UnitsRatio", "AvailabilityPE", "QualityIndex", "CycleTimeEfficiency", "PE", "CavitiesEfficiency", "PercentageByNumberOfEvents", "PercentageByDurationOfEvents", "Material KG/Meter PC", "UsedMaterialPC"];
    const kpisWithTarget = ["PE", "AvailabilityPE", "CycleTimeEfficiency", "CavitiesEfficiency", "QualityIndex"];
    //good units, theoretical units, total units shift, rejects, reported units- 
    const twoDigitsNumbers = ["Material KG/Meter Standard", "Material KG/Meter", "WeightOfRejects","WeightOfRejectsKG","Units/Hour Actual","Units/Hour std","Units/Min Actual","Units/Min std","UnitsProducedOK", "RejectsTotal", "UnitsProducedTheoretically", "TotalUnitsJosh","UnitsReportedOK"];
    const defaultCircleDisplayOrder = ["AvailabilityPE", "CycleTimeEfficiency"];
    const defaultTableColumnsOrder = ["UnitsRatio", "UnitsProducedOK", "RejectsTotal", "UnitsProducedTheoretically", "TotalUnitsJosh", "QualityIndex", "PE", "AvailabilityPE", "ProductionTime", "ActiveTime", "DownTime", "InActiveTime", "NumberOfSetups", "SetupDuration", "CycleTimeEfficiency", "CavitiesEfficiency", "PercentageByNumberOfEvents", "NumberOfEvents", "NumberOfReportedEvents", "PercentageByDurationOfEvents", "ReportedEventsDuration", "EventsDuration", "JoshID", "JobID", "Notes", "ERPJobID", "ProductName", "ShiftName"];
    const defaultDisplayedTableColumns = ["UnitsRatio", "UnitsProducedOK", "UnitsProducedTheoretically", "PE", "AvailabilityPE", "ProductionTime", "DownTime", "NumberOfSetups", "SetupDuration", "CycleTimeEfficiency", "PercentageByNumberOfEvents"];
    const defaultDisplayedWorkerTableColumns = ["UnitsRatio", "UnitsProducedOK", "UnitsProducedTheoretically", "PE", "AvailabilityPE", "ProductionTime", "DownTime", "NumberOfSetups", "SetupDuration", "CycleTimeEfficiency", "PercentageByNumberOfEvents"];
    const COLORED_KPIS = percentageKpis;
    const ZEROS_REPLACEMENT_IN_TABLE = '-';

    var Template = 'views/custom/productionFloor/shiftTab/machinesPerformanceTable/machinesPerformanceTable.html';

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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


    function controller($scope, shiftService, $timeout, $filter, LeaderMESservice, $localStorage, $rootScope,machinesPerformanceService, $state,AuthService, $sessionStorage) {
        $scope.loading = true;
        $scope.shiftData = shiftService.shiftData
        if (shiftService.versionChange) {
            $localStorage.machinesPerformanceStorage = null;
        }
        $scope.$on("machinesPerformanceUpdateHighcharts", (event, data) => {
            $scope.dataArr.displaySettings = data;
            $scope.availableKpis = data.availableKpis;                  
            $scope.setStorage(TABLE_FILTER_KEY, data.availableKpis)
            $scope.tableData = getTableData();
            $scope.graph.dataArr = $scope.dataArr;
        })

        $scope.listeners = [] //an array of watcher destroyers
        $scope.addListener = (listener) => {
            $scope.listeners.push(listener);
        }
        $scope.loadingPage = true;

        $scope.compID = (new Date()).getTime();
        $scope.setStorage = (key, val) => {
            if ($scope.options[key]){
                $scope.options[key] = {};
            }
            $scope.options[key] = val;
        }

        $scope.getStorage = (key) => {
            if (!$scope.options[key]) {
                return null;
            }
            return $scope.options[key];
        }

        $scope.updateDropdown = () => {
            if ($scope.initialized) {
                $scope.dataArr.displaySettings.colorSettings = $scope.colorSettings;
                $scope.dataArr.displaySettings.availableKpis = $scope.getAvailableKpis();
                $scope.dataArr.displaySettings.maxDisplayedKpis = MAX_DISPLAYED_KPIS_TABLE_VIEW;
                $scope.translateOptions($scope.dataArr.displaySettings);
                $scope.$emit("addMachinePerformanceSettings", $scope.dataArr.displaySettings);
            }
        }

        $scope.getTranslationByValue = (str) => {
            let translation = $scope.translations.find(t => t.Value === str) || null;
            return translation;
        }

        $scope.translateOptions = (displaySettings) => {
            if (!displaySettings || displaySettings.availableKpis.length < 1) {
                return;
            }
            for (const option of displaySettings.availableKpis) {
                const translationObj = $scope.getTranslationByKey(option.key)
                if (translationObj) {
                    option.name = translationObj.Value;
                }
            }
        }

        $scope.getTranslationByKey = (str) => {
            let translation = $scope.translations.find(t => t.ColumnName === str) || null;
            return translation;
        }


        const getMachinesToDisplay = () => {
            return $scope.shiftData.Machines.filter(m => shouldDisplayMachineData(m.machineID));
        }


        const shouldDisplayMachineData = (machineID) => {
            const type = $scope.options.isTableView;
            if (type && $scope.options.displayTableBy === 'worker') {
                return true;
            }
            if (!type && $scope.options.displayCircleBy === 'worker') {
                return true;
            }
            //true if its to be displayed
            const localMachine = _.find($scope.graph && $scope.graph.localMachines, {
                ID: machineID
            });
            return $scope.shiftData.machinesDisplay[machineID] && (localMachine && localMachine.value || !localMachine);
        }


        $scope.shiftData = shiftService.shiftData;
        $scope.machinesToDisplay = []
        $scope.machinesToDisplay = getMachinesToDisplay();
        $scope.machinesPerformanceDataArr = [];
        $scope.seriesArr = []

        $scope.updateShiftDates = () => {
            // $scope.startDate = $filter("date")(new Date(shiftService.sliderData.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
            // $scope.endDate = $filter("date")(new Date(shiftService.sliderData.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
            $scope.startDate =shiftService.shiftData.shiftStartDate
            $scope.endDate = shiftService.shiftData.shiftEndDate
        }

        $scope.updateShiftDates();
        shiftService.getProductionProgressColorDefinition()
            .then(data => {
                if (data) {
                    $scope.innerCircleColorSettings = data;
                    let moreThan = $scope.innerCircleColorSettings.find(e => e.Name === 'moreThan');
                    let lessThan = $scope.innerCircleColorSettings.find(e => e.Name === 'LessThen');
                    let otherwise = $scope.innerCircleColorSettings.find(e => e.Name === 'else');
                    $scope.colorSettings = {
                        moreThan: {
                            color: moreThan['ColorID'],
                            percentage: moreThan['Pc']
                        },
                        lessThan: {
                            color: lessThan['ColorID'],
                            percentage: lessThan['Pc']
                        },
                        otherwise: {
                            color: otherwise['ColorID'],
                            percentage: otherwise['Pc']
                        },
                    }
                }
            })

        $scope.getColorByTranslation = (str) => {
            let translation = $scope.getTranslationByValue(str);
            if (!translation) {
                return '';
            }
            let color = $scope.colors.find(c => c.ColorName === translation.ColumnName);
            return color ? color.HexCode : '';
        }


        $scope.allShapeTypes = [{
                name: $filter("translate")("MACHINES_PERFORMANCE_LITTLE_CIRCLE"),
                shape: "littleCircle",
                color: '',
            },
            {
                name: $filter("translate")("NO_PRODUCTION"),
                shape: "inlineSquare",
                color: 'rgb(230,230,230)',
            }
        ]

        $scope.init = function (data) {
            if (data[0] && data[0].ResponseDictionaryDT && data[0].ResponseDictionaryDT.Data && data[0].ResponseDictionaryDT.Data.length > 0 && data[0].ResponseDictionaryDT.Colors) {
                $scope.GetMachinesPerformanceTotalsResult = data[0];
                $scope.machinesPerformanceDataArr = data[0].ResponseDictionaryDT.Data;
                $scope.loadingPage = false
                $scope.colors = data[0].ResponseDictionaryDT.Colors;
                $scope.translations = data[0].ResponseDictionaryDT.Translate;
                $scope.translations.push({
                    ColumnName: "MachineName",
                    Value: $filter('translate')("MACHINE_NAME"),
                });
                $scope.dataArr = computeDataArrays($scope.machinesPerformanceDataArr, $scope.colors, $scope.translations);
                $scope.machineNames = getMachineNamesArr();
                $scope.defaultActivityGaugeKpis = $scope.dataArr.displaySettings.availableKpis;
                $scope.availableKpis = $scope.getAvailableKpis();
                $scope.defaultTableKpis = getDefaultTableKpis();
                $scope.updateDropdown();
                $scope.initialized = true;
                drawActivityGauge();
            } else {
                $scope.initialized = true;
                console.error("cant retrieve machines performance data");
            }
            if (data[1] && data[1].ResponseDictionaryDT && data[1].ResponseDictionaryDT.Data && data[1].ResponseDictionaryDT.Data.length > 0 && data[1].ResponseDictionaryDT.Colors) {
                $scope.GetWorkersPerformanceTotalsResult = data[1];
                if ($scope.GetWorkersPerformanceTotalsResult &&
                    $scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT &&
                    $scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT.Data &&
                    $scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT.Data[0]) {
                    const otherWorker = angular.copy($scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT.Data[0]);
                    Object.keys(otherWorker).forEach(key => {
                        otherWorker[key] = 0;
                    });
                    otherWorker.WorkerName = $filter('translate')('OTHER');
                    otherWorker.WorkerID = null;
                    $scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT.Data.push(otherWorker);
                }
                $scope.workersPerformanceDataArr = data[1].ResponseDictionaryDT.Data;
                $scope.colorsWorkers = data[1].ResponseDictionaryDT.Colors;
                $scope.translationsWorkers = data[1].ResponseDictionaryDT.Translate;
                $scope.translationsWorkers.push({
                    ColumnName: "MachineName",
                    Value: $filter('translate')("MACHINE_NAME"),
                });
                $scope.workerDataArr = computeWorkerDataArrays($scope.workersPerformanceDataArr, $scope.colorsWorkers, $scope.translationsWorkers);
                $scope.workerNames = _.map($scope.workersPerformanceDataArr, 'WorkerName');
                $scope.defaultTableWorkerKpis = getDefaultTableWorkerKpis();
            } else {
                $scope.initialized = true;
                console.error("cant retrieve machines performance data");
            }
            $scope.moveToTableView();            
        }
        $scope.newInit = function(){
          shiftService.initMachinePerofrmanceWrapper()
        }
        $scope.newInit();

        const getSeries = function (seriesArr, machineWorkerId) {
            let kpisToDislay = [];
            let allKpis = $scope.getActivityGaugeKpis();
            for (let i = 0; i < allKpis.length; i++) {
                let kpi = allKpis[i];
                if (kpi.display) {
                    let o = $scope.getTranslationByKey(kpi.key);
                    if (o) {
                        kpisToDislay.push(seriesArr.find(s => s.name === o.Value));
                    }
                }
            }

            //recalculate their radius
            for (let i = 0; i < kpisToDislay.length; i++) {
                let kpi = kpisToDislay[i];
                kpi.data[0].radius = (-15 * i + 110).toString() + "%";
                kpi.data[0].innerRadius = (-15 * i + 98).toString() + "%";
            }
            if ($scope.options.displayCircleBy == 'worker') {
                var machineWorkerData = $scope.workersPerformanceDataArr.find(e => e.WorkerID === machineWorkerId)
            } else {
                var machineWorkerData = $scope.machinesPerformanceDataArr.find(e => e.MachineID === machineWorkerId)

            }

            var innerColor = getInnerColor(machineWorkerData.UnitsRatio);

            let unitsRatioStr = getUnitsRatioStr(machineWorkerData.UnitsRatio);

            if (machineWorkerData.ActiveTime === 0) {
                innerColor = 'rgb(230, 230, 230)';
            }



            kpisToDislay.unshift({
                name: unitsRatioStr,
                visible: true,
                data: [{
                    color: innerColor,
                    radius: 45 + (MAX_DISPLAYED_KPIS_GAUGE_VIEW - kpisToDislay.length) * 15 + '%',
                    innerRadius: '0%',
                    y: Number.MAX_SAFE_INTEGER
                }]
            })
            return kpisToDislay
        }


        const getPaneBackgroundArray = (seriesArr) => {
            let arr = [];
            for (let i = 0; i < seriesArr.length; i++) {
                let series = seriesArr[i];
                let innerRadius = series.data[0].innerRadius;
                let outerRadius = series.data[0].radius;
                let colorInHex = series.data[0].color;
                let backgroundColor = hexToRgbA(colorInHex, 0.3);
                arr.push({
                    innerRadius,
                    outerRadius,
                    backgroundColor,
                    borderWidth: 0
                })
            }
            return arr;
        }

        const getInnerColor = (unitsRatio) => {
            let moreThan = $scope.innerCircleColorSettings.find(e => e.Name === 'moreThan');
            let lessThan = $scope.innerCircleColorSettings.find(e => e.Name === 'LessThen');
            let otherwise = $scope.innerCircleColorSettings.find(e => e.Name === 'else');
            if (unitsRatio > moreThan.Pc) {
                return moreThan.ColorID;
            } else if (unitsRatio < lessThan.Pc) {
                return lessThan.ColorID;
            }
        

            return otherwise.ColorID;
        }

        let charts = [];
        const drawActivityGauge = function () {

            if (!$scope.initialized) {
                return;
            }
            if ($scope.darwingGaugeTimeout) {
                $timeout.cancel($scope.darwingGaugeTimeout);
            }
            $scope.darwingGaugeTimeout = $timeout(() => {
                let currDiv = 0;
                if ((!$scope.dataArr || !$scope.dataArr.highchartData) && (!$scope.workerDataArr || !$scope.workerDataArr.highchartData)) {
                    return;
                }
                let highchartData = $scope.dataArr.highchartData;
                if ($scope.options.displayCircleBy === 'worker') {
                    highchartData = $scope.workerDataArr.highchartData;
                }
                for (let i = 0; i < highchartData.length; i++) {
                    let data = highchartData[i];
                    let dataID = $scope.options.displayCircleBy === 'worker' ? data.workerId : data.machineId;
                    if (shouldDisplayMachineData(dataID)) {
                        let series = getSeries(data.serieses, dataID);
                        let paneBackgroundArray = getPaneBackgroundArray(series);
                        let currId = $scope.options.displayCircleBy === 'worker' ? `workersPerformance-${$scope.compID}-${currDiv}` : `machinesPerformance-${$scope.compID}-${currDiv}`;
                        let textInTitle = $scope.options.displayCircleBy === 'worker' ? `${data.workerName}` : ` <a
                            style="color: inherit;word-break: break-all;
                            white-space: normal;"
                            href="#/appObjectMachineFullView/MachineScreenEditor/${dataID}"
                            target="MachineScreenEditor"
                          > ${getMachineNameById(dataID)} </a>`;

                        currDiv++;

                        let c = Highcharts.chart(currId, {

                            chart: {
                                type: 'solidgauge',
                                height: getWidth(),
                                width: getWidth(),
                            },
                            title: {
                                text: textInTitle,

                                align: 'center',
                                verticalAlign: 'bottom',
                                margin: 50,
                                useHTML: true,
                                floating: true,
                                style: {
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    textTransform: 'none',
                                    wordWrap:'break-word',
                                    width : "200px",
                                    whiteSpace: 'normal',
                                },
                            },

                            tooltip: {
                                alwaysVisible: true,
                                borderWidth: 0,
                                backgroundColor: 'none',
                                shadow: false,
                                useHTML: true,
                                style: {
                                    fontSize: getOuterCircleFontSize() + 'px',
                                    textAlign: 'center',
                                    pointerEvents: 'auto',

                                },
                                positioner: function (labelWidth) {
                                    return {
                                        x: (this.chart.chartWidth - labelWidth) / 2,
                                        y: (this.chart.plotHeight / 2) - getOuterCircleFontSize() / 2
                                    };
                                },
                                formatter: function (data, x, y) {
                                    let fontColor = LeaderMESservice.getBWByColor(this.series.userOptions.data[0].color);
                                    if (data.chart && data.chart.hoverPoint) {
                                        if (data.chart.hoverPoint.innerRadius !== '0%') {
                                            fontColor = 'black';
                                        }
                                    }
                                    if (this.y === Number.MAX_SAFE_INTEGER)
                                        return `<span style="mix-blend-mode: difference;color:${fontColor}; font-size:${getInnerCircleFontSize()}px">${this.series.name}</span>`;
                                    return `<span style="max-width:25px; white-space: nowrap;  wordBreak: 'break-all';
                                    whiteSpace: 'normal'; overflow:hidden; text-overflow:ellipsis; color: ${fontColor}">${this.series.name}</span><br><span style="font-size:${getInnerCircleFontSize()}px"; color: ${this.color}; font-weight: bold">${this.y} %</span>`;
                                }

                            },

                            pane: {
                                startAngle: 0,
                                endAngle: 360,
                                background: paneBackgroundArray,

                            },

                            yAxis: {
                                min: 0,
                                max: 100,
                                lineWidth: 0,
                                tickPositions: [],
                                showFirstLabel: false,
                            },

                            plotOptions: {
                                solidgauge: {
                                    dataLabels: {
                                        enabled: false
                                    },
                                    linecap: 'round',
                                    stickyTracking: false,
                                    rounded: true
                                }
                            },

                            series: series,
                            exporting: {
                                enabled: false
                            }
                        });

                        //making the inner circle auto show after hiding other labels
                        Highcharts.wrap(Highcharts.Tooltip.prototype, 'hide', function (p, delay) {
                            if (this.options.alwaysVisible) {
                                return this.refresh(this.chart.series[0].data[0])
                            }
                            p.call(this, delay)
                        })

                        //triggering the refresh on chart to show inner labels on init
                        setTimeout(function () {
                            c && c.tooltip && c.tooltip.refresh(c.series[0].data[0]);
                        }, 100);

                        charts.push(c);

                    }
                }

            }, 2000)
        }


        const computeDataArrays = (machinesPerformanceDataArr, colors, translations) => {
            let dataArrays = {
                highchartData: [],
                displaySettings: {
                    displayedKpis: 0,
                    availableKpis: [],
                    maxDisplayedKpis: MAX_DISPLAYED_KPIS_GAUGE_VIEW,
                    minDisplayedKpis: MIN_DISPLAYED_KPIS
                }
            };
            computeOuterSeriesesArray(machinesPerformanceDataArr, colors, translations, dataArrays);
            computeDisplaySettings(dataArrays);
            return dataArrays;
        }
        const computeWorkerDataArrays = (workersPerformanceDataArr, colors, translations) => {
            let dataArrays = {
                highchartData: [],
                displaySettings: {
                    displayedKpis: 0,
                    availableKpis: [],
                    maxDisplayedKpis: MAX_DISPLAYED_KPIS_GAUGE_VIEW,
                    minDisplayedKpis: MIN_DISPLAYED_KPIS
                }
            };
            computeOuterSeriesesArrayWorker(workersPerformanceDataArr, colors, translations, dataArrays);
            computeDisplaySettings(dataArrays);
            return dataArrays;
        }

        const computeDisplaySettings = function (dataArrays) {
            let availableKpis = [];
            let displayedKpis = 0;
            for (let i = 0; i < defaultCircleDisplayOrder.length; i++) {
                let translation = $scope.getTranslationByKey(defaultCircleDisplayOrder[i]);
                availableKpis.push({
                    name: translation ? translation.Value : defaultCircleDisplayOrder[i],
                    display: true,
                    key: translation.ColumnName,
                })
                displayedKpis++;
            }
            for (let i = 0; i < dataArrays.highchartData[0].serieses.length; i++) {
                let series = dataArrays.highchartData[0].serieses[i]
                if (!availableKpis.filter(kpi => kpi.name === series.name).length > 0) {
                    availableKpis.push({
                        name: series.name,
                        display: false,
                        key: series.kpi,
                    })
                    displayedKpis++;
                }
            }
            dataArrays.displaySettings.displayedKpis = displayedKpis;
            dataArrays.displaySettings.availableKpis = availableKpis;
        }

        const computeOuterSeriesesArrayWorker = function (workersPerformanceDataArr, colors, translations, dataArrays) {
            for (let i = 0; i < workersPerformanceDataArr.length; i++) {
                let workerData = workersPerformanceDataArr[i];
                let serieses = [];
                for (let j = 0; j < colors.length; j++) {
                    let color = colors[j];
                    let translationObject = translations.find(obj => obj.ColumnName == color.ColorName);
                    let translation = translationObject ? translationObject.Value : 'tranlation not found';
                    let outerCircleColor = color.HexCode;
                    if (workersPerformanceDataArr[i].ActiveTime === 0 || workersPerformanceDataArr[i].WorkerName === "other") {
                        outerCircleColor = 'rgb(230, 230, 230)'; // color of other outer circle
                    }

                    let valueInCircle = Math.floor(workerData[color.ColorName] * 100);
                    serieses.push({
                        name: translation,
                        kpi: translationObject && translationObject.ColumnName || null,
                        data: [{
                            color: outerCircleColor,
                            y: valueInCircle
                        }]
                    })
                }
                dataArrays.highchartData.push({
                    serieses: serieses,
                    workerId: workerData.WorkerID,
                    workerName: workerData.WorkerName,
                });
            }
        }
        const computeOuterSeriesesArray = function (machinesPerformanceDataArr, colors, translations, dataArrays) {
            for (let i = 0; i < machinesPerformanceDataArr.length; i++) {
                let machineData = machinesPerformanceDataArr[i];
                let serieses = [];
                for (let j = 0; j < colors.length; j++) {
                    let color = colors[j];
                    let translationObject = translations.find(obj => obj.ColumnName == color.ColorName);
                    let translation = translationObject ? translationObject.Value : 'tranlation not found';
                    let outerCircleColor = color.HexCode;
                    if (machinesPerformanceDataArr[i].ActiveTime === 0) {
                        outerCircleColor = 'rgb(230, 230, 230)'; // color of outer machine other circle
                    }

                    let valueInCircle = Math.floor(machineData[color.ColorName] * 100);


                    serieses.push({
                        name: translation,
                        kpi: translationObject && translationObject.ColumnName || null,
                        data: [{
                            color: outerCircleColor,
                            y: valueInCircle
                        }]
                    })
                }
                dataArrays.highchartData.push({
                    serieses: serieses,
                    machineId: machineData.MachineID
                });
            }
        }

        const getMachineNameById = function (id) {
            let o = $scope.shiftData.Machines.find(machineObj => machineObj.machineID === id)
            if (o && o.machineName) {
                return o.machineName;
            }
            console.err("machine id not found");
            return id;
        }



        const getUnitsRatioStr = function (unitsRatio) {
            if (!unitsRatio) {
                return '0 %'
            }
            let ratio = Math.floor((unitsRatio || 0))
            return ratio + ' %'
        }

        const getWidth = () => {
            $scope.container = document.getElementById(`machinesPerformanceContainer${$scope.graph.ID}`)
            if ($scope.container) {
                let containerWidth = $scope.container.clientWidth - BOOTSTRAP_PADDING_CONST;
                let MachinesPerRow = Math.floor(containerWidth / MINIMUM_GRAPH_WIDTH);
                let extraSpace = containerWidth % MINIMUM_GRAPH_WIDTH;
                let res = Math.floor(MINIMUM_GRAPH_WIDTH - MAGIC_FACTOR + extraSpace / MachinesPerRow) - 10; // no particular reason why i chose 10, just a random number
                $scope.calculatedGraphWidth = res;
                return res;
            }
        }

        const getInnerCircleFontSize = () => {
            let width = $scope.calculatedGraphWidth || MINIMUM_GRAPH_WIDTH;
            return Math.ceil(width / DESIGN_FONT_WIDTH_RATIO);
        }

        const getOuterCircleFontSize = () => {
            let kpisToDislayNumber = $scope.availableKpis.filter(kpi => kpi.display).length;
            let width = $scope.calculatedGraphWidth || MINIMUM_GRAPH_WIDTH;
            return Math.floor(width / DESIGN_FONT_WIDTH_RATIO);
        }

        const getMachineNamesArr = () => {
            let names = [];
            if ($scope.shiftData.Machines) {
                names = $scope.shiftData.Machines.map(m => m.machineName);
            }
            return names;
        }

        $scope.getAvailableKpis = () => {
            if ($scope.options.isTableView) {
                return $scope.getTableKpis();
            }
            return $scope.getActivityGaugeKpis();
        }

        const getRowNames = () => { //aka machine names
            return getMachineNamesArr();
        }

        const getDefaultTableKpis = () => {
            let keys = Object.keys($scope.GetMachinesPerformanceTotalsResult.ResponseDictionaryDT.Data[0]).filter(key => GARBAGE_KEYS.indexOf(key) < 0)
            let translations = [];
            for (let i = 0; i < keys.length; i++) {
                let translation = $scope.getTranslationByKey(keys[i]) || keys[i];
                let displayed = defaultDisplayedTableColumns.indexOf(keys[i]) > -1 ? true : false;
                translations.push({
                    name: translation.Value || translation,
                    key: keys[i],
                    display: displayed
                });
            }
            translations.sort((c1, c2) => {
                if (c1.name && c2.name && $scope.getTranslationByValue(c1.name) && $scope.getTranslationByValue(c2.name)) {
                    return defaultTableColumnsOrder.indexOf($scope.getTranslationByValue(c1.name).ColumnName) - defaultTableColumnsOrder.indexOf($scope.getTranslationByValue(c2.name).ColumnName)
                }
            })
            return translations;
        }

        const getDefaultTableWorkerKpis = () => {
            let keys = Object.keys($scope.GetWorkersPerformanceTotalsResult.ResponseDictionaryDT.Data[0]).filter(key => WORKER_GARBAGE_KEYS.indexOf(key) < 0)
            let translations = [];
            for (let i = 0; i < keys.length; i++) {
                let translation = $scope.getTranslationByKey(keys[i]) || keys[i]
                let displayed = defaultDisplayedWorkerTableColumns.indexOf(keys[i]) > -1 ? true : false
                translations.push({
                    name: translation.Value || translation,
                    key: keys[i],
                    display: displayed
                });
            }
            translations.sort((c1, c2) => {
                if (c1.name && c2.name && $scope.getTranslationByValue(c1.name) && $scope.getTranslationByValue(c2.name)) {
                    return defaultDisplayedWorkerTableColumns.indexOf($scope.getTranslationByValue(c1.name).ColumnName) - defaultDisplayedWorkerTableColumns.indexOf($scope.getTranslationByValue(c2.name).ColumnName)
                }
            })
            return translations;
        }

        const getColumnKeys = () => {
            // let keys = $scope.getTableKpis().map(kpi => kpi.key);
            let keys = $scope.getTableKpis().filter(kpi => kpi.display).map(kpi => kpi.key);
            return keys
        }

        const getColumnNames = () => {
            let keys = $scope.getTableKpis().filter(kpi => kpi.display).map(kpi => {
                let o = $scope.getTranslationByKey(kpi.key);
                if (o) {
                    return o;
                }
            })
            return keys || [];
        }

        const getTableData = () => {
            let tableData = [];
            $scope.loading = true;
            let rawData = $scope.GetMachinesPerformanceTotalsResult;
            if ($scope.options.displayTableBy === 'worker') {
                rawData = $scope.GetWorkersPerformanceTotalsResult;
            }
            if (rawData) {
                $scope.columns = getColumnNames();
                $scope.keys = getColumnKeys();
                $scope.rows = [];
                for (let i = 0; i < rawData.ResponseDictionaryDT.Data.length; i++) {
                    let data = rawData.ResponseDictionaryDT.Data[i];
                    if (shouldDisplayMachineData(data.MachineID)) {
                        let machineID = data.MachineID;
                        let workerID = data.WorkerID;
                        let machineJoshes = getJoshArr($scope.shiftData.machinesPerformanceJoshs,
                            $scope.options.displayTableBy === 'machine' ? 'MachineID' : 'WorkerID',
                            $scope.options.displayTableBy === 'machine' ? machineID : workerID);
                        machineJoshes = _.filter(machineJoshes, josh => {
                            return josh.JoshID && josh.JobID;
                        });

                        machineJoshes.forEach(josh => {
                            josh.MachineName = getMachineNameById(josh.MachineID);
                        });
                        addMissingKpis(machineJoshes);
                        if (machineJoshes.length > 0) {
                            let joshRef = {};

                            if (machineJoshes.length > 0) {
                                joshRef = {
                                    dontShow: !!!$scope.options.bigArrowOpen,

                                }

                            } else {
                                joshRef = {
                                    dontShow: !!!$scope.options.bigArrowOpen,
                                }
                            }

                            //machines with down arrow (ERP JOB )
                            if ($scope.options.displayTableBy === 'worker') {
                                $scope.rows.push({
                                    name: data.WorkerName,
                                    title: data.WorkerName,
                                    class: 'ellipsisText',
                                    josh: joshRef,
                                    joshTree: true,
                                    showJosh: function () {
                                        return !this.josh.dontShow
                                    },
                                    func: function () {
                                        this.josh.dontShow = !this.josh.dontShow
                                    },
                                    machineId: workerID
                                });
                            } else {
                                $scope.rows.push({
                                    name: getMachineNameById(machineID),
                                    title: getMachineNameById(machineID),
                                    class: 'ellipsisText',
                                    josh: joshRef,
                                    showJosh: function () {
                                        return !this.josh.dontShow
                                    },
                                    joshTree: true,
                                    func: function () {
                                        this.josh.dontShow = !this.josh.dontShow
                                    },
                                    machineId: machineID
                                });
                            }
                            addRow(tableData, data)
                            if (machineJoshes.length > 0) {
                                machineJoshes.sort((j1, j2) => {
                                    return j1.JoshID - j2.JoshID
                                })
                            }
                            for (let j = 0; j < machineJoshes.length; j++) {
                                let josh = machineJoshes[j];
                                let name = `${$filter('translate')('ERP_JOB_ID')}: ${josh.ERPJobID} - ${josh.ProductName} - ${josh.CatalogID}`; ///put ERP link here Karma
                                let title = `${$filter('translate')('ERP_JOB_ID')}: ${josh.ERPJobID}\n${$filter('translate')('JOB_ID')}: ${josh.JobID}\n${$filter('translate')('PRODUCT_NAME')}: ${josh.ProductName}\n${$filter('translate')('CATALOG_ID')}: ${josh.CatalogID}`;
                                $scope.rows.push({
                                    name: name,
                                    jobID: josh.JobID,
                                    title: title,
                                    class: 'joshCell',
                                    style: {
                                        filter: 'brightness(95%)'
                                    },
                                    josh: joshRef,
                                    dontShow: function () {

                                        return this.josh.dontShow
                                    }
                                })
                                addRow(tableData, josh, joshRef)
                            }
                        } else { ///Machines without down Arrow    
                            if ($scope.options.displayTableBy === 'worker') {
                                $scope.rows.push({
                                    name: data.WorkerName,
                                    title: data.WorkerName,
                                    class: 'ellipsisText',
                                    joshTree: true,
                                    style: {
                                        'padding-left': '0.8em',
                                        'backgroundColor': 'rgb(230,230,230)',
                                        'borderbottom': '0px solid #c0c0c0',
                                    },
                                    machineId: workerID
                                });
                            } else { // machine names with no data
                                $scope.rows.push({
                                    name: getMachineNameById(machineID),
                                    title: getMachineNameById(machineID),
                                    joshTree: true,
                                    class: 'ellipsisText',
                                    style: {
                                        'padding-left': '0.8em',
                                        'backgroundColor': 'rgb(230,230,230)',
                                        'borderbottom': '0px solid #c0c0c0',
                                    },
                                    machineId: machineID
                                })
                            }
                            addRow(tableData, data)
                        }

                    }
                }
            }
            $scope.loading = false;
            return tableData;

        }

        const addRow = (tableData, data, joshRef) => {
            let column = [];

            if (joshRef) {
                column.josh = joshRef;
                column.dontShow = function () {
                    return this.josh.dontShow
                };
            } else {
                column.dontShow = () => false;
            }
            for (let j = 0; j < $scope.keys.length; j++) {
                let style = {};
                if (joshRef) {
                    style.filter = 'brightness(95%)';
                }

                if (data.ActiveTime === 0) { //rows of empty data of machines and other workers  
                    if ($scope.options.displayTableBy === 'worker') {
                        style.backgroundColor = 'white';
                    } else {
                        style.backgroundColor = 'rgb(230,230,230)';
                    }
                    style.border = '0px solid #c0c0c0';
                }

                let key = $scope.keys[j];
                if (COLORED_KPIS.indexOf(key) > -1) {
                    $scope.isAbsolutePercentage = $scope.graph.options.settings.percentageChoice;
                    let val;
                    if ($scope.isAbsolutePercentage === 'target') //target
                    {
                        if (data[key + "Target"]) {
                            val = data[key] / data[key + "Target"];
                        } else {
                            val = data[key];
                        }
                    } else {
                        val = data[key];
                    }

                    if (key === divideMeBy100) {
                        val /= 100;
                    }
                    if (data.ActiveTime) {
                        style['background-color'] = getInnerColor(val * 100);
                        const fontColor = LeaderMESservice.getBWByColor(hexToRgb(style['background-color']));
                        style.color = fontColor;
                    }
                }
                obj = {
                    duration: getKpiValue(data, key),
                    numOfEvents: -1,
                    style: style,
                    hideTitle: true,
                    machineId:data.MachineID,
                    jobID:data.jobID,
                    
                }
                
                if((key=="JoshStartTime" || key=="JoshEndTime")&& obj.duration != "-"){
                    obj.duration = `${moment(obj.duration).format(AuthService.getUserDateFormat().replace(":ss",""))}`
                }
                column.push(obj)
            }

            tableData.push(column);
        }

        const addMissingKpis = (machineJoshes) => {
            if (!machineJoshes || machineJoshes.length < 1) {
                return;
            }
            for (let i = 0; i < machineJoshes.length; i++) {
                let josh = machineJoshes[i];
                josh.PercentageByNumberOfEvents = josh.NumberOfEvents ? josh.NumberOfReportedEvents / josh.NumberOfEvents || 0 : 0;
                josh.PercentageByDurationOfEvents = josh.EventsDuration ? josh.ReportedEventsDuration / josh.EventsDuration || 0 : 0;
            }
        }
        const getJoshArr = (joshArr, field, value) => {
            if(!joshArr) return
            let retArr = [];
            for (let k = 0; k < joshArr.length; k++) {
                let josh = joshArr[k];
                if (josh[field] === value && josh.JobID && josh.JoshID) {
                    retArr.push(josh);
                } else if (field === 'WorkerID' && value === null && !josh[field]) {
                    retArr.push(josh);
                }
            }
            return retArr;
        }

        const getKpiValue = (machineData, kpi) => {
            let val = 0,currValue;
            if (kpi === 'WorkerName' || kpi === 'MachineName') {
                return machineData[kpi];
            }
            $scope.durationType = $scope.graph.options.settings.durationType;
            if ($scope.durationType === 'hourMinutes' && ( kpi === "EventsDuration" ||  kpi === "ActiveTime" || kpi === "DownTime" || kpi === "Duration" || kpi === "ProductionTime" || kpi === "Setup" || kpi === "SetupDownTime" || kpi === "SetupProductionTime")  &&  machineData[kpi] ) { 
                let value = $filter('getDurationInHoursMinutes')(machineData[kpi]) ; 
                return value ;
            }
       
            currValue = machineData[kpi];
            
            if (typeof currValue === 'string'){
                return currValue;
            }
            if (divideMeBy100 === kpi) {
                currValue = currValue / 100;
            }
            if (percentageKpis.indexOf(kpi) > -1) {
                val0 = (currValue * 100).toFixed(0) ;
                val2 = (currValue * 100).toFixed(2) ;
                val= Math.abs(val2-val0) > 0 ? val2 + '%' : val0 + '%';
            } else if (twoDigitsNumbers.indexOf(kpi) > -1) {
                if (currValue < 100 && currValue != null && currValue!= 0 ) {
                    let v0 = Math.floor(currValue);
                    let v2 = Math.floor(currValue * 100) / 100;
                    if( v2-v0 > 0 ) {
                        val = Math.floor(currValue * 100) / 100;
                    }
                    else {
                        val = Math.floor(currValue);
                    }   
                } else {
                    val = Math.floor(currValue)
                }
                if (currValue >= 1000){
                    let v0 = currValue.toFixed(0); 
                    val = v0.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            } else {
                val = Math.floor(currValue)
            }
            if (!val || machineData.ActiveTime === 0) {
                return ZEROS_REPLACEMENT_IN_TABLE;
            }
            
            let toggleTarget = $scope.graph.options.settings.targetMode;
            if (toggleTarget && (kpisWithTarget.indexOf(kpi) > -1)) {
                let target = parseInt(machineData[kpi + 'Target'] * 100);
                val = val + " (" + target + "%)";
            }
            
            return val;
        }

        const transposeArray = (matrix) => {
            return Object.keys(matrix[0])
                .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));
        }

        const updateTableCornerHeight = () => {
            let cornerElement = document.querySelector(`.test${$scope.graph.ID}`); //left headres
            let columnsElement = document.querySelector(`.test2${$scope.graph.ID}`); //right headers
            if (columnsElement && columnsElement.getBoundingClientRect()) {
                $scope.columnsElement = columnsElement;
                let columnsHeight = columnsElement.getBoundingClientRect().height;
                cornerElement.setAttribute("style", `height:${columnsHeight}px`);
            }
        }

        const addTableCornerWatcher = () => {
            if ($scope.columnsElement && !$scope.tableCornerListener) {
                $scope.tableCornerListener = $scope.$watch(() => {
                    return $scope.columnsElement.getBoundingClientRect().height
                }, function (oldVal, newVal) {
                    if ((oldVal != newVal))
                        updateTableCornerHeight();
                });
                $scope.addListener($scope.tableCornerListener);
            }
        }

        $scope.getActivityGaugeKpis = () => {
            return $scope.getStorage(ACTIVITY_GAUGE_FILTER_KEY) || $scope.defaultActivityGaugeKpis;
        }

        $scope.getTableKpis = () => {
            let tableKpis = ([...($scope.getStorage(TABLE_FILTER_KEY) || []), ...($scope.defaultTableKpis || [])]);
            tableKpis = _.unique(tableKpis, 'key');
            if ($scope.options.displayTableBy === 'worker') {
                const workerIdIndex = _.findIndex(tableKpis, {
                    key: 'WorkerID'
                });
                if (workerIdIndex >= 0) {
                    tableKpis.splice(workerIdIndex, 1);
                }
                const workerNameIndex = _.findIndex(tableKpis, {
                    key: 'WorkerName'
                });
                if (workerNameIndex >= 0) {
                    tableKpis.splice(workerNameIndex, 1);
                }
                const machineIDIndex = _.findIndex(tableKpis, {
                    key: 'MachineID'
                });
                let machineIDDisplay = true;
                if (machineIDIndex >= 0) {
                    machineIDDisplay = tableKpis[machineIDIndex].display;
                    tableKpis.splice(machineIDIndex, 1);
                }
                tableKpis.unshift({
                    display: machineIDDisplay,
                    key: "MachineID",
                    name: $filter('translate')('MACHINE_ID'),
                });
                const machineNameIndex = _.findIndex(tableKpis, {
                    key: 'MachineName'
                });
                let machineNameDisplay = true;
                if (machineNameIndex >= 0) {
                    machineNameDisplay = tableKpis[machineNameIndex].display;
                    tableKpis.splice(machineNameIndex, 1);
                }
                tableKpis.unshift({
                    display: machineNameDisplay,
                    key: "MachineName",
                    name: $filter('translate')('MACHINE_NAME'),
                });
            } else {
                ///////////////////// karma
                const machineIDIndex = _.findIndex(tableKpis, {
                    key: 'MachineID'
                });
                if (machineIDIndex >= 0) {
                    tableKpis.splice(machineIDIndex, 1);
                }

                const machineNameIndex = _.findIndex(tableKpis, {
                    key: 'MachineName'
                });
                if (machineNameIndex >= 0) {
                    tableKpis.splice(machineNameIndex, 1);
                }

                const workerNameIndex = _.findIndex(tableKpis, {
                    key: 'WorkerName'
                });
                let workerNameDisplay = true;
                if (workerNameIndex >= 0) {
                    workerNameDisplay = tableKpis[workerNameIndex].display;
                    tableKpis.splice(workerNameIndex, 1);
                }
                tableKpis.unshift({
                    display: workerNameDisplay,
                    key: "WorkerName",
                });
                const workerIdIndex = _.findIndex(tableKpis, {
                    key: 'WorkerID'
                });
                let workerIdDisplay = true;
                if (workerIdIndex >= 0) {
                    workerIdDisplay = tableKpis[workerIdIndex].display;
                    tableKpis.splice(workerIdIndex, 1);
                }
                tableKpis.unshift({
                    display: workerIdDisplay,
                    key: "WorkerID"
                });
            }
            return _.unique(tableKpis, 'key');
        }

 

        $scope.moveToTableView = () => {
            $scope.options.isActivityGaugeView = false;
            $scope.options.isTableView = true;
            $scope.availableKpis = $scope.getTableKpis();
            if (!$scope.tableData || $scope.tableData.length == 0) {
                $scope.tableData = getTableData();
            }
            $scope.updateDropdown();
            $timeout(() => {
                updateTableCornerHeight();
                addTableCornerWatcher();
            }, 250);
        }

        $scope.tableInit = () => {
            $timeout(() => {
                updateTableCornerHeight();
                addTableCornerWatcher();
            }, 250);
        };

        let tableListener = $scope.$watch("options.isTableView", function (newValue, oldValue) {
            if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
                return;
            }
            $scope.moveToTableView();            
        });

        $scope.addListener(tableListener);

        const createNewTableDisplayListener = () => {
            $scope.tableDisplayListener = $scope.$watch("options.displayTableBy", function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                if ($scope.options.isTableView) {
                    $scope.tableData = null;
                    $scope.moveToTableView();
                }
            });
        }
        createNewTableDisplayListener();



        let machinesDisplayListener = $scope.$watch("shiftData.machinesDisplay", function (newValue, oldValue) {
            if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
                return;
            }
            $scope.machinesToDisplay = getMachinesToDisplay();
            $scope.tableData = getTableData();
            drawActivityGauge();
            $scope.graph.isFiltered = false;
        });
        $scope.addListener(machinesDisplayListener);

        let graphLocalMachinesListener = $scope.$watch("graph.localMachines", function (newValue, oldValue) {
            if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
                return;
            }
            let displayed = newValue && newValue.filter(machine => {
                machine.value
            })
            if (oldValue && displayed.length !== oldValue.length) {
                $scope.graph.isFiltered = true;
            } else {
                $scope.graph.isFiltered = false;
            }
            $scope.machinesToDisplay = getMachinesToDisplay();
            $scope.tableData = getTableData();
            drawActivityGauge();
        });
        $scope.addListener(graphLocalMachinesListener);



        let displayMachinesInNoProduction = $scope.$watch("graph.options.DisplayMachinesInNoProduction", function (newValue, oldValue) {
             $scope.displayMachinesInNoProduction = newValue;
        });
        $scope.addListener(displayMachinesInNoProduction);

        let toggleTarget = $scope.$watch("graph.options.settings.targetMode", function (newValue, oldValue) {
            $scope.tableData = getTableData();

        });
        $scope.addListener(toggleTarget);

        let isAbsolutePercentage = $scope.$watch("graph.options.settings.percentageChoice", function (newValue) {
            $scope.tableData = getTableData();

        });
        $scope.addListener(isAbsolutePercentage);

        let durationType = $scope.$watch("graph.options.settings.durationType", function (newValue) {
            $scope.tableData = getTableData();

        });
        $scope.addListener(durationType);

        const getHeader = () => {
            const header = ([...$scope.columns]).map(item => item.Value);
            header.unshift($filter('translate')('MACHINES'));
            return header;
        };

        const getRow = (index) => {
            const row = [];
            const machineName = $scope.rows[index].name;
            row.push(machineName);
            $scope.tableData[index].forEach(cell => {
                row.push(cell.duration);
            });
            return row;
        }

        $scope.exportCsv.value = () => {
            const rows = [];
            rows.push(getHeader());
            for (let i = 0; i < $scope.rows.length; i++) {
                // if (!$scope.rows[i].dontShow) {
                    rows.push(getRow(i));
                // }
            }
            let csvContent = "data:text/csv;charset=utf-8," + String.fromCharCode(0xFEFF) +
                rows.map(e => e.join($sessionStorage.exportCSVDelimiter || ',')).join("\n");
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "machine_performance.csv");
            document.body.appendChild(link); // Required for FF

            link.click(); // This will download the data file named "my_data.csv".

        };

        if ($scope.options && $scope.options.style) {

            if ($scope.options.width === 12) {
                $scope.options.height = 'unset';
                $scope.options.style['min-height'] = (getWidth() + 20) + 'px' //no particular reason why i chose 20, just looked right on my screen...
                $scope.options.style['max-height'] = ((getWidth() + 40) * 3) + 'px'
            }
            let heightListener = $scope.$watch("options.width", function (newValue, oldValue) {
                if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
                    return;
                }
                if (newValue < 12) {
                    $scope.options.height = 500;
                    if (LeaderMESservice.showLocalLanguage()) {
                        $scope.options.style['min-height'] = 'unset';
                        $scope.options.style['max-height'] = 'unset';
                    } else {
                        $scope.options.style['min-height'] = 'unset';
                        $scope.options.style['max-height'] = 'unset';
                    }
                } else {
                    $scope.options.style['min-height'] = (getWidth() + 20) + 'px' //no particular reason why i chose 20, just looked right on my screen...
                    $scope.options.style['max-height'] = ((getWidth() + 40) * 3) + 'px'
                }
            });
            $scope.addListener(heightListener);
        }

        $rootScope.$on("loadedTemplate", (e, data) => {
            if ($scope.tableDisplayListener) {
                createNewTableDisplayListener();
            }
            let component = data.data.find(element => element.template == $scope.graph.template && element.ID == $scope.graph.ID);
            for (let prop in component) {
                if (prop != "dataArr") {
                    $scope.graph[prop] = component[prop];
                }
            }
            $scope.graph.isFiltered = $scope.graph.localMachines.some(machine => machine.value == false);

            if ($scope.graph.dataArr) {
                if (!$scope.dataArr) {
                    $scope.dataArrLoaded = $scope.graph.dataArr;
                } else {
                    if ($scope.graph.dataArr.displaySettings) {
                        $scope.dataArr.displaySettings = $scope.graph.dataArr.displaySettings;
                        for (let prop in $scope.dataArr.displaySettings) {
                            $scope.dataArr.displaySettings[prop] = $scope.graph.dataArr.displaySettings[prop];
                        }
                        $scope.availableKpis = $scope.dataArr.displaySettings.availableKpis;             
                        $scope.setStorage(TABLE_FILTER_KEY, $scope.graph.dataArr.displaySettings.availableKpis)
                        $scope.tableData = getTableData()
                        $scope.translateOptions($scope.graph.dataArr.displaySettings);

                        $scope.$emit("addMachinePerformanceSettings", $scope.graph.dataArr.displaySettings);
                    }
                }
            }
        });

        $scope.$watch(
            "shiftData.machinesPerformanceData",
            function (newValue, oldValue) {                
              if (JSON.stringify(newValue) !== JSON.stringify(oldValue) && newValue != undefined) {
                $scope.init(angular.copy($scope.shiftData.machinesPerformanceData));
              }
            },
            true
          );


        //cleanup after destroying the directive
        $scope.$on('$destroy', function () {
            if ($scope.listeners.length > 0) {
                for (let i = 0; i < $scope.listeners.length; i++) {
                    $scope.listeners[i]();
                }
            }
            if ($scope.tableDisplayListener) {
                $scope.tableDisplayListener();
            }
        });


        $scope.changeState = () => {
            $scope.options.bigArrowOpen = !$scope.options.bigArrowOpen;
            $localStorage.machinePerformanceArrowState = $scope.options.bigArrowOpen;
            return $scope.options.bigArrowOpen;
        };
        if ($scope.options && !$scope.options.displayTableBy) {
            $scope.options.displayTableBy = 'machine';
        }

    }

    return {
        restrict: "E",
        templateUrl: Template,
        controller: controller,
        scope: {
            options: '=',
            graph: '=',
            exportCsv: "=",
        }
    };
};

angular
    .module('LeaderMESfe')
    .directive('machinesPerformanceTableDirective', machinesPerformanceTableDirective);