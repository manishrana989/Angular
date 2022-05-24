function shiftFilter($timeout) {
  var controller = function ($scope, shiftService, $sessionStorage,$localStorage, LeaderMESservice,$rootScope) {
    var shiftFilterCtrl = this;
    if (!$localStorage.shiftInfo) {
      $localStorage.shiftInfo = {};
      $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {
        machineFilter: {
        views:{
          groupBy:true,
          groupByLine:false,
          groupByGroup:false
        },
        shiftMachineFilterOption:'line'
      }
     } 
    }else if(!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID]){
      $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
    }else if(!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter){
      $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter={
        views:{
          groupBy:true,
          groupByLine:false,
          groupByGroup:false
        },
        shiftMachineFilterOption:'line'
      };
    }

    $scope.views=$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.views;

    $scope.changeGroupBy=()=>{
      $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.shiftMachineFilterOption = $scope.shiftMachineFilterOption;
    }

    $scope.UpdateCheckbox = function (id) {            
      var IsActive = false;
      var count=0;
      if($scope.shiftMachineFilterOption==='group' ){

        if($('#machine_' + id).is(':checked')){
          for (let group in $scope.shiftData.tempMachinesDisplay) {

            if ($scope.shiftData.tempMachinesDisplay[parseInt(group)] === false) {
              $('#allMachines').prop('checked', true);
            }
            
          }
        }
          else { for (let group in $scope.shiftData.tempMachinesDisplay) {

            if ($scope.shiftData.tempMachinesDisplay[parseInt(group)] === true) {
              IsActive = true;
              count++;
            }
            
          }
        }
        
      }

      else if($scope.shiftMachineFilterOption==='ungroup'){
        if ($('#machineug_' + id).is(':checked')) {          
            for (let ungroup in $scope.shiftData.tempMachinesDisplay) {
              if ($scope.shiftData.tempMachinesDisplay[parseInt(ungroup)] === false) {
                $('#allMachines').prop('checked', true);
              }
            }      
  
      
         
    
        } else {
         
          if($scope.shiftMachineFilterOption==='ungroup'){
          for (let ungroup in $scope.shiftData.tempMachinesDisplay) {
            if ($scope.shiftData.tempMachinesDisplay[parseInt(ungroup)] === true) {
              IsActive = true;
              count++;
            }
          }}
  
        
         
             
        }
      }
      
      else{
        if($('#machinel_' + id).is(':checked')){
          for (let line in $scope.shiftData.tempMachinesDisplay) {
            if ($scope.shiftData.tempMachinesDisplay[parseInt(line)] === false) {
              $('#allMachines').prop('checked', true);
            }
          }  
        }
        
        else{ for (let line in $scope.shiftData.tempMachinesDisplay) {
          if ($scope.shiftData.tempMachinesDisplay[parseInt(line)] === true) {
            IsActive = true;
            count++;
          }
        }
  
         }
      }

      if (IsActive && count===1) {
        $('#allMachines').prop('checked', false);
      }    
    }

    $scope.toggleMachines = function () {
      if(!$scope.shiftData.Machines)
      {
        return;
      }
      // $scope.shiftData.tempMachinesDisplay={}
      // $scope.shiftData.tempMachinesGroupsDisplay = {}
      // $scope.shiftData.tempMachinesLinesDisplay = {}

      if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
      {
        $scope.shiftData.tempMachinesDisplay = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
      }
      if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesGroupsDisplay)
      {
        $scope.shiftData.tempMachinesGroupsDisplay = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesGroupsDisplay)
      }
      if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesLinesDisplay)
      {
        $scope.shiftData.tempMachinesLinesDisplay = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesLinesDisplay)
      }

      $scope.shiftData.Machines.forEach(function (machine) {
        $scope.shiftData.tempMachinesDisplay[machine.machineID] = $scope.shiftData.allMachinesDisplayTemp;
      });

      for (let group in $scope.shiftData.tempMachinesGroupsDisplay) {
        $scope.shiftData.tempMachinesGroupsDisplay[group] = $scope.shiftData.allMachinesDisplayTemp;
      }

      for (let line in $scope.shiftData.tempMachinesLinesDisplay) {
        $scope.shiftData.tempMachinesLinesDisplay[line] = $scope.shiftData.allMachinesDisplayTemp;
      }
      $scope.shiftData.hasShiftFilterTemp = false;
    };

    $scope.toggleMachineSection = (isGroup, sectionID, machines) => {
      let isChecked = isGroup ? shiftService.shiftData.tempMachinesGroupsDisplay[sectionID] : shiftService.shiftData.tempMachinesLinesDisplay[sectionID];
      if (machines) {
        angular.forEach(machines, (machine) => {
          $scope.shiftData.tempMachinesDisplay[machine.Id] = isChecked;
        });
      }
    };

    $scope.machineGroupFilterExist = function () {
      return $scope.machinegroupsobj && Object.keys($scope.machinegroupsobj).length>0;
    };

    $scope.machineLineFilterExist = function () {
      return $scope.machinelinesobj && Object.keys($scope.machinelinesobj).length>0;
    };


    $scope.init = function(){
      if($scope.shiftData !=undefined && $scope.shiftData.Machines){
        if ($('#allMachines').is(':checked')) {   
      $scope.shiftData.allMachinesDisplayTemp=true;
      
     }else{
      $scope.shiftData.allMachinesDisplayTemp=false;
     }
  
     $scope.shiftData.Machines.forEach(function (machine) {
      $scope.shiftData.tempMachinesDisplay[machine.machineID] = $scope.shiftData.allMachinesDisplayTemp;
    });    
    for (let group in $scope.shiftData.tempMachinesGroupsDisplay) {
      $scope.shiftData.tempMachinesGroupsDisplay[group] = $scope.shiftData.allMachinesDisplayTemp;
    }
    for (let line in $scope.shiftData.tempMachinesLinesDisplay) {
      $scope.shiftData.tempMachinesLinesDisplay[line] = $scope.shiftData.allMachinesDisplayTemp;
    }
      }
      $scope.shiftData = shiftService.shiftData;
      $scope.shiftMachineFilterOption=$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.shiftMachineFilterOption;      
      $scope.shiftData.stickerText = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText || "";
      let machineFilteredCount = 0;
      let lastMachineDisplay;
      let machines;      
      if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
      {
         machines = angular.copy($sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay)
      }
      else
      {
        machines = angular.copy($scope.shiftData.machinesDisplay)
      }
      for (let machineDisplay in machines) {
        if (machines[machineDisplay] == true) {
          lastMachineDisplay = machineDisplay;
          machineFilteredCount++;
        }
      }
  
      if (machineFilteredCount >= 2) {
        if (machineFilteredCount == Object.getOwnPropertyNames(machines).length) {
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].hasShiftFilter = false;
        } else {
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].hasShiftFilter = true;
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText = "Multiple values";
        }
      } else if(machineFilteredCount == 1) {
        if ($scope.shiftData && $scope.shiftData.Machines) {
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].hasShiftFilter = true;
          let lonelyMachine = $scope.shiftData.Machines.find((machine) => Number(machine.machineID) === Number(lastMachineDisplay));
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText =  lonelyMachine && lonelyMachine.machineName;
        }
      }
      $scope.shiftData.hasShiftFilter = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].hasShiftFilter
      $scope.shiftData.stickerText = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText
      if($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machineGroupsDisplay){ 
        $scope.shiftData.tempMachinesGroupsDisplay = $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machineGroupsDisplay
      }
    }
    $scope.init()


    $scope.applyUpdateMachines = function (event) {
      var machineId;
      if (event) {
        event.stopPropagation();
      }
      shiftService.updateShowFilterShift(false);
      $timeout(function () {
        $scope.shiftData.machinesDisplay = angular.copy($scope.shiftData.tempMachinesDisplay);
        $scope.shiftData.machineGroupsDisplay = angular.copy($scope.shiftData.tempMachinesGroupsDisplay);
        $scope.shiftData.machineLinesDisplay = angular.copy($scope.shiftData.tempMachinesLinesDisplay);
        $scope.shiftData.allMachinesDisplay = angular.copy($scope.shiftData.allMachinesDisplayTemp);
        $scope.shiftData.endOfLineToggle = angular.copy($scope.shiftData.endOfLineToggleTemp);
        if ($sessionStorage.containersFilterState && !$sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID]){
          $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {}
        }
        if ($sessionStorage.containersFilterState && $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID] && !$sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter) {
          $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter = {};
        }
        $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.shiftMachineFilterOption = angular.copy($scope.shiftMachineFilterOption);
        $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinegroupsobj = angular.copy($scope.machinegroupsobj);
        $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machinelinesobj = angular.copy($scope.machinelinesobj);
        $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.tempMachinesDisplay = angular.copy($scope.shiftData.tempMachinesDisplay);
        $sessionStorage.containersFilterState[$sessionStorage.stateParams.subMenu.SubMenuExtID].filter.machineGroupsDisplay = angular.copy($scope.shiftData.tempMachinesGroupsDisplay);
        $sessionStorage.machinesDisplay = angular.copy($scope.shiftData.tempMachinesDisplay);
        //for the name of machine
        let machineFilteredCount;
        if ($scope.shiftData.hasShiftFilterTemp) {
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText  = ""
          machineFilteredCount = 0;
          for (let machineDisplay in $scope.shiftData.machinesDisplay) {
            if ($scope.shiftData.machinesDisplay[machineDisplay] == true) {
              machineFilteredCount++;
              if (machineFilteredCount < 2) {
                machineId = machineDisplay
            }
          }
        }
      }
      if(machineFilteredCount != undefined)
      {
        if (machineFilteredCount >= 2) {
          if(machineFilteredCount != Object.keys($scope.shiftData?.machinesDisplay).length)
          {
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText= "Multiple values";
          }
          else
          {
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText = ""
          }
        } else {
          let lonelyMachine = $scope.shiftData.Machines.find((machine) => Number(machine.machineID) === Number(machineId));
          $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText = lonelyMachine?.machineName
        }
      }
        
        $scope.shiftData.stickerText = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].stickerText
        $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].hasShiftFilter = $scope.shiftData.hasShiftFilterTemp
        $scope.shiftData.hasShiftFilter = $scope.shiftData.hasShiftFilterTemp;

        shiftService.displayUpdateDefferd.notify();

        $rootScope.$broadcast("updateMachineFilter", {});
      });
    };

    $scope.refreshFilterGroupBy=()=>{
      let groupByGroupKeys=Object.keys($scope.machinegroupsobj);
      let groupByLineKeys=Object.keys($scope.machinelinesobj);
      $scope.views.groupByGroup=groupByGroupKeys.length>1 || (groupByGroupKeys.length==1 && Number(groupByGroupKeys[0]) !==0) ;
      $scope.views.groupByLine=groupByLineKeys.length>1 || (groupByLineKeys.length==1 && Number(groupByLineKeys[0]) !==0);
      $scope.views.groupBy=$scope.views.groupByGroup || $scope.views.groupByLine;
      if($localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.shiftMachineFilterOption == "line" && $scope.views.groupByGroup && !$scope.views.groupByLine){
        $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.shiftMachineFilterOption = "group" 
        $scope.shiftMachineFilterOption = "group" 
      }
      if(!$scope.views.groupByGroup && !$scope.views.groupByLine){
        $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].machineFilter.shiftMachineFilterOption = "ungroup" 
        $scope.shiftMachineFilterOption='ungroup';
      }
      $timeout(()=>{
        $scope.init()
      })
    }

    $scope.refreshFilterGroupByWrapper=()=>{
      $timeout(()=>{
        if(!$scope.machinegroupsobj || !$scope.machinelinesobj){
          $scope.refreshFilterGroupByWrapper();
          return;
        }
        $scope.refreshFilterGroupBy();
      },3000);
    }

    $scope.refreshFilterGroupByWrapper();

    $scope.$watchGroup(
        ["machinegroupsobj", "machinelinesobj"],
        function (newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.refreshFilterGroupBy();
          }
        },
        true
    );

    $timeout(function () {
      window.dispatchEvent(new Event("resize"));
    });
  };

  return {
    restrict: "E",
    templateUrl: "js/components/shiftFilter/shiftFilter.html",
    link: function (scope) {
      scope.$on("$destroy", function () {
        $timeout(function () {
          window.dispatchEvent(new Event("resize"));
        });
      });
    },
    scope: {
      machinegroupsobj: "=",
      machinelinesobj: "=",
    },
    controller: controller,
    controllerAs: "shiftFilterCtrl",
  };
}

angular.module("LeaderMESfe").directive("shiftFilter", shiftFilter);
