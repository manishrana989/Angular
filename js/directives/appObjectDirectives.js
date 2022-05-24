function appObjectTabsDirective($compile) {
  var Template = "views/common/appObjectTabs.html";

  var linker = function (scope, element, attrs) {

    console.log(element);
  };

  var controller = function (
    $scope,
    $rootScope,
    $timeout,
    commonFunctions,
    LeaderMESservice,
    customServices,
    SweetAlert,
    $filter,
    notify,
    $window,
    $state,
    $stateParams,
    $modal,
    $interval,
    $localStorage
  ) {
    function init() {
      $timeout(function () {
        $("html").scrollTop(0);
      }, 1000);

      $scope.changes = [];
      $scope.tabTemplate = [];
      $scope.actionsData = {};
      $scope.actionParams = {};
      $scope.showActions = false;
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      if ($scope.content.ID) {
        $scope.content.ID = parseInt($scope.content.ID);
      }
      if ($scope.content.id === 0) {
        $scope.newObject = true;
        $scope.tabs = LeaderMESservice.getTabsByID($scope.content.objectTopMenuID);

      } else {
        $scope.newObject = false;
        $scope.tabs = LeaderMESservice.getTabsByAppName($scope.content.linkItem);
      }

      if ($scope.tabs && $scope.tabs.Actions) {
        var activateAction = _.find($scope.tabs.Actions, { SubMenuAppPartID: 20225 });
        if (activateAction) {
          activateAction.updateData = function () {
            $state.transitionTo($state.current, $stateParams, {
              reload: true,
              inherit: false,
              notify: true,
            });
          };
        }
      }


      if ($stateParams.tabId && $stateParams.tabId != "") {
        $scope.tabId = parseInt($stateParams.tabId);
      }
      if (!$scope.tabs) {
        SweetAlert.swal(
          {
            title: "Error",
            text: $filter("translate")("AUTHENTICATION_PROBLEM"),
            type: "error",
          },
          function () {
            window.location.href = "/#/";
          }
        );

        return;
      }
      $scope.objectTypeID = $scope.tabs.TopMenuFileObjectRelation;

      var addTabs = function (i) {
        if ($scope.tabId == $scope.tabs.subMenu[i].SubMenuAppPartID) {
          $scope.initToTab = functionPagesReference.length + 1;
        }
        if (
          typeof $scope.tabs.subMenu[i].ActionCriteria == "string" &&
          $scope.tabs.subMenu[i].ActionCriteria !== "" &&
          $scope.tabs.subMenu[i].ActionCriteria !== null
        ) {
          $scope.tabs.subMenu[i].ActionCriteria = JSON.parse($scope.tabs.subMenu[i].ActionCriteria);
        }
        if ($scope.tabs.subMenu[i].ActionCriteria && $scope.tabs.subMenu[i].ActionCriteria.criteria) {
          for (var j = 0; j < $scope.tabs.subMenu[i].ActionCriteria.criteria.params.length; j++) {
            if (
              $scope.content.targetParameters &&
              $scope.content.targetParameters[$scope.tabs.subMenu[i].ActionCriteria.criteria.params[j]]
            ) {
              $scope.actionParams[$scope.tabs.subMenu[i].ActionCriteria.criteria.params[j]] =
                $scope.content.targetParameters[$scope.tabs.subMenu[i].ActionCriteria.criteria.params[j]];
            } else {
              $scope.actionParams[$scope.tabs.subMenu[i].ActionCriteria.criteria.params[j]] = "";
            }
          }
        }
        $scope.tabs.subMenu[i].showTab = false;
        if ($scope.tabs.subMenu[i].SubMenuTargetTYpe != "form" && i > 0) {
          $scope.showActions = true;
        } else if ($scope.tabs.subMenu[i].SubMenuTargetTYpe != "form" && i == 0) {
          $scope.showActions = true;
        }
        if ($scope.tabs.subMenu[i].SubMenuTargetTYpe === "form") {
          $scope.tabs.subMenu[i].template = "views/common/form.html";
          functionPagesReference.push(DisplayFormResultsTab);
          return $scope.tabs.subMenu[i];
        } else if ($scope.tabs.subMenu[i].SubMenuTargetTYpe === "multiforms") {
          $scope.tabs.subMenu[i].template = "views/common/multiFormTemplate.html";
          functionPagesReference.push(editableListTab);

          return $scope.tabs.subMenu[i];
        } else if ($scope.tabs.subMenu[i].SubMenuTargetTYpe === "continuousform") {
          $scope.tabs.subMenu[i].template = "views/common/continuousFormTemplate.html";
          functionPagesReference.push(continuousFormTab);
          return $scope.tabs.subMenu[i];
        } else if ($scope.tabs.subMenu[i].SubMenuTargetTYpe === "report") {
          $scope.tabs.subMenu[i].template = "views/common/searchResultsTemplate.html";
          functionPagesReference.push(GetResultSearchFieldsTab);
          return $scope.tabs.subMenu[i];
        } else if ($scope.tabs.subMenu[i].SubMenuTargetTYpe.indexOf("custom") === 0) {
          //$scope.tabs.subMenu[i].template = 'views/common/customTemplate.html';
          if (i == 0) {
            $scope.tabs.subMenu[i].template = customServices.customGetTemplate($scope.tabs.subMenu[i].SubMenuTargetTYpe);
            if ($scope.tabs.subMenu[i].template == "views/common/customTemplate.html") {
              $scope.tabs.subMenu[i].general = false;
            } else {
              $scope.tabs.subMenu[i].general = true;
            }

          } else {
            $scope.tabs.subMenu[i].template = "views/common/customTemplate.html";
            $scope.tabs.subMenu[i].general = false;
          }

          functionPagesReference.push(DisplayCustomTab);
          return $scope.tabs.subMenu[i];
        } else {
          $scope.tabs.subMenu[i].template = "views/common/form.html";
          functionPagesReference.push(DisplayFormResultsTab);
          $scope.formId = 0;
          return $scope.tabs.subMenu[i];
        }
      };
      var tabs = [];
      for (var i = 0; i < $scope.tabs.subMenu.length; i++) {
        //sounrd with new if /*if ($scope.tabs.subMenu[i].type or soemthing likr it , if it equals tab */
        if ($scope.content.tabs) {
          if ($scope.content.tabs.indexOf($scope.tabs.subMenu[i].SubMenuEName) < 0) {
            continue;
          }
        }
        if ($scope.newObject === true) {
          if ($scope.tabs.subMenu[i].SubMenuEnableOnNew === true) {
            tabs.push(addTabs(i));
          }
        } else {
          tabs.push(addTabs(i));
        }
      } // else it's an action and not a tab (the side menu)

      var addActions = function (i) {
        // $scope.tabs.Actions[i].ActionCriteria = JSON.parse($scope.tabs.Actions[i].ActionCriteria);
        if (
          typeof $scope.tabs.Actions[i].ActionCriteria == "string" &&
          $scope.tabs.Actions[i].ActionCriteria !== "" &&
          $scope.tabs.Actions[i].ActionCriteria !== null
        ) {
          $scope.tabs.Actions[i].ActionCriteria = JSON.parse($scope.tabs.Actions[i].ActionCriteria);
        }
        if ($scope.tabs.Actions[i].ActionCriteria && $scope.tabs.Actions[i].ActionCriteria.criteria) {
          for (var j = 0; j < $scope.tabs.Actions[i].ActionCriteria.criteria.params.length; j++) {
            if (
              $scope.content.targetParameters &&
              $scope.content.targetParameters[$scope.tabs.Actions[i].ActionCriteria.criteria.params[j]]
            ) {
              $scope.actionParams[$scope.tabs.Actions[i].ActionCriteria.criteria.params[j]] =
                $scope.content.targetParameters[$scope.tabs.Actions[i].ActionCriteria.criteria.params[j]];
            } else {
              $scope.actionParams[$scope.tabs.Actions[i].ActionCriteria.criteria.params[j]] = "";
            }
          }
        }
        if ($scope.tabs.Actions[i].SubMenuTargetTYpe === "appObject") {
          $scope.tabs.Actions[i].template = "views/common/actionAppObject.html";
          functionPagesReference.push(DisplayFormResultsTab);
          return $scope.tabs.Actions[i];
        } else {
          //it's custom view - in modal dialogue
          $scope.tabs.Actions[i].template = "views/common/actions/customActionModal.html";
          return $scope.tabs.Actions[i];
        }
      };
      var actions = [];
      for (var i = 0; i < $scope.tabs.Actions.length; i++) {
        if ($scope.newObject === true) {
          if ($scope.tabs.Actions[i].SubMenuEnableOnNew === true) {
            actions.push(addActions(i));
          }
        } else {
          actions.push(addActions(i));
        }
      }

      $scope.tabs = tabs;    
      $scope.initTabs();
      $scope.$emit(
        "changeTitle",
        $scope.content.linkItem +
        " " +
        $scope.content.ID +
        " | " +
        ($scope.localLanguage ? $scope.tabs[0].SubMenuLName : $scope.tabs[0].SubMenuEName)
      );

      $scope.actionsData = {
        actions: actions,
        parentScope: $scope,
        params: $scope.actionParams,
        ID: $scope.content.ID,
        targetParameters: $scope.content.targetParameters,
        rowClicked: $scope.content.rowClicked,
        linkItem: $scope.content.linkItem,
        updateActionsParams: () => {
          //updateActionsParams: (groups, recordValue) => {
          for (var key in $scope.actionsData.params) {
            if (key === "UserID") {
              $scope.actionsData.params[key] = LeaderMESservice.getUserID();
              continue;
            }
            var field = _.find($scope.recordValue, { Name: key });
            //var field = _.find(recordValue, { Name: key });
            if (field) {
              $scope.actionsData.params[key] = field.value;
              if (typeof $scope.actionsData.params[key] == "number") {
                $scope.actionsData.params[key] = parseInt($scope.actionsData.params[key]);
              }
              continue;
            }
            for (var i = 0; i < $scope.groups.length; i++) {
              //for (var i = 0; i < groups.length; i++) {
              var group = groups[i];
              //var group = groups[i].value.Records;

              field = _.find(group.recordValue, { Name: key });
              if (field) {
                $scope.actionsData.params[key] = field.value;
                if (typeof $scope.actionsData.params[key] == "number") {
                  $scope.actionsData.params[key] = parseInt($scope.actionsData.params[key]);
                }
                break;
              }
            }
          }
          if ($scope.actionsData.actions.length > 0) {
            $scope.showActions = true;
          }
          if ($scope.initTabs) {
            $scope.initTabs();
          }
        },
      };
      $scope.pageDisplay = 1;
      functionPagesReference[$scope.pageDisplay - 1](0);
    }

    $scope.emptyPage = function (pageDisplay) {
      
      $scope.pageDisplay = 0;
      $timeout(function () {
        if (pageDisplay == 0) {
          pageDisplay = 1;
        }
        $scope.pageDisplay = pageDisplay;
        $scope.changes = [];
        if ($scope.content.topPageTitle) {
          
          LeaderMESservice.customAPI("DisplayAppObjectHeaderFields", {
            appObject: $scope.content.linkItem,
            LeaderID: $scope.content.ID,
          }).then(function (response) {
            $scope.content.topPageTitle.title = $scope.content.title + " # " + $scope.content.ID;
            if (response.Data && response.Data.length > 0) {
              
              for (var i = 0; i < response.Data.length; i++) {
                var fieldName = $scope.localLanguage ? response.Data[i].DisplayLName : response.Data[i].DisplayEName;
                var fieldValue = response.Data[i].Value;
                if (response.Data[i].UrlTarget && response.Data[i].UrlTarget != "") {
                  fieldValue =
                    '<a target="' +
                    response.Data[i].UrlTarget +
                    '" href="#/appObjectFullView/' +
                    response.Data[i].UrlTarget +
                    "/" +
                    response.Data[i].ID +
                    '/">' +
                    response.Data[i].Value +
                    "</a>";
                }
                $scope.content.topPageTitle.title = $scope.content.topPageTitle.title + " , " + fieldName + " = " + fieldValue;
              }
            }
          });
        }
        $scope.$emit(
          "changeTitle",
          $scope.content.linkItem +
          " " +
          $scope.content.ID +
          " | " +
          ($scope.localLanguage ? $scope.tabs[pageDisplay - 1].SubMenuLName : $scope.tabs[pageDisplay - 1].SubMenuEName)
        );
        functionPagesReference[$scope.pageDisplay - 1](pageDisplay - 1);
      }, 1000);
    };

    var getTargetParameters = function (tabIndex) {
      if ($scope.tabs[tabIndex].SubMenuTargetParameters == "") {
        return [];
      }
      var targetParameters = $scope.tabs[tabIndex].SubMenuTargetParameters.split("=");
      if ($scope.content.targetParameters) {
        targetParameters[1] = targetParameters[1].slice(1, -1);
        var result = {
          FieldName: targetParameters[0],
          DataType: "num",
          Eq: $scope.content.targetParameters[targetParameters[1]]
            ? $scope.content.targetParameters[targetParameters[1]]
            : $scope.content.ID,
        };
        return result;
      } else {
        return {
          FieldName: targetParameters[0],
          Eq: $scope.content.ID,
          DataType: "num",
        };
      }
    };

    var getTargetParametersSearchResult = function (tabIndex) {
      if ($scope.tabs[tabIndex].SubMenuTargetParameters == "") {
        return [];
      } else if ($scope.tabs[tabIndex].SubMenuTargetParameters.indexOf(",") < 0) {
        return [getTargetParameters(tabIndex)];
      }
      var targetParameters = $scope.tabs[tabIndex].SubMenuTargetParameters.split(",");
      var firstParameter = targetParameters[0].split("=");
      if ($scope.content.targetParameters) {
        firstParameter[1] = firstParameter[1].slice(1, -1);
        firstParameter = {
          FieldName: firstParameter[0],
          DataType: "num",
          Eq: $scope.content.targetParameters[firstParameter[1]] ? $scope.content.targetParameters[firstParameter[1]] : $scope.content.ID,
        };
      } else {
        firstParameter = {
          FieldName: firstParameter[0],
          Eq: $scope.content.ID,
          DataType: "num",
        };
      }
      var secondParameter = targetParameters[1].split("=");

      return [
        firstParameter,
        {
          FieldName: secondParameter[0],
          Eq: parseInt(secondParameter[1]),
          DataType: "num",
        },
      ];
    };
    var getTargetParametersLeader = function (tabIndex) {
      if ($scope.tabs[tabIndex].SubMenuTargetParameters == "") {
        return 0;
      }
      var targetParameters = $scope.tabs[tabIndex].SubMenuTargetParameters.split("=");
      if ($scope.content.targetParameters) {
        targetParameters[1] = targetParameters[1].slice(1, -1);
        return $scope.content.targetParameters[targetParameters[1]];
      }
      if (targetParameters !== "") {
        return $scope.content.ID;
      }
    };

    var getFormLeaderID = function (tabIndex) {
      var targetParameters = $scope.tabs[tabIndex].SubMenuTargetParameters.split("=");
      if ($scope.content.targetParameters) {
        targetParameters[1] = targetParameters[1].slice(1, -1);
        return $scope.content.targetParameters[targetParameters[1]];
      } else {
        return $scope.content.ID;
      }
    };

    var DisplayFormResultsTab = function (tabIndex) {
      $scope.tabIndex = tabIndex;
      $scope.actionName = "SAVE_CHANGES";
      $scope.formId = $scope.tabs[tabIndex].SubMenuExtID;
      $scope.SkipSaveOperation = $scope.tabs[tabIndex].SkipSaveOperation;
      var id = getFormLeaderID(tabIndex);
      $scope.api = "DisplayFormResults";
      $scope.leaderId = id;

      $scope.request = {
        LeaderID: id,
        formID: $scope.tabs[tabIndex].SubMenuExtID,
      }


      $scope.formCallBack = function () {
        $scope.saveForm();
      };

      var id = getFormLeaderID(tabIndex);
      $scope.actionName = "SAVE_CHANGES";
      var request = {
        LeaderID: id,
        formID: $scope.tabs[tabIndex].SubMenuExtID,
      };
      var requestResponse = {
        LeaderID: id,
        formID: $scope.tabs[tabIndex].SubMenuExtID,
        skipSaveOperation: $scope.tabs[tabIndex].SkipSaveOperation,
      };
      commonFunctions.formResults($scope, request, requestResponse, "DisplayFormResults", [], tabIndex === 0);
    };

    var GetResultSearchFieldsTab = function (tabIndex) {
      if ($scope.initToTab) {
        $scope.emptyPage($scope.initToTab);
        $scope.initToTab = null;
        return;
      }
      var targetParameters = getTargetParametersSearchResult(tabIndex);
      commonFunctions.searchResults(
        $scope,
        $scope.tabs[tabIndex].SubMenuExtID,
        targetParameters,
        "rowClicked",
        true,
        false,
        true,
        $scope.tabs[tabIndex].SubMenuEName
      );
    };


    var editableListTab = function (tabIndex) {
      if ($scope.initToTab) {
        $scope.emptyPage($scope.initToTab);
        $scope.initToTab = null;
        return;
      }
      var targetParameters = getTargetParameters(tabIndex);
      $scope.continuousForm = false;
      commonFunctions.editableTable(
        $scope,
        $scope.tabs[tabIndex].SubMenuExtID,
        targetParameters.FieldName,
        $scope.content.ID ? [targetParameters] : [],
        getTargetParametersLeader(tabIndex),
        $scope.tabs[tabIndex].SkipSaveOperation
      );

    };

    var continuousFormTab = function (tabIndex) {
      if ($scope.initToTab) {
        $scope.emptyPage($scope.initToTab);
        $scope.initToTab = null;
        return;
      }
      var targetParameters = getTargetParameters(tabIndex);
      delete $scope.editableTableData;
      $scope.continuousForm = true;
      commonFunctions.continuousForm(
        $scope,
        $scope.tabs[tabIndex].SubMenuExtID,
        targetParameters.FieldName,
        [targetParameters],
        getTargetParametersLeader(tabIndex),
        $scope.tabs[tabIndex].SkipSaveOperation
      );
    };

    var DisplayCustomTab = function (tabIndex) {
      var targetParameters = getTargetParameters(tabIndex);
      if (tabIndex === 0 && $scope.tabs[tabIndex].general == true) {
        $scope.content.SubMenuAppPartID = $scope.tabs[tabIndex].SubMenuAppPartID;
        $scope.generalTab = tabIndex === 0;
        customServices.customGetCode($scope, $scope.tabs[tabIndex].SubMenuTargetTYpe);
      } else {
        if ($scope.initToTab) {
          $scope.emptyPage($scope.initToTab);
          $scope.initToTab = null;
          return;
        }
        $scope.customContent = {
          ID: $scope.content.ID,
          subMenu: $scope.tabs[tabIndex],
          targetParameters: targetParameters,
          actionsData: $scope.actionsData,
          objectTypeID: $scope.objectTypeID,
          linkItem: $scope.content.linkItem,
        };
        if ($scope.allowFileUpload != undefined) {
          $scope.customContent.allowFileUpload = $scope.allowFileUpload;
        }
      }

    };

    commonFunctions.fieldChanges($scope);

    $scope.tabClicked = function (tabNumber, pageTitle) {
      
      if (tabNumber == $scope.pageDisplay) return;
      $scope.pageTitle = pageTitle;
      $scope.changes = [];
      if ($scope.recordValue) {
        $scope.recordValue = null;
      }
      $scope.pageDisplay = tabNumber;
      $scope.emptyPage($scope.pageDisplay);
    };
  
    $rootScope.$on('showOnTab',(event,value) => {
      $scope.showOnlyTab = value;
    });

    $scope.initTabs = function () {
      for (var i = 0; i < $scope.tabs.length; i++) {
        $scope.initTab($scope.tabs[i]);
      }
      if ($scope.initToTab && $scope.tabs[$scope.initToTab - 1].enabled) {
        $scope.emptyPage($scope.initToTab);
        $scope.initToTab = null;
        return;
      }
    };

    $scope.initTab = function (tab) {
      // if ($scope.tabId){
      //     tab.enabled = true;
      //     return;
      // }
      if (tab.ActionCriteria && tab.ActionCriteria !== "") {
        var criteria = tab.ActionCriteria;
        tab.enabled = jsonLogic.apply(criteria.criteria.condition, $scope.actionParams);
      } else {
        tab.enabled = true;
      }
    };

    var functionPagesReference = [];
    var actionModalsReference = []; //this will include all needed modal dialogues to be included, in the 'appObjectsTabs.html" and then be called from the Actions Menu, currently it wil only include the static ModalDialogue file name and an Id.

    init();
  };

  return {
    restrict: "E",
    link: linker,
    templateUrl: Template,
    scope: {
      content: "=",
      tabsControl: "=",
      actionsControl: "=",
    },
    controller: controller,
  };
}

