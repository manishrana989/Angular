
function inputDirective($compile) {

    var textTemplate = "views/common/objectFields/text.html"; //done
    var comboTemplate = "views/common/objectFields/combo.html"; //done
    var checkTemplate = "views/common/objectFields/check.html";
    var labelTemplate = "views/common/objectFields/label.html";
    var numberTemplate = "views/common/objectFields/number.html"; //done
    var dateTemplate = "views/common/objectFields/date.html";
    var textAreaTemplate = "views/common/objectFields/textarea.html";
    var passwordTemplate = "views/common/objectFields/password.html";
    var fileTemplate = "views/common/objectFields/file.html";
    var colorTemplate = "views/common/objectFields/color.html";

    var getTemplateFormResults = function (displayId) {
        var template = '';

        switch (displayId) {
            case 1:
                template = textTemplate;
                break;
            case 2:
                template = comboTemplate;
                break;
            case 3:
                template = checkTemplate;
                break;
            case 4:
                template = labelTemplate;
                break;
            case 6:
                template = numberTemplate;
                break;
            case 7:
                template = dateTemplate;
                break;
            case 10:
                template = labelTemplate;
                break;
            case 13:
                template = passwordTemplate;
                break;
            case 14:
                template = textAreaTemplate;
                break;
            case 16:
                template = fileTemplate;
                break;
            case 17:
                template = fileTemplate;
                break;
            case 18:
                template = colorTemplate;
                break;
        }
        return template
    };

    var getTemplateSearch = function (DisplayTypeName) {
        var template = '';
        DisplayTypeName = DisplayTypeName.toLowerCase();
        switch (DisplayTypeName) {
            case "date":
                template = dateTemplate;
                break;
            case "num":
                template = numberTemplate;
                break;
            case "number":
                template = numberTemplate;
                break;
            case "text":
                template = textTemplate;
                break;
            case "combo":
                template = comboTemplate;
                break;
            case "boolean" :
                template = checkTemplate;
                break;
            case "LinkedLabel" :
                template = labelTemplate;
                break;
        }
        return template;
    };

    var linker = function (scope, element, attrs) {
        if (scope.content.DisplayType)
            scope.contentUrl = getTemplateFormResults(scope.content.DisplayType);
        else
            scope.contentUrl = getTemplateSearch(scope.content.DisplayTypeName);
    };


    var controller = function ($scope, LeaderMESservice, $modal, $state, commonFunctions, AuthService) {

        function decimalAdjust(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }
        var inputValue = this;
        inputValue.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        inputValue.format = inputValue.formats[0];
        inputValue.content = $scope.content;
        inputValue.search = $scope.search;
        inputValue.formobject = $scope.formobject;
        inputValue.multiform = $scope.multiform;

       
        function init() {
            inputValue.localLanguage = false;
            if (inputValue.content.editableTable === true) {
                inputValue.contentDisplayName = "";
            }
            else {
                inputValue.contentDisplayName = inputValue.displayName(inputValue.content);
            }
            if (inputValue.content.DisplayType) {
                inputValue.required = (inputValue.content.ShowInCriteria == true && inputValue.multiform ? false : !inputValue.content.AllowNull);
                inputValue.disabled = !(inputValue.content.AllowEntry || ($scope.add && commonFunctions.searchParent($scope,'add') ? inputValue.content.ShowOnNew : false));
                
          
                if (inputValue.content.DisplayType == 3) {
                    inputValue.value = inputValue.content.value == 'True';
                }
                else if (inputValue.content.DisplayType == 2) {
                    inputValue.value = inputValue.content.comboValues;
                    inputValue.localLanguage = LeaderMESservice.showLocalLanguage();
                    inputValue.valueChosen = _.find(inputValue.value, {isDefault: true});
                    if (inputValue.valueChosen == undefined)
                        inputValue.valueChosen = null;
                    inputValue.ChildValueChosen = null;
                    if (inputValue.valueChosen) {
                        inputValue.ChildValueChosen = _.find(inputValue.valueChosen.ChildcomboValues, {isDefault: true});
                        if (inputValue.ChildValueChosen == undefined)
                            inputValue.ChildValueChosen = null;
                    }
                }
                else if (inputValue.content.DisplayType == 13) {
                    inputValue.password = {
                        value: angular.copy(inputValue.content.value)
                    };
                    inputValue.checkValidity = function () {
                        inputValue.formobject.$setValidity('pwmatch', inputValue.password.confirmValue == inputValue.password.value);
                    };
                    inputValue.formobject.$setValidity('pwmatch', inputValue.password.confirmValue == inputValue.password.value);
                }
                else if (inputValue.content.DisplayType == 16 || inputValue.content.DisplayType == 17) {
                    if (inputValue.content.value.toLowerCase().indexOf('pdf') >= 0) {
                        $scope.pdfUrl = inputValue.content.value;
                        inputValue.content.fileType = "Pdf";
                    }
                    else if (inputValue.content.value.toLowerCase().indexOf('jpg') >= 0) {
                        $scope.pdfUrl = inputValue.content.value;
                        inputValue.content.fileType = "Picture";
                    }
                    else if (inputValue.content.value.toLowerCase().indexOf('jpeg') >= 0) {
                        $scope.pdfUrl = inputValue.content.value;
                        inputValue.content.fileType = "Picture";
                    }
                    else if (inputValue.content.value.toLowerCase().indexOf('bmp') >= 0) {
                        $scope.pdfUrl = inputValue.content.value;
                        inputValue.content.fileType = "Picture";
                    }
                    else if (inputValue.content.value.toLowerCase().indexOf('png') >= 0) {
                        $scope.pdfUrl = inputValue.content.value;
                        inputValue.content.fileType = "Picture";
                    }
                    inputValue.value = inputValue.content.value;

                    if (inputValue.value != null && inputValue.value != "") {
                        inputValue.fileName = inputValue.value.split('/');
                        inputValue.fileName = inputValue.fileName[inputValue.fileName.length - 1];
                    }
                }
                else if (inputValue.content.DisplayType == 7 && inputValue.content.value) {
                    inputValue.value = moment(inputValue.content.value, "YYYY/MM/DD HH:mm:ss");
                }
                else {
                    inputValue.value = angular.copy(inputValue.content.value);
                }
            }
            else {
                function convertDate(date) {
                    return [paddingZerosToDate(date.getUTCDate()),
                            paddingZerosToDate(date.getUTCMonth() + 1),
                            paddingZerosToDate(date.getUTCFullYear())].join('/') +
                        ' ' +
                        [paddingZerosToDate(date.getUTCHours()),
                            paddingZerosToDate(date.getUTCMinutes()),
                            paddingZerosToDate(date.getUTCSeconds())].join(':');
                }

                if (inputValue.content.DisplayTypeName == "date") {
                    inputValue.value = null;
                    inputValue.valueEq = null;
                    inputValue.valueGTEQ = null;
                    inputValue.valueLTEQ = null;
                    for (var i = 0; i < inputValue.content.DefaultValue.length; i++) {
                        if (inputValue.content.DefaultValue[i].Comp == '=') {
                            inputValue.valueEq = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, moment(inputValue.valueEq, "yyyy-MM-DD HH:mm:ss").format("DD/MM/YYYY HH:mm:ss"), 'Eq', 'Date');
                        }
                        else if (inputValue.content.DefaultValue[i].Comp == '>=') {
                            inputValue.valueGTEQ = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, moment(inputValue.valueGTEQ, "yyyy-MM-DD HH:mm:ss").format("DD/MM/YYYY HH:mm:ss"), 'GTEq', 'Date');
                        }
                        else if (inputValue.content.DefaultValue[i].Comp == '<=') {
                            inputValue.valueLTEQ = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, moment(inputValue.valueLTEQ, "yyyy-MM-DD HH:mm:ss").format("DD/MM/YYYY HH:mm:ss"), 'LTEq', 'Date');
                        }
                    }
                }
                else if (inputValue.content.DisplayTypeName.toLowerCase() == "combo") {
                    inputValue.value = inputValue.content.comboValues;
                    inputValue.localLanguage = LeaderMESservice.showLocalLanguage();
                    inputValue.valueChosen = null;
                    if (inputValue.content.ChildName !== null)
                        inputValue.contentChildDisplayName = inputValue.displayChildName(inputValue.content);
                    inputValue.ChildValueChosen = null;

                    if (inputValue.content.ComboDisplayList) {
                        inputValue.valueChosenEQ = [];
                        inputValue.valueChosenNEQ = [];
                    }
                    for (var i = 0; i < inputValue.content.DefaultValue.length; i++) {
                        if (inputValue.content.DefaultValue[i].Comp == '=') {
                            if (inputValue.content.ComboDisplayList == true) {
                                for (var j = 0; j < inputValue.content.DefaultValue[i].Value.length; j++) {
                                    var newValue = _.find(inputValue.value, {ComboValueField: inputValue.content.DefaultValue[i].Value[j]});
                                    if (newValue) {
                                        inputValue.valueChosenEQ.push(newValue);
                                    }
                                }
                                inputValue.updateValue(inputValue.content.Name, inputValue.valueChosenEQ, 'INclause', 'combo');
                            }
                            else {
                                inputValue.valueChosenEQ = _.find(inputValue.value, {ComboValueField: inputValue.content.DefaultValue[i].Value[0]});
                                inputValue.updateValue(inputValue.content.Name, inputValue.valueChosenEQ, 'Eq', 'combo');
                            }
                        }
                        else if (inputValue.content.DefaultValue[i].Comp == '<>') {
                            if (inputValue.content.ComboDisplayList == true) {
                                for (var j = 0; j < inputValue.content.DefaultValue[i].Value.length; j++) {
                                    var newValue = _.find(inputValue.value, {ComboValueField: inputValue.content.DefaultValue[i].Value[j]});
                                    if (newValue) {
                                        inputValue.valueChosenNEQ.push(newValue);
                                    }
                                }
                                inputValue.updateValue(inputValue.content.Name, inputValue.valueChosenNEQ, 'NotINclause', 'combo')
                            }
                            else {
                                inputValue.valueChosenNEQ = _.find(inputValue.value, {ComboValueField: inputValue.content.DefaultValue[i].Value[0]});
                                inputValue.updateValue(inputValue.content.Name, inputValue.valueChosenNEQ, 'NotEqual', 'combo')
                            }
                        }
                    }
                }
                else if (inputValue.content.DisplayTypeName.toLowerCase() == "boolean") {
                    for (var i = 0; i < inputValue.content.DefaultValue.length; i++) {
                        if (inputValue.content.DefaultValue[i].Comp == '=') {
                            inputValue.valueChosen = inputValue.content.DefaultValue[i].Value[0];
                            inputValue.updateValue(inputValue.content.Name, inputValue.valueChosen, 'Eq', 'True/False');
                            break;
                        }
                    }
                    inputValue.value = ["TRUE", "FALSE"];
                }
                else if (inputValue.content.DisplayTypeName.toLowerCase() == "num") {
                    inputValue.valueEq = null;
                    inputValue.valueGTEQ = null;
                    inputValue.valueLTEQ = null;
                    for (var i = 0; i < inputValue.content.DefaultValue.length; i++) {
                        if (inputValue.content.DefaultValue[i].Comp == '=') {
                            inputValue.valueEq = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, inputValue.valueEq, 'Eq', 'num')
                        }
                        else if (inputValue.content.DefaultValue[i].Comp == '>=') {
                            inputValue.valueGTEQ = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, inputValue.valueGTEQ, 'GTEq', 'num')
                        }
                        else if (inputValue.content.DefaultValue[i].Comp == '<=') {
                            inputValue.valueLTEQ = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, inputValue.valueLTEQ, 'LTEq', 'num')
                        }
                    }
                }
                else if (inputValue.content.DisplayTypeName.toLowerCase() == "text") {
                    inputValue.value = null;
                    for (var i = 0; i < inputValue.content.DefaultValue.length; i++) {
                        if (inputValue.content.DefaultValue[i].Comp == '=') {
                            inputValue.value = angular.copy(inputValue.content.DefaultValue[i].Value[0]);
                            inputValue.updateValue(inputValue.content.Name, inputValue.value, 'Eq', 'text');
                        }
                    }
                }
                else {
                    inputValue.value = null;
                }
            }
            inputValue.localLanguage = LeaderMESservice.showLocalLanguage();
            if (inputValue.content.DecimalPoint !== null && inputValue.content.DecimalPoint > 0) {
                inputValue.content.decimalValue = "0.";
                for (var i = 0; i < inputValue.content.DecimalPoint - 1; i++) {
                    inputValue.content.decimalValue = inputValue.content.decimalValue + "0";
                }
                inputValue.content.decimalValue = inputValue.content.decimalValue + "1";
                inputValue.content.decimalValue = parseFloat(inputValue.content.decimalValue);
            }
        }

        inputValue.addNewItem = function () {
            var modalInstance = $modal.open({
                templateUrl: 'views/common/mainContentTemplate.html',
                controller: function ($scope, $compile, $modalInstance, reportID, commonFunctions) {
                    $scope.reportID = reportID;
                    $scope.pageDisplay = 0;
                    $scope.returnValue = true;
                    $scope.onlyNewTab = true;
                    $scope.modal = true;
                    $scope.showBreadCrumb = false;
                    $scope.multiSelect = false;
                    $scope.hideCriteria = true;
                    commonFunctions.commonCodeSearch($scope);

                    $scope.getDisplayReportSearchFields();


                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.rowClicked = function (id, formID, fieldName) {
                        $modalInstance.close(id);
                    }
                },
                resolve: {
                    reportID: function () {
                        return inputValue.content.SearchLinkReportID;
                    }
                }
            }).result.then(function (ID) {
                inputValue.value = ID;
                commonFunctions.searchParent($scope,'updateValue')(inputValue.content.Name, inputValue.value, 'num', 'Eq');
            });
        };

        inputValue.openNewTab = function () {
            var url = $state.href('appObjectFullView', {
                appObjectName: inputValue.content.LinkTarget,
                ID: inputValue.content.value
            });
            window.open(url, inputValue.content.LinkTarget);
        };

        inputValue.displayName = function (content) {
            if (LeaderMESservice.showLocalLanguage() == true)
                return content.DisplayLName;
            return content.DisplayEName;
        };

        inputValue.displayChildName = function (content) {
            if (LeaderMESservice.showLocalLanguage() == true)
                return content.ChildDisplayLName;
            return content.ChildDisplayEName;
        };

        inputValue.updateDate = function (value) {
            if (typeof inputValue[value] === "string" && inputValue[value] != "" && inputValue[value] != null) {
                inputValue[value] = moment(inputValue[value], "DD/MM/YYYY HH:mm:ss");
            }
        };

        inputValue.updateValue = function (contentName, value, op, type, childName, valueChosen) {
            var userDateFormat = AuthService.getUserDateFormat();
            commonFunctions.searchParent($scope,'updateValue')(contentName, value, type, op, childName);
            if (childName) {
                if (valueChosen) {
                    inputValue[valueChosen] = value;
                }
                else {
                    inputValue.valueChosen = value;
                }
            }
            if(type == 'Date' && inputValue.value){
                inputValue.value = moment(inputValue.value, userDateFormat || "YYYY/DD/MM HH:mm:ss");
            }
        };


        inputValue.initField = function (value, type, child) {
            if (inputValue.content.DataSourceKey === true || inputValue.content.MandatoryField == true) {
                if (value == null)
                    commonFunctions.searchParent($scope,'updateValue')(child ? inputValue.content.ChildName : inputValue.content.Name, inputValue.content.ComboDisplayList ? [] : "", type, inputValue.content.ComboDisplayList ? 'INclause' : 'Eq');
                else
                    commonFunctions.searchParent($scope,'updateValue')(child ? inputValue.content.ChildName : inputValue.content.Name, value, type, 'Eq');
            }
        };

        init();

    };

    return {
        restrict: "E",
        link: linker,
        template: '<ng-include src="contentUrl"></ng-include>',
        scope: {
            content: '=',
            search: '=',
            formobject: '=',
            multiform: '=',
            add: '='
        },
        controller: controller,
        controllerAs: "inputValue"
    };
}

angular
    .module('LeaderMESfe')
    .directive('inputDirective', inputDirective);