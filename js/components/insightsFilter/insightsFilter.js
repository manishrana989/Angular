function insightsFilter($timeout) {
  var controller = function ($scope, shiftService, insightService, $sessionStorage,$localStorage, LeaderMESservice, $modal, toastr, $filter, $rootScope) {
    var insightsFilterCtrl = this;
    
    insightsFilterCtrl.filters = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters;
    $scope.insightInteractiveFilter = insightService.insightInteractiveFilter;
    $scope.shiftData = shiftService.shiftData;
    insightsFilterCtrl.forms = [
      {
        Id:18,
        name: "PRODUCT_GROUP",
        fieldName: "ProductGroupFilter",
        sessionField: "productGroupIds",
        valueNameField:"productGroupNames",
        reportId: 338,
        sfCriteria: [],
        value: "",
        valueNames:""
      },
      {
        Id:6,
        name: "PRODUCT",
        fieldName: "ProductIdFilter",
        sessionField: "productIds",
        valueNameField:"productNames",
        reportId: 124,
        value: "",
        valueNames:"",
        sfCriteria: [
          {
            FieldName: "IsActive",
            Eq: true,
            DataType: "boolean",
          }
        ],
      },
      {
        Id:11,
        name: "ERP_JOB_ID",
        fieldName: "jobIdFilter",
        sessionField: "jobIds",
        valueNameField:"jobNames",
        reportId: 15,
        value: "",
        valueNames:"",
        sfCriteria: [
          {
            FieldName: "ProductID",
            INclause: [],
            DataType: "num",
          },
        ],
      },     
       {
        Id:19,
        name: "MOLD_GROUP",
        fieldName: "MoldGroupFilter",
        sessionField: "moldGroupIds",
        valueNameField:"moldGroupNames",
        reportId: 361,
        valueNames:"",
        sfCriteria: [],
        value: "",
      },
      {
        Id:7,
        name: "MOLD",
        fieldName: "MoldIdFilter",
        sessionField: "moldIds",
        valueNameField:"moldNames",
        reportId: 27,
        valueNames:"",
        sfCriteria: [],
        value: "",
      },
      {
        Id:8,
        name: "WORKER",
        fieldName: "UserIdFilter",
        sessionField: "userIds",
        valueNameField:"userNames",
        reportId: 5991,
        valueNames:"",
        sfCriteria: [],
        value: "",
      },  
      {
        Id:17,
        name: "CUSTOMER",
        fieldName: "ClientIdFilter",
        sessionField: "clientIds",
        valueNameField:"clientNames",
        reportId: 206,
        valueNames:"",
        sfCriteria: [],
        value: "",
      },
      {
        ID: 20,
        name: "MINIMUM_ACTIVE_TIME_(MINUTES)",
        fieldName: "ActiveTimeFilter",
        sessionField: "activeTimeIds",
        valueNameField:"activeTimeNames",
        reportId: 74,
        valueNames:"",
        sfCriteria: [],
        value: "",
      },  
      {
      ID: 21,
      name: "MINIMUM_UNITS_PRODUCED",
      fieldName: "UnitsProducedFilter",
      sessionField: "unitsProducedIds",
      valueNameField:"unitsProducedNames",
      reportId: 766,
      valueNames:"",
      sfCriteria: [],
      value: "",
    }
    ];
    $scope.machines = [];
    $scope.jobDefinition = [];
    $scope.shifts = [];
    $scope.ProductionLines = [];
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    insightsFilterCtrl.compare = false;
    insightsFilterCtrl.isWorking = true;
    insightsFilterCtrl.endLine = true;
    insightsFilterCtrl.scale = true;
    insightsFilterCtrl.deviation = false;
    insightsFilterCtrl.dataLabels = true;
    insightsFilterCtrl.filterChanged = false;

    $scope.creatingGroupByElement = function (filterType, groupBy, sortName) {
      if (!_.isEmpty(filterType) && !_.isEmpty(filterType[0])) {
        _.forEach(groupBy, function (obj) {
          if (obj.dropBoxName !== $filter("translate")("UNGROUPED")) {
            obj[sortName] = _.uniq(
              _.map(filterType, function (type) {
                return {
                  EName: type[obj.EName] !== "" ? type[obj.EName] : $filter("translate")(obj.UngroupedName),
                  LName: type[obj.LName] !== "" ? type[obj.LName] : $filter("translate")(obj.UngroupedName),
                  ID: type[obj.ID],
                  value: type.value,
                  array: [],
                };
              }),
              "ID"
            ).sort(function (a, b) {
              return b.ID - a.ID;
            });
          } else {
            obj[sortName].push({
              EName: $filter("translate")(obj.UngroupedName),
              LName: $filter("translate")(obj.UngroupedName),
              ID: obj.ID,
              value: true,
              array: [],
            });
          }

          _.forEach(filterType, function (type) {
            if (obj.dropBoxName !== $filter("translate")("UNGROUPED")) {
              var findItem = _.find(obj[sortName], { ID: type[obj.ID] });
            } else {
              if (sortName == "shiftTypeSort") {
                var findItem = _.find(obj[sortName], { ID: obj.ID });
              } else {
                var findItem = _.find(obj[sortName], { ID: obj.IDArray });
              }
            }

            findItem.array.push({
              LName: type[obj.LNameArray],
              EName: type[obj.ENameArray],
              ID: type[obj.IDArray],
              value: type.value,
            });
          });
        });
      }
      return groupBy;
    };

    createGroupByMachines = function (machines) {
      insightsFilterCtrl.groupByMachines = [
        {
          ID: "ID",
          EName: "MachineName",
          LName: "MachineLName",
          ENameArray: "MachineName",
          LNameArray: "MachineLName",
          IDArray: "ID",
          machinesSort: [],
          idType: 0,
          dropBoxName: $filter("translate")("UNGROUPED"),
          UngroupedName: "MACHINES",
        },
      ];
      $scope.checkLines = _.some(machines, (machine) => machine.LineID && machine.LineID != -1);
      $scope.checkGroup = _.some(machines, (machine) => machine.MachineGroupID && machine.MachineGroupID != 0);
      $scope.checkType = _.some(machines, (machine) => machine.MachineType && machine.MachineType != -1);
      
      if ($sessionStorage.stateParams.subMenu.SubMenuExtID === 0) {
        $scope.checkDepartment = _.some(machines, (machine) => machine.DepartmentID && machine.DepartmentID != -1);
        if ($scope.checkDepartment) {
          insightsFilterCtrl.groupByMachines.unshift({
            ID: "DepartmentID",
            EName: "DepartmentName",
            LName: "DepartmentName",
            ENameArray: "MachineName",
            LNameArray: "MachineLName",
            IDArray: "ID",
            machinesSort: [],
            idType: 4,
            dropBoxName: $filter("translate")("DEPARTMENT"),
            UngroupedName: "MACHINES",
          });
        }
      }
      
      if ($scope.checkType) {
        insightsFilterCtrl.groupByMachines.unshift({
          ID: "MachineType",
          EName: "MachineTypeName",
          LName: "MachineTypeName",
          ENameArray: "MachineName",
          LNameArray: "MachineLName",
          IDArray: "ID",
          machinesSort: [],
          idType: 3,
          dropBoxName: $filter("translate")("MACHINE_TYPE"),
          UngroupedName: "MACHINES",
        });
      }
      if ($scope.checkGroup) {
        insightsFilterCtrl.groupByMachines.unshift({
          ID: "MachineGroupID",
          EName: "MachineGroupName",
          LName: "MachineGroupLName",
          ENameArray: "MachineName",
          LNameArray: "MachineLName",
          IDArray: "ID",
          machinesSort: [],
          idType: 1,
          dropBoxName: $filter("translate")("GROUP"),
          UngroupedName: "MACHINES",
        });
      }

      if ($scope.checkLines) {
        insightsFilterCtrl.groupByMachines.unshift({
          ID: "LineID",
          EName: "LineEName",
          LName: "LineLName",
          ENameArray: "MachineName",
          LNameArray: "MachineLName",
          IDArray: "ID",
          machinesSort: [],
          idType: 2,
          dropBoxName: $filter("translate")("LINE"),
          UngroupedName: "MACHINES",
        });
      }
    };

    createGroupByShifts = function () {
      insightsFilterCtrl.groupByShifts = [
        {
          ID: "ShiftType",
          EName: "ShiftTypeName",
          LName: "ShiftTypeName",
          ENameArray: "ShiftName",
          LNameArray: "ShiftName",
          IDArray: "ShiftDefID",
          shiftTypeSort: [],
          idType: 1,
          dropBoxName: $filter("translate")("SHIFT_TYPE"),
          UngroupedName: "SHIFT",
        },
        {
          ID: "ID",
          EName: "MachineName",
          LName: "MachineLName",
          ENameArray: "ShiftName",
          LNameArray: "ShiftName",
          IDArray: "ShiftDefID",
          shiftTypeSort: [],
          idType: 0,
          dropBoxName: $filter("translate")("UNGROUPED"),
          UngroupedName: "SHIFT",
        },
      ];
    };

    $scope.initWrapper = function (filterVarientObj) {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        var filterTemp;
        if (!filterVarientObj) {
          filterTemp = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters;
        } else {
          filterTemp = filterVarientObj.FilterTemplate;
        }
        
        if (!_.isEmpty(filterTemp)) {
          _.forEach(insightsFilterCtrl.forms,function(form){
            form.reportId = _.find(filterTemp.Filters,{ID:form.Id})?.ReportID        
              if(insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters[form.sessionField]?.length > 0)
              {
                form.value = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]?.filters[form.sessionField]
                form.valueNames = insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID]?.filters[form.valueNameField]
              }
          });

          $scope.machines = angular.copy(filterTemp.Machines);
          insightService.updateMachinesShiftContainer($scope.machines)
          $scope.shifts = angular.copy(filterTemp.ShiftDef);
          createGroupByMachines($scope.machines);
          createGroupByShifts($scope.shifts);
          insightsFilterCtrl.selectedShiftGroupBy = insightsFilterCtrl.groupByShifts[0];
          insightsFilterCtrl.selectedMachinesGroupBy = insightsFilterCtrl.groupByMachines[0];
          $scope.creatingGroupByElement($scope.machines, insightsFilterCtrl.groupByMachines, "machinesSort");
          $scope.creatingGroupByElement($scope.shifts, insightsFilterCtrl.groupByShifts, "shiftTypeSort");
          $scope.jobDefinition = angular.copy(filterTemp.ERPJobDef);

          insightsFilterCtrl.compare = filterTemp.compare;
          insightsFilterCtrl.isWorking = filterTemp.isWorking;
          insightsFilterCtrl.scale = filterTemp.scale;
          insightsFilterCtrl.deviation = filterTemp.deviation;
          insightsFilterCtrl.dataLabels = filterTemp.dataLabels;
          insightsFilterCtrl.unitsProduced = filterTemp.unitsProducedIds;
          insightsFilterCtrl.endLine = filterTemp.endLine;
          insightsFilterCtrl.activeTime = filterTemp.activeTimeIds;
          insightsFilterCtrl.Filters = filterTemp.Filters

          $scope.machinesValue = true;
          _.forEach($scope.machines, function (machine) {
            if (!machine.value) {
              $scope.machinesValue = false;
            }
          });
          insightsFilterCtrl.forms.forEach(function (form) {
            if (filterTemp[form.sessionField]) {
              form.value = filterTemp[form.sessionField]?.join(",");
            }
          });
        }
        if (filterVarientObj) {
          insightsFilterCtrl.apply();
        } else {
          LeaderMESservice.customAPI("GetInsightsSavedFilters", { DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID }).then(function (res) {
            if (!_.isEmpty(res.Data)) {
              insightsFilterCtrl.filterVariants = _.map(res.Data[$sessionStorage.stateParams.subMenu.SubMenuExtID], function (temp) {
                temp.FilterTemplate = JSON.parse(temp.FilterTemplate);
                return temp;
              });
            }
          });
        }
      }, 350);
    };

    $scope.$watch(
      "insightsFilterCtrl.filters",
      function () {
        $scope.initWrapper();
      },
      true
    );

    insightsFilterCtrl.apply = function (variantObj) {
      var filterBy = [];
      var insightFiltersData = {};
      filterBy.push({
        FilterName: "DepartmentIdFilter",
        FilterValues: [$sessionStorage.stateParams.subMenu.SubMenuExtID],
      });

      insightsFilterCtrl.forms.forEach(function (form) {
        if (!form.fieldName) {
          return;
        }
        if (!form.value || form.value == "") {
          return;
        }
        

        if(!Array.isArray(form?.value))
        {
          var values = form?.value?.split(",");
          values = values.map(item => +item)
        }
        else
        {
          var values = form?.value?.split(",");
        }
        if(!Array.isArray(form?.valueNames))
        {
          var valuesNames = form?.valueNames?.split(",");
        }
        else
        {
          var valuesNames = form?.valueNames
        }

        insightFiltersData[form.sessionField] = values;
        insightFiltersData[form.valueNameField] = valuesNames;
        if (values && values.length > 0) {
          filterBy.push({
            FilterName: form.fieldName,
            FilterValues: values,
          });
        }
      });
      //when i apply new filter the insights that has filterMachines saved in localStorage
      //need to get deleted
      if($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID])
      {
        _.forEach($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID],function(data){
         delete data.filterMachine
        })
      }
      var machinesIds = [];
      if (insightsFilterCtrl.selectedMachinesGroupBy && insightsFilterCtrl.selectedMachinesGroupBy.machinesSort) {
        _.forEach(insightsFilterCtrl.selectedMachinesGroupBy.machinesSort, function (machineLine) {
          machinesIds.push(..._.map(_.filter(machineLine.array, { value: true }), "ID"));
        });
      } else {
        var machinesIds = _.map(_.filter($scope.machines, { value: true }), "ID");
      }

      var shiftNames = [];
      if (insightsFilterCtrl.selectedShiftGroupBy && insightsFilterCtrl.selectedShiftGroupBy.shiftTypeSort) {
        _.forEach(insightsFilterCtrl.selectedShiftGroupBy.shiftTypeSort, function (shiftType) {
          shiftNames.push(..._.map(_.filter(shiftType.array, { value: true }), $scope.localLanguage ? "LName" : "EName"));
        });
      } else {
        shiftNames = _.map(_.filter($scope.shifts, { value: true }), "ShiftName");
      }

      if (machinesIds && machinesIds.length > 0) {
        filterBy.push({
          FilterName: "MachineIdFilter",
          FilterValues: machinesIds,
        });
      }

      if (shiftNames && shiftNames.length > 0) {
        filterBy.push({
          FilterName: "ShiftNameFilter",
          FilterValues: shiftNames,
        });
      }
      var jobDefinitions = _.map(_.filter($scope.jobDefinition, { value: true }), "id");
      if (jobDefinitions && jobDefinitions.length > 0) {
        filterBy.push({
          FilterName: "ERPJobDefFilter",
          FilterValues: jobDefinitions,
        });
      }

      if (insightsFilterCtrl.isWorking) {
        filterBy.push({
          FilterName: "IsWorkingFilter",
          FilterValues: [1],
        });
      }

      if (insightsFilterCtrl.endLine) {
        filterBy.push({
          FilterName: "IsEndOfLineFilter",
          FilterValues: [1],
        });
      }
      // if (insightsFilterCtrl.activeTime) {
      //   filterBy.push({
      //     FilterName: "ActiveTimeFilter",
      //     FilterValues: [1],
      //   });
      // }
      $scope.machines = _.map($scope.machines, function (machine) {
        var foundIndex = machinesIds.includes(machine.ID);
        if (foundIndex) {
          machine.value = true;
        } else {
          machine.value = false;
        }
        return machine;
      });
      $scope.shifts = _.map($scope.shifts, function (shift) {
        var foundIndex = shiftNames.includes(shift.ShiftName);
        if (foundIndex) {
          shift.value = true;
        } else {
          shift.value = false;
        }
        return shift;
      });
      insightFiltersData.Machines = $scope.machines;
      insightFiltersData.ERPJobDef = $scope.jobDefinition;
      insightFiltersData.ShiftDef = $scope.shifts;

      insightFiltersData.compare = insightsFilterCtrl.compare;
      insightFiltersData.isWorking = insightsFilterCtrl.isWorking;
      insightFiltersData.endLine = insightsFilterCtrl.endLine;
      insightFiltersData.scale = insightsFilterCtrl.scale;
      insightFiltersData.deviation = insightsFilterCtrl.deviation;
      insightFiltersData.dataLabels = insightsFilterCtrl.dataLabels;
      insightFiltersData.filterBy = filterBy;
      insightFiltersData.Filters = insightsFilterCtrl.Filters
      Object.keys(insightsFilterCtrl.filters, function (key) {
        delete insightsFilterCtrl.filters[key];
      });
      Object.keys(insightFiltersData, function (key) {
        insightsFilterCtrl.filters[key] = angular.copy(insightFiltersData[key]);
      });
      insightService.updateMachinesShiftContainer($scope.machines);

      if ($scope.data) {
        Object.keys(insightFiltersData)
          .concat(Object.keys($scope.data))
          .forEach(function (key) {
            $scope.data[key] = angular.copy(insightFiltersData[key]);
          });

        let hasSelection = false;
        angular.forEach($scope.data.ERPJobDef, function (i) {
          if (i.value) {
            hasSelection = true;
          }
        });

        if (hasSelection) {
          $scope.data.jobDefinitionValue = true;
          $scope.data.shiftsValue = true;
          $scope.data.machinesValue = true;
        }

        hasSelection = false;

        angular.forEach($scope.data.Shifts, function (i) {
          if (i.value) {
            hasSelection = true;
          }
        });

        if (hasSelection) {
          $scope.data.shiftsValue = true;
        }

        hasSelection = false;

        angular.forEach($scope.data.Machines, function (i) {
          if (i.value) {
            hasSelection = true;
          }
        });

        if (hasSelection) {
          $scope.data.machinesValue = true;
        }

        hasSelection = false;
      }

      if (variantObj !== undefined) {
        var obj = {
          DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
          FilterName: variantObj.filterName,
          FilterTemplate: JSON.stringify(insightFiltersData),
          FilterID: 0,
        };
        if (variantObj.overWrite) {
          obj.FilterID = insightsFilterCtrl.selectedFilterVariant.FilterID;
          obj.FilterName = insightsFilterCtrl.selectedFilterVariant.FilterName;
        }
        if (obj.DepartmentID >= 0 && obj.FilterTemplate && obj.FilterName && obj.FilterName.length > 0 && obj.FilterID > -1) {
          LeaderMESservice.customAPI("UpdateInsightsSavedFilters", obj).then(function () {
            LeaderMESservice.customAPI("GetInsightsSavedFilters", {
              DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
            }).then(function (res) {
              if (!_.isEmpty(res.Data)) {
                insightsFilterCtrl.filterVariants = res.Data[$sessionStorage.stateParams.subMenu.SubMenuExtID];
                toastr.clear();
                toastr.success("", $filter("translate")("VARIANT_SAVED_SUCCESSFULLY"));
              }
            });
          });
        }
      }
      $timeout(function () {
        // Object.keys(insightFiltersData).forEach(function (key) {
        //   insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters[key] = insightFiltersData[key];
        // });

        //note: i return it because the deviation/static limit/data Labels stop working on global filter
        insightService.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].filters = angular.copy(insightFiltersData);
      }, 100);
    };

    $scope.searchForData = function (form) {  
      if (form.fieldName === "jobIdFilter") {
        var productField = _.find(insightsFilterCtrl.forms, {
          fieldName: "ProductIdFilter",
        });
        if (productField && productField.value != "") {
          form.sfCriteria[0].INclause = productField.value.split(",");
        }
      }
      var modalInstance = $modal.open({
        templateUrl: "views/common/mainContentTemplate.html",
        controller: function ($scope, $compile, $modalInstance, commonFunctions) {
          $scope.reportID = form.reportId;
          $scope.pageDisplay = 0;
          $scope.formId = form.Id
          if(form.Id == 6)
          {
            $scope.returnValue = false;
            $scope.hideCriteria = false;
            $scope.showApply = true;
            $scope.hasProductGroup = _.find(form.sfCriteria,{FieldName:"ProductGroup"})     
            $scope.sfCriteria = form.sfCriteria;
          }
          else
          {
            $scope.returnValue = true;
            $scope.hideCriteria = true;
            $scope.sfCriteria = form.sfCriteria;
          }
          $scope.onlyNewTab = true;
          $scope.modal = true;
          $scope.showBreadCrumb = false;
          $scope.multiSelect = true;
          $scope.searchInMultiForm = true;
          $scope.chosenIds = [];
          if (typeof form.value === "string" && form.value) {
            $scope.chosenIds = form.value.split(",");
          }
          $scope.rtl = LeaderMESservice.isLanguageRTL() ? "rtl" : "";
          commonFunctions.commonCodeSearch($scope);
          $scope.getDisplayReportSearchFields();

          $scope.ok = function () {
            $modalInstance.close();
          };

          $scope.rowClicked = function (IDs,empty,empty2,rows) {
            if(!IDs && !rows )
            {
              $modalInstance.close();
              return
            }
            var firstFieldName,secondFieldName;
            if(form.fieldName == "ProductGroupFilter")
            {
              firstFieldName = "ProductIdFilter"
              secondFieldName = "ProductGroup"
            }
            if(form.fieldName == "MoldIdFilter")
            {     
              firstFieldName = "ProductIdFilter"
              secondFieldName = "MoldID"
            }
            if(form.fieldName == "MoldGroupFilter")
            {
              firstFieldName = "MoldIdFilter"
              secondFieldName = "MoldGroupID"
            }

            if(form.fieldName == "ProductGroupFilter" || form.fieldName == "MoldIdFilter" || form.fieldName == "MoldGroupFilter")
            {
              var findObj = _.find(insightsFilterCtrl.forms,{fieldName:firstFieldName});
              if(findObj?.sfCriteria.length > 0 || !IDs)
              {
                findObj.sfCriteria = []
                findObj.valueNames = [];
                findObj.value = ""
              }
              if(IDs)
              {
                findObj?.sfCriteria.push({
                  DataType: "num",
                  FieldName: secondFieldName,
                  INclause: [...IDs]
                })
              }
            }  

            if (IDs) {
              form.value = IDs.toString();
            }
            if(rows){
              form.valueNames = _.map(rows,function(row){
                if (row.ProductName && row.CatalogID) {
                  return row.ProductName;
                } else if ((row.ERPJobID || row.ERPJobID == null) && row.ProductName) {
                  return row.ERPJobID ? row.ERPJobID : row.ID;
                } else if(row.WorkerID){
                  return row.PName + " " + row.FName;
                } else {
                  return $scope.localLanguage ? row.LName || row.PName || row.ProductName || row.ID : row.EName || row.FieldName || row.FName  || row.ID;
                }

                // return $scope.localLanguage ? row.LName || row.PName || row.ProductName || row.ID : row.EName || row.FieldName || row.FName  || row.ID

              })
              
            }
            $modalInstance.close();
          };
        },
      });
    };

    $rootScope.$on("resetByKey", function (event, args) {
      insightsFilterCtrl.resetByKey(args);
    });

    insightsFilterCtrl.resetByKey = function (key, skipApply) {
      if (key == "productIds" || key == "unitsProducedIds" || key == "activeTimeIds" || key == "jobIds" || key == "moldIds" || key == "userIds" || key == "productGroupIds" || key == "moldGroupIds" || key == "clientIds") {
        $scope.data[key] = [];
        insightsFilterCtrl.clearFieldForm(_.find(insightsFilterCtrl.forms, { sessionField: key }));
      } else {
        if (key == "machines") {
          _.forEach(insightsFilterCtrl.groupByMachines, function (groupMachines) {
            insightsFilterCtrl.selectUnSelectAllGroups(groupMachines.machinesSort, true);
          });
          insightsFilterCtrl.groupByMachinesSelectAllValue = true;
        } else if (key == "shifts") {
          _.forEach(insightsFilterCtrl.groupByShifts, function (groupShfits) {
            insightsFilterCtrl.selectUnSelectAllGroups(groupShfits.shiftTypeSort, true);
          });
          insightsFilterCtrl.groupByShiftsSelectAllValue = true;
        } else if (key == "endLine") {
          insightsFilterCtrl.endLine = false;
        } else if (key == "isWorking") {
          insightsFilterCtrl.isWorking = false;
        } else {
          insightsFilterCtrl.selectUnSelectAll($scope[key], true);
        }
        $scope[key + "Value"] = false;
        $scope.data[key + "Value"] = false;
      }
      if (!skipApply) {
        insightsFilterCtrl.apply();
      }
    };

    insightsFilterCtrl.resetAll = function () {
      insightsFilterCtrl.resetByKey("productIds", true);
      insightsFilterCtrl.resetByKey("jobIds", true);
      insightsFilterCtrl.resetByKey("activeTimeIds", true);
      insightsFilterCtrl.resetByKey("unitsProducedIds", true);
      insightsFilterCtrl.resetByKey("moldIds", true);
      insightsFilterCtrl.resetByKey("userIds", true);
      insightsFilterCtrl.resetByKey("machines", true);
      insightsFilterCtrl.resetByKey("ProductionLines", true);
      insightsFilterCtrl.resetByKey("shifts", true);
      insightsFilterCtrl.resetByKey("jobDefinition", true);
      insightsFilterCtrl.resetByKey("productGroupIds", true);
      insightsFilterCtrl.resetByKey("moldGroupIds", true);
      insightsFilterCtrl.resetByKey("clientIds", true);

      insightsFilterCtrl.endLine = false;
      insightsFilterCtrl.isWorking = true;
      insightsFilterCtrl.selectedFilterVariant = null;
      insightsFilterCtrl.filterChanged = false;
      insightsFilterCtrl.apply();
    };

    $scope.$on("resetFilter", () => insightsFilterCtrl.resetAll());

    insightsFilterCtrl.selectUnSelectAll = function (data, value) {
      if (data) {
        data.forEach(function (field) {
          field.value = value;
        });
      }
    };

    insightsFilterCtrl.selectUnSelectAllGroups = function (groupBy, value) {
      groupBy.forEach(function (temp) {
        temp.value = value;
        insightsFilterCtrl.selectUnSelectAll(temp.array, value);
      });
    };

    insightsFilterCtrl.clearFieldForm = function (form) {
      form.value = "";
      form.valueNames ="";
      if (form.fieldName == "ProductGroupFilter") {
        var productForm = _.find(insightsFilterCtrl.forms, { fieldName: "ProductIdFilter" })
        productForm.sfCriteria = [
          {
            FieldName: "IsActive",
            Eq: true,
            DataType: "boolean",
          }
        ]
      }
      else   if (form.fieldName == "MoldGroupFilter") {
        var MoldForm = _.find(insightsFilterCtrl.forms, { fieldName: "MoldIdFilter" })
        MoldForm.sfCriteria = []
      }
      else if (form.fieldName == "ProductIdFilter") {
        var jobForm = _.find(insightsFilterCtrl.forms, { fieldName: "jobIdFilter" });
        if (jobForm) {
          jobForm.value = "";
        }
        insightService.insightInteractiveFilterTemp.productID = "";
        insightService.insightInteractiveFilterTemp.productName = "";
      }
      if (form.fieldName == "MoldIdFilter") {
        insightService.insightInteractiveFilterTemp.moldID = "";
        insightService.insightInteractiveFilterTemp.moldName = "";
      }
    };  

    $timeout(function () {
      window.dispatchEvent(new Event("resize"));
    });

    $scope.deleteFilterVariant = function () {
      if (insightsFilterCtrl.selectedFilterVariant && insightsFilterCtrl.selectedFilterVariant.FilterID) {
        LeaderMESservice.customAPI("DeleteInsightsSavedFilters", { FilterID: insightsFilterCtrl.selectedFilterVariant.FilterID }).then(function () {
          LeaderMESservice.customAPI("GetInsightsSavedFilters", {
            DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
          }).then(function (res) {
            insightsFilterCtrl.filterVariants = res.Data[$sessionStorage.stateParams.subMenu.SubMenuExtID] || [];
            toastr.clear();
            toastr.success("", $filter("translate")("VARIANT_DELETE_SUCCESSFULLY"));
            $scope.$emit("resetFilterTest");
          });
        });
      }
    };

    $scope.saveFilterVariant = function () {
      $modal.open({
        templateUrl: "views/common/saveFilterInsights.html",
        windowClass: "insight-filter-model",
        controller: function ($scope, $modalInstance) {
          if (!_.isEmpty(insightsFilterCtrl.selectedFilterVariant)) {
            $scope.overRideOption = true;
            $scope.filterName = insightsFilterCtrl.selectedFilterVariant.FilterName;
            $scope.filterOverWrite = {
              currentChoice: "true",
            };
          } else {
            $scope.filterName = "";
            $scope.filterOverWrite = {
              currentChoice: "false",
            };
          }

          $scope.closeModal = function () {
            $modalInstance.close();
          };
          $scope.saveFilter = function () {
            var overWriteObj = {
              filterName: $scope.filterName,
              overWrite: $scope.filterOverWrite.currentChoice == "true" ? true : false,
            };
            insightsFilterCtrl.apply(overWriteObj);
            $scope.closeModal();
          };
        },
      });
    };

    $scope.$watch(
      "insightInteractiveFilter.productID",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          insightsFilterCtrl.resetByKey("productIds", true);
            insightsFilterCtrl.forms[1].value = insightsFilterCtrl.forms[1].value.length > 1 ? insightsFilterCtrl.forms[1].value + "," + $scope.insightInteractiveFilter.productID : $scope.insightInteractiveFilter.productID;
          insightsFilterCtrl.forms[1].valueNames = insightsFilterCtrl.forms[1].valueNames.length > 1 ? insightsFilterCtrl.forms[1].valueNames + "," + $scope.insightInteractiveFilter.productName : $scope.insightInteractiveFilter.productName;
          insightsFilterCtrl.apply();
        }
      },
      true
    );
    $scope.$watch(
      "insightInteractiveFilter.moldID",
      function (newValue, oldValue) {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          insightsFilterCtrl.resetByKey("moldIds", true);
          insightsFilterCtrl.forms[4].value = insightsFilterCtrl.forms[4].value.length > 0 ? insightsFilterCtrl.forms[4].value + "," + $scope.insightInteractiveFilter.moldID : $scope.insightInteractiveFilter.moldID;
          insightsFilterCtrl.forms[4].valueNames = insightsFilterCtrl.forms[4].valueNames.length > 0 ? insightsFilterCtrl.forms[4].valueNames + "," + $scope.insightInteractiveFilter.moldName : $scope.insightInteractiveFilter.moldName;
          insightsFilterCtrl.apply();
        }
      },
      true
    );
  };

  return {
    restrict: "EA",
    templateUrl: "js/components/insightsFilter/insightsFilter.html",
    link: function (scope) {
      scope.$on("$destroy", function () {
        $timeout(function () {
          window.dispatchEvent(new Event("resize"));
        });
      });
    },
    scope: {
      data: "=",
      close: "=",
    },
    controller: controller,
    controllerAs: "insightsFilterCtrl",
  };
}

angular.module("LeaderMESfe").directive("insightsFilter", insightsFilter);
