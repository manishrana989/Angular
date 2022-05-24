function serviceCalls($timeout) {
    var controller = function ($scope, shiftService, $sessionStorage, $localStorage, LeaderMESservice, $modal, toastr, $filter, AuthService, BASE_URL, $rootScope, notify, SweetAlert, Upload) {
        var serviceCallsCtrl = this;
        $scope.shiftData = shiftService.shiftData;

        $scope.configIsVisible = false;
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        const userAuth = $sessionStorage.userAuthenticated;
        if (!$localStorage.shiftInfo) {
            $localStorage.shiftInfo={}
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {
                timeBar: {}
            };
        } else if (!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar) {
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar = {};
        }

        if (!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.views) {
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.views = {
                mainMenu: true,
                settingsMenu: false,
                serviceOpenCallsMainMenu: true,
                serviceOpenCallsSubMenu: false,
                notificationsMainMenu: true,
                notificationsSubMenu: false,
                mainConfig: false,
                addServiceCall: false,
                serviceCalls: false,
                notifications: true,
                notificationsMainMenuTopics: true,
                notificationsSubMenuTopics: false,
                notificationsMainMenuMachines: true,
                notificationsSubMenuMachines: false,
                generalSettings: true,
                notificationsSettings: false,
            }
        }
        $scope.views = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.views;

        if ($scope.views.settingsMenu) {
            $scope.views.settingsMenu = false;
            $scope.views.mainMenu = true;
        }

        if ($scope.views.serviceOpenCallsSubMenu) {
            $scope.views.serviceOpenCallsMainMenu = true;
            $scope.views.serviceOpenCallsSubMenu = false;
        }

        if ($scope.views.notificationsSubMenuTopics) {
            $scope.views.notificationsMainMenuTopics = true;
            $scope.views.notificationsSubMenuTopics = false;
        } else if ($scope.views.notificationsSubMenuMachines) {
            $scope.views.notificationsMainMenuMachines = true;
            $scope.views.notificationsSubMenuMachines = false;
        }

        if (!$localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.settings) {
            $scope.settings = {
                waitingTimeThresholdD: 30,
                treatmentTimeThresholdD: 60,
                waitingTimeThreshold: 30,
                treatmentTimeThreshold: 60,
                notificationsGroupBy: "ungrouped",
                serviceCallsLoaded: false,
                isLoaded: false,
                isSavingSettings: false,
                isCallingTehchnician: false,
                notificationsLoaded: false,
                notificationsAllChecked: true,
            };
            $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.settings = $scope.settings;
        } else {
            $scope.settings = $localStorage.shiftInfo[$sessionStorage.stateParams.subMenu.SubMenuExtID].timeBar.settings;
            $scope.settings.isLoaded = false;
            $scope.settings.isLoading = false;
            $scope.settings.isLoadingNotifications = false;
            $scope.settings.serviceCallsLoaded = false;
            $scope.settings.notificationsLoaded = false;
        }
        // $scope.callingTech = true; kkkkkkk
        $scope.data = {
            currentServiceCallHistory: [],
            currentTopicNotifications: [],
            currentMachineNotifications: [],
            selectedServiceCallName: "",
            selectedServiceCallFrom: "",
            selectedServiceCallTo: "",
            numberOfOpenServiceCalls: 0,
            numberOfDelayedServiceCalls: 0,
            selectedMachine: 0,
            selectedTechnician: 0,
            notificationTopics: [{
                    name: "Service calls",
                    key: "ServiceCalls",
                    active: false,
                    images: {
                        inactive: "images/setup-disable.png",
                        active: "images/setupp.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
                {
                    name: "Operator",
                    key: "Operator",
                    active: false,
                    images: {
                        inactive: "images/setup-disable.png",
                        active: "images/setupp.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
                {
                    name: "SET_UP",
                    key: "Setup",
                    active: false,
                    images: {
                        inactive: "images/operator-disable.png",
                        active: "images/operatorr.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
                {
                    name: "STOPS",
                    key: "Stops",
                    active: false,
                    images: {
                        inactive: "images/stops-disable.png",
                        active: "images/stopss.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
                {
                    name: "PARAMETER_DEVIATION",
                    key: "ParameterDeviation",
                    active: false,
                    images: {
                        inactive: "images/parameterss.png",
                        active: "images/parameters_enabled.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
                {
                    name: "PERFORMANCE",
                    key: "Performance",
                    active: false,
                    images: {
                        inactive: "images/performance-disable.png",
                        active: "images/performances.png",
                    },
                    checkedDemi: true,
                    checked: true,
                    data: [],
                },
            ],
            notifications: [],
            notificationsSettingsOBJ: {},
            notificationTopicsOBJ: {},
            serviceCallsSettings: {
                WaitingTimeIsOver: {
                    Value: "",
                    DemiValue: ""
                },
                TreatmentTimeIsOver: {
                    Value: "",
                    DemiValue: ""
                }
            }

        };


        $scope.data.notificationTopics.map((topic) => {
            $scope.data.notificationTopicsOBJ[topic.key] = topic;
        });

        $scope.printThat = () => {
            // console.log("selected tech", $scope.data.selectedTechnician);
        };

        $scope.reverseSettingsOnUnsaved = () => {
            $scope.data.notificationTopics.map((topic) => {
                topic.checkedDemi = topic.checked;
                return topic;
            });
        };

        $scope.toggleNotificationsChecked = (topicTheme) => {
            if (topicTheme == "all") {
                $scope.data.notificationTopics.map((topic) => {
                    topic.checkedDemi = $scope.settings.notificationsAllChecked;
                    for (let subTopic in $scope.data.notificationsSettingsOBJ[topic.key]) {
                        $scope.data.notificationsSettingsOBJ[topic.key][subTopic].isActiveDemi = topic.checkedDemi;
                    }
                    return topic;
                });
            } else {
                let topicToggled = $scope.data.notificationTopics.find(topic => topic.key == topicTheme);
                for (let subTopic in $scope.data.notificationsSettingsOBJ[topicTheme]) {
                    $scope.data.notificationsSettingsOBJ[topicTheme][subTopic].isActiveDemi = topicToggled.checkedDemi;
                }
            }

            // console.log("nots OBJ after toggle",$scope.data.notificationsSettingsOBJ);

        };


        $scope.saveNotificationsSettings = () => {
            // console.log("$scope.data.notificationTopics")
            // console.log($scope.data.notificationTopics)
            $scope.data.notificationTopics.map((topic) => {
                topic.checked = topic.checkedDemi;
                return topic;
            });

            let notificationSaved = [];
            for (let topic in $scope.data.notificationsSettingsOBJ) {
                for (let subTopic in $scope.data.notificationsSettingsOBJ[topic]) {
                    if (($scope.data.notificationsSettingsOBJ[topic][subTopic].isActive !=
                            $scope.data.notificationsSettingsOBJ[topic][subTopic].isActiveDemi) ||
                        $scope.data.notificationsSettingsOBJ[topic][subTopic].userNotificationSettingID == 0) {
                        let notificationToPush = $scope.data.notificationsSettingsOBJ[topic][subTopic].notification;
                        notificationToPush.IsActive = $scope.data.notificationsSettingsOBJ[topic][subTopic].isActiveDemi;
                        notificationSaved.push(notificationToPush);
                    }
                    $scope.data.notificationsSettingsOBJ[topic][subTopic].isActive = $scope.data.notificationsSettingsOBJ[topic][subTopic].isActiveDemi;
                }
            }
            // console.log("nots to save!!",notificationSaved);
            let notificationOBJ = {
                "Notifications": notificationSaved
            }

            LeaderMESservice.customAPI('SaveUserNotificationsSettings', notificationOBJ).then(function (response) {
                $scope.fetchNotificationsSettingsAndPolish(false);
                notify({
                    message: $filter("translate")("SAVED_SUCCESSFULLY"),
                    classes: "alert-success",
                    templateUrl: "views/common/notify.html",
                });
            });



        };

        $scope.fetchNotificationsSettingsAndPolish = (firstTime) => {
            LeaderMESservice.customAPI("GetUserNotificationsSettings", {}).then(function (response) {
                $scope.data.notificationsSettingsOriginal = angular.copy(response.Topics);
                angular.forEach(response.Topics, (topic) => {
                    let topicIndexInNotificationTopics = $scope.data.notificationTopics.findIndex(element => element.key == topic.Key);
                    $scope.data.notificationTopics[topicIndexInNotificationTopics].active = true;
                    $scope.data.notificationsSettingsOBJ[topic.Key] = {};
                    angular.forEach(topic.Notifications, (notification) => {
                        if (notification.IsActive == true || notification["UserNotificationSettingID"] != 0) {
                            $scope.data.notificationsSettingsOBJ[topic.Key][notification.NameKey] = {
                                userNotificationSettingID: notification["UserNotificationSettingID"],
                                name: notification.Name,
                                key: notification.NameKey,
                                isActive: notification.IsActive,
                                isActiveDemi: notification.IsActive,
                                notification: notification
                            };
                        }
                    });
                    //topic is empty
                    if (Object.keys($scope.data.notificationsSettingsOBJ[topic.Key]).length == 0) {
                        delete $scope.data.notificationsSettingsOBJ[topic.Key];
                    }
                })

                if (firstTime) {
                    $scope.fetchNotifications();
                } else {
                    $scope.polishNotifications();

                }
            });
        }

        $scope.showServiceCallHistory = (History) => {
            $scope.data.currentServiceCallHistory = angular.copy(History);
        };

        $scope.showMachineNotifications = (machine) => {
            $scope.data.currentMachineNotifications = angular.copy(machine);
        };

        $scope.showTopicNotifications = (topic) => {
            $scope.data.currentTopicNotifications = angular.copy(topic);
        };

        $scope.saveGeneralSettings = () => {
            // $scope.settings.isSavingSettings = true;
            // $scope.settings.waitingTimeThreshold = $scope.settings.waitingTimeThresholdD;
            // $scope.settings.treatmentTimeThreshold = $scope.settings.treatmentTimeThresholdD;

            let settingsList = [];

            for (let setting in $scope.data.serviceCallsSettings) {
                $scope.data.serviceCallsSettings[setting].Value = $scope.data.serviceCallsSettings[setting].DemiValue;

                let settingToAdd = {
                    "Value": Number($scope.data.serviceCallsSettings[setting].Value),
                    "SettingID": Number($scope.data.serviceCallsSettings[setting].ID)
                }

                settingToAdd["ID"] = $scope.data.serviceCallsSettings[setting].DefaultValue ? 0 : Number($scope.data.serviceCallsSettings[setting].UserSettingID);

                settingsList.push(settingToAdd);
            }

            LeaderMESservice.customAPI('SaveUserServiceCallsSettings', {
                "ServiceCalls": settingsList
            }).then(function (response) {

                notify({
                    message: $filter("translate")("SAVED_SUCCESSFULLY"),
                    classes: "alert-success",
                    templateUrl: "views/common/notify.html",
                });
                $scope.getTechnicians();
                $scope.updateServiceCalls();
            });
        };

        $scope.cancelServiceCall = (serviceCall) => {
            SweetAlert.swal({
                    title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_CANCEL_THIS_SERVICE_CALL"),
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#D0D0D0",
                    confirmButtonText: $filter("translate")("YES"),
                    cancelButtonText: $filter("translate")("NO"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass: "",
                    // swalRTL
                },
                function (isConfirm) {
                    if (isConfirm) {
                        $scope.updateServiceCallStatus(serviceCall, 6);
                    }
                }
            );
        };



        $scope.openServiceReport = (serviceCall, notification) => {
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/onlineCube/callOfService/serviceReportForServiceCalls.html",
                    backdrop: "true",
                    controller: function ($scope, $modalInstance, $timeout, LeaderMESservice) {
                        $scope.serviceCall = serviceCall

                        $modalInstance.close();
                    },
                    scope: $scope,
                })
                .result.then(function () {

                });
        };

        //////////////////////////////////////////////////////////////////
        $scope.updateServiceCallDescription = (serviceCall) => {
            $scope.FinishedNotificationId = serviceCall["GeneralInfo"]["NotificationID"]
            LeaderMESservice.customAPI('UpdateServiceCallDescription', {
                "NotificationID": serviceCall["GeneralInfo"]["NotificationID"],
                "NotificationTracking": serviceCall["NewestCall"]["TargetUserID"],
                "Description": serviceCallsCtrl.serviceReportText,
            }).then(response => {
                // $scope.updateNotifications();
            })
        }


        $scope.clearDataFeilds = () => {
            serviceCallsCtrl.serviceReportText = '';
            serviceCallsCtrl.newFiles = [];
        }

        serviceCallsCtrl.newFiles = [];

        $scope.attachFiles = newAttach => {
            if (newAttach) {
                if (serviceCallsCtrl.newFile && serviceCallsCtrl.newFile.type.indexOf('pdf') >= 0) {
                    var currentBlob = new Blob([serviceCallsCtrl.newFile], {
                        type: 'application/pdf'
                    });
                    $scope.pdfUrl = URL.createObjectURL(currentBlob);
                }
                serviceCallsCtrl.newFiles.push(serviceCallsCtrl.newFile);
            }
        };


        $scope.uploadFiles = () => {
            let fileToUpload, FileID;
            angular.forEach(serviceCallsCtrl.newFiles, function (newFile) {
                if(!newFile){
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
                var NotificationID = $scope.FinishedNotificationId
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
                }).then(function (response) {

                }, function (err) {});

            })
        };
        //////////////////////////////////////////////////////////////////
        $scope.clearGeneralSettings = () => {
            $scope.settings.waitingTimeThresholdD = $scope.settings.waitingTimeThreshold;
            $scope.settings.treatmentTimeThresholdD = $scope.settings.treatmentTimeThreshold;
        };
        $scope.currentServiceCallHistory = [];

        $scope.updateServiceCallStatus = (serviceCall, responseType) => {
            LeaderMESservice.customAPI("NotificationResponse", {
                sourceMachineID: serviceCall["NewestCall"]["SourceMachineID"],
                HistoryMsgID: serviceCall["GeneralInfo"]["NotificationID"],
                notificationType: serviceCall["NewestCall"]["ResponseTypeID"],
                ResTarget: 3,
                ResType: responseType,
                sourceUserID: LeaderMESservice.getUserID(),
                sourceUserName: userAuth.userName,
                targetUserID: serviceCall["NewestCall"]["TargetUserID"],
                targetUserName: serviceCall["NewestCall"]["TargetUserDisplayName"],
                Text: "",
                Title: "",
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
                    $scope.updateServiceCalls();
                }
            });
        };

        $scope.filterAndTranslateNotifications = () => {
            $scope.data.notifications = angular.copy($scope.data.notificationsOriginal);
            $scope.data.notifications = $scope.data.notifications
                .filter((notification) => {
                    let parameterDeviation = notification['TextKeysValues'].split(';')[1];
                    return ($scope.data.notificationsSettingsOBJ[notification['TopicKey']] && $scope.data.notificationsSettingsOBJ[notification['TopicKey']][parameterDeviation] && $scope.data.notificationsSettingsOBJ[notification['TopicKey']][parameterDeviation].isActive == true);
                })
                .map((notification) => {
                    let parameterDeviation = notification['TextKeysValues'].split(';')[1];
                    let translation = $filter("translate")(parameterDeviation);
                    let machineName;
                    let compareValue;
                    let parameterName;
                    let productName;
                    let technicianName;

                    switch (parameterDeviation) {
                        case "NoProgressMinFromStartShift": //works
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "SetupDurationMinActual": //--dint find one
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "SetupInjectionsCount": //works
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;

                        case "UnReportedStopsPC": //works
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;

                        case "RejectsPC": //--didnt find
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;

                        case "OpenEventDuration": //works
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            translation = translation.replace("%1$", machineName).replace("%2$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;

                        case "ProductionModeInjectionsCount": //works
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue); // console.log("new translation!!!!",translation);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "CycleTimeDeviation": //works
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue); // console.log("new translation!!!!",translation);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "ShortEventsFromProductionPC": //--didnt find
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue); // console.log("new translation!!!!",translation);
                            // console.log("new translation!!!!",translation);
                            break;

                        case "WorkerNotSigned": //--didnt find
                            // console.log("notification",notification);
                            // machineName=notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", compareValue); // console.log("new translation!!!!",translation);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "MachineParameterDeviation": //works
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            parameterName = $filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", machineName).replace("%2$", parameterName).replace("%3$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "RelativelyLongSetup": //works
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            productName = notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", productName).replace("%2$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "TooSlowProduction": //works
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            productName = notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", productName).replace("%2$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "ComparePSC10SameShifts": //didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "ComparePSD10SameShifts": //didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "ComparePSC50LastShifts": //didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "ComparePSD50LastShifts": //didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "TooLongServiceCall": //'works
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            technicianName = $filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", technicianName).replace("%2$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "UnrespondedServiceCall": //--didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            technicianName = $filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", technicianName).replace("%2$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "TooLongShiftChangeSameShiftType": //--didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            // technicianName=$filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "TooLongShiftChange": //--didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            // compareValue=notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            // technicianName=$filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", machineName);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "JobAboutToFinish": //--didnt find
                            // console.log("notification",notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            // technicianName=$filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", machineName).replace("%2$", compareValue);
                            // console.log("new translation!!!!",translation);
                            break;
                        case "InjectionsPCForNextMaintenance": //--didnt find
                            console.log("notification", notification);
                            machineName = notification['TextKeysValues'].split(';')[3];
                            compareValue = notification['TextKeysValues'].split(';')[5];
                            // productName=notification['TextKeysValues'].split(';')[13]
                            // parameterName=$filter("translate")(notification['TextKeysValues'].split(';')[11]);
                            // technicianName=$filter("translate")(notification['TextKeysValues'].split(';')[17]);
                            translation = translation.replace("%1$", machineName).replace("%2$", compareValue);
                            console.log("new translation!!!!", translation);
                            break;
                    }
                    notification.Text = translation;
                    return notification;
                });
        }

        $scope.polishNotifications = () => {

            $scope.filterAndTranslateNotifications();

            $scope.data.topicsNotification = {};
            $scope.data.machineNotification = {};

            $scope.data.notificationTopics.map((notification) => {
                notification.firstNotification = "";
                notification.data = [];
                notification.count = 0;
                notification.hasCheckedSubTopic = true;
                return notification;
            });


            if (!$scope.data.notifications.length) {
                $scope.data.notifications = angular.copy($scope.data.notificationsOriginal);
            }
            angular.forEach($scope.data.notifications, (notification) => {

                if (!$scope.data.topicsNotification[notification['TopicKey']]) {
                    $scope.data.topicsNotification[notification['TopicKey']] = [];
                }

                $scope.data.topicsNotification[notification['TopicKey']].push(notification);


                let sourceMachineID;
                if (!notification['SourceMachineID'] || notification['SourceMachineID'] == '') {
                    sourceMachineID = 0
                } else {
                    sourceMachineID = notification['SourceMachineID'];
                }

                if (!$scope.data.machineNotification[sourceMachineID]) {
                    $scope.data.machineNotification[sourceMachineID] = {
                        notifications: [],
                        count: 0
                    };
                }
                $scope.data.machineNotification[sourceMachineID].notifications.push(notification);
            });

            $scope.data.machineNotificationArr = Object.values($scope.data.machineNotification);


            $scope.data.notificationTopics.map((notification) => {
                // console.log($scope.data.topicsNotification[notification.key])
                // if (!$scope.data.topicsNotification[notification.key]) {
                if (!$scope.data.notificationsSettingsOBJ[notification['key']]) {
                    notification.checked = false;
                    notification.checkedDemi = false;
                    notification.hasCheckedSubTopic = false;
                    notification.active = false;
                    return notification;
                }
                notification.checked = true;
                notification.checkedDemi = true;
                notification.hasCheckedSubTopic = false;

                // console.log("$scope.data.notificationsSettingsOBJ[notification['key']]",$scope.data.notificationsSettingsOBJ[notification['key']]);
                //trying to capture false checked sub topic
                for (let subTopic in $scope.data.notificationsSettingsOBJ[notification['key']]) {
                    // if($scope.data.notificationsSettingsOBJ[notification['key']][subTopic].isActive==false){
                    //     console.error("found isActive==false,subTopic:",subTopic);
                    //
                    // }
                    notification.checked = notification.checked && $scope.data.notificationsSettingsOBJ[notification['key']][subTopic].isActive;
                    notification.checkedDemi = notification.checkedDemi && $scope.data.notificationsSettingsOBJ[notification['key']][subTopic].isActive;
                    notification.hasCheckedSubTopic = notification.hasCheckedSubTopic || $scope.data.notificationsSettingsOBJ[notification['key']][subTopic].isActive;
                }
                let topicsSorted = [];
                if ($scope.data.topicsNotification[notification.key]) {
                    topicsSorted = angular.copy($scope.data.topicsNotification[notification.key]?.sort(
                        (a, b) => new Date(b["SentTime"]) - new Date(a["SentTime"])
                    ));
                }

                notification.firstNotification = topicsSorted[0];
                notification.data = topicsSorted;
                notification.count = topicsSorted.length;
                return notification;
            });

            $scope.data.notificationTopics.sort(
                (a, b) => {
                    if (!a.firstNotification || !a.firstNotification["SentTime"]) {
                        if (!b.firstNotification || !b.firstNotification["SentTime"])
                            return 0;
                        return 1;
                    }

                    if (!b.firstNotification || !b.firstNotification["SentTime"]) {
                        return -1;
                    }
                    return (new Date(b.firstNotification["SentTime"]) - new Date(a.firstNotification["SentTime"]))
                })

            for (let machine in $scope.data.machineNotification) {
                $scope.data.machineNotification[machine].count = $scope.data.machineNotification[machine].notifications.length;
                $scope.data.machineNotification[machine].notifications = $scope.data.machineNotification[machine].notifications.sort(
                    (a, b) => new Date(b["SentTime"]) - new Date(a["SentTime"])
                );

            }
            $scope.data.machineNotificationArr = $scope.data.machineNotificationArr.map((machine) => {
                machine.count = machine.notifications.length;
                return machine;
                machine.notifications = machine.notifications.sort((a, b) => new Date(b["SentTime"]) - new Date(a["SentTime"]));
            }).sort((a, b) => new Date(b.notifications[0]["SentTime"]) - new Date(a.notifications[0]["SentTime"]));

            // console.log("updated machine array",$scope.data.machineNotificationArr);

            $scope.data.numberOfNotifications = $scope.data.notifications.length;
        }

        $scope.getTechnicians = () => {
            LeaderMESservice.customAPI("GetAllTechnicians", {}).then(function (res) {
                $scope.data.technicians = angular.copy(res["AllTechnicians"]);
            });

            LeaderMESservice.customAPI("GetUserServiceCallsSettings", {}).then(function (res) {
                angular.forEach(res.ResponseDictionaryDT.settings, (setting) => {
                    $scope.data.serviceCallsSettings[setting.KeyName] = setting;
                    if (!setting.Value) {
                        $scope.data.serviceCallsSettings[setting.KeyName].Value = setting.DefaultValue;
                    }
                    $scope.data.serviceCallsSettings[setting.KeyName].DemiValue = $scope.data.serviceCallsSettings[setting.KeyName].Value;
                });
            });

        };

        $scope.changeTech = (tech, data) => {

            LeaderMESservice.customAPI('ReAssignTechnicianCall', {
                "NotificationID": data.selectedServiceCallNotifcationID,
                "NewTechnicianUserID": tech.ID
            }).then(response => {
                // $scope.updateNotifications();
                $scope.data.selectedServiceCallTo = tech.DisplayName;
                $scope.updateServiceCalls();
                // $scope.updateServiceCallStatus(serviceCall,type);
            })
        }

        $scope.getSqlDateFormat = (year, month, day, hours, mins, secs) => {
            if (year) {
                return year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs
            } else {
                let nowDate = new Date();
                let year = nowDate.getFullYear();
                let month = nowDate.getMonth() + 1;
                let day = nowDate.getDate();

                let hours = nowDate.getHours();
                let mins = nowDate.getMinutes();
                let secs = nowDate.getSeconds();
                return year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs
            }



        }

        $scope.fetchNotifications = () => {
            if (!shiftService.shiftData.Machines) {
                $timeout(function () {
                    $scope.fetchNotifications();
                }, 1000 * 3);
                return false;
            }

            if ($scope.settings.notificationsLoaded || $scope.settings.isLoadingNotifications) {
                return false;
            }

            $scope.settings.isLoadingNotifications = true;

            let startDateToFilter;
            let endDateToFilter;
            let thisShiftDate = $scope.shiftData.currentShiftInfo.StartTime;
            let thisShiftSplit = thisShiftDate.split("/");
            let thisShiftDay = thisShiftSplit[0];
            let thisShiftMonth = thisShiftSplit[1];
            let thisShiftYear = thisShiftSplit[2].split(" ")[0];
            let thisShiftRight = thisShiftDate.split(" ")[1].split(":");

            //sort by shift date

            switch ($scope.shiftData.selectedTab) {
                case 4: //current shift
                    startDateToFilter = thisShiftYear + '-' + (thisShiftMonth) + '-' + thisShiftDay + ' ' + thisShiftRight[0] + ':' +
                        thisShiftRight[1] + ':' + thisShiftRight[2];
                    endDateToFilter = $scope.getSqlDateFormat();
                    break;
                case 6: //Last shift
                    let lastShiftStartDate = $scope.shiftData.LastShiftSartDate;
                    let lastShiftSplitL = lastShiftStartDate.split("T")[0];
                    let lastShiftSplitR = lastShiftStartDate.split("T")[1];
                    let prime = lastShiftSplitL.split("-");
                    let minor = lastShiftSplitR.split(":");
                    let year = prime[0];
                    let month = prime[1];
                    let day = prime[2];
                    let hour = minor[0];
                    let minutes = minor[1];
                    let secs = minor[2];

                    startDateToFilter = $scope.getSqlDateFormat(year, month, day, hour, minutes, secs);
                    endDateToFilter = $scope.getSqlDateFormat(thisShiftYear, thisShiftMonth, thisShiftDay, thisShiftRight[0], thisShiftRight[1], thisShiftRight[2]);
                    break;
                case 3: //Last 24
                    let firstShift = $scope.shiftData.firstShiftIn24Hours.StartTime;
                    let lastShift = $scope.shiftData.lastShiftIn24Hours.StartTime;
                    let firstSplitL = firstShift.split("T")[0];
                    let firstSplitR = firstShift.split("T")[1];
                    let prime24 = firstSplitL.split("-");
                    let minor24 = firstSplitR.split(":");
                    let year24 = prime24[0];
                    let month24 = prime24[1];
                    let day24 = prime24[2];
                    let hour24 = minor24[0];
                    let minutes24 = minor24[1];
                    let secs24 = minor24[2];
                    startDateToFilter = $scope.getSqlDateFormat(year24, month24, day24, hour24, minutes24, secs24);
                    endDateToFilter = $scope.getSqlDateFormat();
                    break;
                case 2: //custom
                    let char;
                    let firstCustom = $scope.shiftData.customRange.startDate;
                    let lastCustom = $scope.shiftData.customRange.endDate;
                    if(firstCustom.indexOf("T") > -1)
                    {
                        char = "T"
                    }
                    else
                    {
                        char = " "
                    }
                    let firstCustomSplitL = firstCustom?.split(char)[0];
                    let lastCustomSplitL = lastCustom?.split(char)[0];
                    let firstCustomSplitR = firstCustom?.split(char)[1];
                    let lastCustomSplitR = lastCustom?.split(char)[1];
                    let primeFC = firstCustomSplitL?.split("-");
                    let primeLC = lastCustomSplitL?.split("-");
                    let minorFC = firstCustomSplitR?.split(":");
                    let minorLC = lastCustomSplitR?.split(":");
                    let yearFC = primeFC[0];
                    let yearLC = primeLC[0];
                    let monthFC = primeFC[1];
                    let monthLC = primeLC[1];
                    let dayFC = primeFC[2];
                    let dayLC = primeLC[2];
                    let hourFC = minorFC[0];
                    let hourLC = minorLC[0];
                    let minutesFC = minorFC[1];
                    let minutesLC = minorLC[1];
                    let secsFC = minorFC[2];
                    let secsLC = minorLC[2];
                    startDateToFilter = $scope.getSqlDateFormat(yearFC, monthFC, dayFC, hourFC, minutesFC, secsFC);
                    endDateToFilter = $scope.getSqlDateFormat(yearLC, monthLC, dayLC, hourLC, minutesLC, secsLC);
                    break; 
            
            }

            let body = {
                "sourceMachineID": 0,
                "sourceMachines": shiftService.shiftData.Machines.map(machine => machine.machineID),
                "applicationID": 3,
                "startDate": startDateToFilter,
                "endDate": endDateToFilter
            }
            // console.log("fetching nots");
            LeaderMESservice.customAPI('GetNotificationHistory', body).then(function (response) {

                $scope.settings.isLoadingNotifications = false;
                if (!response["notification"]) {
                    return;
                }
                $scope.settings.notificationsLoaded = true;
                $scope.data.topicsNotification = {};
                $scope.data.machineNotification = {};
                $scope.data.notificationsOriginal = angular.copy(response["notification"]);

                $scope.polishNotifications();
            });

            return true;
        };

        $scope.clearCallFeilds = function(){
            $scope.data.selectedTechnician="";
            $scope.data.selectedMachine="";
            $scope.data.description="";
        }
        $scope.callTechnician = function () {
            if ($scope.data.selectedMachine == 0 || $scope.data.selectedTechnician == 0) {
                return;
            }
            $scope.settings.isCallingTehchnician = true;
            LeaderMESservice.customAPI("CallForTechnicianNotification", {
                targetUserID: $scope.data.selectedTechnician.ID,
                sourceUserName: userAuth.userName,
                sourceMachineID: $scope.data.selectedMachine.machineID,
                SourceWorkerID: LeaderMESservice.getUserID(),
                targetUserName: $scope.rtl ? $scope.data.selectedTechnician.DisplayHName : $scope.data.selectedTechnician.DisplayName,
                Text: "Service call has been sent by operator " + userAuth.userName + " from machine " + $scope.data.selectedMachine.machineName,
                Title: "Operator " + userAuth.userName,
                additionalText: $scope.data.description,
            }).then(function (response) {
                $scope.settings.isCallingTehchnician = false;
                if (response.error) {
                    notify({
                        message: response.error.ErrorCode + " - " + response.error.ErrorDescription,
                        classes: "alert-danger",
                        templateUrl: "views/common/notify.html",
                    });
                } else {
                    notify({
                        message: $filter("translate")("CALLED_SUCCESSFULLY"),
                        classes: "alert-success",
                        templateUrl: "views/common/notify.html",
                    });
                    $scope.updateServiceCalls();
                    $scope.views.serviceOpenCallsMainMenu = true;
                    $scope.views.serviceOpenCallsSubMenu = false;
                    $scope.views.addServiceCall = false;

                }
            });
        };

        $scope.currentServiceCallHistory = [];

        $scope.updateServiceCalls = () => {
            $scope.settings.serviceCallsLoaded = false;
            let body = {
                machineList: shiftService.shiftData.Machines.map((machine) => machine.machineID),
                waitingTimeThreshold: $scope.settings.waitingTimeThreshold,
                serviceTimeThreshold: $scope.settings.treatmentTimeThreshold,
            };

            LeaderMESservice.customAPI("GetOpenCalls", body).then(function (response) {
                if (!response["ServiceCalls"]) {
                    $scope.settings.isLoading = false;
                    $scope.updateServiceCalls();
                    return;
                }
                $scope.data.numberOfOpenServiceCalls = Object.keys(response["ServiceCalls"]).length;
                $scope.data.numberOfDelayedServiceCalls = 0;
                angular.forEach(response["ServiceCalls"], (call) => {
                    if (call["isExcepted"]) $scope.data.numberOfDelayedServiceCalls++;
                });
                $scope.settings.serviceCallsLoaded = true;
                $scope.serviceCalls = Object.values(response["ServiceCalls"]).sort((a, b) => new Date(b["NewestCall"]["SentTime"]) - new Date(a["NewestCall"]["SentTime"]));
                $scope.settings.isLoading = false;
            });
        };

        $scope.fetchNotificationsSettings = () => {
            LeaderMESservice.customAPI("GetUserNotificationsSettings", {}).then(function (response) {
                $scope.data.notificationsSettingsOriginal = angular.copy(response.Topics);
                angular.forEach(response.Topics, (topic) => {
                    $scope.data.notificationsSettingsOBJ[topic.Key] = {};
                    angular.forEach(topic.Notifications, (notification) => {
                        if (notification.IsActive == true || notification["UserNotificationSettingID"] != 0) {
                            $scope.data.notificationsSettingsOBJ[topic.Key][notification.NameKey] = {
                                userNotificationSettingID: notification["UserNotificationSettingID"],
                                name: notification.Name,
                                key: notification.NameKey,
                                isActive: notification.IsActive,
                                isActiveDemi: notification.IsActive,
                                notification: notification
                            };
                        }
                    });

                    if (Object.keys($scope.data.notificationsSettingsOBJ[topic.Key]).length == 0) {
                        delete $scope.data.notificationsSettingsOBJ[topic.Key];
                    }
                })
            });
        }

        $scope.fetchOpenCalls = () => {
            if (!shiftService.shiftData.Machines) {
                $timeout(function () {
                    $scope.fetchOpenCalls();
                }, 1000 * 3);
                return false;
            }

            if ($scope.settings.serviceCallsLoaded || $scope.settings.isLoading) {
                return false;
            }

            $scope.settings.isLoading = true;

            let body = {
                machineList: shiftService.shiftData.Machines.map((machine) => machine.machineID),
                waitingTimeThreshold: $scope.settings.waitingTimeThreshold,
                serviceTimeThreshold: $scope.settings.treatmentTimeThreshold,
            };

            LeaderMESservice.customAPI("GetOpenCalls", body).then(function (response) {
                if (!response["ServiceCalls"]) {
                    $scope.settings.isLoading = false;
                    $scope.fetchOpenCalls();
                    return;
                }
                $scope.data.numberOfOpenServiceCalls = Object.keys(response["ServiceCalls"]).length;
                $scope.data.numberOfDelayedServiceCalls = 0;
                angular.forEach(response["ServiceCalls"], (call) => {
                    if (call["isExcepted"]) $scope.data.numberOfDelayedServiceCalls++;
                });
                $scope.settings.serviceCallsLoaded = true;
                $scope.serviceCalls = Object.values(response["ServiceCalls"]).sort((a, b) => new Date(b["NewestCall"]["SentTime"]) - new Date(a["NewestCall"]["SentTime"]));
                $scope.settings.isLoading = false;
            });

            return true;
        };

        $scope.clearNotificationsPassData = () => {
            $scope.data.notificationTopics.map((notification) => {
                notification.firstNotification = "";
                notification.data = [];
                notification.count = 0;
                return notification;
            })
            $scope.settings.notificationsLoaded = false;
            $scope.settings.serviceCallsLoaded = false;
            $scope.settings.isLoading = false;
        }

        $timeout(function () {
            $scope.getTechnicians();
            $scope.fetchOpenCalls();
            $scope.fetchNotificationsSettingsAndPolish(true);
        }, 1000 * 10);

        $rootScope.$on('shiftChange', () => {
            $scope.clearNotificationsPassData();
            $scope.fetchOpenCalls();
            $scope.fetchNotificationsSettingsAndPolish(true);
        });
    };

    return {
        restrict: "E",
        templateUrl: "js/components/serviceCalls/serviceCalls.html",
        link: function (scope) {
            scope.$on("$destroy", function () {
                $timeout(function () {
                    window.dispatchEvent(new Event("resize"));
                });
            });
        },
        scope: {},
        controller: controller,
        controllerAs: "serviceCallsCtrl",
    };
}

angular.module("LeaderMESfe").directive("serviceCalls", serviceCalls);