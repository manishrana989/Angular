
const splitEventRetro = function ($timeout, LeaderMESservice) {
    var template = "js/components/splitEventRetro/splitEventRetro.html";
    var controller = function($scope,LeaderMESservice, toastr, notify, $filter,toastr, AuthService){
        var splitEventRetroCtrl = this;
        var userDateFormat = AuthService.getUserDateFormat();
        splitEventRetroCtrl.rtl = LeaderMESservice.isLanguageRTL();
        splitEventRetroCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        splitEventRetroCtrl.splitTime = null;
        splitEventRetroCtrl.startTime = $scope.eventData.startTime.format(userDateFormat);
        splitEventRetroCtrl.endTime = $scope.eventData.endTime.format(userDateFormat);

        splitEventRetroCtrl.updateSplitTime = ($event) => {
            if (!splitEventRetroCtrl.splitTime && $event.target.value) {
                splitEventRetroCtrl.splitTime = moment($event.target.value,"DD-MM-YYYY HH:mm:ss");
            }
        };

        splitEventRetroCtrl.splitEventTime = function(){
            if (splitEventRetroCtrl.loading){
                return;
            }
            const splitTime = typeof(splitEventRetroCtrl.splitTime) === 'string' 
                ? 
                    moment(new Date(splitEventRetroCtrl.splitTime))
                :
                    splitEventRetroCtrl.splitTime;
            if (splitTime.diff($scope.eventData.startTime) < 0 || splitTime.diff($scope.eventData.endTime) > 0){
                notify({
                    message: $filter('translate')('SPLIT_TIME_MUST_BE_BETWEEN_START_END_TIME'),
                    classes: 'alert-danger',
                    templateUrl: 'views/common/notify.html'
                });
                return;
            }
            splitEventRetroCtrl.loading = true;
            
            LeaderMESservice.customAPI('SplitStopEvent',
            {
                EventID : $scope.eventData.id,
                SplitTimestamp : splitTime.format('YYYY-MM-DD HH:mm:ss'),
            }).then(function(response){
                splitEventRetroCtrl.loading = false;
                if (response.error !== null) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                $scope.close(true);
                toastr.clear();
                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
            });
        };
    }

    return {
        restrict: "EA",
        scope: {
            eventData: '=',
            close : "="
        },
        controller:  controller,
        templateUrl: template,
        controllerAs : 'splitEventRetroCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('splitEventRetro', splitEventRetro)