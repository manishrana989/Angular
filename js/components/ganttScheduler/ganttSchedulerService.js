angular.module('LeaderMESfe')
    .factory('GanttSchedulerService', function (LeaderMESservice, $filter, $timeout, $localStorage, $modal, SweetAlert, AuthService, notify) {
        
        var userDateFormat = AuthService.getUserDateFormat();

        var getAllJobEvents = function(body){
            return LeaderMESservice.customAPI('ScheduleJobsForDepartment',body);
        };

        var getAllEvents = function(start,end){
            return LeaderMESservice.customAPI('GetEventsForDepartment',{"DepartmentID":0 ,StartTime : start,EndTime : end});
        };
        var getFactoryShifts = function(){
            return LeaderMESservice.customAPI('GetShiftDefinitionForMachine',{});
        };
        
        var generalCode = function($scope,ganttSchedulerCtrl){

            ganttSchedulerCtrl.viewResourceToggle = 'gantt';

            ganttSchedulerCtrl.viewOptions = [
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

            const allMachinesPromise =  LeaderMESservice.customAPI('GetDepartmentMachine',{"DepartmentID":0});

            allMachinesPromise.then(function (response) {
                const allDepartments = _.forEach(response.DepartmentMachine, function (department) {
                    department.Value = _.uniq(department.Value, "Id");
                });
                ganttSchedulerCtrl.selectedMachines = [];
                ganttSchedulerCtrl.allDepartments = angular.copy(allDepartments);
                ganttSchedulerCtrl.enableReleaseJobDatesAction = false;
                ganttSchedulerCtrl.machinesSaveJobsGantt = [];
                ganttSchedulerCtrl.allDepartments.forEach(function(department){
                    let selected = 0;
                    department.Value.forEach(function(machine){
                        if (ganttSchedulerCtrl.firstLoadingData.machines.indexOf(machine.Id) >= 0){
                            machine.selected = true;
                            selected++;
                            ganttSchedulerCtrl.selectedMachines.push(machine.MachineName);
                            if (machine.IsSaveJobsGantt){
                                ganttSchedulerCtrl.enableReleaseJobDatesAction = true;
                                ganttSchedulerCtrl.machinesSaveJobsGantt.push(machine.Id);
                            }
                        }
                    });
                    if (department.Value.length === selected){
                        department.selected = true;
                    }
                });
            });
            ganttSchedulerCtrl.getAllMachines = function(){
                return new Promise((resolve,reject) => {
                    allMachinesPromise.then(function(response){
                        var allMachines = [];
                        ganttSchedulerCtrl.departmentsData = _.map(response.DepartmentMachine,function(department,index){
                            var machines = _.map(department.Value || [],function(machine,machIndex){
                                machine.order1 = index;
                                machine.order2 = machIndex;
                                return machine;
                            });
                            allMachines = allMachines.concat(machines || []);
                            return {
                                name : ganttSchedulerCtrl.localLanguage ? department.Key.LName : department.Key.EName,
                                Id : department.Key.Id,
                                machines : _.filter(machines || [],function(machine){
                                    if (ganttSchedulerCtrl.firstLoadingData && ganttSchedulerCtrl.firstLoadingData.machines){
                                        if (ganttSchedulerCtrl.firstLoadingData.machines.indexOf(machine.Id) >= 0){
                                            return true;
                                        }
                                    }
                                    return false;
                                })
                            }
                        });
                        ganttSchedulerCtrl.departmentsData = _.filter(ganttSchedulerCtrl.departmentsData,function(department){
                            return department.machines.length > 0;
                        });
                        resolve(_.filter(allMachines,function(machine){
                            if (ganttSchedulerCtrl.firstLoadingData && ganttSchedulerCtrl.firstLoadingData.machines){
                                if (ganttSchedulerCtrl.firstLoadingData.machines.indexOf(machine.Id) >= 0){
                                    return true;
                                }
                            }
                            return false;
                        }));
                    });
                });
            };


            const getMoldIdColor = (moldID) => {
                if (ganttSchedulerCtrl.moldColors[moldID]){
                    return ganttSchedulerCtrl.moldColors[moldID];
                }
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (var i = 0; i < 6; i++) {
                  color += letters[Math.floor(Math.random() * 16)];
                }
                ganttSchedulerCtrl.moldColors[moldID] = color;
                return color;
            };

            ganttSchedulerCtrl.getMachineJobEventObject = function(job,index,machineId,init,last){
                var firstEventColor = '#b3f4b3';
                var defaultColor = job.JobColorID || '#c5c7c9';
                job.MoldColorID = getMoldIdColor(job.MoldID); 
                if (!($localStorage.ganttFilterData && $localStorage.ganttFilterData.useJobColor && $localStorage.ganttFilterData.useJobColor.value === 'mold')){
                    defaultColor = job.MoldColorID || '#c5c7c9';
                }
                
                job.id = job.ID;
                job.MachineID = machineId;
                job.end = job.EndTime;
                job.start = job.StartTime;
                job.resourceId = machineId;
                job.jobEvent = true;
                job.backgroundColor = defaultColor;
                if (job.JobRecipeValues && job.JobRecipeValues.length > 0){
                    const newObj = {};
                    job.JobRecipeValues.forEach((jobRecipe) => {
                        newObj[jobRecipe.PropertyName] = jobRecipe.FValue;
                    });
                    job.JobRecipeValues = newObj;
                }
                job.classNames = ['jobEvent','job-' + job.id, `status-${job.Status}`,
                    `color-job-${job.JobColorID || '#c5c7c9'}`, `color-mold-${job.MoldColorID || '#c5c7c9'}`];
                if (job.Status === 2){
                    job.classNames.push('not-released-job');
                }
                if (job.NoProduction){
                    job.classNames.push('no-production');
                    job.title = ganttSchedulerCtrl.localLanguage ? job.ProductName : job.ProductEName;
                }
                else if (job.ID == 0){
                    job.classNames.push('non-setup-shift');
                    job.title = '';
                }
                else{
                    // job.title = job.ID + ' - '  + job.ProductEName;
                    job.title = ganttSchedulerCtrl.localLanguage ? job.ProductName : job.ProductEName;
                }
                if (index == 0){
                    job.classNames.push('first-job');
                    if (init){
                        let resource = ganttSchedulerCtrl.gantt.getResourceById(machineId);
                        if (resource){
                            const resourceTemp = _.find(ganttSchedulerCtrl.ganntOptions.machineResources,{id : parseInt(resource.id)});
                            if (resourceTemp) {
                                resourceTemp.jobData = job;
                            }
                            resource.setProp("jobData",job);
                        }
                    }
                }
                if (last){
                    ganttSchedulerCtrl.nextRefJobs.push({
                        "ID": job.id,
                        "MachineID": machineId,
                        "EndTime": job.EndTime,
                        "StartTime": job.StartTime,
                        "JobOrder": job.JobOrder
                    })
                }
                else{
                    job.eventColor = defaultColor;
                }

                if (ganttSchedulerCtrl.singleMachine){
                    job.classNames.push(`job-${job.id}-singleMode`);
                }
                if (!($localStorage.ganttFilterData && $localStorage.ganttFilterData.useJobColor && $localStorage.ganttFilterData.useJobColor.value === 'job' || 
                    $localStorage.ganttFilterData.useJobColor.value === 'mold')){
                    job.classNames.push('custom-color');
                }
            };


            ganttSchedulerCtrl.getNextJobEvents = function(init,next){
                return new Promise(function(resolve,reject){
                    if (!$localStorage.ganttFilterData || !ganttSchedulerCtrl.firstLoadingData.machines ||
                        ganttSchedulerCtrl.firstLoadingData.machines.length <= 0) {
                        ganttSchedulerCtrl.jobRequestInProgress = false;
                        return reject("no machines selected");
                    }
                    if (ganttSchedulerCtrl.jobRequestInProgress){
                        return;
                    }
                    var days = Math.ceil((ganttSchedulerCtrl.gantt.view.activeEnd - ganttSchedulerCtrl.gantt.view.activeStart) / 1000 / 60 / 60/ 24);
                    if (ganttSchedulerCtrl.dateStateBeforeRefresh) {
                        days = Math.ceil((ganttSchedulerCtrl.dateStateBeforeRefresh.endDate - ganttSchedulerCtrl.gantt.view.activeStart) / 1000 / 60 / 60/ 24);
                        ganttSchedulerCtrl.gantt.gotoDate( ganttSchedulerCtrl.dateStateBeforeRefresh.currentDate );
                        ganttSchedulerCtrl.dateStateBeforeRefresh = null;
                    }
                    ganttSchedulerCtrl.daysRequested = days;
                    ganttSchedulerCtrl.jobRequestInProgress = true;
                    if (next){
                        ganttSchedulerCtrl.gantt.next();
                        // ganttSchedulerCtrl.getMachinesEvents(ganttSchedulerCtrl.gantt.view.activeStart,ganttSchedulerCtrl.gantt.view.activeEnd);
                    }
                    if (init) {
                        ganttSchedulerCtrl.ganttResourcesOptions = [ganttSchedulerCtrl.ganttResourcesOptions[0]];
                        ganttSchedulerCtrl.auxiliaryData = [];
                    }
                    getAllJobEvents({MachineID : ganttSchedulerCtrl.firstLoadingData.machines,
                            daysLimit : days,
                            refJobs :ganttSchedulerCtrl.nextRefJobs,
                            PeFilter : ganttSchedulerCtrl.firstLoadingData && ganttSchedulerCtrl.firstLoadingData.selectedPeFilter || 0,
                            CustomPE : ganttSchedulerCtrl.firstLoadingData && ganttSchedulerCtrl.firstLoadingData.selectedPeFilter === 5 && ganttSchedulerCtrl.firstLoadingData.customPeFilter || undefined,
                            dontDisplayStatus2: ganttSchedulerCtrl.firstLoadingData && ganttSchedulerCtrl.firstLoadingData.jobsNotForRelease || false}).then(function(response){
                        ganttSchedulerCtrl.nextRefJobs = [];
                        var newMachineSourceEvents = []; 
                        var newEvents = [];
                        var defaultColor = '#c5c7c9';
                        ganttSchedulerCtrl.moldColors = {};
                        response.JobsForFactoryDepartment.forEach(function(department){
                            if (!department.Value){
                                return;
                            }
                            // console.log(ganttSchedulerCtrl.allJobEvents);
                            department.Value.forEach(function(machine){
                                if (!machine.Value){
                                    return;
                                }
                                machine.Value.forEach(function(job,index){
                                    if (job.Auxiliary && job.Auxiliary.length > 0) {
                                        job.Auxiliary.forEach(auxiliary => {
                                            auxiliary.id = auxiliary.AuxiliaryID + "_auxiliary";
                                            auxiliary.title = auxiliary.AuxName;
                                            if (_.findIndex(ganttSchedulerCtrl.auxiliaryData,{AuxiliaryID : auxiliary.AuxiliaryID }) < 0) {
                                                ganttSchedulerCtrl.auxiliaryData.push(auxiliary);
                                            }
                                            if (_.findIndex(ganttSchedulerCtrl.ganttResourcesOptions,{param : auxiliary.AuxTypeID }) < 0) {
                                                ganttSchedulerCtrl.ganttResourcesOptions.push({
                                                    param: auxiliary.AuxTypeID,
                                                    text: auxiliary.AuxTypeName,
                                                    columns : false,
                                                },);
                                            }
                                        });
                                    }
                                    if (job.ID !== 0 && _.findIndex(ganttSchedulerCtrl.allJobEvents,{ID : job.ID}) >= 0){
                                        return;
                                    }
                                    if (job.Setup === 1 || job.Setup === 2){
                                        job.SetupTypeColor = defaultColor;
                                    }
                                    if (job.TimeLeftHR && typeof job.TimeLeftHR) {
                                        let mins = Math.floor((job.TimeLeftHR - Math.floor(job.TimeLeftHR))*60);
                                        job.TimeLeftHR = Math.floor(job.TimeLeftHR) + ":" + mins;
                                    }
                                    job.EventInJob.forEach(function(machineEvent){
                                        if (_.findIndex(ganttSchedulerCtrl.machineEvents,{id : event.EventID}) >= 0){
                                            return;
                                        }
                                        ganttSchedulerCtrl.buildMachineEvent(machineEvent,machine.Key);

                                        newMachineSourceEvents.push(machineEvent);
                                    });

                                    ganttSchedulerCtrl.getMachineJobEventObject(job,index,machine.Key,init,machine.Value.length - 1 == index);

                                    // TODO setup job
                                    if (job.Setup > 0){
                                        var setupJob = angular.copy(job);
                                        var temp = new Date(setupJob.start);
                                        temp.setMinutes(temp.getMinutes() + job.Setup);
                                        setupJob.id += "setup";
                                        setupJob.setupJobEvent = true;
                                        setupJob.classNames.push("jobSetupEvent");
                                        setupJob.end = moment(temp).format("YYYY-MM-DD HH:mm:ss");
                                        setupJob.backgroundColor = setupJob.SetupTypeColor;
                                        setupJob.eventColor = setupJob.SetupTypeColor;
                                        // \.gantt.addEvent(setupJob);
                                        newEvents.push(setupJob);
                                        ganttSchedulerCtrl.setupEvents.push(setupJob);
                                    }
                                    
                                    // TODO actual end date job
                                    if (job.EndTimeStandard && !job.NoProduction){
                                        var endTimeStandard = angular.copy(job);
                                        endTimeStandard.id += "actualEndTime";
                                        endTimeStandard.actualEndTime = true;
                                        endTimeStandard.classNames.push("actualEndTimeEvent");
                                        endTimeStandard.start = moment(endTimeStandard.EndTimeStandard).format("YYYY-MM-DD HH:mm:ss");
                                        endTimeStandard.backgroundColor = '#6969669';
                                        // ganttSchedulerCtrl.gantt.addEvent(setupJob);
                                        if (endTimeStandard.start !== endTimeStandard.end) {
                                            newEvents.push(endTimeStandard);
                                            ganttSchedulerCtrl.setupEvents.push(endTimeStandard);
                                        }
                                    }
                                    // ganttSchedulerCtrl.gantt.addEvent(job);
                                    newEvents.push(job);
                                    ganttSchedulerCtrl.allJobEvents.push(job);
                                });
                            });
                        });
                        ganttSchedulerCtrl.gantt.addEventSource({
                            events : newEvents
                        });
                        ganttSchedulerCtrl.gantt.addEventSource({
                            events : newMachineSourceEvents
                        });
                        ganttSchedulerCtrl.changeResource(_.find(ganttSchedulerCtrl.ganttResourcesOptions,{param: ganttSchedulerCtrl.resourceChosen}));
                        // if (!init){
                            ganttSchedulerCtrl.jobRequestInProgress = false;
                        // }
                        $timeout(function(){
                            ganttSchedulerCtrl.colorJobs();  
                        },300);
                        resolve(true);
                    });
                });
            };

            ganttSchedulerCtrl.colorJobs = function(){
                const dateChecker = ['PlanningApprovedDate', 'ClosingDate', 'EndTimeRequest'].indexOf(ganttSchedulerCtrl.ganttHeaderParams.coloringField) >= 0;
                if ((!ganttSchedulerCtrl.ganttHeaderParams.coloringField || 
                    !ganttSchedulerCtrl.ganttHeaderParams.coloringValue ) && 
                    !dateChecker) {
                    return;
                }
                if (ganttSchedulerCtrl.coloringInProgress){
                    return;
                }
                ganttSchedulerCtrl.coloringInProgress = true;
                var events = ganttSchedulerCtrl.allJobEvents;
                if (ganttSchedulerCtrl.singleMachine){
                    events = ganttSchedulerCtrl.ganntSingleMachineOptions.events;
                }
                var matchedJobs = _.filter(events, function(job){
                    var value = job[ganttSchedulerCtrl.ganttHeaderParams.coloringField];
                    if (dateChecker){
                        if (!job.EndTime || !value) {
                            return false;
                        }
                        if (new Date(value) >= new Date(job.EndTime)) {
                            return false;
                        }
                        return true;
                    }
                    value = value && value.toLowerCase && value.toLowerCase() || value;
                    var filterValue = ganttSchedulerCtrl.ganttHeaderParams.coloringValue && ganttSchedulerCtrl.ganttHeaderParams.coloringValue.toLowerCase && ganttSchedulerCtrl.ganttHeaderParams.coloringValue.toLowerCase() || ganttSchedulerCtrl.ganttHeaderParams.coloringValue;
                    if (isNaN(value) && value !== null && value !== ""){
                        if (value && value.indexOf && value.indexOf(filterValue) >= 0){
                            return true;
                        }
                    }
                    else if (filterValue == value){
                        return true;
                    }
                    if (filterValue.indexOf(value) >= 0){
                        return true;
                    }
                    return false;
                });
                matchedJobs.forEach(function(job){
                    var el = document.getElementsByClassName('job-' + job.ID + (ganttSchedulerCtrl.singleMachine ? '-singleMode' : ''));
                    if(el && el[0]){
                        $(el).addClass("jobMatched");
                    }
                });
                var previousColoring = ganttSchedulerCtrl.previousColoringJobIds;
                if (ganttSchedulerCtrl.singleMachine){
                    previousColoring = ganttSchedulerCtrl.previousColoringJobIdsSingle;
                }
                previousColoring.forEach(function(jobId){
                    if(_.findIndex(matchedJobs,{ID : jobId}) >= 0){
                        return;
                    }
                    var el = document.getElementsByClassName('job-' + jobId + (ganttSchedulerCtrl.singleMachine ? '-singleMode' : ''));
                    if(el && el[0]){
                        $(el).removeClass("jobMatched");
                    }
                });
                if (ganttSchedulerCtrl.singleMachine){
                    ganttSchedulerCtrl.previousColoringJobIdsSingle = _.map(matchedJobs,'ID');
                }
                else{
                    ganttSchedulerCtrl.previousColoringJobIds = _.map(matchedJobs,'ID');
                }
                ganttSchedulerCtrl.coloringInProgress = false;
            };

            ganttSchedulerCtrl.buildMachineEvent = function(event, machineId){
                var defaultColor = 'yellow';
                event.id = event.EventID;
                event.end = moment(event.EventEndTime,"DD/MM/YYYY HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');
                event.start = moment(event.EventTime,"DD/MM/YYYY HH:mm:ss").format('YYYY-MM-DD HH:mm:ss'); 
                event.resourceId = machineId;
                event.eventColor = defaultColor;
                event.title = ganttSchedulerCtrl.localLanguage ? event.EventLTitle : event.EventETitle;
                event.machineEvent = true;
                event.classNames = ['machineEvent','event-' + event.id];
                if (moment(event.EventEndTime,"DD/MM/YYYY HH:mm:ss") - moment(event.EventTime,"DD/MM/YYYY HH:mm:ss") < (3600000 * 6)) {
                    event.classNames.push('small-machine-event');
                }
                if (event.EventDefinitionID == 1){
                    event.classNames.push('down-time');
                }
                if (event.EventDefinitionID == 2){
                    event.classNames.push('idle-time');
                }
            };

            ganttSchedulerCtrl.getMachinesEvents = function(start,end){
                return new Promise(function(resolve,reject){
                    getAllEvents(moment(start).format("YYYY-MM-DD HH:mm:ss"),moment(end).format("YYYY-MM-DD HH:mm:ss")).then(function(response){
                        ganttSchedulerCtrl.machineEvents = [];
                        var newSourceEvents = [];
                        for (var machineId in response.ResponseDictionary) {
                            if (!response.ResponseDictionary[machineId]){
                                continue;
                            }
                            response.ResponseDictionary[machineId].forEach(function(event){
                                if (_.findIndex(ganttSchedulerCtrl.machineEvents,{id : event.EventID}) >= 0){
                                    return;
                                }
                                var defaultColor = 'yellow';
                                event.id = event.EventID;
                                event.end = event.EventEndTime;
                                event.start = event.EventTime;
                                event.resourceId = machineId;
                                event.eventColor = defaultColor;
                                event.machineEvent = true;
                                event.title = ganttSchedulerCtrl.localLanguage ? event.EventLTitle : event.EventETitle;
                                event.classNames = ['machineEvent','event-' + event.id];
                                if (event.EventDefinitionID == 1){
                                    event.classNames.push('down-time');
                                }
                                if (event.EventDefinitionID == 2){
                                    event.classNames.push('idle-time');
                                }
                                ganttSchedulerCtrl.machineEvents.push(event);
                                // ganttSchedulerCtrl.gantt.addEvent(event); 
                                newSourceEvents.push(event);
                            });
                        }
                        ganttSchedulerCtrl.gantt.addEventSource({
                            events : newSourceEvents
                        });
                        resolve(true);
                    });
                });
            } 

            ganttSchedulerCtrl.getShifts = function(){
                return new Promise((resolve,reject) => {
                    getFactoryShifts().then(function(response){
                        ganttSchedulerCtrl.ganttShifts = [];
                        var eventSource = [];
                        for (var machineId in response.ResponseDictionary) {
                            if (!response.ResponseDictionary[machineId]){
                                continue;
                            }
                            var shifts = [];
                            response.ResponseDictionary[machineId].forEach(function(event){
                                var defaultColor = 'black';

                                var diffDays = Math.round(event.durationhr / 24);
                                
                                var start = new Date(event.starttime);
                                var end = new Date(event.endtime);
                                var startMinutes = start.getMinutes();
                                var startHours = start.getHours();
                                startMinutes = (startMinutes < 10 ? '0' : '') + startMinutes;
                                startHours = (startHours < 10 ? '0' : '') + startHours;
                                var endMinutes = end.getMinutes();
                                var endHours = end.getHours();
                                endMinutes = (endMinutes < 10 ? '0' : '') + endMinutes;
                                endHours = (endHours > start.getHours() && diffDays == 1 ? endHours : 24 * (diffDays + 1) + endHours);
                                endHours = (endHours < 10 ? '0' : '') + endHours;
                                var shift = {
                                    id : Date.now(),
                                    title : '',
                                    startTime : startHours + ":" + startMinutes,
                                    endTime : endHours + ":" + endMinutes,
                                    eventColor : defaultColor,
                                    backgroundColor: "black",
                                    resourceId : machineId,
                                    daysOfWeek : [event.wday - 1],
                                    classNames : ["shiftEvent"],
                                    shiftEvent : true
                                }
                                shifts.push(shift);
                            });
                            eventSource.push({
                                events : shifts
                            });
                        }
                        ganttSchedulerCtrl.ganttShifts = eventSource;
                        resolve(true);
                    });
                });
            }

            ganttSchedulerCtrl.refreshData = function(machineId, saveDateState){
                if (machineId || ganttSchedulerCtrl.singleMachine){
                    ganttSchedulerCtrl.buildSingleMachineGantt();
                    return;
                }
                ganttSchedulerCtrl.toggleSelectMachines = false;
                ganttSchedulerCtrl.nextRefJobs = undefined;
                if (saveDateState) {
                    ganttSchedulerCtrl.dateStateBeforeRefresh = {
                        currentDate: ganttSchedulerCtrl.gantt.state.currentDate,
                        endDate: ganttSchedulerCtrl.gantt.state.dateProfile.activeRange.end
                    };
                }
                ganttSchedulerCtrl.buildCalendar();
            };

            ganttSchedulerCtrl.renderMainComp = function(){
                $timeout(function(){
                    ganttSchedulerCtrl.previousColoringJobIds = [];
                    ganttSchedulerCtrl.refreshData();
                    // $timeout(function(){
                    // //     ganttSchedulerCtrl.colorJobs();  
                    //     ganttSchedulerCtrl.rerenderLoading = false;
                    // },300);
                    // ganttSchedulerCtrl.gantt.rerenderEvents();
                },1000);
            };

            ganttSchedulerCtrl.export = function(mainClass){
                var resourceElement = $(`${mainClass} .fc-body .fc-resource-area .fc-scroller`);
                var timeElement = $(`${mainClass} .fc-body .fc-time-area .fc-scroller`);
                var resourceHeight = resourceElement.height();
                var timeHeight = resourceElement.height();
                resourceElement.css('height', '');
                timeElement.css('height', '');
                $(mainClass).css({'width': '100vw', 'padding': '50px 10px 10px'});

                html2canvas($(mainClass)[0],
                {
                    backgroundColor: "#fff"
                }).then(function (canvas) {
                    var ctx = canvas.getContext('2d');
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    // We create an image to receive the Data URI
                    var img = document.createElement('img');

                    // When the event "onload" is triggered we can resize the image.
                    img.onload = function () {
                        // We create a canvas and get its context.
                        var canvas2 = document.createElement('canvas');
                        var ctx2 = canvas2.getContext('2d');

                        // We set the dimensions at the wanted size.
                        // canvas2.width = 358;
                        // canvas2.height = 550;
                        canvas2.width = $(mainClass).width();
                        canvas2.height = $(mainClass).height();

                        // We resize the image with the canvas method drawImage();
                        ctx2.drawImage(this, 0, 0, canvas2.width, canvas2.height);
                        
                        ctx2.textBaseline = "top";
                        ctx2.font = "20px ProximaNova";
                        ctx2.fillStyle = "#4a4a4a";
                        ctx2.fillText(ganttSchedulerCtrl.gantt.view.title, 20, 20); 

                        var image = new Image();
                        image.src = canvas2.toDataURL("image/png");
                
                        var w = window.open("");
                        w.document.write(image.outerHTML);
                        resourceElement.css('height', resourceHeight);
                        timeElement.css('height', timeHeight);
                        $(mainClass).css({'width': '', 'padding': ''});
                    };

                    // We put the Data URI in the image's src attribute
                    img.src = canvas.toDataURL("image/png");
                });
            };

            ganttSchedulerCtrl.firstLoadingData = {
                machines : angular.copy($localStorage.ganttDefaults.selectedMachines),
                selectedPeFilter: $localStorage.ganttDefaults.peFilter,
                customPeFilter: $localStorage.ganttDefaults.customPeFilter,
                jobsNotForRelease:  $localStorage.ganttDefaults.jobsNotForRelease,
                peFilterOptions : [
                    {
                        name: "NONE_PE_FILTER",
                        value: 0,
                    },
                    {
                        name: "BESTPR_PE_FILTER",
                        value: 1,
                    },
                    {
                        name: "WORSTPE_PE_FILTER",
                        value: 2,
                    },
                    {
                        name: "AVGPE_PE_FILTER",
                        value: 3,
                    },
                    {
                        name: "CUSTOM_PE_FILTER",
                        value: 5,
                    }
                ]
            };

            ganttSchedulerCtrl.searchForMachines = function () {
                var modalInstance = $modal.open({
                    templateUrl: "views/common/mainContentTemplate.html",
                    controller: function ($scope, $compile, $modalInstance, commonFunctions) {
                        $scope.reportID = 100120;
                        $scope.pageDisplay = 0;
                        $scope.returnValue = true;
                        $scope.onlyNewTab = true;
                        $scope.disableLinks = true;
                        $scope.modal = true;
                        $scope.showBreadCrumb = false;
                        $scope.multiSelect = true;
                        $scope.hideCriteria = true;
                        $scope.searchInMultiForm = true;
                        $scope.sfCriteria = [];
                        $scope.chosenIds = angular.copy(ganttSchedulerCtrl.firstLoadingData.machines);
                        $scope.rtl = LeaderMESservice.isLanguageRTL() ? "rtl" : "";
                        commonFunctions.commonCodeSearch($scope);
                        $scope.getDisplayReportSearchFields();
    
                        $scope.ok = function () {
                            $modalInstance.close();
                        };
    
                        $scope.rowClicked = function (IDs) {
                            $modalInstance.close(IDs);
                        };
                    }
                }).result.then(function (IDs) {
                    if (IDs !== undefined){
                        ganttSchedulerCtrl.firstLoadingData.machines = IDs || [];
                    }
                });
            };

            ganttSchedulerCtrl.loadGanttFilter = function(){
                const selectedMachines = [];
                ganttSchedulerCtrl.enableReleaseJobDatesAction = false;
                ganttSchedulerCtrl.machinesSaveJobsGantt = [];
                ganttSchedulerCtrl.allDepartments.forEach(function(department){
                    department.Value.forEach(function(machine){
                        if (machine.selected){
                            if (machine.IsSaveJobsGantt){
                                ganttSchedulerCtrl.enableReleaseJobDatesAction = true;
                                ganttSchedulerCtrl.machinesSaveJobsGantt.push(machine.Id);
                            }
                            selectedMachines.push(machine.Id);
                        }
                    });
                });
                ganttSchedulerCtrl.firstLoadingData.machines = selectedMachines;
                $localStorage.ganttDefaults.selectedMachines = angular.copy(ganttSchedulerCtrl.firstLoadingData.machines);
                $localStorage.ganttDefaults.peFilter = ganttSchedulerCtrl.firstLoadingData.selectedPeFilter;
                $localStorage.ganttDefaults.customPeFilter = ganttSchedulerCtrl.firstLoadingData.customPeFilter;
                $localStorage.ganttDefaults.jobsNotForRelease = ganttSchedulerCtrl.firstLoadingData.jobsNotForRelease;
                ganttSchedulerCtrl.refreshData();
                ganttSchedulerCtrl.machineListOpen = false;
            };

            ganttSchedulerCtrl.selectAllDepartmentsGlobal = function (department) {
                department.Value.forEach(function (machine) {
                    if (machine.selected != department.selected) {
                        machine.selected = department.selected;
                        ganttSchedulerCtrl.selectMachine(machine);
                    }
                });
            };
            
            ganttSchedulerCtrl.selectMachine = function (machine) {
                if (machine.selected && ganttSchedulerCtrl.selectedMachines.indexOf(machine.MachineName) < 0){
                    ganttSchedulerCtrl.selectedMachines.push(machine.MachineName);
                }
                else if (!machine.selected && ganttSchedulerCtrl.selectedMachines.indexOf(machine.MachineName) >= 0){
                    ganttSchedulerCtrl.selectedMachines.splice(ganttSchedulerCtrl.selectedMachines.indexOf(machine.MachineName), 1);
                }
                ganttSchedulerCtrl.selectedMachines = [...ganttSchedulerCtrl.selectedMachines];
            };

            ganttSchedulerCtrl.getEventByClassName = function(className){
                let events = [];
                if (!ganttSchedulerCtrl.singleMachine){
                    events = ganttSchedulerCtrl.gantt.getEvents();
                }
                else {
                    events = ganttSchedulerCtrl.ganttSingleMachine.getEvents();
                }
                return events.filter(event => event.classNames.indexOf(className) >= 0);
            }

            ganttSchedulerCtrl.removeGanttActionClassName = function(){
                const events = ganttSchedulerCtrl.getEventByClassName('chosen-for-action');
                events.forEach(event => {
                    const index = event.classNames.indexOf('chosen-for-action');
                    const classNames = [...event.classNames];
                    classNames.splice(index , 1);
                    event.setProp('classNames', classNames);
                });
            }

            ganttSchedulerCtrl.ganttGeneralActions = [
                {
                    param: 'releaseJobsForProduction',
                    text: 'RELEASE_JOBS_FOR_PRODUCTION'
                },
                {
                    param: 'removeJobsFromProduction',
                    text: 'REMOVE_JOBS_FROM_PRODUCTION'
                },
                {
                    param: 'terminateOrCancelJobs',
                    text: 'TERMINATE_OR_CANCEL_JOBS'
                }
            ];

            ganttSchedulerCtrl.resourceChosen = 'machines';

            ganttSchedulerCtrl.ganttResourcesOptions = [
                {
                    param: 'machines',
                    text: 'MACHINES',
                    columns : true,
                },
            ];

            const updateEventsResourcesToAuxiliary = () => {
                updateEventsResourcesToMachines();
                const eventsToBeAdded = [];
                const events = ganttSchedulerCtrl.gantt.getEvents();
                events.forEach(event => {
                    if (event.extendedProps.jobEvent && event.classNames.indexOf("jobSetupEvent") < 0) {
                        event.resourceIds = _.map(event.extendedProps.Auxiliary || [],'id');
                        event.id += "auxiliary";
                        eventsToBeAdded.push(event);
                    }
                });

                ganttSchedulerCtrl.gantt.addEventSource({
                    events: eventsToBeAdded,
                    id: 'auxiliary',
                });
            };
            
            const updateEventsResourcesToMachines = () => {
                const eventResource = ganttSchedulerCtrl.gantt.getEventSourceById('auxiliary');
                if (eventResource) {
                    eventResource.remove();
                }
            };

            ganttSchedulerCtrl.changeResource = (resourceOption) => {
                ganttSchedulerCtrl.resourcesLoading = true;
                let change = false;
                if (ganttSchedulerCtrl.resourceChosen !== resourceOption.param && ganttSchedulerCtrl.resourceChosen === 'machines') {
                    change = true;
                }
                ganttSchedulerCtrl.resourceChosen = resourceOption.param;
                $timeout(() => {
                    if (resourceOption.param === 'machines') {
                        if (ganttSchedulerCtrl.machinesResouceColumns){
                            ganttSchedulerCtrl.ganntOptions.resourceColumns = ganttSchedulerCtrl.machinesResouceColumns;
                        }
                        updateEventsResourcesToMachines();
                    }
                    else {
                        if (change) {
                            ganttSchedulerCtrl.machinesResouceColumns = ganttSchedulerCtrl.ganntOptions.resourceColumns;
                        }
                        ganttSchedulerCtrl.ganntOptions.resourceColumns = [
                            {
                                labelText: resourceOption.text,
                                field: 'title',
                                auxiliary: true,
                            }
                        ];
                        updateEventsResourcesToAuxiliary();
                    }
                    ganttSchedulerCtrl.gantt.refetchResources();
                },100);
            };
            
            
            ganttSchedulerCtrl.chooseGanttAction = function(action) {
                ganttSchedulerCtrl.action = action;
                ganttSchedulerCtrl.removeGanttActionClassName();
                SweetAlert.swal("",$filter('translate')('PLEASE_SELECT_THE_RELEVANT_JOBS'), "info");
            }

            ganttSchedulerCtrl.cancelGanttAction = function() {
                ganttSchedulerCtrl.action = null;
                ganttSchedulerCtrl.removeGanttActionClassName();
            }

            ganttSchedulerCtrl.saveGanttAction = function() {
                SweetAlert.swal({
                    title: $filter('translate')('ATTENTION'),
                    text: $filter('translate')('YOU_ARE_ABOUT_TO_PREFORM_MULTIPLE_JOBS'),
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: "green",
                    confirmButtonText: $filter('translate')("YES"),
                    cancelButtonText:  $filter('translate')("NO"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass :  (ganttSchedulerCtrl.rtl ? " swalRTL back-gantt" : "back-gantt")
                },
                function (isConfirm) {
                    if (isConfirm) {
                        const events = ganttSchedulerCtrl.getEventByClassName('chosen-for-action');
                        if (events.length > 0 && ganttSchedulerCtrl.action) {
                            let requestObject = {};
                            let api = '';
                            if (ganttSchedulerCtrl.action.param === 'releaseJobsForProduction') {
                                const jobsObject = events.map(event => {
                                    return {
                                        jobID :event.extendedProps.ID,
                                        machineID :event.extendedProps.MachineID,
                                        transferToStatus3: true,
                                    }
                                });
                                api = 'AssignOrApproveJob';
                                requestObject = {
                                    jobs:jobsObject,
                                }
                            }
                            else if (ganttSchedulerCtrl.action.param === 'removeJobsFromProduction') {
                                const jobsObject = events.map(event => {
                                    return event.extendedProps.ID;
                                });
                                api = 'ChangeJobStatusFrom3To2';
                                requestObject = {
                                    jobs: jobsObject,
                                }
                            }
                            else if (ganttSchedulerCtrl.action.param === 'terminateOrCancelJobs') {
                                const jobsObject = events.map(event => {
                                    return event.extendedProps.ID;
                                });
                                api = 'CancelMultipleJobs';
                                requestObject = {
                                    jobs: jobsObject,
                                }
                            }
                            LeaderMESservice.customAPI(api,requestObject).then(response => {
                                if (response.error !== null) {
                                    notify({
                                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                                        classes: 'alert-danger',
                                        templateUrl: 'views/common/notify.html'
                                    });
                                }
                                else{
                                    ganttSchedulerCtrl.action = null;
                                    ganttSchedulerCtrl.refreshData(null, true);
                                }
                            });
                        }    
                    }
                });

            }

            ganttSchedulerCtrl.openJobActions = (id, machineId, el) => {
                let jobEvent;
                let jobData = {};
                const documentRect = document.documentElement.getBoundingClientRect();
                let containerClientRect;
                if (ganttSchedulerCtrl.singleMachine) {
                    jobEvent = ganttSchedulerCtrl.ganttSingleMachine.getEventById(id);
                    if (jobEvent) {
                        jobData = jobEvent.extendedProps;
                    }
                    containerClientRect = ganttSchedulerCtrl.ganttSingleMachineElement[0].getBoundingClientRect();
                }
                else{
                    jobEvent = ganttSchedulerCtrl.gantt.getEventById(id);
                    if (jobEvent) {
                        jobData = jobEvent.extendedProps;
                    }
                    containerClientRect = ganttSchedulerCtrl.ganttElement[0].getBoundingClientRect();
                }
                const clickClientRect = el.getBoundingClientRect();
                let x, y;
                if (el.mousePosition) {
                    x = el.mousePosition.x - containerClientRect.left;
                } else {
                    x = clickClientRect.left - containerClientRect.left;
                }
                y = clickClientRect.top - containerClientRect.top + clickClientRect.height + 20;
                if (y  + 162 + containerClientRect.top > documentRect.height) {
                  y = y - (162 + 19);
                }
                if (x + containerClientRect.left + 130 > documentRect.width) {
                  x = x - 115;
                }
                if  (ganttSchedulerCtrl.singleMachine &&  
                    ganttSchedulerCtrl.singleMachineViewResourceToggle === 'calendar' ) {
                    x = x + $scope.reorderSectionWidth;
                }
                $timeout(() => {
                    ganttSchedulerCtrl.jobActionsData = null;
                });
                $timeout(() => {
                    ganttSchedulerCtrl.jobActionsData = {
                      id,
                      x,
                      y,
                      jobData,
                      machineId : ganttSchedulerCtrl.singleMachine ? machineId : null,
                    }
                }, 200);
              }

            ganttSchedulerCtrl.unscheduledJobs = function(){
                var modalInstance = $modal.open({
                    windowClass: 'unassigned-jobs',
                    backdrop: 'static',
                    keyboard: false,
                    template: 
                    `        <div style="display: flex;align-items: center; justify-content: flex-end;padding: 8px;position: absolute;right: 0px;"> 
                    <img style="width:20px;height:20px;margin: 0px 10px;cursor: pointer;" class="New-tab-icon" src="images/gantt/open_new_tab.svg" ng-click="openFullView()">
                    <img style="cursor: pointer;" ng-click="close()" src="images/gantt/grey-600.svg">
                </div><div style="margin-top:30px"><react-search-results-unassigned-jobs content="editableTableData" close="close"></react-search-results-unassigned-jobs></div>`,
                    controller: function ($scope, $timeout, $modalInstance, customServices, $state) {
                        $timeout(() => {
                            if ($localStorage.ganttUnassignedJobsModalWidth) {
                                $('.unassigned-jobs .modal-content').width($localStorage.ganttUnassignedJobsModalWidth)
                            }
                            if ($localStorage.ganttUnassignedJobsModalHeight) {
                                $('.unassigned-jobs .modal-content').height($localStorage.ganttUnassignedJobsModalHeight)
                            }
                            $('.unassigned-jobs .modal-content').resizable({ handles: " n, e, s, w, ne, se, sw, nw" });
                            // $('.unassigned-jobs .modal-content').draggable({containment: ".unassigned-jobs",  cancel: ".ui-grid-cell-contents"});
                            var draggableDiv = $('.unassigned-jobs .modal-content')
                            draggableDiv.draggable({
                                containment: ".unassigned-jobs",
                                handle: $('.ui-grid-disable-selection.ui-grid-cell-contents', draggableDiv)
                              });
                        }, 1000);
                        $scope.selectedDepartmentIds = [];
                        ganttSchedulerCtrl.allDepartments.forEach(department => {
                            for(let i = 0;i < department.Value.length; i++) {
                                const machine = department.Value[i];
                                if (machine.selected){
                                    $scope.selectedDepartmentIds.push(department.Key.Id);
                                    break;
                                }
                            };
                        });
                        customServices.customGetCode($scope, 'custom:UnScheduledJobs');

                        $scope.openFullView = () => {
                            var url = $state.href('unScheduledJobs', {
                                departmentIds: $scope.selectedDepartmentIds,
                            });
                            url = url;
                            var myWindow = window.open(url, "LEADERMES_unScheduledJobs",'', true);
                            myWindow.location.reload();
                        };

                        $scope.close = () => {
                            $localStorage.ganttUnassignedJobsModalWidth = $('.unassigned-jobs .modal-content').width();
                            $localStorage.ganttUnassignedJobsModalHeight = $('.unassigned-jobs .modal-content').height();
                            $modalInstance.close();
                        };
                        $scope.emptyPage = function(){
                            $modalInstance.close(true);
                        }
                        
                        $scope.rowClicked = function (IDs) {
                            $modalInstance.close();
                        };
                    },
                }).result.then(function (success) {
                    if(success) {
                        ganttSchedulerCtrl.refreshData();
                    }
                });
            };

            ganttSchedulerCtrl.releaseJobsDates = function(){
                const promises = [];
                console.log(ganttSchedulerCtrl.allJobEvents);
                const jobsSave = [];
                const jobsNotSave = [];
                ganttSchedulerCtrl.allJobEvents.forEach((event) => {
                    if (!event.jobEvent) {
                        return;
                    }
                    if (ganttSchedulerCtrl.machinesSaveJobsGantt.indexOf(event.MachineID) >= 0) {
                        jobsSave.push({
                            "JobOrder": event.JobOrder,
                            "StartTime": event.StartTime,
                            "EndTime":event.EndTime,
                            "ID": event.ID
                        });
                    }
                    else {
                        jobsNotSave.push({
                            "JobOrder": event.JobOrder,
                            "StartTime": event.StartTime,
                            "EndTime":event.EndTime,
                            "ID": event.ID
                        });
                    }
                });
                promises.push(LeaderMESservice.customAPI('SaveJobOrder',{jobs : jobsSave,IsSaveJobsGantt : true}));
                promises.push(LeaderMESservice.customAPI('SaveJobOrder',{jobs : jobsNotSave,IsSaveJobsGantt : false}));

                Promise.all(promises).then(responses => {
                    ganttSchedulerCtrl.refreshData();
                });
            };
        };
        

    return {
        getAllJobEvents : getAllJobEvents,
        generalCode : generalCode,
        getAllEvents : getAllEvents,
        getFactoryShifts : getFactoryShifts
    }
});