var simpleTableDirective = function ($filter, $state, $localStorage) {
    link = function (scope, element, attrs) {
        let PORTRAIT_COLUMNS = 5;
        let LANDSCAPE_COLUMNS = 9;
        let SKIP_SUBGROUP_NAME = 1;
        let SKIP_MACHINES_ARRAY = -1;
        let PRINTABLE_SIZES = [PORTRAIT_COLUMNS, LANDSCAPE_COLUMNS];

        if ($localStorage.machinePerformanceArrowState)
            scope.isArrowOpen = $localStorage.machinePerformanceArrowState;
        else
            scope.isArrowOpen = false;


        scope.simpleTable = {};
        scope.$on("makeExportableTable", function () {
            if (!scope.data) {
                console.log("simple-table-directive line 58 error");
                return;
            }
        });

        scope.simpleTable.createPrintableTables = function () {
            scope.simpleTable.printableTables = {
                portrait: [],
                landscape: []
            };
            let totalColumns = scope.machineNames.length;
            for (let i = 0; i < PRINTABLE_SIZES.length; i++) {
                for (let j = 0; j < Math.ceil(totalColumns / PRINTABLE_SIZES[i]); j++) {
                    if (PRINTABLE_SIZES[i] == PORTRAIT_COLUMNS) {
                        scope.simpleTable.pushSimpleTablehData(scope.simpleTable.printableTables.portrait, angular.copy(scope.data));
                    } else if (PRINTABLE_SIZES[i] == LANDSCAPE_COLUMNS) {
                        scope.simpleTable.pushSimpleTablehData(scope.simpleTable.printableTables.landscape, angular.copy(scope.data));
                    }
                }
            }
        };

        scope.simpleTable.pushSimpleTablehData = function (destArray, src) {
            src.push({
                machineNames: []
            });
            destArray.push(src);
        };

        scope.simpleTable.fillPrintableTables = function (tableSet, tableSize) {
            for (let i = 0; i < tableSet.length; i++) {
                let table = tableSet[i];
                let beginning = i * tableSize + SKIP_SUBGROUP_NAME;
                let end = beginning + tableSize;
                for (j = 0; j < table.length + SKIP_MACHINES_ARRAY; j++) {
                    let group = table[j];
                    for (let k = 0; k < group.data.length; k++) {
                        let subGroupData = group.data[k];
                        let subGroupName = subGroupData[0];
                        table[j].data[k] = subGroupData.slice(beginning, end);
                        table[j].data[k].unshift(subGroupName);
                    }
                    table[j].subGroupsSum = table[j].subGroupsSum.slice(beginning + SKIP_MACHINES_ARRAY, end + SKIP_MACHINES_ARRAY);
                }
                table[table.length - 1].machineNames = scope.machineNames.slice(beginning + SKIP_MACHINES_ARRAY, end + SKIP_MACHINES_ARRAY);
            }
        };

        scope.simpleTable.displayPrintableTables = function () {
            if (scope.simpleTable.printableTablesShow) {
                return true;
            }
            return false;
        };

        scope.simpleTable.displayMainTable = function () { //display all table with headers Karma
            if (scope.simpleTable.printableTablesShow) {
                return false;
            }
            return true;
        };

        scope.changeArrowState = function (isFirstTime) {

            if (!isFirstTime)
                scope.isArrowOpen = scope.toggleArrow();
            if( !scope.eventY)
                return;
            scope.eventY.forEach(group => {
                if (!group.showJosh) {
                    return;
                }
                if (scope.isArrowOpen && !group.showJosh()) {
                    group.func();
                } else if (!scope.isArrowOpen && group.showJosh()) {
                    group.func();
                }
            });
        };

        scope.changeArrowState(true);

        scope.simpleTable.displayCompareInCell = function () {
            if (scope.tableName === $filter("translate")("TIMES")) {
                return true;
            }
            return false;
        };

        scope.clickLink = function (group) {
            let url;
            if (group.jobID) {
                url = $state.href("appObjectFullView", {
                    appObjectName: "Job",
                    ID: group.jobID,
                });
            } else {
                url = $state.href("appObjectMachineFullView", {
                    appObjectName: "MachineScreenEditor",
                    ID: group.machineId,
                });
            }

            window.open(url, "_blank");
        }


        scope.$on("restoreTable", function () {
            scope.simpleTable.printableTablesShow = false;
        });

        let instantiateArrayToZero = function (length) {
            if (typeof length != "number" || length < 1) {
                return -1;
            }
            let array = Array(length);
            for (let i = 0; i < array.length; i++) {
                array[i] = 0;
            }
            return array;
        };

        scope.dynamicFilter = function (rawData, filterName) {
            let filteredData = filter(filterName)(rawData);
            return filteredData;
        };

        scope.scrollCallback = function (scrollTop, scrollLeft) {
            $(element)
                .find(".left-container")
                .scrollTop(scrollTop);
            $(element)
                .find(".fixed-first-row")
                .scrollLeft(scrollLeft);
        };
    };

    return {
        restrict: "EA",
        templateUrl: "views/common/simpleTable.html",
        scope: {
            machineNames: "=",
            eventY: "=",
            data: "=",
            refData: "=",
            tableName: "=",
            graph: "=",
            toggleArrow: "=",
        },
        link: link
    };
};

angular.module("LeaderMESfe").directive("simpleTableDirective", simpleTableDirective);