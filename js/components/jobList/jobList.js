function jobList() {

    const template = 'js/components/jobList/jobList.html';

    const controller = function ($scope, LeaderMESservice, $timeout, toastr, $filter) {

        const jobListCtrl = this;
        const upperScope = $scope;
        $scope.maxNumOfPendingJobs = 7;
        jobListCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        jobListCtrl.jobListData = {};

        /**
         * Removes a pending job and adds it to all jobs.
         * @param job
         * @param index
         */
        $scope.removePendingJob = function (job, index) {
            $scope.allJobs.unshift(Object.assign({}, job));
            $scope.remainingForPending++;
            $scope.pendingJobs.splice(index, 1);
        };

        jobListCtrl.save = function () {
            let targetMachines = [];

            if (jobListCtrl.jobListData.applyTo == "selectMachines") {
                targetMachines = jobListCtrl.jobListData.selectedMachineType.Machines.filter(function (i) {
                    return i.selected
                }).map(function (i) {
                    return i.Id
                });
            } else if (jobListCtrl.jobListData.applyTo == "allMachines") {
                targetMachines = jobListCtrl.jobListData.selectedMachineType.Machines.map(function (i) {
                    return i.Id
                });
            } else {
                targetMachines = [jobListCtrl.jobListData.selectedMachine.Id];
            }
            const customFields = upperScope.pendingJobs.filter(it => !it.custom);
            const customParams = upperScope.pendingJobs.filter(it => it.custom);
            customParams.forEach(customParam => {
                const index = _.findIndex(upperScope.pendingJobs,{id : customParam.id});
                customParam.DisplayOrder = index;
            });
            LeaderMESservice.customAPI('SaveJobListCustomization', {
                TargetMachines: targetMachines,
                JobCustomParam: customParams.map(it => ({ParamID: it.id,ListItemID: 0,DisplayOrder: it.DisplayOrder})),
                CustomFields: customFields.map(function (i) {
                    return i.name
                })
            }).then(
                function (res) {
                    toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                }
            )
        };

        /**
         * adds a pending job if size didnt exceed maxNumOfPendingJobs, and removes it from all jobs
         * @param job - the job to add
         */
        $scope.addJob = function (job) {
            if ($scope.pendingJobs.length < $scope.maxNumOfPendingJobs) {
                //add to pending jobs
                $scope.pendingJobs.push(job);
                upperScope.remainingForPending--;
                //remove from all jobs
                $scope.allJobs = $scope.allJobs.filter(function (i) {
                    return i.name != job.name
                });
            }
        };


        getDisplayHName = function(i) {
            const found =_.find($scope.allJobs, {name: i});

            return  found ? found.displayhname : ''
        };

        getDisplayEName = function (i) {
            const found =_.find($scope.allJobs, {name: i});
            return  found ? found.displayename : ''
        };

        LeaderMESservice.customAPI('GetJobCustomParameters',{}).then(response => {
            $scope.customParams = response && response.JobParams || [];
          });
      
        jobListCtrl.updateMachineData = function () {
            $scope.loading = true;

            LeaderMESservice.customGetAPI('GetJobListCustomizationFields').then(function (res) {
                $scope.allJobs = res.ResponseList;
                $scope.allJobs = $scope.allJobs.concat($scope.customParams.map(it => ({
                    displayename: it.DisplayName,
                    displayhname: it.DisplayName,
                    name: it.Name,
                    id: it.ID,
                    custom: true,
                })))
                const promises = [];
                promises.push(LeaderMESservice.customAPI('GetJobListCustomization',
                {
                    MachineID: jobListCtrl.jobListData.selectedMachine.Id
                }));
                promises.push(LeaderMESservice.customAPI('GetPendingJobsMachineCustomParameters',
                    {"machine":{"Id":jobListCtrl.jobListData.selectedMachine.Id}}
                ));
                //GetPendingJobsMachineCustomParameters
                Promise.all(promises).then(function (response) {
                    const res = response[0];
                    $scope.loading = false;
                    const customData = response[1] && response[1].ResponseDataTable &&
                        response[1].ResponseDataTable[0] || [];
                    if (!res.ResponseList) {
                        res.ResponseList = []
                    }
                    $scope.pendingJobs = res.ResponseList.length && res.ResponseList[0] && res.ResponseList[0].CustomizeFields ? _.map(res.ResponseList[0].CustomizeFields.split(","), function (i) {
                        return {name: i, displayename: getDisplayEName(i), displayhname: getDisplayHName(i)}
                    }) : [];

                    customData.forEach((customParam, index) => {
                        const customFound = _.find($scope.customParams,{ID : customParam.ParamID});
                        const item = {
                            displayename: customParam.DisplayName,
                            displayhname: customParam.DisplayName,
                            name: customFound.Name || customParam.DisplayName,
                            id: customParam.ParamID,
                            custom: true,
                        };
                        if (customParam.DisplayOrder >= 0) {
                            $scope.pendingJobs.splice(customParam.DisplayOrder, 0, item);
                        }
                        else {
                            $scope.pendingJobs.push(item);
                        }
                    });

                    $scope.remainingForPending = $scope.maxNumOfPendingJobs - $scope.pendingJobs.length;

                    angular.forEach($scope.pendingJobs, function (job) {

                        const foundIndex = $scope.allJobs.findIndex(i => i.name === job.name);

                        if (foundIndex > -1) {
                            $scope.allJobs.splice(foundIndex,1);
                        }
                    })
                });
            });
        };

        $scope.getNumberOfEmptyPendingJobs = function () {
            return new Array($scope.remainingForPending);
        };

    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {},
        controller: controller,
        controllerAs: "jobListCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('jobList', jobList);
