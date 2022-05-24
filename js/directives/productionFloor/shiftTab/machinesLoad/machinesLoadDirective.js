var machinesLoadDirective = function () {
  var Template = "views/custom/productionFloor/shiftTab/machinesLoad/machinesLoad.html";


  var controller = function ($scope, shiftService, configuration, LeaderMESservice, 
    $element, $timeout, $filter, $rootScope,AuthService, $sessionStorage) {
    var x = $element[0].querySelector("highcharts-axis highcharts-yaxis");
    $scope.shiftData = shiftService.shiftData;
    $scope.sliderData = shiftService.sliderData;
    $scope.align = LeaderMESservice.isLanguageRTL() ? "right" : "left";
    $scope.data = [];
    $scope.pointer = $scope.shiftData.machinesLoadPointer;
    $scope.cellSize = {
      width: 70,
      height: 35,
    };
    var localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.userDateFormat = AuthService.getUserDateFormat();
    $scope.selectedH = null;
    $scope.selectedM = null;

    $scope.machinesNum = 0;
    $scope.Hours = [];
    shiftService.updateMachineAvailabilityAndTheorteically();
    if ($scope.shiftData.machinesLoad) {
      if (!$scope.options.settings.parameters) {
        $scope.options.settings.parameters = Object.keys($scope.shiftData.machinesLoad);
      }
      var valid = _.indexOf($scope.options.settings.parameters, $scope.options.settings.parameter) >= 0;

      if (!valid) {
        $scope.options.settings.parameter = $scope.options.settings.parameters[0];
      }
    }
    // shiftService.displayUpdateDefferd.promise.then(null, null, function () {
    //   updateMachines();
    // });


    $scope.shiftData.machineLoadSelectedPoint = null;

    shiftService.sliderUpdateDefferd.promise.then(null, null, function () {
      $scope.updateGraph();
    });

    $scope.updateHours = function () {
      var numOfHours = Math.ceil(($scope.sliderData.maxValue - $scope.sliderData.minValue) / 60);
      if (numOfHours > 24) {
        numOfHours = 24;
      }
      var floorHour = new Date($scope.sliderData.minValue * 60000).getHours();
      $scope.Hours = _.uniq(
        _.map(_.range(floorHour, floorHour + numOfHours + 1, 1), function (value) {
          var formatedValue = value % 24 > 9 ? value % 24 : "0" + (value % 24);
          return formatedValue;
        })
      );
      var index = 0;
      $scope.Hours = _.map($scope.Hours.reverse(), function (hour) {
        index = index + 1;
        return {
          displayOrder: index,
          value: parseInt(hour),
        };
      });
    };

    
    var belowOrAboveHundred = function(number){
      if(number && number < 100) 
      {
        return  parseFloat(number.toFixed(2))
      }
      return parseInt(number)
    }

    $scope.opacityLimit = null;
    $scope.getOpacity = function (value) {
      if (!$scope.opacityLimit) {
        return;
      }
      if (!value || value < 0) {
        return 0;
      } else if (value <= $scope.opacityLimit["1"]) {
        return 0.25;
      } else if (value > $scope.opacityLimit["1"] && value <= $scope.opacityLimit["2"]) {
        return 0.5;
      } else if (value > $scope.opacityLimit["2"] && value <= $scope.opacityLimit["3"]) {
        return 0.75;
      } else if (value > $scope.opacityLimit["3"]) {
        return 1;
      }
    };

    $scope.machinesTemp = [];

    function updateMachines() {
      $scope.machinesTemp = [];
      if (!$scope.opacityLimit || !$scope.shiftData.machinesLoad) {
        return;
      }
        var machines = {};
        _.forIn($scope.shiftData.machinesLoad['MachineAvailability'], function (machineObj, key) {
          let subMachine = $scope.graph.localMachines.find((machine) => machine.ID == machineObj.Id);
          if (subMachine && subMachine.value) {
            var tempMachine = _.find($scope.shiftData.Machines, {
              machineID: machineObj.Id,
            });
            if (tempMachine) {
              machineObj.MachineName = tempMachine.machineName;
              machineObj.DisplayOrder = tempMachine.DisplayOrder;
            }       
            _.forEach(machineObj?.ValuesForHours?.Availability,function(temp){
              temp.RecordTime =  temp.RecordTime ? moment(temp.RecordTime).format("YYYY-MM-DD HH:mm") : temp.RecordTime          
            })
            machines[key] = machineObj;        
          }
        });
        $scope.machinesTemp = _.sortBy(machines, "DisplayOrder");
        $scope.updateGraph();
    }


    var getResultValue = function(obj){
     if (_.isNumber(obj.AvailabilityPE)  && _.isNumber(obj.AvailabilityPETarget) ) {
        if ($scope.graph.options.settings.percentageChoice == "target") {
          
          if(obj.AvailabilityPE ==0 && obj.AvailabilityPETarget == 0 || obj.AvailabilityPE > 0  && obj.AvailabilityPETarget == 0)
          {
            obj.UnitsRatio = null;
          }
          else
          {
            obj.UnitsRatio = obj.AvailabilityPE / obj.AvailabilityPETarget;
          }
        } else {
          obj.UnitsRatio = obj.AvailabilityPE;
        } 
     
          if ($scope.graph?.options?.settings?.customization == "percentage") 
          {
            if(obj.UnitsRatio)
            {
              obj.result = `${belowOrAboveHundred(obj.UnitsRatio * 100)}%` ;
            }
            else
            {
              obj.result = null
            }
          }
          else
          {
            if(obj.AvailabilityPETarget || obj.AvailabilityPE > 0)
            {
              obj.result = `${belowOrAboveHundred(obj.AvailabilityPE * 100)}%` ;
            }
            else
            {
              obj.result = null ;
            }
          }
        
        if (obj.AvailabilityPETarget > 0 ) {
          if ($scope.graph?.options?.settings?.customization == "percentage") {
            obj.result2 = `${belowOrAboveHundred (obj.UnitsRatio * 100)}%` 
          }else {
            obj.result2 = `${belowOrAboveHundred(obj.AvailabilityPE * 100)}%` 
            obj.result2 += " (" + belowOrAboveHundred(obj.AvailabilityPETarget * 100) + "%)";
          }
        } else {
          obj.result2 = null;
          obj.color = "#F7F7F7";       
          if(obj.AvailabilityPE > 0)
          {
            obj.color = `rgba(24, 181, 21, 1)`;
          }
        }
      } else {
        (obj.UnitsRatio = null), (obj.result = null), (obj.result2 = null),(obj.color = "#F7F7F7");
      }
      return obj
    }


    $scope.updateGraph = function () {
      $scope.machineNames = [];
      var chartHoursTemp = [];
      shiftService.shiftData.Machines.forEach((currentItem) => {
        let subMachine = $scope.graph.localMachines.find((machine) => machine.ID == currentItem.machineID);
        if (subMachine && subMachine.value) {
          $scope.machineNames.push(currentItem.machineName);
        }
      });
    
        $scope.updateHours();
        var chartHoursTemp = _.map(_.sortBy($scope.Hours, "displayOrder"), "value");
        chartHoursTemp.reverse();
        if ($scope.machinesTemp.length > 0 && $scope.machinesTemp[0] && $scope.machinesTemp[0].ValuesForHours.Availability) {
          var chartHoursTemp = [];
          _.forEach($scope.machinesTemp[0].ValuesForHours.Availability, (item) => chartHoursTemp.push(item.RecordTime));
        }      
      $scope.collectData = [];
      $scope.collectDataTemp = [];
      (oldMax = -Infinity), (oldMin = Infinity), (oldMinTotal = Infinity), (oldMaxTotal = -Infinity);
        var tooltip = 1;
        _.forEach($scope.machinesTemp, function (currentItem) {
          _.forEach(currentItem.ValuesForHours.Availability, function (availabilityObject) {            
            getResultValue(availabilityObject)
          });
          getResultValue(currentItem.ValuesForHours.Totals)
        });

        //get max value 
        _.forEach($scope.machinesTemp, function (currentItem) {
          _.forEach(currentItem.ValuesForHours.Availability, function (availabilityObject) {
            if (_.isNumber(availabilityObject.UnitsRatio)  && availabilityObject.UnitsRatio > oldMax) {
              oldMax = availabilityObject.UnitsRatio;
            }
            if (_.isNumber(availabilityObject.UnitsRatio) && availabilityObject.UnitsRatio < oldMin) {
              oldMin = availabilityObject.UnitsRatio;
            }
          });
        });
        
        //get max value total
        _.forEach($scope.machinesTemp, function (currentItem) {
          if (_.isNumber(currentItem.ValuesForHours.Totals.UnitsRatio) && currentItem.ValuesForHours.Totals.UnitsRatio > oldMax) {
            oldMax = currentItem.ValuesForHours.Totals.UnitsRatio;
          }
          if (_.isNumber(currentItem.ValuesForHours.Totals.UnitsRatio) && currentItem.ValuesForHours.Totals.UnitsRatio < oldMin) {
            oldMin = currentItem.ValuesForHours.Totals.UnitsRatio;
          }
        });
        
        _.forEach($scope.machinesTemp, function (currentItem, x) {
          $scope.collectDataTemp = [];
          _.forEach(currentItem.ValuesForHours.Availability, function (AvailabilityObj) {
            var text = null;
            if (AvailabilityObj && AvailabilityObj.result  || AvailabilityObj && AvailabilityObj.result2) {
              if ($scope.graph.options.settings.targetMode) {
                text = AvailabilityObj.result2;
              } else {
                text = AvailabilityObj.result;
              }
            }
            if (chartHoursTemp.indexOf(AvailabilityObj.RecordTime) >= 0) {
              if(!AvailabilityObj.color){
                var higherRatioValue = (AvailabilityObj.UnitsRatio - $scope.colors[0].value / 100) / (oldMax - $scope.colors[0].value / 100)
                var lowerRatioValue = 1 - (AvailabilityObj.UnitsRatio - oldMin) / ($scope.colors[1].value / 100 - oldMin);
                if ($scope.graph.options.settings.colorMode) {
                  if (AvailabilityObj.UnitsRatio > $scope.colors[0].value / 100) {
                    color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[0].color,higherRatioValue) : $scope.colors[0].color;
                  } else if (AvailabilityObj.UnitsRatio < $scope.colors[1].value / 100) {
                    color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[1].color, lowerRatioValue) : $scope.colors[1].color;
                  } else {
                    color = $scope.colors[2].color;
                  }
                } else {
                  color = `rgba(24, 181, 21, ${Math.min(AvailabilityObj.UnitsRatio,1)})`;
                }
              }
              else
              {
                color = AvailabilityObj.color
              }
              
              const fontColor = LeaderMESservice.getBWByColor(color,186,0.5);
              $scope.collectDataTemp.push({
                x: x,
                y: chartHoursTemp.indexOf(AvailabilityObj.RecordTime) + 1,
                value: text,
                color: color,
                AvailabilityPETarget: AvailabilityObj.AvailabilityPETarget,
                AvailabilityPE: AvailabilityObj.AvailabilityPE,
                UnitsRatio: AvailabilityObj.UnitsRatio,
                dataLabels: {
                  color: fontColor,
                },
              });
            }
          });

          var obj = _.find($scope.shiftData.machinesLoad["MachineAvailability"], { Id: currentItem.Id });

          var text = null;
          if (obj && obj.ValuesForHours) {
              if (obj?.ValuesForHours?.Totals && obj?.ValuesForHours?.Totals.result  || obj?.ValuesForHours?.Totals && obj?.ValuesForHours?.Totals.result2) {
                if ($scope.graph.options.settings.targetMode) {
                  text = obj?.ValuesForHours?.Totals.result2;
                } else {
                  text = obj?.ValuesForHours?.Totals.result;
                }
              }
              var higherRatioValue = (obj.ValuesForHours.Totals?.UnitsRatio - $scope.colors[0].value / 100) / (oldMax - $scope.colors[0].value / 100);
              var lowerRatioValue = 1 - (obj.ValuesForHours.Totals?.UnitsRatio - oldMin) / ($scope.colors[1].value / 100 - oldMin);
              
          if(!obj?.ValuesForHours?.Totals.color){
            if ($scope.graph.options.settings.colorMode) {
              if (obj.ValuesForHours.Totals?.UnitsRatio > $scope.colors[0].value / 100) {
                color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[0].color, higherRatioValue ) : $scope.colors[0].color;
              } else if (obj.ValuesForHours.Totals?.UnitsRatio < $scope.colors[1].value / 100) {
                color = $scope.graph.options.settings.gradedMode ? convertHexToRGBA($scope.colors[1].color,  lowerRatioValue) : $scope.colors[1].color;
              } else {
                color = $scope.colors[2].color;
              }
            } else {
              color = `rgba(24, 181, 21, ${Math.min(obj.ValuesForHours.Totals?.UnitsRatio ,1)})`;
            }
          }else 
            {
              color = obj?.ValuesForHours?.Totals.color
            }
        
            const fontColor =  LeaderMESservice.getBWByColor(color,186,0.5);

            $scope.collectData = [
              ...$scope.collectData,
              {
                x: x,
                y: 0,
                value: text,
                AvailabilityPE: obj?.ValuesForHours?.Totals?.AvailabilityPE,
                color: color,
                AvailabilityPETarget: obj?.ValuesForHours?.Totals?.AvailabilityPETarget,
                UnitsRatio: obj?.ValuesForHours?.Totals?.UnitsRatio,
                total: true,
                dataLabels: {
                  color: fontColor,
                },
              },
              ...$scope.collectDataTemp,
            ];
          }
        });
    
        chartHours = _.map(chartHoursTemp, function (hour) {
          if(hour instanceof String){
            return hour?.replace("T", " ");
          }
            
          return  moment(hour).format($scope.userDateFormat.replace(":ss",""))
        });
     
     
      if (chartHours) {
        chartHours.unshift($filter("translate")("TOTAL"));
      }
      var options = {
        chart: {
          type: "heatmap",
        },
        title: {
          text: "",
        },
        xAxis: {
          categories: $scope.machineNames,
          useHTML: true,
          labels: {
            useHTML: true,
            rotation: false,
            formatter: function () {
              if(!this.value) return;
              var obj = shiftService.prepareLabel(typeof this.value == 'object' ? this.value.name : this.value )
              return `<div  title='${obj.toolTip}' style="${obj.style}">` + obj.value + "</div>";
            },
          },
        },
        yAxis: {
          categories: chartHours,
          title: null,
          useHTML: true,
          labels: {
            formatter: function () {
              if (typeof this.value == "number" && this.pos == this.value) {
                return;
              }
              return this.value;
            },
          },
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
          // enabled: !$scope.graph.options.settings.colorMode,
          enabled: false,
          useHTML: true,
        },
        tooltip: {
          useHTML: true,
          enabled: true,
          formatter: function () {
            if (tooltip == 1) {
              return `<div class="machinesLoadToolTip"><b>${$filter("translate")("AVAILABILITY_PE")}:</b> ${this.point.AvailabilityPE != undefined ? belowOrAboveHundred(this.point.AvailabilityPE * 100) + '%' : null} </br>
              <b>${$filter("translate")("AVAILABILITY_PE_TARGET")}:</b> ${this.point.AvailabilityPETarget != undefined ? belowOrAboveHundred(this.point.AvailabilityPETarget * 100) + '%' : null} </br>
              <b>${$filter("translate")("PERFORMANCE_PERCENTAGE")}:</b> ${this.point.UnitsRatio != undefined ? belowOrAboveHundred(this.point.UnitsRatio * 100) + '%' : null}</div>`;
            }
          },
        },

        series: [
          {
            name: "",
            useHTML: true,
            borderWidth: 0.3,
            borderColor: "gray",
            data: $scope.collectData,
            turboThreshold: 0,
            dataLabels: {
              enabled: true,
              useHTML: true,
              style: {
                direction: localLanguage ? "rtl" : "ltr",
                fontFamily: localLanguage ? "OpenSansHebrew" : `Lucida Grande, Lucida Sans Unicode, Arial, Helvetica, sans-serif`,
              },
              formatter: function () {
                let data = "";
                data = this.point.value;
                var getCell = $(`#container${$scope.graph?.ID}`).find('.highcharts-point')
                if(getCell && getCell.length > 0 && getCell[0].width?.animVal?.value > 100  && getCell[0].height?.animVal?.value > 59)
                {
                  var fontSize = "17px"
                }
                if (this.color) {
                  const fontColor = LeaderMESservice.getBWByColor(this.color,186,0.5);
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
            allowOverlap: false,
            point: {
              events: {
                mouseOver: function (event) {
                  $timeout(function () {
                    // $scope.shiftData.machineLoadSelectedPoint = angular.copy(event.target.options);
                  });
                },
              },
            },
            events: {
              mouseOut: function (event) {
                // $scope.shiftData.machineLoadSelectedPoint = null;
              },
            },
          },
        ],

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
                    var className = `.printHeatMapShift${$scope.graph.template}`;
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
                    });
                  },
                },
                {
                  textKey: "downloadPDF",
                  onclick: function () {
                    $(".diplay-department-name").css("display", "inline-block");
                    var className = `.printHeatMapShift${$scope.graph.template}`;
                    var resourceElement = $(className);
                    var namePDF = $scope.graph.template;
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
                      var doc = new jsPDF("L", "px", [$(className).width(), 1000]);
                      doc.addImage(jpeg, "JPEG", 0, 0, $(className).width(), $(className).height());
                      doc.save(`${namePDF ? namePDF : "simple-file"}.pdf`);
                     
                      // $(`.insight-parameters`).removeClass("hide-print-elements");
                      $(".diplay-department-name").css("display", "none");
                    });
                  },
                },
                {
                  textKey: "downloadCSV",
                  onclick: function () {
                    const rows = [];
                    let row = [];
                    let count = 0;
                    var cell;
                    for (let i = 0; i < chartHours.length; i++) {
                      for (let j = 0; j < $scope.machineNames.length; j++) {
                        cell = _.find($scope.collectData, { x: j, y: i });                      
                        row.push(cell?.value?.split(',')?.join(''));
                      }
                      rows.unshift([chartHours[count++], ...row]);
                      row = [];
                    }
                    rows.unshift(["", ...$scope.machineNames]);
                    let csvContent = "data:text/csv;charset=utf-8," +  rows.map((e) => e.join($sessionStorage.exportCSVDelimiter || ',')).join("\n");
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
      };
      $scope.Chart = Highcharts.chart("container" + $scope.graph.ID, options);
      $timeout(function () {
        $scope.Chart?.setSize($element[0].getBoundingClientRect().width, $scope.options.height);
      }, 200);
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

    $scope.init = function () {
      configuration.getSection("machineAvailability").then(function (response) {
        if (!response) {
          return;
        }
        $scope.opacityLimit = response;
        $scope.updateHours();
        updateMachines();
      });
    };

    $rootScope.$on("loadedTemplate", (e, data) => {
      let component = data.data.find((element) => element.template == $scope.graph.template && element.ID == $scope.graph.ID);

      for (let prop in component) {
        $scope.graph[prop] = component[prop];
      }

      $scope.graph.isFiltered = $scope.graph.localMachines.some((machine) => machine.value == false);
    });

    $(window).resize(function () {
      $scope.Chart?.setSize($element[0].getBoundingClientRect().width, $scope.options.height);
    });

    $scope.$watch(
      "options",
      function (newV, oldV) {
        if (newV.width !== oldV.width || newV.height !== oldV.height) {
          $timeout(function () {
            $scope.initWrapper();
          }, 200);
        }
      },
      true
    );
    $scope.$watch(
      "graph",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          $timeout(function () {
            $scope.initWrapper();
          }, 200);
        }
      },
      true
    );

    $scope.$watchGroup(
      ["colors.colorMode", "colors.gradedMode"],
      function () {
        $scope.initWrapper();
      },
      true
    );

    $scope.$watch(
      "colors",
      function () {
        if ($scope.graph.options.settings.colorMode) {
          $scope.initWrapper();
        }
      },
      true
    );

    $scope.$watch(
      "options.settings.parameter",
      function () {
        updateMachines();
      },
      true
    );

    $scope.$watch(
      "shiftData.machinesLoad",
      function () {
        updateMachines();
      },
      true
    );

    $scope.$watch(
      "graph.localMachines",
      function () {
        updateMachines();
      },
      true
    );

    $scope.$watch(
      "shiftData.machineLoadSelectedPoint",
      function (newValue, oldValue) {
        if (oldValue && newValue && oldValue.x == newValue.x && oldValue.y == newValue.y) {
          return;
        }
        if ($scope.Chart && $scope.Chart.series && $scope.Chart.series.length > 0) {
          if (oldValue) {
            var oldPoint = _.find($scope.Chart.series[0].getValidPoints(), {
              x: oldValue.x,
              y: oldValue.y,
            });
            if (oldPoint) {
              oldPoint.setState("");
            }
          }
          if (newValue) {
            var point = _.find($scope.Chart.series[0].getValidPoints(), {
              x: newValue.x,
              y: newValue.y,
            });
            if (point) {
              point.setState("hover");
            }
          }
        }
      },
      true
    );

    $scope.initWrapper = function () {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        $scope.init();
      }, 300);
    };

    $scope.initWrapper();
  };

  return {
    restrict: "E",
    templateUrl: Template,
    scope: {
      options: "=",
      graph: "=",
      colors: "=",
    },
    controller: controller,
    controllerAs: "machinesLoadCtrl",
  };
};

angular.module("LeaderMESfe").directive("machinesLoadDirective", machinesLoadDirective);
