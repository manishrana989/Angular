
angular.module("LeaderMESfe").factory("shiftService", function ($timeout, $q, LeaderMESservice, shiftServiceDefaultData, notify, $filter, $sessionStorage, ExpandedMachinesService, toastr, $localStorage, $rootScope, AuthService) {
  var VERSION = 9;

  var versionChange = false;
  if (!$sessionStorage.containers || $sessionStorage.containers.version !== VERSION) {
    versionChange = true;
  }

  let requestedDuration = null;
  let loadingMachinesPerformanceApi = false;
  let loadingGraphDataApi = false;

  var sliderUpdateDefferd = $q.defer();
  var markerUpdateDefferd = $q.defer();
  var displayUpdateDefferd = $q.defer();
  var localLanguage = LeaderMESservice.showLocalLanguage();
  var stopEventsIds = [2, 4, 5, 6];
  var criticalEventsIds = [0, 18];
  var allowedGraphsForCustomRange = ["machinesPerformance","machinesPerformanceTable", "timeGraph", "PEGraph", "topRejectsGraph", "insightGraph", "topStopEventsGraph", "unitsProducedGraph", "shiftInsightGraph"];
  var initTimeout;
  var initGraphDataTimeout;
  var period = {
    value: 0,
    diff: 0,
  };

  if (!$localStorage.shiftStates) {
    // save insights state
    $localStorage.shiftStates = {};
  }

  var shiftStates = localStorage.shiftStates;
  var shiftData = shiftServiceDefaultData.shiftData;
  var gridDefault = shiftServiceDefaultData.gridDefault;
  var machineContainersDefault = shiftServiceDefaultData.machineContainersDefault;
  var containersDefault = shiftServiceDefaultData.containersDefault;

  var sliderData = {
    minValue: null,
    maxValue: null,
    options: {
      floor: null,
      ceil: null,
      step: 1,
      id: "slider",
      hideLimitLabels: true,
      hidePointerLabels: true,
      pushRange: false,
      minRange: 1,
      noSwitching: true,
      ticks: null,
      onEnd: function (sliderId, modelValue, highValue, pointerType) {
        sliderUpdateDefferd.notify();
      },
    },
  };

  //data labels only for the shift insights
  if (!$sessionStorage.insightsPageData) {
    var insightsPageData = {
      online: {
        dataLabelEnable: true,
      },
      shift: {
        dataLabelEnable: true,
      },
      newOnline: {
        dataLabelEnable: true,
      },
    };
  } else {
    insightsPageData = angular.copy($sessionStorage.insightsPageData);
  }

  var getShiftInsightTitles = function (container, page) {
    LeaderMESservice.customAPI("GetDashboardInsights", {}).then(function (response) {
      _.forEach(container, function (temp, objIndex) {
        if (temp.template == "shiftInsightGraph" || temp.template == "insightMachineDashboardGraph") {
          if (page == "shiftInsightGraph") {
            $sessionStorage.containers["data"][objIndex].options.settings.parameters = [];
          } else {
            $localStorage.machineContainers[objIndex].options.settings.parameters = [];
          }
          response.ResponseList = _.filter(response.ResponseList, function (temp) {
            if (temp.IsActive) {
              return temp;
            }
          });

          response.ResponseList.forEach(function (temp, index) {
            try {
              if (temp.Title.indexOf("{") !== -1 && temp.Title.indexOf("}") !== -1) {
                varsearchKpi = temp.Title.substring(temp.Title.indexOf("{") + 1, temp.Title.indexOf("}"));
                $sessionStorage.kpiTranslations.forEach(function (kpi) {
                  if (kpi.name == varsearchKpi) {
                    temp.Title = temp.Title.replace(temp.Title.substring(temp.Title.indexOf("{"), temp.Title.indexOf("}") + 1), kpi[$sessionStorage.language]);
                  }
                });
              }
            } catch (err) {
            } finally {
              if (page == "shiftInsightGraph") {
                $sessionStorage.containers["data"][objIndex].options.settings.parameters.push({
                  index: index,
                  value: temp.Title,
                  api: temp.Name,
                });
              } else {
                $localStorage.machineContainers[objIndex].options.settings.parameters.push({
                  index: index,
                  value: temp.Title,
                  api: temp.Name,
                });
              }
            }
          });
        }
      });
    });
  };

  var showFilterShiftVar = {
    value: "",
  };

  var updateShowFilterShift = function (temp) {
    showFilterShiftVar.value = temp;
  };

  var updateContainers = function () {
    if (!$localStorage.machineContainers || ($sessionStorage.containers && $sessionStorage.containers.version !== VERSION)) {
      $localStorage.machineContainers = angular.copy(machineContainersDefault);
    }
    if (!$sessionStorage.containers || ($sessionStorage.containers && $sessionStorage.containers.version !== VERSION)) {
      $sessionStorage.containers = {
        data: angular.copy(containersDefault),
        version: VERSION,
      };
    }
  };

  updateContainers();
  
  var containers = $sessionStorage.containers;
  if (containers && !containers.headerPinned) {
    containers.headerPinned = {
      enabled: true,
    };
  }

  var mainContainer = _.find(containers.data, { template: "timeGraph" });
  if (mainContainer) {
    shiftData.compareWith = mainContainer.options.settings.compareWith;
  }

  var machineContainers = {
    data: $localStorage.machineContainers,
  };

  if (!$sessionStorage.machinesDisplay) {
    $sessionStorage.machinesDisplay = angular.copy(shiftData.machinesDisplay);
  }
  shiftData.machinesDisplay = $sessionStorage.machinesDisplay;

  // get status icon form status id
  var getMachineStatusIcon = function (id) {
    var icon = "";
    switch (id) {
      case 0:
        icon = "no_job.svg";
        break;
      case 1:
        icon = "working.svg";
        break;
      case 2:
        icon = "param_deviation.svg";
        break;
      case 3:
        icon = "stopped.svg";
        break;
      case 4:
        icon = "comm_faillure.svg";
        break;
      case 5:
        icon = "setup_working.svg";
        break;
      case 6:
        icon = "setup_stopped.svg";
        break;
      case 7:
        icon = "comm_faillure.svg";
        break;
      case 8:
        icon = "stop_idle.svg";
        break;
      case 9:
        icon = "no-job-copy.svg";
        break;
    }
    return icon;
  };

  var getMachineStatusColor = function (id) {
    var color = "";
    switch (id) {
      case 0:
        color = "#959595";
        break;
      case 1:
        color = "#1aa917";
        break;
      case 2:
        color = "#fba30c";
        break;
      case 3:
        color = "#bf1620";
        break;
      case 4:
        color = "#959595";
        break;
      case 5:
        color = "#166715";
        break;
      case 6:
        color = "#166715";
        break;
      case 7:
        color = "#959595";
        break;
      case 8:
        color = "#959595";
        break;
    }
    return color;
  };

  var getStatusIcon = function (machineStatus) {
    switch (machineStatus) {
      case 1:
        return "working.svg";
      case 2:
        return "param_deviation.svg";
      case 3:
        return "stopped.svg";
      case 4:
        return "comm_faillure.svg";
      case 5:
        return "setup_working.svg";
      case 6:
        return "setup_stopped.svg";
      case 7:
        return "comm_faillure.svg";
      case 8:
        return "stop_idle.svg";
      case 9:
        return "no-job-copy.svg";
      case 0:
        return "no_job.svg";
    }
  };

  // from date object to TS without seconds
  var getTime = function (date) {
    return Math.floor(date.getTime() / (60 * 1000));
  };

  //from TS without seconds to date object
  var getDate = function (timeStamp) {
    return new Date(timeStamp * 60 * 1000);
  };

  //calc summary bar
  var updateSumBar = function (curMachine, customRange) {
    var eventStructure = shiftData.data.EventDistributionStructure;

    var allShiftEvents = [];
    var tempAllEvenets = [];

    _.forIn(curMachine, function (machine, machineId) {
      if (machine.selectedEvents) {
        tempAllEvenets = _(tempAllEvenets).concat(machine.selectedEvents).value();
      } else {
        if (customRange) {
          tempAllEvenets = _(tempAllEvenets).concat(machine.Events).value();
        }
      }
    });

    tempAllEvenets = _.groupBy(tempAllEvenets, "Name");
    _.forIn(tempAllEvenets, function (value, key) {
      var eventSTemp = _(value).reduce(
        function (total, o) {
          var structureTemp = _.find(eventStructure, {
            ID: o.EventDistributionID,
          });
          total.Duration += o.Duration;
          total.Color = o.Color;
          total.Name = o.Name;
          total.Order = structureTemp ? structureTemp.DisplayOrder : "";
          return total;
        },
        {
          Duration: 0,
        }
      );
      if (eventSTemp) {
        allShiftEvents.push(eventSTemp);
      }
    });
    var totalDuration = _.reduce(
      allShiftEvents,
      function (total, n) {
        return total + n.Duration;
      },
      0
    );

    allShiftEvents = _.sortBy(allShiftEvents, function (o) {
      return o.Order;
    });

    shiftData.summaryBar = {
      total: totalDuration,
      events: allShiftEvents,
    };
  };

  //change dataLabels inside shift
  var changeDataLabels = function (temp) {
    insightsPageData[$sessionStorage.produtionFloorTab.selectedTab].dataLabelEnable = temp;
    $sessionStorage.insightsPageData = angular.copy(insightsPageData);
  };

  //calc event selected by slider
  var updateEvents = function (curShifts, refShifts) {
    _.forIn(curShifts, function (shift) {
      _.forIn(shift.Machines, function (machine) {
        machine.selectedEvents = [];
        machine.selectedStopEvents = [];
        _.forIn(machine.Events, function (event) {
          var eventS = getTime(new Date(event.StartTime));
          var eventE = getTime(new Date(event.EndTime));
          var eventInRange = false;
          var eventDuration = 0;
          var tempE = Object.assign({}, event);
          if (eventS < sliderData.minValue) {
            if (eventE > sliderData.minValue) {
              eventInRange = true;
              if (eventE > sliderData.maxValue) {
                // |--[--]--|
                eventDuration = event.Duration * ((sliderData.maxValue - sliderData.minValue) / (eventE - eventS));
              } else {
                // |--[--|--]--
                eventDuration = event.Duration * ((eventE - sliderData.minValue) / (eventE - eventS));
              }
            }
          } else {
            if (eventS < sliderData.maxValue) {
              eventInRange = true;
              if (eventE > sliderData.maxValue) {
                // --[-|-]--|
                eventDuration = event.Duration * ((sliderData.maxValue - eventS) / (eventE - eventS));
              } else {
                // -[--|--|-]-
                eventDuration = event.Duration;
              }
            }
          }
          if (eventInRange) {
            if (event.EventReason == "Lack of Order") {
            }
            tempE.Duration = Math.ceil(eventDuration);
            machine.selectedEvents.push(tempE);
            machine.selectedStopEvents.push(tempE);
          }
        });
      });
    });

    var refFloor = null;
    var refCeil = null;
    _.forIn(refShifts, function (shift) {
      if (new Date(shift.StartTime) < refFloor || !refFloor) {
        refFloor = new Date(shift.StartTime);
      }
      if (new Date(shift.EndTime) > refCeil || !refCeil) {
        refCeil = new Date(shift.EndTime);
      }
    });
    refFloor = refFloor ? getTime(refFloor) : 0;
    refCeil = refCeil ? getTime(refCeil) : 0;
    var refSliderMin = sliderData.minValue - sliderData.options.floor + refFloor;
    var refSliderMax = sliderData.maxValue - sliderData.options.floor + refFloor;

    _.forIn(refShifts, function (shift) {
      _.forIn(shift.Machines, function (machine) {
        machine.selectedEvents = [];
        machine.selectedStopEvents = [];
        _.forIn(machine.Events, function (event) {
          var eventS = getTime(new Date(event.StartTime));
          var eventE = getTime(new Date(event.EndTime));
          var eventInRange = false;
          var eventDuration = 0;
          var tempE = Object.assign({}, event);
          if (eventS < refSliderMin) {
            if (eventE > refSliderMin) {
              eventInRange = true;
              if (eventE > refSliderMax) {
                // |--[--]--|
                eventDuration = event.Duration * ((refSliderMax - refSliderMin) / (eventE - eventS));
              } else {
                // |--[--|--]--
                eventDuration = event.Duration * ((eventE - refSliderMin) / (eventE - eventS));
              }
            }
          } else {
            if (eventS < refSliderMax) {
              eventInRange = true;
              if (eventE > refSliderMax) {
                // --[-|-]--|
                eventDuration = event.Duration * ((refSliderMax - eventS) / (eventE - eventS));
              } else {
                // -[--|--|-]-
                eventDuration = event.Duration;
              }
            }
          }
          if (eventInRange) {
            tempE.Duration = Math.ceil(eventDuration);
            machine.selectedEvents.push(tempE);
            machine.selectedStopEvents.push(tempE);
          }
        });
      });
    });
  };

  //when slider change
  var calcEvents = function () {
    var Machines = [];
    if (!shiftData.data) {
      return;
    }
    updateEvents(shiftData.data.CurrentShift, shiftData.data.ReferanceShift);

    var machineTopStopEvents = {};

    shiftData.data.CurrentShift.forEach(function (shift) {
      shift.Machines.forEach(function (machine) {
        if (!machineTopStopEvents[machine.Id]) {
          machineTopStopEvents[machine.Id] = {
            eventsTotalDuration: 0,
            totalDurationWithoutSetupAndNoComm: 0,
            machineDownDuration: 0,
            uncategorizedDuration: 0,
          };
        }
        _.forEach(machine.selectedEvents, function (event) {
          machineTopStopEvents[machine.Id].eventsTotalDuration += event.Duration;
          if (event.EventDistributionID == 2 || event.EventDistributionID == 5 || event.EventDistributionID == 4) {
            machineTopStopEvents[machine.Id].totalDurationWithoutSetupAndNoComm += event.Duration;
          }
          if (event.EventReasonID !== 0 && (event.EventDistributionID === 2 || event.EventDistributionID == 5 || event.EventDistributionID == 4)) {
            machineTopStopEvents[machine.Id].uncategorizedDuration += event.Duration;
          }
          if (event.EventDistributionID === 2 || event.EventDistributionID == 4) {
            machineTopStopEvents[machine.Id].machineDownDuration += event.Duration;
          }
        });
      });
    });

    //group data for every machine
    var currMachines = groupByMachine(shiftData.data.CurrentShift);
    var refMachines = groupByMachine(shiftData.data.ReferanceShift);
    var machinesIds = [];
    _.forIn(currMachines, function (value, key) {
      machinesIds.push(value.Id);
      if (shiftData.machinesDisplay[value.Id] == undefined) {
        shiftData.machinesDisplay[value.Id] = true;
      }

      Machines.push({
        CurrShift: currMachines[key],
        RefShift: refMachines && refMachines[key] ? refMachines[key] : null,
        machineName: value.MachineName,
        machineID: value.Id,
        eventsTotalDuration: machineTopStopEvents[value.Id].eventsTotalDuration || 1,
        totalDurationWithoutSetupAndNoComm: machineTopStopEvents[value.Id].totalDurationWithoutSetupAndNoComm || 1,
        machineDownDuration: machineTopStopEvents[value.Id].machineDownDuration,
        DisplayOrder: value.DisplayOrder,
        uncategorizedDuration: machineTopStopEvents[value.Id].uncategorizedDuration,
      });
    });
    $sessionStorage.machinesDisplay = _.pick(shiftData.machinesDisplay, machinesIds);
    shiftData.machinesDisplay = $sessionStorage.machinesDisplay;
    // MachinesDisplay(Machines);
    Machines = _.sortBy(Machines, "DisplayOrder");

    var filteredMachines = [];
    _.forIn(currMachines, function (value, key) {
      if (shiftData.machinesDisplay[key] || shiftData.machinesDisplay[key] == undefined) {
        filteredMachines.push(value);
      }
    });
    updateSumBar(filteredMachines);
    return Machines;
  };
  var MachinesDisplay = function (machines) {
    _.forEach(machines, function (machine) {
      if (shiftData.Machines && shiftData.Machines.length > 0) {
        var machine = _.find(shiftData.Machines, {
          machineName: machine.machineName,
        });
        if (machine) {
          if (!shiftData.machinesDisplay[key]) {
            machine.display = shiftData.Machines[idx].display;
          }
        }
      }
    });
  };

  //group data by machine
  var groupByMachine = function (shifts) {
    var Shifts = angular.copy(shifts);
    var Machines = [];
    var eventStructure = shiftData.data.EventDistributionStructure;
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

      Machines[key].MachineStatus.icon = getMachineStatusIcon(Machines[key].MachineStatus.ID);
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

  var resetShiftData = function () {
    var lastHour = shiftData.lastHour;
    _.merge(shiftData, {
      data: null,
      graphData: null,
      stopEvents: [],
      topStopEventsCustomRange: [],
      stopEventsRef: {},
      stopEventsTotal: 0,
      stopEventsTotalRef: 0,
      marker: {},
      criticalEvents: [],
      topStopEvents: [],
      topRejects: [],
      error: "",
    });
    shiftData.lastHour = lastHour;
  };

  // make a request and update data
  var updateData = function (DepartmentID, durationParams, withoutLoading, inValidateCache) {
    error = "";
    if (shiftData.loadingAPI) {
      return;
    }
    shiftData.loadingAPI = true;
    var customRange = false;
    if (!withoutLoading) {
      shiftData.dataLoading = true;
      updateSliderData(null, null);
    }
    var currentShift = false;
    if (!durationParams) {
      currentShift = true;
    }
    var objParams = {};
    shiftData.DepartmentID = DepartmentID;

    if (shiftData.machineID) {
      objParams["MachineIDs"] = [shiftData.machineID];
    } else {
      objParams["DepartmentID"] = DepartmentID;
    }
    
    if (durationParams && !durationParams.ID) {
      objParams["ShiftByTime"] = durationParams;
      // yyyy-MM-dd HH:mm:ss
      var startDate = moment(durationParams.StartTime, "YYYY-MM-DD HH:mm:ss");
      var endDate = moment(durationParams.EndTime, "YYYY-MM-DD HH:mm:ss");

      if (endDate - startDate > 1 * 32 * 60 * 60 * 1000 && shiftData.selectedTab != 3) {
        customRange = true;
      }
    }
    if (durationParams && durationParams.ID) {
      objParams["ShiftByID"] = durationParams;
    }
    if(shiftData.machineID)
    {
      shiftData.customRangeEnabled = customRange;
    }
    if ($sessionStorage.produtionFloorTab.selectedTab !== "shift" && !shiftData.machineID) {
      if (DepartmentID == 0) {
        shiftData.dataLoading = false;
        shiftData.loadingAPI = false;
        return;
      }

      LeaderMESservice.customAPI("GetDepartmentMachine", {
        DepartmentID: DepartmentID,
      }).then(function (response) {
        var dep = _.find(response.DepartmentMachine, {
          Key: { Id: DepartmentID },
        });
        var tempMachines = {};
        shiftData.Machines = _.map(dep.Value, function (machine) {
          shiftData.machinesDisplay[machine.Id] = true;
          tempMachines[machine.Id] = true;
          return {
            machineID: machine.Id,
            machineName: machine.MachineName,
          };
        });
        Object.keys(shiftData.machinesDisplay || {}).forEach(function (key) {
          if (!tempMachines[key]) {
            delete shiftData.machinesDisplay[key];
          }
        });
        Object.keys(tempMachines).forEach(function (key) {
          if (shiftData.machinesDisplay[key] === undefined) {
            shiftData.machinesDisplay[key] = true;
          }
        });
        shiftData.dataLoading = false;
        shiftData.loadingAPI = false;
      });
      return;
    }
    if (shiftData.machineID) {
      LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
        shiftData.machineDashboardUserData = response.Users;
        shiftData.machineDashboardGroupsData = response.Groups;
        });
        const promises  = [];
      promises.push(LeaderMESservice.customAPI("GetMachineMainData", {
        MachineID: shiftData.machineID,
      }));
      promises.push(LeaderMESservice.customAPI("GetJobCustomParameters", {}));
      Promise.all(promises).then(function (res) {
        const response = res[0];
        const customParams = res[1] && res[1].JobParams || [];
        const jobCustomParams = response.JobCustomParameters || [];
        const machineCustomParams = [];
        customParams.forEach(customParam => {
          machineCustomParams.push({
            CollapseMachineParamsDisplayOrder: null,
            CurrentValue: null,
            custom: true,
            DisplayType: "text",
            FieldEName: customParam.DisplayName,
            FieldLName: customParam.DisplayName,
            FieldName: customParam.Name,
            HasGraph: false,
            HighLimit: 0,
            LowLimit: 0,
            StandardValue: null,
            isDefaultMobile: false,
            isOutOfRange: false,
          })
        });
        if (response.AllDepartments) {
          shiftData.machineData = response.AllDepartments[0].DepartmentsMachine[0];
          shiftData.machineData.MachineParams = shiftData.machineData.MachineParams.concat(angular.copy(machineCustomParams));
          const jobCustomParam = _.find(jobCustomParams,{JobID: shiftData.machineData.JobID});
          if (jobCustomParam){
            for(let key in jobCustomParam) {
              if (key === 'JobID'){
                continue;
              }
              const customParam = _.find(shiftData.machineData.MachineParams, {FieldName : key});
              if (customParam){
                customParam.CurrentValue = jobCustomParam[key];
              }
            }
          }
          if (LeaderMESservice.showLocalLanguage()) {
            shiftData.machineData.MachineParams = _.sortByOrder(shiftData.machineData.MachineParams, ["FieldLName"]);
          } else {
            shiftData.machineData.MachineParams = _.sortByOrder(shiftData.machineData.MachineParams, ["FieldEName"]);
          }
          if (
            _.findIndex(shiftData.machineData.MachineParams, {
              FieldName: "removeParam",
            }) < 0
          ) {
            shiftData.machineData.MachineParams.unshift({
              FieldName: "removeParam",
              FieldEName: $filter("translate")("REMOVE_PARAM"),
              FieldLName: $filter("translate")("REMOVE_PARAM"),
              CurrentValue: "",
            });
          }
        }
      });
    }

    objParams.RefShiftDays = shiftData.refShiftData;
    updateGraphLines();
    if (!shiftData.customRangeEnabled && objParams.ShiftByTime) {
      var dateBefore7Days = new Date();
      dateBefore7Days.setDate(dateBefore7Days.getDate() - 7);
      dateBefore7Days.setHours(0);
      dateBefore7Days.setMinutes(0);
      dateBefore7Days.setSeconds(0);
      dateBefore7Days.setMilliseconds(0);
      if (dateBefore7Days > new Date(objParams.ShiftByTime.StartTime)) {
        if(shiftData.machineID)
        {
          shiftData.customRangeEnabled = true;
        }
      }
    }
    // if (shiftData.customRangeEnabled) {
    //   if (!withoutLoading) {
    //     var defaultDatePart = getDatePartByRange(durationParams.StartTime, durationParams.EndTime);
    //     var peGraph = [];
    //     if (shiftData.machineID && machineContainers && machineContainers.data) {
    //       peGraph = _.filter(machineContainers.data, { template: "PEGraph" });
    //     } else if (containers && containers.data) {
    //       peGraph = _.filter(containers.data, { template: "PEGraph" });
    //     }
    //     peGraph.forEach(function (graph) {
    //       graph.options.DatePart = defaultDatePart;
    //     });
    //   }
    //   var customBody = {
    //     ReqDepartment: {
    //       StartTime: durationParams.StartTime,
    //       EndTime: durationParams.EndTime,
    //       Departments: [
    //         {
    //           DepartmentID: DepartmentID,
    //           Machines: _.map(shiftData.Machines, function (mach) {
    //             return mach.machineID;
    //           }),
    //         },
    //       ],
    //     },
    //   };
    //   LeaderMESservice.customAPI("GetDepartmentShiftDataAggregate", customBody).then(function (response) {
    //     shiftData.aggregateData = response.AggregateData;
    //     shiftData.aggregareDataShifts = response.Shifts;
    //     shiftData.dataLoading = false;
    //     shiftData.loadingAPI = false;
    //     for (var i = 0; i < shiftData.aggregateData.length; i++) {
    //       for (var k = 0; k < shiftData.aggregateData[i].Events.length; k++) {
    //         var structureTemp = _.find(response.EventDistributionStructure, {
    //           ID: shiftData.aggregateData[i].Events[k].EventDistributionID,
    //         });
    //         shiftData.aggregateData[i].Events[k].Order = structureTemp ? parseFloat(structureTemp.GroupOverlap + "." + structureTemp.DisplayOrder) : 0;
    //       }
    //     }
    //     var min = _.reduce(shiftData.aggregareDataShifts, function (min, item) {
    //       return min.ShiftID < item.ShiftID ? min : item;
    //     });
    //     var max = _.reduce(shiftData.aggregareDataShifts, function (max, item) {
    //       return max.ShiftID > item.ShiftID ? max : item;
    //     });

    //     shiftData.CustomShiftName = min.StartTime?.split("T")[0].split("-")[2] + "/" + min.StartTime?.split("T")[0].split("-")[1] + " " + min.ShiftName + " - " + max.EndTime?.split("T")[0].split("-")[2] + "/" + max.EndTime?.split("T")[0].split("-")[1] + " " + max.ShiftName;

    //     updateSumBar(shiftData.aggregateData, true);

    //     updateGraphData(durationParams.StartTime, durationParams.EndTime);

    //     getTopRejects();
    //     getStopEventsAggregate(durationParams.StartTime, durationParams.EndTime);
    //     var userDateFormat = AuthService.getUserDateFormat();

    //     shiftData.lastRefresh = moment(new Date()).format(userDateFormat);
    //     getDepartmentMachineAggregateData();
    //     getShiftInsightTitles($sessionStorage.containers["data"], "shiftInsightGraph");
    //     updateMachineGoals();
    //   });
    // } else {
      if (objParams.ShiftByTime && objParams.ShiftByTime.StartTime && shiftData.selectedTab != 3 && shiftData.selectedTab != 2 && shiftData.selectedTab != 9 && shiftData.selectedTab != 10) {
        var startDateTemp = new Date(objParams.ShiftByTime.StartTime).getTime() - 28800000;
        objParams.ShiftByTime.StartTime = moment(new Date(startDateTemp)).format("YYYY-MM-DD HH:mm:ss");
      }
      LeaderMESservice.customAPI("GetDepartmentShiftData", {
        ReqDepartment: [objParams],
        useCache: inValidateCache ? false : undefined,
      }).then(function (response) {
        resetShiftData();
        handleResponse(response, currentShift,objParams?.ShiftByTime);
      });
    // }
  };

  var updateMarker = function (value) {
    if (value == shiftData.marker.value) {
      return;
    }
    shiftData.marker.value = value;
    markerUpdateDefferd.notify();
  };

  var handleResponse = function (response, currentShift,date) {
    if (response.error) {
      notify({
        message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
        classes: "alert-danger",
        templateUrl: "views/common/notify.html",
      });
      shiftData.dataLoading = false;
      shiftData.loadingAPI = false;
      shiftData.error = response.error;
      return;
    }
    if (!response.Departments || response.Departments.length < 1) {
      notify({
        message: $filter("translate")("THERE_ARE_NO_DATA_TO_DISPLAY"),
        classes: "alert-danger",
        templateUrl: "views/common/notify.html",
      });
      shiftData.dataLoading = false;
      shiftData.loadingAPI = false;
      shiftData.error = $filter("translate")("THERE_ARE_NO_DATA_TO_DISPLAY");
      return;
    }
    shiftData.data = response.Departments[0];
    shiftData.DepartmentID = shiftData.data ? shiftData.data.ID : 0;
    shiftData.data.CurrentShift = _.sortBy(shiftData.data.CurrentShift, function (o) {
      return -getTime(new Date(o.StartTime));
    });
    shiftData.data.ReferanceShift = _.sortBy(shiftData.data.ReferanceShift, function (o) {
      return -getTime(new Date(o.StartTime));
    });

    // extracting last shift Id
    if (currentShift) {
      shiftData.lastShiftID = shiftData.data.CurrentShift ? shiftData.data.CurrentShift[0].PreviousShiftID : null;
    }
    sliderUpdate();
    var minValueDate = null;
    var maxValueDate = null;
    for (var i = 0; i < shiftData.data.CurrentShift.length; i++) {
      var minTemp = moment(shiftData.data.CurrentShift[i].StartTime);
      var maxTemp = moment(shiftData.data.CurrentShift[i].EndTime);
      if (!minValueDate) {
        minValueDate = minTemp;
      } else if (minTemp < minValueDate) {
        minValueDate = minTemp;
      }
      if (!maxValueDate) {
        maxValueDate = maxTemp;
      } else if (maxTemp > maxValueDate) {
        maxValueDate = maxTemp;
      }
    }
      
    if(date)
  {
      shiftData.shiftStartDate = date.StartTime
      shiftData.shiftEndDate = date.EndTime
    }
    else
    {
      shiftData.shiftStartDate=minValueDate.format("YYYY-MM-DD HH:mm:ss")
      shiftData.shiftEndDate=maxValueDate.format("YYYY-MM-DD HH:mm:ss")
    }
    shiftData.currentDate = new Date(maxValueDate);
    if (shiftData.data.ReferanceShift && shiftData.data.ReferanceShift.length > 0) {
      shiftData.referenceDate = new Date(moment(shiftData.data.ReferanceShift[shiftData.data.ReferanceShift.length - 1].EndTime));
    }
    shiftData.dataLoading = false;
    shiftData.loadingAPI = false;
    getCurrentTime();
    shiftData.Machines = calcEvents();
    // updateGraphData(shiftData.shiftStartDate, shiftData.shiftEndDate);
    updateGraphDataWrapper(true);
    updateStopEvents();
    // getTopStopEvents();
    getTopRejects();
    updateMachineAvailabilityAndTheorteically()
    updateMachinesLoadBarGraph()
    initMachinePerofrmanceWrapper()
    var userDateFormat = AuthService.getUserDateFormat();

    shiftData.lastRefresh = moment(new Date()).format(userDateFormat);
    if (shiftData.machineID) {
      getMachineJoshData();
      updateMachineGoals();
      getTechnicianStatus();
    }
    if (shiftData.customRangeEnabled) {
      getStopEventsAggregate(shiftData.shiftStartDate, shiftData.shiftEndDate);
    }
    getDepartmentMachineAggregateData();
    getShiftInsightTitles($sessionStorage.containers["data"], "shiftInsightGraph");
  };

  var initMachinePerofrmance = function () {
    startDate = shiftData.shiftStartDate
    endDate = shiftData.shiftEndDate
    loadingMachinesPerformanceApi = true;
    const promises = [];
    promises.push(
      LeaderMESservice.customAPI("GetMachinesPerformanceComplete", {
        MachineID: Object.keys(shiftData.machinesDisplay),
        StartDate: startDate,
        EndDate: endDate,
      })
    );
    promises.push(
      LeaderMESservice.customAPI("GetMachinesPerformanceTotals", {
        MachineID: Object.keys(shiftData.machinesDisplay),
        StartDate: startDate,
        EndDate: endDate,
      })
    );
    promises.push(
      LeaderMESservice.customAPI("GetWorkersPerformanceTotals", {
        MachineID: Object.keys(shiftData.machinesDisplay),
        StartDate: startDate,
        EndDate: endDate,
      })
    );

    Promise.all(promises)
      .then((data) => { 
        $timeout(() => {
          loadingMachinesPerformanceApi = false;
          shiftData.machinesPerformanceJoshs = data[0].ResponseDataTable[0] || [];
          shiftData.machinesPerformanceData = [data[1],data[2]];
        }, 50);                  
      })
      .catch((err) => {
      loadingMachinesPerformanceApi = false;
        console.error(err);
      });
 };

var initMachinePerofrmanceWrapper = function () {
  if (loadingMachinesPerformanceApi){
    return;
  }
   if (initTimeout) {
     $timeout.cancel( initTimeout);
   }
    initTimeout = $timeout(function () {
     initMachinePerofrmance();
   }, 200);
 };

  var getTechnicianStatus = function () {
    LeaderMESservice.customAPI("GetTechnicianStatus", {
      MachineID: shiftData.machineID,
    }).then(function (response) {
      var TechStatus = response.TechStatus[shiftData.machineID];
      var technician;
      if (!shiftData.lastMessage) {
        shiftData.lastMessage = {};
      }
      if (TechStatus && TechStatus.length > 0) {
        shiftData.lastMessage.data = _.find(TechStatus, {
          NotificationType: 1,
        });

        technician = _.find(TechStatus, { NotificationType: 2 });
        if (technician) {
          shiftData.SourceUserName = technician.SourceUserName;
          shiftData.MinutesPassedFromResponse = technician.MinutesPassedFromResponse;
        }
      } else {
        shiftData.lastMessage.data = null;
        technician = null;
        shiftData.technicianIcon = "images/onlineIcons/technician-grey-new.svg";
        shiftData.technicianText = "TECHNICIAN_DEFAULT";
      }
      if (technician) {
        shiftData.technicianIcon = "images/onlineIcons/technician-grey-new.svg";
      }
      if (Array.isArray(response.TotalCallsForMachine) && response.TotalCallsForMachine.length) {
        var machineTechStatus = response.TotalCallsForMachine[0];
      }
      if (machineTechStatus) {
        shiftData.machineData.totalOpenCalls = machineTechStatus.TotalOpenCalls;
      }
    });
  };

  var getStopEventsAggregate = function (start, end) {
    var machineIds = Object.keys(shiftData.machinesDisplay);
    if (shiftData.machineID) {
      machineIds = [shiftData.machineID];
    }
    var requestObj = {
      departmentID: [shiftData.DepartmentID],
      MachineID: machineIds,
      DateTimeFrom: start,
      DateTimeTo: end,
      minDuration: 0,
      maxDuration: 0,
    };

    LeaderMESservice.customAPI("GetStopEventsListByTimeAggregate", requestObj).then(function (response) {
      var result = [];
      response.CountStopEvents.forEach(function (stopEvent) {
        delete stopEvent.Duration;
        var found = _.find(result, {
          MachineID: stopEvent.MachineID,
          EventReason: stopEvent.Name,
        });
        if (found) {
          found.count += stopEvent.CountEvents;
        } else {
          result.push({
            Color: stopEvent.Color,
            count: stopEvent.CountEvents,
            MachineID: stopEvent.MachineID,
            MachineName: stopEvent.MachineName,
            Duration: 0,
            EndTime: null,
            EventDistributionID: stopEvent.EventGroup == 6 ? 2 : stopEvent.EventGroup == 1 ? 6 : 0,
            EventGroup: localLanguage ? stopEvent.EventGroupLName : stopEvent.EventGroupEName,
            EventGroupID: stopEvent.EventGroup,
            EventReason: stopEvent.Name,
            EventReasonID: stopEvent.Event,
            ID: 0,
            Name: "",
            StartTime: null,
          });
        }
      });
      response.SumStopEvents.forEach(function (stopEvent) {
        delete stopEvent.CountEvents;
        var found = _.find(result, {
          MachineID: stopEvent.MachineID,
          EventReason: stopEvent.Name,
        });
        if (found) {
          if (found.Duration) {
            found.Duration += getDuration(stopEvent.Duration);
          } else {
            found.Duration = getDuration(stopEvent.Duration);
          }
        } else {
          stopEvent.Duration = getDuration(stopEvent.Duration);
          result.push({
            Color: stopEvent.Color,
            count: 0,
            Duration: stopEvent.Duration,
            MachineID: stopEvent.MachineID,
            MachineName: stopEvent.MachineName,
            EndTime: null,
            EventDistributionID: 0,
            EventGroup: localLanguage ? stopEvent.EventGroupLName : stopEvent.EventGroupEName,
            EventGroupID: stopEvent.EventGroup,
            EventReason: stopEvent.Name,
            EventReasonID: stopEvent.Event,
            ID: 0,
            Name: "",
            StartTime: null,
          });
        }
      });
      shiftData.topStopEventsCustomRange = result;
    });
  };

  var getMachineJoshData = function () {
    var obj = {
      StartTime: shiftData.data.CurrentShift[shiftData.data.CurrentShift.length - 1].StartTime.replace("T", " "),
    };

    if (shiftData.machineID) {
      obj["MachineID"] = shiftData.machineID;
    } else {
      obj["DepartmentID"] = shiftData.DepartmentID;
    }

    if (shiftData.apiCalled && shiftData.apiCalled["GetMachineJoshData"] && JSON.stringify(shiftData.apiCalled["GetMachineJoshData"]) === JSON.stringify(obj)) {
      return;
    }

    LeaderMESservice.customAPI("GetMachineJoshData", obj).then(function (response) {
      shiftData.apiCalled["GetMachineJoshData"] = obj;
      if (response) {
        if (response.DepMachine && response.DepMachine[0] && response.DepMachine[0].DepartmentMachines && response.DepMachine[0].DepartmentMachines[0] && response.DepMachine[0].DepartmentMachines[0].JobData) {
          if (shiftData.machineID) {
            shiftData.jobData = response.DepMachine[0].DepartmentMachines[0].JobData;
          } else {
            shiftData.jobData = response.DepMachine[0].DepartmentMachines;
          }
        }
      }
    });
  };

  var updateMachineGoals = function () {
    var shiftIDs = [];
    if (shiftData.data && shiftData.data.CurrentShift && shiftData.data.CurrentShift[0] && shiftData.dataTimePeriod == 4) {
      shiftIDs = [shiftData.data.CurrentShift[0].ID];
    } else if (shiftData.dataTimePeriod == 6) {
      shiftIDs = [shiftData.lastShiftID];
    } else if (shiftData.dataTimePeriod == 2) {
      shiftIDs = _.unique(_.map(shiftData.aggregareDataShifts, (shift) => shift.ShiftID));
    } else if (shiftData.dataTimePeriod == 3) {
      LeaderMESservice.customAPI("GetDepartmentLastShiftsGeneralInformation", {
        DepartmentID: shiftData.DepartmentID,
        LastDays: 1,
      }).then(function (res) {
        shiftIDs = _.map(res.ResponseDictionaryDT.Shifts, function (shift) {
          return shift.ID;
        });
        LeaderMESservice.customAPI("GetTargetsForMachine", {
          MachineID: shiftData.machineID,
          Shifts: shiftIDs,
        }).then(function (response) {
          if (response.MachineDepartmentActualAndTargetData && response.MachineDepartmentActualAndTargetData[0]) {
            shiftData.targets = _.map(response.MachineDepartmentActualAndTargetData[0].Value, function (target) {
              target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
              target.TargetValue = (target.TargetValue * 100).toFixed(1);
              target.ui_name = localLanguage ? target.LName : target.EName;
              return target;
            });
          }
        });
      });
    }
    if (shiftData.dataTimePeriod == 4 || shiftData.dataTimePeriod == 6 || shiftData.dataTimePeriod == 2) {
      LeaderMESservice.customAPI("GetTargetsForMachine", {
        MachineID: shiftData.machineID,
        Shifts: shiftIDs,
      }).then(function (response) {
        // var TargetInfo = _.find(,{Key : 1}).Value
        if (response.MachineDepartmentActualAndTargetData && response.MachineDepartmentActualAndTargetData[0]) {
          shiftData.targets = _.map(response.MachineDepartmentActualAndTargetData[0].Value, function (target) {
            target.ActualTargetValue = (target.ActualTargetValue * 100).toFixed(1);
            target.TargetValue = (target.TargetValue * 100).toFixed(1);
            target.ui_name = localLanguage ? target.LName : target.EName;
            return target;
          });
        }
      });
    }
  };

  /**
   *
   * @param {*} range customRange with start and end time
   *
   * if no range found returns 0
   *
   * otherwise returns integer according to this logic by Eti
   *
   * less than a week- SHIFT = 1,
   * week- mounth- DAY = 2,
   * mounth- 6 mounth- WEEK = 3,
   * more than 6 mounth= MONTH = 4
   */
  var getDatePartByRange = function (start, end) {
    var momentStart = moment(start);
    var momentEnd = moment(end);

    var daysDiff = moment.duration(momentEnd.diff(momentStart)).asDays();

    // day or less than a day
    if (daysDiff <= 1) {
      return 0;
    }

    //less than a week
    if (daysDiff < 7) {
      return 1;
    }

    //week-month
    if (daysDiff <= 30) {
      return 2;
    }

    //month - 6months
    if (daysDiff <= 180) {
      return 3;
    }

    // more than 6 months
    return 4;
  };

  var updateGraphDataExternal = function (period) {
    if (shiftData.graphData[period]) {
      shiftData.graphData = Object.assign({}, shiftData.graphData);
    } else {
      updateGraphDataByDatePart(moment(shiftData.customRange.startDate).format("YYYY-MM-DD HH:mm:ss"), moment(shiftData.customRange.endDate).format("YYYY-MM-DD HH:mm:ss"), period);
    }
  };

  var updateGraphDataByDatePart = function (start, end, DatePart) {
    var machineIds = Object.keys(shiftData.machinesDisplay);
    if (shiftData.machineID) {
      machineIds = [shiftData.machineID];
    }

    var obj = {
      ReqDepartment: [
        {
          DepartmentID: shiftData.DepartmentID || undefined,
          MachineIDs: machineIds,
          ShiftByTime: {
            StartTime: start,
            EndTime: end,
          },
        },
      ],
      DatePart: DatePart,
    };
    shiftData.graphDataLoading = true;
    shiftData.graphLoadingDatePart = DatePart;

    var sortParameters = function (parametersDisplay) {
      var sortedNames = _.map(
        Object.entries(parametersDisplay).map(([key, value]) => ({
          key,
          value,
        })),
        function (ia) {
          return ia.value;
        }
      ).sort();
      var sortedParamsKeys = [];
      for (var i = 0; i < sortedNames.length; i++) {
        sortedParamsKeys.push(_.invert(parametersDisplay)[sortedNames[i]]);
      }
      return sortedParamsKeys;
    };

    LeaderMESservice.customAPI("GetDepartmentShiftGraph", obj).then(function (response) {
      var data = response.Departments;
      var graphColor = response.GraphColors;
      var machines = [];
      var parameters = [];
      var parametersDisplay = {};

      //set parameters for containers
      if (data && data[0] && data[0].DepartmentGraphParameters) {
        parameters = angular.copy(data[0].DepartmentGraphParameters);
      }
      _.forEach(data, function (department) {
        department.CurrentShift.forEach(function (shift, index) {
          if (index == 0) {
            machines = shift.Machines;
            return;
          }
          shift.Machines.forEach(function (machine) {
            var origMachine = _.find(machines, { ID: machine.ID });
            machine.Graphs.forEach(function (graph) {
              var origGraph = _.find(origMachine.Graphs, {
                Name: graph.Name,
              });
              if (origGraph) {
                origGraph.GraphSeries[0].Items = origGraph.GraphSeries[0].Items.concat(graph.GraphSeries[0].Items);
              } else {
                origMachine.Graphs.push(graph);
              }
            });
          });
        });
      });

      machines = _.groupBy(machines, "ID");
      var i = -1;
      machines = _.map(machines, function (value, key) {
        var graphs = angular.copy(
          _.filter(value[0].Graphs, function (graph) {
            addGraph = _.indexOf(parameters, graph.Name) != -1;
            if (addGraph) {
              parametersDisplay[graph.Name] = graph.DisplayName;
            }
            return _.indexOf(parameters, graph.Name) != -1;
          })
        );
        _.forEach(graphs, function (graph) {
          graph.GraphSeries[0].Items = [];
        });

        _.forEach(value, function (machine) {
          _.forEach(machine.Graphs, function (graph) {
            var currentGraph = _.find(graphs, { Name: graph.Name });
            if (currentGraph) {
              currentGraph.GraphSeries[0].Items = _.union(currentGraph.GraphSeries[0].Items, graph.GraphSeries[0].Items);
            }
          });
        });
        var machineRef = _.find(shiftData.Machines, {
          machineID: value[0].ID,
        });

        i++;
        return {
          Graphs: graphs,
          Id: value[0].ID,
          name: value[0].Name,
          machineRef: machineRef,
          lineColor: graphColor[i % graphColor.length].HexCode,
        };
      });
      // update default
      _.each(containers.data, function (container) {
        if (container.name == "PEGraph") {
          container.options.settings.parameters = angular.copy(parameters);
          container.options.settings.parametersDisplay = angular.copy(parametersDisplay);
          container.options.settings.parameter = container.options.settings.parameter && _.indexOf(parameters, container.options.settings.parameter) != -1 ? container.options.settings.parameter : parameters[0];
          container.options.settings.parameters = sortParameters(container.options.settings.parametersDisplay);
        }
      });
      _.each(containersDefault, function (container) {
        if (container.name == "PEGraph") {
          container.options.settings.parameters = angular.copy(parameters);
          container.options.settings.parametersDisplay = angular.copy(parametersDisplay);
          container.options.settings.parameter = container.options.settings.parameter && _.indexOf(parameters, container.options.settings.parameter) != -1 ? container.options.settings.parameter : parameters[0];
          container.options.settings.parameters = sortParameters(container.options.settings.parametersDisplay);
        }
      });
      if (shiftData.machineID) {
        _.each(machineContainers.data, function (container) {
          if (container.name == "PEGraph") {
            container.options.settings.parameters = angular.copy(parameters);
            container.options.settings.parametersDisplay = angular.copy(parametersDisplay);
            container.options.settings.parameter = container.options.settings.parameter && _.indexOf(parameters, container.options.settings.parameter) != -1 ? container.options.settings.parameter : parameters[0];
            container.options.settings.parameters = sortParameters(container.options.settings.parametersDisplay);
          }
        });
        _.each(machineContainersDefault, function (container) {
          if (container.name == "PEGraph") {
            container.options.settings.parameters = angular.copy(parameters);
            container.options.settings.parametersDisplay = angular.copy(parametersDisplay);
            container.options.settings.parameter = container.options.settings.parameter && _.indexOf(parameters, container.options.settings.parameter) != -1 ? container.options.settings.parameter : parameters[0];
            container.options.settings.parameters = sortParameters(container.options.settings.parametersDisplay);
          }
        });
      }

      filterGraphData(machines);
      if (!shiftData.graphData) {
        shiftData.graphData = {};
      }
      shiftData.graphData[DatePart] = machines;
      shiftData.graphData = Object.assign({}, shiftData.graphData);
      shiftData.graphDataLoading = false;
      shiftData.graphLoadingDatePart = null;
    });
  };

  const updateGraphDataWrapper = (force) => {
    if (loadingGraphDataApi){
      return;
    }
      if (initGraphDataTimeout) {
        $timeout.cancel(initGraphDataTimeout);
      }
      initGraphDataTimeout = $timeout(function () {
        updateGraphData(force);
      }, 450);
  };

  var updateGraphData = function (force) {
    const start = shiftData.shiftStartDate;
    const end = shiftData.shiftEndDate;
    // var DatePart = getDatePartByRange(start, end);
    var DatePart = [];
    var peGraph = [];
    if (shiftData.machineID && machineContainers && machineContainers.data) {
      peGraph = _.filter(machineContainers.data, { template: "PEGraph" });
    } else if (containers && containers.data) {
      peGraph = _.filter(containers.data, { template: "PEGraph" });
    }
    if (peGraph.length < 0) {
      return;
    }
    let visible = false;
    peGraph.forEach(function (graph) {
      if (!shiftData.customRangeEnabled) {
        graph.options.DatePart = 0;
      }
      if (DatePart.indexOf(graph.options.DatePart) < 0) {
        DatePart.push(graph.options.DatePart);
      }
      if (graph && graph.options && graph.options.display) {
        visible = true;
      }
    });
    if (!visible) {
      return;
    }
    if (DatePart.length == 0) {
      DatePart = [0];
    }
    if (!shiftData.graphData){
      shiftData.graphData = {};
    }
    DatePart.forEach(function (period) {
      if (shiftData.graphData[period] && !force){
        return;
      }
      updateGraphDataByDatePart(start, end, period);
    });
  };

  var filterGraphData = function (graphData) {
    if (!graphData) {
      return;
    }
    _.each(graphData, function (machine) {
      var machineRef = _.find(shiftData.Machines, { machineID: machine.Id });
      machine["machineRef"] = machineRef;
    });
  };

  var sliderUpdate = function () {
    var curshifts = shiftData.data.CurrentShift;
    var startlimit = null;
    var endlimit = null;
    // var rtl = LeaderMESservice.isLanguageRTL();
    var rtl = false;
    curshifts = _.sortBy(curshifts, [
      function (o) {
        return new Date(o.StartTime);
      },
    ]);
    // find first and last shifts
    curshifts.forEach(function (shift) {
      shiftsSTime = getTime(new Date(shift.StartTime));
      shiftsETime = getTime(new Date(shift.EndTime));
      // if it's the first shift initialize it
      if (!startlimit) {
        startlimit = shiftsSTime;
      } else {
        // if the current shift time before the start limit then update the start limit
        if (startlimit > shiftsSTime) {
          startlimit = shiftsSTime;
        }
      }
      // if it's the first shift initialize the end limit
      if (!endlimit) {
        endlimit = shiftsETime;
      } else {
        // if the current shift time after the end limit then update the end limit
        if (endlimit < shiftsETime) {
          endlimit = shiftsETime;
        }
      }
      //
      if (shift.CurrentTime) {
        period.value = getTime(new Date(shift.CurrentTime));
        period.diff = period.value - getTime(new Date(shift.StartTime));
      }
    });
    var diffBetweenShifts = endlimit - startlimit;
    var tickW = Math.ceil(diffBetweenShifts / 18 / 30) * 30;
    sliderData.options.ticks = {};
    curshifts.forEach(function (shift) {
      shiftsSTime = getTime(new Date(shift.StartTime));
      shiftsETime = getTime(new Date(shift.EndTime));
      var ticksArr = {};

      ticksArr = _.range(shiftsSTime - (shiftsSTime % tickW) + (shiftsSTime % tickW > tickW / 2 ? tickW * 2 : tickW), shiftsETime, tickW);
      ticksArr.push(shiftsSTime);
      ticksArr = _.sortBy(ticksArr, function (n) {
        return n;
      });
      sliderData.options.ticks[shift.ID] = {
        startShift: shiftsSTime,
        endShift: shiftsETime,
        shiftTicks: ticksArr,
      };
    });
    sliderData.options["tickTotal"] = curshifts.length;
    if (!sliderData.minValue || sliderData.minValue == sliderData.options.floor || sliderData.minValue < sliderData.options.floor || sliderData.minValue > sliderData.options.ceil) {
      sliderData.minValue = startlimit;
    }
    if (!sliderData.maxValue || sliderData.maxValue == sliderData.options.ceil || sliderData.maxValue < sliderData.options.floor || sliderData.maxValue > sliderData.options.ceil) {
      sliderData.maxValue = endlimit;
    }

    sliderData.options.floor = startlimit;
    sliderData.options.ceil = endlimit;

    sliderData.options.rightToLeft = rtl;
    if (shiftData.lastHour) {
      var currentTime = getCurrentTime();
      var date = currentTime ? currentTime : sliderData.options.ceil;
      var startDate = date - 60;
      if (startDate < sliderData.options.floor) {
        updateSliderData(sliderData.options.floor, date);
      } else {
        updateSliderData(startDate, date);
      }
    } else {
      sliderUpdateDefferd.notify();
    }
  };

  var durationParams = function (duration, startDate, endDate) {
    if (!duration) {
      duration = shiftData.selectedTab;
    }
    if (duration === 'default') {
      if (requestedDuration) {
        duration = requestedDuration.duration;
        startDate = requestedDuration.startDate;
        endDate = requestedDuration.endDate;
        shiftData.selectedTab = duration;
      }
      else {
        duration = 4;
      }
    }
    else {
      requestedDuration = {
        duration,
        startDate,
        endDate,
      };
    }
    switch (duration) {
      case 1: //custom
        shiftData.lastShift = false;
        shiftData.customDayTab = false;
        shiftData.dataTimePeriod = 1;
        if (startDate && endDate) {
          shiftData.custom.startTime = getFormattedDate(startDate);
          shiftData.custom.endTime = getFormattedDate(endDate);
        }
        shiftData.custom.customTab = true;
        return {
          StartTime: shiftData.custom.startTime,
          EndTime: shiftData.custom.endTime,
          RefShiftDays: shiftData.refShiftData,
        };
      case 2: //custom for date piker
        shiftData.lastShift = false;
        shiftData.custom.customTab = false;
        shiftData.customDayTab = true;
        shiftData.dataTimePeriod = 2;
        return {
          StartTime: getFormattedDate(shiftData.customRange.startDate),
          EndTime: getFormattedDate(shiftData.customRange.endDate),
        };

      case 3: //last day
        shiftData.lastShift = false;
        shiftData.custom.customTab = false;
        shiftData.customDayTab = false;
        shiftData.dataTimePeriod = 3;
        var date = new Date();
        let splitDate = shiftData?.firstShiftIn24Hours?.StartTime?.split("-");
        let splitT = splitDate[2].split("T")[1];
        let startDate1 = new Date(splitDate[0], splitDate[1] - 1, splitDate[2].split("T")[0], splitT.split(":")[0], splitT.split(":")[1], splitT.split(":")[2]);
        return {
          StartTime: getFormattedDate(startDate1),
          EndTime: getFormattedDate(date),
          RefShiftDays: shiftData.refShiftData,
        };
      case 4: // this shift
        shiftData.dataTimePeriod = 4;
        shiftData.lastShift = false;
        shiftData.custom.customTab = false;
        shiftData.customDayTab = false;
        // shiftData.machineDashboardShiftIds = [shiftData]
        return null;
      case 6: // last shift
        shiftData.dataTimePeriod = 6;
        shiftData.customDayTab = false;
        if (shiftData.lastShiftID) {
          shiftData.lastShift = true;
          return {
            ID: shiftData.lastShiftID,
            RefShiftDays: shiftData.refShiftData,
          };
        }
        return null;
      case 5: //last Hour
        var currentTime = getCurrentTime();
        var date = currentTime ? currentTime : sliderData.options.ceil;
        var startDate = date - 60;
        if (startDate < sliderData.options.floor) {
          updateSliderData(sliderData.options.floor, date);
        } else {
          updateSliderData(startDate, date);
        }
        if (shiftData.lastShift || shiftData.custom.customTab || shiftData.customDayTab) {
          shiftData.lastHour = true;
          return null;
        }
        if (shiftData.dataTimePeriod == 3) {
          shiftData.custom.customTab = false;
          shiftData.lastShift = false;
          shiftData.customDayTab = false;
          var date = new Date();
          var startDate = new Date(date.getTime() - 1000 * 60 * 60 * 24);
          return {
            StartTime: getFormattedDate(startDate),
            EndTime: getFormattedDate(date),
            RefShiftDays: shiftData.refShiftData,
            updateData: false,
          };
        }
        return {
          updateData: false,
        };
      case 7: //custom for date piker
        return {
          StartTime: getFormattedDate(shiftData.customRange.startDate),
          EndTime: getFormattedDate(shiftData.customRange.endDate),
        };
      case 8: //last 24 hour for machine dahsboard
        shiftData.lastShift = false;
        shiftData.custom.customTab = false;
        shiftData.customDayTab = false;
        shiftData.dataTimePeriod = 3;
        var date = new Date();
        var startDate = new Date(date.getTime() - 1000 * 60 * 60 * 24);
        return {
          StartTime: getFormattedDate(startDate),
          EndTime: getFormattedDate(date),
          RefShiftDays: shiftData.refShiftData,
        };
      case 9:
        var date = new Date();        
        return {
          StartTime: getFormattedDate(shiftData.firstShiftToday.StartTime),
          EndTime: getFormattedDate(date),
          RefShiftDays: shiftData.refShiftData,
        };
        case 10:
          const today = (new Date()).setHours(0,0,0,0)
          const yesterday = new Date(today)          
          yesterday.setDate(yesterday.getDate() - 1)   
          return {
            StartTime: getFormattedDate(yesterday),
            EndTime: getFormattedDate(today),
          };
    }
  };

  function getCurrentTime() {
    if (shiftData.data) {
      var date = null;
      _.forEach(shiftData.data.CurrentShift, function (shift) {
        if (shift.CurrentTime) {
          date = new Date(shift.CurrentTime);
          date = getTime(date);
          period.value = date;
          period.diff = date - getTime(new Date(shift.StartTime));
        }
      });
      return date;
    }
    return null;
  }

  var getFormattedDate = function (date) {
    return $filter("date")(date, "yyyy-MM-dd HH:mm:ss");
  };

  var getStopEventsObjectRef = function () {
    var objR = {
      DateTimeFrom: $filter("date")(new Date((sliderData.minValue - 24 * 60) * 60 * 1000), "yyyy-MM-dd HH:mm:ss"),
      DateTimeTo: $filter("date")(new Date((sliderData.maxValue - 24 * 60) * 60 * 1000), "yyyy-MM-dd HH:mm:ss"),
    };

    if (!shiftData.machineID) {
      objR["DepartmentID"] = shiftData.DepartmentID;
    } else {
      objR["MachineID"] = shiftData.machineID;
    }
    return objR;
  };

  var updateStopEvents = function () {
    //calc stopEvents from shiftData.Machines
    var stopEvents = [];
    _.forEach(shiftData.Machines, function (machine) {
      stopEvents = _(stopEvents)
        .concat(
          _.filter(machine.CurrShift.selectedStopEvents, function (event) {
            event["MachineID"] = machine.machineID;
            event["MachineName"] = machine.machineName;
            return _.indexOf(stopEventsIds, event.EventDistributionID) != -1;
          })
        )
        .value();
    });
    shiftData.stopEvents = stopEvents;
    shiftData.stopEventsReasonFilter = angular.copy(_.uniq(stopEvents, "EventReasonID").filter((it) => it.EventDistributionID !== 9));
    shiftData.stopEventsGroupFilter = angular.copy(_.uniq(stopEvents, "EventGroupID").filter((it) => it.EventDistributionID !== 9));
    updateRefStopEvents();
  };

  var updateRefStopEvents = function () {
    if (shiftData.compareWith === "none") {
      return;
    }
    var stopEvents = [];
    _.forEach(shiftData.Machines, function (machine) {
      machine.RefShift = machine.RefShift || [];
      stopEvents = _(stopEvents)
        .concat(
          _.filter(machine.RefShift.selectedStopEvents, function (event) {
            event["MachineID"] = machine.machineID;
            event["MachineName"] = machine.machineName;
            return _.indexOf(stopEventsIds, event.EventDistributionID) != -1;
          })
        )
        .value();
    });
    shiftData.stopEventsRef = stopEvents;
  };
  var updateMachineAvailabilityAndTheorteically = function () {
    var containerMachineAvailability = _.find(containers.data, { template: "machinesLoadGraph", options: { display: true } });
    var containerUnitsProducedTheoretically = _.find(containers.data, { template: "unitsProducedTheoretically", options: { display: true } });

    if (!containerMachineAvailability && !containerUnitsProducedTheoretically) {
      return;
    }
    if (shiftData.machineAvailabilityTimeout) {
      $timeout.cancel(shiftData.machineAvailabilityTimeout);
    }
    shiftData.machineAvailabilityTimeout = $timeout(function () {
      var start,end;
      if(shiftData.dataTimePeriod == 2 && !shiftData.isCustomAllShifts){
        start = shiftData.shiftStartDate;
        end = shiftData.shiftEndDate
      }
      else{
        start =$filter("date")(new Date(sliderData.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
        end =$filter("date")(new Date(sliderData.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
      }
     
      LeaderMESservice.customAPI("GetMachineAvailability", {
        DepartmentID: shiftData.DepartmentID,
        StartDate: start,
        EndDate: end,
      }).then(function (response) {
        shiftData["machinesLoad"] = response.Params;
      });
    }, 500);
  };

  var updateMachinesLoadBarGraph = function () {
    var containerMachinesLoadBar = _.find(containers.data, { template: "machinesLoadBarGraph", options: { display: true } });

    if (!containerMachinesLoadBar) {
      return;
    }
    if (shiftData.machinesLoadBarTimeout) {
      $timeout.cancel(shiftData.machinesLoadBarTimeout);
    }
    shiftData.machinesLoadBarTimeout = $timeout(function () {
      
      LeaderMESservice.customAPI("GetDepartmentHourlyUnitsProduced", {
        DepartmentID: shiftData.DepartmentID,
        StartDate: shiftData.shiftStartDate,
        EndDate: shiftData.shiftEndDate,
        MachineID: shiftData.Machines.map(machine => machine.machineID),
      }).then(function (response) {
        if (response && response.ResponseDictionaryDT) {
          shiftData["machinesLoadBar"] = response.ResponseDictionaryDT.Data;
        }
      });
    }, 500);
  };


  var getTopStopEvents = function () {
    if (shiftData.loadingTopStopEvents == true) {
      return;
    }
    shiftData.loadingTopStopEvents = true;
    var arr = [];
    if (!shiftData.machineID) {
      _.forIn(shiftData.machinesDisplay, function (value, key) {
        if (value) {
          arr.push(key);
        }
      });
    } else {
      arr.push(shiftData.machineID);
    }

    var obj = {
      StartDate: shiftService.shiftData.shiftStartDate,
      EndDate: shiftService.shiftData.shiftEndDate,
      MachineID: arr,
    };

    if (!shiftData.machineID) {
      obj["DepartmentID"] = arr.length > 0 ? [shiftData.DepartmentID] : [-1];
    }

    var rtl = LeaderMESservice.isLanguageRTL();

    LeaderMESservice.customAPI("GetStopAndCriticalEvents", obj).then(
      function (response) {
        var topStopEventsTable = [];
        angular.forEach(response.MachineEvents, function (row, key) {
          var tmpEvent = _.find(response.StopEventsList, {
            Event: parseInt(key),
          });
          var currentRow = {
            status: tmpEvent ? tmpEvent.Name : "",
          };

          for (var i = 0; i < row.length; i++) {
            currentRow[rtl ? row[i].MachineLName : row[i].MachineName] = row[i].Duration;
          }

          topStopEventsTable.push(currentRow);
        });

        shiftData.machineEventsGrid = topStopEventsTable;

        shiftData.criticalEvents = response.CriticalEvents;
        shiftData.topMachineEvents = response.MachineEvents;
        shiftData.loadingTopStopEvents = false;
        shiftData.topStopEvents = _.sortBy(response.StopEventsList, function (event) {
          event.Duration = getDuration(event.Duration);
          event.Duration;
        });
      },
      function (error) {
        shiftData.loadingTopStopEvents = false;
      }
    );
  };

  var getTopRejects = function (subMachines = []) {
    var arr = [];
    shiftData.reasonArray = [];
    shiftData.dataTable = [];
    shiftData.simpleTableData = [];
    shiftData.loading = false;
    if (!shiftData.machineID) {
      _.forIn(shiftData.machinesDisplay, function (value, key) {
        let subMachine = subMachines.find((machine) => machine.ID == key);
        // if (value) {
        if (subMachine && subMachine.value) {
          arr.push(key);
        }
      });
    } else {
      arr.push(shiftData.machineID);
    }

    var start = shiftData.shiftStartDate;
    var end = shiftData.shiftEndDate

    var obj = {
      StartDate: start,
      EndDate: end,
      MachineID: arr,
    };
    if (!shiftData.machineID) {
      obj["DepartmentID"] = arr.length > 0 ? [shiftData.DepartmentID] : [-1];
      var container = _.find(containers.data, { template: "topRejectsGraph", options: { display: true } });
      if (!container) {
        return;
      }
    } else {
      var container = _.find(machineContainers.data, { template: "topRejectsGraph", options: { display: true } });
      if (!container) {
        return;
      }
    }
    obj["top"] = container.options.settings.top;

    var rtl = LeaderMESservice.isLanguageRTL();

    if (shiftData.topRejectsTimeout) {
      $timeout.cancel(shiftData.topRejectsTimeout);
    }

    shiftData.topRejectsTimeout = $timeout(function () {
      shiftData.loading = true;
      LeaderMESservice.customAPI("GetRejects", obj).then(
        function (response) {
          getRejectsReasonsByDatesForMachine();
          shiftData.loading = false;

          var topRejectsTable = [];
          angular.forEach(response.MachineReasons, function (row, key) {
            var tmpEvent = _.find(response.RejectsList, {
              ReasonID: parseInt(key),
            });

            var currentRow = {
              status: tmpEvent ? tmpEvent.Name : "",
            };
            shiftData.reasonArray.push({
              name: currentRow.status,
              id: parseInt(key),
            });
            for (var i = 0; i < row.length; i++) {
              currentRow[rtl ? row[i].MachineLName : row[i].MachineName] = row[i].Amount;
            }

            topRejectsTable.push(currentRow);
          });

          shiftData.topRejects = _.sortBy(response.RejectsList, function (event) {
            return -event.Amount;
          });
        },
        function () {
          shiftData.loading = false;
        }
      );
    }, 1500);
  };

  var getDuration = function (duration) {
    var temp = duration.split(".");
    var arr = temp.length > 1 ? temp[1].split(":") : temp[0].split(":");
    var days = temp.length > 1 ? temp[0] : 0;
    return parseInt(days * 60 * 24) + parseInt(arr[0]) * 60 + parseInt(arr[1]) + parseInt(arr[2]) / 60;
  };

  var getShiftData = function () {
    return shiftData;
  };

  var updateSliderData = function (min, max) {
    if (sliderData.minValue != min || sliderData.maxValue != max) {
      sliderUpdateDefferd.notify();
    }
    sliderData.minValue = min;
    sliderData.maxValue = max;
  };

  var resetContainerDefault = function (resetPage) {
    $sessionStorage.containers["data"] = angular.copy(containersDefault);
    getShiftInsightTitles($sessionStorage.containers["data"], "shiftInsightGraph");

    $sessionStorage.containers["version"] = VERSION;
    shiftData.compare = false;
    shiftData.compareWith = "none";
    containers.data = $sessionStorage.containers.data;
  };

  var resetDisplayDefault = function () {
    var changed = false;
    _.forEach(shiftData.machinesDisplay, function (value, key) {
      if (!value) {
        changed = true;
        shiftData.machinesDisplay[key] = true;
      }
    });
    if (changed) {
      $timeout(function () {
        displayUpdateDefferd.notify();
      });
    }
    updateGraphLines();
  };

  var resetMachineContainerDefault = function () {
    $localStorage.machineContainers = angular.copy(machineContainersDefault);
    machineContainers.data = $localStorage.machineContainers;
  };

  var loadNewTemplate = function (newStracture) {
    let cons;
    let type = "containers";
    if (newStracture.containers) {
      cons = newStracture.containers;
    } else if (newStracture.shiftInsights) {
      cons = newStracture.shiftInsights;
    }

    if (cons) {
      var newData = [];
      _.forEach(angular.copy(cons.data), function (newContainer) {
        var container = _.find(cons.data, {
          ID: newContainer.ID,
        });
        if (container) {
          newContainer.options = Object.assign(container.options, newContainer.options);
          newContainer.options.settings = Object.assign(container.options.settings, newContainer.options.settings);
          if (newContainer.template == "PEGraph") {
            newContainer.options.DatePart = 0;
          }
          if (newContainer.localMachines?.length == 0 && shiftData.Machines) {
            newContainer.localMachines = shiftData.Machines.filter((machine) => {
              return shiftData.machinesDisplay[machine.machineID] === true;
            }).map((machine) => {
              return {
                ID: machine.machineID,
                MachineName: machine.machineName,
                MachineLName: machine.machineName,
                LineID: -1,
                LineName: "",
                MachineGroupID: 0,
                MachineGroupName: "",
                MachineGroupLName: "",
                value: true,
              };
            });
          }
          newData.push(angular.copy(newContainer));
        }
      });
      updateContainers();
      if (type === "containers") {
        $sessionStorage.containers.data = newData;
      } else {
        newStracture.shiftInsights.data = newData;
      }
      cons.data = newData;
    }

    if (newStracture.machinesDisplay) {
      shiftData.machinesDisplay = newStracture.machinesDisplay;
    }

    if (cons) {
      $timeout(() => {
        $rootScope.$broadcast("loadedTemplate", { data: cons.data });
      }, 1000);
    }
  };

  var loadNewTemplateMachine = function (newStracture) {
    if (newStracture.insightsContainers) {
      newStracture.containers = angular.copy(newStracture.insightsContainers);
    }
    if (newStracture.containers) {
      _.forEach(newStracture.containers.data, function (container) {
        var defaultContainerOptions = _.find(machineContainersDefault, {
          name: container.name,
        });
        if (defaultContainerOptions) {
          defaultContainerOptions = angular.copy(defaultContainerOptions.options);
        }
        if (defaultContainerOptions) {
          var defaultSettings = angular.copy(defaultContainerOptions.settings);
          var currentSettings = container.options.settings;
          container.options = Object.assign(defaultContainerOptions, container.options);
          currentSettings = Object.assign(defaultSettings, currentSettings);
          container.options.settings = currentSettings;
        }
      });
      machineContainers.data = newStracture.containers.data;
      $localStorage.machineContainers = newStracture.containers.data;
    }
  };

  var getStructure = function (scope, structureType) {
      var reqBody
      $timeout(function(){
        if($localStorage.selectTemplateGroupID.machineDashboard > -1)
        {
            reqBody = {
              machines: [shiftData.machineData.MachineID],
              structureType: structureType,
                IsDefault:shiftData.selectTemplateGroupID.machineDashboard >= -1 ? true : false,
                GroupID: _.isNumber(shiftData.selectTemplateGroupID.machineDashboard) && shiftData.selectTemplateGroupID.machineDashboard
            }
        }
        else
        {
            reqBody ={
              machines: [ shiftData.machineData.MachineID ],
              structureType: structureType,
            }        
            if($localStorage.selectTemplateGroupID.machineDashboard == -1)
            {
              reqBody.IsDefault= true
              reqBody.GroupID= $sessionStorage.userAuthenticated?.TemplateID
            }
            else
            {
              reqBody.IsDefault= false
            }
        }
  
   
      
      LeaderMESservice.customAPI("GetMachineStructure", reqBody).then(function (response) {
        for (var i = 0; i < response?.Structure?.length; i++) {
          if (
            _.findIndex(response.Structure[i], {
              FieldName: "MachineID",
              Value: shiftData.machineData.MachineID.toString(),
            }) >= 0
          ) {
            var Structure = _.find(response.Structure[i], {
              FieldName: "Structure",
            });
            if (Structure) {
              try {
                shiftData.machineStructure = JSON.parse(Structure.Value);
                
                if (shiftData.machineStructure.staticField) {
                  shiftData.machineStructure.staticField1 = shiftData.machineStructure.staticField;
  
                  delete shiftData.machineStructure.staticField;
                } else if (!shiftData.machineStructure.staticField1) {
                  shiftData.machineStructure.staticField1 = {
                    FieldName: "CycleTime",
                    graph: false,
                    visibility: true,
                  };
                }
                if (!shiftData.machineStructure.staticField2) {
                  shiftData.machineStructure.staticField2 = {
                    FieldName: "Job Progress",
                    graph: false,
                    visibility: true,
                  };
                }
                if (!shiftData.machineStructure.staticField3) {
                  shiftData.machineStructure.staticField3 = {
                    FieldName: "Josh Progress",
                    graph: false,
                    visibility: true,
                  };
                }
  
                //update previous data with visibility true
                if (!angular.isDefined(shiftData.machineStructure.staticField1.visibility)) {
                  shiftData.machineStructure.staticField1.visibility = true;
                }
                if (!angular.isDefined(shiftData.machineStructure.staticField2.visibility)) {
                  shiftData.machineStructure.staticField2.visibility = true;
                }
                if (!angular.isDefined(shiftData.machineStructure.staticField3.visibility)) {
                  shiftData.machineStructure.staticField3.visibility = true;
                }
  
                scope.machineStructure = shiftData.machineStructure;
                return;
              } catch (e) {
                console.log("structure is not a json");
              }
            }
          }
        }
        if (!scope.machineStructure) {
          scope.machineStructure = ExpandedMachinesService.getInitialMachineStructure();
          shiftData.machineStructure = scope.machineStructure;
        }
      });
      })

  };
  var saveStructure = function (scope, structureType, applyAll) {  
    LeaderMESservice.customAPI("SaveMachineStructure", {
      machineStructure: [
        {
          MachineID: shiftData.machineID,
          StructureType: structureType,
          Structure: JSON.stringify(scope.machineStructure),
        },
      ],
      IsCopyToAllMachineTypes: applyAll,
    }).then(function (response) {
      if (applyAll) {
        toastr.clear();
        toastr.success("", $filter("translate")("STRUCTURE_SAVED_SUCCESSFULLY"));
      }
    });
  };

  var updateCompare = function (compareWith) {
    if (shiftData.compareWith === compareWith) {
      return;
    }
    shiftData.compareWith = compareWith;
    _.forEach(containers.data, function (graph) {
      if (graph.options.settings && graph.options.settings.compareWith) {
        graph.options.settings.compareWith = compareWith;
        if (compareWith === "none") {
          graph.options.settings.compare = false;
        } else {
          graph.options.settings.compare = true;
        }
      }
    });
    var compareV = 0;
    switch (compareWith) {
      case "prevDay":
        compareV = 1;
        break;
      case "prevWeek":
        compareV = 7;
        break;
      case "prevMonth":
        compareV = 28;
        break;
      case "none":
        compareV = 0;
    }
    shiftData.refShiftData = compareV;
    var durationObj = durationParams();

    updateData(shiftData.DepartmentID, durationObj, true);
  };

  var updateGraphLines = function () {
    if (containers && containers.data) {
      var line = 0;
      var lineHeight = {};
      containers.data.forEach(function (graph) {
        if (graph.options.display) {
          const prevLine = Math.ceil(line / 12);
          const prevColumns = line;
          line += graph.options.width;
          graph.options.line = Math.ceil(line / 12);
          if (prevLine < graph.options.line && prevLine > 0) {
            line = line + (prevColumns % 12);
          }
          if (lineHeight[graph.options.line]) {
            graph.options.height = lineHeight[graph.options.line];
            graph.options.maxHeight = lineHeight[graph.options.line];
          } else {
            lineHeight[graph.options.line] = graph.options.height;
          }
        }
      });
    }
  };

  var getRejectsReasonsByDatesForMachine = function () {
    // var start = shiftData.customRangeEnabled ? $filter("date")(new Date(shiftData.customRange.startDate), "yyyy-MM-dd HH:mm:ss") : $filter("date")(new Date(sliderData.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
    // var end = shiftData.customRangeEnabled ? $filter("date")(new Date(shiftData.customRange.endDate), "yyyy-MM-dd HH:mm:ss") : $filter("date")(new Date(sliderData.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
    var start = shiftData.shiftStartDate;
    var end = shiftData.shiftEndDate
    var obj = {
      StartTime: start,
      EndTime: end,
    };

    if (shiftData.machineID && shiftData.MachinesDisplay && shiftData.MachinesDisplay[shiftData.machineID]) {
      obj["MachineID"] = shiftData.machineID;
    }

    if (!shiftData.machineID) {
      obj["DepartmentID"] = shiftData.DepartmentID;
    }
    var container = _.find(containers.data, { template: "topRejectsGraph", options: { display: true } });
    if (!container) {
      return;
    }
    obj["top"] = container.options.settings.top;
    LeaderMESservice.customAPI("GetRejectsListByDatesForMachine", obj).then(function (response) {
      var reasonsTable = [];
      _.forEach(response.ResponseDictionary, function (machine) {
        _.map(machine, function (reason) {
          reasonsTable.push(reason);
          return reason;
        });
      });
      shiftData.simpleTableData = reasonsTable;
      shiftData.rejectsByMachine = _.groupBy(reasonsTable, "Name");
      _.map(shiftData.rejectsByMachine, function (reason) {
        shiftData.dataTable.push(reason[0].Name);
      });
    });
  };

  var getDepartmentMachineAggregateData = function () {
    if (shiftData.machineID) {
      var container = _.find(machineContainers.data, { template: "unitsProducedGraph", options: { display: true } });
      if (!container) {
        return;
      }
    } else {
      var container = _.find(containers.data, { template: "unitsProducedGraph", options: { display: true } });
      if (!container) {
        return;
      }
    }
    if (shiftData.getDepartmentMachineAggregateDataTimeout) {
      $timeout.cancel(shiftData.getDepartmentMachineAggregateDataTimeout);
    }
    shiftData.getDepartmentMachineAggregateDataTimeout = $timeout(() => {
      var requestObj = { DepartmentID: shiftData.data.ID };
      var requestObjRef = null;
      if (shiftData.customRangeEnabled) {
        if (shiftData.machineID) {	       
          requestObj.ShiftID = _.map(shiftData.data.CurrentShift, "ID");
        } else {	
          requestObj.ShiftID = shiftData.selectedCustomShiftID;	
        }
      } else {
        requestObj.ShiftID = _.map(shiftData.data.CurrentShift, "ID");
        if (shiftData.data.ReferanceShift && shiftData.data.ReferanceShift.length > 0) {
          requestObjRef = angular.copy(requestObj);
          requestObjRef.ShiftID = _.map(shiftData.data.ReferanceShift, "ID");
        }
      }
      LeaderMESservice.customAPI("GetDepartmentMachineAggregateData", requestObj).then(function (response) {
        shiftData.machineAPIData = response.MachineData;
      });
      if (requestObjRef) {
        LeaderMESservice.customAPI("GetDepartmentMachineAggregateData", requestObjRef).then(function (response) {
          shiftData.machineAPIDataRef = response.MachineData;
        });
      } else {
        shiftData.machineAPIDataRef = undefined;
      }
    }, 2500);
  };

  var saveShiftContainer = function () {
    $sessionStorage.containers = containers;
  };

  const getGlobalColorsDefferd = $q.defer();
  LeaderMESservice.customAPI("GetProductionProgressColorDefinition", {}).then(function (response) {
    getGlobalColorsDefferd.resolve(response.ResponseList);
  });

  var getProductionProgressColorDefinition = () => {
    return new Promise((resolve, reject) => {
      getGlobalColorsDefferd.promise.then(function (data) {
        resolve(data);
      });
    });
  };

  var prepareLabel =  function(value){
    if(_.isNumber(value))
      {
        value = value.toString()
      }
      if(value?.split(' ').length > 1){
        return {
          toolTip:value,
          value:value,
          style: "white-space: normal"
        }
      }
      else
      {
        if(value?.length > 6){
          return {
            toolTip:angular.copy(value),
            value: `${value.toString().substring(0, 6)}...`,
            style:''
          }
        }
        else
        {
          return {
            toolTip:value,
            value:value,
            style:''
          }
        }
      }          
  } 
  var initContainersFilterState = function(){
    if (!$sessionStorage.containersFilterState) {
      $sessionStorage.containersFilterState = {}
      $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {
        filter: {
          shiftMachineFilterOption: "line",
        },
      };
    }
  }
 

  return {
    getProductionProgressColorDefinition: getProductionProgressColorDefinition,
    getTime: getTime,
    sliderData: sliderData,
    shiftData: shiftData,
    allowedGraphsForCustomRange: allowedGraphsForCustomRange,
    gridDefault: gridDefault,
    resetShiftData: resetShiftData,
    updateData: updateData,
    containers: containers,
    durationParams: durationParams,
    getShiftData: getShiftData,
    calcEvents: calcEvents,
    period: period,
    getMachineStatusIcon: getMachineStatusIcon,
    getMachineStatusColor: getMachineStatusColor,
    getStatusIcon: getStatusIcon,
    updateSliderData: updateSliderData,
    getTopStopEvents: getTopStopEvents,
    resetContainerDefault: resetContainerDefault,
    updateSumBar: updateSumBar,
    updateStopEvents: updateStopEvents,
    updateRefStopEvents: updateRefStopEvents,
    machineContainers: machineContainers,
    resetDisplayDefault: resetDisplayDefault,
    getTopRejects: getTopRejects,
    resetMachineContainerDefault: resetMachineContainerDefault,
    VERSION: VERSION,
    sliderUpdateDefferd: sliderUpdateDefferd,
    markerUpdateDefferd: markerUpdateDefferd,
    displayUpdateDefferd: displayUpdateDefferd,
    updateMarker: updateMarker,
    updateShowFilterShift: updateShowFilterShift,
    loadNewTemplate: loadNewTemplate,
    loadNewTemplateMachine: loadNewTemplateMachine,
    getDuration: getDuration,
    handleResponse: handleResponse,
    criticalEventsIds: criticalEventsIds,
    stopEventsIds: stopEventsIds,
    getStructure: getStructure,
    saveStructure: saveStructure,
    updateCompare: updateCompare,
    updateGraphDataExternal: updateGraphDataExternal,
    updateGraphLines: updateGraphLines,
    getTechnicianStatus: getTechnicianStatus,
    getRejectsReasonsByDatesForMachine: getRejectsReasonsByDatesForMachine,
    getDepartmentMachineAggregateData: getDepartmentMachineAggregateData,
    getShiftInsightTitles: getShiftInsightTitles,
    insightsPageData: insightsPageData,
    changeDataLabels: changeDataLabels,
    shiftStates: shiftStates,
    versionChange: versionChange,
    showFilterShiftVar: showFilterShiftVar,
    saveShiftContainer: saveShiftContainer,
    updateMachineAvailabilityAndTheorteically: updateMachineAvailabilityAndTheorteically,
    getMachineJoshData: getMachineJoshData,
    getFormattedDate : getFormattedDate,
    prepareLabel:prepareLabel,
    initMachinePerofrmanceWrapper:initMachinePerofrmanceWrapper,
    initContainersFilterState:initContainersFilterState,
    updateGraphDataWrapper:updateGraphDataWrapper,
  };
});
