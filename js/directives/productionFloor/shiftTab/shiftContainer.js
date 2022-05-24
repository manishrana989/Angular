var shiftContainer = function (LeaderMESservice, $timeout, $localStorage) {
  var Template = "views/custom/productionFloor/shiftTab/shiftContainer.html";
  function controller($scope, shiftService, insightService, $filter, notify,
      $sessionStorage, googleAnalyticsService, LeaderMESservice, $rootScope,OnlineService) {
    var shiftContainerCtrl = this;
    $scope.console = console;
    $scope.$on("addMachinePerformanceSettings", (event, data) => {
      $scope.machinesPerformanceDisplaySettings = data;
      $scope.machinesPerformanceDisplayedKpis = getMachinesPerformanceDisplayedKpis();
      if($scope.graph &&  $scope.graph.options && !$scope.graph.options.displayCircleBy)
      {
        $scope.graph.options.displayCircleBy = 'machine'
      }
      if($scope.graph && $scope.graph.options && !$scope.graph.options.displayTableBy)
      {
        $scope.graph.options.displayTableBy = 'machine'
      }
   
    });
    $scope.loadingInsightContainer = insightService.loadingContainers
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.departmentName = $scope.localLanguage ? "&nbsp-" + $sessionStorage.stateParams.subMenu.SubMenuLName.replace(/ /g, "&nbsp") : $sessionStorage.stateParams.subMenu.SubMenuEName;
    $scope.structureType = 3;
    $scope.exportCSV = {
      value: null,
    };
    if($localStorage.allMachinesFullScreen && $localStorage.allMachinesFullScreen.value)
    {
      shiftContainerCtrlallMachinesFullScreen = {
        value: $localStorage.allMachinesFullScreen.value
      };
    }
    else
    {
      shiftContainerCtrl.allMachinesFullScreen = {
        value: false
      };
    }
    
    var insightsColorArray = ["117", "125", "115", "123", "124", "135", "120", "140", "65", "131", "132", "215", "216", "217"];
    var insightsEventsGroupId = ["126", "136", "100", "117", "116", "125", "123", "115", "134", "124", "135", "133", "97", "215", "216", "217", "207"];
    var insightsHeatMap = ["195","225", "226", "227", "230", "231", "237", "239","246", "247"];
    var insightsCustomization = ["225", "226", "227"];
    var insightKpisHeatMap = ["230", "231"];
    var insightGraded = ["225","226","227","237","239","246"];
    var insightJoshes = ["237", "239"];
    var insightAbsoluteAndTargetHeatMap = ["195","230", "231", "237","246","247"];
    var insightGraphTypes = ["206", "234"];
    var insightGraphTypesBar = ["206", "234"];
    var insightGraphTypeLine = ["206"];
    var insightGraphTypesTable = ["206", "234"];
    var insightGraphAllowTimeType = ["195","247"];
    var insightsReversedColorPerformanceArr = ["246"]
    //for KPIsByShift and KPIsByMachine in shift this for which Kpis to display
    if (
      $localStorage.KPIsForHeatmap && 
      $localStorage.KPIsForHeatmap[$scope.graph.templateV2] && 
      $sessionStorage.produtionFloorTab.selectedTab === "shift") {
        $scope.graph.KPIsForHeatmap = $localStorage.KPIsForHeatmap[$scope.graph.templateV2];
    } else if (
        ($scope.graph?.ID?.toString() && 
          $localStorage.insightStates && 
          $sessionStorage.stateParams.subMenu.SubMenuExtID && 
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] && 
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID?.toString()]?.KPIsForHeatmap && 
          $sessionStorage.produtionFloorTab.selectedTab === "insights") 
        || $sessionStorage.produtionFloorTab.selectedTab === "factoryInsights") {
      $scope.graph.KPIsForHeatmap = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.KPIsForHeatmap;
    } else {
      $scope.graph.KPIsForHeatmap = {
        kpis: [
          {
            id: 0,
            name: "AvailabilityOEE",
            display: true,
          },
          {
            id: 1,
            name: "AvailabilityPE",
            display: true,
          },
          {
            id: 2,
            name: "CycleTimeEfficiency",
            display: true,
          },
          {
            id: 3,
            name: "QualityIndex",
            display: true,
          },
          {
            id: 4,
            name: "OEE",
            display: true,
          },
          {
            id: 6,
            name: "PE",
            display: true,
          },
        ],
      };
    }
    

    var existIninsightStates = function (property) {
      if (
        !$localStorage.insightStates ||
        !$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] ||
        !$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] ||
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()][property] == undefined
      )
        return false;

      return true;
    };
    $scope.machinesPerformanceUpdateHighcharts = () => {
      let currArr = getMachinesPerformanceDisplayedKpis();
      let prevArr = $scope.machinesPerformanceDisplayedKpis;
      let change = false;
      if (currArr.length != prevArr.length) {
        change = true;
      }
      for (let i = 0; i < currArr.length && i < prevArr.length; i++) {
        if (prevArr[i].name !== currArr[i].name) {
          change = true;
          break;
        }
      }
      if (change) {
        $scope.$broadcast("machinesPerformanceUpdateHighcharts", $scope.machinesPerformanceDisplaySettings);
      }
      $scope.machinesPerformanceDisplayedKpis = currArr;
    };

    $scope.machinesPerformanceCanChangeDisplayedKpis = (kpi) => {
      //{name: kpi, display: true/false}
      let displayedKpis = getMachinesPerformanceDisplayedKpis().length;
      let max = $scope.machinesPerformanceDisplaySettings.maxDisplayedKpis;
      let min = $scope.machinesPerformanceDisplaySettings.minDisplayedKpis;
      if (displayedKpis > min && displayedKpis < max) {
        return false;
      }
      if (kpi.display && displayedKpis == max) {
        return false;
      }
      if (displayedKpis == min && !kpi.display) {
        return false;
      }
      return true;
    };

    if ($sessionStorage.onlineDepartmentCollapsed) {
      shiftContainerCtrl.collapseMachine =
          $sessionStorage.onlineDepartmentCollapsed;
  } else {
      shiftContainerCtrl.collapseMachine = {
          value: false
      };
      $sessionStorage.onlineDepartmentCollapsed =
          shiftContainerCtrl.collapseMachine;
  }

    if ($sessionStorage.onlineDepartmentCollapsed) {
      shiftContainerCtrl.collapseMachine =
          $sessionStorage.onlineDepartmentCollapsed;
    } else {
      shiftContainerCtrl.collapseMachine = {
          value: false
      };
      $sessionStorage.onlineDepartmentCollapsed =
          shiftContainerCtrl.collapseMachine;
    }

    $scope.sortedMachines = $sessionStorage.onlineDepartmentCollapsed;

  $scope.toggleScreen = function () {
    shiftContainerCtrl.allMachinesFullScreen.value = !shiftContainerCtrl.allMachinesFullScreen.value;
    $localStorage.allMachinesFullScreen.value =shiftContainerCtrl.allMachinesFullScreen.value;
    $scope.graph.fullScreen = shiftContainerCtrl.allMachinesFullScreen.value
    $scope.minimalize()
  };

    $scope.drawLines = function(){
      let depName = $scope.departmentName;
      if(!$scope.oldView) {
          let cardPrefID = shiftContainerCtrl.collapseMachine.value ? "MCollapsedBox_" : "MExpandedBox_";
          $timeout(function(){
              OnlineService.drawProductionLines($scope.sortedMachines, cardPrefID, depName, 'shift');
          },500);
      }else {
          OnlineService.deleteProductionLines(depName);
      }
    };

    $scope.$watch('oldView',(newVal,oldVal)=>{
      if(newVal!==oldVal){
          $scope.drawLines()
      }
    })

    $scope.minimalize = () => {
      $("body").toggleClass("mini-navbar");
      if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
          $('#side-menu').hide();
          setTimeout(
              function () {
                  $('#side-menu').fadeIn(400);
                  $(window).trigger('resize');
              }, 400);
      } else if ($('body').hasClass('fixed-sidebar')) {
          $('#side-menu').hide();
          setTimeout(
              function () {
                  $('#side-menu').fadeIn(400);
                  $(window).trigger('resize');
              }, 400);
      } else {
          $('#side-menu').removeAttr('style');
          $(window).trigger('resize');
      }
  }

    const getMachinesPerformanceDisplayedKpis = () => {
      return $scope.machinesPerformanceDisplaySettings.availableKpis.filter((kpi) => kpi.display);
    };

    const targetModeValue = (id) =>{
      if(id == '225' || id == '226' || id == '227' || id == '239' || id == '237') return false;
      return true
    }

    $scope.containers.headerPinned = {
      enabled: shiftService?.containers?.headerPinned?.enabled,
    };
    $scope.tab = $sessionStorage.produtionFloorTab.selectedTab;
    $scope.insightsColor = {};
    shiftContainerCtrl.eventGroupSearch = "";
    shiftContainerCtrl.eventSearch = "";
    if ($scope.graph.template == "shiftInsightGraph" || $scope.graph.template == "insightMachineDashboardGraph") {
      $scope.shiftInsightGraph = true;
    }
    var defaults = _.partialRight(_.assign, function (value, other) {
      return _.isUndefined(value) ? other : value;
    });
    var defaultValue = {
      defaultGraph: "pie", // bar or pie
      width: 12,
      disableBar: false,
      disablePie: false,
      disableExport: false,
      height: 500, //500
      maxHeight: 500, //500
      selectedGraph: "pie",
      tableSelected: false,
      printDiv: "shiftContainerGraphPrint",
      header: null,
      disableClose: true,
      disableTable: false,
      rotateBar: false,
      rotateH: false,
      legend: false,
      duplicate: false,
      hideSettings: false,
      sizable: true,
      displayFilter: false,
      editBtn: false,
      enableVisibility: false,
      showAllForLegend: false,
      compareBtn: false,
      tableButton: false,
      isTableView: false,
    };

    shiftContainerCtrl.periodOptions = [
      {
        value: 0,
        text: "NONE",
      },
      {
        value: 1,
        text: "SHIFT",
      },
      {
        value: 2,
        text: "DAY",
      },
      {
        value: 3,
        text: "WEEK",
      },
      {
        value: 4,
        text: "MONTH",
      },
    ];

    $scope.percentageColors = [
      {
        parameterID: 1,
        name: "moreThan",
        text: "PERFORMED_MORE_THAN",
        color: "#1cb919",
        value: 100,
        min: 80,
        showEditable: true,
      },
      {
        parameterID: 2,
        name: "LessThen",
        text: "PERFORMED_LESS_THAN",
        color: "#e01521",
        value: 80,
        min: 0,
        max: 100,
        showEditable: true,
      },
      {
        parameterID: 3,
        name: "else",
        text: "ELSE",
        color: "#ecd21e",
        value: 80,
        showEditable: false,
      },
    ];

    shiftContainerCtrl.insightShiftContainerLoad = function(){
      if ($scope.graph.options.settings.insight) {
        var duplicateID;
        if (!$scope.graph?.ID?.toString().includes("D")) {
          duplicateID = $scope.graph.ID.toString();
        } else {
          duplicateID = $scope.graph.ID.toString().substring(0, $scope.graph.ID.toString().indexOf("D"));
        }
        $scope.changeColorAbility = insightsColorArray.indexOf(duplicateID) > -1;
        $scope.changeHeatMapColorAbility = insightsHeatMap.indexOf(duplicateID) > -1;
        $scope.changeKpisHeatMapAbility = insightKpisHeatMap.indexOf(duplicateID) > -1;
        $scope.changeAbsoluteTargetHeatMapAbility = insightAbsoluteAndTargetHeatMap.indexOf(duplicateID) > -1;
        $scope.allowNumberOfJoshes = insightJoshes.indexOf(duplicateID) > -1;
        $scope.allowGraphTypes = insightGraphTypes.indexOf(duplicateID) > -1;
        $scope.allowGraphTypesTable = insightGraphTypesTable.indexOf(duplicateID) > -1;
        $scope.allowGraphTypesBar = insightGraphTypesBar.indexOf(duplicateID) > -1;
        $scope.allowGraphTypesLine = insightGraphTypeLine.indexOf(duplicateID) > -1;
        $scope.allowCustomization = insightsCustomization.indexOf(duplicateID) > -1;
        $scope.allowColorGraded = insightGraded.indexOf(duplicateID) > -1;
        $scope.allowTimeOption = insightGraphAllowTimeType.indexOf(duplicateID) > -1;
        $scope.insightsReversedColorPerformance = {
          value: insightsReversedColorPerformanceArr.indexOf(duplicateID) > -1
        }
        $scope.showOptions = {
          changeKpisHeatMapAbility: $scope.changeKpisHeatMapAbility,
          changeAbsoluteTargetHeatMapAbility: $scope.changeAbsoluteTargetHeatMapAbility,
          changeHeatMapColorAbility: $scope.changeHeatMapColorAbility,
          changeColorAbility: $scope.changeColorAbility,
          allowGraphTypes: $scope.allowGraphTypes,
          allowGraphTypesTable: $scope.allowGraphTypesTable,
          allowGraphTypesBar: $scope.allowGraphTypesBar,
          allowGraphTypesLine: $scope.allowGraphTypesLine,
          allowCustomization: $scope.allowCustomization,
          allowColorGraded: $scope.graph.template == "machinesLoadGraph" ||  $scope.graph.template == "unitsProducedTheoretically" || $scope.graph.template == "machinesLoadBarGraph" || $scope.allowColorGraded,
          allowTimeOption:$scope.allowTimeOption,
          allowNumberOfJoshes: $scope.allowNumberOfJoshes,
          allowTarget:true,
        };
          
        if ($scope.changeHeatMapColorAbility) {
          if (existIninsightStates("targetMode")) {
            $scope.graph.options.settings.targetMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.targetMode;
          } else {
            $scope.graph.options.settings.targetMode = targetModeValue(duplicateID) ? true : false;
          }
          if (existIninsightStates("colorMode")) {
            $scope.graph.options.settings.colorMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.colorMode;
          } else {
            $scope.graph.options.settings.colorMode = true;
          }
          if (existIninsightStates("gradedMode")) {
            $scope.graph.options.settings.gradedMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.gradedMode;
          } else {
            $scope.graph.options.settings.gradedMode = true ;
          }
          if (existIninsightStates("customization")) {
            $scope.graph.options.settings.customization = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.customization;
          } else {
            $scope.graph.options.settings.customization = 'values';
          }
          
          if ($scope.changeKpisHeatMapAbility) {
            //karma
            if (existIninsightStates("percentageChoice")) {
              $scope.graph.options.settings.percentageChoice = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.percentageChoice;
            } else {
              $scope.graph.options.settings.percentageChoice = "absolute";
            }
          }
        }
        

        $scope.insightsColorShades = angular.copy(insightService.insightsColorShades[$sessionStorage.stateParams.subMenu.SubMenuExtID]);
        $scope.graph.localMachineFirstTime =true;
        $scope.globalMachines = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].globalMachines;
        $scope.localMachines = angular.copy($scope.graph.localMachines || [])
        $scope.shiftMachines = $scope.shiftData.Machines;
      }
          
      $scope.navModelOpen = insightService.navModelOpen;
      if ($scope.insightPage) {
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].endLine) {
          $scope.graph.options.settings.insight.endLine = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].endLine;
        }
      }
      if ($sessionStorage.insightsPageData && !($sessionStorage.produtionFloorTab.selectedTab == "insights" || $sessionStorage.produtionFloorTab.selectedTab == "factoryInsights")) {
        shiftContainerCtrl.dataLabelEnable = $sessionStorage.insightsPageData[$sessionStorage.produtionFloorTab.selectedTab].dataLabelEnable;
      } else {
        shiftContainerCtrl.dataLabelEnable = true;
      }

    }

    $scope.shiftPercentageColors = angular.copy($scope.percentageColors);
    $scope.insightsPercentageColors = angular.copy($scope.percentageColors);
    if ($localStorage.MachineLoadColor == undefined) {
      $localStorage.MachineLoadColor = true;
    }

    // $scope.shiftPercentageColors.colorMode = $localStorage.MachineLoadColor;

    $scope.shiftPercentageColors.gradedMode = $localStorage.MachineLoadGarded == undefined ? true : $localStorage.MachineLoadGarded;
    $scope.insightLoading = false;
    $scope.shiftLoading = false;
    $scope.graph.change = 0;
    $scope.insightPage = $sessionStorage.produtionFloorTab.selectedTab === "insights" || $sessionStorage.produtionFloorTab.selectedTab === "factoryInsights";
    $scope.shiftPage = $sessionStorage.produtionFloorTab.selectedTab === "shift";
    if ($scope.insightPage) {
      $scope.insightData = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID];
      if ($scope.graph.ID && !$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]) {
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] = {};
      }
    }

    $scope.slider = shiftService.sliderData;
    $scope.shiftData = shiftService.shiftData;
    $scope.shiftPeriod = shiftService.period;    
    $scope.showLegendMenu = false;
    $scope.numberOfMachines = {};
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.numberOfMachines.value = $scope.shiftData.data && $scope.shiftData.data.CurrentShift[0].Machines.length ? $scope.shiftData.data.CurrentShift[0].Machines.length : 0;
    defaults($scope.graph.options, defaultValue);
    $scope.containerOptions = $scope.graph.options;

    $scope.temp = angular.copy($scope.containerOptions.settings);
    if ($scope.containerOptions.settings && $scope.containerOptions.settings.PConfigID) {
      $scope.containerOptions.settings.PConfigID = 0;
    }

    if ($scope.graph.template == "machinePlanGraph") {
      $scope.showOptions = {
        allowGraphTypes: true,
        allowGraphTypesBar: true,
        allowGraphTypesPie: true,
      };
      if (!$scope.graph.graphTypeID) {
        $scope.graph.graphTypeID = 0;
      }
    }
    $timeout(function(){
        shiftContainerCtrl.insightShiftContainerLoad()
    })
     

    shiftContainerCtrl.chosenPeriod = _.find(shiftContainerCtrl.periodOptions, {
      value: $scope.containerOptions.DatePart,
    });

    $scope.getStructure = shiftService.getStructure;
    $scope.saveStructure = shiftService.saveStructure;

    $scope.changeDataLabels = function () {
      shiftService.changeDataLabels(shiftContainerCtrl.dataLabelEnable);
    };

    

    var updateCompareLabel = function () {
      switch ($scope.containerOptions.settings.compareWith) {
        case "none":
          $scope.containerOptions.settings.compareLabel = "NIL";
          break;
        case "prevDay":
          $scope.containerOptions.settings.compareLabel = "PREVIOUS_DAY";
          break;
        case "prevWeek":
          $scope.containerOptions.settings.compareLabel = "PREVIOUS_WEEK";
          break;
        case "prevMonth":
          $scope.containerOptions.settings.compareLabel = "PREVIOUS_MONTH";
          break;
      }
    };
    updateCompareLabel();
    var getGraphPre = function () {
      switch ($scope.graph.template) {
        case "timeGraph":
          return "main_graph_";
        case "machinePlanGraph":
          return "plan_";
        case "PEGraph":
          return "graph_";
        case "stopEventsGraph":
          return "distribution_";
        case "machinesLoadGraph":
          return "load_";
        case "unitsProducedTheoretically":
            return "load_";
        case "topStopEventsGraph":
          return "Stop_event_";
        case "topRejectsGraph":
          return "reject_";
        case "unitsProducedGraph":
          return "units_";
      }
    };
    var GAGraph = getGraphPre();
    $scope.GAupdate = function (event) {
      if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
        googleAnalyticsService.gaEvent("Department_Insights", GAGraph + event);
      } else {
        if ($sessionStorage.produtionFloorTab.selectedTab == "insights") {
          googleAnalyticsService.gaEvent("Department_Factory_Insights", GAGraph + event);
        } else {
          googleAnalyticsService.gaEvent("Department_Shift", GAGraph + event);
        }
      }
    };

    $scope.showAll = function () {
      if ($scope.graph.options.showAllForLegend) {
        _.forIn($scope.graph.options.settings.machinesLegend, function (value, key) {
          $scope.graph.options.settings.machinesLegend[key] = true;
        });
      } else {
        var changed = false;
        _.forIn($scope.shiftData.machinesDisplay, function (value, key) {
          if (!$scope.shiftData.machinesDisplay[key]) {
            changed = true;
          }
        });
        if (changed) {
          shiftService.displayUpdateDefferd.notify();
        }
      }
    };

    $scope.duplicate = function () {
      var newGraph = angular.copy($scope.graph);
      if ($scope.insightPage) {
        var max = 1;
        for (const id in $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
          if (!newGraph.ID.includes("D")) {
            var boolean = id.includes(newGraph.ID + "D");
          } else {
            var boolean = id.includes(newGraph.ID.substring(0, newGraph.ID.indexOf("D") + 1));
          }
          if (boolean) {
            if (max < +id[id.indexOf("D") + 1] + 1) {
              max = +id[id.indexOf("D") + 1] + 1;
            }
          }
        }
        if (newGraph.ID.indexOf("D") == -1) {
          newGraph.ID = newGraph.ID + "D" + max;
        } else {
          newGraph.ID = newGraph.ID.substring(0, newGraph.ID.indexOf("D") + 1) + max;
        }
        newGraph.options.settings.insight.ID = newGraph.ID;

        var index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, $scope.graph);
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.splice(index + 1, 0, newGraph);
        shiftContainerCtrl.showSettings = false;
        $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][newGraph.ID] = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID]);
      } else {
        var max = 1;
        _.forEach($scope.containers.data, function (graph) {
          if (!newGraph.ID.includes("D")) {
            var boolean = graph.ID.includes(newGraph.ID + "D");
          } else {
            var boolean = graph.ID.includes(newGraph.ID.substring(0, newGraph.ID.indexOf("D") + 1));
          }
          if (boolean) {
            if (max < +graph.ID[graph.ID.indexOf("D") + 1] + 1) {
              max = +graph.ID[graph.ID.indexOf("D") + 1] + 1;
            }
          }
        });

        if (newGraph.ID.indexOf("D") == -1) {
          newGraph.ID = newGraph.ID + "D" + max;
        } else {
          newGraph.ID = newGraph.ID.substring(0, newGraph.ID.indexOf("D") + 1) + max;
        }

        var index = _.findIndex($scope.containers.data, { ID: $scope.graph.ID });
        // newGraph["clone"] = true;
        newGraph.localMachines = angular.copy($scope.containers.data[index].localMachines);
        $scope.containers.data.splice(index + 1, 0, newGraph);

        shiftContainerCtrl.showSettings = false;
      }
    };
    $scope.closeGraph = function () {
      if ($scope.graph["clone"]) {
        if ($scope.containers && $scope.containers.data) {
          _.remove($scope.containers.data, function (n) {
            return n === $scope.graph;
          });
        }
        if ($sessionStorage.insightData && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container) {
          _.remove($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, function (n) {
            return n === $scope.graph;
          });
          $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
        }
      } else {
        $scope.graph.options.display = false;
      }
      shiftService.updateGraphLines();
    };

    $scope.sizes = [
      {
        value: 4,
        img: "small",
        width: "1.250vw",
        height: "0.938vw",
        label: $filter("translate")("SMALL"),
      },
      {
        value: 6,
        img: "medium",
        label: $filter("translate")("MEDIUM"),
        width: "2.34vw",
        height: "2.344vw",
      },
      {
        value: 12,
        img: "large",
        label: $filter("translate")("LARGE"),
        width: "3.229vw",
        height: "1.042vw",
      },
    ];

    $scope.piesArray = [
      {
        name: "x1",
        srcActive: "images/pie1x.png",
        srcInactive: "images/pie.png",
        src: "images/pie.png",
        scale: 0.5,
        clicked: false,
        size: "1.042vw",
      },
      {
        name: "x2",
        srcActive: "images/pie2x.png",
        srcInactive: "images/pie@2x.png",
        src: "images/pie2x.png",
        scale: 1,
        clicked: true,
        size: "1.875vw",
        height: "29.167vw",
      },
      {
        name: "x3",
        srcActive: "images/pie3x.png",
        srcInactive: "images/pie@3x.png",
        src: "images/pie@3x.png",
        scale: 1.5,
        clicked: false,
        size: "2.396vw",
        height: "29.167vw",
      },
    ];
    if ($scope.containerOptions && $scope.containerOptions.settings && $scope.containerOptions.settings.scale) {
      var activePieFound = _.find($scope.piesArray, {
        scale: $scope.containerOptions.settings.scale,
      });
      if (activePieFound) {
        $scope.activePie = activePieFound.name;
      } else {
        $scope.activePie = "x2";
      }
    } else {
      $scope.containerOptions.settings.scale = 1;
      $scope.activePie = "x2";
    }
    $sessionStorage.activePie = $scope.activePie;

    $scope.saveSelection = function (target) {
      $scope.piesArray.forEach(function (pie) {
        if (pie.name == target.target.id) {
          pie.clicked = true;
          pie.src = pie.srcActive;
        } else {
          pie.clicked = false;
          pie.src = pie.srcInactive;
        }
      });
    };

    $scope.$on("NumberOfSetupsActivate", (numberOfSetupsActivate, isActive) => {
        $scope.showOptions.allowTarget = isActive
    })
    $scope.$on("reverseColorPerformance", (reverseColorPerformance, isActive) => {
      $scope.insightsReversedColorPerformance.value = isActive
    })

    $scope.$on("events", (event, response) => {
      $scope.insightResponse = response;
      if (_.isEmpty($scope.insightResponse.Body)) {
        $scope.filteredEventsGroup = [];
        $scope.filteredEvents = [];
        $scope.filteredEventsType = [];
        shiftContainerCtrl.eventGroupValue = false;
        shiftContainerCtrl.eventsValue = false;
        shiftContainerCtrl.eventsTypeValue = false;
        return;
      }
      var flagEvent = true,
        flagEventGroup = true,
        flagEventType = true;
      if (
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] &&
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent &&
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data &&
        !_.isEmpty($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventGroup) &&
        !_.isEmpty($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventGroup) &&
        !_.isEmpty($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventType)
      ) {
        var found;
        _.forEach($scope.insightResponse.EventGroupFilter, function (eventGroup) {
          found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventGroup, {
            EventGroup: eventGroup.EventGroup,
          });
          if (found) {
            eventGroup.value = found.value;
          } else {
            eventGroup.value = true;
          }
        });
        _.forEach($scope.insightResponse.EventFilter, function (event) {
          found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.Event, {
            Event: event.Event,
          });
          if (found) {
            event.value = found.value;
          } else {
            event.value = true;
          }
        });

        _.forEach($scope.insightResponse.EventTypeFilter, function (eventType) {
          found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventType, {
            EventType: eventType.EventType,
          });
          if (found) {
            eventType.value = found.value;
          } else {
            eventType.value = true;
          }
        });

        _.forEach($scope.filteredEventsGroup, function (eventGroup) {
          if (!eventGroup.value) flagEventGroup = false;
        });
        _.forEach($scope.filteredEvents, function (eventGroup) {
          if (!eventGroup.value) flagEvent = false;
        });
        _.forEach($scope.filteredEventsType, function (eventType) {
          if (!eventType.value) flagEventType = false;
        });
      } else {
        $scope.insightResponse.EventGroupFilter = _.map($scope.insightResponse.EventGroupFilter, function (eventGroup) {
          eventGroup.value = true;
          return eventGroup;
        });
        $scope.insightResponse.EventFilter = _.map($scope.insightResponse.EventFilter, function (event) {
          event.value = true;
          return event;
        });

        $scope.insightResponse.EventTypeFilter = _.map($scope.insightResponse.EventTypeFilter, function (eventType) {
          eventType.value = true;
          return eventType;
        });
      }
      $scope.filteredEventsGroup = angular.copy($scope.insightResponse.EventGroupFilter);
      $scope.filteredEvents = angular.copy($scope.insightResponse.EventFilter);
      $scope.filteredEventsType = angular.copy($scope.insightResponse.EventTypeFilter);
      shiftContainerCtrl.eventGroupValue = flagEventGroup;
      shiftContainerCtrl.eventsValue = flagEvent;
      shiftContainerCtrl.eventsTypeValue = flagEventType;
      $scope.updateEventFilters();
    });


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

    $scope.$on("insightLoading", (event, insightLoading) => {
      $scope.insightLoading = insightLoading;
    });

    $scope.$on("shiftLoading", (event, shiftLoading) => {
      $scope.shiftLoading = shiftLoading;
    });
    $scope.changeContainerScroller = true;
    $scope.$on("changeContainerScroller", function (event, boolean) {
      //change container scroller, true =  scroller , false without scroller
      $scope.changeContainerScroller = boolean;
    });

    $scope.save = function () {
      $scope.containerOptions.settings = _.merge($scope.containerOptions.settings, $scope.temp);
      shiftContainerCtrl.showSettings = false;
    };
    $scope.reset = function () {
      $scope.temp = angular.copy($scope.containerOptions.settings);
    };

    $scope.changeSize = function (settings) {
      $scope.piesArray.forEach(function (pie) {
        if (pie.clicked) {
          $scope.activePie = pie.name;
          $sessionStorage.activePie = $scope.activePie;
          settings.scale = pie.scale;
        }
      });
      shiftContainerCtrl.showSettings = false;
    };

    $scope.resetPie = function () {
      $scope.piesArray.forEach(function (pie) {
        if ($scope.activePie == pie.name) {
          pie.src = pie.srcActive;
        } else {
          pie.src = pie.srcInactive;
        }
      });
    };

    $scope.openFilter = function (type = "insight") {
      if (type == "shift") {
        if (!$scope.shiftLoading) {
          $scope.shiftContainerCtrl.showFilterShift = !$scope.shiftContainerCtrl.showFilterShift;
        }
      } else {
        if (!$scope.insightLoading) {
          $scope.resetFilter();
          $scope.shiftContainerCtrl.showFilterInsights = !$scope.shiftContainerCtrl.showFilterInsights;
        }
      }
    };

    $scope.openSettings = function () {
      if (!$scope.insightLoading) {
        $scope.GAupdate("Settings");
        $scope.shiftContainerCtrl.showSettingsInsights = !$scope.shiftContainerCtrl.showSettingsInsights;
      }
    };

    $scope.updateSelectAll = function (flag, obj) {
      _.forIn(obj, function (value, key) {
        obj[key] = flag;
      });
    };

    $scope.updateCompare = shiftService.updateCompare;
    if ($scope.containerOptions.settings && $scope.containerOptions.settings.compareWith) {
      if ($scope.containerOptions.settings.compareWith != $scope.shiftData.compareWith) {
        $scope.updateCompare($scope.containerOptions.settings.compareWith);
      }
    }

    $scope.saveStructureAux = function () {
      $scope.saveStructure($scope.shiftData, 3, true);
    };

    shiftContainerCtrl.updateGraphPeriod = function (period) {
      $scope.containerOptions.DatePart = period.value;
      shiftContainerCtrl.chosenPeriod = period;
      shiftService.updateGraphDataExternal(period.value);
    };

    $scope.hoverIn = function () {
      this.showTitle = true;
    };

    $scope.hoverOut = function () {
      if ($scope.containers.headerPinned.enabled == false) {
        this.showTitle = false;
      }
    };
    $scope.resizeCallback = function (height) {
      $scope.containerOptions.maxHeight = height;
      $scope.containerOptions.height = height;
    };
    $scope.updateEventFilters = function () {
      if ($scope.graph.options.settings.insight.InsightGroupID == 5 || $scope.graph.options.settings.insight.InsightGroupID == 10) {
        var obj = {
          ID: $scope.graph.options.settings.insight.ID,
          data: angular.copy({
            Event: $scope.insightResponse?.EventFilter,
            EventGroup: $scope.insightResponse?.EventGroupFilter,
            EventType: $scope.insightResponse?.EventTypeFilter,
          }),
        };
        if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]) {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] = {};
        }
        if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent) {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent = {};
        }
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent = angular.copy(obj);
      }
    };

    $scope.resetFilter = function () {
      var duplicateID;
      if (!$scope.graph.ID.toString().includes("D")) {
        duplicateID = $scope.graph.ID.toString();
      } else {
        duplicateID = $scope.graph.ID.toString().substring(0, $scope.graph.ID.toString().indexOf("D"));
      }

      if (insightsEventsGroupId.includes(duplicateID)) {
        shiftContainerCtrl.eventGroupSearch = "";
        shiftContainerCtrl.eventSearch = "";
        shiftContainerCtrl.eventsTypeSearch = "";
        if (
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] &&
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent &&
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data
        ) {
          $scope.filteredEvents = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.Event);
          $scope.filteredEventsGroup = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventGroup);
          $scope.filteredEventsType = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventType);
          $scope.insightResponse.EventFilter = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.Event);
          $scope.insightResponse.EventGroupFilter = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventGroup);
          $scope.insightResponse.EventTypeFilter = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterEvent.data.EventType);
        }
        shiftContainerCtrl.eventGroupToggledInsightSettings = false;
        shiftContainerCtrl.eventToggledInsightSettings = false;
        shiftContainerCtrl.eventTypeToggledInsightSettings = true;
      }
    };

    $scope.searchGroupEvents = function (searchText) {
      $scope.filteredEventsGroup = angular.copy($scope.insightResponse.EventGroupFilter);
      $scope.filteredEventsGroup = _.filter($scope.filteredEventsGroup, function (data) {
        if (data.GroupName.toString().toLowerCase().startsWith(searchText.toLowerCase())) {
          return true;
        } else {
          return false;
        }
      });
    };

    $scope.searchEvents = function (searchText) {
      $scope.filteredEvents = angular.copy($scope.insightResponse.EventFilter);
      $scope.filteredEvents = _.filter($scope.filteredEvents, function (data) {
        if (data.EventName.toString().toLowerCase().startsWith(searchText.toLowerCase())) {
          return true;
        } else {
          return false;
        }
      });
    };

    $scope.selectSingleEvent = function (event, type) {
      if (type == "events") {
        _.find($scope.insightResponse.EventFilter, { Event: event.Event }).value = event.value;
      }
      if (type == "eventsGroup") {
        _.find($scope.insightResponse.EventGroupFilter, { EventGroup: event.EventGroup }).value = event.value;
      }
      if (type == "eventsType") {
        _.find($scope.insightResponse.EventTypeFilter, { EventType: event.EventType }).value = event.value;
      }
    };

    $scope.searchEventsType = function (searchText) {
      $scope.filteredEventsType = angular.copy($scope.insightResponse.EventTypeFilter);
      $scope.filteredEventsType = _.filter($scope.filteredEventsType, function (data) {
        if (data.TypeName.toString().toLowerCase().startsWith(searchText.toLowerCase())) {
          return true;
        } else {
          return false;
        }
      });
    };

    $scope.changeInsightColor = function () {
      insightService.changeInsightsColor($scope.insightsColorShades);
    };
    $scope.saveMachineLoadColorOption = function () {
      $localStorage.MachineLoadColor = $scope.shiftPercentageColors.colorMode;
    };
    // $scope.saveMachineLoadGardedOption = function () {
    //   $localStorage.MachineLoadGarded = $scope.shiftPercentageColors.gradedMode;
    // };
    $scope.saveMachineLoadTargetOption = function () {
      $localStorage.MachineLoadTarget = $scope.shiftPercentageColors.targetdMode;
    };
    $scope.saveKPIsOptionShift = function () {
      if (!$localStorage.KPIsForHeatmap) {
        $localStorage.KPIsForHeatmap = {};
      }
      $localStorage.KPIsForHeatmap[$scope.graph.templateV2] = $scope.graph.KPIsForHeatmap;
    };

    $scope.savetargetModeShiftHeatMap = function () {
      if (!$localStorage.targetModeShiftHeatMap) {
        $localStorage.targetModeShiftHeatMap = {};
      }
      $localStorage.targetModeShiftHeatMap[$scope.graph.templateV2] = $scope.graph.options.settings.targetMode;
    };

    $scope.saveColorModeShiftHeatMap = function () {
      if (!$localStorage.colorModeShiftHeatMap) {
        $localStorage.colorModeShiftHeatMap = {};
      }
      $localStorage.colorModeShiftHeatMap[$scope.graph.templateV2] = $scope.graph.options.settings.colorMode;
    };

    shiftContainerCtrl.saveKPIsOptionInishgts = function () {
      if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].KPIsForHeatmap) {
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].KPIsForHeatmap = {};
      }
      $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].KPIsForHeatmap = $scope.graph.KPIsForHeatmap;
    };
    $scope.applyFilter = function () {
      const values = _.countBy($scope.localMachines,'value');
      if (!values.true){
        notify({
            message: $filter('translate')('ERROR_PLEASE_SELECT_AT_LEAST_ONE_MACHINE'),
            classes: 'alert-danger',
            templateUrl: 'views/common/notify.html'
        });
        return;
      }
      shiftService.containers.toggle = !shiftService.containers.toggle;
      $scope.graph.isFiltered = false;
      _.forEach($scope.localMachines, function (machine) {
        if (machine.value == false) $scope.graph.isFiltered = true;
      });

      _.forEach($scope.filteredEvents, function (events) {
        if (events.value == false) $scope.graph.isFiltered = true;
      });
      _.forEach($scope.filteredEventsGroup, function (eventsGroup) {
        if (eventsGroup.value == false) $scope.graph.isFiltered = true;
      });
      _.forEach($scope.filteredEventsType, function (eventsType) {
        if (eventsType.value == false) $scope.graph.isFiltered = true;
      });

      if ($scope.insightPage) {
        $scope.updateEventFilters();
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterMachine = angular.copy($scope.localMachines);
      }

      if (!$scope.graph.firstTime) {
        $scope.graph.localMachines = angular.copy($scope.localMachines);
      }

      $scope.graph.firstTime = false;
      $scope.graph.change++;
    };

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

    $scope.resizeCallback = function (height) {
      $scope.containerOptions.maxHeight = height;
      $scope.containerOptions.height = height;
      shiftService.displayUpdateDefferd.promise.then(null, null, function () {
        $scope.filterMachinesToDisplay(true);
      });
    };
    $scope.updateMachineDataDisplay = function (event, machineId) {
      $scope.machinesToDisplay[machineId] = !$scope.machinesToDisplay[machineId];
      $scope.graph.options.settings.filterM["machineId"] = machineId;
      $scope.graph.options.settings.filterM["machineValue"] = $scope.machinesToDisplay[machineId];
      $scope.filterMachinesToDisplay();
    };

    $scope.changeModelValue = function () {
      shiftContainerCtrl.showSettings = !shiftContainerCtrl.showSettings;
    };

    $scope.filterMachinesToDisplay = function (updateMachines) {
      if (updateMachines) {
        $scope.getMachineDisplay();
      }
    };

    $scope.changeEndLine = function () {
      $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].endLine = $scope.graph.options.settings.insight.endLine;

      $scope.graph.isFiltered = $scope.graph.options.settings.insight.endLine;
    };

    $scope.$watch("navModelOpen.value", function () {
      if (shiftContainerCtrl.showSettings && $scope.navModelOpen.value) {
        shiftContainerCtrl.showSettings = !shiftContainerCtrl.showSettings;
      }
    });
    
    // $scope.$watch("loadingInsightContainer.value", function () {
    //   if($scope.loadingInsightContainer.value == false)
    //   {
    //     $scope.initInsight()
    //   }    
    // });


    // $scope.initInsight = function () {
    //   if ($scope.initTimeout) {
    //     $timeout.cancel($scope.initTimeout);
    //   }
    //   $scope.initTimeout = $timeout(function () {       
    //     shiftContainerCtrl.insightShiftContainerLoad()
    //   },100);
    // };

    $scope.$watch(
      "shiftData.machinesDisplay",
      function () {
        if (!$scope.shiftData.Machines) {
          return;
        }
        if (!$scope.localMachines || $scope.localMachines.length == 0) {
          $scope.localMachines = [];
        }

        if (!$scope.graph.localMachines || $scope.graph.localMachines.length == 0) {
          $scope.graph.localMachines = [];
        }
        let needToChangeIsFiltered = true;
        $scope.shiftData.Machines.forEach((temp) => {
          let localMachineIndex = $scope.localMachines.findIndex((element) => element.ID == temp.machineID);
          let innerMachineIndex = $scope.graph.localMachines.findIndex((element) => element.ID == temp.machineID);

          //handle if main machine filter is checked
          if ($scope.shiftData.machinesDisplay[temp.machineID]) {
            // handle if local machine filter dont contain machine

            let machineToAdd = {};
            machineToAdd.ID = temp.machineID;
            machineToAdd.MachineName = temp.machineName;
            machineToAdd.MachineLName = temp.machineName;
            machineToAdd.LineID = -1;
            machineToAdd.LineName = "";
            machineToAdd.MachineGroupID = 0;
            machineToAdd.MachineGroupName = "";
            machineToAdd.MachineGroupLName = "";
            if (innerMachineIndex === -1) {
              machineToAdd.value = true;
            } else {
              machineToAdd.value = $scope.graph.localMachines[innerMachineIndex].value;
            }

            if (localMachineIndex == -1) {
              $scope.localMachines.push(Object.assign({}, machineToAdd));
            }

            if (innerMachineIndex == -1) {
              $scope.graph.localMachines.push(Object.assign({}, machineToAdd));
            }
            if (!machineToAdd.value) {
              needToChangeIsFiltered = false;
            }
          }
          //machine is not checked in main filter, need to check if in local and remove it
          else {
            //found machine in local filter
            if (localMachineIndex > -1) {              
              $scope.localMachines.splice(localMachineIndex, 1);
            }

            if (innerMachineIndex > -1) {              
              $scope.graph.localMachines.splice(innerMachineIndex, 1);
            }
          }
        });

        if (!needToChangeIsFiltered) {
          $scope.graph.isFiltered = true;
        }
      },
      true
    );
    //check if isFilter is true or false by checking machines,event,eventGroup,eventType
    $scope.checkIsFiltered = function () {
      $scope.graph.isFiltered = false;
      _.forEach($scope.localMachines, function (machine) {
        if (machine?.value == false) $scope.graph.isFiltered = true;
      });
      _.forEach($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.filterEvent?.data?.Event, function (events) {
        if (events?.value == false) $scope.graph.isFiltered = true;
      });
      _.forEach($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.filterEvent?.data?.EventGroup, function (eventsGroup) {
        if (eventsGroup?.value == false) $scope.graph.isFiltered = true;
      });
      _.forEach($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()]?.filterEvent?.data?.EventType, function (eventsType) {
        if (eventsType?.value == false) $scope.graph.isFiltered = true;
      });
      if ($scope.graph?.options?.settings?.insight?.endLine) {
        $scope.graph.isFiltered = true;
      }
    };  

    $scope.$watchGroup(
      ["globalMachines.machines", "graph.globalMachineChange"],
      function (newValue, oldValue) {
        
        if (!$scope.globalMachines ) {
          return;
        }
        if($scope.graph.localMachineFirstTime && $scope.graph.localMachines && $scope.graph.localMachines.length > 0){
          $scope.graph.localMachineFirstTime = false;
          return
        }
        
        $scope.localMachines = [];
        $scope.graph.localMachines = [];
        $scope.globalMachines.machines.forEach((temp) => {
          if (temp.value) {
            $scope.localMachines.push(Object.assign({}, temp));
            $scope.graph.localMachines.push(Object.assign({}, temp));
          }
        });
        
        if (JSON.stringify(newValue) == JSON.stringify(oldValue) || (newValue && newValue[1] != oldValue[1] && oldValue)) {
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterMachine) {
            $scope.localMachines = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterMachine);
            $scope.graph.localMachines = angular.copy($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterMachine);
          }
        }
        //change isFilter to True or False depend if its filtered or not
        $scope.checkIsFiltered();
      },
      true
    );
    $scope.$watch(
      "graph.localMachinesChange",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
          return;
        }
        
        _.forEach($scope.localMachines, function (machine) {
          machine.value = true;
        });
        $scope.machinesValue = true;
        $scope.graph.localMachines = angular.copy($scope.localMachines);
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph.ID.toString()].filterMachine = angular.copy($scope.graph.localMachines);
      },
      true
    );


    $scope.$watch(
      "graph.eventsChange",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
          return;
        }

        _.forEach($scope.insightResponse.EventFilter, function (event) {
          event.value = true;
        });
        shiftContainerCtrl.eventsValue = true;        
        $scope.updateEventFilters();
      },
      true
    );
    $scope.$watch(
      "graph.eventGroupChange",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
          return;
        }

        _.forEach($scope.insightResponse.EventGroupFilter, function (eventGroup) {
          eventGroup.value = true;
        });
        shiftContainerCtrl.eventGroupValue = true;
        $scope.updateEventFilters();
      },
      true
    );

    $scope.$watch(
      "graph.eventTypeChange",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) == JSON.stringify(oldValue)) {
          return;
        }
        _.forEach($scope.insightResponse.EventTypeFilter, function (eventType) {
          eventType.value = true;
        });
        $scope.filteredEventsType = angular.copy($scope.insightResponse.EventTypeFilter);
        shiftContainerCtrl.eventsTypeValue = true;
        $scope.updateEventFilters();
      },
      true
    );

    $scope.selectUnSelectAll = function (data, value) {
      $scope.localMachines.forEach((temp) => {
        temp.value = value;
      });
    };

    $scope.selectUnSelectAllEvents = function (data, value) {
      $scope.filteredEvents.forEach((temp) => {
        temp.value = value;
      });
      $scope.insightResponse.EventFilter = angular.copy($scope.filteredEvents);
    };

    $scope.selectUnSelectAllEventsGroup = function (data, value) {
      $scope.filteredEventsGroup.forEach((temp) => {
        temp.value = value;
      });
      $scope.insightResponse.EventGroupFilter = angular.copy($scope.filteredEventsGroup);
    };
    $scope.selectUnSelectAllEventsType = function (data, value) {
      $scope.filteredEventsType.forEach((temp) => {
        temp.value = value;
      });
      $scope.insightResponse.EventTypeFilter = angular.copy($scope.filteredEventsType);
    };
    // if ($localStorage.MachineLoadColor) {
    //   $scope.shiftPercentageColors.colorMode = $localStorage.MachineLoadColor;
    // }
    if ($localStorage.MachineLoadGarded) {
      $scope.shiftPercentageColors.gradedMode = $localStorage.MachineLoadGarded;
    }
    if ($scope.changeHeatMapColorAbility || $scope.graph.template == "machinesLoadGraph" || $scope.graph.template == "unitsProducedTheoretically" || $scope.graph.template == "machinesLoadBarGraph" || $scope.graph.templateV2 == "KPIsByMachines" || $scope.graph.templateV2 == "KPIsByShifts") {
      shiftService.getProductionProgressColorDefinition().then((data) => {
        var index;
        _.forEach(data, function (temp) {
          index = _.findIndex($scope.shiftPercentageColors, { parameterID: temp.ParameterID });
          if (index > -1) {
            $scope.shiftPercentageColors[index].color = temp.ColorID;
            $scope.shiftPercentageColors[index].value = parseFloat(temp.Pc.toFixed(2));
            //this is for insights
            $scope.insightsPercentageColors[index].color = temp.ColorID;
            $scope.insightsPercentageColors[index].value = parseFloat(temp.Pc.toFixed(2));
          }
        });
      });
    }


