function opAppDirective() {
  const template = "views/custom/appView/opApp.html";

  const controller = function ($scope, $state, LeaderMESservice, BreadCrumbsService, toastr, $filter, googleAnalyticsService,$timeout) {
    const opAppCtrl = this;

    googleAnalyticsService.gaPV("Tablet_customization_screen");

    opAppCtrl.localLanguage = LeaderMESservice.showLocalLanguage();

    opAppCtrl.showBreadCrumb = true;

    opAppCtrl.tabletData = {
      params: [],
      machineParams: [],
    };

    if ($state.current.name == "customFullView") {
      opAppCtrl.showBreadCrumb = false;
    }

    if (!$state.params.menuContent) {
      $scope.stateParams = LeaderMESservice.getStateParams();
    } else {
      $scope.stateParams = $state.params.menuContent;
    }

    if (true) {
      BreadCrumbsService.init();
      if (opAppCtrl.localLanguage == true) {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
      } else {
        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
      }
    }

    LeaderMESservice.customAPI('GetJobCustomParameters',{}).then(response => {
      $scope.customParams = response && response.JobParams || [];
    });

    opAppCtrl.addRow = function () {
      // if (opAppCtrl.tabletData.machineParams.length > 6){
      //     return;
      // }
      opAppCtrl.tabletData.machineParams.push({ FieldName: null, TypeID: null, IsActive: false, OpAppBatchGraph: false });
      opAppCtrl.tabletData.machineParams.push({ FieldName: null, TypeID: null, IsActive: false, OpAppBatchGraph: false });
      opAppCtrl.tabletData.machineParams.push({ FieldName: null, TypeID: null, IsActive: false, OpAppBatchGraph: false });
    };

    opAppCtrl.removeRow = function (index) {
      const paramsToRemoveFromDropdown = opAppCtrl.tabletData.machineParams.splice(index - 2, 3);
      angular.forEach(paramsToRemoveFromDropdown, function (paramToRemove) {
        let removedParam = _.find(opAppCtrl.tabletData.params, { FieldName: paramToRemove.FieldName });
        if (removedParam) {
          removedParam.hide = false;
        }
      });
    };

    opAppCtrl.saveStructure = function () {
      var machineParams = _.map(opAppCtrl.tabletData.machineParams, function (machineParam, index) {
        delete machineParam.showDropDown;
        machineParam.DisplayOrder = index + 1;
        return machineParam;
      });
      _.remove(machineParams, { FieldName: null });

      const customParams = _.remove(machineParams, { custom: true });
      var requestBody = {
        Parameters: machineParams,
        JobCustomParam: customParams.map(it => ({ParamID: it.customID,ListItemID: 0,DisplayOrder: it.DisplayOrder})),
        MachineType: opAppCtrl.tabletData.selectedMachineType.ID,
      };

      if (opAppCtrl.tabletData.applyTo == "allMachines") {
        requestBody.UpdateAllMachines = true;
      } else {
        const selectedMachines = _.filter(opAppCtrl.tabletData.selectedMachineType.Machines, { selected: true });

        if (_.findIndex(selectedMachines, { Id: opAppCtrl.tabletData.selectedMachine.Id }) < 0) {
          selectedMachines.push(opAppCtrl.tabletData.selectedMachine);
        }
        const selectedMachineIds = _.map(selectedMachines, "Id");
        requestBody.MachineID = selectedMachineIds;
      }
      LeaderMESservice.customAPI("UpdateControllerFieldParams", requestBody).then(function (response) {
        //to clear previous toastr to prevent toastr duplicating on screen
        toastr.clear();
        toastr.success($filter("translate")("STRUCTURE_SAVED_SUCCESSFULLY"));
        const removedFields = _.remove(opAppCtrl.tabletData.machineParams, { FieldName: null });
        opAppCtrl.tabletData.machineParams = opAppCtrl.tabletData.machineParams.concat(removedFields);
      });
    };
    opAppCtrl.removeParamFromDropDown = function (paramToRemove) {
      const index = _.findIndex(opAppCtrl.tabletData.params, { FieldName: paramToRemove });
      if (index > -1) {
        opAppCtrl.tabletData.params[index].hide = true;
      }
    };
    opAppCtrl.updateMachineData = function (machineParams) {
      
      let tmpMachineParams = _.filter(machineParams, function (param) {
        return param.DisplayOrder > 0;
      });

      tmpMachineParams = _.sortBy(tmpMachineParams, "DisplayOrder");

      tmpMachineParams = _.map(tmpMachineParams, function (param) {
        return {
          FieldName: param.FieldName,
          TypeID: param.TypeID,
          IsActive: true,
          OpAppBatchGraph: param.OpAppBatchGraph,
          DisplayOrder: param.DisplayOrder,
          custom: param.custom,
          customID : param.custom && param.Id || undefined
        };
      });

      let index = tmpMachineParams.length;
      while (index % 3 !== 0) {
        index++;
        tmpMachineParams.push({ FieldName: null, TypeID: null, IsActive: false, OpAppBatchGraph: false, DisplayOrder: index });
      }

      angular.forEach(tmpMachineParams, function (paramToRemove) {
        let index = _.findIndex(opAppCtrl.tabletData.params, { FieldName: paramToRemove.FieldName });

        if (index > -1) {
          opAppCtrl.tabletData.params[index].hide = true;
        }
      });

      return tmpMachineParams;
    };

    $scope.sortableOptions = {
      handle: ".drag-icon",
    };

    $scope.sortableOptionsEvent = {
      handle: ".drag-icon-event",
    };

    $timeout(function () {
      $(".add-drag-class").sortable({ handle: ".drag-icon" });
    }, 0);
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "opAppCtrl",
  };
}

angular.module("LeaderMESfe").directive("opAppDirective", opAppDirective);
