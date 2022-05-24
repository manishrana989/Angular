function calendarDirective() {
    var template = "js/components/calendar/calendarDirective.html";

    var controller = function($scope, commonFunctions, LeaderMESservice, 
        $element, $state, $filter, $compile, $timeout, $rootScope, 
        calendarService,configuration, calendarMultipleService){
        var calendarDirectiveCtrl = this;
        $scope.content = {};
        configuration.getSection("calendar").then(function(calendarConfig){
            calendarDirectiveCtrl.calendarConfig = calendarConfig;
        });
        // This is passed to the full calendar to correct the zoom cord.
        $.fullCalendar.scaleScroll = $rootScope.scaleAfterZoom;
        calendarService.loadCalendarService($scope,calendarDirectiveCtrl);
        $scope.eventsList = [];
        $scope.calendarElement = $element.find('.calendar');
        $scope.calendar = true;

        $scope.parentEvents = {};

        $scope.viewShift = false;
        $scope.viewJobs = false;

        $scope.init = function() {
            var calendarOptions = $scope.getCalenderDefaultOptions();
            $scope.calendarElement.fullCalendar(calendarOptions);
            if ($scope.actions){
                $scope.actions.saveCalendarShift = $scope.saveCalendarShift;
            }
            commonFunctions.fieldChanges($scope);
        }();

        $scope.editEvent = function(event){
            var object = "CalendarEvent";
            if (event.jobEvent){
                object = "Job";
            }
            var url = $state.href('appObjectFullView', {
                appObjectName: object,
                ID: event.eventID
            });
            window.open(url, object);
        };

        $scope.removeAllEvents = function(){
            if ($scope.calendarElement && $scope.calendarElement.fullCalendar){
                $scope.calendarElement.fullCalendar("removeEvents", function(event){
                    return true;
                });
            }
        };

        $scope.LoadData = async function(){
            if ($scope.view == "mainCalendar"){
                await calendarMultipleService.loadMultipleCalendarService($scope,calendarDirectiveCtrl);
            }
            if ($scope.onlyShifts){
                $scope.calendarId = parseInt($scope.calendarId);
                $scope.getCalendarShifts();
            }
            else{
                if (calendarDirectiveCtrl.calendarsPulled){
                    $scope.removeAllEvents();
                    for (var key in calendarDirectiveCtrl.calendarsPulled){
                        if (calendarDirectiveCtrl.calendarsPulled[key]){
                            $scope.getCalendarEvents(key !== "undefined" ? key : undefined);
                        }
                    }
                }
                else{
                    $scope.getCalendarEvents();
                }
            }
        };

        $scope.emptyPage = function(){
            calendarDirectiveCtrl.openEditModal = false;
            $scope.recordValue = null;
            $scope.LoadData();
        }

        $scope.LoadData();

        $scope.$watch("calendarId",function(newValue,oldValue){
            if (newValue != oldValue){
                $scope.LoadData();
            }
        });

        $scope.$on('$destroy', function (event) {
            if($scope.calendarElement){
                $scope.calendarElement.fullCalendar( "destroy" );
            }
        });

    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            height: "=",
            machineId : "=",
            departmentId: "=",
            calendarId: "=",
            onlyShifts : "=",
            view : "=",
            actions : "="
        },
        controller: controller,
        controllerAs : 'calendarDirectiveCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('calendarDirective', calendarDirective);