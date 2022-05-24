function qcTests() {
  var template = "js/components/QCDefinition/qcTests/qcTests.html";
  var controller = function (
    $scope,
    $rootScope,
    LeaderMESservice,
    $localStorage,
    $timeout,
    $filter,
    SweetAlert,
    googleAnalyticsService,
    toastr
  ) {
    var qcTestsCtrl = this;
    $rootScope.$broadcast('showOnTab', 0);
    $scope.tests = [];
    $scope.rtl = LeaderMESservice.isLanguageRTL();
    $scope.direction = $scope.rtl ? "rtl" : "ltr";
    $scope.uniq = Date.now();
    $scope.firstTimeTemp = true;
    $scope.view = $localStorage.QCView || "grid";
    $scope.sortBy = $localStorage.sortQCTestsBy || "id";
    $scope.filterBy = "all";

    $scope.saveTest = function (id, isActive) {
      LeaderMESservice.customAPI("SaveTestDefinitions", {
        Tests: [
          {
            key: id,
            value: !isActive,
          },
        ],
      }).then(function () { });
    };

    $scope.getTestsDefinition = function () {
      // $scope.fetching = true;

      $scope.checkBoxTemplate = '<div check-box-directive ng-click="grid.appScope.saveTest(row.entity.id,!row.entity.isactive)" field="row.entity" select-value="\'isactive\'"></div>';

      $scope.indexTempalte =
        '<div style="width: 100%;height: 100%" ng-click="grid.appScope.assignCurrentStep(\'add-qc-tests\', row.entity)"><div class="full-height d-flex justify-content-center align-items-center"><a>{{row.entity.id}}</a></div></div>';

      $scope.expandAll = function () {
        $scope.gridApi.treeBase.expandAllRows();
      };

      $scope.toggleRow = function (rowNum) {
        $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
      };

      LeaderMESservice.customAPI("GetTestsDefinitions", {}).then(function (e) {


        (e.ResponseList || []).map(function (item) {
          item.isdraftmode = item.isdraftmode === true ? 'Draft Mode' : 'Release Mode';
        });


        $scope.tests = e.ResponseList || [];

        $localStorage.testsData = $scope.tests;
        console.log($scope.tests)
        $scope.gridOptions = {
          enableFiltering: true,
          showColumnFooter: true,
          showGridFooter: true,
          fastWatch: true,
          columnDefs: [
            {
              name: "id",
              width: "10%",
              headerCellClass: "text-center",
              extraStyle: "padding=10px",
              cellTemplate: $scope.indexTempalte,
              cellClass: "text-center",
              displayName: $filter("translate")("INDEX"),
            },
            {
              name: "subtypename",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("TEST_NAME"),
            },
            {
              name: "testtypename",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("TEST_TYPE"),
            },
            {
              name: "isdraftmode",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("TEST_MODE"),
            },
            {
              name: "machinetypename",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("MACHINE_TYPE"),
            },
            {
              name: "productname",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("PRODUCT"),
            },
            {
              name: "lastupdate",
              width: "20%",
              headerCellClass: "text-center",
              cellClass: "text-center",
              displayName: $filter("translate")("LAST_UPDATE"),
              cellFilter: "date:'dd/MM/yyyy HH:mm'",
            },
            {
              name: "isactive",
              width: "20%",
              displayName: $filter("translate")("ACTIVE_TEST"),
              headerCellClass: "text-center",
              cellClass: "text-center",
              cellTemplate: $scope.checkBoxTemplate,
            },
            {
              name: "qualitytestgroupname",
              width: "20%",
              displayName: $filter("translate")("QUALITY_TEST_GROUP_NAME"),
              headerCellClass: "text-center",
              cellClass: "text-center",
            },
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
          exporterPdfDefaultStyle: { fontSize: 7 },
          exporterPdfTableStyle: {
            margin: [0, 0, 0, 0],
          },
          exporterPdfTableHeaderStyle: { fontSize: 8, bold: true, italics: true, color: "blue" },
          exporterPdfHeader: {
            text: "Sheet",
            style: "headerStyle",
            alignment: $scope.rtl === "rtl" ? "right" : "left",
            margin: [30, 10, 30, 2],
          },
          exporterPdfFooter: function (currentPage, pageCount) {
            return {
              text: currentPage.toString() + " of " + pageCount.toString(),
              style: "footerStyle",
              margin: [30, 0, 30, 0],
            };
          },
          exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
              fontSize: 22,
              bold: true,
              alignment: $scope.rtl == "rtl" ? "right" : "left",
            };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
          },
          exporterFieldCallback: function (grid, row, col, input) {
            if (col.colDef.type == "date") {
              return $filter("date")(input, " HH:mm:ss dd/MM/yyyy");
            } else {
              return input;
            }
          },
          onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            $scope.gridApi.colMovable.on.columnPositionChanged($scope, saveState);
            $scope.gridApi.colResizable.on.columnSizeChanged($scope, saveState);
            $scope.gridApi.core.on.columnVisibilityChanged($scope, saveState);
            $scope.gridApi.core.on.filterChanged($scope, saveState);
            $scope.gridApi.core.on.sortChanged($scope, saveState);
            restoreState();
          },
          exporterPdfOrientation: "landscape",
          exporterPdfPageSize: "LETTER",
          exporterPdfMaxGridWidth: 580,
          exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        };

        // $scope.gridOptions.appScopeProvider = $scope;
        $scope.gridOptions.data = $scope.tests;

        function saveState() {

          var state = $scope.gridApi.saveState.save();
          //save the state in localStorage
          if (!$localStorage.qcTestGridTable) {
            $localStorage.qcTestGridTable = {}
          }
          $localStorage.qcTestGridTable = state;
        }

        function restoreState() {

          $timeout(function () {
            if ($localStorage.qcTestGridTable) {
              state = $localStorage.qcTestGridTable;
            }
            $scope.gridApi.saveState.restore($scope, state);
          })
        }

        $scope.fetching = false;
        $timeout(function () {
          $('[data-toggle="tooltip"]').tooltip();
        }, 100);
      });
    };

    $scope.updateQCView = function (view) {
      $scope.view = view;
      $localStorage.QCView = view;
    };

    $scope.updateSortBy = function (filterBy) {       
      if(filterBy==="isactive")
      $scope.gridOptions.data=$scope.tests.filter(x => x.isactive === true);       
     else
     $scope.gridOptions.data=$filter('orderBy')($scope.tests , filterBy, true); 

     $localStorage.sortQCTestsBy = sortBy; 
      googleAnalyticsService.gaEvent("QC_Module", "sortBy_" + sortBy);
       
    };
    
  

    $scope.QCFilter = function (sortBy) {      
      const TestData = $localStorage.testsData;
      if (sortBy === "active"){
        $scope.tests = TestData.filter(x => x.isactive === true); 
        $scope.gridOptions.data = $scope.tests;
      }     
      else if (sortBy === "inactive") {
        $scope.tests = TestData.filter(x => x.isactive === false);      
        $scope.gridOptions.data = $scope.tests;
      }      
      else{
        $scope.tests = TestData;
        $scope.gridOptions.data = $scope.tests;
      }      
    };


    $scope.activeCopyTag = '';
    $scope.actionCopyTag = function (id) {
      if ($scope.activeCopyTag === id) {
        $scope.activeCopyTag = null;
      } else {
        $scope.activeCopyTag = id;
      }
    }

    $scope.getTestsDefinition();

    $scope.assignCurrentStep = function (step, test) {
      $scope.step = step
      $scope.currentTest = test;
      googleAnalyticsService.gaEvent("QC_Module", "step_" + step);
    };

    $scope.copyTest = function (test) {
      LeaderMESservice.customAPI("CopyTestDefinition", { SubType: test.id }).then(function (e) {
        $scope.getTestsDefinition();
      })
    }
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
              if (e.FunctionSucceed) {
                toastr.clear();
                toastr.success("", $filter('translate')('RELEASE_TEST_SUCCESSFULLY'));
                $scope.getTestsDefinition();
              }
              else {
                toastr.clear();
                toastr.error("", $filter('translate')('RELEASE_TEST_SUCCESSFULLY'));
              }
            })
          }
          else {

            actionItem.disabled = false;
          }
        });
    }
  };

  return {
    require: "^qcDefinition",
    restrict: "E",
    templateUrl: template,
    scope: {
      currentTest: "=",
    },
    link: function (scope, element, attrs, qcDefinitionCtrl) {
      /**
       * trigger function 'assignCurrentStep' in parent directive
       */
      scope.assignCurrentStep = function (step, test) {
        qcDefinitionCtrl.assignCurrentStep(step, test);
      };
    },
    controller: controller,
    controllerAs: "qcTestsCtrl",
  };
}

angular.module("LeaderMESfe").directive("qcTests", qcTests);
