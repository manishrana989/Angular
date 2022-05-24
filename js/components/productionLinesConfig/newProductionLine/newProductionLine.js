function newProductionLine() {
  const template = "js/components/productionLinesConfig/newProductionLine/newProductionLine.html";

  const controller = function ($modal, $scope, LeaderMESservice, $filter, $state, $timeout, BreadCrumbsService, toastr) {
    const productionLinesDefCtrl = this;
    toastr.clear();
    $scope.curruntLanguage = LeaderMESservice.getLanguage();
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    productionLinesDefCtrl.showBreadCrumb = true;

    $scope.$watch(
      "currentProductionLineKey",
      function (newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(Object.assign({}, $scope.currentProductionLine.value.Key, { $$hashKey: undefined }))) {
          $scope.productionLineChangedKey = true;
        } else {
          $scope.productionLineChangedKey = false;
        }
      },
      true
    );
    $scope.$watch(
      "machinesPipeline",
      function (newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify($scope.lastSavedProductionLine.value.Value)) {
          $scope.productionLineChangedValue = true;
        } else {
          $scope.productionLineChangedValue = false;
        }
      },
      true
    );

    $scope.lastDepartment = $scope.currentProductionLine.value.Key["Department"];
    $scope.currentProductionLine.value.Value = $scope.currentProductionLine.value.Value || [];
    $scope.machinesPipeline = [...$scope.currentProductionLine.value.Value];
    $scope.currentProductionLineKey = angular.copy($scope.currentProductionLine.value.Key);
    $scope.removedMachines = [];
    $scope.lastSavedProductionLine = { ...$scope.currentProductionLine };
    $scope.productionLineChangedKey = false;
    $scope.productionLineChangedValue = false;

    if ($state.current.name === "customFullView") {
      productionLinesDefCtrl.showBreadCrumb = false;
    }

    if (!$state.params.menuContent) {
      $scope.stateParams = LeaderMESservice.getStateParams();
    } else {
      $scope.stateParams = $state.params.menuContent;
    }
    if (productionLinesDefCtrl.showBreadCrumb) {
      BreadCrumbsService.init();
      if ($scope.localLanguage == true) {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
      } else {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
      }
    }

    $scope.onChangeSelectedDepartment = function () {
      if ($scope.lastDepartment !== Number($scope.currentProductionLineKey.Department)) {
        let department = $scope.allDepartments.find((it) => it.Key.Id === Number($scope.currentProductionLineKey.Department));
        if (department) {
          $scope.allMachinesOptions = _.filter(department.Value, (machine) => machine.LineID === 0);
          $scope.allMachines = department.Value;
        } else {
          $scope.allMachinesOptions = [];
          $scope.allMachines = [];
        }
        $scope.lastDepartment = Number($scope.currentProductionLineKey.Department);
        $scope.machinesPipeline = [];
        $scope.cleanup();
      } else {
        console.log("same Id");
      }
    };

    $scope.upsertTypeEnum = {
      DELETE: 1,
      INSERT: 2,
      UPDATE: 3,
    };
    $scope.inputTypeEnum = {
      text: "text",
      textarea: "textarea",
      number: "number",
      checkbox: "checkbox",
      select: "select",
    };
    $scope.formFormat = [
      {
        labelName: $filter("translate")("NAME"),
        inputType: $scope.inputTypeEnum.text,
        inputValue: $scope.localLanguage ? $scope.currentProductionLineKey.LName : $scope.currentProductionLineKey.EName,
        inputModal: $scope.localLanguage ? "LName" : "EName",
        inputPlaceholder: "placeHolder",
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("DISPLAY_ORDER"),
        inputType: $scope.inputTypeEnum.number,
        inputValue: $scope.currentProductionLineKey["DisplayOrder"],
        inputModal: "DisplayOrder",
        inputPlaceholder: $filter("translate")("DISPLAY_ORDER"),
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("ERPID"),
        inputType: $scope.inputTypeEnum.text,
        inputValue: $scope.currentProductionLineKey["ERPID"],
        inputModal: "ERPID",
        inputPlaceholder: $filter("translate")("ERPID"),
        inputOptions: [1, 2, 3],
        isRequired: false,
        enabled: true,
      },
      {
        labelName: $filter("translate")("DEPARTMENT"),
        inputType: $scope.inputTypeEnum.select,
        inputValue: $scope.currentProductionLineKey["Department"],
        inputModal: "Department",
        inputPlaceholder: "placeHolder",
        inputOptions: $scope.departments.value,
        inputChangeListener: $scope.onChangeSelectedDepartment,
        isRequired: true,
        enabled: $scope.isNewProductionLine.value,
      },
      {
        labelName: $filter("translate")("EVENT_DURATIONS_ASSOCIATED_WITH_ROOT_EVENT"),
        inputType: $scope.inputTypeEnum.number,
        inputValue: $scope.currentProductionLineKey["RootEventAttachDurationMin"],
        inputModal: "RootEventAttachDurationMin",
        inputPlaceholder: $filter("translate")("EVENT_DURATIONS_ASSOCIATED_WITH_ROOT_EVENT"),
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },

      {
        labelName: $filter("translate")("DESCRIPTION"),
        inputType: $scope.inputTypeEnum.textarea,
        inputValue: $scope.currentProductionLineKey["Description"],
        inputModal: "Description",
        inputPlaceholder: $filter("translate")("DESCRIPTION"),
        inputOptions: [1, 2, 3],
        isRequired: false,
        enabled: true,
      },
      {
        labelName: $filter("translate")("END_SETUP_SIMULTANEOUSLY"),
        inputType: $scope.inputTypeEnum.checkbox,
        inputValue: $scope.currentProductionLineKey["MultiSetupEnd"],
        inputModal: "MultiSetupEnd",
        inputPlaceholder: $filter("translate")("END_SETUP_SIMULTANEOUSLY"),
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("ACTIVATE_JOB_SIMULTANEOUSLY"),
        inputType: $scope.inputTypeEnum.checkbox,
        inputValue: $scope.currentProductionLineKey["MultiJobActivation"],
        inputModal: "MultiJobActivation",
        inputPlaceholder: $filter("translate")("ACTIVATE_JOB_SIMULTANEOUSLY"),
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("MULTI_UNITS_IN_CYCLE_SIMULTANEOUSLY"),
        inputType: $scope.inputTypeEnum.checkbox,
        inputValue: $scope.currentProductionLineKey["MultiUnitsInCycleChange"],
        inputModal: "MultiUnitsInCycleChange",
        inputPlaceholder: $filter("translate")("MULTI_UNITS_IN_CYCLE_SIMULTANEOUSLY"),
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("ACTIVE_LINE"),
        inputType: $scope.inputTypeEnum.checkbox,
        inputValue: $scope.currentProductionLineKey.IsActive,
        inputModal: "IsActive",
        inputPlaceholder: "",
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
      {
        labelName: $filter("translate")("OPERATORS_LOGIN_SIMULTANEOUSLY"),
        inputType: $scope.inputTypeEnum.checkbox,
        inputValue: $scope.currentProductionLineKey.OperatorLoginSimultaneously,
        inputModal: "OperatorLoginSimultaneously",
        inputPlaceholder: "",
        inputOptions: [1, 2, 3],
        isRequired: true,
        enabled: true,
      },
    ];

    $scope.getMachineData = function (DepartmentID) {
      LeaderMESservice.customAPI("GetDepartmentMachine", { DepartmentID: DepartmentID }).then(function (response) {
        $scope.allDepartments = response.DepartmentMachine;
        // $scope.allDepartments.forEach(it=> it.Value = it.Value.filter(item=> item.LineID===0));
        let filteredDepartment = $scope.allDepartments.filter((it) => it.Key.Id === $scope.currentProductionLineKey.Department);
        if (filteredDepartment.length > 0) {
          $scope.allMachines = filteredDepartment[0].Value;
          let machinesIds = $scope.machinesPipeline.map((it) => it.MachineID);
          $scope.allMachinesOptions = $scope.allMachines.filter((it) => machinesIds.indexOf(it.Id) === -1 && it.LineID === 0);
        }
      });
    };

    $scope.getMachineData(0);

    $scope.assignCurrentStep = function (step, pLine) {
      $scope.currentStep.value = step;
      $scope.currentProductionLine.value = pLine;
    };

    $scope.drawLinesBetweenSortableBoxes = function () {
      const items = document.getElementsByClassName("sortableBoxItem");
      const end = document.getElementsByClassName("sortableBoxItemEnd")[0];
      if ($scope.linesList) {
        $scope.cleanup();
      }
      $scope.linesList = [];

      const options = {
        startSockets: [],
        endSockets: [],
      };

      for (let i = 0; items.length > 0 && i < items.length - 1; i++) {
        if ($scope.rtl) {
          options.startSockets.push("left");
          options.endSockets.push("right");
        } else {
          options.startSockets.push("right");
          options.endSockets.push("left");
        }
      }

      if (items.length > 0) {
        let endLine = new LeaderLine(items[items.length - 1], end, {
          dash: false,
          size: 2,
          path: "grid",
          color: "#000000",
          endPlug: "behind",
          startSocket: $scope.rtl ? "left" : "right",
          endSocket: $scope.rtl ? "right" : "left",
        });
        $scope.linesList.push(endLine);
      }

      for (let i = 0; i < items.length - 1; i++) {
        $scope.linesList.push(
          new LeaderLine(items[i], items[i + 1], {
            dash: false,
            size: 2,
            path: "grid",
            color: "#000000",
            endPlug: "behind",
            startSocket: options.startSockets[i],
            endSocket: options.endSockets[i],
          })
        );
      }
    };

    setTimeout(function () {
      $scope.drawLinesBetweenSortableBoxes();
    }, 500);

    $scope.onChangeSelectedMachine = function () {};

    $scope.onAddLineProduction = function () {
      if ($scope.loading) {
        return;
      }
      $scope.createNewMachineInPipeLine();
      $scope.machinesPipeline.forEach((it, index) => {
        it.Sequence = index;
        it.UpsertType = it.UpsertType === 0 ? $scope.upsertTypeEnum.UPDATE : it.UpsertType;
      });
      let bodyReq = {
        Line: $scope.currentProductionLineKey,
        LineMachines: $scope.machinesPipeline.concat($scope.removedMachines),
      };
      bodyReq.Line.UpsertType = $scope.isNewProductionLine.value ? $scope.upsertTypeEnum.INSERT : $scope.upsertTypeEnum.UPDATE;
      if ($scope.machinesPipeline.length > 0) {
        bodyReq.Line.FirstMachineID = $scope.machinesPipeline[0].MachineID;
        bodyReq.Line.LastMachineID = $scope.machinesPipeline[$scope.machinesPipeline.length - 1].MachineID;
      }
      $scope.loading = true;
      LeaderMESservice.customAPI("SaveLineMachines", bodyReq)
        .then(function (response) {
          $scope.loading = false;

          if (response.FunctionSucceed) {
            $scope.refreshTable.value = true;
            $scope.currentProductionLine.value.Key = angular.copy($scope.currentProductionLineKey);
            $scope.currentProductionLine.value.Value = [...$scope.machinesPipeline];
            $scope.lastSavedProductionLine = angular.copy($scope.currentProductionLine);
            $scope.productionLineChangedKey = false;
            $scope.productionLineChangedValue = false;
            toastr.clear();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          }
        })
        .catch(function (error) {
          $scope.loading = false;
          toastr.clear();
          toastr.error("", $filter("translate")("SAVE_FAILED"));
        });
    };

    $scope.createNewMachineInPipeLine = function () {
      if (!$scope.selectedMachine) {
        return;
      }
      let machinesids = $scope.machinesPipeline.map((it) => it.MachineID);
      let machineWasRemoved = $scope.removedMachines.filter((it) => it.MachineID === $scope.selectedMachine.Id);
      let machinesIdsWasRemoved = machineWasRemoved.map((it) => it.MachineID);
      if (machinesids.indexOf($scope.selectedMachine.Id) === -1) {
        let newMachine = {};
        if (machinesIdsWasRemoved.indexOf($scope.selectedMachine.Id) >= 0) {
          newMachine = machineWasRemoved[0];
          newMachine.UpsertType = $scope.upsertTypeEnum.UPDATE;
          $scope.removedMachines = $scope.removedMachines.filter((it) => machinesIdsWasRemoved.indexOf(it.MachineID) === -1);
        } else {
          newMachine = {
            ID: 0,
            IsActive: true,
            MachineID: $scope.selectedMachine.Id,
            MachineName: $scope.selectedMachine.MachineName,
            RootEventAttachDurationMin: 0,
            Sequence: $scope.machinesPipeline.length,
            UpsertType: $scope.upsertTypeEnum.INSERT,
          };
        }

        $scope.machinesPipeline.push(newMachine);
        machinesids.push($scope.selectedMachine.Id);
        $scope.allMachinesOptions = $scope.allMachines.filter((it) => machinesids.indexOf(it.Id) === -1);

        setTimeout(function () {
          $scope.drawLinesBetweenSortableBoxes();
        }, 500);
      }
    };

    $scope.removeMachine = function (machine, index) {
      if (machine.UpsertType !== $scope.upsertTypeEnum.INSERT) {
        $scope.removedMachines.push(machine);
      }
      machine.UpsertType = $scope.upsertTypeEnum.DELETE;

      let machinesids = $scope.machinesPipeline.filter((it) => it.MachineID && it.UpsertType !== $scope.upsertTypeEnum.DELETE).map((it) => it.MachineID);
      $scope.allMachinesOptions = $scope.allMachines.filter((it) => machinesids.indexOf(it.Id) === -1);
      $scope.machinesPipeline.splice(index, 1);

      setTimeout(function () {
        $scope.drawLinesBetweenSortableBoxes();
      }, 500);
    };

    $scope.cleanup = function () {
      $scope.linesList.forEach((item) => {
        item.remove();
      });
      $scope.linesList = [];
    };
  };

  return {
    transclude: true,
    restrict: "EA",
    templateUrl: template,
    scope: {
      currentProductionLine: "=",
      currentStep: "=",
      departments: "=",
      isNewProductionLine: "=",
      refreshTable: "=",
    },
    link: function (scope) {
      scope.$on("$destroy", function () {
        scope.cleanup();
      });
    },
    controller: controller,
    controllerAs: "newProductionLineCtrl",
  };
}

angular.module("LeaderMESfe").directive("newProductionLine", newProductionLine);
