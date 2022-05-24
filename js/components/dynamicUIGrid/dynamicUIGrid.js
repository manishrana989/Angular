function dynamicUIGrid() {

    var template = 'js/components/dynamicUIGrid/dynamicUIGrid.html';

    var controller = function ($scope, uiGridConstants, $filter, shiftService) {

        $scope.gridOptions = _.merge({}, {});
        var cols = [];
        if (!$scope.gridTable) {
            //dummmy data
            $scope.gridTable = [
                {
                    status: "stopped",
                    Arburg1: 12,
                    Arburg2: 33
                },
                {
                    status: "working",
                    Arburg1: 1,
                    AssafQA: 38,
                    Arburg4: 6
                },
                {
                    status: "Idle",
                    JoeMachine: 66,
                    Arburg3: 19
                }
            ];
        }
        console.log($scope.gridTable);
        console.log(cols);
        //prepare columns according to gridTable rows sent to directive
        angular.forEach($scope.gridTable, function (gridRow, v) {
            angular.forEach(gridRow, function (val, key) {
                if (!_.find(cols, { name: key })) {
                    if (key !== '$$hashKey'){
                        cols.push({ name: key })
                    }
                }

            })
        })

        $scope.gridOptions.columnDefs = cols;
        $scope.gridOptions.data = $scope.gridTable;

    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            gridTable: "="
        },
        controller: controller,
        controllerAs: "dynamicUIGridCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('dynamicUiGrid', dynamicUIGrid);