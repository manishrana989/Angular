function qcTestEdit() {

    var template = 'js/components/QCDefinition/qcTestEdit/qcTestEdit.html';

    var controller = function ($scope, toastr, LeaderMESservice, $timeout, SweetAlert, $filter, $modal, googleAnalyticsService, $state) {
        const qcTestEditCtrl = this;
        toastr.clear();
        if ($scope.currentTest.isdraftmode == "Release Mode") {
            $scope.FieldsDisabled = true;
        } else {
            $scope.FieldsDisabled = false;
        }
        /**
         * Initialize start and end drag index with -1
         * @type {number}
         */
        $scope.startDragIndx = -1;
        $scope.endDragIndx = -1;

        $scope.testFields = [];

        const upperScope = $scope;
        const generalGroup = {
            "ID": 0,
            "Name": "General",
            "DisplayOrder": 0,
            "UpsertType": 2,
            "SubType": $scope.currentTest.id
        };

        /**
         * Map of test fields to groups by group ID
         * key is group ID, value is relevant test fields rows
         * @type {{}}
         */
        $scope.groupsMap = {};


        $scope.sortRowsAfterSwap = function (rows) {
            rows.sort(function (obj1, obj2) {
                return obj1.DisplayOrder == obj2.DisplayOrder ? 0 : obj1.DisplayOrder > obj2.DisplayOrder ? 1 : -1;
            });
        };

        $scope.noDataToSave = true;
        $scope.noDataToSaveSample = true;

        $scope.addNewGroup = function () {
            let newId = Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000);
            $scope.groupingTestFields.push(
                {
                    name: (!$scope.groupingTestFields || $scope.groupingTestFields.length == 0) ? 'General' : '',
                    ID: newId,
                    DisplayOrder: 0,
                    UpsertType: 2, // 2 for insert,
                    SubType: $scope.currentTest.id
                }
            );
            $scope.groupsMap[newId] = [];

            let newRow = { GroupID: newId, ...qcTestEditCtrl.getNewRow('test-fields') };
            $scope.groupsMap[newId].push(newRow);
            $scope.testFields.push(newRow);
        };

        $scope.checkIfShouldOpenCalc = function (row) {
            if (row.InputType == 33 || row.InputType == 44 || row.InputType == 66) {
                $scope.openCalculator(row);
            }
        };

        $scope.openCalculator = function (row) {

            googleAnalyticsService.gaEvent("QC_Module", "open_calc");

            $scope.save(null, false, true, row);
        };

        // $scope.checkIfMissingLocalName = function (row) {
        //     $scope.missingLocalName[row.ID] = (!row.LName && !row.EName);
        // };
        $scope.releaseTest = function (test) {
            SweetAlert.swal({
                title: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO') + " " + $filter('translate')('RELEASE_TEST_ACTION') + "?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#D0D0D0",
                confirmButtonText: $filter('translate')("YES"),
                cancelButtonText: $filter('translate')("NO"),
                closeOnConfirm: true,
                closeOnCancel: true,
                animation: "false",
                customClass: ($scope.rtl ? "swalRTL" : "")
            },
                function (isConfirm) {
                    if (isConfirm) {
                        LeaderMESservice.customAPI("FinishTestDraft", { SubType: test.id }).then(function (e) {
                            toastr.clear();
                            toastr.success("", $filter('translate')('RELEASE_TEST_SUCCESSFULLY'));
                            $scope.assignCurrentStep('qc-tests');
                        })
                    }
                    else {
                        actionItem.disabled = false;
                    }
                });
        }
        $scope.finish = function (test) {
            if (test.isdraftmode === "Release Mode") {
                $scope.assignCurrentStep('qc-tests');
            } else {
                var form = document.querySelector('form')
                if (upperScope.noDataToSave && upperScope.noDataToSaveSample) {
                    $scope.assignCurrentStep('qc-tests');
                } else {

                    if (form.reportValidity()) {
                        let title = $filter('translate')("YOU_HAVE_UNSAVED_DATA");
                        let confirmButtonText = $filter('translate')("SAVE_CHANGES");
                        let cancelButtonText = $filter('translate')("DISCARD_DATA");

                        SweetAlert.swal({
                            title: title,
                            showCancelButton: true,
                            confirmButtonColor: "#D0D0D0",
                            confirmButtonText: confirmButtonText,
                            cancelButtonText: cancelButtonText,
                            confirmButtonColor: 'green',
                            closeOnConfirm: true,
                            closeOnCancel: true,
                            animation: "false"
                        },
                            function (isConfirm) {
                                if (isConfirm) {
                                    upperScope.save(null, true);
                                } else {
                                    $scope.assignCurrentStep('qc-tests');
                                }
                            }
                        );
                    }
                }
            }

        };

        $scope.save = function ($event, finished, openCalc, rowToSave, row, isSample, fieldTypeName) {

            if ($event != null) {
                $event.target.disabled = true;
            }

            $scope.fetching = true;
            angular.forEach($scope.sampleRows, function (row, i) {

                // this displayOrder assignment does not affect existing displayOrder for rows. It just override it in case there were no
                // previous displayOrder sent by the server (which means all of the rows have zero displayOrder) so we would like to override these
                // values and send new displayOrder to the server. Also we are always sorting the rows after drag and swap therefore the displayOrder should
                // always be equal to the index of the rows. If not there were something wrong, so we would like to override it anyway with this sequent sort index
                // before saving.
                row.DisplayOrder = i + 1;

                if (!row.UpsertType) {
                    row.UpsertType = 3; //3 for update, if existing then we got it from new row
                }
            });

            let sampleBodyReq = {
                "Fields": $scope.sampleRows
            };

            // re create rows before saving, these rows will now have merged test and param fields and ensure no duplicated display order
            $scope.rows = Object.entries($scope.groupsMap).map(it => it[1]).flat();
            $scope.rows = $scope.rows.concat($scope.paramFields);

            angular.forEach($scope.rows, function (row, i) {
                row.DisplayOrder = i + 1;

                // assign a name to param fields according to their data source
                if (row.InputType == 2 || row.InputType == 6) {
                    const dataParam = _.find($scope.dataParamOptions, { ID: row.InputType });
                    const found = _.find(dataParam.InputTypeFields, { fieldname: row.InputField });
                    row.EName = row.LName = (found ? found.name : '')
                }

                if (!row.UpsertType) {
                    row.UpsertType = 3; //3 for update, if existing then we got it from new row
                }

            });

            let bodyReq = {
                "Fields": $scope.rows,
                "Groups": $scope.groupingTestFields
            };

            //and save test samples fields
            let newRowIdForCalc, newMap;
            $scope.IsEditlistEmpty = false;
            var testFields = $scope.testFields.filter(x => x.FieldType === "combo" && (x.UpsertType === 3 || x.UpsertType === 2));
            var sampleRows = $scope.sampleRows.filter(x => x.FieldType === "combo" && (x.UpsertType === 3 || x.UpsertType === 2));

            if (sampleRows.length > 0) {
                angular.forEach(sampleRows, function (row, i) {
                    if (row != null && $scope.IsEditlistEmpty === false && row.RequiredField) {
                        var sendObj = { "formID": 20007, "pairs": [{ "FieldName": "FieldID", "Eq": row.ID, "DataType": "num" }] }
                        LeaderMESservice.customAPI("DisplayFormResults", sendObj).then(function (response) {
                            if (response.AllrecordValue.length === 0) {
                                $scope.IsEditlistEmpty = true;
                            } else {
                                $scope.IsEditlistEmpty = false;
                            }
                        }, function (err) {
                        });
                    }

                });

            }
            if (testFields.length > 0) {
                angular.forEach(testFields, function (row, i) {
                    if (row != null && $scope.IsEditlistEmpty === false && row.RequiredField) {
                        var sendObj = { "formID": 20006, "pairs": [{ "FieldName": "FieldID", "Eq": row.ID, "DataType": "num" }] }
                        LeaderMESservice.customAPI("DisplayFormResults", sendObj).then(function (response) {
                            if (response.AllrecordValue.length === 0) {
                                $scope.IsEditlistEmpty = true;
                            } else {
                                $scope.IsEditlistEmpty = false;
                            }
                        }, function (err) {
                        });
                    }

                });

            }

            setTimeout(() => {
                if ($scope.IsEditlistEmpty === false || fieldTypeName === "editlist") {
                    LeaderMESservice.customAPI('SaveTestSampleFields', sampleBodyReq).then(function (sampleRes) {
                        if (sampleRes?.error) {
                            toastr.clear();
                            $scope.fetching = false;
                            toastr.error("", sampleRes?.error?.ErrorDescription);
                            return
                        }

                        if (isSample == 1) {

                            newMap = sampleRes.NewMappedRecordsIDs
                        }
                        angular.forEach($scope.sampleRows, function (i) {
                            if (i.ID < 0) {
                                i.ID = sampleRes.NewMappedRecordsIDs[i.ID.toString()];

                            }
                        });
                        bodyReq.Groups = bodyReq.Groups.filter(group => group.ID !== generalGroup.ID);

                        angular.forEach(bodyReq.Groups, function (g, i) {
                            g.DisplayOrder = ++i;
                        });
                        LeaderMESservice.customAPI('SaveTestFields', bodyReq).then(function (res) {
                            if (isSample == 0) {

                                newMap = res.NewMappedRecordsIDs
                            }
                            if (res?.error) {
                                toastr.clear();
                                $scope.fetching = false;
                                toastr.error("", res?.error?.ErrorDescription);
                                return
                            }
                            else {
                                toastr.clear();
                                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY')); // Set timeOut to 0 to make it sticky});
                            }

                            if (rowToSave && (rowToSave.InputType == 33 || rowToSave.InputType == 44)) {
                                if (res.NewMappedRecordsIDs)
                                    newRowIdForCalc = res.NewMappedRecordsIDs[rowToSave.ID.toString()];

                                if (rowToSave.ID > 0) {
                                    newRowIdForCalc = rowToSave.ID;
                                }

                            }

                            angular.forEach($scope.rows, function (i) {

                                if (i.ID < 0) {
                                    i.ID = res.NewMappedRecordsIDs[i.ID.toString()];
                                }

                                if (i.GroupID < 0) {
                                    let newGroupID = res.NewMappedGroupsIDs[i.GroupID.toString()];
                                    i.GroupID = newGroupID ? newGroupID : i.GroupID
                                }
                            })

                            //update group ids in groupingTestFields . convert form negative to positive according to mapping from server
                            angular.forEach($scope.groupingTestFields, function (g) {

                                if (g.ID < 0) {
                                    let newGroupID = res.NewMappedGroupsIDs[g.ID.toString()];
                                    g.ID = newGroupID ? newGroupID : g.ID
                                }
                            });

                            //update groupsMap
                            $scope.updateGroupsMap();
                            if (fieldTypeName !== "editlist") {
                                $scope.noDataToSave = true;
                                $scope.noDataToSaveSample = true;
                            }

                            $scope.fetching = false;

                            $scope.rows = _.filter($scope.rows, function (row) {
                                return (row.UpsertType != 1);
                            });

                            $scope.sampleRows = _.filter($scope.sampleRows, function (row) {
                                return (row.UpsertType != 1);
                            });

                            // $scope.missingLocalName = _.map($scope.rows, function (row) {
                            //     return (!row.EName && !row.LName)
                            // });

                            if (rowToSave) {
                                $modal.open({
                                    templateUrl: 'views/common/calculatorPopup.html',
                                    resolve: {
                                        newRowIdForCalc: function () {
                                            return newRowIdForCalc
                                        },
                                        row: function () {
                                            return rowToSave
                                        }
                                    },
                                    controller: function ($scope, $modalInstance, toastr, $timeout, $filter, newRowIdForCalc, row) {

                                        $scope.invalidOperation = false;

                                        $scope.dragCB = function () {
                                            $timeout(function () {
                                                checkOperationValidity();
                                            }, 300);
                                        };

                                        const checkOperationValidity = function () {


                                            $scope.invalidOperation = false;
                                            $scope.unbalancedParenthesis = false;
                                            $scope.doubleOperators = false;
                                            $scope.opAtEdge = false;

                                            function isBalanced(subject) {
                                                const stack = [];
                                                const bracketConfig = [
                                                    { left: '(', right: ')' }
                                                ];

                                                const openingChars = [];
                                                const closingChars = [];

                                                bracketConfig.forEach((item) => {
                                                    openingChars.push(item.left);
                                                    closingChars.push(item.right);
                                                });

                                                for (let i = 0, len = subject.length; i < len; i++) {
                                                    const char = subject[i];
                                                    const openIdx = openingChars.indexOf(char);
                                                    const closeIdx = closingChars.indexOf(char);
                                                    if (openIdx > -1) {
                                                        stack.push(openIdx);
                                                    } else if (closeIdx > -1) {
                                                        if (stack.length === 0) return 0;
                                                        const lastIdx = stack.pop();
                                                        if (lastIdx !== closeIdx) return 0;
                                                    }
                                                }

                                                if (stack.length !== 0) return 0;
                                                return 1;
                                            }

                                            //check paranthesis
                                            let stringOperation = '';
                                            angular.forEach($scope.operation, function (op) {
                                                if (op) {
                                                    if (op.char) {
                                                        stringOperation += op.char
                                                    } else if (op.field) {
                                                        stringOperation += op.id
                                                    } else stringOperation += op.name
                                                }
                                            });

                                            if (!isBalanced((stringOperation))) {
                                                $scope.unbalancedParenthesis = true;
                                                return;
                                            }

                                            for (let i = 0; i < $scope.operation.length; i++) {
                                                delete $scope.operation[i].error;

                                                //if operator is in the beginning or at the end of the operation its an error.
                                                if (i == 0 || i == $scope.operation.length - 1) {
                                                    if ($scope.operation[i].hasOwnProperty('char') && ($scope.operation[i].char != "(" && $scope.operation[i].char != ")")) {
                                                        $scope.opAtEdge = true;
                                                        $scope.operation[i].error = true;
                                                        break;
                                                    }
                                                }

                                                // if field check if surrounded by operators
                                                if ($scope.operation[i].field) {
                                                    if (($scope.operation[i - 1] && !$scope.operation[i - 1].hasOwnProperty('char')) || ($scope.operation[i + 1] && !$scope.operation[i + 1].hasOwnProperty('char'))) {
                                                        $scope.invalidOperation = true;
                                                        $scope.operation[i].error = true;
                                                        break;
                                                    }
                                                } else {
                                                    //if not field then it must be an operator or a digit..

                                                    //if operator check if operation has two neighbor operators
                                                    if ($scope.operation[i].hasOwnProperty('char')) {
                                                        if (($scope.operation[i - 1] && $scope.operation[i - 1].hasOwnProperty('char')) || ($scope.operation[i + 1] && $scope.operation[i + 1].hasOwnProperty('char'))) {
                                                            if (($scope.operation[i].char != "(" && $scope.operation[i].char != ")") &&
                                                                ($scope.operation[i + 1] && $scope.operation[i + 1].char != "(" && $scope.operation[i + 1].char != ")") &&
                                                                ($scope.operation[i - 1] && $scope.operation[i - 1].char != "(" && $scope.operation[i - 1].char != ")")
                                                            ) {
                                                                $scope.doubleOperators = true;
                                                                $scope.operation[i].error = true;
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        //digit here..
                                                        //check if has a neighbor field! because digits can have only digits or operators next to them

                                                        //checking if operation has two neighbor fields
                                                        if (($scope.operation[i - 1] && $scope.operation[i - 1].field || ($scope.operation[i + 1] && $scope.operation[i + 1].field))) {
                                                            $scope.invalidOperation = true;
                                                            $scope.operation[i].error = true;
                                                            break;
                                                        }
                                                    }


                                                }
                                            }
                                        };

                                        /**
                                         * Get Test Details according to Test ID and open calc with relevant data
                                         */
                                        LeaderMESservice.customAPI(row.InputType == 66 ? 'GetTestSampleFieldDetails' : 'GetTestFieldDetails', {
                                            TestFieldID: newRowIdForCalc || row.ID
                                        }).then(function (res) {
                                            $scope.row = row;

                                            $scope.testData = res.ResponseList[0];
                                            $scope.responseDictionary = res.ResponseDictionaryDT;

                                            $scope.update = function () {
                                                checkOperationValidity();
                                            };

                                            $scope.updateStartDragIndex = function (idx) {
                                                $scope.operation.splice(idx, 1);
                                            };

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
                                            $scope.digits = [
                                                {
                                                    id: 0,
                                                    name: "0"
                                                },
                                                {
                                                    id: 1,
                                                    name: "1"
                                                },
                                                {
                                                    id: 2,
                                                    name: "2"
                                                },
                                                {
                                                    id: 3,
                                                    name: "3"
                                                },
                                                {
                                                    id: 4,
                                                    name: "4"
                                                },
                                                {
                                                    id: 5,
                                                    name: "5"
                                                },
                                                {
                                                    id: 6,
                                                    name: "6"
                                                },
                                                {
                                                    id: 7,
                                                    name: "7"
                                                },
                                                {
                                                    id: 8,
                                                    name: "8"
                                                },
                                                {
                                                    id: 9,
                                                    name: "9"
                                                }
                                            ];

                                            //to extend big numbers into small digits like 345 --> 3,4,5
                                            const extendedOperation = [];
                                            angular.forEach(res.CalcStrings, function (op) {
                                                const operatorFound = _.find($scope.operators, { char: op });
                                                const digitFound = _.find($scope.digits, { name: op });

                                                if (!operatorFound && !digitFound && op.charAt(0) != '[' && op.charAt(0) != '{') {
                                                    //if we reach here it means our Op is a big number bigger than 9

                                                    for (let i = 0; i < op.length; i++) {
                                                        extendedOperation.push(op[i])
                                                    }

                                                } else {
                                                    extendedOperation.push(op);
                                                }

                                            });

                                            $scope.operation = _.map(extendedOperation, function (op) {
                                                // check if op is an operator or a field
                                                const operatorFound = _.find($scope.operators, { char: op });
                                                const digitFound = _.find($scope.digits, { name: op });
                                                const fieldFound = _.find(res.ResponseDictionaryDT.CalcFields, { id: op });

                                                if (operatorFound) {
                                                    return operatorFound;
                                                }

                                                if (digitFound) {
                                                    return digitFound;
                                                }

                                                if (fieldFound)
                                                    return {
                                                        name: fieldFound.name,
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

                                                checkOperationValidity();
                                            };

                                            $scope.addArgument = function (arg, src, idx) {
                                                $scope.operation.push(arg);

                                                if (src == 'field') {
                                                    $scope.fields.splice(idx, 1);
                                                }

                                                checkOperationValidity();
                                            };

                                            $scope.close = function () {
                                                $modalInstance.close();
                                            };

                                            $scope.save = function () {
                                                const bodyReq = {
                                                    Field: $scope.testData
                                                };


                                                if ($scope.row.InputType == 33 || $scope.row.InputType == 66) {
                                                    let operation = '';

                                                    angular.forEach($scope.operation, function (op) {
                                                        if (op.char) {
                                                            operation += op.char
                                                        } else if (op.field) {
                                                            operation += op.id
                                                        } else operation += op.name
                                                    });

                                                    bodyReq.Field.CalcString = operation;
                                                }

                                                LeaderMESservice.customAPI(row.InputType == 66 ? 'SaveTestSampleFieldDetails' : 'SaveTestFieldDetails', bodyReq).then(function (res) {
                                                    if (res?.error) {
                                                        toastr.clear();
                                                        toastr.error("", res?.error?.ErrorDescription);
                                                        return
                                                    }
                                                    toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                                    $modalInstance.close();
                                                }, function (res) {
                                                    toastr.error("", $filter('translate')('SOMETHING_WENT_WRONG'));

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
                            } else {
                                if (_.isNumber(isSample)) {
                                    var findObj = _.find(newMap, { Key: row.ID + "" })
                                    if (findObj) {
                                        row.ID = +findObj.Value
                                    }
                                }

                                $scope.fetchData(null, null, null, row, isSample);

                            }

                            if (finished) {
                                $scope.assignCurrentStep('qc-tests');
                            }

                        });
                    });
                } else {
                    if (fieldTypeName !== "editlist") {
                        $scope.noDataToSave = true;
                        $scope.noDataToSaveSample = true;
                    }

                    $scope.fetching = false;
                    toastr.clear();
                    toastr.error("", $filter('translate')('FILL_EDIT_LIST'));
                }
            }, 3000);

        };
        $timeout(function () {
            $('[data-toggle="popover"]').popover();
        }, 500);

        qcTestEditCtrl.getNewRow = function (paramType) {
            return {
                //ensuring random negative ID for new rows
                "ID": Math.floor(Math.random() * 1001) - (Math.floor(Math.random() * 5000) + 5000),
                "SubType": $scope.currentTest.id,
                "LName": "",
                "EName": "",
                "DisplayOrder": $scope.rows.length,
                "FieldType": "num",
                "InputType": paramType == 'test-fields' ? 0 : 2,
                "InputField": 0,
                "PropertyID": 0,
                "AllowNull": true,
                "LValue": null,
                "HValue": null,
                "UpsertType": 2 // 2 for INSERT
            }
        };

        $scope.addRow = function (rows, paramType, listId, groupID) {
            if (paramType != 'test-fields') {
                rows.push(qcTestEditCtrl.getNewRow(paramType));
            } else {
                let newRow = { GroupID: groupID, ...qcTestEditCtrl.getNewRow(paramType) };
                $scope.groupsMap[groupID].push(newRow);
                $scope.testFields.push(newRow)
            }
            //     $scope.missingLocalName[rows[rows.length - 1].ID] = true;

            $timeout(() => {
                var objDiv = document.getElementById(listId);
                objDiv.scrollTo({ top: objDiv.scrollHeight, behavior: 'smooth' });
            }, 300);
        };

        $scope.removeRow = function (id, idx, rows) {
            // console.log($scope.groupsMap);
            if (id < 0) {
                let gruopID = rows[idx].GroupID;
                rows.splice(idx, 1);
                if (gruopID) {
                    $scope.testFields = $scope.testFields.filter(item => item.ID !== id);
                }
                return;
            }

            const foundRow = _.find(rows, { ID: id });
            if (foundRow) {
                foundRow.UpsertType = 1;
            }
        };

        $scope.removeGroup = (group) => {

            if (group.ID < 0) {
                var index = _.findIndex($scope.groupingTestFields, { ID: group.ID });
                if (index >= 0) {
                    const GroupMapLength = $scope.groupsMap[group.ID].length;
                    $scope.groupsMap[group.ID].splice(0, GroupMapLength);
                    $scope.groupingTestFields.splice(index, 1);
                    $scope.testFields = $scope.testFields.filter(it => it.GroupID !== group.ID);
                }
            } else {
                group.UpsertType = 1;
                $scope.testFields.filter(it => it.GroupID === group.ID).map(it => {
                    it.UpsertType = 1;
                    return it
                })
            }
            $scope.noDataToSave = false;
            $scope.noDataToSaveSample = false;
        };

        $scope.assignCurrentStep = function (step, test) {
            $scope.step = step;
            $scope.currentTest = test;
        };

        $scope.shouldShowOptionForTestFields = function (option) {
            //only Job Recipe and Product Recipe
            return !(option.id == 2 || option.id == 6)
        };

        $scope.shouldShowOptionForParamFields = function (option) {
            return ((option.id == 2 || option.id == 6))
        };

        // $scope.$watch('testFields', function (newVal, oldVal) {
        //     $scope.detectDataChanging(newVal);
        // }, true, true);

        $scope.$watch('groupsMap', function (newVal, oldVal) {
            if (angular.equals(newVal, $scope.originalGroupMap)) {
                $scope.noDataToSave = true;
            } else {
                $scope.noDataToSave = false;
            }
        }, true, true);

        $scope.$watch('paramFields', function (newVal, oldVal) {
            $scope.detectDataChanging(newVal);
        }, true, true);

        $scope.detectDataChanging = function (newVal) {
            let toCompare10 = [];
            if (newVal) {
                toCompare10 = $scope.testFields.concat($scope.paramFields)
            } else {
                return
            }
            if (angular.equals(toCompare10, upperScope.originalState)) {
                upperScope.noDataToSave = true;
            } else {
                upperScope.noDataToSave = false;
            }
        }


        // $scope.$watch('rows', function (newVal, oldVal) {
        //     if (newVal) {
        //         if (angular.equals(newVal, upperScope.originalState)) {
        //             upperScope.noDataToSave = true;
        //         } else {
        //             upperScope.noDataToSave = false;
        //         }
        //     }
        // }, true, true);

        $scope.$watch('sampleRows', function (newVal, oldVal) {
            if (newVal) {
                if (angular.equals(newVal, upperScope.originalStateSamples)) {
                    // upperScope.noDataToSaveSample = true;
                } else {
                    upperScope.noDataToSaveSample = false;
                }
            }
        }, true, true);

        $scope.getDataParamOptions = function (source) {
            const found = _.find($scope.dataParamOptions, { ID: source });
            return found ? found.InputTypeFields : [];
        };

        $scope.emptyGroups = [];

        $scope.updateRows = function (firstLoad) {
            $scope.testFields = [];
            $scope.paramFields = [];

            let paramFieldsCounter = 1;
            let testFieldsCounter = 1;

            angular.forEach($scope.rows, function (row) {
                if (!(row.InputType == 2 || row.InputType == 6)) {
                    if (firstLoad) {
                        //divide display order for both sections
                        row.DisplayOrder = testFieldsCounter++;
                    }
                    $scope.testFields.push(row);
                } else {
                    if (firstLoad) {
                        //divide display order for both sections
                        row.DisplayOrder = paramFieldsCounter++
                    }
                    $scope.paramFields.push(row);
                }
            });
        };

        const checkEmptyGroups = function (groups) {
            angular.forEach(groups, function (group) {

                let empty = true;

                angular.forEach($scope.rows, function (row) {
                    if (row.GroupID === group.ID) {
                        empty = false;
                    }
                });
                empty ? $scope.emptyGroups.push(group.ID) : '';
            })
        };

        $scope.updateGroupIDs = function () {
            angular.forEach($scope.groupsMap, (group, i) => {
                angular.forEach(group, (gItem) => {
                    gItem.GroupID = i;
                })
            })
        };

        $scope.makeSureGroupsAreNotEmtpy = function () {

            const paramType = 'test-fields';

            angular.forEach($scope.groupsMap, (group, i) => {

                let newRow = { GroupID: i, ...qcTestEditCtrl.getNewRow(paramType) };
                if (upperScope.groupsMap[i].length != 0 && !upperScope.groupsMap[i].length) {
                    upperScope.groupsMap[i].push(newRow);
                    $scope.testFields.push(newRow)
                }

            })
        };

        $scope.updateGroupsMap = function () {

            $scope.groupsMap = {};
            // init groupsMap with []
            // set upsertType 3 as update
            angular.forEach($scope.groupingTestFields, function (group) {

                $scope.groupsMap[group.ID] = [];

                group.UpsertType = 3;
                group.SubType = $scope.currentTest.id;
            });

            angular.forEach($scope.rows, function (row) {


                if (row.UpsertType !== 1) {
                    row.UpsertType = 3;
                }
                if (!(row.InputType === 2 || row.InputType === 6)) {
                    if ($scope.groupsMap.hasOwnProperty(row.GroupID)) {

                        if (row.UpsertType !== 1) {
                            $scope.groupsMap[row.GroupID].push(row);
                        }

                    } else {
                        if (!$scope.groupsMap.hasOwnProperty(generalGroup.ID)) {
                            $scope.groupingTestFields.push(generalGroup);
                            $scope.groupsMap[generalGroup.ID] = [];
                        }
                        row.GroupID = generalGroup.ID;
                        $scope.groupsMap[generalGroup.ID].push(row);
                    }
                }
            });
            console.log($scope.groupsMap)

        };

        $scope.fetchData = function (openCalc, newRowIdForCalc, row, rowTemp, isSample) {

            $scope.fetching = true;



            LeaderMESservice.customAPI('GetTestSampleFields', { "TestDefID": $scope.currentTest.id }).then(function (samplesResponse) {
                $scope.sampleRows = samplesResponse.ResponseList || [];
                console.log("getRows", $scope.sampleRows)
                let counter = 1;
                angular.forEach($scope.sampleRows, function (row) {
                    row.DisplayOrder = counter++;
                });

                $scope.originalStateSamples = angular.copy($scope.sampleRows);


                LeaderMESservice.customAPI('GetTestFields', { "TestDefID": $scope.currentTest.id })
                    .then(function (res) {
                        $scope.currentTest.hasSamples = res.HasSamples;
                        $scope.fetching = false;
                        $scope.rows = res.ResponseList || [];
                        $scope.groupingTestFields = res.ResponseDictionaryDT["TestFieldsGroups"] || [];

                        $scope.updateGroupsMap();
                        $scope.originalGroupMap = angular.copy($scope.groupsMap)
                        $scope.sortableOptions = {
                            connectWith: ".grouping-test-table",
                            stop: function (event, ui) {
                                if (ui.item.sortable.received) {
                                    upperScope.updateGroupIDs();
                                    upperScope.makeSureGroupsAreNotEmtpy();
                                }
                            }
                        };

                        checkEmptyGroups($scope.groupingTestFields);

                        $scope.makeSureGroupsAreNotEmtpy();

                        /**
                         * Data Source options and dictionary
                         */
                        $scope.dataSourceOptions = res.ResponseDictionaryDT.InputTypes;
                        $scope.dataSourceOptions.unshift({
                            id: 0,
                            name: $filter('translate')("MANUAL_INPUT")
                        });
                        $scope.dataSourceOptionsDict = {};
                        angular.forEach($scope.dataSourceOptions, function (option) {
                            $scope.dataSourceOptionsDict[option.id] = option.name;
                        });

                        /**
                         * Samples Data Source options and dictionary
                         */
                        $scope.dataSourceOptionsForSamples = samplesResponse.ResponseDataTable[0];
                        $scope.dataSourceOptionsForSamples.unshift({
                            id: 0,
                            name: $filter('translate')("MANUAL_INPUT")
                        });
                        $scope.sampleDataSourceOptionsDict = {};
                        angular.forEach($scope.dataSourceOptionsForSamples, function (option) {
                            $scope.sampleDataSourceOptionsDict[option.id] = option.name;
                        });

                        /**
                         * Compare to options and Dictionary
                         */
                        if (res.ResponseDictionaryDT.Properties) {
                            $scope.compareToOptions = res.ResponseDictionaryDT.Properties;
                            $scope.compareToOptions.unshift({
                                id: 0,
                                name: $filter('translate')("NONE")
                            });
                            $scope.compareToOptionsDict = {};

                            angular.forEach($scope.compareToOptions, function (option) {
                                $scope.compareToOptionsDict[option.id] = option.name;
                            });
                        }


                        /**
                         * Data parameter options and dictionary
                         */
                        $scope.dataParamOptions = res.InputTypes;
                        $scope.dataParamOptionsDict = {};
                        angular.forEach($scope.dataParamOptions, function (option) {
                            $scope.dataParamOptionsDict[option.id] = option.name;
                        });

                        $scope.fieldTypeOptions = res.ResponseDictionaryDT.FieldTypes;
                        $scope.fieldTypeOptionsForSamples = samplesResponse.ResponseDataTable[1];

                        //backward compatibility for default values for fieldtype == 'boolean'
                        angular.forEach($scope.rows, function (row) {
                            row.UpsertType = 3;

                            if (row.FieldType == 'Boolean') {
                                //default only for boolean field type
                                row.InputType = 0;
                                row.LValue = 1;
                                row.HValue = 1;
                                row.AllowNull = true;
                            }
                        });

                        angular.forEach($scope.rows, function (row) {
                            row.DisplayOrder = counter++;
                        });
                        $scope.updateRows(true);
                        $scope.originalState = angular.copy($scope.rows);

                        $timeout(function () {
                            $('[data-toggle="tooltip"]').tooltip();
                        }, 500);

                        if (openCalc) {
                            $modal.open({
                                templateUrl: 'views/common/calculatorPopup.html',
                                resolve: {
                                    newRowIdForCalc: function () {
                                        return newRowIdForCalc
                                    },
                                    row: function () {
                                        return row
                                    }
                                },
                                controller: function ($scope, $modalInstance, toastr, $timeout, $filter, newRowIdForCalc, row) {
                                    //clear previous toastr messages on top of the window
                                    toastr.clear();

                                    $scope.invalidOperation = false;

                                    const checkOperationValidity = function () {
                                        $scope.invalidOperation = false;
                                        $scope.unbalancedParenthesis = false;
                                        $scope.doubleOperators = false;
                                        $scope.opAtEdge = false;

                                        function isBalanced(subject) {
                                            const stack = [];
                                            const bracketConfig = [
                                                { left: '(', right: ')' }
                                            ];

                                            const openingChars = [];
                                            const closingChars = [];

                                            bracketConfig.forEach((item) => {
                                                openingChars.push(item.left);
                                                closingChars.push(item.right);
                                            });

                                            for (let i = 0, len = subject.length; i < len; i++) {
                                                const char = subject[i];
                                                const openIdx = openingChars.indexOf(char);
                                                const closeIdx = closingChars.indexOf(char);
                                                if (openIdx > -1) {
                                                    stack.push(openIdx);
                                                } else if (closeIdx > -1) {
                                                    if (stack.length === 0) return 0;
                                                    const lastIdx = stack.pop();
                                                    if (lastIdx !== closeIdx) return 0;
                                                }
                                            }

                                            if (stack.length !== 0) return 0;
                                            return 1;
                                        }

                                        //check paranthesis
                                        let stringOperation = '';
                                        angular.forEach($scope.operation, function (op) {
                                            if (op) {
                                                if (op.char) {
                                                    stringOperation += op.char
                                                } else if (op.field) {
                                                    stringOperation += op.id
                                                } else stringOperation += op.name
                                            }
                                        });

                                        if (!isBalanced((stringOperation))) {
                                            $scope.unbalancedParenthesis = true;
                                            return;
                                        }

                                        for (let i = 0; i < $scope.operation.length; i++) {
                                            $scope.operation[i].error = false;

                                            //if operator is in the beginning or at the end of the operation its an error.
                                            if (i == 0 || i == $scope.operation.length - 1) {
                                                if ($scope.operation[i].hasOwnProperty('char') && ($scope.operation[i].char != "(" && $scope.operation[i].char != ")")) {
                                                    $scope.opAtEdge = true;
                                                    $scope.operation[i].error = true;
                                                    break;
                                                }
                                            }

                                            // if field check if surrounded by operators
                                            if ($scope.operation[i].field) {
                                                if (($scope.operation[i - 1] && !$scope.operation[i - 1].hasOwnProperty('char')) || ($scope.operation[i + 1] && !$scope.operation[i + 1].hasOwnProperty('char'))) {
                                                    $scope.invalidOperation = true;
                                                    $scope.operation[i].error = true;
                                                    break;
                                                }
                                            } else {
                                                //if not field then it must be an operator or a digit..

                                                //if operator check if operation has two neighbor operators
                                                if ($scope.operation[i].hasOwnProperty('char')) {
                                                    if (($scope.operation[i - 1] && $scope.operation[i - 1].hasOwnProperty('char')) || ($scope.operation[i + 1] && $scope.operation[i + 1].hasOwnProperty('char'))) {
                                                        if (($scope.operation[i].char != "(" && $scope.operation[i].char != ")") &&
                                                            ($scope.operation[i + 1] && $scope.operation[i + 1].char != "(" && $scope.operation[i + 1].char != ")") &&
                                                            ($scope.operation[i - 1] && $scope.operation[i - 1].char != "(" && $scope.operation[i - 1].char != ")")
                                                        ) {
                                                            $scope.doubleOperators = true;
                                                            $scope.operation[i].error = true;
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    //digit here..
                                                    //check if has a neighbor field! because digits can have only digits or operators next to them

                                                    //checking if operation has two neighbor fields
                                                    if (($scope.operation[i - 1] && $scope.operation[i - 1].field || ($scope.operation[i + 1] && $scope.operation[i + 1].field))) {
                                                        $scope.invalidOperation = true;
                                                        $scope.operation[i].error = true;
                                                        break;
                                                    }
                                                }


                                            }
                                        }
                                    };


                                    /**
                                     * Get Test Details according to Test ID and open calc with relevant data
                                     */
                                    LeaderMESservice.customAPI(row.InputType == 66 ? 'GetTestSampleFieldDetails' : 'GetTestFieldDetails', {
                                        TestFieldID: newRowIdForCalc || row.ID
                                    }).then(function (res) {
                                        $scope.row = row;

                                        $scope.testData = res.ResponseList[0];
                                        $scope.responseDictionary = res.ResponseDictionaryDT;
                                        $scope.update = function () {
                                            checkOperationValidity();
                                        };

                                        $scope.updateStartDragIndex = function (idx) {
                                            $scope.operation.splice(idx, 1);
                                        };

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
                                        $scope.digits = [
                                            {
                                                id: 0,
                                                name: "0"
                                            },
                                            {
                                                id: 1,
                                                name: "1"
                                            },
                                            {
                                                id: 2,
                                                name: "2"
                                            },
                                            {
                                                id: 3,
                                                name: "3"
                                            },
                                            {
                                                id: 4,
                                                name: "4"
                                            },
                                            {
                                                id: 5,
                                                name: "5"
                                            },
                                            {
                                                id: 6,
                                                name: "6"
                                            },
                                            {
                                                id: 7,
                                                name: "7"
                                            },
                                            {
                                                id: 8,
                                                name: "8"
                                            },
                                            {
                                                id: 9,
                                                name: "9"
                                            }
                                        ];

                                        //to extend big numbers into small digits like 345 --> 3,4,5
                                        const extendedOperation = [];
                                        angular.forEach(res.CalcStrings, function (op) {
                                            const operatorFound = _.find($scope.operators, { char: op });
                                            const digitFound = _.find($scope.digits, { name: op });

                                            if (!operatorFound && !digitFound && op.charAt(0) != '[' && op.charAt(0) != '{') {
                                                //if we reach here it means our Op is a big number bigger than 9

                                                for (let i = 0; i < op.length; i++) {
                                                    extendedOperation.push(op[i])
                                                }

                                            } else {
                                                extendedOperation.push(op);
                                            }

                                        });

                                        $scope.operation = _.map(extendedOperation, function (op) {
                                            // check if op is an operator or a field
                                            const operatorFound = _.find($scope.operators, { char: op });
                                            const digitFound = _.find($scope.digits, { name: op });
                                            const fieldFound = _.find(res.ResponseDictionaryDT.CalcFields, { id: op });

                                            if (operatorFound) {
                                                return operatorFound;
                                            }

                                            if (digitFound) {
                                                return digitFound;
                                            }

                                            if (fieldFound)
                                                return {
                                                    name: fieldFound.name,
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

                                            checkOperationValidity();
                                        };

                                        $scope.addArgument = function (arg, src, idx) {
                                            $scope.operation.push(arg);

                                            if (src == 'field') {
                                                $scope.fields.splice(idx, 1);
                                            }

                                            checkOperationValidity();
                                        };

                                        $scope.close = function () {
                                            $modalInstance.close();
                                        };

                                        $scope.save = function () {
                                            const bodyReq = {
                                                Field: $scope.testData
                                            };


                                            if ($scope.row.InputType == 33 || $scope.row.InputType == 66) {
                                                let operation = '';

                                                angular.forEach($scope.operation, function (op) {
                                                    if (op.char) {
                                                        operation += op.char
                                                    } else if (op.field) {
                                                        operation += op.id
                                                    } else operation += op.name
                                                });

                                                bodyReq.Field.CalcString = operation;
                                            }

                                            LeaderMESservice.customAPI(row.InputType == 66 ? 'SaveTestSampleFieldDetails' : 'SaveTestFieldDetails', bodyReq).then(function (res) {
                                                toastr.success("", $filter('translate')('SAVED_SUCCESSFULLY'));
                                                $modalInstance.close();
                                            }, function (res) {
                                                toastr.error("", $filter('translate')('SOMETHING_WENT_WRONG'));

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
                        }

                        if (_.isNumber(isSample)) {
                            if (isSample == 1) {
                                var url = $state.href("appObjectFullView", { ID: rowTemp.ID, appObjectName: 'TestSampleListsDefinition' });
                            }
                            else {
                                var url = $state.href("appObjectFullView", { ID: rowTemp.ID, appObjectName: 'TestFieldListsDefinition' });
                            }
                            // url = `${url}?fieldID=${rowTemp.ID}&IsSample=${isSample}`;
                            window.open(url, "_blank");
                        }

                    }, function (err) {
                        $scope.fetching = false;
                        //take user one step back if an error occured
                        $scope.assignCurrentStep('add-qc-tests', $scope.currentTest);
                    })

            });
        };
        $scope.fetchData();
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
                // if(step == "add-qc-tests")
                // {
                //     scope.$emit("add-qc-tests",test);
                // }
            }
        },
        controller: controller,
        controllerAs: "qcTestEditCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('qcTestEdit', qcTestEdit);
