
function config($stateProvider, $locationProvider, $urlRouterProvider, $ocLazyLoadProvider, 
    RestangularProvider, $translateProvider, USER_ROLES,toastrConfig,BASE_URL,COGNOS,GOOGLE_ANALYTICS) {

    $urlRouterProvider.otherwise(function ($injector,$sessionStorage) {
        var $state = $injector.get("$state")
        $state.go("index.main");
    });

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false,
        'modules': [
            {
                name : 'ui.grid',
                files: [
                    'js/plugins/ui-grid/excel-builder.dist.js',
                    'js/plugins/ui-grid/ui-grid-4.0.11.js',
                    'bower_components/ui-grid-draggable-rows/js/draggable-rows.js',
                ]
            },
            { name : 'ui.grid.selection', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.exporter', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.edit', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.moveColumns', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.resizeColumns', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.saveState', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.draggable-rows', files: ['bower_components/ui-grid-draggable-rows/js/draggable-rows.js'] },
            { name : 'ui.grid.pinning', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] },
            { name : 'ui.grid.autoResize', files: ['js/plugins/ui-grid/ui-grid-4.0.11.js'] }
    ]
    });
    // {
    //     serie: true,
    //     name : [
    //         'ui.grid',
    //         'ui.grid.selection',
    //         'ui.grid.exporter',
    //         'ui.grid.edit',
    //         'ui.grid.moveColumns',
    //         'ui.grid.resizeColumns',
    //         'ui.grid.saveState',
    //         'ui.grid.draggable-rows',
    //         'ui.grid.pinning',
    //         'ui.grid.autoResize',
    //     ],
    //     files :[
    //         'js/plugins/ui-grid/jszip.min.js',
    //         'js/plugins/ui-grid/excel-builder.dist.js',
    //         'js/plugins/ui-grid/ui-grid-4.0.11.js',
    //         'bower_components/ui-grid-draggable-rows/js/draggable-rows.js',
    //     ]
    // },

    $stateProvider

        .state('approveEmail', {
            url: "/approveEmail/:token/:email",
            template: "<approve-email></approve-email>",
            resolve : {
                loadPlugin : function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ])
                }
            },
            data: {
                pageTitle: 'Login', specialClass: 'gray-bg',
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .state('verifyEmail', {
            url: "/verifyEmail/:token/:email",
            template: "<verify-email></verify-email>",
            resolve : {
                loadPlugin : function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ])
                }
            },
            data: {
                pageTitle: 'Login', specialClass: 'gray-bg',
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .state('resetPassword', {
            url: "/resetPassword/:token",
            template: "<reset-password></reset-password>",
            resolve : {
                loadPlugin : function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ])
                }
            },
            data: {
                pageTitle: 'Login', specialClass: 'gray-bg',
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html",
            controller : function($scope){
                $scope.initScroll = function(){
                    $('.sidebar-collapse').slimScroll({
                        height: '100%',
                        railOpacity: 0.9
                    });  
                };

            },
            resolve : {
                loadPlugin : function($ocLazyLoad){
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ])
                }
            }
        })
        .state('index.empty', {
            url: "/empty",
            templateUrl : 'views/empty.html',
            data: {
                pageTitle: 'Empty Page',
                authorizedRoles: [USER_ROLES.all]
            }
        })
        .state('index.report', {
            url: "/report",
            controller: function ($scope, $state, LeaderMESservice) {
                $scope.IsUserReport = {
                    IsUserReport : false
                };
                if (!$state.params.menuContent) {
                    $scope.stateParams = LeaderMESservice.getStateParams();
                }
                else {
                    $scope.stateParams = $state.params.menuContent;
                    LeaderMESservice.saveStateParams($scope.stateParams);
                }
            },
            template: '<report-directive content="stateParams.subMenu" isuserreport="IsUserReport"></report-directive>',
            data: {
                authorizedRoles: [USER_ROLES.all], pageTitle: 'Report'
            },
            params: {menuContent: null}
        })
        .state('index.appObject', {
            url: "/appObject",
            controller: function ($scope, $state, LeaderMESservice, BreadCrumbsService) {
                BreadCrumbsService.init();
                if (!$state.params.menuContent) {
                    $scope.stateParams = LeaderMESservice.getStateParams();
                }
                else {
                    $scope.stateParams = $state.params.menuContent;
                    LeaderMESservice.saveStateParams($scope.stateParams);
                }
            },
            template : '<app-object-directive content="stateParams.subMenu"></app-object-directive>',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            params: {menuContent: null}
        })
        .state('index.multiforms', {
            url: "/multiforms",
            controller: function ($scope, $state, LeaderMESservice,BreadCrumbsService) {
                if (!$state.params.menuContent) {
                    $scope.stateParams = LeaderMESservice.getStateParams();
                }
                else {
                    $scope.stateParams = $state.params.menuContent;
                    LeaderMESservice.saveStateParams($scope.stateParams);
                }
                $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                if ($scope.modal === undefined || $scope.modal === null) {
                    BreadCrumbsService.init();
                    if ($scope.localLanguage == true) {
                        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
                        BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
                        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName ;
                    }
                    else {
                        BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
                        ($scope.stateParams.subMenu.SubMenuEName, 0);
                        $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName ;
                    }
                }
            },
            template: '<multi-form-directive content="stateParams.subMenu"></multi-form-directive>',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            params: {menuContent: null}
        })
        .state('index.custom', {
            url: "/custom",
            controller: function ($scope, $state, LeaderMESservice) {
                $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                // console.log(`state.params : ${JSON.stringify($state.params)}`);
                if (!$state.params.menuContent) {
                    $scope.stateParams = LeaderMESservice.getStateParams();
                }
                else {
                    $scope.stateParams = $state.params.menuContent;
                    LeaderMESservice.saveStateParams($scope.stateParams);
                }
                
                $scope.$emit('changeTitle',($scope.localLanguage ? $scope.stateParams.topMenu.TopMenuLName : $scope.stateParams.topMenu.TopMenuEName) + " | " + ($scope.localLanguage ? $scope.stateParams.subMenu.SubMenuLName : $scope.stateParams.subMenu.SubMenuEName));
            },
            template: '<custom-directive content="stateParams"></custom-directive>',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            params: {menuContent: null}
        })
        .state('reportFullView', {
            url: "/report/:reportID/:IsUserReport",
            template: '<license-module module-id="{{rootScope.moduleId}}"><div id="wrapper"  class="{{rtl}} gray-bg"><report-directive ng-if="subMenu" content="subMenu" isuserreport="IsUserReport"></report-directive></div></license-module>',
            data: {
                pageTitle: 'Report',
                authorizedRoles: [USER_ROLES.all]
            },
            controller: function ($scope, $state,$rootScope, $stateParams,LeaderMESservice) {
                $scope.IsUserReport = {
                    IsUserReport :!($stateParams.IsUserReport == "false")
                };
                $scope.rootScope = $rootScope;
                if (LeaderMESservice.isLanguageRTL() == true) {
                    $scope.rtl = "rtl";
                    $rootScope.rtl = "rtl";
                    $scope.navBarLogOut = "navbar-left";
                }
                else {
                    $scope.navBarLogOut = "navbar-right";
                }
                var mainMenu = LeaderMESservice.getMainMenu();
                for (var i = 0; i < mainMenu.length; i++){
                    for (var j = 0; j < mainMenu[i].subMenu.length; j++){
                        var subMenu = mainMenu[i].subMenu[j];
                        if (subMenu.SubMenuExtID == parseInt($stateParams.reportID) && subMenu.SubMenuTargetTYpe == 'report'){
                            $scope.subMenu = subMenu;
                            return;
                        }
                    }
                }
                LeaderMESservice.customAPI('GetReportName',{ReportID : parseInt($stateParams.reportID),IsUserReport : $scope.IsUserReport.IsUserReport}).then(function(response){
                    if(response == 'unAuthorized'){
                        return;
                    }
                    if (response.TabObject){
                        $scope.subMenu = response.TabObject;
                        return;
                    }
                });
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {reportID: null,IsUserReport : null}
        })
        .state('appObjectFullView', {
            url: "/appObjectFullView/:appObjectName/:ID/:tabId",
            templateUrl: 'views/common/appObjectFullViewTemplate.html',
            data: {
                pageTitle: 'App Object',
                authorizedRoles: [USER_ROLES.all]
            },
            controller: function ($scope, $state,$rootScope, $stateParams,LeaderMESservice,commonFunctions,$modal,$timeout,BreadCrumbsService,SweetAlert,$sessionStorage) {
                $scope.openPage = false;
                // if (location.hash.indexOf("?firstTime=true") > 0){
                //     location.hash = location.hash.split("?")[0];
                //     return location.reload();
                // }
                $scope.openPage = true;
                if (LeaderMESservice.isLanguageRTL() == true) {
                    $scope.rtl = "rtl";
                    $rootScope.rtl = "rtl";
                    $scope.navBarLogOut = "navbar-left";
                }
                else {
                    $scope.navBarLogOut = "navbar-right";
                }
                $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                $scope.tabsObject = LeaderMESservice.getTabsByAppName($stateParams.appObjectName);
                if ($scope.tabsObject.TopMenuNewObjectLinkID != 0){
                    $scope.showAdd = true;
                }

                $scope.openObjectDescription = function(){
                    if ($scope.tabsObject.TopMenuObjectInformation) {
                        return window.open($scope.tabsObject.TopMenuObjectInformation, '_blank');
                    }
                };

                $scope.add = function(ID){
                    var appObject = $scope.tabsObject;
                    var url = $state.href('appObjectFullView', {
                        appObjectName: appObject.TopMenuObjectKey,
                        ID: ID
                    });
                    var url = url + "?firstTime=true";
                    var newWindow = window.open(url,appObject.TopMenuObjectKey);
                    newWindow.close();
                    window.open(url,appObject.TopMenuObjectKey);
                    return ;
                };

                $scope.openNewObject = function(){
                    var newObjectInstance = $modal.open({
                        templateUrl: 'views/common/actions/customActionModal.html',
                        resolve: {
                            content: function(){
                                return $scope.tabsObject;
                            },
                            parentScope: function(){
                                return $scope;
                            }
                        },
                        controller: function ($scope, $compile, $modalInstance,$timeout,commonFunctions,$state,content,parentScope) {
                            var actionModalInstanceCtrl = this;
                            actionModalInstanceCtrl.loading = true;
                            actionModalInstanceCtrl.template = 'views/common/form.html';
                            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                            actionModalInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
                            $scope.modalInstance = $modalInstance;
                            $scope.parentScope = parentScope;
                            if ($scope.localLanguage){
                                actionModalInstanceCtrl.title =  content.TopMenuLName;
                            }
                            else{
                                actionModalInstanceCtrl.title =  content.TopMenuEName;
                            }
                            var tab = _.find(content.subMenu, {SubMenuEnableOnNew: true});
                            if (tab || content.TopMenuNewObjectFormID) {

                                $scope.formID = content.TopMenuNewObjectFormID || tab.SubMenuExtID;
                                $scope.pageDisplay = 1;

                                commonFunctions.commonCodeNew($scope);

                                $scope.getNewObjectFields();
                            }

                            actionModalInstanceCtrl.close = function (){
                                $modalInstance.close();
                            };
                            actionModalInstanceCtrl.loading = false;
                        },
                        controllerAs: 'actionModalInstanceCtrl'
                    }).result.then(function (ID) {
                        if (ID) {
                            $timeout(function(){
                                $scope.add(ID);
                            },200);
                        }
                    });
                };
                $scope.objectId = $stateParams.ID;
                commonFunctions.commonCodeObjectFullView($scope);
                $scope.newObject = false;
                $scope.rowClicked($stateParams.ID,$stateParams.appObjectName,'ID');
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {appObjectName : null,ID : null,tabId : null}
        })
        .state('customFullView', {
            url: "/custom/:topMenuId/:subMenuId",
            controller: function ($scope, $state, LeaderMESservice,$stateParams, $rootScope, BreadCrumbsService) {
                $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
                $scope.backgroundColor = 'white';
                var mainMenu = LeaderMESservice.getMainMenu();
                var topMenu = _.find(mainMenu,{TopMenuAppPartID : parseInt($stateParams.topMenuId)});
                if (topMenu){
                    var subMenu = _.find(topMenu.subMenu,{SubMenuAppPartID : parseInt($stateParams.subMenuId)});
                    $scope.params = {
                        topMenu : topMenu,
                        subMenu : subMenu,
                        newTab : true
                    }
                    BreadCrumbsService.init();
                    if ($scope.localLanguage == true) {
                        BreadCrumbsService.push(topMenu.TopMenuLName, 0);
                        BreadCrumbsService.push(subMenu.SubMenuLName, 0);
                        $scope.topPageTitle = subMenu.SubMenuLName;
                    }
                    else {
                        BreadCrumbsService.push(topMenu.TopMenuEName, 0);
                        BreadCrumbsService.push(subMenu.SubMenuLName, 0);
                        $scope.topPageTitle = subMenu.SubMenuEName;
                    }
                }
                $scope.$emit('changeTitle',($scope.localLanguage ? $scope.params.topMenu.TopMenuLName : $scope.params.topMenu.TopMenuEName) + " | " + ($scope.localLanguage ? $scope.params.subMenu.SubMenuLName : $scope.params.subMenu.SubMenuEName));
                $scope.rootScope = $rootScope;
                if (!$state.params.menuContent) {
                    $scope.stateParams = LeaderMESservice.getStateParams();
                }
                else {
                    $scope.stateParams = $state.params.menuContent;
                    LeaderMESservice.saveStateParams($scope.stateParams);
                }
            },
            templateUrl: 'views/common/customFullView.html',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {topMenuId: null,subMenuId : null}
        })
        .state('multiformsFullView', {
            url: "/multiforms/:topMenuId/:subMenuId",
            controller: function ($scope, $state, LeaderMESservice,$stateParams) {
                var mainMenu = LeaderMESservice.getMainMenu();
                $scope.rtl = LeaderMESservice.isLanguageRTL();
                var topMenu = _.find(mainMenu,{TopMenuAppPartID : parseInt($stateParams.topMenuId)});
                if (topMenu){
                    var subMenu = _.find(topMenu.subMenu,{SubMenuAppPartID : parseInt($stateParams.subMenuId)});
                    $scope.subMenu = subMenu;
                }
            },
            template: '<div id="wrapper"  class="{{rtl ? \'rtl\' : \'\'}} gray-bg"><multi-form-directive content="subMenu"></multi-form-directive></div>',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {topMenuId: null,subMenuId : null}
        })
        .state('unScheduledJobs', {
            url: "/unScheduledJob/:departmentIds",
            controller: function ($scope, customServices, LeaderMESservice, $stateParams) {
                $scope.selectedDepartmentIds = ($stateParams.departmentIds || "").split(',').map(it => parseInt(it));
                customServices.customGetCode($scope, 'custom:UnScheduledJobs');
                $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
                $scope.emptyPage = function(){
                    location.reload();
                }
                
                $scope.rowClicked = function (IDs) {
                  
                };
            },
            template: '<div id="wrapper" ng-if="editableTableData" class="{{rtl ? \'rtl\' : \'\'}} gray-bg"><react-search-results-unassigned-jobs content="editableTableData"></react-search-results-unassigned-jobs></div>',
            data: {
                authorizedRoles: [USER_ROLES.all]
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
        })
        .state('NewDataFullView', {
            url: "/New/:reportID",
            template: '<div id="wrapper"  class="{{rtl}} gray-bg"><report-directive content="data"></report-directive></div>',
            data: {
                pageTitle: 'Report',
                authorizedRoles: [USER_ROLES.all]
            },
            controller: function ($scope, $state, $stateParams) {
                $scope.data = {
                    formID : $stateParams.formID,
                    reportType : "new"
                };
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {formID: null}
        })
        .state('appObjectMachineFullView', {
            url: "/appObjectMachineFullView/:appObjectName/:ID",
            templateUrl: 'views/custom/productionFloor/machineView/machine.html',
            data: {
                pageTitle: 'App Object',
                authorizedRoles: [USER_ROLES.all]
            },
            controller: function ($scope, $state,$rootScope, $stateParams,LeaderMESservice,$modal,SweetAlert,$filter) {
                $scope.loading = true;
                $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                // if (location.hash.indexOf("?firstTime=true") > 0){
                //     location.hash = location.hash.split("?")[0];
                //     return location.reload();
                // }
                if (LeaderMESservice.isLanguageRTL()  == true) {
                    $scope.rtl = "rtl";
                    $rootScope.rtl = "rtl";
                    $scope.navBarLogOut = "navbar-left";
                }
                else {
                    $scope.navBarLogOut = "navbar-right";
                }
                var blurred = false;
                // window.onblur = function() { blurred = true; };
                // window.onfocus = function() { blurred && (location.reload()); };
                if ($stateParams.ID > 0) {
                    $scope.departmentMachines = [];
                    LeaderMESservice.customAPI('GetDepartmentMachine',{"DepartmentID":0}).then(function(response){
                        var departments = response.DepartmentMachine;
                        departments.forEach(function(dep){
                            if (dep && dep.Value){
                                var machine = _.find(dep.Value,{Id: parseInt($stateParams.ID)});
                                if (machine){
                                    $scope.departmentMachines = dep.Value;
                                }
                            }
                        });
                    });
                    LeaderMESservice.actionAPI('GetMachineMainData', {MachineID: $stateParams.ID}).then(function (response) {
                        if (response.AllDepartments && response.AllDepartments.length == 1){
                            if (response.AllDepartments[0].RTOnline == false){
                                SweetAlert.swal($filter('translate')('WARNING_OFFLINE_MESSAGE'),$filter('translate')('CONTACT_EMERALD'), "error");
                            }                            
                            var machine = _.find(response.AllDepartments[0].DepartmentsMachine,{MachineID : parseInt($stateParams.ID) });
                            if (machine){
                                $scope.machine = machine;
                                var targetParameters = {
                                    JobID : machine.JobID,
                                    ID : parseInt($stateParams.ID),
                                    MachineID : parseInt($stateParams.ID),
                                    JoshID : machine.JoshID,
                                    SetupEnd : machine.SetupEnd,
                                    ...machine
                                };
                                $scope.getPendingJobs = function(){
                                    var upperScope = $scope;
                                    var pedingJobsInstance = $modal.open({

                                        templateUrl: 'views/custom/machine/pendingJobs.html',
                                        controller: function ($scope, $compile, $modalInstance,LeaderMESservice,$sessionStorage) {

                                            var pendingJobsInstanceCtrl = this;
                                            
                                            pendingJobsInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
                                            pendingJobsInstanceCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
                                            $scope.machine = _.find(upperScope.departmentMachines,{ Id : parseInt($stateParams.ID)});
                                  
                                            $scope.machineName = pendingJobsInstanceCtrl.localLanguage ? $scope.machine.MachineLName  : $scope.machine.MachineName 
                                            
                                            $scope.rowClicked = function (IDs) {
                                                $modalInstance.close(IDs);
                                            }
                                            
                                            $scope.searchResultsRequest = {
                                                data: {
                                                    functionCallBack: null,
                                                    onlyNewTab: true,
                                                    returnValue: false,
                                                    openSearchInNewTab: false,
                                                    removeSelectOption : false,
                                                    activateJob : true,
                                                    multiSelect : false
                                                },
                                                request: {
                                                    "MachineID": $stateParams.ID
                                                },
                                                api: 'GetJobsListForMachine'
                                            };

                                            $scope.close = function(){
                                                $modalInstance.close();
                                            }
                                            pendingJobsInstanceCtrl.close = function (){
                                                $modalInstance.close();
                                            };

                                        },
                                        controllerAs: 'pendingJobsInstanceCtrl'
                                    }).result.then(function(){
                                        $state.transitionTo($state.current, $stateParams, {
                                            reload: false,
                                            inherit: false,
                                            notify: true
                                        });
                                    },function(){
                                        $state.transitionTo($state.current, $stateParams, {
                                            reload: true,
                                            inherit: false,
                                            notify: true
                                        });
                                    });

                                };
                                $scope.appObjectTabsStruct = {
                                    ID: $stateParams.ID,
                                    linkItem: $stateParams.appObjectName,
                                    targetParameters: targetParameters
                                };
                                $scope.loading = false;
                            }
                        }
                    });
                }
                else{
                    $scope.loading = false;
                }
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            params: {appObjectName : null,ID : null}
        })
        .state('index.main', {
            url: "/main",
             template: '<div ng-if="dashboardMainCtrl.showDashboard == true"><div ng-include="\'views/dashboard/dashboard.html\'"></div></div>',
            // templateUrl: "views/print/printTemplate.html",
            data: {
                pageTitle: 'Dashboard',
                authorizedRoles: [USER_ROLES.all]
            },
            controllerAs : 'dashboardMainCtrl',
            controller: function ($scope,AuthService,Restangular,DASHBOARD,$sessionStorage, $state) {
                var dashboardMainCtrl = this;
                $scope.show = true;
                $scope.cognosEnable = COGNOS.enable;
                $scope.cognosUrl = COGNOS.url;
                dashboardMainCtrl.showDashboard = false;
                // if ($scope.cognosEnable == true) {
                //     $('#cookieIframe').attr("src", BASE_URL.url + "GetKeyForCognos/" + AuthService.getAccessToken());
                //     $('.iframe').css("min-height", $(window).height() + "px");
                //     //$('#cognosIframe').attr("src",$scope.cognosUrl);
                // }
                if (DASHBOARD.show == false){
                    if ($sessionStorage.productionFloor) {
                        $state.go('index.custom', {
                            menuContent: $sessionStorage.productionFloor
                        });
                    }
                    else{
                        $state.go('index.empty');
                    }
                    return;
                }
                dashboardMainCtrl.showDashboard = true;
            }
        })
        .state('fullTreeView', {
            url: "/tree/:api/:linkitem/:ID",
            template: '<tree-graph-directive requestapi="requestAPI" requestbody="requestBody" content="content"></tree-graph-directive>',
            params :{
                ID : null,
                api : null,
                linkitem : null
            },
            data: {
                pageTitle: 'TREE_VIEW',
                authorizedRoles: [USER_ROLES.all]
            },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: false,
                            files : ['https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS.tracking_id]
                        }
                    ]);
                }
            },
            controller: function ($scope,$stateParams,$location) {
                $scope.requestAPI = $stateParams.api;
                $scope.requestBody = $location.search();
                $scope.content = {
                    ID : parseInt($stateParams.ID),
                    linkItem : $stateParams.linkitem
                }
            }
        })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            data: {
                pageTitle: 'Login', specialClass: 'gray-bg',
                authorizedRoles: [USER_ROLES.all]
            }
        });

    var startTime = Date.now();
    RestangularProvider.addFullRequestInterceptor(function(element, operation, path, url, headers, params, httpConfig) {
        if (RestangularProvider.configuration.defaultHeaders.UniqueID) {
            var newTime = Date.now();
            headers.Interval = (Math.max(Date.now() - startTime,0) / 1000).toFixed(0);
            startTime = newTime;
        }
        return {
            headers,
            params,
            element,
            httpConfig
        }
    });

    RestangularProvider.setBaseUrl(BASE_URL.url);
    RestangularProvider.setDefaultHttpFields({
        timeout: 60000
    });

    $locationProvider.html5Mode(false);
    // $translateProvider
    //     .useStaticFilesLoader({
    //         prefix: 'js/langs/',
    //         suffix: '.json'
    //     })
    //     .preferredLanguage('eng');

    $translateProvider.useLoader('asyncLoader');

    gtag('js', new Date());

    gtag('config', GOOGLE_ANALYTICS.tracking_id);

    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: false,
        closeHtml: '<button>&times;</button>',
        extendedTimeOut: 1000,
        iconClasses: {
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning'
        },
        messageClass: 'toast-message',
        onHidden: null,
        onShown: null,
        onTap: null,
        progressBar: true,
        tapToDismiss: true,
        templates: {
            toast: 'directives/toast/toast.html',
            progressbar: 'directives/progressbar/progressbar.html'
        },
        timeOut: 5000,
        titleClass: 'toast-title',
        toastClass: 'toast',
        target: '#toastr',
        positionClass: "toast-top-full-width"
    });

}

