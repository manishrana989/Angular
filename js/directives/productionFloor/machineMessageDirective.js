function machineMessageDirective() {

    var template = 'views/custom/productionFloor/common/machineMessageDirective.html';

    var controller = function ($scope, $modal,$filter, notify, googleAnalyticsService, LeaderMESservice) {
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.openMessagesModal = function ( machineData, parent) {
            var updateOnSendMessage = $scope.update;
            googleAnalyticsService.gaEvent($scope.parent, 'Machine_cube_message_history');
            $modal.open({
                templateUrl: 'views/common/messagesModal.html',
                windowClass: "messagesModal",
                controller: function ($scope, $modalInstance, LeaderMESservice, googleAnalyticsService) {
                    $scope.machineData = machineData;
                    $scope.data ={
                        newMessage: ''
                    };

                    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                    
                    LeaderMESservice.customAPI("GetTopNotifications", {"NumberOfNotificationToDisplay" : 5}).then(function (response) {
                        $scope.topFiveMessages = _.map(response.notification,'Text');
                    });
        
                    $scope.getNotifications = function () {
                        LeaderMESservice.customAPI('GetNotificationHistory', {
                            sourceMachineID: $scope.machineData.MachineID
                        }).then(function (response) {
                            $scope.data["messages"] = response.notification;
                        });
                    };
                    $scope.getNotifications();

                    $scope.sendMessage = function () {
                        if ($scope.data.newMessage ==='' || $scope.data.newMessage === undefined || $scope.data.newMessage === null) {
                            $scope.errorMessage=$filter('translate')('ERROR_MESSAGE_REQUIRED');
                            return;
                        }                   
                        $scope.errorMessage='';
                        googleAnalyticsService.gaEvent(parent, 'Machine_cube_send_message');
                        LeaderMESservice.customAPI('SendNotificationToOpApp', {
                            title: '',
                            Text: $scope.data.newMessage,
                            sourceMachineID: machineData.MachineID
                        }).then(function (response) {
                            if(response && response.error && response.error.ErrorDescription){
                                $scope.errorMessage=response.error.ErrorDescription;
                                notify({
                                    message: response.error.ErrorDescription,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html'
                                });
                            }
                            $scope.getNotifications();
                            $scope.data.newMessage = '';                        
                            updateOnSendMessage();
                        }, function (error) {                          
                            if(error){
                                $scope.errorMessage=$filter('translate')('ERROR_MESSAGE');
                                notify({
                                    message: "Message hasn't sent",
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html'
                                });

                            }
                        });
                    };

                    $scope.close = function () {
                        $modalInstance.close();
                    };
                },
            }).result.then(function () {
            });
        }

    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            machineData: '=',
            update: '=',
            lastMessage: '=',
            parent: '@'
        },
        controller: controller,
        controllerAs: "machineMessageDirectiveCtrl"
    };
}


angular
    .module('LeaderMESfe')
    .directive('machineMessageDirective',machineMessageDirective);