angular.module('LeaderMESfe').factory('machineStatusService', function ($sessionStorage) {

    /**
     * Initial Check
     * Checks if initial session storage was empty, then, create new session object for Machines
     */
    if (!$sessionStorage.machineStatus) {
        $sessionStorage.machineStatus = [];
    }

    /**
     * Initial structure for array of params
     */
    var initialStructure = {
        progressData: [
            {
                FieldName : 'TotalCycles'
            },
            {
                FieldName : 'ProductName'
            }
        ],
        gridData: [
            {
                FieldName : 'TotalCycles'
            },
            {
                FieldName : 'ProductName'
            }
        ]
    };

    /**
     * Get machine data for grid by machine id
     * @param machineId - machine id
     */
    var getDataByMachineId = function(machineId, typeID) {
        var machineObject =_.find($sessionStorage.machineStatus, {id: machineId});
        if (machineObject)  {
            if (!machineObject.typeID){
                machineObject.typeID = typeID
            }
            return machineObject.data;
        }
        var newItem = {
            id : machineId,
            typeID : typeID,
            data : angular.copy(initialStructure)
        }
        $sessionStorage.machineStatus.push(newItem);
        return newItem.data;
    }

    /**
     * Callback of updating one of the array of machinebox params
     * @param {*} machineId - machine id
     * @param {*} param - new updated param
     * @param {*} paramType - type of param
     * @param {*} index - index of the updated param in the array of params
     */
    var updateParam = function(machineId, param, paramType, index, machineType) {
        var machineObject =_.find($sessionStorage.machineStatus, {id: machineId});
        if (index >= 0 && machineObject && paramType){
            machineObject.data[paramType][index].FieldName = param.FieldName;
        }
    }

    var resetStructure = function(){
        for (var  i = 0;i < $sessionStorage.machineStatus.length ; i++){
            $sessionStorage.machineStatus[i].data.sliderData.splice(0,$sessionStorage.machineStatus[i].data.sliderData.length);
            $sessionStorage.machineStatus[i].data.gridData.splice(0,$sessionStorage.machineStatus[i].data.gridData.length);
            for (var j = 0; j < initialStructure.length ; j++){
                $sessionStorage.machineStatus[i].data.push(angular.copy(initialStructure[j]));
            }
        };
    }


    return {
        getDataByMachineId: getDataByMachineId,
        updateParam: updateParam,
        resetStructure : resetStructure
    }
});