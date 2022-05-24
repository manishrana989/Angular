function applyToModelDirective() {
    var template = "views/custom/productionFloor/onlineTab/applyToModel.html";
  
    var controller = function (toastr, $scope, LeaderMESservice, $filter, 
        $sessionStorage, shiftService,$localStorage, $rootScope) {
      var applyToModelDirectiveCtrl = this;
      $scope.applyStructureTo = {
        currentChoice:"MY_USER",
        userGroupValue:[]
      }
      $scope.shiftData = shiftService.shiftData
      if($scope.structureType == 3)
      {
        $scope.allMachines = _.map($scope.allMachines,function(machine){
          
          return machine;
        })
      }
      $scope.machineList = _.filter($scope.allMachines,machineTemp =>machineTemp.MachineTypeID == $scope.machine.MachineTypeID)
      $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure;
      applyToModelDirectiveCtrl.showApplyModel = $scope.showApplyModel 
      applyToModelDirectiveCtrl.chosenUsers = []
      applyToModelDirectiveCtrl.groupByMachines = []
      applyToModelDirectiveCtrl.groupByMachines = {
        ID: "MachineTypeID",
        EName: "MachineTypeEName",
        LName: "MachineTypeLName",
        ENameArray: "MachineEName",
        LNameArray: "MachineLname",
        IDArray: "MachineID",
        machinesSort: [],
        idType: 3,
        dropBoxName: $filter("translate")("MACHINE_TYPE"),
        UngroupedName: "MACHINES",
      };
      
      $scope.creatingGroupByElement = function (filterType, obj, sortName) {
        if (!_.isEmpty(filterType) && !_.isEmpty(filterType[0])) {
          
            // if (obj.dropBoxName !== $filter("translate")("UNGROUPED")) {
              obj[sortName] = _.uniq(
                _.map(filterType, function (type) {
                  return {
                    EName: type[obj.EName] !== "" ? type[obj.EName] : $filter("translate")(obj.UngroupedName),
                    LName: type[obj.LName] !== "" ? type[obj.LName] : $filter("translate")(obj.UngroupedName),
                    ID: type[obj.ID],
                    value: type.value == undefined || type.value == true ? true : false,
                    array: [],
                  };
                }),
                "ID"
              ).sort(function (a, b) {
                return b.ID - a.ID;
              });
            // }
            //  else {
            //   obj[sortName].push({
            //     EName: $filter("translate")(obj.UngroupedName),
            //     LName: $filter("translate")(obj.UngroupedName),
            //     ID: obj.ID,
            //     value: true,
            //     array: [],
            //   });
            // }
  
            _.forEach(filterType, function (type) {
              // if (obj.dropBoxName !== $filter("translate")("UNGROUPED")) {
                var findItem = _.find(obj[sortName], { ID: type[obj.ID] });
              // }
              //  else {
              //   if (sortName == "shiftTypeSort") {
              //     var findItem = _.find(obj[sortName], { ID: obj.ID });
              //   } else {
              //     var findItem = _.find(obj[sortName], { ID: obj.IDArray });
            //   }
              // }
  
              findItem.array.push({
                LName: type[obj.LNameArray],
                EName: type[obj.ENameArray],
                ID: type[obj.IDArray],
                value: type.value == undefined || type.value == true ? true : false,
              });
            });          
        }
        return obj;
      };

      applyToModelDirectiveCtrl.selectUnSelectAllGroups = function (groupBy, value) {
        groupBy.forEach(function (temp) {
          temp.value = value;
          applyToModelDirectiveCtrl.selectUnSelectAll(temp.array, value);
        });
      };

      applyToModelDirectiveCtrl.selectUnSelectAll = function (data, value) {
        if (data) {
          data.forEach(function (field) {
            field.value = value;
          });
        }
      };
     $scope.creatingGroupByElement($scope.machineList, applyToModelDirectiveCtrl.groupByMachines, "machinesSort")
      
     $scope.sendStructure = function(){
      var sendObj;
      if($scope.applyStructureTo.currentChoice == "USER_GROUP" && $scope.applyStructureTo?.userGroupValue?.length > 0){
        
        sendObj = {"machineStructure":[{"MachineArr":[..._.filter(applyToModelDirectiveCtrl.groupByMachines.machinesSort[0].array,machine => machine.value).map(machine => machine.ID)],StructureType:$scope.structureType,Structure:JSON.stringify($scope.machineStructureData)}],userGroups:[...$scope.applyStructureTo.userGroupValue],IsDefault:true}
      }else{
        sendObj = {"machineStructure":[{"MachineArr":[..._.filter(applyToModelDirectiveCtrl.groupByMachines.machinesSort[0].array,machine => machine.value).map(machine => machine.ID)],StructureType:$scope.structureType,Structure:JSON.stringify($scope.machineStructureData)}]}
      }
      $rootScope.$broadcast('saveSettingsStructure',sendObj);
      LeaderMESservice.customAPI("SaveMachineStructure", sendObj).then(function (response) {
        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
        $scope.$emit("closeModel",false);
        if($scope.updateStructures)
        {
          $scope.updateStructures();
        }
      },function (err) {
        toastr.error("", $filter("translate")("SOMETHING_WENT_WRONG"));      
        $scope.$emit("closeModel",false);
      });
     }
    };
  
    return {
      restrict: "E",
      templateUrl: template,
      scope: {
       usersData:"=",
       allMachines:"=",
       machine:"=",
       showApplyModel:"=",
       machineStructureData:"=",
       structureType:"=",
       updateStructures:"=",
       type:"="
      },
      controller: controller,
      controllerAs: "applyToModelDirectiveCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("applyToModelDirective", applyToModelDirective);