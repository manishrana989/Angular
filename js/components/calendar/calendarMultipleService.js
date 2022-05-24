angular.module('LeaderMESfe')
    .factory('calendarMultipleService', function ($compile, LeaderMESservice, commonFunctions, 
            $filter, notify, $timeout, toastr) {


        var loadMultipleCalendarService = function($scope, calendarDirectiveCtrl){
            if (calendarDirectiveCtrl.displayedCalendars){
                return;
            }
            calendarDirectiveCtrl.multipleCalendarActivated = true;
            calendarDirectiveCtrl.displayedCalendars = [$scope.calendarId];
            LeaderMESservice.customAPI('GetResultSearchFields',
                {"reportID":160,"IsUserReport":false,"sfCriteria":[]}).then(function(response){
                    calendarDirectiveCtrl.myCalendars = response[1];
                    calendarDirectiveCtrl.myCalendars = _.filter(calendarDirectiveCtrl.myCalendars,{IsActive: true});
                    calendarDirectiveCtrl.myCalendars = _.sortBy(calendarDirectiveCtrl.myCalendars,['CalendarName']);
                    var currentCalendarIndex = _.findIndex(calendarDirectiveCtrl.myCalendars,{ID : $scope.calendarId});
                    if (currentCalendarIndex >= 0){
                        calendarDirectiveCtrl.myCalendars[currentCalendarIndex].selected = true;
                        var currentCalendar = calendarDirectiveCtrl.myCalendars[currentCalendarIndex];
                        calendarDirectiveCtrl.myCalendars.splice(currentCalendarIndex,1);
                        calendarDirectiveCtrl.myCalendars.unshift(currentCalendar);
                    }
                    var colors = calendarDirectiveCtrl.getColorsPallete();
                    for (var i = 0;i < calendarDirectiveCtrl.myCalendars.length; i++){
                        calendarDirectiveCtrl.myCalendars[i].color = colors[i % colors.length];
                    }
                    calendarDirectiveCtrl.myCalendarsObjectColors = getCalendarEventsColors();
            });
            
            var getCalednarEvents = function(calendarId){
                var allEvents = $scope.calendarElement.fullCalendar('clientEvents');
                var filteredEvents = _.filter(allEvents,function(event){
                    if (event.calendarId 
                        && event.calendarId == calendarId){
                        return true;
                    };
                    return false;
                });
                return filteredEvents;
            };

            var getCalendarEventsColors = function(){
                var ans = {};
                calendarDirectiveCtrl.myCalendars.forEach(function(calendar){
                    ans[calendar.ID] = calendar.color;
                })
                return ans;
            }

            var hideCalendar = function(calendarId){
                var events = getCalednarEvents(calendarId);
                if (events && events.length > 0){
                    events.forEach(function(event){
                        var indexOfHidden = event.className.indexOf("hidden");
                        if (indexOfHidden < 0){
                            event.className.push("hidden");
                        }
                    });
                    $scope.calendarElement.fullCalendar('updateEvents', events);
                }
            }


            var showCalendar = function(calendarId){
                var events = getCalednarEvents(calendarId);
                if (events && events.length > 0){
                    events.forEach(function(event){
                        var indexOfHidden = event.className.indexOf("hidden");
                        if (indexOfHidden >= 0){
                            event.className.splice(indexOfHidden,1);
                        }
                        if (calendarDirectiveCtrl.displayedCalendars.length == 1){
                            event.backgroundColor = event.defaultBG;
                        }
                        else if (calendarDirectiveCtrl.displayedCalendars.length > 1){
                            // event.backgroundColor = calendarDirectiveCtrl.myCalendarsObjectColors[event.calendarId];
                            event.backgroundColor = event.defaultBG;
                        }
                    });
                    $scope.calendarElement.fullCalendar('updateEvents', events);
                }
            }

            calendarDirectiveCtrl.toggleCalendar = function(calendar){
                if (!calendar.selected){
                    hideCalendar(calendar.ID);
                    calendarDirectiveCtrl.displayedCalendars.splice(calendarDirectiveCtrl.displayedCalendars.indexOf(calendar.ID),1);
                    if (calendarDirectiveCtrl.displayedCalendars.length == 1){
                        //calendarDirectiveCtrl.updateColorEvents(calendarDirectiveCtrl.displayedCalendars[0]);
                    }
                }
                else{
                    calendarDirectiveCtrl.displayedCalendars.push(calendar.ID);
                    if (calendarDirectiveCtrl.calendarsPulled[calendar.ID]){
                        showCalendar(calendar.ID);
                    }
                    else{
                        $scope.getCalendarEvents(calendar.ID);
                    }
                    if (calendarDirectiveCtrl.displayedCalendars.length == 2){
                        // calendarDirectiveCtrl.updateColorEvents(calendarDirectiveCtrl.displayedCalendars[0],
                        //     calendarDirectiveCtrl.myCalendarsObjectColors[calendarDirectiveCtrl.displayedCalendars[0]]);
                    }
                }
                if (calendarDirectiveCtrl.displayedCalendars.length !== 1){
                    $scope.viewJobs = false;
                    $scope.viewShift = false;
                }
            };

            calendarDirectiveCtrl.updateColorEvents = function(calendarId,color){
                var events = getCalednarEvents(calendarId);
                events.forEach(function(event){
                    event.backgroundColor = color || event.defaultBG;
                });
                $scope.calendarElement.fullCalendar('updateEvents', events);
            }
        };

    return {
        loadMultipleCalendarService : loadMultipleCalendarService
    }
});