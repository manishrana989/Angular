angular.module('LeaderMESfe')
    .factory('calendarShiftService', function ($compile, LeaderMESservice, commonFunctions, $filter, notify, $q, toastr, $timeout) {


        var loadCalendarShiftService = function($scope, calendarDirectiveCtrl){
            var localLanguage = LeaderMESservice.showLocalLanguage();

            var overlapEvents = function(uniqeEvents){
                uniqeEvents.sort(function(a,b){
                    return a.start - b.start;
                });
                for(var i = 0;i < uniqeEvents.length;i++){
                    if (i == uniqeEvents.length - 1){
                        if ((uniqeEvents[i].end - uniqeEvents[0].start) % 86400000 !== 0){
                            return true;
                        }
                    }
                    else if (uniqeEvents[i].end - uniqeEvents[i + 1].start !== 0){
                        return true;
                    }
                }
                return false;
            };

            $scope.saveCalendarShift = function(){
                if ($scope.saveLoading){
                    return;
                }
                $scope.saveLoading = true;
                var allEventsSegs = $scope.calendarElement.fullCalendar('getView').getEventSegs()
                var allEvents = _.map(allEventsSegs,'event');
                var uniqeEvents = _.unique(allEvents,'_id');
                if (overlapEvents(uniqeEvents)){
                    notify({
                        message:  $filter('translate')("CALENDAR_OVERLAP_GAP"),
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    }); 
                    $scope.saveLoading = false;
                    return;
                }
                var newEvents = _.remove(uniqeEvents,{eventID : 0});
                var changedEvents = _.filter(uniqeEvents,{changed : true});
                if (newEvents.length > 0 || changedEvents.length > 0 || $scope.removeCalendarShiftEvents.length > 0){
                    var request = {
                        "TopObjectID": $scope.calendarId,
                        "formID": 6026,
                        "records": [],
                        "skipSaveOperation": false
                    };
                    for (var i = 0;i < $scope.removeCalendarShiftEvents.length ; i++){
                        request.records.push({
                            "Action": "Delete",
                            "pairs": [
                              {
                                "FieldName": "ID",
                                "Eq": $scope.removeCalendarShiftEvents[i],
                                "DataType": "num"
                              }
                            ]
                          });
                    };
                    for (var i = 0;i < changedEvents.length ; i++){
                        request.records.push($scope.getUpdateShiftEventObject(changedEvents[i]));
                    };
                    for (var i = 0;i < newEvents.length ; i++){
                        request.records.push($scope.getNewShiftEventObject(newEvents[i]));
                    };
                    LeaderMESservice.customAPI('multiRecordsUpsert',request).then(function(response){
                        $scope.saveLoading = false;
                        if (response.error !== null) {
                            notify({
                                message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                                classes: 'alert-danger',
                                templateUrl: 'views/common/notify.html'
                            });
                        }
                        else{
                            $scope.LoadData();
                            toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                        }
                    });
                }
                else{
                    $scope.saveLoading = false;
                    notify({
                        message: $filter('translate')("NOTHING_TO_SAVE"),
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    }); 
                }
            };

            $scope.getNewShiftEventObject = function(event){
                var object = {
                    "Action": "New",
                    "pairs": []
                };
                object.pairs.push({
                    "FieldName": "ShiftName",
                    "Eq": event.title,
                    "DataType": "text"
                });
                object.pairs.push({
                    "FieldName": "ID",
                    "Eq": 0,
                    "DataType": "num"
                });
                object.pairs.push({
                    "FieldName": "ShiftCalendarID",
                    "Eq": $scope.calendarId,
                    "DataType": "num"
                });
                object.pairs.push({
                    "FieldName": "WDay",
                    "Eq": event.start.day() + 1,
                    "DataType": "num"
                });
                object.pairs.push({
                    "FieldName": "EndWDay",
                    "Eq": event.end.day() + 1,
                    "DataType": "num"
                });
                object.pairs.push({
                    "FieldName": "StartTime",
                    "Eq": "1899-12-30 " 
                        + $scope.numTwoDigits(event.start.hour()) + ":"
                        + $scope.numTwoDigits(event.start.minute()) + ":"
                        + "00",
                    "DataType": "Date"
                });
                object.pairs.push({
                    "FieldName": "EndTime",
                    "Eq": "1899-12-30 " 
                        + $scope.numTwoDigits(event.end.hour()) + ":"
                        + $scope.numTwoDigits(event.end.minute()) + ":"
                        + "00",
                    "DataType": "Date"
                });
                return object;
            };

            $scope.getUpdateShiftEventObject = function(event){
                var object = {
                    "Action": "Update",
                    "pairs": []
                };
                object.pairs.push({
                    "FieldName": "ID",
                    "Eq": event.eventID,
                    "DataType": "num"
                });
                object.pairs.push({
                    "FieldName": "ShiftCalendarID",
                    "Eq": $scope.calendarId,
                    "DataType": "num"
                });
                if (event.endChanged){
                    object.pairs.push({
                        "FieldName": "EndTime",
                        "Eq": "1899-12-30 " 
                                + $scope.numTwoDigits(event.end.hour()) + ":"
                                + $scope.numTwoDigits(event.end.minute()) + ":"
                                + "00",
                        "DataType": "Date"
                    });
                    object.pairs.push({
                        "FieldName": "EndWDay",
                        "Eq": event.end.day() + 1,
                        "DataType": "num"
                    });
                }
                if (event.startChanged){
                    object.pairs.push({
                        "FieldName": "StartTime",
                        "Eq": "1899-12-30 " 
                                + $scope.numTwoDigits(event.start.hour()) + ":"
                                + $scope.numTwoDigits(event.start.minute()) + ":"
                                + "00",
                        "DataType": "Date"
                    });
                    object.pairs.push({
                        "FieldName": "WDay",
                        "Eq": event.start.day() + 1,
                        "DataType": "num"
                    });
                }
                return object;
            };

            $scope.numTwoDigits = function(num){
                if (num < 10){
                    return "0" + num;
                }
                return "" + num;
            };

            $scope.newCalendarShift = function(start, end, id, title){
                var StartTime = start.format("DD/MM/YYYY HH:mm:ss");
                var EndTime = end.format("DD/MM/YYYY HH:mm:ss");
                var diffDays = start.day() - end.day();
                if (diffDays < 0){
                    diffDays = 7 + diffDays;
                }
                var newShiftCalendar = {
                    title : title || "",
                    eventID : id || 0,
                    start: getHoursMin(StartTime),
                    end: getHoursMin(EndTime,StartTime,diffDays),
                    backgroundColor: "green",
                    dow : [start.day()]
                };
                $scope.deleteTooltip();
                $scope.calendarElement.fullCalendar("renderEvent", newShiftCalendar, true);
            };

            calendarDirectiveCtrl.removeCalendarShiftEvent = function(eventID,_id){
                if (eventID != 0){
                    $scope.removeCalendarShiftEvents.push(eventID);
                }

                var allEvents = $scope.calendarElement.fullCalendar('getView').getEventSegs();
                var currentEvent = _.find(allEvents,{event : {_id : _id}, isStart : true});
                var sameStartTimeEvents = _.filter(allEvents,function(eventSeg){
                    return currentEvent.event.start + 1 == eventSeg.event.start + 1 && currentEvent.event._id != eventSeg.event._id;
                });
                if (sameStartTimeEvents.length == 0){
                    var prevEvents = _.filter(allEvents,function(eventSeg){
                        return currentEvent.start + 1 == eventSeg.event.end + 1;
                    });
                    if (prevEvents && prevEvents.length > 0){
                        var prevEvent = _.find(allEvents,{event : {_id : prevEvents[0].event._id}});
                        if (prevEvent && prevEvent.event){
                            var event = prevEvent.event;
                            event.end = event.end +  (currentEvent.event.end - currentEvent.event.start);
                            event.end = $scope.calendarElement.fullCalendar('getCalendar').moment(event.end);
                            event.endChanged = true;
                            event.changed = true;
                            $scope.calendarElement.fullCalendar('updateEvent', event);
                        }
                    }
                }
                $scope.calendarElement.fullCalendar( "removeEvents", [_id] );
            };

            calendarDirectiveCtrl.splitCalendarShiftEvent = function(eventID,_id){
                var allEvents = $scope.calendarElement.fullCalendar('getView').getEventSegs();
                var eventSeg = _.find(allEvents,{event : {_id : _id}});
                if (eventSeg){
                    var event = eventSeg.event;
                    if (!event.index){
                        event.index = 0;   
                    }
                    event.index++;
                    event.changed = true;
                    event.endChanged = true;
                    var newEnd = event.end;
                    event.end = $scope.calendarElement.fullCalendar('getCalendar').moment((event.start + event.end) / 2);
                    event.end.second(0);
                    event.end.minute(event.end.minute() - (event.end.minute() % 5));
                    var newStart = event.end;
                    $scope.calendarElement.fullCalendar('updateEvent', event);
                    $scope.newCalendarShift(newStart,newEnd,0,event.title + "." + event.index);
                }
            };

            calendarDirectiveCtrl.expandCalendarShiftEvent = function(eventID,_id){
                var allEvents = $scope.calendarElement.fullCalendar('getView').getEventSegs();
                var eventSeg = _.find(allEvents,{event : {_id : _id}});
                if (eventSeg){
                    var minimumDelta = 86400000;
                    var minimumIndex = -1;
                    for (var i = 0;i < allEvents.length; i++){
                        if (allEvents[i].event._id == _id){
                            continue;
                        }
                        if (allEvents[i].event.start >=  eventSeg.event.end && allEvents[i].event.start - eventSeg.event.end < minimumDelta){
                            minimumDelta = allEvents[i].event.start - eventSeg.event.end;
                            minimumIndex = i;
                        }
                    }
                    if (minimumIndex >= 0 && minimumDelta > 0){
                        eventSeg.event.end.subtract(-minimumDelta,'milliseconds');
                        eventSeg.event.changed = true;
                        eventSeg.event.endChanged = true;
                        $scope.calendarElement.fullCalendar('updateEvent', eventSeg.event);
                    }
                }
            };

            $scope.getCalendarShifts = function(){
                if ($scope.loading){
                    $scope.canceler.resolve();
                }
                $scope.loading = true;
                $scope.canceler = $q.defer();
                LeaderMESservice.customAPI('DisplayFormResults', {
                    "LeaderID": $scope.calendarId,
                    "formID":6026,
                    "pairs":[{"FieldName":"ShiftCalendarID","Eq":$scope.calendarId,"DataType":"num"}]
                },$scope.canceler).then(function (response) {
                    $scope.removeCalendarShiftEvents = [];
                    $scope.removeAllEvents();
                    if(response && response.AllrecordValue){
                        $scope.calendarShifts = [];
                        response.AllrecordValue.forEach(function(event,index){
                            var obj = $scope.getShiftObject(event,index);
                            if (obj){
                                $scope.calendarShifts.push(obj);
                            }
                        });
                        if($scope.calendarElement){
                            $scope.calendarElement.fullCalendar("changeView", 'month');
                            $scope.deleteTooltip();
                            $scope.calendarElement.fullCalendar("renderEvents", $scope.calendarShifts, true);
                            $scope.calendarElement.fullCalendar("changeView", 'agendaWeek');
                        }
                    }
                    $scope.canceler.resolve();
                    $scope.loading = false;
                });
            };

            var getHour = function(timeText){
                var ans = timeText.split(" ")[1];
                ans = ans.split(":");
                return ans[0];
            };

            var getMinutes = function(timeText){
                var ans = timeText.split(" ")[1];
                ans = ans.split(":");
                return ans[1];
            };

            var getHoursMin = function(dateText,begin,diffDays){
                var hour = getHour(dateText);
                var minutes = getMinutes(dateText);
                if (begin){
                    var startHour = getHour(begin);
                    return (hour > startHour && diffDays == 0 ? hour : 24 * diffDays + parseInt(hour)) + ":" + minutes;
                }
                else{
                    return hour + ":" + minutes;
                }

            };
            $scope.getShiftObject = function(event,index) {
                var id = _.find(event, {Name: "ID"}).value;
                var WDay = _.find(event, {Name: "WDay"}).value;
                var EndWDay = _.find(event, {Name: "EndWDay"}).value;
                var StartTime = _.find(event, {Name: "StartTime"}).value;
                var EndTime = _.find(event, {Name: "EndTime"}).value;
                var ShiftName = _.find(event, {Name: "ShiftName"}).value;
                var BGcolor = 'black';
                var diffDays = EndWDay - WDay;
                if (diffDays < 0){
                    diffDays = EndWDay - WDay + 7;
                }
                if (StartTime == "" || StartTime == null 
                || EndTime == "" || EndTime == ""){
                    return null;
                }
                var colors = calendarDirectiveCtrl.getColorsPallete();
                BGcolor = colors[index % colors.length];
                return {
                    title: ShiftName,
                    eventID: id,
                    start: getHoursMin(StartTime),
                    end: getHoursMin(EndTime,StartTime,diffDays),
                    backgroundColor: "white",
                    dow : [WDay - 1],
                    className : "shift-calendar-event"
                };
            };

            $scope.CalendarDefaultOptions.siteSetup = {
                header: {
                    left: 'refresh',
                    center: '',
                    right: ''
                },
                slotDuration : '00:30:00',
                // columnHeaderFormat : "dddd",
                visibleRange: function(currentDate) {
                    var today = new Date();
                    today.setHours(0);
                    today.setMinutes(0);
                    today.setSeconds(0);
                    today.setMilliseconds(0);
                    currentDate = moment(today);
                    return {
                      start: currentDate.clone().subtract(currentDate.day(), 'days'),
                      end: currentDate.clone().add( 6 - currentDate.day() + 2, 'days')
                    };
                },
                defaultView : "agendaWeek",
                select: function (start, end, allDay) {
                    $scope.newCalendarShift(start, end);  
                    $scope.calendarElement.fullCalendar('unselect');
                },
                draggable : false,
                selectable : false,
                eventStartEditable  : false,
                eventResize: function(event, delta, revertFunc) {
                    event.changed = true;
                    event.endChanged= true;
                    var allEvents = $scope.calendarElement.fullCalendar('getView').getEventSegs();
                    var currentEvent = _.find(allEvents,{event : {_id : event._id}, isEnd : true});
                    var nextEvent = _.filter(allEvents,function(eventSeg){
                        return currentEvent.end + 1 == eventSeg.event.start + 1;
                    });
                    var milliseconds = delta._milliseconds;
                    if (nextEvent && nextEvent.length > 0){
                        var nextEvents = _.filter(allEvents,{event : {_id : nextEvent[0].event._id}});
                        for (var i = 0;i < nextEvents.length ;i++){
                            //TODO bug with change the event twice from back and end.
                            if (nextEvents[i] && ((event.end - milliseconds ) - nextEvents[i].event.start) % 86400000 == 0 ){
                                nextEvents[i].event.start.subtract(-milliseconds,'milliseconds');
                                nextEvents[i].event.startChanged = true;
                                nextEvents[i].event.changed = true;
                            }
                        }
                    }
                    return true;
                },
                eventRender: function(event, element, calEvent) {
                    element.append($compile("<div class=\"removeIcon\" ng-click=\"calendarDirectiveCtrl.removeCalendarShiftEvent(" + event.eventID + ",'" + event._id + "');$event.stopPropagation()\"><i class=\"fa fa-trash-o\"></i></div>")($scope));
                    element.append($compile("<div class=\"copyIcon\" ng-click=\"calendarDirectiveCtrl.splitCalendarShiftEvent(" + event.eventID + ",'" + event._id + "');$event.stopPropagation()\"><i class=\"fa fa-files-o\"></i></div>")($scope));
                    element.append($compile("<div class=\"expandIcon\" ng-click=\"calendarDirectiveCtrl.expandCalendarShiftEvent(" + event.eventID + ",'" + event._id + "');$event.stopPropagation()\"><i class=\"fa fa-angle-double-down\"></i></div>")($scope));
                },
                eventClick: function(event, jsEvent, view) {
                    $timeout(() => {
                        calendarDirectiveCtrl.openEditModal = true;
                        calendarDirectiveCtrl.openEditModalTitle = event.title;
                    })
                    $scope.changes = [];
                    $scope.recordValue = [];
                    $scope.formCallBack = function () {
                        $scope.emptyPage();
                    };
                    $scope.actionName = "SAVE_CHANGES";
                    var request = {
                        LeaderID : event.eventID,
                        formID : 60261
                    };
                    var requestResponse = {
                        LeaderID : event.eventID,
                        formID : 60261
                    };
                    $scope.formId = 60261;
                    $scope.leaderId = event.eventID;
                    $scope.pairs = [];
                    $scope.actionName = "SAVE_CHANGES";
                    $scope.request = request;
                    $scope.SkipSaveOperation = false;
                    $scope.api = 'DisplayFormResults'
                    $scope.fullSize = true;
                    $scope.loading = false;
                    // commonFunctions.formResults($scope, request, requestResponse,'DisplayFormResults',[] , false);
                }
            };

        };



    return {
        loadCalendarShiftService : loadCalendarShiftService
    }
});