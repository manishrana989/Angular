function recipeDirective($compile) {
    var Template = "views/custom/production/Recipe/recipe.html";

    var linker = function (scope, element, attrs) { };

    var controller = function (
        $scope,
        $timeout,
        commonFunctions,
        LeaderMESservice,
        notify,
        $modal,
        toastr,
        $filter,
        $element
    ) {
        var buildRecipeSplitData = function (splits) {
            for (var k = 0; k < splits.length; k++) {
                var splitField = splits[k];
                if (splitField) {
                    if (splitField.SearchLinkReportID != null) {
                        if (splitField.FValue !== "") {
                            splitField.FValue = parseFloat(splitField.FValue);
                        }
                        splitField.template =
                            "views/custom/production/Recipe/specialNum.html";
                    } else if (splitField.DisplayType === "combo") {
                        splitField.FValue = _.find(splitField.ComboValues, {
                            isDefault: true,
                        });
                        splitField.template = "views/custom/production/Recipe/combo.html";
                    } else if (splitField.DisplayType === "text") {
                        splitField.template = "views/custom/production/Recipe/text.html";
                    } else if (splitField.DisplayType === "num") {
                        if (
                            splitField.FValue !== "" &&
                            splitField.FValue !== null &&
                            splitField.RecipeFValue
                        ) {
                            splitField.FValue = parseFloat(splitField.FValue);
                            if (splitField.FValue < splitField.LValue) {
                                splitField.LValueError = "outOfBoundaryColor";
                            } else if (splitField.FValue > splitField.HValue) {
                                splitField.HValueError = "outOfBoundaryColor";
                            }
                        } else {
                            splitField.FValue = null;
                        }
                        splitField.template = "views/custom/production/Recipe/num.html";
                        if (splitField.RoundNum) {
                            if (splitField.FValue !== "" && splitField.FValue !== null) {
                                splitField.FValue = parseFloat(
                                    splitField.FValue.toFixed(splitField.RoundNum)
                                );
                            }
                            if (splitField.LValue !== "" && splitField.LValue !== null) {
                                splitField.LValue = parseFloat(
                                    splitField.LValue.toFixed(splitField.RoundNum)
                                );
                            }
                            if (splitField.HValue !== "" && splitField.HValue !== null) {
                                splitField.HValue = parseFloat(
                                    splitField.HValue.toFixed(splitField.RoundNum)
                                );
                            }
                            var times = splitField.RoundNum;
                            splitField.RoundNum = "0.";
                            for (var l = 0; l < times - 1; l++) {
                                splitField.RoundNum = splitField.RoundNum + "0";
                            }
                            splitField.RoundNum = splitField.RoundNum + "1";
                            splitField.RoundNum = parseFloat(splitField.RoundNum);
                        }
                    } else if (splitField.DisplayType === "Boolean") {
                        splitField.FValue = splitField.FValue.toLowerCase() === "true";
                        splitField.template = "views/custom/production/Recipe/boolean.html";
                    }
                }
            }
        };

        var buildDataRecipeOrig = function () {
            if ($scope.content.recipeData.channels) {
                $scope.channels = $scope.content.recipeData.channels;
                $scope.LastUpdate =
                    $scope.content.recipeData.LastUpdate ||
                    $scope.content.recipeData.RecipeJobLastUpdate;
                $scope.UpdatedBy =
                    $scope.content.recipeData.UpdatedBy ||
                    $scope.content.recipeData.RecipeJobUpdatedBy;
            } else if (
                $scope.content.recipeData.Recipe &&
                $scope.content.recipeData.Recipe.channels
            ) {
                $scope.channels = $scope.content.recipeData.Recipe.channels;
                $scope.LastUpdate =
                    $scope.content.recipeData.Recipe.LastUpdate ||
                    $scope.content.recipeData.RecipeJobLastUpdate;
                $scope.UpdatedBy =
                    $scope.content.recipeData.Recipe.UpdatedBy ||
                    $scope.content.recipeData.RecipeJobUpdatedBy;
            } else {
                $scope.channels = [];
            }
            $scope.showRecipeMatrix = false;
            for (var i = 0; i < $scope.channels.length; i++) {
                if ($scope.channels[i].inRecipeMatrix !== false) {
                    $scope.showRecipeMatrix = true;
                }

                for (var j = 0; j < $scope.channels[i].channelSplit.length; j++) {
                    var materialSplit = _.find(
                        $scope.channels[i].channelSplit[j].splits,
                        { PropertyName: "Material ID" }
                    );
                    if (materialSplit && materialSplit.FValue !== "") {
                        materialSplit.FValue = parseFloat(materialSplit.FValue);
                    } else if (materialSplit) {
                        materialSplit.FValue = 0;
                    }
                    if (materialSplit && materialSplit.PropertyName == "Material ID") {
                        if (materialSplit.CatalogID != null) {
                            materialSplit.Name =
                                materialSplit.CatalogID +
                                " - " +
                                ($scope.localLanguage
                                    ? materialSplit.MaterialLName
                                    : materialSplit.MaterialEName) +
                                " - " +
                                ($scope.localLanguage
                                    ? materialSplit.MaterialTypeLname
                                    : materialSplit.MaterialTypeEname);
                        }
                    }
                    buildRecipeSplitData($scope.channels[i].channelSplit[j].splits);
                }
            }
        };

        var buildDataRecipeMatrix = function () {
            var modalInstance = $modal.open({
                templateUrl: "views/custom/production/Recipe/recipeMatrix.html",
                controller: function ($scope, $modalInstance, channels) {
                    $scope.cancel = function () {
                        $modalInstance.close();
                    };
                    $scope.localLanguage = LeaderMESservice.showLocalLanguage();
                    $scope.rtl = LeaderMESservice.isLanguageRTL();
                    $scope.topRecipeMatrixView = [];
                    $scope.bottomRecipeMatrixView = [];
                    $scope.middlleRecipeMatrixView = [];
                    $scope.sumRowRecipeMatrix = [];
                    $scope.sumColRecipeMatrix = [];
                    $scope.channelsRecipeMatrix = [];
                    for (var i = 0; i < channels.length; i++) {
                        var channel = channels[i];
                        if (channel.inRecipeMatrix === false) {
                            continue;
                        }
                        $scope.channelsRecipeMatrix.push(channel.ChannelNumber);
                        for (var j = 0; j < channel.channelSplit.length; j++) {
                            var channelSplit = channel.channelSplit[j];
                            for (var k = 0; k < channelSplit.splits.length; k++) {
                                var splitField = channelSplit.splits[k];
                                if (splitField.DisplayType === "num") {
                                    splitField.template =
                                        "views/custom/production/Recipe/matrixNum.html";
                                    if (splitField.FValue !== "" && splitField.FValue !== null) {
                                        splitField.FValue = parseFloat(splitField.FValue);
                                    } else {
                                        splitField.FValue = 0;
                                    }
                                    if (splitField.RoundNum) {
                                        var times = splitField.RoundNum;
                                        splitField.RoundNum = "0.";
                                        for (var l = 0; l < times - 1; l++) {
                                            splitField.RoundNum = splitField.RoundNum + "0";
                                        }
                                        splitField.RoundNum = splitField.RoundNum + "1";
                                        splitField.RoundNum = parseFloat(splitField.RoundNum);
                                    }
                                }
                                if (splitField.matrixModeID === 2) {
                                    $scope.topRecipeMatrixView.push(splitField);
                                } else if (splitField.matrixModeID === 3) {
                                    $scope.bottomRecipeMatrixView.push(splitField);
                                } else if (
                                    splitField.matrixModeID === 4 ||
                                    splitField.matrixModeID === 6
                                ) {
                                    var splitRecipeMatrix = _.find(
                                        $scope.middlleRecipeMatrixView,
                                        { SplitNumber: channelSplit.SplitNumber }
                                    );
                                    if (splitRecipeMatrix) {
                                        var propertyRecipeMatrix = _.find(
                                            splitRecipeMatrix.Properties,
                                            { PropertyName: splitField.PropertyName }
                                        );
                                        if (propertyRecipeMatrix) {
                                            propertyRecipeMatrix.channels.push({
                                                ChannelNumber: channel.ChannelNumber,
                                                SplitField: splitField,
                                            });
                                        } else {
                                            splitRecipeMatrix.Properties.push({
                                                PropertyName: splitField.PropertyName,
                                                PropertyEName: splitField.PropertyEName,
                                                PropertyHName: splitField.PropertyHName,
                                                channels: [
                                                    {
                                                        ChannelNumber: channel.ChannelNumber,
                                                        SplitField: splitField,
                                                    },
                                                ],
                                            });
                                        }
                                    } else {
                                        $scope.middlleRecipeMatrixView.push({
                                            SplitNumber: channelSplit.SplitNumber,
                                            Properties: [
                                                {
                                                    PropertyName: splitField.PropertyName,
                                                    PropertyEName: splitField.PropertyEName,
                                                    PropertyHName: splitField.PropertyHName,
                                                    channels: [
                                                        {
                                                            ChannelNumber: channel.ChannelNumber,
                                                            SplitField: splitField,
                                                        },
                                                    ],
                                                },
                                            ],
                                        });
                                    }
                                    if (splitField.matrixModeID === 6) {
                                        var sumProperty = _.find($scope.sumColRecipeMatrix, {
                                            PropertyName: splitField.PropertyName,
                                        });
                                        if (sumProperty) {
                                            var channelCol = _.find(sumProperty.channels, {
                                                ChannelNumber: channel.ChannelNumber,
                                            });
                                            if (channelCol) {
                                                channelCol.total = channelCol.total + splitField.FValue;
                                            } else {
                                                sumProperty.channels.push({
                                                    ChannelNumber: channel.ChannelNumber,
                                                    total: splitField.FValue,
                                                });
                                            }
                                        } else {
                                            $scope.sumColRecipeMatrix.push({
                                                PropertyName: splitField.PropertyName,
                                                PropertyEName: splitField.PropertyEName,
                                                PropertyHName: splitField.PropertyHName,
                                                channels: [
                                                    {
                                                        ChannelNumber: channel.ChannelNumber,
                                                        total: splitField.FValue,
                                                    },
                                                ],
                                            });
                                        }
                                    }
                                } else if (splitField.matrixModeID === 5) {
                                    var sumProperty = _.find($scope.sumRowRecipeMatrix, {
                                        PropertyName: splitField.PropertyName,
                                    });
                                    if (sumProperty) {
                                        sumProperty.channels.push({
                                            ChannelNumber: channel.ChannelNumber,
                                            SplitField: splitField,
                                        });
                                        sumProperty.total = sumProperty.total + splitField.FValue;
                                    } else {
                                        $scope.sumRowRecipeMatrix.push({
                                            PropertyName: splitField.PropertyName,
                                            PropertyEName: splitField.PropertyEName,
                                            PropertyHName: splitField.PropertyHName,
                                            total: splitField.FValue,
                                            channels: [
                                                {
                                                    ChannelNumber: channel.ChannelNumber,
                                                    SplitField: splitField,
                                                },
                                            ],
                                        });
                                    }
                                }
                            }
                        }
                    }
                    if ($scope.channelsRecipeMatrix.length > 4) {
                        $scope.colWidth = "col-lg-2";
                    } else {
                        $scope.colWidth =
                            "col-lg-" + 12 / $scope.channelsRecipeMatrix.length;
                    }
                },
                resolve: {
                    channels: function () {
                        return angular.copy($scope.channels);
                    },
                },
            });
        };

        $scope.recipeChange = function (FValue, LValue, HValue, recipeId) {
            if (!FValue) {
                FValue = "";
            }
            var recipeFound = _.find($scope.changes, { RecipeID: recipeId });
            if (recipeFound) {
                recipeFound.FValue = FValue.toString();
                recipeFound.LValue = LValue;
                recipeFound.HValue = HValue;
                return;
            }
            var newRecipeUpdate = {
                RecipeID: recipeId,
                FValue: FValue ? FValue.toString() : "",
                LValue: LValue,
                HValue: HValue,
            };
            $scope.changes.push(newRecipeUpdate);
        };

        $scope.saveChanges = function (cb) {
            if ($scope.disableButton) {
                return;
            }
            $scope.disableButton = true;
            $scope.content.saveRequest.recipeValue = $scope.changes || [];
            $scope.content.saveRequest.recipeRefStandardID =
                commonFunctions.searchParent($scope, "standardID");
            $scope.content.saveRequest.recipeRefType = commonFunctions.searchParent(
                $scope,
                "RecipeRefType"
            );
            LeaderMESservice.customAPI(
                $scope.content.saveRequestAPI,
                $scope.content.saveRequest
            ).then(
                function (response) {
                    $scope.disableButton = false;
                    if (response.error !== null) {
                        notify({
                            message:
                                response.error.ErrorCode +
                                " - " +
                                response.error.ErrorDescription,
                            classes: "alert-danger",
                            templateUrl: "views/common/notify.html",
                        });
                        if (cb) {
                            return cb(false);
                        }
                    } else {
                        if (cb) {
                            return cb(true);
                        }
                        toastr.success("", $filter("translate")("SAVED_SUCCESSFULLY"));
                        LeaderMESservice.refreshPage($scope);
                    }
                },
                function (error) {
                    $scope.disableButton = false;
                    if (cb) {
                        return cb(false);
                    }
                }
            );
        };

        // $timeout(function(){
        //     var recipeForm = $element[0].getElementsByClassName('recipe-form');
        //     if (recipeForm && recipeForm.length > 0){
        //         $scope.recipeForm = recipeForm[0];
        //     }
        // },500);

        $scope.content.saveChanges = $scope.saveChanges;
        // $scope.content.saveChanges = function(cb){
        //     var saveButton = $element[0].getElementsByClassName('save-changes-recipe');
        //     $scope.outerCallback = null;
        //     if (saveButton && saveButton.length > 0 && saveButton[0].click) {
        //         $scope.outerCallback = cb;
        //         saveButton[0].click();
        //         if ($scope.recipeForm){
        //             if (!$scope.recipeForm.checkValidity()){
        //                 $scope.outerCallback = null;
        //                 cb(false);
        //                 return;
        //             }
        //         }
        //         // saveButton[0].click();
        //     }
        //     else {
        //         cb(true);
        //     }
        // };

        $scope.AddNewItem = function (propertyName, reportID, split) {
            var modalInstance = $modal
                .open({
                    templateUrl: "views/common/mainContentTemplate.html",
                    controller: function (
                        $scope,
                        $compile,
                        $modalInstance,
                        reportID,
                        commonFunctions
                    ) {
                        $scope.reportID = reportID;
                        $scope.pageDisplay = 0;
                        $scope.returnValue = true;
                        $scope.onlyNewTab = true;
                        $scope.modal = true;
                        $scope.multiSelect = false;
                        $scope.showBreadCrumb = false;
                        commonFunctions.commonCodeSearch($scope);

                        $scope.getDisplayReportSearchFields();

                        $scope.ok = function () {
                            $modalInstance.close();
                        };

                        $scope.rowClicked = function (id, formID, fieldName, data) {
                            $modalInstance.close(data);
                        };
                    },
                    resolve: {
                        reportID: function () {
                            return reportID;
                        },
                    },
                })
                .result.then(function (result) {
                    split.FValue = result.ID;
                    split.Name = result.Ename;
                    $scope.recipeChange(
                        split.FValue,
                        "",
                        "",
                        split.ProductRecipeID,
                        "modal"
                    );
                });
        };

        $scope.changeView = function () {
            //$scope.recipeOrig = !$scope.recipeOrig;
            // buildData();
            buildDataRecipeMatrix();
        };

        var buildData = function () {
            if ($scope.recipeOrig === true) {
                buildDataRecipeOrig();
                $scope.currentRecipe = "RECIPE_MATRIX";
            } else {
                buildDataRecipeMatrix();
                $scope.currentRecipe = "RECIPE";
            }
        };

        var init = function () {
            $scope.recipeOrig = true;
            $scope.currentRecipe = "RECIPE_MATRIX";
            $scope.localLanguage = LeaderMESservice.isLanguageRTL();
            buildData();
            $scope.showViewOnly = !$scope.content.saveRequestAPI;
            $scope.changes = [];
        };

        init();
    };

    return {
        restrict: "E",
        link: linker,
        templateUrl: Template,
        scope: {
            content: "=",
        },
        controller: controller,
    };
}

angular.module("LeaderMESfe").directive("recipeDirective", recipeDirective);
