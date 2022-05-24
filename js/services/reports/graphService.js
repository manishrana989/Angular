angular.module('LeaderMESfe').factory('graphService', function ($modal) {


    function graphCode(requestAPI,requestBody,content) {
        var modalInstance = $modal.open({
            template: '<div class="tree-modal-container" style="border: 1px solid black"><div ng-click="closeThis()" style="z-index: 200;cursor: pointer;padding: 10px" class="pull-right""><i class="fa fa-close"></i></div><tree-graph-directive requestapi="requestAPI" requestbody="requestBody" content="content"></tree-graph-directive></div>',
            controller: function ($scope, $modalInstance) {
            $scope.closeThis = function () {
                $modalInstance.close();
            }

            $scope.requestAPI = requestAPI;
            $scope.requestBody = requestBody;
            $scope.content = content
            // $scope.content = {
            //     ID : parseInt($stateParams.ID),
            //     linkItem : $stateParams.linkitem
            // }
            $scope.ok = function () {
                $modalInstance.close();
            };
        }
    })
      }

    return {
        graphCode: graphCode
    }
});