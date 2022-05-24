var topRejectsDirective = function ($rootScope) {
  var Template = "views/custom/productionFloor/shiftTab/topRejects/topRejects.html";

  var controller = function ($scope, shiftService, $element, LeaderMESservice, $filter) {
    $scope.shiftData = shiftService.shiftData;
    $scope.tooltipShow = false;
    $scope.tooltipMachines = "";
    $scope.simpleTableName = $filter("translate")("REASONS");
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    var tooltip = d3.select($element[0]).select(".machine-top-event-tooltip");

    shiftService.displayUpdateDefferd.promise.then(null, null, function () {
      shiftService.getRejectsReasonsByDatesForMachine();
    });

    $scope.reasonsToPrint = function (reasons) {
      let titleStr = "";
      _.forEach(reasons, function (reason, index) {
        titleStr += `${$scope.localLanguage ? reason.MachineLName : reason.MachineName} (${reason.Amount})`;
        titleStr += index == reasons.length - 1 ? "" : ", ";
      });
      return titleStr;
    };

    $scope.tooltip = function (event, data) {
      $scope.tooltipShow = true;
      tooltip.style("position", "fixed");
      tooltip.select(".tooltip-event-type").html(data.AffectMachineNames);
    };

    $scope.tooltipMove = function (event) {
      tooltip
        .style("top", event.clientY * $rootScope.scaleAfterZoom + 20 + "px")
        .style("left", event.clientX * $rootScope.scaleAfterZoom - 25 + "px");
    };

    $scope.tooltipLeave = function () {
      $scope.tooltipShow = false;
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);

      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }

      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    $scope.$watch("options.isTableView", function () {
      if ($scope.options.isTableView) {
        if ($scope.result) getTotalRejectesByReason();
        buildTableData();
      }
    });

    $scope.$watch("options.settings.division", function () {
      if ($scope.options.settings.division) {
        getTotalRejectesByReason();
      }
    });
    $scope.$watch("shiftData.rejectsByMachine", function () {
      if ($scope.options.settings.division) {
        getTotalRejectesByReason();
      }
    });

    $scope.$watch("options.settings.top", function () {
      shiftService.getTopRejects();
      getTotalRejectesByReason();
    });

    $scope.$watch("shiftData.topRejects", function () {
      if ($scope.options.isTableView) {
        buildTableData();
      }
    });

    $scope.$watchGroup(["shiftData.machinesDisplay", "graph.localMachines"], function () {
      shiftService.getTopRejects($scope.graph.localMachines);
      getTotalRejectesByReason();
      $scope.graph.isFiltered = false;
    });

    var filterMachines = function () {
      var newArray = [];
      _.forEach($scope.shiftData.rejectsByMachine, function (reason) {
        _.map(reason, function (r) {
          let subMachine = $scope.graph.localMachines.find((machine) => machine.ID == r.MachineID);
          // if($scope.shiftData.machinesDisplay[r.MachineID] == true){
          if (subMachine && subMachine.value) {
            newArray.push(r);
          }
        });
      });
      return newArray;
    };

    var getTotalRejectesByReason = function () {
      var totalArr = [];
      var filteredMachine = _.groupBy(filterMachines(), "Name");
      //each machine total
      _.forEach(filteredMachine, function (reason) {
        var total = 0;
        _.forEach(reason, function (r) {
          total += r.Amount;
        });
        totalArr.push({ reason: reason[0].Name, total: total });
      });

      //grouping
      var merged = [];
      _.forEach(filteredMachine, function (reason) {
        var name = reason[0].Name;
        var arr = _.filter(totalArr, function (arr) {
          return arr.reason === name;
        });
        var total = arr[0].total;
        merged.push({ reason, total });
      });

      //sorting and getting top values
      $scope.result = _.sortByOrder(merged, ["total"], ["desc"]);

      $scope.result = $scope.result.slice(0, $scope.options.settings.top);
      //for row width and each machine size
      if ($scope.result.length > 0 && $scope.result[0] != undefined) {
        $scope.maxTotal = $scope.result[0].total;
        $scope.totalSum = _.reduce(
          $scope.result,
          function (sum, obj) {
            sum += parseInt(obj["total"]);
            return sum;
          },
          0
        );
      }
    };
    var buildTableData = function () {
      $scope.machineNameArr = [];
      $scope.ySimpleTable = [];
      _.map($scope.result, function (event) {
        $scope.ySimpleTable.push($scope.localLanguage ? event.reason[0].LName : event.reason[0].Name);
      });
      $scope.ySimpleTable.push($filter("translate")("TOTAL"));

      _.forEach($scope.result, function (result) {
        _.map(result.reason, function (event) {
          $scope.machineNameArr.push($scope.localLanguage ? event.MachineLName : event.MachineName);
        });
      });
      $scope.machineNameArr = Array.from(new Set($scope.machineNameArr));
      $scope.machineNameArr.sort();
      $scope.machineNameArr.push($filter("translate")("TOTAL"));

      $scope.simpleTableData = [];
      _.forEach($scope.result, function (result) {
        var reasonAmount = [];
        _.map($scope.machineNameArr, function (machineName) {
          if (machineName != $filter("translate")("TOTAL")) {
            var tmpRow = _.find(result.reason, $scope.localLanguage ? { MachineLName: machineName } : { MachineName: machineName });
            if (tmpRow) {
              reasonAmount.push({ duration: parseFloat(tmpRow.Amount.toFixed(2)), totalNumOfEvents: -1 });
            } else {
              reasonAmount.push({ duration: 0, totalNumOfEvents: -1 });
            }
          }
        });
        reasonAmount.push({ duration: parseFloat(result.total.toFixed(2)), totalNumOfEvents: -1 });
        $scope.simpleTableData.push(reasonAmount);
      });

      var totalArr = [];
      var i = 0;
      _.forEach($scope.machineNameArr, function () {
        //calculate column total
        var sumTotal = 0;
        _.map($scope.simpleTableData, function (data) {
          sumTotal += data[i].duration;
        });
        totalArr.push({ duration: parseFloat(sumTotal.toFixed(2)), totalNumOfEvents: -1 });
        i++;
      });
      $scope.simpleTableData.push(totalArr);
    };
  };

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph: "=",
    },
    controller: controller,
    controllerAs: "topRejectsCtrl",
  };
};

angular.module("LeaderMESfe").directive("topRejectsDirective", topRejectsDirective);
