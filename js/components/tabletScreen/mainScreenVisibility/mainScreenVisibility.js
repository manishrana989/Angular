function mainScreenVisibility() {
  var template = "js/components/tabletScreen/mainScreenVisibility/mainScreenVisibility.html";

  var controller = function ($scope, LeaderMESservice, $filter, toastr) {
    var mainScreenVisibilityCtrl = this;
    $scope.sortIndex = "index";
    $scope.mainScreenVisiblityObj = {
      machines: [],
      list: [
        {
          ID: "QualityTest",
          name: "QUALITY_TEST",
          active: false,
        },
        {
          ID: "OperatorLogin",
          name: "OPERATOR_LOGIN",
          active: false,
        },
        {
          ID: "ChangeProductionStatus",
          name: "CHANGE_PRODUCTION_STATUS",
          active: false,
        },
      ],


    };
    $scope.displayTypes = {
      selected:1,
      list: [
        {
          ID: "DefaultView",
          name: "DEFAULT_VIEW",
          displayType: 1,
        },
        {
          ID: "OnlineView",
          name: "ONLINE_VIEW",
          displayType: 2,
        },
      ],
    };

    mainScreenVisibilityCtrl.onlineSelectParameters ={
        selectedParameter:"Product",
        list: [
            { 
              ID: "Product",
              name: "PRODUCT",
            },
            {
              ID: "ProductCatalogID",
              name: "PRODUCT_CATALOG_ID",
            },
            {
              ID: "ERPJobID",
              name: "ERP_JOB_ID",
            },
            {
              ID: "Customer",
              name: "CUSTOMER",
            },
          ],
    }

    LeaderMESservice.customAPI("GetUserGroups").then(function (response) {
      mainScreenVisibilityCtrl.groups = response.ResponseList;
    });

    mainScreenVisibilityCtrl.updateGroup = function () {
      mainScreenVisibilityCtrl.loading = true;
      if (mainScreenVisibilityCtrl.selectedGroup) {
        LeaderMESservice.customAPI("GetUserGroupOperationsForOpApp", { UserGroup: mainScreenVisibilityCtrl.selectedGroup }).then(function (body) {
          mainScreenVisibilityCtrl.getDepartmentsMachines(body.Response);
          mainScreenVisibilityCtrl.loading = false;
        });
      }
    };

    mainScreenVisibilityCtrl.getDepartmentsMachines = function (userGroupData) {
      var count = 0;
      $scope.fetching = true;
      LeaderMESservice.customAPI("GetDepartmentMachine", { DepartmentID: 0 }).then(function (response) {
        $scope.mainScreenVisiblityObj.machines = userGroupData?.Machines?.split(",").map((machineID) => +machineID);
        $scope.allDepartments = _.forEach(response.DepartmentMachine, function (department) {
          department.Value = _.uniq(department.Value, "Id");
        });
        $scope.allDepartmentsTemp = angular.copy($scope.allDepartments);
        $scope.allDepartmentsTemp.selected = true;
        _.forEach($scope.allDepartmentsTemp, function (department) {
          count = 0;
          _.forEach(department.Value, function (machine) {
            if ($scope.mainScreenVisiblityObj.machines.indexOf(machine.Id) > -1) {
              machine.selected = true;
              count++;
            } else {
              machine.selected = false;
            }
          });
          if (count == department.Value.length) {
            department.selected = true;
          } else {
            department.selected = false;
          }
        });

        $scope.displayTypes.selected = userGroupData.DisplayType ? userGroupData.DisplayType : 1 ;
        mainScreenVisibilityCtrl.onlineSelectParameters.selectedParameter = userGroupData.MainParameterName ? userGroupData.MainParameterName : "Product" ;
        
        _.forEach($scope.mainScreenVisiblityObj.list, function (data) {
          if (userGroupData && userGroupData[data.ID] != undefined) {
            data.active = userGroupData[data.ID];
          }
        });
      });
    };
    $scope.selectAllDepartment = function (department) {
      department.Value.forEach(function (machine) {
        if (machine.selected != department.selected) {
          machine.selected = department.selected;
        }
      });
    };
    $scope.saveData = function () {
      $scope.mainScreenVisiblityObj.machines = [];
      $scope.allDepartmentsTemp.forEach(function (department) {
        department.Value.forEach(function (machine) {
          if (machine.selected) {
            $scope.mainScreenVisiblityObj.machines.push(machine.Id);
          }
        });
      });

      var operations = [
        {
          UserGroup: mainScreenVisibilityCtrl.selectedGroup,
          OperatorLogin: $scope.mainScreenVisiblityObj.list[1].active,
          ChangeProductionStatus: $scope.mainScreenVisiblityObj.list[2].active,
          QualityTest: $scope.mainScreenVisiblityObj.list[0].active,
          Machines: $scope.mainScreenVisiblityObj.machines.join(","),
          DisplayType : $scope.displayTypes.selected,
          MainParameterName:  mainScreenVisibilityCtrl.onlineSelectParameters.selectedParameter,
        },
      ];

      LeaderMESservice.customAPI("EditUserGroupOperationsForOpApp", { operations }).then(function (response) {
        toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
      });
    };
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {},
    controller: controller,
    controllerAs: "mainScreenVisibilityCtrl",
  };
}

angular.module("LeaderMESfe").directive("mainScreenVisibility", mainScreenVisibility);
