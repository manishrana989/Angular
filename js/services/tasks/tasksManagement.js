angular
  .module("LeaderMESfe")
  .factory("tasksManagementService", function (
    LeaderMESservice,
    $sessionStorage,
    AuthService,
    $rootScope,
    $filter,
    $interval,
    googleAnalyticsService,
    GLOBAL,
    $modal,
    TASKS,
    Upload,
    BASE_URL,
    notify,
    $translate,
    $localStorage

  ) {


    function tasksManagementCode($scope) {
      $(window).scrollTop(0);
      googleAnalyticsService.gaPV("task_management");
      // $("body").css("overflow-y", "hidden");
      var tasksStatusesHeaderHeight = $('#tasksManagementStatusesHeaderStatic').height();
      var tasksManagementHeight = $('#tasksManagement').height();
      // $('#tasksManagementStatusesBody').css("padding-top", tasksStatusesHeaderHeight + "px");
      // $('#taskManagementContainer').css("height",tasksManagementHeight +100+"px");
      $scope.rtl = LeaderMESservice.isLanguageRTL();
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      notify.config({ duration: 2000 });

      $scope.newTaskFields = {
        Hour: "",
        Min: "",
        Status: "",
        Subject: "",
        Text: "",
        TaskLevel: 0,
        TaskLevelObjectID: "",
        Priority: 2,
        Assignee: "",
        AssigneeID: "",
        selectedAssignee: false,
        startDate: null,
        endDate: null,
        EstimatedExecutionTime: null,
        file: ""
      };

      $scope.filter = {
        Subjects:{},
        OnlyLate: {},
        Priority: {},
        AssigneeDisplayName: { visible: true },
        TaskObject: {},
        doneCancelLastXDays:1,
        filtered: false
      };

      var mainCtrl = this;
      mainCtrl.userAuth = $sessionStorage.userAuthenticated;


      $scope.userID = LeaderMESservice.getUserID();
      $scope.cancelDrop = false;
      $scope.Shared = {};
      $scope.taskObjects = {};
      $scope.tasksObjects = {};
      $scope.taskLevelObjects = {};
      $scope.Shared.taskStatuses = {};
      $scope.Shared.preTaskStatuses = {};
      $scope.Shared.dummyStatuses = [];
      $scope.Shared.dummyColumns = [1, 2, 3, 4, 5];
      $scope.Shared.dummyTasks = [{ dummy: true }, { dummy: true }, { dummy: true }, { dummy: true }, { dummy: true }];
      $scope.taskSubjects = {};
      $scope.tasks = [];
      $scope.newTaskPriorityPick;
      $scope.suggestionsAreVisible = false;
      $scope.suggestionsAreReady = false;
      $scope.suggestions;
      $scope.filteredSuggestions;
      $scope.newTaskStartDate;
      $scope.newTaskEndDate;
      $scope.tasksSearchInputFilter = {
        input: ""
      };
      $scope.filterWindowIsOpen = {
        myTasks: false,
        tasksManagement: false,
        fullWindow:false
      }
      $scope.filterDirectiveIsReady = false;
      $scope.tasksOrderBy = {
        order: "+TaskStartTimeTarget",
        orderDisplay: "+TaskStartTimeTarget"
      };
      $scope.tasksPermissionLevel = $sessionStorage.tasksPermissionLevel;
      // $scope.tasksPermissionLevel = 0;
      $scope.currentOpenTaskID = 2;
      $scope.levelIDToLevelName = {
        2: 'Departments',
        3: 'Machines',
        4: 'Jobs',
        5: 'UserDefinitions'
      }

      $scope.settings={saveEditTaskDisabled:false}

      $scope.makeItDraggabale = (taskID) => {
        setTimeout(() => {

          // $(".taskStatusContent").sortable({revert:true});

          $(taskID).draggable({
            opacity: 1,
            start: function (event, ui) {
              $(".taskHoverZone").fadeIn();

              // console.log("start draggable event:", event);
              // console.log("start draggable ui:", ui);
              $scope.topBeforeAbsolute = $(this).position().top;
              $scope.leftBeforeAbsolute = $(this).position().left;
              $scope.isHovering = true;

              $rootScope.$broadcast("draggingTasks", {});
              $scope.dragFromStatus = Number(event.target.attributes.statusid.value);
              $scope.dragWithCreator = Number(event.target.attributes.creatorid.value);
              $scope.taskIsDoneAble=event.target.attributes.doneable.value;
              $scope.taskIsDoneAble=$scope.taskIsDoneAble=="false"?false:true;
              console.log("is task doneable?",$scope.taskIsDoneAble);

              // console.log("drag creator", $scope.dragWithCreator);

            },
            drag: function (event, ui) {
              // console.log("drag event", event);
              // console.log("drag ui", ui);

              // Keep the left edge of the element
              // at least 100 pixels from the container
              // ui.position.left = Math.min(100, ui.position.left);
            },
            stop: function (event, ui) {
              // console.log("stop draggable event:", event);
              // console.log("stop draggable ui:", ui);

              $(".taskHoverZone").fadeOut();

              $(this).css({
                position: "initial"
              });



              if ($scope.cancelDrop === true) {
                $scope.cancelDrop = false;
                return;
              }

              if (!event.toElement.attributes.statusid)
                return;

              let taskID = Number(event.target.attributes.taskid.value);
              let fromStatus = Number(event.target.attributes.statusid.value);
              let toStatus = Number(event.toElement.attributes.statusid.value);
              // console.log("fromStatus:", fromStatus);
              // console.log("toStatus:", toStatus);
              if (toStatus != fromStatus && fromStatus != 1 && toStatus != 1) {
                $scope.taskChangeStatus(taskID, toStatus, fromStatus);
              }

              // return true;
            }
          });

        }, 500);
      }

      $scope.makeItDroppable = () => {
        $(".droppableTasksZone").droppable({
          accept: '.draggableTasks',
          activate: (event, ui) => {
            // console.log("activate event:", event);
            // console.log("activate ui:", ui);

            if ($scope.dragFromStatus == 1) {
              for (let i = 2; i < 6; i++) {
                $(`#hoverZone${i}`).toggleClass("taskHoverZoneDisabled");
              }
            } else { //other status than open
              $(`#hoverZone1`).toggleClass("taskHoverZoneDisabled");
            }

            switch ($scope.tasksPermissionLevel) {
              case 0: //no tasks permissions
                if ((!$(`#hoverZone5`).hasClass("taskHoverZoneDisabled")) && $scope.dragWithCreator != $scope.userID) {
                  $(`#hoverZone5`).toggleClass("taskHoverZoneDisabled");
                }
                break;
              case 1: //have tasks permissions
                if ((!$(`#hoverZone5`).hasClass("taskHoverZoneDisabled")) && $scope.dragWithCreator != $scope.userID) {
                  $(`#hoverZone5`).toggleClass("taskHoverZoneDisabled");
                }
                break;
              default: //tasks manager
            }

            // console.log("$scope.taskIsDoneAble",$scope.taskIsDoneAble);
            // console.log("$scope.dragFromStatus",$scope.dragFromStatus);
            // console.log("$scope.dragFromStatus!=4 && $scope.taskIsDoneAble==false",$scope.dragFromStatus!=4 && $scope.taskIsDoneAble==false)

            if($scope.dragFromStatus!=4 && $scope.taskIsDoneAble==false){
              // console.log("entered!!!");
              if(!$(`#hoverZone4`).hasClass("taskHoverZoneDisabled")){
                $(`#hoverZone4`).toggleClass("taskHoverZoneDisabled");
              }

            }

          },
          over: (event, ui) => {
            // console.log("over event:", event);
            // console.log("over ui:", ui);
            let currZoneID = Number(event.target.attributes.statusid.value);

            if (!$(`#hoverZone${currZoneID}`).hasClass("taskHoverZoneDisabled")) {
              $(`#hoverZone${currZoneID}`).toggleClass("taskHoverZoneHover ZoneHovered");
            }

          },
          out: (event, ui) => {
            let currZoneID = Number(event.target.attributes.statusid.value);
            if (!$(`#hoverZone${currZoneID}`).hasClass("taskHoverZoneDisabled")) {
              $(`#hoverZone${currZoneID}`).toggleClass("taskHoverZoneHover ZoneHovered");
            }
          },
          drop: function (event, ui) {
            // console.log("droppable event:", event);
            // console.log("droppable ui:", ui);
            let currZoneID = Number(event.target.attributes.statusid.value);
            if (!$(`#hoverZone${currZoneID}`).hasClass("taskHoverZoneHover")) {
              $scope.cancelDrop = true;
            }
          },
          deactivate: (event, ui) => {
            // console.log("activate event:", event);
            // console.log("activate ui:", ui);

            if ($scope.dragFromStatus == 1) {
              for (let i = 2; i < 6; i++) {
                $(`#hoverZone${i}`).toggleClass("taskHoverZoneDisabled");

              }
            } else { //other status than open
              for (let i = 1; i < 6; i++) {
                if ($(`#hoverZone${i}`).hasClass("taskHoverZoneDisabled"))
                  $(`#hoverZone${i}`).toggleClass("taskHoverZoneDisabled");
              }
            }

          }
        });
      }

      $scope.makeItDragAndDrop = () => {
        setTimeout(() => {
          $scope.makeItDraggabale(".draggableTasks");
          $scope.makeItDroppable();
        }, 500)
      }

      let filterWatcher = $scope.$watch('filter', function (newValue, oldValue) {
        $scope.makeItDraggabale(".draggableTasks");
      }, true);

      $scope.showFilterGroupBy = false;
      $scope.filterIsNotChecked = true;
      $scope.displayByChecked = false;

      if(!$localStorage.tasksManagement){
        $localStorage.tasksManagement={showFilter:false}
      }

      if(!$localStorage.fullWindow){
        $localStorage.fullWindow={showFilter:false}
      }

      $scope.changeShowFilterShift = function (isFullWindow=false) {
        if(isFullWindow){
          $scope.filterWindowIsOpen.fullWindow = !$scope.filterWindowIsOpen.fullWindow;
          $localStorage.fullWindow.showFilter = !$localStorage.fullWindow.showFilter;
        }else{
          $scope.filterWindowIsOpen.tasksManagement = !$scope.filterWindowIsOpen.tasksManagement;
          $localStorage.tasksManagement.showFilter = !$localStorage.tasksManagement.showFilter;
        }


      };

      $scope.changeDisplayBy = function () {
        $scope.tasksOrderBy["order"] = $scope.tasksOrderBy["orderDisplay"];
      };

      let orderByWatcher = $scope.$watch('tasksOrderBy["orderDisplay"]', function (newValue, oldValue) {
        $scope.makeItDraggabale(".draggableTasks");
      });


      $scope.toggleDisplayBy = function () {
        let orederByStringLength = $scope.tasksOrderBy["order"].length;
        $scope.tasksOrderBy["order"] =
          $scope.tasksOrderBy["order"].substr(0, 1) == "-" ?
            "+" + $scope.tasksOrderBy["order"].substr(1, orederByStringLength) :
            "-" + $scope.tasksOrderBy["order"].substr(1, orederByStringLength);

      };

      $scope.filterItems = function (isMiddle, isEdit) {
        if ($scope.suggestionsAreReady) {
          if (isEdit) {
            if ($scope.taskToEdit["DisplayAssigneeName"] == "")
              $scope.filteredSuggestions = $scope.suggestions;
            else
              $scope.filteredSuggestions = $scope.querySearch($scope.taskToEdit["DisplayAssigneeName"]);

            $scope.suggestionsAreVisibleE = true;

          } else {
            if ($scope.newTaskFields["Assignee"] == "")
              $scope.filteredSuggestions = $scope.suggestions;
            else
              $scope.filteredSuggestions = $scope.querySearch($scope.newTaskFields["Assignee"]);

            if (isMiddle)
              $scope.suggestionsAreVisibleM = true;
            else
              $scope.suggestionsAreVisible = true;
          }

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

      $scope.firstDateIsPastDayComparedToSecond = (firstDate, secondDate) => {
        if (firstDate.setHours(0, 0, 0, 0) - secondDate.setHours(0, 0, 0, 0) >= 0) {
          //first date is in future, or it is today
          return false;
        }

        return true;
      };

      $scope.getTaskLevelObjects = function (array) {
        [2, 3, 4, 5].forEach(level => {
          $scope.taskObjects[level] = {};
          $scope.filter["TaskObject"][level] = {};
        });

        angular.forEach(array, (task, taskIndex) => {
          if (task["TaskLevel"] > 1 && task["TaskLevel"] < 6) {
            $scope.taskObjects[task["TaskLevel"]][task["ObjectID"]] = {
              ID: task["ObjectID"],
              LName: task["LName"],
              EName: task["EName"]
            };
            $scope.filter["TaskObject"][task["TaskLevel"]][task["ObjectID"]] = true;
          }
        });

        // for (var taskLevel in $scope.taskObjects){
        //     $scope.taskObjects[taskLevel]=Object.values($scope.taskObjects[taskLevel]);
        // }

        $scope.taskObjects[2] = Object.values($scope.taskObjects[2]);
        $scope.taskObjects[3] = Object.values($scope.taskObjects[3]);
        $scope.taskObjects[5] = Object.values($scope.taskObjects[5]);
      };


      $scope.filterCancelStatus = (data, TaskCreateUser) => {
        return !(data.ID == 5 && $scope.ManageTasks === false && TaskCreateUser != LeaderMESservice.getUserID())
      }

      $scope.getItems = function (obj, array) {
        return (array || [])
          .map(function (w) {
            return w[obj];
          })
          .filter(function (w, idx, arr) {
            if (typeof w === "undefined") {
              return false;
            }
            return arr.indexOf(w) === idx;
          });
      };

      $scope.filterCancelDoneStatuses = function (data) {
        if (data["TaskStatus"] < 4)
          return true

        var timeStamp = Math.round(new Date().getTime() / 1000);
        var timeStampYesterday = timeStamp - (24 * 3600);
        return $scope.firstDateIsPastDayComparedToSecond(new Date(timeStampYesterday), new Date(data['HistoryCreateDate']));
      };


      $scope.filterByExp = (data) => {
        return [{
          TaskID: 1
        }, {
          TaskID: 2
        }];
      };



      $scope.filterBySearchInput = function (data) {
        let reg = new RegExp($scope.tasksSearchInputFilter["input"], "gi");
        return (data["SubjectTrans"] && data["SubjectTrans"].match(reg)) || (data["Text"] && data["Text"].match(reg)) || (data["TaskID"] && data["TaskID"].toString().match(reg));
      };
      let inputFilterWatcher = $scope.$watch('tasksSearchInputFilter["input"]', function (newValue, oldValue) {
        $scope.makeItDraggabale(".draggableTasks");
      });

      $scope.filterByOnlyMyTasks = function (data) {
        return Number(data["Assignee"]) == LeaderMESservice.getUserID() || data["TaskStatus"] == 1;
      };

      // matching with AND operator
      $scope.filterByLevelObjectMatchingAND = function (data) {
        if (data["TaskLevel"] < 2 || data["TaskLevel"] > 5) return true;
        return $scope.filter["TaskObject"][data["TaskLevel"]][data["ObjectID"]];
      };

      // matching with AND operator
      $scope.filterByOnlyLate = function (data) {
        if ($scope.filter["OnlyLate"] == true && data["TaskEndTimeTarget"])
          return $scope.firstDateIsPastDayComparedToSecond(new Date(data["TaskEndTimeTarget"]), new Date());
        else return true;
      };

      $scope.importantTask = function (data) {
        let taskStatus = data["TaskStatus"];
        if (data["TaskEndTimeTarget"]) {
          if (taskStatus == 1 || taskStatus == 2) {
            return $scope.firstDateIsPastDayComparedToSecond(new Date(data["TaskStartTimeTarget"]), new Date());
          } else if (taskStatus == 3 || taskStatus == 4) {
            return $scope.firstDateIsPastDayComparedToSecond(new Date(data["TaskEndTimeTarget"]), new Date());
          } else {
            return false;
          }
        } else return false;
      };

      $scope.filterByPriority = function (data) {
        return $scope.filter["Priority"][data["TaskPriorityID"]];
      };

      $scope.filterBySubject = function (data) {
        return $scope.filter["Subjects"][data["SubjectID"]];
      };


      // matching with AND operator
      $scope.filterByPropertiesMatchingAND = function (data) {
        var matchesAND = true;
        for (var obj in $scope.filter) {
          if ($scope.filter.hasOwnProperty(obj)) {
            if (noSubFilter($scope.filter[obj])) continue;
            if ($scope.filter[obj][data[obj]] == false) {
              matchesAND = false;
              break;
            }
          }
        }
        return matchesAND;
      };

      function noSubFilter(obj) {
        for (var key in obj) {
          if (obj[key] == true || obj[key] == false) return false;
        }
        return true;
      }



      $scope.changeEditedTaskForDemo = function () {
        console.log("statusBeforeEdit:", $scope.statusBeforeEdit);


        if ($scope.levelBeforeEdit != $scope.taskToEdit['TaskLevel']) {
          $scope.taskToEdit['LevelName'] = $scope.tasksData['Level'].find((level) => level.ID == $scope.taskToEdit['TaskLevel']).DisplayName;
          if ($scope.taskToEdit['TaskLevel'] > 1) {
            $scope.taskNewObject = $scope.taskLevelObjects[$scope.levelIDToLevelName[$scope.taskToEdit['TaskLevel']]].find((object) => object.ID == $scope.taskToEdit['ObjectID']);
            switch (Number($scope.taskToEdit['TaskLevel'])) {
              //departments
              case 2:
                $scope.taskToEdit['LName'] = $scope.taskNewObject.LName;
                $scope.taskToEdit['EName'] = $scope.taskNewObject.EName;
                break;
              //machines
              case 3:
                $scope.taskToEdit['LName'] = $scope.taskNewObject.MachineLName;
                $scope.taskToEdit['EName'] = $scope.taskNewObject.MachineName;
                break;
              //jobs
              case 4:
                $scope.taskToEdit['EName'] = $scope.taskNewObject.ERPJobID ? $scope.taskNewObject.ERPJobID : '-';
                break;
              case 5:
                $scope.taskToEdit['LName'] = $scope.taskNewObject.HName;
                $scope.taskToEdit['EName'] = $scope.taskNewObject.EName;
                break;
            }

          } else {
            $scope.taskToEdit['ObjectID'] = 0;
            $scope.taskToEdit['LName'] = 'dev';
            $scope.taskToEdit['EName'] = 'dev';
          }

        } else if ($scope.objectBeforeEdit != $scope.taskToEdit['ObjectID']) {
          $scope.taskNewObject = $scope.taskLevelObjects[$scope.levelIDToLevelName[$scope.taskToEdit['TaskLevel']]].find((object) => object.ID == $scope.taskToEdit['ObjectID']);
          // console.log("entered only object changed and this is the new JSON:", $scope.taskNewObject);
          switch (Number($scope.taskToEdit['TaskLevel'])) {
            //departments
            case 2:
              $scope.taskToEdit['LName'] = $scope.taskNewObject.LName;
              $scope.taskToEdit['EName'] = $scope.taskNewObject.EName;
              break;
            //machines
            case 3:
              $scope.taskToEdit['LName'] = $scope.taskNewObject.MachineLName;
              $scope.taskToEdit['EName'] = $scope.taskNewObject.MachineName;
              break;
            //jobs
            case 4:
              $scope.taskToEdit['EName'] = $scope.taskNewObject.ERPJobID ? $scope.taskNewObject.ERPJobID : '-';
              break;
            case 5:
              $scope.taskToEdit['LName'] = $scope.taskNewObject.HName;
              $scope.taskToEdit['EName'] = $scope.taskNewObject.EName;
              break;
          }
        }
        if($scope.taskToEdit['TaskStartTimeTarget']!=null && $scope.taskToEdit['TaskStartTimeTarget']!=""){
          $scope.taskToEdit['TaskStartTimeTarget']=new Date($scope.taskToEdit['TaskStartTimeTarget']);
        }


        if ($scope.statusBeforeEdit != $scope.taskToEdit['TaskStatus'] ||
          ($scope.statusBeforeEdit != 1 && $scope.taskToEdit['DisplayAssigneeName'] == '' && $scope.tasksPermissionLevel > 0) ||
          (($scope.assigneeBeforeEdit === 0 || $scope.assigneeBeforeEdit == '') && (!isNaN($scope.taskToEdit['Assignee']) && $scope.taskToEdit['Assignee'] != 0))) {
          let pos = $scope.Shared.taskStatuses[$scope.statusBeforeEdit]['Otasks'].map(function (task) {
            return task.TaskID;
          }).indexOf($scope.taskToEdit['TaskID']);
          // console.log("the pos of the task to delete:", pos);
          $scope.Shared.taskStatuses[$scope.statusBeforeEdit]['Otasks'].splice(pos, 1);
          if ($scope.statusBeforeEdit != 1 && $scope.taskToEdit['DisplayAssigneeName'] == '' && $scope.tasksPermissionLevel > 0) {
            // console.log("changed to open");
            $scope.taskToEdit["AssigneeDisplayHName"] = '';
            $scope.taskToEdit["AssigneeDisplayName"] = '';
            $scope.taskToEdit['TaskStatus'] = 1;
            $scope.Shared.taskStatuses[1]['Otasks'].push(angular.copy($scope.taskToEdit));
          } else if (($scope.assigneeBeforeEdit === 0 || $scope.assigneeBeforeEdit == '') && (!isNaN($scope.taskToEdit['Assignee']) && $scope.taskToEdit['Assignee'] != 0)) {
            // console.log("changed from open");
            // $scope.taskToEdit['TaskStatus']
            if ($scope.statusBeforeEdit == 1)
              $scope.taskToEdit['TaskStatus'] = 2;
            $scope.taskToEdit["AssigneeDisplayHName"] = $scope.taskToEdit['DisplayAssigneeName'];
            $scope.taskToEdit["AssigneeDisplayName"] = $scope.taskToEdit['DisplayAssigneeName'];
            $scope.Shared.taskStatuses[2]['Otasks'].push(angular.copy($scope.taskToEdit));
          } else {
            $scope.Shared.taskStatuses[$scope.taskToEdit['TaskStatus']]['Otasks'].push(angular.copy($scope.taskToEdit));
          }
        } else {
          // console.log("task after edit", $scope.taskToEdit);
          let pos = $scope.Shared.taskStatuses[$scope.taskToEdit['TaskStatus']]['Otasks'].map(function (task) {
            return task.TaskID;
          }).indexOf($scope.taskToEdit['TaskID']);
          $scope.Shared.taskStatuses[$scope.taskToEdit['TaskStatus']]['Otasks'].splice(pos, 1, angular.copy($scope.taskToEdit));
        }

        $scope.makeItDragAndDrop();
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

      $scope.addNewTaskToView = function () {
        $scope.Shared.taskStatuses[2]['tasks'].push(angular.copy($scope.newTaskFields));

        $scope.ClearNewTaskField();
      }

      $scope.restoreEditedTask = () => {

        angular.forEach(Object.keys($scope.taskBeforeEdit), (prop) => {
          $scope.taskToEdit[prop] = $scope.taskBeforeEdit[prop];
        });
        $scope.makeItDragAndDrop();
      }

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
            $scope.taskToEdit["DisplayNewSubTasks"]=[];

        });
        setTimeout(() => {
          $scope.$applyAsync();
        }, 500);
      };


      $scope.editTask = function (taskToEditID) {
        if ($scope.isDragging == true) {
          $scope.isDragging = false;
          return;
        }
        // console.log("editing, suggestions:", $scope.suggestions);

        $scope.taskBeforeEdit = angular.copy($scope.tasks.find(task => task.ID === taskToEditID));
        $scope.taskToEdit = $scope.tasks.find(task => task.ID === taskToEditID);
        $scope.taskToEdit['DisplayFiles'] = [];
        $scope.taskToEdit['rtl'] = $scope.rtl ? 'rtl' : '';
        $scope.getTaskFiles(taskToEditID);
        $scope.getSubTasks(taskToEditID);
        let taskDoneAble=true;

        if($scope.taskToEdit['TaskStartTimeTarget']!=null && $scope.taskToEdit['TaskStartTimeTarget']!="")
          $scope.taskToEdit['TaskStartTimeTarget']=new Date($scope.taskToEdit['TaskStartTimeTarget']);
        if( $scope.taskToEdit['TaskEndTimeTarget']!=null && $scope.taskToEdit['TaskEndTimeTarget']!="")
          $scope.taskToEdit['TaskEndTimeTarget']=new Date($scope.taskToEdit['TaskEndTimeTarget']);

        $scope.startTimeTargetBeforeEdit= $scope.taskToEdit['TaskStartTimeTarget'];
        $scope.endTimeTargetBeforeEdit= $scope.taskToEdit['TaskEndTimeTarget'];
        $scope.statusBeforeEdit = Number($scope.taskToEdit['TaskStatus']);
        $scope.levelBeforeEdit = Number($scope.taskToEdit['TaskLevel']);
        $scope.objectBeforeEdit = Number(angular.copy($scope.taskToEdit)['ObjectID']);
        $scope.assigneeBeforeEdit = Number(angular.copy($scope.taskToEdit)['Assignee']);
        $scope.taskToEdit['TaskStatus'] = Number($scope.taskToEdit['TaskStatus']);
        $scope.taskToEdit['SubjectID'] = Number($scope.taskToEdit['SubjectID']);
        $scope.taskToEdit['TaskLevel'] = Number($scope.taskToEdit['TaskLevel']);
        $scope.taskToEdit['ObjectID'] = Number($scope.taskToEdit['ObjectID']);
        $scope.taskToEdit['DisplayAssigneeName'] = $scope.taskToEdit['Assignee'] === 0 ? '' : ($scope.rtl ? $scope.taskToEdit['AssigneeDisplayHName'] : $scope.taskToEdit['AssigneeDisplayName']);
        $scope.taskToEdit['file'] = "";
        $scope.taskToEdit['selectedAssignee'] = true;
        $scope.taskToEdit['estimatedHours'] = Math.floor(Number($scope.taskToEdit['EstimatedExecutionTime']) / 60);
        $scope.taskToEdit['estimatedMins'] = $scope.taskToEdit['EstimatedExecutionTime'] % 60;
        $scope.taskToEdit['createDateDisplay'] = moment($scope.taskToEdit['TaskCreateDate']).format("MMM Do YY");

        console.log("scope.taskToEdit:",$scope.taskToEdit);


        switch ($scope.tasksPermissionLevel) {
          case 0:
            if ($scope.taskToEdit['TaskStatus'] == 1) {
              $scope.filteredSuggestions = $scope.suggestions.filter((suggestion) => suggestion.ID == $scope.userID);
            }
            break;
          case 1:
            if ($scope.taskToEdit['TaskStatus'] == 1) {
              $scope.filteredSuggestions = $scope.suggestions.filter((suggestion) => suggestion.ID == $scope.userID);
            }
            break;
          default:
            break;
        }
        // console.log("taskToEdit", $scope.taskToEdit);
        var modalIns = $modal
          .open({
            templateUrl: "views/common/editTask.html",
            backdrop: 'static',
            controller: 'editTaskModalCtrl',
            scope: $scope,
            resolve: {
              rtl: function () {
                return $scope.rtl;
              },
              taskToEdit: function () {
                return $scope.taskToEdit;
              },
              suggestions: function () {
                return $scope.suggestions;
              },
              startTimeTargetBeforeEdit:function(){
                return $scope.startTimeTargetBeforeEdit;
              },
              endTimeTargetBeforeEdit:function(){
                return $scope.endTimeTargetBeforeEdit;
              },
              tasksData:function(){
                return $scope.tasksData;
              }
            }
          }).result.then(() => {
            console.log("edited task after modal:", $scope.taskToEdit);

            // $scope.taskBeforeEdit=$scope.taskToEdit;
            $scope.changeEditedTaskForDemo();
          }, () => {
            // $scope.taskToEdit = $scope.taskBeforeEdit;
            $scope.restoreEditedTask();
          });
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

      let blankTask = {
        LevelName: "Factory",
        SubjectTrans: "Quality",
        ID: 319,
        TaskID: 319,
        HistoryID: 751,
        TaskStatus: 2,
        StatusName: "TO-DO",
        TaskCreateUser: 1575,
        CreateUserName: "eti eti",
        Assignee: 1553,
        AssigneeDisplayName: null,
        AssigneeDisplayHName: null,
        HistoryUser: 0,
        HistoryDisplayHName: null,
        HistoryDisplayName: null,
        TaskCreateDate: "2020-03-12T16:36:42.77",
        TaskStartTimeTarget: null,
        TaskEndTimeTarget: null,
        SubjectID: 1,
        TaskPriorityID: 2,
        HistoryCreateDate: "2020-03-12T16:36:42.85",
        LevelName1: "Factory",
        ObjectID: 0,
        LName: "dev",
        EName: "dev",
        EstimatedExecutionTime: 0,
        Text: null,
        TaskPriorityTrans: "Medium",
        TaskLevel: 1,
        levelHeb: "מפעל",
        leveleng: "Factory",
        levelrus: "Завод",
        levelspn: "Fábrica",
        levelarb: null,
        levelchn: "工厂",
        levelned: null,
        levelger: "Fabrik",
        levelfre: "Usine",
        levelukr: null,
        levelita: "Stabilimento",
        levelhun: "Gyár",
        levelprt: null,
        levelpol: "Fabryka",
        SubjectHeb: "איכות",
        Subjecteng: "Quality",
        Subjectrus: "Качество",
        Subjectspn: "Calidad",
        Subjectarb: "النوعية",
        Subjectchn: "品质",
        Subjectned: null,
        Subjectger: "Qualität",
        Subjectfre: "Qualité",
        Subjectukr: null,
        Subjectita: "Qualità",
        Subjecthun: "Minőség",
        Subjectprt: null,
        Subjectpol: null
      }

      $scope.fetchTasksData = function () {
        LeaderMESservice.customAPI("GetTaskObjects", {
          SourceTaskCreationPlatform: 1
        }).then(function (response) {
          $scope.tasksData = response["ResponseDictionaryDT"];
          $scope.Shared.dummyStatuses = $scope.tasksData["Status"];
          angular.forEach($scope.tasksData["Status"], function (status, statusIndex) {
            $scope.Shared.preTaskStatuses[status["ID"]] = status;
            $scope.Shared.preTaskStatuses[status["ID"]]["open"] = false;
            $scope.Shared.preTaskStatuses[status["ID"]]["tasks"] = [];
            $scope.Shared.preTaskStatuses[status["ID"]]["Otasks"] = [];
            // $scope.Shared.preTaskStatuses[status["ID"]]["Btasks"] = []; //blank tasks
          });
          //default to - do status needs to be open
          if ($scope.currentOpenTaskID > 0)
            $scope.Shared.preTaskStatuses[$scope.currentOpenTaskID]["open"] = true;

          // angular.forEach($scope.tasksData["Subjects"], function (subject, subjectIndex) {
          //   $scope.taskSubjects[subject["ID"]] = subject["DisplayName"];
          // });


          LeaderMESservice.customAPI("GetTaskProgress", {
            SourceTaskCreationPlatform: 1,
            hoursToDisplay:Number($scope.filter['doneCancelLastXDays'])*24
          }).then(function (response) {
            $scope.tasks = response["ResponseDictionaryDT"]["TaskProgress"];
            // console.log("scope.tasks:", $scope.tasks);
            angular.forEach(response["ResponseDictionaryDT"]["TaskProgress"], function (task, taskIndex) {
              if (task["TaskStatus"] === 0) {
                task["TaskStatus"] = 2;
              }

              $scope.taskSubjects[task["SubjectID"]] = {ID:task["SubjectID"],name:task["SubjectTrans"]};
              $scope.filter.Subjects[task["SubjectID"]]=true;


              switch ($scope.tasksPermissionLevel) {
                case 0: //user w/o task permission
                  if (task["TaskStatus"] !== 1 && task["Assignee"] == $scope.userID) {
                    $scope.Shared.preTaskStatuses[task["TaskStatus"]]["Otasks"].push(task);

                  } else if (task["TaskStatus"] == 1) {
                    $scope.Shared.preTaskStatuses[task["TaskStatus"]]["Otasks"].push(task);
                  }
                  break;
                case 1: //user with task permission
                  if (task["TaskStatus"] !== 1 && (task["Assignee"] == $scope.userID || task["TaskCreateUser"] == $scope.userID)) {
                    $scope.Shared.preTaskStatuses[task["TaskStatus"]]["Otasks"].push(task);
                  } else if (task["TaskStatus"] == 1) {
                    $scope.Shared.preTaskStatuses[task["TaskStatus"]]["Otasks"].push(task);
                  }
                  break;
                default: //tasks manager user
                  $scope.Shared.preTaskStatuses[task["TaskStatus"]]["Otasks"].push(task);
              }

            });



            $scope.Shared.taskStatuses = angular.copy($scope.Shared.preTaskStatuses);
            $scope.realStatusesAreReady = true;
            // $scope.makeItDraggabale();
            $scope.makeItDragAndDrop();


            $scope.taskUsers = $scope.rtl ? $scope.getItems("AssigneeDisplayHName", $scope.tasks) : $scope.getItems("AssigneeDisplayName", $scope.tasks);
            $scope.getTaskLevelObjects($scope.tasks);
            // console.log("taskProgrees after filter:", $scope.Shared.preTaskStatuses);
          });

          LeaderMESservice.customAPI("GetTaskLevelObjects", {
            SourceTaskCreationPlatform: 1
          }).then(function (response) {
            $scope.taskLevelObjects = response["ResponseDictionaryDT"];
          });

          LeaderMESservice.customAPI("GetTaskOpenByUserDetails", {
            SourceTaskCreationPlatform: 1
          }).then(function (response) {
            $scope.newTaskUserName = $scope.rtl ?
              response.ResponseDictionaryDT.User[0]["DisplayHName"] :
              response.ResponseDictionaryDT.User[0]["DisplayName"];

            //user doesnt have tasks module- can only assign himself

            if ($scope.tasksPermissionLevel == 0) {
              $scope.newTaskFields['AssigneeID'] = LeaderMESservice.getUserID();
              $scope.newTaskFields['Assignee'] = $scope.newTaskUserName;
            }

          });

          LeaderMESservice.customAPI("GetUsersForTask", {
            SourceTaskCreationPlatform: 1
          }).then(function (response) {

            $scope.suggestions = response.ResponseDictionaryDT.Users;
            $scope.suggestionsAreReady = true;
          });

          $scope.$applyAsync();
        });

      }

      $scope.fetchTasksData();

      refreshFunction = $interval($scope.fetchTasksData, TASKS.TASKS_REFRESH_TIME);


      $scope.$on('$destroy', function () {
        $("body").css("overflow-y", "initial");
        $interval.cancel(refreshFunction);
        filterWatcher();
        inputFilterWatcher();
        orderByWatcher();
      });

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
          //edit a task
          // $scope.saveEditTaskDisabled = false;
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

          if ($scope.taskToEdit['TaskStatus'] === 1) {
            $scope.taskToEdit["ObjectID"] = 0;
          }
          // console.log("taskToEdit berfore send to api", $scope.taskToEdit);
          //status changed,need to update history of task to get new HistoryID
          if ($scope.statusBeforeEdit != $scope.taskToEdit['TaskStatus']) {

            LeaderMESservice.customAPI("CreateTaskHistory", {
              task: {
                TaskID: $scope.taskToEdit['TaskID'],
                Status: $scope.taskToEdit['TaskStatus'],
                Assignee: LeaderMESservice.getUserID(),
                SourceTaskCreationPlatform: 1
              }
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
                if ($scope.taskToEdit["Assignee"] == "") {
                  $scope.taskToEdit["Assignee"] = LeaderMESservice.getUserID();
                }

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
                    Status: Number($scope.taskToEdit['TaskStatus'])
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
                    Status: Number($scope.taskToEdit['TaskStatus'])
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

                    //files upload

                    // if ($scope.taskToEdit['file'] != "") {
                    //   $scope.uploadTaskFiles($scope.taskToEdit['TaskID'], false);
                    // }
                    // $scope.editTaskObjectChanged($scope.taskToEdit['ObjectID']);
                    // $scope.fetchTasksData();
                    $scope.$close();
                    // $scope.$dismiss();
                    // $scope.ClearNewTaskField();
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
                Status: Number($scope.taskToEdit['TaskStatus'])
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
                Status: Number($scope.taskToEdit['TaskStatus'])
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

                // $scope.editTaskObjectChanged($scope.taskToEdit['ObjectID'])
                // $scope.$dismiss();
                $scope.$close();
              }
            });
          }
        }

        if($scope.taskToEdit["DisplaySubTasks"] || $scope.taskToEdit["DisplayNewSubTasks"]){
          console.log("entered edit sub tasks");
          $scope.taskToEdit.NumOfOpenSubTasks=1;
        }

        $timeout(()=>{
          $scope.settings.saveEditTaskDisabled = false;
        },2000);
        $(".saveEditTaskBtn").blur();
      }

      $scope.$on('updateEditedTask', function (data) {
        // console.log("updated Task to edit got here,", $scope.taskToEdit);
        $scope.taskToEdit = angular.copy(data.taskToEdit);
      });

      $rootScope.$on('draggingTasks', function (data) {
        $scope.isDragging = true;
      });

      $rootScope.$on("updateTaskObjectID", function (event, args) {
        // console.log("entered updateTaskOBJ with args:", args);
        if ($scope.taskToEdit["TaskLevel"] == 1)
          $scope.taskToEdit["ObjectID"] = 0;
        else
          $scope.taskToEdit["ObjectID"] = args.ObjectID;
      });

      $rootScope.$on("fetchTasksData", function (event, args) {
        $scope.fetchTasksData();
      });

      $rootScope.$on("tasksManagementFetchTasksData", function (event, args) {
        $scope.fetchTasksData();
      });



      $scope.toggleFilter = function () {
        $(".filterWrapper").fadeToggle(50);
        $(".closeFilterWindow").fadeToggle(50, () => {
          $(".searchFilter").toggleClass('focusShadow');
        });
      };


      $scope.CurrentDate = moment().format("MMM Do YY");
      tasksManagementScope = $scope;

      $scope.openInfo = function () {
        if ($scope.content.subMenu.allMachines) {
          window.open(GLOBAL.allMachines, "_blank");
        } else if (
          ($scope.tasksManagementTab && $scope.tasksManagementTab.selectedTab == "newOnline") ||
          ($scope.tasksManagementTab && $scope.tasksManagementTab.selectedTab == "newShift")
        ) {
          window.open(GLOBAL.factoryView, "_blank");
        } else if ($scope.tasksManagementTab && $scope.tasksManagementTab.selectedTab == "online") {
          window.open(GLOBAL.online, "_blank");
        } else if ($scope.tasksManagementTab && $scope.tasksManagementTab.selectedTab == "shift") {
          window.open(GLOBAL.shift, "_blank");
        }
      };

      $scope.handleTaskLevel = function () {
        if ($scope.newTaskFields["TaskLevelObjectID"] != "") $("#newTaskLevelObject").val("");
      };

      $scope.selectAssignee = function (assigneeID, assigneeDisplayName, isMiddle, isEdit) {

        if (isEdit) {
          $scope.taskToEdit["Assignee"] = assigneeID;
          $("#editTaskAssignee").val(assigneeDisplayName);
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
      $scope.withoutDoneStatus=(status)=>{
        return status.ID!=4;
      };

      $scope.permissionStatuses = (status) => {
        return status.ID != 5
      }

      $scope.taskDrag = function (task) {
        LeaderMESservice.customAPI("CreateTaskHistory", {
          task: {
            TaskID: task['TaskID'],
            Status: task['TaskStatus'],
            Assignee: task['Assignee'],
            SourceTaskCreationPlatform: 1
          }
        }).then(function (response) {
          if (response.error) {
            let failMessage = $scope.rtl ? "שגיאה בהחלפת סטטוס" :
              "failed to change status.";
            notify({
              message: failMessage,
              classes: "alert-danger",
              duration: 1000,
              templateUrl: "views/common/notifyTasks.html"
            });
          } else {
            let successMessage = $scope.rtl ? "סטטוס הוחלף בהצלחה" :
              "successfully changed status.";

            notify({
              message: successMessage,
              classes: "alert-success",
              duration: 1000,
              templateUrl: "views/common/notifyTasks.html"
            });
          }
        });
      };

      $scope.taskChangeStatus = function (taskID, taskNewStatus, statusIDBeforeChange) {
        let pos = $scope.Shared.taskStatuses[statusIDBeforeChange]['Otasks'].map(function (taskToChange) {
          return taskToChange.TaskID;
        }).indexOf(taskID);

        // console.log("pos found:", pos);
        $scope.Shared.taskStatuses[statusIDBeforeChange]['Otasks'][pos]['TaskStatus'] = taskNewStatus;
        let newTask = angular.copy($scope.Shared.taskStatuses[statusIDBeforeChange]['Otasks'][pos]);
        // console.log("new task:", newTask);


        LeaderMESservice.customAPI("CreateTaskHistory", {
          task: {
            TaskID: newTask['TaskID'],
            Status: taskNewStatus,
            Assignee: newTask['Assignee'],
            SourceTaskCreationPlatform: 1
          }
        }).then(function (response) {
          if (response.error) {
            let failMessage = $scope.rtl ? "שגיאה בהחלפת סטטוס" :
              "failed to change status.";
            notify({
              message: failMessage,
              classes: "alert-danger",
              duration: 1000,
              templateUrl: "views/common/notifyTasks.html"
            });
          } else {
            let successMessage = $scope.rtl ? "סטטוס הוחלף בהצלחה" :
              "successfully changed status.";

            notify({
              message: successMessage,
              classes: "alert-success",
              duration: 1000,
              templateUrl: "views/common/notifyTasks.html"
            });

            // change task status in view

            $scope.Shared.taskStatuses[statusIDBeforeChange]['Otasks'].splice(pos, 1);
            $scope.Shared.taskStatuses[newTask['TaskStatus']]['Otasks'].push(angular.copy(newTask));

            $scope.makeItDraggabale("#task" + taskID);
            for (let i = 1; i < 6; i++) {
              if ($(`#hoverZone${i}`).hasClass("taskHoverZoneDisabled"))
                $(`#hoverZone${i}`).toggleClass("taskHoverZoneDisabled");
              if ($(`#hoverZone${i}`).hasClass("taskHoverZoneHover"))
                $(`#hoverZone${i}`).toggleClass("taskHoverZoneHover");
            }
          }
        });
      };

      $scope.openurl = function (url) {
        window.open(url, '_blank');
      }


      $scope.taskAttachFiles = function (fromNew) {

        if (fromNew) {
          // $scope.newTaskFields['newFilesToUpload'].push($scope.newTaskFields['file']);

          if ($scope.newTaskFields['file'] && $scope.newTaskFields['file'].type.indexOf('pdf') >= 0) {
            var currentBlob = new Blob([$scope.newTaskFields['file']], {
              type: 'application/pdf'
            });
            $scope.taskPdfUrl = URL.createObjectURL(currentBlob);
          }
          // $scope.newTaskFields['file']="";
        } else {
          // $scope.taskToEdit['newFilesToUpload'].push($scope.taskToEdit['file']);

          if ($scope.taskToEdit['file'] && $scope.taskToEdit['file'].type.indexOf('pdf') >= 0) {
            var currentBlob = new Blob([$scope.taskToEdit['file']], {
              type: 'application/pdf'
            });
            $scope.taskPdfUrl = URL.createObjectURL(currentBlob);
          }
          // $scope.taskToEdit['file']="";
        }

      };

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

      $scope.requiredField = {};

      $scope.checkStatus = function () {
        if ($scope.newTaskFields["Status"] === "") {
          $scope.requiredField["Status"] = true;
          return false;
        }

        return true;
      };

      $scope.checkSubject = function () {
        return $scope.newTaskFields["Subject"] != "";
      };

      $scope.checkSubjectEdit = function () {
        return $scope.taskToEdit["SubjectID"] != "";
      };

      $scope.checkText = function () {
        return ($scope.newTaskFields["Text"] != undefined && $scope.newTaskFields["Text"] != "");
      };

      $scope.checkTextEdit = function () {
        return ($scope.taskToEdit["Text"] !=undefined && $scope.taskToEdit["Text"] != "");
      };


      $scope.checkLevel = function () {
        return ($scope.newTaskFields["TaskLevel"] >= 1 && $scope.newTaskFields["TaskLevel"] != "") || $scope.newTaskFields["TaskLevel"] == 1;
      };

      $scope.checkObject = function () {
        return !($scope.newTaskFields['TaskLevel'] > 1 && $scope.newTaskFields['TaskLevelObjectID'] == '');
      };

      $scope.checkLevelEdit = function () {
        return ($scope.taskToEdit["TaskLevel"] != "" && Number($scope.taskToEdit["TaskLevel"]) >= 1);
      };

      $scope.checkObjectEdit = function () {
        return !(Number($scope.taskToEdit['TaskLevel']) > 1 && $scope.taskToEdit['ObjectID'] == '');
      };

      $scope.checkSeverity = function () {
        return $scope.newTaskFields["Priority"] != "";
      };

      $scope.checkSeverityEdit = function () {
        return $scope.taskToEdit["TaskPriorityID"] != "";
      };

      $scope.checkAssignee = function () {
        return !($scope.newTaskFields['selectedAssignee'] === false && $scope.newTaskFields['Assignee'] != '' && $scope.ManageTasks);
      };

      $scope.checkAssigneeEdit = function () {
        return $scope.taskToEdit["Assignee"] != "" || $scope.ManageTasks === false;
      };

      $scope.checkDates = function () {
        if ($scope.newTaskFields["startDate"] == "") {
          $scope.newTaskFields["startDate"] = null;
        }

        if ($scope.newTaskFields["endDate"] == "") {
          $scope.newTaskFields["endDate"] = null;
        }
        //one of the dates has input
        if ($scope.newTaskFields["startDate"] || $scope.newTaskFields["endDate"]) {
          // if ($scope.newTaskFields["startDate"] &&
          //   $scope.firstDateIsPastDayComparedToSecond(new Date($scope.newTaskFields["startDate"]), new Date())) {
          //   $scope.requiredField['startDate'] = true;
          // } else if (($scope.newTaskFields["endDate"] && !$scope.newTaskFields["startDate"])) {
          //   $scope.requiredField['startDate'] = true;
          // } else {
          //   $scope.requiredField['startDate'] = false;
          // }

          if ($scope.newTaskFields["endDate"] &&
            ($scope.firstDateIsPastDayComparedToSecond(new Date($scope.newTaskFields["endDate"]), new Date($scope.newTaskFields["startDate"])))) {
            $scope.requiredField['endDate'] = true;
          } else {
            $scope.requiredField['endDate'] = false;
          }

          if (($scope.requiredField['startDate'] && $scope.requiredField['startDate'] === true) ||
            ($scope.requiredField['endDate'] && $scope.requiredField['endDate'] === true))
            return false;
        }
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
        if ($scope.taskToEdit['TaskStartTimeTarget']!=null || $scope.taskToEdit['TaskEndTimeTarget']!=null) {
          // if ($scope.taskToEdit["startDate"] &&
          //   $scope.firstDateIsPastDayComparedToSecond(new Date($scope.taskToEdit["startDate"]), new Date())) {
          //   $scope.requiredField['startDate'] = true;
          // } else if (($scope.taskToEdit["endDate"] && !$scope.taskToEdit["startDate"])) {
          //   $scope.requiredField['startDate'] = true;
          // } else {
          //   $scope.requiredField['startDate'] = false;
          // }

          if ($scope.taskToEdit["TaskStartTimeTarget"] && $scope.taskToEdit["TaskEndTimeTarget"] &&
            ($scope.firstDateIsPastDayComparedToSecond(new Date($scope.taskToEdit["TaskEndTimeTarget"]), new Date($scope.taskToEdit["TaskStartTimeTarget"])))) {
            $scope.requiredField['endDate'] = true;
          } else {
            $scope.requiredField['endDate'] = false;
          }

          if (($scope.requiredField['startDate'] && $scope.requiredField['startDate'] === true) ||
            ($scope.requiredField['endDate'] && $scope.requiredField['endDate'] === true))
            return false;
        }
        return true;
      };

      $scope.checkEstimated = function () {

        if ($scope.newTaskFields["Hour"] == "") {
          $scope.newTaskFields["Hour"] = 0;
        }

        if ($scope.newTaskFields["Min"] == "") {
          $scope.newTaskFields["Min"] = 0;
        }

        if (isNaN($scope.newTaskFields["Hour"]) || Number($scope.newTaskFields["Hour"]) < 0 ||
          isNaN($scope.newTaskFields["Min"]) || Number($scope.newTaskFields["Min"]) < 0) {

          if (isNaN($scope.newTaskFields["Hour"]) || Number($scope.newTaskFields["Hour"]) < 0) {
            $scope.requiredField['estimatedHours'] = true;
          } else {
            $scope.requiredField['estimatedHours'] = false;
          }

          if (isNaN($scope.newTaskFields["Min"]) || Number($scope.newTaskFields["Min"]) < 0) {
            $scope.requiredField['estimatedMins'] = true;
          } else {
            $scope.requiredField['estimatedMins'] = false;
          }

          if (($scope.requiredField['estimatedHours'] && $scope.requiredField['estimatedHours'] === true) ||
            ($scope.requiredField['estimatedMins'] && $scope.requiredField['estimatedMins'] === true))
            return false;
        }

        $scope.newTaskFields["EstimatedExecutionTime"] = (Number($scope.newTaskFields["Hour"]) * 60 + Number($scope.newTaskFields["Min"]));


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
            ($scope.requiredField['estimatedMins'] && $scope.requiredField['estimatedMins'] === true))
            return false;
        }

        $scope.taskToEdit["EstimatedExecutionTime"] = Number($scope.taskToEdit["estimatedHours"]) * 60 + Number($scope.taskToEdit["estimatedMins"]);


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

      }


      $scope.AddNewTask = function () {
        $scope.submitDisabled = true;
        if (
          $scope.checkSubject() &&
          $scope.checkText() &&
          $scope.checkLevel() &&
          $scope.checkObject() &&
          $scope.checkSeverity() &&
          $scope.checkAssignee() &&
          $scope.checkDates() &&
          $scope.checkEstimated()
        ) {
          //post new task
          // $scope.submitDisabled = false;

          if ($scope.newTaskFields['AssigneeID'] == "") {
            $scope.newTaskFields['AssigneeID'] = LeaderMESservice.getUserID();
          }
          $scope.newTaskFields["Subject"] = Number($scope.newTaskFields["Subject"]);
          $scope.newTaskFields["TaskLevel"] = Number($scope.newTaskFields["TaskLevel"]);
          $scope.newTaskFields["TaskLevelObjectID"] = Number($scope.newTaskFields["TaskLevelObjectID"]);
          $scope.newTaskFields["Priority"] = Number($scope.newTaskFields["Priority"]);
          $scope.newTaskFields["AssigneeID"] = Number($scope.newTaskFields["AssigneeID"]);
          // $scope.newTaskFields["Assignee"] = $scope.newTaskFields["AssigneeID"]
          $scope.newTaskFields["EstimatedExecutionTime"] = Number($scope.newTaskFields["EstimatedExecutionTime"]);
          $scope.newTaskFields["TaskStatus"] = 3;


          let taskPropsToSend = {
            HistoryID: 0,
            CreateUser: LeaderMESservice.getUserID(),
            Subject: Number($scope.newTaskFields["Subject"]),
            Text: $scope.newTaskFields["Text"],
            TaskLevel: Number($scope.newTaskFields["TaskLevel"]),
            TaskLevelObjectID: Number($scope.newTaskFields["TaskLevelObjectID"]),
            Priority: Number($scope.newTaskFields["Priority"]),
            Assignee: Number($scope.newTaskFields["AssigneeID"]),
            StartTimeTarget: $scope.newTaskFields["startDate"],
            EndTimeTarget: $scope.newTaskFields["endDate"],
            EstimatedExecutionTime: Number($scope.newTaskFields["EstimatedExecutionTime"]),
            SourceTaskCreationPlatform: 1,
            Status: 0
          }

          if ($scope.newTaskFields["EstimatedExecutionTime"] === 0) {
            taskPropsToSend = {
              HistoryID: 0,
              CreateUser: LeaderMESservice.getUserID(),
              Subject: Number($scope.newTaskFields["Subject"]),
              Text: $scope.newTaskFields["Text"],
              TaskLevel: Number($scope.newTaskFields["TaskLevel"]),
              TaskLevelObjectID: Number($scope.newTaskFields["TaskLevelObjectID"]),
              Priority: Number($scope.newTaskFields["Priority"]),
              Assignee: Number($scope.newTaskFields["AssigneeID"]),
              StartTimeTarget: $scope.newTaskFields["startDate"],
              EndTimeTarget: $scope.newTaskFields["endDate"],
              SourceTaskCreationPlatform: 1,
              Status: 0,
              TaskSteps:$scope.newTaskFields["DisplayNewSubTasks"]
            }
          } else {
            taskPropsToSend = {
              HistoryID: 0,
              CreateUser: LeaderMESservice.getUserID(),
              Subject: Number($scope.newTaskFields["Subject"]),
              Text: $scope.newTaskFields["Text"],
              TaskLevel: Number($scope.newTaskFields["TaskLevel"]),
              TaskLevelObjectID: Number($scope.newTaskFields["TaskLevelObjectID"]),
              Priority: Number($scope.newTaskFields["Priority"]),
              Assignee: Number($scope.newTaskFields["AssigneeID"]),
              StartTimeTarget: $scope.newTaskFields["startDate"],
              EndTimeTarget: $scope.newTaskFields["endDate"],
              EstimatedExecutionTime: Number($scope.newTaskFields["EstimatedExecutionTime"]),
              SourceTaskCreationPlatform: 1,
              Status: 0,
              TaskSteps:$scope.newTaskFields["DisplayNewSubTasks"]
            }
          }



          LeaderMESservice.customAPI("CreateTask", {
            task: taskPropsToSend
          }).then(function (response) {

            if (response.error) {
              let failMessage = $scope.rtl ? "יצירת המשימה נכשלה!." :
                "failed to generate new Task!";

              notify({
                message: failMessage,
                classes: "alert-danger",
                duration: 1000,
                templateUrl: "views/common/notifyTasks.html"
              });
            } else {
              let successMessage = $scope.rtl ? "משימה חדשה נוצרה בהצלחה!" :
                "successfully created new task!";
              notify({
                message: successMessage,
                classes: "alert-success",
                duration: 1000,
                templateUrl: "views/common/notifyTasks.html"
              });

              //add new task to view- demi
              $scope.newTaskFields['ID'] = response.LeaderRecordID;
              $scope.newTaskFields['TaskID'] = response.LeaderRecordID;


              // $scope.$dismiss();
              $scope.$close();

              ///upload file
              if ($scope.newTaskFields['file'] != "") {
                $scope.uploadTaskFiles(response.LeaderRecordID, true);
              }

              let notificationText=$scope.rtl?
                  `משימה 
              ${$scope.taskSubjects[Number($scope.newTaskFields["Subject"])].name}
               חדשה שוייכה אליך מ
               ${$scope.newTaskUserName}
               `:
                  `A new ${$scope.taskSubjects[Number($scope.newTaskFields["Subject"])].name} task assigned to you from ${$scope.newTaskUserName}`;

              let notificationTitle=$scope.rtl?
                  `משימה חדשה`
                  :
                  `New task`;

              if($scope.newTaskFields["AssigneeID"]!="" && Number($scope.newTaskFields["AssigneeID"])){
                let targetUserName= $scope.suggestions.find(user => user.ID === $scope.newTaskFields["AssigneeID"]).DisplayName;

                let targetUserID= Number($scope.newTaskFields["AssigneeID"]);

                LeaderMESservice.customAPI('SendTaskNotification', {
                  "targetUserID": targetUserID,
                  "sourceUserName" : $scope.newTaskUserName,
                  "SourceWorkerID" : LeaderMESservice.getUserID(),
                  "targetUserName" : targetUserName,
                  "Text" : notificationText,
                  "Title" : notificationTitle,
                  "TaskID":response.LeaderRecordID
                }).then(function(response){
                  if(response.error){
                    notify({
                      message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                      classes: 'alert-danger',
                      templateUrl: 'views/common/notify.html'
                    });
                    return;
                  }
                  // else{
                  //   toastr.success("", $filter('translate')('CALLED_SUCCESSFULLY'))//change this
                  //   $scope.updateTechnicianStatus();
                  //   $scope.updateNotifications();
                  // }
                })
              }



            }
          });
        }
        $scope.submitDisabled = false;
        $(".submitNewTaskBtn").blur();
      };

      $scope.gaE = function (page_view, event_name) {
        googleAnalyticsService.gaEvent(page_view, event_name);
      };


      $scope.openNewTaskWindow = function () {
        var modalInstance = $modal
          .open({
            templateUrl: "views/common/newTaskMiddle.html",
            backdrop: 'static',
            controller: MainCtrl,
            scope: $scope
          })
          .result.then(function () {
            $rootScope.$broadcast("fetchTasksData", {});
          });
      };

      $scope.sortableOptions = {
        connectWith: ".statuses-container",
        stop: function (event, ui) {
          // Object.keys(ui.item.sortable).forEach(function (k) {
          //   console.log(k, ui.item.sortable[k]);
          // });

          let fromStatus = Number(ui.item.sortable['source'][0].attributes.statusid.value);
          // console.log("fromStatus", fromStatus);

          let targetStatus = Number(ui.item.sortable['droptarget'][0].attributes.statusid.value);

          ui.item.sortable['model']['TaskStatus'] = targetStatus;
          $scope.taskDrag(ui.item.sortable['model']);

          // ui.item.sortable['model'].TaskStatus=5;
          // console.log("event:",event);
          // console.log("ui:",ui);
          // if (!ui.item.sortable.received) {
          //   var originNgModel = ui.item.sortable.sourceModel;
          //   var itemModel = originNgModel[ui.item.sortable.index];

          //   // check that its an actual moving
          //   // between the two lists
          //   if (originNgModel == $scope.list1 &&
          //       ui.item.sortable.droptargetModel == $scope.list2) {
          //     var exists = !!$scope.list2.filter(function(x) {return x.title === itemModel.title }).length;
          //     if (exists) {
          //      ui.item.sortable.cancel();
          //     }
          //   }
          // }
        }
      };


      $scope.print = (msg) => {
        console.log(msg);
      }


    }

    return {
      tasksManagementCode: tasksManagementCode
    };
  });
