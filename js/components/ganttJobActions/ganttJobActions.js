function ganttJobAction() {

    var controller = function ($scope, $state, LeaderMESservice, actionService, $modal) {
        var ganttJobActionCtrl = this;

        ganttJobActionCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        ganttJobActionCtrl.actions = [];
        const jobObject = LeaderMESservice.getTabsByAppName('Job');
        if (jobObject){
            const actionIDs = [10731, 10710, 10725, 10720];

            actionIDs.forEach(actionId => {
                const action = jobObject.Actions.find(action => (action.SubMenuAppPartID === actionId));
                if (action) {
                    const criteria = JSON.parse(action.ActionCriteria);
                    let enabled = true;
                    if (criteria && criteria.criteria) {
                        enabled = jsonLogic.apply(criteria.criteria.condition, $scope.jobData);
                    }
                    ganttJobActionCtrl.actions.push({
                        name : ganttJobActionCtrl.localLanguage ? action.SubMenuLName : action.SubMenuEName,
                        action,
                        enabled,
                    });
                }
            });
        }

        $scope.getName = (actionItem) => {
            if (ganttJobActionCtrl.localLanguage) {
                return actionItem.SubMenuLName;
              }
              return actionItem.SubMenuEName;
        };

        $scope.updateData = () => {
            $scope.reloadMachine($scope.machineId);
        };

        ganttJobActionCtrl.executeAction = function(action){
            $scope.content = {
                ID: $scope.id
            }
            action.updateData = $scope.updateData;
            actionService.openAction($scope,action);
        };

        ganttJobActionCtrl.openJob = function() {
            var url = $state.href('appObjectFullView', {
                appObjectName: 'Job',
                ID: $scope.id
            });
            url = url + "?firstTime=true";
            var myWindow = window.open(url, "LEADERMES_Job",'', true);
            myWindow.location.reload();
        };

        ganttJobActionCtrl.jobSettings = function(){
            $modal.open({
                resolve: {
                    ID: function () {
                        return $scope.id;
                    },
                    jobData: function () {
                        return $scope.jobData;
                    },
                    reloadMachine: function () {
                        return $scope.reloadMachine;
                    },
                    machineId: function () {
                        return $scope.machineId;
                    },
                },
                windowClass: 'CopyMachineSettings',
                template: '<div job-settings-action id="ID" close="close" name="name" job-data="jobData"></div>',
                controller: function ($scope, $modalInstance, ID, jobData, reloadMachine, machineId) {
                    $scope.ID = ID;
                    $scope.jobData = jobData;
                    $scope.close = function (success) {
                        $modalInstance.close();
                        if (success){
                            reloadMachine(machineId);
                        }
                    };
                },
            });
        };
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/ganttJobActions/ganttJobActions.html',
        scope: {
            id:'=',
            x:'=',
            y:'=',
            machineId:'=',
            reloadMachine: '=',
            jobData: '=',
        },
        controller: controller,
        controllerAs: 'ganttJobActionCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('ganttJobAction', ganttJobAction);