var responsiveTableDirective = function () {

    var Template = "views/common/responsiveTable.html";
    function controller($scope,$state, $timeout, $filter, AuthService,LeaderMESservice) {
        var responsiveTableCtrl = this;
        $scope.localColumns = [];
        $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : 'ltr';
        $scope.firstTime = true;
        // console.log($scope.data , 'before responsive') eeeeee
        $scope.buildData = () => {
            $scope.localColumns = []
            $scope.dataTable = []
            $scope.firstColName;
            $scope.localColumns = _.map($scope.columns, function (col, index) {
                let minWidth = 130;
                if(col === "Cycle Time Efficiency") {
                    minWidth = 200;
                }
                return { // columns with data without machineName
                    name: col.ColumnName.replace('(','').replace(')',''),
                    displayName: col.Value,
                    enableHiding: false,
                    enableSorting: false,
                    cellTemplate: `<div class="ui-grid-cell-contents" tooltip="{{COL_FIELD.tooltip}}" style=" text-align: center;" ng-style="COL_FIELD.style">{{COL_FIELD.duration}}</div>`
                }
            });
    
            var userDateFormat = AuthService.getUserDateFormat();
            _.forEach($scope.data, function (data, i) {
                row = {}
               if ($scope.graph.options.displayTableBy === 'machine') {       
                    row['MachineName'] = $scope.eventY[i].name;
                    row['MachineId'] = $scope.eventY[i].machineId;
                    row['jobID'] = $scope.eventY[i].jobID;            
                }
                else if ($scope.graph.options.displayTableBy === 'worker'){
                    row['WorkerName'] = $scope.eventY[i].name;
                }
                else { 
                        row['MainColumn'] = $scope.eventY[i].name;
                        
                    if($scope.totalsInPercentage){
                        if( $scope.totalsInPercentage[i].displayValueBy === "duration"){
                             row['Totals'] = $scope.totalsInPercentage[i].duration; // duration
                        }
                        else if( $scope.totalsInPercentage[i].displayValueBy === "numOfEvents"){
                             row['Totals'] = $scope.totalsInPercentage[i].numOfEvents; // num of events
                        }
                        else if ($scope.totalsInPercentage[i].displayValueBy === "avgEventDuration"){
                            row['Totals'] = $scope.totalsInPercentage[i].avgEventDuration;
                        }
                        else if ($scope.totalsInPercentage[i].displayValueBy === "percentageOfEventDuration"){
                            row['Totals'] = $scope.totalsInPercentage[i].percentageOfEventDuration;
                        }
                        
                        row['Totals'] = $scope.totalsInPercentage[i].duration;
                        row['totalsValue'] = $scope.totalsInPercentage[i].value*1.5 + "%";
                        row['totalsClass'] = $scope.totalsInPercentage[i].class ; // `totalsBars`
                        row['totalsBackgroundColor'] = $scope.totalsInPercentage[i].backgroundColor ; 

                    }
                }
                _.forEach($scope.localColumns, function (col, j) {
                    const newData = angular.copy(data[j]);
                    if ($scope.dateColumns && $scope.dateColumns.indexOf(col.name) >= 0 && newData && newData.duration != "-"){
                        const dateObj = moment(newData.duration,"YYYY-MM-DDTHH:mm:ss");
                        newData.duration = dateObj.format(userDateFormat);
                    }
                    row[col.name] = newData;
                })
                if ($scope.eventY[i].joshTree) {
                    row.$$treeLevel = 0;
                }
                if ($scope.eventY[i].treeLevel !== undefined) {
                        row.$$treeLevel = $scope.eventY[i].treeLevel;
                }
                $scope.dataTable.push(row)
            })
            
            if (['machine', 'worker'].indexOf($scope.graph.options.displayTableBy) >= 0){
                $scope.firstColName = "MachineName";
                let cellTemplate = "<a ng-click='grid.appScope.clickLink(row)'>{{row.entity.MachineName}}</a> ";
    
                if ($scope.graph.options.displayTableBy === 'worker') {
                    $scope.firstColName = "WorkerName";
                    cellTemplate = "<div ng-click='grid.appScope.clickLink(row)'>{{row.entity.WorkerName}}</div> ";
                }
                
    
                $scope.localColumns.unshift({
                    name: $scope.firstColName ,
                    displayName: $filter('translate')($scope.firstColName === 'MachineName' ? "MACHINE_NAME" : "WORKER_NAME"),
                    cellTemplate: cellTemplate ,
                    minWidth : 130,
                    enableCellEdit: false,
                    enableSorting: false,
                    enableHiding: false,
                    pinnedLeft: $scope.rtl === 'rtl' ? false : true,
                    pinnedRight: $scope.rtl === 'rtl' ? true : false,
                    pinned : $scope.rtl === 'rtl' ? 'right' : 'left',
                })
            }
            else {  
                $scope.firstColName = "MainColumn";
                if($scope.totalsInPercentage && $scope.totalsInPercentage[0].displayValueBy !== "avgEventDuration" && $scope.totalsInPercentage[0].displayValueBy !== "percentageOfEventDuration"){
                    $scope.localColumns.unshift({ // Totals Column
                        name: "Totals" ,
                        displayName: $filter('translate')('TOTALS'),
                        cellTemplate: '<div class="totalsTitle">{{row.entity.Totals}}</div><div class={{row.entity.totalsClass}} style= "width:{{row.entity.totalsValue}}; background-color:{{row.entity.totalsBackgroundColor}};">    </div>' ,
                        minWidth : 300,
                        enableCellEdit: false,
                        enableSorting: false,
                        enableHiding: false,
                        pinnedLeft: $scope.rtl === 'rtl' ? false : true,
                        pinnedRight: $scope.rtl === 'rtl' ? true : false,
                        pinned : $scope.rtl === 'rtl' ? 'right' : 'left',
                        
                    });
                }
                
                $scope.localColumns.unshift({ //eventy Column
                    name: $scope.firstColName ,
                    displayName: '',
                    cellTemplate: "<span>{{row.entity.MainColumn}}</span> " ,
                    minWidth : 130,
                    enableCellEdit: false,
                    enableSorting: false,
                    enableHiding: false,
                    pinnedLeft: $scope.rtl === 'rtl' ? false : true,
                    pinnedRight: $scope.rtl === 'rtl' ? true : false,
                    pinned : $scope.rtl === 'rtl' ? 'right' : 'left',
                    
                });
                
            }
        };

       
        $scope.clickLink = function (row) {
            let url;
            if (row.entity.jobID) {
                url = $state.href("appObjectFullView", {
                    appObjectName: "Job",
                    ID:row.entity.jobID,
                });
            } else {
                url = $state.href("appObjectMachineFullView", {
                    appObjectName: "MachineScreenEditor",
                    ID: row.entity.MachineId,
                });
            }
             window.open(url, "_blank");
        }


        $scope.buildData();

        const changeData = () => {
            if ($scope.changeDataTimeout){
                $timeout.cancel($scope.changeDataTimeout);
                $scope.changeDataTimeout = null;
            }
            $scope.loading = true;
            $scope.changeDataTimeout = $timeout(() => {
                $scope.buildData();
                $scope.gridOpts.columnDefs = $scope.localColumns;
                $scope.gridOpts.data = $scope.dataTable;
                $scope.loading = false;
            },500);
        }

        $scope.$watch('data',(newValue, oldValue) => {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changeData();
            }   
        }, true, true);



        $scope.$watch('columns',(newValue, oldValue) => {
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changeData();
            }   
        }, true, true);

        $scope.gridOpts = {
            enablePinning:true,
            saveWidths: true,
            enableSorting: true,
            enableColumnResizing: true,
            enableColumnMenus: false,
            enableFiltering: false,
            showColumnFooter: false,
            showGridFooter: false,
            columnDefs: $scope.localColumns,
            showClearAllFilters: false,
            enableGridMenu: false,
            data: $scope.dataTable,
            enableRowSelection: true,
            enableSelectAll: true,
            exporterMenuPdf: true,
            exporterMenuCsv: false,
            multiSelect: true,
            exporterExcelFilename: "Sheet" + ".xlsx",
            exporterExcelSheetName: "Sheet",
            exporterCsvFilename: "Sheet" + ".csv",
            exporterPdfDefaultStyle: {
                fontSize: 7
            },
            exporterPdfTableStyle: {
                margin: [0, 0, 0, 0],
            },
            exporterPdfTableHeaderStyle: {
                fontSize: 8,
                bold: true,
                italics: true,
                color: "blue",
            },
            exporterPdfHeader: {
                text: "Sheet",
                style: "headerStyle",
                alignment: $scope.rtl === "rtl" ? "right" : "left",
                margin: [30, 10, 30, 2],
            },
            exporterPdfFooter: function (currentPage, pageCount) {
                return {
                    text: currentPage.toString() + " of " + pageCount.toString(),
                    style: "footerStyle",
                    margin: [30, 0, 30, 0],
                };
            },
            exporterPdfCustomFormatter: function (docDefinition) {
                docDefinition.styles.headerStyle = {
                    fontSize: 22,
                    bold: true,
                    alignment: $scope.rtl == "rtl" ? "right" : "left",
                };
                docDefinition.styles.footerStyle = {
                    fontSize: 10,
                    bold: true
                };
                return docDefinition;
            },
            exporterFieldCallback: function (grid, row, col, input) {
                if (col.colDef.type == "date") {
                    return $filter("date")(input, "HH:mm:ss dd/MM/yyyy");
                } else {
                    return input;
                }
            },

            exporterPdfOrientation: "landscape",
            exporterPdfPageSize: "LETTER",
            exporterPdfMaxGridWidth: 580,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            onRegisterApi: function (gridApi) {
                // Keep a reference to the gridApi.
                $scope.gridApi = gridApi;
                $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
                $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
                $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
                $scope.gridApi.treeBase.on.rowExpanded($scope, saveState)
                $scope.gridApi.treeBase.on.rowCollapsed($scope, saveState)

                // Restore previously saved state.
                if ($scope.firstTime){
                    restoreState();
                    $scope.firstTime = false;
                }
            },
        };

        function saveState() {
            if ($scope.saveStateTimeout) {
                $timeout.cancel($scope.saveStateTimeout);
                $scope.saveStateTimeout = null;
            }
            $scope.saveStateTimeout =  $timeout(() => {
                var state = $scope.gridApi.saveState.save();
                //save the state in localStorage
                if (!$scope.options.state) {
                    $scope.options.state = {
                        settingState : {}
                    }
                }
                if ($scope.gridApi.grid.treeBase) {
                    state.treeView = $scope.gridApi.grid.treeBase.tree.map(node => node.state);
                }
                $scope.options.state = state;
            }, 100);    
        }
        

        function restoreState() {
            $timeout(function () {
                let state = null;
                if ($scope.options && $scope.options.state) {
                    state = $scope.options.state;
                }
                
                //if we have state from localStorage or $sessionStorage.containers.data then load it
                if (state) {
                    state.columns.forEach(column => {
                        column.sort = {};
                        if (column.name === 'WorkerName') {
                            if ($scope.graph.options.displayTableBy === 'worker'){
                                column.pinned = $scope.rtl === 'rtl' ? 'right' : 'left';
                            }
                            else{
                                delete column.pinned;
                            }
                        }
                        else if (column.name === 'MachineName'){
                            if ($scope.graph.options.displayTableBy === 'worker'){
                                delete column.pinned;
                            }
                            else{
                                column.pinned = $scope.rtl === 'rtl' ? 'right' : 'left';
                            }
                        }
                    });
                    if (state.treeView) {
                        state.treeView.forEach((nodeState,index) => {
                            if (nodeState === 'expanded'){
                               $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[index]);
                            }
                        });
                    }
                    $scope.gridApi.saveState.restore($scope, state);
                }
            });
        }


    }

 

    return {
        restrict: "E",
        templateUrl: Template,
        controller: controller,
        controllerAs: "responsiveTableCtrl",
        scope: {
            data: "=",
            columns: "=",
            eventY: "=",
            graph: "=",
            options: "=",
            totalsInPercentage:"=",
            height: '=',
        }
    };

};


angular.module('LeaderMESfe').directive('responsiveTableDirective', responsiveTableDirective);