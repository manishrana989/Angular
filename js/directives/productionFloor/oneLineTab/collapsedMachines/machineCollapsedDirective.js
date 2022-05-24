function machineCollapsed() {
    var template = "views/custom/productionFloor/onlineTab/collapsedMachines.html";

    var controller = function ($timeout,$modal, $scope, LeaderMESservice, $localStorage, $sessionStorage, CollapsedMachinesService, OnlineService, shiftService, $filter, $rootScope,OnlineSettingsService) {
        var machineCollapsedCtrl = this;
        $scope.machineBox = $scope.content;
        $scope.textColor = LeaderMESservice.getBWByColor(
            getComputedStyle(document.documentElement).getPropertyValue(`--machine-status-${$scope.machineBox.MachineStatusID}`), 150);
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        if(!machineCollapsedCtrl.showApplyModel)
        {
             machineCollapsedCtrl.showApplyModel = false
        }   
        
        $scope.structureType = 2;
        $scope.doneLoading = false;
        $scope.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.counterItems = 0;
        $scope.paramsInBoxes = [];
        $scope.selectTemplateGroupID = $localStorage.selectTemplateGroupID
        $scope.displayEndLines = shiftService.displayEndLines;
        var jobDef = _.find($sessionStorage.jobDefinitions, {
            ID: $scope.machineBox.JobDefID
        });
        if (jobDef) {
            $scope.machineBox.jobToolTip = jobDef.Name;
        }

        var fieldName = $scope.localLanguage ? 'FieldLName' : 'FieldEName'
        $scope.machineBox.MachineParams.sort(function (a, b) {
            if(!a[fieldName] || !b[fieldName]) {
                return 0;
            }
            if (a[fieldName].toLowerCase() < b[fieldName].toLowerCase()) {
                return -1;
            }
            if (a[fieldName].toLowerCase() > b[fieldName].toLowerCase()) {
                return 1;
            }
            return 0
        })
        var removeParamIndex = _.findIndex($scope.machineBox.MachineParams, {
            FieldName: "removeParam"
        });
        if (removeParamIndex > -1) {
            if (removeParamIndex > 0) {
                $scope.machineBox.MachineParams.splice(removeParamIndex, 1);
                $scope.machineBox.MachineParams.unshift({
                    FieldName: "removeParam",
                    FieldEName: $filter("translate")("REMOVE_PARAM"),
                    FieldLName: $filter("translate")("REMOVE_PARAM"),
                    CurrentValue: "",
                });
            }
        } else {
            $scope.machineBox.MachineParams.unshift({
                FieldName: "removeParam",
                FieldEName: $filter("translate")("REMOVE_PARAM"),
                FieldLName: $filter("translate")("REMOVE_PARAM"),
                CurrentValue: "",
            });
        }

        machineCollapsedCtrl.allParams = $scope.machineBox.MachineParams;
        if (_.findIndex(machineCollapsedCtrl.allParams, {
                FieldName: "customUIImage"
            }) < 0) {
                $scope.machineBox.MachineParams.unshift({
                FieldName: "customUIImage",
                FieldEName: $filter("translate")("CUSTOM_UI_IMAGE"),
                FieldLName: $filter("translate")("CUSTOM_UI_IMAGE"),
            });
        }

        if ($scope.localLanguage) {
            $scope.machineBox.MachineParams = _.sortByOrder($scope.machineBox.MachineParams, ["FieldLName"]);
        } else {
            $scope.machineBox.MachineParams = _.sortByOrder($scope.machineBox.MachineParams, ["FieldEName"]);
        }

        if ($localStorage.machineOnlineSettings && $localStorage.machineOnlineSettings[$scope.type]) {
            $scope.settings = $localStorage.machineOnlineSettings[$scope.type];
        } else {
            $scope.settings = angular.copy(OnlineService.machineOnlineSettings);
        }

        $scope.openImageInModal = function (url) {
            $modal
              .open({
                templateUrl: "views/common/imgInModal.html",
                windowClass: "imageInModal",
                controller: function ($scope, $modalInstance) {
                  $scope.imgURL = url;
      
                  $scope.close = function () {
                    $modalInstance.close();
                  };
                },
              })
              .result.then(function () {});
          };

        $scope.shapes = [
            [{
                    col: 1,
                    fontSize: '1.042',
                    numberFontSize: '1.142',
                    detailsDirection: 'column'
                },
                {
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                }
            ],
            [{
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 1,
                    fontSize: '1.042',
                    numberFontSize: '1.142',
                    detailsDirection: 'column'
                }
            ],
            [{
                    col: 1,
                    fontSize: '1.042',
                    numberFontSize: '1.142',
                    detailsDirection: 'column'
                },
                {
                    col: 1,
                    fontSize: '1.042',
                    numberFontSize: '1.142',
                    detailsDirection: 'column'
                }
            ],
            [{
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                }
            ],
            [{
                col: 1,
                fontSize: '1.242',
                numberFontSize: '1.642',
                detailsDirection: 'column'
            }, ],
            [{
                col: 2,
                fontSize: '1.081',
                numberFontSize: '1.302',
                detailsDirection: 'column'
            }],
            [{
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
            ],
            [{
                    col: 1,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 1,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 1,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
            ],
            [{
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 2,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
                {
                    col: 1,
                    fontSize: '0.625',
                    numberFontSize: '0.825',
                    detailsDirection: 'column'
                },
            ],
        ];
        
        $scope.currentVersion = '4.0';
        var newVersion = false;
        if (!$localStorage.allMachineOnlineVersion) {
            $localStorage.allMachineOnlineVersion = '3.0';
            newVersion = true;
        } else if ($localStorage.allMachineOnlineVersion !== $scope.currentVersion) {
            newVersion = true;
            $localStorage.allMachineOnlineVersion = $scope.currentVersion;
        }

        $scope.selectedMenu = {};
        
        $scope.machineEditParams = angular.copy(CollapsedMachinesService.machineEditParams)

        const updateParameters = () => {
            if($scope.parameters && $scope.parameters[6])
            {
                $scope.selectedMenu['production'] =  $scope.parameters && $scope.parameters[6];
    
                $scope.machineEditParams.productMenuList.forEach(it => {
                    if (it.FieldName === $scope.selectedMenu['production'].FieldName) {
                        it.selected = true
                    } else {
                        it.selected = false
                    }
                });
            }
        }
        updateParameters();
        $scope.$watch('parameters',()=> {
            updateParameters();
        });
        if (!$scope.selectedMenu['production']) {
            $scope.machineEditParams.productMenuList[1].selected = true;
            $scope.selectedMenu['production'] = $scope.machineEditParams.productMenuList[1]
        }


        $scope.pastColumnCount = function (index) {
            let count = 0;
            // $scope.shapes[$scope.settings.shapeType].length : give us the rows in that specific shape
            for (let i = 0; i < index && i < $scope.shapes[$scope.settings.shapeType].length; i++) {
                count = count + $scope.shapes[$scope.settings.shapeType][i].col;
            }
            //display = true for the first element in the row    
            $scope.parameters[count].display = true;
            //check if productName exist and add it to isProductParamShowed 
            $scope.isProductParamShowedInShapes();
            //array that have all the chosen parameters
            $scope.paramsInBoxes.push($scope.parameters[count].FieldName);
            return count
        };


        $scope.calcMachineFontSize = function () {
            if (!$scope.machineBox || !$scope.machineBox.MachineLname || !$scope.machineBox.MachineEName) return
            let machineTextLength = $scope.rtl ? $scope.machineBox.MachineLname.length : $scope.machineBox.MachineEName.length;
            let scale = $scope.settings.selectedScale.scale;
            switch (true) {
                case (machineTextLength < 10):
                    return 1.3 * scale + "vw";
                case (machineTextLength < 15):
                    return 1.1 * scale + "vw";
                case (machineTextLength < 20):
                    return 0.8 * scale + "vw";
                case (machineTextLength < 25):
                    return 0.65 * scale + "vw";
                default:
                    return 0.4 * scale + "vw";
            }
        }


        var menuAndSubMenu = LeaderMESservice.getMainMenu();
        $scope.productionFloorMenu = _.find(menuAndSubMenu, {
            TopMenuAppPartID: 500
        });
        if ($scope.productionFloorMenu) {
            $scope.departmentSubMenu = _.find($scope.productionFloorMenu.subMenu, {
                SubMenuExtID: $scope.departmentId
            });
        }   

        

        $scope.onMenuChange = function (selectedParamBar, list, type) {
            list.forEach(it => {
                if (it.FieldName === selectedParamBar.FieldName) {
                    it.selected = true
                } else {
                    it.selected = false
                }
            });
            if (type == "shift") {
                $scope.paramsByCalc[$scope.calculateBy.value][2].FieldName = $scope.selectedMenu[type].FieldName;
            }
            if($scope.parameters && $scope.parameters[6])
            {
                $scope.parameters[6] = {FieldName:selectedParamBar.FieldName,FieldEName:selectedParamBar.FieldEName}
            }
            $scope.saveStructure(false);      
        }


        $scope.prepareActions = function () {
            var appObject = angular.copy(LeaderMESservice.getTabsByAppName("MachineScreenEditor"));
            if (appObject) {
              $scope.actions = _.map(appObject.Actions, function (action) {
                if (action.ActionCriteria && action.ActionCriteria != "" && typeof action.ActionCriteria !== "object") {
                  action.ActionCriteria = JSON.parse(action.ActionCriteria);
                }
                action.updateData = $scope.updateData;
                return action;
              });
              var activateJob = _.find($scope.actions, {
                SubMenuAppPartID: 20225
              });
              if (activateJob) {
                activateJob.updateData = $scope.updateData;
              }
              $scope.params = $scope.machineBox;
              if ($scope.params.SetupEnd == null) {
                $scope.params.SetupEnd = "";
              }
              const reportStopEventAction = angular.copy($scope.actions[0]);
              reportStopEventAction.SubMenuAppPartID = -3;
              reportStopEventAction.SubMenuAccessLevel = -3;
              reportStopEventAction.SubMenuDisplayOrder = 0;
              reportStopEventAction.SubMenuEName = $filter('translate')('REPORT_STOP_EVENT');
              reportStopEventAction.SubMenuLName = $filter('translate')('REPORT_STOP_EVENT');
              reportStopEventAction.SubMenuTargetParameters = '';
              reportStopEventAction.SubMenuTargetTYpe = 'custom:reportStopScreenEvent';
              $scope.actions.unshift(reportStopEventAction);
              machineCollapsedCtrl.actionsData = {
                actions: $scope.actions,
                parentScope: $scope,
                params: $scope.params,
                ID: $scope.machineBox.MachineID,
                targetParameters: $scope.machineBox,
                linkItem: "MachineScreenEditor",
                customScreen: "Department_Online",
              };
            }
          };
          $scope.prepareActions();

        $scope.$watch('paramsInBoxes', function (newVal, oldVal) {
            if (newVal && oldVal && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                $scope.isProductParamShowedInShapes()
            }
        }, true);
 

        $scope.isProductParamShowedInShapes = function () {
            let productParam = $scope.paramsInBoxes.find(it => it == 'productName');
            $scope.isProductParamShowed = productParam;
        };

        $scope.resetParametersDisplay = function () {
            $scope.paramsInBoxes = [];
            $scope.parameters.forEach(it => {
                it.display = false
            });
            $scope.isProductParamShowedInShapes()
        };

        $scope.$watch('machineBox.display', (newVal, oldVal) => {
            setTimeout(() => {
                $scope.calcMachineFontSize()
            }, 500)
        });
        $scope.$watch('selectedScale.scale', (newVal, oldVal) => {
            setTimeout(() => {
                $scope.calcMachineFontSize()
            }, 500)
        });
        $scope.$watch('machineBox.MachineStatusID', (newVal, oldVal) => {
            if (newVal !== oldVal) {
                $timeout(() => {
                    $scope.textColor = LeaderMESservice.getBWByColor(
                        getComputedStyle(document.documentElement).getPropertyValue(`--machine-status-${$scope.machineBox.MachineStatusID}`), 150);
                }, 100);
            }
        });
        $scope.saveStructure = function (applyAll) {
            $scope.parameters = _.map($scope.parameters, function (param,index) {
                if(index == 6)
                {
                    return {
                        FieldName: param.FieldName,
                        FieldEName: param.FieldEName
                    }
                }
                return {
                    FieldName: param.FieldName
                }
            });
            LeaderMESservice.customAPI('SaveMachineStructure', {
                "machineStructure": [{
                    "MachineArr": [$scope.machineBox.MachineID],
                    "StructureType": 2,
                    "Structure": JSON.stringify($scope.parameters)
                }],
            }).then(function (response) {
                if (applyAll) {
                    $scope.updateStructures();
                }
            });
        };
        $scope.editParam = function (param, applyAll, index) {   
                     
            $scope.parameters[index].FieldName = param.FieldName;
            $scope.saveStructure(applyAll);
        };

        $scope.$on("closeModel",function(model){      
            machineCollapsedCtrl.showApplyModel = false;
        });

    };

    return {
        restrict: "A",
        templateUrl: template,
        scope: {
            content: "=",
            showThreeParams: "=",
            parameters: "=",
            showPencils: "=",
            updateStructures: "=",
            jobConfiguration: "=",
            type: "=",
            allMachines:"=",
            isDefaultStructure:"=",
            machineStructureData:"=",
            usersData:"="
        },
        controller: controller,
        controllerAs: "machineCollapsedCtrl"
    };
}

angular.module("LeaderMESfe").directive("machineCollapsed", machineCollapsed);