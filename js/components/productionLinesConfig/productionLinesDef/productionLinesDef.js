function productionLinesDef() {
    const template = "js/components/productionLinesConfig/productionLinesDef/productionLinesDef.html";

    const controller = function ($modal, $scope, LeaderMESservice, $filter, $state, $timeout, BreadCrumbsService) {
        const productionLinesDefCtrl = this;
        productionLinesDefCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
        $scope.curruntLanguage = LeaderMESservice.getLanguage();
        $scope.rtl = LeaderMESservice.isLanguageRTL();
        $scope.direction =  $scope.rtl ?"rtl":"ltr";

        // $scope.gridId = "productionLinesGrid" + (Math.random()*(9999));
        productionLinesDefCtrl.showBreadCrumb = true;
        if ($state.current.name == "customFullView") {
            productionLinesDefCtrl.showBreadCrumb = false;
        }

        if (!$state.params.menuContent) {
            $scope.stateParams = LeaderMESservice.getStateParams();
        } else {
            $scope.stateParams = $state.params.menuContent;
        }
        if (productionLinesDefCtrl.showBreadCrumb) {
            BreadCrumbsService.init();
            if ($scope.rtl ) {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuLName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuLName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuLName;
            } else {
                BreadCrumbsService.push($scope.stateParams.topMenu.TopMenuEName, 0);
                BreadCrumbsService.push($scope.stateParams.subMenu.SubMenuEName, 0);
                $scope.topPageTitle = $scope.stateParams.subMenu.SubMenuEName;
            }
        }



        $scope.checkBoxTemplate = '<div style="pointer-events: none" class="full-height ui-grid-cell-contents" check-box-directive field="row.entity" select-value="\'IsActive\'"></div>';
        $scope.indexTempalte = '<div style="width: 100%;height: 100%" ng-click="grid.appScope.assignCurrentStep(\'new-production-line\', row.entity,false)"><div class="full-height ui-grid-cell-contents"><a>{{row.entity.ID}}</a></div></div>';
        $scope.gridOptions = {
            enableFiltering: true,
            showColumnFooter: true,
            showGridFooter: true,
            fastWatch: true,
            columnDefs: [
                {
                    name: "ID",
                    width: "15%",
                    headerCellClass: "pull-left",
                    extraStyle: "padding=10px",
                    cellTemplate: $scope.indexTempalte,
                    cellClass: "production-table-item",
                    displayName: $filter("translate")("INDEX")
                },
                {
                    name: productionLinesDefCtrl.localLanguage ? "LName" : "EName",
                    width: "20%",
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                    displayName: $filter("translate")("NAME")
                },
                {
                    name: "Description",
                    width: "25%",
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                    displayName: $filter("translate")("DESCRIPTION")
                },
                {
                    name: "ERPID",
                    width: "15%",
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                    displayName: $filter("translate")("ERPID")
                },
                {
                    name: "DepartmentName",
                    width: "15%",
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                    cellTemplate: $scope.departmentTempalte,
                    displayName: $filter("translate")("DEPARTMENT")
                },
                {
                    name: "IsActive",
                    width: "10%",
                    displayName: $filter("translate")("IS_ACTIVE"),
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                    cellTemplate: $scope.checkBoxTemplate
                },
                {
                    name: "DisplayOrder",
                    width: "15%",
                    displayName: $filter("translate")("DISPLAY_ORDER"),
                    headerCellClass: "pull-left",
                    cellClass: "production-table-item",
                },
                // {
                //     name: "job",
                //     width: "10%",
                //     headerCellClass: "text-center",
                //     cellClass: "text-center",
                //     displayName: $filter("translate")("JOB")
                // },
                // {
                //     name: "approveFirstItem",
                //     width: "10%",
                //     headerCellClass: "text-center",
                //     cellClass: "text-center",
                //     displayName: $filter("translate")("APPROVE_FIRST_ITEM")
                // },
                // {
                //     name: "stop",
                //     headerCellClass: "text-center",
                //     cellClass: "text-center",
                //     displayName: $filter("translate")("STOP")
                // }
            ],
            showClearAllFilters: false,
            enableColumnResizing: true,
            enableRowSelection: true,
            enableGridMenu: true,
            enableSelectAll: true,
            exporterMenuPdf: true,
            exporterMenuCsv: false,
            multiSelect: true,
            exporterExcelFilename: "Sheet" + ".xlsx",
            exporterExcelSheetName: "Sheet",
            exporterCsvFilename: "Sheet" + ".csv",
            exporterPdfDefaultStyle: {fontSize: 7},
            exporterPdfTableStyle: {
                margin: [0, 0, 0, 0]
            },
            exporterPdfTableHeaderStyle: {fontSize: 8, bold: true, italics: true, color: "blue"},
            exporterPdfHeader: {
                text: "Sheet",
                style: "headerStyle",
                alignment: $scope.rtl === "rtl" ? "right" : "left",
                margin: [30, 10, 30, 2]
            },
            exporterPdfFooter: function (currentPage, pageCount) {
                return {
                    text: currentPage.toString() + " of " + pageCount.toString(),
                    style: "footerStyle",
                    margin: [30, 0, 30, 0]
                };
            },
            exporterPdfCustomFormatter: function (docDefinition) {
                docDefinition.styles.headerStyle = {
                    fontSize: 22,
                    bold: true,
                    alignment: $scope.rtl == "rtl" ? "right" : "left"
                };
                docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
                return docDefinition;
            },
            exporterFieldCallback: function (grid, row, col, input) {
                if (col.colDef.type == "date") {
                    return $filter("date")(input, " HH:mm:ss dd/MM/yyyy");
                } else {
                    return input;
                }
            },
            exporterPdfOrientation: "landscape",
            exporterPdfPageSize: "LETTER",
            exporterPdfMaxGridWidth: 580,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location"))
        };

        $scope.machinesLines = [];

        $scope.getProductionLines = function () {
            $scope.fetching = true;

            $scope.expandAll = function () {
                $scope.gridApi.treeBase.expandAllRows();
            };

            $scope.toggleRow = function (rowNum) {
                $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
            };

            LeaderMESservice.customAPI("GetLinesMachines", {}).then(function (response) {
                $scope.fetching = false;
                $scope.machinesLines = response.LinesMachines;
                $scope.departments.value = response.Departments;
                $scope.tableData = Array.from($scope.machinesLines, it => {
                    let department = $scope.departments.value.filter(item => item.Id === it.Key.Department);
                    if (department.length > 0) {
                        it.Key.DepartmentName = $scope.localLanguage ? department[0].LName : department[0].EName;
                        return it.Key
                    }else {
                        return undefined
                    }
                });
                $scope.tableData = $scope.tableData.filter(it=> it);
                $scope.gridOptions.data = $scope.tableData;
                $timeout(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 100);
            });
        };

        $scope.assignCurrentStep = function (step, pLine, isNewLine) {
            $scope.isNewProductionLine.value = isNewLine;
            if (isNewLine) {
                $scope.currentProductionLine.value = {
                    Key: {
                        Department: 0,
                        Description: "",
                        EName: "1",
                        ERPID: "",
                        FirstMachineID: 0,
                        ID: 0,
                        IsActive: true,
                        LName: "",
                        LastMachineID: 0,
                        MultiJobActivation: true,
                        MultiSetupEnd: true,
                        MultiUnitsInCycleChange: true,
                        RootEventAttachDurationMin: 0,
                        UpsertType: 2
                    },
                    Value: []
                };
            } else {
                $scope.currentProductionLine.value = $scope.machinesLines.filter(it => it.Key.ID === pLine.ID)[0] || {
                    Key: {},
                    Value: []
                };
            }
            $scope.currentStep.value = step;
        };


        $scope.$watch('refreshTable.value', function (newVal, oldVal) {
            if (newVal) {
                $scope.refreshTable.value = false;
                $scope.getProductionLines();
            }
        });

        $scope.getProductionLines();
    };

    return {
        transclude: true,
        restrict: "EA",
        templateUrl: template,
        scope: {
            currentProductionLine: "=",
            currentStep: "=",
            departments: "=",
            isNewProductionLine: "=",
            refreshTable: "=",
        },
        controller: controller,
        controllerAs: "productionLinesDefCtrl"
    };
}

angular.module("LeaderMESfe").directive("productionLinesDef", productionLinesDef);
