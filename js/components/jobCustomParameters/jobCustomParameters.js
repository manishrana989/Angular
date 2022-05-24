function jobCustomParameters() {
  const template = "js/components/jobCustomParameters/jobCustomParameters.html";

  const controller = function ($scope, LeaderMESservice, $timeout, toastr, $filter) {
    const jobCustomParametersCtrl = this;
    $scope.changed = false;
    
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    function GetJobCustomParameters(){
      LeaderMESservice.customAPI("GetJobCustomParameters", {
        JobID: $scope.content.ID,
      }).then(function (res) {
        $scope.data = res.JobParams;
        _.forEach($scope.data,function(detail){
          if(detail.DisplayType == 2) {
            $scope.initSelectValue(detail)
          }
        })
      });
    }
    
    GetJobCustomParameters()

    $scope.getSelectValue = function (detialTemp) {
      detialTemp.ParamID = _.find(detialTemp.JobListParams, { ID: detialTemp?.ParamID })?.ID;
      detialTemp.ParamValue = _.find(detialTemp.JobListParams, { ID: detialTemp?.ParamID })?.Value;
    };

    $scope.initSelectValue = function (detialTemp) {
      detialTemp.ParamID = _.find(detialTemp.JobListParams, { Value: detialTemp?.ParamValue })?.ID;
    };

    $scope.jobCustomChanged = function () {
      $scope.changed = true;
    };

    $scope.saveJobParams = function () {
      if(!$scope.changed) return;

      $scope.changed = false
      LeaderMESservice.customAPI("SaveJobCustomParameters", {
        Params: _.map($scope.data, function (param) {
          if (param.DisplayType == 1) {
            return {
              ID: param.ParamValueRecordID,
              JobID: $scope.content.ID,
              Value: param.ParamValue,
              ParamID: param.ID,
            };
          } else {
            return {
              ID: param.ParamValueRecordID,
              JobID: $scope.content.ID,
              Value: param.ParamValue,
              ParamID: param.ID,
              ListItemID: param.ParamID,
            };
          }
        }),
      }).then(function (res) {
        toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
        
        
        GetJobCustomParameters()
    
      });
    };
  };

  return {
    restrict: "EA",
    templateUrl: template,
    scope: {
      content: "=",
    },
    controller: controller,
    controllerAs: "jobCustomParametersCtrl",
  };
}

angular.module("LeaderMESfe").directive("jobCustomParameters", jobCustomParameters);
