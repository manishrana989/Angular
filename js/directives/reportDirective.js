
function reportDirective() {

    var template = "views/common/mainContentTemplate.html";


    var controller = function ($scope, $rootScope, $timeout, LeaderMESservice, commonFunctions, $state, $modal, BreadCrumbsService, customServices) {

        function init() {
            $rootScope.moduleId = null;
            if ($scope.content && $scope.content.SubMenuModuleID) {
                $rootScope.moduleId = $scope.content.SubMenuModuleID;
            }

            $scope.reportID = $scope.content.SubMenuExtID;

            $scope.pageDisplay = 0;
            $scope.showBreadCrumb = true;
            if ($state.current.name == "reportFullView") {
                $scope.showBreadCrumb = false;
            }
            $scope.IsUserReport = $scope.isuserreport.IsUserReport;
            $scope.searchMode = 1;
            // customServices.customGetCode($scope, $scope.content.SubMenuAppPartID);
            commonFunctions.commonCodeSearch($scope);
            $scope.getDisplayReportSearchFields();


            $scope.add = function (ID) {
                var appObject = LeaderMESservice.getTabsByID($scope.content.SubMenuNewObjectLinkID);

                if (appObject === null)
                    return;
                var url = $state.href('appObjectFullView', {
                    appObjectName: appObject.TopMenuObjectKey,
                    ID: ID
                });
                var url = url + "?firstTime=true";
                var newWindow = window.open(url, appObject.TopMenuObjectKey);
                newWindow.close();
                window.open(url, appObject.TopMenuObjectKey);
                return;
                $scope.topPageTitle = {
                    title: ""
                };
                var appObjectTabsStruct = {
                    ID: ID,
                    linkItem: appObject.TopMenuEName,
                    fieldName: "ID",
                    title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
                    topPageTitle: $scope.topPageTitle
                };

                $scope.subPages.push({
                    pageDisplay: $scope.pageDisplay + 1,
                    title: $scope.localLanguage === true ? appObject.TopMenuLName : appObject.TopMenuEName,
                    template: 'views/common/appObjectTabsTemplate.html',
                    ID: ID,
                    linkItem: appObject.TopMenuEName,
                    fieldName: "ID",
                    data: appObjectTabsStruct,
                    topPageTitle: $scope.topPageTitle
                });
                $scope.changes = [];
                $scope.doneLoading = true;
                $scope.pageDisplay++;
                $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
                LeaderMESservice.customAPI('DisplayAppObjectHeaderFields', {
                    appObject: appObject.TopMenuEName,
                    LeaderID: ID
                }).then(function (response) {
                    if (response.Data && response.Data.length > 0) {
                        for (var i = 0; i < response.Data.length; i++) {
                            var fieldName = ($scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName);
                            var fieldValue = response.Data[i].Value;
                            if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                                fieldValue = "<a target=\"" + response.Data[i].UrlTarget + "\" href=\"#/appObjectFullView/" + response.Data[i].UrlTarget + "/" + response.Data[i].ID + "/\">" + response.Data[i].Value + "</a>";
                            }
                            $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
                        }
                    }
                });
                BreadCrumbsService.push($scope.subPages[$scope.pageDisplay - 1].title + ' # ' + ID, $scope.subPages[$scope.pageDisplay - 1].pageDisplay, function () {
                    $scope.topPageTitle.title = $scope.localLanguage === true ? appObject.TopMenuLName + " # " + ID : appObject.TopMenuEName + " # " + ID;
                    LeaderMESservice.customAPI('DisplayAppObjectHeaderFields', {
                        appObject: appObject.TopMenuEName,
                        LeaderID: ID
                    }).then(function (response) {
                        if (response.Data && response.Data.length > 0) {
                            for (var i = 0; i < response.Data.length; i++) {
                                var fieldName = ($scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName);
                                var fieldValue = response.Data[i].Value;
                                if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                                    fieldValue = "<a target=\"" + response.Data[i].UrlTarget + "\" href=\"#/appObjectFullView/" + response.Data[i].UrlTarget + "/" + response.Data[i].ID + "/\">" + response.Data[i].Value + "</a>";
                                }
                                $scope.topPageTitle.title = $scope.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
                            }
                        }
                    });
                });
            };
            $scope.tabsObject = LeaderMESservice.getTabsByID($scope.content.SubMenuObjectInformationLink);

            $scope.openObjectDescription = function () {
                if ($scope.content.SubMenuObjectInformationLink) {
                    var objectMenu = LeaderMESservice.getTabsByID($scope.content.SubMenuObjectInformationLink);
                    if (objectMenu) {
                        return window.open(objectMenu.TopMenuObjectInformation, '_blank');
                        // var title = $scope.localLanguage ? $scope.content.SubMenuLName : $scope.content.SubMenuEName;
                        // SweetAlert.swal({
                        //     title: title || '',
                        //     html:true,
                        //     text: objectMenu.TopMenuObjectInformation
                        // });
                    }
                }
                else {
                    return window.open($scope.content.SubMenuObjectInformation, '_blank');
                    // var title = $scope.localLanguage ? $scope.content.SubMenuLName : $scope.content.SubMenuEName;
                    //     SweetAlert.swal({
                    //         title: title || '',
                    //         html:true,
                    //         text: $scope.content.SubMenuObjectInformation
                    //     });
                }
            };

            $scope.openNewObject = function () {

                var newObjectInstance = $modal.open({

                    templateUrl: 'views/common/actions/customActionModal.html',
                    resolve: {
                        content: function () {
                            return $scope.content;
                        },
                        parentScope: function () {
                            return $scope;
                        }
                    },
                    controller: function ($scope, $compile, $modalInstance, $timeout, commonFunctions, $state, content, parentScope) {
                        var actionModalInstanceCtrl = this;

                        actionModalInstanceCtrl.loading = false;
                        actionModalInstanceCtrl.template = 'views/common/form.html';
                        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                        $scope.modalInstance = $modalInstance;
                        $scope.parentScope = parentScope;
                        $scope.content = angular.copy(content);
                        actionModalInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
                        var objectMenu = LeaderMESservice.getTabsByID($scope.content.SubMenuNewObjectLinkID);
                        if ($scope.localLanguage) {
                            actionModalInstanceCtrl.title = objectMenu.TopMenuLName;
                        }
                        else {
                            actionModalInstanceCtrl.title = objectMenu.TopMenuEName;
                        }
                        var tab = _.find(objectMenu.subMenu, { SubMenuEnableOnNew: true });
                        if (tab || objectMenu.TopMenuNewObjectFormID) {
                            $scope.formID = objectMenu.TopMenuNewObjectFormID || tab.SubMenuExtID;
                            $scope.pageDisplay = 1;

                            commonFunctions.commonCodeNew($scope);
                            var customAPI = null;
                            var customRequest = null;
                            if (objectMenu && objectMenu.TopMenuAppPartID == 10550) {
                                customAPI = 'displayJobFormResult';
                                customRequest = { "jobID": 0, "subMenuAppPartID": 10555, "pairs": [] };
                                $scope.api = 'displayJobFormResult';
                                $scope.request = { "jobID": 0, "subMenuAppPartID": 10555 };
                                $scope.leaderId = 0;
                            }

                            

                            $scope.getNewObjectFields(customRequest, customAPI);
                        }



                        actionModalInstanceCtrl.close = function () {
                            $modalInstance.close();
                        };
                        actionModalInstanceCtrl.loading = false;
                    },
                    controllerAs: 'actionModalInstanceCtrl'
                }).result.then(function (ID) {
                    if (ID) {
                        $timeout(function () {
                            $scope.add(ID);
                        }, 200);
                    }
                });
            };

        }

        init();
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            content: '=',
            isuserreport: "="
        },
        controllerAs: 'reportCtrl',
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('reportDirective', reportDirective);
