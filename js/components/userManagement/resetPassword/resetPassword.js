
const resetPassword = function ($timeout, LeaderMESservice) {
    var template = "js/components/userManagement/resetPassword/resetPassword.html";
    var controller = function($scope,LeaderMESservice,$stateParams, toastr, notify, $timeout, $state, $filter, configuration, COPYRIGHT){
        var resetPasswordCtrl = this;
        resetPasswordCtrl.token = $stateParams.token;

        if (!resetPasswordCtrl.token){
            $state.go('login');
            return;
        }

        resetPasswordCtrl.rtl = LeaderMESservice.isLanguageRTL();
        
        resetPasswordCtrl.localLanguage  = LeaderMESservice.showLocalLanguage();
        $scope.copyRight = COPYRIGHT.YEAR;
        configuration.getSection("login").then(function (data) {
            $timeout(function(){
                resetPasswordCtrl.logoUrl = data.logoUrl;
            },100);
        });

        resetPasswordCtrl.close = function(){
            $state.go('login');
        };

        resetPasswordCtrl.resetPassword = function(){
            resetPasswordCtrl.submitted = true;
            if (resetPasswordCtrl.password !== resetPasswordCtrl.reTypePassword){
                return;
            }
            LeaderMESservice.customAPI('ResetPassword',{
                confirmationCode : resetPasswordCtrl.token,
                newPassword : resetPasswordCtrl.password
            }).then(function(response){
                if (response.error != null){
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                toastr.clear();
                toastr.success($filter('translate')("RESET_PASSWORD_UPDATED_SUCCESSFULLY"));
                $timeout(function(){
                    resetPasswordCtrl.close();
                },1500);
            });
        }
    }

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
        },
        controller:  controller,
        controllerAs : 'resetPasswordCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('resetPassword', resetPassword)