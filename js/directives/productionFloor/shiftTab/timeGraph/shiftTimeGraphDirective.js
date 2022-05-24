var shiftTimeGraphDirective = function () {
  var Template = "views/custom/productionFloor/shiftTab/timeGraph/shiftTimeGraph.html";

  function controller($scope, shiftService, $timeout, $filter, uiGridConstants, LeaderMESservice, $sessionStorage, $rootScope) {
    var shiftTimeGraphCtrl = this;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.rtl = LeaderMESservice.isLanguageRTL() ? "rtl" : "";
    $scope.Machines = [];
    $scope.slider = shiftService.sliderData;
    $scope.shiftData = shiftService.shiftData;
    $scope.refshiftnum = $scope.shiftData.data.ReferanceShift ? $scope.shiftData.data.ReferanceShift.length : 1;
    $scope.eventStructure = $scope.shiftData.data.EventDistributionStructure;
    $scope.showKPIS = true;

    $scope.buildFilterData = function () {
      if(!$scope.graph || !$scope.graph.filterData){
     
        $scope.graph.filterData = [];
        $scope.graph.filterData.push({
          name: $filter("translate")("STATUS"),
          data: $scope.availableStatses,
          display: "true",
          id: 1,
        });
        $scope.graph.filterData.push({
          name: $filter("translate")("TIMES"),
          data: $scope.times,
          display: "true",
          id: 2,
        });
        if ($scope.KPIs && $scope.KPIs.length > 0) {
          $scope.graph.filterData.push({
            name: $filter("translate")("KPIS"),
            data: $scope.KPIs,
            display: "true",
            id: 3,
          });
        }
        $scope.graph.filterData.push({
          name: $filter("translate")("UNITS"),
          data: $scope.units,
          display: "true",
          id: 4,
        });
        $scope.graph.filterData = $scope.graph.filterData;
      }
    };

    //takes eng name, caps it, then replaces whitespace with _, then filters
    let getTranslation = function (str) {
      let upperCaseStatus = $filter("uppercase")(str);
      let noSpace = upperCaseStatus.replace(/\s/g, "_");
      return $filter("translate")(noSpace);
    };

    $scope.filterMachinesToDisplay = function (updateMachines) {
      // console.log("graph param:",$scope.graph);
      $scope.Machines = _.filter($scope.shiftData.Machines, function (machine) {
        let localMachineFilter = $scope.graph.localMachines.find((localMachine) => localMachine.ID == machine.machineID);
        // console.log("fond sub machine:",localMachineFilter);
        return localMachineFilter && localMachineFilter.value;
      });

      // if($scope.machinesFilterUpdate){
      //   $scope.machinesFilterUpdate();
      // }
    };

    $scope.buildOrigStatuses = function (isCurrentShift) {
      var min = shiftService.sliderData.minValue * 60 * 1000;
      var max = shiftService.sliderData.maxValue * 60 * 1000;
      if (isCurrentShift) {
        $scope.machinesStatuses = {};
      } else {
        $scope.machinesRefStatuses = {};
      }
      let avalSessionStatus;
      let availableStatses = isCurrentShift ? $scope.availableStatses || [] : $scope.availableRefStatses || [];
      var machines = $scope.shiftData.Machines;
      if ($scope.shiftData.customRangeEnabled) {
        machines = isCurrentShift ? $scope.shiftData.aggregateData || [] : [];
      }
      for (var i = 0; machines != null && i < machines.length; i++) {
        var machineStatuses = {};
        var statuses = {};
        if ($scope.shiftData.customRangeEnabled) {
          statuses = _.groupBy(machines[i].Events, "EventDistributionID");
        } else {
          if (isCurrentShift) {
            statuses = _.groupBy(machines[i].CurrShift.Events, "EventDistributionID");
          } else if (machines[i].RefShift) {
            statuses = _.groupBy(machines[i].RefShift.Events, "EventDistributionID");
          }
        }
        for (var key in statuses) {
          var avalStatusFound = _.find(availableStatses, { id: key });
          if ($scope.graph.filterData && $scope.graph.filterData[0] && $scope.graph.filterData[0].data) {
            avalSessionStatus = _.find($scope.graph.filterData[0].data, { id: key });
          }
          if (!avalStatusFound) {
            availableStatses.push({
              id: key,
              name: getTranslation(statuses[key][0].Name),
              display: avalSessionStatus ? avalSessionStatus.display : true,
              color: statuses[key][0].Color,
            });
          }
          statuses[key].forEach(function (status) {
            if (isCurrentShift && !$scope.shiftData.customRangeEnabled && !(new Date(status.StartTime).getTime() >= min && new Date(status.EndTime).getTime() <= max)) {
              return;
            }
            if (machineStatuses[key]) {
              machineStatuses[key] += status.Duration;
            } else {
              machineStatuses[key] = status.Duration;
            }
          });
        }
        if (isCurrentShift) {
          $scope.machinesStatuses[$scope.shiftData.Machines[i].machineID] = machineStatuses;
          $scope.availableStatses = [...availableStatses];
        } else {
          $scope.machinesRefStatuses[$scope.shiftData.Machines[i].machineID] = machineStatuses;
          $scope.availableRefStatses = [...availableStatses];
        }
      }
    };

    $scope.buildOrigStatuses(true);
    $scope.buildOrigStatuses(false);

    $scope.getStatuses = function (isCurrentShift) {
      var statuesAns = [];
      var filteredAvailavleStatuses = isCurrentShift ? $scope.availableStatses : $scope.availableRefStatses;
      if (!$scope.emptyFilter) {
        let availableStatses = isCurrentShift ? $scope.availableStatses : $scope.availableRefStatses;
        filteredAvailavleStatuses = _.filter(availableStatses, { display: true });
      }
      filteredAvailavleStatuses = _.sortByOrder(filteredAvailavleStatuses, ["id"]);

      for (var i = 0; i < filteredAvailavleStatuses.length; i++) {
        var temp = [];
        temp.push({
          cellData: i == 0 ? $filter("translate")("STATUS") : null,
          first: true,
          rows: filteredAvailavleStatuses.length,
        });
        temp.push({
          cellData: filteredAvailavleStatuses[i].name,
          id: filteredAvailavleStatuses[i].id,
          second: true,
          color: filteredAvailavleStatuses[i].color,
        });
        statuesAns.push(temp);
      }
      $scope.machineSum = {};
      for (var i = 0; $scope.machinesOrder && i < $scope.machinesOrder.length; i++) {
        for (var j = 0; j < statuesAns.length; j++) {
          let machinestatusItem;
          if (isCurrentShift) {
            machinestatusItem = $scope.machinesStatuses[$scope.machinesOrder[i]];
          } else {
            machinestatusItem = $scope.machinesRefStatuses[$scope.machinesOrder[i]];
          }

          var tempCellData = machinestatusItem ? machinestatusItem[statuesAns[j][1].id] : undefined;

          statuesAns[j].push({
            cellData: tempCellData,
            filter: "duration",
          });
          $scope.machineSum[j] = ($scope.machineSum[j] || 0) + (tempCellData || 0);
        }
      }
      for (var j = 0; j < statuesAns.length; j++) {
        statuesAns[j].push({
          cellData: $scope.machineSum[j],
          filter: "duration",
        });
      }
      return statuesAns;
    };

    $scope.getDataFromAggregatedData = function (title, strcutre, data, filter, sum) {
      var ans = [];
      var filteredStrcutre = strcutre;
      if (!$scope.emptyFilter) {
        filteredStrcutre = _.filter(strcutre, { display: true });
      }
      for (var i = 0; i < filteredStrcutre.length; i++) {
        $scope.sum = 0;
        var temp = [];
        temp.push({
          cellData: i == 0 ? title : null,
          first: true,
          rows: filteredStrcutre.length,
        });
        temp.push({
          cellData: filteredStrcutre[i].name,
          second: true,
        });
        for (var j = 0; j < $scope.machinesOrder.length; j++) {
          var machine = _.find(data, { Id: $scope.machinesOrder[j] });
          let cellData = (machine && machine[filteredStrcutre[i].id] && machine[filteredStrcutre[i].id].toFixed(2)) || undefined;
          temp.push({
            cellData: cellData,
            filter: filter,
          });
          if (sum && cellData) {
            $scope.sum += parseInt(cellData);
          }
        }

        if (sum) {
          temp.push({
            cellData: $scope.sum !== 0 ? $scope.sum.toString() : undefined,
            filter: filter,
          });
        }
        ans.push(temp);
      }
      return ans;
    };

    //make data table for simple tables
    $scope.makeTableData = function (name, table, refTable) {
      var tempDataTable = [];
      var tempRefDataTable = [];
      var dataSimpleTable = [];
      var dataRefSimpleTable = [];
      var yTemp = [];

      for (var i = 1; i < table.length; i++) {
        yTemp.push({
          name: table[i][1].cellData,
          color: table[i][1].color,
        });
        for (var j = 2; j < table[i].length; j++) {
          if (table[i][j].cellData === "NaN") {
            table[i][j].cellData = undefined;
          }
          if (table[i][j].filter) {
            tempDataTable.push({
              duration: $filter("getDurationInHoursMinutes")(table[i][j].cellData),
              numOfEvents: -1,
            });
          } else {
            tempDataTable.push({
              duration: table[i][j].cellData ? parseFloat((+table[i][j].cellData).toFixed(2)) + "" : table[i][j].cellData,
              numOfEvents: -1,
            });
          }
          if (refTable && refTable[i] && refTable[i][j].cellData != "NaN") {
            if (refTable[i][j].filter) {
              tempRefDataTable.push({
                duration: $filter("getDurationInHoursMinutes")(refTable[i][j].cellData),
                numOfEvents: -1,
              });
            } else {
              tempRefDataTable.push({
                duration: refTable[i][j].cellData ? parseFloat((+refTable[i][j].cellData).toFixed(2)) + "" : refTable[i][j].cellData,
                numOfEvents: -1,
              });
            }
          } else {
            tempRefDataTable.push({
              duration: undefined,
              numOfEvents: -1,
            });
          }
        }
        dataSimpleTable.push(tempDataTable);
        tempRefDataTable ? dataRefSimpleTable.push(tempRefDataTable) : [];
        tempDataTable = [];
        tempRefDataTable = [];
      }
      switch (name) {
        case "Status":
          $scope.dataSimpleTableStatus = [...dataSimpleTable];
          $scope.dataSimpleTableRefStatus = [...dataRefSimpleTable];
          $scope.yStatus = [...yTemp];
          break;
        case "Times":
          $scope.dataSimpleTableTimes = [...dataSimpleTable];
          $scope.dataSimpleTableRefTimes = [...dataRefSimpleTable];
          $scope.yTimes = [...yTemp];
          break;
        case "KPIS":
          $scope.dataSimpleTableKPIS = [...dataSimpleTable];
          $scope.dataSimpleTableRefKPIS = [...dataRefSimpleTable];
          $scope.yKPIS = [...yTemp];
          break;
        case "Units":
          $scope.dataSimpleTableUnits = [...dataSimpleTable];
          $scope.dataSimpleTableRefUnits = [...dataRefSimpleTable];
          $scope.yUnit = [...yTemp];
          break;
      }
    };

    $scope.buildTableData = function () {
      $scope.yStatus = [];
      $scope.yTimes = [];
      $scope.yKPIS = [];
      $scope.yUnit = [];
      $scope.dataSimpleTableStatus = [];
      $scope.dataSimpleTableTimes = [];
      $scope.dataSimpleTableKPIS = [];
      $scope.dataSimpleTableUnits = [];
      $scope.statusTableName = $filter("translate")("STATUS");
      $scope.timesTableName = $filter("translate")("TIMES");
      $scope.KPISTableName = $filter("translate")("KPIS");
      $scope.UnitsTableName = $filter("translate")("UNITS");
      $scope.machineNames = [];
      $scope.dataSimpleTableRefStatus = [];
      $scope.dataSimpleTableRefTimes = [];
      $scope.dataSimpleTableRefKPIS = [];
      $scope.dataSimpleTableRefUnits = [];
      if ($scope.filterData) {
        let availableStatsesFilter = $scope.filterData.filter((it) => it.name === $filter("translate")("STATUS"));
        $scope.availableStatses && $scope.availableStatses.length > 0 ? (availableStatsesFilter[0].data = $scope.availableStatses) : "";
        $scope.availableStatses = availableStatsesFilter.length > 0 ? availableStatsesFilter[0].data : $scope.availableStatses;

        let KPIsFilter = $scope.filterData.filter((it) => it.name === $filter("translate")("KPIS"));
        $scope.KPIs = KPIsFilter.length > 0 ? KPIsFilter[0].data : $scope.KPIs;

        let unitsFilter = $scope.filterData.filter((it) => it.name === $filter("translate")("UNITS"));
        $scope.units = unitsFilter.length > 0 ? unitsFilter[0].data : $scope.units;

        let timesFilter = $scope.filterData.filter((it) => it.name === $filter("translate")("TIMES"));
        $scope.times = timesFilter.length > 0 ? timesFilter[0].data : $scope.times;
      }

      $scope.machinesOrder = _.map($scope.shiftData.Machines, "machineID");
      _.remove($scope.machinesOrder, function (machineId) {
        return !$scope.shiftData.machinesDisplay[machineId];
      });
      $scope.tableData = [
        _.map(
          _.filter($scope.shiftData.Machines, function (machine) {
            return $scope.shiftData.machinesDisplay[machine.machineID];
          }),
          function (machine) {
            return {
              cellData: machine.machineName,
            };
          }
        ),
      ];

      $scope.tableDataWithOutTotal = JSON.parse(JSON.stringify($scope.tableData));
      $scope.tableData[0].push({ cellData: $filter("translate")("TOTAL") });
      for (var i = 0; i < $scope.tableData[0].length; i++) {
        $scope.machineNames.push($scope.tableData[0][i].cellData);
      }

      //status
      let withTotalColumn = true;
      let tableToDisplay = withTotalColumn ? $scope.tableData : $scope.tableDataWithOutTotal;
      $scope.tableDataStatuses = tableToDisplay.concat($scope.getStatuses(true));
      $scope.tableRefDataStatuses = tableToDisplay.concat($scope.getStatuses(false));
      //times
      withTotalColumn = true;
      tableToDisplay = withTotalColumn ? $scope.tableData : $scope.tableDataWithOutTotal;
      $scope.tableDataTime = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("TIMES"), $scope.times, $scope.machineAPIData, "duration", withTotalColumn));
      $scope.tableRefDataTime = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("TIMES"), $scope.times, $scope.machineAPIRefData, "duration", withTotalColumn));
      //unit
      withTotalColumn = true;
      tableToDisplay = withTotalColumn ? $scope.tableData : $scope.tableDataWithOutTotal;
      $scope.tableDataUnits = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("UNITS"), $scope.units, $scope.machineAPIData, null, withTotalColumn));
      $scope.tableRefDataUnits = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("UNITS"), $scope.units, $scope.machineAPIRefData, null, withTotalColumn));
      //make Table Data
      $scope.makeTableData("Status", $scope.tableDataStatuses, $scope.tableRefDataStatuses);
      $scope.makeTableData("Times", $scope.tableDataTime, $scope.tableRefDataTime);
      $scope.makeTableData("Units", $scope.tableDataUnits, $scope.tableRefDataUnits);
      $scope.showKPIS = $scope.machineAPIKpiData && $scope.machineAPIKpiData.length > 0 && $scope.machineAPIKpiData[0].Value;
      if ($scope.machineAPIKpiData && $scope.machineAPIKpiData.length > 0 && $scope.machineAPIKpiData[0].Value) {
        withTotalColumn = false;
        tableToDisplay = withTotalColumn ? $scope.tableData : $scope.tableDataWithOutTotal;
        $scope.tableDataKPIS = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("KPIS"), $scope.KPIs, $scope.KPIData));
        if ($scope.KPIRefData) {
          $scope.tableRefDataKPIS = tableToDisplay.concat($scope.getDataFromAggregatedData($filter("translate")("KPIS"), $scope.KPIs, $scope.KPIRefData));
        }
        $scope.makeTableData("KPIS", $scope.tableDataKPIS, $scope.tableRefDataKPIS);
      }
      $scope.shiftTimeGraph.makeExportableTable();
    };

    let PORTRAIT_COLUMNS = 5;
    let LANDSCAPE_COLUMNS = 9;

    $scope.shiftTimeGraph = {};

    $scope.$on("makeExportableTable", function () {
      $scope.shiftTimeGraph.ExportableTablesShow = true;
      // let a = $scope.shiftTimeGraph.ExportableTables.landscape;
    });

    $scope.shiftTimeGraph.makeExportableTable = function () {
      if ($scope.tableData.length < 2) {
        return;
      }
      $scope.shiftTimeGraph.createTableCopies();
      $scope.shiftTimeGraph.formatTableCopies();
    };

    $scope.shiftTimeGraph.createTableCopies = function () {
      $scope.shiftTimeGraph.ExportableTables = { portrait: [], landscape: [] };
      $scope.shiftTimeGraph.createTablesCopy($scope.shiftTimeGraph.ExportableTables.portrait, PORTRAIT_COLUMNS);
      $scope.shiftTimeGraph.createTablesCopy($scope.shiftTimeGraph.ExportableTables.landscape, LANDSCAPE_COLUMNS);
    };

    $scope.shiftTimeGraph.createTablesCopy = function (tablesArray, columnsSpan) {
      if (!tablesArray) {
        return;
      }

      let totalColumns = $scope.tableData[0].length;
      for (let i = 0; i < Math.ceil(totalColumns / columnsSpan); i++) {
        tablesArray.push(angular.copy($scope.tableData));
      }
    };

    $scope.shiftTimeGraph.formatTableCopies = function () {
      $scope.shiftTimeGraph.formatCopies($scope.shiftTimeGraph.ExportableTables.portrait, PORTRAIT_COLUMNS);
      $scope.shiftTimeGraph.formatCopies($scope.shiftTimeGraph.ExportableTables.landscape, LANDSCAPE_COLUMNS);
    };

    $scope.shiftTimeGraph.formatCopies = function (tablesArray, columnsSpan) {
      for (let i = 0; i < tablesArray.length; i++) {
        let beginning = i * columnsSpan;
        let end = beginning + columnsSpan;

        //copy machineNames
        for (let j = 0; j < 1; j++) {
          tablesArray[i][j] = tablesArray[i][j].slice(beginning, end);
        }

        beginning = beginning + 2;
        end = beginning + columnsSpan;
        //copy tableData
        for (let j = 1; j < tablesArray[i].length; j++) {
          let firstCell = tablesArray[i][j][0];
          let secondCell = tablesArray[i][j][1];
          tablesArray[i][j] = tablesArray[i][j].slice(beginning, end);
          tablesArray[i][j].unshift(secondCell);
          tablesArray[i][j].unshift(firstCell);
        }
      }
    };
    $scope.shiftTimeGraph.showExportableTable = function () {
      return $scope.shiftTimeGraph.ExportableTablesShow == true;
    };

    $scope.$on("restoreTable", function () {
      $scope.shiftTimeGraph.ExportableTablesShow = false;
    });

    $scope.times = [
      {
        name: $filter("translate")("PRODUCTION_TIME"),
        id: "ProductionTimeMin",
        display: $scope.graph.filterData && $scope.graph.filterData[1] ? $scope.graph.filterData[1].data[0].display : true,
      },
      {
        name: $filter("translate")("DOWN_TIME"),
        id: "DownTimeMin",
        display: $scope.graph.filterData && $scope.graph.filterData[1] ? $scope.graph.filterData[1].data[1].display : true,
      },
      {
        name: $filter("translate")("INACTIVE_TIME"),
        id: "InActiveTimeMin",
        display: $scope.graph.filterData && $scope.graph.filterData[1] ? $scope.graph.filterData[1].data[2].display : true,
      },
    ];

    $scope.units = [
      {
        name: $filter("translate")("UnitsProducedOK"),
        id: "UnitsProducedOK",
        display: $scope.graph.filterData && $scope.graph.filterData[3] ? $scope.graph.filterData[3].data[0].display : true,
      },
      {
        name: $filter("translate")("REJECTED_UNITS"),
        id: "RejectsTotal",
        display: $scope.graph.filterData && $scope.graph.filterData[3] ? $scope.graph.filterData[3].data[1].display : true,
      },
      {
        name: $filter("translate")("TOTAL_UNITS"),
        id: "TotalUnitsJosh",
        display: $scope.graph.filterData && $scope.graph.filterData[3] ? $scope.graph.filterData[3].data[2].display : true,
      },
    ];

    $scope.buildKPIData = function () {
      if (!$scope.machineAPIKpiData || $scope.machineAPIKpiData.length == 0) {
        $scope.KPIData = [];
        $scope.KPIs = [];
        return;
      }
      var tempKPIs = _.map($scope.machineAPIKpiData[0].Value, function (kpiParams) {
        let avalSessionKPI;
        if ($scope.graph.filterData && $scope.graph.filterData[2] && $scope.graph.filterData[2].data) {
          avalSessionKPI = _.find($scope.graph.filterData[2].data, { id: kpiParams.Name });
        }
        return {
          name: $scope.localLanguage ? kpiParams.LName : kpiParams.EName,
          id: kpiParams.Name,
          display: avalSessionKPI ? avalSessionKPI.display : true,
        };
      });
      $scope.KPIs = tempKPIs;
      $scope.KPIData = _.map($scope.machineAPIKpiData, function (machine) {
        var machineKpiData = {
          Id: machine.Key,
        };
        for (var i = 0; i < machine.Value.length; i++) {
          machineKpiData[machine.Value[i].Name] = machine.Value[i].ActualTargetValue;
        }
        return machineKpiData;
      });
    };

    $scope.buildKPIRefData = function () {
      if (!$scope.machineAPIKpiRefData || $scope.machineAPIKpiRefData.length === 0) {
        $scope.KPIRefData = [];
        return;
      }
      $scope.KPIRefData = _.map($scope.machineAPIKpiRefData, function (machine) {
        var machineKpiRefData = {
          Id: machine.Key,
        };
        for (var i = 0; i < machine.Value.length; i++) {
          machineKpiRefData[machine.Value[i].Name] = machine.Value[i].ActualTargetValue;
        }
        return machineKpiRefData;
      });
    };

    $scope.getAggregateData = function () {
      if ($scope.refreshAggregateData) {
        $timeout.cancel($scope.refreshAggregateData);
      }
      $scope.refreshAggregateData = $timeout(function () {
        let requestObj = { DepartmentID: $scope.shiftData.data.ID };
        let requestObjRef = { DepartmentID: $scope.shiftData.data.ID };
        let allPromisesAggregateData = [];
        //curr
        if ($scope.shiftData.customRangeEnabled) {
          requestObj.ShiftID = $scope.shiftData.aggregareDataShifts || [];
        } else {
          requestObj.ShiftID = _.map($scope.shiftData.data.CurrentShift || [], "ID");
        }
        const promiseKPIData = LeaderMESservice.customAPI("GetDepartmentMachineAggregateData", requestObj);
        if (requestObj.ShiftID.length > 0) {
          allPromisesAggregateData.push(promiseKPIData);
        }

        //ref
        if ($scope.shiftData.customRangeEnabled) {
          requestObjRef.ShiftID = [];
        } else {
          requestObjRef.ShiftID = _.map($scope.shiftData.data.ReferanceShift, "ID");
        }
        const promiseRefAggregateData = LeaderMESservice.customAPI("GetDepartmentMachineAggregateData", requestObjRef);
        if (requestObjRef.ShiftID.length > 0) {
          allPromisesAggregateData.push(promiseRefAggregateData);
        }
        if (allPromisesAggregateData.length > 0) {
          Promise.all(allPromisesAggregateData).then((responses) => {
            $scope.machineAPIData = responses[0].MachineData;
            $scope.machineAPIKpiData = responses[0].MachineDepartmentActualAndTargetData;
            $scope.buildKPIData();
            if (responses[1]) {
              $scope.machineAPIRefData = responses[1].MachineData;
              $scope.machineAPIKpiRefData = responses[1].MachineDepartmentActualAndTargetData;
              $scope.buildKPIRefData();
            } else {
              $scope.machineAPIRefData = undefined;
              $scope.machineAPIKpiRefData = undefined;
              $scope.KPIRefData = undefined;
              $scope.buildKPIRefData();
            }
            //
            $scope.buildFilterData();
            $scope.buildTableData();
          });
        }
      }, 500);
    };

    $scope.getAggregateData();

    shiftService.sliderUpdateDefferd.promise.then(null, null, function () {
      $scope.buildOrigStatuses(true);
      $scope.buildOrigStatuses(false);
      $scope.getAggregateData();
    });

    $scope.updateFilterData = function () {
      if ($scope.refreshDataTimeout) {
        $timeout.cancel($scope.refreshDataTimeout);
      }
      $scope.refreshDataTimeout = $timeout(function () {
        $scope.updateEmptyFilterData();
        $scope.buildTableData();
        $scope.filterData = $scope.graph.filterData;
      }, 500);
    };

    var groupByMachine = function (shifts) {
      var Shifts = angular.copy(shifts);
      var Machines = [];
      var eventStructure = shiftService.shiftData.data.EventDistributionStructure;
      _.forIn(Shifts, function (shift) {
        Machines = Machines.concat(shift.Machines);
      });
      Machines = _.groupBy(_.compact(Machines), "Id");
      _.forIn(Machines, function (value, key) {
        //to save all the cyclictime
        value[0].FirstCycleDateTime = [value[0].FirstCycleDateTime];
        value[0].LastCycleDateTime = [value[0].LastCycleDateTime];
        Machines[key] = _(value).reduce(function (totalM, obj) {
          if (!totalM) {
            obj.FirstCycleDateTime = [FirstCycleDateTime];
            obj.LastCycleDateTime = [LastCycleDateTime];
            return obj;
          } else {
            return _.merge(totalM, obj, function (a, b) {
              if (_.isArray(a)) {
                return a.concat(b);
              }
            });
          }
        });
      });
      _.forIn(Machines, function (value, key) {
        var tempArr = [];

        // Machines[key].MachineStatus.icon = getMachineStatusIcon(Machines[key].MachineStatus.ID);
        Machines[key].selectedEvents = _.groupBy(Machines[key].selectedEvents, "EventDistributionID");

        tempArr = [];
        _.forIn(Machines[key].selectedEvents, function (eventsA, eventN) {
          Machines[key].selectedEvents[eventN] = _(eventsA).reduce(function (total, o) {
            if (!total) {
              var structureTemp = _.find(eventStructure, {
                ID: o.EventDistributionID,
              });
              total = angular.copy(Object.assign(o, {}));
              total.Order = structureTemp ? parseFloat(structureTemp.GroupOverlap + "." + structureTemp.DisplayOrder) : 0;
              return total;
            } else {
              total.Duration += parseFloat(o.Duration);
              return total;
            }
          }, null);

          if (Machines[key].selectedEvents[eventN]) {
            tempArr.push(Machines[key].selectedEvents[eventN]);
          }
        });
        Machines[key].selectedEvents = tempArr;
      });

      return Machines;
    };

    $scope.updateEmptyFilterData = function () {
      if (!$scope.graph.filterData) {
        return;
      }
      $scope.emptyFilter = true;
      for (var i = 0; i < $scope.graph.filterData.length; i++) {
        for (var j = 0; j < $scope.graph.filterData[i].data.length; j++) {
          if ($scope.graph.filterData[i].data[j].display) {
            $scope.emptyFilter = false;
            $scope.graph.filterData[i].display = true;
            break;
          } else if (j == $scope.graph.filterData[i].data.length - 1) {
            $scope.graph.filterData[i].display = false;
          }
        }
      }
      $scope.filterData = $scope.graph.filterData;
    };

    $scope.emptyFilter = true;
    shiftTimeGraphCtrl.clearFilter = function () {
      for (var i = 0; i < $scope.graph.filterData.length; i++) {
        $scope.graph.filterData[i].display = true;
        for (var j = 0; j < $scope.graph.filterData[i].data.length; j++) {
          $scope.graph.filterData[i].data[j].display = true;
        }
      }
      $scope.filterData = $scope.graph.filterData;
      $scope.emptyFilter = true;
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);

      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }

      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    $scope.$watch("shiftData.machinesDisplay", function () {
      $scope.updateFilterData();
      $scope.filterMachinesToDisplay(true);
    });

    $scope.$watch("graph.localMachines", function () {
      $scope.filterMachinesToDisplay(true);

      var currMachines = groupByMachine(shiftService.shiftData.data.CurrentShift);
      var filteredMachines = [];
      _.forIn(currMachines, function (value, key) {
        let subMachine = _.find($scope.graph.localMachines, (machine) => machine.ID == key);
        if (subMachine && subMachine.value) {
          filteredMachines.push(value);
        }
      });
      shiftService.updateSumBar(filteredMachines);
    });

    $scope.$watch("shiftData.data", function () {
      //status
      $scope.buildOrigStatuses(true);
      $scope.buildOrigStatuses(false);
      $scope.getAggregateData();
    });

    $scope.$watch(
      "filterData",
      function (newValue, oldValue) {
        if (!oldValue) {
          return;
        }
        $scope.updateFilterData();
        $scope.graph.filterData = $scope.filterData;
      },
      true
    );

    shiftTimeGraphCtrl.toggleFilterGroup = function (group) {
      if (!group) {
        return;
      }
      for (let i = 0; i < group.data.length; i++) {
        group.data[i].display = group.display;
      }
      $scope.updateFilterData();
    };
  }

  return {
    restrict: "E",
    templateUrl: Template,
    controller: controller,
    controllerAs: "shiftTimeGraphCtrl",
    link: function (scope, element) {
      scope.scrollCallback = function (scrollTop) {
        $(element).find(".left-container").scrollTop(scrollTop);
      };
    },
    scope: {
      options: "=",
      graph: "=",
    },
  };
};

angular.module("LeaderMESfe").directive("shiftTimeGraphDirective", shiftTimeGraphDirective);
