angular.module('LeaderMESfe')
    .factory('GanttSchedulerSingleMachineCalendarService', function (LeaderMESservice, $timeout, $filter, SweetAlert, $compile) {


        var updateCode = function($scope,ganttSchedulerCtrl,$element){
            ganttSchedulerCtrl.calendarResourceColumns = [
                {
                    labelText: 'JOBS',
                    field: 'title',
                    fieldParam: 'title',
                    render: function(resource, el) {
                    }
                }
            ];
            if (!ganttSchedulerCtrl.singleMachineCalendarView){
                ganttSchedulerCtrl.singleMachineCalendarView = 'timeGridWeekCustom';
            }
            ganttSchedulerCtrl.lastSingleUpdateTime = new Date();
            if (ganttSchedulerCtrl.ganttSingleMachine && ganttSchedulerCtrl.ganttSingleMachine.destroy){
                ganttSchedulerCtrl.ganttSingleMachine.destroy();
            }
            ganttSchedulerCtrl.reorderInitalized = false
            ganttSchedulerCtrl.ganttSingleMachineElement = $element.find('.ganttSingleMachine');
            ganttSchedulerCtrl.previousColoringJobIdsSingle = []
            ganttSchedulerCtrl.ganntSingleMachineOptions = {
                schedulerLicenseKey: '0133016263-fcs-1560668241',
                plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
                // editable: true, // enable draggable events
                // selectable : true,
                header : false,
                height: ganttSchedulerCtrl.ganttHeight,
                scrollTime: '00:00', // undo default 6am scrollTime
                header: {
                    center: 'title'
                },
                allDaySlot: false,
                defaultView: ganttSchedulerCtrl.singleMachineCalendarView,
                nowIndicator: true,
                validRange: function(nowDate) {
                    return {
                        start: nowDate
                    };
                },
                views: {
                    timeGridWeekCustom: {
                        type: 'timeGrid',
                        duration: { days: 7 },
                        buttonText: 'Week'
                    },
                },
                viewSkeletonRender : function(){
                    $timeout(function(){
                        if (ganttSchedulerCtrl.updateJobColor){
                            ganttSchedulerCtrl.updateJobColor();
                        }
                    },700);
                },
                eventClick: function(info) {
                    if (info.event.extendedProps.machineEvent) {
                        var url = $state.href('appObjectFullView', {
                          appObjectName: 'CalendarEvent',
                          ID: info.event.extendedProps.EventID
                        });
                        url = url + "?firstTime=true";
                        var myWindow = window.open(url, "LEADERMES_Event",'', true);
                        myWindow.location.reload();
                        return;
                    }
                    if (info && info.event && info.event.extendedProps && info.event.extendedProps.jobEvent && info.event.extendedProps.ID) {
                        ganttSchedulerCtrl.openJobActions(info.event.extendedProps.ID,info.event.extendedProps.MachineID,info.el);
                        info.jsEvent.stopPropagation();
                    }
                },
                eventRender: function(info) {
                    if (info.event && info.event.extendedProps && info.event.extendedProps.PConfigID && info.event.extendedProps.PConfigID != 0){
                        $(info.el).children().first().children().first().append('<div style="display:inline-block"><img style="margin: 0 5px;" src="images/treeGraph/jobs-icon-black.svg"></div>');
                    }
                    if (info.event && info.event.extendedProps && (info.event.extendedProps.MoldStatus == 2 || info.event.extendedProps.MoldStatus == 3)){                            
                        $(info.el).children().first().children().first().append('<div style="display:inline-block"><img style="margin: 0 5px;" src="images/maintenence-copy-9.svg"></div>');
                    }
                    // if (info.event.extendedProps.ID && info.event.extendedProps.Status !== 10){    
                    //     $(info.el).children().first().children().first().prepend($compile(`<div ng-click="ganttSchedulerCtrl.openJobActions(${info.event.extendedProps.ID},${info.event.extendedProps.MachineID},$event);$event.stopPropagation()" style="display:inline-block"><img style="margin: 0 5px;" src="images/gantt/more.svg"></div>"`)($scope));
                    // }
                    // if (info.event && info.event.extendedProps && info.event.extendedProps.jobEvent && info.event.extendedProps.Status != 10){
                    //     $(info.el).children().first().children().first().append($compile(`<div ng-click="ganttSchedulerCtrl.singleModelDelete($event,${info.event.extendedProps.ID})" style="display:inline-block;padding: 0px 3px;"><i class="fa fa-trash-o"></i></div>`)($scope));
                    // }
                },
                eventMouseEnter : function(info){
                    var tooltipTemplate = '';
                    if (info.event.extendedProps.machineEvent) {
                        tooltipTemplate = `<div>${info.event.title}</div>`;
                    }
                    else {
                        tooltipTemplate = `<div>${$filter('translate')('JOB_ID')}: ${info.event.extendedProps.ID}</div>
                        <div>${$filter('translate')('JOB_ERP_ID')}: ${info.event.extendedProps.ErpJobID}</div>
                        <div>${$filter('translate')('PRODUCT_NAME')}: ${ganttSchedulerCtrl.localLanguage ? info.event.extendedProps.ProductName : info.event.extendedProps.ProductEName}</div>
                        <div>${$filter('translate')('MOLD_NAME')}: ${ganttSchedulerCtrl.localLanguage ? info.event.extendedProps.MoldLName : info.event.extendedProps.MoldEName}</div>`;
                    }
                    var tooltip = new Tooltip(info.el, {
                        title: $compile(`<div class="job-${info.event.id} single-machine-tooltip gantt-tooltip-job-${info.event.id}">
                                    <span class="title">
                                        ${tooltipTemplate}
                                    </span>
                                    ${info.event.extendedProps.jobEvent && info.event.extendedProps.Status != 10 ? `
                                    <div ng-click="ganttSchedulerCtrl.jobEventDeleteClick(${info.event.extendedProps.ID})" id="cancel-job-${info.event.extendedProps.ID}" class="ganttCancelJob removeIcon"><i class="fa fa-trash-o"></i></div>
                                    ` : ''}
                                </div>`)($scope)[0],
                        placement: 'bottom',
                        trigger: 'hover focus',
                        container: 'body',
                        html :true,
                    });
                }
            }
            
            ganttSchedulerCtrl.singleModelDelete = function(event,id){
                event.stopPropagation();
                var job = _.find(ganttSchedulerCtrl.singleMachineJobEvents,{ID : id});
                if (job){
                    if ([1,2,3].indexOf(job.Status) >= 0){
                    $scope.openDeleteModal(job,$scope.cancelJob);
                    }
                    else if (job.Status == 11){
                    $scope.openDeleteModal(job,$scope.terminateJob);
                    }
                }
            };

            ganttSchedulerCtrl.colorSingleModeJobs = function(){

            }

            var events = [];
            ganttSchedulerCtrl.singleMachineJobEvents = _.map(ganttSchedulerCtrl.singleMachineJobEvents,(event, index) => {
                event.start = new Date(event.start);
                event.end = new Date(event.end);
                event.order = index + 1;
                event.title = event.ID;
                return angular.copy(event);
            });
            ganttSchedulerCtrl.singleMachineJobEvents = _.sortBy(ganttSchedulerCtrl.singleMachineJobEvents,'start');
            events = events.concat(ganttSchedulerCtrl.singleMachineJobEvents);
            events = events.concat(_.map(ganttSchedulerCtrl.singleMachineSetupEvents,function(event) {
                var newEvent = angular.copy(event);
                newEvent.title = newEvent.ID;
                return newEvent;
            }));
            events = events.concat(ganttSchedulerCtrl.singleMachineEvents);
            // ganttSchedulerCtrl.ganntSingleMachineOptions.resources = ganttSchedulerCtrl.singleMachineResources;
            ganttSchedulerCtrl.ganntSingleMachineOptions.events =  events;

            ganttSchedulerCtrl.ganttSingleMachine = new FullCalendar.Calendar(ganttSchedulerCtrl.ganttSingleMachineElement[0],ganttSchedulerCtrl.ganntSingleMachineOptions);

            ganttSchedulerCtrl.sortableOptions = {
                handle: 'div > .handle-icon',
                stop: function(e, ui) {
                    // this callback has the changed model
                    for(let i = 1;i < ganttSchedulerCtrl.singleMachineJobEvents.length - 1 ;i++){
                        const previousEvent = ganttSchedulerCtrl.singleMachineJobEvents[i - 1];
                        const currentEvent = ganttSchedulerCtrl.singleMachineJobEvents[i];
                        const nextEvent = ganttSchedulerCtrl.singleMachineJobEvents[i + 1];
                        if (currentEvent.order + 1 !== nextEvent.order || currentEvent.order - 1 !== previousEvent.order) {
                            const currentResourceEvent = _.find(ganttSchedulerCtrl.singleMachineResources,{Id: currentEvent.id});
                            const nextResourceEvent = _.find(ganttSchedulerCtrl.singleMachineResources,{Id: nextEvent.id});
                            currentEvent.order = i + 1;
                            if (currentResourceEvent){
                                currentResourceEvent.order = i + 1;
                            }
                            else {
                                console.log("currentResourceEvent not found");
                            }
                            nextEvent.order = i + 2;
                            if (nextResourceEvent){
                                nextResourceEvent.order = i + 2;
                            }
                            else {
                                console.log("nextResourceEvent not found");
                            }
                            const diff = currentEvent.start.getTime() - previousEvent.end.getTime();
                            currentEvent.start = previousEvent.end;
                            currentEvent.end = new Date(currentEvent.end.getTime() - diff);
                            const nextDiff = currentEvent.end.getTime() - nextEvent.start.getTime();
                            nextEvent.start = currentEvent.end;
                            nextEvent.end = new Date(nextEvent.end.getTime() + nextDiff);
                            const currentStopEvent = _.find(ganttSchedulerCtrl.singleMachineSetupEvents,{ID : currentEvent.ID});
                            if (currentStopEvent) {
                                const currentStopDiff = (new Date(currentStopEvent.end)).getTime() -
                                (new Date(currentStopEvent.start)).getTime();
                                currentStopEvent.start = currentEvent.start;
                                currentStopEvent.end = new Date(currentStopEvent.start.getTime() + currentStopDiff);
                            }
                            const nextStopEvent = _.find(ganttSchedulerCtrl.singleMachineSetupEvents,{ID : nextEvent.ID});
                            if (nextStopEvent) {
                                const nextStopDiff = (new Date(nextStopEvent.end)).getTime() -
                                (new Date(nextStopEvent.start)).getTime();
                                nextStopEvent.start = nextEvent.start;
                                nextStopEvent.end = new Date(nextStopEvent.start.getTime() + nextStopDiff);
                            }
                        }
                    };
                    ganttSchedulerCtrl.singleMachineResources = _.sortBy(ganttSchedulerCtrl.singleMachineResources,'order');
                    ganttSchedulerCtrl.ganttSingleMachine.removeAllEvents();
                    ganttSchedulerCtrl.ganttSingleMachine.addEventSource({
                        events : ganttSchedulerCtrl.singleMachineJobEvents
                    });
                    ganttSchedulerCtrl.ganttSingleMachine.addEventSource({
                        events : ganttSchedulerCtrl.singleMachineSetupEvents
                    });
                    $timeout(function(){
                        ganttSchedulerCtrl.recalculateEnabled = true;
                    });
                },
                items: "> div:not(.not-sortable)"
            };  

            $scope.reorderSectionWidth = 300;
            var startX = 0;
            var startWidth = 300;
            function initDrag(e) {
                startX = e.clientX;
                startWidth = $scope.reorderSectionWidth;
                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
                e.stopPropagation();
            }

            var resizeHandle = $('.resize-reorder');
            resizeHandle[0].addEventListener('mousedown', initDrag, false);
            var reorderSection = $('.reorder-section');
            var ganttSingleMachine = $('.ganttSingleMachine');

            function doDrag(e) {
                const width = (startWidth + e.clientX - startX);
                $scope.reorderSectionWidth = width;
                reorderSection.width(`${width}px`);
                ganttSingleMachine.width(`calc(100% - ${width}px)`);
            }

            function stopDrag(e) {
                document.documentElement.removeEventListener('mousemove', doDrag, false);
                document.documentElement.removeEventListener('mouseup', stopDrag, false);
            }

            ganttSchedulerCtrl.ganttSingleMachine.render();
        };

    return {
        updateCode : updateCode
    }
});