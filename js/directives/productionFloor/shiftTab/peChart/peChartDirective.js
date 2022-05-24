var peChartDirective = function ($filter, $timeout, $rootScope) {
  var Template = "views/custom/productionFloor/shiftTab/peChart/peChart.html";

  var controller = function ($scope, shiftService, $element, googleAnalyticsService, graphFunctions) {
    console.log('initial');
    $scope.dispExtrema = function () {
      return $scope.showExtremePoints;
    };
    // highChart global options
    Highcharts.setOptions({
      global: {
        useUTC: false,
      },
      lang: {
        decimalPoint: ".",
        thousandsSep: ",",
      },
    });
    $scope.firstTime = 0;
    $scope.showExtremePoints = false;
    $scope.shiftService = shiftService;
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
    var Chart = null;
    $scope.extremePointsMachines = [];
    $scope.shiftData = shiftService.shiftData;
    $scope.sliderData = shiftService.sliderData;
    $scope.zoomMinValue = $scope.sliderData.minValue;
    $scope.zoomMaxValue = $scope.sliderData.maxValue;
    $scope.resetZoomBtn = false;
    $scope.enableZoomBtn = true;
    $scope.getValidPoints = graphFunctions.getValidPoints;
    var element = angular.element($element[0].getElementsByClassName("chart")[0]);
    if (!$scope.options.settings.machinesLegend) {
      $scope.options.settings["machinesLegend"] = {};
    }
    for (var machineId in $scope.shiftData.machinesDisplay) {
      if ($scope.options.settings.machinesLegend[machineId] === undefined || $scope.options.settings.machinesLegend[machineId] === null) {
        $scope.options.settings.machinesLegend[machineId] = true;
      }
    }
    $scope.$watch("shiftData.machinesDisplay", function (newVal, oldVald) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVald)) {
        $scope.init();
        setTimeout(function () {
          $scope.firstTime = 0;
          updateData();
        }, 500);
      }
    });

    $scope.$watch("graph.localMachines",()=>{

      $scope.init();
      setTimeout(function () {
        $scope.firstTime = 0;
        updateData(true);
      }, 500);
      // updateSubSeriesDisplay();
    })

    // highchart default potions data
    var highchartOptions = {
      chart: {
        type: "spline",
        useHTML: true,
        events: {
          selection: function (event) {
            googleAnalyticsService.gaEvent("Department_Shift", "graph_zoom");
            if (!shiftService.shiftData.customRangeEnabled) {
              var min = shiftService.getTime(new Date(event.xAxis[0].min));
              var max = shiftService.getTime(new Date(event.xAxis[0].max));
              $scope.zoomMinValue = min;
              $scope.zoomMaxValue = max;
              shiftService.updateSliderData(min, max);
            }
          },
        },
      },
      boost: {
        useGPUTranslations: true,
      },
      exporting: {
        enabled: false,
      },
      title: {
        text: "",
        useHTML: true,
      },
      legend: {
        enabled: true,
        itemWidth: 200,
        // labelFormatter : function(){
        //     console.log(this);
        //     return `<tspan to data-index="${this.index}" title="${this.name}">${$filter('svgTextWrap')(this.name,9)}</tspan>`;
        // }
      },
      xAxis: {
        type: "datetime",
        dateTimeLabelFormats: {
          hour: "%H:%M",
        },
        min: $scope.sliderData.minValue * 60000,
        max: $scope.sliderData.maxValue * 60000,
      },
      yAxis: {
        title: {
          text: "",
        },
        min: $scope.options.settings.autoY ? $scope.options.settings.minY : undefined,
        max: $scope.options.settings.autoY ? $scope.options.settings.maxY : undefined,
      },
      tooltip: {
        enabled: true,
        crosshairs: true,
        shared: false,
        useHTML: true,
        valuePrefix: "",
        valueDecimals: 2,
        pointFormat: "<div>{series.name}: <b>{point.y}</b></div>",
      },
      plotOptions: {
        spline: {
          point: {
            events: {
              mouseOver: function (event) {
                $scope.overComp = true;
                $timeout(function () {
                  shiftService.updateMarker(new Date(event.target.x));
                }, 10);
              },
              mouseOut: function () {
                $scope.overComp = false;
                $timeout(function () {
                  shiftService.updateMarker(null);
                });
              },
            },
          },
        },
      },
    };

    $scope.resetZoom = function () {
      $scope.resetZoomBtn = false;
      if (Chart) {
        Chart.xAxis[0].setExtremes(null, null);
      }
      if (!shiftService.shiftData.customRangeEnabled) {
        $scope.zoomMinValue = $scope.sliderData.options.floor;
        $scope.zoomMaxValue = $scope.sliderData.options.ceil;
        shiftService.updateSliderData($scope.sliderData.options.floor, $scope.sliderData.options.ceil);
      }
    };

    $scope.enableZoom = function () {
      $scope.enableZoomBtn = !$scope.enableZoomBtn;
      if ($scope.enableZoomBtn) {
        if (Chart) {
          Chart.update({
            chart: { zoomType: "x" },
          });
        }
      } else {
        if (Chart) {
          Chart.update({
            chart: { zoomType: "" },
          });
        }
      }
    };

    /*@arr [[x1,y1], [x2,y2], ..., [xn,yn]]
            @ret [min, max]
        */
    let setExtremeValues = function (arr) {
      if (!arr || arr.length == 0) {
        return null;
      }
      let min = null,
        max = null;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][1] == null) {
          continue;
        }
        if (min == null) {
          min = arr[i][1];
        }
        if (max == null) {
          max = arr[i][1];
        }
        if (arr[i][1] > max) {
          max = arr[i][1];
        }
        if (arr[i][1] < min) {
          min = arr[i][1];
        }
      }
      return [min, max];
    };

    //@arr [[x1,y1], [x2,y2], ..., [xn,yn]]
    let updateGlobalExtremeValues = function (arr) {
      let extremes = setExtremeValues(arr);
      if (!extremes) {
        return;
      }
      if (typeof minValue == "object") {
        minValue = extremes[0];
      }
      if (typeof maxValue == "object") {
        maxValue = extremes[1];
      }
      if (extremes[0] < minValue) {
        minValue = extremes[0];
      }
      if (extremes[1] > maxValue) {
        maxValue = extremes[1];
      }
    };

    let minValue = null,
      maxValue = null,
      globalMin = null,
      globalMax = null;
    var updateLimits = function () {
      var plotLines = [];
      var seriesToUpdate = [];
      let minLimit = null;
      let maxLimit = null;
      globalMax = null;
      globalMin = null;
      minValue = null;
      maxValue = null;
      if (Chart && Chart.series) {
        for (let i = 0; i < Chart.series.length; i++) {
          var series = _.find(highchartOptions.series, { id: Chart.series[i].options.id });
          if (series) {
            seriesToUpdate.push(series);
          }
          if (series && series.visible) {
            series.zones = [
              {
                value: series.lowLimit,
                color: !$scope.options.settings.showLimit || series.lowLimit == series.highLimit ? series.color : "red",
              },
              {
                value: series.highLimit,
                color: series.color,
              },
              {
                color: !$scope.options.settings.showLimit || series.lowLimit == series.highLimit ? series.color : "red",
              },
            ];
          }
        }
        for (let i = 0; i < Chart.series.length; i++) {
          var s = _.find(highchartOptions.series, { id: Chart.series[i].options.id });
          if (s && s.lowLimit != s.highLimit) {
            updateGlobalExtremeValues(s.data);
            let tempMinLimit = $scope.options.settings.showLimit && s.visible ? s.lowLimit : null;
            plotLines.push({
              value: tempMinLimit,
              color: "red",
              dashStyle: "shortdash",
              width: 1,
              label: {
                text: $filter("translate")("LOW_LIMIT"),
              },
            });
            tempMaxLimit = $scope.options.settings.showLimit && s.visible ? s.highLimit : null;
            plotLines.push({
              value: tempMaxLimit,
              color: "red",
              dashStyle: "shortdash",
              width: 1,
              label: {
                text: $filter("translate")("HIGH_LIMIT"),
              },
            });
            if (i == 0) {
              minLimit = tempMinLimit;
              maxLimit = tempMaxLimit;
            }
            if (tempMinLimit < minLimit) {
              minLimit = tempMinLimit;
            }
            if (tempMaxLimit > maxLimit) {
              maxLimit = tempMaxLimit;
            }
          }
        }
      }
      if (typeof minLimit == "object") {
        globalMin = minValue;
      } else {
        globalMin = minLimit < minValue ? minLimit : minValue;
      }
      if (typeof maxLimit == "object") {
        globalMin = maxValue;
      } else {
        globalMax = maxLimit > maxValue ? maxLimit : maxValue;
      }
      let diff = globalMax - globalMin;
      globalMax += 0.05 * diff;
      globalMin -= 0.05 * diff;
      if (Chart) {
        //if autoY is off, i.e. user selected Y range then no need to update min/max
        try {
          
          Chart.update({
            series: seriesToUpdate.length > 0 ? seriesToUpdate : null,
            yAxis: {
              plotLines: plotLines,
            },
          });

          if (!$scope.options.settings.autoY) {
            Chart.update({
              yAxis: {
                max: $scope.options.settings.showLimit ? globalMax : null,
                min: $scope.options.settings.showLimit ? globalMin : null,
              },
            });
          }
        } catch (error) {}
  
      }

      return plotLines;
    };

    var calcData = function () {
      var series = [];
      var graphData = [];
      if (!$scope.shiftData.graphData || !$scope.shiftData.graphData[$scope.options.DatePart]) {
        return [];
      }
      _.forEach($scope.shiftData.graphData[$scope.options.DatePart], function (machine) {

        let machineSubFilter=_.find($scope.graph.localMachines,(machineS)=>machineS.ID==machine.Id);
        if (machineSubFilter && machineSubFilter.value) {
          graphData.push(machine);
        }
      });

      var max = _.max();
      var min = _.min();
      var legendMachineIds = Object.keys($scope.options.settings.machinesLegend);
      _.forEach(graphData, function (machine) {
        var minValue = 0;
        var maxValue = 0;
        var graph = $scope.options.settings.parameter ? _.find(machine.Graphs, { Name: $scope.options.settings.parameter }) : null;
        if (graph && minValue === maxValue) {
          minValue = graph.GraphSeries[0].MinValue;
          maxValue = graph.GraphSeries[0].MaxValue;
        }
        let visible = $scope.options.settings.machinesLegend ? $scope.options.settings.machinesLegend[machine.Id] : true;
        $scope.options.settings.machinesLegend[machine.Id] = visible;
        var indexInLegend = legendMachineIds.indexOf(machine.Id.toString());
        if (indexInLegend >= 0) {
          legendMachineIds.splice(indexInLegend, 1);
        }
        let dForData = {
          data: !graph
            ? []
            : _.sortBy(
                _.map(graph.GraphSeries[0].Items, function (item) {
                  return [parseDate(item.X).getTime(), item.Y];
                }),
                function (o) {
                  if (o) {
                    return o[0];
                  }
                }
              ),
        };
        //array containing validpoints which are within the standard deviation
        let arr = $scope.getValidPoints(dForData.data, $scope.options.settings.filterPoints, visible);

        var avg = calcAverage(arr);

        if (arr && arr.length > 0 && avg > max) {
          max = avg;
        }
        if (arr && arr.length > 0 && avg < min) {
          min = avg;
        }

        //updating the min/max to know what limits to display on the graph
        updateGlobalExtremeValues(arr);
        var prevSeries = _.find(highchartOptions.series, { id: machine.Id });
        var shown = true;
        if (prevSeries) {
          shown = prevSeries.shown;
        } else {
          shown = $scope.shiftData.machinesDisplay[machine.Id];
        }
        series.push({
          id: machine.Id,
          color: machine.lineColor,
          lineWidth: 1,
          data: !graph ? [] : arr,
          marker: {
            symbol: "circle",
          },
          name: machine.name,
          shown: shown,
          visible: visible,
          events: {
            legendItemClick: function (event) {
              $scope.options.settings.machinesLegend[event.target.userOptions.id] = !event.target.userOptions.visible;
              var countExtremeMachines = 0;
              var count = 0;
              for (var key in $scope.options.settings.machinesLegend) {
                if ($scope.options.settings.machinesLegend[key]) {
                  count++;
                  for (var i = 0; i < $scope.extremePointsMachines.length; i++) {
                    if ($scope.extremePointsMachines[i] == key) {
                      countExtremeMachines++;
                    }
                  }
                }
              }

              if ($scope.extremePointsMachines.length == count && countExtremeMachines == $scope.extremePointsMachines.length) {
                $scope.showExtremePoints = true;
              } else {
                $scope.showExtremePoints = false;
              }
            },
          },
          lowLimit: graph ? graph.GraphSeries[0].MinValue : 0,
          highLimit: graph ? graph.GraphSeries[0].MaxValue : 0,
        });
      });
      if (legendMachineIds.length > 0) {
        for (var i = 0; i < legendMachineIds.length; i++) {
          delete $scope.options.settings.machinesLegend[legendMachineIds[i]];
        }
      }
      if (series.length > 0) {
        if (!$scope.firstTime) {
          $scope.firstTimeData = {};
          series.forEach(function (serie) {
            if (serie.data && serie.data.length > 0) {
              var avg = calcAverage(serie.data);
              if (avg == max) {
                serie.visible = true;
                $scope.firstTimeData.max = serie.id;
                $scope.options.settings.machinesLegend[serie.id] = true;
                return;
              } else if (avg == min) {
                serie.visible = true;
                $scope.firstTimeData.min = serie.id;
                $scope.options.settings.machinesLegend[serie.id] = true;
                return;
              }
            }
            serie.visible = false;
            $scope.options.settings.machinesLegend[serie.id] = false;
          });
          var keysMachinesLegend = Object.keys($scope.options.settings.machinesLegend);
          $scope.extremePointsMachines = keysMachinesLegend.filter(function (id) {
            return $scope.options.settings.machinesLegend[id];
          });
          $scope.firstTime = 1;
          $scope.showExtremePoints = true;
        }
      }
      return series;
    };
    var calcAverage = function (arr) {
      var sum = _.reduce(
        arr,
        function (r, a) {
          a.forEach(function (b, i) {
            r[i] = (r[i] || 0) + b;
          });
          return r;
        },
        []
      );

      return sum[1] / arr.length;
    };

    var updateData = function (subFilter=false) {
      if (Chart) {
        var series = calcData();
        highchartOptions.series = series.length > 0 ? angular.copy(series) : null;
        _.remove(series, { shown: false });

        if(subFilter){
          updateSubSeriesDisplay();
        }else{
          updateSeriesDisplay($scope.shiftData.machinesDisplay);
        }
        Chart.update(
          {
            series: series.length > 0 ? series : null,
            chart: { zoomType: $scope.enableZoomBtn ? "x" : "", height: element.height() - 25 },
            xAxis: {
              min: $scope.sliderData.minValue * 60000 || null,
              max: $scope.sliderData.maxValue * 60000 || null,
            },
          },
          false,
          false
        );
        Chart.redraw();
        $timeout(function () {
          Chart?.setSize(element.width(), ($scope.options.height || element.height()) - ($scope.dispExtrema() ? 25 : 0));
        }, 100);
      }
    };

    $scope.init = function () {
      if ($scope.destroyed){
        return;
      }
      highchartOptions.series = calcData();

      element.highcharts(highchartOptions);
      Chart = element.highcharts(highchartOptions).highcharts();
      if (Chart) {
        Chart.pointer.normalize = function (e, chartPosition) {
          var chartX, chartY, ePos;
          // IE normalizing
          e = e || win.event;
          if (!e.target) {
            e.target = e.srcElement;
          }

          // iOS (#2757)
          ePos = e.touches ? (e.touches.length ? e.touches.item(0) : e.changedTouches[0]) : e;

          // Get mouse position
          if (!chartPosition) {
            this.chartPosition = chartPosition = Highcharts.offset(this.chart.container);
            var docElem = window.document.documentElement,
              box = this.chart.container.getBoundingClientRect();
            this.chartPosition.top =
              box.top + (window.pageYOffset || docElem.scrollTop) * $rootScope.scaleAfterZoom - (docElem.clientTop || 0);
          }

          // chartX and chartY
          if (ePos.pageX === undefined) {
            // IE < 9. #886.
            chartX = Math.max(e.x, e.clientX - chartPosition.left); // #2005, #2129: the second case is
            // for IE10 quirks mode within framesets
            chartY = e.y;
          } else {
            chartX = ePos.pageX * $rootScope.scaleAfterZoom + 11 - chartPosition.left;
            chartY = ePos.pageY * $rootScope.scaleAfterZoom - chartPosition.top;
          }

          return Highcharts.extend(e, {
            chartX: Math.round(chartX),
            chartY: Math.round(chartY),
          });
        };
      }
      $timeout(function () {
        Chart?.setSize(element.width(), ($scope.options.height || element.height()) - ($scope.dispExtrema() ? 25 : 0));
      }, 100);
      watchStart();
    };


    var updateSubSeriesDisplay=function(){
    for(let machine in $scope.graph.localMachines){
      let machineInfo=$scope.graph.localMachines[machine];
      let machineInSeries=_.find(Chart.series,{options:{id:parseInt(machineInfo.ID)}});
      let machineInNewSeries=_.find(highchartOptions.series,{options:{id:parseInt(machineInfo.ID)}});

      if(machineInSeries){//chart has the machine
        if(machineInfo.value){
          if(machineInNewSeries){
            machineInNewSeries.shown=machineInfo.value;
            machineInNewSeries.visible=machineInSeries.visible;
          }
          continue;
        }
        if(machineInNewSeries){
          machineInNewSeries.shown=false;
        }

        machineInSeries.remove(false,false);
      }else if(machineInfo.value){//sub machine checked true
        if(machineInNewSeries){
          machineInNewSeries.shown=true;
          machineInNewSeries.visible=true;
          Chart.addSeries(machineInNewSeries,false,false);
        }

      }else{
        if(machineInNewSeries){
          machineInNewSeries.shown=false;
        }
      }

    }
      updateLimits();
    };

    var updateSeriesDisplay = function (machinesDisplay) {
      for (var machineId in machinesDisplay) {
        var serie = _.find(Chart.series, { options: { id: parseInt(machineId) } });
        var newSerie = _.find(highchartOptions.series, { id: parseInt(machineId) });
        if (serie) {
          if (machinesDisplay[machineId]) {
            if (newSerie) {
              newSerie.shown = true;
              newSerie.visible = serie.visible;
              // $scope.options.settings.machinesLegend[machineId] = serie.visible;
            }
            continue;
          }
          if (newSerie) {
            newSerie.shown = false;
          }
          serie.remove(false, false);
        } else if (machinesDisplay[machineId]) {
          if (newSerie) {
            newSerie.shown = true;
            newSerie.visible = true;
            // $scope.options.settings.machinesLegend[machineId] = true;
            Chart.addSeries(newSerie, false, false);
          }
        } else {
          if (newSerie) {
            newSerie.shown = false;
          }
          // delete $scope.options.settings.machinesLegend[machineId];
        }
      }


      if ($scope.firstTime > 0) {
        var count = 0;
        for (var key in $scope.options.settings.machinesLegend) {
          if ($scope.options.settings.machinesLegend[key]) {
            count++;
          }
        }
        if (count != 2) {
          $scope.firstTime = 2;
        } else {
          if (
            $scope.options.settings.machinesLegend[$scope.firstTimeData.max] &&
            $scope.options.settings.machinesLegend[$scope.firstTimeData.min]
          ) {
            $scope.firstTime = 1;
          } else {
            $scope.firstTime = 2;
          }
        }
      }
      updateLimits();
    };

    var updateSeriesVisibility = function (machinesDisplay) {
      if (Chart) {
        _.forEach(Chart.series, function (series) {
          var id = series.options.id;
          if (!machinesDisplay[id]) {
            series.show();
          }
        });
      }
    };

    var watchStart = function () {
      var promiseHandler = null;
      shiftService.displayUpdateDefferd.promise.then(null, null, function () {
        $timeout.cancel(promiseHandler);
        promiseHandler = $timeout(function () {
          if (Chart) {
            updateSeriesDisplay($scope.shiftData.machinesDisplay);
            Chart.redraw();
          }
        });
      });

      $scope.$watch("shiftData.graphData", function () {
        updateData();
      });

      $(window).resize(function () {
        if ($scope.destroyed) {
          return;
        }
        $timeout(function () {
          Chart?.setSize(element.width(), ($scope.options.height || element.height()) - ($scope.dispExtrema() ? 25 : 0));
        });
      });
      
      $scope.$watch(
        "options",
        function (newV, oldV) {
          if (newV.width !== oldV.width) {
            $timeout(function () {
              Chart?.setSize(element.width(), ($scope.options.height || element.height()) - ($scope.dispExtrema() ? 25 : 0));
            });
            return;
          }

          if (newV.height !== oldV.height) {
            $timeout(function () {
              Chart?.setSize(element.width(), newV.height - ($scope.dispExtrema() ? 25 : 0));
            });
            return;
          }

          if (
            oldV.settings.autoY !== newV.settings.autoY ||
            oldV.settings.maxY !== newV.settings.maxY ||
            oldV.settings.minY !== newV.settings.minY
          ) {
            let min = null,
              max = null;
            if ($scope.options.settings.showLimit) {
              min = globalMin;
              max = globalMax;
            }
            Chart.update({
              yAxis: {
                min: $scope.options.settings.autoY ? $scope.options.settings.minY : min,
                max: $scope.options.settings.autoY ? $scope.options.settings.maxY : max,
              },
            });
            return;
          }
          if (Chart && oldV.settings.showLimit !== newV.settings.showLimit) {
            updateLimits();
            return;
          }
          if (Chart && oldV.settings.filterPoints !== newV.settings.filterPoints) {
            updateData();
            return;
          }
          //$scope.options.settings.filterPoints
          if (newV.settings.parameter !== oldV.settings.parameter) {
            $scope.options.settings.autoY = false;
            $scope.options.settings.minY = undefined;
            $scope.options.settings.maxY = undefined;
            $scope.firstTime = 0;
            if (Chart) {
              Chart.yAxis[0].setExtremes(null, null, false, false);
            }
          }
          $timeout(function () {
            updateData();
          }, 100);
        },
        true
      );

      shiftService.markerUpdateDefferd.promise.then(null, null, function () {
        var value = shiftService.shiftData.marker;
        if ($scope.overComp) {
          return;
        }
        if (!Chart || !Chart.xAxis) {
          return;
        }
        var redraw = false;
        if (!highchartOptions.series) {
          return;
        }
        for (var i = 0; i < highchartOptions.series.length; i++) {
          if (highchartOptions.series[i].lineWidth != 1) {
            highchartOptions.series[i].lineWidth = 1;
            var chartSerie = _.find(Chart.series, { options: { id: highchartOptions.series[i].id } });
            if (chartSerie) {
              chartSerie.update(highchartOptions.series[i], false);
              redraw = true;
            }
          }
        }
        var time;
        if (value && value.value) {
          time = value.value;
        } else {
          Chart.xAxis[0].removePlotLine("cursor");
          if (redraw) {
            Chart.redraw();
          }
          return;
        }
        if (Chart) {
          Chart.xAxis[0].removePlotLine("cursor");
          Chart.xAxis[0].addPlotLine({
            value: time.getTime(),
            color: "lightgray",
            dashStyle: "solid",
            width: 1,
            id: "cursor",
          });
          if (value.machineID) {
            var serie = _.find(highchartOptions.series, { id: value.machineID });
            if (serie) {
              serie.lineWidth = 4;
              var chartSerie = _.find(Chart.series, { options: { id: value.machineID } });
              if (chartSerie) {
                chartSerie.update(serie, false);
                redraw = true;
              }
            }
          }
          if (redraw) {
            Chart.redraw();
          }
        }
      });
      $scope.sliderUpdate = shiftService.sliderUpdateDefferd;
      $scope.sliderUpdate.promise.then(null, null, function () {
        if (!Chart || $scope.shiftData.dataLoading || $scope.destroyed) {
          return;
        }
        if ($scope.sliderData.minValue || $scope.sliderData.maxValue) {
          if (
            $scope.sliderData.minValue != $scope.sliderData.options.floor ||
            $scope.sliderData.options.ceil != $scope.sliderData.maxValue
          ) {
            if ($scope.zoomMinValue !== $scope.sliderData.minValue || $scope.zoomMaxValue !== $scope.sliderData.maxValue) {
                Chart.xAxis[0].setExtremes($scope.sliderData.minValue * 60000, $scope.sliderData.maxValue * 60000);
            }
          } else {
            if (Chart) {
              Chart.yAxis[0].setExtremes(null, null, false, false);
              Chart.xAxis[0].setExtremes($scope.sliderData.options.floor * 60000, $scope.sliderData.options.ceil * 60000);
            }
          }
        } else {
          if (Chart) {
            Chart.yAxis[0].setExtremes(null, null, false, false);
            Chart.xAxis[0].setExtremes($scope.sliderData.options.floor * 60000, $scope.sliderData.options.ceil * 60000);
          }
        }
      });
    };

    $scope.$on("$destroy", function() {
      $scope.destroyed = true
      Chart = null;
      console.log('destroy');
    });
    shiftService.updateGraphDataWrapper();
    $scope.init();
  };

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph:"="
    },
    controller: controller,
    controllerAs: "peChartCtrl",
  };
};

angular.module("LeaderMESfe").directive("peChartDirective", peChartDirective);
