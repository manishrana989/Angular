function insightsAbsoluteDirective($filter, LeaderMESservice, googleAnalyticsService, $modal) {
  var template = "views/common/insightsAbsoluteWindow.html";

  var controller = function($scope, shiftService,insightService, $localStorage, $sce, $sessionStorage,getInsightTitleParameters) {
    var insightsAbsoluteCtrl = this;
    insightsAbsoluteCtrl.searchText = "";
    $scope.shiftData = shiftService.shiftData;
    insightsAbsoluteCtrl.insightDate = insightService.insightSelectedInterval;
    insightsAbsoluteCtrl.local = {
      insightTopNum : $localStorage.insightTopNum,
      mergePC : $localStorage.mergePC,
    }
    insightsAbsoluteCtrl.insightTopNum = 5;
    insightsAbsoluteCtrl.mergePC = 80;
    insightsAbsoluteCtrl.selectKpi;
    insightsAbsoluteCtrl.selectedArg;
    insightsAbsoluteCtrl.selectedArg2;
    insightsAbsoluteCtrl.selectedArg3;
    insightsAbsoluteCtrl.insightCurrentTitle = "";

    var selectedArgArrayTemp = [];    
    insightsAbsoluteCtrl.updateAddedToDashInsightsPage = function() {
      if ($scope.isFactory) {
        insightsNamePage = "dataInsightsFactoryPage";
      } else {
        insightsNamePage = "dataInsightsPage";
      }

      $scope.addedToDashInsightsPage = _.map(insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, function(dashTemplate) {
        if (dashTemplate.template == "insightGraph") {
          return dashTemplate.options.settings.insight.ID.toString();
        } else {
          return false;
        }
      }).filter(Boolean);
    };

    insightsAbsoluteCtrl.updateAddedToDashInsightsPage();

    $scope.topicClicked = function(topic) {
      if (!topic.view) {
        // user is trying to open
        angular.forEach(insightsAbsoluteCtrl.topics, function(t) {
          if (t.view) {
            t.view = false;
          }
        });
        topic.view = true;
      } else {
        // user is trying to close
        topic.view = false;
      }
    };

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    insightsAbsoluteCtrl.rtl = LeaderMESservice.isLanguageRTL();

    googleAnalyticsService.gaEvent("Department_Shift", "Insights_open");
    $scope.gaE = function(page, event) {
      googleAnalyticsService.gaEvent(page, event);
      return true;
    };

    $scope.showQuestions = function(insight) {
      $scope.showInsights = false;
    };

    insightsAbsoluteCtrl.matchingInsights = [];

    $scope.search = function() {
      insightsAbsoluteCtrl.matchingInsights = [];
      const searchWords = insightsAbsoluteCtrl.searchText.split(" ");

      angular.forEach(insightsAbsoluteCtrl.topics, function(topic) {
        angular.forEach(topic.insights, function(insight) {
          let matched = 0;

          for (let j = 0; j < searchWords.length; j++) {
            if (insightsAbsoluteCtrl.rtl) {
              if (insight.TitleAndID.toLowerCase().indexOf(searchWords[j].toLowerCase()) > -1) {
                matched++;
              }
            } else {
              if (insight.TitleAndID.toLowerCase().indexOf(searchWords[j].toLowerCase()) > -1) {
                matched++;
              }
            }
          }

          if (matched >= searchWords.length) {
            if (!_.find(insightsAbsoluteCtrl.matchingInsights, { ID: insight.ID.toString() })) insightsAbsoluteCtrl.matchingInsights.push(insight);
          }
        });
      });
    };

    $scope.highlight = function(text, search) {
      if (!search) {
        return $sce.trustAsHtml(text);
      }
      search = search.replace(/[!@#$%^&*()+=\-[\]\\';,./{}|":<>?~_]/g, "\\$&");
      return $sce.trustAsHtml(text.replace(new RegExp(search.split(" ").join("|"), "gi"), '<span class="highlightText">$&</span>'));
    };

    $scope.showAnswers = function(insight) {
      $scope.graph = {
        template: "insightGraph",
        name: "insightName",
        nameID: $filter("translate")(insight.Title) + " " + insight.ID.toString(),
        clone: true,
        order: 10,
        InsightGroupID: insight.InsightGroupID,
        ID: insight.ID.toString(),
        groupNameE: insight.groupNameE,
        groupNameL: insight.groupNameL,
        selectedInterval: insightsAbsoluteCtrl.topics.selectedInterval,
        insightArg: null,
        insightArg2: null,
        insightArg3: null,
        AdditionalArgs:insight.AdditionalArgs,
        top: insightsAbsoluteCtrl.defaultNum,
        KPIsForHeatmap : {
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
        },
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
            insight: angular.copy(insight),
            heatMapColors: [
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
            ]
          },
          applyAll: true
        }
      }
      if (angular.isDefined(insightsAbsoluteCtrl.topics.selectedInterval)) {
        $scope.insight = insight;
        $scope.insight.selectedInterval = insightsAbsoluteCtrl.topics.selectedInterval;
        $scope.showInsights = true;
        insightsAbsoluteCtrl.insightCurrentTitle = insight.Title + " - " + insight.ID.toString();
      }
    };
    $scope.openWide = function(id)
    {
      if(id == '195' || id == '225' || id == '226' || id == '227' || id == '239' || id == '237') return true;
      return false
    }
    $scope.targetMode = function(id)
    {
      if(id == '225' || id == '226' || id == '227' || id == '239' || id == '237') return false;
      return true
    }
    $scope.addGraph = function(event,insight) {
      event.stopPropagation();
      var index = _.findIndex($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].eventsFilter, { ID: insight.ID.toString() });
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
        nameID: $filter("translate")(insight.Title) + " " + insight.ID.toString(),
        clone: true,
        order: 10,
        InsightGroupID: insight.InsightGroupID,
        ID: insight.ID.toString(),
        groupNameE: insight.groupNameE,
        groupNameL: insight.groupNameL,
        selectedInterval: insightsAbsoluteCtrl.topics.selectedInterval,
        insightArg: insightsAbsoluteCtrl.selectedArg,
        insightArg2: insightsAbsoluteCtrl.selectedArg2,
        insightArg3: insightsAbsoluteCtrl.selectedArg3,
        AdditionalArgs:insight.AdditionalArgs,
        top: insightsAbsoluteCtrl.defaultNum,
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
            insight: angular.copy(insight),
          },
          applyAll: true
        }
      });
      if (angular.isDefined(insightsAbsoluteCtrl.topics.selectedInterval)) {
        $scope.insight = insight;
        $scope.insight.selectedInterval = insightsAbsoluteCtrl.topics.selectedInterval;
        $scope.insight.insightTopNum = insightsAbsoluteCtrl.insightTopNum;
        $scope.insight.mergePC = insightsAbsoluteCtrl.mergePC;
      }
      insightsAbsoluteCtrl.updateAddedToDashInsightsPage();
    };
    $scope.change = function(x) {
      if (isNaN(x)) {
        $localStorage.insightDate.selectedInterval = x;
      } else {
        $localStorage.insightDate.selectedInterval = parseInt(x);
      }
    };

    $scope.changeInsightTopNum = function(insight) {
      insight.insightTopNum = insightsAbsoluteCtrl.insightTopNum;
    };

    $scope.changeInsightMergePC = function(insight) {
      insight.mergePC = insightsAbsoluteCtrl.mergePC;
    };

    $scope.openDatePicker = function() {
      var modelScope = $scope;

      $modal
        .open({
          windowClass: "dashboard-period-dropdown",
          scope: modelScope,
          templateUrl: "views/common/datepickerRange.html",
          backdrop: "static",

          controller: function($scope, $modalInstance) {
            $scope.today = new Date();
            $scope.yesterday = new Date();
            $scope.yesterday.setDate($scope.yesterday.getDate() - 1);
            $scope.dtStart = $scope.yesterday;
            $scope.dtEnd = $scope.today;

            var d = new Date();
            $scope.minDate = d.setMonth(d.getMonth() - 2);
            $scope.errorCompare = false;

            $scope.checkErrors = function() {
              $scope.errorCompare = false;
              if (Date.parse($scope.dtStart) > Date.parse($scope.dtEnd)) {
                //end is less than start
                $scope.errorCompare = true;
              }
            };

            $scope.updateValue = function(selectedDate, isStart) {
              if (typeof selectedDate === "string" && selectedDate != "" && selectedDate != null) {
                selectedDate = moment(selectedDate, "DD/MM/YYYY HH:mm:ss");
              }
              if (!selectedDate) return;
              if (selectedDate.toDate){
                  if (isStart) {
                      $scope.dtStart = selectedDate.toDate();
                  } else {
                      $scope.dtEnd = selectedDate.toDate();
                  }
              }
              $scope.checkErrors();
            };
            $scope.updateDate = function() {
              $scope.errorCompare = false;
              if (Date.parse($scope.dtStart) <= Date.parse($scope.dtEnd)) {
                // user has chosen range date and clicked on Get Data
                $scope.updateData(2, $scope.dtStart, $scope.dtEnd);
                $scope.closeModal();
              } else {
                //end is less than start
                $scope.errorCompare = true;
              }
            };
            $scope.closeModal = function() {
              $modalInstance.close();
            };
          },
          controllerAs: "datepickerCtrl"
        })
        .result.then(function() {});
    };

    $scope.updateDuration = function(startDate, endDate) {
      var timeFormat = d3.time.format("%d/%m/%Y %H:%M:%S");
      showInsights = false;
      shiftService.shiftData.selectedTab = 1;
      for (var key in shiftService.shiftData.machinesDisplay) {
        shiftService.shiftData.machinesDisplay[key] = true;
      }
      var durationObj = shiftService.durationParams(1, timeFormat.parse(startDate), timeFormat.parse(endDate));
      shiftService.updateData(shiftService.shiftData.DepartmentID, durationObj, false);
    };

    $scope.closeAbsoluteWindow = function() {
      $scope.$emit("closeAboslute", true);
    };

    LeaderMESservice.customGetAPI("GetResultInsights").then(function(res) {
      insightsAbsoluteCtrl.insightDate.selectedInterval =_.isNumber(insightsAbsoluteCtrl.insightDate.selectedInterval)
        ? insightsAbsoluteCtrl.insightDate.selectedInterval
        : '27';
      var theSelectedInterval =
        _.isNumber(insightsAbsoluteCtrl.insightDate.selectedInterval) && insightsAbsoluteCtrl.insightDate.selectedInterval.toString();

      var insightTopNum = insightsAbsoluteCtrl.local.insightTopNum && insightsAbsoluteCtrl.local.insightTopNum.toString();
      var mergePC = insightsAbsoluteCtrl.local.mergePC && insightsAbsoluteCtrl.local.mergePC.toString();
      insightsAbsoluteCtrl.topics = _.map(res.insights, function(topic) {
        topic.insights = _.filter(topic.insights, function(insight) {
          if (!$scope.isFactory && !insight.IsInFactoryLevel ){
            return true;
          }
          if ($scope.isFactory && !insight.IsInFactoryLevel){
            return true;
          }
          return false;
        });
        return {
          Name: topic.Name,
          EName: topic.EName,
          LName: topic.LName,
          ID: topic.ID,
          insights: _.map(topic.insights, function(insight) {
            selectedArgArrayTemp.push(insight.InsightArgs);
            insight.EName = insight.EName ? insight.EName : null;
            insight.LName = insight.LName ? insight.LName : null;
            if (insight.Title) {
              if (insight.Title.indexOf("{") !== -1 && insight.Title.indexOf("}") !== -1) {
                varsearchKpi = insight.Title.substring(insight.Title.indexOf("{") + 1, insight.Title.indexOf("}"));

                $sessionStorage.kpiTranslations.forEach(function(kpi) {
                  if (kpi.name == varsearchKpi) {
                    insight.Title = insight.Title.replace(
                      insight.Title.substring(insight.Title.indexOf("{"), insight.Title.indexOf("}") + 1),
                      kpi[$sessionStorage.language]
                    );
                  }
                });
              }
            }
            return {
              Name: insight.Name,
              EName: insight.EName,
              LName: insight.LName,
              InsightGroupID: topic.ID,
              AnswerEName: insight.AnswerEName,
              groupNameL: topic.LName,
              groupNameE: topic.EName,
              AnswerLName: insight.AnswerLName,
              TimeInterval: insight.TimeInterval ? insight.TimeInterval.split(",") : insight.TimeInterval,
              TimeUnit: insight.TimeUnit,
              ID: insight.ID.toString(),
              insightParameters: getInsightTitleParameters($scope.localLanguage ? insight.LName : insight.EName, insight),
              displayTypeID: insight.DisplayTypeID,
              compare: insight.IsCompare,
              InsightArgs: insight.InsightArgs,
              AdditionalArgs:insight.AdditionalArgs,
              xAxis: insight.XAxisName,
              yAxis: insight.YAxisName,
              selectedInterval: theSelectedInterval,
              IsInFactoryLevel: $scope.isFactory ? true : insight.IsInFactoryLevel,
              insightTopNum: insightsAbsoluteCtrl.insightTopNum,
              selectedArg: "",
              selectedArg2: "",     
              selectedArg3: "",         
              MergePC: insight.MergePC,
              mergePC: insightsAbsoluteCtrl.mergePC,
              TitleDictionaryID: insight.TitleDictionaryID,
              Title: insight.Title,
              TitleAndID: insight.Title + " - " + insight.ID.toString(),
              HValue: insight.HValue,
              LValue: insight.LValue
            };
          })
        };
      });      

      var selectedArgNames = [];
      
      selectedArgArrayTemp = _.filter(selectedArgArrayTemp, function(temp) {
        if (temp.length) return temp;
      });
      selectedArgArrayTemp.forEach(function(temp) {
        selectedArgNames.push(temp[0].value);
      });
      selectedArgNames = [...new Set(selectedArgNames)];
      var series = [];
      selectedArgNames.forEach(function(temp) {
        var serie = _.find(selectedArgArrayTemp, { name: temp });
        if (serie > -1) {
          series.push(selectedArgTemp[serie]);
        }
      });

      insightsAbsoluteCtrl.topics.selectedInterval = theSelectedInterval;
      insightsAbsoluteCtrl.topics.insightTopNum = insightTopNum;
      insightsAbsoluteCtrl.topics.mergePC = mergePC;
    });
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      isFactory: "="
    },
    controller: controller,
    controllerAs: "insightsAbsoluteCtrl"
  };
}

angular.module("LeaderMESfe").directive("insightsAbsoluteDirective", insightsAbsoluteDirective);
