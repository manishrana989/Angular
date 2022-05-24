angular.module('LeaderMESfe').factory('jobsService', function (LeaderMESservice, commonFunctions, $modal, $filter, toastr) {


    function generalCode($scope) {

        var init = function () {
            getData();
        };

        var getData = function () {
            var requestBody = {
                jobID: $scope.content.ID,
                subMenuAppPartID: $scope.content.SubMenuAppPartID
            };
            if ($scope.generalTab === true) {
                $scope.showActions = false;
            }
            var request = {
                jobID: $scope.content.ID,
                subMenuAppPartID: $scope.content.SubMenuAppPartID
            };
            var requestResponse = {
                LeaderID: $scope.content.ID,
                formID: $scope.content.SubMenuAppPartID,
                skipSaveOperation: $scope.tabs[$scope.pageDisplay - 1].SkipSaveOperation
            };
            $scope.actionName = "SAVE_CHANGES";
            $scope.api = 'displayJobFormResult';
            $scope.request = request;
            $scope.SkipSaveOperation = ($scope.tabs || $scope.content.tabs)[($scope.pageDisplay || $scope.content.pageDisplay) - 1].SkipSaveOperation
            $scope.formId = $scope.content.SubMenuAppPartID;
            $scope.LeaderId = $scope.content.ID;


            // $scope.leaderId = $scope.content.ID;
            //added in react
            // commonFunctions.formResults($scope, request, requestResponse, 'displayJobFormResult', [], $scope.generalTab);
        };
        init();
    }

    function RecipeCode($scope) {
        var init = function () {

            $scope.localLanguage = LeaderMESservice.showLocalLanguage();
            $scope.standardID = 0;
            $scope.RecipeRefType = 0;
            var request = {
                jobID: $scope.content.JobID,
                subMenuAppPartID: $scope.content.subMenu.SubMenuAppPartID
            };
            var saveRequest = {
                JobID: $scope.content.JobID,
                subMenuAppPartID: 10010,
                recipeValue: []
            };

            LeaderMESservice.customAPI('DisplayProductRecipeJob', request).then(function (response) {
                $scope.RecipeData = {
                    recipeData: response,
                    saveRequest: saveRequest,
                    saveRequestAPI: 'UpdateProductRecipeJob'
                };
                $scope.recipeRefType = response.RecipeRef;
                var checkedType = _.find($scope.recipeRefType, { Checked: true });
                if (checkedType) {
                    $scope.checkedType = { index: checkedType.RecipeRefType };
                    $scope.RecipeRefType = $scope.checkedType.index;
                    $scope.standardID = 0;
                    if (checkedType.StandardRecipe.length > 0) {
                        var subCheckType = _.find(checkedType.StandardRecipe, { Checked: true });
                        if (subCheckType) {
                            $scope.subCheckType = subCheckType;
                            $scope.standardID = $scope.subCheckType.standardID;
                        }
                    }
                    //var typeRequest = {
                    //    jobID : $scope.content.JobID,
                    //    subMenuAppPartID : 10675,
                    //    standardID : ($scope.subCheckType ? $scope.subCheckType.standardID : $scope.checkedType.index),
                    //};
                    //LeaderMESservice.customAPI('DisplayProductRecipeJobDetailsByType',typeRequest).then(function(response){
                    //    $scope.RecipeDataByType ={
                    //        recipeData : response
                    //    };
                    //});
                    $scope.getRecipeType($scope.standardID, $scope.RecipeRefType);
                }
                LeaderMESservice.customAPI('GetTabObjects', { subMenuAppPartID: $scope.content.subMenu.SubMenuAppPartID }).then(function (response) {
                    $scope.actions = response.TabObjects;
                });
            });

            $scope.getRecipeType = function (standardID, recipeRefType) {
                var typeRequest = {
                    jobID: $scope.content.JobID,
                    subMenuAppPartID: 10675,
                    standardID: standardID,
                    recipeRefType: recipeRefType
                };
                $scope.RecipeDataByType = null;
                LeaderMESservice.customAPI('DisplayProductRecipeJobDetailsByType', typeRequest).then(function (response) {
                    $scope.RecipeDataByType = {
                        recipeData: response
                    };
                });
            };

            $scope.updateRecipeTypeCombo = function (checkType) {
                $scope.subCheckType = checkType;
                $scope.RecipeRefType = $scope.checkedType.index;
                $scope.standardID = $scope.subCheckType.standardID;
                $scope.getRecipeType($scope.standardID, $scope.RecipeRefType);
            };

            $scope.getNewRecipeType = function (recipeRef) {
                $scope.checkedType = { index: recipeRef.RecipeRefType };
                $scope.RecipeRefType = $scope.checkedType.index;
                $scope.subCheckType = undefined;
                if (recipeRef.StandardRecipe.length > 0) {
                    if ($scope.subCheckType) {
                        $scope.getRecipeType($scope.subCheckType.standardID, $scope.RecipeRefType);
                        $scope.standardID = $scope.subCheckType.standardID;
                        return;
                    }
                    $scope.standardID = 0;
                    return;
                }
                $scope.standardID = 0;
                $scope.getRecipeType($scope.standardID, $scope.RecipeRefType);
            };

            $scope.actionButton = function (action) {
                if ($scope.disableButton) {
                    return;
                }
                $scope.disableButton = true;
                if ($scope.RecipeData.saveChanges && action.SubMenuAppPartID !== 10875) {
                    $scope.RecipeData.saveChanges(function (success) {
                        if (success) {
                            if (action.SubMenuTargetTYpe === "wizard") {
                                commonFunctions.wizard($scope, action, $scope.content.JobID);
                            }
                            else if (action.SubMenuTargetTYpe === "Notification") {
                                var targetParameters = $scope.getTargetParameters(action.PreActionParameters);
                                commonFunctions.notification($scope, action, targetParameters, false);
                            }
                        }
                        $scope.disableButton = false;
                    });
                }
                else {
                    if (action.SubMenuTargetTYpe === "wizard") {
                        commonFunctions.wizard($scope, action, $scope.content.JobID);
                    }
                    else if (action.SubMenuTargetTYpe === "Notification") {
                        var targetParameters = $scope.getTargetParameters(action.PreActionParameters);
                        if (action.SubMenuAppPartID === 10875) {
                            targetParameters.recipeRefType = $scope.RecipeRefType;
                            targetParameters.recipeRefStandardID = $scope.standardID;
                        }
                        commonFunctions.notification($scope, action, targetParameters, false);
                    }
                    $scope.disableButton = false;
                }
            }
        };

        $scope.getTargetParameters = function (targetParameters) {
            targetParameters = targetParameters.split("=");
            var ans = {};
            ans[targetParameters[0]] = $scope.content.JobID;
            return ans;
        };

        $scope.getName = function (actionItem) {
            if ($scope.localLanguage == true) {
                return actionItem.SubMenuLName;
            }
            return actionItem.SubMenuEName;
        };

        init();
    }

    function splitJobAction($scope) {

        var actionModalInstance = $modal.open({

            templateUrl: 'views/custom/production/jobs/splitJobAction.html',
            resolve: {
                ID: function () {
                    return $scope.content.ID;
                },
                parentScope: function () {
                    return $scope;
                }
            },
            controller: function ($scope, $compile, $state, $modalInstance, LeaderMESservice, commonFunctions, ID, parentScope) {
                var splitJobActionCtrl = this;

                splitJobActionCtrl.disabled = false;

                splitJobActionCtrl.rtl = LeaderMESservice.isLanguageRTL();

                splitJobActionCtrl.title = "SPLIT_JOB";

                splitJobActionCtrl.splits = [];

                splitJobActionCtrl.remaningUnits = 0;

                splitJobActionCtrl.remaningUnitsPercentage = false;

                splitJobActionCtrl.close = function () {
                    $modalInstance.close();
                };

                splitJobActionCtrl.handleUpdateButton = function () {
                    if (this.splitType && this.numOfSplits) {
                        this.updateNumOfSplits();
                    }
                    if (!this.numOfSplits) {
                        splitJobActionCtrl.splits = [];
                    }
                };

                splitJobActionCtrl.split = function () {
                    if (splitJobActionCtrl.errorType == 1) {
                        return;
                    }
                    var data;
                    if ([1, 2, 3].indexOf(splitJobActionCtrl.splitStatus) >= 0) {
                        var sum = 0;
                        var responseSplits = [];
                        var tmpData = 0;
                        for (var i = 0; i < splitJobActionCtrl.splits.length; i++) {
                            sum = sum + splitJobActionCtrl.splits[i].value;
                            responseSplits.push(splitJobActionCtrl.splits[i].value);
                        }
                        if (splitJobActionCtrl.splitType.ID == 3) {
                            if (sum != 100) {
                                splitJobActionCtrl.error = "SPLITS_SUM_NOT_EQUAL_TO_UNITS";
                                $scope.diffData = {
                                    diff: 100 - sum
                                };
                                $scope.diffData.diff = $scope.diffData.diff + "%";
                                splitJobActionCtrl.errorType = 2;
                                return;
                            }
                        }
                        else {
                            if (splitJobActionCtrl.splitType.ID == 1) {
                                tmpData = splitJobActionCtrl.splitData.Duration;
                            }
                            else if (splitJobActionCtrl.splitType.ID == 2) {
                                tmpData = splitJobActionCtrl.splitData.UnitsTarget;
                            }
                            else if (splitJobActionCtrl.splitType.ID == 4) {
                                tmpData = splitJobActionCtrl.splitData.UnitsProducedLeft;
                            }
                            if (sum != tmpData) {
                                splitJobActionCtrl.error = "SPLITS_SUM_NOT_EQUAL_TO_UNITS";
                                $scope.diffData = {
                                    diff: tmpData - sum
                                };
                                splitJobActionCtrl.errorType = 2;
                                return;
                            }
                        }
                        splitJobActionCtrl.errorType = 0;
                        splitJobActionCtrl.error = "";
                        data = {
                            JobID: ID,
                            subMenuAppPartID: 10730,
                            SplitType: splitJobActionCtrl.splitType.ID,
                            SplitParams: responseSplits
                        };
                    }
                    else if (splitJobActionCtrl.splitStatus == 10) {
                        if (splitJobActionCtrl.splitData.UnitsTarget < splitJobActionCtrl.splits[0].value) {
                            splitJobActionCtrl.error = "SPLIT_IS_BIGGER_THAN_UNITS";
                            splitJobActionCtrl.errorType = 2;
                            return;
                        }
                        data = {
                            JobID: ID,
                            subMenuAppPartID: 10730,
                            SplitType: 2,
                            SplitParams: [splitJobActionCtrl.splits[0].value]
                        };
                    }
                    else {
                        data = { JobID: ID, subMenuAppPartID: 10730, SplitType: 0, SplitParams: [] };
                    }
                    LeaderMESservice.customAPI('SplitJob', data).then(function (response) {
                        if (response.error != null && response.error.ErrorCode != null) {
                            toastr.error("", $filter('translate')('SPLIT_JOB_ERR_MSG'));
                        } else {
                            toastr.success("", $filter('translate')('SPLIT_JOB_SUCCESS_MSG'));
                        }
                        LeaderMESservice.refreshPage(parentScope, 0, true);
                        // if (splitJobActionCtrl.splitData.ProductID){
                        //     var url = $state.href('appObjectFullView', {
                        //         appObjectName: 'Product',
                        //         ID: splitJobActionCtrl.splitData.ProductID
                        //     });
                        //     window.open(url, '_blank');
                        // }
                        splitJobActionCtrl.close();
                    });
                };

                splitJobActionCtrl.updateSplitType = function () {
                };

                splitJobActionCtrl.updateNumOfSplits = function () {
                    if (splitJobActionCtrl.numOfSplits < 2 || !splitJobActionCtrl.numOfSplits) {
                        splitJobActionCtrl.error = "MINIMUM_SPLITS";
                        splitJobActionCtrl.errorType = 1;
                        splitJobActionCtrl.splits = [];
                        return;
                    }
                    if (splitJobActionCtrl.numOfSplits > 10) {
                        splitJobActionCtrl.error = "MAXIMUM_SPLITS";
                        splitJobActionCtrl.errorType = 1;
                        splitJobActionCtrl.splits = [];
                        return;
                    }
                    splitJobActionCtrl.error = "";
                    splitJobActionCtrl.errorType = 0;
                    var unitsNum = this.splitData.UnitsTarget;
                    var tmp = 0;
                    splitJobActionCtrl.splits = [];

                    if (splitJobActionCtrl.splits.length < splitJobActionCtrl.numOfSplits) {
                        var splitsLength = splitJobActionCtrl.splits.length;
                        for (var i = splitsLength; i < splitJobActionCtrl.numOfSplits; i++) {
                            if (this.splitType.ID == 3) {
                                splitJobActionCtrl.splits.push({
                                    id: "split_" + i,
                                    value: Math.floor(100 / splitJobActionCtrl.numOfSplits)
                                });
                                tmp += Math.floor(100 / splitJobActionCtrl.numOfSplits);
                            } else {
                                splitJobActionCtrl.splits.push({
                                    id: "split_" + i,
                                    value: Math.ceil(unitsNum-- / splitJobActionCtrl.numOfSplits)
                                });
                            }
                        }
                        if (this.splitType.ID == 3) {
                            // add remaining percentage to last element
                            splitJobActionCtrl.splits[splitJobActionCtrl.splits.length - 1].value += (100 - tmp);
                        }
                    }
                    else if (splitJobActionCtrl.splits.length > splitJobActionCtrl.numOfSplits) {
                        splitJobActionCtrl.splits.splice(splitJobActionCtrl.numOfSplits);
                    }
                };

                LeaderMESservice.customAPI('GetSplitJobDetails', { JobID: ID }).then(function (response) {
                    splitJobActionCtrl.splitStatus = response.Status;
                    if (response.Status == 11) {
                        splitJobActionCtrl.disabled = true;
                    }
                    else if (response.Status == 10) {
                        var splitType = _.find(response.SplitTypes, { ID: 2 });
                        if (splitType) {
                            splitJobActionCtrl.splitType = splitType;
                            splitJobActionCtrl.disabled = true;
                        }
                        else {
                            $modalInstance.close();
                        }

                        splitJobActionCtrl.splits = [{
                            id: "split_0",
                            value: 0
                        }];
                    }
                    splitJobActionCtrl.splitData = response;
                    if (splitJobActionCtrl.splitData.Duration == 0) {
                        _.remove(splitJobActionCtrl.splitData.SplitTypes, { ID: 1 });
                    }
                    else if (splitJobActionCtrl.splitData.UnitsTarget == 0) {
                        _.remove(splitJobActionCtrl.splitData.SplitTypes, { ID: 2 });
                        _.remove(splitJobActionCtrl.splitData.SplitTypes, { ID: 3 });
                    }
                    else if (splitJobActionCtrl.splitData.UnitsProducedLeft == 0) {
                        _.remove(splitJobActionCtrl.splitData.SplitTypes, { ID: 4 });
                    }

                });

                $scope.localLanguage = LeaderMESservice.showLocalLanguage();

            },
            controllerAs: 'splitJobActionCtrl'
        });

    }

    return {
        generalCode: generalCode,
        RecipeCode: RecipeCode,
        splitJobAction: splitJobAction
    }
});