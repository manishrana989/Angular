var shiftInsightTrendElementDirective = function () {
  var controller = function (
    $scope,
    shiftService,
    insightService,
    LeaderMESservice,
    $timeout,
    googleAnalyticsService,
    SweetAlert,
    $filter,
    $sessionStorage,
    $localStorage,
    toastr
  ) {
    $scope.shiftData = shiftService.shiftData;
    $scope.loadTemplate = insightService.updateContainerInsightPage;
    $scope.showInsightsAbsolute = false;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.trendOptionsWindow = { isVisible: false };
    $scope.elementData = {};
    $scope.graphLoaded=false;

    // $scope.$on("closeAboslute", function () {
    //     $scope.showInsightsAbsolute = false;
    // });
    $scope.deleteDashboard = function (template) {
      SweetAlert.swal(
        {
          title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_DELETE_THE_DASHBOARD"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#D0D0D0",
          confirmButtonText: $filter("translate")("YES"),
          cancelButtonText: $filter("translate")("NO"),
          closeOnConfirm: true,
          closeOnCancel: true,
          animation: "false",
          customClass: "",
          // swalRTL
        },
        function (isConfirm) {
          if (isConfirm) {
            $scope.deleteTemplate(template);
          }
        }
      );
    };

    $scope.buildLineGraph = function () {
      $scope.graphLoaded=false;
      let trendDotsNum = $scope.elementData.Trend.length;
      let dotsArr = [];
      angular.forEach($scope.elementData.Trend, (shift) => {
        dotsArr.push(shift.Unreported);
      });
      // console.log("dots:",dotsArr);
      let hi = {
        tooltip: { enabled: false },
        title: {
          text: "",
        },
        exporting: {
          enabled: false,
        },
        chart: {
          type: "line",
          height: "78%",
          backgroundColor: "#FFFFFF",
          borderWidth: 0,
          plotBorderWidth: 0,
          plotShadow: false,
          spacing: [0, 0, 0, 0],
          marginRight: 20,
        },

        yAxis: {
          title: {
            text: "Number of Employees",
          },
          visible: false,
        },

        xAxis: {
          accessibility: {
            rangeDescription: `Range: 0 to ${trendDotsNum - 1}`,
          },
          max: trendDotsNum + 1,
          visible: false,
          // reversed:$scope.rtl
        },

        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "bottom",
          shadow: false,
          rtl: $scope.rtl,
        },

        plotOptions: {
          series: {
            label: {
              connectorAllowed: true,
            },
            animation: {
              duration: 2000,
            },
            marker: {
              enabled: false,
            },
            color: "#000000",
            lineWidth: 1,
          },
        },

        series: [
          {
            showInLegend: false,
            name: "",
            data: dotsArr,
          },
        ],

        responsive: {
          rules: [
            {
              chartOptions: {
                legend: {
                  layout: "horizontal",
                  align: "left",
                  verticalAlign: "bottom",
                },
              },
            },
          ],
        },
      };
      Highcharts.wrap(Highcharts.Series.prototype, "drawGraph", function (proceed) {
        // Now apply the original function with the original arguments,
        // which are sliced off this function's arguments
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        var arrowLength = 6,
          arrowWidth = 4,
          series = this,
          lastPoint = series.points[series.points.length - 1],
          nextLastPoint = series.points[series.points.length - 2],
          path = [];

        var angle = Math.atan((lastPoint.plotX - nextLastPoint.plotX) / (lastPoint.plotY - nextLastPoint.plotY));

        if (angle < 0) angle = Math.PI + angle;

        path.push("M", lastPoint.plotX, lastPoint.plotY);

        if (lastPoint.plotX > nextLastPoint.plotX) {
          path.push("L", lastPoint.plotX + arrowWidth * Math.cos(angle), lastPoint.plotY - arrowWidth * Math.sin(angle));
          path.push(lastPoint.plotX + arrowLength * Math.sin(angle), lastPoint.plotY + arrowLength * Math.cos(angle));
          path.push(lastPoint.plotX - arrowWidth * Math.cos(angle), lastPoint.plotY + arrowWidth * Math.sin(angle), "Z");
        } else {
          path.push("L", lastPoint.plotX - arrowWidth * Math.cos(angle), lastPoint.plotY + arrowWidth * Math.sin(angle));
          path.push(lastPoint.plotX - arrowLength * Math.sin(angle), lastPoint.plotY - arrowLength * Math.cos(angle));
          path.push(lastPoint.plotX + arrowWidth * Math.cos(angle), lastPoint.plotY - arrowWidth * Math.sin(angle), "Z");
        }

        if (series.arrow) {
          series.arrow.attr({
            d: path,
          });
        } else {
          series.arrow = series.chart.renderer
            .path(path)
            .attr({
              fill: series.color,
            })
            .add(series.group);
        }
      });

      Chart = $(`#${$scope.name}Trend`).highcharts(hi).highcharts();
      Chart?.setSize(null); 
      $scope.graphLoaded=true;
    };

    $scope.initElement = function () {
      let filterByBody = [{ FilterName: "MachineIdFilter", FilterValues: [] }];
      for (let machine in shiftService.shiftData.machinesDisplay) {
        if (shiftService.shiftData.machinesDisplay[machine]) {
          filterByBody[0]["FilterValues"].push(machine);
        }
      }

      let startDate, endDate;
      let shiftID = shiftService.shiftData.data.CurrentShift[0].ID;

      switch (shiftService.shiftData.dataTimePeriod) {
        case 2:
          startDate = shiftService.shiftData.customRange.startDate;
          endDate = shiftService.shiftData.customRange.endDate;
          break;
        case 3:
          startDate = shiftService.shiftData.firstShiftIn24Hours.StartTime;
          endDate = shiftService.shiftData.lastShiftIn24Hours.StartTime;
        default:
          startDate = shiftService.shiftData.data.CurrentShift[0].StartTime;
          endDate = shiftService.shiftData.data.CurrentShift[shiftService.shiftData.data.CurrentShift.length - 1].EndTime;
      }
      switch ($scope.name) {
        case "unreportedStops":
          LeaderMESservice.customAPI("GetUnreportedEventsTrendComparison", {
            SelectedShiftID: shiftID,
            CurrentShiftID: shiftID,
            CompareOption: Number($scope.compareoption),
            StartDate: startDate,
            EndDate: endDate,
            Argument: Number($scope.argument),
            TrendOption: Number($scope.trendoption),
            filterBy: filterByBody,
          }).then(function (response) {
            // console.log("response",response);
            $scope.elementData = response.ResponseDictionary;
            if (!$scope.elementData.Comparison) {
              $scope.elementData.Comparison = [
                { Unreported: 0, Total: 0, PC: 0 },
                { Unreported: 0, Total: 0, PC: 0 },
              ];
            } else {
              if ($scope.elementData.Comparison.find((data) => data.isCompare == 0) == undefined) {
                $scope.elementData.Comparison.unshift({ Unreported: 0, Total: 0, PC: 0 });
              }
              if ($scope.elementData.Comparison.find((data) => data.isCompare == 1) == undefined) {
                $scope.elementData.Comparison.push({ Unreported: 0, Total: 0, PC: 0 });
              }
            }
            $scope.elementData.precentageDiff = (($scope.elementData.Comparison[0].PC - $scope.elementData.Comparison[1].PC) * 100).toFixed(
              2
            );
            $scope.elementData.currentPC = ($scope.elementData.Comparison[0].PC * 100).toFixed(2);
            $scope.buildLineGraph();
          });
          break;
        default:
          break;
      }
    };

    $scope.$watchGroup(
      ["compareoption", "startdate", "enddate", "argument", "filterby", "trendoption", "shiftData.machinesDisplay"],
      function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.initElement();
        }
      },
      true
    );

    $scope.initElement();
  };

  return {
    restrict: "E",
    templateUrl: "views/custom/productionFloor/shiftTab/insightsDashboard/shiftInsightsTrendElement/shiftInsightsTrendElementTemplate.html",
    scope: {
      name: "=",
      elementname: "=",
      selectedshiftid: "=",
      compareoption: "=",
      startdate: "=",
      enddate: "=",
      argument: "=",
      trendoption: "=",
      view: "=",
    },
    controller: controller,
    controllerAs: "shiftInsightTrendElementCtrl",
  };
};

angular.module("LeaderMESfe").directive("shiftInsightTrendElement", shiftInsightTrendElementDirective);