var validSelectTemplateGroup= function(){
  if($scope.allowSetDefaultMachineStructure == true && $localStorage.selectTemplateGroupID.machineDashboard == -1) return false
  if($scope.allowSetDefaultMachineStructure == false && $localStorage.selectTemplateGroupID.machineDashboard > -1) return false
  return true
}
    
if($scope.graph.template == 'machineStatusGraph')
{
  $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure

  $scope.templateGroups = [{ename:$filter('translate')("MY_STRUCTURE"),hname:$filter('translate')("MY_STRUCTURE"),id:-2}]
      
  
  if($localStorage.selectTemplateGroupID && $localStorage.selectTemplateGroupID.machineDashboard != undefined && validSelectTemplateGroup()){
      $scope.shiftData.selectTemplateGroupID = $localStorage.selectTemplateGroupID
  }
  else
  {
    if(!$localStorage.selectTemplateGroupID)
    {
      if($scope.allowSetDefaultMachineStructure)
      {
        $localStorage.selectTemplateGroupID={
          machineDashboard:-2,
       }
      }
      else{
        $localStorage.selectTemplateGroupID={
          machineDashboard:-1,
       }
      }
    }
    else
    {
      $localStorage.selectTemplateGroupID.machineDashboard = $scope.allowSetDefaultMachineStructure ? -2 : -1
    }
        
    $scope.shiftData.selectTemplateGroupID = $localStorage.selectTemplateGroupID;            
  }
  if($scope.allowSetDefaultMachineStructure)
  {
      LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
          $scope.usersData = response.Users;
          $scope.groupsData = response.Groups;
          $scope.templateGroups = [...$scope.templateGroups,..._.map($scope.groupsData,function(group){
              group.ename += ` ${$filter("translate")('STRUCTURE')}`
              group.hname += ` ${$filter("translate")('STRUCTURE')}`
              return group;
          })]
      });
  }
  else{
    $scope.templateGroups.unshift({ename:$filter('translate')("DEFAULT_STRUCTURE"),hname:$filter('translate')("DEFAULT_STRUCTURE"),id:-1})
  }
}

 

    $scope.changeStrucutre = function(){
     $localStorage.selectTemplateGroupID.machineDashboard  = $scope.shiftData.selectTemplateGroupID.machineDashboard
     if($localStorage.selectTemplateGroupID.machineDashboard == -1){
       $scope.containerOptions.settings.enableEdit = false
     }
    }

    $scope.$on("closeModel",function(model){      
      shiftContainerCtrl.showApplyModel = false;
    });
  }

  return {
    restrict: "E",
    templateUrl: Template,
    controller: controller,
    transclude: {
      graph: "?graph",
      setting: "?setting",
      headerTitle: "?headerTitle",
    },
    controllerAs: "shiftContainerCtrl",
    scope: {
      graph: "=",
      containers: "=",
      oldView: "=",
    },
    link: function (scope, element, attrs, ctrl, transclude) {
      scope.exportImg = function () {
        if (scope.exportCSV && scope.exportCSV.value) {
          scope.exportCSV.value();
          return;
        }
        var newWin = window.open("", "Print-Window");

        scope.$broadcast("makeExportableTable");

        var divToPrint = element[0].getElementsByClassName(scope.containerOptions.printDiv)[0].cloneNode(true);
        newWin.document.open();
        newWin.document.write(
          "<html><head>" +
            '<link media="screen" href="css/bootstrap.min.css" rel="stylesheet">' +
            '<link href="css/style.css" rel="stylesheet"/>' +
            '<link href="js/plugins/ui-grid/ui-grid.min.css" rel="stylesheet"/>' +
            '<link href="css/custom.css" rel="stylesheet">' +
            '<link href="css/custom-rtl.css" rel="stylesheet">' +
            '<link href="css/client-config.css" rel="stylesheet">' +
            '<link href="css/client-custom.css" rel="stylesheet">' +
            '<link href="css/custom-print.css" rel="stylesheet">' +
            divToPrint.innerHTML +
            "</body></html>"
        );

        addRelevantClasses(newWin.document);
        newWin.document.close();
        $timeout(function () {
          newWin.print();
          scope.$broadcast("restoreTable");
        }, 3000);
      };
      transclude(scope, function (clone) {
        _.forEach(clone, function (elem) {
          $timeout(function () {
            if (elem.localName == "graph") {
              if (element[0].getElementsByClassName("shiftContainerGraphPrint")[0]) {
                element[0].getElementsByClassName("shiftContainerGraphPrint")[0].append(elem);
              }
            }

            if (elem.localName == "setting") {
              if (element[0].getElementsByClassName("settings")[0]) element[0].getElementsByClassName("settings")[0].append(elem);
            }
            if (elem.localName == "header-title") {
              if (element[0].getElementsByClassName("header-title")[0]) element[0].getElementsByClassName("header-title")[0].append(elem);
            }
          });
        });
      });

      let addRelevantClasses = function (document) {
        let directionIsRtl = LeaderMESservice.isLanguageRTL();

        let bodyTag = angular.element(document).find("body");

        bodyTag.addClass("printableDocument");

        if (directionIsRtl) {
          bodyTag.addClass("rtl");
        }
      };
    },
  };
};

angular.module("LeaderMESfe").directive("shiftContainer", shiftContainer);
