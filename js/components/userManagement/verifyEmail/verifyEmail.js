
const verifyEmail = function ($timeout, LeaderMESservice) {
    var template = "js/components/userManagement/verifyEmail/verifyEmail.html";
    var controller = function($scope,LeaderMESservice,$stateParams, toastr, notify, 
            $timeout, $state, $filter, configuration, COPYRIGHT, $translate){
        var verifyEmailCtrl = this;
        $translate.use('eng');
        verifyEmailCtrl.token = $stateParams.token;
        verifyEmailCtrl.email = $stateParams.email;

        if (!verifyEmailCtrl.token || !verifyEmailCtrl.email){
            $state.go('login');
            return;
        }
        $scope.copyRight = COPYRIGHT.YEAR;
        configuration.getSection("login").then(function (data) {
            $timeout(function(){
                verifyEmailCtrl.logoUrl = data.logoUrl;
            },100);
        });

        verifyEmailCtrl.rtl = LeaderMESservice.isLanguageRTL();
        
        verifyEmailCtrl.localLanguage  = LeaderMESservice.showLocalLanguage();

        verifyEmailCtrl.close = function(){
           $state.go('login');
        };

        verifyEmailCtrl.verify = function(){
            LeaderMESservice.customAPI('UserApproveEmail',{
                confirmationCode : verifyEmailCtrl.token,
                email : verifyEmailCtrl.email
            }).then(function(response){
                if (response.error != null){
                    verifyEmailCtrl.verified = false;
                    return;
                }
                verifyEmailCtrl.verified = true;
            });
        };
        verifyEmailCtrl.verify();
    }

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
        },
        controller:  controller,
        controllerAs : 'verifyEmailCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('verifyEmail', verifyEmail)