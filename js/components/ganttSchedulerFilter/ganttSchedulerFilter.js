function ganttSchedulerFilter() {

    var controller = function ($scope, LeaderMESservice, $filter,$timeout,$localStorage, AuthService, $compile) {
        var ganttSchedulerFilterCtrl = this;
        ganttSchedulerFilterCtrl.userDateFormat = AuthService.getUserDateFormat();
        ganttSchedulerFilterCtrl.version = 4;
        ganttSchedulerFilterCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        var defaultData = {
            columns: [
                {
                    value : false,
                    param :  "ErpJobID",
                    TEXT :  'ERP_JOB_ID',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param :  "ERPOrderID",
                    TEXT :  "ERP_ORDER_ID",
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param :  "ProductCatalog",
                    TEXT :  'PRODUCT_CATALOG_ID',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : true,
                    param :  ganttSchedulerFilterCtrl.localLanguage ? 'ProductName' : 'ProductEName',
                    TEXT :  'PRODUCT_NAME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param :  "MoldID",
                    TEXT :  'MOLD_ID',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : true,
                    param :  ganttSchedulerFilterCtrl.localLanguage ? 'MoldLName' : 'MoldEName',
                    TEXT :  'MOLD_NAME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "StartTime",
                    TEXT :  'START_TIME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "EndTime",
                    TEXT :  'END_TIME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "ClosingDate",
                    TEXT :  'CLOSING_DATE',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "EndTimeRequest",
                    TEXT :  'REQUESTED_END_TIME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "PlanningApprovedDate",
                    TEXT :  'PLANNING_DATE_OF_APPROVAL',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "ShippingDate",
                    TEXT :  'SHIPPING_DATE',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    type: 'date',
                    param :  "GuaranteedMarketingDate",
                    TEXT :  'GUARANTEED_DELIVERY_DATE',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : ganttSchedulerFilterCtrl.localLanguage ? 'CustomerLName' : 'CustomerEName',
                    TEXT :  'CUSTOMER_NAME',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'MoldLocalID',
                    TEXT :  'MOLD_LOCAL_ID',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'Notes',
                    TEXT :  'NOTES',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'UnitsTarget',
                    TEXT :  'UNITS_TARGET',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'UnitsProducedOK',
                    TEXT :  'UNITS_PRODUCED_OK',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'TotalRejects',
                    TEXT :  'TOTAL_REJECTS',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'TimeLeftHR',
                    TEXT :  'TIME_LEFT_HR',
                    type: 'number',
                    viewMode : ['singleMachineView', 'factoryView']
                },
                {
                    value : false,
                    param : 'JobStatus',
                    TEXT :  'JOB_STATUS',
                    viewMode : ['singleMachineView']
                },
                {
                    value : false,
                    param : ganttSchedulerFilterCtrl.localLanguage ? 'MoldStatusLName' : 'MoldStatusEName', 
                    TEXT :  'MOLD_STATUS',
                    viewMode : ['singleMachineView']
                },
                {
                    value : false,
                    param : 'MoldLocation', 
                    TEXT :  'MOLD_LOCATION',
                    viewMode : ['singleMachineView', 'factoryView']
                },
            ],
            colors : [
                {
                    color : "#baf0b7",
                    var :  "--gantt-active-job",
                    TEXT : "ACTIVE_JOBS"
                },
                {
                    color : "#f5f5f5",
                    var :  "--gantt-pending-jobs",
                    TEXT : "PENDING_JOBS"
                },
                
                {
                    color : "#c5c7c9",
                    var :  "--gantt-no-production",
                    TEXT : "NO_PRODUCTION"
                },
                {
                    color: "#127510",
                    var: "--gantt-non-setup-shift",
                    TEXT: "NON_SETUP_SHIFT"
                },
                {
                    color: "#21809e",
                    var: "--gantt-not-released-job",
                    TEXT: "NOT_RELEASED_JOB"
                }
            ],
            setupColors : [
                {
                    color : "#853FCC",
                    var :  "--gantt-setup",
                    TEXT : "SETUP_JOBS"
                },
            ],
            useJobColor : {
                value : 'false'
            },
            useSetupColor : {
                value : 'false'
            },
            jobsNotForRelease : {
                value : false
            },
            selectedMachines: []
        }   
        
        const loadData = () => {
            ganttSchedulerFilterCtrl.jobsNotForRelease = $localStorage.ganttFilterData.jobsNotForRelease;
    
            if ($scope.views.indexOf('machineType') >= 0) {
                LeaderMESservice.customGetAPI('GetMachineTypesAndMachines').then(function(response){
                    ganttSchedulerFilterCtrl.machineTypes = response.MachineTypes;
                    if (!$localStorage.ganttFilterData.selectedMachines) {
                      $localStorage.ganttFilterData.selectedMachines = [];
                    }
                    else {
                        ganttSchedulerFilterCtrl.machineTypes.forEach(function(machineType){
                            machineType.Machines.forEach(function(machine){
                                if ($localStorage.ganttFilterData.selectedMachines.indexOf(machine.Id) >= 0){
                                    machine.selected = true;
                                }
                            });
                            var selectedMachines = _.countBy(machineType.Machines,{selected: true});
                            if (!selectedMachines.false){
                                machineType.selected = true;
                            }
                        });
                    }
                });
            };
            
            if ($scope.departmentsData){
                var temp = [];
                if($localStorage.ganttFilterData.departmentsData){
                    temp = $localStorage.ganttFilterData.departmentsData;
                }
                $localStorage.ganttFilterData.departmentsData = $scope.departmentsData;
                temp.forEach(function(department){
                    var depTemp = _.find($localStorage.ganttFilterData.departmentsData,{Id : department.Id});
                    depTemp.selected = department.selected;
                    department.machines.forEach(function(machine){
                        var machineTemp = _.find(depTemp.machines,{Id : machine.Id});
                        machineTemp.selected = machine.selected;
                    });
                });
            }

            ganttSchedulerFilterCtrl.reset(true);
        };
        const promises = [];
        if ($scope.views.indexOf("columns") >= 0){
            promises.push(LeaderMESservice.customGetAPI('GetGanttJobParameters'));
        }
        Promise.all(promises).then(resp => {
            if (resp && resp[0]){
                const response = resp[0];
                defaultData.columns = [];
                if (response.ResponseDictionaryValues && 
                    response.ResponseDictionaryValues['Job Params']){
                    Object.keys(response.ResponseDictionaryValues['Job Params']).forEach(jobField => {
                        const field = {
                            value : false,
                            param :  jobField,
                            TEXT :  response.ResponseDictionaryValues['Job Params'][jobField],
                            viewMode : ['singleMachineView', 'factoryView']
                        }
                        if (['TimeLeftHR'].indexOf(jobField) >= 0){
                            field.number = true;
                        }
                        else if (['StartTime',
                                'EndTime',
                                'ClosingDate',
                                'EndTimeRequest',
                                'PlanningApprovedDate',
                                'ShippingDate',
                                'GuaranteedMarketingDate'].indexOf(jobField) >= 0){
                            field.date = true;
                        }
                        defaultData.columns.push(field);
                    });
                    defaultData.columns.unshift({
                        value : false,
                        param :  'machine_progress',
                        TEXT :  $filter('translate')('JOB_PROGRESS'),
                        viewMode : ['factoryView', 'singleMachineView'],
                    });
                    Object.keys(response.ResponseDictionaryValues['Recipe Values']).forEach(recipeField => {
                        const field = {
                            recipe: true,
                            value : false,
                            param :  recipeField.replace(/\s+(?=[^[\]]*\])/g, ""),
                            TEXT :  response.ResponseDictionaryValues['Recipe Values'][recipeField],
                            viewMode : ['singleMachineView', 'factoryView']
                        }
                        defaultData.columns.push(field);
                    });
                }
            }
            if (!$localStorage.ganttFilterData || $localStorage.version !== ganttSchedulerFilterCtrl.version){
                $localStorage.ganttFilterData = angular.copy(defaultData);
                $localStorage.version = ganttSchedulerFilterCtrl.version;
            }
            else if ($scope.views.indexOf("columns") >= 0){
                const newColumns = angular.copy(defaultData.columns);
                newColumns.forEach(column => {
                    const savedFilter = _.find($localStorage.ganttFilterData.columns,{param: column.param});
                    if (savedFilter && savedFilter.value) {
                        column.value = true;
                        column.order = savedFilter.order;
                    }
                });
                $localStorage.ganttFilterData.columns = newColumns;
            }
            loadData();
        });


        ganttSchedulerFilterCtrl.checkStartTimeTartget = function(data){
            if (!data.StartTime || !data.StartTimeTarget){
                return false;
            }
            var StartTime = new Date(data.StartTime);
            var StartTimeTarget = new Date(data.StartTimeTarget);
            if (StartTimeTarget >= StartTime){
                return false;
            }
            return true;
        }

        ganttSchedulerFilterCtrl.checkEndTimeTarget = function(data){
            if (!data.EndTimeTarget || !data.EndTime){
                return false;
            }
            var EndTime = new Date(data.EndTime);
            var EndTimeTarget = new Date(data.EndTimeTarget);
            if (EndTimeTarget >= EndTime){
                return false;
            }
            return true;
        }

        ganttSchedulerFilterCtrl.checkRequestedEndTime = function(data){
            if (!data.EndTimeRequest || !data.EndTime){
                return false;
            }
            var EndTimeRequest = new Date(data.EndTimeRequest);
            var EndTime = new Date(data.EndTime);
            if (EndTimeRequest >= EndTime){
                return false;
            }
            return true;
        }

        ganttSchedulerFilterCtrl.checkShippingDate = function(data){
            if (!data.ShippingDate || !data.EndTime){
                return false;
            }
            var ShippingDate = new Date(data.ShippingDate);
            var EndTime = new Date(data.EndTime);
            if (ShippingDate >= EndTime){
                return false;
            }
            return true;
        }

        ganttSchedulerFilterCtrl.checkGuaranteedMarketingDate = function(data){
            if (!data.GuaranteedMarketingDate || !data.EndTime){
                return false;
            }
            var GuaranteedMarketingDate = new Date(data.GuaranteedMarketingDate);
            var EndTime = new Date(data.EndTime);
            if (GuaranteedMarketingDate >= EndTime){
                return false;
            }
            return true;
        }

        ganttSchedulerFilterCtrl.exceptionsMap = [
            {
                field : "StartTimeTarget",
                func : ganttSchedulerFilterCtrl.checkStartTimeTartget
            },
            {
                field : "EndTimeTarget",
                func : ganttSchedulerFilterCtrl.checkEndTimeTarget
            },
            {
                field : "EndTimeRequest",
                func : ganttSchedulerFilterCtrl.checkRequestedEndTime
            },
            {
                field : "ShippingDate",
                func : ganttSchedulerFilterCtrl.checkShippingDate
            },
            {
                field : "GuaranteedMarketingDate",
                func : ganttSchedulerFilterCtrl.checkGuaranteedMarketingDate
            }
        ];

        ganttSchedulerFilterCtrl.getFirstJob = function(resourceId){
            var jobForResource = _.filter($scope.jobEvents,{resourceId : resourceId});
            jobForResource = _.sortBy(jobForResource,'StartTime');
            if (jobForResource && jobForResource.length > 0){
                return jobForResource[0];
            }
            return null;
        }

        ganttSchedulerFilterCtrl.checkExceptions = function(resource, el, columnField){
            var exceptionColumn = _.find(ganttSchedulerFilterCtrl.exceptionsMap,{field :columnField});
            if (!exceptionColumn){
                return;
            }
            var firstJob = ganttSchedulerFilterCtrl.getFirstJob(resource.extendedProps.Id);
            if (firstJob){
                if (exceptionColumn.func(firstJob)){
                    resource.backgroundColor = 'red';
                    el.style.backgroundColor = 'red';
                    el.style.color = 'white';
                }
            }
        };

        ganttSchedulerFilterCtrl.filterColumns = function(filter){
            var excludeResourceId = {};
            $scope.jobEvents.forEach(function(jobEvent){
                if (excludeResourceId[jobEvent.resourceId]){
                    return;
                }
                var value = jobEvent[filter.param];
                value = value && value.toLowerCase && value.toLowerCase() || value;
                var filterValue = filter.value && filter.value.toLowerCase && filter.value.toLowerCase() || filter.value;
                var el = ganttSchedulerFilterCtrl.columnsData[jobEvent.resourceId + "_" + filter.param];
                if (filterValue === value){
                    if (el){
                        el.style.color = 'red';
                    }
                }
                else if (el){
                    el.style.color = null;
                }
                excludeResourceId[jobEvent.resourceId] = true;
            });
        };
        ganttSchedulerFilterCtrl.columnsData = {};

        const updateColumnsOrder = (columnOrder) => {
            ganttSchedulerFilterCtrl.columnFilters.forEach(column => {
                if (column.value && columnOrder < column.order) {
                    column.order = column.order - 1;
                }
            });
        };

        ganttSchedulerFilterCtrl.updateColumn = function(column){
            if (column.value){
                const count = _.countBy(ganttSchedulerFilterCtrl.columnFilters, 'value');
                column.order = count.true;
                $scope.resourceColumns.push({
                    type: column.type,
                    labelText: $filter('translate')(column.TEXT),
                    fieldParam : column.param,
                    text : function(resource){
                        var jobData = resource.extendedProps && resource.extendedProps.jobData || 
                        resource._resource && resource._resource.jobData || null;
                        if (jobData) {
                            const recipeData = jobData.JobRecipeValues || {};
                            if (column.recipe){
                                return recipeData[column.param];
                            }
                            else if (column.type === 'number') {
                                return jobData[column.param].toFixed(2);
                            }
                            else if (column.type === 'date') {
                                if (jobData[column.param]) {
                                    return moment(new Date(jobData[column.param])).format(ganttSchedulerFilterCtrl.userDateFormat);
                                }
                            }
                            return jobData[column.param];
                        }
                    },
                    render: function(resource, el) {
                        ganttSchedulerFilterCtrl.checkExceptions(resource, el,column.param);
                        var jobData = resource.jobData || resource._resource && resource._resource.jobData || resource.extendedProps.jobData || null;
                        if (jobData){
                            if (jobData.NoProduction){
                                el.style.backgroundColor = "#a6a9ab";
                                el.style.color = "#a6a9ab";
                                return;
                            }
                            if (column.param === 'machine_progress') {
                                el.innerHTML = "";
                                const myEl = $compile(`
                                    <div class="gannt-column-container">
                                        <div machine-progress-bar 
                                            style="height: 100%"
                                            units-target="${jobData.UnitsTarget}" 
                                            theoretical-units="${jobData.TheoreticalUnits}" 
                                            units-produced="${jobData.UnitsProducedOK}" 
                                            width="100%">
                                        </div>
                                    </div>`)($scope);
                                el.append(myEl[0]);
                                return;
                            }
                            el.title = jobData[column.param];
                        }
                    }
                });
            }
            else{
                const orderTemp = column.order;
                column.order = undefined;
                updateColumnsOrder(orderTemp);
                var index = _.findIndex($scope.resourceColumns,{fieldParam : column.param});
                if (index >= 0){
                    $scope.resourceColumns.splice(index,1);
                    // delete columnsData[$scope.resourceColumns[index]  + "_" + resource.field];
                }
            }
            $scope.gantt.setOption('resourceColumns',$scope.resourceColumns);
            ganttSchedulerFilterCtrl.updateResources();
        }

        ganttSchedulerFilterCtrl.updateJobColor = function(){
            document.querySelectorAll('.jobEvent').forEach(function(el){
                if (ganttSchedulerFilterCtrl.useJobColor && ganttSchedulerFilterCtrl.useJobColor.value !== 'false'){
                    // console.log('remove custom-color');
                    el.classList.remove('custom-color');
                    if (_.findIndex(el.classList,(it => (it === 'no-production' || it === 'job-0'))) < 0) {
                        const classColor = _.find(el.classList,(it => it.indexOf(`color-${ganttSchedulerFilterCtrl.useJobColor.value}`) >= 0));
                        if (classColor) {
                            el.style.backgroundColor = classColor.split('-')[2];
                        }
                    }
                }
                else{
                    // console.log('add custom-color');
                    el.classList.add('custom-color');
                }
            });
        };

        ganttSchedulerFilterCtrl.updateSetupColor = function(){
            document.querySelectorAll('.jobSetupEvent').forEach(function(el){
                if (ganttSchedulerFilterCtrl.useSetupColor && ganttSchedulerFilterCtrl.useSetupColor.value === 'true'){
                    el.classList.remove('custom-color');
                }
                else{
                    el.classList.add('custom-color');
                }
            });
        };


        ganttSchedulerFilterCtrl.updateResources = function(){
            if (ganttSchedulerFilterCtrl.updateResourcesTimeout){
                $timeout.cancel(ganttSchedulerFilterCtrl.updateResourcesTimeout);
            }
            ganttSchedulerFilterCtrl.updateResourcesTimeout = $timeout(function(){
                var filterEnabled = false;
                var elements = [];
                if ($scope.departmentsData){
                    $scope.departmentsData.forEach(function(department){
                        if (department.selected){
                            filterEnabled = true;
                        }
                        department.machines.forEach(function(machine){
                            if (machine.selected){
                                filterEnabled = true;
                                elements.push({
                                    el  : $("tr[data-resource-id=" + machine.Id + "]"),
                                    type : "show"
                                });
                            }
                            if (!machine.selected){
                                elements.push({
                                    el  : $("tr[data-resource-id=" + machine.Id + "]"),
                                    type : "hide"
                                });
                            }
                        });
                    });
                }
                if ($scope.filteredViewChange) {
                    $scope.filteredViewChange(filterEnabled);
                };
                elements.forEach(function(el){
                    if (el.type == "show" || !filterEnabled){
                        el.el.show();
                    }
                    else{
                        el.el.hide();
                    }
                });
            });
        };

        ganttSchedulerFilterCtrl.updateDepartment = function(department){
            department.machines.forEach(function(machine){
                machine.selected = department.selected;
            })
            ganttSchedulerFilterCtrl.updateResources();
        };

        ganttSchedulerFilterCtrl.updateMachineTypeLocal = function(machine,selected) {
            var index = $localStorage.ganttFilterData.selectedMachines.indexOf(machine.Id);
            if (selected) {
                if (index < 0){
                    $localStorage.ganttFilterData.selectedMachines.push(machine.Id);
                }
            }
            else if (index >= 0){
                $localStorage.ganttFilterData.selectedMachines.splice(index, 1);
            }
        };

        ganttSchedulerFilterCtrl.updateMachineType = function(machineType){
            machineType.Machines.forEach(function(machine){
                machine.selected = machineType.selected;
                ganttSchedulerFilterCtrl.updateMachineTypeLocal(machine,machineType.selected);
            });
        };

        ganttSchedulerFilterCtrl.loadSelectedMachines = function(){
            $scope.refreshData();
        }

        ganttSchedulerFilterCtrl.updateMachine = function(){
            ganttSchedulerFilterCtrl.updateResources();
        }

        ganttSchedulerFilterCtrl.updateMachineByMachineType = function(machine){
            ganttSchedulerFilterCtrl.updateMachineTypeLocal(machine,machine.selected);
        }

        
        ganttSchedulerFilterCtrl.changeColor = function(colorEl){
            document.documentElement.style.setProperty(colorEl.var ,colorEl.color);
        }

        ganttSchedulerFilterCtrl.reset = function(init){
            if ($scope.views.indexOf("colors") >= 0){
                if (!init){
                    $localStorage.ganttFilterData.colors = angular.copy(defaultData.colors);
                }
                ganttSchedulerFilterCtrl.eventColors = $localStorage.ganttFilterData.colors;
                ganttSchedulerFilterCtrl.useJobColor = $localStorage.ganttFilterData.useJobColor;
                ganttSchedulerFilterCtrl.useSetupColor = $localStorage.ganttFilterData.useSetupColor;
                ganttSchedulerFilterCtrl.eventColors.forEach(function(colorEl){
                    ganttSchedulerFilterCtrl.changeColor(colorEl);
                });
                ganttSchedulerFilterCtrl.updateJobColor();
            }
            if($scope.views.indexOf("setupColors") >= 0){
                if(!init){
                    $localStorage.ganttFilterData.setupColors = angular.copy(defaultData.setupColors);
                }
                ganttSchedulerFilterCtrl.setupColor = $localStorage.ganttFilterData.setupColors;
                document.documentElement.style.setProperty(ganttSchedulerFilterCtrl.setupColor[0].var ,ganttSchedulerFilterCtrl.setupColor[0].color);
                ganttSchedulerFilterCtrl.updateSetupColor();
            }

            if ($scope.views.indexOf("departments") >= 0){
                if (!init){
                    $scope.departmentsData.forEach(function(department){
                        department.selected = false;
                        department.machines.forEach(function(machine){
                            machine.selected = false;
                        });
                    });
                }
                ganttSchedulerFilterCtrl.updateResources();
            }
            if ($scope.views.indexOf("columns") >= 0 && $scope.resourceColumns){
                ganttSchedulerFilterCtrl.updateResources();
                $scope.resourceColumns.splice(1);
                if ($scope.resourceColumns[0].auxiliary){
                    $scope.gantt.setOption('resourceColumns',$scope.resourceColumns);
                    return;
                }
                if (!init){
                    $localStorage.ganttFilterData.columns = angular.copy(defaultData.columns);
                }
                ganttSchedulerFilterCtrl.columnFilters = $localStorage.ganttFilterData.columns;   
                var displayedColumns = _.filter(ganttSchedulerFilterCtrl.columnFilters,function(column){
                    if (column.value == true && column.viewMode.indexOf($scope.mode) >= 0){
                        return true;
                    }
                    return false;
                });
                displayedColumns = _.sortBy(displayedColumns.map((column, index) => {
                    if (column.order === undefined) {
                        column.order = index + 1;
                    }
                    return column;
                }),'order'),
                displayedColumns.forEach(function(column){   
                    $scope.resourceColumns.push({
                        type: column.type,
                        labelText: $filter('translate')(column.TEXT),
                        fieldParam : column.param,
                        text : function(resource){
                            var jobData = resource.extendedProps && resource.extendedProps.jobData || 
                                resource._resource && resource._resource.jobData || null;
                            if (jobData){
                                const recipeData = jobData.JobRecipeValues || {};
                                if (column.recipe){
                                    return recipeData[column.param];
                                }
                                else if (column.type === 'number') {
                                    return jobData[column.param].toFixed(2);
                                }
                                else if (column.type === 'date') {
                                    if (jobData[column.param]) {
                                        return moment(new Date(jobData[column.param])).format(ganttSchedulerFilterCtrl.userDateFormat);
                                    }
                                }
                                return jobData[column.param];
                            }
                        },
                        render: function(resource, el) {
                            ganttSchedulerFilterCtrl.checkExceptions(resource, el,column.param);
                            var jobData = resource.extendedProps && resource.extendedProps.jobData || 
                                resource._resource && resource._resource.jobData || null;
                            if (jobData){
                                if (jobData.NoProduction){
                                    el.style.backgroundColor = "#a6a9ab";
                                    el.style.color = "#a6a9ab";
                                    return;
                                }
                                if (column.param === 'machine_progress' && jobData.classNames.indexOf('first-job') >= 0) {
                                    el.innerHTML = "";
                                    const myEl = $compile(`
                                    <div class="gannt-column-container">
                                        <div machine-progress-bar 
                                            style="height: 100%"
                                            units-target="${jobData.UnitsTarget}" 
                                            theoretical-units="${jobData.TheoreticalUnits}" 
                                            units-produced="${jobData.UnitsProducedOK}" 
                                            width="100%">
                                        </div>
                                    </div>`)($scope);
                                    el.append(myEl[0]);
                                    return;
                                }
                                el.title = jobData[column.param];
                            }
                        }
                      });
                });
                $scope.gantt.setOption('resourceColumns',$scope.resourceColumns);
            }
        };
        if ($scope.appScopeCtrl){
            $scope.appScopeCtrl.updateJobColor = ganttSchedulerFilterCtrl.updateJobColor;
        }
    };

    return {
        restrict: "EA",
        templateUrl: 'js/components/ganttSchedulerFilter/ganttSchedulerFilter.html',
        scope: {
            jobEvents : "=",
            resourceColumns : "=",
            gantt : "=",
            departmentsData : "=",
            views : "=",
            ganttHeaderParams : "=",
            mode : "=",
            appScopeCtrl : "=",
            refreshData: "=",
            filteredViewChange: "="
        },
        controller: controller,
        controllerAs: 'ganttSchedulerFilterCtrl'
    };
}

angular
    .module('LeaderMESfe')
    .directive('ganttSchedulerFilter', ganttSchedulerFilter);