function appObjectDirective($timeout, $compile) {
  var template = "views/common/mainContentTemplate.html";

  var controller = function ($scope, $compile, $modal, $timeout, LeaderMESservice, commonFunctions, $state) {
    function init() {
      var objectMenu = LeaderMESservice.getTabsByID($scope.content.SubMenuExtID);
      $scope.showBreadCrumb = true;
      if ($state.current.name == "appObjectFullView") {
        $scope.showBreadCrumb = false;
      }
      $scope.localLanguage = LeaderMESservice.showLocalLanguage();
      if (objectMenu.TopMenuNewObjectLinkID != 0) {
        $scope.showAdd = true;
      }
      $scope.openPage = true;
      $scope.openObjectDescription = function () {
        if (objectMenu.TopMenuObjectInformation) {
          return window.open(objectMenu.TopMenuObjectInformation, "_blank");
        }
      };

      $scope.openVideo = function () {
        const upperScope = $scope;

        $modal.open({
          templateUrl: "views/stopEventsModals/videoModal.html",
          windowClass: "stop-events",
          controllerAs: "stopEventsCtrl",
          controller: function ($scope, $modalInstance, LeaderMESservice) {
            $scope.localLanguage = LeaderMESservice.showLocalLanguage();

            $scope.isHeb = LeaderMESservice.getLanguage() == "heb";

            $scope.Close = function () {
              $modalInstance.close();
            };
          },
        });
      };

      $scope.add = function (ID) {
        var appObject = objectMenu;
        var url = $state.href("appObjectFullView", {
          appObjectName: appObject.TopMenuObjectKey,
          ID: ID,
        });
        var url = url + "?firstTime=true";
        var newWindow = window.open(url, appObject.TopMenuObjectKey);
        newWindow.close();
        window.open(url, appObject.TopMenuObjectKey);
        return;
      };

      $scope.openNewObject = function () {
        var newObjectInstance = $modal
          .open({
            templateUrl: "views/common/actions/customActionModal.html",
            resolve: {
              content: function () {
                return objectMenu;
              },
              parentScope: function () {
                return $scope;
              },
            },
            controller: function ($scope, $compile, $modalInstance, $timeout, commonFunctions, $state, content, parentScope) {
              var actionModalInstanceCtrl = this;
              actionModalInstanceCtrl.loading = true;
              actionModalInstanceCtrl.template = "views/common/form.html";
              $scope.localLanguage = LeaderMESservice.showLocalLanguage();
              actionModalInstanceCtrl.rtl = LeaderMESservice.isLanguageRTL();
              $scope.modalInstance = $modalInstance;
              $scope.parentScope = parentScope;
              if ($scope.localLanguage) {
                actionModalInstanceCtrl.title = content.TopMenuLName;
              } else {
                actionModalInstanceCtrl.title = content.TopMenuEName;
              }
              var tab = _.find(content.subMenu, { SubMenuEnableOnNew: true });
              if (tab || content.TopMenuNewObjectFormID) {
                $scope.formID = content.TopMenuNewObjectFormID || tab.SubMenuExtID;
                $scope.pageDisplay = 1;

                commonFunctions.commonCodeNew($scope);

                $scope.getNewObjectFields();
              }

              actionModalInstanceCtrl.close = function () {
                $modalInstance.close();
              };
              actionModalInstanceCtrl.loading = false;
            },
            controllerAs: "actionModalInstanceCtrl",
          })
          .result.then(function (ID) {
            if (ID) {
              $timeout(function () {
                $scope.add(ID);
              }, 200);
            }
          });
      };
      commonFunctions.commonCodeObjectFullView($scope);
      $scope.newObject = false;
      $scope.rowClicked(0, objectMenu.TopMenuObjectKey, "ID");
    }

    init();
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      content: "="
    },
    controller: controller,
  };
}

