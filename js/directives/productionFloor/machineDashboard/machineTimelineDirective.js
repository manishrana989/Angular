var machineTimelineDirective = function($filter, $rootScope) {
    var Template = 'views/custom/machine/machineDashboard/machineTimelineDirective.html';
    
    var controller = function($scope,shiftService,$state, LeaderMESservice, commonFunctions){
        $scope.slider = shiftService.sliderData;
        $scope.shiftData = shiftService.shiftData;
        $scope.buttonTitle = $filter('translate')('HIDE_TITLE');
        $scope.hideClicked = false;
        $scope.rtl = LeaderMESservice.showLocalLanguage();

        

        $scope.shiftsNames = [];
        $scope.shiftsNames = _.map(_.sortBy(shiftService.shiftData.data.CurrentShift,shift => {
            if (shift.Machines && shift.Machines[0] && shift.Machines[0].Events) {
                const events = shift.Machines[0].Events;
                for (let i = 0;i < events.length - 1 ; i++){
                    events[i].EndTime = events[i + 1].StartTime;
                }
            }
          return new Date(shift.StartTime);
        }),'Name');

        $scope.openEvent = function (eventId,eventColor) {
            if(eventColor !== '#1AA917' && eventColor !== '#F5A623'){
                $scope.successCallback = () => {
                    var durationObj = shiftService.durationParams();
                    shiftService.updateData($scope.shiftData.DepartmentID, durationObj, true, true);
                }
                commonFunctions.formInModal($scope,'EVENT', 1015,eventId);
                // var url = $state.href("appObjectFullView", {
                //   appObjectName: "Event",
                //   ID: eventId,
                // });
                // window.open(url, "_blank","toolbar=yes,scrollbars=yes,resizable=yes,top=700,left=700,width=600,height=600");
            }
        };

        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
        var parseDate2 = d3.time.format("%d/%m/%Y %H:%M:%S").parse;
        var x = d3.time.scale().range([0, 100]);
        $scope.percentage = function (dateString){
            return x(parseDate(dateString));
        }
        $scope.percentage2 = function (dateString){
            return x(parseDate2(dateString));
        }
        $scope.widthPer = function(start, end){
            var startDate = parseDate(start);
            var endDate = parseDate(end);
            return (((endDate - startDate + 1000) / 60000)/($scope.slider.options.ceil - $scope.slider.options.floor)*100) +'%';
        }
        $scope.init = function () {
            x.domain([new Date($scope.slider.options.floor * 1000 * 60), new Date($scope.slider.options.ceil * 1000 * 60)]);
        }
        $scope.$watchGroup(["slider.options.floor","slider.options.ceil"],function(value){
            $scope.init();
        })
        $scope.hideClick = function(){
            $scope.hideClicked = !$scope.hideClicked;
            if($scope.hideClicked){
                 $scope.buttonTitle = $filter('translate')('SHOW_TITLE');
            }else{
             $scope.buttonTitle = $filter('translate')('HIDE_TITLE');
            }
        }

    }

    var link = function(scope, element){
        var tooltip = d3.select(element[0]).select(".tooltip-container");
        scope.tooltipIn = function(event,data){
            scope.tooltipDisplay = true;
            tooltip.select('.tooltip-start-date').html($filter("date")(data.StartTime,"dd/MM/yyyy HH:mm:ss"));
            tooltip.select('.tooltip-event-duration').html($filter('getDurationInHoursMinutes')(data.Duration));
            tooltip.select('.tooltip-event-type').html(data.EventReason && data.EventReason !== "" ?  data.EventReason : data.Name);
        }
        scope.tooltipMove = function(event){
            tooltip.style('top', -270 + 'px')
                .style('left', (event.clientX) - 185 + 'px');
        }
        scope.tooltipLeave = function(){
            scope.tooltipDisplay = false;
        }

    }
        
            
    return {
        restrict: "E",
        templateUrl: Template,
        controller: controller,
        link, link
    };
};

angular
    .module('LeaderMESfe')
    .directive('machineTimelineDirective',  machineTimelineDirective);