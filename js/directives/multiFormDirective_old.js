function multiFormDirective() {

    var controller = function ($scope, LeaderMESservice,commonFunctions,$timeout,BreadCrumbsService,$state,$filter,$rootScope) {
        $scope.templateUrl = "views/custom/multiForm/multiForm.html";

        var getTargetParameters = function () {
            if ($scope.content.SubMenuTargetParameters == ""){
                return [];
            }
            var targetParameters = $scope.content.SubMenuTargetParameters.split("=");
            return {
                FieldName: targetParameters[0],
                Eq: $scope.content.ID,
                DataType : "num"
            }
        };

        function init() {
            $scope.continousMultiForm = true;
            $scope.dataLoaded = false;
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.changes = [];
            $scope.showBreadCrumb = true;
            if ($state.current.name == "multiformsFullView"){
                $scope.showBreadCrumb = false;
            }
            commonFunctions.fieldChanges($scope);
            if ($scope.localLanguage)
                $scope.topPageTitle = $scope.content.SubMenuLName;
            else
                $scope.topPageTitle = $scope.content.SubMenuEName;
            $scope.searchBoxFields = [];
            $scope.$emit('changeTitle',$scope.topPageTitle);
            LeaderMESservice.getDisplayFormResults({LeaderID: 0, formID : $scope.content.SubMenuExtID,showCriteria : true}).then(function(response){
                if (response.error === null && response.recordTemplate.length > 0){
                    $scope.searchBoxFields = [];
                    for (var i = 0;i < response.recordTemplate.length; i++){
                        if (response.recordTemplate[i].ShowInCriteria === true){
                            response.recordTemplate[i].AllowEntry = true;
                            response.recordTemplate[i].MandatoryField = false;
                            $scope.searchBoxFields.push(response.recordTemplate[i]);
                            if (response.recordTemplate[i].value !== null && response.recordTemplate[i].value !== ""){
                                $scope.changes.push({
                                    "FieldName": response.recordTemplate[i].Name,
                                    "Eq": response.recordTemplate[i].value.toString(),
                                    "DataType": response.recordTemplate[i].DisplayTypeName
                                })
                            }
                        }
                    }
                }
            });
        }

        $scope.searchMultiForm = function(){
            $scope.dataLoaded = false;
            $scope.requestInProgress = true;
            $scope.$on('finished-loading', function () {
                $scope.requestInProgress = false;
            });
            $timeout(function(){
                var targetParameters = getTargetParameters();
                commonFunctions.editableTable($scope, $scope.content.SubMenuExtID, targetParameters.FieldName ,$scope.changes,0,$scope.content.SkipSaveOperation);
                if ($scope.content.SubMenuExtID == 10500) {
                    $scope.multiFormHeaderTitle = ' ';

                    LeaderMESservice.customAPI('DisplayFormResults', {
                        LeaderID: 0,
                        formID: 10505,
                        pairs: $scope.changes
                    }).then(function (response) {
                        if (response.error === null && response.AllrecordValue
                            && response.AllrecordValue.length > 0) {
                            for (var i = 0; i < response.AllrecordValue[0].length; i++) {
                                if (i == 0) {
                                    $scope.multiFormHeaderTitle = ($scope.localLanguage ? response.AllrecordValue[0][i].DisplayLName : response.AllrecordValue[0][i].DisplayEName) + " = " +
                                        response.AllrecordValue[0][i].value;
                                    continue;
                                }
                                $scope.multiFormHeaderTitle = $scope.multiFormHeaderTitle + " , " + ($scope.localLanguage ? response.AllrecordValue[0][i].DisplayLName : response.AllrecordValue[0][i].DisplayEName) + " = " +
                                    response.AllrecordValue[0][i].value;
                            }
                        }
                        $scope.dataLoaded = true;
                    });
                }
                else {
                    $scope.dataLoaded = true;
                }
            },100);
        };

        $scope.getHeader = function(){
        };

        $scope.emptyPage = function () {
            $scope.searchMultiForm();
        };

        init();
    };

    return {
        restrict: "E",
        template: '<ng-include src="templateUrl"></ng-include>',
        scope: {
            content: '='
        },
        controller: controller
    };
}

angular
    .module('LeaderMESfe')
    .directive('multiFormDirective', multiFormDirective);