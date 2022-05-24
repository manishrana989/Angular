function machineMaterials() {
    const template = "js/components/machineMaterials/machineMaterials.html";

    const controller = function ($modal, $scope, LeaderMESservice, $filter, uiGridConstants) {
        const machineMaterialsCtrl = this;
        machineMaterialsCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        console.log($scope.id);

        $scope.rows = [];

        $scope.columns = [];
        machineMaterialsCtrl.loading = true;
        LeaderMESservice.customAPI("GetMachineMainChannelsParametersData", {
            machineID: $scope.id
        }).then(function (response) {
            response.Chanels[0].Split[0].forEach(s => {
                $scope.columns.push(machineMaterialsCtrl.localLanguage ? s.LName : s.EName)
            })
            const tables = [];
            if (response.Chanels){
                response.Chanels.forEach(table => {
                    if (table.Split){
                        let columns = [];
                        const rows = [];
                        table.Split.forEach(origRow => {
                            if (origRow && origRow.length > 0){
                                if (columns.length === 0){
                                    columns = _.map(origRow,cell => {
                                        return {                    
                                            name: cell.FieldName,
                                            displayName: machineMaterialsCtrl.localLanguage ? cell.LName : cell.EName,
                                            aggregationType: cell.isSum ?  uiGridConstants.aggregationTypes.sum : undefined,
                                        }
                                    });
                                    columns.unshift({                    
                                        name: 'SplitNumber',
                                        displayName: $filter('translate')('SPLIT_NUMBER'),
                                    })
                                }
                                const row = {};
                                origRow.forEach(cell => {
                                    row[cell.FieldName] =  cell.Value;
                                    row['SplitNumber'] = cell.SplitNumber;
                                });
                                rows.push(row);
                            }
                        });
                        tables.push({
                            channel: table.Cahnnel,
                            channelPC: table.CahnnelPC,
                            columns: columns,
                            rows: rows,
                        })   
                    }
                });
                console.log(tables);           
                machineMaterialsCtrl.tables =  tables;
            }
            machineMaterialsCtrl.loading = false;
        });
        console.log("$scope.columns = " + $scope.columns)
    };

    return {
        restrict: "EA",
        templateUrl: template,
        scope: {
            id: "=",
        },
        controller: controller,
        controllerAs: "machineMaterialsCtrl",
    };
}

angular.module("LeaderMESfe").directive("machineMaterials", machineMaterials);