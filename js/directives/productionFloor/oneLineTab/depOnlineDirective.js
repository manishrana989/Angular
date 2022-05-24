function newDepDirective(googleAnalyticsService, $timeout) {
    var template = "views/custom/productionFloor/common/newDepartments.html";
    var controller = function (
        $scope,
        LeaderMESservice,
        $filter,
        $sessionStorage,
        OnlineService,
        $localStorage,
        ExpandedMachinesService,
        CollapsedMachinesService,
        OnlineSettingsService,
        toastr
    ) {
        var departmentCtrl = this;
        if ($sessionStorage.selectedNumOfMachines) {
            departmentCtrl.selectedNumOfMachines = $sessionStorage.selectedNumOfMachines[$scope.content.DepartmentID];
        }
        else {
            $sessionStorage.selectedNumOfMachines = {}
        }
        $scope.type = 'department';
        if ($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type]) {
            $scope.settings = $localStorage.machineOnlineSettings[$scope.type];
        } else {
            $scope.settings = angular.copy(OnlineService.machineOnlineSettings);
        }

        $scope.expandedMachinesStructureReady = false;
        departmentCtrl.fullColorMode = false;
        departmentCtrl.showPencils = false;
        $scope.isDefault = $scope.isDefaultStructure
        $scope.selectedSortField = $sessionStorage.depSortBy;
        $scope.dateNow = new Date();

        departmentCtrl.HasPermission = false;
        $scope.allowSetDefaultMachineStructure = $sessionStorage.userAuthenticated?.AllowSetDefaultMachineStructure

        $scope.templateGroups = [{ ename: $filter('translate')("MY_STRUCTURE"), hname: $filter('translate')("MY_STRUCTURE"), id: -2 }]

        var validSelectTemplateGroup = function (property) {
            if (property == 'expanded') {
                if ($scope.allowSetDefaultMachineStructure == true && $localStorage.selectTemplateGroupID.expandedStructure == -1) return false
                if ($scope.allowSetDefaultMachineStructure == false && $localStorage.selectTemplateGroupID.expandedStructure > -1) return false
            }
            else {
                if ($scope.allowSetDefaultMachineStructure == true && $localStorage.selectTemplateGroupID.depCollapsed == -1) return false
                if ($scope.allowSetDefaultMachineStructure == false && $localStorage.selectTemplateGroupID.depCollapsed > -1) return false
            }
            return true
        }

        if ($localStorage.selectTemplateGroupID && $localStorage.selectTemplateGroupID.expandedStructure != undefined && validSelectTemplateGroup('expanded')) {
            departmentCtrl.selectTemplateGroupID = $localStorage.selectTemplateGroupID.expandedStructure
        }
        else {
            if (!$localStorage.selectTemplateGroupID) {
                if ($scope.allowSetDefaultMachineStructure) {
                    $localStorage.selectTemplateGroupID = {
                        expandedStructure: -2,
                    }
                }
                else {
                    $localStorage.selectTemplateGroupID = {
                        expandedStructure: -1,
                    }
                }
            }
            else {
                $localStorage.selectTemplateGroupID.expandedStructure = $scope.allowSetDefaultMachineStructure ? -2 : -1
            }
            departmentCtrl.selectTemplateGroupID = $localStorage.selectTemplateGroupID.expandedStructure;
        }

        if ($localStorage.selectTemplateGroupID && $localStorage.selectTemplateGroupID.depCollapsed != undefined && validSelectTemplateGroup('collapsed')) {
            departmentCtrl.selectTemplateGroupIdCollapsed = $localStorage.selectTemplateGroupID.depCollapsed
        }
        else {
            if (!$localStorage.selectTemplateGroupID) {

                if ($scope.allowSetDefaultMachineStructure) {
                    $localStorage.selectTemplateGroupID = {
                        depCollapsed: -2,
                    }
                }
                else {
                    $localStorage.selectTemplateGroupID = {
                        depCollapsed: -1,
                    }
                }
            }
            else {
                $localStorage.selectTemplateGroupID.depCollapsed = $scope.allowSetDefaultMachineStructure ? -2 : -1
            }
            departmentCtrl.selectTemplateGroupIdCollapsed = $localStorage.selectTemplateGroupID.depCollapsed;
        }

        LeaderMESservice.customAPI('GetJobCustomParameters', {}).then(response => {
            departmentCtrl.customParams = response.JobParams || [];
        });


        LeaderMESservice.customAPI("CheckUserEditCubePermission", {}).then(function (response) {
            departmentCtrl.HasPermission = true;
            $scope.machineOnlineSettings.HasPermission = departmentCtrl.HasPermission;
        });

        if ($scope.allowSetDefaultMachineStructure) {
            LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
                $scope.usersData = response.Users;
                $scope.groupsData = response.Groups;
                $scope.templateGroups = [...$scope.templateGroups, ..._.map($scope.groupsData, function (group) {
                    group.ename += ` ${$filter("translate")('STRUCTURE')}`
                    group.hname += ` ${$filter("translate")('STRUCTURE')}`
                    return group;
                })]
            });
        } else {
            $scope.templateGroups.unshift({ ename: $filter('translate')("DEFAULT_STRUCTURE"), hname: $filter('translate')("DEFAULT_STRUCTURE"), id: -1 })
        }

        if ($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type] && (OnlineService.newVersion == $localStorage.onlineServiceVersion[$scope.type])) {
            $scope.machineOnlineSettings = $localStorage.machineOnlineSettings[$scope.type];
        } else {
            $scope.machineOnlineSettings = angular.copy(OnlineService.machineOnlineSettings);
            if (!$localStorage.machineOnlineSettings) {
                $localStorage.machineOnlineSettings = {};
            }
            $localStorage.machineOnlineSettings[$scope.type] = $scope.machineOnlineSettings;
            $localStorage.onlineServiceVersion[$scope.type] = OnlineService.newVersion
        }
        $scope.machineOnlineSettings.HasPermission = departmentCtrl.HasPermission;


        $scope.$on("hasFilter", function (event, hasFiltering) {
            $scope.hasFiltering = hasFiltering;
            let depName
            if (!hasFiltering) {
                depName = 'dep_' + $scope.dep.DepartmentID;
                let cardPrefID = departmentCtrl.collapseMachine.value ? "MCollapsedBox_" : "MExpandedBox_";
                $timeout(function () {
                    OnlineService.drawProductionLines($scope.sortedMachines, cardPrefID, depName, 'online', $scope.settings.verticalView);
                }, 500);
            }
            else {
                OnlineService.deleteProductionLines(depName);
            }
        });

        $scope.content.ShiftStartTime
            ? ($scope.hideShiftPeriod = false)
            : ($scope.hideShiftPeriod = true);
        $scope.content.ShiftStartTime = moment(
            $scope.content.ShiftStartTime,
            "DD/MM/YYYY HH:mm:ss"
        );
        if ($sessionStorage.onlineDepartmentCollapsed) {
            departmentCtrl.collapseMachine =
                $sessionStorage.onlineDepartmentCollapsed;
        } else {
            departmentCtrl.collapseMachine = {
                value: false
            };
            $sessionStorage.onlineDepartmentCollapsed =
                departmentCtrl.collapseMachine;
        }

        googleAnalyticsService.gaPV("Department_Online");

        $scope.resetMachinesData = function () {
            if (!departmentCtrl.collapseMachine.value) {
                ExpandedMachinesService.resetStructure();
            } else {
                CollapsedMachinesService.resetStructure();
            }
        };
        $scope.dep = $scope.content;
        $scope.sortStatusBar = function () {
            var ordering = {};
            var sortOrder = ["1", "5", "2", "3", "6", "8", "0", "4", "7"];

            for (var i = 0; i < sortOrder.length; i++) ordering[sortOrder[i]] = i;

            $scope.dep.machineColorsBar.sort(function (a, b) {
                return ordering[a.color] - ordering[b.color];
            });
        };

        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.doneLoading = false;
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.sizes = [
            {
                value: 4,
                label: "small"
            },
            {
                value: 6,
                label: "medium"
            },
            {
                value: 12,
                label: "large"
            }
        ];

        if (!$sessionStorage.activePie) {
            $sessionStorage.activePie = "x2-rec";
        }

        $scope.activePie = $sessionStorage.activePie;
        $scope.toggleScreen = function () {
            $scope.allMachinesFullScreen.value = !$scope.allMachinesFullScreen.value;
            $sessionStorage.allMachinesFullScreen = $scope.allMachinesFullScreen.value;
        }

        $scope.resetPie = function () {
            $scope.piesArray.forEach(function (pie) {
                if ($scope.activePie == pie.name) {
                    pie.src = pie.srcActive;
                } else {
                    pie.src = pie.srcInactive;
                }
            });
        };

        $scope.allSelected = true;

        $scope.updateSelectedBar = function (bar) {
            $scope.updateStatus.func(bar.color);
            googleAnalyticsService.gaEvent("Department_Online", "bar_filtering");
        };

        $scope.resetSelectedBar = function (bar) {
            $scope.allSelected = true;
            googleAnalyticsService.gaEvent("Department_Online", "bar_filtering");
        };

        $scope.gaE = function (page_view, event_name) {
            googleAnalyticsService.gaEvent(page_view, event_name);
        };

        $scope.$on("ngRepeatMachineFinished", function (ngRepeatMachineFinished) {
            $scope.shapeShiftDone = true;
            $(".machineShapeShift" + $scope.dep.DepartmentID).shapeshift({
                enableResize: true,
                enableCrossDrop: false,
                enableDrag: false,
                minHeight: 100,
                minColumns: 19,
                align: $scope.localLanguage === true ? "right" : "left",
                autoHeight: true,
                gutterX: 6,
                gutterY: 6,
                paddingX: 6,
                paddingY: 6
            });

            $scope.doneLoading = true;
        });

        $scope.expandedMachinesStructure = {};

        $scope.prepareGraphDataRequest = function (machineId, fieldName) {
            if (!machineId || !fieldName) {
                var MachineGraph = [];
                for (var key in $scope.expandedMachinesStructure) {
                    if (
                        $scope.expandedMachinesStructure[key].staticField1 &&
                        $scope.expandedMachinesStructure[key].staticField1.graph
                    ) {
                        MachineGraph.push({
                            ID: key,
                            Field: [
                                $scope.expandedMachinesStructure[key].staticField1.FieldName
                            ]
                        });
                    }
                }
                return MachineGraph;
            }
            if (
                $scope.machinesGraphData &&
                $scope.machinesGraphData[machineId] &&
                $scope.machinesGraphData[machineId][fieldName]
            ) {
                return null;
            } else {
                return [{ ID: machineId, Field: [fieldName] }];
            }
        };

        $scope.graphDataLoading = {
            all: false
        };

        departmentCtrl.viewChanged = function () {
            $sessionStorage.selectedNumOfMachines[$scope.content.DepartmentID] = departmentCtrl.selectedNumOfMachines;
            $scope.machineOnlineSettings.selectedNumOfMachines = angular.copy(departmentCtrl.selectedNumOfMachines)
            if ($scope.machinesGraphData) {
                $timeout(function () {
                    $scope.machinesGraphData = angular.copy($scope.machinesGraphData);
                }, 200);
            }
        };

        departmentCtrl.changeSortByView = function () {
            departmentCtrl.sortByValue = !departmentCtrl.sortByValue
            $scope.machineOnlineSettings.sortByValue = departmentCtrl.sortByValue
        }

        departmentCtrl.changeSortByViewCollapsed = function () {
            departmentCtrl.sortByValueColllapsed = !departmentCtrl.sortByValueColllapsed
            $scope.machineOnlineSettings.sortByValueColllapsed = departmentCtrl.sortByValueColllapsed
        }

        $scope.getGraphData = function (machineId, fieldName) {
            var graphData = $scope.prepareGraphDataRequest(machineId, fieldName);
            if (!graphData || graphData.length == 0) {
                return;
            }
            if ($scope.graphDataLoading[machineId] || $scope.graphDataLoading.all) {
                return;
            }
            if (machineId) {
                $scope.graphDataLoading[machineId] = true;
            } else {
                $scope.graphDataLoading.all = true;
            }
            LeaderMESservice.customAPI("GetDepartmentRateParametersGraph", {
                shiftGraph: {
                    DepartmentID: $scope.dep.DepartmentID,
                    MachineGraph: graphData
                }
            }).then(function (response) {
                if (!$scope.machinesGraphData) {
                    $scope.machinesGraphData = {};
                }
                if (
                    response &&
                    response.CurrentShiftGraph &&
                    response.CurrentShiftGraph.length > 0 &&
                    response.CurrentShiftGraph[0].Machines
                ) {
                    response.CurrentShiftGraph[0].Machines.forEach(function (machine) {
                        machine.Graphs.forEach(function (graph) {
                            if (!$scope.machinesGraphData[machine.ID]) {
                                $scope.machinesGraphData[machine.ID] = {};
                            }
                            $timeout(function () {
                                $scope.machinesGraphData[machine.ID][graph.Name] =
                                    graph.GraphSeries;
                            }, 200);
                        });
                    });
                }
                if (machineId) {
                    $scope.graphDataLoading[machineId] = false;
                } else {
                    $scope.graphDataLoading.all = false;
                }
            });
        };

        $scope.getExpandedStructure = function () {
            var reqBody;
            var machineBody = _.map($scope.dep.DepartmentsMachine, function (machine) {
                return machine.MachineID
            });

            $localStorage.selectTemplateGroupID.expandedStructure = departmentCtrl.selectTemplateGroupID

            if (departmentCtrl.selectTemplateGroupID > -1) {
                reqBody = {
                    machines: machineBody,
                    structureType: 1,
                    IsDefault: departmentCtrl.selectTemplateGroupID >= -1 ? true : false,
                    GroupID: _.isNumber(departmentCtrl.selectTemplateGroupID) && departmentCtrl.selectTemplateGroupID
                }
            }
            else {
                reqBody = {
                    machines: machineBody,
                    structureType: 1,
                    IsDefault: departmentCtrl.selectTemplateGroupID == -1 ? true : false
                }
                if (departmentCtrl.selectTemplateGroupID == -1) {
                    reqBody.IsDefault = true
                    reqBody.GroupID = $sessionStorage.userAuthenticated?.TemplateID
                }
                else {
                    reqBody.IsDefault = false
                }
            }
            LeaderMESservice.customAPI("GetMachineStructure", reqBody).then(function (response) {
                for (var i = 0; i < $scope.dep.DepartmentsMachine.length; i++) {
                    var machineId = $scope.dep.DepartmentsMachine[i].MachineID;
                    filteredStructure = _.filter(angular.copy(response.Structure), function (machine, i) {
                        return machine = machine.splice(0, 1)
                    })
                    var machineStruct = _.find(filteredStructure, [
                        { FieldName: "MachineID", Value: machineId.toString() }
                    ]);

                    if (machineStruct) {
                        var Structure = _.find(machineStruct, { FieldName: "Structure" });
                        if (Structure) {
                            try {
                                var tmpStruct = JSON.parse(Structure.Value);
                                if (tmpStruct.staticField) {
                                    tmpStruct.staticField1 = tmpStruct.staticField;
                                    delete tmpStruct.staticField;
                                } else if (!tmpStruct.staticField1) {
                                    tmpStruct.staticField1 = {
                                        FieldName: "CycleTime",
                                        graph: false
                                    };
                                }

                                if (!tmpStruct.staticField2) {
                                    tmpStruct.staticField2 = {
                                        FieldName: "Job Progress",
                                        graph: false
                                    };
                                }

                                if (!tmpStruct.staticField3) {
                                    tmpStruct.staticField3 = {
                                        FieldName: "Josh Progress",
                                        graph: false
                                    };
                                }
                                if (!tmpStruct.staticField4) {
                                    tmpStruct.staticField4 = {
                                        FieldName: "Product",
                                        translate: "PRODUCT",
                                        graph: false,
                                        FieldEName: "ProductEName",
                                        FieldLName: "ProductLName",
                                        type: 1
                                    };
                                }
                                $scope.expandedMachinesStructure[machineId] = angular.copy(tmpStruct);
                                for (let i = $scope.expandedMachinesStructure[machineId]?.params?.length % 3; i % 3 != 0; i++) {
                                    $scope.expandedMachinesStructure[machineId].params.push({});
                                }

                                continue;
                            } catch (e) {
                                console.log("structure is not a json");
                            }
                        }
                    }
                    $scope.expandedMachinesStructure[machineId] = ExpandedMachinesService.getInitialStructure();
                }
                $scope.getGraphData();
                $scope.expandedMachinesStructureReady = true;
            });
        };
        $scope.getExpandedStructure();

        $scope.collpasedMachinesStructure = {};

        $scope.addRemoveParamToFillSquares = function () {
            let maxNumberOfSquaresToFill = 0;
            angular.forEach($scope.shapes, (shape, shapeIndex) => {
                let currentShapeNumberOfSquaresToFill = 0;
                angular.forEach(shape, (rowValue, rowIndex) => {
                    currentShapeNumberOfSquaresToFill += rowValue.col;
                });
                maxNumberOfSquaresToFill = maxNumberOfSquaresToFill < currentShapeNumberOfSquaresToFill ?
                    currentShapeNumberOfSquaresToFill : maxNumberOfSquaresToFill;
            });
            return maxNumberOfSquaresToFill;
        };

        $scope.getCollapsedStructure = function () {
            var machineBody = _.map($scope.dep.DepartmentsMachine, function (machine) {
                return machine.MachineID
            });

            $localStorage.selectTemplateGroupID.depCollapsed = departmentCtrl.selectTemplateGroupIdCollapsed


            if (departmentCtrl.selectTemplateGroupIdCollapsed > -1) {
                reqBody = {
                    machines: machineBody,
                    structureType: 2,
                    IsDefault: departmentCtrl.selectTemplateGroupIdCollapsed >= -1 ? true : false,
                    GroupID: _.isNumber(departmentCtrl.selectTemplateGroupIdCollapsed) && departmentCtrl.selectTemplateGroupIdCollapsed
                }
            }
            else {
                reqBody = {
                    machines: machineBody,
                    structureType: 2,
                }

                if (departmentCtrl.selectTemplateGroupIdCollapsed == -1) {
                    reqBody.IsDefault = true
                    reqBody.GroupID = $sessionStorage.userAuthenticated?.TemplateID
                }
                else {
                    reqBody.IsDefault = false
                }
            }
            LeaderMESservice.customAPI("GetMachineStructure", reqBody).then(function (response) {
                $scope.updateSettings(JSON.parse(response.PageStructure))
                let maxSquaresToFill = $scope.addRemoveParamToFillSquares();

                for (var i = 0; i < $scope.dep.DepartmentsMachine.length; i++) {
                    var machineId = $scope.dep.DepartmentsMachine[i].MachineID;
                    filteredStructure = _.filter(angular.copy(response.Structure), function (machine, i) {
                        return machine = machine.splice(0, 1)
                    })
                    var machineStruct = _.find(filteredStructure, [
                        { FieldName: "MachineID", Value: machineId.toString() }
                    ]);
                    if (machineStruct) {
                        var Structure = _.find(machineStruct, { FieldName: "Structure" });
                        if (Structure) {
                            try {
                                for (let i = 0; i < maxSquaresToFill - Structure.Value.length; i++) {
                                    Structure.Value.push({
                                        FieldName: 'removeParam',
                                        FieldEName: $filter('translate')('REMOVE_PARAM'),
                                        FieldLName: $filter('translate')('REMOVE_PARAM'),
                                        CurrentValue: ''
                                    });
                                }

                                if (JSON.parse(Structure?.Value).length == 7) {
                                    $scope.collpasedMachinesStructure[machineId] = JSON.parse(Structure?.Value);
                                }
                                else {
                                    $scope.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                                }
                                continue;
                            } catch (e) {
                                console.log("structure is not a json");
                            }
                        }
                        else {
                            $scope.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                        }
                    }
                    else {
                        $scope.collpasedMachinesStructure[machineId] = CollapsedMachinesService.getInitialStructure();
                    }
                    console.log("passed on if(Structure),this is the parameters for this machine after CollapsedService.getInitStructure:", CollapsedMachinesService.getInitialStructure());
                }
            });
        };

        $scope.getCollapsedStructure();

        $scope.updateSettings = function (newSettings) {
            for (const property in newSettings) {
                if (property === 'departmentView') {
                    continue;
                }
                if (property != 'showPencils') {
                    $localStorage.machineOnlineSettings[$scope.type][property] = newSettings[property]
                    $scope.machineOnlineSettings[property] = newSettings[property]
                }
                else {
                    $localStorage.machineOnlineSettings[$scope.type][property] = false
                    $scope.machineOnlineSettings[property] = false
                    departmentCtrl.showPencils = false;
                }

            }
            OnlineSettingsService.saveSettingsFunction($scope.type)
        }


        $scope.depTechnicianStatus = {};


        $scope.updateTechnicianStatus = function () {
            if ($scope.updateTechnicianStatusTimeout) {
                $timeout.cancel($scope.updateTechnicianStatusTimeout);
            }
            $scope.updateTechnicianStatusTimeout = $timeout(function () {
                LeaderMESservice.customAPI("GetTechnicianStatus", {
                    DepartmentID: $scope.dep.DepartmentID
                }).then(function (response) {
                    for (var i = 0; i < $scope.dep.DepartmentsMachine.length; i++) {
                        var key = $scope.dep.DepartmentsMachine[i].MachineID;
                        $scope.depTechnicianStatus[key] = {
                            lastMessage: {
                                data: null
                            },
                            technician: null,
                            technicianName: null,
                            //default
                            technicianIcon: "images/onlineIcons/technician-grey-new.svg",
                            technicianText: "TECHNICIAN_DEFAULT"
                        };
                        var TechStatus = response.TechStatus && response.TechStatus[key];
                        if (TechStatus && TechStatus.length > 0) {
                            $scope.depTechnicianStatus[
                                key
                            ].lastMessage.data = _.find(TechStatus, { NotificationType: 1 });
                            $scope.depTechnicianStatus[key].technician = _.find(TechStatus, {
                                NotificationType: 2
                            });
                        }
                        if ($scope.depTechnicianStatus[key].technician) {
                            $scope.depTechnicianStatus[key].technicianName =
                                $scope.depTechnicianStatus[key].technician.TargetUserName ||
                                $scope.depTechnicianStatus[key].technician.SourceUserName;
                            $scope.depTechnicianStatus[key].technicianIcon =
                                "images/onlineIcons/technician-grey-new.svg";
                        }
                        var machineTechStatus = _.find(response.TotalCallsForMachine, {
                            SourceMachineID: key
                        });
                        if (machineTechStatus) {
                            $scope.depTechnicianStatus[key].totalOpenCalls =
                                machineTechStatus.TotalOpenCalls;
                        }
                    }
                });
            }, 300);
        };

        $scope.jobConfiguration = {};

        $scope.getJobConfigurations = function () {
            if ($scope.getJobConfigurationsTimeout) {
                $timeout.cancel($scope.getJobConfigurationsTimeout);
            }
            $scope.getJobConfigurationsTimeout = $timeout(function () {
                LeaderMESservice.customAPI("GetJobConfigurations", {
                    DepartmentID: $scope.dep.DepartmentID
                }).then(function (response) {
                    response.MachineJobs.forEach(function (machineJob) {
                        if ($scope.jobConfiguration[machineJob.Key]) {
                            $scope.jobConfiguration[machineJob.Key].data = machineJob.Value;
                        } else {
                            $scope.jobConfiguration[machineJob.Key] = {
                                data: machineJob.Value
                            };
                        }
                    });
                });
            }, 300);
        };
        $scope.updateTechnicianStatus();
        $scope.getJobConfigurations();

        $scope.resetData = false;

        $scope.localUpdate = function () {
            $scope.updateData();
        };

        $scope.sortByData = [
            {
                field: "TimeLeftHR",
                name: $filter("translate")("TIME_LEFT_HOURS")
            },
            {
                field: "MachineStatusID",
                name: $filter("translate")("STATUS")
            }

        ];

        $scope.numberOfMachines = [
            {
                field: "1",
                class: "col-xxxl-12 col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-xs-12"
            },
            {
                field: "2",
                class: "col-xxxl-6 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-xs-6"
            },
            {
                field: "3",
                class: "col-xxxl-4 col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-xs-4"
            },
            {
                field: "4",
                class: "col-xxxl-3 col-xxl-3 col-xl-3 col-lg-3 col-md-3 col-xs-3"
            },

            {
                field: "5",
                class: "col-xxxl-2 col-xxl-2 col-xl-2dot4 col-lg-2dot4 col-md-2dot4 col-xs-2"
            },
            {
                field: "6",
                class: "col-xxxl-2 col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-xs-2"
            },
            {
                field: "7",
                class: "col-xxxl-new-7 col-xxl-new-7 col-xl-new-7 col-lg-new-7 col-md-new-7 col-sm-new-7 col-xs-2"
            },
            {
                field: "12",
                class: "col-xxxl-1 col-xxl-1 col-xl-1 col-lg-1 col-md-1 col-xs-1"
            }
        ];
        $scope.sortAsc = true;
        $scope.sortMachineBy = function (field) {            
            $sessionStorage.depSortBy = field;
            if (field) {
                OnlineService.deleteProductionLines();
                var sortedMachines;
                if (field == "MachineStatusID") {
                    var sortOrder = [1, 5, 2, 3, 6, 8, 0, 4];

                    sortedMachines = _.sortBy($scope.dep.DepartmentsMachine, function (
                        machine
                    ) {
                        return sortOrder.indexOf(machine.MachineStatusID);
                    });
                    $scope.sortedMachines = sortedMachines;
                }
                else {
                    sortedMachines = _.sortBy($scope.dep.DepartmentsMachine, field);
                    $scope.sortedMachines = sortedMachines;
                }
            } else {
                $scope.sortedMachines = _.sortBy(
                    $scope.dep.DepartmentsMachine,
                    "orderBy"
                );
            }
            if (!$scope.sortAsc) {
                $scope.sortedMachines.reverse();
            }
            if (!field && $scope.sortAsc) {
                OnlineService.drawingLinesEnabled.value = true;
                $scope.drawLines()
            } else {
                OnlineService.drawingLinesEnabled.value = false;
                $scope.cleanup();
            }
        };
        $scope.sortMachineByFilter = function (field) {         
            $scope.selectedSortField=true;
            $scope.hasFiltering=true;
            $sessionStorage.depSortBy = field;
           if(field)
           $scope.sortedMachines = _.sortBy(
            $scope.dep.DepartmentsMachine,
            "orderBy");           
           else
            $scope.sortedMachines.reverse();
            
        };
        
        $scope.drawLines = function () {
            let depName = 'dep_' + $scope.dep.DepartmentID;
            if (!$scope.oldView && !$scope.hasFiltering) {
                let cardPrefID = departmentCtrl.collapseMachine.value ? "MCollapsedBox_" : "MExpandedBox_";
                $timeout(function () {
                    OnlineService.drawProductionLines($scope.sortedMachines, cardPrefID, depName, 'online', $scope.settings.verticalView);
                }, 500);
            } else {
                OnlineService.deleteProductionLines(depName);
            }
        };
        $scope.$watch('oldView', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                $scope.drawLines();
            }
        })

        $scope.$watch('settings.verticalView', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                $scope.drawLines();
            }
        })

        $scope.minimalize = function () {
            $("body").toggleClass("mini-navbar");
            if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                // Hide menu in order to smoothly turn on when maximize menu
                $('#side-menu').hide();
                // For smoothly turn on menu
                setTimeout(
                    function () {
                        $('#side-menu').fadeIn(400);
                        $(window).trigger('resize');
                    }, 400);
            } else if ($('body').hasClass('fixed-sidebar')) {
                $('#side-menu').hide();
                setTimeout(
                    function () {
                        $('#side-menu').fadeIn(400);
                        $(window).trigger('resize');
                    }, 400);
            } else {
                // Remove all inline style from jquery fadeIn function to reset menu state
                $('#side-menu').removeAttr('style');
                $(window).trigger('resize');
            }
        }


        $scope.sortedMachines = $scope.dep.DepartmentsMachine;
        const updateGroupLines = () => {
            const sortedLines = _.sortBy($scope.machinesLinesMap, (data) => {
                return data.DisplayOrder;
            });
            const machinesGroupedByLine = _.groupBy($scope.sortedMachines, 'LineID');
            $scope.machinesGroupedByLine = [];
            $scope.machinesWithoutLines = [];
            if (machinesGroupedByLine[0]) {
                $scope.machinesWithoutLines = machinesGroupedByLine[0];
              }
            for (let i = 0; i < sortedLines.length; i++) {
                const lineID = sortedLines[i].ID;
                if (lineID === 0){
                    continue;
                }
                if (machinesGroupedByLine[lineID]) {
                    $scope.machinesGroupedByLine.push(machinesGroupedByLine[lineID]);
                }
            }
            const linesLength = _.countBy($scope.sortedMachines, 'LineID');
            $scope.longestLine = _.max(linesLength);
        }
        if ($scope.machinesLinesMap) {
            updateGroupLines();
        }
        $scope.dep.DepartmentsMachine.forEach(function (machine, index) {
            machine.orderBy = index;
        });
        var dateTypes = ["TimeLeftHour"];
        $scope.$watch(
            "dep.DepartmentsMachine",
            function () {
                $scope.sortMachineBy(departmentCtrl.selectedSortField);
                $scope.sortStatusBar();
                if ($scope.getGraphData) {
                    $scope.getGraphData();
                }
                if ($scope.updateTechnicianStatus) {
                    $scope.updateTechnicianStatus();
                }
                if ($scope.getJobConfigurations) {
                    $scope.getJobConfigurations();
                }
                if (typeof $scope.content.ShiftStartTime == "String") {
                    $scope.content.ShiftStartTime = moment(
                        $scope.content.ShiftStartTime,
                        "DD/MM/YYYY HH:mm:ss"
                    );
                }
                $scope.dep.DepartmentsMachine.forEach(function (machine) {
                    machine.MachineParams.forEach(function (param) {
                        if (
                            param &&
                            param.FieldName &&
                            dateTypes.indexOf(param.FieldName) >= 0
                        ) {
                            param.type = "date";
                        }
                    });
                });
                $scope.dateNow = new Date();
            },
            true
        );
        $scope.fetching = false;

        LeaderMESservice.customAPI("GetLinesMachines", {}).then(function (response) {
            let machinesLines = response.LinesMachines
                .map(it => {
                    it.Key.pipline = it.Value;
                    return { [it.Key.ID]: it.Key }
                });
            $scope.machinesLinesMap = Object.assign({}, ...machinesLines);
            $scope.fetching = true;
            updateGroupLines();
        });

        $scope.updateStatus = {
            func: function () {
                console.log("dummy");
            }
        };

        if ($sessionStorage.allMachinesFullScreen !== undefined) {
            $scope.allMachinesFullScreen.value = $sessionStorage.allMachinesFullScreen;
        }


        $scope.$watch('isDefault.value', function (newVal, oldVal) {
            $scope.getExpandedStructure()
        });
        $scope.$watch('allMachinesFullScreen.value', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.drawLines()
            }
        });
        $scope.$watch('departmentCtrl.showPencils', ((newVal, oldVal) => {
            if (newVal !== oldVal) {
                $scope.drawLines()
            }
        }));
        $scope.$watch('machineOnlineSettings.selectedScale.scale', ((newVal, oldVal) => {
            if (newVal !== oldVal) {
                $scope.drawLines()
            }
        }));

        $scope.cleanup = function () {
            OnlineService.deleteProductionLines();
        }

        $scope.$on("changeMachinesNumberAndPE", (res, data) => {
            $scope.showMachinePE = true;
            $scope.machinesNumber = data.machines;
            $scope.departmentPE = data.PE;
        })
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            content: "=",
            allMachinesFullScreen: '=',
            lastUpdate: "=",
            updateData: "=",
            oldView: "=",
            isDefaultStructure: "="
        },
        controller: controller,
        link: function (scope) {
            scope.$on('$destroy', function () {
                scope.cleanup();
            });
        },
        controllerAs: "departmentCtrl"
    };
}

angular.module("LeaderMESfe").directive("newDepDirective", newDepDirective);
