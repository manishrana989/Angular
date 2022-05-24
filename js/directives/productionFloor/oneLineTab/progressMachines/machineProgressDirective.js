function machineProgress() {
  var template = "views/custom/productionFloor/onlineTab/progressMachines.html";

  var controller = function ($scope, toastr, LeaderMESservice, $timeout, CollapsedMachinesService, OnlineService, $filter, $localStorage) {
    var machineProgressCtrl = this;
    if($localStorage.machineOnlineSettings?.ShiftProgress)
    {
      $scope.settings =  $localStorage.machineOnlineSettings?.ShiftProgress
    }
    else
    {
      $scope.settings = angular.copy(OnlineService.machineOnlineSettings);
    }
    $scope.min = function (value) {
      return Math.min(value, 100);
    };

    $scope.editTypeEnum = {
      INPUT: "input",
      DROP_LIST: "dropList",
    };
    $scope.paramsByCalc = {
      currentJob: [
        {
          FieldName: "JoshProgressPC",
          title: "",
          editable: false,
        },
        {
          FieldName: "UnitsProducedOKJosh",
          title: "UNITS_PRODUCED_OK",
          editable: false,
        },
        {
          FieldName: "UnitsProducedTheoreticallyJosh",
          title: "TH.JOSH",
          editable: false,
        },
        {
          FieldName: "UnitsTargetJosh",
          title: "UNITS_TARGET",
          editable: false,
        },
      ],
      shiftUnitTarget: [
        {
          FieldName: "ShiftProgressPC",
          title: "",
          editable: false,
        },
        {
          FieldName: "UnitsProducedOKShift",
          title: "UNITS_PRODUCED_OK",
          editable: false,
        },
        {
          FieldName: "UnitsProducedTheoreticallyShift",
          title: "TH.SHIFT",
          editable: true,
          editType: $scope.editTypeEnum.DROP_LIST,
          editTypeList: "TheoreticalMenuList",
        },
        {
          FieldName: "UnitsTargetShift",
          title: "SHIFT_UNIT_TARGET",
          editable: false,
        },
      ],
    };

    $scope.selectedMenu = {};
    if (!$localStorage.machineEditParams) {
      $scope.machineEditParams = CollapsedMachinesService.machineEditParams;
      $localStorage.machineEditParams = $scope.machineEditParams;
    } else {
      $scope.machineEditParams = $localStorage.machineEditParams;
      CollapsedMachinesService.machineEditParams = $scope.machineEditParams;
    }
    $scope.selectedMenu["bar"] = $scope.machineEditParams.barMenuList.find((it) => it.selected);
    $scope.selectedMenu["production"] = $scope.machineEditParams.productMenuList.find((it) => it.selected);
    //set default bar
    if (!$scope.selectedMenu["bar"]) {
      $scope.machineEditParams.barMenuList[2].selected = true;
      $scope.selectedMenu["bar"] = $scope.machineEditParams.barMenuList[2];
    }

    if (!$scope.selectedMenu["production"]) {
      $scope.machineEditParams.productMenuList[1].selected = true;
      $scope.selectedMenu["production"] = $scope.machineEditParams.productMenuList[1];
    }

    Object.entries($scope.paramsByCalc)
      .map((it) => it[1])
      .flat()
      .filter((it) => it.editable && it.editTypeList && it.editType === $scope.editTypeEnum.DROP_LIST)
      .forEach((item) => {
        $scope.selectedMenu[item.FieldName] = $scope.machineEditParams[item.editTypeList].find((it) => it.selected);
      });

    $scope.percentSlider = {
      value: Math.min($scope.content[$scope.paramsByCalc[$scope.settings.calculateBy][0].FieldName], 100),
      color: "green",
      options: {
        floor: 0,
        ceil: 100,
      },
    };

    $scope.pastColumnCount = function (index) {
      let count = 0;
      for (let i = 0; i < index && i < $scope.shapes[$scope.settings.shapeType].length; i++) {
        count = count + $scope.shapes[$scope.settings.shapeType][i].col;
      }
      return count;
    };
    $scope.machineBox = $scope.content;

    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.doneLoading = false;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.counterItems = 0;
    $scope.editValue = {
      FieldName: $scope.paramsByCalc[$scope.settings.calculateBy][3].FieldName,
      value: $scope.machineBox[$scope.paramsByCalc[$scope.settings.calculateBy][3].FieldName],
    };

    $scope.shapes = [
      [{ col: 3, fontSize: "0.625vw", numberFontSize: "0.9vw", detailsDirection: "column" }],
      [
        { col: 1, fontSize: "0.6vw", numberFontSize: "0.7vw", detailsDirection: "column" },
        { col: 1, fontSize: "0.6vw", numberFontSize: "0.7vw", detailsDirection: "column" },
        { col: 1, fontSize: "0.6vw", numberFontSize: "0.7vw", detailsDirection: "column" },
      ],
    ];

    var menuAndSubMenu = LeaderMESservice.getMainMenu();
    $scope.productionFloorMenu = _.find(menuAndSubMenu, { TopMenuAppPartID: 500 });
    if ($scope.productionFloorMenu) {
      $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, { SubMenuExtID: $scope.departmentId });
    }

    $scope.showProductionTitle = function () {
      let productionTitle = $scope.machineEditParams.productionFloorMenu.find((it) => it.selected);
      if (productionTitle) {
        return productionTitle.FieldName;
      } else {
        return "";
      }
    };

    $scope.onMenuChange = function (selectedParamBar, list, type) {
      list.forEach((it) => {
        if (it.FieldName === selectedParamBar.FieldName) {
          it.selected = true;
        } else {
          it.selected = false;
        }
      });
      if (type == "shift") {
        $scope.paramsByCalc[$scope.settings.calculateBy][2].FieldName = $scope.selectedMenu[type].FieldName;
      }
    };
    $scope.calcMachineFontSize = function () {
      if (!$scope.machineBox || !$scope.machineBox.MachineLname || !$scope.machineBox.MachineEName) return;
      let machineTextLength = $scope.rtl ? $scope.machineBox.MachineLname.length : $scope.machineBox.MachineEName.length;
      let scale = $scope.settings.selectedScale.scale;
      switch (true) {
        case machineTextLength < 10:
          return 1.3 * scale + "vw";
          break;
        case machineTextLength < 15:
          return 1.1 * scale + "vw";
          break;
        case machineTextLength < 20:
          return 0.8 * scale + "vw";
          break;
        case machineTextLength < 25:
          return 0.65 * scale + "vw";
          break;
        default:
          return 0.4 * scale + "vw";
          break;
      }
    };

    $scope.onSaveEditableValue = function () {
      toastr.clear();
      let body = {
        MachineID: $scope.machineBox.MachineID,
        ShiftUnitsTarget: Number($scope.editValue.value),
      };
      if (body.ShiftUnitsTarget) {
        LeaderMESservice.customAPI("UpdateShiftTarget", body).then(function (response) {
          $scope.machineBox[$scope.paramsByCalc[$scope.settings.calculateBy][3].FieldName] = Number($scope.editValue.value);
          $scope.paramNeedToSaving = false;
          toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
        });
      } else {
        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));
      }
    };

    $scope.$watch(
      "machineEditParams",
      (newVal, oldVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          $scope.selectedMenu = {};
          $scope.selectedMenu["bar"] = $scope.machineEditParams.barMenuList.find((it) => it.selected);
          $scope.selectedMenu["production"] = $scope.machineEditParams.productMenuList.find((it) => it.selected);
          Object.entries($scope.paramsByCalc)
            .map((it) => it[1])
            .flat()
            .filter((it) => it.editable && it.editTypeList && it.editType === $scope.editTypeEnum.DROP_LIST)
            .forEach((item) => {
              $scope.selectedMenu[item.FieldName] = $scope.machineEditParams[item.editTypeList].find((it) => it.selected);
            });
        }
      },
      true
    );
    $scope.$watch("calculateBy.value", (newVal, oldVal) => {
      if (newVal !== oldVal) {
        $scope.percentSlider.value = Math.min($scope.content[$scope.paramsByCalc[$scope.settings.calculateBy][0].FieldName], 100);
      }
    });

    $scope.$watch("settings.calculateBy", () => {
      if ($scope.settings.calculateBy == "shiftUnitTarget" && $scope.content.UnitsTargetShift == 0) {
        $scope.machineColor = "#A7A9AB";
        $scope.redTarget = true;
      } else if ($scope.settings.calculateBy == "currentJob" && $scope.content.UnitsTargetJosh == 0 && !($scope.content.ProductionModeID > 1)) {
        $scope.redTarget = true;
        $scope.machineColor = "#A7A9AB";
      } else {
        $scope.redTarget = false;
      }
    });
  };

  return {
    restrict: "A",
    templateUrl: template,
    scope: {
      content: "=",
      showPencils: "=",
      showThreeParams: "=",
      parameters: "=",
      updateStructures: "=",
      jobConfiguration: "=",
      machineColor: "=",
    },
    controller: controller,
    controllerAs: "machineProgressCtrl",
  };
}

angular.module("LeaderMESfe").directive("machineProgress", machineProgress);
