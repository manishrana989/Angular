function onlineSettingsDirective() {
  var template = "js/directives/productionFloor/oneLineTab/onlineSettings/onlineSettings.html";

  var controller = function ($timeout, $scope, LeaderMESservice, OnlineSettingsService, 
      OnlineService, $localStorage,toastr,$filter,$sessionStorage, $rootScope) {
    var onlineSettingsCtrl = this;
    $scope.rtl = LeaderMESservice.isLanguageRTL();

    $scope.displaySettingsByType = OnlineSettingsService.displaySettingsByType;
    $scope.colorModeArray = OnlineSettingsService.colorModeArray;
    $scope.squareArray = OnlineSettingsService.squareArray;
    $scope.percentageColors = $scope.machineOnlineSettings.percentageColors;
    // this is for department View we have problem saving it
    $scope.machineOnlineSettingsTemp = angular.copy($scope.machineOnlineSettings);
    $scope.allowSettingSaving = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure
    $scope.settingsChanged = OnlineSettingsService.saveSettings;
    $scope.scaleArray = OnlineSettingsService.scaleArray;

    if($scope.type == 'online')
    {
      $scope.checkMarkTop = 0.5
    }else if($scope.type == 'department')
    {
      $scope.checkMarkTop = 0.3
    }
    LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
      $scope.usersData = response.Users;
      $scope.groupsData = response.Groups;
  });

    $scope.saveParamToSessionsInitWrapper = function(property,dontSaveStructure) {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        $scope.saveParamToSessions(property,dontSaveStructure);
      },0);
    };
    $scope.saveColorModeSelection = function (selectedColorMode) {
      for (let i = 0; i < $scope.colorModeArray.length; i++) {
        let colorModeObj = $scope.colorModeArray[i];
        if (colorModeObj.id === selectedColorMode.id) {
          colorModeObj.clicked = true;
          $scope.machineOnlineSettings.colorMode = colorModeObj;
          $localStorage.machineOnlineSettings[$scope.type].colorMode = colorModeObj;
        } else {
          colorModeObj.clicked = false;
        }
      }
      $scope.saveParamToSessionsInitWrapper('colorMode');
    };

    $scope.saveDisplaySelection = function (selectedSquare,dontSaveStructure) {
      let arrayOfSquare = $scope.squareArray[$scope.type];
      for (let i = 0; i < arrayOfSquare.length; i++) {
        let square = arrayOfSquare[i];
        if (square.id === selectedSquare?.id || square.id === selectedSquare) {
          $scope.machineOnlineSettings.shapeType = square.id;
          square.clicked = true;
          square.src = square.srcActive;
        } else {
          square.clicked = false;
          square.src = square.srcInactive;
        }
      }
      $scope.saveParamToSessionsInitWrapper('shapeType',dontSaveStructure);
    };

    $scope.saveScaleSelection = function (selectedScale,dontSaveStructure) {
      for (let i = 0; i < $scope.scaleArray.length; i++) {
        let scaleOpj = $scope.scaleArray[i];
        if (scaleOpj.id === selectedScale.id) {
          scaleOpj.clicked = true;
          scaleOpj.src = scaleOpj.srcActive;
          $scope.machineOnlineSettings.selectedScale = scaleOpj;
          if (selectedScale.id === 2 && $scope.type === OnlineService.typeEnum.ONLINE)
            $scope.saveDisplaySelection($scope.squareArray[$scope.type][4],dontSaveStructure);
        } else {
          scaleOpj.clicked = false;
          scaleOpj.src = scaleOpj.srcInactive;
        }
      }
      $scope.saveParamToSessionsInitWrapper('selectedScale',dontSaveStructure);
    };

    $scope.saveParamToSessions = function (property,dontSaveStructure) {
      $localStorage.machineOnlineSettings[$scope.type][property] = $scope.machineOnlineSettings[property];
      if(!dontSaveStructure )
      {
        $scope.saveSettingsStructure();
      }
      // OnlineService.deleteProductionLines();
    };

    $scope.toggleScreenProductionProgress = function () {
      $scope.machineOnlineSettings.maximize = !$scope.machineOnlineSettings.maximize;
      if(!$localStorage.allMachinesFullScreen)
      {
        $localStorage.allMachinesFullScreen = {value:false}
      }
      $localStorage.allMachinesFullScreen.value = $scope.machineOnlineSettings.maximize;
    };

    $scope.saveColorParamsToServer = function () {
      var ObjectColorArray = [];

      $scope.percentageColors.forEach(function (temp) {
        ObjectColorArray.push({
          ColorID: temp.color,
          PC: temp.value,
          ParameterID: temp.parameterID,
        });
      });
      LeaderMESservice.customAPI("UpdateProductionProgressColorDefinition", { ProductionColorDefinition: ObjectColorArray }).then(function(){
        toastr.clear();
        toastr.success("", $filter("translate")("SUCCESSFULLY"));
      });
    };

    $rootScope.$on('saveSettingsStructure',(e, data) => {
      $scope.saveSettingsStructure(data.userGroups);
    });

    $scope.saveSettingsStructure = (groupID,departmentView) => {
      if ($scope.saveSettingsTimeout){
        $timeout.cancel($scope.saveSettingsTimeout);
        $scope.saveSettingsTimeout = null;
      }
      $scope.saveSettingsTimeout = $timeout(() => {
        saveSettingsStructureLocal(groupID,departmentView);
      },200);
    };

    const saveSettingsStructureLocal = function(groupID,departmentView){  
      var reqBody;
      // if(groupID == -2) return;
      if(!groupID && $scope.type == 'online'){
        groupID = [$localStorage.selectTemplateGroupID.collapsed]
      }else if(!groupID && $scope.type == "department")
      {
        groupID = [$localStorage.selectTemplateGroupID.depCollapsed]
      }
      var structure = angular.copy($localStorage.machineOnlineSettings[$scope.type])
      if(departmentView)
      {
        structure.departmentView = angular.copy($scope.machineOnlineSettingsTemp.departmentView)
      }
      if(groupID && $scope.allowSettingSaving){
        newUserGroup = [...groupID];
        if (newUserGroup.indexOf(-2) >= 0){
          newUserGroup.splice(newUserGroup.indexOf(-2),1);
        }
         reqBody = {
        Structure:{
          Structure:JSON.stringify(structure),
          StructureType:2,
          IsDefault: true ,
          UserGroups:[...newUserGroup],
          DepartmentID:$scope.departmentId ? $scope.departmentId : 0
        }}
      }
      else 
      {          
         reqBody = {
          Structure:{
          Structure:JSON.stringify(structure),
          StructureType:2,
          IsDefault:false,
          DepartmentID:$scope.departmentId ? $scope.departmentId : 0}}
      }

      LeaderMESservice.customAPI("SavePageStructure", reqBody).then(function(){
        // toastr.clear();
        // if(groupID){
        //   toastr.success("", $filter("translate")("SUCCESSFULLY"));
        // }
        if(departmentView)
        {
          $scope.machineOnlineSettings.departmentView = structure.departmentView;
          $localStorage.machineOnlineSettings[$scope.type].departmentView = $scope.machineOnlineSettings.departmentView;     
        }
      });
    }

    $scope.saveDepartment = function()
    {
      $scope.saveSettingsStructure(null,true)
    }
    if($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type] && $localStorage.machineOnlineSettings[$scope.type].shapeType != undefined)
    {
      $scope.saveDisplaySelection($localStorage.machineOnlineSettings.shapeType)
    }
    if($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type] && $localStorage.machineOnlineSettings[$scope.type].selectedScale != undefined)
    {
      $scope.saveScaleSelection($localStorage.machineOnlineSettings[$scope.type].selectedScale)
    }

  };

  return {
    restrict: "AE",
    templateUrl: template,
    scope: {
      machineOnlineSettings: "=",
      type: "=",
      departmentId:"="
    },
    controller: controller,
    controllerAs: "onlineSettingsCtrl",
  };
}

angular.module("LeaderMESfe").directive("onlineSettingsDirective", onlineSettingsDirective);
