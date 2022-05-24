function rules() {
    const template = "js/components/rules/rules.html";
    const controller = function (
        $modal,
        $scope,
        LeaderMESservice,
        $filter,
        $state,
        toastr,
        BreadCrumbsService,
        $timeout,
        googleAnalyticsService
    ) {
        googleAnalyticsService.gaPV("rules");
        const rulesCtrl = this;
        rulesCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.curruntLanguage = LeaderMESservice.getLanguage();
        rulesCtrl.showBreadCrumb = true;
        $scope.tests = null;
        $scope.list = [];
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.direction = $scope.rtl ? "rtl" : "ltr";

        $scope.view = "grid";
        $scope.items = $filter("translate")("AN_ITEM");
        $scope.week1 = [1, 2, 3, 4, 5, 6, 7];
        $scope.week2 = [8, 9, 10, 11, 12, 13, 14];
        $scope.week3 = [15, 16, 17, 18, 19, 20, 21];
        $scope.week4 = [22, 23, 24, 25, 26, 27, 28];
        $scope.week5 = [29, 30, 31];
        $scope.onEdit = false;
        $scope.machineListOpen = true;

        $scope.newTaskFields = {
            Hour: "",
            Min: "",
            startDate: null,
            endDate: null,
            Assignee: "",
            AssigneeID: "",
            selectedAssignee: false,
            openSubTask: true,
            subTaskText: ""
        };

        $scope.$emit("changeTitle", $filter('translate')('RULES'));

        if ($state.current.name == "customFullView") {
            rulesCtrl.showBreadCrumb = false;
        }

        if (!$state.params.menuContent) {
            $scope.stateParams = LeaderMESservice.getStateParams();
        } else {
            $scope.stateParams = $state.params.menuContent;
        }

        if (rulesCtrl.showBreadCrumb) {
            BreadCrumbsService.init();
            if (rulesCtrl.localLanguage == true) {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
            } else {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
            }
        }

        
        $scope.openNewRuleWindow = function () {
            $scope.type = 'time';
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/timePeriod.html",
                backdrop: "true",
                scope: $scope,
            });
        };
        $scope.openNewEventRuleWindow = function () {
            $scope.type = 'event';
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/eventRule.html",
                backdrop: "true",
                scope: $scope,
            }).result.catch(result => {
                $scope.editMode = false;
            });
        };

        $scope.openTimePickerWindow = function () {
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/timePicker.html",
                backdrop: "true",
                scope: $scope,
            });
        };
        $scope.openEventPickerWindow = function () {
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/eventPicker.html",
                backdrop: "true",
                scope: $scope,
            });
        };

        $scope.openNewTaskWindow = function () {
            $scope.items = $filter("translate")("A_TASK");
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/rules/newTask.html",
                    backdrop: "true",
                    controller: MainCtrl,
                    scope: $scope,
                })
                .result.then(function (result) {
                    if (result) {
                        $scope.eventSubType = 'task';
                    }
                });
        };

        $scope.openNewNotificationWindow = function () {
            $scope.items = $filter("translate")("A_NOTIFICATION");
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/rules/notificationWindow.html",
                    backdrop: "true",
                    controller: MainCtrl,
                    scope: $scope,
                })
                .result.then(function (result) {
                    if (result) {
                        $scope.eventSubType = 'notification';
                    }
                });
        };
        $scope.openNewServiceCallWindow = function () {
            $scope.items = $filter("translate")("A_SERVICE_CALL");
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/rules/serviceCallWindow.html",
                    backdrop: "true",
                    controller: MainCtrl,
                    scope: $scope,
                })
                .result.then(function (result) {
                    if (result) {
                        $scope.eventSubType = 'service_call';
                    }
                });
        };

        $scope.openNewMessageWindow = () => {
            $scope.items = $filter("translate")("A_MESSAGE");
            var modalInstance = $modal
                .open({
                    templateUrl: "js/components/rules/messageWindow.html",
                    backdrop: "true",
                    controller: MainCtrl,
                    scope: $scope,
                })
                .result.then(function () {

                });
        }

      
        $scope.openEditRuleWindow = (rule) => {
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/editRule.html",
                backdrop: "true",
                scope: $scope,
            });
        }

        $scope.openEditTimeWindow = () => {
            var modalInstance = $modal.open({
                templateUrl: "js/components/rules/editTime.html",
                backdrop: "true",
                scope: $scope,
            });
        }

        $scope.groupToSend = {
            trigger: {
                Name: null,
                RuleText: 'Every time period',
                IsActive: 1,
            }
        };

        $scope.triggerToSend = {
            trigger: {
                TriggerGroupID: null,
                TriggerType: 0,
                DepartmentID: 0,
                IntervalType: null,
                IntervalHour: 0,
                IntervalMinute: 0,
                EstimatedExecutionTime: 0,
                DaysInWeek: [],
                ID: 0,
                DaysInMonth: [],
                IsActive: true,
                AssigneeGroup: 0,
            }
        };

        $scope.actionToSend = {
            triggerTask: {
                TaskID: 0,
                CreateUser: LeaderMESservice.getUserID(),
                Subject: 0,
                Text: null,
                TaskLevel: 0,
                TaskLevelObjectID: 0,
                Priority: 2,
                Assignee: 0,
                AssigneeName: "",
                AssigneeGroupName: "",
                selectedAssignee: false,
                estHour: 0,
                estMin: 0,
                SourceTaskCreationPlatform: 1,
                AssigneeSelected: "",
                TaskSteps: [{
                    ID: 0,
                    Text: null,
                    isOpen: true,
                    IsActive: true,
                }],
            }
        }

        $scope.notificationToSend = {
            notificationType: 0,
            triggerTask: {
                TaskID: 0,
                CreateUser: LeaderMESservice.getUserID(),
                Subject: 0,
                Text: null,
                MachineID: 0,
                TaskLevelObjectID: 0,
                Priority: 0,
                MachineArray: [],
                Assignee: 0,
                AssigneeGroup: 0,
                AssigneeName: "",
                AssigneeGroupName: "",
                selectedAssignee: false,
                AssigneeSelected: 0,
                SourceTaskCreationPlatform: 1,
            }
        }
        $scope.serviceCallToSend = {
            notificationType: 0,
            triggerTask: {
                TaskID: 0,
                CreateUser: LeaderMESservice.getUserID(),
                Subject: 0,
                Text: null,
                MachineID: 0,
                TaskLevelObjectID: 0,
                Priority: 0,
                MachineArray: [],
                Assignee: 0,
                AssigneeGroup: 0,
                AssigneeName: "",
                AssigneeGroupName: "",
                selectedAssignee: false,
                AssigneeSelected: 0,
                SourceTaskCreationPlatform: 1,
            }
        }

        $scope.messageToSend = {
            notificationType: 0,
            triggerTask: {
                TaskID: 0,
                CreateUser: LeaderMESservice.getUserID(),
                Subject: 0,
                Text: null,
                MachineID: 0,
                TaskLevelObjectID: 0,
                Priority: 0,
                MachineArray: [],
                Assignee: 0,
                AssigneeGroup: 0,
                AssigneeSelected: 0,
                SourceTaskCreationPlatform: 1,
            }
        }

        $scope.subTasksTexts = [];

        $scope.twoDigitsTime = time => {
            time = ("0" + time).slice(-2);
            return time;
        }

        $scope.editInput = function (editText, index) {
            if (editText == "") {
                return
            }
            if (index != undefined) {
                $scope.subTasksTexts[index] = editText;
            } else {
                $scope.subTasksTexts.push(editText)
            }
        }

        rulesCtrl.checkActionToSend = () => {
            var checkAssign = false;
            if ($scope.actionToSend.triggerTask.AssigneeSelected == 1) {
                if ($scope.actionToSend.triggerTask.Assignee !== 0 && $scope.actionToSend.triggerTask.Assignee !== null) {
                    checkAssign = true;
                }
            } else if ($scope.actionToSend.triggerTask.AssigneeSelected == 2) {
                if ($scope.triggerToSend.trigger.AssigneeGroup !== 0 && $scope.triggerToSend.trigger.AssigneeGroup !== null) {
                    checkAssign = true;
                }
            }

            if ($scope.actionToSend.triggerTask.Subject !== 0 && $scope.actionToSend.triggerTask.Subject !== null &&
                $scope.actionToSend.triggerTask.Text !== null && $scope.actionToSend.triggerTask.Text !== "" &&
                $scope.actionToSend.triggerTask.TaskLevel !== 0 && $scope.actionToSend.triggerTask.TaskLevel !== null && checkAssign)
                return true;
            else return false
        }

        rulesCtrl.checkNotificationToSend = () => {
            var checkAssign = false;
            if ($scope.notificationToSend.triggerTask.AssigneeSelected == 3) {
                if ($scope.notificationToSend.triggerTask.Assignee !== 0 && $scope.notificationToSend.triggerTask.Assignee !== null) {
                    checkAssign = true;
                }
            } else if ($scope.notificationToSend.triggerTask.AssigneeSelected == 4) {
                if ($scope.notificationToSend.triggerTask.AssigneeGroup !== 0 && $scope.notificationToSend.triggerTask.AssigneeGroup !== null) {
                    checkAssign = true;
                }
            }

            if ($scope.notificationToSend.triggerTask.Text !== null && $scope.notificationToSend.triggerTask.Text !== "" && checkAssign) {
                return true;
            } else {
                return false;
            }
        }
        rulesCtrl.checkServiceCallToSend = () => { 
            var checkAssign = false;
        //    if ($scope.serviceCallToSend.triggerTask.AssigneeSelected == 3) {
                if ($scope.actionToSend.triggerTask.Assignee !== 0 && $scope.actionToSend.triggerTask.Assignee !== null) {
                    checkAssign = true;
                }
           // }

            if ($scope.actionToSend.triggerTask.Text !== null && $scope.actionToSend.triggerTask.Text !== "" && checkAssign) {
                return true;
            } else {
                return false;
            }
        }

        rulesCtrl.checkMessageToSend = () => {
            if (rulesCtrl.selectedMachines.length !== 0 &&
                $scope.messageToSend.triggerTask.Text !== null && $scope.messageToSend.triggerTask.Text !== "") {
                return true;
            } else return false;
        }

        rulesCtrl.checkSelectedDay = () => {
            if ($scope.triggerToSend.trigger.IntervalType === 'weekly') {
                if ($scope.triggerToSend.trigger.DaysInWeek.length === 0)
                    return false;
                else return true;
            } else if ($scope.triggerToSend.trigger.IntervalType === 'monthly') {
                if ($scope.triggerToSend.trigger.DaysInMonth.length === 0)
                    return false;
                else return true;
            } else return true;
        }

        rulesCtrl.checkMandatoryFields = () => {
            if($scope.type === 'event' &&
                (rulesCtrl.checkActionToSend() || rulesCtrl.checkNotificationToSend() || rulesCtrl.checkMessageToSend() || rulesCtrl.checkServiceCallToSend() )){
                return true;
            }
            if ($scope.groupToSend.trigger.Name !== null &&
                $scope.triggerToSend.trigger.IntervalType !== null &&
                $scope.triggerToSend.trigger.IntervalHour !== null &&
                $scope.triggerToSend.trigger.IntervalMinute !== null &&
                (rulesCtrl.checkActionToSend() || rulesCtrl.checkNotificationToSend() || rulesCtrl.checkMessageToSend() || rulesCtrl.checkServiceCallToSend() )){
                    return true;
            }
            return false;
        }

        rulesCtrl.filterChanged = false;

        $scope.groupToEdit = {
            trigger: {
                ID: 0,
                Name: null,
                RuleText: null,
                IsActive: 1,
            }
        }

        $scope.EditIsActive = (rule, act) => {
            $scope.groupToEdit.trigger.ID = rule.TriggerGroupID;
            $scope.groupToEdit.trigger.Name = rule.TriggerGroupName;
            $scope.groupToEdit.trigger.RuleText = rule.TriggerRuleText;
            if (act === true)
                $scope.groupToEdit.trigger.IsActive = 0;
            else $scope.groupToEdit.trigger.IsActive = 1;
            LeaderMESservice.customAPI("CreateTriggerGroup", $scope.groupToEdit).then(function (response) {
                $scope.getAllTriggers();
            })
        }

        $scope.checkBoxTemplate = '<div check-box-directive ng-click="grid.appScope.EditIsActive(row.entity, !row.entity.IsActive)" field="row.entity" select-value="\'IsActive\'"></div>';

        $scope.ruleInList = `
        <div ng-if="!row.entity.StopReasonID">
            <div>{{grid.appScope.translateRuleText(row.entity.TriggerRuleText)}} 
                <span  ng-if="row.entity.IntervalType === \'weekly\'"> {{"ON"| translate}} {{grid.appScope.shortDays(row.entity.allDaysInWeek)}} </span>
                <span  ng-if="row.entity.IntervalType === \'monthly\'"> {{"ON"| translate}} {{row.entity.allDaysInMonth}} </span>
                {{"AT"|translate}} {{grid.appScope.twoDigitsTime(row.entity.IntervalHour)}}:{{grid.appScope.twoDigitsTime(row.entity.IntervalMinute)}}, 
                {{"CREATE_SMALL" | translate}} {{grid.appScope.getItemType(row.entity)}}
            </div>
        </div>
        <div ng-if="row.entity.StopReasonID">
                    <div ng-if="row.entity.NotificationType === 2">
                            <span>{{"WHEN" | translate}} {{row.entity.EventName}} {{"OCCURS_SMALL" |translate}},
                                {{"CREATE_SMALL" | translate}} {{"SERVICE_CALL" | translate}}</span>
                        </div>
                        <div ng-if="row.entity.NotificationType === 7 ">
                            <span>{{"WHEN" | translate}} {{row.entity.EventName}} {{"OCCURS_SMALL" |translate}},
                                {{"CREATE_SMALL" | translate}} {{"NOTIFICATION" | translate}}</span>
                        </div>
                        <div ng-if="row.entity.TaskModuleTriggerID">
                            <span>{{"WHEN" | translate}} {{row.entity.EventName}} {{"OCCURS_SMALL" |translate}},
                                {{"CREATE_SMALL" | translate}} {{"TASK" | translate}}</span>
                        </div>
        </div>`;

        $scope.ruleIssuer = '<div><span>{{row.entity.TaskNotificationCreateUser}}</span>' +
            '<span ng-if="row.entity.Name" ===  \'CreateATask\'">{{row.entity.sourceUserName}}</span></div>';

        $scope.editGroup = [];

        $scope.updateEventInTest = () => {
            // $scope.groups
            // rulesCtrl.EventsAndGroups
            if (rulesCtrl.EventsAndGroups && $scope.groups) {
                $scope.groups.forEach(group => {
                    group.forEach(test => {
                        if (test.StopReasonID) {
                            test.EventID = test.StopReasonID;
                            const eventGroup = _.find(rulesCtrl.EventsAndGroups, {Reasons : [{ID : test.StopReasonID}]});
                            if (eventGroup) {
                                const eventReason = _.find(eventGroup.Reasons, {ID : test.StopReasonID});
                                test.EventGroupID = eventGroup.ID;
                                if (eventReason) {
                                    test.EventName = eventReason[rulesCtrl.localLanguage ? 'LName' : 'EName'];
                                }
                            }
                        }
                    });
                })
            }
        };

        $scope.getAllTriggers = () => {

            LeaderMESservice.customGetAPI("GetAllTriggers").then(function (response) {
                $scope.tests = $filter('orderBy')(response.ResponseList, ['DayInWeek', 'DayInMonth']);
                $scope.groups = _.map(_.groupBy($scope.tests, 'TriggerGroupID'), (group) => {
                    return group;
                });
                $scope.groups = _.sortBy($scope.groups, (group) => {
                    return group[0].IsActive;
                }).reverse();

                $scope.updateEventInTest();

                const getTestText = (tests, field) => {
                    let testsText = '';
                    const length = tests.length >= 2 ? 2 : 1;
                    if (field === 'DayInWeek') {
                        for (let i = 0; i < length; i++) {
                            testsText = testsText + $scope.shortDays(tests[i][field]) + ', ';
                        }
                    } else if (field === 'DayInMonth') {
                        for (let i = 0; i < length; i++) {
                            testsText = testsText + tests[i][field] + ', ';
                        }
                    }
                    return testsText;
                };

                $scope.groupsToEdit = groupId => {
                    $scope.editGroup = [];
                    $scope.groups.forEach(group => {
                        if (group[0].TriggerGroupID === groupId) {
                            group.forEach(g => {
                                $scope.editGroup.push(g);
                            })
                        }
                    })
                    return ($scope.editGroup);
                }

                const getAllDays = (tests, field) => {
                    let testsText = '';
                    let temp = [];
                    const length = tests.length;
                    for (let i = 0; i < length; i++) {
                        temp.push(tests[i][field]);
                    }
                    temp.sort(function (a, b) {
                        return a - b;
                    });
                    if (field === 'DayInWeek') {
                        for (let i = 0; i < length; i++) {
                            testsText = testsText + $scope.shortDays(temp[i]) + ', ';
                        }

                    } else if (field === 'DayInMonth') {
                        for (let i = 0; i < length; i++) {
                            testsText = testsText + temp[i] + ', ';
                        }
                    }
                    temp = [];
                    return testsText;
                }

                $scope.tests = _.map($scope.groups, function (group) {
                    const firstTest = group[0];
                    if (firstTest.IntervalType === 'weekly') {
                        firstTest.DaysWeek = getTestText(group, 'DayInWeek');
                        firstTest.allDaysInWeek = getAllDays(group, 'DayInWeek');
                    } else if (firstTest.IntervalType == 'monthly') {
                        firstTest.DaysMonth = getTestText(group, 'DayInMonth');
                        firstTest.allDaysInMonth = getAllDays(group, 'DayInMonth');
                    }
                    return firstTest;
                });
                $scope.gridOptions = {
                    enableFiltering: true,
                    showColumnFooter: true,
                    showGridFooter: true,
                    fastWatch: true,
                    columnDefs: [{
                            name: "TriggerGroupID",
                            width: "10%",
                            headerCellClass: "text-center",
                            extraStyle: "padding=10px",
                            cellClass: "text-center",
                            cellTemplate: '<div style="width: 100%;height: 100%" ng-click="grid.appScope.getSubTasks(grid.appScope.groupsToEdit(row.entity.TriggerGroupID))">' +
                                '<div class="full-height d-flex justify-content-center align-items-center"><a>{{row.entity.TriggerGroupID}}</a></div></div>',
                            displayName: $filter("translate")("INDEX"),
                        },
                        {
                            minWidth: 200,
                            name: "TriggerGroupName",
                            headerCellClass: "text-center",
                            cellClass: "text-center",
                            displayName: $filter("translate")("TITLE"),
                        },
                        {
                            minWidth: 300,
                            name: "TriggerRuleText",
                            headerCellClass: "text-center",
                            cellClass: "text-center",
                            cellTemplate: $scope.ruleInList,
                            displayName: $filter("translate")("RULE"),
                        },
                        {
                            width: 200,
                            name: "sourceUserName",
                            headerCellClass: "text-center",
                            cellClass: "text-center",
                            cellTemplate: $scope.ruleIssuer,
                            displayName: $filter("translate")("RULE_ISSUER"),
                        },
                        {
                            width: 120,
                            name: "IsActive",
                            displayName: $filter("translate")("ACTIVE"),
                            headerCellClass: "text-center",
                            cellClass: "text-center",
                            cellTemplate: $scope.checkBoxTemplate,
                        },
                    ],
                    enableRowSelection: true,
                };
                $scope.gridOptions.data = $scope.tests;
            })

        };

        $scope.clearData = () => {
            $scope.subTasksTexts = [];
            $scope.allDays = [];
            $scope.allDaysInWeek = [];
            $scope.allDaysInMonth = [];
            rulesCtrl.selectedMachines = [];
            rulesCtrl.selectedMachinesNames = [];
            $scope.selectedMachinesNames = "";
            rulesCtrl.subDepsSelected = false;
            rulesCtrl.allSubMachinesSelected = false;
            rulesCtrl.allMachinesSelected = false;
            rulesCtrl.selectedDep = false;
            rulesCtrl.machineSelected = false;

            $scope.allMachinesInDeps.forEach(machine => {
                machine.selected = false;
            })

            $scope.allMachinesInLines.forEach(machines => {
                machines.Value.forEach(machine => {
                    machine.selected = false;
                })
            });

            $scope.allMachinesInGroups.forEach(machines => {
                machines.Value.forEach(machine => {
                    machine.selected = false;
                })
            })

            $scope.items = $filter("translate")("AN_ITEM");
            $scope.onEdit = false;
            $scope.done = false;
            $scope.groupToSend = {
                trigger: {
                    Name: null,
                    RuleText: 'Every time period',
                    IsActive: 1,
                }
            };

            $scope.triggerToSend = { //create trigger
                trigger: {
                    TriggerGroupID: null,
                    TriggerType: 0,
                    DepartmentID: 0,
                    IntervalType: null,
                    IntervalHour: 0,
                    IntervalMinute: 0,
                    EstimatedExecutionTime: 0,
                    DaysInWeek: [],
                    ID: 0,
                    DaysInMonth: [],
                    IsActive: true,
                    AssigneeGroup: 0,
        
                }
            };

            $scope.actionToSend = {
                triggerTask: {
                    TaskID: 0,
                    CreateUser: LeaderMESservice.getUserID(),
                    Subject: 0,
                    Text: null,///////CreateTriggerAction 
                    TaskLevel: 0,
                    TaskLevelObjectID: 0,
                    Priority: 2,
                    Assignee: 0,///////CreateTriggerAction 
                    AssigneeName: "",
                    AssigneeGroupName: "",
                    selectedAssignee: false,
                    estHour: 0,
                    estMin: 0,
                    SourceTaskCreationPlatform: 1,
                    AssigneeSelected: 0,
                    TaskSteps: [{
                        ID: 0,
                        Text: null,
                        isOpen: true,
                        IsActive: true,
                    }],
                }
            }

            $scope.notificationToSend = {
                notificationType: 0,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: LeaderMESservice.getUserID(),
                    Subject: 0,
                    Text: null,
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: 0,
                    AssigneeGroup: 0,
                    AssigneeName: "",
                    AssigneeGroupName: "",
                    selectedAssignee: false,
                    AssigneeSelected: 0,
                    SourceTaskCreationPlatform: 1,
                }
            }

            $scope.eventGroup = null;
            $scope.eventReason = null;
            $scope.currentAssignee = null;
            $scope.eventToSend = {
                notificationType: 2,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: LeaderMESservice.getUserID(),
                    Subject: 0,
                    Text: null,
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: 0,
                    AssigneeGroup: 0,
                    AssigneeName: "",
                    AssigneeGroupName: "",
                    selectedAssignee: false,
                    AssigneeSelected: 0,
                    SourceTaskCreationPlatform: 1,
                    EventID: 0,
                }
            }

            $scope.messageToSend = {
                notificationType: 0,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: LeaderMESservice.getUserID(),
                    Subject: 0,
                    Text: null,
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: [],
                    Assignee: 0,
                    AssigneeGroup: 0,
                    AssigneeSelected: 0,
                    SourceTaskCreationPlatform: 1,
                }
            }
        }

        $scope.allMachines = [];
        $scope.allMachinesInDeps = [];
        $scope.allMachinesInLines = [];
        $scope.allMachinesInGroups = [];

        const allMachinesPromise = LeaderMESservice.customAPI('GetDepartmentMachine', {
            "DepartmentID": 0
        });
        allMachinesPromise.then(function (response) {
            const allDepartments = _.forEach(response.DepartmentMachine, function (department) {
                department.Value = _.uniq(department.Value, "Id");
            });

            rulesCtrl.allDepartments = angular.copy(allDepartments);
            rulesCtrl.enableReleaseJobDatesAction = false;
            rulesCtrl.machinesSaveJobsGantt = [];
            rulesCtrl.allDepartments.forEach(function (department) {
                let selected = 0;
                department.Value.forEach(function (machine) {
                    $scope.allMachines.push(machine);
                    $scope.allMachinesInDeps.push(machine);
                    // machine.selected = true;
                    selected++;
                });
                // if (department.Value.length === selected) {
                // department.selected = true;
                // }
            });


            const machinesLines = _.forEach(response.DepartemntMachineLines, lineDep => {
                _.forEach(lineDep, line => {
                    line.Value = _.uniq(line.Value, "Id");
                })
            });

            rulesCtrl.machinesLines = angular.copy(machinesLines);
            rulesCtrl.machinesLines.forEach(function (department) {
                let selected = 0;
                department.selected = false;
                department.Value.forEach(function (subDep) {
                    subDep.selected = false;
                    subDep.Value.forEach(machine => {
                        machine.selected = false;
                    })
                    $scope.allMachinesInLines.push(subDep);
                    // subDep.selected = false;
                    // machine.selected = true;
                    selected++;
                });
                // if (department.Value.length === selected) {
                // department.selected = true;
                // }
            });


            const machineGroups = _.forEach(response.DepartemntMachineGroups, groupDep => {
                _.forEach(groupDep, group => {
                    group.Value = _.uniq(group.Value, "Id");
                })

            });

            rulesCtrl.machineGroups = angular.copy(machineGroups);
            rulesCtrl.machineGroups.forEach(function (department) {
                let selected = 0;
                department.selected = false;
                department.Value.forEach(function (subDep) {
                    subDep.selected = false;
                    subDep.Value.forEach(machine => {
                        machine.selected = false;
                    })
                    $scope.allMachinesInGroups.push(subDep);
                    // subDep.selected = false;
                    // machine.selected = true;
                    selected++;
                });

                // if (department.Value.length === selected) {
                //     department.selected = true;
                // }
            });

            if (rulesCtrl.machinesLines.length !== 0) {
                $scope.checkLines = true;
            } else {
                $scope.checkLines = false;
            }

            if (rulesCtrl.machineGroups.length !== 0) {
                $scope.checkGroup = true;
            } else {
                $scope.checkGroup = false;
            }

            $scope.createGroupByMachines($scope.allMachines);
        });

        rulesCtrl.subDepsSelected = false;
        rulesCtrl.allSubMachinesSelected = false;

        rulesCtrl.selectAllDepartmentsGlobal = department => {
            rulesCtrl.subDepsSelected = true;
            rulesCtrl.allSubMachinesSelected = true;
            department.Value.forEach(machine => {
                if (machine.selected != department.selected) {
                    machine.selected = department.selected;
                    rulesCtrl.selectMachine(machine);
                }
            });
        };

        rulesCtrl.selectAllMachinesInDeps = subDep => {
            rulesCtrl.allMachinesSelected = !rulesCtrl.allMachinesSelected;
            rulesCtrl.selectedDep = !rulesCtrl.selectedDep;
            subDep.forEach(machine => {
                if (rulesCtrl.selectedMachines.indexOf(machine.Id) >= 0 && rulesCtrl.allMachinesSelected) {
                    rulesCtrl.selectedMachines.splice(rulesCtrl.selectedMachines.indexOf(machine.Id), 1);
                    rulesCtrl.selectedMachinesNames.splice(rulesCtrl.selectedMachinesNames.indexOf(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName), 1);
                    machine.selected = false;
                }
                rulesCtrl.selectMachine(machine);
            })
        }

        rulesCtrl.selectAllSubDeps = subDep => {
            rulesCtrl.allMachinesSelected = !rulesCtrl.allMachinesSelected;
            subDep.Value.forEach(dep => {
                if (dep.selected === rulesCtrl.allMachinesSelected) {
                    dep.selected = !dep.selected;
                }
                rulesCtrl.selectAllInDepsMachines(dep);
            })
        }

        rulesCtrl.selectAllInDepsMachines = subDep => {
            subDep.Value.forEach(machine => {
                if (machine.selected !== subDep.selected) {
                    rulesCtrl.selectedMachines.splice(rulesCtrl.selectedMachines.indexOf(machine.Id), 1);
                    rulesCtrl.selectedMachinesNames.splice(rulesCtrl.selectedMachinesNames.indexOf(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName), 1);
                    machine.selected = !machine.selected;
                }
                rulesCtrl.selectMachine(machine);
            })
            subDep.selected = !subDep.selected;
        }


        rulesCtrl.selectAllMachinesInSubDeps = subDep => {
            subDep.selected = !subDep.selected;
            subDep.Value.forEach(machine => {
                if (machine.selected !== subDep.selected) {
                    rulesCtrl.selectedMachines.splice(rulesCtrl.selectedMachines.indexOf(machine.Id), 1);
                    rulesCtrl.selectedMachinesNames.splice(rulesCtrl.selectedMachinesNames.indexOf(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName), 1);
                    machine.selected = !machine.selected;
                }
                rulesCtrl.selectMachine(machine);
            })
        }

        rulesCtrl.selectedMachines = [];
        rulesCtrl.selectedMachinesNames = [];

        rulesCtrl.hasMachines = machines => {
            if (machines.length === 0) {
                return false;
            } else {
                return true;
            }
        }

        rulesCtrl.selectMachine = function (machine) {
            rulesCtrl.machineSelected = !rulesCtrl.machineSelected;
            if (rulesCtrl.selectedMachines.indexOf(machine.Id) >= 0) {
                rulesCtrl.selectedMachines.splice(rulesCtrl.selectedMachines.indexOf(machine.Id), 1);
                rulesCtrl.selectedMachinesNames.splice(rulesCtrl.selectedMachinesNames.indexOf(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName), 1);
                machine.selected = false;
            } else {
                rulesCtrl.selectedMachines.push(machine.Id);
                rulesCtrl.selectedMachinesNames.push(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName);
                machine.selected = true;
            }
            rulesCtrl.selectedMachines = [...rulesCtrl.selectedMachines];
            rulesCtrl.selectedMachinesNames = [...rulesCtrl.selectedMachinesNames];

            $scope.selectedMachinesNames = rulesCtrl.selectedMachinesNames.join(", ");
        };

        $scope.createGroupByMachines = function (machines) {
            $scope.groupByMachines = [{
                ID: "ID",
                EName: "MachineName",
                LName: "MachineLName",
                ENameArray: "MachineName",
                LNameArray: "MachineLName",
                IDArray: "ID",
                machinesSort: [],
                idType: 0,
                dropBoxName: $filter("translate")("DEPARTMENT"),
                UngroupedName: "MACHINES",
            }];

            // $scope.checkLines = _.some(machines, (machine) => machine.LineID && machine.LineID != -1);
            // $scope.checkGroup = _.some(machines, (machine) => machine.MachineGroupID && machine.MachineGroupID != 0);

            if ($scope.checkLines) {
                $scope.groupByMachines.push({
                    ID: "LineID",
                    EName: "LineEName",
                    LName: "LineLName",
                    ENameArray: "MachineName",
                    LNameArray: "MachineLName",
                    IDArray: "ID",
                    machinesSort: [],
                    idType: 1,
                    dropBoxName: $filter("translate")("LINE"),
                    UngroupedName: "MACHINES",
                });
            }

            if ($scope.checkGroup) {
                $scope.groupByMachines.push({
                    ID: "MachineGroupID",
                    EName: "MachineGroupName",
                    LName: "MachineGroupLName",
                    ENameArray: "MachineName",
                    LNameArray: "MachineLName",
                    IDArray: "ID",
                    machinesSort: [],
                    idType: 2,
                    dropBoxName: $filter("translate")("GROUP"),
                    UngroupedName: "MACHINES",
                });
            }


        };

        rulesCtrl.selectedMachinesGroupBy = [];
        var machinesIds = [];

        if (rulesCtrl.selectedMachinesGroupBy && rulesCtrl.selectedMachinesGroupBy.machinesSort) {
            _.forEach(rulesCtrl.selectedMachinesGroupBy.machinesSort, function (machineLine) {
                machinesIds.push(..._.map(_.filter(machineLine.array, {
                    value: true
                }), "ID"));
            });
        } else {
            var machinesIds = _.map(_.filter($scope.machines, {
                value: true
            }), "ID");
        }

        const filterUnwanted = (arr) => {
            const required = arr.filter(el => {
                return el.Text;
            });
            return required;
        };

        LeaderMESservice.customAPI("GetUsersForTask", {
            SourceTaskCreationPlatform: 1,
        }).then(function (response) {
            $scope.suggestions = response.ResponseDictionaryDT.Users;
            $scope.suggestionsAreReady = true;
        });

        // LeaderMESservice.customAPI("GetTaskLevelObjects", {
        //     SourceTaskCreationPlatform: 1
        // }).then(function (response) {
        //     $scope.suggestions2 = response.ResponseDictionaryDT.UserDefinitions;
        // });
    

        
      
      LeaderMESservice.customAPI('GetEventReasonAndGroups',{
        MachineID: 0 , // $scope.machineId,
      }).then((response) => {
        rulesCtrl.EventsAndGroups = response.EventsAndGroups;
        $scope.updateEventInTest();
      });

        LeaderMESservice.customAPI("GetTaskLevelObjects", {
            SourceTaskCreationPlatform: 1
        }).then(function (response) {
            $scope.taskLevelObjects = response["ResponseDictionaryDT"];
        });

        LeaderMESservice.customAPI("GetAllTechnicians", {}).then(function (res) {
              $scope.techniciansNames = angular.copy(res["AllTechnicians"]);
            });

        $scope.allSubjects = [];
        LeaderMESservice.customAPI("GetTaskObjects", {}).then(function (response) {
            $scope.allSubjects = response.ResponseDictionaryDT.Subjects;
            $scope.allSubjects = $scope.allSubjects.filter(subj => {
                return subj.IsActive;
            })
        });

        rulesCtrl.suggestionsAreVisibleM1 = false;
        rulesCtrl.suggestionsAreVisibleM2 = false;
        rulesCtrl.suggestionsAreVisibleM3 = false;
        rulesCtrl.suggestionsAreVisibleM4 = false;
        rulesCtrl.suggestionsAreVisible1 = false;
        rulesCtrl.suggestionsAreVisible2 = false;
        rulesCtrl.taskLevelNotObjects = $scope.taskLevelObjects;

        rulesCtrl.filterItems = flag => {
            if ($scope.suggestionsAreReady) {
                if (flag) {
                    rulesCtrl.suggestionsAreVisibleM1 = true;
                    rulesCtrl.suggestionsAreVisibleM2 = true;
                    rulesCtrl.suggestionsAreVisibleM3 = true;
                    rulesCtrl.suggestionsAreVisibleM4 = true;
                } else {
                    rulesCtrl.suggestionsAreVisible1 = true;
                    rulesCtrl.suggestionsAreVisible2 = true;
                }
                if (($scope.actionToSend.triggerTask["AssigneeName"] == "") && ($scope.actionToSend.triggerTask.AssigneeSelected == 1)) {
                    rulesCtrl.filteredSuggestions = $scope.suggestions;

                } else if (($scope.actionToSend.triggerTask["AssigneeName"] !== "") && ($scope.actionToSend.triggerTask.AssigneeSelected == 1)) {
                    rulesCtrl.filteredSuggestions = $scope.querySearch($scope.actionToSend.triggerTask["AssigneeName"]);
                }

                if (($scope.actionToSend.triggerTask["AssigneeGroupName"] == "") && ($scope.actionToSend.triggerTask.AssigneeSelected == 2)) {
                    rulesCtrl.usersFilter = $scope.taskLevelObjects['UserDefinitions'];;

                } else if (($scope.actionToSend.triggerTask["AssigneeGroupName"] !== "") && ($scope.actionToSend.triggerTask.AssigneeSelected == 2)) {
                    rulesCtrl.usersFilter = $scope.queryGroupSearch($scope.actionToSend.triggerTask["AssigneeGroupName"]);
                }

                if (($scope.notificationToSend.triggerTask["AssigneeName"] == "") && ($scope.notificationToSend.triggerTask.AssigneeSelected == 3)) {
                    rulesCtrl.filteredNotSuggestions = $scope.suggestions;
                } else if (($scope.notificationToSend.triggerTask["AssigneeName"] !== "") && ($scope.notificationToSend.triggerTask.AssigneeSelected == 3)) {
                    rulesCtrl.filteredNotSuggestions = $scope.querySearch($scope.notificationToSend.triggerTask["AssigneeName"]);
                }

                if (($scope.notificationToSend.triggerTask["AssigneeGroupName"] == "") && ($scope.notificationToSend.triggerTask.AssigneeSelected == 4)) {
                    rulesCtrl.filteredUsers = $scope.taskLevelObjects['UserDefinitions'];
                } else if (($scope.notificationToSend.triggerTask["AssigneeGroupName"] !== "") && ($scope.notificationToSend.triggerTask.AssigneeSelected == 4)) {
                    rulesCtrl.filteredUsers = $scope.queryGroupSearch($scope.notificationToSend.triggerTask["AssigneeGroupName"]);
                }

                if (($scope.serviceCallToSend.triggerTask["AssigneeName"] == "") && ($scope.serviceCallToSend.triggerTask.AssigneeSelected == 3)) {
                    rulesCtrl.filteredNotSuggestions = $scope.suggestions;
                } else if (($scope.serviceCallToSend.triggerTask["AssigneeName"] !== "") && ($scope.serviceCallToSend.triggerTask.AssigneeSelected == 3)) {
                    rulesCtrl.filteredNotSuggestions = $scope.querySearch($scope.serviceCallToSend.triggerTask["AssigneeName"]);
                }
            }
        };

        $scope.querySearch = function (query) {
            return query ? $scope.suggestions.filter($scope.createFilterFor(query)) : [];
        };

        $scope.queryGroupSearch = function (query) {
            return query ? $scope.taskLevelObjects.UserDefinitions.filter($scope.createFilterFor(query)) : [];
        };

        $scope.createFilterFor = function (query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(item) {
                // Check if the given item matches for the given query
                if ($scope.actionToSend.triggerTask.AssigneeSelected == 1 || $scope.notificationToSend.triggerTask.AssigneeSelected == 3 || $scope.serviceCallToSend.triggerTask.AssigneeSelected == 3) { 
                    return item.DisplayName && angular.lowercase(item.DisplayName).indexOf(lowercaseQuery) >= 0;
                } else {
                    return item.EName && angular.lowercase(item.EName).indexOf(lowercaseQuery) >= 0;
                }
            };
        };

        rulesCtrl.selectAssignee = function (assigneeID, assigneeDisplayName, isMiddle) {
            if ($scope.actionToSend.triggerTask.AssigneeSelected == 1) {
                $scope.actionToSend.triggerTask["Assignee"] = assigneeID;
                $scope.triggerToSend.trigger["AssigneeGroup"] = 0;
                $scope.actionToSend.triggerTask["AssigneeName"] = assigneeDisplayName;
            } else if ($scope.actionToSend.triggerTask.AssigneeSelected == 2) {
                $scope.triggerToSend.trigger["AssigneeGroup"] = assigneeID;
                $scope.actionToSend.triggerTask["Assignee"] = 0;
                $scope.actionToSend.triggerTask["AssigneeGroupName"] = assigneeDisplayName;
            }

            if ($scope.notificationToSend.triggerTask.AssigneeSelected == 3) {
                $scope.notificationToSend.triggerTask["Assignee"] = assigneeID;
                $scope.notificationToSend.triggerTask["AssigneeGroup"] = 0;
                $scope.notificationToSend.triggerTask["AssigneeName"] = assigneeDisplayName;
            } else if ($scope.notificationToSend.triggerTask.AssigneeSelected == 4) {
                $scope.notificationToSend.triggerTask["AssigneeGroup"] = assigneeID;
                $scope.notificationToSend.triggerTask["Assignee"] = 0;
                $scope.notificationToSend.triggerTask["AssigneeGroupName"] = assigneeDisplayName;
            }

            if ($scope.serviceCallToSend.triggerTask.AssigneeSelected == 3) { 
                $scope.serviceCallToSend.triggerTask["Assignee"] = assigneeID;
                $scope.serviceCallToSend.triggerTask["AssigneeGroup"] = 0;
                $scope.serviceCallToSend.triggerTask["AssigneeName"] = assigneeDisplayName;
            }

            if (isMiddle) {
                $("#newTaskAssigneeMiddle").val(assigneeDisplayName);
                rulesCtrl.suggestionsAreVisibleM1 = false;
                rulesCtrl.suggestionsAreVisibleM2 = false;
                rulesCtrl.suggestionsAreVisibleM3 = false;
                rulesCtrl.suggestionsAreVisibleM4 = false;
                $scope.actionToSend.triggerTask["selectedAssignee"] = true;
                $scope.notificationToSend.triggerTask["selectedAssignee"] = true;
            } else {
                $("#newTaskAssignee").val(assigneeDisplayName);
                rulesCtrl.suggestionsAreVisible1 = false;
                rulesCtrl.suggestionsAreVisible2 = false;
            }
            $scope.actionToSend.triggerTask["selectedAssignee"] = true;
            $scope.notificationToSend.triggerTask["selectedAssignee"] = true;

        };



        let temp = [];
        $scope.CreateARule = () => {
            if ($scope.type === 'event') {
                $scope.groupToSend.RuleText = 'When an event';
            }
            LeaderMESservice.customAPI("CreateTriggerGroup", $scope.groupToSend, ).then(function (response) {
                if ($scope.triggerToSend.trigger.TriggerGroupID == null)
                    $scope.triggerToSend.trigger.TriggerGroupID = response.LeaderRecordID;
               
                const promises = [];
                if ($scope.triggerToSend.trigger.IntervalType == "weekly") {

                    if ($scope.orignialData) {
                        temp = [];
                        $scope.orignialData.forEach(d => {
                            temp.push(d.DayInWeek);
                            $scope.triggerToSend.trigger.DaysInWeek.push(d.DayInWeek);
                        })
                        $scope.triggerToSend.trigger.DaysInWeek = $scope.triggerToSend.trigger.DaysInWeek.filter((item, pos) => {
                            return $scope.triggerToSend.trigger.DaysInWeek.indexOf(item) == pos;
                        })
                    } else {
                        $scope.triggerToSend.trigger.DaysInWeek = $scope.triggerToSend.trigger.DaysInWeek.filter(x => !temp.includes(x));
                    }
                    $scope.triggerToSend.trigger.DaysInWeek.forEach(day => {
                        if (day !== 0) {
                            const triggerToSend = angular.copy($scope.triggerToSend);
                            triggerToSend.trigger.DayInWeek = day;
                            promises.push(LeaderMESservice.customAPI("CreateTrigger", triggerToSend));
                        }
                    });
                } else if ($scope.triggerToSend.trigger.IntervalType == "monthly") {

                    if ($scope.orignialData) {
                        temp = [];
                        $scope.orignialData.forEach(d => {
                            temp.push(d.DayInMonth);
                        })
                        $scope.triggerToSend.trigger.DaysInMonth = $scope.triggerToSend.trigger.DaysInMonth.filter((item, pos) => {
                            return $scope.triggerToSend.trigger.DaysInMonth.indexOf(item) == pos;
                        })
                    } else {
                        $scope.triggerToSend.trigger.DaysInMonth = $scope.triggerToSend.trigger.DaysInMonth.filter(x => !temp.includes(x));
                    }

                    $scope.triggerToSend.trigger.DaysInMonth.forEach(dayInMonth => {
                        const triggerToSend = angular.copy($scope.triggerToSend);
                        triggerToSend.trigger.DayInMonth = dayInMonth;
                        promises.push(LeaderMESservice.customAPI("CreateTrigger", triggerToSend));
                    });
                } else {
                    if (!$scope.editMode || $scope.type !== 'event'){
                        promises.push(LeaderMESservice.customAPI("CreateTrigger", $scope.triggerToSend));
                    }
                }
                
                Promise.all(promises).then(function (triggersData) {
                    const taskPromises = [];
                    if ($scope.type === 'event'){
                        if ($scope.eventSubType === 'task') {
                            const actionToSend = angular.copy($scope.actionToSend);
                            actionToSend.triggerTask.EstimatedExecutionTime = Number(actionToSend.triggerTask.estHour * 60) + Number(actionToSend.triggerTask.estMin);
                            if (!$scope.editMode){
                                actionToSend.triggerTask.TaskID = triggersData[0].LeaderRecordID;
                            }
                            else {
                                actionToSend.triggerTask.TaskID = $scope.eventToSend.triggerTask.TaskID;
                                actionToSend.triggerTask.ID = $scope.eventToSend.triggerTask.ActionID;
                            }
                            actionToSend.triggerTask.EventID = $scope.eventToSend.triggerTask.EventID;

                            $scope.subTasksTexts.forEach(t => {
                                var obj = {
                                    Text: t,
                                    ID: 0,
                                    isOpen: true,
                                    IsActive: true,
                                }
                                actionToSend.triggerTask.TaskSteps.push(obj);
                            })
                            actionToSend.triggerTask.TaskSteps = filterUnwanted(actionToSend.triggerTask.TaskSteps);
                            taskPromises.push(LeaderMESservice.customAPI("CreateTriggerAction", actionToSend));
                        }
                        else{
                            const event = $scope.eventSubType === 'notification' ? $scope.notificationToSend : $scope.eventToSend;
                            const eventToSend = angular.copy(event);
                            eventToSend.triggerTask.EventID = $scope.eventToSend.triggerTask.EventID;
                            if (!$scope.editMode){
                                eventToSend.triggerTask.TaskID = triggersData[0].LeaderRecordID;
                            }
                            else {
                                eventToSend.triggerTask.ID = $scope.eventToSend.triggerTask.ID || 0;
                                eventToSend.triggerTask.TaskID = $scope.eventToSend.triggerTask.TaskID;
                            }
                            taskPromises.push(LeaderMESservice.customAPI("CreateTriggerNotificationAction", eventToSend));
                        }
                    }
                    else{
                        triggersData.forEach(triggerData => {

                            if ($scope.triggerToSend.trigger.TriggerType === 1) {
                                const actionToSend = angular.copy($scope.actionToSend);
                                actionToSend.triggerTask.EstimatedExecutionTime = Number(actionToSend.triggerTask.estHour * 60) + Number(actionToSend.triggerTask.estMin);
                                actionToSend.triggerTask.TaskID = triggerData.LeaderRecordID;
                                $scope.subTasksTexts.forEach(t => {
                                    var obj = {
                                        Text: t,
                                        ID: 0,
                                        isOpen: true,
                                        IsActive: true,
                                    }
                                    actionToSend.triggerTask.TaskSteps.push(obj);
                                })
                                actionToSend.triggerTask.TaskSteps = filterUnwanted(actionToSend.triggerTask.TaskSteps);
                                taskPromises.push(LeaderMESservice.customAPI("CreateTriggerAction", actionToSend));
                            } else if ($scope.triggerToSend.trigger.TriggerType === 2 && $scope.notificationToSend.notificationType === 7) {
                                const notificationToSend = angular.copy($scope.notificationToSend);
                                notificationToSend.triggerTask.TaskID = triggerData.LeaderRecordID;
                                taskPromises.push(LeaderMESservice.customAPI("CreateTriggerNotificationAction", notificationToSend));
                            } else if ($scope.triggerToSend.trigger.TriggerType === 2 && $scope.messageToSend.notificationType === 1) {
                                const messageToSend = angular.copy($scope.messageToSend);
                                messageToSend.triggerTask.TaskID = triggerData.LeaderRecordID;
                                messageToSend.triggerTask.MachineArray = rulesCtrl.selectedMachines.toString();
                                taskPromises.push(LeaderMESservice.customAPI("CreateTriggerNotificationAction", messageToSend));
                            }
                        });
                    }

                    Promise.all(taskPromises).then(response => {
                        if ($scope.onEdit) {
                            $scope.clearOldDataOnEdit();
                        } else {
                            $scope.getAllTriggers();
                            $scope.clearData();
                        }

                    });
                });
            });
        };

        $scope.groupToDelete = {
            trigger: {
                ID: 0,
                TriggerType: 0
            }
        }
        var triggerIds = [];

        $scope.deleteTrigger = group => {
            group.forEach(g => {
                $scope.groupToDelete = {
                    trigger: {
                        ID: g.TriggerID,
                        TriggerType: g.Name === 'CreateATask' ? 1 : 2,
                    }
                }
                LeaderMESservice.customAPI("DeleteTrigger", $scope.groupToDelete).then(function (response) {
                    $scope.getAllTriggers();
                })
            })
        }

        var tasksteps = [];
        var assigneeNameSelected = "";
        var assigneeGroupNameSelected = "";

        $scope.openEditRuleEvent = event => {
            $scope.editMode = true;
            event.editMode = true;
            $scope.groupToSend = {
                trigger: {
                    ID: event.TriggerGroupID,
                    Name: event.TriggerGroupName,
                    RuleText: event.TriggerRuleText,
                    IsActive: 1,
                }
            };
            $scope.currentAssignee = _.find($scope.techniciansNames,{ID: event.TaskNotificationAssignee});
            $scope.eventGroup = _.find(rulesCtrl.EventsAndGroups,{ID : event.EventGroupID});
            if ($scope.eventGroup){
                $scope.eventReason = _.find($scope.eventGroup.Reasons,{ID : event.EventID});
            }
            if (event.Assignee || event.AssigneeGroup) {
                assigneeGroupNameSelected = $scope.actionToSend.triggerTask.AssigneeGroupName;
            } else {
                assigneeNameSelected = $scope.notificationToSend.triggerTask.AssigneeName;
                assigneeGroupNameSelected = $scope.notificationToSend.triggerTask.AssigneeGroupName;
                assigneeNameSelected = $scope.serviceCallToSend.triggerTask.AssigneeName;
            }
            $scope.currentSubTasksToDisplay = [];
            // LeaderMESservice.customAPI("GetTriggerTaskStep", {
            //     TriggerID: event.TriggerID,
            // }).then(function (response) {

            //     $scope.currentSubTasksToDisplay = angular.copy(response.ResponseList);
            //     $scope.currentSubTasksToDisplay.forEach(t => {
            //         $scope.subTasksTexts.push(t.Text);
            //         var obj = {
            //             ID: t.ID,
            //             Text: t.Text,
            //             isOpen: t.IsOpen,
            //             IsActive: false,
            //         }

            //         var subtasksToDelete = {
            //             ID: t.ID,
            //             Text: t.Text,
            //             isOpen: t.IsOpen,
            //             IsActive: false,
            //         }

            //         $scope.subTasksOnEdit.push(obj);
            //         $scope.deleteSubTasks.push(subtasksToDelete);
            //     })
            //     $scope.actionToSend.triggerTask.TaskSteps = filterUnwanted($scope.subTasksOnEdit);
            //     tasksteps = $scope.actionToSend.triggerTask.TaskSteps;
            //     $scope.tasksToDelete = filterUnwanted($scope.deleteSubTasks);
            // });
            $scope.eventToSend = {
                notificationType: 2,
                triggerTask: {
                    TaskID: event.TriggerID,
                    ID : event.TaskNotificationID,
                    ActionID: event.ID || 0,
                    CreateUser: event.TaskNotificationCreateUserID || event.CreateUser,
                    Subject: 0,
                    Text: event.TaskNotificationText,
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: event.TaskNotificationAssignee,
                    AssigneeGroup: 0,
                    AssigneeName: $scope.currentAssignee && (rulesCtrl.localLanguage ? $scope.currentAssignee.DisplayHName : $scope.currentAssignee.DisplayName) || '',
                    AssigneeGroupName: null,
                    selectedAssignee: true,
                    AssigneeSelected: null,
                    SourceTaskCreationPlatform: event.NotificationSourceTaskCreationPlatform || event.SourceTaskCreationPlatform || 1,
                    EventID: event.EventID,
                    EventName: event.EventName,
                    EventGroupID: event.EventGroupID,
                }
            }

            $scope.actionToSend = {
                triggerTask: {
                    TaskID: 0,
                    CreateUser: event.CreateUser || event.TaskNotificationCreateUserID,
                    Subject: event.Subject,
                    Text: event.Text,
                    TaskLevel: event.TaskLevel,
                    TaskLevelObjectID: event.TaskLevelObjectID || 0,
                    Priority: event.Priority || 2,
                    Assignee: event.Assignee,
                    AssigneeName: event.TargetUserName,
                    AssigneeGroupName: assigneeGroupNameSelected,
                    selectedAssignee: true,
                    AssigneeSelected: event.Assignee == 0 ? 2 : 1,
                    estHour: Math.floor(event.EstimatedExecutionTime / 60),
                    estMin: event.EstimatedExecutionTime % 60,
                    SourceTaskCreationPlatform: event.SourceTaskCreationPlatform || event.NotificationSourceTaskCreationPlatform || 1,
                    TaskSteps: [],
                }
            }

            $scope.notificationToSend = {
                notificationType: 7,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: event.TaskNotificationCreateUserID || event.CreateUser,
                    Subject: 0,
                    Text: event.NotificationType === 7 ? event.TaskNotificationText : "",
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: event.TaskNotificationAssignee,
                    AssigneeGroup: event.NotificationAssigneeGroup,
                    AssigneeName: assigneeNameSelected,
                    AssigneeGroupName: assigneeGroupNameSelected,
                    selectedAssignee: true,
                    AssigneeSelected: event.NotificationAssigneeGroup ? 4 : 3,
                    SourceTaskCreationPlatform: event.NotificationSourceTaskCreationPlatform || event.SourceTaskCreationPlatform || 1,
                }
            }
            $scope.items = $scope.getItemType(event);
            $scope.openNewEventRuleWindow();
        };             

        $scope.tasksToDelete = [];
        $scope.getSubTasks = rule => {
            if (rule[0].StopReasonID){
                $scope.openEditRuleEvent(rule[0]);
                return;
            }
            $scope.onEdit = true;
            $scope.subTasksTexts = [];
            $scope.orignial = angular.copy(rule);
            $scope.oldData = angular.copy(rule);
            $scope.subTasksOnEdit = [{
                ID: 0,
                Text: null,
                isOpen: true,
                IsActive: true,
            }];
            $scope.deleteSubTasks = [{
                ID: 0,
                Text: null,
                isOpen: true,
                IsActive: false,
            }];

            var subTasks = [];
            LeaderMESservice.customAPI("GetTriggerTaskStep", {
                TriggerID: rule[0].TriggerID,
            }).then(function (response) {

                $scope.currentSubTasksToDisplay = angular.copy(response.ResponseList);
                $scope.currentSubTasksToDisplay.forEach(t => {
                    $scope.subTasksTexts.push(t.Text);
                    var obj = {
                        ID: t.ID,
                        Text: t.Text,
                        isOpen: t.IsOpen,
                        IsActive: false,
                    }

                    var subtasksToDelete = {
                        ID: t.ID,
                        Text: t.Text,
                        isOpen: t.IsOpen,
                        IsActive: false,
                    }

                    $scope.subTasksOnEdit.push(obj);
                    $scope.deleteSubTasks.push(subtasksToDelete);
                })
                $scope.actionToSend.triggerTask.TaskSteps = filterUnwanted($scope.subTasksOnEdit);
                tasksteps = $scope.actionToSend.triggerTask.TaskSteps;
                $scope.tasksToDelete = filterUnwanted($scope.deleteSubTasks)
            });

            if (rule[0].TaskNotificationAssignee) {
                $scope.suggestions.forEach(sugg => {
                    if (sugg.ID == rule[0].TaskNotificationAssignee) {
                        $scope.notificationToSend.triggerTask.AssigneeName = sugg.DisplayName;
                    }
                    if (sugg.ID == rule[0].TaskNotificationAssignee) { 
                        $scope.serviceCallToSend.triggerTask.AssigneeName = sugg.DisplayName;
                    }
                })
            } else if (rule[0].AssigneeGroup || rule[0].NotificationAssigneeGroup) {
                $scope.taskLevelObjects.UserDefinitions.forEach(sugg => {
                    if (sugg.ID == rule[0].AssigneeGroup || sugg.ID == rule[0].NotificationAssigneeGroup) {
                        $scope.actionToSend.triggerTask.AssigneeGroupName = sugg.HName;
                        $scope.notificationToSend.triggerTask.AssigneeGroupName = sugg.HName;
                    }
                })
            }
            if (rule[0].Assignee || rule[0].AssigneeGroup) {
                assigneeGroupNameSelected = $scope.actionToSend.triggerTask.AssigneeGroupName;
            } else {
                assigneeNameSelected = $scope.notificationToSend.triggerTask.AssigneeName;
                assigneeGroupNameSelected = $scope.notificationToSend.triggerTask.AssigneeGroupName;
                assigneeNameSelected = $scope.serviceCallToSend.triggerTask.AssigneeName;
            }

            $scope.createNewRules(rule, tasksteps, assigneeNameSelected, assigneeGroupNameSelected);
        }


        $scope.editTriggersIds = [];
        $scope.allDaysInWeek = [];
        $scope.allDaysInMonth = [];
        $scope.allDays = [];

        $scope.getItemType = item => {
            if (item.Name === 'CreateATask') {
                item = $filter("translate")("A_TASK");
            } else if (item.NotificationType === 7) {
                item = $filter("translate")("A_NOTIFICATION");
            } else if (item.NotificationType === 1) {
                item = $filter("translate")("A_MESSAGE");
            }
            else if (item.NotificationType === 2) {
                item = $filter("translate")("A_SERVICE_CALL");
            }
            return item;
        }

        $scope.createNewRules = (rule, tasksteps, assigneeNameSelected, assigneeGroupNameSelected) => {
            $scope.allDaysInWeek = [];
            $scope.allDaysInMonth = [];
            $scope.allDays = [];
            rulesCtrl.selectedMachinesNames = [];
            rulesCtrl.selectedMachines = [];
            $scope.selectedMachinesNames = [];

            $scope.items = $scope.getItemType(rule[0]);
            $scope.orignialData = angular.copy(rule);

            rulesCtrl.selectedMachines = rule[0]?.MachineArray?.split(",") || [];

            rulesCtrl.selectedMachines.forEach(m => {
                $scope.allMachinesInDeps.forEach(machine => {
                    if (m == machine.Id) {
                        machine.selected = true;
                        rulesCtrl.selectedMachinesNames.push(rulesCtrl.localLanguage ? machine.MachineLName : machine.MachineName);
                    }
                })

                $scope.allMachinesInLines.forEach(machines => {
                    machines.Value.forEach(machine => {
                        if (m == machine.Id) {
                            machine.selected = true;
                        }
                    })
                })

                $scope.allMachinesInGroups.forEach(machines => {
                    machines.Value.forEach(machine => {
                        if (m == machine.Id) {
                            machine.selected = true;
                        }
                    })
                })
            })

            $scope.selectedMachinesNames = rulesCtrl.selectedMachinesNames.join(", ");

            // Create new rules
            $scope.groupToSend = {
                trigger: {
                    ID: rule[0].TriggerGroupID,
                    Name: rule[0].TriggerGroupName,
                    RuleText: rule[0].TriggerRuleText,
                    IsActive: 1,
                }
            };

            $scope.triggerToSend = {
                trigger: {
                    TriggerGroupID: rule[0].TriggerGroupID,
                    TriggerType: rule[0].Name === 'CreateATask' ? 1 : 2,
                    DepartmentID: 0,
                    IntervalType: rule[0].IntervalType,
                    IntervalHour: rule[0].IntervalHour,
                    IntervalMinute: rule[0].IntervalMinute,
                    EstimatedExecutionTime: rule[0].EstimatedExecutionTime,
                    DaysInWeek: $scope.allDaysInWeek,
                    ID: 0,
                    DaysInMonth: $scope.allDaysInMonth,
                    IsActive: true,
                    AssigneeGroup: rule[0].AssigneeGroup,
                }
            };

            $scope.actionToSend = {
                triggerTask: {
                    TaskID: 0,
                    CreateUser: rule[0].CreateUser || rule[0].TaskNotificationCreateUserID,
                    Subject: rule[0].Subject,
                    Text: rule[0].Text,
                    TaskLevel: rule[0].TaskLevel,
                    TaskLevelObjectID: rule[0].TaskLevelObjectID || 0,
                    Priority: rule[0].Priority || 2,
                    Assignee: rule[0].Assignee,
                    AssigneeName: rule[0].TargetUserName,
                    AssigneeGroupName: assigneeGroupNameSelected,
                    selectedAssignee: true,
                    AssigneeSelected: rule[0].Assignee == 0 ? 2 : 1,
                    estHour: Math.floor(rule[0].EstimatedExecutionTime / 60),
                    estMin: rule[0].EstimatedExecutionTime % 60,
                    SourceTaskCreationPlatform: rule[0].SourceTaskCreationPlatform || rule[0].NotificationSourceTaskCreationPlatform,
                    TaskSteps: tasksteps,
                }
            }

            $scope.messageToSend = {
                notificationType: rule[0].NotificationType === 1 ? 1 : 0,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: rule[0].TaskNotificationCreateUserID || rule[0].CreateUser,
                    Subject: 0,
                    Text: rule[0].NotificationType === 1 ? rule[0].TaskNotificationText : "",
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: rule[0].MachineArray,
                    Assignee: 0,
                    AssigneeGroup: 0,
                    AssigneeSelected: 0,
                    SourceTaskCreationPlatform: rule[0].NotificationSourceTaskCreationPlatform || rule[0].SourceTaskCreationPlatform,
                }
            }

            $scope.notificationToSend = {
                notificationType: rule[0].NotificationType === 7 ? 7 : 0,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: rule[0].TaskNotificationCreateUserID || rule[0].CreateUser,
                    Subject: 0,
                    Text: rule[0].NotificationType === 7 ? rule[0].TaskNotificationText : "",
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: rule[0].TaskNotificationAssignee,
                    AssigneeGroup: rule[0].NotificationAssigneeGroup,
                    AssigneeName: assigneeNameSelected,
                    AssigneeGroupName: assigneeGroupNameSelected,
                    selectedAssignee: true,
                    AssigneeSelected: rule[0].NotificationAssigneeGroup ? 4 : 3,
                    SourceTaskCreationPlatform: rule[0].NotificationSourceTaskCreationPlatform || rule[0].SourceTaskCreationPlatform,
                }
            }

            $scope.eventToSend = {
                notificationType: 2,
                triggerTask: {
                    TaskID: 0,
                    CreateUser: rule[0].TaskNotificationCreateUserID || rule[0].CreateUser,
                    Subject: 0,
                    Text: rule[0].NotificationType === 2 ? rule[0].TaskNotificationText : "",
                    MachineID: 0,
                    TaskLevelObjectID: 0,
                    Priority: 0,
                    MachineArray: "",
                    Assignee: rule[0].TaskNotificationAssignee,
                    AssigneeGroup: rule[0].NotificationAssigneeGroup,
                    AssigneeName: assigneeNameSelected,
                    AssigneeGroupName: assigneeGroupNameSelected,
                    selectedAssignee: true,
                    AssigneeSelected: rule[0].NotificationAssigneeGroup ? 4 : 3,
                    SourceTaskCreationPlatform: rule[0].NotificationSourceTaskCreationPlatform || rule[0].SourceTaskCreationPlatform,
                }
            }

            $scope.orignialData.forEach(r => {
                if (r.IntervalType == "weekly") {
                    $scope.allDaysInWeek.push(r.DayInWeek);
                    $scope.allDays.push(rulesCtrl.switchDayToText(r.DayInWeek));
                } else if (r.IntervalType == "monthly") {
                    $scope.allDaysInMonth.push(r.DayInMonth);
                }
            });

            $scope.openEditRuleWindow(rule);
        }


        $scope.clearOldDataOnEdit = () => {
            $scope.clearData();
            $scope.orignialData2 = angular.copy($scope.oldData);

            // Deactivate the current rules
            $scope.oldData.forEach(d => {
                $scope.triggerToSendonEdit = {
                    trigger: {
                        TriggerGroupID: d.TriggerGroupID,
                        TriggerType: d.Name === 'CreateATask' ? 1 : 2,
                        DepartmentID: 0,
                        IntervalType: d.IntervalType,
                        IntervalHour: d.IntervalHour,
                        IntervalMinute: d.IntervalMinute,
                        EstimatedExecutionTime: d.EstimatedExecutionTime,
                        DaysInWeek: [],
                        ID: d.TriggerID,
                        DaysInMonth: [],
                        IsActive: false,
                        AssigneeGroup: d.AssigneeGroup,
                    }
                };

                LeaderMESservice.customAPI("CreateTrigger", $scope.triggerToSendonEdit).then(response => {
                    $scope.done = true;
                    $scope.getAllTriggers();
                    $scope.clearData();
                });
            })

        }

        $scope.getAllTriggers();

        $scope.updateRuleView = function (view) {
            $scope.view = view;
        };

        $scope.allDays = [];
        rulesCtrl.changeWeekDay = day => {
            if ($scope.triggerToSend.trigger.DaysInWeek.indexOf(day) >= 0) {
                $scope.triggerToSend.trigger.DaysInWeek.splice($scope.triggerToSend.trigger.DaysInWeek.indexOf(day), 1);
                $scope.allDays.splice($scope.triggerToSend.trigger.DaysInWeek.indexOf(day), 1);
            } else {
                $scope.triggerToSend.trigger.DaysInWeek.push(day);
                $scope.allDays.push(rulesCtrl.switchDayToText(day));
            }
            $scope.triggerToSend.trigger.DaysInWeek.sort(function (a, b) {
                return a - b;
            });

            $scope.allDays.sort(function sortByDay(a, b) {
                return sorter[a] - sorter[b];
            });
            $scope.allDaystoString = $scope.allDays.join(", ");
        };

        $scope.daysInRule = [];

        const sorter = {
            "Sunday": 1,
            "Monday": 2,
            "Tuesday": 3,
            "Wednesday": 4,
            "Thursday": 5,
            "Friday": 6,
            "Saturday": 7
        }

        rulesCtrl.switchDayToText = day => {
            switch (day) {
                case 1:
                    day = $filter("translate")("SUNDAY");
                    break;
                case 2:
                    day = $filter("translate")("MONDAY");
                    break;
                case 3:
                    day = $filter("translate")("TUESDAY");
                    break;
                case 4:
                    day = $filter("translate")("WEDNESDAY");
                    break;
                case 5:
                    day = $filter("translate")("THURSDAY");
                    break;
                case 6:
                    day = $filter("translate")("FRIDAY");
                    break;
                case 7:
                    day = $filter("translate")("SATURDAY");
                    break;
            }
            return day;
        }

        $scope.shortDays = day => {
            switch (day) {
                case 1:
                    day = $filter("translate")("SUNDAY_SHORT");
                    break;
                case 2:
                    day = $filter("translate")("MONDAY_SHORT");
                    break;
                case 3:
                    day = $filter("translate")("TUESDAY_SHORT");
                    break;
                case 4:
                    day = $filter("translate")("WEDNESDAY_SHORT");
                    break;
                case 5:
                    day = $filter("translate")("THURSDAY_SHORT");
                    break;
                case 6:
                    day = $filter("translate")("FRIDAY_SHORT");
                    break;
                case 7:
                    day = $filter("translate")("SATURDAY_SHORT");
                    break;
            }
            return day;
        }

        $scope.switchItem = ruleType => {
            switch (ruleType) {
                case null:
                    ruleType = $filter("translate")("A_TASK");
                    break;
                case 7:
                    ruleType = $filter("translate")("A_NOTIFICATION");
                    break;
                case 1:
                    ruleType = $filter("translate")("A_MESSAGE");
                    break;
            }
            return ruleType;
        }

        $scope.translateRuleText = text => {
            switch (text) {
                case "Every day":
                    text = $filter("translate")("EVERY_DAY");
                    break;
                case "Every week":
                    text = $filter("translate")("EVERY_WEEK");
                    break;
                case "Every month":
                    text = $filter("translate")("EVERY_MONTH");
                    break;
            }
            return text;
        }

        rulesCtrl.changeMonthDay = dayInMonth => {
            if ($scope.triggerToSend.trigger.DaysInMonth.indexOf(dayInMonth) >= 0) {
                $scope.triggerToSend.trigger.DaysInMonth.splice($scope.triggerToSend.trigger.DaysInMonth.indexOf(dayInMonth), 1);
            } else {
                $scope.triggerToSend.trigger.DaysInMonth.push(dayInMonth);
            }
            $scope.triggerToSend.trigger.DaysInMonth.sort(function (a, b) {
                return a - b;
            });
        }

    };

    return {
        transclude: true,
        restrict: "EA",
        templateUrl: template,
        scope: {},
        controller: controller,
        controllerAs: "rulesCtrl",
    };
}
angular.module("LeaderMESfe").directive("rules", rules);