function dynamicUIGridGrouping() {

    var template = 'js/components/dynamicUIGridGrouping/dynamicUIGridGrouping.html';

    var controller = function ($scope, LeaderMESservice, shiftService) {
        var cols = [];
        $scope.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';
        $scope.gridOptions = _.merge({}, shiftService.gridDefault);
        $scope.gridOptions.showColumnFooter = true;

        //prepare columns according to gridTable rows sent to directive
        angular.forEach($scope.gridTable, function (gridRow, v) {
            angular.forEach(gridRow, function (val, key) {
                if (key !== $scope.groupBy && !_.find(cols, { name: key })) {
                    cols.push({ name: key })
                }

            })
        })

        cols.push(
            {
                name: $scope.groupBy,
                grouping: { groupPriority: 1 },
                sort: { priority: 1, direction: 'asc' },
                width: '20%'
            }
        )
        $scope.gridOptions.columnDefs = cols;
        $scope.gridOptions.data = $scope.gridTable;
    };

    return {
        restrict: "E",
        templateUrl: template,
        scope: {
            gridTable: "=",
            groupBy: "="
        },
        controller: controller,
        controllerAs: "dynamicUIGridGroupingCtrl"
    };
}

angular
    .module('LeaderMESfe')
    .directive('dynamicUiGridGrouping', dynamicUIGridGrouping);