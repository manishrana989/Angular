var customTableDirective = () => {

    var Template = "js/components/customTable/customTable.html";

    function controller($scope, $state, $timeout, $filter, AuthService, LeaderMESservice) {
        var customTableDirectiveCtrl = this;
        $scope.localColumns = [];
        customTableDirectiveCtrl.rtl = LeaderMESservice.isLanguageRTL();

        $scope.localColumns = angular.copy($scope.columns);
        $scope.dataTable = angular.copy($scope.data);
        $scope.height = 37 + 30 + ($scope.dataTable.length) * 50;
        customTableDirectiveCtrl.gridOpts = {
            enablePinning: false,
            saveWidths: true,
            enableSorting: true,
            enableColumnResizing: false,
            enableColumnMenus: false,
            enableFiltering: false,
            showColumnFooter: true,
            showGridFooter: false,
            columnDefs: $scope.localColumns,
            showClearAllFilters: false,
            enableGridMenu: false,
            data: $scope.dataTable,
            enableRowSelection: false,
            enableSelectAll: false,
            exporterMenuPdf: true,
            exporterMenuCsv: false,
            multiSelect: true,
            exporterExcelFilename: "Sheet" + ".xlsx",
            exporterExcelSheetName: "Sheet",
            exporterCsvFilename: "Sheet" + ".csv",
            exporterPdfDefaultStyle: {
                fontSize: 7
            },
            exporterPdfTableStyle: {
                margin: [0, 0, 0, 0],
            },
            exporterPdfTableHeaderStyle: {
                fontSize: 8,
                bold: true,
                italics: true,
                color: "blue",
            },
            exporterPdfHeader: {
                text: "Sheet",
                style: "headerStyle",
                alignment: $scope.rtl === "rtl" ? "right" : "left",
                margin: [30, 10, 30, 2],
            },

            exporterPdfOrientation: "landscape",
            exporterPdfPageSize: "LETTER",
            exporterPdfMaxGridWidth: 580,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        };


    }
    return {
        restrict: "EA",
        templateUrl: Template,
        controller: controller,
        controllerAs: "customTableDirectiveCtrl",
        scope: {
            data: '=',
            columns: '=',
            title: '=',
        }
    }
}

angular.module('LeaderMESfe').directive('customTableDirective', customTableDirective);