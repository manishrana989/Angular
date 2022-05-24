var insightsDashboardDirective = function ($timeout) {
  var Template = "views/custom/productionFloor/shiftTab/insightsGraph/insightDashboardTemplate.html";

  function controller($scope, LeaderMESservice, $filter,$state, $element, shiftService, insightService, 
      $sessionStorage, highchartService, insightGridTableService, 
      $localStorage, $rootScope, AuthService,uiGridGroupingConstants, googleAnalyticsService, $modal) {
    var insightsDashboardCtrl = this;
    var timeValue = [1, 0, 0, 7, 14, 28];
    var ranges = {};
    $scope.userDateFormat = AuthService.getUserDateFormat();

    shiftService.getProductionProgressColorDefinition()
    .then(data => {
        if (data) {
            $scope.innerCircleColorSettings = data;
            let moreThan = $scope.innerCircleColorSettings.find(e => e.Name === 'moreThan');
            let lessThan = $scope.innerCircleColorSettings.find(e => e.Name === 'LessThen');
            let otherwise = $scope.innerCircleColorSettings.find(e => e.Name === 'else');
            $scope.colorSettings = {
                moreThan: {
                    color: moreThan['ColorID'],
                    percentage: moreThan['Pc']
                },
                lessThan: {
                    color: lessThan['ColorID'],
                    percentage: lessThan['Pc']
                },
                otherwise: {
                    color: otherwise['ColorID'],
                    percentage: otherwise['Pc']
                },
            }
        }
    });

    insightsDashboardCtrl.interactiveFilterVarGetUnitsProducedGrouped = false;
    $scope.sampleGridOptions = {};
    $scope.uniqId = Date.now();
    $scope.shiftData = shiftService.shiftData;
    $scope.insightData = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID];
    $scope.insightsColorShades = insightService.insightsColorShades[$sessionStorage.stateParams.subMenu.SubMenuExtID];
    $scope.insightsColorText = insightService.insightsColorText[$sessionStorage.stateParams.subMenu.SubMenuExtID];
    $scope.insightSelectedIntervalTemp = insightService.insightSelectedInterval;
    $scope.insightSelectedInterval = angular.copy($scope.insightSelectedIntervalTemp);
    $scope.showFilterInsightVar = insightService.showFilterInsightVar;
    $scope.insightsPageData = shiftService.insightsPageData[$sessionStorage.produtionFloorTab.selectedTab];
    $scope.insightDataLoading = true;
    insightsDashboardCtrl.showTableGraph = false;
    insightsDashboardCtrl.showGridTableGraph = false;
    $scope.localDate = false; // this if for color the local date
    $scope.insightHeight = "350px";
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.rtlDir = $scope.rtl ? "rtl" : "ltr";
    $scope.shiftPieChart = false;
    $scope.custom = false;
    $scope.insightHeatMap = false;
    $scope.displayFilterMachines = "";
    $scope.displayFilterEvents = "";
    $scope.displayFilterEventsGroup = "";
    $scope.displayFilterEventsType = "";
    $scope.localTime = false;
    $scope.firstTime = true;
    $scope.timePeriod = 450;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.insightsDifferentFormat= [195,230,147,148,45,54,42,51,57,48,66,184,185,206,156,126,221,125,124,210,237,239,169,170,60,61,74,75,76,79,70,193,194,175,131,132]
    $scope.loadTableFirstTime = true;
    insightsDashboardCtrl.headerChanged = false;
    var belowOrAboveHundred = function (number) {
      if (number && number < 100) {
        return parseFloat(number.toFixed(2));
      }
      return parseInt(number);
    };

    var convertToHours = function(number,selectArg){
        if (selectArg == "2348" || selectArg == "2349") {
          return $filter('getDurationInHoursMinutes')(number)
        } 
        else
        {
          return number
        }
    }

    var setCategoryName = function (dataInfo,selectArg,categoryName,res) {
     if (selectArg?.key == "706") {
        dataInfo[categoryName] = "MachineName";
      } else if (selectArg?.key == "712") {
        dataInfo[categoryName] = "WorkerName";
      } else if (selectArg.key == "182") {
        dataInfo[categoryName] = "ShiftName";
      } else if (selectArg?.key == "2286") {
        dataInfo[categoryName] = "ShiftTypeName";
      } else if (selectArg?.key == "780") {
        dataInfo[categoryName] = "Week";
      } else if (selectArg?.key == "963") {
        dataInfo[categoryName] = "Month";
      } else if (selectArg?.key == "708") {
        dataInfo[categoryName] = "ProductName";
      } else if(selectArg?.key == "707"){
        dataInfo[categoryName] = "MoldName"
      }else if(selectArg?.key == "2347"){
        dataInfo[categoryName] = "WorkerName"
      }else if (selectArg?.key == 331) {
        dataInfo[categoryName] = "ProductGroupName";
      } else if (selectArg?.key == 66) {
        dataInfo[categoryName] = "QualityTestName";
      } else if (selectArg?.key == 2294) {
        dataInfo[categoryName] = "FieldName";
      }else if (selectArg?.key == "2359") {
        dataInfo[categoryName]="MoldID"
      } else if (selectArg?.key == "2274") {
        dataInfo[categoryName] = "MoldName"
      } else if (selectArg?.key == "2360") {
        dataInfo[categoryName] = "ProductID";
      }  else if (selectArg?.key == "2275") {
        dataInfo[categoryName] = "ProductName"
      } else if (selectArg?.key == "870") {
        dataInfo[categoryName] = "CatalogID"
      } else if (selectArg?.key == "2363") {
        dataInfo[categoryName] = "CatalogID"
      }else  if (selectArg?.key == "696") {
        dataInfo[categoryName] = "Day";
        res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (temp) {
          temp.Day = moment(temp["Day"]).format($scope.userDateFormat).substring(0, temp.Day.indexOf("T"));
          return temp;
        });
      }    
    };

    $timeout(function () {
      if ($scope.graph) {
        $scope.insightHeightTemp = $(`.insight-id${$scope.graph?.ID}`).height();
        $scope.shiftContainerHeightTemp = $(`.shiftContainerGraph${$scope.graph?.ID}`).height();
      }
    });
    $scope.biggerScreen = true;
    var defaultHighchartColors = ["rgba(124, 181, 236, 1)", "rgba(67, 67, 72, 1)", "rgba(144, 237, 125, 1)", "rgba(247, 163, 92, 1)", "rgba(128, 133, 233, 1)", "rgba(241, 92, 128, 1)", "rgba(228, 211, 84, 1)", "rgba(43, 144, 143, 1)", "rgba(244, 91, 91, 1)", "rgba(145, 232, 225, 1)"];
    var timeString = ["YESTERDAY", "LAST_WEEK_SUNDAY_TO_SATURDAY", "LAST_WEEK_MONDAY_TO_SUNDAY", "LAST_7_DAYS", "LAST_14_DAYS", "LAST_28_DAYS"];
    insightsDashboardCtrl.insightsInteractiveFilter = ["151", "152", "33", "19", "158", "23", "153", "154", "21", "159"];
    insightsDashboardCtrl.interactiveFilterBoolean = false;
    if (!$sessionStorage.insightsDataSave) {
      $sessionStorage.insightsDataSave = {
        GetDepartmentKPIsByTime: [],
      };
    }
    $scope.devationNames = [];
    $scope.durationObj = "";
    insightsDashboardCtrl.xAxisSelectedObject = {
      value: "",
    };
    var getPickerDate = function () {
      //update ranges before getting pickerDate
      if (!$("#reportrange").length) {
        return;
      }
      $("#reportrange").data().daterangepicker.ranges = getTimeDates();
      if ($scope.insightSelectedInterval.id == "YESTERDAY") {
        return ($scope.pickerDate = {
          startDate: moment().subtract(1, "days").startOf("day"),
          endDate: moment().startOf("day"),
        });
      } else if ($scope.insightSelectedInterval.id == "LAST_WEEK_SUNDAY_TO_SATURDAY") {
        $scope.pickerDate = {
          startDate: moment().subtract(1, "weeks").startOf("week").isoWeekday(0).startOf("day"),
          endDate: moment().subtract(1, "weeks").endOf("week").isoWeekday(6).startOf("day"),
        };
      } else if ($scope.insightSelectedInterval.id == "LAST_WEEK_MONDAY_TO_SUNDAY") {
        $scope.pickerDate = {
          startDate: moment().subtract(1, "weeks").startOf("isoWeek").isoWeekday(1).startOf("day"),
          endDate: moment().subtract(1, "weeks").endOf("isoWeek").isoWeekday(7).startOf("day"),
        };
      } else if ($scope.insightSelectedInterval.id == "LAST_7_DAYS") {
        $scope.pickerDate = {
          startDate: moment().subtract(7, "days").startOf("day"),
          endDate: moment().subtract(1, "d").startOf("day"),
        };
      } else if ($scope.insightSelectedInterval.id == "LAST_14_DAYS") {
        $scope.pickerDate = {
          startDate: moment().subtract(14, "days").startOf("day"),
          endDate: moment().subtract(1, "d").startOf("day"),
        };
      } else if ($scope.insightSelectedInterval.id == "LAST_28_DAYS") {
        $scope.pickerDate = {
          startDate: moment().subtract(28, "days").startOf("day"),
          endDate: moment().subtract(1, "d").startOf("day"),
        };
      } else {
        $scope.pickerDate = {
          startDate: moment($scope.insightSelectedInterval.pickerDate.startDate),
          endDate: moment($scope.insightSelectedInterval.pickerDate.endDate),
        };
      }
    };

    var GroupColors = function (temp) {
      var colors = [],
        base = temp,
        i;

      for (i = 0; i < 5; i += 1) {
        colors.push(
          Highcharts.Color(base)
            .brighten((i - 3) / 7)
            .get()
        );
      }
      return colors;
    };

    var getResultForHeatMap = function (find) {
      var result;

      if ($scope.graph?.options?.settings?.targetMode) {
        if ($scope.graph?.options?.settings?.customization == "percentage") {
          result = `${parseInt(find.UnitsRatio * 100)}%`;
        } else {
          if (find.UnitsProducedOK != null && find.UnitsProducedTheoretically != null && (find.UnitsProducedOK != 0 || find.UnitsProducedTheoretically != 0)) {
            if (find.UnitsProducedOK > 99) {
              find.UnitsProducedOK = $filter("thousandsSeperator")(parseInt(find.UnitsProducedOK));
            } else {
              find.UnitsProducedOK = $filter("thousandsSeperator")(parseFloat(find.UnitsProducedOK.toFixed(2)));
            }
            if (find.UnitsProducedTheoretically > 99) {
              find.UnitsProducedTheoretically = $filter("thousandsSeperator")(parseInt(find.UnitsProducedTheoretically));
            } else {
              find.UnitsProducedTheoretically = $filter("thousandsSeperator")(parseFloat(find.UnitsProducedTheoretically.toFixed(2)));
            }
            result = `${find.UnitsProducedOK}${" (" + find.UnitsProducedTheoretically + ")"}`;
          } else {
            result = null;
          }
        }
      } else {
        if ($scope.graph?.options?.settings?.customization == "percentage") {
          if (find.UnitsRatio != null) {
            result = `${parseInt(find.UnitsRatio * 100)}%`;
          } else {
            result = null;
          }
        } else {
          if (find.UnitsProducedOK != 0) {
            if (find.UnitsProducedOK > 99) {
              find.UnitsProducedOK = $filter("thousandsSeperator")(parseInt(find.UnitsProducedOK));
            } else {
              find.UnitsProducedOK = $filter("thousandsSeperator")(parseFloat(find.UnitsProducedOK.toFixed(2)));
            }
            result = find.UnitsProducedOK;
          } else {
            result = null;
          }
        }
      }
      return result;
    };

    var createShiftTypeCategories = function (res, dataInfo, categoriesName) {
      var found, singleCubeWidth, width, canvas, ctx, widthPercentage;
      singleCubeWidth = ($(`.insight-graph-template${$scope.graph?.ID}`).width() - 51) / res.ResponseDictionary?.Body?.length;
      _.forEach(res.ResponseDictionary.Body, function (data) {
        found = _.find(dataInfo.categories, { name: data[categoriesName] });
        if (found) {
          found.categories.push(data[dataInfo.xAxis]);
        } else {
          dataInfo.categories.push({ name: data[categoriesName], toolTip: data[categoriesName], categories: [data[dataInfo.xAxis]] });
        }
      });

      _.forEach(dataInfo.categories, function (data) {
        width = singleCubeWidth * data.categories.length;
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        ctx.font = `13px ${$scope.localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`}`;

        widthPercentage = ctx.measureText(data.toolTip).width / width;
        if (widthPercentage > 0.8) {
          data.name = `${data.toolTip.substring(0, Math.floor(data.toolTip.length / widthPercentage) - 1)}...`;
        }
      });
      dataInfo.categoriesGroup = true;
    };

    $scope.xAxisInsightSelectFlag = false;
    $scope.xAxisInsightSelectArray = [];

    $scope.updateDuration = function (startDate, endDate) {
      var timeFormat = d3.time.format("%d/%m/%Y %H:%M:%S");
      showInsights = false;
      shiftService.shiftData.selectedTab = 1;
      for (var key in shiftService.shiftData.machinesDisplay) {
        shiftService.shiftData.machinesDisplay[key] = true;
      }
      var durationObj = shiftService.durationParams(1, timeFormat.parse(startDate), timeFormat.parse(endDate));
      shiftService.updateData(shiftService.shiftData.DepartmentID, durationObj, false);
    };

    var getHeatMapColor = function (ratio, minRatio,value,valueTarget,maxRatio,isGraded) {
      var color;
      if(valueTarget == 0 && value == 0)
      {
        color = "#F7F7F7"
        return color
      }
      if(maxRatio)
      {
        var higherRatioValue = (ratio - $scope.graph?.options.settings.heatMapColors[0].value / 100) / (maxRatio - $scope.graph?.options.settings.heatMapColors[0].value / 100);
      }
      else
      {
        var higherRatioValue = ratio
      }
      var ratioForLowerValue = 1 - (ratio - minRatio) / ($scope.graph?.options.settings.heatMapColors[1].value / 100 - minRatio)
        if ($scope.graph?.options?.settings?.colorMode && !isGraded) {
        if (ratio > $scope.graph?.options.settings.heatMapColors[0].value / 100) {
          color = $scope.graph?.options.settings.gradedMode ? convertHexToRGBA($scope.graph?.options.settings.heatMapColors[0].color, higherRatioValue) : $scope.graph?.options.settings.heatMapColors[0].color;
        } else if (ratio < $scope.graph?.options.settings.heatMapColors[1].value / 100) {
          color = $scope.graph?.options.settings.gradedMode ? convertHexToRGBA($scope.graph?.options.settings.heatMapColors[1].color,ratioForLowerValue) : $scope.graph?.options.settings.heatMapColors[1].color;
        } else {
          color = convertHexToRGBA($scope.graph?.options.settings.heatMapColors[2].color, ratio);
        }
      } else {
        color = `rgba(24, 181, 21, ${ratio})`;
      }
      return color;
    };

    var buildPieData = function (insight, insightName, res, selectedArg) {
      if (insightName == "GetTotalReportedEventsByTypeByStartTime") {
        var dataInfo = {
          series: [
            {
              name: "FilteredShortEvents",
              color: "rgba(214, 66, 66, 1)",
              y: [],
            },
            {
              name: "Unreported",
              color: "rgba(135, 39, 39, 1)",
              y: [],
            },
            {
              name: "Reported",
              color: "rgba(245, 188, 179, 1)",
              y: [],
            },
          ],
          categoriesName: $scope.localLanguage ? "LName" : "EName",
          categories: [],
          label: "",
          toolTip: 1,
          insight: insight,
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          serverData: res.ResponseDictionary,
          shiftInsight: true,
          graph: $scope.graph,
        };
        if (!res.ResponseDictionary) {
          return;
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.y = temp[item.name];
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
        dataInfo.colors = "";
      }else if (insightName == "GetAvailabilityOEELostTimeDurationTotal" || insightName == "GetAvailabilityOEELostTimeDurationTotalFactory") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          categoriesName: $scope.localLanguage ? "LName" : "EName",
          stacking: "",
          label: "",
          categories: [],
          toolTip: 1,
          insightsColorText: $scope.insightsColorText,
          insight: insight,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          graph: $scope.graph,
        };
        var flag = false;
        res.ResponseDictionary.Body.forEach(function (temp) {
          if (temp.ManualLabor !== 0) {
            flag = true;
          }
        });
        if (flag) {
          dataInfo.series = [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ];
        } else {
          dataInfo.series = [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ];
        }
        dataInfo = getPieSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
        dataInfo.colors = "";
      } else if (insightName == "GetLineMachineTotalEventsByRoot") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "MachineName",
          stacking: "",
          label: "",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfEvents",
          categories: [],
          toolTip: 8,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          ID: "Event",
          graph: $scope.graph,
          legendsType:"MachineID"
        };

        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 2126) {
          dataInfo.data = "PercentageByDurationOfEvents";
          dataInfo.toolTip = 7;
        }
        if (selectedArg.key == 2125) {
          dataInfo.data = "PercentageByNumberOfEvents";
          dataInfo.toolTip = 7;
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.push({
            name: temp[dataInfo.name],
            color: "",
            y: temp[dataInfo.data],
            MachineID: temp[dataInfo.legendsType],
          });
        });
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }

      } else if (insightName == "GetNotificationByType") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          categoriesName: $scope.localLanguage ? "LName" : "EName",
          stacking: "",
          label: "",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categories: [],
          toolTip: 3,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          insight: insight,
          dataVariable: ["y"],
        };
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.push({
            name: temp[dataInfo.categoriesName],
            color: "",
            y: [],
          });
        });
        res.ResponseDictionary.Body.forEach(function (temp, i) {
          dataInfo.series[i].y = temp.NumOfResponse;
        });
        dataInfo.colors = GroupColors("rgba(143, 230, 232, 1)");
      } else if (insight.Name == "GetRejectReasonsPie" || insight.Name == "GetRejectReasonsFactoryPie") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          categoriesName: "Name",
          stacking: "",
          label: "",
          data: "Quantity",
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          toolTip: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          dataVariable: ["y"],
        };
        res.ResponseDictionary.Body.forEach(function (temp) {
          if (temp.ReasonID == -1) {
            dataInfo.series.push({
              name: temp[dataInfo.categoriesName],
              color: "rgba(236, 231, 240, 1)",
              y: [],
            });
          } else {
            dataInfo.series.push({
              name: temp[dataInfo.categoriesName],
              color: "",
              y: [],
            });
          }
        });
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            dataInfo.dataVariable.forEach(function (dataVar) {
              if (item.name == temp[dataInfo.categoriesName]) {
                item[dataVar] = temp[dataInfo.data];
              }
            });
          });
        });
        dataInfo.colors = GroupColors("rgba(128, 128, 128, 1)");
      } else if (insightName == "GetTotalReportedEventsByType") {
        dataInfo = {
          series: [
            {
              name: "FilteredShortEvents",
              color: "rgba(214, 66, 66, 1)",
              y: [],
            },
            {
              name: "Unreported",
              color: "rgba(135, 39, 39, 1)",
              y: [],
            },
            {
              name: "Reported",
              color: "rgba(245, 188, 179, 1)",
              y: [],
            },
          ],
          
          xAxisName: "",
          categoriesName: $scope.localLanguage ? "LName" : "EName",
          stacking: "",
          label: "",
          insight: insight,
          insightsColorText: $scope.insightsColorText,

          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          toolTip: 6,
          dataVariable: ["y"],
        };
        $scope.$emit("events", res.ResponseDictionary);

        dataInfo = getPieSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
        dataInfo.colors = GroupColors("rgba(143, 230, 232, 1)");
        if (selectedArg.key == 781) {
          dataInfo.toolTip = 3;
        }
      } else if (insightName == "GetCommonEventGroupsPie" || insightName == "GetCommonEventGroupsFactoryPie") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "GroupName",
          stacking: "",
          label: "",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: selectedArg.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
          categories: [],
          toolTip: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          ID: "EventGroup",
          legendsType:"EventGroup",
          graph: $scope.graph,
        };
        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.toolTip = 6;
          dataInfo.data = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
        }

        res.ResponseDictionary.Body.forEach(function (temp) {
          if (temp.EventGroup == -1) {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "rgba(236, 231, 240, 1)",
              y: [],
              EventGroup: temp.EventGroup,
            });
          } else {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "",
              y: [],
              EventGroup: temp.EventGroup,
            });
          }
        });
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (temp[dataInfo.ID] == item.EventGroup) {
              item.y = temp[dataInfo.data];
            }
          });
        });
      } else if (insightName == "GetEventReasonsPie") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "EventName",
          ID: "Event",
          legendsType: "Event",
          stacking: "",
          label: "",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfEvents",
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          toolTip: 9,
          dataVariable: ["y"],
        };

        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 782) {
          dataInfo.toolTip = 6;
          dataInfo.data = "EventDuration";
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          if (temp.Event == -1) {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "rgba(236, 231, 240, 1)",
              y: [],
              Event: temp.Event,
            });
          } else {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "",
              y: [],
              Event: temp.Event,
            });
          }
        });
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (temp[dataInfo.ID] == item.Event) {
              item.y = temp[dataInfo.data];
            }
          });
        });
      } else if (insightName == "GetEventReasonsFactoryDistributionPie") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "EventName",
          stacking: "",
          label: "",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfEvents",
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          ID: "Event",
          toolTip: 3,
          dataVariable: ["y"],
          graph: $scope.graph,
          legendsType: "Event",
        };
        $scope.$emit("events", res.ResponseDictionary);
        if (selectedArg.key == 782) {
          dataInfo.toolTip = 6;
          dataInfo.data = "EventDuration";
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          if (temp.Event == -1) {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "rgba(236, 231, 240, 1)",
              y: [],
              Event: temp.Event,
            });
          } else {
            dataInfo.series.push({
              name: temp[dataInfo.name],
              color: "",
              y: [],
              Event: temp.Event,
            });
          }
        });
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (temp[dataInfo.ID] == item.Event) {
              item.y = temp[dataInfo.data];
            }
          });
        });
      } else if (insightName == "GetTotalStopEventsByType") {
        var dataInfo = {
          series: [
            {
              name: "DownTime",
              color: "rgba(191, 22, 32, 1)",
              y: [],
            },
            {
              name: "Idle",
              color: "rgba(166,168,171,1)",
              y: [],
            },
          ],
          xAxisName: "",
          categoriesName: $scope.localLanguage ? "LName" : "EName",
          stacking: "",
          label: "",
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          colors: "",
          toolTip: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
        };

        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 782) {
          dataInfo.toolTip = 6;
          dataInfo.data = "EventDuration";
        }
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.y = temp[item.name];
          });
        });
      } else {
        return;
      }
      insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildPieChart(dataInfo));
    };

    parseTime = function (d) {
      var dateFormatSplitter = ":";
      var tmpTime = d.split(dateFormatSplitter);
      return tmpTime[0] + dateFormatSplitter + tmpTime[1];
    };

    var buildWaterFallData = function (insight, res) {
      if (insight.Name == "GetWaterfallOEE" || insight.Name == "GetFactoryWaterfallOEE" ||  insight.Name == "GetDifCycleTimeFactoryWaterfallOEE") {
        var dataInfo = {
          series: [
            {
              name: "TotalTime",
              y: "",
              color: "#0080ff",
              sign: +1,
              showPercentage: false,
              displayValueZero: true,
              visible: true,
            },
            {
              name: "NonWorkingShiftTime",
              y: "",
              color: "rgba(167, 169, 171, 1)",
              sign: -1,
              showPercentage: false,
              displayValueZero: true,
              visible: true,
            },
            {
              name: $filter("translate")("AVAILABLE_TIME"),
              color: "#0080ff",
              isSum: true,
              sign: 1,
              showPercentage: false,
              displayValueZero: true,
              visible: true,
            },
            {
              name: "Planned",
              y: "",
              color: "rgba(69, 69, 69, 1)",
              sign: -1,
              showPercentage: false,
              displayValueZero: true,
              visible: true,
            },
            {
              name: "Idle",
              y: "",
              color: "rgba(69, 69, 69, 1)",
              sign: -1,
              showPercentage: false,
              displayValueZero: true,
              visible: true,
            },
            {
              name: "PlannedProductionTime",
              color: "#0080ff",
              isSum: true,
              sign: 1,
              showPercentage: true,
              displayValueZero: true,
              visible: true,
            },
            {
              name: "Setup",
              y: "",
              color: "rgba(65, 23, 105, 1)",
              sign: -1,
              showPercentage: true,
              displayValueZero: true,
              visible: true,
            },
          ],
          
          typeChart: "normal",
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 1,
          toolTip: 1,
          max: null,
        };

        if (res.ResponseDictionary.Body.length < 1) {
          return;
        }

        var otherEvents = [];
        var flag = false;
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }

            return flag
              ? {
                  name: key,
                  y: value,
                  color: "rgba(224, 110, 92, 1)",
                  sign: key !== "UnitsProducedOK" && key !== "UnitsProducedTheoretically" ? -1 : 1,
                  showPercentage: true,
                  displayValueZero: true,
                  visible: key !== "UnitsProducedOK" && key !== "UnitsProducedTheoretically",
                  find: key == "UnitsProducedOK" ? "UnitsProducedOK" : key == "UnitsProducedTheoretically" ? "UnitsProducedTheoretically" : null,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );
        dataInfo.series = [
          ...dataInfo.series,
          ...otherEvents,
          {
            name: "ShortStops",
            y: "",
            color: "rgba(224, 110, 92, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: false,
            visible: true,
          },

          {
            name: "Unreported",
            y: "",
            color: "rgba(135, 39, 39, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
          {
            name: "NoCommunication",
            y: "",
            color: "rgba(33, 128, 158, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
          {
            name: $filter("translate")("PRODUCTION_TIME"),
            color: "#0080ff",
            isSum: true,
            sign: 1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
          {
            name: "RateTimeLost",
            y: "",
            color: "rgba(163, 200, 255, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
          {
            name: "CavitiesEfficiencyLostMins",
            y: "",
            color: "rgba(163, 200, 255, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: false,
            visible: true,
          },
          {
            name: "QualityTimeLost",
            y: "",
            color: "rgba(163, 200, 255, 1)",
            sign: -1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
          {
            name: "PE",
            PEObject: true,
            isSum: true,
            color: "#0080ff",
            sign: 1,
            showPercentage: true,
            displayValueZero: true,
            visible: true,
          },
        ];
        if (res.ResponseDictionary.Target && !_.isEmpty(res.ResponseDictionary.Target)) {
          dataInfo.Target = true;
          var obj;
          _.forEach(res.ResponseDictionary.Target, function (target) {
            obj = _.find(dataInfo.series, { name: target.GroupName });
            if (obj) {
              obj.target = target.GroupTarget;
            }
          });
        } else {
          dataInfo.Target = false;
        }
        dataInfo.series = _.map(dataInfo.series, function (serie) {
          if (serie.PEObject) {
            serie.unitsProducedOk = _.find(dataInfo.series, { find: "UnitsProducedOK" });
            serie.UnitsProducedTheoretically = _.find(dataInfo.series, { find: "UnitsProducedTheoretically" });
          }
          if (!serie.isSum) {
            serie.y = res.ResponseDictionary.Body[0][serie.name] * serie.sign;
          }
          var found = _.find(res.ResponseDictionary.Translate, {
            ColumnName: serie.name,
          });
          if (found) {
            serie.name = found.Value;
          }
          return serie;
        });

        dataInfo.series = _.filter(dataInfo.series, (serie) => {
          if ((!serie.displayValueZero && !serie.y) || !serie.visible) {
            return false;
          }
          return true;
        });

        dataInfo.categories = _.map(dataInfo.series, function (serie) {
          return serie.name;
        });
      } else {
        return;
      }

      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildWaterFallChart(dataInfo));
      });
    };

    var buildBasicBarGraphData = function (insight, res, machines, selectedArg) {
      if (insight.Name == "GetRejectReasonsPareto" || insight.Name == "GetRejectReasonsFactoryPareto") {
        var dataInfo = {
          series: [
            {
              name: "Quantity",
              data: [],
              color: "rgba(0,0,0,1)",
            },
          ],
          
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          xAxisName: "Name",
          typeChart: "column",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          stacking: "normal",
          categories: [],
          legend: false,
          toolTip: 1,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          format: "{value}",
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          data: "Quantity",
        };
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetCommonEventGroupsPareto" || insight.Name == "GetLineEventGroups") {
        var dataInfo = {
          series: [
            {
              name: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesName: "GroupName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          label: "this.y",
          graph: $scope.graph,
          legend: false,
        };
        $scope.$emit("events", res.ResponseDictionary);
        if (selectedArg.key == 782 || selectedArg.key == "2315") {
          dataInfo.series[0].name = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
          dataInfo.toolTip = 4;
          dataInfo.formatter = 3;
        }
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: "rgba(224, 110, 92, 1)" });
          });
        });
      } else if (insight.Name == "GetCommonEventGroupsFactoryPareto") {
        var dataInfo = {
          series: [
            {
              name: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesName: "GroupName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          label: "this.y",
          legend: false,
          graph: $scope.graph,
        };

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.series[0].name = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
          dataInfo.toolTip = 4;
          dataInfo.formatter = 2;
        }

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: "rgba(224, 110, 92, 1)" });
          });
        });
      } else if (insight.Name == "GetEventReasonsParetoNoCalendar" || insight.Name == "GetLineEventReasons") {
        var dataInfo = {
          series: [
            {
              name: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesName: "EventName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          label: "this.y",
          serverData: res.ResponseDictionary,
          legend: false,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.series[0].name = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
          dataInfo.toolTip = 4;
          dataInfo.formatter = 3;
        }

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (temp.EventReason == "Setup") {
              item.data.push({ y: temp[item.name], color: "rgba(65, 23, 105, 1)" });
            } else if (temp.EventReason == "ManualLabor") {
              item.data.push({ y: temp[item.name], color: "rgba(144, 238, 144, 1)" });
            } else if (temp.EventReason == "Idle") {
              item.data.push({ y: temp[item.name], color: "rgba(166, 168, 171, 1)" });
            } else if (temp.EventReason == "DownTime") {
              item.data.push({ y: temp[item.name], color: "rgba(191, 22, 32, 1)" });
            } else if (temp.EventReason == "NoCommunication") {
              item.data.push({ y: temp[item.name], color: "rgba(33, 128, 158, 1)" });
            } else {
              item.data.push({
                y: temp[item.name],
                color: "rgba(71, 145, 255,1)",
              });
            }
          });
        });
      } else if (insight.Name == "GetEventReasonsFactoryDistributionParetoNoCalendar") {
        var dataInfo = {
          series: [
            {
              name: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesName: "EventName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          label: "this.y",
          serverData: res.ResponseDictionary,
          legend: false,
          graph: $scope.graph,
        };

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.series[0].name = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
          dataInfo.toolTip = 4;
          dataInfo.formatter = 2;
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (temp.EventReason == "Setup") {
              item.data.push({ y: temp[item.name], color: "rgba(65, 23, 105, 1)" });
            } else if (temp.EventReason == "ManualLabor") {
              item.data.push({ y: temp[item.name], color: "rgba(144, 238, 144, 1)" });
            } else if (temp.EventReason == "Idle") {
              item.data.push({ y: temp[item.name], color: "rgba(166, 168, 171, 1)" });
            } else if (temp.EventReason == "DownTime") {
              item.data.push({ y: temp[item.name], color: "rgba(191, 22, 32, 1)" });
            } else if (temp.EventReason == "NoCommunication") {
              item.data.push({ y: temp[item.name], color: "rgba(33, 128, 158, 1)" });
            } else {
              item.data.push({
                y: temp[item.name],
                color: "rgba(71, 145, 255,1)",
              });
            }
          });
        });
      } else {
        return;
      }
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildBasicBarChart(dataInfo));
      });
    };


    var buildHistogramData = function (insight, res, machines, selectedArg, department) {
      if (insight.Name == "GetMachineCycleTime") {
        var dataInfo = {
          series: [
            {
              name: "CycleTimeEfficiency",
              data: [],
              color: "",
            },
          ],
          
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: "MachineName",
          typeChart: "column",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };

        res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetWorstProductionAvailabilityWorkers") {
        var dataInfo = {
          series: [
            {
              name: "AvailabilityPE",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          xAxisName: $scope.localLanguage ? "DisplayHName" : "DisplayName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetWorkerCycleTime") {
        var dataInfo = {
          series: [
            {
              name: "CycleTimeEfficiency",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: "WorkerName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetNotifications") {
        var dataInfo = {
          series: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          categoriesName: "machineName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          xAxisName: "",
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
        };

          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
     
        dataInfo.series.push({
          name: "ServiceCall",
          dataName: "ServiceCall",
          data: [],
          color: "rgba(107, 194, 196, 1)",
          stack: "data",
        });

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
    

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });

      } else if (insight.Name == "GetNotificationByHour") {
        var dataInfo = {
          series: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          categoriesName: "StartTime",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          formatter: 1,
          xAxisName: "StartTime",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          serverData: res.ResponseDictionary,
        };

        dataInfo.series.push({
          name: "NumOfNotifications",
          dataName: "NumOfNotifications",
          data: [],
          color: "rgba(107, 194, 196, 1)",
          stack: "data",
        });

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });

      } else if (insight.Name == "GetNotificationByDay") {
        var dataInfo = {
          series: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          graph: $scope.graph,
          categoriesName: $scope.localLanguage ? "dayLXAxis" : "dayEXAxis",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          xAxisName: "StartTime",
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          formatChar: '"{point.y:.2f}"',
          serverData: res.ResponseDictionary,
          label: "{value}",
        };

        var order = {
          1: "Sunday",
          2: "Monday",
          3: "Tuesday",
          4: "Wednesday",
          5: "Thursday",
          6: "Friday",
          7: "Saturday",
        };
        var orderHeb = {
          1: "ראשון",
          2: "שני",
          3: "שלישי",
          4: "רביעי",
          5: "חמישי",
          6: "שישי",
          7: "שבת",
        };
        res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (item) {
          item.dayEXAxis = order[item.Day];
          item.dayLXAxis = orderHeb[item.Day];
          return item;
        });
        _.map(res.ResponseDictionary.Body, function (temp) {
          temp.Day = temp.Day.substring(0, temp.Day.indexOf("T"));
          return temp;
        });

        dataInfo.series.push({
          name: "NumOfNotifications",
          dataName: "NumOfNotifications",
          data: [],
          color: "rgba(107, 194, 196, 1)",
          stack: "data",
        });

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
  
      } else if (insight.Name == "GetWorstAvailabilityOEEWorkers") {
        var dataInfo = {
          series: [
            {
              name: "AvailabilityOEE",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: $scope.localLanguage ? "DisplayHName" : "DisplayName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          legend: false,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetWorstQualityIndexWorkers") {
        var dataInfo = {
          series: [
            {
              name: "QualityIndex",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: $scope.localLanguage ? "DisplayHName" : "DisplayName",
          typeChart: "column",
          stacking: "normal",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          format: "{value}",
          legend: false,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
   

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetWorstPEWorkers") {
        var dataInfo = {
          series: [
            {
              name: "PE",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: $scope.localLanguage ? "DisplayHName" : "DisplayName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          legend: false,
          toolTip: 5,
          formatChar: '"{point.y:.2f}"',
          serverData: res.ResponseDictionary,
          label: "{value}",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
     

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetWorstOEEWorkers") {
        var dataInfo = {
          series: [
            {
              name: "OEE",
              data: [],
              color: "",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: $scope.localLanguage ? "DisplayHName" : "DisplayName",
          typeChart: "column",
          stacking: "normal",
          format: "{value}",
          legend: false,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
     

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "AverageDepartmentAvailabilityByDay") {
        var order = {
          Sunday: 1,
          Monday: 2,
          Tuesday: 3,
          Wednesday: 4,
          Thursday: 5,
          Friday: 6,
          Saturday: 7,
        };

        customSortData(res.ResponseDictionary.Body, "WorkingDays", 1, order);
        var dataInfo = {
          series: [
            {
              name: "DownTimeEfficiency",
              data: [],
              color: "rgba(122, 93, 150, 1)",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: "WorkingDays",
          typeChart: "column",
          categories: [],
          data: "DownTimeEfficiency",
          legend: false,
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 4,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "this.value",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push($filter("translate")(item[dataInfo.xAxisName].toUpperCase()));
          });
    

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });

        if (!$scope.insightData.filters.scale) {
          dataInfo.max = null;
          dataInfo.min = null;
        }
        dataInfo.colors = GroupColors("rgba(143, 230, 232, 1)");
      } else if (insight.Name == "GetTopProductRejects") {
        $scope.xAxisInsightSelectArray = ["ProductEName", "ProductName", "ProductID", "CatalogID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }
        var dataInfo = {
          series: [
            {
              name: "RejectsTotal",
              data: [],
              color: "rgba(0,0,0,1)",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: "",
          typeChart: "column",
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          formatter: 1,
          legend: false,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          toolTip: 2,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "{value}",
          graph: $scope.graph,
        };
       
        if (insight?.selectedArg3?.key == "2363") {
          dataInfo.xAxisName = "CatalogID";
        } else if (insight?.selectedArg3?.key == "2275") {
          dataInfo.xAxisName= "ProductName";
        } else if (insight.selectedArg3.key == "708") {
          dataInfo.xAxisName = "ProductID";
        } 
        if (insight.selectedArg.key == 795) {
          dataInfo.series[0].name = "RejectsTotalPC";
          dataInfo.toolTip = 6;
          dataInfo.format = "{value}%";
          dataInfo.formatter = 3;
          dataInfo.min = 0;
          dataInfo.max = 100;
        } else if (insight.selectedArg.key == 2323) {
          dataInfo.series[0].name = "PPM";
          dataInfo.toolTip = 1;
        }
        else if (insight.selectedArg.key == 2343) {
          dataInfo.series[0].name = "WeightOfRejectsKG";
          dataInfo.toolTip = 1;
        }
        else if (insight.selectedArg.key == 2305) {
          dataInfo.series[0].name = "WeightOfRejectsGR";
          dataInfo.toolTip = 1;
        }
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color, productID: temp.ProductID });
          });
        });
      } else if (insight.Name == "GetTopMoldRejects") {
        var dataInfo = {
          series: [
            {
              name: "RejectsTotal",
              data: [],
              color: "rgba(0,0,0,1)",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: "",
          typeChart: "column",
          categories: [],
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          legend: false,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          toolTip: 2,
          serverData: res.ResponseDictionary,
          label: "{value}%",
          graph: $scope.graph,
        };

        if (insight?.selectedArg3?.key == "2274") {
          dataInfo.xAxisName = "MoldName";
        } else if (insight?.selectedArg3?.key == "1488") {
          dataInfo.xAxisName= "LocalID";
        } else if (insight.selectedArg3.key == "2359") {
          dataInfo.xAxisName = "MoldID";
        } 
        if (insight.selectedArg.key == 795) {
          dataInfo.series[0].name = "RejectsTotalPC";
          dataInfo.format = "{value}%";
          dataInfo.formatter = 3;
          dataInfo.min = 0;
          dataInfo.toolTip = 6;
          dataInfo.max = 100;
        } else if (insight.selectedArg.key == 2323) {
          dataInfo.series[0].name = "PPM";
          dataInfo.toolTip = 1;
        }  else if (insight.selectedArg.key == 2343) {
          dataInfo.series[0].name = "WeightOfRejectsKG";
          dataInfo.toolTip = 1;
        }
        else if (insight.selectedArg.key == 2305) {
          dataInfo.series[0].name = "WeightOfRejectsGR";
          dataInfo.toolTip = 1;
        }
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color, mold: temp });
          });
        });
      } else if (insight.Name == "GetMachineRejects") {
        var dataInfo = {
          series: [
            {
              name: "RejectsTotal",
              data: [],
              color: "rgba(0,0,0,1)",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: $scope.localLanguage ? "MachineLName" : "MachineName",
          typeChart: "column",
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          format: "{value}",
          legend: false,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          toolTip: 1,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y}"',
          label: "this.value",
          graph: $scope.graph,
        };
        if (insight.selectedArg.key == 795) {
          dataInfo.series[0].name = "RejectsTotalPC";
          dataInfo.toolTip = 6;
          dataInfo.format = "{value}%";
          dataInfo.formatter = 3;
          dataInfo.min = 0;
          dataInfo.max = 100;
        } else if (insight.selectedArg.key == 2323) {
          dataInfo.series[0].name = "PPM";
          dataInfo.toolTip = 1;
        }  else if (insight.selectedArg.key == 2343) {
          dataInfo.series[0].name = "WeightOfRejectsKG";
          dataInfo.toolTip = 1;
        }
        else if (insight.selectedArg.key == 2305) {
          dataInfo.series[0].name = "WeightOfRejectsGR";
          dataInfo.toolTip = 1;
        }
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxisName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "GetFactoryRejects") {
        var dataInfo = {
          series: [
            {
              name: "Quantity",
              data: [],
              color: "rgba(0,0,0,1)",
            },
          ],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesName: "departmentName",
          typeChart: "column",
          categories: [],
          format: "{value}",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          legend: false,
          formatter: 1,
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          toolTip: 2,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y}"',
          label: "this.value",
          graph: $scope.graph,
        };

        res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
      } else if (insight.Name == "AverageDepartmentAvailability") {
        var dataInfo = {
          series: [
            {
              name: "DownTimeEfficiency",
              data: [],
              color: "rgba(122, 93, 150, 1)",
            },
          ],
          
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          
          xAxisName: "StartTime",
          typeChart: "column",
          format: "{value}",
          formatter: 4,
          data: "DownTimeEfficiency",
          min: insight.LValue ? insight.LValue : null,
          max: insight.HValue ? insight.HValue : null,
          categories: [],
          legend: false,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          toolTip: 5,
          serverData: res.ResponseDictionary,
          formatChar: '"{point.y:.2f}"',
          label: "this.value",
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxisName]);
          });
   

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], color: item.color });
          });
        });
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters && !$sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
          dataInfo.max = null;
          dataInfo.min = null;
        }
        dataInfo.colors = GroupColors("rgba(143, 230, 232, 1)");
      } else {
        return;
      }
      if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters && !$sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
        dataInfo.max = null;
        dataInfo.min = null;
      }
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildBarChart(dataInfo));
      });
    };

    var buildHeatMapGraphData = function (insight, res, machines) {
      var ratio,
        minValues = {},
        minValuesTotals = {},
        maxValues = {},
        maxValuesTotals = {},
        newSort,
        tempArray = {},
        minRatio = Infinity,
        maxRatio = -Infinity,
        color;

      if (insight.Name == "GetUnitsProducedGrouped") {
        //todo need refactory
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesX: [],
          categoriesY: [],
          categoriesXID: [],
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "ShiftName",
          tooltip: 3,
          series: [],
          idX: "",
          idY: "ShiftID",
          pickerDate: $scope.pickerDate,
          graph: $scope.graph,
          heatMapColors: $scope.heatMapColors
        };
        if ($scope.graph?.options?.settings?.colorMode) {
          dataInfo.colors = angular.copy($scope.graph?.options?.settings?.colorMode);
        }
        //get kpi list from the server
        insightsDashboardCtrl.kpiList = angular.copy(res.ResponseDictionary.UnitsProduced);
        
        //initialize kpi select
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectKpi) {
          insightsDashboardCtrl.insight.selectKpi = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectKpi;
        } else if (!insightsDashboardCtrl.insight.selectKpi) {
          insightsDashboardCtrl.insight.selectKpi = _.find(insightsDashboardCtrl.kpiList, { ColumnName: "UnitsProducedOK" });
        }
        
        if(["RejectsTotal","WeightOfRejectsKG","WeightOfRejectsGR"].includes(insightsDashboardCtrl.insight?.selectKpi?.ColumnName)){
          $scope.$emit("reverseColorPerformance", true);
        }
        else
        {
          $scope.$emit("reverseColorPerformance", false);
        }
        if (+insight.selectedArg.key == 780 || +insight.selectedArg.key == 2286) {
          dataInfo.categoriesYName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idY = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.y = insight.selectedArg.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 963) {
          dataInfo.categoriesYName = "Month";
          dataInfo.idY = "Month";
          dataInfo.y = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 696) {
          dataInfo.categoriesYName = "Day";
          dataInfo.idY = "Day";
          dataInfo.y = `${$filter("translate")("DAY")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            day = moment(item[dataInfo.categoriesYName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
            dataInfo.categoriesYID.push(day);
            dataInfo.categoriesY.push(day);
            item.Day = day;
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 182) {
          dataInfo.categoriesYName = "ShiftName";
          dataInfo.idY = "ShiftID";
          dataInfo.y = `${$filter("translate")("SHIFT")}`;
 
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ShiftID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 706) {
          dataInfo.categoriesYName = "MachineName";
          dataInfo.idY = "MachineID";
          dataInfo.y = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.MachineID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 712) {
          dataInfo.categoriesYName = "WorkerName";
          dataInfo.idY = "WorkerID";
          dataInfo.y = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.WorkerID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 708 || +insight.selectedArg.key == 870) {
          dataInfo.categoriesYName = "ProductName";
          dataInfo.idY = "ProductID";
          dataInfo.y = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ProductID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if(+insight.selectedArg.key  < 0  || +insight.selectedArg.key == 707 || +insight.selectedArg.key == 331 || +insight.selectedArg.key == 2362 || +insight.selectedArg.key == 2363){
          
          if(+insight.selectedArg.key == 2363){
            dataInfo.categoriesYName = "ProductCatalogID";
            dataInfo.idY = "ProductCatalogID";
            dataInfo.y = `${$filter("translate")("PRODUCT_CATALOG_ID")}`;
          }
          else if(+insight.selectedArg.key == 331){
            dataInfo.categoriesYName = "ProductGroupName";
            dataInfo.idY = "ProductGroupID";
            dataInfo.y = `${$filter("translate")("PRODUCT_GROUP")}`;
          }
          else if(+insight.selectedArg.key == 707 || +insight.selectedArg.key == 2362){
            dataInfo.categoriesYName = "MoldName";
            dataInfo.idY = "MoldID";
            dataInfo.y = `${$filter("translate")("MOLD")}`;
          }
          else
          {
            dataInfo.categoriesYName = "JobListParameterName";
            dataInfo.idY = "JobListParameterID";
            dataInfo.y = `${$filter("translate")("JOB_LIST_PARAMETER_NAME")}`;
          }
        
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item[dataInfo.idY]);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        }

        if (+insight.selectedArg2.key == 780 || +insight.selectedArg2.key == 2286) {
          dataInfo.categoriesXName = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idX = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.x = insight.selectedArg2.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 963) {
          dataInfo.categoriesXName = "Month";
          dataInfo.idX = "Month";
          dataInfo.x = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)]
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)]
        } else if (+insight.selectedArg2.key == 696) {
          dataInfo.categoriesXName = "Day";
          dataInfo.x = `${$filter("translate")("DAY")}`;
          dataInfo.idX = "Day";
          res.ResponseDictionary.Body.forEach(function (item) {
            if (item.Day?.indexOf("T") != -1) {
              day = moment(item[dataInfo.categoriesXName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categoriesXID.push(day);
              dataInfo.categoriesX.push(day);
              item.Day = day;
            } else {
              dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
              dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            }
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 182) {
          dataInfo.categoriesXName = "ShiftName";
          dataInfo.x = `${$filter("translate")("SHIFT")}`;
          dataInfo.idX = "ShiftID";
 
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ShiftID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 706) {
          dataInfo.categoriesXName = "MachineName";
          dataInfo.idX = "MachineID";
          dataInfo.x = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.MachineID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 712) {
          dataInfo.categoriesXName = "WorkerName";
          dataInfo.idX = "WorkerID";
          dataInfo.x = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.WorkerID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 708 || +insight.selectedArg2.key == 870) {
          dataInfo.categoriesXName = "ProductName";
          dataInfo.idX = "ProductID";
          dataInfo.x = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ProductID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if(+insight.selectedArg2.key  < 0 || +insight.selectedArg2.key == 707 || +insight.selectedArg2.key == 331 || +insight.selectedArg2.key == 2362 || +insight.selectedArg2.key == 2363){
          if(+insight.selectedArg2.key == 2363){
            dataInfo.categoriesXName = "ProductCatalogID";
            dataInfo.idX = "ProductCatalogID";
            dataInfo.x   = `${$filter("translate")("PRODUCT_CATALOG_ID")}`;
          }else if(+insight.selectedArg2.key == 331){
            dataInfo.categoriesXName = "ProductGroupName";
            dataInfo.idX = "ProductGroupID";
            dataInfo.x = `${$filter("translate")("PRODUCT_GROUP")}`;
          }
          else if(+insight.selectedArg2.key == 707 || +insight.selectedArg2.key == 2362){
            dataInfo.categoriesXName = "MoldName";
            dataInfo.idX = "MoldID";
            dataInfo.x = `${$filter("translate")("MOLD")}`;
          }
          else
          {
            dataInfo.categoriesXName = "JobListParameterName";
            dataInfo.idX = "JobListParameterID";
            dataInfo.x = `${$filter("translate")("JOB_LIST_PARAMETER_NAME")}`;
          }
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item[dataInfo.idX]);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        }

        //get all the minmum values to KPIS to calculate the colors value
        minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] = 0;
        _.forEach(res.ResponseDictionary.Body, function (data) {
          if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] < minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] || minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] == undefined)) {
            minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] = data[insightsDashboardCtrl.insight.selectKpi.ColumnName] / data[insightsDashboardCtrl.insight.selectKpi.ColumnName + "Target"];
          }
          if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] > maxValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] || maxValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] == undefined)) {
            maxValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] = data[insightsDashboardCtrl.insight.selectKpi.ColumnName] / data[insightsDashboardCtrl.insight.selectKpi.ColumnName + "Target"];
          }
        });

        _.forEach(dataInfo.categoriesYID, function (yName, j) {
          _.forEach(dataInfo.categoriesXID, function (xName, i) {
            if (+insight.selectedArg2.key != +insight.selectedArg.key) {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName && d[dataInfo.idX] == xName;
              });
            } else {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName;
              });
            }
            if (!data) {
              data = {};
              data[insightsDashboardCtrl.insight.selectKpi.ColumnName] = 0
              data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] = 0
            }
            if (data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] > 0) {
              ratio = data[insightsDashboardCtrl.insight.selectKpi.ColumnName] / data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`];
              color = getHeatMapColor(ratio, minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName],data[insightsDashboardCtrl.insight.selectKpi.ColumnName],data[insightsDashboardCtrl.insight.selectKpi.ColumnName+"Target"]);
            } else if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && data[insightsDashboardCtrl.insight.selectKpi.ColumnName] > 0 && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] == 0) {
              color = getHeatMapColor($scope.graph?.options.settings.heatMapColors[0].color, 1,data[insightsDashboardCtrl.insight.selectKpi.ColumnName],data[insightsDashboardCtrl.insight.selectKpi.ColumnName+"Target"]);
            } else if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] == 0 && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] == 0) {
              ratio = minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName];
              color = `rgba(255,255,255,1)`;
            }

            const getItemValue = () => {
              return $filter("thousandsSeperator")(belowOrAboveHundred(data[insightsDashboardCtrl.insight.selectKpi.ColumnName]));
            };

            const getItemTarget = () => {
              if ($scope.graph?.options?.settings?.targetMode) {
                return  `<span>(${$filter("thousandsSeperator")(belowOrAboveHundred(data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`]))})</span></br>`;
              }
              return ''
            };

            const getItemJoshes = () => {
              if ($scope.graph?.options?.settings?.joshesMode) {
                return `<span style="display:flex; justify-content: center;">${data.NumberOfJoshes}</span>`;
              }
              return '';
            }

            if ((data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`]) || (data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] > 0)) {
              result = 
                  `<span>
                    ${getItemValue()}
                  </span>
                  ${getItemTarget()}
                  ${getItemJoshes()}`;
            } else {
              result = null;
            }
            
            dataInfo.series.push({
              x: i,
              y: j,
              result: result,
              numberOfJoshes : data.NumberOfJoshes,
              data: data[insightsDashboardCtrl.insight.selectKpi.ColumnName] != null ? parseInt(data[insightsDashboardCtrl.insight.selectKpi.ColumnName]) : null,
              dataTarget: data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] != null ? parseInt(data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`]) : null,
              color: data[insightsDashboardCtrl.insight.selectKpi.ColumnName] != null && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] != null ? color : "rgba(230, 230, 230,1)",
              shiftStartTimeY:insight.selectedArg.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null,
              shiftStartTimeX:insight.selectedArg2.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null
            });
          });
        });

        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetKPIMeasuresGrouped") {
        //todo need refactory
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesX: [],
          categoriesY: [],
          categoriesXID: [],
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "ShiftName",
          tooltip: 2,
          series: [],
          idX: "",
          idY: "ShiftID",
          pickerDate: $scope.pickerDate,
          graph: $scope.graph,
          heatMapColors: $scope.heatMapColors
        };
        if (dataInfo) {
          dataInfo.colors = angular.copy($scope.heatMapColors?.colorMode);
        }
        //get kpi list from the server
        insightsDashboardCtrl.kpiList = angular.copy(res.ResponseDictionary.KPIs);
        //initialize kpi select
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectKpi) {
          insightsDashboardCtrl.insight.selectKpi = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectKpi;
        } else if (!insightsDashboardCtrl.insight.selectKpi) {
          insightsDashboardCtrl.insight.selectKpi = _.find(insightsDashboardCtrl.kpiList, { ColumnName: "AvailabilityPE" });
        }
        if (+insight.selectedArg.key == 780 || +insight.selectedArg.key == 2286) {
          dataInfo.categoriesYName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idY = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.y = insight.selectedArg.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 963) {
          dataInfo.categoriesYName = "Month";
          dataInfo.idY = "Month";
          dataInfo.y = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)]
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)]
        } else if (+insight.selectedArg.key == 696) {
          dataInfo.categoriesYName = "Day";
          dataInfo.idY = "Day";
          dataInfo.y = `${$filter("translate")("DAY")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            day = moment(item[dataInfo.categoriesYName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
            dataInfo.categoriesYID.push(day);
            dataInfo.categoriesY.push(day);
            item.Day = day;
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 182) {
          dataInfo.categoriesYName = "ShiftName";
          dataInfo.idY = "ShiftID";
          dataInfo.y = `${$filter("translate")("SHIFT")}`;
    
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ShiftID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 706) {
          dataInfo.categoriesYName = "MachineName";
          dataInfo.idY = "MachineID";
          dataInfo.y = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.MachineID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 712) {
          dataInfo.categoriesYName = "WorkerName";
          dataInfo.idY = "WorkerID";
          dataInfo.y = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.WorkerID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 708 || +insight.selectedArg.key ==870) {
          dataInfo.categoriesYName = "ProductName";
          dataInfo.idY = "ProductID";
          dataInfo.y = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ProductID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        }  else if(+insight.selectedArg.key < 0  || +insight.selectedArg.key == 707 || +insight.selectedArg.key == 331 || +insight.selectedArg.key == 2362 || +insight.selectedArg.key == 2363){
          if(+insight.selectedArg.key == 2363){
            dataInfo.categoriesYName = "ProductCatalogID";
            dataInfo.idY = "ProductCatalogID";
            dataInfo.y   = `${$filter("translate")("PRODUCT_CATALOG_ID")}`;
          }else if(+insight.selectedArg.key == 331){
            dataInfo.categoriesYName = "ProductGroupName";
            dataInfo.idY = "ProductGroupID";
            dataInfo.y = `${$filter("translate")("PRODUCT_GROUP")}`;
          }
          else if(+insight.selectedArg.key == 707 || +insight.selectedArg.key == 2362){
            dataInfo.categoriesYName = "MoldName";
            dataInfo.idY = "MoldID";
            dataInfo.y = `${$filter("translate")("MOLD")}`;
          }
          else
          {
            dataInfo.categoriesYName = "JobListParameterName";
            dataInfo.idY = "JobListParameterID";
            dataInfo.y = `${$filter("translate")("JOB_LIST_PARAMETER_NAME")}`;
          }
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item[dataInfo.idY]);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        }
        if (+insight.selectedArg2.key == 780 || +insight.selectedArg2.key == 2286) {
          dataInfo.categoriesXName = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idX = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.x = insight.selectedArg2.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 963) {
          dataInfo.categoriesXName = "Month";
          dataInfo.idX = "Month";
          dataInfo.x = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)]
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)]
        } else if (+insight.selectedArg2.key == 696) {
          dataInfo.categoriesXName = "Day";
          dataInfo.x = `${$filter("translate")("DAY")}`;
          dataInfo.idX = "Day";
          res.ResponseDictionary.Body.forEach(function (item) {
            day = moment(item[dataInfo.categoriesXName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))

            if (+insight.selectedArg2.key != +insight.selectedArg.key) {
              dataInfo.categoriesXID.push(day);
              dataInfo.categoriesX.push(day);
              item.Day = day;
            } else {
              dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
              dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
              item.Day = item[dataInfo.categoriesXName];
            }
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 182) {
          dataInfo.categoriesXName = "ShiftName";
          dataInfo.x = `${$filter("translate")("SHIFT")}`;
          dataInfo.idX = "ShiftID";

          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ShiftID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 706) {
          dataInfo.categoriesXName = "MachineName";
          dataInfo.idX = "MachineID";
          dataInfo.x = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.MachineID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 712) {
          dataInfo.categoriesXName = "WorkerName";
          dataInfo.idX = "WorkerID";
          dataInfo.x = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.WorkerID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 708 || +insight.selectedArg2.key ==870) {
          dataInfo.categoriesXName = "ProductName";
          dataInfo.idX = "ProductID";
          dataInfo.x = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ProductID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        }
        else if(+insight.selectedArg2.key < 0 || +insight.selectedArg2.key == 707 || +insight.selectedArg2.key == 331 || +insight.selectedArg2.key == 2362 || +insight.selectedArg2.key == 2363){
          if(+insight.selectedArg2.key == 2363){
            dataInfo.categoriesXName = "ProductCatalogID";
            dataInfo.idX = "ProductCatalogID";
            dataInfo.x   = `${$filter("translate")("PRODUCT_CATALOG_ID")}`;
          }else if(+insight.selectedArg2.key == 331){
            dataInfo.categoriesXName = "ProductGroupName";
            dataInfo.idX = "ProductGroupID";
            dataInfo.x = `${$filter("translate")("PRODUCT_GROUP")}`;
          }
          else if(+insight.selectedArg2.key == 707 || +insight.selectedArg2.key == 2362){
            dataInfo.categoriesXName = "MoldName";
            dataInfo.idX = "MoldID";
            dataInfo.x = `${$filter("translate")("MOLD")}`;
          }
          else
          {
            dataInfo.categoriesXName = "JobListParameterName";
            dataInfo.idX = "JobListParameterID";
            dataInfo.x = `${$filter("translate")("JOB_LIST_PARAMETER_NAME")}`;
          }
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item[dataInfo.idX]);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        }
        
        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data) {
          if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] < minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] || minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] == undefined)) {
            minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] = data[insightsDashboardCtrl.insight.selectKpi.ColumnName];
          }
          if (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] && (data[insightsDashboardCtrl.insight.selectKpi.ColumnName] > minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] || minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] == undefined)) {
            maxValues[insightsDashboardCtrl.insight.selectKpi.ColumnName] = data[insightsDashboardCtrl.insight.selectKpi.ColumnName];
          }
        });
        
        _.forEach(dataInfo.categoriesYID, function (yName, j) {
          _.forEach(dataInfo.categoriesXID, function (xName, i) {
            if (+insight.selectedArg2.key != +insight.selectedArg.key) {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName && d[dataInfo.idX] == xName;
              });
            } else {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName;
              });
            }
            if (!data){
              data = {}
              data[insightsDashboardCtrl.insight.selectKpi.ColumnName] = 0
              data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] = 0;
            }
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[insightsDashboardCtrl.insight.selectKpi.ColumnName] / data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`];
            } else {
              ratio = data[insightsDashboardCtrl.insight.selectKpi.ColumnName];
            }

            const getItemValue = () => {
              return belowOrAboveHundred(data[insightsDashboardCtrl.insight.selectKpi.ColumnName]*100);
            };

            const getItemTarget = () => {
              if ($scope.graph?.options?.settings?.targetMode) {
                return  `<span>(${belowOrAboveHundred(data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`]*100)}%)</span></br>`;
              }
              return ''
            };

            const getItemJoshes = () => {
              if ($scope.graph?.options?.settings?.joshesMode) {
                return `<span style="display:flex; justify-content: center;">${data.NumberOfJoshes}</span>`;
              }
              return '';
            }


            color = getHeatMapColor(ratio, minValues[insightsDashboardCtrl.insight.selectKpi.ColumnName],data[insightsDashboardCtrl.insight.selectKpi.ColumnName],data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`],maxValues[insightsDashboardCtrl.insight.selectKpi.ColumnName]);
            dataInfo.series.push({
              x: i,
              y: j,
              result:
                data[insightsDashboardCtrl.insight.selectKpi.ColumnName] != null && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] != null && color != "#F7F7F7"
                ? 
                  `<span>
                    ${getItemValue()}%
                  </span>
                  ${getItemTarget()}
                  ${getItemJoshes()}`
                : null,
              numberOfJoshes : data.NumberOfJoshes,
              data: data[insightsDashboardCtrl.insight.selectKpi.ColumnName] != null ? belowOrAboveHundred(data[insightsDashboardCtrl.insight.selectKpi.ColumnName] * 100) : null,
              dataTarget: data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] != null ? belowOrAboveHundred(data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] * 100) : null,
              color: data[insightsDashboardCtrl.insight.selectKpi.ColumnName] != null && data[`${insightsDashboardCtrl.insight.selectKpi.ColumnName}Target`] != null ? color : "rgba(230, 230, 230,1)",
              shiftStartTimeY:insight.selectedArg.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null,
              shiftStartTimeX:insight.selectedArg2.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null
            });
          });
        });
        
        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetAggregatedSetupsDataStandard") {
        //todo need refactory
        
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesX: [],
          categoriesY: [],
          categoriesXID: [],
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "ShiftName",
          tooltip: 4,
          series: [],
          idX: "",
          idY: "ShiftID",
          pickerDate: $scope.pickerDate,
          graph: $scope.graph,
        };
        if (dataInfo) {
          dataInfo.colors = angular.copy($scope.heatMapColors?.colorMode);
        }
   

        if (insight?.selectedArg3?.key == "2180") {
          insightsDashboardCtrl.insight.selectKpi = "NumberOfSetups";
          $scope.$emit("NumberOfSetupsActivate", false);
        } else if (insight?.selectedArg3?.key == "2348") {
          insightsDashboardCtrl.insight.selectKpi = "DurationOfSetups";
          dataInfo.tooltip = 5
          $scope.$emit("NumberOfSetupsActivate", true);
        } else if (insight.selectedArg3.key == "2349") {
          insightsDashboardCtrl.insight.selectKpi = "AverageDurationOfSetups";
          $scope.$emit("NumberOfSetupsActivate", true);
          dataInfo.tooltip = 5
        } 

        if (+insight.selectedArg.key == 780 || +insight.selectedArg.key == 2286) {
          dataInfo.categoriesYName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idY = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.y = insight.selectedArg.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 963) {
          dataInfo.categoriesYName = "Month";
          dataInfo.idY = "Month";
          dataInfo.y = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName]);
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)]
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)]
        } else if (+insight.selectedArg.key == 696) {
          dataInfo.categoriesYName = "Day";
          dataInfo.idY = "Day";
          dataInfo.y = `${$filter("translate")("DAY")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item[dataInfo.categoriesYName].substring(0, item.Day?.indexOf("T")));
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName].substring(0, item.Day?.indexOf("T")));
            item.Day = item[dataInfo.categoriesYName].substring(0, item.Day?.indexOf("T"));
          });
          dataInfo.categoriesY = [...new Set(dataInfo.categoriesY)];
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 182) {
          dataInfo.categoriesYName = "ShiftName";
          dataInfo.idY = "ShiftID";
          dataInfo.y = `${$filter("translate")("SHIFT")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ShiftID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 706) {
          dataInfo.categoriesYName = "MachineName";
          dataInfo.idY = "MachineID";
          dataInfo.y = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.MachineID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 712) {
          dataInfo.categoriesYName = "WorkerName";
          dataInfo.idY = "WorkerID";
          dataInfo.y = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.WorkerID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 708) {
          dataInfo.categoriesYName = "ProductName";
          dataInfo.idY = "ProductID";
          dataInfo.y = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.ProductID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 2347) {
          dataInfo.categoriesYName = "WorkerName";
          dataInfo.idY = "WorkerID";
          dataInfo.y = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.WorkerID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        } else if (+insight.selectedArg.key == 707) {
          dataInfo.categoriesYName = "MoldName";
          dataInfo.idY = "MoldID";
          dataInfo.y = `${$filter("translate")("MOLD")}`;
          dataInfo.categoriesY = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.categoriesYName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesYID.push(item.MoldID);
          });
          dataInfo.categoriesYID = [...new Set(dataInfo.categoriesYID)];
        }


        if (+insight.selectedArg2.key == 780 || +insight.selectedArg2.key == 2286) {
          dataInfo.categoriesXName = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.idX = insight.selectedArg2.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.x = insight.selectedArg2.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 963) {
          dataInfo.categoriesXName = "Month";
          dataInfo.idX = "Month";
          dataInfo.x = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
            dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)]
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)]
        } else if (+insight.selectedArg2.key == 696) {
          dataInfo.categoriesXName = "Day";
          dataInfo.x = `${$filter("translate")("DAY")}`;
          dataInfo.idX = "Day";
          res.ResponseDictionary.Body.forEach(function (item) {
            if (+insight.selectedArg2.key != +insight.selectedArg.key) {
              dataInfo.categoriesXID.push(item[dataInfo.categoriesXName].substring(0, item.Day?.indexOf("T")));
              dataInfo.categoriesX.push(item[dataInfo.categoriesXName].substring(0, item.Day?.indexOf("T")));
              item.Day = item[dataInfo.categoriesXName].substring(0, item.Day?.indexOf("T"));
            } else {
              dataInfo.categoriesXID.push(item[dataInfo.categoriesXName]);
              dataInfo.categoriesX.push(item[dataInfo.categoriesXName]);
              item.Day = item[dataInfo.categoriesXName];
            }
          });
          dataInfo.categoriesX = [...new Set(dataInfo.categoriesX)];
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 182) {
          dataInfo.categoriesXName = "ShiftName";
          dataInfo.x = `${$filter("translate")("SHIFT")}`;
          dataInfo.idX = "ShiftID";
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ShiftID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 706) {
          dataInfo.categoriesXName = "MachineName";
          dataInfo.idX = "MachineID";
          dataInfo.x = `${$filter("translate")("MACHINES")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.MachineID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 712) {
          dataInfo.categoriesXName = "WorkerName";
          dataInfo.idX = "WorkerID";
          dataInfo.x = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.WorkerID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 708) {
          dataInfo.categoriesXName = "ProductName";
          dataInfo.idX = "ProductID";
          dataInfo.x = `${$filter("translate")("PRODUCT")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.ProductID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        }else if (+insight.selectedArg2.key == 2347) {
          dataInfo.categoriesXName = "WorkerName";
          dataInfo.idX = "WorkerID";
          dataInfo.x = `${$filter("translate")("WORKER")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.WorkerID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        } else if (+insight.selectedArg2.key == 707) {
          dataInfo.categoriesXName = "MoldName";
          dataInfo.idX = "MoldID";
          dataInfo.x = `${$filter("translate")("MOLD")}`;
          dataInfo.categoriesX = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idX]}_${item[dataInfo.categoriesXName]}`;
            }),
            dataInfo.categoriesXName
          );
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesXID.push(item.MoldID);
          });
          dataInfo.categoriesXID = [...new Set(dataInfo.categoriesXID)];
        }
          //get all the maximum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data) {
          if (_.isNumber(data[insightsDashboardCtrl.insight.selectKpi]) && (data[insightsDashboardCtrl.insight.selectKpi] > maxValues[insightsDashboardCtrl.insight.selectKpi] || maxValues[insightsDashboardCtrl.insight.selectKpi] == undefined)) {
            maxValues[insightsDashboardCtrl.insight.selectKpi] = data[insightsDashboardCtrl.insight.selectKpi];
          }
        });
        
        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data) {
          if (_.isNumber(data[insightsDashboardCtrl.insight.selectKpi]) && (data[insightsDashboardCtrl.insight.selectKpi] < minValues[insightsDashboardCtrl.insight.selectKpi] || minValues[insightsDashboardCtrl.insight.selectKpi] == undefined)) {
            minValues[insightsDashboardCtrl.insight.selectKpi] = data[insightsDashboardCtrl.insight.selectKpi];
          }
        });
        
        _.forEach(dataInfo.categoriesYID, function (yName, j) {
          _.forEach(dataInfo.categoriesXID, function (xName, i) {
            if (+insight.selectedArg2.key != +insight.selectedArg.key) {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName && d[dataInfo.idX] == xName;
              });
            } else {
              data = _.find(res.ResponseDictionary.Body, function (d) {
                return d[dataInfo.idY] == yName;
              });
            }
            if (!data){
              data = {}
              data[insightsDashboardCtrl.insight.selectKpi] =0
              data.SetupDurationStandard = 0  
            }
            
            if(insight?.selectedArg3?.key == "2180")
            {
              ratio = ((data[insightsDashboardCtrl.insight.selectKpi] / maxValues[insightsDashboardCtrl.insight.selectKpi])*100)/100;
            }
            else if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[insightsDashboardCtrl.insight.selectKpi] / data.SetupDurationStandard;
            } else {
              ratio = data[insightsDashboardCtrl.insight.selectKpi];
            }
            color = getHeatMapColor(ratio, minValues[insightsDashboardCtrl.insight.selectKpi],data[insightsDashboardCtrl.insight.selectKpi],data.SetupDurationStandard,null,insight?.selectedArg3?.key == "2180");            
            dataInfo.series.push({
              x: i,
              y: j,
              result:
                data[insightsDashboardCtrl.insight.selectKpi] != null && data.SetupDurationStandard != null && color != "#F7F7F7"
                ? `${convertToHours(belowOrAboveHundred(data[insightsDashboardCtrl.insight.selectKpi]),insight?.selectedArg3?.key)}${$scope.graph?.options?.settings?.targetMode && insight?.selectedArg3?.key != "2180" ? " (" + convertToHours(belowOrAboveHundred(data.SetupDurationStandard),insight?.selectedArg3?.key)  +")" : ""}`
                : null,
              data: data[insightsDashboardCtrl.insight.selectKpi] != null ? belowOrAboveHundred(data[insightsDashboardCtrl.insight.selectKpi] ) : null,
              dataTarget: data.SetupDurationStandard != null ? belowOrAboveHundred(data.SetupDurationStandard ) : null,
              color: data[insightsDashboardCtrl.insight.selectKpi] != null && data.SetupDurationStandard != null ? color : "rgba(230, 230, 230,1)",
            });
          });
        });
        
        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetShiftsKPIMeasuresByStartTime") {
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: true,
          categoriesY: [],
          categoriesX: _.map(
            _.filter($scope.graph.KPIsForHeatmap.kpis, (kpi) => kpi.display),
            (shift) => shift.name
          ),
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "Shift",
          tooltip: 2,
          isShift: $scope.isShift,
          series: [],
          x: `${$filter("translate")("KPIS")}`,
          y: `${$filter("translate")("SHIFT")}`,
          idX: "",
          idY: "ShiftID",
          ID: $scope.graph?.ID,
          graph: $scope.graph,
        };
        if (dataInfo) {
          dataInfo.colors = angular.copy($scope.heatMapColors?.colorMode);
        }
        if (res?.ResponseDictionary?.Body?.length + res?.ResponseDictionary?.Totals?.length < 7) {
          $scope.insightHeight = "470px";
          $scope.$emit("changeContainerScroller", false);
        } else {
          $scope.$emit("changeContainerScroller", true);
          $scope.insightHeight = "600px";
        }
          dataInfo.categoriesY = _.map(
          _.unique(res.ResponseDictionary.Body, function (item) {
            return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
          }),function(item){
            return `${item[dataInfo.categoriesYName]} ${moment(item.ShiftStartTIme).format($scope.userDateFormat.replace(" HH:mm:ss",""))}`
          }
        );
        dataInfo.categoriesY.unshift($filter("translate")("Total"));

        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Totals, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if (data[dataCell] && (data[dataCell] < minValuesTotals[dataCell] || minValuesTotals[dataCell] == undefined)) {
              minValuesTotals[dataCell] = data[dataCell];
            }
          });
        });

        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if (data[dataCell] && (data[dataCell] < minValues[dataCell] || minValues[dataCell] == undefined)) {
              minValues[dataCell] = data[dataCell];
            }
          });
        });

        _.forEach(res.ResponseDictionary.Totals, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }
            color = getHeatMapColor(ratio, minValuesTotals[dataCell]);
            dataInfo.series.push({
              x: j,
              y: i,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${parseInt(data[dataCell] * 100)}%${$scope.graph?.options?.settings?.targetMode ? " (" + parseInt(data[`${dataCell}Target`] * 100) + "%)" : ""}` : null,
              data: data[dataCell] != null ? parseFloat((data[dataCell] * 100).toFixed(2)) : null,
              dataTarget: data[`${dataCell}Target`] != null ? parseInt(data[`${dataCell}Target`] * 100) : null,
              color: data[dataCell] != null && data[`${dataCell}Target`] != null ? color : "rgba(230, 230, 230,1)",
            });
          });
        });

        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }
            color = getHeatMapColor(ratio, minValues[dataCell]);

            dataInfo.series.push({
              x: j,
              y: i + 1,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${Math.round((data[dataCell] * 100).toFixed(1))}%${$scope.graph?.options?.settings?.targetMode ? " (" + Math.round((data[`${dataCell}Target`] * 100).toFixed(1)) + "%)" : ""}` : null,
              data: data[dataCell] != null ? Math.round((data[dataCell] * 100).toFixed(1)) : null,
              dataTarget: data[`${dataCell}Target`] != null ? Math.round((data[`${dataCell}Target`] * 100).toFixed(1)) : null,
              color: data[dataCell] != null && data[`${dataCell}Target`] != null ? color : "rgba(230, 230, 230,1)",
            });
          });
        });

        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMachinesKPIMeasuresByStartTime") {
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: true,
          categoriesY: [],
          categoriesX: _.map(
            _.filter($scope.graph?.KPIsForHeatmap?.kpis, (kpi) => kpi.display),
            (shift) => shift.name
          ),
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "MachineName",
          tooltip: 2,
          series: [],
          isShift: $scope.isShift,
          x: `${$filter("translate")("KPIS")}`,
          y: `${$filter("translate")("MACHINE_NAME")}`,
          idX: "",
          idY: "MachineID",
          ID: $scope.graph?.ID,
          graph: $scope.graph,
        };
        if (dataInfo) {
          dataInfo.colors = angular.copy($scope.heatMapColors?.colorMode);
        }
        if (res?.ResponseDictionary?.Body?.length + res?.ResponseDictionary?.Totals?.length < 7) {
          $scope.insightHeight = "470px";
          $scope.$emit("changeContainerScroller", false);
        } else {
          $scope.$emit("changeContainerScroller", true);
          $scope.insightHeight = "600px";
        }
        res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, shiftService.shiftData.Machines, "MachineID", "MachineName", "machineID", "machineName");
        dataInfo.categoriesY = _.map(
          _.unique(res.ResponseDictionary.Body, function (item) {
            return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
          }),
          dataInfo.categoriesYName
        );

        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Totals, function (data) {
          _.forEach(dataInfo.categoriesX, function (dataCell) {
            if (data[dataCell] && (data[dataCell] < minValuesTotals[dataCell] || minValuesTotals[dataCell] == undefined)) {
              minValuesTotals[dataCell] = data[dataCell];
            }
          });
        });

        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if (data[dataCell] && (data[dataCell] < minValues[dataCell] || minValues[dataCell] == undefined)) {
              minValues[dataCell] = data[dataCell];
            }
          });
        });

        dataInfo.categoriesY.unshift($filter("translate")("Total"));
        _.forEach(res.ResponseDictionary.Totals, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }

            color = getHeatMapColor(ratio, minValuesTotals[dataCell]);
            dataInfo.series.push({
              x: j,
              y: i,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${parseInt(data[dataCell] * 100)}%${$scope.graph?.options?.settings?.targetMode ? " (" + parseInt(data[`${dataCell}Target`] * 100) + "%)" : ""}` : null,
              data: data[dataCell] != null ? parseInt(data[dataCell] * 100) : null,
              dataTarget: data[`${dataCell}Target`] != null ? parseInt(data[`${dataCell}Target`] * 100) : null,
              color: data[dataCell] != null && data[`${dataCell}Target`] != null ? color : "rgba(230, 230, 230,1)",
            });
          });
        });
        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }

            color = getHeatMapColor(ratio, minValues[dataCell]);
            dataInfo.series.push({
              x: j,
              y: i + 1,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${Math.round((data[dataCell] * 100).toFixed(1))}%${$scope.graph?.options?.settings?.targetMode ? " (" + Math.round((data[`${dataCell}Target`] * 100).toFixed(1)) + "%)" : ""}` : null,
              data: data[dataCell] != null ? Math.round((data[dataCell] * 100).toFixed(1)) : null,
              dataTarget: data[`${dataCell}Target`] != null ? Math.round((data[`${dataCell}Target`] * 100).toFixed(1)) : null,
              color: data[dataCell] != null && data[`${dataCell}Target`] != null ? color : "rgba(230, 230, 230,1)",
            });
          });
        });

        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetKPIMeasuresByPeriod") {
        var dataInfo = {
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesY: [],
          categoriesX: _.map(
            _.filter($scope.graph?.KPIsForHeatmap?.kpis, (kpi) => kpi.display),
            (shift) => shift.name
          ),
          categoriesYID: [],
          width: $scope.graph?.options?.width,
          categoriesXID: [],
          categoriesYName: "",
          tooltip: 2,
          series: [],
          idX: "",
          idY: "ShiftID",
          x: `${$filter("translate")("KPIS")}`,
          y: ``,
          graph: $scope.graph,
        };
        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesYName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          dataInfo.y = insight.selectedArg.key == 780 ? `${$filter("translate")("WEEK")}` : `${$filter("translate")("SHIFT_TYPE")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
          });
        } else if (insight.selectedArg.key == 963) {
          dataInfo.categoriesYName = "Month";
          dataInfo.y = `${$filter("translate")("MONTH")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(item[dataInfo.categoriesYName]);
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesYName = "Day";
          dataInfo.y = `${$filter("translate")("DAY")}`;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categoriesY.push(moment(item[dataInfo.categoriesYName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T")));
            item.Day = moment(item[dataInfo.categoriesYName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"));
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.categoriesYName = "Shift";
          dataInfo.y = `${$filter("translate")("SHIFT")}`;
          dataInfo.categoriesYID = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            dataInfo.idY
          );
        }
        else if (insight.selectedArg.key == 706) {
          dataInfo.categoriesYName = "MachineName";
          dataInfo.idY = "MachineID";
          dataInfo.y = `${$filter("translate")("MACHINES")}`;
        }
        dataInfo.categoriesY = _.map(
          _.unique(res.ResponseDictionary.Body, function (item) {
            return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
          }),
          dataInfo.categoriesYName
        );

        //add total to the table
        dataInfo.categoriesY.unshift("Total");

        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if (data[dataCell] && (data[dataCell] < minValues[dataCell] || minValues[dataCell] == undefined)) {
              minValues[dataCell] = data[dataCell];
            }
            if (data[dataCell] && (data[dataCell] > maxValues[dataCell] || maxValues[dataCell] == undefined)) {
              maxValues[dataCell] = data[dataCell];
            }
          });
        });
        
        //get all the minmum values to KPIS to calculate the colors value
        _.forEach(res.ResponseDictionary.Totals, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            if (data[dataCell] && (data[dataCell] < minValuesTotals[dataCell] || minValuesTotals[dataCell] == undefined)) {
              minValuesTotals[dataCell] = data[dataCell];
            }
            if (data[dataCell] && (data[dataCell] < maxValuesTotals[dataCell] || maxValuesTotals[dataCell] == undefined)) {
              maxValuesTotals[dataCell] = data[dataCell];
            }
          });
        });

        //get data for the Total
        _.forEach(res.ResponseDictionary.Totals, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            //get ratio which is data / dataTarget or data depend on the choice in the settings if its absolute or target

            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }

            color = getHeatMapColor(ratio, minValuesTotals[dataCell]);
            dataInfo.series.push({
              x: j,
              y: i,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${parseInt(data[dataCell] * 100)}%${$scope.graph?.options?.settings?.targetMode ? " (" + parseInt(data[`${dataCell}Target`] * 100) + "%)" : ""}` : null,
              data: parseInt(data[dataCell] * 100),
              dataTarget: parseInt(data[`${dataCell}Target`] * 100),
              color: color,
              shiftStartTimeY:insight.selectedArg.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null,
            });
          });
        });

        //get all Data without Total
        _.forEach(res.ResponseDictionary.Body, function (data, i) {
          _.forEach(dataInfo.categoriesX, function (dataCell, j) {
            //get ratio which is data / dataTarget or data depend on the choice in the settings if its absolute or target
            if ($scope.graph?.options?.settings?.percentageChoice == "target") {
              ratio = data[dataCell] / data[`${dataCell}Target`];
            } else {
              ratio = data[dataCell];
            }
            color = getHeatMapColor(ratio, minValues[dataCell]);

            dataInfo.series.push({
              x: j,
              y: i + 1,
              result: data[dataCell] != null && data[`${dataCell}Target`] != null ? `${Math.round((data[dataCell] * 100).toFixed(1))}%${$scope.graph?.options?.settings?.targetMode ? " (" + Math.round((data[`${dataCell}Target`] * 100).toFixed(1)) + "%)" : ""}` : null,
              data: parseInt(data[dataCell] * 100),
              dataTarget: parseInt(data[`${dataCell}Target`] * 100),
              color: color,
              shiftStartTimeY:insight.selectedArg.key == 182 ? moment(data.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss","")) : null,
            });
          });
        });

        _.forEach(dataInfo.categoriesX, function (col, i) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col,
          });

          if (findIndex) {
            dataInfo.categoriesX[i] = findIndex.Value;
          }
        });
      }  else {
        return;
      }
      // if (dataInfo?.categoriesX?.length > 10 && $scope.graph) {
      //   $scope.graph?.options?.width = 12;
      // }
      if (!$scope.isShift) {
        if (dataInfo?.categoriesY?.length > 10) {
          $scope.insightHeatMap = true;
          if (dataInfo.categoriesY.length > 60) {
            $scope.insightHeight = "1200px";
          } else {
            $scope.insightHeight = "700px";
          }
          // $scope.insightHeight = "unset";
        } else {
          $scope.insightHeatMap = false;
          $scope.insightHeight = "350px";
        }
        if (dataInfo) {
          dataInfo.colors = angular.copy($scope.graph?.options?.settings?.colorMode);
        }
      }

      if($scope.graph.fullScreen){
        $scope.fullScreenOption = true;
      }
      else
      {
        $scope.fullScreenOption = false;
      }
      dataInfo.graphWidth = $scope.graph?.options?.width;

      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildHeatMapChart(dataInfo));
      });
      $timeout(function () {
        insightsDashboardCtrl.insightChart ? insightsDashboardCtrl.insightChart.reflow() : "";
      }, 200);
    };

    var customSortData = function (data, objField, direction, helpArray) {
      data.sort(function (a, b) {
        if (helpArray) {
          return direction * (helpArray[a[objField]] > helpArray[b[objField]] ? 1 : helpArray[b[objField]] > helpArray[a[objField]] ? -1 : 0);
        } else {
          return direction * (a[objField] > b[objField] ? 1 : b[objField] > a[objField] ? -1 : 0);
        }
      });
    };

    var buildStackedAreaData = function (insight, res) {
      if (insight.Name == "GetNotificationsByPeriod") {
        var dataInfo = {
          series: [
            {
              name: "RepairTime",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "WaitTime",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
          ],
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          categoriesIDs: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 4,
          serverData: res.ResponseDictionary,
          toolTip: 6,
          categories: [],
          max: null,
          showLegends: true,
          graph: $scope.graph,
        };
        if (res.ResponseDictionary.Body.length == 0) {
          dataInfo.showLegends = false;
        }

        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName] +item?.Year ? "-" + (item.Year % 100):'');
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";
          res.ResponseDictionary.Body.map(function (item) {
            day =  moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
            dataInfo.categories.push(day);
            item.Day = day;
            return item;
          });
          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {

          dataInfo.toolTip=10
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");
          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.ShiftName}`;
            }),
            function(item){
              return {name:item.ShiftName,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetWaterfallOEEByPeriod") {
        //add planned to idle
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (temp) {
          if (temp.Idle && temp.Planned) {
            temp.Idle += temp.Planned;
          }
          return temp;
        });
        var dataInfo = {
          series: [
            {
              name: "NonWorkingShiftTime",
              data: [],
              color: "rgba(167, 169, 171, 1)",
              legendIndex: 10,
              visible: true,
            },
            {
              name: "Idle",
              data: [],
              color: "rgba(69, 69, 69, 1)",
              legendIndex: 9,
              visible: true,
            },

            {
              name: "Setup",
              data: [],
              color: "rgba(65, 23, 105, 1)",
              legendIndex: 8,
              visible: true,
            },
          ],
          
          
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          categoriesIDs: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 4,
          serverData: res.ResponseDictionary,
          toolTip: 6,
          categories: [],
          max: null,
          showLegends: true,
          graph: $scope.graph,
        };

        if (res.ResponseDictionary.Body.length < 1) {
          return;
        }

        var otherEvents = [];
        var flag = false;
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }
            return flag
              ? {
                  name: key,
                  color: "rgba(65, 23, 105, 1)",
                  data: [],
                  legendIndex: "",
                  visible: key !== "UnitsProducedOK" && key !== "UnitsProducedTheoretically",
                  find: key == "UnitsProducedOK" ? "UnitsProducedOK" : key == "UnitsProducedTheoretically" ? "UnitsProducedTheoretically" : null,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );
        var otherEventsColors = GroupColors("rgba(224, 110, 92, 1)");
        otherEvents = _.map(otherEvents, function (otherEvent, index) {
          otherEvent.legendIndex = index + 8;
          otherEvent.color = otherEventsColors[index % otherEventsColors.length];
          return otherEvent;
        });
        dataInfo.series = _.map(dataInfo.series, function (serie, index) {
          serie.legendIndex = 8 + otherEvents.length + (dataInfo.series.length - index);
          return serie;
        });

        dataInfo.series = [
          ...dataInfo.series,
          ...otherEvents,
          {
            name: "ShortStops",
            color: "rgba(224, 110, 92, 1)",
            data: [],
            legendIndex: 7,
            visible: true,
          },
          {
            name: "Unreported",
            color: "rgba(135, 39, 39, 1)",
            data: [],
            legendIndex: 6,
            visible: true,
          },
          {
            name: "NoCommunication",
            color: "rgba(33, 128, 158, 1)",
            data: [],
            legendIndex: 5,
            visible: true,
          },
          {
            name: "RateTimeLost",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 4,
            visible: true,
          },
          {
            name: "CavitiesEfficiencyLostMins",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 3,
            visible: true,
          },
          {
            name: "QualityTimeLost",
            color: "rgba(143, 230, 232, 1)",
            data: [],
            stack: "",
            legendIndex: 2,
            visible: true,
          },
          {
            name: "PE",
            color: "rgba(122, 93, 150, 1)",
            data: [],
            legendIndex: 1,
            PEObject: true,
            visible: true,
          },
        ];

        if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";
              res.ResponseDictionary.Body.map(function (item) {
                dataInfo.categories.push(item[dataInfo.categoriesName]?.substring(0, item.Day?.indexOf("T")));
                item.Day = item[dataInfo.categoriesName]?.substring(0, item.Day?.indexOf("T"));
                return item;
              });
       
       
       
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "Shift");

          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "Shift"));

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.Shift}_${item.ShiftName}`;
            }),
            "ShiftName"
          );
        }
        
        dataInfo.series = _.filter(
          _.map(dataInfo.series, function (item) {
            if (item.PEObject) {
              item.unitsProducedOk = _.find(dataInfo.series, { find: "UnitsProducedOK" });
              item.UnitsProducedTheoretically = _.find(dataInfo.series, { find: "UnitsProducedTheoretically" });
            }
            var findIndex = _.find(res.ResponseDictionary.Translate, {
              ColumnName: item.name,
            });
            if (findIndex) {
              item.name = findIndex.Value;
            }
            return item;
          }),
          function (serie) {
            if (!serie.visible) {
              return false;
            }
            return true;
          }
        );
        
      } else if (insight.Name == "GetAvailabilityOEELostTimePC" || insight.Name == "GetAvailabilityOEELostTimePCFactory") {
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },
            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          categoriesIDs: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          label: 1,
          toolTip: 2,
          categories: [],
          showLegends: true,
          graph: $scope.graph,
        };
        if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";

            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
       

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
              day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
     
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip=8;
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.ShiftName}`;
            }),
            function(item){
              return {name:item.ShiftName,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetLostPETimePC" || insight.Name == "GetLostPETimePCFactory") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              legendIndex: 1,
            },
          ],
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesIDs: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          label: 3,
          toolTip: 3,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          max: 100,
          showLegends: true,
          graph: $scope.graph,
        };
        if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";

            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
     

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
              day =  moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
       
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip=7
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetLostOEETimePC" || insight.Name == "GetLostOEETimePCFactory") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              legendIndex: 2,
            },
            {
              name: "OEELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              legendIndex: 1,
            },
          ],
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          categoriesIDs: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          label: 3,
          toolTip: 3,
          categories: [],
          max: 100,
          showLegends: true,
          graph: $scope.graph,
        };

        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 780 ? "Week" : "ShiftTypeName";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";
          res.ResponseDictionary.Body.map(function (item) {
            day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"));
            dataInfo.categories.push(day);
            item.Day = day;
            return item;
          });
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip = 7;
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          
          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetRejectsBy" || insight.Name == "GetFactoryRejectsBy") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          reasonName: "Name",
          showLabels: true,
          data: "Quantity",
          categoriesName: "",
          stacking: "normal",
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 1,
          categories: [],
          serverData: res.ResponseDictionary,
          toolTip: 4,
          showLegends: true,
          max: null,
          graph: $scope.graph,
        };

        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          ReasonID: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].Name;
        }

        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 963) {
          dataInfo.categoriesName = insight.selectedArg.key == 963 ? "Month" : "Week";

          if (insight.selectedArg.key == 963) {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
            });
          } else {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.reasonName],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Week)] = item.Quantity;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Week)] = item.Quantity;
              if (item.ReasonID == -1) {
                dataInfo.series.push({
                  name: item.Name,
                  color: "rgba(236, 231, 240, 1)",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              } else {
                dataInfo.series.push({
                  name: item.Name,
                  color: "",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              }
            }
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

          res.ResponseDictionary.Body.map(function (item) {
            day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
            dataInfo.categories.push(day);
            item.Day = day;
            return item;
          });

          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.reasonName],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Day)] = item.Quantity;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Day)] = item.Quantity;
              if (item.ReasonID == -1) {
                dataInfo.series.push({
                  name: item.Name,
                  color: "rgba(236, 231, 240, 1)",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              } else {
                dataInfo.series.push({
                  name: item.Name,
                  color: "",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              }
            }
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip = 9
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.reasonName],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.ShiftID)] = item.Quantity;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.ShiftID)] = item.Quantity;
              if (item.ReasonID == -1) {
                dataInfo.series.push({
                  name: item.Name,
                  color: "rgba(236, 231, 240, 1)",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              } else {
                dataInfo.series.push({
                  name: item.Name,
                  color: "",
                  data: tmpArray,
                  stack: "",
                  fillOpacity: 1,
                });
              }
            }
          });

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.StartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }

        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
        dataInfo.colors = GroupColors("rgba(128, 128, 128, 1)");
      } else if (insight.Name == "GetUnitsProducedPerPeriod" || insight.Name == "GetUnitsProducedFactoryPerPeriod") {
        var dataInfo = {
          series: [
            {
              name: "UnitsProducedTheoretically",
              color: "rgba(225, 225, 227, 1)",
              data: [],
            },
            {
              name: "RejectsTotal",
              color: "rgba(0,0,0,1)",
              data: [],
            },
            {
              name: "UnitsProducedOK",
              color: "rgba(26, 169, 23,1)",
              data: [],
            },
          ],
          xAxisName: insight.selectedArg.key,
          typeChart: "normal",
          categoriesIDs: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 1,
          serverData: res.ResponseDictionary,
          toolTip: 2,
          categories: [],
          max: null,
          showLegends: true,
          graph: $scope.graph,
        };

        if (insight.Name == "GetUnitsProducedFactoryPerPeriod") {
          dataInfo.dataLabelTotalEnable = angular.copy($scope.insightData?.filters?.dataLabels);
        }

        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 2286 ? "ShiftTypeName" : "WeekNumber";

            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
         

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";

            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
            });
       

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
              day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
       
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[item.name]);
            });
          });
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip=8;
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");
          _.forEach(dataInfo.categoriesIDs, function (temp) {
            dataInfo.series.forEach(function (item) {
              item.data.push(temp[0][item.name]);
            });
          });
          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.StartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetEventGroupsPerPeriod" || insight.Name == "GetFactoryEventGroupsPerPeriod") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          groupName: "GroupName",
          ID:"EventGroup",
          legendsType:"EventGroup",
          data: "EventDuration",
          categoriesName: "",
          stacking: "normal",
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categoriesNameIDs: "",
          serverData: res.ResponseDictionary,
          categoriesIDs: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 6,
          categories: [],
          toolTip: 6,
          showLegends: true,
          max: null,
          graph: $scope.graph,
          legendsType:"EventGroup"
        };

        $scope.$emit("events", res.ResponseDictionary);
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          GroupName: "Other",
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].GroupName;
        }
        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 963 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 963 ? "Month" : insight.selectedArg.key == 2286 ? "ShiftTypeName" : "Week";

          if (insight.selectedArg.key == 963) {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
            });
          } else {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (item) {
            var categorySearch = insight.selectedArg.key == 963 ? `${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}` : insight.selectedArg.key == 2286 ? item.ShiftTypeName : item.Week;
            var serie = _.find(dataInfo.series, {
              name: item.GroupName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(categorySearch)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(categorySearch)] = item.EventDuration;
              dataInfo.series.push({
                name: item.GroupName,
                data: tmpArray,
                EventGroup: item.EventGroup,
              });
            }
          });

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });

          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";

            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
            day =   moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
         
          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item.GroupName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
              dataInfo.series.push({
                name: item.GroupName,
                data: tmpArray,
                EventGroup: item.EventGroup,
              });
            }
          });
          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
          
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip = 10;
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, { id: item.GroupName });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
              dataInfo.series.push({
                name: item.GroupName,
                data: tmpArray,
                id: item.GroupName,
              });
            }
          });

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        }
      } else if (insight.Name == "GetEventReasonsPerPeriod") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          groupName: "EventName",
          data: "EventDuration",
          legendsType:"Event",
          categoriesName: "",
          stacking: "normal",
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesNameIDs: "",
          serverData: res.ResponseDictionary,
          categoriesIDs: [],
          label: 4,
          categories: [],
          toolTip: 6,
          max: null,
          showLegends: true,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);

        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          Event: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].EventName;
        }

        if (insight.selectedArg.key == 780 || insight.selectedArg.key == 963 || insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = insight.selectedArg.key == 963 ? "Month" : insight.selectedArg.key == 2286 ? "ShiftTypeName" : "Week";

          if (insight.selectedArg.key == 963) {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
            });
          } else {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }

          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (item) {
            var categorySearch = insight.selectedArg.key == 963 ? `${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}` : insight.selectedArg.key == 2286 ? item.ShiftTypeName : item.Week;
            var serie = _.find(dataInfo.series, {
              name: item.EventName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(categorySearch)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(categorySearch)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                Event: item.Event,
              });
            }
          });

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });

          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
              day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
       
          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item.EventName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                Event: item.Event,
              });
            }
          });
          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip= 10
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, { id: item.Event });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                id: item.Event,
                Event: item.Event,
              });
            }
          });

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        }
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetFactoryEventReasonsPerPeriod") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          groupName: "EventName",
          data: "EventDuration",
          categoriesName: "",
          stacking: "normal",
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categoriesNameIDs: "",
          serverData: res.ResponseDictionary,
          categoriesIDs: [],
          label: 2,
          categories: [],
          toolTip: 6,
          max: null,
          showLegends: true,
          graph: $scope.graph,
          legendsType:"Event"
        };
        $scope.$emit("events", res.ResponseDictionary);
        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          Event: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].EventName;
        }
        if (insight.selectedArg.key == 2286) {
          dataInfo.categoriesName = "ShiftTypeName";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
          dataInfo.categories = [...new Set(dataInfo.categories)];

          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item.EventName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.ShiftTypeName)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.ShiftTypeName)] = item.EventDuration;
              
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                Event:item.Event
              });
            }
          });
          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });

          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
          dataInfo.categories = [];
          dataInfo.xAxis = "ShiftTypeName";
          // createShiftTypeCategories(res,dataInfo,'EventName')
        } else if (insight.selectedArg.key == 780 || insight.selectedArg.key == 963) {
          dataInfo.categoriesName = insight.selectedArg.key == 963 ? "Month" : "Week";

          if (insight.selectedArg.key == 963) {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
            });
          } else {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }
          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item.EventName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Week)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Week)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                Event:item.Event
              });
            }
          });

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });

          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        } else if (insight.selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

            res.ResponseDictionary.Body.map(function (item) {
              day = moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
              dataInfo.categories.push(day);
              item.Day = day;
              return item;
            });
      
          dataInfo.categories = [...new Set(dataInfo.categories)];
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item.EventName,
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.Day)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                Event:item.Event
              });
            }
          });
          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip = 10;
          dataInfo.categoriesIDs = _.groupBy(res.ResponseDictionary.Body, "ShiftID");

          dataInfo.categories = _.unique(_.map(res.ResponseDictionary.Body, "ShiftID"));
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, { id: item.Event });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item.ShiftID)] = item.EventDuration;
              dataInfo.series.push({
                name: item.EventName,
                data: tmpArray,
                id: item.Event,
                Event:item.Event
              });
            }
          });

          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item.ShiftID}_${item.Shift}`;
            }),
            function(item){
              return {name:item.Shift,shiftStartTime:moment(item.ShiftStartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );

          indexOther = _.findIndex(dataInfo.series, {
            name: nameOther,
          });
          if (indexOther != -1) {
            dataInfo.series[indexOther].color = "rgba(236, 231, 240, 1)";
            dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
          }
        }
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else {
        return;
      }
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildStackedArea(dataInfo));
      });
    };
    var buildSeriesHistogramData = function (insight, res) {
      if (insight.Name == "GetItemCycleTime") {
        var dataInfo = {
          series: [
            {
              name: insight?.selectedArg?.key == "67" ? "Units/Hour avg" : insight?.selectedArg?.key == "71" ? "Units/Min avg" : insight?.selectedArg?.key == "2302" ? "Cycles/Hour avg" : insight?.selectedArg?.key == "2304" ? "Cycles/Min avg" : "CycleTimeAvg",
              color: "rgba(41, 172, 175, 1)",
              data: [],
            },
            {
              name: insight?.selectedArg?.key == "67" ? "Units/Hour std" : insight?.selectedArg?.key == "71" ? "Units/Min std" : insight?.selectedArg?.key == "2302" ? "Cycles/Hour std" : insight?.selectedArg?.key == "2304" ? "Cycles/Min std" : "CycleTimeStandard",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            },
          ],
          
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: null,
          showLabels: true,
          label: 4,
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 16,
          showLegends: true,
          graph: $scope.graph,
        };
  
        if (insight.selectedArg.key == "71" || insight.selectedArg.key == "67" || insight.selectedArg.key == "2302" || insight.selectedArg.key == "2304") {
          dataInfo.toolTip = 1;
          dataInfo.label = 1;
        }
        if (insight.selectedArg3.key == "2359" ) {
          dataInfo.categoriesName="MoldID"
        }else if (insight.selectedArg3.key == "2274" ) {
          dataInfo.categoriesName = "MoldName"
        }else if (insight.selectedArg3.key == "2360" ) {
          dataInfo.categoriesName = "ProductID"
        }else if (insight.selectedArg3.key == "2275" ) {
          dataInfo.categoriesName= "ProductName"
        } else if (insight.selectedArg3.key == "2363" ) {
          dataInfo.categoriesName= "CatalogID"
        } 
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], product: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetQCFailedParameters") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "MachineName",
          stacking: "",
          label: 1,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfFails",
          categories: [],
          toolTip: 1,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          name: "FieldName",
          showLegends: true,
          categorie: [],
          graph: $scope.graph,
        };


        setCategoryName(dataInfo,insight?.selectedArg,"categoriesName",res)

        if (insight?.selectedArg?.key == 2294) {
          dataInfo.showLegends = false;
          dataInfo.toolTip = 22;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
          dataInfo.series.push({
            data: _.map(res.ResponseDictionary.Body, function (item) {
              return item.NumberOfFails;
            }),
            color: "#F7A35C",
          });
        } else {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
          dataInfo.categories = _.unique(dataInfo.categories);
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.name],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
              });
            }
          });
        }

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });

        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetShiftsChangeData") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "MachineName",
          stacking: "",
          label: 6,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfFails",
          categories: [],
          toolTip: 22,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          name: "FieldName",
          showLegends: true,
          categorie: [],
          graph: $scope.graph,
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
        };

        setCategoryName(dataInfo,insight?.selectedArg2,"categoriesName",res)
        setCategoryName(dataInfo,insight?.selectedArg,"categoriesName2",res)
       if (insight?.selectedArg2?.key == "2294") {
          dataInfo.showLegends = false;
          dataInfo.toolTip = 22;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName2]);
          });

          dataInfo.series.push({
            data: _.map(res.ResponseDictionary.Body, function (item) {
              return item.AverageShiftChange;
            }),
            color: "#F7A35C",
          });
        } else {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
          dataInfo.categories = _.unique(dataInfo.categories);
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.categoriesName2],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item.AverageShiftChange;
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item.AverageShiftChange;
              dataInfo.series.push({
                name: item[dataInfo.categoriesName2],
                data: tmpArray,
              });
            }
          });
        }

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });

        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetAggregatedSetupsData") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          name: "MachineName",
          stacking: "",
          label: 1,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          data: "NumberOfFails",
          categories: [],
          toolTip: 23,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          dataVariable: ["y"],
          name: "FieldName",
          showLegends: true,
          categorie: [],
          graph: $scope.graph,
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
        };


        if (insight?.selectedArg3?.key == "2180") {
          insightsDashboardCtrl.insight.selectKpi = "NumberOfSetups";
        } else if (insight?.selectedArg3?.key == "2348") {
           dataInfo.toolTip = 24;
           dataInfo.label = 2;
          insightsDashboardCtrl.insight.selectKpi = "DurationOfSetups";
        } else if (insight.selectedArg3.key == "2349") {
          dataInfo.toolTip = 24;
           dataInfo.label = 2;
          insightsDashboardCtrl.insight.selectKpi = "AverageDurationOfSetups";
        } 

        setCategoryName(dataInfo,insight?.selectedArg2,"categoriesName",res)

        if (insight?.selectedArg?.key == "696") {
          dataInfo.categoriesName2 = "Day";
          if (+insight.selectedArg2.key != +insight.selectedArg.key) {
            res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (temp) {
              temp.Day = temp["Day"].substring(0, temp.Day.indexOf("T"));
              return temp;
            });
          }
        } else  {
          setCategoryName(dataInfo,insight?.selectedArg,"categoriesName2",res)
        } 
        
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
          dataInfo.categories = _.unique(dataInfo.categories);
          res.ResponseDictionary.Body.forEach(function (item) {
            var serie = _.find(dataInfo.series, {
              name: item[dataInfo.categoriesName2],
            });
            if (serie) {
              serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[insightsDashboardCtrl.insight.selectKpi];
            } else {
              var tmpArray = new Array(dataInfo.categories.length);
              tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
              tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[insightsDashboardCtrl.insight.selectKpi];
              dataInfo.series.push({
                name: item[dataInfo.categoriesName2],
                data: tmpArray,
              });
            }
          });
       

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });

        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      }else {
        return;
      }
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildSeriesStackedColumnGraph(dataInfo));
      });
    };

    var getMinMaxDataInfo = function (dataInfo) {
      var valueBody = 0;
      var valueCompare = 0;
      var max = 0;
      if (dataInfo.insight.HValue && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
        dataInfo.max = dataInfo.insight.HValue;
        dataInfo.min = dataInfo.insight.LValue;
      } else {
        valueBody = Math.max(
          ..._.map(dataInfo.serverData.Body, function (item) {
            return item[dataInfo.data];
          })
        );
        if (valueBody > max) {
          max = valueBody;
        }

        dataInfo.max = Math.ceil(max);
        dataInfo.min = 0;
      }
      return dataInfo;
    };

    let calcAverage = function (array) {
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      return sum / array.length;
    };

    let sigma = function (array, avg) {
      if (_.isEmpty(array)) {
        return;
      }
      const reducer = (accumulator, currentValue) => accumulator + Math.pow(currentValue - avg, 2);
      return Math.sqrt(array.reduce(reducer) / array.length);
    };

    let getValidPoints = function (array, param) {
      let validPoints;

      //array with only the y values to calc avg
      if (!array) {
        return;
      }
      let newArrayYVals = array.map((element) => element[param]);
      let avg = calcAverage(newArrayYVals);

      //calc sigma
      let sig = sigma(newArrayYVals, avg);

      //removing all points deviating over 3 times the standard deviation, while keeping all nulls
      validPoints = array.filter((element) => {
        if (element[param] == null || !(Math.abs(element[param] - avg) >= 3 * sig)) {
          return element;
        } else {
          return (element[param] = avg);
        }
      });

      array = validPoints;
      return array;
    };

    var buildSeriesLineGraphData = function (insight, res, selectedArg, department) {
      if (insight.Name == "GetMeanTimeToRepair" || insight.Name == "GetMeanServiceWaitTime" || insight.Name == "GetMeanTimeBetweenFailures") {
        var dataInfo = {
          series: [],
          
          
          xAxisName: "",
          categoriesName: "",
          stacking: "normal",
          data: "MeanTimeToRepair",
          label: 3,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          showLabels: true,
          min: 0,
          tickInterval: null,
          max: null,
          insight: insight,
          serverData: res.ResponseDictionary,
          categories: [],
          toolTip: 4,
          graph: $scope.graph,
        };
        if (!_.isEmpty(res.ResponseDictionary.Body) && res.ResponseDictionary.Body[0] && res.ResponseDictionary.Body[0].Average) {
          $scope.AvgValue = $filter("getDurationInHrMin")(res.ResponseDictionary.Body[0].Average);
        } else {
          $scope.AvgValue = null;
        }
        if (insight.Name == "GetMeanServiceWaitTime") {
          dataInfo.data = "MeanWaitTime";
        }
        if (insight.Name == "GetMeanTimeBetweenFailures") {
          dataInfo.data = "MeanTimeBetweenFailures";
        }
        var time = {};
        time = getTimeForDataAndCompare(time);
        dataInfo.series.push({
          name: time.Data,
          data: [],
          color: "rgba(71, 145, 255, 1)",
        });

      
        if (selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T")));
          });
        } else if (selectedArg.key == 780 || selectedArg.key == 182 || selectedArg.key == 963 || selectedArg.key == 2286) {
          setCategoryName(dataInfo,selectedArg,"categoriesName",res)
              res.ResponseDictionary.Body.forEach(function (item) {
                dataInfo.categories.push(item[dataInfo.categoriesName]);
              });
          
        }

        if (selectedArg.key == 963) {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.series[0].data.push(item[dataInfo.data]);
          });
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.series[0].data.push(item[dataInfo.data]);
        });


        dataInfo = getMinMaxDataInfo(dataInfo);
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale && insight.max < 2) {
          dataInfo.tickInterval = 0.5;
        }
      } else if (insight.Name == "GetDepartmentKPIsByTime") {
        var dataInfo = {
          series: [
            {
              name: "AvailabilityPE",
              data: [],
              visible: false,
              nameTemp: "AvailabilityPE",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "AvailabilityOEE",
              data: [],
              visible: false,
              nameTemp: "AvailabilityOEE",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "CycleTimeEfficiency",
              data: [],
              visible: false,
              nameTemp: "CycleTimeEfficiency",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "CavitiesEfficiency",
              data: [],
              visible: false,
              nameTemp: "CavitiesEfficiency",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "QualityIndex",
              data: [],
              visible: false,
              nameTemp: "QualityIndex",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "PE",
              data: [],
              visible: true,
              nameTemp: "PE",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
            {
              name: "OEE",
              data: [],
              visible: true,
              nameTemp: "OEE",
              events: {
                legendItemClick: function () {
                  var index = _.findIndex($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], { name: this.userOptions.nameTemp });
                  $sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible = !$sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"][index].visible;
                },
              },
            },
          ],
          
          xAxis: "RecordTime",
          insight: insight,
          unique: false,
          categories: [],
          showLabels: true,
          toolTip: 2,
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          label: 1,
          min: null,
          serverData: res.ResponseDictionary,
          tickInterval: null,
          max: null,
          sessionDataSave: "GetDepartmentKPIsByTime",
          shiftInsight: true,
          graph: $scope.graph,
        };
        if ($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"].length) {
          _.forEach($sessionStorage.insightsDataSave["GetDepartmentKPIsByTime"], function (temp) {
            var index = _.findIndex(dataInfo.series, { name: temp.name });
            dataInfo.series[index].visible = temp.visible;
          });
        } else {
          $sessionStorage.insightsDataSave.GetDepartmentKPIsByTime = _.map(angular.copy(dataInfo.series), (temp) => {
            delete temp.data;
            return temp;
          });
        }
        _.map(res.ResponseDictionary.Body, function (temp) {
          dateTemp = temp.RecordTime.substring(0, temp.RecordTime.indexOf("T")).split("-");
          timeDate = temp.RecordTime.substring(temp.RecordTime.indexOf("T") + 1, temp.RecordTime.length).split(":");
          temp.RecordTime = dateTemp[2] + "-" + dateTemp[1] + " " + timeDate[0] + ":" + timeDate[1];
          return temp;
        });
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.xAxis]);
        });

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.series.forEach(function (temp) {
            temp.data.push(item[temp.name]);
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetFactoryPE" || insight.Name == "GetFactoryOEE" || insight.Name == "GetFactoryQualityIndex" || insight.Name == "GetFactoryCycleTimeEff" || insight.Name == "GetFactoryAveragePE" || insight.Name == "GetFactoryAverageOEE" || insight.Name == "GetFactoryAvailabilityOEE") {
        var dataInfo = {
          series: [],
          xAxis: "",
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          unique: false,
          categories: [],
          toolTip: 3,
          serverData: res.ResponseDictionary,
          label: 1,
          selectedArg: selectedArg.key,
          min: 0,
          tickInterval: 0.5,
          max: "",
          graph: $scope.graph,
        };

        if (insight.Name == "GetFactoryCycleTimeEff") {
          dataInfo.data = "CycleTimeEfficiency";
          dataInfo.series.push(
            {
              name: "CycleTimeEfficiency",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "CycleTimeEfficiencyTarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryAveragePE") {
          dataInfo.data = "AvailabilityPE";
          dataInfo.series.push(
            {
              name: "AvailabilityPE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "AvailabilityPETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryAverageOEE") {
          dataInfo.data = "AvailabilityOEE";
          dataInfo.series.push(
            {
              name: "AvailabilityOEE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "AvailabilityOEETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryPE") {
          dataInfo.data = "PE";
          dataInfo.series.push(
            {
              name: "PE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "PETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryOEE") {
          dataInfo.data = "OEE";
          dataInfo.series.push(
            {
              name: "OEE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "OEETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryAvailabilityPE") {
          dataInfo.data = "AvailabilityPE";
          dataInfo.series.push(
            {
              name: "AvailabilityPE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "AvailabilityPETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetFactoryQualityIndex") {
          dataInfo.data = "QualityIndex";
          dataInfo.series.push(
            {
              name: "QualityIndex",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "QualityIndexTarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        }
        if (dataInfo.selectedArg == 182) {
          dataInfo.xAxis = "Shift";
          dataInfo.toolTip = 8;
        } else if (dataInfo.selectedArg == 2286) {
          dataInfo.xAxis = "ShiftTypeName";
          // res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
          createShiftTypeCategories(res, dataInfo, "DepartmentName");
        } else if (dataInfo.selectedArg == 696) {
          res.ResponseDictionary.Body.forEach(function (item) {
            item.Day = moment(item.Day).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"));
          });
          dataInfo.xAxis = "Day";
        } else if (dataInfo.selectedArg == 780 || dataInfo.selectedArg == 963) {
          dataInfo.xAxis = dataInfo.selectedArg == 963 ? "Month" : "Week";
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]?.filters?.deviation) {
          res.ResponseDictionary.Body = getValidPoints(res.ResponseDictionary.Body, dataInfo.series[0].name);
          res.ResponseDictionary.Body = getValidPoints(res.ResponseDictionary.Body, dataInfo.series[1].name);
        }
        if(selectedArg.key == 182){
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push({name:item[dataInfo.xAxis],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
          });
        }else if (dataInfo.selectedArg != 2286) {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis]);
          });
        }

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.forEach(function (item) {
            item.data.push(temp[item.name]);
          });
        });

        var max = 0;
        if (dataInfo.insight.HValue && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
          dataInfo.max = dataInfo.insight.HValue;
          dataInfo.min = dataInfo.insight.LValue;
        } else {
         
            max = Math.max(
              ..._.map(res.ResponseDictionary.Body, function (item) {
                return item[dataInfo.series[0].name];
              }),
              ..._.map(res.ResponseDictionary.Body, function (item) {
                return item[dataInfo.series[1].name];
              })
            );
          

          dataInfo.max = Math.ceil(max);
          dataInfo.min = 0;
        }

        var time = {};
        time = getTimeForDataAndCompare(time);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value;
          }
        });

        if (time) {
          dataInfo.series[0].name = time.Data;
          dataInfo.series[1].name = dataInfo.series[1].name + " " + time.Data;
        }
      } else if (insight.Name == "GetDepartmentPE" || insight.Name == "GetDepartmentOEE" || insight.Name == "GetDepartmentQualityIndex" || insight.Name == "GetDepartmentCycleTimeEff" || insight.Name == "GetDepartmentAveragePE" || insight.Name == "GetDepartmentAverageOEE" || insight.Name == "GetDepartmentAvailabilityOEE") {
        var dataInfo = {
          series: [],
          xAxis: "",
          insight: insight,
          unique: false,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          toolTip: 6,
          label: 4,
          selectedArg: selectedArg.key,
          min: 0,
          tickInterval: 0.5,
          serverData: res.ResponseDictionary,
          max: "",
          graph: $scope.graph,
        };
        if (insight.Name == "GetDepartmentCycleTimeEff") {
          dataInfo.data = "CycleTimeEfficiency";
          dataInfo.series.push(
            {
              name: "CycleTimeEfficiency",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "CycleTimeEfficiencyTarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetDepartmentAverageOEE") {
          dataInfo.data = "AvailabilityOEE";
          dataInfo.series.push(
            {
              name: "AvailabilityOEE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "AvailabilityOEETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetDepartmentPE") {
          dataInfo.data = "PE";
          dataInfo.series.push(
            {
              name: "PE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "PETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetDepartmentOEE") {
          dataInfo.data = "OEE";
          dataInfo.series.push(
            {
              name: "OEE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "OEETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetDepartmentAveragePE") {
          dataInfo.data = "AvailabilityPE";
          dataInfo.series.push(
            {
              name: "AvailabilityPE",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "AvailabilityPETarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        } else if (insight.Name == "GetDepartmentQualityIndex") {
          dataInfo.data = "QualityIndex";
          dataInfo.series.push(
            {
              name: "QualityIndex",
              color: "rgba(71, 145, 255, 1)",
              data: [],
            },
            {
              name: "QualityIndexTarget",
              color: "rgba(141, 116, 165, 1)",
              data: [],
            }
          );
        }

        if (dataInfo.selectedArg == 182) {
          dataInfo.xAxis = "Shift";
        } else if (dataInfo.selectedArg == 696) {
          res.ResponseDictionary.Body.forEach(function (item) {
            item.Day = moment(item.Day).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T"))
          });
          dataInfo.xAxis = "Day";
        } else if (dataInfo.selectedArg == 780) {
          dataInfo.xAxis = "Week";
        } else if (dataInfo.selectedArg == 963) {
          dataInfo.xAxis = "Month";
        } else if (dataInfo.selectedArg == 2286) {
          dataInfo.xAxis = "ShiftTypeName";
        }
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]?.filters?.deviation) {
          res.ResponseDictionary.Body = getValidPoints(res.ResponseDictionary?.Body, dataInfo.series[0].name);
          res.ResponseDictionary.Body = getValidPoints(res.ResponseDictionary?.Body, dataInfo.series[1].name);
        }
        if (dataInfo.selectedArg == 963) {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis] + "-" + (item.Year % 100));
          });
        } else if (dataInfo.selectedArg == 182) {
          dataInfo.toolTip = 7;

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push({name:item[dataInfo.xAxis],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
          });
        }else {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis]);
          });
        }

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.forEach(function (item) {
            item.data.push(temp[item.name]);
          });
        });


        var max = 0;
        if (dataInfo.insight.HValue && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
          dataInfo.max = dataInfo.insight.HValue;
          dataInfo.min = dataInfo.insight.LValue;
        } else {
          max = Math.max(
            ..._.map(res.ResponseDictionary.Body, function (item) {
              return item[dataInfo.series[0].name];
            }),
            ..._.map(res.ResponseDictionary.Body, function (item) {
              return item[dataInfo.series[1].name];
            })
          );

          dataInfo.max = Math.ceil(max);
          dataInfo.min = 0;
        }

        var time = {};
        time = getTimeForDataAndCompare(time);

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value;
          }
        });

        if (time) {
          dataInfo.series[0].name = time.Data;
          dataInfo.series[1].name = dataInfo.series[1].name + " " + time.Data;
        }
      } else if (insight.Name == "GetTotalRejects") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          categoriesName: "",
          stacking: "normal",
          data: "Quantity",
          label: 1,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          showLabels: true,
          min: 0,
          tickInterval: null,
          max: null,
          insight: insight,
          serverData: res.ResponseDictionary,
          categories: [],
          toolTip: 5,
          graph: $scope.graph,
        };
        var time = {};
        time = getTimeForDataAndCompare(time);
        dataInfo.series.push({
          name: time.Data,
          data: [],
          color: "rgba(0,0,0,1)",
        });

        if (selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T")));
          });
        } else if (selectedArg.key == 780 || selectedArg.key == 182 || selectedArg.key == 2286) {
          if (selectedArg.key == 182) {
            dataInfo.categoriesName = "Shift";
          }
          if (selectedArg.key == 2286) {
            dataInfo.categoriesName = "ShiftTypeName";
          }

          if (selectedArg.key == 780) {
            dataInfo.categoriesName = "Month";
          }
          if(selectedArg.key == 182){
            dataInfo.toolTip=8;
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push({name:item[dataInfo.categoriesName],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
            });
          }
          else
          {
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }
       
        } else if (selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });
        }
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.series[0].data.push(item[dataInfo.data]);
          });

        dataInfo = getMinMaxDataInfo(dataInfo);
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale && insight.max < 2) {
          dataInfo.tickInterval = 0.5;
        }
      } else if (insight.Name == "GetFactoryTotalRejects") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          categoriesName: "",
          stacking: "normal",
          data: "Quantity",
          label: 1,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          insightsColorText: $scope.insightsColorText,
          showLabels: true,
          min: 0,
          tickInterval: null,
          max: null,
          insight: insight,
          serverData: res.ResponseDictionary,
          categories: [],
          toolTip: 2,
          graph: $scope.graph,
        };
        var time = {};

        time = getTimeForDataAndCompare(time);
        dataInfo.series.push({
          name: time.Data,
          data: [],
          color: "rgba(0,0,0,1)",
        });

        if (selectedArg.key == 696) {
          dataInfo.categoriesName = "Day";

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(moment(item[dataInfo.categoriesName]).format($scope.userDateFormat).substring(0, item.Day?.indexOf("T")));
          });
        } else if (selectedArg.key == 780 || selectedArg.key == 182) {
          selectedArg.key == 780 ? (dataInfo.categoriesName = "Week") : (dataInfo.categoriesName = "Shift");
          
          if(selectedArg.key == 182){
            dataInfo.toolTip= 8;
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push({name:item[dataInfo.categoriesName],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
            });
          }else{
            res.ResponseDictionary.Body.forEach(function (item) {
              dataInfo.categories.push(item[dataInfo.categoriesName]);
            });
          }
          
        } else if (selectedArg.key == 963) {
          dataInfo.categoriesName = "Month";
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(`${item[dataInfo.categoriesName]}${item?.Year ? "-" +  (item.Year % 100) : ''}`);
          });
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.series[0].data.push(item[dataInfo.data]);
        });

        dataInfo = getMinMaxDataInfo(dataInfo);
        if ($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale && insight.max < 2) {
          dataInfo.tickInterval = 0.5;
        }
      } else if (insight.Name == "GetStopEventsPerPeriod" || insight.Name == "GetFactoryStopEventsPerPeriod") {
        var dataInfo = {
          series: [],
          xAxis: "",
          insight: "",
          unique: false,
          showLabels: true,
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          toolTip: 4,
          label: 3,
          selectedArg: selectedArg.key,
          min: 0,
          serverData: res.ResponseDictionary,
          tickInterval: 2500,
          max: "",
          data: "Total",
          graph: $scope.graph,
        };
        $scope.$emit("events", res.ResponseDictionary);

        dataInfo.series.push({
          name: "Total",
          color: "rgba(224, 110, 92, 1)",
          data: [],
        });

        if (dataInfo.selectedArg == 182) {
          dataInfo.xAxis = "Shift";

        } else if (dataInfo.selectedArg == 696) {
          _.map(res.ResponseDictionary.Body, function (temp) {
            temp.Day = moment(temp.Day).format($scope.userDateFormat).substring(0, temp.Day.indexOf("T"));
            return temp;
          });
          dataInfo.xAxis = "Day";
        } else if (dataInfo.selectedArg == 780) {
          dataInfo.xAxis = "Week";
        } else if (dataInfo.selectedArg == 963) {
          dataInfo.xAxis = "Month";
        } else if (dataInfo.selectedArg == 2286) {
          dataInfo.xAxis = "ShiftTypeName";
        }
        if(selectedArg.key == 182){
          dataInfo.toolTip=8;
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push({name:item[dataInfo.xAxis],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
          });
        }else if (dataInfo.selectedArg == 963) {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis] + "-" + (item.Year % 100));
          });
        } else {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis]);
          });
        }

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series[0].data.push(temp[dataInfo.series[0].name]);
        });

        var max = 0;
        if (dataInfo.insight.HValue && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
          dataInfo.max = dataInfo.insight.HValue;
          dataInfo.min = dataInfo.insight.LValue;
        } else {
          max = Math.max(
            ..._.map(res.ResponseDictionary.Body, function (item) {
              return item[dataInfo.series[0].name];
            })
          );
          dataInfo.max = Math.ceil(max);
          dataInfo.min = 0;
        }

        var time = {};
        time = getTimeForDataAndCompare(time);
        if (time) {
          dataInfo.series[0].name = time.Data;
        }
      } else if (insight.Name == "GetStopEventsPerPeriodNumberOfEvents") {
        var dataInfo = {
          series: [],
          xAxis: "",
          insight: "",
          unique: false,
          showLabels: true,
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          toolTip: 2,
          label: 1,
          selectedArg: selectedArg.key,
          min: 0,
          serverData: res.ResponseDictionary,
          graph: $scope.graph,
          max: "",
          data: "Total",
        };
        $scope.$emit("events", res.ResponseDictionary);

        dataInfo.series.push({
          name: "Total",
          color: "rgba(224, 110, 92, 1)",
          data: [],
        });

        if (dataInfo.selectedArg == 182) {
          dataInfo.xAxis = "Shift";
          dataInfo.toolTip= 8;
        } else if (dataInfo.selectedArg == 696) {
          _.map(res.ResponseDictionary.Body, function (temp) {
            temp.Day =  moment(temp.Day).format($scope.userDateFormat).substring(0, temp.Day.indexOf("T"));
            return temp;
          });

          dataInfo.xAxis = "Day";
        } else if (dataInfo.selectedArg == 780) {
          dataInfo.xAxis = "Week";
        } else if (dataInfo.selectedArg == 963) {
          dataInfo.xAxis = "Month";
        } else if (dataInfo.selectedArg == 2286) {
          dataInfo.xAxis = "ShiftTypeName";
        }
        if(selectedArg.key == 182){
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push({name:item[dataInfo.xAxis],shiftStartTime:moment(item.ShiftStartTIme).format($scope.userDateFormat.replace("HH:mm:ss",""))});
          });
        }
    
        if (dataInfo.selectedArg == 963) {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis] + "-" + (item.Year % 100));
          });
        } else {
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.xAxis]);
          });
        }

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series[0].data.push(temp[dataInfo.series[0].name]);
        });

        var max = 0;
        if (dataInfo.insight.HValue && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale) {
          dataInfo.max = dataInfo.insight.HValue;
          dataInfo.min = dataInfo.insight.LValue;
        } else {
          max = Math.max(
            ..._.map(res.ResponseDictionary.Body, function (item) {
              return item[dataInfo.series[0].name];
            })
          );

          dataInfo.max = Math.ceil(max);
          dataInfo.min = 0;
        }

        var time = {};
        time = getTimeForDataAndCompare(time);
        if (time) {
          dataInfo.series[0].name = time.Data;
          
        }
      } else {
        return;
      }
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildLineGraph(dataInfo));
      });
    };

    var addMachines = function (data, machines, idMachineServer, machineName, idMachine, machineNameServer) {
      data = _.map(data, function (machine) {
        elementIndex = _.findIndex(machines, function (temp) {
          return temp[idMachine] == machine[idMachineServer];
        });
        if (elementIndex != -1) {
          machine[machineName] = machines[elementIndex][machineNameServer];
        } else {
          machine[machineName] = machine[idMachineServer];
        }
        return machine;
      });
      return data;
    };

    var addDepartments = function (data, departments, idDepartment, departmentName, idDataDepartment, departmentDataName) {
      data = _.map(data, function (department) {
        elementIndex = _.findIndex(departments, function (temp) {
          return temp[idDepartment] == department[idDataDepartment];
        });
        if (elementIndex != -1) {
          department[departmentName] = departments[elementIndex][departmentDataName];
        } else {
          department[departmentName] = departments[idDataDepartment];
        }
        return department;
      });
      return data;
    };

    var getStackedSeries = function (dataInfo) {
        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });
    

      dataInfo.serverData.Body.forEach(function (temp) {
        dataInfo.series.map(function (item) {
          item.data.push(temp[item.name]);
        });
      });
      return dataInfo;
    };

    var getPieSeries = function (dataInfo) {
      dataInfo.serverData.Body.forEach(function (temp) {
        dataInfo.series.map(function (item) {
          dataInfo.dataVariable.forEach(function (dataVar) {
            item[dataVar] = temp[item.name];
          });
        });
      });
      return dataInfo;
    };

    var getTimeForDataAndCompare = function (time) {
      if ($scope.pickerDate.endDate.isSame($scope.pickerDate.startDate)) {
        time.Data = moment($scope.pickerDate.endDate).format("DD/MM");
      } else {
        time.Data = moment($scope.pickerDate.startDate).format("DD/MM") + "-" + moment($scope.pickerDate.endDate).format("DD/MM");
      }
      return time;
    };

    var buildStackedColumnGraphData = function (insight, res, machines, department, selectedArg) {
      if (insight.Name == "GetMachineRejectsDistributionByStartTime") {
        var dataInfo = {
          series: [],
          
          xAxisName: "",
          insight: insight,
          reasonName: "Name",
          data: "Quantity",
          categoriesName: $scope.localLanguage ? "MachineLName" : "MachineName",
          stacking: "normal",
          showLabels: true,
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 1,
          categories: [],
          toolTip: 1,
          showLegends: true,
          shiftInsight: true,
          graph: $scope.graph,
        };
        var reasons = _.unique(res.ResponseDictionary.Body, function (item) {
          return `${item.ReasonID}_${item.Name}`;
        });
        reasons.forEach(function (temp) {
          dataInfo.series.push({
            name: temp.Name,
            color: "",
            data: [],
            stack: "",
          });
        });
        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
      

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      
        dataInfo.categories = [...new Set(dataInfo.categories)];
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (item.name == temp[dataInfo.reasonName]) {
              item.data.push(temp[dataInfo.data]);
            }
          });
        });
        dataInfo.colors = GroupColors("rgba(128, 128, 128, 1)");
      } else if (insight.Name == "GetMachineAvailabilityOEELostTimeByStartTime") {
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          categoriesName: $scope.localLanguage ? "MachineLName" : "MachineName",
          categories: [],
          showLabels: true,
          insight: insight,
          stacking: "normal",
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          serverData: res.ResponseDictionary,
          label: 1,
          toolTip: 7,
          showLegends: true,
          shiftInsight: true,
          graph: $scope.graph,
        };
        if (!res.ResponseDictionary) {
          return;
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMachineLostOEETimeByStartTime") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              legendIndex: 5,
            },

            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              legendIndex: 1,
            },
          ],
          categoriesName: $scope.localLanguage ? "MachineLName" : "MachineName",
          categories: [],
          showLabels: true,
          insight: insight,
          stacking: "normal",
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          label: 1,
          serverData: res.ResponseDictionary,
          toolTip: 4,
          showLegends: true,
          shiftInsight: true,
          graph: $scope.graph,
        };
        if (!res.ResponseDictionary) {
          return;
        }
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetReportedMachineEventsByStartTime") {
        var dataInfo = {
          series: [
            {
              name: "Unreported",
              color: "rgba(135, 39, 39, 1)",
              data: [],
              stack: "",
            },
            {
              name: "FilteredShortEvents",
              color: "rgba(214, 66, 66, 1)",
              data: [],
              stack: "",
            },
            {
              name: "Reported",
              color: "rgba(245, 188, 179, 1)",
              data: [],
              stack: "",
            },
          ],
          stacking: "normal",
          categoriesName: $scope.localLanguage ? "MachineLName" : "MachineName",
          categories: [],
          showLabels: true,
          insight: insight,
          dataLabelEnable: $scope.insightsPageData ? $scope.insightsPageData.dataLabelEnable : true,
          serverData: res.ResponseDictionary,
          label: 2,
          toolTip: 3,
          showLegends: true,
          shiftInsight: true,
          graph: $scope.graph,
        };
        if (!res.ResponseDictionary) {
          return;
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });        
      } else if (insight.Name == "GetUnitsProducedDepartment" || insight.Name == "GetUnitsProducedTotalFactory") {
        var dataInfo = {
          series: [],
          
          categoriesName: "departmentName",
          stacking: "normal",
          label: 1,
          showLabels: false,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          serverData: res.ResponseDictionary,
          insight: insight,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 5,
          showLegends: true,
          graph: $scope.graph,
        };

        if (insight.Name == "GetUnitsProducedTotalFactory") {
          dataInfo.dataLabelTotalEnable = angular.copy($scope.insightData?.filters?.dataLabels);
        }

        var time = {};
        time = getTimeForDataAndCompare(time);

        dataInfo.series = [
          {
            name: "UnitsProducedTheoretically",
            color: "rgba(225, 225, 227, 1)",
            data: [],
            stack: "Body",
          },
          {
            name: "RejectsTotal",
            color: "rgba(0,0,0,1)",
            data: [],
            stack: "Body",
          },
          {
            name: "UnitsProducedOK",
            color: "rgba(26, 169, 23,1)",
            data: [],
            stack: "Body",
          },
        ];

          res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
       
        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value + " " + time.Data;
          }
        });
      } else if (insight.Name == "GetMachineLostOEETime") {

        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          xAxisName: "",
          categoriesName: "machineName",
          stacking: "normal",
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          label: 2,
          categories: [],
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };
          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "ID", "machineName", "id", "machineName");
       
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;

          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo = getStackedSeries(dataInfo);

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetDepartmentLostOEETime") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          xAxisName: "",
          categoriesName: "departmentName",
          stacking: "normal",
          label: 3,
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 6,
          showLegends: true,
          graph: $scope.graph,
        };

        res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
      
        if (selectedArg.key == 795) {
          dataInfo.stacking = "normal";
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMachineLostPETime") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          xAxisName: "",
          categoriesName: "machineName",
          stacking: "normal",
          serverData: res.ResponseDictionary,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 2,
          categories: [],
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };
         res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "ID", "machineName", "id", "machineName");
        
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;

          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetReportedDepartmentEvents") {
        var dataInfo = {
          series: [
            {
              name: "Unreported",
              color: "rgba(135, 39, 39, 1)",
              data: [],
              stack: "",
            },
            {
              name: "FilteredShortEvents",
              color: "rgba(214, 66, 66, 1)",
              data: [],
              stack: "",
            },
            {
              name: "Reported",
              color: "rgba(245, 188, 179, 1)",
              data: [],
              stack: "",
            },
          ],
          categoriesName: "departmentName",
          stacking: "normal",
          XAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          serverData: res.ResponseDictionary,
          toolTip: 17,
          showLegends: true,
          graph: $scope.graph,
        };

        res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "ID", $scope.localLanguage ? "LName" : "EName");

        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
        }

        if (selectedArg.key == 781) {
          dataInfo.label = 1;
          dataInfo.toolTip = 10;
        }
        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetReportedMachineEvents" || insight.Name == "GetReportedWorkerEvents") {
        var dataInfo = {
          series: [
            {
              name: "Unreported",
              color: "rgba(135, 39, 39, 1)",
              data: [],
              stack: "",
            },
            {
              name: "FilteredShortEvents",
              color: "rgba(214, 66, 66, 1)",
              data: [],
              stack: "",
            },
            {
              name: "Reported",
              color: "rgba(245, 188, 179, 1)",
              data: [],
              stack: "",
            },
          ],
          
          
          categoriesName: insight.Name == "GetReportedMachineEvents" ? "MachineName" : "WorkerName",
          stacking: "normal",
          XAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          serverData: res.ResponseDictionary,
          toolTip: 17,
          showLegends: true,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);

          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "ID", "machineName", "id", "machineName");
     
        if (selectedArg.key == 795 || selectedArg.key == 781) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
        }

        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMachineRejectsDistribution" || insight.Name == "GetFactoryRejectsDistribution") {
        var dataInfo = {
          series: [],
          xAxisName: "",
          reasonName: "Name",
          data: "Quantity",
          categoriesName: insight.Name == "GetMachineRejectsDistribution" ? "machineName" : "departmentName",
          stacking: "normal",
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 1,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          showLabels: true,
          serverData: res.ResponseDictionary,
          categories: [],
          toolTip: 11,
          showLegends: true,
          graph: $scope.graph,
        };
        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          ReasonID: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].Name;
        }
        var reasons = _.unique(res.ResponseDictionary.Body, function (item) {
          return `${item.ReasonID}_${item.Name}`;
        });
        reasons.forEach(function (temp) {
          if (temp.ReasonID == -1) {
            dataInfo.series.push({
              name: temp.Name,
              color: "rgba(236, 231, 240, 1)",
              data: [],
              stack: "",
            });
          } else {
            dataInfo.series.push({
              name: temp.Name,
              color: "",
              data: [],
              stack: "",
            });
          }
        });
        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
        if (insight.Name == "GetMachineRejectsDistribution") {
            res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
        } else {
          res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
        }

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      
        dataInfo.categories = [...new Set(dataInfo.categories)];
        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            if (item.name == temp[dataInfo.reasonName]) {
              item.data.push(temp[dataInfo.data]);
            }
          });
        });
        dataInfo.colors = GroupColors("rgba(128, 128, 128, 1)");
      } else if (insight.Name == "GetDepartmentLostPETime") {
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          categoriesName: "departmentName",
          stacking: "normal",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          showLabels: true,
          label: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          serverData: res.ResponseDictionary,
          toolTip: 6,
          showLegends: true,
          graph: $scope.graph,
        };

          res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
      
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo = getStackedSeries(dataInfo);
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetProductAvailabilityOEELostTime") {
        $scope.xAxisInsightSelectArray = ["ProductEName", "ProductName", "ProductID", "CatalogID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          
          
          xAxisName: "",
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 5,
          categories: [],
          serverData: res.ResponseDictionary,
          max: null,
          toolTip: 18,
          showLegends: true,
          graph: $scope.graph,
        };
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
        }
        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], product: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMoldAvailabilityOEELostTime") {
        $scope.xAxisInsightSelectArray = ["EName", "LName", "LocalID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          
          
          xAxisName: "",
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 5,
          categories: [],
          max: null,
          toolTip: 18,
          showLegends: true,
          graph: $scope.graph,
        };
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
        }

        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], mold: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMachineAvailabilityOEELostTime") {
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          
          
          xAxisName: "",
          categoriesName: "machineName",
          stacking: "normal",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          showLabels: true,
          serverData: res.ResponseDictionary,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          label: 5,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          max: null,
          toolTip: 18,
          showLegends: true,
          graph: $scope.graph,
        };
          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
      
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
        }
        dataInfo = getStackedSeries(dataInfo);

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetDepartmentAvailabilityOEELostTime") {
        var dataInfo = {
          series: [
            {
              name: "Planned",
              color: "rgba(69, 69, 69, 1)",
              data: [],
            },

            {
              name: "Unplanned",
              color: "rgba(224, 110, 92, 1)",
              data: [],
            },
            {
              name: "Setup",
              color: "rgba(65, 23, 105, 1)",
              data: [],
            },
            {
              name: "ManualLabor",
              color: "rgba(144, 238, 144, 1)",
              data: [],
            },
            {
              name: "ProductionTime",
              color: "rgba(26, 169, 23, 1)",
              data: [],
            },
          ],
          
          
          xAxisName: "",
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          categoriesName: "departmentName",
          stacking: "normal",
          label: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          max: null,
          toolTip: 6,
          showLegends: true,
          graph: $scope.graph,
        };
          res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
       
        if (selectedArg.key == 795) {
          dataInfo.max = 100;
          dataInfo.label = 1;
          dataInfo.toolTip = 8;
        }
        dataInfo = getStackedSeries(dataInfo);
      } else if (insight.Name == "GetMoldLostOEETime") {
        $scope.xAxisInsightSelectArray = ["EName", "LName", "MoldID", "LocalID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }
        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          xAxisName: "",
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          label: 2,
          categories: [],
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          showLabels: true,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };

        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;

          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], mold: temp });
          });
        });
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetMoldLostPETime") {
        $scope.xAxisInsightSelectArray = ["EName", "LName", "MoldID", "LocalID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }

        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          serverData: res.ResponseDictionary,
          label: 2,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };

        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;

          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }

        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], mold: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetProductLostOEETime") {
        $scope.xAxisInsightSelectArray = ["ProductEName", "ProductName", "ProductID", "CatalogID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }

        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },

            {
              name: "OEELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          xAxisName: "",
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          label: 2,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          serverData: res.ResponseDictionary,
          XAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };
        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;

          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityOEELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "OEELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }

        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], product: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetProductLostPETime") {
        $scope.xAxisInsightSelectArray = ["ProductEName", "ProductName", "ProductID", "CatalogID"];
        $scope.xAxisInsightSelectFlag = true;
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject) {
          var findIndex = $scope.xAxisInsightSelectArray.indexOf($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject.value);
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[findIndex];
        } else if (!insightsDashboardCtrl.xAxisSelectedObject.value) {
          insightsDashboardCtrl.xAxisSelectedObject.value = $scope.xAxisInsightSelectArray[0];
        }

        var dataInfo = {
          series: [
            {
              name: "CavitiesEfficiencyLostMins",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostMins",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostMins",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostMins",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },

            {
              name: "PELostMins",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: insightsDashboardCtrl.xAxisSelectedObject.value,
          stacking: "normal",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          label: 2,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          XAxisName: insight.xAxis ? insight.xAxis : "",
          YAxisName: insight.yAxis ? insight.yAxis : "",
          toolTip: 3,
          showLegends: true,
          graph: $scope.graph,
        };
        if (selectedArg.value == "ProductEName" || selectedArg.value == "ProductName") {
            res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
        
        }

        if (selectedArg.key == 795) {
          dataInfo.label = 1;
          dataInfo.toolTip = 7;
          dataInfo.series = [
            {
              name: "CavitiesEfficiencyLostPC",
              color: "rgba(199, 242, 243, 1)",
              data: [],
              stack: "",
              legendIndex: 5,
            },
            {
              name: "QualityLostPC",
              color: "rgba(143, 230, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 4,
            },
            {
              name: "CycleTimeLostPC",
              color: "rgba(163, 200, 255, 1)",
              data: [],
              stack: "",
              legendIndex: 3,
            },
            {
              name: "AvailabilityPELostPC",
              color: "rgba(6, 95, 232, 1)",
              data: [],
              stack: "",
              legendIndex: 2,
            },
            {
              name: "PELostPC",
              color: "rgba(122, 93, 150, 1)",
              data: [],
              stack: "",
              legendIndex: 1,
            },
          ];
        }
        dataInfo.serverData.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], product: temp });
          });
        });
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });

          if (findIndex) {
            item.name = findIndex.Value;
          }
        });
      } else if (insight.Name == "GetEventReasonsByMachineNoCalendar") {
        res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (element) {
          elementIndex = _.findIndex(machines, function (temp) {
            return temp.id == element.MachineID;
          });
          if (elementIndex != -1) {
            element.machineName = machines[elementIndex].machineName;
          } else {
            element.machineName = element.MachineID;
          }
          return element;
        });

        var dataInfo = {
          series: [],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: "machineName",
          name: "EventName",
          stacking: "normal",
          legendsType:"Event",
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          label: 1,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          toolTip: 12,
          dataVariable: ["y"],
          data: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
          showLegends: true,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);
        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          Event: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].EventName;
        }

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.label = 2;
          dataInfo.toolTip = 19;
          dataInfo.data = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });
        dataInfo.categories = [...new Set(dataInfo.categories)];

        res.ResponseDictionary.Body.forEach(function (item) {
          var serie = _.find(dataInfo.series, {
            name: item[dataInfo.name],
          });
          if (serie) {
            serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
          } else {
            var tmpArray = new Array(dataInfo.categories.length);
            tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
            tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
            if (item.Event == -1) {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
                color: "rgba(236, 231, 240, 1)",
              });
            } else {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
              });
            }
          }
        });

        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetEventReasonsByDepartmentNoCalendar") {
        res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (element) {
          elementIndex = _.findIndex(department, function (temp) {
            return temp.id == element.ID;
          });

          if (elementIndex != -1) {
            element.departmentName = $scope.localLanguage ? department[elementIndex].LName : department[elementIndex].EName;
          } else {
            element.departmentName = element.ID;
          }
          return element;
        });

        var dataInfo = {
          series: [],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: "departmentName",
          name: "EventName",
          stacking: "normal",
          serverData: res.ResponseDictionary,
          label: 1,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          categories: [],
          toolTip: 12,
          dataVariable: ["y"],
          data: "NumberOfEvents",
          showLegends: true,
          graph: $scope.graph,
          legendsType: "Event",
        };
        $scope.$emit("events", res.ResponseDictionary);
        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          Event: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].EventName;
        }

        if (selectedArg.key == 782) {
          dataInfo.label = 3;
          dataInfo.toolTip = 17;
          dataInfo.data = "EventDuration";
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });
        dataInfo.categories = [...new Set(dataInfo.categories)];

        res.ResponseDictionary.Body.forEach(function (item) {
          var serie = _.find(dataInfo.series, {
            name: item[dataInfo.name],
          });
          if (serie) {
            serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
          } else {
            var tmpArray = new Array(dataInfo.categories.length);
            tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
            tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
            if (item.Event == -1) {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
                color: "rgba(236, 231, 240, 1)",
                Event:item.Event
              });
            } else {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
                Event:item.Event
              });
            }
          }
        });

        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetWaterfallOEEByPeriod") {
        //add planned to idle
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (temp) {
          if (temp.Idle && temp.Planned) {
            temp.Idle += temp.Planned;
          }
          return temp;
        });
        // graphType 0
        var dataInfo = {
          series: [
            {
              name: "NonWorkingShiftTime",
              data: [],
              color: "rgba(167, 169, 171, 1)",
              legendIndex: 10,
              visible: true,
            },
            {
              name: "Idle",
              data: [],
              color: "rgba(69, 69, 69, 1)",
              legendIndex: 9,
              visible: true,
            },

            {
              name: "Setup",
              data: [],
              color: "rgba(65, 23, 105, 1)",
              legendIndex: 8,
              visible: true,
            },
          ],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: "Day",
          stacking: "normal",
          selectedArg: selectedArg.key,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          label: 2,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          XAxisName: insight.xAxis ? insight.xAxis : "",
          YAxisName: insight.yAxis ? insight.yAxis : "",
          toolTip: 21,
          showLegends: true,
          graph: $scope.graph,
        };
        var otherEvents = [];
        var flag = false;
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }
            return flag
              ? {
                  name: key,
                  data: [],
                  color: "rgba(224, 110, 92, 1)",
                  legendIndex: "",
                  visible: key !== "UnitsProducedOK" && key !== "UnitsProducedTheoretically",
                  find: key == "UnitsProducedOK" ? "UnitsProducedOK" : key == "UnitsProducedTheoretically" ? "UnitsProducedTheoretically" : null,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );
        var otherEventsColors = GroupColors("rgba(224, 110, 92, 1)");
        otherEvents = _.map(otherEvents, function (otherEvent, index) {
          otherEvent.legendIndex = index + 8;
          otherEvent.color = otherEventsColors[index % otherEventsColors.length];
          return otherEvent;
        });
        dataInfo.series = _.map(dataInfo.series, function (serie, index) {
          serie.legendIndex = 8 + otherEvents.length + (dataInfo.series.length - index);
          return serie;
        });

        dataInfo.series = [
          ...dataInfo.series,
          ...otherEvents,
          {
            name: "ShortStops",
            color: "rgba(224, 110, 92, 1)",
            data: [],
            legendIndex: 7,
            visible: true,
          },
          {
            name: "Unreported",
            color: "rgba(135, 39, 39, 1)",
            data: [],
            legendIndex: 6,
            visible: true,
          },
          {
            name: "NoCommunication",
            color: "rgba(33, 128, 158, 1)",
            data: [],
            legendIndex: 5,
            visible: true,
          },
          {
            name: "RateTimeLost",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 4,
            visible: true,
          },
          {
            name: "CavitiesEfficiencyLostPC",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 3,
            visible: true,
          },
          {
            name: "QualityTimeLost",
            color: "rgba(143, 230, 232, 1)",
            data: [],
            stack: "",
            legendIndex: 2,
            visible: true,
          },
          {
            name: "PE",
            color: "rgba(122, 93, 150, 1)",
            data: [],
            legendIndex: 1,
            visible: true,
          },
        ];
        if (dataInfo.selectedArg == 696) {
          dataInfo.categoriesName = "Day";
          dataInfo.categories = _.map(res.ResponseDictionary.Body, function (temp) {
            day =  moment(temp.Day).format($scope.userDateFormat).substring(0,temp.Day.indexOf("T"))
            temp.Day = day;
            return temp.Day;
          });
        } else if (dataInfo.selectedArg == 780) {
          dataInfo.categoriesName = "Week";
        } else if (dataInfo.selectedArg == 963) {
          dataInfo.categoriesName = "Month";
        } else if (dataInfo.selectedArg == 2286) {
          dataInfo.categoriesName = "ShiftTypeName";
        } else if (insight.selectedArg.key == 182) {
          dataInfo.toolTip=25;
          dataInfo.idY = "Shift";
          dataInfo.categoriesYName = "ShiftName";
  
          dataInfo.categories = _.map(
            _.unique(res.ResponseDictionary.Body, function (item) {
              return `${item[dataInfo.idY]}_${item[dataInfo.categoriesYName]}`;
            }),
            function(item){
              return {name:item.ShiftName,shiftStartTime:moment(item.StartTime).format($scope.userDateFormat.replace("HH:mm:ss",""))}
            }
          );
        }
        if (dataInfo.selectedArg == 2286 || dataInfo.selectedArg == 963 || dataInfo.selectedArg == 780) {
          dataInfo.serverData.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
        }

        dataInfo.serverData.Body.forEach(function (temp) {
          dataInfo.series.map(function (item, i, fullList) {
            item.data.push({ y: temp[item.name], fullList: fullList, index: i });
          });
        });
        dataInfo.series = _.filter(
          _.map(dataInfo.series, function (item) {
            var findIndex = _.find(res.ResponseDictionary.Translate, {
              ColumnName: item.name,
            });

            if (findIndex) {
              item.name = findIndex.Value;
            }
            return item;
          }),
          function (serie) {
            if (!serie.visible) {
              return false;
            }
            return true;
          }
        );
        dataInfo.colors = defaultHighchartColors;
      } else if (insight.Name == "GetWaterfallOEEByMachine") {
        // graphType 0

        //add planned to idle
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (temp) {
          if (temp.Idle && temp.Planned) {
            temp.Idle += temp.Planned;
          }
          return temp;
        });

        var dataInfo = {
          series: [
            {
              name: "NonWorkingShiftTime",
              data: [],
              color: "rgba(167, 169, 171, 1)",
              legendIndex: 10,
              visible: true,
            },
            {
              name: "Idle",
              data: [],
              color: "rgba(69, 69, 69, 1)",
              legendIndex: 9,
              visible: true,
            },

            {
              name: "Setup",
              data: [],
              color: "rgba(65, 23, 105, 1)",
              legendIndex: 8,
              visible: true,
            },
          ],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: "MachineName",
          stacking: "normal",
          selectedArg: selectedArg.key,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          label: 2,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          XAxisName: insight.xAxis ? insight.xAxis : "",
          YAxisName: insight.yAxis ? insight.yAxis : "",
          toolTip: 21,
          showLegends: true,
          graph: $scope.graph,
        };

        var otherEvents = [];
        var flag = false;

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });
        dataInfo.categories = [...new Set(dataInfo.categories)];
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }
            return flag
              ? {
                  name: key,
                  data: [],
                  color: "rgba(224, 110, 92, 1)",
                  legendIndex: "",
                  visible: key !== "UnitsProducedOK" && key !== "UnitsProducedTheoretically",
                  find: key == "UnitsProducedOK" ? "UnitsProducedOK" : key == "UnitsProducedTheoretically" ? "UnitsProducedTheoretically" : null,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );

        var otherEventsColors = GroupColors("rgba(224, 110, 92, 1)");
        otherEvents = _.map(otherEvents, function (otherEvent, index) {
          otherEvent.legendIndex = index + 8;
          otherEvent.color = otherEventsColors[index % otherEventsColors.length];
          return otherEvent;
        });
        dataInfo.series = _.map(dataInfo.series, function (serie, index) {
          serie.legendIndex = 8 + otherEvents.length + (dataInfo.series.length - index);
          return serie;
        });

        dataInfo.series = [
          ...dataInfo.series,
          ...otherEvents,
          {
            name: "ShortStops",
            color: "rgba(224, 110, 92, 1)",
            data: [],
            legendIndex: 7,
            visible: true,
          },
          {
            name: "Unreported",
            color: "rgba(135, 39, 39, 1)",
            data: [],
            legendIndex: 6,
            visible: true,
          },
          {
            name: "NoCommunication",
            color: "rgba(33, 128, 158, 1)",
            data: [],
            legendIndex: 5,
            visible: true,
          },
          {
            name: "RateTimeLost",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 4,
            visible: true,
          },
          {
            name: "CavitiesEfficiencyLostMins",
            color: "rgba(163, 200, 255, 1)",
            data: [],
            legendIndex: 3,
            visible: true,
          },
          {
            name: "QualityTimeLost",
            color: "rgba(143, 230, 232, 1)",
            data: [],
            stack: "",
            legendIndex: 2,
            visible: true,
          },
          {
            name: "PE",
            color: "rgba(122, 93, 150, 1)",
            data: [],
            legendIndex: 1,
            visible: true,
          },
        ];

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item, i, fullList) {
            item.data.push({ y: temp[item.name], fullList: fullList, index: i });
          });
        });

        dataInfo.series = _.filter(
          _.map(dataInfo.series, function (item) {
            var findIndex = _.find(res.ResponseDictionary.Translate, {
              ColumnName: item.name,
            });

            if (findIndex) {
              item.name = findIndex.Value;
            }
            return item;
          }),
          function (serie) {
            if (!serie.visible) {
              return false;
            }
            return true;
          }
        );

        dataInfo.colors = defaultHighchartColors;
      } else if (insight.Name == "GetEventGroupsByMachine") {
        res.ResponseDictionary.Body = _.map(res.ResponseDictionary.Body, function (element) {
          elementIndex = _.findIndex(machines, function (temp) {
            return temp.id == element.MachineID;
          });
          if (elementIndex != -1) {
            element.machineName = machines[elementIndex].machineName;
          } else {
            element.machineName = element.MachineID;
          }
          return element;
        });

        var dataInfo = {
          series: [],
          
          
          xAxisName: "",
          showLabels: true,
          categoriesName: "MachineName",
          name: "GroupName",
          stacking: "normal",
          label: 1,
          legendsType:"EventGroup",
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          serverData: res.ResponseDictionary,
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          toolTip: 12,
          dataVariable: ["y"],
          data: selectedArg?.key == "2315" ? "AverageEventDuration" : "NumberOfEvents",
          showLegends: true,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);

        var indexOther = _.findIndex(res.ResponseDictionary.Body, {
          EventGroup: -1,
        });
        if (indexOther > -1) {
          var nameOther = res.ResponseDictionary.Body[indexOther].GroupName;
        }

        if (selectedArg.key == 782 || selectedArg.key == 2315) {
          dataInfo.label = 3;
          dataInfo.toolTip = 17;
          dataInfo.data = selectedArg.key == 782 ? "EventDuration" : "AverageEventDuration";
        }

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });
        dataInfo.categories = [...new Set(dataInfo.categories)];

        res.ResponseDictionary.Body.forEach(function (item) {
          var serie = _.find(dataInfo.series, {
            name: item[dataInfo.name],
          });
          if (serie) {
            serie.data[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
          } else {
            var tmpArray = new Array(dataInfo.categories.length);
            tmpArray = tmpArray.fill(0, 0, dataInfo.categories.length);
            tmpArray[dataInfo.categories.indexOf(item[dataInfo.categoriesName])] = item[dataInfo.data];
            if (item.EventGroup == -1) {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
                color: $scope.insightsColorShades.currentChoice == "defaultHighchartColor" ? undefined : "rgba(236, 231, 240, 1)",
                EventGroup:item.EventGroup
              });
            } else {
              dataInfo.series.push({
                name: item[dataInfo.name],
                data: tmpArray,
                EventGroup:item.EventGroup
              });
            }
          }
        });

        indexOther = _.findIndex(dataInfo.series, {
          name: nameOther,
        });
        if (indexOther != -1) {
          dataInfo.series = [dataInfo.series.splice(indexOther, 1)[0], ...dataInfo.series];
        }
        if ($scope.insightsColorShades.currentChoice == "defaultHighchartColor") {
          dataInfo.colors = defaultHighchartColors;
        } else {
          dataInfo.colors = GroupColors($scope.insightsColorShades[$scope.insightsColorShades.currentChoice]);
        }
      } else if (insight.Name == "GetUnitsProducedFactory") {
        var dataInfo = {
          series: [],
          
          categoriesName: "DepartmentName",
          stacking: "normal",
          label: 1,
          categories: [],
          serverData: res.ResponseDictionary,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 2,
          showLegends: true,
          graph: $scope.graph,
        };
        dataInfo.dataLabelTotalEnable = angular.copy(dataInfo.dataLabelEnable);
        var time = {};
        time = getTimeForDataAndCompare(time);
        dataInfo.series = [
          {
            name: "UnitsProducedTheoretically",
            color: "rgba(225, 225, 227, 1)",
            data: [],
            stack: "Body",
          },
          {
            name: "RejectsTotal",
            color: "rgba(0,0,0,1)",
            data: [],
            stack: "Body",
          },
          {
            name: "UnitsProducedOK",
            color: "rgba(26, 169, 23,1)",
            data: [],
            stack: "Body",
          },
        ];
          // res.ResponseDictionary.Body = addDepartments(res.ResponseDictionary.Body, department, "id", "departmentName", "Department", $scope.localLanguage ? "LName" : "EName");
       

          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
      

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value + " " + time.Data;
          }
        });
      } else if (insight.Name == "GetUnitsProduced") {
        var dataInfo = {
          series: [],
          categoriesName: "machineName",
          stacking: "normal",
          label: 1,
          categories: [],
          serverData: res.ResponseDictionary,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 2,
          showLegends: true,
          graph: $scope.graph,
        };
        if(!res.ResponseDictionary.XAxis.length){
          insightsDashboardCtrl.xAxisList=[]
          if(+insightsDashboardCtrl.insight?.selectedArg?.key < 0){
            insightsDashboardCtrl.insight.selectXAxis = {
              FieldName:"JobListParameterName"
            }
          }
          else{
            return;
          }
        }
        else
        {
          insightsDashboardCtrl.xAxisList = angular.copy(res.ResponseDictionary.XAxis);
          var findselectXAxis =  _.find(insightsDashboardCtrl.xAxisList,{'FieldName':insightsDashboardCtrl.insight?.selectXAxis?.FieldName})
          //initialize Xaxis select
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectXAxis) {
            var findLocalStorage =  _.find(insightsDashboardCtrl.xAxisList,{'FieldName':$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectXAxis?.FieldName})
            if(findLocalStorage){
              insightsDashboardCtrl.insight.selectXAxis = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectXAxis;
            }
            else
            {
              insightsDashboardCtrl.insight.selectXAxis = insightsDashboardCtrl.xAxisList && insightsDashboardCtrl.xAxisList[0]
            }
          } else if (!findselectXAxis) {
            insightsDashboardCtrl.insight.selectXAxis = insightsDashboardCtrl.xAxisList && insightsDashboardCtrl.xAxisList[0]
          }
        }
        if(!insightsDashboardCtrl.insight.selectXAxis.FieldName)
        {
          return;
        }
        dataInfo.categoriesName =insightsDashboardCtrl.insight.selectXAxis.FieldName;
        var time = {};
        time = getTimeForDataAndCompare(time);

        dataInfo.series = [
          {
            name: "UnitsProducedTheoretically",
            color: "rgba(225, 225, 227, 1)",
            data: [],
            stack: "Body",
          },
          {
            name: "RejectsTotal",
            color: "rgba(0,0,0,1)",
            data: [],
            stack: "Body",
          },
          {
            name: "UnitsProducedOK",
            color: "rgba(26, 169, 23,1)",
            data: [],
            stack: "Body",
          },
        ];
        res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]+"");
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.name], product: temp, mold: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value + " " + time.Data;
          }
        });
        
      } else if (insight.Name == "GetNumberOfTests") {
        var dataInfo = {
          series: [],
          
          categoriesName: "machineName",
          stacking: "normal",
          label: 1,
          categories: [],
          serverData: res.ResponseDictionary,
          showLabels: true,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: 2,
          showLegends: true,
          graph: $scope.graph,
        };

        setCategoryName(dataInfo,insight?.selectedArg,"categoriesName",res)
        var time = {};
        time = getTimeForDataAndCompare(time);

        dataInfo.series = [
          {
            name: $filter("translate")("NUMBER_OF_FAILED_TESTS"),
            dataName: "NumberOfFailedTests",
            color: "rgb(247,163,92,1)",
            data: [],
            stack: "Body",
          },
          {
            name: $filter("translate")("NUMBER_OF_SUCCESSED_TESTS"),
            dataName: "NumberOfSuccessTests",
            color: "rgb(144,237,125,1)",
            data: [],
            stack: "Body",
          },
        ];

        res.ResponseDictionary.Body.forEach(function (item) {
          item.NumberOfSuccessTests = !_.isNaN(item.NumberOfTests) && !_.isNaN(item.NumberOfFailedTests) ? item.NumberOfTests - item.NumberOfFailedTests : null;
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push({ y: temp[item.dataName], product: temp, mold: temp });
          });
        });

        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value + " " + time.Data;
          }
        });
      } else if (insight.Name == "GetUnitsProducedByStartTime") {
        var dataInfo = {
          series: [],
          
          categoriesName: "machineName",
          stacking: "normal",
          label: 1,
          categories: [],
          serverData: res.ResponseDictionary,
          showLabels: true,
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          xAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          toolTip: '"<b>" +this.x + "</b><br>" + this.series.name +": " +this.y +"<br/>"',
          showLegends: true,
          graph: $scope.graph,
        };
        $scope.xAxisInsightSelectArray = [];

        var time = {};
        time = getTimeForDataAndCompare(time);
        dataInfo.series = [
          {
            name: "RejectsTotal",
            color: "rgba(0,0,0,1)",
            data: [],
            stack: "Body",
          },
          {
            name: "UnitsProducedOK",
            color: "rgba(26, 169, 23,1)",
            data: [],
            stack: "Body",
          },
        ];

          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "machineName", "id", "machineName");
     
          res.ResponseDictionary.Body.forEach(function (item) {
            dataInfo.categories.push(item[dataInfo.categoriesName]);
          });
     

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });
        dataInfo.series.map(function (item) {
          var findIndex = _.find(res.ResponseDictionary.Translate, {
            ColumnName: item.name,
          });
          if (findIndex) {
            item.name = findIndex.Value + " " + time.Data;
          }
        });
      } else if (insight.Name == "GetMachineEventsByType") {
        var dataInfo = {
          series: [
            {
              name: "DownTime",
              color: "rgba(191, 22, 32, 1)",
              data: [],
              stack: "Data",
            },

            {
              name: "Idle",
              color: "rgba(166, 168, 171, 1)",
              data: [],
              stack: "Data",
            },
          ],
          
          showLabels: true,
          XAxisName: insight.XAxisName ? insight.XAxisName : "",
          YAxisName: insight.YAxisName ? insight.YAxisName : "",
          categoriesName: "MachineName",
          stacking: "normal",
          label: 3,
          insight: insight,
          insightsColorText: $scope.insightsColorText,
          categories: [],
          dataLabelEnable: $scope.insightData?.filters?.dataLabels,
          serverData: res.ResponseDictionary,
          toolTip: 17,
          showLegends: true,
          graph: $scope.graph,
        };

        $scope.$emit("events", res.ResponseDictionary);

        if (selectedArg.key == 781) {
          dataInfo.label = 1;
          dataInfo.toolTip = 15;
        }

          res.ResponseDictionary.Body = addMachines(res.ResponseDictionary.Body, machines, "MachineID", "MachineName", "id", "machineName");
       

        res.ResponseDictionary.Body.forEach(function (item) {
          dataInfo.categories.push(item[dataInfo.categoriesName]);
        });

        res.ResponseDictionary.Body.forEach(function (temp) {
          dataInfo.series.map(function (item) {
            item.data.push(temp[item.name]);
          });
        });

      } else {
        return;
      }
      $scope.insightDataLoading = true;
      $timeout(function () {
        insightsDashboardCtrl.insightChart = Highcharts.chart($element.find("#insightGraph")[0], highchartService.buildSeriesStackedColumnGraph(dataInfo));
        $scope.insightDataLoading = false;
      });
    };

    var buildTableData = function (insightName, res, selectedArg) {
      if (insightName == "InsightGetGroupedPerformanceTotals") {
        //graphType = 2
      
        //add planned to idle
        insightsDashboardCtrl.showGridTableGraph = true;
        $scope.refresh = true;
        const divideMeBy100 = "UnitsRatio";
        const timeColumns =  ["EventsDuration", "ActiveTime" ,  "DownTime" ,  "Duration" ,  "ProductionTime" ,  "Setup" ,  "SetupDownTime" ,  "SetupProductionTime"]
        const percentageKpis = ["UnitsRatio", "AvailabilityPE", "QualityIndex", "CycleTimeEfficiency", "PE", "CavitiesEfficiency", "PercentageByNumberOfEvents", "PercentageByDurationOfEvents", "Material KG/Meter PC", "UsedMaterialPC"];
        const kpisWithTarget = ["PE", "AvailabilityPE", "CycleTimeEfficiency", "CavitiesEfficiency", "QualityIndex"];
        //good units, theoretical units, total units shift, rejects, reported units- 
        const twoDigitsNumbers = ["Material KG/Meter Standard", "Material KG/Meter", "WeightOfRejects","WeightOfRejectsKG","Units/Hour Actual","Units/Hour std","Units/Min Actual","Units/Min std","UnitsProducedOK", "RejectsTotal", "UnitsProducedTheoretically", "TotalUnitsJosh","UnitsReportedOK"];
        const COLORED_KPIS = percentageKpis;
        const ZEROS_REPLACEMENT_IN_TABLE = '-';

        var flag = false;
        const firstColumn = [
          'DepartmentName',
          'JobID',
          'ProductGroupName',
          'MachineGroupName',
          'MachineName',
          'MoldName',
          'ProductName',
          'WorkerName',
          'JobListParameterName',
        ];
        const defaultColumns = [
          'MachineName',
          'JobID',
          'erpjobID', //missing
          'ProductName',
          'UnitsRatio',
          'UnitsProducedOK',
          'UnitsProducedTheoretically',
          'PE',
          'AvailabilityPE',
          'CycleTimeEfficiency',
          'CavitiesEfficiency',
          'QualityIndex',
        ].concat(firstColumn);
        if (!res.ResponseDictionary.Translate){
          res.ResponseDictionary.Translate = [];
        }
        res.ResponseDictionary.Translate.sort((a, b) => defaultColumns.indexOf(a.ColumnName) - defaultColumns.indexOf(b.ColumnName));
        const gridColumn = res.ResponseDictionary.Translate.map(it => ({
          name : it.ColumnName, 
          visible: defaultColumns.indexOf(it.ColumnName) >= 0,
          cellTemplate: 
            firstColumn.indexOf(it.ColumnName) < 0 || parseInt(selectedArg.key) < 0
              ?
                '<div class="ui-grid-cell-contents" tooltip="{{COL_FIELD.tooltip}}" style=" text-align: center;" ng-style="COL_FIELD.style">{{COL_FIELD.value}}</div>'
              :
                '<div ng-click="grid.appScope.openComplete195(COL_FIELD.valueId)" class="ui-grid-cell-contents" tooltip="{{COL_FIELD.tooltip}}" style="text-align: center;cursor: pointer; color : #337ab7;">{{COL_FIELD.value}}</div>'
        }));

        var sampleColData = [];

        var sampleColDefs = [];
        const mappingKeys = {
          "148" : 'DepartmentName',
          "167": 'JobID',
          "331": 'ProductGroupName',
          "335": 'MachineGroupName',
          "706": 'MachineName',
          "707": 'MoldName',
          "708": 'ProductName',
          "712": 'WorkerName',
          "-1": 'JobListParameterName',
        }
        _.remove(gridColumn,(it => it.ColumnName === selectedArg.key));

        gridColumn.unshift({
          name: mappingKeys[parseInt(selectedArg.key) > 0 ? selectedArg.key : "-1"],
          visible: true,
          enableHiding: false,
          cellTemplate: '<div ng-click="grid.appScope.openComplete195(COL_FIELD.valueId)" class="ui-grid-cell-contents" tooltip="{{COL_FIELD.tooltip}}" style="text-align: center;cursor: pointer; color : #337ab7;">{{COL_FIELD.value}}</div>',
        });

        sampleColDefs = _.filter(gridColumn, function (col) {
          var transCol = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col.name,
          });
          if (transCol) {
            col.displayName = transCol.Value;
          } else {
            col.displayName = col.name;
          }

          col.headerTooltip = function (col) {
            return col.displayName;
          };
          col.cellTooltip = true;
          return col;
        });


        const getInnerColor = (unitsRatio) => {
          let moreThan = $scope.innerCircleColorSettings.find(e => e.Name === 'moreThan');
          let lessThan = $scope.innerCircleColorSettings.find(e => e.Name === 'LessThen');
          let otherwise = $scope.innerCircleColorSettings.find(e => e.Name === 'else');
          if (unitsRatio > moreThan.Pc) {
              return moreThan.ColorID;
          } else if (unitsRatio < lessThan.Pc) {
              return lessThan.ColorID;
          }
          return otherwise.ColorID;
      }

      const getValue = (data, col) => {
            let val = 0,currValue;
            if (firstColumn.indexOf(col.name) >= 0) {
                return data[col.name];
            }
            $scope.durationType = $scope.graph.options.settings.durationType;
            if ($scope.durationType === 'hourMinutes' && timeColumns.indexOf(col.name) >= 0 && data[col.name] ) { 
                return $filter('getDurationInHoursMinutes')(data[col.name]) ; 
            }
      
            currValue = data[col.name];
            
            if (typeof currValue === 'string'){
                return currValue;
            }
            if (divideMeBy100 === col.name) {
                currValue = currValue / 100;
            }
            if (percentageKpis.indexOf(col.name) > -1) {
                val0 = (currValue * 100).toFixed(0) ;
                val2 = (currValue * 100).toFixed(2) ;
                val = Math.abs(val2-val0) > 0 ? val2 + '%' : val0 + '%';
            } else if (twoDigitsNumbers.indexOf(col.name) > -1) {
                if (currValue < 100 && currValue != null && currValue!= 0 ) {
                    let v0 = Math.floor(currValue);
                    let v2 = Math.floor(currValue * 100) / 100;
                    if( v2-v0 > 0 ) {
                        val = Math.floor(currValue * 100) / 100;
                    }
                    else {
                        val = Math.floor(currValue);
                    }   
                } else {
                    val = Math.floor(currValue)
                }
                if (currValue >= 1000){
                    let v0 = currValue.toFixed(0); 
                    val = v0.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            } else {
                val = Math.floor(currValue)
            }
            if (!val || !data.UnitsProducedTheoretically) {
                return ZEROS_REPLACEMENT_IN_TABLE;
            }
            
            let toggleTarget = $scope.graph.options.settings.targetMode;
            if (toggleTarget && (kpisWithTarget.indexOf(col.name) > -1)) {
                let target = parseInt(data[col.name + 'Target'] * 100);
                val = val + " (" + target + "%)";
            }
            
            return val;
        }

        const getCellData = (data,col) => {
          const style = {};
          let val;

          if (COLORED_KPIS.indexOf(col.name) > -1) {
            $scope.isAbsolutePercentage = $scope.graph.options.settings.percentageChoice;
            let val;
            if ($scope.isAbsolutePercentage === 'target') //target
            {
                if (data[col.name + "Target"]) {
                    val = data[col.name] / data[col.name + "Target"];
                } else {
                    val = data[col.name];
                }
            } else {
                val = data[col.name];
            }

            if (col.name === divideMeBy100) {
                val /= 100;
            }
            if (data.UnitsProducedTheoretically) {
                style['background-color'] = getInnerColor(val * 100);
                const fontColor = LeaderMESservice.getBWByColor(style['background-color']);
                style.color = fontColor;
            }
          }
          const value = getValue(data,col); 
          let valueId = undefined;
          if (firstColumn.indexOf(col.name) >= 0){
            const idMappings = {
              "DepartmentName": "DepartmentID",
              "JobID": "JobID",
              "ProductGroupName": "ProductGroupID",
              "MachineGroupName": "MachineGroupID",
              "MachineName": "MachineID",
              "MoldName": "MoldID",
              "ProductName": "ProductID",
              "WorkerName": "WorkerID",
              "JobListParameterName": "JobListParameterID",
            }
            valueId = data[idMappings[col.name]];
          }
          return {
            value: value,
            valueId: valueId,
            tooltip: value,
            style: style
          }
        };

        _.forEach(res.ResponseDictionary.Body, function (row) {
          const samplecolDataTemp = {};
          _.forEach(sampleColDefs, function (temp) {
            samplecolDataTemp[temp.name] = getCellData(row, temp);
          });
          sampleColData.push(samplecolDataTemp);
        });

        // if ($sessionStorage.stateParams.subMenu.SubMenuExtID && 
        //   $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] && 
        //   $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && 
        //   $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState){
        //     const previousState = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState;
        //     if (previousState.columns[0].name !== sampleColDefs[0].name){
        //       $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState = null;
        //     }
        // }


        $scope.sampleGridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: angular.copy(sampleColDefs),
          showClearAllFilters: true,
          enableGridMenu: true,
          data: angular.copy(sampleColData),
          enableRowSelection: true,
          enableSelectAll: true,
          exporterMenuPdf: true,
          exporterMenuCsv: false,
          multiSelect: true,
          exporterExcelFilename: "Sheet" + ".xlsx",
          exporterExcelSheetName: "Sheet",
          exporterCsvFilename: "Sheet" + ".csv",
          exporterPdfDefaultStyle: { fontSize: 7 },
          exporterPdfTableStyle: {
            margin: [0, 0, 0, 0],
          },
          exporterPdfTableHeaderStyle: {
            fontSize: 8,
            bold: true,
            italics: true,
            color: "blue",
          },
          exporterPdfHeader: {
            text: "Sheet",
            style: "headerStyle",
            alignment: $scope.rtl === "rtl" ? "right" : "left",
            margin: [30, 10, 30, 2],
          },
          exporterPdfFooter: function (currentPage, pageCount) {
            return {
              text: currentPage.toString() + " of " + pageCount.toString(),
              style: "footerStyle",
              margin: [30, 0, 30, 0],
            };
          },
          exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
              fontSize: 22,
              bold: true,
              alignment: $scope.rtl == "rtl" ? "right" : "left",
            };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
          },
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, "HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
          gridMenuCustomItems: [
            {
              title: $filter("translate")("RESET"),
              action: function () {
                $sessionStorage.gridInsightState[insightName] = {};
                $scope.sampleGridOptions.columnDefs = angular.copy(sampleColDefs);
                $scope.sampleGridOptions.data = angular.copy(sampleColData);
              },
            },
          ],
          onRegisterApi: function (gridApi) {
            // Keep a reference to the gridApi.
            $scope.gridApi = gridApi;
            // Setup events so we're notified when grid state changes.
            $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            $scope.gridApi.grouping.on.aggregationChanged($scope, saveState);
            $scope.gridApi.grouping.on.groupingChanged($scope, saveState);
            $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.filterChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);

            // Restore previously saved state.
            restoreState();
          },
          appScopeProvider: {
            openComplete195 : (value) => {
              const insightDate = {
                days: $scope.dateRequestDataSent.day,
                endDate: moment($scope.dateRequestDataSent.referenceDate,'YYYY-MM-DD HH:mm:ss')
              }
              const heatMapColors = $scope.heatMapColors;
              $modal.open({
                templateUrl: "views/custom/productionFloor/common/insight.html",
                controller: function ($scope, $compile, $modalInstance) {
                  $scope.pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
                  const machines = $sessionStorage.insightData[$scope.pageID].filters.Machines;
                  var filterBy = angular.copy($sessionStorage.insightData[$scope.pageID].filters.filterBy);
                  filterBy =  filterBy.filter(function(test){
                    return test.FilterName != "ShiftNameFilter";
                  })         
                    var getFilterBy = function (name, filterByTemp, data) {
                    if (!data) return;
                    var findObj = _.find(filterByTemp, function (search) {
                      return search.FilterName == name;
                    });

                    if (typeof data == "number" || typeof data == "string") {
                      if (findObj) {
                        findObj.FilterValues = [data];
                      } else {
                        filterByTemp.push({
                          FilterName: name,
                          FilterValues: [data],
                        });
                      }
                    } else {
                      if (findObj) {
                        findObj.FilterValues = [...data];
                      } else {
                        filterByTemp.push({
                          FilterName: name,
                          FilterValues: [...data],
                        });
                      }
                    }
                  };

                  const mappings = {
                    "148" : 'DepartmentIdFilter',
                    "167": 'jobIdFilter',
                    "331": 'ProductGroupFilter',
                    "706": 'MachineIdFilter',
                    "707": 'MoldIdFilter',
                    "708": 'ProductIdFilter',
                    "712": 'UserIdFilter',
                  }
                  if (selectedArg.key !== '335'){
                    getFilterBy(mappings[selectedArg.key], filterBy, value);
                  }
                  else {
                    const newMachines = machines.filter(it => it.MachineGroupID === value);
                    getFilterBy('MachineIdFilter', filterBy, newMachines.map(it => it.ID));
                  }

                  if(!$scope.insightData)
                  {
                    $scope.insightData = {}
                  }
                  if(!$scope.insightData[$scope.pageID])
                  {
                    $scope.insightData[$scope.pageID] = {}
                  }
                  
                  $scope.insightData[$scope.pageID] = {
                    container: [
                      {
                        template: "insightGraph",
                        name: "insightName",
                        nameID: "Complete shift-job details 195",
                        clone: true,
                        order: 10,
                        InsightGroupID: 2,
                        ID: "195",
                        inModel: true,
                        groupNameE: "Performance",
                        groupNameL: "Performance",
                        selectedInterval: "6",
                        options: {
                          display: true,
                          duplicate: true,
                          disableExport: true,
                          width: 12,
                          disablePie: true,
                          selectedGraph: "bar",
                          disableTable: true,
                          disableClose: false,
                          rotateBar: false,
                          header: "Machines Load",
                          disableBar: true,
                          settings: {
                            insight: {
                              AdditionalFilters: null,
                              AnswerEName: null,
                              AnswerLName: null,
                              DisplayOnMobile: false,
                              DisplayOrder: 10,
                              DisplayTypeID: 6,
                              DisplayTypeName: "Table",
                              EName: "Date Range []",
                              HValue: 0,
                              ID: "195",
                              additionalArgs: null,
                              parentInsightID: '247',
                              IsCompare: false,
                              IsInFactoryLevel: false,
                              LName: "Date Range []",
                              LValue: 0,
                              MergePC: false,
                              filterByModel: filterBy,
                              Name: "GetCompleteShiftDetails",
                              newDate: insightDate,
                              ReportID: 0,
                              TimeInterval: "1,7,14,28",
                              TimeUnit: "day",
                              Title: "Complete shift-job details",
                              TitleDictionaryID: 1568,
                              XAxisChange: false,
                              XAxisName: null,
                              YAxisName: null,
                              InsightGroupID: 2,
                              displayTypeID: 6,
                              xAxis: null,
                              yAxis: null,
                              mergePC: 80,
                              insightTopNum: 5,
                              selectedInterval: "1",
                              selectedArg: { key: "706", value: "Machine" },
                              selectedArg2: "",
                              selectedArg3: "",
                              insightParameters: [],
                            },
                            heatMapColors:heatMapColors,
                            percentageChoice: "absolute",
                            scale: 1,
                          },
                          applyAll: true,
                          defaultGraph: "pie",
                          height: 500,
                          maxHeight: 500,
                          tableSelected: false,
                          printDiv: "shiftContainerGraphPrint",
                          rotateH: false,
                          legend: false,
                          hideSettings: false,
                          sizable: true,
                          displayFilter: false,
                          editBtn: false,
                          enableVisibility: false,
                          showAllForLegend: false,
                          compareBtn: false,
                          tableButton: false,
                          isTableView: false,
                        },
                        change: 0,
                        isFiltered: false,
                        localMachines: [],
                      },
                    ],
                  }
                },
              });
            }
          }
        };

        function saveState() {
          var state = $scope.gridApi.saveState.save();
          if (!$sessionStorage.gridInsightState) {
            $sessionStorage.gridInsightState = {};
          }
          $sessionStorage.gridInsightState[$scope.insight.ID.toString()] = state;
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()]) {
            $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState = state;
          }
        }

        function restoreState() {
          $timeout(function () {
            if (!$sessionStorage.gridInsightState) {
              $sessionStorage.gridInsightState = {};
            } else {
              if($scope.insight.settingState){
                var state = $scope.insight.settingState;
              }
              else
              {
                var state = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState;
              }
              if (state) {
                $scope.gridApi.saveState.restore($scope, state);
              }
            }
          });
        }
        
        $timeout(function () {
          $scope.refresh = false;
        }, 350);
      }
      else if (insightName == "GetWaterfallOEEByPeriod") {
        //graphType = 2

        //add planned to idle
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (temp) {
          if (temp.Idle && temp.Planned) {
            temp.Idle += temp.Planned;
          }
          return temp;
        });
        insightsDashboardCtrl.showGridTableGraph = true;

        var otherEvents = [];
        var flag = false;
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }
            return flag
              ? {
                  name: key,
                  visible: true,
                  groupingShowAggregationMenu: false,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );

        var gridColumn = [...insightGridTableService.GetWaterfallOEETemplate.slice(0, 7), ...otherEvents, ...insightGridTableService.GetWaterfallOEETemplate.slice(7, insightGridTableService.GetWaterfallOEETemplate.length)];
        var samplecolDataTemp = {};
        var sampleColData = [];

        var sampleColDefs = [];
        if (selectedArg?.key == 696) {
          gridColumn[0].name = "Day";
        } else if (selectedArg?.key == 780) {
          gridColumn[0].name = "Week";
        } else if (selectedArg?.key == 963) {
          gridColumn[0].name = "Month";
        } else if (selectedArg?.key == 2286) {
          gridColumn[0].name = "ShiftTypeName";
        } else if (selectedArg?.key == 182) {
          gridColumn[0].name = "ShiftName";
        }

        sampleColDefs = _.filter(gridColumn, function (col) {
          var transCol = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col.name,
          });
          if (transCol) {
            col.displayName = transCol.Value;
          } else {
            col.displayName = col.name;
          }

          col.headerTooltip = function (col) {
            return col.displayName;
          };
          col.cellTooltip = true;
          return col;
        });

        _.forEach(res.ResponseDictionary.Body, function (row) {
          _.forEach(sampleColDefs, function (temp) {
            if (temp.name == "Day") {
              samplecolDataTemp[temp.name] = row[temp.name] ? row[temp.name].split("T")[0] : row[temp.name];
            } else if (temp.name == "Week" || temp.name == "ShiftTypeName" || temp.name == "Month" || temp.name == "ShiftName") {
              samplecolDataTemp[temp.name] = row[temp.name];
            } else {
              samplecolDataTemp[temp.name] = row[temp.name] ? $filter("getDurationInHrMin")(row[temp.name]) : row[temp.name];
            }
          });
          sampleColData.push(samplecolDataTemp);
          samplecolDataTemp = {};
        });

        $scope.sampleGridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: angular.copy(sampleColDefs),
          showClearAllFilters: false,
          enableGridMenu: true,
          data: angular.copy(sampleColData),
          enableRowSelection: true,
          enableSelectAll: true,
          exporterMenuPdf: true,
          exporterMenuCsv: false,
          multiSelect: true,
          exporterExcelFilename: "Sheet" + ".xlsx",
          exporterExcelSheetName: "Sheet",
          exporterCsvFilename: "Sheet" + ".csv",
          exporterPdfDefaultStyle: { fontSize: 7 },
          exporterPdfTableStyle: {
            margin: [0, 0, 0, 0],
          },
          exporterPdfTableHeaderStyle: {
            fontSize: 8,
            bold: true,
            italics: true,
            color: "blue",
          },
          exporterPdfHeader: {
            text: "Sheet",
            style: "headerStyle",
            alignment: $scope.rtl === "rtl" ? "right" : "left",
            margin: [30, 10, 30, 2],
          },
          exporterPdfFooter: function (currentPage, pageCount) {
            return {
              text: currentPage.toString() + " of " + pageCount.toString(),
              style: "footerStyle",
              margin: [30, 0, 30, 0],
            };
          },
          exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
              fontSize: 22,
              bold: true,
              alignment: $scope.rtl == "rtl" ? "right" : "left",
            };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
          },
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, "HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
          gridMenuCustomItems: [
            {
              title: $filter("translate")("RESET"),
              action: function () {
                $sessionStorage.gridInsightState[insightName] = {};
                $scope.sampleGridOptions.columnDefs = angular.copy(sampleColDefs);
                $scope.sampleGridOptions.data = angular.copy(sampleColData);
              },
            },
          ],
          onRegisterApi: function (gridApi) {
            // Keep a reference to the gridApi.
            $scope.gridApi = gridApi;
            // Setup events so we're notified when grid state changes.
            $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            $scope.gridApi.grouping.on.aggregationChanged($scope, saveState);
            $scope.gridApi.grouping.on.groupingChanged($scope, saveState);
            $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.filterChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);

            // Restore previously saved state.
            restoreState();

            //remove ungroup if machineEName hidden
            $scope.gridApi.core.on.columnVisibilityChanged($scope, function (col) {
              if (col.field == "MachineEName") {
                if (col.visible) {
                  col.grouping = { groupPriority: 0 };
                } else {
                  col.grouping = [];
                }
              }
            });
          },
        };

        function saveState() {
          var state = $scope.gridApi.saveState.save();
          if (!$sessionStorage.gridInsightState) {
            $sessionStorage.gridInsightState = {};
          }
          $sessionStorage.gridInsightState[$scope.insight.ID.toString()] = state;
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()]) {
            $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState = state;
          }
        }

        function restoreState() {
          $timeout(function () {
            if (!$sessionStorage.gridInsightState) {
              $sessionStorage.gridInsightState = {};
            } else {
              if($scope.insight.settingState){
                var state = $scope.insight.settingState;
              }
              else
              {
                var state = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState;
              }
              if (state) {
                $scope.gridApi.saveState.restore($scope, state);
              }
            }
          });
        }
        $scope.refresh = true;
        $timeout(function () {
          $scope.refresh = false;
        }, 350);
      } else if (insightName == "GetWaterfallOEEByMachine") {
        //graphType = 2

        //add planned to idle
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (temp) {
          if (temp.Idle && temp.Planned) {
            temp.Idle += temp.Planned;
          }
          return temp;
        });

        insightsDashboardCtrl.showGridTableGraph = true;

        // var gridColumn = insightGridTableService.GetWaterfallOEETemplate;
        var otherEvents = [];
        var flag = false;
        otherEvents = _.filter(
          _.map(res.ResponseDictionary.Body[0], function (value, key) {
            if (key == "OtherEvents") {
              flag = true;
              return {};
            }
            return flag
              ? {
                  name: key,
                  visible: true,
                  groupingShowAggregationMenu: false,
                  find: key == "UnitsProducedOK" ? "UnitsProducedOK" : key == "UnitsProducedTheoretically" ? "UnitsProducedTheoretically" : null,
                }
              : {};
          }),
          function (value) {
            if (_.isEmpty(value)) {
              return false;
            }
            return true;
          }
        );

        var gridColumn = [...insightGridTableService.GetWaterfallOEETemplate.slice(0, 7), ...otherEvents, ...insightGridTableService.GetWaterfallOEETemplate.slice(7, insightGridTableService.GetWaterfallOEETemplate.length)];
        var samplecolDataTemp = {};
        var sampleColData = [];

        var sampleColDefs = [];

        gridColumn[0].name = "MachineName";

        sampleColDefs = _.filter(gridColumn, function (col) {
          var transCol = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col.name,
          });

          if (transCol) {
            col.displayName = transCol.Value;
          } else {
            col.displayName = col.name;
          }

          col.headerTooltip = function (col) {
            return col.displayName;
          };
          col.cellTooltip = true;
          return col;
        });

        _.forEach(res.ResponseDictionary.Body, function (row) {
          _.forEach(sampleColDefs, function (temp) {
            if (temp.name == "MachineName") {
              samplecolDataTemp[temp.name] = row[temp.name];
            } else {
              samplecolDataTemp[temp.name] = row[temp.name] ? $filter("getDurationInHrMin")(row[temp.name]) : row[temp.name];
            }
          });
          sampleColData.push(samplecolDataTemp);
          samplecolDataTemp = {};
        });

        $scope.sampleGridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: angular.copy(sampleColDefs),
          showClearAllFilters: false,
          enableGridMenu: true,
          data: angular.copy(sampleColData),
          enableRowSelection: true,
          enableSelectAll: true,
          exporterMenuPdf: true,
          exporterMenuCsv: false,
          multiSelect: true,
          exporterExcelFilename: "Sheet" + ".xlsx",
          exporterExcelSheetName: "Sheet",
          exporterCsvFilename: "Sheet" + ".csv",
          exporterPdfDefaultStyle: { fontSize: 7 },
          exporterPdfTableStyle: {
            margin: [0, 0, 0, 0],
          },
          exporterPdfTableHeaderStyle: {
            fontSize: 8,
            bold: true,
            italics: true,
            color: "blue",
          },
          exporterPdfHeader: {
            text: "Sheet",
            style: "headerStyle",
            alignment: $scope.rtl === "rtl" ? "right" : "left",
            margin: [30, 10, 30, 2],
          },
          exporterPdfFooter: function (currentPage, pageCount) {
            return {
              text: currentPage.toString() + " of " + pageCount.toString(),
              style: "footerStyle",
              margin: [30, 0, 30, 0],
            };
          },
          exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
              fontSize: 22,
              bold: true,
              alignment: $scope.rtl == "rtl" ? "right" : "left",
            };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
          },
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, "HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
          gridMenuCustomItems: [
            {
              title: $filter("translate")("RESET"),
              action: function () {
                $sessionStorage.gridInsightState[insightName] = {};
                $scope.sampleGridOptions.columnDefs = angular.copy(sampleColDefs);
                $scope.sampleGridOptions.data = angular.copy(sampleColData);
              },
            },
          ],
          onRegisterApi: function (gridApi) {
            // Keep a reference to the gridApi.
            $scope.gridApi = gridApi;
            // Setup events so we're notified when grid state changes.
            $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            $scope.gridApi.grouping.on.aggregationChanged($scope, saveState);
            $scope.gridApi.grouping.on.groupingChanged($scope, saveState);
            $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.filterChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);

            // Restore previously saved state.
            restoreState();

            //remove ungroup if machineEName hidden
            $scope.gridApi.core.on.columnVisibilityChanged($scope, function (col) {
              if (col.field == "MachineEName") {
                if (col.visible) {
                  col.grouping = { groupPriority: 0 };
                } else {
                  col.grouping = [];
                }
              }
            });
          },
        };

        function saveState() {
          var state = $scope.gridApi.saveState.save();
          if (!$sessionStorage.gridInsightState) {
            $sessionStorage.gridInsightState = {};
          }
          $sessionStorage.gridInsightState[$scope.insight.ID.toString()] = state;
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()]) {
            $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState = state;
          }
        }

        function restoreState() {
          $timeout(function () {
            if (!$sessionStorage.gridInsightState) {
              $sessionStorage.gridInsightState = {};
            } else {
              if($scope.insight.settingState){
                var state =$scope.insight.settingState
              }
              else
              {
                var state = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].settingState;

              }
              if (state) {
                $scope.gridApi.saveState.restore($scope, state);
              }
            }
          });
        }
        $scope.refresh = true;
        $timeout(function () {
          $scope.refresh = false;
        }, 350);
      } else if (insightName == "GetCompleteShiftDetails") {
        insightsDashboardCtrl.showGridTableGraph = true;
        var machineCol = angular.copy(insightGridTableService.machineTemplate);
          var findGroupingMachineName = _.find(machineCol,{name:"MachineName"})
          if(findGroupingMachineName && !findGroupingMachineName.visible){
            delete findGroupingMachineName.grouping
          }
          
            var findGroupingProductName = _.find(machineCol,{name:"ProductName"})
            if(findGroupingProductName && !findGroupingProductName.visible){
              delete findGroupingProductName.grouping
            }

            var findGroupingSetupDownTime = _.find(machineCol ,{name:"SetupDownTime"});
            findGroupingSetupDownTime.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {
                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.SetupDownTime;
                  }
            }
            findGroupingSetupDownTime.customTreeAggregationFinalizerFn = function (aggregation) { 
                   aggregation.rendered = aggregation.durationTotal ;
            };

           var findGroupingSetupProductionTime = _.find(machineCol ,{name:"SetupProductionTime"});
            findGroupingSetupProductionTime.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {
                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.SetupProductionTime;
                  }
            }
            findGroupingSetupProductionTime.customTreeAggregationFinalizerFn = function (aggregation) { 
                   aggregation.rendered = aggregation.durationTotal ;
            };

      
            var findGroupingActiveTime = _.find(machineCol ,{name:"ActiveTime"});
            findGroupingActiveTime.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {
                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.ActiveTime;
                  }
            }
            findGroupingActiveTime.customTreeAggregationFinalizerFn = function (aggregation) {
                   aggregation.rendered = aggregation.durationTotal ;
            };

            var findGroupingProductionTime = _.find(machineCol ,{name:"ProductionTime"});
            findGroupingProductionTime.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {

                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.ProductionTime;
                  }
            }
            findGroupingProductionTime.customTreeAggregationFinalizerFn = function (aggregation) {
                   aggregation.rendered = aggregation.durationTotal ;
            };

            var findGroupingDowntime = _.find(machineCol ,{name:"Downtime"});
            findGroupingDowntime.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {

                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.Downtime;
                  }
            }
            findGroupingDowntime.customTreeAggregationFinalizerFn = function (aggregation) {
                   aggregation.rendered = aggregation.durationTotal ;
            };

            var findGroupingDuration = _.find(machineCol ,{name:"Duration"});
            findGroupingDuration.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {

                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.Duration;
                  }
            }
            findGroupingDuration.customTreeAggregationFinalizerFn = function (aggregation) {
                   aggregation.rendered = aggregation.durationTotal ;
            };

            var findGroupingSetup = _.find(machineCol ,{name:"Setup"});
            findGroupingSetup.customTreeAggregationFn = function (aggregation, fieldValue, numValue, row) {

                if (!aggregation.value) {
                    if (!aggregation.durationTotal) {
                      aggregation.durationTotal = 0;
                    }
                    aggregation.durationTotal += row.entity.Setup;
                  }
            }
            findGroupingSetup.customTreeAggregationFinalizerFn = function (aggregation) {
                   aggregation.rendered = aggregation.durationTotal ;
            };

        let i = _.findIndex(machineCol,{name:"MachineName"});
        let j = _.findIndex(machineCol,{name:"WorkerName"});
        let k = _.findIndex(machineCol,{name:"ProductName"});
        
        if ($scope.localLanguage) {
          machineCol[i].name = "MachineLName";
          machineCol[j].name = "WorkerLName";
          machineCol[k].name = "ProductLName";
        } else { 
          machineCol[i].name = "MachineEName";
          machineCol[j].name = "WorkerEName";
          machineCol[k].name = "ProductEName";
        } 
        gridColumn = machineCol;

        var samplecolDataTemp = {};
        var sampleColData = [];

        var sampleColDefs = [];
        $scope.showValueByTarget = $scope.graph?.options.settings.targetMode;
        sampleColDefs = _.filter(gridColumn, function (col) {
          var transCol = _.find(res.ResponseDictionary.Translate, {
            ColumnName: col.name,
          });

          if(( col.name === "ActiveTime" || col.name === "Downtime" || col.name === "Duration" || col.name === "ProductionTime" || col.name === "Setup" || col.name === "SetupDownTime" || col.name === "SetupProductionTime" || col.name === "CycleTimeStandard" || col.name === "InActiveTime") && $scope.graph?.options.settings.durationType === "hourMinutes"){
                col.cellFilter = "getDurationInHoursMinutes";
          }

          if (col.name=="WeightTarget"|| col.name == "UnitsTarget" || col.name == "RejectsTotal" || col.name == "UnitsProducedOK" || col.name == "UnitsProduced" || col.name == "UnitsProducedLeft" || col.name == "UnitsReportedOK" || col.name == "Units/Hour avg" || col.name == "Units/Hour std" || col.name == "UnReportedRejects") {
            col.cellFilter = "thousandsSeperator";
          }

          
          if (transCol) {
            col.displayName = transCol.Value;
          } else {
            col.displayName = col.name;
          }
          
        
          if((col.name === "UnitsRatio" ||col.name === "Efficiency" || col.name === "QualityIndex" || col.name === "CavitiesEfficiency" || col.name === "AvailabilityPE" || col.name === "AvailabilityOEE" || col.name === "PE" || col.name === "OEE"))
          {
                if ($scope.graph?.options.settings.heatMapColors) {
                  document.documentElement.style.setProperty('--high-bgColor-var' ,$scope.graph?.options.settings.heatMapColors[0].color);
                  document.documentElement.style.setProperty('--high-color-var' ,LeaderMESservice.getBWByColor($scope.graph?.options.settings.heatMapColors[0].color));
                  document.documentElement.style.setProperty('--low-bgColor-var' ,$scope.graph?.options.settings.heatMapColors[1].color);
                  document.documentElement.style.setProperty('--low-color-var' ,LeaderMESservice.getBWByColor($scope.graph?.options.settings.heatMapColors[1].color),160);
                  document.documentElement.style.setProperty('--middle-bgColor-var' ,$scope.graph?.options.settings.heatMapColors[2].color);
                  document.documentElement.style.setProperty('--middle-color-var' ,LeaderMESservice.getBWByColor($scope.graph?.options.settings.heatMapColors[2].color),160);
                }
            
                if($scope.graph?.options.settings.colorMode === true){

                    col.cellClass= function(grid,row,col){ 
                        value = grid.getCellValue(row,col);
                        let percentage;
                        if($scope.graph?.options.settings.percentageChoice === "absolute" || col.name === "UnitsRatio" ){ // always color UnitsRatio(Performance) like an absolute coloring
                            percentage = grid.getCellValue(row,col);
                            if(!_.isNaN(percentage) && _.isNumber(percentage) && col.name !== "UnitsRatio" ){
                                percentage *= 100 ; 
                            }
                        }
                        else if($scope.graph?.options.settings.percentageChoice === "target") {
                            if(col.name == "Efficiency" && row.entity["CycleTime"+col.name+"Target"] ){
                                percentage = parseFloat(row.entity[col.name] / row.entity["CycleTime"+col.name+"Target"]).toFixed(2)*100 ; // different naming of target "CycleTimeEfficiencyTarget"
                            }
                            else {
                                percentage = parseFloat(row.entity[col.name] / row.entity[col.name+"Target"]).toFixed(2)*100;
                            }
                        }
                        if(percentage >= 80){
                            return 'complete-shift-job-high table-content';
                        }
                        else if(percentage <= 60){
                            return 'complete-shift-job-low table-content';
                        }
                        else if(percentage > 60 && percentage < 80){
                            return 'complete-shift-job-middle table-content'
                        }
                    }
                }

                if($scope.showValueByTarget === true ){
                    if(col.name == "Efficiency" ){
                        col.cellTemplate = `<span ng-if="row.entity[col.name] || row.entity[col.name] === 0">{{(row.entity[col.name]*100).toFixed(2) + "% ("+(row.entity["CycleTime"+col.name+"Target"]*100).toFixed(0)+"%)"}}</span>` ; // different naming of target "CycleTimeEfficiencyTarget"  
                    }
                    else if(col.name !== "UnitsRatio"){
                        let target = col.name+"Target";
                        col.cellTemplate = `<span ng-if="row.entity[col.name] || row.entity[col.name] === 0" >{{(row.entity[col.name]*100).toFixed(2)}}% ({{(row.entity.${target}*100).toFixed(0)}}%)</span>` ;
                    }
                   
                }else{
                    col.cellTemplate = `<span ng-if="row.entity[col.name] || row.entity[col.name] === 0 " >{{(row.entity[col.name]*100).toFixed(0)}}%</span>` ;
                }
                if(col.name === "UnitsRatio"){
                        col.cellTemplate = `<span ng-if="row.entity[col.name]!=undefined" >{{row.entity[col.name]}}% </span>` ;
                 }

          }
           
          if(col.name === "MachineEName"){
             $scope.openMachine = function(machineId, row, field){
                let machineIdTemp = machineId;
                if (!machineIdTemp) {
                  if (row && row.treeNode && row.treeNode.children && row.treeNode.children.length > 0 && 
                      row.treeNode.children[0].row && row.treeNode.children[0].row.entity && 
                      row.treeNode.children[0].row.entity.MachineID){
                    machineIdTemp = row.treeNode.children[0].row.entity.MachineID
                  }
                  else {
                    notify({
                      message: $filter('translate')('UNABLE_TO_OPEN_MACHINE'),
                      classes: 'alert-danger',
                      templateUrl: 'views/common/notify.html'
                  });
                  }
                }
                var url = $state.href("appObjectMachineFullView", {
                    appObjectName: "MachineScreenEditor",
                    ID: machineIdTemp,
                });
                window.open(url, "_blank");
            }
            col.cellTemplate= `<span style="cursor: pointer; color : #337ab7; display: flex;height: 100%; align-items: center;justify-content: center;" ng-click="grid.appScope.openMachine(row.entity['MachineID'] , row)" >{{COL_FIELD}}</span>`;
          }
          if(col.name === "JobID" || col.name === "JobERP" ){ 
             $scope.openJob = function(jobId){
               if (!jobId){
                 return null
               }
                var url = $state.href("appObjectFullView", {
                    appObjectName: "Job",
                    ID: jobId,
                });
                window.open(url, "_blank");
            }
            col.cellTemplate= `<span ng-style="{cursor: row.entity['JobID'] && 'pointer'}" style=" color : #337ab7; display: flex;height: 100%; align-items: center;justify-content: center;" ng-click="grid.appScope.openJob(row.entity['JobID'])" >{{row.entity[col.name]}}</span>`;
          }

          if(col.name === "JoshID" ){
             $scope.openJosh = function(joshId){
                var url = $state.href("appObjectFullView", {
                    appObjectName: "Josh",
                    ID: joshId,
                });
                window.open(url, "_blank");
            }
            col.cellTemplate= `<span style="cursor: pointer; color : #337ab7; display: flex;height: 100%; align-items: center;justify-content: center;" ng-click="grid.appScope.openJosh(row.entity['JoshID'])" >{{COL_FIELD}}</span>`;
          }

          if(col.name === "MoldName" ){ 
             $scope.openMold = function(moldId){
                var url = $state.href("appObjectFullView", { 
                    appObjectName: "Mold",
                    ID: moldId,
                });
                window.open(url, "_blank");
            }
            col.cellTemplate= `<span style="cursor: pointer; color : #337ab7; display: flex;height: 100%; align-items: center;justify-content: center;" ng-click="grid.appScope.openMold(row.entity['MoldID'])" >{{COL_FIELD}}</span>`;
          }

          if(col.name === "ProductEName" || col.name === "ProductLName" || col.name === "CatalogID" ){
             $scope.openProduct = function(productId){
               if (!productId){
                 return;
               }
                var url = $state.href("appObjectFullView", {
                    appObjectName: "Product",
                    ID: productId,
                });
                window.open(url, "_blank");
            }
            col.cellTemplate= `<span 
              ng-style="{
                cursor: row.entity['ProductID'] ? 'pointer': ''
              }"
              style="color : #337ab7; display: flex;height: 100%; align-items: center;justify-content: center;" 
              ng-click="grid.appScope.openProduct(row.entity['ProductID'])" >{{COL_FIELD}}</span>`;
          }

          col.headerTooltip = function (col) {
            return col.displayName;
          };
          col.cellTooltip = true;
          return col;
        });
        _.forEach(res.ResponseDictionary.Body, function (row) {
          _.forEach(sampleColDefs, function (temp) {
            if ( temp.name === "Kg/Hour" || temp.name === "UnitsRatio" || temp.name === "WeightOfRejectsKG" || temp.name === "WeightOfRejects" || temp.name === "UnitsReportedOK" || temp.name === "AvailabilityOEE" || temp.name === "AvailabilityPE" || temp.name === "TotalWeight" || temp.name === "UnitWeight" || temp.name === "UnitsProducedOK" || temp.name === "UnitsProducedLeft" || temp.name === "UnitsProduced" || temp.name === "AvailabilityOEE" || temp.name == "Efficiency" || temp.name == "PE" || temp.name == "OEE" || temp.name == "Units/Hour avg" || temp.name == "Units/Hour std" || temp.name == "Units/Min avg" || temp.name == "Units/Min std" || temp.name == "Unit/Min Cost" || temp.name == "Unit/Hour Cost" || temp.name == "CycleTimeCostSec") {
              if (row[temp.name]) {
                if( temp.name === "UnitsReportedOK" || temp.name === "UnitsProducedTheoretically" || temp.name === "UnitsProducedOK" || temp.name === "UnitsProducedLeft" || temp.name === "UnitsProduced" ){
                    samplecolDataTemp[temp.name] = ( row[temp.name] < 100 ) ? parseFloat(row[temp.name]?.toFixed(2)) : row[temp.name] ;
                }
                else {
                    samplecolDataTemp[temp.name] = parseFloat(row[temp.name]?.toFixed(2));
                }
              } else {
                samplecolDataTemp[temp.name] = parseFloat(row[temp.name]);
              }
            } else if (temp.name == "StartTime" || temp.name == "EndTime") {
              samplecolDataTemp[temp.name] = row[temp.name] ? moment(row[temp.name]).format($scope.userDateFormat).split("T").join(" ") : moment(row[temp.name]).format($scope.userDateFormat);
            } else {
              samplecolDataTemp[temp.name] = row[temp.name];
            }
            if(  ( temp.name == "Efficiency" || temp.name == "QualityIndex" || temp.name == "CavitiesEfficiency" || temp.name == "AvailabilityPE" || temp.name == "AvailabilityOEE" || temp.name == "PE" || temp.name == "OEE")){
                   if(temp.name == "Efficiency" ){
                        samplecolDataTemp["CycleTime"+temp.name+"Target"] = parseFloat(row["CycleTime"+temp.name+"Target"].toFixed(2));
                   }
                   else {
                       samplecolDataTemp[temp.name+"Target"] = parseFloat(row[temp.name+"Target"]?.toFixed(2));
                   }
            }

            samplecolDataTemp["MachineID"] = row["MachineID"];
            samplecolDataTemp["ProductID"] = row["ProductID"];
            samplecolDataTemp["JobID"] = row["JobID"];
            samplecolDataTemp["JoshID"] = row["JoshID"];
            samplecolDataTemp["MoldID"] = row["MoldID"]; 
            samplecolDataTemp["MoldName"] =  $scope.localLanguage ? row["MoldLName"] : row["MoldEName"]; 
            
          });
          sampleColData.push(samplecolDataTemp);
          samplecolDataTemp = {};
        });

        $scope.sampleGridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: angular.copy(sampleColDefs),
          showClearAllFilters: false,
          enableGridMenu: true,
          data: angular.copy(sampleColData),
          exporterMenuPdf: true,
          exporterMenuCsv: false,
          exporterExcelFilename: "Sheet" + ".xlsx",
          exporterExcelSheetName: "Sheet",
          exporterCsvFilename: "Sheet" + ".csv",
          exporterPdfDefaultStyle: { fontSize: 7 },
          exporterPdfTableStyle: {
            margin: [0, 0, 0, 0],
          },
          exporterPdfTableHeaderStyle: {
            fontSize: 8,
            bold: true,
            italics: true,
            color: "blue",
          },
          exporterPdfHeader: {
            text: "Sheet",
            style: "headerStyle",
            alignment: $scope.rtl === "rtl" ? "right" : "left",
            margin: [30, 10, 30, 2],
          },
          exporterPdfFooter: function (currentPage, pageCount) {
            return {
              text: currentPage.toString() + " of " + pageCount.toString(),
              style: "footerStyle",
              margin: [30, 0, 30, 0],
            };
          },
          exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
              fontSize: 22,
              bold: true,
              alignment: $scope.rtl == "rtl" ? "right" : "left",
            };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
          },
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, "HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },

          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
          gridMenuCustomItems: [
            {
              title: $filter("translate")("RESET"),
              action: function () {
                $sessionStorage.gridInsightState[insightName] = {};
                $scope.sampleGridOptions.columnDefs = angular.copy(sampleColDefs);
                $scope.sampleGridOptions.data = angular.copy(sampleColData);
              },
            },
          ],
          onRegisterApi: function (gridApi) {
            // Keep a reference to the gridApi.
            $scope.gridApi = gridApi;
            // Setup events so we're notified when grid state changes.
            $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            $scope.gridApi.grouping.on.aggregationChanged($scope, saveState);
            $scope.gridApi.grouping.on.groupingChanged($scope, saveState);
            $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.filterChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);

            // // Restore previously saved state.
            restoreState();

            //remove ungroup if machineEName hidden
            $scope.gridApi.core.on.columnVisibilityChanged($scope, function (col) {
              if (col.field == "MachineEName" || col.field == "MachineLName") {
                if (col.visible) {
                  col.grouping = { groupPriority: 0 };
                } else {
                  col.grouping = [];
                }
              }
              if (col.field == "ProductEName" || col.field == "ProductLName") {
                if (col.visible) {
                  col.grouping = { groupPriority: 1 };
                } else {
                   col.grouping = [];
                }
              }
            });
          },
        };

        function saveState() {
          let id;
          var state = $scope.gridApi.saveState.save();
          if($scope.insight.parentInsightID){
            id = $scope.insight.parentInsightID
          }
          else
          {
            id = $scope.insight.ID.toString()
          }
          if (!$sessionStorage.gridInsightState) {
            $sessionStorage.gridInsightState = {};
          }
          $sessionStorage.gridInsightState[id] = state;
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id]) {
            $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].settingState = state;
          }
        }
        //tttt
        function restoreState() {
          $timeout(function () {
            let id;
            if($scope.insight.parentInsightID){
              id = $scope.insight.parentInsightID
            }
            else
            {
              id = $scope.insight.ID.toString()
            }
            if (!$sessionStorage.gridInsightState) {
              $sessionStorage.gridInsightState = {};
            } else {
              if($scope.insight.settingState && $scope.loadTableFirstTime && $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID]){
                var state = $scope.insight.settingState;                
              }
              else{
                var state = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][id].settingState 
              }
              $scope.loadTableFirstTime= false;
              if (state) {
                const grouping = state.grouping;
                $scope.gridApi.saveState.restore($scope, state);
                $scope.gridApi.grouping.clearGrouping();
                if (grouping && grouping !== {}){
                  $timeout(() => {
                    $scope.gridApi.grouping.setGrouping(grouping);
                  }, 300);
                }
              }
            }
          });
        }
        $scope.refresh = true;
        $timeout(function () {
          $scope.refresh = false;
        }, 400);
      } else {
        res.ResponseDictionary.Headers = _.filter(res.ResponseDictionary.Headers, function (header) {
          return header.fieldname != "EndDate" && header.fieldname != "DurationDays" && header.fieldname != "DurationHr";
        });
        res.ResponseDictionary.Body = _.filter(res.ResponseDictionary.Body, function (body) {
          if (body.StartDate) {
            body.StartDate = body.StartDate.split("T").join(" ");
          }
          if (body.CycleProgress) {
            if (body.CycleProgress % 1 > 0) {
              body.CycleProgress = parseFloat(body.CycleProgress.toFixed(2));
            }
          }
          return body;
        });
        $scope.tableHeaders = _.sortBy(res.ResponseDictionary.Headers, "displayorder");
        $scope.tableBody = res.ResponseDictionary.Body;
        var numHeaders = _.map(
          _.filter($scope.tableHeaders, function (header) {
            return header.displaytype == "num" && !header.linkitem && header.linkitem == "";
          }),
          "fieldname"
        );
        if (numHeaders.length > 0) {
          $scope.tableBody.forEach((elm) => {
            for (var i = 0; i < numHeaders.length; i++) {
              elm[numHeaders[i]] = parseFloat(elm[numHeaders[i]].toFixed(2));
            }
          });
        }
        if ($scope.tableBody) {
          $scope.tableBody.forEach((elm) => {
            elm.startdate = new Date(Date.parse(elm.startdate)).toLocaleString();
          });
        }
        $scope.tableBody = _.sortByOrder($scope.tableBody, ["startdate"]);
        insightsDashboardCtrl.showTableGraph = true;
      }
    };

    var init = function () {
      $scope.insightDataLoading = true;
      $scope.$emit("insightLoading", true);
      if ($scope.isShift) {
        if (!$scope.parameterObj) {
          return;
        }
        $scope.insightHeight = $scope.parameterObj.api == "GetTotalReportedEventsByTypeByStartTime" ? "400px" : "470px";
        var arr = [],
          start,
          end;
        if ($scope.page == "dashboardMachine") {
          arr.push(+Object.keys($sessionStorage.machinesDisplay));
        } else {
          if (!shiftService.shiftData.machineID) {
            _.forIn(shiftService.shiftData.machinesDisplay, function (value, key) {
              let subMachine = $scope.graph.localMachines.find((machine) => machine.ID == key);
              if (subMachine && subMachine.value) {
                arr.push(+key);
              }
            });
          } else {
            arr.push(+shiftService.shiftData.machineID);
          }
        }
        if ($scope.parameterObj?.api == "GetShiftsKPIMeasuresByStartTime" && shiftService.shiftData?.dataTimePeriod != 3) {
          if (shiftService.shiftData.customDayTab) {
            start = shiftService.shiftData?.KPIsByShiftsCustom?.startDate.toISOString().split(".")[0].split("T").join(" ");
            end = shiftService.shiftData?.KPIsByShiftsCustom?.endDate.toISOString().split(".")[0].split("T").join(" ");
          } else {
            var sortBy = _.sortBy(shiftService.shiftData.ShiftsLast7Days, (shift) => shift.ID);
            if (_.isEmpty(sortBy)) {
              return;
            }
            if (shiftService.shiftData.dataTimePeriod == 4) {
              end = moment().format("YYYY-MM-DD HH:mm:ss");
              start = sortBy[sortBy.length - 3]?.StartTime?.split("T").join(" ");
            } else if (shiftService.shiftData.dataTimePeriod == 6) {
              end = sortBy[sortBy.length - 2]?.EndTime?.split("T").join(" ");
              start = sortBy[sortBy.length - 4]?.StartTime?.split("T").join(" ");
            }
          }
        } else {
          // start = shiftService?.shiftData?.customRangeEnabled ? $filter("date")(new Date(shiftService?.shiftData?.customRange?.startDate), "yyyy-MM-dd HH:mm:ss") : $filter("date")(new Date(shiftService?.sliderData?.minValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
          // end = shiftService?.shiftData?.customRangeEnabled ? $filter("date")(new Date(shiftService?.shiftData?.customRange?.endDate), "yyyy-MM-dd HH:mm:ss") : $filter("date")(new Date(shiftService?.sliderData?.maxValue * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
          start = shiftService?.shiftData?.shiftStartDate
          end = shiftService?.shiftData?.shiftEndDate

        }
        var id,
          obj = {
            StartDate: start,
            EndDate: end,
            filterBy: [
              {
                FilterName: "MachineIdFilter",
                FilterValues: arr,
              },
            ],
          };

        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        if ($scope.shiftData?.machineID) {
          id = $scope.parameterObj.api + $scope.shiftData.machineID;
        } else {
          id = $scope.parameterObj.api;
        }
        var insightTemp = {
          Name: $scope.parameterObj.api,
          ID: id,
        };
        $scope.insightRequestTimeout = $timeout(function () {
          LeaderMESservice.customAPI($scope.parameterObj.api, obj).then(function (res) {
            $scope.shiftPieChart = false;
            if ($scope.parameterObj?.api == "GetTotalReportedEventsByTypeByStartTime") {
              $scope.shiftPieChart = true;
              buildPieData("", $scope.parameterObj.api, res);
            } else if ($scope.parameterObj?.api == "GetMachineLostOEETimeByStartTime" || $scope.parameterObj.api == "GetMachineAvailabilityOEELostTimeByStartTime" || $scope.parameterObj.api == "GetReportedMachineEventsByStartTime" || $scope.parameterObj.api == "GetMachineRejectsDistributionByStartTime") {
              buildStackedColumnGraphData(insightTemp, res);
            } else if ($scope.parameterObj?.api == "GetDepartmentKPIsByTime") {
              buildSeriesLineGraphData(insightTemp, res);
            } else if ($scope.parameterObj?.api == "GetMachinesKPIMeasuresByStartTime" || $scope.parameterObj.api == "GetShiftsKPIMeasuresByStartTime") {
              buildHeatMapGraphData(insightTemp, res);
            }

            $timeout(function () {
              insightsDashboardCtrl.insightChart ? insightsDashboardCtrl.insightChart.reflow() : "";
              $scope.dataLoading = false;
              $scope.insightDataLoading = false;
            }, 0);
          });
        }, 500);
      } else {
        var insight = $scope.insight;
        var counter = 0,
          counterEvents = 0,
          counterEventsGroup = 0,
          counterEventsType = 0,
          additionalArgs = [];
        $scope.insightsScale = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.scale;
        $scope.insightsDeviation = $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.deviation;
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        insightsDashboardCtrl.insight = $scope.insight;
        insightsDashboardCtrl.graph = $scope.graph;
        if ($scope.firstTime) {
          $scope.firstTime = false;
          $scope.pickerDate = {
            endDate: moment($localStorage.insightDate.pickerDate.endDate),
            startDate: moment($localStorage.insightDate.pickerDate.startDate),
          };
        }


        if (!$scope.localTime) {
          getPickerDate();
          $scope.localTime = true;
        }
        var machinesFilterd = [];
        var depNames = [];
        var machines = _.map($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines, function (temp) {
          return {
            id: temp.ID,
            machineName: $scope.localLanguage ? temp.MachineLName : temp.MachineName,
          };
        });

        _.forEach($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.Machines, function (machine) {
          if (machine.value) {
            machinesFilterd.push(machine.ID);
          }
        });

        if ($scope.localLanguage) {
          depNames = _.map($sessionStorage.departmentNames, function (temp) {
            return { id: temp.Id, LName: temp.EName };
          });
        } else {
          depNames = _.map($sessionStorage.departmentNames, function (temp) {
            return { id: temp.Id, EName: temp.EName };
          });
        }
        $scope.dataLoading = true;

        if (insight.InsightArgs && insight.selectedArg) {
          findIndex = _.findIndex(insight.InsightArgs, {
            key: insight.selectedArg.key,
          });
          if(findIndex > -1)
          {
            $scope.insight.selectedArg = $scope.insight.InsightArgs[findIndex];
          }
          else
          {
            $scope.insight.selectedArg = $scope.insight.InsightArgs.length > 0 ? $scope.insight.InsightArgs[0] : $scope.insight.selectedArg;
          }
        }
        if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg && !insight.savedTemplate) {
          findIndex = _.findIndex(insight.InsightArgs, {
            key: $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg.key,
          });
          if(findIndex > -1)
          {
            insight.selectedArg = insight.InsightArgs[findIndex];
          }
          else
          {
            insight.selectedArg = insight.InsightArgs.length > 0 ? insight.InsightArgs[0] : insight.selectedArg;
          }
        } else if (!insight.selectedArg) {
          if (insight.ID == 240) {
            var findInsightArgs = _.find(insight.InsightArgs, { key: "2294" });
            insight.selectedArg = insight.InsightArgs.length > 0 ? findInsightArgs : insight.selectedArg;
          } else {
            insight.selectedArg = insight.InsightArgs.length > 0 ? insight.InsightArgs[0] : insight.selectedArg;
          }
        }
        
        if (insight.AdditionalArgs && insight.AdditionalArgs.length > 0) {
          insight.InsightArgs2 = _.find(insight.AdditionalArgs, { Key: "InsightArg2" })?.Value;
          if (insight.selectedArg2) {
            findIndex = _.findIndex(insight.InsightArgs2, {
              key: insight.selectedArg2.key,
            });
            $scope.insight.selectedArg2 = $scope.insight.InsightArgs2[findIndex];
          }
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg2 && !insight.savedTemplate) {
            findIndex = _.findIndex(insight.InsightArgs2, {
              key: $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg2.key,
            });
            insight.selectedArg2 = insight.InsightArgs2[findIndex];
          } else if (!insight.selectedArg2) {
            var findSelectedArg2 = _.find(insight.InsightArgs2, { key: "706" });
            if (findSelectedArg2) {
              insight.selectedArg2 = insight.InsightArgs2.length > 0 ? findSelectedArg2 : insight.selectedArg2;
            }
            else
            {
              var findSelectedArg2 = _.find(insight.InsightArgs2, { key: "2316" });
              if (findSelectedArg2) {
                insight.selectedArg2 = insight.InsightArgs2.length > 0 ? findSelectedArg2 : insight.selectedArg2;
              }
            }
          }
          additionalArgs.push({ key: "insightArg2", value: insight.selectedArg2.key });
        }
        
        if (insight.AdditionalArgs && insight.AdditionalArgs.length > 1) {
          insight.InsightArgs3 = _.find(insight.AdditionalArgs, { Key: "InsightArg3" })?.Value;
          if (insight.selectedArg3) {
            findIndex = _.findIndex(insight.InsightArgs3, {
              key: insight.selectedArg3.key,
            });
            $scope.insight.selectedArg3 = $scope.insight.InsightArgs3[findIndex];
          }
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg3 && !insight.savedTemplate) {
            findIndex = _.findIndex(insight.InsightArgs3, {
              key: $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg3.key,
            });
            insight.selectedArg3 = insight.InsightArgs3[findIndex];
          } else if (!insight.selectedArg3) {
            if(insight.InsightArgs3 && insight.InsightArgs3.length>0){
              findselectedArg3 =  insight.InsightArgs3[0]
              if (findselectedArg3) {
                insight.selectedArg3 = insight.InsightArgs3.length > 0 ? findselectedArg3 : insight.selectedArg3;
              }
            }
          }
          additionalArgs.push({ key: "InsightArg3", value: insight.selectedArg3.key });
        }

        if ($scope.insightSelectedInterval.selectedInterval == undefined) {
          insightsDashboardCtrl.updateDate();
        }

        var day = $scope.insightSelectedInterval.selectedInterval;
        if ($scope.pickerDate) {
          if (
            $scope.insightSelectedInterval.id == "CUSTOM" ||
            $scope.insightSelectedInterval.id == "LAST_7_DAYS" ||
            $scope.insightSelectedInterval.id == "LAST_14_DAYS" ||
            $scope.insightSelectedInterval.id == "LAST_28_DAYS" ||
            $scope.insightSelectedInterval.id == "LAST_WEEK_MONDAY_TO_SUNDAY" ||
            $scope.insightSelectedInterval.id == "LAST_WEEK_SUNDAY_TO_SATURDAY"
          ) {
            var referenceDate = moment($scope.pickerDate.endDate).add("days", 1).format("YYYY-MM-DD HH:mm:ss");
            day++;
          } else {
            var referenceDate = moment($scope.pickerDate.endDate).format("YYYY-MM-DD HH:mm:ss");
          }
        }
        if ($scope.graph?.inModel) {
          var filterBy = $scope.insight.filterByModel;
          referenceDate = moment(referenceDate).format("YYYY-MM-DD 00:00:00")
          if ($scope.insight.newDate) {
            referenceDate = moment($scope.insight.newDate.endDate).add("days", 1).format("YYYY-MM-DD 00:00:00");
            day = $scope.insight.newDate.days + 1;
          }
        } else {
          var filterBy = angular.copy($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.filterBy);

          if ($scope.graph && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef) {
            if (_.filter($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef, (shift) => shift.value).length == $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.ShiftDef.length) {
              indexTempShift = _.findIndex(filterBy, {
                FilterName: "ShiftNameFilter",
              });
              filterBy.splice(indexTempShift, 1);
            }
          }
          indexTemp = _.findIndex(filterBy, {
            FilterName: "MachineIdFilter",
          });
          if (indexTemp > -1) {
            //check graph because i dont have shiftContainer in absoluteWindow insight which means i dont have graph.localmachines
            if ($scope.graph) {
              if (_.intersection(filterBy[indexTemp].FilterValues,_.map($scope.graph.localMachines,'ID')).length === filterBy[indexTemp].FilterValues.length) {
                filterBy[indexTemp].FilterValues = [];
                _.forEach($scope.graph.localMachines, function (temp) {
                  if (temp.value) {
                    counter++;
                    filterBy[_.findIndex(filterBy, { FilterName: "MachineIdFilter" })].FilterValues.push(temp.ID || temp.id);
                  }
                });
              }
            }
          }

          if (counter == 1 && $scope.graph.localMachines.length > 1 && $scope.graph.isFiltered) {
            var found = _.find($scope.graph.localMachines, { value: true });
            $scope.displayFilterMachines = `${$filter("translate")("MACHINE")}: ${$scope.localLanguage ? found.MachineLName : found.MachineName}`;
          } else if (counter != 0 && counter !== $scope.graph.localMachines.length && $scope.graph.isFiltered) {
            $scope.displayFilterMachines = $filter("translate")("MACHINES_(MULTIPLE_VALUES)");
          } else if (counter == $scope.graph?.localMachines?.length) {
            //this condition checks if there filtered machines in component
            $scope.displayFilterMachines = false;
          }
          //insights 207/208 can only send 1 machine to get its data, i collect the machines names that the two insights can choose to send.
          var findIndex = _.findIndex(filterBy, {
            FilterName: "MachineIdFilter",
          });

          if (insight.ID.toString() == 207 || insight.ID.toString() == 208) {
            var foundItem;
            if (!$scope.machineListIds || $scope.machineListIds.join("") !== filterBy[findIndex].FilterValues.join("")) {
              $scope.machineList = [];
              $scope.machineListIds = [];

              _.forEach(filterBy[findIndex].FilterValues, (machineId) => {
                foundItem = _.find(machines, { id: machineId });
                $scope.machineList.push(foundItem);
                $scope.machineListIds.push(foundItem.id);
              });
              insight.insightChoosenMachine = $scope.machineList[0];
            }

            filterBy[findIndex].FilterValues = [];
            filterBy[findIndex].FilterValues.push(insight.insightChoosenMachine.id);
          }
          if ($scope.graph) {
            if ($scope.graph?.options?.settings?.insight?.InsightGroupID == 5 || $scope.graph?.options?.settings?.insight?.InsightGroupID == 10) {
              if (
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] &&
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()] &&
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent &&
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data
              ) {
                var eventIds = _.map(
                  _.filter($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event, {
                    value: true,
                  }),
                  "Event"
                );
                counterEvents = eventIds.length;
                if (
                  eventIds &&
                  eventIds.length > 0 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event.length > counterEvents
                ) {
                  filterBy.push({
                    FilterName: "Event",
                    FilterValues: eventIds,
                  });
                }
                try {
                  var eventGroupIds = _.map(
                    _.filter($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup, {
                      value: true,
                    }),
                    "EventGroup"
                  );
                } catch (error) {}

                counterEventsGroup = eventGroupIds.length;

                if (eventGroupIds && eventGroupIds.length > 0 && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup.length > counterEventsGroup) {
                  filterBy.push({
                    FilterName: "EventGroup",
                    FilterValues: eventGroupIds,
                  });
                }
                var eventTypeIds = _.map(
                  _.filter($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventType, {
                    value: true,
                  }),
                  "EventType"
                );
                counterEventsType = eventTypeIds.length;

                if (
                  eventTypeIds &&
                  eventTypeIds.length > 0 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType.length > counterEventsType
                ) {
                  filterBy.push({
                    FilterName: "EventType",
                    FilterValues: eventTypeIds,
                  });
                }
                if (
                  counterEvents == 1 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event.length > 1
                ) {
                  var found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event, {
                    value: true,
                  });
                  $scope.displayFilterEvents = `${$filter("translate")("EVENTS")}: ${found.EventName}`;
                } else if (
                  counterEvents != 0 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event &&
                  counterEvents !== $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.Event.length
                ) {
                  $scope.displayFilterEvents = $filter("translate")("EVENTS_(MULTIPLE_VALUES)");
                } else {
                  $scope.displayFilterEvents = false;
                }

                if (counterEventsGroup == 1 && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup.length > 1) {
                  var found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup, {
                    value: true,
                  });
                  $scope.displayFilterEventsGroup = `${$filter("translate")("EVENTS_GROUP")}: ${found.GroupName}`;
                } else if (counterEventsGroup != 0 && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup && counterEventsGroup !== $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID].filterEvent.data.EventGroup.length) {
                  $scope.displayFilterEventsGroup = $filter("translate")("EVENTS_GROUP_(MULTIPLE_VALUES)");
                } else {
                  $scope.displayFilterEventsGroup = false;
                }
                if (
                  counterEventsType == 1 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType.length > 1
                ) {
                  var found = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType, {
                    value: true,
                  });
                  $scope.displayFilterEventsType = `${$filter("translate")("EVENTS_TYPE")}: ${found.TypeName}`;
                } else if (
                  counterEventsType != 0 &&
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType &&
                  counterEventsType !== $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.options.settings.insight.ID.toString()].filterEvent.data.EventType.length
                ) {
                  $scope.displayFilterEventsType = $filter("translate")("EVENTS_TYPE(MULTIPLE_VALUES)");
                } else {
                  $scope.displayFilterEventsType = false;
                }
              }
            }
            if (!insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters.endLine) {
              if ($scope.graph?.options?.settings?.insight?.endLine) {
                filterBy.push({
                  FilterName: "IsEndOfLineFilter",
                  FilterValues: [1],
                });
              }
            } else {
              $scope.graph.options.settings.insight.endLine = false;
            }
          }
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()]) {
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].insightTopNum) {
              insightsDashboardCtrl.insightTopNum = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].insightTopNum;
            } else {
              insightsDashboardCtrl.insightTopNum = insightsDashboardCtrl.insightTopNum ? insightsDashboardCtrl.insightTopNum : insight.insightTopNum;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].mergePC) {
              insightsDashboardCtrl.mergePC = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].mergePC;
            } else {
              insightsDashboardCtrl.mergePC = insightsDashboardCtrl.mergePC ? insightsDashboardCtrl.mergePC : insight.mergePC;
            }
          } else {
            insightsDashboardCtrl.insightTopNum = insightsDashboardCtrl.insightTopNum ? insightsDashboardCtrl.insightTopNum : insight.insightTopNum;
            insightsDashboardCtrl.mergePC = insightsDashboardCtrl.mergePC ? insightsDashboardCtrl.mergePC : insight.mergePC;
          }
          
          if (
            (typeof $localStorage.insightDate.pickerDate.startDate == "string" && $localStorage.insightDate.pickerDate.startDate.split("T")[0] == $scope.pickerDate.startDate.toISOString().split("T")[0] && $localStorage.insightDate.pickerDate.endDate.split("T")[0] == $scope.pickerDate.endDate.toISOString().split("T")[0]) ||
            (typeof $localStorage.insightDate.pickerDate.startDate == "object" && $localStorage.insightDate.pickerDate.startDate.toISOString().split("T")[0] == $scope.pickerDate.startDate.toISOString().split("T")[0] && $localStorage.insightDate.pickerDate.endDate.toISOString().split("T")[0] == $scope.pickerDate.endDate.toISOString().split("T")[0])
          ) {
            $scope.localDate = false;
          } else {
            $scope.localDate = true;
          }
          if (insightsDashboardCtrl.insightsInteractiveFilter.indexOf(insight.ID.toString()) > -1) {
            insightsDashboardCtrl.interactiveFilterBoolean = true;
          }
          
          if ($scope.pickerDate?.startDate && $scope.pickerDate?.endDate) {
            $scope.dateLabelValue = $scope.pickerDate?.startDate.format("DD/MM/YY") + "-" + $scope.pickerDate.endDate.format("DD/MM/YY");
          }
        }


        $scope.checkSameDateRanger();
        if (insight.selectedArg2 || insight.selectedArg3) {
          var reqBody = {
            day: day,
            referenceDate: referenceDate,
            insightArg: insight.selectedArg ? parseInt(insight.selectedArg.key) : 0,
            additionalArgs: additionalArgs,
            top: parseInt(insightsDashboardCtrl.insightTopNum) || 5,
            filterBy: filterBy || [],
            mergePC: insightsDashboardCtrl.mergePC,
          };
        } else {
          var reqBody = {
            day: day,
            referenceDate: referenceDate,
            insightArg: insight.selectedArg ? parseInt(insight.selectedArg.key) : 0,
            top: parseInt(insightsDashboardCtrl.insightTopNum) || 5,
            filterBy: filterBy || [],
            mergePC: insightsDashboardCtrl.mergePC,
          };
        }

        $scope.dateRequestDataSent = {
          day: day,
          referenceDate: referenceDate,
        }
        if ($scope.insightRequestTimeout) {
          $timeout.cancel($scope.insightRequestTimeout);
        }
        $scope.insightRequestTimeout = $timeout(function () {
          console.log(Date.now());
          LeaderMESservice.customAPI(insight.Name, reqBody).then(function (res) {
            if (!_.has(res.ResponseDictionary, "Body")) {
              res.ResponseDictionary = {
                Body: [],
              };
            }
            insightsDashboardCtrl.showGridTableGraph = false;
            insightsDashboardCtrl.showTableGraph = false;
            if ($scope.graph?.graphTypeID == 0) {
              $scope.insightHeight = "390px";
              buildStackedColumnGraphData(insight, res, machines, depNames, insight.selectedArg);
            } else if ($scope.graph?.graphTypeID == 1) {
              $scope.insightHeight = "390px";
              buildStackedAreaData(insight, res);
            } else if ($scope.graph?.graphTypeID == 2) {
              buildTableData(insight.Name, res, insight.selectedArg);
            } else if (insight.displayTypeID == 2) {
              buildHistogramData(insight, res, machines, insight.selectedArg, depNames);
            } else if (insight.displayTypeID == 7) {
              buildStackedAreaData(insight, res);
            } else if (insight.displayTypeID == 5) {
              buildPieData(insight, insight.Name, res, insight.selectedArg);
            } else if (insight.displayTypeID == 6) {
              buildTableData(insight.Name, res, insight.selectedArg);
            } else if (insight.displayTypeID == 3) {
              buildSeriesHistogramData(insight, res, machines, depNames, insight.selectedArg);
            } else if (insight.displayTypeID == 1) {
              buildSeriesLineGraphData(insight, res, insight.selectedArg, depNames);
            } else if (insight.displayTypeID == 8) {
              buildBasicBarGraphData(insight, res, machines, insight.selectedArg);
            }  else if (insight.displayTypeID == 10) {
              buildWaterFallData(insight, res, machines, insight.selectedArg);
            } else if (insight.displayTypeID == 4) {
              buildStackedColumnGraphData(insight, res, machines, depNames, insight.selectedArg);
            } else if (insight.displayTypeID == 11) {
              buildHeatMapGraphData(insight, res);
            } else {
              angular.forEach(res.MachineAvailabilityShift, function (i) {
                // find and replace ShiftId and DownTimeEfficiency with their values
                $scope.dataLoading = false;

                $scope.insightAnswer.AnswerEName = $scope.insightAnswer.AnswerEName.replace("[" + i.Key + "]", i.Value);
                $scope.insightAnswer.AnswerLName = $scope.insightAnswer.AnswerLName.replace("[" + i.Key + "]", i.Value);

                // assign start and end time to insight answer
                if (i.Key == "StartTime") {
                  $scope.insightAnswer.startTime = i.Value;
                }

                if (i.Key == "EndTime") {
                  $scope.insightAnswer.endTime = i.Value;
                }
              });
            }
            $timeout(function () {
              $scope.insightDataLoading = false;
              $scope.$emit("insightLoading", false);
              $scope.dataLoading = false;
            });
          });
        }, 500);
      }
    };

    $scope.checkSameDateRanger = function () {
      $timeout(function () {
        var element = $(`.singleDateSelector${$scope.graph?.ID}>input`);
        if (element) {
          if ($scope.insightSelectedInterval.id == "YESTERDAY") {
            element.val(`${$scope.pickerDate?.startDate.format($scope.userDateFormat.split(" ")[0])}`);
          } else if ($scope.pickerDate.endDate.isSame($scope.pickerDate.startDate)) {
            element.val(`${$scope.pickerDate?.endDate.format($scope.userDateFormat.split(" ")[0])}`);
          }
        }
      }, 0);
    };

    const convertHexToRGBA = (hexCode, opacity) => {
      let hex = hexCode.replace("#", "");

      if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      return `rgba(${r},${g},${b},${opacity > 1.2 ? 1.2 : opacity < 0.2 ? 0.2 : opacity})`;
    };
    const changeOpacityRGBA = (oldColor, opacity) => {
      return oldColor.replace(/[^,]+(?=\))/, opacity);
    };

    $scope.resetEndLine = function () {
      $scope.displayFilterMachines = false;
      $scope.graph.options.settings.insight.endLine = !$scope.graph.options.settings.insight.endLine;
      $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.graph?.ID.toString()].endLine = $scope.graph?.options.settings.insight.endLine;
      if ($scope.graph?.options.settings.insight.endLine || !_.isEmpty($scope.displayFilterMachines) || !_.isEmpty($scope.displayFilterEvents) || !_.isEmpty($scope.displayFilterEventsGroup)) {
        $scope.graph.isFiltered = true;
      } else {
        $scope.graph.isFiltered = false;
      }
    };

    $scope.resetMachines = function () {
      $scope.displayFilterMachines = false;
      if ($scope.graph?.options.settings.insight.endLine || !_.isEmpty($scope.displayFilterMachines) || !_.isEmpty($scope.displayFilterEvents) || !_.isEmpty($scope.displayFilterEventsGroup)) {
        $scope.graph.isFiltered = true;
      } else {
        $scope.graph.isFiltered = false;
      }
      $scope.graph.localMachinesChange = $scope.graph.localMachinesChange ? $scope.graph.localMachinesChange + 1 : 1;
    };
    $scope.resetEvent = function () {
      $scope.displayFilterEvents = false;
      if ($scope.graph?.options.settings.insight.endLine || !_.isEmpty($scope.displayFilterMachines) || !_.isEmpty($scope.displayFilterEvents) || !_.isEmpty($scope.displayFilterEventsGroup) || !_.isEmpty($scope.displayFilterEventsType)) {
        $scope.graph.isFiltered = true;
      } else {
        $scope.graph.isFiltered = false;
      }
      $scope.graph.eventsChange = $scope.graph.eventsChange ? $scope.graph.eventsChange + 1 : 1;
    };

    $scope.resetGroupEvent = function () {
      $scope.displayFilterEventsGroup = false;
      if ($scope.graph?.options.settings.insight.endLine || !_.isEmpty($scope.displayFilterMachines) || !_.isEmpty($scope.displayFilterEvents) || !_.isEmpty($scope.displayFilterEventsGroup) || !_.isEmpty($scope.displayFilterEventsType)) {
        $scope.graph.isFiltered = true;
      } else {
        $scope.graph.isFiltered = false;
      }
      $scope.graph.eventGroupChange = $scope.graph.eventGroupChange ? $scope.graph.eventGroupChange + 1 : 1;
    };

    $scope.resetTypeEvent = function () {
      $scope.displayFilterEventsType = false;
      if ($scope.graph?.options.settings.insight.endLine || !_.isEmpty($scope.displayFilterMachines) || !_.isEmpty($scope.displayFilterEvents) || !_.isEmpty($scope.displayFilterEventsGroup) || !_.isEmpty($scope.displayFilterEventsType)) {
        $scope.graph.isFiltered = true;
      } else {
        $scope.graph.isFiltered = false;
      }
      $scope.graph.eventTypeChange = $scope.graph.eventTypeChange ? $scope.graph.eventTypeChange + 1 : 1;
    };

    $scope.openWide = function(id)
    {
      const openWideInsights = ['195' , '225' , '226' , '227' , '239' , '237' , '247'];
      if(openWideInsights.indexOf(id) >= 0) return true;
      return false
    }

    $scope.targetMode = function(id)
    {
      if(id == '225' || id == '226' || id == '227' || id == '239' || id == '237') return false;
      return true
    }
    $scope.height = window.innerHeight - 230;
    $scope.addGraph = function (event, insight) {
      event.stopPropagation();
      var index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].eventsFilter, {
        ID: insight.ID.toString(),
      });
      if (index > -1) {
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].eventsFilter.splice(index, 1);
      }

      if ($scope.isFactory) {
        insightsNamePage = "dataInsightsFactoryPage";
      } else {
        insightsNamePage = "dataInsightsPage";
      }
      // because if we kept the saved template and load it again the extra insights that we add will get removed
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};

      insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.push({
        template: "insightGraph",
        name: "insightName",
        nameID: $filter("translate")($scope.insight.groupNameE) + " " + $scope.insight.ID.toString(),
        clone: true,
        order: 10,
        InsightGroupID: insight.InsightGroupID,
        ID: $scope.insight.ID.toString(),
        groupNameE: $scope.insight.groupNameE,
        groupNameL: $scope.insight.groupNameL,
        insightArg: insightsDashboardCtrl.insight.selectedArg,
        insightArg2: insightsDashboardCtrl.insight.selectedArg2,
        insightArg3: insightsDashboardCtrl.insight.selectedArg3,
        additionalArgs: insight.AdditionalArgs,
        selectedInterval: $scope.insight.selectedInterval,
        options: {
          display: true,
          duplicate: true,
          disableExport: true,
          width: $scope.openWide(insight.ID.toString()) ? 12 : 6,
          disablePie: true,
          selectedGraph: "bar",
          disableTable: true,
          disableClose: false,
          rotateBar: false,
          header: "Machines Load",
          disableBar: true,
          settings: {
            insight: $scope.insight,
          },
          applyAll: true,
        },
      });
      $scope.addedToDash.push($scope.insight.ID.toString());
    };
    insightsDashboardCtrl.interactiveFilter = function () {
      if (insightsDashboardCtrl.insightChart.series && insightsDashboardCtrl.insightChart.series[0]) {
        _.forEach(insightsDashboardCtrl.insightChart.series[0].data, function (item, index) {
          series = item.series.chart.series;
          var len = series.length;
          for (i = 0; i < len; i++) {
            series[i].data[index].update({ color: changeOpacityRGBA(series[i].data[index].color, insightsDashboardCtrl.interactiveFilterVar ? 0.5 : 1) });
          }
        });
      }
    };
    $scope.getTblStyle = function (header) {
      if (header.fieldname == "displayname" || header.fieldname == "localid") {
        return { width: "200px" };
      }
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph?.ID);
      
      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }

      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    if ($scope.graph && $scope.graph.localMachines){
      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    }

    $scope.headerChangedFunc = function(api){
      insightsDashboardCtrl.headerChanged = true;
      if(insightsDashboardCtrl.insight.ID == 33 || api){
        insightsDashboardCtrl.updateDate(api);
        $scope.saveInsightSelectOptions(false)
      }
    }

    $scope.$watchGroup(
      [
        "insightsPageData.dataLabelEnable",
        "insightData.filters",
        "shiftData.machinesDisplay",
        "graph.localMachines",
        "parameterObj",
        "insightsColorShades.newColor",
        "insightsColorShades.currentChoice",
        "insightsColorText.backgroundColor",
        "insightsColorText.currentChoice",
        "insightsColorText.fontColor",
        "insightsColorText.fontSize",
        "heatMapColors.colorMode",
        "heatMapColors.percentageChoice",
      ],
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          $scope.localTime = true;
          $scope.initWrapper();
        }
      },
      true
    );
    $scope.$watch(
      "insightSelectedIntervalTemp.pickerDate",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          $scope.localTime = false;
          $scope.insightSelectedInterval = angular.copy($scope.insightSelectedIntervalTemp);
          $scope.initWrapper();
        }
      },
      true
    );
    $scope.$watch(
      "graph",
      function (newValue, oldValue) {
        $timeout(function () {
          if (!oldValue || !newValue) {
            return;
          }
          if(newValue.options.settings.insight)
          {
            if(JSON.stringify(newValue.options.settings.insight.selectedArg) !== JSON.stringify(oldValue.options.settings.insight.selectedArg) 
            || JSON.stringify(newValue.options.settings.insight.selectedArg2) !== JSON.stringify(oldValue.options.settings.insight.selectedArg2) 
            || JSON.stringify(newValue.options.settings.insight.selectedArg3) !== JSON.stringify(oldValue.options.settings.insight.selectedArg3)
            || JSON.stringify(newValue.options.settings.insight.selectKpi) !== JSON.stringify(oldValue.options.settings.insight.selectKpi)
            || JSON.stringify(newValue.options.settings.insight.selectXAxis) !== JSON.stringify(oldValue.options.settings.insight.selectXAxis)
            ){
              return
            }
          }

          if (newValue.fullScreen != oldValue.fullScreen) {
            if (newValue.fullScreen) {
              $(`.insight-id${$scope.graph?.ID}`).css("height", $(`.print${$scope.graph?.ID}`).height() - 300);
              $(`.shiftContainerGraph${$scope.graph?.ID}`).css("height", $(`.print${$scope.graph?.ID}`).height() - 100);
            } else {
              $(`.insight-id${$scope.graph?.ID}`).css("height", $scope.insightHeightTemp);
              $(`.shiftContainerGraph${$scope.graph?.ID}`).css("height", $scope.shiftContainerHeightTemp);
            }
            $scope.initWrapper();
            return;
          }

          if (newValue.options.width !== oldValue.options.width) {
            // grid-ui table does not use insightsDashboardCtrl.insightChart
            if (insightsDashboardCtrl.insightChart || $scope.sampleGridOptions) {
              $scope.localTime = true;
              $scope.initWrapper();
              return;
            }
          }
          const newValueTemp = angular.copy(newValue);
          const oldValueTemp = angular.copy(oldValue);
          if (newValueTemp && newValueTemp.options && newValueTemp.options.settings) {
            newValueTemp.options.settings.insight = undefined;
            newValueTemp.localMachineFirstTime = undefined;
          }
          if (oldValueTemp && oldValueTemp.options && oldValueTemp.options.settings) {
            oldValueTemp.options.settings.insight = undefined;
            oldValueTemp.localMachineFirstTime = undefined;
          }
          if (angular.toJson(newValueTemp) !== angular.toJson(oldValueTemp) && newValue.options.width == oldValue.options.width) {
            $scope.localTime = true;
            $scope.initWrapper();
            return;
          }
        });
      },
      true
    );
    $scope.$watch(
      "showFilterInsightVar.value",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          insightsDashboardCtrl.insightChart ? insightsDashboardCtrl.insightChart.reflow() : "";
        }
      },
      true
    );

    $(window).resize(function () {
      insightsDashboardCtrl.insightChart ? insightsDashboardCtrl.insightChart.reflow() : "";
    });
    
    //we always need to send the last 24h of that day in "Kpis by shifts" component in shifts
    //so i use shiftData.shiftLast7Dys to get these shifts and to know the startDate and EndDate
    $scope.$watch(
      "shiftData.ShiftsLast7Days",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue) && newValue != undefined) {
          $scope.initWrapper();
        }
      },
      true
    );

    $scope.initWrapper = function (time) {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        $scope.timePeriod = 450;
        init($scope.localTime);
      }, $scope.timePeriod);
    };

    $scope.saveInsightSelectOptions = function (timePeriodBoolean) {
      if(!insightsDashboardCtrl.headerChanged)
      {
        return;
      }
      if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()]) {
        $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()] = {};
      }
      if ($sessionStorage.insightData && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container) {
        var findIndex = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, { ID: $scope.insight.ID.toString() });
      }

      _.forEach($scope.insight.insightParameters, function (sentence) {
        if (sentence.dropBox == "[insightArg]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg = insightsDashboardCtrl.insight.selectedArg;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.selectedArg = insightsDashboardCtrl.insight.selectedArg;
        }
        if (sentence.dropBox == "[InsightArgs2]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg2 = insightsDashboardCtrl.insight.selectedArg2;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.selectedArg2 = insightsDashboardCtrl.insight.selectedArg2;
        }
        if (sentence.dropBox == "[InsightArgs3]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectedArg3 = insightsDashboardCtrl.insight.selectedArg3;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.selectedArg3 = insightsDashboardCtrl.insight.selectedArg3;
        }

        if (sentence.dropBox == "[XAxis]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectXAxis = insightsDashboardCtrl.insight.selectXAxis;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.selectXAxis = insightsDashboardCtrl.insight.selectXAxis;
        }
        if (sentence.dropBox == "[insightKPIs]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].selectKpi = insightsDashboardCtrl.insight.selectKpi;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.selectKpi = insightsDashboardCtrl.insight.selectKpi;
        }
        if (sentence.dropBox == "[num]" && sentence.type !== "MergePC") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].insightTopNum = insightsDashboardCtrl.insightTopNum;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.insightTopNum = insightsDashboardCtrl.insightTopNum;
          _.forEach($localStorage.insightStates, function (insightData) {
            if (!insightData[$scope.insight.ID.toString()]) {
              insightData[$scope.insight.ID.toString()] = {};
            }
            insightData[$scope.insight.ID.toString()].insightTopNum = insightsDashboardCtrl.insightTopNum;
          });
        }
        if (sentence.dropBox == "[num]" && sentence.type == "MergePC") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].mergePC = insightsDashboardCtrl.mergePC;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.mergePC = insightsDashboardCtrl.mergePC;
          _.forEach($localStorage.insightStates, function (insightData) {
            if (!insightData[$scope.insight.ID.toString()]) {
              insightData[$scope.insight.ID.toString()] = {};
            }
            insightData[$scope.insight.ID.toString()].mergePC = insightsDashboardCtrl.mergePC;
          });
        }
        if (sentence.dropBox == "[XAxisChange]") {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].xAxisSelectedObject = insightsDashboardCtrl.xAxisSelectedObject;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.xAxisSelectedObject = insightsDashboardCtrl.xAxisSelectedObject;
        }
        if ($scope.insight.ID.toString() == 207 || $scope.insight.ID.toString() == 208) {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][$scope.insight.ID.toString()].insightChoosenMachine = $scope.insight.insightChoosenMachine;
          $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container[findIndex].options.settings.insight.insightChoosenMachine = insightsDashboardCtrl.insightChoosenMachine;
        }
      });
      $scope.localTime = true;
      $scope.timePeriod = timePeriodBoolean ? 1000 : 450;
      $scope.initWrapper();
    };

    var getTimeDates = function () {
      timeString.forEach(function (temp, index) {
        if (temp == "YESTERDAY") {
          ranges[$filter("translate")(temp)] = [moment().subtract(1, "days").startOf("day"), moment()];
        } else if (temp == "LAST_WEEK_SUNDAY_TO_SATURDAY") {
          if ($scope.localLanguage) {
            ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").weekday(0).startOf("day"), moment().subtract(1, "weeks").endOf("week").weekday(6).startOf("day")];
          } else {
            if(moment().weekday() == 6 || moment().weekday() == 5){
              ranges[$filter("translate")(temp)] = [moment().isoWeekday(0).startOf("day"), moment().isoWeekday(6).startOf("day")];
            }
            else{
              ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").isoWeekday(0).startOf("day"), moment().subtract(1, "weeks").endOf("week").isoWeekday(6).startOf("day")];
            }
          }
        } else if (temp == "LAST_WEEK_MONDAY_TO_SUNDAY") {
          if ($scope.localLanguage) {
            ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("week").weekday(1).startOf("day"), moment().subtract(1, "weeks").endOf("week").weekday(7).startOf("day")];
          } else {
            if(moment().weekday() == 6){
              ranges[$filter("translate")(temp)] = [moment().isoWeekday(1).startOf("day"), moment().isoWeekday(7).startOf("day")];
            }
            else
            {
              ranges[$filter("translate")(temp)] = [moment().subtract(1, "weeks").startOf("isoWeek").isoWeekday(1).startOf("day"), moment().subtract(1, "weeks").endOf("isoWeek").isoWeekday(7).startOf("day")];
            }
          }
        } else {
          ranges[$filter("translate")(temp)] = [moment().subtract(timeValue[index], "days").startOf("day"), moment().subtract(1, "d").startOf("day")];
        }
      });
      return ranges;
    };


    $scope.applyInteractiveFilter = function () {
      insightService.copyInteractiveFilter();
      insightsDashboardCtrl.interactiveFilterVar = false;
      insightsDashboardCtrl.interactiveFilter();
    };

    $scope.rangeOptions = {
      timePicker: true,
      ranges: getTimeDates(),
      locale: {
        format: $scope.userDateFormat.split(" ")[0],
        separator: " - ",
        applyLabel: $filter("translate")("APPLY"),
        cancelLabel: $filter("translate")("CANCEL"),
        fromLabel: $filter("translate")("FROM"),
        toLabel: $filter("translate")("TO"),
        customRangeLabel: $filter("translate")("CUSTOM"),
        translateYesterday: $filter("translate")("YESTERDAY"),
        daysOfWeek: [$filter("translate")("SUNDAY_SHORT"), $filter("translate")("MONDAY_SHORT"), $filter("translate")("TUESDAY_SHORT"), $filter("translate")("WEDNESDAY_SHORT"), $filter("translate")("THURSDAY_SHORT"), $filter("translate")("FRIDAY_SHORT"), $filter("translate")("SATURDAY_SHORT")],
        monthNames: [
          $filter("translate")("January"),
          $filter("translate")("February"),
          $filter("translate")("March"),
          $filter("translate")("April"),
          $filter("translate")("May"),
          $filter("translate")("June"),
          $filter("translate")("July"),
          $filter("translate")("August"),
          $filter("translate")("September"),
          $filter("translate")("October"),
          $filter("translate")("November"),
          $filter("translate")("December"),
        ],
        firstDay: 0,
      }
    };


    insightsDashboardCtrl.updateDate = function (api) {
    if(!insightsDashboardCtrl.headerChanged)
      {
        return;
      }
      if (api) {
        _.forEach(timeString, function (timeName, index) {
          if ($filter("translate")(timeName) == api.chosenLabel) {
            $scope.insightSelectedInterval.id = timeName;
          } else if (api.chosenLabel == $filter("translate")("CUSTOM") && index == timeString.length - 1) {
            $scope.insightSelectedInterval.id = "CUSTOM";
          }
        });
        $scope.pickerDate.endDate._d.setHours(0);
        $scope.pickerDate.endDate._d.setMinutes(0);
        $scope.pickerDate.endDate._d.setSeconds(0);
        $scope.pickerDate.endDate._d.setMilliseconds(0);
      }
      
      $scope.insightSelectedInterval.selectedInterval = $scope.pickerDate.endDate.diff($scope.pickerDate.startDate, "days");
      $scope.localTime = true;
      $scope.initWrapper();
    };

    insightsDashboardCtrl.applyInteractiveFilter;

    $scope.initWrapper();

    //try to fix tooltip bug
    $timeout(function(){
      $(`.print${$scope.graph?.ID}`)?.mouseleave(function(){
        insightsDashboardCtrl.insightChart?.tooltip?.chart?.tooltip?.hide()
      })
    },600);
    if($scope.graph && $scope.graph.options && $scope.graph.options.settings && $scope.graph.options.settings.insight && $scope.graph.options.settings.insight.ID){
      googleAnalyticsService.gaEvent("Department_Insights",`insight_${$scope.graph.options.settings.insight.ID}`);
    }
  }

  return {
    restrict: "E",
    templateUrl: Template,
    controller: controller,
    controllerAs: "insightsDashboardCtrl",
    link: function (scope) {
      scope.$on("$destroy", function () {
        if (scope.initTimeout) {
          $timeout.cancel(scope.initTimeout);
        }
        if (scope.insightRequestTimeout){
          $timeout.cancel(scope.insightRequestTimeout)
        }
        if (scope.insightChart && scope.insightChart.destroy) {
          scope.insightChart.destroy();
        }
      });
    },
    scope: {
      insight: "=",
      forGraph: "=",
      addedToDash: "=",
      isFactory: "=",
      isShift: "=",
      parameterObj: "=",
      page: "=",
      graph: "=",
      heatMapColors: "=",
      kpisHeatmapShift: "=",
    },
  };
};

angular.module("LeaderMESfe").directive("insightsDashboardDirective", insightsDashboardDirective);
