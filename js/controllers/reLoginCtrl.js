function reLoginCtrl($scope, LeaderMESservice, $translate, $state, AuthService, AUTH_EVENTS, BASE_URL,
                   $rootScope, SweetAlert, $sessionStorage, $localStorage, $stateParams, COGNOS, PRODUCTION_FLOOR, COPYRIGHT, configuration, $filter, notify, GLOBAL, $timeout,$window, Restangular) {


    var loginCtrl = this;
    loginCtrl.view = 'login';
    loginCtrl.credData = {

    }
    Restangular.setDefaultHeaders({});
    loginCtrl.setDefaultLang = true;
    $translate.use('eng');
    $scope.modalTitle = $filter('translate')('SESSION_EXPIRED');
    $scope.modalText = $filter('translate')('PLEASE_LOGIN_AGAIN');
    $scope.modalOkText= $filter('translate')("OK");

    $rootScope.showMainColor = false;
    window.name = '';
    if(!$scope.lastSession){
        $scope.lastSession=angular.copy($sessionStorage.userID);
    }

    console.log(`lastUserID:${$scope.lastSession}`);
    $scope.dataLoading = true;
    $scope.currentUser = null;
    $scope.credentials = {
        Username: '',
        EncryptedPassword: '',
        Lang: '',
        Platform: ''
    };
    loginCtrl.retries = 0;
    // $scope.loginInProgress = true;


    $scope.login = function () {
        if ($scope.loginInProgress) {
            return;
        }
        $scope.loginInProgress = true;
        var encryptedPass = AuthService.getEncryptedPassword({
            token: loginCtrl.credData.password
        });
        encryptedPass.then(function (resp) {
            var userCredentials = {
                "Username": loginCtrl.credData.username,
                "EncryptedPassword": resp.token,
                "Lang": $sessionStorage.language,
                "Platform": "web"
            };
            var userResponse = AuthService.reLogin(userCredentials);
            userResponse.then(function (response) {
                if (response) {
                    if (response.JGetUserSessionIDResult.error !== null) {
                        $scope.errorMessage = response.JGetUserSessionIDResult.error.ErrorDescription;
                        $scope.loginInProgress = false;
                        if (loginCtrl.retries > 3) {
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                            $scope.errorMessage = "Login Failed";
                            $scope.loginInProgress = false;
                            $scope.$dismiss();
                        }
                        loginCtrl.retries++;
                    }
                    else{
                        location.reload();
                    }
                } else {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    $scope.errorMessage = "Login Failed";
                    $scope.loginInProgress = false;
                    $scope.$dismiss();
                }
            });
        });
    };

}

angular
    .module('LeaderMESfe')
    .controller('reLoginCtrl', reLoginCtrl);