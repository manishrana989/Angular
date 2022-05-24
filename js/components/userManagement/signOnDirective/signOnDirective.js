function signOnDirective() {

    var template = 'js/components/userManagement/signOnDirective/signOnDirective.html';

    var controller = function ($scope, LeaderMESservice, notify, toastr, $filter, SweetAlert, GLOBAL) {
        var signOnCtrl = this;
        signOnCtrl.rtl = LeaderMESservice.isLanguageRTL();
        signOnCtrl.key = GLOBAL.recaptcha;
        signOnCtrl.enableRecaptcha = GLOBAL.enableRecaptcha;
        signOnCtrl.localLanguage  = LeaderMESservice.showLocalLanguage();

        signOnCtrl.userId = LeaderMESservice.getUserID();
        signOnCtrl.positions = [];
        signOnCtrl.myRecaptchaResponse = null;
        LeaderMESservice.customAPI('GetUserPosition',{Lang: LeaderMESservice.getLanguage()}).then(function(response){
            signOnCtrl.positions = response.ResponseList || [];
        });

        signOnCtrl.userDetails = {
            ID : 0
        };

        signOnCtrl.saveForm = function(){
            if (signOnCtrl.signOnInProgress){
                return;
            }
            signOnCtrl.signOnInProgress = true;
            signOnCtrl.submitted = true;
            if (signOnCtrl.userDetails.Password == "" || !signOnCtrl.userDetails.Password){
                signOnCtrl.userDetails.Password = null;
            }
            if (signOnCtrl.reTypePassword == "" || !signOnCtrl.reTypePassword){
                signOnCtrl.reTypePassword = null;
            }
            if (signOnCtrl.userDetails.Password !== signOnCtrl.reTypePassword){
                return;
            }

            LeaderMESservice.customAPI('UpdateUserDetails',{baseUser : signOnCtrl.userDetails}).then(function(response){
                signOnCtrl.signOnInProgress = false;
                if (response.error != null){
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                toastr.clear();
                if (signOnCtrl.userId){
                    SweetAlert.swal({
                        title: $filter('translate')('EMAIL_SEND_FOR_VERIFACTION'),
                        text : '',
                        type: "success",
                        showCancelButton: false,
                        confirmButtonColor: "rgb(174, 222, 244)",
                        confirmButtonText: $filter('translate')("OK"),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                        animation: "false"
                    },
                    function () {
                        $scope.close(true);
                    });   
                }
                else{
                    SweetAlert.swal({
                        title: $filter('translate')('USER_SENT_FOR_APPROVAL'),
                        text : '',
                        type: "success",
                        showCancelButton: false,
                        confirmButtonColor: "rgb(174, 222, 244)",
                        confirmButtonText: $filter('translate')("OK"),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                        animation: "false"
                    },
                    function () {
                        $scope.close();
                    });    
                }
            });
        };
        if (signOnCtrl.userId){
            LeaderMESservice.customAPI('GetUserDetails',{UserID : signOnCtrl.userId}).then(function(response){
                signOnCtrl.userDetails  = response.BaseUser || {};
            });
        }

    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            close: '='
        },
        controller: controller,
        controllerAs: "signOnCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('signOnDirective', signOnDirective);