/**
 * Created on 27/03/2016.
 */

var totalPercentage = function (depColors) {
  var percentage = 0;

  angular.forEach(depColors, function (item) {
    item.percentage = parseFloat(item.percentage.toFixed(2));
    percentage += item.percentage;
  });

  return percentage;
};

var fixPercentage = function (depColors) {
  var total = 0;
  for (var i = depColors.length - 1; i >= 0; i--) {
    if (depColors[i].percentage > 0) {
      depColors[i].percentage = Math.floor((100 * depColors[i].percentage) / totalPercentage(depColors));
      total += depColors[i].percentage;
    }
    if (i == 0) {
      depColors[i].percentage += 100 - total;
    }
  }
};

var setMachineStatus = function (tmpMachine, machine, department) {
  var colorBar;
  machine.MachineStatusID = tmpMachine.MachineStatusID;
  switch (machine.MachineStatusID) {
    case 1:
      colorBar = _.find(department.machineColorsBar, { color: "1" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "1",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "grey";
      machine.SecondTrafficColor = "grey";
      machine.ThirdTrafficColor = "green";
      machine.minimizColor = "#1aa917";
      machine.icon = "working.png";

      return;
    case 2:
      colorBar = _.find(department.machineColorsBar, { color: "2" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "2",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "grey";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "grey";
      machine.minimizColor = "#fba30c";
      machine.icon = "param_deviation.png";
      return;
    case 3:
      colorBar = _.find(department.machineColorsBar, { color: "3" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "3",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "red";
      machine.SecondTrafficColor = "grey";
      machine.ThirdTrafficColor = "grey";
      machine.minimizColor = "#bf1620";
      machine.icon = "stopped.png";
      return;
    case 4:
      colorBar = _.find(department.machineColorsBar, { color: "4" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "4",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "red";
      machine.SecondTrafficColor = "red";
      machine.ThirdTrafficColor = "red";
      machine.minimizColor = "#959595";
      machine.icon = "comm_faillure.png";
      return;
    case 5:
      colorBar = _.find(department.machineColorsBar, { color: "5" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "5",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "yellow";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "green";
      machine.minimizColor = "#166715";
      machine.icon = "setup_working.png";
      return;
    case 6:
      colorBar = _.find(department.machineColorsBar, { color: "6" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "6",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "red";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "yellow";
      machine.minimizColor = "#166715";
      machine.icon = "setup_stopped.png";
      return;
    case 7:
      colorBar = _.find(department.machineColorsBar, { color: "7" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "7",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
        });
      }
      machine.FirstTrafficColor = "yellow";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "yellow";
      machine.minimizColor = "#959595 ";
      machine.icon = "comm_faillure.png";
      return;
    case 8:
      colorBar = _.find(department.machineColorsBar, { color: "8" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "8",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
          icon: "stop_idle.png",
        });
      }
      machine.FirstTrafficColor = "yellow";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "yellow";
      machine.minimizColor = "#959595";
      machine.icon = "stop_idle.png";
      return;
    case 9:
      colorBar = _.find(department.machineColorsBar, { color: "9" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "9",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
          icon: "no-job-copy.png",
        });
      }
      machine.FirstTrafficColor = "#BF1620";
      machine.SecondTrafficColor = "#BF1620";
      machine.ThirdTrafficColor = "#BF1620";
      machine.minimizColor = "#BF1620";
      machine.icon = "no-job-copy.png";
      return;
    case 0:
      colorBar = _.find(department.machineColorsBar, { color: "0" });
      if (colorBar) {
        colorBar.count = colorBar.count + 1;
        colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
      } else {
        department.machineColorsBar.push({
          color: "0",
          count: 1,
          percentage: 100 / department.DepartmentsMachine.length,
          icon: "no_job.png",
        });
      }
      machine.FirstTrafficColor = "yellow";
      machine.SecondTrafficColor = "yellow";
      machine.ThirdTrafficColor = "yellow";
      machine.minimizColor = "#959595 ";
      machine.icon = "no_job.png";
      return;
  }

  machine.FirstTrafficColor = "grey";
  machine.SecondTrafficColor = "grey";
  machine.ThirdTrafficColor = "grey";
  machine.minimizColor = "#959595";
  colorBar = _.find(department.machineColorsBar, { color: "4" });
  if (colorBar) {
    colorBar.count = colorBar.count + 1;
    colorBar.percentage = (colorBar.count * 100) / department.DepartmentsMachine.length;
  } else {
    department.machineColorsBar.push({
      color: "4",
      count: 1,
      percentage: 100 / department.DepartmentsMachine.length,
    });
  }
};

var getChildTemplate = function (boxId) {
  var template = "views/custom/productionFloor/common/huge.html";

  switch (boxId) {
    case 9:
      template = "views/custom/productionFloor/common/huge.html";
      break;
    case 5:
      template = "views/custom/productionFloor/common/big1.html";
      break;
    case 6:
      template = "views/custom/productionFloor/common/big2.html";
      break;
    case 7: //big3
      template = "views/custom/productionFloor/common/big3.html";
      break;
    case 8: //big4
      template = "views/custom/productionFloor/common/big4.html";
      break;
    case 3:
      template = "views/custom/productionFloor/common/small1.html";
      break;
    case 4:
      template = "views/custom/productionFloor/common/small2.html";
      break;
    case 1: //minismall1
      template = "views/custom/productionFloor/common/miniSmall1.html";
      break;
    case 2: //minismall2
      template = "views/custom/productionFloor/common/miniSmall2.html";
      break;
  }
  return template;
};

function machineBoxDirective($interval, PRODUCTION_FLOOR) {
  var template = "views/custom/productionFloor/common/machineBox.html";
  var controller = function ($compile, $scope, $rootScope,LeaderMESservice, $timeout, $interval, $state, SweetAlert, PRODUCTION_FLOOR, $filter, $sessionStorage) {
    var self = $scope;
    $scope.refreshTime = $sessionStorage.onlineRefreshTime || PRODUCTION_FLOOR.REFRESH_TIME;
    $scope.departmentsStatus = [];
    $scope.doneLoading = false;
    $scope.closeThis = function () {
      if ($scope.spinClosed == false) {
        $(".spin-icon").trigger("click");
      }
    };

    $scope.showBreadCrumb = true;
    if ($state.current.name == "customFullView") {
      $scope.showBreadCrumb = false;
    }

    var isNumeric = function (num) {
      if (num == "") {
        return false;
      }
      return !isNaN(num);
    };

    var buildTextColor = function (param, child) {
      if (!param) {
        return "";
      }
      if (param && param.TextColor) {
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
              if (child == 1) {
                param.TextColorData = "none";
              } else {
                param.TitleTextColor = "none";
              }
            }
          } else {
            if (child == 1) {
              param.TextColorData = "none";
            } else {
              param.TitleTextColor = "none";
            }
          }
        } else if (param.TextColor.id === "3") {
          if (child == 1) {
            param.TextColorData = param.TextColor.color;
          } else {
            param.TitleTextColor = param.color;
          }
        } else {
          if (child == 1) {
            param.TextColorData = "none";
          } else {
            param.TitleTextColor = "none";
          }
        }
      }
      if (child == 1) {
        param.TextColorData = "color : " + param.TextColorData;
      } else {
        param.TitleTextColor = "color : " + param.color;
      }
      if (child == 1) {
        return "color : " + param.TextColorData;
      } else {
        return "color : " + param.color;
      }
    };

    $scope.updateMachineData = function () {
      var index = 0;      
      var request = { DepartmentID: $scope.content.SubMenuExtID };
      const promises = [];
      promises.push(LeaderMESservice.customAPI("GetMachineCubeData", request));
      promises.push(LeaderMESservice.customAPI("GetJobCustomParameters", {}));
      Promise.all(promises).then(function (res) {
        const response = res[0];
        const customParams = res[1] && res[1].JobParams || [];
        const jobCustomParams = response.JobCustomParameters || [];

        if ($scope.content.SubMenuExtID) {
          LeaderMESservice.customAPI('GetDepartmentShiftData',{
            "ReqDepartment":[{"DepartmentID": $scope.content.SubMenuExtID,"RefShiftDays":0}]
          }).then(shiftResp => {
          const department = _.find(shiftResp.Departments,{ID: $scope.content.SubMenuExtID});
            const currentDepartment = _.find($scope.departmentsDataStructure.AllDepartments,{DepartmentID: $scope.content.SubMenuExtID});
            if (department && department.CurrentShift && currentDepartment) {
              department.CurrentShift.forEach(shift => {
                if (shift.Machines) {
                  shift.Machines.forEach(machine => {
                    const currentMachine = _.find(currentDepartment.DepartmentsMachine, {MachineID : machine.Id});
                    if (currentMachine) {
                      currentMachine.events = machine.Events || [];
                      const startTime = new Date(shift.StartTime);
                      const endTime = new Date(shift.EndTime);
                      if (!currentMachine.shiftStartTime || currentMachine.shiftStartTime > startTime) {
                        currentMachine.shiftStartTime = startTime;
                      }
                      if (!currentMachine.shiftEndTime || currentMachine.shiftEndTime < endTime) {
                        currentMachine.shiftEndTime = endTime;
                      }
                    }
                    currentMachine.shiftTotalDuration = Math.floor((currentMachine.shiftEndTime - currentMachine.shiftStartTime) / 1000 / 60);
                  });
                }
              });
            }
          });
        }
        $scope.lastUpdate = new Date();
        $scope.updateCallback.lastUpdate = $scope.lastUpdate;
        if (_.find(response.AllDepartments, { RTOnline: false })) {
          SweetAlert.swal($filter("translate")("WARNING_OFFLINE_MESSAGE"), $filter("translate")("CONTACT_EMERALD"), "error");
        }
        for (var i = 0; i < $scope.departmentsDataStructure.AllDepartments.length; i++) {
          var department = $scope.departmentsDataStructure.AllDepartments[i];
          var newDepartmentData = _.find(response.AllDepartments, {
            DepartmentID: department.DepartmentID,
          });
          if (!newDepartmentData) {
            continue;
          }
          $rootScope.$broadcast('managerLogin',{AllowShiftManagerLogin :newDepartmentData.AllowShiftManagerLogin});
          department.ShiftElapsedTime = newDepartmentData.ShiftElapsedTime;
          department.iboxData.DepartmentID = department.DepartmentID;
          department.iboxData.DepartmentPEE = department.DepartmentPEE;
          department.iboxData.ShiftStartTime = department.ShiftStartTime;
          //change machine color bar
          department.machineColorsBar = [];
          department.machineColorsBar.push({
            color: "1",
            count: 0,
            percentage: 0,
            icon: "working.png",
          }); //green
          department.machineColorsBar.push({
            color: "5",
            count: 0,
            percentage: 0,
            icon: "setup_working.png",
          }); //green
          department.machineColorsBar.push({
            color: "3",
            count: 0,
            percentage: 0,
            icon: "stopped.png",
          }); //red
          department.machineColorsBar.push({
            color: "6",
            count: 0,
            percentage: 0,
            icon: "setup_stopped.png",
          }); //red
          department.machineColorsBar.push({
            color: "0",
            count: 0,
            percentage: 0,
            icon: "no_job.png",
          }); //red
          department.machineColorsBar.push({
            color: "4",
            count: 0,
            percentage: 0,
            icon: "comm_faillure.png",
          }); //RED
          department.machineColorsBar.push({
            color: "7",
            count: 0,
            percentage: 0,
            icon: "comm_faillure.png",
          }); //RED
          department.machineColorsBar.push({
            color: "2",
            count: 0,
            percentage: 0,
            icon: "param_deviation.png", //orange
          });
          department.machineColorsBar.push({
            color: "8",
            count: 0,
            percentage: 0,
            icon: "stop_idle.png",
          }); //grey
          department.machineColorsBar.push({
            color: "9",
            count: 0,
            percentage: 0,
            icon: "no-job-copy.png",
          }); //grey

          const machineCustomParams = [];
          customParams.forEach(customParam => {
            machineCustomParams.push({
              CollapseMachineParamsDisplayOrder: null,
              CurrentValue: null,
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
          for (var j = 0; j < department.DepartmentsMachine.length; j++) {
            var machine = department.DepartmentsMachine[j];
            //TODO  Joun product name update (to fix later) bug production floor, task id in teamwork is #5352087
            machine.updatedDate = new Date();
            var newMachineData = _.find(newDepartmentData.DepartmentsMachine, {
              MachineID: machine.MachineID,
            });
            if (!newMachineData) {
              continue;
            }
            setMachineStatus(newMachineData, machine, department);
            for (var key in newMachineData) {
              machine[key] = newMachineData[key];
            }
            machine.MachineParams = machine.MachineParams.concat(angular.copy(machineCustomParams));
            const jobCustomParam = _.find(jobCustomParams,{JobID: machine.JobID});
            if (jobCustomParam){
              for(let key in jobCustomParam) {
                if (key === 'JobID'){
                  continue;
                }
                const customParam = _.find(machine.MachineParams, {FieldName : key});
                if (customParam){
                  customParam.CurrentValue = jobCustomParam[key];
                }
              }
            }
            index++;
            if (machine) {
              //title
              if (machine.TitleName) {
                var tmpTitleParam = _.find(newMachineData.MachineParams, {
                  FieldName: machine.TitleName,
                });
                if (tmpTitleParam) {
                  if (isNumeric(tmpTitleParam.CurrentValue)) {
                    machine.TitleCurrentValue = parseFloat(tmpTitleParam.CurrentValue);
                  } else {
                    machine.TitleCurrentValue = tmpTitleParam.CurrentValue;
                  }
                  machine.TitleHighLimit = tmpTitleParam.HighLimit;
                  machine.TitleLowLimit = tmpTitleParam.LowLimit;
                  machine.TitleStandardValue = tmpTitleParam.StandardValue;
                  machine.TitleTextColor = buildTextColor(machine.TitleTextColorStructure, 0);
                }
              }
              for (var k = 0; k < machine.Children.length; k++) {
                var child = machine.Children[k];
                if (!child) {
                  continue;
                }
                child.index = k;
                for (var l = 0; l < child.areas.length; l++) {
                  var fields = child.areas[l];
                  for (var m = 0; m < fields.fields.length; m++) {
                    var param = fields.fields[m];
                    if (param) {
                      var tmpParam = _.find(newMachineData.MachineParams, {
                        FieldName: param.FieldName,
                      });
                      if (tmpParam) {
                        if (isNumeric(tmpParam.CurrentValue) || tmpParam.CurrentValue === "0") {
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
                            var otherTmpParam = _.find(newMachineData.MachineParams, { FieldName: otherParam });
                            if (otherTmpParam) {
                              if (isNumeric(otherTmpParam.CurrentValue)) {
                                param.otherParamFieldname = parseFloat(otherTmpParam.CurrentValue);
                              }
                            }
                          }
                        }
                        if (param.cellColor) {
                          if (param.cellColor.show == true) {
                            if (param.cellColor.fieldname) {
                              var booleanParam = _.find(machine.MachineParams, {
                                FieldName: param.cellColor.fieldname,
                              });
                              if (booleanParam) {
                                if (param.cellColor.BooleanValue == true && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "1" || booleanParam.CurrentValue.toLowerCase() == "true")) {
                                  param.backgroundColor = param.cellColor.color;
                                } else if (param.cellColor.BooleanValue == false && booleanParam.DisplayType == "boolean" && (booleanParam.CurrentValue == "0" || booleanParam.CurrentValue.toLowerCase() == "false")) {
                                  param.backgroundColor = param.cellColor.color;
                                }
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
          // department.machineColorsBar
          var diff = totalPercentage(department.machineColorsBar) - 100;
          if (diff > 0) {
            var index = -1;
            var max = 0;
            for (var i = 0; i < department.machineColorsBar.length; i++) {
              if (department.machineColorsBar[i].percentage > max) {
                max = department.machineColorsBar[i].percentage;
                index = i;
              }
            }
            department.machineColorsBar[index].percentage -= diff;
          }
          $scope.sortMachineParams(department);
        }
      });
    };

    $scope.updateCallback.updateData = $scope.updateMachineData;
    $scope.updateCallback.lastUpdate = new Date();
    var getMachineData = function (firstTime) {
      var index = 0;
      var request = { DepartmentID: $scope.content.SubMenuExtID };
      const promises = [];
      promises.push(LeaderMESservice.customAPI("GetMachineCubeData", request));
      promises.push(LeaderMESservice.customAPI("GetJobCustomParameters", {}));
      Promise.all(promises).then(res => {
        const response = res[0];
        const customParams = res[1] && res[1].JobParams || [];
        $scope.lastUpdate = new Date();
        $scope.updateCallback.lastUpdate = $scope.lastUpdate;
        if (_.find(response.AllDepartments, { RTOnline: false })) {
          SweetAlert.swal($filter("translate")("WARNING_OFFLINE_MESSAGE"), $filter("translate")("CONTACT_EMERALD"), "error");
        }
        var allDepartments = response.AllDepartments;
          $scope.departmentsDataStructure = {
          AllDepartments: allDepartments,
        };
        const jobCustomParams = response.JobCustomParameters || [];
        if ($scope.content.SubMenuExtID) {
          LeaderMESservice.customAPI('GetDepartmentShiftData',{
            "ReqDepartment":[{"DepartmentID": $scope.content.SubMenuExtID,"RefShiftDays":0}]
          }).then(shiftResp => {
          const department = _.find(shiftResp.Departments,{ID: $scope.content.SubMenuExtID});
            const currentDepartment = _.find(allDepartments,{DepartmentID: $scope.content.SubMenuExtID});
            if (department && department.CurrentShift && currentDepartment) {
              department.CurrentShift.forEach(shift => {
                if (shift.Machines) {
                  shift.Machines.forEach(machine => {
                    const currentMachine = _.find(currentDepartment.DepartmentsMachine, {MachineID : machine.Id});
                    if (currentMachine) {
                      currentMachine.events = machine.Events || [];
                      const startTime = new Date(shift.StartTime);
                      const endTime = new Date(shift.EndTime);
                      if (!currentMachine.shiftStartTime || currentMachine.shiftStartTime > startTime) {
                        currentMachine.shiftStartTime = startTime;
                      }
                      if (!currentMachine.shiftEndTime || currentMachine.shiftEndTime < endTime) {
                        currentMachine.shiftEndTime = endTime;
                      }
                    }
                    currentMachine.shiftTotalDuration = Math.floor((currentMachine.shiftEndTime - currentMachine.shiftStartTime) / 1000 / 60);
                  });
                }
              });
            }
          });
        }
        $scope.departmentsStatus = [];
        for (var i = 0; i < $scope.departmentsDataStructure.AllDepartments.length; i++) {
          var department = $scope.departmentsDataStructure.AllDepartments[i];
          $rootScope.$broadcast('managerLogin',{AllowShiftManagerLogin:department.AllowShiftManagerLogin,ShiftManager:res && res[0]?.ShiftManager});
          $scope.departmentsStatus.push({
            DepartmentID: department.DepartmentID,
            open: false,
          });
          department.open = false;
          if ($scope.content.SubMenuExtID == 0) {
            department.allMachines = true;
          } else {
            department.allMachines = false;
          }
          department.machineColorsBar = [];
          department.machineColorsBar.push({
            color: "1",
            count: 0,
            percentage: 0,
            icon: "working.png",
          }); //green
          department.machineColorsBar.push({
            color: "5",
            count: 0,
            percentage: 0,
            icon: "setup_working.png",
          }); //green
          department.machineColorsBar.push({
            color: "3",
            count: 0,
            percentage: 0,
            icon: "stopped.png",
          }); //red
          department.machineColorsBar.push({
            color: "6",
            count: 0,
            percentage: 0,
            icon: "setup_stopped.png",
          }); //red
          department.machineColorsBar.push({
            color: "0",
            count: 0,
            percentage: 0,
            icon: "no_job.png",
          }); //red
          department.machineColorsBar.push({
            color: "4",
            count: 0,
            percentage: 0,
            icon: "comm_faillure.png",
          }); //RED
          department.machineColorsBar.push({
            color: "7",
            count: 0,
            percentage: 0,
            icon: "comm_faillure.png",
          }); //RED
          department.machineColorsBar.push({
            color: "2",
            count: 0,
            percentage: 0,
            icon: "param_deviation.png", //orange
          });
          department.machineColorsBar.push({
            color: "8",
            count: 0,
            percentage: 0,
            icon: "stop_idle.png",
          }); //grey
          department.machineColorsBar.push({
            color: "9",
            count: 0,
            percentage: 0,
            icon: "no-job-copy.png",
          }); //grey
          department.iboxData = {
            DepartmentID: department.DepartmentID,
            DepartmentPEE: department.DepartmentPEE,
          };

          const machineCustomParams = [];
          customParams.forEach(customParam => {
            machineCustomParams.push({
              CollapseMachineParamsDisplayOrder: null,
              CurrentValue: null,
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
          for (var j = 0; j < department.DepartmentsMachine.length; j++) {
            var machine = department.DepartmentsMachine[j];
            machine.MachineParams = machine.MachineParams.concat(angular.copy(machineCustomParams));
            const jobCustomParam = _.find(jobCustomParams,{JobID: machine.JobID});
            if (jobCustomParam){ 
              for(let key in jobCustomParam) {
                if (key === 'JobID'){
                  continue;
                }
                const customParam = _.find(machine.MachineParams, {FieldName : key});
                if (customParam){
                  customParam.CurrentValue = jobCustomParam[key];
                }
              }
            }
            machine.collapsed = false;
            setMachineStatus(machine, machine, department);
            var machineStructure = _.find($scope.machineTypes, {
              ID: machine.MachineTypeID,
            });
            if (machineStructure == undefined) {
              $scope.machineBox = undefined;
              $scope.doneLoading = true;
              department.iboxData.showCollapse = false;
              department.done = true;
              return;
            }
            department.iboxData.showCollapse = true;
            index++;
            if (machineStructure) {
              if (machineStructure.CubeStructure !== null && machineStructure.CubeStructure) {
                var structure = JSON.parse(machineStructure.CubeStructure);
                machine.BoxSize = structure.boxSize;
                if (machine.BoxSize == 3 || machine.BoxSize == 5) {
                  structure.width = 172;
                } else if (machine.BoxSize == 11) {
                  structure.width = 449 + 23;
                }
                machine.chosenSize = structure.chosenSize;
                machine.height = structure.height;
                machine.width = structure.width;
                machine.Children = structure.Children;
                machine.columns = structure.columns;
                machine.DepartmentID = department.DepartmentID;
                machine.TitleWidthPercent = 0;
                //title
                if (structure.Title) {
                  var tmpTitleParam = _.find(machine.MachineParams, {
                    FieldName: structure.Title.dynamicValue,
                  });

                  machine.TitleName = structure.Title.dynamicValue;
                  if (tmpTitleParam) {
                    if (isNumeric(tmpTitleParam.CurrentValue)) {
                      machine.TitleCurrentValue = parseFloat(tmpTitleParam.CurrentValue);
                    } else {
                      machine.TitleCurrentValue = tmpTitleParam.CurrentValue;
                    }
                    machine.TitleEName = tmpTitleParam.FieldEName;
                    machine.TitleLName = tmpTitleParam.FieldLName;
                    machine.TitleName = tmpTitleParam.FieldName;
                    machine.TitleHighLimit = tmpTitleParam.HighLimit;
                    machine.TitleLowLimit = tmpTitleParam.LowLimit;
                    if (structure.Title.paramWidthPercent) {
                      machine.TitleWidthPercent = structure.Title.paramWidthPercent;
                    } else {
                      machine.TitleWidthPercent = 30;
                    }
                    machine.TitleStandardValue = tmpTitleParam.StandardValue;
                    machine.TitleTextColorStructure = structure.Title.TextColor;
                    machine.TitleTextColor = buildTextColor(structure.Title.TextColor, 0);
                  }
                }

                for (var k = 0; k < machine.Children.length; k++) {
                  var child = machine.Children[k];
                  if (!child) continue;
                  child.template = getChildTemplate(child.boxId);
                  child.DepartmentID = department.DepartmentID;
                  child.MachineID = machine.MachineID;
                  child.index = k;
                  for (var l = 0; l < child.areas.length; l++) {
                    var fields = child.areas[l];
                    for (var m = 0; m < fields.fields.length; m++) {
                      var param = fields.fields[m];
                      if (param) {
                        var tmpParam = _.find(machine.MachineParams, {
                          FieldName: param.FieldName,
                        });
                        if (tmpParam) {
                          if (isNumeric(tmpParam.CurrentValue) || tmpParam.CurrentValue === "0") {
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

                          if (param.OtherParam)
                            if (param.OtherParam.show == true) {
                              var otherParam = param.OtherParam.fieldname;
                              var otherTmpParam = _.find(machine.MachineParams, { FieldName: otherParam });
                              if (otherTmpParam)
                                if (isNumeric(otherTmpParam.CurrentValue)) {
                                  param.otherParamFieldname = parseFloat(otherTmpParam.CurrentValue);
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
          }

          // department.machineColorsBar
          var diff = totalPercentage(department.machineColorsBar) - 100;
          if (diff > 0) {
            var index = -1;
            var max = 0;
            for (var i = 0; i < department.machineColorsBar.length; i++) {
              if (department.machineColorsBar[i].percentage > max) {
                max = department.machineColorsBar[i].percentage;
                index = i;
              }
            }
            department.machineColorsBar[index].percentage -= diff;
          }
          $scope.sortMachineParams(department);
          department.done = true;
        }
        $scope.doneLoading = true;
        // console.log($scope.departmentsDataStructure);
      });
    };

    $scope.sortMachineParams = function (department) {
      department.DepartmentsMachine.forEach((machine) => {

        if (_.findIndex(machine.MachineParams, { FieldName: "productName" }) < 0) {
          machine.MachineParams.unshift({
            FieldName: "productName",
            FieldEName: $filter("translate")("PRODUCT_NAME"),
            FieldLName: $filter("translate")("PRODUCT_NAME"),
            CurrentValue: $scope.rtl === "rtl" ? machine.ProductLName : machine.ProductEName,
          });
        }

        
        if (_.findIndex(machine.MachineParams, {
          FieldName: "customUIImage"
        }) < 0) {
          machine.MachineParams.unshift({
            FieldName: "customUIImage",
            FieldEName: $filter("translate")("CUSTOM_UI_IMAGE"),
            FieldLName: $filter("translate")("CUSTOM_UI_IMAGE"),
          });
        }

        if ($scope.localLanguage) {
          machine.MachineParams = _.sortByOrder(machine.MachineParams, ["FieldLName"]);
        } else {
          machine.MachineParams = _.sortByOrder(machine.MachineParams, ["FieldEName"]);
        }

        if (_.findIndex(machine.MachineParams, { FieldName: "removeParam" }) < 0) {
          machine.MachineParams.unshift({
            FieldName: "removeParam",
            FieldEName: $filter("translate")("REMOVE_PARAM"),
            FieldLName: $filter("translate")("REMOVE_PARAM"),
            CurrentValue: "",
          });
        }
      });
    };

    var getProductionFloorMachines = function () {
      LeaderMESservice.getCubeStructure().then(function (response) {
        $scope.machineTypes = [];
        for (var i = 0; i < response.length; i++) {
          $scope.machineTypes.push(response[i]);
        }
        getMachineData(true);
      });
    };

    var init = function () {
      $scope.shapeShiftDone = false;
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      getProductionFloorMachines();
      $scope.disableButtons = false;
      $scope.getJobDefinition();
    };
    $scope.getJobDefinition = function () {
      LeaderMESservice.customAPI("GetJobDefinitions", {}).then(function (response) {
        $sessionStorage.jobDefinitions = response.JobDefinitions;
      });
    };
    $scope.collapseDepartment = function (id) {
      var depStatus = _.find($scope.departmentsStatus, { DepartmentID: id });
      var dep = _.find($scope.departmentsDataStructure.AllDepartments, {
        DepartmentID: id,
      });
      depStatus.open = !depStatus.open;
      dep.open = !dep.open;
    };

    $scope.collapseAll = function () {
      if ($scope.disableButtons) {
        return;
      }
      $scope.$broadcast("ngCollapseAll", true);
      $scope.disableButtons = true;
      $timeout(function () {
        $(".spin-icon").click();
        $timeout(function () {
          $scope.disableButtons = false;
        }, 200);
      }, 100);
    };

    $scope.expandAll = function () {
      if ($scope.disableButtons) {
        return;
      }
      $scope.$broadcast("ngCollapseAll", false);
      $scope.disableButtons = true;
      $timeout(function () {
        $(".spin-icon").click();
        $timeout(function () {
          $scope.disableButtons = false;
        }, 200);
      }, 100);
    };

    $scope.initActionConfig = function () {
      $scope.spinClosed = true;
      // SKIN Select
      $(".spin-icon").click(function () {
        $scope.spinClosed = !$scope.spinClosed;
        $(".theme-config-box").toggleClass("show");
        var themeConfig = $(".theme-config");
        if ($scope.spinClosed === true) {
          themeConfig.css("z-index", 10000);
          $timeout(function () {
            $(".theme-config").height(40);
            $(".theme-config-box").height(40);
          }, 1000);
        } else {
          themeConfig.css("z-index", 10000);
          $(".theme-config").height(themeConfigHeight);
          $(".theme-config-box").height(themeConfigHeight);
        }
      });
      var themeConfigHeight = $(".theme-config").height();
      $(".theme-config").height(40);
      $(".theme-config-box").height(40);
    };

    $scope.manualUpdateData = function () {
      $timeout(function () {
        $scope.updateMachineData();
      }, 2000);
    };
    $rootScope.$on("updateMachineDataFunction", function () {
      $scope.updateMachineData()
    });
    init();
  };

  return {
    restrict: "E",
    templateUrl: template,
    controller: controller,
    link: function (scope, element, attr) {
      var updateData = $interval(function () {
        scope.updateMachineData();
      }, scope.refreshTime);
      element.on("$destroy", function () {
        $interval.cancel(updateData);
      });
    },
    scope: {
      content: "=",
      oldView: "=",
      updateCallback: "=",
      isDefaultStructure:"="
    },
    controllerAs: "machineBoxCtrl",
  };
}

function depDirective() {
  var template = "views/custom/productionFloor/common/departments.html";

  var controller = function ($scope,  $rootScope,LeaderMESservice, PRODUCTION_FLOOR, $sessionStorage, $state, $stateParams) {
    $scope.dep = $scope.content;
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.doneLoading = false;
    $scope.departmentCollapsed = false;

    $scope.collapsed = PRODUCTION_FLOOR.COLLAPSED;
    $scope.collapsedMachines = PRODUCTION_FLOOR.COLLAPSED_MACHINES;
    var mainMenu = $sessionStorage.mainMenu;
    $scope.menu = null;
    if (mainMenu) {
      var index = _.findIndex(mainMenu, function (menu) {
        if (menu.subMenu && menu.subMenu[0] && menu.subMenu[0].SubMenuTargetTYpe == "custom:GetMachineCubeData") {
          return true;
        }
        return false;
      });
      if (index >= 0) {
        $scope.menu = _.find(mainMenu[index].subMenu, {
          SubMenuExtID: $scope.dep.DepartmentID,
        });
      }
    }

    $scope.openFullView = function () {
      var url = $state.href($scope.menu.fullView, $scope.menu.fullViewData);
      window.open(url, "_blank");
    };

    $scope.showHideDepartment = function (notByUser) {
      $scope.collapsed = !$scope.collapsed;

      if (notByUser) {
        $scope.collapsed = PRODUCTION_FLOOR.COLLAPSED;
      }
      if ($scope.collapsed === true) {
        $(".machineShapeShift" + $scope.dep.DepartmentID).trigger("ss-destroy");
        $scope.doneLoading = false;
      }
    };

    $scope.$on("ngCollapseAll", function (event, collapse) {
      if ($scope.collapsed === false) {
        if ($scope.departmentCollapsed === collapse) {
          return;
        }
        $scope.departmentCollapsed = !$scope.departmentCollapsed;
        $scope.count = 0;
        if (collapse == false) $scope.doneLoading = false;
        $scope.$broadcast("collapseMachines", collapse, $scope.dep.DepartmentID, function () {
          $scope.count++;
          var callbackFun = function () {
            $scope.count--;
            if ($scope.count == 0) {
              $scope.shapeShiftDone = true;
              $(".machineShapeShift" + $scope.dep.DepartmentID).shapeshift({
                enableResize: true,
                enableCrossDrop: false,
                enableDrag: false,
                minHeight: 100,
                minColumns: 19,
                align: $scope.localLanguage === true ? "right" : "left",
                autoHeight: true,
                gutterX: 6, // Compensate for div border
                gutterY: 6, // Compensate for div border
                paddingX: 6,
                paddingY: 6,
              });
              if (collapse == false) $scope.doneLoading = true;
            }
          };
          return {
            callbackFun: callbackFun,
          };
        });
      }
    });
    $scope.$on("ngRepeatMachineFinished", function (ngRepeatMachineFinished) {
      $scope.shapeShiftDone = true;
      $(".machineShapeShift" + $scope.dep.DepartmentID).shapeshift({
        enableResize: true,
        enableCrossDrop: false,
        enableDrag: false,
        minHeight: 100,
        minColumns: 19,
        align: $scope.localLanguage === true ? "right" : "left",
        autoHeight: true,
        gutterX: 6,
        gutterY: 6,
        paddingX: 6,
        paddingY: 6,
      });

      if ($scope.collapsedMachines == true) {
        $scope.$broadcast("ngCollapseAll", true);
      }

      $scope.doneLoading = true;
    });
    if ($scope.content.allMachines == false) {
      $scope.showHideDepartment(true);
    }

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      content: "=",
      allDepartments: "=",
    },
    controller: controller,
    controllerAs: "departmentCtrl",
  };
}

function machineDirective() {
  var template = "views/custom/productionFloor/common/machines.html";

  var controller = function ($compile, $scope, LeaderMESservice, $state) {
    $scope.machineBox = $scope.content;
    // console.log($scope.machineBox);
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.collapseMachine = function () {
      $scope.machineBox.collapsed = !$scope.machineBox.collapsed;
    };

    $scope.$on("ngRepeatFinished", function (ngRepeatFinishedEvent) {
      if ($scope.machineBox.collapsed === false) {
        $(".boxShapeShift" + $scope.machineBox.DepartmentID + $scope.machineBox.MachineID).shapeshift({
          enableResize: true,
          enableCrossDrop: false,
          enableDrag: false,
          minColumns: 1,
          columns: $scope.machineBox.columns,
          align: $scope.localLanguage === true ? "right" : "left",
          autoHeight: true,
          gutterX: 0, // Compensate for div border
          gutterY: 0, // Compensate for div border
          paddingX: 0,
          paddingY: 0,
        });
      }
    });

    $scope.openMachine = function (machineBox) {
      var url = $state.href("appObjectMachineFullView", {
        appObjectName: "MachineScreenEditor",
        ID: machineBox.MachineID,
      });
      window.open(url, "_blank");
    };

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
  };

  return {
    restrict: "A",
    templateUrl: template,
    scope: {
      content: "=",
    },
    controller: controller,
    controllerAs: "machineCtrl",
  };
}

function machineParamDirective($compile) {
  var controller = function ($compile, $scope, LeaderMESservice) {
    $scope.child = $scope.content;

    $scope.getChildId = function () {
      return $scope.child.DepartmentID + "_" + $scope.child.MachineID + "_" + $scope.child.index + "_";
    };

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
  };

  return {
    restrict: "E",
    template: '<ng-include src="templateUrl"></ng-include>',
    link: function (scope, element, attr) {
      scope.templateUrl = scope.content.template;
    },
    scope: {
      content: "=",
    },
    controller: controller,
    controllerAs: "childParamCtrl",
  };
}

function dragAndDropDirective($compile) {
  var template = "views/custom/productionFloor/dragNDrop/dragNDrop.html";
  var droppableOptions = function (remainingSize, isHuge) {
    if (remainingSize >= 7.5) {
      if (isHuge == true) return ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2 , .cbig1 ,.cbig2 , .cbig3 , .cbig4";
      else return ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2 , .cbig1 ,.cbig2 , .cbig3 , .cbig4 , .chuge";
    } else if (remainingSize < 7.5 && remainingSize >= 3.75) {
      return ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2 , .cbig1 ,.cbig2 , .cbig3 , .cbig4";
    } else if (remainingSize < 3.75 && remainingSize >= 2.25) {
      return ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2  .cbig3 , .cbig4 ";
    } else if (remainingSize < 2.25 && remainingSize >= 1.5) {
      return ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2 ";
    } else if (remainingSize < 1.5 && remainingSize >= 0.75) {
      return ".cminiSmall1 ,.cminiSmall2";
    } else if (remainingSize < 0.75) {
      return ".none";
    }
  };

  var getBoxRelevantData = function (boxDimension) {
    var heightTwo = 200;
    var heightFour = 400;
    var boxData = {
      maxSize: 3.75,
      columns: 1,
      height: heightTwo,
      width: 210,
      BoxSize: 3,
    };

    switch (boxDimension) {
      case "2x2":
        boxData = {
          maxSize: 3.75,
          columns: 1,
          height: heightTwo,
          width: 220,
          BoxSize: 3,
        };
        break;
      //460
      case "4x2":
        boxData = {
          maxSize: 7.5,
          columns: 8,
          height: heightTwo,
          width: 322,
          BoxSize: 8,
        };
        break;
      case "6x2":
        boxData = {
          maxSize: 11.25,
          columns: 10,
          height: heightTwo,
          width: 470,
          BoxSize: 11,
        };
        break;
      case "8x2":
        boxData = {
          maxSize: 15,
          columns: 12,
          height: heightTwo,
          width: 620,
          BoxSize: 14,
        };
        break;
      case "2x4":
        boxData = {
          maxSize: 7.5,
          columns: 1,
          height: heightFour,
          width: 220,
          BoxSize: 5,
        };
        break;
      case "4x4":
        boxData = {
          maxSize: 15,
          columns: 8,
          height: heightFour,
          width: 322,
          BoxSize: 8,
        };
        break;
      case "6x4":
        boxData = {
          maxSize: 22.5,
          columns: 10,
          height: heightFour,
          width: 470,
          BoxSize: 11,
        };
        break;
      case "8x4":
        boxData = {
          maxSize: 30,
          columns: 12,
          height: heightFour,
          width: 620,
          BoxSize: 14,
        };
        break;
      case "10x4":
        boxData = {
          maxSize: 37.5,
          columns: 17,
          height: heightFour,
          width: 770,
          BoxSize: 21,
        };
        break;
      case "12x4":
        boxData = {
          maxSize: 45,
          columns: 22,
          height: heightFour,
          width: 920,
          BoxSize: 25,
        };
        break;
    }
    return boxData;
  };

  var controller = function ($compile, $scope, $modal, $element, LeaderMESservice, $timeout, toastr, $filter) {
    $scope.boxesStructure = {};
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();

    function init() {
      $scope.showMachine = false;
      $(".clones").shapeshift({
        dragClone: true,
        colWidth: 45,
        enableCrossDrop: false,
        align: $scope.localLanguage === true ? "right" : "left",
      });

      $(".trash").shapeshift({
        align: "left",
        enableTrash: true,
        enableDrag: false,
      });

      $(".trash").droppable("option", "accept", ".sminiSmall1 ,.sminiSmall2 ,.ssmall1 , .ssmall2 , .sbig1 ,.sbig2 , .sbig3 , .sbig4 , .shuge");

      $(".dropdown-menu li").click(function () {
        var chosenSize = $(this).find("a").text();
        var bol = true;
        // $scope.currentMachine.currentSize=0;
        if (chosenSize != $scope.currentMachine.currentSize) {
          $scope.currentMachine.chosenSize = chosenSize;
          var boxData = getBoxRelevantData(chosenSize);

          if (boxData.maxSize - $scope.currentMachine.currentSize < 0) {
            alert("you have to drop some items to resize ");
          } else {
            if (chosenSize == "2x4") {
              var obj = _.find($scope.currentMachine.Children, {
                class: "shuge ss-active-child huge",
              });
              if (obj) {
                alert("you have to drop huge components before ");
                bol = false;
              }
            }
            if (bol == true) {
              $scope.currentMachine.maxSize = boxData.maxSize;
              $scope.currentMachine.columns = boxData.columns;
              $scope.currentMachine.width = boxData.width;
              $scope.currentMachine.height = boxData.height;
              $scope.currentMachine.boxSize = boxData.BoxSize;
              $(".droparea").shapeshift({
                align: $scope.localLanguage === true ? "right" : "left",
                colWidth: 41,
                maxHeight: 500,
                columns: $scope.currentMachine.columns,
                minColumns: 1,
                gutterX: 9,
                gutterY: 0,
                paddingX: 0,
                paddingY: 0,
              });
              if (chosenSize !== "2x4") $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize));
              else $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize, true));

              $("#panel-body1").width($scope.currentMachine.width + 40);
              $("#dropArea").height($scope.currentMachine.height);
            }
          }
        }
      });

      $(".trash").on("ss-trashed", function (e, selected) {
        // console.log("ss-trashed")
        $("#animation_box").addClass("rubberBand");
        setTimeout(function () {
          $("#animation_box").removeClass("rubberBand");
        }, 800);
        var areaSize = getAreaSize(selected.classList[0]);
        $scope.currentMachine.currentSize = $scope.currentMachine.currentSize - areaSize;
        var boxIndex = parseInt(selected.id);
        $scope.currentMachine.Children.splice(boxIndex, 1);
        $scope.showMachine = false;
        $timeout(function () {
          $scope.showMachine = true;
        }, 500);
        $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize));
      });
    }

    var getAreaSize = function (className) {
      var aresSize = 0;
      switch (className) {
        case "shuge":
          aresSize = 7.5;
          break;
        case "sbig1":
          aresSize = 3.75;
          break;
        case "sbig2":
          aresSize = 3.75;
          break;
        case "sbig3":
          aresSize = 2.25;
          break;
        case "sbig4":
          aresSize = 2.25;
          break;
        case "ssmall1":
          aresSize = 1.5;
          break;
        case "ssmall2":
          aresSize = 1.5;
          break;
        case "sminiSmall1":
          aresSize = 0.75;
          break;
        case "sminiSmall2":
          aresSize = 0.75;
          break;
      }
      return aresSize;
    };

    function addBoxToMachine(className) {
      var boxStructure = _.find($scope.boxesStructure, { name: className });
      $scope.currentMachine.Children.push(angular.copy(boxStructure.structure));
      return getAreaSize(className);
    }

    $(".droparea").on("ss-added", function (e, selected) {
      var areaSize = addBoxToMachine(selected.classList[1]);
      // console.log("ss-added");
      selected.remove();
      $scope.showMachine = false;
      $timeout(function () {
        $scope.showMachine = true;
      }, 500);
      $scope.currentMachine.currentSize = $scope.currentMachine.currentSize + areaSize;
      $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize));
    });
    $scope.addItem = function (currentMachine, enableParamWidth) {
      var modalInstance = $modal
        .open({
          templateUrl: "views/custom/productionFloor/dragNDrop/updateBoxFieldTitle.html",
          resolve: {
            machineParams: function () {
              return $scope.machineParams;
            },
          },
          controller: function ($scope, $modalInstance, machineParams, LeaderMESservice) {
            $scope.rtl = LeaderMESservice.isLanguageRTL();
            $scope.TextColor = currentMachine.Title.TextColor;
            if (enableParamWidth) {
              $scope.enableParamWidth = true;
            }

            $scope.paramWidthPercent = currentMachine.Title.paramWidthPercent;
            $scope.withoutConditionsColor = currentMachine.Title.withoutConditionsColor;
            var param = _.find(machineParams, {
              fieldname: currentMachine.Title.dynamicValue,
            });
            if (param) {
              $scope.dynamicValue = param;
            } else {
              $scope.dynamicValue = null;
            }
            if ($scope.TextColor == undefined) $scope.TextColor = {};

            if (!($scope.TextColor.constantsBordersConditions == undefined || $scope.TextColor.constantsBordersConditions.length == 0)) {
              $scope.showMinus = true;
            }
            $scope.dOptions = machineParams;
            $scope.dNumOptions = _.find(machineParams, { DisplayType: "num" });

            $scope.addAnotherConstraint = function () {
              if ($scope.constantsBordersConditionsCondition != undefined && $scope.constantsBordersConditionsValue != null && $scope.constantsBordersConditionsColor != "" && $scope.constantsBordersConditionsColor != undefined) {
                $scope.constantsBordersConditionsValidator = "";
                if ($scope.TextColor.constantsBordersConditions == undefined) $scope.TextColor.constantsBordersConditions = [];
                $scope.TextColor.constantsBordersConditions.push({
                  id: $scope.TextColor.constantsBordersConditions.length,
                });
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].color = $scope.constantsBordersConditionsColor;
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].value = $scope.constantsBordersConditionsValue;
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].condition = $scope.constantsBordersConditionsCondition;

                //reset all
                $scope.constantsBordersConditionsCondition = undefined;
                $scope.constantsBordersConditionsValue = null;
                $scope.constantsBordersConditionsColor = "";
                $scope.showMinus = true;
              } else {
                $scope.constantsBordersConditionsValidator = "you must add the current Borders Conditions params";
              }
            };

            $scope.$watch("dynamicValue", function (result) {
              if (result) {
                if (result.DisplayType !== "num" && result.DisplayType !== "text") $scope.showFields = false;
                else $scope.showFields = true;
              }
            });

            $scope.plusParamWidth = function () {
              if ($scope.paramWidthPercent < 50) $scope.paramWidthPercent++;
            };

            $scope.minusParamWidth = function () {
              if ($scope.paramWidthPercent > 30) $scope.paramWidthPercent--;
            };
            $scope.removeConstraint = function (id) {
              var temp = [];
              for (var r = 0; r < $scope.TextColor.constantsBordersConditions.length; r++) if ($scope.TextColor.constantsBordersConditions[r].id != id) temp.push($scope.TextColor.constantsBordersConditions[r]);

              $scope.TextColor.constantsBordersConditions = temp;
            };

            $scope.update = function () {
              var flag = true;
              if (!$scope.dynamicValue) {
                $scope.dynamicValueValidator = "you must fill this field";
                flag = false;
              } else {
                $scope.dynamicValueValidator = "";
                if ($scope.TextColor) {
                  if ($scope.TextColor.id == 1) {
                    $scope.TextColor.type = "parameter limits";
                    $scope.TextColor.constantsBordersConditions = undefined;
                  } else if ($scope.TextColor.id == 2) {
                    $scope.TextColor.type = "constants Borders";
                    //convert value to int
                    if ($scope.TextColor.constantsBordersConditions) {
                      for (var r = 0; r < $scope.TextColor.constantsBordersConditions.length; r++) {
                        $scope.TextColor.constantsBordersConditions[r].value = parseInt($scope.TextColor.constantsBordersConditions[r].value);
                        if (
                          $scope.TextColor.constantsBordersConditions[r].color == "" ||
                          $scope.TextColor.constantsBordersConditions[r].color == undefined ||
                          $scope.TextColor.constantsBordersConditions[r].condition == "" ||
                          $scope.TextColor.constantsBordersConditions[r].value == NaN ||
                          $scope.TextColor.constantsBordersConditions[r].value == null
                        ) {
                          $scope.constantsBordersConditionsValidator = "you must fill this field";
                          flag = false;
                        }
                      }
                    } else {
                      $scope.constantsBordersConditionsValidator = "you must add the current Borders Conditions params";
                      flag = false;
                    }
                  } else if ($scope.TextColor.id == 3) {
                    $scope.TextColor.type = "without conditions";
                    $scope.TextColor.constantsBordersConditions = undefined;
                    if (!$scope.TextColor.color) {
                      $scope.TextColorValidator = "you must fill this field";
                      flag = false;
                    }
                  }
                }
                if (flag)
                  $modalInstance.close({
                    dynamicValue: $scope.dynamicValue,
                    TextColor: $scope.TextColor,
                    paramWidthPercent: $scope.paramWidthPercent,
                  });
              }
            };
            $scope.exit = function () {
              $modalInstance.close();
            };
            $scope.clearAll = function () {
              $scope.TextColor = undefined;
              $scope.dynamicValue = undefined;
              $scope.paramWidthPercent = 30;
              $modalInstance.close({
                response: "clearAll",
              });
            };
          },
        })
        .result.then(function (result) {
          if (result) {
            if (result.dynamicValue) currentMachine.Title.dynamicValue = result.dynamicValue.fieldname;
            else currentMachine.Title.dynamicValue = undefined;

            if (result.paramWidthPercent) {
              currentMachine.Title.paramWidthPercent = result.paramWidthPercent;
            }
            if (result.TextColor) {
              currentMachine.Title.TextColor = {
                id: result.TextColor.id,
                type: result.TextColor.type,
              };

              $scope.TextColor = {};

              if (result.TextColor.id == 2) {
                currentMachine.Title.TextColor.constantsBordersConditions = result.TextColor.constantsBordersConditions;
                $scope.TextColor.constantsBordersConditions = result.TextColor.constantsBordersConditions;
              } else if (result.TextColor.id == 3) {
                currentMachine.Title.TextColor.color = result.TextColor.color;
                $scope.TextColor.color = result.TextColor.color;
              }

              $scope.TextColor.type = currentMachine.Title.TextColor.type;
            } else {
              currentMachine.Title.TextColor = undefined;
            }
          }
        });
    };

    $scope.$on("ngRepeatFinished", function (ngRepeatFinishedEvent) {
      $(".droparea").shapeshift({
        align: $scope.localLanguage === true ? "right" : "left",
        colWidth: 41,
        maxHeight: 500,
        columns: $scope.currentMachine.columns,
        minColumns: 1,
        gutterX: 9,
        gutterY: 0,
        paddingX: 0,
        paddingY: 0,
      });
      $scope.activeSize = $scope.currentMachine.chosenSize;
      $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize));
    });

    $scope.$watch("machineChannelChosen", function (result) {
      if (!result) {
        return;
      }
      var channel = _.find($scope.machineTypeAllChannelStrucutre, {
        channel: result.ChannelNum,
      });
      if (channel) {
        $scope.machineTypeChannelChosen = channel;
      }
    });

    $scope.channelShowChange = function (channels) {
      $scope.machineChannelShow = channels;
    };

    $scope.channelChanged = function (result) {
      if (!result) {
        return;
      }
      var channel = _.find($scope.machineTypeAllChannelStrucutre, {
        channel: result.ChannelNum,
      });
      if (channel) {
        $scope.machineTypeChannelChosen = channel;
      }
    };

    $scope.tabShowChange = function (machineTabsStructure) {
      $scope.machineTabsStructure = machineTabsStructure;
    };

    $scope.actionShowChange = function (machineActionsStructure) {
      $scope.machineActionsStructure = machineActionsStructure;
    };

    $scope.updateView = function (result) {
      $scope.machineChannelChosen = null;
      $scope.machineChannelShow = [];
      if (result) {
        LeaderMESservice.getMachineParameters(result.ID).then(function (response) {
          $scope.machineParams = [];
          for (var i = 0; i < response.length; i++) {
            $scope.machineParams.push(response[i]);
          }
        });
        if ($scope.content.showChannel == true) {
          LeaderMESservice.customAPI("GetMachineMainChannelsParameters", {
            machineType: result.ID,
          }).then(function (response) {
            $scope.lowerGeneralSideMachineChannels = response.AllChannels;
            $scope.lowerGeneralSideMachineParams = response.MachineChannelsParameters;
            $scope.machineTypeAllChannelStrucutre = [];
            for (var i = 0; i < response.AllChannels.length; i++) {
              $scope.machineTypeAllChannelStrucutre.push({
                channel: response.AllChannels[i].ChannelNum,
                params: [],
              });
            }
            LeaderMESservice.customAPI("GetMachineMainChannelsParametersStructure", "").then(function (response) {
              var machineChannelsStructure = _.find(response, {
                ID: result.ID,
              });
              if (machineChannelsStructure && machineChannelsStructure.MachineChannelsStructure) {
                var jsonStructure = JSON.parse(machineChannelsStructure.MachineChannelsStructure);
                for (var i = 0; i < jsonStructure.length; i++) {
                  $scope.machineChannelShow.push(jsonStructure[i].channel);
                  var channel = _.find($scope.machineTypeAllChannelStrucutre, {
                    channel: jsonStructure[i].channel,
                  });
                  if (channel) {
                    channel.params = jsonStructure[i].params;
                  }
                }
              }
            });
          });
          LeaderMESservice.customAPI("GetMachineTypeTabsList", {
            machineType: result.ID,
          }).then(function (response) {
            $scope.machineTypeTabs = [];
            $scope.machineTypeActions = [];
            for (var i = 0; i < response.length; i++) {
              if (response[i].MenuType == "tab") {
                $scope.machineTypeTabs.push(response[i]);
              } else if (response[i].MenuType == "action") {
                $scope.machineTypeActions.push(response[i]);
              }
            }
          });

          LeaderMESservice.customAPI("GetMachineTypeTabsStructure", {}).then(function (response) {
            if (response) {
              var machineTabs = _.find(response, { ID: result.ID });
              if (machineTabs) {
                if (machineTabs.MachineTypeTabStructure != null && machineTabs.MachineTypeTabStructure != "") {
                  var machineTabsStructure = JSON.parse(machineTabs.MachineTypeTabStructure);
                  $scope.machineTabsStructure = machineTabsStructure.tabs;
                  $scope.machineActionsStructure = machineTabsStructure.actions;
                }
              }
            }
          });
        }

        if (result[$scope.content.paramStuctureAttr] === null || result[$scope.content.paramStuctureAttr] === "") {
          $scope.currentMachine = {
            MachineTypeID: result.ID,
            Children: [],
            Title: {},
            columns: 12,
            maxSize: 11.25,
            currentSize: 0,
            width: 660,
            height: 200,
          };
          $("#panel-body1").width(700);
          $(".droparea").shapeshift({
            align: $scope.localLanguage === true ? "right" : "left",
            colWidth: 41,
            maxHeight: 500,
            minColumns: 1,
            gutterX: 9,
            gutterY: 0,
            paddingX: 0,
            paddingY: 0,
            columns: 12,
            height: 200,
            width: 660,
            maxSize: 11.25,
          });
          $(".droparea").droppable("option", "accept", ".cminiSmall1 ,.cminiSmall2 ,.csmall1 , .csmall2 , .cbig1 ,.cbig2 , .cbig3 , .cbig4 , .chuge");
        } else {
          $scope.currentMachine = JSON.parse(result[$scope.content.paramStuctureAttr]);
          $scope.currentMachine.MachineTypeID = $scope.content.ID;
          $("#panel-body1").width($scope.currentMachine.width + 40);
          $("#dropArea").height($scope.currentMachine.height);
          _.remove($scope.currentMachine.Children, function (child) {
            if (child) {
              return false;
            }
            return true;
          });
          if ($scope.currentMachine.Children.length === 0) {
            $(".droparea").shapeshift({
              align: $scope.localLanguage === true ? "right" : "left",
              colWidth: 41,
              maxHeight: 500,
              columns: $scope.currentMachine.columns,
              minColumns: 1,
              gutterX: 9,
              gutterY: 0,
              paddingX: 0,
              paddingY: 0,
            });
            $(".droparea").droppable("option", "accept", droppableOptions($scope.currentMachine.maxSize - $scope.currentMachine.currentSize));
          }
        }
        $scope.showMachine = true;
      }
    };

    $scope.getParamName = function (fieldname) {
      var param = _.find($scope.machineParams, { fieldname: fieldname });
      if (param) {
        return $scope.localLanguage ? param.lname : param.ename;
      }
      return fieldname;
    };

    if ($scope.content.showChannel == true) {
      LeaderMESservice.customAPI("GetMachineMainChannelsParametersStructure", "").then(function (response) {
        $scope.machineTypeChannelStructure = null;
        if (response.MachineChannelsStructure != null) {
          $scope.machineTypeChannelStructure = JSON.parse(response.MachineChannelsStructure);
        }
      });
    }

    LeaderMESservice.getBoxesStructures().then(function (response) {
      $scope.boxesStructure = response.data;
    });

    LeaderMESservice.customAPI($scope.content.requestAPI, "").then(function (response) {
      $scope.machineTypes = [];
      $scope.machineType = _.find(response, { ID: $scope.content.ID });
      if ($scope.machineType) {
        $scope.updateView($scope.machineType);
      }
    });

    init();

    $scope.SaveStructure = function () {
      var oldChildrens = $scope.currentMachine.Children;
      var newChildrens = [];
      var obj = $(".container.droparea.removeContent")[0];
      for (var r = 0; r < obj.children.length; r++) {
        var child = obj.children[r];
        var index = parseInt(child.id);
        newChildrens.push(oldChildrens[index]);
      }
      $scope.currentMachine.Children = newChildrens;
      _.remove($scope.currentMachine.Children, function (child) {
        if (child) {
          return false;
        }
        return true;
      });
      delete $scope.currentMachine.Title.withoutConditionsColor;
      var request = {
        machineTypeStructure: [
          {
            MachineTypeID: $scope.machineType.ID,
            MStructure: JSON.stringify($scope.currentMachine),
          },
        ],
      };
      if ($scope.content.showChannel == true) {
        var channelRequest = {
          machineTypeStructure: [
            {
              MachineTypeID: $scope.content.ID,
              MStructure: [],
            },
          ],
        };
        for (var i = 0; i < $scope.machineTypeAllChannelStrucutre.length; i++) {
          if ($scope.machineChannelShow.indexOf($scope.machineTypeAllChannelStrucutre[i].channel) >= 0) {
            channelRequest.machineTypeStructure[0].MStructure.push($scope.machineTypeAllChannelStrucutre[i]);
          }
        }
        LeaderMESservice.customAPI("SaveMachineMainChannelsStructure", channelRequest).then(function (response) {});
        var tabsActionsStructure = {
          tabs: $scope.machineTabsStructure,
          actions: $scope.machineActionsStructure,
        };
        var tabsRequest = {
          machineTypeStructure: [
            {
              MachineTypeID: $scope.content.ID,
              MStructure: JSON.stringify(tabsActionsStructure),
            },
          ],
        };
        LeaderMESservice.customAPI("SaveMachineTypeTabsStructure", tabsRequest).then(function (response) {});
      }
      LeaderMESservice.customAPI($scope.content.saveAPI, request).then(function (response) {
        var machine = _.find($scope.machineTypes, {
          ID: $scope.currentMachine.MachineTypeID,
        });
        if (machine) {
          machine[$scope.content.paramStuctureAttr] = JSON.stringify($scope.currentMachine);
        }
        if (response.error == null) {
          toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          LeaderMESservice.refreshPage($scope);
        } else {
          toastr.error(response.error.ErrorMessage, response.error.ErrorDescription + ":[" + response.error.ErrorCode + "]");
        }
      });
    };
  };
  return {
    restrict: "E",
    templateUrl: template,
    controller: controller,
  };
}

function boxDirective() {
  var templateMiniSmall1 = "views/custom/productionFloor/dragNDrop/common/miniSmall1.html";
  var templateMiniSmall2 = "views/custom/productionFloor/dragNDrop/common/miniSmall2.html";
  var templateSmall1 = "views/custom/productionFloor/dragNDrop/common/small1.html";
  var templateSmall2 = "views/custom/productionFloor/dragNDrop/common/small2.html";
  var templateBig1 = "views/custom/productionFloor/dragNDrop/common/big1.html";
  var templateBig2 = "views/custom/productionFloor/dragNDrop/common/big2.html";
  var templateBig3 = "views/custom/productionFloor/dragNDrop/common/big3.html";
  var templateBig4 = "views/custom/productionFloor/dragNDrop/common/big4.html";
  var templateHuge = "views/custom/productionFloor/dragNDrop/common/huge.html";

  var getBoxTemplate = function (scope, boxId, data) {
    var cellsData;
    if (data) {
      cellsData = data.areas;
    }

    var template = "";
    switch (boxId) {
      case 1:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 1;
        }
        scope.areas.push({
          boxId: 1,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        template = templateMiniSmall1;
        break;
      case 2:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 1;
        }
        scope.areas.push({
          boxId: 2,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        template = templateMiniSmall2;
        break;
      case 3:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 2;
        }
        scope.areas.push({
          boxId: 3,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        scope.areas.push({
          boxId: 3,
          cellId: 1,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[1],
        });
        template = templateSmall1;
        break;
      case 4:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 2;
        }
        scope.areas.push({
          boxId: 4,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        scope.areas.push({
          boxId: 4,
          cellId: 1,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[1],
        });
        template = templateSmall2;
        break;
      case 5:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 4;
        }
        scope.areas.push({
          boxId: 5,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        scope.areas.push({
          boxId: 5,
          cellId: 1,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[1],
        });
        scope.areas.push({
          boxId: 5,
          cellId: 2,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[2],
        });
        scope.areas.push({
          boxId: 5,
          cellId: 3,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[3],
        });
        template = templateBig1;
        break;
      case 6:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 4;
        }
        scope.areas.push({
          boxId: 6,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });
        scope.areas.push({
          boxId: 6,
          cellId: 1,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[1],
        });
        scope.areas.push({
          boxId: 6,
          cellId: 2,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[2],
        });
        scope.areas.push({
          boxId: 6,
          cellId: 3,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[3],
        });
        template = templateBig2;
        break;

      case 7:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 1;
        }
        scope.areas.push({
          boxId: 7,
          cellId: 0,
          field: "",
          field2: "",
          field3: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[0],
        });

        template = templateBig3;
        break;

      case 8:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 1;
        }
        scope.areas.push({
          boxId: 8,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          dynamicEnabled: true,
          gaugeEnabled: true,
          cellData: cellsData[0],
        });
        template = templateBig4;
        break;

      case 9:
        if (cellsData == undefined) {
          cellsData = [];
          cellsData.length = 6;
        }
        scope.areas.push({
          boxId: 9,
          cellId: 0,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: true,
          cellData: cellsData[0],
        });
        scope.areas.push({
          boxId: 9,
          cellId: 1,
          field: "",
          gaugeField: "",
          type: null,
          dynamicEnabled: true,
          gaugeEnabled: true,
          cellData: cellsData[1],
        });
        scope.areas.push({
          boxId: 9,
          cellId: 2,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[2],
        });
        scope.areas.push({
          boxId: 9,
          cellId: 3,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[3],
        });
        scope.areas.push({
          boxId: 9,
          cellId: 4,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[4],
        });
        scope.areas.push({
          boxId: 9,
          cellId: 5,
          field: "",
          gaugeField: "",
          type: null,
          gaugeEnabled: false,
          cellData: cellsData[5],
        });
        template = templateHuge;
        break;
    }

    return template;
  };

  var linker = function (scope) {
    scope.areas = [];
    scope.template = getBoxTemplate(scope, scope.content.boxId, scope.content.data);
  };

  var controller = function ($compile, $scope, $modal) {
    $scope.addItem = function (cellId, fieldNumber, dynamicOptions, gaugeEnable) {
      var cell = _.find($scope.areas, { cellId: cellId });

      if (cell.cellData == undefined) {
        cell.cellData = {};
      }

      var modalInstance = $modal
        .open({
          templateUrl: "views/custom/productionFloor/dragNDrop/updateBoxField.html",
          resolve: {
            machineParams: function () {
              return $scope.content.machineParams;
            },
          },
          controller: function ($scope, $modalInstance, machineParams, LeaderMESservice) {
            $scope.rtl = LeaderMESservice.isLanguageRTL();
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.dOptions = machineParams;
            if (cell.cellData.fields[fieldNumber] == undefined) {
              $scope.dynamicValue = null;
            } else {
              var param = _.find(machineParams, {
                fieldname: cell.cellData.fields[fieldNumber].FieldName,
              });
              if (param) {
                $scope.dynamicValue = param;
              } else {
                $scope.dynamicValue = null;
              }

              if (cell.cellData.fields[fieldNumber].OtherParam) {
                var otherParam = _.find(machineParams, {
                  fieldname: cell.cellData.fields[fieldNumber].OtherParam.fieldname,
                });

                if (otherParam) $scope.OtherParamDynamicValue = otherParam.fieldname;
                else {
                  $scope.OtherParamDynamicValue = null;
                }
              }

              if (cell.cellData.fields[fieldNumber].cellColor) {
                var cellColorDynamicValue = _.find(machineParams, {
                  fieldname: cell.cellData.fields[fieldNumber].cellColor.fieldname,
                });

                if (cellColorDynamicValue) {
                  $scope.cellColorDynamicValue = cellColorDynamicValue.fieldname;
                } else {
                  $scope.cellColorDynamicValue = null;
                }
              }
              $scope.cellColor = cell.cellData.fields[fieldNumber].cellColor;
              if (cell.cellData.fields[fieldNumber].cellColor && cell.cellData.fields[fieldNumber].cellColor.BooleanValue) {
                $scope.cellColorBooleanValue = cell.cellData.fields[fieldNumber].cellColor.BooleanValue.toString();
              }

              // $scope.TextColoring = cell.cellData.fields[fieldNumber].TextColoring;
              // $scope.TextColor=cell.cellData.fields[fieldNumber].TextColor;

              if ($scope.TextColor == undefined) {
                $scope.TextColor = {};
              }

              if ($scope.TextColor.constantsBordersConditions == undefined || $scope.TextColor.constantsBordersConditions.length == 0) {
                // $scope.TextColor.constantsBordersConditions = [
                //     {
                //         "id": 0,
                //         "condition": "",
                //         "value": null,
                //         "color": "",
                //         "empty": true
                //     }
                // ];
              }

              if (cell.cellData.fields[fieldNumber].TextColor) {
                $scope.TextColor = {
                  id: cell.cellData.fields[fieldNumber].TextColor.id,
                };
                // if ($scope.TextColor.id == 1)
                // $scope.TextColor.type = "parameter limits";

                if ($scope.TextColor.id == 2) {
                  // $scope.TextColor.type = "constants Borders";
                  $scope.TextColor.constantsBordersConditions = cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions;
                  if ($scope.TextColor.constantsBordersConditions != undefined) $scope.showMinus = true;
                }
                if ($scope.TextColor.id == 3) {
                  // $scope.TextColor.type = "without conditions";
                  $scope.TextColor.color = cell.cellData.fields[fieldNumber].TextColor.color;

                  // if ($scope.TextColor.constantsBordersConditions == undefined) {
                  //
                  //     $scope.TextColor.constantsBordersConditions = [];
                  //     $scope.TextColor.constantsBordersConditions.push({
                  //         "id": $scope.TextColor.constantsBordersConditions.length,
                  //         "condition": "",
                  //         "value": null,
                  //         "color": "",
                  //         "empty": true
                  //     });
                  //
                  // }
                }

                if ($scope.TextColor.id == 1 || $scope.TextColor.id == 3) {
                  // $scope.TextColor.constantsBordersConditions = [
                  //     {
                  //         "id": "0",
                  //         "condition": "",
                  //         "value": "",
                  //         "color": "",
                  //         "empty": true
                  //     }
                  // ];
                }
              }

              if (cell.cellData.fields[fieldNumber].OtherParam) {
                $scope.OtherParam = {};
                $scope.OtherParam = cell.cellData.fields[fieldNumber].OtherParam;
              } else {
                $scope.OtherParam = {};
                $scope.OtherParam.show = false;
              }

              $scope.standardValue = cell.cellData.fields[fieldNumber].standardValue;

              $scope.twoFieldsOneCell = cell.cellData.fields[fieldNumber].twoFieldsOneCell;

              $scope.Gaugestatus = cell.cellData.fields[fieldNumber].Gaugestatus;
              if ($scope.Gaugestatus == true) {
                $scope.gaugeValue = "with gauge";
              }
              // $scope.gaugeValue = cell.cellData.fields[fieldNumber].gaugeValue;

              //console.log(machineParams);

              // $scope.dNumOptions = _.filter(machineParams, function(param){
              //
              //     return param.DisplayType === "num"
              // });

              // $scope.dCellColorOptions = machineParams;
              $scope.dCellColorOptions = _.filter(machineParams, function (param) {
                return param.DisplayType === "bool";
              });
              $scope.showCellColoring = true;
              if ($scope.dCellColorOptions.length == 0) {
                $scope.showCellColoring = false;
              }

              // if ($scope.TextColor) {
              // if ($scope.TextColor.constantsBordersConditions) {
              //
              // }

              // if ($scope.TextColor.id == 3 && $scope.TextColor.constantsBordersConditions == undefined) {
              //
              //     $scope.TextColor.constantsBordersConditions = [];
              //     $scope.TextColor.constantsBordersConditions.push({
              //         "id": $scope.TextColor.constantsBordersConditions.length,
              //         "condition": "",
              //         "value": null,
              //         "color": "",
              //         "empty": true
              //     });
              //
              // }
              // else if ($scope.TextColor.id == 3)

              // $scope.TextColor.constantsBordersConditions = cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions;

              // }
              // else {
              //     $scope.TextColor = {};
              // }
              $scope.gaugeEnabled = gaugeEnable == true;
            }
            $scope.initToggle = function () {
              if ($scope.Gaugestatus == undefined || $scope.Gaugestatus == null) $scope.Gaugestatus = false;
            };

            $scope.changeToggleStatus = function () {
              $scope.Gaugestatus = !$scope.Gaugestatus;
              if ($scope.Gaugestatus === true) {
                $scope.GaugeText = "fa fa-toggle-on active";
              } else {
                $scope.GaugeText = "fa fa-toggle-on fa-rotate-180 inactive";
              }
            };
            $scope.addAnotherConstraint = function () {
              if ($scope.constantsBordersConditionsCondition != undefined && $scope.constantsBordersConditionsValue != null && $scope.constantsBordersConditionsColor != "" && $scope.constantsBordersConditionsColor != undefined) {
                $scope.constantsBordersConditionsValidator = "";
                if ($scope.TextColor.constantsBordersConditions == undefined) {
                  $scope.TextColor.constantsBordersConditions = [];
                }
                $scope.TextColor.constantsBordersConditions.push({
                  id: $scope.TextColor.constantsBordersConditions.length,
                  // ,
                  // "condition": "",
                  // "value": null
                });
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].color = $scope.constantsBordersConditionsColor;
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].value = $scope.constantsBordersConditionsValue;
                $scope.TextColor.constantsBordersConditions[$scope.TextColor.constantsBordersConditions.length - 1].condition = $scope.constantsBordersConditionsCondition;

                //reset all
                $scope.constantsBordersConditionsCondition = undefined;
                $scope.constantsBordersConditionsValue = null;
                $scope.constantsBordersConditionsColor = "";
                $scope.showMinus = true;
              } else {
                $scope.constantsBordersConditionsValidator = "you must add the current Borders Conditions params";
              }
            };

            $scope.clearAll = function () {
              $scope.TextColor = undefined;
              $scope.dynamicValue = undefined;
              $scope.standardValue = false;
              $scope.twoFieldsOneCell = false;
              $scope.OtherParam = undefined;
              $scope.OtherParamDynamicValue = undefined;
              $scope.Gaugestatus = undefined;
              $scope.gaugeValue = undefined;
              $scope.cellColor = undefined;
              $modalInstance.close({
                response: "clearAll",
              });
            };
            $scope.$watch("dynamicValue", function (result) {
              if (result) {
                if (result.DisplayType !== "num") {
                  $scope.showFields = false;
                } else {
                  $scope.showFields = true;
                }
              }
            });
            $scope.checkIfConstantBorderIsIncomplete = function () {
              var isEmpty = false;
              isEmpty = _.some($scope.TextColor.constantsBordersConditions, {
                color: "",
              });
              if (isEmpty == false) {
                isEmpty = _.some($scope.TextColor.constantsBordersConditions, {
                  condition: "",
                });
                if (isEmpty == false) {
                  isEmpty = _.some($scope.TextColor.constantsBordersConditions, { value: null });
                }
              }
              return isEmpty;
            };
            $scope.removeConstraint = function (id) {
              var temp = [];
              for (var r = 0; r < $scope.TextColor.constantsBordersConditions.length; r++)
                if ($scope.TextColor.constantsBordersConditions[r].id != id) {
                  temp.push($scope.TextColor.constantsBordersConditions[r]);
                }

              $scope.TextColor.constantsBordersConditions = temp;
            };

            $scope.$watch("TextColor.id", function (result) {
              // if (result == "2") {
              //     $scope.TextColor.constantsBordersConditions = [
              //         {
              //             "id": 0,
              //             "condition": "",
              //             "value": null,
              //             "color": ""
              //         }
              //     ];
              // }
            });

            $scope.update = function () {
              var flag = true;
              if ($scope.dynamicValue == undefined) {
                $scope.dynamicValueValidator = "you must fill this field";
                flag = false;
              } else {
                if ($scope.Gaugestatus != true) {
                  $scope.gaugeValue = "";
                } else {
                  $scope.gaugeValue = "with gauge";
                }
                if ($scope.OtherParam) {
                  if ($scope.OtherParam.show == false) {
                    $scope.OtherParam = undefined;
                  }
                }
                if ($scope.cellColor) {
                  if ($scope.cellColor.show == false) {
                    $scope.cellColor.BooleanValue = undefined;
                    $scope.cellColor.color = undefined;
                  } else {
                    // if ($scope.cellColorDynamicValue == undefined || $scope.cellColor.color == undefined || $scope.cellColorBooleanValue == undefined) {
                    //     $scope.cellColoringValidator = "you must fill this field";
                    //     flag = false;
                    // }
                  }
                } else {
                  $scope.cellColor = {};
                  $scope.cellColor.show = false;
                }

                if ($scope.TextColor) {
                  if ($scope.TextColor.id == 1) {
                    $scope.TextColor.type = "parameter limits";
                    $scope.TextColor.constantsBordersConditions = undefined;
                  } else if ($scope.TextColor.id == 2) {
                    $scope.TextColor.type = "constants Borders";
                    //convert value to int
                    if ($scope.TextColor.constantsBordersConditions) {
                      for (var r = 0; r < $scope.TextColor.constantsBordersConditions.length; r++) {
                        $scope.TextColor.constantsBordersConditions[r].value = parseInt($scope.TextColor.constantsBordersConditions[r].value);
                        if (
                          $scope.TextColor.constantsBordersConditions[r].color == "" ||
                          $scope.TextColor.constantsBordersConditions[r].color == undefined ||
                          $scope.TextColor.constantsBordersConditions[r].condition == "" ||
                          $scope.TextColor.constantsBordersConditions[r].value == NaN ||
                          $scope.TextColor.constantsBordersConditions[r].value == null
                        ) {
                          $scope.constantsBordersConditionsValidator = "you must fill this field";
                          flag = false;
                        }
                      }
                      if ($scope.TextColor.constantsBordersConditions.length.length == 0) {
                        $scope.constantsBordersConditionsValidator = "you must add the current Borders Conditions params";
                        flag = false;
                      }
                    } else {
                      $scope.constantsBordersConditionsValidator = "you must add the current Borders Conditions params";
                      flag = false;
                    }
                  } else if ($scope.TextColor.id == 3) {
                    $scope.TextColor.type = "without conditions";
                    $scope.TextColor.constantsBordersConditions = undefined;
                    if (!$scope.TextColor.color) {
                      $scope.TextColorValidator = "you must fill this field";
                      flag = false;
                    }
                  }
                }
                if ($scope.OtherParam) {
                  if ($scope.OtherParam.show == true && $scope.OtherParamDynamicValue == undefined) {
                    $scope.OtherParamDynamicValueValidator = "you must fill this field";
                    flag = false;
                  }
                }
                if (flag) {
                  $modalInstance.close({
                    dynamicValue: $scope.dynamicValue,
                    TextColor: $scope.TextColor,
                    standardValue: $scope.standardValue,
                    twoFieldsOneCell: $scope.twoFieldsOneCell,
                    OtherParam: $scope.OtherParam,
                    OtherParamDynamicValue: $scope.OtherParamDynamicValue,
                    cellColor: $scope.cellColor,
                    cellColorDynamicValue: $scope.cellColorDynamicValue,
                    Gaugestatus: $scope.Gaugestatus,
                    cellColorBooleanValue: $scope.cellColorBooleanValue,
                    gaugeValue: $scope.gaugeValue,
                  });
                }
              }
            };

            $scope.exit = function () {
              $modalInstance.close();
            };
          },
        })
        .result.then(function (result) {
          if (result) {
            if (result.response == "clearAll") {
              cell.cellData.fields[fieldNumber].TextColor = undefined;
              cell.cellData.fields[fieldNumber].standardValue = false;
              cell.cellData.fields[fieldNumber].twoFieldsOneCell = false;
              cell.cellData.fields[fieldNumber].OtherParam = {};
              cell.cellData.fields[fieldNumber].OtherParam.show = false;
              cell.cellData.fields[fieldNumber].OtherParam.fieldname = "";
              cell.cellData.fields[fieldNumber].cellColor = {};
              cell.cellData.fields[fieldNumber].FieldName = undefined;
              cell.cellData.fields[fieldNumber].Gaugestatus = false;
              cell.cellData.fields[fieldNumber].gaugeValue = undefined;
            } else {
              ///reset text color options and values
              if (result.TextColor) {
                if (cell.cellData.fields[fieldNumber] == undefined) {
                  cell.cellData.fields[fieldNumber] = {};
                }
                cell.cellData.fields[fieldNumber].TextColor = result.TextColor;

                if (result.TextColor.id == 1) {
                  if (cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions) {
                    cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions = undefined;
                  }
                  if (cell.cellData.fields[fieldNumber].TextColor.withoutConditionsColor) {
                    cell.cellData.fields[fieldNumber].TextColor.withoutConditionsColor = undefined;
                  }
                } else if (result.TextColor.id == 2) {
                  cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions = result.TextColor.constantsBordersConditions;
                  if (cell.cellData.fields[fieldNumber].TextColor.withoutConditionsColor) {
                    cell.cellData.fields[fieldNumber].TextColor.withoutConditionsColor = undefined;
                  }
                } else if (result.TextColor.id == 3) {
                  cell.cellData.fields[fieldNumber].TextColor.color = result.TextColor.color;
                  if (cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions) {
                    cell.cellData.fields[fieldNumber].TextColor.constantsBordersConditions = undefined;
                  }
                }
              }
              // if (result.TextColor.withoutConditionsColor)
              //     cell.cellData.fields[fieldNumber].TextColor.withoutConditionsColor = result.withoutConditionsColor;
              if (result.standardValue) {
                cell.cellData.fields[fieldNumber].standardValue = result.standardValue;
              } else {
                cell.cellData.fields[fieldNumber].standardValue = false;
              }

              if (result.twoFieldsOneCell) {
                cell.cellData.fields[fieldNumber].twoFieldsOneCell = result.twoFieldsOneCell;
              } else {
                cell.cellData.fields[fieldNumber].twoFieldsOneCell = false;
              }

              if (result.OtherParam) {
                if (cell.cellData.fields[fieldNumber].OtherParam == undefined) {
                  cell.cellData.fields[fieldNumber].OtherParam = {};
                }

                if (result.OtherParamDynamicValue) {
                  cell.cellData.fields[fieldNumber].OtherParam.fieldname = result.OtherParamDynamicValue;
                }
                cell.cellData.fields[fieldNumber].OtherParam.show = true;
              } else {
                if (cell.cellData.fields[fieldNumber].OtherParam) {
                  cell.cellData.fields[fieldNumber].OtherParam.show = false;
                  cell.cellData.fields[fieldNumber].OtherParam.fieldname = "";
                }
              }

              if (result.cellColor) {
                cell.cellData.fields[fieldNumber].cellColor = result.cellColor;

                cell.cellData.fields[fieldNumber].cellColor.BooleanValue = Boolean(result.cellColorBooleanValue);
                if (result.cellColorDynamicValue) {
                  cell.cellData.fields[fieldNumber].cellColor.fieldname = result.cellColorDynamicValue.fieldname;
                }
              }

              cell.cellData.fields[fieldNumber].FieldName = result.dynamicValue.fieldname;

              cell.cellData.fields[fieldNumber].Gaugestatus = result.Gaugestatus;
              cell.cellData.fields[fieldNumber].gaugeValue = result.gaugeValue;
            }
          }
        });
    };

    $scope.getParamName = function (fieldname) {
      var param = _.find($scope.content.machineParams, {
        fieldname: fieldname,
      });
      if (param) {
        return param.ename;
      }
      return fieldname;
    };
  };
  return {
    restrict: "E",
    link: linker,
    template: '<ng-include src="template"></ng-include>',
    controller: controller,
    scope: {
      content: "=",
    },
  };
}

function paramDirective($compile) {
  var template = "views/custom/productionFloor/common/param.html";

  var controller = function ($scope, LeaderMESservice) {
    $scope.field = $scope.content;

    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
  };

  return {
    restrict: "E",
    templateUrl: template,
    link: function (scope, element, attr) {
      if (scope.content) {
        scope.templateUrl = scope.content.template;
      } else {
        scope.templateUrl = undefined;
      }
    },
    scope: {
      content: "=",
      newStyle: "@",
    },
    controller: controller,
    controllerAs: "paramCtrl",
  };
}

angular
  .module("LeaderMESfe")
  .directive("machineBoxDirective", ["$interval", machineBoxDirective])
  .directive("depDirective", depDirective)
  .directive("machineDirective", machineDirective)
  .directive("machineParamDirective", machineParamDirective)
  .directive("dragAndDropDirective", dragAndDropDirective)
  .directive("boxDirective", boxDirective)
  .directive("paramDirective", paramDirective)
  .filter("collapseParamFilter", function () {
    return function (input) {
      return _.filter(input, function (param) {
        return param.CollapseMachineParamsDisplayOrder > 0;
      });
    };
  });
