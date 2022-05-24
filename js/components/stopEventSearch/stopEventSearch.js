function stopEventSearch() {
    var controller = function ($scope,  $rootScope,LeaderMESservice, toastr, notify, $filter) {
      var stopEventSearchCtrl = this;
      stopEventSearchCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
      LeaderMESservice.customAPI('GetEventReasonAndGroupsV2',{
        machines: $scope.machineId,
        isActive: true,
      }).then((response) => {
        stopEventSearchCtrl.EventsAndGroups = response.EventsAndGroups;
      });

    //   LeaderMESservice.customAPI('GetEventReasonAndGroups',{
    //     MachineID: $scope.machineId,
    //   }).then((response) => {
    //     stopEventSearchCtrl.EventsAndGroups = response.EventsAndGroups;
    //   });

      $scope.refreshDataCallback = {};
      
      stopEventSearchCtrl.saveStopEvents = () => {
        LeaderMESservice.customAPI('ReportMultiStopEvents',{
          StopSubReasonID: stopEventSearchCtrl.selectedEvent,
          EventID: $scope.eventIds,
        }).then((response) => {
          if (response.error !== null) {
            //   $scope.emptyPage($scope.pageDisplay);
    
            notify({
              message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          } else {
            $rootScope.$emit('updateMachineDataFunction')
            //clear previous toastr to prevent multiple notifications
            toastr.clear();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
            $scope.close(true);
          }
        });
      };
    };
  
    return {
      restrict: "EA",
      templateUrl: "js/components/stopEventSearch/stopEventSearch.html",
      scope: {
          eventIds: '=',
          machineId: '=',
          close: '='
      },
      controller: controller,
      controllerAs: "stopEventSearchCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("stopEventSearch", stopEventSearch);
  