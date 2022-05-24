angular.module('LeaderMESfe')
    .factory('OnlineService', function ($sessionStorage, LeaderMESservice, $timeout ,$localStorage) {
        var rtl = LeaderMESservice.isLanguageRTL();
        var typeEnum = {
            ONLINE: 'online',
            SHIFT_PROGRESS: 'ShiftProgress',
        }
        var calculateByEnum = {
            currentJob: 'currentJob',
            shiftUnitTarget: 'shiftUnitTarget'
        };
        var cardPrefEnum = {
            [typeEnum.ONLINE]: "MCollapsedBox_",
            [typeEnum.SHIFT_PROGRESS]: "MProgressBox_",
        };
        var type = 'online';
        var newVersion = 3;
        //def values
        let HasPermissionDef = false;
        // let showPencilsDef = false;
        let darkModeDef = false;
        let showTextKeysDef = false;
        let aggregateProgressBarDef = false;
        let fullColorModeDef = false;
        let verticalDef = false;
        let departmentViewDef = false;
        let allMachinesFullScreen = false;
        let calculateByDef = calculateByEnum.currentJob;
        let shapeTypeDef = 1;
        let fontCustomization = {
            currentChoice:'defaultFontSize',
            value:null
        }
        let selectedScaleDef = {
            id: 1,
            name: "x2-rec",
            srcActive: "images/rec-on.png",
            srcInactive: "images/rec.png",
            src: "images/rec-on.png",
            scale: 1,
            clicked: true,
            size: "1.875vw",
            height: "560px",
            class: "medium-circle rec"
        };
        let colorModeDef = {
            id: 0,
            name: "white",
            colorCode: "#ffffff",
            textColor: "#000000",
            clicked: true,
            size: "3.125vw",
            class: ""
        };
        var percentageColors = [
                    {
                      parameterID: 1,
                      name: "moreThan",
                      text: "PERFORMED_MORE_THAN",
                      color: "#1cb919",
                      value: 100,
                      min: 80,
                      showEditable: true,
                    },
                    {
                      parameterID: 2,
                      name: "LessThen",
                      text: "PERFORMED_LESS_THAN",
                      color: "#e01521",
                      value: 80,
                      min: 0,
                      max: 100,
                      showEditable: true,
                    },
                    {
                      parameterID: 3,
                      name: "else",
                      text: "ELSE",
                      color: "#ecd21e",
                      value: 80,
                      showEditable: false,
                    },
                  ];




        //settings
        var machineOnlineSettings = {
            HasPermission: HasPermissionDef,
            darkMode: darkModeDef,
            showTextKeys: showTextKeysDef,
            aggregateProgressBar: aggregateProgressBarDef,
            fullColorMode: fullColorModeDef,
            vertical: verticalDef,
            departmentView: departmentViewDef,
            calculateBy: calculateByDef,
            shapeType: shapeTypeDef,
            selectedScale: selectedScaleDef,
            colorMode: colorModeDef,
            percentageColors: percentageColors,
            allMachinesFullScreen:allMachinesFullScreen,
            standard:false,
            fontCustomization:fontCustomization
        };

        if(!$localStorage.onlineServiceVersion)
        {
            $localStorage.onlineServiceVersion = {
                online : 0,
                shift:0,
                target:0,
                ShiftProgress:0,
                department:0
            }
        }

        var linesList = [];
        var drawingLinesEnabled = {value: true};
        var drawingFlag = false;
        var drawTimeout = {

        };
        var drawProductionLines = (departmentMachines, cardPrefID, depName, tapName, vertical) => {
            if (drawTimeout[depName]) {
                $timeout.cancel(drawTimeout[depName]);
                drawTimeout[depName] = null;
            }

            drawTimeout[depName] = $timeout(() => {
                drawProductionLinesLocal(departmentMachines, cardPrefID, depName, tapName, vertical);
            },300);
        }

        var drawProductionLinesLocal = function (departmentMachines, cardPrefID, depName, tapName, vertical) {
            var rtl = LeaderMESservice.isLanguageRTL();
            if(drawingFlag || !drawingLinesEnabled.value){
                return;
            }
            if (["online", "ShiftProgress"].indexOf(tapName) < 0) {
                return
            }
            if (linesList[depName]) {
                 deleteProductionLines(depName);
            }
            linesList[depName] = [];
                let departmentDisplayMap = Object.assign({}, ...departmentMachines.map(item => ({[item.MachineID]: item.display})));
                departmentMachines
                    .filter(machine => machine.display && machine.NextLineMachineID > 0 && departmentDisplayMap[machine.NextLineMachineID])
                    .filter(machine => machine.NextLineMachineID > 0)
                    .map(it => {
                        return {
                            ID: it.MachineID,
                            Next: it.NextLineMachineID
                        }
                    })
                    .filter(it => it.ID > 0 && it.Next > 0)
                    .forEach(element => {
                        let currElement = document.getElementById(cardPrefID + element.ID);
                        let nextElement = document.getElementById(cardPrefID + element.Next);
                        if (currElement && nextElement) {
                            if (vertical) {
                                const line = new LeaderLine(currElement, nextElement, {
                                    dash: false,
                                    size: 2,
                                    path: 'grid',
                                    color: 'black',
                                    endPlug: 'behind',
                                    startSocket: 'bottom',
                                    endSocket: 'top',
                                    outline: true,
                                    startSocketGravity: 0,
                                    endSocketGravity: 0,
                                });
                                linesList[depName].push(line);
                                return;
                            }
                            let currElementConnector = currElement.getElementsByClassName('end-connector');
                            let nextElementConnector = nextElement.getElementsByClassName('start-connector');
                            if (currElement && nextElement) {
                                if (currElementConnector && currElementConnector [0] && nextElementConnector && nextElementConnector[0]) {
                                    let line1 = new LeaderLine(currElement, currElementConnector[0], {
                                        dash: false,
                                        size: 2,
                                        path: 'grid',
                                        color: 'black',
                                        endPlug: 'behind',
                                        startSocket: 'top',
                                        endSocket: rtl ? 'right' : 'left',
                                        outline: true,
                                        startSocketGravity: 0,
                                        endSocketGravity: 0,
                                    });
                                    let line2 = new LeaderLine(nextElementConnector[0], nextElement, {
                                        dash: false,
                                        size: 2,
                                        path: 'grid',
                                        color: 'black',
                                        endPlug: 'behind',
                                        startSocket: rtl ? 'left' : 'right',
                                        endSocket: 'top',
                                        outline: true,
                                        startSocketGravity: 0,
                                        endSocketGravity: 0,
                                    });
                                    linesList[depName].push(line1, line2);
                                } else {
                                    var rightDir = currElement.getBoundingClientRect().left <
                                        nextElement.getBoundingClientRect().left;
                                    let line = new LeaderLine(currElement, nextElement, {
                                        dash: false,
                                        size: 2,
                                        path: 'grid',
                                        color: 'black',
                                        endPlug: 'behind',
                                        startSocket: 'top',
                                        endSocket: rightDir ? 'top' : 'left',
                                        startSocketGravity: 12,
                                        endSocketGravity: 12,
                                    });
                                    line.outline = true;
                                    linesList[depName].push(line);
                                }
                            }
                        }

                    })
                drawingFlag = false;
        }

        var deleteProductionLines = function (depName) {
            if (depName && depName !== 'allMachines') {
                if (drawTimeout[depName]) {
                    $timeout.cancel(drawTimeout[depName]);
                    drawTimeout[depName] = null;
                }
                if (linesList[depName]){
                    linesList[depName].forEach(item => {
                        item.remove();
                    })
                }
                linesList[depName] = [];
            } else {
                Object.keys(linesList).forEach(function (item) {
                    if (linesList[item]){
                        linesList[item].forEach(item => {
                            item.remove();
                        });
                    }   
                    linesList[item] = [];
                });
            }
        }

        var getJobDefinitions = function () {
            LeaderMESservice.customAPI('GetJobDefinitions', {})
            .then(function (response) {                                
                $sessionStorage.jobDefinitions = response.JobDefinitions;
            });        
          };          

        return {
            machineOnlineSettings: machineOnlineSettings,
            calculateByEnum: calculateByEnum,
            drawProductionLines: drawProductionLines,
            deleteProductionLines: deleteProductionLines,
            drawingLinesEnabled: drawingLinesEnabled,
            cardPrefEnum: cardPrefEnum,
            typeEnum: typeEnum,
            getJobDefinitions:getJobDefinitions,
            newVersion:newVersion
        }
    });