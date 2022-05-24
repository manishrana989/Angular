function calendarEvent() {
    var template = "js/components/calendarEvent/calendarEvent.html";
  
    var controller = function ($scope, LeaderMESservice, commonFunctions,$modal) {
        var calendarEventCtrl = this;
        commonFunctions.fieldChanges($scope);
        $scope.changes = [];
        $scope.recordValue = [];

        $scope.openEditRecEvent = function() {
          $modal.open({
            templateUrl: 'js/components/calendarEvent/editRecurringEvent.html',
            windowClass: "edit-recurring-event-update",
            controller: function ($scope, $modalInstance) {
                $scope.editRecEventValue = 1;
                $scope.close = function () {
                    $modalInstance.close($scope.editRecEventValue);
                };
            },
          }).result.then(function (value) {
            if (value !== undefined){
              var actionId = _.find($scope.changes,{FieldName: "ActionID"});
              if (actionId) {
                actionId.Eq = value;
              }
              else{
                $scope.changes.push({
                  DataType: "num",
                  Eq: value,
                  FieldName: "ActionID"
                });
              }
              $scope.saveForm();
            }
          });
        };
 
        $scope.emptyPage = function() {
          if ($scope.callback) {
            $scope.callback();
            return;
          }
          $scope.recordValue = null;
          $scope.changes = [];
          $scope.init();
        };

        $scope.formCallBack = function (data) {
          var freqField = _.find(data,{FieldName : "CopyIntervalID"});
          if (freqField.Eq !== null) {
            $scope.openEditRecEvent();
          }
        };
        $scope.actionName = "SAVE_CHANGES";

        $scope.init = function() {
          var request = {
              LeaderID : $scope.eventId,
              formID : $scope.formId || 101281
          };
          var requestResponse = {
            LeaderID : $scope.eventId,
            formID : $scope.formId || 101281
          };
          $scope.formId =  $scope.formId || 101281;
          $scope.leaderId = $scope.eventId;
          $scope.pairs = [];
          $scope.actionName = "SAVE_CHANGES";
          $scope.request = request;
          $scope.SkipSaveOperation = false;
          $scope.api = 'DisplayFormResults'
          $scope.fullSize = false;
          $scope.loading = false;
          // commonFunctions.formResults($scope, request, requestResponse,'DisplayFormResults',$scope.pairs || [] , false);
        };
        $scope.init();
    };
  
    return {
      restrict: "EA",
      templateUrl: template,
      scope: {
        close: "=",
        eventId: "=",
        pairs: "=",
        formId: "=",
        callback: "="
      },
      controller: controller,
      controllerAs: "calendarEventCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("calendarEvent", calendarEvent);
  