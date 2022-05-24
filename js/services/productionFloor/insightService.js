angular.module("LeaderMESfe").factory("insightService", function (LeaderMESservice, $sessionStorage, $localStorage, getInsightTitleParameters, defaultInsightTemplates) {
  var VERSION = 8.0;

  if (!$sessionStorage.insightData) {
    $sessionStorage.insightData = {};
  }
  if (!$localStorage.insightStates) {
    // save insights state
    LeaderMESservice.customAPI("GetDepartmentMachine", {
      DepartmentID: 0,
    }).then(function (response) {
      var depNames = _.map(response.DepartmentMachine, function (dep) {
        return dep.Key;
      });
      $localStorage.insightStates = {};
      _.forEach(depNames, function (department) {
        $localStorage.insightStates[department.Id] = {};
      });
    });
  }

  if (!$localStorage.insightTemplateID) {
    $localStorage.insightTemplateID = {};
  }

  if (!$localStorage.insightsColorShades) {
    $localStorage.insightsColorShades = {};
  }
  if (!$localStorage.insightsColorText) {
    $localStorage.insightsColorText = {};
  }
  if (!$localStorage.insightDate) {
    $localStorage.insightDate = {
      id: "YESTERDAY",
      pickerDate: {
        startDate: moment().subtract(1, "days").startOf("day"),
        endDate: moment(),
      },
      selectedInterval: 1,
    };
  } else if ($localStorage.insightDate.pickerData) {
    $localStorage.insightDate.pickerDate = $localStorage.insightDate.pickerData;
  }

  var insightData = $sessionStorage.insightData;
  var insightState = $localStorage.insightStates;
  var insightSelectedInterval = $localStorage.insightDate;
  var insightsColorShades = $localStorage.insightsColorShades;
  var insightsColorText = $localStorage.insightsColorText;
  var loadingContainers = {
    value: false,
  };
  var insightInteractiveFilter = {
    productID: [],
    moldID: [],
  };
  var insightInteractiveFilterTemp = {
    productID: "",
    moldID: "",
    productName: "",
    moldName: "",
  };
  var navModelOpen = {
    value: false,
  };

  //show the side filter
  var showFilterInsightVar = {
    value: "",
  };

  //update the side filter
  var updateShowFilterInsight = function (temp) {
    showFilterInsightVar.value = temp;
  };

  var returnContainersInsights = {
    containerInsightInjection: function () {
      return {
        PRODUCTION_AVAILABILITY: defaultInsightTemplates.containerInsightProductionAvailability,
        MAINTENANCE: defaultInsightTemplates.containerInsightMaintenance,
        QUALITY_INDEX: defaultInsightTemplates.containerInsightQualityIndex,
        CYCLE_TIME_EFFICIENCY: defaultInsightTemplates.containerInsightCycleTimeEfficiency,
        STOP_EVENTS: defaultInsightTemplates.containerInsightStopEvents,
        PE_ANALYSIS: defaultInsightTemplates.containerInsightPEAnalysis,
      };
    },
    containerInsightFactory: function () {
      return {
        PE_ANALYSIS: defaultInsightTemplates.containerInsightFactoryPEAnalysis,
        PE_AVAILABILITY: defaultInsightTemplates.containerInsightFactoryPEAvailability,
        QUALITY_INDEX: defaultInsightTemplates.containerInsightFactoryQualityIndex,
        UNEXPECTED_STOP_EVENTS: defaultInsightTemplates.containerInsightFactoryUnexpectedStopEvents,
        REPORTED_STOP_EVENTS: defaultInsightTemplates.containerInsightFactoryReportedStopEvents,
      };
    },
  };

  //change time of insights
  var changeInsightSelectedInterval = function (pickerDate) {
    if (pickerDate) {
      insightSelectedInterval.pickerDate = angular.copy(pickerDate);
      $localStorage.insightDate.pickerDate = angular.copy(pickerDate);
    }
  };

  //take the machines for each Insight Component
  var updateMachinesShiftContainer = function (machineArrayTemp) {
    insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].globalMachines.machines = [];
    machineArrayTemp.forEach((temp) => {
      if (temp.value) {
        insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].globalMachines.machines.push(Object.assign({}, temp));
      }
    });
  };

  var resetContainerDefault = function () {
    $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {
      value: "",
      type: 1,
    };
    updateContainerInsightPage();
  };

  var changeInsightsColor = function (colorObj) {
    $localStorage.insightsColorShades[$sessionStorage.stateParams.subMenu.SubMenuExtID].currentChoice = angular.copy(colorObj.currentChoice);
    $localStorage.insightsColorShades[$sessionStorage.stateParams.subMenu.SubMenuExtID].newColor = angular.copy(colorObj.newColor);
  };

  var changeInsightsTextColor = function (colorObj) {
    $localStorage.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID].backgroundColor = angular.copy(colorObj.backgroundColor);
    $localStorage.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID].currentChoice = angular.copy(colorObj.currentChoice);
    $localStorage.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID].fontColor = angular.copy(colorObj.fontColor);
    $localStorage.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID].fontSize = angular.copy(colorObj.fontSize);
  };

  //update container of insights
  var displayNewInsightContainer = function (newInsightContainer) {
    var listInsights = [],
      index,
      temp,
      selectedInterval,
      savedTemplate,
      selectedArg,
      selectedArg2,
      selectedArg3;
    //we copy the new template to the session.
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container = angular.copy(newInsightContainer);
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container = _.filter($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, function (temp) {
      if (temp.options && temp.options.settings && temp.options.settings.insight && temp.options.settings.insight.ID.toString()) {
        return true;
      }
      return false;
    });
    //take  the ids of the good insightsContainers
    var idContainer = _.map($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, function (temp) {
      return temp.options.settings.insight.ID.toString();
    });
    try {
      loadingContainers.value = true;
      LeaderMESservice.customGetAPI("GetResultInsights").then(function (res) {
        var listInsightsArray = _.map(res.insights, function (temp) {
          temp.insights = _.map(temp.insights, function (insight) {
            insight.InsightGroupID = temp.ID;
            return insight;
          });
          return temp.insights;
        });

        //put all the insights in one array
        for (var i = 0; i < listInsightsArray.length; i++) {
          for (var j = 0; j < listInsightsArray[i].length; j++) {
            listInsights.push(listInsightsArray[i][j]);
          }
        }

        //find all the items we need from API Request

        var containerInsight = _.map(idContainer, function (temp) {
          var dublicateIndex = temp.indexOf("D");
          if (dublicateIndex >= 0) {
            insightID = temp.substr(0, dublicateIndex, "");
            dublicateNumber = temp.substr(dublicateIndex, dublicateIndex.length, "");
            var findIndex = _.findIndex(listInsights, { ID: +insightID });
            var dublicateObject = angular.copy(listInsights[findIndex]);
            dublicateObject.ID = dublicateObject.ID + dublicateNumber;
            return dublicateObject;
          } else {
            var findIndex = _.findIndex(listInsights, { ID: +temp });
            if (findIndex > -1) {
              var insightTemp = angular.copy(listInsights[findIndex]);
              insightTemp.ID = insightTemp.ID + "";
              return insightTemp;
            }
          }
        });

        for (var i = 0; i < $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.length; i++) {
          index = _.findIndex(containerInsight, {
            ID: $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.ID,
          });
          if (index < 0) {
            continue;
          }
          temp = [];
          selectKpi = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectKpi);
          selectedArg = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg);
          selectedArg2 = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg2);
          selectedArg3 = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg3);

          savedTemplate = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.savedTemplate);

          selectedInterval = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedInterval;
          if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.scaleMinMax) {
            var scale = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.scaleMinMax;
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight = angular.copy(containerInsight[index]);
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.scaleMinMax = scale;
          } else {
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight = angular.copy(containerInsight[index]);
          }
          if (newInsightContainer[i]) {
            if (newInsightContainer[i].endLine != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.endLine = newInsightContainer[i].endLine;
            }
            if (newInsightContainer[i].filterMachine != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.filterMachine = newInsightContainer[i].filterMachine;
            }
            if (newInsightContainer[i].colorMode != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.colorMode = newInsightContainer[i].colorMode;
            }
            if (newInsightContainer[i].targetMode != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.targetMode = newInsightContainer[i].targetMode;
            }
            if (newInsightContainer[i].filterEvent != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.filterEvent = newInsightContainer[i].filterEvent;
            }
            if (newInsightContainer[i].KPIsForHeatmap != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].KPIsForHeatmap = newInsightContainer[i].KPIsForHeatmap;
            }
            if (newInsightContainer[i].insightTopNum != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].insightTopNum = newInsightContainer[i].insightTopNum;
            }
            
            if (newInsightContainer[i].xAxisSelectedObject != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].xAxisSelectedObject = newInsightContainer[i].xAxisSelectedObject;
            }
            if (newInsightContainer[i].settingState != undefined) {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.settingState = newInsightContainer[i].settingState;
              if ($sessionStorage.gridInsightState && $sessionStorage.gridInsightState[newInsightContainer[i].ID]) {
                $sessionStorage.gridInsightState[newInsightContainer[i].ID] = newInsightContainer[i].settingState;
              } else {
                if (!$sessionStorage.gridInsightState) {
                  $sessionStorage.gridInsightState = {};
                }
                $sessionStorage.gridInsightState[newInsightContainer[i].ID] = newInsightContainer[i].settingState;
              }
            }
          }
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.displayTypeID = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.DisplayTypeID;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.xAxis = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.XAxisName;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.yAxis = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.YAxisName;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.mergePC = 80;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.insightTopNum = 5;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedInterval = $localStorage.insightDate.selectedInterval ? $localStorage.insightDate.selectedInterval.toString() : selectedInterval.toString();

          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.savedTemplate = savedTemplate;

          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg = selectedArg;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg2 = selectedArg2;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectedArg3 = selectedArg3;

          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.selectKpi = selectKpi;

          temp = getInsightTitleParameters($sessionStorage.localLanguage ? containerInsight[index].LName : containerInsight[index].EName, $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight);
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.insightParameters = angular.copy(temp);

          temp = [];
          if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title) {
            if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("{") !== -1 && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("}") !== -1) {
              varsearchKpi = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.substring(
                $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("{") + 1,
                $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("}")
              );

              $sessionStorage.kpiTranslations.forEach(function (kpi) {
                if (kpi.name == varsearchKpi) {
                  $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.replace(
                    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.substring(
                      $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("{"),
                      $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title.indexOf("}") + 1
                    ),
                    kpi[$sessionStorage.language]
                  );
                }
              });
            }
          }

          var id = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.ID.toString();
          if ($localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type !== 1) {
            if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].savedTemplateType == "LOCAL") {
              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].filterEvent) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].filterEvent = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].filterEvent);
              }
              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].filterMachine) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].filterMachine = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].filterMachine);
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].localMachines = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].localMachines);
              }

              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].endLine) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].endLine = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].endLine);
              }
              

              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].colorMode != undefined) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].colorMode = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].colorMode);
              }

              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].targetMode != undefined) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].targetMode = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].targetMode);
              }



              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].xAxisSelectedObject != undefined) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].xAxisSelectedObject = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].xAxisSelectedObject);
              }

              
              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].insightTopNum != undefined) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].insightTopNum = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].insightTopNum);
              }


              if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].settingState) {
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
                }
                if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
                }
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].settingState = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].settingState);
              }
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].globalMachineChange = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].globalMachineChange
                ? $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].globalMachineChange++
                : 0;
            } else if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].savedTemplateType == "ALL_DEPARTMENTS") {
              $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].localMachines = _.map($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].localMachines, function (machine) {
                machine.value = true;
                return machine;
              });
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id] = {};
            }
          }

          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].nameID =
            $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.Title + " " + $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[i].options.settings.insight.ID.toString();
        }
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container["language"] = $sessionStorage.language;
        if (!_.isEmpty($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters)) {
          updateMachinesShiftContainer(angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines));
        }
        loadingContainers.value = false;
      });
    } catch (error) {
      loadingContainers.value = false;
    }
  };
  var updateContainerInsightPage = function () {
    var pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;

    //create insightDataObject if it doesnot exit
    createInsightDataObject(pageID);

    if (!$localStorage.insightTemplateID) {
      $localStorage.insightTemplateID = {};
    }

    //if first time we visit the page then create insightTemplateID object
    if (!$localStorage.insightTemplateID[pageID]) {
      $localStorage.insightTemplateID[pageID] = {
        value: "PE_ANALYSIS",
        type: 1,
      };
    }
    if (_.isEmpty($localStorage.insightTemplateID[pageID])) {
      displayNewInsightContainer($sessionStorage.insightData[pageID].container);
      return;
    }
    
    //check the last insightTemplateID was selected and Get the structure from the server if we dont have it on client side
    if ($localStorage.insightTemplateID[pageID].type !== 1) {
      LeaderMESservice.customAPI("GetDashboardTemplateStructureByID", {
        StructureID: $localStorage.insightTemplateID[pageID].value,
        DepartmentID: pageID,
      }).then(function (res) {
        var fullTemplate = _.find(res.TemplateData, { ID: $localStorage.insightTemplateID[pageID].value });
        if (fullTemplate) {
          var structure = JSON.parse(fullTemplate.Structure);
          if (pageID) {
            displayNewInsightContainer(structure.insightsContainer || structure.dataInsightsPage);
          } else {
            displayNewInsightContainer(structure.insightsContainer || structure.dataInsightsFactoryPage);
          }
          if (structure && structure.defaultFilter && structure.defaultFilter.FilterTemplate) {
            Object.keys(structure.defaultFilter.FilterTemplate).forEach(function (key) {
              insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters[key] = structure.defaultFilter.FilterTemplate[key];
            });
          }
        }
      });
    } else {
     // check if department insights or factory insights and send the last saved template
      LeaderMESservice.customAPI("GetStructureThumbnails", {
        DashboardType: $sessionStorage.stateParams.subMenu.SubMenuExtID == 0 ? 1 : 3,
        DepartmentID: pageID
      }).then(function (res) {
        var fullTemplate = _.find(res.DefaultTemplateData, { ID: $localStorage.insightTemplateID[pageID].value });
        if (fullTemplate) {
          var structure = JSON.parse(fullTemplate.Structure);
          if (pageID) {
            displayNewInsightContainer(structure.insightsContainer || structure.dataInsightsPage);
          } else {
            displayNewInsightContainer(structure.insightsContainer || structure.dataInsightsFactoryPage);
          }
        
        }})
    }
  };

  var updateDefaultFilterBy = function (res, departmentID) {
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy = [];
    var machinesIds = _.map(res.ResponseDictionary.Machines, "ID");
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
      FilterName: "MachineIdFilter",
      FilterValues: machinesIds,
    });
    var shiftNames = _.map(res.ResponseDictionary.ShiftDef, "ShiftName");
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
      FilterName: "ShiftNameFilter",
      FilterValues: shiftNames,
    });

    var jobDefinitions = _.map(res.ResponseDictionary.ERPJobDef, "id");
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
      FilterName: "ERPJobDefFilter",
      FilterValues: jobDefinitions,
    });

    if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.isWorking) {
      $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
        FilterName: "IsWorkingFilter",
        FilterValues: [1],
      });
    }
    if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine) {
      $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
        FilterName: "IsEndOfLineFilter",
        FilterValues: [1],
      });
    }
    // if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine) {
    //   $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
    //     FilterName: "IsEndOfLineFilter",
    //     FilterValues: [1],
    //   });
    // }
    $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy.push({
      FilterName: "DepartmentIdFilter",
      FilterValues: [departmentID],
    });
  };

  //get the side filter from the server
  var getInsightsFilter = function (departmentID) {
    LeaderMESservice.customAPI("GetInsightFilters", {
      DepartmentID: departmentID || 0,
    }).then(function (res) {
      var productionLinesExist = false;
      if (res.ResponseDictionary && res.ResponseDictionary.Machines && res.ResponseDictionary.Machines[0].LineID) {
        productionLinesExist = true;
      }
      if (_.isEmpty($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]?.filters)) {
        if (false && !departmentID) {
          res.ResponseDictionary.Machines = [];
          _.forEach(res.ResponseDictionary.Departments, function (temp) {
            var menuAndSubMenu = LeaderMESservice.getMainMenu();
            const productionFloorMenu = _.find(menuAndSubMenu, {
              TopMenuAppPartID: 500,
            });
            if (productionFloorMenu) {
              if (_.findIndex(productionFloorMenu.subMenu, { SubMenuExtID: temp.Department.Id }) < 0) {
                return;
              }
            }
            _.forEach(temp.Machines, function (machine) {
              res.ResponseDictionary.Machines.push({
                ID: machine.Id,
                MachineName: machine.MachineName,
                MachineLName: machine.MachineLName,
                value: true,
              });
            });
          });
        } else {
          res.ResponseDictionary.Machines = _.map(res.ResponseDictionary.Machines, function (temp) {
            temp.value = true;
            return temp;
          });
        }

        res.ResponseDictionary.ShiftDef = _.map(res.ResponseDictionary.ShiftDef, function (temp) {
          temp.value = true;
          return temp;
        });
        res.ResponseDictionary.ERPJobDef = _.map(res.ResponseDictionary.ERPJobDef, function (temp) {
          temp.value = true;
          return temp;
        });

        Object.keys($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters).forEach(function (key) {
          delete $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters[key];
        });
        Object.keys(res.ResponseDictionary).forEach(function (key) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters[key] = angular.copy(res.ResponseDictionary[key]);
        });
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.compare = false;
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.isWorking = true;
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale = true;
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.deviation = false;
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.dataLabels = true;
        if (productionLinesExist) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine = false;
        }
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productGroupIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldGroupIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.userIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.jobIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.activeTimeIds = [];
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.unitsProducedIds = [];
        
        updateDefaultFilterBy(res, departmentID);
      } else {
        if (false && !departmentID) {
          res.ResponseDictionary.Machines = [];
          _.forEach(res.ResponseDictionary.Departments, function (temp) {
            _.forEach(temp.Machines, function (machine) {
              res.ResponseDictionary.Machines.push({
                ID: machine.Id,
                MachineName: machine.MachineName,
                MachineLName: machine.MachineLName,
                value: true,
                ...machine
              });
            });
          });
        }

        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines = _.map(res.ResponseDictionary.Machines, function (temp) {
          index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines, {
            ID: temp.ID,
          });
          if (index > -1 && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines[index].value !== undefined) {
            temp.value = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines[index].value;
          } else {
            temp.value = true;
          }
          return temp;
        });

        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef = _.map(res.ResponseDictionary.ShiftDef, function (temp) {
          index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef, {
            ShiftName: temp.ShiftName,
          });
          if (index > -1 && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef[index].value !== undefined) {
            temp.value = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef[index].value;
          } else {
            temp.value = true;
          }
          return temp;
        });
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ERPJobDef = _.map(res.ResponseDictionary.ERPJobDef, function (temp) {
          index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ERPJobDef, {
            id: temp.id,
          });
          if (index > -1 && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ERPJobDef[index].value !== undefined) {
            temp.value = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ERPJobDef[index].value;
          } else {
            temp.value = true;
          }
          return temp;
        });
        
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.compare === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.compare = false;
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.isWorking === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.isWorking = true;
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale = true;
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.deviation === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.deviation = false;
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.dataLabels === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.dataLabels = true;
        }
        if (productionLinesExist && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine = false;
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productIds = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldIds = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.userIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.userIds = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.jobIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.jobIds = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.activeTime === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.activeTime = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.unitsProduced === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.unitsProduced = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productGroupIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.productGroupIds = [];
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldGroupIds === undefined) {
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.moldGroupIds = [];
        }
        if (!$sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy) {
          updateDefaultFilterBy(res, departmentID);
        }
      }
    });
  };

  var createInsightDataObject = function (id) {
    if (!$sessionStorage.insightData) {
      $sessionStorage.insightData = {};
    }
    if (!$localStorage.insightsColorShades) {
      $localStorage.insightsColorShades = {};
    }
    if (!$localStorage.insightsColorText) {
      $localStorage.insightsColorText = {};
    }
    if (!$localStorage.insightStates) {
      $localStorage.insightStates = {};
    }

    if (!$sessionStorage.insightData[id]) {
      $sessionStorage.insightData[id] = {
        container: [],
        eventsFilter: [], //save the filters inside group 5 , if u return it will be the same
        globalMachines: {
          //value of global machines in side filter
          machines: [],
        },
        filters: {}, //save the side filter options
      };
    }

    if (!$localStorage.insightsColorShades[id]) {
      $localStorage.insightsColorShades[id] = {
        currentChoice: "defaultHighchartColor",
        defaultColor: "#E06E5C",
        newColor: "#E06E5C",
      };
    }

    if (!$localStorage.insightsColorText[id]) {
      $localStorage.insightsColorText[id] = {
        currentChoice: "defaultColor",
        backgroundColor: "",
        fontColor: "",
        fontSize: "",
      };
    }

    if (!$localStorage.insightStates[id]) {
      $localStorage.insightStates[id] = {};
    }

    getInsightsFilter(id);
  };

  var copyInteractiveFilter = function () {
    insightInteractiveFilter.productID = angular.copy(insightInteractiveFilterTemp.productID);
    insightInteractiveFilter.moldID = angular.copy(insightInteractiveFilterTemp.moldID);
    insightInteractiveFilter.productName = angular.copy(insightInteractiveFilterTemp.productName);
    insightInteractiveFilter.moldName = angular.copy(insightInteractiveFilterTemp.moldName);
  };

  return {
    returnContainersInsights: returnContainersInsights,
    containerInsightDefault: defaultInsightTemplates.containerInsightDefault,
    navModelOpen: navModelOpen,
    showFilterInsightVar: showFilterInsightVar,
    insightData: insightData,
    insightsColorShades: insightsColorShades,
    insightsColorText: insightsColorText,
    insightState: insightState,
    insightSelectedInterval: insightSelectedInterval,
    insightInteractiveFilterTemp: insightInteractiveFilterTemp,
    insightInteractiveFilter: insightInteractiveFilter,
    loadingContainers: loadingContainers,
    VERSION: VERSION,
    resetContainerDefault: resetContainerDefault,
    updateContainerInsightPage: updateContainerInsightPage,
    updateMachinesShiftContainer: updateMachinesShiftContainer,
    changeInsightSelectedInterval: changeInsightSelectedInterval,
    updateShowFilterInsight: updateShowFilterInsight,
    getInsightsFilter: getInsightsFilter,
    createInsightDataObject: createInsightDataObject,
    changeInsightsTextColor: changeInsightsTextColor,
    changeInsightsColor: changeInsightsColor,
    copyInteractiveFilter: copyInteractiveFilter,
  };
});
