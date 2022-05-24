function search() {

    var template = "views/common/newSearch.html";

    var controller = function ($scope, $timeout, LeaderMESservice, commonFunctions,toastr, googleAnalyticsService) {
        var searchCtrl = this;
        if ($scope.content.data.reportID === 407){
            googleAnalyticsService.gaPV("tasks_report");
        }
        else if ($scope.content.data.reportID === 191){
            googleAnalyticsService.gaPV("tasks_report");
        }
        $scope.testResultsTab = ($scope.content.data.AppPartId == 730);
        $scope.rtl = LeaderMESservice.isLanguageRTL();

        $scope.localLanguage = LeaderMESservice.showLocalLanguage();

        $scope.lastRefresh = Date.now();

        $scope.criteriaOptions = [];

        $scope.operators = [
            {
                name: 'CONTAINS',
                op: 'Eq',
                ui_icon: 'Contains',
                excludeFor: ['date', 'num', 'boolean', 'combo','booleangraphic']
            },
            {
                name: 'DONT_CONTAINS',
                op: 'NotEqual',
                ui_icon: 'NotContains',
                excludeFor: ['date', 'num', 'boolean', 'combo','booleangraphic']
            },
            {
                name: 'EQUALS',
                op: 'Eq',
                ui_icon: '=',
                excludeFor: ['text']
            },
            {
                name: 'NOT_EQUALS',
                op: 'NotEqual',
                ui_icon: '<>',
                excludeFor: ['date', 'boolean', 'text','booleangraphic']
            },
            // {
            //     name: 'GREATER_THAN',
            //     op: '>',
            //     excludeFor : ['text','combo','boolean']
            // },
            // {
            //     name: 'LESS_THAN',
            //     op: '<',
            //     excludeFor : ['text','combo','boolean']
            // },
            {
                name: 'GREATER_THAN_EQUAL',
                op: 'GTEq',
                ui_icon: '>=',
                excludeFor: ['text', 'combo', 'boolean','booleangraphic']
            },
            {
                name: 'LESS_THAN_EQUAL',
                op: 'LTEq',
                ui_icon: '<=',
                excludeFor: ['text', 'combo', 'boolean','booleangraphic']
            },
            {
                name: 'BETWEEN',
                op: 'Between',
                ui_icon: '[-]',
                excludeFor: ['text', 'combo', 'boolean', 'num','booleangraphic']
            }
        ];


        $scope.searchOpr = {op: $scope.operators[0]};

        $scope.handleCriteriaChange = function (comboObj) {
            // empty right condition
            delete $scope.searchOpr.right;
            delete $scope.searchOpr.op;

            //handle combo options if combo
            if (comboObj && comboObj.DisplayTypeName == 'combo') {
                $scope.comboOptions = [];
                angular.forEach(comboObj.comboValues, function (i) {
                    $scope.rtl ? $scope.comboOptions.push(i.DisplayLName) : $scope.comboOptions.push(i.DisplayEName);
                });
            }

            var found = false;
            angular.forEach($scope.operators, function (i) {
                if (!found && i.excludeFor.indexOf(comboObj.DisplayTypeName) < 0) {
                    $scope.searchOpr.op = i;
                    found = true;
                }
            })
        };

        $scope.clearOp = function (i) {
            $scope.operations.splice(i, 1);
        };

        $scope.operations = [];

        $scope.add = function (opr, submit, isDefault) {
            if (opr.op.name == 'BETWEEN') {
                var operation = angular.copy(opr);

                operation.right = opr.right.from;
                operation.op = _.find($scope.operators, {op : 'GTEq'});
                $scope.addOperation(operation,submit, isDefault);


                operation.right = opr.right.to;
                operation.op = _.find($scope.operators, {op : 'LTEq'});
                $scope.addOperation(operation,submit, isDefault);
            } else {
                $scope.addOperation(opr,submit, isDefault);
            }
        };

        $scope.addOperation = function (opr, submit, isDefault) {
            // quit if one operation property is missing
            if (Object.keys(opr).length < 3) {
                return;
            }

            var potentialFound = _.filter($scope.operations, {left: opr.left});
            var found = null;
            
            angular.forEach(potentialFound, function(i){
                if (angular.equals(i.op, opr.op)) {
                    found = i;
                }
            });

            if (opr.left.DisplayTypeName != 'text' && opr.left.DisplayTypeName != 'boolean' && opr.left.DisplayTypeName != 'booleangraphic' && 
            found && (found.op.op == 'Eq' || found.op.op == 'NotEqual' || found.op.op == 'INclause' || found.op.op == 'NotINclause')) {
                if (angular.equals(opr.op,found.op)) {
                    if (!angular.isArray(found.right)) {
                        found.right = [found.right];
                    }
                    if (opr.left.DisplayTypeName != 'combo') {
                        if (found.right.indexOf(opr.right) < 0) {
                            found.right.push(opr.right);
                        }
                    } else {
                        var displayName = opr.right[0].DisplayEName;
                        if ($scope.rtl){
                            displayName = opr.right[0].DisplayLName;
                        }

                        if (found.right.indexOf(displayName) < 0) {
                            found.right.push(displayName);

                            var comboDisplayNames = [];
                            var comboValues = [];

                            if (opr.left.ComboDisplayList) {
                                angular.forEach(opr.right, function (i) {
                                    $scope.rtl ? comboDisplayNames.push(i.DisplayLName || i) : comboDisplayNames.push(i.DisplayEName || i);
                                    comboValues.push(i.ComboValueField || i);
                                });
                            } else {
                                $scope.rtl ? comboDisplayNames.push(opr.right.DisplayLName) : comboDisplayNames.push(opr.right.DisplayEName);
                                comboValues.push(opr.right.ComboValueField);
                            }

                            found.comboValueFields = found.comboValueFields.concat(comboValues);
                        }
                    }

                    if (found.op.op == 'Eq') {
                        found.op.op = "INclause";
                    } else if (found.op.op == 'NotEqual') {
                        found.op.op = "NotINclause";
                    }
                    $scope.searchOpr = {op: $scope.operators[0]};
                    return;
                }
            }

            if (opr.left.DisplayTypeName == 'date') {

                var value = opr.right;
                if (typeof opr.right === "string" && opr.right != "" && opr.right != null) {
                    opr.right = moment(opr.right, isDefault ? "YYYY-MM-DD HH:mm:ss" : "DD/MM/YYYY HH:mm:ss");
                }

                //opr.right = value;
                !isDefault ? opr.dateDisplay =  convertDate(value._d) : opr.dateDisplay =  value;
            }

            if (opr.left.DisplayTypeName == 'boolean' || opr.left.DisplayTypeName == 'booleangraphic'){
                opr.left.DisplayTypeName = 'boolean';
                if (opr.right == "TRUE" && opr.right != "FALSE" || opr.right){
                    opr.right = true;
                }
                else{
                    opr.right = false; 
                }
            }

            if (opr.left.DisplayTypeName == 'combo') {
                var comboDisplayNames = [];
                var comboValues = [];
                
                if (opr.left.ComboDisplayList) {
                    angular.forEach(opr.right, function (i) {
                        $scope.rtl ? comboDisplayNames.push(i.DisplayLName || i) : comboDisplayNames.push(i.DisplayEName || i);
                        if (i.ComboValueField == 0) {
                            comboValues.push(i.ComboValueField);
                        } else {
                            comboValues.push(i.ComboValueField || i);
                        }
                    });
                } else {
                    $scope.rtl ? comboDisplayNames.push(opr.right.DisplayLName) : comboDisplayNames.push(opr.right.DisplayEName);
                    comboValues.push(opr.right.ComboValueField);
                }

                $scope.operations.push({
                    left: opr.left,
                    right: comboDisplayNames,
                    op: opr.op,
                    comboValueFields: comboValues
                });
            }
            else {
                if ((opr.op.op == 'NotINclause' || opr.op.op == 'INclause') && typeof opr.right != 'Array') {
                    opr.right = [opr.right];
                }

                $scope.operations.push({
                    left: opr.left,
                    right: opr.right,
                    op: opr.op,
                    dateDisplay: opr.dateDisplay
                });
            }

            // $scope.updateValue = function (contentName, value, type, op, childName) ;

            $scope.searchOpr = {op: $scope.operators[0]};

            if (submit) {
                $scope.search();
            }
        };

        $scope.clearAllOps = function () {
            $scope.operations = [];
        };

        $scope.search = function () {
            if (Object.keys($scope.searchOpr).length == 3) {
                // user added condition and clicked search but did not click on plus button. lets add the condition first
                $scope.add($scope.searchOpr);
            }
            $scope.content.request.sfCriteria = null;
            $scope.changes = [];

        $timeout(function () {

                for (var i = 0; i < $scope.operations.length; i++) {

                    var operation = angular.copy($scope.operations[i]);
                    var op = operation.op.op;
                    var rightSide = operation.right;

                    if (operation.left.DisplayTypeName == 'combo') {
                        if (op !='INclause' && op!='NotINclause') {
                            if (op == "Eq") {
                                op = "INclause";
                            }
                            else {
                                op = "NotINclause";
                            }
                        }

                        operation.right = {
                            ComboValueField: operation.comboValueFields
                        }
                    }

                    $scope.updateValue(operation.left.Name, operation.right, operation.left.DisplayTypeName, op); //true --> Mosmar 10 --> for search
                }
                $scope.content.request.sfCriteria = $scope.getChanges();
            }, 200);
            $scope.content.showFilters = false;
        };

        $scope.showDefaultFilters = function (reportFields) {
            var ans = false;
            for (var i = 0;i < reportFields.length ; i++){
                if (reportFields[i].DefaultValue.length) {
                    for (var k = 0; k< reportFields[i].DefaultValue.length ; k++) {
                        let values = [];
                        if (reportFields[i].DisplayTypeName == 'combo'){
                            values = _.filter( reportFields[i].comboValues,(option) => {
                                return reportFields[i].DefaultValue[k].Value.indexOf(option.ComboValueField) >= 0;
                            });
                            if (!reportFields[i].ComboDisplayList && values.length > 0){
                                values = values[0];
                            }
                        }
                        $scope.add({
                            left: reportFields[i],
                            op: _.find($scope.operators, {ui_icon: reportFields[i].DefaultValue[k].Comp}),
                            right: reportFields[i].DisplayTypeName == 'combo' ? values : reportFields[i].DefaultValue[k].Value[0]
                        }, null, true);
                        ans = true;
                    }
                }
            }
            return ans;
        };

        function init() {            
            $scope.changes = [];
            commonFunctions.fieldChanges($scope,true);
            LeaderMESservice.getDisplayReportSearchFields({
                reportID: $scope.reportId,
                IsUserReport: $scope.isUserReport
            }).then(function (response) {
                if (response && response.error == null && response.recordValue) {
                    $scope.reportSearchFields = response.recordValue;
                    var defaultFilters = $scope.showDefaultFilters($scope.reportSearchFields);
                    //in insight filter if product group filtered then take the group filter and add it to product filter
                    if($scope.content?.data?.ID == 6 && $scope.content?.data?.hasProductGroup)
                    {
                      var found = _.find($scope.reportSearchFields,{Name:$scope.content?.data?.hasProductGroup?.FieldName})    
                      if(found)
                      {
                        var findItem;
                        $scope.add({
                            left: found,
                            op: _.find($scope.operators, {ui_icon: "="}),
                            right:_.map($scope.content?.data?.hasProductGroup?.INclause,function(id){
                             findItem = _.find(found.comboValues,{ComboValueField:id})
                             return findItem
                            })                           
                        }, null, true);        
                      }                      
                    }
 
                    $scope.reportSearchFields = _.sortBy($scope.reportSearchFields, 'DisplayOrder');
                    if ($scope.content?.request?.sfCriteria){
                        return
                    }
                    var displayCrietria = _.find(response.recordValue, {DisplayCriteria: false});
                    if (displayCrietria || $scope.content.data.returnValue) {
                        $scope.displayCriteria = false;
                        $scope.doneLoading = true;
                        if (defaultFilters){
                            $scope.search();
                        }
                        else{
                            $scope.content.request.sfCriteria = [];
                        }                   
                        $scope.content.showFilters = true;
                        return;
                    }
                }
                else {
                    toastr.clear();
                    toastr.error(response.error.ErrorMessage, response.error.ErrorDescription + ":[" + response.error.ErrorCode + "]");
                }
                $scope.doneLoading = true;
            });
        }

        init();
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            content: '=',
            reportId: '=',
            isUserReport: '=',
            hideCriteria: '='
        },
        controller: controller,
        controllerAs: 'searchCtrl'
    };
}


angular
    .module('LeaderMESfe')
    .directive('search', search);