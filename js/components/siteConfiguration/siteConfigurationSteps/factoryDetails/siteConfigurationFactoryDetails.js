function siteConfigurationFactoryDetails() {

    var controller = function ($scope, LeaderMESservice, commonFunctions, $timeout) {
        var factoryDetailsCtrl = this;

        factoryDetailsCtrl.localLanguage = LeaderMESservice.showLocalLanguage();

        $scope.currentStep = 0;

        factoryDetailsCtrl.updateData = function(){
            $scope.currentStep = 0;
            LeaderMESservice.customGetAPI("GetDepartmentsMachines").then(function(response){
                factoryDetailsCtrl.departments = response.DepartmentMachine;
                if (factoryDetailsCtrl && factoryDetailsCtrl.departments && factoryDetailsCtrl.departments.length > 0){
                    $scope.currentStep = 2;
                    factoryDetailsCtrl.chosenDepartment = factoryDetailsCtrl.departments[0];
                }
                else{
                    $scope.currentStep = 1;
                }
            });
        };
        
        $scope.emptyPage = function(){
            factoryDetailsCtrl.formResultsMode = null;
            $scope.recordValue = null;
            factoryDetailsCtrl.updateData();
        }

        factoryDetailsCtrl.openformResults = function(formId,leaderId,title){
            $scope.changes = [];
            $scope.recordValue = [];
            factoryDetailsCtrl.formResultsTitle = title;
            factoryDetailsCtrl.formResultsMode = true;
            $scope.formCallBack = function () {
                $scope.emptyPage();
            };
            $scope.actionName = "SAVE_CHANGES";
            var request = {
                LeaderID : leaderId,
                formID : formId
            };
            var requestResponse = {
                LeaderID : leaderId,
                formID : formId
            };
            $scope.formId =  formId;
            $scope.leaderId = leaderId;
            $scope.pairs = [];
            $scope.actionName = "SAVE_CHANGES";
            $scope.request = request;
            $scope.SkipSaveOperation = false;
            $scope.api = 'DisplayFormResults'
            $scope.fullSize = false;
            $scope.loading = false;
            $scope.cancelButton = true;
            $scope.alwaysShowFooter = true;
            $scope.modalClose = () => {
                $timeout(() => {
                    factoryDetailsCtrl.formResultsMode = false;
                })
            };
            // commonFunctions.formResults($scope, request, requestResponse,'DisplayFormResults',[] , false);
        }

        factoryDetailsCtrl.openDepartmentEdit = function(department){
            factoryDetailsCtrl.openformResults(6096,department.Key.Id,
                (factoryDetailsCtrl.localLanguage ? department.Key.LName : department.Key.EName));
        }

        factoryDetailsCtrl.openMachine = function(machine){
            factoryDetailsCtrl.openformResults(6098,machine.Id,machine.MachineName);
        };

        factoryDetailsCtrl.addDepartmentForm = function(){
            factoryDetailsCtrl.openformResults(6096,-1,"ADD_DEPARTMENT");
        };

        factoryDetailsCtrl.addMachineForm = function(){
            factoryDetailsCtrl.openformResults(6098,0,"ADD_MACHINE");
        };

        $scope.assignCurrentStep = function(currentStep) {
            $scope.currentStep = currentStep;
        }
        commonFunctions.fieldChanges($scope);
        factoryDetailsCtrl.updateData();
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/siteConfiguration/siteConfigurationSteps/factoryDetails/siteConfigurationFactoryDetails.html',
        scope: {

        },
        controller: controller,
        controllerAs : 'factoryDetailsCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('siteConfigurationFactoryDetails', siteConfigurationFactoryDetails);