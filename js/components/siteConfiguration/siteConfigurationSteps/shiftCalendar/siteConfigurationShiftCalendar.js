function siteConfigurationShiftCalendar() {

    var controller = function ($scope, LeaderMESservice, commonFunctions, $state, $element) {
        var shiftCalendarCtrl = this;
        
        $scope.init = function(){
            shiftCalendarCtrl.getCalendarShifts();
            shiftCalendarCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
            shiftCalendarCtrl.actions = {};
        };

        shiftCalendarCtrl.updateData = function(defaultName){
            shiftCalendarCtrl.calendarShifts = [];
            shiftCalendarCtrl.getCalendarShifts(defaultName);
        }

        shiftCalendarCtrl.getCalendarHeight = function(){
            return $element.find(".calendar-container").height();
        }

        shiftCalendarCtrl.getCalendarShifts = function(defaultName){
            LeaderMESservice.customAPI('DisplayFormResults', {
                LeaderID: 0,
                formID: 6025,
                pairs: []
            }).then(function (response) {
                if(response && response.AllrecordValue){
                    shiftCalendarCtrl.calendarShifts = _.map(response.AllrecordValue,function(calendarShift){
                        var result = {};
                        for (var i = 0;i < calendarShift.length; i++){
                            result[calendarShift[i].Name] = calendarShift[i].value;
                        };
                        return result;
                    });
                    
                    shiftCalendarCtrl.calendarShifts.unshift({
                        EName: "NEW_CALENDAR_SHIFT",
                        ID: "new",
                        LName: "NEW_CALENDAR_SHIFT"
                    });
                    if (defaultName){
                        shiftCalendarCtrl.chosenCalendarShift = _.find(shiftCalendarCtrl.calendarShifts,{LName : defaultName});
                    }
                    else{
                        shiftCalendarCtrl.chosenCalendarShift = shiftCalendarCtrl.calendarShifts[1];
                    }
                }
            });
        }


        shiftCalendarCtrl.openformResults = function(formId,leaderId){
            $scope.changes = [];
            $scope.recordValue = [];
            $scope.formCallBack = function (data) {
                $scope.emptyPage(data);
            };
            $scope.actionName = "SAVE_CHANGES";
            var request = {
                LeaderID : leaderId,
                formID : formId
            };
            var requestResponse = {
                LeaderID : leaderId,
                formID : formId,
                skipSaveOperation: true
            };
            $scope.formId = formId;
            $scope.leaderId = leaderId;
            $scope.pairs = [];
            $scope.actionName = "CREATE";
            $scope.request = request;
            $scope.SkipSaveOperation = true;
            $scope.api = 'DisplayFormResults'
            $scope.fullSize = false;
            $scope.loading = false;
            // commonFunctions.formResults($scope, request, requestResponse,'DisplayFormResults',[] , false);
        }

        
        shiftCalendarCtrl.openCreateNewShift = function(){
            shiftCalendarCtrl.openformResults(6023,0);
        };

        shiftCalendarCtrl.saveCalendarShift = function(){
            if (shiftCalendarCtrl.actions && shiftCalendarCtrl.actions.saveCalendarShift){
                shiftCalendarCtrl.actions.saveCalendarShift();
            }
        };


        $scope.emptyPage = function(data){
            var name = _.find(data,{FieldName: "LName"});
            if (name){
                $scope.recordValue = null;
                shiftCalendarCtrl.chosenCalendarShift = null;
                shiftCalendarCtrl.updateData(name && name.Eq);
            }
            else {
                $scope.init();
            }
        }

        // commonFunctions.fieldChanges($scope);
        $scope.init();

    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/siteConfiguration/siteConfigurationSteps/shiftCalendar/siteConfigurationShiftCalendar.html',
        scope: {

        },
        controller: controller,
        controllerAs : "shiftCalendarCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('siteConfigurationShiftCalendar', siteConfigurationShiftCalendar);