function templatesDirective() {
  var template = "views/common/editTemplates.html";

  var controller = function ($scope, LeaderMESservice, shiftService, $timeout, notify, toastr, $filter, $localStorage, $sessionStorage) {
    var templatesCtrl = this;

    templatesCtrl.mode = $scope.mode;
    templatesCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    templatesCtrl.newTemplateSettings = { value: "LOCAL" };    
    templatesCtrl.saving = false;
    // templatesCtrl.insightPage = $sessionStorage.produtionFloorTab.selectedTab != "factoryInsights" || $sessionStorage.produtionFloorTab.selectedTab != "insights";
    templatesCtrl.insightPage =$sessionStorage.produtionFloorTab.selectedTab == "insights";
    templatesCtrl.isFactoryInsights = $sessionStorage.produtionFloorTab.selectedTab == "factoryInsights";
    $scope.doneLoading = false;
    LeaderMESservice.customAPI("GetStructureThumbnails", {
      DashboardType: $scope.dashboardType,
      DepartmentID: +$sessionStorage.stateParams.subMenu.SubMenuExtID,
    }).then(function (res) {
      templatesCtrl.templates = res.TemplateData;
      $scope.doneLoading = true;
    });
    

    $scope.checkName = function () {
      _.find(templatesCtrl.templates, { EName: templatesCtrl.templateName }) ? ($scope.nameExists = true) : ($scope.nameExists = false);
    };
    LeaderMESservice.GetAllGroupsAndUsers().then(function (response) {
      $scope.usersData = response.Users;
      $scope.groupsData = response.Groups;
    });
    if (templatesCtrl.mode == "load") {
      templatesCtrl.title = "LOAD_NEW_TEMPLATE";
      templatesCtrl.getTemplateByStructID = function (template) {
        LeaderMESservice.customAPI("GetDashboardTemplateStructureByID", {
          StructureID: template.ID,
          DepartmentID: templatesCtrl.newTemplateSettings.value == "LOCAL" || templatesCtrl.newTemplateSettings.value == "DEFAULT_TEMPLATE" ? +$sessionStorage.stateParams.subMenu.SubMenuExtID : 0,
        }).then(function (res) {
          ///2
          
          $localStorage.machineScreenStructureID = template.ID;
          var fullTemplate = _.find(res.TemplateData, { ID: template.ID });
          if (fullTemplate) {
            var structure = JSON.parse(fullTemplate.Structure);
            if (!structure.insightsContainers && structure.data) {
              // backward computability
              structure = {
                insightsContainers: {
                  data: structure.data,
                  dataInsightsPage: structure.dataInsightsPage,
                  dataInsightsFactoryPage: structure.dataInsightsFactoryPage,
                },
              };
            }
            $scope.loadTemplate(structure);

            $scope.templateName = template.EName;
            $scope.hasTemplate = true;

            $scope.closeModal();
            $timeout(function () {
              shiftService.displayUpdateDefferd.notify();
            });
          }
        });
      };

      templatesCtrl.deleteTemplate = function (template) {
        LeaderMESservice.customAPI("DeleteTemplate", {
          ID: template.ID,
        }).then(function () {
          LeaderMESservice.customAPI("GetStructureThumbnails", {
            DashboardType: $scope.dashboardType,
            DepartmentID: $sessionStorage.stateParams.subMenu.SubMenuExtID,
          }).then(function (res) {
            templatesCtrl.templates = res.TemplateData;
            if (!templatesCtrl.templates) {
              $scope.closeModal();
            }
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
            }
            if(template?.DepartmentID != 0 )
            {
              sendObject.Template.DepartmentID = template.DepartmentID
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
            templatesCtrl.popupIndex = -1;
            template.popup = false;
          });
        }
        if (groups.length > 0) {
          LeaderMESservice.customAPI("SaveDashboardTemplateStructureForUserGroup", {
            SourceGroupID: template.ID,
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
            templatesCtrl.popupIndex = -1;
            template.popup = false;
          });
        }
      };
    } else if (templatesCtrl.mode == "save") {
      templatesCtrl.title = "NEW_DASH_TEMPLATE";

      templatesCtrl.checkNameEmpty = function(){
        if(templatesCtrl.templateName?.length > 0){
          $scope.noName = false;
        }
        else{
          $scope.noName = true;
        }
      }
      templatesCtrl.saveStructure = function () {        
        if ($sessionStorage.produtionFloorTab.selectedTab == "factoryInsights" && !$sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.length) {
          return;
        }
        if ($sessionStorage.produtionFloorTab.selectedTab == "insights" && !$sessionStorage.insightData[$sessionStorage.stateParams.subMenu.SubMenuExtID].container.length) {
          return;
        }
        if (!templatesCtrl.templateName || templatesCtrl.templateName == "") {
          return;
        }
        templatesCtrl.saving = true;
        var svgElem = $("body").find("svg");

        var nodesToRecover = [];

        //replace all svgs with a temp canvas
        svgElem.each(function (index, node) {
          var parentNode = node.parentNode;

          var canvas = document.createElement("canvas");
          xml = new XMLSerializer().serializeToString(node);

          // Removing the name space as IE throws an error
          xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, "");

          canvg(canvas, xml);

          nodesToRecover.push({
            parent: parentNode,
            prevChild: node,
            newChild: canvas,
          });
          parentNode.removeChild(node);

          parentNode.appendChild(canvas);
        });
        html2canvas($($scope.canvasClass)[0], {
          backgroundColor: "#f3f3f4",
        }).then(function (canvas) {
          nodesToRecover.forEach(function (el) {
            var parentNode = el.parent;
            parentNode.removeChild(el.newChild);

            parentNode.appendChild(el.prevChild);
          });
          var ctx = canvas.getContext("2d");
          ctx.webkitImageSmoothingEnabled = false;
          ctx.mozImageSmoothingEnabled = false;
          ctx.imageSmoothingEnabled = false;
          // We create an image to receive the Data URI
          var img = document.createElement("img");

          // When the event "onload" is triggered we can resize the image.
          img.onload = function () {
            // We create a canvas and get its context.
            var canvas2 = document.createElement("canvas");
            var ctx2 = canvas2.getContext("2d");

            // We set the dimensions at the wanted size.
            // canvas2.width = 358;
            // canvas2.height = 550;
            canvas2.width = 358;
            canvas2.height = 550;

            // We resize the image with the canvas method drawImage();
            ctx2.drawImage(this, 0, 0, 358, 550);
            _.forEach($scope.insightsContainer, function (temp) {
              if (temp.options && temp.options.settings && temp.options.settings.insight) {
                temp.options.settings.insight.savedTemplate = true;
              }
            });
            let containersWithFirstLocalMachines
            if($sessionStorage.produtionFloorTab.selectedTab == "shift")
            {
              containersWithFirstLocalMachines = angular.copy(shiftService.containers);
              if (templatesCtrl.newTemplateSettings.value == "ALL_DEPARTMENTS" || templatesCtrl.newTemplateSettings.value == "DEFAULT_TEMPLATE") {
                containersWithFirstLocalMachines.data = containersWithFirstLocalMachines.data.map((graph) => {
                  graph.localMachines = [];
                  return graph;
                });
              }
            }
          
            let structureToSave;
            if (($scope.dashboardType == 1 || $scope.dashboardType == 4) && !templatesCtrl.insightPage && !templatesCtrl.isFactoryInsights) {
              if (templatesCtrl.newTemplateSettings.value == "ALL_DEPARTMENTS" || templatesCtrl.newTemplateSettings.value == "DEFAULT_TEMPALTE") {
                structureToSave = {
                  shiftInsights: containersWithFirstLocalMachines,
                };
              } else {
                structureToSave = {
                  machinesDisplay: $scope.machinesDisplay,
                  shiftInsights: containersWithFirstLocalMachines,
                };
              }
            } else {              
              if($scope.dashboardType == 2)
              {
                structureToSave = {
                  data: $scope.containers?.data,
                };
              }
              else
              {
                structureToSave = {
                  insightsContainer: angular.copy($scope.insightsContainer),
                };
                
                if (templatesCtrl.newTemplateSettings.value == "LOCAL") {
                  structureToSave.insightsContainer = _.map(structureToSave.insightsContainer, function (insight) {
                    if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()]) {
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterEvent != undefined) {
                        insight.filterEvent = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterEvent;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterMachine != undefined) {
                        insight.filterMachine = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].filterMachine;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].endLine != undefined) {
                        insight.endLine = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].endLine;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].settingState != undefined) {
                        insight.settingState = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].settingState;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].KPIsForHeatmap != undefined) {
                        insight.KPIsForHeatmap = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].KPIsForHeatmap;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].colorMode != undefined) {
                        insight.colorMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].colorMode;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].targetMode != undefined) {
                        insight.targetMode = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].targetMode;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].insightTopNum != undefined) {
                        insight.insightTopNum = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].insightTopNum;
                      }
                      if ($localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].xAxisSelectedObject != undefined) {
                        insight.xAxisSelectedObject = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].xAxisSelectedObject;
                      }
                    }
                    insight.savedTemplateType = "LOCAL";
                    return insight;
                  });
                } else {
                  structureToSave.insightsContainer = _.map(structureToSave.insightsContainer, function (insight) {                    
                    if (!insight.ID.includes("D")) {
                      var boolean = insight.ID == "195"
                    } else {                      
                      var boolean = insight.ID.substring(0, insight.ID.indexOf("D") + 1) == "195D";
                    }
                    if (boolean) {
                      insight.settingState = $localStorage.insightStates[$sessionStorage.stateParams.subMenu.SubMenuExtID][insight.ID.toString()].settingState || insight.settingState
                    }
                    insight.savedTemplateType = templatesCtrl.newTemplateSettings.value;
                    insight.localMachines = [];
                    return insight;
                  });
                }
              }
            }
            if(templatesCtrl.newTemplateSettings.value == "DEFAULT_TEMPLATE")
            {
              structureToSave.userGroups = templatesCtrl.chosenGroups
            }
            let templateOBJ = {
              ID: 0,
              Type: $scope.dashboardType,
              LName: templatesCtrl.templateName,
              EName: templatesCtrl.templateName,
              Image: canvas2.toDataURL("image/png"),
              Structure: JSON.stringify(structureToSave),
              IsDefaultStructure: templatesCtrl.newTemplateSettings.value != "DEFAULT_TEMPLATE" ?  true : false,
              IsActive: true,
            };
            if(templatesCtrl.newTemplateSettings.value !== "DEFAULT_TEMPLATE")
            {
              templateOBJ.DepartmentID = templatesCtrl.newTemplateSettings.value == "LOCAL" ? +$sessionStorage.stateParams.subMenu.SubMenuExtID : 0;
            }
            if(templatesCtrl.newTemplateSettings.value == "DEFAULT_TEMPLATE")
            {
              LeaderMESservice.customAPI("SaveDefaultDashboardTemplateStructure", { Template: templateOBJ,UserGroups:templatesCtrl.chosenGroups }).then(function (res) {
                templatesCtrl.saving = false;
                $scope.doneLoading = false;
                LeaderMESservice.customAPI("GetStructureThumbnails", {
                  DashboardType: $scope.dashboardType,
                  DepartmentID: templateOBJ.DepartmentID,
                }).then(function () {
                  $scope.doneLoading = true;
                  $scope.closeModal();
                });
              });
            }
            else
            {
              LeaderMESservice.customAPI("SaveDashboardTemplateStructure", { Template: templateOBJ }).then(function (res) {
                templatesCtrl.saving = false;
                $scope.doneLoading = false;
                LeaderMESservice.customAPI("GetStructureThumbnails", {
                  DashboardType: $scope.dashboardType,
                  DepartmentID: templateOBJ.DepartmentID,
                }).then(function (res) {
                  templatesCtrl.templates = res.TemplateData;
                  $scope.doneLoading = true;
                  $scope.closeModal();
                });
              });
            }
          };

          // We put the Data URI in the image's src attribute
          img.src = canvas.toDataURL("image/png");
        });
      };
    }
  };

  return {
    restrict: "E",
    templateUrl: template,
    scope: {
      dashboardType: "=",
      mode: "=",
      closeModal: "=",
      loadTemplate: "=",
      canvasClass: "=",
      insightsContainer: "=",
      machinesDisplay: "=",
      templateName: "=",
      hasTemplate: "=",
      machineData: "=",
      containers : "=",
      allowEdit:"="
    },
    controller: controller,
    controllerAs: "templatesCtrl",
  };
}

angular.module("LeaderMESfe").directive("templatesDirective", templatesDirective);
