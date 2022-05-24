
function editTaskModalCtrl($scope, $sessionStorage,Upload,BASE_URL,AuthService, LeaderMESservice, notify, rtl, taskToEdit, suggestions,$filter,$timeout,tasksData) {
    var mainCtrl = this;
    mainCtrl.userAuth = $sessionStorage.userAuthenticated;
    $scope.tasksPermissionLevel = $sessionStorage.tasksPermissionLevel;
    $scope.tasksData=tasksData;
    // $scope.tasksPermissionLevel = 0;
    $scope.userID = LeaderMESservice.getUserID();
    $scope.taskToEdit = taskToEdit;
    $scope.settings={saveEditTaskDisabled:false}

    notify.config({ duration: 2000 });
    switch ($scope.tasksPermissionLevel) {
        case 0:
            $scope.suggestions = suggestions.filter((suggestion) => suggestion.ID == $scope.userID);
            break;
        // case 1:
        //     if ($scope.taskToEdit['TaskStatus'] == 1)
        //         $scope.suggestions = suggestions.filter((suggestion) => suggestion.ID == $scope.userID);
        //     else
        //         $scope.suggestions = suggestions;
        //     break;
        default:
            $scope.suggestions = suggestions;
    }
    $scope.filteredSuggestions;
    // console.log("modal starting with", $scope.taskToEdit);
    $scope.requiredField = {};
    $scope.formFieldsTests = {};

    $scope.checkSubjectEdit = function () {
        $scope.formFieldsTests["SubjectID"] = $scope.taskToEdit["SubjectID"] != "";
        return $scope.taskToEdit["SubjectID"] != "";
    };

    $scope.checkTextEdit = function () {
        $scope.formFieldsTests["Text"] = ($scope.taskToEdit["Text"] !=undefined && $scope.taskToEdit["Text"] != "");
        return ($scope.taskToEdit["Text"] !=undefined && $scope.taskToEdit["Text"] != "");
    };


    $scope.checkLevelEdit = function () {
        $scope.formFieldsTests["TaskLevel"] = ($scope.taskToEdit["TaskLevel"] != "" && Number($scope.taskToEdit["TaskLevel"]) >= 1);
        return ($scope.taskToEdit["TaskLevel"] != "" && Number($scope.taskToEdit["TaskLevel"]) >= 1);
    };

    $scope.checkObjectEdit = function () {
        $scope.formFieldsTests['TaskLevel'] = !(Number($scope.taskToEdit['TaskLevel']) > 1 && $scope.taskToEdit['ObjectID'] == '');
        return !(Number($scope.taskToEdit['TaskLevel']) > 1 && $scope.taskToEdit['ObjectID'] == '');
    };
    $scope.checkSeverityEdit = function () {
        $scope.formFieldsTests["TaskPriorityID"] = $scope.taskToEdit["TaskPriorityID"] != "";
        return $scope.taskToEdit["TaskPriorityID"] != "";
    };

    $scope.checkAssigneeEdit = function () {
        if ($scope.tasksPermissionLevel === 0 && $scope.taskToEdit['TaskStatus'] != 1) {
            $scope.formFieldsTests["Assignee"] = true;
            return true;
        }
        if ($scope.taskToEdit['selectedAssignee'] === false && $scope.taskToEdit['DisplayAssigneeName'] != '') {
            //check if Assignee not exists in suggestion
            let findIfUserExist = $scope.querySearch($scope.taskToEdit['DisplayAssigneeName']);
            if (findIfUserExist.length == 1 && angular.lowercase(findIfUserExist[0]['DisplayName']) == angular.lowercase($scope.taskToEdit['DisplayAssigneeName'])) {
                $scope.taskToEdit['DisplayAssigneeName']=findIfUserExist[0]['DisplayName'];
                $scope.taskToEdit["Assignee"] = Number(findIfUserExist[0]['ID']);
            } else {
                $scope.formFieldsTests["Assignee"] = false;
                return false;
            }
        }
        $scope.taskToEdit['selectedAssignee'] = true;
        $scope.formFieldsTests["Assignee"] = true;
        return true;

    };

    $scope.checkDatesEdit = function () {
        if ($scope.taskToEdit['TaskStartTimeTarget'] == "") {
            $scope.taskToEdit['TaskStartTimeTarget'] = null;
        }
        if ($scope.taskToEdit['TaskEndTimeTarget'] == "") {
            $scope.taskToEdit['TaskEndTimeTarget'] = null;
        }
        //one of the dates has input
        if ($scope.taskToEdit['TaskStartTimeTarget'] || $scope.taskToEdit['TaskEndTimeTarget']) {
            if ($scope.taskToEdit["TaskStartTimeTarget"] && $scope.taskToEdit["TaskEndTimeTarget"] &&
                ($scope.firstDateIsPastDayComparedToSecond(new Date($scope.taskToEdit["TaskEndTimeTarget"]), new Date($scope.taskToEdit["TaskStartTimeTarget"])))) {
                $scope.requiredField['endDate'] = true;
            } else {
                $scope.requiredField['endDate'] = false;
            }

            if (($scope.requiredField['startDate'] && $scope.requiredField['startDate'] === true) ||
                ($scope.requiredField['endDate'] && $scope.requiredField['endDate'] === true)) {
                $scope.formFieldsTests["DATES"] = false;
                return false;
            }

        }
        $scope.formFieldsTests["DATES"] = true;
        return true;
    };

    $scope.checkEstimatedEdit = function () {

        if ($scope.taskToEdit["estimatedHours"] == "") {
            $scope.taskToEdit["estimatedHours"] = 0;
        }

        if ($scope.taskToEdit["estimatedMins"] == "") {
            $scope.taskToEdit["estimatedMins"] = 0;
        }

        if (isNaN($scope.taskToEdit["estimatedHours"]) || Number($scope.taskToEdit["estimatedHours"]) < 0 ||
            isNaN($scope.taskToEdit["estimatedMins"]) || Number($scope.taskToEdit["estimatedMins"]) < 0) {

            if (isNaN($scope.taskToEdit["estimatedHours"]) || Number($scope.taskToEdit["estimatedHours"]) < 0) {
                $scope.requiredField['estimatedHours'] = true;
            } else {
                $scope.requiredField['estimatedHours'] = false;
            }

            if (isNaN($scope.taskToEdit["estimatedMins"]) || Number($scope.taskToEdit["estimatedMins"]) < 0) {
                $scope.requiredField['estimatedMins'] = true;
            } else {
                $scope.requiredField['estimatedMins'] = false;
            }

            if (($scope.requiredField['estimatedHours'] && $scope.requiredField['estimatedHours'] === true) ||
                ($scope.requiredField['estimatedMins'] && $scope.requiredField['estimatedMins'] === true)) {
                $scope.formFieldsTests["ESTIMATED"] = false;
                return false;
            }

        }



        $scope.taskToEdit["EstimatedExecutionTime"] = Number($scope.taskToEdit["estimatedHours"]) * 60 + Number($scope.taskToEdit["estimatedMins"]);

        $scope.formFieldsTests["ESTIMATED"] = true;
        return true;
    };

    $scope.initEditEstimatedTime = function () {
        if ($scope.taskToEdit["EstimatedExecutionTime"] != NaN && $scope.taskToEdit["EstimatedExecutionTime"] > 0) {
            $scope.taskToEdit['estimatedHours'] = Math.floor($scope.taskToEdit["EstimatedExecutionTime"] / 60);
            $scope.taskToEdit['estimatedMins'] = Number($scope.taskToEdit["EstimatedExecutionTime"]) % 60;
        } else {
            $scope.taskToEdit['estimatedHours'] = "";
            $scope.taskToEdit['estimatedMins'] = "";
        }

    };

    $scope.defaultNoteInput=$filter("translate")("ADD_COMMENT");

    $scope.addNewTaskNote=()=>{

        console.log("current note:",$scope.taskToEdit.newNote);
        if($scope.taskToEdit.newNote==''){
            return ;
        }

        if(!$scope.taskToEdit["notesToDisplay"]){
            $scope.taskToEdit["notesToDisplay"]=[];
        }
        $scope.taskToEdit["notesToDisplay"].push({"ID":0,"TaskID":Number($scope.taskToEdit["TaskID"]),"TaskHistoryID":Number($scope.taskToEdit["HistoryID"]),"Text":$scope.taskToEdit.newNote,"Note":$scope.taskToEdit.newNote,"CreateDate":new Date(),"UserName":mainCtrl.userAuth.userName})

        let noteToSend={
            "ID":0,
            "TaskID":Number($scope.taskToEdit["TaskID"]),
            "TaskHistoryID":Number($scope.taskToEdit["HistoryID"]),
            "Text":$scope.taskToEdit.newNote,
            "Note":$scope.taskToEdit.newNote,
            "CreateDate":new Date(),
            "UserName":mainCtrl.userAuth.userName
        };

        console.log("sending this!")
        LeaderMESservice.customAPI("CreateTaskNotes", {
            SessionID:$sessionStorage.userAuthenticated.accessToken,
            task:noteToSend
        }).then(function (response) {
            console.log("new note res",response);


        });
    }


    $scope.saveEditedTask = function () {
        if($scope.settings.saveEditTaskDisabled){
            return;
        }
        $scope.settings.saveEditTaskDisabled = true;

        if (
            $scope.checkSubjectEdit() &&
            $scope.checkTextEdit() &&
            $scope.checkLevelEdit() &&
            $scope.checkObjectEdit() &&
            $scope.checkSeverityEdit() &&
            $scope.checkDatesEdit() &&
            $scope.checkAssigneeEdit() &&
            $scope.checkEstimatedEdit()
        ) {

            console.log("passed edited tests");
            // console.log("taskToEdit['DisplayAssigneeName'] should be ''",$scope.taskToEdit['DisplayAssigneeName']);

            let isStartDateModified=false;

            if ($scope.taskToEdit["TaskStartTimeTarget"] && !$scope.startTimeTargetBeforeEdit ){
                isStartDateModified=true;
            }else if($scope.taskToEdit["TaskStartTimeTarget"] && $scope.startTimeTargetBeforeEdit && !(
                moment($scope.taskToEdit["TaskStartTimeTarget"]).isSame(moment($scope.startTimeTargetBeforeEdit)))
            ){
                isStartDateModified=true;
            }

            let isEndDateModified=false;

            if ($scope.taskToEdit["TaskEndTimeTarget"] && !$scope.endTimeTargetBeforeEdit ){
                isEndDateModified=true;
            }else if($scope.taskToEdit["TaskEndTimeTarget"] && $scope.endTimeTargetBeforeEdit && !(
                moment($scope.taskToEdit["TaskEndTimeTarget"]).isSame(moment($scope.endTimeTargetBeforeEdit))
            )){
                isEndDateModified=true;
            }

            let isDateModified=isStartDateModified || isEndDateModified;

            if($scope.taskToEdit["TaskStartTimeTarget"]){
                $scope.taskToEdit["TaskStartTimeTarget"]=moment.utc($scope.taskToEdit["TaskStartTimeTarget"]).local().format("YYYY-MM-DD HH:mm:ss")
            }

            if($scope.taskToEdit["TaskEndTimeTarget"]){
                $scope.taskToEdit["TaskEndTimeTarget"]=moment.utc($scope.taskToEdit["TaskEndTimeTarget"]).local().format("YYYY-MM-DD HH:mm:ss")
            }

            if ($scope.taskToEdit['TaskLevel'] === 1) {
                $scope.taskToEdit["ObjectID"] = 0;
            }

            //status changed,need to update history of task to get new HistoryID
            if ($scope.statusBeforeEdit != $scope.taskToEdit['TaskStatus'] ||
                ($scope.taskToEdit['DisplayAssigneeName'] == '' && $scope.tasksPermissionLevel > 0)) {
                let taskToSave = {
                    TaskID: $scope.taskToEdit['TaskID'],
                    Status: $scope.taskToEdit['TaskStatus'],
                    Assignee: $scope.taskToEdit['Assignee'],
                    SourceTaskCreationPlatform: 1
                };

                if ($scope.taskToEdit['DisplayAssigneeName'] == '' && $scope.tasksPermissionLevel > 0) {
                    $scope.taskToEdit['TaskStatus'] = $scope.taskToEdit['TaskLevel'] == 3 ? 2 : 1;
                    taskToSave.Status = $scope.taskToEdit['TaskStatus'];
                    $scope.taskToEdit['Assignee']=0;
                    delete taskToSave.Assignee;
                }

                LeaderMESservice.customAPI("CreateTaskHistory", {
                    task: taskToSave
                }).then(function (response) {
                    if (response.error) {
                        let message = $scope.rtl ? "שגיאה בעדכון סטטוס,נסה שוב." :
                            "failed to change task status,try again.";
                        notify({
                            message: message,
                            classes: "alert-danger",
                            duration: 1000,
                            templateUrl: "views/common/notifyTasks.html"
                        });
                    } else {
                        $scope.taskToEdit['HistoryID'] = response.LeaderRecordID;
                        let taskToSend = {};

                        if ($scope.taskToEdit["EstimatedExecutionTime"] === 0) {
                            taskToSend = {
                                ID: Number($scope.taskToEdit['TaskID']),
                                HistoryID: Number($scope.taskToEdit['HistoryID']),
                                CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                                Subject: Number($scope.taskToEdit["SubjectID"]),
                                Text: $scope.taskToEdit["Text"],
                                TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                                TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                                Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                                StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                                EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                                SourceTaskCreationPlatform: 1,
                                Status: Number($scope.taskToEdit['TaskStatus']),
                                // TaskSteps:$scope.taskToEdit["DisplaySubTasks"].concat($scope.taskToEdit["DisplayNewSubTasks"])
                                TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                            }
                        } else {
                            taskToSend = {
                                ID: Number($scope.taskToEdit['TaskID']),
                                HistoryID: Number($scope.taskToEdit['HistoryID']),
                                CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                                Subject: Number($scope.taskToEdit["SubjectID"]),
                                Text: $scope.taskToEdit["Text"],
                                TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                                TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                                Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                                StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                                EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                                EstimatedExecutionTime: $scope.taskToEdit["EstimatedExecutionTime"],
                                SourceTaskCreationPlatform: 1,
                                Status: Number($scope.taskToEdit['TaskStatus']),
                                TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                            }
                        }

                        if ($scope.taskToEdit['DisplayAssigneeName'] != '') {
                            taskToSend.Assignee = Number($scope.taskToEdit["Assignee"]);
                        }

                        // console.log("reached before createTask- changed status or assignee='");

                        LeaderMESservice.customAPI("CreateTask", {
                            task: taskToSend
                        }).then(function (response) {

                            if (response.error) {
                                let failMessage = $scope.rtl ? "עריכת משימה נכשלה!" :
                                    "failed to edit Task!";
                                notify({
                                    message: failMessage,
                                    classes: "alert-danger",
                                    duration: 1000,
                                    templateUrl: "views/common/notifyTasks.html"
                                });
                            } else {
                                let successMessage = $scope.rtl ? "השינויים נשמרו בהצלחה!" :
                                    "successfully save changes!";
                                notify({
                                    message: successMessage,
                                    classes: "alert-success",
                                    duration: 1000,
                                    templateUrl: "views/common/notifyTasks.html"
                                });



                                $scope.$close();
                            }
                        });

                    }
                });
            } else if ($scope.taskToEdit['TaskStatus'] === 1 && $scope.taskToEdit["selectedAssignee"] === true &&
                $scope.taskToEdit["Assignee"] && $scope.taskToEdit["Assignee"] != 0) {
                let taskToSave = {
                    TaskID: $scope.taskToEdit['TaskID'],
                    Status: 2,
                    Assignee: $scope.taskToEdit['Assignee'],
                    SourceTaskCreationPlatform: 1
                };
                LeaderMESservice.customAPI("CreateTaskHistory", {
                    task: taskToSave
                }).then(function (response) {
                    if (response.error) {
                        let message = $scope.rtl ? "שגיאה בעדכון סטטוס,נסה שוב." :
                            "failed to change task status,try again.";
                        notify({
                            message: message,
                            classes: "alert-danger",
                            duration: 1000,
                            templateUrl: "views/common/notifyTasks.html"
                        });
                    } else {
                        $scope.taskToEdit['HistoryID'] = response.LeaderRecordID;
                        let taskToSend = {};

                        if ($scope.taskToEdit["EstimatedExecutionTime"] === 0) {
                            taskToSend = {
                                ID: Number($scope.taskToEdit['TaskID']),
                                HistoryID: Number($scope.taskToEdit['HistoryID']),
                                CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                                Subject: Number($scope.taskToEdit["SubjectID"]),
                                Text: $scope.taskToEdit["Text"],
                                TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                                TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                                Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                                StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                                Assignee: $scope.taskToEdit['Assignee'],
                                EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                                SourceTaskCreationPlatform: 1,
                                Status: 2,
                                TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                            }
                        } else {
                            taskToSend = {
                                ID: Number($scope.taskToEdit['TaskID']),
                                HistoryID: Number($scope.taskToEdit['HistoryID']),
                                CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                                Subject: Number($scope.taskToEdit["SubjectID"]),
                                Text: $scope.taskToEdit["Text"],
                                TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                                TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                                Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                                StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                                Assignee: $scope.taskToEdit['Assignee'],
                                EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                                EstimatedExecutionTime: $scope.taskToEdit["EstimatedExecutionTime"],
                                SourceTaskCreationPlatform: 1,
                                Status: 2,
                                TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                            }
                        }


                        LeaderMESservice.customAPI("CreateTask", {
                            task: taskToSend,
                            isDateModified:isDateModified
                        }).then(function (response) {

                            if (response.error) {
                                let failMessage = $scope.rtl ? "עריכת משימה נכשלה!" :
                                    "failed to edit Task!";
                                notify({
                                    message: failMessage,
                                    classes: "alert-danger",
                                    duration: 1000,
                                    templateUrl: "views/common/notifyTasks.html"
                                });
                            } else {
                                let successMessage = $scope.rtl ? "השינויים נשמרו בהצלחה!" :
                                    "successfully save changes!";
                                notify({
                                    message: successMessage,
                                    classes: "alert-success",
                                    duration: 1000,
                                    templateUrl: "views/common/notifyTasks.html"
                                });



                                $scope.$close();
                            }
                        });

                    }
                });

            } else {
                let taskToSend = {};

                if ($scope.taskToEdit["EstimatedExecutionTime"] === 0) {
                    taskToSend = {
                        ID: Number($scope.taskToEdit['TaskID']),
                        HistoryID: Number($scope.taskToEdit['HistoryID']),
                        CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                        Subject: Number($scope.taskToEdit["SubjectID"]),
                        Text: $scope.taskToEdit["Text"],
                        TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                        TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                        Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                        Assignee: Number($scope.taskToEdit["Assignee"]),
                        StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                        EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                        SourceTaskCreationPlatform: 1,
                        Status: Number($scope.taskToEdit['TaskStatus']),
                        TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                    }
                } else {
                    taskToSend = {
                        ID: Number($scope.taskToEdit['TaskID']),
                        HistoryID: Number($scope.taskToEdit['HistoryID']),
                        CreateUser: Number($scope.taskToEdit['TaskCreateUser']),
                        Subject: Number($scope.taskToEdit["SubjectID"]),
                        Text: $scope.taskToEdit["Text"],
                        TaskLevel: Number($scope.taskToEdit["TaskLevel"]),
                        TaskLevelObjectID: Number($scope.taskToEdit["ObjectID"]),
                        Priority: Number($scope.taskToEdit["TaskPriorityID"]),
                        Assignee: Number($scope.taskToEdit["Assignee"]),
                        StartTimeTarget: $scope.taskToEdit["TaskStartTimeTarget"],
                        EndTimeTarget: $scope.taskToEdit["TaskEndTimeTarget"],
                        EstimatedExecutionTime: $scope.taskToEdit["EstimatedExecutionTime"],
                        SourceTaskCreationPlatform: 1,
                        Status: Number($scope.taskToEdit['TaskStatus']),
                        TaskSteps:[...$scope.taskToEdit["DisplaySubTasks"],...$scope.taskToEdit["DisplayNewSubTasks"]]
                    }
                }

                LeaderMESservice.customAPI("CreateTask", {
                    task: taskToSend
                }).then(function (response) {


                    if (response.error) {
                        let failMessage = $scope.rtl ? "עריכת משימה נכשלה!" :
                            "failed to edit Task!";
                        notify({
                            message: failMessage,
                            classes: "alert-danger",
                            duration: 1000,
                            templateUrl: "views/common/notifyTasks.html"
                        });
                    } else {
                        let successMessage = $scope.rtl ? "השינויים נשמרו בהצלחה!" :
                            "successfully save changes!";
                        notify({
                            message: successMessage,
                            classes: "alert-success",
                            duration: 1000,
                            templateUrl: "views/common/notifyTasks.html"
                        });

                        $scope.$close();
                    }
                });
            }
        }
        console.log("edit tests:", $scope.formFieldsTests);
        if($scope.taskToEdit["DisplaySubTasks"] || $scope.taskToEdit["DisplayNewSubTasks"]){
            console.log("entered edit sub tasks");
            $scope.taskToEdit.NumOfOpenSubTasks=1;
        }
        $scope.subTaskChange();
        $scope.formFieldsTests = {};
        $timeout(()=>{
            $scope.settings.saveEditTaskDisabled = false;
        },2000);
        $(".saveEditTaskBtn").blur();
    }
    $scope.withoutDoneStatus=(status)=>{
        return status.ID!=4;
    };


    $scope.permissionStatuses = (status) => {
        return status.ID != 5
    }

    $scope.editTaskObjectChanged = () => {
        // console.log("entered broadcast with :", $scope.taskToEdit['ObjectID']);

    }

    $scope.filterItems = function (isMiddle, isEdit) {
        if (isEdit) {
            if ($scope.taskToEdit["DisplayAssigneeName"] == "") {
                $scope.filteredSuggestions = $scope.suggestions;
                $scope.suggestionsAreVisibleE = true;
                $scope.taskToEdit['selectedAssignee'] = false;
            }
            else {
                // console.log("entered filter, filteredsugs:", $scope.filteredSuggestions);
                $scope.filteredSuggestions = $scope.querySearch($scope.taskToEdit["DisplayAssigneeName"]);
                // console.log("filtered:", $scope.filteredSuggestions);
                if ($scope.filteredSuggestions.length == 1 && angular.lowercase($scope.filteredSuggestions[0]['DisplayName']) == angular.lowercase($scope.taskToEdit['DisplayAssigneeName'])) {
                    // console.log("you have a match");
                    $scope.taskToEdit['selectedAssignee'] = true;
                    $scope.suggestionsAreVisibleE = false;
                    $scope.taskToEdit["Assignee"] = $scope.filteredSuggestions[0]['ID'];
                    return;
                }
                $scope.suggestionsAreVisibleE = true;
                $scope.taskToEdit['selectedAssignee'] = false;

            }
        } else {
            if ($scope.newTaskFields["Assignee"] == "")
                $scope.filteredSuggestions = $scope.suggestions;
            else {
                $scope.filteredSuggestions = $scope.querySearch($scope.newTaskFields["Assignee"]);
                if ($scope.filteredSuggestions.length == 1 && angular.lowercase($scope.filteredSuggestions[0]['DisplayName']) == angular.lowercase($scope.newTaskFields["Assignee"])) {
                    $scope.newTaskFields['selectedAssignee'] = true;
                    $scope.suggestionsAreVisibleM = false;
                    $scope.newTaskFields["AssigneeID"] = $scope.filteredSuggestions[0]['ID'];
                    return;
                }
            }
            $scope.suggestionsAreVisibleM = true;
            $scope.newTaskFields['selectedAssignee'] = false;

        }
    };
    $scope.querySearch = function (query) {
        // returns list of filtered items
        return query ? $scope.suggestions.filter($scope.createFilterFor(query)) : [];
    };

    $scope.createFilterFor = function (query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(item) {
            // Check if the given item matches for the given query
            return item.DisplayName && angular.lowercase(item.DisplayName).indexOf(lowercaseQuery) >= 0;
        };
    };

    $scope.addNewSubTask=(newTask)=>{
        if(!newTask){
            if($scope.taskToEdit.newSubTask==""){
                return;
            }
            if(!$scope.taskToEdit["DisplayNewSubTasks"]){
                $scope.taskToEdit["DisplayNewSubTasks"]=[];
            }
            $scope.taskToEdit["DisplayNewSubTasks"].push({"ID":0,"Text":$scope.taskToEdit.newSubTask,"IsOpen":true});
            $scope.taskToEdit["HasSubTasks"]=1;
            $scope.subTaskChange();
        }else{//new task
            if($scope.newTaskFields.newSubTask==""){
                return;
            }
            if(!$scope.newTaskFields["DisplayNewSubTasks"]){
                $scope.newTaskFields["DisplayNewSubTasks"]=[];
            }
            $scope.newTaskFields["DisplayNewSubTasks"].push({"ID":0,"Text":$scope.newTaskFields.newSubTask,"IsOpen":true});
            $scope.newTaskFields["HasSubTasks"]=1;
        }

    }

    $scope.subTaskChange=()=>{
        let donable=true;
        if($scope.taskToEdit["DisplaySubTasks"]){
            for (let subTask in $scope.taskToEdit["DisplaySubTasks"]){
                if($scope.taskToEdit["DisplaySubTasks"][subTask]["IsOpen"]===true){
                    donable=false;
                    break;
                }
            }
        }

        if(!donable){
            $scope.taskToEdit.NumOfOpenSubTasks=1;
            return;
        }else{

            if($scope.taskToEdit["DisplayNewSubTasks"]){
                for (let subTask in $scope.taskToEdit["DisplayNewSubTasks"]){
                    if($scope.taskToEdit["DisplayNewSubTasks"][subTask]["IsOpen"]===true){
                        donable=false;
                        break;
                    }
                }
            }


            $scope.taskToEdit.NumOfOpenSubTasks=donable?0:1;
        }
    }

    $scope.selectAssignee = function (assigneeID, assigneeDisplayName, isMiddle, isEdit) {

        if (isEdit) {
            $scope.taskToEdit["Assignee"] = assigneeID;
            $("#editTaskAssignee").val(assigneeDisplayName);
            $scope.taskToEdit['DisplayAssigneeName']=assigneeDisplayName;
            $scope.suggestionsAreVisibleE = false;
            $scope.taskToEdit["selectedAssignee"] = true;

        } else {
            $scope.newTaskFields["AssigneeID"] = assigneeID;
            if (isMiddle) {
                $("#newTaskAssigneeMiddle").val(assigneeDisplayName);
                $scope.suggestionsAreVisibleM = false;
                $scope.newTaskFields["selectedAssignee"] = true;
            } else {
                $("#newTaskAssignee").val(assigneeDisplayName);
                $scope.suggestionsAreVisible = false;
            }
            $scope.newTaskFields["selectedAssignee"] = true;
        }



    };

    $scope.getSubTasks=(taskToEditID)=>{
        LeaderMESservice.customAPI("GetTaskSteps", {
            SourceTaskCreationPlatform: 1,
            TaskID: taskToEditID,
        }).then(function (response) {
            console.log("sub tasks res",response);
            // return response.ResponseDictionaryDT.TaskFiles;
            $scope.currentSubTasksToDisplay=angular.copy(response.ResponseDictionaryDT);
            $scope.taskToEdit["DisplaySubTasks"] = $scope.currentSubTasksToDisplay.TaskSteps;
            let taskDoneAble=true;
            let numberOfNewOpenSubTasks=0;
            for (let subTask in $scope.taskToEdit["DisplaySubTasks"]){
                if($scope.taskToEdit["DisplaySubTasks"][subTask]["IsOpen"]){
                    taskDoneAble=false;
                    numberOfNewOpenSubTasks=1;
                    break;
                }
            }
            $scope.taskToEdit["taskDoneAble"]=taskDoneAble;
            $scope.taskToEdit.NumOfOpenSubTasks=numberOfNewOpenSubTasks;
                $scope.taskToEdit["DisplayNewSubTasks"] = [];



        });
        setTimeout(() => {
            $scope.$applyAsync();
        }, 500);
    };


    $scope.getTaskFiles = function (taskID) {
        LeaderMESservice.customAPI("GetTaskFiles", {
            SourceTaskCreationPlatform: 1,
            TaskID: taskID
        }).then(function (response) {
            // return response.ResponseDictionaryDT.TaskFiles;
            $scope.currentTaskFilesToDisplay = angular.copy(response.ResponseDictionaryDT);
            $scope.taskToEdit['DisplayFiles'] = $scope.currentTaskFilesToDisplay.TaskFiles;
        });

        setTimeout(() => {
            $scope.$applyAsync();
        }, 500);
    }


    $scope.uploadTaskFiles = function (taskID, fromNewTask) {

        let fileToUpload, historyID;

        if (fromNewTask) {
            fileToUpload = $scope.newTaskFields['file'];
            historyID = 0;

        } else {
            fileToUpload = $scope.taskToEdit['file'];
            historyID = $scope.taskToEdit['HistoryID'];
        }


        if (fileToUpload == "") {
            return;
        }

        var fileData = fileToUpload.name.split(".");
        var fileType = fileData.splice(-1, 1);
        var fileName = fileData.join(".");

        Upload.upload({
            url: BASE_URL.url + 'CreateTaskFilesFromWeb/0/' + fileName + "/" + fileType[0] + "/" + taskID + "/false/" + historyID,
            headers: {
                'x-access-token': AuthService.getAccessToken()
            },
            data: {
                file: fileToUpload
            }
        }).then(function (response) {
            if (fromNewTask) {
                $scope.newTaskFields['file'] = ""
            } else {
                $scope.taskToEdit['file'] = "";
                setTimeout(() => {
                    $scope.getTaskFiles(taskID);
                }, 300);
            }
        });


    };
}

angular.module('LeaderMESfe').controller('editTaskModalCtrl', editTaskModalCtrl);
