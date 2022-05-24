
const approveEmail = function ($timeout, LeaderMESservice) {
    var template = "js/components/userManagement/approveEmail/approveEmail.html";
    var controller = function($scope,LeaderMESservice,$stateParams, SweetAlert, notify, $timeout, $state, $filter){
        var approveEmailCtrl = this;

        approveEmailCtrl.token = $stateParams.token;
        approveEmailCtrl.email = $stateParams.email;

        if (!approveEmailCtrl.token || !approveEmailCtrl.email){
            $state.go('login');
            return;
        }

        approveEmailCtrl.rtl = LeaderMESservice.isLanguageRTL();
        
        approveEmailCtrl.localLanguage  = LeaderMESservice.showLocalLanguage();

        approveEmailCtrl.close = function(){
            $state.go('login');
        };

        approveEmailCtrl.openApproveMessage = function(){
            $timeout(function(){
                SweetAlert.swal({
                    title: $filter('translate')('ACCOUNT_CREATION_REQUEST'),
                    text: approveEmailCtrl.email + $filter('translate')('WAITING_FOR_APPROVAL_TO_ESTABLISH'),
                    type: "success",
                    showCancelButton: true,
                    confirmButtonColor: "green",
                    confirmButtonText: $filter('translate')("APPROVE"),
                    cancelButtonText:  $filter('translate')("REJECT"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass :  (approveEmailCtrl.rtl ? " swalRTL" : "")
                },
                function (isConfirm) {
                    if (isConfirm) {
                        LeaderMESservice.customAPI('AuthorizeUser',{
                            confirmationCode : approveEmailCtrl.token
                        }).then(function(response){
                            if (response.error != null){
                                notify({
                                    message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html'
                                });
                                approveEmailCtrl.openApproveMessage();
                                return;
                            }
                            approveEmailCtrl.close();
                        });
                    }
                    else{
                        LeaderMESservice.customAPI('SendApproveDenyEmailToUser',{
                            userEmail : approveEmailCtrl.email,
                            status : "deny"
                        }).then(function(response){
                            if (response.error != null){
                                notify({
                                    message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                                    classes: 'alert-danger',
                                    templateUrl: 'views/common/notify.html'
                                });
                                approveEmailCtrl.openApproveMessage();
                                return;
                            }
                            approveEmailCtrl.close();
                        });
                    }
                });
            },300);
        };
        approveEmailCtrl.openApproveMessage();

    }

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
        },
        controller:  controller,
        controllerAs : 'approveEmailCtrl'
    };
}

angular.module('LeaderMESfe')
    .directive('approveEmail', approveEmail)