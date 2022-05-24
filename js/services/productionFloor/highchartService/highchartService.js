
angular.module("LeaderMESfe").factory("highchartService", function ($filter, LeaderMESservice, $localStorage, $sessionStorage, insightService, $modal) {
  var interactiveFilterProduct = ["151", "152", "33", "19", "158", "23"];
  var interactiveFilterMold = ["153", "154", "21", "159", "33"];

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var convertToHours = function(number,selectArg){
      if (selectArg == "2348" || selectArg == "2349") {
        return $filter('getDurationInHoursMinutes')(number)
      } 
      else
      {
        return number
      }
  }

  var isLegendsEvent = function(id){
    return ["115","124","135","65","140","131"].includes(id)
  }
  var isLegendsEventGroup = function(id){
    return  ["117","125","123","120","132"].includes(id)
  }
  var isLegendsMachines = function(id){
    return  ["215"].includes(id)
  }
  var legendsWithEvents = function(dataInfo){
      if(isLegendsEvent(dataInfo.insight?.ID) || isLegendsEventGroup(dataInfo.insight?.ID) || isLegendsMachines(dataInfo.insight?.ID)){
        if(!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight?.ID])
        {
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight?.ID]={}
        }
        if(!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight?.ID].legendForEvents){
          $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight?.ID].legendForEvents = []
        }
        _.forEach(dataInfo.series,function(serie){
            var legendIndex = _.findIndex($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents,{id:serie[dataInfo.legendsType]})
            if(legendIndex < 0){
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents.push({id:serie[dataInfo.legendsType],visiblity:true})
            }
        })
      }else{
        return false;
      }
      return true;
  }

  var initLegends = function(series,legend){
    if(series && series[0] && series[0].data){
      series[0].data.forEach(function (series) {
        legend.push(series.visible);
      });
    }
    else{
      series.forEach(function (series) {
        legend.push(series.visible);
      });
    }
  }
  
  var prepareLabel =  function(value,categoryLength,containerSize){
      if(_.isNumber(value))
      {
        value = value.toString()
      }
      if(!_.isNumber(value) && value.split(' ').length > 1){
        return {
          toolTip:value,
          value:value,
          style: "white-space: normal"
        }
      }
      else
      {
        if(!_.isNumber(value) && value.length > 8 && categoryLength > 7 && containerSize != 12){
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

  function getDateRangeOfWeek(number, type, dataInfo) {
    var date = {},
      start,
      end,
      diff;

    if (type == "Days") {
      //i swap between month and days because we changed the view of the dates.
      var dateString = number;
      dateString = dateString?.substr(6, 4)+"-"+dateString?.substr(3, 2)+"-"+dateString?.substr(0, 2); 
      date.endDate = moment(dateString).startOf("day");
      date.days = 0;
      return date;
    }

    if (type == "Weeks") {
      start = moment(moment().year() + "")
        .day("Sunday")
        .add(number, type)
        .startOf("day");
    } else {
      start = moment(moment().year() + "")
        .add(number, type)
        .startOf("day");
    }
    if (type == "Months") {
      end = moment(moment().year() + "")
        .add(number, type)
        .endOf(type)
        .startOf("day");
    } else {
      end = moment(moment().year() + "")
        .add(number, type)
        .endOf(type)
        .subtract(1, "days")
        .startOf("day");
    }
    date.startDate = start < dataInfo.pickerDate.startDate ? dataInfo.pickerDate.startDate : start;
    date.endDate = end < dataInfo.pickerDate.endDate ? end : dataInfo.pickerDate.endDate;
    diff = date.endDate.diff(date.startDate, "days");
    date.days = diff;
    
    return date;
  }

  const changeOpacityRGBA = (oldColor, opacity) => {
    return oldColor.replace(/[^,]+(?=\))/, opacity);
  };

  function initInsightStates() {
    if (!$localStorage.insightStates) {
      $localStorage.insightStates = {};
    }
    if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
      $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
    }
  }

  const printHighchart = (dataInfo, type) => {    
    $(".diplay-department-name").css("display", "inline-block");
    var className =dataInfo.insight===""? `.printHeatMapShift${dataInfo?.graph?.ID}`: `.print${dataInfo?.insight?.ID}`;
    var resourceElement = $(className);   
    var namePDF =dataInfo.insight===""?dataInfo?.graph?.name+ "-" + dataInfo?.graph?.ID :  dataInfo?.insight?.Name + "-" + dataInfo?.insight?.ID;
    if(resourceElement.length===0){
      className=`.printHeatMapShift${dataInfo?.graph?.ID}`;
      resourceElement=$(className);
      namePDF=dataInfo?.graph?.name+ "-" + dataInfo?.graph?.ID;
    }   
    resourceElement.css("height", "");
    html2canvas($(className)[0]).then(function (canvas) {
      var image = document.createElement("img");
      image.onload = function () {
        var canvas2 = document.createElement("canvas");
        var ctx2 = canvas2.getContext("2d");
        canvas2.width = $(className).width();
        canvas2.height = $(className).height();
        ctx2.drawImage(this, 0, 0, canvas2.width, canvas2.height);
      };
      image.src = canvas.toDataURL("image/png");
      let jpeg = canvas.toDataURL("image/jpeg");
      let link = document.createElement("a");
      link.download = "/image.jpeg";
      link.href = jpeg;
      if (type == "pdf") {
        var doc = new jsPDF("L", "px", [$(className).width(), 1000]);
        doc.addImage(jpeg, "JPEG", 0, 0, $(className).width(), $(className).height());
        doc.save(`${namePDF ? namePDF : "simple-file"}.pdf`);
      } else {
        resourceElement.append(link);
        link.click();
        link.remove();
      }
      $(".diplay-department-name").css("display", "none");
    });
  };

  var buildLineGraph = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      chart: {
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();
            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      title: {
        text: "",
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ',',
        },

        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      subtitle: {
        text: "",
      },
      navigation: {
        buttonOptions: {
          verticalAlign: "top",
          y: -10,
        },
      },
      xAxis: {
        title: {
          text: dataInfo.insight.XAxisName,
        },
        labels: {
          useHTML: true,
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            color: "#000000",
            fontSize: "13px",
          },
          rotation: dataInfo.categoriesGroup ? 0 : undefined,
        },
        categories: dataInfo.categories,
      },
      tooltip: {
        useHTML: true,
        outside: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
        },
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + numberWithCommas(parseFloat(this.y.toFixed(2))) + "k" + "<br/>";
          } else if (dataInfo.toolTip == 2) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + parseFloat(this.y.toFixed(2)) + "<br/>";
          } else if (dataInfo.toolTip == 3) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + parseFloat(this.y.toFixed(2)) + "<br/>";
          } else if (dataInfo.toolTip == 4) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + $filter("getDurationInHrMin")(this.y) + "<br/>";
          } else if (dataInfo.toolTip == 5) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + parseFloat(this.y.toFixed(2)) + "<br/>";
          } else if (dataInfo.toolTip == 6) {
            return "<b>" + this.series.name + "</b><br>" + this.x + ": " + parseFloat((this.y * 100).toFixed(1)) + "%<br/>";
          }
          else if (dataInfo.toolTip == 7) {
            return "<b>" + this.series.name + "</b><br>" + this.x?.userOptions?.name + " " + this.x?.userOptions?.shiftStartTime + ": " + parseFloat((this.y * 100).toFixed(1)) + "%<br/>";
          }
          else if (dataInfo.toolTip == 8) {
            return "<b>" + this.series.name + "</b><br>" + this.x?.userOptions?.name + " " + this.x?.userOptions?.shiftStartTime + ": " + parseFloat(this.y.toFixed(2)) + "<br/>";
          }
        },
      },
      yAxis: {
        title: {
          text: dataInfo.insight.YAxisName,
        },
        labels: {
          useHTML: true,
          style: {
            direction: localLanguage ? "rtl" : "ltr",
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          formatter: function () {
            if (dataInfo.label == 1) {
              return this.value;
            } else if (dataInfo.label == 2) {
              return numberWithCommas(parseFloat(this.value.toFixed(2))) + "k";
            } else if (dataInfo.label == 3) {
              return $filter("getDurationInHrMin")(this.value);
            } else if (dataInfo.label == 4) {
              return parseFloat((this.value * 100).toFixed(1)) + "%";
            }
          },
        },
        min: dataInfo.min,
        max: dataInfo.max,
        tickInterval: dataInfo.tickInterval,
      },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        x: 0,
        useHTML: true,
        y: 0,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      plotOptions: {
        series: {
          dataLabels: {
            useHTML: true,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            enabled: dataInfo.dataLabelEnable,
            formatter: function () {
              if (dataInfo.toolTip == 1) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2))) + "k"}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2))) + "k"}</span>`;
                }
              } else if (dataInfo.toolTip == 2) {
                if (dataInfo.shiftInsight || dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 3) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 4) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 5) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span   style="color:#000000;font-size:13px" >${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 6) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                }
              }else if (dataInfo.toolTip == 7) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                }
              }
              else if (dataInfo.toolTip == 8) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span style="color:#000000;font-size:13px" >${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              }
            },
          },
          marker: {
            enabled: true,
            symbol: "circle",
            radius: 3.4,
          },
          events: {
            legendItemClick: function () {
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            },
          },
        },
      },
      series: dataInfo.series,
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
                useHTML: true,
                style: {
                  direction: localLanguage ? "rtl" : "ltr",
                  fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
                },
              },
            },
          },
        ],
      },
    };
  };

  var buildPieChart = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      colors: dataInfo.colors,
      chart: {
        borderColor: "#EBBA95",
        borderWidth: 0,
        type: "pie",
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            // If there is no legend items visibility flags saved in local storage, save them.
            initInsightStates();
            if(legendsWithEvents(dataInfo)){
              let legends = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents;
              legends.forEach(function (legend, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[0]) && !_.isEmpty(series[0].points)) {
                  var objSearch = {}
                  objSearch[dataInfo.legendsType] = legend.id;
                  var legendFound = _.find(series[0].points,objSearch)
                  if(legendFound){
                    legendFound.update({
                      visible: legend.visiblity,
                    });
                  }
                }
              });
              return;
            }

            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[0]) && !_.isEmpty(series[0].points) && !_.isEmpty(series[0].points[i])) {
                  series[0].points[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      title: {
        text: "",
      },

      legend: {
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      tooltip: {
        useHTML: true,
        outside: true,
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.point.y) + "<br />" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(this.percentage.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 2) {
            return "<b>" + this.key + "<b>: " + $filter("minutesToHH")(this.point.y) + "<br><b>" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(this.percentage.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 3) {
            return "<b>" + this.key + "<b>: " + this.point.y + "<br><b>" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(this.percentage.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 4) {
            return "<b>" + this.key + "<b>: " + this.point.y;
          } else if (dataInfo.toolTip == 5) {
            return "<b>" + this.key + "<b>: " + $filter("minutesToHH")(this.point.y);
          } else if (dataInfo.toolTip == 6) {
            return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.point.y) + "<br><b>" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(this.percentage.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 7) {
            return "<b>" + this.key + "<b>: " + parseFloat(this.point.y.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 8) {
            return "<b>" + this.key + "<b>: " + parseFloat(this.point.y.toFixed(2));
          } else if (dataInfo.toolTip == 9) {
            return "<b>" + this.key + "<b>: " + this.point.y + "<br><b>" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(this.percentage.toFixed(2)) + "%";
          }
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          point: {
            events: {
              legendItemClick: function () {
                if(legendsWithEvents(dataInfo)){
                  
                  var legend = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents,{id:this[dataInfo.legendsType]})
                  if(legend){
                    legend.visiblity = !legend.visiblity
                  }
                }
                else
                {
                  var index = this.index;
                  var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
                  var legendBooleans = [];
                  legend.forEach(function (elem) {
                    var isTrueSet = elem === "true";
                    legendBooleans.push(isTrueSet);
                  });
                  // toggle series visibility flag and override it in local storage
                  legendBooleans[index] = !legendBooleans[index];
                  $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
                }
              },
            },
          },
          dataLabels: {
            useHTML: true,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            enabled: dataInfo.dataLabelEnable,
            formatter: function () {
              if (dataInfo.toolTip == 2 || dataInfo.toolTip == 3 || dataInfo.toolTip == 1) {
                if (dataInfo.shiftInsight) {
                  return parseFloat(this.percentage.toFixed(2)) + "%";
                } else if (dataInfo.insightsColorText && dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.percentage.toFixed(2)) + "%"}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.percentage.toFixed(2)) + "%"}</span>`;
                }
              } else if (dataInfo.toolTip == 4) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${this.point.y}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${this.point.y}</span>`;
                }
              } else if (dataInfo.toolTip == 5) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.point.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.point.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 6) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.percentage.toFixed(2)) + "%"}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.percentage.toFixed(2)) + "%"}</span>`;
                }
              } else if (dataInfo.toolTip == 7) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.point.y.toFixed(2)) + "%"}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.point.y.toFixed(2)) + "%"}</span>`;
                }
              } else if (dataInfo.toolTip == 8 || dataInfo.toolTip == 9) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${this.point.y}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${this.point.y}</span>`;
                }
              }
            },
          },
          showInLegend: true,
        },
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      series: [
        {
          colorByPoint: true,
          data: dataInfo.series,
        },
      ],
    };
  };
  var buildBasicBarChart = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      chart: {
        type: "bar",
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();

            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      title: {
        text: "",
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          useHTML: true,
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                useHTML: true,
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                useHTML: true,
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
                },
              },
              {
                textKey: "downloadCSV",
                useHTML: true,
                onclick: function () {
                  this.downloadCSV();
                },
              },
            ],
          },
        },
      },
      xAxis: {
        type: "category",
        labels: {
          useHTML: true,
          formatter: function () {
            return this.value;
          },
          useHTML: true,
          style: {
            color: "#000000",
            fontSize: "13px",
          },
        },
        categories: dataInfo.categories,
      },
      yAxis: {
        min: 0,
        title: {
          text: dataInfo.insight.yAxis,
          useHTML: true,
        },
        useHTML: true,
        labels: {
          useHTML: true,
          formatter: function () {
            if (dataInfo.formatter == 1) {
              return numberWithCommas(parseFloat(this.value.toFixed(2)));
            } else if (dataInfo.formatter == 2) {
              return $filter("getDurationInHrMin")(this.value);
            } else if (dataInfo.formatter == 3) {
              return $filter("getDurationInHrMin")(this.value);
            }
          },
          overflow: "justify",
          style: {
            color: "#000000",
            fontSize: "13px",
          },
        },
        max: dataInfo.max,
        min: dataInfo.min,
      },
      legend: {
        enabled: dataInfo.legend,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      plotOptions: {
        useHTML: true,
        column: {
          useHTML: true,
          stacking: dataInfo.stacking,
        },
        series: {
          stacking: dataInfo.stackingSeries,
          useHTML: true,
          style: {
            direction: localLanguage ? "rtl" : "ltr",
          },
          events: {
            legendItemClick: function () {
              var series = this.chart.series;
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            },
          },
          dataLabels: {
            enabled: dataInfo.dataLabelEnable,
            useHTML: true,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            formatter: function () {
              if (dataInfo.toolTip == 1) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 2) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 3) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 4) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                }
              }
            },
          },
        },
      },
      tooltip: {
        useHTML: true,
        followTouchMove: true,
        followPointer: true,
        outside: true,
        backgroundColor: "rgba(246, 246, 246, 1)",
        borderColor: "#bbbbbb",
        style: {
          opacity: 1,
          background: "rgba(246, 246, 246, 1)",
        },
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<span>" + this.key + ": </span><b>" + `${numberWithCommas(parseFloat(this.y.toFixed(2)))}` + "</b><br/>";
          } else if (dataInfo.toolTip == 2) {
            return "<span>" + this.key + ": </span><b>" + numberWithCommas(parseFloat(this.y.toFixed(2))) + "</b><br/>";
          } else if (dataInfo.toolTip == 3) {
            return "<span>" + this.key + ": </span><b>" + $filter("minutesToHH")(this.y) + "</b><br/>";
          } else if (dataInfo.toolTip == 4) {
            return "<span>" + this.key + ": </span><b>" + $filter("getDurationInHrMin")(this.y) + "</b><br/>";
          }
        },
        shape: "rect",
      },
      credits: {
        enabled: false,
        useHTML: true,
      },
      series: dataInfo.series,
    };
  };

  var buildStackedBarChart = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      chart: {
        type: "bar",
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();

            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      title: {
        text: "",
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      xAxis: {
        type: "category",
        labels: {
          formatter: function () {
            return this.value;
          },
          useHTML: true,

          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            color: "#000000",
            fontSize: "13px",
          },
        },
        categories: dataInfo.categories,
      },
      yAxis: {
        min: 0,
        title: {
          text: dataInfo.insight.yAxis,
        },
        labels: {
          formatter: function () {
            if (dataInfo.formatter == 1) {
              return numberWithCommas(parseFloat(this.value.toFixed(2)));
            } else if (dataInfo.formatter == 2) {
              return $filter("minutesToHH")(this.value);
            } else if (dataInfo.formatter == 3) {
              return $filter("getDurationInHrMin")(this.value);
            }
          },
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          overflow: "justify",
        },
        useHTML: true,
        max: dataInfo.max,
        min: dataInfo.min,
      },
      legend: {
        enabled: dataInfo.legend,
        useHTML: true,

        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      plotOptions: {
        column: {
          stacking: dataInfo.stacking,
        },
        series: {
          stacking: "normal",
          useHTML: true,
          events: {
            legendItemClick: function () {
              var series = this.chart.series;
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            },
          },
          style: {
            direction: localLanguage ? "rtl" : "ltr",
          },
          dataLabels: {
            enabled: dataInfo.dataLabelEnable,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            formatter: function () {
              if (dataInfo.toolTip == 1) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 2) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 3) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 4) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                }
              }
            },
          },
        },
      },
      tooltip: {
        useHTML: true,
        followTouchMove: true,
        followPointer: true,
        outside: true,
        backgroundColor: "rgba(246, 246, 246, 1)",
        borderColor: "#bbbbbb",
        style: {
          opacity: 1,
          background: "rgba(246, 246, 246, 1)",
        },
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<span>" + this.key + ": </span><b>" + `${numberWithCommas(parseFloat(this.y.toFixed(2)))}` + "</b><br/>";
          } else if (dataInfo.toolTip == 2) {
            return "<span>" + this.key + ": </span><b>" + numberWithCommas(parseFloat(this.y.toFixed(2))) + "</b><br/>";
          } else if (dataInfo.toolTip == 3) {
            return "<span>" + this.key + ": </span><b>" + $filter("minutesToHH")(this.y) + "</b><br/>";
          } else if (dataInfo.toolTip == 4) {
            return "<span>" + this.key + ": </span><b>" + $filter("getDurationInHrMin")(this.y) + "</b><br/>";
          }
        },
        shape: "rect",
      },
      credits: {
        enabled: false,
      },
      series: dataInfo.series,
    };
  };
  var buildHeatMapChart = function (dataInfo) {
    var duplicateID;
    if (!dataInfo.insight.ID?.toString().includes("D")) {
      duplicateID = dataInfo.insight.ID.toString();
    } else {
      duplicateID = dataInfo.insight.ID.toString().substring(0, dataInfo.insight.ID.toString().indexOf("D"));
    }
    var localLanguage = LeaderMESservice.showLocalLanguage();

    if (duplicateID == 239) {
      _.map(dataInfo.series, function (info) {
        if (info.result == 0) { info.color = "rgba(255,255,255,1)" }
      })
    }

    return {
      chart: {
        type: "heatmap",
        plotBorderWidth: 1,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      rangeSelector : {
        selected : 1,
        inputEnabled: $(`insight-id${dataInfo.insight.ID}`).width() > 480
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  if (!dataInfo.isShift) {
                    var height;
                    $(".diplay-department-name").css("display", "inline-block");
                    height = $(".shiftContainerGraphPrint").height();
                    $(".shiftContainerGraphPrint").css("height", "100%");
                  }
                  var className = dataInfo.isShift ? `.printHeatMapShift${dataInfo.ID}` : `.print${dataInfo.insight.ID}`;
                  var resourceElement = $(className);
                  resourceElement.css("height", "");
                  html2canvas($(className)[0]).then(function (canvas) {
                    var image = document.createElement("img");
                    image.onload = function () {
                      var canvas2 = document.createElement("canvas");
                      var canvas2 = document.createElement("canvas");
                      var ctx2 = canvas2.getContext("2d");
                      canvas2.width = $(className).width();
                      canvas2.height = $(className).height();
                      ctx2.drawImage(this, 0, 0, canvas2.width, canvas2.height);
                    };
                    image.src = canvas.toDataURL("image/png");
                    let jpeg = canvas.toDataURL("image/jpeg");
                    let link = document.createElement("a");
                    link.download = "/image.jpeg";
                    link.href = jpeg;

                    resourceElement.append(link);
                    link.click();
                    link.remove();
                    if (!dataInfo.isShift) {
                      $(".shiftContainerGraphPrint").css("height", height);
                      $(".diplay-department-name").css("display", "none");
                    }
                  });
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
                },
              },
              {
                textKey: "downloadCSV",
                onclick: function () {
                  const rows = [];
                  let row = [];
                  let count = 0;
                  var cell;
                  for (let i = 0; i < dataInfo.categoriesY.length; i++) {
                    for (let j = 0; j < dataInfo.categoriesX.length; j++) {
                      cell = _.find(dataInfo.series, { x: j, y: i });       
                      if (cell.numberOfJoshes){
                        row.push(`${cell?.data} (${cell?.dataTarget}) (${cell?.numberOfJoshes})`);
                      }
                      else{
                        row.push(cell?.result?.split(',')?.join(''));
                      }
                    }
                    if (dataInfo.categoriesY[count++].indexOf(',') >= 0) {
                      rows.unshift([`"${dataInfo.categoriesY[count++]}"`, ...row]);
                    }
                    else {
                      rows.unshift([dataInfo.categoriesY[count++], ...row]);
                    }
                    row = [];
                  }
                  rows.unshift(["", ...dataInfo.categoriesX]);

                  let csvContent = "data:text/plain;charset=UTF-8," + String.fromCharCode(0xFEFF) +  rows.map((e) => e.join($sessionStorage.exportCSVDelimiter || ',')).join("\n");
                  var encodedUri = encodeURI(csvContent);
                  var link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "HeatMap.csv");
                  document.body.appendChild(link);
                  link.click();
                },
              },
            ],
          },
        },
      },
      title: {
        text: "",
      },
      colorAxis: {
        min: 0,
        minColor: "#FFFFFF",
        maxColor: "#18b515",
      },
      xAxis: [
        {
          categories: [],
          visible: false,
        },
        {
          categories: dataInfo.categoriesX,
          linkedTo: 0,
          opposite: true,
          gridLineWidth: 0.3,
          labels: {
            useHTML: true,
            rotation: 0,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            formatter: function () {
              if (this?.value?.length > 8 && dataInfo.idX!= "Day" ) {
                return `<span title="${this.value}" style="white-space: break-spaces;">${this.value}</span>`;
              }
              return `<span title="${this.value}">${this.value}</span>`;
            },
          },
        },
      ],
      yAxis: {
        categories: dataInfo.categoriesY,
        title: null,
        reversed: false,
        useHTML: true,
        gridLineWidth: 0.3,
        labels: {
          useHTML: true,
          style: {
            direction: localLanguage ? "rtl" : "ltr",
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          formatter: function () {
            if (typeof this.value == "number" && this.pos == this.value) {
              return;
            }
            return `<span title="${this.value}">${this.value}</span>`;
          },
        },
      },
      accessibility: {
        point: {},
      },

      colorAxis: {
        min: 0,
        minColor: "#FFFFFF",
        maxColor: "#18b515",
      },

      legend: {
        align: "right",
        layout: "vertical",
        margin: 0,
        verticalAlign: "top",
        y: 25,
        symbolHeight: 280,
        enabled: !dataInfo.colors,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },

      tooltip: {
        useHTML: true,
        outside: true,
        formatter: function () {
          if (dataInfo.tooltip == 2) {
            return `<div class="machinesLoadToolTip">
            <b>${dataInfo.x}:</b> ${dataInfo.categoriesX[this.point?.x]} ${this.point.shiftStartTimeX ? this.point.shiftStartTimeX:''}</br>
            <b>${dataInfo.y}:</b> ${dataInfo.categoriesY[this.point?.y]} ${this.point.shiftStartTimeY ? this.point.shiftStartTimeY : ''}</br>
            <b>${$filter("translate")("VALUE2")}:</b> ${this.point.data != null ? parseFloat(this.point.data.toFixed(2)) + "%" : null}</br>
            <b>${$filter("translate")("TARGET")}:</b> ${this.point.dataTarget != null ? parseFloat(this.point.dataTarget?.toFixed(2)) + "%" : null}</br>
            <b>${$filter("translate")("NUMBER_OF_JOSHES")}:</b> ${this.point.numberOfJoshes != null ? this.point.numberOfJoshes: null}</br>`;
          } else  if (dataInfo.tooltip == 3) {
            return `<div class="machinesLoadToolTip">
            <b>${dataInfo.x}:</b> ${dataInfo.categoriesX[this.point?.x]} ${this.point.shiftStartTimeX ? this.point.shiftStartTimeX:''}</br>
            <b>${dataInfo.y}:</b> ${dataInfo.categoriesY[this.point?.y]} ${this.point.shiftStartTimeY ? this.point.shiftStartTimeY : ''}</br>
            <b>${$filter("translate")("VALUE2")}:</b> ${this.point.data != null ? parseFloat(this.point.data.toFixed(2)): null}</br>
            <b>${$filter("translate")("TARGET")}:</b> ${this.point.dataTarget != null ? parseFloat(this.point.dataTarget?.toFixed(2)): null}</br>
            <b>${$filter("translate")("NUMBER_OF_JOSHES")}:</b> ${this.point.numberOfJoshes != null ? this.point.numberOfJoshes: null}</br>`;
          } else  if (dataInfo.tooltip == 4) {
            return `<div class="machinesLoadToolTip">
            <b>${dataInfo.x}:</b> ${dataInfo.categoriesX[this.point?.x]}</br>
            <b>${dataInfo.y}:</b> ${dataInfo.categoriesY[this.point?.y]}</br>
            <b>${$filter("translate")("VALUE2")}:</b> ${this.point.data != null ? parseFloat(this.point.data): null}</br>
            <b>${$filter("translate")("TARGET")}:</b> ${this.point.dataTarget != null ? parseFloat(this.point.dataTarget): null}</br>`;
          } else  if (dataInfo.tooltip == 5) {
            return `<div class="machinesLoadToolTip">
            <b>${dataInfo.x}:</b> ${dataInfo.categoriesX[this.point?.x]}</br>
            <b>${dataInfo.y}:</b> ${dataInfo.categoriesY[this.point?.y]}</br>
            <b>${$filter("translate")("VALUE2")}:</b> ${this.point.data != null ? convertToHours(this.point.data,dataInfo.insight.selectedArg3.key): null}</br>
            <b>${$filter("translate")("TARGET")}:</b> ${this.point.dataTarget != null ? convertToHours(this.point.dataTarget,dataInfo.insight.selectedArg3.key): null}</br>`;
          }else{
            return `<div class="machinesLoadToolTip">
            <b>${dataInfo.x}:</b> ${dataInfo.categoriesX[this.point?.x]}</br>
            <b>${dataInfo.y}:</b> ${dataInfo.categoriesY[this.point?.y]}</br>
            <b>${$filter("translate")("UNITS_PRODUCED")}:</b> ${parseFloat(this.point.UnitsProducedOK?.toFixed(2))}</br>
            <b>${$filter("translate")("THEORETICAL_UNITS")}:</b> ${parseFloat(this.point.UnitsProducedTheoretically?.toFixed(2))}</br>
            <b>${$filter("translate")("PERFORMANCE_PERCENTAGE")}:</b>${parseInt(this.point.UnitsRatio * 100)}%</div>`;
          }
        },
      },
      series: [
        {
          turboThreshold: 0,
          name: "",
          allowOverlap: false,
          borderWidth: 0.3,
          borderColor: "gray",
          data: dataInfo.series,
          useHTML: true,
          dataLabels: {
            enabled: true,
            useHTML: true,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            formatter: function () {
              let data = "";
              data = this.point.result;
              var getCell = $(`.insight-id${dataInfo.graph?.ID}`).find('.highcharts-point')
              if(getCell && getCell.length > 0 && getCell[0].width?.animVal?.value > 100  && getCell[0].height?.animVal?.value > 59)
              {
                var fontSize = "17px"
              }         
              if (this.color) {
                const fontColor = LeaderMESservice.getBWByColor(this.color,186,0.75);
                if (data) {
                  if(fontSize){
                    return `<span style="color:${fontColor};font-size:${fontSize}">${$filter("thousandsSeperator")(data)}</span>`;
                  }
                  else
                  {
                    return `<span style="color:${fontColor};">${$filter("thousandsSeperator")(data)}</span>`;
                  }
                }
              } else {
                return `<span style="font-size:${fontSize}">${data}</span>`;
              }
            },
          },
        },
      ],
      plotOptions: {
        series: {
          dataLabels: {
            overflow: 'none',
            crop: true,
            enabled: true,
            style: {
              fontWeight: 'normal'
            }
          },
          cursor:duplicateID == 237 || duplicateID==239 ?  'pointer' : null,
          point: {
            events: {
              click: function () {
               
                if (duplicateID != 237 && duplicateID != '239') return;
                dataInfo.eventClick = this;
                $modal.open({
                  templateUrl: "views/custom/productionFloor/common/insight.html",
                  controller: function ($scope, $compile, $modalInstance) {
                    $scope.pageID = $sessionStorage.stateParams.subMenu.SubMenuExtID;
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

                    var date;
                    if (dataInfo.categoriesXName == "Day") {
                      date = getDateRangeOfWeek(dataInfo.categoriesX[dataInfo.eventClick.x], "Days", dataInfo);
                    }
                    if (dataInfo.categoriesYName == "Day") {
                      date = getDateRangeOfWeek(dataInfo.categoriesY[dataInfo.eventClick.y], "Days", dataInfo);
                    }
                    if (dataInfo.categoriesXName == "Week") {
                      date = getDateRangeOfWeek(dataInfo.categoriesXID[dataInfo.eventClick.x] - 1, "Weeks", dataInfo);
                    }
                    if (dataInfo.categoriesYName == "Week") {
                      date = getDateRangeOfWeek(dataInfo.categoriesYID[dataInfo.eventClick.y] - 1, "Weeks", dataInfo);
                    }

                    if (dataInfo.categoriesXName == "Month") {
                      date = getDateRangeOfWeek(dataInfo.categoriesXID[dataInfo.eventClick.x] - 1, "Months", dataInfo);
                    }

                    if (dataInfo.categoriesYName == "Month") {
                      date = getDateRangeOfWeek(dataInfo.categoriesYID[dataInfo.eventClick.y] - 1, "Months", dataInfo);
                    }

                    if (dataInfo.categoriesXName == "MachineName") {
                      getFilterBy("MachineIdFilter", filterBy, dataInfo.categoriesXID[dataInfo.eventClick.x]);
                    }
                    if (dataInfo.categoriesYName == "MachineName") {
                      getFilterBy("MachineIdFilter", filterBy, dataInfo.categoriesYID[dataInfo.eventClick.y]);
                    }
                    if (dataInfo.categoriesXName == "WorkerName") {
                      getFilterBy("UserIdFilter", filterBy, dataInfo.categoriesXID[dataInfo.eventClick.y] + "");
                    }
                    if (dataInfo.categoriesYName == "WorkerName") {
                      getFilterBy("UserIdFilter", filterBy, dataInfo.categoriesYID[dataInfo.eventClick.y] + "");
                    }
                    if (dataInfo.categoriesXName == "ShiftName") {
                      getFilterBy("ShiftNameFilter", filterBy, dataInfo.categoriesX[dataInfo.eventClick.x]);
                    }
                    if (dataInfo.categoriesYName == "ShiftName") {
                      getFilterBy("ShiftNameFilter", filterBy, dataInfo.categoriesY[dataInfo.eventClick.y]);
                    }
                    if (dataInfo.categoriesYName == "ProductName") {
                      getFilterBy("ProductIdFilter", filterBy, dataInfo.categoriesYID[dataInfo.eventClick.y] + "");
                    }
                    if (dataInfo.categoriesXName == "ProductName") {
                      getFilterBy("ProductIdFilter", filterBy, dataInfo.categoriesXID[dataInfo.eventClick.x] + "");
                    }
                    if (dataInfo.categoriesXName == "DisplayName") {
                      getFilterBy("UserIdFilter", filterBy, dataInfo.categoriesXID[dataInfo.eventClick.x] + "");
                    }
                    if (dataInfo.categoriesYName == "DisplayName") {
                      getFilterBy("UserIdFilter", filterBy, dataInfo.categoriesYID[dataInfo.eventClick.y] + "");
                    }
                    if (dataInfo.categoriesXName == "ShiftTypeName") {
                      getFilterBy(
                        "ShiftNameFilter",
                        filterBy,
                        _.filter($sessionStorage.insightData[$scope.pageID].filters.ShiftDef, function (shift) {
                          return shift.ShiftTypeName == dataInfo.categoriesXID[dataInfo.eventClick.x];
                        }).map(function (shift) {
                          return shift.ShiftName;
                        })
                      );
                    }
                    if (dataInfo.categoriesYName == "ShiftTypeName") {
                      getFilterBy(
                        "ShiftNameFilter",
                        filterBy,
                        _.filter($sessionStorage.insightData[$scope.pageID].filters.ShiftDef, function (shift) {
                          return shift.ShiftTypeName == dataInfo.categoriesYID[dataInfo.eventClick.y];
                        }).map(function (shift) {
                          return shift.ShiftName;
                        })
                      );
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
                                parentInsightID:dataInfo.insight.ID,
                                IsCompare: false,
                                IsInFactoryLevel: false,
                                LName: "Date Range []",
                                LValue: 0,
                                MergePC: false,
                                filterByModel: filterBy,
                                Name: "GetCompleteShiftDetails",
                                newDate: date,
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
                              heatMapColors:dataInfo.heatMapColors,
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
              },
            },
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
              yAxis: {
                useHTML: true,
                labels: {
                  formatter: function () {
                    return this.value;
                  },
                },
              },
            },
          },
        ],
      },
    };
  };

  var buildWaterFallChart = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      chart: {
        type: "waterfall",
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();
            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },

      title: {
        text: "",
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      plotOptions: {
        series: {
          events: {
            legendItemClick: function () {
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            },
          },
        },
      },

      xAxis: {
        type: "category",
        text: dataInfo.insight.XAxisName,
        labels: {
          rotation:false,
          formatter: function () {
            if(!this.value) return;
            var obj = prepareLabel(typeof this.value == 'object' ? this.value.name : this.value,dataInfo.categories.length,dataInfo.graph?.options?.width )
            return `<div  title='${obj.toolTip}' style="${obj.style}">` + obj.value + "</div>";
          },
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            color: "#000000",
            fontSize: "13px",
          },
          useHTML: true,
        },
        categories: dataInfo.categories,
      },
      yAxis: {
        title: {
          text: dataInfo.insight.yAxis,
          useHTML: true,
        },

        labels: {
          useHTML: true,
          style: {
            direction: localLanguage ? "rtl" : "ltr",
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          formatter: function () {
            if (dataInfo.label == 1) {
              return $filter("getDurationInHrMin")(this.value);
            } else if (dataInfo.label == 2) {
              return this.value;
            }
          },
          overflow: "justify",
        },
      },

      legend: {
        enabled: false,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },

      tooltip: {
        outside: true,
        useHTML: true,
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            if (this.point.PEObject) {                
              if (this.point.index > 4 && this.series.data[5].y) {
                return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.y * this.point.sign) + "<br />" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(Math.abs((this.series.data[this.point.index].y / this.series.data[5].y) * 100).toFixed(2))+ "<br/>" + this.point?.unitsProducedOk?.name+": "+ $filter("thousandsSeperator")(this.point?.unitsProducedOk?.y < 100 ? parseFloat(this.point?.unitsProducedOk?.y)?.toFixed(2) : parseInt(this.point?.unitsProducedOk?.y))+ "<br/>" + this.point?.UnitsProducedTheoretically?.name+":"+ $filter("thousandsSeperator")(this.point?.UnitsProducedTheoretically?.y < 100 ? parseFloat(this.point?.UnitsProducedTheoretically?.y?.toFixed(2)) : parseInt(this.point?.UnitsProducedTheoretically?.y));
              } else {
                return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.y * this.point.sign) + "<br/>" + this.point.unitsProducedOk.name+": "+$filter("thousandsSeperator")(this.point?.unitsProducedOk?.y < 100 ? parseFloat(this.point?.unitsProducedOk?.y)?.toFixed(2) : parseInt(this.point?.unitsProducedOk?.y))+ "<br/>" + this.point?.UnitsProducedTheoretically?.name+":"+ $filter("thousandsSeperator")(this.point?.UnitsProducedTheoretically?.y < 100 ? parseFloat(this.point?.UnitsProducedTheoretically?.y?.toFixed(2)) : parseInt(this.point?.UnitsProducedTheoretically?.y));
              }  
            }
            if (this.point.index > 4 && this.series.data[5].y) {
              return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.y * this.point.sign) + "<br />" + $filter("translate")("PERCENTAGE") + ": " + parseFloat(Math.abs((this.series.data[this.point.index].y / this.series.data[5].y) * 100).toFixed(2));
            } else {
              return "<b>" + this.key + "<b>: " + $filter("getDurationInHrMin")(this.y * this.point.sign);
            }
          } else if (dataInfo.toolTip == 2) {
            return "<b>" + this.key + "<b>: " + parseFloat((this.y * this.point.sign).toFixed(2));
          }
        },
      },
      series: [
        {
          useHTML: true,
          upColor: Highcharts.getOptions().colors[2],
          color: Highcharts.getOptions().colors[3],
          data: dataInfo.series,
          dataLabels: [
            {
              style: {
                direction: localLanguage ? "rtl" : "ltr",
              },
              enabled: dataInfo.dataLabelEnable,
              inside: true,
              useHTML: true,
              formatter: function () {
                if (dataInfo.label == 1) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y * this.point.sign)}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y * this.point.sign)}</span>`;
                  }
                } else if (dataInfo.label == 2) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${parseFloat((this.y * this.point.sign).toFixed(2))}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat((this.y * this.point.sign).toFixed(2))}</span>`;
                  }
                }
              },
            },
            {
              enabled: dataInfo.dataLabelEnable,
              style: {
                direction: localLanguage ? "rtl" : "ltr",

                fontSize: "10px",
              },
              useHTML: true,
              y: -23,
              inside: false,
              formatter: function () {
                if (dataInfo.label == 1 && this.point.showPercentage && this.series.data[5].y) {
                  var percentage = Math.abs((this.series.data[this.point.index].y / this.series.data[5].y) * 100);
                  
                  
                  if (this.point.target >= 0) {
                    if (this.point.PEObject) {
                      color = this.point.target < percentage ? "green" : "red";
                      sign = this.point.target < percentage ? "+" : "-";
                    } else {
                      color = this.point.target > percentage ? "green" : "red";
                      sign = this.point.target > percentage ? "-" : "+";
                    }
                    return '<span style="background-color:' + color + ';color:white">' + `${sign}` + Math.abs(parseFloat((this.point.target - percentage).toFixed(2))) + "%" + "</span>";
                  }
                }
              },
            },
            {
              enabled: dataInfo.dataLabelEnable,
              y: -5,
              style: {
                direction: localLanguage ? "rtl" : "ltr",
                fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
                top: "10px",
              },
              useHTML: true,
              inside: false,
              formatter: function () {
                if (dataInfo.label == 1 && this.point.showPercentage && this.series.data[5].y) {
                  return parseFloat(Math.abs((this.series.data[this.point.index].y / this.series.data[5].y) * 100).toFixed(2)) + "%";
                }
              },
            },
          ],
          pointPadding: 0,
        },
      ],
    };
  };

  var buildBarChart = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      chart: {
        borderColor: "#EBBA95",
        borderWidth: 0,
        type: dataInfo.typeChart,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();

            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];             
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      title: {
        text: "",
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      navigation: {
        buttonOptions: {
          verticalAlign: "top",
          y: -10,
        },
      },
      xAxis: {
        type: "category",
        title: {
          text: "",
        },
        labels: {
          rotation: false,
          formatter: function () {
            if(!this.value) return;
            var obj = prepareLabel(typeof this.value == 'object' ? this.value.name : this.value,dataInfo.categories.length,dataInfo.graph?.options?.width )
            return `<div  title='${obj.toolTip}' style="${obj.style}">` + obj.value + "</div>";
          },
          useHTML: true,

          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            fontSize: "13px",
            color: "#000000",
          },
        },

        categories: dataInfo.categories,
      },
      yAxis: {
        title: {
          text: dataInfo.insight.yAxis,
        },
        labels: {
          formatter: function () {
            if (dataInfo.formatter == 1) {
              return parseFloat(this.value.toFixed(2));
            } else if (dataInfo.formatter == 2) {
              return $filter("minutesToHH")(this.value);
            } else if (dataInfo.formatter == 3) {
              return this.value + "%";
            } else if (dataInfo.formatter == 4) {
              return this.value * 100 + "%";
            }
          },
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
        },
        max: dataInfo.max,
        min: dataInfo.min,
      },
      legend: {
        enabled: dataInfo.legend,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      plotOptions: {
        column: {
          stacking: dataInfo.stacking,
          dataLabels: {
            useHTML: true,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            enabled: dataInfo.dataLabelEnable,
            formatter: function () {
              if (dataInfo.toolTip == 1 || dataInfo.toolTip == 4) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 2) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${this.y}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${this.y}</span>`;
                }
              } else if (dataInfo.toolTip == 3) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 5) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat((this.y * 100).toFixed(1))}%</span>`;
                }
              }
              else if (dataInfo.toolTip == 6) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}%</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}%</span>`;
                }
              }
            },
          },
          point: {
            events: {
              click: function () {
                (indexP = this.x), (series = this.series.chart.series);
                i = 0;
                len = series.length;
                if (this.color.split(",")[3] == "1)" || this.color.split(",")[3] == " 1)") {
                  for (i = 0; i < len; i++) {
                    //clear all selection
                    series[i].data[indexP].update({ color: changeOpacityRGBA(series[i].data[indexP].color, 0.5) });
                  }
                  if (interactiveFilterProduct.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.product?.ProductID) {
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.replaceAll(this.product?.ProductID + ",", "");
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.replaceAll(this.product?.ProductID, "");
                      insightService.insightInteractiveFilterTemp.ProductName = insightService.insightInteractiveFilterTemp.productName.replaceAll(this.product?.ProductName + ",", "");
                      insightService.insightInteractiveFilterTemp.ProductName = insightService.insightInteractiveFilterTemp.productName.replaceAll(this.product?.ProductName, "");
                    }
                  }

                  if (interactiveFilterMold.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.mold?.MoldID) {
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.replaceAll(this.mold?.MoldID + ",", "");
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.replaceAll(this.mold?.MoldID, "");
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldID.replaceAll(localLanguage ? this.mold?.LName : this.mold?.EName + ",", "");
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldID.replaceAll(localLanguage ? this.mold?.LName : this.mold?.EName, "");
                    }
                  }
                } else {
                  for (i = 0; i < len; i++) {
                    //clear all selection
                    series[i].data[indexP].update({ color: changeOpacityRGBA(series[i].data[indexP].color, 1) });
                  }
                  if (interactiveFilterProduct.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.product?.ProductID) {
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.length > 0 ? (insightService.insightInteractiveFilterTemp.productID += "," + this.product?.ProductID) : this.productID?.ProductID + "";
                      insightService.insightInteractiveFilterTemp.productName = insightService.insightInteractiveFilterTemp.productName.length > 0 ? (insightService.insightInteractiveFilterTemp.productName += "," + this.product?.ProductName) : this.product?.ProductName + "";
                    }
                  }
                  if (interactiveFilterMold.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.mold?.MoldID) {
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.length > 0 ? (insightService.insightInteractiveFilterTemp.moldID += "," + this.mold?.MoldID) : this.mold?.MoldID + "";
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldName.length > 0 ? (insightService.insightInteractiveFilterTemp.moldName += "," + localLanguage ? this.mold?.LName : this.mold?.EName) : localLanguage ? this.mold?.LName : this.mold?.EName + "";
                    }
                  }
                }
              },
            },
          },
        },

        series: {
          events: {
            legendItemClick: function () {
              var series = this.chart.series;
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            },
          },
        },
      },
      tooltip: {
        outside: true,
        useHTML: true,
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<span><b>" + this.key + ": </span>" + parseFloat(this.y.toFixed(2)) + "</b><br/>";
          } else if (dataInfo.toolTip == 2) {
            return "<span><b>" + this.key + ": </span>" + this.y + "</b><br/>";
          } else if (dataInfo.toolTip == 3) {
            return "<span><b>" + this.key + ": </span>" + $filter("minutesToHH")(this.y) + "</b><br/>";
          } else if (dataInfo.toolTip == 4 || dataInfo.toolTip == 6) {
            return "<span><b>" + this.key + ": </span>" + parseFloat(this.y.toFixed(2)) + "%</b><br/>";
          } else if (dataInfo.toolTip == 5) {
            return "<span><b>" + this.key + ": </span>" + parseFloat((this.y * 100).toFixed(1)) + "%</b><br/>";
          }
        },
      },
      series: dataInfo.series,
    };
  };

  var buildStackedArea = function (dataInfo) {
    Highcharts.seriesTypes.area.prototype.drawLegendSymbol = function () {
      Highcharts.LegendSymbolMixin.drawLineMarker.apply(this, arguments);
    };
    var localLanguage = LeaderMESservice.showLocalLanguage();

    return {
      colors: dataInfo.colors,
      chart: {
        borderColor: "#EBBA95",
        borderWidth: 0,
        type: "area",
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {
            var series = this.series;
            initInsightStates();
            if(legendsWithEvents(dataInfo)){
              let legends = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents;
                  series.forEach(function (serie) {
                    if (!_.isEmpty(serie)) {
                      var legendFound = _.find(legends,{id:serie.userOptions[dataInfo.legendsType]})
                      if(legendFound){
                        serie.update({
                          visible: legendFound.visiblity,
                        });
                      }
       
                  }
                })
              return;
            }
			
            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      title: "",
      xAxis: {
        categories: dataInfo.categories,
        tickmarkPlacement: "on",
        title: {
          enabled: false,
        },
        labels: {
          useHTML: true,
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            fontSize: "13px",
            color: "#000000",
          },
        },
        text: dataInfo.insight.XAxisName,
      },
      yAxis: {
        title: {
          text: dataInfo.insight.YAxisName,
        },
        labels: {
          formatter: function () {
            if (dataInfo.label == 1) {
              return numberWithCommas(parseFloat(this.value.toFixed(2)));
            } else if (dataInfo.label == 2) {
              return $filter("minutesToHH")(this.value);
            } else if (dataInfo.label == 3) {
              return this.value + "%";
            } else if (dataInfo.label == 4) {
              return $filter("getDurationInHrMin")(this.value);
            }
          },
          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
        },
        stackLabels: {
          enabled: dataInfo.dataLabelTotalEnable || false,
          formatter: function () {
            if (dataInfo.label == 1) {
              return numberWithCommas(parseFloat(this.total.toFixed(2)));
            }
          },
        },
        max: dataInfo.max,
      },
      legend: {
        enabled: dataInfo.showLegends,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },
      navigation: {
        buttonOptions: {
          verticalAlign: "top",
          y: -5,
        },
      },
      tooltip: {
        useHTML: true,
        shared: true,
        outside: true,
        valueSuffix: "",
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("minutesToHH")(temp.y)}</div>`;
              } else {
                text = `<div style="text-align: ${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("minutesToHH")(temp.y)}</div>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 2) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${numberWithCommas(parseFloat(temp.y.toFixed(2)))}</div>`;
              } else {
                text = `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${numberWithCommas(parseFloat(temp.y.toFixed(2)))}</div>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 3) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<span style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</span>:</b> ${parseFloat(temp.point.y.toFixed(2))}% <br/>`;
              } else {
                text = `<span style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</span>:</b> ${parseFloat(temp.point.y.toFixed(2))}% <br/>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 4) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y}</div>`;
              } else {
                text = `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y}</div>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 5) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y.toFixed(2)}%</div>`;
              } else {
                text = `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y.toFixed(2)}%</div>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 6) {
            text = `<b>${this.x}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("getDurationInHrMin")(temp.y)}</div>`;
              } else {
                text = `<div style="text-align: ${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("getDurationInHrMin")(temp.y)}</div>`;
              }
              if(temp.series.userOptions.PEObject)
              {
                
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.userOptions.unitsProducedOk.name}</b>: ${$filter("thousandsSeperator")(temp.series.userOptions.unitsProducedOk?.data[0] < 100 ? temp.series.userOptions.unitsProducedOk?.data[0].toFixed(2) : parseInt(temp.series.userOptions.unitsProducedOk?.data[0]))}</div>`;
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.userOptions.UnitsProducedTheoretically.name}</b>: ${$filter("thousandsSeperator")(temp.series.userOptions.UnitsProducedTheoretically?.data[0] < 100 ? temp.series.userOptions.UnitsProducedTheoretically?.data[0].toFixed(2) : parseInt(temp.series.userOptions.UnitsProducedTheoretically?.data[0]))}</div>`;
              }
            });

            return text;
          } else if (dataInfo.toolTip == 7) {
            text = `<b>${this.x?.userOptions?.name} ${this.x?.userOptions?.shiftStartTime}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<span style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</span>:</b> ${parseFloat(temp.point.y.toFixed(2))}% <br/>`;
              } else {
                text = `<span style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</span>:</b> ${parseFloat(temp.point.y.toFixed(2))}% <br/>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 8) {
            text = `<b>${this.x?.userOptions?.name} ${this.x?.userOptions?.shiftStartTime}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${numberWithCommas(parseFloat(temp.y.toFixed(2)))}</div>`;
              } else {
                text = `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${numberWithCommas(parseFloat(temp.y.toFixed(2)))}</div>`;
              }
            });
            return text;
          }
          else if (dataInfo.toolTip == 9) {
            text = `<b>${this.x?.userOptions?.name} ${this.x?.userOptions?.shiftStartTime}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y}</div>`;
              } else {
                text = `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${temp.y}</div>`;
              }
            });
            return text;
          } else if (dataInfo.toolTip == 10) {
            text = `<b>${this.x?.userOptions?.name} ${this.x?.userOptions?.shiftStartTime}</b><br />`;
            this.points.forEach(function (temp) {
              if (text) {
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("getDurationInHrMin")(temp.y)}</div>`;
              } else {
                text = `<div style="text-align: ${localLanguage ? "right" : "left"};"><b>${temp.series.name}</b>: ${$filter("getDurationInHrMin")(temp.y)}</div>`;
              }
              if(temp.series.userOptions.PEObject)
              {
                
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.userOptions.unitsProducedOk.name}</b>: ${$filter("thousandsSeperator")(temp.series.userOptions.unitsProducedOk?.data[0] < 100 ? temp.series.userOptions.unitsProducedOk?.data[0].toFixed(2) : parseInt(temp.series.userOptions.unitsProducedOk?.data[0]))}</div>`;
                text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.series.userOptions.UnitsProducedTheoretically.name}</b>: ${$filter("thousandsSeperator")(temp.series.userOptions.UnitsProducedTheoretically?.data[0] < 100 ? temp.series.userOptions.UnitsProducedTheoretically?.data[0].toFixed(2) : parseInt(temp.series.userOptions.UnitsProducedTheoretically?.data[0]))}</div>`;
              }
            });

            return text;
          }
        },
      },
      plotOptions: {
        series: {
          marker: { enabled: true },
          events: {
            legendItemClick: function () {
              
              if(legendsWithEvents(dataInfo)){
                var legend = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents,{id:this.userOptions[dataInfo.legendsType]})
                if(legend){
                  legend.visiblity = !legend.visiblity
                }
              }else
              {
                var index = this.index;
                var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
                var legendBooleans = [];
                legend.forEach(function (elem) {
                  var isTrueSet = elem === "true";
                  legendBooleans.push(isTrueSet);
                });
                // toggle series visibility flag and override it in local storage
                legendBooleans[index] = !legendBooleans[index];
                $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
              }
            },
          },

          dataLabels: {
            enabled: dataInfo.dataLabelEnable,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            useHTML: true,
            formatter: function () {
              {                
                if (!this.y) {
                  return;
                }
                if (dataInfo.toolTip == 1) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.y)}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.y)}</span>`;
                  }
                } else if (dataInfo.toolTip == 2 || dataInfo.toolTip == 5 || dataInfo.toolTip == 8) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                  }
                } else if (dataInfo.toolTip == 3 || dataInfo.toolTip == 7) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${parseFloat(this.point.y.toFixed(2))}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.point.y.toFixed(2))}</span>`;
                  }
                } else if (dataInfo.toolTip == 4 || dataInfo.toolTip == 9) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${this.y}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${this.y}</span>`;
                  }
                } else if (dataInfo.toolTip == 6 || dataInfo.toolTip == 10) {
                  if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                    return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                  } else {
                    return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                  }
                } 
              }
            },
          },
        },
        area: {
          stacking: "normal",
          lineColor: "#666666",
          lineWidth: 1,
        },
      },
      series: dataInfo.series,
    };
  };

  var buildSeriesStackedColumnGraph = function (dataInfo) {
    var localLanguage = LeaderMESservice.showLocalLanguage();
    return {
      colors: dataInfo.colors,
      chart: {
        borderColor: "#EBBA95",
        borderWidth: 0,
        type: "column",
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        events: {
          load: function () {            
            var series = this.series;
            initInsightStates();

            if(legendsWithEvents(dataInfo)){
              let legends = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents;
                  series.forEach(function (serie) {
                    if (!_.isEmpty(serie)) {
                      var legendFound = _.find(legends,{id:serie.userOptions[dataInfo.legendsType]})
                      if(legendFound){
                        serie.update({
                          visible: legendFound.visiblity,
                        });
                      }
       
                  }
                })
              return;
            }
			

            // If there is no legend items visibility flags saved in local storage, save them.
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID]) {
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID] = {};
            }
            if (!$localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems) {
              let legend = [];
              initLegends(series,legend);
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legend.toString();
            } else {
              let legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              let legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              legendBooleans.forEach(function (state, i) {
                if (!_.isEmpty(series) && !_.isEmpty(series[i])) {
                  series[i].update({
                    visible: state,
                  });
                }
              });
            }
          },
        },
      },
      exporting: {
        enabled: true,
        useHTML: true,
        csv: {
          itemDelimiter: $sessionStorage.exportCSVDelimiter || ",",
        },
        buttons: {
          contextButton: {
            menuItems: [
              {
                textKey: "downloadJPEG",
                onclick: function () {
                  printHighchart(dataInfo, "img");
                },
              },
              {
                textKey: "downloadPDF",
                onclick: function () {
                  printHighchart(dataInfo, "pdf");
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
      title: {
        text: "",
      },
      navigation: {
        buttonOptions: {
          verticalAlign: "top",
          y: -10,
        },
      },
      xAxis: {
        categories: dataInfo.categories,
        title: {
          text: "",
        },
        labels: {
          enabled: dataInfo.showLabels,
          rotation: false,
          formatter: function () {
            if(!this.value) return;
            var obj = prepareLabel(typeof this.value == 'object' ? this.value.name : this.value,dataInfo.categories.length,dataInfo.graph?.options?.width )
            return `<div  title='${obj.toolTip}' style="${obj.style}">` + obj.value + "</div>";
          },
          useHTML: true,

          style: {
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            fontSize: "13px",
            color: "#000000",
          },
        },
      },

      yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
          text: dataInfo.YAxisName,
        },

        useHTML: true,
        labels: {
          style: {
            direction: localLanguage ? "rtl" : "ltr",
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          useHTML: true,
          formatter: function () {
            if (dataInfo.label == 1) {
              return numberWithCommas(parseFloat(this.value));
            } else if (dataInfo.label == 2) {
              return $filter("getDurationInHrMin")(this.value);
            } else if (dataInfo.label == 3) {
              return $filter("getDurationInHrMin")(this.value);
            } else if (dataInfo.label == 4) {
              return $filter("secondsToHHMMSS")(this.value);
            } else if (dataInfo.label == 5) {
              return $filter("getDurationInHrMin")(this.value);
            }else  if (dataInfo.label == 6) {              
              return this.value + `${$filter('translate')('MIN')}`; 
            }
          },
        },
        stackLabels: {
          useHTML: true,
          style: {
            direction: localLanguage ? "rtl" : "ltr",
            fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
          },
          enabled: dataInfo.dataLabelTotalEnable,
          formatter: function () {
            if (dataInfo.label == 1) {
              return `<span >${numberWithCommas(parseFloat(this.total.toFixed(2)))}</span>`;
            }
          },
        },
        max: dataInfo.max,
      },
      legend: {
        enabled: dataInfo.showLegends,
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
      },

      tooltip: {
        useHTML: true,
        outside: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        formatter: function () {
          if (dataInfo.toolTip == 1) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + parseFloat(this.y?.toFixed(2)) + "<br/>";
          } else if (dataInfo.toolTip == 2) {
            return "<b>" + this.x + "</b><br>" + this.series.name + ": " + numberWithCommas(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 3) {
            return "<b>" + this.x + ": " + $filter("getDurationInHrMin")(this.y) + "<br/>";
          } else if (dataInfo.toolTip == 4) {
            return "<b>" + this.x + ": " + numberWithCommas(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 5) {
            return this.series.name + ": " + numberWithCommas(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 6) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + $filter("minutesToHH")(parseFloat(this.y.toFixed(2))) + "<br/>" + $filter("translate")("TOTAL") + ": " + $filter("minutesToHH")(parseFloat(this.point.stackTotal.toFixed(2)));
          } else if (dataInfo.toolTip == 7) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + parseFloat(this.y.toFixed(2)) + "<br/>" + $filter("translate")("TOTAL") + ": " + parseFloat(this.point.stackTotal.toFixed(2));
          } else if (dataInfo.toolTip == 8) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + parseFloat(this.percentage.toFixed(2)) + "<br/>" + $filter("translate")("TOTAL") + ": " + parseFloat(this.point.stackTotal.toFixed(2));
          } else if (dataInfo.toolTip == 9) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + $filter("minutesToHH")(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 10) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + this.y + "<br/>";
          } else if (dataInfo.toolTip == 11) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + this.y + "<br/>";
          } else if (dataInfo.toolTip == 12) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + this.point.y;
          } else if (dataInfo.toolTip == 13) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + $filter("minutesToHH")(this.point.y);
          } else if (dataInfo.toolTip == 14) {
            return "<b>" + this.x + "</b><br />" + this.series.name + ": " + $filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 15) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + this.y + "<br/>" + $filter("translate")("TOTAL") + ": " + this.point.stackTotal;
          } else if (dataInfo.toolTip == 16) {
            return "<b>" + this.x + "</b><br />" + this.series.name + ": " + $filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 17) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + $filter("getDurationInHrMin")(parseFloat(this.y.toFixed(2))) + "<br/>";
          } else if (dataInfo.toolTip == 18) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + $filter("getDurationInHrMin")(parseFloat(this.y.toFixed(2))) + "<br/>" + $filter("translate")("TOTAL") + ": " + $filter("getDurationInHrMin")(parseFloat(this.point.stackTotal.toFixed(2)));
          } else if (dataInfo.toolTip == 19) {
            return "<b>" + this.key + "<br><b>" + this.series.name + ": " + $filter("getDurationInHrMin")(this.point.y);
          } else if (dataInfo.toolTip == 20) {
            return "<b>" + this.x + "</b><br/>" + this.series.name + ": " + parseFloat(this.y.toFixed(2)) + "%";
          } else if (dataInfo.toolTip == 21) {
         
              var index = this.point.index;
              text = `<b>${this.x}</b><br />`;
              textEnd = ``
              
              this.point.fullList.forEach(function (temp) {
                if(temp.find == "UnitsProducedOK" || temp.find == "UnitsProducedTheoretically")
                {
                  textEnd += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("thousandsSeperator")(temp?.data[index].y < 100 ? temp?.data[index].y.toFixed(2) : parseInt(temp?.data[index].y))}</div>`;
                }
                else if (text) {
                  text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("getDurationInHrMin")(temp?.data[index].y)}</div>`;
                } else {
                  text = `<div style="text-align: ${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("getDurationInHrMin")(temp?.data[index].y)}</div>`;
                }
              });
              if(textEnd)
              {
                text +=textEnd
              }
              return text;
          
          }
          else if(dataInfo.toolTip == 22){
            return "<b>" + this.x + "</b>" + ": " + parseFloat(this.y?.toFixed(2)) + $filter('translate')('MIN');
          }else if(dataInfo.toolTip == 23){
            return "<b>" + this.x + "</b>" + ": " + parseFloat(this.y?.toFixed(2));
          }
          else if(dataInfo.toolTip == 24){
              return "<b>" + this.x + "</b>" + ": " + $filter("getDurationInHoursMinutes")(parseFloat(this.y?.toFixed(2)));
          } else if (dataInfo.toolTip == 25) {
            
              var index = this.point.index;
              text = `<b>${this.x?.userOptions?.name} ${this.x?.userOptions?.shiftStartTime}</b><br />`;
              textEnd = ``
              
              this.point.fullList.forEach(function (temp) {
                if(temp.find == "UnitsProducedOK" || temp.find == "UnitsProducedTheoretically")
                {
                  textEnd += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("thousandsSeperator")(temp?.data[index].y < 100 ? temp?.data[index].y.toFixed(2) : parseInt(temp?.data[index].y))}</div>`;
                }
                else if (text) {
                  text += `<div style="text-align:${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("getDurationInHrMin")(temp?.data[index].y)}</div>`;
                } else {
                  text = `<div style="text-align: ${localLanguage ? "right" : "left"};"><b>${temp.name}</b>: ${$filter("getDurationInHrMin")(temp?.data[index].y)}</div>`;
                }
              });
              if(textEnd)
              {
                text +=textEnd
              }
              return text;
           
          }
          
        },
      },
      plotOptions: {
        column: {
          stacking: dataInfo.stacking,
          point: {
            events: {
              click: function () {
                (indexP = this.x), (series = this.series.chart.series);
                i = 0;
                len = series.length;
                if (this.color.split(",")[3] == "1)" || this.color.split(",")[3] == " 1)") {
                  for (i = 0; i < len; i++) {
                    //clear all selection
                    series[i].data[indexP].update({ color: changeOpacityRGBA(series[i].data[indexP].color, 0.5) });
                  }
                  if (interactiveFilterProduct.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.product?.ProductID) {
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.replaceAll(this.product?.ProductID + ",", "");
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.replaceAll(this.product?.ProductID, "");
                      insightService.insightInteractiveFilterTemp.ProductName = insightService.insightInteractiveFilterTemp.productName.replaceAll(this.product?.ProductName + ",", "");
                      insightService.insightInteractiveFilterTemp.ProductName = insightService.insightInteractiveFilterTemp.productName.replaceAll(this.product?.ProductName, "");
                    }
                  }

                  if (interactiveFilterMold.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.mold?.MoldID) {
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.replaceAll(this.mold?.MoldID + ",", "");
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.replaceAll(this.mold?.MoldID, "");
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldID.replaceAll(localLanguage ? this.mold?.LName : this.mold?.EName + ",", "");
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldID.replaceAll(localLanguage ? this.mold?.LName : this.mold?.EName, "");
                    }
                  }
                } else {
                  for (i = 0; i < len; i++) {
                    //clear all selection
                    series[i].data[indexP].update({ color: changeOpacityRGBA(series[i].data[indexP].color, 1) });
                  }
                  if (interactiveFilterProduct.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.product?.ProductID) {
                      insightService.insightInteractiveFilterTemp.productID = insightService.insightInteractiveFilterTemp.productID.length > 0 ? (insightService.insightInteractiveFilterTemp.productID += "," + this.product?.ProductID) : this.product?.ProductID + "";
                      insightService.insightInteractiveFilterTemp.productName = insightService.insightInteractiveFilterTemp.productName.length > 0 ? (insightService.insightInteractiveFilterTemp.productName += "," + this.product?.ProductName) : this.product?.ProductName + "";
                    }
                  }

                  if (interactiveFilterMold.indexOf(dataInfo.insight.ID) > -1) {
                    if (this.mold?.MoldID) {
                      insightService.insightInteractiveFilterTemp.moldID = insightService.insightInteractiveFilterTemp.moldID.length > 0 ? (insightService.insightInteractiveFilterTemp.moldID += "," + this.mold?.MoldID) : this.mold?.MoldID + "";
                      insightService.insightInteractiveFilterTemp.moldName = insightService.insightInteractiveFilterTemp.moldName.length > 0 ? (insightService.insightInteractiveFilterTemp.moldName += "," + localLanguage ? this.mold?.LName : this.mold?.EName) : localLanguage ? this.mold?.LName : this.mold?.EName + "";
                    }
                  }
                }
              },
            },
          },
        },
        useHTML: true,
        style: {
          direction: localLanguage ? "rtl" : "ltr",
          fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
        },
        series: {
          events: {
            legendItemClick: function () {
              if(legendsWithEvents(dataInfo)){
                var legend = _.find($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendForEvents,{id:this.userOptions[dataInfo.legendsType]})
                if(legend){
                  legend.visiblity = !legend.visiblity
                }
              }else
              {
              var series = this.chart.series;
              var index = this.index;
              var legend = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems.split(",");
              var legendBooleans = [];
              legend.forEach(function (elem) {
                var isTrueSet = elem === "true";
                legendBooleans.push(isTrueSet);
              });
              // toggle series visibility flag and override it in local storage
              legendBooleans[index] = !legendBooleans[index];
              $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][dataInfo.insight.ID].legendItems = legendBooleans.toString();
            }
            },
          },

          dataLabels: {
            useHTML: true,
            enabled: dataInfo.dataLabelEnable,
            style: {
              direction: localLanguage ? "rtl" : "ltr",
              fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
            },
            formatter: function () {
              if (!this.y) {
                return;
              }
              if (dataInfo.toolTip == 1 || dataInfo.toolTip == 10 || dataInfo.toolTip == 11 || dataInfo.toolTip == 15|| dataInfo.toolTip == 22|| dataInfo.toolTip == 23) {
                if (dataInfo.shiftInsight) {
                  return this.y;
                } else if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y?.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y?.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 3 || dataInfo.toolTip == 21 || dataInfo.toolTip == 24|| dataInfo.toolTip == 25) {
                if (dataInfo.shiftInsight) {
                  return $filter("getDurationInHrMin")(this.y);
                } else if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 4 || dataInfo.toolTip == 5 || dataInfo.toolTip == 2) {
                if (dataInfo.shiftInsight) {
                  return numberWithCommas(parseFloat(this.y.toFixed(2)));
                } else if (dataInfo.insightsColorText && dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${numberWithCommas(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 6 || dataInfo.toolTip == 9) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 7) {
                if (dataInfo.shiftInsight) {
                  return parseFloat(this.y.toFixed(2));
                } else if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 8) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.percentage.toFixed(2))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.percentage.toFixed(2))}</span>`;
                }
              } else if (dataInfo.toolTip == 12) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${this.point.y}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${this.point.y}</span>`;
                }
              } else if (dataInfo.toolTip == 13) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("minutesToHH")(this.point.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("minutesToHH")(this.point.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 14) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 16) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("secondsToHHMMSS")(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 17) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 18) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(parseFloat(this.y.toFixed(2)))}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(parseFloat(this.y.toFixed(2)))}</span>`;
                }
              } else if (dataInfo.toolTip == 19) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${$filter("getDurationInHrMin")(this.point.y)}</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${$filter("getDurationInHrMin")(this.point.y)}</span>`;
                }
              } else if (dataInfo.toolTip == 20) {
                if (dataInfo.insightsColorText.currentChoice == "defaultColor") {
                  return `<span  style="color:#000000;font-size:13px">${parseFloat(this.y.toFixed(2))}%</span>`;
                } else {
                  return `<span style="background-color:${dataInfo.insightsColorText.backgroundColor};color:${dataInfo.insightsColorText.fontColor};font-size:${dataInfo.insightsColorText.fontSize}px">${parseFloat(this.y.toFixed(2))}%</span>`;
                }
              }
            
            },
          },
        },
      },
      series: dataInfo.series,
    };
  };
  return {
    buildLineGraph: buildLineGraph,
    buildPieChart: buildPieChart,
    buildBasicBarChart: buildBasicBarChart,
    buildSeriesStackedColumnGraph: buildSeriesStackedColumnGraph,
    buildBarChart: buildBarChart,
    buildWaterFallChart: buildWaterFallChart,
    buildStackedArea: buildStackedArea,
    buildStackedBarChart: buildStackedBarChart,
    buildHeatMapChart: buildHeatMapChart,
  };
});
