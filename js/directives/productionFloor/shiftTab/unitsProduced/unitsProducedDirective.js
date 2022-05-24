var unitsProducedDirective = function ($rootScope) {
  var Template = "views/custom/productionFloor/shiftTab/unitsProduced/unitsProduced.html";

  var controller = function ($scope, shiftService, $timeout, $element, $filter, $sessionStorage, $localStorage, $rootScope) {
    $scope.shiftData = shiftService.shiftData;
    var Chart = null;
    $scope.settings = {};
    $scope.drilldowns = [];
    $scope.goodSeries = [];
    $scope.rejectedSeries = [];
    $scope.theoreticallyJoshSeries = [];
    $scope.theoreticallyShiftSeries = [];
    $scope.drilldownActive = false;
    $scope.simpleTableName = "";
    var element = angular.element($element[0].getElementsByClassName("chart")[0]);
    $scope.dispExtrema = function () {
      return $scope.firstTime == 1;
    };

    shiftService.getDepartmentMachineAggregateData();
    $scope.dataUnits = [];

    //highchart with drilldown and drillup events
    var highchartOptions = {
      chart: {
        type: "column",
        height: $scope.options.height - 25,
        useHTML: true,
        renderTo: "container",
        events: {
          drilldown: function (e) {
            var chart = this,
              drilldowns = chart.userOptions.drilldown.series;
            e.preventDefault();
            Highcharts.each(drilldowns, function (p, i) {
              chart.addSingleSeriesAsDrilldown(e.point, p);
            });
            chart.applyDrilldown();
            chart.update({
              xAxis: {
                categories: $scope.machines,
                useHTML: true,
                labels: {
                  enabled: true,
                },
              },
              yAxis: {
                stackLabels: {
                  useHTML: true,
                  enabled: false,
                  style: {
                    fontWeight: "bold",
                    color: (Highcharts.theme && Highcharts.theme.textColor) || "gray",
                  },
                },
              },
              plotOptions: {
                column: {
                  useHTML: true,

                  stacking: "normal",
                  dataLabels: {
                    borderWidth: 0,
                    enabled: false,
                  },
                },
              },
              yAxis: {
                stackLabels: {
                  useHTML: true,
                  enabled: false,
                  style: {
                    fontWeight: "bold",
                    color: (Highcharts.theme && Highcharts.theme.textColor) || "gray",
                  },
                },
              },
            });

            $scope.drilldownActive = true;
          },

          drillup: function () {
            var chart = this;

            chart.update({
              xAxis: {
                categories: null,
                labels: {
                  enabled: false,
                },
              },
              yAxis: {
                stackLabels: {
                  enabled: true,
                  style: {
                    fontWeight: "bold",
                    color: (Highcharts.theme && Highcharts.theme.textColor) || "gray",
                  },
                },
              },
            });
            $scope.drilldownActive = false;
          },
          redraw: function(){            
            if(this.drillUpButton){
              this.drillUpButton.hide();
            }           
          },		  
        },
      },
      title: {
        text: "",
      },
      subtitle: {},
      tooltip: {
        useHTML: true,

        formatter: function () {
          
          let thisMachine = $scope.shiftData.machineAPIData.find((it) => it.MachineName === this.key?.name);
          if (!thisMachine) {
            return;
          }
          var good =  thisMachine.UnitsProducedOK < 100 ? thisMachine.UnitsProducedOK.toFixed(2) : parseInt(thisMachine.UnitsProducedOK);
          var rejected = thisMachine.RejectsTotal < 100 ? thisMachine.RejectsTotal.toFixed(2) : parseInt(thisMachine.RejectsTotal);
          var josh = thisMachine.UnitsProducedTheoreticallyJosh< 100 ?  thisMachine.UnitsProducedTheoreticallyJosh.toFixed(2) : parseInt(thisMachine.UnitsProducedTheoreticallyJosh);
          var shift = thisMachine.UnitsProducedTheoreticallyShift < 100 ? thisMachine.UnitsProducedTheoreticallyShift.toFixed(2)  : parseInt(thisMachine.UnitsProducedTheoreticallyShift);
          if ($scope.options.settings.calculateBy && $scope.options.settings.calculateBy && JSON.parse($scope.options.settings.calculateBy))
          {
            return '<span style="color:{point.color}">' + $filter("translate")("GOOD") + ": " + parseFloat(good) + "<br/>" + $filter("translate")("REJECT") + ": " + parseFloat(rejected) + "<br/>" + $filter("translate")("JOSH")+": " + parseFloat(josh) + "<br/>" + $filter("translate")("TOTAL") + ": " + parseFloat(this.total.toFixed(2)) + "</span>";	   
          }
          return '<span style="color:{point.color}">' + $filter("translate")("GOOD") + ": " + parseFloat(good) + "<br/>" + $filter("translate")("REJECT") + ": " + parseFloat(rejected) + "<br/>" + $filter("translate")("THEORETICAL") + ": " + parseFloat(shift) + "<br/>" + $filter("translate")("TOTAL") + ": " + parseFloat((parseFloat(rejected) + parseFloat(good)).toFixed(2)) + "</span>";
        },
      },
      xAxis: {
        useHTML: true,

        type: "category",
        resize: {
          enabled: true,
        },
        categories: $scope.machines,
        labels: {
          useHTML: true,
          enabled: true,
        },
      },
      yAxis: {
        useHTML: true,
        title: {
          text: $filter("translate")("TOTAL_UNITS"),
        },
        stackLabels: {
          enabled: false,
          useHTML: true,
          style: {
            fontWeight: "bold",
            color: (Highcharts.theme && Highcharts.theme.textColor) || "gray",
          },
        },
      },
      responsive: false,
      plotOptions: {
        useHTML: true,

        column: {
          stacking: "normal",
          dataLabels: {
            borderWidth: 0,
            enabled: false,
          },
        },
      },
      legend: {
        useHTML: true,
        enabled: false,
      },
    };
    shiftService.displayUpdateDefferd.promise.then(null, null, function () {
      shiftService.getDepartmentMachineAggregateData();
    });

    var calcData = function () {
      var goodTotal = 0;
      var rejectedTotal = 0;
      var theoreticallyShiftTotal = 0;
      var theoreticallyJoshTotal = 0;
      $scope.data = [];
      $scope.drilldowns = [];
      var goodSeries = [];
      var rejectedSeries = [];
      var theoreticallyJoshSeries = [];
      var theoreticallyShiftSeries = [];
      var theoreticallyShiftGraphSeries = []
      $scope.unitsSimpleTableY = [];
      $scope.unitsData = [];
      var unitsDataRejectedTest = [];
      var unitsDataGoodTest = [];
      var unitsDataShiftTest = [];
      var unitsDataJoshTest = [];
      var unitsTotalDataTest = [];
      $scope.machinesNameSimpleTable = [];
      $scope.machineAPIDataTemp = [];
      if ($scope.shiftData.Machines) {
        $scope.shiftData.Machines.forEach(function (machine) {
          found = _.find($scope.shiftData.machineAPIData, { Id: machine.machineID });
          if (found) {
            $scope.machineAPIDataTemp.push(found);
          }
        });
      }

      $scope.machines = _.unique(
        _.map(
          _.filter($scope.machineAPIDataTemp, function (machine) {
            let subMachine = $scope.graph.localMachines.find((sub) => sub.ID == machine.Id);
            return subMachine && subMachine.value;
          }),
          "MachineName"
        )
      );

      $scope.machines.forEach(function () {
        goodSeries.push([0, "rgb(26, 169, 23)"]);
        rejectedSeries.push([0, "rgb(0,0,0)"]);
        theoreticallyJoshSeries.push([0, "rgb(151,151,151)"]);
        theoreticallyShiftSeries.push([0, "rgb(151,151,151)"]);
        theoreticallyShiftGraphSeries.push([0, "rgb(151,151,151)"]);
      });
      
      _.forEach($scope.machineAPIDataTemp, function (event) {
        var machineIndex = $scope.machines.indexOf(event.MachineName);

        if (machineIndex >= 0) {
          if (event.UnitsProducedOK >= 0) {
            goodSeries[machineIndex][0] += event.UnitsProducedOK;
            goodTotal += event.UnitsProducedOK;
          }
          if (event.RejectsTotal >= 0) {
            rejectedSeries[machineIndex][0] += event.RejectsTotal;
            rejectedTotal += event.RejectsTotal;
          }
          if (event.UnitsProducedTheoreticallyShift >= 0) {
            theoreticallyShiftSeries[machineIndex][0] += event.UnitsProducedTheoreticallyShift;
            theoreticallyShiftTotal += event.UnitsProducedTheoreticallyShift;
            if (event.UnitsProducedTheoreticallyShift - (event.UnitsProducedOK +event.RejectsTotal ) >= 0) {
              theoreticallyShiftGraphSeries[machineIndex][0] += event.UnitsProducedTheoreticallyShift - (event.UnitsProducedOK +event.RejectsTotal );          
            }
          }
          if (event.UnitsProducedTheoreticallyJosh >= 0) {
            theoreticallyJoshSeries[machineIndex][0] += event.UnitsProducedTheoreticallyJosh;
            theoreticallyJoshTotal += event.UnitsProducedTheoreticallyJosh;
          }
        }
      });
      $scope.machinesNameSimpleTable = [...$scope.machines];
      $scope.machinesNameSimpleTable.push("TOTAL");

      //push for reject units
      $scope.data.push({
        name: $filter("translate")("REJECTED_UNITS"),
        data: [
          {
            y: rejectedTotal,
            drilldown: "units",
          },
        ],
        nameTemp: "rejected",
        stack: "current",
        color: "rgb(0,0,0)",
        legendIndex: 2,
      });

      //push for good units
      $scope.data.push({
        name: $filter("translate")("GOOD_UNITS"),
        data: [
          {
            y: goodTotal,
            drilldown: "units",
          },
        ],
        nameTemp: "good",
        stack: "current",
        color: "rgb(26, 169, 23)",
        legendIndex: 1,
      });
      /****************************************************************************************/
      if ($scope.options.settings.calculateBy && JSON.parse($scope.options.settings.calculateBy)) {
        //push for theoretically Josh
        $scope.data.push({
          name: $filter("translate")("TH.JOSH"),
          data: [
            {
              y: theoreticallyJoshTotal,
              drilldown: "units",
            },
          ],
          nameTemp: "Josh",
          stack: "current",
          color: "rgb(151,151,151)",
          legendIndex: 0,
        });
      } else {
        //push for theoretically Shift
        $scope.data.push({
          name: $filter("translate")("TH.SHIFT"),
          data: [
            {
              y: theoreticallyShiftTotal,
              drilldown: "units",
            },
          ],
          nameTemp: "Shift",
          stack: "current",
          color: "rgb(151,151,151)",
          legendIndex: 0,
        });
      }

      /****************************************************************************************/
      //push for rejects and good units  drilldown
      // calculated by option
      if ($scope.options.settings.calculateBy && JSON.parse($scope.options.settings.calculateBy)) {
        $scope.drilldowns.push({
          name: $filter("translate")("TH.JOSH"),
          id: "units",
          data: theoreticallyJoshSeries,
          color: "rgb(151,151,151)",
          // events: {
          //   legendItemClick: function () {
          //     // e.stopPropagation();
          //     $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.JOSH")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.JOSH")];
          //
          //   },
          // },
          // visible:$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.JOSH")],
          keys: ["y"],
          nameTemp: "Josh",
          stack: "drilldownCurrent",
        });
      } else {
        $scope.drilldowns.push({
          name: $filter("translate")("TH.SHIFT"),
          id: "units",
          data: theoreticallyShiftGraphSeries,
          color: "rgb(151,151,151)",
          // events: {
          //   legendItemClick: function () {
          //     $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.SHIFT")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.SHIFT")];
          //
          //   },
          // },
          // visible:$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("TH.SHIFT")],
          keys: ["y"],
          nameTemp: "Shift",
          stack: "drilldownCurrent",
        });
      }

      $scope.drilldowns.push(
        {
          name: $filter("translate")("REJECTED_UNITS"),
          id: "units",
          data: rejectedSeries,
          color: "rgb(0, 0, 0)",
          keys: ["y"],
          //           events: {
          //             legendItemClick: function () {
          //               $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("REJECTED_UNITS")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("REJECTED_UNITS")];
          //
          //             },
          //           },
          // visible:$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("REJECTED_UNITS")],
          nameTemp: "rejected",
          stack: "drilldownCurrent",
        },
        {
          name: $filter("translate")("GOOD_UNITS"),
          id: "units",
          data: goodSeries,
          color: "rgb(26, 169, 23)",
          // events: {
          //   legendItemClick: function () {
          //     console.log("clicked on good!!");
          //
          //     $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("GOOD_UNITS")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("GOOD_UNITS")];
          //     // updateData();
          //
          //   },
          // },
          // visible:$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("GOOD_UNITS")],
          keys: ["y"],
          nameTemp: "good",
          stack: "drilldownCurrent",
        }
      );

      //data for simple table
      for (var i in $scope.data) {
        $scope.unitsSimpleTableY.push($scope.data[i].name);
      }

      $scope.unitsSimpleTableY = $scope.unitsSimpleTableY.reverse();
      $scope.unitsSimpleTableY = [$scope.unitsSimpleTableY[1], $scope.unitsSimpleTableY[2], $scope.unitsSimpleTableY[0]];
      $scope.unitsSimpleTableY.push($filter("translate")("TOTAL_UNITS"));

      for (var i = 0; i < rejectedSeries.length; i++) {
        unitsDataRejectedTest.push({
          duration: rejectedSeries[i][0] ? rejectedSeries[i][0] < 100 ? parseFloat(rejectedSeries[i][0].toFixed(2)) : parseInt(rejectedSeries[i][0]) : rejectedSeries[i][0],
          numOfEvents: -1,
        });
        unitsDataGoodTest.push({
          duration: goodSeries[i][0] ? goodSeries[i][0] < 100 ? parseFloat(goodSeries[i][0].toFixed(2)) : parseInt(goodSeries[i][0]) : goodSeries[i][0],
          numOfEvents: -1,
        });

        unitsDataJoshTest.push({
          duration: theoreticallyJoshSeries[i][0] ? theoreticallyJoshSeries[i][0] < 100 ? parseFloat(theoreticallyJoshSeries[i][0].toFixed(2)) : parseInt(theoreticallyJoshSeries[i][0]) : theoreticallyJoshSeries[i][0],
          numOfEvents: -1,
        });
        unitsDataShiftTest.push({
          duration: theoreticallyShiftSeries[i][0] ? theoreticallyShiftSeries[i][0] < 100 ? parseFloat(theoreticallyShiftSeries[i][0].toFixed(2)) : parseInt(theoreticallyShiftSeries[i][0]) : theoreticallyShiftSeries[i][0],
          numOfEvents: -1,
        });

        unitsTotalDataTest.push({
          duration: rejectedSeries[i][0] + goodSeries[i][0] ? rejectedSeries[i][0] + goodSeries[i][0] < 100 ? parseFloat((rejectedSeries[i][0] + goodSeries[i][0]).toFixed(2)) : parseInt(rejectedSeries[i][0] + goodSeries[i][0]) : rejectedSeries[i][0] + goodSeries[i][0],
          numOfEvents: -1,
        });
      }

      unitsDataRejectedTest.push({ duration: rejectedTotal, numOfEvents: -1 });
      unitsDataGoodTest.push({ duration: goodTotal, numOfEvents: -1 });

      if ($scope.options.settings.calculateBy && JSON.parse($scope.options.settings.calculateBy)) {
        unitsDataGoodTest.push({ duration: theoreticallyJoshTotal < 100 ? parseFloat(theoreticallyJoshTotal.toFixed(2)) : parseInt(theoreticallyJoshTotal), numOfEvents: -1 });
      } else {
        unitsDataShiftTest.push({ duration: theoreticallyShiftTotal < 100? parseFloat(theoreticallyShiftTotal.toFixed(2)): parseInt(theoreticallyShiftTotal), numOfEvents: -1 });
      }
      unitsTotalDataTest.push({
        duration: goodTotal + rejectedTotal ? (goodTotal + rejectedTotal) < 100 ? parseFloat((goodTotal + rejectedTotal).toFixed(2)) : parseInt(goodTotal + rejectedTotal) : goodTotal + rejectedTotal,
        numOfEvents: -1,
      });

      $scope.unitsData.push(unitsDataGoodTest);
      $scope.unitsData.push(unitsDataRejectedTest);
      if ($scope.options.settings.calculateBy && JSON.parse($scope.options.settings.calculateBy)) {
        $scope.unitsData.push(unitsDataJoshTest);
      } else {
        $scope.unitsData.push(unitsDataShiftTest);
      }

      $scope.unitsData.push(unitsTotalDataTest);

      $scope.rotated90DegreeUnitsData = [];

      for (let j = 0; j < $scope.unitsData[0].length; j++) {
        let machineRow = [];
        for (let i = 0; i < $scope.unitsData.length; i++) {
          machineRow.push($scope.unitsData[i][j] || {});
        }
        $scope.rotated90DegreeUnitsData.push(machineRow);
      }
    };

    var calcRefData = function () {
      var goodTotal = 0;
      var rejectedTotal = 0;
      var goodSeries = [];
      var rejectedSeries = [];
      $scope.machines.forEach(function () {
        goodSeries.push([0]);
        rejectedSeries.push([0]);
      });
      _.forEach($scope.shiftData.machineAPIDataRef, function (event) {
        var machineIndex = $scope.machines.indexOf(event.MachineName);
        if (machineIndex >= 0) {
          if (event.UnitsProducedOK >= 0) {
            goodSeries[machineIndex][0] += event.UnitsProducedOK;
            goodTotal += event.UnitsProducedOK;
          }
          if (event.RejectsTotal >= 0) {
            rejectedSeries[machineIndex][0] += event.RejectsTotal;
            rejectedTotal += event.RejectsTotal;
          }
        }
      });

      //push reject units compare
      $scope.data.push({
        name: $filter("translate")("REJECTED_UNITS_COMPARE"),
        data: [
          {
            y: rejectedTotal,
            drilldown: "units",
          },
        ],
        color: "rgba(0,0,0,0.6)",
        legendIndex: 2,
        nameTemp: "rejected",
        stack: "previous",
      });

      //push good units compare
      $scope.data.push({
        name: $filter("translate")("GOOD_UNITS_COMPARE"),
        data: [
          {
            y: goodTotal,
            drilldown: "units",
          },
        ],
        color: "rgba(26, 169, 23,0.6)",
        legendIndex: 3,
        nameTemp: "good",
        stack: "previous",
      });
      // add good units and reject units to drilldown
      $scope.drilldowns.push(
        {
          name: $filter("translate")("REJECTED_UNITS_COMPARE"),
          id: "units",
          data: rejectedSeries,
          color: "rgba(0,0,0,0.6)",
          // events: {
          //   legendItemClick: function () {
          //     $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("REJECTED_UNITS_COMPARE")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("REJECTED_UNITS_COMPARE")];
          //   },
          // },
          nameTemp: "rejected",
          stack: "drilldownPrevious",
        },
        {
          name: $filter("translate")("GOOD_UNITS_COMPARE"),
          id: "units",
          data: goodSeries,
          color: "rgba(26, 169, 23,0.6)",
          // events: {
          //   legendItemClick: function () {
          //     $sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("GOOD_UNITS_COMPARE")]=!$sessionStorage.shiftInsightComponents["unitsProduced"][$filter("translate")("GOOD_UNITS_COMPARE")];
          //
          //   },
          // },
          nameTemp: "good",
          stack: "drilldownPrevious",
        }
      );
    };

    var updateData = function () {
      if (Chart) {
        calcData();
        if ($scope.options.settings.compareWith != "none") {
          calcRefData();
        }
        var drillDownisActive = true;
        if (drillDownisActive) {
          Chart.drillUp();
        }
        Chart.update(
          {
            series: $scope.data.length > 0 ? angular.copy($scope.data) : null,
            drilldown: {
              series: $scope.drilldowns.length > 0 ? angular.copy($scope.drilldowns) : null,
            },
          },
          true,
          true
        );

        if (drillDownisActive) {
          if (Chart.series && Chart.series[0] && Chart.series[0].data && Chart.series[0].data[0] && Chart.series[0].data[0].doDrilldown) {
            Chart.series[0].data[0].doDrilldown();
          }
        }
      }
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);
      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }
      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    $scope.$watch("options.settings.compareWith", function () {
      updateData();
    });
    $scope.$watch("shiftData.machineAPIData", function () {
      updateData();
    });

    $scope.$watchGroup(["shiftData.machinesDisplay", "graph.localMachines"], function () {
      updateData();
      // $scope.graph.isFiltered = false;
    });

    $scope.$watch("shiftData.machineAPIDataRef", function () {
      updateData();
    });

    $scope.$watch(
      "options",
      function (newV, oldV) {
        if ((newV.width !== oldV.width) || (newV.isTableView != oldV.isTableView)) {
          $timeout(function () {
            Chart?.setSize(element.width(), element.height());
          });
          return;
        }

        if (newV.height !== oldV.height) {
          $timeout(function () {
            Chart?.setSize(element.width(), newV.height);
          });
          return;
        }

        $timeout(function () {
          updateData();
        }, 100);
      },
      true
    );

    $scope.init = function () {
      $scope.data = [];
      calcData();

      highchartOptions.series = $scope.data;

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
            this.chartPosition.top = box.top + (window.pageYOffset || docElem.scrollTop) * $rootScope.scaleAfterZoom - (docElem.clientTop || 0);
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
        Chart?.setSize(element.width(), element.height());
      }, 100);
    };

    $(window).resize(function () {
      $timeout(function () {
        Chart?.setSize(element.width(), element.height());
      });
    });
    //   const getHeader = () => {
    //     const header = [...$scope.columns];
    //     header.unshift($filter('translate')('MACHINES'));
    //     return header;
    // };
    //   $scope.exportCsv.value = () => {
    //     const rows = [];
    //     rows.push(getHeader());
    //     for(let i = 0; i < $scope.rows.length; i++){
    //         if (!$scope.rows[i].dontShow) {
    //             rows.push(getRow(i));
    //         }
    //     }
    //     let csvContent = "data:text/csv;charset=utf-8,"
    //         + rows.map(e => e.join(",")).join("\n");
    //     var encodedUri = encodeURI(csvContent);
    //     var link = document.createElement("a");
    //     link.setAttribute("href", encodedUri);
    //     link.setAttribute("download", "machine_performance.csv");
    //     document.body.appendChild(link); // Required for FF

    //     link.click(); // This will download the data file named "my_data.csv".

    // };

    $scope.init();
  };

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph: "=",
      exportCsv: "=",
    },
    controller: controller,
    controllerAs: "unitsProducedCtrl",
  };
};

angular.module("LeaderMESfe").directive("unitsProducedDirective", unitsProducedDirective);
