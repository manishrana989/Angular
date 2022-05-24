angular.module('LeaderMESfe')
    .factory('GanttSchedulerSingleMachioneService', 
        function (LeaderMESservice, $timeout, GanttSchedulerSingleMachineTimeLineService,
            GanttSchedulerSingleMachineCalendarService, $filter, SweetAlert,AuthService) {

        var userDateFormat = AuthService.getUserDateFormat();

        var updateCode = function($scope,ganttSchedulerCtrl,$element){
            ganttSchedulerCtrl.singleMachineGanttView = null;
            ganttSchedulerCtrl.singleMachineCalendarView = null;
            ganttSchedulerCtrl.singleMachineViewResourceToggle = 'gantt';

            ganttSchedulerCtrl.singleViewOptions = [
                {
                    label : 'GANTT',
                    value : 'gantt',
                    icon: 'images/gantt/gannt.svg'
                },
                {
                    label : 'CALENDAR',
                    value : 'calendar',
                    icon: 'images/gantt/callendar.svg'
                }
            ]

            ganttSchedulerCtrl.ganntSingleMachineOptions = null;
            ganttSchedulerCtrl.refreshSingleModeData = function(mode){
                ganttSchedulerCtrl.buildSingleMachineGantt(mode);
            };

            ganttSchedulerCtrl.getDataFromServer = function(mode){
                return new Promise(function(resolve, reject){
                    if (mode == 'switch'){
                        resolve();
                        return;
                    }
                    ganttSchedulerCtrl.ganntSingleMachineOptions = null;
                    ganttSchedulerCtrl.jobRequestInProgress = true;
                    var machineIdTemp = ganttSchedulerCtrl.singleMachine.machineId;
                    LeaderMESservice.customAPI('ScheduleJobsForMachine',{MachineID : ganttSchedulerCtrl.singleMachine.machineId}).then(function(response){
                        // _.remove(ganttSchedulerCtrl.setupEvents,{resourceId : machineIdTemp});
                        // _.remove(ganttSchedulerCtrl.allJobEvents,{resourceId : machineIdTemp});
                        // const events = ganttSchedulerCtrl.gantt.getEvents();
                        // events.forEach(event => {
                        //     if (event.extendedProps.MachineID === machineIdTemp){
                        //         event.remove();
                        //     }
                        // });
                        // var resource = ganttSchedulerCtrl.gantt.getResourceById(machineIdTemp);
                        // var resourceTemp = {
                        //     id: resource.id,
                        //     title:resource.title,
                        //     order1: resource.extendedProps.order1,
                        //     order2: resource.extendedProps.order2,
                        //     MachineStatus: resource.extendedProps.MachineStatus,
                        //     MachineName: resource.extendedProps.MachineName,
                        //     Id: resource.extendedProps.Id,
                        //     DisplayOrder: resource.extendedProps.DisplayOrder,
                        //     LineID: resource.extendedProps.LineID
                        // }
                        // resource.remove();
                        // ganttSchedulerCtrl.gantt.addResource(resourceTemp);
                        // console.log(resourceTemp);
                        // console.log(resource);
                        // if (events){
                        //     events.forEach(function(event){
                        //         if (event.extendedProps.shiftEvent || event.extendedProps.machineEvent){
                        //             return;
                        //         }
                        //         event.remove();
                        //     })
                        // }
                        var resourceIdsSorted = _.map(response.JobsForMachine,(job, index) => {
                            if (job.ID === 0){
                                return `0_${index}`;
                            }
                            return job.ID;
                        });
                        ganttSchedulerCtrl.singleMachineSetupEvents = [];
                        var setupJobEventsCopy = [];
                        var jobEventsCopy = [];
                        ganttSchedulerCtrl.singleMachineEvents = [];
                        ganttSchedulerCtrl.singleMachineResources = [];
                        ganttSchedulerCtrl.singleMachineJobEvents = _.map(response.JobsForMachine,function(jobEvent,index){
                            ganttSchedulerCtrl.getMachineJobEventObject(jobEvent,index,machineIdTemp,false,false);
                            jobEvent.startTimeTemp = new Date(jobEvent.StartTime);
                            jobEvent.endTimeTemp = new Date(jobEvent.EndTime);
                            jobEventsCopy.push(angular.copy(jobEvent));
                            if (jobEvent.ID === 0){
                                jobEvent.resourceId = `0_${index}`;
                            }
                            else {
                                jobEvent.resourceId = jobEvent.ID;
                            }
                            if (jobEvent.Setup > 0){
                                var setupJob = angular.copy(jobEvent);
                                var temp = new Date(setupJob.start);
                                temp.setMinutes(temp.getMinutes() + jobEvent.Setup);
                                setupJob.id += "setup";
                                setupJob.setupJob = true;
                                setupJob.classNames.push("jobSetupEvent");
                                setupJob.end = moment(temp).format("YYYY-MM-DD HH:mm:ss");
                                setupJob.endTimeTemp = new Date(setupJob.end);
                                ganttSchedulerCtrl.singleMachineSetupEvents.push(setupJob);
                                setupJobEventsCopy.push(angular.copy(setupJob));
                                setupJobEventsCopy[setupJobEventsCopy.length - 1].resourceId = machineIdTemp;
                            }
                            // TODO actual end date job
                            if (jobEvent.EndTimeStandard && !jobEvent.NoProduction){
                                var endTimeStandard = angular.copy(jobEvent);
                                endTimeStandard.id += "actualEndTime";
                                endTimeStandard.actualEndTime = true;
                                endTimeStandard.classNames.push("actualEndTimeEvent");
                                endTimeStandard.start = moment(endTimeStandard.EndTimeStandard).format("YYYY-MM-DD HH:mm:ss");
                                endTimeStandard.backgroundColor = '#6969669';
                                ganttSchedulerCtrl.singleMachineSetupEvents.push(endTimeStandard);
                                setupJobEventsCopy.push(angular.copy(endTimeStandard));
                                setupJobEventsCopy[setupJobEventsCopy.length - 1].resourceId = machineIdTemp;

                            }
                            jobEvent.EventInJob.forEach(function(event){
                                if (_.findIndex(ganttSchedulerCtrl.singleMachineEvents,{id : event.EventID}) >= 0){
                                    return;
                                }
                                ganttSchedulerCtrl.buildMachineEvent(event, -1);
                                ganttSchedulerCtrl.singleMachineEvents.push(event);
                            });
                            var orderIndex = resourceIdsSorted.indexOf(jobEvent.resourceId);
                            resourceIdsSorted[orderIndex] = -10000000;
                            ganttSchedulerCtrl.singleMachineResources.push({
                                Id  : jobEvent.resourceId,
                                id : jobEvent.resourceId,
                                title : jobEvent.ID,
                                order : orderIndex + 1,
                                jobData : jobEvent,
                            });
                            return jobEvent;
                        });
                        // ganttSchedulerCtrl.allJobEvents = ganttSchedulerCtrl.allJobEvents.concat(jobEventsCopy);
                        // ganttSchedulerCtrl.setupEvents = ganttSchedulerCtrl.allJobEvents.concat(setupJobEventsCopy);
                        // ganttSchedulerCtrl.gantt.addEventSource({
                        //     events : jobEventsCopy
                        // });
                        // ganttSchedulerCtrl.gantt.addEventSource({
                        //     events : setupJobEventsCopy
                        // });
                        ganttSchedulerCtrl.singleMachineResources.unshift({
                            Id : -1,
                            id: -1,
                            title : $filter('translate')('EVENTS'),
                            order: 0
                        });
                        ganttSchedulerCtrl.jobRequestInProgress = false;
                        ganttSchedulerCtrl.recalculateEnabled = false;
                        resolve();
                    });
                });
            };

            ganttSchedulerCtrl.resetSingleMachineData = function(){
                ganttSchedulerCtrl.ganntSingleMachineOptions = null;
                ganttSchedulerCtrl.calendarResourceColumns = null;
                $timeout(function(){
                    $( ".single-machine-tooltip" ).remove();
                }, 1000);
            };

            ganttSchedulerCtrl.jobEventDeleteClick = function(jobID) {
                var job = _.find(ganttSchedulerCtrl.allJobEvents,{ID : jobID});
                if (job){
                    if ([1,2,3].indexOf(job.Status) >= 0){
                    $scope.openDeleteModal(job,$scope.cancelJob);
                    }
                    else if (job.Status == 11){
                    $scope.openDeleteModal(job,$scope.terminateJob);
                    }
                }
            };

            ganttSchedulerCtrl.buildSingleMachineGantt = function(mode){
                ganttSchedulerCtrl.getDataFromServer(mode).then(function(data){
                    ganttSchedulerCtrl.resetSingleMachineData();
                    if (ganttSchedulerCtrl.singleMachineViewResourceToggle === 'gantt'){
                        GanttSchedulerSingleMachineTimeLineService.updateCode($scope,ganttSchedulerCtrl,$element);
                    }
                    if (ganttSchedulerCtrl.singleMachineViewResourceToggle === 'calendar'){
                        GanttSchedulerSingleMachineCalendarService.updateCode($scope,ganttSchedulerCtrl,$element);
                    }
                }).catch(err => {
                    console.log(err);
                    ganttSchedulerCtrl.jobRequestInProgress = false;
                });
            }

            ganttSchedulerCtrl.recalculateJobs = function(){
                return new Promise(function(resolve,reject){
                    
                    var jobs = _.filter(ganttSchedulerCtrl.singleMachineResources,function(resource){
                        if (!resource.jobData){
                            return false;
                        }
                        return true;
                    });
                    jobs = _.map(jobs,function(resource,index){
                        return {
                            "JobOrder": index + 1,
                            "StartTime": resource.jobData.StartTime,
                            "EndTime":resource.jobData.EndTime,
                            "ID": resource.jobData.ID
                        }
                    });
                    ganttSchedulerCtrl.jobRequestInProgress = true;
                    LeaderMESservice.customAPI('SaveJobOrder',{jobs : jobs}).then(function(response){
                        ganttSchedulerCtrl.jobRequestInProgress = false;    
                        ganttSchedulerCtrl.refreshData(ganttSchedulerCtrl.singleMachine.machineId);
                        resolve(true);
                    });
                });
            }

            ganttSchedulerCtrl.goBackToMainComp = function(){
                ganttSchedulerCtrl.singleMachine = null;
                ganttSchedulerCtrl.action = null;
                ganttSchedulerCtrl.ganntSingleMachineOptions = null;
                ganttSchedulerCtrl.ganttHeaderParams.coloringField = null;
                ganttSchedulerCtrl.ganttHeaderParams.coloringValue = null;
                ganttSchedulerCtrl.renderMainComp();
            }

            ganttSchedulerCtrl.openMainComp = function(){
                if(!ganttSchedulerCtrl.recalculateEnabled){
                    ganttSchedulerCtrl.goBackToMainComp();
                    return;
                }
                //["error", "warning", "info", "success", "input", "prompt"]
                SweetAlert.swal({
                    title: $filter('translate')('ATTENTION'),
                    text: $filter('translate')('THE_CHANGES_MADE_HAVE_NOT_BEEN_SAVED'),
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "green",
                    confirmButtonText: $filter('translate')("SAVE_NOW"),
                    cancelButtonText:  $filter('translate')("BACK"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    // imageUrl : "empty",
                    customClass :  (ganttSchedulerCtrl.rtl ? " swalRTL back-gantt" : "back-gantt")
                },
                function (isConfirm) {
                    if (isConfirm) {
                        ganttSchedulerCtrl.recalculateJobs().then(function(){
                            ganttSchedulerCtrl.goBackToMainComp();
                        });
                    }
                    else{
                        ganttSchedulerCtrl.goBackToMainComp();
                    }
                });
            }

            ganttSchedulerCtrl.singleMachineReorder = function(){
                var initialPos, finalPos;
                
                if (ganttSchedulerCtrl.reorderInitalized){
                    return;
                }
                ganttSchedulerCtrl.reorderInitalized = true;
                var _input = $(".ganttSchedulerContainer .ganttSingleMachine .fc-body .fc-resource-area table tbody tr.unsortable:first-child");
                $('.ganttSchedulerContainer .ganttSingleMachine .fc-body .fc-resource-area table tbody').before(_input);
                $(".ganttSchedulerContainer .ganttSingleMachine .fc-body .fc-resource-area table tbody").sortable({
                    axis: "y",
                    items: "> tr:not(.unsortable)",
                    filter : ".unsortable"
                    })
                    .disableSelection()
            
                    .on("sortstart", function(event, ui) {
                        initialPos = ui.item.index();
                    })
                    .on("sortupdate", function(event, ui) {
                        finalPos = ui.item.index();
                        if (finalPos == -1) return; // "sortupdate" gets called twice for an unknown reason. Second time with finalPos == -1
                        const jobId = ui.item[0].dataset.resourceId;
                        if (!jobId) {
                            return;
                        }
                        const index = _.findIndex(ganttSchedulerCtrl.singleMachineResources,{id : parseInt(jobId)});
                        if (index >= 0) {
                            if (initialPos < index){
                                finalPos = index - initialPos + finalPos;
                                initialPos = index;
                            }
                        }
                        else {
                            finalPos++;
                            initialPos++;
                        }
                        var tmpResources = [];
                        for (var i = 0; i < ganttSchedulerCtrl.singleMachineResources.length; i++) {
                            tmpResources.push(ganttSchedulerCtrl.singleMachineResources[i]);
                        }
                        
                        // reorder sorting to match
                        if (finalPos > initialPos) {
                            tmpResources[finalPos] = ganttSchedulerCtrl.singleMachineResources[initialPos];
                            tmpResources[finalPos].order = finalPos + 1;
                
                            for (var i = initialPos + 1; i <= finalPos; i++) {
                                //resources[i].sortOrder -= 1;
                                tmpResources[i - 1] = ganttSchedulerCtrl.singleMachineResources[i];
                                tmpResources[i - 1].order -= 1;
                            }
                        } else {
                            tmpResources[finalPos] = ganttSchedulerCtrl.singleMachineResources[initialPos];
                            tmpResources[finalPos].order = finalPos + 1;
                
                            for (var i = initialPos - 1; i >= finalPos; i--) {
                                //resources[i].sortOrder += 1;
                                tmpResources[i + 1] = ganttSchedulerCtrl.singleMachineResources[i];
                                tmpResources[i + 1].order += 1;
                            }
                        }
                
                        for (var i = 0; i < tmpResources.length; i++) {
                            ganttSchedulerCtrl.singleMachineResources[i] = tmpResources[i];
                            ganttSchedulerCtrl.singleMachineResources[i].order = i;
                        }
                        var currentEndTime = null;
                        ganttSchedulerCtrl.singleMachineResources.forEach(function(resource,index){
                            var resourceEvents =_.filter(ganttSchedulerCtrl.ganntSingleMachineOptions.events,{resourceId : resource.id,jobEvent : true});
                            if (index === 0 || index == 1){
                                if (resourceEvents.length > 0 && index == 1){
                                    currentEndTime = resourceEvents[0].end;
                                }
                                return;
                            }
                            if (resourceEvents.length == 0){
                                return;
                            }
                            resourceEvents.forEach(function(resourceEvent){
                                var currentEventDuration = resourceEvent.endTimeTemp - resourceEvent.startTimeTemp;
                                resourceEvent.start = currentEndTime;
                                resourceEvent.StartTime = currentEndTime;
                                var newEndTime = moment((new Date(currentEndTime)).getTime() + currentEventDuration).format("YYYY-MM-DD HH:mm:ss");
                                resourceEvent.end = newEndTime;
                                resourceEvent.EndTime = newEndTime;
                                resourceEvent.endTimeTemp = new Date(newEndTime);
                                resourceEvent.startTimeTemp = new Date(currentEndTime);
                            });
                            currentEndTime = resourceEvents[0].EndTime;
                        });
                        ganttSchedulerCtrl.ganttSingleMachine.removeAllEvents();
                        ganttSchedulerCtrl.ganttSingleMachine.addEventSource({
                            events : ganttSchedulerCtrl.ganntSingleMachineOptions.events
                        });
                        ganttSchedulerCtrl.ganttSingleMachine.refetchResources();
                        $timeout(function(){
                            ganttSchedulerCtrl.recalculateEnabled = true;
                        });
                    })
            }
        };

    return {
        updateCode : updateCode
    }
});