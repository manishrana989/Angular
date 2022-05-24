function searchResults() {

    var template = "views/common/searchResults.html";

    var linker = function (scope, element, attrs) {
        scope.contentUrl = template;
    };

    var controller = function ($scope, $compile, $window, $state, $timeout, LeaderMESservice, $filter, $sessionStorage, $sessionStorage,
        commonFunctions, $q, notify, COGNOS, $element, uiGridConstants, $rootScope, $modal, stateService, graphService, SweetAlert,
        toastr, $localStorage) {

        function init() {

            var w = angular.element($window);
            $scope.userID = LeaderMESservice.getUserID();
            $scope.reportID = $scope.content.request.reportID || $scope.content.data.reportID;
            $scope.disableLinks = $scope.content.data.disableLinks;
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.language = $sessionStorage.language.substring(0, 2);
            $scope.rtl = LeaderMESservice.isLanguageRTL();
            $scope.gridLoading = true;
            $scope.selectedRows = 0;
            $scope.showSearch = $scope.content.data.openSearchInNewTab;
            $scope.requirematerialVerficationOnJobActivation = $localStorage.requireMaterialVerficationOnJobActivation === undefined ? false : $localStorage.requireMaterialVerficationOnJobActivation;
            LeaderMESservice.customAPI('GetReportName', { ReportID: $scope.reportID, IsUserReport: $scope.content.request.IsUserReport }).then(function (response) {
                if (response.TabObject) {
                    $scope.reportObject = response.TabObject;
                    return;
                }
            });

            if ($scope.reportID === 1850 || $scope.reportID === 850) {
                $scope.allowStopEventAction = true;
                $scope.allowSplitEvent = true;
            }
            $scope.cols = {

            };
            $scope.actions = {

            };
            var aggregationTypes = {
                'clear': {
                    title: $filter('translate')('REPORT_COLUMN_CLEAR_FILTER'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = null;
                            this.context.col.aggregationType = null;
                            this.context.col.updateAggregationValue();
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                },
                'sum': {
                    title: $filter('translate')('REPORT_COLUMN_SUM'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = uiGridConstants.aggregationTypes.sum;
                            this.context.col.aggregationType = uiGridConstants.aggregationTypes.sum;
                            this.context.col.updateAggregationValue();
                            if (!isNaN(this.context.col.aggregationValue)) {
                                this.context.col.aggregationValue = $filter('number')(this.context.col.aggregationValue);
                            }
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                },
                'count': {
                    title: $filter('translate')('REPORT_COLUMN_COUNT'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = uiGridConstants.aggregationTypes.count;
                            this.context.col.aggregationType = uiGridConstants.aggregationTypes.count;
                            this.context.col.updateAggregationValue();
                            if (!isNaN(this.context.col.aggregationValue)) {
                                this.context.col.aggregationValue = $filter('number')(this.context.col.aggregationValue);
                            }
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                },
                'min': {
                    title: $filter('translate')('REPORT_COLUMN_MIN'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = uiGridConstants.aggregationTypes.min;
                            this.context.col.aggregationType = uiGridConstants.aggregationTypes.min;
                            this.context.col.updateAggregationValue();
                            if (!isNaN(this.context.col.aggregationValue) && this.context.col.colDef.type != 'date') {
                                this.context.col.aggregationValue = $filter('number')(this.context.col.aggregationValue);
                            }
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                },
                'max': {
                    title: $filter('translate')('REPORT_COLUMN_MAX'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = uiGridConstants.aggregationTypes.max;
                            this.context.col.aggregationType = uiGridConstants.aggregationTypes.max;
                            this.context.col.updateAggregationValue();
                            if (!isNaN(this.context.col.aggregationValue) && this.context.col.colDef.type != 'date') {
                                this.context.col.aggregationValue = $filter('number')(this.context.col.aggregationValue);
                            }
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                },
                'average': {
                    title: $filter('translate')('REPORT_COLUMN_AVERAGE'),
                    icon: '',
                    action: function ($event) {
                        var column = _.find($scope.gridOptions.columnDefs, { field: this.context.col.field });
                        if (column) {
                            column.aggregationType = uiGridConstants.aggregationTypes.avg;
                            this.context.col.aggregationType = uiGridConstants.aggregationTypes.avg;
                            this.context.col.updateAggregationValue();
                            if (!isNaN(this.context.col.aggregationValue)) {
                                this.context.col.aggregationValue = $filter('number')(this.context.col.aggregationValue);
                            }
                            $scope.saveStructure($scope.gridApi);
                        }
                    },
                    context: $scope
                }
            };

            $scope.getFooterTemplate = function (field) {
                return '<div class="ui-grid-cell-contents">' +
                    '<div ng-show="grid.appScope.actions[\'' + field + '\'] == \'sum\'">{{"REPORT_COLUMN_SUM" | translate}} : {{grid.appScope.cols[\'' + field + '\'].aggregationValue}}</div>' +
                    '<div ng-show="grid.appScope.actions[\'' + field + '\'] == \'count\'">{{"REPORT_COLUMN_COUNT" | translate}} : {{grid.appScope.cols[\'' + field + '\'].aggregationValue}}</div>' +
                    '<div ng-show="grid.appScope.actions[\'' + field + '\'] == \'min\'">{{"REPORT_COLUMN_MIN" | translate}} : {{grid.appScope.cols[\'' + field + '\'].aggregationValue}}</div>' +
                    '<div ng-show="grid.appScope.actions[\'' + field + '\'] == \'max\'">{{"REPORT_COLUMN_MAX" | translate}} : {{grid.appScope.cols[\'' + field + '\'].aggregationValue}}</div>' +
                    '<div ng-show="grid.appScope.actions[\'' + field + '\'] == \'average\'">{{"REPORT_COLUMN_AVERAGE" | translate}} : {{grid.appScope.cols[\'' + field + '\'].aggregationValue | number:2}}</div>' +
                    '</div>';
            };

            $scope.getMenuItemByType = function (type) {
                var menuItems = [];
                if (type == "num") {
                    menuItems.push(aggregationTypes.clear);
                    menuItems.push(aggregationTypes.count);
                    menuItems.push(aggregationTypes.sum);
                    menuItems.push(aggregationTypes.min);
                    menuItems.push(aggregationTypes.max);
                    menuItems.push(aggregationTypes.average);
                } else if (type == "date") {
                    menuItems.push(aggregationTypes.clear);
                    menuItems.push(aggregationTypes.min);
                    menuItems.push(aggregationTypes.max);
                    menuItems.push(aggregationTypes.count);
                } else {
                    menuItems.push(aggregationTypes.clear);
                    menuItems.push(aggregationTypes.count);
                }
                return menuItems;
            };

            $scope.criteriaHeader = [];
            $scope.filenameCriteria = [];
            var newCriteria = [];

            $scope.criteriaHeader = $scope.criteriaHeader.toString();
            $scope.IsUserReport = $scope.content.request.IsUserReport;
            $scope.getData();
        }

        $scope.refreshSearchResults = function () {
            $scope.gridLoading = true;
            $scope.selectedRows = 0;
            $scope.gridApi = null;
            $scope.rendered = false;
            $scope.getData();
        };


        $scope.getData = function () {
            const promises = [];

            var request = angular.copy($scope.content.request)
            if ($scope.content.api != "GetResultSearchFields") {
                delete request?.sfCriteria;
                promises.push(LeaderMESservice.customAPI('GetPendingJobsCustomParams', $scope.content.request));
            }
            promises.unshift(LeaderMESservice.customAPI($scope.content.api, request));
            Promise.all(promises).then(function (res) {
                const response = res[0];
                const customParams = res[1] && res[1].ResponseDataTable && res[1].ResponseDataTable[0];
                if (response.ErrorCode) {
                    notify({
                        message: response.ErrorCode + ' - ' + response.ErrorDescription,
                        classes: 'alert-danger',
                        templateUrl: 'views/common/notify.html'
                    });
                    return;
                }
                if (response.length > 2) {
                    $scope.reportStructure = response[2];
                    if (response.length > 3) {
                        var treeDef = _.find(response[3], { HasTree: true });
                        if (treeDef) {
                            $scope.treeDef = treeDef;
                            $scope.treeDef.TreeApiParameters = $scope.treeDef.TreeApiParameters.split(",");
                        }
                    }
                }

                if (!$scope.reportID) {
                    var reportStructure = _.find(response[2], 'ReportID');
                    if (reportStructure) {
                        $scope.reportID = reportStructure.ReportID;
                    }
                }
                var languageToDisplay = 'DisplayEName';
                if ($scope.localLanguage)
                    languageToDisplay = 'DisplayHName';
                var headers = response.shift();
                if (customParams && customParams[0]) {
                    for (let key in customParams[0]) {
                        if (key === 'ID') {
                            continue;
                        }
                        headers.push({
                            CustomLinkItem: false,
                            DigitsNumber: null,
                            DisplayEName: key,
                            DisplayHName: key,
                            DisplayType: "num",
                            ExternalLink: false,
                            FieldName: key,
                            FormID: null,
                            OpenInNewTabOnly: false,
                            ReportColWidth: "1",
                            linkitem: null,
                        });
                    }
                }
                function convertDate(date) {
                    return [paddingZerosToDate(date.getDate()),
                    paddingZerosToDate(date.getMonth() + 1),
                    paddingZerosToDate(date.getFullYear())].join('/') +
                        ' ' +
                        [paddingZerosToDate(date.getHours()),
                        paddingZerosToDate(date.getMinutes()),
                        paddingZerosToDate(date.getSeconds())].join(':');
                }

                $scope.updateDate = function (data) {
                    if (!data) {
                        return '';
                    }
                    var newData = data.split('T');
                    var date = newData[0].split('-');
                    var time = newData[1].split(':');
                    return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
                };
                var minWidth = 150;
                $scope.maxHeight = document.body.clientHeight - $element[0].getBoundingClientRect().top - 300;
                $scope.height = document.body.clientHeight - $element[0].getBoundingClientRect().top - 38 - 22 - 15 - 30 - 30 - 100;
                // if ($scope.height < 450) {
                //     $scope.height = 300;
                // }
                $scope.externalLinkTemplate = '<span><a href="' + COGNOS.url + '{{ COL_FIELD }}" target="_blank" ><img class="New-tab-icon" src="images/menuicons/new-tab.png"></a></span>';
                $scope.booleangraphicTemplate = '<span><i class="fa fa-check" ng-if="COL_FIELD" style="color: green" aria-hidden="true"></i>' +
                    '<i class="fa fa-times" style="color: red" ng-if="!COL_FIELD" aria-hidden="true"></i></span>'
                $scope.booleanTemplate = '<span style="padding-left: 10px"><i ng-if="COL_FIELD" class="fa fa-check" style="color: green" aria-hidden="true"></i></span>';
                $scope.attachTagTemplate = function (linkitem, FieldName, customLinkItem, onlyNewTab, returnValue) {
                    if (returnValue && !$scope.returnValueField) {
                        $scope.returnValueField = FieldName;
                    }
                    var attachTag = '';
                    if ($scope.disableLinks) {
                        attachTag = '<span>{{COL_FIELD}}</span>';
                    }
                    else {
                        attachTag = '<a style="text-decoration: underline" ng-if="COL_FIELD" href="{{grid.appScope.getNewTabUrl(COL_FIELD,\'' + FieldName + '\',\'' + linkitem + '\',' + customLinkItem + ')}}" target="{{grid.appScope.getTarget(\'' + linkitem + '\')}}">{{COL_FIELD}}</a>';
                    }
                    //var attachNewTag = '<a ng-if="COL_FIELD" href="{{grid.appScope.getNewTabUrl(COL_FIELD,\'' + FieldName  + '\',\'' + linkitem + '\',' + customLinkItem + ')}}" target="' + linkitem + '"><img class="New-tab-icon" src="images/menuicons/new-tab.png"></a>';
                    if ($state.current.name == 'reportFullView') {
                        attachTag = '<a style="text-decoration: underline" ng-if="COL_FIELD" ng-click="grid.appScope.rowClick(COL_FIELD,\'' + linkitem + '\',\'' + FieldName + '\',' + customLinkItem + ');">{{COL_FIELD}}</a>';
                    }
                    if (returnValue) {
                        return '<div><span class="pull-left" style="margin-left: 10px;margin-right:10px">' + attachTag + '</span></div>';
                    }
                    if (onlyNewTab == true) {
                        attachTag = '<a style="text-decoration: underline" ng-if="COL_FIELD" href="{{grid.appScope.getNewTabUrl(COL_FIELD,\'' + FieldName + '\',\'' + linkitem + '\',' + customLinkItem + ')}}" target="{{grid.appScope.getTarget(\'' + linkitem + '\')}}">{{COL_FIELD}}</a>';
                    }
                    return '<div automation-id="{{row.entity.ID}}"><span class="pull-left" style="margin-left: 10px;margin-right:10px">' + attachTag + '</span></div>';
                };

                $scope.staticTemplate = '<span automation-id="{{row.entity.ID}}" title="{{COL_FIELD}}" style="margin-left: 10px;margin-right:10px" >{{COL_FIELD}}</span>';

                stateService.stateCode($scope);


                $scope.gridOptions = {
                    enableFiltering: true,
                    showColumnFooter: true,
                    showGridFooter: true,
                    columnDefs: [],
                    showClearAllFilters: false,
                    enableColumnResizing: true,
                    enableRowSelection: true,
                    enableGridMenu: !$scope.content.data.returnValue,
                    enableSelectAll: true,
                    exporterMenuPdf: true,
                    exporterMenuCsv: false,
                    multiSelect: $scope.content.data.multiSelect,
                    exporterExcelFilename: $scope.content.data.reportTitle + '.xlsx',
                    exporterExcelSheetName: 'Sheet1',
                    exporterCsvFilename: $scope.content.data.reportTitle + '.csv',
                    exporterPdfDefaultStyle: { fontSize: 7 },
                    exporterPdfTableStyle: {
                        margin: [0, 0, 0, 0]
                    },
                    exporterPdfTableHeaderStyle: { fontSize: 8, bold: true, italics: true, color: 'blue' },
                    exporterPdfHeader: {
                        text: $scope.content.data.reportTitle===undefined?"Machine Data":$scope.content.data.reportTitle,
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
                        docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                        return docDefinition;
                    },
                    exporterFieldCallback: function (grid, row, col, input) {
                        if (col.colDef.type == 'date') {
                            return $filter('date')(input, "dd/MM/yyyy HH:mm:ss")
                        } else {
                            return input;
                        }
                    },
                    exporterPdfOrientation: 'landscape',
                    exporterPdfPageSize: 'LETTER',
                    exporterPdfMaxGridWidth: 580,
                    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;


                        $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
                        $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
                        $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
                        $scope.gridApi.core.on.filterChanged($scope, saveState);
                        $scope.gridApi.core.on.sortChanged($scope, saveState);
                        restoreState();
                        $scope.gridApi.core.on.rowsRendered($scope, function () {
                            if ($scope.rendered) {
                                return;
                            }
                            $scope.rendered = true;
                            if ($scope.reportStructure) {
                                $scope.updateReportState();
                            }
                        });
                        var updateAggregation = function (updated) {
                            for (var i = 0; i < $scope.gridApi.grid.columns.length; i++) {
                                var column = $scope.gridApi.grid.columns[i];
                                if (column.aggregationType) {
                                    if (!updated) {
                                        column.updateAggregationValue();
                                    }
                                    if (!isNaN(column.aggregationValue) && column.colDef.type != 'date' || column.aggregationType == 4) {
                                        column.aggregationValue = $filter('number')(column.aggregationValue);
                                    }
                                }
                            }
                        };
                        if ($scope.gridApi.selection) {
                            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                                if (row.isSelected) {
                                    $scope.selectedRows++;
                                }
                                else {
                                    $scope.selectedRows--;
                                }
                                updateAggregation();
                            });
                            $scope.gridApi.selection.on.rowSelectionChangedBatch($scope, function () {
                                updateAggregation();
                            });
                            if ($scope.gridApi.selection.selectRow) {
                                $timeout(function () {
                                    if (!$scope.content.data.chosenIds) {
                                        return
                                    }
                                    $scope.content.data.chosenIds.forEach(function (id) {
                                        var index = _.findIndex($scope.gridOptions.data, { ID: parseInt(id) });
                                        if (index >= 0) {
                                            $scope.gridApi.selection.selectRow($scope.gridOptions.data[index]);
                                        }
                                    });
                                });
                            }
                        }

                        $scope.gridApi.core.on.filterChanged($scope, function () {
                            $timeout(function () {
                                updateAggregation(true);
                            }, 200);
                        });
                        $timeout(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 200)
                    },
                };
                $scope.gridOptions.appScopeProvider = $scope;
                $scope.response = response[0];
                if (!$scope.response)
                    $scope.response = [];

                customParams?.forEach(customParam => {
                    const jobIndex = _.findIndex($scope.response, { ID: customParam.ID });
                    if (jobIndex >= 0) {
                        $scope.response[jobIndex] = {
                            ...$scope.response[jobIndex],
                            ...customParam
                        };
                    }
                });
                $scope.gridOptions.data = $scope.response;
                for (var i = 0; i < headers.length; i++) {
                    if (headers[i].linkitem !== "" && headers[i].linkitem !== null) {
                        if (headers[i].ExternalLink == true) {
                            $scope.gridOptions.columnDefs.push({
                                enableColumnMenu: !$scope.content.data.returnValue,
                                name: headers[i].FieldName,
                                displayName: headers[i][languageToDisplay],
                                field: headers[i].FieldName,
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                headerTooltip: true,
                                cellClass: 'verticalAlign ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell",
                                cellTemplate: $scope.externalLinkTemplate,
                                headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                                menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                                //footerCellTemplate: $scope.getFooterTemplate(headers[i].FieldName),
                                minWidth: headers[i].ReportColWidth
                            });
                            continue;
                        }
                        /*if ($scope.content.data.returnValue === true) {
                         $scope.gridOptions.columnDefs.push({
                         name: "Return Value",
                         displayName: "Return Value",
                         exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                         field: headers[i].FieldName,
                         headerTooltip: true,
                         cellClass: 'verticalAlign',
                         cellTemplate: $scope.attachTagTemplate(headers[i].linkitem, headers[i].FieldName, headers[i].CustomLinkItem, headers[i].OpenInNewTabOnly, true)
                         , minWidth: minWidth
                         });
                         }*/
                        $scope.gridOptions.columnDefs.push({
                            enableColumnMenu: !$scope.content.data.returnValue,
                            name: headers[i].FieldName,
                            displayName: headers[i][languageToDisplay],
                            field: headers[i].FieldName,
                            exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                            headerTooltip: true,
                            menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                            //footerCellTemplate:$scope.getFooterTemplate(headers[i].FieldName),
                            cellClass: 'verticalAlign ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell  {{row.entity.ID}}",
                            headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                            cellTemplate: $scope.attachTagTemplate(headers[i].linkitem, headers[i].FieldName, headers[i].CustomLinkItem, headers[i].OpenInNewTabOnly, $scope.content.data.returnValue)
                            , minWidth: headers[i].ReportColWidth
                        });
                    }
                    else {
                        if (headers[i].DisplayType == "date") {
                            $scope.response = _.map($scope.response, function (row) {
                                row[headers[i].FieldName] = $scope.updateDate(row[headers[i].FieldName]);
                                return row;
                            });
                            $scope.gridOptions.columnDefs.push({
                                enableColumnMenu: !$scope.content.data.returnValue,
                                name: headers[i].FieldName,
                                displayName: headers[i][languageToDisplay],
                                field: headers[i].FieldName,
                                type: 'date',
                                footerCellFilter: 'customDateNumberFilter:col.aggregationType',
                                cellFilter: "date:'dd/MM/yyyy HH:mm:ss'",
                                filters: [{
                                    condition: function (term, value) {
                                        if (!term) return true;
                                        var valueDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                        var replaced = term.replace(/\\/g, '');
                                        return valueDate.indexOf(replaced) >= 0;
                                    },
                                    placeholder: ''
                                }],
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                cellClass: 'ui-grid-cell verticalAlign ui-grid-cell-date ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell",
                                cellTooltip: true,
                                headerTooltip: true,
                                headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                                menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                                // footerCellTemplate:$scope.getFooterTemplate(headers[i].FieldName),
                                minWidth: headers[i].ReportColWidth
                            });
                        }
                        else if (headers[i].DisplayType == "boolean") {
                            $scope.gridOptions.columnDefs.push({
                                enableColumnMenu: !$scope.content.data.returnValue,
                                name: headers[i].FieldName,
                                displayName: headers[i][languageToDisplay],
                                field: headers[i].FieldName,
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                cellTemplate: $scope.booleanTemplate,
                                headerTooltip: true,
                                cellClass: 'verticalAlign ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell",
                                minWidth: headers[i].ReportColWidth,
                                headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                                menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                                //footerCellTemplate:$scope.getFooterTemplate(headers[i].FieldName),
                                filter: {
                                    type: uiGridConstants.filter.SELECT,
                                    selectOptions: [{ value: true, label: $filter('translate')('TRUE') }, {
                                        value: false,
                                        label: $filter('translate')('FALSE')
                                    }]
                                }
                            });
                        }
                        else if (headers[i].DisplayType == "booleangraphic") {
                            $scope.gridOptions.columnDefs.push({
                                enableColumnMenu: !$scope.content.data.returnValue,
                                name: headers[i].FieldName,
                                displayName: headers[i][languageToDisplay],
                                field: headers[i].FieldName,
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                cellTemplate: $scope.booleangraphicTemplate,
                                headerTooltip: true,
                                cellClass: 'verticalAlign ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell",
                                minWidth: headers[i].ReportColWidth,
                                headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                                menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                                //footerCellTemplate:$scope.getFooterTemplate(headers[i].FieldName),
                                filter: {
                                    type: uiGridConstants.filter.SELECT,
                                    selectOptions: [{ value: true, label: $filter('translate')('TRUE') }, {
                                        value: false,
                                        label: $filter('translate')('FALSE')
                                    }]
                                }
                            });
                        }
                        else {

                            if (headers[i].DisplayType == 'num' && headers[i].DigitsNumber !== null) {
                                for (var j = 0; j < response[0].length; j++) {
                                    var row = response[0][j];
                                    if (row && row[headers[i].FieldName]) {
                                        row[headers[i].FieldName] = parseFloat(row[headers[i].FieldName].toFixed(headers[i].DigitsNumber));
                                    }
                                }
                            }
                            $scope.gridOptions.columnDefs.push({
                                enableColumnMenu: !$scope.content.data.returnValue,
                                name: headers[i].FieldName,
                                displayName: headers[i][languageToDisplay],
                                field: headers[i].FieldName,
                                cellTemplate: $scope.staticTemplate,
                                exporterPdfAlign: ($scope.rtl == 'rtl' ? 'right' : 'left'),
                                cellClass: 'verticalAlign ui-grid-cell' + (headers[i].DisplayType == 'num' ? ' number' : '') + ' ' + headers[i][languageToDisplay].replace(/ /g, '') + "-cell",
                                cellTooltip: true,
                                headerTooltip: true,
                                headerCellClass: headers[i][languageToDisplay].replace(/ /g, ''),
                                menuItems: $scope.getMenuItemByType(headers[i].DisplayType),
                                //footerCellTemplate:$scope.getFooterTemplate(headers[i].FieldName),
                                minWidth: headers[i].ReportColWidth
                            });
                        }

                    }
                }
                function saveState() {

                    var state = $scope.gridApi.saveState.save();
                    //save the state in localStorage
                    if (!$localStorage.searchResulltsGridTable) {
                        $localStorage.searchResulltsGridTable = {}
                    }
                    $localStorage.searchResulltsGridTable = state;
                }

                function restoreState() {

                    $timeout(function () {
                        if ($localStorage.searchResulltsGridTable) {
                            state = $localStorage.searchResulltsGridTable;
                        }
                        $scope.gridApi.saveState.restore($scope, state);
                    })
                }
                $timeout(() => {

                    $scope.gridLoading = false;
                    $scope.$broadcast('finished-loading');
                })
            }).catch(error => {
                console.error(error.message);
            })
        };

        $scope.getNewTabUrl = function (id, FieldName, linkitem, customLinkItem) {
            if (linkitem == "UserReport") {
                var url = $state.href('reportFullView', {
                    reportID: id,
                    IsUserReport: "true"
                });
                return url;
            }
            else if (linkitem == "SystemReport") {
                var url = $state.href('reportFullView', {
                    IsUserReport: "false",
                    reportID: id
                });
                return url;
            }
            if (customLinkItem == true) {
                linkitem = linkitem + id;
            }
            var url = $state.href('appObjectFullView', {
                appObjectName: linkitem,
                ID: id
            });
            return url + "?firstTime=true";
        };


        $scope.getTarget = function (linkitem) {
            if (window.name.indexOf(linkitem) === 0) {
                return `${window.name}_1`;
            }
            return linkitem;
        }

        $scope.newTabClicked = function (id, FieldName, linkitem, customLinkItem) {
            var newUrl = getNewTabUrl(id, FieldName, linkitem, customLinkItem);
            var myWindow = window.open(newUrl, "LEADERMES_" + linkitem, '', true)
            myWindow.location.reload();

            //return window.open(url, '_blank');
        };

        $scope.rowClick = function (id, linkitem, fieldName, customLinkItem) {
            if (customLinkItem == true) {
                linkitem = linkitem + id;
            }
            var parentScope = $scope.$parent;
            for (var i = 0; i < 15; i++) {
                if (parentScope.rowClicked) {
                    parentScope.rowClicked(id, linkitem, fieldName, _.find($scope.response, { ID: id }));
                    return;
                }
                else {
                    if (parentScope.$parent) {
                        parentScope = parentScope.$parent;
                    }
                    else {
                        break;
                    }
                }
            }
            $scope.newTabClicked(id, fieldName, linkitem, customLinkItem)
        };

        $scope.closeModal = function () {
            $scope.$parent.rowClicked();
        };

        $scope.returnValuesApply = function (contentTemp) {
            if (contentTemp.api == "QCGetProductsForReport" || contentTemp.api == "QCGetSubTypesForReport" || contentTemp.api == "QCGetJobsForReport" || contentTemp.api == "QCGetMachinesForReport") {
                var api = contentTemp.api
            }
            var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
            var parentScope = $scope.$parent;
            for (var i = 0; i < 15; i++) {
                if (parentScope.rowClicked) {
                    if ($scope.content.data.multiSelect) {
                        parentScope.rowClicked(_.map(selectedRows, function (row) {
                            return row.entity[$scope.returnValueField || 'ID'];
                        }), null, null, _.map(selectedRows, function (row) {
                            row.entity.api = api
                            return row.entity;
                        }));
                    }
                    else if (selectedRows.length > 0) {
                        if (selectedRows[0] && selectedRows[0].entity) {
                            selectedRows[0].entity.api = api
                        }
                        parentScope.rowClicked(selectedRows[0].entity[$scope.returnValueField || 'ID'], null, null, selectedRows[0].entity);
                    }
                    return;
                }
                else {
                    if (parentScope.$parent) {
                        parentScope = parentScope.$parent;
                    }
                    else {
                        break;
                    }
                }
            }
        };

        $scope.export = function (export_format, export_type) {
            if (export_format == 'excel') {
                var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
                $scope.gridApi.exporter.excelExport(export_type, export_type, myElement);
            } else if (export_format == 'pdf') {
                $scope.gridApi.exporter.pdfExport(export_type, export_type);
            };
        };

        $scope.initTreeGraphRow = function (row, allRecords, TreeApiName, TreeApiParameters, TargetTreeNodeParameter) {
            if (TreeApiName) {
                row.treeData = {
                    TreeApiName: TreeApiName,
                    TargetTreeNodeParameter: TargetTreeNodeParameter,
                    TreeApiParameters: []
                }
                if (TreeApiParameters) {
                    var params = TreeApiParameters.split(",");
                    for (var i = 0; i < params.length; i++) {
                        if (allRecords[params[i]]) {
                            row.treeData.TreeApiParameters.push({
                                key: params[i],
                                value: allRecords[params[i]]
                            });
                        }
                    }
                }
            }
        };

        $scope.openTree = function () {
            if ($scope.treeDef && $scope.treeDef.TargetTreeNodeParameter && $scope.treeDef.TreeApiName) {
                var parameters = [];
                var row = $scope.gridApi.selection.getSelectedRows()[0];
                for (var i = 0; i < $scope.treeDef.TreeApiParameters.length; i++) {
                    var param = $scope.treeDef.TreeApiParameters[i].split("=");
                    if (param.length == 1) {
                        parameters.push({
                            key: $scope.treeDef.TreeApiParameters[i],
                            value: row[$scope.treeDef.TreeApiParameters[i]]
                        });
                    }
                    else {
                        parameters.push({
                            key: param[0],
                            value: row[param[1]]
                        });
                    }
                }
                // var url = $state.href('fullTreeView',{
                //     api : $scope.treeDef.TreeApiName,
                //     ID : _.find(parameters,{key : $scope.treeDef.TargetTreeNodeParameter}).value,
                //     linkitem : $scope.treeDef.TargetTreeNodeParameterAppObject
                // });
                // for (var i = 0;i < parameters.length ; i++){
                //     if (i == 0){
                //         url += "?"+ parameters[i].key + "=" + parameters[i].value;
                //         continue;
                //     }
                //     url += "&"+ parameters[i].key + "=" + parameters[i].value;
                // }
                // window.open(url,'fullTreeView');  
                var requestBody = {};
                for (var i = 0; i < parameters.length; i++) {
                    requestBody[parameters[i].key] = parameters[i].value;
                }

                graphService.graphCode($scope.treeDef.TreeApiName, requestBody,
                    { ID: _.find(parameters, { key: $scope.treeDef.TargetTreeNodeParameter }).value, linkItem: $scope.treeDef.TargetTreeNodeParameterAppObject });
            }
        };

        $scope.activateJob = function () {
            var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
            if (selectedRows && selectedRows[0] && selectedRows[0].entity &&
                selectedRows[0].entity.ID) {
                var jobId = selectedRows[0].entity.ID;
                SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO') + " " + $filter('translate')('ACTIVATE_JOB_ACTION') + "?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#D0D0D0",
                    confirmButtonText: $filter('translate')("YES"),
                    cancelButtonText: $filter('translate')("NO"),
                    closeOnConfirm: true,
                    closeOnCancel: true,
                    animation: "false",
                    customClass: ($scope.rtl ? " swalRTL" : "")
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            $scope.gridLoading = true;
                            LeaderMESservice.customAPI('ActivateJobForMachine', { MachineID: parseInt($scope.content.request.MachineID), JobID: jobId }).then(function (response) {
                                $scope.gridLoading = false;
                                if (response.error != null) {
                                    notify({
                                        message: response.error.ErrorMessage,
                                        classes: 'alert-danger',
                                        templateUrl: 'views/common/notify.html'
                                    });
                                    return
                                }
                                var parentScope = $scope.$parent;
                                $scope.$emit("closePendingJobs", true);

                                parentScope.rowClicked();
                                toastr.clear();
                                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));

                            });
                        }
                        else {
                            actionItem.disabled = false;
                        }
                    });
            }

        }


        $scope.VerifyMaterials = function () {
            var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
            if (selectedRows && selectedRows[0] && selectedRows[0].entity &&
                selectedRows[0].entity.ID) {
                var jobId = selectedRows[0].entity.ID;
                var ErpJobId = selectedRows[0].entity.ERPJobID;
                var MachineId = $scope.content.request.MachineID;
                $sessionStorage.jobId = selectedRows[0].entity.ID;
                $scope.$emit("closePendingJobs", true);
                var modalInstance = $modal.open({
                    templateUrl: "views/custom/productionFloor/onlineTab/materials.html",
                    backdrop: 'static',
                    controller: function ($scope, $modalInstance, AuthService, SweetAlert, $localStorage, $interval, $sessionStorage, machineTypeService) {
                        $scope.VerifiedMaterials = false;
                        var GetSearhedMaterialVerified = function () {
                            var Material = window.sessionStorage.getItem("ngStorage-VerifiedMaterial");
                            var totalMaterials = window.sessionStorage.getItem("ngStorage-totalMaterials");
                            var VerifiedcountMaterials = window.sessionStorage.getItem("ngStorage-countMaterials");
                            if (totalMaterials != undefined && totalMaterials != '') {
                                $scope.totalMaterials = parseInt(totalMaterials);
                            }
                            if (VerifiedcountMaterials != undefined && VerifiedcountMaterials != '') {
                                $scope.countMaterials = parseInt(VerifiedcountMaterials);
                            }

                            if (Material === "true") {
                                $scope.VerifiedMaterials = true;
                            }
                        };

                        var Interval = $interval(GetSearhedMaterialVerified, 1000);
                        $scope.close = function (result) {
                            window.sessionStorage.setItem("ngStorage-totalMaterials","0");
                            window.sessionStorage.setItem("ngStorage-VerifiedMaterial", "false");
                            $modalInstance.close(result);
                            $interval.cancel(Interval);
                        };

                        $scope.BackButton = function (result) {
                            window.sessionStorage.setItem("ngStorage-totalMaterials","0");
                            window.sessionStorage.setItem("ngStorage-VerifiedMaterial", "false");
                            $modalInstance.close(result);
                            $interval.cancel(Interval);
                            machineTypeService.machinePendingJobs($localStorage.upperScopeData, $localStorage.machineActionItem);

                        };
                        $scope.jobId = jobId;
                        $scope.materialId = ErpJobId;
                        $scope.activateJob = function () {
                            SweetAlert.swal({
                                title: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO') + " " + $filter('translate')('ACTIVATE_JOB_ACTION') + "?",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#D0D0D0",
                                confirmButtonText: $filter('translate')("YES"),
                                cancelButtonText: $filter('translate')("NO"),
                                closeOnConfirm: true,
                                closeOnCancel: true,
                                animation: "false",
                                customClass: ($scope.rtl ? "swalRTL" : "")
                            },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $scope.ActivatejobInProgress = true;
                                        LeaderMESservice.customAPI('ActivateJobForMachine', { MachineID: parseInt(MachineId), JobID: jobId }).then(function (response) {
                                            $scope.ActivatejobInProgress = false;
                                            if (response.error != null) {
                                                notify({
                                                    message: response.error.ErrorMessage,
                                                    classes: 'alert-danger',
                                                    templateUrl: 'views/common/notify.html'
                                                });
                                                return
                                            }
                                            $modalInstance.close();
                                            toastr.clear();
                                            toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                            actionItem.disabled = false;
                                        });
                                    }
                                    else {
                                        actionItem.disabled = false;
                                    }
                                });


                        }
                        $scope.activateJobWithoutVerification = function () {
                            $modalInstance.close();
                            $scope.$root.ActivateJobModel = "ActivateJobWithoutModel";
                            var modalInstanceNew = $modal.open({
                                templateUrl: "views/custom/productionFloor/onlineTab/activateJobWithoutVerificationModel.html",
                                backdrop: 'static',
                                controller: function ($scope, $modalInstance, AuthService, SweetAlert, $localStorage) {
                                    $scope.close = function (result) {
                                        $modalInstance.close(result);
                                        activateJobWithoutVerificationCtrl.password = "";
                                        $scope.$root.ActivateJobModel = "";
                                    };
                                    var activateJobWithoutVerificationCtrl = this;
                                    activateJobWithoutVerificationCtrl.password = "";
                                    activateJobWithoutVerificationCtrl.activateJobWithoutVerificationButton = function () {
                                        $scope.ActivatejobInProgress = true;
                                        $scope.errorDescription = "";
                                        if (activateJobWithoutVerificationCtrl.password === null || activateJobWithoutVerificationCtrl.password === "" || activateJobWithoutVerificationCtrl.password === undefined) {
                                            activateJobWithoutVerificationCtrl.requiredMessage = true;
                                            return;
                                        }
                                        activateJobWithoutVerificationCtrl.requiredMessage = false;
                                        try {
                                            AuthService.getEncryptedPassword({
                                                token: activateJobWithoutVerificationCtrl.password
                                            }).then(function (encrptResp) {
                                                LeaderMESservice.customAPI('ActivateJobForMachine', { MachineID: parseInt(MachineId), JobID: jobId, ManagerPassword: encrptResp.token }).then(function (response) {

                                                    if (response.error != null) {
                                                        $scope.errorDescription = response.error.ErrorDescription;
                                                        // notify({
                                                        //     message: response.error.ErrorDescription,
                                                        //     classes: 'alert-danger',
                                                        //     templateUrl: 'views/common/notify.html'
                                                        // });
                                                        $scope.ActivatejobInProgress = false;
                                                        return;
                                                    }
                                                    if (response.FunctionSucceed) {
                                                        $scope.errorDescription = "";
                                                        $scope.ActivatejobInProgress = false;
                                                        $modalnIstance.close();
                                                        activateJobWithoutVerificationCtrl.password = "";
                                                        toastr.clear();
                                                        toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                                        $scope.$root.ActivateJobModel = "";
                                                    }
                                                });
                                            });
                                        } catch (err) {
                                        }
                                    };
                                    activateJobWithoutVerificationCtrl.EyePassword = function () {
                                        const password = document.querySelector('#id_password');
                                        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                                        password.setAttribute('type', type);
                                        const togglePassword = document.querySelector('#togglePassword');
                                        // toggle the eye slash icon
                                        togglePassword.classList.toggle('eye_slash');

                                    }
                                },
                                controllerAs: 'activateJobWithoutVerificationCtrl'
                            }).result.then(function (result) {

                            });
                        }
                    },
                    controllerAs: 'materialsCtrl'
                }).result.then(function (result) {

                });

            }

        }

        $scope.activateJobWithoutVerification = function () {
            $localStorage.selectedRow = $scope.gridApi.selection.getSelectedGridRows();
            $localStorage.MachineID = $scope.content.request.MachineID;
            var parentScope = $scope.$parent;
            $scope.$root.ActivateJobModel = "ActivateJobWithoutModel";
            $scope.$emit("closePendingJobs", true);
            parentScope.rowClicked();
            var modalInstance = $modal.open({
                templateUrl: "views/custom/productionFloor/onlineTab/activateJobWithoutVerificationModel.html",
                backdrop: 'static',
                controller: function ($scope, $modalInstance, AuthService, SweetAlert, $localStorage) {
                    $scope.close = function (result) {
                        $modalInstance.close(result);
                        activateJobWithoutVerificationCtrl.password = "";
                        $scope.$root.ActivateJobModel = "";
                    };
                    var activateJobWithoutVerificationCtrl = this;
                    activateJobWithoutVerificationCtrl.password = "";
                    activateJobWithoutVerificationCtrl.activateJobWithoutVerificationButton = function () {
                        $scope.ActivatejobInProgress = true;
                        $scope.errorDescription = "";
                        var selectedRows = $localStorage.selectedRow;
                        var MachineId = $localStorage.MachineID;
                        if (activateJobWithoutVerificationCtrl.password === null || activateJobWithoutVerificationCtrl.password === "" || activateJobWithoutVerificationCtrl.password === undefined) {
                            activateJobWithoutVerificationCtrl.requiredMessage = true;
                            return;
                        }
                        activateJobWithoutVerificationCtrl.requiredMessage = false;
                        try {
                            AuthService.getEncryptedPassword({
                                token: activateJobWithoutVerificationCtrl.password
                            }).then(function (encrptResp) {
                                if (selectedRows && selectedRows[0] && selectedRows[0].entity &&
                                    selectedRows[0].entity.ID) {
                                    var jobId = selectedRows[0].entity.ID;
                                    LeaderMESservice.customAPI('ActivateJobForMachine', { MachineID: parseInt(MachineId), JobID: jobId, ManagerPassword: encrptResp.token }).then(function (response) {
                                        if (response.error != null) {
                                            // notify({
                                            //     message: response.error.ErrorDescription,
                                            //     classes: 'alert-danger',
                                            //     templateUrl: 'views/common/notify.html'
                                            // });
                                            $scope.errorDescription = response.error.ErrorDescription;
                                            $scope.ActivatejobInProgress = false;
                                            return;
                                        }
                                        if (response.FunctionSucceed) {
                                            $scope.errorDescription = "";
                                            $scope.ActivatejobInProgress = false;
                                            $modalInstance.close();
                                            activateJobWithoutVerificationCtrl.password = "";
                                            toastr.clear();
                                            toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                            $scope.$root.ActivateJobModel = "";
                                        }
                                    });
                                }
                            });
                        } catch (err) {
                        }
                    };
                    activateJobWithoutVerificationCtrl.EyePassword = function () {
                        const password = document.querySelector('#id_password');
                        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                        password.setAttribute('type', type);
                        const togglePassword = document.querySelector('#togglePassword');
                        // toggle the eye slash icon
                        togglePassword.classList.toggle('eye_slash');

                    }
                },
                controllerAs: 'activateJobWithoutVerificationCtrl'
            }).result.then(function (result) {

            });
        }

        $scope.openStopEventReport = function () {
            var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
            var modalInstance = $modal.open({
                templateUrl: "js/components/stopEventSearch/stopEventSearchTemplate.html",
                controller: function ($scope, $modalInstance) {
                    $scope.eventIds = _.map(selectedRows, 'entity.ID');
                    $scope.machineID = _.map(selectedRows, 'entity.MachineIdentifier');
                    $scope.close = function (result) {
                        $modalInstance.close(result);
                    };
                }
            }).result.then(function (result) {
                if (result) {
                    $scope.refreshSearchResults();
                }
            });
        };

        $scope.openSplitEventRetro = function () {
            var selectedRows = $scope.gridApi.selection.getSelectedGridRows();
            if (!selectedRows || !selectedRows[0] || !selectedRows[0].entity) {
                return;
            }
            if (!selectedRows[0].entity.EndTime) {
                notify({
                    message: $filter('translate')('STOP_EVENT_NOT_FINISHED'),
                    classes: 'alert-danger',
                    templateUrl: 'views/common/notify.html'
                });
                return;
            }
            $modal.open({
                template: '<div split-event-retro event-data="eventData" close="close"></div>',
                windowClass: 'CopyMachineParameter',
                controller: function ($scope, $modalInstance) {
                    $scope.eventData = {
                        id: selectedRows[0].entity.ID,
                        startTime: moment(selectedRows[0].entity.EventTime),
                        endTime: moment(selectedRows[0].entity.EndTime),
                    }
                    $scope.close = function (data) {
                        $modalInstance.close(data);
                    };
                },
            }).result.then(function (result) {
                if (result) {
                    $scope.refreshSearchResults();
                }
            })
        };

        $scope.toggleScreen = function () {
            $scope.content.data.fullScreen = !$scope.content.data.fullScreen;
            var diff = ($scope.content.data.fullScreen ? 166 : -166);
            $scope.height += diff;
        }
        init();
    };

    return {
        restrict: "E",
        link: linker,
        templateUrl: template,
        scope: {
            content: '=',
            modal: '=',
        },
        controller: controller
    };
}


angular
    .module('LeaderMESfe')
    .directive('searchResults', searchResults);
