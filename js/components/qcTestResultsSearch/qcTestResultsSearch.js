function qcTestResultsSearch() {
  const template = "js/components/qcTestResultsSearch/qcTestResultsSearch.html";

  const controller = function ($scope, LeaderMESservice, $timeout, $element, $modal,$state, $location) {
    const upperScope = $scope;
    var qcTestResultsCtrl = this;
    qcTestResultsCtrl.localLanguage = LeaderMESservice.showLocalLanguage();
    qcTestResultsCtrl.title = qcTestResultsCtrl.localLanguage ? $scope.content.subMenu.SubMenuLName : $scope.content.subMenu.SubMenuEName;
    $scope.requiredFields = ["Products", "SubType","Material"];
    /**
     * Will hold the Full response data
     * @type {Array}
     */
    $scope.responseData = [];

    /**
     * Will hold body request for POST action when user click on search
     * @type {number}
     */
    $scope.content.request.sfCriteria = null;
    /**
         * Last Refresh Date'<span><i class="fa fa-check" ng-if="COL_FIELD" style="color: green" aria-hidden="true"></i>' +
         '<i class="fa fa-times" style="color: red" ng-if="!COL_FIELD" aria-hidden="true"></i></span>'
         * @type {number}
         */
    $scope.lastRefresh = Date.now();

    /**
     * Select options for Tests
     * @type {Array}
     */
    $scope.testsToSelect = [];

    /**
     * Will hold selected test
     * @type {{}}
     */
    $scope.selectedTest = null;

    /**
     * Will hold selected product
     * @type {{}}
     */
    $scope.selectedProduct = null;

    /**
     * Will hold start date
     * @type {Object}
     */
    qcTestResultsCtrl.startDate = {};

    /**
     * Will hold end date
     * @type {Object}
     */
    qcTestResultsCtrl.endDate = {};



    qcTestResultsCtrl.showValueName = {
      product:false,
      subType:false,
      machineName:false,
      jobs:false
    }

    /**
     * Update Test Select Options according to selected product
     * @param selectedProduct: selected product in Product Selection
     */
    
    $scope.updateTestsSelection = function (selectedProduct) {
      if (!selectedProduct) {
        $scope.selectedTest = null;
        return;
      }
      if (!$scope.responseData.ObjectList) {
        return;
      }

      let found = _.find($scope.responseData.ObjectList, { ID: selectedProduct.ID });

      $scope.testsToSelect = found? found.SubItems || [] : [];
    };
    LeaderMESservice.customAPI("GetTestTypes").then(function (response) {
      qcTestResultsCtrl.groups = response.ResponseList;
      $scope.updateDataNewScreen()
    });
    /**
     * Get Data for filling Inputs in search section from server
     */
    $scope.getSearchInputsFromServer = function () {
      LeaderMESservice.customAPI("GetTestSearch",{TestType:qcTestResultsCtrl.selectedGroup.ID}).then(function (res) {
        $scope.responseData = res;
        $scope.searchFields = res.ResponseList;
        const queryString = $location.search();
        $scope.qualityTest = _.find($scope.searchFields, { DisplayName: "Quality Test" });
        $scope.product = _.find($scope.searchFields, { DisplayName: "Product" });
        if (queryString && (queryString.productId || queryString.materialId) && queryString.testId){
          const productField = _.find($scope.searchFields,{FilterName : "ProductID"});
          const materialField = _.find($scope.searchFields,{FilterName : "MaterialID"});
          const testField = _.find($scope.searchFields,{FilterName : "SubType"});
          const startDate = queryString && queryString.startDate && moment(queryString.startDate);
          const endDate = queryString && queryString.endDate && moment(queryString.endDate);
          const machineField = _.find($scope.searchFields,{FilterName : "MachineID"});
          if(startDate != "")
          {
            var timezoneHours = startDate.hours();
            startDate.hours(0);
          }
          if(endDate != "")
          {
            endDate.subtract(timezoneHours,'hours');
          }
          if ((productField || materialField || machineField) && testField) {
            if (machineField && queryString.machineId) {
              machineField.value = parseInt(queryString.machineId);
              machineField.valueName = queryString.machineName;
            }
            if(materialField)
            {
              materialField.value = queryString.materialId;
            }
            else
            {
              productField.value = queryString.productId;
              productField.valueName = queryString.productName;
            }
            testField.value = queryString.testId;
            testField.valueName = queryString.testName;
            qcTestResultsCtrl.startDate = {
              value: startDate,
            }
            qcTestResultsCtrl.endDate = {
              value: endDate,
            }
            $scope.search(true);
          }
        }
      });
    };

    /**
     * Init QC Test Results Search directive
     */
    $scope.init = function () {      
      $scope.getSearchInputsFromServer();
    };

    $scope.search = function (dashboard) {
      let bodyReq = {
        StartTime: qcTestResultsCtrl.startDate.value,
        EndTime: qcTestResultsCtrl.endDate.value,
      };
      $scope.searchFields.forEach(function (searchField) {
        if (searchField.value) {
          bodyReq[searchField.FilterName] = searchField.value;
        }
      });
      $scope.content.request.sfCriteria = null;
      $timeout(function () {
        $scope.lastRefresh = Date.now();
        $scope.content.request.sfCriteria = bodyReq;
        if (dashboard) {
          $scope.content.openDashboard = true;
        }
        upperScope.hasSearch = true;
        upperScope.showSearch = false;
      }, 100);
    };

    $scope.initSearch = function () {
      $element.children().find(".search-submit-button").click();
    };

    $scope.clearField = function (searchField) {
      var jobSearchField = _.find($scope.searchFields, { Name: "Job" });
      var machineSearchField = _.find($scope.searchFields, { Name: "Machine" });
      if (searchField.Name === "Products") {
        if (jobSearchField) {
          jobSearchField.value = null;
          jobSearchField.valueName = null;
        }
        if (machineSearchField) {
          machineSearchField.value = null;
          machineSearchField.valueName = null;
        }
      }
      if (searchField.Name === "Job" && machineSearchField) {
        machineSearchField.value = null;
        machineSearchField.valueName = null;
      }
      searchField.value = null;
      searchField.valueName = null;
    };

    $scope.updateData = function()
    {
      $scope.init();
    }
    $scope.updateDataNewScreen = function(){
      const queryString = $location.search();
      if (queryString && (queryString.productId ||queryString.materialId)  && queryString.testId && queryString.SubTestFormID){
        qcTestResultsCtrl.selectedGroup =  _.find(qcTestResultsCtrl.groups,{SubTestFormID:+queryString.SubTestFormID})
        $scope.init();
      }
    }

    $scope.searchForData = function (searchField) {      
      var searchFields = $scope.searchFields;
      var qualityTest = $scope.qualityTest;
      var modalInstance = $modal.open({
        // templateUrl: "js/components/qcTestResultsSearch/TemporaryModalQcSearch.html",
        templateUrl:"views/common/mainContentTemplate.html",
        controller: function ($scope, $compile, $modalInstance, commonFunctions) {
          $scope.reportID = searchField.ReportID;
          $scope.pageDisplay = 0;
          $scope.returnValue = true;
          $scope.onlyNewTab = true;
          $scope.disableLinks = true;
          $scope.qcTestResultSearch = true;
          $scope.modal = true;
          $scope.qualityTest=qualityTest;
          $scope.selectedGroup = qcTestResultsCtrl.selectedGroup;
          $scope.showBreadCrumb = false;
          $scope.multiSelect = ["Products", "SubType","Material","Machine","Batches"].indexOf(searchField.Name) < 0;
          $scope.hideCriteria = true;
          $scope.searchInMultiForm = true;
          $scope.sfCriteria = searchField.sfCriteria || [];
          $scope.chosenIds = [];
          $scope.rtl = LeaderMESservice.isLanguageRTL() ? "rtl" : "";
          $scope.searchFieldsTemp = searchFields
          commonFunctions.commonCodeSearch($scope);
          $scope.getDisplayReportSearchFields(qcTestResultsCtrl.selectedGroup.ID);


          // var searchResultsRequest = {
          //   data: {
          //     functionCallBack: "$parent.$parent.rowClicked",
          //     onlyNewTab: false,
          //     ID: $scope.formId,
          //     newTabState: $scope.mainPageState,
          //     returnValue: $scope.returnValue || false,
          //     disableLinks: $scope.disableLinks || false,
          //     openSearchInNewTab: false,
          //     reportID: $scope.reportID,
          //     reportTitle: $scope.topPageTitle.title,
          //     multiSelect: $scope.multiSelect,
          //     AppPartId: ($scope.content && $scope.content.SubMenuAppPartID) || 0,
          //     chosenIds: $scope.chosenIds || [],
          //     showApply: $scope.returnValue || $scope.showApply || false,
          //     hasProductGroup: $scope.hasProductGroup
          //   },
          // };
          // var productID = _.find($scope.searchFieldsTemp, { ID: 1 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 1 })?.value] : []
          // var jobIDs = _.find($scope.searchFieldsTemp, { ID: 2 })?.value || []
          // var machineIDs = _.find($scope.searchFieldsTemp, { ID: 3 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 3 })?.value] : []
          // var subTypeIDs = _.find($scope.searchFieldsTemp, { ID: 4 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 4 }).value] : []
          // var materialID = _.find($scope.searchFieldsTemp, { ID: 5 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 5 })?.value] : []
          // var subTypeIDsMatrial = _.find($scope.searchFieldsTemp, { ID: 6 })?.value ? [_.find($scope.searchFieldsTemp, { ID: 6 }).value] : []

          // searchResultsRequest.request = {
          //   JobIDs: jobIDs,
          //   MachineIDs: machineIDs,
          //   SubTypes: subTypeIDs,
          //   TestType: $scope.selectedGroup?.ID,
          //   sfCriteria: $scope.sfCriteria,
          // };
          // searchResultsRequest.api = "QCGetProductsForReport";

          // $scope.content = searchResultsRequest;

          $scope.ok = function () {
            $modalInstance.close();
          };
          $scope.rowClicked = function (IDs, dummy, dummy, item) {
            if (!IDs) {
              $modalInstance.close();
              return;
            }
            var jobSearchField = _.find(searchFields, { Name: "Job" });
            var qualitySearchField = _.find(searchFields, { Name: "SubType" });
            var machineSearchField = _.find(searchFields, { Name: "Machine" });
            searchField.value = IDs;
            searchField.itemName = searchField.Name;
            qcTestResultsCtrl.showValueName = false;
            searchField.valueName =  searchField.value
            if(item && item.api == "QCGetProductsForReport")
            {
              qcTestResultsCtrl.showValueName = true;
              searchField.valueName =  item.ProductIDIndexName;
            }

            if(item && item.length > 0 && item[0].api == "QCGetJobsForReport")
            {
              qcTestResultsCtrl.showValueName = true;              
              searchField.valueName =  _.map(item,function(temp){
                return temp.ERPJobID
              }).join();
            } 
            
            
            if(item && item.api == "QCGetSubTypesForReport")
            {
              qcTestResultsCtrl.showValueName = true;
              searchField.valueName =  item.SubType;
            }
            if(item && item.api == "QCGetMachinesForReport")
            {
              qcTestResultsCtrl.showValueName = true;
              searchField.valueName =  item.MachineName;
            }
            
            
            if (searchField.Name === "Products") {
              searchField.itemName = LeaderMESservice.localLanguage ? item.ProductName : item.ProductEName;
              if (jobSearchField) {
                jobSearchField.sfCriteria = [
                  {
                    FieldName: "ProductID",
                    INclause: [searchField.value],
                    DataType: "num",
                  },
                ];
                jobSearchField.value = null;
              }

              if (qualitySearchField) {
                qualitySearchField.sfCriteria = [
                  {
                    FieldName: "ProductID",
                    INclause: [searchField.value],
                    DataType: "num",
                  },
                ];
                // qualitySearchField.value = null;
              }

              if (machineSearchField) {
                machineSearchField.value = null;
              }
            }else if (searchField.Name === "Material") {
              searchField.itemName = LeaderMESservice.localLanguage ? item.LName : item.EName;
              if (jobSearchField) {
                jobSearchField.sfCriteria = [
                  {
                    FieldName: "MaterialID",
                    INclause: [searchField.value],
                    DataType: "num",
                  },
                ];
                jobSearchField.value = null;
              }

              if (qualitySearchField) {
                qualitySearchField.sfCriteria = [
                  {
                    FieldName: "MaterialID",
                    INclause: [searchField.value],
                    DataType: "num",
                  },
                ];
                qualitySearchField.value = null;
              }

              if (machineSearchField) {
                machineSearchField.value = null;
              }
            } else if (searchField.Name === "Job" && machineSearchField) {
              machineSearchField.sfCriteria = [
                {
                  FieldName: "JobID",
                  INclause: searchField.value,
                  DataType: "num",
                },
              ];
              machineSearchField.value = null;
            } else if (searchField.Name === "SubType") {
              searchField.itemName = item.SubType;
            }
            $modalInstance.close();
          };
        },
      });
    };
   
  };

  return {
    restrict: "EA",
    templateUrl: template,
    scope: {
      content: "=",
      reportId: "=",
    },
    controller: controller,
    controllerAs: "qcTestResultsCtrl",
  };
}

angular.module("LeaderMESfe").directive("qcTestResultsSearch", qcTestResultsSearch);
