var machinePlansDirective = function ($timeout, $filter, googleAnalyticsService, $rootScope, LeaderMESservice) {
  var Template = "views/custom/productionFloor/shiftTab/machinePlans/machinePlans.html";

  var controller = function ($scope, shiftService, LeaderMESservice, $state, commonFunctions) {
    $scope.Machines = shiftService.shiftData.Machines;

    $scope.shiftService = shiftService;
    $scope.shiftData = shiftService.shiftData;
    $scope.sliderData = shiftService.sliderData;
    const startTime = new Date($scope.sliderData.minValue * 60 * 1000);
    const endTime = new Date($scope.sliderData.maxValue * 60 * 1000);
    $scope.updateMarker = shiftService.updateMarker;
    $scope.joshData = {};
    $scope.manyMachine = Object.keys($scope.sliderData.options.ticks).length > 1;
    $scope.resetZoomBtn = false;
    $scope.enableZoomBtn = false;
    $scope.tooltipDisplay = false;
    $scope.displayAllMachines = true;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.shiftsNames = [];
    $scope.shiftsNames = _.map(
      _.sortBy(shiftService.shiftData.data.CurrentShift, (shift) => {
        return new Date(shift.StartTime);
      }),
      "Name"
    );
    $scope.notStop = $filter("translate")("UNCATEGORIZED_STOPS");
    shiftService.getMachineJoshData();
    $scope.getMachineDisplay = function () {
      if (!$scope.machinesToDisplay) {
        $scope.machinesToDisplay = {};
      }
      for (var key in $scope.shiftData.machinesDisplay) {
        if ($scope.shiftData.machinesDisplay[key] == true && $scope.machinesToDisplay[key] === undefined) {
          $scope.machinesToDisplay[key] = true;
        } else if ($scope.shiftData.machinesDisplay[key] === false && $scope.machinesToDisplay[key] !== undefined) {
          delete $scope.machinesToDisplay[key];
        }
      }
    };
    $scope.getMachineDisplay();
    $scope.selectedMachine = function (event, machine) {
      $scope.shiftData.marker.machineID = machine.machineID;
      $scope.shiftData.marker.machineName = machine.machineName;
      event.stopPropagation();
    };
    $scope.removeSelectedMachine = function (event, machine) {
      $scope.shiftData.marker.machineID = null;
      $scope.shiftData.marker.machineName = null;
      event.stopPropagation();
    };
    $scope.resetZoom = function (event) {
      $scope.shiftService.updateSliderData($scope.sliderData.options.floor, $scope.sliderData.options.ceil);
      $scope.resetZoomBtn = false;
      event.stopPropagation();
    };
    $scope.enableZoom = function (event) {
      $scope.enableZoomBtn = !$scope.enableZoomBtn;
    };

    $scope.updateMachinesFilter = function (event) {
      if (event.keyCode == 17) {
        console.log("upadate");
      }
    };
    shiftService.markerUpdateDefferd.promise.then(null, null, function () {
      if ($scope.disableWMarker) {
        return;
      }
      if ($scope.shiftData.marker.value) {
        $scope.outMarker = true;
        $scope.markerValue = $scope.x($scope.shiftData.marker.value.getTime());
      } else {
        $scope.outMarker = false;
      }
    });
    $scope.getMachinejobs = function (ID) {
      return _.find($scope.shiftData.jobData, { Id: ID });
    };

    $scope.filterMachine = function (event, machine) {
      if (event.ctrlKey) {
        event.stopPropagation();
        //shiftService.displayUpdateDefferd.notify();
        return;
      }
      _.forIn($scope.shiftData.machinesDisplay, function (value, key) {
        if (machine.machineID == key) {
          $scope.shiftData.machinesDisplay[key] = true;
        } else {
          $scope.shiftData.machinesDisplay[key] = false;
        }
      });
      // googleAnalyticsService.gaEvent("Department_Shift", 'plan_Choosing_machine');
      event.stopPropagation();
      // shiftService.displayUpdateDefferd.notify();
    };

    shiftService.displayUpdateDefferd.promise.then(null, null, function () {
      $scope.filterMachinesToDisplay(true);
    });

    $scope.filterMachinesToDisplay = function (updateMachines) {
      if (updateMachines) {
        $scope.getMachineDisplay();
      }

      $scope.Machines = _.filter($scope.shiftData.Machines, function (machine) {
        let localMachineFilter = $scope.graph.localMachines.find((localMachine) => localMachine.ID == machine.machineID);
        return $scope.machinesToDisplay[machine.machineID] && localMachineFilter && localMachineFilter.value;
      });

      if ($scope.machinesFilterUpdate) {
        $scope.machinesFilterUpdate();
      }
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);
      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }
      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    $scope.$watch("shiftData.Machines", function () {

      $scope.initFilterMachinesToDisplay();
    });

    $scope.$watchGroup(["options.settings.filterM['machineValue']", "options.settings.filterM['machineId']"], function () {

      $scope.updateMachineDataDisplay("", $scope.options.settings.filterM["machineId"]);
    });

    $scope.$watch("options.settings.filterM['selectAll']", function () {

      $scope.initFilterMachinesToDisplay();
    });
    $scope.$watch("shiftData.machinesDisplay", function () {

      $scope.filterMachinesToDisplay(true);
    });

    $scope.$watch("graph.localMachines", function () {

      $scope.filterMachinesToDisplay(true);
    });

    $scope.initFilterMachinesToDisplay = function () {
        if ($scope.initTimeout) {
          $timeout.cancel($scope.initTimeout);
        }
        $scope.initTimeout = $timeout(function () {
          $scope.filterMachinesToDisplay();
        }, 450);
    };
    $scope.initFilterMachinesToDisplay();
    shiftService.sliderUpdateDefferd.promise.then(null, null, function () {
      if ($scope.sliderData.minValue != $scope.sliderData.options.floor || $scope.sliderData.maxValue != $scope.sliderData.options.ceil) {
        $scope.resetZoomBtn = true;
      } else {
        $scope.resetZoomBtn = false;
      }
      if ($scope.width) {
        $scope.updateDataAndAxis();
      }
    });


    $scope.openMachine = function (machineId) {
      var url = $state.href("appObjectMachineFullView", {
        appObjectName: "MachineScreenEditor",
        ID: machineId,
      });
      window.open(url, "_blank");
    };
    
    $scope.openEvent = function (eventId,eventColor, machineId) {
        if(eventColor !== '#1AA917' && eventColor !== '#F5A623'){
          $scope.successCallback = () => {
            LeaderMESservice.customAPI('GetDepartmentShiftData',{
                "ReqDepartment":[{"MachineIDs":[machineId],
                "ShiftByTime":{
                  "StartTime": moment(startTime).format('YYYY-MM-DD HH:mm:ss'), 
                  "EndTime": moment(endTime).format('YYYY-MM-DD HH:mm:ss')
                },
                "RefShiftDays":0
              }],
              "UseCache":false,
            }).then(response => {
              const department = _.find(response.Departments,{ID: $scope.shiftData.DepartmentID});
              if (department){
                if (department.CurrentShift && department.CurrentShift.length > 0){
                  const machine  = _.find($scope.Machines,{machineID: machineId});
                  if (machine) {
                    let events = [];
                    department.CurrentShift.forEach(shift => {
                      const currentMachine = _.find(shift.Machines,{Id: machineId});
                      if (currentMachine){
                        events = events.concat(currentMachine.Events || []);
                      }
                    });
                    machine.CurrShift.Events = events;
                    $scope.updateDataAndAxis();
                  }
                }
              }       
            });
          }
          commonFunctions.formInModal($scope,'EVENT',1015,eventId);
        }
    };

    $scope.toggleMachines = function () {
      var changed = false;
      $scope.displayAllMachines = $scope.options.settings.filterM["selectAll"];
      if ($scope.displayAllMachines) {
        $scope.Machines = $scope.shiftData.Machines;
      }

      $scope.Machines = _.map($scope.Machines, function (machine) {
        if ($scope.machinesToDisplay[machine.machineID] != $scope.displayAllMachines) {
          changed = true;
        }
        $scope.machinesToDisplay[machine.machineID] = $scope.displayAllMachines;
        return machine;
      });
    };

    $scope.updateMachineDataDisplay = function (event, machineId) {
      $scope.machinesToDisplay[machineId] = !$scope.machinesToDisplay[machineId];
      $scope.initFilterMachinesToDisplay();
    };
  };

  var link = function (scope, element) {
    const MINIMUM_GRAPH_WIDTH = 170; 
    const BOOTSTRAP_PADDING_CONST = 30; 
    const MAGIC_FACTOR = 1; 

    const getWidth = () => {
      scope.container = document.getElementById("machinePlanContainer");
      let containerWidth = scope.container.clientWidth - BOOTSTRAP_PADDING_CONST;
      let MachinesPerRow = Math.floor(containerWidth / MINIMUM_GRAPH_WIDTH);
      let extraSpace = containerWidth % MINIMUM_GRAPH_WIDTH;
      let res = Math.floor(MINIMUM_GRAPH_WIDTH - MAGIC_FACTOR + extraSpace / MachinesPerRow) - 10; 
      scope.calculatedGraphWidth = res;
      return res;
    };

    scope.$watch("options.width", function () {

      $timeout(function () {
        if(scope.graph.graphTypeID == 0 )
        {
          scope.rectSize = element.find("svg")[0].getBoundingClientRect();
          scope.width = scope.rectSize.width - margin.left - margin.right;
          scope.updateDataAndAxis();
        }
        else
        {
          scope.updatePieWrapper();
        }
      });
    });

    scope.$watch("graph.fullScreen", function () {
      $timeout(function () {
        scope.updateDataAndAxis();
        window.dispatchEvent(new Event('resize'));
      });
    });

    scope.$watch("graph.graphTypeID", function () {

      if(scope.graph.graphTypeID == 0 )
      {
        $timeout(function () {
          scope.rectSize = element.find("svg")[0].getBoundingClientRect();
          scope.width = scope.rectSize.width - margin.left - margin.right;
          scope.updateDataAndAxis();
        });
      }
      else
      {
        scope.updatePieWrapper();
      }
    });
    $(window).resize(function () {
      $timeout(function () {
        scope.rectSize = element.find("svg")[0].getBoundingClientRect();
        scope.width = scope.rectSize.width - margin.left - margin.right;
        scope.updateDataAndAxis();
      });
    });
    scope.disableWMarker = false;
    var xTicksValue = [new Date(scope.sliderData.options.floor * 1000 * 60), new Date(scope.sliderData.options.ceil * 1000 * 60)];
    var margin = {
      top: 20,
      bottom: 20,
      left: 60,
      right: 15,
    };
    scope.margin = margin;
    scope.widthWithoutMargin = 700;
    var currentElement = d3.select(element[0]);
    var width = 700 - margin.left - margin.right;
    var height = scope.options.height - margin.top - margin.bottom;
    var tickWPixel = 100;
    var tickNum = Math.floor(width / tickWPixel);
    var selectedRange = null;
    var selectedRect = null;
    var zoomRect = currentElement.select("rect.zoom-rect");
    var zoomArea = currentElement.select("rect.zoom-area");

    var x = d3.time.scale().range([margin.left, width]);
    scope.x = x;
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
    var parseDateLifeCycle = d3.time.format("%d/%m/%Y %H:%M:%S").parse;

    var xAxis = d3.svg.axis().scale(x).orient("top").innerTickSize(-scope.options.height).outerTickSize(0).tickPadding(-20).tickFormat(d3.time.format("%H:%M")).tickValues(xTicksValue);

    var svg = d3
      .select(element[0])
      .select("svg")
      .select("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")");

    var dragStart = function () {
      if (!scope.enableZoomBtn) {
        return;
      }
      googleAnalyticsService.gaEvent("Department_Shift", "plan_zoom");
      var p = d3.mouse(this);
      var clientRect = $(currentElement[0])[0].getBoundingClientRect();
      selectedRange = {
        x: p[0] * $rootScope.scaleAfterZoom + clientRect.x * $rootScope.scaleAfterZoom - clientRect.x,
        y: p[1] * $rootScope.scaleAfterZoom - margin.top,
      };
      zoomRect.attr("height", "100%").attr("width", 0).style("display", "block");
    };
    var dragMove = function () {
      if (!scope.enableZoomBtn) {
        return;
      }
      var p = d3.mouse(this);
      var x = selectedRange.x;
      var clientRect = $(currentElement[0])[0].getBoundingClientRect();

      if (LeaderMESservice.isLanguageRTL()) {
        var mouseX = p[0] * $rootScope.scaleAfterZoom + clientRect.x * $rootScope.scaleAfterZoom - clientRect.x;
      } else {
        var mouseX = p[0] * $rootScope.scaleAfterZoom + clientRect.x * $rootScope.scaleAfterZoom - clientRect.x;
      }

      if (x < margin.left) {
        x = margin.left;
      }
      if (mouseX < margin.left) {
        mouseX = margin.left;
      }
      if (x >= mouseX) {
        zoomRect.attr("x", mouseX);
      } else {
        zoomRect.attr("x", x);
      }
      zoomRect.attr("width", Math.abs(mouseX - x));
    };
    var dragEnd = function () {
      if (!scope.enableZoomBtn) {
        return;
      }
      if (!zoomRect.attr("x")) {
        return;
      }
      var min = Math.floor(x.invert(parseInt(zoomRect.attr("x"))).getTime() / (60 * 1000));
      var max = Math.floor(x.invert(parseInt(zoomRect.attr("x")) + parseFloat(zoomRect.attr("width"))).getTime() / (60 * 1000));
      zoomRect.style("display", "none");
      if (min <= scope.sliderData.options.floor) {
        min = scope.sliderData.options.floor;
      }
      if (max > scope.sliderData.options.ceil) {
        max = scope.sliderData.options.ceil;
      }
      if (min == max) {
        max += 1;
      }
      if (zoomRect.attr("width") < 5) {
        return;
      }
      scope.shiftService.updateSliderData(min, max);
    };
    var dragBehavior = d3.behavior.drag().on("dragstart", dragStart).on("drag", dragMove).on("dragend", dragEnd);

    var zoomArea = currentElement.select("svg.data g rect.zoom-area");
    zoomArea.call(dragBehavior);

    x.domain([new Date(scope.sliderData.options.floor * 1000 * 60), new Date(scope.sliderData.options.ceil * 1000 * 60)]);

    scope.scale = function (date, updateAxis) {
      if (!date) {
        return 0;
      }
      if (updateAxis) {
        var firstDate = scope.sliderData.minValue;
        var lastDate = scope.sliderData.maxValue;
        var endDate = new Date(lastDate * 1000 * 60);
        x.domain([new Date(firstDate * 1000 * 60), endDate]);
        xTicksValue = [new Date(firstDate * 1000 * 60), endDate];
        var tickW = Math.floor((lastDate - firstDate) / tickNum / 5) * 5;
        var innerTicks = _.map(_.range(firstDate - (firstDate % 5), lastDate, tickW), function (date) {
          if (date - firstDate < tickW / 3) {
            return new Date(firstDate * 1000 * 60);
          }
          if (lastDate - date < tickW / 3) {
            return new Date(lastDate * 1000 * 60);
          }
          return new Date(date * 1000 * 60);
        });
        xTicksValue = _.union(xTicksValue, innerTicks);
        xAxis.tickValues(xTicksValue);
        svg.select("g.x.axis").call(xAxis);
      }
      var xValue = x(parseDate(date));
      if (xValue < 0) {
        return 0;
      }
      if (parseDate(date).getTime() > scope.sliderData.maxValue * 1000 * 60) {
        return x(new Date(scope.sliderData.maxValue * 1000 * 60));
      }
      return xValue;
    };
    function updateData() {

        var first = true;
        _.forEach(scope.Machines, function (machine) {
          _.forEach(machine.CurrShift.Plan, function (plan) {
            plan["x1"] = scope.scale(plan.StartTime, first);
            first = false;
            plan["x2"] = scope.scale(plan.EndTime);
          });
          machine.CurrShift.Events = _.sortBy(machine.CurrShift.Events,event => {
            return new Date(event.StartTime);
          });
          if (machine.CurrShift.Events) {
              const events = machine.CurrShift.Events;
              for (let i = 0;i < events.length - 1 ; i++){
                events[i].EndTime = events[i + 1].StartTime;
              }
          }
        
          _.forEach(machine.CurrShift.Events, function (event) {
            event["x1"] = scope.scale(event.StartTime, first);
            first = false;
            event["x2"] = scope.scale(event.EndTime);
          });
          machine.CurrShift.firstCycle = _.map(machine.CurrShift.FirstCycleDateTime, function (value) {
            return scope.scaleForLifeCycle(value);
          });
          machine.CurrShift.lastCycle = _.map(machine.CurrShift.LastCycleDateTime, function (value) {
            return scope.scaleForLifeCycle(value);
          });
        });

        _.forEach(scope.joshData, function (jobData) {
          _.forEach(jobData, function (job) {
            job["x"] = scope.scaleForLifeCycle(job.StartTime);
          });
        });
        //here
        _.forEach(scope.sliderData.options.ticks, function (tick) {
          tick["xIf"] = scope.scaleTime(tick.startShift, true);
          tick["x"] = scope.scaleTime(tick.startShift);
        });
    


    }

    var MachineDataPie = [];
    var totalDuration = 0;
    var startAngle;


    function buildHours(data,startHour,startMinute){
      
      data.unshift({
        name: Date.now(),
        y:startMinute,
        color: "white",
        borderColor: "gray",
        display:false,
        tooltip:false
      })
      data.unshift({
        name: Date.now(),
        y: 0.01,
        hour:startHour > 9 ? startHour+':00' : `0${startHour}:00`,
        display:true,
        tooltip:false
      })
      data[data.length-1].y = data[data.length-1].y-startMinute
      startHour++;
      var sum = 0;
      for(var i = 1 ; i < data.length-1; i++){
        sum+=data[i].y
        while(sum  - 60 >= 0)
        {
          if(sum == 60)
          {
            data.splice(0, i, {
              name: Date.now(),
              y: 0.001,
              hour:startHour > 9 ? startHour+':00' : `0${startHour}:00`,
              display:true,
              tooltip:false
            });
            hour++;
          }
          else
          {
              extra = sum - 60
              sum = sum - 60;

    
            data[i].y = sum;
            data.splice(0, i, {
              name: Date.now(),
              y: 0.001,
              hour:startHour > 9 ? startHour+':00' : `0${startHour}:00`,
              display:true,
              tooltip:false
            });
            data.splice(0, i+2, {
              name: Date.now(),
              y:extra,
              color: data[i].color,
              borderColor: data[i].color.borderColor,
              display:data[i].display,
              tooltip:data[i].tooltip
            });
          }
          sum -=60;  
        }
        sum = 0;
      }
    }


    scope.updatePieData = function() {
      setTimeout(function () {
        _.forEach(scope.Machines, function (machine, num) {
          MachineDataPie = [];
          totalDuration = 0;
          startAngle = null;

        // MachineDataPie = [];
        // _.forEach(scope.Machines, function (machine, num) {
          // for(var i = 0 ;i<12;i++){
          //   MachineDataPie.push({
          //     name: Date.now(),
          //     y:0.0001,
          //     hour:i > 9 ? i+':00' : `0${i}:00`,
          //     display:true,
          //     tooltip:false
          //   });

          //   MachineDataPie.push({
          //         name: Date.now(),
          //         y: 60,
          //         color: "white",
          //         borderColor: "gray",
          //         display:false,
          //         tooltip:false
          //       });
          //   }


          _.forEach(machine.CurrShift.Events, function (event, i) { 
              if(!startAngle){                                  
                  if(moment(event.StartTime).hours() > 12)
                  {             
                    startAngle =  moment.duration(moment(event.StartTime).subtract({hours:12})).asMinutes() * 0.5
                  }
                  else
                  {
                    startAngle = moment.duration(event.StartTime).asMinutes() * 0.5
                  }              
                  startHour = moment(event.StartTime).hours()
                  startMinute = moment(event.StartTime).minutes()
              }
            totalDuration += event.Duration;
            MachineDataPie.push({
              name: event.Name,
              y: event.Duration,
              color: event.Color,
              borderColor: event.Color,
              startTime:event.StartTime,
              eventReason:event.EventReason,
              display:false,
              tooltip:true
            });
          });
          MachineDataPie.push({
            name: Date.now(),
            y: 720 - totalDuration,
            color: "white",
            borderColor: "gray",
            display:false,
            tooltip:false
          });
          
          // buildHours(MachineDataPie,startHour,startMinute)
          Highcharts.chart(`machine-${num}`, {
            chart: {
              type: "pie",
              height: scope.graph.settings ? getWidth():150,
              width: scope.graph.settings ? getWidth():150,
            },
            title: {
              text: `${machine.machineName}`,
              verticalAlign: "bottom",
              useHTML: true,
              align: 'center',
              style: {
                fontSize: "14px",
                fontWeight: "normal",
              },
            },
            tooltip: {
              useHTML: true,
              outside: true,
              style: {
                width: 'unset',
              },
              formatter: function () {
               if(!this.point.tooltip) return
               return `<div style="word-break: normal;text-align: center;">${$filter("date")(this.point.startTime, "dd/MM/yyyy HH:mm:ss")}<br>
               ${$filter("getDurationInHoursMinutes")(this.point.y)}<br>
               ${this.point.eventReason && this.point.eventReason !== "" ? this.point.eventReason : this.point.name}</div>`
              },
            },
            subtitle: {
              verticalAlign: "middle",
              align: "center",     
              text: `${((machine.machineDownDuration / machine.eventsTotalDuration) * 100).toFixed(0)}%`,
              y:2,
            },
            exporting: {
              enabled: false,
            },
            plotOptions: {
              pie: {
                borderWidth: 1,
                innerSize: 35,
                startAngle: startAngle,
              },
            },
            series: [
              {
                name: "",
                colorByPoint: true,
                data: MachineDataPie,
                dataLabels: {
                  enabled: true,
                  distance: '0.5%',
                  connectorWidth: 0,
                  formatter:function(){
                    if(!this.point.display) return
                     return `<span>${this.point.hour}</span>`
                  }
                },
              },
            ],
          });
        });
      });
    // })
  }

  
    scope.scaleForLifeCycle = function (date) {
      if (!date) {
        return -1000;
      }
      var time = parseDateLifeCycle(date).getTime();
      if (time < scope.sliderData.minValue * 60000 || time > scope.sliderData.maxValue * 60000) {
        return -1000;
      }
      return x(parseDateLifeCycle(date));
    };

    scope.scaleTime = function (date, shiftTicks) {
      if (!date) {
        return;
      }
      var xValue = x(new Date(date * 60000));
      if (xValue < margin.left) {
        return shiftTicks ? null : 0;
      }
      if (date > scope.sliderData.maxValue) {
        return shiftTicks ? null : x(new Date(scope.sliderData.maxValue * 1000 * 60));
      }
      return xValue;
    };
    var timeoutPromise = null;
    scope.markerMove = function () {
      scope.disableWMarker = true;
      var p = event.offsetX * $rootScope.scaleAfterZoom - 15;
      if (p < margin.left) {
        p = margin.left;
      }
      scope.markerValue = p;
      $timeout(function () {
        scope.updateMarker(x.invert(scope.markerValue));
      }, 10);
    };
    scope.markerLeave = function () {
      scope.disableWMarker = false;
      $timeout(function () {
        scope.updateMarker(null);
      });
    };

    var tooltip = d3.select(element[0]).select(".machine-plan-tooltip");
    scope.tooltip = function (event, data) {
      scope.tooltipDisplay = true;
      tooltip.style("position", "absolute");
      tooltip.select(".tooltip-start-date").html($filter("date")(data.StartTime, "dd/MM/yyyy HH:mm:ss"));
      tooltip.select(".tooltip-event-duration").html($filter("getDurationInHoursMinutes")(data.Duration));
      tooltip.select(".tooltip-event-type").html(data.EventReason && data.EventReason !== "" ? data.EventReason : data.Name);
    };
    scope.tooltipMove = function (event) {
      tooltip.style("top", event.offsetY * $rootScope.scaleAfterZoom + 10 + "px").style("left", event.offsetX * $rootScope.scaleAfterZoom - 25 + "px");
    };
    scope.tooltipLeave = function () {
      scope.tooltipDisplay = false;
    };

    scope.machinesFilterUpdate = function () {
      if(scope.graph.graphTypeID == 0 )
      {
        scope.updateDataAndAxis();
      }
      else
      {
        scope.updatePieWrapper();
      }
    };
    scope.$watch(
      "shiftData.jobData",
      function (value) {
        if (value) {
          value.forEach(function (machineJobData) {
            scope.joshData[machineJobData.Id] = machineJobData.JobData;
          });
        }
        scope.updateDataAndAxis();
      },
      true
    );
    scope.updateDataAndAxis = function () {
      if (xAxis) {
        xAxis.innerTickSize(-((!scope.graph.fullScreen ? scope.options.height: 2000)));
        tickNum = Math.round(scope.width / tickWPixel);
        x.range([margin.left, scope.width]);
        zoomArea.attr("width", scope.width);
        zoomArea.attr("x", 0);
        svg
          .select(".x.axis") // Add the X Axis
          .call(xAxis);
          updateData();
      }
    };

    scope.updatePieWrapper = function () {
      if (scope.initTimeout) {
        $timeout.cancel(scope.initTimeout);
      }
      scope.initTimeout = $timeout(function () {
        scope.updatePieData();
      }, 350);
    };
  
  };

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph: "=",
    },
    link: link,
    controller: controller,
    controllerAs: "machinePlansCtrl",
  };
};

angular.module("LeaderMESfe").directive("machinePlansDirective", machinePlansDirective);
