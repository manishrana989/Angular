var machinesLoadBarDirective = function () {
  var Template = "views/custom/productionFloor/shiftTab/machinesLoadBar/machinesLoadBar.html";

  var controller = function ($scope, shiftService, LeaderMESservice, $element, $timeout, $filter,$rootScope) {
    $scope.shiftData = shiftService.shiftData;

    var updateMachineAvailabilityBar = function () {
      $scope.StartDate = $filter("date")(new Date(shiftService.sliderData.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
      $scope.EndDate = $filter("date")(new Date(shiftService.sliderData.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");


      if($scope.shiftData.dataTimePeriod == 2 && !$scope.shiftData.isCustomAllShifts){
        $scope.StartDate = $scope.shiftData.shiftStartDate;
        $scope.EndDate = $scope.shiftData.shiftEndDate
      }
      else{
        $scope.StartDate =$filter("date")(new Date(shiftService.sliderData.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
        $scope.EndDate = $filter("date")(new Date(shiftService.sliderData.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
      }

      var machinesId = [];
      let isFiltered=false;
      _.forIn($scope.graph.localMachines, function (value, key) {
        if (value.value) {
          machinesId.push(value.ID);
        }else{
        isFiltered=true;
        }
      }
      );
      $scope.graph.isFiltered=isFiltered;

      if (machinesId.length === 0) {
        $scope.shiftData["machinesLoadBar"] = [];
        barGraph();
        return;
      }

      LeaderMESservice.customAPI("GetDepartmentHourlyUnitsProduced", {
        DepartmentID: $scope.shiftData.DepartmentID,
        StartDate: $scope.StartDate,
        EndDate: $scope.EndDate,
        MachineID: machinesId,
      }).then(function (response) {
        if (response && response.ResponseDictionaryDT) {
          $scope.shiftData["machinesLoadBar"] = response.ResponseDictionaryDT.Data;
          barGraph();
        }
      });
    };

    var barGraph = function () {
      var categories = [],
        series = [],
        seriesLines = [],
        color,
        oldMaxTotal = -Infinity,
        oldMinTotal = Infinity;

      _.forEach($scope.shiftData.machinesLoadBar, function (obj) {
        if (obj.UnitsRatio && obj.UnitsRatio > oldMaxTotal) {
          oldMaxTotal = obj.UnitsRatio;
        }
        if (obj.UnitsRatio && obj.UnitsRatio < oldMinTotal) {
          oldMinTotal = obj.UnitsRatio;
        }
      });
      _.forEach($scope.shiftData.machinesLoadBar, function (obj) {
        if ($scope.graph.options.settings.colorMode) {
          if (obj.UnitsRatio > $scope.colors[0].value / 100) {
            color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[0].color, (obj.UnitsRatio - $scope.colors[0].value / 100) / (oldMaxTotal - $scope.colors[0].value / 100)) : $scope.colors[0].color;
          } else if (obj.UnitsRatio < $scope.colors[1].value / 100) {
            color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[1].color, 1 - (obj.UnitsRatio - oldMinTotal) / ($scope.colors[1].value / 100 - oldMinTotal)) : $scope.colors[1].color;
          } else {
            color = $scope.colors[2].color;
          }
        } else {
          color = `rgba(24, 181, 21, ${obj.UnitsRatio + 0.3})`;
        }
        categories.push(moment(obj.RecordTime).format("HH:mm"));
        series.push({
          y: obj.UnitsProducedOK,
          UnitsProducedOK: obj.UnitsProducedOK,
          UnitsProducedTheoretically: obj.UnitsProducedTheoretically,
          UnitsRatio: obj.UnitsRatio,
          color: color,
        });

        seriesLines.push({ y: obj.UnitsProducedTheoretically, UnitsProducedOK: obj.UnitsProducedOK, UnitsProducedTheoretically: obj.UnitsProducedTheoretically, UnitsRatio: obj.UnitsRatio, color: "red" });
      });

      var options = {
        chart: {
          type: "column",
        },
        title: {
          text: "",
        },
        subtitle: {
          text: "",
        },
        xAxis: {
          categories: categories,
          crosshair: true,
        },
        yAxis: {
          title: {
            text: "",
          },
        },
        tooltip: {
          formatter: function () {
            return `<div class="machinesLoadToolTip"><b>${$filter("translate")("UNITS_PRODUCED")}:</b> ${this.points[0].point.UnitsProducedOK ? parseFloat(this.points[0].point.UnitsProducedOK.toFixed(2)) : this.points[0].point.UnitsProducedOK}</br>
                    <b>${$filter("translate")("THEORETICAL_UNITS")}:</b> ${this.points[0].point.UnitsProducedTheoretically ? parseFloat(this.points[0].point.UnitsProducedTheoretically.toFixed(2)) : this.points[0].point.UnitsProducedTheoretically}</br>
                    <b>${$filter("translate")("PERFORMANCE_PERCENTAGE")}:</b> ${this.points[0]?.point?.UnitsRatio && this.points[0]?.point?.UnitsRatio < 100 ? parseFloat(this.points[0]?.point?.UnitsRatio?.toFixed(2)) : parseInt(this.points[0]?.point?.UnitsRatio)}</div>`;
          },
          shared: true,
          useHTML: true,
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          { type: "column", data: series },
          {
            type: "spline",
            data: seriesLines,
            marker: {
              enabled: false,
            },
          },
        ],
      };
      $scope.Chart = Highcharts.chart("container" + $scope.$id, options);
      $timeout(function () {
        $scope.Chart?.setSize($element[0].getBoundingClientRect().width, $scope.options.height);
      }, 200);
    };
    
    $(window).resize(function () {
      $scope.Chart?.setSize($element[0].getBoundingClientRect().width, $scope.options.height);
    });


    const convertHexToRGBA = (hexCode, opacity) => {
      let hex = hexCode.replace("#", "");

      if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      return `rgba(${r},${g},${b},${opacity})`;
    };

    $scope.$watch(
      "options",
      function (newV, oldV) {
        if (newV.width !== oldV.width || newV.height !== oldV.height) {
          $timeout(function () {
            $scope.Chart?.setSize($element[0].getBoundingClientRect().width, newV.height);
          }, 200);
        }
      },
      true
    );

    $scope.$watch(
     'graph.options.settings',
      function () {
        $scope.initWrapper();
      },
      true
    );



    $scope.initWrapper = function () {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        barGraph();
      }, 300);
    };

    $scope.updateMachineAvailabilityBarTimeOut = function () {
      if ($scope.initTimeout2) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout2 = $timeout(function () {
        updateMachineAvailabilityBar();
      }, 400);
    };

    // shiftService.displayUpdateDefferd.promise.then(null, null, function () {
    //   $scope.updateMachineAvailabilityBarTimeOut();
    // });
    // $scope.updateMachineAvailabilityBarTimeOut();


    $scope.$watch("graph.localMachines", function () {
      $scope.updateMachineAvailabilityBarTimeOut();
  });

      
  $scope.$watch("shiftData.machinesLoadBar",function () {
      $scope.initWrapper()
    },true
  );

    $scope.$watchGroup(
      ["shiftData.machinesDisplay"],
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          $scope.updateMachineAvailabilityBarTimeOut();

        }
      },
      true
    );




    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);
      if (component && component.localMachines) {
        $scope.localMachines = angular.copy(component.localMachines);
      }

      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }

      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });


  };
  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph: "=",
      colors: "=",
    },
    controller: controller,
    controllerAs: "machinesLoadBarCtrl",
  };
};

angular.module("LeaderMESfe").directive("machinesLoadBarDirective", machinesLoadBarDirective);
