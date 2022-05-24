function mobileParamNotifaction() {

    var controller = function ($scope, LeaderMESservice, $filter, toastr) {
        var mobileParamNotifactionCtrl = this;
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        mobileParamNotifactionCtrl.permissionsData = {};
        $scope.loading = false;

        // mobileParamNotifactionCtrl.notificationChange = function(item){                         
        //     var found = _.find(mobileParamNotifactionCtrl.changedData,{key : item.id});

        //     if (found){
        //         found.value = item.value;
        //         return;
        //     }                                      
        //     mobileParamNotifactionCtrl.changedData.push({
        //         key : item.id,
        //         value : item.value
        //     });                      

        // }

        //TO-DO send selected machines ids
        mobileParamNotifactionCtrl.save = function() {
            if ($scope.loading) return;

            var machines = [];
            if(mobileParamNotifactionCtrl.permissionsData.applyTo == 'allMachines'){
                machines = _.map(mobileParamNotifactionCtrl.permissionsData.selectedDepartment.Value,'Id');
            }
            else if(mobileParamNotifactionCtrl.permissionsData.applyTo == 'selectMachines'){

                mobileParamNotifactionCtrl.permissionsData.departments.forEach(function(department){
                    machines = machines.concat(_.map(_.filter(department.Value,{selected: true}),'Id'));
                });
            }
            else
            {
              machines.push(mobileParamNotifactionCtrl.permissionsData.selectedMachine.Id);
            }

            var pairs = [];
            mobileParamNotifactionCtrl.data.forEach(function(temp){
                if (temp.value !== undefined) {
                    pairs.push({
                        key : temp.fieldname,
                        value : temp.value
                    });
                }
            });
            if (pairs.length === 0){
                toastr.error("", $filter('translate')('NOTHING_TO_SAVE'));
                return;
            }
            $scope.loading = true;
            LeaderMESservice.customAPI('SaveParametersNotifications',
            {
                Machines: machines,
                pairs: pairs
            }).then(function() {
                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                $scope.loading = false;
                mobileParamNotifactionCtrl.updateMachineData();
            }, function() {
                $scope.loading = false;
                toastr.error("", $filter('translate')('SAVE_FAILED'));

            });
        };


           mobileParamNotifactionCtrl.updateMachineData = function () {
               if ($scope.loading) return
               $scope.loading = true;
               LeaderMESservice.customAPI('GetParametersNotificationsForMachine',
                   {
                       MachineID: mobileParamNotifactionCtrl.permissionsData.selectedMachine.Id
                   })
                   .then(function(response){
                       $scope.loading = false;
                       mobileParamNotifactionCtrl.data = angular.copy(response.ResponseList||[]);
                       mobileParamNotifactionCtrl.changedData = [];
                       mobileParamNotifactionCtrl.data.forEach(function(temp){
                           if (temp.active){
                                   var itemFound = _.find(mobileParamNotifactionCtrl.data,{fieldname : temp.fieldname});
                                   if(itemFound){
                                       itemFound.value = true;
                                    }
                           }
                       });
                   })
                   .catch(function (error) {
                       $scope.loading = false;
                       toastr.error("", $filter('translate')('ACTION_FAILED'));
                   })
           };

           mobileParamNotifactionCtrl.DefaultStructure = [
               {
                   active: 0,
                   ename: "Cycle Time -  seconds for testing a long name",
                   fieldname: "CycleTime",
                   id: 1,
                   lname: "זמן מחזור -שניות לבדיקה של פרמטר ארוך",
                   value: false
               },
               {
                   active: 0,
                   ename: "Unit Weight",
                   fieldname: "UnitWeight",
                   id: 5,
                   lname: "משקל יחידה",
                   value: false
               },
               {
                   active: 0,
                   ename: "ProductWeight",
                   fieldname: "ProductWeight",
                   id: 6,
                   lname: "משקל מוצר",
                   value: false
               },
               {
                   active: 0,
                   ename: "Status",
                   fieldname: "Status",
                   id: 7,
                   lname: "מצב מכונה",
                   value: false
               },
               {
                   active: 0,
                   ename: "O.E.E.",
                   fieldname: "EfficiencyTotal",
                   id: 30,
                   lname: "O.E.E.",
                   value: false
               },
               {
                   active: 0,
                   ename: "Cycle Units (PC)",
                   fieldname: "CavitiesPC",
                   id: 31,
                   lname: "יחידות במחזור (%)",
                   value: false
               },
               {
                   active: 0,
                   ename: "Availability",
                   fieldname: "DownTimeEfficiency",
                   id: 32,
                   lname: "זמינות מכונה",
                   value: false
               },
               {
                   active: 0,
                   ename: "Quality Index",
                   fieldname: "RejectsEfficiency",
                   id: 33,
                   lname: "מדד איכות",
                   value: false
               }
               ,{
                   active: 0,
                   ename: "Cycle Time Efficiency",
                   fieldname: "CycleTimeEfficiency",
                   id: 34,
                   lname: "יעילות זמן מחזור",
                   value: false
               },
               {
                   active: 0,
                   ename: "ApiDBstatus",
                   fieldname: "ApiDBstatus",
                   id: 35,
                   lname: "ApiDBstatus",
                   value: false
               },
               {
                   active: 0,
                   ename: "P.E.",
                   fieldname: "PEE",
                   id: 1024,
                   lname: "P.E.",
                   value: false
               },
               {
                   active: 1,
                   ename: "Rejects % Shift",
                   fieldname: "RejectsPCJosh",
                   id: 1422,
                   lname: 'אחוז פסולים (משמרת)',
                   value: false
               }
           ]
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/mobileParametersNotifiactions/mobileParametersNotifiactions.html',
        scope: {
        },
        controller: controller,
        controllerAs: 'mobileParamNotifactionCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('mobileParamNotifaction', mobileParamNotifaction);