function appObjectConfigDirective() {
  var controller = function (
    $scope,
    $modal,
    $state,
    LeaderMESservice,
    customServices,
    commonFunctions,
    SweetAlert,
    $timeout,
    $filter,
    actionService,
    googleAnalyticsService
  ) {
    var appObjectConfigDirectiveCtrl = this;

    function init() {
      appObjectConfigDirectiveCtrl.sideMenuActions = $scope.content.actions; // change it to get from services.
      for (var i = 0; i < appObjectConfigDirectiveCtrl.sideMenuActions.length; i++) {
        var action = appObjectConfigDirectiveCtrl.sideMenuActions[i];
        delete appObjectConfigDirectiveCtrl.sideMenuActions[i].disabled;
        if (action.ActionCriteria !== "") {
          var criteria = action.ActionCriteria;
          action.enabled = jsonLogic.apply(criteria.criteria.condition, $scope.content.params);
        } else {
          action.enabled = true;
        }
      }
    }

    $scope.closeThis = function () {
      if ($scope.spinClosed == false) {
        $(".spin-icon").trigger("click");
      }
    };

    $scope.getTargetParameters = function (targetParameters) {
      var targetParametersSplit = targetParameters.split("=");
      var ans = {};
      ans[targetParametersSplit[0]] = targetParameters[targetParametersSplit[1]]
        ? targetParameters[targetParametersSplit[1]]
        : $scope.content.ID;
      return ans;
    };
    $scope.getTargetParametersValue = function (targetParameters) {
      var targetParametersSplit = targetParameters.split("=");
      return targetParameters[targetParametersSplit[1]] ? targetParameters[targetParametersSplit[1]] : $scope.content.ID;
    };

    appObjectConfigDirectiveCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    appObjectConfigDirectiveCtrl.rtl = LeaderMESservice.isLanguageRTL();
    $scope.getName = function (actionItem) {
      if (appObjectConfigDirectiveCtrl.localLanguage == true) {
        return actionItem.SubMenuLName;
      }
      return actionItem.SubMenuEName;
    };

    function openNewTab(actionItem) {
      if (actionItem.PreActionFunction == "") {
        var appObjectData = LeaderMESservice.getTabsByID(actionItem.SubMenuExtID);
        if (appObjectData) {
          var targetParametersValue = $scope.getTargetParametersValue(actionItem.SubMenuTargetParameters);
          var url = $state.href("appObjectFullView", {
            appObjectName: appObjectData.TopMenuEName,
            ID: targetParametersValue,
          });
          window.open(url, "_blank");
          LeaderMESservice.refreshPage($scope, 0, true);
        } else {
          //TODO ERROR
        }
      } else {
        var targetParameters = $scope.getTargetParameters(actionItem.PreActionParameters);
        targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
        LeaderMESservice.actionAPI(actionItem.PreActionFunction, targetParameters).then(function (response) {
          if (response.error === null) {
            var appObjectData = LeaderMESservice.getTabsByID(actionItem.SubMenuExtID);
            if (appObjectData) {
              var url = $state.href("appObjectFullView", {
                appObjectName: appObjectData.TopMenuEName,
                ID: response.LeaderRecordID,
              });
              window.open(url, "_blank");
            } else {
              //TODO ERROR
            }
          }
        });
      }
    }

    function openNotification(actionItem) {
      var targetParameters = $scope.getTargetParameters(actionItem.PreActionParameters);
      targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
      commonFunctions.notification($scope, actionItem, targetParameters, true);
    }

    function openModalDialog(actionItem) {
      var targetParameters = $scope.getTargetParameters(actionItem.PreActionParameters);
      targetParameters["subMenuAppPartID"] = actionItem.SubMenuAppPartID;
      var actionTemp = angular.copy(actionItem);
      if (actionTemp.PreActionFunction.indexOf("Approve") === 0) {
        actionTemp.PreActionFunction = actionTemp.PreActionFunction.split(".");
        if (actionTemp.PreActionFunction.length == 2) {
          actionTemp.PreActionFunction = actionTemp.PreActionFunction[1];
          var menuName = appObjectConfigDirectiveCtrl.localLanguage ? actionTemp.SubMenuLName : actionTemp.SubMenuEName;
          if (menuName == 'הפעל פק"ע') {
            menuName = $filter("translate")("ACTIVATE") + ' פק"ע ';
          }

          SweetAlert.swal(
            {
              title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO") + " " + menuName + "" + "?",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#D0D0D0",
              confirmButtonText: $filter("translate")("YES"),
              cancelButtonText: $filter("translate")("NO"),
              closeOnConfirm: true,
              closeOnCancel: true,
              animation: "false",
              customClass: appObjectConfigDirectiveCtrl.rtl ? " swalRTL" : "",
            },
            function (isConfirm) {
              if (isConfirm) {
                commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
                  actionItem.disabled = false;
                });
              } else {
                actionItem.disabled = false;
              }
            }
          );
        } else {
          actionTemp.PreActionFunction = "";
          commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
            actionItem.disabled = false;
          });
        }
      } else {
        commonFunctions.modalDialog($scope, actionTemp, targetParameters, function () {
          actionItem.disabled = false;
        });
      }
    }

    function openWizard(actionItem) {
      commonFunctions.wizard($scope, actionItem, $scope.content.ID);
    }

    appObjectConfigDirectiveCtrl.openAction = function (index) {
      var actionItem = appObjectConfigDirectiveCtrl.sideMenuActions[index];
      if (actionItem.disabled == true) {
        return;
      }
      actionItem.disabled = true;
      $timeout(function () {
        $(".spin-icon").click();
        if (actionItem.SubMenuTargetTYpe !== "ModalDialog") {
          $timeout(function () {
            actionItem.disabled = false;
          }, 200);
        }
      }, 100);
      var page_view = $scope.content.linkItem;
      if ($scope.content.customScreen) {
        page_view = $scope.content.customScreen;
      }
      googleAnalyticsService.gaEvent(page_view, actionItem.SubMenuEName.replace(/ /g, ""));
      actionService.openAction($scope, actionItem);
    };

    $scope.initActionConfig = function () {
      $scope.spinClosed = true;
      // SKIN Select
      $(".spin-icon").click(function () {
        $scope.spinClosed = !$scope.spinClosed;
        if (!$scope.spinClosed) {
          var page_view = $scope.content.linkItem;
          if ($scope.content.customScreen) {
            page_view = $scope.content.customScreen;
          }
          googleAnalyticsService.gaEvent(page_view, "actions_menu");
        }
        $(".theme-config-box").toggleClass("show");
        var themeConfig = $(".theme-config");
        if ($scope.spinClosed === true) {
          themeConfig.css("z-index", 10000);
          $timeout(function () {
            $(".theme-config").height(40);
            $(".theme-config-box").height(40);
          }, 1000);
        } else {
          themeConfig.css("z-index", 10000);
          $(".theme-config").height(themeConfigHeight);
          $(".theme-config-box").height(themeConfigHeight);
        }
      });
      var themeConfigHeight = 0;
      $scope.$on("ngRepeatActionFinished", function (ngRepeatMachineFinished) {
        themeConfigHeight = $(".theme-config").height();
        $(".theme-config").height(40);
        $(".theme-config-box").height(40);
      });
    };
    init();
  };

  return {
    restrict: "E",
    scope: {
      content: "=",
      template: "=",
      type: "="
    },
    controller: controller,
    controllerAs: "appObjectConfigDirectiveCtrl",
    template: '<ng-include src="contentUrl" type="type"></ng-include>',
    link: function (scope, element, attrs) {
      if (scope.template) {
        scope.contentUrl = scope.template;
      } else {
        scope.contentUrl = "views/common/appObject-config.html";
      }
    },
  };
}

angular
  .module("LeaderMESfe")
  .directive("appObjectTabsDirective", appObjectTabsDirective)
  .directive("appObjectDirective", appObjectDirective)
  .directive("appObjectConfigDirective", appObjectConfigDirective);
