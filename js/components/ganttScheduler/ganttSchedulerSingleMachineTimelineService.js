angular.module('LeaderMESfe')
    .factory('GanttSchedulerSingleMachineTimeLineService', 
        function (LeaderMESservice, $timeout, $filter, $sessionStorage, $compile, $state) {


        var updateCode = function($scope,ganttSchedulerCtrl,$element){
            ganttSchedulerCtrl.lastSingleUpdateTime = new Date();
            if (ganttSchedulerCtrl.ganttSingleMachine && ganttSchedulerCtrl.ganttSingleMachine.destroy){
                ganttSchedulerCtrl.ganttSingleMachine.destroy();
            }
            ganttSchedulerCtrl.reorderInitalized = false
            ganttSchedulerCtrl.ganttSingleMachineElement = $element.find('.ganttSingleMachine');
            ganttSchedulerCtrl.previousColoringJobIdsSingle = []
            $scope.singleMachinetooltips = {};
            if (!ganttSchedulerCtrl.singleMachineGanttView){
                ganttSchedulerCtrl.singleMachineGanttView = 'resourceTimelineWeekCustom';
            }
            $scope.singleTooltips = {};
            $scope.singleJobEventsTooltips = {};
            ganttSchedulerCtrl.ganntSingleMachineOptions = {
                schedulerLicenseKey: '0133016263-fcs-1560668241',
                plugins: [ 'interaction', 'dayGrid', 'resourceTimeline', 'resourceTimeGrid' ],
                // editable: true, // enable draggable events
                // selectable : true,
                header : false,
                height: ganttSchedulerCtrl.ganttHeight,
                scrollTime: '00:00', // undo default 6am scrollTime
                header: {
                    center: 'title'
                },
                nowIndicator: true,
                validRange: function(nowDate) {
                    return {
                        start: nowDate
                    };
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
                      if (ganttSchedulerCtrl.action && info.event.extendedProps.jobEvent) {
                        const classNames = [...info.event.classNames];
                        const indexOfClassNames = info.event.classNames.indexOf('chosen-for-action');
                        if (indexOfClassNames < 0) {
                          classNames.push('chosen-for-action');
                        } else {
                          classNames.splice(indexOfClassNames , 1);
                        }
                        $scope.singleJobEventsTooltips[info.event.id].dispose();
                        info.event.setProp('classNames', classNames);
                        return;
                      }
                    if (info && info.event && info.event.extendedProps && info.event.extendedProps.jobEvent && info.event.extendedProps.ID) {
                        ganttSchedulerCtrl.openJobActions(info.event.extendedProps.ID,info.event.extendedProps.MachineID,info.el);
                        info.jsEvent.stopPropagation();
                    }
                },
                locale: $sessionStorage.DatePickLng,
                defaultView: ganttSchedulerCtrl.singleMachineGanttView,
                views: {
                    resourceTimelineWeekCustom: {
                        type: 'resourceTimeline',
                        slotDuration: '06:00',
                        duration: { days: 7 },
                        buttonText: 'Week'
                    },
                    resourceTimelineHour: {
                        type: 'resourceTimeline',
                        buttonText: 'hour',
                        duration: { hours: 1 },
                    },
                    resourceTimelineMonthCustom: {
                        type: 'resourceTimeline',
                        slotDuration: '12:00',
                        duration: { days: 30 },
                        slotLabelFormat: [
                          { weekday: 'short', day: 'numeric', month: 'numeric' }, // top level of text
                          { hour: '2-digit',minute:'2-digit' } // lower level of text
                        ],
                        buttonText: 'Month'
                    }
                },
                resourceColumns: [
                    {
                        labelText: 'Jobs',
                        field: 'title',
                        render: function(resource, el) {
                            if (resource.extendedProps.Id == -1 || resource.extendedProps.jobData.Status == 10){
                                $timeout(function(){
                                    var trEl = el.closest("tr");
                                    if (trEl){
                                        trEl.className = "unsortable";
                                    }
                                },0);
                                return;
                            }
                            else{
                                $timeout(function(){
                                    var trEl = el.closest("tr");
                                    if (trEl){
                                        trEl.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.innerHTML = '<i class="fa fa-bars"></i>';
                                    }
                                },0);
                            }
                            el.style.color = '#337ab7';
                            el.style.cursor = 'pointer';
                            el.onclick = function(){
                                ganttSchedulerCtrl.openObject("Job",resource.extendedProps.Id);
                            };
                            if (resource && resource.extendedProps && 
                                resource.extendedProps.jobData && resource.extendedProps.jobData.NoProduction){
                                el.style.backgroundColor = "#a6a9ab";
                                el.style.color = "#a6a9ab";
                            }
                        }
                    }
                ],
                resourceOrder : 'order',
                viewSkeletonRender : function(){
                    $timeout(function(){
                        if (ganttSchedulerCtrl.updateJobColor){
                            ganttSchedulerCtrl.updateJobColor();
                        }
                        ganttSchedulerCtrl.singleMachineReorder();
                    },700);
                },
                refetchResourcesOnNavigate: true,
                eventRender: function(info) {
                    if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent){
                        info.el.style.height = `${(ganttSchedulerCtrl.currentSingleMachineResources || []).length * 35 - 8}px`;
                        return;
                    }
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
                        placement: 'top',
                        trigger: 'hover focus',
                        container: 'body',
                        html :true,
                    });
                    $scope.singleJobEventsTooltips[info.event.id] = tooltip;
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
                eventDestroy : function(info){
                    $scope.singleTooltips[info.event.id] = false;
                    $(`.single-machine-tooltip.gantt-tooltip-job-${info.event.id} .ganttCancelJob`).unbind("click");
                },
                eventMouseLeave : function(info){
                    if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent){
                        return;
                    }
                    if ($scope.singleJobEventsTooltips[info.event.id]){
                        $scope.singleJobEventsTooltips[info.event.id].hide();
                    }
                },
                eventMouseEnter : function(info){
                    if (info.event && info.event.extendedProps && info.event.extendedProps.shiftEvent){
                        return;
                    }
                    if (!$scope.singleTooltips[info.event.id]){
                        $scope.singleTooltips[info.event.id] = true;
                    }
                },
            }

            ganttSchedulerCtrl.colorSingleModeJobs = function(){

            }

            var events = [];
            events = events.concat(ganttSchedulerCtrl.singleMachineJobEvents);
            events = events.concat(ganttSchedulerCtrl.singleMachineSetupEvents);
            events = events.concat(ganttSchedulerCtrl.singleMachineEvents);
            var shifts = _.find(ganttSchedulerCtrl.ganttShifts,{events : [{resourceId : ganttSchedulerCtrl.singleMachine.machineId.toString()}]});
            if (shifts && shifts.events){
                shifts.events.forEach(function(shiftEvent){
                    var newEvent = angular.copy(shiftEvent);
                        newEvent.resourceId = -1;
                        events.push(newEvent);
                });
            }
            // ganttSchedulerCtrl.ganntSingleMachineOptions.resources = ganttSchedulerCtrl.singleMachineResources;
            ganttSchedulerCtrl.ganntSingleMachineOptions.resources = function(fetchInfo, successCallback, failureCallback){
                var resources = _.filter(ganttSchedulerCtrl.singleMachineResources,function(resource){
                    if (resource.id === -1) {
                        return true;
                    }
                    if (!(fetchInfo.end <= resource.jobData.startTimeTemp ||
                        fetchInfo.start >= resource.jobData.endTimeTemp)) {
                        return  true;
                    }
                    return false;
                });
                ganttSchedulerCtrl.currentSingleMachineResources = resources;
                successCallback(resources);
            };

            ganttSchedulerCtrl.ganntSingleMachineOptions.events =  events;
            ganttSchedulerCtrl.ganttSingleMachine = new FullCalendar.Calendar(ganttSchedulerCtrl.ganttSingleMachineElement[0],ganttSchedulerCtrl.ganntSingleMachineOptions);

            ganttSchedulerCtrl.ganttSingleMachine.render();
        };

    return {
        updateCode : updateCode
    }
});