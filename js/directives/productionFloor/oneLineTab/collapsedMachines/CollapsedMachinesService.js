angular.module("LeaderMESfe").factory("CollapsedMachinesService", function ($sessionStorage, LeaderMESservice, $filter) {
  var rtl = LeaderMESservice.isLanguageRTL();
  var cardPrefEnum = {
    online: "MCollapsedBox_",
    ShiftProgress: "MProgressBox_",
  };

  //settings

  /**
   * Initial Check
   * Checks if initial session storage was empty, then, create new session object for Exapnded Machines
   */
  if (!$sessionStorage.machinesCollapsedData) {
    $sessionStorage.machinesCollapsedData = [];
  }

  /**
   * Initial structure for array of params
   */
  var initialStructure = [
    {
      FieldName: "TotalCycles",
    },
    {
      FieldName: "ProductName",
      selected: true,
    },
    {
      FieldName: "TotalCycles",
    },
    {
      FieldName: "ProductName",
    },
    {
      FieldName: "ProductName",
    },
    {
      FieldName: "ProductName",
    },
    {
      FieldName: "ProductEName", FieldEName: "PRODUCT_NAME"
    }
  ];


  var productMenuList = [
    { FieldName: "removeParam", FieldEName: "REMOVE_PARAM" },
    { FieldName: "ProductEName", FieldEName: "PRODUCT_NAME", selected: true },
    { FieldName: "ProductCatalogID", FieldEName: "PRODUCT_CATALOG_ID" },
    { FieldName: "ErpJobID", FieldEName: "ERP_JOB_ID" },
    { FieldName: "ClientEName", FieldEName: "CUSTOMER"},
  ];

  var barMenuList = [
    { FieldName: "removeParam", FieldEName: "REMOVE_PARAM" },
    { FieldName: "percentageBar", FieldEName: "PERCENTAGE_BAR", selected: true },
    { FieldName: "progressBar", FieldEName: "PROGRESS_BAR" },
  ];

  var TheoreticalMenuList = [
    { FieldName: "removeParam", FieldEName: "REMOVE_PARAM" },
    { FieldName: "UnitsProducedTheoreticallyShift", FieldEName: "THEORETICALLY_SHIFT", selected: true },
    { FieldName: "UnitsProducedTheoreticallyEndShift", FieldEName: "THEORETICALLY_END_SHIFT" },
  ];

  var machineEditParams = {
    productMenuList: productMenuList,
    barMenuList: barMenuList,
    TheoreticalMenuList: TheoreticalMenuList,
  };
  var getInitialStructure = function () {
    return angular.copy(initialStructure);
  };

  /**
   * Get expanded machine data by machine id
   * @param machineId - machine id
   */
  var getDataByMachineId = function (machineId, typeID) {
    var machineObject = _.find($sessionStorage.machinesCollapsedData, { id: machineId });
    if (machineObject) {
      if (!machineObject.typeID) {
        machineObject.typeID = typeID;
      }
      return machineObject.data;
    }
    var newItem = {
      id: machineId,
      typeID: typeID,
      data: angular.copy(initialStructure),
    };
    $sessionStorage.machinesCollapsedData.push(newItem);
    return newItem.data;
  };

  /**
   * Callback of updating one of the array of machinebox params
   * @param {*} machineId - machine id
   * @param {*} param - new updated param
   * @param {*} applyAll - if apply all is true, update should apply to all machine boxes in the view
   * @param {*} index - index of the updated param in the array of params
   */
  var updateParam = function (machineId, param, applyAll, index, machineType) {
    var machineObject = _.find($sessionStorage.machinesCollapsedData, { id: machineId });
    if (applyAll) {
      $sessionStorage.machinesCollapsedData.forEach(function (machineObject) {
        if (machineType == machineObject.typeID) {
          machineObject.data[index].FieldName = param.FieldName;
        }
      });
    } else if (index >= 0 && machineObject) {
      machineObject.data[index].FieldName = param.FieldName;
    }
  };

  var resetStructure = function () {
    for (var i = 0; i < $sessionStorage.machinesCollapsedData.length; i++) {
      $sessionStorage.machinesCollapsedData[i].data.splice(0, $sessionStorage.machinesCollapsedData[i].data.length);
      for (var j = 0; j < initialStructure.length; j++) {
        $sessionStorage.machinesCollapsedData[i].data.push(angular.copy(initialStructure[j]));
      }
    }
  };



  return {
    getDataByMachineId: getDataByMachineId,
    updateParam: updateParam,
    resetStructure: resetStructure,
    getInitialStructure: getInitialStructure,
    machineEditParams: machineEditParams,
  };
});
