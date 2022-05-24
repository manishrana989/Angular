
function editableTable($timeout, $compile, $window) {

    var template = "views/common/editableTable.html";

    var linker = function (scope, element, attrs) {
        scope.contentUrl = template;
    };

    var controller = function ($scope, $state, $window, $timeout, LeaderMESservice, uiGridConstants, $filter,$sessionStorage,
                               $modal, notify, $rootScope, stateService,$sessionStorage, graphService, commonFunctions, $element, GLOBAL,$location) {

        var editableTableCtrl = this;

        $scope.openNewObject = function(record){
            var ans = undefined;
            if (record.LinkTarget != "" && record.LinkTarget != null){
                if ($scope.editableTableData.NewTab === true) {
                    ans = '<span ng-if="!row.entity.multiFormNewRow">' +
                        '<a ng-if="COL_FIELD" style="text-decoration: underline;" ui-sref="appObjectFullView({ID: COL_FIELD ,appObjectName: \'' + record.LinkTarget + '\'})" target="' + (window.name == record.LinkTarget ? "_blank" : record.LinkTarget) + '">{{COL_FIELD}}</a>' +
                        '</span>';
                }
                else {
                    ans = '<span ng-if="!row.entity.multiFormNewRow">' +
                    '<a ng-if="COL_FIELD" ng-click="grid.appScope.openInSameWindow(COL_FIELD,\'' + record.LinkTarget + '\',\'ID\')">{{COL_FIELD}}</a>' +
                    '</span>';
                }
            }
            else{
                ans = '<span ng-if="!row.entity.multiFormNewRow">{{COL_FIELD}}</span>'
            }

            if ($scope.editableTableData.AllowNewEntry &&  record.SearchLinkReportID != null){
                ans = ans + '<div ng-if="row.entity.multiFormNewRow" class="input-group"><input style="height: 34px;" type="number" disabled ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'num\')" class="form-control" ng-model="row.entity.' + record.Name + '"> ' +
                '<span class="input-group-btn"><button type="button" ng-init="(!row.entity.newMultiFormRowAdded &&  grid.appScope.AddNewItem(row.entity.multiFormIndex,\'' + record.Name + '\',' + record.SearchLinkReportID + '));row.entity.newMultiFormRowAdded = true" class="btn btn-primary" ng-click="grid.appScope.AddNewItem(row.entity.multiFormIndex,\'' + record.Name + '\',' + record.SearchLinkReportID + ')"><i class="fa fa-search"></i></button></span></div>' +
                '<input ng-if="row.entity.multiFormNewRow" class="form-control" ng-model="row.entity.' + record.Name + '" style="height:0px;padding : 0;margin-top:-24px" ng-required="' + (!record.AllowNull ? 'newRequired' : false) + '">';
            }
            return ans;
        };
        

        $scope.openInfo = function(){
            window.open(GLOBAL.machineGroups, "_blank");
        }

        $scope.getNumberTemplate = function(record){
            var required =  !record.AllowNull;
            var decimalValue = 1;
            if (record.DecimalPoint !== null && record.DecimalPoint > 0) {
                decimalValue = "0.";
                for (var i = 0; i < record.DecimalPoint - 1; i++) {
                    decimalValue = decimalValue + "0";
                }
                decimalValue = decimalValue + "1";
            }
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><input ' +
                'step="' + decimalValue + '" ' +
                'style="width: 100%;min-width: 100px" type="number" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'num\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ng-model-options="{allowInvalid: true}" ' +
                'ng-required="' + required + '"></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><input ' +
                'step="' + decimalValue + '" ' +
                'style="width: 100%;min-width: 100px" type="number" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'num\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                '' + (required  ? 'required' : '') + '></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><input ' +
                'step="' + decimalValue + '" ' +
                'style="width: 100%;min-width: 100px" type="number" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'num\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + '}}</span>';
            }
            else{
                return undefined;
            }
        };


        $scope.getCheckBoxTemplate = function(record){
            var required =  !record.AllowNull;
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><input icheck ' +
                'style="" type="checkbox" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'checkbox\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><input icheck ' +
                'style="" type="checkbox" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'checkbox\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><input icheck ' +
                'style="" type="checkbox" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'checkbox\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + '}}</span>';
            }
            else{
                return undefined;
            }
        };

        $scope.getDropDownTemplate = function(record,child){
            var required =  !record.AllowNull
            if (child) {
                if (record.AllowEntry == true) {
                    return '<span ng-if="!row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.ChildName + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + ') for option in row.entity.' + record.ChildName + '.comboValues[row.entity[ row.entity.' + record.ChildName + '.parentCombo].value][0].ChildcomboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.ChildName + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span>' +
                    '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.ChildName + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + ') for option in row.entity.' + record.ChildName + '.comboValues[row.entity[ row.entity.' + record.ChildName + '.parentCombo].value][0].ChildcomboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.ChildName + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span>';
                }
                else if (record.ShowOnNew == true){
                    return '<span ng-if="row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.ChildName + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + ') for option in row.entity.' + record.ChildName + '.comboValues[row.entity[ row.entity.' + record.ChildName + '.parentCombo].value][0].ChildcomboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.ChildName + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.ChildName + ' | getSubComboText: row.entity[row.entity.' + record.ChildName + '.parentCombo]  | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + '}}</span>';
                }
                else {
                    return '<span>{{row.entity.' + record.ChildName + ' | getSubComboText: row.entity[row.entity.' + record.ChildName + '.parentCombo]  | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + '}}</span>'
                }
            }
            else {
                if (record.AllowEntry == true){
                    return '<span ng-if="!row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.Name + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + ') for option in row.entity.' + record.Name + '.comboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span>' +
                    '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.Name + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' + $scope.localLanguage + ') for option in row.entity.' + record.Name + '.comboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span>';
                }
                else if (record.ShowOnNew == true){
                    return '<span ng-if="row.entity.multiFormNewRow"><select style="width: 100%;min-width: 100px" class="form-control" ' +
                    'ng-model="row.entity.' + record.Name + '.value" ' +
                    'ng-options="option.ComboValueField as (option | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' + $scope.localLanguage + ') for option in row.entity.' + record.Name + '.comboValues"' +
                    'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'combo\')" ' +
                    'ng-required="' + required + '"><option value=""></option></select></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + ' | getComboText  | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + '}}</span>';
                }
                else{
                    return '<span>{{row.entity.' + record.Name + ' | getComboText  | customTranslate: \'ComboQueryEField\':\'ComboQueryHField\':' +$scope.localLanguage + '}}</span>'
                }
            }
        }

        $scope.getTextTemplate = function(record){
            var required =  !record.AllowNull;
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><input ' +
                'style="" type="text" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><input ' +
                'style="" type="text" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><input ' +
                'style="" type="text" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + '}}</span>';
            }
            else{
                return undefined;
            }
        }

        $scope.getDateTemplate = function(record){
            var required =  !record.AllowNull;
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><div class="input-group date"> ' +
                '<span class="input-group-addon"><i class="fa fa-calendar" ></i></span> ' +
                '<input position="absolute" style="width: 100%;min-width: 100px" type="datetime" class="form-control" '  +
                'ng-model="row.entity.' + record.Name + '" date-time format="DD/MM/YYYY HH:mm:ss" view="date" ' +
                'auto-close="true" ng-blur="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'Date\')" ng-required="' + required + '" />' +
                '</div></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><div class="input-group date"> ' +
                '<span class="input-group-addon"><i class="fa fa-calendar" ></i></span> ' +
                '<input position="absolute" style="width: 100%;min-width: 100px" type="datetime" class="form-control" '  +
                'ng-model="row.entity.' + record.Name + '" date-time format="DD/MM/YYYY HH:mm:ss" view="date" ' +
                'auto-close="true" ng-blur="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'Date\')" ng-required="' + required + '" />' +
                '</div></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><div class="input-group date"> ' +
                '<span class="input-group-addon"><i class="fa fa-calendar" ></i></span> ' +
                '<input position="absolute" style="width: 100%;min-width: 100px" type="datetime" class="form-control" '  +
                'ng-model="row.entity.' + record.Name + '" date-time format="DD/MM/YYYY HH:mm:ss" view="date" ' +
                'auto-close="true" ng-blur="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'Date\')" ng-required="' + required + '" />' +
                '</div></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + ' | date:\'DD/MM/YYYY HH:mm:ss\'}}</span>';
            }
            else{
                return '<span>{{row.entity.' + record.Name + ' | date:\'DD/MM/YYYY HH:mm:ss\'}}</span>';
            }
        }

        $scope.getTimeTemplate = function(record){
            var required =  !record.AllowNull;
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><div class="input-group" clock-picker data-autoclose="true"> ' +
                '<input style="width: 100%;min-width: 70px" type="text" ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'time\')" class="form-control" ' +
                'ng-model="row.entity.' + record.Name + '" ng-required="' + required + '">' +
                '<span class="input-group-addon"> ' +
                '<span class="fa fa-clock-o"></span> ' +
                '</span>' +
                '</div></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><div class="input-group" clock-picker data-autoclose="true"> ' +
                '<input style="width: 100%;min-width: 70px" type="text" ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'time\')" class="form-control" ' +
                'ng-model="row.entity.' + record.Name + '" ng-required="' + required + '">' +
                '<span class="input-group-addon"> ' +
                '<span class="fa fa-clock-o"></span> ' +
                '</span>' +
                '</div></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><div class="input-group" clock-picker data-autoclose="true"> ' +
                '<input style="width: 100%;min-width: 70px" type="text" ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'time\')" class="form-control" ' +
                'ng-model="row.entity.' + record.Name + '" ng-required="' + required + '">' +
                '<span class="input-group-addon"> ' +
                '<span class="fa fa-clock-o"></span> ' +
                '</span>' +
                '</div></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + ' | date:\'DD/MM/YYYY HH:mm:ss\'}}</span>';
            }
            else{
                return undefined;
            }
        }

        $scope.getColorTemplate = function(record){
            var required =  !record.AllowNull;
            if (record.AllowEntry == true){
                return '<span ng-if="!row.entity.multiFormNewRow"><input ' +
                'style="" type="color" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>' +
                '<span ng-if="' + record.ShowOnNew +' && row.entity.multiFormNewRow"><input ' +
                'style="" type="color" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span>';
            }
            else if (record.ShowOnNew == true){
                return '<span ng-if="row.entity.multiFormNewRow"><input ' +
                'style="" type="color" ' +
                'ng-change="grid.appScope.valueChanged(row.entity.multiFormIndex,\'' + record.Name + '\',\'text\')" ' +
                'class="form-control" ng-model="row.entity.' + record.Name + '" ' +
                'ng-required="' + required + '"></span><span ng-if="!row.entity.multiFormNewRow">{{row.entity.' + record.Name + '}}</span>';
            }
            else{
                return undefined;
            }
        }

        $scope.getRemoveTemplate = function(){
            return '<div ng-if="(grid.appScope.AllowNewEntry && row.entity.multiFormNewRow) || grid.appScope.AllowDeleteEntry" ng-click="grid.appScope.removeRow(row.entity.multiFormIndex)" style="text-align: center;margin-top: 12px;"><a><i class="fa fa-trash-o" style="font-size: 20px;color: red"></i></a></div>';
        };

        $scope.getAddTemplate = function(){
            return '<div ng-click="grid.appScope.addRow(row.entity.multiFormIndex)" style="text-align: center;"><a><i class="fa fa-plus-square-o" style=""></i></a></div>';
        };

        $scope.getCellTemplate = function(record,child){
            if ((record.LinkTarget != "" && record.LinkTarget != null) || ($scope.editableTableData.AllowNewEntry &&  record.SearchLinkReportID != null)){
                return $scope.openNewObject(record);
            }
            switch (record.DisplayType){
                case 1 :
                    return $scope.getTextTemplate(record);
                case 2 :
                    return $scope.getDropDownTemplate(record,child);
                case 3 :
                    return $scope.getCheckBoxTemplate(record);
                case 6 :
                    return $scope.getNumberTemplate(record);
                case 7 :
                    return $scope.getDateTemplate(record);
                case 8 :
                    return $scope.getTimeTemplate(record);
                case 18 :
                    return $scope.getColorTemplate(record);
                default :
                    return undefined;
            }
        }

        $scope.getColumnType = function(recrod){

             switch (recrod.DisplayType){
                case 1 :
                    return 'string';
                case 2 :
                    return 'object';
                case 3 :
                    return undefined;
                case 4 :
                    return 'number';
                case 6 :
                    return 'number';
                case 7 :
                    return 'date';
                case 8 :
                    return 'date';
                default :
                    return undefined;
            }
        }


        $scope.getColumnFilter = function(record){
            switch (record.DisplayType){
                case 1 :
                    return undefined;
                case 2 :
                    return {
                        type: uiGridConstants.filter.SELECT,
                        condition : function(cellValue,filterValue){
                            return cellValue == filterValue.value;
                        },
                        selectOptions: _.map(record.comboValues,function(value){
                            return {
                                value : value.ComboValueField,
                                label : $scope.localLanguage ? value.ComboQueryHField : value.ComboQueryEField,
                                local : value.ComboQueryHField,
                                eng : value.ComboQueryEField
                            };
                        })
                    };
                case 3 :
                    return {
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [{value: true, label: $filter('translate')('TRUE')}, {
                            value: false,
                            label: $filter('translate')('FALSE')
                        }]
                    };
                case 6 :
                    return undefined;
                case 7 :
                    return undefined;
                case 8 :
                    return undefined;
                default :
                    return undefined;
            }
        };

        function init() {
            var w = angular.element($window);
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.gridLoading = true;
            $scope.language = $sessionStorage.language.substring(0, 2);
            $scope.rtl = LeaderMESservice.isLanguageRTL();
            $scope.convertDate = function (date,separator) {
                return [paddingZerosToDate(date.getFullYear()),
                        paddingZerosToDate(date.getMonth() + 1),
                        paddingZerosToDate(date.getDate())].join(separator || '-') +
                    ' ' +
                    [paddingZerosToDate(date.getHours()),
                        paddingZerosToDate(date.getMinutes()),
                        paddingZerosToDate(date.getSeconds())].join(':');
            };

            $scope.convertDateView = function (date,separator) {
                return [paddingZerosToDate(date.getDate()),
                        paddingZerosToDate(date.getMonth() + 1),
                        paddingZerosToDate(date.getFullYear())].join(separator || '/') +
                    ' ' +
                    [paddingZerosToDate(date.getHours()),
                        paddingZerosToDate(date.getMinutes()),
                        paddingZerosToDate(date.getSeconds())].join(':');
            };


            $scope.content.showFilters = true;
            let requestToServer = null;
            if($scope.content.request.formID === 20006 || $scope.content.request.formID === 20007)
            {
                const queryString = $location.search();
                const fieldID =  $scope.content.request.LeaderID
                delete $scope.content.request.LeaderID
                $scope.content.request.pairs=[]
                
                // $scope.content.request.pairs.push({"FieldName":"SubType","Eq":SubType,"DataType":"num"})
                $scope.content.request.pairs.push({"FieldName":"FieldID","Eq":fieldID,"DataType":"num"})
                // $scope.content.request.pairs.push({"FieldName":"IsSample","Eq":+queryString.IsSample,"DataType":"num"})
                requestToServer = LeaderMESservice.getDisplayFormResults($scope.content.request);
            }else 
            if ($scope.content.request.formID === 196){
                $scope.hideActions = true;
                requestToServer = LeaderMESservice.getUnScheduledJobs($scope.content.request, $scope.content.data.selectedDepartmentIds);
            } else {
                requestToServer = LeaderMESservice.getDisplayFormResults($scope.content.request);
            }
            requestToServer.then(function (response) {
                //TODO fix it when server side fix it.
                if (response.error != null && response.error.ErrorCode != null) {
                    notify({
                        message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    $scope.content.data.callback(false);
                    return;
                }
                if ($scope.content.request.formID === 50300 || $scope.content.request.formID === 50200) {
                    var moldIdField = _.find(response.recordTemplate,{Name : "MoldID"});
                    var productIdField = _.find(response.recordTemplate,{Name : "ProductID"});
                    
                    var updateCustomAllRecordValues = function(row, name, comboValues) {
                        var fieldValue = _.find(row,{Name : name});
                        if (fieldValue) {
                            var selectedField = _.find(comboValues,{ComboValueField : parseInt(fieldValue.value)});
                            if (selectedField) {
                                fieldValue.value = $scope.localLanguage ? 
                                        selectedField.ComboQueryHField :
                                        selectedField.ComboQueryEField;
                            }
                            else {
                                selectedField = _.find(fieldValue.comboValues,{isDefault: true});
                                if (selectedField) {
                                    fieldValue.value = $scope.localLanguage ? 
                                            selectedField.ComboQueryHField :
                                            selectedField.ComboQueryEField;
                                }
                            }
                            fieldValue.comboValues = null;
                            fieldValue.DisplayTypeName = "Text";
                            fieldValue.DisplayType = 1;
                        }
                    };
                    response.AllrecordValue.forEach(function(row) {
                        updateCustomAllRecordValues(row, "MoldID", moldIdField && moldIdField.comboValues || []);
                        updateCustomAllRecordValues(row, "ProductID", productIdField && productIdField.comboValues || []);
                    });
                
                    if (moldIdField) {
                        moldIdField.comboValues = null;
                        moldIdField.DisplayTypeName = "Text";
                        moldIdField.DisplayType = 1;
                    }
                    if (productIdField) {
                        productIdField.comboValues = null;
                        productIdField.DisplayTypeName = "Text";
                        productIdField.DisplayType = 1;
                    }
                }
                $scope.content.data.hasCheckbox = response.HasCheckBox;
                $scope.editableTableData = response;
                $scope.reportStructure = response.ReportStructure;
                stateService.stateCode($scope);
                editableTableCtrl.gridOptions = {
                    enableRowHeaderSelection: $scope.content.request.formID === 196 ? false : true,
                    enableFiltering: true,
                    showGridFooter: true,
                    columnDefs: [],
                    enableHiding : $scope.content.request.formID === 196 ? true : false,
                    enableColumnResizing: true,
                    enableRowSelection: true,
                    showClearAllFilters : false,
                    enableGridMenu: $scope.content.request.formID === 196 ? true : false,
                    enableSelectAll: true,
                    exporterMenuPdf: true,
                    exporterMenuCsv: false,
                    exporterExcelFilename: 'excel.xlsx',
                    exporterExcelSheetName: 'Sheet1',
                    exporterCsvFilename:  'file.csv',
                    exporterPdfDefaultStyle: {fontSize: 7},
                    exporterPdfTableStyle: {
                        margin: [0, 0, 0, 0]
                    },
                    exporterPdfTableHeaderStyle: {fontSize: 8, bold: true, italics: true, color: 'blue'},
                    exporterPdfHeader: {
                        text: 'pdf',
                        style: 'headerStyle',
                        alignment: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                        margin: [30, 10, 30, 2]
                    },
                    exporterPdfFooter: function (currentPage, pageCount) {
                        return {
                            text: currentPage.toString() + ' of ' + pageCount.toString(),
                            style: 'footerStyle',
                            margin: [30, 0, 30, 0]
                        };
                    },
                    exporterPdfCustomFormatter: function (docDefinition) {
                        docDefinition.styles.headerStyle = {
                            fontSize: 22,
                            bold: true,
                            alignment: ($scope.rtl == 'rtl' ? 'right' : 'left')
                        };
                        docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
                        return docDefinition;
                    },
                    exporterFieldCallback: function (grid, row, col, input) {
                        if (col.colDef.type == 'date') {
                            return $filter('date')(input, " HH:mm:ss dd/MM/yyyy");
                        }
                        else if (col.colDef.type == 'object' && input && input.comboValues){
                            var tmp = _.find(input.comboValues, {ComboValueField : input.value});
                            if (tmp){
                                return  $scope.localLanguage ? tmp.ComboQueryHField : tmp.ComboQueryEField;
                            }
                            return input.value;
                        } 
                        else {
                            return input;
                        }
                    },
                    exporterPdfOrientation: 'landscape',
                    exporterPdfPageSize: 'LETTER',
                    exporterPdfMaxGridWidth: 580,
                    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        $scope.gridApi.core.on.rowsRendered( $scope, function() {
                            if ($scope.rendered){
                                return;
                            }
                            $scope.rendered = true;
                            if ($scope.reportStructure){
                                $scope.reportStructure = [
                                    {ReportColumnsOrder : $scope.reportStructure['ReportColumnsOrder']},
                                    {ReportHiddenColumns : $scope.reportStructure['ReportHiddenColumns']},
                                    {ReportFilter : $scope.reportStructure['ReportFilter']},
                                    {ReportSort : $scope.reportStructure['ReportSort']}
                                ]
                                $scope.updateReportState();
                            }
                        });     


                        if ($scope.content.request.formID === 196) {
                            $scope.gridApi.core.on.columnVisibilityChanged( $scope, (column) => {
                                const index = $sessionStorage.unScheduledJobsColumns.defaultColumns.indexOf(column.field);
                                if (column.visible) {
                                    if (index < 0) {
                                        $sessionStorage.unScheduledJobsColumns.defaultColumns.push(column.field);
                                    }
                                }
                                else if (index >= 0) {
                                    $sessionStorage.unScheduledJobsColumns.defaultColumns.splice(index,1);
                                }
                            });
                        }

                        if ($scope.gridApi.selection) {
                            $scope.gridApi.selection.on.rowSelectionChanged($scope,editableTable.rowSelection);
                            $scope.gridApi.selection.on.rowSelectionChangedBatch($scope,editableTable.rowSelectionBatch);
                        }

                        if ($scope.gridApi.draggableRows && $scope.reOrder){
                            $scope.gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget) {
                                editableTableCtrl.gridOptions.data[info.toIndex][$scope.reOrderFieldName] = info.targetRowEntity[$scope.reOrderFieldName];
                                if (info.fromIndex < info.toIndex){
                                    for (var i = info.fromIndex;i < info.toIndex; i++){
                                        editableTableCtrl.gridOptions.data[i][$scope.reOrderFieldName]--;
                                    }
                                }
                                else if (info.fromIndex > info.toIndex){
                                    for (var i = info.fromIndex;i > info.toIndex ; i--){
                                        editableTableCtrl.gridOptions.data[i][$scope.reOrderFieldName]++;
                                    }
                                }
                                for (var i = 0; i < editableTableCtrl.gridOptions.data.length; i++) {
                                    for (var j = 0; j < $scope.MandatoryFields.length; j++) {
                                        commonFunctions.searchParent($scope,'updateExistingValues')($scope.FieldName, angular.copy(editableTableCtrl.gridOptions.data[i]), $scope.MandatoryFields[j].fieldName, $scope.MandatoryFields[j].type);
                                    }
                                    commonFunctions.searchParent($scope,'updateReorder')(editableTableCtrl.gridOptions.data[i]);
                                }
                            });
                        }
                        
                        else{
                            $scope.gridApi.dragndrop.setDragDisabled(true);
                        }

                        $timeout(function(){
                            $scope.gridApi.core.handleWindowResize();
                        },200)
                    }
                };

                $scope.maxHeight = document.body.clientHeight - $element[0].getBoundingClientRect().top - 300;
                $scope.height = document.body.clientHeight - $element[0].getBoundingClientRect().top - 38 - 22 - 15 - 30 - 30 - 65;
                editableTableCtrl.gridOptions.appScopeProvider = editableTableCtrl;
                $scope.languageToDisplay = 'DisplayEName';
                if ($scope.localLanguage){
                    $scope.languageToDisplay = 'DisplayLName';
                }
                $scope.MandatoryFields = [];
                $scope.newRow = {};
                for (var i = 0;i < $scope.editableTableData.recordTemplate.length ; i++){
                    var record = $scope.editableTableData.recordTemplate[i];
                    if (record.DisplayType != 7){
                        editableTableCtrl.gridOptions.columnDefs.push({
                            name: record.Name,
                            displayName: record[$scope.languageToDisplay],
                            field: record.Name,
                            exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                            headerTooltip: true,
                            cellClass: 'multiFormCell',
                            cellTemplate : $scope.getCellTemplate(record),
                            filter : $scope.getColumnFilter(record),
                            type : $scope.getColumnType(record)
                        });
                    }
                    else{
                        editableTableCtrl.gridOptions.columnDefs.push({
                            name: record.Name,
                            displayName: record[$scope.languageToDisplay],
                            field: record.Name,
                            exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                            headerTooltip: true,
                            cellClass: 'multiFormCell ui-grid-cell-date',
                            cellTemplate : $scope.getCellTemplate(record),
                            type: 'date',
                            cellFilter: "date:'DD/MM/yyyy HH:mm:ss'",
                            filters: [{
                                condition: function (term, value) {
                                    if (!term) return true;
                                    var valueDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                    var replaced = term.replace(/\\/g, '');
                                    return valueDate.indexOf(replaced) >= 0;
                                },
                                placeholder: ''
                            }],
                        });
                    }
                    if (record.DisplayType == 2) {
                        $scope.newRow[record.Name] = {
                            value : "",
                            comboValues : record.comboValues
                        }
                        if (record.ChildName != null){
                            editableTableCtrl.gridOptions.columnDefs.push({
                                name: record.ChildName,
                                displayName: $scope.localLanguage ? record['ChildDisplayLName'] : record['ChildDisplayEName'],
                                field: record.ChildName,
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                headerTooltip: true,
                                cellClass: 'multiFormCell',
                                cellTemplate : $scope.getCellTemplate(record,true),
                            });
                            $scope.newRow[record.ChildName] = {
                                value : "",
                                comboValues : _.groupBy(record.comboValues,'ComboValueField'),
                                parentCombo : record.Name
                            }
                        }
                    }
                    // console.log("record "+JSON.stringify(record));
                    if (record.MandatoryField || record.Name == "DictionaryID") {
                        if (record.DisplayType == 6) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'num'});
                        }
                        else if (record.DisplayType == 1) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'text'});
                        }
                        else if (record.DisplayType == 3) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'checkbox'});
                        }
                        else if (record.DisplayType == 2) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'combo'});
                        }
                        else if (record.DisplayType == 7) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'Date'});
                        }
                        else if (record.DisplayType == 8) {
                            $scope.MandatoryFields.push({fieldName: record.Name, type: 'time'});
                        }
                    }
                    if (record.SearchLinkReportID !== null){
                        $scope.FieldName = record.Name;
                    }
                    if (record.isOrderField === true) {
                        $scope.reOrder = true;
                        editableTableCtrl.gridOptions.rowTemplate = '<div grid="grid" class="ui-grid-draggable-row" draggable="true"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div></div>',

                        editableTableCtrl.gridOptions.enableSorting = false;
                        $scope.reOrderFieldName = record.Name;
                        $scope.editableTableData.AllrecordValue = _.sortBy($scope.editableTableData.AllrecordValue,function(record){
                            var reOrderField = _.find(record,{Name : $scope.reOrderFieldName});
                            if (reOrderField && reOrderField != ""){
                                return parseInt(reOrderField.value);
                            }
                            return 1000;
                        });
                        editableTableCtrl.gridOptions.columnDefs.unshift({
                            name: 'reOrder',
                            displayName: '',
                            enableFiltering: false,
                            enableColumnMenu: false,
                            enableColumnMoving : false,
                            field: 'reOrder',
                            exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                            headerTooltip: false,
                            width : 50,
                            cellClass: 'multiFormCell',
                            cellTemplate : '<div style="text-align: center"><a style="cursor : move"><i class="fa fa-arrows"></i></a></div>'

                        });
                    }
                }

                $scope.rowsCount = 0;

                if ($scope.editableTableData.AllrecordValue.length > 0 ){
                    editableTableCtrl.gridOptions.data = _.map($scope.editableTableData.AllrecordValue,function(record){
                        var row = {};
                        if ($scope.editableTableData.HasTree){
                            editableTableCtrl.initTreeGraphRow(row,record,$scope.editableTableData.TreeApiName,
                                $scope.editableTableData.TreeApiParameters,$scope.editableTableData.TargetTreeNodeParameter,
                                $scope.editableTableData.TargetTreeNodeParameterAppObject);
                        }
                        for (var i = 0; i < record.length ; i++){
                            if (record[i].DisplayType == 6){
                                if (record[i].value != "" && record[i].value != null) {
                                    if (record[i].DecimalPoint !== null && record[i].DecimalPoint > 0) {
                                        record[i].value = parseFloat(parseFloat(record[i].value).toFixed(record[i].DecimalPoint));
                                    }
                                    else{
                                        record[i].value = parseFloat(record[i].value);
                                    }
                                    row[record[i].Name] = record[i].value;
                                }
                            }
                            else if (record[i].DisplayType == 2){
                                var comboTemplate = _.find($scope.editableTableData.recordTemplate,{Name : record[i].Name});
                                var comboValues = record[i].comboValues;
                                if (comboTemplate){
                                    comboValues = comboTemplate.comboValues;
                                    if ($scope.content.request.formID === 196){
                                        const dep = _.find(record,{Name: "Department"});
                                        const machineType = _.find(record,{Name: "MachineType"});
                                        comboValues = comboValues.filter(value => dep.value === value.department || machineType.value === value.machineType);
                                    }
                                }
                                if (record[i].value != null && record[i].value != ""){
                                    record[i].value = parseInt(record[i].value);
                                }
                                row[record[i].Name] = {
                                    value : record[i].value,
                                    comboValues : comboValues
                                }
                                if (record[i].DisplayType == 2 && record[i].ChildName != null) {
                                    row[record[i].ChildName] = {
                                        value : "",
                                        comboValues : _.groupBy(comboValues,'ComboValueField'),
                                        parentCombo : record[i].Name
                                    }
                                    var chosenParentCombo = _.find(record[i].comboValues, {isDefault: true});
                                    if (chosenParentCombo) {
                                        var chosenChild = _.find(chosenParentCombo.ChildcomboValues, {isDefault: true});
                                        if (chosenChild) {
                                            row[record[i].ChildName].value = chosenChild.ComboValueField;
                                        }
                                    }
                                }
                            }
                            else if (record[i].DisplayType == 3){
                                record[i].value = (record[i].value == "True");
                                row[record[i].Name] = record[i].value;
                            }
                            else if (record[i].DisplayType == 7){
                                if (record[i].value != "" && record[i].value != null && record[i].AllowEntry) {
                                    record[i].value = moment(record[i].value,"DD/MM/YYYY HH:mm:ss");
                                }
                                row[record[i].Name] = record[i].value;
                            }
                            else if (record[i].DisplayType == 8){
                                if (record[i].value != null) {
                                    record[i].value = record[i].value.substring(11, 16);
                                }
                                row[record[i].Name] = record[i].value;
                            }
                            else{
                                row[record[i].Name] = record[i].value;
                            }
                            if (record[i].Name == $scope.reOrderFieldName && (row[record[i].Name] == null || row[record[i].Name] == "")){
                                row[record[i].Name] = 1000;
                            }
                        }
                        row.multiFormIndex = $scope.rowsCount;
                        $scope.rowsCount++;
                        return row;
                    });
                }
                $timeout(() => {
                    $scope.gridLoading = false;
                });
                if ($scope.content.request.formID === 196){
                    let defaultVisibleColumns = [
                        'Department',
                        'MachineID',
                        'CatalogID',
                        'ProductID',
                        'ERPJobID',
                        'ID',
                        'UnitsTarget',
                    ];
                    if ($sessionStorage.unScheduledJobsColumns && 
                        $sessionStorage.unScheduledJobsColumns.defaultColumns && 
                        $sessionStorage.unScheduledJobsColumns.version === GLOBAL.version) {
                        defaultVisibleColumns = $sessionStorage.unScheduledJobsColumns.defaultColumns;
                    } else {
                        $sessionStorage.unScheduledJobsColumns = {
                            defaultColumns: defaultVisibleColumns,
                            version: GLOBAL.version,
                        }
                    }
                    
                    editableTableCtrl.gridOptions.columnDefs.sort(function (a, b) {
                        return defaultVisibleColumns.indexOf(a.name) - defaultVisibleColumns.indexOf(b.name);
                    })
                    
                    editableTableCtrl.gridOptions.columnDefs.forEach(column => {
                        column.enableHiding = true;
                        
                        if (defaultVisibleColumns.indexOf(column.name) >= 0) {
                            column.visible = true;
                        }
                        else {
                            column.visible = false;
                        }
                    });
                }
                $rootScope.$broadcast('finished-loading');
                $scope.content.data.callback(true);
            });
        }

        editableTableCtrl.initTreeGraphRow = function(row,allRecords,TreeApiName,TreeApiParameters,TargetTreeNodeParameter,TargetTreeNodeParameterAppObject){
            if (TreeApiName){
                row.treeData = {
                    TreeApiName : TreeApiName,
                    TargetTreeNodeParameter : TargetTreeNodeParameter,
                    TargetTreeNodeParameterAppObject : TargetTreeNodeParameterAppObject,
                    TreeApiParameters : []
                }
                if (TreeApiParameters){
                    var params = TreeApiParameters.split(",");
                    for (var i = 0;i <  params.length ; i++){
                        var param = params[i].split("=");
                        if (param.length == 1){
                            var found = _.find(allRecords,{Name : params[i]});
                            if (found && found.value && found.value != ""){
                                row.treeData.TreeApiParameters.push({
                                    key : params[i],
                                    value : found.value
                                });
                            }
                        }
                        else{
                            var found = _.find(allRecords,{Name : param[1]});
                            if (found && found.value && found.value != ""){
                                row.treeData.TreeApiParameters.push({
                                    key : param[0],
                                    value : found.value
                                });
                            }
                        }
                    }
                }
            }
        };

        editableTableCtrl.openInSameWindow = function (ID, linkItem) {
            if ($scope.content.data.openNewAppObject) {
                $scope.content.data.openNewAppObject(ID, linkItem, 'ID');
            }
            else {
                var url = $state.href('appObjectFullView', {
                    appObjectName: linkItem,
                    ID: ID
                });
                window.open(url, '_blank');
            }
        };

        editableTable.rowSelectionBatch = function(selectData){
           for (var i = 0;i < selectData.length ; i++){
               editableTable.rowSelection(selectData[i]);
           }
        }
        editableTable.rowSelection = function(selectData){
            $scope.showRemoveButton = false;

            if ($scope.gridApi.selection.getSelectedGridRows().length > 0) {
                    if ($scope.editableTableData.AllowDeleteEntry) {
                        $scope.showRemoveButton = true;
                    } else {
                        angular.forEach($scope.gridApi.selection.getSelectedGridRows(), function (i) {
                            if (i.entity.multiFormNewRow) {
                                $scope.showRemoveButton = true;

                            }
                        })
                    }
            }

            if (!$scope.content.data.hasCheckbox){
                return;
            }

            if (selectData.isSelected) {
                for (var i = 0; i < $scope.MandatoryFields.length; i++) {
                    commonFunctions.searchParent($scope,'updateExistingValues')($scope.FieldName, angular.copy(selectData.entity), $scope.MandatoryFields[i].fieldName, $scope.MandatoryFields[i].type);
                }
                commonFunctions.searchParent($scope,'updateExistingValues')('ID', angular.copy(selectData.entity), 'ID', "num");
            }
            else {
                commonFunctions.searchParent($scope,'removeValue')('ID', angular.copy(selectData.entity), true);
            }
        };

        editableTableCtrl.valueChanged = function (row, fieldName, type) {
            var row = _.findIndex(editableTableCtrl.gridOptions.data,{multiFormIndex : row});
            var data  = editableTableCtrl.gridOptions.data[row][fieldName];
            if (editableTableCtrl.gridOptions.data[row].multiFormNewRow){
                for (var i = 0; i < $scope.MandatoryFields.length; i++) {
                    if ($scope.MandatoryFields[i].fieldName != fieldName && $scope.MandatoryFields[i].fieldName != 'ID') {
                        $scope.valueChangedAddNew(row, $scope.MandatoryFields[i].fieldName, $scope.MandatoryFields[i].type, data);
                    }
                }
                $scope.valueChangedAddNew(row, fieldName, type, data);
                return;
            }
            else{
                if (type == 'Date'){
                    if (type == 'Date' && typeof editableTableCtrl.gridOptions.data[row][fieldName] === "string" && editableTableCtrl.gridOptions.data[row][fieldName] != ""
                        && editableTableCtrl.gridOptions.data[row][fieldName] != null) {
                        var format = 'DD/MM/YYYY HH:mm:ss';
                        editableTableCtrl.gridOptions.data[row][fieldName] = moment(editableTableCtrl.gridOptions.data[row][fieldName], format);
                    }
                    else if (editableTableCtrl.gridOptions.data[row][fieldName] == "" || editableTableCtrl.gridOptions.data[row][fieldName] == null){
                        editableTableCtrl.gridOptions.data[row][fieldName] = null;
                    }
                }
                for (var i = 0; i < $scope.MandatoryFields.length; i++) {
                    commonFunctions.searchParent($scope,'updateExistingValues')($scope.FieldName, angular.copy(editableTableCtrl.gridOptions.data[row]), $scope.MandatoryFields[i].fieldName, $scope.MandatoryFields[i].type);
                }
                var copiedData = angular.copy(editableTableCtrl.gridOptions.data[row]);
                if (!copiedData[fieldName]) {
                    copiedData[fieldName] = null;
                }
                if (type == 'Date' && copiedData[fieldName]) {
                    copiedData[fieldName] = $scope.convertDate(copiedData[fieldName]._d);
                }
                if (type == 'time' && copiedData[fieldName]) {
                    copiedData[fieldName] = '1899-12-30 ' + copiedData[fieldName] + ':00';
                    type = 'Date';
                }
                commonFunctions.searchParent($scope,'updateExistingValues')($scope.FieldName, copiedData, fieldName, type);
            }
        };


        editableTableCtrl.removeRow = function (rowIndex) {
            var index = _.findIndex(editableTableCtrl.gridOptions.data,{multiFormIndex : rowIndex});
            if (index >= 0){
                commonFunctions.searchParent($scope,'removeValue')($scope.FieldName, editableTableCtrl.gridOptions.data[index]);
                editableTableCtrl.gridOptions.data.splice(index, 1);
            }
        };

        $scope.addRow = function () {
            editableTableCtrl.addRow(-1);
        };

        editableTableCtrl.addRow = function (rowIndex) {
            var newRow = angular.copy($scope.newRow);
            newRow.multiFormIndex = $scope.rowsCount;
            newRow.multiFormNewRow = true;
            if (rowIndex < 0){
                editableTableCtrl.gridOptions.data.push(newRow)
                $scope.rowsCount++;
                //set focus to the new row
                let element = document.querySelector(".ui-grid-viewport");
                let elementScrollHeight =  element.scrollHeight;
                element.scrollTo({top: elementScrollHeight, behavior: 'smooth'})
                $timeout(function(){
                    let element = document.querySelector(".ui-grid-viewport");
                    let elementScrollHeight =  element.scrollHeight;
                    element.scrollTo({top: elementScrollHeight, behavior: 'smooth'})
                },500);
                return $scope.rowsCount - 1;
            }
            var index = _.findIndex(editableTableCtrl.gridOptions.data,{multiFormIndex : rowIndex});
            if (index >= 0){
                editableTableCtrl.gridOptions.data.splice(index + 1, 0,newRow);
            }
            else{
                editableTableCtrl.gridOptions.data.splice(editableTableCtrl.gridOptions.data.length + 1 , 0,newRow);
            }
            $scope.rowsCount++;
            return $scope.rowsCount - 1;
        };


        $scope.valueChangedAddNew = function (row, fieldName, type, data) {
            if (type === 'combo') {
                var value = null;
                if (editableTableCtrl.gridOptions.data[row][fieldName] && editableTableCtrl.gridOptions.data[row][fieldName].value !== undefined
                && editableTableCtrl.gridOptions.data[row][fieldName].value !== null) {
                    value = editableTableCtrl.gridOptions.data[row][fieldName].value;
                }
                commonFunctions.searchParent($scope,'newValue')(fieldName,editableTableCtrl.gridOptions.data[row], value, 'num');
            }
            else {
                var value = editableTableCtrl.gridOptions.data[row][fieldName];
                if (type === 'checkbox') {
                    if (value === true)
                        value = 1;
                    else
                        value = 0;
                }
                if (type == 'text') {
                    commonFunctions.searchParent($scope,'newValue')(fieldName,editableTableCtrl.gridOptions.data[row], value, 'text');
                }
                else if (type == 'Date') {
                    if (type == 'Date' && typeof editableTableCtrl.gridOptions.data[row][fieldName] === "string" && editableTableCtrl.gridOptions.data[row][fieldName] != ""
                        && editableTableCtrl.gridOptions.data[row][fieldName] != null) {
                        var format = 'YYYY-MM-DD HH:mm:ss';
                        editableTableCtrl.gridOptions.data[row][fieldName] = moment(editableTableCtrl.gridOptions.data[row][fieldName], format);
                    }
                    else if (value == "" || value == null){
                        value = null;
                    }
                    var tempValue = value;
                    if (value) {
                        tempValue = $scope.convertDate(value._d);
                    }
                    editableTableCtrl.gridOptions.data[row][fieldName] = value;
                    commonFunctions.searchParent($scope,'newValue')(fieldName,editableTableCtrl.gridOptions.data[row], tempValue, 'Date');
                }
                else if (type == 'time') {
                    commonFunctions.searchParent($scope,'newValue')(fieldName,editableTableCtrl.gridOptions.data[row], '1899-12-30 ' + value + ':00', 'Date');
                }
                else {
                    commonFunctions.searchParent($scope,'newValue')(fieldName,editableTableCtrl.gridOptions.data[row], value, 'num');
                }
            }
        };

        editableTableCtrl.AddNewItem = function (rowIndex, FieldName, reportID) {
            var addItem = function (IDs) {
                for (var i = 0;i < IDs.length; i++){
                    if (i == 0){
                        var row = _.find(editableTableCtrl.gridOptions.data,{multiFormIndex : rowIndex});
                        if (row){
                            row[FieldName] = IDs[i];
                            commonFunctions.searchParent($scope,'newValue')(FieldName,row, IDs[i], 'num', true);
                        };
                    }
                    else{
                        var newRowIndex = editableTableCtrl.addRow(rowIndex);
                        var row = _.find(editableTableCtrl.gridOptions.data,{multiFormIndex : newRowIndex});
                        if (row){
                            row.newMultiFormRowAdded = true;
                            row[FieldName] = IDs[i];
                            commonFunctions.searchParent($scope,'newValue')(FieldName,row, IDs[i], 'num', true);
                        };
                        rowIndex = newRowIndex;
                    }
                }
            };

            var modalInstance = $modal.open({
                templateUrl: 'views/common/mainContentTemplate.html',
                controller: function ($scope, $compile, $modalInstance, reportID, commonFunctions) {
                    $scope.reportID = reportID;
                    $scope.pageDisplay = 0;
                    $scope.returnValue = true;
                    $scope.onlyNewTab = true;
                    $scope.modal = true;
                    $scope.showBreadCrumb = false;
                    $scope.multiSelect = true;
                    $scope.hideCriteria = true;
                    $scope.searchInMultiForm = true;
                    $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
                    commonFunctions.commonCodeSearch($scope);
                    $scope.getDisplayReportSearchFields();
                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.rowClicked = function (IDs) {
                        $modalInstance.close(IDs);
                    }
                },
                resolve: {
                    reportID: function () {
                        return reportID;
                    }
                }
            }).result.then(function (IDs) {
                addItem(IDs);
            });
        };

        $scope.deleteRows = function () {
            angular.forEach($scope.gridApi.selection.getSelectedGridRows(), function (i) {
                if ($scope.editableTableData.AllowDeleteEntry) {
                    editableTableCtrl.removeRow(i.entity.multiFormIndex);
                } else {
                    if (i.entity.multiFormNewRow) {
                        editableTableCtrl.removeRow(i.entity.multiFormIndex);
                    }
                }
            });

            $scope.showRemoveButton = false;
        };

        $scope.export = function(export_format,export_type){
            if (export_format == 'excel') {
              var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
              $scope.gridApi.exporter.excelExport( export_type, export_type, myElement );
            } else if (export_format == 'pdf') {
              $scope.gridApi.exporter.pdfExport( export_type, export_type );
            };
        };

        $scope.openTree = function(treeData){
            if (treeData && treeData.TargetTreeNodeParameter && treeData.TreeApiName){
                var parameters = [];
                var row = $scope.gridApi.selection.getSelectedRows()[0];
                for (var i = 0;i < treeData.TreeApiParameters.length ; i++){
                        parameters.push({
                            key : treeData.TreeApiParameters[i].key,
                            value : treeData.TreeApiParameters[i].value
                        });
                }
                var requestBody = {};
                for (var i = 0;i < parameters.length ; i++){
                    requestBody[parameters[i].key] = parameters[i].value;
                }
                graphService.graphCode(treeData.TreeApiName,requestBody,
                    {ID : _.find(parameters,{key : treeData.TargetTreeNodeParameter}).value,linkItem : treeData.TargetTreeNodeParameterAppObject});
            }
        };

        init();
    };

    return {
        restrict: "E",
        link: linker,
        templateUrl: template,
        scope: {
            content: '='
        },
        controller: controller,
        controllerAs: "editableTableCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('editableTable', editableTable);