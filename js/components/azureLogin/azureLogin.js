function azureLogin() {
    var template = "js/components/azureLogin/azureLogin.html";
  
    var controller = function ($scope, configuration, LeaderMESservice, AuthService) {
        var azureLoginCtrl = this;
        configuration.getSection("login").then(function (data) {
            azureLoginCtrl.logoUrl = data.logoUrl;
        });
        azureLoginCtrl.login = function(){
            AuthService.getEncryptedPassword({
                token: azureLoginCtrl.password
            }).then(function(encrptResp){
                //LoginWithAzure
                AuthService.login('LoginWithAzure', {
                    "Lang":"eng",
                    "password":encrptResp.token,
                    "platform":"web",
                    "userName":azureLoginCtrl.username
                }).then(function(response){
                    if (response.error == null) {
                        $scope.close({
                            JGetUserSessionIDResult : {
                                session: response.session
                            }
                        })
                    } else {
                        azureLoginCtrl.errorMessage = response.error.ErrorDescription;
                        $scope.loginInProgress = false;
                    }
                });
            });
        }

    };
  
    return {
      restrict: "EA",
      templateUrl: template,
      scope: {
        close: "=",
      },
      controller: controller,
      controllerAs: "azureLoginCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("azureLogin", azureLogin);
  