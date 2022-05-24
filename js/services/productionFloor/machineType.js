angular.module("LeaderMESfe").factory("machineTypeService", function (toastr, $compile, $window, $timeout, $filter, $interval, LeaderMESservice, googleAnalyticsService, $localStorage, $q, SweetAlert, $sessionStorage, DASHBOARD_CONSTANTS, PRODUCTION_FLOOR, shiftService, $modal, GLOBAL, $rootScope, commonFunctions) {
  var updateDataCubeTemp = {};
  var updateTechnicianStatusCubeTemp = {};
  var paramsCubeTemp = {};
  var isNumeric = function (num) {
    if (num == "") {
      return false;
    }
    return !isNaN(num);
  };

  var buildTextColor = function (param, child) {
    paramsCubeTemp = param;
    if (param.TextColor) {
      if (param.TextColor.id === "1" && param.HighLimit !== null && param.LowLimit !== null) {
        if (param.CurrentValue > param.HighLimit || param.CurrentValue < param.LowLimit) {
          if (child == 1) {
            param.TextColorData = "red";
          } else {
            param.TitleTextColor = param.color;
          }
        }
      } else if (param.TextColor.id === "2") {
        if (param.TextColor.constantsBordersConditions != undefined) {
          if (param.TextColor.constantsBordersConditions.length > 0) {
            var color = "none";
            for (var n = 0; n < param.TextColor.constantsBordersConditions.length; n++) {
              if (param.TextColor.constantsBordersConditions[n].condition === "=") {
                if (param.TextColor.constantsBordersConditions[n].value === param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              } else if (param.TextColor.constantsBordersConditions[n].condition === "!=") {
                if (param.TextColor.constantsBordersConditions[n].value !== param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              } // talk with Joe about  <  >
              else if (param.TextColor.constantsBordersConditions[n].condition === ">") {
                if (param.TextColor.constantsBordersConditions[n].value < param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              } else if (param.TextColor.constantsBordersConditions[n].condition === "<") {
                if (param.TextColor.constantsBordersConditions[n].value > param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              } else if (param.TextColor.constantsBordersConditions[n].condition === ">=") {
                if (param.TextColor.constantsBordersConditions[n].value <= param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              } else if (param.TextColor.constantsBordersConditions[n].condition === "<=") {
                if (param.TextColor.constantsBordersConditions[n].value >= param.CurrentValue) {
                  color = param.TextColor.constantsBordersConditions[n].color;
                }
              }
            }
            param.TextColorData = color;
          } else {
            if (child == 1) param.TextColorData = "none";
            else param.TitleTextColor = "none";
          }
        } else {
          if (child == 1) param.TextColorData = "none";
          else param.TitleTextColor = "none";
        }
      } else if (param.TextColor.id === "3") {
        if (child == 1) param.TextColorData = param.TextColor.color;
        else param.TitleTextColor = param.color;
      } else {
        if (child == 1) param.TextColorData = "none";
        else param.TitleTextColor = "none";
      }
    }
    if (child == 1) param.TextColorData = "color : " + param.TextColorData;
    else param.TitleTextColor = "color : " + param.color;
    if (child == 1) return "color : " + param.TextColorData;
    else return "color : " + param.color;
  };

  function machineTypeCode($scope) {
    updateDataCubeTemp = $scope.updateMachineData;
    $scope.updateMachineData = function () {
      if ($scope.content.ID) {
        commonFunctions.searchParent($scope, "showActions") = false;
        LeaderMESservice.actionAPI("GetMachineMainData", { MachineID: $scope.content.ID }).then(function (response) {
          var department = response.AllDepartments[0];
          if (department.RTOnline == false) {
            SweetAlert.swal("Warning! The System is Running OFFLINE!", "For Further Assistance Please Contact Emerald at:\n " + "Phone: +442037692441\n" + "E-Mail: support@matics.live", "error");
          }
          var machine = department.DepartmentsMachine[0];
          if (machine.SetupEnd) {
            $scope.content.actionsData.params.SetupEnd = machine.SetupEnd;
          } else {
            $scope.content.actionsData.params.SetupEnd = 0;
          }
          switch (machine.MachineStatusID) {
            case 1:
              machine.icon = "working.svg";
              break;
            case 2:
              machine.icon = "param_deviation.svg";
              break;
            case 3:
              machine.icon = "stopped.svg";
              break;
            case 4:
              machine.icon = "comm_faillure.svg";
              break;
            case 5:
              machine.icon = "setup_working.svg";
              break;
            case 6:
              machine.icon = "setup_stopped.svg";
              break;
            case 7:
              machine.icon = "comm_faillure.svg";
              break;
            case 8:
              machine.icon = "stop_idle.svg";
              break;
            case 0:
              machine.icon = "no_job.svg";
              break;
          }
          commonFunctions.searchParent($scope, "showActions") = true;
          for (var k = 0; k < $scope.machineBox.Children.length; k++) {
            var child = $scope.machineBox.Children[k];
            child.index = k;
            for (var l = 0; l < child.areas.length; l++) {
              var fields = child.areas[l];
              for (var m = 0; m < fields.fields.length; m++) {
                var param = fields.fields[m];
                upperScope.params = param;
                if (param) {
                  var tmpParam = _.find(machine.MachineParams, { FieldName: param.FieldName });
                  upperScopeParam = tmpParam;
                  if (tmpParam) {
                    if (isNumeric(tmpParam.CurrentValue) || tmpParam.CurrentValue == "0") {
                      tmpParam.CurrentValue = parseFloat(tmpParam.CurrentValue);
                    }
                    param.CurrentValue = tmpParam.CurrentValue;
                    param.HighLimit = isNumeric(tmpParam.HighLimit) ? parseFloat(tmpParam.HighLimit) : "";
                    param.LowLimit = isNumeric(tmpParam.LowLimit) ? parseFloat(tmpParam.LowLimit) : "";
                    param.StandardValue = tmpParam.StandardValue;
                    if (tmpParam.isDefaultMobile === true) {
                      machine.defaultValue = param.CurrentValue;
                    }
                    buildTextColor(param, 1);

                    if (param.OtherParam) {
                      if (param.OtherParam.show == true) {
                        var otherParam = param.OtherParam.fieldname;
                        var otherTmpParam = _.find(machine.MachineParams, { FieldName: otherParam });
                        if (otherTmpParam)
                          if (isNumeric(otherTmpParam.CurrentValue)) {
                            param.otherParamFieldname = parseFloat(otherTmpParam.CurrentValue);
                          }
                      }
                    }
                    if (param.cellColor) {
                      if (param.cellColor.show == true) {
                        if (param.cellColor.fieldname) {
                          var booleanParam = _.find(machine.MachineParams, { FieldName: param.cellColor.fieldname });
                          if (booleanParam) {
                            if (param.cellColor.BooleanValue == true && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "1" || booleanParam.CurrentValue.toLowerCase() == "true")) {
                              param.backgroundColor = param.cellColor.color;
                            } else if (param.cellColor.BooleanValue == false && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "0" || booleanParam.CurrentValue.toLowerCase() == "false")) {
                              param.backgroundColor = param.cellColor.color;
                            }
                          } else if (param.cellColor.color) {
                            param.backgroundColor = param.cellColor.color;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      }
    };

    var init = function () {
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      //box
      var w = angular.element($window);
      $scope.content.ID = parseInt($scope.content.ID);
      if ($scope.content.ID) {
        commonFunctions.searchParent($scope, "showActions") = false;
        $scope.machineBox = {};
        LeaderMESservice.actionAPI("GetMachineMainData", { MachineID: $scope.content.ID }).then(function (response) {
          var department = response.AllDepartments[0];
          if (department.RTOnline == false) {
            SweetAlert.swal("Warning! The System is Running OFFLINE!", "For Further Assistance Please Contact Emerald at:\n " + "Phone: +442037692441\n" + "E-Mail: support@matics.live", "error");
          }
          var machine = department.DepartmentsMachine[0];
          if (machine.SetupEnd) {
            $scope.content.actionsData.params.SetupEnd = machine.SetupEnd;
          } else {
            $scope.content.actionsData.params.SetupEnd = 0;
          }
          commonFunctions.searchParent($scope, "showActions") = true;
          $scope.machineBox = machine;
          $scope.machineBox.DepartmentID = department.DepartmentID;
          $scope.machineBox.MachineID = machine.MachineID;
          switch (machine.MachineStatusID) {
            case 1:
              machine.icon = "working.svg";
              break;
            case 2:
              machine.icon = "param_deviation.svg";
              break;
            case 3:
              machine.icon = "stopped.svg";
              break;
            case 4:
              machine.icon = "comm_faillure.svg";
              break;
            case 5:
              machine.icon = "setup_working.svg";
              break;
            case 6:
              machine.icon = "setup_stopped.svg";
              break;
            case 7:
              machine.icon = "comm_faillure.svg";
              break;
            case 8:
              machine.icon = "stop_idle.svg";
              break;
            case 0:
              machine.icon = "no_job.svg";
              break;
          }
          LeaderMESservice.customAPI("GetMachineParametersStructure", "").then(function (response) {
            var machineTypeStructure = _.find(response, { ID: machine.MachineTypeID });
            if (machineTypeStructure && machineTypeStructure.MachineParametersStructure != null && machineTypeStructure.MachineParametersStructure != "") {
              var machineStructure = JSON.parse(machineTypeStructure.MachineParametersStructure);
              if (machineStructure == undefined) {
                $scope.machineBox = undefined;
                return;
              }

              $scope.machineBox.BoxSize = machineStructure.boxSize;
              $scope.machineBox.chosenSize = machineStructure.chosenSize;
              $scope.machineBox.height = machineStructure.height;
              $scope.machineBox.width = machineStructure.width;
              $scope.machineBox.Children = machineStructure.Children;
              $scope.machineBox.columns = machineStructure.columns;
              $scope.machineBox.DepartmentID = department.DepartmentID;
              upperScopeMachineBox = $scope.machineBox;
              for (var k = 0; k < $scope.machineBox.Children.length; k++) {
                var child = $scope.machineBox.Children[k];
                child.template = getChildTemplate(child.boxId);
                child.DepartmentID = department.DepartmentID;
                child.MachineID = machine.MachineID;
                child.index = k;
                for (var l = 0; l < child.areas.length; l++) {
                  var fields = child.areas[l];
                  for (var m = 0; m < fields.fields.length; m++) {
                    var param = fields.fields[m];
                    if (param) {
                      var tmpParam = _.find(machine.MachineParams, { FieldName: param.FieldName });
                      if (tmpParam) {
                        if (isNumeric(tmpParam.CurrentValue) || tmpParam.CurrentValue == "0") {
                          tmpParam.CurrentValue = parseFloat(tmpParam.CurrentValue);
                        }
                        param.CurrentValue = tmpParam.CurrentValue;
                        param.FieldEName = tmpParam.FieldEName;
                        param.FieldLName = tmpParam.FieldLName;
                        param.FieldName = tmpParam.FieldName;
                        param.HighLimit = isNumeric(tmpParam.HighLimit) ? parseFloat(tmpParam.HighLimit) : "";
                        param.LowLimit = isNumeric(tmpParam.LowLimit) ? parseFloat(tmpParam.LowLimit) : "";
                        param.StandardValue = tmpParam.StandardValue;
                        if (tmpParam.isDefaultMobile === true) {
                          machine.defaultValue = param.CurrentValue;
                        }
                        buildTextColor(param, 1);

                        if (param.OtherParam) {
                          if (param.OtherParam.show == true) {
                            var otherParam = param.OtherParam.fieldname;
                            var otherTmpParam = _.find(machine.MachineParams, { FieldName: otherParam });
                            if (otherTmpParam)
                              if (isNumeric(otherTmpParam.CurrentValue)) {
                                param.otherParamFieldname = parseFloat(otherTmpParam.CurrentValue);
                              }
                          }
                        }
                        if (param.cellColor) {
                          if (param.cellColor.show == true) {
                            if (param.cellColor.fieldname) {
                              var booleanParam = _.find(machine.MachineParams, { FieldName: param.cellColor.fieldname });
                              if (booleanParam) {
                                if (param.cellColor.BooleanValue == true && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "1" || booleanParam.CurrentValue.toLowerCase() == "true")) {
                                  param.backgroundColor = param.cellColor.color;
                                } else if (param.cellColor.BooleanValue == false && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "0" || booleanParam.CurrentValue.toLowerCase() == "false")) {
                                  param.backgroundColor = param.cellColor.color;
                                }
                              } else if (param.cellColor.color) {
                                param.backgroundColor = param.cellColor.color;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          });
        });
      }
    };

    $scope.$on("ngRepeatFinished", function (ngRepeatFinishedEvent) {
      $(".boxShapeShift" + $scope.machineBox.DepartmentID + $scope.machineBox.MachineID).shapeshift({
        enableResize: true,
        enableCrossDrop: false,
        enableDrag: false,
        minColumns: 1,
        columns: $scope.machineBox.columns,
        align: $scope.localLanguage ? "right" : "left",
        autoHeight: true,
        gutterX: 0, // Compensate for div border
        gutterY: 0, // Compensate for div border
        paddingX: 0,
        paddingY: 0,
      });
    });

    init();
  }

  function machineProcessControl($scope) {
    var init = function () {
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      $scope.content.ID = parseInt($scope.content.ID);
      $scope.limitsExist = false;
      $scope.lowLimit = 0;
      $scope.highLimit = 0;
      $scope.standardValue = 0;

      $scope.periods = [
        {
          Name: "CUSTOM",
          id: "custom",
          updateDate: function (date) {
            return null;
          },
        },
        {
          Name: "YEAR",
          id: "year",
          updateDate: function (date) {
            date.setFullYear(date.getFullYear() - 1);
            return date;
          },
        },
        {
          Name: "MONTH",
          id: "month",
          updateDate: function (date) {
            date.setMonth(date.getMonth() - 1);
            return date;
          },
        },
        {
          Name: "WEEK",
          id: "week",
          updateDate: function (date) {
            date.setDate(date.getDate() - 7);
            return date;
          },
        },
        {
          Name: "DAY",
          id: "day",
          updateDate: function (date) {
            date.setDate(date.getDate() - 1);
            return date;
          },
        },
        {
          Name: "HOUR",
          id: "hour",
          updateDate: function (date) {
            date.setHours(date.getHours() - 1);
            return date;
          },
        },
      ];
      $scope.periods.reverse();
      $scope.periodChosen = $scope.periods[0];
      $scope.updatePeriodParameter($scope.periodChosen);
      LeaderMESservice.customAPI("GetGraphParameters", { MachineID: $scope.content.ID }).then(function (response) {
        $scope.graphParameters = response;
        $scope.graphParameter = _.filter($scope.graphParameters, function (param) {
          if (param.BatchGraphSelected == true) {
            return true;
          }
          return false;
        });
        $scope.updateGraph();
      });
    };

    Number.prototype.padLeft = function (base, chr) {
      var len = String(base || 10).length - String(this).length + 1;
      return len > 0 ? new Array(len).join(chr || "0") + this : this;
    };

    $scope.updatePeriodParameter = function (period) {
      if (period != null) {
        $scope.periodChosen = period;
        var date = new Date();
        date = period.updateDate(date);
        if (date) {
          $scope.periodDate = [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join("-") + " " + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(":");
        }
      } else {
        $scope.periodDate = null;
      }
    };

    $scope.updateGraphParameter = function (graphParameter) {
      $scope.graphParameter = graphParameter;
    };

    var convertDate = function (date) {
      return [date.getFullYear(), (date.getMonth() + 1).padLeft(), date.getDate().padLeft()].join("-") + " " + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft()].join(":");
    };

    $scope.updateStartTime = function (startTime) {
      if (typeof startTime.value === "string" && startTime.value != "" && startTime.value != null) {
        startTime.value = moment(startTime.value, "DD/MM/YYYY HH:mm:ss");
      }
      if (startTime.value) {
        $scope.startTimeDate = convertDate(startTime.value._d);
      } else {
        $scope.startTimeDate = null;
      }
    };

    $scope.updateEndTime = function (endTime) {
      if (typeof endTime.value === "string" && endTime.value != "" && endTime.value != null) {
        endTime.value = moment(endTime.value, "DD/MM/YYYY HH:mm:ss");
      }
      if (endTime.value) {
        $scope.endTimeDate = convertDate(endTime.value._d);
      } else {
        $scope.endTimeDate = null;
      }
    };
    $scope.enableZoom = true;
    $scope.zoomChanged = function (zoom) {
      $scope.enableZoom = zoom;
    };
    $scope.updateGraph = function () {
      if ($scope.updateInProcess) {
        return;
      }
      $scope.updateInProcess = true;
      if (!$scope.graphParameter) {
        return;
      } else {
        $scope.graphs = angular.copy($scope.graphParameter);
        if ($scope.graphParameter.length == 0) {
          $scope.updateInProcess = false;
          return;
        }
        for (var i = 0; i < $scope.graphParameter.length; i++) {
          var requestGraphData = {
            MachineID: $scope.content.ID,
            ParameterName: $scope.graphParameter[i].FieldName,
            startTime: "",
            endTime: "",
          };
          if ($scope.periodChosen.Name != "CUSTOM") {
            requestGraphData.startTime = $scope.periodDate.toString();
          } else {
            if ($scope.startTimeDate) {
              requestGraphData.startTime = $scope.startTimeDate.toString();
              if ($scope.endTimeDate) {
                requestGraphData.endTime = $scope.endTimeDate.toString();
              }
            }
          }
          LeaderMESservice.customAPI("GetGraphData", requestGraphData).then(function (response) {
            $scope.updateInProcess = false;
            if (!response) {
              $scope.error = true;
              $timeout(function () {
                Highcharts.chart(
                  "noDataGraph",
                  Highcharts.merge([], {
                    title: { text: "" },
                  })
                );
              }, 100);
              return;
            }

            $scope.error = false;
            var fieldName = null;
            if (response.length > 0) {
              var keys = _.keys(response[0]);
              for (var j = 0; j < keys.length; j++) {
                if (keys[j] !== "Job" && keys[j] !== "RecordTime" && keys[j] !== "LValue" && keys[j] !== "HValue" && keys[j] !== "targetValue" && keys[j] != "JobStartTime") {
                  fieldName = keys[j];
                }
              }
            }
            var graphName = "";
            if (fieldName) {
              var graphField = _.find($scope.graphParameters, { FieldName: fieldName });
              if (graphField) {
                graphName = $scope.localLanguage ? graphField.LName : graphField.EName;
              }
            }

            var limitsExist = false;
            var firstValue = null;
            var lowLimit = 0;
            var highLimit = 0;
            var standardValue = 0;
            if (response[response.length - 1].JobStartTime) {
              var startWork = new Date(response[response.length - 1].JobStartTime);
            }
            var paramAxis = response.map(function (a) {
              var myDate = new Date(a.RecordTime);
              if (a.LValue != null || a.HValue != null) {
                limitsExist = true;
                lowLimit = a.LValue;
                highLimit = a.HValue;
                standardValue = a.FValue;
              }
              if (firstValue == null) {
                firstValue = myDate.getTime();
              }
              return [myDate.getTime(), a[fieldName]];
            });
            Highcharts.setOptions({
              global: {
                useUTC: false,
              },
              lang: {
                decimalPoint: ".",
                thousandsSep: ",",
                resetZoom: $filter("translate")("RESET"),
                resetZoomTitle: $filter("translate")("RESET"),
              },
            });
            var highchart = {
              chart: {
                type: "spline",
                zoomType: $scope.enableZoom == true ? "xy" : "",
                useHTML: true,
              },
              title: {
                text: graphName,
                useHTML: true,
              },
              xAxis: {
                title: {
                  useHTML: true,
                },
                type: "datetime",
                dateTimeLabelFormats: {
                  second: "%H:%M:%S",
                  day: "%e. %b",
                },
                plotLines: [
                  {
                    value: startWork,
                    color: "blue",
                    dashStyle: "shortdash",
                    width: 2,
                    label: {
                      text: $filter("translate")("START_WORKING"),
                    },
                  },
                ],
              },
              exporting: {
                enabled: true,
                csv: {
                  itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
                },

                buttons: {
                  contextButton: {
                    menuItems: [
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
                          this.downloadCSV();
                        },
                      },
                    ],
                  },
                },
              },
              yAxis: {
                title: {
                  text: graphName,
                  useHTML: $scope.localLanguage ? Highcharts.hasBidiBug : false,
                },
                labels: {
                  formatter: function () {
                    return this.value;
                  },
                },
                plotLines: [
                  {
                    value: lowLimit || null,
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    label: {
                      text: $filter("translate")("LOW_LIMIT"),
                    },
                  },
                  {
                    value: standardValue || null,
                    color: "green",
                    dashStyle: "shortdash",
                    width: 2,
                    label: {
                      text: $filter("translate")("STANDARD_VALUE"),
                    },
                  },
                  {
                    value: highLimit || null,
                    color: "red",
                    dashStyle: "shortdash",
                    width: 2,
                    label: {
                      text: $filter("translate")("HIGH_LIMIT"),
                    },
                  },
                ],
              },
              tooltip: {
                crosshairs: true,
                shared: true,
                useHTML: true,
                valuePrefix: "",
                pointFormat: "<div>{series.name}: <br/><b>{point.y}</b><br/></div>",
              },
              plotOptions: {
                spline: {
                  marker: {
                    radius: 4,
                    lineColor: "#666666",
                    lineWidth: 1,
                  },
                },
                series: {
                  dataGrouping: {
                    approximation: "average", //default
                    units: [["day", [1]]],
                  },
                },
              },

              series: [
                {
                  color: DASHBOARD_CONSTANTS.blue,
                  name: graphName,
                  lineWidth: 1,
                  data: paramAxis,
                  tooltip: {
                    //valueDecimals: 4,
                    pointFormat: "{series.name}: <b>{point.y}</b><br/>",
                    useHTML: true,
                  },
                  zones: [
                    {
                      value: lowLimit || null,
                      color: lowLimit ? "red" : DASHBOARD_CONSTANTS.blue,
                    },
                    {
                      value: highLimit || null,
                      color: DASHBOARD_CONSTANTS.blue,
                    },
                    {
                      color: highLimit ? "red" : DASHBOARD_CONSTANTS.blue,
                    },
                  ],
                },
                {
                  showInLegend: false,
                  name: $filter("translate")("LIMITS"),
                  type: "scatter",
                  marker: {
                    enabled: false,
                  },
                  data: [
                    [firstValue, lowLimit],
                    [firstValue, highLimit],
                    [firstValue, standardValue],
                  ],
                },
              ],
            };
            if ($scope.localLanguage) {
              highchart.tooltip.pointFormat = '<div style="text-align: right">:{series.name} <br/><b>{point.y}</b><br/></div>';
            }
            Chart = $("#container_" + fieldName)
              .highcharts(highchart)
              .highcharts();
            if (Chart) {
              Chart.pointer.normalize = function (e, chartPosition) {
                var chartX, chartY, ePos;
                // IE normalizing
                e = e || win.event;
                if (!e.target) {
                  e.target = e.srcElement;
                }

                // iOS (#2757)
                ePos = e.touches ? (e.touches.length ? e.touches.item(0) : e.changedTouches[0]) : e;

                // Get mouse position
                if (!chartPosition) {
                  this.chartPosition = chartPosition = Highcharts.offset(this.chart.container);
                }

                // chartX and chartY
                if (ePos.pageX === undefined) {
                  // IE < 9. #886.
                  chartX = Math.max(e.x, e.clientX - chartPosition.left); // #2005, #2129: the second case is
                  // for IE10 quirks mode within framesets
                  chartY = e.y;
                } else {
                  chartX = ePos.pageX * $rootScope.scaleAfterZoom + 11 - chartPosition.left;
                  chartY = ePos.pageY * $rootScope.scaleAfterZoom - chartPosition.top;
                }

                return Highcharts.extend(e, {
                  chartX: Math.round(chartX),
                  chartY: Math.round(chartY),
                });
              };
            }
          });
        }
      }
    };

    init();
  }

  var machineDashboardCode = function ($scope) {
    $scope.MahcinesDataRequest = [$scope.content.ID];
    const reqBody = {
      machines: $scope.MahcinesDataRequest,
      structureType: 1,
      IsDefault: false
    };
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    LeaderMESservice.customAPI("GetMachineStructure", reqBody).then(function (response) {
      for (var i = 0; i < response?.Structure?.length; i++) {
        if (
          _.findIndex(response.Structure[i], {
            FieldName: "MachineID",
            Value: $scope.content.ID.toString(),
          }) >= 0
        ) {
          var Structure = _.find(response.Structure[i], {
            FieldName: "Structure",
          });
          if (Structure) {
            try {
              $scope.machineDataStructure = JSON.parse(Structure.Value);
            } catch (e) {
              console.log("structure is not a json");
            }
          }
        }
      }

    });
    $scope.productMenuList = [{
      FieldName: "Product",
      translate: "PRODUCT",
      FieldEName: "ProductEName",
      FieldLName: "ProductLName",
      type: 1
    },
    {
      FieldName: "ProductCatalogID",
      translate: "PRODUCT_CATALOG_ID",
      type: 2
    },
    {
      FieldName: "Customer",
      translate: "CUSTOMER",
      FieldEName: "ClientEName",
      FieldLName: "ClientLName",
      type: 1
    },
    ];
    $scope.editModeCallback = function (param, applyAll, field) {
      $scope.machineDataStructure[field] = {
        FieldName: param.FieldName,
        graph: $scope.machineDataStructure[field] && $scope.machineDataStructure[field].graph,
        visibility: true,
        translate: param.translate,
        FieldEName: param.FieldEName,
        FieldLName: param.FieldLName,
        type: param.type
      };
      var sendObj = { "machineStructure": [{ "MachineArr": $scope.MahcinesDataRequest, StructureType: 1, Structure: JSON.stringify($scope.machineDataStructure) }] }
      LeaderMESservice.customAPI("SaveMachineStructure", sendObj).then(function (response) {
        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
      }, function (err) {
        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
      });
    };

    $scope.gaE = function (pageName, eventName) {
      googleAnalyticsService.gaEvent(pageName, eventName);
    };
    $scope.tasksPermissionLevel = $sessionStorage.tasksPermissionLevel;

    $scope.departmentMachines = [];
    LeaderMESservice.customAPI("GetDepartmentMachine", { DepartmentID: 0 }).then(function (response) {
      var departments = response.DepartmentMachine;
      departments.forEach(function (dep) {
        if (dep && dep.Value) {
          var machine = _.find(dep.Value, { Id: $scope.content.ID });
          if (machine) {
            $scope.departmentMachines = dep.Value;
            var departmentInfo = dep.Key
            $scope.shiftData.departmentMachines = _.map(dep.Value, function (machineTemp) {
              machineTemp.MachineTypeEName = departmentInfo.EName;
              machineTemp.MachineTypeLName = departmentInfo.LName;
              machineTemp.MachineID = machineTemp.Id;
              machineTemp.MachineTypeID = machineTemp.TypeID;
              machineTemp.MachineEName = machineTemp.MachineName;
              return machineTemp;
            });
          }
        }
      });
    });

    // $scope.machineDashboardStructure = {
    //   value : "false"
    // }

    $scope.openInfo = function () {
      window.open(GLOBAL.machine, "_blank");
    };



    var date = new Date();
    var startDate = new Date(date.getTime() - 1000 * 60 * 60 * 24);
    var getFormattedDate = function (date) {
      return $filter("date")(date, "yyyy-MM-dd HH:mm:ss");
    };
    googleAnalyticsService.gaPV("Machine_screen");
    $scope.srcFromId = function (id, getText) {
      var img = null;
      var text = null;
      switch (id) {
        case "0":
          img = "images/onlineIcons/technician-called.png";
          text = "TECHNICIAN_CALLED";
          break;
        case "1":
          img = "images/onlineIcons/message-recieved.png";
          text = "TECHNICIAN_MESSAGE_RECIEVED";
          break;
        case "2":
          img = "images/onlineIcons/decline.png";
          text = "TECHNICIAN_DECLINE";
          break;
        case "4":
          img = "images/onlineIcons/at-work.png";
          text = "TECHNICIAN_AT_WORK";
          break;
        case "5":
          img = "images/onlineIcons/work-done.png";
          text = "TECHNICIAN_WORK_DONE";
          break;
        case "6":
          img = "images/onlineIcons/cancel.png";
          text = "TECHNICIAN_WORK_CANCEL";
          break;
      }
      if (getText) {
        return text;
      }
      return img;
    };

    $scope.newTaskWindowUpdate = function () {
      $timeout(() => {
        $scope.shiftData.openNewTaskModal = false;
      }, 200);
    };

    $scope.openNotification = function () {
      $scope.notifiactionLoading = true;
      LeaderMESservice.customAPI("GetOpenCallsAnd24Hours", {
        sourceMachineID: $scope.shiftData.machineID,
      }).then(function (response) {
        updateTechnicianStatusCubeTemp = response;
        if (!response) {
          $scope.notifiactionLoading = false;
          return;
        }
        var today = d3.time.day.floor(new Date()).getTime();
        $scope.technicianNotification = _.sortBy(response.Calls24Hours, function (note) {
          var date = new Date(note.ResponseDate).getTime();
          note.dateToDisplay = date > today ? $filter("date")(date, "HH:mm a") : $filter("date")(date, "dd/MM/yyyy HH:mm");
          return -date;
        });
        $scope.notifiactionLoading = false;
      });
    };

    $scope.periodsOptions = {
      1: "CUSTOM",
      3: "LAST_24_HOURS",
      4: "THIS_SHIFT",
      5: "LAST_HOUR",
      6: "LAST_SHIFT",
      8: "LAST_24_HOURS",
    };

    $scope.today = new Date();
    $scope.yesterday = new Date();
    $scope.yesterday.setDate($scope.yesterday.getDate() - 1);
    if (!$scope.dtStart) {
      $scope.dtStart = $scope.yesterday;
      $scope.dtEnd = $scope.today;
    }

    $scope.openDatePicker = function () {
      var modelScope = $scope;
      $modal
        .open({
          windowClass: "dashboard-period-dropdown",
          scope: modelScope,
          templateUrl: "views/common/datepickerRange.html",
          controller: function ($scope, $modalInstance) {
            $scope.today = new Date();
            $scope.yesterday = new Date();
            $scope.yesterday.setDate($scope.yesterday.getDate() - 1);
            if (!$scope.dtStart) {
              $scope.dtStart = $scope.yesterday;
              $scope.dtEnd = $scope.today;
            }

            $scope.errorCompare = false;
            $scope.technicianShiftError = false;

            $scope.checkErrors = function () {
              $scope.errorCompare = false;
              if (Date.parse($scope.dtStart) > Date.parse($scope.today)) {
                //custome date is less than today
                $scope.errorCompare = true;
                $scope.technicianShiftError = true;
              }
            };

            $scope.updateValue = function (selectedDate, isStart) {
              if (typeof selectedDate === "string" && selectedDate != "" && selectedDate != null) {
                selectedDate = moment(selectedDate, "DD/MM/YYYY HH:mm:ss");
              }
              if (!selectedDate) return;
              if (selectedDate.toDate) {
                $scope.dtStart = selectedDate.toDate();
                $scope.dtEnd = moment(selectedDate).add(1, 'days').toDate();
                // if (isStart) {
                //   $scope.dtStart = selectedDate.toDate();
                // } else {
                //   $scope.dtEnd = date.setDate(selectedDate.toDate()+ 1);
                // }
              }
              $scope.checkErrors();
            };

            $scope.updateDate = function () {
              $scope.errorCompare = false;
              if (Date.parse($scope.dtStart)) {
                // user has chosen range date and clicked on Get Data
                $scope.updateData(2, $scope.dtStart, $scope.dtEnd);
                $scope.closeModal();
              } else {
                //end is less than start
                $scope.errorCompare = true;
              }
            };
            $scope.closeModal = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function () { });
    };
    //$scope.machineBox.MachineID = 1;
    upperScope = this;

    $scope.openCallServiceCube = function () {
      var machineTemp = {
        MachineID: "",
        MachineEName: "",
      };
      machineTemp.MachineID = $scope.shiftData.machineID;
      machineTemp.MachineEName = $scope.shiftData.Machines[0].machineName;

      $modal.open({
        templateUrl: "views/common/callServiceCubeModal.html",
        windowClass: "",
        controller: function ($scope, $modalInstance) {
          $scope.machineCube = machineTemp;
          $scope.selectedTab = "openCalls";
          $scope.rtl = LeaderMESservice.isLanguageRTL();
          $scope.updateDataCube = updateDataCubeTemp;
          $scope.updateTechnicianStatusCube = updateTechnicianStatusCubeTemp;
          $scope.paramsCube = paramsCubeTemp;

          $scope.updateTechnicianStatus = function () {
            shiftService.getTechnicianStatus();
          }

          $scope.updateNotifications = function () {
            if ($scope.loading) {
              return;
            }

            $scope.loading = true;
            LeaderMESservice.customAPI("GetOpenCallsAnd24Hours", {
              sourceMachineID: $scope.machine.MachineID,
            }).then(function (response) {
              $scope.loading = false;
              callOfServiceCubeCtrl.last24Notifications = response.Calls24Hours;
              callOfServiceCubeCtrl.openCallsNotifications = response.OpenCalls;
              $scope.openNotifications($scope.selectedTab);
              callOfServiceCubeCtrl.dataLoad = false;
            });
          };
          $scope.openNotifications = function (selectedTab) {
            $scope.selectedTab = selectedTab;
          };
          $scope.close = function () {
            $modalInstance.close();
          };
        },
      });
    };

    var durationObj = shiftService.durationParams(4);
    $scope.shiftData = shiftService.shiftData;
    $scope.showSettingsMenu = false;
    $scope.shiftData.machineID = $scope.content.ID;
    $scope.getMachineIcon = shiftService.getMachineStatusIcon;
    $scope.slider = shiftService.sliderData;
    $scope.containers = shiftService.machineContainers;
    $scope.getTemplateByStructID = function (structureID) {
      const structureId = structureID;
      const body = { StructureID: structureID };
      LeaderMESservice.customAPI("GetDashboardTemplateStructureByID", body).then(function (res) {
        var fullTemplate = _.find(res.TemplateData, { ID: structureId });
        if (fullTemplate) {
          let structure = JSON.parse(fullTemplate.Structure);
          if (!structure.containers && structure.data) {
            // backward computability
            structure = {
              containers: {
                data: structure.data,
                dataInsightsPage: structure.dataInsightsPage,
                dataInsightsFactoryPage: structure.dataInsightsFactoryPage,
              },
            };
          }
          shiftService.loadNewTemplateMachine(structure);
        }
      });
    };
    if ($localStorage.machineScreenStructureID) {
      $scope.getTemplateByStructID($localStorage.machineScreenStructureID);
    }

    var currentContainer = _.find($scope.containers.data, { template: "shiftTreeGraph" });
    // $scope.shiftData.machineDashboardStructure = {
    //   value : "false"
    // }


    if (currentContainer) {
      currentContainer.options.settings.jobID = $scope.content.actionsData.targetParameters.JobID;
    }
    shiftService.dashboardForMachine = true;
    $scope.shiftData.selectedTab = 4;
    shiftService.shiftData.tab = 4;
    shiftService.updateData($scope.content.subMenu.SubMenuExtID, durationObj, true, $scope.content.ID);

    $scope.updateData = function (value, date, dateEnd) {
      // code for ga
      $scope.dtStart = date;
      $scope.dtEnd = dateEnd;
      var eventName = null;
      switch (value) {
        case 8:
          eventName = "shift_in_last_24_hours";
          break;
        case 4:
          eventName = "shift";
          break;
        case 5:
          eventName = "last_hour";
          break;
        case 6:
          eventName = "last_shift";
          break;
      }
      if (eventName) {
        googleAnalyticsService.gaEvent("Department_Shift", eventName);
      }
      // code for ga end
      if ($scope.shiftData.dataLoading) {
        return;
      }
      if (value == 2) {
        if (date && dateEnd) {
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          dateEnd.setHours(0);
          dateEnd.setMinutes(0);
          dateEnd.setSeconds(0);
          dateEnd.setMilliseconds(0);
          $scope.shiftData.customDay = $scope.dtStart
          $scope.shiftData.customRange = {
            startDate: date,
            endDate: dateEnd,
          };
        } else if (date) {
          $scope.shiftData.customDay = date;
        }
      }
      var durationObj = shiftService.durationParams(value, date);
      if ((durationObj && durationObj.updateData !== false) || !durationObj) {
        if (value != 5) {
          $scope.shiftData.lastHour = false;
        } else {
          $scope.shiftData.dataTimePeriod = 4;
          $scope.shiftData.lastHour = true;
        }
        shiftService.shiftData.tab = value;
        $scope.shiftData.selectedTab = value;
        if (durationObj) {
          delete durationObj.updateData;
        }

        shiftService.updateData($scope.shiftData.DepartmentID, durationObj, false);
      } else {
        $scope.shiftData.lastHour = true;
        $scope.selectedDuration = value;
        shiftService.shiftData.selectedTab = value;
      }
    };

    // $scope.updateData = function(value){
    //     // code for ga
    //     var eventName = null;
    //     switch (value) {
    //         case 3:
    //             eventName = "shift_in_last_24_hours";
    //             break;
    //         case 4:
    //             eventName = "shift";
    //             break;
    //         case 5:
    //             eventName = "last_hour";
    //             break;
    //         case 6:
    //             eventName = "last_shift";
    //             break;
    //     }
    //     if(eventName){
    //         googleAnalyticsService.gaEvent("Machine_screen", eventName);
    //     }
    //     // code for ga end
    //
    //     if($scope.shiftData.dataLoading){
    //         return;
    //     }
    //     var durationObj = shiftService.durationParams(value);
    //     if(durationObj != 'false'){
    //         if (value != 5){
    //             $scope.shiftData.lastHour = false;
    //         }
    //         else{
    //             $scope.shiftData.lastHour = true;
    //         }
    //         shiftService.shiftData.tab = value;
    //         $scope.shiftData.selectedTab = value;
    //         shiftService.updateData($scope.content.subMenu.SubMenuExtID,durationObj);
    //     }else{
    //         $scope.shiftData.lastHour = true;
    //         $scope.selectedDuration = value;
    //         shiftService.shiftData.selectedTab = value;
    //     }
    // }

    $scope.refresh = function () {
      var durationObj = shiftService.durationParams();

      shiftService.updateData($scope.shiftData.DepartmentID, durationObj, true);
      googleAnalyticsService.gaEvent("Machine_screen", "refresh");
    };
    $scope.resetDefault = function () {
      $localStorage.machineScreenStructureID = undefined;
      shiftService.resetMachineContainerDefault();
      googleAnalyticsService.gaEvent("Machine_screen", "reset");
    };
    $scope.sortableOptions = {
      update: function (e, ui) {
        googleAnalyticsService.gaEvent("Machine_screen", "Change_display_order");
      },
    };
    // update data when change slider
    var timeoutPromise, timeoutPromiseStopEvents;
    var delayInMs = 500;
    var delayInMsStopEvents = 500;
    shiftService.sliderUpdateDefferd.promise.then(null, null, function () {
      if ($scope.shiftData.selectedTab == 5 && !$scope.shiftData.lastHour) {
        $scope.shiftData.selectedTab = $scope.shiftData.tab;
      }
      // $scope.shiftData.lastHour = false;
      $timeout.cancel(timeoutPromise);
      $timeout.cancel(timeoutPromiseStopEvents);
      timeoutPromise = $timeout(function () {
        $scope.shiftData.Machines = shiftService.calcEvents();
      }, delayInMs);
      timeoutPromiseStopEvents = $timeout(function () {
        if ($scope.shiftData.data && $scope.slider.minValue && $scope.slider.maxValue) {
          shiftService.updateStopEvents();
          // shiftService.getTopStopEvents();
        }
      }, delayInMsStopEvents);
    });

    // auto refresh
    var refreshFunction;
    refreshFunction = $interval(function () {
      var durationObj = shiftService.durationParams();
      shiftService.updateData($scope.content.subMenu.SubMenuExtID, durationObj, true);
      $rootScope.$broadcast("shiftChange", {});
    }, PRODUCTION_FLOOR.DASHBOARD_REFRESH_TIME);
    $scope.$on("$destroy", function () {
      $interval.cancel(refreshFunction);
    });

    $scope.editTemplate = function (mode) {
      $modal
        .open({
          windowClass: "editTemplatesModal",
          template: '<templates-directive mode="mode" dashboard-type="dashboardType" load-template="loadTemplate" canvas-class="canvasClass"' + ' containers="containers" close-modal="closeModal"></templates-directive>',
          controller: function ($scope, $modalInstance, shiftService) {
            $scope.mode = mode;
            $scope.dashboardType = 2;
            $scope.containers = shiftService.machineContainers;
            $scope.canvasClass = ".machine-dashboard";
            $scope.loadTemplate = shiftService.loadNewTemplateMachine;

            $scope.closeModal = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function () { });
    };
  };

  function machinePendingJobs($scope, actionItem) {
    var ID = $scope.content == undefined ? $scope.ID : $scope.content.ID;
    var upperScope = $scope;
    var pedingJobsInstance = $modal
      .open({
        templateUrl: "views/custom/machine/pendingJobs.html",
        controller: function ($scope, $compile, $modalInstance, LeaderMESservice, $sessionStorage, $localStorage) {
          var pendingJobsInstanceCtrl = this;
          $localStorage.upperScopeData = upperScope.content == undefined ? upperScope : upperScope.content;
          $localStorage.machineActionItem = actionItem;
          pendingJobsInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
          var params = upperScope.content === undefined ? (upperScope && upperScope.params || {}) : (upperScope && upperScope.content && upperScope.content.params || {});
          $scope.machineName = pendingJobsInstanceCtrl.localLanguage ? params.MachineLname : params.MachineEName;
          if (upperScope.content === undefined) {
            $localStorage.requireMaterialVerficationOnJobActivation = upperScope.targetParameters.RequireMaterialVerficationOnJobActivation;
          } else {
            $localStorage.requireMaterialVerficationOnJobActivation = params.RequireMaterialVerficationOnJobActivation === undefined ? upperScope.content.targetParameters.RequireMaterialVerficationOnJobActivation : params.RequireMaterialVerficationOnJobActivation;
          }

          $scope.rowClicked = function (IDs) {
            if (actionItem.updateData) {
              actionItem.updateData();
            }
            $modalInstance.close(1);
          };
          $scope.searchResultsRequest = {
            data: {
              functionCallBack: null,
              onlyNewTab: true,
              returnValue: false,
              openSearchInNewTab: false,
              removeSelectOption: false,
              activateJob: true,
              multiSelect: false,
            },
            request: {
              MachineID: ID,
            },
            api: "GetJobsListForMachine",
          };
          $scope.$on("closePendingJobs", function () {
            $modalInstance.close();
          });

          pendingJobsInstanceCtrl.close = function () {
            $modalInstance.close();
            googleAnalyticsService.gaEvent("Department_Online", "refresh");
          };
        },
        controllerAs: "pendingJobsInstanceCtrl",
      })
      .result.then(function (data) {
        if (data) {
          //refresh data
          console.log("refresh data");
        }
      });
  }

  return {
    machineTypeCode: machineTypeCode,
    machineProcessControl: machineProcessControl,
    machineDashboardCode: machineDashboardCode,
    machinePendingJobs: machinePendingJobs,
  };
});
