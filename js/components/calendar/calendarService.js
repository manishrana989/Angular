angular.module('LeaderMESfe')
    .factory('calendarService', function ($compile, LeaderMESservice, commonFunctions, customServices,
        $filter, notify, $modal, toastr, calendarShiftService, notify,  $rootScope, $timeout) {


        var languageLocaleMap = {
            heb : 'he',
            eng : 'en',
            rus : 'ru',
            spn : 'es',
            chn : 'zh',
            ger : 'de',
            fre : 'fr',
            ita : 'it',
            hun : 'hu',
            pol : 'pl',
            cze : 'cs',
        }

        var loadCalendarService = function($scope, calendarDirectiveCtrl){
            var localLanguage = LeaderMESservice.showLocalLanguage();
            calendarDirectiveCtrl.getColorsPallete = function(){
                return calendarDirectiveCtrl.calendarConfig.colorsPalette;
            }   

            calendarDirectiveCtrl.calendarsPulled = {};
            calendarDirectiveCtrl.calendarsPulled[$scope.calendarId] = true;
            $scope.updateEvent = function(event,revertFunc){
                LeaderMESservice.customAPI('SaveNewEvent',{
                    "DateTo":moment(event.end).format('YYYY-MM-DD HH:mm:ss'),
                    "DateFrom":moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
                    "ID":event.eventID
                }).then(function(response){
                    if (response.error !== null) {
                        notify({
                            message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                            classes: 'alert-danger',
                            templateUrl: 'views/common/notify.html'
                        });
                        revertFunc();
                    }
                    else{
                        // $scope.LoadData();
                        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                    }
                });
            };

            $scope.getMachineJobQueue = function(){
                LeaderMESservice.customAPI('ScheduleJobsForMachine', {
                    MachineID: $scope.machineId
                }).then(function (response) {
                    var events = [];
                    if(response && response.JobsForMachine){
                        _.forEach(response.JobsForMachine,function(job){
                            var jobEvent = $scope.getJobQueueObject(job);
                            events.push(jobEvent);
                        });
                        $scope.jobQueueEvents = _.sortBy(events,'start');
                        if ($scope.jobQueueEvents && $scope.jobQueueEvents.length > 0){
                            $scope.jobQueueEvents[0].backgroundColor = 'green';
                        }
                        if ($scope.viewJobs){
                            updateJobQueueEventsData();
                        }
                        // if($scope.calendarElement){
                        //     $scope.deleteTooltip();
                        //     $scope.calendarElement.fullCalendar("renderEvents", events, true);
                        // }
                    }
                });
            };

            $scope.getJobQueueObject = function(job){
                return {
                    ErpJobID: job.ErpJobID,
                    title: job.ID,
                    eventID: job.ID,
                    start: moment(job.StartTime, 'YYYY-MM-DD HH:mm:ss'),
                    end: moment(job.EndTime, 'YYYY-MM-DD HH:mm:ss'),
                    backgroundColor: '#a9d6a9',
                    jobEvent : true,
                    startEditable : false,
                    editable : false,
                    className : "job-events",
                    productName : localLanguage ? job.ProductName : job.ProductEName
                };
            };

            $scope.getDepartmentShifts = function(departmentId){
                if(($scope.departmentId || departmentId) && $scope.machineId){
                    LeaderMESservice.customAPI('GetShiftDefinitionForMachine', {
                        MachineID: $scope.machineId,
                        Department: $scope.departmentId || departmentId
                    }).then(function (response) {
                        var EventsArr = [];
                        var pallete = [
                            "#F0F8FF",
                            "#B0C4DE"
                        ];
                        if(response && response.ResponseDictionary){
                            var indexColor = 0;
                            EventsArr = [];
                            response.ResponseDictionary[$scope.machineId].forEach(function(event){
                                var start = new Date(event.starttime);
                                if (start.getDay() != event.wday - 1){
                                    start.setDate(start.getDate() + (7 + event.wday - 1 - start.getDay()) % 7 );
                                }
                                var end = new Date(start);
                                end.setSeconds(end.getSeconds() + event.durationsec);
                                var StartTime = moment(start);
                                var EndTime = moment(end);
                                var EndWDay = end.getDay() +1;
                                var daysDiff = EndWDay - event.wday;
                                if(daysDiff < 0){
                                    daysDiff = daysDiff + 7;
                                }
                                var diff = Math.floor(Math.abs( StartTime.diff(EndTime) / (1000*60)));
                                var end = null;
                                var hours = null;
                                var minutes = null;
                                if(daysDiff == 0){
                                    hours = StartTime.hour() + Math.floor(diff / 60);
                                    minutes = StartTime.minute() + diff % 60;
                                    hours = hours + Math.floor(minutes/60);
                                }else{
                                    var endDateDay = new Date(EndTime);
                                    endDateDay.setHours(0);
                                    endDateDay.setMinutes(0);
                                    hours = 24 * daysDiff + Math.floor((EndTime - endDateDay.getTime()) / 1000 / 60 /60);
                                    minutes = EndTime.minute();
                                }
                                if((hours / 10) <= 0){
                                    hours = '0' + hours.toString();
                                }
                                if((minutes / 10) <= 0){
                                    minutes = '0' + minutes.toString();
                                }
                                end = hours + ":" + minutes;
                                var tempBGEvent = {
                                    title : event.shiftname,
                                    start: StartTime.format('HH:mm'),
                                    end: end,
                                    dow:[(event.wday-1)],
                                    backgroundColor: 'white',
                                    className : ["shift-calendar-event"],
                                    shiftEvent: true,
                                    startEditable : false,
                                    editable : false,
                                    rendering : 'background',
                                    origStart : StartTime.format('HH:mm'),
                                    origEnd : EndTime.format('HH:mm')
                                };
                                if (!event.workingshift){
                                    tempBGEvent.backgroundColor = "#000000";
                                    tempBGEvent.className.push("not-working")
                                }
                                else {
                                    indexColor++;
                                }
                                if (event.wday != EndWDay){
                                    var temp2BGEvent = angular.copy(tempBGEvent);
                                    tempBGEvent.end = "23:59";
                                    temp2BGEvent.start = "00:00";
                                    temp2BGEvent.end = tempBGEvent.origEnd;
                                    temp2BGEvent.dow = [(EndWDay -1)];
                                    tempBGEvent.className.push("fc-start");
                                    tempBGEvent.className.push("fc-not-end");
                                    temp2BGEvent.className.push("fc-not-start");
                                    temp2BGEvent.className.push("fc-end");
                                    EventsArr.push(tempBGEvent);
                                    EventsArr.push(temp2BGEvent);
                                } 
                                else{
                                    EventsArr.push(tempBGEvent);
                                }
                            });
                            $scope.shiftEvents = EventsArr;
                            if ($scope.viewShift){
                                updateShiftEventsData();
                            }
                            // if($scope.calendarElement){
                            //     $scope.deleteTooltip();
                            //     $scope.calendarElement.fullCalendar("renderEvents", EventsArr, true);
                            // }
                        }
                    });
                }
            };

            $scope.getCalendarEvents = function(calendarId){
                $scope.loading = true;
                LeaderMESservice.customAPI('GetCalendarEvents', {
                    CalendarID: calendarId || $scope.calendarId || undefined,
                    Department: $scope.view === 'departmentMachine' ? $scope.departmentId : undefined,
                    // formID: 10128,
                    // pairs: [{FieldName: "CalendarID", Eq: calendarId || $scope.calendarId, DataType: "num"}]
                }).then(function (response) {
                    if (!calendarId){
                        $scope.removeAllEvents();
                    }
                    if ($scope.machineId){
                        $scope.getMachineJobQueue();
                    }
                    if ($scope.departmentId){
                        $scope.getDepartmentShifts();
                    }
                    $scope.departmentCalendarId = response.CalendarID;
                    calendarDirectiveCtrl.calendarsPulled[calendarId || $scope.calendarId] = true;
                    var displayedCalendar = true;
                    if (calendarDirectiveCtrl.displayedCalendars) {
                        displayedCalendar = calendarDirectiveCtrl.displayedCalendars.indexOf(parseInt(calendarId || $scope.calendarId)) >= 0;
                    }
                    if(response && response.CalendarEvents){
                        $scope.eventsList = _.map(response.CalendarEvents,function(event){
                            var otherColor = null;
                            if (calendarDirectiveCtrl.myCalendarsObjectColors){
                                var otherColor = calendarDirectiveCtrl.myCalendarsObjectColors[calendarId || $scope.calendarId];
                            }
                            return {
                                title: event.Event + (event.Descr ? ' - ' + event.Descr : ''),
                                name: event.Event,
                                calendarId : calendarId || $scope.calendarId,
                                desc: event.Descr,
                                eventID: event.ID, //TODO
                                start: moment(event.DateFrom, 'YYYY-MM-DD HH:mm:ss'),
                                end: moment(event.DateTo, 'YYYY-MM-DD HH:mm:ss'),
                                defaultBG : event.Color,
                                backgroundColor: event.Color,
                                borderColor : otherColor,
                                editable: event.Department === 0 && true || false,
                                className:  `event-calendar-${(calendarId || $scope.calendarId)} ${event.Department !== 0 ? 'not-department-event' : ''} ${displayedCalendar ? '' : 'hidden'}`
                            };
                        });
                        if($scope.calendarElement){
                            $scope.deleteTooltip();
                            $scope.calendarElement.fullCalendar("renderEvents", $scope.eventsList, true);
                        }
                    }
                    $scope.loading = false;
                });

            };
    
            $scope.updateNewEvent = function(data,id) {
                LeaderMESservice.customAPI('DisplayFormResults', {
                    LeaderID: id,
                    formID: 101281,
                    pairs: []
                }).then(function (response) {
                    $scope.LoadData();
                });
                $scope.calendarCallBackFucntion = null;
            };

            $scope.newEvent = function(start, end){
                $scope.newEventData = {
                    start,
                    end
                };
                customServices.customGetCode($scope, 'custom:popupCreateEvent');
            };

            $scope.deleteTooltip = function(){
                $('.popover').remove();
            }

            calendarDirectiveCtrl.removeEvent = function(eventId,_id){
                var tabs = LeaderMESservice.getTabsByAppName("CalendarEvent");
                if (tabs){
                    var action = angular.copy(_.find(tabs.Actions, {SubMenuAppPartID: 11095}));
                    if (action){
                        action.SubMenuTargetParameters = "";
                    }
                    $scope.calendarPairs = [];
                    $scope.calendarPairs.push({
                        DataType: "num",
                        Eq: eventId,
                        FieldName: "ID"
                    });
                    if(action){
                        $scope.calendarCallBackFucntion = function(pairs) {
                            // var removeField = _.find(pairs,{FieldName : "DeleteOption"});
                            // if (removeField.Eq == 2 || removeField.Eq == 3){
                            //     if ($scope.parentEvents[eventId]){
                            //         $scope.calendarElement.fullCalendar("removeEvents", function(event){
                            //             if ($scope.parentEvents[eventId].indexOf(event.eventID) >= 0){
                            //                 return true;
                            //             }
                            //             return false;
                            //         });
                            //     }
                            // }
                            // if (removeField.Eq != 2){
                            //     $scope.calendarElement.fullCalendar( "removeEvents", [_id] );
                            // }
                            $scope.LoadData();
                            $scope.calendarCallBackFucntion = null;
                        };
                        commonFunctions.wizard($scope,action,$scope.calendarId);
                    }
                }
            }

            calendarDirectiveCtrl.copyEvent = function(eventId,_id){
                // var tabs = LeaderMESservice.getTabsByAppName("CalendarEvent");
                // if (tabs){
                //     var action = angular.copy(_.find(tabs.Actions, {SubMenuAppPartID: 11100}));
                //     if (action){
                //         action.SubMenuTargetParameters = "";
                //     }
                //     $scope.calendarPairs = [];
                //     $scope.calendarPairs.push({
                //         DataType: "num",
                //         Eq: eventId,
                //         FieldName: "ID"
                //     });
                //     if(action){
                //         $scope.calendarCallBackFucntion = function(){
                //             $scope.calendarCallBackFucntion = null;
                //         };
                //         commonFunctions.wizard($scope,action,$scope.calendarId);
                //     }
                // }
                var actionModalInstance = $modal.open({

                    templateUrl: 'js/components/calendar/copyEventModel.html',
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    },
                    controller: function ($scope, $compile, $modalInstance, LeaderMESservice, parentScope) {
                        var copyEventCtrl = this;
                        var selectAll = true;
                        copyEventCtrl.TargetCalendarID = [];
                        LeaderMESservice.customGetAPI('GetCalendars').then(function(response){
                            copyEventCtrl.calendars = response.Data;
                            copyEventCtrl.calendars.unshift({
                                    DisplayEName: $filter('translate')('UN_SELECT_ALL'),
                                    DisplayLName: $filter('translate')('UN_SELECT_ALL'),
                                    DisplayOrder: -1,
                                    ID: -1,
                                    UrlTarget: null,
                                    Value: null,
                            })
                        });

                        copyEventCtrl.calendarChange = function(){
                            var selectAllIndex = copyEventCtrl.TargetCalendarID.indexOf(-1);
                            if (selectAllIndex >= 0) {
                                copyEventCtrl.TargetCalendarID = null;  
                                $timeout(function() {
                                    if (selectAll) {
                                        copyEventCtrl.TargetCalendarID = 
                                            copyEventCtrl.calendars.filter(calendar => calendar.ID !== -1)
                                            .map(calendar => calendar.ID);
                                    }
                                    else{
                                        copyEventCtrl.TargetCalendarID = [];
                                    }
                                    selectAll = !selectAll;
                                },0);
                            }
                        };

                        copyEventCtrl.loading = true;
                        copyEventCtrl.rtl = LeaderMESservice.isLanguageRTL();
                        copyEventCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
                        copyEventCtrl.close = function(){
                            $modalInstance.close();
                        }

                        copyEventCtrl.copyEvent = function(){
                            if (!(copyEventCtrl.TargetCalendarID && copyEventCtrl.TargetCalendarID.length > 0)){
                                return;
                            }
                            LeaderMESservice.customAPI('CalendarEventCopy',{"CalendarEventID":eventId,"TargetCalendarID":copyEventCtrl.TargetCalendarID}).then(function(response){
                                if (response.error !== null) {
                                    notify({
                                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                                        classes: 'alert-danger',
                                        templateUrl: 'views/common/notify.html'
                                    });
                                }
                                else{
                                    parentScope.LoadData();
                                    toastr.clear();
                                    toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                    $modalInstance.close();
                                }
                            })
                        }
                    },
                    controllerAs: 'copyEventCtrl'
                });
            }

            var updateShiftEventsData = function(){
                if (!$scope.shiftEvents){
                    return;
                }
                if (!$scope.viewShift){
                    $scope.calendarElement.fullCalendar( "removeEvents", function(event){
                        if (event.shiftEvent){
                            return true;
                        }
                        return false;
                    });
                }
                else{
                    $scope.calendarElement.fullCalendar("renderEvents", angular.copy($scope.shiftEvents), true);
                }
            }

            var updateJobQueueEventsData = function(){
                if (!$scope.jobQueueEvents){
                    return;
                }
                if (!$scope.viewJobs){
                    $scope.calendarElement.fullCalendar( "removeEvents", function(event){
                        if (event.jobEvent){
                            return true;
                        }
                        return false;
                    });
                }
                else{
                    $scope.calendarElement.fullCalendar("renderEvents", angular.copy($scope.jobQueueEvents), true);
                }
            }

            $scope.CalendarDefaultOptions = {
                "default" : {
                    allDaySlot : false,
                    customButtons : {
                        refresh :{
                            icon: 'dummy fa fa-refresh',
                            click: function() {
                                $scope.LoadData();
                            },
                            bootstrapGlyphicon : "glyphicon-refresh"
                        },
                        toggleShift : $scope.machineId && {
                            text : $filter('translate')('SHIFTS'),
                            click: function() {
                                $scope.viewShift = !$scope.viewShift;
                                if ($scope.viewJobs  && $scope.viewShift){
                                    $scope.viewJobs = !$scope.viewJobs;
                                    updateJobQueueEventsData();
                                }
                                // if ($scope.viewShift && $scope.view == "mainCalendar" && 
                                // calendarDirectiveCtrl.displayedCalendars.length == 1){
                                //     $scope.getDepartmentShifts(calendarDirectiveCtrl.displayedCalendars[0]);
                                // }
                                updateShiftEventsData();
                            }
                        },
                        toggleJobs : $scope.machineId && {
                            text : $filter('translate')('JOBS'),
                            click: function() {
                                $scope.viewJobs = !$scope.viewJobs;
                                if ($scope.viewJobs  && $scope.viewShift){
                                    $scope.viewShift = !$scope.viewShift;
                                    updateShiftEventsData();
                                }
                                updateJobQueueEventsData();
                            }
                        }
                    },
                    isRTL : LeaderMESservice.isLanguageRTL(),
                    locale : languageLocaleMap[LeaderMESservice.getLanguage()],
                    height: $scope.height ? $scope.height() : "auto",
                    editable: true,
                    selectable: true,
                    selectHelper: true,
                    timeFormat: 'H:mm',
                    slotLabelFormat : 'H:mm',
                    selectAllow  : function(){
                        if (calendarDirectiveCtrl.displayedCalendars && 
                            calendarDirectiveCtrl.displayedCalendars.length > 1){
                            return false;
                        }
                        else{
                            return true;
                        }
                    }
                },
                "mainCalendar" :{
                    header: {
                        left: 'prev,next,refresh',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay'
                    },
                    bootstrapGlyphicons  : {
                        refresh : "glyphicon-refresh"
                    },
                    defaultView : "agendaWeek",
                    select: function (start, end, allDay) {
                        $scope.newEvent(start, end);
                        $scope.calendarElement.fullCalendar('unselect');
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        $scope.editEvent(calEvent);
                    },
                    eventMouseover: function(calEvent, jsEvent) {
                        var tooltip = '<div class="popover right tooltipevent" ' + 
                            'style="z-index:10001;display:block"><div class="popover-title">'+ 
                            calEvent.title +
                            '</div><div class="arrow"></div>' + 
                            '<div class="popover-content" style="padding:10px;direction: ltr">'+
                            calEvent.start.format("DD/MM/YYYY HH:mm") + 
                            ' - ' + 
                            calEvent.end.format("DD/MM/YYYY HH:mm") +
                            '</div>' + '</div>';
                        var $tooltip = $(tooltip).appendTo('body');

                        $(this).mouseover(function(e) {
                            $(this).css('z-index', 10000);
                            $tooltip.fadeIn('500');
                            $tooltip.fadeTo('10', 1.9);
                            $tooltip.css('top', e.pageY * $rootScope.scaleAfterZoom + 10);
                            $tooltip.css('left', e.pageX * $rootScope.scaleAfterZoom + 20);
                        }).mousemove(function(e) {
                            $tooltip.css('top', e.pageY * $rootScope.scaleAfterZoom + 10);
                            $tooltip.css('left', e.pageX * $rootScope.scaleAfterZoom + 20);
                        });
                    },
                    eventRender: function(event, element, calEvent) {
                        if(!event.rendering && event._id){
                            element.append($compile("<div class=\"removeIcon\" ng-click=\"calendarDirectiveCtrl.removeEvent(" + event.eventID + ",'" + event._id + "');$event.stopPropagation()\"><i class=\"fa fa-trash-o\"></i></div>")($scope));
                            element.append($compile("<div class=\"copyIcon\" ng-click=\"calendarDirectiveCtrl.copyEvent(" + event.eventID + ");$event.stopPropagation()\"><i class=\"fa fa-files-o\"></i></div>")($scope));
                        }
                    },
                    eventMouseout: function(calEvent, jsEvent) {
                        $(this).css('z-index', 8);
                        $('.tooltipevent').remove();
                        $('.popover').remove();
                    },
                    eventResize: function(event, delta, revertFunc) {
                        $scope.updateEvent(event,revertFunc);
                    },
                    eventDrop: function(event, delta, revertFunc){
                        $scope.updateEvent(event,revertFunc);
                    }
                 
                },
                "departmentMachine" : {
                    header: {
                        left: 'prev,next,refresh toggleShift toggleJobs',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay'
                    },
                    bootstrapGlyphicons  : {
                        refresh : "glyphicon-refresh"
                    },
                    defaultView : "agendaWeek",
                    select: function (start, end, allDay) {
                        $scope.newEvent(start, end);
                        $scope.calendarElement.fullCalendar('unselect');
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        $scope.editEvent(calEvent);
                    },
                    eventMouseover: function(calEvent, jsEvent) {
                        if (!calEvent._id){
                            return;
                        }
                        var tooltip = '<div class="popover right tooltipevent" ' + 
                        'style="z-index:10001;display:block;"><div class="popover-title">'+ 
                        calEvent.title + (calEvent.ErpJobID ? " (" + calEvent.ErpJobID  + ")" : '') + (calEvent.productName ? ' - ' + calEvent.productName : '') +
                        '</div><div class="arrow"></div>' + 
                        '<div class="popover-content" style="padding:10px;direction: ltr">'+ 
                        calEvent.start.format("DD/MM/YYYY HH:mm") +
                        ' - '+ 
                        calEvent.end.format("DD/MM/YYYY HH:mm") +
                        '</div>' + '</div>';
                        var $tooltip = $(tooltip).appendTo('body');

                        $(this).mouseover(function(e) {
                            $(this).css('z-index', 10000);
                            $tooltip.fadeIn('500');
                            $tooltip.fadeTo('10', 1.9);
                            $tooltip.css('top', e.pageY * $rootScope.scaleAfterZoom + 10);
                            $tooltip.css('left', e.pageX * $rootScope.scaleAfterZoom + 40);
                        }).mousemove(function(e) {
                            $tooltip.css('top', e.pageY * $rootScope.scaleAfterZoom + 10);
                            $tooltip.css('left', e.pageX * $rootScope.scaleAfterZoom + 40);
                        });
                    },
                    eventRender: function(event, element, calEvent) {
                        if(!event.rendering && event._id && event.editable){
                            if (!event.jobEvent && !event.shiftEvent){
                                element.append($compile("<div class=\"removeIcon\" ng-click=\"calendarDirectiveCtrl.removeEvent(" + event.eventID + ",'" + event._id + "');$event.stopPropagation()\"><i class=\"fa fa-trash-o\"></i></div>")($scope));
                                element.append($compile("<div class=\"copyIcon\" ng-click=\"calendarDirectiveCtrl.copyEvent(" + event.eventID + ");$event.stopPropagation()\"><i class=\"fa fa-files-o\"></i></div>")($scope));
                            }
                        }
                        else if (event.rendering && event.shiftEvent && event.end - event.start > 3600000){
                            element.append(
                                '<div class="fc-content">' + 
                                    '<div class="fc-time">' + 
                                        '<span>' + event.origStart + ' - ' + event.origEnd + '</span>' + 
                                    '</div>' + 
                                    '<div class="fc-title">' + 
                                        event.title + 
                                    '</div>' + 
                                '</div>'
                            );
                        }
                    },
                    eventMouseout: function(calEvent, jsEvent) {
                        $(this).css('z-index', 8);
                        $('.tooltipevent').remove();
                        $('.popover').remove();
                    },
                    
                    eventResize: function(event, delta, revertFunc) {
                        $scope.updateEvent(event,revertFunc);
                    },
                    eventDrop: function(event, delta, revertFunc){
                        $scope.updateEvent(event,revertFunc);
                    }
                }
            };
    
            calendarShiftService.loadCalendarShiftService($scope,calendarDirectiveCtrl);

            $scope.getCalenderDefaultOptions = function(){
                return angular.copy(Object.assign($scope.CalendarDefaultOptions.default,$scope.CalendarDefaultOptions[$scope.view]));
            };

        };



    return {
        loadCalendarService: loadCalendarService
    }
});