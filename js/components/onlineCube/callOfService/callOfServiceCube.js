function callOfServiceCube() {

    var controller = function ($scope, LeaderMESservice, CallOfServiceService, AuthService, notify, toastr, $filter, $sessionStorage, $modal, BASE_URL, Upload) {
        var callOfServiceCubeCtrl = this;
        callOfServiceCubeCtrl.dataLoad = true;
        $scope.techName;
        callOfServiceCubeCtrl.userName = AuthService.getUsername();
        $scope.notifications = [];
        callOfServiceCubeCtrl.openCallsNotifications = [];
        callOfServiceCubeCtrl.last24Notifications = [];
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.description = '';
        $scope.serviceReportText = '';

        $scope.selectedTab = 'openCalls';
        $scope.callTechnicianEnabled = false;
        $scope.techNameRequiredError = false;

        $scope.openNotifications = function (selectedTab) {
            $scope.selectedTab = selectedTab;
        }

        $scope.suggestionsAreReady;
        CallOfServiceService.getAllTechnicians().then(function (techs) {
            $scope.callTechnicianEnabled = true;
            $scope.allTechs = techs;
            $scope.suggestionsAreReady = true;
        });
        $scope.giveName = function (tempName) {
            $scope.techInfo = tempName;
            $scope.techName = tempName.DisplayName;
        }

        $scope.callTechnician = function (tech) {
            if (!tech || !$scope.techName) {
                $scope.techNameRequiredError = true;
                return;
            }
            $scope.callingTech = true;
            callOfServiceCubeCtrl.techCalled = false;
            LeaderMESservice.customAPI('CallForTechnicianNotification', {
                "targetUserID": tech.ID,
                "sourceUserName": callOfServiceCubeCtrl.userName,
                "sourceMachineID": $scope.machine.MachineID,
                "SourceWorkerID": LeaderMESservice.getUserID(),
                "targetUserName": tech.DisplayName,
                "Text": "Service call has been sent by operator " + callOfServiceCubeCtrl.userName + " from machine " + $scope.machine.MachineEName,
                "Title": "Operator " + callOfServiceCubeCtrl.userName,
                "additionalText": $scope.description
            }).then(function (response) {
                $scope.callOfServiceCubeCtrl.showTechnicianList = false;
                if (response.error) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                } else {
                    callOfServiceCubeCtrl.techCalled = true;
                    notify({
                        message: $filter("translate")("CALLED_SUCCESSFULLY"),
                        classes: "alert-success",
                        templateUrl: "views/common/notify.html",
                    });
                    $scope.updateTechnicianStatus();
                    $scope.updateNotifications();
                    $scope.closeTecWindow(callOfServiceCubeCtrl.techCalled);
                }
            })
        }

        $scope.closeTecWindow = flag => {
            if (flag) {
                $scope.close();
            }
        }

        $scope.removeNotification = function (notification) {
            callOfServiceCubeCtrl.dataLoad = true;
            LeaderMESservice.customAPI('NotificationResponse', {
                "sourceMachineID": $scope.machine.MachineID,
                "HistoryMsgID": notification.ID,
                "notificationType": notification.NotificationType,
                "ResTarget": 2,
                "ResType": 6,
                "sourceUserID": LeaderMESservice.getUserID(),
                "sourceUserName": "",
                "targetUserID": notification.TargetUserID,
                "targetUserName": notification.targetUserName,
                "Text": "",
                "Title": ""
            }).then(function (response) {
                $scope.updateTechnicianStatus();
                $scope.updateNotifications();
            });
        };

        $scope.updateNotifications = function () {
            if ($scope.loading) {
                return;
            }
            $scope.loading = true;
            LeaderMESservice.customAPI('GetOpenCallsAnd24Hours', {
                sourceMachineID: $scope.machine.MachineID
            }).then(function (response) {

                $scope.loading = false;
                callOfServiceCubeCtrl.last24Notifications = response.Calls24Hours;
                callOfServiceCubeCtrl.openCallsNotifications = response.OpenCalls;
                $scope.openNotifications($scope.selectedTab);
                callOfServiceCubeCtrl.dataLoad = false;
            });
        }

        callOfServiceCubeCtrl.suggestionsAreVisibleM = false;
        callOfServiceCubeCtrl.filterItems = (flag, name) => {
            $scope.techName = name;

            if ($scope.suggestionsAreReady) {
                if (flag) {
                    callOfServiceCubeCtrl.suggestionsAreVisibleM = true;
                }
                if ($scope.techName == undefined || $scope.techName == "") {
                    callOfServiceCubeCtrl.filteredSuggestions = $scope.allTechs;
                } else {
                    callOfServiceCubeCtrl.filteredSuggestions = $scope.querySearch($scope.techName);
                }
            }
        };

        $scope.querySearch = function (query) {
            return query ? $scope.allTechs.filter($scope.createFilterFor(query)) : [];
        };

        $scope.createFilterFor = function (query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                return item.DisplayHName && angular.lowercase(item.DisplayHName).indexOf(lowercaseQuery) >= 0;
            }
        };

        callOfServiceCubeCtrl.selectTech = (name, isMiddle) => {
            $scope.techName = name;
            if (isMiddle) {
                callOfServiceCubeCtrl.suggestionsAreVisibleM = false;
            }
        }

        $scope.changeTech = (tech, notification) => {
            $scope.techName = tech.DisplayName;
            LeaderMESservice.customAPI('ReAssignTechnicianCall', {
                "NotificationID": notification.ID,
                "NewTechnicianUserID": tech.ID
            }).then(response => {
                $scope.updateNotifications();
            })
        }

        $scope.changeTechStatus = (notification, responseType) => {
            LeaderMESservice.customAPI("NotificationResponse", {
                sourceMachineID: notification["SourceMachineID"],
                HistoryMsgID: notification["ID"],
                notificationType: notification["ResponseTypeID"],
                ResTarget: 1,
                ResType: responseType,
                sourceUserID: notification["SourceUserID"],
                sourceUserName: notification["SourceUserName"],
                targetUserID: notification["TargetUserID"],
                targetUserName: notification["TargetUserDisplayName"],
                Text: notification["Text"],
                Title: notification["Title"],
            }).then(function (response) {
                if (response.error) {
                    notify({
                        message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
                        classes: "alert-danger",
                        templateUrl: "views/common/notify.html",
                    });
                    return;
                } else {
                    notify({
                        message: $filter("translate")("SAVED_SUCCESSFULLY"),
                        classes: "alert-success",
                        templateUrl: "views/common/notify.html",
                    });
                    $scope.updateNotifications();
                }
            });
            $scope.updateNotifications();
        };


        $scope.openurl = function (url) {
            window.open(url, '_blank');
        }

        $scope.openServiceReport = notification => {
            $scope.FinishedNotificationId = notification.ID;
            $scope.FinishedNotificationTracking = notification.TargetUserID;
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/onlineCube/callOfService/serviceReport.html",
                    backdrop: "true",
                    controller: MainCtrl,
                    scope: $scope,
                })
                .result.then(function () {

                });
        };

        $scope.updateServiceCallDescription = () => {
            LeaderMESservice.customAPI('UpdateServiceCallDescription', {
                "NotificationID": $scope.FinishedNotificationId,
                "NotificationTracking": $scope.FinishedNotificationTracking,
                "Description": callOfServiceCubeCtrl.serviceReportText,
            }).then(response => {
                $scope.updateNotifications();
            })
        }


        $scope.clearDataFeilds = () => {
            callOfServiceCubeCtrl.serviceReportText = '';
            callOfServiceCubeCtrl.newFiles = [];
        }

        callOfServiceCubeCtrl.newFiles = [];

        $scope.attachFiles = newAttach => {
            if (newAttach) {
                if (callOfServiceCubeCtrl.newFile && callOfServiceCubeCtrl.newFile.type.indexOf('pdf') >= 0) {
                    var currentBlob = new Blob([callOfServiceCubeCtrl.newFile], {
                        type: 'application/pdf'
                    });
                    $scope.pdfUrl = URL.createObjectURL(currentBlob);
                }
                callOfServiceCubeCtrl.newFiles.push(callOfServiceCubeCtrl.newFile);
            }
        };


        $scope.uploadFiles = () => {
            let fileToUpload, FileID;
            angular.forEach(callOfServiceCubeCtrl.newFiles, (newFile) => {
                if (!newFile) {
                    return;
                }
                fileToUpload = newFile;
                FileID = 0;
                if (fileToUpload == "") {
                    return;
                }
                var fileData = fileToUpload.name.split(".");
                var FileExt = fileData.splice(-1, 1);
                var FileName = fileData.join(".");
                var NotificationID = $scope.FinishedNotificationId;
                var NotificationTracking = '0';
                var quickDisplay = false;

                Upload.upload({
                    url: BASE_URL.url + 'UpdateServiceCallFilesWeb/' + FileID + "/" + FileName + "/" + FileExt + "/" + NotificationID + "/" + NotificationTracking + "/" + quickDisplay,
                    headers: {
                        'x-access-token': AuthService.getAccessToken()
                    },
                    data: {
                        file: fileToUpload
                    }
                }).then(function (response) { });

            });

        };

        $scope.updateNotifications();
        $scope.updateData.updateNotifications = $scope.updateNotifications;
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/onlineCube/callOfService/callOfServiceCube.html',
        scope: {
            close: "=",
            machine: "=",
            params: "=",
            updateTechnicianStatus: "=",
            updateData: "=",
            updateTechnicianStatusCube: "="
        },
        link: function (scope, element, attrs) {
            scope.$on('$destroy', function () {
                scope.updateData.updateNotifications = null
            });
        },
        controller: controller,
        controllerAs: 'callOfServiceCubeCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('callOfServiceCube', callOfServiceCube);