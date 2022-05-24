var insightsTemplatesDirective = function () {
  var controller = function ($scope, shiftService, insightService, LeaderMESservice, $timeout, googleAnalyticsService, SweetAlert, $filter, $sessionStorage, $localStorage, toastr, $modal) {
    var insightsTemplatesCtrl = this;
    $scope.shiftData = shiftService.shiftData;
    $scope.loadTemplate = insightService.updateContainerInsightPage;
    insightsTemplatesCtrl.filterVariants = [];
    $scope.showInsightsAbsolute = false;
    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
    $scope.showCopyModels = false;
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.navModelOpen = insightService.navModelOpen;
    LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
      $scope.usersData = response.Users;
      $scope.groupsData = response.Groups;
    });

    $scope.changeIsActiveLocal = function(structure){
      $scope.updateContainer(null,structure,structure.name,null,'DEFAULT_TEMPLATE')
    }
    insightsTemplatesCtrl.loading = false;
    $scope.chosenUsers = [];
    $scope.machinesDisplay = shiftService.shiftData.machinesDisplay;

    $scope.templatesMoveToLeft = function () {
      document.querySelector(".savedTemplates .templatesScroll").scrollLeft -= 150;
    };

    $scope.templatesMoveToRight = function () {
      document.querySelector(".savedTemplates .templatesScroll").scrollLeft += 150;
    };
    $scope.$on("closeAboslute", function () {
      $scope.showInsightsAbsolute = false;
    });
    $scope.deleteDashboard = function (template,type) {
      SweetAlert.swal(
        {
          title: $filter("translate")("ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_TEMPLATE"),
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#D0D0D0",
          confirmButtonText: $filter("translate")("YES"),
          cancelButtonText: $filter("translate")("NO"),
          closeOnConfirm: true,
          closeOnCancel: true,
          animation: "false",
          customClass: "",
          // swalRTL
        },
        function (isConfirm) {
          if (isConfirm) {
            if(type == 1)
            {
              $scope.deleteDefaultTemplate(template)
            }
            else
            {
              $scope.deleteTemplate(template);
            }
          }
        }
      );
    };

    $scope.sendTemplate = function (template, ID) {
      $scope.structures = _.map($scope.structures, function (temp) {
        if (temp.ID == ID) {
          temp.show = true;
        } else {
          temp.show = false;
        }
        return temp;
      });
      if ($localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type == 2) {
        $scope.$emit("resetFilterTest");
      }
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type = 1;
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value = ID;
      insightService.updateContainerInsightPage(template);
      googleAnalyticsService.gaEvent("Department_Insights", "STORIES_".concat(ID));
    };

    $scope.copyModalPosition = function (event) {
      $scope.localLanguage ? ($scope.copyModalX = event.clientX - 35) : ($scope.copyModalX = event.clientX - 399);
      $scope.localLanguage ? ($scope.copyModalY = event.clientY + 19) : ($scope.copyModalY = event.clientY - 12);
    };

    $scope.getStructureThumbnails = function () {
      LeaderMESservice.customAPI("GetStructureThumbnails", {
        DashboardType: $scope.dashboardType,
        DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
      }).then(function (res) {
        $scope.templates = res.TemplateData;
        $scope.structures = res.DefaultTemplateData
        $scope.doneLoading = true;
      });
    };
    $scope.deleteDefaultTemplate = function (template) {
      LeaderMESservice.customAPI("DeleteDefaultTemplate", {
        ID: template.ID,
      }).then(function () {
        $scope.getStructureThumbnails();
        insightService.updateContainerInsightPage();
      });
    };
    $scope.deleteDefaultTemplate = function (template) {
      LeaderMESservice.customAPI("DeleteDefaultTemplate", {
        ID: template.ID,
      }).then(function () {
        $scope.getStructureThumbnails();
        insightService.updateContainerInsightPage();
      });
    };
    $scope.deleteTemplate = function (template) {
      LeaderMESservice.customAPI("DeleteTemplate", {
        ID: template.ID,
      }).then(function () {
        $scope.getStructureThumbnails();
        insightService.updateContainerInsightPage();
      });
    };
    $scope.getFilterNames = function () {
      insightsTemplatesCtrl.loading = true;
      LeaderMESservice.customAPI("GetInsightsSavedFilters", { DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID }).then(function (res) {
        if (!_.isEmpty(res.Data)) {
          insightsTemplatesCtrl.filterVariants = _.map(res.Data[$sessionStorage.stateParams.subMenu.SubMenuExtID], function (temp) {
            temp.FilterTemplate = JSON.parse(temp.FilterTemplate);
            return temp;
          });
        }
        $timeout(function () {
          insightsTemplatesCtrl.loading = false;
        });
      });
    };

    $scope.copyToUser = function (template, groups, users) {
      if (users.length > 0) {
        var sendObject = {
          SourceTemplateID: template.ID,
          Users: users,
          Template: {
            ID: template.ID,
            Type: template.Type,
            LName: template.LName,
            EName: template.EName,
            IsActive: true,
          },
        };
        if (template?.DepartmentID != 0) {
          sendObject.Template.DepartmentID = template.DepartmentID;
        }

        LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUser", sendObject).then(function (res) {
          if (res.error) {
            notify({
              message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          } else if (users.length > 0 || groups.length > 0) {
            toastr.clear();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          }
          $scope.popupIndex = -1;
          template.popup = false;
        });
      }

      if (groups.length > 0) {
        LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUserGroup", {
          SourceTemplateID: template.ID,
          UserGroups: groups,
          Template: {
            ID: template.ID,
            Type: template.Type,
            LName: template.LName,
            EName: template.EName,
            IsActive: true,
          },
        }).then(function (res) {
          if (res.error) {
            notify({
              message: res.error.ErrorMessage + " [" + res.error.ErrorCode + "]",
              classes: "alert-danger",
              templateUrl: "views/common/notify.html",
            });
          } else if ((!users || users.length <= 0) && groups.length > 0) {
            toastr.clear();
            toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
          }
          $scope.popupIndex = -1;
          template.popup = false;
        });
      }
    };


    $scope.hideTemplateMenuStructures = (withoutTemplate) => {
      $scope.structures.map((template) => {
        if (withoutTemplate && template.ID == withoutTemplate.ID) {
          return template;
        }
        template.defaultTemplateOptions = false;
        return template;
      });
  };


    $scope.checkChosenContainer = function () {
      
      _.forEach($scope.structures, function (temp) {
        temp.show = false;
      });
      $scope.machineData.selectedTemplteIndex = -1;
      var found = _.findIndex($scope.templates, {
        ID: $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value,
      });
      if (found > -1) {
        $scope.machineData.selectedTemplteIndex = found;
      } else {
        found = _.findIndex($scope.structures, {
          ID: $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value,
        });
        if (found > -1) {
          $scope.structures[found].show = true;
        }
      }
    };

    $scope.changeNavModelOpen = function (template) {
      template.popup = !template.popup;
      $scope.showCopyModels = template.popup;
    };

    var upperScope = $scope;

    $scope.getTemplateByStructID = function (event, template, eventName, index) {
      if (event && (event.target.className.toLowerCase() === "templateDots" || event.target.className.toLowerCase() === "circlee")) {
        return;
      }
      if (!$localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID]) {
        $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID] = {};
      }
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].type = 2;
      $localStorage.insightTemplateID[$sessionStorage.stateParams.subMenu.SubMenuExtID].value = template.ID;
      upperScope.loadTemplate();

      $scope.machineData.selectedTemplteIndex = index;
      $scope.structures = _.map($scope.structures, function (temp) {
        if (temp.name == eventName) {
          temp.show = true;
        } else {
          temp.show = false;
        }
        return temp;
      });
    };


    $scope.updateContainer = function (event, template, eventName, index,type) {
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container = _.map($sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container, function (insight) {
          if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()]) {
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterEvent) {
              insight.filterEvent = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterEvent;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterMachine) {
              insight.filterMachine = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterMachine;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].endLine) {
              insight.endLine = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].endLine;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].settingState) {
              insight.settingState = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].settingState;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].KPIsForHeatmap) {
              insight.KPIsForHeatmap = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].KPIsForHeatmap;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].colorMode != undefined) {
              insight.colorMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].colorMode;
            }
            if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].targetMode != undefined) {
              insight.targetMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].targetMode;
            }
          }
          insight.savedTemplateType = type;
          return insight;
        });
        $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.headerPinned={enabled: true}
        
        if(type == "DEFAULT_TEMPLATE"){
          LeaderMESservice.customAPI("SaveDefaultDashboardTemplateStructure", {
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              Structure:
                $scope.dashboardType == 1
                  ? JSON.stringify({
                      insightsContainer: $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container,
                      machinesDisplay: $scope.machinesDisplay,
                      defaultFilter: insightsTemplatesCtrl.selectedFilterVariant,
                    })
                  : JSON.stringify({
                      insightsContainer: $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container,
                      defaultFilter: insightsTemplatesCtrl.selectedFilterVariant,
                    }),
              IsDefaultStructure: template.IsDefaultStructure ? true :false,
              IsActive: template.IsActive,
            },
            UserGroups:[template.GroupID]
          }).then(function () {
            toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
          });  
        }else
        {
          LeaderMESservice.customAPI("SaveDashboardTemplateStructure", {
            Template: {
              ID: template.ID,
              Type: template.Type,
              LName: template.LName,
              EName: template.EName,
              Structure:
                $scope.dashboardType == 1
                  ? JSON.stringify({
                      insightsContainer: $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container,
                      machinesDisplay: $scope.machinesDisplay,
                      defaultFilter: insightsTemplatesCtrl.selectedFilterVariant,
                    })
                  : JSON.stringify({
                      insightsContainer: $sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container,
                      defaultFilter: insightsTemplatesCtrl.selectedFilterVariant,
                    }),
              IsDefaultStructure: true,
              IsActive: true,
            },
            DepartmentID: template.DepartmentID,
          }).then(function () {
            if(type != "DEFAULT_TEMPLATE")
            {
              toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
              $scope.getTemplateByStructID(event, template, eventName, index);
            }
          }); 
        }
            
    };



    $scope.shareTemplateModel = (template) => {
      $modal.open({
        resolve: {
          parentScope: function () {
              return $scope;
          }
      },
        templateUrl: 'js/components/shareTemplateModel/shareTemplateModel.html',
        windowClass: "edit-recurring-event-update",
        controller: function ($scope, $modalInstance, parentScope) {
          $scope.usersData = parentScope.usersData
          $scope.template = template
          $scope.copyToUser = parentScope.copyToUser
          $scope.groupsData = parentScope.groupsData
          $scope.copyToUser = parentScope.copyToUser
          $scope.close = function () {
              $modalInstance.close();
          };
        },
      })
  
  };

    $scope.$watch("navModelOpen.value", function () {
      if ($scope.showCopyModels && $scope.navModelOpen.value) {
        $scope.templates = _.map($scope.templates, function (template) {
          template.popup = false;
          return template;
        });
      }
    });

    $scope.$watchGroup(
      ["templates", "structures"],
      function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.initWrapper();
        }
      },
      true
    );

    $scope.initWrapper = function () {
      if ($scope.initTimeout) {
        $timeout.cancel($scope.initTimeout);
      }
      $scope.initTimeout = $timeout(function () {
        $scope.checkChosenContainer();
      }, 250);
    };

    $scope.changeIsActive = (structure) => {
      if ($scope.changeIsActiveTimeout){
        $timeout.cancel($scope.changeIsActiveTimeout);
        $scope.changeIsActiveTimeout = null;
      }
      $scope.changeIsActiveTimeout = $timeout(() => {    
        $scope.changeIsActiveLocal(structure);
      },300);
    };
    $scope.initWrapper();
  };

  return {
    restrict: "E",
    templateUrl: "views/custom/productionFloor/insightsTab/insightsTemplates/insightsTemplates.html",
    scope: {
      dashboardType: "=",
      structures: "=",
      isFactory: "=",
      templates: "=",
      machineData: "=",
      allowEdit : "=",
      IsDefaultStructure:"="
    },
    controller: controller,
    controllerAs: "insightsTemplatesCtrl",
  };
};

angular.module("LeaderMESfe").directive("insightsTemplatesDirective", insightsTemplatesDirective);
