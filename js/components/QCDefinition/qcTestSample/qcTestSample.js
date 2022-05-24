function qcTestSample() {

    var template = 'js/components/QCDefinition/qcTestSample/qcTestSample.html';

    var controller = function ($scope, LeaderMESservice, $timeout, $modal, googleAnalyticsService) {
        var qcTestSampleCtrl = this;
        const upperScope = $scope;

        $timeout(function () {
            $("#sortable").sortable({
                start: function (a, b) {
                    // add logic here if you would like to do it on drag start
                    // for example, save new sort order, update DisplayOrder value
                },
                update: function (a, b) {
                    // add logic here if you would like to do it on drag end
                    // for example, save new sort order, update DisplayOrder value
                }
            });
        }, 500);


        $scope.checkIfShouldOpenCalc = function (row) {
            if (row.InputType == 66) {
                $scope.openCalculator(row);
            }
        };

        $scope.openCalculator = function (row) {
            googleAnalyticsService.gaEvent("QC_Module", "open_calc");

            $modal.open({
                templateUrl: 'views/common/calculatorPopup.html',
                controller: function ($scope, $modalInstance, toastr, $timeout) {

                    toastr.clear();

                    /**
                     * Get Test Details according to Test ID and open calc with relevant data
                     */
                    LeaderMESservice.customAPI('GetTestSampleFieldDetails', {
                        TestFieldID: row.ID
                    }).then(function (res) {
                        $scope.testData = res.ResponseList[0];
                        $scope.responseDictionary = res.ResponseDictionaryDT;

                        //enable sorting and dragging
                        $timeout(function () {
                            $("#calculatorSortableOperation").sortable({
                                connectWith: ".calculatorSortableFields",
                                cancel: ".ui-state-disabled",
                                start: function (a, b) {
                                    // add logic here if you would like to do it on drag start
                                    // for example, save new sort order, update DisplayOrder value
                                    console.log('aa');
                                },
                                update: function (a, b) {
                                    for (let i = 0; i < a.target.children.length; i++) {
                                        if (a.target.children[i].className.indexOf('field-item') > -1) {
                                            a.target.children[i].remove();
                                        }

                                        if (a.target.children[i].className.indexOf('operator-item') > -1) {
                                            a.target.children[i].remove();
                                        }
                                    }

                                }
                            });

                            $("#calculatorSortableOperators").sortable({
                                connectWith: ".calculatorSortableOperation",
                                start: function (a, b) {
                                    $scope.opStartDragIndx = b.item.index();
                                    //$scope.clonedOPerator = b.item.clone();
                                },
                                update: function (a, b) {
                                    $scope.operation.splice(b.item.index(), 0, $scope.operators[$scope.opStartDragIndx]);
                                    if ($scope.clonedOPerator)
                                        $scope.clonedOPerator.appendTo('#calculatorSortableOperators');
                                    $scope.$apply();
                                }
                            });

                            $("#calculatorSortableFields").sortable({
                                connectWith: ".calculatorSortableOperation",
                                start: function (a, b) {
                                    $scope.fieldStartDragIndx = b.item.index();
                                },
                                update: function (a, b) {
                                    // add logic here if you would like to do it on drag end
                                    // for example, save new sort order, update DisplayOrder value

                                    $scope.operation.splice(b.item.index(), 0, $scope.fields[$scope.fieldStartDragIndx]);

                                    for (let i = 0; i < a.target.children.length; i++) {
                                        if (a.target.children[i].className.indexOf('dotted-boxes') > -1) {
                                            a.target.children[i].remove();
                                        }
                                    }

                                    $scope.$apply();
                                }
                            });
                        }, 500);

                        $scope.operators = [
                            {
                                id: 'add',
                                char: '+',
                                src: 'plus.png'
                            },
                            {
                                id: 'minus',
                                char: '-',
                                src: 'minus.png'
                            },
                            {
                                id: 'multiple',
                                char: '*',
                                src: 'multiple.png'
                            },
                            {
                                id: 'division',
                                char: '/',
                                src: 'devide.png'
                            },
                            {
                                id: 'left-brac',
                                char: '(',
                                src: 'left-brac.png'
                            },
                            {
                                id: 'right-brac',
                                char: ')',
                                src: 'right-brac.png'
                            }
                        ];

                        $scope.operation = _.map(res.CalcStrings, function (op) {
                            // check if op is an operator or a field
                            const operatorFound = _.find($scope.operators, {char: op});
                            return operatorFound || {
                                name: _.find(res.ResponseDictionaryDT.CalcFields, {id: op}).name,
                                id: op,
                                field: true
                            }
                        });


                        $scope.fields = _.map(res.ResponseDictionaryDT.CalcFields, function (field) {
                            return {
                                field: true,
                                name: field.name,
                                id: field.id
                            }
                        });

                        $scope.removeArgument = function (indx, arg) {
                            if (arg.field) {
                                $scope.fields.unshift(arg)
                            }
                            $scope.operation.splice(indx, 1);
                        };

                        $scope.close = function () {
                            $modalInstance.close();
                        };

                        $scope.save = function () {
                            const bodyReq = {
                                Field: {}
                            };

                            LeaderMESservice.customAPI('SaveTestSampleFieldDetails', bodyReq).then(function (res) {
                                $modalInstance.close();
                            });
                        };

                    });
                },
                controllerAs: 'calculatorCtrl'
            }).result.then(function (res) {
                if (res) {
                }
            });
        };

        $scope.openNumericPopup = function() {
            $modal.open({
                templateUrl: 'views/common/numericPopup.html',
                controller: function ($scope, $modalInstance, toastr) {
                    toastr.clear();

                    $scope.close = function () {
                        $modalInstance.close();
                    };

                    $scope.save = function () {
                        $modalInstance.close();
                    };
                },
                controllerAs: 'numericPopupCtrl'
            }).result.then(function (res) {
                if (res) {
                }
            });
        };

        $scope.getDataParamOptions = function (source) {
            const found = _.find($scope.dataParamOptions, {ID: source});
            return found ? found.InputTypeFields : [];
        };

        $scope.checkIfShouldOpenNumericPopup = function(row) {

            if (row.FieldType=='Boolean') {
                //default only for boolean field type
                row.InputType = 0;
                row.LValue = 1;
                row.HValue = 1;
                row.AllowNull = true;
            }
            else if (row.FieldType=='num') {
                row.AllowNull = true;
                $scope.openNumericPopup();
            } else {
                //defaults
                row.InputType = 0;
                row.LValue = null;
                row.HValue = null;
                row.AllowNull = true;
            }
        };

        $scope.fetching = true;

        LeaderMESservice.customAPI('GetTestSampleFields', {"TestDefID": $scope.currentTest.id}).then(function (res) {
            $scope.rows = res.ResponseList || [];
            //according to Eran..
            $scope.dataSourceOptions = res.ResponseDataTable[0];
            $scope.fieldTypeOptions = res.ResponseDataTable[1];
            $scope.fetching = false;

            $scope.missingLocalName = _.map($scope.rows, function (row) {
                return (!row.EName && !row.LName)
            });

            $scope.$watch('rows', function (newVal, oldVal) {

                upperScope.missingRequired = false;

                angular.forEach($scope.rows, function (row, i) {
                    if (!row.EName && !row.LName) {
                        upperScope.missingRequired = true;
                    }
                });
            }, true);
        });

        $scope.checkIfMissingLocalName = function(row, indx) {
            $scope.missingLocalName[indx] = (!row.LName && !row.EName);
        };

        $scope.removeRow = function(id, idx) {
            if (id == 0) {
                $scope.rows.splice(idx, 1);
                $scope.missingLocalName.splice(idx,1);
                return;
            }

            const foundRow = _.find($scope.rows, {ID: id});
            if (foundRow)
            {
                foundRow.UpsertType = 1;
            }
        };

        $scope.saveAndFinish = function() {
            angular.forEach($scope.rows, function (row) {
                if (!row.UpsertType) {
                    row.UpsertType = 3; //3 for update, if existing then we got it from new row
                }
            });

            let bodyReq = {
                "Fields": $scope.rows
            };

            LeaderMESservice.customAPI('SaveTestSampleFields', bodyReq).then(function (res) {
                $scope.assignCurrentStep('qc-tests');
            })
        };

        $scope.getNewRow = function() {
            return {
                "ID": 0,
                "SubType": $scope.currentTest.id,
                "LName": "",
                "EName": "",
                "DisplayOrder": $scope.rows.length,
                "FieldType": "num",
                "InputType": 0,
                "PropertyID": 0,
                "AllowNull": true,
                "AutoUpdateProperty": true,
                "LValue": null,
                "HValue": null,
                "UpsertType": 2 // 2 for INSERT
            }
        };

        $scope.addRow = function() {
            $scope.rows.unshift($scope.getNewRow());
            $scope.missingLocalName.unshift(true);
        };

        $scope.assignCurrentStep = function (step, test) {
            $scope.step = step;
            $scope.currentTest = test;
        };

        $scope.finish = function () {
            $scope.saveAndFinish();
        }

    };

    return {
        require: "^qcDefinition",
        restrict: "E",
        templateUrl: template,
        scope: {
            currentTest: "="
        },
        link: function (scope, element, attrs, qcDefinitionCtrl) {
            /**
             * trigger function 'assignCurrentStep' in parent directive
             */
            scope.assignCurrentStep = function (step, test) {
                qcDefinitionCtrl.assignCurrentStep(step, test);
            }
        },
        controller: controller,
        controllerAs: "qcTestSampleCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('qcTestSample', qcTestSample);
