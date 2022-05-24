angular.module('LeaderMESfe').factory('stateService', function ($compile, $state, $filter, LeaderMESservice,toastr, $timeout, $modal, uiGridConstants, $sessionStorage, GLOBAL) {


    function stateCode($scope) {
        $scope.copyStructureToGroup = false;
        $scope.userID = LeaderMESservice.getUserID();
        $scope.reportID = $scope.content.request.reportID || $scope.content.data.reportID || $scope.reportID;
        $scope.FormID =  $scope.content.request.formID;
        $scope.IsUserReport = $scope.content.request.IsUserReport;
        $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
        $scope.copyStructureToUser = false;
        var systemReport = LeaderMESservice.getTabsByID(60000);
        if (systemReport && systemReport.Actions){
            if (_.findIndex(systemReport.Actions,{SubMenuAppPartID : 60035}) >= 0){
                $scope.copyStructureToGroup = true;
            }
            if (_.findIndex(systemReport.Actions,{SubMenuAppPartID : 60030}) >= 0){
                $scope.copyStructureToUser = true;
            }
        }

        $scope.saveStructure = function(gridApi){
            if ($scope.saveStructureTimeout ) {
                $timeout.cancel($scope.saveStructureTimeout);
                $scope.saveStructureTimeout = null;
            }

            $scope.saveStructureTimeout =  $timeout(function(){
                var state = gridApi.saveState.save();
                var unScheduledJobsColumns = [];
                JSON.stringify(_.map(state.columns,function(column){
                    if (column.visible) unScheduledJobsColumns.push(column.name);
                }));
                $sessionStorage.unScheduledJobsColumns = {
                    defaultColumns: unScheduledJobsColumns,
                    version: GLOBAL.version,
                };
                var body = {
                    UserReportStructure : {
                        UserID : $scope.userID,
                        ReportID : $scope.reportID,
                        FormID : $scope.FormID,
                        IsUserReport : $scope.IsUserReport,
                        ColumnOrderStructure : JSON.stringify(_.map(state.columns,function(column){
                            return {
                                fieldName : column.name,
                                aggregationType : column.aggregationType,
                                width: column.width,
                            }
                        })),
                        ColumnDisplayStructure :  JSON.stringify(_.map(state.columns,function(column){
                            return {
                                fieldName : column.name,
                                visible : column.visible
                            }
                        })),
                        ColumnFilter  : JSON.stringify(_.map(state.columns,function(column){
                            return {
                                fieldName : column.name,
                                filters : column.filters
                            }
                        })),
                        ColumnSort  : JSON.stringify(_.map(state.columns,function(column){
                            return {
                                fieldName : column.name,
                                sort : column.sort,
                            }
                        }))
                    }
                };
                LeaderMESservice.customAPI('SaveReportStructureForUser',body);
            },500);
        };

        $scope.updateReportState = function(){
            var newState = $scope.gridApi.saveState.save();
            $scope.defaultState = angular.copy(newState);
            var newColumnsOrder = [];
            var reportColumnsOrderIndex = _.findIndex($scope.reportStructure,'ReportColumnsOrder') ;
            var reportHiddenColumnsIndex = _.findIndex($scope.reportStructure,'ReportHiddenColumns');
            var reportFilterColumnsIndex = _.findIndex($scope.reportStructure,'ReportFilter');
            var reportSortColumnsIndex = _.findIndex($scope.reportStructure,'ReportSort');
            if (reportColumnsOrderIndex >= 0 && $scope.reportStructure[reportColumnsOrderIndex].ReportColumnsOrder && $scope.reportStructure[reportColumnsOrderIndex].ReportColumnsOrder != ""){
                var reportColumnsOrder = JSON.parse($scope.reportStructure[reportColumnsOrderIndex].ReportColumnsOrder);
                if (reportColumnsOrder.length == newState.columns.length){  
                    for (var i = 0;i < reportColumnsOrder.length ;i++){
                        var columnIndex = _.findIndex(newState.columns,{name : reportColumnsOrder[i].fieldName});
                        if (columnIndex >= 0){
                            newState.columns[columnIndex].aggregationType = reportColumnsOrder[i].aggregationType;
                            newState.columns[columnIndex].width = reportColumnsOrder[i].width || '*';
                            if (newState.columns[columnIndex].aggregationType){
                                var column = _.find($scope.gridOptions.columnDefs,{field : newState.columns[columnIndex].name});
                                if (column){
                                        column.aggregationType = newState.columns[columnIndex].aggregationType;
                                }
                            }
                            newColumnsOrder.push(newState.columns[columnIndex]);
                        }
                    }
                }
                newState.columns = newColumnsOrder;
            }
            if (reportHiddenColumnsIndex >= 0 && $scope.reportStructure[reportHiddenColumnsIndex].ReportHiddenColumns && $scope.reportStructure[reportHiddenColumnsIndex].ReportHiddenColumns != ""){
                var reportHiddenColumns = JSON.parse($scope.reportStructure[reportHiddenColumnsIndex].ReportHiddenColumns);  
                for (var i = 0;i < reportHiddenColumns.length ;i++){
                    var columnIndex = _.findIndex(newState.columns,{name : reportHiddenColumns[i].fieldName});
                    if (columnIndex >= 0){
                        newState.columns[columnIndex].visible = reportHiddenColumns[i].visible;
                    }
                }
            }
            if ($scope.content.showFilters && reportFilterColumnsIndex >= 0 && $scope.reportStructure[reportFilterColumnsIndex].ReportFilter && $scope.reportStructure[reportFilterColumnsIndex].ReportFilter != ""){
                var reportFilterColumns = JSON.parse($scope.reportStructure[reportFilterColumnsIndex].ReportFilter);  
                for (var i = 0;i < reportFilterColumns.length ;i++){
                    var columnIndex = _.findIndex(newState.columns,{name : reportFilterColumns[i].fieldName});
                    if (columnIndex >= 0){
                        if (reportFilterColumns[i].filters && reportFilterColumns[i].filters.length == 1 && 
                            reportFilterColumns[i].filters[0].type == "select"){
                                newState.columns[columnIndex].filters[0].term =  reportFilterColumns[i].filters[0].term;
                            }
                            else{
                                newState.columns[columnIndex].filters = reportFilterColumns[i].filters;
                            }
                    }
                }
            }
            if (reportSortColumnsIndex >= 0 && $scope.reportStructure[reportSortColumnsIndex].ReportSort && $scope.reportStructure[reportSortColumnsIndex].ReportSort != ""){
                var reportSortColumns = JSON.parse($scope.reportStructure[reportSortColumnsIndex].ReportSort);  
                for (var i = 0;i < reportSortColumns.length ;i++){
                    var columnIndex = _.findIndex(newState.columns,{name : reportSortColumns[i].fieldName});
                    if (columnIndex >= 0){
                        newState.columns[columnIndex].sort = reportSortColumns[i].sort;
                    }
                }
            }
            $scope.gridApi.saveState.restore( $scope, newState );

            $scope.addUIGridEvents(function() {
                if (!$scope.clearReportDefinitionLoading){
                    $scope.saveStructure($scope.gridApi);
                }
            });
        }

        $scope.addUIGridEvents = function(func){
            $scope.gridApi.colMovable.on.columnPositionChanged( $scope,func);
            $scope.gridApi.core.on.columnVisibilityChanged( $scope, func);
            $scope.gridApi.core.on.sortChanged( $scope, func);
            $scope.gridApi.core.on.filterChanged( $scope,func);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, func);
        };

        $scope.clearHiddenColumn = function(){
            var state = $scope.gridApi.saveState.save();
            state.columns = _.map(state.columns,function(column){
                column.visible = true;
                return column;
            })
            $scope.gridApi.saveState.restore( $scope, state);
        }

        $scope.clearReportDefinition = function(){
            $scope.clearReportDefinitionLoading = true;
            $scope.gridApi.saveState.restore( $scope, $scope.defaultState);
            LeaderMESservice.customAPI('ClearReportDefinition',{
                clearReportStructure : {
                    UserID : $scope.userID,
                    ReportID : $scope.reportID,
                    FormID : $scope.FormID,
                    IsUserReport : $scope.IsUserReport
                }
            }).then(function(response){
                $scope.clearReportDefinitionLoading = false;
            });
        }

        $scope.clearAllSort = function(){
            for (var i = 0; i < $scope.gridApi.grid.columns.length; i++) {
                $scope.gridApi.grid.columns[i].unsort();
            }
            $scope.gridApi.grid.refresh();
        }

        $scope.clearAllFilters = function(){
            $scope.gridApi.grid.clearAllFilters();
        }

        $scope.gridMenuCustomItems = [
            // {
            //     title: $filter('translate')('CLEAR_HIDDEN_COLUMNS'),
            //     action: function ($event) {
            //         $scope.clearHiddenColumn();
            //     },
            //     order: 102
            // },
            {
                title: $filter('translate')('CLEAR_REPORT_DEFINITION'),
                action: function ($event) {
                    $scope.clearReportDefinition();
                },
                order: 101
            },
            {
                title: $filter('translate')('CLEAR_ALL_SORT'),
                action: function ($event) {
                    $scope.clearAllSort();
                },
                order: 100
            }
        ];

        if ($scope.copyStructureToGroup || $scope.copyStructureToUser){
            $scope.copyStructureToGroupOrUser = function(){
                var stateToCopy = $scope.gridApi.saveState.save();
                var actionModalInstance = $modal.open({
                    
                    templateUrl: 'views/common/actions/customActionModal.html',
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    },
                    controller: function ($scope, $compile, $modalInstance, LeaderMESservice, 
                        $timeout, commonFunctions, $state, parentScope,toastr,$filter) {
    
                        var actionModalInstanceCtrl = this;
                        actionModalInstanceCtrl.title  = "COPY_REPORT_DEFINITION";
                        actionModalInstanceCtrl.loading = true;
                        actionModalInstanceCtrl.actionName =  "COPY_REPORT_DEFINITION_ACTION";
                        actionModalInstanceCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
                        actionModalInstanceCtrl.template = 'views/custom/searchResults/copyDefnitionView.html';
                        
                        actionModalInstanceCtrl.chosenGroups = [];
                        actionModalInstanceCtrl.chosenUsers = [];


                        actionModalInstanceCtrl.saveForm = function(){
                            if (actionModalInstanceCtrl.chosenUsers.length > 0 || actionModalInstanceCtrl.chosenGroups.length > 0){
                                LeaderMESservice.customAPI('CopyReportStructure',{
                                    SourceUserID : parentScope.userID,
                                    IsUserReport : parentScope.IsUserReport,
                                    ReportID : parentScope.reportID,
                                    FormID : parentScope.FormID,
                                    Users : actionModalInstanceCtrl.chosenUsers,
                                    Groups : actionModalInstanceCtrl.chosenGroups
                                }).then(function(response){
                                    toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                    actionModalInstanceCtrl.close();
                                })
                            }
                        };

                        LeaderMESservice.GetAllGroupsAndUsers().then(function(response){
                            if (parentScope.copyStructureToUser){
                                actionModalInstanceCtrl.usersData = response.Users;
                            }
                            if (parentScope.copyStructureToGroup){
                                actionModalInstanceCtrl.groupsData = response.Groups;
                            }
                            actionModalInstanceCtrl.loading = false;
                        });

                        actionModalInstanceCtrl.close = function () {
                            $modalInstance.close();
                        };
                    },
                    controllerAs: 'actionModalInstanceCtrl'
                });
            };
            $scope.gridMenuCustomItems.push({
                title: $filter('translate')('COPY_REPORT_DEFINITION'),
                action: function ($event) {
                    $scope.copyStructureToGroupOrUser();
                },
                order: 102
            })
        }
    }

    return {
        stateCode: stateCode,
    }
});