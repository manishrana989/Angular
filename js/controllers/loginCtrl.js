function LoginCtrl($scope, LeaderMESservice, $translate, $state, AuthService, AUTH_EVENTS, BASE_URL,
    $rootScope, SweetAlert, $sessionStorage, COGNOS, PRODUCTION_FLOOR, COPYRIGHT, configuration, 
    $filter, notify, GLOBAL, $timeout, $modal, intercomService) {
    var loginCtrl = this;
    // loginCtrl.view = 'login';
    loginCtrl.credData = {

    }

    intercomService.load();
    $rootScope.$broadcast('userLogout','');
    loginCtrl.setDefaultLang = true;
    // $translate.use('eng');
    $sessionStorage.azureUser = null;
    $rootScope.showMainColor = false;
    window.name = '';
    AuthService.clearSession();
    $scope.dataLoading = true;
    $scope.currentUser = null;
    $scope.credentials = {
        Username: '',
        EncryptedPassword: '',
        Lang: '',
        Platform: ''
    };
    loginCtrl.key = GLOBAL.recaptcha;
    loginCtrl.enableRecaptcha = GLOBAL.enableRecaptcha;
    $rootScope.rtl = "";
    $scope.copyRight = COPYRIGHT.YEAR;
    loginCtrl.retries = 0;
    // $scope.loginInProgress = true;

    configuration.getSection("login").then(function (data) {
        loginCtrl.logoUrl = data.logoUrl;
        loginCtrl.bigImageUrl = data.bigImageUrl;
        loginCtrl.defaultHomePage = data.defaultHomePage;
    });

    loginCtrl.adminEmailExist = false;

    LeaderMESservice.customGetAPI('checkAdministratorEmail').then(function (response) {
        loginCtrl.adminEmailExist = response.FunctionSucceed;
    });

    loginCtrl.loginInWithAzure = false;

    LeaderMESservice.customAPI('init', {
    }).then(function (response) {
        loginCtrl.view = 'login';

        if (response.ResponseDictionaryValues) {
            const onlineRefreshTime = _.find(response.ResponseDictionaryValues, {Key: "OnlineRefreshTime"});
            if (onlineRefreshTime && onlineRefreshTime.Value) {
                try {
                    $sessionStorage.onlineRefreshTime = parseInt(onlineRefreshTime.Value) || PRODUCTION_FLOOR.REFRESH_TIME;
                }
                catch(err) {
                    console.error(err);
                    $sessionStorage.onlineRefreshTime = PRODUCTION_FLOOR.REFRESH_TIME;
                }
            }

            const exportCSVDelimiter = _.find(response.ResponseDictionaryValues, {Key: "ExportCSVDelimiter"});
            if (exportCSVDelimiter && exportCSVDelimiter.Value) {
                try {
                    $sessionStorage.exportCSVDelimiter = exportCSVDelimiter.Value || ',';
                }
                catch(err) {
                    console.error(err);
                    $sessionStorage.exportCSVDelimiter = ',';
                }
            }
            loginCtrl.loginInWithAzure = _.findIndex(response.ResponseDictionaryValues, {Key: "DisplayLoginWithAzure", Value: "true"}) >= 0;
            loginCtrl.azureRequestsInterval = _.find(response.ResponseDictionaryValues, {Key: "WebCheckAzureUserInterval"});
            if (loginCtrl.azureRequestsInterval && loginCtrl.azureRequestsInterval.Value) {
                $sessionStorage.azureRequestsInterval = loginCtrl.azureRequestsInterval.Value;
            }
            var azureClient = _.find(response.ResponseDictionaryValues, {Key: "AzureClientID"});
            if (azureClient && azureClient.Value) {
                loginCtrl.azureClientId =  azureClient.Value;
            }
            else{
                loginCtrl.loginInWithAzure = false;
            }
        }
    },function(err){
        loginCtrl.view = 'login';
    });

    loginCtrl.resetPassword = function () {
        if ($scope.resetPasswordInProgress) {
            return;
        }
        $scope.resetPasswordInProgress = true;
        LeaderMESservice.customAPI('SendResetPassword', {
            userEmail: loginCtrl.emailToReset
        }).then(function (response) {
            $scope.resetPasswordInProgress = false;
            if (response.error !== null) {
                notify({
                    message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                    classes: 'alert-danger',
                    templateUrl: 'views/common/notify.html'
                });
                return;
            }

            SweetAlert.swal({
                    title: $filter('translate')('RESET_PASSWORD_SENT_SUCCESSFULLY'),
                    text: '',
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: "rgb(174, 222, 244)",
                    confirmButtonText: $filter('translate')("OK"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false"
                },
                function () {
                    loginCtrl.view = 'login';
                });
        });
    };

    $scope.topMenuBySubMenuId = function (mainMenu, SubMenuAppPartID) {
        for (var i = 0; i < mainMenu.length; i++) {
            var foundSubMenu = _.find(mainMenu[i].subMenu, {
                SubMenuAppPartID: SubMenuAppPartID
            });
            if (foundSubMenu) {
                return {
                    topMenu: mainMenu[i],
                    subMenu: foundSubMenu
                };
            }
        }
        return null;
    }

    //$sessionStorage.ValidatedEmail
    $scope.successfullLogin = function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        LeaderMESservice.setMainMenu(function (mainMenu) {
            LeaderMESservice.getProductionProgressColorDefinition();
            var sortedSubMenus = [11215, 300, 30000, 1500];
            var rtl = LeaderMESservice.isLanguageRTL();
            $scope.loginInProgress = false;
            var dynamicSort = function (property) {
                var sortOrder = 1;

                if (property[0] === "-") {
                    sortOrder = -1;
                    property = property.substr(1);
                }

                return function (a, b) {
                    if (sortOrder == -1) {
                        return b[property].localeCompare(a[property]);
                    } else {
                        return a[property].localeCompare(b[property]);
                    }
                }
            }

            // for (var i = 0; i < mainMenu.length; i++) {
            //     if (sortedSubMenus.indexOf(mainMenu[i].TopMenuAppPartID) > -1) {
            //         if (rtl) {
            //             mainMenu[i].subMenu.sort(dynamicSort("SubMenuLName"))
            //         } else {
            //             mainMenu[i].subMenu.sort(dynamicSort("SubMenuEName"))
            //         }
            //     }
            // }

            var allMachines = {
                ActionCriteria: "",
                ActionIcon: "",
                ActionOpenInNewTab: true,
                LeaderIDTargetParameter: "",
                PreActionFunction: "",
                PreActionParameters: "",
                SkipSaveOperation: false,
                SubMenuAccessLevel: 15,
                SubMenuAppPartID: -1,
                SubMenuDisplayOrder: 0,
                SubMenuEName: $filter('translate')("ALL_MACHINES"),
                SubMenuEnableOnNew: false,
                SubMenuExtID: 0,
                SubMenuFileObjectRelation: null,
                SubMenuHasImageFile: false,
                SubMenuIsHomePage: false,
                SubMenuLName: $filter('translate')("ALL_MACHINES"),
                SubMenuMenuType: "submenu",
                SubMenuNewObjectLinkID: 0,
                SubMenuObjectInformation: null,
                SubMenuObjectInformationLink: 0,
                SubMenuObjectKey: "",
                SubMenuObjectPrintLevel: null,
                SubMenuTargetParameters: "DepartmentID=[SubMenuExtID]",
                SubMenuTargetTYpe: "custom:GetMachineCubeData",
                fullView: "customFullView",
                state: "index.custom",
                allMachines: true
            }
            var targets = {
                ActionCriteria: "",
                ActionIcon: "",
                ActionOpenInNewTab: true,
                LeaderIDTargetParameter: "",
                PreActionFunction: "",
                PreActionParameters: "",
                SkipSaveOperation: false,
                SubMenuAccessLevel: 15,
                SubMenuAppPartID: -2,
                SubMenuDisplayOrder: 0,
                SubMenuEName: $filter('translate')("FACTORY_VIEW_TARGETS"),
                SubMenuEnableOnNew: false,
                SubMenuExtID: 0,
                SubMenuFileObjectRelation: null,
                SubMenuHasImageFile: false,
                SubMenuIsHomePage: false,
                SubMenuLName: $filter('translate')("FACTORY_VIEW_TARGETS"),
                SubMenuMenuType: "submenu",
                SubMenuNewObjectLinkID: 0,
                SubMenuObjectInformation: null,
                SubMenuObjectInformationLink: 0,
                SubMenuObjectKey: "",
                SubMenuObjectPrintLevel: null,
                SubMenuTargetParameters: "DepartmentID=[SubMenuExtID]",
                SubMenuTargetTYpe: "custom:GetMachineCubeData",
                fullView: "customFullView",
                state: "index.custom",
                targets: true
            }
            var productionFloorMenu = _.find(mainMenu, {
                TopMenuAppPartID: 500
            });
            if (productionFloorMenu) {
                productionFloorMenu.subMenu.splice(1, 0, targets);
                productionFloorMenu.subMenu.splice(2, 0, allMachines);
            }

            // if ($scope.response.JGetUserSessionIDResult.session[0].PopUpReportID != 0 && $scope.response.JGetUserSessionIDResult.session[0].ShowPopUp == true) {
            //     for (var i = 0; i < mainMenu.length; i++) {
            //         for (var j = 0; j < mainMenu[i].subMenu.length; j++) {
            //             if (mainMenu[i].subMenu[j].SubMenuExtID == $scope.response.JGetUserSessionIDResult.session[0].PopUpReportID) {
            //                 mainMenu[i].subMenu[j].ShowPopUp = true;
            //                 $state.go('index.report', {
            //                     menuContent: {
            //                         subMenu: mainMenu[i].subMenu[j],
            //                         topMenu: mainMenu[i]
            //                     }
            //                 });
            //                 return;
            //             }
            //         }
            //     }
            // }
            if (COGNOS.enable == true) {
                $scope.enableCognos = true;
                $scope.cognosUrl = COGNOS.url;
                $('#cookieIframe').attr("src", BASE_URL.url + "GetKeyForCognos/" + AuthService.getAccessToken());
            }
            var homePage = loginCtrl.defaultHomePage || 540;
            if ($scope.response && 
                $scope.response.JGetUserSessionIDResult && 
                $scope.response.JGetUserSessionIDResult.session && 
                $scope.response.JGetUserSessionIDResult.session.length > 0 && 
                $scope.response.JGetUserSessionIDResult.session[0].HomePageSubObject !== ''){
                if ($sessionStorage.produtionFloorTab){
                    $sessionStorage.produtionFloorTab.selectedTab = $scope.response.JGetUserSessionIDResult.session[0].HomePageSubObject;
                } 
            }
            if ($scope.response.JGetUserSessionIDResult.session[0].HomePage !== undefined &&
                $scope.response.JGetUserSessionIDResult.session[0].HomePage !== null) {
                homePage = $scope.response.JGetUserSessionIDResult.session[0].HomePage || 540;
                var homePageMenu = $scope.topMenuBySubMenuId(mainMenu, homePage);
                if (homePageMenu) {
                    $state.go(homePageMenu.subMenu.state, {
                        menuContent: {
                            subMenu: homePageMenu.subMenu,
                            topMenu: homePageMenu.topMenu
                        }
                });
                    return;
                }
                homePage = loginCtrl.defaultHomePage || 540;
            }
            // LeaderMESservice.customAPI('SaveUserHomePage', {
            //     HomePage: homePage
            // });
            var homePageMenu = $scope.topMenuBySubMenuId(mainMenu, homePage);
            if (homePageMenu) {
                $state.go(homePageMenu.subMenu.state, {
                    menuContent: {
                        subMenu: homePageMenu.subMenu,
                        topMenu: homePageMenu.topMenu
                    }
                });
                return;
            }
            $sessionStorage.productionFloor = null;
            if (PRODUCTION_FLOOR.FIRST_PAGE == true) {
                var departmentId = PRODUCTION_FLOOR.FIRST_DEPARTMENT ? 1 : 0;
                for (var i = 0; i < mainMenu.length; i++) {
                    for (var j = 0; j < mainMenu[i].subMenu.length; j++) {

                        if (mainMenu[i].subMenu[j].SubMenuExtID == departmentId && mainMenu[i].subMenu[j].SubMenuTargetTYpe == 'custom:GetMachineCubeData') {
                            $sessionStorage.productionFloor = {
                                subMenu: mainMenu[i].subMenu[j],
                                topMenu: mainMenu[i]
                            }
                            $state.go('index.custom', {
                                menuContent: {
                                    subMenu: mainMenu[i].subMenu[j],
                                    topMenu: mainMenu[i]
                                }
                            });
                            return;
                        }
                    }
                }
            }

            $state.go('index.main');
        });
    }

    $scope.login = function () {
        if ($scope.loginInProgress) {
            return;
        }
        $scope.loginInProgress = true;
        loginCtrl.myRecaptchaResponse = null;
        var encryptedPass = AuthService.getEncryptedPassword({
            token: loginCtrl.credData.password
        });
        encryptedPass.then(function (resp) {
            var userCredentials = {
                "Username": loginCtrl.credData.username,
                "EncryptedPassword": resp.token,
                "Lang": $scope.language.ShortName,
                "Platform": "web"
            };
            var userResponse = AuthService.login('JGetUserSessionID', userCredentials);
            userResponse.then(function (response) {
                if (response) {
                    if (response.JGetUserSessionIDResult.error == null) {
                        //TODO date picker locale
                        moment.locale($scope.language.DatePickLng);
                        if (loginCtrl.setDefaultLang == true) {
                            LeaderMESservice.setLanguage($scope.language, true);
                        } else {
                            LeaderMESservice.setLanguage($scope.language, false);
                        }
                        $scope.response = response;
                        if ($sessionStorage.HasEmail && $sessionStorage.ValidatedEmail) {
                            $scope.successfullLogin();
                        } else {
                            loginCtrl.view = 'signUp';
                            $scope.loginInProgress = false;
                            loginCtrl.retries++;
                        }
                    } else {
                        $scope.errorMessage = response.JGetUserSessionIDResult.error.ErrorDescription;
                        $scope.loginInProgress = false;
                        loginCtrl.retries++;
                    }
                } else {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    $scope.errorMessage = "Login Failed";
                    $scope.loginInProgress = false;
                }
            });
        });
    };

     getDefaultLang = function () {
        var defaultLang = LeaderMESservice.getDefaultLanguage();
        if (defaultLang) {
            $translate.use(defaultLang.ShortName);
            return defaultLang;
        } else {
            for (var i = 0; i < $scope.langList.length; i++) {
                if ($scope.langList[i].ShortName == 'eng') {
                    $translate.use($scope.langList[i].ShortName);
                    return $scope.langList[i];
                }
            }
        }
        $translate.use($scope.langList[0].ShotName);
        $timeout(function(){
            $translate.refresh();
        },1500);
        return $scope.langList[0];
    };
    $scope.getDefaultLang = getDefaultLang;

    var languages = LeaderMESservice.getAllLanguages();
    languages.then(function (resp) {
        $scope.langList = resp.LangList;
        // sort languages ABC...
        $scope.langList.sort(function(a,b){
            if(a.SystemLng < b.SystemLng) { 
                return -1;
             }
            if(a.SystemLng > b.SystemLng) {
                 return 1; 
                }
            return 0;
        })
        var defaultLang = getDefaultLang();
        $scope.language = _.find($scope.langList, {
            ShortName: defaultLang.ShortName
        });
        $scope.rtl = $scope.language.LngRtl;
        $sessionStorage.rtl = $scope.rtl;
    }, function (error) {
        SweetAlert.swal({
            title: "Failed to get Languages",
            text: "Please check server connection"
        });
    });

    loginCtrl.languageChange = function () {
        LeaderMESservice.setLanguage($scope.language);
        $scope.rtl = $scope.language.LngRtl;
    }

    loginCtrl.close = function () {
        if (loginCtrl.view == 'signUp' && $sessionStorage.userID) {
            $sessionStorage.HasEmail = true;
            $sessionStorage.ValidatedEmail = true;
            $scope.successfullLogin();
        }
        loginCtrl.view = 'login';
    }

    loginCtrl.openAzurePopup = function(){
        window.config = {
            clientId: loginCtrl.azureClientId
        };
        var authContext = new AuthenticationContext(config);
        if (authContext && authContext.config) {
            if (authContext.config.postLogoutRedirectUri) {
                authContext.config.postLogoutRedirectUri = authContext.config.postLogoutRedirectUri.toLowerCase();
            }
            if (authContext.config.redirectUri) {
                authContext.config.redirectUri = authContext.config.redirectUri.toLowerCase();
            }
        }
        authContext.clearCache();
        authContext.clearCacheForResource(loginCtrl.azureClientId)
        authContext.popUp = true;
        authContext.callback = function(a,id_token,c){
            var user = authContext.getCachedUser();
            if (user) {
                if (id_token) {
                    $sessionStorage.azureUser = user && user.profile && user.profile.oid;
                    AuthService.login('LoginWithAzureWeb', {
                        "token":id_token,
                        "Lang": $scope.language.ShortName,
                        "platform":"web",
                        "userName": user.userName
                    }).then(function(response){
                        if (response.error == null) {
                            $rootScope.$broadcast('azureUserLogIn',true);
                            var data = {
                                JGetUserSessionIDResult : {
                                    session: response.session
                                }
                            };
                            $scope.loginInProgress = true;
                            if (loginCtrl.setDefaultLang == true) {
                                LeaderMESservice.setLanguage($scope.language, true);
                            } else {
                                LeaderMESservice.setLanguage($scope.language, false);
                            }
                            $scope.response = data;
                            if ($sessionStorage.HasEmail && $sessionStorage.ValidatedEmail) {
                                $scope.successfullLogin();
                            } else {
                                loginCtrl.view = 'signUp';
                                $scope.loginInProgress = false;
                                loginCtrl.retries++;
                            }
                        } else {
                            $scope.errorMessage = response.error.ErrorDescription;
                            $scope.loginInProgress = false;
                        }
                    });
                }
                else {

                }
            }
            else {
                
            }
        };
        authContext.login();
    }
}

angular
    .module('LeaderMESfe')
    .controller('LoginCtrl', LoginCtrl);