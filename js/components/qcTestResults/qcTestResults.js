function qcTestResults() {
  const template = "js/components/qcTestResults/qcTestResults.html";

  const controller = function ($scope, $filter, $timeout, LeaderMESservice, toastr, $sessionStorage, $compile, $window, $localStorage) {
    var qcTestResultsCtrl = this;

    const upperScope = $scope;
    $scope.height = window.innerHeight - 230;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    if (!$localStorage.qcSettings) {
      $localStorage.qcSettings = {
        plotBands: true,
        displayType: "bars",
      };
    }
    $scope.SPC = true;
    qcTestResultsCtrl.displayType = $localStorage.qcSettings.displayType;
    $scope.plotBands = $localStorage.qcSettings.plotBands;
    $scope.plotBandsObj = {};
    $scope.editObject = {};

    $scope.prepareSPCTests = function () {
      if (!$localStorage.SPCTest) {
        $scope.SPCTests = [
          {
            ID: 1,
            TestName: "One point beyond [testParam] deviations.",
            testParam: 3,
            show: true,
          },
          {
            ID: 2,
            TestName: "[testParam] points in a row in a single side of mean or beyond.",
            testParam: 9,
            show: true,
          },
          {
            ID: 3,
            TestName: "[testParam] points steadily increasing or decreasing in a row.",
            testParam: 6,
            show: true,
          },
          {
            ID: 4,
            TestName: "[testParam] points in a row alternating up and down.",
            testParam: 14,
            show: true,
          },
          {
            ID: 5,
            TestName: "[testParam-1] out of [testParam] points in a row within three deviations or beyond.",
            testParam: 2,
            show: true,
          },
          {
            ID: 6,
            TestName: "[testParam-1] out of [testParam] points in a row within two deviations or beyond.",
            testParam: 4,
            show: true,
          },
          {
            ID: 7,
            TestName: "[testParam] points in a row within one deviation of the mean.",
            testParam: 15,
            show: true,
          },
          {
            ID: 8,
            TestName: "[testParam] points in a row on both sides of the mean with none within one deviation.",
            testParam: 8,
            show: true,
          },
        ];

        qcTestResultsCtrl.xAxisOptions = ["ID", "Batch", "TestTime", "RunningNumber"];
        if (!qcTestResultsCtrl.xAxisSelectedObject) {
          qcTestResultsCtrl.xAxisSelectedObject = {
            value: "",
          };
        }
        $scope.SPCTests = _.map($scope.SPCTests, function (temp) {
          temp.newName = temp.TestName;
          if (temp.TestName.includes("[testParam]")) {
            temp.newName = temp.TestName.split("[testParam]").join(temp.testParam);
          }
          if (temp.newName.includes("[testParam-1]")) {
            temp.newName = temp.newName.split("[testParam-1]").join(temp.testParam - 1);
          }
          return temp;
        });
      } else {
        $scope.SPCTests = angular.copy($localStorage.SPCTests);
      }

      if (!$localStorage.limitsControl) {
        $scope.limitsControl = [
          {
            id: 1,
            sectionName: "PROCESS_LIMITS",
            choose: 2,
            value: 1,
            valueL: 1,
            valueH: 2,
            controls: [
              {
                id: 1,
                controlName: "BY_X_STD",
                type: 1,
              },
              {
                id: 2,
                controlName: "STATIC_LIMITS",
                type: 2,
              },
            ],
          },
          {
            id: 2,
            sectionName: "THE_NUMBER_OF_TESTS_OF_SPC'S_KPIS_CALCUALTION",
            choose: 4,
            value: 1,
            controls: [
              {
                id: 3,
                controlName: "THE_LAST_X_TESTS",
                type: 1,
              },
              {
                id: 4,
                controlName: "ALL_THE_TESTS",
                type: 0,
              },
            ],
          },
          {
            id: 3,
            sectionName: "RECIPE_LIMITS",
            choose: 6,
            controls: [
              {
                id: 5,
                controlName: "DYNAMIC_LIMITS(BY_TEST)",
                type: 0,
              },
              {
                id: 6,
                controlName: "STATIC_LIMITS(BY_THE_LAST_TEST)",
                type: 0,
              },
            ],
          },
        ];
      } else {
        $scope.limitsControl = angular.copy($localStorage.limitsControl);
      }
    };
    $scope.prepareSPCTests();
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.rtlDir = $scope.rtl ? "rtl" : "ltr";

    $scope.hasItems = false;
    $scope.itemsCounter = 0;

    qcTestResultsCtrl.addToDashboard = function (evt) {
      var sourceBulletDiv = document.getElementById("source-bullet-id");

      let delayTime = 800;
      evt.preventDefault();
      evt.stopPropagation();

      let el = document.getElementById("target-bullet-id");
      let navDiv = document.getElementById("nav-id-qc-tests");
      bulletTopOffset = el.offsetTop;
      bulletLeftOffset = el.offsetLeft;

      let flyingBullet = $('<div class="b-flying-Bullet"></div>');
      flyingBullet
        .css("width", "4")
        .css("height", "4")
        .css("position", "absolute")
        .css("left", sourceBulletDiv.parentElement.offsetLeft + sourceBulletDiv.offsetLeft + sourceBulletDiv.offsetWidth / 2 + "px")
        .css("top", sourceBulletDiv.parentElement.offsetTop + sourceBulletDiv.offsetHeight / 2 + "px")
        .css("border-radius", "100%")
        .css("animation", "yAxis-b-flying-Bullet " + delayTime + "ms  ease-in-out");

      flyingBullet.animate(
        {
          top: el.parentElement.offsetTop + bulletTopOffset,
          left: el.parentElement.offsetLeft + bulletLeftOffset,
          width: 16,
          height: 16,
          opacity: 0.8,
        },
        delayTime,
        function () {
          flyingBullet.remove();
        }
      );

      $timeout(() => {
        $scope.hasItems = true;
        $scope.itemsCounter++;
      }, delayTime);

      navDiv.append(flyingBullet[0]);
    };

    $scope.$watch(
      "content.request.sfCriteria",
      function (oldv, newv) {
        if (angular.equals(oldv, newv)) {
          return;
        }
        $scope.init();
      },
      true
    );
    $scope.fetching = false;

    $scope.choosingDotsBars = function (dots) {
      qcTestResultsCtrl.displayType = dots ? "dots" : "bars";
    };
    $scope.choosingPlotBands = function () {
      $scope.plotBands = !$scope.plotBands;
    };

    $scope.changeTestLabels = function (test) {
      try {
        test.newName = test.TestName;
        if (test.TestName.includes("[testParam]")) {
          test.newName = test.TestName.split("[testParam]").join(test.testParam);
        }
        if (test.newName.includes("[testParam-1]")) {
          test.newName = test.newName.split("[testParam-1]").join(test.testParam - 1);
        }
      } catch (error) {
        
      }
    };

    $scope.buildDuelAxesGraph = function (highchartInfo) {
      var highchart = {
        chart: {
          type: "bar",
          marginTop: 50,
          marginBottom: 30,
        },
        title: {
          text: "",
        },
        xAxis: [
          {
            plotBands: $scope.plotBandsObjLine,
            reversed: false,
            plotLines: highchartInfo.plotLines,
            min: $scope.primaryGraphMin,
            max: $scope.primaryGraphMax,
          },
        ],
        plotOptions: {
          series: {
            groupPadding: 0,
            pointPadding: 0,
          },
        },
        yAxis: [
          {
            labels: {
              text: "",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            title: {
              text: "",
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
          },
          {
            title: {
              text: "",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            labels: {
              text: "",
              style: {
                color: Highcharts.getOptions().colors[0],
              },
            },
            opposite: true,
          },
        ],
        tooltip: {
          shared: false,
        },
        legend: {
          enabled: false,
        },
        series: highchartInfo.series,

        exporting: {
          csv: {
            itemDelimiter: $sessionStorage.exportCSVDelimiter ||  ",",
          },

          chartOptions: {
            xAxis: {
              labels: {},
            },
          },
          buttons: {
            useHTML: true,
            contextButton: {
              menuItems: [
                {
                  textKey: "fullscreen",
                  text:$filter("translate")("VIEW_FULLSCREEN1"),
                  onclick: function () {      
                    Highcharts.FullScreen.prototype.init(this.renderTo);
                    this.reflow()
                  },
                },
                {
                  textKey: "downloadJPEG",
                  onclick: function () {
                    this.exportChart({
                      type: "image/jpeg",
                    });
                  },
                },
                {
                  textKey: "downloadPDF",
                  onclick: function () {
                    this.exportChart({
                      type: "application/pdf",
                    });
                  },
                },
                {
                  textKey: "downloadCSV",
                  onclick: function () {
                    if (!highchartInfo.name){
                      this.downloadCSV();
                      return;
                    }
                    const rows = [];
                    let row = [];
                    let count = 0;
                    let categoryNameCount = 1;
                    var cell;
                    const firstRow = [];
                    for (let i = 0; i < highchartInfo.categories.length; i++) {
                      if (i === 0) {
                        firstRow.push(highchartInfo._categoryName);
                        qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                          if (xAxis === highchartInfo._categoryName){
                            return;
                          }
                          firstRow.push(xAxis);
                        });
                      }
                      const row = [];
                      let extraData = false;
                      for (let j = 0; j < highchartInfo.series.length; j++) {
                        if (i === 0){
                          if (highchartInfo.series[j].name) {
                            firstRow.push(highchartInfo.series[j].name);
                          }
                          else {
                            firstRow.push(`Series ${categoryNameCount}`);
                            categoryNameCount++;
                          }
                        }
                        if (!extraData && highchartInfo.series[j].data[i].extraData) {
                          extraData = true;
                          const otherData = [];
                          qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                            if (xAxis === highchartInfo._categoryName){
                              return;
                            }
                            if (xAxis === 'TestTime') {
                              otherData.push(moment(highchartInfo.series[j].data[i].extraData[xAxis]).format("DD-MM-YYYY HH:mm:ss"));
                              return;
                            }
                            otherData.push(highchartInfo.series[j].data[i].extraData[xAxis]);
                          });
                          row.unshift(otherData);
                        }
                        if (highchartInfo.series[j].data[i] && highchartInfo.series[j].data[i].y) {
                          row.push(highchartInfo.series[j].data[i].y);
                        }
                        else {
                          row.push(highchartInfo.series[j].data[i]);
                        }
                      }
                      if (highchartInfo.categories[i] && highchartInfo.categories[i].exportValue){
                        rows.push([highchartInfo.categories[i].exportValue, ...row]);
                      }
                      else {
                        rows.push([highchartInfo.categories[i], ...row]);
                      }
                    }
                    rows.unshift([...firstRow]);
  
                    let csvContent = "data:text/plain;charset=UTF-8," + String.fromCharCode(0xFEFF) +  rows.map((e) => e.join($sessionStorage.exportCSVDelimiter || ',')).join("\n");
                    var encodedUri = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${highchartInfo.Name}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  },
                },
               
              ],
            },
          },
      }
      };

      $scope.Chart = $("#" + highchartInfo.newID)
        .highcharts(highchart)
        .highcharts();
    };

    $scope.ignoreTest = function (api, commentObj) {
      if (commentObj) {
        commentObj.IgnoreSPC = true;
        LeaderMESservice.customAPI(api, commentObj).then(function (res) {
          $scope.init(true);
        });
      }
      $("#menuHighchart").hide();
    };
    $scope.addComment = function (api, commentObj) {
      LeaderMESservice.customAPI(api, commentObj).then(function (res) {
        $scope.init(true);
      });
      $("#menuHighchart").hide();
    };

    $scope.buildLineGraph = function (highchartInfo) {
      var highchart = {
        chart: {
          marginTop: 50,
          marginBottom: 30,
        },
        title: {
          text: highchartInfo.Name,
          useHTML: true,
        },
        tooltip: {
          useHTML: true,
          formatter: function () {
            var outside = this,
              buildString = "";
            if (highchartInfo.tooltip == 1) {
              if (this.series.userOptions.toolTipType == "second") {
                return "<div>" + this.series.name + ":<strong> " + this.y + "</strong></div>";
              } else {
                _.forEach(qcTestResultsCtrl.xAxisOptions, function (data) {
                  if (outside.point && outside.point.extraData && outside.point.extraData[data]) {
                    if (data == "TestTime") {
                      buildString += `${$filter("translate")(data)}:<strong> ${moment(outside.point.extraData[data]).format("DD-MM-YYYY HH:mm:ss")} </strong><br />`;
                    } else {
                      buildString += `${$filter("translate")(data)}: <strong>${outside.point.extraData[data]}</strong><br />`;
                    }
                  }
                });
                if (outside.point.comment && outside.point.comment.length > 0) {
                  buildString += `${$filter("translate")("COMMENT")}: <strong>${outside.point.comment}</strong><br />`;
                }
                return `<div>${$filter("translate")("VALUE")}: <strong>${this.y}</strong><br />${buildString}</div>`;
              }
            } else if (highchartInfo.tooltip == 2) {
              if (this.series.userOptions.toolTipType == "second") {
                return "<div>" + this.series.name + ":<strong> " + this.y + "</strong></div>";
              } else {
                return "<div>Y:" + "<strong>" + this.y + "</strong></div>";
              }
            }
          },
        },
        exporting: {
          useHTML: true,
          enabled: true,
          autoRotation: true,

          csv: {
            itemDelimiter: $sessionStorage.exportCSVDelimiter ||  ",",
          },

          chartOptions: {
            xAxis: {
              labels: {},
            },
          },
          buttons: {
            useHTML: true,
            contextButton: {
              menuItems: [
                {
                  textKey: "fullscreen",
                  text:$filter("translate")("VIEW_FULLSCREEN"),
                  onclick: function () {      
                    Highcharts.FullScreen.prototype.init(this.renderTo);
                    this.reflow()
                  },
                },
                {
                  textKey: "downloadJPEG",
                  onclick: function () {
                    this.exportChart({
                      type: "image/jpeg",
                    });
                  },
                },
                {
                  textKey: "downloadPDF",
                  onclick: function () {
                    this.exportChart({
                      type: "application/pdf",
                    });
                  },
                },
                {
                  textKey: "downloadCSV",
                  onclick: function () {
                    const rows = [];
                    let row = [];
                    let count = 0;
                    let categoryNameCount = 1;
                    var cell;
                    const firstRowOtherCat = [];
                    let globalExtraData = false;
                    const firstRowCol = [];
                    for (let i = 0; i < highchartInfo.categories.length; i++) {
                      if (i === 0) {

                        qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                          if (xAxis === highchartInfo._categoryName){
                            return;
                          }
                          firstRowOtherCat.push(xAxis);
                        });
                      }
                      const row = [];
                      let localExtraData = false;
                      for (let j = 0; j < highchartInfo.series.length; j++) {
                        if (i === 0){
                          if (highchartInfo.series[j].name) {
                            firstRowCol.push(highchartInfo.series[j].name);
                          }
                          else {
                            firstRowCol.push(`Series ${categoryNameCount}`);
                            categoryNameCount++;
                          }
                        }
                        if (!localExtraData && 
                          highchartInfo.series[j].data[i] && 
                          highchartInfo.series[j].data[i].extraData) {
                          localExtraData = true;
                          globalExtraData = true;
                          const otherData = [];
                          qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                            if (xAxis === highchartInfo._categoryName){
                              return;
                            }
                            if (xAxis === 'TestTime') {
                              otherData.push(moment(highchartInfo.series[j].data[i].extraData[xAxis]).format("DD-MM-YYYY HH:mm:ss"));
                              return;
                            }
                            otherData.push(highchartInfo.series[j].data[i].extraData[xAxis]);
                          });
                          for(let k = otherData.length - 1; k >= 0 ; k--){
                            row.unshift(otherData[k]);
                          }
                        }
                        if (highchartInfo.series[j].data[i] && highchartInfo.series[j].data[i].y !== undefined) {
                          row.push(highchartInfo.series[j].data[i].y);
                        }
                        else {
                          row.push(highchartInfo.series[j].data[i]);
                        }
                      }
                      if (!localExtraData && globalExtraData) {
                        qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                          if (xAxis === highchartInfo._categoryName){
                            return;
                          }
                          row.unshift('');
                        });
                      }
                      if (highchartInfo.categories[i] && highchartInfo.categories[i].exportValue){
                        rows.push([highchartInfo.categories[i].exportValue, ...row]);
                      }
                      else {
                        rows.push([highchartInfo.categories[i], ...row]);
                      }
                    }
                    if (globalExtraData) {
                      rows.unshift([highchartInfo._categoryName, ...firstRowOtherCat, ...firstRowCol]);
                    }
                    else {
                      rows.unshift([highchartInfo._categoryName, ...firstRowCol]);
                    }
  
                    let csvContent = "data:text/plain;charset=UTF-8," + String.fromCharCode(0xFEFF) +  rows.map((e) => e.join($sessionStorage.exportCSVDelimiter || ',')).join("\n");
                    var encodedUri = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${highchartInfo.Name}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  },
                },
               
              ],
            },
          },
        },
        yAxis: {
          useHTML: true,
          plotLines: highchartInfo.plotLines,
          plotBands: $scope.plotBandsObj,
          gridLineWidth: highchartInfo.gridLineWidth,
          min: highchartInfo.min,
          max: highchartInfo.max,
          title: {
            useHTML: true,
            text: highchartInfo.YAxisName,
          },
        },
        legend: {
          useHTML: true,
          enabled: false,
        },
        plotOptions: {
          useHTML: true,
          series: {
            label: {
              useHTML: true,
              connectorAllowed: false,
            },
            useHTML: true,
            color: "#434348",
            allowPointSelect: true,
            point: {
              events: {
                contextmenu: function (e) {
                  if (!this.clickable) {
                    return;
                  }
                  e.preventDefault();
                  $(".menuContainer").remove();
                  if (e.chartX > 1315) {
                    e.chartX = 1315;
                  } else if (e.chartX < 50) {
                    e.chartX = 50;
                  }
                  $scope.menuModalX = e.chartX + "px";
                  if (e.chartY > 345) {
                    e.chartY = 345;
                  } else if (e.chartY < 50) {
                    e.chartY = 50;
                  }
                  $scope.menuModalY = e.chartY + "px";
                  $scope.commentObj = angular.copy(this.commentObj);
                  if (this.comment && this.comment.length > 0) {
                    $scope.commentObj.Comment = this.comment;
                  }
                  $scope.api = angular.copy(this.Api);
                  qcTestResultsCtrl.hideMenuContainer = function () {
                    $("#menuHighchart").hide();
                  };
                  qcTestResultsCtrl.openAddComment = false;
                  var el = $(
                    "<div id='menuHighchart' class='menuContainer' click-outside='qcTestResultsCtrl.hideMenuContainer()' style='user-select:none;left:" +
                      $scope.menuModalX +
                      ";top:" +
                      $scope.menuModalY +
                      "'>" +
                      "<div class='menuContainerRow' style='border-bottom: 1px solid;' data-ng-click='ignoreTest(api,commentObj);$event.stopPropagation();'>" +
                      $filter("translate")("IGNORE_TEST") +
                      "</div>" +
                      "<div class='menuContainerRow' data-ng-click='qcTestResultsCtrl.openAddComment = !qcTestResultsCtrl.openAddComment;$event.stopPropagation();'>" +
                      $filter("translate")("ADD_COMMENT") +
                      "</div>" +
                      "<input type='text' data-ng-if='qcTestResultsCtrl.openAddComment' data-ng-click='$event.stopPropagation();' data-ng-model='commentObj.Comment' style='color: black;'>" +
                      "<button  data-ng-if='qcTestResultsCtrl.openAddComment' data-ng-click='addComment(api,commentObj);$event.stopPropagation();' style='background-color: darkgrey;'>" +
                      $filter("translate")("SAVE") +
                      "</button>" +
                      "</div>"
                  ).appendTo("#" + highchartInfo.newID);
                  $compile(el)($scope);
                },
                click: function (e) {
                  if (!this.clickable) {
                    return;
                  }
                  if(this?.extraData?.TestID || this?.commentObj?.TestID)
                  {
                    $window.open(`#/appObjectFullView/Test/${this?.extraData?.TestID || this?.commentObj?.TestID}/?firstTime=true`, "_blank");
                  }
                },
              },
            },
          },
          column: {},
        },

        series: highchartInfo.series,
        xAxis: {
          useHTML: true,
          categories: highchartInfo.categories,
          title: {
            useHTML: true,
            text: highchartInfo.XAxisName,
          },
          type: "category",
          labels: {
            step: Math.ceil(highchartInfo.categories.length / (($("#graphs-container").width() * 0.7) / 87)),
            useHTML: true,
            autoRotation: false,
            formatter: function () {
              let value = this.value;
              if (this.value && this.value.name && this.value.exportValue){
                value = this.value.name;
              }
              return (
                `<div style='  white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;' title='${value}'>` +
                value +
                "</div>"
              );
            },
          },
        },

        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                },
              },
            },
          ],
        },
      };

      $scope.Chart = $("#" + highchartInfo.newID)
        .highcharts(highchart)
        .highcharts();

      if (highchartInfo.newID == "SubType95SampleFld221PrimaryGraph") {
        $scope.Chart2 = $("#" + highchartInfo.newID)
          .highcharts(highchart)
          .highcharts();
      }
    };

    upperScope.graphCount = 0;

    //last graph
    $scope.buildSampleFieldsGraphs = function (field, dataset, resultSPC) {
      // check if can build graph
      if (field && dataset) {
        upperScope.graphCount++;
        var highchartInfo = {};
        var fullContainer = document.getElementById("graphs-container");
        if (!_.isEmpty(resultSPC) && !_.isEmpty(resultSPC[field.FName])) {
          var list;
          var singleContainer = document.createElement("div");
          singleContainer.setAttribute("class", "single-container");
          singleContainer.setAttribute("id", field.FName);
          fullContainer.appendChild(singleContainer);
          _.forEach(resultSPC[field.FName], function (graphData, graphName) {
            highchartInfo = {
              plotLines: [],
              series: [],
              tooltip: 1,
            };

            if (graphName == "Histogram") {
              var histogramHighchart = document.createElement("div");
              highchartInfo.newID = field.FName + graphName;
              histogramHighchart.setAttribute("id", highchartInfo.newID);

              histogramHighchart.setAttribute("class", "graph-wide-container-rotate");
              singleContainer.appendChild(histogramHighchart);

              highchartInfo.categories = [];
              var minValue = Infinity;
              var maxValue = -Infinity;
              var data = _.map(resultSPC[field.FName].Histogram.SPC_Graph, function (d) {
                if (d.Y < minValue) {
                  minValue = d.Y;
                }
                if (d.Y > maxValue) {
                  maxValue = d.Y;
                }
                return { x: parseFloat(d.X.toFixed(2)), y: d.Y, extraData: d };
              });
              highchartInfo.series = [
                {
                  type: "column",
                  yAxis: 1,
                  data: data,
                },
                {
                  type: "spline",
                  data: data,
                  color: "#434348",
                },
              ];
              highchartInfo.min = Math.floor(Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL));
              highchartInfo.max = Math.ceil(Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL));
              highchartInfo.plotLines = [
                {
                  value: field.LValue ? parseFloat(field.LValue.toFixed(2)) : field.LValue,
                  color: "red",
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "LSL",
                  toolTipType: "second",
                },
                {
                  value: field.HValue ? parseFloat(field.HValue.toFixed(2)) : field.HValue,
                  color: "red",
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "USL",
                  toolTipType: "second",
                },
                {
                  value: parseFloat(graphData.CL.toFixed(2)),
                  color: "blue",
                  dashStyle: "solid",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "CL",
                  toolTipType: "second",
                },
                {
                  color: "blue",
                  value: parseFloat(graphData.LCL.toFixed(2)),
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "LCL",
                  toolTipType: "second",
                },
                {
                  color: "blue",
                  value: parseFloat(graphData.UCL.toFixed(2)),
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "UCL",
                  toolTipType: "second",
                },
              ];
              highchartInfo._categoryName = qcTestResultsCtrl.xAxisSelectedObject.value;
              $scope.buildDuelAxesGraph(highchartInfo);
            } else {
              var lineHighchartGraph = document.createElement("div");
              highchartInfo.newID = field.FName + graphName;
              lineHighchartGraph.setAttribute("id", highchartInfo.newID);
              var minValue = +Infinity;
              var maxValue = -Infinity;
              if (graphName == "PrimaryGraph") {
                lineHighchartGraph.setAttribute("class", "graph-wide-container");

                highchartInfo.tooltip = 1;

                highchartInfo.categories = [];
                highchartInfo.series = [
                  {
                    data: _.map(dataset, function (d) {
                      if (d[field.FName] < minValue) {
                        minValue = d[field.FName];
                      }
                      if (d[field.FName] > maxValue) {
                        maxValue = d[field.FName];
                      }

                      if (qcTestResultsCtrl.xAxisSelectedObject.value == "TestTime") {
                        if (d.FailedFields.length) {
                          if (field.FName == d.FailedFields[0]) {
                            return {
                              name: moment(d.TestTime).format("DD-MM HH:mm:ss"),
                              y: d[field.FName] || 0,
                              color: "gray",
                              extraData: d,
                              commentObj: {
                                TestFieldID: field.ID,
                                TestID: d.ParentID,
                                Comment: null,
                                IgnoreSPC: false,
                              },
                              Api: "CommentOnTestSample",
                              clickable: true,
                            };
                          }
                        }
                        return {
                          name: moment(d.TestTime).format("DD-MM HH:mm:ss"),
                          y: d[field.FName] || 0,
                          color: "gray",
                          commentObj: {
                            TestFieldID: field.ID,
                            TestID: d.ParentID,
                            Comment: null,
                            IgnoreSPC: false,
                          },
                          Api: "CommentOnTestSample",
                          clickable: true,
                        };
                      } else {
                        if (d.FailedFields.length) {
                          if (field.FName == d.FailedFields[0]) {
                            return {
                              name: d[qcTestResultsCtrl.xAxisSelectedObject.value],
                              y: d[field.FName] || 0,
                              color: "gray",
                              commentObj: {
                                TestFieldID: field.ID,
                                TestID: d.ParentID,
                                Comment: null,
                                IgnoreSPC: false,
                              },
                              Api: "CommentOnTestSample",
                              clickable: true,
                            };
                          }
                        }
                        return {
                          name: d[qcTestResultsCtrl.xAxisSelectedObject.value],
                          y: d[field.FName] || 0,
                          color: "gray",
                          commentObj: {
                            TestFieldID: field.ID,
                            TestID: d.ParentID,
                            Comment: null,
                            IgnoreSPC: false,
                          },
                          Api: "CommentOnTestSample",
                          clickable: true,
                        };
                      }
                    }),
                  },
                ];
                var parentIDs = [...new Set(dataset.map((temp) => temp.ParentID))];
                if (qcTestResultsCtrl.xAxisSelectedObject.value == "TestTime") {
                  _.forEach(parentIDs, function (id) {
                    highchartInfo.categories.push({
                      name : moment(_.find(dataset, { ParentID: id }).TestTime).format("DD-MM HH:mm:ss"),
                      exportValue: moment(_.find(dataset, { ParentID: id }).TestTime).format("DD-MM-YYYY HH:mm:ss")
                    });
                  });
                } else {
                  _.forEach(parentIDs, function (id) {
                    highchartInfo.categories.push(_.find(dataset, { ParentID: id })[qcTestResultsCtrl.xAxisSelectedObject.value]);
                  });
                }
                highchartInfo.series[0].lineWidth = 0;
                highchartInfo.series[0].marker = {
                  enabled: true,
                  symbol: "circle",
                  radius: 2.8,
                };
                highchartInfo.series[0].zindex = 50;
                highchartInfo.series[0].states = {
                  hover: {
                    lineWidthPlus: 0,
                  },
                };
                highchartInfo.series[0].visible = true;
                if (qcTestResultsCtrl.displayType == "bars") {
                  highchartInfo.series[0].visible = false;
                  var maxMinDots = [];
                  _.forEach(highchartInfo.series[0].data, function (temp) {
                    if (maxMinDots[temp.commentObj.TestID]) {
                      if (maxMinDots[temp.commentObj.TestID].max < temp.y) {
                        maxMinDots[temp.commentObj.TestID].max = temp.y;
                      }
                      if (maxMinDots[temp.commentObj.TestID].min > temp.y) {
                        maxMinDots[temp.commentObj.TestID].min = temp.y;
                      }
                    } else {
                      maxMinDots[temp.commentObj.TestID] = {
                        min: temp.y,
                        max: temp.y,
                        commentObj:temp.commentObj
                      };
                    }
                  });
                  Object.keys(maxMinDots).forEach((parentId, i) => {
                    highchartInfo.series.push({
                      data: [
                        {
                          x: i,
                          y: maxMinDots[parentId].min,
                          commentObj:maxMinDots[parentId].commentObj,
                          clickable:true,
                          marker: {
                            symbol: "triangle",
                          },
                        },
                        {
                          x: i,
                          y: maxMinDots[parentId].max,
                          commentObj:maxMinDots[parentId].commentObj,
                          clickable:true,
                          marker: {
                            symbol: "triangle-down",
                          },
                        },
                      ],
                      verticalLines: true,
                      showInLegend: false,
                      color: "gray",
                      zindex: 50,
                      marker: {
                        enabled: true,
                      },
                    });
                  });
                  // _.forEach(highchartInfo.categories, function (temp, i) {
                  //   let name = temp;
                  //   if (temp && temp.name){
                  //     name = temp.name;
                  //   }
                  //   if (maxMinDots && maxMinDots[name] && maxMinDots[name].min != maxMinDots[name].max) {
                  //     highchartInfo.series.push({
                  //       data: [
                  //         {
                  //           x: i,
                  //           y: maxMinDots[name].min,
                  //           commentObj:maxMinDots[name].commentObj,
                  //           clickable:true,
                  //           marker: {
                  //             symbol: "triangle",
                  //           },
                  //         },
                  //         {
                  //           x: i,
                  //           y: maxMinDots[name].max,
                  //           commentObj:maxMinDots[name].commentObj,
                  //           clickable:true,
                  //           marker: {
                  //             symbol: "triangle-down",
                  //           },
                  //         },
                  //       ],
                  //       verticalLines: true,
                  //       showInLegend: false,
                  //       color: "gray",
                  //       zindex: 50,
                  //       marker: {
                  //         enabled: true,
                  //       },
                  //     });
                  //   }
                  // });
                }
                var x = _.unique(
                  _.map(resultSPC[field.FName].PrimaryGraph.SPC_Graph, function (d) {
                    return d.X;
                  })
                );
                var newObj = {};
                _.forEach(x, function (d, y) {
                  newObj[d] = highchartInfo.categories[y];
                });
                highchartInfo.series.push(
                  {
                  marker: {
                    enabled: true,
                    symbol: "circle",
                  },
                  zindex: 50,
                  data: _.map(resultSPC[field.FName].PrimaryGraph.SPC_Graph, function (d) {
                    if (d.Y < minValue) {
                      minValue = d.Y;
                    }
                    if (d.Y > maxValue) {
                      maxValue = d.Y;
                    }
                    if (_.find(resultSPC[field.FName].PrimaryGraph.failedGraphPoints, { X: d.X, Y: d.Y })) {
                      return {
                        y: d.Y,
                        // name:newObj[d.X],
                        extraData: d,
                        color: "#BF0B23", //red
                        commentObj: {
                          TestFieldID: field.ID,
                          TestID: d.ParentID,
                          Comment: null,
                          IgnoreSPC: false,
                        },
                        Api: "CommentOnTestSample",
                        clickable: true,
                      };
                    } else {
                      return {
                        y: d.Y,
                        // name:newObj[d.X],
                        color: "#7cb5ec",
                        commentObj: {
                          TestFieldID: field.ID,
                          TestID: d.ParentID,
                          Comment: null,
                          IgnoreSPC: false,
                        },
                        Api: "CommentOnTestSample",
                        clickable: true,
                      };
                    }
                  }),
                }
                );
                highchartInfo.min = Math.floor(Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL, field.HValue || Infinity, field.LValue || Infinity));
                highchartInfo.max = Math.ceil(Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL, field.HValue || -Infinity, field.LValue || -Infinity));
                $scope.primaryGraphMin = angular.copy(highchartInfo.min);
                $scope.primaryGraphMax = angular.copy(highchartInfo.max);
                highchartInfo.gridLineWidth = 1;
                if ($scope.plotBands) {
                  highchartInfo.gridLineWidth = 0;
                  $scope.plotBandsObj = [
                    {
                      color: "rgba(255,0,0,0.1)",
                      from: -Infinity,
                      to: graphData.LSL,
                    },
                    {
                      color: "rgba(255,255,0, 0.1)",
                      from: graphData.LSL,
                      to: graphData.LCL,
                    },
                    {
                      color: "rgba(0,255,0,	0.1)",
                      from: graphData.LCL,
                      to: graphData.UCL,
                    },
                    {
                      color: "rgba(255,255,0, 0.1)",
                      from: graphData.UCL,
                      to: graphData.USL,
                    },
                    {
                      color: "rgba(255,0,0,0.1)",
                      from: graphData.USL,
                      to: Infinity,
                    },
                  ];
                }

                $scope.plotBandsObjLine = angular.copy($scope.plotBandsObj);

                highchartInfo.series.push(
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return field.LValue ? parseFloat(field.LValue.toFixed(2)) : field.LValue;
                    }),
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    marker: {
                      enabled: false,
                    },

                    name: "LSL",
                    toolTipType: "second",
                  },
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return field.HValue ? parseFloat(field.HValue.toFixed(2)) : field.HValue;
                    }),
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    marker: {
                      enabled: false,
                    },
                    name: "USL",
                    toolTipType: "second",
                  },
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.CL.toFixed(2));
                    }),
                    color: "blue",
                    dashStyle: "solid",
                    width: 2,
                    marker: {
                      enabled: false,
                    },
                    name: "CL",
                    toolTipType: "second",
                  },
                  {
                    color: "blue",
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.LCL.toFixed(2));
                    }),
                    dashStyle: "shortdash",
                    width: 2,
                    marker: {
                      enabled: false,
                    },
                    name: "LCL",
                    toolTipType: "second",
                  },
                  {
                    color: "blue",
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.UCL.toFixed(2));
                    }),
                    dashStyle: "shortdash",
                    width: 2,
                    marker: {
                      enabled: false,
                    },
                    name: "UCL",
                    toolTipType: "second",
                  }
                );
              } else if (graphName == "SecondaryGraph") {
                //this is for remove plotBnadsObj because we dont need it in second graph
                $scope.plotBandsObj = [];
                lineHighchartGraph.setAttribute("class", "graph-wide-container");
                highchartInfo.tooltip = 2;

                highchartInfo.categories = [];
                highchartInfo.series = [
                  {
                    data: _.map(resultSPC[field.FName].SecondaryGraph.SPC_Graph, function (d) {
                      if (d.Y < minValue) {
                        minValue = d.Y;
                      }
                      if (d.Y > maxValue) {
                        maxValue = d.Y;
                      }
                      highchartInfo.categories.push(d.X);
                      if (_.find(resultSPC[field.FName].SecondaryGraph.failedGraphPoints, { X: d.X, Y: d.Y })) {
                        return {
                          y: d.Y || 0,
                          extraData: d,
                          color: "#BF0B23", //red
                        };
                      } else {
                        return {
                          y: d.Y,
                        };
                      }
                    }),
                  },
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.CL.toFixed(2));
                    }),
                    color: "blue",
                    dashStyle: "solid",
                    width: 2,
                    name: "CL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.LCL.toFixed(2));
                    }),
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    name: "LCL",

                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                  {
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.UCL.toFixed(2));
                    }),
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    name: "UCL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                ];
                highchartInfo.min = Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL);
                highchartInfo.max = Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL);
                highchartInfo.gridLineWidth = 1;
              }
              highchartInfo.YAxisName = graphData.YAxisName;
              highchartInfo.XAxisName = graphData.XAxisName;
              if (graphData.Name) {
                highchartInfo.Name = graphData.Name;
              } else {
                highchartInfo.Name = $scope.localLanguage ? field.LName : field.EName;
              }
              highchartInfo.series.name = highchartInfo.Name;
              singleContainer.appendChild(lineHighchartGraph);
              highchartInfo._categoryName = qcTestResultsCtrl.xAxisSelectedObject.value;
              $scope.buildLineGraph(highchartInfo);
              // if (graphName == "PrimaryGraph") {
              //   list = document.createElement("div");
              //   list.setAttribute("class", "list-container");
              //   var ul = document.createElement("ul");
              //   var meanValue;
              //   ul.setAttribute("style"," list-style-type: none;")
              //   var li;
              //   _.forEach(graphData, function (value, key) {
              //     if (key == "CL" || key == "LCL" || key == "UCL" || key == "CP" || key == "Mean" || key == "STD" || key == "CPK" || key == "LSL" || key == "USL" || key == "PPK" || key == "PP") {
              //       li = document.createElement("li");

              //       if(key == "Mean"){
              //         meanValue = value
              //         li.appendChild(document.createTextNode(`${key} x\u0304 = ${parseFloat(value.toFixed(2))}`));                      
              //       }else if(key == "STD"){
              //         li.appendChild(document.createTextNode(`${key} \u03C3 = ${parseFloat(value.toFixed(2))}`));
              //           ul.appendChild(li);
              //           li = document.createElement("li");                        
              //           li.appendChild(document.createTextNode(`x\u0304 + \u03C3*3 = ${parseFloat((meanValue + value*3 ).toFixed(2))}`));
              //           ul.appendChild(li);
              //           li = document.createElement("li");
              //           li.appendChild(document.createTextNode(`x\u0304 - \u03C3*3 = ${parseFloat((meanValue - value*3).toFixed(2))}`));
              //           ul.appendChild(li);
              //       }
              //       else
              //       {
              //         li.appendChild(document.createTextNode(`${key} = ${parseFloat(value.toFixed(2))}`))
              //       }
              //       if(key != "STD"){
              //         ul.appendChild(li);
              //       }
              //     }
              //   });
              //   list.appendChild(ul);
              // } else if (graphName == "SecondaryGraph") {
              //   singleContainer.appendChild(list);
              // }
            }
          });
        }
      } else {
        return;
      }
      var index = _.findIndex($scope.graphs, { fname: field.FName });
      if (!$scope.graphs[index].display) {
        if (document.getElementById($scope.graphs[index].fname) && document.getElementById($scope.graphs[index].fname).style) {
          document.getElementById($scope.graphs[index].fname).style.display = "none";
        }
      } else {
        if (document.getElementById($scope.graphs[index].fname) && document.getElementById($scope.graphs[index].fname).style) {
          document.getElementById($scope.graphs[index].fname).style.display = "flex";
        }
      }
    };

    //this if for the first 3 graphs
    $scope.buildTestFieldsGraphs = function (field, dataset, resultSPC) {
      // check if can build graph
      if (field && dataset) {
        upperScope.graphCount++;
        // if cal from sample
        var highchartInfo = {};
        //build graph-containers that includes all the other containers
        var fullContainer = document.getElementById("graphs-container");

        if (!_.isEmpty(resultSPC) && !_.isEmpty(resultSPC[field.FName])) {
          var list;
          //build single container
          var singleContainer = document.createElement("div");
          singleContainer.setAttribute("class", "single-container");
          singleContainer.setAttribute("id", field.FName);
          fullContainer.appendChild(singleContainer);
          _.forEach(resultSPC[field.FName], function (graphData, graphName) {
            highchartInfo = {
              plotLines: [],
              series: [],
              tooltip: 1,
            };
            if (graphName == "SubType95SampleFld221") {
              return;
            }
            if (graphName == "Histogram") {
              var histogramHighchart = document.createElement("div");
              highchartInfo.newID = field.FName + graphName;
              histogramHighchart.setAttribute("id", highchartInfo.newID);

              histogramHighchart.setAttribute("class", "graph-wide-container-rotate");
              singleContainer.appendChild(histogramHighchart);
              highchartInfo.otherCategories = [];
              highchartInfo.categories = [];
              var minValue = Infinity;
              var maxValue = -Infinity;
              var data = _.map(resultSPC[field.FName].Histogram.SPC_Graph, function (d) {
                if (d.Y < minValue) {
                  minValue = d.Y;
                }
                if (d.Y > maxValue) {
                  maxValue = d.Y;
                }
                const category = {};
                qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                  if (qcTestResultsCtrl.xAxisSelectedObject.value === xAxis){
                    return;
                  }
                  category[xAxis] = d[xAxis];
                });
                highchartInfo.otherCategories.push(category);
                return { x: parseFloat(d.X.toFixed(2)), y: d.Y, extraData: d, };
              });
              highchartInfo.series = [
                {
                  type: "column",
                  yAxis: 1,
                  data: data,
                },
                {
                  type: "spline",
                  data: data,
                  color: "#434348",
                },
              ];
               highchartInfo.min = Math.floor(Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL));
               highchartInfo.max = Math.ceil(Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL));                  
             
              highchartInfo.gridLineWidth = 1;

              highchartInfo.plotLines = [
                {
                  value: field.LValue ? parseFloat(field.LValue.toFixed(2)) : field.LValue,
                  color: "red",
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "LSL",
                  toolTipType: "second",
                },
                {
                  value: field.HValue ? parseFloat(field.HValue.toFixed(2)) : field.HValue,
                  color: "red",
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "USL",
                  toolTipType: "second",
                },
                {
                  value: parseFloat(graphData.CL.toFixed(2)),
                  color: "blue",
                  dashStyle: "solid",
                  width: 2,
                  zIndex: 5,
                  marker: {
                    enabled: false,
                  },
                  name: "CL",
                  toolTipType: "second",
                },
                {
                  color: "blue",
                  value: parseFloat(graphData.LCL.toFixed(2)),
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "LCL",
                  toolTipType: "second",
                },
                {
                  color: "blue",
                  value: parseFloat(graphData.UCL.toFixed(2)),
                  dashStyle: "shortdash",
                  width: 2,
                  marker: {
                    enabled: false,
                  },
                  name: "UCL",
                  toolTipType: "second",
                },
              ];
              highchartInfo._categoryName = qcTestResultsCtrl.xAxisSelectedObject.value;
              $scope.buildDuelAxesGraph(highchartInfo);
            } else {
              var lineHighchartGraph = document.createElement("div");
              highchartInfo.newID = field.FName + graphName;
              lineHighchartGraph.setAttribute("id", highchartInfo.newID);
              var minValue = Infinity;
              var maxValue = -Infinity;
              if (graphName == "PrimaryGraph") {
                lineHighchartGraph.setAttribute("class", "graph-wide-container");

                highchartInfo.tooltip = 1;
                highchartInfo.categories = [];
                highchartInfo.otherCategories = [];
                var datasetTemp = _.filter(dataset, function (d) {
                  if (d[field.FName + "IgnoreSPC"] == true) {
                    return false;
                  }
                  return true;
                });
                highchartInfo.series = [
                  //the main line
                  {
                    zIndex: 50,
                    marker: {
                      enabledThreshold: 0,
                    },
                    data: _.map(datasetTemp, function (d) {
                      //take the min and max values
                      if (d[field.FName] < minValue) {
                        minValue = d[field.FName];
                      }
                      if (d[field.FName] > maxValue) {
                        maxValue = d[field.FName];
                      }
                      const category = {};
                      qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                        if (qcTestResultsCtrl.xAxisSelectedObject.value === xAxis){
                          return;
                        }
                        category[xAxis] = d[xAxis];
                      });
                      highchartInfo.otherCategories.push(category);
                      //if x Axis is TestTime then use it with format
                      if (qcTestResultsCtrl.xAxisSelectedObject.value == "TestTime") {
                        d.TestTime ? highchartInfo.categories.push({
                          name: moment(d.TestTime).format("DD-MM HH:mm:ss"),
                          exportValue: moment(d.TestTime).format("DD-MM-YYYY HH:mm:ss")
                        }) : highchartInfo.categories.push(""); 
                        if (d.FailedFields.length || d.SPC_FailedFields.length) {
                          if (field.FName == d.FailedFields[0] || field.FName == d.SPC_FailedFields[0]) {
                            return {
                              name: moment(d.TestTime).format("DD-MM HH:mm:ss"),
                              y: d[field.FName] || 0,
                              extraData: d,
                              commentObj: {
                                TestFieldID: field.ID,
                                TestID: d.TestID,
                                Comment: null,
                                IgnoreSPC: false,
                              },
                              Api: "CommentOnTestField",
                              comment: d[field.FName + "Comment"],
                              color: field.FName == d.SPC_FailedFields[0] ? "yellow" : "#BF0B23", //red or yellow
                              clickable: true,
                              zindex: 50,
                              marker: {
                                symbol: d[field.FName + "Comment"] ? "triangle" : "circle",
                                radius: 5,
                              },
                            };
                          }
                        }

                        return {
                          name: moment(d.TestTime).format("DD-MM HH:mm:ss"),
                          extraData: d,
                          commentObj: {
                            TestFieldID: field.ID,
                            TestID: d.TestID,
                            Comment: null,
                            IgnoreSPC: false,
                          },
                          comment: d[field.FName + "Comment"],
                          Api: "CommentOnTestField",
                          y: d[field.FName] || 0,
                          clickable: true,
                          zindex: 50,
                          marker: {
                            symbol: d[field.FName + "Comment"] ? "triangle" : "circle",
                            radius: 5,
                          },
                        };
                      } else {
                        let category = d["ID"];
                        if (qcTestResultsCtrl.xAxisSelectedObject.value == "Batch" && 
                            d[qcTestResultsCtrl.xAxisSelectedObject.value]){
                              category = `${d["ID"]}-${d[qcTestResultsCtrl.xAxisSelectedObject.value]}`
                        }
                        highchartInfo.categories.push(category);
                        if (d.FailedFields.length || d.SPC_FailedFields.length) {
                          if (field.FName == d.FailedFields[0] || field.FName == d.SPC_FailedFields[0]) {
                            return {
                              name: category,
                              y: d[field.FName] || 0,
                              extraData: d,
                              commentObj: {
                                TestFieldID: field.ID,
                                TestID: d.TestID,
                                Comment: null,
                                IgnoreSPC: false,
                              },
                              comment: d[field.FName + "Comment"],
                              Api: "CommentOnTestField",
                              color: field.FName == d.SPC_FailedFields[0] ? "yellow" : "#BF0B23", //red or yellow
                              clickable: true,
                              zindex: 50,
                              marker: {
                                symbol: d[field.FName + "Comment"] ? "triangle" : "circle",
                                radius: 5,
                              },
                            };
                          }
                        }

                        return {
                          name: category,
                          extraData: d,
                          commentObj: {
                            TestFieldID: field.ID,
                            TestID: d.TestID,
                            Comment: null,
                            IgnoreSPC: false,
                          },
                          comment: d[field.FName + "Comment"],
                          Api: "CommentOnTestField",
                          y: d[field.FName] || 0,
                          clickable: true,
                          zindex: 50,
                          marker: {
                            symbol: d[field.FName + "Comment"] ? "triangle" : "circle",
                            radius: 5,
                          },
                        };
                      }
                    }),
                  },
                  {
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return field.LValue ? parseFloat(field.LValue.toFixed(2)) : field.LValue;
                    }),
                    marker: {
                      enabled: false,
                    },
                    name: "LSL",
                    toolTipType: "second",
                  },
                  {
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return field.HValue ? parseFloat(field.HValue.toFixed(2)) : field.HValue;
                    }),
                    marker: {
                      enabled: false,
                    },
                    name: "USL",
                    toolTipType: "second",
                  },
                  {
                    color: "blue",
                    dashStyle: "solid",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.CL.toFixed(2));
                    }),
                    name: "CL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                  {
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.LCL.toFixed(2));
                    }),
                    marker: {
                      enabled: false,
                    },
                    name: "LCL",
                    toolTipType: "second",
                  },
                  {
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.UCL.toFixed(2));
                    }),
                    name: "UCL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                ];

                highchartInfo.min = Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL, field.HValue || Infinity, field.LValue || Infinity);
                highchartInfo.max = Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL, field.HValue || -Infinity, field.LValue || -Infinity)
                $scope.primaryGraphMin = angular.copy(highchartInfo.min);
                $scope.primaryGraphMax = angular.copy(highchartInfo.max);
                highchartInfo.gridLineWidth = 1;
                if ($scope.plotBands) {
                  highchartInfo.gridLineWidth = 0;
                  $scope.plotBandsObj = [
                    {
                      color: "rgba(255,0,0,0.1)",
                      from: -Infinity,
                      to: graphData.LSL,
                    },
                    {
                      color: "rgba(255,255,0, 0.1)",
                      from: graphData.LSL,
                      to: graphData.LCL,
                    },
                    {
                      color: "rgba(0,255,0,	0.1)",
                      from: graphData.LCL,
                      to: graphData.UCL,
                    },
                    {
                      color: "rgba(255,255,0, 0.1)",
                      from: graphData.UCL,
                      to: graphData.USL,
                    },
                    {
                      color: "rgba(255,0,0,0.1)",
                      from: graphData.USL,
                      to: Infinity,
                    },
                  ];
                }
                
                $scope.plotBandsObjLine = angular.copy($scope.plotBandsObj);
                
                if(qcTestResultsCtrl.xAxisSelectedObject.value != "Batch")
                {
                  highchartInfo.categories = [...new Set(highchartInfo.categories)];
                }
              } else if (graphName == "SecondaryGraph") {
                $scope.plotBandsObj = [];
                lineHighchartGraph.setAttribute("class", "graph-wide-container");
                highchartInfo.tooltip = 2;
                highchartInfo.otherCategories = [];
                highchartInfo.categories = [];
                highchartInfo.series = [
                  {
                    data: _.map(resultSPC[field.FName].SecondaryGraph.SPC_Graph, function (d) {
                      if (d.Y < minValue) {
                        minValue = d.Y;
                      }
                      if (d.Y > maxValue) {
                        maxValue = d.Y;
                      }
                      const category = {};
                      qcTestResultsCtrl.xAxisOptions.forEach((xAxis) => {
                        if (qcTestResultsCtrl.xAxisSelectedObject.value === xAxis){
                          return;
                        }
                        category[xAxis] = d[xAxis];
                      });
                      highchartInfo.otherCategories.push(category);
                      highchartInfo.categories.push(d.X);
                      if (_.find(resultSPC[field.FName].SecondaryGraph.failedGraphPoints, { X: d.X, Y: d.Y })) {
                        return {
                          y: d.Y || 0,
                          extraData: d,
                          color: "#BF0B23", //red
                        };
                      } else {
                        return {
                          y: d.Y,
                        };
                      }
                    }),
                  },
                ];

                highchartInfo.series.push(
                  {
                    color: "blue",
                    dashStyle: "solid",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.CL.toFixed(2));
                    }),
                    name: "CL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                  {
                    value: parseFloat(graphData.LCL.toFixed(2)),
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.LCL.toFixed(2));
                    }),
                    name: "LCL",
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  },
                  {
                    value: parseFloat(graphData.UCL.toFixed(2)),
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    name: "UCL",
                    data: _.map(highchartInfo.categories, function () {
                      return parseFloat(graphData.UCL.toFixed(2));
                    }),
                    marker: {
                      enabled: false,
                    },
                    toolTipType: "second",
                  }
                );
                highchartInfo.min = Math.min(minValue, graphData.CL, graphData.LCL, graphData.UCL)*0.9;
                highchartInfo.max = Math.max(maxValue, graphData.CL, graphData.LCL, graphData.UCL)*1.1;
                highchartInfo.gridLineWidth = 1;
              }

              highchartInfo.YAxisName = graphData.YAxisName;
              highchartInfo.XAxisName = graphData.XAxisName;
              if (graphData.Name) {
                highchartInfo.Name = graphData.Name;
              } else {
                highchartInfo.Name = $scope.localLanguage ? field.LName : field.EName;
              }
              highchartInfo.series.name = highchartInfo.Name;
              singleContainer.appendChild(lineHighchartGraph);
              highchartInfo._categoryName = qcTestResultsCtrl.xAxisSelectedObject.value;
              $scope.buildLineGraph(highchartInfo);

              if (graphName == "PrimaryGraph") {
                list = document.createElement("div");
                list.setAttribute("class", "list-container");
                var ul = document.createElement("ul");
                ul.setAttribute("style"," list-style-type: none;")
                var li;
                var meanValue
                _.forEach(graphData, function (value, key) {
                  if (key == "CL" || key == "LCL" || key == "UCL" || key == "CP" || key == "Mean" || key == "STD" || key == "CPK" || key == "LSL" || key == "USL" || key == "PPK" || key == "PP") {
                    li = document.createElement("li");
                    if (_.isNumber(value)) {
                      if(key == "Mean"){
                        meanValue = value
                        li.appendChild(document.createTextNode(`${key} x\u0304 = ${parseFloat(value.toFixed(2))}`));
                      }else if(key == "STD"){
                        li.appendChild(document.createTextNode(`${key} \u03C3 = ${parseFloat(value.toFixed(2))}`));
                        ul.appendChild(li);
                        li = document.createElement("li");                        
                        li.appendChild(document.createTextNode(`x\u0304 + \u03C3*3 = ${parseFloat((meanValue + value*3 ).toFixed(2))}`));
                        ul.appendChild(li);
                        li = document.createElement("li");
                        li.appendChild(document.createTextNode(`x\u0304 - \u03C3*3 = ${parseFloat((meanValue - value*3 ).toFixed(2))}`));
                        ul.appendChild(li);
                      }
                      else
                      {
                        li.appendChild(document.createTextNode(`${key} = ${parseFloat(value.toFixed(2))}`));
                      }
                    } else {
                      li.appendChild(document.createTextNode(`${key} = ${parseFloat(value)}`));
                    }
                    if(key != "STD"){
                      ul.appendChild(li);
                    }
                  }
                });
                list.appendChild(ul);
              } else if (graphName == "SecondaryGraph") {
                singleContainer.appendChild(list);
              }
            }
          });
        }
      }
      var index = _.findIndex($scope.graphs, { fname: field.FName });
      if (!$scope.graphs[index].display) {
        if (document.getElementById($scope.graphs[index].fname) && document.getElementById($scope.graphs[index].fname).style) {
          document.getElementById($scope.graphs[index].fname).style.display = "none";
        }
      } else {
        if (document.getElementById($scope.graphs[index].fname) && document.getElementById($scope.graphs[index].fname).style) {
          document.getElementById($scope.graphs[index].fname).style.display = "flex";
        }
      }
    };

    $scope.reDrawGraphs = function () {
      let currentGraphsIDsInDashboard = [];
      let graphToReDraw = [];
      // extract available graphs in dashboard
      $(document.getElementById("graphs-container").childNodes).each(function () {
        currentGraphsIDsInDashboard.push($(this).attr("id"));
      });
      // extract only rendered graphs
      angular.forEach($scope.graphs, function (g) {
        if (currentGraphsIDsInDashboard.indexOf(g.fname) > -1) {
          graphToReDraw.push(g.fname);
        }
      });

      // remove all graphs in order to re draw them
      angular.forEach(currentGraphsIDsInDashboard, function (graphID) {
        let graph = document.getElementById(graphID);

        if (graph) {
          document.getElementById(graphID).remove();
        }
      });

      // re draw graphs
      angular.forEach(graphToReDraw, function (graphID) {
        if (_.findIndex(upperScope.serverRes.SampleFields, { FName: graphID }) > -1) {
          upperScope.buildSampleFieldsGraphs(_.find(upperScope.serverRes.SampleFields, { FName: graphID }), upperScope.serverRes.SampleFieldsData, upperScope.serverRes.ResultSPC);
        } else {
          upperScope.buildTestFieldsGraphs(_.find(upperScope.serverRes.TestFields, { FName: graphID }), upperScope.serverRes.TestFieldsData, upperScope.serverRes.ResultSPC);
        }
      });
    };

    $scope.sortableOptions = {
      update: function (event, ui) {
        setTimeout(upperScope.reDrawGraphs, 100);
      },
    };

    $scope.init = function (updateGraphData,reset) {
      let bodyReq = $scope.content.request.sfCriteria;
      bodyReq.SPCParams = {
        doSPC: $scope.SPC,
        NumDeviations: $scope.limitsControl[0].choose % 2 !== 0 ? +$scope.limitsControl[0].value : 0,
        NumPoints: $scope.limitsControl[1].choose % 2 !== 0 ? +$scope.limitsControl[1].value : 0,
        LowerLimit: $scope.limitsControl[0].choose % 2 !== 1 ? +$scope.limitsControl[0].valueL : 0,
        UpperLimit: $scope.limitsControl[0].choose % 2 !== 1 ? +$scope.limitsControl[0].valueH : 0,
        testParams: _.map(
          _.filter($scope.SPCTests, function (test) {
            if (test.show) {
              return true;
            }
            return false;
          }),
          function (test) {
            return { key: test.ID, value: test.testParam };
          }
        ),
      };
      $scope.fetching = true;

      $scope.getCellTemplate = function () {
        return '<div id="source-bullet-id" class="source-bullet text-center" ng-click="this.addToDashboard($event)" > + </div>';
      };

      $scope.checkIfShouldBuildOrDestroy = function (g) {
        if (!g.display) {
          document.getElementById(g.fname).style.display = "none";
          $scope.graphCount--;
          return;
        } else {
          document.getElementById(g.fname).style.display = "flex";
          $scope.graphCount++;
          return;
        }
      };

      $scope.passedCellTemplate = '<span><i class="fa fa-check" ng-if="COL_FIELD" style="color: green" aria-hidden="true"></i>' + '<i class="fa fa-times" style="color: red" ng-if="!COL_FIELD" aria-hidden="true"></i></span>';
      $scope.dataCellTemplate = "<div style=\"width: 100%;height: 100%;background: white\" ng-style=\"row.entity.Passed && {'background':'#57ab57'} || {'background':'#ff6262'}\"><div class=\"text-center\">{{row.entity.ID}}</div></div>";
      
      if(bodyReq?.EndTime)
      {
        bodyReq.EndTime = moment(bodyReq.EndTime).format('YYYY-MM-DD HH:mm:ss')
      }
      if(bodyReq?.StartTime)
      {
        bodyReq.StartTime = moment(bodyReq.StartTime).format('YYYY-MM-DD HH:mm:ss')
      }
      
      LeaderMESservice.customAPI("GetTestsResults", bodyReq).then(function (res) {
        var sampleFields = res.SampleFields;
        var sampleFieldsData = _.groupBy(res.SampleFieldsData, "ParentID");
        var maxGroup = 0;
        for (var key in sampleFieldsData) {
          if (sampleFieldsData[key].length > maxGroup) {
            maxGroup = sampleFieldsData[key].length;
          }
        }
        var sampleFieldsDataTemplate = {};

        var sampleColDefs = [
          {
            name: "sampleField",
            displayName: $filter("translate")("SAMPLE_FIELD"),
            grouping: { groupPriority: 0 },
            sort: { priority: 1, direction: "asc" },
          },
        ];

        sampleColDefs.push({
          name: "ID",
          headerCellClass: "text-center",
          extraStyle: "padding=10px",
          cellClass: "text-center",
          displayName: $filter("translate")("INDEX"),
        });

        sampleColDefs.push({
          name: "TestTime",
          headerCellClass: "text-center",
          extraStyle: "padding=10px",
          cellClass: "text-center",
          displayName: $filter("translate")("TIME_VALUE"),
          type: "date",
          cellFilter: "date:'dd/MM/yyyy HH:mm:ss'",
          filters: [
            {
              condition: function (term, value) {
                if (!term) return true;
                var valueDate = moment(value).format("DD/MM/YYYY HH:mm:ss");
                var replaced = term.replace(/\\/g, "");
                return valueDate.indexOf(replaced) >= 0;
              },
              placeholder: "",
            },
          ],
        });

        for (var i = 0; i < maxGroup; i++) {
          sampleFieldsDataTemplate[`${$filter("translate")("SAMPLE")}_${i + 1}`] = null;
          sampleColDefs.push({
            name: `${$filter("translate")("SAMPLE")}_${i + 1}`,
          });
        }
        var fieldRowGroup = [];
        _.forEach(sampleFieldsData, function (obj, key) {
          var sampleFieldTemp = null;

          _.forEach(sampleFields, function (sampleField) {
            var fieldRow = Object.assign(
              {
                TestTime: obj[0].TestTime,
                ID: obj[0].ParentID,
                sampleField: null,
              },
              sampleFieldsDataTemplate
            );

            if (obj[0].hasOwnProperty(sampleField.FName)) {
              fieldRow.sampleField = $scope.localLanguage ? sampleField.LName : sampleField.EName;
              sampleFieldTemp = sampleField.FName;
            }

            if (sampleFieldTemp) {
              obj.forEach(function (col, index) {
                fieldRow[`${$filter("translate")("SAMPLE")}_${index + 1}`] = col[sampleFieldTemp];
              });
            }
            fieldRowGroup.push(fieldRow);
          });
        });
        sampleFieldsData = fieldRowGroup;
        upperScope.serverRes = res;
        const response = res;
        upperScope.order = 0;        
        if(!$scope.graphs || reset == "resetDashboardSettings")
        {
          $scope.graphs = [];
          $scope.graphs = _.map(res.TestFields, function (col) {
            return {
              display: true,
              name: $scope.localLanguage ? col.LName : col.EName,
              fname: col.FName,
              order: upperScope.order++,
            };
          });
          
        _.forEach(res.SampleFields, function (col) {
          $scope.graphs.push({
            display: true,
            name: $scope.localLanguage ? col.LName : col.EName,
            fname: col.FName,
            order: upperScope.order++,
          });
        });

        }

        res.TestFieldsData = angular.copy(res.TestFieldsData.sort((a, b) => new moment(a.TestTime) - new moment(b.TestTime)));
        res.SampleFieldsData = angular.copy(res.SampleFieldsData.sort((a, b) => new moment(a.TestTime) - new moment(b.TestTime)));
        $scope.res = res;
        if (updateGraphData) {
          $scope.initGraphs();
          $scope.content.openDashboard = "dashboard";
        }     
        $scope.activeTab = "dashboard";     
        $scope.fetching = false;

        if (!res.TestFields || !res.TestFieldsData || !res.SampleFields || !res.SampleFieldsData) {
          toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
          return;
        }

        const staticColsFirst = [
          {
            name: "TestID",
            headerCellClass: "text-center",
            extraStyle: "padding=10px",
            cellClass: "text-center",
            displayName: $filter("translate")("INDEX"),
            cellTemplate: `<div>
                                <span class="pull-left" style="margin-left: 10px;margin-right:10px">
                                    <a style="text-decoration: underline" ng-if="COL_FIELD" 
                                        href="#/appObjectFullView/Test/{{COL_FIELD}}/?firstTime=true" 
                                        target="Test">
                                        {{COL_FIELD}}
                                    </a>
                                </span>
                            </div>`,
          },
          {
            name: "TestTime",
            headerCellClass: "text-center",
            extraStyle: "padding=10px",
            cellClass: "text-center",
            displayName: $filter("translate")("TIME_VALUE"),
            type: "date",
            cellFilter: "date:'dd/MM/yyyy HH:mm:ss'",
            filters: [
              {
                condition: function (term, value) {
                  if (!term) return true;
                  var valueDate = moment(value).format("DD/MM/YYYY HH:mm:ss");
                  var replaced = term.replace(/\\/g, "");
                  return valueDate.indexOf(replaced) >= 0;
                },
                placeholder: "",
              },
            ],
          },
          {
            name: "Passed",
            cellTemplate: $scope.passedCellTemplate,
            headerCellClass: "text-center",
            extraStyle: "padding=10px",
            cellClass: "text-center",
            displayName: $filter("translate")("PASSED"),
          },
        ];

        const staticColsFirstSample = [
          {
            name: "TestTime",
            headerCellClass: "text-center",
            extraStyle: "padding=10px",
            cellClass: "text-center",
            displayName: $filter("translate")("TIME"),
            type: "date",
            cellFilter: "date:'dd/MM/yyyy HH:mm:ss'",
            filters: [
              {
                condition: function (term, value) {
                  if (!term) return true;
                  var valueDate = moment(value).format("DD/MM/YYYY HH:mm:ss");
                  var replaced = term.replace(/\\/g, "");
                  return valueDate.indexOf(replaced) >= 0;
                },
                placeholder: "",
              },
            ],
          },
          {
            name: "Passed",
            cellTemplate: $scope.passedCellTemplate,
            headerCellClass: "text-center",
            extraStyle: "padding=10px",
            cellClass: "text-center",
            displayName: $filter("translate")("PASSED"),
          },
        ];

        // set last static cols dynamic width
        const staticColsLast = [];
        const staticColsLastSample = [];

        // set first static cols dynamic width
        angular.forEach(staticColsFirst, function (i) {
          i.width = 100 / (res.TestFields.length + staticColsFirst.length + staticColsLast.length) + "%";
        });

        angular.forEach(staticColsLast, function (i) {
          i.width = 100 / (res.TestFields.length + staticColsFirst.length + staticColsLast.length) + "%";
        });

        angular.forEach(staticColsFirstSample, function (i) {
          i.width = 100 / (res.TestFields.length + staticColsFirstSample.length + staticColsLastSample.length) + "%";
        });

        angular.forEach(staticColsLastSample, function (i) {
          i.width = 100 / (res.SampleFields.length + staticColsFirstSample.length + staticColsLastSample.length) + "%";
        });
        let colDefs = [];
        _.forEach(res.TestFields, function (field) {
          colDefs.push(
            {
              name: field.FName,
              headerCellClass: "text-center",
              extraStyle: "padding=10px",
              cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                if (row.entity.FailedFields && row.entity.FailedFields.indexOf(col.colDef.name) > -1) {
                  return "failed-field";
                }
              },
              displayName: $scope.localLanguage ? field.EName : field.LName,
            },
            {
              name: field.FName + "Comment",
              headerCellClass: "text-center",
              extraStyle: "padding=10px",
              cellClass: "text-center",
              displayName: $filter("translate")("COMMENT"),
              cellTemplate: `
              <span style="height: 100%;
              width: 100%;
              display: flex;
              align-items: center;">
              <input type="text"style="width: 100%;min-width: 100px;text-align: center;" type="number" class="form-control" ng-change="grid.appScope.editTestTableObj({TestID:row.entity.TestID,TestFieldID:${field.ID},Comment:row.entity.${field.FName + "Comment"},IgnoreSPC:Null},'Comment')" ng-model="row.entity.${field.FName + "Comment"}" >
              </span>
        `,
            },
            {
              name: field.FName + "IgnoreSPC",
              headerCellClass: "text-center",
              extraStyle: "padding=10px",
              cellClass: "text-center",
              displayName: $filter("translate")("IgnoreSPC"),
              cellTemplate: `
        <span style="display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;" ng-if="!row.entity.row.entity.${field.FName + "IgnoreSPC"}">
        <input icheck style="width: 100%;min-width: 100px" type="checkbox" class="form-control" ng-change="grid.appScope.editTestTableObj({TestID:row.entity.TestID,TestFieldID:${field.ID},Comment:Null,IgnoreSPC:row.entity.${field.FName + "IgnoreSPC"}},'IgnoreSPC')" ng-model="row.entity.${
                field.FName + "IgnoreSPC"
              }" ng-model-options="{allowInvalid: true}">
        </span>
        <span style="display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;" ng-if="row.entity.row.entity.${field.FName + "IgnoreSPC"}">
        <input icheck style="width: 100%;min-width: 100px" type="checkbox" class="form-control" ng-change="grid.appScope.editTestTableObj({TestID:row.entity.TestID,TestFieldID:${field.ID},Comment:Null,IgnoreSPC:row.entity.${field.FName + "IgnoreSPC"}},'IgnoreSPC')" ng-model="row.entity.${
                field.FName + "IgnoreSPC"
              }" ng-model-options="{allowInvalid: true}">
        </span>
        `,
            }
          );
        });

        colDefs = staticColsFirst.concat(colDefs.concat(staticColsLast));
        if(colDefs.length > 15)
        {
          colDefs.forEach(function(col){
            col.width = 150
          })
        }

        $scope.gridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: colDefs,
          showClearAllFilters: false,
          enableColumnResizing: true,
          enableRowSelection: true,
          enableGridMenu: true,
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
          exporterPdfTableHeaderStyle: { fontSize: 8, bold: true, italics: true, color: "blue" },
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
              return $filter("date")(input, " HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        };

        $scope.sampleGridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          columnDefs: sampleColDefs,
          showClearAllFilters: false,
          enableGridMenu: true,
          data: sampleFieldsData,
          exporterMenuCsv: false,
          exporterMenuPdf: false,
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, " HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          exporterExcelFilename: "Sheet" + ".xlsx",
          exporterExcelSheetName: "Sheet",
        };
        
        $scope.gridOptions.appScopeProvider = $scope;
        $scope.gridOptions.data = res.TestFieldsData;
      });
    };
    $scope.editTestTableObj = function (obj, property) {
      if ($scope.editObject[obj.TestFieldID + "" + obj.TestID]) {
        $scope.editObject[obj.TestFieldID + "" + obj.TestID][property] = obj[property];
      } else {
        $scope.editObject[obj.TestFieldID + "" + obj.TestID] = angular.copy(obj);
      }
    };
    $scope.editTestTable = function () {
      var apiCollection = _.map($scope.editObject, function (temp) {
        return LeaderMESservice.customAPI("CommentOnTestField", temp);
      });
      $q.all(apiCollection).then(function () {
        $scope.editObject = {};
      });
    };

    $scope.resetDefaultSPC = function () {
      $localStorage.SPCTest = null;
      $localStorage.limitsControl = null
      $scope.prepareSPCTests();
      qcTestResultsCtrl.xAxisSelectedObject.value = "TestTime";
      $scope.init(true);
    };

    $scope.resetDashboardSettings = function () {
      qcTestResultsCtrl.displayType = "bars";
      $scope.plotBands = true;
      $localStorage.qcSettings.displayType = qcTestResultsCtrl.displayType;
      $localStorage.qcSettings.plotBands = angular.copy($scope.plotBands);
      $scope.init(true,'resetDashboardSettings');
    };

    $scope.applySPC = function () {
      $localStorage.qcSettings.displayType = qcTestResultsCtrl.displayType;
      $localStorage.qcSettings.plotBands = angular.copy($scope.plotBands);
      $localStorage.limitsControl = $scope.limitsControl;
      $localStorage.SPCTests = $scope.SPCTests;
      $scope.init(true);
    };


    $scope.applyDashboardSettings = function () {
      $localStorage.qcSettings.displayType = qcTestResultsCtrl.displayType;
      $localStorage.qcSettings.plotBands = angular.copy($scope.plotBands);
      $scope.init(true);
    };

    $scope.initGraphs = function () {
      //this is the first 3 container
      angular.forEach($scope.res.TestFields, function (field) {
        if (document.getElementById(field.FName)) {
          document.getElementById(field.FName).remove();
        }
        upperScope.buildTestFieldsGraphs(field, $scope.res.TestFieldsData, $scope.res.ResultSPC);
      });

      //this is the last container
      angular.forEach($scope.res.SampleFields, function (field) {
        if (document.getElementById(field.FName)) {
          document.getElementById(field.FName).remove();
        }
        upperScope.buildSampleFieldsGraphs(field, $scope.res.SampleFieldsData, $scope.res.ResultSPC);
      });
    };
    $scope.init();
  };

  return {
    restrict: "EA",
    templateUrl: template,
    scope: {
      content: "=",
      reportId: "=",
    },
    controller: controller,
    controllerAs: "qcTestResultsCtrl",
  };
}

angular.module("LeaderMESfe").directive("searchTestsResults", qcTestResults);
