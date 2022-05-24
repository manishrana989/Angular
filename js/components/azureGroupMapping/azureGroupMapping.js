function azureGroupMapping() {
    var template = "js/components/azureGroupMapping/azureGroupMapping.html";
  
    var controller = function ($scope, LeaderMESservice, $filter, notify) {
        var azureGroupMappingCtrl = this;
        azureGroupMappingCtrl.rtl = LeaderMESservice.isLanguageRTL() ? 'rtl' : '';

        azureGroupMappingCtrl.saveGroups = function(){
          var groups = _.map(azureGroupMappingCtrl.gridOptions.data,function(row){
            return {
              "LocalGroupID": row.LocalGroupID,
              "ClientGroupID": row.ClientGroupID,
              "Priority": row.Priority,
              "ID": row.ID || 0,
            }
          });
          const deletedRows = [];
          azureGroupMappingCtrl.originalData.forEach(groupMap => {
            if (_.findIndex(azureGroupMappingCtrl.gridOptions.data,{ID : groupMap.ID}) < 0) {
              deletedRows.push({ID: groupMap.ID});
            }
          });
          if (groups.length === 0 && deletedRows.length === 0){
            return;
          }
          const promises = [];
          if (groups.length > 0){
            promises.push(LeaderMESservice.customAPI('MapGroups',{
              groupMapping: groups
            }));
          }
          if (deletedRows.length > 0) {
            promises.push(LeaderMESservice.customAPI('DeleteMapGroup',{
              groupMapping: deletedRows
            }));
          }
          Promise.all(promises).then(responses => {
            responses.forEach(response => {
              if (response.error !== null) {
                notify({
                    message: response.error.ErrorCode + ' - ' + response.error.ErrorDescription,
                    classes: 'alert-danger',
                    templateUrl: 'views/common/notify.html'
                });
                return;
              } 
            });
            azureGroupMappingCtrl.getData();
          });
        };

        azureGroupMappingCtrl.localGroupCellTemplate = function(){
          return `
            <select style="width: 100%;min-width: 100px" 
            class="form-control" 
            ng-model="row.entity.LocalGroupID" 
            ng-options="option.key as option.value for option in grid.appScope.localGroups.Value" 
            ng-change="grid.appScope.valueChanged(row.entity.ID,'LocalGroupID')" 
            ng-required="true">
              <option value=""></option></select>`;
        };
        
        azureGroupMappingCtrl.clientGroupCellTemplate = function(){
          return `
            <select style="width: 100%;min-width: 100px" 
            class="form-control" 
            ng-model="row.entity.ClientGroupID" 
            ng-options="option.key as option.value for option in grid.appScope.clientGroups.Value" 
            ng-change="grid.appScope.valueChanged(row.entity.ID,'ClientGroupID')" 
            ng-required="true">
              <option value=""></option></select>`;
        };
        azureGroupMappingCtrl.priorityCellTemplate = function(){
          return `<input style="" type="number" 
            ng-change="grid.appScope.valueChanged(row.entity.Priority,'Priority')" 
            class="form-control" 
            ng-model="row.entity.Priority" ng-required="true">`;
        };

        azureGroupMappingCtrl.valueChanged = function(ID, field){ 
          console.log(ID);
          console.log(field);
        };       

        azureGroupMappingCtrl.removeRow = function () {
          var selectedRows = $scope.gridApi.selection.getSelectedRows(); 
          selectedRows.forEach(function(selectedRow) {
            var index = _.findIndex(azureGroupMappingCtrl.gridOptions.data,{$$hashKey : selectedRow['$$hashKey']});
            if (index >= 0){
              azureGroupMappingCtrl.gridOptions.data.splice(index, 1);
            }
          });
        };


        azureGroupMappingCtrl.addRow = function () {
            azureGroupMappingCtrl.gridOptions.data.splice(
              azureGroupMappingCtrl.gridOptions.data.length + 1 , 0,{
                Priority : null,
                ClientGroupID : null,
                LocalGroupID : null,
              });
        };

        azureGroupMappingCtrl.getData = function(){
          azureGroupMappingCtrl.isLoading = true;
          LeaderMESservice.customGetAPI('GetGroupsForMapping').then(function(response) {
            azureGroupMappingCtrl.gridOptions.data = response.ActiveMapping || [];
            azureGroupMappingCtrl.originalData = angular.copy(azureGroupMappingCtrl.gridOptions.data);
            azureGroupMappingCtrl.localGroups = _.find(response.Groups,{Key : 'LocalGroups'});
            azureGroupMappingCtrl.clientGroups = _.find(response.Groups,{Key : 'ClientGroups'});
            azureGroupMappingCtrl.gridOptions.columnDefs = [
              // {
              //   name: 'ID',
              //   displayName: $filter('translate')('ID'),
              //   field: 'ID',
              //   cellClass: 'multiFormCell',
              // },
              {
                name: 'LocalGroupID',
                displayName: $filter('translate')('LOCAL_GROUP_ID'),
                field: 'LocalGroupID',
                cellClass: 'multiFormCell',
                cellTemplate : azureGroupMappingCtrl.localGroupCellTemplate(),
                type: 'select',
                enableHiding: false
              },
              {
                name: 'ClientGroupID',
                displayName: $filter('translate')('CLIENT_GROUP_ID'),
                field: 'ClientGroupID',
                cellClass: 'multiFormCell',
                cellTemplate : azureGroupMappingCtrl.clientGroupCellTemplate(),
                type: 'select',
                enableHiding: false
              },
              {
                name: 'Priority',
                displayName: $filter('translate')('PRIORITY'),
                field: 'Priority',
                cellClass: 'multiFormCell',
                cellTemplate : azureGroupMappingCtrl.priorityCellTemplate(),
                type: 'select',
                enableHiding: false
              }
            ]
            azureGroupMappingCtrl.isLoading = false;
          });
          
        };
        azureGroupMappingCtrl.gridOptions = {
          appScopeProvider : azureGroupMappingCtrl,
          enableFiltering: true,
          showGridFooter: true,
          columnDefs: [],
          enableHiding : false,
          enableColumnResizing: true,
          enableRowSelection: true,
          showClearAllFilters : true,
          enableGridMenu: false,
          enableSelectAll: true,
          exporterMenuPdf: true,
          exporterMenuCsv: false,
          exporterExcelFilename: 'excel.xlsx',
          exporterExcelSheetName: 'Sheet1',
          exporterCsvFilename:  'file.csv',
          exporterPdfDefaultStyle: {fontSize: 7},
          exporterPdfTableStyle: {
              margin: [0, 0, 0, 0]
          },
          exporterPdfTableHeaderStyle: {fontSize: 8, bold: true, italics: true, color: 'blue'},
          onRegisterApi: function (gridApi) {
              $scope.gridApi = gridApi;
          }
      };
      azureGroupMappingCtrl.getData();
    };
  
    return {
      restrict: "EA",
      templateUrl: template,
      scope: {
        close: "=",
      },
      controller: controller,
      controllerAs: "azureGroupMappingCtrl",
    };
  }
  
  angular.module("LeaderMESfe").directive("azureGroupMapping", azureGroupMapping);
  