function AuthRoute($rootScope, AUTH_EVENTS, AuthService,$sessionStorage) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
        $rootScope.moduleId = null;
        var authorizedRoles = next.data.authorizedRoles;
        if (next.data.pageTitle !== "Login" && !AuthService.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            $rootScope.$state.go('login');
        }
        else if (next.data.pageTitle !== "Login" && (!$sessionStorage.HasEmail || !$sessionStorage.ValidatedEmail)){
            event.preventDefault();
            $rootScope.$state.go('login');
        }
    });
}



angular
    .module('LeaderMESfe')
    .config(config)
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    })
    .factory('AuthInterceptor', function ($rootScope, $q,
                                          AUTH_EVENTS,SweetAlert) {
        return {
            responseError: function (response) {
                // if (response.status != 401 || response.status != 403 || response.status != 419 || response.status != 440) {
                //     SweetAlert.swal("Server communication error.", "Please contact LeaderMES support", "error");
                // }

                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthenticated,
                    419: AUTH_EVENTS.notAuthenticated,
                    440: AUTH_EVENTS.notAuthenticated
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })
    .run(function ($rootScope, $state, AUTH_EVENTS, AuthService, $interval, LeaderMESservice,
        Restangular,$sessionStorage,configuration, $ocLazyLoad,$modal, SweetAlert, $filter, BASE_URL, GLOBAL) {
            if ($sessionStorage.version !== GLOBAL.version && $sessionStorage.version) {
                $sessionStorage.version = GLOBAL.version;
                window.location.reload(true);
                return;
            }
            $sessionStorage.version = GLOBAL.version;
            LeaderMESservice.getProductionProgressColorDefinition();

            $sessionStorage.baseUrl = BASE_URL.url;
            var checkAzureUser = () => {
                if ($sessionStorage.azureUser && $sessionStorage.azureRequestsInterval && !$rootScope.azureUserInterval) {
                    $rootScope.azureUserInterval = $interval(() => {
                        LeaderMESservice.customAPI('CheckUserAfterInterval',{
                            "AzureUserUniqueID": $sessionStorage.azureUser,
                            "TemplateID": AuthService.getTemplateID(),
                            UserID: LeaderMESservice.getUserID()
                        }).then((response) => {
                            if (response && response.error && response.error.ErrorCode === 405) {
                                const TITLE = $filter('translate')('SESSION_EXPIRED');
                                const TEXT = $filter('translate')('SSO_SESSION_EXPIRE_AZURE');
                                const OK_BTN_TEXT = $filter('translate')("OK");
                                SweetAlert.swal({
                                        title: TITLE,
                                        text : TEXT,
                                        type: "warning",
                                        showCancelButton: false,
                                        confirmButtonColor: "rgb(174, 222, 244)",
                                        confirmButtonText: OK_BTN_TEXT,
                                        closeOnConfirm: true,
                                        closeOnCancel: true,
                                        animation: "false"
                                    },
                                    function () {
                                            $rootScope.$state.go('login');
                                    });
                            } 
                        }).catch(err => {
                            $rootScope.$state.go('login');
                        });
                    },$sessionStorage.azureRequestsInterval * 1000);
                }
            }
            checkAzureUser();
            $rootScope.$on('azureUserLogIn', () => {
                checkAzureUser();
            });

            $rootScope.$on('userLogout', () => {
                if ($rootScope.azureUserInterval) {
                    $interval.cancel($rootScope.azureUserInterval);
                    $rootScope.azureUserInterval = null;
                }
                $sessionStorage.azureUser = null;
            });
            // <script src="js/plugins/pdfjs/pdf.js"></script>
            // <script src="bower_components/pdfmake/build/pdfmake.js"></script>
            // <script src="bower_components/pdfmake/build/vfs_fonts.js"></script>
            $ocLazyLoad.load([
                'ui.grid',
                'ui.grid.selection',
                'ui.grid.exporter',
                'ui.grid.edit',
                'ui.grid.moveColumns',
                'ui.grid.resizeColumns',
                'ui.grid.saveState',
                'ui.grid.draggable-rows',
                'ui.grid.pinning',
                'ui.grid.autoResize'
            ])
            $ocLazyLoad.load([
                {
                    serie: true,
                    files :[
                        'js/plugins/pdfjs/pdf.js',
                        'bower_components/pdfmake/build/pdfmake.js',
                        'bower_components/pdfmake/build/vfs_fonts.js',
                    ]
                }
            ]);
       /* $ocLazyLoad.load([
            { //highcharts
                serie: true,
                files: [
                'bower_components/highcharts/highcharts.js',
                'bower_components/highcharts/modules/export-data.js',
                'bower_components/highcharts/highcharts-more.js',
                'bower_components/highcharts/modules/solid-gauge.js',
                'bower_components/highcharts/modules/data.js',
                'bower_components/highcharts/modules/heatmap.js',
                'bower_components/highcharts/modules/exporting.js',
                'bower_components/highcharts/modules/no-data-to-display.js',
                'bower_components/highcharts/modules/pattern-fill.js',
                'bower_components/highcharts/modules/drilldown.js'
                ]
            },
            {
                name : 'highcharts-ng',
                files : ['bower_components/highcharts-ng/dist/highcharts-ng.js']
            },
            { // full calendar
                serie: true,
                files: [
                    'bower_components/fullcalendar/dist/fullcalendar.js',
                    'bower_components/fullcalendar/dist/locale-all.js',
                    'js/plugins/full-calendar-scheduler/core/main.js',
                    'js/plugins/full-calendar-scheduler/interaction/main.js',
                    'js/plugins/full-calendar-scheduler/daygrid/main.js',
                    'js/plugins/full-calendar-scheduler/timegrid/main.js',
                    'js/plugins/full-calendar-scheduler/list/main.js',
                    'js/plugins/full-calendar-scheduler/timeline/main.js',
                    'js/plugins/full-calendar-scheduler/resource-common/main.js',
                    'js/plugins/full-calendar-scheduler/resource-timeline/main.js'
                ]
            },
            { // other files
                serie: true,
                files: [
                    'bower_components/json-logic-js/logic.js',
                    'js/jquery/tableColumns.js',
                    'js/plugins/chosen/chosen.jquery.js',
                    'bower_components/json-logic-js/logic.js',
                    'js/plugins/popper/popper.min.js',
                    'js/plugins/tooltip/tooltip.min.js',
                    'js/plugins/shapeShift/jquery.shapeshift.js',
                    'js/plugins/shapeShift/jquery.touch-punch.min.js',
                    'js/plugins/d3/d3.v3.min.js',
                    'js/plugins/d3/d3plus-text.v0.9.full.min.js',
                    'js/plugins/d3/d3-flextree.min.js',
                    'js/plugins/d3pie/d3pie.min.js',
                    'js/plugins/pdfjs/pdf.js',
                    'bower_components/pdfmake/build/pdfmake.js',
                    'bower_components/pdfmake/build/vfs_fonts.js'
                ]
            }
        ]);*/
        $rootScope.$state = $state;
        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            if($rootScope.notAuthenticatedSignaled){
                return;
            }
            $rootScope.notAuthenticatedSignaled = true;
            // $rootScope.unauthorized = true;
            // Restangular.setDefaultHeaders({});
            var modalIns = $modal
                .open({
                    templateUrl: "views/common/reLogin.html",
                    backdrop: 'static',
                    controller: reLoginCtrl,
                }).result.then(() => {
                    $rootScope.notAuthenticatedSignaled=false;

                }, () => {
                    $rootScope.unauthorized = true;
                    Restangular.setDefaultHeaders({});
                    $rootScope.$state.go('login');
                    $rootScope.notAuthenticatedSignaled=false;
                });
            // const TITLE = $filter('translate')('SESSION_EXPIRED');
            // const TEXT = $filter('translate')('PLEASE_LOGIN_AGAIN');
            // const OK_BTN_TEXT = $filter('translate')("OK");
            // SweetAlert.swal({
            //         title: TITLE,
            //         text : TEXT,
            //         type: "warning",
            //         showCancelButton: false,
            //         confirmButtonColor: "rgb(174, 222, 244)",
            //         confirmButtonText: OK_BTN_TEXT,
            //         closeOnConfirm: true,
            //         closeOnCancel: true,
            //         animation: "false"
            //     },
            //     function () {
            //             $rootScope.$state.go('login');
            //     });
        });
        configuration.getSection("zoom").then(function (zoom) {
            zoom.data.sort((a,b) => (a.resolution > b.resolution) ? -1 : ((b.resolution > a.resolution) ? 1 : 0));
            for (var i = 0;i < zoom.data.length ; i++){
                if (window.innerWidth >= zoom.data[i].resolution){
                    document.body.style.zoom = zoom.data[i].zoom;
                    $rootScope.scaleAfterZoom = 1 / zoom.data[i].zoom;
                    return;
                }
            }
            document.body.style.zoom = zoom.else;
            $rootScope.scaleAfterZoom = 1 / zoom.else;
        });
        AuthRoute($rootScope, AUTH_EVENTS, AuthService,$sessionStorage)
    });