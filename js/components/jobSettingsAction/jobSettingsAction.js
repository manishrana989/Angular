function jobSettingsAction() {

    var controller = function ($scope, $compile, LeaderMESservice, actionService, $modal) {
        var jobSettingsActionCtrl = this;
        console.log($scope.id);
        console.log($scope.close);
        console.log($scope.jobData);
        jobSettingsActionCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        
        jobSettingsActionCtrl.data = {};

        LeaderMESservice.customAPI('GetJobDefinition',{ID : $scope.id}).then(response => {
            jobSettingsActionCtrl.jobDefintions = response && response.ResponseDictionaryDT && 
                response.ResponseDictionaryDT.AllJobDef || [];
                jobSettingsActionCtrl.data.erpJobDefID = response && response.ResponseDictionaryDT && 
                response.ResponseDictionaryDT.JobDef && response.ResponseDictionaryDT.JobDef[0] &&
                response.ResponseDictionaryDT.JobDef[0].ERPJobDef || null;
        });
        
        LeaderMESservice.customAPI('GetSetupTypeAndDuration',{ID : $scope.id}).then(response => {
            jobSettingsActionCtrl.setupTypes = response && response.ResponseDictionaryDT && 
                response.ResponseDictionaryDT.SetupType || [];
            const setupData = response && response.ResponseDictionaryDT && 
                response.ResponseDictionaryDT.JobSetupTypeAndDuration && response.ResponseDictionaryDT.JobSetupTypeAndDuration[0] &&
                response.ResponseDictionaryDT.JobSetupTypeAndDuration[0] || {};
            jobSettingsActionCtrl.data.setupDuration = setupData.SetupDurationMinStandard;
            jobSettingsActionCtrl.data.setupType = setupData.PlannedSetupType;
        });

        LeaderMESservice.customAPI('GetSCHDates',{ID : $scope.id}).then(response => {
            jobSettingsActionCtrl.data.closingDate = response && response.Response && response.Response.ClosingDate || null;
            jobSettingsActionCtrl.data.endTimeRequest = response && response.Response && response.Response.EndTimeRequest || null;
            jobSettingsActionCtrl.data.fixedStartTimeTarget = response && response.Response && response.Response.FixedStartTimeTarget || null;
            jobSettingsActionCtrl.data.planningApprovedDate = response && response.Response && response.Response.PlanningApprovedDate || null;
        });

        LeaderMESservice.customAPI('GetUnitsTarget',{ID : $scope.id}).then(response => {
            jobSettingsActionCtrl.data.unitsTarget = response && response.Response && response.Response.Unitstarget;
        });

        const convertDateToString = (momentDate) => {
            if (momentDate && momentDate.format) {
                return `${momentDate.format('YYYY-MM-DD HH:mm:ss')}.000`;
            }
            return null;
        };

        jobSettingsActionCtrl.saveSettings = () => {
            console.log(jobSettingsActionCtrl.data);
            const requests = [];
            requests.push(LeaderMESservice.customAPI('UpdateJobDef',
                {
                    "job": {
                        "ID":$scope.id,
                        "ERPJobDefID":jobSettingsActionCtrl.data.erpJobDefID || 0
                    }
                }));
            requests.push(LeaderMESservice.customAPI('UpdateSetupTypeAndDuration',
                {
                    job: {
                        ID : $scope.id,
                        PlannedSetupType : jobSettingsActionCtrl.data.setupType,
                        SetupDurationMinStandard : jobSettingsActionCtrl.data.setupDuration,
                    }
                }
            ));
            requests.push(LeaderMESservice.customAPI('UpdateUnitsTarget',
                {
                    "job": {
                        "ID": $scope.id,
                        "UnitsTarget":jobSettingsActionCtrl.data.unitsTarget,
                    }
                }));
            requests.push(LeaderMESservice.customAPI('UpdateSCHDates',
                {
                    "job": {
                        "ID": $scope.id,
                        "FixedStartTimeTarget": convertDateToString(jobSettingsActionCtrl.data.fixedStartTimeTarget),
                        "EndTimeRequest": convertDateToString(jobSettingsActionCtrl.data.endTimeRequest),
                        "ClosingDate": convertDateToString(jobSettingsActionCtrl.data.closingDate),
                        "PlanningApprovedDate": convertDateToString(jobSettingsActionCtrl.data.planningApprovedDate),
                    }
                }));
            Promise.all(requests).then((data) => {
                $scope.close(true);
            });
        };

    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/jobSettingsAction/jobSettingsAction.html',
        scope: {
            id:'=',
            close:'=',
            name: '=',
            jobData: '=',
        },
        controller: controller,
        controllerAs: 'jobSettingsActionCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('jobSettingsAction', jobSettingsAction);