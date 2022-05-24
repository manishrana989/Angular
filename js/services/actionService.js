angular.module('LeaderMESfe').factory('actionService', function ($compile, LeaderMESservice, $modal,
    notify, commonFunctions, SweetAlert, $filter, customServices, $state, $q, LicenseService) {

    var localLanguage = LeaderMESservice.showLocalLanguage();

    var getTargetParameters = function (targetParameters, $scope, objectParameters) {
        if ($scope.getTargetParameters) {
            return $scope.getTargetParameters(targetParameters, $scope, objectParameters);
        }
        var targetParametersSplit = targetParameters.split("=");
        var ans = {};
        ans[targetParametersSplit[0]] = targetParameters[targetParametersSplit[1]] ? targetParameters[targetParametersSplit[1]] : $scope.content.ID;
        return ans;
    };

    var getTargetParametersValue = function (targetParameters, $scope, objectParameters) {
        var targetParametersSplit = targetParameters.split("=");
        return targetParameters[targetParametersSplit[1]] ? targetParameters[targetParametersSplit[1]] : $scope.content.ID;
    };

    var openNewTab = function ($scope, actionItem) {
        if (actionItem.PreActionFunction == "") {
            var appObjectData = LeaderMESservice.getTabsByID(actionItem.SubMenuExtID);
            if (appObjectData) {
                var targetParametersValue = getTargetParametersValue(actionItem.SubMenuTargetParameters, $scope, actionItem.ObjectParameters);
                var url = $state.href('appObjectFullView', {
                    appObjectName: appObjectData.TopMenuEName,
                    ID: targetParametersValue
                });
                window.open(url, '_blank');
                if (actionItem.updateData) {
                    console.log("dataUpdated");
                    actionItem.updateData();
                }
                LeaderMESservice.refreshPage($scope, 0, true);
            } else {
                //TODO ERROR
            }
        } else {
            var targetParameters = getTargetParameters(actionItem.PreActionParameters, $scope, actionItem.ObjectParameters);
            targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
            LeaderMESservice.actionAPI(actionItem.PreActionFunction, targetParameters).then(function (response) {
                if (response.error === null) {
                    var appObjectData = LeaderMESservice.getTabsByID(actionItem.SubMenuExtID);
                    if (appObjectData) {
                        var url = $state.href('appObjectFullView', {
                            appObjectName: appObjectData.TopMenuEName,
                            ID: response.LeaderRecordID
                        });
                        if (actionItem.updateData) {
                            console.log("dataUpdated");
                            actionItem.updateData();
                        }
                        window.open(url, '_blank');
                    } else {
                        //TODO ERROR
                    }
                }
            });
        }
    };

    var openNotification = function ($scope, actionItem) {
        var targetParameters = $scope.getTargetParameters(actionItem.PreActionParameters, $scope, actionItem.ObjectParameters);
        targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
        commonFunctions.notification($scope, actionItem, targetParameters, true);
    };

    var openModalDialog = function ($scope, actionItem) {
        var targetParameters = getTargetParameters(actionItem.PreActionParameters, $scope, actionItem.ObjectParameters);
        targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
        var actionTemp = angular.copy(actionItem);
        if (actionTemp.PreActionFunction.indexOf('Approve') === 0) {
            actionTemp.PreActionFunction = actionTemp.PreActionFunction.split('.');
            if (actionTemp.PreActionFunction.length == 2) {
                actionTemp.PreActionFunction = actionTemp.PreActionFunction[1];
                var menuName = (localLanguage ? actionTemp.SubMenuLName : actionTemp.SubMenuEName);

                SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO') + ' ' + menuName + '' + "?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#D0D0D0",
                    confirmButtonText: $filter('translate')("YES"),
                    cancelButtonText: $filter('translate')("NO"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass: ($scope.rtl ? " swalRTL" : "")
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
                                actionItem.disabled = false;
                            });
                        } else {
                            actionItem.disabled = false;
                        }
                    });
            } else {
                actionTemp.PreActionFunction = "";
                commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
                    actionItem.disabled = false;
                });
            }
        } else {
            commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
                actionItem.disabled = false;
            });
        }
    }

    var openWizard = function ($scope, actionItem) {
        commonFunctions.wizard($scope, actionItem, $scope.content.ID);
    }

    var openCustom = function ($scope, actionItem) {
        customServices.customGetCode($scope, actionItem.SubMenuTargetTYpe, actionItem);
    }

    var openActionReport = function ($scope, actionItem) {
        var targetParameters = $scope.getTargetParameters(actionItem.PreActionParameters, $scope, actionItem.ObjectParameters);
        var modalInstance = $modal.open({
            templateUrl: 'views/custom/actions/searchReportAction.html',
            controller: function ($scope, $compile, $modalInstance) {
                $scope.subPage = {
                    data: {
                        data: {
                            onlyNewTab: false,
                            returnValue: false,
                            openSearchInNewTab: false,
                            reportID: actionItem.SubMenuExtID
                        },
                        request: targetParameters,
                        api: actionItem.PreActionFunction
                    }
                }
                $scope.skipSearch = true;
                $scope.ok = function () {
                    $modalInstance.close();
                };
            }
        })
    };

    var openQCTest = function (scope, actionItem) {
        $modal.open({
            templateUrl: 'js/components/orderTest/firstStep/firstStepTemplate.html',
            windowClass: 'qc-test-modal',
            backdrop: 'static',
            keyboard: false,
            controller: function ($scope, $modalInstance, toastr) {
                $scope.objectID = scope.content &&
                    (scope.content.targetParameters && scope.content.targetParameters.JobID) ||
                    (scope.content.params && scope.content.params.JobID) ||
                    (scope.content.ID);

                $scope.close = function () {
                    SweetAlert.swal({
                        title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_EXIT"),
                        showCancelButton: true,
                        confirmButtonColor: "#D0D0D0",
                        confirmButtonText: $filter("translate")("YES"),
                        cancelButtonText: $filter("translate")("NO"),
                        closeOnConfirm: true,
                        closeOnCancel: true,
                        animation: "false",
                        customClass: "",
                        background: "#f6f6f6"
                    },
                        function (isConfirm) {
                            if (isConfirm) {
                                $modalInstance.close();
                            }
                        }
                    );
                }
            },
            controllerAs:
                'numericPopupCtrl'
        }).result.then(function (res) {
            if (res) {
            }
        });

    };

    var openAction = function ($scope, actionItem) {
        var deferred = $q.defer();
        if (actionItem.SubMenuModuleID) {
            LicenseService.checkLicenseModuleReq(actionItem.SubMenuModuleID).then(function () {
                deferred.resolve(true);
            }).catch(function (err) {
                deferred.reject();
            })
        }
        else {
            deferred.resolve(true);
        }
        deferred.promise.then(function (success) {
            if (actionItem.SubMenuTargetTYpe === 'Notification') {
                openNotification($scope, actionItem);
            } else if (actionItem.SubMenuTargetTYpe === 'ModalDialog') {
                openModalDialog($scope, actionItem);
            } else if (actionItem.ActionOpenInNewTab === true && actionItem.SubMenuTargetTYpe === 'appObject') {
                openNewTab($scope, actionItem);
            } else if (actionItem.SubMenuTargetTYpe === 'wizard') {
                openWizard($scope, actionItem);
            } else if (actionItem.SubMenuTargetTYpe === 'Report') {
                openActionReport($scope, actionItem);
            } else if (actionItem.SubMenuTargetTYpe === 'custom:JobTestOrder') {
                openQCTest($scope, actionItem);
            } else if (actionItem.SubMenuTargetTYpe.indexOf('custom') === 0) {
                openCustom($scope, actionItem);
            }
        });
    }

    return {
        openAction: openAction
    }
});