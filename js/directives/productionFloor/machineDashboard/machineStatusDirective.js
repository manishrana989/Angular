var machineStatusDirective = function () {
  var Template = "views/custom/machine/machineDashboard/machineStatusDirective.html";

  var controller = function ($scope, shiftService, LeaderMESservice, ExpandedMachinesService, $filter, $timeout, $sessionStorage, $localStorage) {
    var machineStatusCtrl = this;
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.shiftData = shiftService.shiftData;

    $scope.selectTemplateGroupID = $localStorage.selectTemplateGroupID
    machineStatusCtrl.paramsWithLimits = function (param) {
      return param.FieldName == "Job Progress" || param.FieldName == "Josh Progress" || (param.LowLimit && param.HighLimit);
    };
    
    $scope.updateParams = function () {
      var joshProgressTranslate = $filter("translate")("JOSH_PROGRESS");
      var jobProgressTranslate = $filter("translate")("JOB_PROGRESS");
      $scope.shiftData?.machineData?.MachineParams.unshift({ FieldName: "Job Progress", FieldEName: jobProgressTranslate, FieldLName: jobProgressTranslate });
      $scope.shiftData?.machineData?.MachineParams.unshift({ FieldName: "Josh Progress", FieldEName: joshProgressTranslate, FieldLName: joshProgressTranslate });
      $scope.shiftData?.machineData?.MachineParams.unshift({
        FieldName: "customUIImage",
        FieldEName: $filter("translate")("CUSTOM_UI_IMAGE"),
        FieldLName: $filter("translate")("CUSTOM_UI_IMAGE"),
      });

      if($scope.shiftData && $scope.shiftData.machineData && $scope.shiftData.machineData.MachineParams)
      {
        if ($scope.localLanguage) {
          $scope.shiftData.machineData.MachineParams = _.sortByOrder($scope.shiftData.machineData.MachineParams, ["FieldLName"]);
        } else {
          $scope.shiftData.machineData.MachineParams = _.sortByOrder($scope.shiftData.machineData.MachineParams, ["FieldEName"]);
        }
      }
    };

    $scope.$watch("shiftData.machineData", function () {
      $scope.updateParams();
    });
  

    $scope.getStructure = shiftService.getStructure;
    $scope.saveStructureAux = shiftService.saveStructure;

    $scope.addRemoveStaticField = function (show, staticField) {
      if ($scope.machineStructure[staticField]) {
        $scope.machineStructure[staticField].visibility = show;
      }
    };

    machineStatusCtrl.paramsWithCurrentValue = function (param) {
      if (param.FieldName === "removeParam") {
        return true;
      }
      if (param.FieldName === "customUIImage") {
        return true;
      }
      if (param.custom) {
        return true;
      }
      if (param && param.CurrentValue) {
        return true;
      }
      return false;
    };

    if ($scope.shiftData?.machineData?.PConfigID !== 0 && $scope.shiftData && $scope.shiftData.machineData && $scope.shiftData.machineData.JobID ) {
      $scope.options.settings.PConfigID = $scope.shiftData?.machineData?.PConfigID;
      LeaderMESservice.customAPI("GetListOfJobConfiguraions", { JobID: $scope.shiftData.machineData.JobID }).then(function (response) {
        $scope.options.settings.jobConfigurationProducts = _.map(response.jobConfigurations, function (jobConfig) {
          var product = _.find(jobConfig, { propertyName: "ProductName" });
          if (product) {
            return product.propertyValue;
          }
          return "";
        });
      });
    }

    $scope.getStructure($scope, 3);

    $scope.saveStructure = function () {
      $scope.saveStructureAux($scope, 3, false);
    };

    $scope.shiftData.technicianIcon = "images/onlineIcons/technician-grey-new.svg";
    $scope.shiftData.technicianText = "TECHNICIAN_DEFAULT";
    $scope.lastMessage = {
      data: null,
    };
    $scope.getStaticField1Style = function (edit) {
      var visibileCount = 1;
      if (!edit)
        if ($scope.machineStructure.staticField2 && $scope.machineStructure.staticField3) {
          if ($scope.machineStructure.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machineStructure.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 2) {
            return { top: "35px" };
          }

          if (visibileCount == 1) {
            return { top: "60px" };
          }
        }
    };

    $scope.getStaticField2Style = function (edit) {
      var visibileCount = 1;
      if (!edit)
        if ($scope.machineStructure.staticField2 && $scope.machineStructure.staticField3) {
          if ($scope.machineStructure.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machineStructure.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 2) {
            return { top: "35px" };
          }
        }
    };

    $scope.getStaticField3Style = function (edit) {
      var visibileCount = 1;
      if (!edit)
        if ($scope.machineStructure.staticField2 && $scope.machineStructure.staticField3) {
          if ($scope.machineStructure.staticField2.visibility) {
            visibileCount++;
          }
          if ($scope.machineStructure.staticField3.visibility) {
            visibileCount++;
          }

          if (visibileCount == 2) {
            return { top: "35px" };
          }
        }
    };
    shiftService.getShiftInsightTitles($localStorage.machineContainers, "insightMachineDashboardGraph");

    $scope.updateTechnicianStatus = function () {
      shiftService.getTechnicianStatus();
    };

    var loading = false; //this line is because this func gets called twice, some bug, somewhere... but i have more pressing tasks to tend to
    $scope.getGraphData = function (machineId, fieldName) {
      if (loading) {
        return;
      }
      loading = true;
      var id = $scope.shiftData.machineID.toString();
      LeaderMESservice.customAPI("GetDepartmentRateParametersGraph", { shiftGraph: { DepartmentID: $scope.shiftData.DepartmentID, MachineGraph: [{ ID: id, Field: ["CycleTime"] }] } }).then(function (response) {
        $scope.machinesGraphData = {};
        if (response && response.CurrentShiftGraph && response.CurrentShiftGraph.length > 0 && response.CurrentShiftGraph[0].Machines) {
          response.CurrentShiftGraph[0].Machines.forEach(function (machine) {
            machine.Graphs.forEach(function (graph) {
              $scope.machinesGraphData[machine.ID] = {};
              $timeout(function () {
                $scope.machinesGraphData[machine.ID][graph.Name] = graph.GraphSeries;
              }, 200);
            });
          });
        }
        loading = false;
      });
    };
    $scope.$watch("selectTemplateGroupID.machineDashboard", function () {        
      $scope.getStructure($scope, 3);
    });
  };

  return {
    scope: {
      options: "=",
    },
    restrict: "E",
    templateUrl: Template,
    controller: controller,
    controllerAs: "machineStatusCtrl",
  };
};

angular.module("LeaderMESfe").directive("machineStatusDirective", machineStatusDirective);
